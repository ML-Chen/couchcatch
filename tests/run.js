#!/usr/bin/env node
// Couchcatch end-to-end test runner.
// Usage: node /home/claude/tests/run.js [path-to-html] [--only=name1,name2] [--net] [--list]
//   With no path, builds the game first (python3 build.py draw.js <out>) and tests the build.
//   Every test gets a fresh browser context (empty localStorage) at 360x629 (the user's Android phone).
//   A test fails on any pageerror or console.error, on nested arrays in LOG events,
//   and on visible text containing "undefined" or "NaN".
'use strict';
const {chromium} = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');

const ROOT = '/home/claude';
const SCRATCH_OUT = '/tmp/claude-0/-home-claude/503bd1cf-9502-5dcc-bafa-c1050294cb58/scratchpad/tests_build.html';
const VIEWPORT = {width: 360, height: 629};
const DEFAULT_TIMEOUT = 40000;

const args = process.argv.slice(2);
const flag = (n) => args.find(a => a === '--' + n || a.startsWith('--' + n + '='));
const flagVal = (n) => { const f = flag(n); return f && f.includes('=') ? f.split('=').slice(1).join('=') : null; };
const positional = args.filter(a => !a.startsWith('--'));
const ALLOW_NET = !!flag('net');
const ONLY = flagVal('only') ? flagVal('only').split(',').map(s => s.trim()).filter(Boolean) : null;

function buildGame() {
  let out = process.env.COUCHCATCH_BUILD_OUT || SCRATCH_OUT;
  if (!fs.existsSync(path.dirname(out))) out = path.join(os.tmpdir(), 'couchcatch_tests_build.html');
  cp.execFileSync('python3', ['build.py', 'draw.js', out], {cwd: ROOT, stdio: 'inherit'});
  return out;
}

// ---------- in-page helpers (installed before the game's scripts run; they touch game globals only when called) ----------
const INIT = `
// Conversations (runTalk) pop up on their own: after the starter pick, before gyms, on first arrivals, on flights.
// Tests opt in per key (test.talk = ['gym_backyard'] or true); everything else is gated off by wrapping hasTalk.
(function () {
  let real = null;
  Object.defineProperty(window, 'hasTalk', {configurable: true,
    get() { return real && (k => window.__TT.talkAllowed(k) && real(k)); },
    set(v) { real = v; }});
})();
window.__TT = {
  talk: window.__TT_TALK || false,
  talkAllowed(k) { return this.talk === true || (Array.isArray(this.talk) && this.talk.includes(k)); },
  // Recursively find arrays that directly contain arrays (Firestore rejects them).
  nested(v, p, inArr) {
    p = p || '$';
    if (Array.isArray(v)) { if (inArr) return [p]; const o = []; v.forEach((x, i) => o.push(...this.nested(x, p + '[' + i + ']', true))); return o; }
    if (v && typeof v === 'object') { const o = []; for (const k in v) o.push(...this.nested(v[k], p + '.' + k, false)); return o; }
    return [];
  },
  badText() {
    const t = document.body ? document.body.innerText : '';
    return t.match(/.{0,40}\\b(undefined|NaN)\\b.{0,40}/g) || [];
  },
  logIssues() {
    const out = [];
    try {
      LOGBUF.forEach((e, i) => { for (const n of this.nested(e, 'LOG[' + i + ':' + e.type + ']')) out.push(n); try { JSON.stringify(e); } catch (x) { out.push('LOG[' + i + '] not serializable'); } });
      for (const n of this.nested(snap(), 'snap()')) out.push(n);
    } catch (x) { out.push('log check failed: ' + x.message); }
    return out;
  },
  // Make the scene spawn on every frame until n creatures are on the field (or the quota/cap stops it).
  // Records the largest field size seen after any frame in __TT.maxWild.
  maxWild: 0,
  pump(n, frames) {
    let left = frames || 600;
    const f = () => {
      this.maxWild = Math.max(this.maxWild, wild.length);
      if (--left <= 0 || S.mode !== 'staying' || wild.length >= n) return;
      lastSpawn = -100; requestAnimationFrame(f);
    };
    f();
  },
  vis(sel) { const e = document.querySelector(sel); return !!(e && !e.hidden && e.getClientRects().length && getComputedStyle(e).display !== 'none'); },
  lastLog(type) { for (let i = LOGBUF.length - 1; i >= 0; i--) if (LOGBUF[i].type === type) return LOGBUF[i]; return null; },
  countLog(type) { return LOGBUF.filter(e => e.type === type).length; },
  // Layout metrics for the main screen (root = #app) or a sheet.
  layout(sel) {
    const vw = innerWidth, vh = innerHeight, root = document.querySelector(sel);
    const r = {sel, vw, vh, docScrollW: document.documentElement.scrollWidth, hOff: [], vOff: []};
    const isSheet = root.classList.contains('sheet');
    if (isSheet) { r.scrollW = root.scrollWidth; r.clientW = root.clientWidth; r.scrollH = root.scrollHeight; r.clientH = root.clientHeight; }
    else { r.scrollW = root.scrollWidth; r.clientW = root.clientWidth; r.scrollH = root.scrollHeight; r.clientH = root.clientHeight; }
    const clipped = (el) => { for (let a = el.parentElement; a && a !== root; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') return true; } return false; };
    for (const el of root.querySelectorAll('*')) {
      const b = el.getBoundingClientRect(); if (!b.width && !b.height) continue; if (clipped(el)) continue;
      const cs = getComputedStyle(el); if (cs.position === 'fixed') continue;
      const id = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '');
      if (b.right > vw + 0.5 || b.left < -0.5) r.hOff.push(id + ' x=' + b.left.toFixed(1) + '..' + b.right.toFixed(1));
      // Inside a scrolling sheet, scrollHeight already measures vertical overflow; on the main screen check element bottoms.
      if (!isSheet && b.bottom > vh + 10) r.vOff.push(id + ' bottom=' + b.bottom.toFixed(1));
    }
    r.hOff = r.hOff.slice(0, 8); r.vOff = r.vOff.slice(0, 8);
    return r;
  }
};
`;

class TestFail extends Error {}

function mkHelpers(page, state) {
  const T = {
    page,
    ev: (fn, arg) => page.evaluate(fn, arg),
    sleep: (ms) => new Promise(r => setTimeout(r, ms)),
    ok(cond, msg) { if (!cond) throw new TestFail(msg); },
    eq(a, b, msg) { if (a !== b) throw new TestFail(`${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); },
    note(s) { state.notes.push(s); },
    async until(fn, arg, msg, timeout = 10000) {
      try { await page.waitForFunction(fn, arg, {timeout, polling: 40}); }
      catch (e) {
        if (/Timeout/i.test(e.message)) throw new TestFail(`${msg || 'condition'} (timed out after ${timeout} ms)`);
        throw e;
      }
    },
    // Pick the i-th starter through the real button.
    async start(i = 0) {
      await T.until(() => document.readyState === 'complete' && !!window.traceChar && !!window.Reader, null, 'all game modules loaded');
      await T.until(() => __TT.vis('#sStart') && document.querySelectorAll('#starterList button').length === 3, null, 'starter picker visible');
      await page.click(`#starterList button >> nth=${i}`);
      await T.until(() => S.col.length === 1 && document.getElementById('sStart').hidden, null, 'starter added');
      // Battle moves need a traced character; most tests aren't about tracing, so a trace resolves instantly (test 11 checks the real overlay).
      if (!state.realTrace) await T.ev(() => { window.__realTrace = window.traceChar; window.traceChar = (k) => Promise.resolve({ok: true, mistakes: 0, perfect: true, ch: '火'}); });
    },
    async stay() {
      await page.click('#bStay');
      await T.until(() => S.mode === 'staying', null, 'S.mode becomes staying');
    },
    async spawn(n) {
      await T.ev(n => __TT.pump(n), n);
      await T.until(n => wild.length >= n, n, `${n} creature(s) on the field`);
    },
    // Resolve speech instantly (say() still keeps its own fixed pauses).
    async fastSpeech() { await T.ev(() => { window.speakAsync = () => Promise.resolve(); window.TALK_PACE = .15; }); },
    async openCatchOn(i = 0) {
      await T.ev(i => openCatch(wild[i]), i);
      try { await T.until(() => C && C.phase === 'aim' && __TT.vis('#sCatch'), null, 'catch sheet open in aim phase'); }
      catch (e) { const st = await T.ev(() => JSON.stringify({C: !!C, phase: C && C.phase, spelling: C && C.spelling, catchHidden: document.getElementById('sCatch').hidden, trace: String(window.traceChar).slice(0, 80), tw: !!document.querySelector('.tracewrap'), rt: !!window.__realTrace})); throw new TestFail(e.message + ' ' + st); }
      await T.sleep(80); // let the sheet lay out and the canvas size itself
    },
    // Real drag-and-flick throw with the mouse: press on the orb at cGeom().rest, move in `steps` steps, release.
    // The step length is calibrated from the measured gap between pointermove events so the flick speed lands
    // near 3x the canvas height per second (the game accepts 1.1x..8x as a full-length throw).
    async flick({dx = 0, steps = 5, wait = 20} = {}) {
      const g = await T.ev(() => { const g = cGeom(), r = ccv.getBoundingClientRect(); return {x: r.left + g.rest.x, y: r.top + g.rest.y, h: g.h, w: g.w}; });
      await T.ev(() => { window.__mv = []; if (!window.__mvL) { window.__mvL = () => window.__mv && window.__mv.push(performance.now()); ccv.addEventListener('pointermove', window.__mvL); } });
      for (let i = 0; i < 6; i++) { await page.mouse.move(g.x + (i % 2 ? 4 : -4), g.y - 70 - i * 2); await T.sleep(wait); }
      const gaps = await T.ev(() => { const m = window.__mv || [], d = []; for (let i = 1; i < m.length; i++) d.push(m[i] - m[i - 1]); window.__mv = null; return d; });
      gaps.sort((a, b) => a - b);
      const gap = gaps.length ? gaps[Math.floor(gaps.length / 2)] : wait + 5;
      const step = Math.max(6, Math.min(45, 3 * g.h * gap / 1000));
      const before = await T.ev(() => __TT.countLog('throw'));
      await page.mouse.move(g.x, g.y);
      await page.mouse.down();
      for (let i = 1; i <= steps; i++) { await T.sleep(wait); await page.mouse.move(g.x + dx * i, g.y - step * i); }
      await page.mouse.up();
      return {gap, step, before};
    },
    async reload() {
      await page.reload({waitUntil: 'load'});
      await T.until(() => typeof S !== 'undefined' && typeof window.runTalk === 'function', null, 'game reloaded');
    },
    // Finish the 3 s / 2.6 s / 2.2 s "say it out loud" countdown rings at once (lessons and conversations).
    async skipRings() { await T.ev(() => { if (!window.__skip) window.__skip = setInterval(() => document.querySelectorAll('.sheet.lesson .ring, .sheet.talk .ring').forEach(r => r._skip && r._skip()), 50); }); },
    // Play through the open conversation: for every answer, tap an option once (select) and again (confirm).
    // wrongFirst: answer the first question with a wrong option and expect a recast bubble (.bub.fix).
    // checkArm: assert that the first tap only selects (no answer bubble) and asks for a second tap.
    async talkThrough({wrongFirst = false, checkArm = false, timeout = 30000} = {}) {
      await T.skipRings();
      const t0 = Date.now(); let answered = 0, recast = false, key = null;
      while (Date.now() - t0 < timeout) {
        const st = await T.ev(() => {
          const el = document.querySelector('.sheet.talk'); if (!el || el.hidden) return {closed: true};
          const lt = __TT.lastLog('talk_start');
          return {key: lt && lt.key, opts: el.querySelectorAll('.talkopts button:not(.mic)').length, cont: [...el.querySelectorAll('.talkpanel > button')].some(b => /Continue/.test(b.innerText))};
        });
        if (st.closed) return {answered, recast, key, closed: true};
        key = st.key;
        if (st.cont) { await page.click('.sheet.talk .talkpanel > button'); await T.until(() => document.querySelector('.sheet.talk').hidden, null, 'Continue closes the conversation', 3000); return {answered, recast, key}; }
        if (!st.opts) { await T.sleep(50); continue; }
        const ch = await T.ev(({key, wantWrong}) => {
          const D = DIALOGUES[key], right = [], wrong = [];
          for (const t of D.turns) for (const o of t.you || []) (o.ok ? right : wrong).push(o.zh);
          const zs = [...document.querySelectorAll('.sheet.talk .talkopts button:not(.mic)')].map(b => b.querySelector('.z').textContent);
          let i = wantWrong ? zs.findIndex(z => wrong.includes(z) && !right.includes(z)) : -1;
          if (i < 0) i = zs.findIndex(z => right.includes(z)); if (i < 0) i = 0;
          return {i, wrong: wrong.includes(zs[i]) && !right.includes(zs[i]), you: document.querySelectorAll('.sheet.talk .bub.you').length, fix: document.querySelectorAll('.sheet.talk .bub.fix').length};
        }, {key, wantWrong: wrongFirst && !recast && answered === 0});
        const btn = `.sheet.talk .talkopts button:not(.mic) >> nth=${ch.i}`;
        await page.click(btn);
        if (checkArm) {
          await T.sleep(150);
          const a = await T.ev(() => ({you: document.querySelectorAll('.sheet.talk .bub.you').length, txt: [...document.querySelectorAll('.sheet.talk .talkopts button:not(.mic)')].map(b => b.innerText).join(' | ')}));
          T.eq(a.you, ch.you, `answer ${answered + 1}: first tap only selects (answer bubbles)`);
          T.ok(/Tap again/.test(a.txt), `answer ${answered + 1}: selected option asks for a second tap: ` + a.txt);
        }
        await page.click(btn);
        await T.until(n => document.querySelectorAll('.sheet.talk .bub.you').length > n, ch.you, `answer ${answered + 1}: second tap confirms`, 3000);
        if (ch.wrong) {
          await T.until(n => document.querySelectorAll('.sheet.talk .bub.fix').length > n, ch.fix, 'a wrong answer shows a recast bubble (.bub.fix)', 4000);
          const fx = await T.ev(() => [...document.querySelectorAll('.sheet.talk .bub.fix')].pop().innerText);
          T.ok(/你是说/.test(fx), 'recast says 你是说…: ' + fx);
          recast = true;
        }
        answered++;
        await T.until(n => document.querySelectorAll('.sheet.talk .talkopts button:not(.mic)').length === 0 || document.querySelectorAll('.sheet.talk .bub.you').length > n + (ch.wrong ? 1 : 0), ch.you, 'answer accepted', 4000);
      }
      throw new TestFail(`conversation ${key} did not finish within ${timeout} ms (answered ${answered})`);
    },
    async layoutOk(sel, label) {
      const L = await T.ev(sel => __TT.layout(sel), sel);
      const probs = [];
      if (L.docScrollW > L.vw) probs.push(`document scrollWidth ${L.docScrollW} > ${L.vw}`);
      if (L.scrollW > L.clientW) probs.push(`${sel} scrollWidth ${L.scrollW} > clientWidth ${L.clientW}`);
      if (L.scrollH - L.clientH > 10) probs.push(`${sel} vertical overflow ${L.scrollH - L.clientH}px (scrollHeight ${L.scrollH}, clientHeight ${L.clientH})`);
      if (L.hOff.length) probs.push('elements outside viewport horizontally: ' + L.hOff.join('; '));
      if (L.vOff.length) probs.push('elements below viewport by >10px: ' + L.vOff.join('; '));
      if (probs.length) throw new TestFail(`layout (${label}): ` + probs.join(' | '));
      return L;
    },
  };
  return T;
}

async function runOne(browser, url, test) {
  const state = {errors: [], notes: []};
  const ctx = await browser.newContext({viewport: VIEWPORT, deviceScaleFactor: 1});
  if (!ALLOW_NET) await ctx.route(/^https?:\/\//, r => r.fulfill({status: 200, body: '', contentType: r.request().resourceType() === 'stylesheet' ? 'text/css' : 'text/plain'}));
  await ctx.addInitScript(`window.__TT_TALK = ${JSON.stringify(test.talk || false)};`);
  await ctx.addInitScript(INIT);
  if (test.init) await ctx.addInitScript(test.init);
  const page = await ctx.newPage();
  page.on('pageerror', e => state.errors.push('pageerror: ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { if (m.type() === 'error') state.errors.push('console.error: ' + m.text().slice(0, 300)); });
  const T = mkHelpers(page, state);
  const t0 = Date.now();
  let fail = null;
  try {
    await page.goto(url, {waitUntil: 'load'});
    await T.until(() => typeof S !== 'undefined' && typeof SP !== 'undefined' && typeof window.runTalk === 'function', null, 'game scripts loaded');
    let timer;
    const timeout = new Promise((_, rej) => { timer = setTimeout(() => rej(new TestFail(`test timed out after ${test.timeout || DEFAULT_TIMEOUT} ms`)), test.timeout || DEFAULT_TIMEOUT); });
    try { await Promise.race([test.fn(T), timeout]); } finally { clearTimeout(timer); }
    await T.sleep(150); // let pending timeouts surface errors
    const inv = await page.evaluate(() => ({log: __TT.logIssues(), text: __TT.badText()})).catch(e => ({log: [], text: [], err: e.message}));
    if (inv.log.length) throw new TestFail('LOG event contains nested arrays: ' + inv.log.slice(0, 5).join(', '));
    if (inv.text.length) throw new TestFail('visible text contains undefined/NaN: ' + inv.text.slice(0, 3).map(s => JSON.stringify(s)).join(' ; '));
  } catch (e) {
    fail = e instanceof TestFail ? e.message : 'exception: ' + (e.stack || e.message).split('\n').slice(0, 4).join(' | ');
  }
  if (!fail && state.errors.length) fail = 'page errors: ' + state.errors.slice(0, 4).join(' || ');
  else if (fail && state.errors.length) fail += ' || page errors: ' + state.errors.slice(0, 3).join(' || ');
  await ctx.close().catch(() => {});
  return {name: test.name, ok: !fail, fail, ms: Date.now() - t0, notes: state.notes};
}

(async () => {
  const tests = require('./tests.js');
  if (flag('list')) { for (const t of tests) console.log(t.name); return; }
  const htmlPath = positional[0] ? path.resolve(positional[0]) : buildGame();
  if (!fs.existsSync(htmlPath)) { console.error('No such file: ' + htmlPath); process.exit(2); }
  const url = 'file://' + htmlPath;
  const sel = ONLY ? tests.filter(t => ONLY.some(o => t.name.toLowerCase().includes(o.toLowerCase()))) : tests;
  console.log(`Couchcatch e2e: ${sel.length} test(s) against ${htmlPath}${ALLOW_NET ? ' (network allowed)' : ''}`);
  const browser = await chromium.launch();
  const t0 = Date.now();
  const results = [];
  for (const t of sel) {
    const r = await runOne(browser, url, t);
    results.push(r);
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  (${(r.ms / 1000).toFixed(1)}s)${r.ok ? '' : '\n      ' + r.fail}`);
    for (const n of r.notes) console.log('      note: ' + n);
  }
  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
