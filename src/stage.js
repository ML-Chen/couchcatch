// ---------- Staged conversations: a small scene instead of a chat log ----------
// A conversation listed in STAGE_TALKS plays as a scene: the place's painted background (with its ambient motion) fills the
// screen, the visitor stands in it full-body (breathing, blinking, mouth moving while her line plays, a face and a gesture per
// line), the child's lead creature stands beside her and reacts, and one speech bubble at a time sits next to whoever speaks.
// The child's answers are big picture buttons along the bottom; she says the line aloud, hears it, and taps "I said it".
// Every other conversation still uses runTalk in speak.js unchanged.
// Optional cues on any line object (npc, reply, end), all backward compatible; untagged lines get defaults from their words:
//   face:'happy'|'neutral'|'surprised'|'worried'  act:'wave'|'ask'|'offer'|'chest'|'cheer'|'point'|'talk'|'idle'
//   item:'apple'|'milk'|'orb'|'berry' (+ n) pops up and drops into her basket   fx:'sparkle'|'hearts'|'shake'
//   pet:'hop'|'munch'|'hide' (the creature's reaction)   star:true (Little Star floats in; also when the line says 小星)
// On the child's options: pic:'apple'|'apple3'|'milk'|'coin'|'heart'|'no'|'wave' (a small picture), react: the visitor's
// face while she listens. On end: the reward flies into the child's bag as it is said.
(function(){
window.STAGE_TALKS=window.STAGE_TALKS||{visit_shopping:'auntie_wang'};
// the cast: original characters drawn full-body
const CAST={auntie_wang:{skin:'#f1c9a5',skin2:'#d99f7a',hair:'#2b2220',hair2:'#4a3a35',shirt:'#4f9a7c',shirt2:'#2f6f58',dots:'#e9f6ee',apron:'#f6ecd8',apron2:'#dccbad',
  pants:'#3c4870',shoes:'#2a2324',clip:'#e8607a',basket:true}};
const css=`.stagetalk{padding:0!important;overflow:hidden!important;background:#20263f!important;user-select:none;-webkit-user-select:none}
.stagetalk::before{display:none!important}
.stagetalk .stcv{position:absolute;inset:0;width:100%;height:100%;display:block}
.sbub{position:absolute;left:0;top:0;box-sizing:border-box;padding:9px 14px 9px;border-radius:20px;cursor:pointer;z-index:2;
  background:linear-gradient(180deg,rgba(255,255,255,.97),rgba(246,248,255,.93));color:#141b33;border:1px solid #fff;
  box-shadow:inset 0 -10px 18px -14px rgba(96,116,230,.45),0 2px 3px rgba(20,30,70,.18),0 12px 26px -12px rgba(20,30,80,.55);
  animation:sbubIn .32s cubic-bezier(.3,.8,.4,1.25) both;transition:opacity .28s ease,translate .28s ease}
.sbub.you{background:linear-gradient(165deg,#3a72f0,#2552d6 60%,#4141c9);color:#fff;border-color:rgba(255,255,255,.55);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 2px 3px rgba(20,30,70,.2),0 12px 26px -12px rgba(20,30,120,.7)}
.sbub.out{opacity:0;translate:0 -8px;pointer-events:none}
@keyframes sbubIn{0%{opacity:0;transform:scale(.82) translateY(8px)}100%{opacity:1;transform:none}}
.sbub::after{content:'';position:absolute;left:var(--tx,40px);width:18px;height:14px;background:inherit;border:inherit;border-top:0;border-left:0;
  bottom:-8px;transform:translateX(-50%) rotate(45deg);border-radius:0 0 5px 0;background:#f6f8ff}
.sbub.you::after{background:#2c58da}
.sbub.below::after{bottom:auto;top:-8px;transform:translateX(-50%) rotate(225deg)}
.sbub .nm{position:absolute;top:-11px;left:12px;padding:1px 9px;border-radius:99px;background:linear-gradient(180deg,#ffd789,#f2b44c);color:#5a3500;
  font-family:'Noto Sans SC',var(--display),sans-serif;font-weight:700;font-size:.72rem;white-space:nowrap;box-shadow:0 1px 2px rgba(80,40,0,.3)}
.sbub .nm i{font-style:normal;font-family:var(--body);font-weight:700;opacity:.8;margin-left:4px;font-size:.92em}
.sbub .z{font-family:'Noto Sans SC',sans-serif;font-size:1.42rem;font-weight:700;line-height:1.25;letter-spacing:.01em}
.sbub .p{font-size:.9rem;font-weight:600;opacity:.85;line-height:1.2;margin-top:1px}
.sbub .e{font-size:.74rem;opacity:.66;margin-top:2px;line-height:1.2}
.sbub.you .p,.sbub.you .e{opacity:.92}
.lvl-2 .sbub .e,.lvl-3 .sbub .e,.lvl-2 .sopt .e,.lvl-3 .sopt .e{display:none}.lvl-3 .sbub .p,.lvl-3 .sopt .p{display:none}
.lvl-2 .sbub.show .e,.lvl-3 .sbub.show .e,.lvl-3 .sbub.show .p{display:block}
.stpanel{position:absolute;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:3;box-sizing:border-box;padding:10px;border-radius:26px;
  display:flex;flex-direction:column;gap:8px;background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(240,244,255,.74));border:1px solid rgba(255,255,255,.95);
  box-shadow:inset 0 1px 0 #fff,inset 0 -16px 24px -18px rgba(96,116,230,.5),0 18px 40px -14px rgba(10,16,50,.6);
  transform:translateY(calc(100% + 24px));transition:transform .38s cubic-bezier(.3,.8,.35,1.08)}
.stpanel.up{transform:none}
.scue{display:flex;align-items:center;gap:8px;min-height:38px;padding:0 2px 0 6px}
.scue .c{flex:1;min-width:0;font-family:var(--display);font-weight:600;font-size:.92rem;line-height:1.2;color:#141b33}
.scue:empty{display:none}
.scue .ce{font-size:.86rem;font-weight:600;color:#434b66}.scue .ce b{color:#141b33;font-weight:700}
.scue .cz{font-family:'Noto Sans SC',sans-serif;font-size:.9rem;font-weight:600;cursor:pointer;margin-top:1px}.scue .cz i{font-style:normal;font-family:var(--body);font-size:.85em;opacity:.75;margin-left:5px}
.scue .ear+.c .cz{font-size:1.05rem}
.scue .ear{font-size:1.5rem;line-height:1}
.stagetalk .ring{width:36px;height:36px;font-size:.78rem}.stagetalk .ring::after{inset:4px;background:#f3f5ff}.stagetalk .ring span{color:#1d48bb}
.scue .mic{flex:none;width:40px;height:40px;padding:0!important;font-size:1.1rem}
.scue .mic.on{animation:micpulse 1s ease-in-out infinite}
.sopts{display:flex;flex-direction:column;gap:8px}
.stagetalk .sopt{display:grid!important;grid-template-columns:52px 1fr;align-items:center;gap:8px;text-align:left;min-height:62px;padding:5px 14px 5px 6px!important;border-radius:24px!important;
  animation:soptIn .34s cubic-bezier(.3,.8,.4,1.2) both}
.stagetalk .sopt.nopic{grid-template-columns:1fr;padding-left:16px!important}
.stagetalk .sopt:nth-child(2){animation-delay:.07s}.stagetalk .sopt:nth-child(3){animation-delay:.14s}
@keyframes soptIn{0%{opacity:0;transform:translateY(14px) scale(.96)}100%{opacity:1;transform:none}}
.sopt canvas{width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fffdf6,#f3e9d6 70%,#e6d7bb);box-shadow:inset 0 -3px 6px rgba(150,110,60,.18),0 1px 2px rgba(60,40,10,.2)}
.sopt .t{display:flex;flex-direction:column;min-width:0}
.sopt .z{font-family:'Noto Sans SC',sans-serif;font-size:1.3rem;font-weight:700;line-height:1.2;color:#141b33}
.sopt .p{font-family:var(--body);font-size:.84rem;font-weight:600;opacity:.82;line-height:1.2}
.sopt .e{font-family:var(--body);font-size:.72rem;font-weight:600;opacity:.62;line-height:1.2}
.sopt .said{display:none;font-family:var(--body);font-size:.8rem;font-weight:700;color:#1d48bb;margin-top:2px}
.sopt .said i{font-style:normal;opacity:.85;margin-left:4px}
.sopt.armed{outline:3px solid #2f62e6!important;outline-offset:1px}
.sopt.armed .said{display:block}.sopt.armed .e{display:none}
.sopt.hear{animation:soptHear .9s ease-in-out infinite}
@keyframes soptHear{0%,100%{box-shadow:0 0 0 0 rgba(47,98,230,.0)}50%{box-shadow:0 0 0 7px rgba(47,98,230,.28)}}
.stagetalk .scont{width:100%;min-height:54px}`;
const st0=document.createElement('style');st0.textContent=css;document.head.appendChild(st0);

const wait=ms=>new Promise(r=>setTimeout(r,ms));
const readMs=l=>Math.min(5200,1100+String(l.zh||'').length*170+String(l.en||'').length*18)*(window.TALK_PACE||1);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=(k)=>k<0?0:k>1?1:k*k*(3-2*k);
function ring(el,secs){return new Promise(res=>{const t0=performance.now(),D=secs*1000;let stop=false;el._skip=()=>{stop=true};
  const f=()=>{const k=Math.min(1,(performance.now()-t0)/D);el.style.setProperty('--p',(k*100)+'%');const s=el.querySelector('span');if(s)s.textContent=Math.ceil(secs*(1-k))||'';if(k>=1||stop||!el.isConnected){res();return}requestAnimationFrame(f)};f()})}

// ---------- default cues from the words of a line ----------
const RX={greet:/你好|欢迎|再见|一会儿见|明天见|拜拜|谢谢/,food:/苹果|牛奶|吃|饿|果|饭|面包|蛋糕|香蕉|西瓜|饺子|包子|奶/,scared:/怕|小心|危险|不见了|打雷|哭|糟糕|怎么办/,
  joy:/太好|真棒|太棒|好开心|欢迎|哇|请你|生日快乐/,worry:/对不起|糟糕|不见|怎么办|小心|哎呀|生病|疼/,surprise:/真的|哇|什么！|啊！/,bye:/再见|一会儿见|明天见|拜拜|回来/,give:/给你|请你|送你/};
function cueOf(l,dflt){const z=String(l.zh||''),c=Object.assign({},dflt||{});
  c.face=l.face||c.face||(RX.worry.test(z)?'worried':RX.surprise.test(z)?'surprised':/[？?]$/.test(z)?'neutral':'happy');
  c.act=l.act||c.act||(RX.bye.test(z)?'wave':RX.give.test(z)?'offer':/[？?]/.test(z)?'ask':'talk');
  c.fx=l.fx||(RX.joy.test(z)&&/！/.test(z)?'sparkle':null);
  c.pet=l.pet||(RX.scared.test(z)?'hide':RX.food.test(z)?'munch':RX.greet.test(z)?'hop':null);
  if(l.item){c.item=l.item;c.n=l.n||1}
  c.star=!!(l.star||/小星/.test(z));return c}

// ---------- state ----------
let el=null,cv=null,cx=null,gen=0,pend=null,raf=0,lastT=0,clock=0;
let A,P,cam,parts,pops,flyers,star,bag,lay,bubNow=null,actor=null;
function reset(cast){actor=CAST[cast]||CAST.auntie_wang;
  A={x:1.25,tx:.7,walkPh:0,walking:false,face:'happy',act:'idle',actT:0,talk:false,mouth:0,blinkAt:1.5,blink:0,tilt:0,look:0,basket:[],hold:null,arms:{l:BK.slice(),r:[.2,-.18]},lean:0,nodT:-9};
  P={x:.3,react:null,rT:0,hideK:0,food:null,idleHop:4};
  cam={z:1,fx:.5,fy:.5,tz:1,tfx:.5,tfy:.5,shake:0};parts=[];pops=[];flyers=[];star={on:false,k:0,last:-99};bag={show:0,want:0,bounce:0,got:0,n:0}}
const now=()=>clock;
function layout(){const w=el.clientWidth||360,h=el.clientHeight||629;const pe=lay&&lay.panelEst||214;
  const gy=Math.round(h-pe-8),ah=Math.min(gy*.56,w*.64,260);return{w,h,gy,ah,panelEst:pe}}

// ---------- drawing: the visitor, full body (feet at x,y; H = full height) ----------
function E(c,x,y,rx,ry,f,r=0){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),r,0,7);c.fillStyle=f;c.fill()}
function rgrad(c,x,y,r,a,b){const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.05,x,y,r*1.15);g.addColorStop(0,a);g.addColorStop(1,b);return g}
function limb(c,x0,y0,x1,y1,w,col,line){c.lineCap='round';c.strokeStyle=line;c.lineWidth=w+1.3;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.strokeStyle=col;c.lineWidth=w;c.stroke()}
const BK=[.32,-1.0];// the left arm holds the basket in the crook of the elbow
const POSE={idle:{l:BK,r:[.2,-.18]},talk:{l:BK,r:[.42,-1.05]},wave:{l:BK,r:[2.65,-.3]},ask:{l:BK,r:[.12,-2.85]},
  offer:{l:[.36,-1.62],r:[.36,-1.62]},chest:{l:BK,r:[.18,-2.25]},cheer:{l:[2.55,.25],r:[2.55,.25]},point:{l:BK,r:[1.35,.12]}};
function armPts(side,a1,a2){const sx=side*15.5,sy=-48,L1=14,L2=13;const ex=sx+side*Math.sin(a1)*L1,ey=sy+Math.cos(a1)*L1;const hx=ex+side*Math.sin(a1+a2)*L2,hy=ey+Math.cos(a1+a2)*L2;return{sx,sy,ex,ey,hx,hy}}
function drawAuntie(c,x,y,H,a,t,C){const u=H/100;c.save();c.translate(x,y);c.scale(u,u);
  const wk=a.walking,sw=wk?Math.sin(a.walkPh):0,bob=wk?-Math.abs(Math.cos(a.walkPh))*2.2:0,br=Math.sin(t*2.1);
  // ground shadow
  {const g=c.createRadialGradient(0,0,0,0,0,26);g.addColorStop(0,'rgba(20,18,40,.38)');g.addColorStop(1,'rgba(20,18,40,0)');c.save();c.scale(1,.2);c.fillStyle=g;c.beginPath();c.arc(0,0,26,0,7);c.fill();c.restore()}
  c.translate(0,bob);c.rotate(a.lean);
  const OL='rgba(40,28,30,.38)';
  // legs and cloth shoes
  for(const s of[-1,1]){const ph=s*sw,lift=Math.max(0,-ph)*3.2,fx=s*6.2+ph*3.2;
    c.fillStyle=rgrad(c,fx,-12,12,'#56639a',C.pants);c.strokeStyle=OL;c.lineWidth=.9;c.beginPath();c.roundRect(fx-4.6,-21-lift*.4,9.2,18-lift*.6,3.2);c.fill();c.stroke();
    E(c,fx+s*.6,-2.6-lift,6.6,3.7,C.shoes);E(c,fx+s*.6-1.2,-3.6-lift,2.6,1,'rgba(255,255,255,.22)');c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=.9;c.beginPath();c.ellipse(fx+s*.6,-1.3-lift,6,1.2,0,0,Math.PI);c.stroke()}
  // torso (breathing)
  c.save();c.translate(0,-17);c.scale(1+br*.006,1+br*.014);c.translate(0,17);
  const torso=new Path2D();torso.moveTo(-12,-53.5);torso.quadraticCurveTo(-17.5,-52.5,-17.5,-46);torso.bezierCurveTo(-18.5,-36,-20.5,-24,-17.5,-16.5);torso.quadraticCurveTo(0,-12.5,17.5,-16.5);
  torso.bezierCurveTo(20.5,-24,18.5,-36,17.5,-46);torso.quadraticCurveTo(17.5,-52.5,12,-53.5);torso.quadraticCurveTo(0,-56.5,-12,-53.5);torso.closePath();
  c.fillStyle=rgrad(c,-4,-40,28,'#6fb898',C.shirt);c.fill(torso);
  c.save();c.clip(torso);c.fillStyle=C.dots;c.globalAlpha=.55;for(let i=0;i<26;i++){const px=-18+((i*7.3)%36),py=-54+((i*11.7)%40);c.beginPath();c.arc(px,py,.8,0,7);c.fill()}c.globalAlpha=1;
  const sh=c.createLinearGradient(0,-40,0,-14);sh.addColorStop(0,'rgba(20,60,45,0)');sh.addColorStop(1,'rgba(20,60,45,.28)');c.fillStyle=sh;c.fillRect(-22,-40,44,28);c.restore();
  c.strokeStyle=OL;c.lineWidth=.9;c.stroke(torso);
  // apron with a pocket and a little embroidered flower
  const ap=new Path2D();ap.moveTo(-10,-44.5);ap.lineTo(10,-44.5);ap.quadraticCurveTo(12.5,-30,13.5,-15);ap.quadraticCurveTo(13.6,-11.5,10,-11.5);ap.lineTo(-10,-11.5);ap.quadraticCurveTo(-13.6,-11.5,-13.5,-15);ap.quadraticCurveTo(-12.5,-30,-10,-44.5);ap.closePath();
  c.fillStyle=rgrad(c,-3,-32,22,'#fffaf0',C.apron);c.fill(ap);c.strokeStyle='rgba(150,120,80,.45)';c.lineWidth=.8;c.stroke(ap);
  c.strokeStyle=C.apron2;c.lineWidth=1.6;c.beginPath();c.moveTo(-8.5,-44.5);c.lineTo(-5.5,-53);c.moveTo(8.5,-44.5);c.lineTo(5.5,-53);c.stroke();
  c.fillStyle='rgba(220,200,165,.55)';c.beginPath();c.roundRect(-6.5,-30,13,8,2.5);c.fill();c.strokeStyle='rgba(160,130,90,.5)';c.lineWidth=.6;c.setLineDash([1.2,1]);c.stroke();c.setLineDash([]);
  for(let i=0;i<5;i++){const an=i*1.2566-1.57;E(c,-9+Math.cos(an)*1.5,-38+Math.sin(an)*1.5,1.1,1.1,C.clip)}E(c,-9,-38,.8,.8,'#ffd75e');
  c.restore();
  // neck
  E(c,0,-54.5,4.2,3,C.skin2);
  // arms (computed now so the basket can hang from the left elbow)
  const L=a.arms.l,R=a.arms.r,swing=wk?Math.sin(a.walkPh)*.32:0;
  const al=armPts(-1,L[0]-swing,L[1]),ar=armPts(1,R[0]+swing,R[1]);
  // basket on the left elbow (with what is already in it)
  if(C.basket){const bx=al.ex+(al.hx-al.ex)*.45-1,by=al.ey+(al.hy-al.ey)*.45+1.5;c.strokeStyle='#8a5a2b';c.lineWidth=1.6;c.beginPath();c.ellipse(bx,by+5,8.5,9,0,Math.PI*1.08,Math.PI*1.92);c.stroke();
    let k=0;for(const it of a.basket.slice(-4)){drawIcon(c,it,bx-5+k*3.6,by+3.2-(k%2)*1.5,it==='milk'?4.2:3.4,true);k++}
    const bp=new Path2D();bp.moveTo(bx-10.5,by+3.5);bp.lineTo(bx+10.5,by+3.5);bp.lineTo(bx+8,by+15.5);bp.quadraticCurveTo(bx,by+17.5,bx-8,by+15.5);bp.closePath();
    c.fillStyle=rgrad(c,bx-3,by+7,13,'#e2ad6c','#a8723d');c.fill(bp);c.save();c.clip(bp);c.strokeStyle='rgba(110,66,24,.45)';c.lineWidth=.6;
    for(let i=-14;i<14;i+=2.6){c.beginPath();c.moveTo(bx+i,by+3);c.lineTo(bx+i+8,by+18);c.moveTo(bx+i+8,by+3);c.lineTo(bx+i,by+18);c.stroke()}c.restore();
    c.fillStyle='#8a5a2b';c.beginPath();c.roundRect(bx-11,by+2.4,22,2.8,1.4);c.fill();c.strokeStyle='rgba(70,40,15,.5)';c.lineWidth=.6;c.stroke(bp)}
  // head (tilts; nods after listening)
  c.save();const nod=Math.max(0,1-(t-a.nodT)/.6)*Math.sin((t-a.nodT)*16)*.07;c.translate(0,-55);c.rotate(a.tilt+nod+Math.sin(t*.9)*.015);c.translate(0,55+br*.35);
  const hx=0,hy=-73,hr=20;
  // hair behind (a soft permed cloud)
  for(let i=0;i<9;i++){const an=Math.PI*(.88+i*.155);E(c,hx+Math.cos(an)*19.5,hy+3+Math.sin(an)*16,7.2,7.2,C.hair)}
  E(c,hx,hy+1,22.5,21,C.hair);
  // ears and face
  for(const s of[-1,1]){E(c,hx+s*19.2,hy+2.5,3.6,4.6,C.skin2);E(c,hx+s*19.2,hy+2.5,2.2,3,C.skin)}
  c.fillStyle=rgrad(c,hx-3,hy+2,hr,'#fde3cc',C.skin);c.beginPath();c.ellipse(hx,hy+2,hr*.94,hr*.98,0,0,7);c.fill();c.strokeStyle='rgba(150,90,60,.35)';c.lineWidth=.8;c.stroke();
  // curls on top + fringe
  const curl=(x,y,r)=>{c.fillStyle=rgrad(c,x,y,r,C.hair2,C.hair);c.beginPath();c.arc(x,y,r,0,7);c.fill();c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=.7;c.beginPath();c.arc(x-r*.15,y-r*.1,r*.55,Math.PI*1.1,Math.PI*1.7);c.stroke()};
  for(let i=0;i<9;i++){const an=Math.PI*(1.03+i*.118);curl(hx+Math.cos(an)*19.8,hy-1+Math.sin(an)*18.5,6.6-(i%2)*.8)}
  for(const [fx,fy,fr] of[[-11,-86.5,6.2],[-3.5,-89,6.6],[4.5,-88.5,6.4],[11.5,-85.5,5.8],[-16.5,-79,5],[16.5,-78.5,5]])curl(fx,fy,fr);
  // flower hair clip
  {const fx=14.5,fy=-90;for(let i=0;i<5;i++){const an=i*1.2566+t*.0;E(c,fx+Math.cos(an)*2.6,fy+Math.sin(an)*2.6,2.2,2.2,C.clip)}E(c,fx,fy,1.6,1.6,'#ffe07a')}
  // face
  const f=a.face,ey=hy+1.5,lk=a.look*1.4,blink=a.blink;
  // brows
  c.strokeStyle=C.hair;c.lineWidth=1.25;c.lineCap='round';
  for(const s of[-1,1]){const bx=hx+s*7.6+lk*.4,by=ey-7.6-(f==='surprised'?2.4:f==='worried'?.6:0);c.beginPath();
    if(f==='worried'){c.moveTo(bx-s*3,by-1.6);c.lineTo(bx+s*3,by+.6)}else{c.moveTo(bx-3.2,by+.5);c.quadraticCurveTo(bx,by-1.6,bx+3.2,by+.5)}c.stroke()}
  // eyes
  for(const s of[-1,1]){const exx=hx+s*7.6+lk,eh=f==='surprised'?4:3.3;
    if(f==='happy'&&!a.talk&&a.mouth<.05||blink>.6){c.strokeStyle='#2a1d1a';c.lineWidth=1.3;c.beginPath();if(blink>.6){c.moveTo(exx-2.6,ey+.6);c.quadraticCurveTo(exx,ey+1.8,exx+2.6,ey+.6)}else c.arc(exx,ey+1.6,2.7,Math.PI*1.15,Math.PI*1.85);c.stroke()}
    else{E(c,exx,ey,f==='surprised'?2.8:2.5,eh*(1-blink*.8),'#2a1d1a');E(c,exx+.8,ey-1.3,.95,.95,'#fff');E(c,exx-.7,ey+1.3,.45,.45,'rgba(255,255,255,.7)')}}
  // cheeks, nose
  E(c,hx-12.4,ey+6.6,3.6,2.2,'rgba(255,118,128,.36)');E(c,hx+12.4,ey+6.6,3.6,2.2,'rgba(255,118,128,.36)');
  c.strokeStyle='rgba(170,100,70,.6)';c.lineWidth=.9;c.beginPath();c.arc(hx+lk*.3,ey+4.6,1.3,.2*Math.PI,.8*Math.PI);c.stroke();
  // mouth: open while her line plays
  const my=ey+10,m=a.mouth;
  if(m>.06){const mw=3.2+m*.9,mh=.9+m*3.3;E(c,hx,my+mh*.35,mw,mh,'#8a2f2a');E(c,hx,my+mh*.9,mw*.62,mh*.38,'#e8838a');c.strokeStyle='rgba(90,30,25,.5)';c.lineWidth=.6;c.beginPath();c.ellipse(hx,my+mh*.35,mw,mh,0,0,7);c.stroke()}
  else if(f==='surprised'){E(c,hx,my+.8,1.8,2.3,'#8a2f2a')}
  else if(f==='worried'){c.strokeStyle='#8a3b32';c.lineWidth=1.1;c.beginPath();c.moveTo(hx-3.2,my+1);c.quadraticCurveTo(hx-1.6,my-.2,hx,my+.8);c.quadraticCurveTo(hx+1.6,my+1.8,hx+3.2,my+.6);c.stroke()}
  else if(f==='happy'){c.fillStyle='#8a2f2a';c.beginPath();c.moveTo(hx-3.6,my-.4);c.quadraticCurveTo(hx,my+4.6,hx+3.6,my-.4);c.closePath();c.fill();E(c,hx,my+2,1.6,.8,'#e8838a')}
  else{c.strokeStyle='#8a3b32';c.lineWidth=1.1;c.beginPath();c.arc(hx,my-1.6,3,.22*Math.PI,.78*Math.PI);c.stroke()}
  if(f==='worried'){const d=(t*1.3)%1;c.globalAlpha=1-d*.6;c.fillStyle='#8fd2ff';c.beginPath();c.moveTo(hx+17,hy-14+d*3);c.quadraticCurveTo(hx+20,hy-8+d*3,hx+17,hy-6.5+d*3);c.quadraticCurveTo(hx+14,hy-8+d*3,hx+17,hy-14+d*3);c.fill();c.globalAlpha=1}
  c.restore();
  // arms on top: sleeve, forearm, hand
  for(const [p,side] of[[al,-1],[ar,1]]){limb(c,p.sx,p.sy,p.ex,p.ey,7.2,C.shirt,OL);limb(c,p.ex,p.ey,p.hx,p.hy,5.2,C.skin,'rgba(150,90,60,.45)');
    E(c,p.ex+(p.hx-p.ex)*.08,p.ey+(p.hy-p.ey)*.08,3.9,3.9,C.shirt2);E(c,p.hx,p.hy,3.5,3.5,C.skin);c.strokeStyle='rgba(150,90,60,.45)';c.lineWidth=.7;c.beginPath();c.arc(p.hx,p.hy,3.5,0,7);c.stroke()}
  // what she holds out
  if(a.hold){const hx2=(al.hx+ar.hx)/2,hy2=Math.min(al.hy,ar.hy)-4;drawIcon(c,a.hold,hx2,hy2,6.5,true)}
  c.restore();
  // where her head and hands are on screen (for bubbles, pops and flyers)
  return{head:[x,y+(bob-98)*u],mouth:[x,y+(bob-62)*u],basket:[x+(al.ex+(al.hx-al.ex)*.45-1)*u,y+(bob+al.ey+(al.hy-al.ey)*.45+8)*u],hand:[x+ar.hx*u,y+(bob+ar.hy)*u],hands:[x+((al.hx+ar.hx)/2)*u,y+(bob+Math.min(al.hy,ar.hy)-4)*u]}}

// ---------- small pictures (answers, pops, flyers) ----------
function drawIcon(c,k,x,y,r,small){c.save();c.translate(x,y);
  const apple=(ax,ay,ar)=>{E(c,ax,ay,ar,ar*.95,rgrad(c,ax,ay,ar,'#ff8a7a','#d7313a'));E(c,ax-ar*.35,ay-ar*.35,ar*.25,ar*.18,'rgba(255,255,255,.55)',-.6);
    c.strokeStyle='#6b4423';c.lineWidth=Math.max(.6,ar*.14);c.lineCap='round';c.beginPath();c.moveTo(ax,ay-ar*.8);c.lineTo(ax+ar*.12,ay-ar*1.25);c.stroke();E(c,ax+ar*.42,ay-ar*1.1,ar*.38,ar*.18,'#5cb85c',-.5)};
  if(k==='apple')apple(0,r*.08,r*.8);
  else if(k==='apple3'){apple(-r*.45,r*.3,r*.46);apple(r*.45,r*.3,r*.46);apple(0,-r*.22,r*.46)}
  else if(k==='milk'){c.fillStyle=rgrad(c,0,0,r,'#ffffff','#dfe8f5');c.beginPath();c.moveTo(-r*.5,-r*.35);c.lineTo(0,-r*.82);c.lineTo(r*.5,-r*.35);c.lineTo(r*.5,r*.85);c.lineTo(-r*.5,r*.85);c.closePath();c.fill();
    c.strokeStyle='rgba(60,80,120,.45)';c.lineWidth=Math.max(.5,r*.06);c.stroke();c.fillStyle='#4a86e8';c.fillRect(-r*.5,r*.05,r,r*.4);c.fillStyle='#fff';c.beginPath();c.ellipse(0,r*.25,r*.22,r*.13,0,0,7);c.fill();
    c.fillStyle='#4a86e8';c.fillRect(-r*.1,-r*.95,r*.2,r*.2)}
  else if(k==='coin'){for(const [cx2,cy2] of[[-r*.28,r*.18],[r*.22,-r*.12]]){E(c,cx2,cy2,r*.56,r*.56,rgrad(c,cx2,cy2,r*.56,'#fff1a8','#e0a525'));c.strokeStyle='rgba(150,95,10,.6)';c.lineWidth=Math.max(.5,r*.06);c.beginPath();c.arc(cx2,cy2,r*.56,0,7);c.stroke();
    c.fillStyle='rgba(150,95,10,.75)';c.fillRect(cx2-r*.12,cy2-r*.12,r*.24,r*.24);c.strokeStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(cx2,cy2,r*.4,Math.PI*1.1,Math.PI*1.5);c.stroke()}}
  else if(k==='heart'){const h=r*.9;c.fillStyle=rgrad(c,0,0,h,'#ff9fb5','#e6476b');c.beginPath();c.moveTo(0,h*.75);c.bezierCurveTo(-h*1.2,-h*.05,-h*.55,-h*.95,0,-h*.35);c.bezierCurveTo(h*.55,-h*.95,h*1.2,-h*.05,0,h*.75);c.fill();E(c,-h*.42,-h*.32,h*.16,h*.1,'rgba(255,255,255,.6)',-.6)}
  else if(k==='no'||k==='wave'){// an open hand (no thanks / goodbye)
    c.rotate(k==='wave'?-.35:0);c.fillStyle=rgrad(c,0,0,r,'#ffe2c8','#f0b88f');c.strokeStyle='rgba(150,90,60,.6)';c.lineWidth=Math.max(.5,r*.06);
    c.beginPath();c.roundRect(-r*.45,-r*.15,r*.9,r*.85,r*.3);c.fill();c.stroke();for(let i=0;i<4;i++){c.beginPath();c.roundRect(-r*.45+i*r*.235,-r*.8+Math.abs(i-1.5)*r*.1,r*.2,r*.75,r*.1);c.fill();c.stroke()}
    c.beginPath();c.roundRect(-r*.78,-r*.05,r*.42,r*.2,r*.1);c.fill();c.stroke();if(k==='no'){c.strokeStyle='#e5484d';c.lineWidth=r*.14;c.beginPath();c.arc(0,0,r*.98,0,7);c.stroke()}}
  else if(k==='orb'||k==='great'||k==='ultra'||k==='berry'){try{if(window.FX&&FX.item)FX.item(c,k,0,0,r);else if(k==='berry')E(c,0,0,r*.8,r*.8,'#e2456b');else if(typeof drawOrb==='function')drawOrb(c,0,0,r,0,0,k)}catch(e){}}
  else if(k==='bag'){c.fillStyle=rgrad(c,0,0,r,'#ffcf7a','#d98a2b');c.strokeStyle='rgba(110,60,10,.6)';c.lineWidth=Math.max(.6,r*.07);c.beginPath();c.roundRect(-r*.8,-r*.45,r*1.6,r*1.25,r*.32);c.fill();c.stroke();
    c.beginPath();c.moveTo(-r*.8,-r*.1);c.quadraticCurveTo(0,r*.25,r*.8,-r*.1);c.stroke();c.strokeStyle='#a5641c';c.lineWidth=r*.16;c.beginPath();c.arc(0,-r*.45,r*.45,Math.PI,0);c.stroke();E(c,0,r*.08,r*.14,r*.14,'#fff1c8')}
  else if(k&&!/^[a-z0-9]+$/.test(k)){c.font=`${r*1.5}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(k,0,r*.08)}
  c.restore()}
window.drawStageIcon=drawIcon;

// ---------- the frame ----------
function frame(){if(!el||!el.isConnected||el.hidden){raf=0;return}raf=requestAnimationFrame(frame);try{draw()}catch(e){console.error(e)}}
function sizeCv(){const r=el.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1),w=Math.round(r.width*d),h=Math.round(r.height*d);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}return{w:r.width,h:r.height,d}}
let feet={};
let frames=0;
function draw(){const tn=performance.now()/1000,rdt=lastT?tn-lastT:.016,dt=Math.min(.1,rdt),wdt=Math.min(.3,rdt);lastT=tn;clock+=dt;frames++;const t=clock;
  const {w,h,d}=sizeCv();lay=Object.assign(layout(),{panelEst:lay.panelEst});const gy=lay.gy,ah=lay.ah;cx.setTransform(d,0,0,d,0,0);
  const p=PLACES[S.place]||PLACES[0];
  // actors move
  const k=1-Math.exp(-dt*9);
  if(Math.abs(A.tx-A.x)>.002){const dir=Math.sign(A.tx-A.x),sp=.36;A.x+=dir*Math.min(Math.abs(A.tx-A.x),sp*wdt);A.walking=true;A.walkPh+=wdt*11;A.lean+=((-dir*.05)-A.lean)*k}else{A.walking=false;A.lean+=(0-A.lean)*k}
  const pose=POSE[A.act]||POSE.idle;for(const s of['l','r']){const tg=pose[s].slice();
    if(A.act==='wave'&&s==='r')tg[1]=-.3+Math.sin(t*10)*.45;if(A.act==='talk'&&s==='r'&&A.talk){tg[0]+=Math.sin(t*3.1)*.12;tg[1]+=Math.sin(t*4.3)*.28}
    if(A.act==='cheer')tg[1]+=Math.sin(t*9+(s==='l'?0:1.5))*.25;
    A.arms[s][0]+=(tg[0]-A.arms[s][0])*k;A.arms[s][1]+=(tg[1]-A.arms[s][1])*k}
  A.tilt+=((A.act==='ask'?.1:A.act==='chest'?-.06:0)-A.tilt)*k;
  const mt=A.talk?clamp(.3+.7*Math.abs(Math.sin(t*13.3))*(.55+.45*Math.sin(t*5.1+1)),0,1):0;A.mouth+=(mt-A.mouth)*(1-Math.exp(-dt*28));
  if(t>A.blinkAt){A.blink=1;if(t>A.blinkAt+.13){A.blink=0;A.blinkAt=t+2.2+Math.random()*3}}
  // camera eases toward its target, with a little shake on exciting lines
  const kc=1-Math.exp(-dt*3.2);cam.z+=(cam.tz-cam.z)*kc;cam.fx+=(cam.tfx-cam.fx)*kc;cam.fy+=(cam.tfy-cam.fy)*kc;cam.shake*=Math.exp(-dt*5);
  const Fx=cam.fx*w,Fy=cam.fy*h,z=cam.z,mx=Math.min(Fx,w-Fx)*(z-1),my=Math.min(Fy,h-Fy)*(z-1);
  const sx=clamp((Math.random()-.5)*cam.shake,-mx,mx),sy=clamp((Math.random()-.5)*cam.shake,-my,my);
  const toScr=(x,y)=>[Fx+(x-Fx)*z+sx,Fy+(y-Fy)*z+sy];
  cx.save();cx.translate(Fx+sx,Fy+sy);cx.scale(z,z);cx.translate(-Fx,-Fy);
  // the place, with its ambient motion (leaves, rain, lights)
  try{bg(cx,w,h,p);if(!hasScene(p))for(const pr of props)drawProp(cx,pr,w,h);if(ambOK(p))ambient(cx,w,h,p)}catch(e){cx.fillStyle='#3b5a49';cx.fillRect(0,0,w,h)}
  // soft light pool where they stand
  {const g=cx.createRadialGradient(w*.5,gy,4,w*.5,gy,w*.6);g.addColorStop(0,'rgba(255,246,220,.22)');g.addColorStop(1,'rgba(255,246,220,0)');cx.fillStyle=g;cx.fillRect(0,gy-w*.4,w,w*.7)}
  // the lead creature, reacting
  const lead=party()[0];let pk={};
  if(lead){const spi=lead.sp,sz=SP[spi].sz||1,ch=ah*.5,s=ch/(2.6*sz),age=t-P.rT;let hop=0,sqx=1,sqy=1,dx=0,tremble=0;
    P.hideK+=((P.react==='hide'?1:0)-P.hideK)*k;
    if(P.react==='hop'&&age<1.1)hop=Math.abs(Math.sin(age*Math.PI*2.7))*s*.5*(1-age/1.1);
    if(P.react==='munch'&&age<1.8){sqy=1+Math.sin(age*20)*.05;sqx=1-Math.sin(age*20)*.03}
    if(!P.react&&t>P.idleHop){P.react='hop';P.rT=t;P.idleHop=t+5+Math.random()*5}
    if(P.react&&P.react!=='hide'&&age>1.9)P.react=null;
    dx=-P.hideK*w*.07;tremble=P.hideK*Math.sin(t*40)*1.2;
    const px=P.x*w+dx+tremble,py=gy+ah*.01;
    cx.save();cx.translate(px,py);cx.scale(sqx*(1-P.hideK*.12),sqy*(1-P.hideK*.18));
    dc(cx,spi,0,0,s,t,{awake:true,shiny:lead.shiny,hop,ph:1.3});cx.restore();
    pk={x:px,top:py-ch,mouth:[px+s*sz*1.05,py-ch*.55],s,ch};
    // food being munched
    if(P.react==='munch'&&age<1.8&&P.food){const bite=Math.floor(age/.45);if(bite<4){cx.save();cx.globalAlpha=1-bite*.18;drawIcon(cx,P.food,pk.mouth[0]+6,pk.mouth[1],ch*.13*(1-bite*.2),true);cx.restore()}
      if(Math.random()<dt*14)parts.push({x:pk.mouth[0]+4,y:pk.mouth[1],vx:(Math.random()-.3)*60,vy:-40-Math.random()*40,g:260,age:0,life:.6,kind:'crumb',col:P.food==='milk'?'#ffffff':'#f6d36b',r:1.6})}
    if(P.hideK>.4&&Math.floor(t*2)%2===0)E(cx,px+s*sz*1.1,py-ch*.95,2.2,3,'rgba(143,210,255,.9)')}
  // the visitor
  feet=drawAuntie(cx,A.x*w,gy,ah,A,t,actor);
  // Little Star floats in when someone mentions her
  star.k+=((star.on&&t-star.last<9?1:0)-star.k)*(1-Math.exp(-dt*2.5));
  if(star.k>.02&&window.drawLittleStar){cx.save();cx.globalAlpha=star.k;drawLittleStar(cx,w*(.12+star.k*.06)+Math.sin(t*.8)*w*.02,h*.17+Math.sin(t*1.7)*6,ah*.085,t,true);cx.restore()}
  cx.restore();
  // things in screen space: pops above her basket, flyers into the bag, particles
  const bpos=[w*.11,gy+ah*.02];bag.show+=((bag.want?1:0)-bag.show)*(1-Math.exp(-dt*6));bag.bounce*=Math.exp(-dt*7);
  if(bag.show>.02){cx.save();cx.globalAlpha=bag.show;cx.translate(bpos[0],bpos[1]);cx.scale(1+bag.bounce*.25,1-bag.bounce*.18);drawIcon(cx,'bag',0,0,ah*.1);cx.restore();
    if(bag.got){cx.save();const ag=t-bag.gotT;cx.globalAlpha=bag.show*clamp(2-ag*.5,0,1);cx.font=`800 ${Math.round(ah*.1)}px Sora,Manrope,sans-serif`;cx.textAlign='center';cx.lineWidth=4;cx.strokeStyle='rgba(30,40,90,.65)';cx.strokeText('+'+bag.got,bpos[0],bpos[1]-ah*.13-Math.min(1,ag)*8);cx.fillStyle='#fff6c2';cx.fillText('+'+bag.got,bpos[0],bpos[1]-ah*.13-Math.min(1,ag)*8);cx.restore()}}
  const bk=toScr(feet.basket[0],feet.basket[1]);
  pops=pops.filter(q=>{const ag=t-q.t0;if(ag<0)return true;const n=q.n,i=q.i,x0=bk[0]-ah*.2+(i-(n-1)/2)*ah*.12,y0=bk[1]-ah*.36;
    if(ag<q.hold){const sc=ag<.3?ease(ag/.3)*1.15:1+Math.sin(ag*6)*.03;cx.save();cx.translate(x0,y0+Math.sin(t*3+i)*2);cx.scale(sc,sc);drawIcon(cx,q.kind,0,0,ah*.05);cx.restore();return true}
    const fk=(ag-q.hold)/.35;if(fk>=1){A.basket.push(q.kind);sfx('tap');return false}cx.save();cx.translate(x0+(bk[0]-x0)*fk,y0+(bk[1]-y0)*fk*fk);cx.scale(1-fk*.5,1-fk*.5);drawIcon(cx,q.kind,0,0,ah*.05);cx.restore();return true});
  flyers=flyers.filter(f=>{const ag=t-f.t0;if(ag<0)return true;const kk=Math.min(1,ag/f.dur);const x=f.x0+(bpos[0]-f.x0)*kk,y=f.y0+(bpos[1]-f.y0)*kk-Math.sin(kk*Math.PI)*ah*.45;
    if(kk>=1){bag.bounce=1;bag.got+=f.v;bag.gotT=t;sfx('item');for(let i=0;i<6;i++)parts.push({x:bpos[0],y:bpos[1]-6,vx:(Math.random()-.5)*120,vy:-60-Math.random()*80,g:200,age:0,life:.7,kind:'spark',col:'#fff3a8',r:2.4});return false}
    cx.save();cx.translate(x,y);cx.rotate(kk*6);drawIcon(cx,f.kind,0,0,ah*.045*(1-kk*.3));cx.restore();return true});
  parts=parts.filter(q=>{q.age+=dt;if(q.age>q.life)return false;q.vy+=(q.g||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;const a=1-q.age/q.life;cx.save();cx.globalAlpha=a;
    if(q.kind==='heart'){drawIcon(cx,'heart',q.x,q.y,q.r*(1+q.age))}
    else if(q.kind==='spark'){cx.translate(q.x,q.y);cx.rotate(q.age*3);cx.fillStyle=q.col;cx.beginPath();for(let i=0;i<8;i++){const rr=i%2?q.r*.35:q.r*1.6,an=i*Math.PI/4;cx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr)}cx.closePath();cx.fill()}
    else E(cx,q.x,q.y,q.r,q.r,q.col);cx.restore();return true});
  // the bubble follows its speaker
  if(bubNow&&bubNow.isConnected){const who=bubNow._who;const bw=bubNow.offsetWidth,bh=bubNow.offsetHeight;let ax,ay,left,top,below=false;
    if(who==='npc'){[ax,ay]=toScr(feet.head[0],feet.head[1]);left=clamp(ax-bw*.62,10,w-10-bw);top=ay-bh-14;if(top<10){top=10}}
    else{ax=pk.x||w*.27;ay=pk.top||gy-ah*.4;[ax,ay]=toScr(ax,ay);left=12;top=clamp(ay-bh-16,10,h);const maxW=w*.66;if(bw>maxW)bubNow.style.maxWidth=maxW+'px'}
    bubNow.style.left=Math.round(left)+'px';bubNow.style.top=Math.round(top)+'px';bubNow.style.setProperty('--tx',clamp(ax-left,22,bw-22)+'px');bubNow.classList.toggle('below',below)}
}

// ---------- helpers used by the script of a staged conversation ----------
// while someone speaks the camera moves in (anchored near the top, so the pair fills the screen down to the bottom); while the child picks an answer it pulls back above the panel
function focus(who){const {h,gy}=lay,z=clamp((h-36)/gy,1,1.3);if(who==='npc'){cam.tz=z;cam.tfx=.54;cam.tfy=.04}else if(who==='you'){cam.tz=z;cam.tfx=.4;cam.tfy=.04}else{cam.tz=1;cam.tfx=.5;cam.tfy=.04}}
function clearBubbles(){for(const b of el.querySelectorAll('.stbubs .sbub:not(.out)')){b.classList.add('out');setTimeout(()=>b.remove(),320)}bubNow=null}
function bubble(who,l){const bubs=el.querySelector('.stbubs');clearBubbles();
  const b=document.createElement('div');b.className='sbub '+who;b.dataset.say=l.zh;b._who=who;
  b.innerHTML=(who==='npc'&&curD&&curD.who?`<span class="nm">${curD.who.zh||''}<i>${curD.who.py||''}</i></span>`:'')+`<div class="z">${l.zh}</div><div class="p">${l.py||''}</div>${l.en?`<div class="e">${l.en}</div>`:''}`;
  b.style.maxWidth=who==='npc'?'calc(100% - 20px)':'66%';b.style.left='-999px';bubs.appendChild(b);bubNow=b;return b}
function petReact(r,food){if(!r)return;P.react=r;P.rT=now();P.food=food||null;if(r==='munch'&&!food)P.food='apple';if(r==='hop')P.idleHop=now()+6}
function burst(kind,x,y,n){for(let i=0;i<n;i++){const an=Math.random()*Math.PI*2,v=50+Math.random()*90;parts.push({x,y,vx:Math.cos(an)*v,vy:Math.sin(an)*v-(kind==='heart'?40:20),g:kind==='heart'?-30:60,age:0,life:kind==='heart'?1.4:.9,kind,col:['#fff6b0','#ffd36b','#ffffff','#bfe6ff'][i%4],r:kind==='heart'?lay.ah*.035:2.6+Math.random()*2})}}
function foodOf(z){return /牛奶|奶/.test(z)?'milk':/苹果|果/.test(z)?'apple':null}
function applyCue(c,line){A.face=c.face;A.act=c.act;A.actT=now();
  if(c.fx==='sparkle'||c.fx==='shake'||c.fx==='hearts'){const [x,y]=feet.head||[lay.w*.7,lay.gy-lay.ah];setTimeout(()=>{if(c.fx==='hearts')burst('heart',x,y+lay.ah*.2,5);else burst('spark',x,y+lay.ah*.15,12);if(c.fx!=='hearts')cam.shake=c.fx==='shake'?10:4},250)}
  if(c.item){const n=Math.min(5,c.n||1),t0=now()+.25;for(let i=0;i<n;i++)pops.push({kind:c.item,i,n,t0:t0+i*.38,hold:1.25+(n-1-i)*.38});for(let i=0;i<n;i++)setTimeout(()=>{try{sfx('tap')}catch(e){}},250+i*380)}
  if(c.pet)petReact(c.pet,c.pet==='munch'?(foodOf(line.zh)||c.item):null);
  if(c.star){star.on=true;star.last=now()}}

let curD=null;
async function runStage(key){
  const D=DIALOGUES[key];curD=D;const my=++gen,ABORT={};
  const live=()=>{if(my!==gen||!el||!el.isConnected||el.hidden)throw ABORT};
  const after=async p=>{const v=await p;live();return v};
  try{try{closeSayCard()}catch(e){}
  if(pend){const r=pend;pend=null;r(null)}
  if(el)el.remove();
  el=document.createElement('div');el.className='sheet talk stagetalk';el.dataset.key=key;
  el.innerHTML=`<canvas class="stcv"></canvas><div class="stbubs"></div><div class="stpanel"><div class="scue"></div><div class="sopts"></div></div>`;
  document.body.appendChild(el);cv=el.querySelector('.stcv');cx=cv.getContext('2d');
  const young=!!(window.isYoung&&isYoung());
  const nOpt=Math.max(1,...(D.turns||[]).map(t=>t.you?(young?1:Math.max(1,t.you.filter(o=>o.ok).length)):1));
  reset(STAGE_TALKS[key]);lay={panelEst:58+nOpt*70};lay=Object.assign(layout(),{panelEst:lay.panelEst});lastT=0;
  try{for(const t of D.turns||[]){if(t.npc)preloadZh(t.npc.zh);for(const o of t.you||[]){if(o.ok){preloadZh(o.zh);if(o.reply)preloadZh(o.reply.zh)}}}if(D.end)preloadZh(D.end.zh)}catch(e){}
  const panel=el.querySelector('.stpanel'),cue=el.querySelector('.scue'),box=el.querySelector('.sopts');
  {const big=(D.turns||[]).filter(t=>t.you).map(t=>young?[t.you.find(o=>o.ok)||t.you[0]]:t.you.filter(o=>o.ok)).sort((a,b)=>b.length-a.length)[0]||[];
    cue.innerHTML=`<div class="c"><div class="ce">Say it in Chinese: <b>“${(big[0]||{}).en||''}”</b></div><div class="cz">用中文说<i>yòng Zhōngwén shuō</i></div></div><div class="ring"><span></span></div>`;
    box.innerHTML=big.map(o=>`<button class="sopt"><canvas></canvas><span class="t"><span class="z">${o.zh}</span><span class="p">${o.py||''}</span><span class="e">${o.en||''}</span></span></button>`).join('');
    lay.panelEst=Math.max(lay.panelEst,panel.offsetHeight+4);lay=Object.assign(layout(),{panelEst:lay.panelEst});cue.innerHTML='';box.innerHTML=''}
  if(!raf)raf=requestAnimationFrame(frame);
  LOG('talk_start',{key,staged:true});
  const npcSay=async(l,dflt)=>{const c=cueOf(l,dflt);focus('npc');bubble('npc',l);applyCue(c,l);A.look=0;A.talk=true;
    await after(Promise.all([speakAsync(l.zh).then(()=>{A.talk=false}),wait(readMs(l))]));A.talk=false;if(A.act==='wave'||A.act==='cheer')A.act='idle'};
  // she walks in, the creature hops hello
  A.tx=.7;A.act='idle';focus(null);await after(wait(300));for(let i=0;i<80&&Math.abs(A.x-A.tx)>.01;i++)await after(wait(50));
  A.act='wave';petReact('hop');await after(wait(650));A.act='idle';
  for(const turn of D.turns){live();
    if(turn.npc){await npcSay(turn.npc);continue}
    const all=turn.you||[],good=all.filter(o=>o.ok),target=good[0]||all[0],opts=young?[target]:good.length?good:all;
    // her turn to listen: the panel rises with the cue and the say-it-aloud countdown
    focus(null);A.act='idle';A.face='neutral';A.look=-.6;box.innerHTML='';
    cue.innerHTML=young?`<span class="ear">👂</span><div class="c"><div class="cz" data-say="听一听，说一说">听一听，说一说<i>tīng yi tīng, shuō yi shuō</i></div></div><div class="ring"><span></span></div>`
      :`<div class="c"><div class="ce">Say it in Chinese: <b>“${target.en}”</b></div><div class="cz" data-say="用中文说">用中文说<i>yòng Zhōngwén shuō</i></div></div><div class="ring"><span></span></div>`;
    const mk=o=>{const b=document.createElement('button');b.className='sopt'+(o.pic?'':' nopic');b.innerHTML=(o.pic?'<canvas></canvas>':'')+`<span class="t"><span class="z">${o.zh}</span><span class="p">${o.py||''}</span>${o.en?`<span class="e">${o.en}</span>`:''}<span class="said">I said it! · 说了！<i>shuō le!</i></span></span>`;
      box.appendChild(b);if(o.pic){const c2=b.querySelector('canvas'),dd=Math.min(2,devicePixelRatio||1);c2.width=52*dd;c2.height=52*dd;const g=c2.getContext('2d');g.setTransform(dd,0,0,dd,0,0);drawIcon(g,o.pic,26,27,17)}return b};
    panel.classList.add('up');
    if(young){const b=mk(target);b.disabled=true;b.classList.add('hear');await after(wait(380));try{await after(speakAsync(target.zh))}catch(e){if(e===ABORT)throw e}b.classList.remove('hear');b.disabled=false;b.remove()}
    await after(ring(cue.querySelector('.ring'),young?4:3));
    const chosen=await after(new Promise(r=>{pend=r;box.innerHTML='';
      if(window.canListen&&canListen()&&!young){const mic=document.createElement('button');mic.className='mic';mic.innerHTML='🎤';cue.querySelector('.ring').replaceWith(mic);
        mic.onclick=async()=>{if(mic.disabled)return;mic.disabled=true;mic.classList.add('on');const alts=await listenZh();mic.disabled=false;mic.classList.remove('on');if(alts===null){mic.remove();return}
          let best=null,bs=0,heardTxt=alts[0]||'';for(const h of alts)for(const o of opts){const sc=zhMatch(h,o.zh);if(sc>bs){bs=sc;best=o;heardTxt=h}}
          try{LOG('speech',{heard:heardTxt.slice(0,40),score:+bs.toFixed(2),ok:bs>=.6})}catch(e){}
          if(best&&bs>=.6){sfx('quest');setTimeout(()=>r(best),500)}else mic.innerHTML='🎤↻'}}
      else{const rg=cue.querySelector('.ring');if(rg)rg.style.visibility='hidden'}
      const bs=[];for(const o of [...opts].sort(()=>Math.random()-.5)){const b=mk(o);bs.push(b);
        b.onclick=()=>{if(!b.classList.contains('armed')){bs.forEach(x=>x.classList.remove('armed'));b.classList.add('armed');speakAsync(o.zh);if(o.react)A.face=o.react;return}r(o)}}}));
    pend=null;panel.classList.remove('up');box.querySelectorAll('button').forEach(b=>b.disabled=true);
    // the child's line: her bubble, her creature reacts, the visitor listens (and nods)
    focus('you');bubble('you',chosen);A.face=chosen.react||'neutral';A.look=-1;const z=chosen.zh;
    if(RX.food.test(z))petReact('munch',foodOf(z));else if(RX.greet.test(z))petReact('hop');
    await after(Promise.all([speakAsync(chosen.zh),wait(900)]));A.look=0;A.nodT=now();
    try{phraseHeard(chosen.zh,true)}catch(e){}try{questEv('words')}catch(e){}
    if(chosen.reply)await npcSay(chosen.reply);
    await after(wait(250))}
  // the last line; the reward flies into the child's bag as she says it
  const dayKey=(typeof today==='function'?today():'');S.talkDay=S.talkDay||{};const gotReward=!!(D.reward&&S.talkDay[key]!==dayKey);
  if(D.end){const endP=npcSay(D.end,gotReward?{act:'offer'}:{});
    if(gotReward){await after(wait(500));bag.want=1;const [hx,hy]=feet.hands||feet.hand;let i=0;
      for(const [k2,n] of Object.entries(D.reward))for(let j=0;j<Math.min(5,n);j++){flyers.push({kind:k2,v:n>5&&j===4?n-4:1,x0:hx,y0:hy,t0:now()+.15+i*.22,dur:.85});i++}}
    await endP}
  else if(gotReward){bag.want=1}
  if(gotReward){give(D.reward);S.talkDay[key]=dayKey}
  S.talked=S.talked||{};S.talked[key]=(S.talked[key]||0)+1;try{window.onTalkDone&&onTalkDone(key)}catch(e){}save();LOG('talk_end',{key,fixes:0,staged:true});
  await after(wait(gotReward?900:200));
  // a goodbye wave, then she walks off
  clearBubbles();focus(null);A.act='wave';A.face='happy';await after(wait(700));A.tx=1.3;setTimeout(()=>{if(A)A.act='idle'},700);petReact('hop');
  cue.innerHTML='';box.innerHTML='';const b=document.createElement('button');b.className='big scont';b.innerHTML=(gotReward?`Continue · You got ${rwTxt(D.reward)}`:'Continue')+zw('继续','jìxù');box.appendChild(b);panel.classList.add('up');
  await after(new Promise(r=>{pend=r;b.onclick=()=>r(true)}));pend=null;
  close();updateUI();return true}
  catch(e){if(e!==ABORT){console.error(e);if(my===gen)close()}return false}}
function close(){gen++;if(pend){const r=pend;pend=null;r(null)}if(el){el.remove();el=null}bubNow=null;curD=null}
window.stopStage=function(){if(el||pend)close()};
window.stageState=()=>A?{face:A.face,act:A.act,talk:A.talk,x:A.x,pet:P.react,star:star.on,basket:A.basket.slice(),bag:bag.got,zoom:+cam.z.toFixed(3),frames}:null;

// staged conversations take over from the chat player; everything else goes to it unchanged
const runPlain=window.runTalk,stopPlain=window.stopTalk;
window.runTalk=function(key){if(window.STAGE_TALKS[key]&&S.stageTalks!==false&&typeof DIALOGUES!=='undefined'&&DIALOGUES[key]&&window.hasTalk(key)){try{stopPlain&&stopPlain()}catch(e){}return runStage(key)}return runPlain(key)};
window.stopTalk=function(){window.stopStage();return stopPlain&&stopPlain()};
})();
