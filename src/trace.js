// ---------- Trace a Chinese character to power a move, go Giant, or cast a catch spell (Hanzi Writer) ----------
// Each creature type has its own ladder of related characters, simple first. A character is "learned" after 2 good traces;
// then the next one on the ladder unlocks, and learned ones come back for review so they stay fresh.
(function(){
// [character, pinyin, English, example word, word pinyin, word English]
const TRACE_SETS={
 fire:  [['火','huǒ','fire','火山','huǒshān','volcano'],['光','guāng','light','阳光','yángguāng','sunshine'],['红','hóng','red','红花','hóng huā','red flower'],
         ['灯','dēng','lamp','开灯','kāi dēng','turn on the light'],['热','rè','hot','好热','hǎo rè','so hot'],['烧','shāo','to burn','发烧','fāshāo','to have a fever']],
 water: [['水','shuǐ','water','喝水','hē shuǐ','drink water'],['雨','yǔ','rain','下雨','xià yǔ','it is raining'],['河','hé','river','小河','xiǎo hé','a little river'],
         ['鱼','yú','fish','小鱼','xiǎo yú','little fish'],['洗','xǐ','to wash','洗手','xǐ shǒu','wash your hands'],['海','hǎi','sea','大海','dàhǎi','the ocean'],['游','yóu','to swim','游泳','yóuyǒng','swimming']],
 leaf:  [['木','mù','wood','木头','mùtou','a piece of wood'],['叶','yè','leaf','叶子','yèzi','a leaf'],['花','huā','flower','花园','huāyuán','garden'],
         ['林','lín','woods','森林','sēnlín','forest'],['果','guǒ','fruit','苹果','píngguǒ','apple'],['草','cǎo','grass','草地','cǎodì','lawn'],['树','shù','tree','大树','dà shù','a big tree']],
 spark: [['云','yún','cloud','白云','bái yún','white cloud'],['电','diàn','electricity','电话','diànhuà','telephone'],['闪','shǎn','to flash','闪电','shǎndiàn','lightning'],
         ['快','kuài','fast','快点','kuài diǎn','hurry up'],['亮','liàng','bright','月亮','yuèliang','the moon'],['雷','léi','thunder','打雷','dǎ léi','thunder rumbles']],
 stone: [['山','shān','mountain','爬山','pá shān','climb a mountain'],['土','tǔ','soil','土豆','tǔdòu','potato'],['石','shí','stone','石头','shítou','a rock'],
         ['地','dì','ground','地上','dì shang','on the ground'],['沙','shā','sand','沙子','shāzi','sand'],['岩','yán','rock','岩石','yánshí','rock'],['硬','yìng','hard','很硬','hěn yìng','very hard']],
 frost: [['风','fēng','wind','大风','dà fēng','strong wind'],['白','bái','white','白色','báisè','white'],['冬','dōng','winter','冬天','dōngtiān','winter'],
         ['冰','bīng','ice','冰淇淋','bīngqílín','ice cream'],['冷','lěng','cold','好冷','hǎo lěng','so cold'],['雪','xuě','snow','雪人','xuěrén','snowman']],
 normal:[['力','lì','strength','用力','yònglì','push hard'],['手','shǒu','hand','小手','xiǎo shǒu','little hand'],['打','dǎ','to hit','打球','dǎ qiú','play ball'],
         ['走','zǒu','to walk','走路','zǒulù','to walk'],['跑','pǎo','to run','跑步','pǎobù','running'],['跳','tiào','to jump','跳舞','tiàowǔ','to dance']],
 giant: [['大','dà','big','大象','dàxiàng','elephant'],['巨','jù','huge','巨人','jùrén','a giant'],['高','gāo','tall','高楼','gāo lóu','a tall building'],['强','qiáng','strong','很强','hěn qiáng','very strong']],
};
const TYPE_ZH={fire:['火','huǒ'],water:['水','shuǐ'],leaf:['叶','yè'],spark:['电','diàn'],stone:['石','shí'],frost:['冰','bīng'],normal:['打','dǎ'],giant:['大','dà'],wind:['风','fēng'],bug:['虫','chóng'],mind:['心','xīn'],shadow:['影','yǐng'],dragon:['龙','lóng'],metal:['钢','gāng'],fight:['拳','quán'],star:['星','xīng']};
if(window.EXTRA_TRACE_SETS)for(const k in EXTRA_TRACE_SETS)if(!TRACE_SETS[k])TRACE_SETS[k]=EXTRA_TRACE_SETS[k]; // ladders for added creature types (types_ext.js)
window.TRACE_SETS=TRACE_SETS;
function st(){if(typeof S==='undefined')return{};if(!S.tr||typeof S.tr!=='object')S.tr={};return S.tr}
function has(ch){return window.TRACE_DATA&&TRACE_DATA[ch]}
// The long tail: every HSK 1–4 character (hsk_chars.js), each tagged with a theme when it fits one.
// entry: [ch, py, en, word, wordPy, wordEn, hsk, strokes, theme]
const HAND=new Set();for(const k in TRACE_SETS)for(const e of TRACE_SETS[k])HAND.add(e[0]);
const HSK=(window.HSK_CHARS||[]).filter(e=>e&&e[0]&&!HAND.has(e[0]));
const LEVEL={};for(const e of (window.HSK_CHARS||[]))LEVEL[e[0]]=e[6];
const THEMED={},GENERAL=[];for(const e of HSK){if(e[8]&&TRACE_SETS[e[8]]){(THEMED[e[8]]=THEMED[e[8]]||[]).push(e)}else GENERAL.push(e)}
// simple and early characters need more good traces before they count as learned, so they get the most practice
const need=ch=>HAND.has(ch)||LEVEL[ch]===1?3:2;
const reps=ch=>st()[ch]||0;
const strokes=ch=>(window.TRACE_DATA&&TRACE_DATA[ch]&&TRACE_DATA[ch].strokes.length)||99;
const young=()=>!!(window.isYoung&&isYoung());
// little kids only get the simplest characters (few strokes)
function ladder(kind){const L=[...(TRACE_SETS[kind]||TRACE_SETS.normal),...(THEMED[kind]||[])].filter(e=>has(e[0]));if(!young())return L;const easy=L.filter(e=>strokes(e[0])<=5);return easy.length?easy:[...L].sort((a,b)=>strokes(a[0])-strokes(b[0])).slice(0,3)}
// Pick the character to trace for a type: the next one still being learned, or (about a third of the time) a learned one to review.
function pickFor(kind){const L=ladder(kind);if(!L.length)return null;const hand=(TRACE_SETS[kind]||TRACE_SETS.normal).filter(e=>has(e[0])&&(!young()||strokes(e[0])<=5));
  const learningL=L.find(e=>reps(e[0])<need(e[0])),learningG=GENERAL.find(e=>has(e[0])&&reps(e[0])<need(e[0])&&(!young()||strokes(e[0])<=4));
  const handDone=hand.every(e=>reps(e[0])>=need(e[0]));
  const learned=[...L,...GENERAL].filter(e=>has(e[0])&&reps(e[0])>=need(e[0]));
  let next=!handDone?learningL:(learningL&&learningG?(Math.random()<.5?learningL:learningG):(learningL||learningG));
  if(!next||(learned.length&&Math.random()<.35)){ // review: favour simple, early, rarely-practised characters
    const pool=learned.length?learned:L;let best=null,bw=-1;for(const e of pool){const lv=LEVEL[e[0]]||1,w=Math.random()*(HAND.has(e[0])||lv===1?2:1)/(1+reps(e[0])*.5);if(w>bw){bw=w;best=e}}return best}
  return next}
window.tracePick=pickFor;
const css=`.tracewrap{position:fixed;inset:0;z-index:60;background:rgba(6,8,12,.78);display:flex;align-items:center;justify-content:center;padding:14px}
.tracecard{width:min(380px,100%);background:rgba(22,25,29,.97);border:1px solid rgba(255,255,255,.18);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:9px;align-items:center;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.tracecard.spell{border-color:rgba(216,168,106,.6);box-shadow:0 0 0 1px rgba(216,168,106,.25),0 0 40px rgba(216,168,106,.22),0 20px 60px rgba(0,0,0,.6)}
.tracetitle{font-size:.86rem;color:var(--muted);text-align:center}
.tracehead{display:flex;align-items:baseline;gap:10px;justify-content:center;position:relative}
.tracehead b{font-family:'Noto Sans SC',sans-serif;font-size:1.7rem;cursor:pointer}.tracehead span{color:var(--muted)}
.tracepic{width:54px;height:54px;align-self:center;margin-right:2px}.tracetitle i{font-style:normal;opacity:.75}
.tracenew{position:absolute;left:100%;top:-4px;margin-left:8px;font-size:.66rem;letter-spacing:.04em;color:#121417;background:var(--accent,#d8a86a);border-radius:99px;padding:2px 7px;white-space:nowrap}
.tracebox{position:relative;width:240px;height:240px;border-radius:12px;background:#f7f3ea;box-shadow:inset 0 0 0 2px #c9b48f}
.spell .tracebox{background:radial-gradient(circle at 50% 45%,#fffaf0,#efe4cc);box-shadow:inset 0 0 0 2px #d8a86a,0 0 24px rgba(216,168,106,.35)}
.tracebox svg.grid{position:absolute;inset:0;pointer-events:none}
.tracebox .hw{position:absolute;inset:0}
.traceword{display:flex;gap:8px;align-items:baseline;cursor:pointer;padding:4px 10px;border-radius:10px;background:rgba(255,255,255,.05)}
.traceword b{font-family:'Noto Sans SC',sans-serif;font-size:1.05rem}.traceword span{color:var(--muted);font-size:.82rem}
.tracemsg{min-height:2.5em;text-align:center;font-size:.88rem}
.tracebtns{display:flex;gap:8px}.tracebtns button{font-size:.82rem;padding:7px 11px}`;
const sty=document.createElement('style');sty.textContent=css;document.head.appendChild(sty);
let active=null; // {wrap,res}
function finish(a,r){if(!a||a.done)return;a.done=true;try{a.wrap.remove()}catch(e){}if(active===a)active=null;a.res(r)}
// Watchdog: if anything removes the overlay from outside, resolve its promise so callers never hang.
setInterval(()=>{if(active&&!active.wrap.isConnected)finish(active,{ok:true,mistakes:1,skipped:true,ch:active.ch})},400);
window.traceChar=function(kind,opts){if(typeof opts==='string')opts={title:opts};opts=opts||{};return new Promise(res=>{try{
  if(active&&!active.wrap.isConnected)finish(active,{ok:true,mistakes:1,skipped:true});
  const e=pickFor(kind);
  if(active||typeof HanziWriter==='undefined'||!e){res({ok:true,mistakes:1,skipped:true});return}
  const [ch,py,en,wz,wpy,wen]=e,tr=st(),rp=tr[ch]||0,isNew=rp===0,purpose=opts.purpose||'move';
  const title=opts.title||(purpose==='spell'?'Trace the spell!':purpose==='giant'?'Trace it to go Giant!':'Trace it to attack!');
  const tz=purpose==='spell'?['写字施法','xiě zì shīfǎ']:['写一写','xiě yi xiě'];
  const wrap=document.createElement('div');wrap.className='tracewrap';
  wrap.innerHTML=`<div class="tracecard${purpose==='spell'?' spell':''}"><div class="tracetitle">${title}${zw(tz[0],tz[1],true)}</div>
    <div class="tracehead">${opts.pic?'<canvas class="tracepic"></canvas>':''}<b data-say="${ch}">${ch}</b><span>${py} · ${en}</span>${isNew?'<i class="tracenew">NEW 新字</i>':''}</div>
    <div class="tracebox"><svg class="grid" viewBox="0 0 240 240"><g stroke="#d9c7a6" stroke-width="1" stroke-dasharray="5 5"><line x1="0" y1="120" x2="240" y2="120"/><line x1="120" y1="0" x2="120" y2="240"/><line x1="0" y1="0" x2="240" y2="240"/><line x1="240" y1="0" x2="0" y2="240"/></g></svg><div class="hw"></div></div>
    <div class="traceword" data-say="${wz}"><b>${wz}</b><span>${wpy} · ${wen}</span></div>
    <div class="tracemsg"></div>
    <div class="tracebtns"><button data-a="show">Show me${zw('看笔顺','kàn bǐshùn')}</button><button data-a="hear">Hear it${zw('听一听','tīng yi tīng')}</button></div></div>`;
  document.body.appendChild(wrap);const msgEl=wrap.querySelector('.tracemsg');const a={wrap,res,ch,done:false};active=a;
  {const pc=wrap.querySelector('.tracepic');if(pc&&opts.pic){const d=Math.min(3,devicePixelRatio||1);pc.width=54*d;pc.height=54*d;const px=pc.getContext('2d');const loop=()=>{if(a.done||!wrap.isConnected)return;px.setTransform(d,0,0,d,0,0);try{opts.pic(px,54,54,performance.now()/1000)}catch(e){}requestAnimationFrame(loop)};loop()}}
  const writer=HanziWriter.create(wrap.querySelector('.hw'),ch,{width:240,height:240,padding:18,showOutline:true,showCharacter:false,strokeColor:'#2b2420',outlineColor:rp>=4?'#ebe2d2':'#d8ccb6',radicalColor:null,
    drawingColor:purpose==='spell'?'#b8741f':'#c0392b',drawingWidth:26,highlightColor:'#e0a64a',strokeAnimationSpeed:1.4,delayBetweenStrokes:160,charDataLoader:(c,onLoad)=>onLoad(TRACE_DATA[c])});
  const startQuiz=()=>{if(a.done)return;msgEl.innerHTML='Trace the strokes in order.'+zw('按笔顺写。','àn bǐshùn xiě.');
    writer.quiz({showHintAfterMisses:1,markStrokeCorrectAfterMisses:young()?1:3,highlightOnComplete:true,leniency:young()?1.9:1.35,
    onMistake:()=>{msgEl.innerHTML='Try that stroke again. Follow the glow.'+zw('再试一次','zài shì yí cì')},
    onCorrectStroke:(d)=>{msgEl.innerHTML=`${d.strokeNum+1} / ${d.strokeNum+1+d.strokesRemaining}`+zw('很好！','hěn hǎo!')},
    onComplete:(s)=>{if(a.done)return;const perfect=s.totalMistakes===0;tr[ch]=(tr[ch]||0)+(s.totalMistakes<=2?1:0);try{save()}catch(e){}
      const good=purpose==='spell'?(perfect?'Perfect spell!':'Spell ready!'):purpose==='giant'?'Giant power!':(perfect?'Perfect! Critical hit!':'Done!');
      const gz=perfect?['太棒了！','tài bàng le!']:['写好了！','xiě hǎo le!'];
      msgEl.innerHTML=good+zw(gz[0],gz[1]);try{sfx(perfect?'super':'quest')}catch(e){}
      try{LOG('trace',{ch,kind,purpose,mistakes:s.totalMistakes,reps:tr[ch]})}catch(e){}
      const sp=(window.speakAsync?speakAsync(ch+'，'+wz):Promise.resolve()).catch(()=>{});
      // leave time to hear the character and its word, but never longer than ~2.4 s
      Promise.race([sp,new Promise(r=>setTimeout(r,2400))]).then(()=>setTimeout(()=>finish(a,{ok:true,mistakes:s.totalMistakes,ch,perfect}),250))}})};
  const demo=()=>{if(a.done)return;try{writer.cancelQuiz&&writer.cancelQuiz()}catch(e){}writer.hideCharacter();msgEl.innerHTML='Watch the strokes.'+zw('看笔顺。','kàn bǐshùn.');
    writer.animateCharacter({onComplete:()=>{writer.hideCharacter({duration:200});setTimeout(startQuiz,250)}})};
  speak(ch);
  // new or barely-known characters get a stroke demo first; familiar ones go straight to tracing
  if(rp<2||young())setTimeout(demo,300);else setTimeout(startQuiz,200);
  wrap.onclick=ev=>{const b=ev.target.closest('button')?.dataset.a;if(b==='show')demo();else if(b==='hear')speak(ch+'，'+wz)};
}catch(err){console.error(err);if(active&&active.res===res)active=null;res({ok:true,mistakes:1,skipped:true})}})};
// Progress for the Learn screen: every character on every ladder, with how well it is known.
// For the Learn screen: per type, the hand-picked ladder plus any learned/next themed HSK characters; the general HSK row the same way.
window.traceProgress=function(){const out=[];const add=(kind,e)=>out.push({kind,ch:e[0],py:e[1],en:e[2],word:e[3],wpy:e[4],wen:e[5],reps:reps(e[0]),learned:reps(e[0])>=need(e[0])});
  for(const k of Object.keys(TRACE_SETS)){for(const e of TRACE_SETS[k])add(k,e);let shownNext=false;for(const e of (THEMED[k]||[])){const lr=reps(e[0])>=need(e[0]);if(lr||(!shownNext&&reps(e[0])>0)){add(k,e);if(!lr)shownNext=true}}}
  for(const e of GENERAL){if(reps(e[0])>0)add('general',e)}return out};
window.traceTotals=function(){const all=[...HAND].length+HSK.length;let lr=0;const tr=st();for(const ch in tr)if(tr[ch]>=need(ch))lr++;return{learned:lr,total:all}};
window.TRACE_TYPE_ZH=TYPE_ZH;
})();
