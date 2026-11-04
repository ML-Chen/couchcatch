// Playing together on one phone: trading creatures between two local players, and a friendly two-player battle.
// Wired in by build.py at //@@TOGETHER@@ (after every other module). It only wraps a few game functions
// (renderWho, sheetOpen, restore, switchPlayer, isYoung) instead of editing game.html.
//
// Every Chinese line this module speaks (tools/zh_strings.js collects them for recording):
var TOGETHER_LINES={
  trade:{zh:'换一换',py:'huàn yi huàn',en:'Trade'},
  pick:{zh:'你想换哪个？',py:'nǐ xiǎng huàn nǎge?',en:'Which one?'},
  ask:{zh:'我们换吧！',py:'wǒmen huàn ba!',en:"Let's trade!"},
  ok:{zh:'好啊！',py:'hǎo a!',en:'OK!'},
  give:{zh:'给你！',py:'gěi nǐ!',en:'Here you go!'},
  thanks:{zh:'谢谢！',py:'xièxie!',en:'Thanks!'},
  done:{zh:'好了！',py:'hǎo le!',en:'Done!'},
  battle:{zh:'友谊赛',py:'yǒuyì sài',en:'Friendly battle'},
  match:{zh:'我们来比赛吧！',py:'wǒmen lái bǐsài ba!',en:"Let's have a match!"},
  turn:{zh:'该你了！',py:'gāi nǐ le!',en:'Your turn!'},
  win:{zh:'你赢了！',py:'nǐ yíng le!',en:'You won!'},
  gg:{zh:'打得好！',py:'dǎ de hǎo!',en:'Well played!'},
  who:{zh:'和谁玩？',py:'hé shéi wán?',en:'Play with who?'}
};
if(typeof document!=='undefined')(function(){
const L=TOGETHER_LINES,zl=(k,inl)=>zw(L[k].zh,L[k].py,inl),en=k=>L[k].en;
const keyOf=id=>id==='p1'?'couchcatch2':'couchcatch2_'+id,docOf=id=>id==='p1'?'save':'save_'+id;
const pic=x=>PICS[Math.max(0,PL.list.indexOf(x))%PICS.length];
const others=()=>PL.list.filter(x=>x.id!==PID);
const say2=(zh)=>{try{return window.speakAsync&&S.zhVoice!==false?Promise.race([speakAsync(zh),sleep(4000)]):Promise.resolve()}catch(e){return Promise.resolve()}};
const fixIds=d=>{let m=0;for(const c of d.col)m=Math.max(m,c.id||0);d.nextId=Math.max(d.nextId||1,m+1)};

// ---------- another player's save: the newest of this device's copy and the cloud copy ----------
function readOther(id){try{return parse(localStorage.getItem(keyOf(id)))}catch(e){return null}}
async function loadOther(id){let d=readOther(id);
  if(DB&&UID){try{const sn=await Promise.race([DB.doc('data/users/'+UID+'/'+docOf(id)).get(),sleep(5000).then(()=>null)]);const rd=sn&&sn.exists?sn.data():null,rem=rd&&parse(rd.json);
    if(rem&&(!d||(rem.savedAt||0)>(d.savedAt||0)))d=rem}catch(e){}}
  if(d){migrateOther(d)}return d}
function migrateOther(d){if(!d.items)d.items={orb:20,great:1,ultra:0,berry:2};d.caught=d.caught||[];fixIds(d)}
// both copies of the other player's save; throws if this device can't store it (the caller undoes the change)
function writeOther(id,d){d.savedAt=Date.now();const j=JSON.stringify(d);localStorage.setItem(keyOf(id),j);
  if(DB&&UID)DB.doc('data/users/'+UID+'/'+docOf(id)).set({json:j,savedAt:d.savedAt}).catch(()=>{})}

// ---------- the sheet (partner pick, then the trade) ----------
const css=`#sTog .inner{height:100%;gap:8px}
#sTog .inner>.row{flex:none}
.tgents{display:grid;grid-template-columns:1fr 1fr;gap:8px}.tgents[hidden]{display:none}
.tgents button{padding:8px 6px}
.tgpair{flex:none;display:grid;grid-template-columns:1fr 28px 1fr;align-items:center;gap:4px}
.tgslot{display:flex!important;align-items:center;gap:6px;padding:4px 6px!important;height:64px;min-width:0;text-align:left;border-radius:10px!important}
.tgslot.on{outline:2px solid var(--accent);outline-offset:1px}
.tgslot canvas{width:44px;height:44px;flex:none}.tgslot .tgsl{display:flex;flex-direction:column;min-width:0;line-height:1.15}
.tgslot .tgwho{font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tgslot .tgsel{font-family:'Noto Sans SC',sans-serif;font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tgslot .tgsel i{font-style:normal;font-family:var(--body);font-size:.66rem;opacity:.75;display:block}
.tgarrow{text-align:center;font-size:1.3rem;color:var(--accent)}
.tgask{flex:none;display:flex;align-items:center;gap:6px;height:44px;overflow:hidden}
.tgask .tgline{flex:1;min-width:0;display:flex;align-items:center;gap:6px;font-size:.92rem;white-space:nowrap;overflow:hidden}
.tgask .tgline .bi{align-items:flex-start}
.tgcue{flex:none;font-size:.66rem;font-weight:800;color:#1b130b;background:var(--accent);border-radius:99px;padding:2px 7px;white-space:nowrap}
.tgask button{flex:none;padding:6px 10px!important;font-size:.9rem}
.tggrid{flex:1 1 0;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,minmax(0,1fr));gap:6px}
.tgc{display:flex!important;flex-direction:column;justify-content:center;gap:2px;padding:4px 6px!important;min-width:0;min-height:0;overflow:hidden;text-align:left;border-radius:10px!important}
.tgc.sel{outline:3px solid var(--accent);outline-offset:-1px}
.tgc .tgtop{display:flex;align-items:center;gap:6px;min-width:0}
.tgc canvas{width:44px;height:44px;flex:none}
.tgc .tgn{display:flex;flex-direction:column;min-width:0;line-height:1.12}
.tgc .tgn b{font-family:'Noto Sans SC',sans-serif;font-size:1rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tgc .tgn i{font-style:normal;font-size:.66rem;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tgc .tgn span{font-size:.66rem;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tgc .tgty{display:flex;min-width:0;overflow:hidden;white-space:nowrap}.tgc .type{font-size:.56rem!important;padding:0 4px!important}
.tgc .types{flex-wrap:nowrap}
.tgcv{flex:1 1 0;min-height:0;width:100%;border-radius:10px}
.tggo{flex:none;height:62px;padding:4px 8px!important}
.tgpl{display:flex;flex-direction:column;gap:8px}
#bBtns button.fbone{grid-column:1/-1;height:136px!important;font-size:1.25rem!important}
#bBtns button.fbwide{grid-column:1/-1}
.hpbox.fbon{outline:2px solid var(--accent);outline-offset:1px}
#blog .tgcue{margin-right:6px}#blog .fbcue{display:flex;align-items:center;gap:4px;flex-wrap:wrap}`;
const sty=document.createElement('style');sty.textContent=css;document.head.appendChild(sty);
const sh=document.createElement('div');sh.className='sheet';sh.id='sTog';sh.hidden=true;
sh.innerHTML=`<div class="inner"><div class="row"><h2 id="tgTitle"></h2><button class="small" id="tgClose">Close${zw('关闭','guānbì')}</button></div><div id="tgBody" style="display:contents"></div></div>`;
document.body.appendChild(sh);
const body=()=>document.getElementById('tgBody');
let TR=null; // the trade in progress
document.getElementById('tgClose').onclick=()=>{if(TR&&TR.busy)return;TR=null;close('sTog')};
// the "Play together" buttons on the Who's playing sheet
const ents=document.createElement('div');ents.className='tgents';ents.id='tgEnts';
ents.innerHTML=`<button class="small" id="tgTrade">${en('trade')}${zl('trade')}</button><button class="small" id="tgBattle">${en('battle')}${zl('battle')}</button>`;
{const wl=document.getElementById('whoList');if(wl)wl.after(ents)}
document.getElementById('tgTrade').onclick=()=>choose(startTrade);
document.getElementById('tgBattle').onclick=()=>choose(startFriendly);
const r0=renderWho;renderWho=function(){const r=r0.apply(this,arguments);try{ents.hidden=PL.list.length<2}catch(e){}return r};
try{ents.hidden=PL.list.length<2}catch(e){}
// with more than two players, first pick who to play with
function choose(fn){const o=others();if(!o.length)return;if(o.length===1)return fn(o[0].id);
  document.getElementById('tgTitle').innerHTML=en('who')+zl('who');const b=body();b.innerHTML='<div class="tgpl"></div>';
  for(const x of o){const d=document.createElement('div');d.className='card who';d.innerHTML=`<div class="wpic">${pic(x)}</div><div class="info"><div class="nm">${escH(playerName(x))}</div><div class="sub">${playerSummary(x)}</div></div>`;
    const g=document.createElement('button');g.className='small big';g.textContent='Pick';g.onclick=()=>fn(x.id);d.appendChild(g);b.firstChild.appendChild(d)}
  close('sWho');open('sTog')}
// the field waits while this sheet is open
const so=sheetOpen;sheetOpen=function(){return so.apply(this,arguments)||(!sh.hidden?'sTog':null)};

// ---------- trading ----------
async function startTrade(oid){const ox=PL.list.find(x=>x.id===oid);if(!ox||oid===PID)return;
  const G=await loadOther(oid);
  if(!G||!G.col.length){toast(`${playerName(ox)} has no creatures yet`);return}
  if(S.col.length<2||G.col.length<2){toast(`${S.col.length<2?playerName():playerName(ox)} has only one creature`);return}
  flush();
  TR={ox,G,me:curPlayer(),pick:[null,null],side:0,page:[0,0],busy:false};LOG('trade_open',{with:oid});
  close('sWho');document.getElementById('tgTitle').innerHTML=en('trade')+zl('trade');
  body().innerHTML=`<div class="tgpair"><button class="tgslot" data-s="0"></button><div class="tgarrow">⇄</div><button class="tgslot" data-s="1"></button></div>
    <div class="tgask"><div class="tgline" id="tgLine"></div><button class="small" id="tgPrev">◀</button><button class="small" id="tgNext">▶</button></div>
    <div class="tggrid" id="tgGrid"></div><button class="big tggo" id="tgGo" disabled>${en('ask')}${zl('ask')}</button>`;
  body().querySelectorAll('.tgslot').forEach(b=>b.onclick=()=>{if(TR.busy)return;TR.side=+b.dataset.s;renderTrade(true)});
  document.getElementById('tgPrev').onclick=()=>{TR.page[TR.side]--;renderTrade()};
  document.getElementById('tgNext').onclick=()=>{TR.page[TR.side]++;renderTrade()};
  document.getElementById('tgGo').onclick=doTrade;
  open('sTog');renderTrade(true)}
const tcol=s=>s?TR.G.col:S.col,tpl=s=>s?TR.ox:TR.me;
function renderTrade(announce){if(!TR||TR.busy)return;const s=TR.side,col=tcol(s),pages=Math.ceil(col.length/6);TR.page[s]=Math.max(0,Math.min(pages-1,TR.page[s]));
  body().querySelectorAll('.tgslot').forEach(b=>{const i=+b.dataset.s,x=tpl(i),c=TR.pick[i];b.classList.toggle('on',i===s);
    b.innerHTML=`${c?'<canvas></canvas>':''}<span class="tgsl"><span class="tgwho">${pic(x)} ${escH(playerName(x))}</span>${c?`<span class="tgsel" data-say="${ZS(SP[c.sp].n).zh}">${ZS(SP[c.sp].n).zh||SP[c.sp].n}<i>Lv ${c.lvl}</i></span>`:'<span class="tgsel">?</span>'}</span>`;
    if(c)drawMini(b.querySelector('canvas'),c.sp,c.shiny)});
  const x=tpl(s),other=tpl(1-s),cue=x.young&&!other.young;
  document.getElementById('tgLine').innerHTML=`${cue?`<span class="tgcue">Read to ${escH(playerName(x))}</span>`:`<span>${pic(x)}</span>`}${en('pick')}${zl('pick')}`;
  document.getElementById('tgPrev').hidden=document.getElementById('tgNext').hidden=pages<2;
  document.getElementById('tgPrev').disabled=TR.page[s]<=0;document.getElementById('tgNext').disabled=TR.page[s]>=pages-1;
  const gr=document.getElementById('tgGrid');gr.innerHTML='';
  col.slice(TR.page[s]*6,TR.page[s]*6+6).forEach(c=>{const z=ZS(SP[c.sp].n),b=document.createElement('button');b.className='tgc'+(TR.pick[s]===c?' sel':'');b.dataset.say=z.zh;
    b.innerHTML=`<span class="tgtop"><canvas></canvas><span class="tgn"><b>${z.zh||SP[c.sp].n}</b><i>${z.py}</i><span>${SP[c.sp].n} · Lv ${c.lvl}</span></span></span><span class="tgty">${tyChips(c.sp)}</span>`;
    b.onclick=()=>{if(TR.busy)return;TR.pick[s]=c;sfx('tap');if(!TR.pick[1-s]){TR.side=1-s;renderTrade(true)}else renderTrade()};gr.appendChild(b);drawMini(b.querySelector('canvas'),c.sp,c.shiny)});
  document.getElementById('tgGo').disabled=!(TR.pick[0]&&TR.pick[1]);
  if(announce&&x.young)say2(L.pick.zh)}
// both saves change together, before the animation starts, so closing the app mid-animation never loses a creature
function commitTrade(){const G=TR.G,a=TR.pick[0],b=TR.pick[1];if(!a||!b||S.col.length<2||G.col.length<2)return false;
  const ia=S.col.indexOf(a),ib=G.col.indexOf(b);if(ia<0||ib<0)return false;
  const keepS=JSON.stringify(S.col),keepG=JSON.stringify(G),sNext=S.nextId;
  fixIds(S);fixIds(G);
  const toG=JSON.parse(JSON.stringify(a)),toS=JSON.parse(JSON.stringify(b));toG.id=G.nextId++;toS.id=S.nextId++;
  S.col.splice(ia,1);G.col.splice(ib,1);S.col.push(toS);G.col.push(toG);
  S.caught=S.caught||[];if(!S.caught.includes(toS.sp))S.caught.push(toS.sp);G.caught=G.caught||[];if(!G.caught.includes(toG.sp))G.caught.push(toG.sp);
  try{writeOther(TR.ox.id,G);S.savedAt=Date.now();localStorage.setItem(keyOf(PID),JSON.stringify(S))}
  catch(e){S.col=JSON.parse(keepS);S.nextId=sNext;try{localStorage.setItem(keyOf(TR.ox.id),keepG)}catch(x){}toast('Could not save the trade');return false}
  flush();TR.got=[toS,toG];
  LOG('trade',{a:PID,b:TR.ox.id,gave:`${SP[a.sp].n} L${a.lvl}`,got:`${SP[b.sp].n} L${b.lvl}`,aCount:S.col.length,bCount:G.col.length});
  return true}
async function doTrade(){if(!TR||TR.busy||!TR.pick[0]||!TR.pick[1])return;const a=TR.pick[0],b=TR.pick[1],X=TR.me,Y=TR.ox;
  if(!commitTrade())return;TR.busy=true;const my=TR;
  const gr=document.getElementById('tgGrid'),cv=document.createElement('canvas');cv.className='tgcv';gr.replaceWith(cv);
  document.getElementById('tgPrev').hidden=document.getElementById('tgNext').hidden=true;
  const go=document.getElementById('tgGo');go.disabled=true;
  const line=(x,k)=>{const el=document.getElementById('tgLine');if(el)el.innerHTML=`<span>${pic(x)} ${escH(playerName(x))}</span>${en(k)}${zl(k)}`};
  const anim={t0:null,a:a.sp,b:b.sp,as:a.shiny,bs:b.shiny};let live=true;
  const loop=()=>{if(!live||!cv.isConnected)return;requestAnimationFrame(loop);tradeFrame(cv,anim)};loop();
  line(X,'ask');await Promise.all([say2(L.ask.zh),sleep(1100)]);if(TR!==my)return;
  line(Y,'ok');await Promise.all([say2(L.ok.zh),sleep(900)]);if(TR!==my)return;
  line(X,'give');anim.t0=performance.now()/1000;sfx('giant');const sp=say2(L.give.zh);await Promise.all([sp,sleep(1900)]);if(TR!==my)return;
  sfx('win');line(Y,'thanks');await Promise.all([say2(L.thanks.zh),sleep(900)]);if(TR!==my)return;
  go.innerHTML=en('done')+zl('done');go.disabled=false;go.onclick=()=>{live=false;TR=null;close('sTog');renderWho();updateUI()};TR.busy=false}
// two creatures swap places along crossing arcs, trailing stars, then a burst of hearts
function tradeFrame(cv,A){const {w,h,d}=sizeCanvas(cv),x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);const t=performance.now()/1000;
  const g=x.createRadialGradient(w/2,h*.55,10,w/2,h*.55,Math.max(w,h)*.7);g.addColorStop(0,'#3b2f4f');g.addColorStop(1,'#141019');x.fillStyle=g;x.fillRect(0,0,w,h);
  for(let i=0;i<24;i++){const q=(i*.618+t*.05)%1,yy=(i*.37)%1;x.globalAlpha=.25+.25*Math.sin(t*2+i);x.fillStyle='#ffe8b0';x.beginPath();x.arc(q*w,yy*h,1.2+(i%3)*.6,0,7);x.fill()}x.globalAlpha=1;
  const k=A.t0==null?0:Math.min(1,(t-A.t0)/1.6),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,s=Math.min(w*.2,h*.26),lx=w*.22,rx=w*.78,by=h*.78;
  const pos=(from,to,up)=>[from+(to-from)*e,by-Math.sin(e*Math.PI)*h*(up?.42:.12)];
  const [ax,ay]=pos(lx,rx,true),[bx,byy]=pos(rx,lx,false);
  if(A.t0!=null&&k<1)for(let i=0;i<10;i++){const kk=Math.max(0,e-i*.03);for(const [f,tt,up,col] of[[lx,rx,true,'#ffd76a'],[rx,lx,false,'#9fe3ff']]){const px=f+(tt-f)*kk,py=by-Math.sin(kk*Math.PI)*h*(up?.42:.12)-s*.5;x.globalAlpha=(1-i/10)*.8;x.fillStyle=col;star(x,px,py,4*(1-i/12))}}x.globalAlpha=1;
  for(const [sx,sy] of[[ax,ay],[bx,byy]]){x.save();x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(sx,by+2,s*.45,s*.1,0,0,7);x.fill();x.restore()}
  dc(x,A.b,bx,byy,fitS(s*1.4,s*1.4,A.b,.9),t,{awake:true,shiny:A.bs,flip:e<.5});
  dc(x,A.a,ax,ay,fitS(s*1.4,s*1.4,A.a,.9),t,{awake:true,shiny:A.as,flip:e>=.5});
  if(A.t0!=null&&k>=1){const q=Math.min(1,(t-A.t0-1.6)/1.2);if(q<1)for(let i=0;i<14;i++){const an=i/14*Math.PI*2,r=q*Math.min(w,h)*.42;x.globalAlpha=1-q;x.fillStyle=i%2?'#ff7aa8':'#ffd76a';heart(x,w/2+Math.cos(an)*r,h*.5+Math.sin(an)*r*.7,7)}x.globalAlpha=1}}
function star(x,cx,cy,r){x.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill()}
function heart(x,cx,cy,r){x.beginPath();x.moveTo(cx,cy+r*.9);x.bezierCurveTo(cx-r*1.4,cy-r*.2,cx-r*.6,cy-r*1.2,cx,cy-r*.4);x.bezierCurveTo(cx+r*.6,cy-r*1.2,cx+r*1.4,cy-r*.2,cx,cy+r*.9);x.fill()}

// ---------- friendly battle ----------
// This device's player (bottom, their real lead creatures) against the other player (top, copies of their lead creatures).
// Damage is a share of the target's HP, so a big kid's high levels don't flatten a little kid; no XP, no items, nobody keeps the damage.
let FB=null;
const yo=window.isYoung;window.isYoung=()=>FB&&FB.yNow!=null?FB.yNow:yo();
// a battle cut off by a reload or a closed app: put the HP back and drop the backup
function fixFb(){if(FB||!S)return;let ch=false;if(S.fbHp){for(const c of S.col)if(S.fbHp[c.id]!=null)c.hp=S.fbHp[c.id];delete S.fbHp;ch=true}if(S.fbTr){S.tr=S.fbTr;delete S.fbTr;ch=true}return ch}
const rs=restore;restore=function(){fixFb();return rs.apply(this,arguments)};
if(fixFb()){try{save()}catch(e){}}
const sw=switchPlayer;switchPlayer=function(id){if(FB)fbCleanup(FB,null,true);return sw.apply(this,arguments)};
const side=k=>FB.sides[k==='p'?0:1];
async function startFriendly(oid){const ox=PL.list.find(x=>x.id===oid);if(!ox||oid===PID||B||C)return;
  const G=await loadOther(oid);if(!G||!G.col.length){toast(`${playerName(ox)} has no creatures yet`);return}if(!S.col.length)return;
  const me=curPlayer(),hn=Math.min(3,party().length),gteam=G.col.slice(0,3).map(c=>{const k=JSON.parse(JSON.stringify(c));k.hp=stats(k).maxhp;return k});
  FB={G,ox,me,yNow:null,turn:0,turns:0,sides:[{k:'p',x:me,n:hn,pm:0,pused:false},{k:'f',x:ox,n:gteam.length,pm:0,pused:false}],tr:G.tr||{}};
  S.fbHp={};for(const c of party().slice(0,hn)){S.fbHp[c.id]=c.hp;c.hp=stats(c).maxhp}S.fbTr=S.tr||{};save();
  LOG('friendly_start',{with:oid,me:party().slice(0,hn).map(c=>`${SP[c.sp].n} L${c.lvl}`).join(', '),them:gteam.map(c=>`${SP[c.sp].n} L${c.lvl}`).join(', ')});
  B={friendly:true,foes:gteam,fi:0,pi:0,pm:0,pt:0,pused:false,ft:0,busy:true,hitP:-9,hitF:-9,lungeP:-9,lungeF:-9};
  document.querySelectorAll('.sheet').forEach(x=>{if(x.id!=='sBattle')x.hidden=true});
  open('sBattle');requestAnimationFrame(battleLoop);
  const my=B;fbRender();
  document.getElementById('blog').innerHTML=`${pic(me)} ${en('match')}${zl('match')}`;await Promise.all([say2(L.match.zh),sleep(1200)]);if(B!==my)return;
  document.getElementById('blog').innerHTML=`${pic(ox)} ${en('ok')}${zl('ok')}`;await Promise.all([say2(L.ok.zh),sleep(900)]);if(B!==my)return;
  turnStart()}
const actor=()=>FB.sides[FB.turn],mon=k=>k==='p'?party()[B.pi]:B.foes[B.fi];
function fbRender(){if(!B||!FB)return;const foe=mon('f'),me=mon('p'),fs=stats(foe),ms=stats(me),a=actor(),busy=B.busy;
  const left=(k)=>{const s=side(k),i=k==='p'?B.pi:B.fi;return '●'.repeat(s.n-i)+'○'.repeat(i)};
  document.getElementById('fName').innerHTML=`<span>${pic(FB.ox)}</span> `+nmB(foe.sp,true);document.getElementById('fLv').textContent=`Lv ${foe.lvl} · ${tyEn(foe.sp)} · ${left('f')}`;fitLv('fLv');
  document.getElementById('fBar').style.width=(foe.hp/fs.maxhp*100)+'%';document.getElementById('fTitan').textContent=B.ft?'GIANT':'';
  document.getElementById('pName').innerHTML=`<span>${pic(FB.me)}</span> `+nmB(me.sp,true);document.getElementById('pHp').textContent=`Lv ${me.lvl} · HP ${me.hp}/${ms.maxhp} · ${left('p')}`;
  document.getElementById('pBar').style.width=(me.hp/ms.maxhp*100)+'%';document.getElementById('pTitan').textContent=B.pt?'GIANT':'';
  const boxes=document.querySelectorAll('#sBattle .hpbox');boxes[0].classList.toggle('fbon',a.k==='f'&&!FB.over);boxes[1].classList.toggle('fbon',a.k==='p'&&!FB.over);
  const t=document.getElementById('bTitle');t.textContent=FB.over?`${pic(FB.me)} ${playerName(FB.me)} · ${pic(FB.ox)} ${playerName(FB.ox)}`:`${pic(a.x)} ${playerName(a.x)}'s turn`;fitText(t,11);
  const bb=document.getElementById('bBtns');bb.innerHTML='';if(FB.over)return;
  const c=mon(a.k),sp=SP[c.sp],gt=a.k==='p'?B.pt:B.ft,gp=gt?'Giant ':'';
  const mv=(label,cls,fn,dis)=>{const b=document.createElement('button');b.className=cls;b.innerHTML=label;b.disabled=busy||!!dis;b.onclick=fn;bb.appendChild(b);return b};
  const mvl=t=>`${gp}${MOVES[t]}${zw(ZM(MOVES[t]).zh,ZM(MOVES[t]).py)}`;
  // a little kid gets one big move button (its name is spoken on tap)
  if(a.x.young){mv(mvl(sp.t),'big fbone',()=>fbTurn(1));return}
  mv(mvl(sp.t),'big',()=>fbTurn(1));
  if(sp.t2)mv(mvl(sp.t2),'big',()=>fbTurn(2));else mv(`${gp}Bonk${zw(ZM('Bonk').zh,ZM('Bonk').py)}`,'',()=>fbTurn(0));
  mv(a.pused?(gt?`Giant: ${gt} turns left`:'Giant used'):`Go Giant ${'●'.repeat(a.pm)}${'○'.repeat(3-a.pm)}`+zw('巨大化','jùdà huà'),'hot fbwide',fbGiant,a.pused||a.pm<3)}
// whose turn it is; on a little kid's turn the big kid gets the line to say to them
function turnStart(){if(!B||!FB)return;const a=actor(),o=FB.sides[1-FB.turn];B.busy=false;fbRender();
  const bl=document.getElementById('blog');
  if(a.x.young){bl.innerHTML=`<span class="fbcue">${!o.x.young?`<span class="tgcue">Say to ${escH(playerName(a.x))}</span>`:pic(a.x)}${en('turn')}${zl('turn',true)}</span>`;say2(L.turn.zh)}
  else bl.innerHTML=`${pic(a.x)} ${escH(playerName(a.x))}, ${en('turn').toLowerCase()}${zl('turn')}`}
// the acting player traces with their own progress and their own little-kid setting
async function fbTrace(kind,purpose){const a=actor(),guest=a.k==='f',qe=questEv,sv=save;FB.yNow=!!a.x.young;
  if(guest){S.tr=FB.tr;questEv=()=>{};save=()=>{}}
  let r={ok:true,mistakes:1,skipped:true};try{r=await window.traceChar(kind,{purpose})}catch(e){}
  if(guest){FB.tr=S.tr;S.tr=S.fbTr;questEv=qe;save=sv}FB.yNow=null;return r||{skipped:true}}
async function fbGiant(){const a=actor();if(!B||B.busy||a.pused||a.pm<3)return;B.busy=true;fbRender();const my=B;
  if(S.trace!==false&&window.traceChar){await fbTrace('giant','giant');if(B!==my)return}
  a.pused=true;if(a.k==='p')B.pt=3;else B.ft=3;B.grow={side:a.k,t0:T};sfx('giant');LOG('giant',{side:a.k,friendly:true});fbRender();await sleep(1500);if(B!==my)return;
  {const c=mon(a.k),z=ZS(SP[c.sp].n);await say(`${SP[c.sp].n} grew GIANT!`,z.zh+ZB+W.giant[1],z.py+' '+W.giant[2],true)}
  B.busy=false;fbRender()}
async function fbTurn(mi){if(!B||!FB||B.busy)return;const a=actor(),o=FB.sides[1-FB.turn],my=B;B.busy=true;fbRender();
  let crit=false;if(S.trace!==false&&window.traceChar){const c=mon(a.k),s=SP[c.sp],r=await fbTrace(mi===2?s.t2:mi?s.t:'normal','move');if(B!==my)return;crit=!r.skipped&&r.mistakes===0}
  if(!a.pused)a.pm=Math.min(3,a.pm+1);
  const att=mon(a.k),def=mon(o.k);FB.turns++;
  await fbAttack(att,def,mi,a,o,crit);if(B!==my)return;
  if(a.k==='p'&&B.pt)B.pt--;if(a.k==='f'&&B.ft)B.ft--;
  if(def.hp<=0){sfx('faint');LOG('faint',{side:o.k,sp:SP[def.sp].n,friendly:true});{const z=ZS(SP[def.sp].n);await say(`${SP[def.sp].n} fainted!`,z.zh+ZB+W.fainted[1],z.py+' '+W.fainted[2],true)}if(B!==my)return;
    if((o.k==='p'?B.pi:B.fi)+1>=o.n)return endFriendly(a);
    if(o.k==='p'){B.pi++;B.pt=0}else{B.fi++;B.ft=0}
    const nx=mon(o.k);fbRender();await say(`${playerName(o.x)} sends out ${SP[nx.sp].n}!`);if(B!==my)return}
  FB.turn=1-FB.turn;turnStart()}
async function fbAttack(a,d,mi,A,O,crit){const as=SP[a.sp],ds=SP[d.sp],D=stats(d),sd=A.k;
  const gA=sd==='p'?B.pt>0:B.ft>0,gD=sd==='p'?B.ft>0:B.pt>0,mt=mi===2?as.t2:mi?as.t:null,e=mt?effOn(mt,d.sp):1;
  // a little kid's creatures take a little less from a big kid's, and hit a little harder
  const hc=O.x.young&&!A.x.young?.7:A.x.young&&!O.x.young?1.2:1;
  const dmg=Math.max(1,Math.round(D.maxhp*(mi?.36:.24)*e*R(.85,1)*(crit?1.5:1)*(gA?1.6:1)*(gD?.7:1)*hc));
  const atype=mt||'normal';B.anim={type:atype,side:sd,t0:T,dur:.42};
  if(sd==='p'){B.lungeP=T;setTimeout(()=>B&&(B.hitF=T),420)}else{B.lungeF=T;setTimeout(()=>B&&(B.hitP=T),420)}
  sfx(e>1||gA?'super':'attack');await sleep(430);if(!B)return;B.imp={type:atype,side:sd,t0:T,crit};const hpB=d.hp;d.hp=Math.max(0,d.hp-dmg);
  LOG('attack',{side:sd,friendly:true,att:as.n,def:ds.n,move:mt?MOVES[mt]:'Bonk',eff:e,dmg,defHp:`${hpB}->${d.hp}/${D.maxhp}`});
  B.fx=B.fx||[];B.fx.push({x:sd==='p'?.72:.28,y:sd==='p'?.25:.6,txt:'-'+dmg,t0:T,col:e>1?'#ffc93d':e<1?'#a7b0d6':'#ffffff',big:e>1||gA});fbRender();
  const ac=ZA(atype),ml=moveLine(a.sp,atype);
  await say(`${crit?'Critical hit! ':''}${gA?'Giant ':''}${as.n} ${ac.en}!${e>1?' It hit super hard!':e<1?' It barely hurt.':''}`,`${crit?'暴击！':''}${ml[0]}${e>1?W.super[1]:e<1?W.weak[1]:''}`,`${crit?'bàojī! ':''}${ml[1]}${e>1?' '+W.super[2]:e<1?' '+W.weak[2]:''}`,true)}
// the end: HP goes back to what it was, the other player keeps any characters they traced, no XP or items change hands
async function endFriendly(winner,quiet){const f=FB;if(!f)return;const my=B;
  if(!quiet&&winner&&!f.over){f.over=true;sfx('win');fbRender();const bl=document.getElementById('blog');
    bl.innerHTML=`${pic(winner.x)} ${escH(playerName(winner.x))} wins!${zl('win')}`;await Promise.all([say2(L.win.zh),sleep(1300)]);
    if(FB===f&&B===my){bl.innerHTML=`${en('gg')}${zl('gg')}`;await Promise.all([say2(L.gg.zh),sleep(1100)])}}
  fbCleanup(f,winner,quiet)}
function fbCleanup(f,winner,quiet){if(!f||f.cleaned)return;f.cleaned=true;
  for(const c of S.col)if(S.fbHp&&S.fbHp[c.id]!=null)c.hp=S.fbHp[c.id];delete S.fbHp;if(S.fbTr){S.tr=S.fbTr;delete S.fbTr}
  if(f.tr&&JSON.stringify(f.tr)!==JSON.stringify(f.G.tr||{})){try{const G=readOther(f.ox.id)||f.G;G.tr=f.tr;writeOther(f.ox.id,G)}catch(e){}}
  S.friendly=(S.friendly||0)+1;
  LOG('friendly_end',{with:f.ox.id,winner:winner?winner.x.id:'',turns:f.turns,quiet:!!quiet});
  if(FB===f){FB=null;B=null;try{closeSayCard&&closeSayCard()}catch(e){}close('sBattle');document.querySelectorAll('#sBattle .hpbox').forEach(x=>x.classList.remove('fbon'))}
  save();updateUI()}
window.TOGETHER={startTrade,startFriendly,commitTrade,get trade(){return TR},get battle(){return FB},readOther};
})();
