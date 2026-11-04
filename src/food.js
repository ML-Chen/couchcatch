// ---------- Food stalls: order a dish in Chinese ----------
// A little food cart stands at the Hawker Centre (Singapore), the Night Market (Hong Kong) and in the Backyard (Auntie Wang's stand).
// Tapping it opens a short ordering scene in the conversation style: the keeper greets, the child picks a dish (every choice is right),
// says it out loud and taps "I said it!", maybe answers one follow-up (spicy? ice?), says 谢谢！, and the team eats: HP full and some XP.
// Each stall serves FOOD.perDay meals a day (S.food = {day, n:{placeKey:count}}; old saves without it load as "nothing eaten today").
// tools/zh_strings.js loads this file in a sandbox (no document) to collect every Chinese line for recording: keep the data first.
(function(){
var g=(typeof window!=='undefined')?window:this;
function L(zh,py,en){return{zh:zh,py:py,en:en}}
function O(l,reply){l.reply=reply;return l}
var ASKS={
  spicy:{q:L('好的！要不要辣？','hǎo de! yào bu yào là?','OK! Do you want it spicy?'),
    a:[O(Object.assign(L('不要辣，谢谢！','bú yào là, xiè xie!','Not spicy, thanks!'),{pic:'nochili'}),L('好，不辣！','hǎo, bú là!','OK, not spicy!')),
       O(Object.assign(L('要一点儿辣！','yào yì diǎnr là!','A little spicy, please!'),{pic:'chili'}),L('好，一点儿辣！','hǎo, yì diǎnr là!','OK, a little spicy!'))]},
  ice:{q:L('好的！要不要冰？','hǎo de! yào bu yào bīng?','OK! Do you want ice?'),
    a:[O(Object.assign(L('要冰的！','yào bīng de!','With ice, please!'),{pic:'ice'}),L('好，加冰！','hǎo, jiā bīng!','OK, with ice!')),
       O(Object.assign(L('不要冰，谢谢！','bú yào bīng, xiè xie!','No ice, thanks!'),{pic:'noice'}),L('好，不加冰！','hǎo, bù jiā bīng!','OK, no ice!'))]}};
// every dish line is a whole natural sentence; drinks get 慢慢喝, food 慢慢吃
var DISHES={
  chickenrice:Object.assign(L('我要一盘鸡饭。','wǒ yào yì pán jī fàn.','A plate of chicken rice, please.'),{ask:'spicy'}),
  nasilemak:  Object.assign(L('我要椰浆饭。','wǒ yào yē jiāng fàn.','Coconut rice, please.'),{ask:'spicy'}),
  noodles:    Object.assign(L('我要一碗面。','wǒ yào yì wǎn miàn.','A bowl of noodles, please.'),{ask:'spicy'}),
  milktea:    Object.assign(L('我要一杯奶茶。','wǒ yào yì bēi nǎi chá.','A cup of milk tea, please.'),{ask:'ice',drink:true}),
  fishballs:  Object.assign(L('我要一串鱼蛋。','wǒ yào yí chuàn yú dàn.','A stick of fish balls, please.'),{ask:'spicy'}),
  eggwaffle:  L('我要一个鸡蛋仔。','wǒ yào yí gè jī dàn zǎi.','An egg waffle, please.'),
  wonton:     L('我要一碗云吞面。','wǒ yào yì wǎn yún tūn miàn.','A bowl of wonton noodles, please.'),
  baozi:      L('我要一个包子。','wǒ yào yí gè bāo zi.','A steamed bun, please.'),
  dumplings:  L('我要一盘饺子。','wǒ yào yì pán jiǎo zi.','A plate of dumplings, please.'),
  watermelon: L('我要一块西瓜。','wǒ yào yí kuài xī guā.','A slice of watermelon, please.'),
  juice:      Object.assign(L('我要一杯果汁。','wǒ yào yì bēi guǒ zhī.','A glass of juice, please.'),{ask:'ice',drink:true}),
};
var STALLS={
  hawker:{who:{name:'Auntie Lim',zh:'林阿姨',py:'Lín āyí'},look:'hawker',sign:'小吃',dishes:['chickenrice','nasilemak','noodles','milktea'],
    person:{skin:2,hair:'#1d1716',style:'bun',shirt:'#2f8f6a',acc:'apron',accc:'#f3efe4',bg:'#2f5a4a'}},
  hknight:{who:{name:'Uncle Wah',zh:'华叔',py:'Huá shū'},look:'night',sign:'小食',dishes:['fishballs','eggwaffle','wonton','milktea'],
    person:{skin:1,hair:'#1a1412',style:'short',hat:'cap',hatc:'#c0392b',shirt:'#3a3f5a',acc:'apron',accc:'#e8e1d2',bg:'#4a2540',male:1}},
  backyard:{who:{name:'Auntie Wang',zh:'王阿姨',py:'Wáng ā yí'},look:'home',sign:'点心',dishes:['baozi','dumplings','watermelon','juice'],
    person:{skin:1,hair:'#2a2422',style:'curly',shirt:'#5f8f6e',acc:'apron',age:'adult',bg:'#3b5a49'}}};
var LINES={
  hello:L('你好！你要吃什么？','nǐ hǎo! nǐ yào chī shén me?','Hi! What would you like?'),
  ok:L('好的！','hǎo de!','OK!'),
  eat:L('给你！慢慢吃！','gěi nǐ! màn màn chī!','Here you go! Enjoy!'),
  drink:L('给你！慢慢喝！','gěi nǐ! màn màn hē!','Here you go! Enjoy!'),
  thanks:Object.assign(L('谢谢！','xiè xie!','Thank you!'),{pic:'heart'}),
  welcome:L('不客气！','bú kè qi!','You’re welcome!'),
  full:L('吃饱了！','chī bǎo le!','All full!'),
  soldout:L('卖完了！明天再来吧！','mài wán le! míngtiān zài lái ba!','All sold out! Come back tomorrow!'),
  // UI words (tappable, so they are spoken too)
  buy:L('买吃的','mǎi chī de','Get food'),tomorrow:L('明天见','míngtiān jiàn','See you tomorrow'),
  say:L('用中文说','yòng Zhōngwén shuō','Say it in Chinese'),listen:L('听一听，说一说','tīng yi tīng, shuō yi shuō','Listen, then say it'),
  said:L('说了！','shuō le!','I said it!'),next:L('继续','jìxù','Continue')};
g.FOOD={perDay:2,stalls:STALLS,dishes:DISHES,asks:ASKS,lines:LINES};
if(typeof document==='undefined')return; // the string collector stops here

const F=g.FOOD,PER_DAY=F.perDay;
const $=s=>sh.querySelector(s);
// ---------- state ----------
function stallKey(){try{const p=PLACES[S.place];return p&&STALLS[p.key]&&!p.rift?p.key:null}catch(e){return null}}
function here(){return S.col.length&&S.mode!=='travel'&&stallKey()?STALLS[stallKey()]:null}
function eaten(k){const f=S.food;return f&&f.day===today()&&f.n?(f.n[k]||0):0}
function left(k){k=k||stallKey();return k?Math.max(0,PER_DAY-eaten(k)):0}
function markEaten(k){if(!S.food||S.food.day!==today())S.food={day:today(),n:{}};S.food.n=S.food.n||{};S.food.n[k]=(S.food.n[k]||0)+1}
// ---------- the boost: the whole team (the six in battle) is healed, fainted ones too, and each gets a quarter of a level in XP ----------
function feed(){const out={healed:0,xp:0};for(const c of party()){const m=stats(c).maxhp;if(c.hp<m){c.hp=m;out.healed++}
  const n=Math.max(5,Math.round(c.lvl*15*.25));gainXP(c,n);c.hp=Math.max(c.hp,stats(c).maxhp);out.xp=out.xp||n}return out}

// ---------- the cart in the field (drawn under the creatures, like the scenery) ----------
const POS={x:.16,y:.63}; // base of the cart, as a fraction of the scene
function cartBox(){return{x0:POS.x-.12,x1:POS.x+.12,y0:POS.y-.27,y1:POS.y+.02}}
function drawCart(c,w,h,st,closed,t){const s=h*.2,x=POS.x*w,y=POS.y*h,look=st.look,u=s/100;
  const E=(ex,ey,rx,ry,f)=>{c.beginPath();c.ellipse(ex,ey,Math.max(.1,rx),Math.max(.1,ry),0,0,7);c.fillStyle=f;c.fill()};
  const pal=look==='night'?{body:['#b8322c','#7a1d1d'],top:'#e9d8b8',stripe:['#d93a32','#fff3dc'],pole:'#3a2a24',trim:'#f2c14e'}
    :look==='hawker'?{body:['#dfe6ea','#9aa7b0'],top:'#f4f6f7',stripe:['#2f9a6a','#f7f4ea'],pole:'#6d7b84',trim:'#e3b23c'}
    :{body:['#c28a52','#8a5a32'],top:'#e8cfa4',stripe:['#3f7fc4','#fbf6ea'],pole:'#6b4a2e',trim:'#f0c35a'};
  c.save();
  // warm glow (strong at night), soft shadow on the ground
  if(look==='night'&&!closed){const gl=c.createRadialGradient(x,y-s*.75,s*.1,x,y-s*.75,s*1.3);gl.addColorStop(0,'rgba(255,170,90,.38)');gl.addColorStop(1,'rgba(255,170,90,0)');c.fillStyle=gl;c.fillRect(x-s*1.4,y-s*2.1,s*2.8,s*2.4)}
  E(x+s*.04,y+s*.02,s*.62,s*.09,'rgba(0,0,0,.28)');
  // poles + wheels
  c.fillStyle=pal.pole;c.fillRect(x-s*.47,y-s*1.12,s*.05,s*1.0);c.fillRect(x+s*.42,y-s*1.12,s*.05,s*1.0);
  for(const wx of[-.3,.3]){E(x+wx*s,y-s*.06,s*.12,s*.12,'#2b2320');E(x+wx*s,y-s*.06,s*.075,s*.075,'#8a7a6a');E(x+wx*s,y-s*.06,s*.025,s*.025,'#2b2320')}
  // the counter body
  const bg=c.createLinearGradient(0,y-s*.62,0,y-s*.12);bg.addColorStop(0,pal.body[0]);bg.addColorStop(1,pal.body[1]);c.fillStyle=bg;c.beginPath();c.roundRect(x-s*.55,y-s*.62,s*1.1,s*.5,s*.05);c.fill();
  c.strokeStyle='rgba(0,0,0,.22)';c.lineWidth=1;c.stroke();
  c.fillStyle=pal.body[1];c.beginPath();c.moveTo(x+s*.55,y-s*.6);c.lineTo(x+s*.63,y-s*.66);c.lineTo(x+s*.63,y-s*.18);c.lineTo(x+s*.55,y-s*.12);c.closePath();c.fill();c.fillStyle='rgba(0,0,0,.18)';c.fill();
  if(look==='home'){c.strokeStyle='rgba(60,35,15,.3)';c.lineWidth=Math.max(1,u*1.2);for(let i=1;i<4;i++){c.beginPath();c.moveTo(x-s*.55,y-s*.62+i*s*.125);c.lineTo(x+s*.55,y-s*.62+i*s*.125);c.stroke()}}
  else{c.fillStyle='rgba(255,255,255,.22)';c.fillRect(x-s*.5,y-s*.58,s*1.0,s*.05)}
  // a sign on the front of the counter
  c.fillStyle=pal.trim;c.beginPath();c.roundRect(x-s*.26,y-s*.5,s*.52,s*.24,s*.04);c.fill();
  c.fillStyle=look==='hawker'?'#1f5a40':'#5a1a12';c.font=`700 ${Math.max(8,s*.17)}px 'Noto Sans SC',sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(st.sign,x,y-s*.375);
  // counter top + food on it
  c.fillStyle=pal.top;c.beginPath();c.roundRect(x-s*.6,y-s*.68,s*1.2,s*.08,s*.03);c.fill();
  if(!closed){
    if(look==='night'){E(x-s*.28,y-s*.72,s*.2,s*.06,'#3a3a40');c.fillStyle='#55565e';c.fillRect(x-s*.48,y-s*.86,s*.4,s*.14);E(x-s*.28,y-s*.86,s*.2,s*.05,'#c9852f');
      for(let i=0;i<3;i++){c.strokeStyle='#d8b98a';c.lineWidth=Math.max(1,u*1.3);c.beginPath();c.moveTo(x+s*(.12+i*.1),y-s*.7);c.lineTo(x+s*(.18+i*.1),y-s*1.0);c.stroke();for(let k=0;k<3;k++)E(x+s*(.135+i*.1+k*.015),y-s*(.78+k*.07),s*.035,s*.035,'#e8a23a')}}
    else{// steamer baskets (bamboo) or a pot
      const sx=x-s*.26;for(let i=0;i<(look==='home'?3:2);i++){const yy=y-s*(.74+i*.1);c.fillStyle=i%2?'#d9b77a':'#c9a464';c.beginPath();c.roundRect(sx-s*.2,yy-s*.05,s*.4,s*.1,s*.03);c.fill();c.strokeStyle='rgba(90,60,20,.45)';c.lineWidth=1;c.stroke()}
      E(sx,y-s*(look==='home'?.98:.88),s*.2,s*.05,'#e3c98f');
      E(x+s*.25,y-s*.73,s*.15,s*.05,'#f6f6f2');E(x+s*.25,y-s*.75,s*.11,s*.03,look==='hawker'?'#e9c46a':'#f2f0ea')}
    // steam
    c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=Math.max(1.2,u*1.8);c.lineCap='round';
    for(let i=0;i<3;i++){const k=((t*.45+i/3)%1),sx0=x-s*(.36-i*.1);c.globalAlpha=(1-k)*.8;c.beginPath();c.moveTo(sx0,y-s*(.95+k*.1));
      c.bezierCurveTo(sx0+s*.08*Math.sin(t*2+i),y-s*(1.05+k*.25),sx0-s*.08*Math.sin(t*2+i),y-s*(1.15+k*.3),sx0+s*.03,y-s*(1.25+k*.35));c.stroke()}
    c.globalAlpha=1}
  else{// closed for today: a cloth over the counter top
    c.fillStyle='rgba(235,225,205,.95)';c.beginPath();c.moveTo(x-s*.58,y-s*.68);c.quadraticCurveTo(x,y-s*.9,x+s*.58,y-s*.68);c.lineTo(x+s*.54,y-s*.56);c.lineTo(x-s*.54,y-s*.56);c.closePath();c.fill()}
  // scalloped striped awning
  // a sloping canopy (narrower at the top), stripes fanning out, and a scalloped valance hanging from its front edge
  const ay=y-s*1.08,aw=s*1.32,ah=s*.3,n=7,tw0=aw*.72;
  for(let i=0;i<n;i++){const t0=x-tw0/2+i*tw0/n,t1=t0+tw0/n,b0=x-aw/2+i*aw/n,b1=b0+aw/n;c.fillStyle=pal.stripe[i%2];c.beginPath();c.moveTo(t0,ay-ah);c.lineTo(t1,ay-ah);c.lineTo(b1,ay);c.lineTo(b0,ay);c.closePath();c.fill();
    c.beginPath();c.moveTo(b0,ay-.5);c.lineTo(b1,ay-.5);c.lineTo(b1,ay+ah*.18);c.ellipse((b0+b1)/2,ay+ah*.18,aw/n/2,ah*.26,0,0,Math.PI);c.closePath();c.fill()}
  const hl=c.createLinearGradient(0,ay-ah,0,ay);hl.addColorStop(0,'rgba(255,255,255,.3)');hl.addColorStop(1,'rgba(0,0,0,.12)');c.fillStyle=hl;c.beginPath();c.moveTo(x-tw0/2,ay-ah);c.lineTo(x+tw0/2,ay-ah);c.lineTo(x+aw/2,ay);c.lineTo(x-aw/2,ay);c.closePath();c.fill();
  c.fillStyle='rgba(0,0,0,.14)';c.fillRect(x-aw/2,ay,aw,Math.max(1,ah*.07));
  c.fillStyle=pal.pole;c.beginPath();c.roundRect(x-tw0/2-s*.02,ay-ah-s*.03,tw0+s*.04,s*.05,s*.025);c.fill();
  // a lantern at night
  if(look==='night'){const lx=x+s*.52,ly=ay+ah*.75;c.strokeStyle='#3a2a24';c.lineWidth=1;c.beginPath();c.moveTo(lx,ay+ah*.1);c.lineTo(lx,ly-s*.1);c.stroke();
    if(!closed){const lg=c.createRadialGradient(lx,ly,1,lx,ly,s*.32);lg.addColorStop(0,'rgba(255,120,80,.6)');lg.addColorStop(1,'rgba(255,120,80,0)');c.fillStyle=lg;c.fillRect(lx-s*.35,ly-s*.35,s*.7,s*.7)}
    E(lx,ly,s*.1,s*.12,closed?'#7a2a24':'#e8402f');c.fillStyle='#f2c14e';c.fillRect(lx-s*.05,ly-s*.14,s*.1,s*.03);c.fillRect(lx-s*.05,ly+s*.11,s*.1,s*.03)}
  c.restore();
  // a little label like the creatures and the papers have
  const lab=closed?LINES.tomorrow.zh:LINES.buy.zh,lab2=closed?LINES.tomorrow.py:LINES.buy.py;c.font=`700 ${Math.max(10,h*.032)}px 'Noto Sans SC',sans-serif`;
  const tw=Math.max(c.measureText(lab).width,c.measureText(lab2).width*.85),lh=h*.042,lx=x,ly=ay-ah-lh*2.05;
  c.globalAlpha=closed?.7:1;c.fillStyle='rgba(16,18,22,.66)';c.beginPath();c.roundRect(lx-tw/2-7,ly,tw+14,lh*1.85,6);c.fill();c.strokeStyle='rgba(255,231,176,.35)';c.lineWidth=1;c.stroke();
  c.fillStyle='#ffe7b0';c.textAlign='center';c.textBaseline='middle';c.fillText(lab,lx,ly+lh*.55);
  c.font=`600 ${Math.max(9,h*.027)}px Manrope,sans-serif`;c.fillStyle='rgba(255,255,255,.82)';c.fillText(lab2,lx,ly+lh*1.35);c.globalAlpha=1}
g.GROUND_HOOKS=g.GROUND_HOOKS||[];g.TAP_HOOKS=g.TAP_HOOKS||[];
GROUND_HOOKS.push((c,w,h)=>{const st=here();if(st)drawCart(c,w,h,st,!left(),T)});
TAP_HOOKS.push((x,y)=>{if(!here())return false;const b=cartBox();if(x<b.x0||x>b.x1||y<b.y0||y>b.y1)return false;
  // a creature standing right there gets the tap instead
  for(const wd of wild)if(Math.hypot(wd.x-x,(wd.y-.07-y)*.75)<.08)return false;
  sfx('tap');if(!left()){toast(`Sold out today · ${LINES.soldout.zh} (${LINES.soldout.py})`);speak(LINES.soldout.zh);return true}
  openFood();return true});

// ---------- small drawn food pictures ----------
function drawFood(c,kind,x,y,r){const E=(ex,ey,rx,ry,f,rot=0)=>{c.beginPath();c.ellipse(ex,ey,Math.max(.1,rx),Math.max(.1,ry),rot,0,7);c.fillStyle=f;c.fill()};
  const bowl=(inner)=>{E(x,y+r*.55,r*.55,r*.12,'rgba(0,0,0,.18)');c.fillStyle='#f4f1ea';c.beginPath();c.moveTo(x-r*.85,y-r*.05);c.quadraticCurveTo(x-r*.8,y+r*.6,x,y+r*.6);c.quadraticCurveTo(x+r*.8,y+r*.6,x+r*.85,y-r*.05);c.fill();
    c.strokeStyle='#3f6fb5';c.lineWidth=Math.max(1,r*.07);c.beginPath();c.moveTo(x-r*.78,y+r*.18);c.quadraticCurveTo(x,y+r*.36,x+r*.78,y+r*.18);c.stroke();
    E(x,y-r*.05,r*.85,r*.26,'#e6e1d6');E(x,y-r*.03,r*.75,r*.2,inner)};
  const plate=()=>{E(x,y+r*.36,r*.98,r*.46,'rgba(0,0,0,.15)');E(x,y+r*.26,r*.98,r*.46,'#f7f5f0');c.strokeStyle='#3f6fb5';c.lineWidth=Math.max(1,r*.05);c.beginPath();c.ellipse(x,y+r*.26,r*.86,r*.38,0,0,7);c.stroke();E(x,y+r*.26,r*.72,r*.3,'#ecebe6')};
  const noodles=(col)=>{c.strokeStyle=col;c.lineWidth=Math.max(1,r*.07);for(let i=0;i<4;i++){c.beginPath();c.moveTo(x-r*.6+i*r*.12,y-r*.04);c.bezierCurveTo(x-r*.3+i*r*.1,y-r*.18,x+i*r*.08,y+r*.1,x+r*.5-i*r*.05,y-r*.06);c.stroke()}};
  const glass=(liq,top)=>{E(x,y+r*.82,r*.42,r*.1,'rgba(0,0,0,.15)');c.fillStyle='rgba(225,240,250,.55)';c.beginPath();c.moveTo(x-r*.48,y-r*.7);c.lineTo(x-r*.38,y+r*.8);c.lineTo(x+r*.38,y+r*.8);c.lineTo(x+r*.48,y-r*.7);c.closePath();c.fill();
    c.fillStyle=liq;c.beginPath();c.moveTo(x-r*.44,y-r*.4);c.lineTo(x-r*.37,y+r*.74);c.lineTo(x+r*.37,y+r*.74);c.lineTo(x+r*.44,y-r*.4);c.closePath();c.fill();E(x,y-r*.4,r*.44,r*.08,top);
    c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=Math.max(1,r*.06);c.beginPath();c.moveTo(x-r*.3,y-r*.3);c.lineTo(x-r*.25,y+r*.6);c.stroke();
    c.strokeStyle='#e8504a';c.lineWidth=Math.max(1.5,r*.1);c.beginPath();c.moveTo(x+r*.12,y+r*.3);c.lineTo(x+r*.3,y-r*.95);c.lineTo(x+r*.5,y-r*1.0);c.stroke()};
  const cross=()=>{c.strokeStyle='#e0453a';c.lineWidth=Math.max(2,r*.16);c.lineCap='round';c.beginPath();c.arc(x,y,r*.9,0,7);c.stroke();c.beginPath();c.moveTo(x-r*.62,y+r*.62);c.lineTo(x+r*.62,y-r*.62);c.stroke()};
  const chili=(s=1)=>{c.fillStyle='#d8322a';c.beginPath();c.moveTo(x-r*.5*s,y-r*.35*s);c.quadraticCurveTo(x+r*.7*s,y-r*.45*s,x+r*.45*s,y+r*.65*s);c.quadraticCurveTo(x+r*.15*s,y-r*.05*s,x-r*.5*s,y-r*.05*s);c.closePath();c.fill();
    E(x-r*.15*s,y-r*.28*s,r*.18*s,r*.05*s,'rgba(255,255,255,.4)',-.1);c.fillStyle='#3f8f3a';c.beginPath();c.roundRect(x-r*.68*s,y-r*.3*s,r*.22*s,r*.22*s,r*.05);c.fill()};
  const cube=(dx,dy,s)=>{c.fillStyle='rgba(190,230,255,.95)';c.beginPath();c.roundRect(x+dx-r*s/2,y+dy-r*s/2,r*s,r*s,r*s*.2);c.fill();c.strokeStyle='rgba(90,160,210,.8)';c.lineWidth=1;c.stroke();
    c.fillStyle='rgba(255,255,255,.8)';c.fillRect(x+dx-r*s*.3,y+dy-r*s*.3,r*s*.22,r*s*.22)};
  c.save();c.lineCap='round';c.lineJoin='round';
  switch(kind){
  case'noodles':bowl('#e7b46a');noodles('#f6dc8a');E(x+r*.3,y-r*.08,r*.1,r*.05,'#5fb24a');E(x-r*.35,y-r*.02,r*.08,r*.04,'#5fb24a');
    c.strokeStyle='#8a5a32';c.lineWidth=Math.max(1.5,r*.08);c.beginPath();c.moveTo(x-r*.2,y-r*.85);c.lineTo(x+r*.95,y-r*.15);c.moveTo(x-r*.05,y-r*.95);c.lineTo(x+r*1.0,y-r*.3);c.stroke();break;
  case'wonton':bowl('#e7c27a');noodles('#f6dc8a');for(const [dx,dy] of[[-.35,-.08],[.05,-.12],[.38,-.04]]){E(x+dx*r,y+dy*r,r*.2,r*.13,'#fbf0dc');E(x+dx*r,y+(dy-.06)*r,r*.1,r*.07,'#f2dcc0')}E(x+r*.18,y+r*.02,r*.08,r*.04,'#5fb24a');break;
  case'chickenrice':plate();E(x-r*.28,y+r*.12,r*.45,r*.34,'#fbfaf5');E(x-r*.3,y-r*.02,r*.32,r*.18,'#ffffff');
    for(let i=0;i<4;i++){const sx=x+r*(.02+i*.16),sy=y+r*(.02+i*.05);c.fillStyle='#f6e3bd';c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+r*.2,sy-r*.1);c.lineTo(sx+r*.26,sy+r*.3);c.lineTo(sx+r*.06,sy+r*.4);c.closePath();c.fill();c.strokeStyle='#d9a54e';c.lineWidth=Math.max(1,r*.07);c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+r*.2,sy-r*.1);c.stroke()}
    E(x+r*.6,y+r*.42,r*.13,r*.07,'#5fb24a');E(x-r*.65,y-r*.2,r*.17,r*.1,'#d8322a');break;
  case'nasilemak':E(x,y+r*.3,r*.98,r*.38,'#3f8f3a');E(x,y+r*.26,r*.88,r*.3,'#5fb24a');E(x-r*.15,y+r*.1,r*.4,r*.28,'#fbfaf5');E(x-r*.15,y,r*.3,r*.16,'#ffffff');
    E(x+r*.45,y+r*.15,r*.22,r*.15,'#ffffff');E(x+r*.45,y+r*.13,r*.11,r*.08,'#f5b82e');E(x-r*.55,y+r*.38,r*.16,r*.1,'#c8341f');
    for(const [dx,dy] of[[.15,.45],[.25,.5],[.05,.52]])E(x+dx*r,y+dy*r,r*.06,r*.04,'#b07a3a');E(x+r*.6,y+r*.42,r*.12,r*.06,'#9fd47a');break;
  case'milktea':glass('#c99a6a','#d9b085');cube(-.1*r,-.15*r,.22);cube(.1*r,.0,.2);break;
  case'juice':glass('#f5a623','#ffc04d');cube(-.12*r,-.12*r,.2);E(x-r*.45,y-r*.72,r*.22,r*.22,'#ffb02e');E(x-r*.45,y-r*.72,r*.15,r*.15,'#ffd36b');break;
  case'fishballs':c.strokeStyle='#c9a36a';c.lineWidth=Math.max(1.5,r*.08);c.beginPath();c.moveTo(x-r*.75,y+r*.85);c.lineTo(x+r*.55,y-r*.9);c.stroke();
    for(let i=0;i<4;i++){const px=x-r*.45+i*r*.3,py=y+r*.45-i*r*.4;E(px,py,r*.24,r*.24,'#e9a53a');E(px-r*.07,py-r*.08,r*.08,r*.06,'rgba(255,255,255,.45)')}break;
  case'eggwaffle':c.fillStyle='#e8b04a';c.beginPath();c.moveTo(x-r*.9,y-r*.2);c.quadraticCurveTo(x,y-r*.75,x+r*.9,y-r*.25);c.quadraticCurveTo(x+r*.7,y+r*.6,x,y+r*.65);c.quadraticCurveTo(x-r*.7,y+r*.6,x-r*.9,y-r*.2);c.fill();
    for(let j=0;j<3;j++)for(let i=0;i<5-(j===2?1:0);i++)E(x-r*.6+i*r*.3+(j%2)*r*.12,y-r*.15+j*r*.27,r*.13,r*.11,'#f6cf6a');break;
  case'baozi':E(x,y+r*.55,r*.82,r*.16,'#c9a464');c.fillStyle='#fbf8f1';c.beginPath();c.moveTo(x-r*.78,y+r*.5);c.quadraticCurveTo(x-r*.82,y-r*.45,x,y-r*.5);c.quadraticCurveTo(x+r*.82,y-r*.45,x+r*.78,y+r*.5);c.closePath();c.fill();c.strokeStyle='rgba(160,130,90,.55)';c.lineWidth=Math.max(1,r*.05);c.stroke();
    c.strokeStyle='rgba(170,140,100,.75)';c.lineWidth=Math.max(1,r*.06);for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(x,y-r*.42);c.quadraticCurveTo(x+i*r*.18,y-r*.25,x+i*r*.3,y-r*.08);c.stroke()}E(x,y-r*.42,r*.07,r*.05,'#d8c7a8');E(x-r*.4,y+r*.15,r*.12,r*.18,'rgba(255,255,255,.8)');break;
  case'dumplings':plate();for(const [dx,dy] of[[-.36,.1],[.3,.08],[0,.42]]){const px=x+dx*r,py=y+dy*r;E(px,py+r*.1,r*.36,r*.08,'#d9a45a');c.fillStyle='#fbf1dc';c.beginPath();c.moveTo(px-r*.36,py+r*.1);c.quadraticCurveTo(px-r*.3,py-r*.3,px,py-r*.3);c.quadraticCurveTo(px+r*.3,py-r*.3,px+r*.36,py+r*.1);c.closePath();c.fill();c.strokeStyle='rgba(160,120,70,.6)';c.lineWidth=Math.max(1,r*.04);c.stroke();
    c.beginPath();for(let k=-2;k<=2;k++){c.moveTo(px+k*r*.1,py-r*.27+Math.abs(k)*r*.04);c.lineTo(px+k*r*.1+r*.03,py-r*.14+Math.abs(k)*r*.04)}c.stroke()}break;
  case'watermelon':c.fillStyle='#3f8f3a';c.beginPath();c.moveTo(x-r*.9,y-r*.1);c.quadraticCurveTo(x,y+r*1.05,x+r*.9,y-r*.1);c.closePath();c.fill();c.fillStyle='#bfe3a0';c.beginPath();c.moveTo(x-r*.8,y-r*.1);c.quadraticCurveTo(x,y+r*.88,x+r*.8,y-r*.1);c.closePath();c.fill();
    c.fillStyle='#ef4f5a';c.beginPath();c.moveTo(x-r*.72,y-r*.1);c.quadraticCurveTo(x,y+r*.75,x+r*.72,y-r*.1);c.closePath();c.fill();for(const [dx,dy] of[[-.35,.05],[0,.2],[.35,.05],[-.12,.4],[.15,.38]])E(x+dx*r,y+dy*r,r*.04,r*.07,'#2a1a14');
    c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.ellipse(x-r*.3,y,r*.25,r*.06,.2,0,7);c.fill();break;
  case'chili':chili(1);break;
  case'nochili':chili(.8);cross();break;
  case'ice':cube(-r*.3,r*.2,.6);cube(r*.32,r*.25,.5);cube(0,-r*.35,.55);break;
  case'noice':cube(0,0,.8);cross();break;
  case'heart':c.fillStyle='#ff6b8a';c.beginPath();c.moveTo(x,y+r*.75);c.bezierCurveTo(x-r*1.1,y,x-r*.6,y-r*.85,x,y-r*.35);c.bezierCurveTo(x+r*.6,y-r*.85,x+r*1.1,y,x,y+r*.75);c.fill();E(x-r*.35,y-r*.3,r*.15,r*.1,'rgba(255,255,255,.5)',-.5);break;
  }
  c.restore()}
function paint(cv,kind){try{const d=devicePixelRatio||1,S2=cv.clientWidth||44;cv.width=S2*d;cv.height=S2*d;const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);drawFood(c,kind,S2/2,S2/2,S2*.47)}catch(e){}}

// ---------- the ordering sheet (reuses the conversation look: bubbles, cue ring, buttons) ----------
const css=`#sFood .inner{height:100%;gap:8px}
#sFood .talkhead .nm{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:6px;line-height:1.2}#sFood .nm b{font-family:'Noto Sans SC',sans-serif;font-size:1.15rem;font-weight:700}#sFood .nm i{font-style:normal;font-size:.85rem;opacity:.85}#sFood .nm span{flex-basis:100%;font-size:.72rem;opacity:.7;font-family:var(--body)}.lvl-2 #sFood .nm span,.lvl-3 #sFood .nm span{display:none}
#sFood .talkhead canvas.avatar.person{width:56px;height:56px}
#sFood .fx{margin-left:auto;flex:none;padding:6px 11px}
#sFood .talkpanel{gap:6px}
#sFood .talkcue{padding:8px 10px}
.dishes{display:flex;flex-direction:column;gap:5px}
.dishes .dish{display:flex;align-items:center;gap:10px;text-align:left;padding:5px 10px;min-width:0;border-radius:18px}
.dishes .dish canvas{width:46px;height:46px;flex:none}
.dishes .dish .t{display:flex;flex-direction:column;min-width:0;line-height:1.2}
.dishes .dish .z{font-family:'Noto Sans SC',sans-serif;font-size:1.05rem;font-weight:700}
.dishes .dish .p{font-size:.74rem;opacity:.85;font-family:var(--body);font-weight:500}
.dishes .dish .e{font-size:.66rem;opacity:.68;font-family:var(--body);font-weight:500}
.dishes .dish.sel{outline:3px solid var(--accent);outline-offset:-1px}
.lvl-2 .dishes .dish .e,.lvl-3 .dishes .dish .e{display:none}.lvl-3 .dishes .dish .p{display:none}.lvl-3 .dishes .dish.sel .p{display:block}
#sFood .said{width:100%}
@media (max-height:600px){#sFood .talkhead canvas.avatar.person{width:46px;height:46px}#sFood .inner{gap:6px}#sFood .talkcue{padding:5px 10px}#sFood .ring{width:36px;height:36px}.dishes{gap:4px}.dishes .dish{padding:3px 10px}.dishes .dish canvas{width:40px;height:40px}.dishes .dish .z{font-size:.98rem}#sFood .said{padding-top:7px;padding-bottom:7px}#sFood .bub{padding:6px 11px}}
.bub .fpic{width:56px;height:56px;display:block;margin:4px auto 0}
.fed{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:18px;background:var(--panel)}
.fed canvas{width:48px;height:48px;flex:none}.fed .t{display:flex;flex-direction:column;gap:2px;font-family:var(--display);font-weight:600}
.fed .z{font-family:'Noto Sans SC',sans-serif;font-size:1.15rem;font-weight:700}.fed .p{font-size:.8rem;font-weight:500;opacity:.85}.fed .e{font-size:.7rem;font-weight:500;opacity:.7}.lvl-2 .fed .e,.lvl-3 .fed .e{display:none}
.fed .chips{display:flex;gap:6px;flex-wrap:wrap}.fed .chips span{font-size:.82rem;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,.55)}`;
const sty=document.createElement('style');sty.textContent=css;document.head.appendChild(sty);
const sh=document.createElement('div');sh.className='sheet food';sh.id='sFood';sh.hidden=true;
sh.innerHTML=`<div class="inner"><div class="talkhead"><canvas class="avatar person" id="fdAv"></canvas><div style="flex:1;min-width:0"><div class="nm" id="fdWho"></div></div><button class="small fx" id="fdClose" aria-label="Close">✕</button></div>
  <div class="talklog" id="fdLog"></div><div class="talkpanel" id="fdPanel"></div></div>`;
document.body.appendChild(sh);
try{new ResizeObserver(()=>scrollLog()).observe($('#fdLog'))}catch(e){}
sh.addEventListener('click',e=>{const b=e.target.closest('.bub');if(b&&b.dataset.say)speakAsync(b.dataset.say)});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const readMs=l=>Math.min(4200,1000+String(l.zh||'').length*160+String(l.en||'').length*15)*(window.TALK_PACE||1);
const ZW=l=>zw(l.zh,l.py);
let gen=0,cur=null;
function scrollLog(){const lg=$('#fdLog');requestAnimationFrame(()=>{lg.scrollTop=lg.scrollHeight})}
function bubble(kind,l,pic){const lg=$('#fdLog'),b=document.createElement('div');b.className='bub '+kind;b.dataset.say=l.zh;
  b.innerHTML=`<div class="z">${l.zh}</div><div class="p">${l.py||''}</div>${l.en?`<div class="e">${l.en}</div>`:''}${pic?'<canvas class="fpic"></canvas>':''}`;
  if(kind==='npc'&&cur){const row=document.createElement('div');row.className='bubrow';const cv=document.createElement('canvas');cv.className='mini-person';row.append(cv,b);lg.appendChild(row);try{drawPerson(cv,cur.st.person,false)}catch(e){}}
  else lg.appendChild(b);if(pic)paint(b.querySelector('canvas'),pic);scrollLog();return b}
// say a line (with the reading pause), stopping if the sheet was closed
async function npc(my,l,pic){bubble('npc',l,pic);await Promise.all([speakAsync(l.zh).catch(()=>{}),wait(readMs(l))]);if(my!==gen)throw ABORT}
const ABORT={};
// One turn for the child: every option is right. Big kids see all of them (with pictures) and tap one (it plays);
// little kids hear the one line first. Then "I said it!" sends the line.
function choose(my,opts){return new Promise(async(res,rej)=>{const young=!!(window.isYoung&&isYoung());if(young)opts=[opts[0]];
  const P=$('#fdPanel'),one=opts.length===1;
  P.innerHTML=`<div class="talkcue"><div class="c">${young?ZW(LINES.listen):`${one?`Say it in Chinese: “${opts[0].en}”`:'Pick one and say it'}${ZW(LINES.say)}`}</div><div class="ring"><span></span></div></div>
    <div class="dishes"></div><button class="big said" disabled>I said it!${ZW(LINES.said)}</button>`;
  const box=P.querySelector('.dishes'),said=P.querySelector('.said');let pick=null;
  const sel=(o,b,talk)=>{pick=o;[...box.children].forEach(x=>x.classList.toggle('sel',x===b));said.disabled=false;if(talk)speakAsync(o.zh)};
  opts.forEach((o,i)=>{const b=document.createElement('button');b.className='dish';b.dataset.i=i;
    b.innerHTML=`${o.pic?'<canvas></canvas>':''}<div class="t"><div class="z">${o.zh}</div><div class="p">${o.py}</div><div class="e">${o.en}</div></div>`;
    b.onclick=()=>sel(o,b,true);box.appendChild(b);if(o.pic)paint(b.querySelector('canvas'),o.pic)});
  said.onclick=()=>{if(pick&&my===gen)res(pick)};
  const ringEl=P.querySelector('.ring');let ringDone=false;const ring=()=>new Promise(r=>{const t0=performance.now(),D=(young?4:3)*1000;ringEl._skip=()=>{ringDone=true};
    const f=()=>{const k=ringDone?1:Math.min(1,(performance.now()-t0)/D);ringEl.style.setProperty('--p',(k*100)+'%');const s=ringEl.querySelector('span');if(s)s.textContent=Math.ceil((D/1000)*(1-k))||'';if(k>=1||my!==gen){r();return}requestAnimationFrame(f)};f()});
  if(young){try{await speakAsync(opts[0].zh)}catch(e){}if(my!==gen)return rej(ABORT);sel(opts[0],box.children[0],false)}
  ring()})}
async function youSay(my,o){$('#fdPanel').innerHTML='';bubble('you',o);try{questEv('words')}catch(e){}
  await Promise.all([speakAsync(o.zh).catch(()=>{}),wait(800*(window.TALK_PACE||1))]);if(my!==gen)throw ABORT}
// opens the stall and returns at once (true when it opened); the scene plays on by itself
function openFood(){const k=stallKey(),st=k&&STALLS[k];if(!st||!S.col.length||!left(k)||!sh.hidden)return false;if(typeof B!=='undefined'&&B)return false;
  const my=++gen;cur={k,st};try{stopSpeech()}catch(e){}
  try{preloadZh(LINES.hello.zh);for(const d of st.dishes)preloadZh(DISHES[d].zh)}catch(e){}
  drawPerson($('#fdAv'),st.person,false);$('#fdWho').innerHTML=`<b data-say="${st.who.zh}">${st.who.zh}</b><i>${st.who.py}</i><span>${st.who.name}</span>`;$('#fdLog').innerHTML='';$('#fdPanel').innerHTML='';sh.hidden=false;
  try{LOG('food_open',{place:k,left:left(k)})}catch(e){}
  play(my,k,st);return true}
async function play(my,k,st){
  try{
    await npc(my,LINES.hello);
    const young=!!(window.isYoung&&isYoung());
    // little kids get a different dish each time (by how many meals they have had), big kids choose
    let menu=st.dishes.map(id=>Object.assign({id,pic:id},DISHES[id]));if(young){const n=(S.foodN||0)%menu.length;menu=menu.slice(n).concat(menu.slice(0,n))}
    const dish=await choose(my,menu);await youSay(my,dish);
    const ask=dish.ask&&ASKS[dish.ask];let extra=null;
    if(ask){await npc(my,ask.q);extra=await choose(my,ask.a.map(a=>Object.assign({},a)));await youSay(my,extra);await npc(my,extra.reply)}
    else await npc(my,LINES.ok);
    await npc(my,dish.drink?LINES.drink:LINES.eat,dish.pic);
    const th=await choose(my,[Object.assign({},LINES.thanks)]);await youSay(my,th);
    await npc(my,LINES.welcome);
    // the team eats
    markEaten(k);S.foodN=(S.foodN||0)+1;const r=feed();save();try{LOG('food_order',{place:k,dish:dish.id,extra:extra?extra.zh:'',young,healed:r.healed,xp:r.xp})}catch(e){}
    try{sfx('quest')}catch(e){}speakAsync(LINES.full.zh);
    const P=$('#fdPanel');P.innerHTML=`<div class="fed"><canvas></canvas><div class="t" data-say="${LINES.full.zh}"><div class="z">${LINES.full.zh}</div><div class="p">${LINES.full.py}</div><div class="e">${LINES.full.en}</div><div class="chips"><span>❤️ HP full</span><span>⭐ +${r.xp} XP</span></div></div></div>
      <button class="big said">Continue${ZW(LINES.next)}</button>`;paint(P.querySelector('canvas'),dish.pic);
    P.querySelector('.said').onclick=()=>closeFood();
  }catch(e){if(e!==ABORT)console.error(e)}}
function closeFood(){gen++;cur=null;if(sh.hidden)return;sh.hidden=true;try{stopSpeech()}catch(e){}try{lastIdle=T}catch(e){}try{updateUI()}catch(e){}}
$('#fdClose').onclick=closeFood;
// the field and idle chats wait while the stall is open; a player switch (stopTalk) closes it
const so=g.sheetOpen;if(typeof so==='function')g.sheetOpen=function(){return so.apply(this,arguments)||(sh.hidden?null:'sFood')};
const stt=g.stopTalk;g.stopTalk=function(){closeFood();return stt?stt.apply(this,arguments):undefined};
g.Food={open:openFood,close:closeFood,here,left,stallKey,box:cartBox,pos:POS,perDay:PER_DAY,drawFood,feed};
})();
