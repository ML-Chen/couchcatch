/* scenery_ca.js - painted California backgrounds (San Diego, Los Angeles, San Francisco, Yosemite).
   Plain browser script. SCENES[key] = { paint(ctx,w,h), overlay(ctx,w,h,t) }. */
(function () {
  'use strict';
  var SC = (window.SCENES = window.SCENES || {});
  var PI = Math.PI, TAU = PI * 2;

  /* ---------------- utilities ---------------- */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(i, s) {
    var x = Math.imul((i | 0) ^ Math.imul(s | 0, 0x9E3779B1), 0x27d4eb2d);
    x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }
  function vnoise(x, s) {
    var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return hash(i, s) * (1 - u) + hash(i + 1, s) * u;
  }
  function fbm(x, s, oct) {
    var v = 0, a = 0.5, fr = 1, n = 0, o;
    for (o = 0; o < (oct || 5); o++) { v += a * vnoise(x * fr, s + o * 131); n += a; a *= 0.5; fr *= 2.07; }
    return v / n;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  function mix(c1, c2, t) { var a = hex(c1), b = hex(c2); return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')'; }
  function rgba(c, al) { var a = hex(c); return 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + al + ')'; }
  function lg(ctx, x0, y0, x1, y1, st) { var g = ctx.createLinearGradient(x0, y0, x1, y1); for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]); return g; }
  function rg(ctx, x, y, r0, r1, st) { var g = ctx.createRadialGradient(x, y, r0, x, y, Math.max(r0 + 0.1, r1)); for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]); return g; }
  function sc(w, h) { return Math.max(0.55, Math.min(w / 480, h / 360)); }

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
  function cloud(ctx, x, y, sz, r, lit, shade, al) {
    var i, cx, cy, rr, n = 9 + Math.floor(r() * 5);
    var pts = [];
    for (i = 0; i < n; i++) {
      var u = (i / (n - 1)) - 0.5;
      cx = x + u * sz * 2.4 + (r() - 0.5) * sz * 0.3;
      cy = y - Math.cos(u * PI) * sz * 0.45 * (0.6 + r() * 0.8);
      rr = sz * (0.35 + r() * 0.35) * (1 - Math.abs(u) * 0.6);
      pts.push([cx, cy, rr]);
    }
    for (i = 0; i < n; i++) { ctx.fillStyle = rg(ctx, pts[i][0], pts[i][1] + pts[i][2] * 0.25, 0, pts[i][2] * 1.15, [[0, rgba(shade, al)], [0.6, rgba(shade, al * 0.6)], [1, rgba(shade, 0)]]); ctx.fillRect(pts[i][0] - pts[i][2] * 1.2, pts[i][1] - pts[i][2] * 1.0, pts[i][2] * 2.4, pts[i][2] * 2.6); }
    for (i = 0; i < n; i++) { ctx.fillStyle = rg(ctx, pts[i][0] - pts[i][2] * 0.15, pts[i][1] - pts[i][2] * 0.25, 0, pts[i][2] * 0.95, [[0, rgba(lit, al)], [0.55, rgba(lit, al * 0.55)], [1, rgba(lit, 0)]]); ctx.fillRect(pts[i][0] - pts[i][2] * 1.2, pts[i][1] - pts[i][2] * 1.3, pts[i][2] * 2.4, pts[i][2] * 2.4); }
  }
  function wisp(ctx, x, y, len, th, col, al, r) {
    for (var i = 0; i < 6; i++) {
      var cx = x + (r() - 0.5) * len, cy = y + (r() - 0.5) * th * 2;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, th / len * 3);
      ctx.fillStyle = rg(ctx, 0, 0, 0, len * 0.4, [[0, rgba(col, al)], [1, rgba(col, 0)]]);
      ctx.fillRect(-len * 0.4, -len * 0.4, len * 0.8, len * 0.8); ctx.restore();
    }
  }
  function haze(ctx, x0, y0, x1, y1, col, a) {
    var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = Math.max(1, (y1 - y0) / 2);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx);
    ctx.fillStyle = rg(ctx, 0, 0, 0, rx, [[0, rgba(col, a)], [0.6, rgba(col, a * 0.75)], [1, rgba(col, 0)]]);
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore();
  }
  var grainCv = null;
  function finish(ctx, w, h, gradeCol, gradeA, vig, grainA) {
    try {
      ctx.save();
      if (gradeCol) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = gradeA; ctx.fillStyle = gradeCol; ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      var R = Math.max(w, h) * 0.85;
      ctx.fillStyle = rg(ctx, w / 2, h * 0.5, R * 0.45, R, [[0, 'rgba(20,16,30,0)'], [1, 'rgba(20,16,30,' + vig + ')']]);
      ctx.fillRect(0, 0, w, h);
      if (!grainCv && typeof document !== 'undefined') {
        grainCv = document.createElement('canvas'); grainCv.width = grainCv.height = 128;
        var g = grainCv.getContext('2d'), id = g.createImageData(128, 128), r = rng(4242), i, v;
        for (i = 0; i < 128 * 128; i++) { v = (r() * 255) | 0; id.data[i * 4] = v; id.data[i * 4 + 1] = v; id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
        g.putImageData(id, 0, 0);
      }
      if (grainCv) { ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grainA; ctx.fillStyle = ctx.createPattern(grainCv, 'repeat'); ctx.fillRect(0, 0, w, h); }
      ctx.restore();
    } catch (e) { try { ctx.restore(); } catch (e2) {} }
  }
  function shafts(ctx, x, y, w, h, col, al, n, r, spread, dir) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < n; i++) {
      var a = dir + (r() - 0.5) * spread, wd = 0.02 + r() * 0.05, L = Math.max(w, h) * 1.2;
      ctx.fillStyle = lg(ctx, x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, [[0, rgba(col, al * (0.5 + r()))], [1, rgba(col, 0)]]);
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a - wd) * L, y + Math.sin(a - wd) * L);
      ctx.lineTo(x + Math.cos(a + wd) * L, y + Math.sin(a + wd) * L); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  /* batched short strokes: gen(i) -> [x0,y0,x1,y1,bucket] ; cols = [[style,width,alpha],...] */
  function batch(ctx, n, cols, gen) {
    var paths = [], i, k;
    for (k = 0; k < cols.length; k++) paths.push([]);
    for (i = 0; i < n; i++) { var s = gen(i); if (s) paths[s[4]].push(s); }
    ctx.save(); ctx.lineCap = 'round';
    for (k = 0; k < cols.length; k++) {
      var p = paths[k]; if (!p.length) continue;
      ctx.beginPath();
      for (i = 0; i < p.length; i++) {
        ctx.moveTo(p[i][0], p[i][1]);
        if (p[i].length > 5) ctx.quadraticCurveTo(p[i][5], p[i][6], p[i][2], p[i][3]); else ctx.lineTo(p[i][2], p[i][3]);
      }
      ctx.strokeStyle = cols[k][0]; ctx.lineWidth = cols[k][1]; ctx.globalAlpha = cols[k][2]; ctx.stroke();
    }
    ctx.restore();
  }
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

  /* ---------------- vegetation ---------------- */
  function bez(p0, p1, p2, t) { var m = 1 - t; return m * m * p0 + 2 * m * t * p1 + t * t * p2; }
  function palmTrunk(ctx, x, yb, H, lean, o) {
    var tx = x + lean * H, ty = yb - H, cx = x + lean * H * 0.05 + (o.bow || 0) * H, cy = yb - H * 0.5;
    var base = Math.max(1.1, H * 0.026), top = Math.max(0.7, H * 0.014), L = [], R = [], i, N = 26;
    for (i = 0; i <= N; i++) {
      var t = i / N, px = bez(x, cx, tx, t), py = bez(yb, cy, ty, t);
      var dx = bez(x, cx, tx, Math.min(1, t + 0.01)) - bez(x, cx, tx, Math.max(0, t - 0.01));
      var dy = bez(yb, cy, ty, Math.min(1, t + 0.01)) - bez(yb, cy, ty, Math.max(0, t - 0.01));
      var l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
      var wd = (base + (top - base) * Math.pow(t, 0.7)) * 0.5 + (t < 0.06 ? base * (0.06 - t) * 9 : 0);
      L.push([px + nx * wd, py + ny * wd]); R.push([px - nx * wd, py - ny * wd]);
    }
    ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
    for (i = 1; i <= N; i++) ctx.lineTo(L[i][0], L[i][1]);
    for (i = N; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
    ctx.closePath();
    ctx.fillStyle = lg(ctx, x - base, 0, x + base, 0, [[0, o.trunkLit || o.trunk], [0.55, o.trunk], [1, o.trunkDark || o.trunk]]);
    ctx.fill();
    if (o.trunkLit && H > 40) {
      ctx.save(); ctx.strokeStyle = o.trunkDark || 'rgba(0,0,0,0.25)'; ctx.globalAlpha = 0.35; ctx.lineWidth = Math.max(0.5, H * 0.003); ctx.beginPath();
      var step = Math.max(2, H * 0.012);
      for (var s = step; s < H * 0.97; s += step * (0.7 + 0.3 * Math.sin(s))) {
        var t2 = s / H, k = Math.round(t2 * N);
        ctx.moveTo(L[k][0], L[k][1]); ctx.lineTo(R[k][0], R[k][1] - step * 0.3);
      }
      ctx.stroke(); ctx.restore();
    }
    return [tx, ty];
  }
  function palmCrown(ctx, tx, ty, H, o, sway, seed) {
    var r = rng(seed), nf = o.nf || 15, fl = o.fl || 0.2, k, j, M = 14, F = [];
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (o.skirt) {
      ctx.strokeStyle = o.skirt; ctx.lineWidth = Math.max(0.8, H * 0.008); ctx.beginPath();
      for (k = 0; k < 11; k++) {
        var sa = PI * (0.25 + 0.5 * k / 10), sl = H * fl * 0.45 * (0.7 + r() * 0.5);
        ctx.moveTo(tx, ty + H * 0.01); ctx.quadraticCurveTo(tx + Math.cos(sa) * sl * 0.6, ty + sl * 0.15, tx + Math.cos(sa) * sl * 0.5, ty + sl);
      }
      ctx.stroke();
    }
    for (k = 0; k < nf; k++) {
      var u = (k + r() * 0.6) / nf, ang = -PI * 1.08 + u * PI * 1.16;
      var L = H * fl * (0.8 + r() * 0.4), horiz = Math.abs(Math.cos(ang));
      F.push({ ang: ang, L: L, lift: 0.25 + r() * 0.2 + (1 - horiz) * 0.3, droop: 0.7 + horiz * 0.7 + r() * 0.3, back: Math.sin(ang) < -0.75 || r() < 0.2, sw: sway * (0.6 + r() * 0.8) * L * 0.14 });
    }
    F.sort(function (a, b) { return (b.back ? 1 : 0) - (a.back ? 1 : 0); });
    for (k = 0; k < F.length; k++) {
      var f = F[k], pts = [];
      for (j = 0; j <= M; j++) {
        var s = j / M;
        pts.push([tx + Math.cos(f.ang) * f.L * s + f.sw * s * s, ty + Math.sin(f.ang) * f.L * s * 0.75 - f.lift * f.L * s + f.droop * f.L * s * s, s]);
      }
      var up = [], lo = [];
      for (j = 0; j <= M; j++) {
        var p = pts[j], q = pts[Math.min(M, j + 1)], pr = pts[Math.max(0, j - 1)];
        var dx = q[0] - pr[0], dy = q[1] - pr[1], dl = Math.sqrt(dx * dx + dy * dy) || 1; dx /= dl; dy /= dl;
        var hw = f.L * 0.2 * Math.pow(Math.sin(PI * Math.min(1, p[2] * 1.1 + 0.05)), 0.6) * (1 - p[2] * 0.35);
        var tooth = (j % 2) ? 1 : 0.55;
        up.push([p[0] + dx * hw * 0.25, p[1] - hw * 0.18]);
        lo.push([p[0] + dx * hw * 0.55 * tooth, p[1] + hw * tooth]);
      }
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (j = 0; j <= M; j++) ctx.lineTo(up[j][0], up[j][1]);
      for (j = M; j >= 0; j--) ctx.lineTo(lo[j][0], lo[j][1]);
      ctx.closePath();
      ctx.fillStyle = f.back ? o.frond : (o.frondLit || o.frond); ctx.fill();
      // leaflet ribs
      ctx.strokeStyle = f.back ? (o.frondLit || o.frond) : o.frond; ctx.globalAlpha = 0.6; ctx.lineWidth = Math.max(0.35, H * 0.002); ctx.beginPath();
      for (j = 1; j <= M; j++) { ctx.moveTo(pts[j][0], pts[j][1]); ctx.lineTo(lo[j][0], lo[j][1]); }
      ctx.stroke(); ctx.globalAlpha = 1;
      if (o.rim && !f.back) {
        ctx.strokeStyle = o.rim; ctx.globalAlpha = 0.55; ctx.lineWidth = Math.max(0.4, H * 0.003); ctx.beginPath();
        for (j = 0; j <= M; j++) { if (!j) ctx.moveTo(pts[j][0], pts[j][1]); else ctx.lineTo(pts[j][0], pts[j][1]); }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
    ctx.fillStyle = o.trunkDark || o.frond; ctx.beginPath(); ctx.arc(tx, ty + H * 0.006, Math.max(1, H * 0.014), 0, TAU); ctx.fill();
    ctx.restore();
  }
  function palm(ctx, x, yb, H, lean, o, seed) {
    var t = palmTrunk(ctx, x, yb, H, lean, o);
    if (o.crown !== false) palmCrown(ctx, t[0], t[1], H, o, 0, seed);
    return t;
  }
  function conifer(ctx, x, yb, H, W, dark, lit, r, litSide) {
    var n = Math.max(5, Math.min(16, Math.round(H / 4))), i, side = litSide || 1;
    ctx.fillStyle = dark;
    ctx.fillRect(x - Math.max(0.5, W * 0.04), yb - H * 0.15, Math.max(1, W * 0.08), H * 0.15);
    var tiers = [];
    for (i = 0; i < n; i++) {
      var t = i / n, y = yb - H * (0.08 + 0.92 * t), wd = W * 0.5 * Math.pow(1 - t, 0.85) * (0.85 + r() * 0.3) + W * 0.04;
      var th = H / n * 1.9;
      tiers.push([y, wd, th]);
    }
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      var T = tiers[i];
      ctx.moveTo(x, T[0] - T[2]);
      ctx.lineTo(x - T[1] * 0.45, T[0] - T[2] * 0.35);
      ctx.lineTo(x - T[1], T[0] + T[2] * 0.12);
      ctx.lineTo(x - T[1] * 0.6, T[0] - T[2] * 0.02);
      ctx.lineTo(x - T[1] * 0.3, T[0] + T[2] * 0.1);
      ctx.lineTo(x, T[0] - T[2] * 0.05);
      ctx.lineTo(x + T[1] * 0.3, T[0] + T[2] * 0.1);
      ctx.lineTo(x + T[1] * 0.6, T[0] - T[2] * 0.02);
      ctx.lineTo(x + T[1], T[0] + T[2] * 0.12);
      ctx.lineTo(x + T[1] * 0.45, T[0] - T[2] * 0.35);
      ctx.closePath();
    }
    ctx.fill();
    if (lit) {
      ctx.beginPath();
      for (i = 0; i < n; i++) {
        var U = tiers[i];
        ctx.moveTo(x + side * U[1] * 0.08, U[0] - U[2] * 0.9);
        ctx.lineTo(x + side * U[1] * 0.5, U[0] - U[2] * 0.3);
        ctx.lineTo(x + side * U[1] * 0.95, U[0] + U[2] * 0.05);
        ctx.lineTo(x + side * U[1] * 0.4, U[0] - U[2] * 0.12);
        ctx.closePath();
      }
      ctx.fillStyle = lit; ctx.fill();
    }
  }
  function grassField(ctx, w, h, y0, y1, n, cols, r, s, lean) {
    batch(ctx, n, cols, function () {
      var y = y0 + Math.pow(r(), 0.8) * (y1 - y0), p = (y - y0) / (y1 - y0);
      var x = r() * w, L = (1.5 + p * 7 + r() * 3) * s, b = Math.floor(r() * cols.length);
      var lx = (lean || 0) * L + (r() - 0.5) * L * 0.6;
      return [x, y, x + lx, y - L, b, x + lx * 0.2, y - L * 0.6];
    });
  }

  /* ======================= SAN DIEGO ======================= */
  function sdLayout(w, h) {
    var port = h / w > 1.15;
    return { hz: h * 0.45, shore: h * 0.565, s: sc(w, h), port: port, bluffX: w * (port ? 0.3 : 0.24) };
  }
  SC.sandiego = {
    paint: function (ctx, w, h) {
      try {
        var r = rng(1101), L = sdLayout(w, h), hz = L.hz, s = L.s, i, x, y;
        // sky
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, [[0, '#1f6fc4'], [0.35, '#4a97dd'], [0.7, '#9fcdef'], [0.92, '#d6ecf6'], [1, '#eef5f1']]);
        ctx.fillRect(0, 0, w, hz + 2);
        glow(ctx, w * 0.84, h * 0.07, Math.max(w, h) * 0.55, '#fff6dc', 0.55);
        glow(ctx, w * 0.84, h * 0.07, w * 0.08, '#ffffff', 0.95);
        for (i = 0; i < 5; i++) wisp(ctx, w * (0.1 + r() * 0.8), h * (0.06 + r() * 0.2), w * (0.18 + r() * 0.2), h * 0.012, '#ffffff', 0.18, r);
        // far hills (Point Loma / distant mesas)
        ridge(ctx, w * 0.25, w, 3, function (x) { return hz - h * 0.004 - h * 0.035 * fbm(x / w * 3, 11, 4) * clamp((x / w - 0.25) * 4, 0, 1); }, hz + 1, '#a9c3d6');
        ridge(ctx, w * 0.42, w * 0.78, 3, function (x) { return hz - h * 0.002 - h * 0.012 * fbm(x / w * 9, 12, 3); }, hz + 1, '#97b3c6');
        // downtown skyline across the bay
        var sx0 = w * (L.port ? 0.28 : 0.27), sx1 = w * (L.port ? 0.66 : 0.6), base = hz - h * 0.002;
        var bl = [];
        for (x = sx0; x < sx1;) {
          var c = (x - sx0) / (sx1 - sx0), bw = (4 + r() * 8) * s, bump = Math.pow(Math.sin(c * PI), 0.8);
          var bh = h * (0.03 + bump * (0.1 + r() * 0.08)) + (r() < 0.15 ? h * 0.04 : 0);
          bl.push([x, bw, bh, r()]); x += bw * (0.55 + r() * 0.5);
        }
        bl.sort(function (a, b) { return a[3] - b[3]; });
        for (i = 0; i < bl.length; i++) {
          var B = bl[i], bx = B[0], bww = B[1], bhh = B[2], far = B[3] < 0.4;
          var tone = far ? ['#8fb7c6', '#7aa3b6', '#6890a4'] : (B[3] > 0.75 ? ['#bfe4e6', '#5fa6b6', '#2f6f88'] : ['#a6d2dc', '#4f93ad', '#2d607c']);
          ctx.fillStyle = lg(ctx, 0, base - bhh, 0, base, [[0, tone[0]], [0.5, tone[1]], [1, tone[2]]]);
          ctx.beginPath();
          var roof = B[3] * 7 | 0;
          ctx.moveTo(bx, base); ctx.lineTo(bx, base - bhh);
          if (roof === 1) { ctx.lineTo(bx + bww * 0.5, base - bhh - bww * 0.7); }
          else if (roof === 2) { ctx.lineTo(bx + bww * 0.3, base - bhh); ctx.lineTo(bx + bww * 0.3, base - bhh - bww * 0.5); ctx.lineTo(bx + bww * 0.7, base - bhh - bww * 0.5); ctx.lineTo(bx + bww * 0.7, base - bhh); }
          else if (roof === 3) { ctx.lineTo(bx + bww, base - bhh - bww * 0.45); }
          ctx.lineTo(bx + bww, base - bhh); ctx.lineTo(bx + bww, base); ctx.closePath(); ctx.fill();
          // lit glass side + shade side
          ctx.fillStyle = 'rgba(255,250,235,0.28)'; ctx.fillRect(bx + bww * 0.62, base - bhh, bww * 0.38, bhh);
          ctx.fillStyle = 'rgba(20,50,70,0.22)'; ctx.fillRect(bx, base - bhh, bww * 0.22, bhh);
          // floor lines
          ctx.fillStyle = 'rgba(230,250,255,0.18)';
          for (y = base - bhh + 2; y < base - 1; y += Math.max(1.4, 2 * s)) ctx.fillRect(bx + 0.5, y, bww - 1, 0.5);
          if (B[3] > 0.6) { ctx.fillStyle = 'rgba(255,255,240,0.5)'; ctx.fillRect(bx + bww * 0.7, base - bhh * (0.4 + B[3] * 0.4), bww * 0.3, bhh * 0.12); }
        }
        haze(ctx, sx0 - 20 * s, hz - h * 0.3, sx1 + 20 * s, hz + h * 0.04, '#d6ecf6', 0.32);
        ctx.fillStyle = '#6f8f9c'; ctx.fillRect(w * 0.18, base - 0.5 * s, w * 0.6, 1.6 * s);
        // water
        var wy1 = L.shore;
        ctx.fillStyle = lg(ctx, 0, hz, 0, wy1, [[0, '#7fb5d6'], [0.12, '#4d97c8'], [0.5, '#2b7fb4'], [0.8, '#2f9cb3'], [1, '#62c2c0']]);
        ctx.fillRect(0, hz, w, wy1 - hz + 2);
        // sky reflection sheen
        ctx.fillStyle = lg(ctx, 0, hz, 0, hz + h * 0.05, [[0, 'rgba(230,245,250,0.5)'], [1, 'rgba(230,245,250,0)']]);
        ctx.fillRect(0, hz, w, h * 0.05);
        // skyline reflection
        ctx.save(); ctx.globalAlpha = 0.18;
        for (i = 0; i < bl.length; i++) { ctx.fillStyle = bl[i][3] > 0.6 ? '#d8f0f0' : '#2c5f78'; ctx.fillRect(bl[i][0], hz, bl[i][1] * 0.8, Math.min(h * 0.04, bl[i][2] * 0.35)); }
        ctx.restore();
        // ripple texture
        batch(ctx, 2600, [['#e6f6fb', 0.6 * s, 0.35], ['#1d5f8e', 0.7 * s, 0.3], ['#9fdbe6', 0.6 * s, 0.35]], function () {
          var p = Math.pow(r(), 1.2), yy = hz + p * (wy1 - hz), xx = r() * w, l = (1 + p * 9 + r() * 4) * s;
          return [xx, yy, xx + l, yy, (r() * 3) | 0];
        });
        // sun glitter column
        dots(ctx, 500, [['#ffffff', 0.85], ['#fff3c8', 0.6]], function () {
          var p = r(), yy = hz + p * (wy1 - hz) * 0.9, xx = w * 0.84 + (r() - 0.5) * w * (0.05 + p * 0.3) * (0.4 + r());
          return [xx, yy, (0.3 + r() * 0.7 * (0.3 + p)) * s, r() < 0.5 ? 0 : 1];
        });
        // sailboats
        for (i = 0; i < 4; i++) {
          var bx2 = w * (0.62 + i * 0.07 + r() * 0.03), by = hz + h * (0.006 + r() * 0.02), ss = (3 + r() * 3) * s * (1 + (by - hz) / h * 8);
          if (L.port && i > 2) continue;
          ctx.fillStyle = '#fbfbf6'; ctx.beginPath(); ctx.moveTo(bx2, by - ss * 1.6); ctx.lineTo(bx2 + ss * 0.7, by - ss * 0.15); ctx.lineTo(bx2, by - ss * 0.15); ctx.fill();
          ctx.fillStyle = '#dfe6ea'; ctx.beginPath(); ctx.moveTo(bx2 - 0.4, by - ss * 1.2); ctx.lineTo(bx2 - ss * 0.45, by - ss * 0.2); ctx.lineTo(bx2 - 0.4, by - ss * 0.2); ctx.fill();
          ctx.fillStyle = '#2e4a5c'; ctx.fillRect(bx2 - ss * 0.5, by - ss * 0.15, ss * 1.25, ss * 0.18);
          ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(bx2 - ss * 0.2, by + ss * 0.1, ss * 0.6, ss * 0.5);
        }
        // Coronado-style curved bridge
        var bxA = -w * 0.03, bxB = w * (L.port ? 0.74 : 0.66), yA = hz + h * 0.022, yB = hz + h * 0.002, rise = h * (L.port ? 0.11 : 0.125), N = 120;
        function deck(t) { var yy = lerp(yA, yB, t) - rise * Math.pow(Math.sin(PI * Math.pow(t, 0.85)), 1.4); return [lerp(bxA, bxB, t), yy]; }
        function wl(t) { return lerp(yA, yB, t) + h * 0.004; }
        // pillars + reflections
        for (i = 1; i < 28; i++) {
          var tt = i / 28, D = deck(tt), wy = wl(tt), th = Math.max(1, (1 - tt) * 3.2 * s + 0.8 * s);
          ctx.fillStyle = 'rgba(40,90,140,0.25)'; ctx.fillRect(D[0] - th * 0.5, wy, th, (wy - D[1]) * 0.5);
          ctx.fillStyle = lg(ctx, D[0] - th, 0, D[0] + th, 0, [[0, '#4f93cc'], [0.5, '#2f6faa'], [1, '#235a8c']]);
          ctx.fillRect(D[0] - th * 0.5, D[1], th, wy - D[1]);
          if (th > 1.5) { ctx.fillStyle = '#7fb7e0'; ctx.fillRect(D[0] - th * 0.5, D[1], th * 0.3, wy - D[1]); }
        }
        // deck girder
        ctx.beginPath();
        for (i = 0; i <= N; i++) { var Dp = deck(i / N); if (!i) ctx.moveTo(Dp[0], Dp[1]); else ctx.lineTo(Dp[0], Dp[1]); }
        for (i = N; i >= 0; i--) { var Dq = deck(i / N), dt = (4.2 - 2.6 * i / N) * s; ctx.lineTo(Dq[0], Dq[1] + dt); }
        ctx.closePath(); ctx.fillStyle = '#2a69a8'; ctx.fill();
        ctx.beginPath();
        for (i = 0; i <= N; i++) { var De = deck(i / N); if (!i) ctx.moveTo(De[0], De[1]); else ctx.lineTo(De[0], De[1]); }
        ctx.strokeStyle = '#a9d4f2'; ctx.lineWidth = Math.max(0.7, 1.1 * s); ctx.stroke();
        ctx.beginPath();
        for (i = 0; i <= N; i++) { var Du = deck(i / N), du = (4.2 - 2.6 * i / N) * s; if (!i) ctx.moveTo(Du[0], Du[1] + du); else ctx.lineTo(Du[0], Du[1] + du); }
        ctx.strokeStyle = '#174775'; ctx.lineWidth = Math.max(0.6, 0.9 * s); ctx.stroke();
        // breaking wave bands (static)
        var bands = [0.505, 0.527, 0.548];
        for (i = 0; i < bands.length; i++) {
          var by0 = h * bands[i];
          ctx.beginPath(); ctx.moveTo(0, by0 + h * 0.012);
          for (x = 0; x <= w; x += 4) ctx.lineTo(x, by0 - h * 0.004 * fbm(x / w * 6, 20 + i, 3));
          ctx.lineTo(w, by0 + h * 0.012); ctx.closePath();
          ctx.fillStyle = lg(ctx, 0, by0 - h * 0.006, 0, by0 + h * 0.012, [[0, 'rgba(255,255,255,0.9)'], [0.35, 'rgba(225,245,248,0.55)'], [1, 'rgba(120,200,210,0)']]);
          ctx.fill();
          ctx.fillStyle = 'rgba(20,80,110,0.18)'; ctx.fillRect(0, by0 - h * 0.012, w, h * 0.007);
        }
        dots(ctx, 900, [['#ffffff', 0.7]], function () { var bb = bands[(r() * 3) | 0] * h; return [r() * w, bb + (r() - 0.3) * h * 0.012, (0.3 + r() * 0.9) * s, 0]; });
        // wet sand + swash
        var ws = L.shore;
        ctx.fillStyle = lg(ctx, 0, ws - h * 0.004, 0, ws + h * 0.05, [[0, '#cfe3dc'], [0.15, '#b59f7c'], [0.6, '#c9ad80'], [1, '#e2c695']]);
        ctx.fillRect(0, ws - h * 0.004, w, h * 0.06);
        ctx.fillStyle = 'rgba(200,230,245,0.35)'; ctx.fillRect(0, ws, w, h * 0.012);
        ctx.beginPath(); ctx.moveTo(0, ws);
        for (x = 0; x <= w; x += 4) ctx.lineTo(x, ws + h * 0.006 * fbm(x / w * 5, 33, 3));
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.2 * s; ctx.stroke();
        // dry sand
        var dy0 = ws + h * 0.045;
        ctx.fillStyle = lg(ctx, 0, dy0, 0, h, [[0, '#ecd3a0'], [0.35, '#f2dcae'], [0.75, '#e8c995'], [1, '#d7b17c']]);
        ctx.fillRect(0, dy0, w, h - dy0);
        ctx.fillStyle = lg(ctx, 0, dy0 - h * 0.015, 0, dy0 + h * 0.01, [[0, 'rgba(236,211,160,0)'], [1, 'rgba(236,211,160,1)']]);
        ctx.fillRect(0, dy0 - h * 0.015, w, h * 0.025);
        // big soft light pools
        for (i = 0; i < 6; i++) glow(ctx, w * r(), lerp(dy0, h, r()), w * 0.25, i % 2 ? '#fff4d6' : '#c9a473', 0.18);
        // ripples
        batch(ctx, 2200, [['#fff3d6', 0.8 * s, 0.55], ['#b58f5f', 0.8 * s, 0.35], ['#d9b783', 1 * s, 0.4]], function () {
          var p = Math.pow(r(), 0.9), yy = dy0 + p * (h - dy0), xx = r() * w, l = (3 + p * 12 + r() * 6) * s;
          var b = (r() * 3) | 0;
          return [xx, yy, xx + l, yy + (r() - 0.5) * l * 0.1, b, xx + l * 0.5, yy - l * (0.08 + p * 0.06)];
        });
        dots(ctx, 4500, [['#8c6c48', 0.35], ['#fff8e6', 0.5], ['#c79e6c', 0.4]], function () {
          var yy = dy0 + Math.pow(r(), 0.8) * (h - dy0); return [r() * w, yy, (0.25 + r() * 0.5 * (1 + (yy - dy0) / h * 2)) * s, (r() * 3) | 0];
        });
        // sandstone bluffs (left) with Torrey pines
        var bX = L.bluffX, topY = h * (L.port ? 0.27 : 0.22);
        function bluffTop(x) { var u = x / bX; return topY + h * 0.04 * fbm(x / w * 8, 41, 4) + Math.pow(Math.max(0, u - 0.55) / 0.45, 1.6) * (L.shore - topY - h * 0.01); }
        ctx.save();
        ridge(ctx, -2, bX * 1.05, 2, function (x) { return Math.min(bluffTop(x), L.shore + h * 0.004); }, L.shore + h * 0.006, null);
        ctx.fillStyle = lg(ctx, 0, topY, 0, L.shore, [[0, '#e9bd78'], [0.4, '#d29f5c'], [0.8, '#b9824a'], [1, '#a67445']]); ctx.fill();
        ctx.clip();
        ctx.fillStyle = lg(ctx, 0, 0, bX, 0, [[0, 'rgba(120,70,40,0.25)'], [0.6, 'rgba(255,230,180,0.15)'], [1, 'rgba(255,240,200,0.35)']]); ctx.fillRect(0, 0, bX * 1.1, h);
        // strata
        for (i = 0; i < 14; i++) { var sy = topY + h * 0.02 + i * h * 0.022; ctx.fillStyle = i % 2 ? 'rgba(255,235,190,0.18)' : 'rgba(140,85,45,0.16)'; ctx.fillRect(0, sy + Math.sin(i) * 2, bX * 1.1, h * (0.006 + (i % 3) * 0.003)); }
        // gullies / erosion flutes
        for (i = 0; i < 9; i++) { var gx = bX * (0.05 + i * 0.1 + r() * 0.05); ctx.fillStyle = lg(ctx, gx - 6 * s, 0, gx + 6 * s, 0, [[0, 'rgba(255,235,190,0)'], [0.4, 'rgba(255,235,190,0.35)'], [0.6, 'rgba(110,65,35,0.35)'], [1, 'rgba(110,65,35,0)']]); ctx.fillRect(gx - 6 * s, topY, 12 * s, L.shore - topY); }
        batch(ctx, 500, [['#7a4e2c', 0.8 * s, 0.2], ['#fff0c8', 0.7 * s, 0.25], ['#a86c3c', 1.4 * s, 0.15]], function () {
          var xx = r() * bX * 1.05, ty = bluffTop(xx), yy = ty + r() * (L.shore - ty), l = (2 + r() * 8) * s;
          return [xx, yy, xx + (r() - 0.5) * 2 * s, yy + l, (r() * 3) | 0];
        });
        // cast shadow at the base / alcoves
        for (i = 0; i < 7; i++) glow(ctx, r() * bX, lerp(topY + h * 0.08, L.shore, r()), 14 * s, '#6e4225', 0.35);
        ctx.restore();
        // scrub on top edge
        dots(ctx, 380, [['#5c6b3a', 0.9], ['#8a9454', 0.85], ['#3e4a2a', 0.8]], function () {
          var xx = r() * bX * 0.85; return [xx, bluffTop(xx) + r() * 3 * s, (0.8 + r() * 1.8) * s, (r() * 3) | 0];
        });
        // Torrey pines: twisted trunks + clumped needle tufts
        var np = L.port ? 3 : 4;
        for (i = 0; i < np; i++) {
          var px2 = bX * (0.08 + i * 0.22 + r() * 0.06), py2 = bluffTop(px2) + 2 * s, tH = h * (0.07 + r() * 0.05) * (L.port ? 0.9 : 1);
          ctx.strokeStyle = '#4a3324'; ctx.lineCap = 'round';
          var tops = [];
          for (var b2 = 0; b2 < 4; b2++) {
            var ang = -PI / 2 + (b2 - 1.5) * 0.55 + (r() - 0.5) * 0.4, len = tH * (0.6 + r() * 0.5);
            var ex2 = px2 + Math.cos(ang) * len * 1.2, ey2 = py2 + Math.sin(ang) * len;
            ctx.lineWidth = Math.max(0.8, tH * 0.05); ctx.beginPath(); ctx.moveTo(px2, py2);
            ctx.quadraticCurveTo(px2 + (r() - 0.5) * tH * 0.5, py2 - len * 0.5, ex2, ey2); ctx.stroke();
            tops.push([ex2, ey2]);
          }
          for (var tq = 0; tq < tops.length; tq++) {
            var tx2 = tops[tq][0], ty2 = tops[tq][1], cr = tH * (0.28 + r() * 0.15);
            for (var cl = 0; cl < 7; cl++) {
              var ox = tx2 + (r() - 0.5) * cr * 1.8, oy = ty2 + (r() - 0.5) * cr * 0.6;
              ctx.fillStyle = '#2f4a2c'; ctx.beginPath(); ctx.ellipse(ox, oy, cr * 0.55, cr * 0.32, 0, 0, TAU); ctx.fill();
              ctx.fillStyle = '#5d7d42'; ctx.beginPath(); ctx.ellipse(ox + cr * 0.12, oy - cr * 0.12, cr * 0.38, cr * 0.18, 0, 0, TAU); ctx.fill();
            }
            batch(ctx, 50, [['#86a35a', 0.6 * s, 0.7], ['#22381f', 0.6 * s, 0.7]], function () {
              var a = r() * TAU, rr2 = cr * (0.4 + r() * 0.7), qx = tx2 + Math.cos(a) * rr2 * 1.1, qy = ty2 + Math.sin(a) * rr2 * 0.45;
              return [qx, qy, qx + Math.cos(a) * 2.5 * s, qy + Math.sin(a) * 1.5 * s - 1 * s, Math.sin(a) < 0 ? 0 : 1];
            });
          }
        }
        // bluff base shadow on sand
        haze(ctx, -bX * 0.4, L.shore - h * 0.01, bX * 1.2, L.shore + h * 0.07, '#7a5030', 0.25);
        // pier (right) receding to the horizon
        var pNearX = w * 1.04, pFarX = w * (L.port ? 0.6 : 0.64), pNearY = h * 0.49, pFarY = hz + h * 0.012;
        var gNear = L.shore + h * 0.035, gFar = hz + h * 0.02;
        function pierAt(u) { var e = Math.pow(u, 0.55); return { x: lerp(pNearX, pFarX, e), y: lerp(pNearY, pFarY, e), g: lerp(gNear, gFar, e), k: 1 - e }; }
        // pilings
        ctx.lineCap = 'butt';
        var prev = null;
        for (i = 0; i <= 44; i++) {
          var P0 = pierAt(i / 44), pw = Math.max(0.7, P0.k * 3.6 * s + 0.4);
          ctx.fillStyle = '#5b4535'; ctx.fillRect(P0.x - pw / 2, P0.y, pw, P0.g - P0.y);
          ctx.fillStyle = 'rgba(255,230,190,0.5)'; ctx.fillRect(P0.x - pw / 2, P0.y, pw * 0.35, P0.g - P0.y);
          ctx.fillStyle = 'rgba(30,60,80,0.25)'; ctx.fillRect(P0.x - pw / 2, P0.g, pw, (P0.g - P0.y) * 0.25);
          if (prev && i % 1 === 0) {
            ctx.strokeStyle = 'rgba(70,52,40,0.7)'; ctx.lineWidth = Math.max(0.4, pw * 0.3); ctx.beginPath();
            ctx.moveTo(prev.x, prev.y + (prev.g - prev.y) * 0.15); ctx.lineTo(P0.x, P0.y + (P0.g - P0.y) * 0.6);
            ctx.moveTo(prev.x, prev.y + (prev.g - prev.y) * 0.6); ctx.lineTo(P0.x, P0.y + (P0.g - P0.y) * 0.15); ctx.stroke();
          }
          prev = P0;
        }
        // deck
        ctx.beginPath();
        for (i = 0; i <= 30; i++) { var Pd = pierAt(i / 30); if (!i) ctx.moveTo(Pd.x, Pd.y); else ctx.lineTo(Pd.x, Pd.y); }
        for (i = 30; i >= 0; i--) { var Pe = pierAt(i / 30); ctx.lineTo(Pe.x, Pe.y + Pe.k * 6 * s + 1); }
        ctx.closePath(); ctx.fillStyle = '#6b513c'; ctx.fill();
        // rail
        ctx.strokeStyle = '#d9c6a8'; ctx.lineWidth = Math.max(0.5, 0.9 * s); ctx.beginPath();
        for (i = 0; i <= 30; i++) { var Pr = pierAt(i / 30); var rh = Pr.k * 7 * s + 1.2; if (!i) ctx.moveTo(Pr.x, Pr.y - rh); else ctx.lineTo(Pr.x, Pr.y - rh); }
        ctx.stroke(); ctx.beginPath();
        for (i = 0; i <= 40; i++) { var Pp = pierAt(i / 40); ctx.moveTo(Pp.x, Pp.y); ctx.lineTo(Pp.x, Pp.y - (Pp.k * 7 * s + 1.2)); }
        ctx.lineWidth = Math.max(0.4, 0.6 * s); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,240,215,0.8)'; ctx.lineWidth = Math.max(0.4, 0.6 * s); ctx.beginPath();
        for (i = 0; i <= 30; i++) { var Pt = pierAt(i / 30); if (!i) ctx.moveTo(Pt.x, Pt.y); else ctx.lineTo(Pt.x, Pt.y); }
        ctx.stroke();
        // little shack at pier end + lamp posts
        var PE = pierAt(1);
        ctx.fillStyle = '#e8e2d6'; ctx.fillRect(PE.x - 2 * s, PE.y - 4.5 * s, 7 * s, 4.5 * s);
        ctx.fillStyle = '#7a8d99'; ctx.beginPath(); ctx.moveTo(PE.x - 3 * s, PE.y - 4.5 * s); ctx.lineTo(PE.x + 1.5 * s, PE.y - 7 * s); ctx.lineTo(PE.x + 6 * s, PE.y - 4.5 * s); ctx.fill();
        for (i = 1; i < 6; i++) { var Pl = pierAt(i / 6.3); ctx.fillStyle = '#3e3a36'; ctx.fillRect(Pl.x, Pl.y - Pl.k * 16 * s - 2, Math.max(0.5, Pl.k * 1.2 * s), Pl.k * 16 * s + 2); }
        // foam under pier where the waves break
        for (i = 0; i < bands.length; i++) {
          for (var q = 0; q < 26; q++) { var Pq = pierAt(r()); if (Math.abs(Pq.g - bands[i] * h) < h * 0.03) glow(ctx, Pq.x, bands[i] * h, 5 * s, '#ffffff', 0.5); }
        }
        // surfers
        var surf = [[0.42, 0.504], [0.53, 0.526], [0.36, 0.53]];
        for (i = 0; i < surf.length; i++) {
          var ux = w * surf[i][0], uy = h * surf[i][1] - 1, us = (2.2 + i * 0.5) * s;
          ctx.fillStyle = '#f4f1e8'; ctx.beginPath(); ctx.ellipse(ux, uy + us * 0.2, us * 1.6, us * 0.25, -0.05, 0, TAU); ctx.fill();
          ctx.fillStyle = '#1f2a33'; ctx.beginPath(); ctx.ellipse(ux, uy - us * 0.6, us * 0.35, us * 0.75, i === 0 ? 0.3 : 0, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.arc(ux + us * 0.1, uy - us * 1.55, us * 0.3, 0, TAU); ctx.fill();
          ctx.strokeStyle = '#1f2a33'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(ux - us * 0.9, uy - us * 0.9); ctx.lineTo(ux + us * 0.9, uy - us * 0.7); ctx.stroke();
          glow(ctx, ux + us * 1.5, uy, us * 2.2, '#ffffff', 0.6);
        }
        // boardwalk with tall skinny palms on the right edge
        var bwY = L.shore + h * 0.035;
        ctx.fillStyle = lg(ctx, 0, bwY - 3 * s, 0, bwY + 6 * s, [[0, '#d8d1c2'], [1, '#a99d88']]);
        ctx.beginPath(); ctx.moveTo(w * 0.76, bwY + 6 * s); ctx.lineTo(w * 0.8, bwY - 2 * s); ctx.lineTo(w, bwY - 6 * s); ctx.lineTo(w, bwY + 10 * s); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(80,70,60,0.6)'; ctx.lineWidth = 0.7 * s; ctx.beginPath();
        ctx.moveTo(w * 0.8, bwY - 5 * s); ctx.lineTo(w, bwY - 11 * s); ctx.stroke();
        for (x = w * 0.81; x < w; x += 6 * s) { ctx.moveTo(x, bwY - 5 * s - (x - w * 0.8) / (w * 0.2) * 6 * s); ctx.lineTo(x, bwY - 1.5 * s - (x - w * 0.8) / (w * 0.2) * 4 * s); }
        ctx.stroke();
        var po = { trunk: '#8a7258', trunkLit: '#d9c3a0', trunkDark: '#4f3f30', frond: '#2e5a33', frondLit: '#6f9a4a', rim: '#c9e08a', skirt: '#9a7a4e', nf: 16, fl: 0.17 };
        var palms = L.port ? [[0.8, 0.62, 0.02], [0.9, 0.82, -0.03], [0.98, 0.7, 0.04]] : [[0.79, 0.6, 0.03], [0.86, 0.78, -0.02], [0.93, 0.68, 0.05], [0.99, 0.86, -0.04]];
        for (i = 0; i < palms.length; i++) {
          var pxx = w * palms[i][0], pyy = bwY + (pxx - w * 0.8) / (w * 0.2) * -4 * s, pH = (pyy) * palms[i][1];
          ctx.fillStyle = 'rgba(90,70,45,0.28)'; ctx.beginPath(); ctx.ellipse(pxx + 10 * s, pyy + 2 * s, 12 * s, 2 * s, 0, 0, TAU); ctx.fill();
          palm(ctx, pxx, pyy, pH, palms[i][2], po, 300 + i);
        }
        // soft foreground shading & warm light
        ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, 'rgba(150,100,60,0)'], [1, 'rgba(150,100,60,0.22)']]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
        
        finish(ctx, w, h, '#ffd9a0', 0.18, 0.28, 0.06);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = sdLayout(w, h), s = L.s, i, k, x;
        ctx.save();
        // rolling foam lines
        ctx.lineCap = 'round';
        for (k = 0; k < 3; k++) {
          var ph = (t * 0.07 + k / 3) % 1, y = h * (0.495 + ph * 0.068), a = Math.sin(ph * PI) * 0.7;
          ctx.strokeStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')'; ctx.lineWidth = (0.8 + ph * 1.6) * s;
          ctx.beginPath();
          for (x = w * 0.22; x <= w * 1.0; x += w / 24) { var yy = y + Math.sin(x * 0.05 + t * 1.3 + k) * 1.2 * s; if (x === w * 0.22) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
          ctx.stroke();
        }
        // swash on sand
        var sw = (Math.sin(t * 0.6) * 0.5 + 0.5);
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1 * s; ctx.beginPath();
        for (x = 0; x <= w; x += w / 20) { var y2 = L.shore + h * 0.01 * sw + Math.sin(x * 0.03 + t * 0.4) * 1.5 * s; if (!x) ctx.moveTo(x, y2); else ctx.lineTo(x, y2); }
        ctx.stroke();
        // sparkles
        for (i = 0; i < 16; i++) {
          var a2 = Math.sin(t * 3.1 + i * 2.3); if (a2 < 0.6) continue;
          var sx = w * 0.84 + Math.sin(i * 12.9898) * w * 0.12, sy = L.hz + (0.15 + ((i * 0.37) % 1) * 0.6) * (L.shore - L.hz), sz = (a2 - 0.6) * 6 * s;
          ctx.fillStyle = 'rgba(255,255,255,' + ((a2 - 0.6) * 2.2).toFixed(3) + ')';
          ctx.fillRect(sx - sz, sy - 0.4 * s, sz * 2, 0.8 * s); ctx.fillRect(sx - 0.4 * s, sy - sz * 0.6, 0.8 * s, sz * 1.2);
        }
        // gulls
        ctx.strokeStyle = 'rgba(40,50,60,0.75)'; ctx.lineWidth = 1 * s;
        for (i = 0; i < 4; i++) {
          var gx = ((t * (14 + i * 4) * s + i * 170) % (w + 60)) - 30, gy = h * (0.12 + i * 0.06) + Math.sin(t * 0.8 + i) * 6 * s, f = Math.sin(t * 6 + i * 2) * 2.2 * s, gs = (3.5 - i * 0.4) * s;
          ctx.beginPath(); ctx.moveTo(gx - gs, gy - f); ctx.quadraticCurveTo(gx - gs * 0.4, gy - gs * 0.4, gx, gy); ctx.quadraticCurveTo(gx + gs * 0.4, gy - gs * 0.4, gx + gs, gy - f); ctx.stroke();
        }
        ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= LOS ANGELES ======================= */
  function laLayout(w, h) {
    var port = h / w > 1.15;
    return { hz: h * 0.45, road: h * 0.5, lawn: h * 0.545, s: sc(w, h), port: port };
  }
  var LA_NEAR = { trunk: '#3a2430', trunkLit: '#a8584a', trunkDark: '#24161f', frond: '#2a1a26', frondLit: '#3d2533', rim: '#f2a06a', skirt: '#4a2c2c', nf: 17, fl: 0.15 };
  function laNear(w, h) { var L = laLayout(w, h); return [[w * 0.035, h * 0.985, h * 0.86, 0.04, 701], [w * (L.port ? 0.95 : 0.965), h * 0.99, h * 0.92, -0.05, 702]]; }
  SC.losangeles = {
    paint: function (ctx, w, h) {
      try {
        var r = rng(2202), L = laLayout(w, h), hz = L.hz, s = L.s, i, x, y;
        var sunX = w * 0.27, sunY = h * 0.36;
        ctx.fillStyle = lg(ctx, 0, 0, 0, L.lawn, [[0, '#3e4f8a'], [0.18, '#7a6ea6'], [0.38, '#cf8aa0'], [0.58, '#f39f7e'], [0.78, '#f9c27f'], [1, '#f6d7a0']]);
        ctx.fillRect(0, 0, w, L.lawn);
        glow(ctx, sunX, sunY, Math.max(w, h) * 0.75, '#ffc98a', 0.55);
        glow(ctx, sunX, sunY, w * 0.18, '#fff0c0', 0.8);
        ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(sunX, sunY, w * 0.035, 0, TAU); ctx.fill();
        for (i = 0; i < 7; i++) wisp(ctx, w * r(), h * (0.08 + r() * 0.22), w * (0.25 + r() * 0.2), h * 0.01, i % 2 ? '#ffd2b0' : '#e7a0a8', 0.22, r);
        // distant mountains
        ridge(ctx, 0, w, 3, function (x) { return hz - h * 0.09 - h * 0.08 * fbm(x / w * 2.5, 51, 5); }, hz + 2, '#c88f98');
        ridge(ctx, 0, w, 3, function (x) { return hz - h * 0.04 - h * 0.06 * fbm(x / w * 4 + 3, 52, 5); }, hz + 2, '#b98088');
        // smog band
        ctx.fillStyle = lg(ctx, 0, hz - h * 0.12, 0, hz + h * 0.02, [[0, 'rgba(246,190,140,0)'], [0.6, 'rgba(240,180,130,0.55)'], [1, 'rgba(230,170,125,0.7)']]);
        ctx.fillRect(0, hz - h * 0.12, w, h * 0.14);
        // chaparral hills (nearer), left and right, textured
        function hillL(x) { var u = x / w; return hz - h * 0.11 * Math.max(0, 1 - u / 0.42) * (0.75 + 0.5 * fbm(x / w * 5, 61, 4)) - h * 0.012 * fbm(x / w * 20, 62, 3); }
        function hillR(x) { var u = (x / w - 0.62) / 0.38; return hz - h * 0.13 * Math.max(0, Math.min(1, u * 1.3)) * (0.7 + 0.5 * fbm(x / w * 4, 63, 4)) - h * 0.01 * fbm(x / w * 22, 64, 3); }
        [[hillL, 0, w * 0.45], [hillR, w * 0.6, w]].forEach(function (H2) {
          ctx.save();
          ridge(ctx, H2[1], H2[2], 2, H2[0], hz + 3, null);
          ctx.fillStyle = lg(ctx, 0, hz - h * 0.15, 0, hz, [[0, '#a8705e'], [1, '#8a5c52']]); ctx.fill(); ctx.clip();
          dots(ctx, 1400, [['#6a4a44', 0.55], ['#e3a16f', 0.4], ['#7d6a4a', 0.5]], function () {
            var xx = lerp(H2[1], H2[2], r()), top = H2[0](xx), yy = top + r() * (hz - top + 2); return [xx, yy, (0.4 + r() * 0.8) * s, (r() * 3) | 0];
          });
          ctx.fillStyle = 'rgba(244,190,140,0.35)'; ctx.fillRect(H2[1], hz - h * 0.2, H2[2] - H2[1], h * 0.2);
          ctx.restore();
        });
        // downtown towers in haze
        var cx0 = w * (L.port ? 0.42 : 0.47), cx1 = w * (L.port ? 0.8 : 0.73), base = hz + h * 0.005;
        var bl = [];
        for (x = cx0; x < cx1;) { var c = (x - cx0) / (cx1 - cx0), bw = (5 + r() * 9) * s, bump = Math.pow(Math.sin(c * PI), 0.7); bl.push([x, bw, h * (0.03 + bump * (0.09 + r() * 0.1)), r()]); x += bw * (0.6 + r() * 0.5); }
        // the two signature tall ones
        bl.push([lerp(cx0, cx1, 0.45), 11 * s, h * 0.27, 0.95, 'spire']);
        bl.push([lerp(cx0, cx1, 0.6), 10 * s, h * 0.24, 0.9, 'round']);
        bl.sort(function (a, b) { return a[3] - b[3]; });
        for (i = 0; i < bl.length; i++) {
          var B = bl[i], bx = B[0], bww = B[1], bhh = B[2], hz2 = 1 - B[3] * 0.5;
          ctx.fillStyle = lg(ctx, 0, base - bhh, 0, base, [[0, mix('#8a6a8a', '#e8a68a', hz2 * 0.6)], [1, mix('#9a6f7d', '#f0b08a', hz2 * 0.8)]]);
          ctx.beginPath(); ctx.moveTo(bx, base); ctx.lineTo(bx, base - bhh);
          if (B[4] === 'spire') { ctx.lineTo(bx + bww * 0.2, base - bhh - bww * 0.6); ctx.lineTo(bx + bww * 0.5, base - bhh - bww * 2.4); ctx.lineTo(bx + bww * 0.55, base - bhh - bww * 0.5); ctx.lineTo(bx + bww, base - bhh - bww * 0.2); }
          else if (B[4] === 'round') { ctx.lineTo(bx + bww * 0.15, base - bhh - bww * 0.3); ctx.lineTo(bx + bww * 0.3, base - bhh - bww * 0.45); ctx.lineTo(bx + bww * 0.7, base - bhh - bww * 0.45); ctx.lineTo(bx + bww * 0.85, base - bhh - bww * 0.3); }
          else if (B[3] > 0.7) ctx.lineTo(bx + bww * 0.5, base - bhh - bww * 0.4);
          ctx.lineTo(bx + bww, base - bhh); ctx.lineTo(bx + bww, base); ctx.closePath(); ctx.fill();
          // sun-facing glint on the left side
          ctx.fillStyle = 'rgba(255,215,160,' + (0.2 + B[3] * 0.35).toFixed(2) + ')'; ctx.fillRect(bx, base - bhh, bww * 0.35, bhh);
          if (B[3] > 0.85) glow(ctx, bx + bww * 0.2, base - bhh * 0.7, bww * 1.4, '#ffe6b0', 0.5);
          ctx.fillStyle = 'rgba(120,70,90,0.18)';
          for (y = base - bhh + 2; y < base; y += 2.2 * s) ctx.fillRect(bx + bww * 0.35, y, bww * 0.65, 0.5);
        }
        ctx.fillStyle = lg(ctx, 0, hz - h * 0.3, 0, hz, [[0, 'rgba(246,196,150,0.05)'], [1, 'rgba(246,196,150,0.55)']]); ctx.fillRect(cx0 - 10, hz - h * 0.3, cx1 - cx0 + 20, h * 0.3);
        // low sprawl
        dots(ctx, 500, [['#b6787a', 0.6], ['#f7c69a', 0.5]], function () { return [r() * w, hz - r() * h * 0.012 + h * 0.004, (0.6 + r() * 1.4) * s, (r() * 2) | 0]; });
        ctx.fillStyle = lg(ctx, 0, hz - h * 0.01, 0, L.road, [[0, '#b37a76'], [1, '#6d4552']]); ctx.fillRect(0, hz - h * 0.002, w, L.road - hz + 2);
        // tree line silhouettes behind boulevard
        for (i = 0; i < 70; i++) { var tx = r() * w, tr = (4 + r() * 8) * s; ctx.fillStyle = r() < 0.5 ? '#5a3646' : '#6e4250'; ctx.beginPath(); ctx.ellipse(tx, L.road - tr * 0.4, tr, tr * 0.7, 0, PI, TAU); ctx.fill(); }
        // boulevard
        ctx.fillStyle = lg(ctx, 0, L.road, 0, L.lawn, [[0, '#8c6266'], [0.5, '#b9817a'], [1, '#6e4b52']]); ctx.fillRect(0, L.road, w, L.lawn - L.road);
        ctx.fillStyle = lg(ctx, sunX - w * 0.4, 0, sunX + w * 0.4, 0, [[0, 'rgba(255,220,170,0)'], [0.5, 'rgba(255,220,170,0.55)'], [1, 'rgba(255,220,170,0)']]); ctx.fillRect(0, L.road + (L.lawn - L.road) * 0.3, w, (L.lawn - L.road) * 0.35);
        ctx.fillStyle = 'rgba(255,240,210,0.5)'; for (x = 0; x < w; x += 14 * s) ctx.fillRect(x, L.road + (L.lawn - L.road) * 0.5, 6 * s, 0.7 * s);
        // little cars with glints
        for (i = 0; i < 9; i++) {
          var carX = r() * w, lane = r() < 0.5 ? 0.3 : 0.65, carY = L.road + (L.lawn - L.road) * lane, cw = (6 + r() * 3) * s;
          ctx.fillStyle = ['#3b2c3a', '#5b4250', '#7a5560', '#2f2a35'][i % 4]; ctx.fillRect(carX, carY - 2.4 * s, cw, 2.4 * s);
          ctx.fillRect(carX + cw * 0.2, carY - 3.8 * s, cw * 0.55, 1.6 * s);
          glow(ctx, carX + cw * 0.3, carY - 3.4 * s, 3 * s, '#fff2c8', 0.8);
        }
        // row of very tall skinny palms along the boulevard
        var mid = { trunk: '#4a2b3a', trunkLit: '#8a4c4c', trunkDark: '#3a2230', frond: '#3a2232', frondLit: '#4c2c3c', rim: '#f0a070', nf: 14, fl: 0.13 };
        var spacing = w * (L.port ? 0.11 : 0.075), off = r() * spacing;
        for (x = off; x < w + spacing; x += spacing * (0.85 + r() * 0.3)) {
          var pH = h * (0.3 + r() * 0.13) * (L.port ? 0.9 : 1);
          palm(ctx, x, L.road + h * 0.004, pH, (r() - 0.5) * 0.06, mid, (x * 13) | 0);
        }
        // second, smaller distant row
        var far = { trunk: '#7a4a5a', frond: '#7a4a5a', frondLit: '#8a5464', nf: 11, fl: 0.13 };
        for (x = r() * 30; x < w; x += w * 0.045 * (0.7 + r() * 0.6)) palm(ctx, x, hz + h * 0.01, h * (0.12 + r() * 0.08), (r() - 0.5) * 0.08, far, (x * 7) | 0);
        // re-haze distant row slightly
        // lawn
        ctx.fillStyle = lg(ctx, 0, L.lawn, 0, h, [[0, '#9fa24a'], [0.25, '#7f9640'], [0.7, '#5f7e36'], [1, '#476730']]); ctx.fillRect(0, L.lawn, w, h - L.lawn);
        ctx.fillStyle = lg(ctx, 0, L.lawn - 1, 0, L.lawn + h * 0.012, [[0, '#d8c39a'], [1, 'rgba(216,195,154,0)']]); ctx.fillRect(0, L.lawn - 1, w, h * 0.012);
        // long palm shadows across the lawn (soft)
        ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = '#2a2a30';
        for (x = off; x < w + spacing * 3; x += spacing) {
          ctx.beginPath(); ctx.moveTo(x - 1 * s, L.lawn); ctx.lineTo(x + 2 * s, L.lawn); ctx.lineTo(x + w * 0.5, h); ctx.lineTo(x + w * 0.5 - 7 * s, h); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        // warm light pools
        for (i = 0; i < 6; i++) glow(ctx, w * r(), lerp(L.lawn + h * 0.05, h, r()), w * 0.28, '#ffd890', 0.2);
        grassField(ctx, w, h, L.lawn, h, 7000, [['#c2c065', 0.7 * s, 0.55], ['#4f6e2e', 0.7 * s, 0.55], ['#e9d48a', 0.6 * s, 0.5], ['#6f8a3a', 0.8 * s, 0.5]], r, s, 0.25);
        dots(ctx, 120, [['#f3e2a0', 0.7], ['#e8b0c8', 0.5]], function () { return [r() * w, lerp(L.lawn + h * 0.05, h, Math.pow(r(), 0.7)), (0.6 + r() * 0.6) * s, (r() * 2) | 0]; });
        // near palm trunks (crowns sway in overlay)
        var near = laNear(w, h);
        for (i = 0; i < near.length; i++) palmTrunk(ctx, near[i][0], near[i][1], near[i][2], near[i][3], LA_NEAR);
        
        ctx.fillStyle = lg(ctx, 0, h * 0.82, 0, h, [[0, 'rgba(60,30,50,0)'], [1, 'rgba(60,30,50,0.25)']]); ctx.fillRect(0, h * 0.82, w, h * 0.18);
        finish(ctx, w, h, '#ff9f70', 0.2, 0.32, 0.06);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = laLayout(w, h), s = L.s, i, x, near = laNear(w, h);
        ctx.save();
        // heat shimmer above the boulevard
        for (i = 0; i < 5; i++) {
          var y = L.road + (L.lawn - L.road) * (i / 5) - h * 0.01;
          ctx.strokeStyle = 'rgba(255,230,200,0.06)'; ctx.lineWidth = 1.2 * s; ctx.beginPath();
          for (x = 0; x <= w; x += w / 20) { var yy = y + Math.sin(x * 0.08 + t * 3 + i * 1.7) * 0.9 * s; if (!x) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
          ctx.stroke();
        }
        ctx.restore();
        for (i = 0; i < near.length; i++) {
          var P = near[i], tx = P[0] + P[3] * P[2], ty = P[1] - P[2];
          palmCrown(ctx, tx, ty, P[2], LA_NEAR, Math.sin(t * 0.9 + i * 1.3) * 0.8 + Math.sin(t * 2.1 + i) * 0.25, P[4]);
        }
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= SAN FRANCISCO ======================= */
  function sfLayout(w, h) {
    var port = h / w > 1.15;
    return { hz: h * 0.44, s: sc(w, h), port: port, tL: w * (port ? 0.2 : 0.24), tR: w * (port ? 0.62 : 0.6), ground: h * 0.55 };
  }
  var fogSprite = null;
  function getFog() {
    if (fogSprite || typeof document === 'undefined') return fogSprite;
    fogSprite = document.createElement('canvas'); fogSprite.width = 256; fogSprite.height = 96;
    var g = fogSprite.getContext('2d'), r = rng(77);
    for (var i = 0; i < 22; i++) {
      var x = 30 + r() * 196, y = 40 + r() * 30, rr = 18 + r() * 26;
      g.fillStyle = rg(g, x, y, 0, rr, [[0, 'rgba(255,255,255,0.45)'], [1, 'rgba(255,255,255,0)']]);
      g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    return fogSprite;
  }
  SC.sanfrancisco = {
    paint: function (ctx, w, h) {
      try {
        var r = rng(3303), L = sfLayout(w, h), hz = L.hz, s = L.s, i, x, y;
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, [[0, '#6f8daa'], [0.4, '#9fb4c6'], [0.8, '#cfd8dc'], [1, '#e4e6e2']]);
        ctx.fillRect(0, 0, w, hz + 2);
        glow(ctx, w * 0.78, h * 0.12, Math.max(w, h) * 0.5, '#fff3dc', 0.35);
        for (i = 0; i < 4; i++) cloud(ctx, w * (0.1 + r() * 0.85), h * (0.07 + r() * 0.1), w * 0.07, r, '#f4f4f0', '#9aa8b4', 0.35);
        // distant east-bay hills
        ridge(ctx, 0, w, 3, function (x) { return hz - h * 0.03 * fbm(x / w * 3, 71, 4) - h * 0.005; }, hz + 2, '#a9b6bf');
        // downtown skyline with a tall slender pyramid tower (right, behind the hill)
        var dk0 = w * (L.port ? 0.66 : 0.68), dk1 = w * 0.98, pyrX = w * (L.port ? 0.8 : 0.79);
        for (x = dk0; x < dk1;) {
          var bw = (5 + r() * 8) * s, bh = h * (0.05 + r() * 0.1 + Math.sin((x - dk0) / (dk1 - dk0) * PI) * 0.06);
          ctx.fillStyle = lg(ctx, 0, hz - bh, 0, hz, [[0, '#b9c3cc'], [1, '#93a1ad']]); ctx.fillRect(x, hz - bh, bw, bh + 2);
          ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x, hz - bh, bw * 0.3, bh);
          ctx.fillStyle = 'rgba(90,100,120,0.15)'; for (y = hz - bh + 2; y < hz; y += 2.2 * s) ctx.fillRect(x + bw * 0.3, y, bw * 0.7, 0.6);
          x += bw * (0.8 + r() * 0.4);
        }
        var pyT = h * (L.port ? 0.1 : 0.07), pyW = 11 * s;
        ctx.fillStyle = lg(ctx, pyrX - pyW, 0, pyrX + pyW, 0, [[0, '#f4f2ec'], [0.5, '#d9dbdc'], [0.52, '#b4bcc4'], [1, '#9aa6b2']]);
        ctx.beginPath(); ctx.moveTo(pyrX - pyW, hz); ctx.lineTo(pyrX - pyW * 0.12, pyT + h * 0.03); ctx.lineTo(pyrX, pyT); ctx.lineTo(pyrX + pyW * 0.12, pyT + h * 0.03); ctx.lineTo(pyrX + pyW, hz); ctx.closePath(); ctx.fill();
        // wings near base
        ctx.fillStyle = '#c7ccd0'; ctx.beginPath(); ctx.moveTo(pyrX - pyW * 0.95, hz - h * 0.12); ctx.lineTo(pyrX - pyW * 1.35, hz - h * 0.09); ctx.lineTo(pyrX - pyW * 1.35, hz); ctx.lineTo(pyrX - pyW * 0.9, hz); ctx.fill();
        ctx.fillStyle = 'rgba(110,120,135,0.22)'; for (y = pyT + h * 0.04; y < hz; y += 2 * s) { var hwp = lerp(pyW * 0.12, pyW, (y - pyT - h * 0.03) / (hz - pyT - h * 0.03)); ctx.fillRect(pyrX - hwp, y, hwp * 2, 0.6); }
        haze(ctx, dk0 - 20 * s, hz - h * 0.2, dk1 + 20 * s, hz + h * 0.06, '#d6dee4', 0.3);
        // Marin headland (left) and city hill (right) - back layers
        function marin(x) { var u = x / w; return h * 0.17 + h * 0.06 * fbm(x / w * 4, 72, 5) + Math.pow(Math.max(0, u - 0.05) / 0.38, 1.5) * h * 0.22; }
        ctx.save(); ridge(ctx, 0, w * 0.45, 2, function (x) { return Math.min(hz + 1, marin(x)); }, hz + 2, null);
        ctx.fillStyle = lg(ctx, 0, h * 0.15, 0, hz, [[0, '#7d9476'], [0.6, '#5f7a5e'], [1, '#4f6a55']]); ctx.fill(); ctx.clip();
        batch(ctx, 1400, [['#a4b48a', 0.8 * s, 0.4], ['#3f5a46', 0.9 * s, 0.4]], function () { var xx = r() * w * 0.45, tp = marin(xx), yy = tp + r() * (hz - tp); return [xx, yy, xx + (r() - 0.3) * 4 * s, yy + 2 * s, r() < 0.5 ? 0 : 1]; });
        ctx.fillStyle = 'rgba(210,220,225,0.3)'; ctx.fillRect(0, 0, w * 0.45, hz);
        ctx.restore();
        // fog bank pouring over the headland
        for (i = 0; i < 40; i++) {
          var fx = r() * w * 0.5, fy = marin(fx) - h * 0.01 + r() * h * 0.05, fr = (12 + r() * 22) * s;
          ctx.fillStyle = rg(ctx, fx, fy, 0, fr, [[0, 'rgba(250,252,252,0.55)'], [1, 'rgba(250,252,252,0)']]); ctx.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
        }
        // water
        ctx.fillStyle = lg(ctx, 0, hz, 0, L.ground, [[0, '#a3b5bf'], [0.25, '#6e8c9e'], [0.7, '#4d6f84'], [1, '#3f6176']]);
        ctx.fillRect(0, hz, w, L.ground - hz + 2);
        batch(ctx, 2200, [['#d6e2e6', 0.6 * s, 0.35], ['#33536a', 0.7 * s, 0.35]], function () { var p = r(), yy = hz + p * (L.ground - hz), xx = r() * w, l = (1.5 + p * 9) * s; return [xx, yy, xx + l, yy, r() < 0.5 ? 0 : 1]; });
        // small rocky island with lighthouse and long low building
        var isX = w * (L.port ? 0.4 : 0.42), isY = hz + h * 0.012, isW = w * (L.port ? 0.13 : 0.1), isH = h * 0.03;
        ctx.fillStyle = 'rgba(60,80,95,0.3)'; ctx.fillRect(isX - isW * 0.5, isY, isW, isH * 0.4);
        ctx.fillStyle = lg(ctx, 0, isY - isH, 0, isY, [[0, '#9c9a86'], [1, '#6c6e66']]);
        ctx.beginPath(); ctx.moveTo(isX - isW * 0.55, isY); ctx.lineTo(isX - isW * 0.45, isY - isH * 0.55); ctx.lineTo(isX - isW * 0.2, isY - isH * 0.8); ctx.lineTo(isX + isW * 0.3, isY - isH * 0.85); ctx.lineTo(isX + isW * 0.5, isY - isH * 0.5); ctx.lineTo(isX + isW * 0.58, isY); ctx.closePath(); ctx.fill();
        dots(ctx, 40, [['#5e7458', 0.8]], function () { return [isX + (r() - 0.5) * isW * 0.9, isY - isH * (0.4 + r() * 0.4), (0.6 + r()) * s, 0]; });
        ctx.fillStyle = '#d8d4c8'; ctx.fillRect(isX - isW * 0.28, isY - isH * 1.3, isW * 0.5, isH * 0.55);
        ctx.fillStyle = 'rgba(80,90,100,0.45)'; for (x = isX - isW * 0.26; x < isX + isW * 0.2; x += 2 * s) ctx.fillRect(x, isY - isH * 1.15, 0.8 * s, isH * 0.25);
        ctx.fillStyle = '#b8b4a8'; ctx.fillRect(isX - isW * 0.28, isY - isH * 1.32, isW * 0.5, 1 * s);
        ctx.fillStyle = '#f2f0ea'; ctx.fillRect(isX + isW * 0.27, isY - isH * 2.1, 2.2 * s, isH * 1.4);
        ctx.fillStyle = '#585e64'; ctx.fillRect(isX + isW * 0.27 - 0.4 * s, isY - isH * 2.25, 3 * s, 1.2 * s);
        glow(ctx, isX + isW * 0.27 + 1.1 * s, isY - isH * 2.3, 3 * s, '#fff6c0', 0.8);
        haze(ctx, isX - isW * 0.8, isY - isH * 3, isX + isW * 0.8, isY + isH * 0.5, '#c8d2da', 0.3);
        // bridge geometry
        var tL = L.tL, tR = L.tR, topL = h * (L.port ? 0.1 : 0.06), topR = h * (L.port ? 0.17 : 0.15), wL = hz + h * 0.015, wR = hz + h * 0.004;
        var dL = wL - (wL - topL) * 0.3, dR = wR - (wR - topR) * 0.3;
        var endX = w * 0.72, endY = dR + (dR - dL) * ((endX - tR) / (tR - tL)) * 0.6;
        function deckY(x) { if (x <= tL) return dL + (tL - x) / w * h * 0.03; if (x <= tR) return lerp(dL, dR, (x - tL) / (tR - tL)); return lerp(dR, endY, (x - tR) / (endX - tR)); }
        var red = '#c4452c', redD = '#8a2c1f', redL = '#e8774f';
        // reflections
        ctx.save(); ctx.globalAlpha = 0.25;
        [[tL, wL, topL, 7], [tR, wR, topR, 5]].forEach(function (T) { ctx.fillStyle = red; ctx.fillRect(T[0] - T[3] * s, T[1], T[3] * 2 * s, (T[1] - T[2]) * 0.35); });
        ctx.restore();
        // cables (back) function
        function cable(x0, y0, x1, y1, sag, lw, col) {
          ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + sag, x1, y1); ctx.stroke();
        }
        function cableY(x0, y0, x1, y1, sag, x) { var t = (x - x0) / (x1 - x0), cy = Math.max(y0, y1) + sag; return bez(y0, cy, y1, t); }
        var sagMain = (dL + dR) / 2 - Math.max(topL, topR) - h * 0.01;
        sagMain = sagMain * 1.9 - (Math.max(topL, topR) - Math.min(topL, topR));
        // suspenders
        ctx.strokeStyle = 'rgba(160,50,35,0.55)'; ctx.lineWidth = Math.max(0.4, 0.5 * s); ctx.beginPath();
        for (x = tL + 3 * s; x < tR; x += 3 * s) {
          var t2 = (x - tL) / (tR - tL);
          var tt = t2; // approximate param
          var cy2 = bez(topL + 2 * s, Math.max(topL, topR) + sagMain, topR + 2 * s, tt);
          ctx.moveTo(x, cy2); ctx.lineTo(x, deckY(x));
        }
        for (x = 0; x < tL; x += 3 * s) { var cy3 = lerp(dL - h * 0.01, topL + 2 * s, Math.pow(x / tL, 1.6)); ctx.moveTo(x, cy3); ctx.lineTo(x, deckY(x)); }
        for (x = tR + 3 * s; x < endX; x += 3 * s) { var cy4 = lerp(topR + 2 * s, endY - h * 0.005, Math.pow((x - tR) / (endX - tR), 0.6)); ctx.moveTo(x, cy4); ctx.lineTo(x, deckY(x)); }
        ctx.stroke();
        // main cables
        var cw = Math.max(1, 1.6 * s);
        ctx.lineCap = 'round';
        ctx.strokeStyle = redD; ctx.lineWidth = cw; ctx.beginPath(); ctx.moveTo(tL, topL + 2 * s); ctx.quadraticCurveTo((tL + tR) / 2, Math.max(topL, topR) + sagMain, tR, topR + 2 * s); ctx.stroke();
        ctx.strokeStyle = redL; ctx.lineWidth = cw * 0.4; ctx.stroke();
        ctx.strokeStyle = redD; ctx.lineWidth = cw * 1.1; ctx.beginPath(); ctx.moveTo(-5, dL - h * 0.012); ctx.quadraticCurveTo(tL * 0.6, dL - h * 0.01, tL, topL + 2 * s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tR, topR + 2 * s); ctx.quadraticCurveTo(tR + (endX - tR) * 0.45, endY - h * 0.01, endX, endY - h * 0.004); ctx.stroke();
        // deck
        ctx.beginPath(); ctx.moveTo(-5, deckY(-5)); for (x = 0; x <= endX; x += 4) ctx.lineTo(x, deckY(x));
        for (x = endX; x >= -5; x -= 4) ctx.lineTo(x, deckY(x) + (3.6 - 1.8 * x / w) * s);
        ctx.closePath(); ctx.fillStyle = red; ctx.fill();
        ctx.strokeStyle = redD; ctx.lineWidth = 0.7 * s; ctx.beginPath(); for (x = -5; x <= endX; x += 4) { var dy = deckY(x) + (3.6 - 1.8 * x / w) * s; if (x === -5) ctx.moveTo(x, dy); else ctx.lineTo(x, dy); } ctx.stroke();
        // truss ticks under deck
        ctx.strokeStyle = 'rgba(110,35,25,0.6)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (x = 0; x < endX; x += 2.5 * s) { ctx.moveTo(x, deckY(x) + 0.8 * s); ctx.lineTo(x + 1.2 * s, deckY(x) + (3.6 - 1.8 * x / w) * s); } ctx.stroke();
        // art-deco towers
        function towerDraw(cx, top, bot, k) {
          var legW = 3.6 * s * k, gap = 7 * s * k, Ht = bot - top;
          for (var side = -1; side <= 1; side += 2) {
            var lx = cx + side * gap * 0.5 - legW / 2;
            for (var tier = 0; tier < 4; tier++) {
              var y0 = top + Ht * [0, 0.22, 0.43, 0.65][tier], y1 = top + Ht * [0.22, 0.43, 0.65, 1.0][tier], inset = (3 - tier) * 0.35 * s * k;
              ctx.fillStyle = lg(ctx, lx - inset, 0, lx + legW + inset, 0, [[0, redL], [0.35, red], [1, redD]]);
              ctx.fillRect(lx - (side < 0 ? inset * 0.3 : inset * 0.3) - (3 - tier) * 0.1 * s, y0, legW + (3 - tier) * 0.2 * s + inset * 0.6, y1 - y0);
              ctx.fillStyle = 'rgba(80,20,15,0.35)'; ctx.fillRect(lx + legW * 0.55, y0 + 2 * s * k, legW * 0.2, (y1 - y0) - 4 * s * k);
            }
          }
          // portals
          var por = [0.0, 0.22, 0.43, 0.65];
          for (var p = 0; p < por.length; p++) {
            var py = top + Ht * por[p], ph = (p === 0 ? 4.5 : 3.2) * s * k;
            ctx.fillStyle = red; ctx.fillRect(cx - gap * 0.5, py, gap, ph);
            ctx.fillStyle = redD; ctx.fillRect(cx - gap * 0.5, py + ph - 0.8 * s, gap, 0.8 * s);
            ctx.fillStyle = 'rgba(80,20,15,0.45)'; for (var v = 0; v < 3; v++) ctx.fillRect(cx - gap * 0.35 + v * gap * 0.3, py + ph * 0.25, Math.max(0.5, 0.6 * s * k), ph * 0.5);
          }
          ctx.fillStyle = 'rgba(255,190,150,0.35)'; ctx.fillRect(cx - gap * 0.5 - legW * 0.5, top, legW * 0.25, Ht);
          // pier base
          ctx.fillStyle = '#9aa0a0'; ctx.fillRect(cx - gap * 0.7 - legW / 2, bot - 2.5 * s * k, gap * 1.4 + legW, 3 * s * k);
        }
        towerDraw(tR, topR, wR, 0.8);
        towerDraw(tL, topL, wL, 1.05);
        // fog through the towers and along the water
        for (i = 0; i < 46; i++) {
          var fx2 = r() * w, fy2 = lerp(dL, hz + h * 0.02, r()) - h * 0.02, fr2 = (14 + r() * 26) * s, fa = 0.25 + r() * 0.3;
          if (fx2 > w * 0.7) fa *= 0.4;
          ctx.fillStyle = rg(ctx, fx2, fy2, 0, fr2, [[0, 'rgba(246,248,248,' + fa.toFixed(2) + ')'], [1, 'rgba(246,248,248,0)']]); ctx.fillRect(fx2 - fr2, fy2 - fr2, fr2 * 2, fr2 * 2);
        }
        for (i = 0; i < 8; i++) { var fx3 = tR + (r() - 0.5) * w * 0.12, fy3 = topR + r() * h * 0.08, fr3 = (10 + r() * 14) * s; ctx.fillStyle = rg(ctx, fx3, fy3, 0, fr3, [[0, 'rgba(250,250,250,0.45)'], [1, 'rgba(250,250,250,0)']]); ctx.fillRect(fx3 - fr3, fy3 - fr3, fr3 * 2, fr3 * 2); }
        // steep hill street with stepped pastel Victorians (right)
        var hx0 = w * (L.port ? 0.62 : 0.66), slope = function (x) { return lerp(L.ground + h * 0.005, h * (L.port ? 0.33 : 0.3), clamp((x - hx0) / (w - hx0), 0, 1)); };
        ctx.fillStyle = lg(ctx, 0, h * 0.3, 0, L.ground, [[0, '#8c9a8e'], [1, '#5f7262']]);
        ctx.beginPath(); ctx.moveTo(hx0 - w * 0.03, L.ground + 4); ctx.lineTo(hx0, slope(hx0)); ctx.lineTo(w + 2, slope(w)); ctx.lineTo(w + 2, L.ground + 4); ctx.closePath(); ctx.fill();
        var pal = [['#f2d9a0', '#c98a5a'], ['#cfe0ea', '#6a7fa8'], ['#e9c3c8', '#8a5a7a'], ['#d4e4c8', '#5f8a6a'], ['#f6efe2', '#a85a4a'], ['#d9cde8', '#6a5a8a'], ['#f2c9a8', '#4f7a8a']];
        function vic(x, yb, hw, hh, ci, k) {
          var c = pal[ci % pal.length], body = c[0], trim = '#fbf8f0', accent = c[1];
          // foundation down to street
          ctx.fillStyle = '#9b9a92'; ctx.fillRect(x, yb - hh * 0.08, hw, hh * 0.08 + h * 0.03);
          ctx.fillStyle = lg(ctx, x, 0, x + hw, 0, [[0, mix(body, '#ffffff', 0.25)], [0.7, body], [1, mix(body, '#5a6070', 0.35)]]);
          ctx.fillRect(x, yb - hh, hw, hh * 0.92);
          // gable roof
          var gh = hw * 0.5;
          ctx.fillStyle = mix(accent, '#30343a', 0.35); ctx.beginPath(); ctx.moveTo(x - hw * 0.06, yb - hh); ctx.lineTo(x + hw * 0.5, yb - hh - gh); ctx.lineTo(x + hw * 1.06, yb - hh); ctx.closePath(); ctx.fill();
          ctx.fillStyle = mix(body, '#ffffff', 0.15); ctx.beginPath(); ctx.moveTo(x + hw * 0.1, yb - hh); ctx.lineTo(x + hw * 0.5, yb - hh - gh * 0.8); ctx.lineTo(x + hw * 0.9, yb - hh); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = trim; ctx.lineWidth = Math.max(0.5, hw * 0.035); ctx.beginPath(); ctx.moveTo(x + hw * 0.08, yb - hh); ctx.lineTo(x + hw * 0.5, yb - hh - gh * 0.82); ctx.lineTo(x + hw * 0.92, yb - hh); ctx.stroke();
          ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(x + hw * 0.5, yb - hh - gh * 0.35, hw * 0.08, 0, TAU); ctx.fill();
          ctx.fillStyle = trim; ctx.fillRect(x - hw * 0.04, yb - hh, hw * 1.08, Math.max(0.6, hw * 0.05));
          // two-storey bay window (left), windows, door with stoop
          var bx = x + hw * 0.06, bw = hw * 0.5, by0 = yb - hh * 0.86, by1 = yb - hh * 0.22;
          ctx.fillStyle = mix(body, '#ffffff', 0.35); ctx.fillRect(bx - hw * 0.04, by0, bw + hw * 0.08, by1 - by0);
          ctx.fillStyle = 'rgba(60,70,90,0.25)'; ctx.fillRect(bx + bw * 0.78, by0, bw * 0.3, by1 - by0);
          for (var fl2 = 0; fl2 < 2; fl2++) {
            var wy = by0 + (by1 - by0) * (fl2 * 0.5 + 0.08), wh = (by1 - by0) * 0.34;
            for (var p = 0; p < 3; p++) {
              ctx.fillStyle = trim; ctx.fillRect(bx + p * bw * 0.34, wy - 0.5, bw * 0.28 + 1, wh + 1);
              ctx.fillStyle = lg(ctx, 0, wy, 0, wy + wh, [[0, '#9fb6c8'], [1, '#3e4c62']]); ctx.fillRect(bx + p * bw * 0.34 + 0.5, wy, bw * 0.28, wh);
            }
            ctx.fillStyle = accent; ctx.fillRect(bx - hw * 0.05, wy + wh + 1, bw + hw * 0.1, Math.max(0.6, hw * 0.05));
            // right single window
            ctx.fillStyle = trim; ctx.fillRect(x + hw * 0.68, wy - 0.5, hw * 0.2 + 1, wh + 1);
            ctx.fillStyle = '#4a5a72'; ctx.fillRect(x + hw * 0.68 + 0.5, wy, hw * 0.2, wh);
          }
          ctx.fillStyle = mix(accent, '#2a2a30', 0.3); ctx.fillRect(x + hw * 0.68, yb - hh * 0.2, hw * 0.2, hh * 0.13);
          ctx.fillStyle = '#c9c6bc'; ctx.fillRect(x + hw * 0.62, yb - hh * 0.08, hw * 0.32, hh * 0.04);
          ctx.fillStyle = 'rgba(40,50,70,0.22)'; ctx.fillRect(x + hw * 0.93, yb - hh, hw * 0.07, hh * 0.92);
        }
        var hw0 = (L.port ? 30 : 26) * s, hh0 = hw0 * 1.55;
        var rowsSF = [[0, 1], [h * 0.12, 1.12]];
        for (var rI = 0; rI < rowsSF.length; rI++) {
          var off = rowsSF[rI][0], kf = rowsSF[rI][1], hw = hw0 * kf, hh = hh0 * kf, ci = rI * 3;
          for (x = hx0 + (rI ? hw * 0.3 : -hw * 0.2); x < w + hw; x += hw * 1.02) {
            var yb = slope(x + hw) + off; // base set by the downhill side of the lot
            if (yb > L.ground + hh * 0.6) continue;
            vic(x, Math.min(yb, slope(x) + off), hw, hh, ci++, kf);
          }
          // sidewalk/street climbing the hill in front of each row
          ctx.fillStyle = '#b8b6ae';
          ctx.beginPath(); ctx.moveTo(hx0 - w * 0.02, slope(hx0) + off); ctx.lineTo(w + 2, slope(w) + off); ctx.lineTo(w + 2, slope(w) + off + 3 * s * kf); ctx.lineTo(hx0 - w * 0.02, slope(hx0) + off + 3 * s * kf); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#6f6e6a'; ctx.beginPath(); ctx.moveTo(hx0 - w * 0.02, slope(hx0) + off + 3 * s * kf); ctx.lineTo(w + 2, slope(w) + off + 3 * s * kf); ctx.lineTo(w + 2, slope(w) + off + 9 * s * kf); ctx.lineTo(hx0 - w * 0.02, slope(hx0) + off + 9 * s * kf); ctx.closePath(); ctx.fill();
          if (rI === 0) {
            // little cable car climbing the street
            var ccx = lerp(hx0, w, 0.45), ccy = slope(ccx) + off + 6 * s, ang = Math.atan2(slope(w) - slope(hx0), w - hx0), cl = 22 * s;
            ctx.save(); ctx.translate(ccx, ccy); ctx.rotate(ang);
            ctx.fillStyle = '#b8352a'; ctx.fillRect(-cl / 2, -9 * s, cl, 7 * s);
            ctx.fillStyle = '#efe4c8'; ctx.fillRect(-cl / 2, -9 * s, cl, 2.4 * s);
            ctx.fillStyle = '#4a5a6a'; for (var cw2 = 0; cw2 < 5; cw2++) ctx.fillRect(-cl / 2 + 2 * s + cw2 * 4 * s, -6.2 * s, 2.6 * s, 2.4 * s);
            ctx.fillStyle = '#7a2a22'; ctx.fillRect(-cl / 2 - 1 * s, -10.5 * s, cl + 2 * s, 1.6 * s);
            ctx.fillStyle = '#2a2a2a'; ctx.beginPath(); ctx.arc(-cl * 0.3, -1.6 * s, 1.4 * s, 0, TAU); ctx.arc(cl * 0.3, -1.6 * s, 1.4 * s, 0, TAU); ctx.fill();
            ctx.restore();
          }
        }
        ctx.fillStyle = lg(ctx, 0, h * 0.2, 0, L.ground, [[0, 'rgba(205,215,224,0.18)'], [1, 'rgba(205,215,224,0)']]); ctx.fillRect(hx0 - w * 0.05, h * 0.2, w, L.ground - h * 0.2);
        // grassy headland foreground with cliff edge
        var g0 = L.ground;
        function headTop(x) { var u = x / w; return g0 - h * 0.012 * fbm(x / w * 6, 91, 3) - Math.pow(Math.max(0, 0.22 - u) / 0.22, 1.5) * h * 0.13; }
        ridge(ctx, -2, w + 2, 2, headTop, h + 2, lg(ctx, 0, g0 - h * 0.1, 0, h, [[0, '#8fa56c'], [0.15, '#7b9660'], [0.6, '#5e7f4d'], [1, '#48663f']]));
        ctx.fillStyle = lg(ctx, 0, g0 - 2, 0, g0 + h * 0.02, [[0, 'rgba(230,236,220,0.5)'], [1, 'rgba(230,236,220,0)']]); ctx.fillRect(0, g0 - 2, w, h * 0.02);
        for (i = 0; i < 6; i++) glow(ctx, w * r(), lerp(g0 + h * 0.05, h, r()), w * 0.25, i % 2 ? '#e6f0d0' : '#2f4a35', 0.16);
        grassField(ctx, w, h, g0 - h * 0.03, h, 7000, [['#b5c38c', 0.7 * s, 0.55], ['#3f5e3a', 0.8 * s, 0.55], ['#d5d9a6', 0.6 * s, 0.45], ['#6c8a52', 0.8 * s, 0.5]], r, s, -0.15);
        dots(ctx, 160, [['#f29a2e', 0.85], ['#f4d24a', 0.8], ['#c8b8e8', 0.7]], function () { var yy = lerp(g0 + h * 0.02, h, Math.pow(r(), 0.8)); return [r() * w, yy, (0.6 + (yy - g0) / h * 2) * s, (r() * 3) | 0]; });
        // windswept cypress at left edge
        var cyX = w * 0.04, cyY = headTop(cyX) + 2 * s, cH = h * 0.2;
        ctx.strokeStyle = '#3d3029'; ctx.lineCap = 'round';
        ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(cyX, cyY); ctx.quadraticCurveTo(cyX + cH * 0.1, cyY - cH * 0.5, cyX + cH * 0.45, cyY - cH * 0.75); ctx.stroke();
        ctx.lineWidth = 1.8 * s; ctx.beginPath(); ctx.moveTo(cyX + cH * 0.05, cyY - cH * 0.35); ctx.quadraticCurveTo(cyX - cH * 0.15, cyY - cH * 0.6, cyX - cH * 0.25, cyY - cH * 0.7); ctx.stroke();
        for (i = 0; i < 26; i++) {
          var ox = cyX - cH * 0.35 + r() * cH * 1.2, oy = cyY - cH * (0.65 + r() * 0.3), orr = cH * (0.08 + r() * 0.08);
          ctx.fillStyle = '#2c4232'; ctx.beginPath(); ctx.ellipse(ox, oy, orr * 1.6, orr * 0.7, -0.1, 0, TAU); ctx.fill();
          ctx.fillStyle = '#58744e'; ctx.beginPath(); ctx.ellipse(ox + orr * 0.2, oy - orr * 0.3, orr * 1.1, orr * 0.35, -0.1, 0, TAU); ctx.fill();
        }
        
        finish(ctx, w, h, '#a8c0d8', 0.2, 0.26, 0.06);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var fs = getFog(); if (!fs) return;
        var s = sc(w, h);
        ctx.save();
        for (var i = 0; i < 6; i++) {
          var fw = w * (0.55 + (i % 3) * 0.15), fh = fw * 0.375, sp = (6 + i * 2.5) * s;
          var x = ((t * sp + i * w * 0.37) % (w + fw)) - fw, y = h * (0.12 + (i % 4) * 0.075) + Math.sin(t * 0.2 + i) * 4 * s;
          ctx.globalAlpha = 0.28 + (i % 2) * 0.12;
          ctx.drawImage(fs, x, y - fh * 0.5, fw, fh);
        }
        ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= YOSEMITE ======================= */
  function yoLayout(w, h) {
    var port = h / w > 1.15;
    return { hz: h * 0.45, s: sc(w, h), port: port, mead: h * 0.52, fallX: w * (port ? 0.9 : 0.89), fallTop: h * (port ? 0.16 : 0.13), fallBot: h * 0.47 };
  }
  var cloudSprite = null;
  function getCloud() {
    if (cloudSprite || typeof document === 'undefined') return cloudSprite;
    cloudSprite = document.createElement('canvas'); cloudSprite.width = 220; cloudSprite.height = 90;
    var g = cloudSprite.getContext('2d');
    cloud(g, 110, 62, 38, rng(55), '#ffffff', '#b8c8d8', 0.75);
    return cloudSprite;
  }
  SC.yosemite = {
    paint: function (ctx, w, h) {
      try {
        var r = rng(4404), L = yoLayout(w, h), hz = L.hz, s = L.s, i, x, y;
        ctx.fillStyle = lg(ctx, 0, 0, 0, L.mead, [[0, '#2f6cc0'], [0.3, '#5a95d6'], [0.62, '#a9cdea'], [0.85, '#dbeaf2'], [1, '#eef3ee']]);
        ctx.fillRect(0, 0, w, L.mead);
        glow(ctx, w * 0.15, h * 0.02, Math.max(w, h) * 0.5, '#fffbe8', 0.45);
        cloud(ctx, w * 0.5, h * 0.09, w * 0.07, r, '#ffffff', '#a9bdd4', 0.7);
        cloud(ctx, w * 0.78, h * 0.06, w * 0.05, r, '#ffffff', '#a9bdd4', 0.6);
        // far high-country ridge
        ridge(ctx, 0, w, 3, function (x) { return hz - h * 0.08 - h * 0.06 * fbm(x / w * 3, 101, 5); }, hz + 2, '#a7bcd2');
        // granite helper: fill with gradient then streaks
        function granite(fy, x0, x1, yb, top, lit, mid, shade, seed, faceFn) {
          ctx.save();
          ridge(ctx, x0, x1, 2, fy, yb, null);
          ctx.fillStyle = lg(ctx, 0, top, 0, yb, [[0, lit], [0.5, mid], [1, shade]]); ctx.fill(); ctx.clip();
          if (faceFn) faceFn();
          var rr = rng(seed);
          batch(ctx, Math.round((x1 - x0) * (yb - top) / 22), [['#fbf8f0', 0.6 * s, 0.35], ['#6f7378', 0.7 * s, 0.25], ['#8a8170', 1.2 * s, 0.18], ['#b9bcbc', 0.9 * s, 0.3]], function () {
            var xx = lerp(x0, x1, rr()), ty = fy(xx), yy = ty + rr() * (yb - ty), l = (4 + rr() * 26) * s;
            return [xx, yy, xx + (rr() - 0.5) * 1.5 * s, yy + l, (rr() * 4) | 0];
          });
          ctx.restore();
        }
        // Half Dome (distant, center-right): sheer face on the left, rounded back to the right
        var hdS = w * (L.port ? 0.47 : 0.53), hdE = w * (L.port ? 0.84 : 0.82), hdTop = h * (L.port ? 0.17 : 0.13), hdBase = hz - h * 0.01;
        function halfDome(x) {
          if (x < hdS - w * 0.025) return hdBase - h * 0.04 * fbm(x / w * 6, 111, 3);
          if (x < hdS) return lerp(hdBase - h * 0.04, hdTop + h * 0.006, Math.pow((x - (hdS - w * 0.025)) / (w * 0.025), 0.4));
          var u = (x - hdS) / (hdE - hdS);
          return hdBase - (hdBase - hdTop) * Math.sqrt(Math.max(0, 1 - Math.pow(u, 2.2))) * 0.985 + h * 0.003 * fbm(x / w * 30, 112, 2);
        }
        granite(halfDome, hdS - w * 0.08, hdE + w * 0.05, hz + 2, hdTop, '#f1ece2', '#c9ccd2', '#9aa6b6', 121, function () {
          // shadowed sheer face
          ctx.fillStyle = lg(ctx, hdS - w * 0.03, 0, hdS + w * 0.04, 0, [[0, 'rgba(95,110,140,0.55)'], [0.6, 'rgba(95,110,140,0.4)'], [1, 'rgba(95,110,140,0)']]);
          ctx.fillRect(hdS - w * 0.03, hdTop - 2, w * 0.07, hdBase - hdTop + 4);
          ctx.fillStyle = lg(ctx, hdS, hdTop, hdE, hdBase, [[0, 'rgba(255,248,230,0.35)'], [1, 'rgba(255,248,230,0)']]); ctx.fillRect(hdS, hdTop, hdE - hdS, hdBase - hdTop);
        });
        ctx.save(); ridge(ctx, hdS - w * 0.08, hdE + w * 0.05, 2, halfDome, hz + 2, null); ctx.clip(); ctx.fillStyle = 'rgba(185,205,230,0.35)'; ctx.fillRect(0, 0, w, h); ctx.restore();
        // middle valley-wall forests (hazy)
        ridge(ctx, 0, w, 3, function (x) { return hz - h * 0.03 - h * 0.025 * fbm(x / w * 5, 131, 4); }, hz + 3, '#8aa0a8');
        // El Capitan style wall (left)
        var ecX = w * (L.port ? 0.42 : 0.35), ecTop = h * (L.port ? 0.06 : 0.03);
        function elcap(x) {
          var u = x / ecX;
          var brow = ecTop + h * 0.025 * fbm(x / w * 5, 141, 4) + h * 0.03 * u + h * 0.04 * Math.pow(Math.max(0, u - 0.6) / 0.25, 2);
          if (u < 0.85) return brow;
          var v = (u - 0.85) / 0.15; return lerp(ecTop + h * 0.08, hz + h * 0.02, Math.pow(v, 0.7));
        }
        granite(elcap, -2, ecX * 1.02, hz + h * 0.04, ecTop, '#f6f1e6', '#d6d3cb', '#a6a8a6', 151, function () {
          // lit sweep on the face, shade on the left
          ctx.fillStyle = lg(ctx, 0, 0, ecX, 0, [[0, 'rgba(110,115,130,0.4)'], [0.55, 'rgba(110,115,130,0.05)'], [0.8, 'rgba(255,250,230,0.35)'], [1, 'rgba(255,250,230,0.1)']]); ctx.fillRect(0, 0, ecX * 1.05, hz + h * 0.05);
          // dark water-stain streaks
          var rr = rng(161);
          for (var k = 0; k < 18; k++) {
            var sx = rr() * ecX * 0.95, sy = elcap(sx) + rr() * h * 0.05, sl = h * (0.08 + rr() * 0.2), sw = (1 + rr() * 4) * s;
            ctx.fillStyle = lg(ctx, 0, sy, 0, sy + sl, [[0, 'rgba(70,66,60,0.35)'], [1, 'rgba(70,66,60,0)']]);
            ctx.fillRect(sx, sy, sw, sl);
          }
          // diagonal cracks/ledges
          ctx.strokeStyle = 'rgba(90,90,95,0.35)'; ctx.lineWidth = 0.7 * s; ctx.beginPath();
          for (k = 0; k < 14; k++) { var cx = rr() * ecX, cy = lerp(ecTop + h * 0.05, hz, rr()); ctx.moveTo(cx, cy); ctx.lineTo(cx + (rr() - 0.3) * 20 * s, cy + (rr()) * 12 * s); }
          ctx.stroke();
        });
        ctx.fillStyle = lg(ctx, 0, ecTop, 0, hz, [[0, 'rgba(200,220,240,0)'], [1, 'rgba(200,220,240,0.28)']]); ctx.fillRect(0, ecTop, ecX * 1.05, hz - ecTop + h * 0.04);
        // right cliff with waterfall
        var rcX = w * (L.port ? 0.8 : 0.83), rcTop = L.fallTop - h * 0.03;
        function rcliff(x) { var u = (x - rcX) / (w - rcX); return rcTop + h * 0.03 * fbm(x / w * 7, 171, 4) + Math.pow(Math.max(0, 0.25 - u) / 0.25, 0.6) * (hz - rcTop) * 0.9; }
        granite(rcliff, rcX, w + 2, hz + h * 0.04, rcTop, '#ece7dc', '#c7c4bc', '#959a9c', 181, function () {
          ctx.fillStyle = 'rgba(100,110,125,0.25)'; ctx.fillRect(rcX, 0, (w - rcX) * 0.5, h);
          // wet dark streak behind the fall
          ctx.fillStyle = lg(ctx, L.fallX - 6 * s, 0, L.fallX + 6 * s, 0, [[0, 'rgba(80,80,80,0)'], [0.5, 'rgba(80,80,80,0.4)'], [1, 'rgba(80,80,80,0)']]);
          ctx.fillRect(L.fallX - 6 * s, L.fallTop, 12 * s, L.fallBot - L.fallTop);
        });
        // waterfall ribbon
        function fallX(t) { return L.fallX + Math.sin(t * 2.2) * 2 * s + t * 3 * s; }
        for (var st = 0; st < 3; st++) {
          ctx.strokeStyle = ['rgba(255,255,255,0.35)', 'rgba(240,248,255,0.7)', 'rgba(255,255,255,0.95)'][st];
          ctx.lineWidth = [5, 2.6, 1.1][st] * s * (1 + 0); ctx.lineCap = 'round'; ctx.beginPath();
          for (i = 0; i <= 30; i++) { var tt = i / 30, fy = lerp(L.fallTop, L.fallBot, tt), fx = fallX(tt) + (tt) * (st - 1) * 0.6 * s; if (!i) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy); }
          ctx.stroke();
        }
        glow(ctx, fallX(1), L.fallBot - h * 0.01, 22 * s, '#ffffff', 0.45);
        // talus slopes
        [[0, ecX * 1.15], [rcX - w * 0.05, w]].forEach(function (T) {
          ridge(ctx, T[0], T[1], 3, function (x) { var c = (x - T[0]) / (T[1] - T[0]); return hz + h * 0.01 - h * 0.035 * Math.sin(c * PI) * (0.6 + fbm(x / w * 8, 191, 3)); }, hz + h * 0.06, '#a3a598');
        });
        dots(ctx, 700, [['#6f7a64', 0.6], ['#d8d6c8', 0.5]], function () { return [r() * w, hz - r() * h * 0.03, (0.4 + r() * 0.7) * s, (r() * 2) | 0]; });
        // conifer forest rows (back to front)
        var rowsDef = [[hz - h * 0.005, 0.045, '#5f7f7a', '#7c9a8a', 0.6], [hz + h * 0.025, 0.07, '#3f6352', '#6f9466', 0.85], [hz + h * 0.06, 0.1, '#263f30', '#557d48', 1.1]];
        for (var rI = 0; rI < rowsDef.length; rI++) {
          var RD = rowsDef[rI], spacing = 3.4 * s * RD[4];
          for (x = -10; x < w + 10; x += spacing * (0.6 + r() * 0.8)) {
            var tH = h * RD[1] * (0.6 + r() * 0.7);
            conifer(ctx, x, RD[0] + r() * h * 0.01, tH, tH * 0.34, RD[2], RD[3], r, -1);
          }
          if (rI === 0) { ctx.fillStyle = lg(ctx, 0, hz - h * 0.07, 0, hz + h * 0.02, [[0, 'rgba(200,220,235,0)'], [1, 'rgba(200,220,235,0.35)']]); ctx.fillRect(0, hz - h * 0.07, w, h * 0.09); }
        }
        // tall framing conifers at edges
        var edges = L.port ? [[0.02, 0.5], [0.97, 0.46]] : [[0.015, 0.48], [0.075, 0.36], [0.98, 0.44]];
        for (i = 0; i < edges.length; i++) { var eH = h * edges[i][1]; conifer(ctx, w * edges[i][0], L.mead + h * 0.03, eH, eH * 0.3, '#1d3226', '#4d7340', r, -1); }
        // meadow
        var m0 = L.mead;
        ctx.fillStyle = lg(ctx, 0, m0, 0, h, [[0, '#a6b864'], [0.2, '#8eac52'], [0.6, '#6e9442'], [1, '#517a36']]); ctx.fillRect(0, m0, w, h - m0);
        ctx.fillStyle = lg(ctx, 0, m0 - 2, 0, m0 + h * 0.03, [[0, 'rgba(40,60,40,0.45)'], [1, 'rgba(40,60,40,0)']]); ctx.fillRect(0, m0 - 2, w, h * 0.03);
        // winding river through the back meadow, exiting right
        function riv(t) { return [lerp(w * 0.2, w * 1.05, t) + Math.sin(t * PI * 2.2) * w * 0.06, m0 + h * 0.015 + t * h * 0.07 + Math.sin(t * 5) * h * 0.006]; }
        ctx.beginPath();
        for (i = 0; i <= 40; i++) { var R0 = riv(i / 40), rw = (1 + i / 40 * 7) * s; if (!i) ctx.moveTo(R0[0], R0[1] - rw * 0.4); else ctx.lineTo(R0[0], R0[1] - rw * 0.4); }
        for (i = 40; i >= 0; i--) { var R1 = riv(i / 40), rw2 = (1 + i / 40 * 7) * s; ctx.lineTo(R1[0], R1[1] + rw2 * 0.4); }
        ctx.closePath(); ctx.fillStyle = lg(ctx, 0, m0, 0, m0 + h * 0.1, [[0, '#cfe3ee'], [0.5, '#8fb8d4'], [1, '#5f92b4']]); ctx.fill();
        ctx.save(); ctx.clip();
        batch(ctx, 300, [['#ffffff', 0.6 * s, 0.6], ['#e8e4d8', 1.2 * s, 0.4]], function () { var R2 = riv(r()); return [R2[0] - 3 * s, R2[1] + (r() - 0.5) * 3 * s, R2[0] + 3 * s, R2[1] + (r() - 0.5) * 3 * s, r() < 0.7 ? 0 : 1]; });
        ctx.restore();
        ctx.strokeStyle = 'rgba(90,80,55,0.5)'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
        for (i = 0; i <= 40; i++) { var R3 = riv(i / 40), rw3 = (1 + i / 40 * 7) * s; if (!i) ctx.moveTo(R3[0], R3[1] + rw3 * 0.42); else ctx.lineTo(R3[0], R3[1] + rw3 * 0.42); }
        ctx.stroke();
        // light pools & meadow texture
        for (i = 0; i < 7; i++) glow(ctx, w * r(), lerp(m0 + h * 0.06, h, r()), w * 0.25, i % 2 ? '#f6f3c0' : '#3a5a2a', 0.16);
        grassField(ctx, w, h, m0, h, 7500, [['#c9d27e', 0.7 * s, 0.55], ['#3f6a2e', 0.8 * s, 0.55], ['#e8e2a0', 0.6 * s, 0.45], ['#7ea24c', 0.8 * s, 0.5]], r, s, 0.1);
        dots(ctx, 140, [['#f6f0f8', 0.8], ['#b9a0e0', 0.7], ['#f2d04a', 0.7]], function () { var yy = lerp(m0 + h * 0.06, h, Math.pow(r(), 0.8)); return [r() * w, yy, (0.5 + (yy - m0) / h * 1.8) * s, (r() * 3) | 0]; });
        // sun shafts over El Cap
        shafts(ctx, w * 0.15, -h * 0.05, w, h, '#fffbe8', 0.02, 6, r, 0.6, PI * 0.42);
        ctx.fillStyle = lg(ctx, 0, h * 0.82, 0, h, [[0, 'rgba(30,50,30,0)'], [1, 'rgba(30,50,30,0.25)']]); ctx.fillRect(0, h * 0.82, w, h * 0.18);
        finish(ctx, w, h, '#cfe4ff', 0.14, 0.26, 0.05);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = yoLayout(w, h), s = L.s, i;
        ctx.save();
        // drifting clouds
        var cs = getCloud();
        if (cs) {
          for (i = 0; i < 2; i++) {
            var cw = w * (0.3 + i * 0.1), chh = cw * 0.41, x = ((t * (3 + i * 2) * s + i * w * 0.6) % (w + cw)) - cw;
            ctx.globalAlpha = 0.55; ctx.drawImage(cs, x, h * (0.02 + i * 0.07), cw, chh);
          }
        }
        ctx.globalAlpha = 1;
        // falling water pulses
        ctx.lineCap = 'round';
        for (i = 0; i < 9; i++) {
          var ph = (t * 0.45 + i / 9) % 1, tt = ph, y0 = lerp(L.fallTop, L.fallBot, tt), y1 = y0 + (L.fallBot - L.fallTop) * 0.06;
          if (y1 > L.fallBot) y1 = L.fallBot;
          var fx = L.fallX + Math.sin(tt * 2.2) * 2 * s + tt * 3 * s + Math.sin(t * 1.3) * 0.6 * s * tt;
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.7 * Math.sin(ph * PI)).toFixed(3) + ')'; ctx.lineWidth = (1 + tt * 1.6) * s;
          ctx.beginPath(); ctx.moveTo(fx, y0); ctx.lineTo(fx + 0.3 * s, y1); ctx.stroke();
        }
        // mist puffs
        for (i = 0; i < 5; i++) {
          var mp = (t * 0.25 + i / 5) % 1, mx = L.fallX + 3 * s + (i - 2) * 4 * s * mp, my = L.fallBot - h * 0.01 - mp * h * 0.05, mr = (6 + mp * 14) * s;
          ctx.globalAlpha = 0.5 * (1 - mp);
          ctx.fillStyle = rg(ctx, mx, my, 0, mr, [[0, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
        }
        // valley haze drift
        ctx.globalAlpha = 0.06 + 0.03 * Math.sin(t * 0.3);
        ctx.fillStyle = lg(ctx, 0, L.hz - h * 0.05, 0, L.hz + h * 0.02, [[0, 'rgba(255,255,255,0)'], [0.6, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, L.hz - h * 0.05, w, h * 0.07);
        ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };
})();
