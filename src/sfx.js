// sfx.js - tiny synthesized sound effects + generative background music for CouchCatch
// (Web Audio API only, no files).
(function () {
  var ctx = null, master = null, noiseBuf = null, KEY = 'couchcatch_muted';
  var SFX = { muted: false };
  try { SFX.muted = localStorage.getItem(KEY) === '1'; } catch (e) {}

  function init() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.25;
    master.connect(ctx.destination);
    return ctx;
  }

  function env(g, t, dur, vol, atk) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (atk || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  // Oscillator note with optional pitch glide (f1) and delay (at).
  function tone(type, f0, f1, at, dur, vol, atk) {
    var t = ctx.currentTime + (at || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, dur, vol || 0.5, atk);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noiseBuffer() {
    if (!noiseBuf) {
      var len = ctx.sampleRate;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  // Filtered noise burst (whooshes, thuds, punches).
  function noise(at, dur, vol, ftype, f0, f1, q, atk) {
    var t = ctx.currentTime + (at || 0);
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuffer(); s.loop = true;
    f.type = ftype || 'bandpass';
    f.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    f.Q.value = q || 1;
    env(g, t, dur, vol || 0.5, atk);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.05);
  }

  function sparkle(at, n, base) {
    for (var i = 0; i < n; i++) tone('sine', base * (1 + Math.random()), 0, at + i * 0.05, 0.12, 0.18);
  }

  var sounds = {
    throw: function () { noise(0, 0.35, 0.6, 'bandpass', 400, 2400, 1.2, 0.12); },
    hit: function () { tone('sine', 520, 180, 0, 0.12, 0.6); noise(0, 0.05, 0.3, 'highpass', 2000); },
    shake: function () { tone('triangle', 900, 700, 0, 0.05, 0.4); tone('triangle', 700, 900, 0.07, 0.05, 0.3); },
    catch: function () {
      tone('square', 523, 0, 0, 0.12, 0.25); tone('square', 659, 0, 0.12, 0.12, 0.25);
      tone('square', 784, 0, 0.24, 0.3, 0.28); sparkle(0.3, 6, 1800);
    },
    breakfree: function () { tone('sine', 300, 900, 0, 0.08, 0.6); tone('square', 700, 200, 0.1, 0.25, 0.2); },
    miss: function () { tone('sine', 140, 50, 0, 0.2, 0.7); noise(0, 0.12, 0.4, 'lowpass', 400); },
    spawn: function () { tone('sine', 1320, 0, 0, 0.15, 0.25); tone('sine', 1760, 0, 0.08, 0.2, 0.2); sparkle(0.1, 3, 2200); },
    attack: function () { noise(0, 0.12, 0.7, 'lowpass', 1500, 300); tone('square', 220, 80, 0, 0.12, 0.35); },
    super: function () {
      noise(0, 0.18, 0.8, 'lowpass', 2500, 300); tone('square', 260, 70, 0, 0.18, 0.4);
      tone('sawtooth', 1200, 2400, 0.05, 0.25, 0.18);
    },
    faint: function () { tone('triangle', 600, 90, 0, 0.8, 0.45); },
    levelup: function () {
      [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone('square', f, 0, i * 0.07, 0.14, 0.22); });
    },
    evolve: function () {
      tone('sine', 220, 880, 0, 2.5, 0.35, 0.6); tone('triangle', 330, 1320, 0, 2.5, 0.2, 0.6);
      noise(0, 2.5, 0.12, 'bandpass', 800, 6000, 4, 0.8);
      for (var i = 0; i < 16; i++) tone('sine', 900 + i * 110, 0, i * 0.15, 0.15, 0.12);
      tone('sine', 1047, 0, 2.3, 0.5, 0.3); tone('sine', 1568, 0, 2.3, 0.5, 0.2);
    },
    giant: function () { tone('sine', 40, 160, 0, 1.2, 0.8, 0.2); noise(0, 1.0, 0.5, 'lowpass', 120, 600, 1, 0.3); },
    win: function () {
      var n = [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.38, 0.45]];
      n.forEach(function (x) { tone('square', x[0], 0, x[1], x[2], 0.25); tone('triangle', x[0] / 2, 0, x[1], x[2], 0.25); });
      sparkle(0.45, 5, 2000);
    },
    tap: function () { tone('sine', 1000, 600, 0, 0.04, 0.35, 0.002); },
    shiny: function () {
      [1568, 1976, 2349, 2637, 3136, 3951].forEach(function (f, i) {
        tone('sine', f, 0, i * 0.06, 0.35, 0.2); tone('triangle', f * 2, 0, i * 0.06 + 0.02, 0.15, 0.06);
      });
      noise(0, 0.5, 0.08, 'highpass', 6000, 9000, 2, 0.05); sparkle(0.35, 8, 2600);
    },
    raid: function () {
      tone('sine', 90, 45, 0, 0.6, 0.85, 0.005); noise(0, 0.25, 0.6, 'lowpass', 800, 100);
      tone('sawtooth', 220, 0, 0.05, 0.3, 0.2); tone('sawtooth', 165, 0, 0.4, 0.5, 0.22);
      tone('sine', 70, 40, 0.45, 0.55, 0.7, 0.005); noise(0.45, 0.3, 0.5, 'lowpass', 600, 80);
    },
    quest: function () {
      [1047, 1319, 1568].forEach(function (f, i) {
        tone('sine', f, 0, i * 0.12, 0.25, 0.3); tone('triangle', f * 2, 0, i * 0.12, 0.12, 0.08);
      });
      sparkle(0.4, 4, 2000);
    },
    item: function () { tone('square', 880, 1320, 0, 0.06, 0.2, 0.003); tone('sine', 1760, 0, 0.05, 0.08, 0.18); },
    berry: function () { noise(0, 0.06, 0.35, 'lowpass', 900, 300, 1, 0.003); tone('sine', 380, 160, 0.02, 0.08, 0.4, 0.004); },
    streak: function () { noise(0, 0.25, 0.4, 'bandpass', 500, 4000, 1.5, 0.05); tone('sine', 1760, 2093, 0.2, 0.2, 0.3); },
    legend: function () {
      tone('sawtooth', 55, 110, 0, 2.0, 0.3, 0.8); tone('sine', 110, 220, 0, 2.0, 0.4, 0.8);
      tone('triangle', 165, 330, 0.1, 1.9, 0.2, 0.8); noise(0, 1.8, 0.25, 'lowpass', 150, 1200, 1, 0.9);
      noise(0.6, 1.4, 0.08, 'bandpass', 3000, 8000, 3, 0.6);
      for (var i = 0; i < 12; i++) tone('sine', 1800 + Math.random() * 2400, 0, 0.8 + i * 0.09, 0.15, 0.1);
      tone('sine', 523, 0, 1.6, 0.5, 0.2); tone('sine', 784, 0, 1.6, 0.5, 0.15);
    }
  };

  SFX.play = function (name) {
    try {
      if (SFX.muted || !sounds[name] || !init()) return;
      wake();
      sounds[name]();
    } catch (e) {}
  };

  SFX.toggle = function () {
    SFX.muted = !SFX.muted;
    try { localStorage.setItem(KEY, SFX.muted ? '1' : '0'); } catch (e) {}
    try { level(true); } catch (e) {}
    return SFX.muted;
  };

  // ===========================================================================
  // Generative background music. Everything is synthesized and scheduled with a
  // lookahead timer: each theme is an 8-bar loop (16 steps per bar) whose melody,
  // accompaniment patterns and layers are re-rolled a little on every pass.
  //   SFX.music('home'|'california'|'rift'|'battle'|'raid'|'travel'|null)
  //   SFX.musicMuted (persisted), SFX.toggleMusic() -> new musicMuted value.
  // ===========================================================================
  var MKEY = 'couchcatch_music_muted', MVOL = 0.12, XF = 1.5, AHEAD = 0.3, TICK = 100;
  var M = null, players = [], cur = null, timer = null, hooked = false, rnd = Math.random;
  SFX.musicMuted = false;
  try { SFX.musicMuted = localStorage.getItem(MKEY) === '1'; } catch (e) {}

  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function pcOf(m) { return ((m % 12) + 12) % 12; }
  function pat(str, map) { var a = []; for (var i = 0; i < 16; i++) a.push(map[str.charAt(i)]); return a; }
  function C(b, p, m) { return { b: b, p: p, m: m }; } // chord: bass midi, voicing midis, melody pitch classes

  // ---- audio graph -----------------------------------------------------------
  function done(src, nodes) {
    src.onended = function () { for (var i = 0; i < nodes.length; i++) { try { nodes[i].disconnect(); } catch (e) {} } };
  }
  function envG(dest, t, vol, atk, hold, tau) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + atk);
    g.gain.setTargetAtTime(0, t + atk + hold, tau);
    g.connect(dest);
    return g;
  }
  // Karplus-Strong plucked string rendered once, replayed at any pitch (zheng / nylon guitar).
  function ksBuf(f0, secs, smooth, pos, decay) {
    var sr = ctx.sampleRate, N = Math.max(8, Math.round(sr / f0)), len = Math.floor(sr * secs);
    var b = ctx.createBuffer(1, len, sr), d = b.getChannelData(0), w = new Float32Array(N), x = new Float32Array(N);
    var i, p = 0, k = Math.max(1, Math.round(N * pos)), mean = 0, peak = 0;
    for (i = 0; i < N; i++) { p += (1 - smooth) * ((rnd() * 2 - 1) - p); w[i] = p; }
    for (i = 0; i < N; i++) { x[i] = w[i] - w[(i + k) % N]; mean += x[i]; } // pluck-position comb
    for (i = 0; i < N; i++) x[i] -= mean / N;
    for (i = 0, p = 0; i < len; i++) {
      var j = p + 1 === N ? 0 : p + 1;
      d[i] = x[p]; x[p] = decay * 0.5 * (x[p] + x[j]); p = j;
      if (d[i] > peak) peak = d[i]; else if (-d[i] > peak) peak = -d[i];
    }
    var fade = Math.floor(sr * 0.08), gn = peak > 0 ? 0.9 / peak : 1;
    for (i = 0; i < len; i++) d[i] *= gn * (i > len - fade ? (len - i) / fade : 1);
    return { b: b, f: sr / (N + 0.5), len: len / sr };
  }
  function irBuf(secs) { // soft, dark stereo reverb tail
    var sr = ctx.sampleRate, len = Math.floor(sr * secs), b = ctx.createBuffer(2, len, sr);
    for (var c = 0; c < 2; c++) {
      var d = b.getChannelData(c), lp = 0;
      for (var i = 0; i < len; i++) { lp += 0.4 * ((rnd() * 2 - 1) - lp); var e = 1 - i / len; d[i] = lp * e * e * e; }
    }
    return b;
  }
  function minit() {
    if (M) return M;
    if (!init()) return null;
    var vol = ctx.createGain(), comp = ctx.createDynamicsCompressor(), mix = ctx.createGain(), verb = ctx.createConvolver();
    vol.gain.value = 0; vol.connect(ctx.destination);
    comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.02; comp.release.value = 0.3;
    comp.connect(vol); mix.connect(comp);
    verb.buffer = irBuf(2.8); verb.connect(mix);
    M = { vol: vol, mix: mix, verb: verb, lvl: -1,
      zheng: ksBuf(220, 3.5, 0.05, 0.11, 0.996), nylon: ksBuf(220, 3, 0.5, 0.22, 0.995) };
    return M;
  }
  function glide(p, v, dur) {
    var now = ctx.currentTime;
    try {
      if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(now);
      else { var c = p.value; p.cancelScheduledValues(now); p.setValueAtTime(c, now); }
      p.linearRampToValueAtTime(v, now + dur);
    } catch (e) { try { p.value = v; } catch (e2) {} }
  }
  function silent() { return SFX.muted || SFX.musicMuted || (typeof document !== 'undefined' && !!document.hidden); }
  function level(fast) {
    if (!M) return;
    var v = silent() ? 0 : MVOL;
    if (v === M.lvl) return;
    M.lvl = v;
    glide(M.vol.gain, v, fast ? 0.12 : 0.5);
  }

  // ---- instruments (absolute time t, destination node) ------------------------
  function pluck(dest, t, f, vol, which, o) {
    o = o || {};
    var B = M[which], s = ctx.createBufferSource(), g = ctx.createGain(), r = f / B.f, life = B.len / r, nodes = [s, g];
    var hold = Math.max(0.05, Math.min(o.max || 99, life - 0.25));
    s.buffer = B.b;
    if (o.bend) { s.playbackRate.setValueAtTime(r * 0.8909, t); s.playbackRate.linearRampToValueAtTime(r, t + 0.14); } // press-up slide
    else s.playbackRate.setValueAtTime(r, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.setTargetAtTime(0, t + hold, 0.05);
    var end = t + hold + 0.3;
    if (o.vib) { // left-hand string vibrato
      var l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(r * 0.007, t + 0.7);
      l.connect(lg); lg.connect(s.playbackRate); l.start(t); l.stop(end); nodes.push(l, lg);
    }
    s.connect(g); g.connect(dest); s.start(t); s.stop(end); done(s, nodes);
  }
  // Mono synth voice: o = {type, det, cut, env, envT, q, atk, dec, sus, rel, vib}
  function syn(dest, t, f, dur, vol, o) {
    var atk = o.atk || 0.005, rel = o.rel || 0.08, g = ctx.createGain(), nodes = [g], inp = g, lg = null;
    dur = Math.max(dur, atk + 0.01);
    var end = t + dur + rel * 2 + 0.02;
    if (o.det) vol *= 0.6;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + atk);
    if (o.dec) g.gain.setTargetAtTime(vol * (o.sus || 0), t + atk, o.dec);
    g.gain.setTargetAtTime(0, t + dur, rel / 3);
    g.connect(dest);
    if (o.cut) {
      var fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = o.q || 0.8;
      fl.frequency.setValueAtTime(Math.min(16000, o.cut * (o.env || 1)), t);
      if (o.env) fl.frequency.setTargetAtTime(o.cut, t + atk, o.envT || 0.08);
      fl.connect(g); inp = fl; nodes.push(fl);
    }
    if (o.vib) {
      var l = ctx.createOscillator(); lg = ctx.createGain(); l.frequency.value = 5.3;
      lg.gain.setValueAtTime(0, t + 0.12); lg.gain.linearRampToValueAtTime(o.vib, t + 0.5);
      l.connect(lg); l.start(t); l.stop(end); nodes.push(l, lg);
    }
    var last = null;
    for (var k = 0; k < (o.det ? 2 : 1); k++) {
      var os = ctx.createOscillator();
      os.type = o.type || 'triangle'; os.frequency.setValueAtTime(f, t);
      if (o.det) os.detune.setValueAtTime(k ? o.det : -o.det, t);
      if (lg) lg.connect(os.detune);
      os.connect(inp); os.start(t); os.stop(end); nodes.push(os); last = os;
    }
    done(last, nodes);
  }
  // Chord pad: detuned oscillators -> (optionally sweeping) lowpass -> slow envelope.
  function pad(dest, t, notes, dur, vol, o) {
    var atk = o.atk, rel = o.rel, hold = Math.max(dur, atk), end = t + hold + rel * 2 + 0.05, n = o.det ? 2 : 1;
    var g = ctx.createGain(), fl = ctx.createBiquadFilter(), mx = ctx.createGain(), nodes = [g, fl, mx], last = null;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + atk); g.gain.setTargetAtTime(0, t + hold, rel / 3);
    fl.type = 'lowpass'; fl.Q.value = o.q || 0.6;
    fl.frequency.setValueAtTime(o.c0 || o.cut, t);
    if (o.c0) { fl.frequency.linearRampToValueAtTime(o.cut, t + hold * 0.55); fl.frequency.linearRampToValueAtTime(o.c0, t + hold + rel); }
    mx.gain.value = 0.5 / Math.sqrt(notes.length * n);
    mx.connect(fl); fl.connect(g); g.connect(dest);
    for (var i = 0; i < notes.length; i++) {
      for (var k = 0; k < n; k++) {
        var os = ctx.createOscillator();
        os.type = o.type; os.frequency.setValueAtTime(mtof(notes[i]), t);
        if (o.det) os.detune.setValueAtTime(k ? o.det : -o.det, t);
        os.connect(mx); os.start(t); os.stop(end); nodes.push(os); last = os;
      }
    }
    if (last) done(last, nodes);
  }
  // Two-operator FM: bells (ratio 3.5), glass (2), vibes / marimba (4).
  function fm(dest, t, f, vol, ratio, index, tau) {
    var c = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), g = envG(dest, t, vol, 0.003, 0, tau);
    var end = t + 0.003 + tau * 5;
    c.frequency.setValueAtTime(f, t); m.frequency.setValueAtTime(f * ratio, t);
    mg.gain.setValueAtTime(f * ratio * index, t); mg.gain.setTargetAtTime(0, t, tau * 0.35);
    m.connect(mg); mg.connect(c.frequency); c.connect(g);
    c.start(t); m.start(t); c.stop(end); m.stop(end); done(c, [c, m, mg, g]);
  }
  function ping(dest, type, f, f1, t, vol, tau) {
    var o = ctx.createOscillator(), g = envG(dest, t, vol, 0.002, 0, tau), end = t + tau * 6 + 0.01;
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f1 && f1 !== f) o.frequency.exponentialRampToValueAtTime(f1, t + Math.min(0.09, tau * 1.5));
    o.connect(g); o.start(t); o.stop(end); done(o, [o, g]);
  }
  function nz(dest, t, vol, type, f, q, atk, tau) {
    var s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = envG(dest, t, vol, atk, 0, tau), end = t + atk + tau * 6;
    s.buffer = noiseBuffer(); s.loop = true;
    fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    s.connect(fl); fl.connect(g); s.start(t, rnd() * 0.5); s.stop(end); done(s, [s, fl, g]);
  }
  // Noise swell; pk = fraction of dur where it peaks (1 = riser that cuts off, <1 = wave that ebbs).
  function swell(dest, t, dur, vol, type, f0, f1, pk) {
    var s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), tp = t + dur * pk, end = t + dur + 0.3;
    s.buffer = noiseBuffer(); s.loop = true;
    fl.type = type; fl.Q.value = 0.9;
    fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, tp);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, tp);
    if (pk < 1) { fl.frequency.exponentialRampToValueAtTime(f0, t + dur); g.gain.linearRampToValueAtTime(0, t + dur); }
    else g.gain.setTargetAtTime(0, tp, 0.05);
    s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, rnd() * 0.5); s.stop(end); done(s, [s, fl, g]);
  }
  function kick(d, t, v, f0, f1, tau) { ping(d, 'sine', f0, f1, t, v, tau); }
  function snare(d, t, v) { nz(d, t, v, 'bandpass', 1900, 0.6, 0.001, 0.055); ping(d, 'triangle', 200, 150, t, v * 0.5, 0.04); }
  function hat(d, t, v, open) { nz(d, t, v, 'highpass', 7500, 0.7, 0.001, open ? 0.1 : 0.022); }
  function shaker(d, t, v) { nz(d, t, v, 'bandpass', 6500, 1.4, 0.008, 0.028); }
  function rim(d, t, v) { ping(d, 'triangle', 1750, 0, t, v, 0.012); nz(d, t, v * 0.5, 'bandpass', 3200, 2, 0.0005, 0.008); }
  function clap(d, t, v) { nz(d, t, v, 'bandpass', 1500, 0.9, 0.001, 0.04); nz(d, t + 0.012, v * 0.7, 'bandpass', 1300, 0.9, 0.001, 0.05); }
  function crash(d, t, v) { nz(d, t, v, 'highpass', 4500, 0.6, 0.002, 0.55); }
  function taiko(d, t, v, f) {
    kick(d, t, v, f * 1.8, f, 0.28); ping(d, 'triangle', f * 2.4, f * 2, t, v * 0.35, 0.09);
    nz(d, t, v * 0.4, 'lowpass', 700, 0.7, 0.001, 0.045);
  }
  function frame(d, t, v) { nz(d, t, v, 'bandpass', 900, 1.2, 0.001, 0.07); ping(d, 'sine', 220, 160, t, v * 0.6, 0.06); }

  // ---- melody generation -------------------------------------------------------
  function near(list, m) {
    var bi = 0, bd = 1e9;
    for (var i = 0; i < list.length; i++) { var d = Math.abs(list[i] - m); if (d < bd) { bd = d; bi = i; } }
    return bi;
  }
  function snap(list, m, tones) { // nearest chord tone
    var best = m, bd = 1e9;
    for (var i = 0; i < list.length; i++) {
      if (tones.indexOf(pcOf(list[i])) < 0) continue;
      var d = Math.abs(list[i] - m) + rnd() * 0.5;
      if (d < bd) { bd = d; best = list[i]; }
    }
    return best;
  }
  function prep(th) {
    if (th.ok) return th;
    th.chords.forEach(function (c) {
      var m = c.m || th.scale, t = [];
      c.p.concat([c.b]).forEach(function (x) { if (t.indexOf(pcOf(x)) < 0) t.push(pcOf(x)); });
      c.t = t; c.cand = [];
      for (var x = th.range[0]; x <= th.range[1]; x++) if (m.indexOf(pcOf(x)) >= 0) c.cand.push(x);
    });
    th.ok = true;
    return th;
  }
  // Random walk over the chord's scale notes; strong beats and phrase ends land on chord tones.
  function gen(P, from, to) {
    var th = P.th, prev = P.lastN || th.center, pb = P.mel[from - 1];
    if (pb && pb.length) prev = pb[pb.length - 1].n;
    for (var b = from; b < to; b++) {
      var c = th.chords[b], cand = c.cand, rh = pick(b % 4 === 3 ? th.cad : th.rh), out = [];
      for (var k = 0; k < rh.length; k++) {
        var mv = pick(th.moves);
        if ((prev > th.center + 6 && mv > 0) || (prev < th.center - 6 && mv < 0)) { if (rnd() < 0.6) mv = -mv; }
        var n = cand[Math.max(0, Math.min(cand.length - 1, near(cand, prev) + mv))];
        if (rh[k][0] % 8 === 0 || (b % 4 === 3 && k === rh.length - 1)) n = snap(cand, n, c.t);
        out.push({ s: rh[k][0], d: rh[k][1], n: n, v: 0.8 + rnd() * 0.2 });
        prev = n;
      }
      P.mel[b] = out;
    }
    P.lastN = prev;
  }
  function vary(P) {
    var th = P.th, L = P.loop;
    if (!P.mel) { P.mel = []; gen(P, 0, th.bars); }
    else if (th.fresh || L % 4 === 0) gen(P, 0, th.bars);
    else if (rnd() < 0.6) gen(P, th.bars / 2, th.bars);
    if (L > 0) {
      for (var b = 0; b < P.mel.length; b++) {
        var cand = th.chords[b].cand;
        P.mel[b].forEach(function (n) {
          if (n.s % 8 && rnd() < 0.12) n.n = cand[Math.max(0, Math.min(cand.length - 1, near(cand, n.n) + (rnd() < 0.5 ? -1 : 1)))];
        });
      }
    }
    P.v = { mel: true, from: 0 };
    th.vary(P, L);
    P.loop++;
  }

  // ---- themes --------------------------------------------------------------------
  var IV = { '0': 0, '5': 5, '7': 7, 'c': 12 }, THEMES = {};

  // Home: D major pentatonic (the guzheng's own tuning); zheng plucks, soft pad, gentle glissandi.
  (function () {
    var D = C(38, [57, 62, 64, 66]), Bm = C(35, [57, 59, 62, 66]), G = C(43, [55, 59, 62, 66]), As = C(45, [57, 62, 64, 69]),
      DF = C(42, [57, 62, 64, 66]), Em = C(40, [55, 59, 62, 64]), A7 = C(45, [55, 57, 62, 64]);
    var ARP = [[[0, 0], [4, 2], [6, 3], [8, 1], [12, 4], [14, 2]], [[0, 0], [3, 1], [6, 2], [8, 3], [11, 2], [14, 1]],
      [[0, 0], [6, 2], [8, 1], [12, 3]], [[0, 0], [2, 1], [4, 2], [6, 3], [8, 4], [10, 3], [12, 2], [14, 1]]];
    THEMES.home = {
      bpm: 72, bars: 8, swing: 0, wet: 0.45, echo: 3, fb: 0.25, emix: 0.2, gain: 0.55,
      scale: [2, 4, 6, 9, 11], range: [62, 83], center: 72, chords: [D, Bm, G, As, DF, Em, G, A7],
      rh: [[[0, 6], [6, 2], [8, 8]], [[0, 4], [4, 4], [8, 4], [12, 4]], [[0, 8], [8, 4], [12, 4]], [[0, 3], [3, 1], [4, 4], [8, 8]],
        [[0, 12], [12, 2], [14, 2]], [[2, 2], [4, 6], [10, 2], [12, 4]], [[0, 4], [4, 2], [6, 2], [8, 8]]],
      cad: [[[0, 16]], [[0, 4], [4, 12]], [[0, 8], [8, 8]]],
      moves: [-2, -1, -1, -1, 0, 1, 1, 1, 2],
      vary: function (P, L) {
        var V = P.v; V.arp = pick(ARP); V.mel = L % 4 !== 3; V.from = L ? 0 : 2;
        V.gliss = rnd() < 0.7; V.dbl = rnd() < 0.3; V.bell = !V.mel || rnd() < 0.35;
      },
      step: function (P, b, s, t, sd, c) {
        var V = P.v, A = V.arp, L = [c.b + 12].concat(c.p);
        if (s === 0) {
          pad(P.bus, t, c.p, sd * 16, 0.13, { type: 'triangle', cut: 1500, atk: 1.0, rel: 1.8, det: 6 });
          syn(P.bus, t, mtof(c.b), sd * 15, 0.2, { type: 'sine', atk: 0.08, rel: 1.0 });
        }
        for (var i = 0; i < A.length; i++) if (A[i][0] === s) pluck(P.bus, t, mtof(L[A[i][1]]), s ? 0.14 : 0.2, 'zheng', { max: 2.4 });
        if (V.bell && s === 8 && b % 2 === 0) fm(P.lead, t, mtof(snap(c.cand, 79 + rnd() * 4, c.t)), 0.06, 2, 0.8, 1.0);
        if (V.gliss && b === 7 && s === 12) { // 刮奏-style sweep up into the next pass
          for (var k = 0; k < 9; k++) pluck(P.lead, t + k * 0.07, mtof(c.cand[k + 1]), 0.06 + k * 0.012, 'zheng', { max: 1.2 });
        }
      },
      lead: function (P, n, t, sd, c) {
        var f = mtof(n.n), t0 = t;
        if (n.d >= 4 && rnd() < 0.12) { // grace note from the string above
          pluck(P.lead, t, mtof(c.cand[Math.min(c.cand.length - 1, near(c.cand, n.n) + 1)]), 0.18 * n.v, 'zheng', { max: 0.09 });
          t0 = t + 0.075;
        }
        pluck(P.lead, t0, f, 0.38 * n.v, 'zheng', { bend: n.d >= 4 && rnd() < 0.14, vib: n.d >= 8 });
        if (P.v.dbl) pluck(P.bus, t0, f / 2, 0.12 * n.v, 'zheng', { max: 1.5 });
      }
    };
  })();

  // California: breezy G major, bossa clave on nylon guitar, shaker + rim, vibes / whistle lead, ocean wash.
  (function () {
    var G = C(43, [55, 59, 62, 66]), Cm7 = C(36, [48, 55, 59, 64]), Am = C(45, [55, 60, 64, 71]), Bm = C(47, [57, 62, 66, 71]),
      C6 = C(48, [55, 60, 64, 69]), D9 = C(38, [57, 60, 64, 67]);
    function bass(P, t, m, d, v) {
      syn(P.bus, t, mtof(m), d, v, { type: 'triangle', cut: 900, env: 2.2, envT: 0.05, atk: 0.006, dec: 0.3, sus: 0.35, rel: 0.1 });
    }
    THEMES.california = {
      bpm: 108, bars: 8, swing: 0.05, wet: 0.3, echo: 3, fb: 0.22, emix: 0.25, gain: 0.85,
      scale: [7, 9, 11, 2, 4, 6], range: [67, 88], center: 77, chords: [G, Cm7, G, Cm7, Am, Bm, C6, D9],
      rh: [[[0, 3], [3, 3], [6, 2], [8, 6], [14, 2]], [[2, 2], [4, 4], [8, 2], [10, 6]], [[0, 6], [6, 2], [8, 2], [10, 2], [12, 4]],
        [[0, 2], [2, 4], [6, 4], [10, 6]], [[4, 4], [8, 8]], [[0, 4], [6, 2], [8, 4], [12, 2], [14, 2]]],
      cad: [[[0, 10], [10, 2], [12, 4]], [[0, 12]], [[0, 6], [6, 10]]],
      moves: [-2, -1, -1, 0, 1, 1, 2, -3, 3],
      vary: function (P, L) {
        var V = P.v; V.inst = L ? pick(['vibe', 'whistle', 'nylon']) : 'vibe'; V.mel = L % 4 !== 3; V.from = L ? 0 : 2; V.wave = rnd() < 0.6;
      },
      step: function (P, b, s, t, sd, c) {
        var nx = this.chords[(b + 1) % 8];
        if (s === 0) {
          pad(P.bus, t, c.p, sd * 16, 0.05, { type: 'sine', cut: 3000, atk: 0.5, rel: 0.9 });
          if (b % 4 === 0 && P.v.wave) swell(P.bus, t, sd * 28, 0.035, 'lowpass', 350, 1300, 0.45);
        }
        if (s === 0) bass(P, t, c.b, sd * 5, 0.28);
        else if (s === 6) bass(P, t, c.b + 7, sd * 1.5, 0.12);
        else if (s === 8) bass(P, t, c.b + 7, sd * 5, 0.24);
        else if (s === 14) bass(P, t, nx.b, sd * 1.5, 0.1);
        if ((b % 2 ? [4, 10] : [0, 6, 12]).indexOf(s) >= 0) { // bossa clave: guitar strum + rim click
          for (var k = 0; k < c.p.length; k++) pluck(P.bus, t + k * 0.011, mtof(c.p[k]), k === 3 ? 0.13 : 0.1, 'nylon', { max: s ? 0.8 : 1.4 });
          rim(P.bus, t, 0.07);
        }
        shaker(P.bus, t, [0.05, 0.02, 0.035, 0.02][s % 4]);
        if (s === 0) kick(P.bus, t, 0.18, 95, 50, 0.12);
        if (s === 8) kick(P.bus, t, 0.24, 90, 48, 0.14);
      },
      lead: function (P, n, t, sd) {
        var f = mtof(n.n), i = P.v.inst;
        if (i === 'vibe') fm(P.lead, t, f, 0.17 * n.v, 4, 0.3, 0.6);
        else if (i === 'nylon') pluck(P.lead, t, f, 0.34 * n.v, 'nylon', { vib: n.d >= 6 });
        else syn(P.lead, t, f, n.d * sd * 0.85, 0.12 * n.v, { type: 'sine', atk: 0.035, rel: 0.12, vib: 16 });
      }
    };
  })();

  // Rift: slow mediant chords (E - C - A - G, all maj9 / lydian colour), breathing saw pads, FM bells, echoes.
  (function () {
    var E = C(40, [52, 59, 63, 66, 68], [4, 6, 8, 11, 1, 3]), Cl = C(36, [48, 55, 59, 64, 66], [0, 2, 4, 7, 11, 6]),
      A = C(45, [57, 61, 64, 68, 71], [9, 11, 1, 4, 8, 6]), G = C(43, [55, 59, 62, 64, 69], [7, 9, 11, 2, 4]);
    THEMES.rift = {
      bpm: 60, bars: 8, swing: 0, wet: 0.7, echo: 3, fb: 0.45, emix: 0.45, gain: 0.8, fresh: true,
      range: [72, 93], center: 81, chords: [E, E, Cl, Cl, A, A, G, G],
      rh: [[[0, 8], [8, 8]], [[0, 12]], [[4, 4], [8, 8]], [[0, 4], [6, 10]], [[0, 6], [6, 4], [12, 4]], [], [[8, 8]]],
      cad: [[[0, 16]], [[0, 8]]],
      moves: [-3, -2, -1, 1, 2, 3],
      vary: function (P, L) { var V = P.v; V.ratio = pick([3.5, 3.5, 1.4, 2]); V.mel = L === 0 || rnd() < 0.85; V.from = L ? 0 : 2; },
      step: function (P, b, s, t, sd, c) {
        if (s === 0 && b % 2 === 0) {
          var dur = sd * 32, top = c.p.slice(-2), ct = c.cand.filter(function (x) { return x >= 74 && c.t.indexOf(pcOf(x)) >= 0; });
          pad(P.bus, t, c.p, dur, 0.14, { type: 'sawtooth', cut: 1700, c0: 420, atk: 2.6, rel: 3.2, det: 9, q: 0.8 });
          pad(P.bus, t, [top[0] + 12, top[1] + 12], dur, 0.05, { type: 'sine', cut: 8000, atk: 3.5, rel: 3.5, det: 5 });
          syn(P.bus, t, mtof(c.b), dur, 0.16, { type: 'sine', atk: 2.2, rel: 3.0 });
          if (rnd() < 0.6) for (var k = 0; k < Math.min(4, ct.length); k++) fm(P.lead, t + 0.25 + k * 0.2, mtof(ct[k]), 0.05, 2, 1, 1.2);
        }
        if (b % 2 === 1 && s === 8 && rnd() < 0.45) swell(P.bus, t, sd * 8, 0.035, 'bandpass', 400, 4500, 1);
        if (rnd() < 0.05) fm(P.lead, t, mtof(pick(c.cand) + 12), 0.025, 2, 0.6, 0.7);
      },
      lead: function (P, n, t, sd) {
        var f = mtof(n.n), r = P.v.ratio;
        fm(P.lead, t, f, 0.15 * n.v, r, r > 3 ? 2 : 1.1, 1.5);
        if (n.d >= 8) syn(P.bus, t, f, n.d * sd, 0.03, { type: 'sine', atk: 0.7, rel: 1.4 });
      }
    };
  })();

  // Battle: A minor at 144 bpm, resonant saw bass in octaves, square arpeggio, rock kit, synth-brass lead.
  (function () {
    var EM = [4, 5, 8, 9, 11, 2], Am = C(45, [57, 60, 64, 69]), F = C(41, [57, 60, 65, 69]), Dm = C(38, [57, 62, 65, 69]),
      E = C(40, [56, 59, 64, 68], EM), G = C(43, [55, 59, 62, 67]), E7 = C(40, [56, 59, 62, 64], EM);
    var BP = [[0, 0, 12, 0, 0, 12, 7, 12], [0, 0, 0, 12, 0, 0, 7, 0], [0, 12, 0, 12, 0, 12, 0, 12], [0, 0, 7, 0, 12, 0, 7, 0]],
      AP = [[0, 1, 2, 3], [0, 2, 1, 3], [3, 2, 1, 0, 1, 2], [0, 1, 2, 3, 2, 1], [0, 2, 3, 1, 3, 2]];
    THEMES.battle = {
      bpm: 144, bars: 8, swing: 0, wet: 0.18, echo: 3, fb: 0.25, emix: 0.2, gain: 0.75,
      scale: [9, 11, 0, 2, 4, 5, 7], range: [64, 86], center: 74, chords: [Am, F, Dm, E, Am, F, G, E7],
      rh: [[[0, 4], [4, 2], [6, 2], [8, 6], [14, 2]], [[0, 2], [2, 2], [4, 4], [8, 4], [12, 4]], [[0, 6], [6, 6], [12, 4]],
        [[0, 3], [3, 3], [6, 2], [8, 8]], [[0, 2], [2, 2], [4, 2], [6, 2], [8, 4], [12, 2], [14, 2]], [[0, 8], [8, 2], [10, 2], [12, 4]]],
      cad: [[[0, 8], [8, 8]], [[0, 12], [12, 4]], [[0, 4], [4, 4], [8, 8]]],
      moves: [-3, -2, -1, -1, 0, 1, 1, 2, 3],
      vary: function (P, L) {
        var V = P.v; V.bp = pick(BP); V.ap = pick(AP); V.mel = L % 4 !== 3; V.h16 = L % 2 === 1; V.k10 = rnd() < 0.5; V.open = rnd() < 0.6;
      },
      step: function (P, b, s, t, sd, c) {
        var V = P.v;
        if (s === 0) pad(P.bus, t, c.p, sd * 16, 0.07, { type: 'sawtooth', cut: 1500, atk: 0.06, rel: 0.25, det: 8 });
        if (s % 2 === 0) syn(P.bus, t, mtof(c.b + V.bp[s / 2]), sd * 1.5, s ? 0.24 : 0.3, { type: 'sawtooth', cut: 380, env: 4.5, envT: 0.05, q: 3, atk: 0.003, rel: 0.05 });
        syn(P.bus, t, mtof(c.p[V.ap[s % V.ap.length]] + 12), sd * 0.7, 0.05, { type: 'square', cut: 3000, env: 1.6, envT: 0.03, atk: 0.002, rel: 0.04 });
        if (s === 0 || s === 8 || (V.k10 && s === 10) || (s === 6 && b % 2 === 1)) kick(P.bus, t, 0.55, 150, 48, 0.1);
        if (s === 4 || s === 12) snare(P.bus, t, 0.22);
        if (b === 7 && s >= 13) snare(P.bus, t, 0.08 + (s - 12) * 0.04);
        if (s % 2 === 0 || V.h16) hat(P.bus, t, s % 4 === 2 ? 0.06 : 0.035, V.open && s === 14);
        if (b === 0 && s === 0 && P.loop > 1) crash(P.bus, t, 0.1);
        if (b === 7 && s === 8) swell(P.bus, t, sd * 8, 0.04, 'highpass', 1500, 9000, 1);
      },
      lead: function (P, n, t, sd) {
        syn(P.lead, t, mtof(n.n), n.d * sd * 0.9, 0.11 * n.v, { type: 'sawtooth', det: 7, cut: 2400, env: 1.6, envT: 0.1, q: 1.5, atk: 0.008, rel: 0.07, vib: n.d >= 6 ? 14 : 0 });
      }
    };
  })();

  // Raid: D minor at 88 bpm, taiko patterns + sub booms, galloping low ostinato, swelling brass, heroic lead.
  (function () {
    var AM = [9, 10, 1, 2, 4, 7], Dm = C(38, [57, 62, 65, 69]), Bb = C(34, [58, 62, 65, 70]), Cc = C(36, [55, 60, 64, 67]),
      Gm = C(31, [58, 62, 67, 70]), A = C(33, [57, 61, 64, 69], AM), TK = { x: 0.9, o: 0.6, '-': 0.36 }, OS = { '1': 1, '2': 2 };
    var TKS = [pat('x..-..o.x..-o.--', TK), pat('x.....o.x.-.o.-.', TK), pat('x.-.o..-x.-.o---', TK)],
      OST = [pat('1.111.111.111.12', OS), pat('1.1.1.1.1.1.1.2.', OS), pat('1..1..1.1..1..2.', OS)];
    THEMES.raid = {
      bpm: 88, bars: 8, swing: 0, wet: 0.38, echo: 4, fb: 0.3, emix: 0.22, gain: 0.7,
      scale: [2, 4, 5, 7, 9, 10, 0], range: [62, 81], center: 70, chords: [Dm, Bb, Cc, Dm, Dm, Bb, Gm, A],
      rh: [[[0, 8], [8, 4], [12, 4]], [[0, 4], [4, 4], [8, 8]], [[0, 12], [12, 2], [14, 2]], [[0, 6], [6, 2], [8, 8]],
        [[0, 4], [4, 2], [6, 2], [8, 4], [12, 4]]],
      cad: [[[0, 16]], [[0, 8], [8, 8]]],
      moves: [-2, -1, -1, 0, 1, 1, 2, 3, -3],
      vary: function (P, L) { var V = P.v; V.tk = pick(TKS); V.ost = pick(OST); V.mel = L % 4 !== 3; V.from = L ? 0 : 4; V.fill = rnd() < 0.7; },
      step: function (P, b, s, t, sd, c) {
        var V = P.v, tv = V.tk[s], o = V.ost[s];
        if (tv) taiko(P.bus, t, tv * 0.6, s % 8 === 0 ? 50 : 64);
        if (V.fill && b % 4 === 3 && s >= 10) taiko(P.bus, t, 0.18 + (s - 10) * 0.05, 78);
        if (s === 4 || s === 12) frame(P.bus, t, 0.12);
        if (o) syn(P.bus, t, mtof(c.b + 12 + (o === 2 ? 7 : 0)), sd * 0.85, 0.15, { type: 'sawtooth', cut: 650, env: 2.6, envT: 0.05, q: 2.5, atk: 0.003, rel: 0.05 });
        if (s === 0) {
          pad(P.bus, t, [c.b + 12, c.b + 19, c.b + 24], sd * 16, 0.15, { type: 'sawtooth', cut: 1900, c0: 500, atk: 0.3, rel: 0.6, det: 10, q: 1.1 });
          pad(P.bus, t, c.p, sd * 16, 0.05, { type: 'triangle', cut: 2400, atk: 0.7, rel: 0.9, det: 6 });
          if (b % 4 === 0) kick(P.bus, t, 0.5, 75, 30, 0.45);
          if (b === 0 && P.loop > 1) crash(P.bus, t, 0.13);
          if (b === 7) swell(P.bus, t, sd * 16, 0.05, 'highpass', 2000, 9000, 1);
        }
      },
      lead: function (P, n, t, sd) {
        var f = mtof(n.n), d = n.d * sd * 0.95;
        syn(P.lead, t, f, d, 0.12 * n.v, { type: 'sawtooth', det: 9, cut: 1700, env: 1.4, envT: 0.2, q: 1, atk: 0.05, rel: 0.2, vib: n.d >= 6 ? 16 : 0 });
        syn(P.bus, t, f / 2, d, 0.05 * n.v, { type: 'triangle', atk: 0.05, rel: 0.2 });
      }
    };
  })();

  // Travel: bouncy C major pentatonic at 116 bpm with light swing; marimba ostinato, plucky bass, ocarina / zheng lead.
  (function () {
    var Cc = C(36, [55, 60, 64, 67]), Am = C(45, [55, 60, 64, 69]), F = C(41, [57, 60, 65, 67]), G6 = C(43, [55, 59, 62, 64]),
      Em = C(40, [52, 55, 59, 62]), Gs = C(43, [55, 60, 62, 67]);
    var BL = [pat('0.....7.c.7...0.', IV), pat('0..0..7.0..c..7.', IV), pat('0...c.7.0...7.c.', IV)],
      MP = [[[0, 1], [3, 2], [6, 3], [8, 1], [10, 2], [12, 3], [14, 2]], [[2, 0], [4, 2], [6, 1], [10, 3], [12, 2], [14, 1]],
        [[0, 3], [2, 2], [4, 1], [6, 2], [8, 3], [11, 1], [14, 2]]];
    THEMES.travel = {
      bpm: 116, bars: 8, swing: 0.12, wet: 0.22, echo: 3, fb: 0.2, emix: 0.25, gain: 0.85,
      scale: [0, 2, 4, 7, 9], range: [67, 88], center: 77, chords: [Cc, Am, F, G6, Cc, Em, F, Gs],
      rh: [[[0, 2], [2, 2], [4, 4], [8, 2], [10, 2], [12, 4]], [[0, 4], [4, 2], [6, 2], [8, 8]], [[0, 3], [3, 3], [6, 2], [8, 4], [12, 4]],
        [[2, 2], [4, 2], [6, 2], [8, 6], [14, 2]], [[0, 6], [6, 2], [8, 4], [12, 4]]],
      cad: [[[0, 8], [8, 8]], [[0, 4], [4, 12]], [[0, 2], [2, 2], [4, 12]]],
      moves: [-2, -1, -1, 0, 1, 1, 2, -3, 3],
      vary: function (P, L) {
        var V = P.v; V.inst = L ? pick(['ocarina', 'ocarina', 'zheng', 'marimba']) : 'ocarina'; V.mel = L % 4 !== 3; V.from = L ? 0 : 2;
        V.bl = pick(BL); V.mp = pick(MP); V.k7 = rnd() < 0.5;
      },
      step: function (P, b, s, t, sd, c) {
        var V = P.v, bl = V.bl[s];
        if (s === 0) pad(P.bus, t, c.p, sd * 16, 0.05, { type: 'triangle', cut: 1800, atk: 0.25, rel: 0.6 });
        if (bl !== undefined) syn(P.bus, t, mtof(c.b + bl), sd * 1.7, s ? 0.19 : 0.26, { type: 'triangle', cut: 1200, env: 2.2, envT: 0.04, atk: 0.005, dec: 0.18, sus: 0.25, rel: 0.06 });
        for (var i = 0; i < V.mp.length; i++) if (V.mp[i][0] === s) fm(P.bus, t, mtof(c.p[V.mp[i][1]] + 12), 0.075, 4, 1.3, 0.16);
        if (s === 0 || s === 8 || (V.k7 && s === 7 && b % 2)) kick(P.bus, t, 0.36, 125, 50, 0.08);
        if (s === 4 || s === 12) clap(P.bus, t, 0.12);
        hat(P.bus, t, s % 2 ? 0.02 : (s % 4 === 2 ? 0.055 : 0.035), false);
      },
      lead: function (P, n, t, sd) {
        var f = mtof(n.n), i = P.v.inst;
        if (i === 'zheng') pluck(P.lead, t, f, 0.32 * n.v, 'zheng', { vib: n.d >= 6, bend: n.d >= 4 && rnd() < 0.12 });
        else if (i === 'marimba') fm(P.lead, t, f, 0.16 * n.v, 4, 1.2, 0.22);
        else syn(P.lead, t, f, n.d * sd * 0.85, 0.13 * n.v, { type: 'triangle', atk: 0.03, rel: 0.12, vib: n.d >= 4 ? 14 : 0 });
      }
    };
  })();

  // ---- players & lookahead scheduler -------------------------------------------
  function makePlayer(name, now) {
    var th = prep(THEMES[name]), sd = 60 / th.bpm / 4;
    var P = { name: name, th: th, sd: sd, next: now + 0.1, step: 0, loop: 0, mel: null, v: {}, endAt: 0 };
    P.out = ctx.createGain(); P.out.gain.setValueAtTime(0, now); P.out.gain.linearRampToValueAtTime(1, now + XF);
    P.out.connect(M.mix);
    P.wet = ctx.createGain(); P.wet.gain.value = th.wet; P.out.connect(P.wet); P.wet.connect(M.verb);
    P.bus = ctx.createGain(); P.bus.gain.value = th.gain; P.bus.connect(P.out);
    P.lead = ctx.createGain(); P.lead.gain.value = th.gain; P.lead.connect(P.out);
    P.dl = ctx.createDelay(2); P.dl.delayTime.value = Math.min(1.9, th.echo * sd);
    P.fb = ctx.createGain(); P.fb.gain.value = th.fb;
    P.df = ctx.createBiquadFilter(); P.df.type = 'lowpass'; P.df.frequency.value = 2400;
    P.eg = ctx.createGain(); P.eg.gain.value = th.emix;
    P.lead.connect(P.dl); P.dl.connect(P.df); P.df.connect(P.fb); P.fb.connect(P.dl); P.df.connect(P.eg); P.eg.connect(P.out);
    return P;
  }
  function dispose(P) {
    ['out', 'wet', 'bus', 'lead', 'dl', 'fb', 'df', 'eg'].forEach(function (k) { try { P[k].disconnect(); } catch (e) {} });
  }
  function runStep(P) {
    var th = P.th, sd = P.sd, i = P.step % (16 * th.bars), b = (i / 16) | 0, s = i % 16;
    if (i === 0) vary(P);
    var t = P.next + (s % 2 ? th.swing * sd : 0);
    if (t >= ctx.currentTime - 0.01) {
      try {
        var c = th.chords[b], bar = P.mel[b];
        th.step(P, b, s, t, sd, c);
        if (P.v.mel && b >= P.v.from) for (var k = 0; k < bar.length; k++) if (bar[k].s === s) th.lead(P, bar[k], t, sd, c);
      } catch (e) {}
    }
    P.next += sd; P.step++;
  }
  function tick() {
    try {
      if (!ctx || !M) return;
      level(false);
      var now = ctx.currentTime, hold = silent() || ctx.state !== 'running';
      for (var i = players.length - 1; i >= 0; i--) {
        var P = players[i];
        if (P.endAt && now > P.endAt + 0.3) { dispose(P); players.splice(i, 1); continue; }
        if (hold) { if (P.next < now + 0.05) P.next = now + 0.05; continue; } // muted / suspended: pause in place
        if (P.next < now - 0.25) P.next = now + 0.05; // timer was starved: skip ahead instead of bursting
        var until = now + AHEAD, guard = 0;
        if (P.endAt && P.endAt < until) until = P.endAt;
        while (P.next < until && guard++ < 64) runStep(P);
      }
      if (!players.length) stopTimer();
    } catch (e) {}
  }
  function startTimer() {
    if (timer || (typeof document !== 'undefined' && document.hidden)) return;
    timer = setInterval(tick, TICK);
    tick();
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function live() { for (var i = 0; i < players.length; i++) if (!players[i].endAt) return players[i]; return null; }
  function apply() {
    if (!minit()) return;
    wake();
    var L = live();
    if (L && L.name === cur) return;
    if (L) { glide(L.out.gain, 0, XF); L.endAt = ctx.currentTime + XF; }
    if (cur) players.push(makePlayer(cur, ctx.currentTime));
    level(false);
    if (players.length) startTimer();
  }

  // ---- autoplay policy: only start after a user gesture ------------------------------
  var GEST = ['pointerdown', 'mousedown', 'touchend', 'keydown'];
  function activated() {
    try { var ua = navigator.userActivation; return !ua || ua.hasBeenActive; } catch (e) { return true; }
  }
  function hook() {
    if (hooked || typeof window === 'undefined' || !window.addEventListener) return;
    hooked = true;
    GEST.forEach(function (e) { window.addEventListener(e, onGesture, true); });
  }
  function unhook() {
    if (!hooked) return;
    hooked = false;
    GEST.forEach(function (e) { window.removeEventListener(e, onGesture, true); });
  }
  function onGesture() {
    try {
      if (cur && !M) apply(); else wake();
      if (ctx && ctx.state === 'running') unhook();
    } catch (e) {}
  }
  function wake() {
    try {
      if (ctx && ctx.state !== 'running' && ctx.resume) {
        hook();
        var pr = ctx.resume();
        if (pr && pr.then) pr.then(function () { if (ctx.state === 'running') unhook(); }, function () {});
      }
    } catch (e) {}
  }

  // ---- public API ------------------------------------------------------------------
  SFX.music = function (theme) {
    try {
      var name = theme ? String(theme) : null;
      if (name && !THEMES.hasOwnProperty(name)) return;
      cur = name;
      if (!ctx) {
        if (!name) return;
        if (!activated()) { hook(); return; } // remembered; starts on the first gesture
      }
      apply();
    } catch (e) {}
  };

  SFX.toggleMusic = function () {
    try {
      SFX.musicMuted = !SFX.musicMuted;
      try { localStorage.setItem(MKEY, SFX.musicMuted ? '1' : '0'); } catch (e) {}
      level(true);
      if (!SFX.musicMuted && cur && M) apply();
    } catch (e) {}
    return SFX.musicMuted;
  };

  try {
    document.addEventListener('visibilitychange', function () {
      try {
        if (!ctx || !M) return;
        level(true);
        if (document.hidden) { stopTimer(); return; }
        var now = ctx.currentTime;
        players.forEach(function (P) { if (P.next < now + 0.05) P.next = now + 0.05; });
        if (players.length) startTimer();
      } catch (e) {}
    });
  } catch (e) {}

  window.SFX = SFX;
})();
