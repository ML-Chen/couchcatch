// ---------- Speaking practice: audio-first moments, Pimsleur-style lessons, and conversations with gentle recasts ----------
(function(){
const css=`.talkopts .mic{grid-column:1/-1;border-style:dashed!important}.talkopts .mic.on{animation:micpulse 1s ease-in-out infinite}.talkopts .mic.good{border-style:solid!important;border-color:var(--moss,#6fae8a)!important}
@keyframes micpulse{0%,100%{box-shadow:0 0 0 0 rgba(217,96,77,.35)}50%{box-shadow:0 0 0 10px rgba(217,96,77,0)}}

.saycard{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));width:min(440px,calc(100% - 24px));z-index:45;
  background:linear-gradient(180deg,rgba(38,51,95,.97),rgba(25,34,68,.97));border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:12px 14px;box-shadow:0 16px 40px rgba(0,0,0,.45);
  display:flex;gap:12px;align-items:center}
.saycard .pic{font-size:2.2rem;line-height:1;flex:none}
.saycard .body{flex:1;min-width:0}
.saycard .cue{font-family:var(--display);font-weight:600;font-size:1rem}
.saycard .cuezh{font-family:'Noto Sans SC',sans-serif;font-size:1.35rem;font-weight:700;margin-top:2px}
.saycard .cuepy{font-size:.9rem;opacity:.85}
.saycard .row2{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.saycard button{font-size:.85rem;padding:7px 10px;border-radius:10px}
.ring{width:42px;height:42px;border-radius:50%;flex:none;display:grid;place-items:center;font-family:var(--display);font-weight:700;font-size:.8rem;
  background:conic-gradient(var(--accent) var(--p,0%),rgba(255,255,255,.12) 0);position:relative}
.ring::after{content:'';position:absolute;inset:5px;border-radius:50%;background:#1d2850}
.ring span{position:relative;z-index:1}
.talk .inner{height:100%;gap:8px}
.talkhead{display:flex;gap:10px;align-items:center}
.bubrow{display:flex;gap:6px;align-items:flex-end;align-self:flex-start;max-width:92%}.bubrow .bub{max-width:none}
.mini-person{width:30px;height:30px;flex:none;border-radius:50%}
canvas.avatar.person{width:64px;height:64px;border:none !important;background:none !important}
.avatar{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;font-size:1.8rem;background:radial-gradient(circle at 35% 30%,#3f5aa8,#1d2850);border:2px solid rgba(255,255,255,.2);flex:none}
.talklog{flex:1 1 0;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 2px}
.bub{max-width:85%;padding:9px 12px;border-radius:16px;cursor:pointer}
.bub.npc{align-self:flex-start;background:#2c3a6a;border-bottom-left-radius:4px}
.bub.you{align-self:flex-end;background:linear-gradient(180deg,#3fc6a3,#23977c);color:#062a20;border-bottom-right-radius:4px}
.bub.fix{align-self:flex-start;background:#4a3a7a;border-bottom-left-radius:4px}
.bub .z{font-family:'Noto Sans SC',sans-serif;font-size:1.15rem;font-weight:700}
.bub .p{font-size:.85rem;opacity:.85}
.bub .e{font-size:.78rem;opacity:.7;margin-top:2px}
.lvl-2 .bub .e,.lvl-3 .bub .e{display:none}.lvl-2 .bub.show .e,.lvl-3 .bub.show .e{display:block}
.lvl-3 .bub .p{display:none}.lvl-3 .bub.show .p{display:block}
.talkpanel{display:flex;flex-direction:column;gap:8px}
.talkcue{background:var(--panel);border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:center}
.talkcue .c{flex:1;font-family:var(--display);font-weight:600}
.talkopts{display:flex;flex-direction:column;gap:6px}
.talkopts button{text-align:left;padding:9px 12px}
.talkopts button .z{font-family:'Noto Sans SC',sans-serif;font-size:1.1rem;font-weight:700}
.talkopts button .p{font-size:.85rem;opacity:.85;font-family:var(--body)}
.lesson .stage{flex:1 1 0;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center}
.lesson .bigpic{font-size:4rem;line-height:1}
.lesson .bigzh{font-family:'Noto Sans SC',sans-serif;font-size:2.4rem;font-weight:700}
.lesson .bigpy{font-size:1.2rem;opacity:.9}
.lesson .bigen{font-family:var(--display);font-size:1.3rem}
.lesson .step{font-size:.85rem;color:var(--muted)}
.lesson .ring{width:64px;height:64px;font-size:1rem}
.lesson .ring::after{inset:7px}
.knock{position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:5;animation:pulse 1.1s ease-in-out infinite}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

// ---------- audio helpers ----------
const norm=s=>String(s).replace(/[\s，。！？、…!?,.·:：；;"“”'‘’()（）「」\-—]/g,'');
let NIDX=null;
function nidx(){if(NIDX)return NIDX;NIDX={};if(typeof ZH_AUDIO!=='undefined')for(const k in ZH_AUDIO)NIDX[norm(k)]=k;return NIDX}
function clip(s){if(typeof ZH_AUDIO==='undefined')return null;const k=nidx()[norm(s)];return k?ZH_AUDIO[k]:null}
// the text's clauses, split at punctuation ("我很好！你呢？" -> ["我很好", "你呢"])
const clauses=text=>String(text).split(/[，。！？、…!?,.·:：；;「」]+/).filter(x=>norm(x));
// split text into the fewest known clips: the whole line if it was recorded as one clip, else clause by clause, else word by word
function pieces(text){if(clip(text))return[String(text)];const out=[];for(const part of clauses(text)){
  if(clip(part)){out.push(part);continue}const p=norm(part);let i=0;
  while(i<p.length){let f=null;for(let j=p.length;j>i;j--){if(clip(p.slice(i,j))){f=p.slice(i,j);break}}if(f){out.push(f);i+=f.length}else{out.push(null);i++}}}return out}
let tok=0,cur=null,AC=null,live=[];const BUF={};
function ac(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}catch(e){return null}}
function keyOf(s){const k=nidx()[norm(s)];return k||null}
// where the speech in a clip starts and ends (seconds), ignoring quiet padding; cached on the buffer
function trim(b){if(b._tr)return b._tr;try{const d=b.getChannelData(0),n=d.length,sr=b.sampleRate,win=Math.max(1,Math.round(sr*.01));let pk=0;for(let i=0;i<n;i+=4){const v=Math.abs(d[i]);if(v>pk)pk=v}
  const th=Math.max(.008,pk*.06),loud=i=>{let m=0;for(let j=i;j<Math.min(n,i+win);j+=2){const v=Math.abs(d[j]);if(v>m)m=v}return m>th};
  let a=0;while(a<n&&!loud(a))a+=win;let z=n-win;while(z>a&&!loud(z))z-=win;const st=Math.max(0,a/sr-.035),en=Math.min(b.duration,(z+win)/sr+.06);b._tr=en>st+.05?[st,en]:[0,b.duration]}catch(e){b._tr=[0,b.duration]}return b._tr}
async function buf(k){if(BUF[k]){touch(k);return BUF[k]}const c=ac();if(!c)return null;const uri=ZH_AUDIO[k],bin=atob(uri.slice(uri.indexOf(',')+1)),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
  BUF[k]=await new Promise((r,j)=>c.decodeAudioData(u8.buffer,r,j));touch(k);return BUF[k]}
// decode every clip in the background after the first tap, so speech starts instantly later
// Decode clips on demand and keep only a small cache of decoded audio (every clip decoded at once would take hundreds of MB on a phone).
const LRU=[],LRU_MAX=48;function touch(k){const i=LRU.indexOf(k);if(i>=0)LRU.splice(i,1);LRU.push(k);while(LRU.length>LRU_MAX){const old=LRU.shift();delete BUF[old]}}
let warmed=false;function warm(){if(warmed||typeof ZH_AUDIO==='undefined')return;warmed=true;try{for(const s of ['你好','太棒了','野生的'])preloadZh(s)}catch(e){}}
// decode the clips a line will need, ahead of time (used for the next lines of a conversation or a reading)
window.preloadZh=function(text){try{if(typeof ZH_AUDIO==='undefined'||!ac())return;for(const p of pieces(text)){if(!p)continue;const k=keyOf(p);if(k&&!BUF[k])buf(k).catch(()=>{})}}catch(e){}};
document.addEventListener('pointerdown',()=>{ac();warm()},{passive:true});
function stopAll(){for(const s of live){try{s.stop()}catch(e){}}live=[];try{cur&&cur.pause()}catch(e){};try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}
window.stopSpeech=()=>{tok++;stopAll()};
window.speakAsync=function(zh){return new Promise(async res=>{try{
  if(!zh||S.zhVoice===false){setTimeout(res,250);return}
  const my=++tok;stopAll();const ps=pieces(zh),known=ps.filter(Boolean),whole=ps.length===1&&known.length===1;
  // every clause has its own whole recording (e.g. "火，火山"): play them one after another with a natural pause
  const byClause=!whole&&clauses(zh).every(c=>clip(c));
  const dev=window.speechSynthesis&&typeof zhVoice!=='undefined'&&zhVoice;
  // recordings play as is; only lines that would need word-by-word stitching go to the device's Chinese voice (fluent, but robotic)
  if(!whole&&!byClause&&dev){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(zh);u.lang='zh-CN';u.voice=zhVoice;u.rate=.85;let fin=false;const end=()=>{if(fin)return;fin=true;res()};u.onend=end;u.onerror=end;speechSynthesis.speak(u);setTimeout(end,900+zh.length*330);return}catch(e){}}
  if(!known.length||ps.some(x=>!x)){ // no recording: browser voice if it has one
    try{if(window.speechSynthesis&&typeof zhVoice!=='undefined'&&zhVoice){const u=new SpeechSynthesisUtterance(zh);u.lang='zh-CN';u.voice=zhVoice;u.rate=.85;u.onend=()=>res();u.onerror=()=>res();speechSynthesis.speak(u);setTimeout(res,600+zh.length*320);return}}catch(e){}
    setTimeout(res,300);return} // never play half a sentence: wait for its recording instead
  const c=ac();
  if(c){const bufs=[];for(const k of known){const kk=keyOf(k);if(!kk)continue;try{bufs.push(await buf(kk))}catch(e){}if(my!==tok){res();return}}
    // stitched pieces: cut each clip's leading/trailing silence and fade the joins, so the words flow instead of stopping after each one
    let t0=c.currentTime+.02;const many=bufs.length>1;for(const b of bufs){const [st,en]=many?trim(b):[0,b.duration],dur=Math.max(.05,en-st);
      const s=c.createBufferSource();s.buffer=b;const g=c.createGain();s.connect(g);g.connect(c.destination);
      if(many){g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(1,t0+.012);g.gain.setValueAtTime(1,t0+dur-.02);g.gain.linearRampToValueAtTime(0,t0+dur)}
      s.start(t0,st,dur);live.push(s);t0+=dur+(byClause?.16:many?.03:.04)}
    const ms=(t0-c.currentTime)*1000;setTimeout(()=>{if(my===tok)live=[];res()},ms+40);return}
  // last resort: HTML audio, one after another
  let i=0;const next=()=>{if(my!==tok||i>=known.length){res();return}const a=new Audio(clip(known[i++]));cur=a;let d=false;const go=()=>{if(d)return;d=true;next()};a.onended=go;a.onerror=go;setTimeout(go,4500);const pr=a.play();if(pr&&pr.catch)pr.catch(go)};next()}catch(e){res()}})};
// how a line will sound: 'whole' (one recording), 'clauses' (one recording per clause), or 'device' (device voice / word stitching); used by the tests
window.zhPlan=function(zh){const ps=pieces(zh),whole=ps.length===1&&!!ps[0];return whole?'whole':clauses(zh).every(c=>clip(c))?'clauses':'device'};
// make the old speak() use the new player too
window.speak=function(zh){speakAsync(zh)};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function ring(el,secs){return new Promise(res=>{const t0=performance.now(),D=secs*1000;let stop=false;el._skip=()=>{stop=true};
  const f=()=>{const k=Math.min(1,(performance.now()-t0)/D);el.style.setProperty('--p',(k*100)+'%');const s=el.querySelector('span');if(s)s.textContent=Math.ceil(secs*(1-k))||'';if(k>=1||stop){res();return}requestAnimationFrame(f)};f()})}
const Z=(zh,py)=>zw(zh,py);
// ---------- listening (browser speech recognition, where available) ----------
const SRC=window.SpeechRecognition||window.webkitSpeechRecognition;let srBroken=false;
window.canListen=()=>!!SRC&&!srBroken&&S.listen!==false;
const nz=t=>String(t||'').replace(/[\s，。！？、…!?,.·:：；;“”"'「」]/g,'');
function lcs(a,b){const m=a.length,n=b.length;if(!m||!n)return 0;const d=new Array(n+1).fill(0);for(let i=1;i<=m;i++){let prev=0;for(let j=1;j<=n;j++){const t=d[j];d[j]=a[i-1]===b[j-1]?prev+1:Math.max(d[j],d[j-1]);prev=t}}return d[n]}
// how well a heard sentence matches a target (0..1): shared characters in order, relative to the longer one
window.zhMatch=(heard,target)=>{const a=nz(heard),b=nz(target);if(!a||!b)return 0;return lcs(a,b)/Math.max(a.length,b.length)};
// listen once in Mandarin; resolves with the recognizer's alternatives ([] if nothing was heard, null if listening isn't possible)
function listenZh(onStart){return new Promise(res=>{if(!SRC||srBroken){res(null);return}let done=false;const fin=v=>{if(done)return;done=true;try{r.abort()}catch(e){}res(v)};
  let r;try{r=new SRC();r.lang='zh-CN';r.interimResults=false;r.maxAlternatives=5;r.continuous=false}catch(e){srBroken=true;res(null);return}
  r.onstart=()=>{onStart&&onStart()};
  r.onresult=e=>{const out=[];for(const res0 of e.results)for(let k=0;k<res0.length;k++)out.push(res0[k].transcript);fin(out)};
  r.onerror=e=>{if(/not-allowed|service-not-allowed|audio-capture|network|language-not-supported/.test(e.error)){srBroken=true;fin(null)}else fin([])};
  r.onend=()=>fin([]);try{stopSpeech()}catch(e){}try{r.start()}catch(e){srBroken=true;fin(null)}setTimeout(()=>fin([]),8000)})}
window.listenZh=listenZh;

// ---------- phrase memory (graduated interval recall) ----------
const GAPS=[25e3,120e3,600e3,3600e3,5*3600e3,86400e3,5*86400e3];
function pst(zh){S.ph=S.ph||{};return S.ph[zh]||(S.ph[zh]={n:0,due:0,intro:false})}
function heard(zh,good=true){const v=pst(zh);v.n++;v.intro=true;v.lvl=Math.max(0,Math.min(GAPS.length-1,(v.lvl||0)+(good?1:-1)));v.due=Date.now()+GAPS[v.lvl];v.last=Date.now()}
// little kids practise only the shortest everyday phrases (units 1–3: hello, me, I want)
const PB=()=>{const all=typeof PHRASEBOOK!=='undefined'?PHRASEBOOK:[];return window.isYoung&&isYoung()?all.filter(p=>p.unit<=3&&p.zh.replace(/[，。！？]/g,'').length<=5):all};
function nextNew(){return PB().find(p=>!pst(p.zh).intro)}
function dueList(){const now=Date.now();return PB().filter(p=>pst(p.zh).intro&&pst(p.zh).due<=now).sort((a,b)=>pst(a.zh).due-pst(b.zh).due)}

// ---------- quick in-game speaking moment (non-blocking banner) ----------
let card=null;
window.sayMoment=function(ctx,onSaid){try{
  if(S.sayMoments===false)return;const pool=(typeof MOMENTS!=='undefined'&&MOMENTS[ctx])||[];
  const cands=PB().filter(p=>pool.includes(p.zh));if(!cands.length)return;
  const p=cands.find(x=>pst(x.zh).intro&&pst(x.zh).due<=Date.now())||cands.find(x=>!pst(x.zh).intro)||cands[Math.floor(Math.random()*cands.length)];
  closeCard();card=document.createElement('div');card.className='saycard';
  card.innerHTML=`<div class="pic">${p.pic||'💬'}</div><div class="body"><div class="cue">Say: “${p.en}”</div><div class="reveal" hidden><div class="cuezh" data-say="${p.zh}">${p.zh}</div><div class="cuepy">${p.py}</div></div>
    <div class="row2"><button class="big" data-a="said">I said it!${Z('说了！','shuō le!')}</button><button data-a="hear">Hear it${Z('听一听','tīng yi tīng')}</button><button data-a="x">✕</button></div></div><div class="ring"><span></span></div>`;
  document.body.appendChild(card);const my=card,rg=card.querySelector('.ring');
  (async()=>{await ring(rg,2.6);if(card!==my)return;my.querySelector('.reveal').hidden=false;rg.style.visibility='hidden';await speakAsync(p.zh);await wait(1400);if(card!==my)return;await speakAsync(p.zh)})();
  card.onclick=e=>{const a=e.target.closest('button')?.dataset.a;if(!a)return;if(a==='hear'){my.querySelector('.reveal').hidden=false;speakAsync(p.zh)}
    else if(a==='said'){heard(p.zh,true);LOG('say',{zh:p.zh,ctx});questEv('words');sfx('quest');save();onSaid&&onSaid(p);closeCard()}else closeCard()};
  clearTimeout(window._cardT);window._cardT=setTimeout(()=>{if(card===my)closeCard()},14000);
}catch(e){console.error(e)}};
function closeCard(){if(card){card.remove();card=null}}
window.closeSayCard=closeCard;

// ---------- Pimsleur-style Speak lesson ----------
let lessonEl=null;
function lessonSheet(){if(lessonEl)return lessonEl;lessonEl=document.createElement('div');lessonEl.className='sheet lesson';lessonEl.hidden=true;
  lessonEl.innerHTML=`<div class="inner" style="height:100%;gap:10px"><div class="row"><h2>Speak${Z('说中文','shuō Zhōngwén')}</h2><button class="small" data-a="quit">Stop${Z('停','tíng')}</button></div>
  <div class="step" id="lsStep"></div><div class="stage" id="lsStage"></div><div class="row2" id="lsBtns" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"></div></div>`;
  document.body.appendChild(lessonEl);return lessonEl}
window.runLesson=async function(){const el=lessonSheet();el.hidden=false;let quit=false;el.querySelector('[data-a=quit]').onclick=()=>{quit=true;tok++;el.hidden=true};
  const stage=el.querySelector('#lsStage'),step=el.querySelector('#lsStep'),btns=el.querySelector('#lsBtns');
  const show=(html)=>{stage.innerHTML=html};
  const pause=async(secs,label)=>{show(stage.innerHTML+`<div class="ring"><span></span></div><div class="step">${label}</div>`);await ring(stage.querySelector('.ring'),secs)};
  const plan=[];const nw=[nextNew(),null].filter(Boolean);const due=dueList();
  // session: new phrase, then recalls mixed with a recall of the new phrase a little later (graduated interval recall)
  if(nw[0])plan.push({p:nw[0],kind:'new'});for(const d of due.slice(0,3))plan.push({p:d,kind:'recall'});
  const nw2=PB().find(p=>!pst(p.zh).intro&&p!==nw[0]);if(nw2&&plan.length<4)plan.push({p:nw2,kind:'new'});
  if(nw[0])plan.push({p:nw[0],kind:'recall'});if(nw2&&plan.some(x=>x.p===nw2))plan.push({p:nw2,kind:'recall'});
  if(!plan.length)for(const p of PB().slice(0,4))plan.push({p,kind:'recall'});
  let said=0;
  for(let i=0;i<plan.length&&!quit;i++){const {p,kind}=plan[i];step.textContent=`${i+1} / ${plan.length}`;btns.innerHTML='';
    if(kind==='new'){
      show(`<div class="bigpic">${p.pic||'💬'}</div><div class="bigen">Listen: “${p.en}”</div>`);await wait(500);if(quit)break;
      show(`<div class="bigpic">${p.pic||'💬'}</div><div class="bigen">“${p.en}”</div><div class="bigzh">${p.zh}</div><div class="bigpy">${p.py}</div>`);await speakAsync(p.zh);await wait(700);await speakAsync(p.zh);
      for(const [bz,bp] of (p.build||[])){if(quit)break;show(`<div class="step">Build it up, one piece at a time</div><div class="bigzh">${bz}</div><div class="bigpy">${bp}</div>`);await speakAsync(bz);await pause(2.2,'Say it! 说一说');}
      if(quit)break;show(`<div class="bigpic">${p.pic||'💬'}</div><div class="bigen">Now say the whole thing in Chinese: “${p.en}”</div>`);await pause(3,'Say it in Chinese! 用中文说');
      show(`<div class="bigpic">${p.pic||'💬'}</div><div class="bigzh">${p.zh}</div><div class="bigpy">${p.py}</div>`);await speakAsync(p.zh);await pause(2.4,'Say it again! 再说一次');await speakAsync(p.zh);heard(p.zh,true);said++}
    else{
      show(`<div class="bigpic">${p.pic||'💬'}</div><div class="bigen">How do you say “${p.en}” in Chinese?</div><div class="step">用中文怎么说？ yòng Zhōngwén zěnme shuō?</div>`);await pause(3.6,'Say it in Chinese! 用中文说');if(quit)break;
      show(`<div class="bigpic">${p.pic||'💬'}</div><div class="bigzh">${p.zh}</div><div class="bigpy">${p.py}</div><div class="step">${p.en}</div>`);await speakAsync(p.zh);await pause(2.4,'Say it again! 再说一次');await speakAsync(p.zh);
      const ok=await new Promise(r=>{btns.innerHTML='';const a=document.createElement('button');a.className='big';a.innerHTML='I got it'+Z('我会了','wǒ huì le');a.onclick=()=>r(true);const b=document.createElement('button');b.innerHTML='Not yet'+Z('再来','zài lái');b.onclick=()=>r(false);btns.append(a,b)});
      heard(p.zh,ok);if(ok)said++}
    save()}
  if(!quit){const rw={orb:3+said*2};if(said>=4)rw.great=1;give(rw);save();show(`<div class="bigpic">🌟</div><div class="bigzh">太棒了！</div><div class="bigpy">tài bàng le!</div><div class="bigen">You said ${said} phrases. You got ${rwTxt(rw)}.</div>`);
    speakAsync('太棒了！');btns.innerHTML='';const d=document.createElement('button');d.className='big';d.style.gridColumn='1/-1';d.innerHTML='Done'+Z('好的','hǎo de');d.onclick=()=>{el.hidden=true;if(typeof renderLearn==='function')renderLearn();updateUI()};btns.append(d);LOG('lesson',{said,n:plan.length})}
};

// ---------- conversations with gentle recasts ----------
let talkEl=null,curP=null,curPhone=false;
const ROLE_PIC={'phone':'📱','gym leader':'🏅','reporter':'🎤','host':'📺','neighbor':'🏡','agent':'🛫','ranger':'🌲','cashier':'🌮','barista':'☕','traveler':'✨','friend':'🧒','kid':'👧','classmate':'🎒','tourist':'🗺️'};
// ---------- drawn people (original characters) for every conversation ----------
const SK=['#f6d7bf','#eec5a2','#e2b08a','#c98f66','#a8714c','#7d5235'];
const PEOPLE={
 intro_neighbor:{skin:1,hair:'#2a2422',style:'curly',shirt:'#5f8f6e',acc:'apron',age:'adult',bg:'#3b5a49'},
 gym_backyard:{skin:2,hair:'#6b4128',style:'ponytail',hat:'cap',hatc:'#c8463c',shirt:'#2f8f8a',acc:'whistle',bg:'#2d5b57'},
 gym_lakeshore:{skin:3,hair:'#cfcac2',style:'short',beard:'beard',hat:'captain',shirt:'#24395f',bg:'#24395f',male:1},
 gym_quarry:{skin:4,hair:'#231a17',style:'short',hat:'hardhat',hatc:'#f0b52b',shirt:'#e07b2f',bg:'#6b4a2f'},
 gym_pineridge:{skin:1,hair:'#7a4b2a',style:'short',beard:'beard',hat:'ranger',shirt:'#3f6b4a',bg:'#2f4e3d',male:1},
 gym_stormpier:{skin:2,hair:'#8a5bd6',style:'spiky',shirt:'#f2c94c',acc:'raincoat',bg:'#3c4560'},
 gym_ashhills:{skin:5,hair:'#141010',style:'short',hat:'bandana',hatc:'#c0392b',shirt:'#2b2626',bg:'#4a2525',male:1},
 gym_starveil:{skin:0,hair:'#cbbcff',style:'hood',hatc:'#4a2d8c',shirt:'#3a2470',bg:'#231646',glow:1},
 gym_sandiego:{skin:2,hair:'#e3c068',style:'long',acc:'sunglasses',shirt:'#1fa3a8',bg:'#1f6f8b',male:1},
 gym_losangeles:{skin:3,hair:'#1d1716',style:'bob',hat:'beret',hatc:'#222',shirt:'#f4efe6',acc:'scarf',accc:'#d94a3d',bg:'#7a4c3a'},
 gym_sanfrancisco:{skin:1,hair:'#1b1514',style:'bun',acc:'goggles',shirt:'#3d6fb0',bg:'#4b5f73'},
 gym_yosemite:{skin:4,hair:'#3a2a20',style:'short',hat:'ranger',glasses:1,shirt:'#5b7a3a',bg:'#3d5a33',male:1},
 airport:{skin:1,hair:'#2a2020',style:'bun',hat:'pillbox',hatc:'#1f4f8f',shirt:'#1f4f8f',acc:'scarf',accc:'#e9b44c',bg:'#2b4566'},
 arrive_sandiego:{skin:3,hair:'#1a1412',style:'short',hat:'cap',hatc:'#e08a2e',shirt:'#c0392b',acc:'apron',bg:'#7a4a2a',male:1},
 arrive_losangeles:{skin:4,hair:'#3a241a',style:'long',acc:'sunglasses',shirt:'#e86a8a',bg:'#8a4a5a'},
 arrive_sanfrancisco:{skin:1,hair:'#5a3a2a',style:'bob',hat:'beanie',hatc:'#2f4f6f',shirt:'#e9e2d4',acc:'apron',accc:'#6b4b35',bg:'#4b3a30'},
 arrive_yosemite:{skin:2,hair:'#2b1d18',style:'ponytail',hat:'ranger',shirt:'#5b7a3a',bg:'#3d5a33'},
 arrive_starveil:{skin:0,hair:'#e6dcff',style:'hood',hatc:'#5a3da8',shirt:'#3a2470',bg:'#231646',glow:1},
 host:{skin:1,hair:'#2a1d1a',style:'long',acc:'mic',shirt:'#d94a6a',bg:'#5a2a4a'},
 host2:{skin:3,hair:'#1a1412',style:'short',acc:'mic',shirt:'#3a7bd5',bg:'#2a3f6a',male:1},
 grandma:{skin:1,hair:'#d9d6d2',style:'bun',glasses:1,shirt:'#8a5ba8',age:'elder',bg:'#4a3a5a'},
 grandpa:{skin:2,hair:'#d0ccc6',style:'short',glasses:1,beard:'mustache',shirt:'#8a6a4a',age:'elder',bg:'#4a3d30',male:1},
 mom:{skin:1,hair:'#1f1715',style:'long',shirt:'#e07a5f',bg:'#5a3a32'},
 kid:{skin:1,hair:'#2a1d18',style:'pigtails',shirt:'#f2c94c',age:'kid',bg:'#3d5a7a'},
 kid2:{skin:3,hair:'#1a1412',style:'short',shirt:'#5fb37a',age:'kid',bg:'#2f5a4a',male:1},
 adult:{skin:2,hair:'#3a2a20',style:'short',shirt:'#6a7f9a',bg:'#3a4656',male:1},
 adult2:{skin:4,hair:'#1f1715',style:'curly',shirt:'#c0784a',bg:'#5a3a2a'},
};
function personFor(key,who){const k=String(key||'');if(PEOPLE[k])return PEOPLE[k];
  if(k.startsWith('interview_'))return +k.slice(10)%2?PEOPLE.host:PEOPLE.host2;if(k.startsWith('airport'))return PEOPLE.airport;
  if(k.includes('grandma'))return PEOPLE.grandma;if(k.includes('grandpa'))return PEOPLE.grandpa;if(k==='phone_mom')return PEOPLE.mom;if(k==='phone_coach')return PEOPLE.gym_backyard;if(k==='phone_friend')return PEOPLE.kid;if(k==='phone_wrong')return PEOPLE.adult;
  const r=String(who&&who.role||'').toLowerCase();if(/kid|friend|classmate/.test(r))return k.length%2?PEOPLE.kid:PEOPLE.kid2;return k.length%2?PEOPLE.adult:PEOPLE.adult2}
function drawPerson(cv,P,phone){try{const d=devicePixelRatio||1,S=cv.clientWidth||64;cv.width=S*d;cv.height=S*d;const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);
  if(P&&P.kind==='star'){const g=c.createRadialGradient(S/2,S/2,2,S/2,S/2,S*.7);g.addColorStop(0,'#3a2c7a');g.addColorStop(1,P.bg||'#1c1446');c.fillStyle=g;c.fillRect(0,0,S,S);if(window.drawLittleStar)drawLittleStar(c,S/2,S*.53,S*.3,performance.now()/1000,true);return}
  const u=S/100,skin=SK[P.skin||0],kid=P.age==='kid',elder=P.age==='elder';const E=(x,y,rx,ry,f,r=0)=>{c.beginPath();c.ellipse(x*u,y*u,rx*u,ry*u,r,0,7);c.fillStyle=f;c.fill()};
  // backdrop
  const bg=c.createRadialGradient(40*u,30*u,5*u,50*u,50*u,60*u);bg.addColorStop(0,'rgba(255,255,255,.18)');bg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=P.bg||'#334';c.beginPath();c.arc(50*u,50*u,50*u,0,7);c.fill();c.fillStyle=bg;c.fill();
  c.save();c.beginPath();c.arc(50*u,50*u,50*u,0,7);c.clip();
  if(P.glow){const g=c.createRadialGradient(50*u,45*u,2,50*u,45*u,45*u);g.addColorStop(0,'rgba(200,180,255,.5)');g.addColorStop(1,'rgba(200,180,255,0)');c.fillStyle=g;c.fillRect(0,0,S,S)}
  const hy=kid?44:42,hr=kid?24:21;
  // hair behind the head
  if(P.style==='long'){E(50,hy+12,hr+4,hr+16,P.hair)}
  if(P.style==='ponytail'){E(50+hr+2,hy+4,7,16,P.hair,.4)}
  if(P.style==='pigtails'){E(50-hr-4,hy+8,7,10,P.hair);E(50+hr+4,hy+8,7,10,P.hair)}
  if(P.style==='hood'){E(50,hy+4,hr+9,hr+12,P.hatc)}
  // shoulders + clothes
  c.fillStyle=P.shirt;c.beginPath();c.moveTo(14*u,100*u);c.quadraticCurveTo(16*u,72*u,50*u,70*u);c.quadraticCurveTo(84*u,72*u,86*u,100*u);c.closePath();c.fill();
  if(P.acc==='apron'){c.fillStyle=P.accc||'#e8e1d2';c.fillRect(36*u,76*u,28*u,30*u);c.strokeStyle='rgba(0,0,0,.15)';c.beginPath();c.moveTo(38*u,76*u);c.lineTo(44*u,68*u);c.moveTo(62*u,76*u);c.lineTo(56*u,68*u);c.stroke()}
  if(P.acc==='raincoat'){c.fillStyle='rgba(0,0,0,.12)';c.fillRect(48*u,72*u,4*u,30*u)}
  if(P.acc==='scarf'){c.fillStyle=P.accc||'#d94a3d';c.beginPath();c.ellipse(50*u,70*u,15*u,5*u,0,0,7);c.fill();c.fillRect(52*u,70*u,6*u,16*u)}
  if(P.acc==='whistle'){c.strokeStyle='#ddd';c.lineWidth=1.2*u;c.beginPath();c.moveTo(42*u,70*u);c.lineTo(50*u,84*u);c.lineTo(58*u,70*u);c.stroke();E(50,86,3.5,2.5,'#c9ccd2')}
  // neck + head
  E(50,hy+hr-2,8,10,skin);const hg=c.createRadialGradient((50-6)*u,(hy-8)*u,2*u,50*u,hy*u,hr*1.1*u);hg.addColorStop(0,'rgba(255,255,255,.25)');hg.addColorStop(1,'rgba(0,0,0,.08)');
  E(50-hr+1,hy+3,4,6,skin);E(50+hr-1,hy+3,4,6,skin);E(50,hy,hr,hr*1.04,skin);c.fillStyle=hg;c.beginPath();c.ellipse(50*u,hy*u,hr*u,hr*1.04*u,0,0,7);c.fill();
  // hair on top / fringe
  const fringe=()=>{c.fillStyle=P.hair;c.beginPath();c.ellipse(50*u,(hy-hr*.45)*u,(hr+1.5)*u,(hr*.72)*u,0,Math.PI,0);c.fill();c.beginPath();c.moveTo((50-hr)*u,(hy-hr*.4)*u);c.quadraticCurveTo((50-hr*.2)*u,(hy-hr*.05)*u,(50+hr*.15)*u,(hy-hr*.55)*u);c.quadraticCurveTo((50+hr*.6)*u,(hy-hr*.1)*u,(50+hr)*u,(hy-hr*.4)*u);c.lineTo((50+hr)*u,(hy-hr*.7)*u);c.lineTo((50-hr)*u,(hy-hr*.7)*u);c.fill()};
  if(P.style==='curly'){for(let i=0;i<9;i++){const a=Math.PI+i/8*Math.PI;E(50+Math.cos(a)*hr*.95,hy-hr*.25+Math.sin(a)*hr*.9,6.5,6.5,P.hair)}}
  else if(P.style==='spiky'){c.fillStyle=P.hair;c.beginPath();c.moveTo((50-hr-2)*u,(hy-2)*u);for(let i=0;i<7;i++){const x=50-hr+i*(hr*2/6);c.lineTo(x*u,(hy-hr-9+(i%2)*7)*u)}c.lineTo((50+hr+2)*u,(hy-2)*u);c.closePath();c.fill();fringe()}
  else if(P.style==='bald'){}
  else if(P.style==='hood'){c.fillStyle=P.hatc;c.beginPath();c.ellipse(50*u,(hy-4)*u,(hr+7)*u,(hr+8)*u,0,Math.PI*1.05,Math.PI*1.95);c.fill();for(let i=0;i<5;i++)E(50-12+i*6,hy-hr-2+(i%2)*3,.9,.9,'#fff')}
  else fringe();
  if(P.style==='bun')E(50,hy-hr-3,8,7,P.hair);
  if(P.style==='bob'){E(50-hr+1,hy+6,5,11,P.hair);E(50+hr-1,hy+6,5,11,P.hair)}
  // face
  const ey=hy+3,ex=kid?9:8.5,er=kid?4.2:3.4;for(const s of[-1,1]){E(50+s*ex,ey,er*.82,er,'#2a1f1a');E(50+s*ex+er*.25,ey-er*.35,er*.32,er*.32,'#fff');E(50+s*ex-er*.25,ey+er*.35,er*.15,er*.15,'rgba(255,255,255,.8)');
    c.strokeStyle=P.style==='hood'?'#e6dcff':P.hair;c.lineWidth=1.4*u;c.beginPath();c.moveTo((50+s*ex-4)*u,(ey-er-3.2)*u);c.quadraticCurveTo((50+s*ex)*u,(ey-er-4.6)*u,(50+s*ex+4)*u,(ey-er-3.2)*u);c.stroke()}
  if(P.glow){for(const s of[-1,1])E(50+s*ex,ey,er*.6,er*.7,'rgba(190,170,255,.6)')}
  E(50-ex-3,ey+6,3.6,2,'rgba(255,120,130,.35)');E(50+ex+3,ey+6,3.6,2,'rgba(255,120,130,.35)');
  c.strokeStyle='#8a3b32';c.lineWidth=1.5*u;c.beginPath();c.arc(50*u,(ey+7)*u,4*u,.15*Math.PI,.85*Math.PI);c.stroke();
  if(elder){c.strokeStyle='rgba(120,80,60,.35)';c.lineWidth=.8*u;c.beginPath();c.moveTo((50-ex-5)*u,(ey+1)*u);c.lineTo((50-ex-3)*u,(ey+2)*u);c.moveTo((50+ex+5)*u,(ey+1)*u);c.lineTo((50+ex+3)*u,(ey+2)*u);c.stroke()}
  if(P.glasses){c.strokeStyle='#3a3a3a';c.lineWidth=1.3*u;for(const s of[-1,1]){c.beginPath();c.arc((50+s*ex)*u,ey*u,5.2*u,0,7);c.stroke()}c.beginPath();c.moveTo((50-ex+5)*u,ey*u);c.lineTo((50+ex-5)*u,ey*u);c.stroke()}
  if(P.beard==='beard'){c.fillStyle=P.hair;c.beginPath();c.moveTo((50-hr+2)*u,(hy+4)*u);c.quadraticCurveTo((50-hr+3)*u,(hy+hr+4)*u,50*u,(hy+hr+6)*u);c.quadraticCurveTo((50+hr-3)*u,(hy+hr+4)*u,(50+hr-2)*u,(hy+4)*u);c.quadraticCurveTo((50+8)*u,(hy+14)*u,50*u,(hy+13)*u);c.quadraticCurveTo((50-8)*u,(hy+14)*u,(50-hr+2)*u,(hy+4)*u);c.fill()}
  if(P.beard==='mustache'){E(50-4,ey+5.5,4.5,1.8,P.hair,-.2);E(50+4,ey+5.5,4.5,1.8,P.hair,.2)}
  // headwear and accessories
  const hc=P.hatc||'#333';
  if(P.hat==='cap'){E(50,hy-hr*.55,hr+1,hr*.62,hc);c.fillStyle=hc;c.beginPath();c.ellipse((50+hr*.55)*u,(hy-hr*.25)*u,hr*.7*u,3.2*u,-.05,0,7);c.fill()}
  if(P.hat==='captain'){c.fillStyle='#f4f4f4';c.beginPath();c.ellipse(50*u,(hy-hr*.6)*u,(hr+5)*u,9*u,0,Math.PI,0);c.fill();c.fillStyle='#1d2a44';c.fillRect((50-hr-1)*u,(hy-hr*.6)*u,(hr*2+2)*u,5*u);E(50,hy-hr*.85,3,3,'#e9b44c')}
  if(P.hat==='hardhat'){c.fillStyle=hc;c.beginPath();c.ellipse(50*u,(hy-hr*.55)*u,(hr+2)*u,(hr*.8)*u,0,Math.PI,0);c.fill();c.fillRect((50-hr-5)*u,(hy-hr*.6)*u,(hr*2+10)*u,3.5*u)}
  if(P.hat==='ranger'){c.fillStyle='#8a6a3a';c.beginPath();c.ellipse(50*u,(hy-hr*.62)*u,(hr+11)*u,4.5*u,0,0,7);c.fill();c.beginPath();c.moveTo((50-hr*.7)*u,(hy-hr*.62)*u);c.lineTo((50-hr*.55)*u,(hy-hr*1.45)*u);c.lineTo(50*u,(hy-hr*1.3)*u);c.lineTo((50+hr*.55)*u,(hy-hr*1.45)*u);c.lineTo((50+hr*.7)*u,(hy-hr*.62)*u);c.closePath();c.fill();c.fillStyle='#5a4424';c.fillRect((50-hr*.68)*u,(hy-hr*.8)*u,hr*1.36*u,3*u)}
  if(P.hat==='beret'){E(50-3,hy-hr*.75,hr+3,7,hc,-.15)}
  if(P.hat==='bandana'){c.fillStyle=hc;c.beginPath();c.ellipse(50*u,(hy-hr*.5)*u,(hr+1)*u,(hr*.55)*u,0,Math.PI,0);c.fill();E(50+hr,hy-hr*.4,4,3,hc)}
  if(P.hat==='beanie'){c.fillStyle=hc;c.beginPath();c.ellipse(50*u,(hy-hr*.45)*u,(hr+2)*u,(hr*.85)*u,0,Math.PI,0);c.fill();c.fillRect((50-hr-2)*u,(hy-hr*.5)*u,(hr*2+4)*u,5*u)}
  if(P.hat==='pillbox'){c.fillStyle=hc;c.fillRect((50-9)*u,(hy-hr-4)*u,18*u,7*u)}
  if(P.acc==='sunglasses'){c.fillStyle='rgba(20,20,30,.85)';c.beginPath();c.ellipse((50-8)*u,(hy-hr*.75)*u,6*u,3.2*u,0,0,7);c.ellipse((50+8)*u,(hy-hr*.75)*u,6*u,3.2*u,0,0,7);c.fill()}
  if(P.acc==='goggles'){c.strokeStyle='#5a4a3a';c.lineWidth=2*u;c.beginPath();c.moveTo((50-hr)*u,(hy-hr*.7)*u);c.lineTo((50+hr)*u,(hy-hr*.7)*u);c.stroke();for(const s of[-1,1]){c.beginPath();c.arc((50+s*8)*u,(hy-hr*.7)*u,5*u,0,7);c.fillStyle='#9fd3e6';c.fill();c.stroke()}}
  if(P.acc==='mic'){c.strokeStyle='#2a2a2a';c.lineWidth=1.6*u;c.beginPath();c.arc(50*u,hy*u,(hr+3)*u,Math.PI*1.05,Math.PI*1.95);c.stroke();c.beginPath();c.moveTo((50-hr-2)*u,(hy+2)*u);c.quadraticCurveTo((50-hr+2)*u,(hy+12)*u,(50-6)*u,(hy+11)*u);c.stroke();E(50-6,hy+11,2.4,2,'#2a2a2a')}
  c.restore();
  if(phone){E(84,82,11,11,'#4fbf7a');c.fillStyle='#fff';c.font=`${12*u}px sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('📞',84*u,83*u)}
  c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=1;c.beginPath();c.arc(50*u,50*u,50*u-1,0,7);c.stroke();
}catch(e){}}
window.drawPerson=drawPerson;window.personFor=personFor;window.PEOPLE=PEOPLE;
function avatarFor(who){const r=String(who&&who.role||'').toLowerCase();for(const k in ROLE_PIC)if(r.includes(k))return ROLE_PIC[k];return'🙂'}
function talkSheet(){if(talkEl)return talkEl;talkEl=document.createElement('div');talkEl.className='sheet talk';talkEl.hidden=true;
  talkEl.innerHTML=`<div class="inner"><div class="talkhead"><canvas class="avatar person" id="tkAv"></canvas><div style="flex:1;min-width:0"><div class="nm" id="tkWho" style="font-family:var(--display);font-weight:600"></div><div class="sub" id="tkSet"></div></div></div>
  <div class="talklog" id="tkLog"></div><div class="talkpanel" id="tkPanel"></div></div>`;document.body.appendChild(talkEl);
  try{new ResizeObserver(()=>scrollLog()).observe(talkEl.querySelector('#tkLog'))}catch(e){}
  talkEl.addEventListener('click',e=>{const b=e.target.closest('.bub');if(b){b.classList.add('show');clearTimeout(b._t);b._t=setTimeout(()=>b.classList.remove('show'),4000);if(b.dataset.say)speakAsync(b.dataset.say)}});return talkEl}
function scrollLog(){const log=talkEl&&talkEl.querySelector('#tkLog');if(log)requestAnimationFrame(()=>{log.scrollTop=log.scrollHeight})}
function bubble(kind,l){const log=talkEl.querySelector('#tkLog'),b=document.createElement('div');b.className='bub '+kind;b.dataset.say=l.zh;
  b.innerHTML=`<div class="z">${l.zh}</div><div class="p">${l.py||''}</div>${l.en?`<div class="e">${l.en}</div>`:''}`;
  if(kind!=='you'&&curP){const row=document.createElement('div');row.className='bubrow';const cv=document.createElement('canvas');cv.className='mini-person';row.append(cv,b);log.appendChild(row);drawPerson(cv,curP,false)}else log.appendChild(b);scrollLog();return b}
const readMs=l=>Math.min(5200,1100+String(l.zh||'').length*170+String(l.en||'').length*18)*(window.TALK_PACE||1);
window.hasTalk=k=>typeof DIALOGUES!=='undefined'&&!!DIALOGUES[k];
window.runTalk=function(key){return new Promise(async res=>{try{
  if(!hasTalk(key)){res(false);return}const D=DIALOGUES[key],el=talkSheet();closeCard();
  try{for(const t of D.turns||[]){if(t.npc)preloadZh(t.npc.zh);for(const o of t.you||[]){if(o.ok)preloadZh(o.zh);if(o.reply)preloadZh(o.reply.zh)}}}catch(e){}curP=personFor(key,D.who);curPhone=/phone/.test(String(D.who&&D.who.role||''))||key.startsWith('phone_');drawPerson(el.querySelector('#tkAv'),curP,curPhone);el.querySelector('#tkWho').innerHTML=(D.who.name||'')+zw(D.who.zh||'',D.who.py||'',true);
  el.querySelector('#tkSet').textContent=D.setting||'';el.querySelector('#tkLog').innerHTML='';const panel=el.querySelector('#tkPanel');panel.innerHTML='';el.hidden=false;
  LOG('talk_start',{key});let fixes=0;
  for(const turn of D.turns){
    if(turn.npc){bubble('npc',turn.npc);await Promise.all([speakAsync(turn.npc.zh),wait(readMs(turn.npc))]);continue}
    const all=turn.you||[];const good=all.filter(o=>o.ok);const target=good[0]||all[0];const young=!!(window.isYoung&&isYoung());const opts=young?[target]:good.length?good:all;
    // 1) cue in English, pause so the child can say it out loud
    panel.innerHTML=`<div class="talkcue"><div class="c">${young?`🔊 <b>${target.zh}</b> <i>${target.py||''}</i>${zw('听一听，说一说','tīng yi tīng, shuō yi shuō')}`:`Say it in Chinese: “${target.en}”${zw('用中文说','yòng Zhōngwén shuō')}`}</div><div class="ring"><span></span></div></div>
      <div class="talkopts"></div>`;
    if(young){try{await speakAsync(target.zh)}catch(e){}} // little kids hear the line first, then say it back
    await ring(panel.querySelector('.ring'),young?4:3);
    // 2) choose what you said (each option plays its audio)
    const chosen=await new Promise(r=>{const box=panel.querySelector('.talkopts');
      if(window.canListen()){const mic=document.createElement('button');mic.className='mic';mic.innerHTML=`🎤 <b>Say it</b>${zw('说出来','shuō chūlái')}`;box.appendChild(mic);
        mic.onclick=async()=>{if(mic.disabled)return;mic.disabled=true;mic.classList.add('on');mic.innerHTML='🎤 …'+zw('我在听','wǒ zài tīng');
          const alts=await listenZh();mic.disabled=false;mic.classList.remove('on');
          if(alts===null){mic.remove();return}
          let best=null,bs=0,heardTxt=alts[0]||'';for(const h of alts)for(const o of opts){const sc=zhMatch(h,o.zh);if(sc>bs){bs=sc;best=o;heardTxt=h}}
          try{LOG('speech',{heard:heardTxt.slice(0,40),score:+bs.toFixed(2),ok:bs>=.6})}catch(e){}
          if(best&&bs>=.6){mic.innerHTML=`✓ ${heardTxt}`+zw('太棒了！','tài bàng le!');mic.classList.add('good');sfx&&sfx('quest');setTimeout(()=>r(best),700)}
          else{mic.innerHTML=(heardTxt?`🎤 “${heardTxt}” · again`:'🎤 Again')+zw('再说一次','zài shuō yí cì')}}}
      [...opts].sort(()=>Math.random()-.5).forEach(o=>{const b=document.createElement('button');
      b.innerHTML=`<div class="z">${o.zh}</div><div class="p">${o.py}</div>`;let armed=false;b.onclick=()=>{if(!armed){armed=true;[...box.children].forEach(x=>x!==b&&(x._armed=false));speakAsync(o.zh);b.style.outline='3px solid var(--accent)';
        [...box.children].forEach(x=>{if(x!==b)x.style.outline=''});b.innerHTML=`<div class="z">${o.zh}</div><div class="p">${o.py}</div><div class="p" style="color:var(--accent)">Tap again to say this ${'· 再点一下'}</div>`;
        [...box.children].forEach(x=>{if(x!==b&&x._reset)x._reset()});return}r(o)};b._reset=()=>{armed=false;b.style.outline='';b.innerHTML=`<div class="z">${o.zh}</div><div class="p">${o.py}</div>`};box.appendChild(b)})});
    panel.innerHTML='';bubble('you',chosen);await Promise.all([speakAsync(chosen.zh),wait(900)]);
    if(chosen.ok){heard(chosen.zh,true);if(chosen.reply){bubble('npc',chosen.reply);await Promise.all([speakAsync(chosen.reply.zh),wait(readMs(chosen.reply))])}else{bubble('npc',{zh:'对！',py:'duì!',en:'Right!'});await Promise.all([speakAsync('对！'),wait(1100)])}}
    else{ // gentle recast: the character says it back the natural way, then the child repeats it
      fixes++;const fx={zh:'你是说「'+target.zh.replace(/[。！？!?]$/,'')+'」吧？',py:'nǐ shì shuō “'+target.py.replace(/[.!?]$/,'')+'” ba?',en:'Did you mean “'+target.en+'”?'};
      bubble('fix',fx);await speakAsync('你是说');await speakAsync(target.zh);await speakAsync('吧');
      panel.innerHTML=`<div class="talkcue"><div class="c">Say it again: ${target.zh} <span class="sub">${target.py}</span></div><div class="ring"><span></span></div></div>`;await ring(panel.querySelector('.ring'),2.6);
      bubble('you',target);await speakAsync(target.zh);heard(target.zh,false);panel.innerHTML='';
      if(target.reply){bubble('npc',target.reply);await Promise.all([speakAsync(target.reply.zh),wait(readMs(target.reply))])}}
    await wait(300)}
  if(D.end){bubble('npc',D.end);await Promise.all([speakAsync(D.end.zh),wait(readMs(D.end))])}
  const dayKey=(typeof today==='function'?today():'');S.talkDay=S.talkDay||{};const gotReward=D.reward&&S.talkDay[key]!==dayKey;if(gotReward){give(D.reward);S.talkDay[key]=dayKey}S.talked=S.talked||{};S.talked[key]=(S.talked[key]||0)+1;questEv('words');save();LOG('talk_end',{key,fixes});
  panel.innerHTML='';const b=document.createElement('button');b.className='big';b.innerHTML=(gotReward?`Continue · You got ${rwTxt(D.reward)}`:'Continue')+zw('继续','jìxù');panel.appendChild(b);
  b.onclick=()=>{el.hidden=true;updateUI();res(true)}}catch(e){console.error(e);if(talkEl)talkEl.hidden=true;res(false)}})};
})();
