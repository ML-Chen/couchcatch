// Couchcatch end-to-end test cases. Each test gets a fresh page (empty localStorage) at 360x629.
// T helpers: ev, until, sleep, ok, eq, note, start, stay, spawn, fastSpeech, openCatchOn, flick, layoutOk (see run.js).
'use strict';

const DLG_FIXTURE = `
window.__DLG_GYM = {
  who: {name: 'Coach Mira', zh: '米拉教练', py: 'Mǐlā jiàoliàn', role: 'gym leader'},
  setting: 'Backyard Gym',
  turns: [
    {npc: {zh: '你好！', py: 'nǐ hǎo!', en: 'Hello!'}},
    {you: [{zh: '你好！', py: 'nǐ hǎo!', en: 'Hello!', ok: true, reply: {zh: '我们开始吧！', py: 'wǒmen kāishǐ ba!', en: "Let's begin!"}},
           {zh: '再见！', py: 'zàijiàn!', en: 'Goodbye!'}]},
    {you: [{zh: '谢谢！', py: 'xièxie!', en: 'Thank you!', ok: true},
           {zh: '不客气。', py: 'bú kèqi.', en: "You're welcome."}]}
  ],
  end: {zh: '加油！', py: 'jiāyóu!', en: 'Good luck!'},
  reward: {orb: 2}
};
// Fallback only: the build's dialogues.js merges into window.DIALOGUES and replaces this gym_backyard if it has one.
window.DIALOGUES = {gym_backyard: window.__DLG_GYM};
`;

// Click a button that may be animating (raid/knock buttons pulse forever, so Playwright never sees them "stable").
const forceClick = (T, sel) => T.page.click(sel, {force: true});
const forceCatch = (T) => T.ev(() => { if (!window.__origDecide) { window.__origDecide = decideCatch; decideCatch = function () { window.__origDecide(); C.caught = true; C.nShakes = 1; }; } });
const goTo = async (T, i) => {
  await T.ev(i => { travel(i); }, i);
  await T.until(() => S.mode === 'travel', null, 'travel starts');
  await T.ev(() => { travelT = 1; });
  await T.until(i => S.mode === 'arrived' && S.place === i, i, `arrive at place ${i}`);
};

module.exports = [

{name: '01 loads with no errors and shows the starter picker', fn: async T => {
  await T.sleep(1200); // let timers, audio setup and first frames run
  const r = await T.ev(() => {
    const bs = [...document.querySelectorAll('#starterList button')];
    const inked = bs.map(b => { const c = b.querySelector('canvas'); if (!c || !c.width) return false; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return true; return false; });
    return {vis: __TT.vis('#sStart'), n: bs.length, text: bs.map(b => b.innerText.replace(/\s+/g, ' ')), inked, col: S.col.length, mode: S.mode, title: document.title};
  });
  T.ok(r.vis, 'starter sheet #sStart is visible');
  T.eq(r.n, 3, 'number of starter buttons');
  ['Smoldy', 'Otterpip', 'Clovehop'].forEach((n, i) => T.ok(r.text[i].includes(n), `starter ${i} shows ${n} (got "${r.text[i]}")`));
  T.ok(r.inked.every(Boolean), 'every starter portrait canvas has drawn pixels: ' + JSON.stringify(r.inked));
  T.eq(r.col, 0, 'collection is empty before picking');
  T.eq(r.mode, 'arrived', 'initial mode');
  T.eq(r.title, 'Couchcatch', 'document title');
}},

{name: '02 picking a starter adds a Lv-5 creature, saves it, and reload restores it', fn: async T => {
  await T.start(1); // Otterpip
  const c = await T.ev(() => ({...S.col[0], name: SP[S.col[0].sp].n, max: stats(S.col[0]).maxhp}));
  T.eq(c.name, 'Otterpip', 'starter species');
  T.eq(c.lvl, 5, 'starter level');
  T.eq(c.hp, c.max, 'starter at full HP');
  await T.until(() => { try { const d = JSON.parse(localStorage.getItem('couchcatch2')); return d && d.v === 2 && d.col.length === 1; } catch (e) { return false; } }, null, 'save written to localStorage couchcatch2', 3000);
  const saved = await T.ev(() => JSON.parse(localStorage.getItem('couchcatch2')).col[0]);
  T.ok(saved.lvl === 5 && saved.sp === c.sp && saved.id === c.id, 'saved creature matches: ' + JSON.stringify(saved));
  // stay and spawn two creatures so the field is saved too
  await T.stay();
  await T.spawn(2);
  const field = await T.ev(() => { flush(); return wild.map(w => w.sp + ':' + w.lvl); });
  await T.reload();
  await T.sleep(300);
  const r = await T.ev(() => ({col: S.col.map(x => SP[x.sp].n + ' L' + x.lvl), start: __TT.vis('#sStart'), mode: S.mode, wild: wild.map(w => w.sp + ':' + w.lvl), dex: document.getElementById('cDex').textContent}));
  T.eq(r.col.join(','), 'Otterpip L5', 'collection after reload');
  T.ok(!r.start, 'starter picker is not shown again after reload');
  T.eq(r.mode, 'staying', 'mode restored');
  T.eq(r.wild.slice(0, field.length).join(','), field.join(','), 'creatures on the field restored');
  T.ok(r.dex.startsWith('1/'), 'dex chip shows 1 kind: ' + r.dex);
}},

{name: '03a staying spawns creatures over time and never more than 7 are on the field', fn: async T => {
  await T.start();
  await T.stay();
  T.eq(await T.ev(() => quota()), 5, 'quota at the first place');
  await T.until(() => wild.length >= 2, null, 'two creatures arrive on their own (about 1.3 s apart)', 6000);
  // Unlock the 15 cap and spawn every frame: the field must stop at 7.
  await T.ev(() => { S.stayed = [0, 1, 2, 3, 4, 5]; __TT.maxWild = 0; __TT.pump(99, 90); });
  await T.sleep(1700);
  let r = await T.ev(() => ({max: __TT.maxWild, n: wild.length, spawned: S.spawned, q: quota()}));
  T.eq(r.q, 15, 'quota with 6 places stayed');
  T.eq(r.n, 7, 'field fills up to 7');
  T.ok(r.max <= 7, 'never more than 7 on the field (max seen ' + r.max + ')');
  T.eq(r.spawned, 7, 'spawned count stops while the field is full');
  // Catching frees space; spawning resumes until the quota of 15 is used up.
  for (let round = 0; round < 3; round++) {
    await T.ev(() => { wild.splice(0, 4); __TT.pump(99, 60); });
    await T.sleep(1100);
  }
  r = await T.ev(() => ({max: __TT.maxWild, n: wild.length, spawned: S.spawned, st: document.getElementById('status').innerText}));
  T.ok(r.max <= 7, 'never more than 7 on the field after refills (max seen ' + r.max + ')');
  T.eq(r.spawned, 15, 'spawning stops at the quota');
  T.ok(/All 15 creatures are here/.test(r.st), 'status says all 15 are here: ' + r.st);
  await T.ev(() => { wild.length = 0; updateUI(); __TT.pump(99, 30); });
  await T.sleep(600);
  r = await T.ev(() => ({n: wild.length, spawned: S.spawned, st: document.getElementById('status').innerText}));
  T.eq(r.n, 0, 'no more spawns once the quota is used');
  T.ok(/quiet now/.test(r.st), 'status says the place is quiet: ' + r.st);
}},

{name: '03b quota grows by 2 for each new place stayed at', fn: async T => {
  await T.start();
  const st = () => T.ev(() => document.getElementById('status').innerText);
  T.ok(/stay and 5 creatures will come/.test(await st()), 'status promises 5 at the first place');
  await T.stay();
  T.eq(await T.ev(() => quota()), 5, 'quota after staying at Backyard');
  const seq = [[1, 7], [2, 9], [0, 9], [3, 11], [1, 11], [4, 13], [5, 15], [7, 15]];
  for (const [place, want] of seq) {
    await goTo(T, place);
    const s = await st();
    T.ok(new RegExp('stay and ' + want + ' creatures will come').test(s), `status before staying at place ${place} promises ${want}: "${s}"`);
    await T.stay();
    T.eq(await T.ev(() => quota()), want, `quota after staying at place ${place}`);
  }
}},

{name: '04 drag-and-flick: an upward flick hits, a sideways flick misses and still uses an orb', fn: async T => {
  await T.start();
  await T.stay();
  await T.until(() => wild.length >= 1, null, 'a creature appears', 5000);
  // tap the creature on the scene for real
  const p = await T.ev(() => { const r = scene.getBoundingClientRect(), w = wild[0]; return {x: r.left + w.x * r.width, y: r.top + (w.y - .07) * r.height}; });
  await T.page.mouse.click(p.x, p.y);
  await T.until(() => C && C.phase === 'aim' && __TT.vis('#sCatch'), null, 'tapping the creature opens the catch sheet', 3000);
  await T.sleep(150);
  // sideways flick
  const a0 = await T.ev(() => { S.streak = 3; updateUI(); return {orbs: S.items[C.kind], throws: C.throws, kind: C.kind}; });
  const f1 = await T.flick({dx: 32});
  await T.until(b => __TT.countLog('throw') > b, f1.before, `sideways flick is thrown (step ${f1.step.toFixed(1)}px, move gap ${f1.gap.toFixed(1)}ms)`, 2000);
  await T.until(() => __TT.countLog('throw_hit') + __TT.countLog('throw_miss') >= 1, null, 'sideways throw resolves', 3000);
  const a1 = await T.ev(k => ({orbs: S.items[k], throws: C.throws, hit: __TT.countLog('throw_hit'), miss: __TT.lastLog('throw_miss'), thr: __TT.lastLog('throw'), streak: S.streak, msg: document.getElementById('catchMsg').innerText}), a0.kind);
  T.eq(a1.hit, 0, 'sideways flick does not hit (throw ' + JSON.stringify(a1.thr) + ')');
  T.ok(a1.miss, 'a throw_miss is logged');
  T.eq(a1.orbs, a0.orbs - 1, 'the missed throw used one orb');
  T.eq(a1.throws, a0.throws + 1, 'throw counter');
  T.eq(a1.streak, 0, 'a miss resets the catch streak');
  T.ok(/Missed|Too soft|Too hard/.test(a1.msg), 'miss message shown: ' + a1.msg);
  // upward flick
  await T.until(() => C && C.phase === 'aim', null, 'back to aiming after the miss', 3000);
  await T.sleep(100);
  const f2 = await T.flick({dx: 0});
  await T.until(b => __TT.countLog('throw') > b, f2.before, `upward flick is thrown (step ${f2.step.toFixed(1)}px, move gap ${f2.gap.toFixed(1)}ms)`, 2000);
  await T.until(() => __TT.countLog('throw_hit') + __TT.countLog('throw_miss') >= 2, null, 'upward throw resolves', 3000);
  const a2 = await T.ev(k => ({orbs: S.items[k], hit: __TT.lastLog('throw_hit'), thr: __TT.lastLog('throw'), misses: __TT.countLog('throw_miss')}), a0.kind);
  T.ok(a2.hit && a2.misses === 1, 'upward flick hits the creature (throw ' + JSON.stringify(a2.thr) + ')');
  T.eq(a2.orbs, a0.orbs - 2, 'the hit used one more orb');
  T.ok(a2.thr.vy < -250, 'throw velocity is upward: ' + a2.thr.vy);
}},

{name: "05 a catch adds the creature, raises the streak, counts quests; Great/Excellent counts the 'great' quest", fn: async T => {
  await T.start();
  await T.stay();
  await T.spawn(2);
  await forceCatch(T);
  await T.ev(() => {
    S.streak = 2;
    S.quests = {day: today(), bonus: false, list: [
      {k: 'great', goal: 3, prog: 0, done: false, txt: 'Land 3 Great or Excellent throws', rw: {great: 3}},
      {k: 'catch', goal: 5, prog: 0, done: false, txt: 'Catch 5 creatures', rw: {orb: 10}},
      {k: 'first', goal: 3, prog: 0, done: false, txt: 'Catch 3 creatures on the first throw', rw: {great: 2, berry: 1}}]};
  });
  const xp0 = await T.ev(() => ({xp: S.col[0].xp, lvl: S.col[0].lvl, orbs: S.items.orb}));
  await T.openCatchOn(0);
  const wd = await T.ev(() => ({sp: C.wd.sp, lvl: C.wd.lvl}));
  // Time the throw so the shrinking ring is at its smallest when the orb lands (Excellent), then throw with Space.
  await T.ev(() => { C.t0 = T + .55; ccv.focus(); });
  await T.page.keyboard.press('Space');
  await T.until(() => __TT.countLog('throw_hit') >= 1, null, 'timed throw hits', 3000);
  const lab1 = await T.ev(() => __TT.lastLog('throw_hit').label);
  T.ok(/^(Excellent|Great)!/.test(lab1), 'throw graded Great or Excellent: ' + lab1);
  await T.until(() => S.quests.list[0].prog === 1, null, "'great' quest progress counted for a " + lab1 + ' throw', 2000);
  await T.until(() => S.col.length === 2, null, 'caught creature joins the collection', 6000);
  let r = await T.ev(() => ({c: S.col[1], streak: S.streak, q: S.quests.list.map(x => x.prog), xp: S.col[0].xp, lvl: S.col[0].lvl, orbs: S.items.orb, caught: S.caught}));
  T.eq(r.c.sp, wd.sp, 'caught species');
  T.eq(r.c.lvl, wd.lvl, 'caught level');
  T.eq(r.streak, 3, 'streak incremented');
  T.eq(r.q.join(','), '1,1,1', "quest progress great,catch,first");
  T.ok(r.lvl > xp0.lvl || r.xp > xp0.xp, 'party gained XP');
  T.eq(r.orbs, xp0.orbs - 1 + 3, 'one orb used, plus 3 orbs for the x3 streak');
  T.ok(r.caught.includes(wd.sp), 'species recorded in S.caught');
  await T.until(() => C === null && document.getElementById('sCatch').hidden, null, 'catch sheet closes after a catch', 4000);
  // A plain "Nice" throw must not count the 'great' quest.
  await T.openCatchOn(0);
  await T.ev(() => { C.t0 = T + .55 - Math.PI / 2 / 1.6; ccv.focus(); });
  await T.page.keyboard.press('Space');
  await T.until(() => __TT.countLog('throw_hit') >= 2, null, 'second timed throw hits', 3000);
  const lab2 = await T.ev(() => __TT.lastLog('throw_hit').label);
  T.ok(/^Nice!/.test(lab2), 'second throw graded Nice: ' + lab2);
  await T.until(() => S.col.length === 3, null, 'second catch joins the collection', 6000);
  r = await T.ev(() => ({streak: S.streak, q: S.quests.list.map(x => x.prog)}));
  T.eq(r.q.join(','), '1,2,2', "a Nice throw does not count 'great'; catch and first do");
  T.eq(r.streak, 4, 'streak incremented again');
}},

{name: '06 fainted creatures stay at 0 HP during a battle while staying; passive healing never revives them', fn: async T => {
  await T.start();
  await T.fastSpeech();
  await T.ev(() => { S.col.push(mk(IDX.Otterpip, 5)); save(); });
  await T.stay();
  await T.page.click('#bGym');
  await T.until(() => B && !B.busy && __TT.vis('#sBattle'), null, 'gym battle ready', 8000);
  await T.ev(() => { const f = B.foes[B.fi]; f.hpMul = 3; f.hp = stats(f).maxhp; party()[0].hp = 1; renderBattle(); });
  await T.page.click('#bBtns button >> nth=1'); // Bonk
  await T.until(() => party()[0].hp === 0 && B && B.pi === 1 && !B.busy, null, 'lead faints and the second creature comes in', 15000);
  for (let i = 0; i < 3; i++) { await T.ev(() => { lastHeal = -100; }); await T.sleep(150); }
  let r = await T.ev(() => ({hp: party()[0].hp, mode: S.mode, inBattle: !!B}));
  T.ok(r.mode === 'staying' && r.inBattle, 'still staying and in battle');
  T.eq(r.hp, 0, 'fainted creature stays at 0 HP during the battle');
  r = await T.ev(() => { const c = party()[0], l = c.lvl; gainXP(c, 300); return {hp: c.hp, up: c.lvl > l}; });
  T.ok(r.up, 'fainted creature leveled up');
  T.eq(r.hp, 0, 'leveling up does not revive a fainted creature');
  await T.ev(() => { endBattle(); });
  await T.until(() => B === null && document.getElementById('sBattle').hidden, null, 'battle closed');
  await T.ev(() => { party()[1].hp = 1; lastHeal = -100; });
  await T.until(() => party()[1].hp > 1, null, 'passive healing tops up a hurt (not fainted) creature', 2000);
  for (let i = 0; i < 4; i++) { await T.ev(() => { lastHeal = -100; }); await T.sleep(120); }
  r = await T.ev(() => ({hp: party()[0].hp, mode: S.mode, team: document.getElementById('status').innerText}));
  T.eq(r.mode, 'staying', 'still staying after the battle');
  T.eq(r.hp, 0, 'passive healing never revives the fainted creature');
}},

{name: '07 evolution thresholds: 3-stage lines at Lv 18 and 36, 2-stage at 28; gainXP queues evolution', fn: async T => {
  await T.start();
  const bad = await T.ev(() => {
    const out = [];
    for (let i = 0; i < SP.length; i++) {
      const s = SP[i]; if (s.next == null) continue;
      let b = i; while (SP[b].prev != null) b = SP[b].prev;
      let len = 1, x = b; while (SP[x].next != null) { x = SP[x].next; len++; }
      const want = len === 3 ? (s.stage === 1 ? 18 : 36) : len === 2 ? 28 : -1;
      if (s.evoLv !== want) out.push(`${s.n} (stage ${s.stage} of ${len}) evolves at ${s.evoLv}, want ${want}`);
    }
    return out;
  });
  T.ok(!bad.length, 'evolution levels: ' + bad.join('; '));
  const r = await T.ev(() => {
    evoQueue.length = 0;
    const add = (n, l) => { const c = mk(IDX[n], l); S.col.push(c); return c; };
    const cs = [add('Smoldy', 17), add('Emberwren', 27), add('Smolderox', 35), add('Clovehop', 16), add('Finnow', 26)];
    for (const c of cs) gainXP(c, c.lvl * 15);
    return {lv: cs.map(c => c.lvl), ids: cs.map(c => c.id), q: [...evoQueue]};
  });
  T.eq(r.lv.join(','), '18,28,36,17,27', 'levels after one level-up each');
  T.eq(r.q.join(','), r.ids.slice(0, 3).join(','), 'exactly the creatures reaching 18 / 28 / 36 are queued');
  // Run the queued evolutions through the evolution sheet (skipping the 3.2 s glow).
  await T.ev(() => runEvoQueue());
  const want = [['Smoldy', 'Smolderox'], ['Emberwren', 'Cindercrest'], ['Smolderox', 'Pyrothane']];
  for (const [from, to] of want) {
    await T.until(() => E && !E.done && __TT.vis('#sEvo'), null, `evolution sheet opens for ${from}`, 4000);
    await T.ev(() => { E.t0 = T - 5; });
    await T.until(() => !document.getElementById('bEvoOk').hidden, null, `${from} finishes evolving`, 3000);
    const t = await T.ev(() => document.getElementById('elog').innerText);
    T.ok(t.includes(`${from} evolved into ${to}!`), `evolution message for ${from}: "${t}"`);
    await T.page.click('#bEvoOk');
  }
  await T.until(() => E === null && evoQueue.length === 0 && document.getElementById('sEvo').hidden, null, 'evolution queue drained');
  const fin = await T.ev(ids => ids.map(id => SP[S.col.find(c => c.id === id).sp].n), r.ids);
  T.eq(fin.join(','), 'Smolderox,Cindercrest,Pyrothane,Clovehop,Finnow', 'species after evolution');
}},

{name: '08 shinyRate is 1/150 normally, higher in the Starveil Rift and with a streak', fn: async T => {
  await T.start();
  const r = await T.ev(() => {
    const o = {};
    S.mode = 'arrived'; S.streak = 0; S.place = 0; o.base = shinyRate();
    S.place = 6; o.rift = shinyRate();
    S.mode = 'travel'; o.riftTravel = shinyRate(); S.mode = 'arrived';
    S.place = 0; S.streak = 4; o.s4 = shinyRate(); S.streak = 10; o.s10 = shinyRate(); S.streak = 30; o.s30 = shinyRate();
    S.place = 6; S.streak = 10; o.both = shinyRate();
    S.streak = 0;
    const N = 30000; let a = 0, b = 0;
    S.place = 0; for (let i = 0; i < N; i++) if (spawnWild(false).shiny) a++;
    S.place = 6; for (let i = 0; i < N; i++) if (spawnWild(false).shiny) b++;
    S.place = 0; o.a = a; o.b = b; o.N = N;
    return o;
  });
  const near = (x, y) => Math.abs(x - y) < 1e-12;
  T.ok(near(r.base, 1 / 150), 'base rate 1/150, got 1/' + (1 / r.base).toFixed(2));
  T.ok(r.rift > r.base * 2, 'rift rate is higher (x' + (r.rift / r.base).toFixed(2) + ')');
  T.ok(near(r.riftTravel, r.base), 'no rift bonus while travelling');
  T.ok(r.s4 > r.base && near(r.s4, 1.2 / 150), 'streak 4 raises the rate to 1.2/150, got ' + (r.s4 * 150).toFixed(3) + '/150');
  T.ok(near(r.s10, 1.5 / 150) && near(r.s30, r.s10), 'streak bonus caps at x1.5 (10+)');
  T.ok(r.both > r.rift && r.both > r.s10, 'rift and streak stack');
  // sampled spawns agree with the rate
  T.ok(r.a > 120 && r.a < 290, `shiny spawns at Backyard: ${r.a}/${r.N} (expect ~200)`);
  T.ok(r.b / r.a > 1.7 && r.b / r.a < 3.8, `rift spawns are shiny more often: ${r.b} vs ${r.a}`);
}},

{name: '09 species with a habitat spawn more often there (San Diego)', fn: async T => {
  await T.start();
  const r = await T.ev(() => {
    S.mode = 'arrived';
    const base = i => { while (SP[i].prev != null) i = SP[i].prev; return i; };
    const N = 4000, freq = [];
    for (let p = 0; p < PLACES.length; p++) { S.place = p; const cnt = {}; for (let k = 0; k < N; k++) { const b = base(spawnWild(false).sp); cnt[b] = (cnt[b] || 0) + 1; } freq.push(cnt); }
    S.place = 0;
    const out = [];
    for (const i of BASES.filter(i => SP[i].hab)) {
      const s = SP[i];
      for (let p = 0; p < PLACES.length; p++) {
        if (!s.hab.includes(PLACES[p].key)) continue;
        const here = (freq[p][i] || 0) / N;
        let other = 0, where = '';
        for (let q = 0; q < PLACES.length; q++) if (!s.hab.includes(PLACES[q].key)) { const f = (freq[q][i] || 0) / N; if (f > other) { other = f; where = PLACES[q].n; } }
        out.push({n: s.n, place: PLACES[p].n, sd: PLACES[p].key === 'sandiego', here, other, where});
      }
    }
    const sdHab = BASES.filter(i => SP[i].hab && SP[i].hab.includes('sandiego'));
    const sdShare = sdHab.reduce((a, i) => a + (freq[7][i] || 0), 0) / N;
    return {out, sdHab: sdHab.map(i => SP[i].n), sdShare, key: PLACES[7].key};
  });
  T.eq(r.key, 'sandiego', 'place index 7 is San Diego');
  T.ok(r.sdHab.length >= 2, 'several species list San Diego as habitat: ' + r.sdHab.join(', '));
  T.ok(r.sdShare >= 0.45, `San Diego habitat species make up at least 45% of San Diego spawns (got ${(r.sdShare * 100).toFixed(1)}%)`);
  const bad = r.out.filter(x => x.sd ? !(x.here > 0.06 && x.here > 2 * x.other) : !(x.here > 1.3 * x.other));
  T.ok(!bad.length, 'habitat species not favoured at home: ' + bad.map(x => `${x.n} at ${x.place} ${(x.here * 100).toFixed(1)}% vs ${(x.other * 100).toFixed(1)}% at ${x.where}`).join('; '));
  const sd = r.out.filter(x => x.sd).map(x => `${x.n} ${(x.here * 100).toFixed(1)}% vs <=${(x.other * 100).toFixed(1)}%`);
  T.note('San Diego: ' + sd.join(', '));
}},

{name: '10 raid: pickBoss + startRaid; winning opens a catch for the boss; losing makes the raid leave', timeout: 60000, fn: async T => {
  await T.start();
  await T.fastSpeech();
  await T.stay();
  const v = await T.ev(() => {
    const p = PLACES[S.place], bad = [];
    for (let k = 0; k < 300; k++) { const b = pickBoss(), s = SP[b.sp];
      if (b.place !== S.place || b.lvl !== p.lv + 4 || b.shown !== false) bad.push(JSON.stringify(b));
      else if (!s.leg && !(s.next == null && s.stage >= 2 && p.types.includes(s.t))) bad.push(s.n); }
    return bad.slice(0, 5);
  });
  T.ok(!v.length, 'pickBoss picks a final-stage boss of the place types (or a legendary) at place Lv+4: ' + v.join(', '));
  const boss = await T.ev(() => { S.raid = pickBoss(); S.raid.shown = true; updateUI(); return {...S.raid}; });
  await T.until(() => __TT.vis('#bRaid'), null, 'raid button appears', 2000);
  await forceClick(T, '#bRaid');
  await T.until(() => B && B.raid && !B.busy && __TT.vis('#sBattle'), null, 'raid battle ready', 8000);
  let r = await T.ev(() => ({hpMul: B.foes[0].hpMul, sp: B.foes[0].sp, lv: document.getElementById('fLv').innerText, items: {...S.items}}));
  T.eq(r.hpMul, 4, 'raid boss has 4x HP');
  T.eq(r.sp, boss.sp, 'boss species');
  T.ok(/raid boss/.test(r.lv), 'foe label says raid boss: ' + r.lv);
  await T.ev(() => { B.foes[0].hp = 1; renderBattle(); });
  await T.page.click('#bBtns button >> nth=0');
  await T.until(() => C && C.wd.raid && __TT.vis('#sCatch'), null, 'winning the raid opens a catch for the boss', 15000);
  const w = await T.ev(() => ({raid: S.raid, B: !!B, battleHidden: document.getElementById('sBattle').hidden, sp: C.wd.sp, lvl: C.wd.lvl, title: document.getElementById('catchTitle').innerText, items: {...S.items}, res: __TT.lastLog('battle_end')}));
  T.eq(w.raid, null, 'raid cleared after the win');
  T.ok(!w.B && w.battleHidden, 'battle closed');
  T.ok(w.sp === boss.sp && w.lvl === boss.lvl, 'catch target is the boss');
  T.ok(/Giant/.test(w.title), 'catch title says Giant: ' + w.title);
  T.ok(w.items.great >= r.items.great + 2 && w.items.ultra >= r.items.ultra + 1, 'raid reward given');
  T.ok(w.res && w.res.result === 'win' && w.res.raid === true, 'battle_end win logged');
  await forceCatch(T);
  await T.ev(() => { C.t0 = T + .55; ccv.focus(); });
  await T.page.keyboard.press('Space');
  await T.until(b => S.col.some(c => c.sp === b.sp && c.lvl === b.lvl), boss, 'the boss can be caught', 8000);
  await T.until(() => C === null, null, 'catch sheet closes', 4000);
  // losing
  await T.ev(() => { for (const c of S.col) c.hp = stats(c).maxhp; S.raid = pickBoss(); S.raid.shown = true; updateUI(); });
  await T.until(() => __TT.vis('#bRaid'), null, 'second raid button appears', 2000);
  await forceClick(T, '#bRaid');
  await T.until(() => B && B.raid && !B.busy, null, 'second raid battle ready', 8000);
  await T.ev(() => { party().forEach((c, i) => { c.hp = i === B.pi ? 1 : 0; }); renderBattle(); });
  await T.page.click('#bBtns button >> nth=1');
  await T.until(() => B === null && document.getElementById('sBattle').hidden, null, 'losing ends the raid battle', 15000);
  r = await T.ev(() => ({raid: S.raid, here: raidHere(), btn: __TT.vis('#bRaid'), res: __TT.lastLog('battle_end')}));
  T.eq(r.raid, null, 'the raid leaves after a loss');
  T.ok(!r.here && !r.btn, 'raid button hidden');
  T.ok(r.res && r.res.result === 'lose' && r.res.raid === true, 'battle_end lose logged');
}},

{name: '11 no word quizzes in catching/battles by default and no speaking prompts during play', timeout: 50000, fn: async T => {
  await T.start();
  const d = await T.ev(() => ({qc: S.qCatch, qb: S.qBattle}));
  T.ok(d.qc !== true && d.qb !== true, 'S.qCatch / S.qBattle are not on by default: ' + JSON.stringify(d));
  await T.ev(() => {
    window.__saw = {quiz: 0, say: 0};
    const chk = () => { if (!document.getElementById('quiz').hidden) __saw.quiz++; if (document.querySelector('.saycard')) __saw.say++; };
    new MutationObserver(chk).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']});
    const f = () => { chk(); requestAnimationFrame(f); }; f();
  });
  await T.stay();
  await T.spawn(3);
  await T.openCatchOn(0);
  await T.sleep(900); // a catch quiz would open 450 ms after the sheet
  T.ok(!(await T.ev(() => C.quizzing)), 'catch is not waiting on a quiz');
  await T.ev(() => ccv.focus());
  await T.page.keyboard.press('Space');
  await T.until(() => __TT.countLog('throw') >= 1, null, 'throw happens without a quiz', 2000);
  await T.sleep(1200);
  await T.ev(() => { if (C) endCatch(); });
  await T.fastSpeech();
  await T.page.click('#bGym');
  await T.until(() => B && !B.busy, null, 'gym battle ready', 8000);
  await T.ev(() => { if (window.__realTrace) window.traceChar = window.__realTrace; });
  await T.page.click('#bBtns button >> nth=0');
  // a move asks for a traced character (not a word quiz); closing the overlay resolves it and the move goes ahead
  await T.until(() => !!document.querySelector('.tracewrap .tracebox svg, .tracewrap .hw svg'), null, 'the move opens the character-tracing overlay', 3000);
  T.ok(!(await T.ev(() => !document.getElementById('quiz').hidden)), 'no word quiz opened');
  await T.ev(() => document.querySelectorAll('.tracewrap').forEach(x => x.remove()));
  await T.until(() => __TT.countLog('attack') >= 1, null, 'the move is used after the trace', 6000);
  await T.until(() => !B || !B.busy, null, 'turn finishes', 12000);
  await T.ev(() => { if (B) endBattle(); });
  // settings show both quiz toggles off
  await T.page.click('#bSet');
  const tg = await T.ev(() => [...document.querySelectorAll('#setList .toggle')].map(t => t.innerText.replace(/\s+/g, ' ')));
  T.ok(!tg.some(t => /quiz/i.test(t)) && !(await T.ev(() => S.qCatch === true || S.qBattle === true)), 'no word-quiz toggles and quizzes off: ' + JSON.stringify(tg));
  await T.page.click('#sSet [data-close]');
  const saw = await T.ev(() => ({...__saw}));
  T.eq(saw.quiz, 0, 'word quiz frames seen during play');
  T.eq(saw.say, 0, 'speaking prompt (.saycard) frames seen during play');
  // positive control: the monitor does see a quiz when the option is on
  await T.ev(() => { S.qCatch = true; S.trace = false; }); // the legacy quiz only runs when the catch spell is off
  await T.openCatchOn(0);
  await T.until(() => __saw.quiz > 0 && __TT.vis('#quiz'), null, 'quiz appears once S.qCatch is turned on (monitor sanity check)', 3000);
}},

{name: '12 runLesson opens the lesson sheet and records phrase progress in S.ph', timeout: 40000, fn: async T => {
  await T.start();
  await T.fastSpeech();
  await T.skipRings();
  await T.page.click('#bLearn');
  await T.until(() => __TT.vis('#sLearn'), null, 'Learn sheet opens');
  await T.page.click('#bPractice');
  await T.until(() => { const l = document.querySelector('.sheet.lesson'); return l && !l.hidden; }, null, 'lesson sheet opens', 3000);
  const r0 = await T.ev(() => ({open: sheetOpen(), learn: document.getElementById('sLearn').hidden, step: document.getElementById('lsStep').textContent, first: PHRASEBOOK[0].zh, ph: S.ph ? Object.keys(S.ph).filter(k => S.ph[k].intro).length : 0}));
  T.eq(r0.open, 'talk', 'sheetOpen() reports the lesson');
  T.ok(r0.learn, 'Learn sheet closed under the lesson');
  T.ok(/^1 \/ \d+$/.test(r0.step), 'step counter: ' + r0.step);
  T.eq(r0.ph, 0, 'no phrases introduced yet');
  await T.until(z => S.ph && S.ph[z] && S.ph[z].intro && S.ph[z].n === 1, r0.first, `first phrase ${r0.first} is recorded in S.ph`, 15000);
  const p1 = await T.ev(z => ({...S.ph[z], now: Date.now()}), r0.first);
  T.ok(p1.lvl === 1 && p1.due > p1.now, 'phrase gets a recall interval: ' + JSON.stringify(p1));
  await T.until(z => { try { const d = JSON.parse(localStorage.getItem('couchcatch2')); return d.ph && d.ph[z] && d.ph[z].n === 1; } catch (e) { return false; } }, r0.first, 'phrase progress saved to localStorage', 3000);
  // advance to the first recall question and answer "I got it"
  await T.until(() => document.querySelector('#lsBtns button.big'), null, 'recall prompt shows "I got it"', 15000);
  const z = await T.ev(() => document.querySelector('#lsStage .bigzh').textContent);
  const n0 = await T.ev(z => S.ph[z].n, z);
  await T.page.click('#lsBtns button.big');
  await T.until(({z, n0}) => S.ph[z].n === n0 + 1 && S.ph[z].lvl >= 2, {z, n0}, `answering advances recall progress for ${z}`, 3000);
  await T.page.click('.sheet.lesson [data-a=quit]');
  await T.until(() => document.querySelector('.sheet.lesson').hidden, null, 'Stop closes the lesson');
}},

{name: "13 Gym opens the conversation first; options need select + confirm; only correct options are offered", init: DLG_FIXTURE, talk: ['gym_backyard'], timeout: 50000, fn: async T => {
  await T.start();
  await T.fastSpeech();
  const D = await T.ev(() => typeof DIALOGUES !== 'undefined' && DIALOGUES.gym_backyard ? {fixture: DIALOGUES.gym_backyard === window.__DLG_GYM, you: DIALOGUES.gym_backyard.turns.filter(t => t.you).length,
    wrong: DIALOGUES.gym_backyard.turns.some(t => (t.you || []).some(o => !o.ok))} : null);
  if (!D) { T.note("build's DIALOGUES has no 'gym_backyard'; skipped"); return; }
  T.note(D.fixture ? "build has no gym_backyard dialogue; tested the conversation engine with a fixture" : `using the build's gym_backyard dialogue (${D.you} answers)`);
  await T.page.click('#bGym');
  await T.until(() => __TT.vis('.sheet.talk'), null, 'Gym opens the conversation sheet (.sheet.talk)', 3000);
  T.ok(await T.ev(() => B === null && document.getElementById('sBattle').hidden), 'the battle has not started yet');
  const r = await T.talkThrough({wrongFirst: true, checkArm: true});
  T.eq(r.key, 'gym_backyard', 'conversation key');
  T.eq(r.answered, D.you, 'answers given');
  T.ok(!r.recast, 'only correct options are offered, so nothing needs a recast');
  await T.until(() => B && __TT.vis('#sBattle') && document.querySelector('.sheet.talk').hidden, null, 'the gym battle starts after the conversation', 5000);
  T.eq(await T.ev(() => S.talked && S.talked.gym_backyard), 1, 'conversation recorded in S.talked');
  const ph = await T.ev(() => Object.keys(S.ph || {}).length);
  T.ok(ph > 0, 'answers were recorded as heard phrases in S.ph');
  await T.until(() => B && !B.busy, null, 'battle intro done', 8000);
  await T.ev(() => endBattle());
  await T.until(() => B === null, null, 'battle closed');
  await T.page.click('#bGym');
  await T.until(() => __TT.vis('.sheet.talk'), null, 'every Gym visit opens a conversation again', 3000);
  T.ok(await T.ev(() => B === null), 'the battle waits for the conversation the second time too');
}},

{name: "13b picking a starter opens the neighbor's conversation; finishing it returns to play", talk: ['intro_neighbor'], timeout: 50000, fn: async T => {
  const has = await T.ev(() => typeof DIALOGUES !== 'undefined' && !!DIALOGUES.intro_neighbor);
  if (!has) { T.note("build has no 'intro_neighbor' dialogue; skipped"); return; }
  await T.fastSpeech();
  await T.start();
  await T.until(() => __TT.vis('.sheet.talk'), null, 'neighbor conversation opens after the starter pick', 3000);
  const orbs = await T.ev(() => S.items.orb);
  const r = await T.talkThrough({wrongFirst: true});
  T.eq(r.key, 'intro_neighbor', 'conversation key');
  const s = await T.ev(() => ({talked: (S.talked || {}).intro_neighbor, orbs: S.items.orb, rw: DIALOGUES.intro_neighbor.reward || null, open: sheetOpen()}));
  T.eq(s.talked, 1, 'S.talked.intro_neighbor');
  if (s.rw && s.rw.orb) T.eq(s.orbs, orbs + s.rw.orb, 'conversation reward');
  T.eq(s.open, null, 'no sheet left open');
  await T.stay();
  await T.until(() => wild.length >= 1, null, 'play continues: a creature arrives', 5000);
}},

{name: '14b every conversation and reading line plays from recordings, never the device voice', fn: async T => {
  const r = await T.ev(() => {
    const lines = [];
    const walk = (node, where) => { if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach((x, i) => walk(x, where)); return; }
      if (node.ok === false) return; // wrong options are never shown, so never spoken
      if (typeof node.zh === 'string' && /[\u3400-\u9fff]/.test(node.zh)) lines.push([where, node.zh]);
      for (const [k, v] of Object.entries(node)) if (k !== 'zh') walk(v, where); };
    for (const [id, d] of Object.entries(window.DIALOGUES || {})) walk(d, 'dialogue ' + id);
    for (const rd of [].concat(window.READINGS || [])) for (const l of rd.lines || []) lines.push(['reading ' + rd.id, l.w.map(t => t[0]).join('')]);
    const plans = {}; const device = [];
    for (const [where, zh] of lines) { const p = zhPlan(zh); plans[p] = (plans[p] || 0) + 1; if (p === 'device') device.push(where + ': ' + zh); }
    return {n: lines.length, plans, device: device.slice(0, 20), nDevice: device.length};
  });
  T.note(r.n + ' lines: ' + JSON.stringify(r.plans));
  T.ok(r.n > 500, 'found the conversation and reading lines (' + r.n + ')');
  T.ok(!r.nDevice, r.nDevice + ' lines would use the device voice: ' + r.device.join(' / '));
}},
{name: '14 Chinese audio: ZH_AUDIO has 你好 and every species name', fn: async T => {
  const r = await T.ev(async () => {
    const norm = s => String(s).replace(/[\s，。！？、…!?,.·:：；;"“”'‘’()（）「」\-—]/g, '');
    const idx = {}; for (const k in ZH_AUDIO) idx[norm(k)] = k;
    const key = s => (ZH_AUDIO[s] ? s : idx[norm(s)]) || null;
    const noName = SP.filter(s => !ZS(s.n).zh).map(s => s.n);
    // the first 55 species must have a recorded name; species added later are reported until their clips are recorded
    const noClip = SP.filter((s, i) => i < 55 && ZS(s.n).zh && !key(ZS(s.n).zh)).map(s => s.n + ' ' + ZS(s.n).zh);
    const noClipNew = SP.filter((s, i) => i >= 55 && ZS(s.n).zh && !key(ZS(s.n).zh)).map(s => s.n + ' ' + ZS(s.n).zh);
    const partial = SP.filter((s, i) => i < 55 && ZS(s.n).zh && segs(ZS(s.n).zh).join('') !== ZS(s.n).zh).map(s => s.n + ' ' + ZS(s.n).zh + ' -> ' + segs(ZS(s.n).zh).join('|'));
    const ctx = new OfflineAudioContext(1, 22050, 22050), bad = [];
    const keys = ['你好', ...new Set(SP.map(s => key(ZS(s.n).zh)).filter(Boolean))];
    for (const k of keys) {
      const uri = ZH_AUDIO[k];
      if (!/^data:audio\//.test(uri || '')) { bad.push(k + ': not a data:audio URI'); continue; }
      try { const bin = atob(uri.slice(uri.indexOf(',') + 1)), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        const b = await ctx.decodeAudioData(u.buffer); if (!(b.duration > 0.1)) bad.push(k + ': duration ' + b.duration); } catch (e) { bad.push(k + ': ' + e); }
    }
    return {nihao: '你好' in ZH_AUDIO, noName, noClip, noClipNew, partial, bad, n: keys.length, sp: SP.length};
  });
  T.ok(r.nihao, "ZH_AUDIO['你好'] exists");
  T.ok(!r.noName.length, 'species without a Chinese name: ' + r.noName.join(', '));
  T.ok(!r.noClip.length, 'species names without a clip: ' + r.noClip.join(', '));
  T.ok(!r.partial.length, 'species names only partly covered by clips: ' + r.partial.join(', '));
  T.ok(!r.bad.length, 'clips that fail to decode: ' + r.bad.join(', '));
  T.note(`${r.n} clips decoded (你好 + ${r.sp} species names)`);
  if (r.noClipNew.length) T.note('newer species still without a recorded name: ' + r.noClipNew.join(', '));
}},

{name: '15 layout at 360x629: main screen, catch sheet and battle sheet fit', timeout: 50000, fn: async T => {
  await T.start();
  await T.fastSpeech();
  await T.sleep(200);
  await T.layoutOk('#app', 'main screen, arrived');
  await T.stay();
  await T.spawn(3);
  // busiest main screen: raid + rift banners, streak chip, long status
  await T.ev(() => { S.streak = 7; S.raid = pickBoss(); S.raid.shown = true; S.rift = {place: S.place, shown: true}; updateUI(); });
  await T.sleep(200);
  await T.layoutOk('#app', 'main screen, staying with raid and rift banners');
  await T.openCatchOn(0);
  await T.layoutOk('#sCatch', 'catch sheet');
  await T.ev(() => endCatch());
  // long title: shiny legendary with the longest name
  await T.ev(() => { let li = LEGS[0]; for (const i of LEGS) if (SP[i].n.length > SP[li].n.length) li = i; S.items.great = 12; S.items.ultra = 10; S.items.berry = 10;
    openCatch({sp: li, lvl: 36, shiny: true, x: .5, y: .7, vx: 0, ph: 0, raid: true}); });
  await T.until(() => C && __TT.vis('#sCatch'), null, 'legendary catch open');
  await T.sleep(120);
  await T.layoutOk('#sCatch', 'catch sheet, giant shiny legendary');
  await T.ev(() => endCatch());
  await T.page.click('#bGym');
  await T.until(() => B && !B.busy && __TT.vis('#sBattle'), null, 'battle ready', 8000);
  await T.sleep(100);
  await T.layoutOk('#sBattle', 'battle sheet');
  await T.ev(() => endBattle());
  // longest names in a battle: give the party the longest-named species and go to the Rift gym
  await T.ev(() => { let li = 0; SP.forEach((s, i) => { if (s.n.length > SP[li].n.length) li = i; }); S.col.unshift(mk(li, 40)); S.place = 6; S.mode = 'arrived'; updateUI(); startGym(); });
  await T.until(() => B && !B.busy, null, 'rift battle ready', 8000);
  await T.sleep(100);
  await T.layoutOk('#sBattle', 'battle sheet, Rift gym with the longest names');
}},

{name: '16 LOG events never contain nested arrays (including the pushed log payload)', timeout: 50000, fn: async T => {
  await T.start();
  await T.fastSpeech();
  await T.stay();
  await T.spawn(2);
  await T.openCatchOn(0);
  await T.ev(() => ccv.focus());
  await T.page.keyboard.press('Space');
  await T.until(() => __TT.countLog('throw_hit') + __TT.countLog('throw_miss') >= 1, null, 'throw resolves', 3000);
  await T.sleep(400);
  await T.ev(() => { if (C) endCatch(); S.col.push(mk(IDX.Finnow, 6)); });
  await T.page.click('#bGym');
  await T.until(() => B && !B.busy, null, 'battle ready', 8000);
  await T.page.click('#bBtns button >> nth=0');
  await T.until(() => __TT.countLog('attack') >= 1 && (!B || !B.busy), null, 'turn done', 12000);
  await T.ev(() => { if (B) endBattle(); });
  await goTo(T, 1);
  await T.ev(() => { evoQueue.length = 0; const c = S.col[0]; c.lvl = 17; c.xp = 0; gainXP(c, 17 * 15); });
  const types = await T.ev(() => [...new Set(LOGBUF.map(e => e.type))]);
  for (const t of ['page_open', 'starter', 'stay', 'spawn', 'catch_open', 'throw', 'catch_close', 'battle_start', 'attack', 'travel', 'arrive', 'levelup'])
    T.ok(types.includes(t), `LOG has a ${t} event (have: ${types.join(',')})`);
  const issues = await T.ev(() => __TT.logIssues());
  T.ok(!issues.length, 'nested arrays: ' + issues.join(', '));
  // push the log through flushLog with a fake cloud store and inspect the document it writes
  const pushed = await T.ev(async () => {
    const docs = []; DB = {doc: p => ({set: async o => { docs.push({p, o: JSON.parse(JSON.stringify(o))}); }})}; const uid0 = UID; UID = 'u_test';
    try { await flushLog(); } finally { DB = null; UID = uid0; }
    const d = docs.find(x => x.p.startsWith('logs/u_test/chunks/'));
    return d ? {n: d.o.events.length, nested: __TT.nested(d.o)} : null;
  });
  T.ok(pushed && pushed.n > 0, 'flushLog wrote a log document');
  T.ok(!pushed.nested.length, 'pushed log document has nested arrays: ' + pushed.nested.join(', '));
}},

{name: '17 no visible text anywhere contains "undefined" or "NaN"', timeout: 60000, fn: async T => {
  const bad = [];
  const check = async (label) => { const b = await T.ev(() => __TT.badText()); if (b.length) bad.push(label + ': ' + b.slice(0, 2).map(s => JSON.stringify(s)).join(' ')); };
  await check('starter picker');
  await T.start();
  await T.fastSpeech();
  await check('main, arrived');
  // one of every species (shiny every other), so the team list and creature book show all names
  await T.ev(() => { SP.forEach((s, i) => { const c = mk(i, 5 + (i % 30), i % 2 === 0); if (i % 5 === 0) c.hp = 0; S.col.push(c); }); S.streak = 4; save(); updateUI(); });
  for (const [btn, sheet] of [['#bTeam', '#sTeam'], ['#bQuest', '#sQuest'], ['#bBag', '#sBag'], ['#bLearn', '#sLearn'], ['#bSet', '#sSet'], ['#bMove', '#sMap']]) {
    await T.page.click(btn);
    await T.until(s => __TT.vis(s), sheet, sheet + ' opens');
    await check(sheet);
    await T.page.click(sheet + ' [data-close]');
  }
  await T.stay();
  await T.spawn(3);
  await check('main, staying');
  await T.openCatchOn(0);
  await check('catch sheet');
  await T.ev(() => ccv.focus());
  await T.page.keyboard.press('Space');
  await T.sleep(1500);
  await check('catch sheet after a throw');
  await T.ev(() => { if (C) endCatch(); });
  await T.page.click('#bGym');
  await T.until(() => B && !B.busy, null, 'battle ready', 8000);
  await check('battle sheet');
  await T.page.click('#bBtns button >> nth=3');
  await check('battle switch menu');
  await T.ev(() => renderBattle());
  await T.page.click('#bBtns button >> nth=0');
  await T.until(() => __TT.countLog('attack') >= 2 || (B && !B.busy && __TT.countLog('attack') >= 1), null, 'attacks happen', 12000);
  await check('battle after attacks');
  await T.until(() => !B || !B.busy, null, 'turn done', 12000);
  await T.ev(() => { if (B) endBattle(); });
  await T.ev(() => { S.raid = pickBoss(); S.raid.shown = true; S.rift = {place: S.place, shown: true}; updateUI(); });
  await check('main with raid and rift banners');
  await T.ev(() => { travel(2); });
  await T.until(() => S.mode === 'travel', null, 'travelling');
  await check('main, travelling');
  await T.ev(() => { travelT = 1; });
  await T.until(() => S.mode === 'arrived', null, 'arrived');
  await check('main, arrived at a new place');
  await T.ev(() => { evoQueue.length = 0; const c = S.col.find(c => SP[c.sp].next != null); c.lvl = SP[c.sp].evoLv; evoQueue.push(c.id); runEvoQueue(); });
  await T.until(() => E && __TT.vis('#sEvo'), null, 'evolution sheet', 3000);
  await check('evolution sheet');
  await T.ev(() => { E.t0 = T - 5; });
  await T.until(() => !document.getElementById('bEvoOk').hidden, null, 'evolution done', 3000);
  await check('evolution done');
  await T.page.click('#bEvoOk');
  await T.ok(!bad.length, 'bad visible text: ' + bad.join(' || '));
}},


{name: '18 owed conversations survive a reload: the intro, a first-arrival chat and the badge interview come back (B1/W5/W9)', talk: ['intro_neighbor', 'arrive_sandiego', 'interview_1'], timeout: 100000, fn: async T => {
  const has = await T.ev(() => ['intro_neighbor', 'arrive_sandiego', 'interview_1'].every(k => DIALOGUES[k]));
  if (!has) { T.note('build lacks one of the dialogues; skipped'); return; }
  const talking = () => T.ev(() => { const t = document.querySelector('.sheet.talk'); return t && !t.hidden ? __TT.lastLog('talk_start').key : null; });
  await T.fastSpeech();
  await T.start();
  await T.until(() => __TT.vis('.sheet.talk'), null, 'the intro opens after the starter', 5000);
  T.eq(await talking(), 'intro_neighbor', 'first conversation');
  // the app is closed in the middle of the chat
  await T.ev(() => flush());
  await T.reload(); await T.fastSpeech();
  await T.until(() => __TT.vis('.sheet.talk'), null, 'after a reload the intro comes back', 6000);
  T.eq(await talking(), 'intro_neighbor', 'conversation after the reload');
  await T.talkThrough();
  T.eq(await T.ev(() => (S.talked || {}).intro_neighbor), 1, 'the intro is recorded once finished');
  // first arrival in San Diego: the chat waits for "到达…" to finish, and stays owed until played through
  await T.ev(() => { window.speakAsync = z => /^到达/.test(z) ? new Promise(r => setTimeout(() => { window.__arrEnd = Date.now(); r(); }, 1200)) : Promise.resolve(); });
  await goTo(T, 7);
  await T.until(() => __TT.vis('.sheet.talk'), null, 'the San Diego welcome chat opens', 6000);
  T.eq(await talking(), 'arrive_sandiego', 'arrival chat');
  const tm = await T.ev(() => ({end: window.__arrEnd, start: __TT.lastLog('talk_start').at}));
  T.ok(tm.end && tm.start >= tm.end, `the chat starts after the arrival line ends (line ended ${tm.end}, chat ${tm.start})`);
  await T.ev(() => flush());
  await T.reload(); await T.fastSpeech();
  await T.until(() => __TT.vis('.sheet.talk'), null, 'after a reload the arrival chat comes back', 6000);
  T.eq(await talking(), 'arrive_sandiego', 'arrival chat after the reload');
  await T.talkThrough();
  T.eq(await T.ev(() => (S.talked || {}).arrive_sandiego), 1, 'arrival chat recorded');
  // the interview after a new badge
  await T.ev(() => { S.pendingInterview = true; S.interviews = 0; endBattle(); });
  await T.until(() => __TT.vis('.sheet.talk'), null, 'the interview opens after the badge', 5000);
  T.eq(await talking(), 'interview_1', 'interview');
  await T.ev(() => flush());
  await T.reload(); await T.fastSpeech();
  await T.until(() => __TT.vis('.sheet.talk'), null, 'after a reload the interview comes back', 6000);
  T.eq(await talking(), 'interview_1', 'interview after the reload');
  await T.talkThrough();
  const s = await T.ev(() => ({p: S.pendingInterview, n: S.interviews, t: S.talked.interview_1}));
  T.ok(!s.p && s.n === 1 && s.t === 1, 'the interview is done once played through: ' + JSON.stringify(s));
  await T.sleep(1500);
  T.ok(!(await T.ev(() => __TT.vis('.sheet.talk'))), 'nothing more is owed');
}},

{name: '19 a road trip waits while the catch spell or the catch is open; a catch never opens for a creature that left (W1)', timeout: 50000, fn: async T => {
  await T.start();
  await T.ev(() => { window.traceChar = window.__realTrace; });
  await T.ev(() => { travel(1); });
  await T.until(() => S.mode === 'travel', null, 'the trip starts');
  await T.ev(() => { travelT = .5; roadSpawns.forEach(r => { r.done = true; }); const w = spawnWild(true); w.x = .6; w.vx = -.07; wild.push(w); window.__wd = w; openCatch(w); });
  await T.until(() => !!document.querySelector('.tracewrap'), null, 'a road creature opens the catch spell first', 3000);
  const a = await T.ev(() => ({t: travelT, x: __wd.x}));
  await T.sleep(1500);
  const b = await T.ev(() => ({t: travelT, x: __wd.x, mode: S.mode, open: sheetOpen()}));
  T.eq(b.t, a.t, 'trip progress while the trace is open');
  T.eq(b.x, a.x, 'the road creature waits too');
  T.eq(b.mode, 'travel', 'still on the road');
  T.eq(b.open, 'trace', 'sheetOpen() reports the trace');
  await T.ev(() => document.querySelectorAll('.tracewrap').forEach(x => x.remove()));
  await T.until(() => C && __TT.vis('#sCatch'), null, 'the catch screen opens after the spell', 3000);
  const c0 = await T.ev(() => travelT);
  await T.sleep(800);
  T.eq(await T.ev(() => travelT), c0, 'trip progress while the catch screen is open');
  await T.ev(() => endCatch());
  await T.until(t => travelT > t, c0, 'the trip goes on once the catch is closed', 3000);
  // the creature leaves the field while its spell is traced: no catch screen for it
  await T.ev(() => { const w = spawnWild(true); w.x = .5; w.vx = 0; wild.push(w); window.__wd2 = w; openCatch(w); });
  await T.until(() => !!document.querySelector('.tracewrap'), null, 'the second spell opens', 3000);
  await T.ev(() => { wild = wild.filter(x => x !== __wd2); document.querySelectorAll('.tracewrap').forEach(x => x.remove()); });
  await T.sleep(1000);
  const d = await T.ev(() => ({C: !!C, open: __TT.vis('#sCatch'), gone: __TT.countLog('catch_gone')}));
  T.ok(!d.C && !d.open && d.gone === 1, 'no catch screen for a creature that left the field: ' + JSON.stringify(d));
  T.ok(!(await T.ev(() => { openCatch({sp: 0, lvl: 3, x: .5, y: .7, vx: 0, ph: 0}); return !!C; })), 'openCatch ignores a creature that is not on the field');
}},

{name: '20 importing a save code replaces everything, including the field and the trip; "Tap again" times out (W2/W15)', timeout: 60000, fn: async T => {
  await T.start();
  // the saved game: on the road to Lakeshore with a creature crossing
  await T.ev(() => { travel(1); });
  await T.until(() => S.mode === 'travel', null, 'the trip starts');
  await T.ev(() => { travelT = .4; roadSpawns.forEach(r => { r.done = true; }); wild = []; const w = spawnWild(true); w.x = .7; wild.push(w); S.items.orb = 77; });
  await T.page.click('#bSet');
  await T.page.click('#svCopy');
  const code = await T.ev(() => document.getElementById('svText').value);
  const exp = await T.ev(() => ({to: travelTo, t: travelT, wild: wild.map(w => w.sp + ':' + w.lvl)}));
  T.ok(/^CC1:/.test(code), 'save code made');
  await T.page.click('#sSet [data-close]');
  // this device: arrived and staying, other creatures on the field
  await T.ev(() => { travelT = 1; });
  await T.until(() => S.mode === 'arrived' && S.place === 1, null, 'arrived');
  await T.ev(() => { S.items.orb = 5; });
  await T.stay(); await T.spawn(3);
  const here = await T.ev(() => wild.map(w => w.sp + ':' + w.lvl));
  await T.page.click('#bSet');
  await T.page.fill('#svText', code);
  await T.page.click('#svLoad');
  T.eq(await T.ev(() => document.getElementById('svLoad').textContent), 'Tap again', 'the first tap asks');
  await T.sleep(4400);
  T.eq(await T.ev(() => document.getElementById('svLoad').textContent), 'Load', 'the button goes back to "Load" after 4 s');
  await T.page.click('#svLoad');
  await T.waitReload(() => T.page.click('#svLoad'));
  await T.sleep(200);
  const r = await T.ev(() => ({mode: S.mode, to: travelTo, t: travelT, wild: wild.map(w => w.sp + ':' + w.lvl), orbs: S.items.orb, st: document.getElementById('status').innerText}));
  T.eq(r.mode, 'travel', 'mode from the save');
  T.eq(r.to, exp.to, 'trip destination from the save');
  T.ok(Math.abs(r.t - exp.t) < .2, `trip progress from the save (${r.t} vs ${exp.t})`);
  T.eq(r.wild.join(','), exp.wild.join(','), `field from the save, not this device's (${here.join(',')})`);
  T.eq(r.orbs, 77, 'items from the save');
  T.ok(/Traveling to Lakeshore/.test(r.st), 'status: ' + r.st);
}},

{name: '21 Stop ends the Speak lesson at once: no more audio and nothing more recorded (W3)', timeout: 45000, fn: async T => {
  await T.start();
  await T.ev(() => { window.__calls = []; window.speakAsync = z => { __calls.push([performance.now(), z]); return new Promise(r => setTimeout(r, 300)); }; });
  await T.ev(() => { runLesson(); });
  await T.until(() => /whole thing/.test((document.querySelector('#lsStage') || {}).innerText || ''), null, 'the lesson reaches "say the whole thing"', 25000);
  await T.sleep(200);
  const said = () => Object.keys(S.ph || {}).filter(k => S.ph[k].intro).length;
  const before = await T.ev(said);
  await T.page.click('.sheet.lesson [data-a=quit]');
  const t0 = await T.ev(() => performance.now());
  await T.sleep(5000);
  const after = await T.ev(({t0, said}) => ({calls: __calls.filter(c => c[0] > t0).map(c => c[1]), said: Object.keys(S.ph || {}).filter(k => S.ph[k].intro).length, hidden: document.querySelector('.sheet.lesson').hidden}), {t0});
  T.ok(after.hidden, 'the lesson is closed');
  T.eq(after.calls.length, 0, 'audio after Stop: ' + after.calls.join(' '));
  T.eq(after.said, before, 'phrases recorded as said after Stop');
  // a new lesson starts cleanly and records its first phrase
  await T.skipRings();
  await T.ev(() => { runLesson(); });
  await T.until(n => Object.keys(S.ph || {}).filter(k => S.ph[k].intro).length > n, before, 'a new lesson after Stop works', 15000);
  await T.page.click('.sheet.lesson [data-a=quit]');
}},

{name: '22 story: the Starveil rift stays open at Yosemite until Little Star is home; no goal toast for a goal already met (W4/W10)', timeout: 50000, fn: async T => {
  await T.start();
  await T.ev(() => { window.__toasts = []; const o = window.toast; window.toast = toast = m => { __toasts.push(m); return o(m); }; });
  // W10: the Backyard badge is already won when the neighbor's chapter ends
  await T.ev(() => { S.col.push(mk(IDX.Barkpup, 8), mk(IDX.Clovehop, 8)); S.badges = [0]; S.talked = {intro_neighbor: 1, story_1: 1}; S.story = {ch: 0, t: {}}; });
  await T.until(() => S.story.ch === 1, null, 'chapter 1 counted as done', 3000);
  await T.sleep(300);
  T.ok(!(await T.ev(() => __toasts.some(m => /New goal: Beat Coach Mira/.test(m)))), 'no "Beat Coach Mira" goal when that badge is already won');
  await T.ev(() => { S.talked.story_2 = 1; });
  await T.until(() => __toasts.some(m => /New goal: Go to the Lakeshore/.test(m)), null, 'a goal still to do is announced', 3000);
  // W4: after chapter 7 the rift is at Yosemite, and leaving does not close it
  await T.ev(() => { for (let i = 1; i <= 7; i++) S.talked['story_' + i] = 1; S.place = 10; S.mode = 'arrived'; S.rift = null; updateUI(); });
  await T.until(() => S.story.ch === 7 && S.rift && S.rift.place === 10, null, 'the story rift is at Yosemite', 3000);
  await T.until(() => riftHere() && __TT.vis('#bRift'), null, 'rift banner at Yosemite', 2000);
  await goTo(T, 9);
  T.ok(await T.ev(() => !!(S.rift && S.rift.place === 10)), 'the rift stays after leaving Yosemite');
  await goTo(T, 10);
  T.ok(await T.ev(() => riftHere()), 'back at Yosemite the way into the Starveil is still open');
  // a save where leaving Yosemite had already closed it gets it back
  await T.ev(() => { S.rift = null; });
  await T.until(() => S.rift && S.rift.place === 10 && S.rift.story, null, 'a lost story rift comes back', 3000);
  // once Little Star is home it is an ordinary rift again
  await T.ev(() => { S.talked.story_8 = 1; });
  await T.until(() => S.story.ch === 8 && S.rift && !S.rift.story, null, 'an ordinary rift after chapter 8', 3000);
}},

{name: '23 catch screen: hints in Chinese with recordings, spoken; the spell button resets after a throw; no spell without orbs (V1/W7/W17)', timeout: 50000, fn: async T => {
  await T.start();
  const plans = await T.ev(() => ['drag', 'flick', 'spin', 'again', 'spellagain', 'noorbs', 'broke', 'fled', 'short', 'over', 'wide'].map(k => [k, W[k][1], zhPlan(W[k][1]), W[k][2]]));
  for (const [k, zh, plan, py] of plans) { T.ok(plan === 'whole' || plan === 'clauses', `catch hint "${k}" ${zh} plays from recordings (plan: ${plan})`); T.ok(/[a-zü]/i.test(py || ''), `catch hint "${k}" has pinyin`); }
  await T.stay(); await T.spawn(2);
  await T.ev(() => { window.__said = []; window.speakAsync = z => { __said.push(z); return Promise.resolve(); }; });
  await T.openCatchOn(0);
  let r = await T.ev(() => ({spell: C.spell, btn: document.getElementById('bSpell').innerText}));
  T.ok(r.spell && /ready/.test(r.btn), 'the spell is ready before the throw: ' + r.btn);
  // let go without flicking up: the Chinese hint shows, is spoken, and the swipe cue is drawn
  const g = await T.ev(() => { const g = cGeom(), rc = ccv.getBoundingClientRect(); return {x: rc.left + g.rest.x, y: rc.top + g.rest.y}; });
  await T.page.mouse.move(g.x, g.y); await T.page.mouse.down(); await T.page.mouse.move(g.x + 30, g.y + 6, {steps: 3}); await T.page.mouse.up();
  await T.until(() => /然后往上扔/.test(document.getElementById('catchMsg').innerText), null, 'the flick hint shows in Chinese', 2000);
  T.ok(await T.ev(() => __said.includes(W.flick[1]) && C.hintT > 0), 'the flick hint is spoken and the swipe cue is on');
  // no throw for a while: the drag hint comes by itself
  await T.ev(() => { C.aimT = T - 20; C.hinted = false; C.hintSaid = -9; __said.length = 0; });
  await T.until(() => /把球往上扔/.test(document.getElementById('catchMsg').innerText), null, 'after a while without a throw the drag hint shows', 3000);
  await T.until(() => __said.includes(W.drag[1]), null, 'and is spoken', 3000);
  // V1: once the throw lands, the spell is used up and the button says so
  await forceCatch(T);
  await T.ev(() => ccv.focus());
  await T.page.keyboard.press('Space');
  await T.until(() => C && (C.phase === 'shake' || C.phase === 'result'), null, 'the throw lands', 4000);
  r = await T.ev(() => ({spell: C.spell, btn: document.getElementById('bSpell').innerText}));
  T.ok(!r.spell && !/ready/.test(r.btn), 'spell button after the throw: ' + r.btn);
  await T.until(() => C === null, null, 'the catch screen closes', 5000);
  // W7: no orbs, no spell
  await T.ev(() => { S.items.orb = 0; S.items.great = 0; S.items.ultra = 0; __said.length = 0; window.__tr = 0; const t = window.traceChar; window.traceChar = (...a) => { __tr++; return t(...a); }; openCatch(wild[0]); });
  await T.until(() => C && __TT.vis('#sCatch'), null, 'the catch screen opens without orbs', 3000);
  r = await T.ev(() => ({dis: document.getElementById('bSpell').disabled, msg: document.getElementById('catchMsg').innerText, tr: __tr}));
  T.ok(r.dis, 'Spell is disabled with no orbs');
  T.eq(r.tr, 0, 'spell traces opened with no orbs');
  T.ok(/没有球了/.test(r.msg), 'the out-of-orbs line is in Chinese: ' + r.msg);
  await T.ev(() => castSpell());
  T.eq(await T.ev(() => __tr + (document.querySelector('.tracewrap') ? 1 : 0)), 0, 'casting does nothing without orbs');
  await T.until(() => __said.includes(W.noorbs[1]), null, 'the out-of-orbs line is spoken', 3000);
}},

{name: '24 the daily Chinese quest counts lines said in conversations and lessons and traced characters (W8); phrase counts agree (W16)', talk: ['intro_neighbor'], timeout: 80000, fn: async T => {
  await T.fastSpeech();
  await T.start();
  await T.ev(() => { ensureQuests(); const w = S.quests.list.find(x => x.k === 'words'); w.goal = 99; w.prog = 0; });
  const txt = await T.ev(() => qText(S.quests.list.find(x => x.k === 'words')));
  T.ok(/Say or write 99 things in Chinese/.test(txt) && /shuō yi shuō/.test(txt), 'the quest says what counts: ' + txt);
  const prog = () => T.ev(() => S.quests.list.find(x => x.k === 'words').prog);
  await T.until(() => __TT.vis('.sheet.talk'), null, 'the intro opens', 5000);
  const tr = await T.talkThrough();
  T.eq(await prog(), tr.answered, 'one per answer said in the conversation');
  let p = await prog();
  await T.skipRings();
  await T.ev(() => { runLesson(); });
  await T.until(p => S.quests.list.find(x => x.k === 'words').prog > p, p, 'a phrase said in the Speak lesson counts', 20000);
  await T.page.click('.sheet.lesson [data-a=quit]');
  p = await prog();
  await T.ev(() => { window.__realTrace('fire', {purpose: 'move'}); });
  await T.traceReal();
  T.eq(await prog(), p + 1, 'a traced character counts');
  await T.page.click('#bLearn');
  const r = await T.ev(() => ({tile: [...document.querySelectorAll('.ptiles .pt')].find(e => /phrases said/.test(e.innerText)).querySelector('b').textContent,
    head: [...document.querySelectorAll('#learnList .reghead')].map(h => h.innerText).find(t => /说过的句子/.test(t))}));
  T.ok(+r.tile >= 1 && r.head && r.head.includes('· ' + r.tile + ' /'), `the "phrases said" tile (${r.tile}) agrees with the phrase list ("${r.head}")`);
}},

{name: '25 small fixes: raid toast, Rift map labels, door knock on a trip, player names, plurals (W6/W11-W14/W18)', timeout: 60000, fn: async T => {
  await T.start();
  await T.ev(() => { window.__toasts = []; const o = window.toast; window.toast = toast = m => { __toasts.push(m); return o(m); }; });
  await T.stay();
  await T.ev(() => { S.raid = pickBoss(); S.raid.shown = false; raidAt = 1e9; });
  await goTo(T, 1);
  T.ok(!(await T.ev(() => __toasts.some(m => /raid ended/.test(m)))), 'no "the raid ended" for a raid that never showed up');
  await T.stay();
  await T.ev(() => { S.raid = pickBoss(); S.raid.shown = true; updateUI(); });
  await goTo(T, 0);
  T.ok(await T.ev(() => __toasts.some(m => /raid ended/.test(m))), 'leaving a raid that showed up says so');
  await T.stay();
  await T.ev(() => { lastVisit = -1000; });
  await T.until(() => !!document.getElementById('knock'), null, 'someone knocks or calls', 4000);
  await T.ev(() => { travel(1); });
  await T.until(() => S.mode === 'travel', null, 'the trip starts');
  T.ok(!(await T.ev(() => !!document.getElementById('knock'))), 'the knock banner is gone on the road');
  await T.ev(() => { travelT = 1; });
  await T.until(() => S.mode === 'arrived', null, 'arrived');
  await goTo(T, 6);
  await T.page.click('#bMove');
  const heads = await T.ev(() => [...document.querySelectorAll('#mapList .reghead')].map(h => h.innerText));
  T.ok(heads.length >= 2 && !heads.some(h => /flight/.test(h)), 'no "flight" labels from the Rift: ' + heads.join(' | '));
  await T.page.click('#sMap [data-close]');
  await T.ev(() => { flush(); PL.list.push({id: 'p2', name: '', young: false}, {id: 'p3', name: 'A<b>B</b> & "C"', young: false}); });
  await T.page.click('#bWho');
  const who = await T.ev(() => [...document.querySelectorAll('#whoList .card.who .nm')].map(e => e.innerText));
  T.eq(who[1], 'Player 2', 'an unnamed second player');
  T.eq(who[2], 'A<b>B</b> & "C"', 'a name shows as typed, not as HTML');
  await T.page.click('#sWho [data-close]');
  await T.ev(() => switchPlayer('p2'));
  await T.until(() => PID === 'p2', null, 'player 2 plays');
  const h = await T.ev(() => ({btn: document.getElementById('bWho').textContent, toast: __toasts.filter(m => /is playing/.test(m)).pop()}));
  T.ok(/Player 2/.test(h.btn), 'the header names the unnamed second player: ' + h.btn);
  T.ok(/^Player 2 is playing/.test(h.toast || ''), 'toast: ' + h.toast);
  const pl = await T.ev(() => ({rw: rwTxt({berry: 2, orb: 1, great: 3}), sum: playerSummary({id: 'p1'})}));
  T.eq(pl.rw, '2 Calm Berries, 1 Stay Orb, 3 Great Orbs', 'reward text');
  T.ok(/^1 creature ·/.test(pl.sum), 'one creature, singular: ' + pl.sum);
}},

{name: '26 layout at 360x629 and 336x560: Settings, readings (Done without scrolling), status lines, map, battle titles; toasts below sheet headers (V2-V5)', talk: ['visit_weather'], timeout: 120000, fn: async T => {
  await T.start();
  await T.fastSpeech();
  const probe = () => T.ev(async () => {
    const bad = [], sleep = ms => new Promise(r => setTimeout(r, ms)), over = el => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
    const below = (label, hdSel) => { const t = document.getElementById('toast').getBoundingClientRect(), h = document.querySelector(hdSel).getBoundingClientRect(); if (t.top < h.bottom - 1) bad.push(`${label}: toast top ${t.top.toFixed(0)} over the header (bottom ${h.bottom.toFixed(0)})`); };
    toast('A toast before a sheet opens');
    document.getElementById('bSet').click(); await sleep(80);
    if (over(document.getElementById('sSet'))) bad.push('Settings needs scrolling');
    below('Settings', '#sSet .inner>.row');
    document.querySelector('#sSet [data-close]').click();
    document.getElementById('bMove').click(); await sleep(80);
    if (document.getElementById('sMap').scrollWidth > innerWidth) bad.push('map is wider than the screen');
    for (const c of document.querySelectorAll('#mapList .card')) { const r = c.getBoundingClientRect(); for (const e of c.querySelectorAll('*')) { const q = e.getBoundingClientRect(); if (q.width && (q.right > r.right + .5 || q.left < r.left - .5)) { bad.push('map card content sticks out: ' + c.innerText.split('\n')[0]); break; } } }
    document.querySelector('#sMap [data-close]').click();
    for (const rd of READINGS) { openReading(rd.id); await sleep(10); let n = 0;
      while (n++ < 20) { const paper = document.getElementById('rdPaper'); if (over(document.getElementById('sRead')) || paper.scrollHeight > paper.clientHeight + 1) { bad.push(`reading ${rd.id} page ${n} needs scrolling`); break; }
        const done = document.getElementById('rdDone'); if (!done.hidden) { if (done.getBoundingClientRect().bottom > innerHeight + 1) bad.push(`reading ${rd.id}: Done below the screen`); break; }
        document.getElementById('rdNext').click(); await sleep(5); }
      document.getElementById('rdClose').click(); }
    // the status box clips: everything in it must end above its bottom edge (measured on the elements after the bilingual wrapper ran)
    const st = document.getElementById('status'), cut = () => { const b = st.getBoundingClientRect().bottom; let lb = 0; for (const e of st.querySelectorAll('*')) { const r = e.getBoundingClientRect(); if (r.height) lb = Math.max(lb, r.bottom); } return over(st) || lb > b + 1; };
    for (let f = 0; f < PLACES.length; f++) for (let t = 0; t < PLACES.length; t++) { if (f === t) continue; S.place = f; travelTo = t; S.mode = 'travel'; updateUI(); await sleep(0); if (cut()) bad.push(`status cut: ${PLACES[f].n} to ${PLACES[t].n}`); }
    for (const m of ['arrived', 'staying']) for (let f = 0; f < PLACES.length; f++) { S.place = f; S.mode = m; S.spawned = 3; S.stayed = [0, 1, 2, 3, 4, 5]; updateUI(); await sleep(0); if (cut()) bad.push(`status cut: ${m} at ${PLACES[f].n}`); }
    S.mode = 'arrived'; S.place = 0; S.stayed = [0]; updateUI();
    for (let i = 0; i < PLACES.length; i++) { S.place = i; S.badges = [i]; startGym(); await sleep(10); const h = document.getElementById('bTitle'); if (h.scrollWidth > h.clientWidth + 1) bad.push('battle title cut: ' + h.textContent);
      if (i === 0) { toast('A toast in a battle'); below('battle', '#sBattle [data-toast]'); } B = null; close('sBattle'); }
    S.place = 0; S.badges = [];
    return bad; });
  for (const [w, h] of [[360, 629], [336, 560]]) await T.atSize(w, h, async () => { const bad = await probe(); T.ok(!bad.length, `${w}x${h}: ` + bad.slice(0, 6).join(' | ')); });
  // toasts over the conversation sheet and the catch sheet stay below the speaker's name / the creature's name
  await T.ev(() => { runTalk('visit_weather'); });
  await T.until(() => __TT.vis('.sheet.talk'), null, 'a conversation opens', 3000);
  await T.ev(() => toast('Quest done'));
  T.ok(await T.ev(() => document.getElementById('toast').getBoundingClientRect().top >= document.querySelector('.sheet.talk .talkhead').getBoundingClientRect().bottom - 1), 'the toast is below the speaker');
  await T.ev(() => stopTalk());
  await T.stay(); await T.spawn(1); await T.openCatchOn(0);
  await T.ev(() => toast('Streak lost'));
  T.ok(await T.ev(() => document.getElementById('toast').getBoundingClientRect().top >= document.querySelector('#sCatch .inner>.row').getBoundingClientRect().bottom - 1), 'the toast is below the catch title');
}},

{name: '28 a cleared browser never overwrites the cloud: picking a starter before the cloud answers still restores the richer cloud save', timeout: 40000,
 init: `(() => {
   // A fake Claude cloud that answers slowly and holds an older save with 5 creatures (as after a private browser wiped this device).
   const remote = {v:2, items:{orb:50,great:5,ultra:1,berry:4}, col:[1,2,3,4,5].map(i => ({id:i, sp:i, lvl:10+i, xp:0, hp:60})), badges:[0], place:0, stayed:[0], visited:[0], mode:'arrived', spawned:0, nextId:6, wild:[], travelTo:0, travelT:0, savedAt:1000, caught:[1,2,3,4,5]};
   window.__cloudWrites = [];
   const doc = p => ({
     get: () => new Promise(r => setTimeout(() => r(p.endsWith('/save') ? {exists:true, data: () => ({json: JSON.stringify(remote), savedAt: remote.savedAt})} : {exists:false, data: () => null}), 2500)),
     set: async o => { window.__cloudWrites.push({p, o}); }, update: async o => { window.__cloudWrites.push({p, o}); }
   });
   window.claude = {use: async name => name === 'db' ? {doc} : name === 'user' ? {id: async () => 'u_test'} : null};
 })();`,
 fn: async T => {
  await T.start();
  T.ok(await T.ev(() => S.col.length === 1), 'a fresh local game exists first');
  await T.until(() => S.col.length === 5, null, 'the cloud save replaces the fresh game', 8000);
  const r = await T.ev(() => ({n: S.col.length, orbs: S.items.orb, pushedFresh: __cloudWrites.some(w => w.p.endsWith('/save') && w.o && w.o.json && JSON.parse(w.o.json).col.length < 5)}));
  T.ok(r.n === 5 && r.orbs === 50, 'restored the 5-creature cloud save: ' + JSON.stringify(r));
  T.ok(!r.pushedFresh, 'the fresh 1-creature game was never written over the cloud save');
}},
{name: "27 a creature past both evolution levels evolves twice; little kids get no level choice and no mic button; unfound book cards keep the mystery", talk: ['visit_weather'], timeout: 60000, fn: async T => {
  await T.start();
  await T.fastSpeech();
  await T.ev(() => { evoQueue.length = 0; const c = mk(IDX.Smoldy, 40); S.col.push(c); window.__c = c; evoQueue.push(c.id); runEvoQueue(); });
  for (const to of ['Smolderox', 'Pyrothane']) {
    await T.until(() => E && !E.done && __TT.vis('#sEvo'), null, `evolution into ${to} starts`, 5000);
    await T.ev(() => { E.t0 = T - 5; });
    await T.until(() => !document.getElementById('bEvoOk').hidden, null, `evolution into ${to} finishes`, 3000);
    T.eq(await T.ev(() => SP[__c.sp].n), to, 'species');
    await T.page.click('#bEvoOk');
  }
  // a big kid: level choice, and the mic button when the browser can listen
  await T.page.click('#bSet');
  T.ok(await T.ev(() => __TT.vis('#lvlSeg')), 'a big kid can choose the Chinese level');
  await T.page.click('#sSet [data-close]');
  await T.ev(() => { runTalk('visit_weather'); });
  await T.until(() => document.querySelectorAll('.sheet.talk .talkopts button').length > 0, null, 'answer options', 8000);
  const big = await T.ev(() => ({mic: !!document.querySelector('.sheet.talk .talkopts .mic'), can: canListen()}));
  if (big.can) T.ok(big.mic, 'a big kid gets the mic button'); else T.note('no speech recognition here; mic control skipped');
  await T.ev(() => stopTalk());
  // a little kid
  await T.ev(() => { PL.list[0].young = true; applyYoung(); });
  await T.page.click('#bSet');
  T.ok(!(await T.ev(() => __TT.vis('#lvlSeg'))), 'a little kid has no level choice (Chinese, pinyin and English stay shown)');
  await T.page.click('#sSet [data-close]');
  await T.ev(() => { runTalk('visit_weather'); });
  await T.until(() => document.querySelectorAll('.sheet.talk .talkopts button').length > 0, null, 'little-kid answer option', 10000);
  const young = await T.ev(() => ({mic: !!document.querySelector('.sheet.talk .talkopts .mic'), n: document.querySelectorAll('.sheet.talk .talkopts button').length}));
  T.ok(!young.mic && young.n === 1, 'a little kid gets one answer to tap and no mic button: ' + JSON.stringify(young));
  await T.ev(() => stopTalk());
  // the creature book
  await T.ev(() => { const i = SP.findIndex((s, i) => !S.col.some(c => c.sp === i) && !(S.caught || []).includes(i) && s.next != null); openDex(i, false); });
  const dex = await T.ev(() => { const d = document.querySelector('.dexcard'); return {type: !!d.querySelector('.type'), places: d.querySelectorAll('.dplace').length, evo: !!d.querySelector('.devo'), txt: d.innerText}; });
  T.ok(!dex.type && !dex.places && !dex.evo && /？？？/.test(dex.txt), 'an unfound creature shows only its silhouette: ' + JSON.stringify(dex));
}},

];
