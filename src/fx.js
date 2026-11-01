/* fx.js - painterly battle effects and premium item icons.
   Plain browser script; defines window.FX. No images, no network, never throws.
   Every animated function is pure: pass progress p in [0,1] or time t (seconds).
   Expensive static art (glows, rocks, leaves, shards, stars, icons, platforms,
   portal swirls, beacon beams) is rendered once into offscreen canvases keyed by size.

   FX.attack(ctx, type, x0, y0, x1, y1, p, s)  in-flight attack, type in fire|water|leaf|spark|stone|frost|wind|bug|mind|shadow|dragon|metal|fight|star|normal (unknown -> normal)
   FX.impact(ctx, type, x, y, p, s)            hit burst on the defender (~0.4 s)
   FX.crit(ctx, x, y, p, s)                    critical-hit starburst
   FX.giantAura(ctx, x, y, s, t)               giant-form aura, (x,y) = feet, s ~ creature half-height
   FX.platform(ctx, x, y, rw, rh, tint)        battle platform, (x,y) = centre of top ellipse
   FX.portal(ctx, x, y, r, t)                  swirling dimensional rift
   FX.raidBeacon(ctx, x, yTop, yBottom, w, t)  light pillar over a raid boss
   FX.catchBurst(ctx, x, y, p, s, shiny)       catch celebration
   FX.spawnRing(ctx, x, y, p, s)               appear-on-field ripple, (x,y) = feet
   FX.item(ctx, kind, x, y, r)                 icon: orb | great | ultra | berry | badge
*/
(function (root) {
  'use strict';
  var PI = Math.PI, TAU = PI * 2;

  /* ---------------- math ---------------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function fr(v) { return v - Math.floor(v); }
  function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; }
  function hash(i, s) {
    var x = Math.imul((i | 0) ^ Math.imul(s | 0, 0x9E3779B1), 0x27d4eb2d);
    x ^= x >>> 15; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }
  function eo(t) { t = 1 - clamp(t, 0, 1); return 1 - t * t * t; }
  function bell(t) { return Math.sin(PI * clamp(t, 0, 1)); }
  function rgba(c, a) { a = a < 0 ? 0 : a > 1 ? 1 : a; return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (Math.round(a * 1000) / 1000) + ')'; }
  function mixc(a, b, t) { return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))]; }
  function hsl(h, s, l, a) { return 'hsla(' + (((h % 360) + 360) % 360).toFixed(0) + ',' + s + '%,' + l + '%,' + clamp(a, 0, 1).toFixed(3) + ')'; }
  var WHITE = [255, 255, 255];

  var PAL = {
    fire:   { core: [255, 246, 214], hi: [255, 204, 80],  mid: [255, 124, 34],  lo: [196, 40, 16] },
    water:  { core: [236, 255, 255], hi: [140, 226, 255], mid: [48, 150, 238],  lo: [18, 78, 186] },
    leaf:   { core: [240, 255, 205], hi: [176, 236, 104], mid: [82, 182, 64],   lo: [30, 108, 46] },
    spark:  { core: [255, 255, 240], hi: [255, 242, 124], mid: [255, 204, 44],  lo: [140, 104, 255] },
    stone:  { core: [255, 242, 218], hi: [228, 198, 152], mid: [172, 132, 92],  lo: [98, 74, 52] },
    frost:  { core: [255, 255, 255], hi: [214, 246, 255], mid: [130, 212, 255], lo: [62, 140, 232] },
    normal: { core: [255, 255, 255], hi: [255, 250, 234], mid: [255, 222, 172], lo: [150, 164, 205] },
    wind:   { core: [255, 255, 255], hi: [214, 255, 240], mid: [110, 222, 190], lo: [36, 140, 120] },
    bug:    { core: [250, 255, 220], hi: [222, 240, 120], mid: [160, 196, 46],  lo: [80, 110, 20] },
    mind:   { core: [255, 242, 255], hi: [242, 196, 255], mid: [204, 132, 255], lo: [120, 56, 196] },
    shadow: { core: [236, 226, 255], hi: [172, 150, 224], mid: [96, 76, 146],   lo: [38, 26, 66] },
    dragon: { core: [240, 245, 255], hi: [172, 186, 255], mid: [106, 116, 250], lo: [58, 38, 168] },
    metal:  { core: [255, 255, 255], hi: [226, 233, 243], mid: [166, 178, 196], lo: [76, 88, 106] },
    fight:  { core: [255, 246, 232], hi: [255, 192, 152], mid: [238, 92, 98],   lo: [150, 28, 48] },
    star:   { core: [255, 255, 240], hi: [255, 236, 150], mid: [255, 168, 212], lo: [206, 96, 166] }
  };
  function pal(type) { return PAL[type] || PAL.normal; }

  /* ---------------- offscreen cache ---------------- */
  function mk(w, h) {
    w = Math.max(1, Math.ceil(w)); h = Math.max(1, Math.ceil(h));
    var c = null;
    try {
      if (typeof document !== 'undefined' && document.createElement) c = document.createElement('canvas');
      else if (typeof OffscreenCanvas !== 'undefined') c = new OffscreenCanvas(w, h);
    } catch (e) { c = null; }
    if (!c) return null;
    c.width = w; c.height = h;
    return c;
  }
  var CACHE = {}, CN = 0;
  function cached(key, w, h, draw) {
    var c = CACHE[key];
    if (c !== undefined) return c;
    if (CN > 500) { CACHE = {}; CN = 0; }
    c = mk(w, h);
    if (c) {
      try { var g = c.getContext('2d'); if (g) draw(g, c.width, c.height); else c = null; } catch (e) { /* keep partial */ }
    }
    CACHE[key] = c; CN++;
    return c;
  }
  var SS = 2; // supersampling for small sprites
  function spr(key, lw, lh, ss, draw) {
    return cached(key, lw * ss, lh * ss, function (g) { g.scale(ss, ss); draw(g, lw, lh); });
  }
  function bk(v) { return v < 16 ? Math.max(4, Math.round(v / 2) * 2) : Math.round(v / 4) * 4; }
  function put(ctx, c, x, y, w, h, rot, a, sy) {
    if (!c || !(a > 0.004) || !(w > 0.3)) return;
    ctx.globalAlpha = a > 1 ? 1 : a;
    if (!rot && !sy) { ctx.drawImage(c, x - w / 2, y - h / 2, w, h); return; }
    ctx.save();
    try {
      ctx.translate(x, y); if (rot) ctx.rotate(rot); if (sy) ctx.scale(1, sy);
      ctx.drawImage(c, -w / 2, -h / 2, w, h);
    } finally { ctx.restore(); }
  }

  /* color parse via canvas normalisation */
  var PC = {}, pcx = null;
  function parseColor(str, def) {
    if (typeof str !== 'string' || !str) return def;
    var v = PC[str]; if (v) return v;
    var out = def;
    try {
      if (!pcx) { var c = mk(1, 1); pcx = c && c.getContext('2d'); }
      if (pcx) {
        pcx.fillStyle = '#010203'; pcx.fillStyle = str;
        var s = String(pcx.fillStyle);
        if (s !== '#010203' || str.toLowerCase() === '#010203') {
          if (s.charAt(0) === '#' && s.length === 7) out = [parseInt(s.substr(1, 2), 16), parseInt(s.substr(3, 2), 16), parseInt(s.substr(5, 2), 16)];
          else { var m = s.match(/[\d.]+/g); if (m && m.length >= 3) out = [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])]; }
        }
      }
    } catch (e) { out = def; }
    PC[str] = out;
    return out;
  }

  /* ---------------- sprite library ---------------- */
  var GS = 128;
  function glowSpr(c, hot) {
    return cached('g' + c[0] + ',' + c[1] + ',' + c[2] + (hot ? 'h' : ''), GS, GS, function (g) {
      var h = GS / 2, gr = g.createRadialGradient(h, h, 0, h, h, h);
      if (hot) {
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.13, rgba(c, 0.95)); gr.addColorStop(0.38, rgba(c, 0.38));
        gr.addColorStop(0.68, rgba(c, 0.1)); gr.addColorStop(1, rgba(c, 0));
      } else {
        gr.addColorStop(0, rgba(c, 0.9)); gr.addColorStop(0.28, rgba(c, 0.5)); gr.addColorStop(0.62, rgba(c, 0.14)); gr.addColorStop(1, rgba(c, 0));
      }
      g.fillStyle = gr; g.fillRect(0, 0, GS, GS);
    });
  }
  function glow(ctx, x, y, r, c, a, hot) {
    if (!(r > 0.4) || !(a > 0.004)) return;
    var sp = glowSpr(c, hot); if (!sp) return;
    ctx.globalAlpha = a > 1 ? 1 : a;
    ctx.drawImage(sp, x - r, y - r, r * 2, r * 2);
  }
  function glowE(ctx, x, y, rx, ry, c, a, hot) {
    if (!(rx > 0.4) || !(ry > 0.4) || !(a > 0.004)) return;
    var sp = glowSpr(c, hot); if (!sp) return;
    ctx.globalAlpha = a > 1 ? 1 : a;
    ctx.drawImage(sp, x - rx, y - ry, rx * 2, ry * 2);
  }
  function glowR(ctx, x, y, rx, ry, ang, c, a, hot) {
    var sp = glowSpr(c, hot); if (!sp) return;
    put(ctx, sp, x, y, rx * 2, ry * 2, ang, a);
  }
  function star4path(g, x, y, r, w) {
    g.beginPath(); g.moveTo(x, y - r);
    g.quadraticCurveTo(x + w, y - w, x + r, y); g.quadraticCurveTo(x + w, y + w, x, y + r);
    g.quadraticCurveTo(x - w, y + w, x - r, y); g.quadraticCurveTo(x - w, y - w, x, y - r); g.closePath();
  }
  function sparkSpr(c) {
    return cached('sp' + c.join(','), 64, 64, function (g) {
      var h = 32, gr = g.createRadialGradient(h, h, 0, h, h, h);
      gr.addColorStop(0, rgba(c, 0.6)); gr.addColorStop(0.25, rgba(c, 0.22)); gr.addColorStop(1, rgba(c, 0));
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      g.fillStyle = rgba(mixc(c, WHITE, 0.6), 0.95); star4path(g, h, h, 31, 2.6); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.save(); g.translate(h, h); g.rotate(PI / 4); star4path(g, 0, 0, 15, 1.8); g.fill(); g.restore();
      gr = g.createRadialGradient(h, h, 0, h, h, 7); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(h - 8, h - 8, 16, 16);
    });
  }
  function sparkle(ctx, x, y, r, c, a, rot) { put(ctx, sparkSpr(c), x, y, r * 2, r * 2, rot || 0, a); }

  function dropSpr() {
    return spr('drop', 16, 16, 2, function (g) {
      var gr = g.createRadialGradient(6, 5.5, 0.5, 8, 8, 7.5);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(170,232,255,0.95)');
      gr.addColorStop(0.8, 'rgba(50,150,236,0.9)'); gr.addColorStop(1, 'rgba(30,100,210,0.6)');
      g.fillStyle = gr; g.beginPath(); g.arc(8, 8, 7, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(210,248,255,0.7)'; g.lineWidth = 0.9; g.beginPath(); g.arc(8, 8, 6.2, 0.2, 1.9); g.stroke();
    });
  }

  function leafShape(g, cx, cy, l, wf) {
    g.beginPath(); g.moveTo(cx - l, cy);
    g.bezierCurveTo(cx - l * 0.45, cy - l * wf, cx + l * 0.45, cy - l * wf * 0.85, cx + l, cy);
    g.bezierCurveTo(cx + l * 0.45, cy + l * wf * 0.7, cx - l * 0.45, cy + l * wf * 0.9, cx - l, cy);
    g.closePath();
  }
  function leafSpr(L) {
    var b = bk(L);
    return spr('lf' + b, b * 2.5, b * 1.3, SS, function (g, w, h) {
      var cx = w / 2, cy = h / 2, l = b;
      g.save(); g.shadowColor = 'rgba(170,255,120,0.55)'; g.shadowBlur = l * 0.35 * SS;
      leafShape(g, cx, cy, l, 0.5);
      var gr = g.createLinearGradient(cx, cy - l * 0.4, cx, cy + l * 0.4);
      gr.addColorStop(0, '#e6ffa8'); gr.addColorStop(0.4, '#7ed24c'); gr.addColorStop(0.75, '#3c9a3a'); gr.addColorStop(1, '#1f6a30');
      g.fillStyle = gr; g.fill(); g.restore();
      g.save(); leafShape(g, cx, cy, l, 0.5); g.clip();
      gr = g.createLinearGradient(cx - l, cy, cx + l, cy);
      gr.addColorStop(0, 'rgba(255,255,200,0)'); gr.addColorStop(0.55, 'rgba(255,255,210,0.28)'); gr.addColorStop(1, 'rgba(255,255,220,0)');
      g.fillStyle = gr; g.fillRect(cx - l, cy - l, l * 2, l * 0.9);
      g.strokeStyle = 'rgba(244,255,214,0.8)'; g.lineWidth = Math.max(0.6, l * 0.055); g.lineCap = 'round';
      g.beginPath(); g.moveTo(cx - l * 0.92, cy + l * 0.02); g.quadraticCurveTo(cx, cy - l * 0.06, cx + l * 0.9, cy); g.stroke();
      g.lineWidth = Math.max(0.4, l * 0.03); g.strokeStyle = 'rgba(230,255,200,0.45)';
      for (var i = 0; i < 4; i++) {
        var vx = cx - l * 0.55 + i * l * 0.38;
        g.beginPath(); g.moveTo(vx, cy - l * 0.02); g.lineTo(vx + l * 0.2, cy - l * 0.2); g.stroke();
        g.beginPath(); g.moveTo(vx, cy + l * 0.0); g.lineTo(vx + l * 0.2, cy + l * 0.17); g.stroke();
      }
      g.restore();
      g.strokeStyle = 'rgba(250,255,220,0.6)'; g.lineWidth = Math.max(0.5, l * 0.03);
      g.beginPath(); g.moveTo(cx - l, cy); g.bezierCurveTo(cx - l * 0.45, cy - l * 0.5, cx + l * 0.45, cy - l * 0.425, cx + l, cy); g.stroke();
    });
  }

  function rockSpr(R, v) {
    var b = bk(R); v = v % 3;
    return spr('rk' + b + '_' + v, b * 2.6, b * 2.6, SS, function (g, w, h) {
      var cx = w / 2, cy = h / 2, n = 8, pts = [], i;
      for (i = 0; i < n; i++) {
        var a = i / n * TAU + hash(i, v + 3) * 0.5, rr = b * (0.74 + 0.3 * hash(i, v + 9));
        pts.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9);
      }
      function poly() { g.beginPath(); g.moveTo(pts[0], pts[1]); for (var j = 2; j < pts.length; j += 2) g.lineTo(pts[j], pts[j + 1]); g.closePath(); }
      g.save(); g.shadowColor = 'rgba(255,190,110,0.35)'; g.shadowBlur = b * 0.35 * SS; poly();
      var gr = g.createLinearGradient(cx - b, cy - b, cx + b, cy + b);
      gr.addColorStop(0, '#efdcbb'); gr.addColorStop(0.35, '#b48e66'); gr.addColorStop(0.75, '#715439'); gr.addColorStop(1, '#4a3626');
      g.fillStyle = gr; g.fill(); g.restore();
      g.save(); poly(); g.clip();
      // facets
      for (i = 0; i < n; i += 2) {
        var j2 = (i + 2) % n, mx = cx + (hash(i, v) - 0.5) * b * 0.3, my = cy + (hash(i, v + 1) - 0.5) * b * 0.3;
        var fa = Math.atan2((pts[i * 2 + 1] + pts[j2 * 2 + 1]) / 2 - cy, (pts[i * 2] + pts[j2 * 2]) / 2 - cx);
        var br = Math.cos(fa + PI * 0.75);
        g.beginPath(); g.moveTo(mx, my); g.lineTo(pts[i * 2], pts[i * 2 + 1]); g.lineTo(pts[i * 2 + 2 < pts.length ? i * 2 + 2 : 0], pts[i * 2 + 3 < pts.length ? i * 2 + 3 : 1]); g.lineTo(pts[j2 * 2], pts[j2 * 2 + 1]); g.closePath();
        g.fillStyle = br > 0 ? 'rgba(255,240,210,' + (0.28 * br).toFixed(3) + ')' : 'rgba(40,24,12,' + (-0.3 * br).toFixed(3) + ')';
        g.fill();
      }
      // speckles + crack
      for (i = 0; i < 18; i++) {
        g.fillStyle = hash(i, v + 40) > 0.5 ? 'rgba(255,245,225,0.25)' : 'rgba(50,32,18,0.25)';
        g.beginPath(); g.arc(cx + (hash(i, v + 41) - 0.5) * b * 1.6, cy + (hash(i, v + 42) - 0.5) * b * 1.5, b * 0.05 + 0.3, 0, TAU); g.fill();
      }
      g.strokeStyle = 'rgba(60,38,22,0.35)'; g.lineWidth = Math.max(0.5, b * 0.05);
      g.beginPath(); g.moveTo(cx - b * 0.2, cy - b * 0.5); g.lineTo(cx + b * 0.05, cy - b * 0.05); g.lineTo(cx - b * 0.05, cy + b * 0.35); g.stroke();
      g.restore();
      g.strokeStyle = 'rgba(255,238,205,0.6)'; g.lineWidth = Math.max(0.6, b * 0.07); g.lineJoin = 'round';
      g.beginPath(); g.moveTo(pts[8], pts[9]); for (i = 10; i < 16; i += 2) g.lineTo(pts[i], pts[i + 1]); g.lineTo(pts[0], pts[1]); g.stroke();
    });
  }

  function shardSpr(L) {
    var b = bk(L);
    return spr('sh' + b, b * 2.6, b * 1.1, SS, function (g, w, h) {
      var cx = w / 2, cy = h / 2, l = b, wd = b * 0.24;
      g.save(); g.shadowColor = 'rgba(150,225,255,0.85)'; g.shadowBlur = l * 0.3 * SS;
      g.beginPath(); g.moveTo(cx + l, cy); g.lineTo(cx - l * 0.15, cy - wd); g.lineTo(cx - l, cy - wd * 0.15); g.lineTo(cx - l * 0.85, cy + wd * 0.35); g.lineTo(cx - l * 0.1, cy + wd); g.closePath();
      g.fillStyle = 'rgba(120,200,255,0.85)'; g.fill(); g.restore();
      // top facet (lit)
      g.beginPath(); g.moveTo(cx + l, cy); g.lineTo(cx - l * 0.15, cy - wd); g.lineTo(cx - l, cy - wd * 0.15); g.lineTo(cx - l * 0.2, cy + wd * 0.05); g.closePath();
      var gr = g.createLinearGradient(cx - l, cy - wd, cx + l, cy);
      gr.addColorStop(0, 'rgba(200,240,255,0.7)'); gr.addColorStop(0.6, 'rgba(240,252,255,0.97)'); gr.addColorStop(1, '#ffffff');
      g.fillStyle = gr; g.fill();
      // lower facet (shade)
      g.beginPath(); g.moveTo(cx + l, cy); g.lineTo(cx - l * 0.2, cy + wd * 0.05); g.lineTo(cx - l * 0.85, cy + wd * 0.35); g.lineTo(cx - l * 0.1, cy + wd); g.closePath();
      gr = g.createLinearGradient(cx - l, cy, cx + l, cy + wd);
      gr.addColorStop(0, 'rgba(60,140,230,0.75)'); gr.addColorStop(0.7, 'rgba(120,200,255,0.92)'); gr.addColorStop(1, 'rgba(210,245,255,1)');
      g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = Math.max(0.5, l * 0.04);
      g.beginPath(); g.moveTo(cx + l * 0.98, cy); g.lineTo(cx - l * 0.2, cy + wd * 0.05); g.stroke();
    });
  }

  function starPath(g, x, y, R, ri, rot) {
    g.beginPath();
    for (var i = 0; i < 10; i++) { var rr = i % 2 ? ri : R, a = rot - PI / 2 + i * PI / 5; if (i) g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath();
  }
  // bevelled (faceted) 5-point star; c = [light, dark]
  function starBevel(g, x, y, R, ri, rot, light, dark) {
    var LA = -PI * 0.75, i;
    g.lineJoin = 'round';
    for (i = 0; i < 5; i++) {
      var a = rot - PI / 2 + i * TAU / 5, al = a - PI / 5, ar = a + PI / 5;
      var tx = x + Math.cos(a) * R, ty = y + Math.sin(a) * R;
      var faces = [[al, a - PI / 10 - PI / 2], [ar, a + PI / 10 + PI / 2]];
      for (var f = 0; f < 2; f++) {
        var ia = faces[f][0], na = faces[f][1];
        var brt = 0.5 + 0.5 * Math.cos(na - LA);
        var col = rgba(mixc(dark, light, clamp(brt * 1.1 - 0.05, 0, 1)), 1);
        g.beginPath(); g.moveTo(x, y); g.lineTo(tx, ty); g.lineTo(x + Math.cos(ia) * ri, y + Math.sin(ia) * ri); g.closePath();
        g.fillStyle = col; g.fill(); g.strokeStyle = col; g.lineWidth = Math.max(0.4, R * 0.02); g.stroke();
      }
    }
    var gr = g.createRadialGradient(x - R * 0.2, y - R * 0.3, 0, x, y, R * 0.6);
    gr.addColorStop(0, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; starPath(g, x, y, R, ri, rot); g.fill();
  }
  var GOLD_L = [255, 246, 196], GOLD_D = [176, 98, 10], SILV_L = [255, 255, 255], SILV_D = [112, 122, 156];
  function starSpr(R) {
    var b = bk(R);
    return spr('st' + b, b * 3, b * 3, SS, function (g, w, h) {
      var cx = w / 2, cy = h / 2, gr = g.createRadialGradient(cx, cy, 0, cx, cy, b * 1.5);
      gr.addColorStop(0, 'rgba(255,220,110,0.55)'); gr.addColorStop(0.5, 'rgba(255,190,60,0.18)'); gr.addColorStop(1, 'rgba(255,170,40,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      starBevel(g, cx, cy, b, b * 0.45, 0, GOLD_L, GOLD_D);
    });
  }

  /* ---------------- attack paths ---------------- */
  function mkPath(x0, y0, x1, y1, arc) {
    var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / L, ny = dx / L;
    if (ny > 0 || (ny === 0 && nx > 0)) { nx = -nx; ny = -ny; }
    return { x0: x0, y0: y0, dx: dx, dy: dy, nx: nx, ny: ny, ux: dx / L, uy: dy / L, L: L, arc: arc * L };
  }
  function at(P, q, o) { var h = Math.sin(PI * q) * P.arc; o.x = P.x0 + P.dx * q + P.nx * h; o.y = P.y0 + P.dy * q + P.ny * h; return o; }
  function ang(P, q) { var h = PI * Math.cos(PI * q) * P.arc; return Math.atan2(P.dy + P.ny * h, P.dx + P.nx * h); }
  function ribbon(ctx, P, q0, q1, n, wf) {
    if (q1 - q0 < 0.002) return false;
    var Lp = [], Rp = [], i, o = { x: 0, y: 0 };
    for (i = 0; i <= n; i++) {
      var k = i / n, q = lerp(q0, q1, k), a; at(P, q, o); a = ang(P, q);
      var w = wf(k), sx = -Math.sin(a) * w, sy = Math.cos(a) * w;
      Lp.push(o.x + sx, o.y + sy); Rp.push(o.x - sx, o.y - sy);
    }
    ctx.beginPath(); ctx.moveTo(Lp[0], Lp[1]);
    for (i = 2; i < Lp.length; i += 2) ctx.lineTo(Lp[i], Lp[i + 1]);
    for (i = Rp.length - 2; i >= 0; i -= 2) ctx.lineTo(Rp[i], Rp[i + 1]);
    ctx.closePath();
    return true;
  }
  function flameShape(ctx, R, L, w) {
    ctx.beginPath(); ctx.moveTo(-L, w);
    ctx.quadraticCurveTo(-L * 0.45, -R * 1.2 + w * 0.5, 0, -R);
    ctx.arc(0, 0, R, -PI / 2, PI / 2, false);
    ctx.quadraticCurveTo(-L * 0.45, R * 1.2 + w * 0.5, -L, w);
    ctx.closePath();
  }

  function atkFire(ctx, P, p, s) {
    var C = PAL.fire, o = { x: 0, y: 0 }, h = at(P, p, { x: 0, y: 0 }), a = ang(P, p), i, k, q, wob;
    var R = s * 0.27 * Math.min(1, 0.45 + p * 3), sa = Math.sin(a), ca = Math.cos(a);
    // warm haze (reads on light backgrounds)
    ctx.globalCompositeOperation = 'source-over';
    for (i = 9; i >= 1; i--) {
      k = i / 9; q = p - k * 0.3; if (q < 0) continue; at(P, q, o);
      glow(ctx, o.x, o.y - k * k * s * 0.18, R * (1.2 - 0.5 * k) + k * s * 0.22, mixc(C.mid, C.lo, k), 0.26 * (1 - k * 0.85));
    }
    // flame trail
    ctx.globalCompositeOperation = 'lighter';
    for (i = 16; i >= 0; i--) {
      k = i / 16; q = p - k * 0.32; if (q < 0) continue; at(P, q, o);
      wob = Math.sin(i * 1.7 + p * 31) * s * 0.1 * k;
      var col = k < 0.3 ? mixc(C.hi, C.mid, k / 0.3) : mixc(C.mid, C.lo, (k - 0.3) / 0.7);
      glow(ctx, o.x - sa * wob, o.y + ca * wob - k * k * s * 0.16, R * (1.55 - 1.05 * k) * (1 + 0.18 * Math.sin(p * 53 + i * 2.1)), col, 0.55 * (1 - k) + 0.06);
    }
    // embers
    for (i = 0; i < 14; i++) {
      var tb = hash(i, 31) * 0.9, age = p - tb; if (age < 0 || age > 0.3) continue;
      k = age / 0.3; at(P, tb, o);
      var ex = o.x + (hash(i, 32) - 0.5) * s * 1.4 * k + Math.sin(k * 9 + i) * s * 0.05, ey = o.y - (0.3 + hash(i, 33)) * s * 0.9 * k;
      glow(ctx, ex, ey, s * (0.06 + 0.05 * hash(i, 34)) * (1 - k * 0.5), k < 0.45 ? C.hi : C.mid, (1 - k) * 0.95, true);
    }
    glow(ctx, h.x, h.y, s * 1.05, C.mid, 0.34);
    // flame head
    ctx.save();
    try {
      ctx.translate(h.x, h.y); ctx.rotate(a);
      var Lt = R * (3.1 + Math.sin(p * 71) * 0.35);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      flameShape(ctx, R * 1.12, Lt, Math.sin(p * 45) * R * 0.45);
      var g = ctx.createRadialGradient(R * 0.3, 0, 0, R * 0.3, 0, Lt * 1.1);
      g.addColorStop(0, 'rgba(255,244,190,0.97)'); g.addColorStop(0.16, 'rgba(255,178,56,0.94)');
      g.addColorStop(0.42, 'rgba(238,84,22,0.72)'); g.addColorStop(1, 'rgba(150,20,8,0)');
      ctx.fillStyle = g; ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      flameShape(ctx, R * 0.68, Lt * 0.58, Math.sin(p * 63 + 1) * R * 0.3);
      g = ctx.createRadialGradient(R * 0.25, 0, 0, R * 0.25, 0, Lt * 0.62);
      g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(0.35, 'rgba(255,220,110,0.8)'); g.addColorStop(1, 'rgba(255,120,30,0)');
      ctx.fillStyle = g; ctx.fill();
      // swirling tongues orbiting the core
      for (i = 0; i < 3; i++) {
        var s0 = p * 24 + i * TAU / 3;
        for (var m = 0; m < 6; m++) {
          var aa = s0 - m * 0.28, rr = R * (1.25 - m * 0.05);
          glow(ctx, Math.cos(aa) * rr - m * R * 0.12, Math.sin(aa) * rr * 0.62, R * 0.36 * (1 - m / 7), m < 2 ? C.hi : C.mid, 0.55 * (1 - m / 6));
        }
      }
    } finally { ctx.restore(); }
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, h.x, h.y, R * 1.3, C.hi, 0.9, true);
  }

  function atkWater(ctx, P, p, s) {
    var C = PAL.water, h = at(P, p, { x: 0, y: 0 }), a = ang(P, p), R = s * 0.25 * Math.min(1, 0.35 + p * 3);
    var q0 = Math.max(0, p - 0.42), i, k, g, sa = Math.sin(a), ca = Math.cos(a);
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, h.x, h.y, R * 2.6, C.mid, 0.4);
    ctx.globalCompositeOperation = 'source-over';
    if (ribbon(ctx, P, q0, p, 18, function (k) { return R * (0.16 + 0.74 * k) * (1 + 0.15 * Math.sin(k * 22 - p * 60)); })) {
      var t0 = at(P, q0, { x: 0, y: 0 });
      g = ctx.createLinearGradient(t0.x, t0.y, h.x, h.y);
      g.addColorStop(0, rgba(C.lo, 0)); g.addColorStop(0.45, rgba(C.mid, 0.55)); g.addColorStop(1, rgba(C.hi, 0.92));
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fill();
      if (ribbon(ctx, P, Math.max(0, p - 0.3), p, 14, function (k) { return R * (0.04 + 0.3 * k); })) {
        var t1 = at(P, Math.max(0, p - 0.3), { x: 0, y: 0 });
        g = ctx.createLinearGradient(t1.x, t1.y, h.x, h.y);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(240,255,255,0.8)');
        ctx.fillStyle = g; ctx.fill();
      }
      // pressure rings travelling with the jet
      ctx.lineWidth = Math.max(1, s * 0.022);
      var o = { x: 0, y: 0 };
      for (i = 1; i <= 3; i++) {
        var q = p - (i - fr(p * 7)) * 0.09; if (q < q0 + 0.02) continue;
        k = 1 - (p - q) / 0.42; at(P, q, o); var qa = ang(P, q);
        ctx.save();
        try {
          ctx.translate(o.x, o.y); ctx.rotate(qa);
          ctx.beginPath(); ctx.ellipse(0, 0, R * 0.2, R * (0.35 + 0.75 * k) * 1.1, 0, 0, TAU);
          ctx.strokeStyle = 'rgba(225,250,255,' + (0.6 * k).toFixed(3) + ')'; ctx.stroke();
        } finally { ctx.restore(); }
      }
    }
    // droplets spraying off
    var dsp = dropSpr();
    for (i = 0; i < 14; i++) {
      var ph = fr(hash(i, 41) + p * 2.4), side = (hash(i, 42) - 0.5) * 2;
      var back = ph * s * (0.5 + 0.6 * hash(i, 43)), lat = side * ph * s * 0.55;
      var dr = s * (0.035 + 0.04 * hash(i, 44)) * (1 - ph * 0.6) * Math.min(1, p * 4);
      put(ctx, dsp, h.x - ca * back - sa * lat, h.y - sa * back + ca * lat + ph * ph * s * 0.35, dr * 2, dr * 2, 0, (1 - ph) * 0.95);
    }
    // orb
    ctx.save();
    try {
      ctx.translate(h.x, h.y); ctx.rotate(a);
      var wb = Math.sin(p * 41) * 0.09;
      ctx.beginPath(); ctx.ellipse(0, 0, R * (1.06 + wb), R * (1 - wb), 0, 0, TAU);
      ctx.rotate(-a);
      g = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.05, 0, 0, R * 1.15);
      g.addColorStop(0, 'rgba(248,255,255,0.98)'); g.addColorStop(0.28, rgba(C.hi, 0.95)); g.addColorStop(0.72, rgba(C.mid, 0.93)); g.addColorStop(1, rgba(C.lo, 0.92));
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, R * 0.25, R * 0.35, R * 0.6, WHITE, 0.32);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(205,246,255,0.75)'; ctx.lineWidth = Math.max(1, R * 0.09); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, R * 0.86, 0.15, PI * 0.8); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.ellipse(-R * 0.36, -R * 0.42, R * 0.3, R * 0.15, -0.6, 0, TAU); ctx.fill();
    } finally { ctx.restore(); }
  }

  function atkLeaf(ctx, P, p, s) {
    var o = { x: 0, y: 0 }, o2 = { x: 0, y: 0 }, j, m, n = 5;
    for (j = n - 1; j >= 0; j--) {
      var q = clamp((p - j * 0.05) / 0.8, 0, 1); if (p < j * 0.05) continue;
      var L = s * (0.2 + 0.08 * hash(j, 51));
      function lpos(qq, out) {
        at(P, qq, out);
        var off = Math.sin(qq * PI * 2.2 + j * 1.3) * s * 0.36 * bell(qq) + (j - 2) * s * 0.06 * bell(qq);
        out.x -= P.uy * off; out.y += P.ux * off; return out;
      }
      lpos(q, o);
      // wind streak
      ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(o.x, o.y);
      for (m = 1; m <= 5; m++) { lpos(Math.max(0, q - m * 0.03), o2); ctx.lineTo(o2.x, o2.y); }
      ctx.globalAlpha = 0.32; ctx.strokeStyle = 'rgba(200,255,150,1)'; ctx.lineWidth = Math.max(1, s * 0.035); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, o.x, o.y, L * 1.5, PAL.leaf.hi, 0.3);
      ctx.globalCompositeOperation = 'source-over';
      var spin = q * PI * 9 * (j % 2 ? 1 : -1) + j * 1.1;
      put(ctx, leafSpr(L), o.x, o.y, L * 2.5, L * 1.3, spin, 1, 0.35 + 0.65 * Math.abs(Math.cos(q * 13 + j)));
    }
    ctx.globalCompositeOperation = 'lighter';
    for (j = 0; j < 6; j++) {
      var tq = hash(j, 57) * 0.9, age = p - tq; if (age < 0 || age > 0.25) continue;
      at(P, tq, o);
      sparkle(ctx, o.x + (hash(j, 58) - 0.5) * s * 0.7, o.y + (hash(j, 59) - 0.5) * s * 0.7, s * 0.12 * bell(age / 0.25), PAL.leaf.core, 0.9, age * 4);
    }
  }

  function atkSpark(ctx, P, p, s) {
    var C = PAL.spark, e = Math.min(1, p * 1.25), q0 = Math.max(0, p * 1.25 - 0.6), f = Math.floor(p * 26), n = 12, i, k;
    if (e - q0 < 0.01) return;
    var o = { x: 0, y: 0 }, pts = [];
    for (i = 0; i <= n; i++) {
      k = i / n; var q = lerp(q0, e, k); at(P, q, o); var qa = ang(P, q);
      var amp = s * 0.26 * Math.sin(PI * k) * (0.6 + 0.4 * hash(i, f + 7)), jj = (hash(i * 3 + 1, f) - 0.5) * 2 * amp;
      pts.push(o.x - Math.sin(qa) * jj, o.y + Math.cos(qa) * jj);
    }
    var br = [];
    for (var b = 0; b < 3; b++) {
      var si = 2 + Math.floor(hash(b, f + 50) * (n - 4)), bx = pts[si * 2], by = pts[si * 2 + 1];
      var ba = ang(P, lerp(q0, e, si / n)) + (hash(b, f + 60) > 0.5 ? 1 : -1) * (0.5 + 0.6 * hash(b, f + 61));
      var bl = s * (0.3 + 0.4 * hash(b, f + 62)), bp = [bx, by];
      for (var m = 1; m <= 4; m++) { var d = bl * m / 4, j2 = (hash(m, f * 7 + b) - 0.5) * s * 0.16; bp.push(bx + Math.cos(ba) * d - Math.sin(ba) * j2, by + Math.sin(ba) * d + Math.cos(ba) * j2); }
      br.push(bp);
    }
    function trMain() { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (var t = 2; t < pts.length; t += 2) ctx.lineTo(pts[t], pts[t + 1]); }
    function trBr() { ctx.beginPath(); for (var u = 0; u < br.length; u++) { var bq = br[u]; ctx.moveTo(bq[0], bq[1]); for (var t = 2; t < bq.length; t += 2) ctx.lineTo(bq[t], bq[t + 1]); } }
    var fl = 0.72 + 0.28 * hash(f, 99);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    var passes = [['source-over', 0.5, C.lo, 0.12], ['lighter', 0.25, C.mid, 0.22], ['source-over', 0.95, [255, 192, 36], 0.065], ['lighter', 1, WHITE, 0.026]];
    for (i = 0; i < passes.length; i++) {
      var ps = passes[i];
      ctx.globalCompositeOperation = ps[0]; ctx.strokeStyle = rgba(ps[2], 1);
      trMain(); ctx.globalAlpha = ps[1] * fl; ctx.lineWidth = Math.max(0.8, s * ps[3]); ctx.stroke();
      trBr(); ctx.globalAlpha = ps[1] * fl * 0.85; ctx.lineWidth = Math.max(0.6, s * ps[3] * 0.55); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i <= n; i += 3) glow(ctx, pts[i * 2], pts[i * 2 + 1], s * 0.35, C.mid, 0.16 * fl);
    var hx = pts[n * 2], hy = pts[n * 2 + 1];
    glow(ctx, hx, hy, s * 0.45, C.hi, 0.75 * fl, true);
    glow(ctx, pts[0], pts[1], s * 0.3, C.lo, 0.35 * fl);
    ctx.strokeStyle = rgba(C.core, 1); ctx.lineWidth = Math.max(0.8, s * 0.02);
    for (i = 0; i < 6; i++) {
      var sa2 = hash(i, f + 70) * TAU, sl = s * (0.15 + 0.25 * hash(i, f + 71));
      ctx.globalAlpha = 0.85 * fl;
      ctx.beginPath(); ctx.moveTo(hx + Math.cos(sa2) * s * 0.08, hy + Math.sin(sa2) * s * 0.08);
      ctx.lineTo(hx + Math.cos(sa2 + 0.3) * sl * 0.55, hy + Math.sin(sa2 + 0.3) * sl * 0.55);
      ctx.lineTo(hx + Math.cos(sa2) * sl, hy + Math.sin(sa2) * sl); ctx.stroke();
    }
  }

  function atkStone(ctx, P, p, s) {
    var C = PAL.stone, o = { x: 0, y: 0 }, j, m;
    for (j = 0; j < 4; j++) {
      var d = j * 0.07; if (p < d) continue;
      var q = clamp((p - d) / (1 - 0.21), 0, 1), R = s * (0.17 + 0.08 * hash(j, 61));
      var lat = (j - 1.5) * s * 0.2 * bell(q);
      // dust trail
      ctx.globalCompositeOperation = 'source-over';
      for (m = 5; m >= 1; m--) {
        var qq = q - m * 0.045; if (qq < 0) continue;
        at(P, qq, o);
        glow(ctx, o.x - P.uy * lat, o.y + P.ux * lat + m * s * 0.02, R * (0.9 + m * 0.35), m > 2 ? C.mid : C.hi, 0.3 * (1 - m / 6));
      }
      at(P, q, o);
      var rx = o.x - P.uy * lat, ry = o.y + P.ux * lat;
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, rx, ry, R * 1.7, [255, 170, 90], 0.18);
      ctx.globalCompositeOperation = 'source-over';
      put(ctx, rockSpr(R, j), rx, ry, R * 2.6, R * 2.6, q * TAU * 1.6 * (j % 2 ? 1 : -1) + j, 1);
      // pebbles
      for (m = 0; m < 2; m++) {
        var pq = Math.max(0, q - 0.05 - m * 0.05); at(P, pq, o);
        var pr = R * 0.32;
        put(ctx, rockSpr(pr, j + m + 1), o.x - P.uy * (lat + (m - 0.5) * s * 0.25), o.y + P.ux * (lat + (m - 0.5) * s * 0.25), pr * 2.6, pr * 2.6, q * 20 + m, 0.9);
      }
    }
  }

  function atkFrost(ctx, P, p, s) {
    var C = PAL.frost, o = { x: 0, y: 0 }, j, m, a = ang(P, p);
    // mist
    for (m = 10; m >= 1; m--) {
      var k = m / 10, q = p - k * 0.38; if (q < 0) continue; at(P, q, o);
      var dr = s * (0.18 + 0.32 * k);
      ctx.globalCompositeOperation = 'source-over';
      glow(ctx, o.x + Math.sin(m * 2.3 + p * 9) * s * 0.08, o.y + Math.cos(m * 1.7) * s * 0.06, dr, mixc(C.hi, C.mid, k * 0.5), 0.3 * (1 - k * 0.8));
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, o.x, o.y, dr * 0.7, C.mid, 0.12 * (1 - k));
    }
    for (j = 0; j < 5; j++) {
      var d = j * 0.045; if (p < d) continue;
      var qj = clamp((p - d) / (1 - 0.18), 0, 1), L = s * (0.2 + 0.1 * hash(j, 71));
      var lat = (j - 2) * s * 0.13 * bell(qj) + Math.sin(qj * 9 + j) * s * 0.03;
      at(P, qj, o);
      var sx = o.x - P.uy * lat, sy = o.y + P.ux * lat;
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, sx, sy, L * 1.4, C.mid, 0.35);
      ctx.globalCompositeOperation = 'source-over';
      put(ctx, shardSpr(L), sx, sy, L * 2.6, L * 1.1, ang(P, qj) + Math.sin(qj * 7 + j) * 0.12, 1);
    }
    ctx.globalCompositeOperation = 'lighter';
    for (j = 0; j < 8; j++) {
      var tq = hash(j, 77) * 0.95, age = p - tq; if (age < 0 || age > 0.3) continue;
      at(P, tq, o);
      sparkle(ctx, o.x + (hash(j, 78) - 0.5) * s * 0.8, o.y + (hash(j, 79) - 0.5) * s * 0.6 + age * s * 0.4, s * 0.11 * bell(age / 0.3), C.hi, 0.95, a);
    }
  }

  function atkNormal(ctx, P, p, s) {
    var h = at(P, p, { x: 0, y: 0 }), a = ang(P, p), q0 = Math.max(0, p - 0.3), g, i;
    var w = s * 0.16 * Math.min(1, 0.4 + p * 3);
    ctx.globalCompositeOperation = 'source-over';
    if (ribbon(ctx, P, q0, p, 10, function (k) { return w * (0.1 + 1.0 * k * k); })) {
      var t0 = at(P, q0, { x: 0, y: 0 });
      g = ctx.createLinearGradient(t0.x, t0.y, h.x, h.y);
      g.addColorStop(0, 'rgba(140,155,205,0)'); g.addColorStop(1, 'rgba(140,155,205,0.65)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fill();
    }
    if (ribbon(ctx, P, q0, p, 10, function (k) { return w * (0.05 + 0.6 * k * k); })) {
      var t1 = at(P, q0, { x: 0, y: 0 });
      g = ctx.createLinearGradient(t1.x, t1.y, h.x, h.y);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,252,240,0.8)'); g.addColorStop(1, 'rgba(255,255,255,1)');
      ctx.fillStyle = g; ctx.fill();
    }
    // speed lines (cool shadow stroke + white stroke so they read on any background)
    ctx.lineCap = 'round';
    for (var ps2 = 0; ps2 < 2; ps2++) {
      ctx.strokeStyle = ps2 ? 'rgba(255,255,255,1)' : 'rgba(120,135,190,1)'; ctx.lineWidth = Math.max(0.8, s * (ps2 ? 0.02 : 0.04));
      for (i = 0; i < 4; i++) {
        var off = (i - 1.5) * s * 0.14, len = s * (0.35 + 0.3 * hash(i, 81)), bk2 = s * (0.2 + 0.25 * hash(i, 82));
        var cx = h.x - Math.cos(a) * bk2 - Math.sin(a) * off, cy = h.y - Math.sin(a) * bk2 + Math.cos(a) * off;
        ctx.globalAlpha = (ps2 ? 0.7 : 0.3) * Math.min(1, p * 5);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - Math.cos(a) * len, cy - Math.sin(a) * len); ctx.stroke();
      }
    }
    glow(ctx, h.x, h.y, s * 0.42, [150, 165, 215], 0.5);
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, h.x, h.y, s * 0.55, PAL.normal.mid, 0.5, true);
    sparkle(ctx, h.x, h.y, s * 0.32, PAL.normal.hi, 0.9, a + p * 3);
  }

  /* ---- wave 3 types: wind, bug, mind, shadow, dragon, metal, fight, star ---- */
  function atkWind(ctx, P, p, s) { // Gust Dash: three crescent air blades with mint streaks
    var C = PAL.wind, o = { x: 0, y: 0 }, j, m;
    for (j = 0; j < 3; j++) {
      var d = j * 0.09; if (p < d) continue;
      var q = clamp((p - d) / (1 - 0.18), 0, 1), a = ang(P, q), R = s * (0.27 - j * 0.04), lat = (j - 1) * s * 0.2 * bell(q);
      ctx.globalCompositeOperation = 'source-over';
      for (m = 1; m <= 3; m++) { at(P, Math.max(0, q - m * 0.05), o); glow(ctx, o.x - P.uy * lat, o.y + P.ux * lat, R * (1 - m * 0.2), C.mid, 0.2); }
      at(P, q, o);
      ctx.save(); ctx.translate(o.x - P.uy * lat, o.y + P.ux * lat); ctx.rotate(a);
      ctx.globalAlpha = 0.85; ctx.fillStyle = rgba(C.mid, 1);
      ctx.beginPath(); ctx.arc(-R * 0.35, 0, R, -1.15, 1.15); ctx.arc(-R * 0.78, 0, R * 0.95, 1.0, -1.0, true); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = rgba(C.lo, 1); ctx.globalAlpha = 0.5; ctx.lineWidth = Math.max(0.6, s * 0.012); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.95; ctx.strokeStyle = rgba(C.core, 1); ctx.lineWidth = Math.max(0.8, s * 0.035);
      ctx.beginPath(); ctx.arc(-R * 0.35, 0, R * 0.9, -0.85, 0.85); ctx.stroke();
      ctx.restore();
    }
  }
  function atkBug(ctx, P, p, s) { // Buzz Bite: a zig-zagging swarm, then chomping fangs
    var C = PAL.bug, o = { x: 0, y: 0 }, i;
    for (i = 0; i < 9; i++) {
      var d = hash(i, 201) * 0.25; if (p < d) continue;
      var q = clamp((p - d) / (1 - 0.25), 0, 1); at(P, q, o);
      var lat = (hash(i, 202) - 0.5) * s * 0.5 * bell(q) + Math.sin(q * 18 + i * 2) * s * 0.16 * bell(q);
      var bx = o.x - P.uy * lat, by = o.y + P.ux * lat, r = s * (0.045 + 0.03 * hash(i, 203)), fl = Math.abs(Math.sin(p * 60 + i));
      ctx.globalCompositeOperation = 'source-over'; glow(ctx, bx, by, r * 3, C.mid, 0.3);
      ctx.globalAlpha = 0.65; ctx.fillStyle = 'rgba(240,255,250,1)'; ctx.beginPath(); ctx.ellipse(bx - r * 0.3, by - r * 0.9, r * 0.9, r * 0.45 * (0.4 + fl), -0.4, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = rgba(C.lo, 1); ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); ctx.fill();
      ctx.fillStyle = rgba(C.hi, 1); ctx.beginPath(); ctx.arc(bx - r * 0.3, by - r * 0.3, r * 0.45, 0, TAU); ctx.fill();
    }
    if (p > 0.68) {
      var k = (p - 0.68) / 0.32, h = at(P, 1, { x: 0, y: 0 }), jw = s * 0.32, op = Math.abs(Math.cos(k * PI * 2)) * 0.5, sg;
      ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(ang(P, 1)); ctx.globalAlpha = bell(k);
      ctx.fillStyle = 'rgba(255,255,255,1)'; ctx.strokeStyle = rgba(C.lo, 1); ctx.lineWidth = Math.max(1, s * 0.02);
      for (sg = -1; sg <= 1; sg += 2) { var yy = sg * jw * (0.12 + op); ctx.beginPath(); ctx.moveTo(-jw * 0.45, yy); ctx.lineTo(jw * 0.45, yy); ctx.lineTo(jw * 0.05, yy - sg * jw * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.restore();
    }
  }
  function atkMind(ctx, P, p, s) { // Mind Wave: ripples of violet light, sparkles
    var C = PAL.mind, o = { x: 0, y: 0 }, j;
    for (j = 0; j < 4; j++) {
      var d = j * 0.12; if (p < d) continue;
      var q = clamp((p - d) / (1 - 0.36), 0, 1), R = s * (0.12 + 0.3 * q), al = 1 - q * 0.5; at(P, q, o);
      ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(ang(P, q));
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.5 * al; ctx.strokeStyle = rgba(C.lo, 1); ctx.lineWidth = Math.max(1, s * 0.07);
      ctx.beginPath(); ctx.ellipse(0, 0, R * 0.45, R, 0, 0, TAU); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9 * al; ctx.strokeStyle = rgba(C.hi, 1); ctx.lineWidth = Math.max(0.8, s * 0.03); ctx.stroke();
      ctx.restore();
    }
    var h = at(P, p, { x: 0, y: 0 }); ctx.globalCompositeOperation = 'lighter'; glow(ctx, h.x, h.y, s * 0.4, C.mid, 0.6, true);
    for (j = 0; j < 5; j++) { var tq = hash(j, 301) * p; at(P, tq, o); sparkle(ctx, o.x + (hash(j, 302) - 0.5) * s * 0.6, o.y + (hash(j, 303) - 0.5) * s * 0.6, s * 0.08, C.hi, 0.8 * (1 - (p - tq)), p * 4); }
  }
  function atkShadow(ctx, P, p, s) { // Shade Pounce: a smoky dark orb that ends in three claw slashes
    var C = PAL.shadow, o = { x: 0, y: 0 }, m, q = Math.min(1, p * 1.15), h = at(P, q, { x: 0, y: 0 });
    ctx.globalCompositeOperation = 'source-over';
    for (m = 8; m >= 0; m--) { var qq = q - m * 0.04; if (qq < 0) continue; at(P, qq, o); var w = Math.sin(m * 1.7 + p * 12) * s * 0.06;
      glow(ctx, o.x - P.uy * w, o.y + P.ux * w, s * (0.32 - m * 0.022), m < 3 ? C.lo : C.mid, 0.55 * (1 - m / 9)); }
    glow(ctx, h.x, h.y, s * 0.42, C.lo, 0.85);
    ctx.globalCompositeOperation = 'lighter'; glow(ctx, h.x, h.y, s * 0.3, C.hi, 0.75, true);
    for (m = 1; m <= 6; m += 2) { var q2 = q - m * 0.05; if (q2 < 0) continue; at(P, q2, o); glow(ctx, o.x, o.y, s * 0.16, C.hi, 0.3 * (1 - m / 7), true); }
    if (p > 0.7) {
      var k = (p - 0.7) / 0.3, e = at(P, 1, { x: 0, y: 0 }), i, L = s * 0.55 * Math.min(1, k * 2.2);
      ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(ang(P, 1) + 0.9);
      for (i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(i * s * 0.14 - L * 0.1, -L * 0.5); ctx.quadraticCurveTo(i * s * 0.14 + s * 0.08, 0, i * s * 0.14 - L * 0.1, L * 0.5);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = (1 - k) * 0.8; ctx.strokeStyle = rgba(C.lo, 1); ctx.lineWidth = s * 0.07; ctx.stroke();
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - k; ctx.strokeStyle = rgba(C.core, 1); ctx.lineWidth = s * 0.025; ctx.stroke();
      }
      ctx.restore();
    }
  }
  function atkDragon(ctx, P, p, s) { // Dragon Roar: roar rings at the mouth + a blue-violet dragonfire stream
    var C = PAL.dragon, o = { x: 0, y: 0 }, i, q0 = Math.max(0, p - 0.45), w = s * 0.22;
    for (i = 0; i < 2; i++) { var k = p * 1.6 - i * 0.25; if (k < 0 || k > 1) continue; at(P, 0.04, o);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = (1 - k) * 0.6; ctx.strokeStyle = rgba(C.mid, 1); ctx.lineWidth = Math.max(1, s * 0.06 * (1 - k));
      ctx.beginPath(); ctx.arc(o.x, o.y, s * (0.2 + 0.7 * k), 0, TAU); ctx.stroke(); }
    ctx.globalCompositeOperation = 'source-over';
    if (ribbon(ctx, P, q0, p, 14, function (k2) { return w * (0.25 + 0.9 * k2) * (0.85 + 0.15 * Math.sin(k2 * 20 + p * 30)); })) { ctx.globalAlpha = 0.75; ctx.fillStyle = rgba(C.lo, 1); ctx.fill(); }
    ctx.globalCompositeOperation = 'lighter';
    if (ribbon(ctx, P, q0, p, 14, function (k2) { return w * (0.12 + 0.55 * k2); })) { ctx.globalAlpha = 0.8; ctx.fillStyle = rgba(C.mid, 1); ctx.fill(); }
    if (ribbon(ctx, P, q0 + (p - q0) * 0.3, p, 10, function (k2) { return w * 0.25 * k2; })) { ctx.globalAlpha = 0.9; ctx.fillStyle = rgba(C.core, 1); ctx.fill(); }
    var h = at(P, p, { x: 0, y: 0 }); glow(ctx, h.x, h.y, s * 0.5, C.hi, 0.7, true);
    for (i = 0; i < 6; i++) { var tq = p - hash(i, 401) * 0.4; if (tq < 0) continue; at(P, tq, o); glow(ctx, o.x + (hash(i, 402) - 0.5) * s * 0.4, o.y + (hash(i, 403) - 0.5) * s * 0.4 - (p - tq) * s * 0.6, s * 0.08, C.hi, 0.8, true); }
  }
  function atkMetal(ctx, P, p, s) { // Iron Bash: a spinning riveted steel ball with streaks and sparks
    var C = PAL.metal, i, h = at(P, p, { x: 0, y: 0 }), a = ang(P, p), R = s * 0.2;
    ctx.globalCompositeOperation = 'source-over';
    for (i = 0; i < 5; i++) { var off = (i - 2) * R * 0.45, L = s * (0.4 + 0.3 * hash(i, 501)); ctx.globalAlpha = 0.55; ctx.strokeStyle = rgba(i % 2 ? C.mid : C.lo, 1); ctx.lineWidth = Math.max(0.8, s * 0.025);
      ctx.beginPath(); ctx.moveTo(h.x - P.uy * off - P.ux * R, h.y + P.ux * off - P.uy * R); ctx.lineTo(h.x - P.uy * off - P.ux * (R + L), h.y + P.ux * off - P.uy * (R + L)); ctx.stroke(); }
    var g = ctx.createRadialGradient(h.x - R * 0.35, h.y - R * 0.4, R * 0.1, h.x, h.y, R);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, rgba(C.hi, 1)); g.addColorStop(0.75, rgba(C.mid, 1)); g.addColorStop(1, rgba(C.lo, 1));
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h.x, h.y, R, 0, TAU); ctx.fill(); ctx.strokeStyle = rgba(C.lo, 1); ctx.lineWidth = Math.max(0.8, s * 0.02); ctx.stroke();
    ctx.fillStyle = rgba(C.lo, 0.8); for (i = 0; i < 6; i++) { var ra = i / 6 * TAU + p * 8; ctx.beginPath(); ctx.arc(h.x + Math.cos(ra) * R * 0.68, h.y + Math.sin(ra) * R * 0.68, R * 0.08, 0, TAU); ctx.fill(); }
    ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 6; i++) { var sa = a + PI + (hash(i, 502) - 0.5) * 1.6, sl = s * (0.15 + 0.25 * hash(i, Math.floor(p * 20))); ctx.globalAlpha = 0.9; ctx.strokeStyle = 'rgba(255,230,160,1)'; ctx.lineWidth = Math.max(0.7, s * 0.015);
      ctx.beginPath(); ctx.moveTo(h.x + Math.cos(sa) * R, h.y + Math.sin(sa) * R); ctx.lineTo(h.x + Math.cos(sa) * (R + sl), h.y + Math.sin(sa) * (R + sl)); ctx.stroke(); }
  }
  function atkFight(ctx, P, p, s) { // Power Punch: a glowing wrapped fist with speed lines
    var C = PAL.fight, h = at(P, p, { x: 0, y: 0 }), a = ang(P, p), R = s * 0.2 * (0.7 + 0.5 * Math.min(1, p * 2)), i;
    ctx.globalCompositeOperation = 'source-over';
    for (i = 0; i < 5; i++) { var off = (i - 2) * R * 0.5, L = s * (0.35 + 0.35 * hash(i, 601)); ctx.globalAlpha = 0.6; ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,1)' : rgba(C.mid, 1); ctx.lineWidth = Math.max(0.8, s * 0.03);
      ctx.beginPath(); ctx.moveTo(h.x - P.uy * off - P.ux * R * 1.2, h.y + P.ux * off - P.uy * R * 1.2); ctx.lineTo(h.x - P.uy * off - P.ux * (R * 1.2 + L), h.y + P.ux * off - P.uy * (R * 1.2 + L)); ctx.stroke(); }
    glow(ctx, h.x, h.y, R * 2.2, C.mid, 0.4);
    ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(a);
    var g = ctx.createLinearGradient(0, -R, 0, R); g.addColorStop(0, rgba(C.hi, 1)); g.addColorStop(1, rgba(C.mid, 1));
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.strokeStyle = rgba(C.lo, 1); ctx.lineWidth = Math.max(1, s * 0.022);
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(-R, -R * 0.75, R * 1.5, R * 1.5, R * 0.45); else ctx.rect(-R, -R * 0.75, R * 1.5, R * 1.5); ctx.fill(); ctx.stroke();
    for (i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(R * 0.52, -R * 0.56 + i * R * 0.37, R * 0.26, R * 0.2, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(-R * 0.1, R * 0.72, R * 0.42, R * 0.2, -0.2, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(-R * 0.98, -R * 0.7, R * 0.28, R * 1.4);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-R * 0.2, -R * 0.45, R * 0.35, R * 0.12, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function atkStar(ctx, P, p, s) { // Twinkle Beam: a pink beam carrying spinning golden stars
    var C = PAL.star, o = { x: 0, y: 0 }, i, q0 = Math.max(0, p - 0.5);
    ctx.globalCompositeOperation = 'lighter';
    if (ribbon(ctx, P, q0, p, 12, function (k) { return s * 0.12 * (0.2 + k); })) { var t0 = at(P, q0, { x: 0, y: 0 }), h0 = at(P, p, { x: 0, y: 0 }), g = ctx.createLinearGradient(t0.x, t0.y, h0.x, h0.y); g.addColorStop(0, rgba(C.mid, 0)); g.addColorStop(1, rgba(C.mid, 0.75)); ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fill(); }
    for (i = 0; i < 7; i++) { var q = p - i * 0.06; if (q < 0) continue; at(P, q, o); var R = s * (0.13 - i * 0.012), w = Math.sin(q * 14 + i) * s * 0.12;
      ctx.globalCompositeOperation = 'source-over'; put(ctx, starSpr(R), o.x - P.uy * w, o.y + P.ux * w, R * 3, R * 3, q * 6 + i, 1 - i * 0.1);
      ctx.globalCompositeOperation = 'lighter'; sparkle(ctx, o.x - P.uy * w, o.y + P.ux * w, R * 1.2, C.hi, 0.6, p * 5); }
    var h = at(P, p, { x: 0, y: 0 }); ctx.globalCompositeOperation = 'lighter'; glow(ctx, h.x, h.y, s * 0.4, C.mid, 0.6, true);
  }

  var ATK = { fire: atkFire, water: atkWater, leaf: atkLeaf, spark: atkSpark, stone: atkStone, frost: atkFrost, normal: atkNormal,
    wind: atkWind, bug: atkBug, mind: atkMind, shadow: atkShadow, dragon: atkDragon, metal: atkMetal, fight: atkFight, star: atkStar };
  var ARC = { fire: 0.12, water: 0.07, leaf: 0.1, spark: 0, stone: 0.3, frost: 0.05, normal: 0.03, wind: 0.15, bug: 0.08, mind: 0.02, shadow: 0.1, dragon: 0.06, metal: 0.04, fight: 0.02, star: 0.12 };

  /* ---------------- guard ---------------- */
  function prep(ctx) {
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
    try { if (ctx.filter && ctx.filter !== 'none') ctx.filter = 'none'; } catch (e) { }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }
  function safe(fn) {
    return function (ctx) {
      if (!ctx || typeof ctx.save !== 'function') return;
      var ok = false;
      try { ctx.save(); ok = true; prep(ctx); fn.apply(null, arguments); } catch (e) { /* never throw */ }
      if (ok) { try { ctx.restore(); } catch (e2) { } }
    };
  }

  /* ---------------- attack ---------------- */
  function attack(ctx, type, x0, y0, x1, y1, p, s) {
    x0 = num(x0, 0); y0 = num(y0, 0); x1 = num(x1, x0); y1 = num(y1, y0);
    p = clamp(num(p, 0), 0, 1); s = Math.max(4, num(s, 60));
    var fn = (Object.prototype.hasOwnProperty.call(ATK, type) && ATK[type]) || atkNormal;
    fn(ctx, mkPath(x0, y0, x1, y1, ARC[type] !== undefined ? ARC[type] : 0.05), p, s);
  }

  /* ---------------- impact ---------------- */
  function impact(ctx, type, x, y, p, s) {
    x = num(x, 0); y = num(y, 0); p = clamp(num(p, 0), 0, 1); s = Math.max(4, num(s, 60));
    if (!Object.prototype.hasOwnProperty.call(PAL, type)) type = 'normal';
    var C = pal(type), e = eo(p), fade = 1 - p, i, a, d, px, py, k;
    // tinted body (light bg) + additive flash
    ctx.globalCompositeOperation = 'source-over';
    glow(ctx, x, y, s * (0.45 + 0.6 * e), C.mid, 0.62 * Math.pow(fade, 1.5));
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, x, y, s * (0.5 + 0.75 * e), C.hi, 0.95 * Math.pow(fade, 2.2), true);
    glow(ctx, x, y, s * 1.15, C.mid, 0.28 * fade);
    // shockwave: broken, uneven painterly ring (coloured base + bright additive edge)
    var rp0 = clamp(p / 0.75, 0, 1);
    if (rp0 < 1) {
      var rr0 = s * (0.25 + 0.85 * eo(rp0)), rf = Math.pow(1 - rp0, 1.3);
      for (i = 0; i < 7; i++) {
        var a0 = i / 7 * TAU + hash(i, 88) * 0.4 + p, a1 = a0 + TAU / 7 * (0.55 + 0.4 * hash(i, 89)), wv = 0.55 + 0.9 * hash(i, 87);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.5 * rf; ctx.strokeStyle = rgba(C.mid, 1);
        ctx.lineWidth = Math.max(0.6, s * 0.075 * wv * rf);
        ctx.beginPath(); ctx.arc(x, y, rr0, a0, a1); ctx.stroke();
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.9 * rf; ctx.strokeStyle = rgba(C.core, 1);
        ctx.lineWidth = Math.max(0.5, s * 0.03 * wv * rf);
        ctx.beginPath(); ctx.arc(x, y, rr0, a0 + 0.05, a1 - 0.05); ctx.stroke();
      }
    }
    // particles
    var n = 12, dsp = type === 'water' ? dropSpr() : null;
    for (i = 0; i < n; i++) {
      a = i / n * TAU + hash(i, 91) * 0.45; d = s * (0.35 + 0.9 * hash(i, 92)) * e;
      px = x + Math.cos(a) * d; py = y + Math.sin(a) * d * 0.85; k = 1 - p;
      var ps = s * (0.05 + 0.05 * hash(i, 93));
      if (type === 'fire') {
        ctx.globalCompositeOperation = 'lighter';
        glow(ctx, px, py - p * p * s * 0.4, ps * 1.8 * (0.5 + k), hash(i, 94) > 0.4 ? C.hi : C.mid, k, true);
      } else if (type === 'water') {
        ctx.globalCompositeOperation = 'source-over';
        put(ctx, dsp, px, py + p * p * s * 0.6, ps * 2.4, ps * 2.4, 0, k);
      } else if (type === 'leaf') {
        ctx.globalCompositeOperation = 'source-over';
        put(ctx, leafSpr(ps * 1.6), px, py + p * s * 0.2, ps * 4, ps * 2.1, a + p * 8 * (i % 2 ? 1 : -1), k, 0.4 + 0.6 * Math.abs(Math.cos(p * 10 + i)));
      } else if (type === 'spark' || type === 'metal') {
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k * (0.6 + 0.4 * hash(i, Math.floor(p * 30)));
        ctx.strokeStyle = rgba(i % 3 ? C.hi : C.core, 1); ctx.lineWidth = Math.max(0.7, s * 0.025);
        var d0 = d * 0.55, dm = d * 0.78, jg = s * 0.06 * (hash(i, 95) - 0.5) * 2;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * d0, y + Math.sin(a) * d0 * 0.85);
        ctx.lineTo(x + Math.cos(a) * dm - Math.sin(a) * jg, y + (Math.sin(a) * dm + Math.cos(a) * jg) * 0.85);
        ctx.lineTo(px, py); ctx.stroke();
      } else if (type === 'stone') {
        ctx.globalCompositeOperation = 'source-over';
        glow(ctx, px, py, ps * 3, C.hi, 0.25 * k);
        put(ctx, rockSpr(ps * 1.1, i), px, py + p * p * s * 0.7, ps * 2.9, ps * 2.9, a + p * 6, Math.min(1, k * 1.5));
      } else if (type === 'shadow' || type === 'bug') {
        ctx.globalCompositeOperation = 'source-over';
        glow(ctx, px, py - (type === 'shadow' ? p * s * 0.3 : 0), ps * 2.6 * (0.5 + k), type === 'shadow' ? C.lo : C.mid, 0.7 * k);
        if (type === 'bug') { ctx.globalAlpha = k; ctx.fillStyle = rgba(C.lo, 1); ctx.beginPath(); ctx.arc(px, py, ps * 0.8, 0, TAU); ctx.fill(); }
      } else if (type === 'star') {
        ctx.globalCompositeOperation = 'source-over';
        put(ctx, starSpr(ps * 1.4), px, py, ps * 4.2, ps * 4.2, a + p * 4, Math.min(1, k * 1.4));
      } else if (type === 'frost') {
        ctx.globalCompositeOperation = 'source-over';
        put(ctx, shardSpr(ps * 1.6), px, py, ps * 4.2, ps * 1.8, a, Math.min(1, k * 1.4));
      } else {
        ctx.globalCompositeOperation = 'lighter';
        sparkle(ctx, px, py, ps * 2.2 * (0.4 + k), C.hi, k, a);
      }
    }
    if (type === 'frost' || type === 'stone' || type === 'water') {
      ctx.globalCompositeOperation = 'source-over';
      for (i = 0; i < 5; i++) {
        a = hash(i, 97) * TAU; d = s * 0.5 * e * (0.5 + hash(i, 98));
        glow(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6, s * (0.25 + 0.3 * e), C.hi, 0.28 * fade);
      }
    }
    if (type === 'normal' || type === 'fire' || type === 'spark' || type === 'fight' || type === 'metal' || type === 'dragon') {
      // radial streaks
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rgba(C.core, 1);
      for (i = 0; i < 8; i++) {
        a = i / 8 * TAU + 0.2 + hash(i, 99) * 0.3; var r0 = s * (0.2 + 0.7 * e), r1 = r0 + s * 0.45 * (1 - p);
        var wd = s * 0.035 * fade;
        ctx.globalAlpha = 0.85 * fade;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
        ctx.lineTo(x + Math.cos(a + PI / 2) * wd + Math.cos(a) * r0, y + Math.sin(a + PI / 2) * wd + Math.sin(a) * r0);
        ctx.lineTo(x - Math.cos(a + PI / 2) * wd + Math.cos(a) * r0, y - Math.sin(a + PI / 2) * wd + Math.sin(a) * r0);
        ctx.closePath(); ctx.fill();
      }
    }
  }

  /* ---------------- crit ---------------- */
  function rays(ctx, x, y, n, rIn, rOut, w, rot, seed) {
    ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var a = rot + i / n * TAU + (hash(i, seed) - 0.5) * 0.15, L = rOut * (i % 2 ? 0.62 : 1) * (0.85 + 0.3 * hash(i, seed + 1));
      var ca = Math.cos(a), sa = Math.sin(a);
      ctx.moveTo(x + ca * L, y + sa * L);
      ctx.lineTo(x + ca * rIn - sa * w, y + sa * rIn + ca * w);
      ctx.lineTo(x + ca * rIn + sa * w, y + sa * rIn - ca * w);
      ctx.closePath();
    }
  }
  function crit(ctx, x, y, p, s) {
    x = num(x, 0); y = num(y, 0); p = clamp(num(p, 0), 0, 1); s = Math.max(4, num(s, 60));
    var grow = eo(Math.min(1, p * 2.6)), fade = p < 0.55 ? 1 : 1 - (p - 0.55) / 0.45, rot = p * 0.7, R = s * 2.1 * grow, g, i;
    fade = fade * fade * (3 - 2 * fade);
    if (R < 1) R = 1;
    ctx.globalCompositeOperation = 'source-over';
    glow(ctx, x, y, s * 1.2 * grow, [255, 90, 40], 0.4 * fade);
    rays(ctx, x, y, 16, s * 0.1, R, s * 0.13, rot, 101);
    g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, 'rgba(255,250,225,0.95)'); g.addColorStop(0.35, 'rgba(255,190,60,0.85)'); g.addColorStop(0.75, 'rgba(240,70,40,0.45)'); g.addColorStop(1, 'rgba(200,30,40,0)');
    ctx.globalAlpha = fade; ctx.fillStyle = g; ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    rays(ctx, x, y, 12, s * 0.05, R * 0.72, s * 0.05, -rot * 1.4 + 0.13, 131);
    g = ctx.createRadialGradient(x, y, 0, x, y, R * 0.72);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,236,150,0.7)'); g.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.globalAlpha = fade; ctx.fillStyle = g; ctx.fill();
    glow(ctx, x, y, s * (0.7 + 0.5 * grow), [255, 220, 120], fade * (p < 0.15 ? 1 : 0.8), true);
    glow(ctx, x, y, s * 1.7 * grow, [255, 120, 50], 0.35 * fade);
    // shock rings
    for (i = 0; i < 2; i++) {
      var rp = clamp((p - i * 0.1) / 0.6, 0, 1); if (rp <= 0 || rp >= 1) continue;
      ctx.beginPath(); ctx.arc(x, y, s * (0.3 + 1.9 * eo(rp)), 0, TAU);
      ctx.globalAlpha = 1 - rp; ctx.strokeStyle = i ? 'rgba(255,255,255,1)' : 'rgba(255,200,90,1)';
      ctx.lineWidth = Math.max(0.6, s * (0.14 - i * 0.07) * (1 - rp)); ctx.stroke();
    }
    for (i = 0; i < 7; i++) {
      var tw = clamp((p - hash(i, 141) * 0.4) / 0.45, 0, 1); if (tw <= 0 || tw >= 1) continue;
      var a = hash(i, 142) * TAU, d = s * (0.6 + 1.1 * hash(i, 143));
      sparkle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, s * (0.18 + 0.14 * hash(i, 144)) * bell(tw), [255, 225, 140], 1, tw);
    }
  }

  /* ---------------- giant aura ---------------- */
  function giantAura(ctx, x, y, s, t) {
    x = num(x, 0); y = num(y, 0); s = Math.max(4, num(s, 60)); t = num(t, 0);
    var pulse = 0.5 + 0.5 * Math.sin(t * 3), cy = y - s * 0.95, i, j, k;
    var RED = [255, 40, 70], MAG = [255, 40, 190], PINK = [255, 150, 225], HOT = [255, 90, 120];
    // ground
    ctx.globalCompositeOperation = 'source-over';
    glowE(ctx, x, y, s * 1.7, s * 0.46, [200, 20, 90], 0.32 + 0.12 * pulse);
    glowE(ctx, x, cy, s * 1.1, s * 1.3, [200, 30, 110], 0.16 + 0.06 * pulse);
    ctx.globalCompositeOperation = 'lighter';
    glowE(ctx, x, y, s * 1.6, s * 0.42, MAG, 0.5 + 0.25 * pulse);
    glowE(ctx, x, cy, s * 1.2, s * 1.5, RED, 0.36 + 0.16 * pulse);
    // ground ripples
    ctx.lineWidth = Math.max(0.8, s * 0.03);
    for (i = 0; i < 2; i++) {
      var ph = fr(t * 0.55 + i * 0.5), rx = s * (0.5 + 1.3 * ph);
      ctx.globalAlpha = 0.7 * (1 - ph) * Math.min(1, ph * 6); ctx.strokeStyle = rgba(PINK, 1);
      ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.28, 0, 0, TAU); ctx.stroke();
    }
    // flame tongues licking upward around silhouette
    for (i = 0; i < 9; i++) {
      var u = (i + 0.5) / 9 - 0.5, phx = fr(t * (0.7 + 0.3 * hash(i, 151)) + hash(i, 152));
      var bx = x + u * s * 2.1, by = y - (1 - Math.abs(u) * 1.6) * s * 0.9 - phx * s * 0.9;
      glowE(ctx, bx, by, s * 0.22 * (1 - phx * 0.5), s * 0.5 * (1 - phx * 0.3), i % 2 ? MAG : RED, 0.35 * bell(phx));
    }
    // helical energy ribbons
    // soft energy streams (glow beads) with a fine bright filament
    ctx.lineCap = 'round';
    for (j = 0; j < 3; j++) {
      ctx.beginPath();
      for (i = 0; i <= 16; i++) {
        k = i / 16;
        var a = t * 2.3 + k * TAU * 1.1 + j * TAU / 3, rad = s * 1.08 * (1 - 0.38 * k);
        var px = x + Math.cos(a) * rad, py = y - k * s * 2.2 + Math.sin(a) * s * 0.24;
        var depth = 0.5 + 0.5 * Math.sin(a), bk3 = bell(k);
        glow(ctx, px, py, s * (0.12 + 0.1 * depth) * (0.4 + 0.6 * bk3), i % 2 ? MAG : HOT, bk3 * (0.2 + 0.4 * depth));
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.globalAlpha = 0.3; ctx.strokeStyle = rgba(PINK, 1); ctx.lineWidth = Math.max(0.7, s * 0.016); ctx.stroke();
    }
    // rising motes
    for (i = 0; i < 18; i++) {
      var ph2 = fr(t * 0.45 * (0.6 + 0.8 * hash(i, 161)) + hash(i, 162));
      var mx = x + (hash(i, 163) - 0.5) * s * 2.3 * (1 - ph2 * 0.35) + Math.sin(t * 2 + i) * s * 0.1;
      var my = y - ph2 * s * 2.6;
      var mr = s * (0.05 + 0.05 * hash(i, 164));
      if (i % 3 === 0) glowE(ctx, mx, my, mr * 0.7, mr * 3, PINK, 0.8 * bell(ph2), true);
      else glow(ctx, mx, my, mr * 1.4, i % 2 ? MAG : HOT, 0.9 * bell(ph2), true);
    }
    // crackling arcs
    var f = Math.floor(t * 12);
    ctx.strokeStyle = rgba(PINK, 1); ctx.lineWidth = Math.max(0.7, s * 0.022);
    for (i = 0; i < 2; i++) {
      if (hash(f, i + 170) < 0.55) continue;
      var a0 = hash(f, i + 171) * TAU, cxp = x + Math.cos(a0) * s * 0.95, cyp = cy + Math.sin(a0) * s * 1.1;
      ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(cxp, cyp);
      for (j = 1; j <= 4; j++) ctx.lineTo(cxp + (hash(f * 5 + j, i + 172) - 0.5) * s * 0.4, cyp - j * s * 0.1);
      ctx.stroke();
    }
  }

  /* ---------------- platform ---------------- */
  function platformSpr(rw, rh, c) {
    var key = 'pf' + rw + 'x' + rh + '_' + c.join(','), ss = rw > 160 ? 1 : 1.5;
    var th = rh * 0.34, W = rw * 2.4, H = rh * 3.4 + th;
    return spr(key, W, H, ss, function (g) {
      var cx = W / 2, cy = rh * 1.15, i, gr;
      var light = mixc(c, [255, 248, 228], 0.38), dark = mixc(c, [18, 22, 34], 0.5), deep = mixc(c, [12, 14, 24], 0.72);
      // cast shadow
      g.save(); g.translate(cx, cy + th + rh * 0.2); g.scale(1, (rh * 1.1) / (rw * 1.08));
      gr = g.createRadialGradient(0, 0, rw * 0.3, 0, 0, rw * 1.12);
      gr.addColorStop(0, 'rgba(10,12,20,0.42)'); gr.addColorStop(0.65, 'rgba(10,12,20,0.22)'); gr.addColorStop(1, 'rgba(10,12,20,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rw * 1.12, 0, TAU); g.fill(); g.restore();
      // side band
      g.beginPath(); g.moveTo(cx + rw, cy); g.lineTo(cx + rw, cy + th);
      g.ellipse(cx, cy + th, rw, rh, 0, 0, PI, false); g.lineTo(cx - rw, cy);
      g.ellipse(cx, cy, rw, rh, 0, PI, 0, true); g.closePath();
      gr = g.createLinearGradient(cx - rw, 0, cx + rw, 0);
      gr.addColorStop(0, rgba(mixc(dark, light, 0.3), 1)); gr.addColorStop(0.45, rgba(dark, 1)); gr.addColorStop(1, rgba(deep, 1));
      g.fillStyle = gr; g.fill();
      g.save(); g.clip();
      gr = g.createLinearGradient(0, cy, 0, cy + rh + th);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(8,10,20,0.35)');
      g.fillStyle = gr; g.fillRect(cx - rw, cy, rw * 2, rh + th);
      g.lineWidth = 1;
      for (i = 0; i < 13; i++) {
        var aa = 0.15 + i / 12 * (PI - 0.3) + (hash(i, 201) - 0.5) * 0.12, sx = cx + Math.cos(aa) * rw, sy = cy + Math.sin(aa) * rh;
        g.strokeStyle = 'rgba(10,12,22,0.18)'; g.beginPath(); g.moveTo(sx, sy + 1); g.lineTo(sx + (hash(i, 202) - 0.5) * 2, sy + th * (0.6 + 0.4 * hash(i, 203))); g.stroke();
        g.strokeStyle = 'rgba(255,250,235,0.07)'; g.beginPath(); g.moveTo(sx + 1.2, sy + 1); g.lineTo(sx + 1.2, sy + th * 0.7); g.stroke();
      }
      g.strokeStyle = 'rgba(255,250,235,0.08)'; g.beginPath(); g.ellipse(cx, cy + th * 0.55, rw, rh, 0, 0.05, PI - 0.05); g.stroke();
      g.restore();
      // top surface
      g.beginPath(); g.ellipse(cx, cy, rw, rh, 0, 0, TAU);
      g.save(); g.translate(cx, cy); g.scale(1, rh / rw);
      gr = g.createRadialGradient(-rw * 0.28, -rw * 0.38, rw * 0.04, 0, 0, rw * 1.04);
      gr.addColorStop(0, rgba(light, 1)); gr.addColorStop(0.55, rgba(c, 1)); gr.addColorStop(0.88, rgba(mixc(c, dark, 0.45), 1)); gr.addColorStop(1, rgba(dark, 1));
      g.fillStyle = gr; g.fill(); g.restore();
      g.save(); g.beginPath(); g.ellipse(cx, cy, rw, rh, 0, 0, TAU); g.clip();
      // painterly patches
      for (i = 0; i < 9; i++) {
        var pa = hash(i, 211) * TAU, pd = Math.sqrt(hash(i, 212)) * 0.8, pr = rw * (0.18 + 0.2 * hash(i, 213));
        var bxp = cx + Math.cos(pa) * pd * rw, byp = cy + Math.sin(pa) * pd * rh;
        g.save(); g.translate(bxp, byp); g.scale(1, rh / rw);
        gr = g.createRadialGradient(0, 0, 0, 0, 0, pr);
        var pc = hash(i, 214) > 0.5 ? light : dark;
        gr.addColorStop(0, rgba(pc, 0.16)); gr.addColorStop(1, rgba(pc, 0));
        g.fillStyle = gr; g.fillRect(-pr, -pr, pr * 2, pr * 2); g.restore();
      }
      // speckles
      var nsp = Math.min(380, Math.round(rw * rh * 0.06));
      for (i = 0; i < nsp; i++) {
        var sa = hash(i, 221) * TAU, sd = Math.sqrt(hash(i, 222));
        g.fillStyle = hash(i, 223) > 0.55 ? rgba(light, 0.22 + 0.2 * hash(i, 224)) : rgba(dark, 0.18 + 0.15 * hash(i, 224));
        g.fillRect(cx + Math.cos(sa) * sd * rw, cy + Math.sin(sa) * sd * rh, 0.7 + hash(i, 225) * 1.3, 0.6 + hash(i, 226) * 0.9);
      }
      // grass blades along the rim
      g.lineCap = 'round'; g.lineWidth = 0.9;
      var nb = Math.min(240, Math.round(rw * 1.4));
      for (i = 0; i < nb; i++) {
        var ga = hash(i, 231) * TAU, gd = 0.72 + 0.27 * hash(i, 232), gx = cx + Math.cos(ga) * gd * rw, gy = cy + Math.sin(ga) * gd * rh;
        var gl = 2 + 3.5 * hash(i, 233), lean = (hash(i, 234) - 0.5) * 2.5;
        g.strokeStyle = hash(i, 235) > 0.4 ? rgba(mixc(light, [230, 255, 190], 0.25), 0.45) : rgba(dark, 0.4);
        g.beginPath(); g.moveTo(gx, gy); g.quadraticCurveTo(gx + lean * 0.4, gy - gl * 0.6, gx + lean, gy - gl); g.stroke();
      }
      // arena ring
      g.lineWidth = Math.max(1, rh * 0.05);
      g.strokeStyle = rgba(light, 0.22); g.beginPath(); g.ellipse(cx, cy, rw * 0.66, rh * 0.66, 0, 0, TAU); g.stroke();
      g.lineWidth = 1; g.strokeStyle = rgba(dark, 0.2); g.beginPath(); g.ellipse(cx, cy + 1.2, rw * 0.66, rh * 0.66, 0, 0.1, PI - 0.1); g.stroke();
      // inner rim shade
      g.lineWidth = Math.max(2, rh * 0.12); g.strokeStyle = rgba(dark, 0.28);
      g.beginPath(); g.ellipse(cx, cy, rw - g.lineWidth * 0.5, rh - g.lineWidth * 0.5, 0, PI * 1.08, PI * 1.92); g.stroke();
      g.restore();
      // rim light
      g.lineWidth = 1.6; g.strokeStyle = 'rgba(255,248,226,0.5)';
      g.beginPath(); g.ellipse(cx, cy, rw - 0.6, rh - 0.6, 0, PI * 1.02, PI * 1.98); g.stroke();
      g.lineWidth = 1.2; g.strokeStyle = 'rgba(255,250,235,0.3)';
      g.beginPath(); g.ellipse(cx, cy + 0.4, rw - 0.6, rh - 0.6, 0, PI * 0.05, PI * 0.95); g.stroke();
      // lip highlight on side (left, lit)
      g.lineWidth = 1; g.strokeStyle = 'rgba(255,248,230,0.18)';
      g.beginPath(); g.ellipse(cx, cy + th - 0.6, rw - 0.5, rh, 0, PI * 0.55, PI * 0.95); g.stroke();
    });
  }
  function platform(ctx, x, y, rw, rh, tint) {
    x = num(x, 0); y = num(y, 0); rw = Math.max(6, num(rw, 90)); rh = Math.max(3, num(rh, rw * 0.3));
    var c = parseColor(tint, [110, 150, 90]);
    var brw = Math.round(rw / 2) * 2, brh = Math.round(rh / 2) * 2;
    if (brw > 360) { brh = Math.max(2, Math.round(brh * 360 / brw)); brw = 360; }
    if (brh > 200) brh = 200;
    var sp = platformSpr(brw, brh, c); if (!sp) return;
    var th = brh * 0.34, W = brw * 2.4, H = brh * 3.4 + th, fx = rw / brw, fy = rh / brh;
    ctx.globalAlpha = 1;
    ctx.drawImage(sp, x - (W / 2) * fx, y - brh * 1.15 * fy, W * fx, H * fy);
  }

  /* ---------------- portal ---------------- */
  function armsSpr(r, kind) {
    var size = r * 2.3;
    return spr('pa' + kind + '_' + r, size, size, r > 90 ? 1 : 1.5, function (g) {
      var cx = size / 2, cy = size / 2, n = kind ? 4 : 5, i, j, gr = g.createRadialGradient(cx, cy, 0, cx, cy, r * 1.02);
      if (kind) {
        gr.addColorStop(0, 'rgba(235,255,255,1)'); gr.addColorStop(0.3, 'rgba(110,236,255,0.95)'); gr.addColorStop(0.7, 'rgba(70,130,255,0.55)'); gr.addColorStop(1, 'rgba(70,80,255,0)');
      } else {
        gr.addColorStop(0, 'rgba(255,235,255,1)'); gr.addColorStop(0.3, 'rgba(255,120,220,0.92)'); gr.addColorStop(0.68, 'rgba(160,80,255,0.62)'); gr.addColorStop(1, 'rgba(100,40,220,0)');
      }
      function arms(wm) {
        for (i = 0; i < n; i++) {
          var a0 = i * TAU / n + (kind ? 0.4 : 0), Lp = [], Rp = [];
          for (j = 0; j <= 26; j++) {
            var k = j / 26, rr = r * (0.06 + 0.94 * k), th = a0 - k * (kind ? 3.4 : 2.7);
            var w = r * 0.15 * wm * Math.pow(Math.sin(PI * Math.min(1, k * 1.1 + 0.02)), 0.75) * (1 - k * 0.45);
            Lp.push(cx + Math.cos(th) * (rr + w), cy + Math.sin(th) * (rr + w));
            Rp.push(cx + Math.cos(th) * (rr - w), cy + Math.sin(th) * (rr - w));
          }
          g.beginPath(); g.moveTo(Lp[0], Lp[1]);
          for (j = 2; j < Lp.length; j += 2) g.lineTo(Lp[j], Lp[j + 1]);
          for (j = Rp.length - 2; j >= 0; j -= 2) g.lineTo(Rp[j], Rp[j + 1]);
          g.closePath(); g.fill();
        }
      }
      g.fillStyle = gr;
      try { g.filter = 'blur(' + Math.max(1.5, r * 0.06).toFixed(1) + 'px)'; } catch (e) { }
      g.globalAlpha = 0.8; arms(1.6);
      try { g.filter = 'blur(' + Math.max(0.6, r * 0.015).toFixed(1) + 'px)'; } catch (e) { }
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.7; arms(0.55);
      try { g.filter = 'none'; } catch (e) { }
    });
  }
  function portal(ctx, x, y, r, t) {
    x = num(x, 0); y = num(y, 0); r = Math.max(4, num(r, 50)); t = num(t, 0);
    var br = Math.min(160, bk(r)), f = r / br, pulse = 0.5 + 0.5 * Math.sin(t * 2.2), i, g;
    var VIO = [150, 80, 255], CYA = [90, 230, 255], PNK = [255, 110, 210];
    ctx.globalCompositeOperation = 'source-over';
    glow(ctx, x, y, r * 1.4, [110, 50, 210], 0.4 + 0.1 * pulse);
    ctx.beginPath(); ctx.arc(x, y, r * 1.02, 0, TAU);
    g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.02);
    g.addColorStop(0, 'rgba(30,10,70,0.95)'); g.addColorStop(0.6, 'rgba(46,16,104,0.85)'); g.addColorStop(0.86, 'rgba(70,30,150,0.5)'); g.addColorStop(1, 'rgba(90,40,180,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, x, y, r * 1.35, VIO, 0.45 + 0.2 * pulse);
    var A = armsSpr(br, 0), B = armsSpr(br, 1), S = br * 2.3 * f;
    put(ctx, A, x, y, S, S, t * 0.9, 0.95);
    put(ctx, B, x, y, S * 0.82, S * 0.82, -t * 1.35 + 1, 0.75);
    put(ctx, A, x, y, S * 0.5, S * 0.5, t * 2.1 + 2, 0.7);
    // event horizon
    ctx.lineWidth = Math.max(1, r * 0.045);
    for (i = 0; i < 3; i++) {
      var a0 = t * (1.2 + i * 0.5) * (i % 2 ? -1 : 1) + i * 2;
      ctx.strokeStyle = rgba(i === 1 ? CYA : PNK, 1); ctx.globalAlpha = 0.45 + 0.25 * Math.sin(t * 3 + i);
      ctx.beginPath(); ctx.arc(x, y, r * (0.93 - i * 0.03), a0, a0 + PI * (0.9 + 0.3 * i)); ctx.stroke();
    }
    glow(ctx, x, y, r * (0.5 + 0.08 * Math.sin(t * 4.1)), [200, 240, 255], 0.85, true);
    glow(ctx, x, y, r * 0.16, WHITE, 0.9, true);
    // orbiting motes with short trails
    for (i = 0; i < 12; i++) {
      var orr = r * (1.04 + 0.32 * hash(i, 301)), sp = (0.5 + 0.8 * hash(i, 302)) * (i % 3 === 0 ? -1 : 1), a = t * sp + hash(i, 303) * TAU;
      var col = i % 3 === 0 ? CYA : i % 3 === 1 ? PNK : [200, 160, 255];
      for (var m = 2; m >= 0; m--) {
        var am = a - m * 0.12 * (sp > 0 ? 1 : -1);
        glow(ctx, x + Math.cos(am) * orr, y + Math.sin(am) * orr * 0.88, r * 0.075 * (1 - m * 0.25), col, (m ? 0.4 : 0.95) * (1 - m * 0.25), !m);
      }
    }
    var f2 = t * 1.3;
    for (i = 0; i < 3; i++) {
      var ph = fr(f2 + i / 3), aa = hash(Math.floor(f2 + i / 3) * 3 + i, 311) * TAU, dd = r * (0.3 + 0.9 * hash(Math.floor(f2 + i / 3) * 3 + i, 312));
      sparkle(ctx, x + Math.cos(aa) * dd, y + Math.sin(aa) * dd, r * 0.13 * bell(ph), [230, 210, 255], 0.9, ph);
    }
  }

  /* ---------------- raid beacon ---------------- */
  function beamSpr(core) {
    return cached('bm' + (core ? 1 : 0), 64, 256, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, w, 0);
      if (core) {
        gr.addColorStop(0, 'rgba(255,190,230,0)'); gr.addColorStop(0.3, 'rgba(255,200,236,0.5)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(0.7, 'rgba(255,200,236,0.5)'); gr.addColorStop(1, 'rgba(255,190,230,0)');
      } else {
        gr.addColorStop(0, 'rgba(255,40,120,0)'); gr.addColorStop(0.22, 'rgba(255,50,130,0.22)'); gr.addColorStop(0.5, 'rgba(255,90,170,0.95)'); gr.addColorStop(0.78, 'rgba(255,50,130,0.22)'); gr.addColorStop(1, 'rgba(255,40,120,0)');
      }
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'destination-in';
      gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.3, 'rgba(0,0,0,0.45)'); gr.addColorStop(0.8, 'rgba(0,0,0,0.95)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
  }
  function raidBeacon(ctx, x, yTop, yBottom, w, t) {
    x = num(x, 0); yTop = num(yTop, 0); yBottom = num(yBottom, yTop + 200); w = Math.max(4, num(w, 40)); t = num(t, 0);
    if (yBottom < yTop) { var tmp = yTop; yTop = yBottom; yBottom = tmp; }
    var H = Math.max(4, yBottom - yTop), pulse = 0.5 + 0.5 * Math.sin(t * 2.6), soft = beamSpr(0), core = beamSpr(1), i;
    var MAG = [255, 60, 150], PNK = [255, 170, 220];
    if (!soft || !core) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.5; ctx.drawImage(soft, x - w, yTop, w * 2, H);
    glowE(ctx, x, yBottom, w * 2.4, w * 0.55, [210, 30, 110], 0.45);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.45 + 0.15 * pulse; ctx.drawImage(soft, x - w * 1.6, yTop, w * 3.2, H);
    ctx.globalAlpha = 0.8; ctx.drawImage(soft, x - w * 0.6, yTop + H * 0.05, w * 1.2, H * 0.95);
    var cw = w * (0.32 + 0.06 * Math.sin(t * 9.3));
    ctx.globalAlpha = 0.85 + 0.15 * pulse; ctx.drawImage(core, x - cw / 2, yTop + H * 0.1, cw, H * 0.9);
    // energy bands travelling up
    for (i = 0; i < 3; i++) {
      var ph = fr(t * 0.45 + i / 3), yb = yBottom - ph * H * 0.95;
      glowE(ctx, x, yb, w * 0.75, w * 0.18, PNK, 0.55 * (1 - ph) * Math.min(1, ph * 8));
    }
    // rising sparkles
    for (i = 0; i < 16; i++) {
      var ph2 = fr(t * 0.35 * (0.6 + 0.8 * hash(i, 401)) + hash(i, 402));
      var sx = x + (hash(i, 403) - 0.5) * w * 1.3 + Math.sin(t * 2 + i * 1.7) * w * 0.08, sy = yBottom - ph2 * H;
      var a = bell(ph2) * (1 - ph2 * 0.5);
      if (i % 4 === 0) sparkle(ctx, sx, sy, w * 0.16, PNK, a, t + i);
      else glow(ctx, sx, sy, w * 0.07 + 1, i % 2 ? MAG : PNK, a, true);
    }
    // base flare + ripples
    glowE(ctx, x, yBottom, w * 2.2, w * 0.5, MAG, 0.55 + 0.25 * pulse);
    glowE(ctx, x, yBottom, w * 0.9, w * 0.26, WHITE, 0.6, true);
    ctx.lineWidth = Math.max(0.8, w * 0.05);
    for (i = 0; i < 2; i++) {
      var rp = fr(t * 0.6 + i * 0.5), rx = w * (0.5 + 2.0 * rp);
      ctx.globalAlpha = 0.75 * (1 - rp) * Math.min(1, rp * 6); ctx.strokeStyle = rgba(PNK, 1);
      ctx.beginPath(); ctx.ellipse(x, yBottom, rx, rx * 0.25, 0, 0, TAU); ctx.stroke();
    }
  }

  /* ---------------- catch burst ---------------- */
  var CONF = [[255, 210, 70], [255, 110, 170], [70, 220, 210], [160, 120, 255], [255, 255, 255], [255, 150, 60]];
  function catchBurst(ctx, x, y, p, s, shiny) {
    x = num(x, 0); y = num(y, 0); p = clamp(num(p, 0), 0, 1); s = Math.max(4, num(s, 60));
    var e = eo(p), fade = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3, i, a, v, px, py;
    var GOLD = [255, 200, 70];
    ctx.globalCompositeOperation = 'source-over';
    glow(ctx, x, y, s * (0.5 + 0.9 * e), [255, 190, 60], 0.35 * (1 - p));
    ctx.globalCompositeOperation = 'lighter';
    glow(ctx, x, y, s * (0.6 + 1.2 * e), GOLD, Math.pow(1 - p, 2) * 0.95, true);
    // ring
    if (p < 0.85) {
      ctx.beginPath(); ctx.arc(x, y, s * (0.3 + 1.3 * eo(p / 0.85)), 0, TAU);
      ctx.globalAlpha = 1 - p / 0.85; ctx.strokeStyle = 'rgba(255,230,150,1)'; ctx.lineWidth = Math.max(0.6, s * 0.07 * (1 - p)); ctx.stroke();
    }
    if (shiny) {
      ctx.lineWidth = Math.max(0.8, s * 0.09 * (1 - p));
      var rr = s * (0.45 + 1.15 * eo(p));
      for (i = 0; i < 12; i++) {
        ctx.strokeStyle = hsl(i * 30 + p * 360, 100, 65, 1); ctx.globalAlpha = 0.85 * fade;
        ctx.beginPath(); ctx.arc(x, y, rr, i / 12 * TAU + p * 2, (i + 1) / 12 * TAU + p * 2 + 0.02); ctx.stroke();
      }
      for (i = 0; i < 10; i++) {
        a = hash(i, 511) * TAU + p * 1.5; v = s * (0.5 + 1.2 * hash(i, 512)) * e;
        var tw = 0.5 + 0.5 * Math.sin(p * 30 + i * 2);
        var hc = hsl(hash(i, 513) * 360 + p * 400, 100, 70, 1);
        ctx.globalAlpha = fade * tw; ctx.fillStyle = hc;
        star4path(ctx, x + Math.cos(a) * v, y + Math.sin(a) * v, s * 0.16 * (0.6 + tw * 0.5), s * 0.025); ctx.fill();
      }
      glow(ctx, x, y, s * 1.4 * e, [220, 170, 255], 0.3 * fade);
    }
    // confetti (painted, visible on any background)
    ctx.globalCompositeOperation = 'source-over';
    for (i = 0; i < 22; i++) {
      a = -PI / 2 + (hash(i, 521) - 0.5) * PI * 1.7; v = s * (0.8 + 1.1 * hash(i, 522));
      var drag = 1 - Math.exp(-p * 4);
      px = x + Math.cos(a) * v * drag * 0.8 + Math.sin(p * 9 + i) * s * 0.06;
      py = y + Math.sin(a) * v * drag * 0.8 + p * p * s * 1.3;
      var flip = Math.cos(p * 18 + hash(i, 523) * 6), cw = s * 0.07, ch = s * 0.04;
      ctx.save();
      try {
        ctx.translate(px, py); ctx.rotate(p * 8 * (hash(i, 524) - 0.5) + a); ctx.scale(flip, 1);
        var cc = CONF[i % CONF.length];
        ctx.globalAlpha = fade; ctx.fillStyle = rgba(mixc(cc, flip > 0 ? WHITE : [40, 30, 60], flip > 0 ? 0.15 * flip : -0.25 * flip), 1);
        ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
      } finally { ctx.restore(); }
    }
    // golden stars
    for (i = 0; i < 9; i++) {
      a = i / 9 * TAU + hash(i, 531) * 0.5 - PI / 2; v = s * (0.9 + 0.7 * hash(i, 532));
      var dr = 1 - Math.exp(-p * 5);
      px = x + Math.cos(a) * v * dr; py = y + Math.sin(a) * v * dr * 0.9 + p * p * s * 0.8;
      var sr = s * (0.13 + 0.06 * hash(i, 533)) * (1 - p * 0.4) * (0.85 + 0.15 * Math.sin(p * 25 + i));
      put(ctx, starSpr(sr), px, py, sr * 3, sr * 3, (hash(i, 534) - 0.5) * p * 8, fade * Math.min(1, p * 8));
    }
    ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 6; i++) {
      var tw2 = clamp((p - hash(i, 541) * 0.5) / 0.4, 0, 1); if (tw2 <= 0 || tw2 >= 1) continue;
      a = hash(i, 542) * TAU; v = s * (0.4 + 1.2 * hash(i, 543));
      sparkle(ctx, x + Math.cos(a) * v, y + Math.sin(a) * v, s * 0.16 * bell(tw2), [255, 236, 170], 1, tw2);
    }
  }

  /* ---------------- spawn ring ---------------- */
  function spawnRing(ctx, x, y, p, s) {
    x = num(x, 0); y = num(y, 0); p = clamp(num(p, 0), 0, 1); s = Math.max(4, num(s, 60));
    var i, CY = [140, 236, 255], GL = [255, 236, 170], b = bell(p);
    ctx.globalCompositeOperation = 'source-over';
    glowE(ctx, x, y, s * 1.3, s * 0.36, [90, 170, 220], 0.3 * b);
    glowE(ctx, x, y - s * 0.75, s * 0.55, s * 1.2, [200, 235, 255], 0.22 * b);
    ctx.globalCompositeOperation = 'lighter';
    glowE(ctx, x, y, s * 1.2, s * 0.34, CY, 0.55 * b);
    glowE(ctx, x, y - s * 0.8, s * 0.5, s * 1.3, [210, 245, 255], 0.5 * Math.pow(b, 1.5), true);
    for (i = 0; i < 3; i++) {
      var ph = clamp(p * 1.35 - i * 0.17, 0, 1); if (ph <= 0 || ph >= 1) continue;
      var rx = s * (0.25 + 1.25 * eo(ph));
      ctx.globalAlpha = (1 - ph) * Math.min(1, ph * 5);
      ctx.strokeStyle = i === 1 ? rgba(GL, 1) : rgba(CY, 1);
      ctx.lineWidth = Math.max(0.7, s * 0.06 * (1 - ph));
      ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.3, 0, 0, TAU); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = Math.max(0.6, s * 0.02);
    var ph0 = clamp(p * 1.35, 0, 1);
    if (ph0 < 1) {
      var rx0 = s * (0.25 + 1.25 * eo(ph0));
      ctx.globalAlpha = 0.35 * (1 - ph0); ctx.strokeStyle = 'rgba(40,110,170,1)';
      ctx.beginPath(); ctx.ellipse(x, y + 1, rx0, rx0 * 0.3, 0, 0.1, PI - 0.1); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (i = 0; i < 14; i++) {
      var st = hash(i, 601) * 0.45, ph2 = clamp((p - st) / 0.55, 0, 1); if (ph2 <= 0 || ph2 >= 1) continue;
      var a = hash(i, 602) * TAU, d = s * (0.3 + 0.9 * hash(i, 603));
      var sx = x + Math.cos(a) * d, sy = y + Math.sin(a) * d * 0.3 - ph2 * s * (0.6 + 1.0 * hash(i, 604));
      if (i % 2) sparkle(ctx, sx, sy, s * (0.1 + 0.08 * hash(i, 605)) * bell(ph2), i % 4 === 1 ? GL : CY, 1, ph2 * 2);
      else glow(ctx, sx, sy, s * 0.06, i % 4 === 0 ? CY : GL, bell(ph2), true);
    }
  }

  /* ---------------- item icons ---------------- */
  var ORBS = {
    orb:   { deep: [3, 62, 72], mid: [18, 160, 162], light: [178, 255, 238], rim: [130, 255, 228], glow: [40, 220, 200], sl: GOLD_L, sd: GOLD_D },
    great: { deep: [38, 10, 92], mid: [118, 70, 222], light: [228, 206, 255], rim: [205, 175, 255], glow: [150, 100, 255], sl: SILV_L, sd: SILV_D },
    ultra: { deep: [2, 4, 16], mid: [14, 30, 86], light: [86, 146, 255], rim: [110, 170, 255], glow: [60, 110, 255], sl: GOLD_L, sd: GOLD_D }
  };
  function ellipseAt(g, cx, cy, rx, ry, rot, a0, a1) { g.beginPath(); g.ellipse(cx, cy, rx, ry, rot, a0, a1); }
  function iconShadow(g, cx, cy, R) {
    g.save(); g.translate(cx, cy + R * 0.98); g.scale(1, 0.22);
    var gr = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.85);
    gr.addColorStop(0, 'rgba(0,0,0,0.32)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(-R, -R, R * 2, R * 2); g.restore();
  }
  function glassOrb(g, cx, cy, R, C, kind) {
    var gr, i;
    iconShadow(g, cx, cy, R);
    gr = g.createRadialGradient(cx, cy, R * 0.75, cx, cy, R * 1.4);
    gr.addColorStop(0, rgba(C.glow, 0.35)); gr.addColorStop(1, rgba(C.glow, 0));
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * 1.4, 0, TAU); g.fill();
    var RX = R * 1.4, RY = R * 0.42, RROT = -0.3;
    // back half of ring
    if (kind === 'great') {
      g.lineCap = 'round';
      g.lineWidth = R * 0.1; g.strokeStyle = 'rgba(170,160,215,0.75)'; ellipseAt(g, cx, cy, RX, RY, RROT, PI, TAU); g.stroke();
    } else if (kind === 'ultra') {
      g.lineWidth = R * 0.03; g.strokeStyle = 'rgba(255,205,90,0.35)'; ellipseAt(g, cx, cy, RX, RY, RROT, PI, TAU); g.stroke();
    }
    // body
    g.beginPath(); g.arc(cx, cy, R, 0, TAU);
    gr = g.createRadialGradient(cx - R * 0.32, cy - R * 0.38, R * 0.05, cx, cy, R * 1.05);
    gr.addColorStop(0, rgba(C.light, 1)); gr.addColorStop(0.48, rgba(C.mid, 1)); gr.addColorStop(1, rgba(C.deep, 1));
    g.fillStyle = gr; g.fill();
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip();
    gr = g.createRadialGradient(cx + R * 0.15, cy + R * 0.68, 0, cx + R * 0.15, cy + R * 0.68, R * 0.8);
    gr.addColorStop(0, rgba(C.light, 0.7)); gr.addColorStop(1, rgba(C.light, 0));
    g.fillStyle = gr; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    gr = g.createRadialGradient(cx, cy, R * 0.62, cx, cy, R);
    gr.addColorStop(0, rgba(C.deep, 0)); gr.addColorStop(1, rgba(C.deep, 0.55));
    g.fillStyle = gr; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    // inner swirl of light (glass depth)
    g.lineWidth = R * 0.05; g.strokeStyle = rgba(C.light, 0.22);
    g.beginPath(); g.arc(cx, cy, R * 0.7, PI * 0.15, PI * 0.95); g.stroke();
    // star glow + star
    gr = g.createRadialGradient(cx, cy, 0, cx, cy, R * 0.75);
    gr.addColorStop(0, rgba(mixc(C.sl, WHITE, 0.3), 0.55)); gr.addColorStop(1, rgba(C.sl, 0));
    g.fillStyle = gr; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    starBevel(g, cx, cy + R * 0.02, R * 0.5, R * 0.22, 0, C.sl, C.sd);
    // glass over star
    gr = g.createLinearGradient(cx, cy - R, cx, cy + R);
    gr.addColorStop(0, rgba(C.light, 0.12)); gr.addColorStop(1, rgba(C.deep, 0.18));
    g.fillStyle = gr; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    // window reflection
    g.save(); g.translate(cx - R * 0.33, cy - R * 0.45); g.rotate(-0.6);
    gr = g.createLinearGradient(0, -R * 0.22, 0, R * 0.22);
    gr.addColorStop(0, 'rgba(255,255,255,0.92)'); gr.addColorStop(1, 'rgba(255,255,255,0.05)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, R * 0.42, R * 0.2, 0, 0, TAU); g.fill(); g.restore();
    // rim light
    g.lineWidth = R * 0.07; g.lineCap = 'round'; g.strokeStyle = rgba(C.rim, 0.75);
    g.beginPath(); g.arc(cx, cy, R * 0.95, 0.12, PI * 0.82); g.stroke();
    g.restore();
    g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(cx + R * 0.48, cy + R * 0.42, R * 0.05, 0, TAU); g.fill();
    g.lineWidth = Math.max(0.5, R * 0.025); g.strokeStyle = rgba(mixc(C.light, WHITE, 0.5), 0.5);
    g.beginPath(); g.arc(cx, cy, R * 0.99, PI * 1.05, PI * 1.6); g.stroke();
    // front half of ring
    if (kind === 'great') {
      var rg = g.createLinearGradient(cx - RX, cy, cx + RX, cy);
      rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.45, '#d4c8f4'); rg.addColorStop(1, '#8a7cc6');
      g.lineWidth = R * 0.1; g.strokeStyle = rg; ellipseAt(g, cx, cy, RX, RY, RROT, 0, PI); g.stroke();
      g.lineWidth = R * 0.03; g.strokeStyle = 'rgba(255,255,255,0.8)'; ellipseAt(g, cx, cy - R * 0.02, RX, RY, RROT, 0.25, PI * 0.75); g.stroke();
      // bead on ring
      var ba = PI * 0.3, bxp = cx + Math.cos(RROT) * Math.cos(ba) * RX - Math.sin(RROT) * Math.sin(ba) * RY, byp = cy + Math.sin(RROT) * Math.cos(ba) * RX + Math.cos(RROT) * Math.sin(ba) * RY;
      gr = g.createRadialGradient(bxp - R * 0.04, byp - R * 0.05, 0, bxp, byp, R * 0.13);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#cfc4f2'); gr.addColorStop(1, '#7d6fc0');
      g.fillStyle = gr; g.beginPath(); g.arc(bxp, byp, R * 0.12, 0, TAU); g.fill();
    } else if (kind === 'ultra') {
      g.lineWidth = R * 0.035; g.strokeStyle = 'rgba(255,215,110,0.7)'; ellipseAt(g, cx, cy, RX, RY, RROT, 0, PI); g.stroke();
      for (i = 0; i < 10; i++) {
        var sa = i / 10 * TAU + 0.2, front = Math.sin(sa) > 0;
        var sx = cx + Math.cos(RROT) * Math.cos(sa) * RX - Math.sin(RROT) * Math.sin(sa) * RY;
        var sy = cy + Math.sin(RROT) * Math.cos(sa) * RX + Math.cos(RROT) * Math.sin(sa) * RY;
        if (!front && Math.hypot(sx - cx, sy - cy) < R * 1.02) continue;
        var srr = R * (front ? 0.2 + 0.08 * (i % 2) : 0.12);
        gr = g.createRadialGradient(sx, sy, 0, sx, sy, srr);
        gr.addColorStop(0, 'rgba(255,220,120,0.6)'); gr.addColorStop(1, 'rgba(255,200,80,0)');
        g.fillStyle = gr; g.fillRect(sx - srr, sy - srr, srr * 2, srr * 2);
        g.fillStyle = front ? '#fff1bc' : 'rgba(255,220,140,0.7)';
        star4path(g, sx, sy, srr, srr * 0.12); g.fill();
      }
    }
  }
  function drawBerry(g, cx, cy, R) {
    var gr, i;
    iconShadow(g, cx, cy, R * 0.92);
    var by = cy + R * 0.12, rx = R * 0.84, ry = R * 0.8;
    gr = g.createRadialGradient(cx, by, R * 0.6, cx, by, R * 1.25);
    gr.addColorStop(0, 'rgba(255,60,170,0.3)'); gr.addColorStop(1, 'rgba(255,60,170,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, by, R * 1.25, 0, TAU); g.fill();
    function body() { g.beginPath(); g.moveTo(cx, by - ry * 0.86); g.bezierCurveTo(cx + rx * 0.7, by - ry * 1.12, cx + rx * 1.12, by - ry * 0.25, cx + rx * 0.92, by + ry * 0.35); g.bezierCurveTo(cx + rx * 0.72, by + ry * 0.95, cx + rx * 0.2, by + ry * 1.02, cx, by + ry * 1.0); g.bezierCurveTo(cx - rx * 0.2, by + ry * 1.02, cx - rx * 0.72, by + ry * 0.95, cx - rx * 0.92, by + ry * 0.35); g.bezierCurveTo(cx - rx * 1.12, by - ry * 0.25, cx - rx * 0.7, by - ry * 1.12, cx, by - ry * 0.86); g.closePath(); }
    body();
    gr = g.createRadialGradient(cx - R * 0.3, by - R * 0.3, R * 0.04, cx, by, R * 1.05);
    gr.addColorStop(0, '#ffc2ec'); gr.addColorStop(0.22, '#ff56bf'); gr.addColorStop(0.62, '#c8127e'); gr.addColorStop(1, '#5a0336');
    g.fillStyle = gr; g.fill();
    g.save(); body(); g.clip();
    gr = g.createRadialGradient(cx + R * 0.2, by + R * 0.78, 0, cx + R * 0.2, by + R * 0.78, R * 0.75);
    gr.addColorStop(0, 'rgba(255,120,205,0.6)'); gr.addColorStop(1, 'rgba(255,120,205,0)');
    g.fillStyle = gr; g.fillRect(cx - R, by - R, R * 2, R * 2);
    for (i = 0; i < 16; i++) {
      var a = i * 2.39996, d = Math.sqrt((i + 0.5) / 16) * 0.82;
      var dx = cx + Math.cos(a) * d * rx, dy = by + Math.sin(a) * d * ry, dr = R * 0.13;
      gr = g.createRadialGradient(dx - dr * 0.35, dy - dr * 0.4, 0, dx, dy, dr);
      gr.addColorStop(0, 'rgba(255,215,245,0.42)'); gr.addColorStop(0.6, 'rgba(255,170,225,0.08)'); gr.addColorStop(1, 'rgba(90,0,50,0.18)');
      g.fillStyle = gr; g.beginPath(); g.arc(dx, dy, dr, 0, TAU); g.fill();
    }
    g.lineWidth = R * 0.07; g.strokeStyle = 'rgba(255,140,215,0.6)';
    g.beginPath(); g.ellipse(cx, by, rx * 0.88, ry * 0.92, 0, 0.2, PI * 0.8); g.stroke();
    g.restore();
    g.save(); g.translate(cx - R * 0.34, by - R * 0.3); g.rotate(-0.75);
    gr = g.createLinearGradient(0, -R * 0.12, 0, R * 0.12);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0.1)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, R * 0.24, R * 0.11, 0, 0, TAU); g.fill(); g.restore();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(cx + R * 0.38, by + R * 0.36, R * 0.045, 0, TAU); g.fill();
    // calyx
    var tx = cx, ty = by - ry * 0.84;
    for (i = 0; i < 5; i++) {
      var ca = -PI / 2 + (i - 2) * 0.62, cl = R * (0.26 + 0.05 * (i % 2));
      g.fillStyle = i % 2 ? '#3f9a3a' : '#5fbf48';
      g.beginPath(); g.moveTo(tx - Math.sin(ca) * R * 0.05, ty + Math.cos(ca) * R * 0.05 + R * 0.04);
      g.quadraticCurveTo(tx + Math.cos(ca) * cl * 0.5 - Math.sin(ca) * R * 0.07, ty + Math.sin(ca) * cl * 0.5 + R * 0.12, tx + Math.cos(ca) * cl * 1.0, ty + Math.sin(ca) * cl * 0.45 + R * 0.12);
      g.quadraticCurveTo(tx + Math.cos(ca) * cl * 0.5 + Math.sin(ca) * R * 0.07, ty + Math.sin(ca) * cl * 0.2 + R * 0.04, tx + Math.sin(ca) * R * 0.05, ty - Math.cos(ca) * R * 0.05 + R * 0.04);
      g.closePath(); g.fill();
    }
    // stem
    g.lineCap = 'round'; g.lineWidth = R * 0.09;
    gr = g.createLinearGradient(tx, ty, tx + R * 0.15, ty - R * 0.4);
    gr.addColorStop(0, '#4c8a2c'); gr.addColorStop(1, '#a3c060');
    g.strokeStyle = gr; g.beginPath(); g.moveTo(tx, ty + R * 0.03); g.quadraticCurveTo(tx - R * 0.02, ty - R * 0.25, tx + R * 0.14, ty - R * 0.38); g.stroke();
    // leaf
    g.save(); g.translate(tx + R * 0.1, ty - R * 0.3); g.rotate(-0.42);
    var L = R * 0.42;
    g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(L * 0.4, -L * 0.55, L * 1.35, -L * 0.45, L * 1.9, -L * 0.05); g.bezierCurveTo(L * 1.3, L * 0.35, L * 0.4, L * 0.35, 0, 0); g.closePath();
    gr = g.createLinearGradient(0, -L * 0.5, 0, L * 0.4);
    gr.addColorStop(0, '#d2f78a'); gr.addColorStop(0.45, '#6cc24a'); gr.addColorStop(1, '#25702e');
    g.fillStyle = gr; g.fill();
    g.strokeStyle = 'rgba(240,255,200,0.75)'; g.lineWidth = Math.max(0.5, L * 0.06);
    g.beginPath(); g.moveTo(L * 0.1, 0); g.quadraticCurveTo(L * 0.9, -L * 0.12, L * 1.8, -L * 0.06); g.stroke();
    g.lineWidth = Math.max(0.4, L * 0.035); g.strokeStyle = 'rgba(240,255,200,0.4)';
    for (i = 0; i < 3; i++) { var vx = L * (0.45 + i * 0.42); g.beginPath(); g.moveTo(vx, -L * 0.08); g.lineTo(vx + L * 0.2, -L * 0.3); g.stroke(); g.beginPath(); g.moveTo(vx, -L * 0.05); g.lineTo(vx + L * 0.2, L * 0.16); g.stroke(); }
    g.restore();
  }
  function drawBadge(g, cx, cy, R) {
    var gr, i, LA = -PI * 0.75;
    iconShadow(g, cx, cy + R * 0.25, R * 0.9);
    // ribbons
    for (var sd = -1; sd <= 1; sd += 2) {
      g.beginPath();
      g.moveTo(cx + sd * R * 0.12, cy + R * 0.25); g.lineTo(cx + sd * R * 0.55, cy + R * 0.1);
      g.lineTo(cx + sd * R * 0.88, cy + R * 1.3); g.lineTo(cx + sd * R * 0.64, cy + R * 1.13); g.lineTo(cx + sd * R * 0.42, cy + R * 1.4); g.closePath();
      gr = g.createLinearGradient(cx + sd * R * 0.2, cy, cx + sd * R * 0.8, cy + R * 1.3);
      if (sd < 0) { gr.addColorStop(0, '#ff7a8c'); gr.addColorStop(0.5, '#d01e48'); gr.addColorStop(1, '#7c0a26'); }
      else { gr.addColorStop(0, '#e0485f'); gr.addColorStop(0.5, '#a8123a'); gr.addColorStop(1, '#5c061c'); }
      g.fillStyle = gr; g.fill();
      g.strokeStyle = 'rgba(255,200,210,0.45)'; g.lineWidth = R * 0.03;
      g.beginPath(); g.moveTo(cx + sd * R * 0.4, cy + R * 0.2); g.lineTo(cx + sd * R * 0.7, cy + R * 1.18); g.stroke();
    }
    // glow
    gr = g.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.35);
    gr.addColorStop(0, 'rgba(255,200,80,0.35)'); gr.addColorStop(1, 'rgba(255,200,80,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R * 1.35, 0, TAU); g.fill();
    // scalloped rim
    g.beginPath();
    var n = 40;
    for (i = 0; i <= n; i++) { var a = i / n * TAU, rr = i % 2 ? R * 0.92 : R; if (i) g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    g.closePath();
    gr = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    gr.addColorStop(0, '#fff4b8'); gr.addColorStop(0.4, '#f4bd3a'); gr.addColorStop(0.8, '#b8760e'); gr.addColorStop(1, '#8a5206');
    g.fillStyle = gr; g.fill(); g.lineJoin = 'round'; g.lineWidth = R * 0.04; g.strokeStyle = gr; g.stroke();
    // engraved inner bevel
    g.beginPath(); g.arc(cx, cy, R * 0.84, 0, TAU);
    gr = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    gr.addColorStop(0, '#a86c0c'); gr.addColorStop(0.55, '#e7ac2c'); gr.addColorStop(1, '#fff0a8');
    g.fillStyle = gr; g.fill();
    // facets (16 triangles to an octagon)
    var oc = [], rO = R * 0.76;
    for (i = 0; i < 8; i++) { var oa = i / 8 * TAU - PI / 8; oc.push([cx + Math.cos(oa) * rO, cy + Math.sin(oa) * rO]); }
    for (i = 0; i < 8; i++) {
      var A = oc[i], B = oc[(i + 1) % 8], ma = (i + 0.5) / 8 * TAU - PI / 8, rM = rO * 0.93;
      var M = [cx + Math.cos(ma) * rM, cy + Math.sin(ma) * rM];
      var tris = [[A, M, ma - 0.2], [M, B, ma + 0.2]];
      for (var f = 0; f < 2; f++) {
        var na = tris[f][2] + (f ? 0.35 : -0.35);
        var brt = 0.5 + 0.5 * Math.cos(na - LA);
        var col = rgba(mixc([150, 88, 8], [255, 244, 186], clamp(brt * 1.05 + (f ? -0.06 : 0.06), 0, 1)), 1);
        g.beginPath(); g.moveTo(cx, cy); g.lineTo(tris[f][0][0], tris[f][0][1]); g.lineTo(tris[f][1][0], tris[f][1][1]); g.closePath();
        g.fillStyle = col; g.fill(); g.strokeStyle = col; g.lineWidth = Math.max(0.4, R * 0.012); g.stroke();
      }
    }
    // centre star
    starBevel(g, cx, cy, R * 0.34, R * 0.15, 0, [255, 252, 225], [196, 120, 18]);
    // sheen
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip();
    g.translate(cx - R * 0.3, cy - R * 0.45); g.rotate(-0.6);
    gr = g.createLinearGradient(0, -R * 0.25, 0, R * 0.25);
    gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, R * 0.55, R * 0.22, 0, 0, TAU); g.fill();
    g.restore();
    // glint
    var gx = cx + R * 0.55, gy = cy - R * 0.6;
    gr = g.createRadialGradient(gx, gy, 0, gx, gy, R * 0.3);
    gr.addColorStop(0, 'rgba(255,255,230,0.7)'); gr.addColorStop(1, 'rgba(255,255,230,0)');
    g.fillStyle = gr; g.fillRect(gx - R * 0.3, gy - R * 0.3, R * 0.6, R * 0.6);
    g.fillStyle = '#ffffff'; star4path(g, gx, gy, R * 0.26, R * 0.03); g.fill();
  }
  function item(ctx, kind, x, y, r) {
    x = num(x, 0); y = num(y, 0); r = Math.max(3, num(r, 20));
    var br = r < 16 ? Math.max(3, Math.round(r)) : Math.min(120, Math.round(r / 2) * 2), f = r / br, k = ORBS[kind] ? kind : (kind === 'berry' || kind === 'badge' ? kind : 'orb');
    var size = br * 3.2, ss = br > 60 ? 1 : br > 30 ? 2 : 3;
    var sp = spr('it' + k + br, size, size, ss, function (g) {
      var cx = size / 2, cy = size / 2;
      if (k === 'berry') drawBerry(g, cx, cy, br);
      else if (k === 'badge') drawBadge(g, cx, cy - br * 0.12, br * 0.95);
      else glassOrb(g, cx, cy, br, ORBS[k], k);
    });
    if (!sp) return;
    ctx.globalAlpha = 1;
    ctx.drawImage(sp, x - size * f / 2, y - size * f / 2, size * f, size * f);
  }

  /* ---------------- export ---------------- */
  var FX = {
    attack: safe(attack),
    impact: safe(impact),
    crit: safe(crit),
    giantAura: safe(giantAura),
    platform: safe(platform),
    portal: safe(portal),
    raidBeacon: safe(raidBeacon),
    catchBurst: safe(catchBurst),
    spawnRing: safe(spawnRing),
    item: safe(item),
    types: ['fire', 'water', 'leaf', 'spark', 'stone', 'frost', 'wind', 'bug', 'mind', 'shadow', 'dragon', 'metal', 'fight', 'star', 'normal'],
    items: ['orb', 'great', 'ultra', 'berry', 'badge'],
    clearCache: function () { CACHE = {}; CN = 0; }
  };
  root.FX = FX;
})(typeof window !== 'undefined' ? window : this);
