/* scenery_asia.js - painted backgrounds for Hong Kong, Thailand and Singapore.
   Plain browser script. SCENES[key] = { paint(ctx,w,h), overlay(ctx,w,h,t) }.
   paint() is cached by the game per size (see painted() in game.html), so it can be rich; overlay() runs every frame,
   so it only draws a few cached sprites and light strokes (boats, water shimmer, lights, birds, steam).
   Every sign, building, boat and garden here is original: no real brands, logos or trademarked designs. */
(function () {
  'use strict';
  var SC = (window.SCENES = window.SCENES || {});
  var PI = Math.PI, TAU = PI * 2;

  /* ---------------- utilities ---------------- */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0; var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(i, s) {
    var x = Math.imul((i | 0) ^ Math.imul(s | 0, 0x9E3779B1), 0x27d4eb2d);
    x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }
  function vnoise(x, s) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, s) * (1 - u) + hash(i + 1, s) * u; }
  function fbm(x, s, oct) { var v = 0, a = 0.5, fr = 1, n = 0; for (var o = 0; o < (oct || 5); o++) { v += a * vnoise(x * fr, s + o * 131); n += a; a *= 0.5; fr *= 2.07; } return v / n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  function mix(c1, c2, t) { var a = hex(c1), b = hex(c2); return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')'; }
  function mixh(c1, c2, t) { var a = hex(c1), b = hex(c2), f = function (i) { var v = Math.round(lerp(a[i], b[i], t)); return (v < 16 ? '0' : '') + v.toString(16); }; return '#' + f(0) + f(1) + f(2); }
  function rgba(c, al) { var a = hex(c); return 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + (+al).toFixed(3) + ')'; }
  function lg(ctx, x0, y0, x1, y1, st) { var g = ctx.createLinearGradient(x0, y0, x1, y1); for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]); return g; }
  function rg(ctx, x, y, r0, r1, st) { var g = ctx.createRadialGradient(x, y, r0, x, y, Math.max(r0 + 0.1, r1)); for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]); return g; }
  // scale: 1 at the phone's play area (328x339), smaller for map thumbnails
  function scl(w, h) { return Math.max(0.3, Math.min(w / 328, h / 339)); }
  // detail budget: fewer strokes on small canvases (map thumbnails paint 9 scenes at once)
  function dens(w, h) { return clamp(w * h / (328 * 339), 0.18, 2.2); }

  function ridge(ctx, x0, x1, step, fy, yb, fill) {
    ctx.beginPath(); ctx.moveTo(x0, yb);
    for (var x = x0; x <= x1 + step; x += step) ctx.lineTo(Math.min(x, x1), fy(Math.min(x, x1)));
    ctx.lineTo(x1, yb); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  }
  function glow(ctx, x, y, r, col, a) {
    ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(col, a)], [0.35, rgba(col, a * 0.35)], [1, rgba(col, 0)]]);
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function haze(ctx, x0, y0, x1, y1, col, a) {
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = Math.max(1, (x1 - x0) / 2), ry = Math.max(1, (y1 - y0) / 2);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx);
    ctx.fillStyle = rg(ctx, 0, 0, 0, rx, [[0, rgba(col, a)], [0.55, rgba(col, a * 0.7)], [1, rgba(col, 0)]]);
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore();
  }
  function band(ctx, x0, x1, y0, y1, col, a0, a1) { ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, rgba(col, a0)], [1, rgba(col, a1)]]); ctx.fillRect(x0, y0, x1 - x0, y1 - y0); }
  var grainCv = null;
  function finish(ctx, w, h, gradeCol, gradeA, vig, grainA) {
    try {
      ctx.save();
      if (gradeCol) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = gradeA; ctx.fillStyle = gradeCol; ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      var R = Math.max(w, h) * 0.85;
      if (vig) { ctx.fillStyle = rg(ctx, w / 2, h * 0.5, R * 0.45, R, [[0, 'rgba(14,12,26,0)'], [1, 'rgba(14,12,26,' + vig + ')']]); ctx.fillRect(0, 0, w, h); }
      if (!grainCv && typeof document !== 'undefined') {
        grainCv = document.createElement('canvas'); grainCv.width = grainCv.height = 128;
        var g = grainCv.getContext('2d'), id = g.createImageData(128, 128), r = rng(4243), i, v;
        for (i = 0; i < 128 * 128; i++) { v = (r() * 255) | 0; id.data[i * 4] = v; id.data[i * 4 + 1] = v; id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
        g.putImageData(id, 0, 0);
      }
      if (grainCv && grainA) { ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grainA; ctx.fillStyle = ctx.createPattern(grainCv, 'repeat'); ctx.fillRect(0, 0, w, h); }
      ctx.restore();
    } catch (e) { try { ctx.restore(); } catch (e2) {} }
  }
  /* batched short strokes: gen(i) -> [x0,y0,x1,y1,bucket(,cx,cy)] ; cols = [[style,width,alpha],...] */
  function batch(ctx, n, cols, gen) {
    var paths = [], i, k; for (k = 0; k < cols.length; k++) paths.push([]);
    for (i = 0; i < n; i++) { var s = gen(i); if (s) paths[s[4]].push(s); }
    ctx.save(); ctx.lineCap = 'round';
    for (k = 0; k < cols.length; k++) {
      var p = paths[k]; if (!p.length) continue; ctx.beginPath();
      for (i = 0; i < p.length; i++) { ctx.moveTo(p[i][0], p[i][1]); if (p[i].length > 5) ctx.quadraticCurveTo(p[i][5], p[i][6], p[i][2], p[i][3]); else ctx.lineTo(p[i][2], p[i][3]); }
      ctx.strokeStyle = cols[k][0]; ctx.lineWidth = cols[k][1]; ctx.globalAlpha = cols[k][2]; ctx.stroke();
    }
    ctx.restore();
  }
  /* batched dots: gen(i) -> [x,y,r,bucket] ; cols = [[style,alpha],...] */
  function dots(ctx, n, cols, gen) {
    var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]);
    for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[3]].push(d); }
    ctx.save();
    for (k = 0; k < cols.length; k++) {
      ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath();
      for (i = 0; i < b[k].length; i++) { var q = b[k][i]; ctx.moveTo(q[0] + q[2], q[1]); ctx.arc(q[0], q[1], q[2], 0, TAU); }
      ctx.fill();
    }
    ctx.restore();
  }
  /* batched rectangles (windows, lights): gen(i) -> [x,y,w,h,bucket] */
  function rects(ctx, list, cols) {
    var b = [], i, k; for (k = 0; k < cols.length; k++) b.push([]);
    for (i = 0; i < list.length; i++) b[list[i][4]].push(list[i]);
    ctx.save();
    for (k = 0; k < cols.length; k++) { if (!b[k].length) continue; ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath(); for (i = 0; i < b[k].length; i++) { var q = b[k][i]; ctx.rect(q[0], q[1], q[2], q[3]); } ctx.fill(); }
    ctx.restore();
  }
  /* batched pointed leaves: gen(i) -> [x, y, length, angle, bucket] ; cols = [[style, alpha], ...] */
  function leaves(ctx, n, cols, gen) {
    var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]);
    for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); }
    ctx.save();
    for (k = 0; k < cols.length; k++) {
      ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath();
      for (i = 0; i < b[k].length; i++) { var q = b[k][i], ca = Math.cos(q[3]), sa = Math.sin(q[3]), tx = q[0] + ca * q[2], ty = q[1] + sa * q[2], mx = (q[0] + tx) / 2, my = (q[1] + ty) / 2, wd = q[2] * 0.32;
        ctx.moveTo(q[0], q[1]); ctx.quadraticCurveTo(mx - sa * wd, my + ca * wd, tx, ty); ctx.quadraticCurveTo(mx + sa * wd, my - ca * wd, q[0], q[1]); }
      ctx.fill();
    }
    ctx.restore();
  }
  /* offscreen sprites for the overlays, cached per size */
  var SPR = {};
  function sprite(id, w, h, fn) {
    var d = (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1, k = id + '|' + Math.round(w) + 'x' + Math.round(h) + '@' + d;
    if (SPR[k]) return SPR[k];
    var cv = document.createElement('canvas'); cv.width = Math.max(1, Math.ceil(w * d)); cv.height = Math.max(1, Math.ceil(h * d));
    var c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); try { fn(c, w, h); } catch (e) { SC._err = String(e && e.stack || e); }
    var ks = Object.keys(SPR); if (ks.length > 80) delete SPR[ks[0]];
    return (SPR[k] = cv);
  }
  function soft(ctx, x, y, rx, ry, col, a) { haze(ctx, x - rx, y - ry, x + rx, y + ry, col, a); }

  /* ---------------- shared props ---------------- */
  /* coconut palm: base (x,yb), height H, lean (fraction of H to the side), colours {trunk, trunkD, frond, frondD, nut} */
  function palm(ctx, x, yb, H, lean, o, seed, sway) {
    var r = rng(seed || 7), s = H / 100, tx = x + lean * H, ty = yb - H, cx = x + lean * H * 0.15, cy = yb - H * 0.55;
    var tw = Math.max(1.2, 3.4 * s), i;
    // trunk: tapered curve with ring marks
    ctx.save(); ctx.lineCap = 'round';
    var N = 14, pts = [];
    for (i = 0; i <= N; i++) { var t = i / N, m = 1 - t; pts.push([m * m * x + 2 * m * t * cx + t * t * tx, m * m * yb + 2 * m * t * cy + t * t * ty, lerp(tw, tw * 0.6, t)]); }
    ctx.beginPath();
    for (i = 0; i <= N; i++) ctx.lineTo(pts[i][0] - pts[i][2], pts[i][1]);
    for (i = N; i >= 0; i--) ctx.lineTo(pts[i][0] + pts[i][2], pts[i][1]);
    ctx.closePath(); ctx.fillStyle = lg(ctx, x - tw, 0, x + tw, 0, [[0, o.trunkD], [0.55, o.trunk], [1, o.trunkD]]); ctx.fill();
    ctx.strokeStyle = o.trunkD; ctx.globalAlpha = 0.55; ctx.lineWidth = Math.max(0.4, 0.5 * s); ctx.beginPath();
    for (i = 1; i < N; i++) { ctx.moveTo(pts[i][0] - pts[i][2], pts[i][1]); ctx.lineTo(pts[i][0] + pts[i][2], pts[i][1] - 0.6 * s); }
    ctx.stroke(); ctx.globalAlpha = 1;
    // fronds
    var nf = 9 + ((r() * 3) | 0), sw = sway || 0;
    var fr = [];
    for (i = 0; i < nf; i++) {
      var a = -PI / 2 + (i / (nf - 1) - 0.5) * PI * 1.25 + (r() - 0.5) * 0.25 + sw * 0.08;
      fr.push({ a: a, L: H * (0.36 + r() * 0.12), back: i % 2 === 0, droop: 0.55 + r() * 0.5 });
    }
    fr.sort(function (p, q) { return (q.back ? 1 : 0) - (p.back ? 1 : 0); });
    for (i = 0; i < fr.length; i++) {
      var f = fr[i], ca = Math.cos(f.a), sa = Math.sin(f.a), L = f.L;
      var ex = tx + ca * L, ey = ty + sa * L * 0.5 + L * 0.5 * f.droop, mx = tx + ca * L * 0.55, my = ty + sa * L * 0.55 - L * 0.1;
      var col = f.back ? o.frondD : o.frond, nl = 26;
      ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.5, 0.75 * s); ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
      ctx.lineWidth = Math.max(0.4, 0.42 * s); ctx.beginPath();
      for (var k = 3; k <= nl; k++) {
        var t2 = k / nl, m2 = 1 - t2, px = m2 * m2 * tx + 2 * m2 * t2 * mx + t2 * t2 * ex, py = m2 * m2 * ty + 2 * m2 * t2 * my + t2 * t2 * ey;
        var dx = 2 * m2 * (mx - tx) + 2 * t2 * (ex - mx), dy = 2 * m2 * (my - ty) + 2 * t2 * (ey - my), dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
        var ll = L * 0.24 * Math.pow(Math.sin(PI * Math.min(1, 0.15 + t2 * 0.9)), 0.7) * (0.85 + 0.3 * r());
        for (var sd = -1; sd <= 1; sd += 2) {
          var ax = dx * 0.45 - sd * dy * 0.9, ay = dy * 0.45 + sd * dx * 0.9, ln = Math.hypot(ax, ay); ax /= ln; ay /= ln;
          var qx = px + ax * ll, qy = py + ay * ll + ll * 0.32;
          ctx.moveTo(px, py); ctx.quadraticCurveTo(px + ax * ll * 0.6, py + ay * ll * 0.6 - ll * 0.05, qx, qy);
        }
      }
      ctx.stroke();
      if (!f.back && o.lit) { ctx.strokeStyle = o.lit; ctx.globalAlpha = 0.5; ctx.lineWidth = Math.max(0.4, 0.5 * s); ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(mx, my - 0.5 * s, ex, ey); ctx.stroke(); ctx.globalAlpha = 1; }
    }
    if (o.nut) { for (i = 0; i < 4; i++) { ctx.fillStyle = o.nut; ctx.beginPath(); ctx.arc(tx + (i - 1.5) * 1.6 * s, ty + 2.2 * s + (i % 2) * 1.2 * s, Math.max(0.8, 1.6 * s), 0, TAU); ctx.fill(); } }
    ctx.restore();
  }
  /* soaring bird (a kite or a gull): an M-shaped silhouette with flapping wings */
  function bird(ctx, x, y, sz, flap, col) {
    var f = Math.sin(flap) * 0.5;
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.8, sz * 0.16); ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(x - sz, y - sz * (0.15 + f)); ctx.quadraticCurveTo(x - sz * 0.45, y - sz * (0.45 + f * 0.6), x, y);
    ctx.quadraticCurveTo(x + sz * 0.45, y - sz * (0.45 + f * 0.6), x + sz, y - sz * (0.15 + f)); ctx.stroke();
  }
  /* fixed-step "random" in an overlay without allocating: deterministic value per index */
  function h1(i, s) { return hash(i, s || 1); }

  /* ======================= HONG KONG · VICTORIA HARBOUR (dusk) ======================= */
  function hkhLayout(w, h) { return { hz: h * 0.425, rail: h * 0.605, s: scl(w, h), k: dens(w, h) }; }
  var HKH = {}; // per-size data the overlay needs (tower tops, reflection columns)
  SC.hkharbour = {
    paint: function (ctx, w, h) {
      try {
        var L = hkhLayout(w, h), hz = L.hz, s = L.s, k = L.k, r = rng(8801), i, x, y;
        var D = HKH[w + 'x' + h] = { tops: [], cols: [] };
        /* sky: dusk, the sun just set behind the island on the right */
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, [[0, '#0f1338'], [0.22, '#232864'], [0.4, '#45397f'], [0.55, '#7d4b8a'], [0.66, '#c86682'], [0.76, '#f39270'], [0.88, '#ffc08a'], [1, '#ffd9a8']]);
        ctx.fillRect(0, 0, w, hz + 2);
        glow(ctx, w * 0.9, h * 0.31, Math.max(w, h) * 0.62, '#ff9a62', 0.55);
        glow(ctx, w * 0.92, h * 0.3, w * 0.25, '#fff1c4', 0.6);
        glow(ctx, w * 0.08, h * 0.22, w * 0.55, '#6a4fa8', 0.3);
        dots(ctx, Math.round(70 * k), [['#ffffff', 0.85], ['#ffe9c8', 0.6]], function () { var yy = Math.pow(r(), 1.8) * h * 0.2; return [r() * w, yy, (0.35 + r() * 0.5) * s, r() < 0.7 ? 0 : 1]; });
        // long dusk clouds, purple on top and lit pink-gold from below
        for (i = 0; i < 10; i++) {
          var cy = h * (0.05 + Math.pow(r(), 0.8) * 0.21), cx = r() * w * 1.2 - w * 0.1, cw = w * (0.16 + r() * 0.34), ch = h * (0.005 + r() * 0.011), u = cy / (h * 0.27);
          haze(ctx, cx - cw, cy - ch * 2.2, cx + cw, cy + ch * 1.6, mixh('#2e2860', '#6a3f78', u), 0.6);
          haze(ctx, cx - cw * 0.8, cy + ch * 0.5, cx + cw * 0.8, cy + ch * 2.2, mixh('#ff8fb8', '#ffbe7a', u), 0.3 + u * 0.4);
        }
        /* the island's ridge (the Peak) behind the city */
        function rFar(x) { var u = x / w; return h * (0.29 - 0.06 * Math.exp(-Math.pow((u - 0.3) / 0.17, 2)) - 0.04 * Math.exp(-Math.pow((u - 0.74) / 0.13, 2))) - h * 0.025 * fbm(u * 3 + 0.2, 31, 4); }
        function rNear(x) { var u = x / w; return h * (0.345 - 0.035 * Math.exp(-Math.pow((u - 0.5) / 0.2, 2)) - 0.025 * Math.exp(-Math.pow((u - 0.1) / 0.1, 2))) - h * 0.02 * fbm(u * 4 + 3, 32, 4); }
        ridge(ctx, -2, w + 2, 2, rFar, hz + 2, lg(ctx, 0, h * 0.2, 0, hz, [[0, '#4a3c78'], [0.6, '#6a4c84'], [1, '#9a688a']]));
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; haze(ctx, w * 0.55, h * 0.18, w * 1.25, h * 0.38, '#ff9a6a', 0.22); ctx.restore();
        ctx.save(); ridge(ctx, -2, w + 2, 2, rFar, hz + 2, null); ctx.clip();
        for (i = 0; i < 26; i++) { var vx = r() * w, vy = rFar(vx) + r() * h * 0.06; soft(ctx, vx, vy, w * (0.04 + r() * 0.06), h * (0.01 + r() * 0.015), r() < 0.5 ? '#3a3068' : '#8a5a8a', 0.35); }
        ctx.restore();
        ridge(ctx, -2, w + 2, 2, rNear, hz + 2, lg(ctx, 0, h * 0.3, 0, hz, [[0, '#2a2858'], [1, '#433868']]));
        dots(ctx, Math.round(240 * k), [['#ffd99a', 0.8], ['#f6f2ff', 0.6]], function () { var xx = r() * w, top = rNear(xx), yy = lerp(top + h * 0.008, hz, Math.pow(r(), 0.7)); return [xx, yy, (0.3 + r() * 0.35) * s, r() < 0.7 ? 0 : 1]; });
        ctx.strokeStyle = 'rgba(255,214,150,0.6)'; ctx.lineWidth = Math.max(0.4, 0.6 * s); ctx.setLineDash([1.2 * s, 1.6 * s]); ctx.beginPath();
        for (x = w * 0.04; x < w * 0.6; x += 2) { y = rNear(x) + h * 0.01 + Math.sin(x / w * 16) * h * 0.005 + (x / w) * h * 0.012; if (x === w * 0.04) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.stroke(); ctx.setLineDash([]);
        /* mid-levels: slim residential towers climbing the slope, hazy */
        var mids = [];
        for (x = -4; x < w + 4;) { var bw = (3 + r() * 5) * s, base = hz - h * 0.03, top = Math.max(rNear(x) + h * 0.012, base - h * (0.03 + r() * 0.06)); mids.push([x, top, bw, base - top]); x += bw * (0.75 + r() * 0.6); }
        mids.forEach(function (m) { ctx.fillStyle = lg(ctx, 0, m[1], 0, m[1] + m[3], [[0, '#5d5390'], [1, '#3c386a']]); ctx.fillRect(m[0], m[1], m[2], m[3] + h * 0.04); });
        var mw = [];
        mids.forEach(function (m) { for (var yy = m[1] + 1.2 * s; yy < m[1] + m[3]; yy += 1.9 * s) for (var xx = m[0] + 0.6 * s; xx < m[0] + m[2] - 0.6 * s; xx += 1.5 * s) if (r() < 0.3) mw.push([xx, yy, 0.8 * s, 0.7 * s, r() < 0.75 ? 0 : 1]); });
        rects(ctx, mw, [['#ffd898', 0.7], ['#e8f0ff', 0.55]]);
        haze(ctx, -w * 0.2, hz - h * 0.09, w * 1.2, hz + h * 0.02, '#c27a98', 0.4);
        /* the waterfront skyline */
        var B = [], TALL = [[0.29, 0.085, 17, 'crown'], [0.645, 0.15, 14, 'slant'], [0.835, 0.185, 12, 'ring'], [0.125, 0.18, 15, 'led'], [0.485, 0.165, 11, 'spire']];
        for (x = -6; x < w + 6;) {
          var u0 = x / w, bw2 = (6 + r() * 11) * s, bh = h * (0.035 + r() * 0.065 + 0.035 * Math.sin(u0 * PI));
          B.push({ x: x, w: bw2, h: bh, kind: r() < 0.4 ? 'bands' : 'grid', hue: r(), lit: 0.28 + r() * 0.35, light: r() < 0.55 ? 0 : r() < 0.6 ? 1 : 2, accent: r() < 0.2 ? ['#ff5fb0', '#5fe6ff', '#8cff8a', '#ffd25f', '#b48cff'][(r() * 5) | 0] : null });
          x += bw2 * (0.72 + r() * 0.35);
        }
        TALL.forEach(function (t) { B.push({ x: w * t[0] - t[2] * s / 2, w: t[2] * s, h: hz - h * t[1], tall: t[3], kind: 'bands', lit: 0.6, light: t[3] === 'ring' ? 2 : t[3] === 'spire' ? 1 : 0, accent: null }); });
        // short ones first, the tall ones last so they stand in front of their neighbours
        B.sort(function (a, b) { return (a.tall ? 1 : 0) - (b.tall ? 1 : 0) || a.h - b.h; });
        var win = [], refl = [], LC = ['#ffd27e', '#f5f3e6', '#9fe0ff'];
        B.forEach(function (b, n) {
          var top = hz - b.h, x0 = b.x, x1 = b.x + b.w, bw = b.w;
          ctx.fillStyle = lg(ctx, 0, top, 0, hz, [[0, b.tall ? '#646aa2' : mixh('#4a5088', '#6c5a8c', b.hue || 0)], [1, '#1a1e42']]);
          if (b.tall === 'slant') { ctx.beginPath(); ctx.moveTo(x0, hz); ctx.lineTo(x0, top + bw * 0.8); ctx.lineTo(x1, top); ctx.lineTo(x1, hz); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#c8d4ff'; ctx.fillRect(x1 - 0.5 * s, top - 7 * s, Math.max(0.5, 0.7 * s), 7 * s); }
          else if (b.tall === 'crown') {
            ctx.fillRect(x0, top + 7 * s, bw, b.h); ctx.fillRect(x0 + bw * 0.1, top + 3.5 * s, bw * 0.8, 4 * s); ctx.fillRect(x0 + bw * 0.24, top, bw * 0.52, 4 * s);
            for (i = 0; i < 4; i++) { ctx.fillRect(x0 + bw * (0.28 + i * 0.13), top - 4 * s, bw * 0.06, 4.5 * s); }
          }
          else if (b.tall === 'ring') { ctx.beginPath(); ctx.moveTo(x0, hz); ctx.lineTo(x0 + bw * 0.06, top + 4 * s); ctx.quadraticCurveTo(x0 + bw / 2, top - 3 * s, x1 - bw * 0.06, top + 4 * s); ctx.lineTo(x1, hz); ctx.closePath(); ctx.fill(); }
          else if (b.tall === 'spire') { ctx.fillRect(x0, top + 5 * s, bw, b.h); ctx.beginPath(); ctx.moveTo(x0 + bw * 0.15, top + 5 * s); ctx.lineTo(x0 + bw * 0.5, top - 8 * s); ctx.lineTo(x0 + bw * 0.85, top + 5 * s); ctx.fill(); }
          else ctx.fillRect(x0, top, bw, b.h + 1);
          if (b.tall === 'led') { // a tower with a lit colour-gradient facade
            ctx.fillStyle = lg(ctx, 0, top, 0, hz, [[0, '#ff6fc0'], [0.45, '#a06cff'], [1, '#3a8cff']]); ctx.globalAlpha = 0.75; ctx.fillRect(x0 + 1.2 * s, top + 1.2 * s, bw - 2.4 * s, b.h - 2 * s); ctx.globalAlpha = 1;
            ctx.fillStyle = 'rgba(20,10,40,0.35)'; for (y = top + 2 * s; y < hz; y += 2.4 * s) ctx.fillRect(x0 + 1.2 * s, y, bw - 2.4 * s, 0.8 * s);
            glow(ctx, x0 + bw / 2, top + b.h * 0.35, bw * 2.2, '#c86cff', 0.25);
          }
          // the last of the sunset on the west (right) faces, shade on the east
          ctx.fillStyle = 'rgba(255,165,130,0.2)'; ctx.fillRect(x1 - bw * 0.3, top + (b.tall === 'slant' ? 2 * s : 0), bw * 0.3, b.h);
          ctx.fillStyle = 'rgba(10,10,30,0.2)'; ctx.fillRect(x0, top, bw * 0.16, b.h);
          var y0 = top + (b.tall === 'crown' ? 9 * s : b.tall ? 5 * s : 1.6 * s);
          if (b.tall && b.tall !== 'led') { // office floors: bright bands broken by mullions
            for (y = y0; y < hz - 1.6 * s; y += 2.2 * s) if (r() < 0.72) win.push([x0 + 1 * s, y, bw - 2 * s, 0.8 * s, b.light]);
          } else if (b.kind === 'bands') {
            for (y = y0; y < hz - 1.5 * s; y += 2.3 * s) if (r() < b.lit + 0.25) win.push([x0 + 0.8 * s, y, bw - 1.6 * s, 0.75 * s, b.light]);
          } else if (!b.tall) {
            for (y = y0; y < hz - 1.2 * s; y += 2.1 * s) for (x = x0 + 0.9 * s; x < x1 - 1.2 * s; x += 1.9 * s) if (r() < b.lit) win.push([x, y, 1 * s, 0.85 * s, r() < 0.7 ? b.light : (r() * 3) | 0]);
          }
          if (b.accent) { ctx.fillStyle = b.accent; ctx.globalAlpha = 0.9; if (n % 2) ctx.fillRect(x0 + bw * 0.45, top + 1 * s, Math.max(0.6, 0.8 * s), b.h); else { ctx.fillRect(x0, top, bw, Math.max(0.6, 0.8 * s)); ctx.fillRect(x0, top, Math.max(0.6, 0.7 * s), b.h * 0.5); } ctx.globalAlpha = 1; glow(ctx, x0 + bw / 2, top + b.h * 0.3, bw * 1.2, b.accent, 0.2); }
          if (b.tall) D.tops.push([x0 + bw / 2, top - (b.tall === 'crown' ? 4 * s : b.tall === 'spire' ? 8 * s : b.tall === 'slant' ? 7 * s : 0), b.tall]);
          refl.push({ x: x0, w: bw, h: b.h, c: b.tall === 'led' ? '#d07cff' : b.accent || LC[b.light], lit: b.tall ? 0.9 : b.lit });
        });
        rects(ctx, win, [['#ffd27e', 0.88], ['#f5f3e6', 0.8], ['#9fe0ff', 0.75]]);
        // mullions over the office bands of the tall towers
        ctx.fillStyle = 'rgba(30,30,70,0.5)';
        B.forEach(function (b) { if (!b.tall || b.tall === 'led') return; for (x = b.x + 2.2 * s; x < b.x + b.w - 1 * s; x += 2.4 * s) ctx.fillRect(x, hz - b.h + 6 * s, Math.max(0.4, 0.5 * s), b.h - 6 * s); });
        // crown lights and aircraft warning lights
        D.tops.forEach(function (t, n) { var c = ['#9fd8ff', '#ff8fd0', '#ffe27a', '#a8ffb0', '#d0b8ff'][n % 5]; glow(ctx, t[0], t[1] + 6 * s, 12 * s, c, 0.55); });
        B.forEach(function (b) { if (b.tall === 'ring') { ctx.strokeStyle = '#bfe8ff'; ctx.lineWidth = Math.max(0.6, 1 * s); ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, hz - b.h + 2 * s, b.w * 0.42, 1.4 * s, 0, 0, TAU); ctx.stroke(); } });
        D.tops.forEach(function (t) { glow(ctx, t[0], t[1], 3 * s, '#ff3a2a', 0.9); ctx.fillStyle = '#ff6a5a'; ctx.beginPath(); ctx.arc(t[0], t[1], Math.max(0.6, 0.8 * s), 0, TAU); ctx.fill(); });
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; band(ctx, 0, w, hz - h * 0.05, hz + 1, '#ffb070', 0, 0.2); ctx.restore();
        ctx.fillStyle = '#16183a'; ctx.fillRect(0, hz - 1.2 * s, w, 2.4 * s);
        dots(ctx, Math.round(110 * k), [['#ffe2a8', 0.95], ['#fff', 0.8]], function (n) { return [n / (110 * k) * w + r() * 2, hz - 0.1 * s, (0.3 + r() * 0.3) * s, r() < 0.8 ? 0 : 1]; });
        /* water */
        var wb = L.rail;
        ctx.fillStyle = lg(ctx, 0, hz, 0, wb, [[0, '#3c3264'], [0.15, '#262859'], [0.6, '#181c42'], [1, '#101432']]);
        ctx.fillRect(0, hz, w, wb - hz + 2);
        haze(ctx, w * 0.6, hz, w * 1.15, wb + h * 0.06, '#ff9a6a', 0.3);
        haze(ctx, w * 0.8, hz, w * 1.02, hz + h * 0.09, '#ffd0a0', 0.3);
        // light columns: each building's glow wobbling down the water, brightest near the shore
        var C = []; for (i = 0; i < 6; i++) C.push([]);
        var pal = ['#ffd27e', '#f5f3e6', '#9fe0ff', '#ff7fc8', '#9cff9c', '#d07cff'];
        refl.forEach(function (b) {
          var ci = Math.max(0, pal.indexOf(b.c)); if (ci < 0) ci = 0; if (b.c === '#5fe6ff') ci = 2; if (b.c === '#ff5fb0' || b.c === '#b48cff') ci = 3; if (b.c === '#8cff8a') ci = 4; if (b.c === '#ffd25f') ci = 0;
          var len = Math.min(b.h * 1.25, wb - hz - 1 * s), n = Math.round((len / (1.4 * s)) * (0.5 + b.lit) * 0.8 * Math.min(1.6, b.w / (8 * s)));
          for (var q = 0; q < n; q++) {
            var d = Math.pow(r(), 1.15), yy = hz + 1.4 * s + d * len, jit = Math.sin(yy * 0.75 + b.x) * 1.2 * s + (r() - 0.5) * b.w * 0.25, l = b.w * (0.15 + r() * 0.45) * (1 - d * 0.4);
            if (r() < d * 0.75) continue;
            var xx = b.x + b.w / 2 + jit; C[ci].push([xx - l / 2, yy, xx + l / 2, yy, ci]);
          }
          if (b.h > h * 0.11) D.cols.push([b.x + b.w / 2, b.w, len]);
        });
        ctx.save(); ctx.lineCap = 'round';
        C.forEach(function (list, ci) { if (!list.length) return; ctx.strokeStyle = pal[ci]; ctx.lineWidth = Math.max(0.5, 0.75 * s); ctx.globalAlpha = ci < 3 ? 0.55 : 0.6; ctx.beginPath(); list.forEach(function (q) { ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); }); ctx.stroke(); });
        ctx.restore();
        D.tops.forEach(function (t) { glow(ctx, t[0], hz + (hz - t[1]) * 0.55, 10 * s, '#ffe0b0', 0.12); });
        // the sky's glow on the swell, and dark troughs
        batch(ctx, Math.round(1500 * k), [['#a98ac0', 0.6 * s, 0.2], ['#090c24', 0.9 * s, 0.4]], function () { var p = r(), yy = hz + p * (wb - hz), l = (2 + p * 11) * s, xx = r() * w; return [xx, yy, xx + l, yy, r() < 0.45 ? 0 : 1]; });
        /* the promenade, wet from an afternoon shower: it mirrors the lamps and the glowing sky */
        var fy = wb, VPx = w * 0.5, VPy = hz - h * 0.02;
        ctx.fillStyle = lg(ctx, 0, fy, 0, h, [[0, '#4e4262'], [0.3, '#3a3150'], [1, '#221d30']]);
        ctx.fillRect(0, fy, w, h - fy);
        ctx.save(); ctx.beginPath(); ctx.rect(0, fy, w, h - fy); ctx.clip();
        band(ctx, 0, w, fy, fy + h * 0.16, '#d07a9a', 0.42, 0);
        haze(ctx, w * 0.55, fy - h * 0.02, w * 1.15, fy + h * 0.22, '#ff9a72', 0.3);
        // mirrored skyline colours, smeared toward the viewer
        for (i = 0; i < 16; i++) { var b0 = refl[(r() * refl.length) | 0], sx = b0.x + b0.w / 2, sy = fy + h * (0.015 + r() * 0.06); soft(ctx, sx, sy, w * (0.03 + r() * 0.05), h * (0.006 + r() * 0.01), ['#ffd27e', '#ff7fc8', '#9fe0ff', '#d07cff'][i % 4], 0.22); }
        // large paving slabs in perspective
        ctx.strokeStyle = 'rgba(14,10,22,0.45)'; ctx.lineWidth = Math.max(0.5, 0.8 * s); ctx.beginPath();
        for (i = -14; i <= 14; i++) { var bx = VPx + i * w * 0.13; ctx.moveTo(lerp(VPx, bx, (fy - VPy) / (h - VPy)), fy); ctx.lineTo(bx, h); }
        for (i = 1; i < 16; i++) { var z = 1 + i * 0.5, yy2 = VPy + (h * 1.3 - VPy) / z; if (yy2 > fy && yy2 < h) { ctx.moveTo(0, yy2); ctx.lineTo(w, yy2); } }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,220,200,0.08)'; ctx.beginPath();
        for (i = 1; i < 16; i++) { var z2 = 1 + i * 0.5, yy3 = VPy + (h * 1.3 - VPy) / z2 + 0.9 * s; if (yy3 > fy && yy3 < h) { ctx.moveTo(0, yy3); ctx.lineTo(w, yy3); } }
        ctx.stroke();
        // shallow puddles holding the sky
        for (i = 0; i < 5; i++) { var px = w * (0.15 + r() * 0.7), py = lerp(fy + h * 0.06, h * 0.95, r()), pr = w * (0.06 + r() * 0.08) * (py / h); soft(ctx, px, py, pr, pr * 0.2, i % 2 ? '#c57aa6' : '#8a74c4', 0.22); }
        dots(ctx, Math.round(900 * k), [['#14101e', 0.4], ['#b9a4c8', 0.22]], function () { return [r() * w, lerp(fy, h, Math.pow(r(), 0.8)), (0.3 + r() * 0.5) * s, r() < 0.5 ? 0 : 1]; });
        ctx.restore();
        // railing at the water's edge
        var rt = fy - h * 0.048;
        ctx.fillStyle = '#231f33'; ctx.fillRect(0, fy - 1.4 * s, w, 3.2 * s);
        ctx.strokeStyle = '#272538'; ctx.lineWidth = Math.max(0.6, 1 * s); ctx.beginPath();
        for (x = 2 * s; x < w; x += 4.2 * s) { ctx.moveTo(x, rt); ctx.lineTo(x, fy); }
        ctx.stroke();
        ctx.fillStyle = '#383349'; ctx.fillRect(0, rt - 1.3 * s, w, 2.6 * s);
        ctx.fillStyle = 'rgba(255,190,170,0.6)'; ctx.fillRect(0, rt - 1.3 * s, w, Math.max(0.5, 0.6 * s));
        ctx.fillStyle = '#383349'; ctx.fillRect(0, rt + (fy - rt) * 0.55, w, 1.1 * s);
        for (x = 0; x < w; x += 42 * s) { ctx.fillStyle = '#231f33'; ctx.fillRect(x, rt - 2 * s, 2.4 * s, fy - rt + 2 * s); }
        // old-style twin-globe lamp posts, their light pooled and mirrored on the wet stone
        [w * 0.065, w * 0.935].forEach(function (lx) {
          var ly = fy + 2 * s, H = h * 0.29, top = ly - H;
          glow(ctx, lx, ly + h * 0.08, w * 0.3, '#ffb060', 0.3);
          ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#ffcf8a'; ctx.lineWidth = Math.max(0.8, 1.6 * s);
          ctx.fillStyle = lg(ctx, lx - 8 * s, 0, lx + 8 * s, 0, [[0, 'rgba(255,200,130,0)'], [0.5, 'rgba(255,200,130,0.22)'], [1, 'rgba(255,200,130,0)']]); ctx.fillRect(lx - 8 * s, ly, 16 * s, (h - ly) * 0.8);
          for (var q = 0; q < 22; q++) { var dq = hash(q, lx | 0), ry = ly + 3 * s + dq * (h - ly) * 0.85, rw = (4 + dq * 12) * s * (0.5 + 0.5 * hash(q, 3)), rx = lx + (hash(q, 5) - 0.5) * 3 * s; ctx.globalAlpha = 0.42 * Math.pow(1 - dq, 1.3); ctx.beginPath(); ctx.moveTo(rx - rw / 2, ry); ctx.lineTo(rx + rw / 2, ry); ctx.stroke(); }
          ctx.restore();
          ctx.fillStyle = '#1b1926'; ctx.fillRect(lx - 1.4 * s, top + 6 * s, 2.8 * s, H - 6 * s); ctx.fillRect(lx - 3.2 * s, ly - 5 * s, 6.4 * s, 5 * s); ctx.fillRect(lx - 2.2 * s, ly - 9 * s, 4.4 * s, 4 * s);
          ctx.fillRect(lx - 7 * s, top + 7 * s, 14 * s, 1.4 * s);
          glow(ctx, lx, top + 3 * s, 70 * s, '#ffb060', 0.2);
          [-6, 6].forEach(function (dx) {
            glow(ctx, lx + dx * s, top + 3 * s, 26 * s, '#ffc77a', 0.55);
            ctx.fillStyle = rg(ctx, lx + dx * s - 1 * s, top + 2 * s, 0, 3.8 * s, [[0, '#fffdf0'], [0.6, '#ffe4a6'], [1, '#e8a860']]);
            ctx.beginPath(); ctx.arc(lx + dx * s, top + 3 * s, 3.4 * s, 0, TAU); ctx.fill();
            ctx.fillStyle = '#1b1926'; ctx.fillRect(lx + dx * s - 1.2 * s, top - 1 * s, 2.4 * s, 1 * s);
          });
        });
        finish(ctx, w, h, '#6a5aa0', 0.16, 0.28, 0.045);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = hkhLayout(w, h), hz = L.hz, s = L.s, wb = L.rail, D = HKH[w + 'x' + h], i;
        // light show: slow beams from the tower tops
        if (D && D.tops.length) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (i = 0; i < D.tops.length; i++) {
            var tp = D.tops[i], col = ['#7fd8ff', '#ff7fc8', '#9cff9c', '#ffe27a', '#c8a8ff'][i % 5], a = -PI / 2 + Math.sin(t * 0.35 + i * 1.7) * 0.75, Lb = h * 0.55, wd = 0.035;
            ctx.fillStyle = lg(ctx, tp[0], tp[1], tp[0] + Math.cos(a) * Lb, tp[1] + Math.sin(a) * Lb, [[0, rgba(col, 0.22)], [1, rgba(col, 0)]]);
            ctx.beginPath(); ctx.moveTo(tp[0], tp[1]); ctx.lineTo(tp[0] + Math.cos(a - wd) * Lb, tp[1] + Math.sin(a - wd) * Lb); ctx.lineTo(tp[0] + Math.cos(a + wd) * Lb, tp[1] + Math.sin(a + wd) * Lb); ctx.closePath(); ctx.fill();
          }
          ctx.restore();
        }
        // shimmer on the light columns
        if (D) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
          for (i = 0; i < 70; i++) {
            var c = D.cols[i % D.cols.length]; if (!c) break;
            var ph = h1(i, 5) * TAU, kk = Math.sin(t * 2.2 + ph); if (kk < 0.3) continue;
            var yy = hz + 2 * s + h1(i, 9) * (wb - hz) * 0.8, xx = c[0] + (h1(i, 13) - 0.5) * c[1] + Math.sin(t * 1.3 + i) * 1.5 * s, l = (1.5 + h1(i, 17) * 3) * s;
            ctx.strokeStyle = 'rgba(255,236,190,' + (0.35 * kk).toFixed(3) + ')'; ctx.lineWidth = Math.max(0.6, 0.8 * s);
            ctx.beginPath(); ctx.moveTo(xx - l, yy); ctx.lineTo(xx + l, yy); ctx.stroke();
          }
          ctx.restore();
        }
        // a red-sailed junk drifting left, and the green-and-white ferry crossing right
        var fw = 50 * s, fh = 22 * s, fyy = hz + (wb - hz) * 0.3;
        var ferry = sprite('hkferry', fw, fh, drawFerry);
        var fx = ((t * 9 * s + w * 0.35) % (w + fw * 2)) - fw;
        drawBoat(ctx, ferry, fx, fyy, fw, fh, s * 0.8, t, 1);
        var jw = 38 * s, jh = 31 * s, jy = hz + (wb - hz) * 0.6;
        var junk = sprite('hkjunk', jw, jh, drawJunk);
        var jx = w + jw - ((t * 5 * s + w * 0.6) % (w + jw * 2));
        drawBoat(ctx, junk, jx, jy, jw, jh, s, t, -1);
        // black kites soaring over the harbour
        for (i = 0; i < 2; i++) { var a2 = t * (0.22 + i * 0.07) + i * 2.4, bx = w * (0.35 + i * 0.32) + Math.cos(a2) * w * 0.14, by = h * (0.12 + i * 0.07) + Math.sin(a2) * h * 0.04; bird(ctx, bx, by, (5 + i) * s, 0.2 + Math.sin(t * 0.7 + i) * 0.15, 'rgba(25,20,40,0.8)'); }
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= HONG KONG · NIGHT MARKET (neon street) ======================= */
  var ZHF = '"Noto Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",sans-serif';
  /* a sign that hangs out over the street, facing the viewer. kind: 'neon' (dark box, glowing tubes) or 'box' (lit lightbox) */
  function signBoard(ctx, x, y, sw, sh, txt, col, kind, vert, s) {
    var n = txt.length, fs = vert ? Math.min(sw * 0.72, sh / n * 0.8) : Math.min(sh * 0.66, sw / n * 0.82);
    ctx.save();
    if (kind === 'box') {
      ctx.fillStyle = lg(ctx, x, y, x + sw, y + sh, [[0, '#fff8e8'], [1, col === '#ffe066' ? '#ffd84a' : '#f4ecd8']]);
      ctx.shadowColor = rgba('#fff2c8', 0.8); ctx.shadowBlur = 8 * s; ctx.fillRect(x, y, sw, sh); ctx.shadowBlur = 0;
      ctx.strokeStyle = '#c0302a'; ctx.lineWidth = Math.max(0.6, sw * 0.04); ctx.strokeRect(x + sw * 0.06, y + sw * 0.06, sw - sw * 0.12, sh - sw * 0.12);
      ctx.fillStyle = '#c42a24';
    } else {
      ctx.fillStyle = 'rgba(16,10,24,0.92)'; ctx.fillRect(x, y, sw, sh);
      ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.6, Math.min(sw, sh) * 0.045); ctx.shadowColor = col; ctx.shadowBlur = 7 * s;
      ctx.strokeRect(x + ctx.lineWidth, y + ctx.lineWidth, sw - ctx.lineWidth * 2, sh - ctx.lineWidth * 2);
      ctx.fillStyle = col;
    }
    ctx.font = '900 ' + fs.toFixed(1) + 'px ' + ZHF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (kind !== 'box') { ctx.shadowColor = col; ctx.shadowBlur = 9 * s; }
    for (var i = 0; i < n; i++) {
      var cx = vert ? x + sw / 2 : x + sw * (i + 0.5) / n, cy = vert ? y + sh * (i + 0.5) / n : y + sh / 2 + fs * 0.04;
      ctx.fillText(txt[i], cx, cy);
      if (kind !== 'box') { ctx.save(); ctx.shadowBlur = 0; ctx.globalAlpha = 0.75; ctx.fillStyle = '#ffffff'; ctx.font = '500 ' + (fs * 0.98).toFixed(1) + 'px ' + ZHF; ctx.fillText(txt[i], cx, cy); ctx.restore(); }
    }
    ctx.restore();
  }
  function hknLayout(w, h) { var vy = h * 0.4; return { vx: w * 0.5, vy: vy, W: w * 1.02, G: h * 1.06 - vy, s: scl(w, h), k: dens(w, h) }; }
  var HKN = {};
  SC.hknight = {
    paint: function (ctx, w, h) {
      try {
        var L = hknLayout(w, h), vx = L.vx, vy = L.vy, W = L.W, G = L.G, s = L.s, k = L.k, r = rng(5150), i, j, z;
        var D = HKN[w + 'x' + h] = { signs: [], steam: [], bulbs: [] };
        function X(side, z, inset) { return vx + side * (W - (inset || 0)) / z; }
        function Y(z, H) { return vy + G * (1 - H) / z; }
        /* night sky in the slot between the towers */
        ctx.fillStyle = lg(ctx, 0, 0, 0, vy, [[0, '#070a1e'], [0.6, '#1a1640'], [1, '#3a2452']]); ctx.fillRect(0, 0, w, h);
        glow(ctx, vx, vy - h * 0.05, h * 0.5, '#ff6a9a', 0.25);
        dots(ctx, Math.round(30 * k), [['#ffffff', 0.7]], function () { return [vx + (r() - 0.5) * w * 0.4, r() * vy * 0.7, (0.3 + r() * 0.4) * s, 0]; });
        glow(ctx, vx + w * 0.07, h * 0.1, 10 * s, '#fff6dc', 0.9); ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.arc(vx + w * 0.07, h * 0.1, 3.4 * s, 0, TAU); ctx.fill();
        /* the street: wet asphalt */
        ctx.fillStyle = lg(ctx, 0, vy, 0, h, [[0, '#2a1e30'], [0.25, '#1a1420'], [1, '#0c0a12']]); ctx.fillRect(0, vy, w, h - vy);
        glow(ctx, vx, vy + h * 0.02, w * 0.5, '#ff7ab0', 0.25);
        /* buildings on both sides: tall tenements, far to near */
        var segs = [];
        [-1, 1].forEach(function (side) { var z0 = 1.4; while (z0 < 26) { var z1 = z0 * (1.22 + r() * 0.2); segs.push({ side: side, z0: z0, z1: z1, H: 2.2 + r() * 2.6, col: ['#2c2438', '#30283a', '#272a3a', '#3a2a34', '#2a3036'][(r() * 5) | 0] }); z0 = z1; } });
        segs.sort(function (a, b) { return b.z0 - a.z0; });
        var win = [];
        segs.forEach(function (b) {
          var xa = X(b.side, b.z0), xb = X(b.side, b.z1);
          ctx.fillStyle = b.col; ctx.beginPath(); ctx.moveTo(xa, Y(b.z0, -0.05)); ctx.lineTo(xa, Y(b.z0, b.H)); ctx.lineTo(xb, Y(b.z1, b.H)); ctx.lineTo(xb, Y(b.z1, -0.05)); ctx.closePath(); ctx.fill();
          // the corner edge of each building catches the street light
          ctx.strokeStyle = 'rgba(255,150,190,0.12)'; ctx.lineWidth = Math.max(0.5, 1.5 * s / b.z0); ctx.beginPath(); ctx.moveTo(xa, Y(b.z0, -0.05)); ctx.lineTo(xa, Y(b.z0, b.H)); ctx.stroke();
          // rows of small windows (some lit), with the odd air-conditioner box
          for (var fl = 0.66; fl < b.H - 0.08; fl += 0.13) {
            ctx.strokeStyle = 'rgba(255,200,220,0.07)'; ctx.lineWidth = Math.max(0.4, 0.8 * s / b.z0); ctx.beginPath(); ctx.moveTo(xa, Y(b.z0, fl - 0.015)); ctx.lineTo(xb, Y(b.z1, fl - 0.015)); ctx.stroke();
            for (var u = 0.1; u < 0.9; u += 0.135) {
              var zz = lerp(b.z0, b.z1, u), zz2 = lerp(b.z0, b.z1, u + 0.075), x1 = X(b.side, zz), x2 = X(b.side, zz2), y1 = Y(zz, fl + 0.065), y2 = Y(zz, fl), lit = r();
              win.push([Math.min(x1, x2), y1, Math.abs(x2 - x1), y2 - y1, lit < 0.28 ? 0 : lit < 0.42 ? 1 : 2]);
              if (r() < 0.18) { var ya = Y(zz, fl - 0.005); win.push([Math.min(x1, x2), ya, Math.abs(x2 - x1) * 0.8, (y2 - y1) * 0.45 + 0.4, 3]); }
            }
          }
        });
        rects(ctx, win, [['#ffcf7a', 0.75], ['#9fd6ff', 0.6], ['#16101e', 0.75], ['#8a8494', 0.6]]);
        /* shop fronts at street level: dark walls with lit doorways and a coloured fascia */
        segs.forEach(function (b) {
          if (b.z0 > 18) return;
          var xa = X(b.side, b.z0), xb = X(b.side, b.z1);
          ctx.fillStyle = '#22181e'; ctx.beginPath(); ctx.moveTo(xa, Y(b.z0, -0.05)); ctx.lineTo(xa, Y(b.z0, 0.62)); ctx.lineTo(xb, Y(b.z1, 0.62)); ctx.lineTo(xb, Y(b.z1, -0.05)); ctx.closePath(); ctx.fill();
          for (var u = 0.08; u < 0.9; u += 0.3) { var za = lerp(b.z0, b.z1, u), zb = lerp(b.z0, b.z1, u + 0.2);
            ctx.fillStyle = lg(ctx, 0, Y(za, 0.48), 0, Y(za, 0), [[0, '#ffd89a'], [1, '#b0602a']]); ctx.globalAlpha = 0.85;
            ctx.beginPath(); ctx.moveTo(X(b.side, za), Y(za, 0)); ctx.lineTo(X(b.side, za), Y(za, 0.46)); ctx.lineTo(X(b.side, zb), Y(zb, 0.46)); ctx.lineTo(X(b.side, zb), Y(zb, 0)); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
          ctx.fillStyle = ['#c0302a', '#2a6ac0', '#2a9a5a', '#d08a20', '#8a3ab0'][(b.z0 * 7 | 0) % 5];
          ctx.beginPath(); ctx.moveTo(xa, Y(b.z0, 0.5)); ctx.lineTo(xa, Y(b.z0, 0.6)); ctx.lineTo(xb, Y(b.z1, 0.6)); ctx.lineTo(xb, Y(b.z1, 0.5)); ctx.closePath(); ctx.fill();
        });
        // pavements
        ctx.strokeStyle = 'rgba(255,200,220,0.18)'; ctx.lineWidth = Math.max(0.6, 1 * s);
        [-1, 1].forEach(function (side) { ctx.beginPath(); ctx.moveTo(X(side, 1, w * 0.3), Y(1, 0)); ctx.lineTo(vx, vy); ctx.stroke(); });
        /* string lights and lanterns across the street */
        var CAT = [2.1, 3.1, 4.6, 7, 11];
        CAT.forEach(function (zc, ci) {
          var xa = X(-1, zc), xb = X(1, zc), ya = Y(zc, 1.15), sag = G * 0.18 / zc;
          ctx.strokeStyle = 'rgba(20,14,24,0.85)'; ctx.lineWidth = Math.max(0.5, 1.4 * s / zc * 2); ctx.beginPath(); ctx.moveTo(xa, ya); ctx.quadraticCurveTo(vx, ya + sag * 2, xb, ya); ctx.stroke();
          var nb = Math.round(22 / Math.sqrt(zc) * Math.sqrt(k));
          for (j = 1; j < nb; j++) { var tt = j / nb, bx = (1 - tt) * (1 - tt) * xa + 2 * (1 - tt) * tt * vx + tt * tt * xb, by = (1 - tt) * (1 - tt) * ya + 2 * (1 - tt) * tt * (ya + sag * 2) + tt * tt * ya + 2 * s / zc;
            var bc = ['#ffd27a', '#ff7a9a', '#8affc8', '#ffe8b0'][(j + ci) % 4]; glow(ctx, bx, by, 7 * s / Math.sqrt(zc), bc, 0.5); ctx.fillStyle = bc; ctx.beginPath(); ctx.arc(bx, by, Math.max(0.5, 1.6 * s / Math.sqrt(zc)), 0, TAU); ctx.fill(); D.bulbs.push([bx, by, bc, 1.6 * s / Math.sqrt(zc)]); }
          if (ci < 4) [0.3, 0.7].forEach(function (tt) { var bx = (1 - tt) * (1 - tt) * xa + 2 * (1 - tt) * tt * vx + tt * tt * xb, by = (1 - tt) * (1 - tt) * ya + 2 * (1 - tt) * tt * (ya + sag * 2) + tt * tt * ya, lr = 6 * s / zc * 1.6;
            ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = Math.max(0.4, 0.6 * s); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + lr * 0.8); ctx.stroke();
            glow(ctx, bx, by + lr * 1.7, lr * 3, '#ff4a2a', 0.45);
            ctx.fillStyle = rg(ctx, bx - lr * 0.3, by + lr * 1.5, 0, lr * 1.2, [[0, '#ffb070'], [0.5, '#e8342a'], [1, '#9a1a18']]); ctx.beginPath(); ctx.ellipse(bx, by + lr * 1.7, lr, lr * 0.85, 0, 0, TAU); ctx.fill();
            ctx.fillStyle = '#e8b040'; ctx.fillRect(bx - lr * 0.45, by + lr * 0.8, lr * 0.9, lr * 0.15); ctx.fillRect(bx - lr * 0.45, by + lr * 2.48, lr * 0.9, lr * 0.15);
            ctx.strokeStyle = '#e8b040'; ctx.beginPath(); ctx.moveTo(bx, by + lr * 2.6); ctx.lineTo(bx, by + lr * 3.2); ctx.stroke(); });
        });
        /* neon signs hanging out over the street (far to near). Everyday words: night market, wonton noodles, egg waffles, sweet soup, milk tea, congee... */
        var SG = [
          [-1, 2.15, 0.22, 0.95, 1.85, '夜市', '#ff4fa8', 'neon', 1],
          [1, 2.5, 0.2, 1.05, 1.75, '云吞面', '#ffe066', 'box', 1],
          [-1, 3.0, 0.4, 0.7, 0.98, '鸡蛋仔', '#ffd23f', 'neon', 0],
          [1, 3.4, 0.17, 0.62, 1.2, '糖水', '#4ff0ff', 'neon', 1],
          [-1, 3.9, 0.17, 1.15, 1.75, '奶茶', '#7dff7a', 'neon', 1],
          [1, 4.4, 0.32, 1.25, 1.55, '粥面', '#ff5a4a', 'neon', 0],
          [-1, 5.0, 0.3, 0.62, 0.88, '鱼蛋', '#ff9a3a', 'neon', 0],
          [1, 5.6, 0.16, 0.7, 1.25, '玩具', '#c88cff', 'neon', 1],
          [-1, 6.4, 0.16, 1.0, 1.6, '果汁', '#7affb0', 'neon', 1],
          [1, 7.2, 0.3, 1.3, 1.6, '包子', '#fff4d0', 'box', 0],
          [-1, 8.4, 0.28, 0.65, 0.95, '冰室', '#4fc8ff', 'neon', 0],
          [1, 9.5, 0.15, 0.8, 1.4, '茶', '#ff6ab0', 'neon', 1],
          [-1, 11, 0.15, 1.1, 1.6, '汤', '#ffd23f', 'neon', 1],
          [1, 12.5, 0.26, 0.7, 1.0, '书店', '#7dff7a', 'neon', 0],
          [-1, 14, 0.14, 0.75, 1.3, '面', '#ff4f6a', 'neon', 1],
          [1, 16, 0.24, 1.0, 1.3, '鱼', '#4ff0ff', 'neon', 0],
        ];
        SG.sort(function (a, b) { return b[1] - a[1]; });
        SG.forEach(function (g) {
          var side = g[0], zz = g[1], xf = X(side, zz), xi = X(side, zz, g[2] * W * 0.62 + w * 0.02), y0 = Y(zz, g[4]), y1 = Y(zz, g[3]);
          var x0 = Math.min(xf, xi), sw = Math.abs(xi - xf), sh = y1 - y0, bs = s * 2.2 / zz;
          // bracket back to the wall
          ctx.strokeStyle = 'rgba(30,22,30,0.9)'; ctx.lineWidth = Math.max(0.5, 1.2 * bs); ctx.beginPath(); ctx.moveTo(xf, y0 + sh * 0.1); ctx.lineTo(side < 0 ? x0 : x0 + sw, y0 + sh * 0.1); ctx.moveTo(xf, y0 - sh * 0.08); ctx.lineTo(side < 0 ? x0 + sw * 0.5 : x0 + sw * 0.5, y0); ctx.stroke();
          glow(ctx, x0 + sw / 2, y0 + sh / 2, Math.max(sw, sh) * 1.1, g[6], 0.3);
          signBoard(ctx, side < 0 ? x0 + sw * 0.08 : x0, y0, sw * 0.92, sh, g[5], g[6], g[7], g[8], bs);
          D.signs.push([side < 0 ? x0 + sw * 0.08 : x0, y0, sw * 0.92, sh, g[6], zz]);
        });
        /* market stalls in two rows: striped canopies, a bulb, things hanging, goods piled on the table */
        [-1, 1].forEach(function (side) {
          var inset = W * 0.3, zz = 2.15, n = 0;
          function quad(za, zb, ia, ib, h0, h1) { ctx.beginPath(); ctx.moveTo(X(side, za, ia), Y(za, h0)); ctx.lineTo(X(side, za, ia), Y(za, h1)); ctx.lineTo(X(side, zb, ib), Y(zb, h1)); ctx.lineTo(X(side, zb, ib), Y(zb, h0)); ctx.closePath(); }
          while (zz < 15) {
            var z2 = zz * 1.17, cc = [['#d8382c', '#f4ece0', '#b02a22'], ['#2a62b8', '#e8f0f8', '#1f4a8a'], ['#e89a2a', '#fff4dc', '#b8701a'], ['#2a9a6a', '#f0f8ee', '#1f7a52']][(n + (side > 0 ? 2 : 0)) % 4];
            var bz = lerp(zz, z2, 0.5), sz = s / bz;
            // dim inside of the stall, warm at the top where the bulb hangs
            ctx.fillStyle = lg(ctx, 0, Y(zz, 0.46), 0, Y(zz, 0.05), [[0, '#c8783a'], [0.35, '#6a3a22'], [1, '#2a1812']]); quad(zz, z2, inset - W * 0.05, inset - W * 0.05, 0.05, 0.46); ctx.fill();
            // things hanging from the frame: shirts, bags, toys
            for (j = 0; j < 4; j++) { var zh = lerp(zz, z2, 0.15 + j * 0.22), hx = X(side, zh, inset - W * 0.03), hw = 4.5 * s / zh * 2, hh = (6 + hash(j, n * 3 + side) * 5) * s / zh * 2;
              ctx.fillStyle = ['#ff6a8a', '#ffd23f', '#5ac8ff', '#ffffff', '#8aff8a', '#c88cff'][(n * 4 + j + (side > 0 ? 3 : 0)) % 6]; ctx.globalAlpha = 0.9; ctx.fillRect(hx - hw / 2, Y(zh, 0.44), hw, hh); ctx.globalAlpha = 1; }
            // the bulb
            var bx2 = X(side, bz, inset - W * 0.02), by2 = Y(bz, 0.41); glow(ctx, bx2, by2, 26 * sz, '#ffd890', 0.55); ctx.fillStyle = '#fffbe0'; ctx.beginPath(); ctx.arc(bx2, by2, Math.max(0.5, 2.6 * sz), 0, TAU); ctx.fill();
            // table: cloth front and a lit top with goods
            ctx.fillStyle = cc[2]; quad(zz, z2, inset, inset, 0.04, 0.19); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.12)'; quad(zz, z2, inset, inset, 0.16, 0.19); ctx.fill();
            ctx.fillStyle = '#e8c89a'; quad(zz, z2, inset, inset - W * 0.06, 0.19, 0.205); ctx.fill();
            var gb = Math.round(16 * Math.sqrt(k) * Math.sqrt(2.2 / bz) + 2);
            for (j = 0; j < gb; j++) { var uu = r(), z3 = lerp(zz, z2, uu), gx = X(side, z3, inset - W * 0.02 * r()), gy = Y(z3, 0.21 + r() * 0.05), gr = Math.max(0.5, (1.6 + r() * 1.6) * s / z3 * 2.2);
              ctx.fillStyle = ['#ff5a4a', '#ffd23f', '#5ad0ff', '#7dff7a', '#ff8ad0', '#ffffff', '#ffa040'][(r() * 7) | 0]; if (r() < 0.5) { ctx.beginPath(); ctx.arc(gx, gy, gr, 0, TAU); ctx.fill(); } else ctx.fillRect(gx - gr, gy - gr * 1.4, gr * 2, gr * 1.6); }
            // canopy: underside seen from below, then the striped valance
            ctx.fillStyle = cc[1]; quad(zz, z2, inset, inset - W * 0.22, 0.5, 0.57); ctx.fill();
            for (var st = 0; st < 5; st++) { var za = lerp(zz, z2, st / 5), zb = lerp(zz, z2, st / 5 + 0.1); ctx.fillStyle = cc[0]; quad(za, zb, inset, inset - W * 0.22, 0.5, 0.57); ctx.fill(); }
            ctx.fillStyle = 'rgba(255,220,160,0.25)'; quad(zz, z2, inset, inset - W * 0.22, 0.5, 0.57); ctx.fill();
            ctx.fillStyle = cc[0]; quad(zz, z2, inset, inset, 0.45, 0.5); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; quad(zz, z2, inset, inset, 0.45, 0.46); ctx.fill();
            // posts
            ctx.strokeStyle = '#2a2026'; ctx.lineWidth = Math.max(0.5, 1.6 * sz * 2); ctx.beginPath(); ctx.moveTo(X(side, zz, inset), Y(zz, 0)); ctx.lineTo(X(side, zz, inset), Y(zz, 0.5)); ctx.stroke();
            if (n === 1 && side < 0) D.steam.push([X(side, bz, inset + W * 0.02), Y(bz, 0.5), 1 / bz]);
            if (n === 0 && side > 0) D.steam.push([X(side, bz, inset + W * 0.02), Y(bz, 0.5), 1 / bz]);
            zz = z2 * 1.015; n++;
          }
        });
        /* people strolling far down the street */
        for (i = 0; i < Math.round(14 * Math.sqrt(k)); i++) {
          var pz = 6 + r() * 12, px = vx + (r() - 0.5) * W * 0.8 / pz, py = Y(pz, 0), ph = G * 0.36 / pz;
          ctx.fillStyle = ['#140e1c', '#1e1428', '#22182a'][(r() * 3) | 0];
          ctx.beginPath(); ctx.ellipse(px, py - ph * 0.42, ph * 0.17, ph * 0.38, 0, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.arc(px, py - ph * 0.9, ph * 0.12, 0, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(255,140,190,0.35)'; ctx.fillRect(px + ph * 0.06, py - ph * 0.75, Math.max(0.4, ph * 0.05), ph * 0.6);
        }
        /* reflections of every sign and lantern on the wet street */
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        for (i = 0; i < 14; i++) { var f2 = i / 14, yy = lerp(vy + h * 0.01, h, Math.pow(f2, 1.3)); soft(ctx, vx, yy, w * (0.04 + f2 * 0.2), h * (0.03 + f2 * 0.05), '#ff7ab0', 0.16 * (1 - f2 * 0.7)); }
        D.signs.forEach(function (g) { var gz = g[5], gy = Y(gz, 0), len = Math.min(h - gy, (G * 0.9 / gz) * 1.3), cx = g[0] + g[2] / 2;
          for (j = 0; j < 5; j++) soft(ctx, cx + Math.sin(j * 2.1) * g[2] * 0.15, gy + len * (0.1 + j * 0.18), g[2] * (0.7 + j * 0.12), len * 0.12, g[4], 0.13 * (1 - j * 0.15));
          ctx.strokeStyle = g[4]; ctx.lineWidth = Math.max(0.5, 0.8 * s);
          for (j = 0; j < 7; j++) { var yy2 = gy + 2 * s + hash(j, gz * 13 | 0) * len * 0.8, ww = g[2] * (0.3 + 0.7 * hash(j, gz * 7 | 0)); ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.moveTo(cx - ww / 2, yy2); ctx.lineTo(cx + ww / 2, yy2); ctx.stroke(); }
          ctx.globalAlpha = 1; });
        ctx.restore();
        haze(ctx, vx - w * 0.25, vy - h * 0.06, vx + w * 0.25, vy + h * 0.05, '#ff9ac0', 0.25);
        // puddles near the viewer catch the brightest colours
        for (i = 0; i < 6; i++) { var px2 = w * (0.1 + r() * 0.8), py2 = lerp(h * 0.72, h * 0.97, r()); soft(ctx, px2, py2, w * (0.08 + r() * 0.08), h * 0.012, ['#ff4fa8', '#4ff0ff', '#ffd23f'][i % 3], 0.18); }
        dots(ctx, Math.round(700 * k), [['#000000', 0.3], ['#ffd0e0', 0.12]], function () { return [r() * w, lerp(vy + h * 0.1, h, Math.pow(r(), 0.7)), (0.3 + r() * 0.6) * s, r() < 0.6 ? 0 : 1]; });
        finish(ctx, w, h, '#a050c0', 0.12, 0.3, 0.05);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = hknLayout(w, h), s = L.s, D = HKN[w + 'x' + h], i;
        if (!D) return;
        // neon flicker: two signs buzz now and then, others breathe
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < D.signs.length; i++) {
          var g = D.signs[i], f = 0.5 + 0.5 * Math.sin(t * (1.3 + i * 0.17) + i * 2);
          if (i === 3 || i === 9) f = (Math.sin(t * 23 + i) > 0.6 && Math.sin(t * 0.9 + i) > 0.3) ? 0 : 0.9;
          ctx.globalAlpha = 0.14 * f; ctx.fillStyle = g[4]; ctx.fillRect(g[0] - 2 * s, g[1] - 2 * s, g[2] + 4 * s, g[3] + 4 * s);
        }
        // a few bulbs twinkle
        for (i = 0; i < D.bulbs.length; i += 3) { var b = D.bulbs[i], tw = Math.sin(t * 3 + i * 1.3); if (tw < 0.7) continue; ctx.globalAlpha = (tw - 0.7) * 2; ctx.fillStyle = b[2]; ctx.beginPath(); ctx.arc(b[0], b[1], b[3] * 2.4, 0, TAU); ctx.fill(); }
        ctx.restore();
        // steam curling up from the food stalls
        for (var k2 = 0; k2 < D.steam.length; k2++) {
          var st = D.steam[k2], sc2 = st[2] * 2.2;
          for (i = 0; i < 6; i++) { var ph = (t * 0.35 + i / 6 + k2 * 0.3) % 1, sx = st[0] + Math.sin(t * 1.2 + i * 1.7) * 6 * s * sc2 * ph, sy = st[1] - ph * 50 * s * sc2, rr = (5 + ph * 14) * s * sc2;
            soft(ctx, sx, sy, rr, rr, '#f4eef8', 0.22 * Math.sin(PI * ph)); }
        }
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= HONG KONG · THE PEAK (afternoon, looking down on the city) ======================= */
  function hkpLayout(w, h) { return { hz: h * 0.215, sea0: h * 0.25, sea1: h * 0.335, rail: h * 0.61, s: scl(w, h), k: dens(w, h) }; }
  function tramTrack(w, h) { return { x0: -w * 0.02, y0: h * 0.545, x1: w * 0.46, y1: h * 0.43 }; }
  SC.hkpeak = {
    paint: function (ctx, w, h) {
      try {
        var L = hkpLayout(w, h), hz = L.hz, s = L.s, k = L.k, r = rng(7707), i, j, x, y;
        /* sky */
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, [[0, '#4f8fd6'], [0.5, '#8cbbe6'], [0.85, '#d4e4ee'], [1, '#efe8dc']]); ctx.fillRect(0, 0, w, hz + 4);
        glow(ctx, w * 0.02, h * 0.06, Math.max(w, h) * 0.6, '#fff4d8', 0.6);
        for (i = 0; i < 6; i++) { var cx = r() * w, cy = h * (0.04 + r() * 0.14), cs = w * (0.05 + r() * 0.07);
          for (j = 0; j < 7; j++) soft(ctx, cx + (j - 3) * cs * 0.45 + (r() - 0.5) * cs * 0.3, cy - Math.sin(j / 6 * PI) * cs * 0.25, cs * (0.4 + r() * 0.3), cs * (0.25 + r() * 0.15), '#ffffff', 0.55);
          soft(ctx, cx, cy + cs * 0.15, cs * 1.6, cs * 0.18, '#c8d4e4', 0.3); }
        /* Kowloon's mountains across the harbour, in haze */
        function mtn(x) { var u = x / w; return hz - h * (0.03 + 0.05 * Math.exp(-Math.pow((u - 0.36) / 0.09, 2)) + 0.035 * Math.exp(-Math.pow((u - 0.7) / 0.18, 2))) - h * 0.02 * fbm(u * 5, 41, 4); }
        ridge(ctx, -2, w + 2, 2, mtn, hz + 3, lg(ctx, 0, hz - h * 0.09, 0, hz, [[0, '#8aa2bc'], [1, '#aebdc8']]));
        haze(ctx, -w * 0.1, hz - h * 0.05, w * 1.1, hz + h * 0.02, '#e8e4dc', 0.5);
        /* Kowloon: a carpet of tiny towers along the far shore */
        var kb = [];
        for (x = -2; x < w + 2;) { var bw = (1.5 + r() * 3) * s, bh = h * (0.006 + r() * 0.02); if (r() < 0.06) bh *= 2.5; kb.push([x, L.sea0 - bh, bw, bh + 2, r() < 0.5 ? 0 : r() < 0.6 ? 1 : 2]); x += bw * (0.8 + r() * 0.5); }
        rects(ctx, kb, [['#c4ccd4', 1], ['#a8b4c0', 1], ['#d8d4cc', 1]]);
        ctx.fillStyle = '#b8c2cc'; ctx.fillRect(0, hz, w, L.sea0 - hz);
        rects(ctx, kb.map(function (q) { return [q[0], Math.max(hz - 1, q[1]), q[2], q[3], q[4]]; }), [['#c4ccd4', 1], ['#a8b4c0', 1], ['#d8d4cc', 1]]);
        dots(ctx, Math.round(500 * k), [['#8a96a4', 0.5], ['#ffffff', 0.5]], function () { return [r() * w, lerp(hz, L.sea0, r()), (0.3 + r() * 0.4) * s, r() < 0.6 ? 0 : 1]; });
        haze(ctx, -w * 0.1, hz - h * 0.03, w * 1.1, L.sea0 + h * 0.01, '#e4e6e4', 0.45);
        /* the harbour, glittering in the afternoon sun */
        ctx.fillStyle = lg(ctx, 0, L.sea0, 0, L.sea1, [[0, '#8fb0c4'], [1, '#5c88a8']]); ctx.fillRect(0, L.sea0, w, L.sea1 - L.sea0 + h * 0.08);
        haze(ctx, w * 0.6, L.sea0 - h * 0.01, w * 1.1, L.sea1, '#fff6dc', 0.5);
        batch(ctx, Math.round(900 * k), [['#ffffff', 0.6 * s, 0.6], ['#46708e', 0.6 * s, 0.4]], function () { var yy = lerp(L.sea0, L.sea1 + h * 0.05, r()), xx = r() * w, l = (1 + r() * 4) * s, b = r() < (xx / w) * 0.7 ? 0 : 1; return [xx, yy, xx + l, yy, b]; });
        // tiny boats and their wakes
        for (i = 0; i < 9; i++) { var bx = r() * w, by = lerp(L.sea0 + h * 0.005, L.sea1, r()); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = Math.max(0.4, 0.5 * s); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - (6 + r() * 8) * s, by + 0.6 * s); ctx.stroke(); ctx.fillStyle = r() < 0.5 ? '#2a6a4a' : '#f4f0e8'; ctx.fillRect(bx - 1.2 * s, by - 0.8 * s, 2.4 * s, 1.1 * s); }
        /* the island's skyscrapers, seen from above: three rows, hazier toward the harbour; sun from the west (left) */
        var ROWS = [[h * 0.37, h * 0.315, h * 0.345, 0.55, 3, 6, 0.7, 0.6], [h * 0.45, h * 0.26, h * 0.37, 0.25, 5, 9, 1.1, 1.3], [h * 0.52, h * 0.37, h * 0.43, 0.06, 6, 11, 0.7, 0.5]];
        ROWS.forEach(function (R, ri) {
          var base = R[0], list = [];
          for (x = -6; x < w + 6;) { var tw = (R[4] + r() * (R[5] - R[4])) * s, top = lerp(R[1], R[2], Math.pow(r(), ri === 1 ? 1.2 : 0.9)); if (ri === 1 && r() < 0.12) top = h * (0.17 + r() * 0.06); list.push({ x: x, w: tw, top: top, c: r() }); x += tw * (R[6] + r() * R[7]); }
          list.sort(function (a, b) { return a.top - b.top; });
          list.forEach(function (b) {
            var x0 = b.x, top = b.top, lit = b.w * 0.55;
            var body = ri === 2 ? (b.c < 0.5 ? ['#f2ece0', '#c8bca8'] : b.c < 0.8 ? ['#e8e4dc', '#b4b0a8'] : ['#f0dcc0', '#c0a888']) : (b.c < 0.35 ? ['#e8eef2', '#9aaabb'] : b.c < 0.65 ? ['#cfe0ec', '#6f8eaa'] : b.c < 0.85 ? ['#efe6d6', '#ad9f8c'] : ['#dce8f0', '#58789a']);
            ctx.fillStyle = body[0]; ctx.fillRect(x0, top, lit, base - top);
            ctx.fillStyle = body[1]; ctx.fillRect(x0 + lit, top, b.w - lit, base - top);
            ctx.fillStyle = mixh(body[0], '#ffffff', 0.45); ctx.fillRect(x0, top - 0.7 * s, b.w, 1 * s);
            if (b.w > 6 * s && b.c > 0.4) { ctx.fillStyle = body[1]; ctx.fillRect(x0 + b.w * 0.2, top - 2 * s, b.w * 0.4, 1.6 * s); }
            if (ri === 2) { ctx.fillStyle = 'rgba(80,70,60,0.28)'; for (y = top + 1.4 * s; y < base; y += 1.9 * s) ctx.fillRect(x0, y, b.w, Math.max(0.4, 0.7 * s)); }
            else { ctx.fillStyle = 'rgba(40,60,90,0.22)'; for (y = top + 1.2 * s; y < base; y += 1.7 * s) ctx.fillRect(x0, y, b.w, Math.max(0.35, 0.5 * s)); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x0 + lit * 0.2, top, lit * 0.15, base - top); }
          });
          if (ri < 2) haze(ctx, -w * 0.1, R[1] - h * 0.02, w * 1.1, base + h * 0.02, '#dfe6ea', ri === 0 ? 0.45 : 0.3);
        });
        /* the hillside: dense subtropical forest falling away to the city */
        function hill(x) { var u = x / w; return h * (0.445 + 0.05 * Math.pow(Math.abs(u - 0.62) * 1.6, 1.4)) + h * 0.02 * fbm(u * 6, 51, 4); }
        ridge(ctx, -2, w + 2, 2, hill, h + 2, lg(ctx, 0, h * 0.4, 0, h * 0.62, [[0, '#4e7a4a'], [1, '#2e5236']]));
        // residential towers peeking out of the trees
        for (i = 0; i < 9; i++) { var rx = w * (0.4 + r() * 0.6), ry = hill(rx) + h * (0.02 + r() * 0.03), rw = (5 + r() * 5) * s, rh = h * (0.05 + r() * 0.05);
          ctx.fillStyle = lg(ctx, rx, 0, rx + rw, 0, [[0, '#b8b0a4'], [0.6, '#e8e2d8'], [1, '#f4f0e8']]); ctx.fillRect(rx, ry - rh, rw, rh + h * 0.04);
          ctx.fillStyle = 'rgba(60,70,90,0.35)'; for (y = ry - rh + 1.5 * s; y < ry + h * 0.04; y += 2 * s) ctx.fillRect(rx + 0.6 * s, y, rw - 1.2 * s, Math.max(0.4, 0.6 * s)); }
        // tree crowns, far (small, blue-green) to near (big, sunlit)
        var crowns = Math.round(1600 * k);
        dots(ctx, crowns, [['#2a4a30', 0.85], ['#3e6a3e', 0.85], ['#5a8a4a', 0.85], ['#86ac5a', 0.8], ['#1e3a26', 0.85]], function () {
          var xx = r() * w, top = hill(xx), d = Math.pow(r(), 0.85), yy = lerp(top, h * 0.66, d), rr = (1.2 + d * 5 + r() * 2) * s;
          var shade = r(); return [xx, yy, rr, shade < 0.2 ? 4 : shade < 0.45 ? 0 : shade < 0.75 ? 1 : shade < 0.92 ? 2 : 3];
        });
        dots(ctx, Math.round(500 * k), [['#a8c86a', 0.7], ['#d4e48a', 0.5]], function () { var xx = r() * w, top = hill(xx), yy = lerp(top, h * 0.66, Math.pow(r(), 0.85)) - 1.5 * s, rr = (0.8 + r() * 2.2) * s; return [xx + rr * 0.4, yy, rr, r() < 0.7 ? 0 : 1]; });
        haze(ctx, -w * 0.1, h * 0.38, w * 1.1, h * 0.5, '#e4e8e0', 0.22);
        /* the tram track, straight down the slope */
        var TT = tramTrack(w, h);
        ctx.strokeStyle = '#6a5a4a'; ctx.lineWidth = Math.max(1, 4 * s); ctx.beginPath(); ctx.moveTo(TT.x0, TT.y0); ctx.lineTo(TT.x1, TT.y1); ctx.stroke();
        ctx.strokeStyle = '#c8c0b0'; ctx.lineWidth = Math.max(0.5, 0.7 * s); ctx.beginPath(); ctx.moveTo(TT.x0, TT.y0 - 1.3 * s); ctx.lineTo(TT.x1, TT.y1 - 0.6 * s); ctx.moveTo(TT.x0, TT.y0 + 1.3 * s); ctx.lineTo(TT.x1, TT.y1 + 0.6 * s); ctx.stroke();
        // trees in front of the lower track
        dots(ctx, Math.round(240 * k), [['#2e5236', 0.95], ['#4a7a42', 0.95]], function () { var u = r(), xx = lerp(TT.x0, TT.x1, u) + (r() - 0.3) * 10 * s, yy = lerp(TT.y0, TT.y1, u) + (3 + r() * 10) * s; return [xx, yy, (2 + r() * 4) * s * (1.4 - u * 0.6), r() < 0.5 ? 0 : 1]; });
        /* the viewing terrace */
        var fy = L.rail;
        ctx.fillStyle = lg(ctx, 0, fy, 0, h, [[0, '#d8c8a8'], [0.4, '#c4b090'], [1, '#9a8668']]); ctx.fillRect(0, fy, w, h - fy);
        ctx.save(); ctx.beginPath(); ctx.rect(0, fy, w, h - fy); ctx.clip();
        var VPx = w * 0.5, VPy = h * 0.3;
        ctx.strokeStyle = 'rgba(110,90,60,0.35)'; ctx.lineWidth = Math.max(0.5, 0.8 * s); ctx.beginPath();
        for (i = -12; i <= 12; i++) { var bx2 = VPx + i * w * 0.12; ctx.moveTo(lerp(VPx, bx2, (fy - VPy) / (h - VPy)), fy); ctx.lineTo(bx2, h); }
        for (i = 1; i < 16; i++) { var z = 1 + i * 0.45, yy = VPy + (h * 1.2 - VPy) / z; if (yy > fy && yy < h) { ctx.moveTo(0, yy); ctx.lineTo(w, yy); } }
        ctx.stroke();
        dots(ctx, Math.round(1200 * k), [['#8a7656', 0.3], ['#fff4dc', 0.35]], function () { return [r() * w, lerp(fy, h, r()), (0.3 + r() * 0.6) * s, r() < 0.5 ? 0 : 1]; });
        // long afternoon shadows of the balusters, falling toward us
        ctx.fillStyle = 'rgba(70,56,40,0.22)'; ctx.beginPath();
        for (x = 3 * s; x < w + 40 * s; x += 7 * s) { var sx0 = x, sy0 = fy, sl = h * 0.11; ctx.moveTo(sx0 - 1.4 * s, sy0); ctx.lineTo(sx0 + 1.4 * s, sy0); ctx.lineTo(sx0 + 1.4 * s + sl * 0.55, sy0 + sl); ctx.lineTo(sx0 - 1.4 * s + sl * 0.55, sy0 + sl); }
        ctx.fill();
        ctx.fillStyle = 'rgba(70,56,40,0.25)'; ctx.beginPath(); ctx.moveTo(0, fy + h * 0.1); ctx.lineTo(w, fy + h * 0.1); ctx.lineTo(w, fy + h * 0.118); ctx.lineTo(0, fy + h * 0.118); ctx.fill();
        // leaf shade from the tree overhead on the right
        var lr2 = rng(77);
        ctx.fillStyle = 'rgba(60,64,40,0.14)'; ctx.beginPath();
        for (i = 0; i < Math.round(90 * k); i++) { var lx = w * (0.55 + lr2() * 0.5), ly = lerp(fy + h * 0.16, h, lr2()), lw = (3 + lr2() * 7) * s; ctx.moveTo(lx + lw, ly); ctx.ellipse(lx, ly, lw, lw * 0.45, lr2() * PI, 0, TAU); }
        ctx.fill();
        glow(ctx, w * 0.3, fy + h * 0.2, w * 0.5, '#fff0c8', 0.25);
        ctx.restore();
        // stone balustrade along the edge
        var rt = fy - h * 0.06;
        ctx.fillStyle = '#c8b898'; ctx.fillRect(0, fy - 2 * s, w, 4 * s);
        for (x = 3 * s; x < w; x += 7 * s) {
          ctx.fillStyle = lg(ctx, x - 1.8 * s, 0, x + 1.8 * s, 0, [[0, '#a89878'], [0.5, '#efe4cc'], [1, '#b4a484']]);
          ctx.beginPath(); ctx.moveTo(x - 1.2 * s, fy - 2 * s); ctx.quadraticCurveTo(x - 2.4 * s, (fy + rt) / 2, x - 1 * s, rt + 2 * s); ctx.lineTo(x + 1 * s, rt + 2 * s); ctx.quadraticCurveTo(x + 2.4 * s, (fy + rt) / 2, x + 1.2 * s, fy - 2 * s); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = lg(ctx, 0, rt - 2.5 * s, 0, rt + 2.5 * s, [[0, '#fbf2dc'], [1, '#bcaa88']]); ctx.fillRect(0, rt - 2.5 * s, w, 5 * s);
        ctx.fillStyle = 'rgba(80,60,40,0.3)'; ctx.fillRect(0, rt + 2.5 * s, w, 1 * s);
        for (x = 0; x < w; x += 56 * s) { ctx.fillStyle = lg(ctx, x, 0, x + 7 * s, 0, [[0, '#b4a484'], [0.5, '#f4e8d0'], [1, '#a89878']]); ctx.fillRect(x, rt - 4 * s, 7 * s, fy - rt + 4 * s); }
        /* foreground leaves framing the view */
        function leafy(cx, cy, R, n, seed, cols) { var rr = rng(seed); for (var q = 0; q < n; q++) { var a = rr() * TAU, d = Math.sqrt(rr()) * R, lx = cx + Math.cos(a) * d, ly = cy + Math.sin(a) * d * 0.7, ls = (3 + rr() * 5) * s, ang = rr() * TAU;
          ctx.save(); ctx.translate(lx, ly); ctx.rotate(ang); ctx.fillStyle = cols[(rr() * cols.length) | 0]; ctx.beginPath(); ctx.ellipse(0, 0, ls, ls * 0.42, 0, 0, TAU); ctx.fill(); ctx.restore(); } }
        ctx.strokeStyle = '#3a2a1e'; ctx.lineWidth = Math.max(1, 3 * s); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-5 * s, h * 0.02); ctx.quadraticCurveTo(w * 0.1, h * 0.06, w * 0.22, h * 0.04); ctx.stroke();
        leafy(w * 0.06, h * 0.02, w * 0.16, Math.round(140 * Math.sqrt(k)), 31, ['#1e3a22', '#2e5a2e', '#3e6e34', '#4f8a3a']);
        leafy(w * 1.0, h * 0.52, w * 0.14, Math.round(120 * Math.sqrt(k)), 32, ['#1e3a22', '#2e5a2e', '#3e6e34', '#6a9a48']);
        // bougainvillea tumbling over the railing: magenta bracts
        dots(ctx, Math.round(260 * Math.sqrt(k)), [['#c8247a', 0.9], ['#e8449a', 0.9], ['#ff7ab8', 0.85], ['#8a1a5a', 0.9]], function () { var a2 = r() * TAU, d2 = Math.sqrt(r()), bx3 = w * 0.98 + Math.cos(a2) * d2 * w * 0.14, by3 = h * 0.53 + Math.sin(a2) * d2 * h * 0.09; return [bx3, by3, (1 + r() * 1.6) * s, (r() * 4) | 0]; });
        leafy(-w * 0.01, h * 0.58, w * 0.08, Math.round(60 * Math.sqrt(k)), 33, ['#1e3a22', '#2e5a2e', '#4a7a3a']);
        dots(ctx, Math.round(120 * Math.sqrt(k)), [['#c8247a', 0.9], ['#ff7ab8', 0.85]], function () { var a2 = r() * TAU, d2 = Math.sqrt(r()), bx3 = Math.cos(a2) * d2 * w * 0.08, by3 = h * 0.58 + Math.sin(a2) * d2 * h * 0.06; return [bx3, by3, (1 + r() * 1.4) * s, (r() * 2) | 0]; });
        finish(ctx, w, h, '#ffe0b0', 0.15, 0.2, 0.04);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var s = scl(w, h), TT = tramTrack(w, h), i;
        // the tram: climbs, waits at the top, rolls back down
        var cyc = (t % 70) / 70, u = cyc < 0.42 ? cyc / 0.42 : cyc < 0.5 ? 1 : cyc < 0.92 ? 1 - (cyc - 0.5) / 0.42 : 0;
        u = u * u * (3 - 2 * u); u = 0.08 + u * 0.8;
        var x = lerp(TT.x0, TT.x1, u), y = lerp(TT.y0, TT.y1, u), sz = lerp(1.2, 0.6, u) * s, ang = Math.atan2(TT.y1 - TT.y0, TT.x1 - TT.x0);
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
        var cl = 20 * sz, ch = 7 * sz;
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-cl / 2, 1 * sz, cl, 1.5 * sz);
        ctx.rotate(-ang * 0.82); // the car body stays nearly level on its stepped frame
        ctx.fillStyle = '#7a1e22'; ctx.fillRect(-cl / 2, -ch, cl, ch);
        ctx.fillStyle = '#efe4c8'; ctx.fillRect(-cl / 2, -ch, cl, ch * 0.42);
        ctx.fillStyle = '#4a5a6a'; for (i = 0; i < 6; i++) ctx.fillRect(-cl / 2 + 1.2 * sz + i * 3.1 * sz, -ch + 0.6 * sz, 2.2 * sz, ch * 0.3);
        ctx.fillStyle = '#5a1418'; ctx.fillRect(-cl / 2 - 0.5 * sz, -ch - 1 * sz, cl + 1 * sz, 1.2 * sz);
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-cl / 2, -ch, cl, 0.6 * sz);
        ctx.restore();
        // black kites circling on the warm air below the summit
        for (i = 0; i < 3; i++) { var a = t * (0.18 + i * 0.05) + i * 2.1, bx = w * (0.3 + i * 0.25) + Math.cos(a) * w * 0.12, by = h * (0.3 + i * 0.04) + Math.sin(a) * h * 0.035; bird(ctx, bx, by, (4.5 + i * 0.8) * s, 0.25 + Math.sin(t * 0.6 + i) * 0.1, 'rgba(40,30,30,0.85)'); }
        // a ferry inching across the harbour
        var fx = ((t * 3 * s + w * 0.2) % (w + 20 * s)) - 10 * s, fy = h * 0.29;
        ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.beginPath(); ctx.moveTo(fx - 2 * s, fy + 0.6 * s); ctx.lineTo(fx - 12 * s, fy + 1.2 * s); ctx.stroke();
        ctx.fillStyle = '#2a7a54'; ctx.fillRect(fx - 2.5 * s, fy - 1 * s, 5 * s, 1.4 * s); ctx.fillStyle = '#f4f0e8'; ctx.fillRect(fx - 2 * s, fy - 2 * s, 4 * s, 1 * s);
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= THAILAND · BANGKOK (golden hour on the river) ======================= */
  /* a temple spire: stepped terraces, a ribbed corn-cob tower and a thin finial. Lit from the left (sun low in the west). */
  function prang(ctx, cx, base, H, W, r, s, gold) {
    var lit = gold ? '#ffe7a8' : '#f6dcb4', mid = gold ? '#e8b85a' : '#d8b48a', dk = gold ? '#9a6a2a' : '#8a6a52', i;
    // terraces
    var tiers = [[1, 0.07], [0.8, 0.065], [0.62, 0.06]], y = base;
    tiers.forEach(function (tr) {
      var tw = W * tr[0], th = H * tr[1];
      ctx.fillStyle = lg(ctx, cx - tw / 2, 0, cx + tw / 2, 0, [[0, lit], [0.5, mid], [1, dk]]); ctx.fillRect(cx - tw / 2, y - th, tw, th);
      ctx.fillStyle = 'rgba(80,40,20,0.35)'; ctx.fillRect(cx - tw / 2, y - th, tw, Math.max(0.5, th * 0.12));
      ctx.fillStyle = 'rgba(255,250,230,0.6)'; for (var q = cx - tw / 2 + 2 * s; q < cx + tw / 2 - 1 * s; q += 2.2 * s) ctx.fillRect(q, y - th * 0.85, Math.max(0.4, 0.6 * s), th * 0.5);
      y -= th;
    });
    // the tower: convex sides, ribbed with bands
    var tb = y, tt = base - H * 0.86, bw = W * 0.4, tw2 = W * 0.05;
    function half(f) { return Math.max(tw2, bw * Math.pow(Math.max(0, 1 - Math.pow(f, 2.1)), 0.62) * (1 + 0.08 * Math.sin(PI * f * 1.2))); }
    ctx.beginPath(); ctx.moveTo(cx - half(0) / 2, tb);
    for (i = 0; i <= 20; i++) { var f = i / 20; ctx.lineTo(cx - half(f) / 2, lerp(tb, tt, f)); }
    for (i = 20; i >= 0; i--) { var f2 = i / 20; ctx.lineTo(cx + half(f2) / 2, lerp(tb, tt, f2)); }
    ctx.closePath(); ctx.fillStyle = lg(ctx, cx - bw / 2, 0, cx + bw / 2, 0, [[0, lit], [0.45, mid], [1, dk]]); ctx.fill();
    ctx.save(); ctx.clip();
    for (i = 0; i < 26; i++) { var f3 = i / 26, yy = lerp(tb, tt, f3), hw = half(f3) / 2; ctx.fillStyle = i % 2 ? 'rgba(90,50,20,0.35)' : 'rgba(255,248,220,0.4)'; ctx.fillRect(cx - hw, yy - Math.max(0.5, 0.7 * s), hw * 2, Math.max(0.5, 0.7 * s)); }
    // porcelain mosaic: tiny coloured flecks
    dots(ctx, Math.round(160 * W / (60 * s)), [['#ffffff', 0.7], ['#7ab8e8', 0.6], ['#e87a8a', 0.55]], function () { var f4 = r(), yy = lerp(tb, tt, f4), hw = half(f4) / 2; return [cx + (r() * 2 - 1) * hw, yy, Math.max(0.3, 0.45 * s), (r() * 3) | 0]; });
    // a niche on the lit side
    ctx.fillStyle = 'rgba(70,30,20,0.6)'; ctx.beginPath(); ctx.ellipse(cx - bw * 0.05, lerp(tb, tt, 0.18), bw * 0.08, bw * 0.12, 0, 0, TAU); ctx.fill();
    ctx.restore();
    // finial
    ctx.strokeStyle = gold ? '#ffe9a0' : '#e8d0a0'; ctx.lineWidth = Math.max(0.5, W * 0.025); ctx.beginPath(); ctx.moveTo(cx, tt); ctx.lineTo(cx, base - H); ctx.stroke();
    ctx.fillStyle = '#fff2b8'; ctx.beginPath(); ctx.arc(cx, tt - (H * 0.14) * 0.35, Math.max(0.6, W * 0.03), 0, TAU); ctx.fill();
    glow(ctx, cx - W * 0.05, lerp(tb, tt, 0.6), W * 0.5, '#ffd890', 0.18);
  }
  /* a Thai temple hall seen gable-on: white walls, three layers of steep orange-and-green roofs with golden finials */
  function templeHall(ctx, cx, base, Wd, Hd, s) {
    var wallH = Hd * 0.32, wy = base - wallH, i;
    ctx.fillStyle = lg(ctx, cx - Wd / 2, 0, cx + Wd / 2, 0, [[0, '#fff6e4'], [0.6, '#f0dcc0'], [1, '#c8a888']]); ctx.fillRect(cx - Wd * 0.42, wy, Wd * 0.84, wallH);
    ctx.fillStyle = '#e8c070'; ctx.fillRect(cx - Wd * 0.42, wy, Wd * 0.84, Math.max(0.6, wallH * 0.06));
    for (i = -1; i <= 1; i++) { var dx = cx + i * Wd * 0.22, dw = Wd * 0.09; ctx.fillStyle = '#d8a040'; ctx.fillRect(dx - dw * 0.65, wy + wallH * 0.18, dw * 1.3, wallH * 0.82); ctx.fillStyle = '#6a2a1a'; ctx.fillRect(dx - dw / 2, wy + wallH * 0.24, dw, wallH * 0.76); }
    // stacked roofs, back (high, narrow) to front (low, wide)
    var layers = [[0.62, 0.95, wy - Hd * 0.12], [0.82, 0.78, wy - Hd * 0.04], [1, 0.6, wy + Hd * 0.02]];
    layers.forEach(function (L, li) {
      var hw = Wd * L[0] / 2, ry = L[2], peak = ry - Hd * 0.55 * L[1];
      // tiles: orange body with a green border
      ctx.fillStyle = '#2f7a4a'; ctx.beginPath(); ctx.moveTo(cx - hw, ry); ctx.lineTo(cx, peak); ctx.lineTo(cx + hw, ry); ctx.closePath(); ctx.fill();
      ctx.fillStyle = lg(ctx, cx - hw, 0, cx + hw, 0, [[0, '#ff9a3a'], [0.5, '#e8702a'], [1, '#a84a1e']]); ctx.beginPath(); ctx.moveTo(cx - hw * 0.84, ry - Hd * 0.01); ctx.lineTo(cx, peak + Hd * 0.06); ctx.lineTo(cx + hw * 0.84, ry - Hd * 0.01); ctx.closePath(); ctx.fill();
      // gable face (the triangle under the front roof) only on the front layer
      if (li === 2) { ctx.fillStyle = '#a8241e'; ctx.beginPath(); ctx.moveTo(cx - hw * 0.7, ry); ctx.lineTo(cx, peak + Hd * 0.12); ctx.lineTo(cx + hw * 0.7, ry); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffd860'; ctx.beginPath(); ctx.arc(cx, ry - (ry - peak) * 0.38, hw * 0.16, 0, TAU); ctx.fill(); glow(ctx, cx, ry - (ry - peak) * 0.38, hw * 0.4, '#ffd860', 0.35); }
      // golden barge boards with the curling finials (chofa) at the top and the eaves
      ctx.strokeStyle = '#ffd25a'; ctx.lineWidth = Math.max(0.6, Wd * 0.018); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - hw, ry); ctx.lineTo(cx, peak); ctx.lineTo(cx + hw, ry); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, peak); ctx.quadraticCurveTo(cx + Wd * 0.02, peak - Hd * 0.12, cx + Wd * 0.06, peak - Hd * 0.14); ctx.stroke();
      [-1, 1].forEach(function (sd) { ctx.beginPath(); ctx.moveTo(cx + sd * hw, ry); ctx.quadraticCurveTo(cx + sd * hw * 1.08, ry - Hd * 0.02, cx + sd * hw * 1.06, ry - Hd * 0.07); ctx.stroke(); });
    });
  }
  function bkkLayout(w, h) { return { hz: h * 0.47, pier: h * 0.635, s: scl(w, h), k: dens(w, h) }; }
  SC.bangkok = {
    paint: function (ctx, w, h) {
      try {
        var L = bkkLayout(w, h), hz = L.hz, s = L.s, k = L.k, r = rng(4242), i, j, x, y;
        /* golden-hour sky: the sun is low on the left */
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, [[0, '#3c5fa8'], [0.35, '#7a8cc4'], [0.6, '#d8a4b0'], [0.8, '#ffc48a'], [1, '#ffe2a8']]); ctx.fillRect(0, 0, w, hz + 2);
        glow(ctx, -w * 0.05, hz * 0.62, Math.max(w, h) * 0.75, '#ffb85a', 0.55);
        glow(ctx, w * 0.02, hz * 0.66, w * 0.28, '#fff4c8', 0.75);
        for (i = 0; i < 8; i++) { var cy = h * (0.05 + r() * 0.24), cx = r() * w * 1.1, cw = w * (0.12 + r() * 0.25), ch = h * (0.008 + r() * 0.015), u = 1 - cx / w;
          haze(ctx, cx - cw, cy - ch * 2, cx + cw, cy + ch * 1.5, mixh('#8a7ab0', '#c8889a', u), 0.5);
          haze(ctx, cx - cw * 0.9, cy - ch * 2.4, cx + cw * 0.6, cy, mixh('#ffb0a0', '#ffd890', u), 0.35 + u * 0.3); }
        // a flock heading home, painted far away
        for (i = 0; i < 9; i++) bird(ctx, w * (0.25 + r() * 0.3), h * (0.08 + r() * 0.07), (1.5 + r() * 1.2) * s, r() * 3, 'rgba(60,40,60,0.6)');
        /* the far bank: trees, low roofs, and the temple */
        var bank = hz - h * 0.02;
        function treeLine(x) { return bank - h * (0.02 + 0.03 * fbm(x / w * 9, 61, 4)); }
        ridge(ctx, -2, w + 2, 2, treeLine, hz + 2, '#4a5a3a');
        // coconut palms along the bank, back-lit edges
        for (i = 0; i < 9; i++) { var px = r() * w, ph = h * (0.07 + r() * 0.06); palm(ctx, px, bank + 1, ph, (r() - 0.5) * 0.3, { trunk: '#5a4a3a', trunkD: '#3a2e24', frond: '#4a6a3a', frondD: '#34502e' }, 900 + i); }
        // the temple: main golden spire, four smaller spires, a hall on the left
        var tc = w * 0.62, tb = bank + h * 0.005;
        ctx.fillStyle = lg(ctx, 0, tb - h * 0.04, 0, tb + h * 0.02, [[0, '#e8d4b0'], [1, '#a8906a']]); ctx.fillRect(w * 0.3, tb - h * 0.025, w * 0.62, h * 0.04);
        ctx.fillStyle = 'rgba(255,250,235,0.7)'; for (x = w * 0.3; x < w * 0.92; x += 3 * s) ctx.fillRect(x, tb - h * 0.025, 1 * s, h * 0.008);
        prang(ctx, w * 0.4, tb - h * 0.02, h * 0.17, w * 0.06, r, s, false);
        prang(ctx, w * 0.84, tb - h * 0.02, h * 0.17, w * 0.06, r, s, false);
        prang(ctx, w * 0.48, tb - h * 0.02, h * 0.22, w * 0.08, r, s, false);
        prang(ctx, w * 0.76, tb - h * 0.02, h * 0.22, w * 0.08, r, s, false);
        prang(ctx, tc, tb - h * 0.015, h * 0.4, w * 0.14, r, s, true);
        templeHall(ctx, w * 0.17, tb, w * 0.24, h * 0.2, s);
        // a waterside pavilion with a small roof
        ctx.fillStyle = '#f4ead8'; ctx.fillRect(w * 0.27, tb - h * 0.035, w * 0.045, h * 0.035); ctx.fillStyle = '#e8702a'; ctx.beginPath(); ctx.moveTo(w * 0.26, tb - h * 0.03); ctx.lineTo(w * 0.2925, tb - h * 0.06); ctx.lineTo(w * 0.325, tb - h * 0.03); ctx.closePath(); ctx.fill();
        glow(ctx, tc, tb - h * 0.2, w * 0.35, '#ffd890', 0.15);
        haze(ctx, -w * 0.1, bank - h * 0.04, w * 1.1, hz + h * 0.01, '#ffd8a8', 0.3);
        // riverbank wall
        ctx.fillStyle = '#8a7258'; ctx.fillRect(0, bank, w, hz - bank + 1);
        ctx.fillStyle = 'rgba(255,230,190,0.4)'; ctx.fillRect(0, bank, w, Math.max(0.6, 0.8 * s));
        /* the river: brown-green water turned to gold by the low sun */
        var wb = L.pier;
        ctx.fillStyle = lg(ctx, 0, hz, 0, wb, [[0, '#c89a6a'], [0.3, '#8a7a5a'], [1, '#4a5040']]); ctx.fillRect(0, hz, w, wb - hz + 2);
        haze(ctx, -w * 0.2, hz, w * 0.5, wb + h * 0.05, '#ffcf7a', 0.45);
        // the temple mirrored, broken by ripples
        ctx.save(); ctx.globalAlpha = 0.28; ctx.translate(0, hz * 2 + h * 0.005); ctx.scale(1, -1);
        ctx.beginPath(); ctx.rect(0, hz - (wb - hz) * 1.0, w, wb - hz); ctx.clip();
        prang(ctx, tc, tb - h * 0.015, h * 0.4, w * 0.14, rng(1), s, true);
        prang(ctx, w * 0.48, tb - h * 0.02, h * 0.22, w * 0.08, rng(2), s, false); prang(ctx, w * 0.76, tb - h * 0.02, h * 0.22, w * 0.08, rng(3), s, false);
        ctx.restore();
        batch(ctx, Math.round(2000 * k), [['#ffe2a0', 0.7 * s, 0.45], ['#3a3a2a', 0.8 * s, 0.35], ['#c8b090', 0.6 * s, 0.3]], function () { var p = Math.pow(r(), 0.9), yy = hz + 1 * s + p * (wb - hz), xx = r() * w, l = (1.5 + p * 9) * s; var b = r() < 0.55 - xx / w * 0.4 ? 0 : r() < 0.6 ? 1 : 2; return [xx, yy, xx + l, yy, b]; });
        // water hyacinth drifting
        for (i = 0; i < 7; i++) { var hx = r() * w, hy = lerp(hz + h * 0.03, wb - h * 0.01, r()), hs = (0.6 + (hy - hz) / (wb - hz)) * 3 * s;
          dots(ctx, 7, [['#3a6a30', 0.9], ['#6a9a40', 0.9], ['#b88ad0', 0.9]], function (n) { return [hx + (n - 3) * hs * 0.8 + r() * hs * 0.3, hy - (n % 2) * hs * 0.3, hs * (0.6 + r() * 0.3), n === 3 ? 2 : n % 2]; }); }
        /* the pier: teak planks, posts and a mooring rope */
        var fy = wb;
        ctx.fillStyle = lg(ctx, 0, fy, 0, h, [[0, '#b0784a'], [0.35, '#94603a'], [1, '#5e3a24']]); ctx.fillRect(0, fy, w, h - fy);
        var py = fy, gap = 3 * s;
        while (py < h) { gap *= 1.16; ctx.fillStyle = 'rgba(50,25,12,0.55)'; ctx.fillRect(0, py, w, Math.max(0.5, gap * 0.08)); ctx.fillStyle = 'rgba(255,214,160,0.18)'; ctx.fillRect(0, py + gap * 0.1, w, Math.max(0.4, gap * 0.05));
          for (x = (r() * 30) * s; x < w; x += (30 + r() * 50) * s * (gap / (3 * s))) { ctx.fillStyle = 'rgba(50,25,12,0.5)'; ctx.fillRect(x, py, Math.max(0.5, gap * 0.05), gap); }
          py += gap; }
        batch(ctx, Math.round(800 * k), [['#5a3420', 0.6 * s, 0.35], ['#e8b888', 0.5 * s, 0.25]], function () { var yy = lerp(fy, h, r()), xx = r() * w, l = (3 + (yy - fy) / h * 30) * s; return [xx, yy, xx + l, yy, r() < 0.6 ? 0 : 1]; });
        // warm light across the deck from the low sun (left)
        glow(ctx, -w * 0.1, fy + h * 0.05, w * 0.9, '#ffc070', 0.32);
        ctx.fillStyle = '#4a2c1a'; ctx.fillRect(0, fy - 1.4 * s, w, 2.4 * s); ctx.fillStyle = 'rgba(255,210,150,0.6)'; ctx.fillRect(0, fy - 1.4 * s, w, Math.max(0.5, 0.6 * s));
        [[0.12, 1], [0.88, 1]].forEach(function (pp) { var bx = w * pp[0], bh = h * 0.07, bwid = 6 * s;
          ctx.fillStyle = lg(ctx, bx - bwid, 0, bx + bwid, 0, [[0, '#d8a070'], [0.5, '#8a5432'], [1, '#4a2a18']]); ctx.fillRect(bx - bwid / 2, fy - bh * 0.4, bwid, bh); ctx.fillStyle = '#f4e8d8'; ctx.fillRect(bx - bwid / 2, fy - bh * 0.4, bwid, bh * 0.12);
          ctx.fillStyle = '#c8302a'; ctx.fillRect(bx - bwid / 2, fy - bh * 0.4 + bh * 0.12, bwid, bh * 0.06); });
        ctx.strokeStyle = '#d8c098'; ctx.lineWidth = Math.max(0.8, 1.4 * s); ctx.beginPath(); ctx.moveTo(w * 0.12, fy - h * 0.012); ctx.quadraticCurveTo(w * 0.5, fy + h * 0.03, w * 0.88, fy - h * 0.012); ctx.stroke();
        // a palm leaning in from the left, framing the view
        palm(ctx, -w * 0.02, h * 1.02, h * 0.78, 0.14, { trunk: '#8a6a4a', trunkD: '#4a3424', frond: '#3e6a32', frondD: '#24442a', nut: '#6a5a2a', lit: '#c8d878' }, 77);
        // a big glazed pot of lotus on the right
        var px2 = w * 0.94, py2 = h * 0.955, pr = w * 0.06;
        ctx.fillStyle = lg(ctx, px2 - pr, 0, px2 + pr, 0, [[0, '#2a5a6a'], [0.35, '#4a8a9a'], [1, '#1a3a44']]); ctx.beginPath(); ctx.moveTo(px2 - pr, py2 - pr * 0.9); ctx.quadraticCurveTo(px2 - pr * 1.15, py2, px2 - pr * 0.6, py2 + pr * 0.3); ctx.lineTo(px2 + pr * 0.6, py2 + pr * 0.3); ctx.quadraticCurveTo(px2 + pr * 1.15, py2, px2 + pr, py2 - pr * 0.9); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e8d8a8'; ctx.fillRect(px2 - pr * 0.95, py2 - pr * 0.6, pr * 1.9, pr * 0.08);
        ctx.fillStyle = '#1a3a2a'; ctx.beginPath(); ctx.ellipse(px2, py2 - pr * 0.9, pr, pr * 0.18, 0, 0, TAU); ctx.fill();
        [[-0.5, -1.25, 0.5], [0.3, -1.4, 0.6], [0.7, -1.05, 0.4]].forEach(function (lp) { ctx.fillStyle = '#4a8a3a'; ctx.beginPath(); ctx.ellipse(px2 + lp[0] * pr, py2 + lp[1] * pr, pr * lp[2], pr * lp[2] * 0.35, -0.1, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,220,0.25)'; ctx.beginPath(); ctx.ellipse(px2 + lp[0] * pr - pr * 0.1, py2 + lp[1] * pr - pr * 0.05, pr * lp[2] * 0.5, pr * lp[2] * 0.12, -0.1, 0, TAU); ctx.fill(); });
        // a lotus flower
        var lx2 = px2 - pr * 0.15, ly2 = py2 - pr * 1.75; ctx.strokeStyle = '#3a6a2a'; ctx.lineWidth = Math.max(0.6, 1 * s); ctx.beginPath(); ctx.moveTo(lx2, ly2); ctx.lineTo(lx2 + pr * 0.1, py2 - pr * 1.0); ctx.stroke();
        for (i = -2; i <= 2; i++) { ctx.save(); ctx.translate(lx2, ly2); ctx.rotate(i * 0.38); ctx.fillStyle = lg(ctx, 0, -pr * 0.45, 0, 0, [[0, '#ff7ab0'], [1, '#ffe0ec']]); ctx.beginPath(); ctx.ellipse(0, -pr * 0.22, pr * 0.12, pr * 0.26, 0, 0, TAU); ctx.fill(); ctx.restore(); }
        // the palm's shade on the deck
        ctx.fillStyle = 'rgba(60,30,15,0.18)'; ctx.beginPath();
        for (i = 0; i < Math.round(26 * Math.sqrt(k)); i++) { var sx = w * (0.05 + r() * 0.5), sy = lerp(fy + h * 0.08, h * 0.8, r()), sl = (10 + r() * 22) * s; ctx.moveTo(sx, sy); ctx.ellipse(sx, sy, sl, sl * 0.12, (r() - 0.5) * 0.6, 0, TAU); }
        ctx.fill();
        finish(ctx, w, h, '#ffb860', 0.18, 0.24, 0.045);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = bkkLayout(w, h), hz = L.hz, s = L.s, wb = L.pier, i;
        // glints on the gold
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 6; i++) { var k2 = Math.sin(t * 1.7 + i * 2.3); if (k2 < 0.6) continue; var gx = w * 0.62 + (h1(i, 3) - 0.5) * w * 0.06, gy = hz - h * (0.08 + h1(i, 7) * 0.25); var rr = (k2 - 0.6) * 9 * s; ctx.fillStyle = 'rgba(255,248,210,' + ((k2 - 0.6) * 1.8).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(gx, gy - rr); ctx.lineTo(gx + rr * 0.2, gy); ctx.lineTo(gx, gy + rr); ctx.lineTo(gx - rr * 0.2, gy); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(gx - rr, gy); ctx.lineTo(gx, gy + rr * 0.2); ctx.lineTo(gx + rr, gy); ctx.lineTo(gx, gy - rr * 0.2); ctx.closePath(); ctx.fill(); }
        // sun glitter on the water
        ctx.lineCap = 'round';
        for (i = 0; i < 40; i++) { var ph = h1(i, 21) * TAU, kk = Math.sin(t * 2.4 + ph); if (kk < 0.4) continue; var yy = hz + 2 * s + h1(i, 23) * (wb - hz - 4 * s), xx = (h1(i, 25) * 0.55) * w + Math.sin(t + i) * 2 * s, l = (1.5 + h1(i, 27) * 3) * s;
          ctx.strokeStyle = 'rgba(255,236,180,' + (0.5 * kk).toFixed(3) + ')'; ctx.lineWidth = Math.max(0.6, 0.9 * s); ctx.beginPath(); ctx.moveTo(xx - l, yy); ctx.lineTo(xx + l, yy); ctx.stroke(); }
        ctx.restore();
        // a tug pulling a train of rice barges, slowly
        var bt = sprite('bkbarge', 120 * s, 12 * s, drawBarges), bx = w + 120 * s - ((t * 3 * s) % (w + 240 * s)), by = hz + (wb - hz) * 0.22;
        drawBoat(ctx, bt, bx, by, 120 * s * 0.75, 12 * s * 0.75, s * 0.7, t, -1);
        // a long-tail boat zipping across, close to the pier
        var lw2 = 60 * s, lh2 = 16 * s, lt = sprite('bklongtail', lw2, lh2, drawLongtail), lx = ((t * 16 * s + w * 0.3) % (w + lw2 * 3)) - lw2, ly = hz + (wb - hz) * 0.72;
        // spray from the propeller
        for (i = 0; i < 8; i++) { var f = (t * 3 + i / 8) % 1; soft(ctx, lx - lw2 * 0.5 - f * 18 * s, ly - f * 4 * s + 1 * s, (2 + f * 5) * s, (1 + f * 2) * s, '#fff8ec', 0.4 * (1 - f)); }
        drawBoat(ctx, lt, lx, ly, lw2, lh2, s, t * 2, 1);
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };
  function drawLongtail(c, w, h) {
    var s = w / 60;
    // long, low wooden hull with an upswept bow (right)
    var g = c.createLinearGradient(0, h - 6 * s, 0, h); g.addColorStop(0, '#a8643a'); g.addColorStop(1, '#5a2e18'); c.fillStyle = g;
    c.beginPath(); c.moveTo(4 * s, h - 5 * s); c.lineTo(w - 10 * s, h - 5 * s); c.quadraticCurveTo(w - 2 * s, h - 6 * s, w - 1 * s, h - 12 * s); c.lineTo(w - 4 * s, h - 9 * s); c.quadraticCurveTo(w - 8 * s, h, w - 14 * s, h); c.lineTo(8 * s, h); c.closePath(); c.fill();
    c.fillStyle = '#2a6aa8'; c.fillRect(6 * s, h - 5.6 * s, w - 18 * s, 1.2 * s);
    // garlands on the bow
    var cols = ['#ff4a8a', '#ffd23f', '#5ad0ff', '#ffffff'];
    for (var i = 0; i < 4; i++) { c.strokeStyle = cols[i]; c.lineWidth = Math.max(0.6, 0.9 * s); c.beginPath(); c.moveTo(w - 2 * s - i * 0.4 * s, h - 11.5 * s + i * 0.8 * s); c.quadraticCurveTo(w - 5 * s, h - 13 * s + i, w - 7 * s, h - 9 * s + i * 0.6 * s); c.stroke(); }
    // canopy and passengers
    c.fillStyle = '#e8e0cc'; c.fillRect(16 * s, h - 11.5 * s, 26 * s, 1.4 * s);
    c.strokeStyle = '#5a3a24'; c.lineWidth = Math.max(0.5, 0.6 * s); c.beginPath(); c.moveTo(17 * s, h - 10 * s); c.lineTo(17 * s, h - 5 * s); c.moveTo(41 * s, h - 10 * s); c.lineTo(41 * s, h - 5 * s); c.stroke();
    [['#e85a3a', 22], ['#3a8ad0', 28], ['#f2c040', 34]].forEach(function (p) { c.fillStyle = p[0]; c.fillRect(p[1] * s - 1.4 * s, h - 8.5 * s, 2.8 * s, 3.2 * s); c.fillStyle = '#3a2418'; c.beginPath(); c.arc(p[1] * s, h - 9.5 * s, 1.2 * s, 0, TAU); c.fill(); });
    // the driver at the stern and the long propeller shaft
    c.fillStyle = '#2a2a2a'; c.fillRect(6 * s, h - 9 * s, 4 * s, 3 * s); c.fillStyle = '#8a8a8a'; c.fillRect(6.5 * s, h - 8.5 * s, 3 * s, 1 * s);
    c.strokeStyle = '#4a4a4a'; c.lineWidth = Math.max(0.6, 0.8 * s); c.beginPath(); c.moveTo(7 * s, h - 6.5 * s); c.lineTo(-0.5 * s, h - 1 * s); c.stroke();
    c.fillStyle = '#c8302a'; c.fillRect(11 * s, h - 9.6 * s, 2.4 * s, 3 * s); c.fillStyle = '#3a2418'; c.beginPath(); c.arc(12.2 * s, h - 10.6 * s, 1.1 * s, 0, TAU); c.fill();
  }
  function drawBarges(c, w, h) {
    var s = h / 12;
    // the tug (left, it leads the way when the sprite is flipped)
    c.fillStyle = '#2a3a4a'; c.fillRect(w - 18 * s, h - 4 * s, 16 * s, 4 * s); c.fillStyle = '#e8e0d0'; c.fillRect(w - 14 * s, h - 8 * s, 8 * s, 4 * s); c.fillStyle = '#c8302a'; c.fillRect(w - 13 * s, h - 9.5 * s, 2 * s, 1.5 * s);
    for (var i = 0; i < 3; i++) { var x0 = w - 24 * s - (i + 1) * 30 * s;
      c.fillStyle = '#3a2418'; c.beginPath(); c.moveTo(x0, h - 5 * s); c.lineTo(x0 + 28 * s, h - 5 * s); c.lineTo(x0 + 26 * s, h); c.lineTo(x0 + 2 * s, h); c.closePath(); c.fill();
      c.fillStyle = '#6a4a2a'; c.beginPath(); c.moveTo(x0 + 3 * s, h - 5 * s); c.quadraticCurveTo(x0 + 14 * s, h - 10 * s, x0 + 25 * s, h - 5 * s); c.closePath(); c.fill();
      c.strokeStyle = '#8a6a4a'; c.lineWidth = Math.max(0.4, 0.5 * s); c.beginPath(); c.moveTo(x0 + 28 * s, h - 3 * s); c.lineTo(x0 + 32 * s, h - 3 * s); c.stroke(); }
  }

  /* ======================= THAILAND · FLOATING MARKET (morning on the canal) ======================= */
  /* a vendor in a wide straw hat */
  function vendor(c, x, y, sz, shirt) {
    c.fillStyle = shirt; c.beginPath(); c.ellipse(x, y - sz * 0.55, sz * 0.32, sz * 0.5, 0, 0, TAU); c.fill();
    c.fillStyle = '#8a5a3a'; c.beginPath(); c.arc(x, y - sz * 1.1, sz * 0.18, 0, TAU); c.fill();
    var g = c.createLinearGradient(x - sz * 0.7, 0, x + sz * 0.7, 0); g.addColorStop(0, '#f2dca0'); g.addColorStop(0.6, '#d8b870'); g.addColorStop(1, '#a8884a'); c.fillStyle = g;
    c.beginPath(); c.moveTo(x - sz * 0.75, y - sz * 1.08); c.quadraticCurveTo(x, y - sz * 1.62, x + sz * 0.75, y - sz * 1.08); c.quadraticCurveTo(x, y - sz * 1.0, x - sz * 0.75, y - sz * 1.08); c.fill();
    c.strokeStyle = 'rgba(120,90,40,0.6)'; c.lineWidth = Math.max(0.4, sz * 0.04); c.beginPath(); c.moveTo(x - sz * 0.4, y - sz * 1.2); c.quadraticCurveTo(x, y - sz * 1.45, x + sz * 0.4, y - sz * 1.2); c.stroke();
  }
  /* a laden vendor boat, side-on, bow to the right. kind: 0 fruit, 1 noodles (pot + steam spot), 2 flowers */
  function vendorBoat(c, w, h, kind, seed) {
    var s = w / 60, r = rng(seed), i;
    var g = c.createLinearGradient(0, h - 9 * s, 0, h); g.addColorStop(0, '#7a4a2a'); g.addColorStop(1, '#3a2014'); c.fillStyle = g;
    c.beginPath(); c.moveTo(1 * s, h - 9 * s); c.quadraticCurveTo(6 * s, h - 6 * s, 10 * s, h - 6 * s); c.lineTo(w - 10 * s, h - 6 * s); c.quadraticCurveTo(w - 5 * s, h - 6 * s, w - 1 * s, h - 9.5 * s); c.quadraticCurveTo(w - 6 * s, h, w - 14 * s, h); c.lineTo(12 * s, h); c.quadraticCurveTo(4 * s, h, 1 * s, h - 9 * s); c.closePath(); c.fill();
    c.fillStyle = '#a8703e'; c.fillRect(8 * s, h - 6.6 * s, w - 16 * s, 1 * s);
    if (kind === 1) { // noodle boat: a steaming pot, bowls, and the cook
      c.fillStyle = '#9aa0a8'; c.fillRect(w * 0.55, h - 12 * s, 9 * s, 6 * s); c.fillStyle = '#c8ccd0'; c.fillRect(w * 0.55 - 0.5 * s, h - 12.5 * s, 10 * s, 1.2 * s);
      for (i = 0; i < 4; i++) { c.fillStyle = '#f4f0e8'; c.beginPath(); c.ellipse(w * 0.3 + i * 4 * s, h - 7 * s, 1.6 * s, 0.9 * s, 0, 0, TAU); c.fill(); c.fillStyle = '#3a7ac0'; c.fillRect(w * 0.3 + i * 4 * s - 1.4 * s, h - 7.2 * s, 2.8 * s, 0.4 * s); }
      vendor(c, w * 0.42, h - 6 * s, 9 * s, '#3a6ab0');
    } else {
      // heaps of produce in round baskets
      var heaps = kind === 0 ? [['#ffcc33', '#f2a020'], ['#c02a5a', '#8a1a3a'], ['#7ac040', '#4a8a2a'], ['#ff8a3a', '#e05a1a'], ['#5a2a4a', '#3a1a2a']] : [['#ffffff', '#e8e0f0'], ['#ff6ab0', '#e0408a'], ['#ffd23f', '#ff9a1a'], ['#c88cff', '#8a5ad0']];
      for (i = 0; i < 4; i++) {
        var hx = w * (0.22 + i * 0.13) + (i > 1 ? 6 * s : 0), hy = h - 6.5 * s, hr = (3.4 + r() * 1.2) * s, cc = heaps[(i + seed) % heaps.length];
        c.fillStyle = '#b8945a'; c.beginPath(); c.ellipse(hx, hy, hr * 1.15, hr * 0.45, 0, 0, TAU); c.fill();
        for (var q = 0; q < 9; q++) { var a = r() * PI, d = r() * hr * 0.9; c.fillStyle = r() < 0.5 ? cc[0] : cc[1]; c.beginPath(); c.arc(hx + Math.cos(a) * d * 1.1, hy - Math.sin(a) * d * 0.8 - 0.6 * s, (kind === 0 ? 1.3 : 1.1) * s, 0, TAU); c.fill(); }
        if (kind === 0 && i === 0) { c.fillStyle = '#e8d040'; for (q = 0; q < 4; q++) { c.beginPath(); c.ellipse(hx - 2 * s + q * 1.4 * s, hy - 3.5 * s, 0.7 * s, 2.4 * s, 0.4, 0, TAU); c.fill(); } }
      }
      vendor(c, w * 0.8, h - 6 * s, 9 * s, kind === 0 ? '#c83a3a' : '#2a8a6a');
    }
    // paddle
    c.strokeStyle = '#5a3a20'; c.lineWidth = Math.max(0.5, 0.8 * s); c.beginPath(); c.moveTo(w * 0.86, h - 12 * s); c.lineTo(w * 0.96, h + 1 * s); c.stroke();
  }
  function fmLayout(w, h) { var vy = h * 0.4; return { vx: w * 0.5, vy: vy, W: w * 0.56, G: h - vy, jetty: h * 0.655, s: scl(w, h), k: dens(w, h) }; }
  var FM = {};
  SC.floatmarket = {
    paint: function (ctx, w, h) {
      try {
        var L = fmLayout(w, h), vx = L.vx, vy = L.vy, W = L.W, G = L.G, s = L.s, k = L.k, r = rng(6161), i, j, x, y, z;
        var D = FM[w + 'x' + h] = { steam: [] };
        function X(side, z, off) { return vx + side * (W + (off || 0)) / z; }
        function Y(z, H) { return vy + G * (1 - H) / z; }
        /* soft morning sky and sunbeams */
        ctx.fillStyle = lg(ctx, 0, 0, 0, vy, [[0, '#7ab8e0'], [0.6, '#bfe0ee'], [1, '#fff0d4']]); ctx.fillRect(0, 0, w, vy + 2);
        glow(ctx, w * 0.82, h * 0.06, Math.max(w, h) * 0.6, '#fff4d0', 0.6);
        for (i = 0; i < 5; i++) { var cx = r() * w, cy = h * (0.05 + r() * 0.12), cs = w * (0.05 + r() * 0.06); for (j = 0; j < 6; j++) soft(ctx, cx + (j - 2.5) * cs * 0.5, cy - Math.sin(j / 5 * PI) * cs * 0.3, cs * 0.5, cs * 0.3, '#ffffff', 0.6); }
        // far jungle canopy at the end of the canal
        function far(x) { return vy - h * (0.06 + 0.04 * fbm(x / w * 6, 71, 4)); }
        ridge(ctx, -2, w + 2, 2, far, vy + 4, '#8aa888');
        dots(ctx, Math.round(200 * k), [['#6a8a62', 0.6], ['#a8c4a0', 0.5]], function () { var xx = r() * w; return [xx, lerp(far(xx), vy, r()), (1.5 + r() * 3) * s, r() < 0.6 ? 0 : 1]; });
        haze(ctx, -w * 0.1, vy - h * 0.12, w * 1.1, vy + h * 0.03, '#f4f0e0', 0.55);
        /* canal water */
        ctx.fillStyle = lg(ctx, 0, vy, 0, h, [[0, '#c8d4b8'], [0.15, '#8aa080'], [0.6, '#5a7454'], [1, '#3a5038']]); ctx.fillRect(0, vy, w, h - vy);
        glow(ctx, vx, vy + h * 0.02, w * 0.4, '#fff8e0', 0.45);
        /* the banks behind the houses: thick green, darker near us */
        [-1, 1].forEach(function (side) { ctx.fillStyle = lg(ctx, 0, vy - h * 0.06, 0, L.jetty, [[0, '#7a9a6a'], [1, '#2e4a2a']]); ctx.beginPath(); ctx.moveTo(vx + side * W / 30, vy - h * 0.01); ctx.lineTo(vx + side * w * 0.7, vy - h * 0.06); ctx.lineTo(vx + side * w * 0.7, L.jetty + 2); ctx.lineTo(vx + side * W / 0.6, L.jetty + 2); ctx.closePath(); ctx.fill(); });
        dots(ctx, Math.round(900 * k), [['#2e5a2e', 0.8], ['#4a7a3a', 0.8], ['#6a9a4a', 0.7], ['#1e3a22', 0.8]], function () { var side = r() < 0.5 ? -1 : 1, yy = lerp(vy - h * 0.05, L.jetty, Math.pow(r(), 0.8)), z2 = G / Math.max(2, yy - vy + h * 0.06), xx = vx + side * (W / z2 + r() * w * 0.5); return [xx, yy, (1.5 + (yy - vy) / h * 14 + r() * 2) * s, (r() * 4) | 0]; });
        /* palms and banana trees behind the houses */
        for (i = 0; i < 12; i++) { var side = i % 2 ? 1 : -1, pz = 2.4 + r() * 9, px = X(side, pz, w * (0.18 + r() * 0.2)), pb = Y(pz, 0.9), ph = G * (1.4 + r() * 0.8) / pz;
          palm(ctx, px, pb, ph, (r() - 0.5) * 0.4 + side * 0.05, { trunk: '#8a7a5a', trunkD: '#5a4a3a', frond: '#5a8a3a', frondD: '#3a6a2a', lit: '#c8e080' }, 300 + i, 0); }
        /* stilt houses on both banks, far to near */
        var segs = [];
        [-1, 1].forEach(function (side) { var z0 = 0.8; while (z0 < 20) { var z1 = z0 * (1.18 + r() * 0.16); segs.push({ side: side, z0: z0, z1: z1, H: 0.85 + r() * 0.35, wall: ['#9a6a42', '#a8784a', '#8a5a38', '#b8885a'][(r() * 4) | 0], roof: ['#a8442a', '#7a6a5a', '#b85a32', '#8a3a2a'][(r() * 4) | 0], seed: (r() * 1e6) | 0 }); z0 = z1 * 1.01; } });
        segs.sort(function (a, b) { return b.z0 - a.z0; });
        segs.forEach(function (b) {
          var sd = b.side, za = b.z0, zb = b.z1, rr = rng(b.seed);
          function q(h0, h1, o0, o1) { ctx.beginPath(); ctx.moveTo(X(sd, za, o0 || 0), Y(za, h0)); ctx.lineTo(X(sd, za, o0 || 0), Y(za, h1)); ctx.lineTo(X(sd, zb, o1 || 0), Y(zb, h1)); ctx.lineTo(X(sd, zb, o1 || 0), Y(zb, h0)); ctx.closePath(); }
          // stilts in the water
          ctx.strokeStyle = '#4a3020'; ctx.lineWidth = Math.max(0.6, 2.2 * s / za);
          for (var u = 0.05; u < 1; u += 0.3) { var zs = lerp(za, zb, u); ctx.beginPath(); ctx.moveTo(X(sd, zs), Y(zs, 0.18)); ctx.lineTo(X(sd, zs), Y(zs, -0.05)); ctx.stroke(); }
          // deck, walls, open front with goods
          ctx.fillStyle = '#6a4a2e'; q(0.16, 0.2); ctx.fill();
          ctx.fillStyle = b.wall; q(0.2, b.H); ctx.fill();
          ctx.fillStyle = 'rgba(40,20,10,0.55)'; q(0.22, b.H * 0.78, 0, 0); ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
          // goods on shelves inside: bright little rows
          ctx.fillStyle = 'rgba(255,220,160,0.18)'; q(0.22, b.H * 0.78, 0, 0); ctx.fill();
          for (var row = 0; row < 3; row++) { var hg = 0.27 + row * 0.15; if (hg > b.H * 0.72) continue; ctx.fillStyle = '#8a6040'; q(hg - 0.01, hg); ctx.fill();
            for (u = 0.06; u < 0.96; u += 0.035) { if (rr() < 0.35) continue; var zg = lerp(za, zb, u), ih = 0.025 + rr() * 0.035, iw = (1 + rr() * 1.2) * s / zg * 2;
              ctx.fillStyle = ['#ff5a4a', '#ffd23f', '#5ad0ff', '#7dff7a', '#ff8ad0', '#f4f0e8', '#ffa040', '#c88a4a'][(rr() * 8) | 0]; ctx.fillRect(X(sd, zg) - iw / 2, Y(zg, hg + ih), Math.max(0.5, iw), Math.max(0.5, Y(zg, hg) - Y(zg, hg + ih))); } }
          // hanging things at the eaves
          for (u = 0.1; u < 0.95; u += 0.1) { if (rr() < 0.45) continue; var zh = lerp(za, zb, u), hl = 0.05 + rr() * 0.06, hw2 = (1.2 + rr()) * s / zh * 2; ctx.fillStyle = ['#ffb020', '#e84a6a', '#4ac0e0', '#f4f0e0', '#7ac04a'][(rr() * 5) | 0]; ctx.fillRect(X(sd, zh) - hw2 / 2, Y(zh, b.H * 0.79), Math.max(0.5, hw2), Math.max(0.5, (Y(zh, b.H * 0.79 - hl) - Y(zh, b.H * 0.79)))); }
          // the roof, sloping out over the water
          ctx.fillStyle = b.roof; ctx.beginPath(); ctx.moveTo(X(sd, za, -W * 0.1), Y(za, b.H - 0.05)); ctx.lineTo(X(sd, za, W * 0.3), Y(za, b.H + 0.2)); ctx.lineTo(X(sd, zb, W * 0.3), Y(zb, b.H + 0.2)); ctx.lineTo(X(sd, zb, -W * 0.1), Y(zb, b.H - 0.05)); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(255,240,210,0.25)'; ctx.beginPath(); ctx.moveTo(X(sd, za, -W * 0.1), Y(za, b.H - 0.05)); ctx.lineTo(X(sd, za, -W * 0.1), Y(za, b.H - 0.02)); ctx.lineTo(X(sd, zb, -W * 0.1), Y(zb, b.H - 0.02)); ctx.lineTo(X(sd, zb, -W * 0.1), Y(zb, b.H - 0.05)); ctx.closePath(); ctx.fill();
          // corrugation lines
          ctx.strokeStyle = 'rgba(40,20,10,0.25)'; ctx.lineWidth = Math.max(0.4, 0.6 * s / za * 2); ctx.beginPath(); for (u = 0; u <= 1; u += 0.08) { var zr = lerp(za, zb, u); ctx.moveTo(X(sd, zr, -W * 0.1), Y(zr, b.H - 0.05)); ctx.lineTo(X(sd, zr, W * 0.3), Y(zr, b.H + 0.2)); } ctx.stroke();
          // a big market umbrella on some decks
          if (rr() < 0.45 && za > 1.6) { var zu = lerp(za, zb, 0.5), ux = X(sd, zu, -W * 0.16), uy = Y(zu, b.H * 0.62), ur = 22 * s / zu * 1.6, uc = ['#e84a3a', '#2a8ad0', '#f2b81a', '#3aa86a'][(rr() * 4) | 0];
            ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = Math.max(0.5, 1.2 * s / zu * 1.6); ctx.beginPath(); ctx.moveTo(ux, uy); ctx.lineTo(ux, Y(zu, 0.2)); ctx.stroke();
            ctx.fillStyle = uc; ctx.beginPath(); ctx.moveTo(ux - ur, uy + ur * 0.15); ctx.quadraticCurveTo(ux, uy - ur * 0.7, ux + ur, uy + ur * 0.15); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(ux - ur * 0.3, uy - ur * 0.1); ctx.quadraticCurveTo(ux, uy - ur * 0.62, ux + ur * 0.15, uy - ur * 0.2); ctx.closePath(); ctx.fill(); }
        });
        // two signs for the visitors: 水果 (fruit) and 船面 (boat noodles)
        [[-1, 3.2, '水果', '#e8402a'], [1, 4.4, '船面', '#2a7ac0']].forEach(function (sg) { var zz = sg[1], sx = X(sg[0], zz, -W * 0.05), sy = Y(zz, 1.05), sw = 30 * s / zz * 1.7, sh = 12 * s / zz * 1.7;
          ctx.fillStyle = '#f8f0dc'; ctx.fillRect(sx - sw / 2, sy - sh, sw, sh); ctx.strokeStyle = sg[3]; ctx.lineWidth = Math.max(0.5, sh * 0.08); ctx.strokeRect(sx - sw / 2 + sh * 0.1, sy - sh * 0.9, sw - sh * 0.2, sh * 0.8);
          ctx.fillStyle = sg[3]; ctx.font = '900 ' + (sh * 0.62).toFixed(1) + 'px ' + ZHF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sg[2], sx, sy - sh * 0.47); });
        /* reflections of the houses and the bright sky down the middle */
        batch(ctx, Math.round(1600 * k), [['#fff6dc', 0.7 * s, 0.45], ['#2a3a24', 0.8 * s, 0.35], ['#a87a4a', 0.7 * s, 0.25]], function () {
          var yy = lerp(vy + 1 * s, L.jetty, Math.pow(r(), 0.9)), z2 = G / Math.max(1, yy - vy), half = W / z2, xx = vx + (r() * 2 - 1) * half * 1.4, l = (1 + 6 / z2 * 3) * s;
          var b = Math.abs(xx - vx) < half * 0.55 ? (r() < 0.6 ? 0 : 1) : (r() < 0.5 ? 2 : 1); return [xx - l / 2, yy, xx + l / 2, yy, b];
        });
        /* boats on the canal (painted ones stay put; two more drift by in the overlay) */
        var B = [[0, 9, -0.1, 11], [2, 6.5, 0.35, 12], [1, 4.6, -0.45, 13], [0, 3.6, 0.5, 14]];
        B.forEach(function (bt) { var zz = bt[1], bw = 60 * s / zz * 3.6, bh = 22 * s / zz * 3.6, bx = vx + bt[2] * W / zz * 1.3, by = Y(zz, 0);
          var spr = sprite('fmboat' + bt[0] + '_' + bt[3], 60 * s, 22 * s, function (c, ww, hh) { vendorBoat(c, ww, hh, bt[0], bt[3]); });
          ctx.save(); ctx.globalAlpha = 0.25; ctx.translate(bx, by); ctx.scale(1, -0.5); ctx.drawImage(spr, -bw / 2, -bh, bw, bh); ctx.restore();
          ctx.drawImage(spr, bx - bw / 2, by - bh, bw, bh);
          if (bt[0] === 1) D.steam.push([bx + bw * 0.12, by - bh * 0.55, 3.6 / zz]); });
        haze(ctx, vx - w * 0.3, vy - h * 0.04, vx + w * 0.3, vy + h * 0.08, '#fff4dc', 0.35);
        /* the jetty we stand on */
        var fy = L.jetty;
        ctx.fillStyle = lg(ctx, 0, fy, 0, h, [[0, '#c09060'], [0.4, '#a87848'], [1, '#6a4428']]); ctx.fillRect(0, fy, w, h - fy);
        // boards running out toward the canal, in perspective
        ctx.save(); ctx.beginPath(); ctx.rect(0, fy, w, h - fy); ctx.clip();
        ctx.strokeStyle = 'rgba(60,32,16,0.5)'; ctx.lineWidth = Math.max(0.5, 0.9 * s); ctx.beginPath();
        for (i = -16; i <= 16; i++) { var bx2 = vx + i * w * 0.075; ctx.moveTo(lerp(vx, bx2, (fy - vy) / (h - vy)), fy); ctx.lineTo(bx2, h); }
        ctx.stroke();
        batch(ctx, Math.round(900 * k), [['#6a3a1e', 0.6 * s, 0.3], ['#f0c890', 0.5 * s, 0.25]], function () { var yy = lerp(fy, h, r()), xx = r() * w, l = (2 + (yy - fy) / h * 20) * s; var ax = (xx - vx) / (yy - vy + 1) * l * 0.3; return [xx, yy, xx + ax, yy + l * 0.5, r() < 0.6 ? 0 : 1]; });
        glow(ctx, w * 0.75, fy, w * 0.6, '#fff0c0', 0.3);
        // dappled morning light through the leaves
        for (i = 0; i < 8; i++) soft(ctx, r() * w, lerp(fy + h * 0.06, h, r()), w * (0.06 + r() * 0.1), h * (0.01 + r() * 0.02), '#fff0c0', 0.18);
        ctx.restore();
        ctx.fillStyle = '#5a3a20'; ctx.fillRect(0, fy - 1.6 * s, w, 3 * s); ctx.fillStyle = 'rgba(255,230,180,0.5)'; ctx.fillRect(0, fy - 1.6 * s, w, Math.max(0.5, 0.7 * s));
        // baskets of fruit at the jetty's edge: mangoes, mangosteens, rambutans
        [[0.1, ['#ffcc33', '#f2a020']], [0.9, ['#c02a3a', '#ff5a6a']], [0.8, ['#5a2a4a', '#7a3a5a']]].forEach(function (bk, n) { var bx3 = w * bk[0], by3 = fy + h * (n === 2 ? 0.07 : 0.03), br = w * (n === 2 ? 0.055 : 0.045);
          ctx.fillStyle = lg(ctx, 0, by3 - br * 0.3, 0, by3 + br * 0.6, [[0, '#d8b070'], [1, '#8a6a3a']]); ctx.beginPath(); ctx.moveTo(bx3 - br, by3); ctx.lineTo(bx3 + br, by3); ctx.lineTo(bx3 + br * 0.75, by3 + br * 0.7); ctx.lineTo(bx3 - br * 0.75, by3 + br * 0.7); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(90,60,30,0.6)'; ctx.lineWidth = Math.max(0.4, 0.6 * s); ctx.beginPath(); for (var q = -3; q <= 3; q++) { ctx.moveTo(bx3 + q * br * 0.28, by3); ctx.lineTo(bx3 + q * br * 0.21, by3 + br * 0.7); } ctx.stroke();
          var fr = rng(40 + n); for (var q2 = 0; q2 < 14; q2++) { var a = fr() * PI, d = fr() * br * 0.85; ctx.fillStyle = fr() < 0.5 ? bk[1][0] : bk[1][1]; ctx.beginPath(); ctx.arc(bx3 + Math.cos(a) * d, by3 - Math.sin(a) * d * 0.45, br * 0.17, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(bx3 + Math.cos(a) * d - br * 0.05, by3 - Math.sin(a) * d * 0.45 - br * 0.05, br * 0.05, 0, TAU); ctx.fill(); } });
        finish(ctx, w, h, '#ffe8b0', 0.14, 0.2, 0.045);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = fmLayout(w, h), s = L.s, D = FM[w + 'x' + h], i;
        // two boats drifting along the canal (one each way)
        [[1, 5.2, 0, 1, 15], [0, 7.5, 0.5, -1, 16]].forEach(function (bt) {
          var zz = bt[1], bw = 60 * s / zz * 3.6, bh = 22 * s / zz * 3.6, span = L.W / zz * 2.6, ph = ((t * 0.018 + bt[2]) % 1), bx = L.vx + (bt[3] > 0 ? (ph - 0.5) : (0.5 - ph)) * span, by = L.vy + L.G / zz + Math.sin(t * 1.2 + zz) * 0.5 * s;
          var spr = sprite('fmboat' + bt[0] + '_' + bt[4], 60 * s, 22 * s, function (c, ww, hh) { vendorBoat(c, ww, hh, bt[0], bt[4]); });
          ctx.save(); ctx.globalAlpha = 0.25; ctx.translate(bx, by); ctx.scale(bt[3], -0.5); ctx.drawImage(spr, -bw / 2, -bh, bw, bh); ctx.restore();
          ctx.save(); ctx.translate(bx, by); ctx.scale(bt[3], 1); ctx.drawImage(spr, -bw / 2, -bh, bw, bh); ctx.restore();
          ctx.strokeStyle = 'rgba(255,250,230,0.35)'; ctx.lineWidth = Math.max(0.5, 0.8 * s); ctx.beginPath(); ctx.moveTo(bx - bt[3] * bw * 0.55, by + 1); ctx.lineTo(bx - bt[3] * bw * 0.85, by + 2); ctx.stroke();
          if (bt[0] === 1) { for (i = 0; i < 5; i++) { var f = (t * 0.4 + i / 5) % 1; soft(ctx, bx + bt[3] * bw * 0.12 + Math.sin(t + i) * 3 * s, by - bh * 0.55 - f * 30 * s / zz * 3.6, (3 + f * 8) * s / zz * 3.6, (3 + f * 8) * s / zz * 3.6, '#ffffff', 0.3 * Math.sin(PI * f)); } }
        });
        // steam from the painted noodle boat
        if (D) D.steam.forEach(function (st) { for (i = 0; i < 6; i++) { var f = (t * 0.35 + i / 6) % 1; soft(ctx, st[0] + Math.sin(t * 1.3 + i) * 4 * s * st[2], st[1] - f * 26 * s * st[2], (3 + f * 9) * s * st[2], (3 + f * 9) * s * st[2], '#ffffff', 0.3 * Math.sin(PI * f)); } });
        // ripples spreading on the canal
        ctx.strokeStyle = 'rgba(255,255,240,0.25)'; ctx.lineWidth = Math.max(0.5, 0.7 * s);
        for (i = 0; i < 5; i++) { var f2 = (t * 0.25 + i / 5) % 1, rx = w * (0.3 + h1(i, 4) * 0.4), ry = L.vy + h * (0.06 + h1(i, 5) * 0.18); ctx.globalAlpha = 1 - f2; ctx.beginPath(); ctx.ellipse(rx, ry, (2 + f2 * 14) * s, (0.6 + f2 * 3) * s, 0, 0, TAU); ctx.stroke(); }
        ctx.globalAlpha = 1;
        // a dragonfly darting over the jetty
        var dx = w * (0.5 + 0.3 * Math.sin(t * 0.37)), dy = h * (0.5 + 0.06 * Math.sin(t * 0.9)) + Math.sin(t * 7) * 2 * s;
        ctx.strokeStyle = 'rgba(40,90,140,0.9)'; ctx.lineWidth = Math.max(0.8, 1.2 * s); ctx.beginPath(); ctx.moveTo(dx - 5 * s, dy); ctx.lineTo(dx + 4 * s, dy); ctx.stroke();
        ctx.fillStyle = 'rgba(220,240,255,0.55)'; var fl = Math.sin(t * 40) * 0.5 + 0.5; ctx.beginPath(); ctx.ellipse(dx, dy - 2 * s * fl, 4 * s, 1.2 * s, -0.3, 0, TAU); ctx.ellipse(dx, dy + 2 * s * fl, 4 * s, 1.2 * s, 0.3, 0, TAU); ctx.fill();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= THAILAND · PHI PHI ISLAND (midday lagoon) ======================= */
  /* a limestone karst: sheer streaked walls, a jungle cap, an undercut notch at the waterline. far = 0 (near) .. 1 (hazy) */
  function karst(ctx, x0, x1, base, top, seed, far, s, k, light) {
    var r = rng(seed), W = x1 - x0, i, x;
    // a cluster of rounded towers: each dome has a centre, half-width and height (fractions of the karst)
    var domes = [], nd = 2 + ((r() * 3) | 0);
    for (i = 0; i < nd; i++) domes.push([0.2 + 0.6 * (i + r() * 0.6) / nd, 0.18 + r() * 0.2, i === 0 || r() < 0.4 ? 0.85 + r() * 0.15 : 0.5 + r() * 0.35]);
    domes.push([0.5, 0.48, 0.35]);
    function prof(x) { var u = (x - x0) / W, best = 0; for (var q = 0; q < domes.length; q++) { var d = (u - domes[q][0]) / domes[q][1]; if (Math.abs(d) < 1) best = Math.max(best, domes[q][2] * Math.pow(1 - d * d, 0.22)); }
      best *= 1 - 0.06 * fbm(u * 9, seed + 7, 3); return lerp(base, top, best) + (best > 0 ? (base - top) * 0.025 * (fbm(u * 18, seed, 3) - 0.5) : 0); }
    var pts = []; for (x = x0; x <= x1; x += Math.max(0.8, W / 160)) pts.push([x, Math.min(base, prof(x))]); pts.push([x1, base]);
    function path() { ctx.beginPath(); ctx.moveTo(x0, base); for (var q = 0; q < pts.length; q++) ctx.lineTo(pts[q][0], pts[q][1]); ctx.closePath(); }
    var c1 = mixh('#d8cfc0', '#9ab4c4', far), c2 = mixh('#a89a88', '#86a0b4', far), c3 = mixh('#6a6258', '#7a94aa', far);
    path(); ctx.fillStyle = lg(ctx, x0, 0, x1, 0, light > 0 ? [[0, c1], [0.5, c2], [1, c3]] : [[0, c3], [0.5, c2], [1, c1]]); ctx.fill();
    ctx.save(); path(); ctx.clip();
    // drip streaks: grey, black and rusty orange
    var n = Math.round(W / s * 1.4 * Math.sqrt(k));
    batch(ctx, n, [[mixh('#3a3632', '#7a94aa', far), Math.max(0.5, 0.9 * s), 0.22], [mixh('#c8743a', '#9ab4c4', far), Math.max(0.5, 1.1 * s), 0.2], [mixh('#f4ede0', '#b8ccd8', far), Math.max(0.5, 0.8 * s), 0.22]], function () {
      var xx = x0 + r() * W, yt = prof(xx) + r() * (base - prof(xx)) * 0.5, l = (base - yt) * (0.2 + r() * 0.7); return [xx, yt, xx + (r() - 0.5) * 2 * s, yt + l, (r() * 3) | 0]; });
    // ledges catching light
    for (i = 0; i < Math.round(W / (14 * s)); i++) { var sx = x0 + r() * W, sy = lerp(prof(sx), base, 0.15 + r() * 0.6); soft(ctx, sx, sy, (2 + r() * 5) * s, (base - top) * (0.08 + r() * 0.15), r() < 0.6 ? mixh('#3a3430', '#6a8498', far) : mixh('#c86a2a', '#9ab4c4', far), 0.22); }
    batch(ctx, Math.round(n * 0.1), [[mixh('#f8f2e6', '#c8d8e0', far), Math.max(0.5, 0.7 * s), 0.25]], function () { var xx = x0 + r() * W, yy = lerp(prof(xx), base, r()), l = (2 + r() * 4) * s; return [xx, yy, xx + l, yy + l * 0.35, 0]; });
    // round the towers: darker toward the shaded side and the water
    ctx.fillStyle = lg(ctx, 0, top, 0, base, [[0, 'rgba(255,255,255,0.08)'], [0.7, 'rgba(0,0,0,0)'], [1, rgba(mixh('#0a3a4a', '#5a7488', far), 0.35)]]); ctx.fillRect(x0, top, W, base - top);
    // the undercut notch at the waterline
    ctx.fillStyle = lg(ctx, 0, base - (base - top) * 0.06, 0, base, [[0, rgba(mixh('#2a2620', '#5a7488', far), 0)], [1, rgba(mixh('#2a2620', '#5a7488', far), 0.75)]]); ctx.fillRect(x0, base - (base - top) * 0.06, W, (base - top) * 0.06 + 1);
    // jungle cap and plants clinging to the walls
    var g1 = mixh('#2e5a2a', '#7a9aa8', far), g2 = mixh('#4a7a32', '#8aaab4', far), g3 = mixh('#7aa840', '#a8c0c4', far), g4 = mixh('#1e3a20', '#6a8a9a', far);
    dots(ctx, Math.round(W / s * 6 * Math.sqrt(k)), [[g4, 0.95], [g1, 0.95], [g2, 0.9], [g3, 0.85]], function () { var xx = x0 + r() * W, py = prof(xx), d = Math.pow(r(), 2.2) * (base - top) * 0.22, rr = (1.2 + r() * 2.6) * s * (1 - far * 0.5); return [xx, py + d, rr, d < (base - top) * 0.02 ? (r() < 0.5 ? 2 : 3) : (r() * 3) | 0]; });
    for (i = 0; i < Math.round(W / (40 * s)); i++) { var vx = x0 + r() * W, vy = lerp(prof(vx), base, 0.2 + r() * 0.5); dots(ctx, 18, [[g1, 0.9], [g2, 0.9]], function () { return [vx + (r() - 0.5) * 10 * s, vy + (r() - 0.3) * 8 * s, (0.8 + r() * 1.4) * s, r() < 0.5 ? 0 : 1]; }); }
    ctx.restore();
    return prof;
  }
  function ppLayout(w, h) { return { hz: h * 0.43, shore: h * 0.635, s: scl(w, h), k: dens(w, h) }; }
  SC.phiphi = {
    paint: function (ctx, w, h) {
      try {
        var L = ppLayout(w, h), hz = L.hz, s = L.s, k = L.k, r = rng(3131), i, x, y;
        /* bright tropical sky with towering clouds */
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, [[0, '#1f6fc8'], [0.45, '#4a9ae0'], [0.85, '#9ad0f0'], [1, '#d4eef8']]); ctx.fillRect(0, 0, w, hz + 2);
        glow(ctx, w * 0.5, -h * 0.05, Math.max(w, h) * 0.7, '#ffffff', 0.25);
        for (i = 0; i < 5; i++) { var cx = w * (0.1 + i * 0.22 + (r() - 0.5) * 0.1), cy = h * (0.12 + r() * 0.12), cs = w * (0.06 + r() * 0.06);
          for (var j = 0; j < 14; j++) { var a = r() * PI, d = r(); soft(ctx, cx + Math.cos(a) * cs * 1.4 * d, cy - Math.sin(a) * cs * 0.9 * d, cs * (0.4 + r() * 0.3), cs * (0.35 + r() * 0.25), '#ffffff', 0.7); }
          soft(ctx, cx, cy + cs * 0.2, cs * 1.6, cs * 0.35, '#b8cce0', 0.35); }
        /* the open sea and far islands */
        ctx.fillStyle = lg(ctx, 0, hz, 0, L.shore, [[0, '#1a6aa8'], [0.25, '#1a88b8'], [0.55, '#1ab0c4'], [0.8, '#4ad4d0'], [1, '#9ae8e0']]); ctx.fillRect(0, hz, w, L.shore - hz + 2);
        karst(ctx, w * 0.36, w * 0.5, hz + 0.5, hz - h * 0.08, 71, 0.85, s, k, 1);
        karst(ctx, w * 0.47, w * 0.58, hz + 0.5, hz - h * 0.05, 72, 0.9, s, k, 1);
        karst(ctx, w * 0.56, w * 0.7, hz + 0.5, hz - h * 0.11, 73, 0.8, s, k, 1);
        haze(ctx, w * 0.25, hz - h * 0.08, w * 0.8, hz + h * 0.02, '#d4eef8', 0.35);
        /* the two great karsts framing the bay */
        var pl = karst(ctx, -w * 0.12, w * 0.37, hz + h * 0.09, h * 0.05, 74, 0.08, s, k, 1);
        var pr = karst(ctx, w * 0.66, w * 1.12, hz + h * 0.07, h * 0.1, 75, 0.15, s, k, -1);
        /* the lagoon: deep blue to turquoise to glassy shallows */
        // reflections of the karsts
        ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = '#0a4a5a';
        ctx.beginPath(); ctx.moveTo(-w * 0.12, hz + h * 0.09); for (x = -w * 0.12; x <= w * 0.37; x += 3) ctx.lineTo(x, (hz + h * 0.09) + ((hz + h * 0.09) - pl(x)) * 0.35); ctx.lineTo(w * 0.37, hz + h * 0.09); ctx.fill();
        ctx.beginPath(); ctx.moveTo(w * 0.66, hz + h * 0.07); for (x = w * 0.66; x <= w * 1.12; x += 3) ctx.lineTo(x, (hz + h * 0.07) + ((hz + h * 0.07) - pr(x)) * 0.35); ctx.lineTo(w * 1.12, hz + h * 0.07); ctx.fill();
        ctx.restore();
        // coral and sand patches under the clear water
        for (i = 0; i < 12; i++) { var px = r() * w, py = lerp(hz + h * 0.1, L.shore, Math.pow(r(), 0.7)), pw = w * (0.04 + r() * 0.08) * (py / h); soft(ctx, px, py, pw, pw * 0.2, r() < 0.5 ? '#0a6a7a' : '#7ae0d8', 0.35); }
        batch(ctx, Math.round(1600 * k), [['#ffffff', 0.7 * s, 0.4], ['#0a5a8a', 0.8 * s, 0.25], ['#b8f4ee', 0.6 * s, 0.35]], function () { var p = Math.pow(r(), 0.8), yy = hz + 1 * s + p * (L.shore - hz), xx = r() * w, l = (1.5 + p * 9) * s; return [xx, yy, xx + l, yy, r() < 0.25 ? 0 : r() < 0.5 ? 1 : 2]; });
        /* the beach */
        function shore(x) { return L.shore + h * 0.012 * Math.sin(x / w * 5 + 0.6) + h * 0.006 * Math.sin(x / w * 13); }
        ridge(ctx, -2, w + 2, 2, function (x) { return shore(x) - h * 0.012; }, h + 2, 'rgba(160,240,232,0.55)');
        ridge(ctx, -2, w + 2, 2, shore, h + 2, lg(ctx, 0, L.shore, 0, h, [[0, '#d8c8a0'], [0.06, '#efe2c4'], [0.3, '#f8f0dc'], [1, '#e8d8b4']]));
        ctx.save(); ridge(ctx, -2, w + 2, 2, shore, h + 2, null); ctx.clip();
        band(ctx, 0, w, L.shore - h * 0.01, L.shore + h * 0.05, '#a08a64', 0.45, 0);
        // ripple marks and grain in the sand
        batch(ctx, Math.round(500 * k), [['#d8c8a4', 0.8 * s, 0.5], ['#fffaf0', 0.7 * s, 0.6]], function () { var yy = lerp(L.shore + h * 0.03, h, r()), xx = r() * w, l = (3 + (yy - L.shore) / h * 30) * s; return [xx, yy, xx + l, yy + (r() - 0.5) * 1 * s, r() < 0.5 ? 0 : 1, xx + l / 2, yy - 1 * s]; });
        dots(ctx, Math.round(1500 * k), [['#b8a888', 0.35], ['#ffffff', 0.5]], function () { return [r() * w, lerp(L.shore, h, r()), (0.3 + r() * 0.5) * s, r() < 0.5 ? 0 : 1]; });
        // shells and a starfish
        [[0.18, 0.86, '#ffe8d8'], [0.72, 0.8, '#f8d8c0'], [0.84, 0.93, '#fff0e0']].forEach(function (sh) { var sx = w * sh[0], sy = h * sh[1], sr = 3.4 * s; ctx.fillStyle = sh[2]; ctx.beginPath(); ctx.moveTo(sx - sr, sy); ctx.quadraticCurveTo(sx, sy - sr * 1.6, sx + sr, sy); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(160,110,80,0.5)'; ctx.lineWidth = Math.max(0.4, 0.5 * s); ctx.beginPath(); for (var q = -2; q <= 2; q++) { ctx.moveTo(sx, sy - sr * 0.1); ctx.lineTo(sx + q * sr * 0.4, sy - sr * 0.75 + Math.abs(q) * sr * 0.2); } ctx.stroke(); });
        var stx = w * 0.32, sty = h * 0.94, str = 6 * s; ctx.fillStyle = '#f07a3a'; ctx.beginPath(); for (i = 0; i < 10; i++) { var aa = -PI / 2 + i * PI / 5, rr2 = i % 2 ? str * 0.42 : str; ctx.lineTo(stx + Math.cos(aa) * rr2, sty + Math.sin(aa) * rr2 * 0.55); } ctx.closePath(); ctx.fill(); dots(ctx, 8, [['#ffd0a0', 0.9]], function (n) { var aa = -PI / 2 + n * TAU / 5; return [stx + Math.cos(aa) * str * 0.5, sty + Math.sin(aa) * str * 0.27, 0.6 * s, 0]; });
        ctx.restore();
        /* palms leaning over the sand, framing the bay */
        palm(ctx, w * 1.06, h * 1.02, h * 0.7, -0.24, { trunk: '#a8865a', trunkD: '#6a5034', frond: '#3e8a3a', frondD: '#2a5a2a', nut: '#7a6a2a', lit: '#d8f08a' }, 501, 0);
        // beach shrubs and a pandan on the left edge
        dots(ctx, Math.round(160 * Math.sqrt(k)), [['#2a5a2a', 0.95], ['#4a8a3a', 0.95], ['#7ab84a', 0.9]], function () { var a2 = r() * PI, d2 = Math.sqrt(r()); return [Math.cos(a2) * d2 * w * 0.13 - w * 0.02, h * 0.74 - Math.sin(a2) * d2 * h * 0.12, (1.4 + r() * 2.6) * s, (r() * 3) | 0]; });
        ctx.strokeStyle = '#3a7a3a'; ctx.lineWidth = Math.max(0.8, 1.6 * s); ctx.lineCap = 'round'; for (i = 0; i < 12; i++) { var aa2 = -PI * (0.15 + i / 11 * 0.7), ll = h * (0.08 + r() * 0.06); ctx.beginPath(); ctx.moveTo(w * 0.05, h * 0.76); ctx.quadraticCurveTo(w * 0.05 + Math.cos(aa2) * ll * 0.7, h * 0.76 + Math.sin(aa2) * ll * 0.9, w * 0.05 + Math.cos(aa2) * ll, h * 0.76 + Math.sin(aa2) * ll * 0.6 + ll * 0.25); ctx.stroke(); }
        // the palms' shadows on the sand
        ctx.fillStyle = 'rgba(120,100,70,0.18)'; ctx.beginPath(); ctx.ellipse(w * 0.74, h * 0.9, w * 0.14, h * 0.018, -0.12, 0, TAU); ctx.fill();
        finish(ctx, w, h, '#b8f0ff', 0.12, 0.16, 0.035);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = ppLayout(w, h), hz = L.hz, s = L.s, i;
        // sparkle on the lagoon
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 46; i++) { var kk = Math.sin(t * 2.6 + h1(i, 31) * TAU); if (kk < 0.55) continue; var yy = hz + h * 0.01 + h1(i, 33) * (L.shore - hz - h * 0.02), xx = w * (0.3 + h1(i, 35) * 0.45), rr = (kk - 0.55) * 7 * s * (0.5 + (yy - hz) / (L.shore - hz));
          ctx.fillStyle = 'rgba(255,255,255,' + ((kk - 0.55) * 1.6).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(xx - rr, yy); ctx.lineTo(xx, yy - rr * 0.25); ctx.lineTo(xx + rr, yy); ctx.lineTo(xx, yy + rr * 0.25); ctx.closePath(); ctx.fill(); }
        ctx.restore();
        // gentle waves washing up the sand and sliding back
        for (i = 0; i < 3; i++) {
          var ph = (t * 0.12 + i / 3) % 1, reach = Math.sin(ph * PI), yb = L.shore + h * 0.012 + reach * h * 0.035 - i * h * 0.004;
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.75 * Math.sin(ph * PI)).toFixed(3) + ')'; ctx.lineWidth = Math.max(0.8, (1.6 - i * 0.3) * s); ctx.beginPath();
          for (var x = -4; x <= w + 4; x += 4) { var y2 = yb + h * 0.012 * Math.sin(x / w * 5 + 0.6) + h * 0.006 * Math.sin(x / w * 13) + Math.sin(x * 0.08 + t + i) * 1.2 * s; if (x < 0) ctx.moveTo(x, y2); else ctx.lineTo(x, y2); }
          ctx.stroke();
          ctx.fillStyle = 'rgba(190,250,240,' + (0.22 * reach).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(-4, L.shore - h * 0.005);
          for (x = -4; x <= w + 4; x += 6) ctx.lineTo(x, yb + h * 0.012 * Math.sin(x / w * 5 + 0.6) + h * 0.006 * Math.sin(x / w * 13)); ctx.lineTo(w + 4, L.shore - h * 0.005); ctx.closePath(); ctx.fill();
        }
        // long-tail boats: one moored at the beach (bobbing), one puttering across the bay
        var lw = 66 * s, lh = 18 * s, spr = sprite('pplongtail', lw, lh, drawLongtail);
        var bob = Math.sin(t * 1.4) * 1 * s, rot = Math.sin(t * 1.1) * 0.015;
        ctx.save(); ctx.translate(w * 0.36, L.shore + h * 0.004 + bob); ctx.rotate(rot); ctx.globalAlpha = 0.2; ctx.scale(1, -0.45); ctx.drawImage(spr, -lw / 2, -lh, lw, lh); ctx.restore();
        ctx.save(); ctx.translate(w * 0.36, L.shore + h * 0.004 + bob); ctx.rotate(rot); ctx.drawImage(spr, -lw / 2, -lh, lw, lh); ctx.restore();
        ctx.strokeStyle = 'rgba(80,60,40,0.7)'; ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.beginPath(); ctx.moveTo(w * 0.36 + lw * 0.46, L.shore - lh * 0.4 + bob); ctx.quadraticCurveTo(w * 0.36 + lw * 0.7, L.shore + h * 0.03, w * 0.36 + lw * 0.8, L.shore + h * 0.06); ctx.stroke();
        var fx = w + 40 * s - ((t * 6 * s) % (w + 80 * s)), fy = hz + (L.shore - hz) * 0.42;
        drawBoat(ctx, spr, fx, fy, lw * 0.5, lh * 0.5, s * 0.5, t, -1);
        // terns over the water
        for (i = 0; i < 3; i++) { var a2 = t * (0.3 + i * 0.07) + i * 2, bx = w * (0.35 + i * 0.15) + Math.cos(a2) * w * 0.1, by = h * (0.3 + i * 0.03) + Math.sin(a2 * 1.3) * h * 0.03; bird(ctx, bx, by, (3.5 + i * 0.6) * s, t * 6 + i, 'rgba(250,250,250,0.95)'); }
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= SINGAPORE · MARINA BAY (night garden) ======================= */
  /* Original "light trees": a slender lattice stem opening into a crown of glowing lotus petals with strands of lights
     hanging from the petal tips. paint() draws the dark structure; the overlay lights it up in slowly changing colours. */
  function lightTreeGeom(x, base, top, R, n) {
    var cy = top + R * 0.55, pts = [];
    for (var i = 0; i < n; i++) { var a = -PI + (i + 0.5) / n * PI, front = Math.abs(i - (n - 1) / 2) < n * 0.3;
      pts.push({ tx: x + Math.cos(a) * R, ty: cy + Math.sin(a) * R * 0.62, a: a, front: front }); }
    return { x: x, base: base, top: top, R: R, cy: cy, neck: cy + R * 0.22, petals: pts };
  }
  function lightTreePaint(ctx, g, s) {
    var x = g.x, i;
    // the stem: two tapered rails and a criss-cross lattice
    var w0 = g.R * 0.24, w1 = g.R * 0.06;
    ctx.fillStyle = lg(ctx, x - w0, 0, x + w0, 0, [[0, '#1a1428'], [0.5, '#2e2444'], [1, '#120e1e']]);
    ctx.beginPath(); ctx.moveTo(x - w0, g.base); ctx.quadraticCurveTo(x - w1 * 1.1, lerp(g.base, g.neck, 0.25), x - w1, g.neck); ctx.lineTo(x + w1, g.neck); ctx.quadraticCurveTo(x + w1 * 1.1, lerp(g.base, g.neck, 0.25), x + w0, g.base); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(120,100,170,0.45)'; ctx.lineWidth = Math.max(0.4, 0.5 * s); ctx.beginPath();
    function hw(f) { var m = 1 - f, qx = m * m * w0 + 2 * m * f * w1 * 1.1 + f * f * w1; return qx; }
    var n = 18; for (i = 0; i < n; i++) { var f = i / n, f2 = (i + 1) / n, ya = lerp(g.base, g.neck, f), yb = lerp(g.base, g.neck, f2), wa = hw(Math.pow(f, 0.6)), wb = hw(Math.pow(f2, 0.6)); ctx.moveTo(x - wa, ya); ctx.lineTo(x + wb, yb); ctx.moveTo(x + wa, ya); ctx.lineTo(x - wb, yb); }
    ctx.stroke();
    // petals (dark, the overlay rims them with light)
    g.petals.forEach(function (p) { ctx.fillStyle = p.front ? 'rgba(40,30,70,0.85)' : 'rgba(26,20,48,0.85)'; petalPath(ctx, x, g.neck, p, g.R); ctx.fill(); });
  }
  function petalPath(ctx, x, ny, p, R) {
    var mx = (x + p.tx) / 2, my = (ny + p.ty) / 2, dx = p.tx - x, dy = p.ty - ny, L = Math.hypot(dx, dy) || 1, nx = -dy / L, nyv = dx / L, wd = R * 0.16;
    ctx.beginPath(); ctx.moveTo(x, ny); ctx.quadraticCurveTo(mx + nx * wd, my + nyv * wd, p.tx, p.ty); ctx.quadraticCurveTo(mx - nx * wd, my - nyv * wd, x, ny); ctx.closePath();
  }
  function lightTreeGlow(ctx, g, s, t, hue) {
    var col = 'hsl(' + (hue % 360).toFixed(0) + ',95%,68%)', col2 = 'hsl(' + ((hue + 50) % 360).toFixed(0) + ',95%,72%)', i;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // a soft halo around the crown
    ctx.fillStyle = rg(ctx, g.x, g.cy, 0, g.R * 1.4, [[0, 'hsla(' + (hue % 360).toFixed(0) + ',90%,60%,0.32)'], [1, 'hsla(' + (hue % 360).toFixed(0) + ',90%,60%,0)']]); ctx.fillRect(g.x - g.R * 1.4, g.cy - g.R * 1.4, g.R * 2.8, g.R * 2.8);
    // petal rims
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.6, 0.9 * s); ctx.globalAlpha = 0.85;
    g.petals.forEach(function (p) { petalPath(ctx, g.x, g.neck, p, g.R); ctx.stroke(); });
    // strands of lights hanging from the petal tips, swaying a little
    ctx.strokeStyle = col2; ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.globalAlpha = 0.55; ctx.beginPath();
    g.petals.forEach(function (p, j) { var sw = Math.sin(t * 0.8 + j) * g.R * 0.04, L = g.R * (0.5 + 0.35 * Math.sin(j * 1.7) * Math.sin(j * 1.7)); ctx.moveTo(p.tx, p.ty); ctx.quadraticCurveTo(p.tx + sw, p.ty + L * 0.6, p.tx + sw * 2, p.ty + L); });
    ctx.stroke();
    // twinkling bulbs along the strands and up the stem
    ctx.fillStyle = '#ffffff';
    for (i = 0; i < g.petals.length; i++) { var p = g.petals[i]; for (var k2 = 1; k2 <= 3; k2++) { var tw = Math.sin(t * 3 + i * 1.3 + k2 * 2.1); if (tw < 0.2) continue; ctx.globalAlpha = tw * 0.9; ctx.beginPath(); ctx.arc(p.tx + Math.sin(t * 0.8 + i) * g.R * 0.04 * k2 / 1.5, p.ty + g.R * 0.22 * k2, Math.max(0.5, 0.9 * s), 0, TAU); ctx.fill(); } }
    ctx.strokeStyle = col; ctx.globalAlpha = 0.5; ctx.lineWidth = Math.max(0.5, 0.7 * s); ctx.beginPath();
    for (i = -1; i <= 1; i++) { ctx.moveTo(g.x + i * g.R * 0.14, g.base); ctx.quadraticCurveTo(g.x + i * g.R * 0.05, lerp(g.base, g.neck, 0.3), g.x + i * g.R * 0.03, g.neck); }
    ctx.stroke();
    ctx.restore();
  }
  function mbLayout(w, h) { return { hz: h * 0.43, edge: h * 0.575, s: scl(w, h), k: dens(w, h) }; }
  function mbTrees(w, h) { var L = mbLayout(w, h); return [
    lightTreeGeom(w * 0.97, h * 0.6, h * 0.2, w * 0.1, 11), lightTreeGeom(w * 0.27, h * 0.6, h * 0.17, w * 0.11, 12),
    lightTreeGeom(w * 0.83, h * 0.64, h * 0.11, w * 0.13, 12), lightTreeGeom(w * 0.08, h * 0.68, h * 0.06, w * 0.15, 13)]; }
  var MB = {};
  SC.marinabay = {
    paint: function (ctx, w, h) {
      try {
        var L = mbLayout(w, h), hz = L.hz, s = L.s, k = L.k, r = rng(6565), i, j, x, y;
        var D = MB[w + 'x' + h] = { cols: [] };
        /* night sky */
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, [[0, '#070a24'], [0.5, '#15184a'], [0.85, '#3a2a6a'], [1, '#6a3a7a']]); ctx.fillRect(0, 0, w, hz + 2);
        dots(ctx, Math.round(110 * k), [['#ffffff', 0.85], ['#c8d8ff', 0.6]], function () { return [r() * w, Math.pow(r(), 1.4) * hz * 0.7, (0.3 + r() * 0.55) * s, r() < 0.7 ? 0 : 1]; });
        // the moon
        var mx = w * 0.62, my = h * 0.1, mr = 7 * s; glow(ctx, mx, my, mr * 7, '#dfe4ff', 0.35); ctx.fillStyle = rg(ctx, mx - mr * 0.3, my - mr * 0.3, 0, mr, [[0, '#ffffff'], [1, '#d8dcf0']]); ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(160,170,200,0.35)'; ctx.beginPath(); ctx.arc(mx + mr * 0.3, my - mr * 0.1, mr * 0.22, 0, TAU); ctx.arc(mx - mr * 0.25, my + mr * 0.35, mr * 0.15, 0, TAU); ctx.fill();
        for (i = 0; i < 6; i++) { var cy = h * (0.08 + r() * 0.22), cx = r() * w, cw = w * (0.15 + r() * 0.3); haze(ctx, cx - cw, cy - h * 0.012, cx + cw, cy + h * 0.012, '#4a3a7a', 0.45); haze(ctx, cx - cw * 0.8, cy + h * 0.004, cx + cw * 0.8, cy + h * 0.016, '#a86aa8', 0.22); }
        /* the skyline across the bay */
        var B = [];
        for (x = -4; x < w + 4;) { var u = x / w, bw = (5 + r() * 10) * s, bh = h * (0.03 + r() * 0.06 + 0.1 * Math.exp(-Math.pow((u - 0.52) / 0.18, 2))); B.push({ x: x, w: bw, h: bh, c: r() }); x += bw * (0.7 + r() * 0.35); }
        [[0.44, 0.19, 12, 'slope'], [0.56, 0.16, 10, 'cyl'], [0.62, 0.22, 11, 'step'], [0.36, 0.25, 9, 'flat']].forEach(function (tq) { B.push({ x: w * tq[0], w: tq[2] * s, h: hz - h * tq[1], c: 0.5, tall: tq[3] }); });
        B.sort(function (a, b) { return (a.tall ? 1 : 0) - (b.tall ? 1 : 0) || a.h - b.h; });
        var win = [];
        B.forEach(function (b) {
          var top = hz - b.h;
          ctx.fillStyle = lg(ctx, 0, top, 0, hz, [[0, b.tall ? '#3a4a7a' : mixh('#2a3260', '#3a3a6a', b.c)], [1, '#121838']]);
          if (b.tall === 'slope') { ctx.beginPath(); ctx.moveTo(b.x, hz); ctx.lineTo(b.x, top + b.w * 0.7); ctx.lineTo(b.x + b.w, top); ctx.lineTo(b.x + b.w, hz); ctx.fill(); }
          else if (b.tall === 'cyl') { ctx.fillRect(b.x, top + 2 * s, b.w, b.h); ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, top + 2 * s, b.w / 2, 1.6 * s, 0, 0, TAU); ctx.fill(); }
          else if (b.tall === 'step') { ctx.fillRect(b.x, top + 8 * s, b.w, b.h); ctx.fillRect(b.x + b.w * 0.15, top + 4 * s, b.w * 0.7, 5 * s); ctx.fillRect(b.x + b.w * 0.3, top, b.w * 0.4, 5 * s); }
          else ctx.fillRect(b.x, top, b.w, b.h + 1);
          ctx.fillStyle = 'rgba(140,180,255,0.12)'; ctx.fillRect(b.x, top, b.w * 0.25, b.h);
          var lit = b.tall ? 0.7 : 0.35 + b.c * 0.3, lc = b.c < 0.5 ? 0 : b.c < 0.8 ? 1 : 2;
          for (y = top + 2 * s; y < hz - 1.5 * s; y += 2.2 * s) { if (b.c > 0.5 || b.tall) { if (r() < lit) win.push([b.x + 0.8 * s, y, b.w - 1.6 * s, 0.75 * s, lc]); } else for (x = b.x + 0.8 * s; x < b.x + b.w - 1 * s; x += 1.8 * s) if (r() < lit) win.push([x, y, 0.9 * s, 0.8 * s, lc]); }
          if (b.tall) { glow(ctx, b.x + b.w / 2, top, b.w * 1.5, ['#7affd8', '#ff8ad8', '#8ab8ff', '#ffe08a'][(b.x | 0) % 4], 0.4); }
          D.cols.push([b.x + b.w / 2, b.w, b.h, ['#cfe4ff', '#ffe2a0', '#9affe8'][lc]]);
        });
        rects(ctx, win, [['#cfe4ff', 0.8], ['#ffe2a0', 0.8], ['#9affe8', 0.7]]);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; band(ctx, 0, w, hz - h * 0.06, hz + 1, '#8a6aff', 0, 0.2); ctx.restore();
        ctx.fillStyle = '#0c1028'; ctx.fillRect(0, hz - 1 * s, w, 2 * s);
        dots(ctx, Math.round(80 * k), [['#fff2c8', 0.95]], function (n) { return [n / (80 * k) * w, hz - 0.2 * s, (0.3 + r() * 0.3) * s, 0]; });
        /* the observation wheel (it turns in the overlay); its stand is painted here */
        var wx = w * 0.6, wy = h * 0.29, wr = h * 0.115;
        ctx.strokeStyle = '#2a2a50'; ctx.lineWidth = Math.max(1, 2 * s); ctx.beginPath(); ctx.moveTo(wx - wr * 0.5, hz); ctx.lineTo(wx, wy); ctx.lineTo(wx + wr * 0.5, hz); ctx.stroke();
        /* the bay */
        var wb = L.edge;
        ctx.fillStyle = lg(ctx, 0, hz, 0, wb, [[0, '#2a2458'], [0.3, '#161a44'], [1, '#0a0e28']]); ctx.fillRect(0, hz, w, wb - hz + 2);
        var C = [[], [], []], pal = ['#cfe4ff', '#ffe2a0', '#9affe8'];
        D.cols.forEach(function (c) { var ci = Math.max(0, pal.indexOf(c[3])), len = Math.min(c[2] * 1.2, wb - hz - 1 * s), n = Math.round(len / (1.5 * s) * 0.7 * Math.min(1.5, c[1] / (8 * s)));
          for (var q = 0; q < n; q++) { var d = Math.pow(r(), 1.2), yy = hz + 1.5 * s + d * len; if (r() < d * 0.7) continue; var xx = c[0] + Math.sin(yy * 0.8 + c[0]) * 1.2 * s + (r() - 0.5) * c[1] * 0.25, l = c[1] * (0.15 + r() * 0.4) * (1 - d * 0.4); C[ci].push([xx - l / 2, yy, xx + l / 2, yy]); } });
        ctx.save(); ctx.lineCap = 'round'; C.forEach(function (list, ci) { ctx.strokeStyle = pal[ci]; ctx.globalAlpha = 0.5; ctx.lineWidth = Math.max(0.5, 0.75 * s); ctx.beginPath(); list.forEach(function (q) { ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); }); ctx.stroke(); }); ctx.restore();
        haze(ctx, wx - wr * 1.2, hz, wx + wr * 1.2, wb, '#c87aff', 0.18);
        batch(ctx, Math.round(1000 * k), [['#6a6aa8', 0.6 * s, 0.25], ['#05081c', 0.9 * s, 0.4]], function () { var p = r(), yy = hz + p * (wb - hz), l = (2 + p * 10) * s, xx = r() * w; return [xx, yy, xx + l, yy, r() < 0.45 ? 0 : 1]; });
        /* the garden promenade */
        var fy = wb;
        ctx.fillStyle = lg(ctx, 0, fy, 0, h, [[0, '#2a2440'], [0.4, '#1e1a32'], [1, '#110e1e']]); ctx.fillRect(0, fy, w, h - fy);
        ctx.save(); ctx.beginPath(); ctx.rect(0, fy, w, h - fy); ctx.clip();
        var VPx = w * 0.5, VPy = hz;
        ctx.strokeStyle = 'rgba(160,140,220,0.07)'; ctx.lineWidth = Math.max(0.5, 0.7 * s); ctx.beginPath();
        for (i = -12; i <= 12; i++) { var bx = VPx + i * w * 0.12; ctx.moveTo(lerp(VPx, bx, (fy - VPy) / (h - VPy)), fy); ctx.lineTo(bx, h); }
        for (i = 1; i < 14; i++) { var z = 1 + i * 0.5, yy2 = VPy + (h * 1.3 - VPy) / z; if (yy2 > fy && yy2 < h) { ctx.moveTo(0, yy2); ctx.lineTo(w, yy2); } }
        ctx.stroke();
        band(ctx, 0, w, fy, fy + h * 0.12, '#6a4aa8', 0.35, 0);
        ctx.restore();
        // hedges and tropical leaves along the water's edge
        dots(ctx, Math.round(500 * k), [['#0e2a22', 0.95], ['#1a4a32', 0.9], ['#2a6a48', 0.8]], function () { var xx = r() * w; return [xx, fy - r() * h * 0.02, (1.5 + r() * 3) * s, (r() * 3) | 0]; });
        /* the light trees (dark structures; the overlay lights them) */
        D.trees = mbTrees(w, h);
        D.trees.forEach(function (g) { lightTreePaint(ctx, g, s); });
        // a curving skywalk between the two near trees
        var t3 = D.trees[3], t1 = D.trees[1];
        ctx.strokeStyle = '#2a2244'; ctx.lineWidth = Math.max(1, 2.4 * s); ctx.beginPath(); ctx.moveTo(t3.x, lerp(t3.base, t3.neck, 0.55)); ctx.quadraticCurveTo((t3.x + t1.x) / 2, lerp(t3.base, t3.neck, 0.7), t1.x, lerp(t1.base, t1.neck, 0.6)); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,230,180,0.6)'; ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.setLineDash([1.4 * s, 2 * s]); ctx.stroke(); ctx.setLineDash([]);
        // big leaves in the corners
        function leaf(cx, cy, len, ang, col) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -len * 0.28, len, 0); ctx.quadraticCurveTo(len * 0.5, len * 0.28, 0, 0); ctx.fill(); ctx.strokeStyle = 'rgba(120,200,160,0.35)'; ctx.lineWidth = Math.max(0.5, len * 0.015); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len * 0.95, 0); ctx.stroke(); ctx.restore(); }
        var lr = rng(91);
        for (i = 0; i < 9; i++) leaf(-w * 0.02, h * 1.02, h * (0.16 + lr() * 0.12), -PI * (0.12 + i * 0.05), i % 2 ? '#0e3a2a' : '#164a34');
        for (i = 0; i < 9; i++) leaf(w * 1.02, h * 1.02, h * (0.16 + lr() * 0.12), -PI * (0.88 - i * 0.05), i % 2 ? '#0e3a2a' : '#164a34');
        // little path lights
        for (i = 0; i < 6; i++) { var lx = w * (0.18 + i * 0.13), ly = h * (0.72 + (i % 2) * 0.04); glow(ctx, lx, ly, 14 * s, '#ffd8a0', 0.4); ctx.fillStyle = '#fff2d8'; ctx.fillRect(lx - 1 * s, ly - 3 * s, 2 * s, 3 * s); }
        finish(ctx, w, h, '#5a4aa0', 0.15, 0.3, 0.045);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = mbLayout(w, h), hz = L.hz, s = L.s, D = MB[w + 'x' + h], i;
        // the wheel turns slowly, its rim lights cycling
        var wx = w * 0.6, wy = h * 0.29, wr = h * 0.115, rot = t * 0.05, nc = 28;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.beginPath(); ctx.arc(wx, wy, wr, 0, TAU);
        for (i = 0; i < 14; i++) { var a = rot + i / 14 * TAU; ctx.moveTo(wx, wy); ctx.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr); } ctx.stroke();
        for (i = 0; i < nc; i++) { var a2 = rot + i / nc * TAU, hue = (t * 40 + i * (360 / nc)) % 360; ctx.fillStyle = 'hsla(' + hue.toFixed(0) + ',90%,70%,0.9)'; ctx.beginPath(); ctx.arc(wx + Math.cos(a2) * wr, wy + Math.sin(a2) * wr, Math.max(0.6, 1.1 * s), 0, TAU); ctx.fill(); }
        ctx.restore();
        ctx.fillStyle = '#2a2a50'; for (i = 0; i < 14; i++) { var a3 = rot + i / 14 * TAU; ctx.fillRect(wx + Math.cos(a3) * wr - 1.2 * s, wy + Math.sin(a3) * wr, 2.4 * s, 1.8 * s); }
        // fireworks over the bay every few seconds
        var P = 6.5, cyc = Math.floor(t / P), ft = t - cyc * P;
        if (ft < 3.2) {
          var fx = w * (0.32 + h1(cyc, 3) * 0.36), fyy = h * (0.08 + h1(cyc, 5) * 0.12), hue2 = (h1(cyc, 7) * 360) | 0;
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          if (ft < 0.7) { var up = ft / 0.7; ctx.strokeStyle = 'rgba(255,230,190,0.8)'; ctx.lineWidth = Math.max(0.6, 1 * s); ctx.beginPath(); ctx.moveTo(fx, lerp(hz, fyy, up) + 8 * s); ctx.lineTo(fx, lerp(hz, fyy, up)); ctx.stroke(); }
          else { var e = ft - 0.7, fade = Math.max(0, 1 - e / 2.5), R0 = Math.min(1, e * 1.6) * h * 0.09;
            glow(ctx, fx, fyy, R0 * 1.4, '#ffffff', 0.12 * fade);
            for (i = 0; i < 36; i++) { var a4 = i / 36 * TAU + cyc, rr = R0 * (0.85 + 0.15 * h1(i, cyc)), px = fx + Math.cos(a4) * rr, py = fyy + Math.sin(a4) * rr + e * e * 4 * s;
              ctx.fillStyle = 'hsla(' + ((hue2 + (i % 3) * 25) % 360) + ',95%,' + (65 + (i % 2) * 15) + '%,' + fade.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(px, py, Math.max(0.6, 1.2 * s * (0.6 + fade * 0.6)), 0, TAU); ctx.fill();
              ctx.strokeStyle = 'hsla(' + hue2 + ',90%,70%,' + (fade * 0.35).toFixed(3) + ')'; ctx.lineWidth = Math.max(0.4, 0.5 * s); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(fx + Math.cos(a4) * rr * 0.75, fyy + Math.sin(a4) * rr * 0.75 + e * e * 3 * s); ctx.stroke(); }
            // its glow on the water
            var gy2 = hz + (L.edge - hz) * 0.4, gr2 = w * 0.14; ctx.save(); ctx.translate(fx, gy2); ctx.scale(1, (L.edge - hz) * 0.4 / gr2); ctx.fillStyle = rg(ctx, 0, 0, 0, gr2, [[0, 'hsla(' + hue2 + ',90%,65%,' + (0.22 * fade).toFixed(3) + ')'], [1, 'hsla(' + hue2 + ',90%,65%,0)']]); ctx.fillRect(-gr2, -gr2, gr2 * 2, gr2 * 2); ctx.restore(); }
          ctx.restore();
        }
        // the light trees glow and shift colour
        if (D && D.trees) D.trees.forEach(function (g, n) { var hue = 280 + Math.sin(t * 0.15 + n * 1.3) * 80 + n * 40, pr = g.R * 1.6;
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(g.x, g.base); ctx.scale(1, 0.22); ctx.fillStyle = rg(ctx, 0, 0, 0, pr, [[0, 'hsla(' + (hue % 360).toFixed(0) + ',90%,60%,0.3)'], [1, 'hsla(' + (hue % 360).toFixed(0) + ',90%,60%,0)']]); ctx.fillRect(-pr, -pr, pr * 2, pr * 2); ctx.restore();
          lightTreeGlow(ctx, g, s, t, hue); });
        // fireflies drifting through the garden
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 14; i++) { var k3 = Math.sin(t * 2 + i * 2.7); if (k3 < 0) continue; var bx = w * h1(i, 41) + Math.sin(t * 0.3 + i) * w * 0.05, by = h * (0.6 + h1(i, 43) * 0.35) + Math.sin(t * 0.5 + i * 2) * h * 0.02;
          ctx.fillStyle = 'rgba(220,255,160,' + (0.8 * k3).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(bx, by, Math.max(0.6, 1 * s), 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(200,255,140,' + (0.15 * k3).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(bx, by, 4 * s, 0, TAU); ctx.fill(); }
        ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= SINGAPORE · HAWKER CENTRE (evening) ======================= */
  function hwLayout(w, h) { return { vx: w * 0.5, vy: h * 0.33, top: h * 0.165, sign: h * 0.235, counter: h * 0.405, floor: h * 0.475, s: scl(w, h), k: dens(w, h) }; }
  var HW = {};
  var STALLS = [['鸡饭', '#e8402a', 'chicken'], ['叻沙', '#e8902a', 'laksa'], ['炒面', '#c82a5a', 'wok'], ['沙爹', '#2a8a4a', 'satay'], ['饮料', '#2a6ac0', 'drinks']];
  SC.hawker = {
    paint: function (ctx, w, h) {
      try {
        var L = hwLayout(w, h), s = L.s, k = L.k, r = rng(2424), i, j, x, y;
        var D = HW[w + 'x' + h] = { flames: [], smoke: [], steam: [], fans: [], lanterns: [] };
        /* the evening outside, seen past the open ends */
        ctx.fillStyle = lg(ctx, 0, 0, 0, L.floor, [[0, '#2a2a5a'], [0.5, '#8a4a7a'], [0.8, '#f08a5a'], [1, '#ffc078']]); ctx.fillRect(0, 0, w, L.floor);
        [[-0.02, 0.12], [1.0, 0.12]].forEach(function (pp, n) { palm(ctx, w * pp[0] + (n ? -w * 0.02 : w * 0.03), L.floor, h * 0.36, n ? -0.15 : 0.15, { trunk: '#3a2a30', trunkD: '#2a1e24', frond: '#2a2030', frondD: '#1e1626' }, 700 + n); });
        /* the ceiling: beams running toward the back */
        var cx0 = w * 0.06, cx1 = w * 0.94;
        ctx.fillStyle = lg(ctx, 0, 0, 0, L.top, [[0, '#2a2026'], [1, '#4a3a34']]);
        ctx.beginPath(); ctx.moveTo(-w * 0.1, 0); ctx.lineTo(w * 1.1, 0); ctx.lineTo(cx1, L.top); ctx.lineTo(cx0, L.top); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(20,12,10,0.6)'; ctx.lineWidth = Math.max(0.8, 1.6 * s); ctx.beginPath();
        for (i = 0; i <= 8; i++) { var bx = lerp(cx0, cx1, i / 8); ctx.moveTo(bx, L.top); ctx.lineTo(L.vx + (bx - L.vx) * 3.2, 0); }
        for (i = 1; i < 5; i++) { var yy = L.top * (1 - Math.pow(i / 5, 1.6)); ctx.moveTo(lerp(cx0, -w * 0.1, 1 - yy / L.top), yy); ctx.lineTo(lerp(cx1, w * 1.1, 1 - yy / L.top), yy); }
        ctx.stroke();
        // strip lights on the ceiling
        for (i = 0; i < 3; i++) { var ly = L.top * (0.25 + i * 0.25), lw = w * (0.3 - i * 0.06); ctx.fillStyle = '#fffbea'; ctx.fillRect(L.vx - lw / 2, ly, lw, Math.max(0.8, (2.2 - i * 0.5) * s)); glow(ctx, L.vx, ly, lw * 0.7, '#fff6d8', 0.35); }
        /* the row of stalls */
        var n = STALLS.length, sw = (cx1 - cx0) / n;
        // back wall above the stalls
        ctx.fillStyle = '#5a463c'; ctx.fillRect(cx0, L.top - 1, cx1 - cx0, L.sign - L.top + 1);
        STALLS.forEach(function (st, si) {
          var x0 = cx0 + si * sw, x1 = x0 + sw, m = (x0 + x1) / 2, col = st[1];
          // signboard: lit box, food picture on the left, words on the right, stall number
          var sy0 = L.top + h * 0.008, sy1 = L.sign - h * 0.004;
          ctx.fillStyle = lg(ctx, 0, sy0, 0, sy1, [[0, mixh(col, '#ffffff', 0.25)], [1, col]]); ctx.fillRect(x0 + 1.5 * s, sy0, sw - 3 * s, sy1 - sy0);
          glow(ctx, m, (sy0 + sy1) / 2, sw * 0.7, col, 0.25);
          ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(x0 + 1.5 * s, sy1 - 1.2 * s, sw - 3 * s, 1.2 * s);
          var fs = Math.min((sy1 - sy0) * 0.62, sw * 0.24); ctx.fillStyle = '#ffffff'; ctx.font = '900 ' + fs.toFixed(1) + 'px ' + ZHF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 2 * s; ctx.fillText(st[0], m + sw * 0.1, (sy0 + sy1) / 2 + fs * 0.04); ctx.shadowBlur = 0;
          // a little food icon: a bowl
          var ix = x0 + sw * 0.16, iy = (sy0 + sy1) / 2, ir = Math.min(sw * 0.1, (sy1 - sy0) * 0.32); ctx.fillStyle = '#fff6e8'; ctx.beginPath(); ctx.arc(ix, iy - ir * 0.1, ir, 0, PI); ctx.fill(); ctx.fillStyle = '#ffd24a'; ctx.beginPath(); ctx.ellipse(ix, iy - ir * 0.12, ir, ir * 0.3, 0, PI, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.font = '700 ' + (fs * 0.42).toFixed(1) + 'px Manrope,sans-serif'; ctx.fillText('0' + (si + 1), x1 - sw * 0.1, sy0 + fs * 0.38);
          // the kitchen: tiled back wall, lit
          ctx.fillStyle = lg(ctx, 0, L.sign, 0, L.counter, [[0, '#f4ead4'], [1, '#c8b89a']]); ctx.fillRect(x0 + 1.5 * s, L.sign, sw - 3 * s, L.counter - L.sign);
          ctx.strokeStyle = 'rgba(120,100,80,0.25)'; ctx.lineWidth = Math.max(0.4, 0.5 * s); ctx.beginPath(); for (y = L.sign + 3 * s; y < L.counter; y += 3 * s) { ctx.moveTo(x0 + 1.5 * s, y); ctx.lineTo(x1 - 1.5 * s, y); } for (x = x0 + 4 * s; x < x1; x += 3 * s) { ctx.moveTo(x, L.sign); ctx.lineTo(x, L.counter); } ctx.stroke();
          glow(ctx, m, L.sign + h * 0.03, sw * 0.6, '#fff4d0', 0.4);
          // the cook
          var ckx = m + sw * (si % 2 ? 0.2 : -0.2), cky = L.counter, cs = Math.min(sw, h * 0.2);
          ctx.fillStyle = ['#3a6ab0', '#c84a3a', '#2a8a6a', '#e8a030', '#6a4ab0'][si]; ctx.beginPath(); ctx.ellipse(ckx, cky - cs * 0.16, cs * 0.12, cs * 0.2, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#f4f0e8'; ctx.fillRect(ckx - cs * 0.07, cky - cs * 0.24, cs * 0.14, cs * 0.24);
          ctx.fillStyle = ['#c89068', '#a87050', '#d8a078', '#8a5a3a', '#c88a60'][si]; ctx.beginPath(); ctx.arc(ckx, cky - cs * 0.42, cs * 0.075, 0, TAU); ctx.fill();
          ctx.fillStyle = '#2a1e18'; ctx.beginPath(); ctx.arc(ckx, cky - cs * 0.45, cs * 0.075, PI * 1.05, PI * 1.95); ctx.fill();
          if (si % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(ckx - cs * 0.08, cky - cs * 0.53, cs * 0.16, cs * 0.06); }
          // what each stall sells
          if (st[2] === 'chicken') { for (j = 0; j < 3; j++) { var dx = x0 + sw * (0.2 + j * 0.13), dy = L.sign + h * 0.03; ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = Math.max(0.4, 0.5 * s); ctx.beginPath(); ctx.moveTo(dx, L.sign + h * 0.005); ctx.lineTo(dx, dy); ctx.stroke(); ctx.fillStyle = lg(ctx, dx - 4 * s, 0, dx + 4 * s, 0, [[0, '#e8a050'], [1, '#a85a20']]); ctx.beginPath(); ctx.ellipse(dx, dy + h * 0.025, sw * 0.05, h * 0.03, 0, 0, TAU); ctx.fill(); } }
          if (st[2] === 'laksa' || st[2] === 'drinks') { var px = m + sw * (si % 2 ? -0.15 : 0.15); ctx.fillStyle = '#9aa0a8'; ctx.fillRect(px - sw * 0.1, L.counter - h * 0.05, sw * 0.2, h * 0.05); ctx.fillStyle = '#c8ccd0'; ctx.fillRect(px - sw * 0.11, L.counter - h * 0.054, sw * 0.22, h * 0.008); D.steam.push([px, L.counter - h * 0.055]); }
          if (st[2] === 'drinks') { for (j = 0; j < 6; j++) { ctx.fillStyle = ['#ff8a3a', '#7ad04a', '#d04a8a', '#4ac0e0', '#ffd24a', '#8a5a3a'][j]; ctx.fillRect(x0 + sw * (0.1 + j * 0.08), L.counter - h * 0.075, sw * 0.05, h * 0.03); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x0 + sw * (0.1 + j * 0.08), L.counter - h * 0.075, sw * 0.05, h * 0.005); } }
          if (st[2] === 'wok') { var wx2 = m - sw * 0.14; ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.ellipse(wx2, L.counter - h * 0.02, sw * 0.13, h * 0.016, 0, 0, PI); ctx.fill(); D.flames.push([wx2, L.counter - h * 0.02, sw * 0.12]); }
          if (st[2] === 'satay') { var gx = m - sw * 0.12; ctx.fillStyle = '#3a3a3a'; ctx.fillRect(gx - sw * 0.16, L.counter - h * 0.016, sw * 0.32, h * 0.016); ctx.fillStyle = '#ff6a2a'; ctx.fillRect(gx - sw * 0.15, L.counter - h * 0.016, sw * 0.3, h * 0.004); glow(ctx, gx, L.counter - h * 0.014, sw * 0.25, '#ff7a3a', 0.5);
            ctx.strokeStyle = '#c8a070'; ctx.lineWidth = Math.max(0.4, 0.5 * s); ctx.beginPath(); for (j = 0; j < 7; j++) { var sx2 = gx - sw * 0.14 + j * sw * 0.045; ctx.moveTo(sx2, L.counter - h * 0.03); ctx.lineTo(sx2 + sw * 0.02, L.counter - h * 0.004); } ctx.stroke();
            ctx.fillStyle = '#8a4a20'; for (j = 0; j < 7; j++) { ctx.beginPath(); ctx.ellipse(gx - sw * 0.135 + j * sw * 0.045, L.counter - h * 0.022, sw * 0.012, h * 0.008, 0.3, 0, TAU); ctx.fill(); } D.smoke.push([gx, L.counter - h * 0.03]); }
          // counter with a steel top and a menu strip
          ctx.fillStyle = lg(ctx, 0, L.counter, 0, L.floor, [[0, '#e8e8e8'], [0.12, '#a8acb0'], [0.13, mixh(col, '#ffffff', 0.15)], [1, mixh(col, '#000000', 0.25)]]); ctx.fillRect(x0 + 1 * s, L.counter, sw - 2 * s, L.floor - L.counter);
          ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (j = 0; j < 3; j++) ctx.fillRect(x0 + sw * (0.12 + j * 0.27), L.counter + h * 0.022, sw * 0.2, h * 0.025);
          ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x1 - 1.5 * s, L.sign, 1.5 * s, L.floor - L.sign);
        });
        /* a long banner under the ceiling: 小贩中心 (hawker centre) */
        var by0 = L.top * 0.02, by1 = L.top * 0.3, bw0 = w * 0.36;
        ctx.fillStyle = lg(ctx, 0, by0, 0, by1, [[0, '#2a8a5a'], [1, '#1a5a3a']]); ctx.fillRect(L.vx - bw0 / 2, by0, bw0, by1 - by0);
        ctx.fillStyle = '#f4d860'; ctx.fillRect(L.vx - bw0 / 2, by1 - 1.2 * s, bw0, 1.2 * s);
        ctx.fillStyle = '#fff8e0'; ctx.font = '900 ' + ((by1 - by0) * 0.66).toFixed(1) + 'px ' + ZHF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('小贩中心', L.vx, (by0 + by1) / 2 + (by1 - by0) * 0.04);
        /* the floor: speckled tiles in perspective */
        ctx.fillStyle = lg(ctx, 0, L.floor, 0, h, [[0, '#b8a888'], [0.4, '#a89474'], [1, '#7a6a52']]); ctx.fillRect(0, L.floor, w, h - L.floor);
        ctx.save(); ctx.beginPath(); ctx.rect(0, L.floor, w, h - L.floor); ctx.clip();
        ctx.strokeStyle = 'rgba(80,64,44,0.35)'; ctx.lineWidth = Math.max(0.5, 0.7 * s); ctx.beginPath();
        for (i = -16; i <= 16; i++) { var fx = L.vx + i * w * 0.1; ctx.moveTo(lerp(L.vx, fx, (L.floor - L.vy) / (h - L.vy)), L.floor); ctx.lineTo(fx, h); }
        for (i = 1; i < 16; i++) { var z = 1 + i * 0.4, yy2 = L.vy + (h * 1.25 - L.vy) / z; if (yy2 > L.floor && yy2 < h) { ctx.moveTo(0, yy2); ctx.lineTo(w, yy2); } }
        ctx.stroke();
        dots(ctx, Math.round(1500 * k), [['#6a5a44', 0.35], ['#f4ead8', 0.35], ['#c84a3a', 0.2]], function () { return [r() * w, lerp(L.floor, h, r()), (0.3 + r() * 0.5) * s, (r() * 3) | 0]; });
        // the stalls' warm light spilling onto the floor, and their colours mirrored in the polished tiles
        STALLS.forEach(function (st, si) { var mx = cx0 + (si + 0.5) * sw; glow(ctx, mx, L.floor + h * 0.02, sw * 0.8, '#ffe0a0', 0.28);
          for (var q = 0; q < 4; q++) soft(ctx, mx, L.floor + h * (0.015 + q * 0.03), sw * (0.45 - q * 0.05), h * 0.025, st[1], 0.2 - q * 0.04); });
        band(ctx, 0, w, L.floor, L.floor + h * 0.02, '#3a2a20', 0.35, 0);
        glow(ctx, w * 0.5, h * 0.98, w * 0.5, '#2a1a12', 0.3);
        glow(ctx, L.vx, h * 0.8, w * 0.6, '#ffe8c0', 0.12);
        ctx.restore();
        /* round tables with stools: two groups on each side, leaving the middle open */
        function table(tx, ty, tr, seed) {
          var rr = rng(seed), sc2 = tr / (w * 0.1);
          // stools behind
          [[-1.15, -0.25], [1.15, -0.25]].forEach(function (p) { stool(tx + p[0] * tr, ty + p[1] * tr * 0.35, tr * 0.28); });
          // pedestal and top
          ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(tx, ty + tr * 0.62, tr * 0.8, tr * 0.18, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#5a5a5a'; ctx.fillRect(tx - tr * 0.06, ty, tr * 0.12, tr * 0.6);
          ctx.fillStyle = '#d8d4cc'; ctx.beginPath(); ctx.ellipse(tx, ty + tr * 0.05, tr, tr * 0.34, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = lg(ctx, tx - tr, 0, tx + tr, 0, [[0, '#ffffff'], [0.6, '#eeeae4'], [1, '#c8c4bc']]); ctx.beginPath(); ctx.ellipse(tx, ty, tr, tr * 0.32, 0, 0, TAU); ctx.fill();
          // bowls, plates, a drink
          for (var q = 0; q < 3; q++) { var bx2 = tx + (rr() - 0.5) * tr * 1.1, by2 = ty + (rr() - 0.5) * tr * 0.3; if (q === 2) { ctx.fillStyle = '#ff9a3a'; ctx.fillRect(bx2 - tr * 0.06, by2 - tr * 0.22, tr * 0.12, tr * 0.2); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(bx2 - tr * 0.06, by2 - tr * 0.22, tr * 0.12, tr * 0.04); }
            else { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(bx2, by2, tr * 0.18, tr * 0.07, 0, 0, TAU); ctx.fill(); ctx.fillStyle = ['#f2c060', '#e86a3a', '#f4e4c0'][(rr() * 3) | 0]; ctx.beginPath(); ctx.ellipse(bx2, by2 - tr * 0.01, tr * 0.12, tr * 0.045, 0, 0, TAU); ctx.fill(); } }
          // stools in front
          [[-0.7, 0.75], [0.7, 0.75]].forEach(function (p) { stool(tx + p[0] * tr, ty + p[1] * tr * 0.6, tr * 0.3); });
        }
        function stool(sx, sy, sr) { ctx.fillStyle = '#4a4a4a'; ctx.fillRect(sx - sr * 0.12, sy, sr * 0.24, sr * 1.3); ctx.fillStyle = '#e8e4dc'; ctx.beginPath(); ctx.ellipse(sx, sy, sr, sr * 0.35, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(sx, sy + sr * 0.08, sr, sr * 0.3, 0, 0, PI); ctx.fill(); }
        // two diners at the far tables
        [[w * 0.13 - w * 0.09, h * 0.52, '#e8604a'], [w * 0.87 + w * 0.09, h * 0.52, '#4a8ae0']].forEach(function (dn) { var ds = h * 0.05; ctx.fillStyle = dn[2]; ctx.beginPath(); ctx.ellipse(dn[0], dn[1] - ds * 0.4, ds * 0.32, ds * 0.5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#c89068'; ctx.beginPath(); ctx.arc(dn[0], dn[1] - ds * 1.05, ds * 0.22, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a1e18'; ctx.beginPath(); ctx.arc(dn[0], dn[1] - ds * 1.12, ds * 0.22, PI, TAU); ctx.fill(); });
        table(w * 0.5, h * 0.505, w * 0.055, 5);
        table(w * 0.13, h * 0.53, w * 0.08, 1); table(w * 0.87, h * 0.53, w * 0.08, 2);
        table(w * 0.04, h * 0.66, w * 0.11, 3); table(w * 0.96, h * 0.66, w * 0.11, 4);
        /* fans and lanterns hanging from the ceiling (the overlay turns and sways them) */
        D.fans = [[w * 0.3, L.top * 0.55, w * 0.07], [w * 0.7, L.top * 0.55, w * 0.07]];
        D.fans.forEach(function (f) { ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = Math.max(0.6, 1 * s); ctx.beginPath(); ctx.moveTo(f[0], 0); ctx.lineTo(f[0], f[1]); ctx.stroke(); });
        D.lanterns = [[w * 0.12, L.top * 0.45, w * 0.035], [w * 0.5, L.top * 0.62, w * 0.03], [w * 0.88, L.top * 0.45, w * 0.035], [w * 0.22, L.top * 0.95, w * 0.022], [w * 0.78, L.top * 0.95, w * 0.022]];
        finish(ctx, w, h, '#ffb070', 0.2, 0.34, 0.04);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = hwLayout(w, h), s = L.s, D = HW[w + 'x' + h], i;
        if (!D) return;
        // wok fire
        D.flames.forEach(function (f) { var fl = 0.6 + 0.4 * Math.sin(t * 17) * Math.sin(t * 5.3); if (Math.sin(t * 0.8) < -0.3) fl *= 0.25;
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, f[0], f[1] - f[2] * 0.4, f[2] * 1.6, '#ff8a2a', 0.45 * fl);
          for (i = 0; i < 5; i++) { var fx = f[0] + (i - 2) * f[2] * 0.25 + Math.sin(t * 9 + i) * f[2] * 0.06, fh = f[2] * (0.6 + 0.5 * Math.abs(Math.sin(t * 11 + i * 2))) * fl;
            ctx.fillStyle = i % 2 ? 'rgba(255,210,90,0.8)' : 'rgba(255,120,40,0.75)'; ctx.beginPath(); ctx.moveTo(fx - f[2] * 0.12, f[1]); ctx.quadraticCurveTo(fx - f[2] * 0.05, f[1] - fh * 0.6, fx, f[1] - fh); ctx.quadraticCurveTo(fx + f[2] * 0.05, f[1] - fh * 0.6, fx + f[2] * 0.12, f[1]); ctx.closePath(); ctx.fill(); }
          ctx.restore(); });
        // satay smoke and soup steam
        D.smoke.forEach(function (sm) { for (i = 0; i < 7; i++) { var f = (t * 0.3 + i / 7) % 1; soft(ctx, sm[0] + Math.sin(t * 0.9 + i * 1.7) * 6 * s * f, sm[1] - f * h * 0.14, (3 + f * 10) * s, (3 + f * 10) * s, '#d8d0c8', 0.28 * Math.sin(PI * f)); } });
        D.steam.forEach(function (sm) { for (i = 0; i < 5; i++) { var f = (t * 0.4 + i / 5) % 1; soft(ctx, sm[0] + Math.sin(t * 1.3 + i) * 3 * s, sm[1] - f * h * 0.08, (2 + f * 7) * s, (2 + f * 7) * s, '#ffffff', 0.3 * Math.sin(PI * f)); } });
        // ceiling fans turning
        D.fans.forEach(function (f, n) { var a0 = t * 7 + n; ctx.fillStyle = '#2e2a28'; for (i = 0; i < 3; i++) { var a = a0 + i * TAU / 3; ctx.beginPath(); ctx.ellipse(f[0] + Math.cos(a) * f[2] * 0.5, f[1] + Math.sin(a) * f[2] * 0.08, f[2] * 0.5, f[2] * 0.06, 0, 0, TAU); ctx.fill(); }
          ctx.fillStyle = '#4a4440'; ctx.beginPath(); ctx.ellipse(f[0], f[1], f[2] * 0.12, f[2] * 0.06, 0, 0, TAU); ctx.fill(); });
        // red lanterns swaying
        D.lanterns.forEach(function (ln, n) { var sw = Math.sin(t * 1.1 + n * 1.3) * 0.08, lx = ln[0] + Math.sin(sw) * ln[1] * 0.3, ly = ln[1], lr = ln[2];
          ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = Math.max(0.5, 0.6 * s); ctx.beginPath(); ctx.moveTo(ln[0], 0); ctx.lineTo(lx, ly - lr * 0.8); ctx.stroke();
          glow(ctx, lx, ly, lr * 2.6, '#ff4a2a', 0.35);
          ctx.fillStyle = rg(ctx, lx - lr * 0.3, ly - lr * 0.3, 0, lr * 1.2, [[0, '#ffb070'], [0.5, '#e8342a'], [1, '#9a1a18']]); ctx.beginPath(); ctx.ellipse(lx, ly, lr, lr * 0.85, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#e8b040'; ctx.fillRect(lx - lr * 0.45, ly - lr * 0.95, lr * 0.9, lr * 0.16); ctx.fillRect(lx - lr * 0.45, ly + lr * 0.8, lr * 0.9, lr * 0.16);
          ctx.strokeStyle = '#e8b040'; ctx.beginPath(); ctx.moveTo(lx, ly + lr * 0.95); ctx.lineTo(lx, ly + lr * 1.6); ctx.stroke(); });
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= SINGAPORE · RAINFOREST WALK (misty morning) ======================= */
  function rfLayout(w, h) { return { vx: w * 0.53, vy: h * 0.47, s: scl(w, h), k: dens(w, h) }; }
  function trunk(ctx, x, top, base, wd, col, colD, lit, roots) {
    ctx.fillStyle = lg(ctx, x - wd, 0, x + wd, 0, [[0, colD], [0.35, col], [0.6, lit || col], [1, colD]]);
    ctx.beginPath(); ctx.moveTo(x - wd * 0.42, top); ctx.lineTo(x + wd * 0.42, top);
    if (roots) { ctx.quadraticCurveTo(x + wd * 0.5, base - (base - top) * 0.15, x + wd * 1.6, base); ctx.lineTo(x - wd * 1.6, base); ctx.quadraticCurveTo(x - wd * 0.5, base - (base - top) * 0.15, x - wd * 0.42, top); }
    else { ctx.lineTo(x + wd * 0.55, base); ctx.lineTo(x - wd * 0.55, base); }
    ctx.closePath(); ctx.fill();
    if (roots) { ctx.strokeStyle = colD; ctx.lineWidth = Math.max(0.5, wd * 0.08); ctx.beginPath(); ctx.moveTo(x - wd * 0.1, base - (base - top) * 0.12); ctx.quadraticCurveTo(x - wd * 0.3, base - (base - top) * 0.03, x - wd * 0.9, base); ctx.moveTo(x + wd * 0.15, base - (base - top) * 0.1); ctx.quadraticCurveTo(x + wd * 0.35, base - (base - top) * 0.02, x + wd * 0.8, base); ctx.stroke(); }
  }
  SC.rainforest = {
    paint: function (ctx, w, h) {
      try {
        var L = rfLayout(w, h), vx = L.vx, vy = L.vy, s = L.s, k = L.k, r = rng(9191), i, j, x, y;
        /* bright misty sky glimpsed through the canopy */
        ctx.fillStyle = lg(ctx, 0, 0, 0, h, [[0, '#cfe8d8'], [0.45, '#e8f2dc'], [1, '#9ab890']]); ctx.fillRect(0, 0, w, h);
        glow(ctx, w * 0.78, h * 0.12, Math.max(w, h) * 0.6, '#fff8dc', 0.75);
        /* far layer: pale tree shapes in the mist */
        for (i = 0; i < 16; i++) { var fx = r() * w, fw = (2 + r() * 3) * s; ctx.fillStyle = 'rgba(150,180,160,0.45)'; ctx.fillRect(fx - fw / 2, h * 0.1, fw, vy - h * 0.06); }
        for (i = 0; i < 22; i++) soft(ctx, r() * w, h * (0.1 + r() * 0.3), w * (0.06 + r() * 0.08), h * (0.04 + r() * 0.05), r() < 0.5 ? '#8aac90' : '#a8c4a0', 0.5);
        haze(ctx, -w * 0.2, h * 0.15, w * 1.2, vy + h * 0.08, '#eef4e4', 0.4);
        /* middle layer: tall trunks, buttress roots and hanging lianas */
        var mids = [[0.18, 3.2], [0.33, 2.6], [0.71, 2.8], [0.86, 2.2], [0.44, 4.4], [0.62, 4], [0.05, 2.4], [0.97, 2.6]];
        mids.sort(function (a, b) { return b[1] - a[1]; });
        mids.forEach(function (m) { var z = m[1], tx = w * m[0], base = vy + h * 0.26 / z, wd = 9 * s / z * 2.2, a = clamp(1.05 - z * 0.12, 0.55, 0.92);
          trunk(ctx, tx, -h * 0.05, base, wd, mixh('#6a7a5a', '#b8c8b0', 1 - a), mixh('#3a4a32', '#9ab0a0', 1 - a), mixh('#a8b88a', '#d8e4cc', 1 - a), true);
          ctx.strokeStyle = mixh('#3a5a2a', '#a8c0a0', 1 - a); ctx.lineWidth = Math.max(0.5, 1.2 * s / z * 2); ctx.beginPath(); for (j = 0; j < 2; j++) { var lx = tx + (j ? 1 : -1) * wd * (1 + r() * 2); ctx.moveTo(tx, h * (0.05 + r() * 0.1)); ctx.quadraticCurveTo(lx, h * 0.25, lx + (r() - 0.5) * wd, base - h * 0.04); } ctx.stroke(); });
        haze(ctx, -w * 0.1, vy - h * 0.12, w * 1.1, vy + h * 0.06, '#f0f4e4', 0.3);
        /* undergrowth along the forest floor: dark masses, then leaves on top */
        [-1, 1].forEach(function (side) { ctx.fillStyle = lg(ctx, 0, vy - h * 0.06, 0, h, [[0, '#6a8a62'], [0.3, '#2e4a28'], [1, '#14260f']]); ctx.beginPath(); ctx.moveTo(vx + side * w * 0.01, vy - h * 0.005); var px0 = vx + side * w * 0.01, py0 = vy - h * 0.005; for (var q = 1; q <= 26; q++) { var f = q / 26, xx = vx + side * (w * 0.02 + f * w * 0.62), yy = vy - h * (0.05 + 0.03 * Math.sin(q * 1.9)) * (0.4 + f); ctx.quadraticCurveTo((px0 + xx) / 2, Math.min(py0, yy) - h * 0.03 * (0.4 + f), xx, yy); px0 = xx; py0 = yy; } ctx.lineTo(vx + side * w * 0.7, h); ctx.lineTo(vx + side * w * 0.35, h); ctx.closePath(); ctx.fill(); });
        leaves(ctx, Math.round(2600 * k), [['#1e3a1e', 0.9], ['#2e5a2a', 0.9], ['#4a7a32', 0.9], ['#6a9a3a', 0.85], ['#9ac05a', 0.75]], function () {
          var yy = lerp(vy - h * 0.08, h, Math.pow(r(), 0.85)), f = clamp((yy - vy) / (h - vy), 0, 1), side = r() < 0.5 ? -1 : 1, half = f * w * 0.36 + w * 0.02, xx = vx + side * (half + r() * w * 0.6);
          var a = -PI / 2 + (r() - 0.5) * 2.4 + side * 0.3, bucket = f < 0.15 ? (r() < 0.5 ? 2 : 3) : (r() * 5) | 0; return [xx, yy, (2 + f * 13 + r() * 3) * s, a, bucket]; });
        /* the boardwalk */
        function bw(f) { return w * 0.012 + f * w * 0.34; } // half-width at depth fraction f (0 at the vanishing point, 1 at the bottom)
        ctx.fillStyle = lg(ctx, 0, vy, 0, h, [[0, '#c8a878'], [0.4, '#a8804e'], [1, '#7a5432']]);
        ctx.beginPath(); ctx.moveTo(vx - bw(0), vy); ctx.lineTo(vx + bw(0), vy); ctx.lineTo(vx + bw(1), h); ctx.lineTo(vx - bw(1), h); ctx.closePath(); ctx.fill();
        // planks across
        ctx.strokeStyle = 'rgba(70,44,22,0.55)'; ctx.lineWidth = Math.max(0.5, 0.8 * s); ctx.beginPath();
        for (i = 1; i < 60; i++) { var z = 1 + i * 0.35, yy = vy + (h - vy) / z * 1.0; if (yy > h) continue; var f = (yy - vy) / (h - vy); ctx.moveTo(vx - bw(f), yy); ctx.lineTo(vx + bw(f), yy); }
        ctx.stroke();
        batch(ctx, Math.round(500 * k), [['#5a3a1e', 0.6 * s, 0.3], ['#f0d0a0', 0.5 * s, 0.25]], function () { var yy = lerp(vy, h, Math.pow(r(), 0.7)), f = (yy - vy) / (h - vy), xx = vx + (r() * 2 - 1) * bw(f) * 0.95, l = (2 + f * 18) * s; return [xx, yy, xx + l, yy, r() < 0.6 ? 0 : 1]; });
        // dappled sunlight on the boards
        ctx.save(); ctx.beginPath(); ctx.moveTo(vx - bw(0), vy); ctx.lineTo(vx + bw(0), vy); ctx.lineTo(vx + bw(1), h); ctx.lineTo(vx - bw(1), h); ctx.closePath(); ctx.clip();
        for (i = 0; i < 14; i++) { var yy3 = lerp(vy + h * 0.05, h, r()), f3 = (yy3 - vy) / (h - vy); soft(ctx, vx + (r() * 2 - 1) * bw(f3) * 0.7, yy3, (4 + f3 * 26) * s, (1 + f3 * 5) * s, '#fff2c0', 0.35); }
        ctx.restore();
        // handrails: posts and rails on both sides
        [-1, 1].forEach(function (side) {
          ctx.strokeStyle = '#5a3a20'; ctx.lineCap = 'round';
          for (i = 0; i < 26; i++) { var z = 1 + i * 0.55, yy = vy + (h - vy) / z * 1.05; if (yy > h * 1.1) continue; var f = (yy - vy) / (h - vy), px = vx + side * bw(f) * 1.02, ph = (h - vy) * 0.42 / z; ctx.lineWidth = Math.max(0.6, 3 * s / z); ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px, yy - ph); ctx.stroke(); }
          for (var rl = 0; rl < 2; rl++) { var hk = rl ? 0.42 : 0.22; ctx.lineWidth = Math.max(0.6, 2.4 * s * (rl ? 1 : 0.7)); ctx.strokeStyle = rl ? '#8a6038' : '#6a4426'; ctx.beginPath(); ctx.moveTo(vx + side * bw(0) * 1.02, vy - (h - vy) * hk * 0.02); ctx.lineTo(vx + side * bw(1.08) * 1.02, h * 1.08 - (h - vy) * hk * 1.0); ctx.stroke(); }
          ctx.strokeStyle = 'rgba(255,230,180,0.4)'; ctx.lineWidth = Math.max(0.4, 0.8 * s); ctx.beginPath(); ctx.moveTo(vx + side * bw(0) * 1.02, vy - (h - vy) * 0.42 * 0.02 - 0.5); ctx.lineTo(vx + side * bw(1.08) * 1.02, h * 1.08 - (h - vy) * 0.42 - 1 * s); ctx.stroke();
        });
        /* near layer: two big trunks at the edges, ferns and broad leaves */
        trunk(ctx, w * 0.02, -h * 0.05, h * 1.02, 26 * s, '#5a4a32', '#2a2218', '#8a7a52', true);
        trunk(ctx, w * 1.0, -h * 0.05, h * 0.9, 20 * s, '#5a4a32', '#2a2218', '#7a6a48', true);
        // moss and an epiphyte on the left trunk
        leaves(ctx, Math.round(140 * Math.sqrt(k)), [['#3a6a24', 0.9], ['#7aa83a', 0.8]], function () { return [w * 0.02 + (r() - 0.3) * 18 * s, h * (0.2 + r() * 0.5), (2 + r() * 3) * s, r() * TAU, r() < 0.5 ? 0 : 1]; });
        function fern(cx, cy, R, n, seed, col, col2) { var rr = rng(seed); for (var q = 0; q < n; q++) { var a = -PI * (0.08 + rr() * 0.84), L2 = R * (0.6 + rr() * 0.4), ex = cx + Math.cos(a) * L2, ey = cy + Math.sin(a) * L2 * 0.7 + L2 * 0.2;
          ctx.strokeStyle = col; ctx.lineWidth = Math.max(0.5, 0.8 * s); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo((cx + ex) / 2, cy + Math.sin(a) * L2 * 0.7 - L2 * 0.1, ex, ey); ctx.stroke();
          ctx.strokeStyle = q % 2 ? col : col2; ctx.lineWidth = Math.max(0.5, 0.9 * s); ctx.beginPath();
          for (var u = 0.1; u < 1; u += 0.07) { var px = lerp(cx, ex, u), py = lerp(cy, ey, u) + Math.sin(u * PI) * (Math.sin(a) * L2 * 0.7 - L2 * 0.1 - (cy - cy)) * 0 - Math.sin(u * PI) * L2 * 0.12, ll = L2 * 0.16 * Math.sin(u * PI + 0.3); ctx.moveTo(px, py); ctx.lineTo(px + ll * 0.3, py + ll); ctx.moveTo(px, py); ctx.lineTo(px - ll * 0.5, py + ll * 0.5); }
          ctx.stroke(); } }
        fern(w * 0.08, h * 0.98, h * 0.3, 11, 5, '#2e6a2a', '#4a8a32');
        fern(w * 0.93, h * 0.97, h * 0.26, 10, 6, '#2e6a2a', '#5a9a3a');
        fern(w * 0.2, h * 0.7, h * 0.12, 8, 7, '#3a6a2a', '#5a8a3a');
        fern(w * 0.82, h * 0.68, h * 0.1, 8, 8, '#3a6a2a', '#5a8a3a');
        // broad heart-shaped leaves in the bottom corners
        function bigleaf(cx, cy, len, ang, col) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(len * 0.3, -len * 0.45, len * 0.9, -len * 0.25, len, 0); ctx.bezierCurveTo(len * 0.9, len * 0.25, len * 0.3, len * 0.45, 0, 0); ctx.fill();
          ctx.strokeStyle = 'rgba(200,240,160,0.35)'; ctx.lineWidth = Math.max(0.5, len * 0.012); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len * 0.95, 0); for (var q = 1; q < 5; q++) { ctx.moveTo(len * q * 0.18, 0); ctx.lineTo(len * (q * 0.18 + 0.12), -len * 0.15); ctx.moveTo(len * q * 0.18, 0); ctx.lineTo(len * (q * 0.18 + 0.12), len * 0.15); } ctx.stroke(); ctx.restore(); }
        bigleaf(-w * 0.04, h * 0.86, h * 0.22, -0.5, '#2a5a26'); bigleaf(-w * 0.02, h * 0.95, h * 0.2, -0.15, '#3a7a2e');
        bigleaf(w * 1.04, h * 0.9, h * 0.22, PI + 0.45, '#2a5a26'); bigleaf(w * 1.02, h * 0.99, h * 0.18, PI + 0.1, '#3a7a2e');
        /* the canopy overhead */
        for (i = 0; i < 18; i++) { var cx2 = r() * w; if (cx2 > w * 0.62 && cx2 < w * 0.92) continue; soft(ctx, cx2, h * (0.02 + r() * 0.08), w * (0.08 + r() * 0.1), h * (0.04 + r() * 0.05), '#1e3a1e', 0.7); }
        leaves(ctx, Math.round(1500 * k), [['#14280f', 0.95], ['#2e5a26', 0.9], ['#4a7a2e', 0.9], ['#8ab84a', 0.8]], function () { var xx = r() * w, yy = Math.pow(r(), 1.7) * h * 0.24 - h * 0.02; if (xx > w * 0.62 && xx < w * 0.92 && yy > h * 0.05 && r() < 0.85) return null; return [xx, yy, (3 + r() * 6) * s, PI / 2 + (r() - 0.5) * 2.6, (r() * 4) | 0]; });
        // lianas hanging down
        ctx.strokeStyle = '#2a4a22'; ctx.lineWidth = Math.max(0.6, 1.1 * s);
        for (i = 0; i < 6; i++) { var lx2 = w * (0.1 + r() * 0.8), ll2 = h * (0.15 + r() * 0.25); ctx.beginPath(); ctx.moveTo(lx2, 0); ctx.quadraticCurveTo(lx2 + (r() - 0.5) * 20 * s, ll2 * 0.6, lx2 + (r() - 0.5) * 10 * s, ll2); ctx.stroke(); dots(ctx, 6, [['#4a7a2e', 0.9]], function (n) { return [lx2 + (r() - 0.5) * 4 * s, ll2 * (n / 6), 1.4 * s, 0]; }); }
        /* sunbeams slanting through the mist */
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 6; i++) { var bx = w * (0.6 + i * 0.07), wd = w * (0.015 + r() * 0.03), a = 0.42; ctx.fillStyle = lg(ctx, bx, 0, bx - Math.tan(a) * h, h, [[0, 'rgba(255,248,210,0.2)'], [1, 'rgba(255,248,210,0)']]); ctx.beginPath(); ctx.moveTo(bx - wd, 0); ctx.lineTo(bx + wd, 0); ctx.lineTo(bx + wd - Math.tan(a) * h * 0.95, h * 0.95); ctx.lineTo(bx - wd * 2.5 - Math.tan(a) * h * 0.95, h * 0.95); ctx.closePath(); ctx.fill(); }
        ctx.restore();
        finish(ctx, w, h, '#d8f0b0', 0.14, 0.24, 0.04);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = rfLayout(w, h), s = L.s, i;
        // drifting mist
        for (i = 0; i < 4; i++) { var mx = ((t * (4 + i) * s + i * w * 0.4) % (w * 1.6)) - w * 0.3, my = L.vy - h * 0.04 + i * h * 0.03; soft(ctx, mx, my, w * 0.3, h * 0.03, '#ffffff', 0.18); }
        // the sunbeams breathe
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 0.5);
        var bx = w * 0.72, a = 0.42; ctx.fillStyle = lg(ctx, bx, 0, bx - Math.tan(a) * h, h, [[0, 'rgba(255,250,220,0.12)'], [1, 'rgba(255,250,220,0)']]); ctx.beginPath(); ctx.moveTo(bx - w * 0.05, 0); ctx.lineTo(bx + w * 0.05, 0); ctx.lineTo(bx + w * 0.05 - Math.tan(a) * h, h); ctx.lineTo(bx - w * 0.12 - Math.tan(a) * h, h); ctx.closePath(); ctx.fill(); ctx.restore();
        // butterflies
        [['#2a7ae8', '#8ad0ff'], ['#ff8a2a', '#ffd24a'], ['#e84a8a', '#ffb0d0']].forEach(function (c, n) { var bx2 = w * (0.3 + 0.4 * Math.sin(t * (0.13 + n * 0.04) + n * 2)), by2 = h * (0.45 + 0.15 * Math.sin(t * (0.21 + n * 0.05) + n)) + Math.sin(t * 3 + n) * 4 * s, fl = Math.abs(Math.sin(t * 9 + n * 1.3)), sz = 4 * s;
          ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(bx2 - sz * 0.5 * fl, by2 - sz * 0.2, sz * 0.6 * fl + 0.3, sz * 0.5, -0.4, 0, TAU); ctx.ellipse(bx2 + sz * 0.5 * fl, by2 - sz * 0.2, sz * 0.6 * fl + 0.3, sz * 0.5, 0.4, 0, TAU); ctx.fill();
          ctx.fillStyle = c[1]; ctx.beginPath(); ctx.ellipse(bx2 - sz * 0.35 * fl, by2 + sz * 0.3, sz * 0.4 * fl + 0.2, sz * 0.3, 0.3, 0, TAU); ctx.ellipse(bx2 + sz * 0.35 * fl, by2 + sz * 0.3, sz * 0.4 * fl + 0.2, sz * 0.3, -0.3, 0, TAU); ctx.fill();
          ctx.fillStyle = '#1a1a1a'; ctx.fillRect(bx2 - 0.4 * s, by2 - sz * 0.5, 0.8 * s, sz); });
        // a hornbill gliding across now and then
        var P = 24, ph = (t % P) / P;
        if (ph < 0.35) { var u = ph / 0.35, hx = lerp(-w * 0.1, w * 1.1, u), hy = h * (0.16 + 0.05 * Math.sin(u * PI * 2)), hs = 9 * s, fl2 = Math.sin(t * 5) * 0.6;
          ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.ellipse(hx, hy, hs, hs * 0.32, 0, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.moveTo(hx - hs * 0.3, hy); ctx.quadraticCurveTo(hx - hs * 0.1, hy - hs * (1.1 + fl2), hx + hs * 0.6, hy - hs * (0.9 + fl2)); ctx.lineTo(hx + hs * 0.3, hy); ctx.fill();
          ctx.fillStyle = '#ffffff'; ctx.fillRect(hx - hs * 1.6, hy - hs * 0.08, hs * 0.7, hs * 0.16); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(hx - hs * 1.25, hy - hs * 0.08, hs * 0.35, hs * 0.16);
          ctx.fillStyle = '#f2c03a'; ctx.beginPath(); ctx.moveTo(hx + hs * 0.9, hy - hs * 0.15); ctx.quadraticCurveTo(hx + hs * 1.7, hy - hs * 0.05, hx + hs * 1.8, hy + hs * 0.25); ctx.lineTo(hx + hs * 0.9, hy + hs * 0.1); ctx.fill();
          ctx.fillStyle = '#e8702a'; ctx.beginPath(); ctx.ellipse(hx + hs * 1.2, hy - hs * 0.25, hs * 0.35, hs * 0.12, 0.1, 0, TAU); ctx.fill(); }
        // a leaf spinning down
        var lf = (t * 0.08) % 1, lx = w * (0.4 + 0.2 * Math.sin(t * 0.7)), ly = lf * h; ctx.save(); ctx.translate(lx, ly); ctx.rotate(t * 2); ctx.scale(Math.cos(t * 3), 1); ctx.fillStyle = '#7aa83a'; ctx.beginPath(); ctx.ellipse(0, 0, 3 * s, 1.4 * s, 0, 0, TAU); ctx.fill(); ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };
  /* boat sprite on water: bob, a soft reflection and a wake. dir: +1 moving right, -1 left */
  function drawBoat(ctx, spr, x, y, bw, bh, s, t, dir) {
    var bob = Math.sin(t * 1.6 + x * 0.05) * 0.8 * s;
    ctx.save();
    // wake
    ctx.strokeStyle = 'rgba(255,240,220,0.35)'; ctx.lineWidth = Math.max(0.6, 0.9 * s); ctx.lineCap = 'round'; ctx.beginPath();
    for (var i = 0; i < 4; i++) { var wx = x - dir * (bw * 0.45 + i * 7 * s), sp = 2 + i * 2.2; ctx.moveTo(wx - 3 * s, y + 1 * s + sp * 0.4 * s); ctx.lineTo(wx + 3 * s, y + 1 * s + sp * 0.4 * s); }
    ctx.stroke();
    // reflection
    ctx.globalAlpha = 0.28; ctx.translate(x, y + bob * 0.3); ctx.scale(dir < 0 ? -1 : 1, -0.6);
    ctx.drawImage(spr, -bw / 2, -bh, bw, bh); ctx.restore();
    ctx.save(); ctx.translate(x, y + bob); if (dir < 0) ctx.scale(-1, 1); ctx.drawImage(spr, -bw / 2, -bh, bw, bh); ctx.restore();
  }
  /* sprites are drawn facing right, waterline at the bottom edge */
  function drawFerry(c, w, h) {
    var s = w / 54, x;
    // hull: green below a white band, a little darker at the waterline
    c.fillStyle = c.createLinearGradient(0, h - 7 * s, 0, h); c.fillStyle.addColorStop && 0;
    var g = c.createLinearGradient(0, h - 7 * s, 0, h); g.addColorStop(0, '#2c8a5e'); g.addColorStop(1, '#13452f'); c.fillStyle = g;
    c.beginPath(); c.moveTo(1.5 * s, h - 6.5 * s); c.lineTo(w - 1.5 * s, h - 6.5 * s); c.quadraticCurveTo(w - 3 * s, h - 1 * s, w - 6 * s, h); c.lineTo(6 * s, h); c.quadraticCurveTo(3 * s, h - 1 * s, 1.5 * s, h - 6.5 * s); c.closePath(); c.fill();
    c.fillStyle = '#f4f1e8'; c.fillRect(2.5 * s, h - 8.4 * s, w - 5 * s, 2.2 * s);
    // lower deck: cream with warm cabin windows
    g = c.createLinearGradient(0, h - 13.5 * s, 0, h - 8 * s); g.addColorStop(0, '#f6f2e6'); g.addColorStop(1, '#cfc8b6'); c.fillStyle = g; c.fillRect(4.5 * s, h - 13.5 * s, w - 9 * s, 5.4 * s);
    for (x = 6.5 * s; x < w - 7 * s; x += 3.1 * s) { c.fillStyle = '#7a5a2a'; c.fillRect(x - 0.3 * s, h - 12.6 * s, 2.4 * s, 3.2 * s); c.fillStyle = '#ffd98a'; c.fillRect(x, h - 12.3 * s, 1.8 * s, 2.6 * s); }
    // upper deck: green with a white roof, and a rail
    g = c.createLinearGradient(0, h - 18 * s, 0, h - 13.5 * s); g.addColorStop(0, '#3a9a6a'); g.addColorStop(1, '#1f6a48'); c.fillStyle = g; c.fillRect(7 * s, h - 18 * s, w - 14 * s, 4.6 * s);
    for (x = 8.5 * s; x < w - 9 * s; x += 3.1 * s) { c.fillStyle = '#ffe9b0'; c.fillRect(x, h - 17.2 * s, 2 * s, 2.3 * s); }
    c.fillStyle = '#f4f1e8'; c.fillRect(5.5 * s, h - 19.4 * s, w - 11 * s, 1.5 * s);
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(5.5 * s, h - 17.9 * s, w - 11 * s, 0.5 * s);
    c.strokeStyle = 'rgba(240,236,224,0.8)'; c.lineWidth = Math.max(0.4, 0.4 * s); c.beginPath(); c.moveTo(4.5 * s, h - 14 * s); c.lineTo(w - 4.5 * s, h - 14 * s); c.stroke();
    // wheelhouses at both ends, mast with a white light
    c.fillStyle = '#1f6a48'; c.fillRect(3.5 * s, h - 16 * s, 3.5 * s, 2.6 * s); c.fillRect(w - 7 * s, h - 16 * s, 3.5 * s, 2.6 * s);
    c.fillStyle = '#f4f1e8'; c.fillRect(w * 0.5 - 0.4 * s, h - 23 * s, 0.8 * s, 4 * s);
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(w * 0.5, h - 23.2 * s, 0.8 * s, 0, TAU); c.fill();
    c.fillStyle = '#ff5a4a'; c.beginPath(); c.arc(1.8 * s, h - 9 * s, 0.7 * s, 0, TAU); c.fill(); c.fillStyle = '#5aff8a'; c.beginPath(); c.arc(w - 1.8 * s, h - 9 * s, 0.7 * s, 0, TAU); c.fill();
  }
  function drawJunk(c, w, h) {
    var s = w / 44;
    // hull with a raised stern
    c.fillStyle = '#3a2418'; c.beginPath(); c.moveTo(3 * s, h - 7 * s); c.lineTo(w - 4 * s, h - 6 * s); c.quadraticCurveTo(w - 1 * s, h - 9 * s, w - 1 * s, h - 9.5 * s); c.lineTo(w - 6 * s, h); c.lineTo(7 * s, h); c.quadraticCurveTo(2 * s, h - 3 * s, 1 * s, h - 9 * s); c.closePath(); c.fill();
    c.fillStyle = '#6a3a22'; c.fillRect(4 * s, h - 7.2 * s, w - 9 * s, 1 * s);
    for (var x = 8 * s; x < w - 8 * s; x += 3 * s) { c.fillStyle = '#ffd68a'; c.fillRect(x, h - 5.2 * s, 1.4 * s, 1.2 * s); }
    // fan-shaped battened sails (deep red, glowing where the sunset shines through); the bow is on the right
    function sail(mx, top, sw, sh) {
      var lx = mx + sw * 0.18, ax = mx - sw * 0.82;
      var g = c.createLinearGradient(ax, 0, lx, 0); g.addColorStop(0, '#e8683a'); g.addColorStop(0.5, '#c43c24'); g.addColorStop(1, '#8a2418'); c.fillStyle = g;
      c.beginPath(); c.moveTo(lx, top + sh * 0.2); c.lineTo(lx, top + sh); c.lineTo(ax + sw * 0.1, top + sh);
      c.quadraticCurveTo(ax - sw * 0.22, top + sh * 0.5, ax, top); c.quadraticCurveTo(mx - sw * 0.3, top + sh * 0.02, lx, top + sh * 0.2); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(70,18,10,0.7)'; c.lineWidth = Math.max(0.5, 0.55 * s); c.beginPath();
      for (var i = 1; i < 6; i++) { var f = i / 6, ly = lerp(top + sh * 0.2, top + sh, f), ay = lerp(top, top + sh, f), axx = ax - Math.sin(PI * f) * sw * 0.2 + sw * 0.1 * f; c.moveTo(lx, ly); c.quadraticCurveTo(mx - sw * 0.3, (ly + ay) / 2 + sh * 0.02, axx, ay); }
      c.stroke();
      c.strokeStyle = '#2a1a12'; c.lineWidth = Math.max(0.6, 0.9 * s); c.beginPath(); c.moveTo(mx, top - 1.5 * s); c.lineTo(mx, top + sh + 3 * s); c.stroke();
    }
    sail(w * 0.36, h - 26 * s, 13 * s, 18 * s);
    sail(w * 0.66, h - 30 * s, 15 * s, 22 * s);
    sail(w * 0.9, h - 19 * s, 6 * s, 10 * s);
  }
})();
