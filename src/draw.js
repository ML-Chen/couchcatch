// Animal-shaped creature renderer, anime-style painterly pass. Faces right by default; feet touch y.
// Style: soft gradient-shaded parts lit from the top-left, ambient-occlusion shadows where parts meet, a luminous rim
// on the back edge, fine fur/feather texture strokes, and only a whisper-thin semi-transparent line in a darker tint of
// each part's own colour. Faces: mascot-style animal eyes (solid dark rounded shape, one big white glint, a tiny sparkle;
// fierce ones cut at an angle), small mouths and blush. Stage 1 is chibi (big head and eyes); stage 3 is sleeker.
// Performance: drawCreature blits cached sprites. Each (species, palette, stage, size bucket, silhouette colour) is drawn
// once per idle phase (8 phases over a 1.57 s loop: every internal oscillator is a multiple of 4 rad/s so the loop is
// seamless) plus one blink frame, into offscreen canvases at device resolution, LRU-capped. Bob/hop/float, flip, ground
// shadow, titan aura, ethereal glow, fierce/legendary auras, motes, sparks, steam and bubbles stay live on top.
// Silhouette mode: every part one flat colour, no effects (cached separately).
// Wave 2 bodies: seal (sea lion), jelly (moon jelly), larva (caterpillar), butterfly, tortoise; plus deer ears, ringed tail,
// fern antlers, yuzu, hooves/spots/socks/steam (quad), mane (seal), gorget/flecks + S.beak needle|hook (bird).
const _dcCache=new Map();
function _dcRgb(c){if(typeof c!=='string'||c[0]!=='#')return null;let h=c.slice(1);if(h.length===3||h.length===4)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];if(h.length<6)return null;const n=parseInt(h.slice(0,6),16);return isNaN(n)?null:[n>>16,n>>8&255,n&255]}
function _dcMix(a,b,k){const key=a+'|'+b+'|'+k;let v=_dcCache.get(key);if(v!==undefined)return v;const A=_dcRgb(a),B=_dcRgb(b);
  if(!A||!B)v=typeof a==='string'?a:'#888888';else{const f=i=>Math.max(0,Math.min(255,Math.round(A[i]+(B[i]-A[i])*k)));v='#'+((1<<24)+(f(0)<<16)+(f(1)<<8)+f(2)).toString(16).slice(1)}
  if(_dcCache.size>3000)_dcCache.clear();_dcCache.set(key,v);return v}
function _dcA(c,a){const key=c+'@'+a;let v=_dcCache.get(key);if(v!==undefined)return v;const A=_dcRgb(c);v=A?'rgba('+A[0]+','+A[1]+','+A[2]+','+a+')':(typeof c==='string'?c:'#888888');
  if(_dcCache.size>3000)_dcCache.clear();_dcCache.set(key,v);return v}
const _dcW=4,_dcP=Math.PI*2/_dcW,_dcN=8;
const _dcSpr={map:new Map(),bounds:new Map(),n:0,px:0,lastT:NaN,f0:0,spent:0,MAXN:250,MAXPX:20e6,BUDGET:6};
const _dcNow=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
function _dcCols(S){const R1=typeof S.c1==='string'?S.c1:'#9a9aa8',R2=typeof S.c2==='string'?S.c2:R1,R3=typeof S.c3==='string'?S.c3:_dcMix(R1,'#000000',.55);return{R1,R2,R3}}
function _dcSt(S){return Math.max(1,Math.min(3,Math.round(+S.stage)||1))}
function _dcBob(S,u,t,ph,o){return Math.sin(t*3+ph)*u*.03-(+o.hop||0)-(S.float?u*.35+Math.sin(t*2.2+ph)*u*.08:0)}
// live, unflipped ground frame: soft ground shadow, pale ethereal glow, titan aura
function _dcFxBack(ctx,S,u,t,ph,o){if(o.silhouette)return;const{R2}=_dcCols(S),eth=o.ethereal?2:1,ga=ctx.globalAlpha;
  const g=ctx.createRadialGradient(0,0,0,0,0,u*.8);g.addColorStop(0,'rgba(24,22,40,.32)');g.addColorStop(.55,'rgba(24,22,40,.18)');g.addColorStop(1,'rgba(24,22,40,0)');
  ctx.save();ctx.scale(1,.16);ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,u*.8,0,7);ctx.fill();ctx.restore();
  const gp=.85+.15*Math.sin(t*1.6+ph),cy0=-u*(S.float?1.3:1.0);ctx.fillStyle=_dcMix(R2,'#ffffff',.55);
  for(const[k,a]of[[1.45,.035],[1.15,.045],[.85,.05]]){ctx.globalAlpha=ga*Math.min(.5,a*eth*gp);ctx.beginPath();ctx.ellipse(0,cy0,u*k*1.05,u*k*.9,0,0,7);ctx.fill()}ctx.globalAlpha=ga;
  if(o.titan){const g2=ctx.createRadialGradient(0,-u,u*.2,0,-u,u*2.2),p=.35+Math.sin(t*5)*.15;g2.addColorStop(0,`rgba(255,60,110,${p})`);g2.addColorStop(1,'rgba(255,60,110,0)');ctx.fillStyle=g2;ctx.fillRect(-u*2.3,-u*3.3,u*4.6,u*3.6)}}
// live, body frame, behind the creature: fierce/stage-3 aura and the legendary rune halo
function _dcFxAura(ctx,S,u,t,ph,o){if(o.silhouette)return;const{R1,R2}=_dcCols(S),st=_dcSt(S),X=Array.isArray(S.extras)?S.extras:[],ga=ctx.globalAlpha;
  if(X.includes('fierce')||st>=3){const p=.75+.25*Math.sin(t*4+ph),w=S.body==='quad'?1.2:1;ctx.fillStyle=typeof S.sc==='string'?S.sc:R1;for(const[k,a]of[[1.3,.04],[1.1,.055],[.92,.07]]){ctx.globalAlpha=ga*a*p;ctx.beginPath();ctx.ellipse(0,-u*1.02,u*k*w,u*k*.95,0,0,7);ctx.fill()}ctx.globalAlpha=ga}
  if(S.leg){const cl=typeof S.sc==='string'?S.sc:R2,a=t*.25,pl=.8+.2*Math.sin(t*2+ph);ctx.save();ctx.translate(0,-u*1.05);ctx.fillStyle=cl;ctx.strokeStyle=cl;
    ctx.save();ctx.rotate(a);ctx.globalAlpha=ga*.16*pl;ctx.beginPath();for(let i=0;i<16;i++){const b=i*Math.PI/8,r0=u*1.02,r1=u*(i%2?1.2:1.36);ctx.moveTo(Math.cos(b-.07)*r0,Math.sin(b-.07)*r0);ctx.lineTo(Math.cos(b)*r1,Math.sin(b)*r1);ctx.lineTo(Math.cos(b+.07)*r0,Math.sin(b+.07)*r0)}ctx.fill();ctx.restore();
    ctx.lineWidth=Math.max(1,u*.025);ctx.globalAlpha=ga*.38*pl;ctx.beginPath();ctx.arc(0,0,u,0,7);ctx.stroke();ctx.globalAlpha=ga*.2*pl;ctx.beginPath();ctx.arc(0,0,u*.88,0,7);ctx.stroke();
    ctx.rotate(-a*1.6);ctx.globalAlpha=ga*.6*pl;ctx.beginPath();for(let i=0;i<8;i++){const b=i*Math.PI/4,c=Math.cos(b),d=Math.sin(b),k=u*.05;ctx.moveTo(c*(u*.94-k*1.6),d*(u*.94-k*1.6));ctx.lineTo(c*u*.94-d*k,d*u*.94+c*k);ctx.lineTo(c*(u*.94+k*1.6),d*(u*.94+k*1.6));ctx.lineTo(c*u*.94+d*k,d*u*.94-c*k)}ctx.fill();ctx.restore();ctx.globalAlpha=ga}}
// live, body frame, in front: drifting light motes, orbiting sparks, rising steam, rising bubbles (recorded by _dcBody in u units)
function _dcFxFront(ctx,S,u,t,ph,o,L){if(o.silhouette||!L||!L.length)return;const{R2}=_dcCols(S),st=_dcSt(S),eth=o.ethereal?2:1,RIM=_dcMix(R2,'#ffffff',.7),lw=Math.max(.75,u*.03),ga=ctx.globalAlpha;
  for(const q of L){const k=q[0];
    if(k==='m'){if(st<2&&eth<2)continue;const cy=q[1]*u,r=q[2]*u,n=eth>1?7:4;ctx.fillStyle=RIM;
      for(let i=0;i<n;i++){const kk=((t*.18+i*.37+ph*.13)%1+1)%1,a=i*2.4+ph,px=Math.cos(a)*r*(.6+.4*Math.sin(i*1.7))+Math.sin(t*.9+i)*r*.08,py=cy+r*.5-kk*r*1.5,al=Math.sin(kk*Math.PI)*(.45+.2*Math.sin(t*3+i))*(eth>1?1:.7);if(al<=0)continue;
        ctx.globalAlpha=ga*al*.35;ctx.beginPath();ctx.arc(px,py,u*.045,0,7);ctx.fill();ctx.globalAlpha=ga*al;ctx.beginPath();ctx.arc(px,py,u*.016,0,7);ctx.fill()}}
    else if(k==='s'){const cx=q[1]*u,cy=q[2]*u,r=q[3]*u;for(let i=0;i<3;i++){const a=t*2+i*2.1+ph,px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r*.6;if(Math.sin(t*9+i)<=0)continue;
      ctx.globalAlpha=ga*.35;ctx.fillStyle='#fff7b0';ctx.beginPath();ctx.arc(px+r*.05,py-r*.14,r*.13,0,7);ctx.fill();ctx.globalAlpha=ga;ctx.fillStyle='#fff36b';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+r*.08,py-r*.15);ctx.lineTo(px+r*.02,py-r*.12);ctx.lineTo(px+r*.1,py-r*.28);ctx.closePath();ctx.fill()}}
    else if(k==='st'){const bx=q[1]*u,yt=q[2]*u;ctx.strokeStyle='#ffffff';ctx.lineWidth=lw*2.2;ctx.lineCap='round';for(let i=0;i<3;i++){const kk=((t*.3+i/3+ph*.05)%1+1)%1,sx=-bx*.55+i*bx*.45+Math.sin(t*1.3+i*2)*u*.05,sy=yt-u*.08-kk*u*.7,hh=u*.22;
      ctx.globalAlpha=ga*Math.sin(kk*Math.PI)*.45*eth;ctx.beginPath();ctx.moveTo(sx,sy);ctx.bezierCurveTo(sx+u*.08,sy-hh*.3,sx-u*.08,sy-hh*.6,sx+u*.02,sy-hh);ctx.stroke()}}
    else if(k==='b'){const r=q[1]*u,by=q[2]*u;for(let i=0;i<4;i++){const kk=((t*.4+i*.25+ph*.1)%1+1)%1,bx=r*(.9-i*.3)+Math.sin(t+i)*r*.15,yy=by-r*.6-kk*r*1.6,rr=r*.12*(1-kk*.4);
      ctx.globalAlpha=ga;ctx.fillStyle='rgba(220,245,255,.35)';ctx.beginPath();ctx.arc(bx,yy,rr,0,7);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(bx-rr*.35,yy-rr*.35,rr*.25,0,7);ctx.fill()}}}
  ctx.globalAlpha=ga}
// ---------- sprite cache ----------
function _dcMk(w,h){if(typeof document!=='undefined'&&document.createElement){const c=document.createElement('canvas');c.width=w;c.height=h;return c}if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);return null}
// body-frame bounding box (in u) over every phase + blink, found once per shape by a small probe render
function _dcBounds(S){const key=[S.n,S.body,_dcSt(S),S.sz,S.leg?1:0,S.float?1:0,Array.isArray(S.head)?S.head.join():'',Array.isArray(S.extras)?S.extras.join():'',S.tail,S.ears,S.beak].join('|');let b=_dcSpr.bounds.get(key);if(b)return b;
  const U=18,W=U*8,H=Math.round(U*5.6),ox=W/2,oy=Math.round(U*4.2),c=_dcMk(W,H);if(!c)return null;const x=c.getContext('2d',{willReadFrequently:true});if(!x)return null;const sz=+S.sz>0?+S.sz:1;
  for(let k=0;k<=_dcN;k++){x.setTransform(1,0,0,1,ox,oy);_dcBody(x,S,U/sz,k<_dcN?k*_dcP/_dcN:0,{ph:0,eth:1,sil:null,rec:[],blink:k===_dcN?1:0})}
  let d;try{d=x.getImageData(0,0,W,H).data}catch(e){return null}
  let x0=W,x1=-1,y0=H,y1=-1;for(let yy=0;yy<H;yy++){const r=yy*W*4;for(let xx=0;xx<W;xx++)if(d[r+xx*4+3]>2){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(yy<y0)y0=yy;if(yy>y1)y1=yy}}
  b=x1<0?{x0:-.2,x1:.2,y0:-.2,y1:.1}:{x0:(x0-1.5-ox)/U-.05,x1:(x1+2.5-ox)/U+.05,y0:(y0-1.5-oy)/U-.05,y1:(y1+2.5-oy)/U+.05};
  if(_dcSpr.bounds.size>400)_dcSpr.bounds.clear();_dcSpr.bounds.set(key,b);return b}
function _dcRender(S,e,k,sil){const cv=_dcMk(e.w,e.h);if(!cv)return null;const x=cv.getContext('2d');if(!x)return null;x.translate(e.ox,e.oy);const L=[];
  _dcBody(x,S,e.Db,k<_dcN?k*_dcP/_dcN:0,{ph:0,eth:1,sil:sil||null,rec:L,blink:k===_dcN?1:0});if(!e.live)e.live=L;e.f[k]=cv;e.n++;
  const C=_dcSpr;C.n++;C.px+=e.w*e.h;
  for(const[kk,v]of C.map){if(C.n<=C.MAXN&&C.px<=C.MAXPX)break;if(v===e)continue;C.map.delete(kk);C.n-=v.n;C.px-=v.n*v.w*v.h}
  return cv}
// blit the cached sprite for this phase (render it on demand within a per-frame time budget); null -> caller draws directly
function _dcSprite(ctx,S,s,t,ph,o){
  if(typeof ctx.getTransform!=='function'||typeof ctx.drawImage!=='function')return null;
  const m=ctx.getTransform(),ds=Math.min(2,Math.max(.25,Math.hypot(m.a,m.b)||1)),sz=+S.sz>0?+S.sz:1,D=s*ds;
  if(!(D*sz>=3&&D*sz<=320))return null;
  const bi=Math.round(Math.log(D)/Math.log(1.06)),Db=Math.pow(1.06,bi),sil=o.silhouette?String(o.silhouette):'',C=_dcSpr,
    key=S.n+'|'+S.body+'|'+S.stage+'|'+sz+'|'+S.c1+S.c2+S.c3+S.sc+'|'+bi+'|'+sil;
  let e=C.map.get(key);
  if(e){C.map.delete(key);C.map.set(key,e)}
  else{const b=_dcBounds(S);if(!b)return null;const uD=Db*sz,w=Math.ceil((b.x1-b.x0)*uD)+2,h=Math.ceil((b.y1-b.y0)*uD)+2;if(w*h>3e6)return null;
    e={f:[],w,h,ox:-b.x0*uD+1,oy:-b.y0*uD+1,Db,live:null,n:0};C.map.set(key,e)}
  const now=_dcNow();if(t!==C.lastT||now-C.f0>40){C.lastT=t;C.f0=now;C.spent=0}
  let k=Math.floor(((t+ph/_dcW)/_dcP*_dcN)%_dcN);if(k<0)k+=_dcN;if(!(k>=0&&k<_dcN))k=0;
  if(!sil&&(((t+ph*1.7)%4.3)+4.3)%4.3<.12)k=_dcN;
  let cv=e.f[k];
  if(!cv){if(e.n===0||C.spent<C.BUDGET){cv=_dcRender(S,e,k,sil);C.spent+=_dcNow()-now}
    else for(let d=1;d<=_dcN&&!cv;d++)cv=e.f[(k+d)%_dcN]||e.f[((k-d)%_dcN+_dcN)%_dcN]}
  if(!cv)return null;
  const q=s/e.Db;ctx.drawImage(cv,-e.ox*q,-e.oy*q,e.w*q,e.h*q);return e}
function drawCreature(ctx,S,x,y,s,t,o){
  if(!ctx||!S||typeof S!=='object'||typeof ctx.save!=='function')return;o=o||{};x=+x||0;y=+y||0;s=+s;t=+t||0;if(!(s>0)||!isFinite(s))return;
  let sv=0;try{const sz=+S.sz>0?+S.sz:1,u=s*sz,ph=+o.ph||0;ctx.save();sv=1;ctx.translate(x,y);
    _dcFxBack(ctx,S,u,t,ph,o);if(o.flip)ctx.scale(-1,1);ctx.translate(0,_dcBob(S,u,t,ph,o));_dcFxAura(ctx,S,u,t,ph,o);ctx.imageSmoothingEnabled=true;
    let e=null;try{e=_dcSprite(ctx,S,s,t,ph,o)}catch(err){e=null;if(typeof window!=='undefined'&&window.__dcErr)window.__dcErr(err)}
    let live;if(e)live=e.live;else{live=[];_dcBody(ctx,S,s,t,{ph,eth:o.ethereal?2:1,sil:o.silhouette||null,rec:live})}
    _dcFxFront(ctx,S,u,t,ph,o,live);
  }catch(err){if(typeof window!=='undefined'&&window.__dcErr)window.__dcErr(err)}finally{if(sv)ctx.restore()}}
// the creature itself in its body frame (origin at the feet, facing right). M: {ph,eth,sil,rec,blink}
function _dcBody(ctx,S,s,t,M){
  if(!ctx||!S)return;M=M||{};s=+s;t=+t||0;if(!(s>0)||!isFinite(s))return;
  let dep=0;const SV=()=>{ctx.save();dep++},RS=()=>{if(dep>0){ctx.restore();dep--}};
  try{
  const sz=+S.sz>0?+S.sz:1,u=s*sz,ph=+M.ph||0,sil=M.sil||null,st=_dcSt(S),REC=Array.isArray(M.rec)?M.rec:[],
    X=Array.isArray(S.extras)?S.extras:[],H=Array.isArray(S.head)?S.head:[],
    R1=typeof S.c1==='string'?S.c1:'#9a9aa8',R2=typeof S.c2==='string'?S.c2:R1,R3=typeof S.c3==='string'?S.c3:_dcMix(R1,'#000000',.55),RSC=typeof S.sc==='string'?S.sc:R2;
  const K=c=>sil||c,c1=K(R1),c2=K(R2),c3=K(R3),sc=K(RSC),fierce=X.includes('fierce'),lw=Math.max(.6,u*.026),eth=M.eth>1?2:1;
  const C3D=_dcMix(R3,'#000000',.3),OL=f=>sil||_dcA(typeof f==='string'&&f[0]==='#'?_dcMix(f,C3D,.6):C3D,.5),DK=(f,k)=>sil||_dcMix(f,R3,k);
  const INK=K('#24172a'),PALE=_dcMix(R2,'#ffffff',.55),RIM=_dcMix(R2,'#ffffff',.7);
  SV();ctx.lineJoin='round';ctx.lineCap='round';
  // ---------- painterly primitives (gradients are fine here: the result is cached as a sprite) ----------
  const HX=f=>typeof f==='string'&&f[0]==='#'&&f.length>=7,SOFT=!sil&&'filter'in ctx&&u>8?'blur('+(u*.018).toFixed(2)+'px)':'';
  const GLg=sil?null:(()=>{const g=ctx.createLinearGradient(-u*.9,-u*2.1,u*.7,u*.05);g.addColorStop(0,'rgba(255,255,255,.2)');g.addColorStop(.42,'rgba(255,255,255,0)');g.addColorStop(.6,_dcA(R3,0));g.addColorStop(1,_dcA(R3,.2));return g})();
  // volume gradient: light at top-left, body colour, darker tint of the creature's own shade colour at the far edge
  const rg=(f,cx,cy,rx,ry)=>{if(sil||!HX(f))return f;const r=Math.max(rx,ry,.5),g=ctx.createRadialGradient(cx-rx*.32,cy-ry*.48,r*.04,cx-rx*.08,cy-ry*.12,r*1.25);g.addColorStop(0,_dcMix(f,'#ffffff',.32));g.addColorStop(.46,f);g.addColorStop(1,_dcMix(f,R3,.36));return g};
  const lg=(f,x0,y0,x1,y1)=>{if(sil||!HX(f))return f;const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,_dcMix(f,'#ffffff',.26));g.addColorStop(.5,f);g.addColorStop(1,_dcMix(f,R3,.3));return g};
  // soft ambient-occlusion blob
  const ao=(cx,cy,rx,ry,a)=>{if(sil||!(rx>0&&ry>0))return;const r=Math.max(rx,ry);SV();ctx.translate(cx,cy);ctx.scale(rx/r,ry/r);const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,_dcA(C3D,a));g.addColorStop(1,_dcA(C3D,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();RS()};
  // form shading inside a clip: soft darker underside, soft top-left light
  const shadeIn=(cx,cy,rx,ry)=>{if(sil)return;let g=ctx.createLinearGradient(0,cy-ry*.1,0,cy+ry*1.15);g.addColorStop(0,_dcA(R3,0));g.addColorStop(1,_dcA(R3,.3));ctx.fillStyle=g;ctx.fillRect(cx-rx*1.7,cy-ry*.1,rx*3.4,ry*1.6);
    const r=Math.max(rx,ry,.5),lx=cx-rx*.3,ly=cy-ry*.62;g=ctx.createRadialGradient(lx,ly,0,lx,ly,r*.8);g.addColorStop(0,'rgba(255,255,255,.2)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(lx-r,ly-r,r*2,r*2)};
  // luminous rim: the path's own outline nudged up-right, so only its back/under edge shows inside the clip (bounce light)
  const rimIn=(p,k=1)=>{if(sil)return;SV();ctx.translate(lw*1.5,-lw*1.1);ctx.strokeStyle=RIM;ctx.globalAlpha*=Math.min(.9,.42*k*(eth>1?1.35:1));ctx.lineWidth=lw*1.8;if(typeof p==='function'){p();ctx.stroke()}else ctx.stroke(p);RS()};
  // fill + optional inner details + shading + rim + whisper-thin tinted line (p: Path2D)
  const FS=(p,f,box,inner,k=1)=>{ctx.fillStyle=box?rg(f,box[0],box[1],box[2],box[3]):f;ctx.fill(p);
    if(inner||!sil){SV();ctx.clip(p);if(!sil&&!box){ctx.fillStyle=GLg;ctx.fill(p)}if(inner){if(SOFT)ctx.filter=SOFT;inner();if(SOFT)ctx.filter='none'}if(box&&!sil){shadeIn(box[0],box[1],box[2],box[3]);rimIn(p)}RS()}
    if(k>0){ctx.strokeStyle=OL(f);ctx.lineWidth=lw*k;ctx.stroke(p)}};
  const E=(x,y,rx,ry,f,r=0,stroke=true)=>{rx=Math.max(.1,rx);ry=Math.max(.1,ry);ctx.beginPath();ctx.ellipse(x,y,rx,ry,r,0,7);if(f){ctx.fillStyle=rx>1.2?rg(f,x,y,rx,ry):f;ctx.fill()}if(stroke){ctx.strokeStyle=OL(f||R3);ctx.lineWidth=lw;ctx.stroke()}};
  const P=(pts,f,stroke=true)=>{ctx.beginPath();let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;pts.forEach((p,i)=>{i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});ctx.closePath();
    ctx.fillStyle=lg(f,x0,y0,x1,y1);ctx.fill();if(stroke){ctx.strokeStyle=OL(f);ctx.lineWidth=lw;ctx.stroke()}};
  const gl=(path,cx,cy,rx,ry)=>{if(sil)return;SV();path();ctx.clip();shadeIn(cx,cy,rx,ry);rimIn(path);RS()};
  const GE=(x,y,rx,ry)=>gl(()=>{ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,7)},x,y,rx,ry);
  const fur=(pts,f,a=.4)=>{if(sil)return;ctx.beginPath();for(const[x0,y0,x1,y1]of pts){ctx.moveTo(x0,y0);ctx.lineTo(x1,y1)}ctx.strokeStyle=f;ctx.globalAlpha=a;ctx.lineWidth=lw*.7;ctx.stroke();ctx.globalAlpha=1};
  // fine fur texture inside path p: short curved strokes, pale on the lit upper half, darker below (deterministic per call order)
  let fseed=1;const furTex=(p,cx,cy,rx,ry,f,dens=1,ang=2.0)=>{if(sil||u<10||!HX(f))return;SV();if(SOFT)ctx.filter='none';ctx.clip(p);let sd=(fseed++)*7919+st*131+11;const rnd=()=>{sd=(sd*16807)%2147483647;return(sd%10007)/10007};
    const n=Math.min(140,Math.max(6,Math.round(rx*ry/(u*u)*170*dens))),L=u*.085,pa=new Path2D(),pb=new Path2D();
    for(let i=0;i<n;i++){const a=rnd()*6.283,rr=Math.sqrt(rnd()),px=cx+Math.cos(a)*rx*rr,py=cy+Math.sin(a)*ry*rr,an=ang+(rnd()-.5)*.7,l=L*(.55+.7*rnd()),Q=py<cy-ry*.05?pa:pb;
      Q.moveTo(px,py);Q.quadraticCurveTo(px+Math.cos(an)*l*.5+l*.14,py+Math.sin(an)*l*.5,px+Math.cos(an)*l,py+Math.sin(an)*l)}
    ctx.lineWidth=Math.max(.5,u*.014);ctx.strokeStyle=_dcA(_dcMix(f,'#ffffff',.55),.55);ctx.stroke(pa);ctx.strokeStyle=_dcA(_dcMix(f,R3,.5),.36);ctx.stroke(pb);RS()};
  // feather / scale scallops inside path p
  const scal=(p,cx,cy,rx,ry,f,k=1,a=.32)=>{if(sil||u<10||!HX(f))return;SV();if(SOFT)ctx.filter='none';ctx.clip(p);const d=u*.09*k,pa=new Path2D();let j=0;for(let yy=cy-ry;yy<cy+ry;yy+=d*.72,j++)for(let xx=cx-rx+(j%2)*d*.5;xx<cx+rx;xx+=d){pa.moveTo(xx-d*.46,yy);pa.quadraticCurveTo(xx,yy+d*.6,xx+d*.46,yy)}
    ctx.strokeStyle=_dcA(_dcMix(f,R3,.5),a);ctx.lineWidth=Math.max(.5,u*.013);ctx.stroke(pa);RS()};
  // speckle texture (stone)
  const speck=(p,cx,cy,rx,ry,f)=>{if(sil||u<10||!HX(f))return;SV();if(SOFT)ctx.filter='none';ctx.clip(p);let sd=(fseed++)*104729+7;const rnd=()=>{sd=(sd*16807)%2147483647;return(sd%10007)/10007};const pa=new Path2D(),pb=new Path2D(),n=Math.min(70,Math.round(rx*ry/(u*u)*90));
    for(let i=0;i<n;i++){const px=cx+(rnd()*2-1)*rx,py=cy+(rnd()*2-1)*ry,r=u*(.008+.016*rnd()),Q=rnd()<.5?pa:pb;Q.moveTo(px+r,py);Q.arc(px,py,r,0,7)}
    ctx.fillStyle=_dcA(_dcMix(f,'#ffffff',.5),.5);ctx.fill(pa);ctx.fillStyle=_dcA(_dcMix(f,R3,.55),.45);ctx.fill(pb);RS()};
  // soft cheek blush
  const blush=(bx,by,r,k=1)=>{if(sil)return;const a=(st===1?.62:st===2?.45:.28)*k;SV();ctx.translate(bx,by);ctx.scale(1,.55);const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,`rgba(255,105,140,${a})`);g.addColorStop(.6,`rgba(255,120,150,${a*.45})`);g.addColorStop(1,'rgba(255,130,160,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
    if(st===1&&r>4){ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=Math.max(.5,r*.09);ctx.beginPath();for(let i=-1;i<=1;i++){ctx.moveTo(i*r*.32-r*.06,r*.2);ctx.lineTo(i*r*.32+r*.08,-r*.25)}ctx.stroke()}RS()};
  // tapered limb through joints pts with widths ws -> {p,A(back edge),B(front edge)}
  const limb=(pts,ws)=>{const n=pts.length,A=[],B=[];let dx=0,dy=1;
    for(let i=0;i<n;i++){const a=pts[i?i-1:0],b=pts[i<n-1?i+1:n-1];dx=b[0]-a[0];dy=b[1]-a[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;const w=(ws[i]||ws[0]||1)*.5;A.push([pts[i][0]-dy*w,pts[i][1]+dx*w]);B.push([pts[i][0]+dy*w,pts[i][1]-dx*w])}
    const p=new Path2D(),sm=Q=>{for(let i=1;i<Q.length-1;i++)p.quadraticCurveTo(Q[i][0],Q[i][1],(Q[i][0]+Q[i+1][0])/2,(Q[i][1]+Q[i+1][1])/2);p.lineTo(Q[Q.length-1][0],Q[Q.length-1][1])};
    p.moveTo(A[0][0],A[0][1]);sm(A);const e=pts[n-1],we=(ws[n-1]||1)*.5;p.quadraticCurveTo(e[0]+dx*we*1.3,e[1]+dy*we*1.3,B[n-1][0],B[n-1][1]);sm(B.slice().reverse());
    const s0=pts[0],s1=pts[Math.min(1,n-1)];let ex=s1[0]-s0[0],ey=s1[1]-s0[1];const d0=Math.hypot(ex,ey)||1,w0=(ws[0]||1)*.5;p.quadraticCurveTo(s0[0]-ex/d0*w0*1.3,s0[1]-ey/d0*w0*1.3,A[0][0],A[0][1]);p.closePath();return{p,A,B}};
  const limbShade=(Lm,ws)=>{const A=Lm.A,B=Lm.B,wl=ws[Math.max(0,ws.length-2)]||ws[0];ctx.strokeStyle=R3;ctx.globalAlpha=.13;ctx.lineWidth=wl*.85;ctx.beginPath();A.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();
    ctx.strokeStyle=RIM;ctx.globalAlpha=.16*(eth>1?1.3:1);ctx.lineWidth=wl*.22;ctx.beginPath();B.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();ctx.globalAlpha=1};
  const lbox=Lm=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const q of Lm.A.concat(Lm.B)){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1])}return[x0,y0,x1,y1]};
  const FSL=(Lm,ws,f,k=1)=>{const b=lbox(Lm);ctx.fillStyle=lg(f,b[0],b[1],b[2],b[3]);ctx.fill(Lm.p);if(!sil){SV();ctx.clip(Lm.p);limbShade(Lm,ws);RS()}ctx.strokeStyle=OL(f);ctx.lineWidth=lw*k;ctx.stroke(Lm.p)};
  // glowing three-layer flame with gradient tongues
  const flame=(fx,fy,fs,ang=0)=>{SV();ctx.translate(fx,fy);ctx.rotate(ang);
    if(!sil){const g=ctx.createRadialGradient(0,-fs*.42,0,0,-fs*.42,fs*.95);g.addColorStop(0,'rgba(255,196,90,.5)');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-fs*.42,fs*.95,0,7);ctx.fill()}
    for(const[k,ca,cb]of[[1,'#ff4518','#ffa53a'],[.66,'#ff9a1e','#ffe27a'],[.36,'#fff1a0','#ffffff']]){const fl=Math.sin(t*12+k*5+ph)*.13;ctx.beginPath();ctx.moveTo(-fs*.34*k,0);ctx.quadraticCurveTo(-fs*.36*k,-fs*.55*k,fl*fs,-fs*(1.1+fl)*k);ctx.quadraticCurveTo(fs*.36*k,-fs*.55*k,fs*.34*k,0);ctx.quadraticCurveTo(0,fs*.28*k,-fs*.34*k,0);
      if(sil)ctx.fillStyle=sil;else{const g=ctx.createLinearGradient(0,fs*.2*k,0,-fs*1.1*k);g.addColorStop(0,ca);g.addColorStop(1,cb);ctx.fillStyle=g;ctx.globalAlpha=k<1?.95:.9}ctx.fill()}ctx.globalAlpha=1;RS()};
  // glossy golden 5-point star with a soft glow (star type)
  const star5=(sx,sy,R,rot=0,glowA=.5)=>{if(!sil&&glowA>0){const g=ctx.createRadialGradient(sx,sy,0,sx,sy,R*2.2);g.addColorStop(0,_dcA('#fff3b0',glowA));g.addColorStop(1,'rgba(255,240,170,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,R*2.2,0,7);ctx.fill()}
    const pts=[];for(let i=0;i<10;i++){const a=rot-Math.PI/2+i*Math.PI/5,r=i%2?R*.47:R;pts.push([sx+Math.cos(a)*r,sy+Math.sin(a)*r])}P(pts,K(HX(RSC)?RSC:'#ffd65a'));
    if(!sil){ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(sx-R*.16,sy-R*.2,R*.17,0,7);ctx.fill()}};
  // twinkling 4-point sparkles (alpha cycles with the idle loop)
  const twinkles=(L)=>{if(sil)return;L.forEach(([x0,y0,r],i)=>{const a=.35+.65*Math.max(0,Math.sin(t*4+ph+i*1.7));if(a<.05)return;ctx.globalAlpha=a;ctx.fillStyle=_dcA('#fff6c8',.5);ctx.beginPath();ctx.arc(x0,y0,r*.9,0,7);ctx.fill();ctx.fillStyle='#fffbe6';ctx.beginPath();ctx.moveTo(x0,y0-r*1.6);ctx.quadraticCurveTo(x0+r*.18,y0-r*.18,x0+r*1.6,y0);ctx.quadraticCurveTo(x0+r*.18,y0+r*.18,x0,y0+r*1.6);ctx.quadraticCurveTo(x0-r*.18,y0+r*.18,x0-r*1.6,y0);ctx.quadraticCurveTo(x0-r*.18,y0-r*.18,x0,y0-r*1.6);ctx.fill()});ctx.globalAlpha=1};
  // one overlapping armour plate / shingle (pangolin scales), rounded edge hanging down
  const plate=(px,py,w,h,rot=0)=>{SV();ctx.translate(px,py);ctx.rotate(rot);const p=new Path2D();p.moveTo(-w,-h*.35);p.quadraticCurveTo(-w*1.02,h*.55,0,h);p.quadraticCurveTo(w*1.02,h*.55,w,-h*.35);p.quadraticCurveTo(0,-h*.6,-w,-h*.35);p.closePath();FS(p,sc,[0,0,w,h],null,.8);RS()};
  const finG=(x0,y0,x1,y1)=>{if(sil)return sil;const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,_dcA(R1,.95));g.addColorStop(1,_dcA(_dcMix(R2,'#ffffff',.3),.45));return g};
  // animal eye: a solid dark rounded shape (near-black, faintly tinted by the creature's darkest colour), one big white glint in
  // the upper area (~40% of the eye's width) and a tiny sparkle lower down. Round for birds/bugs/blobs/etc, upright oval for
  // furry/sleek animals. Fierce: the top is cut at an angle toward the nose with a soft lid line. Blink: a short curved line.
  const EYC=_dcMix('#120b16',R3,.2),EYL=_dcMix(EYC,_dcMix(R3,'#ffffff',.35),.4),ROUND=['bird','bug','blob','moth','golem','jelly','larva','butterfly','fish','tortoise','ghost'].includes(S.body);
  const eye=(ex,ey,r)=>{const blink=M.blink!=null?!!M.blink:(((t+ph*1.7)%4.3)+4.3)%4.3<.12,cool=st>=3&&!fierce,
      rx=r*(ROUND?.8:.7)*(cool?.9:1),ry=r*(ROUND?.84:.92)*(fierce?.94:1);
    if(blink){ctx.beginPath();ctx.moveTo(ex-rx*.95,ey+ry*.1);ctx.quadraticCurveTo(ex,ey-ry*.42,ex+rx*.95,ey+ry*.1);ctx.strokeStyle=K(EYC);ctx.lineWidth=Math.max(1,r*.16);ctx.stroke();return}
    SV();if(fierce){const cp=new Path2D();cp.moveTo(ex-rx*1.4,ey-ry*.8);cp.lineTo(ex+rx*1.4,ey-ry*.1);cp.lineTo(ex+rx*1.4,ey+ry*1.4);cp.lineTo(ex-rx*1.4,ey+ry*1.4);cp.closePath();ctx.clip(cp)}
    ctx.beginPath();ctx.ellipse(ex,ey,rx,ry,0,0,7);
    if(sil){ctx.fillStyle=sil;ctx.fill();RS();return}
    const g=ctx.createLinearGradient(0,ey-ry,0,ey+ry);g.addColorStop(0,EYC);g.addColorStop(.62,EYC);g.addColorStop(1,EYL);ctx.fillStyle=g;ctx.fill();
    const gy=fierce?ey-ry*.12:ey-ry*.36;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(ex-rx*.16,gy,rx*.4,0,7);ctx.fill();
    ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(ex+rx*.4,ey+ry*.42,rx*.13,0,7);ctx.fill();ctx.globalAlpha=1;RS();
    if(fierce){ctx.beginPath();ctx.moveTo(ex-rx*.95,ey-ry*.68);ctx.lineTo(ex+rx*1.0,ey-ry*.18);ctx.strokeStyle=_dcA(EYC,.75);ctx.lineWidth=Math.max(.7,r*.11);ctx.stroke()}};
  // profile head (snouted), centred on (hx,hy) radius hr, muzzle tip at hx+ml*hr
  const headP=(hx,hy,hr,ml)=>{const p=new Path2D(),A=a=>hx+a*hr,B=b=>hy+b*hr;p.moveTo(A(-.85),B(.02));
    p.bezierCurveTo(A(-.88),B(-.6),A(-.45),B(-.92),A(-.02),B(-.9));p.bezierCurveTo(A(.38),B(-.88),A(.52),B(-.62),A(.64),B(-.44));
    p.bezierCurveTo(A(.8),B(-.32),A(ml*.92),B(-.27),A(ml),B(-.1));p.bezierCurveTo(A(ml+.08),B(.04),A(ml+.03),B(.24),A(ml-.1),B(.3));
    p.bezierCurveTo(A(ml-.3),B(.42),A(.78),B(.5),A(.55),B(.56));p.bezierCurveTo(A(.25),B(.74),A(-.35),B(.72),A(-.66),B(.46));p.bezierCurveTo(A(-.8),B(.34),A(-.86),B(.2),A(-.85),B(.02));p.closePath();return p};
  const head=(hx,hy,hr,ml,nose)=>{const HP=headP(hx,hy,hr,ml);
    FS(HP,c1,[hx+hr*.15,hy,hr*.95,hr*.8],()=>{ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(hx+hr*(ml*.72),hy+hr*.36,hr*.52,hr*.26,-.12,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(hx+hr*.05,hy+hr*.62,hr*.5,hr*.2,0,0,7);ctx.fill();
      furTex(HP,hx-hr*.35,hy-hr*.1,hr*.55,hr*.62,R1,.8,2.3);ao(hx-hr*.3,hy-hr*.8,hr*.42,hr*.22,.2)});
    const nx=hx+hr*(ml-.02),ny=hy-hr*.05;ctx.beginPath();ctx.moveTo(nx-hr*.15,ny-hr*.05);ctx.quadraticCurveTo(nx+hr*.02,ny-hr*.15,nx+hr*.1,ny-hr*.01);ctx.quadraticCurveTo(nx+hr*.07,ny+hr*.12,nx-hr*.04,ny+hr*.1);ctx.quadraticCurveTo(nx-hr*.17,ny+hr*.04,nx-hr*.15,ny-hr*.05);const nc=K(nose||'#2a1f2a');ctx.fillStyle=lg(nc,nx-hr*.15,ny-hr*.14,nx+hr*.1,ny+hr*.1);ctx.fill();
    if(!sil){ctx.fillStyle='#ffffff';ctx.globalAlpha=.75;ctx.beginPath();ctx.ellipse(nx-hr*.04,ny-hr*.065,hr*.045,hr*.022,-.3,0,7);ctx.fill();ctx.globalAlpha=1}
    const mx=nx-hr*.12,my=ny+hr*.27;ctx.beginPath();ctx.moveTo(nx-hr*.03,ny+hr*.1);ctx.quadraticCurveTo(nx-hr*.03,ny+hr*.22,mx+hr*.05,my);ctx.quadraticCurveTo(mx-hr*.06,my+hr*.04,mx-hr*.14,my-hr*.04);ctx.strokeStyle=sil||_dcA(C3D,.7);ctx.lineWidth=Math.max(.7,hr*.035);ctx.stroke();
    if(!sil&&st===1&&!fierce){ctx.beginPath();ctx.moveTo(mx+hr*.04,my-hr*.005);ctx.quadraticCurveTo(mx-hr*.02,my+hr*.17,mx-hr*.13,my-hr*.03);ctx.quadraticCurveTo(mx-hr*.04,my+hr*.03,mx+hr*.04,my-hr*.005);ctx.fillStyle='#7e2a40';ctx.fill();ctx.fillStyle='#ff8fa8';ctx.beginPath();ctx.ellipse(mx-hr*.045,my+hr*.075,hr*.04,hr*.024,0,0,7);ctx.fill()}
    if(!sil&&fierce)P([[mx-hr*.03,my],[mx+hr*.0,my+hr*.12],[mx+hr*.04,my-hr*.01]],'#fffbea',false);
    eye(hx+hr*.3,hy-hr*.13,hr*(st===1?.3:st===2?.24:.2));blush(hx+hr*.42,hy+hr*.27,hr*.2);
    if(X.includes('tusks'))P([[hx+hr*(ml-.42),hy+hr*.38],[hx+hr*(ml-.05),hy-hr*.12],[hx+hr*(ml-.25),hy+hr*.42]],K('#fffbea'))};
  const cheekTuft=(hx,hy,hr,f)=>{const p=new Path2D();p.moveTo(hx-hr*.35,hy+hr*.2);p.lineTo(hx-hr*1.02,hy+hr*.5);p.lineTo(hx-hr*.62,hy+hr*.52);p.lineTo(hx-hr*.9,hy+hr*.78);p.lineTo(hx-hr*.45,hy+hr*.7);p.lineTo(hx-hr*.55,hy+hr*.9);p.lineTo(hx-hr*.1,hy+hr*.66);p.closePath();FS(p,f,null)};
  const ears=(hx,hy,hr,back)=>{const k=S.ears;if(!k)return;const sw=Math.sin(t*4+ph)*.06,ox=back?-hr*.3:0,f=back?DK(c1,.3):c1,fi=back?DK(c2,.35):c2;
    if(k==='pointy'||k==='bat'){const eh=hr*(k==='bat'?1.05:st===1?.95:.82);SV();ctx.translate(hx-hr*.22+ox,hy-hr*.62);ctx.rotate(-.2+sw+(back?-.18:0));if(k==='bat')ctx.scale(1.45,1);
      const p=new Path2D();p.moveTo(-hr*.3,hr*.12);p.quadraticCurveTo(-hr*.32,-eh*.6,-hr*.06,-eh);p.quadraticCurveTo(hr*.2,-eh*.5,hr*.3,hr*.08);p.closePath();
      FS(p,f,null,()=>{ctx.fillStyle=fi;if(!sil)ctx.globalAlpha=.85;ctx.beginPath();ctx.moveTo(-hr*.17,hr*.05);ctx.quadraticCurveTo(-hr*.18,-eh*.5,-hr*.06,-eh*.8);ctx.quadraticCurveTo(hr*.1,-eh*.42,hr*.16,hr*.04);ctx.fill();ctx.globalAlpha=1;
        if(!sil){ctx.fillStyle=RIM;ctx.globalAlpha=.3*eth;ctx.beginPath();ctx.ellipse(-hr*.06,-eh*.85,hr*.16,eh*.2,0,0,7);ctx.fill();ctx.globalAlpha=1}});
      fur([[-hr*.1,hr*.05,-hr*.16,-eh*.35],[hr*.04,hr*.05,hr*.02,-eh*.3]],PALE,.6);RS()}
    else if(k==='round'){const ex=hx-hr*.32+ox,ey=hy-hr*.74;E(ex,ey,hr*.27,hr*.26,f);if(!sil){ctx.globalAlpha=.85}E(ex+hr*.03,ey+hr*.02,hr*.15,hr*.14,fi,0,false);ctx.globalAlpha=1}
    else if(k==='leaflong'||k==='long'){SV();ctx.translate(hx-hr*.15+ox,hy-hr*.6);ctx.rotate(-.35+(back?-.28:0)+sw);const L=hr*(S.tail==='roo'?1.25:1.9+.25*st),p=new Path2D();
      p.moveTo(-hr*.12,0);p.bezierCurveTo(hr*.5,-L*.3,hr*.36,-L*.85,0,-L);p.bezierCurveTo(-hr*.38,-L*.85,-hr*.5,-L*.3,-hr*.12,0);p.closePath();
      FS(p,f,null,()=>{ctx.beginPath();ctx.moveTo(0,-L*.05);ctx.bezierCurveTo(hr*.24,-L*.35,hr*.17,-L*.75,0,-L*.88);ctx.bezierCurveTo(-hr*.17,-L*.75,-hr*.24,-L*.35,0,-L*.05);ctx.fillStyle=fi;if(!sil)ctx.globalAlpha=.8;ctx.fill();ctx.globalAlpha=1;
        if(!sil){ctx.fillStyle=RIM;ctx.globalAlpha=.22*eth;ctx.beginPath();ctx.ellipse(0,-L*.86,hr*.3,L*.16,0,0,7);ctx.fill();ctx.globalAlpha=1;rimIn(p)}});
      if(k==='leaflong'&&!sil){ctx.beginPath();ctx.moveTo(0,-L*.05);ctx.lineTo(0,-L*.9);for(let i=1;i<4;i++){ctx.moveTo(0,-L*i*.22);ctx.lineTo(hr*.14,-L*(i*.22+.08));ctx.moveTo(0,-L*i*.22);ctx.lineTo(-hr*.14,-L*(i*.22+.08))}ctx.strokeStyle=OL(c1);ctx.globalAlpha=.55;ctx.lineWidth=lw*.6;ctx.stroke();ctx.globalAlpha=1}
      RS()}
    else if(k==='deer'){SV();ctx.translate(hx-hr*.28+ox,hy-hr*.58);ctx.rotate(-2.25+sw+(back?-.32:0));const L=hr*(.82+.06*st),p=new Path2D();p.moveTo(0,-hr*.12);p.bezierCurveTo(L*.35,-hr*.4,L*.85,-hr*.3,L,0);p.bezierCurveTo(L*.85,hr*.28,L*.35,hr*.36,0,hr*.12);p.closePath();
      FS(p,f,null,()=>{ctx.fillStyle=fi;if(!sil)ctx.globalAlpha=.85;ctx.beginPath();ctx.ellipse(L*.55,hr*.02,L*.34,hr*.15,0,0,7);ctx.fill();ctx.globalAlpha=1;if(!sil){ctx.fillStyle=RIM;ctx.globalAlpha=.25*eth;ctx.beginPath();ctx.ellipse(L*.8,-hr*.08,L*.18,hr*.08,0,0,7);ctx.fill();ctx.globalAlpha=1}});
      fur([[L*.15,0,L*.4,-hr*.04],[L*.2,hr*.06,L*.42,hr*.08]],PALE,.5);RS()}};
  const headTop=(hx,hy,hr)=>{
    if(H.includes('horns'))for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(hx+d*hr*.25,hy-hr*.75);ctx.quadraticCurveTo(hx+d*hr*.2-hr*.3,hy-hr*1.6,hx-hr*.7+d*hr*.3,hy-hr*1.75);const hc=d<0?DK('#fff4dc',.25):K('#fff4dc');ctx.strokeStyle=OL(hc);ctx.lineWidth=hr*.22;ctx.stroke();ctx.strokeStyle=hc;ctx.lineWidth=hr*.15;ctx.stroke();
      if(!sil){ctx.strokeStyle=OL(hc);ctx.globalAlpha=.45;ctx.lineWidth=lw*.6;ctx.beginPath();for(let i=1;i<4;i++){const q=i/4,px=hx+d*hr*.25+(hx-hr*.7+d*hr*.3-hx-d*hr*.25)*q*q,py=hy-hr*.75-hr*q*1.0;ctx.moveTo(px-hr*.06,py+hr*.03);ctx.lineTo(px+hr*.06,py-hr*.02)}ctx.stroke();ctx.globalAlpha=1}}
    if(H.includes('branchantlers'))for(const d of[-1,1]){const bx=hx+d*hr*.3,by=hy-hr*.8,ac=d<0?DK('#7a5232',.2):K('#7a5232');ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx-hr*.2,by-hr*1.1);ctx.moveTo(bx-hr*.1,by-hr*.5);ctx.lineTo(bx+d*hr*.4,by-hr*.85);ctx.moveTo(bx-hr*.17,by-hr*.85);ctx.lineTo(bx-hr*.6,by-hr*1.2);ctx.strokeStyle=OL(ac);ctx.lineWidth=hr*.15;ctx.stroke();ctx.strokeStyle=ac;ctx.lineWidth=hr*.09;ctx.stroke();
      for(const[lx,ly]of[[bx-hr*.2,by-hr*1.1],[bx+d*hr*.4,by-hr*.85],[bx-hr*.6,by-hr*1.2]])E(lx,ly,hr*.18,hr*.09,K('#5fc25a'),-.6,true)}
    if(H.includes('crest'))for(let i=2;i>=0;i--){const p=new Path2D();p.moveTo(hx-hr*.05-i*hr*.25,hy-hr*.8);p.quadraticCurveTo(hx-hr*.3-i*hr*.3,hy-hr*(1.45-i*.12),hx-hr*.55-i*hr*.35,hy-hr*(1.55-i*.15));p.quadraticCurveTo(hx-hr*.4-i*hr*.25,hy-hr*1.0,hx-hr*.35-i*hr*.25,hy-hr*.68);p.closePath();FS(p,i%2?DK(sc,.15):sc,null)}
    if(H.includes('flamecrest'))flame(hx-hr*.1,hy-hr*.75,hr*.9,-.3);
    if(H.includes('crystal'))for(const[dx,hh]of[[-.35,.6],[0,.9],[.35,.6]]){P([[hx+dx*hr-hr*.13,hy-hr*.8],[hx+dx*hr,hy-hr*(.8+hh)],[hx+dx*hr+hr*.13,hy-hr*.8]],K('#e8fbff'));if(!sil){ctx.fillStyle='#ffffff';ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(hx+dx*hr,hy-hr*(.8+hh));ctx.lineTo(hx+dx*hr+hr*.12,hy-hr*.8);ctx.lineTo(hx+dx*hr+hr*.03,hy-hr*.8);ctx.fill();ctx.globalAlpha=1}}
    if(H.includes('leaf')){SV();ctx.translate(hx,hy-hr*.9);ctx.rotate(-.5+Math.sin(t*4+ph)*.2);const p=new Path2D();p.moveTo(0,0);p.quadraticCurveTo(hr*.4,-hr*.5,hr*.9,-hr*.1);p.quadraticCurveTo(hr*.4,hr*.15,0,0);FS(p,K('#3fb84a'),null);if(!sil){ctx.beginPath();ctx.moveTo(hr*.05,0);ctx.quadraticCurveTo(hr*.4,-hr*.15,hr*.8,-hr*.1);ctx.strokeStyle=K('#9be38f');ctx.lineWidth=lw*.6;ctx.stroke()}RS()}
    if(H.includes('antenna'))for(const d of[0,1]){const bx=hx+hr*(.2+d*.45),by=hy-hr*1.6+Math.sin(t*4+ph+d)*hr*.08;ctx.beginPath();ctx.moveTo(hx+hr*(d*.35),hy-hr*.75);ctx.quadraticCurveTo(hx+hr*(d*.3-.1),hy-hr*1.3,bx,by);ctx.strokeStyle=OL(c1);ctx.lineWidth=lw;ctx.stroke();const ac=K(S.t==='spark'?'#fff36b':R2);if(!sil){ctx.globalAlpha=.25*eth;E(bx,by,hr*.26,hr*.26,ac,0,false);ctx.globalAlpha=1}E(bx,by,hr*.13,hr*.13,ac)}
    if(H.includes('sunantlers'))for(const d of[-1,1]){const bx=hx+d*hr*.28,by=hy-hr*.78,ex=bx-hr*.45,ey=by-hr*1.3,tips=[[ex,ey],[bx+hr*.4,by-hr*.9],[bx+hr*.12,by-hr*1.45],[bx-hr*.75,by-hr*1.0]];ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(bx+hr*.05,by-hr*.8,ex,ey);ctx.moveTo(bx-hr*.02,by-hr*.45);ctx.lineTo(tips[1][0],tips[1][1]);ctx.moveTo(bx-hr*.1,by-hr*.95);ctx.lineTo(tips[2][0],tips[2][1]);ctx.moveTo(bx-hr*.2,by-hr*1.1);ctx.lineTo(tips[3][0],tips[3][1]);
      ctx.strokeStyle=OL(K('#ffd23f'));ctx.lineWidth=hr*.16;ctx.stroke();ctx.strokeStyle=K(d<0?'#e9b52e':'#ffd23f');ctx.lineWidth=hr*.1;ctx.stroke();for(const[lx,ly]of tips){if(!sil){ctx.globalAlpha=.3*eth;E(lx,ly,hr*.22,hr*.22,'#fff6c2',0,false);ctx.globalAlpha=1}E(lx,ly,hr*.1,hr*.1,K('#fff6c2'),0,false)}}
    if(H.includes('crescent')){const R=hr*.72;SV();ctx.translate(hx-hr*.1,hy-hr*1.35);ctx.rotate(-.25);if(!sil){ctx.globalAlpha=.22+.08*Math.sin(t*4+ph);E(0,R*.15,R*1.4,R*1.4,'#eef3ff',0,false);ctx.globalAlpha=1}
      const cp=[],N=14;for(let i=0;i<=N;i++){const a=-.45+(Math.PI+.9)*i/N;cp.push([Math.cos(a)*R,Math.sin(a)*R])}for(let i=N;i>=0;i--){const[px,py]=cp[i],w=Math.sin(Math.PI*i/N)*.5;cp.push([px-px*w,py+(-R*.25-py)*w])}
      ctx.beginPath();cp.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();ctx.fillStyle=K('#f4f0d6');ctx.fill();ctx.strokeStyle=OL(K('#f4f0d6'));ctx.lineWidth=lw*.6;ctx.stroke();E(0,R*.69,R*.13,R*.13,K('#8fe9ff'),0,false);RS()}
    if(H.includes('crowncrest')){for(let i=-1;i<=1;i++){SV();ctx.translate(hx-hr*.15,hy-hr*.75);ctx.rotate(-.55+i*.45+Math.sin(t*4+ph+i)*.05);const L=hr*(1.6-Math.abs(i)*.35),p=new Path2D();p.moveTo(-hr*.1,0);p.quadraticCurveTo(-hr*.3,-L*.6,0,-L);p.quadraticCurveTo(hr*.3,-L*.6,hr*.1,0);p.closePath();if(!sil)ctx.globalAlpha=.9;FS(p,sc,null,null,.8);ctx.globalAlpha=1;E(0,-L,hr*.1,hr*.1,K('#fff8d0'),0,false);RS()}
      P([[hx-hr*.42,hy-hr*.72],[hx-hr*.5,hy-hr*1.12],[hx-hr*.22,hy-hr*.92],[hx,hy-hr*1.28],[hx+hr*.22,hy-hr*.92],[hx+hr*.48,hy-hr*1.12],[hx+hr*.42,hy-hr*.72]],K('#ffd23f'));E(hx,hy-hr*.86,hr*.09,hr*.09,K('#ff5a8a'),0,false)}
    if(H.includes('fin')){const p=new Path2D();p.moveTo(hx+hr*.2,hy-hr*.82);p.quadraticCurveTo(hx-hr*.3,hy-hr*1.7,hx-hr*.9,hy-hr*.6);p.closePath();if(!sil)ctx.globalAlpha=.85;FS(p,c2,null,()=>{if(!sil){ctx.strokeStyle=OL(c2);ctx.globalAlpha=.35;ctx.lineWidth=lw*.6;ctx.beginPath();for(let i=1;i<4;i++){ctx.moveTo(hx+hr*.1-i*hr*.22,hy-hr*.8);ctx.lineTo(hx-i*hr*.32,hy-hr*(1.2+i*.02))}ctx.stroke();ctx.globalAlpha=1}});ctx.globalAlpha=1}
    if(H.includes('fernantlers')){const LC=typeof S.sc==='string'?S.sc:'#6cc35a';
      const frond=(P0,P1,P2,nl,ll,far)=>{const stc=far?DK('#4f9a43',.3):K('#4f9a43'),lfc=far?DK(LC,.3):K(LC),qp=q=>{const a=(1-q)*(1-q),b2=2*(1-q)*q,c=q*q;return[a*P0[0]+b2*P1[0]+c*P2[0],a*P0[1]+b2*P1[1]+c*P2[1]]};
        for(let i=1;i<=nl;i++){const q=i/(nl+1.2),[px,py]=qp(q),dx=2*(1-q)*(P1[0]-P0[0])+2*q*(P2[0]-P1[0]),dy=2*(1-q)*(P1[1]-P0[1])+2*q*(P2[1]-P1[1]),an=Math.atan2(dy,dx),l2=ll*(1-q*.35);
          for(const sd of[-1,1]){const a2=an+sd*1.05;E(px+Math.cos(a2)*l2*.7,py+Math.sin(a2)*l2*.7,l2*.62,l2*.24,lfc,a2,true)}}
        ctx.beginPath();ctx.moveTo(P0[0],P0[1]);ctx.quadraticCurveTo(P1[0],P1[1],P2[0],P2[1]);const cr=hr*(st===1?.17:.13),cx=P2[0],cy=P2[1]+cr;for(let i=0;i<=16;i++){const a=-Math.PI/2+i*.42,rr=cr*(1-i/19);ctx.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}
        ctx.strokeStyle=OL(stc);ctx.lineWidth=hr*.15;ctx.stroke();ctx.strokeStyle=stc;ctx.lineWidth=hr*.085;ctx.stroke();
        if(!sil){ctx.fillStyle=RIM;ctx.globalAlpha=.3*eth;ctx.beginPath();ctx.arc(cx,cy,cr*1.2,0,7);ctx.fill();ctx.globalAlpha=1}};
      for(const d of[-1,1]){const bx=hx+d*hr*.16-hr*.06,by=hy-hr*.8,L=hr*(st===1?.38:st===2?1.05:1.45),far=d<0,lean=far?-hr*.18:0;
        frond([bx,by],[bx+hr*.12+lean,by-L*.7],[bx-L*.42+lean,by-L],st===1?0:st===2?3:4,hr*(st===2?.3:.34),far);
        if(st>=3)frond([bx-L*.06,by-L*.42],[bx+hr*.35+lean,by-L*.62],[bx+hr*.5+lean,by-L*.92],2,hr*.24,far)}}
    if(H.includes('dhorns'))for(const d of[-1,1]){const bx0=hx+d*hr*.2-hr*.05,by0=hy-hr*.74,pts=[[bx0,by0],[bx0-hr*.16,by0-hr*.3],[bx0-hr*.42,by0-hr*.48]],ws=[hr*.22,hr*.14,hr*.03];FSL(limb(pts,ws),ws,d<0?DK('#fff0c8',.25):K('#fff0c8'),.8)}
    if(H.includes('gem')){const gx=hx+hr*.12,gy=hy-hr*.6,gr=hr*.17;if(!sil){const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr*3.2);g.addColorStop(0,_dcA(RSC,.6));g.addColorStop(1,_dcA(RSC,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(gx,gy,gr*3.2,0,7);ctx.fill()}
      P([[gx,gy-gr*1.25],[gx+gr*.8,gy],[gx,gy+gr*1.05],[gx-gr*.8,gy]],K(RSC));if(!sil){ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.moveTo(gx-gr*.1,gy-gr*.95);ctx.lineTo(gx+gr*.38,gy-gr*.15);ctx.lineTo(gx-gr*.05,gy-gr*.15);ctx.closePath();ctx.fill()}}
    if(H.includes('star'))star5(hx-hr*.08,hy-hr*1.0,hr*.27,-.15);
    if(X.includes('stripes')&&!sil){ctx.fillStyle=_dcA(R3,.75);for(const[dx,L]of[[-.12,.32],[.06,.26],[-.3,.24]]){const sx=hx+hr*dx,sy=hy-hr*.86;ctx.beginPath();ctx.moveTo(sx-hr*.05,sy);ctx.quadraticCurveTo(sx+hr*.02,sy+hr*L*.6,sx,sy+hr*L);ctx.quadraticCurveTo(sx+hr*.04,sy+hr*L*.5,sx+hr*.05,sy);ctx.closePath();ctx.fill()}}
    if(H.includes('headband')){const bc=K(RSC);ctx.strokeStyle=OL(bc);ctx.lineWidth=hr*.2;ctx.beginPath();ctx.moveTo(hx-hr*.8,hy-hr*.3);ctx.quadraticCurveTo(hx-hr*.1,hy-hr*.74,hx+hr*.64,hy-hr*.52);ctx.stroke();ctx.strokeStyle=bc;ctx.lineWidth=hr*.15;ctx.stroke();
      const wv=Math.sin(t*4+ph)*hr*.08;for(const[dy,L]of[[.12,.8],[0,1]]){const p=new Path2D();p.moveTo(hx-hr*.74,hy-hr*(.32-dy));p.quadraticCurveTo(hx-hr*(1.05+.2*L),hy-hr*(.24-dy)+wv,hx-hr*(1.0+.45*L),hy+hr*(.05+dy+.1*L)-wv);p.lineTo(hx-hr*(.88+.4*L),hy+hr*(.12+dy+.1*L)-wv);p.quadraticCurveTo(hx-hr*(.95+.1*L),hy-hr*(.1-dy)+wv,hx-hr*.7,hy-hr*(.18-dy));p.closePath();FS(p,dy?DK(bc,.2):bc,null,null,.8)}
      E(hx-hr*.76,hy-hr*.28,hr*.11,hr*.1,bc)}
    if(H.includes('whiskers'))for(const d of[0,1]){const wv=Math.sin(t*4+ph+d)*hr*.12;ctx.beginPath();ctx.moveTo(hx+hr*.9,hy+hr*(.1+d*.12));ctx.bezierCurveTo(hx+hr*1.5,hy+hr*(.1+d*.2)+wv,hx+hr*1.4,hy+hr*(.75+d*.2)-wv,hx+hr*1.85,hy+hr*(.85+d*.25)+wv);ctx.strokeStyle=sil||_dcA(R3,.45);ctx.lineWidth=Math.max(1,hr*.1);ctx.stroke();ctx.strokeStyle=K(RSC);ctx.lineWidth=Math.max(.7,hr*.06);ctx.stroke()}
    if(H.includes('beetlehorn')){const hc=K(_dcMix(R1,R3,.35)),pts=[[hx+hr*.3,hy-hr*.62],[hx+hr*.75,hy-hr*1.05],[hx+hr*.85,hy-hr*1.55]],ws=[hr*.42,hr*.24,hr*.06];FSL(limb(pts,ws),ws,hc,.8);
      const p2=[[hx+hr*.66,hy-hr*.98],[hx+hr*1.02,hy-hr*1.16]],w2=[hr*.14,hr*.05];FSL(limb(p2,w2),w2,hc,.8);if(!sil){ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=Math.max(.6,hr*.05);ctx.beginPath();ctx.moveTo(hx+hr*.42,hy-hr*.72);ctx.quadraticCurveTo(hx+hr*.68,hy-hr*1.0,hx+hr*.74,hy-hr*1.35);ctx.stroke()}}
    if(H.includes('yuzu')){const yr=hr*(.27+.04*st),yx=hx-hr*.12,yy=hy-hr*.82-yr*.75,yc=K('#ffc93a');E(yx,yy,yr,yr*.9,yc);gl(()=>{ctx.beginPath();ctx.ellipse(yx,yy,yr,yr*.9,0,0,7)},yx,yy,yr,yr*.9);
      if(!sil){ctx.fillStyle=_dcMix('#ffc93a','#c27a00',.5);ctx.globalAlpha=.45;for(const[a,b2]of[[-.35,.1],[.1,.3],[.35,-.05],[-.05,-.25]]){ctx.beginPath();ctx.arc(yx+a*yr,yy+b2*yr,yr*.06,0,7);ctx.fill()}ctx.globalAlpha=1}
      E(yx+yr*.35,yy-yr*.92,yr*.42,yr*.16,K('#4fae4a'),-.5)}};
  const tail=(tx,ty,sz,puff)=>{const k=S.tail;if(!k)return;const wag=Math.sin(t*4+ph)*.25;SV();ctx.translate(tx,ty);ctx.rotate(wag*.5);
    if(k==='flame'){const pts=[[0,0],[-sz*.45,-sz*.04],[-sz*.75,-sz*.45]],ws=[sz*.2,sz*.13,sz*.08];FSL(limb(pts,ws),ws,c1);flame(-sz*.8,-sz*.52,sz*.9,-.5)}
    else if(k==='fluffy'){if(puff){const p=new Path2D();for(let i=0;i<9;i++){const a=i*Math.PI*2/9,r=sz*(i%2?.24:.29);i?p.lineTo(Math.cos(a)*r,Math.sin(a)*r):p.moveTo(r,0)}p.closePath();FS(p,c2,[0,0,sz*.27,sz*.27])}
      else{const p=new Path2D();p.moveTo(sz*.02,-sz*.14);p.bezierCurveTo(-sz*.35,-sz*.35,-sz*.55,-sz*.75,-sz*.85,-sz*1.0);p.bezierCurveTo(-sz*1.2,-sz*1.08,-sz*1.32,-sz*.7,-sz*1.15,-sz*.45);p.lineTo(-sz*1.2,-sz*.3);p.lineTo(-sz*1.02,-sz*.28);p.bezierCurveTo(-sz*.85,-sz*.05,-sz*.45,sz*.15,sz*.02,sz*.12);p.closePath();
        FS(p,c1,[-sz*.6,-sz*.45,sz*.6,sz*.5],()=>{ctx.fillStyle=c2;if(!sil)ctx.globalAlpha=.92;ctx.beginPath();ctx.ellipse(-sz*1.02,-sz*.8,sz*.34,sz*.36,.3,0,7);ctx.fill();ctx.globalAlpha=1});
        fur([[-sz*.35,sz*.02,-sz*.5,-sz*.12],[-sz*.62,-sz*.1,-sz*.75,-sz*.28],[-sz*.5,-sz*.45,-sz*.7,-sz*.62],[-sz*.92,-sz*.55,-sz*1.05,-sz*.75]],OL(c1),.45)}}
    else if(k==='long'){const pts=[[0,0],[-sz*.55,sz*.18],[-sz*1.05,sz*.06],[-sz*1.35,-sz*.32]],ws=[sz*.26,sz*.2,sz*.12,sz*.04];FSL(limb(pts,ws),ws,c1)}
    else if(k==='fin'){const pts=[[0,0],[-sz*.5,sz*.12],[-sz*.85,-sz*.04]],ws=[sz*.24,sz*.15,sz*.08];FSL(limb(pts,ws),ws,c1);const p=new Path2D();p.moveTo(-sz*.78,-sz*.04);p.quadraticCurveTo(-sz*1.05,-sz*.3,-sz*1.3,-sz*.55);p.quadraticCurveTo(-sz*1.12,-sz*.05,-sz*1.3,sz*.4);p.quadraticCurveTo(-sz*1.0,sz*.12,-sz*.78,-sz*.04);if(!sil)ctx.globalAlpha=.85;FS(p,c2,null);ctx.globalAlpha=1}
    else if(k==='stub'){E(-sz*.1,-sz*.04,sz*.17,sz*.13,c1);GE(-sz*.1,-sz*.04,sz*.17,sz*.13)}
    else if(k==='bolt'){ctx.rotate(-.5);P([[0,0],[-sz*.45,-sz*.2],[-sz*.35,-sz*.35],[-sz*.9,-sz*.55],[-sz*.55,-sz*.2],[-sz*.65,-sz*.1]],sc)}
    else if(k==='leaf'){const p=new Path2D();p.moveTo(0,0);p.quadraticCurveTo(-sz*.5,-sz*.6,-sz*1.0,-sz*.3);p.quadraticCurveTo(-sz*.5,sz*.15,0,0);FS(p,K('#3fb84a'),null)}
    else if(k==='ringed'){const p=new Path2D();p.moveTo(sz*.02,-sz*.14);p.bezierCurveTo(-sz*.35,-sz*.35,-sz*.55,-sz*.75,-sz*.85,-sz*1.0);p.bezierCurveTo(-sz*1.2,-sz*1.1,-sz*1.34,-sz*.72,-sz*1.15,-sz*.45);p.bezierCurveTo(-sz*.85,-sz*.05,-sz*.45,sz*.15,sz*.02,sz*.12);p.closePath();const rc=sil||_dcMix(R1,R2,.55),dc=DK(c1,.4);
      FS(p,c1,[-sz*.6,-sz*.45,sz*.6,sz*.5],()=>{ctx.lineWidth=sz*.12;for(const[a,b2,cl]of[[-.36,-.14,rc],[-.58,-.42,dc],[-.8,-.68,rc],[-1.02,-.86,dc]]){ctx.strokeStyle=cl;ctx.beginPath();ctx.moveTo(sz*(a-.3),sz*(b2+.26));ctx.lineTo(sz*(a+.3),sz*(b2-.26));ctx.stroke()}ctx.fillStyle=dc;ctx.beginPath();ctx.ellipse(-sz*1.12,-sz*.82,sz*.22,sz*.28,.4,0,7);ctx.fill()});
      fur([[-sz*.3,sz*.04,-sz*.44,-sz*.1],[-sz*.6,-sz*.08,-sz*.72,-sz*.26],[-sz*.95,-sz*.5,-sz*1.08,-sz*.7]],OL(c1),.4);
      if(S.t==='fire'&&st>=2)flame(-sz*1.02,-sz*1.0,sz*.4,-.35)}
    else if(k==='spade'){const pts=[[0,0],[-sz*.5,sz*.12],[-sz*.95,-sz*.05],[-sz*1.2,-sz*.42]],ws=[sz*.3,sz*.2,sz*.12,sz*.07];FSL(limb(pts,ws),ws,c1);
      SV();ctx.translate(-sz*1.22,-sz*.45);ctx.rotate(-.9);const p=new Path2D(),k2=sz*.26;p.moveTo(0,k2*.25);p.bezierCurveTo(-k2*.9,-k2*.1,-k2*.7,-k2*.9,0,-k2*1.25);p.bezierCurveTo(k2*.7,-k2*.9,k2*.9,-k2*.1,0,k2*.25);p.closePath();FS(p,sc,[0,-k2*.5,k2*.7,k2*.7]);RS()}
    else if(k==='scaly'){const pts=[[0,0],[-sz*.45,sz*.16],[-sz*.85,sz*.3],[-sz*1.15,sz*.34]],ws=[sz*.34,sz*.28,sz*.18,sz*.06];FSL(limb(pts,ws),ws,c1);
      for(let i=pts.length-2;i>=0;i--)for(const q of[.75,.25]){const a=pts[i],b2=pts[i+1],px=a[0]+(b2[0]-a[0])*q,py=a[1]+(b2[1]-a[1])*q,w=(ws[i]+(ws[i+1]-ws[i])*q)*.5;if(w>sz*.04)plate(px,py-w*.2,w*.85,w*.75,-.3)}}
    else if(k==='roo'){const pts=[[0,0],[-sz*.45,sz*.2],[-sz*.95,sz*.34]],ws=[sz*.36,sz*.24,sz*.1];FSL(limb(pts,ws),ws,c1)}
    RS()};
  // membrane wing (bat / dragon): arm bones to three finger tips, scalloped membrane between them
  const batwing=(wx,wy,ws,far,fast,rot=0)=>{const f=Math.sin(t*(fast?8:4)+ph)*(fast?.32:.09);SV();ctx.translate(wx,wy);ctx.rotate(-.3+f+(far?-.32:0)+rot);if(far)ctx.scale(.88,.88);
    const W=[-ws*.28,-ws*.72],T=[[-ws*.12,-ws*1.08],[-ws*.68,-ws*1.0],[-ws*1.08,-ws*.62],[-ws*1.12,-ws*.14]],mc=sil||_dcMix(R1,RSC,.35),fc=far?DK(mc,.32):mc,bc=far?DK(c1,.42):DK(c1,.18);
    const p=new Path2D();p.moveTo(ws*.05,ws*.04);p.lineTo(W[0],W[1]);p.lineTo(T[0][0],T[0][1]);
    for(let i=1;i<T.length;i++){const a=T[i-1],c=T[i],mx=(a[0]+c[0])/2,my=(a[1]+c[1])/2;p.quadraticCurveTo(mx+(W[0]-mx)*.32,my+(W[1]-my)*.32,c[0],c[1])}
    p.quadraticCurveTo(-ws*.5,-ws*.05,-ws*.02,ws*.14);p.closePath();
    if(!sil)ctx.globalAlpha=.96;FS(p,fc,[-ws*.55,-ws*.55,ws*.6,ws*.55],()=>{if(!sil){ctx.strokeStyle=_dcA(R3,.2);ctx.lineWidth=lw*.6;ctx.beginPath();for(const q of T){ctx.moveTo(W[0],W[1]);ctx.lineTo(q[0]*.7+W[0]*.3+ws*.03,q[1]*.7+W[1]*.3+ws*.06)}ctx.stroke()}},.8);ctx.globalAlpha=1;
    ctx.strokeStyle=bc;ctx.lineWidth=Math.max(1,ws*.07);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W[0],W[1]);ctx.lineTo(T[0][0],T[0][1]);for(const q of T.slice(1)){ctx.moveTo(W[0],W[1]);ctx.quadraticCurveTo((W[0]+q[0])/2,(W[1]+q[1])/2-ws*.03,q[0],q[1])}ctx.stroke();
    E(W[0],W[1],ws*.06,ws*.06,bc,0,false);P([[T[0][0]-ws*.05,T[0][1]+ws*.03],[T[0][0]+ws*.02,T[0][1]-ws*.12],[T[0][0]+ws*.07,T[0][1]+ws*.04]],K('#fff0c8'),false);RS()};
  // feathered (or insect) raised wing
  const wings=(wx,wy,ws,flap,bug)=>{const f=Math.sin(t*(flap?12:4)+ph)*(flap?.35:.08);SV();ctx.translate(wx,wy);ctx.rotate(-.5+f);const p=new Path2D();p.moveTo(0,0);p.bezierCurveTo(-ws*.4,-ws*1.1,-ws*1.3,-ws*1.0,-ws*1.2,-ws*.2);
    if(bug){p.bezierCurveTo(-ws*.9,-ws*.05,-ws*.4,ws*.1,0,0);if(!sil)ctx.globalAlpha=.72;FS(p,c2,null,()=>{if(!sil){ctx.fillStyle=RIM;ctx.globalAlpha=.35*eth;ctx.beginPath();ctx.ellipse(-ws*.85,-ws*.6,ws*.3,ws*.2,-.5,0,7);ctx.fill();ctx.strokeStyle=OL(c2);ctx.globalAlpha=.4;ctx.lineWidth=lw*.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-ws*1.1,-ws*.6);ctx.moveTo(-ws*.4,-ws*.25);ctx.lineTo(-ws*.8,-ws*.85);ctx.moveTo(-ws*.6,-ws*.35);ctx.lineTo(-ws*1.0,-ws*.2);ctx.stroke()}},.8)}
    else{const jt=[[-ws*1.2,-ws*.2],[-ws*.92,-ws*.1],[-ws*.64,-ws*.04],[-ws*.36,ws*.02],[0,0]];for(let i=1;i<jt.length;i++){const a=jt[i-1],c=jt[i];p.quadraticCurveTo((a[0]+c[0])/2,(a[1]+c[1])/2+ws*.14,c[0],c[1])}
      const HUM=S.beak==='needle';if(HUM&&!sil){const gc=_dcMix(R1,R2,.4);ctx.fillStyle=gc;for(const[a,al]of[[-.55,.16],[-.28,.26],[.28,.26],[.55,.16]]){SV();ctx.rotate(a);ctx.globalAlpha=al;ctx.fill(p);RS()}ctx.globalAlpha=1}
      if(!sil)ctx.globalAlpha=.94;FS(p,HUM&&!sil?_dcMix(R1,R2,.35):c2,[-ws*.6,-ws*.5,ws*.6,ws*.45],()=>{ctx.fillStyle=c1;ctx.beginPath();ctx.ellipse(-ws*.32,-ws*.55,ws*.5,ws*.26,-.55,0,7);ctx.fill();if(!sil){ctx.strokeStyle=OL(c2);ctx.globalAlpha=.4;ctx.lineWidth=lw*.6;ctx.beginPath();for(let i=1;i<4;i++){ctx.moveTo(-ws*(.2+i*.15),-ws*(.45+i*.08));ctx.lineTo(jt[i][0],jt[i][1])}ctx.stroke();ctx.fillStyle=RIM;ctx.globalAlpha=.18*eth;ctx.beginPath();ctx.ellipse(-ws*.9,-ws*.25,ws*.35,ws*.14,-.2,0,7);ctx.fill()}ctx.globalAlpha=1},.8)}
    ctx.globalAlpha=1;RS()};
  const sparks=(cx,cy,r)=>{if(X.includes('sparks')&&!sil)REC.push(['s',cx/u,cy/u,r/u])};
  const flowers=(pts,r)=>{if(!X.includes('flowers'))return;for(const[fx,fy]of pts){for(let i=0;i<5;i++){const a=i*1.256;E(fx+Math.cos(a)*r*.6,fy+Math.sin(a)*r*.6,r*.42,r*.42,K('#ffb3d1'),0,!sil)}E(fx,fy,r*.32,r*.32,K('#ffe14d'),0,false)}};
  const preHead=(hx,hy,hr)=>{if(sil||!H.includes('sunhalo'))return;SV();ctx.translate(hx-hr*.3,hy-hr*.35);ctx.rotate(t*2/3);ctx.fillStyle='#ffb43a';ctx.globalAlpha=.7;ctx.beginPath();
    for(let i=0;i<12;i++){const b=i*Math.PI/6,r0=hr*1.55,r1=hr*(i%2?2.1:2.5);ctx.moveTo(Math.cos(b-.16)*r0,Math.sin(b-.16)*r0);ctx.lineTo(Math.cos(b)*r1,Math.sin(b)*r1);ctx.lineTo(Math.cos(b+.16)*r0,Math.sin(b+.16)*r0)}ctx.fill();
    ctx.globalAlpha=.55;ctx.fillStyle='#ffd65a';ctx.beginPath();ctx.arc(0,0,hr*1.7,0,7);ctx.fill();ctx.globalAlpha=.45+.1*Math.sin(t*4+ph);ctx.fillStyle='#fff3b8';ctx.beginPath();ctx.arc(0,0,hr*1.35,0,7);ctx.fill();RS();ctx.globalAlpha=1};
  const SW=[[0,0],[-.2,-.7],[-.55,-1.08],[-1.1,-1.3],[-.92,-1.0],[-1.2,-.92],[-.95,-.72],[-1.12,-.55],[-.85,-.45],[-.92,-.22],[-.6,-.25],[-.55,-.02],[-.3,-.08]];
  const stormwing=(wx,wy,ws,far)=>{const f=Math.sin(t*4+ph)*.16;SV();ctx.translate(wx,wy);ctx.rotate((far?.5:0)+f);if(far)ctx.scale(.9,.9);
    P(SW.map(([a,b])=>[a*ws,b*ws]),far?DK(c1,.45):c1);if(!sil)ctx.globalAlpha=.9;P(SW.map(([a,b])=>[a*ws*.6,b*ws*.6]),far?DK(c2,.3):c2,false);ctx.globalAlpha=1;
    if(!sil){ctx.strokeStyle=sc;ctx.globalAlpha=.3+.2*Math.sin(t*8+ph);ctx.lineWidth=lw*1.1;ctx.beginPath();SW.slice(3,12).forEach(([a,b],j)=>j?ctx.lineTo(a*ws,b*ws):ctx.moveTo(a*ws,b*ws));ctx.stroke();ctx.globalAlpha=1;
      ctx.lineWidth=Math.max(1,lw*.55);ctx.beginPath();for(const i of[3,5,7,9,11]){if(Math.sin(t*12+i*1.9+ph)<.1)continue;const px=SW[i][0]*ws,py=SW[i][1]*ws,k=ws*.09;ctx.moveTo(px,py);ctx.lineTo(px-k,py+k*.4);ctx.lineTo(px-k*.6,py+k*.9);ctx.lineTo(px-k*1.7,py+k*1.2)}ctx.stroke()}
    RS()};
  // tiny drifting light motes (stage 2-3, or ethereal)
  const motes=(cy,r)=>{if(!sil)REC.push(['m',cy/u,r/u])};
  const b=S.body;
  if(b==='quad'){
    const L=u*(.38+.1*(st-1)),bx=u*(.44+.07*st),dp=u*(.4+.02*st),yt=-L-dp,ycb=-L+u*.02,ywa=ycb-dp*(.1+.1*st),yrb=-L-dp*.12,
      hr=u*[0,.52,.4,.31][st],hx=bx+hr*.36+u*.06,hy=yt-hr*.64-u*.06,ml=(X.includes('tusks')?1.2:S.ears==='round'?.98:1.06)+.08*(st-1)-(st===1?.08:0),
      hoof=X.includes('tusks')||H.includes('sunantlers')||(H.includes('horns')&&X.includes('shell'))||X.includes('hooves');
    preHead(hx,hy,hr);
    const TP=new Path2D();TP.moveTo(hx-hr*.6,hy+hr*.1);TP.bezierCurveTo(hx-hr*.95,hy+hr*.55,bx*.5,yt-u*.03,bx*.18,yt);TP.bezierCurveTo(-bx*.2,yt+u*.035,-bx*.5,yt+u*.03,-bx*.78,yt-u*.005);
    TP.bezierCurveTo(-bx*1.04,yt-u*.01,-bx*1.14,yt+dp*.42,-bx*1.0,yt+dp*.72);TP.bezierCurveTo(-bx*.9,yt+dp*.95,-bx*.68,yrb+u*.02,-bx*.48,yrb);TP.bezierCurveTo(-bx*.25,ywa,bx*.02,ywa,bx*.3,ycb-u*.03);
    TP.bezierCurveTo(bx*.6,ycb+u*.02,bx*.94,ycb-dp*.08,bx*1.03,yt+dp*.52);TP.bezierCurveTo(bx*1.1,yt+dp*.22,hx+hr*.05,hy+hr*.95,hx+hr*.3,hy+hr*.48);TP.closePath();
    const INV=new Path2D();INV.rect(-u*4,-u*4,u*8,u*8);INV.addPath(TP);
    const paw=(px,gy,f,far)=>{if(hoof){const hc=far?DK(C3D,.0):K(_dcMix(R3,'#000000',.15));P([[px-u*.065,gy-u*.075],[px+u*.06,gy-u*.075],[px+u*.095,gy],[px-u*.075,gy]],hc);if(!sil){ctx.beginPath();ctx.moveTo(px+u*.02,gy-u*.07);ctx.lineTo(px+u*.03,gy);ctx.strokeStyle=RIM;ctx.globalAlpha=.25;ctx.lineWidth=lw*.6;ctx.stroke();ctx.globalAlpha=1}}
      else{E(px+u*.04,gy-u*.05,u*.1,u*.05,f);if(!sil)GE(px+u*.04,gy-u*.05,u*.1,u*.05);ctx.beginPath();ctx.moveTo(px+u*.075,gy-u*.07);ctx.lineTo(px+u*.085,gy-u*.025);ctx.moveTo(px+u*.11,gy-u*.06);ctx.lineTo(px+u*.12,gy-u*.02);ctx.strokeStyle=OL(f);ctx.lineWidth=lw*.7;ctx.stroke()}};
    const NLP=[];const legQ=(front,x0,far)=>{const w=t*4+ph+((front===far)?Math.PI:0),dx=Math.sin(w)*u*.035,lift=Math.max(0,Math.cos(w))*u*(st>1?.02:.012),fo=far?-u*.075:0,yo=far?-u*.03:0,gy=yo-lift,x1=x0+fo;let pts,ws;
      if(front){pts=[[x1+u*.03,yt+dp*.28],[x1-u*.05+dx*.3,ycb-u*.02+yo*.5],[x1+dx*.8,gy-L*.2],[x1+u*.035+dx,gy-u*.075]];ws=[u*.3,u*.17,u*.1,u*.092]}
      else{pts=[[x1-u*.02,yt+dp*.22],[x1-u*.01,yt+dp*.72],[x1+u*.13+dx*.4,-L*.64+yo],[x1-u*.1+dx*.8,gy-L*.27],[x1-u*.02+dx,gy-u*.075]];ws=[u*.38,u*.44,u*.2,u*.105,u*.092]}
      const Lm=limb(pts,ws),lc=X.includes('socks')?DK(c1,.62):c1,f=far?DK(lc,.34):lc,lb=lbox(Lm);if(!far)NLP.push(Lm.p);ctx.fillStyle=lg(f,lb[0],lb[1],lb[2],lb[3]);ctx.fill(Lm.p);if(!sil){SV();ctx.clip(Lm.p);limbShade(Lm,ws);if(!far){furTex(Lm.p,pts[1][0],pts[1][1],ws[1]*.6,(lb[3]-lb[1])*.3,R1,.8,1.7);ao(front?pts[1][0]:x1,front?ycb+u*.02:yrb+u*.01,(front?ws[1]:ws[2])*.9,u*.11,.34)}RS()}
      ctx.strokeStyle=OL(f);ctx.lineWidth=lw;if(far)ctx.stroke(Lm.p);else{SV();ctx.clip(INV,'evenodd');ctx.stroke(Lm.p);RS()}
      if(!far&&!front&&!sil)fur([[x1-u*.2,yt+dp*.62,x1-u*.25,yt+dp*.78],[x1-u*.17,yt+dp*.8,x1-u*.22,yt+dp*.95]],OL(c1),.35);
      paw(pts[pts.length-1][0],gy,f,far)};
    // far side
    if(X.includes('wings'))wings(-bx*.05,yt+u*.04,u*.82,false);
    if(X.includes('batwings'))batwing(bx*.05,yt+u*.04,u*(.6+.14*st),true,false,.72);
    legQ(false,-bx*.56,true);legQ(true,bx*.56,true);
    tail(-bx*.98,yt+dp*.28,u*.7);
    if(X.includes('spikes')){const n=st>1?7:6,ln=u*(.18+.04*st);for(let i=n-1;i>=0;i--){const q=i/(n-1),sx=-bx*.88+q*bx*1.15,sy=yt+u*.04+(q<.15?(.15-q)*dp*1.6:0)+(q>.85?(q-.85)*u*.4:0),a=-1.95-.25*(1-q),p=new Path2D();p.moveTo(sx-u*.08,sy+u*.04);p.quadraticCurveTo(sx+Math.cos(a)*ln*.5-u*.03,sy+Math.sin(a)*ln*.5,sx+Math.cos(a)*ln,sy+Math.sin(a)*ln);p.quadraticCurveTo(sx+Math.cos(a)*ln*.4+u*.06,sy+Math.sin(a)*ln*.4,sx+u*.08,sy+u*.03);p.closePath();FS(p,i%2?DK(sc,.12):sc,null,()=>{if(!sil){ctx.strokeStyle=RIM;ctx.globalAlpha=.35;ctx.lineWidth=lw*.7;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+Math.cos(a)*ln*.8,sy+Math.sin(a)*ln*.8);ctx.stroke();ctx.globalAlpha=1}},.8)}}
    if(X.includes('crystalmane'))for(let i=0;i<4;i++){const sx=-bx*.45+i*bx*.32,h2=u*(.28+.1*(i%2));P([[sx-u*.08,yt+u*.04],[sx-u*.05,yt-h2],[sx+u*.08,yt+u*.04]],K('#e8fbff'));if(!sil){ctx.fillStyle='#ffffff';ctx.globalAlpha=.55;ctx.beginPath();ctx.moveTo(sx-u*.05,yt-h2);ctx.lineTo(sx+u*.07,yt+u*.03);ctx.lineTo(sx+u*.0,yt+u*.03);ctx.fill();ctx.globalAlpha=1}}
    legQ(false,-bx*.56,false);legQ(true,bx*.56,false);
    // torso (drawn over the tops of the near legs; its outline skips the leg openings so legs grow out of the body)
    FS(TP,c1,[0,yt+dp*.5,bx,dp*.55],()=>{ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(bx*.8,ycb-dp*.25,bx*.42,dp*.55,-.2,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(-bx*.05,ycb+dp*.04,bx*.62,dp*.2,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(bx*1.02,yt+dp*.05,u*.13,dp*.55,-.35,0,7);ctx.fill();
      fur([[bx*.45,ycb-dp*.55,bx*.52,ycb-dp*.42],[bx*.42,ycb-dp*.3,bx*.5,ycb-dp*.18],[-bx*.3,ycb-dp*.17,-bx*.22,ycb-dp*.1],[bx*.05,ycb-dp*.18,bx*.12,ycb-dp*.11]],OL(c2),.45);
      furTex(TP,-bx*.1,yt+dp*.45,bx*1.05,dp*.62,R1,1.1);ao(hx-hr*.35,hy+hr*.95,hr*.85,hr*.5,.3);ao(-bx*.56+u*.2,yt+dp*.66,u*.07,dp*.34,.16);ao(bx*.56+u*.1,ycb-dp*.12,u*.07,dp*.26,.12);
      if(!sil){const hl=ctx.createRadialGradient(-bx*.62,yt+dp*.42,0,-bx*.62,yt+dp*.42,u*.22);hl.addColorStop(0,'rgba(255,255,255,.16)');hl.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=hl;ctx.fillRect(-bx*.62-u*.22,yt+dp*.42-u*.22,u*.44,u*.44)}},0);
    {SV();const EX=new Path2D();EX.rect(-u*4,-u*4,u*8,u*8);for(const q of NLP)EX.addPath(q);ctx.clip(EX,'evenodd');ctx.strokeStyle=OL(c1);ctx.lineWidth=lw;ctx.stroke(TP);RS()}
    if(X.includes('spots')&&!sil){ctx.fillStyle=PALE;ctx.globalAlpha=.85;for(const[px,py,r]of[[-.7,.3,.045],[-.45,.18,.05],[-.18,.16,.045],[.1,.17,.04],[.35,.2,.035],[-.58,.48,.04],[-.3,.38,.045],[-.02,.38,.04],[.24,.4,.035]]){ctx.beginPath();ctx.ellipse(bx*px,yt+dp*py,u*r,u*r*.8,0,0,7);ctx.fill()}ctx.globalAlpha=1}
    // chest ruff
    if(st>=2||S.ears==='pointy'){const A0=[bx*1.02,yt+dp*.42],B0=[bx*.68,ycb+u*.0],n=4,zz=[];for(let i=0;i<=n*2;i++){const q=i/(n*2),px=A0[0]+(B0[0]-A0[0])*q,py=A0[1]+(B0[1]-A0[1])*q,o2=i%2?u*.06:u*.0;zz.push([px+o2*.75,py+o2*.6])}
      ctx.beginPath();ctx.moveTo(A0[0]-u*.08,A0[1]);zz.forEach(q=>ctx.lineTo(q[0],q[1]));ctx.lineTo(B0[0]-u*.08,B0[1]-u*.06);ctx.closePath();ctx.fillStyle=c2;ctx.fill();ctx.beginPath();zz.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.strokeStyle=OL(c2);ctx.lineWidth=lw*.8;ctx.stroke()}
    if(X.includes('shell')){const p=new Path2D();p.moveTo(-bx*1.08,yt+dp*.62);p.bezierCurveTo(-bx*1.1,yt-dp*.5,bx*.9,yt-dp*.55,bx*.9,yt+dp*.5);p.quadraticCurveTo(-bx*.1,yt+dp*.8,-bx*1.08,yt+dp*.62);p.closePath();const shc=DK(c1,.5);
      FS(p,shc,[-bx*.1,yt+dp*.1,bx,dp*.55],()=>{ctx.strokeStyle=K(_dcMix(R2,R1,.4));ctx.globalAlpha=sil?1:.55;ctx.lineWidth=lw*1.1;ctx.beginPath();for(let i=-2;i<=2;i++){const sx=i*bx*.36-bx*.08;ctx.moveTo(sx,yt+dp*.72);ctx.quadraticCurveTo(sx-u*.02,yt,sx+i*u*.03,yt-dp*.5)}ctx.stroke();ctx.globalAlpha=1})}
    if(X.includes('plates'))for(const[px,py]of[[-.4,.2],[.12,.05]])E(bx*px,yt+dp*.5+dp*py,u*.11,u*.065,DK(c1,.45));
    if(X.includes('stripes')&&!sil){SV();ctx.clip(TP);ctx.fillStyle=_dcA(R3,.78);for(const[q,L]of[[-.95,.5],[-.7,.72],[-.45,.82],[-.2,.78],[.06,.68],[.32,.5]]){const sx=bx*q,w=u*.055;ctx.beginPath();ctx.moveTo(sx-w,yt-u*.05);ctx.quadraticCurveTo(sx+w*.7,yt+dp*L*.5,sx+w*.15,yt+dp*L);ctx.quadraticCurveTo(sx+w*.5,yt+dp*L*.45,sx+w,yt-u*.05);ctx.closePath();ctx.fill()}RS()}
    if(X.includes('starspots')){SV();ctx.clip(TP);for(const[q,py,r]of[[-.7,.26,.075],[-.38,.16,.085],[-.05,.2,.07],[.25,.17,.06],[-.55,.52,.055],[-.2,.46,.06]])star5(bx*q,yt+dp*py,u*r,q*3,.35);RS()}
    if(X.includes('scales')){SV();ctx.clip(TP);for(let j=0;j<4;j++)for(let i=0;i<8;i++){const px=-bx*1.08+i*bx*.3+(j%2)*bx*.15,py=yt-u*.01+j*dp*.2;if(py>ycb-dp*.38||px>bx*(1.0-j*.12))continue;plate(px,py,u*.1,u*.095,-.2)}RS()}
    if(X.includes('batwings'))batwing(bx*.25,yt+u*.04,u*(.62+.14*st),false,false,.9);
    // neck/head
    if(X.includes('flamemane')){for(let i=0;i<3;i++)flame(hx-hr*(.75+i*.4),hy+hr*(.15+i*.42),hr*(.9-i*.15),-.7)}
    if(S.ears==='pointy'||st>=2)cheekTuft(hx,hy,hr,sil||_dcMix(R1,R2,.45));
    ears(hx,hy,hr,true);head(hx,hy,hr,ml);ears(hx,hy,hr,false);
    headTop(hx,hy,hr);sparks(0,yt,bx*1.6);flowers([[-bx*.35,yt+u*.01],[bx*.15,yt+u*.0]],u*.1);motes(-u*1.0,u*1.2);
    if(X.includes('steam')&&!sil)REC.push(['st',bx/u,yt/u]);
  }else if(b==='biped'){ // hare: big haunch, flat long hind foot, small forelimb
    const H0=u*(.62+.14*(st-1)),hr=u*[0,.47,.38,.32][st],hx=u*.2,hy=-H0-hr*.55;preHead(hx,hy,hr);
    const BP=new Path2D();BP.moveTo(hx-hr*.55,hy+hr*.15);BP.bezierCurveTo(hx-hr*.8,hy+hr*.8,-u*.12,-H0*.95,-u*.36,-H0*.6);BP.bezierCurveTo(-u*.5,-H0*.38,-u*.46,-u*.1,-u*.22,-u*.07);
    BP.bezierCurveTo(u*.02,-u*.04,u*.2,-H0*.25,u*.25,-H0*.5);BP.bezierCurveTo(u*.3,-H0*.72,hx+hr*.45,hy+hr*.95,hx+hr*.25,hy+hr*.55);BP.closePath();
    const INV=new Path2D();INV.rect(-u*4,-u*4,u*8,u*8);INV.addPath(BP);
    const sw=Math.sin(t*4+ph)*u*.012;
    const foot=(ox,oy,f)=>{const pts=[[-u*.3+ox,-u*.06+oy],[-u*.02+ox,-u*.052+oy],[u*.2+ox,-u*.046+oy]],ws=[u*.13,u*.11,u*.085];FSL(limb(pts,ws),ws,f);E(u*.23+ox,-u*.045+oy,u*.085,u*.045,f);ctx.beginPath();ctx.moveTo(u*.26+ox,-u*.07+oy);ctx.lineTo(u*.27+ox,-u*.02+oy);ctx.strokeStyle=OL(f);ctx.lineWidth=lw*.7;ctx.stroke()};
    const haunch=(ox,oy,f,near)=>{const pts=[[-u*.15+ox,-H0*.55+oy],[-u*.08+ox,-H0*.4+oy],[u*.1+ox+sw,-H0*.27+oy],[-u*.26+ox,-u*.09+oy]],ws=[u*.42,u*.5,u*.26,u*.12],Lm=limb(pts,ws),lb=lbox(Lm);ctx.fillStyle=lg(f,lb[0],lb[1],lb[2],lb[3]);ctx.fill(Lm.p);
      if(!sil){SV();ctx.clip(Lm.p);limbShade(Lm,ws);furTex(Lm.p,-u*.05+ox,-H0*.38+oy,u*.26,u*.24,R1,1.1,2.2);shadeIn(-u*.05+ox,-H0*.38+oy,u*.25,u*.22);rimIn(Lm.p,.6);RS()}ctx.strokeStyle=OL(f);ctx.lineWidth=lw;if(near){SV();ctx.clip(INV,'evenodd');ctx.stroke(Lm.p);RS();if(!sil){SV();ctx.clip(BP);ctx.globalAlpha=.16;ctx.stroke(Lm.p);ao(-u*.05+ox,-H0*.62+oy,u*.3,u*.12,.18);RS()}}else ctx.stroke(Lm.p);
      fur([[u*.0+ox,-H0*.52+oy,-u*.06+ox,-H0*.42+oy],[u*.06+ox,-H0*.42+oy,u*.0+ox,-H0*.33+oy]],OL(f),.35)};
    const WR=X.includes('wraps'),fore=(ox,oy,f)=>{if(WR){const pts=[[u*.12+ox,-H0*.82+oy],[u*.34+ox,-H0*.7+oy],[u*.46+ox-sw,-H0*.86+oy]],ws=[u*.17,u*.12,u*.09];FSL(limb(pts,ws),ws,f);const gc=f===c1?sc:DK(sc,.3),gx=u*.52+ox-sw,gy=-H0*.9+oy;E(gx,gy,u*.15,u*.135,gc);if(!sil){ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=u*.04;ctx.beginPath();ctx.arc(gx,gy,u*.12,2.1,3.4);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.ellipse(gx+u*.02,gy-u*.05,u*.04,u*.022,-.4,0,7);ctx.fill()}return}const pts=[[u*.15+ox,-H0*.8+oy],[u*.09+ox,-H0*.5+oy],[u*.19+ox-sw,-u*.1+oy]],ws=[u*.17,u*.11,u*.07];FSL(limb(pts,ws),ws,f);E(u*.23+ox-sw,-u*.04+oy,u*.07,u*.04,f)};
    const fd=DK(c1,.34);foot(-u*.06,-u*.02,fd);fore(-u*.07,-u*.025,fd);
    tail(-u*.4,-H0*.42,u*(S.tail==='roo'?.78:.55),true);
    FS(BP,c1,[-u*.05,-H0*.55,u*.32,H0*.45],()=>{ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(u*.18,-H0*.5,u*.13,H0*.32,.15,0,7);ctx.fill();fur([[u*.1,-H0*.7,u*.15,-H0*.62],[u*.1,-H0*.5,u*.15,-H0*.42]],OL(c2),.4);
      furTex(BP,-u*.08,-H0*.55,u*.36,H0*.45,R1,1.1);ao(hx-hr*.2,hy+hr*.9,hr*.75,hr*.4,.3)});
    foot(0,0,c1);haunch(0,0,c1,true);fore(0,0,c1);
    if(st>=2)cheekTuft(hx,hy,hr*.85,sil||_dcMix(R1,R2,.45));
    ears(hx,hy,hr,true);head(hx,hy,hr,.95,'#7a3f52');ears(hx,hy,hr,false);
    headTop(hx,hy,hr);
    if(!sil){ctx.beginPath();for(const d of[-.1,.1]){ctx.moveTo(hx+hr*.88,hy+hr*.12);ctx.lineTo(hx+hr*1.35,hy+hr*(.1+d))}ctx.strokeStyle=RIM;ctx.globalAlpha=.6;ctx.lineWidth=lw*.45;ctx.stroke();ctx.globalAlpha=1}
    flowers([[hx-hr*.5,hy-hr*.75],[-u*.25,-H0*.62]],u*.09);if(X.includes('starsparkle'))twinkles([[-u*.42,-H0*.9,u*.05],[u*.45,-H0*1.15,u*.04],[-u*.2,-H0*1.55,u*.035],[u*.42,-H0*.35,u*.035]]);sparks(0,-H0*.5,u*.7);motes(-u*1.0,u*1.1);
  }else if(b==='golem'){
    const lh=u*(.3+.06*st),tw=u*(.55+.05*st),th=u*(.55+.08*st),ty=-lh-th,hs=u*.32;
    const rock=(cx,cy,rx,ry,f,sd,ch)=>{const p=new Path2D(),n=9,pts=[];for(let i=0;i<n;i++){const a=i/n*6.283-1.2,j=1+.07*Math.sin(sd*3.1+i*2.7)+.04*Math.cos(sd*1.7+i*4.1);pts.push([cx+Math.cos(a)*rx*j,cy+Math.sin(a)*ry*j])}
      p.moveTo((pts[0][0]+pts[1][0])/2,(pts[0][1]+pts[1][1])/2);for(let i=1;i<=n;i++){const a=pts[i%n],b2=pts[(i+1)%n];p.quadraticCurveTo(a[0],a[1],(a[0]+b2[0])/2,(a[1]+b2[1])/2)}p.closePath();
      FS(p,f,[cx,cy,rx,ry],()=>{speck(p,cx,cy,rx,ry,HX(f)?f:R1);if(ch&&!sil){ctx.strokeStyle=_dcA(C3D,.35);ctx.lineWidth=lw*.8;ctx.beginPath();ctx.moveTo(cx-rx*.55,cy-ry*.55);ctx.lineTo(cx-rx*.32,cy-ry*.36);ctx.lineTo(cx-rx*.4,cy-ry*.12);ctx.moveTo(cx+rx*.5,cy-ry*.62);ctx.lineTo(cx+rx*.62,cy-ry*.4);ctx.stroke()}});return p};
    for(const[lx,sd]of[[-tw*.29,2],[tw*.31,3]]){rock(lx,-lh*.5-u*.03,tw*.21,lh*.58+u*.03,lx<0?DK(c1,.45):DK(c1,.25),sd);if(!sil){ctx.fillStyle=_dcA(C3D,.25);ctx.beginPath();ctx.ellipse(lx+tw*.02,-u*.02,tw*.2,u*.035,0,0,7);ctx.fill()}}
    rock(-tw*.8,ty+th*.56,tw*.19,th*.44,DK(c1,.3),4);
    const TB=rock(0,ty+th*.5,tw*.7,th*.53,c1,1,true);
    if(!sil){SV();ctx.clip(TB);ao(0,ty-th*.02,tw*.5,th*.22,.3);RS()}
    E(0,ty+th*.64,tw*.36,th*.25,c2);
    if(X.includes('spikes'))for(const sx of[-tw*.55,tw*.5])P([[sx-u*.1,ty+u*.06],[sx,ty-u*.22],[sx+u*.1,ty+u*.06]],sc);
    rock(tw*.78,ty+th*.56,tw*.19,th*.44,c1,5);
    const hx=tw*.1,hy=ty-hs*.5,HB=rock(hx,hy,hs*1.08,hs*.86,c1,6);
    if(!sil){ctx.fillStyle='#7cc25e';for(const[px,py,r]of[[-.7,-.62,.2],[-.4,-.8,.24],[-.05,-.86,.2],[.3,-.78,.16]]){ctx.beginPath();ctx.ellipse(hx+px*hs,hy+py*hs,r*hs,r*hs*.6,0,0,7);ctx.fill()}ctx.fillStyle='#a8e08a';for(const[px,py,r]of[[-.42,-.86,.1],[-.08,-.9,.08]]){ctx.beginPath();ctx.ellipse(hx+px*hs,hy+py*hs,r*hs,r*hs*.5,0,0,7);ctx.fill()}}
    headTop(hx,hy,hs);eye(hx+hs*.42,hy+hs*.02,hs*.27);eye(hx-hs*.2,hy+hs*.0,hs*.23);blush(hx+hs*.62,hy+hs*.36,hs*.2);
    ctx.beginPath();ctx.moveTo(hx+hs*.05,hy+hs*.42);ctx.quadraticCurveTo(hx+hs*.16,hy+hs*.52,hx+hs*.28,hy+hs*.42);ctx.strokeStyle=INK;ctx.lineWidth=Math.max(.7,hs*.05);ctx.stroke();
    if(X.includes('plates'))for(const[px,py]of[[-.3,.2],[.35,.15],[0,.6]])E(px*tw,ty+py*th,u*.1,u*.06,DK(c1,.5));
    motes(-u*1.0,u*1.1);
  }else if(b==='bird'){
    const br=u*(.4+.06*st),lgH=u*(.26+.07*st),by=-lgH-br*.62,hr=u*[0,.37,.31,.28][st],hx=br*.72,hy=by-br*.88;preHead(hx,hy,hr);if(X.includes('stormwings'))stormwing(br*.1,by-br*.6,br*1.35,true);
    const legC=K('#d8973a'),lgW=Math.max(1,u*.045);
    const birdLeg=(lx,far)=>{const s2=Math.sin(t*4+ph+(far?Math.PI:0))*u*.018,kx=lx-u*.04,ky=-lgH*.8,ax=lx-u*.08+s2*.4,ay=-lgH*.42,fx=lx+u*.01+s2,fy=-u*.03,f=far?DK(legC,.3):legC,fc=far?DK(c1,.3):c1,oc=OL(f);
      const pts=[[lx,by+br*.35],[kx,ky]],ws=[br*.42,u*.11];FSL(limb(pts,ws),ws,fc);
      if(!sil){ctx.beginPath();for(let i=0;i<3;i++){const q=kx-u*.05+i*u*.05;ctx.moveTo(q,ky-u*.02);ctx.lineTo(q+u*.01,ky+u*.04)}ctx.strokeStyle=OL(fc);ctx.lineWidth=lw*.7;ctx.stroke()}
      const seg=()=>{ctx.beginPath();ctx.moveTo(kx,ky+u*.02);ctx.lineTo(ax,ay);ctx.lineTo(fx,fy)};seg();ctx.strokeStyle=oc;ctx.lineWidth=lgW+lw*1.4;ctx.stroke();
      const toes=()=>{ctx.beginPath();for(const[tx,ty]of[[u*.17,-u*.003],[u*.115,-u*.02],[u*.08,u*.0],[-u*.08,-u*.006]]){ctx.moveTo(fx,fy);ctx.lineTo(fx+tx,ty)}};toes();ctx.lineWidth=lgW*.7+lw*1.2;ctx.stroke();
      ctx.strokeStyle=f;seg();ctx.lineWidth=lgW;ctx.stroke();toes();ctx.lineWidth=lgW*.7;ctx.stroke();E(ax,ay,lgW*.75,lgW*.75,f,0,false);
      if(!sil){ctx.strokeStyle=oc;ctx.globalAlpha=.55;ctx.lineWidth=lw*.5;ctx.beginPath();for(let i=1;i<5;i++){const q=i/5,px=ax+(fx-ax)*q,py=ay+(fy-ay)*q;ctx.moveTo(px-lgW*.5,py-lgW*.1);ctx.lineTo(px+lgW*.5,py+lgW*.1)}ctx.stroke();ctx.globalAlpha=1;
        ctx.beginPath();for(const[tx,ty]of[[u*.17,-u*.003],[u*.115,-u*.02],[u*.08,u*.0],[-u*.08,-u*.006]]){const ex=fx+tx,ey=ty;ctx.moveTo(ex,ey);ctx.lineTo(ex+(tx>0?u*.025:-u*.02),ey+u*.002)}ctx.strokeStyle=INK;ctx.lineWidth=lw*.8;ctx.stroke()}};
    birdLeg(-br*.12,true);
    if(S.tail==='flame')flame(-br*1.05,by+br*.1,u*.6,-1.1);else if(S.tail==='bolt'){SV();ctx.translate(-br*.9,by+br*.1);ctx.rotate(-.9);P([[0,0],[-u*.4,-u*.15],[-u*.3,-u*.3],[-u*.8,-u*.45],[-u*.5,-u*.15],[-u*.6,-u*.05]],sc);RS()}
    for(let i=0;i<3;i++){SV();ctx.translate(-br*.8,by+br*.05);ctx.rotate(Math.PI+(-.35+i*.32)+Math.sin(t*4+ph+i)*.04);const fl=br*(.75-Math.abs(i-1)*.12),p=new Path2D();p.moveTo(0,-br*.08);p.quadraticCurveTo(fl*.6,-br*.16,fl,0);p.quadraticCurveTo(fl*.6,br*.16,0,br*.08);p.closePath();
      if(!sil)ctx.globalAlpha=.95;FS(p,i===1?c1:DK(c1,.18),null,()=>{ctx.fillStyle=c2;if(!sil)ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(fl*.9,0,fl*.22,br*.14,0,0,7);ctx.fill();ctx.globalAlpha=1;if(!sil){ctx.beginPath();ctx.moveTo(fl*.05,0);ctx.lineTo(fl*.9,0);ctx.strokeStyle=RIM;ctx.globalAlpha=.4;ctx.lineWidth=lw*.5;ctx.stroke();ctx.globalAlpha=1}},.8);ctx.globalAlpha=1;RS()}
    if(X.includes('wings'))wings(-br*.1,by-br*.5,br*(S.beak==='needle'?1.6:1.3),true);
    const BP=new Path2D();BP.moveTo(hx-hr*.45,hy+hr*.3);BP.bezierCurveTo(hx+hr*.2,hy+hr*.9,br*1.02,by-br*.45,br*.98,by-br*.02);BP.bezierCurveTo(br*.95,by+br*.45,br*.55,by+br*.8,br*.05,by+br*.78);
    BP.bezierCurveTo(-br*.4,by+br*.76,-br*.78,by+br*.45,-br*1.02,by+br*.1);BP.bezierCurveTo(-br*.95,by-br*.35,-br*.45,by-br*.72,hx-hr*1.0,hy+hr*.1);BP.closePath();
    FS(BP,c1,[0,by,br,br*.8],()=>{ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(br*.5,by+br*.25,br*.55,br*.6,-.3,0,7);ctx.fill();scal(BP,br*.45,by+br*.3,br*.5,br*.5,R2,.9,.3);furTex(BP,-br*.35,by-br*.1,br*.6,br*.5,R1,.9,2.6);ao(hx-hr*.3,hy+hr*1.0,hr*.8,hr*.45,.25);fur([[br*.4,by-br*.1,br*.5,by-br*.02],[br*.6,by+br*.15,br*.7,by+br*.23],[br*.35,by+br*.35,br*.45,by+br*.43],[br*.65,by+br*.45,br*.72,by+br*.52]],OL(c2),.4)});
    birdLeg(br*.2,false);
    if(X.includes('stormwings'))stormwing(-br*.05,by-br*.45,br*1.3,false);
    else{SV();ctx.translate(br*.3,by-br*.25);ctx.rotate(.12+Math.sin(t*4+ph)*.06);const p=new Path2D(),jt=[[-br*1.15,br*.42],[-br*.85,br*.4],[-br*.55,br*.36],[-br*.25,br*.3],[br*.1,br*.15]];p.moveTo(br*.15,-br*.05);p.bezierCurveTo(-br*.2,-br*.22,-br*.8,-br*.05,-br*1.15,br*.42);
      for(let i=1;i<jt.length;i++){const a=jt[i-1],c=jt[i];p.quadraticCurveTo((a[0]+c[0])/2,(a[1]+c[1])/2+br*.12,c[0],c[1])}p.closePath();
      FS(p,DK(c1,.12),[-br*.4,br*.1,br*.6,br*.3],()=>{ctx.fillStyle=c2;if(!sil)ctx.globalAlpha=.85;ctx.beginPath();ctx.ellipse(-br*.15,br*.02,br*.42,br*.15,.1,0,7);ctx.fill();ctx.globalAlpha=1;if(!sil){ctx.strokeStyle=OL(c1);ctx.globalAlpha=.45;ctx.lineWidth=lw*.6;ctx.beginPath();for(let i=1;i<4;i++){ctx.moveTo(-br*(.05+i*.22),br*.12);ctx.lineTo(jt[i][0],jt[i][1])}ctx.stroke();ctx.globalAlpha=1}},.85);RS()}
    if(X.includes('swirl')&&!sil){ctx.strokeStyle=_dcA(RSC,.8);ctx.lineWidth=Math.max(1,u*.028);const wv=Math.sin(t*4+ph)*br*.05;for(const[sx,sy,Rr,a0]of[[-br*1.3,by-br*.05,br*.26,0],[-br*1.1,by+br*.5,br*.2,1.2],[br*.05,by-br*1.3,br*.18,2.2]]){ctx.beginPath();ctx.arc(sx,sy+wv,Rr,a0,a0+4.3);ctx.stroke();ctx.beginPath();ctx.arc(sx+Rr*.3,sy+wv,Rr*.5,a0+3.3,a0+6.5);ctx.stroke()}}
    if(X.includes('flecks')&&!sil){ctx.strokeStyle=sc;ctx.globalAlpha=.7;ctx.lineWidth=lw*1.1;ctx.beginPath();for(const[px,py]of[[-.55,-.2],[-.3,-.45],[-.02,-.25],[-.72,.15],[-.42,.08],[-.15,.28],[.18,-.42],[-.88,-.12],[-.6,.42],[-.3,.5]]){const fx=br*px,fy=by+br*py,k=br*.06;ctx.moveTo(fx-k,fy-k*.45);ctx.lineTo(fx,fy+k*.2);ctx.lineTo(fx+k,fy-k*.45)}ctx.stroke();ctx.globalAlpha=1}
    E(hx,hy,hr*1.05,hr,c1);GE(hx,hy,hr*1.05,hr);if(!sil){ctx.fillStyle=c2;ctx.globalAlpha=.7;ctx.beginPath();ctx.ellipse(hx+hr*.25,hy+hr*.45,hr*.55,hr*.3,0,0,7);ctx.fill();ctx.globalAlpha=1}
    if(X.includes('gorget')){const gp=new Path2D();gp.moveTo(hx+hr*.82,hy+hr*.28);gp.quadraticCurveTo(hx+hr*.7,hy+hr*1.15,hx+hr*.05,hy+hr*1.05);gp.quadraticCurveTo(hx+hr*.3,hy+hr*.75,hx+hr*.2,hy+hr*.5);gp.quadraticCurveTo(hx+hr*.5,hy+hr*.42,hx+hr*.82,hy+hr*.28);gp.closePath();if(!sil)ctx.globalAlpha=.95;FS(gp,sc,null,()=>{if(!sil){ctx.fillStyle='#ffffff';ctx.globalAlpha=(.22+.18*Math.sin(t*4+ph))*eth;ctx.beginPath();ctx.ellipse(hx+hr*.55,hy+hr*.62,hr*.22,hr*.09,-.6,0,7);ctx.fill();ctx.globalAlpha=1}},.7);ctx.globalAlpha=1}
    headTop(hx,hy,hr);
    if(S.beak==='needle'){const nb=K('#2b2733');ctx.beginPath();ctx.moveTo(hx+hr*.82,hy-hr*.06);ctx.quadraticCurveTo(hx+hr*1.7,hy+hr*.02,hx+hr*2.45,hy+hr*.16);ctx.quadraticCurveTo(hx+hr*1.7,hy+hr*.16,hx+hr*.82,hy+hr*.2);ctx.closePath();ctx.fillStyle=nb;ctx.fill();ctx.strokeStyle=OL(nb);ctx.lineWidth=lw*.7;ctx.stroke();
      if(!sil){ctx.beginPath();ctx.moveTo(hx+hr*.95,hy+hr*.0);ctx.lineTo(hx+hr*2.1,hy+hr*.12);ctx.strokeStyle='#ffffff';ctx.globalAlpha=.35;ctx.lineWidth=lw*.5;ctx.stroke();ctx.globalAlpha=1}}
    else if(S.beak==='hook'){const hb=K('#4a4f5c');ctx.beginPath();ctx.moveTo(hx+hr*.8,hy-hr*.18);ctx.quadraticCurveTo(hx+hr*1.22,hy-hr*.16,hx+hr*1.2,hy+hr*.32);ctx.quadraticCurveTo(hx+hr*1.04,hy+hr*.16,hx+hr*.8,hy+hr*.2);ctx.closePath();ctx.fillStyle=hb;ctx.fill();ctx.strokeStyle=OL(hb);ctx.lineWidth=lw*.8;ctx.stroke();
      if(!sil){ctx.beginPath();ctx.moveTo(hx+hr*.9,hy-hr*.1);ctx.quadraticCurveTo(hx+hr*1.12,hy-hr*.08,hx+hr*1.14,hy+hr*.12);ctx.strokeStyle='#ffffff';ctx.globalAlpha=.35;ctx.lineWidth=lw*.5;ctx.stroke();ctx.globalAlpha=1}}
    else{const bk=K('#f0a63a');ctx.beginPath();ctx.moveTo(hx+hr*.8,hy+hr*.1);ctx.quadraticCurveTo(hx+hr*1.25,hy+hr*.14,hx+hr*1.42,hy+hr*.2);ctx.quadraticCurveTo(hx+hr*1.1,hy+hr*.38,hx+hr*.78,hy+hr*.3);ctx.closePath();ctx.fillStyle=DK(bk,.25);ctx.fill();ctx.strokeStyle=OL(bk);ctx.lineWidth=lw*.8;ctx.stroke();
    ctx.beginPath();ctx.moveTo(hx+hr*.78,hy-hr*.22);ctx.quadraticCurveTo(hx+hr*1.45,hy-hr*.22,hx+hr*1.62,hy+hr*.14);ctx.quadraticCurveTo(hx+hr*1.2,hy+hr*.08,hx+hr*.8,hy+hr*.12);ctx.closePath();ctx.fillStyle=bk;ctx.fill();ctx.stroke();
    if(!sil){ctx.beginPath();ctx.moveTo(hx+hr*.95,hy-hr*.16);ctx.quadraticCurveTo(hx+hr*1.3,hy-hr*.15,hx+hr*1.48,hy+hr*.0);ctx.strokeStyle='#ffffff';ctx.globalAlpha=.4;ctx.lineWidth=lw*.6;ctx.stroke();ctx.globalAlpha=1}}
    eye(hx+hr*.34,hy-hr*.06,hr*(st===1?.36:.3));blush(hx+hr*.5,hy+hr*.4,hr*.22);
    sparks(0,by,br*1.6);motes(by,br*1.8);
  }else if(b==='snake'){
    const n=9,pts=[],ws=[];for(let i=0;i<n;i++){const k=i/(n-1);pts.push([-u*.9+k*u*1.1+Math.sin(t*4+ph+k*4)*u*.05,-u*.18-k*k*u*1.2-Math.sin(k*Math.PI)*u*.1]);ws.push(u*(.32+.36*k))}
    if(X.includes('spikes'))for(let i=2;i<n-1;i+=2){const[p,q]=pts[i],r=ws[i]/2;P([[p-r*.4,q-r*.7],[p-r*.6,q-r*1.5],[p+r*.2,q-r*.85]],sc)}
    P([[pts[0][0],pts[0][1]-u*.02],[-u*1.35,-u*.5],[-u*1.2,-u*.18],[-u*1.35,u*.05]],c2);
    const Lm=limb(pts,ws),slb=lbox(Lm);ctx.fillStyle=lg(c1,slb[0],slb[1],slb[2],slb[3]);ctx.fill(Lm.p);
    SV();ctx.clip(Lm.p);ctx.strokeStyle=c2;for(let i=0;i<n-1;i++){ctx.lineWidth=(ws[i]+ws[i+1])*.42;ctx.beginPath();ctx.moveTo(Lm.A[i][0],Lm.A[i][1]);ctx.lineTo(Lm.A[i+1][0],Lm.A[i+1][1]);ctx.stroke()}
    if(!sil){ctx.strokeStyle=OL(c2);ctx.globalAlpha=.35;ctx.lineWidth=lw*.6;ctx.beginPath();for(let i=1;i<n;i++){const[p,q]=pts[i],[a0,a1]=Lm.A[i];ctx.moveTo(a0,a1);ctx.lineTo(a0+(p-a0)*.42,a1+(q-a1)*.42)}ctx.stroke();ctx.globalAlpha=1;
      ctx.strokeStyle=RIM;ctx.globalAlpha=.3*(eth>1?1.3:1);ctx.lineWidth=u*.07;ctx.beginPath();Lm.B.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();ctx.globalAlpha=1;
      ctx.fillStyle=R3;ctx.globalAlpha=.18;for(let i=1;i<n-1;i++){const[p,q]=pts[i],r=ws[i]/2,[b0,b1]=Lm.B[i];ctx.beginPath();ctx.ellipse(p+(b0-p)*.45,q+(b1-q)*.45,r*.18,r*.12,0,0,7);ctx.fill()}ctx.globalAlpha=1}
    RS();ctx.strokeStyle=OL(c1);ctx.lineWidth=lw;ctx.stroke(Lm.p);
    if(X.includes('starspots')&&!sil){ctx.fillStyle='#fff';for(let i=1;i<n-1;i+=2){const[p,q]=pts[i],r=ws[i]/2,k=r*(.3+.1*Math.sin(t*4+i+ph));ctx.globalAlpha=.85;ctx.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,rr=j%2?k*.3:k;ctx.lineTo(p-r*.1+Math.cos(a)*rr,q-r*.1+Math.sin(a)*rr)}ctx.fill();ctx.globalAlpha=.2;ctx.beginPath();ctx.arc(p-r*.1,q-r*.1,k*1.6,0,7);ctx.fill()}ctx.globalAlpha=1}
    if(X.includes('cloudpuffs'))for(let i=2;i<n-1;i+=2){const[b0,b1]=Lm.B[i],r=ws[i]*.27;for(const[dx,dy,k]of[[-r*.8,r*.15,.8],[r*.75,r*.2,.72],[0,-r*.3,1]])E(b0+dx,b1+dy,r*k,r*k*.9,K('#ffffff'),0,true)}
    const[hx0,hy0]=pts[n-1],hr=u*.38,hx=hx0+u*.1,hy=hy0-u*.15;
    headTop(hx,hy,hr);E(hx,hy,hr*1.15,hr*.85,c1);GE(hx,hy,hr*1.15,hr*.85);E(hx+hr*.75,hy+hr*.35,hr*.55,hr*.25,c2);
    if(!sil){ctx.fillStyle=INK;ctx.beginPath();ctx.ellipse(hx+hr*1.12,hy+hr*.05,hr*.05,hr*.035,.3,0,7);ctx.fill()}
    eye(hx+hr*.33,hy-hr*.14,hr*.3);blush(hx+hr*.55,hy+hr*.25,hr*.2);if(X.includes('tusks'))P([[hx+hr*.9,hy+hr*.4],[hx+hr*1.0,hy+hr*.8],[hx+hr*1.15,hy+hr*.4]],K('#fffbea'));
    motes(-u*.9,u*1.3);
  }else if(b==='fish'){
    const fr=u*.6,fy=-u*.7,wag=Math.sin(t*8+ph)*.3;
    SV();ctx.translate(-fr*.85,fy);ctx.rotate(wag);P([[0,0],[-fr*.8,-fr*.6],[-fr*.6,0],[-fr*.8,fr*.6]],finG(0,0,-fr*.8,0));if(!sil){ctx.strokeStyle=_dcA(R3,.25);ctx.lineWidth=lw*.6;ctx.beginPath();for(const q of[-.5,-.25,0,.25,.5]){ctx.moveTo(-fr*.05,q*fr*.1);ctx.lineTo(-fr*(.72-Math.abs(q)*.1),q*fr*1.05)}ctx.stroke()}RS();
    P([[-fr*.3,fy-fr*.5],[-fr*.05,fy-fr*1.05],[fr*.35,fy-fr*.55]],finG(0,fy-fr*.5,0,fy-fr*1.05));if(!sil){ctx.strokeStyle=_dcA(R3,.22);ctx.lineWidth=lw*.6;ctx.beginPath();for(const q of[.2,.45,.7]){ctx.moveTo(-fr*.3+q*fr*.65,fy-fr*.52);ctx.lineTo(-fr*.22+q*fr*.4,fy-fr*(.62+.3*(1-Math.abs(q-.45))))}ctx.stroke()}
    if(X.includes('spikes'))for(let i=0;i<3;i++)P([[-fr*.5+i*fr*.35,fy-fr*.45],[-fr*.6+i*fr*.35,fy-fr*.85],[-fr*.3+i*fr*.35,fy-fr*.5]],sc);
    E(0,fy,fr,fr*.62,c1);SV();ctx.beginPath();ctx.ellipse(0,fy,fr,fr*.62,0,0,7);ctx.clip();E(fr*.1,fy+fr*.45,fr*.9,fr*.35,c2,0,false);
    if(!sil){ctx.strokeStyle=OL(c1);ctx.globalAlpha=.25;ctx.lineWidth=lw*.6;ctx.beginPath();for(let i=0;i<4;i++)for(let j=0;j<2;j++){const sx=-fr*.55+i*fr*.22,sy=fy-fr*.2+j*fr*.22;ctx.moveTo(sx,sy-fr*.08);ctx.quadraticCurveTo(sx+fr*.09,sy,sx,sy+fr*.08)}ctx.stroke();ctx.globalAlpha=1}RS();GE(0,fy,fr,fr*.62);
    ctx.beginPath();ctx.arc(fr*.25,fy,fr*.38,-1,1);ctx.strokeStyle=OL(c1);ctx.lineWidth=lw*.8;ctx.stroke();
    SV();ctx.translate(fr*.05,fy+fr*.15);ctx.rotate(.6+Math.sin(t*4+ph)*.2);if(!sil)ctx.globalAlpha=.85;E(-fr*.2,0,fr*.28,fr*.12,c2);ctx.globalAlpha=1;RS();
    eye(fr*.56,fy-fr*.1,fr*(st===1?.26:.2));blush(fr*.72,fy+fr*.16,fr*.15);
    ctx.beginPath();ctx.moveTo(fr*.82,fy+fr*.2);ctx.quadraticCurveTo(fr*.9,fy+fr*.3,fr*.98,fy+fr*.18);ctx.strokeStyle=INK;ctx.lineWidth=lw*.7;ctx.stroke();
    if(X.includes('tusks'))for(const d of[0,1])P([[fr*(.78+d*.1),fy+fr*.18],[fr*(.82+d*.1),fy+fr*.36],[fr*(.88+d*.1),fy+fr*.2]],K('#fffbea'));
    motes(fy,fr*1.5);
  }else if(b==='bug'){ // round bee/moth; variants: dragonfly (long glassy wings + segmented abdomen), elytra (domed beetle shell)
    const by=-u*.75,DF=X.includes('dragonfly'),EL=X.includes('elytra');
    if(DF){const dw=(ang,L,far)=>{const f=Math.sin(t*12+ph+(far?1.3:0))*.22;SV();ctx.translate(-u*.02,by-u*.12);ctx.rotate(ang+f);const p=new Path2D();p.moveTo(0,-L*.06);p.bezierCurveTo(-L*.3,-L*.21,-L*.85,-L*.2,-L,-L*.08);p.bezierCurveTo(-L*.9,L*.06,-L*.3,L*.1,0,L*.06);p.closePath();
        if(!sil)ctx.globalAlpha=far?.5:.66;FS(p,far?DK(c2,.2):c2,null,()=>{if(!sil){ctx.strokeStyle=_dcA(R3,.3);ctx.lineWidth=lw*.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-L*.95,-L*.08);for(let i=1;i<6;i++){ctx.moveTo(-L*i*.16,-L*.14);ctx.lineTo(-L*i*.16-L*.04,L*.05)}ctx.stroke();ctx.fillStyle=_dcA(RSC,.7);ctx.beginPath();ctx.ellipse(-L*.88,-L*.1,L*.06,L*.03,0,0,7);ctx.fill()}},.7);ctx.globalAlpha=1;RS()};
      dw(-1.05,u*.95,true);dw(-.6,u*.9,true);
      const ab=[[-u*.08,by+u*.02],[-u*.45,by+u*.07],[-u*.8,by+u*.07],[-u*1.1,by+u*.0]],aw=[u*.17,u*.12,u*.09,u*.06];FSL(limb(ab,aw),aw,c1);
      if(!sil){ctx.strokeStyle=_dcA(R3,.45);ctx.lineWidth=lw*.8;ctx.beginPath();for(let i=1;i<8;i++){const q=i/8,px=-u*.1-q*u*.95,w=u*(.075-.035*q);ctx.moveTo(px,by+u*.06-w);ctx.lineTo(px,by+u*.06+w)}ctx.stroke()}
      E(0,by,u*.2,u*.17,c1);GE(0,by,u*.2,u*.17);
      ctx.beginPath();for(const lx of[-u*.08,u*.04]){ctx.moveTo(lx,by+u*.12);ctx.lineTo(lx+u*.04,by+u*.24);ctx.lineTo(lx+u*.08,by+u*.3)}ctx.strokeStyle=OL(c1);ctx.lineWidth=lw;ctx.stroke();
      dw(-.85,u*1.0,false);dw(-.38,u*.92,false)}
    else{
      wings(EL?-u*.3:-u*.05,by-u*.16,u*(EL?.48+.08*st:.75+.15*st),true,true);
      if(EL){const SH=new Path2D();SH.moveTo(u*.06,by+u*.14);SH.bezierCurveTo(u*.08,by-u*.5,-u*.95,by-u*.54,-u*.92,by+u*.12);SH.quadraticCurveTo(-u*.43,by+u*.3,u*.04,by+u*.14);SH.closePath();
        FS(SH,c1,[-u*.42,by-u*.05,u*.48,u*.32],()=>{if(X.includes('dots'))for(const[px,py,r]of[[-.18,-.12,.075],[-.5,-.16,.085],[-.74,.0,.06],[-.38,.08,.065],[-.06,.07,.05]]){ctx.fillStyle=K(RSC);ctx.beginPath();ctx.ellipse(u*px,by+u*py,u*r,u*r*.9,0,0,7);ctx.fill()}
          if(!sil){ctx.strokeStyle=_dcA(R3,.45);ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(u*.02,by-u*.17);ctx.bezierCurveTo(-u*.25,by-u*.34,-u*.66,by-u*.32,-u*.88,by+u*.06);ctx.stroke();
            ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.ellipse(-u*.38,by-u*.21,u*.2,u*.055,-.12,0,7);ctx.fill();ctx.beginPath();ctx.arc(-u*.12,by-u*.2,u*.025,0,7);ctx.fill()}})}
      else{E(-u*.42,by+u*.08,u*.36,u*.25,c1);for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(-u*(.55-i*.18),by-u*.13);ctx.lineTo(-u*(.55-i*.18),by+u*.3);ctx.strokeStyle=OL(c1);ctx.lineWidth=lw*.7;ctx.stroke()}GE(-u*.42,by+u*.08,u*.36,u*.25)}
      if(!sil&&S.t==='spark'){const g2=.5+.5*Math.sin(t*4+ph);ctx.fillStyle='#fff078';ctx.globalAlpha=g2*.3*eth;ctx.beginPath();ctx.ellipse(-u*.62,by+u*.12,u*.3,u*.27,0,0,7);ctx.fill();ctx.globalAlpha=g2;ctx.beginPath();ctx.ellipse(-u*.62,by+u*.12,u*.18,u*.16,0,0,7);ctx.fill();ctx.globalAlpha=1}
      if(S.tail==='bolt'){SV();ctx.translate(-u*.75,by+u*.1);ctx.rotate(-.3);P([[0,0],[-u*.3,-u*.1],[-u*.22,-u*.2],[-u*.55,-u*.3],[-u*.35,-u*.08],[-u*.42,0]],sc);RS()}
      E(0,by,u*.22,u*.2,EL?DK(c1,.18):c2);GE(0,by,u*.22,u*.2);
      ctx.beginPath();for(const lx of(EL?[-u*.3,-u*.08,u*.06]:[-u*.1,u*.05])){ctx.moveTo(lx,by+u*.15);ctx.lineTo(lx+u*.03,by+u*.27);ctx.lineTo(lx+u*.07,by+u*.38)}ctx.strokeStyle=OL(c1);ctx.lineWidth=lw;ctx.stroke()}
    const hr=u*(st===1?.32:.28)*(EL?.85:1),hx=u*(EL?.26:.3),hy=by-u*(EL?.04:.12);E(hx,hy,hr,hr,EL?DK(c1,.25):c1);GE(hx,hy,hr,hr);headTop(hx,hy,hr);eye(hx+hr*.42,hy+hr*.04,hr*.36);eye(hx-hr*.14,hy+hr*.0,hr*.29);blush(hx+hr*.62,hy+hr*.52,hr*.22);
    if(X.includes('wings')&&st>1)wings(u*.05,by-u*.05,u*.55,true,true);
    sparks(0,by,u*.9);motes(by,u*.9);
  }else if(b==='seal'){ // sea lion: chest raised on fore-flippers, sleek body tapering to rear flippers
    const hr=u*[0,.41,.34,.31][st],bob=Math.sin(t*4+ph)*u*.02,hx=u*(.4+.04*st),hy=-u*(1.4+.06*st)+bob,fd=DK(c1,.34),rw=Math.sin(t*4+ph)*.08;
    const flip=(px,py,a,L,W,f)=>{SV();ctx.translate(px,py);ctx.rotate(a);const p=new Path2D();p.moveTo(0,-W*.42);p.quadraticCurveTo(L*.55,-W*.62,L,-W*.08);p.quadraticCurveTo(L*1.02,W*.42,L*.62,W*.46);p.quadraticCurveTo(L*.25,W*.5,0,W*.42);p.closePath();
      FS(p,f,[L*.5,0,L*.5,W*.45],()=>{if(!sil){ctx.strokeStyle=OL(f);ctx.globalAlpha=.3;ctx.lineWidth=lw*.6;ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(L*.3,(i-1)*W*.12);ctx.lineTo(L*.92,(i-1)*W*.22)}ctx.stroke();ctx.globalAlpha=1}},.9);RS()};
    flip(-u*1.06,-u*.15,Math.PI+.45+rw,u*.33,u*.2,fd);flip(u*.14,-u*.4,1.05,u*.42,u*.17,fd);
    const BP=new Path2D();BP.moveTo(hx-hr*.75,hy+hr*.05);BP.bezierCurveTo(hx-hr*1.3,hy+hr*1.0,-u*.12,-u*1.02,-u*.5,-u*.72);BP.bezierCurveTo(-u*.82,-u*.45,-u*1.0,-u*.24,-u*1.2,-u*.13);
    BP.quadraticCurveTo(-u*1.26,-u*.03,-u*1.08,-u*.02);BP.bezierCurveTo(-u*.7,u*.0,-u*.1,u*.0,u*.25,-u*.06);BP.bezierCurveTo(u*.6,-u*.14,u*.78,-u*.55,u*.7,-u*.85);BP.bezierCurveTo(u*.64,-u*1.05,hx+hr*.55,hy+hr*1.0,hx+hr*.25,hy+hr*.55);BP.closePath();
    FS(BP,c1,[-u*.2,-u*.5,u*.8,u*.42],()=>{ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(u*.48,-u*.55,u*.26,u*.5,-.3,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(-u*.25,u*.0,u*.75,u*.11,0,0,7);ctx.fill();
      if(!sil){ctx.strokeStyle=RIM;ctx.globalAlpha=.2*eth;ctx.lineWidth=lw*2.2;ctx.beginPath();ctx.moveTo(-u*.95,-u*.27);ctx.bezierCurveTo(-u*.6,-u*.6,-u*.2,-u*.88,hx-hr*1.15,hy+hr*.75);ctx.stroke();ctx.globalAlpha=1}});
    if(X.includes('mane')){const mc=sil||_dcMix(R1,R3,.28),p=new Path2D();p.moveTo(hx-hr*.7,hy-hr*.2);p.bezierCurveTo(hx-hr*1.5,hy+hr*.4,hx-hr*1.45,hy+hr*1.6,hx-hr*.6,hy+hr*2.0);p.bezierCurveTo(hx,hy+hr*2.15,hx+hr*.6,hy+hr*1.7,hx+hr*.55,hy+hr*.7);p.closePath();FS(p,mc,[hx-hr*.5,hy+hr*.9,hr*.8,hr*.9],null,.8);
      fur([[hx-hr*1.0,hy+hr*.6,hx-hr*.85,hy+hr*.85],[hx-hr*.9,hy+hr*1.2,hx-hr*.7,hy+hr*1.4],[hx-hr*.3,hy+hr*1.5,hx-hr*.15,hy+hr*1.75],[hx+hr*.1,hy+hr*1.1,hx+hr*.2,hy+hr*1.35]],OL(mc),.4)}
    flip(u*.36,-u*.42,1.18,u*.44,u*.19,c1);flip(-u*1.1,-u*.1,Math.PI-.12-rw,u*.33,u*.2,c1);
    if(st>=2){const bp=new Path2D();bp.ellipse(hx-hr*.2,hy-hr*.6,hr*.55,hr*.36,-.1,0,7);FS(bp,c1,[hx-hr*.2,hy-hr*.6,hr*.5,hr*.3])}
    head(hx,hy,hr,1.02,'#1c1820');E(hx-hr*.45,hy-hr*.26,hr*.11,hr*.065,DK(c1,.35),-.7);
    if(!sil){ctx.beginPath();for(const d of[-.12,0,.12]){ctx.moveTo(hx+hr*.8,hy+hr*.18);ctx.lineTo(hx+hr*1.42,hy+hr*(.14+d))}ctx.strokeStyle=RIM;ctx.globalAlpha=.7;ctx.lineWidth=lw*.45;ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=OL(c2);for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(hx+hr*(.6+i*.09),hy+hr*(.24+i*.02),hr*.025,0,7);ctx.fill()}}
    headTop(hx,hy,hr);motes(-u*1.0,u*1.2);
  }else if(b==='jelly'){ // moon jelly: translucent pulsing bell, four drifting horseshoe rings, frilled oral arms, fine tentacles
    const pl=Math.sin(t*4+ph),rx=u*(.6+.03*st)*(1-pl*.04),ry=u*(.46+.03*st)*(1+pl*.06),by=-u*1.22,my=by+ry*.18,nS=7;
    ctx.strokeStyle=sil||_dcMix(R1,R3,.2);ctx.lineWidth=Math.max(.6,lw*.55);if(!sil)ctx.globalAlpha=.5;ctx.beginPath();const nT=8+st*3;
    for(let i=0;i<nT;i++){const q=i/(nT-1),x0=(-.9+q*1.8)*rx,ln=u*(.48+.25*st)*(.7+.3*Math.abs(Math.sin(i*2.3))),w=Math.sin(t*4+i*.9+ph)*u*.09;ctx.moveTo(x0,my);ctx.bezierCurveTo(x0+w,my+ln*.35,x0-w-u*.06,my+ln*.7,x0-u*.12+w*.5,my+ln)}ctx.stroke();ctx.globalAlpha=1;
    for(let i=0;i<4;i++){const x0=(-.33+i*.22)*rx,ln=u*(.46+.2*st),pts=[],ws=[];for(let j=0;j<5;j++){const q=j/4;pts.push([x0+Math.sin(t*4+ph+i*1.3+q*3)*u*.07*q-q*u*.1,my-ry*.05+q*ln]);ws.push(u*(.13-.022*j))}
      const Lm=limb(pts,ws),f=i%2?DK(c2,.14):c2;if(!sil)ctx.globalAlpha=.6;ctx.fillStyle=f;ctx.fill(Lm.p);
      if(!sil){ctx.strokeStyle=OL(f);ctx.globalAlpha=.35;ctx.lineWidth=lw*.7;ctx.stroke(Lm.p);ctx.strokeStyle=sc;ctx.globalAlpha=.5;ctx.lineWidth=lw*.6;ctx.beginPath();for(let j=1;j<4;j++){const[a0,a1]=Lm.B[j];ctx.moveTo(a0,a1);ctx.lineTo(a0+u*.035,a1+u*.03)}ctx.stroke()}ctx.globalAlpha=1}
    const BL=new Path2D();BL.moveTo(-rx,my);BL.bezierCurveTo(-rx*1.02,by-ry*1.45,rx*1.02,by-ry*1.45,rx,my);for(let i=1;i<=nS;i++){const xa=rx-(i-.5)*2*rx/nS,xb=rx-i*2*rx/nS;BL.quadraticCurveTo(xa,my+ry*.16,xb,my)}BL.closePath();
    if(!sil)ctx.globalAlpha=.68;
    FS(BL,c1,[0,by-ry*.1,rx*.95,ry*.7],()=>{if(!sil)ctx.globalAlpha=.5;ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(0,my,rx*.8,ry*.3,0,0,7);ctx.fill();
      if(!sil){ctx.globalAlpha=.3*eth;ctx.fillStyle=PALE;ctx.beginPath();ctx.ellipse(-rx*.1,by-ry*.45,rx*.55,ry*.4,0,0,7);ctx.fill();
        const rr=u*(.09+.02*st);ctx.lineWidth=u*.028;ctx.strokeStyle=sc;for(let k=0;k<4;k++){const a=k*Math.PI/2+t*1+ph,cx=Math.cos(a)*rx*.4,cy=by-ry*.62+Math.sin(a)*ry*.14,dpt=(Math.sin(a)+1.4)/2.4;ctx.globalAlpha=.5*dpt;ctx.beginPath();ctx.ellipse(cx,cy,rr*(.55+.45*Math.abs(Math.sin(a))),rr*.7,0,.5,Math.PI*2-.5);ctx.stroke()}}ctx.globalAlpha=1});
    ctx.globalAlpha=1;
    if(!sil){ctx.fillStyle=RIM;for(let i=0;i<nS;i++){const xa=rx-(i+.5)*2*rx/nS;ctx.globalAlpha=Math.min(1,(.35+.25*Math.sin(t*4+i+ph))*eth*.8);ctx.beginPath();ctx.arc(xa,my+ry*.09,u*.025,0,7);ctx.fill()}ctx.globalAlpha=1}
    const er=u*(st===1?.11:.09);eye(rx*.42,by-ry*.02,er);eye(rx*.06,by-ry*.04,er*.85);
    ctx.beginPath();ctx.arc(rx*.26,by+ry*.13,er*.55,.25,2.9);ctx.strokeStyle=INK;ctx.lineWidth=lw*.7;ctx.stroke();
    if(st===1&&!sil){ctx.fillStyle='rgba(255,120,160,.3)';ctx.beginPath();ctx.ellipse(rx*.56,by+ry*.14,er*.7,er*.38,0,0,7);ctx.fill()}
    if((S.t==='frost'||S.t==='mind')&&!sil)for(let j=0;j<st;j++){const sx=-rx*(.35-j*.55),sy=by-ry*(.72-j*.12),k=u*.07*(.6+.4*Math.sin(t*4+ph+j*2));ctx.fillStyle='#ffffff';ctx.globalAlpha=.85;ctx.beginPath();ctx.moveTo(sx,sy-k);ctx.lineTo(sx+k*.22,sy-k*.22);ctx.lineTo(sx+k,sy);ctx.lineTo(sx+k*.22,sy+k*.22);ctx.lineTo(sx,sy+k);ctx.lineTo(sx-k*.22,sy+k*.22);ctx.lineTo(sx-k,sy);ctx.lineTo(sx-k*.22,sy-k*.22);ctx.closePath();ctx.fill();ctx.globalAlpha=1}
    headTop(0,by-ry*.25,ry*.9);sparks(0,by,rx*1.3);motes(by,rx*1.4);
  }else if(b==='larva'){ // caterpillar: banded segments with prolegs, raised head, wiggling filaments (flame-tipped for fire)
    const n=5+st,r=u*.2,hr=u*.26,cr=t*4+ph,seg=[];
    for(let i=0;i<n;i++){const q=i/(n-1),hump=Math.max(0,Math.sin(cr-q*5))*u*.06;seg.push([-u*.82+q*u*1.05,-r-hump-(q>.65?(q-.65)*(q-.65)*u*3:0)])}
    const fil=(x0,y0,dir,L)=>{const w=Math.sin(t*4+ph+x0*9/u)*u*.05,ex=x0+dir*L*.35+w,ey=y0-L;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(x0+dir*L*.05,y0-L*.6,ex,ey);ctx.strokeStyle=OL(c3);ctx.lineWidth=lw*2;ctx.stroke();ctx.strokeStyle=c3;ctx.lineWidth=lw*1.1;ctx.stroke();
      if(S.t==='fire')flame(ex,ey+u*.03,u*.15,dir*.3);else E(ex,ey,u*.03,u*.03,c2,0,false)};
    fil(seg[0][0]+u*.02,seg[0][1]-r*.6,-1,u*.26);fil(seg[0][0]+u*.1,seg[0][1]-r*.7,-1,u*.22);
    for(let i=0;i<n;i++){const[sx,sy]=seg[i],rr=r*(i===0?.82:1),p=new Path2D();p.ellipse(sx,sy,rr*1.08,rr,0,0,7);
      if(sy>-r*1.5)E(sx+rr*.15,-u*.035,rr*.24,u*.035,DK(c3,.0));
      FS(p,c1,[sx,sy,rr,rr],()=>{ctx.fillStyle=c3;ctx.fillRect(sx-rr*.45,sy-rr*1.2,rr*.32,rr*2.4);ctx.fillStyle=c2;ctx.fillRect(sx+rr*.16,sy-rr*1.2,rr*.2,rr*2.4)})}
    const[lx,ly]=seg[n-1],hx=lx+u*.17,hy=ly-u*.2;
    fil(hx-hr*.35,hy-hr*.7,1,u*(.3+.06*st));fil(hx-hr*.62,hy-hr*.55,1,u*(.26+.06*st));
    const HP=new Path2D();HP.ellipse(hx,hy,hr,hr*.92,0,0,7);FS(HP,c1,[hx,hy,hr,hr*.9],()=>{ctx.strokeStyle=c3;ctx.lineWidth=hr*.16;ctx.beginPath();ctx.arc(hx-hr*.4,hy+hr*.1,hr*.95,-1.2,1.2);ctx.stroke();ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(hx+hr*.48,hy+hr*.42,hr*.42,hr*.3,0,0,7);ctx.fill()});
    eye(hx+hr*.42,hy-hr*.08,hr*.3);eye(hx-hr*.06,hy-hr*.1,hr*.25);
    ctx.beginPath();ctx.arc(hx+hr*.45,hy+hr*.32,hr*.13,.3,2.8);ctx.strokeStyle=INK;ctx.lineWidth=lw*.7;ctx.stroke();
    blush(hx+hr*.66,hy+hr*.26,hr*.2);
    headTop(hx,hy,hr);sparks(0,-u*.4,u*.9);motes(-u*.6,u*.9);
  }else if(b==='butterfly'){ // raised wings in profile: veined forewing + rounded hindwing, far pair darker, slow flap
    const fl=Math.sin(t*4+ph),W=u*(.66+.04*st),rx0=u*.02,ry0=-u*.9;
    const FW=new Path2D();FW.moveTo(0,0);FW.bezierCurveTo(-W*.12,-W*.65,-W*.5,-W*1.12,-W*.95,-W*1.22);FW.quadraticCurveTo(-W*1.2,-W*1.15,-W*1.1,-W*.85);FW.bezierCurveTo(-W*.95,-W*.45,-W*.5,-W*.12,0,0);FW.closePath();
    const HW=new Path2D();HW.moveTo(0,0);HW.bezierCurveTo(-W*.3,-W*.35,-W*.85,-W*.45,-W*.9,-W*.05);HW.bezierCurveTo(-W*.92,W*.3,-W*.52,W*.48,-W*.25,W*.32);HW.quadraticCurveTo(-W*.08,W*.16,0,0);HW.closePath();
    const FV=[[-.95,-1.2],[-1.1,-1.0],[-1.05,-.8],[-.85,-.55],[-.6,-.3]],HV=[[-.88,-.3],[-.9,.05],[-.7,.35],[-.4,.38]],FD=[[-.98,-1.13],[-1.08,-.98],[-1.06,-.86],[-.82,-1.14],[-.68,-1.05],[-1.0,-.72]],HD=[[-.85,.08],[-.75,.26],[-.6,.36],[-.86,-.12],[-.45,.33]];
    const wing=(path,V,D,far,hind)=>{const f=far?DK(c1,.38):(hind?DK(c1,.08):c1),vc=far?DK(c3,.2):c3,dc=far?DK(c2,.3):c2;SV();ctx.translate(rx0-(far?u*.07:0),ry0);ctx.rotate((far?-.28:0)+fl*.13);ctx.scale(far?.9:1,.84+.16*fl);if(!sil)ctx.globalAlpha=.93;
      FS(path,f,hind?[-W*.5,W*.05,W*.45,W*.35]:[-W*.6,-W*.7,W*.5,W*.5],()=>{ctx.strokeStyle=vc;ctx.lineWidth=W*.17;ctx.stroke(path);ctx.lineWidth=W*.045;ctx.beginPath();for(const[a,b2]of V){ctx.moveTo(0,0);ctx.quadraticCurveTo(a*W*.4,b2*W*.55,a*W,b2*W)}ctx.stroke();
        if(!sil){ctx.fillStyle=dc;for(const[a,b2]of D){ctx.beginPath();ctx.arc(a*W,b2*W,W*.03,0,7);ctx.fill()}
          ctx.strokeStyle=sc;ctx.globalAlpha=Math.min(1,(.25+.2*Math.sin(t*4+ph))*eth*(far?.6:1));ctx.lineWidth=W*.02;ctx.beginPath();for(const[a,b2]of V){ctx.moveTo(0,0);ctx.quadraticCurveTo(a*W*.4,b2*W*.55,a*W*.92,b2*W*.92)}ctx.stroke();ctx.globalAlpha=1}},.8);
      ctx.globalAlpha=1;RS()};
    const bc=sil||_dcMix(R3,R1,.18);
    wing(FW,FV,FD,true,false);wing(HW,HV,HD,true,true);wing(HW,HV,HD,false,true);wing(FW,FV,FD,false,false);
    const ab=[[u*.04,-u*.88],[-u*.2,-u*.78],[-u*.44,-u*.66]],aw=[u*.17,u*.14,u*.05];FSL(limb(ab,aw),aw,bc);
    if(!sil){ctx.fillStyle=c2;ctx.globalAlpha=.8;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-u*(.08+i*.12),-u*(.8-i*.05),u*.018,0,7);ctx.fill()}ctx.globalAlpha=1}
    ctx.beginPath();for(let i=0;i<3;i++){const lx=u*(.13-i*.07);ctx.moveTo(lx,-u*.86);ctx.lineTo(lx+u*.05,-u*.72);ctx.lineTo(lx+u*.03+Math.sin(t*4+i+ph)*u*.01,-u*.62)}ctx.strokeStyle=OL(bc);ctx.lineWidth=lw*.8;ctx.stroke();
    E(u*.11,-u*.9,u*.13,u*.1,bc);GE(u*.11,-u*.9,u*.13,u*.1);
    const hx=u*.28,hy=-u*.97,hr=u*.1;
    for(const d of[0,1]){const ax=hx+u*(.28+d*.1)+Math.sin(t*4+ph+d)*u*.02,ay=hy-u*(.48-d*.06);ctx.beginPath();ctx.moveTo(hx+hr*.2,hy-hr*.6);ctx.quadraticCurveTo(hx+u*.1,hy-u*.4,ax,ay);ctx.strokeStyle=OL(bc);ctx.lineWidth=lw*.9;ctx.stroke();
      if(!sil&&S.t==='fire'){ctx.globalAlpha=.35*eth;E(ax,ay,u*.06,u*.06,sc,0,false);ctx.globalAlpha=1}E(ax,ay,u*.032,u*.022,bc,-.5)}
    E(hx,hy,hr*1.05,hr,bc);GE(hx,hy,hr*1.05,hr);eye(hx+hr*.35,hy-hr*.1,hr*.48);
    headTop(hx,hy,hr);sparks(0,-u*1.2,u*.9);motes(-u*1.2,u*1.0);
  }else if(b==='tortoise'){ // high domed shell with scutes and marginal rim, column legs, neck reaching forward
    const sb=-u*(.3+.02*st),srx=u*(.74+.04*st),sry=u*(.66+.12*st),scx=-u*.14,hr=u*[0,.33,.28,.26][st],bob=Math.sin(t*4+ph)*u*.02,hx=scx+srx+u*.3,hy=sb-u*(.16+.05*st)+bob,fd=DK(c1,.34);
    const leg=(lx,far,o)=>{const w=t*4+ph+o,dx=Math.sin(w)*u*.025,lift=Math.max(0,Math.cos(w))*u*.012,f=far?fd:c1,yo=far?-u*.025:0,pts=[[lx,sb-u*.02],[lx+u*.02+dx*.5,-u*.2+yo],[lx+u*.03+dx,-u*.06+yo-lift]],ws=[u*.27,u*.24,u*.25];FSL(limb(pts,ws),ws,f);
      const fx=lx+u*.05+dx,fy=-u*.05+yo-lift;E(fx,fy,u*.15,u*.055,f);if(!sil){ctx.beginPath();for(let i=0;i<3;i++){const nx=fx+u*(.03+i*.045);ctx.moveTo(nx,fy);ctx.lineTo(nx+u*.02,fy+u*.04)}ctx.strokeStyle=K('#f3ead6');ctx.lineWidth=lw*1.1;ctx.stroke()}};
    leg(scx-srx*.55,true,0);leg(scx+srx*.45,true,Math.PI);
    P([[scx-srx*.92,sb-u*.06],[scx-srx-u*.18,sb+u*.04],[scx-srx*.9,sb+u*.06]],fd);
    const np=[[scx+srx*.62,sb-u*.04],[scx+srx*.95,sb-u*.08],[hx-hr*.45,hy+hr*.3]],nw=[u*.3,u*.25,u*.21];FSL(limb(np,nw),nw,c1);
    if(!sil){ctx.strokeStyle=OL(c1);ctx.globalAlpha=.35;ctx.lineWidth=lw*.6;ctx.beginPath();for(let i=0;i<3;i++){const px=scx+srx*(.84+i*.1);ctx.moveTo(px,sb-u*.2);ctx.quadraticCurveTo(px+u*.04,sb-u*.1,px,sb+u*.0)}ctx.stroke();ctx.globalAlpha=1}
    const SH=new Path2D();SH.moveTo(scx-srx,sb);SH.bezierCurveTo(scx-srx*1.02,sb-sry*1.33,scx+srx*1.02,sb-sry*1.33,scx+srx,sb);SH.quadraticCurveTo(scx,sb+u*.12,scx-srx,sb);SH.closePath();
    FS(SH,sc,[scx,sb-sry*.55,srx*.95,sry*.55],()=>{const hexP=(cx,cy,r)=>{ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.lineTo(cx+Math.cos(a)*r*1.12,cy+Math.sin(a)*r*.82)}ctx.closePath()};
      if(st>=2&&!sil){ctx.strokeStyle=DK(sc,.3);ctx.globalAlpha=.22;ctx.lineWidth=u*.05;ctx.beginPath();for(let i=1;i<4;i++){const yy=sb-sry*i*.24;ctx.moveTo(scx-srx,yy);ctx.bezierCurveTo(scx-srx*.4,yy-u*.04,scx+srx*.3,yy+u*.04,scx+srx,yy-u*.02)}ctx.stroke();ctx.globalAlpha=1}
      const SC=[];for(let k=-1;k<=1;k++)SC.push([scx+k*srx*.44,sb-sry*(.72-.06*Math.abs(k)),srx*.19]);for(let k=-1.5;k<=1.5;k++)SC.push([scx+k*srx*.47,sb-sry*.3,srx*.17]);
      for(const[cx,cy,r]of SC){hexP(cx,cy,r);ctx.fillStyle=sil||_dcMix(RSC,R2,.35);ctx.fill();ctx.strokeStyle=OL(sc);ctx.lineWidth=lw*1.2;ctx.stroke();
        if(!sil){hexP(cx,cy,r*.6);ctx.strokeStyle=DK(sc,.35);ctx.globalAlpha=.35;ctx.lineWidth=lw*.7;ctx.stroke();ctx.fillStyle=PALE;ctx.globalAlpha=Math.min(1,(st>=2?.25+.12*Math.sin(t*4+cx*7/u):.18)*eth);ctx.beginPath();ctx.ellipse(cx,cy,r*.32,r*.22,0,0,7);ctx.fill();ctx.globalAlpha=1}}
      ctx.strokeStyle=sil||DK(sc,.32);ctx.lineWidth=u*.13;ctx.beginPath();ctx.moveTo(scx-srx*1.05,sb-u*.03);ctx.quadraticCurveTo(scx,sb+u*.1,scx+srx*1.05,sb-u*.03);ctx.stroke();
      if(!sil){ctx.strokeStyle=OL(sc);ctx.globalAlpha=.5;ctx.lineWidth=lw*.7;ctx.beginPath();for(let i=-4;i<=4;i++){const px=scx+i*srx*.22,py=sb+u*.035-Math.abs(i)*u*.008;ctx.moveTo(px,py-u*.07);ctx.lineTo(px+u*.01,py+u*.05)}ctx.stroke();ctx.globalAlpha=1}});
    leg(scx-srx*.45,false,Math.PI);leg(scx+srx*.55,false,0);
    head(hx,hy,hr,.8,'#2a1f1a');headTop(hx,hy,hr);sparks(0,sb-sry*.5,srx*1.4);motes(-u*.8,u*1.2);
  }else if(b==='ghost'){ // sheet-ghost puff: round dome tapering to a wavy hem that curls into a wisp, tiny nub arms
    const r=u*.52,by=-u*.98,sw=Math.sin(t*4+ph)*u*.035;
    if(!sil){const g=ctx.createRadialGradient(0,by+r*.2,r*.3,0,by+r*.2,r*1.6);g.addColorStop(0,_dcA(RSC,.3));g.addColorStop(1,_dcA(RSC,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,by+r*.2,r*1.6,0,7);ctx.fill()}
    E(-r*.9,by+r*.38,r*.2,r*.13,DK(c1,.3),-.6);
    const GP=new Path2D();GP.moveTo(-r,by);GP.arc(0,by,r,Math.PI,0);GP.bezierCurveTo(r*1.02,by+r*.45,r*.95+sw,by+r*.8,r*.85+sw,by+r*1.05);
    const hem=[[r*.85,1.05],[r*.42,.95],[0,1.08],[-r*.42,.95],[-r*.8,1.02]];
    for(let i=1;i<hem.length;i++){const a2=hem[i-1],c=hem[i],k1=1-i/hem.length,mx=(a2[0]+c[0])/2+sw*k1,my=by+r*(i%2?1.24:1.16);GP.quadraticCurveTo(mx,my,c[0]+sw*k1*.8,by+r*c[1])}
    GP.bezierCurveTo(-r*1.05,by+r*1.12,-r*1.45-sw,by+r*1.0,-r*1.42-sw,by+r*.64);GP.bezierCurveTo(-r*1.3,by+r*.78,-r*1.08,by+r*.62,-r,by+r*.2);GP.closePath();
    if(!sil)ctx.globalAlpha=.95;FS(GP,c1,[0,by+r*.1,r,r*1.05],()=>{ctx.fillStyle=c2;if(!sil)ctx.globalAlpha=.65;ctx.beginPath();ctx.ellipse(r*.3,by+r*.12,r*.55,r*.5,0,0,7);ctx.fill();ctx.globalAlpha=1;
      if(!sil){const g=ctx.createLinearGradient(0,by+r*.35,0,by+r*1.25);g.addColorStop(0,_dcA(RSC,0));g.addColorStop(1,_dcA(RSC,.6));ctx.fillStyle=g;ctx.fillRect(-r*1.6,by+r*.35,r*3.2,r*.95)}});ctx.globalAlpha=1;
    E(r*.9,by+r*.42,r*.2,r*.13,c1,.6);
    eye(r*.42,by-r*.02,r*.3);eye(-r*.1,by-r*.04,r*.26);blush(r*.66,by+r*.28,r*.17);blush(-r*.36,by+r*.26,r*.14);
    ctx.beginPath();ctx.ellipse(r*.18,by+r*.3,r*.065,r*.085,0,0,7);ctx.fillStyle=K('#4a2a55');ctx.fill();if(!sil){ctx.fillStyle='#ff8fb0';ctx.beginPath();ctx.ellipse(r*.18,by+r*.35,r*.04,r*.025,0,0,7);ctx.fill()}
    headTop(r*.1,by,r*.9);motes(by,r*1.5);
  }else if(b==='moth'){ // fluffy moon moth (Mid-Autumn): front-facing furry body with a full-moon mark, feathery antennae, rounded wings (S.wc) with moon eyespots
    const r=u*(st===1?.46:st===2?.4:.37),by=-u*.95,fl=Math.sin(t*4+ph),W=u*(st===1?.56:st===2?.78:.98),WC=HX(S.wc)?S.wc:R2,wc=K(WC),mc=K('#fff3c4');
    const moon=(mx,my,mr,glow)=>{if(!sil&&glow>0){const g=ctx.createRadialGradient(mx,my,mr*.4,mx,my,mr*2.4);g.addColorStop(0,_dcA('#fff2b0',glow));g.addColorStop(1,'rgba(255,240,170,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(mx,my,mr*2.4,0,7);ctx.fill()}
      E(mx,my,mr,mr,mc,0,false);if(!sil){ctx.fillStyle=_dcA('#d9b866',.35);for(const[a,b2,k]of[[-.3,-.2,.22],[.28,.12,.17],[-.05,.38,.13]]){ctx.beginPath();ctx.arc(mx+a*mr,my+b2*mr,mr*k,0,7);ctx.fill()}
        ctx.strokeStyle=_dcA(RSC,.8);ctx.lineWidth=Math.max(.6,mr*.12);ctx.beginPath();ctx.arc(mx,my,mr,0,7);ctx.stroke()}};
    // wings behind the body, mirrored left and right; the forewing reaches up and out, the hindwing rounds off below
    const wing=(d,hind)=>{const L=W*(hind?.7:1),Hh=W*(hind?.6:.74);SV();ctx.translate(d*r*.3,by+(hind?r*.32:-r*.2));ctx.scale(d*(.88+.12*fl),1);ctx.rotate(hind?.42:-.3);
      const p=new Path2D(),tl=hind&&st===3;p.moveTo(0,0);p.bezierCurveTo(L*.18,-Hh*.95,L*.82,-Hh*1.12,L*1.02,-Hh*.5);
      if(tl){const tw=Math.sin(t*4+ph+d)*L*.06;p.bezierCurveTo(L*1.08,-Hh*.1,L*.95,Hh*.2,L*.82,Hh*.42);p.bezierCurveTo(L*.75,Hh*.9,L*.62+tw,Hh*1.45,L*.48+tw,Hh*1.62);p.bezierCurveTo(L*.4+tw,Hh*1.45,L*.42,Hh*.8,L*.34,Hh*.42);p.quadraticCurveTo(L*.12,Hh*.26,0,0)}
      else{p.bezierCurveTo(L*1.12,-Hh*.05,L*.78,Hh*.36,L*.4,Hh*.32);p.quadraticCurveTo(L*.12,Hh*.24,0,0)}p.closePath();
      const f=hind?DK(wc,.14):wc;if(!sil)ctx.globalAlpha=.97;
      FS(p,f,[L*.52,-Hh*.3,L*.52,Hh*.62],()=>{if(sil)return;
        if(st===2){const g=ctx.createRadialGradient(L*.5,-Hh*.25,0,L*.5,-Hh*.25,L*.75);g.addColorStop(0,'rgba(255,236,160,.75)');g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.fillRect(-L,-Hh*2,L*3,Hh*3)}
        ctx.strokeStyle=_dcA(_dcMix(f,R3,.45),.45);ctx.lineWidth=W*.07;ctx.stroke(p);
        ctx.strokeStyle=_dcA(_dcMix(f,R3,.4),st===2?.5:.32);ctx.lineWidth=Math.max(.5,lw*.7);ctx.beginPath();
        for(const[a,b2]of hind?[[.9,.05],[.75,.28],[.5,.32]]:[[.95,-.62],[1.0,-.3],[.8,.1],[.5,.24]]){ctx.moveTo(L*.05,0);ctx.quadraticCurveTo(L*a*.45,Hh*b2*.2,L*a,Hh*b2)}ctx.stroke();
        if(st===3&&!hind){ctx.fillStyle='rgba(255,236,170,.75)';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(L*(.25+i*.16),-Hh*(.72-Math.abs(i-2)*.08),W*.022,0,7);ctx.fill()}}
        ctx.fillStyle=RIM;ctx.globalAlpha=.25*eth;ctx.beginPath();ctx.ellipse(L*.6,-Hh*.62,L*.22,Hh*.12,-.3,0,7);ctx.fill();ctx.globalAlpha=1},.8);
      ctx.globalAlpha=1;
      if(st>=2&&!hind)moon(L*.6,-Hh*.32,W*(st===2?.1:.13),.45);
      if(st===3&&hind){SV();ctx.translate(L*.66,Hh*.5);ctx.rotate(.9);const cr=W*.08;ctx.beginPath();ctx.arc(0,0,cr,Math.PI*.35,Math.PI*1.65);ctx.arc(cr*.42,0,cr*.82,Math.PI*1.55,Math.PI*.45,true);ctx.closePath();ctx.fillStyle=mc;ctx.fill();RS()}
      RS()};
    wing(-1,true);wing(1,true);wing(-1,false);wing(1,false);
    // feathery antennae: a curved stem with a plume of fine barbs
    for(const d of[-1,1]){const sw2=Math.sin(t*4+ph+d)*r*.05,x0=d*r*.22,y0=by-r*.8,tx=d*r*(.85+.18*st)+sw2,ty=by-r*(1.75+.12*st),cx=d*r*.3,cy=by-r*1.6,
        qp=q=>[(1-q)*(1-q)*x0+2*(1-q)*q*cx+q*q*tx,(1-q)*(1-q)*y0+2*(1-q)*q*cy+q*q*ty],ac=K(_dcMix(RSC,R3,.25));
      ctx.beginPath();for(let i=2;i<=11;i++){const q=i/12,[px,py]=qp(q),[qx,qy]=qp(q-.02),ang=Math.atan2(py-qy,px-qx),L2=r*(.34*Math.sin(q*Math.PI)+.05);
        for(const sd of[-1,1]){const a2=ang+sd*1.15;ctx.moveTo(px,py);ctx.lineTo(px+Math.cos(a2)*L2,py+Math.sin(a2)*L2)}}
      ctx.strokeStyle=sil||_dcA(RSC,.95);ctx.lineWidth=Math.max(.6,r*.045);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo(cx,cy,tx,ty);ctx.strokeStyle=OL(ac);ctx.lineWidth=Math.max(1,r*.09);ctx.stroke();ctx.strokeStyle=ac;ctx.lineWidth=Math.max(.7,r*.055);ctx.stroke()}
    // little dangling feet
    for(const d of[-1,1])E(d*r*.28,by+r*.98,r*.15,r*.11,DK(c1,.22));
    // the fluffy body: a scalloped round outline, a white chest ruff and fur texture
    const BP=new Path2D(),N=20;for(let i=0;i<=N;i++){const a=-Math.PI/2+i*Math.PI*2/N,am=a-Math.PI/N,rr=1+(i%2?.02:0);const px=Math.cos(a)*r*rr,py=by+Math.sin(a)*r*1.04*rr,qx=Math.cos(am)*r*1.13,qy=by+Math.sin(am)*r*1.16;i?BP.quadraticCurveTo(qx,qy,px,py):BP.moveTo(px,py)}BP.closePath();
    FS(BP,c1,[0,by,r,r],()=>{ctx.fillStyle=c2;const RP=new Path2D(),M=9;RP.moveTo(-r*.95,by+r*.08);for(let i=1;i<=M;i++){const x1=-r*.95+i*r*1.9/M,xm=x1-r*.95/M;RP.quadraticCurveTo(xm,by+r*(.32+.06*Math.cos(i)),x1,by+r*.08+Math.abs(x1)*r*.0)}RP.lineTo(r*1.2,by+r*1.3);RP.lineTo(-r*1.2,by+r*1.3);RP.closePath();
      if(!sil)ctx.globalAlpha=.9;ctx.fill(RP);ctx.globalAlpha=1;furTex(BP,0,by-r*.1,r*.9,r*.9,R1,1.4,2.0);furTex(RP,0,by+r*.6,r*.9,r*.45,R2,1.2,1.4)});
    if(st>=3)for(let i=0;i<7;i++){const q=i/6-.5,px=q*r*1.4,py=by+r*(.64+q*q*.4)-(i%2)*r*.05,pr=r*(.27-q*q*.16);E(px,py,pr,pr*.9,c2,0,false);GE(px,py,pr,pr*.9)}
    moon(0,by-r*.6,r*(st===1?.15:.18),st===1?.35:.55);
    const er=r*(st===1?.27:st===2?.23:.21);eye(r*.33,by-r*.08,er);eye(-r*.33,by-r*.08,er);blush(r*.56,by+r*.2,r*.16);blush(-r*.56,by+r*.2,r*.16);
    ctx.beginPath();ctx.moveTo(-r*.09,by+r*.2);ctx.quadraticCurveTo(-r*.045,by+r*.29,0,by+r*.21);ctx.quadraticCurveTo(r*.045,by+r*.29,r*.09,by+r*.2);ctx.strokeStyle=INK;ctx.lineWidth=Math.max(.7,r*.04);ctx.stroke();
    motes(by,r*1.6);
  }else{ // blob
    const r=u*.55,by=-r*.95,BAT=S.ears==='bat';
    if(X.includes('batwings'))batwing(-r*.2,by-r*.1,r*1.3,true,true);
    if(BAT){ears(r*.18,by-r*.22,r*.95,true);ears(r*.18,by-r*.22,r*.95,false)}
    for(const d of[-1,1])E(d*r*.4,-u*.05,r*.25,r*.12,DK(c1,.4));
    E(0,by,r,r*.9,c1);SV();ctx.beginPath();ctx.ellipse(0,by,r,r*.9,0,0,7);ctx.clip();E(0,by+r*.45,r*.65,r*.42,c2,0,false);RS();
    if(BAT){const bp=new Path2D();bp.ellipse(0,by,r,r*.9,0,0,7);furTex(bp,0,by,r*.9,r*.8,R1,1.3,2.2)}GE(0,by,r,r*.9);
    if(X.includes('plates'))for(const[px,py]of[[-.5,-.35],[.4,-.55],[.55,.15]])E(px*r,by+py*r,r*.18,r*.12,DK(c1,.45));
    headTop(0,by-r*.1,r*.9);if(!sil){ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(-r*.42,by-r*.52,r*.2,r*.11,-.6,0,7);ctx.fill();ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(-r*.2,by-r*.66,r*.05,0,7);ctx.fill();ctx.globalAlpha=1}eye(r*.42,by-r*.08,r*.27);eye(-r*.16,by-r*.1,r*.23);blush(r*.66,by+r*.18,r*.17);blush(-r*.42,by+r*.16,r*.15);
    ctx.beginPath();ctx.moveTo(r*.03,by+r*.16);ctx.quadraticCurveTo(r*.14,by+r*.36,r*.27,by+r*.16);ctx.closePath();ctx.fillStyle=K('#7e2a40');ctx.fill();if(!sil){ctx.fillStyle='#ff8fa8';ctx.beginPath();ctx.ellipse(r*.15,by+r*.25,r*.06,r*.035,0,0,7);ctx.fill()}ctx.strokeStyle=INK;ctx.lineWidth=Math.max(.7,r*.035);ctx.beginPath();ctx.moveTo(r*.03,by+r*.16);ctx.quadraticCurveTo(r*.14,by+r*.36,r*.27,by+r*.16);ctx.closePath();ctx.stroke();
    if(BAT&&!sil)P([[r*.1,by+r*.165],[r*.135,by+r*.27],[r*.17,by+r*.165]],'#ffffff',false);
    if(X.includes('batwings'))batwing(-r*.5,by+r*.02,r*1.25,false,true);
    if(X.includes('bubbles')&&!sil)REC.push(['b',r/u,by/u]);
    motes(by,r*1.4);
  }
  RS();
  }catch(e){if(typeof window!=='undefined'&&window.__dcErr)window.__dcErr(e)}finally{while(dep>0){ctx.restore();dep--}}
}


// Capture orb. kind: 'orb' (teal, gold star) | 'great' (violet, silver star + orbit ring) | 'ultra' (black-blue, gold star + sparkle ring)
function drawOrb(ctx,x,y,r,spin=0,glow=0,kind='orb'){
  const K={orb:{g:['#c9fff4','#2ec4b6','#0e5e6b'],o:'#0a3b44',sf:'#ffd23f',ss:'#a87700',h:'#ffe48a'},
    great:{g:['#f1e8ff','#8a6cf0','#2b1d78'],o:'#170f4a',sf:'#eef2fa',ss:'#6f7894',h:'#cdb8ff'},
    ultra:{g:['#5e6fa6','#18214d','#04060e'],o:'#000005',sf:'#ffd23f',ss:'#8a5a00',h:'#ffd86a'}}[kind]||null;
  const D=K||{g:['#c9fff4','#2ec4b6','#0e5e6b'],o:'#0a3b44',sf:'#ffd23f',ss:'#a87700',h:'#ffe48a'};kind=K?kind:'orb';
  const circ=(cx,cy,rr,f)=>{ctx.beginPath();ctx.arc(cx,cy,Math.max(.1,rr),0,7);ctx.fillStyle=f;ctx.fill()};
  const star=(n,R,ri,rot)=>{ctx.beginPath();for(let i=0;i<n*2;i++){const a=rot-Math.PI/2+i*Math.PI/n,rr=i%2?ri:R;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath()};
  ctx.save();ctx.translate(x,y);
  if(glow>0){ctx.globalAlpha=.5*glow;circ(0,0,r*1.7,D.h);ctx.globalAlpha=1}
  const ring=(back)=>{ctx.beginPath();ctx.ellipse(0,0,r*1.32,r*.36,-.35,back?Math.PI:0,back?Math.PI*2:Math.PI);ctx.strokeStyle='#5d6480';ctx.lineWidth=Math.max(2,r*.13);ctx.stroke();ctx.strokeStyle='#e9edf7';ctx.lineWidth=Math.max(1,r*.07);ctx.stroke();
    const a=spin*.5,mx=Math.cos(a)*r*1.32,my=Math.sin(a)*r*.36,c=Math.cos(-.35),s=Math.sin(-.35);if((Math.sin(a)<0)===back){circ(mx*c-my*s,mx*s+my*c,r*.13,'#ffffff')}};
  if(kind==='great')ring(true);
  const g=ctx.createRadialGradient(-r*.35,-r*.4,r*.1,0,0,r);g.addColorStop(0,D.g[0]);g.addColorStop(.45,D.g[1]);g.addColorStop(1,D.g[2]);
  ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fillStyle=g;ctx.fill();ctx.lineWidth=Math.max(2,r*.08);ctx.strokeStyle=D.o;ctx.stroke();
  if(kind==='ultra'){ctx.beginPath();ctx.arc(0,0,r*.86,0,7);ctx.strokeStyle='#d9b23a';ctx.globalAlpha=.75;ctx.lineWidth=Math.max(1,r*.035);ctx.stroke();ctx.globalAlpha=1}
  ctx.rotate(spin);star(5,r*.5,r*.22,0);ctx.fillStyle=D.sf;ctx.fill();ctx.strokeStyle=D.ss;ctx.lineWidth=Math.max(1,r*.05);ctx.stroke();
  if(kind!=='orb'){circ(0,0,r*.09,kind==='ultra'?'#fff6c8':'#ffffff')}
  ctx.rotate(-spin);
  ctx.beginPath();ctx.ellipse(-r*.38,-r*.45,r*.22,r*.13,0,0,7);ctx.fillStyle='rgba(255,255,255,.75)';ctx.fill();
  if(kind==='great')ring(false);
  if(kind==='ultra'){ctx.fillStyle='#ffd23f';for(let i=0;i<8;i++){const a=spin*.3+i*Math.PI/4,px=Math.cos(a)*r*1.24,py=Math.sin(a)*r*1.24,k=r*(i%2?.07:.12);ctx.save();ctx.translate(px,py);ctx.globalAlpha=.65+.35*Math.sin(spin*2+i*1.3);star(4,k,k*.32,0);ctx.fill();ctx.restore()}ctx.globalAlpha=1}
  ctx.restore()}
