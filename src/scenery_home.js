/* scenery_home.js - painted home-region backgrounds
   (backyard, lakeshore, quarry, pineridge, stormpier, ashhills, starveil).
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
  function rfbm(x, s, oct) {
    var v = 0, a = 0.5, fr = 1, n = 0, o, t;
    for (o = 0; o < (oct || 5); o++) { t = 1 - Math.abs(vnoise(x * fr, s + o * 131) * 2 - 1); v += a * t * t; n += a; a *= 0.5; fr *= 2.11; }
    return v / n;
  }
  function h2(ix, iy, s) { return hash(Math.imul(ix | 0, 0x1B873593) ^ Math.imul(iy | 0, 0x5BD1E995), s); }
  function vn2(x, y, s) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    var a = h2(ix, iy, s), b = h2(ix + 1, iy, s), c = h2(ix, iy + 1, s), d = h2(ix + 1, iy + 1, s);
    return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy;
  }
  function fbm2(x, y, s, oct) {
    var v = 0, a = 0.5, fr = 1, n = 0, o;
    for (o = 0; o < (oct || 4); o++) { v += a * vn2(x * fr, y * fr, s + o * 71); n += a; a *= 0.5; fr *= 2.03; }
    return v / n;
  }
  function rid2(x, y, s, oct) {
    var v = 0, a = 0.5, fr = 1, n = 0, o, t;
    for (o = 0; o < (oct || 4); o++) { t = 1 - Math.abs(vn2(x * fr, y * fr, s + o * 71) * 2 - 1); v += a * t * t; n += a; a *= 0.52; fr *= 2.03; }
    return v / n;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  var HX = {};
  function hex(c) { var v = HX[c]; if (v) return v; var d = c.replace('#', ''); v = [parseInt(d.substr(0, 2), 16), parseInt(d.substr(2, 2), 16), parseInt(d.substr(4, 2), 16)]; HX[c] = v; return v; }
  function h2s(v) { v = clamp(Math.round(v), 0, 255); return (v < 16 ? '0' : '') + v.toString(16); }
  function mix(c1, c2, t) { var a = hex(c1), b = hex(c2); return '#' + h2s(lerp(a[0], b[0], t)) + h2s(lerp(a[1], b[1], t)) + h2s(lerp(a[2], b[2], t)); }
  function rgba(c, al) { var a = hex(c); return 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + al + ')'; }
  function lg(ctx, x0, y0, x1, y1, st) { var g = ctx.createLinearGradient(x0, y0, x1, y1); for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]); return g; }
  function rg(ctx, x, y, r0, r1, st) { var g = ctx.createRadialGradient(x, y, r0, x, y, Math.max(r0 + 0.1, r1)); for (var i = 0; i < st.length; i++) g.addColorStop(st[i][0], st[i][1]); return g; }
  function sc(w, h) { return Math.max(0.55, Math.min(w / 480, h / 360)); }
  function mk(cw, ch) { if (typeof document === 'undefined') return null; var c = document.createElement('canvas'); c.width = Math.max(1, cw | 0); c.height = Math.max(1, ch | 0); return c; }
  function isPort(w, h) { return h / w > 1.15; }

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
  function band(ctx, w, y0, y1, col, a) {
    ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, rgba(col, 0)], [0.5, rgba(col, a)], [1, rgba(col, 0)]]);
    ctx.fillRect(0, y0, w, y1 - y0);
  }
  var grainCv = null;
  function finish(ctx, w, h, gradeCol, gradeA, vig, grainA, vigCol) {
    try {
      ctx.save();
      if (gradeCol) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = gradeA; ctx.fillStyle = gradeCol; ctx.fillRect(0, 0, w, h); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      var R = Math.max(w, h) * 0.85, vc = vigCol || '#14101e';
      ctx.fillStyle = rg(ctx, w / 2, h * 0.5, R * 0.45, R, [[0, rgba(vc, 0)], [1, rgba(vc, vig)]]);
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
  /* batched short strokes: gen(i) -> [x0,y0,x1,y1,bucket(,cx,cy)] ; cols = [[style,width,alpha],...] */
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
      if (!b[k].length) continue;
      ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath();
      for (i = 0; i < b[k].length; i++) { var q = b[k][i]; ctx.moveTo(q[0] + q[2], q[1]); ctx.arc(q[0], q[1], q[2], 0, TAU); }
      ctx.fill();
    }
    ctx.restore();
  }
  /* flattened ellipse dabs: gen -> [x,y,rx,ry,bucket] */
  function dabs(ctx, n, cols, gen) {
    var i, k, b = []; for (k = 0; k < cols.length; k++) b.push([]);
    for (i = 0; i < n; i++) { var d = gen(i); if (d) b[d[4]].push(d); }
    ctx.save();
    for (k = 0; k < cols.length; k++) {
      if (!b[k].length) continue;
      ctx.fillStyle = cols[k][0]; ctx.globalAlpha = cols[k][1]; ctx.beginPath();
      for (i = 0; i < b[k].length; i++) { var q = b[k][i]; ctx.moveTo(q[0] + q[2], q[1]); ctx.ellipse(q[0], q[1], q[2], q[3], 0, 0, TAU); }
      ctx.fill();
    }
    ctx.restore();
  }
  function grassField(ctx, w, h, y0, y1, n, cols, r, s, lean, xf) {
    batch(ctx, n, cols, function () {
      var y = y0 + Math.pow(r(), 0.8) * (y1 - y0), p = (y - y0) / (y1 - y0);
      var x = xf ? xf(r()) : r() * w, L = (1.5 + p * 7 + r() * 3) * s, b = Math.floor(r() * cols.length);
      var lx = (lean || 0) * L + (r() - 0.5) * L * 0.6;
      return [x, y, x + lx, y - L, b, x + lx * 0.2, y - L * 0.6];
    });
  }
  /* mirror the strip above `axis` into the band [y0,y1] below it */
  function mirror(ctx, w, axis, srcH, y0, y1, al, dx) {
    try {
      var cv = ctx.canvas; if (!cv || !cv.width) return; var k = cv.width / w;
      ctx.save(); ctx.beginPath(); ctx.rect(0, y0, w, y1 - y0); ctx.clip();
      ctx.globalAlpha = al; ctx.translate(dx || 0, 2 * axis); ctx.scale(1, -1);
      ctx.drawImage(cv, 0, Math.max(0, (axis - srcH) * k), w * k, srcH * k, 0, axis - srcH, w, srcH);
      ctx.restore();
    } catch (e) { try { ctx.restore(); } catch (e2) {} }
  }
  var SPR = {};
  function glowSpr(col) {
    if (SPR[col] !== undefined) return SPR[col];
    var c = mk(32, 32); if (c) { var g = c.getContext('2d'); g.fillStyle = rg(g, 16, 16, 0, 16, [[0, rgba(col, 1)], [0.25, rgba(col, 0.55)], [1, rgba(col, 0)]]); g.fillRect(0, 0, 32, 32); }
    SPR[col] = c; return c;
  }

  /* ---- per-pixel lit terrain: fy silhouette, yb bottom. ridged height-field lighting + snow + aerial haze ---- */
  function peaks(ctx, w, h, o) {
    var q = o.q || 0.6, i, x, y, k, top = 1e9, yb = o.yb;
    var cw = Math.max(2, Math.ceil(w * q)), sil = new Float32Array(cw + 2);
    for (i = 0; i < cw + 2; i++) { var v = o.fy((i - 1) / q); sil[i] = v; if (v < top) top = v; }
    top = Math.floor(top) - 2;
    var ch = Math.max(2, Math.ceil((yb - top) * q));
    var cv = mk(cw, ch);
    if (!cv) { ridge(ctx, 0, w, 2, o.fy, yb, o.shade); return; }
    var g = cv.getContext('2d'), id = g.createImageData(cw, ch), d = id.data;
    var Lc = hex(o.lit), Sc = hex(o.shade), Dc = hex(o.deep || o.shade), SL = hex(o.snow || '#ffffff'), SS = hex(o.snowShade || '#9fb4d0'), HZ = hex(o.haze), RIM = o.rim ? hex(o.rim) : null;
    var fxq = o.fx || 8, fyq = o.fyf || 2.4, seed = o.seed || 1, dir = o.dir || -1, snowAmt = o.snow ? (o.snowAmt || 0.55) : 0;
    var K = o.k || 7, bigK = o.bigK || 1, span = Math.max(1, yb - top), hzA = o.hazeA || 0, hzB = o.hazeB || 0, hzP = o.hazeP || 1.4;
    // multi-scale blurred silhouette slopes: faces broaden with depth like real spurs
    var RADS = [1, 2, 4, 7, 11, 16, 23, 32, 45, 64, 90], NL = RADS.length, SLP = [], pre = new Float64Array(cw + 3);
    for (i = 0; i < cw + 2; i++) pre[i + 1] = pre[i] + sil[i];
    for (k = 0; k < NL; k++) {
      var rr = RADS[k], arr = new Float32Array(cw + 2), sl = new Float32Array(cw);
      for (i = 0; i < cw + 2; i++) { var a0 = Math.max(0, i - rr), a1 = Math.min(cw + 1, i + rr); arr[i] = (pre[a1 + 1] - pre[a0]) / (a1 - a0 + 1); }
      for (i = 0; i < cw; i++) sl[i] = (arr[i + 2] - arr[i]) * q * 0.5;
      SLP.push(sl);
    }
    var hf = new Float32Array(cw * ch), ms = new Float32Array(cw * ch);
    for (y = 0; y < ch; y++) {
      var wy = top + y / q, vv = wy / h;
      for (x = 0; x < cw; x++) {
        var sy0 = sil[x + 1]; if (wy < sy0 - 3) continue;
        var dpx = Math.max(0, (wy - sy0) * q), rad = 1 + dpx * 0.75, kk = 0;
        while (kk < NL - 2 && RADS[kk + 1] < rad) kk++;
        var tt = clamp((rad - RADS[kk]) / (RADS[kk + 1] - RADS[kk]), 0, 1), m = lerp(SLP[kk][x], SLP[kk + 1][x], tt);
        var gsh = 1.2 * m / (1 + m * m), c = x / q - (wy - sy0) * gsh;
        ms[y * cw + x] = m;
        hf[y * cw + x] = rid2(c / w * fxq, vv * fyq, seed, 4) * 0.75 + fbm2(c / w * 3, vv * 2.5, seed + 9, 3) * 0.25;
      }
    }
    for (y = 0; y < ch; y++) {
      var wy2 = top + y / q;
      for (x = 0; x < cw; x++) {
        var sy = sil[x + 1], idx = y * cw + x, p4 = idx * 4;
        if (wy2 < sy - 1.2) { d[p4 + 3] = 0; continue; }
        var a = clamp((wy2 - sy) * q + 1, 0, 1);
        var dep = Math.max(0, wy2 - sy) / (h * 0.22);
        var hc = hf[idx], gx = hf[x < cw - 1 ? idx + 1 : idx] - hf[x > 0 ? idx - 1 : idx];
        var bg = ms[idx] * dir, bv = bg / (Math.abs(bg) + 0.3);
        var lum = 0.5 + bv * 0.3 * bigK - gx * dir * K + (hc - 0.5) * 0.35 - dep * 0.08;
        if (dep < 0.025 && bv > 0) lum += 0.15 * (1 - dep / 0.025);
        lum = clamp(lum, 0, 1);
        var cr, cg, cb, t;
        if (lum < 0.4) { t = lum / 0.4; cr = lerp(Dc[0], Sc[0], t); cg = lerp(Dc[1], Sc[1], t); cb = lerp(Dc[2], Sc[2], t); }
        else { t = (lum - 0.4) / 0.6; cr = lerp(Sc[0], Lc[0], t); cg = lerp(Sc[1], Lc[1], t); cb = lerp(Sc[2], Lc[2], t); }
        if (snowAmt > 0) {
          var sv = snowAmt * (1 - dep * (o.snowFall || 1.2)) + (hc - 0.5) * 1.1 - Math.abs(gx) * K * 0.6 - Math.max(0, Math.abs(ms[idx]) - 1.6) * 0.25;
          var sn = smooth(0.3, 0.4, sv);
          if (sn > 0) {
            var sl2 = clamp(0.5 + bv * 0.45 + (hc - 0.5) * 0.4, 0, 1);
            cr = lerp(cr, lerp(SS[0], SL[0], sl2), sn); cg = lerp(cg, lerp(SS[1], SL[1], sl2), sn); cb = lerp(cb, lerp(SS[2], SL[2], sl2), sn);
          }
        }
        if (RIM && dep < 0.06) { var rk = (1 - dep / 0.06) * (o.rimA || 0.6) * clamp(lum * 1.4 - 0.2, 0, 1); cr = lerp(cr, RIM[0], rk); cg = lerp(cg, RIM[1], rk); cb = lerp(cb, RIM[2], rk); }
        var hzv = clamp(hzB + hzA * Math.pow((wy2 - top) / span, hzP), 0, 1);
        d[p4] = lerp(cr, HZ[0], hzv); d[p4 + 1] = lerp(cg, HZ[1], hzv); d[p4 + 2] = lerp(cb, HZ[2], hzv); d[p4 + 3] = a * 255;
      }
    }
    g.putImageData(id, 0, 0);
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(cv, 0, top, cw / q, ch / q); ctx.restore();
  }

  /* ---------------- vegetation ---------------- */
  function pine(ctx, x, yb, H, W, o, r) {
    var n = Math.max(5, Math.min(18, Math.round(H / 3.2))), i, dir = o.dir || 1, tiers = [];
    ctx.fillStyle = o.trunk || o.dark;
    ctx.fillRect(x - Math.max(0.4, W * 0.035), yb - H * 0.12, Math.max(0.8, W * 0.07), H * 0.12);
    for (i = 0; i < n; i++) {
      var t = i / n, y = yb - H * (0.07 + 0.93 * t), wd = W * 0.5 * Math.pow(1 - t, 0.9) * (0.8 + r() * 0.4) + W * 0.03;
      tiers.push([y, wd, H / n * 1.75, r()]);
    }
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      var T = tiers[i], y0 = T[0], wd2 = T[1], th = T[2];
      ctx.moveTo(x, y0 - th);
      ctx.quadraticCurveTo(x - wd2 * 0.45, y0 - th * 0.3, x - wd2, y0 + th * 0.22);
      ctx.lineTo(x - wd2 * 0.62, y0 + th * 0.06); ctx.lineTo(x - wd2 * 0.35, y0 + th * 0.2); ctx.lineTo(x, y0 + th * 0.04);
      ctx.lineTo(x + wd2 * 0.35, y0 + th * 0.2); ctx.lineTo(x + wd2 * 0.62, y0 + th * 0.06); ctx.lineTo(x + wd2, y0 + th * 0.22);
      ctx.quadraticCurveTo(x + wd2 * 0.45, y0 - th * 0.3, x, y0 - th);
    }
    ctx.fillStyle = o.dark; ctx.fill();
    if (o.lit) {
      ctx.beginPath();
      for (i = 0; i < n; i++) {
        var U = tiers[i];
        ctx.moveTo(x + dir * U[1] * 0.05, U[0] - U[2] * 0.85);
        ctx.quadraticCurveTo(x + dir * U[1] * 0.5, U[0] - U[2] * 0.2, x + dir * U[1] * 0.96, U[0] + U[2] * 0.18);
        ctx.lineTo(x + dir * U[1] * 0.5, U[0] + U[2] * 0.02);
        ctx.closePath();
      }
      ctx.fillStyle = o.lit; ctx.fill();
    }
    if (o.snow) {
      var pass = [[o.snowShade || o.snow, -dir], [o.snow, dir]];
      for (var p = 0; p < 2; p++) {
        ctx.beginPath();
        for (i = 0; i < n; i++) {
          var V = tiers[i], sd = pass[p][1], amt = 0.55 + V[3] * 0.4;
          if (V[3] < (o.snowGap || 0.12)) continue;
          ctx.moveTo(x, V[0] - V[2] * 1.0);
          ctx.quadraticCurveTo(x + sd * V[1] * 0.42, V[0] - V[2] * 0.42, x + sd * V[1] * amt, V[0] + V[2] * 0.02);
          ctx.quadraticCurveTo(x + sd * V[1] * amt * 0.7, V[0] - V[2] * 0.05, x + sd * V[1] * 0.4, V[0] - V[2] * 0.2);
          ctx.quadraticCurveTo(x + sd * V[1] * 0.2, V[0] - V[2] * 0.42, x, V[0] - V[2] * 0.62);
          ctx.closePath();
        }
        ctx.fillStyle = pass[p][0]; ctx.fill();
      }
    }
  }
  /* volumetric foliage clump: pal [deep, shadow, mid, lit, rim]; (lx,ly) unit vector toward light */
  function clump(ctx, cx, cy, R, pal, r, lx, ly, back) {
    ctx.fillStyle = rg(ctx, cx - lx * R * 0.1, cy + R * 0.15, 0, R * 1.02, [[0, pal[0]], [0.75, pal[0]], [1, rgba(pal[0].charAt(0) === '#' ? pal[0] : '#000000', 0)]]);
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.92, 0, TAU); ctx.fill();
    var n = Math.min(900, Math.round(40 + R * R * 0.75));
    var cols = [[pal[0], 1], [pal[1], 1], [pal[2], 1], [pal[3], 1], [pal[4], 1]];
    dots(ctx, n, cols, function () {
      var a = r() * TAU, rr = R * Math.sqrt(r()) * 1.02, px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * 0.92;
      var nx = (px - cx) / R, ny = (py - cy) / R;
      var v = (nx * lx + ny * ly) * 0.55 - ny * 0.18 + (1 - rr / R) * 0.08 + (r() - 0.5) * 0.42 + 0.42 - (back ? 0.14 : 0);
      var b = v < 0.24 ? 0 : v < 0.44 ? 1 : v < 0.63 ? 2 : v < 0.85 ? 3 : 4;
      if (b === 4 && rr < R * 0.7) b = 3;
      return [px, py, Math.max(0.5, R * (0.03 + r() * 0.055) * (b > 2 ? 0.85 : 1)), b];
    });
  }
  function broadleaf(ctx, o, seed) {
    var r = rng(seed), i, k, s = o.s;
    // trunk
    var bx = o.x, by = o.yb, tx = o.cx + (o.lean || 0), ty = o.cy + o.ry * 0.35, tw = o.tw;
    function trunkPath(x0, y0, x1, y1, w0, w1, bend) {
      var mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2, N = 14, Lp = [], Rp = [], j;
      for (j = 0; j <= N; j++) {
        var t = j / N, px = bez(x0, mx, x1, t), py = bez(y0, my, y1, t);
        var dx = bez(x0, mx, x1, Math.min(1, t + 0.02)) - bez(x0, mx, x1, Math.max(0, t - 0.02)), dy = bez(y0, my, y1, Math.min(1, t + 0.02)) - bez(y0, my, y1, Math.max(0, t - 0.02));
        var l = Math.sqrt(dx * dx + dy * dy) || 1, wd = lerp(w0, w1, Math.pow(t, 0.8)) * 0.5 + (t < 0.08 ? w0 * (0.08 - t) * 5 : 0);
        Lp.push([px - dy / l * wd, py + dx / l * wd]); Rp.push([px + dy / l * wd, py - dx / l * wd]);
      }
      ctx.beginPath(); ctx.moveTo(Lp[0][0], Lp[0][1]);
      for (j = 1; j <= N; j++) ctx.lineTo(Lp[j][0], Lp[j][1]);
      for (j = N; j >= 0; j--) ctx.lineTo(Rp[j][0], Rp[j][1]);
      ctx.closePath();
    }
    ctx.save();
    trunkPath(bx, by, tx, ty, tw, tw * 0.45, (o.bend || 0));
    ctx.fillStyle = lg(ctx, bx - tw, 0, bx + tw, 0, o.lx > 0 ? [[0, o.bark[0]], [0.6, o.bark[1]], [1, o.bark[2]]] : [[0, o.bark[2]], [0.4, o.bark[1]], [1, o.bark[0]]]);
    ctx.fill();
    ctx.save(); ctx.clip();
    batch(ctx, Math.round(H2(by - ty) * 1.2), [[o.bark[0], 0.7 * s, 0.5], ['#000000', 0.8 * s, 0.25]], function () {
      var yy = lerp(ty, by, r()), xx = lerp(tx, bx, (yy - ty) / (by - ty)) + (r() - 0.5) * tw * 1.2, l = (3 + r() * 8) * s;
      return [xx, yy, xx + (r() - 0.5) * s, yy + l, r() < 0.5 ? 0 : 1];
    });
    // rim of light on trunk side facing the light
    ctx.fillStyle = lg(ctx, bx - tw, 0, bx + tw, 0, o.lx > 0 ? [[0, 'rgba(0,0,0,0)'], [0.7, 'rgba(0,0,0,0)'], [1, rgba(o.pal[4], 0.55)]] : [[0, rgba(o.pal[4], 0.55)], [0.3, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0)']]);
    ctx.fillRect(Math.min(bx, tx) - tw * 2, ty, Math.abs(bx - tx) + tw * 4, by - ty);
    ctx.restore();
    // limbs into the crown
    var nb = o.limbs || 5;
    for (k = 0; k < nb; k++) {
      var t0 = 0.15 + r() * 0.5, sx = lerp(tx, bx, t0 * 0.4), sy = lerp(ty, by, t0 * 0.4);
      var ex = o.cx + (r() - 0.5) * o.rx * 1.5, ey = o.cy + (r() - 0.6) * o.ry * 1.1;
      trunkPath(sx, sy, ex, ey, tw * (0.35 + r() * 0.2), tw * 0.08, (r() - 0.5) * o.rx * 0.3);
      ctx.fillStyle = o.bark[2]; ctx.fill();
    }
    // foliage clusters
    var cl = [], nc = o.n || 16;
    for (k = 0; k < nc; k++) {
      var a = r() * TAU, rr = Math.sqrt(r()) * 0.82;
      cl.push([o.cx + Math.cos(a) * o.rx * rr, o.cy + Math.sin(a) * o.ry * rr, Math.min(o.rx, o.ry) * (0.3 + r() * 0.22), r()]);
    }
    for (k = 0; k < (o.edge || 8); k++) {
      var a2 = (k / (o.edge || 8)) * TAU + r() * 0.4;
      cl.push([o.cx + Math.cos(a2) * o.rx * 0.88, o.cy + Math.sin(a2) * o.ry * 0.85, Math.min(o.rx, o.ry) * (0.2 + r() * 0.14), r()]);
    }
    cl.sort(function (A, B) { return (A[1] + A[3] * o.ry * 0.5) - (B[1] + B[3] * o.ry * 0.5); });
    for (k = 0; k < cl.length; k++) clump(ctx, cl[k][0], cl[k][1], cl[k][2], o.pal, r, o.lx, o.ly, cl[k][1] < o.cy - o.ry * 0.3);
    // sky holes / light leaking through
    if (o.hole) dots(ctx, Math.round(nc * 2.2), [[o.hole, 0.85]], function () {
      var a3 = r() * TAU, rr3 = Math.sqrt(r()) * 0.8;
      return [o.cx + Math.cos(a3) * o.rx * rr3, o.cy + Math.sin(a3) * o.ry * rr3, (0.6 + r() * 1.6) * s, 0];
    });
    ctx.restore();
    function H2(v) { return Math.max(10, v); }
  }
  function bez(p0, p1, p2, t) { var m = 1 - t; return m * m * p0 + 2 * m * t * p1 + t * t * p2; }
  function pebbles(ctx, n, gen, pal, shadowCol, hiCol) {
    var list = [], i;
    for (i = 0; i < n; i++) { var p = gen(i); if (p) list.push(p); }
    ctx.save();
    ctx.fillStyle = shadowCol; ctx.globalAlpha = 0.45; ctx.beginPath();
    for (i = 0; i < list.length; i++) { var q = list[i]; ctx.moveTo(q[0] + q[2] * 1.15 + q[2] * 0.25, q[1] + q[3] * 0.45); ctx.ellipse(q[0] + q[2] * 0.25, q[1] + q[3] * 0.45, q[2] * 1.15, q[3] * 0.85, 0, 0, TAU); }
    ctx.fill(); ctx.globalAlpha = 1;
    for (var k = 0; k < pal.length; k++) {
      ctx.fillStyle = pal[k]; ctx.beginPath();
      for (i = 0; i < list.length; i++) { var q2 = list[i]; if (q2[4] !== k) continue; ctx.moveTo(q2[0] + q2[2], q2[1]); ctx.ellipse(q2[0], q2[1], q2[2], q2[3], 0, 0, TAU); }
      ctx.fill();
    }
    ctx.fillStyle = hiCol; ctx.globalAlpha = 0.55; ctx.beginPath();
    for (i = 0; i < list.length; i++) { var q3 = list[i]; ctx.moveTo(q3[0] - q3[2] * 0.25 + q3[2] * 0.5, q3[1] - q3[3] * 0.35); ctx.ellipse(q3[0] - q3[2] * 0.25, q3[1] - q3[3] * 0.35, q3[2] * 0.5, q3[3] * 0.4, 0, 0, TAU); }
    ctx.fill();
    ctx.restore();
  }
  /* angular rock chips: gen -> [x,y,size,bucket]; lit top facet + shadow */
  function shards(ctx, n, gen, pal, top, shadow, r) {
    var L = [], i, k;
    for (i = 0; i < n; i++) { var g = gen(i); if (g) { g.push(r() * 0.6 - 0.3, 0.5 + r() * 0.4, 0.6 + r() * 0.5); L.push(g); } }
    ctx.save();
    ctx.fillStyle = shadow; ctx.globalAlpha = 0.4; ctx.beginPath();
    for (i = 0; i < L.length; i++) { var q = L[i]; ctx.moveTo(q[0] + q[2] * 1.5, q[1] + q[2] * 0.15); ctx.ellipse(q[0] + q[2] * 0.3, q[1] + q[2] * 0.15, q[2] * 1.2, q[2] * 0.3, 0, 0, TAU); }
    ctx.fill(); ctx.globalAlpha = 1;
    for (k = 0; k < pal.length; k++) {
      ctx.fillStyle = pal[k]; ctx.beginPath();
      for (i = 0; i < L.length; i++) { var a = L[i]; if (a[3] !== k) continue; var z = a[2], t = a[4], hh = a[5] * z, ww = a[6] * z;
        ctx.moveTo(a[0] - ww, a[1]); ctx.lineTo(a[0] - ww * 0.8 + t * z, a[1] - hh); ctx.lineTo(a[0] + ww * 0.5 + t * z, a[1] - hh * 1.1); ctx.lineTo(a[0] + ww, a[1] - hh * 0.2); ctx.lineTo(a[0] + ww * 0.7, a[1]); ctx.closePath(); }
      ctx.fill();
    }
    ctx.fillStyle = top; ctx.globalAlpha = 0.8; ctx.beginPath();
    for (i = 0; i < L.length; i++) { var b = L[i], z2 = b[2], t2 = b[4], h2_ = b[5] * z2, w2 = b[6] * z2;
      ctx.moveTo(b[0] - w2 * 0.8 + t2 * z2, b[1] - h2_); ctx.lineTo(b[0] + w2 * 0.5 + t2 * z2, b[1] - h2_ * 1.1); ctx.lineTo(b[0] + w2 * 0.2, b[1] - h2_ * 0.55); ctx.lineTo(b[0] - w2 * 0.7, b[1] - h2_ * 0.5); ctx.closePath(); }
    ctx.fill();
    ctx.restore();
  }
  function crystal(ctx, x, y, H, W, ang, lit, dark, edge, al) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha = al == null ? 1 : al;
    var m = W * 0.12;
    ctx.beginPath(); ctx.moveTo(-W * 0.5, 0); ctx.lineTo(-W * 0.5, -H * 0.72); ctx.lineTo(m, -H); ctx.lineTo(m, 0); ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, -H, 0, 0, [[0, lit], [1, rgba(dark, 0.9)]]); ctx.fill();
    ctx.beginPath(); ctx.moveTo(m, 0); ctx.lineTo(m, -H); ctx.lineTo(W * 0.5, -H * 0.74); ctx.lineTo(W * 0.5, 0); ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, -H, 0, 0, [[0, dark], [1, rgba(dark, 0.75)]]); ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = Math.max(0.5, W * 0.07); ctx.globalAlpha *= 0.85;
    ctx.beginPath(); ctx.moveTo(m, -H * 0.05); ctx.lineTo(m, -H); ctx.lineTo(-W * 0.5, -H * 0.72); ctx.stroke();
    ctx.restore();
  }

  /* ======================= BACKYARD ======================= */
  function byLayout(w, h) {
    var port = isPort(w, h), s = sc(w, h);
    return { port: port, s: s, hz: h * 0.45, ft: h * 0.405, fb: h * 0.548, sunX: w * (port ? 0.55 : 0.6), sunY: h * 0.335 };
  }
  SC.backyard = {
    paint: function (ctx, w, h) {
      try {
        var r = rng(2101), L = byLayout(w, h), s = L.s, i, x, y, sx = L.sunX, sy = L.sunY, ft = L.ft, fb = L.fb;
        // sky: golden hour
        ctx.fillStyle = lg(ctx, 0, 0, 0, fb, [[0, '#4a6a9c'], [0.22, '#7f8fb2'], [0.45, '#c9a593'], [0.66, '#f0bf86'], [0.82, '#ffd79a'], [1, '#ffe6b0']]);
        ctx.fillRect(0, 0, w, fb + 2);
        glow(ctx, sx, sy, Math.max(w, h) * 0.85, '#ffc070', 0.42);
        for (i = 0; i < 4; i++) wisp(ctx, w * (0.15 + r() * 0.7), h * (0.06 + r() * 0.16), w * (0.25 + r() * 0.2), h * 0.012, i % 2 ? '#ffd2a8' : '#f4b8a0', 0.22, r);
        cloud(ctx, w * 0.36, h * 0.12, w * 0.06, r, '#ffe2bf', '#b48a92', 0.42);
        cloud(ctx, w * 0.8, h * 0.08, w * 0.045, r, '#ffe2bf', '#a88496', 0.36);
        glow(ctx, sx, sy, w * 0.22, '#fff0c4', 0.75);
        glow(ctx, sx, sy, w * 0.045, '#ffffff', 1);
        // distant neighbourhood: rooftop and hazy canopies (backlit, warm haze)
        var rx0 = w * (L.port ? 0.16 : 0.2), rx1 = w * (L.port ? 0.48 : 0.44), ry = h * 0.28;
        ctx.fillStyle = '#b38a78';
        ctx.beginPath(); ctx.moveTo(rx0, ft + 4); ctx.lineTo(rx0, ry + h * 0.04); ctx.lineTo((rx0 + rx1) / 2, ry); ctx.lineTo(rx1, ry + h * 0.04); ctx.lineTo(rx1, ft + 4); ctx.fill();
        ctx.fillStyle = '#9a7468'; ctx.beginPath(); ctx.moveTo(rx0 - w * 0.02, ry + h * 0.048); ctx.lineTo((rx0 + rx1) / 2, ry - h * 0.006); ctx.lineTo(rx1 + w * 0.02, ry + h * 0.048); ctx.lineTo(rx1 + w * 0.02, ry + h * 0.056); ctx.lineTo((rx0 + rx1) / 2, ry + h * 0.004); ctx.lineTo(rx0 - w * 0.02, ry + h * 0.056); ctx.fill();
        ctx.fillRect(rx0 + (rx1 - rx0) * 0.72, ry - h * 0.005, w * 0.022, h * 0.04);
        ctx.fillStyle = 'rgba(255,214,140,0.55)'; ctx.fillRect(rx0 + (rx1 - rx0) * 0.3, ry + h * 0.07, w * 0.03, h * 0.03); ctx.fillRect(rx0 + (rx1 - rx0) * 0.6, ry + h * 0.07, w * 0.03, h * 0.03);
        // neighbour canopy band
        ridge(ctx, 0, w, 3, function (xx) { return ft - h * 0.035 - h * 0.075 * Math.pow(fbm(xx / w * 5, 2111, 4), 1.3) - h * 0.04 * smooth(0.3, 0, Math.abs(xx / w - 0.82)); }, ft + 4, '#a9876a');
        for (x = -w * 0.02; x < w * 1.04; x += w * (0.035 + r() * 0.04)) {
          var cyb = ft - h * 0.03 - h * 0.07 * fbm(x / w * 5, 2111, 4), Rb = h * (0.035 + r() * 0.04);
          clump(ctx, x, cyb, Rb, ['#8a6c58', '#987a62', '#a8886a', '#c4a078', '#efc48a'], r, (sx - x) / w > 0 ? 0.8 : -0.8, -0.3, true);
        }
        haze(ctx, sx - w * 0.6, ft - h * 0.25, sx + w * 0.6, ft + h * 0.06, '#ffd9a0', 0.5);
        // ---- wooden fence (backlit, light leaking between boards) ----
        var gapGrad = lg(ctx, 0, 0, w, 0, [[0, '#a8683a'], [clamp(sx / w - 0.25, 0, 1), '#e7a85a'], [sx / w, '#fff0c0'], [clamp(sx / w + 0.25, 0, 1), '#e7a85a'], [1, '#a8683a']]);
        ctx.fillStyle = gapGrad; ctx.fillRect(0, ft + h * 0.01, w, fb - ft - h * 0.01);
        var pw = 10.5 * s, planks = [];
        for (x = -pw * 0.5, i = 0; x < w + pw; x += pw, i++) planks.push([x + 0.45 * s, pw - 0.9 * s * (0.6 + r() * 0.8), r(), i]);
        for (i = 0; i < planks.length; i++) {
          var P = planks[i], px = P[0], pwi = P[1], top = ft + (P[2] - 0.5) * 1.2 * s, base = mix('#5a3a28', '#7a5034', P[2]);
          ctx.fillStyle = lg(ctx, 0, top, 0, fb, [[0, mix('#6b4630', '#8a5c3a', P[2])], [0.5, base], [1, '#3a261c']]);
          ctx.beginPath(); ctx.moveTo(px, fb); ctx.lineTo(px, top + pwi * 0.28); ctx.lineTo(px + pwi * 0.28, top); ctx.lineTo(px + pwi * 0.72, top); ctx.lineTo(px + pwi, top + pwi * 0.28); ctx.lineTo(px + pwi, fb); ctx.closePath(); ctx.fill();
          var dsun = Math.abs(px + pwi / 2 - sx) / w;
          ctx.fillStyle = rgba('#ffcf7a', clamp(0.85 - dsun * 1.6, 0.15, 0.85));
          ctx.beginPath(); ctx.moveTo(px - 0.2, top + pwi * 0.28); ctx.lineTo(px + pwi * 0.28, top - 0.4); ctx.lineTo(px + pwi * 0.72, top - 0.4); ctx.lineTo(px + pwi + 0.2, top + pwi * 0.28); ctx.lineTo(px + pwi * 0.72, top + 1.1 * s); ctx.lineTo(px + pwi * 0.28, top + 1.1 * s); ctx.closePath(); ctx.fill();
          ctx.fillStyle = rgba('#ffcf7a', clamp(0.5 - dsun * 1.4, 0.05, 0.5)); ctx.fillRect(px - 0.2, top + pwi * 0.3, 0.9 * s, fb - top - pwi * 0.3);
          ctx.fillRect(px + pwi - 0.7 * s, top + pwi * 0.3, 0.9 * s, fb - top - pwi * 0.3);
        }
        // grain + knots
        batch(ctx, Math.round(w * 2.4), [['#2c1c14', 0.6 * s, 0.4], ['#9a6c48', 0.5 * s, 0.35]], function () {
          var P2 = planks[(r() * planks.length) | 0], xx = P2[0] + 1 + r() * (P2[1] - 2), yy = lerp(ft + 4 * s, fb, r()), l = (4 + r() * 12) * s;
          return [xx, yy, xx + (r() - 0.5) * 0.6, Math.min(fb, yy + l), r() < 0.6 ? 0 : 1];
        });
        dabs(ctx, 40, [['#2a1a12', 0.6]], function () { var P3 = planks[(r() * planks.length) | 0]; return [P3[0] + P3[1] * (0.3 + r() * 0.4), lerp(ft + 8 * s, fb - 6 * s, r()), 1.1 * s, 1.8 * s, 0]; });
        // rails
        [0.3, 0.8].forEach(function (f) {
          var ry0 = lerp(ft, fb, f), rh = 4.2 * s;
          ctx.fillStyle = lg(ctx, 0, ry0, 0, ry0 + rh, [[0, '#8a5e3c'], [0.3, '#5e3e2a'], [1, '#2e1e16']]); ctx.fillRect(0, ry0, w, rh);
          ctx.fillStyle = lg(ctx, 0, 0, w, 0, [[0, 'rgba(255,200,120,0.15)'], [sx / w, 'rgba(255,225,160,0.7)'], [1, 'rgba(255,200,120,0.15)']]); ctx.fillRect(0, ry0, w, 0.9 * s);
          ctx.fillStyle = 'rgba(30,18,10,0.35)'; ctx.fillRect(0, ry0 + rh, w, 2.2 * s);
        });
        // posts
        for (x = w * 0.08; x < w; x += pw * 8) {
          ctx.fillStyle = lg(ctx, x, 0, x + 5 * s, 0, [[0, '#3a281c'], [0.5, '#5a3c28'], [1, '#2a1c14']]); ctx.fillRect(x, ft - 3 * s, 5 * s, fb - ft + 3 * s);
          ctx.fillStyle = 'rgba(255,210,140,0.5)'; ctx.fillRect(x, ft - 3 * s, 5 * s, 1 * s);
        }
        ctx.fillStyle = lg(ctx, 0, ft, 0, fb, [[0, 'rgba(255,200,130,0)'], [1, 'rgba(40,24,14,0.35)']]); ctx.fillRect(0, ft, w, fb - ft);
        haze(ctx, sx - w * 0.3, ft - h * 0.06, sx + w * 0.3, fb, '#ffe2a8', 0.35);
        // ---- lawn ----
        ctx.fillStyle = lg(ctx, 0, fb, 0, h, [[0, '#8e9338'], [0.12, '#7b8c34'], [0.45, '#5d8030'], [0.8, '#456c2a'], [1, '#365a24']]);
        ctx.fillRect(0, fb, w, h - fb);
        // mowing stripes converging to vanishing point
        ctx.save();
        for (i = -10; i <= 10; i++) {
          if (i % 2) continue;
          ctx.fillStyle = 'rgba(255,240,170,0.045)';
          ctx.beginPath(); ctx.moveTo(sx + i * w * 0.012, fb); ctx.lineTo(sx + (i + 1) * w * 0.012, fb); ctx.lineTo(sx + (i + 1) * w * 0.16, h); ctx.lineTo(sx + i * w * 0.16, h); ctx.fill();
        }
        ctx.restore();
        // fence shadow band and leaking light streaks on lawn
        ctx.fillStyle = lg(ctx, 0, fb, 0, fb + h * 0.06, [[0, 'rgba(40,40,10,0.45)'], [1, 'rgba(40,40,10,0)']]); ctx.fillRect(0, fb, w, h * 0.06);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < planks.length; i++) {
          var gx = planks[i][0] - 0.4 * s, dd = (gx - sx) / w;
          if (Math.abs(dd) > 0.32) continue;
          var al = 0.07 * (1 - Math.abs(dd) / 0.32), ex = sx + (gx - sx) * ((h - L.sunY) / (fb - L.sunY)) * 0.55;
          ctx.fillStyle = lg(ctx, 0, fb, 0, fb + h * 0.32, [[0, 'rgba(255,214,130,' + al + ')'], [1, 'rgba(255,214,130,0)']]);
          ctx.beginPath(); ctx.moveTo(gx, fb); ctx.lineTo(gx + 0.9 * s, fb); ctx.lineTo(ex + 4 * s, fb + h * 0.32); ctx.lineTo(ex - 2 * s, fb + h * 0.32); ctx.fill();
        }
        ctx.restore();
        // soft tree shadows + dappled light at the edges
        var lt = { x: w * (L.port ? 0.04 : 0.07), yb: h * 0.64, cx: w * (L.port ? 0.02 : 0.06), cy: h * (L.port ? 0.1 : 0.11), rx: w * (L.port ? 0.27 : 0.21), ry: h * (L.port ? 0.17 : 0.24) };
        var rt = { x: w * (L.port ? 0.95 : 0.93), yb: h * 0.6, cx: w * (L.port ? 0.98 : 0.94), cy: h * (L.port ? 0.08 : 0.08), rx: w * (L.port ? 0.24 : 0.18), ry: h * (L.port ? 0.15 : 0.21) };
        haze(ctx, -w * 0.15, h * 0.6, w * 0.32, h * 0.98, '#1c2c12', 0.55);
        haze(ctx, w * 0.72, h * 0.57, w * 1.15, h * 0.9, '#1c2c12', 0.5);
        for (i = 0; i < 14; i++) {
          var side = i % 2, dx = side ? lerp(w * 0.78, w * 0.98, r()) : lerp(w * 0.0, w * 0.25, r()), dy = lerp(h * 0.64, h * 0.95, r());
          ctx.save(); ctx.translate(dx, dy); ctx.scale(1, 0.38); glow(ctx, 0, 0, (5 + r() * 9) * s, '#ffd27a', 0.45); ctx.restore();
        }
        for (i = 0; i < 6; i++) glow(ctx, lerp(w * 0.25, w * 0.75, r()), lerp(h * 0.62, h * 0.95, r()), w * 0.22, i % 2 ? '#ffe7a0' : '#2c4a1c', 0.12);
        // grass texture
        grassField(ctx, w, h, fb, h, Math.round(9000 * (w * h) / (480 * 360)), [['#2f4f1e', 0.8 * s, 0.55], ['#6f9238', 0.7 * s, 0.55], ['#a9b450', 0.6 * s, 0.5], ['#3e6626', 0.9 * s, 0.5]], r, s, -0.05);
        batch(ctx, 1600, [['#ffd47a', 0.6 * s, 0.6], ['#f6e9a4', 0.5 * s, 0.45]], function () {
          var yy = fb + Math.pow(r(), 2.2) * (h - fb) * 0.6, xx = r() * w, p = (yy - fb) / (h - fb), l = (1.5 + p * 6 + r() * 2) * s, near = 1 - Math.min(1, Math.abs(xx - sx) / (w * 0.5));
          if (r() > 0.25 + near * 0.75) return null;
          return [xx, yy, xx + (r() - 0.5) * l * 0.5, yy - l, r() < 0.7 ? 0 : 1];
        });
        // ---- flower beds (edges only) ----
        function bed(x0, x1, y0, y1, seed2, wide) {
          var rr = rng(seed2), cxm = (x0 + x1) / 2, rxm = (x1 - x0) / 2;
          ctx.fillStyle = rg(ctx, cxm, y1, 0, rxm * 1.1, [[0, 'rgba(40,24,14,0.9)'], [0.8, 'rgba(50,30,18,0.75)'], [1, 'rgba(50,30,18,0)']]);
          ctx.save(); ctx.translate(cxm, y1); ctx.scale(1, (y1 - y0) * 0.4 / rxm); ctx.beginPath(); ctx.arc(0, 0, rxm * 1.05, 0, TAU); ctx.fill(); ctx.restore();
          for (var k = 0; k < (wide ? 12 : 8); k++) {
            var bxk = lerp(x0, x1, rr()), byk = lerp(y0 + (y1 - y0) * 0.35, y1, rr()), R = (y1 - y0) * (0.22 + rr() * 0.16);
            clump(ctx, bxk, byk, R, ['#1a2a12', '#2c4a1e', '#4a7030', '#86a444', '#d8d070'], rr, sx > bxk ? 0.7 : -0.7, -0.7, false);
          }
          // lavender spikes
          batch(ctx, 70, [['#6a5aa8', 1.4 * s, 0.85], ['#a898e0', 1.1 * s, 0.85], ['#3c5a2a', 0.6 * s, 0.8]], function () {
            var xx = lerp(x0, x1, rr()), yy = lerp(y0 + (y1 - y0) * 0.4, y1, rr()), l = (y1 - y0) * (0.3 + rr() * 0.3), b = rr() < 0.3 ? 2 : rr() < 0.5 ? 1 : 0;
            return [xx, yy - (b === 2 ? 0 : l * 0.4), xx + (rr() - 0.5) * 3 * s, yy - l, b];
          });
          // blooms
          var pal = [['#f06a7a', 1], ['#ffb0c0', 1], ['#fff4ea', 1], ['#ffa040', 1], ['#c84a8a', 1], ['#fff3a0', 0.95]];
          var bl = [];
          dots(ctx, wide ? 220 : 150, pal, function () {
            var xx = lerp(x0, x1, rr()), yy = lerp(y0 + (y1 - y0) * 0.15, y1 - (y1 - y0) * 0.1, Math.pow(rr(), 0.7)), rad = (1 + rr() * 1.6) * s * (0.6 + (yy / h - 0.45) * 1.8);
            bl.push([xx, yy, rad]);
            return [xx, yy, rad, (rr() * 5) | 0];
          });
          dots(ctx, bl.length, [['#ffffff', 0.5], ['#3a1a20', 0.35]], function (j) { var B = bl[j]; return j % 2 ? [B[0] + B[2] * 0.2, B[1] + B[2] * 0.3, B[2] * 0.35, 1] : [B[0] - B[2] * 0.3, B[1] - B[2] * 0.35, B[2] * 0.4, 0]; });
        }
        var bw = w * (L.port ? 0.24 : 0.2);
        bed(-w * 0.02, bw, fb - h * 0.05, fb + h * 0.06, 2131, true);
        bed(w - bw, w * 1.02, fb - h * 0.05, fb + h * 0.06, 2141, true);
        bed(-w * 0.03, w * (L.port ? 0.15 : 0.11), h * 0.84, h * 1.03, 2151, false);
        bed(w * (L.port ? 0.85 : 0.89), w * 1.03, h * 0.86, h * 1.03, 2161, false);
        // ---- framing trees ----
        var pal = ['#17220f', '#263816', '#3e5624', '#7d8f34', '#e8c060'];
        function lv(t) { var vx = sx - t.cx, vy = (sy - t.cy) * 0.6, l = Math.sqrt(vx * vx + vy * vy) || 1; return [vx / l, vy / l]; }
        var v1 = lv(lt), v2 = lv(rt);
        broadleaf(ctx, { x: lt.x, yb: lt.yb, cx: lt.cx, cy: lt.cy, rx: lt.rx, ry: lt.ry, tw: 14 * s, s: s, lx: v1[0], ly: v1[1], pal: pal, bark: ['#8a6a4c', '#4a3626', '#2a1e16'], hole: '#ffd99a', n: 22, edge: 11, limbs: 6, bend: w * 0.03 }, 2171);
        broadleaf(ctx, { x: rt.x, yb: rt.yb, cx: rt.cx, cy: rt.cy, rx: rt.rx, ry: rt.ry, tw: 11 * s, s: s, lx: v2[0], ly: v2[1], pal: pal, bark: ['#8a6a4c', '#4a3626', '#2a1e16'], hole: '#ffd99a', n: 18, edge: 10, limbs: 5, bend: -w * 0.02 }, 2181);
        // sun rays through foliage + bloom
        shafts(ctx, sx, sy, w, h, '#ffd890', 0.045, 10, r, 1.4, PI * 0.5);
        glow(ctx, sx, sy, w * 0.12, '#fff2cc', 0.45);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, sx - (sx - w / 2) * 0.6, sy + h * 0.2, 10 * s, '#ffb070', 0.12); glow(ctx, sx - (sx - w / 2) * 1.4, sy + h * 0.45, 16 * s, '#a0c0ff', 0.08); ctx.restore();
        ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, 'rgba(30,40,14,0)'], [1, 'rgba(30,40,14,0.35)']]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
        finish(ctx, w, h, '#ffb070', 0.2, 0.3, 0.05, '#20140c');
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = byLayout(w, h), s = L.s, sp = glowSpr('#ffe2a0'), i;
        if (!sp) return;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 26; i++) {
          var a = hash(i, 51), b = hash(i, 52), c = hash(i, 53);
          var x = (a * w + Math.sin(t * (0.2 + c * 0.3) + i) * 18 * s + t * 3 * s) % w, y = h * (0.2 + b * 0.55) + Math.sin(t * (0.3 + a * 0.4) + i * 2) * 10 * s;
          var tw = 0.5 + 0.5 * Math.sin(t * (1 + c * 2) + i * 3), sz = (3 + c * 5) * s;
          ctx.globalAlpha = 0.18 + 0.4 * tw * (1 - Math.min(1, Math.abs(x - L.sunX) / w));
          ctx.drawImage(sp, x - sz, y - sz, sz * 2, sz * 2);
        }
        ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= LAKESHORE ======================= */
  function lkLayout(w, h) {
    var port = isPort(w, h);
    return { port: port, s: sc(w, h), hz: h * 0.445, shore: h * 0.578, dockX: w * (port ? 0.8 : 0.82) };
  }
  SC.lakeshore = {
    paint: function (ctx, w, h) {
      try {
        var r = rng(3101), L = lkLayout(w, h), hz = L.hz, s = L.s, sh = L.shore, i, x, y;
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, [[0, '#2d5fa6'], [0.35, '#5f8fcc'], [0.7, '#a9c8e6'], [0.92, '#d8e6ee'], [1, '#e8eeec']]);
        ctx.fillRect(0, 0, w, hz + 2);
        glow(ctx, w * 0.22, h * 0.02, Math.max(w, h) * 0.55, '#fff8e0', 0.4);
        cloud(ctx, w * 0.62, h * 0.1, w * 0.07, r, '#ffffff', '#9fb4cf', 0.55);
        cloud(ctx, w * 0.2, h * 0.16, w * 0.05, r, '#ffffff', '#a8bad2', 0.45);
        for (i = 0; i < 3; i++) wisp(ctx, w * (0.2 + r() * 0.6), h * (0.04 + r() * 0.08), w * 0.3, h * 0.008, '#ffffff', 0.18, r);
        // far range
        peaks(ctx, w, h, { fy: function (xx) { var u = xx / w; return hz - h * (0.09 + 0.19 * Math.pow(rfbm(u * 2.3 + 0.3, 3111, 5), 1.6)) - h * 0.04 * Math.sin(u * PI); }, yb: hz + 2, q: 1,
          lit: '#bccadf', shade: '#6c84ac', deep: '#566e98', snow: '#f8fbff', snowShade: '#a2b8da', snowAmt: 0.5, snowFall: 1.1, haze: '#c6d6ea', hazeA: 0.55, hazeB: 0.12, seed: 3112, dir: -1 });
        // mid range (bluer, darker)
        peaks(ctx, w, h, { fy: function (xx) { var u = xx / w; return hz - h * (0.03 + 0.1 * Math.pow(rfbm(u * 3.1 + 2.0, 3121, 5), 1.4)) - h * 0.03 * smooth(0.5, 0, Math.abs(u - 0.15)); }, yb: hz + 2, q: 1,
          lit: '#6f8fb8', shade: '#3c5a86', deep: '#2c4670', snow: '#e8f0fa', snowShade: '#8ea8cc', snowAmt: 0.3, snowFall: 2.4, haze: '#a9c0dc', hazeA: 0.6, hazeB: 0.05, seed: 3122, fx: 10, dir: -1 });
        // forested shoreline
        ridge(ctx, 0, w, 3, function (xx) { return hz - h * 0.012 - h * 0.018 * fbm(xx / w * 6, 3131, 4); }, hz + 3, '#3a5a5a');
        for (x = -6; x < w + 6; x += 2.2 * s * (0.6 + r() * 0.8)) {
          var tH = h * (0.025 + r() * 0.035) * (1 + 0.5 * fbm(x / w * 4, 3132, 3));
          pine(ctx, x, hz + h * 0.004 + r() * h * 0.004, tH, tH * 0.36, { dark: '#1e3a3c', lit: '#46685c', dir: -1 }, r);
        }
        ctx.fillStyle = lg(ctx, 0, hz - h * 0.08, 0, hz + 2, [[0, 'rgba(190,210,228,0)'], [1, 'rgba(190,210,228,0.4)']]); ctx.fillRect(0, hz - h * 0.08, w, h * 0.08 + 2);
        // ---- lake ----
        ctx.fillStyle = lg(ctx, 0, hz, 0, sh, [[0, '#4a6e96'], [0.3, '#5e86ae'], [0.7, '#7aa2c2'], [1, '#8fb4c4']]);
        ctx.fillRect(0, hz, w, sh - hz + 1);
        mirror(ctx, w, hz + 1, h * 0.34, hz + 0.5, sh + 2, 0.82, 0);
        mirror(ctx, w, hz + 1, h * 0.34, hz + 0.5, sh + 2, 0.18, 1.5 * s);
        mirror(ctx, w, hz + 1, h * 0.34, hz + 0.5, sh + 2, 0.18, -1.5 * s);
        // fresnel tint: water gets more transparent / teal toward the shore
        ctx.fillStyle = lg(ctx, 0, hz, 0, sh, [[0, 'rgba(60,90,130,0.2)'], [0.55, 'rgba(70,110,140,0.25)'], [0.85, 'rgba(120,160,160,0.5)'], [1, 'rgba(170,180,150,0.75)']]);
        ctx.fillRect(0, hz, w, sh - hz + 1);
        ctx.fillStyle = lg(ctx, 0, hz, 0, hz + h * 0.012, [[0, 'rgba(230,240,245,0.6)'], [1, 'rgba(230,240,245,0)']]); ctx.fillRect(0, hz, w, h * 0.012);
        // ripple breakup
        batch(ctx, 2200, [['#e8f2f8', 0.6 * s, 0.35], ['#2f4f74', 0.7 * s, 0.3], ['#b6d0e2', 0.6 * s, 0.35]], function () {
          var p = Math.pow(r(), 1.3), yy = hz + 1 + p * (sh - hz - 2), xx = r() * w, l = (1 + p * 10 + r() * 5) * s;
          return [xx, yy, xx + l, yy, (r() * 3) | 0];
        });
        // submerged pebbles near shore
        dabs(ctx, 260, [['#6a6450', 0.3], ['#a49a7c', 0.25]], function () { var yy = lerp(sh - h * 0.03, sh, Math.pow(r(), 0.6)), p = (yy - hz) / (sh - hz); return [r() * w, yy, (0.8 + r() * 2) * s * p, (0.4 + r() * 0.8) * s * p, r() < 0.5 ? 0 : 1]; });
        // sun glitter
        dots(ctx, 260, [['#ffffff', 0.8], ['#fff3cf', 0.6]], function () { var p = r(), yy = hz + 2 + p * (sh - hz - 4), xx = w * 0.24 + (r() - 0.5) * w * (0.06 + p * 0.28); return [xx, yy, (0.3 + r() * 0.6 * (0.3 + p)) * s, r() < 0.5 ? 0 : 1]; });
        // ---- reeds (left edge) with reflections ----
        var rx1 = w * (L.port ? 0.2 : 0.16);
        function reeds(refl) {
          var rr = rng(3141);
          batch(ctx, 140, [['#3a4a24', 1.1 * s, refl ? 0.3 : 0.95], ['#6a7a3a', 0.9 * s, refl ? 0.25 : 0.9], ['#b8b060', 0.6 * s, refl ? 0.2 : 0.85]], function () {
            var bx = Math.pow(rr(), 1.3) * rx1, by = sh + h * 0.004 - rr() * h * 0.05 * (1 - bx / rx1), Ln = h * (0.07 + rr() * 0.1) * (1.2 - bx / rx1 * 0.6), lean = (rr() - 0.3) * Ln * 0.35;
            if (refl) return [bx, by, bx + lean, by + Ln * 0.6, (rr() * 3) | 0, bx + lean * 0.2, by + Ln * 0.3];
            return [bx, by, bx + lean, by - Ln, (rr() * 3) | 0, bx + lean * 0.15, by - Ln * 0.55];
          });
          if (!refl) {
            dabs(ctx, 14, [['#5a3a22', 1], ['#8a5c34', 0.9]], function () { var xx = rr() * rx1 * 0.9, yy = sh - h * (0.07 + rr() * 0.1); return [xx, yy, 1.4 * s, 4.2 * s, rr() < 0.6 ? 0 : 1]; });
          }
        }
        reeds(true); reeds(false);
        // ---- wooden dock (right edge) ----
        var dx0 = L.dockX, dz = function (z) { // z 0 = shore end, 1 = far end
          var e = 1 / (1 + z * 3.2), cx = lerp(w * 0.66, dx0 + w * 0.08, e), y0 = lerp(hz + h * 0.012, sh + h * 0.035, e), hw = w * 0.11 * e;
          return [cx, y0, hw, e];
        };
        var D0 = dz(0), D1 = dz(1);
        // pilings + reflections
        for (i = 0; i <= 6; i++) {
          var Dz = dz(i / 6), pwid = Math.max(1, 3.2 * s * Dz[3]), wl = Dz[1] + h * 0.022 * Dz[3];
          [-1, 1].forEach(function (sd) {
            var pxp = Dz[0] + sd * Dz[2] * 0.9;
            ctx.fillStyle = 'rgba(40,30,22,0.35)'; ctx.fillRect(pxp - pwid / 2, wl, pwid, h * 0.03 * Dz[3]);
            ctx.fillStyle = lg(ctx, pxp - pwid / 2, 0, pxp + pwid / 2, 0, [[0, '#8a6a4a'], [0.5, '#4a3626'], [1, '#2a1e16']]); ctx.fillRect(pxp - pwid / 2, Dz[1], pwid, wl - Dz[1]);
          });
        }
        // deck reflection
        ctx.fillStyle = 'rgba(50,38,28,0.3)';
        ctx.beginPath(); ctx.moveTo(D1[0] - D1[2], D1[1] + h * 0.02 * D1[3]); ctx.lineTo(D1[0] + D1[2], D1[1] + h * 0.02 * D1[3]); ctx.lineTo(D0[0] + D0[2], D0[1] + h * 0.03); ctx.lineTo(D0[0] - D0[2], D0[1] + h * 0.03); ctx.fill();
        // deck side face
        ctx.fillStyle = '#3a2a1e';
        ctx.beginPath(); ctx.moveTo(D1[0] - D1[2], D1[1]); ctx.lineTo(D0[0] - D0[2], D0[1]); ctx.lineTo(D0[0] - D0[2], D0[1] + 5 * s); ctx.lineTo(D1[0] - D1[2], D1[1] + 1.2 * s); ctx.fill();
        // deck top
        ctx.fillStyle = lg(ctx, 0, D1[1], 0, D0[1], [[0, '#a99070'], [1, '#c8a47a']]);
        ctx.beginPath(); ctx.moveTo(D1[0] - D1[2], D1[1]); ctx.lineTo(D1[0] + D1[2], D1[1]); ctx.lineTo(D0[0] + D0[2], D0[1]); ctx.lineTo(D0[0] - D0[2], D0[1]); ctx.fill();
        ctx.strokeStyle = 'rgba(60,40,26,0.55)'; ctx.lineWidth = 0.6 * s; ctx.beginPath();
        for (i = 0; i <= 26; i++) { var Dp = dz(i / 26); ctx.moveTo(Dp[0] - Dp[2], Dp[1]); ctx.lineTo(Dp[0] + Dp[2], Dp[1]); }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,240,210,0.55)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(D1[0] - D1[2], D1[1]); ctx.lineTo(D0[0] - D0[2], D0[1]); ctx.stroke();
        // bollards
        for (i = 0; i < 3; i++) { var Db = dz(i / 2.2), bh = 7 * s * Db[3] + 1, bwd = Math.max(1, 3 * s * Db[3]); ctx.fillStyle = '#4a3626'; ctx.fillRect(Db[0] + Db[2] * 0.85, Db[1] - bh, bwd, bh); ctx.fillStyle = '#b8987a'; ctx.fillRect(Db[0] + Db[2] * 0.85, Db[1] - bh, bwd, Math.max(0.6, bh * 0.15)); }
        // ---- shore: wet band, sand, pebbles ----
        ctx.beginPath(); ctx.moveTo(0, h);
        for (x = 0; x <= w + 4; x += 4) ctx.lineTo(x, sh + h * 0.006 * (fbm(x / w * 5, 3151, 3) - 0.5));
        ctx.lineTo(w, h); ctx.closePath();
        ctx.fillStyle = lg(ctx, 0, sh, 0, h, [[0, '#7c7058'], [0.06, '#9a8a6a'], [0.16, '#c2ad86'], [0.5, '#d4c09a'], [0.8, '#c4ad86'], [1, '#a8916e']]); ctx.fill();
        ctx.fillStyle = 'rgba(200,220,230,0.35)'; ctx.fillRect(0, sh, w, h * 0.008);
        ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 0.9 * s; ctx.beginPath();
        for (x = 0; x <= w; x += 4) { var yy2 = sh + h * 0.004 + h * 0.006 * (fbm(x / w * 7, 3152, 3) - 0.3); if (!x) ctx.moveTo(x, yy2); else ctx.lineTo(x, yy2); }
        ctx.stroke();
        for (i = 0; i < 6; i++) glow(ctx, w * r(), lerp(sh + h * 0.05, h, r()), w * 0.25, i % 2 ? '#fff4dc' : '#8a7a5c', 0.14);
        // sand grain texture
        dots(ctx, 5000, [['#efe0bc', 0.45], ['#8e7a5a', 0.4], ['#b49c76', 0.45]], function () { var yy = lerp(sh + h * 0.01, h, Math.pow(r(), 0.9)); return [r() * w, yy, (0.25 + r() * 0.5) * s * (0.6 + (yy - sh) / h * 2), (r() * 3) | 0]; });
        // pebbles (denser near water and edges)
        pebbles(ctx, 1100, function () {
          var yy = lerp(sh + h * 0.008, h, Math.pow(r(), 1.6)), p = (yy - sh) / (h - sh), xx = r() * w;
          var edge = Math.min(xx, w - xx) / w; if (yy > sh + h * 0.08 && edge > 0.18 && r() < 0.75) return null;
          var rr2 = (0.5 + Math.pow(r(), 2) * 2.4) * s * (0.5 + p * 1.6);
          return [xx, yy, rr2, rr2 * (0.5 + r() * 0.2), (r() * 5) | 0];
        }, ['#8a8478', '#a59a88', '#6e6a64', '#c2b49a', '#7a6a5a'], '#3a3024', '#f4eee0');
        // driftwood bottom-left
        var dwx = w * 0.02, dwy = h * 0.93;
        ctx.save(); ctx.translate(dwx, dwy); ctx.rotate(-0.12);
        ctx.fillStyle = 'rgba(40,30,20,0.35)'; ctx.beginPath(); ctx.ellipse(w * 0.07, 5 * s, w * 0.11, 3 * s, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = lg(ctx, 0, -5 * s, 0, 5 * s, [[0, '#d8cbb4'], [0.5, '#a8987e'], [1, '#6a5c4a']]);
        ctx.beginPath(); ctx.moveTo(-w * 0.05, -3 * s); ctx.quadraticCurveTo(w * 0.07, -6 * s, w * 0.17, -2 * s); ctx.lineTo(w * 0.17, 2.5 * s); ctx.quadraticCurveTo(w * 0.07, 5 * s, -w * 0.05, 4 * s); ctx.fill();
        ctx.restore();
        ctx.fillStyle = lg(ctx, 0, h * 0.82, 0, h, [[0, 'rgba(40,30,20,0)'], [1, 'rgba(40,30,20,0.25)']]); ctx.fillRect(0, h * 0.82, w, h * 0.18);
        finish(ctx, w, h, '#bcd6ff', 0.14, 0.26, 0.05);
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = lkLayout(w, h), s = L.s, hz = L.hz, sh = L.shore, i;
        ctx.save(); ctx.lineCap = 'round';
        for (i = 0; i < 46; i++) {
          var a = hash(i, 61), b = hash(i, 62), c = hash(i, 63), p = Math.pow(b, 1.2);
          var y = hz + 3 + p * (sh - hz - 6), x = (a * w + t * (2 + c * 3) * s) % w, l = (3 + p * 16) * s, al = 0.3 * Math.max(0, Math.sin(t * (0.6 + c) + i * 1.7));
          if (al < 0.02) continue;
          ctx.globalAlpha = al; ctx.strokeStyle = c < 0.5 ? '#f2f8ff' : '#2c4a6c'; ctx.lineWidth = (0.5 + p) * s;
          ctx.beginPath(); ctx.moveTo(x - l / 2, y); ctx.quadraticCurveTo(x, y - 0.8 * s * p, x + l / 2, y); ctx.stroke();
        }
        ctx.fillStyle = '#ffffff';
        for (i = 0; i < 22; i++) {
          var p2 = hash(i, 71), gy = hz + 3 + p2 * (sh - hz - 6), gx = w * 0.24 + (hash(i, 72) - 0.5) * w * (0.06 + p2 * 0.28);
          var tw = Math.pow(Math.max(0, Math.sin(t * (2 + hash(i, 73) * 3) + i * 5)), 6);
          if (tw < 0.05) continue;
          var z = (0.6 + p2 * 1.6) * s * tw;
          ctx.globalAlpha = tw; ctx.fillRect(gx - z * 2, gy - 0.3 * s, z * 4, 0.6 * s); ctx.fillRect(gx - 0.3 * s, gy - z, 0.6 * s, z * 2);
        }
        // lapping edge
        ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 0.9); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.8 * s; ctx.beginPath();
        var off = Math.sin(t * 0.9) * h * 0.004;
        for (i = 0; i <= 24; i++) { var xx = i / 24 * w, yy = sh + h * 0.008 + off + Math.sin(i * 1.7 + t * 0.5) * h * 0.002; if (!i) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
        ctx.stroke();
        ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= QUARRY ======================= */
  function qLayout(w, h) { var port = isPort(w, h); return { port: port, s: sc(w, h), hz: h * 0.45, floor: h * 0.545, sunX: w * 0.14, sunY: h * 0.1 }; }
  SC.quarry = {
    paint: function (ctx, w, h) {
      try {
        var r = rng(4101), L = qLayout(w, h), s = L.s, fl = L.floor, i, x, y, k;
        ctx.fillStyle = lg(ctx, 0, 0, 0, fl, [[0, '#5f7fa6'], [0.3, '#9aa6b0'], [0.6, '#dcc39c'], [0.85, '#f0d2a0'], [1, '#f4dcae']]);
        ctx.fillRect(0, 0, w, fl);
        glow(ctx, L.sunX, L.sunY, Math.max(w, h) * 0.8, '#ffd59a', 0.45);
        glow(ctx, L.sunX, L.sunY, w * 0.06, '#ffffff', 0.95);
        for (i = 0; i < 4; i++) wisp(ctx, w * (0.3 + r() * 0.6), h * (0.05 + r() * 0.12), w * 0.3, h * 0.01, '#ffe6c4', 0.2, r);
        // distant hills over the rim
        peaks(ctx, w, h, { fy: function (xx) { return h * 0.2 - h * 0.05 * fbm(xx / w * 3, 4111, 5); }, yb: h * 0.32, q: 0.5, lit: '#d9b896', shade: '#b39a8e', deep: '#9a8a8a', haze: '#e8cfaa', hazeA: 0.3, hazeB: 0.45, seed: 4112, fx: 7, dir: -1 });
        // terraced walls: benches from the top down. Each bench is a vertical face with strata + lit ledge.
        var NB = 5, strata = ['#b8693a', '#cf8a52', '#a65a32', '#dca36a', '#93502c', '#c47a46', '#e2b27a', '#b0603a'];
        function ledge(k2, xx) {
          var u = xx / w, base = lerp(h * 0.19, h * 0.5, k2 / NB);
          var rise = Math.pow(Math.max(0, Math.abs(u - 0.5) * 2 - 0.45) / 0.55, 1.6) * h * 0.12 * (1 - k2 / NB);
          var step = Math.floor(fbm(u * 3, 4125 + k2, 2) * 4) * h * 0.007;
          return base - rise + h * 0.012 * (fbm(u * 6, 4120 + k2, 3) - 0.5) - step;
        }
        for (k = 0; k < NB; k++) {
          var tf = function (xx) { return ledge(k, xx); }, bf = function (xx) { return k === NB - 1 ? fl : ledge(k + 1, xx) - h * 0.012; };
          var far = 1 - k / NB;
          // face polygon
          ctx.save(); ctx.beginPath(); ctx.moveTo(0, tf(0));
          for (x = 0; x <= w + 3; x += 3) ctx.lineTo(x, tf(x));
          for (x = w + 3; x >= 0; x -= 3) ctx.lineTo(x, bf(x) + 1);
          ctx.closePath(); ctx.fillStyle = '#c48a58'; ctx.fill(); ctx.clip();
          var ytop = lerp(h * 0.19, h * 0.5, k / NB) - h * 0.16, ybot = k === NB - 1 ? fl : lerp(h * 0.19, h * 0.5, (k + 1) / NB) + 2;
          var rr = rng(4130 + k);
          for (y = ytop; y < ybot;) {
            var th = (1.2 + rr() * 4.5) * s, col = strata[(rr() * strata.length) | 0], y0 = y, sd = 4140 + k * 50 + ((y * 7) | 0);
            ctx.beginPath(); ctx.moveTo(-2, y0 + th);
            for (x = -2; x <= w + 4; x += 6) ctx.lineTo(x, y0 + h * 0.006 * (fbm(x / w * 4, sd, 3) - 0.5));
            ctx.lineTo(w + 4, y0 + th + 4); ctx.lineTo(-2, y0 + th + 4); ctx.closePath();
            ctx.fillStyle = col; ctx.fill();
            y += th;
          }
          // drill marks + fractures
          batch(ctx, Math.round(w / 3), [['#5a3420', 0.7 * s, 0.35], ['#f4d6a8', 0.6 * s, 0.35]], function () {
            var xx = r() * w, yy = tf(xx) + 1, hh = bf(xx) - yy; if (hh < 2) return null;
            return [xx, yy, xx + (r() - 0.5) * 2 * s, yy + hh * (0.4 + r() * 0.6), r() < 0.55 ? 0 : 1];
          });
          for (i = 0; i < 6; i++) { var fx0 = r() * w, fy0 = tf(fx0), fh = bf(fx0) - fy0; ctx.fillStyle = lg(ctx, fx0, 0, fx0 + 8 * s, 0, [[0, 'rgba(70,40,24,0.4)'], [1, 'rgba(70,40,24,0)']]); ctx.fillRect(fx0, fy0, 8 * s, fh); }
          // raking light: left side of each bench face in shade (west wall faces east), right side lit
          ctx.fillStyle = lg(ctx, 0, 0, w, 0, [[0, 'rgba(60,40,80,0.55)'], [0.25, 'rgba(60,40,80,0.2)'], [0.5, 'rgba(255,220,160,0)'], [0.85, 'rgba(255,200,130,0.22)'], [1, 'rgba(255,200,130,0.32)']]);
          ctx.fillRect(0, ytop - h * 0.05, w, ybot - ytop + h * 0.1);
          // shadow under the ledge above
          ctx.fillStyle = lg(ctx, 0, ytop, 0, ytop + h * 0.2, [[0, 'rgba(50,30,30,0)'], [1, 'rgba(50,30,30,0)']]);
          ctx.restore();
          ctx.save(); ctx.beginPath(); ctx.moveTo(0, tf(0)); for (x = 0; x <= w + 3; x += 3) ctx.lineTo(x, tf(x)); for (x = w + 3; x >= 0; x -= 3) ctx.lineTo(x, tf(x) + h * 0.03); ctx.closePath(); ctx.clip();
          ctx.fillStyle = lg(ctx, 0, ledge(k, w / 2) - h * 0.02, 0, ledge(k, w / 2) + h * 0.04, [[0, 'rgba(50,26,24,0.7)'], [1, 'rgba(50,26,24,0)']]); ctx.fillRect(0, 0, w, fl);
          ctx.restore();
          // ledge top (thin lit shelf) + rubble
          if (k > 0) {
            ctx.beginPath(); for (x = 0; x <= w + 3; x += 3) { var ly = tf(x); if (!x) ctx.moveTo(x, ly); else ctx.lineTo(x, ly); }
            for (x = w + 3; x >= 0; x -= 3) ctx.lineTo(x, tf(x) - h * 0.011);
            ctx.closePath(); ctx.fillStyle = lg(ctx, 0, 0, w, 0, [[0, '#b89a86'], [0.5, '#f0d0a0'], [1, '#ffe2b0']]); ctx.fill();
            dots(ctx, Math.round(w / 2), [['#7a5a40', 0.6], ['#fff0d0', 0.5]], function () { var xx = r() * w; return [xx, tf(xx) - r() * h * 0.011, (0.4 + r() * 0.9) * s, (r() * 2) | 0]; });
          }
          // aerial perspective for the higher (further) benches
          ctx.save(); ctx.beginPath(); ctx.moveTo(0, tf(0) - h * 0.012); for (x = 0; x <= w + 3; x += 3) ctx.lineTo(x, tf(x) - h * 0.012); for (x = w + 3; x >= 0; x -= 3) ctx.lineTo(x, bf(x) + 1); ctx.closePath();
          ctx.fillStyle = rgba('#f0cfa0', 0.3 * far * far); ctx.fill(); ctx.restore();
        }
        // dust haze bands
        band(ctx, w, h * 0.3, h * 0.42, '#f6dcb0', 0.16);
        band(ctx, w, h * 0.45, h * 0.57, '#f4d6a6', 0.26);
        shafts(ctx, L.sunX, L.sunY, w, h, '#ffe0a8', 0.05, 8, r, 0.7, PI * 0.28);
        // ---- rusty conveyor (right) ----
        var c0x = w * (L.port ? 0.98 : 0.95), c0y = fl - h * 0.01, c1x = w * (L.port ? 0.6 : 0.64), c1y = h * 0.2;
        var cl = Math.sqrt((c1x - c0x) * (c1x - c0x) + (c1y - c0y) * (c1y - c0y)), ca = Math.atan2(c1y - c0y, c1x - c0x), th2 = 6 * s;
        ctx.save(); ctx.lineCap = 'round';
        // A-frame legs
        for (i = 1; i <= 3; i++) {
          var tt = i / 4, lx2 = lerp(c0x, c1x, tt), ly2 = lerp(c0y, c1y, tt), gy = ledge(Math.min(NB - 1, Math.floor((1 - tt) * 2.2) + 2), lx2);
          if (gy < ly2) gy = fl - h * 0.005;
          ctx.strokeStyle = '#4a2a1c'; ctx.lineWidth = 1.4 * s;
          ctx.beginPath(); ctx.moveTo(lx2, ly2 + th2); ctx.lineTo(lx2 - 5 * s, gy); ctx.moveTo(lx2, ly2 + th2); ctx.lineTo(lx2 + 5 * s, gy); ctx.moveTo(lx2 - 3.5 * s, lerp(ly2, gy, 0.6)); ctx.lineTo(lx2 + 3.5 * s, lerp(ly2, gy, 0.6)); ctx.stroke();
        }
        ctx.translate(c0x, c0y); ctx.rotate(ca);
        ctx.strokeStyle = '#5a2e1a'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cl, 0); ctx.moveTo(0, th2); ctx.lineTo(cl, th2);
        for (x = 0; x < cl; x += th2 * 1.1) { ctx.moveTo(x, 0); ctx.lineTo(x + th2 * 0.55, th2); ctx.lineTo(x + th2 * 1.1, 0); }
        ctx.stroke();
        ctx.strokeStyle = '#c0703a'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(0, -0.4 * s); ctx.lineTo(cl, -0.4 * s); ctx.stroke();
        ctx.fillStyle = '#3a2418'; ctx.fillRect(0, -2.2 * s, cl, 1.8 * s);
        ctx.restore();
        // hopper at top
        ctx.fillStyle = lg(ctx, c1x - 10 * s, 0, c1x + 10 * s, 0, [[0, '#c8784a'], [0.5, '#7a3e22'], [1, '#4a2616']]);
        ctx.beginPath(); ctx.moveTo(c1x - 11 * s, c1y - 12 * s); ctx.lineTo(c1x + 9 * s, c1y - 12 * s); ctx.lineTo(c1x + 3 * s, c1y + 2 * s); ctx.lineTo(c1x - 4 * s, c1y + 2 * s); ctx.fill();
        // ---- derrick crane (left) ----
        var mx = w * (L.port ? 0.1 : 0.13), mb = ledge(2, mx) + 1, mt = h * 0.07, bxe = mx + w * (L.port ? 0.3 : 0.24), bye = h * 0.13;
        ctx.save(); ctx.lineCap = 'round';
        function lattice(x0, y0, x1, y1, wd, col, hi) {
          var ll = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)), an = Math.atan2(y1 - y0, x1 - x0);
          ctx.save(); ctx.translate(x0, y0); ctx.rotate(an);
          ctx.strokeStyle = col; ctx.lineWidth = 1.2 * s; ctx.beginPath();
          ctx.moveTo(0, -wd / 2); ctx.lineTo(ll, -wd * 0.15); ctx.moveTo(0, wd / 2); ctx.lineTo(ll, wd * 0.15);
          for (var q = 0; q < ll; q += wd * 1.1) { var f1 = 1 - q / ll * 0.7, f2 = 1 - (q + wd * 1.1) / ll * 0.7; ctx.moveTo(q, -wd / 2 * f1); ctx.lineTo(q + wd * 0.55, wd / 2 * (f1 + f2) / 2); ctx.lineTo(q + wd * 1.1, -wd / 2 * f2); }
          ctx.stroke();
          ctx.strokeStyle = hi; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.moveTo(0, -wd / 2); ctx.lineTo(ll, -wd * 0.15); ctx.stroke();
          ctx.restore();
        }
        lattice(mx, mb, mx, mt, 7 * s, '#4a2a1c', '#d08048');
        lattice(mx, mb - h * 0.02, bxe, bye, 6 * s, '#4e2c1c', '#d8884e');
        ctx.strokeStyle = 'rgba(40,24,16,0.85)'; ctx.lineWidth = 0.6 * s; ctx.beginPath();
        ctx.moveTo(mx, mt); ctx.lineTo(bxe, bye); ctx.moveTo(mx, mt); ctx.lineTo(mx - w * 0.06, mb + h * 0.02); ctx.moveTo(bxe, bye); ctx.lineTo(bxe, bye + h * 0.12); ctx.stroke();
        ctx.fillStyle = '#3a2418'; ctx.fillRect(bxe - 2 * s, bye + h * 0.12, 4 * s, 3 * s);
        ctx.fillStyle = '#5a3020'; ctx.fillRect(mx - 9 * s, mb - 7 * s, 18 * s, 7 * s); ctx.fillStyle = '#c0703a'; ctx.fillRect(mx - 9 * s, mb - 7 * s, 18 * s, 1.2 * s);
        ctx.restore();
        haze(ctx, -w * 0.2, h * 0.0, w * 0.6, h * 0.5, '#ffe2b0', 0.18);
        // ---- quarry floor ----
        ctx.fillStyle = lg(ctx, 0, fl, 0, h, [[0, '#dcb486'], [0.25, '#cfa676'], [0.65, '#b88e62'], [1, '#94704e']]);
        ctx.fillRect(0, fl, w, h - fl);
        ctx.fillStyle = lg(ctx, 0, fl - 2, 0, fl + h * 0.03, [[0, 'rgba(255,230,180,0.6)'], [1, 'rgba(255,230,180,0)']]); ctx.fillRect(0, fl - 2, w, h * 0.03);
        for (i = 0; i < 8; i++) glow(ctx, w * r(), lerp(fl + h * 0.05, h, r()), w * 0.24, i % 2 ? '#ffe8bc' : '#7a5838', 0.13);
        // tyre tracks (faint)
        ctx.save(); ctx.strokeStyle = 'rgba(90,62,40,0.14)'; ctx.lineWidth = 5 * s;
        [[-0.1, 0.2], [0.02, 0.32]].forEach(function (T) { ctx.beginPath(); ctx.moveTo(w * (0.62 + T[0]), fl); ctx.bezierCurveTo(w * (0.5 + T[0]), h * 0.7, w * (0.85 + T[1]), h * 0.85, w * (0.75 + T[1]), h * 1.02); ctx.stroke(); });
        ctx.restore();
        dots(ctx, 5200, [['#f4dcb0', 0.45], ['#7a5a3e', 0.42], ['#a8805a', 0.45], ['#e8c494', 0.4]], function () { var yy = lerp(fl, h, Math.pow(r(), 0.85)); return [r() * w, yy, (0.25 + r() * 0.6) * s * (0.5 + (yy - fl) / h * 2.2), (r() * 4) | 0]; });
        shards(ctx, 300, function () {
          var yy = lerp(fl + h * 0.01, h, Math.pow(r(), 1.2)), p = (yy - fl) / (h - fl), xx = r() * w, e = Math.min(xx, w - xx) / w;
          if (e > 0.2 && r() < 0.85) return null;
          return [xx, yy, (0.6 + Math.pow(r(), 2) * 3) * s * (0.5 + p * 1.6), (r() * 3) | 0];
        }, ['#c48a58', '#a8703e', '#8a5a36'], '#f4d2a0', '#4a2a18', r);
        // cut sandstone blocks at the far edges
        function block(bx, by, bw2, bh2, dp) {
          ctx.fillStyle = 'rgba(60,36,22,0.4)'; ctx.beginPath(); ctx.ellipse(bx + bw2 * 0.6, by + 2 * s, bw2 * 0.8, 4 * s, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = lg(ctx, 0, by - bh2, 0, by, [[0, '#d8a46e'], [1, '#a8703e']]); ctx.fillRect(bx, by - bh2, bw2, bh2);
          ctx.fillStyle = '#f2d4a0'; ctx.beginPath(); ctx.moveTo(bx, by - bh2); ctx.lineTo(bx + dp, by - bh2 - dp * 0.6); ctx.lineTo(bx + bw2 + dp, by - bh2 - dp * 0.6); ctx.lineTo(bx + bw2, by - bh2); ctx.fill();
          ctx.fillStyle = '#8a5a34'; ctx.beginPath(); ctx.moveTo(bx + bw2, by - bh2); ctx.lineTo(bx + bw2 + dp, by - bh2 - dp * 0.6); ctx.lineTo(bx + bw2 + dp, by - dp * 0.6); ctx.lineTo(bx + bw2, by); ctx.fill();
          ctx.strokeStyle = 'rgba(120,70,40,0.4)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); for (var q = by - bh2 + 3 * s; q < by; q += 3 * s) { ctx.moveTo(bx, q); ctx.lineTo(bx + bw2, q); } ctx.stroke();
        }
        block(-w * 0.02, h * 0.66, w * 0.1, h * 0.06, 6 * s);
        block(w * 0.03, h * 0.96, w * 0.08, h * 0.07, 5 * s);
        block(w * 0.9, h * 0.7, w * 0.11, h * 0.07, 6 * s);
        ctx.fillStyle = lg(ctx, 0, h * 0.82, 0, h, [[0, 'rgba(50,30,20,0)'], [1, 'rgba(50,30,20,0.25)']]); ctx.fillRect(0, h * 0.82, w, h * 0.18);
        finish(ctx, w, h, '#ffb070', 0.2, 0.28, 0.055, '#2a160c');
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = qLayout(w, h), s = L.s, sp = glowSpr('#ffe6b8'), i;
        ctx.save();
        ctx.globalAlpha = 0.08 + 0.04 * Math.sin(t * 0.25);
        var off = (t * 6 * s) % w;
        ctx.fillStyle = 'rgba(255,230,190,1)';
        ctx.fillRect(0, h * 0.5, w, h * 0.04);
        if (sp) {
          ctx.globalCompositeOperation = 'lighter';
          for (i = 0; i < 30; i++) {
            var a = hash(i, 81), b = hash(i, 82), c = hash(i, 83);
            var x = (a * w + off * (0.5 + c)) % w, y = h * (0.25 + b * 0.6) + Math.sin(t * 0.5 + i) * 6 * s, sz = (1.5 + c * 2.5) * s;
            ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * (0.7 + c) + i);
            ctx.drawImage(sp, x - sz, y - sz, sz * 2, sz * 2);
          }
        }
        ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= PINE RIDGE ======================= */
  function prLayout(w, h) { var port = isPort(w, h); return { port: port, s: sc(w, h), hz: h * 0.45, mead: h * 0.53 }; }
  SC.pineridge = {
    paint: function (ctx, w, h) {
      try {
        var r = rng(5101), L = prLayout(w, h), hz = L.hz, s = L.s, md = L.mead, i, x;
        ctx.fillStyle = lg(ctx, 0, 0, 0, md, [[0, '#1f3a72'], [0.3, '#40659e'], [0.62, '#8fb0d6'], [0.85, '#cfdeee'], [1, '#e6eef6']]);
        ctx.fillRect(0, 0, w, md);
        glow(ctx, w * 0.78, h * 0.12, Math.max(w, h) * 0.6, '#eef4ff', 0.4);
        glow(ctx, w * 0.78, h * 0.12, w * 0.05, '#ffffff', 0.9);
        for (i = 0; i < 4; i++) wisp(ctx, w * (0.1 + r() * 0.8), h * (0.05 + r() * 0.12), w * 0.3, h * 0.01, '#f4f8ff', 0.2, r);
        // far giant peaks
        peaks(ctx, w, h, { fy: function (xx) { var u = xx / w; return hz - h * (0.14 + 0.22 * Math.pow(rfbm(u * 2.0 + 1.1, 5111, 5), 1.5)); }, yb: hz, q: 1,
          lit: '#b4c2da', shade: '#62769c', deep: '#4a5c80', snow: '#ffffff', snowShade: '#a6b8d8', snowAmt: 0.62, snowFall: 0.95, haze: '#c6d6ea', hazeA: 0.5, hazeB: 0.15, seed: 5112, dir: 1 });
        // mid snowy ridge
        peaks(ctx, w, h, { fy: function (xx) { var u = xx / w; return hz - h * (0.05 + 0.12 * Math.pow(rfbm(u * 2.8 + 4.2, 5121, 5), 1.3)); }, yb: hz + h * 0.04, q: 1,
          lit: '#a2b4d0', shade: '#4c6288', deep: '#33476c', snow: '#f6faff', snowShade: '#93a9cc', snowAmt: 0.5, snowFall: 1.5, haze: '#b6c8e0', hazeA: 0.5, hazeB: 0.05, seed: 5122, fx: 10, dir: 1 });
        // forest rows on the lower slopes
        var rows = [[hz + h * 0.012, 0.035, '#3c5468', '#5a7488', 0.7, 0.32], [hz + h * 0.04, 0.055, '#26384a', '#46607a', 0.9, 0.2], [hz + h * 0.07, 0.085, '#18283a', '#36506a', 1.2, 0.08]];
        for (var ri = 0; ri < rows.length; ri++) {
          var R = rows[ri], spacing = 3.2 * s * R[4];
          ridge(ctx, 0, w, 4, function (xx) { return R[0] - h * R[1] * 0.5 - h * 0.01 * fbm(xx / w * 5, 5130 + ri, 3); }, R[0] + h * 0.02, R[2]);
          for (x = -10; x < w + 10; x += spacing * (0.5 + r() * 0.8)) {
            var tH = h * R[1] * (0.55 + r() * 0.75) * (0.8 + 0.4 * fbm(x / w * 3, 5140 + ri, 3));
            pine(ctx, x, R[0] + r() * h * 0.012, tH, tH * 0.38, { dark: R[2], lit: R[3], snow: mix('#ffffff', '#c6d4ea', R[5] * 2), snowShade: mix('#a8bcd8', '#8ea4c4', R[5]), dir: 1, snowGap: 0.15 }, r);
          }
          ctx.fillStyle = lg(ctx, 0, R[0] - h * R[1] * 1.3, 0, R[0] + h * 0.02, [[0, 'rgba(200,214,234,0)'], [1, rgba('#c8d6ea', R[5] + 0.12)]]); ctx.fillRect(0, R[0] - h * R[1] * 1.3, w, h * R[1] * 1.3 + h * 0.02);
        }
        // ---- snowy meadow ----
        ctx.beginPath(); ctx.moveTo(0, h);
        for (x = 0; x <= w + 4; x += 4) ctx.lineTo(x, md - h * 0.012 * fbm(x / w * 4, 5151, 3));
        ctx.lineTo(w, h); ctx.closePath();
        ctx.fillStyle = lg(ctx, 0, md - h * 0.02, 0, h, [[0, '#eef3fa'], [0.2, '#e2eaf6'], [0.6, '#d0dcee'], [1, '#b4c4de']]); ctx.fill();
        // drift undulations: shadowed troughs and lit crests
        for (i = 0; i < 12; i++) {
          var dy = lerp(md + h * 0.03, h * 1.02, Math.pow(i / 11, 1.2)), p = (dy - md) / (h - md), dx = r() * w;
          ctx.save(); ctx.translate(dx, dy); ctx.scale(1, 0.12 + p * 0.06);
          ctx.fillStyle = rg(ctx, 0, 0, 0, w * (0.25 + r() * 0.2), [[0, 'rgba(120,145,190,0.3)'], [0.7, 'rgba(120,145,190,0.12)'], [1, 'rgba(120,145,190,0)']]);
          ctx.fillRect(-w * 0.5, -w * 0.5, w, w); ctx.restore();
          ctx.save(); ctx.translate(dx + w * 0.04, dy - h * 0.012); ctx.scale(1, 0.08);
          ctx.fillStyle = rg(ctx, 0, 0, 0, w * 0.22, [[0, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']]);
          ctx.fillRect(-w * 0.3, -w * 0.3, w * 0.6, w * 0.6); ctx.restore();
        }
        // wind-carved sastrugi strokes
        batch(ctx, 420, [['#ffffff', 0.9 * s, 0.35], ['#a4b6d6', 0.8 * s, 0.22]], function () {
          var yy = lerp(md + h * 0.01, h, Math.pow(r(), 0.9)), p = (yy - md) / (h - md), xx = r() * w, l = (4 + p * 30) * s * (0.3 + r());
          return [xx, yy, xx + l, yy + (r() - 0.5) * s, r() < 0.55 ? 0 : 1, xx + l * 0.5, yy - p * 1.2 * s];
        });
        // sparkle
        dots(ctx, 700, [['#ffffff', 0.9], ['#cfe4ff', 0.7]], function () { var yy = lerp(md, h, Math.pow(r(), 0.8)); return [r() * w, yy, (0.25 + r() * 0.5) * s * (0.6 + (yy - md) / h * 2), r() < 0.6 ? 0 : 1]; });
        // dry grass tips + snow-capped rocks at edges
        grassField(ctx, w, h, md + h * 0.02, h, 500, [['#7a6a52', 0.6 * s, 0.6], ['#a8946c', 0.5 * s, 0.6]], r, s, 0.1, function (u) { return u < 0.5 ? u * w * 0.36 : w - (u - 0.5) * w * 0.36; });
        function rock(rx, ry, rw, rh) {
          ctx.fillStyle = 'rgba(80,100,140,0.35)'; ctx.beginPath(); ctx.ellipse(rx + rw * 0.1, ry + rh * 0.08, rw * 0.62, rh * 0.18, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = lg(ctx, rx - rw / 2, 0, rx + rw / 2, 0, [[0, '#3a4458'], [0.6, '#5a6478'], [1, '#7a8498']]);
          ctx.beginPath(); ctx.moveTo(rx - rw * 0.5, ry); ctx.lineTo(rx - rw * 0.42, ry - rh * 0.6); ctx.lineTo(rx - rw * 0.1, ry - rh); ctx.lineTo(rx + rw * 0.3, ry - rh * 0.85); ctx.lineTo(rx + rw * 0.5, ry - rh * 0.3); ctx.lineTo(rx + rw * 0.52, ry); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#f6faff'; ctx.beginPath(); ctx.moveTo(rx - rw * 0.44, ry - rh * 0.55); ctx.lineTo(rx - rw * 0.1, ry - rh * 1.04); ctx.lineTo(rx + rw * 0.32, ry - rh * 0.88); ctx.lineTo(rx + rw * 0.46, ry - rh * 0.5); ctx.quadraticCurveTo(rx, ry - rh * 0.62, rx - rw * 0.44, ry - rh * 0.55); ctx.fill();
          ctx.fillStyle = 'rgba(160,180,215,0.8)'; ctx.beginPath(); ctx.moveTo(rx - rw * 0.44, ry - rh * 0.55); ctx.quadraticCurveTo(rx - rw * 0.3, ry - rh * 0.85, rx - rw * 0.1, ry - rh * 1.04); ctx.lineTo(rx - rw * 0.15, ry - rh * 0.65); ctx.fill();
          ctx.fillStyle = '#f0f5fc'; ctx.beginPath(); ctx.ellipse(rx, ry, rw * 0.62, rh * 0.12, 0, 0, TAU); ctx.fill();
        }
        rock(w * 0.06, h * 0.9, w * 0.12, h * 0.07); rock(w * 0.96, h * 0.75, w * 0.1, h * 0.06); rock(w * 0.9, h * 0.97, w * 0.14, h * 0.08);
        // big framing snowy pines
        var edges = L.port ? [[-0.02, 0.62, 0.5], [0.06, 0.6, 0.36], [1.0, 0.6, 0.52], [0.93, 0.58, 0.32]] : [[0.0, 0.64, 0.58], [0.06, 0.6, 0.42], [0.11, 0.57, 0.26], [0.99, 0.62, 0.54], [0.92, 0.58, 0.36]];
        for (i = 0; i < edges.length; i++) {
          var eH = h * edges[i][2], ex = w * edges[i][0], ey = h * edges[i][1];
          ctx.save(); ctx.translate(ex, ey); ctx.scale(1, 0.18); glow(ctx, 0, 0, eH * 0.4, '#5a70a0', 0.4); ctx.restore();
          pine(ctx, ex, ey, eH, eH * 0.34, { dark: '#132234', lit: '#2c4a62', snow: '#f8fbff', snowShade: '#a4b8d8', dir: 1, snowGap: 0.05, trunk: '#2a2018' }, r);
        }
        shafts(ctx, w * 0.78, h * 0.12, w, h, '#eef6ff', 0.03, 7, r, 0.8, PI * 0.65);
        ctx.fillStyle = lg(ctx, 0, h * 0.85, 0, h, [[0, 'rgba(60,80,130,0)'], [1, 'rgba(60,80,130,0.2)']]); ctx.fillRect(0, h * 0.85, w, h * 0.15);
        finish(ctx, w, h, '#9ec0ff', 0.18, 0.26, 0.045, '#101830');
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var s = sc(w, h), i;
        ctx.save(); ctx.fillStyle = '#ffffff';
        for (var layer = 0; layer < 3; layer++) {
          var n = [70, 40, 16][layer], sz = [0.7, 1.2, 2.0][layer] * s, sp = [14, 24, 40][layer] * s, al = [0.5, 0.75, 0.9][layer];
          ctx.globalAlpha = al; ctx.beginPath();
          for (i = 0; i < n; i++) {
            var a = hash(i, 91 + layer), b = hash(i, 101 + layer), c = hash(i, 111 + layer);
            var y = ((b * h + t * sp * (0.8 + c * 0.4)) % (h + 10)) - 5;
            var x = ((a * w + Math.sin(t * (0.5 + c) + i) * 10 * s + t * sp * 0.25) % w + w) % w;
            var z = sz * (0.7 + c * 0.6);
            ctx.moveTo(x + z, y); ctx.arc(x, y, z, 0, TAU);
          }
          ctx.fill();
        }
        ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= STORM PIER ======================= */
  function spLayout(w, h) {
    var port = isPort(w, h);
    return { port: port, s: sc(w, h), hz: h * 0.46, shore: h * 0.6, lhX: w * (port ? 0.84 : 0.85), lhTop: h * 0.255, lhBase: h * 0.385 };
  }
  SC.stormpier = {
    paint: function (ctx, w, h) {
      try {
        var r = rng(6101), L = spLayout(w, h), hz = L.hz, s = L.s, sh = L.shore, i, x, y, k;
        ctx.fillStyle = lg(ctx, 0, 0, 0, hz, [[0, '#151b22'], [0.35, '#283440'], [0.7, '#46545e'], [0.9, '#6e7c82'], [1, '#8a9694']]);
        ctx.fillRect(0, 0, w, hz + 2);
        // pale break near the horizon
        haze(ctx, w * 0.1, hz - h * 0.1, w * 0.7, hz + h * 0.02, '#b8c4c0', 0.35);
        // heavy cloud masses: rolling layers, dark tops, slightly lit undersides
        for (k = 0; k < 4; k++) {
          var cy = h * (0.04 + k * 0.08), n = 7 + k * 2;
          for (i = 0; i < n; i++) {
            var cx = w * ((i + r() * 0.8) / n) - w * 0.05, sz = w * (0.07 + r() * 0.06) * (1 - k * 0.12);
            cloud(ctx, cx, cy + r() * h * 0.04, sz, r, mix('#5c6a74', '#7e8c92', k / 3), mix('#0e1318', '#2a343c', k / 3), 0.6 - k * 0.06);
          }
        }
        // distant rain curtains
        for (i = 0; i < 6; i++) {
          var rx = w * r(), rw = w * (0.05 + r() * 0.1), ry0 = h * (0.2 + r() * 0.08);
          ctx.fillStyle = lg(ctx, 0, ry0, 0, hz, [[0, 'rgba(40,50,58,0)'], [0.4, 'rgba(40,50,58,0.25)'], [1, 'rgba(60,70,76,0.1)']]);
          ctx.beginPath(); ctx.moveTo(rx, ry0); ctx.lineTo(rx + rw, ry0); ctx.lineTo(rx + rw - w * 0.04, hz); ctx.lineTo(rx - w * 0.04, hz); ctx.fill();
        }
        // headland
        var hx0 = w * (L.port ? 0.62 : 0.68);
        ridge(ctx, hx0, w, 2, function (xx) { var u = (xx - hx0) / (w - hx0); return hz - h * 0.002 - (L.lhBase - hz + h * 0.002) * -1 * smooth(0, 0.35, u) * 1 - h * 0.012 * fbm(xx / w * 9, 6111, 4) * smooth(0, 0.2, u) + (hz - L.lhBase) * 0; }, hz + 2, null);
        ctx.beginPath(); ctx.moveTo(hx0, hz + 2);
        for (x = hx0; x <= w + 2; x += 2) { var u2 = (x - hx0) / (w - hx0); ctx.lineTo(x, lerp(hz, L.lhBase, smooth(0, 0.4, u2)) - h * 0.014 * fbm(x / w * 9, 6111, 4) * smooth(0, 0.3, u2)); }
        ctx.lineTo(w + 2, hz + 2); ctx.closePath();
        ctx.fillStyle = lg(ctx, 0, L.lhBase - h * 0.02, 0, hz, [[0, '#2e3438'], [1, '#1a1e22']]); ctx.fill();
        ctx.save(); ctx.clip();
        batch(ctx, 300, [['#5a646a', 0.6 * s, 0.5], ['#0c1014', 0.8 * s, 0.5]], function () { var xx = lerp(hx0, w, r()), yy = lerp(L.lhBase - h * 0.02, hz, r()); return [xx, yy, xx + (r() - 0.6) * 3 * s, yy + (2 + r() * 6) * s, r() < 0.4 ? 0 : 1]; });
        ctx.restore();
        // lighthouse
        var lx = L.lhX, lb = L.lhBase - h * 0.004, lt = L.lhTop, bw0 = 7 * s, bw1 = 4.6 * s;
        ctx.fillStyle = lg(ctx, lx - bw0, 0, lx + bw0, 0, [[0, '#c8c6be'], [0.45, '#9a9a94'], [1, '#4a4c4e']]);
        ctx.beginPath(); ctx.moveTo(lx - bw0, lb); ctx.lineTo(lx - bw1, lt); ctx.lineTo(lx + bw1, lt); ctx.lineTo(lx + bw0, lb); ctx.fill();
        ctx.fillStyle = 'rgba(140,40,36,0.85)';
        for (i = 0; i < 2; i++) { var b0 = lerp(lb, lt, 0.25 + i * 0.35), b1 = b0 - (lb - lt) * 0.13, wa = lerp(bw0, bw1, (lb - b0) / (lb - lt)), wb = lerp(bw0, bw1, (lb - b1) / (lb - lt)); ctx.beginPath(); ctx.moveTo(lx - wa, b0); ctx.lineTo(lx - wb, b1); ctx.lineTo(lx + wb, b1); ctx.lineTo(lx + wa, b0); ctx.fill(); }
        ctx.fillStyle = '#2a2c2e'; ctx.fillRect(lx - bw1 * 1.4, lt - 1.2 * s, bw1 * 2.8, 1.6 * s);
        ctx.fillStyle = '#ffe8a0'; ctx.fillRect(lx - bw1 * 0.85, lt - 6 * s, bw1 * 1.7, 4.8 * s);
        ctx.fillStyle = '#2a2c2e'; ctx.beginPath(); ctx.moveTo(lx - bw1 * 1.1, lt - 6 * s); ctx.lineTo(lx, lt - 10 * s); ctx.lineTo(lx + bw1 * 1.1, lt - 6 * s); ctx.fill();
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, lx, lt - 3.6 * s, 30 * s, '#ffe2a0', 0.45); glow(ctx, lx, lt - 3.6 * s, 7 * s, '#ffffff', 0.8); ctx.restore();
        // keeper's cottage
        ctx.fillStyle = '#3a3e42'; ctx.fillRect(lx + bw0 + 2 * s, lb - 7 * s, 14 * s, 7 * s);
        ctx.fillStyle = '#24282c'; ctx.beginPath(); ctx.moveTo(lx + bw0 + 1 * s, lb - 7 * s); ctx.lineTo(lx + bw0 + 9 * s, lb - 12 * s); ctx.lineTo(lx + bw0 + 17 * s, lb - 7 * s); ctx.fill();
        ctx.fillStyle = 'rgba(255,210,130,0.8)'; ctx.fillRect(lx + bw0 + 5 * s, lb - 5 * s, 2.4 * s, 2.2 * s);
        // ---- sea ----
        ctx.fillStyle = lg(ctx, 0, hz, 0, sh, [[0, '#56646a'], [0.08, '#34444c'], [0.5, '#2a3a42'], [1, '#334a50']]);
        ctx.fillRect(0, hz, w, sh - hz + 2);
        haze(ctx, w * 0.05, hz - h * 0.005, w * 0.75, hz + h * 0.04, '#8a9a9c', 0.35);
        // rolling swells (back to front)
        var NR = 26;
        for (k = 0; k < NR; k++) {
          var p = k / (NR - 1), wy = hz + 1 + Math.pow(p, 1.8) * (sh - hz - 2), amp = (0.4 + p * 5) * s, fr = (6 + (1 - p) * 30) / w, ph = r() * 10;
          var crest = function (xx) { return wy - amp * (0.6 * Math.sin(xx * fr + ph) + 0.6 * (fbm(xx / w * (8 + p * 4), 6120 + k, 3) - 0.5) * 2); };
          ctx.beginPath(); ctx.moveTo(0, wy + amp * 3);
          for (x = 0; x <= w + 4; x += 4) ctx.lineTo(x, crest(x));
          ctx.lineTo(w, wy + amp * 3); ctx.closePath();
          ctx.fillStyle = lg(ctx, 0, wy - amp, 0, wy + amp * 3, [[0, rgba('#6c7e84', 0.55)], [0.3, rgba('#3a4c54', 0.6)], [1, rgba('#1e2c34', 0.0)]]); ctx.fill();
          // whitecaps
          batch(ctx, Math.round(6 + p * 26), [['#e8eef0', (0.4 + p * 1.2) * s, 0.6], ['#b4c4c8', (0.3 + p * 0.8) * s, 0.4]], function () {
            var xx = r() * w; if (Math.sin(xx * fr + ph) < 0.5 && r() < 0.9) return null;
            var yy = crest(xx), l = (1.5 + p * 9) * s * (0.4 + r());
            return [xx, yy, xx + l, yy + amp * 0.3, r() < 0.6 ? 0 : 1, xx + l * 0.4, yy - amp * 0.45];
          });
          if (p > 0.4) dots(ctx, Math.round(p * 60), [['#ffffff', 0.5]], function () { var xx = r() * w; return [xx, crest(xx) + r() * amp * 1.5, (0.3 + r() * 0.8) * s * p, 0]; });
        }
        // breaking shorebreak foam band
        ctx.beginPath(); ctx.moveTo(0, sh + h * 0.01);
        for (x = 0; x <= w + 4; x += 4) ctx.lineTo(x, sh - h * 0.012 - h * 0.008 * fbm(x / w * 6, 6131, 3));
        ctx.lineTo(w, sh + h * 0.01); ctx.closePath();
        ctx.fillStyle = lg(ctx, 0, sh - h * 0.02, 0, sh + h * 0.01, [[0, 'rgba(240,246,246,0.9)'], [0.5, 'rgba(200,214,216,0.6)'], [1, 'rgba(160,180,184,0)']]); ctx.fill();
        // ---- beach: dark wet sand reflecting the sky ----
        ctx.fillStyle = lg(ctx, 0, sh, 0, h, [[0, '#5a6466'], [0.08, '#465052'], [0.4, '#3a3e3c'], [1, '#2a2a28']]); ctx.fillRect(0, sh, w, h - sh);
        mirror(ctx, w, sh, h * 0.14, sh, sh + h * 0.12, 0.18, 0);
        // lighthouse glow reflection streak on wet sand
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg(ctx, 0, sh, 0, h * 0.85, [[0, 'rgba(255,220,150,0.12)'], [1, 'rgba(255,220,150,0)']]); ctx.fillRect(L.lhX - 6 * s, sh, 12 * s, h * 0.25);
        ctx.restore();
        // foam lace and wet sheen
        batch(ctx, 500, [['#c8d4d6', 0.7 * s, 0.4], ['#7a8a8e', 0.7 * s, 0.35]], function () { var yy = lerp(sh, sh + h * 0.1, Math.pow(r(), 1.5)), xx = r() * w, l = (4 + r() * 16) * s; return [xx, yy, xx + l, yy + (r() - 0.5) * s, r() < 0.5 ? 0 : 1, xx + l / 2, yy + (r() - 0.5) * 2 * s]; });
        for (i = 0; i < 7; i++) { ctx.save(); ctx.translate(w * r(), lerp(sh + h * 0.06, h, r())); ctx.scale(1, 0.2); glow(ctx, 0, 0, w * (0.08 + r() * 0.1), '#8a9a9e', 0.3); ctx.restore(); }
        dots(ctx, 3500, [['#7a7e7a', 0.4], ['#1a1c1c', 0.4], ['#9a9e98', 0.3]], function () { var yy = lerp(sh + h * 0.01, h, Math.pow(r(), 0.85)); return [r() * w, yy, (0.25 + r() * 0.5) * s * (0.6 + (yy - sh) / h * 2), (r() * 3) | 0]; });
        pebbles(ctx, 260, function () {
          var yy = lerp(sh + h * 0.03, h, Math.pow(r(), 1.1)), p2 = (yy - sh) / (h - sh), xx = r() * w; if (Math.min(xx, w - xx) / w > 0.2 && r() < 0.85) return null;
          var rr = (1 + r() * 3) * s * (0.5 + p2 * 1.6); return [xx, yy, rr * 1.2, rr * 0.7, (r() * 3) | 0];
        }, ['#2e3234', '#40464a', '#262a2c'], '#0a0c0e', '#9aa6aa');
        // ---- long wooden pier from the left foreground toward the horizon ----
        var vpX = w * (L.port ? 0.4 : 0.42), yN = h * 0.67, xN = w * (L.port ? -0.02 : 0.02), hwN = w * (L.port ? 0.15 : 0.11), clrN = h * 0.09;
        function P(z) { return [vpX + (xN - vpX) / z, hz + 1 + (yN - hz - 1) / z, hwN / z, clrN / z]; }
        var zs = []; for (var z = 1; z < 16; z *= 1.16) zs.push(z);
        // pilings (far to near)
        for (i = zs.length - 1; i >= 0; i--) {
          var Q = P(zs[i]), pw = Math.max(0.8, 4.2 * s / zs[i]);
          [-1, 1].forEach(function (sd) {
            var px = Q[0] + sd * Q[2] * 0.92;
            ctx.fillStyle = lg(ctx, px - pw / 2, 0, px + pw / 2, 0, [[0, '#4a4440'], [0.5, '#2a2624'], [1, '#141210']]);
            ctx.fillRect(px - pw / 2, Q[1], pw, Q[3] * 1.15);
            ctx.fillStyle = 'rgba(220,230,230,0.35)'; ctx.fillRect(px - pw * 0.7, Q[1] + Q[3] * 1.0, pw * 1.4, Math.max(0.6, Q[3] * 0.06));
          });
          if (i % 2 === 0 && zs[i] < 9) { ctx.strokeStyle = 'rgba(30,26,24,0.8)'; ctx.lineWidth = Math.max(0.5, 1.2 * s / zs[i]); ctx.beginPath(); ctx.moveTo(Q[0] - Q[2] * 0.92, Q[1] + Q[3] * 0.1); ctx.lineTo(Q[0] + Q[2] * 0.92, Q[1] + Q[3] * 0.8); ctx.moveTo(Q[0] + Q[2] * 0.92, Q[1] + Q[3] * 0.1); ctx.lineTo(Q[0] - Q[2] * 0.92, Q[1] + Q[3] * 0.8); ctx.stroke(); }
        }
        var Pf = P(16), Pn = P(1);
        ctx.fillStyle = '#1c1816';
        ctx.beginPath(); ctx.moveTo(Pf[0] - Pf[2], Pf[1]); ctx.lineTo(Pn[0] - Pn[2], Pn[1]); ctx.lineTo(Pn[0] - Pn[2], Pn[1] + 7 * s); ctx.lineTo(Pf[0] - Pf[2], Pf[1] + 0.6); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(Pf[0] + Pf[2], Pf[1]); ctx.lineTo(Pn[0] + Pn[2], Pn[1]); ctx.lineTo(Pn[0] + Pn[2], Pn[1] + 7 * s); ctx.lineTo(Pf[0] + Pf[2], Pf[1] + 0.6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = lg(ctx, 0, Pf[1], 0, Pn[1], [[0, '#5a5a56'], [1, '#6a5e52']]);
        ctx.beginPath(); ctx.moveTo(Pf[0] - Pf[2], Pf[1]); ctx.lineTo(Pf[0] + Pf[2], Pf[1]); ctx.lineTo(Pn[0] + Pn[2], Pn[1]); ctx.lineTo(Pn[0] - Pn[2], Pn[1]); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.clip();
        ctx.strokeStyle = 'rgba(20,16,14,0.5)'; ctx.lineWidth = 0.6 * s; ctx.beginPath();
        for (var zz = 1; zz < 16; zz *= 1.035) { var Qp = P(zz); ctx.moveTo(Qp[0] - Qp[2], Qp[1]); ctx.lineTo(Qp[0] + Qp[2], Qp[1]); }
        ctx.stroke();
        ctx.fillStyle = lg(ctx, 0, Pf[1], 0, Pn[1], [[0, 'rgba(150,170,175,0.35)'], [1, 'rgba(150,170,175,0.1)']]); ctx.fillRect(0, Pf[1], w, Pn[1] - Pf[1]);
        ctx.restore();
        // railings + lamp posts
        ctx.lineCap = 'round';
        [-1, 1].forEach(function (sd) {
          ctx.strokeStyle = '#141210'; ctx.lineWidth = 1 * s; ctx.beginPath();
          for (var z2 = 1; z2 < 16; z2 *= 1.16) { var Qr = P(z2), rh = 14 * s / z2; ctx.moveTo(Qr[0] + sd * Qr[2], Qr[1]); ctx.lineTo(Qr[0] + sd * Qr[2], Qr[1] - rh); }
          ctx.stroke();
          ctx.lineWidth = 1.3 * s; ctx.beginPath(); var A = P(16), B = P(1); ctx.moveTo(A[0] + sd * A[2], A[1] - 14 * s / 16); ctx.lineTo(B[0] + sd * B[2], B[1] - 14 * s); ctx.stroke();
          ctx.strokeStyle = 'rgba(170,185,190,0.45)'; ctx.lineWidth = 0.5 * s; ctx.stroke();
        });
        [1.6, 3.2, 6.4].forEach(function (zl) {
          var Ql = P(zl), lh = 34 * s / zl, lxp = Ql[0] + Ql[2];
          ctx.strokeStyle = '#141210'; ctx.lineWidth = Math.max(0.6, 2 * s / zl); ctx.beginPath(); ctx.moveTo(lxp, Ql[1]); ctx.lineTo(lxp, Ql[1] - lh); ctx.stroke();
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, lxp, Ql[1] - lh, 16 * s / zl + 3, '#ffd890', 0.5); ctx.restore();
          ctx.fillStyle = '#fff2c8'; ctx.beginPath(); ctx.arc(lxp, Ql[1] - lh, Math.max(0.7, 2 * s / zl), 0, TAU); ctx.fill();
        });
        // storm darkening at top + bottom
        ctx.fillStyle = lg(ctx, 0, 0, 0, h * 0.25, [[0, 'rgba(8,10,14,0.45)'], [1, 'rgba(8,10,14,0)']]); ctx.fillRect(0, 0, w, h * 0.25);
        ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, 'rgba(10,12,14,0)'], [1, 'rgba(10,12,14,0.35)']]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
        finish(ctx, w, h, '#6a8a9a', 0.2, 0.36, 0.06, '#05080c');
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = spLayout(w, h), s = L.s, i, lx = L.lhX, ly = L.lhTop - 3.6 * s;
        ctx.save();
        // lighthouse beam sweep
        var ang = t * 1.1, c = Math.cos(ang), sn = Math.sin(ang), len = w * 1.1 * Math.abs(c) + w * 0.05, spread = h * (0.02 + 0.05 * (1 - Math.abs(c)));
        ctx.globalCompositeOperation = 'lighter';
        var ex = lx + (c >= 0 ? 1 : -1) * len, g = ctx.createLinearGradient(lx, ly, ex, ly);
        var ba = 0.22 * (0.4 + 0.6 * Math.abs(c)) * (sn > 0 ? 1 : 0.5);
        g.addColorStop(0, 'rgba(255,236,180,' + ba.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,236,180,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(lx, ly - 1.5 * s); ctx.lineTo(ex, ly - spread); ctx.lineTo(ex, ly + spread * 0.9); ctx.lineTo(lx, ly + 1.5 * s); ctx.closePath(); ctx.fill();
        var fa = Math.pow(Math.max(0, sn), 8) * 0.9 + 0.1;
        var sp = glowSpr('#fff0c0'); if (sp) { ctx.globalAlpha = fa; var z = (14 + 24 * fa) * s; ctx.drawImage(sp, lx - z, ly - z, z * 2, z * 2); ctx.globalAlpha = 1; }
        ctx.globalCompositeOperation = 'source-over';
        // rain sheets (broad translucent bands moving diagonally)
        for (i = 0; i < 3; i++) {
          var bx = ((t * (40 + i * 15) * s + i * w * 0.45) % (w * 1.6)) - w * 0.3, bwid = w * (0.18 + i * 0.06);
          ctx.globalAlpha = 0.07; ctx.fillStyle = '#a8b4bc';
          ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx + bwid, 0); ctx.lineTo(bx + bwid - h * 0.35, h); ctx.lineTo(bx - h * 0.35, h); ctx.fill();
        }
        // rain streaks
        ctx.lineCap = 'round';
        for (var layer = 0; layer < 2; layer++) {
          var n = layer ? 60 : 130, ln = (layer ? 16 : 9) * s, spd = (layer ? 900 : 600) * s;
          ctx.globalAlpha = layer ? 0.4 : 0.28; ctx.strokeStyle = '#cdd8de'; ctx.lineWidth = (layer ? 1.0 : 0.6) * s; ctx.beginPath();
          for (i = 0; i < n; i++) {
            var a = hash(i, 121 + layer), b = hash(i, 131 + layer);
            var y = (b * h + t * spd * (0.8 + a * 0.4)) % (h + ln), x = ((a * w * 1.3 - y * 0.35) % w + w) % w;
            ctx.moveTo(x, y - ln); ctx.lineTo(x - ln * 0.35, y);
          }
          ctx.stroke();
        }
        // lightning
        var per = 6.7, cyc = Math.floor(t / per), ph = t - cyc * per, fire = hash(cyc, 141) < 0.75;
        if (fire && ph < 0.42) {
          var fl = ph < 0.08 ? 1 : ph < 0.16 ? 0.35 : ph < 0.24 ? 0.8 : Math.max(0, 1 - (ph - 0.24) / 0.18) * 0.5;
          ctx.globalAlpha = 0.28 * fl; ctx.fillStyle = '#dfe8ff'; ctx.fillRect(0, 0, w, h);
          var bx2 = w * (0.12 + hash(cyc, 142) * 0.5), by2 = h * 0.08, rr = rng(cyc * 7 + 3);
          ctx.globalAlpha = Math.min(1, fl * 1.2); ctx.strokeStyle = '#f4f6ff'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(bx2, by2);
          var X = bx2, Y = by2;
          while (Y < L.hz) { X += (rr() - 0.5) * 14 * s; Y += (4 + rr() * 8) * s; ctx.lineTo(X, Y); if (rr() < 0.12) { ctx.moveTo(X + 10 * s * (rr() - 0.3), Y + 10 * s); ctx.moveTo(X, Y); } }
          ctx.stroke(); ctx.globalAlpha = fl * 0.35; ctx.lineWidth = 5 * s; ctx.strokeStyle = '#9ab0ff'; ctx.stroke();
        }
        ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= ASH HILLS ======================= */
  function ahLayout(w, h) {
    var port = isPort(w, h);
    return { port: port, s: sc(w, h), hz: h * 0.46, gnd: h * 0.545, vx: w * (port ? 0.56 : 0.6), vTop: h * (port ? 0.2 : 0.17), vW: w * (port ? 0.42 : 0.36) };
  }
  var smokeSpr = null;
  function getSmoke() {
    if (smokeSpr !== null) return smokeSpr;
    smokeSpr = mk(200, 100); if (smokeSpr) cloud(smokeSpr.getContext('2d'), 100, 66, 34, rng(77), '#6a5652', '#1e1414', 0.7);
    return smokeSpr;
  }
  SC.ashhills = {
    paint: function (ctx, w, h) {
      try {
        var r = rng(7101), L = ahLayout(w, h), hz = L.hz, s = L.s, gd = L.gnd, i, x, y, k, vx = L.vx, vt = L.vTop, vw = L.vW;
        ctx.fillStyle = lg(ctx, 0, 0, 0, gd, [[0, '#120c10'], [0.3, '#2a1618'], [0.6, '#5a2a1e'], [0.85, '#8a3c1e'], [1, '#a8522a']]);
        ctx.fillRect(0, 0, w, gd);
        glow(ctx, vx, vt, Math.max(w, h) * 0.6, '#ff6a20', 0.3);
        // ash cloud ceiling
        for (k = 0; k < 3; k++) for (i = 0; i < 8; i++) cloud(ctx, w * (i / 7) + (r() - 0.5) * w * 0.1, h * (0.02 + k * 0.05) + r() * h * 0.03, w * (0.06 + r() * 0.05), r, mix('#5a3a34', '#8a4a30', k / 2), '#0e0808', 0.5 - k * 0.08);
        // far smouldering ridges
        peaks(ctx, w, h, { fy: function (xx) { return hz - h * 0.05 - h * 0.07 * Math.pow(rfbm(xx / w * 2.5, 7111, 5), 1.3); }, yb: hz + 2, q: 0.55, lit: '#7a3a2a', shade: '#4a2622', deep: '#3a1c1c', haze: '#8a3c24', hazeA: 0.4, hazeB: 0.3, seed: 7112, fx: 10, dir: 1 });
        // volcano cone
        function cone(xx) {
          var u = (xx - vx) / vw, au = Math.abs(u), crater = vw * 0.09;
          var prof = au < 0.09 ? vt + h * 0.012 * (1 - Math.pow(au / 0.09, 2)) * 0.6 : vt + (hz - vt) * Math.pow((au - 0.09) / 0.91, 0.75);
          return Math.min(hz + 4, prof) + h * 0.01 * (fbm(xx / w * 14, 7121, 3) - 0.5) * smooth(0.05, 0.3, au);
        }
        peaks(ctx, w, h, { fy: cone, yb: hz + 4, q: 1, lit: '#6a4038', shade: '#2a1c1e', deep: '#140e10', haze: '#7a3a26', hazeA: 0.35, hazeB: 0.05, seed: 7122, fx: 18, fyf: 2, dir: 1, k: 12, rim: '#ff7a30', rimA: 0.5 });
        // crater glow
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        glow(ctx, vx, vt + h * 0.005, vw * 0.5, '#ff5a10', 0.55);
        glow(ctx, vx, vt + h * 0.006, vw * 0.14, '#ffc060', 0.8);
        ctx.restore();
        ctx.strokeStyle = '#ffb050'; ctx.lineWidth = 1.2 * s; ctx.beginPath();
        for (x = vx - vw * 0.09; x <= vx + vw * 0.09; x += 1) { var cy = cone(x); if (x === vx - vw * 0.09) ctx.moveTo(x, cy); else ctx.lineTo(x, cy); }
        ctx.stroke();
        // lava rivers down the flanks
        function lavaPath(seed2, x0, side, len) {
          var rr = rng(seed2), pts = [], X = x0, Y = cone(x0) + 1;
          for (var j = 0; j < 60; j++) { pts.push([X, Y]); X += side * (0.35 + rr() * 0.9) * s + (rr() - 0.5) * 1.6 * s; Y += (1.6 + rr() * 2.2) * s; Y = Math.max(Y, cone(X) + 3 * s); if (Y > hz + h * 0.005 || j > len) break; }
          return pts;
        }
        var flows = [lavaPath(7131, vx - vw * 0.05, -1, 60), lavaPath(7132, vx + vw * 0.05, 1, 50), lavaPath(7133, vx + vw * 0.015, 0.4, 26), lavaPath(7134, vx - vw * 0.02, -0.6, 34)];
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        flows.forEach(function (pts) {
          [[7 * s, 'rgba(255,90,20,0.18)', 'lighter'], [3 * s, '#c8381a', 'source-over'], [1.6 * s, '#ff8a2a', 'source-over'], [0.7 * s, '#ffe08a', 'source-over']].forEach(function (st) {
            ctx.globalCompositeOperation = st[2]; ctx.strokeStyle = st[1]; ctx.lineWidth = st[0]; ctx.beginPath();
            for (var j = 0; j < pts.length; j++) { if (!j) ctx.moveTo(pts[j][0], pts[j][1]); else ctx.lineTo(pts[j][0], pts[j][1]); }
            ctx.stroke();
          });
        });
        ctx.restore();
        // smoke plume rising from the crater, lit from below
        for (i = 0; i < 16; i++) {
          var tt = i / 15, px = vx + tt * w * 0.22 + Math.sin(tt * 4) * w * 0.03, py = vt - tt * h * 0.18 - h * 0.02, sz = w * (0.035 + tt * 0.06);
          cloud(ctx, px, py, sz, r, mix('#ff8a40', '#5a4440', Math.pow(tt, 0.5)), mix('#4a1a10', '#140c0c', tt), 0.55 - tt * 0.2);
        }
        // nearer dark hills with rim light
        peaks(ctx, w, h, { fy: function (xx) { var u = xx / w; return hz + h * 0.04 - h * 0.12 * Math.pow(fbm(u * 2.4 + 3, 7141, 5), 2.4) * (0.25 + 1.6 * smooth(0.4, 0.05, Math.abs(u - (L.port ? 0.12 : 0.1))) + 1.4 * smooth(0.35, 0.05, Math.abs(u - 0.95))); }, yb: gd + 2, q: 1, k: 4,
          lit: '#4a3030', shade: '#1e1618', deep: '#100c0e', haze: '#5a2a1e', hazeA: 0.25, hazeB: 0.0, seed: 7142, fx: 14, dir: 1, rim: '#ff6a28', rimA: 0.7 });
        // fissures in the hills
        ctx.save(); ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 7; i++) {
          var fx0 = r() < 0.5 ? r() * w * 0.3 : w * (0.7 + r() * 0.3), fy0 = hz + r() * h * 0.06, rr3 = rng(7150 + i);
          ctx.strokeStyle = 'rgba(255,110,30,0.6)'; ctx.lineWidth = (0.7 + rr3()) * s; ctx.beginPath(); ctx.moveTo(fx0, fy0);
          for (var j = 0; j < 8; j++) { fx0 += (rr3() - 0.5) * 8 * s; fy0 += (1 + rr3() * 3) * s; ctx.lineTo(fx0, fy0); }
          ctx.stroke();
        }
        ctx.restore();
        band(ctx, w, hz - h * 0.08, hz + h * 0.06, '#a84a26', 0.3);
        // ---- basalt ground ----
        ctx.beginPath(); ctx.moveTo(0, h);
        for (x = 0; x <= w + 4; x += 4) ctx.lineTo(x, gd - h * 0.006 * fbm(x / w * 6, 7161, 3));
        ctx.lineTo(w, h); ctx.closePath();
        ctx.fillStyle = lg(ctx, 0, gd, 0, h, [[0, '#4a3030'], [0.12, '#2e2224'], [0.5, '#221a1c'], [1, '#161012']]); ctx.fill();
        // warm light from the volcano on the ground
        ctx.save(); ctx.translate(vx, gd); ctx.scale(1, 0.35); glow(ctx, 0, 0, w * 0.6, '#ff6a2a', 0.22); ctx.restore();
        // basalt plates: crack network
        var cells = [], nc = 70;
        for (i = 0; i < nc; i++) { var cyy = lerp(gd + h * 0.01, h * 1.02, Math.pow(r(), 0.8)); cells.push([r() * w, cyy]); }
        dabs(ctx, 1400, [['#3a2e30', 0.5], ['#120c0e', 0.45], ['#5a4442', 0.35]], function () { var yy = lerp(gd, h, Math.pow(r(), 0.85)), p = (yy - gd) / (h - gd); return [r() * w, yy, (1 + r() * 5) * s * (0.4 + p * 1.5), (0.4 + r() * 1.2) * s * (0.4 + p), (r() * 3) | 0]; });
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        var cracks = [];
        for (i = 0; i < 46; i++) {
          var A = cells[(r() * nc) | 0], ax = A[0], ay = A[1], pp = (ay - gd) / (h - gd), segs = [], ang = r() * TAU;
          for (var q = 0; q < 5; q++) { ang += (r() - 0.5) * 0.9; ax += Math.cos(ang) * (4 + r() * 10) * s * (0.5 + pp); ay += Math.sin(ang) * (2 + r() * 4) * s * (0.4 + pp); segs.push([ax, ay]); }
          var ex2 = Math.min(A[0], w - A[0]) / w, hot = ex2 < 0.22 || r() < 0.18;
          cracks.push([A, segs, hot, pp]);
        }
        cracks.forEach(function (C) {
          ctx.strokeStyle = 'rgba(8,4,4,0.85)'; ctx.lineWidth = (0.8 + C[3] * 1.4) * s; ctx.beginPath(); ctx.moveTo(C[0][0], C[0][1]); C[1].forEach(function (pt) { ctx.lineTo(pt[0], pt[1]); }); ctx.stroke();
          ctx.strokeStyle = 'rgba(140,100,90,0.35)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.moveTo(C[0][0], C[0][1] - 1 * s); C[1].forEach(function (pt) { ctx.lineTo(pt[0], pt[1] - 1 * s); }); ctx.stroke();
        });
        ctx.globalCompositeOperation = 'lighter';
        cracks.forEach(function (C) {
          if (!C[2]) return;
          [[(3 + C[3] * 4) * s, 'rgba(255,80,20,0.18)'], [(0.9 + C[3]) * s, 'rgba(255,120,40,0.85)'], [0.45 * s, 'rgba(255,230,150,0.9)']].forEach(function (st) {
            ctx.strokeStyle = st[1]; ctx.lineWidth = st[0]; ctx.beginPath(); ctx.moveTo(C[0][0], C[0][1]); C[1].forEach(function (pt) { ctx.lineTo(pt[0], pt[1]); }); ctx.stroke();
          });
        });
        ctx.restore();
        // ash dusting
        dots(ctx, 2600, [['#6a5a58', 0.35], ['#0a0606', 0.4], ['#a88a7a', 0.2]], function () { var yy = lerp(gd, h, Math.pow(r(), 0.85)); return [r() * w, yy, (0.25 + r() * 0.5) * s * (0.6 + (yy - gd) / h * 2), (r() * 3) | 0]; });
        // jagged basalt boulders framing the edges, rim-lit
        function boulder(bx, by, bw, bh, seed3) {
          var rr = rng(seed3), pts = [], N = 9;
          for (var j = 0; j <= N; j++) { var a = PI + j / N * PI; pts.push([bx + Math.cos(a) * bw * (0.7 + rr() * 0.35), by + Math.sin(a) * bh * (0.75 + rr() * 0.3)]); }
          ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(bx, by, bw * 1.1, bh * 0.15, 0, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.moveTo(bx - bw, by); pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); ctx.lineTo(bx + bw, by); ctx.closePath();
          ctx.fillStyle = lg(ctx, bx - bw, by - bh, bx + bw, by, [[0, '#2a2022'], [0.5, '#161012'], [1, '#0c0809']]); ctx.fill();
          ctx.strokeStyle = 'rgba(255,110,50,0.4)'; ctx.lineWidth = 0.7 * s; ctx.beginPath();
          var vxs = vx > bx ? 1 : -1;
          for (j = 0; j <= N; j++) { var pt = pts[j]; if ((pt[0] - bx) * vxs < -bw * 0.1) continue; ctx.lineTo(pt[0], pt[1]); }
          ctx.stroke();
        }
        boulder(w * 0.04, h * 0.7, w * 0.08, h * 0.07, 7171); boulder(w * 0.97, h * 0.66, w * 0.07, h * 0.06, 7172); boulder(w * 0.93, h * 1.0, w * 0.12, h * 0.1, 7173); boulder(-w * 0.01, h * 1.0, w * 0.1, h * 0.08, 7174);
        // ash haze
        band(ctx, w, gd - h * 0.04, gd + h * 0.08, '#7a3a24', 0.35);
        ctx.fillStyle = lg(ctx, 0, h * 0.8, 0, h, [[0, 'rgba(8,4,4,0)'], [1, 'rgba(8,4,4,0.35)']]); ctx.fillRect(0, h * 0.8, w, h * 0.2);
        finish(ctx, w, h, '#ff7030', 0.18, 0.4, 0.06, '#080304');
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = ahLayout(w, h), s = L.s, i, sm = getSmoke(), sp = glowSpr('#ff9a40');
        ctx.save();
        if (sm) {
          for (i = 0; i < 3; i++) {
            var ph = ((t * 0.03 + i / 3) % 1), cw = w * (0.3 + i * 0.08), x = L.vx - cw * 0.3 + ph * w * 0.35, y = L.vTop - h * 0.05 - ph * h * 0.18;
            ctx.globalAlpha = 0.45 * Math.sin(ph * PI); ctx.drawImage(sm, x - cw / 2, y - cw * 0.25, cw, cw * 0.5);
          }
        }
        ctx.globalCompositeOperation = 'lighter';
        if (sp) {
          ctx.globalAlpha = 0.25 + 0.12 * Math.sin(t * 2.1) + 0.06 * Math.sin(t * 5.3);
          var g = L.vW * 0.4; ctx.drawImage(sp, L.vx - g, L.vTop - g * 0.7, g * 2, g * 2);
        }
        ctx.fillStyle = '#ffb050';
        for (i = 0; i < 70; i++) {
          var a = hash(i, 151), b = hash(i, 152), c = hash(i, 153), life = (t * (0.08 + c * 0.1) + b) % 1;
          var ex = a < 0.35 ? L.vx + (a - 0.17) * L.vW * 0.4 : a * w, ey0 = a < 0.35 ? L.vTop : h * (0.6 + c * 0.4);
          var X = ex + Math.sin(t * (1 + c) + i) * 8 * s + life * (a < 0.35 ? 60 : 20) * s, Y = ey0 - life * h * (a < 0.35 ? 0.3 : 0.5);
          var fl = (1 - life) * (0.5 + 0.5 * Math.sin(t * 9 + i * 3));
          if (fl < 0.05) continue;
          ctx.globalAlpha = fl; var z = (0.5 + c * 1.1) * s; ctx.fillRect(X - z, Y - z, z * 2, z * 2);
        }
        ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };

  /* ======================= STARVEIL ======================= */
  function svLayout(w, h) {
    var port = isPort(w, h);
    return { port: port, s: sc(w, h), hz: h * 0.47, gnd: h * 0.54, plX: w * (port ? 0.26 : 0.2), plY: h * (port ? 0.13 : 0.17), plR: Math.min(w, h) * (port ? 0.12 : 0.1) };
  }
  function svIslands(w, h, L) {
    if (L.port) return [[w * 0.78, h * 0.27, w * 0.38, h * 0.12, 1], [w * 0.3, h * 0.33, w * 0.2, h * 0.07, 2], [w * 0.62, h * 0.15, w * 0.11, h * 0.04, 3]];
    return [[w * 0.79, h * 0.26, w * 0.28, h * 0.15, 1], [w * 0.41, h * 0.31, w * 0.15, h * 0.08, 2], [w * 0.6, h * 0.13, w * 0.08, h * 0.045, 3]];
  }
  SC.starveil = {
    paint: function (ctx, w, h) {
      try {
        var r = rng(8101), L = svLayout(w, h), hz = L.hz, s = L.s, gd = L.gnd, i, x, y, k;
        // per-pixel nebula (domain-warped fbm)
        var q = 0.42, cw = Math.ceil(w * q), ch = Math.ceil(gd * q), cv = mk(cw, ch);
        if (cv) {
          var g = cv.getContext('2d'), id = g.createImageData(cw, ch), d = id.data, asp = w / h;
          for (y = 0; y < ch; y++) {
            var v = y / ch * (gd / h);
            for (x = 0; x < cw; x++) {
              var u = x / cw * asp;
              var wx = fbm2(u * 1.6, v * 1.6, 811, 3), wy = fbm2(u * 1.6 + 5.2, v * 1.6 + 1.3, 812, 3);
              var n1 = fbm2(u * 2.4 + wx * 2.2, v * 2.4 + wy * 2.2, 813, 5), n2 = fbm2(u * 3.4 - wy * 1.6, v * 3.4 + wx * 1.6, 814, 4);
              var bd = Math.exp(-Math.pow((v - 0.12 - (u / asp) * 0.38 - (wx - 0.5) * 0.3), 2) / 0.03);
              var dust = rid2(u * 3 + wx, v * 3 + wy, 815, 4);
              var vv = v / (gd / h);
              var br = lerp(10, 58, Math.pow(vv, 1.6)), bg = lerp(6, 20, Math.pow(vv, 1.5)), bb = lerp(30, 104, Math.pow(vv, 1.2));
              var m = Math.pow(n1, 2.4) * (0.5 + bd * 1.6), c2 = Math.pow(n2, 3) * bd * 1.8;
              br += m * 330 + c2 * 60; bg += m * 60 + c2 * 170; bb += m * 300 + c2 * 240;
              var dk = 1 - 0.6 * Math.pow(dust, 3) * bd;
              br *= dk; bg *= dk; bb *= dk;
              var p4 = (y * cw + x) * 4; d[p4] = br > 255 ? 255 : br; d[p4 + 1] = bg > 255 ? 255 : bg; d[p4 + 2] = bb > 255 ? 255 : bb; d[p4 + 3] = 255;
            }
          }
          g.putImageData(id, 0, 0);
          ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(cv, 0, 0, cw / q, ch / q); ctx.restore();
        } else { ctx.fillStyle = lg(ctx, 0, 0, 0, gd, [[0, '#07041a'], [0.6, '#2a1158'], [1, '#4a1a74']]); ctx.fillRect(0, 0, w, gd); }
        // bright nebula cores
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 14; i++) { var tt = r(), nx = w * tt, ny = h * (0.1 + tt * 0.25 + (r() - 0.5) * 0.12); glow(ctx, nx, ny, w * (0.05 + r() * 0.1), ['#c048b0', '#6a50e0', '#40b8e0'][i % 3], 0.12); }
        ctx.restore();
        // stars
        dots(ctx, Math.round(1100 * (w * h) / (480 * 360)), [['#ffffff', 0.85], ['#cfd8ff', 0.7], ['#ffd8f0', 0.6], ['#a8f0ff', 0.6]], function () { return [r() * w, Math.pow(r(), 1.2) * gd, (0.2 + Math.pow(r(), 4) * 0.9) * s, (r() * 4) | 0]; });
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 18; i++) {
          var sx = r() * w, sy = r() * hz * 0.9, sz = (2 + r() * 4) * s, col = ['#ffffff', '#c8d4ff', '#ffd0f0', '#b0f4ff'][i % 4];
          glow(ctx, sx, sy, sz * 2.5, col, 0.5);
          ctx.fillStyle = rgba(col, 0.6); ctx.fillRect(sx - sz * 1.8, sy - 0.25 * s, sz * 3.6, 0.5 * s); ctx.fillRect(sx - 0.25 * s, sy - sz * 1.8, 0.5 * s, sz * 3.6);
        }
        ctx.restore();
        // ---- ringed planet ----
        var px = L.plX, py = L.plY, pr = L.plR, tilt = -0.32;
        function rings(front) {
          ctx.save(); ctx.translate(px, py); ctx.rotate(tilt);
          ctx.beginPath(); if (front) ctx.rect(-pr * 3, 0, pr * 6, pr * 3); else ctx.rect(-pr * 3, -pr * 3, pr * 6, pr * 3); ctx.clip();
          var rs = [[1.35, 0.8, '#c8a8ff', 0.35], [1.5, 1.6, '#e8d0ff', 0.5], [1.62, 0.6, '#7a5ac0', 0.4], [1.75, 2.2, '#f0d8f8', 0.55], [1.92, 1.0, '#a080e0', 0.35], [2.05, 0.5, '#d8c0ff', 0.3], [2.2, 1.6, '#9a7ad8', 0.22]];
          for (var j = 0; j < rs.length; j++) { ctx.strokeStyle = rgba(rs[j][2], rs[j][3]); ctx.lineWidth = rs[j][1] * s * (pr / 40); ctx.beginPath(); ctx.ellipse(0, 0, pr * rs[j][0], pr * rs[j][0] * 0.24, 0, 0, TAU); ctx.stroke(); }
          ctx.restore();
        }
        rings(false);
        glow(ctx, px, py, pr * 1.6, '#8a6ae0', 0.25);
        ctx.save(); ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.clip();
        ctx.fillStyle = rg(ctx, px - pr * 0.4, py - pr * 0.45, pr * 0.05, pr * 1.3, [[0, '#f0d8ff'], [0.3, '#b890e8'], [0.65, '#6a48b0'], [1, '#1e1040']]); ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
        ctx.translate(px, py); ctx.rotate(tilt);
        for (k = 0; k < 14; k++) { var by = -pr + k * pr * 2 / 14 + (r() - 0.5) * 3, bh = pr * (0.04 + r() * 0.1); ctx.fillStyle = r() < 0.5 ? 'rgba(255,220,250,0.12)' : 'rgba(60,30,110,0.16)'; ctx.fillRect(-pr * 1.2, by, pr * 2.4, bh); }
        ctx.rotate(-tilt); ctx.translate(-px, -py);
        ctx.fillStyle = rg(ctx, px + pr * 0.55, py + pr * 0.55, pr * 0.2, pr * 1.5, [[0, 'rgba(8,4,24,0.85)'], [0.6, 'rgba(8,4,24,0.4)'], [1, 'rgba(8,4,24,0)']]); ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
        ctx.restore();
        ctx.strokeStyle = 'rgba(200,180,255,0.5)'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.arc(px, py, pr, PI * 0.9, PI * 1.75); ctx.stroke();
        rings(true);
        // little moon
        var mxp = px + pr * 2.6, myp = py - pr * 0.5, mr = pr * 0.18;
        ctx.fillStyle = rg(ctx, mxp - mr * 0.4, myp - mr * 0.4, 0, mr * 1.2, [[0, '#e8f8ff'], [0.6, '#7ab0d0'], [1, '#1a2a50']]); ctx.beginPath(); ctx.arc(mxp, myp, mr, 0, TAU); ctx.fill();
        // ---- horizon: distant crystal spires + rift glow ----
        glow(ctx, w * 0.5, hz, w * 0.7, '#c060ff', 0.3);
        ctx.save(); ctx.translate(w * 0.5, hz); ctx.scale(1, 0.12); glow(ctx, 0, 0, w * 0.6, '#ffc0ff', 0.6); ctx.restore();
        for (k = 0; k < 3; k++) {
          var cols = [['#5a3a9a', '#3a2470', '#c0a0ff'], ['#3a2470', '#24164c', '#a080ff'], ['#24164a', '#140c30', '#80e0ff']][k];
          var n = 18 + k * 8;
          for (i = 0; i < n; i++) {
            var cx2 = r() * w, chh = h * (0.03 + r() * 0.07) * (1 - k * 0.15) * (Math.abs(cx2 / w - 0.5) > 0.25 ? 1.4 : 0.7);
            crystal(ctx, cx2, hz + k * h * 0.02 + 2, chh, chh * (0.18 + r() * 0.12), (r() - 0.5) * 0.4, cols[0], cols[1], cols[2], 0.9);
          }
          ctx.fillStyle = lg(ctx, 0, hz - h * 0.1, 0, hz + h * 0.04, [[0, 'rgba(120,60,200,0)'], [1, 'rgba(120,60,200,' + (0.35 - k * 0.1) + ')']]); ctx.fillRect(0, hz - h * 0.1, w, h * 0.14 + k * h * 0.02);
        }
        // ---- floating islands ----
        var isl = svIslands(w, h, L);
        isl.sort(function (a, b) { return b[4] - a[4]; });
        isl.forEach(function (I) {
          var ix = I[0], iy = I[1], iw = I[2], ih = I[3], rr = rng(8200 + I[4]), far = I[4] === 3 ? 0.45 : I[4] === 2 ? 0.2 : 0;
          // waterfall of light (behind rock)
          var fx = ix + iw * (I[4] === 1 ? -0.3 : 0.28), fy = iy + ih * 0.05, fh = h * (I[4] === 1 ? 0.28 : 0.18) * (1 - far);
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (var j = 0; j < 9; j++) {
            var off = (rr() - 0.5) * iw * 0.05, wd = (0.6 + rr() * 2.4) * s * (1 - far * 0.5);
            ctx.strokeStyle = lg(ctx, 0, fy, 0, fy + fh, [[0, 'rgba(190,240,255,0.55)'], [0.5, 'rgba(150,180,255,0.25)'], [1, 'rgba(140,120,255,0)']]);
            ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(fx + off, fy); ctx.bezierCurveTo(fx + off + 2 * s, fy + fh * 0.2, fx + off - 1 * s, fy + fh * 0.6, fx + off + (rr() - 0.5) * 6 * s, fy + fh); ctx.stroke();
          }
          ctx.fillStyle = lg(ctx, fx - 10 * s, 0, fx + 10 * s, 0, [[0, 'rgba(120,200,255,0)'], [0.5, 'rgba(120,200,255,0.12)'], [1, 'rgba(120,200,255,0)']]); ctx.fillRect(fx - 10 * s, fy, 20 * s, fh);
          ctx.restore();
          // rock underside
          var N = 22, top = [], bot = [];
          for (j = 0; j <= N; j++) { var uu = j / N; top.push([ix + (uu - 0.5) * iw, iy - Math.sin(uu * PI) * ih * 0.08 + (rr() - 0.5) * ih * 0.03]); }
          for (j = N; j >= 0; j--) { var u3 = j / N, depth = Math.pow(Math.sin(u3 * PI), 0.9) * ih * (0.55 + rr() * 0.45) * (j % 2 ? 1 : 0.75); bot.push([ix + (u3 - 0.5) * iw * (0.98 - Math.sin(u3 * PI) * 0.08), iy + depth + (u3 > 0.4 && u3 < 0.6 ? ih * 0.25 : 0)]); }
          ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]); top.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); bot.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); ctx.closePath();
          ctx.fillStyle = lg(ctx, 0, iy - ih * 0.1, 0, iy + ih * 1.2, [[0, mix('#5a3a8a', '#8a70c0', far)], [0.4, mix('#2a1850', '#6a58a0', far)], [1, mix('#120a2a', '#4a3a80', far)]]); ctx.fill();
          ctx.save(); ctx.clip();
          batch(ctx, Math.round(iw * ih / 30), [['#8a6ad0', 0.6 * s, 0.35], ['#08041a', 0.8 * s, 0.4]], function () { var xx = ix + (rr() - 0.5) * iw, yy = iy + rr() * ih * 1.1; return [xx, yy, xx + (rr() - 0.5) * 2 * s, yy + (3 + rr() * 8) * s, rr() < 0.5 ? 0 : 1]; });
          ctx.fillStyle = lg(ctx, ix - iw / 2, 0, ix + iw / 2, 0, [[0, 'rgba(120,220,255,0.35)'], [0.3, 'rgba(120,220,255,0)'], [0.75, 'rgba(255,120,220,0)'], [1, 'rgba(255,120,220,0.3)']]); ctx.fillRect(ix - iw, iy - ih, iw * 2, ih * 3);
          ctx.restore();
          // glowing top surface
          ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]); top.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); for (j = N; j >= 0; j--) ctx.lineTo(top[j][0], top[j][1] + ih * 0.07); ctx.closePath();
          ctx.fillStyle = lg(ctx, ix - iw / 2, 0, ix + iw / 2, 0, [[0, '#70e8f0'], [0.5, '#b88af0'], [1, '#f080d8']]); ctx.globalAlpha = 0.9 - far * 0.3; ctx.fill(); ctx.globalAlpha = 1;
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(ix, iy); ctx.scale(1, 0.25); glow(ctx, 0, 0, iw * 0.55, '#a080ff', 0.3); ctx.restore();
          // crystals on top
          var nc = I[4] === 1 ? 9 : I[4] === 2 ? 6 : 3;
          for (j = 0; j < nc; j++) {
            var cu = 0.15 + rr() * 0.7, cxx = ix + (cu - 0.5) * iw, cyy = iy - Math.sin(cu * PI) * ih * 0.08 + ih * 0.02, chg = ih * (0.35 + rr() * 0.6) * (1 - Math.abs(cu - 0.5)) * (1 - far * 0.3);
            ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, cxx, cyy - chg * 0.4, chg * 0.7, j % 2 ? '#60d0ff' : '#e070ff', 0.25); ctx.restore();
            crystal(ctx, cxx, cyy, chg, chg * (0.22 + rr() * 0.1), (rr() - 0.5) * 0.5, j % 2 ? '#c8f4ff' : '#f8c8ff', j % 2 ? '#3a70c0' : '#7a3aa8', '#ffffff', 1 - far * 0.3);
          }
          // hanging crystal stalactites
          for (j = 0; j < 5; j++) { var b = bot[2 + ((rr() * (bot.length - 4)) | 0)], ch2 = ih * (0.12 + rr() * 0.2); crystal(ctx, b[0], b[1] - 1, ch2, ch2 * 0.3, PI + (rr() - 0.5) * 0.3, '#a8e8ff', '#3a2a80', '#e0f8ff', 0.85 - far * 0.3); }
        });
        // ---- luminous crystal ground ----
        ctx.beginPath(); ctx.moveTo(0, h);
        for (x = 0; x <= w + 4; x += 4) ctx.lineTo(x, gd - h * 0.008 * fbm(x / w * 5, 8301, 3));
        ctx.lineTo(w, h); ctx.closePath();
        ctx.fillStyle = lg(ctx, 0, gd - h * 0.01, 0, h, [[0, '#5a3a9a'], [0.08, '#34205e'], [0.4, '#22143e'], [1, '#140a28']]); ctx.fill();
        ctx.save(); ctx.clip();
        mirror(ctx, w, gd - h * 0.005, h * 0.2, gd, gd + h * 0.2, 0.22, 0);
        ctx.fillStyle = lg(ctx, 0, gd, 0, gd + h * 0.205, [[0, 'rgba(34,20,62,0)'], [0.6, 'rgba(34,20,62,0.5)'], [1, 'rgba(34,20,62,1)']]); ctx.fillRect(0, gd, w, h * 0.205);
        ctx.restore();
        ctx.save(); ctx.translate(w * 0.5, gd); ctx.scale(1, 0.3); glow(ctx, 0, 0, w * 0.6, '#b070ff', 0.35); ctx.restore();
        // glassy facets: large faint polygon plates
        for (i = 0; i < 40; i++) {
          var fy2 = lerp(gd + h * 0.01, h, Math.pow(r(), 0.8)), pp = (fy2 - gd) / (h - gd), fx2 = r() * w, fs = (6 + r() * 20) * s * (0.4 + pp * 1.4);
          ctx.fillStyle = r() < 0.5 ? 'rgba(160,120,255,0.07)' : 'rgba(20,10,40,0.12)';
          ctx.beginPath(); ctx.moveTo(fx2 - fs, fy2); ctx.lineTo(fx2 - fs * 0.3, fy2 - fs * 0.25 * (0.3 + pp)); ctx.lineTo(fx2 + fs, fy2 - fs * 0.1); ctx.lineTo(fx2 + fs * 0.4, fy2 + fs * 0.2 * (0.3 + pp)); ctx.closePath(); ctx.fill();
        }
        // glowing veins
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < 30; i++) {
          var vx0 = r() * w, vy0 = lerp(gd + h * 0.01, h, Math.pow(r(), 0.8)), p3 = (vy0 - gd) / (h - gd), segs = [[vx0, vy0]], an = r() * TAU, col2 = r() < 0.5 ? '120,220,255' : '230,120,255';
          for (var q2 = 0; q2 < 5; q2++) { an += (r() - 0.5) * 0.8; vx0 += Math.cos(an) * (5 + r() * 12) * s * (0.4 + p3); vy0 += Math.sin(an) * (1 + r() * 4) * s * (0.3 + p3); segs.push([vx0, vy0]); }
          var cen = 1 - Math.min(1, Math.abs(segs[0][0] / w - 0.5) * 3) * 0.6;
          [[(2.5 + p3 * 3) * s, 0.08], [(0.6 + p3) * s, 0.45 * (1.1 - cen * 0.5)]].forEach(function (st) { ctx.strokeStyle = 'rgba(' + col2 + ',' + st[1] + ')'; ctx.lineWidth = st[0]; ctx.beginPath(); segs.forEach(function (p, j) { if (!j) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }); ctx.stroke(); });
        }
        ctx.restore();
        dots(ctx, 1800, [['#c8a8ff', 0.4], ['#0a0618', 0.45], ['#80e8ff', 0.35]], function () { var yy = lerp(gd, h, Math.pow(r(), 0.85)); return [r() * w, yy, (0.25 + r() * 0.5) * s * (0.6 + (yy - gd) / h * 2), (r() * 3) | 0]; });
        // tiny shards
        for (i = 0; i < 40; i++) { var shy = lerp(gd + h * 0.02, h, r()), shp = (shy - gd) / (h - gd), shx = r() * w; if (Math.abs(shx / w - 0.5) < 0.3 && r() < 0.7) continue; var shh = (2 + r() * 5) * s * (0.5 + shp); crystal(ctx, shx, shy, shh, shh * 0.35, (r() - 0.5) * 0.6, '#e0d0ff', '#4a2a90', '#ffffff', 0.85); }
        // crystal clusters framing the edges
        function cluster(cx3, cy3, sz3, seed4, dir) {
          var rr4 = rng(seed4);
          ctx.save(); ctx.translate(cx3, cy3); ctx.scale(1, 0.25); glow(ctx, 0, 0, sz3 * 1.2, '#a070ff', 0.4); ctx.restore();
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, cx3, cy3 - sz3 * 0.4, sz3 * 0.9, '#8060ff', 0.25); ctx.restore();
          var list = [];
          for (var j = 0; j < 8; j++) list.push([cx3 + (rr4() - 0.5) * sz3 * 0.9, cy3 + rr4() * sz3 * 0.08, sz3 * (0.35 + rr4() * 0.75), (rr4() - 0.5) * 0.9 + dir * 0.15, rr4()]);
          list.sort(function (a, b) { return b[2] - a[2]; });
          list.forEach(function (c) { crystal(ctx, c[0], c[1], c[2], c[2] * (0.2 + c[4] * 0.1), c[3], c[4] < 0.5 ? '#d8f4ff' : '#f8d0ff', c[4] < 0.5 ? '#2a4a9a' : '#5a2a8a', '#ffffff', 0.95); });
        }
        cluster(w * 0.03, h * 0.72, h * 0.2, 8401, 1); cluster(w * 0.97, h * 0.68, h * 0.17, 8402, -1); cluster(w * 0.94, h * 1.0, h * 0.24, 8403, -1); cluster(w * 0.05, h * 1.01, h * 0.16, 8404, 1);
        ctx.fillStyle = lg(ctx, 0, h * 0.82, 0, h, [[0, 'rgba(8,4,20,0)'], [1, 'rgba(8,4,20,0.35)']]); ctx.fillRect(0, h * 0.82, w, h * 0.18);
        finish(ctx, w, h, '#a060ff', 0.16, 0.34, 0.05, '#05020e');
      } catch (e) { SC._err = String(e && e.stack || e); }
    },
    overlay: function (ctx, w, h, t) {
      try {
        var L = svLayout(w, h), s = L.s, i, sp = glowSpr('#d8c0ff'), sp2 = glowSpr('#90f0ff');
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        // twinkling stars
        ctx.fillStyle = '#ffffff';
        for (i = 0; i < 40; i++) {
          var a = hash(i, 161), b = hash(i, 162), c = hash(i, 163), tw = Math.pow(0.5 + 0.5 * Math.sin(t * (1 + c * 3) + i * 7), 3);
          var x = a * w, y = Math.pow(b, 1.2) * L.hz * 0.95, z = (0.6 + c * 1.8) * s * tw;
          if (tw < 0.1) continue;
          ctx.globalAlpha = tw * 0.9; ctx.fillRect(x - z * 1.6, y - 0.25 * s, z * 3.2, 0.5 * s); ctx.fillRect(x - 0.25 * s, y - z * 1.6, 0.5 * s, z * 3.2);
          if (sp && c > 0.6) { ctx.globalAlpha = tw * 0.5; ctx.drawImage(sp, x - z * 2, y - z * 2, z * 4, z * 4); }
        }
        // light pulses down the waterfalls
        var isl = svIslands(w, h, L);
        if (sp2) for (i = 0; i < isl.length; i++) {
          var I = isl[i], far = I[4] === 3 ? 0.45 : I[4] === 2 ? 0.2 : 0, fx = I[0] + I[2] * (I[4] === 1 ? -0.3 : 0.28), fy = I[1] + I[3] * 0.05, fh = h * (I[4] === 1 ? 0.28 : 0.18) * (1 - far);
          for (var j = 0; j < 3; j++) { var ph = (t * 0.35 + j / 3 + i * 0.2) % 1, zz = (3 + 3 * (1 - far)) * s; ctx.globalAlpha = 0.5 * (1 - ph); ctx.drawImage(sp2, fx - zz, fy + ph * fh - zz * 1.5, zz * 2, zz * 3); }
        }
        // drifting light motes
        if (sp) for (i = 0; i < 34; i++) {
          var a2 = hash(i, 171), b2 = hash(i, 172), c2 = hash(i, 173), life = (t * (0.03 + c2 * 0.04) + b2) % 1;
          var X = ((a2 * w + Math.sin(t * 0.4 + i) * 20 * s + t * 4 * s) % w + w) % w, Y = h * (0.98 - life * 0.75), z2 = (2 + c2 * 4) * s;
          ctx.globalAlpha = Math.sin(life * PI) * (0.35 + 0.35 * Math.sin(t * 2 + i));
          ctx.drawImage(i % 3 ? sp : sp2, X - z2, Y - z2, z2 * 2, z2 * 2);
        }
        ctx.restore();
      } catch (e) { SC._err = String(e && e.stack || e); }
    }
  };
})();
