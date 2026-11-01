// ---------- Wave 3 creature types: wind 风, bug 虫, mind 心, shadow 影, dragon 龙, metal 钢, fight 拳, star 星 ----------
// Injected right after the main game script (before speak.js / trace.js). It only mutates the main script's tables:
// TYPES (badge colours), STRONG (2x lists; eff() makes the reverse 0.5x), MOVES, SHIFT (shiny hue shift), PLACES[i].types,
// and the Chinese tables ZH_TYPES / ZH_MOVES from zh_names.js. EXTRA_TRACE_SETS gives trace.js a ladder per new type.
// The new species themselves live at the end of species.js (append-only: saves store species by index).
(function(){
  const NEW={
    wind:  {col:'#7ee3c4',zh:'风',py:'fēng', move:'Gust Dash',    mzh:'疾风冲', mpy:'jífēng chōng', shift:200},
    bug:   {col:'#b5cf3c',zh:'虫',py:'chóng',move:'Buzz Bite',    mzh:'嗡嗡咬', mpy:'wēngwēng yǎo', shift:140},
    mind:  {col:'#d08cff',zh:'心',py:'xīn',  move:'Mind Wave',    mzh:'心灵波', mpy:'xīnlíng bō',   shift:120},
    shadow:{col:'#8e7cb0',zh:'影',py:'yǐng', move:'Shade Pounce', mzh:'暗影扑', mpy:'ànyǐng pū',    shift:180},
    dragon:{col:'#7b86ff',zh:'龙',py:'lóng', move:'Dragon Roar',  mzh:'龙吼',   mpy:'lóng hǒu',     shift:160},
    metal: {col:'#b8c1cd',zh:'钢',py:'gāng', move:'Iron Bash',    mzh:'铁头撞', mpy:'tiětóu zhuàng',shift:40},
    fight: {col:'#ef636c',zh:'拳',py:'quán', move:'Power Punch',  mzh:'重拳',   mpy:'zhòng quán',   shift:150},
    star:  {col:'#ffb6d6',zh:'星',py:'xīng', move:'Twinkle Beam', mzh:'星光闪', mpy:'xīngguāng shǎn',shift:100},
  };
  // attacker -> defenders it hits for 2x (full table for all 14 types)
  const STRONG2={
    fire:['leaf','frost','bug','metal'], water:['fire','stone'], leaf:['water','stone'], spark:['water','frost','wind'],
    stone:['fire','spark','wind','bug'], frost:['leaf','stone','wind','dragon'], wind:['leaf','bug','fight'], bug:['leaf','mind','shadow'],
    mind:['fight'], shadow:['mind'], dragon:['dragon'], metal:['frost','stone','star'], fight:['stone','frost','metal','shadow'],
    star:['dragon','fight','shadow'],
  };
  try{
    for(const k in NEW){const d=NEW[k];TYPES[k]=d.col;MOVES[k]=d.move;
      if(typeof SHIFT!=='undefined')SHIFT[k]=d.shift;
      if(typeof ZH_TYPES!=='undefined')ZH_TYPES[k]={zh:d.zh,py:d.py};
      if(typeof ZH_MOVES!=='undefined')ZH_MOVES[d.move]={zh:d.mzh,py:d.mpy}}
    for(const k in STRONG2)STRONG[k]=STRONG2[k].slice();
    // where the new types live (every new type spawns in at least two places; the Rift has every type)
    const ADD={backyard:['bug'],lakeshore:['mind'],quarry:['fight'],pineridge:['bug','wind'],stormpier:['wind'],ashhills:['dragon','shadow'],
      starveil:['wind','bug','mind','shadow','dragon','metal','fight','star'],sandiego:['wind'],losangeles:['star','fight','metal'],
      sanfrancisco:['wind','metal'],yosemite:['bug','wind','dragon']};
    for(const p of PLACES){const a=ADD[p.key];if(!a)continue;for(const t of a)if(!p.types.includes(t))p.types.push(t)}
    // never leave a place type without a spawnable base form
    if(typeof BASES!=='undefined'&&typeof SP!=='undefined')for(const p of PLACES)p.types=p.types.filter(t=>BASES.some(i=>SP[i].t===t||SP[i].t2===t));
  }catch(e){if(typeof console!=='undefined')console.warn('types_ext',e)}
  // character-tracing ladders: [character, pinyin, English, example word, word pinyin, word English], simplest first
  window.EXTRA_TRACE_SETS={
    wind:  [['风','fēng','wind','大风','dà fēng','strong wind'],['飞','fēi','to fly','飞机','fēijī','airplane'],['云','yún','cloud','白云','bái yún','white cloud'],
            ['气','qì','air','空气','kōngqì','air'],['鸟','niǎo','bird','小鸟','xiǎo niǎo','little bird'],['吹','chuī','to blow','吹风','chuī fēng','the wind blows']],
    bug:   [['虫','chóng','bug','虫子','chóngzi','a bug'],['小','xiǎo','small','小虫','xiǎo chóng','a little bug'],['飞','fēi','to fly','飞虫','fēi chóng','a flying bug'],
            ['叶','yè','leaf','树叶','shùyè','tree leaves'],['花','huā','flower','花朵','huāduǒ','a blossom'],['草','cǎo','grass','小草','xiǎo cǎo','little grass']],
    mind:  [['心','xīn','heart, mind','开心','kāixīn','happy'],['知','zhī','to know','知道','zhīdào','to know'],['看','kàn','to look','看书','kàn shū','read a book'],
            ['梦','mèng','dream','做梦','zuò mèng','to dream'],['想','xiǎng','to think','想想','xiǎngxiang','think about it'],['睡','shuì','to sleep','睡觉','shuìjiào','go to sleep']],
    shadow:[['月','yuè','moon','月亮','yuèliang','the moon'],['夜','yè','night','夜里','yèli','at night'],['黑','hēi','black','黑色','hēisè','black'],
            ['影','yǐng','shadow','影子','yǐngzi','a shadow'],['暗','àn','dark','黑暗','hēi’àn','darkness'],['静','jìng','quiet','安静','ānjìng','quiet']],
    dragon:[['龙','lóng','dragon','小龙','xiǎo lóng','little dragon'],['大','dà','big','大龙','dà lóng','a big dragon'],['天','tiān','sky','天上','tiānshang','up in the sky'],
            ['王','wáng','king','国王','guówáng','a king'],['力','lì','strength','力气','lìqi','strength'],['飞','fēi','to fly','飞龙','fēi lóng','a flying dragon']],
    metal: [['刀','dāo','knife','小刀','xiǎo dāo','a little knife'],['门','mén','door','开门','kāi mén','open the door'],['车','chē','car','汽车','qìchē','a car'],
            ['金','jīn','gold','金色','jīnsè','golden'],['铁','tiě','iron','地铁','dìtiě','the subway'],['钢','gāng','steel','钢琴','gāngqín','a piano']],
    fight: [['手','shǒu','hand','手套','shǒutào','gloves'],['力','lì','strength','有力','yǒu lì','strong'],['打','dǎ','to hit','打拳','dǎ quán','to box'],
            ['拳','quán','fist','拳头','quántou','a fist'],['跑','pǎo','to run','快跑','kuài pǎo','run fast'],['跳','tiào','to jump','跳高','tiàogāo','high jump']],
    star:  [['天','tiān','sky','天空','tiānkōng','the sky'],['心','xīn','heart','小心','xiǎoxīn','be careful'],['光','guāng','light','星光','xīngguāng','starlight'],
            ['花','huā','flower','花园','huāyuán','a garden'],['星','xīng','star','星星','xīngxing','stars'],['亮','liàng','bright','亮晶晶','liàngjīngjīng','sparkly']],
  };
})();
