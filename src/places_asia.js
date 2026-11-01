// ---------- Asia regions: Hong Kong 香港, Thailand 泰国, Singapore 新加坡 ----------
// Inlined into the main script right after `const PLACES=[…]` (marker //@@PLACES_ASIA@@ in game.html), so these places exist
// before a saved game is restored. Saves store places by index: only ever APPEND places, never reorder or remove them.
// Painted backgrounds: scenery_asia.js. Conversations: asia_dialogues.js. Readings: asia_readings.js. Runtime hooks: asia.js.
// tools/zh_strings.js also loads this file (in a sandbox without PLACES/SP) to collect the Chinese place names for recording.
(function(){
  var ASIA=[
   {n:'Victoria Harbour',key:'hkharbour',region:'Hong Kong',sky:['#24306b','#f2a072'],ground:'#8f8a84',hill:'#3b4668',amb:'harbour',prop:'none',types:['water','wind','spark','metal'],leader:'Captain Ming',lv:36},
   {n:'Night Market',key:'hknight',region:'Hong Kong',sky:['#0d0f2a','#3a2050'],ground:'#3a3438',hill:'#22202e',amb:'neon',prop:'none',types:['spark','fire','shadow','star'],leader:'Chef Fai',lv:38},
   {n:'The Peak',key:'hkpeak',region:'Hong Kong',sky:['#79b4e6','#e8f1f4'],ground:'#7aa05a',hill:'#4f7a52',amb:'peak',prop:'none',types:['leaf','wind','dragon','stone'],leader:'Hiker Wing',lv:40},
   {n:'Bangkok',key:'bangkok',region:'Thailand',sky:['#3b3f8a','#ffb35c'],ground:'#8a6a48',hill:'#6a4a3a',amb:'river',prop:'none',types:['fire','water','star','mind'],leader:'Boatman Somchai',lv:42,palm:true},
   {n:'Floating Market',key:'floatmarket',region:'Thailand',sky:['#9fd0e8','#fff1d0'],ground:'#8a6844',hill:'#4f7a3a',amb:'market',prop:'none',types:['water','leaf','bug','fire'],leader:'Auntie Mali',lv:44,palm:true},
   {n:'Phi Phi Island',key:'phiphi',region:'Thailand',sky:['#3d9be9','#d9f3ff'],ground:'#f2e6c8',hill:'#6c7a5a',amb:'beach',prop:'none',types:['water','stone','wind','dragon'],leader:'Diver Nok',lv:46,palm:true},
   {n:'Marina Bay',key:'marinabay',region:'Singapore',sky:['#0b0e2e','#3b2a6a'],ground:'#5a5560',hill:'#22203a',amb:'bay',prop:'none',types:['spark','star','metal','water'],leader:'Doctor Tan',lv:48,palm:true},
   {n:'Hawker Centre',key:'hawker',region:'Singapore',sky:['#3a2a3a','#f0a060'],ground:'#b8a48a',hill:'#4a3a3a',amb:'hawker',prop:'none',types:['fire','fight','star','mind'],leader:'Uncle Seng',lv:50,palm:true},
   {n:'Rainforest Walk',key:'rainforest',region:'Singapore',sky:['#8fc7b8','#e8f4e0'],ground:'#7a5a3a',hill:'#2f5a3a',amb:'forest',prop:'none',types:['leaf','bug','shadow','water'],leader:'Ranger Siti',lv:52,palm:true},
  ];
  var ZH={
   'Victoria Harbour':{zh:'维多利亚港',py:'Wéiduōlìyà Gǎng'},
   'Night Market':   {zh:'夜市',py:'yèshì'},
   'The Peak':       {zh:'太平山顶',py:'Tàipíng shāndǐng'},
   'Bangkok':        {zh:'曼谷',py:'Màngǔ'},
   'Floating Market':{zh:'水上市场',py:'shuǐshàng shìchǎng'},
   'Phi Phi Island': {zh:'皮皮岛',py:'Pípí Dǎo'},
   'Marina Bay':     {zh:'滨海湾',py:'Bīnhǎi Wān'},
   'Hawker Centre':  {zh:'小贩中心',py:'xiǎofàn zhōngxīn'},
   'Rainforest Walk':{zh:'雨林步道',py:'yǔlín bùdào'},
  };
  // the creatures that like each new place (only species that already have a habitat list: adding one to a species
  // without a list would shut it out of every other place)
  var HAB={hkharbour:['Barkpup','Zipbeak','Breezel','Bellmist'],hknight:['Milkwick','Flitbat','Glimmerbun','Wispuff'],hkpeak:['Cloudrake','Fernfawn','Pangolink','Dartling'],
    bangkok:['Twinkfawn','Gemkit','Milkwick','Soakbara'],floatmarket:['Soakbara','Dotbug','Dartling','Glimmerbun'],phiphi:['Barkpup','Basklet','Breezel','Screekid'],
    marinabay:['Twinkfawn','Glimmerbun','Clankbeetle','Bellmist'],hawker:['Milkwick','Glimmerbun','Dojocub','Joeyjab'],rainforest:['Pangolink','Fernfawn','Dartling','Dotbug','Flitbat']};
  // map headers for the new regions (the map shows each region's places under one header)
  var LABEL={'Hong Kong':'Hong Kong · 香港 Xiānggǎng','Thailand':'Thailand · 泰国 Tàiguó','Singapore':'Singapore · 新加坡 Xīnjiāpō'};
  var REG_ZH={'Hong Kong':{zh:'香港',py:'Xiānggǎng'},'Thailand':{zh:'泰国',py:'Tàiguó'},'Singapore':{zh:'新加坡',py:'Xīnjiāpō'}};
  var g=(typeof window!=='undefined')?window:this;
  try{
    if(typeof ZH_PLACES!=='undefined')for(var k in ZH)if(!ZH_PLACES[k])ZH_PLACES[k]=ZH[k];
    g.ASIA_REGIONS=['Hong Kong','Thailand','Singapore'];g.ASIA_REGION_ZH=REG_ZH;
    g.REGION_LABEL=Object.assign(g.REGION_LABEL||{},LABEL);
    // the check-in chat before a flight: one per destination region, and one for flying home from Asia
    g.AIRPORT_TALK=function(from,to){var A=g.ASIA_REGIONS;if(A.indexOf(to.region)>=0)return 'airport_'+to.region.toLowerCase().replace(/\s+/g,'');
      if(A.indexOf(from.region)>=0&&to.region==='Home')return 'airport_home_asia';return null};
    if(typeof PLACES!=='undefined'){
      for(var i=0;i<ASIA.length;i++)if(!PLACES.some(function(q){return q.key===ASIA[i].key}))PLACES.push(ASIA[i]);
      if(typeof SP!=='undefined'&&typeof IDX!=='undefined')for(var key in HAB)HAB[key].forEach(function(n){var s=SP[IDX[n]];if(s&&Array.isArray(s.hab)&&s.hab.indexOf(key)<0)s.hab.push(key)});
    }
  }catch(e){if(typeof console!=='undefined')console.warn('places_asia',e)}
})();
