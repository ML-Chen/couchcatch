// ---------- Story: help Little Star 小星 get home to the Starveil ----------
// Chapters are conversations (story_1 … story_9 in DIALOGUES). Each one starts when its condition holds and the player is idle;
// finishing it sets the next goal, shown at the top of the Quests sheet. Little Star floats in the scene until it gets home.
(function(){
const PI=k=>PLACES.findIndex(p=>p.key===k);
const placeIs=k=>S.place===PI(k)&&S.mode!=='travel';
const badges=()=>(S.badges||[]).filter(i=>!PLACES[i].rift).length;
const st=()=>{if(!S.story||typeof S.story!=='object')S.story={ch:0,t:{}};return S.story};
const pieces=()=>st().ch>=2?Math.min(3,badges()):0;
// when: condition to START chapter i (0-based → story_{i+1}); goal: what to do after it finishes
const CH=[
 {when:()=>(S.talked||{}).intro_neighbor&&S.col.length>=3&&S.mode==='staying',goal:['Beat Coach Mira at the Backyard gym','去后院道馆','qù hòuyuàn dàoguǎn']},
 {when:()=>(S.badges||[]).includes(PI('backyard')),goal:['Go to the Lakeshore to find Professor Lin','去湖边找林教授','qù húbiān zhǎo Lín jiàoshòu']},
 {when:()=>placeIs('lakeshore'),goal:['Win gym badges to collect 3 star pieces','收集三个星星碎片','shōují sān ge xīngxing suìpiàn'],prog:()=>`${pieces()} / 3`},
 {when:()=>pieces()>=3,goal:['Fly to California','去加州','qù Jiāzhōu']},
 {when:()=>PLACES[S.place].region==='California'&&S.mode!=='travel',goal:['Go to San Francisco','去旧金山','qù Jiùjīnshān']},
 {when:()=>placeIs('sanfrancisco'),goal:['Go to Yosemite','去优胜美地','qù Yōushèngměidì']},
 {when:()=>placeIs('yosemite'),goal:['Step into the Starveil','去星幕裂谷','qù xīngmù liègǔ'],after:()=>{S.rift={place:PI('yosemite'),shown:true,story:true}}},
 {when:()=>placeIs('starveil'),goal:['Little Star is home!','小星回家了！','Xiǎo Xīng huí jiā le!']},
 {when:()=>st().t.story_8&&Date.now()-st().t.story_8>60000,goal:null},
];
const key=i=>'story_'+(i+1);
const has=k=>typeof DIALOGUES!=='undefined'&&!!DIALOGUES[k];
function done(k){return !!(S.talked||{})[k]}
function tick(){try{if(typeof S==='undefined'||!S.col||!S.col.length)return;const s=st();
  // advance past finished chapters
  while(s.ch<CH.length&&done(key(s.ch))){const c=CH[s.ch];s.t[key(s.ch)]=Date.now();s.ch++;try{c.after&&c.after()}catch(e){}
    // announce the new goal only if it is still to do (e.g. the Backyard badge may already be won)
    let met=false;try{met=s.ch<CH.length&&!!CH[s.ch].when()}catch(e){}
    try{LOG('story',{ch:s.ch})}catch(e){}if(c.goal&&!met){sfx('quest');toast(`New goal: ${c.goal[0]} · ${c.goal[1]} (${c.goal[2]})`)}save();try{updateUI()}catch(e){}}
  // the way into the Starveil stays open at Yosemite until Little Star is home (also mends saves where leaving Yosemite closed it)
  if(s.ch===7&&!S.rift){S.rift={place:PI('yosemite'),shown:true,story:true};save();try{updateUI()}catch(e){}}
  else if(s.ch>=8&&S.rift&&S.rift.story)delete S.rift.story; // home: from now on it is an ordinary rift
  if(s.ch>=3&&s.ch<CH.length){const pc=pieces();if(s.pc==null)s.pc=pc;if(pc>s.pc){s.pc=pc;sfx('legend');toast(`You got a star piece! 星星碎片 xīngxing suìpiàn · ${pc} / 3`);speak('星星碎片');save()}}
  if(s.ch>=CH.length)return;const k=key(s.ch);if(!has(k))return;
  if(pendingTalks.includes(k)||document.querySelector('.sheet.talk:not([hidden])'))return;
  if(s.q&&s.q[k]&&Date.now()-s.q[k]<60000)return; // closed early: offer it again a minute later
  if(sheetOpen()||C||B||E||S.mode==='travel')return;
  if(CH[s.ch].when()){s.q=s.q||{};s.q[k]=Date.now();pendingTalks.unshift(k);try{LOG('story_queue',{k})}catch(e){}}
}catch(e){console.error(e)}}
setInterval(tick,1000);
window.storyGoalHTML=function(){const s=st();if(!s.ch)return'';const c=CH[Math.min(s.ch,CH.length)-1];if(!c||!c.goal)return'';const done8=s.ch>=8;
  return `<div class="card storycard"><canvas class="mini" data-star="1"></canvas><div class="info"><div class="nm">${done8?'':'Story · '}${c.goal[0]}${zw(c.goal[1],c.goal[2])}</div>${c.prog&&!done8?`<div class="sub">Star pieces 星星碎片 · ${c.prog()}</div><div class="qbar"><i style="width:${pieces()/3*100}%"></i></div>`:''}</div></div>`};
// ---- Little Star, floating near you while it is lost ----
function drawStar(ctx,x,y,r,t,happy){ctx.save();ctx.translate(x,y);const g=ctx.createRadialGradient(0,0,r*.2,0,0,r*2.2);g.addColorStop(0,'rgba(255,240,180,.75)');g.addColorStop(1,'rgba(255,240,180,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*2.2,0,7);ctx.fill();
  ctx.rotate(Math.sin(t*1.3)*.12);ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.52:r;const px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();
  const f=ctx.createRadialGradient(-r*.25,-r*.3,r*.1,0,0,r);f.addColorStop(0,'#fffbe6');f.addColorStop(.6,'#ffe27a');f.addColorStop(1,'#f5b83d');ctx.fillStyle=f;ctx.lineJoin='round';ctx.fill();ctx.strokeStyle='rgba(214,140,30,.55)';ctx.lineWidth=Math.max(1,r*.06);ctx.stroke();
  const blink=(t%4.2)<.12;for(const sx of[-1,1]){ctx.beginPath();if(blink){ctx.moveTo(sx*r*.24-r*.08,r*.02);ctx.quadraticCurveTo(sx*r*.24,r*.08,sx*r*.24+r*.08,r*.02);ctx.strokeStyle='#3b2a14';ctx.lineWidth=Math.max(1,r*.06);ctx.stroke()}
    else{ctx.ellipse(sx*r*.24,0,r*.1,r*.13,0,0,7);ctx.fillStyle='#2b1d0e';ctx.fill();ctx.beginPath();ctx.arc(sx*r*.24-r*.03,-r*.05,r*.045,0,7);ctx.fillStyle='#fff';ctx.fill()}}
  ctx.fillStyle='rgba(255,140,140,.5)';ctx.beginPath();ctx.ellipse(-r*.42,r*.16,r*.09,r*.05,0,0,7);ctx.ellipse(r*.42,r*.16,r*.09,r*.05,0,0,7);ctx.fill();
  ctx.beginPath();if(happy)ctx.arc(0,r*.14,r*.1,0,Math.PI);else{ctx.moveTo(-r*.07,r*.2);ctx.quadraticCurveTo(0,r*.15,r*.07,r*.2)}ctx.strokeStyle='#3b2a14';ctx.lineWidth=Math.max(1,r*.05);ctx.stroke();ctx.restore()}
window.drawLittleStar=drawStar;
let sx=.86,sy=.28,happyT=-9;
const lines=[['我想回家。','wǒ xiǎng huí jiā.','I want to go home.'],['你好！','nǐ hǎo!','Hi!'],['谢谢你！','xièxie nǐ!','Thank you!'],['我们走吧！','wǒmen zǒu ba!','Let’s go!'],['加油！','jiāyóu!','You can do it!'],['我饿了。','wǒ è le.','I’m hungry.']];
window.SCENE_HOOKS=window.SCENE_HOOKS||[];window.TAP_HOOKS=window.TAP_HOOKS||[];
const visible=()=>{const s=st();return s.ch>=1&&s.ch<8&&S.mode!=='travel'};
SCENE_HOOKS.push((ctx,w,h)=>{if(!visible())return;const tt=T;sx=.86+Math.sin(tt*.35)*.05;sy=.27+Math.sin(tt*1.1)*.025;drawStar(ctx,sx*w,sy*h,h*.046,tt,tt-happyT<2.5)});
TAP_HOOKS.push((x,y)=>{if(!visible())return false;if(Math.hypot(x-sx,(y-sy)*.6)<.07){happyT=T;const l=lines[Math.floor(Math.random()*lines.length)];sfx('tap');speak(l[0]);toast(`小星 Xiǎo Xīng: ${l[0]} (${l[1]}) “${l[2]}”`);return true}return false});
// portraits for the story's people (the conversation player looks up PEOPLE by conversation key)
if(window.PEOPLE){const P=window.PEOPLE;const prof={skin:0,hair:'#4a4a4f',style:'short',glasses:1,shirt:'#f2f2f0',acc:'labcoat',age:'adult',bg:'#2f4a66',male:1},
  ranger={skin:2,hair:'#3a2a1e',style:'short',hat:'ranger',hatc:'#6b5a3a',shirt:'#4f6b3a',age:'adult',bg:'#33482c',male:1};
  Object.assign(P,{story_1:P.intro_neighbor_auntie||P.adult2||P.adult,story_2:P.gym_backyard,story_3:prof,story_4:P.grandma,story_5:ranger,story_6:P.kid,story_7:ranger,story_8:{kind:'star',bg:'#1c1446'},story_9:P.grandma})}
})();
