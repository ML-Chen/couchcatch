#!/usr/bin/env node
// Collects every Mandarin string the game may speak, so each can be recorded as ONE whole clip.
// Shared by tools/make_audio.py (what to synthesize) and tools/check_audio_coverage.js (what must exist).
//
//   node tools/zh_strings.js [gameRoot]   -> prints JSON [{text, key, src, tier}, ...]
//
// key  = ZH_AUDIO lookup key = text trimmed, with punctuation removed (see norm()).
// text = the string as written (punctuation kept, so the TTS gets the right intonation).
// tier = 'core' (vocab / phrases / names / dialogues) or 'template' (sentence templates x species/places);
//        templates are the first thing dropped when the audio file gets too big.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');

// Keep in sync with ZH_AUDIO_NORM written into zh_audio.js by make_audio.py.
const PUNCT = /[，。！？、…!?,.]/g;
const norm = s => String(s == null ? '' : s).trim().replace(PUNCT, '').trim();
const HAN = /[㐀-鿿]/;

const BASE_FILES = ['vocab.js', 'phrases.js', 'zh_names.js'];
// ...plus every dialogues*.js in the game root (dialogues.js, dialogues_a.js, dialogues_b.js, ...).
// every *dialogues*.js (dialogues.js, story_dialogues.js, ...) and the graded-reader texts
// places_*.js add place names to ZH_PLACES; *readings*.js are the graded readers (readings.js first: it creates READINGS)
const files = root => BASE_FILES.concat(fs.readdirSync(root).filter(f => /^places_.*\.js$/.test(f)).sort(), fs.readdirSync(root).filter(f => /dialogues.*\.js$/.test(f)).sort(),
  ['readings.js'].concat(fs.readdirSync(root).filter(f => /readings.*\.js$/.test(f) && f !== 'readings.js').sort()).filter(f => fs.existsSync(path.join(root, f))));

function loadGame(root) {
  const sb = { console: { log() {}, warn() {}, error() {} }, setTimeout() {}, document: undefined };
  sb.window = sb; sb.self = sb; sb.globalThis = sb;
  const ctx = vm.createContext(sb);
  const loaded = [], errors = [];
  for (const f of files(root)) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    try { vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f }); loaded.push(f); }
    catch (e) { errors.push(f + ': ' + e.message); }
  }
  const names = ['VOCAB', 'PHRASES', 'PHRASEBOOK', 'MOMENTS', 'ZH_SPECIES', 'ZH_TYPES', 'ZH_MOVES', 'ZH_ACTS', 'ZH_ITEMS', 'ZH_PLACES', 'DIALOGUES', 'READINGS'];
  const g = vm.runInContext('({' + names.map(n => `${n}:typeof ${n}!=='undefined'?${n}:(typeof window!=='undefined'?window.${n}:undefined)`).join(',') + '})', ctx);
  return { g, loaded, errors };
}

// Every value stored under a property called "zh" anywhere in a tree (npc / option / reply / end / title / who ...).
function zhValues(node, out, depth = 0) {
  if (node == null || depth > 40) return out;
  if (Array.isArray(node)) { node.forEach(x => zhValues(x, out, depth + 1)); return out; }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'zh') {
        if (typeof v === 'string') out.push(v);
        else if (Array.isArray(v)) v.forEach(x => typeof x === 'string' ? out.push(x) : zhValues(x, out, depth + 1));
        else zhValues(v, out, depth + 1);
      } else zhValues(v, out, depth + 1);
    }
  }
  return out;
}

const TEMPLATES_SPECIES = [n => '野生的' + n, n => '巨大的' + n, n => '抓到了' + n + '！', n => n + '倒下了！',
  n => n + '变巨大了！', n => n + '正在进化！', n => '闪光的' + n + '出现了！', n => '传说的' + n + '出现了！'];
const TEMPLATES_PLACES = [p => '到达' + p];

function collect(root) {
  const { g, loaded, errors } = loadGame(root);
  const items = [];
  const add = (text, src, tier = 'core') => { if (typeof text === 'string' && HAN.test(text)) items.push({ text: text.trim(), key: norm(text), src, tier }); };
  (g.VOCAB || []).forEach(e => add(Array.isArray(e) ? e[0] : e && e.zh, 'VOCAB'));
  (g.PHRASES || []).forEach(p => add(p, 'PHRASES'));
  (g.PHRASEBOOK || []).forEach(p => {
    add(p.zh, 'PHRASEBOOK');
    (p.build || []).forEach(b => add(Array.isArray(b) ? b[0] : b && b.zh, 'PHRASEBOOK.build'));
  });
  Object.values(g.MOMENTS || {}).forEach(list => (Array.isArray(list) ? list : [list]).forEach(s => add(typeof s === 'string' ? s : s && s.zh, 'MOMENTS')));
  // ZH_ACTS: what each move does in battle ("喷出了水！"), recorded alone and played after the creature's name
  for (const k of ['ZH_SPECIES', 'ZH_TYPES', 'ZH_MOVES', 'ZH_ACTS', 'ZH_ITEMS', 'ZH_PLACES'])
    Object.values(g[k] || {}).forEach(e => add(e && e.zh, k));
  zhValues(g.DIALOGUES, []).forEach(s => add(s, 'DIALOGUES'));
  // graded readers: each sentence is spoken whole, plus titles and single words
  (g.READINGS || []).forEach(r => { if (r.title) add(r.title[0], 'READINGS'); (r.lines || []).forEach(l => { add((l.w || []).map(t => t[0]).join(''), 'READINGS'); (l.w || []).forEach(t => t.length > 1 && add(t[0], 'READINGS.word')) }) });
  // the companion's lines (src/companion.js): a finite set of templates x trace characters / phrasebook phrases
  try { require('./companion_lines.js').companionLines(root).forEach(l => add(l.zh, 'COMPANION')); } catch (e) { errors.push('companion.js: ' + e.message); }
  const species = [...new Set(Object.values(g.ZH_SPECIES || {}).map(e => e && e.zh).filter(Boolean))];
  const places = [...new Set(Object.values(g.ZH_PLACES || {}).map(e => e && e.zh).filter(Boolean))];
  species.forEach(n => TEMPLATES_SPECIES.forEach(t => add(t(n), 'template', 'template')));
  places.forEach(p => TEMPLATES_PLACES.forEach(t => add(t(p), 'template', 'template')));
  // De-duplicate by key. Prefer core over template, and the punctuated spelling (better intonation) over the bare one.
  const byKey = new Map();
  for (const it of items) {
    if (!it.key) continue;
    const prev = byKey.get(it.key);
    if (!prev) { byKey.set(it.key, { ...it, srcs: [it.src] }); continue; }
    if (!prev.srcs.includes(it.src)) prev.srcs.push(it.src);
    if (prev.tier === 'template' && it.tier === 'core') { prev.tier = 'core'; prev.src = it.src; }
    if (/[。！？!?]$/.test(it.text) && !/[。！？!?]$/.test(prev.text)) prev.text = it.text;
  }
  return { items: [...byKey.values()], loaded, errors };
}

module.exports = { collect, norm, PUNCT };

if (require.main === module) {
  const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
  const r = collect(root);
  r.errors.forEach(e => process.stderr.write('warning: could not load ' + e + '\n'));
  process.stdout.write(JSON.stringify(r.items));
}
