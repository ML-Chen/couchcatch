// ---------- A companion who learns Chinese too ----------
// Little Star (while it floats in the scene, story chapters 1–7) or, before and after that, the lead creature picks up
// the characters the child has traced (S.tr) and the phrasebook phrases she has said (S.ph), and now and then says them
// back in a short sentence. Only while idle in the field, never during catching, battles, tracing or conversations,
// and at most once every few minutes (S.comp.last survives reloads).
// Every possible line comes from a FINITE set of templates x eligible characters / phrases, so companionLines()
// enumerates them all (tools/companion_lines.js writes tools/new_lines/companion.txt; tools/zh_strings.js records them).
// State: S.comp = {last: ms of the last line, n: lines said, used: {zh: times said}}; created on demand, so old saves load.
(function(){
const G=typeof window!=='undefined'?window:globalThis;
// ---- the line set ----
// Characters: every character on the hand-made trace ladders (trace.js TRACE_SETS + types_ext.js EXTRA_TRACE_SETS; not the HSK long tail).
// A character counts as known after 2 good traces. Its first ladder entry gives the pinyin, English and example word.
const KNOW_TRACES=2;
// a few nouns she can say she likes: character -> English line
const LIKE={'水':'Water, water! I love water!','雨':'Rain, rain! I love rain!','雪':'Snow, snow! I love snow!','花':'Flowers, flowers! I love flowers!',
  '鱼':'Fish, fish! I love fish!','海':'The sea, the sea! I love the sea!','树':'Trees, trees! I love trees!','山':'Mountains! I love mountains!',
  '云':'Clouds, clouds! I love clouds!','星':'Stars, stars! I love stars!','月':'The moon! I love the moon!','鸟':'Birds, birds! I love birds!',
  '龙':'Dragons, dragons! I love dragons!','车':'Cars, cars! I love cars!'};
// Phrases: one natural reply per phrasebook phrase (phrases.js), said back once she has said the phrase herself.
const ECHO={
 '你好！':['你好！你好！','nǐ hǎo! nǐ hǎo!','Hello! Hello!'],
 '谢谢！':['谢谢你！','xièxie nǐ!','Thank you!'],
 '不客气。':['不客气，不客气！','bú kèqi, bú kèqi!','You’re welcome!'],
 '再见！':['再见！明天见！','zàijiàn! míngtiān jiàn!','Bye! See you tomorrow!'],
 '你好吗？':['你好吗？我很好！','nǐ hǎo ma? wǒ hěn hǎo!','How are you? I’m good!'],
 '我很好！':['我也很好！','wǒ yě hěn hǎo!','I’m good too!'],
 '你呢？':['我很好，你呢？','wǒ hěn hǎo, nǐ ne?','I’m good. And you?'],
 '你叫什么名字？':['你叫什么名字？','nǐ jiào shénme míngzi?','What’s your name?'],
 '我叫小美。':['小美，你好！','Xiǎoměi, nǐ hǎo!','Hi, Xiaomei!'],
 '你几岁？':['你几岁？我不知道我几岁！','nǐ jǐ suì? wǒ bù zhīdào wǒ jǐ suì!','How old are you? I don’t know how old I am!'],
 '我十岁。':['十岁！好大！','shí suì! hǎo dà!','Ten! So big!'],
 '很高兴认识你！':['我也很高兴认识你！','wǒ yě hěn gāoxìng rènshi nǐ!','Nice to meet you too!'],
 '我要水。':['我也要水！','wǒ yě yào shuǐ!','I want water too!'],
 '我要这个。':['我也要这个！','wǒ yě yào zhège!','I want this one too!'],
 '我不要。':['我也不要！','wǒ yě bú yào!','I don’t want it either!'],
 '我饿了。':['我也饿了！','wǒ yě è le!','I’m hungry too!'],
 '我渴了。':['我也渴了！我要水！','wǒ yě kě le! wǒ yào shuǐ!','I’m thirsty too! I want water!'],
 '好吃！':['好吃！好吃！','hǎo chī! hǎo chī!','Yummy! Yummy!'],
 '请给我一个苹果。':['我也要一个苹果！','wǒ yě yào yí ge píngguǒ!','I want an apple too!'],
 '我喜欢猫。':['我也喜欢猫！','wǒ yě xǐhuan māo!','I like cats too!'],
 '你喜欢什么？':['你喜欢什么？我喜欢你！','nǐ xǐhuan shénme? wǒ xǐhuan nǐ!','What do you like? I like you!'],
 '我喜欢画画。':['我也喜欢画画！','wǒ yě xǐhuan huà huà!','I like drawing too!'],
 '我不喜欢。':['我也不喜欢！','wǒ yě bù xǐhuan!','I don’t like it either!'],
 '我们一起玩吧！':['好的！我们一起玩吧！','hǎo de! wǒmen yìqǐ wán ba!','OK! Let’s play together!'],
 '好的！':['好的，好的！','hǎo de, hǎo de!','OK, OK!'],
 '快看！':['快看！快看！','kuài kàn! kuài kàn!','Look! Look!'],
 '加油！':['加油！你可以的！','jiāyóu! nǐ kěyǐ de!','You can do it! You can!'],
 '太棒了！':['太棒了！太棒了！','tài bàng le! tài bàng le!','Awesome! Awesome!'],
 '轮到你了。':['轮到我了吗？','lún dào wǒ le ma?','Is it my turn?'],
 '这是什么？':['这是什么？这是什么？','zhè shì shénme? zhè shì shénme?','What’s this? What’s this?'],
 '这是我的狗。':['我也想要一只狗！','wǒ yě xiǎng yào yì zhī gǒu!','I want a dog too!'],
 '在哪里？':['在哪里？在哪里？','zài nǎlǐ? zài nǎlǐ?','Where is it? Where?'],
 '在这里！':['在这里！我在这里！','zài zhèlǐ! wǒ zài zhèlǐ!','Here! I’m right here!'],
 '我很开心！':['我也很开心！','wǒ yě hěn kāixīn!','I’m happy too!'],
 '我累了。':['我也累了！','wǒ yě lèi le!','I’m tired too!'],
 '对不起。':['没关系！','méi guānxi!','It’s OK!'],
 '没关系。':['没关系，没关系！','méi guānxi, méi guānxi!','It’s OK, it’s OK!'],
 '我有点儿怕。':['别怕，我在这里！','bié pà, wǒ zài zhèlǐ!','Don’t be scared, I’m here!'],
 '可以吗？':['可以吗？可以吗？','kěyǐ ma? kěyǐ ma?','May I? May I?'],
 '可以！':['可以！可以！','kěyǐ! kěyǐ!','Yes! Yes, you may!'],
 '现在几点？':['现在几点？我不知道！','xiànzài jǐ diǎn? wǒ bù zhīdào!','What time is it? I don’t know!'],
 '今天很热。':['今天很热！我渴了！','jīntiān hěn rè! wǒ kě le!','It’s hot today! I’m thirsty!'],
 '我们走吧！':['我们走吧！','wǒmen zǒu ba!','Let’s go!'],
 '晚安！':['晚安！晚安！','wǎn’ān! wǎn’ān!','Good night! Good night!'],
};
const en1=s=>String(s).split(',')[0].trim();
// one entry per character: the first ladder it appears on
function charEntries(sets){sets=sets||G.TRACE_SETS||{};const out=[],seen=new Set();
  const extra=G.EXTRA_TRACE_SETS||{};const all=[sets,extra];
  for(const S0 of all)for(const k of Object.keys(S0))for(const e of (S0[k]||[]))if(e&&e[0]&&!seen.has(e[0])){seen.add(e[0]);out.push(e)}return out}
// Templates for a known character [ch, py, en, word, wordPy, wordEn]. Each returns [zh, py, en, ch].
const CHAR_T=[
  e=>[`我也会写${e[0]}了！`,`wǒ yě huì xiě ${e[1]} le!`,`I can write “${en1(e[2])}” too!`],
  e=>e[3]&&e[3].includes(e[0])&&e[3]!==e[0]?[`${e[0]}！${e[3]}的${e[0]}！`,`${e[1]}! ${e[4]} de ${e[1]}!`,`${en1(e[2])[0].toUpperCase()+en1(e[2]).slice(1)}, as in “${e[5]}”!`]:null,
  e=>LIKE[e[0]]?[`${e[0]}，${e[0]}！我喜欢${e[0]}！`,`${e[1]}, ${e[1]}! wǒ xǐhuan ${e[1]}!`,LIKE[e[0]]]:null,
];
// The lines for one known thing: {k:'c:水'|'p:我饿了。', lines:[{zh,py,en,hi}]}
function linesForChar(e){return CHAR_T.map(t=>t(e)).filter(Boolean).map(l=>({zh:l[0],py:l[1],en:l[2],hi:e[0]}))}
function linesForPhrase(zh){const r=ECHO[zh];return r?[{zh:r[0],py:r[1],en:r[2],hi:''}]:[]}
// Every line the companion can ever say, each once, in a stable order (characters by ladder, then phrases by phrasebook).
function companionLines(sets,book){const out=[],seen=new Set();const add=l=>{if(!seen.has(l.zh)){seen.add(l.zh);out.push(l)}};
  for(const e of charEntries(sets))linesForChar(e).forEach(add);
  const B=book||G.PHRASEBOOK||[];for(const p of B)linesForPhrase(p.zh).forEach(add);
  for(const zh of Object.keys(ECHO))linesForPhrase(zh).forEach(add);
  return out}
G.companionLines=companionLines;
if(typeof document==='undefined')return; // loaded by a node tool: only the line set is needed

// ---- what the child has taught it ----
function cs(){if(!S.comp||typeof S.comp!=='object')S.comp={last:Date.now(),n:0,used:{}};if(!S.comp.used||typeof S.comp.used!=='object')S.comp.used={};return S.comp}
function known(){const out=[],tr=S.tr||{},ph=S.ph||{};
  for(const e of charEntries())if((tr[e[0]]||0)>=KNOW_TRACES)out.push({k:'c:'+e[0],lines:linesForChar(e)});
  for(const zh in ph)if(ph[zh]&&ph[zh].intro&&ECHO[zh])out.push({k:'p:'+zh,lines:linesForPhrase(zh)});
  return out.filter(x=>x.lines.length)}
// the next line: from the thing it has talked about least (new things first), the least-used line for it
function pickLine(){const K=known();if(!K.length)return null;const used=cs().used,u=l=>used[l.zh]||0,ku=x=>x.lines.reduce((s,l)=>s+u(l),0);
  const m=Math.min(...K.map(ku)),pool=K.filter(x=>ku(x)===m),it=pool[Math.floor(Math.random()*pool.length)];
  const lm=Math.min(...it.lines.map(u)),lp=it.lines.filter(l=>u(l)===lm);return lp[Math.floor(Math.random()*lp.length)]}

// ---- who speaks, and when ----
const GAP=4*60e3,IDLE=15e3,SHOW=7500;
const starOn=()=>{const s=S.story;return !!(s&&typeof s==='object'&&s.ch>=1&&s.ch<8&&S.mode!=='travel')};
function speaker(){return starOn()?'star':(S.col&&S.col.length?'lead':null)}
// idle in the field: nothing open, nothing being caught, fought, traced or talked about
function idleNow(){try{return S.col.length>0&&(S.mode==='staying'||S.mode==='arrived')&&!sheetOpen()&&!C&&!B&&!E&&!document.querySelector('.tracewrap,.saycard,#knock')
  &&!(typeof pendingTalks!=='undefined'&&pendingTalks.length)&&!document.hidden}catch(e){return false}}
const st={idleSince:Date.now(),bub:null,t0:0,line:null,who:null,taps:0};
function canSpeak(now){now=now||Date.now();return idleNow()&&!st.bub&&now-st.idleSince>=IDLE&&now-(cs().last||0)>=GAP&&known().length>0}
function tick(now){now=now||Date.now();if(!idleNow()){st.idleSince=now;if(st.bub&&!idleNow())hide();return false}
  if(!canSpeak(now))return false;const l=pickLine();if(!l)return false;const c=cs();c.last=now;c.n=(c.n||0)+1;c.used[l.zh]=(c.used[l.zh]||0)+1;try{save()}catch(e){}
  show(l);return true}
setInterval(()=>{try{if(typeof S!=='undefined'&&S.col)tick()}catch(e){console.error(e)}},1000);

// ---- the speech bubble ----
const css=`.cbub{position:absolute;z-index:6;max-width:min(80%,270px);padding:7px 11px 8px;border-radius:16px;pointer-events:none;
  background:linear-gradient(135deg,rgba(255,255,255,.6) 0%,rgba(255,255,255,0) 30%),linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,255,255,.84));color:#141b33;
  border:1px solid rgba(255,255,255,.95);box-shadow:inset 0 -10px 16px -12px rgba(96,116,230,.4),0 10px 26px -10px rgba(30,40,100,.5);
  animation:cbubIn .35s cubic-bezier(.2,1.4,.4,1) both;transform-origin:var(--ox,100%) var(--oy,0%)}
.cbub::after{content:'';position:absolute;width:12px;height:12px;background:rgba(255,255,255,.93);border:1px solid rgba(255,255,255,.95);transform:rotate(45deg);border-radius:2px}
.cbub.up::after{top:-6px;right:var(--tail,18px);border-right:none;border-bottom:none}
.cbub.down::after{bottom:-6px;left:var(--tail,18px);border-left:none;border-top:none;background:rgba(255,255,255,.86)}
.cbub .cwho{font-size:.6rem;font-weight:700;letter-spacing:.03em;color:#5a6182;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cbub .czh{font-family:'Noto Sans SC',sans-serif;font-size:1.02rem;font-weight:700;line-height:1.25}
.cbub .czh b{color:#c0392b;font-weight:800}.cbub .czh span,.cbub .cpy span{white-space:nowrap;display:inline-block}
.cbub .cpy{font-size:.72rem;line-height:1.2;color:#2c3456;margin-top:1px}
.cbub .cen{font-size:.64rem;line-height:1.2;color:#5a6182;margin-top:2px}
.lvl-2 .cbub .cen,.lvl-3 .cbub .cen,.lvl-3 .cbub .cpy{display:none}
.cbub.out{animation:cbubOut .3s ease-in both}
@keyframes cbubIn{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
@keyframes cbubOut{to{opacity:0;transform:scale(.85)}}`;
const sty=document.createElement('style');sty.textContent=css;document.head.appendChild(sty);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
// where the speaker is, in scene fractions (Little Star's float matches story.js; the lead creature peeks in at the bottom left)
const LEAD={x:.13,y:.86};
// the lead creature picks the bottom spot farthest from the wild creatures (and their name tags)
function leadSpot(){let best=.13,bd=-1;for(const x of[.13,.32,.68,.87]){let d=9;try{for(const w of wild)d=Math.min(d,Math.hypot(w.x-x,(w.y-LEAD.y)*1.4))}catch(e){}if(d>bd+.02){bd=d;best=x}}LEAD.x=best}
function anchor(who){return (who||st.who)==='star'?{x:.86+Math.sin(T*.35)*.05,y:.27+Math.sin(T*1.1)*.025}:LEAD}
function whoName(){if(st.who==='star')return'小星 Xiǎo Xīng';const c=S.col[0];try{const z=ZS(SP[c.sp].n);return `${z.zh} ${z.py}`}catch(e){return''}}
function show(l){hide(true);const wrap=document.getElementById('scene')&&document.getElementById('scene').parentNode;if(!wrap)return;
  st.who=speaker();st.line=l;st.t0=T;if(st.who==='lead')leadSpot();const b=document.createElement('div');b.className='cbub '+(st.who==='star'?'up':'down');
  // a two-sentence line wraps between its sentences, never inside one
  const zh=l.zh.split(/(?<=[！？。])/).map(s=>`<span>${l.hi?esc(s).split(l.hi).join(`<b>${l.hi}</b>`):esc(s)}</span>`).join(''),py=l.py.split(/(?<=[!?.]) /).map(s=>`<span>${esc(s)}</span>`).join(' ');
  b.innerHTML=`<div class="cwho">${esc(whoName())}</div><div class="czh" data-say="${esc(l.zh)}">${zh}</div><div class="cpy">${py}</div><div class="cen">${esc(l.en)}</div>`;
  wrap.appendChild(b); // taps go through to the creatures below; tapping the speaker says it again
  st.bub=b;place();
  try{sfx('tap')}catch(e){}speak(l.zh);try{LOG('companion',{zh:l.zh,who:st.who})}catch(e){}
  clearTimeout(st.timer);st.timer=setTimeout(()=>hide(),SHOW)}
function place(){const b=st.bub;if(!b)return;const sc=document.getElementById('scene'),W=sc.clientWidth,H=sc.clientHeight,a=anchor(),bw=b.offsetWidth,bh=b.offsetHeight,m=8;
  if(st.who==='star'){// below the star, right edge near it, tail pointing up at it
    const sx=a.x*W,sy=a.y*H,r=H*.046;let left=Math.min(W-m-bw,sx+r*.6-bw);left=Math.max(m,left);const top=Math.min(H-m-bh,sy+r*1.35);
    b.style.left=left+'px';b.style.top=top+'px';b.style.setProperty('--tail',Math.max(10,Math.min(bw-24,left+bw-sx-6))+'px');b.style.setProperty('--ox','100%');b.style.setProperty('--oy','0%')}
  else{// above the lead creature, tail pointing down at it
    const sx=a.x*W,sy=a.y*H,s=H*.085;let left=Math.max(m,Math.min(W-m-bw,sx-22));const top=Math.max(m,sy-s*1.55-bh-8);
    b.style.left=left+'px';b.style.top=top+'px';b.style.setProperty('--tail',Math.max(10,Math.min(bw-24,sx-left-6))+'px');b.style.setProperty('--ox','0%');b.style.setProperty('--oy','100%')}}
function hide(now){clearTimeout(st.timer);const b=st.bub;st.bub=null;if(!b)return;if(now){b.remove();return}b.classList.add('out');setTimeout(()=>b.remove(),320)}
G.SCENE_HOOKS=G.SCENE_HOOKS||[];G.TAP_HOOKS=G.TAP_HOOKS||[];
// the lead creature hops in beside its bubble (Little Star is drawn by story.js)
SCENE_HOOKS.push((ctx,w,h)=>{if(st.bub){place();if(st.who==='lead'&&S.col[0]){const k=Math.min(1,(T-st.t0)*3),s=h*.085*k;
  ctx.save();ctx.globalAlpha=.5*k;ctx.fillStyle='rgba(255,240,170,.55)';ctx.beginPath();ctx.ellipse(LEAD.x*w,LEAD.y*h+s*.05,s*1.1,s*.28,0,0,7);ctx.fill();ctx.restore();
  try{dc(ctx,S.col[0].sp,LEAD.x*w,LEAD.y*h,s,T,{shiny:S.col[0].shiny,hop:Math.abs(Math.sin(T*4))*s*.12})}catch(e){}}}});
// Tap Little Star: every other tap it says one of the things it learned from her (any time it is idle; not rate-limited)
TAP_HOOKS.unshift((x,y)=>{try{if(st.bub){const a=anchor();if(Math.hypot(x-a.x,(y-a.y)*.6)<.08){speak(st.line.zh);return true}return false}
  if(!starOn()||!idleNow())return false;const a=anchor('star');if(Math.hypot(x-a.x,(y-a.y)*.6)>=.07)return false;
  if(!known().length||(st.taps++)%2===0)return false; // fall through to Little Star's own lines
  const l=pickLine();if(!l)return false;const c=cs();c.used[l.zh]=(c.used[l.zh]||0)+1;show(l);return true}catch(e){return false}});
G.Companion={lines:companionLines,known,pickLine,tick,canSpeak,idleNow,speaker,show,hide,st,GAP,IDLE,KNOW_TRACES,ECHO,LIKE,state:cs};
})();
