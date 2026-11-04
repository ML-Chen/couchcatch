// ---------- Chinese holidays by the real date: Spring Festival 春节, Lantern Festival 元宵节, Mid-Autumn Festival 中秋节 ----------
// Each festival runs for a window around its day. While it runs the field is decorated (red lanterns / lantern lights / a big
// moon), a short conversation teaches a few whole holiday phrases, and there is something to tap: red envelopes 红包 (items),
// riddle lanterns 灯谜 (hear the riddle, then see and hear the answer: never a quiz), mooncakes 月饼 (heal the team) and,
// only at Mid-Autumn, the moon moth line (Lunapuff > Lanternmoth > Moonregent, appended to species.js).
// Saved state lives in S.hol (optional, so old saves load). Force an event with ?holiday=cny|lantern|moon|none|YYYY-MM-DD,
// window.COUCHCATCH_HOLIDAY (set before load) or HOLIDAYS.force(...) (null goes back to the real clock).
(function(){
// [Spring Festival (lunar 1/1), Lantern Festival (1/15), Mid-Autumn (8/15)], local dates. Checked against two lunar-calendar
// libraries (lunardate, lunarcalendar). The Lantern Festival is always 14 days after the Spring Festival.
const DATES={
  2026:['2026-02-17','2026-03-03','2026-09-25'],
  2027:['2027-02-06','2027-02-20','2027-09-15'],
  2028:['2028-01-26','2028-02-09','2028-10-03'],
  2029:['2029-02-13','2029-02-27','2029-09-22'],
  2030:['2030-02-03','2030-02-17','2030-09-12'],
  2031:['2031-01-23','2031-02-06','2031-10-01'],
  2032:['2032-02-11','2032-02-25','2032-09-19'],
};
// before/after: days of the window around the festival day (the Spring Festival window ends the day before the Lantern one starts)
const EV={
  cny:    {i:0,before:7,after:6,zh:'春节',  py:'Chūnjié',   en:'Spring Festival',     greet:['新年快乐！','xīn nián kuài lè!','Happy New Year!'],         talk:'holiday_cny_grandma'},
  lantern:{i:1,before:7,after:3,zh:'元宵节',py:'Yuánxiāojié',en:'Lantern Festival',    greet:['元宵节快乐！','yuán xiāo jié kuài lè!','Happy Lantern Festival!'],talk:'holiday_lantern_friend'},
  moon:   {i:2,before:7,after:3,zh:'中秋节',py:'Zhōngqiūjié',en:'Mid-Autumn Festival', greet:['中秋节快乐！','zhōng qiū jié kuài lè!','Happy Mid-Autumn Festival!'],talk:'holiday_moon_grandpa'},
};
// child-level lantern riddles: the riddle, then the answer with a picture
const RIDDLES=[
  {q:['有时像圆盘，有时像小船。','yǒu shí xiàng yuán pán, yǒu shí xiàng xiǎo chuán.','Sometimes it looks like a round plate, sometimes like a little boat.'],a:['是月亮！','shì yuè liang!','It’s the moon!'],pic:'🌙'},
  {q:['一闪一闪亮晶晶，好像天上小眼睛。','yì shǎn yì shǎn liàng jīng jīng, hǎo xiàng tiān shàng xiǎo yǎn jing.','Twinkling and sparkling, like little eyes in the sky.'],a:['是星星！','shì xīng xing!','It’s the stars!'],pic:'⭐'},
  {q:['红公鸡，绿尾巴，身子钻到地底下。','hóng gōng jī, lǜ wěi ba, shēn zi zuān dào dì dǐ xia.','A red rooster with a green tail, its body dug down under the ground.'],a:['是胡萝卜！','shì hú luó bo!','It’s a carrot!'],pic:'🥕'},
  {q:['耳朵长，尾巴短，爱吃萝卜爱吃菜。','ěr duo cháng, wěi ba duǎn, ài chī luó bo ài chī cài.','Long ears, short tail, loves carrots and greens.'],a:['是小白兔！','shì xiǎo bái tù!','It’s a little white rabbit!'],pic:'🐰'},
  {q:['外面绿，里面红，吃起来甜又甜。','wài miàn lǜ, lǐ miàn hóng, chī qǐ lái tián yòu tián.','Green outside, red inside, sweet, sweet, sweet to eat.'],a:['是西瓜！','shì xī guā!','It’s a watermelon!'],pic:'🍉'},
  {q:['身上滑溜溜，天天在水里游。','shēn shang huá liū liū, tiān tiān zài shuǐ lǐ yóu.','Slippery all over, it swims in the water every day.'],a:['是小鱼！','shì xiǎo yú!','It’s a little fish!'],pic:'🐟'},
];
// what you hear when you tap things
const SAY={
  fortune:['恭喜发财！','gōng xǐ fā cái!','Wishing you good fortune!'],
  envelope:['我拿到红包了！','wǒ ná dào hóng bāo le!','I got a red envelope!'],
  cake:['我喜欢吃月饼。','wǒ xǐ huan chī yuè bing.','I like eating mooncakes.'],
  moon:['月亮好圆啊！','yuè liang hǎo yuán a!','The moon is so round!'],
  guess:['猜一猜！','cāi yi cāi!','Guess!'],
};
const UI={title:['Lantern riddle','猜灯谜','cāi dēng mí'],what:['What is it?','是什么？','shì shén me?'],again:['Again','再听一次','zài tīng yí cì'],ok:['OK','好的！','hǎo de!'],close:['Close','关闭','guān bì'],
  env:['Red envelope','红包','hóng bāo'],cakeN:['Mooncake','月饼','yuè bing']};

// ---- conversations (the usual format; only right answers are offered) ----
window.DIALOGUES=window.DIALOGUES||{};
Object.assign(window.DIALOGUES,{
  holiday_cny_grandma:{
    title:{en:'Happy New Year!',zh:'新年快乐！',py:'xīn nián kuài lè!'},
    who:{name:'Grandma',zh:'奶奶',py:'nǎi nai',role:'grandma'},
    setting:'Spring Festival! Grandma comes over with red envelopes.',
    turns:[
      {npc:{zh:'新年快乐！',py:'xīn nián kuài lè!',en:'Happy New Year!'}},
      {you:[{zh:'新年快乐，奶奶！',py:'xīn nián kuài lè, nǎi nai!',en:'Happy New Year, Grandma!',ok:true,reply:{zh:'真乖！今天是春节！',py:'zhēn guāi! jīn tiān shì Chūn jié!',en:'Good kid! Today is the Spring Festival!'}}]},
      {you:[{zh:'恭喜发财！',py:'gōng xǐ fā cái!',en:'Wishing you good fortune!',ok:true,reply:{zh:'恭喜发财！给你一个红包！',py:'gōng xǐ fā cái! gěi nǐ yí ge hóng bāo!',en:'Good fortune to you too! Here’s a red envelope!'}}]},
      {you:[{zh:'谢谢奶奶！',py:'xiè xie nǎi nai!',en:'Thank you, Grandma!',ok:true,reply:{zh:'不客气！',py:'bú kè qi!',en:'You’re welcome!'}}]},
      {npc:{zh:'我们一起吃饺子吧！',py:'wǒ men yì qǐ chī jiǎo zi ba!',en:'Let’s eat dumplings together!'}},
      {you:[{zh:'好啊！我喜欢吃饺子！',py:'hǎo a! wǒ xǐ huan chī jiǎo zi!',en:'Yes! I love dumplings!',ok:true,reply:{zh:'太好了！',py:'tài hǎo le!',en:'Great!'}}]}
    ],
    end:{zh:'新的一年，天天开心！',py:'xīn de yì nián, tiān tiān kāi xīn!',en:'Be happy every day of the new year!'},
    reward:{orb:5,great:1}
  },
  holiday_lantern_friend:{
    title:{en:'Lantern Festival',zh:'元宵节',py:'yuán xiāo jié'},
    who:{name:'Lele',zh:'乐乐',py:'Lè le',role:'friend'},
    setting:'Lantern Festival! Your friend Lele runs over with a lantern.',
    turns:[
      {npc:{zh:'元宵节快乐！',py:'yuán xiāo jié kuài lè!',en:'Happy Lantern Festival!'}},
      {you:[{zh:'元宵节快乐！',py:'yuán xiāo jié kuài lè!',en:'Happy Lantern Festival!',ok:true,reply:{zh:'你看，好多灯笼！',py:'nǐ kàn, hǎo duō dēng long!',en:'Look, so many lanterns!'}}]},
      {you:[{zh:'灯笼好漂亮啊！',py:'dēng long hǎo piào liang a!',en:'The lanterns are so pretty!',ok:true,reply:{zh:'我们去猜灯谜吧！',py:'wǒ men qù cāi dēng mí ba!',en:'Let’s go guess lantern riddles!'}}]},
      {you:[{zh:'好啊！走吧！',py:'hǎo a! zǒu ba!',en:'Okay! Let’s go!',ok:true,reply:{zh:'先吃汤圆！',py:'xiān chī tāng yuán!',en:'First, sweet rice balls!'}}]},
      {you:[{zh:'汤圆真好吃！',py:'tāng yuán zhēn hǎo chī!',en:'The rice balls are yummy!',ok:true,reply:{zh:'是啊！又甜又圆！',py:'shì a! yòu tián yòu yuán!',en:'Yes! Sweet and round!'}}]}
    ],
    end:{zh:'快去看看灯笼吧！',py:'kuài qù kàn kan dēng long ba!',en:'Go and look at the lanterns!'},
    reward:{great:1,berry:2}
  },
  holiday_moon_grandpa:{
    title:{en:'Mid-Autumn Moon',zh:'中秋节',py:'zhōng qiū jié'},
    who:{name:'Grandpa',zh:'爷爷',py:'yé ye',role:'grandpa'},
    setting:'Mid-Autumn Festival! Grandpa brings mooncakes to watch the moon.',
    turns:[
      {npc:{zh:'中秋节快乐！',py:'zhōng qiū jié kuài lè!',en:'Happy Mid-Autumn Festival!'}},
      {you:[{zh:'中秋节快乐，爷爷！',py:'zhōng qiū jié kuài lè, yé ye!',en:'Happy Mid-Autumn Festival, Grandpa!',ok:true,reply:{zh:'你看，今天的月亮！',py:'nǐ kàn, jīn tiān de yuè liang!',en:'Look at the moon tonight!'}}]},
      {you:[{zh:'月亮好圆啊！',py:'yuè liang hǎo yuán a!',en:'The moon is so round!',ok:true,reply:{zh:'对！又圆又亮！',py:'duì! yòu yuán yòu liàng!',en:'Yes! Round and bright!'}}]},
      {npc:{zh:'你想吃月饼吗？',py:'nǐ xiǎng chī yuè bing ma?',en:'Would you like a mooncake?'}},
      {you:[{zh:'想！我喜欢吃月饼。',py:'xiǎng! wǒ xǐ huan chī yuè bing.',en:'Yes! I like eating mooncakes.',ok:true,reply:{zh:'给你一个！',py:'gěi nǐ yí ge!',en:'Here’s one for you!'}}]},
      {you:[{zh:'谢谢爷爷！',py:'xiè xie yé ye!',en:'Thank you, Grandpa!',ok:true,reply:{zh:'不客气！',py:'bú kè qi!',en:'You’re welcome!'}}]}
    ],
    end:{zh:'我们一起看月亮吧！',py:'wǒ men yì qǐ kàn yuè liang ba!',en:'Let’s watch the moon together!'},
    reward:{great:1,berry:2}
  },
});
// every Chinese line this module speaks or shows with a tap-to-hear (tools/zh_strings.js collects these for recording)
window.HOLIDAY_LINES=[...Object.values(EV).map(e=>e.greet[0]),...Object.values(SAY).map(s=>s[0]),...RIDDLES.flatMap(r=>[r.q[0],r.a[0]]),...Object.values(UI).map(u=>u[1])];

if(typeof document==='undefined'||typeof SP==='undefined'||typeof PLACES==='undefined')return; // data only (tools)

// ---------- dates ----------
const dn=(y,m,d)=>Math.round(Date.UTC(y,m-1,d)/864e5);
const isoDn=s=>{const[y,m,d]=s.split('-').map(Number);return dn(y,m,d)};
const localDn=d=>dn(d.getFullYear(),d.getMonth()+1,d.getDate());
// the festival running on date d (a Date or 'YYYY-MM-DD'), or null: {k, id:'2027-cny', day:'2027-02-06', off: days from the festival day}
function at(d){const n=typeof d==='string'?isoDn(d):localDn(d||new Date());
  for(const y in DATES)for(const k in EV){const e=EV[k],h=isoDn(DATES[y][e.i]);if(n>=h-e.before&&n<=h+e.after)return{k,id:y+'-'+k,day:DATES[y][e.i],off:n-h}}
  return null}
let forced=null;
try{const q=new URLSearchParams(location.search).get('holiday');if(q)forced=q}catch(e){}
if(forced==null&&typeof window.COUCHCATCH_HOLIDAY==='string')forced=window.COUCHCATCH_HOLIDAY;
function now(){if(forced==null)return at(new Date());if(forced==='none'||forced==='')return null;if(EV[forced]){const y=new Date().getFullYear();return{k:forced,id:y+'-'+forced,day:(DATES[y]||DATES[2027])[EV[forced].i],off:0,forced:true}}
  if(/^\d{4}-\d\d-\d\d$/.test(forced))return at(forced);return null}
const dayKey=()=>{const d=new Date();return`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`};
function st(){if(!S.hol||typeof S.hol!=='object')S.hol={};const h=S.hol;if(h.day!==dayKey()){h.day=dayKey();h.env=0;h.cake=0}
  h.done=h.done&&typeof h.done==='object'?h.done:{};h.rid=h.rid&&typeof h.rid==='object'?h.rid:{};return h}
const here=()=>S.mode!=='travel'&&S.col&&S.col.length>0;

// ---------- the moon moth line: only at Mid-Autumn ----------
const MOON=['Lunapuff','Lanternmoth','Moonregent'].map(n=>IDX[n]).filter(i=>i!=null);
const isMoon=i=>MOON.includes(i);
{const bi=BASES.indexOf(MOON[0]);if(bi>=0)BASES.splice(bi,1)} // never an ordinary spawn or gym creature
const spawn0=window.spawnWild;
if(typeof spawn0==='function')window.spawnWild=function(road){let w=spawn0.apply(this,arguments);
  const ev=now();
  if(w&&isMoon(w.sp)&&!(ev&&ev.k==='moon'))w=spawn0.apply(this,arguments); // (cannot happen with BASES trimmed; belt and braces)
  if(w&&ev&&ev.k==='moon'&&!road&&MOON.length&&!SP[w.sp].leg&&Math.random()<.22)w.sp=grown(MOON[0],w.lvl,.35);
  return w};
const boss0=window.pickBoss;
if(typeof boss0==='function')window.pickBoss=function(){let r=boss0.apply(this,arguments);const ev=now();for(let n=0;n<30&&r&&isMoon(r.sp)&&!(ev&&ev.k==='moon');n++)r=boss0.apply(this,arguments);return r};

// ---------- painting ----------
const TAU=Math.PI*2;
function glow(ctx,x,y,r,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col.replace('A',a));g.addColorStop(1,col.replace('A',0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
// a round Chinese lantern hanging from (x,y): gold caps, ribbed red silk, a tassel (or a riddle slip), a warm glow
function lantern(ctx,x,y,R,col,t,o={}){const sw=Math.sin(t*1.6+(o.ph||0))*.07;ctx.save();ctx.translate(x,y);ctx.rotate(sw);
  const cy=R*1.15;if(o.glow!==false)glow(ctx,0,cy,R*2.4,'rgba(255,170,80,A)',o.dusk?.55:.32);
  ctx.strokeStyle='rgba(60,30,20,.7)';ctx.lineWidth=Math.max(1,R*.06);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,cy-R*.95);ctx.stroke();
  const g=ctx.createRadialGradient(-R*.3,cy-R*.35,R*.1,0,cy,R*1.1);g.addColorStop(0,o.lit||'#ffb07a');g.addColorStop(.55,col);g.addColorStop(1,o.dark||'#8e1a12');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,cy,R,R*.84,0,0,TAU);ctx.fill();
  ctx.save();ctx.beginPath();ctx.ellipse(0,cy,R,R*.84,0,0,TAU);ctx.clip();ctx.strokeStyle='rgba(110,10,10,.35)';ctx.lineWidth=Math.max(.8,R*.05);
  for(const k of[.36,.7]){ctx.beginPath();ctx.ellipse(0,cy,R*k,R*.84,0,0,TAU);ctx.stroke()}ctx.beginPath();ctx.moveTo(0,cy-R);ctx.lineTo(0,cy+R);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.ellipse(-R*.42,cy-R*.32,R*.18,R*.34,.3,0,TAU);ctx.fill();ctx.restore();
  const gold='#f6c445';ctx.fillStyle=gold;ctx.strokeStyle='#a8741a';ctx.lineWidth=Math.max(.6,R*.04);
  for(const yy of[cy-R*.84-R*.08,cy+R*.84-R*.1]){ctx.beginPath();ctx.roundRect(-R*.42,yy,R*.84,R*.18,R*.06);ctx.fill();ctx.stroke()}
  if(o.glyph){ctx.fillStyle='#ffd65a';ctx.font=`700 ${R*.82}px 'Noto Sans SC',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(o.glyph,0,cy+R*.04)}
  const by=cy+R*.84+R*.08;
  if(o.slip){ctx.strokeStyle='rgba(60,30,20,.7)';ctx.lineWidth=Math.max(1,R*.05);ctx.beginPath();ctx.moveTo(0,by);ctx.lineTo(0,by+R*.25);ctx.stroke();
    const sw2=R*.62,sh=R*.86,sy=by+R*.25;ctx.fillStyle='#fff3d6';ctx.strokeStyle=o.done?'#f2b632':'rgba(160,90,40,.6)';ctx.lineWidth=Math.max(1,R*(o.done?.08:.04));ctx.beginPath();ctx.roundRect(-sw2/2,sy,sw2,sh,R*.08);ctx.fill();ctx.stroke();
    ctx.fillStyle='#c8281e';ctx.font=`700 ${R*.5}px 'Noto Sans SC',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(o.slip,0,sy+sh/2+R*.02)}
  else{ctx.strokeStyle='#e8a92c';ctx.lineWidth=Math.max(.8,R*.05);ctx.beginPath();for(let i=-2;i<=2;i++){ctx.moveTo(i*R*.05,by);ctx.lineTo(i*R*.09+Math.sin(t*2+i)*R*.03,by+R*.75)}ctx.stroke();
    ctx.fillStyle='#e8a92c';ctx.beginPath();ctx.arc(0,by+R*.05,R*.1,0,TAU);ctx.fill()}
  ctx.restore()}
// a rope across the top, sagging in the middle; returns its height at x
const ropeY=(q,h,y0,sag)=>h*(y0+sag*4*q*(1-q));
function rope(ctx,w,h,y0,sag,col){ctx.strokeStyle=col;ctx.lineWidth=Math.max(1.2,h*.006);ctx.beginPath();for(let i=0;i<=20;i++){const q=i/20;i?ctx.lineTo(q*w,ropeY(q,h,y0,sag)):ctx.moveTo(0,ropeY(0,h,y0,sag))}ctx.stroke()}
// dusk: a gentle evening tint over the sky only (creatures stand lower down)
function dusk(ctx,w,h,a){const g=ctx.createLinearGradient(0,0,0,h*.5);g.addColorStop(0,`rgba(28,22,78,${a})`);g.addColorStop(1,'rgba(28,22,78,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h*.5)}
// Spring Festival: a garland of red lanterns, the middle one with 福 (good fortune)
const CNY_L=[.12,.31,.5,.69,.88];
function cnyScene(ctx,w,h,t){rope(ctx,w,h,.035,.05,'rgba(120,30,20,.85)');
  CNY_L.forEach((q,i)=>{const big=i===2,R=h*(big?.05:.04),y=ropeY(q,h,.035,.05);lantern(ctx,q*w,y,R,'#e3342a',t,{ph:i*1.3,glyph:big?'福':null})});
  // a few drifting gold sparkles
  for(let i=0;i<6;i++){const k=((t*.05+i/6)%1),x=w*(.08+((i*37)%84)/100),y=h*(.1+k*.35);ctx.globalAlpha=Math.sin(k*Math.PI)*.8;glow(ctx,x,y,h*.012,'rgba(255,214,90,A)',1);ctx.globalAlpha=1}}
// Lantern Festival: dusk, a string of little lantern lights, and three big riddle lanterns with paper slips
const RL=[{x:.2,y:.08,col:'#e3342a'},{x:.44,y:.12,col:'#f08424',lit:'#ffd08a',dark:'#9a4a0c'},{x:.68,y:.08,col:'#e0457a',lit:'#ffb3cf',dark:'#80173f'}];
const lanternR=h=>h*.052;
function lanternScene(ctx,w,h,t){dusk(ctx,w,h,.42);rope(ctx,w,h,.025,.035,'rgba(40,20,40,.8)');
  for(let i=0;i<11;i++){const q=(i+.5)/11,x=q*w,y=ropeY(q,h,.025,.035)+h*.012,c=['rgba(255,90,70,A)','rgba(255,200,80,A)','rgba(255,140,190,A)'][i%3],a=.65+.35*Math.sin(t*3+i*1.7);glow(ctx,x,y,h*.03,c,a*.6);glow(ctx,x,y,h*.008,'rgba(255,250,230,A)',a)}
  const rid=curRiddles();RL.forEach((L,i)=>{const R=lanternR(h);ctx.strokeStyle='rgba(40,20,40,.8)';ctx.lineWidth=Math.max(1,h*.005);ctx.beginPath();ctx.moveTo(L.x*w,ropeY(L.x,h,.025,.035));ctx.lineTo(L.x*w,L.y*h);ctx.stroke();
    lantern(ctx,L.x*w,L.y*h,R,L.col,t,{ph:i*2.1,slip:'谜',lit:L.lit,dark:L.dark,dusk:true,done:seenRiddle(rid[i])})})}
// Mid-Autumn: dusk, a few stars, a big glowing full moon and sky lanterns rising
const MOONP={x:.72,y:.15,r:.085};
function moonScene(ctx,w,h,t){dusk(ctx,w,h,.55);
  for(let i=0;i<14;i++){const x=w*(((i*53)%97)/97),y=h*(.02+((i*31)%40)/100),a=.4+.6*Math.max(0,Math.sin(t*2+i*2.3));ctx.fillStyle=`rgba(255,250,225,${a*.8})`;ctx.beginPath();ctx.arc(x,y,Math.max(.8,h*.0035),0,TAU);ctx.fill()}
  const mx=MOONP.x*w,my=MOONP.y*h,mr=MOONP.r*h;glow(ctx,mx,my,mr*3,'rgba(255,236,170,A)',.5);
  const g=ctx.createRadialGradient(mx-mr*.35,my-mr*.35,mr*.1,mx,my,mr);g.addColorStop(0,'#fffdf0');g.addColorStop(.6,'#ffeeb5');g.addColorStop(1,'#f3cf78');ctx.fillStyle=g;ctx.beginPath();ctx.arc(mx,my,mr,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(214,170,90,.22)';for(const[a,b,k]of[[-.32,-.18,.26],[.3,.15,.2],[-.05,.42,.15],[.35,-.38,.12],[-.45,.3,.1]]){ctx.beginPath();ctx.arc(mx+a*mr,my+b*mr,mr*k,0,TAU);ctx.fill()}
  // sky lanterns (孔明灯) drifting up
  for(let i=0;i<3;i++){const k=((t*.018+i/3)%1),x=w*(.15+i*.22)+Math.sin(t*.5+i*2)*w*.03,y=h*(.5-k*.5),s=h*.016*(1.2-k*.5);ctx.globalAlpha=Math.min(1,Math.sin(k*Math.PI)*1.6);
    glow(ctx,x,y,s*3.2,'rgba(255,170,70,A)',.55);ctx.fillStyle='#ffb35a';ctx.beginPath();ctx.moveTo(x-s*.7,y-s);ctx.lineTo(x+s*.7,y-s);ctx.lineTo(x+s*.5,y+s);ctx.lineTo(x-s*.5,y+s);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff1b8';ctx.beginPath();ctx.ellipse(x,y+s*.75,s*.3,s*.18,0,0,TAU);ctx.fill();ctx.globalAlpha=1}}
// ground treats
function envelope(ctx,x,y,s,t){const b=Math.sin(t*3+x)*s*.08;ctx.save();ctx.translate(x,y+b);ctx.fillStyle='rgba(20,20,30,.22)';ctx.beginPath();ctx.ellipse(0,s*.62-b,s*.5,s*.12,0,0,TAU);ctx.fill();ctx.rotate(-.12);
  glow(ctx,0,0,s*1.3,'rgba(255,90,60,A)',.35);const g=ctx.createLinearGradient(-s*.4,-s*.6,s*.4,s*.6);g.addColorStop(0,'#ff4a3a');g.addColorStop(1,'#b3160f');ctx.fillStyle=g;ctx.strokeStyle='#f2c14e';ctx.lineWidth=Math.max(1,s*.06);
  ctx.beginPath();ctx.roundRect(-s*.4,-s*.56,s*.8,s*1.12,s*.08);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-s*.4,-s*.3);ctx.quadraticCurveTo(0,-s*.05,s*.4,-s*.3);ctx.stroke();
  ctx.fillStyle='#f6c445';ctx.beginPath();ctx.arc(0,-s*.08,s*.17,0,TAU);ctx.fill();ctx.fillStyle='#b3160f';ctx.font=`700 ${s*.22}px 'Noto Sans SC',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('福',0,-s*.07);
  const sp=(t*2+x)%3;if(sp<.6){ctx.fillStyle=`rgba(255,250,210,${1-sp/.6})`;const k=s*.18;ctx.beginPath();ctx.moveTo(s*.35,-s*.6-k);ctx.lineTo(s*.39,-s*.6);ctx.lineTo(s*.35+k,-s*.6);ctx.lineTo(s*.39,-s*.56);ctx.lineTo(s*.35,-s*.6+k);ctx.lineTo(s*.31,-s*.56);ctx.lineTo(s*.35-k,-s*.6);ctx.lineTo(s*.31,-s*.64);ctx.closePath();ctx.fill()}
  ctx.restore()}
function mooncake(ctx,x,y,s,t){ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(20,20,30,.22)';ctx.beginPath();ctx.ellipse(0,s*.5,s*.62,s*.13,0,0,TAU);ctx.fill();
  glow(ctx,0,0,s*1.25,'rgba(255,214,120,A)',.3+.1*Math.sin(t*3));
  ctx.fillStyle='#a8641f';ctx.beginPath();ctx.ellipse(0,s*.16,s*.55,s*.3,0,0,TAU);ctx.fill(); // side
  const top=new Path2D();for(let i=0;i<=24;i++){const a=i/24*TAU,r=s*(i%2?.5:.56);const px=Math.cos(a)*r,py=Math.sin(a)*r*.55;i?top.lineTo(px,py):top.moveTo(px,py)}top.closePath();
  const g=ctx.createRadialGradient(-s*.15,-s*.12,s*.05,0,0,s*.6);g.addColorStop(0,'#f5c56c');g.addColorStop(1,'#c7802e');ctx.fillStyle=g;ctx.fill(top);ctx.strokeStyle='#8e4f16';ctx.lineWidth=Math.max(.8,s*.04);ctx.stroke(top);
  ctx.strokeStyle='rgba(120,60,15,.55)';ctx.beginPath();ctx.ellipse(0,0,s*.32,s*.17,0,0,TAU);ctx.stroke();ctx.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/4;ctx.moveTo(Math.cos(a)*s*.22,Math.sin(a)*s*.12);ctx.lineTo(-Math.cos(a)*s*.22,-Math.sin(a)*s*.12)}ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(-s*.2,-s*.12,s*.12,s*.05,-.3,0,TAU);ctx.fill();ctx.restore()}

// ---------- field treats: red envelopes (Spring Festival) and mooncakes (Mid-Autumn) ----------
let items=[],itemPlace=-1,nextDrop=null,greeted=null;
const CAP={env:{field:2,day:8,every:18},cake:{field:1,day:4,every:30}};
function dropSpot(){let bx=.5,by=.75,best=-1;for(let k=0;k<14;k++){const cx=.14+Math.random()*.72,cy=.64+Math.random()*.26;let md=9;
  for(const o of (typeof wild!=='undefined'?wild:[]))md=Math.min(md,Math.hypot(o.x-cx,(o.y-cy)*1.6),Math.hypot((o.x-cx)*1.3,(o.y+.07-cy)*1.6));/* the creature and its name tag */for(const o of items)md=Math.min(md,Math.hypot(o.x-cx,(o.y-cy)*1.6));if(md>best){best=md;bx=cx;by=cy}}return{x:bx,y:by}}
function drop(kind){const ev=now();kind=kind||(ev&&ev.k==='cny'?'env':ev&&ev.k==='moon'?'cake':null);if(!kind)return null;const p=dropSpot(),it={kind,x:p.x,y:p.y,born:typeof T!=='undefined'?T:0};items.push(it);itemPlace=S.place;try{LOG('holiday_drop',{kind})}catch(e){}return it}
function grab(it){items=items.filter(o=>o!==it);const h=st();
  if(it.kind==='env'){const r=Math.random(),rw=r<.1?{ultra:1}:r<.35?{great:1}:r<.6?{berry:1}:{orb:3};give(rw);h.env=(h.env||0)+1;sfx('item');speak(SAY.envelope[0]);
    toast(`${UI.env[1]} ${UI.env[2]}! ${SAY.envelope[0]} (${SAY.envelope[1]}) · You got ${rwTxt(rw)}.`);try{LOG('holiday_envelope',{rw:Object.keys(rw)[0]})}catch(e){}}
  else{for(const c of party())c.hp=stats(c).maxhp;give({berry:1});h.cake=(h.cake||0)+1;sfx('berry');speak(SAY.cake[0]);
    toast(`${UI.cakeN[1]} ${UI.cakeN[2]}! ${SAY.cake[0]} (${SAY.cake[1]}) · Your team is full of energy! +1 Calm Berry.`);try{LOG('holiday_mooncake')}catch(e){}}
  save();try{updateUI()}catch(e){}}

// ---------- riddles ----------
function curRiddles(){const n=localDn(new Date());return RL.map((_,i)=>(n*RL.length+i)%RIDDLES.length)}
function seenRiddle(ri){const ev=now();if(!ev)return false;const h=S.hol&&S.hol.rid;return!!(h&&Array.isArray(h[ev.id])&&h[ev.id].includes(ri))}
let rsh=null,rgen=0;
function riddleSheet(){if(rsh)return rsh;const css=`#sHol .inner{height:100%;gap:10px}#sHol .stage{gap:8px}#sHol canvas.rl{width:84px;height:112px;flex:none}
#sHol .rq{font-family:'Noto Sans SC',sans-serif;text-wrap:balance;font-size:1.35rem;font-weight:700;line-height:1.35;cursor:pointer}#sHol .rpy{text-wrap:balance;font-size:.92rem;opacity:.9}#sHol .ren{font-size:.8rem;color:var(--muted)}
#sHol .ans{display:flex;flex-direction:column;align-items:center;gap:2px;animation:holpop .45s ease-out}#sHol .ans .bigpic{font-size:3.6rem}#sHol .ans .bigzh{font-size:2rem;cursor:pointer}
#sHol .rbtns{display:grid;grid-template-columns:1fr 1fr;gap:8px;flex:none}#sHol .rbtns .one{grid-column:1/-1}
@keyframes holpop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
@media (max-height:600px){#sHol canvas.rl{width:66px;height:88px}#sHol .rq{font-size:1.25rem}#sHol .ans .bigpic{font-size:2.8rem}#sHol .ans .bigzh{font-size:1.7rem}}`;
  const sty=document.createElement('style');sty.textContent=css;document.head.appendChild(sty);
  rsh=document.createElement('div');rsh.className='sheet lesson';rsh.id='sHol';rsh.hidden=true;
  rsh.innerHTML=`<div class="inner"><div class="row"><h2>${UI.title[0]}${zw(UI.title[1],UI.title[2])}</h2><button class="small" id="holClose">${UI.close[0]}${zw(UI.close[1],UI.close[2])}</button></div>
  <div class="stage" id="holStage"></div><div class="rbtns" id="holBtns"></div></div>`;document.body.appendChild(rsh);
  rsh.querySelector('#holClose').onclick=closeRiddle;return rsh}
function closeRiddle(){rgen++;try{window.stopSpeech&&stopSpeech()}catch(e){}if(rsh)rsh.hidden=true;try{lastIdle=T}catch(e){}try{updateUI()}catch(e){}}
async function sayAll(list,gen){for(const z of list){if(gen!==rgen)return;try{await (window.speakAsync?speakAsync(z):Promise.resolve(speak(z)))}catch(e){}await new Promise(r=>setTimeout(r,250))}}
function openRiddle(i){const ri=curRiddles()[i];if(ri==null)return;const R=RIDDLES[ri],L=RL[i],el=riddleSheet(),gen=++rgen;
  const stage=el.querySelector('#holStage'),btns=el.querySelector('#holBtns');
  stage.innerHTML=`<canvas class="rl"></canvas><div class="rq" data-say="${R.q[0]}">${R.q[0]}</div><div class="rpy">${R.q[1]}</div><div class="ren">${R.q[2]}</div><div class="ans" id="holAns" hidden></div>`;
  const cv=stage.querySelector('canvas'),d=Math.min(3,devicePixelRatio||1),W=84,H=112;cv.width=W*d;cv.height=H*d;const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);lantern(x,W/2,4,30,L.col,0,{slip:'谜',lit:L.lit,dark:L.dark,glow:false});
  const reveal=()=>{if(gen!==rgen)return;const a=el.querySelector('#holAns');a.hidden=false;a.innerHTML=`<div class="bigpic">${R.pic}</div><div class="bigzh" data-say="${R.a[0]}">${R.a[0]}</div><div class="rpy">${R.a[1]}</div><div class="ren">${R.a[2]}</div>`;
    btns.innerHTML='';const ag=document.createElement('button');ag.innerHTML=`🔊 ${UI.again[0]}${zw(UI.again[1],UI.again[2])}`;ag.onclick=()=>{const g=++rgen;sayAll([R.q[0],R.a[0]],g)};
    const ok=document.createElement('button');ok.className='primary';ok.innerHTML=`${UI.ok[0]}${zw(UI.ok[1],UI.ok[2])}`;ok.onclick=closeRiddle;btns.append(ag,ok);
    const ev=now(),h=st();if(ev){const list=Array.isArray(h.rid[ev.id])?h.rid[ev.id]:(h.rid[ev.id]=[]);if(!list.includes(ri)){list.push(ri);give({orb:2});toast('You got 2 orbs.')}}
    sfx('quest');try{LOG('holiday_riddle',{ri})}catch(e){}save();rgen++;sayAll([R.a[0]],rgen)};
  btns.innerHTML='';const what=document.createElement('button');what.className='primary one';what.id='holWhat';what.innerHTML=`${UI.what[0]}${zw(UI.what[1],UI.what[2])}`;what.onclick=reveal;btns.appendChild(what);
  el.hidden=false;sfx('tap');try{LOG('holiday_riddle_open',{ri})}catch(e){}
  sayAll([SAY.guess[0],R.q[0]],gen)}

// ---------- the scene: decorations, treats and taps ----------
window.SCENE_HOOKS=window.SCENE_HOOKS||[];window.TAP_HOOKS=window.TAP_HOOKS||[];
SCENE_HOOKS.push((ctx,w,h)=>{const ev=now();if(!ev||!here()){items=[];return}const t=typeof T!=='undefined'?T:0;
  if(ev.k==='cny')cnyScene(ctx,w,h,t);else if(ev.k==='lantern')lanternScene(ctx,w,h,t);else moonScene(ctx,w,h,t);
  if(itemPlace!==S.place)items=[];
  const kind=ev.k==='cny'?'env':ev.k==='moon'?'cake':null;items=items.filter(o=>o.kind===kind);
  if(kind){const c=CAP[kind],hs=st(),busy=(typeof sheetOpen==='function'&&sheetOpen())||(typeof C!=='undefined'&&C)||(typeof B!=='undefined'&&B);
    if(nextDrop==null||nextDrop>t+c.every)nextDrop=t+4;
    if(!busy&&(S.mode==='staying'||S.mode==='arrived')&&t>nextDrop){nextDrop=t+c.every;if(items.length<c.field&&(hs[kind]||0)+items.length<c.day)drop(kind)}
    for(const o of items){const s=h*(kind==='env'?.062:.07)*Math.min(1,(t-o.born)*3+.05);(kind==='env'?envelope:mooncake)(ctx,o.x*w,o.y*h,s,t)}}
  // one greeting per festival per session, once the field is free
  if(greeted!==ev.id&&!(typeof sheetOpen==='function'&&sheetOpen())){greeted=ev.id;const g=EV[ev.k].greet;setTimeout(()=>{try{if(sheetOpen())return;toast(`${g[0]} ${g[1]} · ${g[2]}`);speak(g[0])}catch(e){}},1500)}});
TAP_HOOKS.push((x,y)=>{const ev=now();if(!ev||!here())return false;
  for(const o of items)if(Math.hypot(x-o.x,(y-o.y+.02)*.8)<.065){grab(o);return true}
  if(ev.k==='lantern'){for(let i=0;i<RL.length;i++){const L=RL[i];if(Math.abs(x-L.x)<.085&&y>L.y-.02&&y<L.y+.25){openRiddle(i);return true}}}
  else if(ev.k==='moon'){if(Math.hypot(x-MOONP.x,y-MOONP.y)<MOONP.r*1.4){sfx('tap');speak(SAY.moon[0]);toast(`${SAY.moon[0]} ${SAY.moon[1]} · ${SAY.moon[2]}`);return true}}
  else if(y<.2){for(const q of CNY_L)if(Math.abs(x-q)<.07){const l=Math.random()<.5?EV.cny.greet:SAY.fortune;sfx('tap');speak(l[0]);toast(`${l[0]} ${l[1]} · ${l[2]}`);return true}}
  return false});

// ---------- the holiday conversation: once per festival, when the field is free ----------
const od=window.onTalkDone;window.onTalkDone=k=>{try{od&&od(k)}catch(e){}const ev=now();if(ev&&k===EV[ev.k].talk){st().done[ev.id]=1;save()}};
let qAt=0;
setInterval(()=>{try{const ev=now();if(!ev||typeof S==='undefined'||!here())return;const k=EV[ev.k].talk,h=st();
  if(h.done[ev.id]||!(S.talked||{}).intro_neighbor||typeof hasTalk!=='function'||!hasTalk(k))return;
  if(pendingTalks.includes(k)||Date.now()-qAt<60000)return;
  if(sheetOpen()||C||B||E)return;qAt=Date.now();pendingTalks.push(k);try{LOG('holiday_talk_queue',{k})}catch(e){}}catch(e){console.error(e)}},1000);

window.HOLIDAYS={DATES,EV,RIDDLES,SAY,at,now,force(v){forced=v==null?null:String(v);items=[];nextDrop=null;greeted=null},drop,items:()=>items.slice(),grab:i=>{const o=items[i];if(o)grab(o)},
  lanterns:()=>RL.map(L=>({x:L.x,y:L.y})),moonPos:()=>({...MOONP}),openRiddle,closeRiddle,todayRiddles:curRiddles,moonLine:MOON.slice(),isMoon};
})();
