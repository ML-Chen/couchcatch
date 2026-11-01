// Standard screenshots of every Couchcatch screen at the user's phone size (360x629).
// Usage: node tools/shots.js <built.html> <outDir>   → writes NN-name.png + errors.txt, then run tools/compose_shots.py
// Each scenario has a time limit; if one hangs, it is logged as HUNG, the page is reloaded and the run continues.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const html=process.argv[2],out=process.argv[3];fs.mkdirSync(out,{recursive:true});
for(const f of fs.readdirSync(out))if(/^\d\d-.*\.png$/.test(f))fs.unlinkSync(path.join(out,f));
const errs=[];let b,p;
async function fresh(){if(p)await p.close().catch(()=>{});
  p=await b.newPage({viewport:{width:360,height:629},deviceScaleFactor:1});
  p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>m.type()==='error'&&errs.push('console: '+m.text()));
  await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.fulfill({status:200,body:''}));
  await p.goto('file://'+path.resolve(html));await p.waitForTimeout(500);}
const E=(f,a)=>p.evaluate(f,a);
async function setup(){await E(()=>{window.speakAsync=()=>new Promise(r=>setTimeout(r,30))});await p.click('#starterList button');await p.waitForTimeout(300);
  await E(()=>{pendingTalks.length=0;document.querySelectorAll('.talkwrap').forEach(x=>x.hidden=true);S.col.push(mk(IDX.Barkpup,24,true),mk(IDX.Clovehop,19),mk(IDX.Bellmist,26));S.col[0].lvl=30;S.col[0].sp=IDX.Pyrothane;S.col[0].hp=stats(S.col[0]).maxhp;
    S.items={orb:40,great:5,ultra:2,berry:4};S.talked={gym_backyard:1};S.tr={'火':3,'光':2,'红':1,'水':2,'木':2,'叶':1,'大':1,'云':2};updateUI()});await reset()}
const reset=()=>E(()=>{document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);if(window.Reader)try{stopSpeech()}catch(e){};document.querySelectorAll('.tracewrap,.saycard').forEach(x=>x.remove());
  document.querySelectorAll('.talkwrap').forEach(x=>x.hidden=true);pendingTalks.length=0;evoQueue.length=0;if(C)endCatch();B=null;E=null;document.getElementById('quiz').hidden=true;if(window.stopSpeech)stopSpeech();S.mode=S.mode==='travel'?'arrived':S.mode;updateUI()});
let n=0;
const shot=async(name,wait=300)=>{await p.waitForTimeout(wait);await p.screenshot({path:path.join(out,String(++n).padStart(2,'0')+'-'+name+'.png'),timeout:8000})};
const stay=async(place,ms=4000)=>{await E(pl=>{S.place=pl;S.mode='arrived';wild=[];makeProps(pl);updateUI()},place);await p.click('#bStay');await p.waitForTimeout(ms)};
const S_=[
 ['starter',async()=>{await shot('starter',0)},{noSetup:true}],
 ['field-backyard',async()=>{await p.click('#bStay');await p.waitForTimeout(6000);await shot('field-backyard',0)}],
 ['field-raid-rift-banners',async()=>{await stay(0,2500);await E(()=>{S.raid=pickBoss();S.raid.shown=true;S.rift={place:S.place,shown:true};updateUI()});await shot('field-raid-rift-banners')}],
 ['field-paper',async()=>{await stay(1,2500);await E(()=>Reader.drop(READINGS[0].id));await shot('field-paper',600)}],
 ['reader',async()=>{await E(()=>openReading(READINGS[0].id));await shot('reader',1200)}],
 ['reader-guide',async()=>{const id=await E(()=>(READINGS.find(r=>r.kind==='guide'||r.level>1)||READINGS[READINGS.length-1]).id);await E(i=>openReading(i),id);await shot('reader-2',900)}],
 ['story-quests',async()=>{await E(()=>{S.story={ch:3,t:{},pc:1};S.badges=[0]});await p.click('#bQuest');await shot('story-quests',400)}],
 ['story-little-star',async()=>{await E(()=>{S.story={ch:3,t:{},pc:1}});await stay(0,2500);await shot('field-little-star',300)}],
 ['map',async()=>{await p.click('#bMove');await shot('map',500)}],
 ['catch-spell-trace',async()=>{await stay(0,3000);await E(()=>openCatch(wild[0]||(wild.push(spawnWild()),wild[0])));await shot('catch-spell-first',1600)}],
 ['catch',async()=>{await stay(0,3000);await E(()=>{S.trace=false;openCatch(wild[0]||(wild.push(spawnWild()),wild[0]));S.trace=true});await shot('catch',700)}],
 ['catch-spell-ready',async()=>{await stay(0,3000);await E(()=>{S.trace=false;openCatch(wild[0]||(wild.push(spawnWild()),wild[0]));S.trace=true;C.spell=2;C.spellCh=tracePick(SP[C.wd.sp].t)[0];C.spellT=T-1;renderSpell();msg('Perfect spell! Throw now!','准备好了！','zhǔnbèi hǎo le!')});await shot('catch-spell-ready',700)}],
 ['battle',async()=>{await E(()=>startGym());await p.waitForTimeout(2600);await shot('battle',0)}],
 ['trace-move',async()=>{await E(()=>startGym());await p.waitForTimeout(2600);await E(()=>{turn(1)});await shot('trace-move',1700)}],
 ['trace-move-known',async()=>{await E(()=>{S.tr['火']=6;S.tr['光']=6;S.tr['红']=6;S.tr['灯']=6;S.tr['热']=6;S.tr['烧']=1;startGym()});await p.waitForTimeout(2600);await E(()=>{turn(1)});await shot('trace-move-familiar',1200)}],
 ['giant-transform',async()=>{await E(()=>{startGym()});await p.waitForTimeout(2600);await E(()=>{B.pm=3;B.busy=false;B.pused=true;B.pt=3;B.grow={side:'p',t0:T};renderBattle()});await shot('giant-transform',700)}],
 ['conversation',async()=>{await E(()=>{runTalk('gym_backyard')});await shot('conversation',4500)}],
 ['contacts',async()=>{await p.click('#bTalk');await shot('contacts',500)}],
 ['speak-lesson',async()=>{await E(()=>{runLesson()});await shot('speak-lesson',1500)}],
 ['learn',async()=>{await p.click('#bLearn');await shot('learn',400)}],
 ['learn-characters',async()=>{await p.click('#bLearn');await p.waitForTimeout(300);await E(()=>{const r=document.querySelector('.charrow');if(r)r.scrollIntoView({block:'start'})});await shot('learn-characters',300)}],
 ['team',async()=>{await p.click('#bTeam');await shot('team',400)}],
 ['quests',async()=>{await p.click('#bQuest');await shot('quests',300)}],
 ['bag',async()=>{await p.click('#bBag');await shot('bag',300)}],
 ['settings',async()=>{await p.click('#bSet');await shot('settings',300)}],
 ['evolution',async()=>{await E(()=>{gainXP(S.col[1],20000);evoQueue.length=0;evoQueue.push(S.col[1].id);runEvoQueue()});await shot('evolution',1600)}],
 ['flight',async()=>{await E(()=>{S.place=0;travelTo=10;travelT=.4;S.mode='travel';wild=[];roadSpawns=[];updateUI()});await shot('flight',900)}],
 ['road-trip',async()=>{await E(()=>{S.place=7;travelTo=9;travelT=.5;S.mode='travel';wild=[];roadSpawns=[];makeProps(9);updateUI()});await shot('road-trip',700)}],
 ['rift-field',async()=>{await stay(6);await shot('rift-field',0)}],
 ['los-angeles-field',async()=>{await stay(8);await shot('los-angeles-field',0)}],
 ['san-francisco-field',async()=>{await stay(9);await shot('san-francisco-field',0)}],
 ['yosemite-field',async()=>{await stay(10);await shot('yosemite-field',0)}],
 ['san-diego-field',async()=>{await stay(7);await shot('san-diego-field',0)}],
];
(async()=>{b=await chromium.launch();await fresh();await setup().catch(e=>errs.push('setup: '+e.message));let needFresh=false;
  for(const [name,fn,opt] of S_){
    if(opt&&opt.noSetup){await fresh();await fn().catch(e=>errs.push(name+': '+e.message));await fresh();await setup().catch(e=>errs.push('setup: '+e.message));continue}
    if(needFresh){await fresh();await setup().catch(e=>errs.push('setup: '+e.message));needFresh=false}
    const t0=Date.now();let to;
    const r=await Promise.race([fn().then(()=>'ok',e=>'ERR '+e.message.split('\n')[0]),new Promise(res=>to=setTimeout(()=>res('HUNG'),25000))]);clearTimeout(to);
    if(r!=='ok'){errs.push(`${name}: ${r}`);console.log('!!',name,r);needFresh=true;continue}
    const rr=await Promise.race([reset().then(()=>'ok',e=>'ERR '+e.message),new Promise(res=>setTimeout(()=>res('HUNG'),5000))]);if(rr!=='ok'){errs.push(`${name} (reset): ${rr}`);needFresh=true}
    if(Date.now()-t0>15000)console.log('slow',name,Date.now()-t0,'ms')}
  fs.writeFileSync(path.join(out,'errors.txt'),errs.join('\n'));console.log(n+' screenshots,',errs.length+' errors');if(errs.length)console.log(errs.slice(0,12).join('\n'));await b.close()})();
