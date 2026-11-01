// ---------- Orbs: glass spheres with a swirling inside and a glowing star core (used on the catch screen and as item icons) ----------
// Two cached layers per kind and size: the inside (rotates with the throw's spin) and the glass surface (lighting, fixed).
(function(){
const PAL={
  orb:  {g:['#e6fffb','#5fe0d2','#138a92','#063a46'],neb:['rgba(150,255,236,.55)','rgba(30,170,190,.5)','rgba(255,240,170,.35)'],core:['#fff8d6','#ffd24a','#d98f12'],halo:'#9ffcef',edge:'#06303a',ring:null},
  great:{g:['#f3eeff','#a88bff','#5233c4','#1d1157'],neb:['rgba(214,196,255,.6)','rgba(120,86,255,.5)','rgba(255,255,255,.3)'],core:['#ffffff','#e9e2ff','#9d86ff'],halo:'#cdb8ff',edge:'#170c45',ring:['#f7f9ff','#9aa3c4','#5d6480']},
  ultra:{g:['#aab6e4','#2c3a78','#121a3e','#04060f'],neb:['rgba(110,130,255,.45)','rgba(255,196,90,.22)','rgba(160,180,255,.25)'],core:['#fff6cf','#ffd24a','#b77a00'],halo:'#ffd86a',edge:'#000208',ring:['#fff0b0','#e0b13a','#8a5a00']},
};
const cache=new Map();
function mk(w){const c=document.createElement('canvas');c.width=c.height=w;return c}
function star(g,n,R,ri,rot){g.beginPath();for(let i=0;i<n*2;i++){const a=rot-Math.PI/2+i*Math.PI/n,rr=i%2?ri:R;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}g.closePath()}
function sparkle(g,R){g.beginPath();for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,rr=i%2?R*.2:R*(i%4===0?1:.62);g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}g.closePath()}
function layers(kind,R){const key=kind+'|'+R;let L=cache.get(key);if(L)return L;const P=PAL[kind],W=Math.ceil(R*2+4),c0=W/2;
  // inside (rotates)
  const a=mk(W),g=a.getContext('2d');g.translate(c0,c0);g.save();g.beginPath();g.arc(0,0,R,0,7);g.clip();
  let gr=g.createRadialGradient(-R*.3,-R*.35,R*.05,0,0,R);gr.addColorStop(0,P.g[0]);gr.addColorStop(.42,P.g[1]);gr.addColorStop(.82,P.g[2]);gr.addColorStop(1,P.g[3]);g.fillStyle=gr;g.fillRect(-R,-R,2*R,2*R);
  const blob=(x,y,r,col)=>{const b=g.createRadialGradient(x,y,0,x,y,r);b.addColorStop(0,col);b.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=b;g.beginPath();g.arc(x,y,r,0,7);g.fill()};
  blob(R*.38,-R*.05,R*.72,P.neb[0]);blob(-R*.35,R*.38,R*.62,P.neb[1]);blob(-R*.1,-R*.5,R*.42,P.neb[2]);
  // a soft spiral of mist, so the spin reads
  g.lineCap='round';for(let k=0;k<2;k++){g.beginPath();for(let t=0;t<=1.001;t+=.04){const an=k*Math.PI+t*Math.PI*1.6,rr=R*(.18+.62*t);g.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}g.strokeStyle=kind==='ultra'?'rgba(255,214,120,.22)':'rgba(255,255,255,.22)';g.lineWidth=Math.max(1,R*.09);g.stroke()}
  if(kind==='ultra'){const pts=[[-.55,-.2],[-.3,-.48],[.1,-.38],[.42,-.55],[.52,.1],[.2,.45],[-.25,.5]];g.strokeStyle='rgba(255,214,120,.5)';g.lineWidth=Math.max(.6,R*.025);g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x*R,y*R):g.moveTo(x*R,y*R));g.stroke();
    for(const [x,y] of pts){g.fillStyle='#ffe39a';g.beginPath();g.arc(x*R,y*R,Math.max(.8,R*.045),0,7);g.fill()}}
  else{const pts=kind==='orb'?[[-.5,.15,.07],[.45,.35,.05],[.3,-.55,.045],[-.2,.6,.04],[.58,-.15,.035]]:[[-.55,-.1,.05],[.5,.3,.04],[.2,-.6,.05],[-.35,.55,.035],[.6,-.3,.03],[-.1,.35,.03]];
    for(const [x,y,s] of pts){g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(x*R,y*R,Math.max(.7,s*R),0,7);g.fill()}}
  // glowing core
  blob(0,0,R*.62,kind==='great'?'rgba(255,255,255,.55)':'rgba(255,226,120,.6)');
  g.save();g.shadowColor=P.core[1];g.shadowBlur=R*.35;
  if(kind==='orb')sparkle(g,R*.56);else if(kind==='great')star(g,5,R*.46,R*.2,0);else star(g,8,R*.5,R*.22,0);
  gr=g.createRadialGradient(-R*.08,-R*.1,0,0,0,R*.55);gr.addColorStop(0,P.core[0]);gr.addColorStop(.55,P.core[1]);gr.addColorStop(1,P.core[2]);g.fillStyle=gr;g.fill();g.restore();
  g.beginPath();g.arc(0,0,R*.07,0,7);g.fillStyle='#ffffff';g.fill();
  g.restore();
  // glass surface (fixed): depth shading, caustic, rim light, highlights, edge
  const b=mk(W),h=b.getContext('2d');h.translate(c0,c0);h.save();h.beginPath();h.arc(0,0,R,0,7);h.clip();
  gr=h.createRadialGradient(-R*.32,-R*.38,R*.2,-R*.1,-R*.1,R*1.25);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.62,'rgba(0,0,0,.05)');gr.addColorStop(1,'rgba(0,0,0,.5)');h.fillStyle=gr;h.fillRect(-R,-R,2*R,2*R);
  gr=h.createRadialGradient(R*.12,R*.68,0,R*.12,R*.68,R*.6);gr.addColorStop(0,'rgba(255,255,255,.42)');gr.addColorStop(1,'rgba(255,255,255,0)');h.fillStyle=gr;h.beginPath();h.ellipse(R*.12,R*.66,R*.6,R*.26,0,0,7);h.fill();
  h.restore();
  h.lineCap='round';h.beginPath();h.arc(0,0,R*.9,Math.PI*.12,Math.PI*.78);h.strokeStyle='rgba(255,255,255,.38)';h.lineWidth=Math.max(1,R*.07);h.stroke();
  h.save();h.translate(-R*.36,-R*.42);h.rotate(-.62);gr=h.createRadialGradient(0,0,0,0,0,R*.36);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.55,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');h.fillStyle=gr;h.beginPath();h.ellipse(0,0,R*.36,R*.2,0,0,7);h.fill();h.restore();
  h.beginPath();h.arc(-R*.52,-R*.5,Math.max(.8,R*.065),0,7);h.fillStyle='rgba(255,255,255,.95)';h.fill();
  h.beginPath();h.arc(R*.5,R*.42,Math.max(.6,R*.035),0,7);h.fillStyle='rgba(255,255,255,.6)';h.fill();
  h.beginPath();h.arc(0,0,R-.5,0,7);h.strokeStyle=P.edge;h.globalAlpha=.75;h.lineWidth=Math.max(1,R*.05);h.stroke();h.globalAlpha=1;
  h.beginPath();h.arc(0,0,R*.955,Math.PI*1.05,Math.PI*1.7);h.strokeStyle='rgba(255,255,255,.55)';h.lineWidth=Math.max(.6,R*.03);h.stroke();
  L={a,b,W};cache.set(key,L);if(cache.size>60){cache.delete(cache.keys().next().value)}return L}
function ringHalf(ctx,P,r,spin,back){const rx=r*1.36,ry=r*.36,tilt=-.35;ctx.save();ctx.rotate(tilt);ctx.lineCap='round';
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,back?Math.PI:0,back?Math.PI*2:Math.PI);ctx.strokeStyle=P.ring[2];ctx.lineWidth=Math.max(2,r*.15);ctx.globalAlpha=back?.75:1;ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,back?Math.PI:0,back?Math.PI*2:Math.PI);ctx.strokeStyle=P.ring[1];ctx.lineWidth=Math.max(1.2,r*.09);ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,-r*.02,rx,ry,0,back?Math.PI*1.15:Math.PI*.15,back?Math.PI*1.6:Math.PI*.55);ctx.strokeStyle=P.ring[0];ctx.lineWidth=Math.max(.6,r*.035);ctx.stroke();
  for(let i=0;i<(P===PAL.ultra?3:1);i++){const an=spin*.6+i*Math.PI*2/3,s=Math.sin(an);if((s<0)===back){const bx=Math.cos(an)*rx,by=s*ry;ctx.globalAlpha=1;ctx.beginPath();ctx.arc(bx,by,Math.max(1.4,r*.12),0,7);
    const gg=ctx.createRadialGradient(bx-r*.03,by-r*.03,0,bx,by,r*.12);gg.addColorStop(0,'#ffffff');gg.addColorStop(1,P.ring[1]);ctx.fillStyle=gg;ctx.fill()}}
  ctx.restore()}
function drawGlassOrb(ctx,x,y,r,spin,glow,kind){const P=PAL[kind]?PAL[kind]:PAL.orb;kind=PAL[kind]?kind:'orb';if(!(r>0))return;
  const dpr=Math.min(3,window.devicePixelRatio||1),tr=ctx.getTransform?ctx.getTransform():{a:dpr},sc=Math.max(1,Math.hypot(tr.a,tr.b||0)),R=Math.max(6,Math.round(r*sc/2)*2),L=layers(kind,R),k=r/R,Wd=L.W*k;
  ctx.save();ctx.translate(x,y);
  if(glow>0){const gg=ctx.createRadialGradient(0,0,r*.6,0,0,r*2);gg.addColorStop(0,P.halo);gg.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=Math.min(1,.65*glow);ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,r*2,0,7);ctx.fill();ctx.globalAlpha=1}
  if(P.ring)ringHalf(ctx,P,r,spin||0,true);
  ctx.save();ctx.rotate(spin||0);ctx.drawImage(L.a,-Wd/2,-Wd/2,Wd,Wd);ctx.restore();
  ctx.drawImage(L.b,-Wd/2,-Wd/2,Wd,Wd);
  if(P.ring)ringHalf(ctx,P,r,spin||0,false);
  ctx.restore()}
window.drawOrb=drawGlassOrb;
// item icons (bag) use the same orbs; berries and badges keep their own art
if(window.FX&&FX.item){const orig=FX.item;FX.item=function(ctx,kind,x,y,r){if(PAL[kind])return drawGlassOrb(ctx,x,y,(r||20)*.72,0,0,kind);return orig(ctx,kind,x,y,r)}}
})();
