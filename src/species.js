// Species data. body: quad | biped | bird | snake | fish | bug | blob | golem
// sz: relative size. c1 main, c2 belly/accent, c3 dark outline/details. sc: optional spike/spark color.
// ears: pointy | long | leaflong | round | null. tail: flame | fluffy | long | fin | leaf | bolt | stub | null
// head: list of head features (horns, antlers, crest, flamecrest, crystal, leaf, antenna, fin, branchantlers)
// extras: wings, spikes, plates, mane, flamemane, crystalmane, tusks, bubbles, flowers, sparks, shell, fierce
// stage 1..3, evo: [nextName, level], float: hovers without feet
// leg: true marks a legendary (rotating rune halo). Legendary head features: sunhalo, sunantlers, crescent, crowncrest; extras: stormwings, starspots
// Wave 2 additions: bodies seal | jelly | larva | butterfly | tortoise. ears: deer. tail: ringed. head: fernantlers, yuzu.
// extras: hooves (quad hoof feet), spots (fawn spots), socks (dark legs), steam (rising wisps), mane (seal neck ruff), gorget, flecks (bird).
// Wave 3 (types wind bug mind shadow dragon metal fight star): body ghost; ears bat; tail spade | scaly | roo;
//   head gem, dhorns, whiskers, headband, beetlehorn, star; extras batwings, scales, stripes, wraps, starspots, starsparkle,
//   cloudpuffs, swirl, dragonfly, elytra, dots.
// beak (bird only, optional): needle | hook. hab (base forms, optional): place keys where it prefers to spawn
//   ('sandiego','losangeles','sanfrancisco','yosemite','backyard','lakeshore','quarry','pineridge','stormpier','ashhills').
// t2 (optional): a second type. Damage taken multiplies across both types, the creature has a move of each type,
//   and it spawns where either type lives. Lines gain it at a later stage or share it.
const SPECIES_RAW=[
 // ---- fire ----
 {n:'Smoldy',t:'fire',body:'quad',sz:.7,c1:'#ff8a3d',c2:'#ffe0b8',c3:'#9c3a14',ears:'pointy',tail:'flame',head:[],extras:[],stage:1,evo:['Smolderox',10],st:[50,56,44]},
 {n:'Smolderox',t:'fire',body:'quad',sz:1.0,c1:'#f2632a',c2:'#ffd2a1',c3:'#8a2a0e',ears:'pointy',tail:'flame',head:[],extras:['flamemane'],stage:2,evo:['Pyrothane',20],st:[50,56,44]},
 {n:'Pyrothane',t:'fire',body:'quad',sz:1.4,c1:'#c9361f',c2:'#ffb36b',c3:'#5e160a',ears:'pointy',tail:'flame',head:['horns'],extras:['flamemane','fierce'],stage:3,st:[50,56,44]},
 {n:'Emberwren',t:'fire',body:'bird',sz:.55,c1:'#ffb03a',c2:'#fff0c4',c3:'#a1560c',ears:null,tail:'flame',head:['flamecrest'],extras:[],stage:1,evo:['Cindercrest',15],st:[42,60,38]},
 {n:'Cindercrest',t:'fire',t2:'wind',body:'bird',sz:1.2,c1:'#e2512a',c2:'#ffd27a',c3:'#6e1f0c',ears:null,tail:'flame',head:['flamecrest'],extras:['wings','fierce'],stage:2,st:[42,60,38]},
 // ---- water ----
 {n:'Otterpip',t:'water',body:'quad',sz:.65,c1:'#5aa7e8',c2:'#e3f2ff',c3:'#1f5585',ears:'round',tail:'long',head:[],extras:[],stage:1,evo:['Tidemink',10],st:[54,50,48]},
 {n:'Tidemink',t:'water',body:'quad',sz:1.0,c1:'#3a8bd6',c2:'#cfe8ff',c3:'#123f6b',ears:'round',tail:'fin',head:['fin'],extras:[],stage:2,evo:['Tidewyrm',20],st:[54,50,48]},
 {n:'Tidewyrm',t:'water',t2:'dragon',body:'snake',sz:1.5,c1:'#2563b8',c2:'#a9d4ff',c3:'#0c2c5c',ears:null,tail:'fin',head:['crest'],extras:['fierce','spikes'],stage:3,st:[54,50,48]},
 {n:'Finnow',t:'water',body:'fish',sz:.55,c1:'#2fc4c9',c2:'#d6fffb',c3:'#106b6d',ears:null,tail:'fin',head:['fin'],extras:[],stage:1,float:true,evo:['Brinejaw',15],st:[46,56,44]},
 {n:'Brinejaw',t:'water',body:'fish',sz:1.25,c1:'#1f7f9e',c2:'#bff1ff',c3:'#073a4a',ears:null,tail:'fin',head:['fin'],extras:['tusks','spikes','fierce'],stage:2,float:true,st:[46,56,44]},
 {n:'Bubbloo',t:'water',body:'blob',sz:.5,c1:'#8fd3ff',c2:'#ffffff',c3:'#3c86b8',ears:null,tail:null,head:['antenna'],extras:['bubbles'],stage:1,float:true,st:[60,46,56]},
 // ---- leaf ----
 {n:'Clovehop',t:'leaf',body:'biped',sz:.62,c1:'#9fdc7c',c2:'#f4ffe8',c3:'#3f7a2a',ears:'leaflong',tail:'fluffy',head:[],extras:[],stage:1,evo:['Thistlehare',10],st:[48,54,46]},
 {n:'Thistlehare',t:'leaf',body:'biped',sz:.95,c1:'#6cc25a',c2:'#eaffd9',c3:'#2b6420',ears:'leaflong',tail:'fluffy',head:[],extras:['flowers'],stage:2,evo:['Briarbuck',20],st:[48,54,46]},
 {n:'Briarbuck',t:'leaf',t2:'fight',body:'biped',sz:1.35,c1:'#4c9c48',c2:'#d9f5c4',c3:'#1f4d1c',ears:'leaflong',tail:'fluffy',head:['branchantlers'],extras:['flowers','fierce'],stage:3,st:[48,54,46]},
 {n:'Burrbit',t:'leaf',body:'quad',sz:.55,c1:'#a5884f',c2:'#f1e4c4',c3:'#5a4420',ears:'round',tail:'stub',head:['leaf'],extras:['spikes'],stage:1,sc:'#4fae4a',evo:['Thornback',15],st:[56,48,58]},
 {n:'Thornback',t:'leaf',body:'quad',sz:1.15,c1:'#8a6d3a',c2:'#ecdcb4',c3:'#43300f',ears:'round',tail:'stub',head:['leaf'],extras:['spikes','flowers','fierce'],stage:2,sc:'#3d9a3a',st:[56,48,58]},
 // ---- spark ----
 {n:'Fizzbit',t:'spark',t2:'bug',body:'bug',sz:.5,c1:'#ffe14d',c2:'#fffbe0',c3:'#8f7200',ears:null,tail:null,head:['antenna'],extras:['wings'],stage:1,float:true,evo:['Fizzlinx',10],st:[40,60,40]},
 {n:'Fizzlinx',t:'spark',t2:'bug',body:'bug',sz:.85,c1:'#ffcf26',c2:'#fff4b0',c3:'#7a5c00',ears:null,tail:'bolt',head:['antenna'],extras:['wings','sparks'],stage:2,float:true,evo:['Voltalon',20],st:[40,60,40]},
 {n:'Voltalon',t:'spark',t2:'wind',body:'bird',sz:1.4,c1:'#3c3f63',c2:'#ffe14d',c3:'#16182e',ears:null,tail:'bolt',head:['crest'],extras:['wings','sparks','fierce'],stage:3,sc:'#ffe14d',st:[40,60,40]},
 {n:'Boltusk',t:'spark',body:'quad',sz:.75,c1:'#6b6f8c',c2:'#ffe98a',c3:'#2a2c3d',ears:'pointy',tail:'bolt',head:[],extras:['tusks','spikes'],stage:1,sc:'#ffe14d',evo:['Tuskvolt',15],st:[58,58,54]},
 {n:'Tuskvolt',t:'spark',body:'quad',sz:1.35,c1:'#4e5270',c2:'#ffe14d',c3:'#1c1e2c',ears:'pointy',tail:'bolt',head:[],extras:['tusks','spikes','sparks','fierce'],stage:2,sc:'#ffe14d',st:[58,58,54]},
 // ---- stone ----
 {n:'Pebblin',t:'stone',body:'blob',sz:.5,c1:'#a99a86',c2:'#e3d9c9',c3:'#5d5244',ears:null,tail:null,head:[],extras:['plates'],stage:1,evo:['Bouldern',10],st:[56,48,66]},
 {n:'Bouldern',t:'stone',body:'golem',sz:1.0,c1:'#8f8070',c2:'#d3c6b2',c3:'#463b2f',ears:null,tail:null,head:[],extras:['plates','spikes'],stage:2,evo:['Monolord',20],st:[56,48,66]},
 {n:'Monolord',t:'stone',body:'golem',sz:1.55,c1:'#6f6457',c2:'#c7b9a2',c3:'#2f2820',ears:null,tail:null,head:['horns','crystal'],extras:['plates','fierce'],stage:3,st:[56,48,66]},
 {n:'Rollidil',t:'stone',body:'quad',sz:.6,c1:'#c08a5a',c2:'#f0d2b0',c3:'#6b4424',ears:'round',tail:'stub',head:[],extras:['shell'],stage:1,evo:['Bastionox',15],st:[58,52,62]},
 {n:'Bastionox',t:'stone',t2:'metal',body:'quad',sz:1.35,c1:'#9a6c44',c2:'#e3c19a',c3:'#4a2e14',ears:'round',tail:'stub',head:['horns'],extras:['shell','plates','fierce'],stage:2,st:[58,52,62]},
 // ---- frost ----
 {n:'Flurrle',t:'frost',body:'quad',sz:.55,c1:'#e6f7ff',c2:'#ffffff',c3:'#5d9fc4',ears:'pointy',tail:'fluffy',head:['crystal'],extras:[],stage:1,evo:['Frostlynx',10],st:[50,54,48]},
 {n:'Frostlynx',t:'frost',body:'quad',sz:.95,c1:'#bfe6fb',c2:'#f4fcff',c3:'#3b7ea8',ears:'pointy',tail:'fluffy',head:['crystal'],extras:['crystalmane'],stage:2,evo:['Aurorynx',20],st:[50,54,48]},
 {n:'Aurorynx',t:'frost',t2:'star',body:'quad',sz:1.4,c1:'#9fc9f5',c2:'#eef6ff',c3:'#2a4f8a',ears:'pointy',tail:'fluffy',head:['crystal','horns'],extras:['crystalmane','wings','fierce'],stage:3,st:[50,54,48]},
 {n:'Glacimoth',t:'frost',t2:'bug',body:'bug',sz:.5,c1:'#c7c9ff',c2:'#f2f3ff',c3:'#5b5fb0',ears:null,tail:null,head:['antenna'],extras:['wings'],stage:1,float:true,evo:['Glacilune',15],st:[44,60,42]},
 {n:'Glacilune',t:'frost',t2:'bug',body:'bug',sz:1.15,c1:'#a9adf7',c2:'#eef0ff',c3:'#3b3f94',ears:null,tail:null,head:['antenna','crystal'],extras:['wings','fierce'],stage:2,float:true,st:[44,60,42]},
 // ---- legendary ----
 {n:'Solvane',t:'fire',t2:'star',body:'quad',sz:1.6,c1:'#f5b041',c2:'#fff1cc',c3:'#7a3510',sc:'#ffcf3a',ears:'pointy',tail:'flame',head:['sunhalo','sunantlers'],extras:['flamemane'],stage:3,leg:true,st:[70,72,70]},
 {n:'Mireluna',t:'dragon',t2:'water',body:'snake',sz:1.7,c1:'#4a4fb0',c2:'#d9e4ff',c3:'#171a4f',sc:'#e3ebff',ears:null,tail:'fin',head:['crescent'],extras:['spikes','starspots'],stage:3,leg:true,st:[72,70,70]},
 {n:'Stormlark',t:'spark',t2:'wind',body:'bird',sz:1.55,c1:'#6a7cab',c2:'#eaf5ff',c3:'#1f2647',sc:'#7df9ff',ears:null,tail:'bolt',head:['crowncrest'],extras:['stormwings','sparks'],stage:3,leg:true,st:[70,70,72]},
 // ---- wave 2: California trip (sea lion, moon jelly, hummingbird, monarch, fern deer, desert tortoise) + friends ----
 {n:'Barkpup',t:'water',body:'seal',sz:.62,c1:'#5f8aa3',c2:'#ead9bc',c3:'#22394a',ears:null,tail:null,head:[],extras:[],stage:1,evo:['Bellowhaul',16],hab:['sandiego','sanfrancisco'],st:[58,50,50]},
 {n:'Bellowhaul',t:'water',body:'seal',sz:1.3,c1:'#40677f',c2:'#dcc6a0',c3:'#142838',ears:null,tail:null,head:[],extras:['mane','fierce'],stage:2,st:[58,50,50]},
 {n:'Bellmist',t:'mind',t2:'water',body:'jelly',sz:.55,c1:'#cfe2ff',c2:'#f7fbff',c3:'#6a82c2',sc:'#e2b6ff',ears:null,tail:null,head:[],extras:[],stage:1,float:true,evo:['Moonveil',16],hab:['sandiego','losangeles','sanfrancisco'],st:[52,56,46]},
 {n:'Moonveil',t:'mind',t2:'water',body:'jelly',sz:1.15,c1:'#b7cdfc',c2:'#eef4ff',c3:'#4558a2',sc:'#d39cff',ears:null,tail:null,head:[],extras:[],stage:2,float:true,st:[52,56,46]},
 {n:'Zipbeak',t:'wind',body:'bird',sz:.45,c1:'#3fbf86',c2:'#ecfbe9',c3:'#14583c',sc:'#ff3fa4',ears:null,tail:null,beak:'needle',head:[],extras:['wings','gorget'],stage:1,float:true,evo:['Thrumwing',16],hab:['losangeles','sandiego','sanfrancisco'],st:[40,62,38]},
 {n:'Thrumwing',t:'wind',t2:'spark',body:'bird',sz:.85,c1:'#2aa874',c2:'#dff7e4',c3:'#0f4a33',sc:'#ff3fa4',ears:null,tail:null,beak:'needle',head:['crest'],extras:['wings','gorget','sparks','fierce'],stage:2,float:true,st:[40,62,38]},
 {n:'Milkwick',t:'fire',t2:'bug',body:'larva',sz:.55,c1:'#ffb43a',c2:'#fff4dc',c3:'#2a1a14',ears:null,tail:null,head:[],extras:[],stage:1,evo:['Regalflare',16],hab:['losangeles','sanfrancisco'],st:[46,58,42]},
 {n:'Regalflare',t:'fire',t2:'bug',body:'butterfly',sz:1.05,c1:'#ff7a1f',c2:'#fff6e6',c3:'#2a1410',sc:'#ffd23f',ears:null,tail:null,head:[],extras:[],stage:2,float:true,st:[46,58,42]},
 {n:'Fernfawn',t:'leaf',body:'quad',sz:.6,c1:'#b8744a',c2:'#f6e6cf',c3:'#5a3018',sc:'#6cc35a',ears:'deer',tail:'stub',head:['fernantlers'],extras:['hooves','spots'],stage:1,evo:['Fernhart',14],hab:['yosemite','sanfrancisco'],st:[50,52,48]},
 {n:'Fernhart',t:'leaf',body:'quad',sz:.98,c1:'#a5603a',c2:'#f0dcbf',c3:'#4a2512',sc:'#5fbf5a',ears:'deer',tail:'stub',head:['fernantlers'],extras:['hooves'],stage:2,evo:['Redwoodhart',30],st:[50,52,48]},
 {n:'Redwoodhart',t:'leaf',body:'quad',sz:1.42,c1:'#8e4a2c',c2:'#e9d0aa',c3:'#3a1a0c',sc:'#58b84f',ears:'deer',tail:'stub',head:['fernantlers'],extras:['hooves','fierce'],stage:3,st:[50,52,48]},
 {n:'Basklet',t:'stone',body:'tortoise',sz:.55,c1:'#b38d5e',c2:'#f1ddb6',c3:'#4e3a22',sc:'#d6a35c',ears:null,tail:null,head:[],extras:[],stage:1,evo:['Mesadome',16],hab:['losangeles','sandiego'],st:[62,44,68]},
 {n:'Mesadome',t:'stone',body:'tortoise',sz:1.3,c1:'#9a7a52',c2:'#ead0a2',c3:'#3d2a16',sc:'#c9874a',ears:null,tail:null,head:[],extras:['fierce'],stage:2,st:[62,44,68]},
 {n:'Rustkit',t:'fire',body:'quad',sz:.6,c1:'#c9532b',c2:'#fff1e2',c3:'#3a1a10',ears:'round',tail:'ringed',head:[],extras:['socks'],stage:1,evo:['Blazebrush',16],hab:['pineridge','ashhills'],st:[50,58,42]},
 {n:'Blazebrush',t:'fire',body:'quad',sz:1.08,c1:'#b8401f',c2:'#ffe6cc',c3:'#2e120a',ears:'round',tail:'ringed',head:[],extras:['socks','fierce'],stage:2,st:[50,58,42]},
 {n:'Soakbara',t:'water',body:'quad',sz:.72,c1:'#a27a52',c2:'#dcc4a4',c3:'#4a3220',ears:'round',tail:null,head:['yuzu'],extras:[],stage:1,evo:['Springbara',16],hab:['lakeshore','backyard'],st:[64,44,54]},
 {n:'Springbara',t:'water',t2:'fire',body:'quad',sz:1.2,c1:'#8e6a46',c2:'#d4b690',c3:'#3d2816',ears:'round',tail:null,head:['yuzu'],extras:['steam'],stage:2,st:[64,44,54]},
 {n:'Screekid',t:'stone',body:'quad',sz:.6,c1:'#8f877b',c2:'#e8dfcf',c3:'#3b352d',ears:'deer',tail:'stub',head:['horns'],extras:['hooves'],stage:1,evo:['Talusram',16],hab:['quarry','ashhills'],st:[56,54,58]},
 {n:'Talusram',t:'stone',t2:'fight',body:'quad',sz:1.25,c1:'#757066',c2:'#ddd2bd',c3:'#2c2822',ears:'deer',tail:'stub',head:['horns'],extras:['hooves','plates','fierce'],stage:2,st:[56,54,58]},
 {n:'Hushflake',t:'frost',body:'bird',sz:.5,c1:'#f2f6ff',c2:'#ffffff',c3:'#6b7fa6',sc:'#46557a',ears:null,tail:null,beak:'hook',head:[],extras:['flecks'],stage:1,evo:['Blizzowl',16],hab:['pineridge','stormpier'],st:[50,52,50]},
 {n:'Blizzowl',t:'frost',t2:'wind',body:'bird',sz:1.2,c1:'#e6eefc',c2:'#ffffff',c3:'#4d6390',sc:'#34405f',ears:null,tail:null,beak:'hook',head:['crystal'],extras:['flecks','wings','fierce'],stage:2,st:[50,52,50]},
 // ---- wave 3: new types (append only: saves store species by index) ----
 {n:'Breezel',t:'wind',body:'bird',sz:.6,c1:'#dbe7f0',c2:'#ffffff',c3:'#3f5a70',sc:'#5fd3b0',ears:null,tail:null,head:['crest'],extras:['wings','swirl'],stage:1,hab:['sandiego','stormpier','sanfrancisco'],st:[46,60,42]},
 {n:'Gemkit',t:'mind',body:'quad',sz:.6,c1:'#efe2ff',c2:'#ffffff',c3:'#6d48a8',sc:'#c77dff',ears:'pointy',tail:'fluffy',head:['gem'],extras:[],stage:1,hab:['lakeshore','starveil'],st:[48,58,50]},
 {n:'Drakit',t:'dragon',body:'quad',sz:.62,c1:'#7a8cf2',c2:'#ffe6b0',c3:'#262c78',sc:'#a9b8ff',ears:null,tail:'spade',head:['dhorns'],extras:['batwings','spikes'],stage:1,evo:['Drakonel',16],hab:['ashhills','yosemite'],st:[54,58,50]},
 {n:'Drakonel',t:'dragon',t2:'wind',body:'quad',sz:1.3,c1:'#5b6fe2',c2:'#ffdc98',c3:'#1b2165',sc:'#8ea2ff',ears:null,tail:'spade',head:['dhorns'],extras:['batwings','spikes','fierce'],stage:2,st:[54,58,50]},
 {n:'Cloudrake',t:'dragon',t2:'wind',body:'snake',sz:.75,c1:'#8fd3b4',c2:'#fff4dc',c3:'#2c6b55',sc:'#f0c75a',ears:null,tail:'fin',head:['dhorns','whiskers'],extras:['cloudpuffs'],stage:1,float:true,hab:['starveil','yosemite'],st:[56,56,52]},
 {n:'Dartling',t:'bug',body:'bug',sz:.55,c1:'#38bfa2',c2:'#e4fff8',c3:'#124f44',sc:'#9ff0dc',ears:null,tail:null,head:[],extras:['dragonfly'],stage:1,float:true,hab:['lakeshore','pineridge','yosemite'],st:[42,64,40]},
 {n:'Dotbug',t:'bug',body:'bug',sz:.45,c1:'#e8463f',c2:'#ffe9e2',c3:'#2a1416',sc:'#2a1416',ears:null,tail:null,head:['antenna'],extras:['elytra','dots'],stage:1,float:true,hab:['backyard','pineridge','yosemite'],st:[52,54,52]},
 {n:'Flitbat',t:'shadow',body:'blob',sz:.5,c1:'#6c5c92',c2:'#efe4ff',c3:'#271f40',sc:'#a493c4',ears:'bat',tail:null,head:[],extras:['batwings'],stage:1,float:true,hab:['ashhills','starveil','pineridge'],st:[46,62,44]},
 {n:'Wispuff',t:'shadow',body:'ghost',sz:.55,c1:'#d2c8f0',c2:'#ffffff',c3:'#4b3d7a',sc:'#8e7cc4',ears:null,tail:null,head:[],extras:[],stage:1,float:true,hab:['ashhills','starveil'],st:[50,60,48]},
 {n:'Pangolink',t:'metal',body:'quad',sz:.62,c1:'#98a5b5',c2:'#efe1cc',c3:'#36404e',sc:'#d3dce6',ears:'round',tail:'scaly',head:[],extras:['scales'],stage:1,hab:['losangeles','sanfrancisco','quarry'],st:[58,48,64]},
 {n:'Clankbeetle',t:'metal',t2:'bug',body:'bug',sz:.6,c1:'#9fb1c6',c2:'#eaf0f6',c3:'#28323f',sc:'#e3eaf2',ears:null,tail:null,head:['beetlehorn'],extras:['elytra'],stage:1,float:true,hab:['sanfrancisco','quarry','losangeles'],st:[60,46,66]},
 {n:'Joeyjab',t:'fight',body:'biped',sz:.66,c1:'#d38b52',c2:'#f9e6cb',c3:'#5a3016',sc:'#ef5a64',ears:'long',tail:'roo',head:[],extras:['wraps'],stage:1,hab:['losangeles','quarry'],st:[58,62,46]},
 {n:'Dojocub',t:'fight',body:'quad',sz:.6,c1:'#f59a3a',c2:'#fff4e2',c3:'#3a1e0a',sc:'#ef5a64',ears:'round',tail:'long',head:['headband'],extras:['stripes'],stage:1,hab:['quarry','losangeles'],st:[56,60,48]},
 {n:'Twinkfawn',t:'star',body:'quad',sz:.6,c1:'#ffc4db',c2:'#fff6fa',c3:'#8a3d66',sc:'#ffd65a',ears:'deer',tail:'stub',head:['star'],extras:['hooves','starspots'],stage:1,hab:['starveil','losangeles'],st:[52,56,50]},
 {n:'Glimmerbun',t:'star',body:'biped',sz:.56,c1:'#fff0f7',c2:'#ffffff',c3:'#9a5a86',sc:'#ffd65a',ears:'long',tail:'fluffy',head:['star'],extras:['starsparkle'],stage:1,hab:['starveil','backyard'],st:[52,56,52]},
];
