// ---------- Things to read: letters, notes, book and magazine pages lying around while you stay ----------
// Graded reader: each word shows characters, pinyin under them and English under that. The whole piece is narrated aloud,
// sentence by sentence, with the current sentence highlighted. Reading a piece the first time gives its items.
(function(){
if(typeof READINGS==='undefined')window.READINGS=[];
const KIND={letter:['Letter','信','xìn','✉️'],note:['Note','纸条','zhǐtiáo','📝'],postcard:['Postcard','明信片','míngxìnpiàn','🏞️'],book:['Book','书','shū','📖'],
  magazine:['Magazine','杂志','zázhì','📰'],newspaper:['Newspaper','报纸','bàozhǐ','🗞️'],poster:['Poster','海报','hǎibào','📌'],diary:['Diary','日记','rìjì','📔'],guide:['Field guide','图鉴','tújiàn','🔎']};
const css=`#sRead .inner{gap:12px;height:100%}
.paper{flex:1 1 0;min-height:0;overflow:hidden;position:relative;background:#f6f0e3;color:#2b2420;border-radius:14px;padding:16px 14px 18px;box-shadow:0 10px 40px rgba(0,0,0,.45),inset 0 0 0 1px rgba(120,90,50,.18);background-image:linear-gradient(rgba(255,255,255,.5),rgba(255,255,255,0) 40%)}
.paper.k-newspaper{background-color:#eeebe4;background-image:none}.paper.k-guide{background-color:#eef3ea}.paper.k-poster{background-color:#fbefd9}.paper.k-diary{background-color:#f3ecf6}
.paper .ptitle{display:flex;flex-direction:column;align-items:center;gap:2px;border-bottom:1px solid rgba(80,60,30,.18);padding-bottom:10px;margin-bottom:6px;text-align:center}
.paper .ptitle b{font-family:'Noto Sans SC',sans-serif;font-size:1.35rem;letter-spacing:.04em}.paper .ptitle i{font-style:normal;color:#8a6d4a;font-size:.8rem}.paper .ptitle span{color:#7a7268;font-size:.74rem}
.paper .pfrom{font-size:.78rem;color:#7a7268;margin:4px 0 2px}
.sent{display:flex;flex-wrap:wrap;align-items:flex-start;gap:2px 1px;padding:7px 6px;border-radius:10px;margin:2px -6px;transition:background .25s}
.sent.now{background:rgba(216,168,106,.28)}
.tok{display:inline-flex;flex-direction:column;align-items:center;padding:1px 3px;border-radius:6px;cursor:pointer;min-width:1.2em}
.tok:active{background:rgba(0,0,0,.08)}
.tok b{font-family:'Noto Sans SC',sans-serif;font-size:1.32rem;font-weight:500;line-height:1.2}
.tok i{font-style:normal;font-size:.68rem;color:#8a5a2b;line-height:1.15}
.tok u{text-decoration:none;font-size:.6rem;color:#7a7268;line-height:1.15;max-width:6.5em;text-align:center}
.tok.p{cursor:default;min-width:0;padding:1px 0}.tok.p b{color:#6b5a48}
.paper .off{display:none!important}
.readbtns{display:flex;gap:8px;flex:none}.readbtns button{flex:1 1 0;min-width:0}.readbtns #rdPrev{flex:0 0 auto;padding-left:16px;padding-right:16px}
.rdlib{grid-column:1/-1;display:flex;flex-direction:column;gap:6px}
.rdlib button{display:flex;align-items:center;gap:10px;text-align:left;padding:8px 10px}
.rdlib button span.k{font-size:1.2rem}.rdlib button b{font-family:'Noto Sans SC',sans-serif;font-weight:500}.rdlib button small{color:var(--muted);display:block}`;
const sty=document.createElement('style');sty.textContent=css;document.head.appendChild(sty);
const sh=document.createElement('div');sh.className='sheet';sh.id='sRead';sh.hidden=true;
sh.innerHTML=`<div class="inner"><div class="row"><h2 id="rdKind"></h2><button class="small" id="rdClose">Close<span class="zh" data-say="关闭">关闭<i>guānbì</i></span></button></div>
  <div class="paper" id="rdPaper"></div>
  <div class="readbtns"><button id="rdPrev" aria-label="Back" hidden>‹</button><button id="rdPlay">▶ Read to me<span class="zh" data-say="读给我听">读给我听<i>dú gěi wǒ tīng</i></span></button><button id="rdNext" class="primary" hidden>Next ›<span class="zh" data-say="继续">继续<i>jìxù</i></span></button><button id="rdDone" class="primary">Done<span class="zh" data-say="读完了">读完了<i>dú wán le</i></span></button></div></div>`;
document.body.appendChild(sh);
const $=id=>document.getElementById(id);
const isP=t=>t.length===1;
const sentZh=l=>l.w.map(t=>t[0]).join('');
let cur=null,tok=0,page=0,npages=1;
function stopRead(){tok++;try{stopSpeech()}catch(e){}document.querySelectorAll('#rdPaper .sent.now').forEach(x=>x.classList.remove('now'))}
// A long piece is split into pages that fit the screen (no scrolling): Next turns the page, and Done is on the last one.
function paginate(){const paper=$('rdPaper'),bl=[...paper.children];bl.forEach(b=>b.classList.remove('off'));
  const cs=getComputedStyle(paper),H=paper.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);let pg=0,top=null;
  for(const b of bl){if(top==null)top=b.offsetTop;if(b.offsetTop+b.offsetHeight-top>H+1&&b!==bl[0]&&b.offsetTop>top){pg++;top=b.offsetTop}b.dataset.pg=pg}
  npages=pg+1;showPage(Math.min(page,pg))}
function showPage(n){page=Math.max(0,Math.min(n,npages-1));for(const b of $('rdPaper').children)b.classList.toggle('off',+b.dataset.pg!==page);
  const last=page>=npages-1;$('rdDone').hidden=!last;$('rdNext').hidden=last;$('rdPrev').hidden=page===0}
function turnTo(n){if(n<0||n>=npages)return;showPage(n);const first=$('rdPaper').querySelector(`.sent[data-pg="${page}"]`);if(first)narrate(+first.dataset.i);else stopRead()}
async function narrate(from){const my=++tok;try{stopSpeech()}catch(e){}tok=my;const ss=[...document.querySelectorAll('#rdPaper .sent')];
  for(let i=from||0;i<ss.length;i++){if(tok!==my||sh.hidden)return;if(+ss[i].dataset.pg!==page)showPage(+ss[i].dataset.pg);ss.forEach(x=>x.classList.toggle('now',x===ss[i]));
    const t0=performance.now();try{await (window.speakAsync?speakAsync(ss[i].dataset.zh):Promise.resolve())}catch(e){}
    const spent=performance.now()-t0;await new Promise(r=>setTimeout(r,Math.max(450,900-spent)));} // a short pause between sentences; longer if the line had no audio
  if(tok===my)ss.forEach(x=>x.classList.remove('now'))}
function openReading(id,opts){const r=READINGS.find(x=>x.id===id);if(!r)return;cur={r,fresh:!(S.read||{})[id]};const k=KIND[r.kind]||KIND.note;
  $('rdKind').innerHTML=`${k[3]} ${k[0]}`+zw(k[1],k[2]);
  const T3=r.title||['','',''];let h=`<div class="ptitle"><b data-say="${T3[0]}">${T3[0]}</b><i>${T3[1]}</i><span>${T3[2]}</span></div>`;
  if(r.to)h+=`<div class="pfrom">To · ${r.to[0]} ${r.to[1]} (${r.to[2]})</div>`;
  h+=r.lines.map((l,i)=>`<div class="sent" data-i="${i}" data-zh="${sentZh(l).replace(/"/g,'')}">`+l.w.map(t=>isP(t)?`<span class="tok p"><b>${t[0]}</b></span>`:`<span class="tok" data-w="${t[0]}"><b>${t[0]}</b><i>${t[1]}</i><u>${t[2]}</u></span>`).join('')+`</div>`).join('');
  if(r.from)h+=`<div class="pfrom" style="text-align:right">From · ${r.from[0]} ${r.from[1]} (${r.from[2]})</div>`;
  $('rdPaper').className='paper k-'+r.kind;$('rdPaper').innerHTML=h;
  $('rdDone').innerHTML=(cur.fresh&&r.reward?`Done · ${rwTxt(r.reward)}`:'Done')+zw('读完了','dú wán le');
  try{for(const l of r.lines)preloadZh(sentZh(l))}catch(e){}
  sh.hidden=false;sh.scrollTop=0;page=0;paginate();try{LOG('read_open',{id,fresh:cur.fresh})}catch(e){}
  setTimeout(()=>narrate(0),350)}
addEventListener('resize',()=>{if(!sh.hidden&&cur)paginate()});
try{document.fonts&&document.fonts.ready.then(()=>{if(!sh.hidden&&cur)paginate()})}catch(e){}
$('rdPaper').addEventListener('click',e=>{const t=e.target.closest('.tok');if(t&&t.dataset.w){e.stopPropagation();stopRead();speak(t.dataset.w);return}
  const s=e.target.closest('.sent');if(s)narrate(+s.dataset.i)});
$('rdPlay').onclick=()=>{const first=$('rdPaper').querySelector(`.sent[data-pg="${page}"]`);narrate(first?+first.dataset.i:0)};
$('rdNext').onclick=()=>turnTo(page+1);$('rdPrev').onclick=()=>turnTo(page-1);
function closeReading(){stopRead();sh.hidden=true;cur=null;try{lastIdle=T}catch(e){}updateUI()}
$('rdClose').onclick=closeReading;
$('rdDone').onclick=()=>{if(!cur)return closeReading();const {r,fresh}=cur;S.read=S.read||{};
  if(fresh){S.read[r.id]=1;if(r.reward){give(r.reward);sfx('quest');toast(`You got ${rwTxt(r.reward)}.`)}try{LOG('read_done',{id:r.id})}catch(e){}save()}closeReading()};
window.openReading=openReading;
// ---- papers lying around in the scene ----
let paper=null,nextAt=null;
function placeTag(){const p=PLACES[S.place];if(p.rift)return['rift'];return[p.region==='California'?p.n:'home',p.key,p.n,p.region].filter(Boolean)}
function pickReading(){const read=S.read||{},nRead=Object.keys(read).length,tags=placeTag();
  const ok=r=>(r.level||1)<=(window.isYoung&&isYoung()?1:nRead>=10?3:nRead>=4?2:1)&&(!r.place||tags.includes(r.place))&&(!r.chapter||((S.story&&S.story.ch)||0)>=r.chapter);
  let pool=READINGS.filter(r=>ok(r)&&!read[r.id]);
  const local=pool.filter(r=>r.place&&tags.includes(r.place));if(local.length&&Math.random()<.6)pool=local;
  // stories come in order
  pool=pool.filter(r=>!/^bedtime_(\d+)$/.test(r.id)||+r.id.split('_')[1]===1||read['bedtime_'+(+r.id.split('_')[1]-1)]);
  if(!pool.length)pool=READINGS.filter(ok);if(!pool.length)return null;
  // variety: avoid the same kind of paper (letter, guide, newspaper…) as last time when there's a choice
  const other=pool.filter(r=>r.kind!==S.lastReadKind);if(other.length)pool=other;
  return pool[Math.floor(Math.random()*pool.length)]}
window.Reader={
  frame(ctx,w,h){if(S.mode!=='staying'){paper=null;nextAt=null;return}if(nextAt==null)nextAt=T+9;
    if(!paper&&T>nextAt&&!sheetOpen()){const r=pickReading();if(r){S.lastReadKind=r.kind;const left=Math.random()<.5;paper={id:r.id,kind:r.kind,x:left?.09+Math.random()*.12:.79+Math.random()*.12,y:.8+Math.random()*.05,t0:T};try{LOG('paper_appear',{id:r.id})}catch(e){}}nextAt=T+75}
    if(!paper)return;const x=paper.x*w,y=paper.y*h,s=h*.068,k=Math.min(1,(T-paper.t0)*2),bob=Math.sin(T*2.2)*s*.08;
    ctx.save();ctx.translate(x,y+bob);ctx.globalAlpha=k;
    // soft glow + shadow
    const g=ctx.createRadialGradient(0,0,s*.2,0,0,s*1.9);g.addColorStop(0,'rgba(255,236,190,.55)');g.addColorStop(1,'rgba(255,236,190,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,s*1.9,0,7);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,s*.75,s*1.1,s*.22,0,0,7);ctx.fill();
    ctx.rotate(-.12);drawPaper(ctx,paper.kind,s);ctx.restore();
    for(let i=0;i<3;i++){const a=T*1.6+i*2.1,rr=s*1.4;ctx.globalAlpha=k*(.5+.5*Math.sin(T*3+i));ctx.fillStyle='#fff3c4';ctx.beginPath();ctx.arc(x+Math.cos(a)*rr,y+bob+Math.sin(a)*rr*.5-s*.3,1.8,0,7);ctx.fill()}
    ctx.globalAlpha=1;
    // little label like the creatures have
    const lab='读一读',lab2='dú yi dú';ctx.font=`700 ${Math.max(10,h*.032)}px 'Noto Sans SC',sans-serif`;const tw=Math.max(ctx.measureText(lab).width,ctx.measureText(lab2).width*.85),lh=h*.042;
    const lx=paper.x<.5?x+s*1.25+tw/2+7:x-s*1.25-tw/2-7,ly=y-lh*.9; // label beside the paper, toward the middle
    ctx.fillStyle='rgba(16,18,22,.66)';ctx.beginPath();ctx.roundRect(lx-tw/2-7,ly,tw+14,lh*1.85,6);ctx.fill();ctx.strokeStyle='rgba(255,231,176,.35)';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#ffe7b0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lab,lx,ly+lh*.55);
    ctx.font=`600 ${Math.max(9,h*.027)}px Manrope,sans-serif`;ctx.fillStyle='rgba(255,255,255,.82)';ctx.fillText(lab2,lx,ly+lh*1.35)},
  tap(x,y){if(!paper)return false;if(Math.hypot(x-paper.x,(y-paper.y)*.75)<.1){const id=paper.id;paper=null;nextAt=T+75;sfx('tap');openReading(id);return true}return false},
  get paper(){return paper},drop(id){const r=READINGS.find(x=>x.id===id)||READINGS[0];if(r)paper={id:r.id,kind:r.kind,x:.14,y:.82,t0:T-1}}
};
function drawPaper(ctx,kind,s){const W=s*1.5,H=s*1.1;ctx.lineJoin='round';
  const card=(c1,c2)=>{const gr=ctx.createLinearGradient(0,-H/2,0,H/2);gr.addColorStop(0,c1);gr.addColorStop(1,c2);ctx.fillStyle=gr;ctx.beginPath();ctx.roundRect(-W/2,-H/2,W,H,s*.08);ctx.fill();ctx.strokeStyle='rgba(60,40,20,.35)';ctx.lineWidth=1;ctx.stroke()};
  const lines=(n,x0,x1,y0,dy,col)=>{ctx.strokeStyle=col;ctx.lineWidth=Math.max(1,s*.05);for(let i=0;i<n;i++){ctx.beginPath();ctx.moveTo(x0,y0+i*dy);ctx.lineTo(x1-(i===n-1?(x1-x0)*.35:0),y0+i*dy);ctx.stroke()}};
  if(kind==='letter'||kind==='postcard'){card('#fbf4e4','#eadcbf');ctx.strokeStyle='rgba(120,90,50,.55)';ctx.lineWidth=Math.max(1,s*.05);ctx.beginPath();ctx.moveTo(-W/2,-H/2);ctx.lineTo(0,H*.08);ctx.lineTo(W/2,-H/2);ctx.stroke();
    if(kind==='letter'){ctx.fillStyle='#c0392b';ctx.beginPath();ctx.arc(0,H*.08,s*.16,0,7);ctx.fill()}else{ctx.fillStyle='#4a90c8';ctx.fillRect(W*.22,-H*.38,W*.2,H*.3)}}
  else if(kind==='book'||kind==='diary'||kind==='guide'){const c=kind==='book'?['#7a4fa0','#4d2f6b']:kind==='diary'?['#d9779b','#a74b6f']:['#4f9a6b','#2f6b47'];
    ctx.fillStyle='#f3ead6';ctx.beginPath();ctx.roundRect(-W/2+s*.06,-H/2+s*.06,W,H,s*.08);ctx.fill();card(c[0],c[1]);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(-W/2+s*.12,-H/2,s*.08,H);
    ctx.strokeStyle='rgba(255,230,180,.85)';ctx.lineWidth=Math.max(1,s*.05);ctx.strokeRect(-W*.18,-H*.22,W*.5,H*.3)}
  else if(kind==='newspaper'||kind==='magazine'){card(kind==='newspaper'?'#efece4':'#fff5f0',kind==='newspaper'?'#d8d3c6':'#f1d6cc');
    ctx.fillStyle=kind==='newspaper'?'#3a3530':'#d0573e';ctx.fillRect(-W*.42,-H*.38,W*.84,H*.16);lines(3,-W*.42,W*.05,-H*.05,H*.17,'rgba(60,50,40,.45)');ctx.fillStyle=kind==='newspaper'?'#9aa3ad':'#f2b24c';ctx.fillRect(W*.12,-H*.1,W*.3,H*.4)}
  else{card(kind==='poster'?'#ffe8b8':'#fffaf0',kind==='poster'?'#f1c776':'#ece2cf');lines(3,-W*.36,W*.36,-H*.2,H*.2,'rgba(80,60,40,.45)');if(kind==='poster'){ctx.fillStyle='#d9604d';ctx.beginPath();ctx.arc(0,-H*.5,s*.1,0,7);ctx.fill()}}}
// ---- library on the Learn screen ----
window.readingLibraryHTML=function(){const read=S.read||{},got=READINGS.filter(r=>read[r.id]);
  return {n:got.length,total:READINGS.length,html:got.map(r=>{const k=KIND[r.kind]||KIND.note;return `<button class="small" data-read="${r.id}"><span class="k">${k[3]}</span><span><b>${r.title[0]}</b> <small>${r.title[1]} · ${r.title[2]}</small></span></button>`}).join('')}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-read]');if(b){openReading(b.dataset.read)}});
})();
