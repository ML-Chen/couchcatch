// Couchcatch "things to read": papers lying around the scene while you stay somewhere.
// Each piece is a tiny graded reader: every word shows characters, pinyin under them, and an English gloss under that.
// Every sentence is narrated aloud on its own, so each line stands alone.
//
// Fields:
//   id, kind ('letter'|'note'|'postcard'|'book'|'magazine'|'newspaper'|'poster'|'diary'|'guide'),
//   level (1 = 2-4 sentences, <=7 characters each; 2 = 3-5 sentences, <=10 characters, at most 2 new words; 3 = 4-6 sentences, <=12 characters),
//   place (null = anywhere, or 'home' | 'rift' | 'San Diego' | 'Los Angeles' | 'San Francisco' | 'Yosemite'),
//   title [hanzi, pinyin, English], from/to [hanzi, pinyin, English] (letters, notes and postcards only),
//   lines: [{w:[[hanzi, pinyin, gloss] | [punctuation], ...], en:'natural English'}], reward {orb, great, ultra, berry}.
// Creature, place and item names match zh_names.js exactly. Checked by tools/check_readings.js.
window.READINGS = [

// ======================= letters, notes, postcards =======================
{id:'letter_grandma_1', kind:'letter', level:1, place:null,
 title:['奶奶的信','nǎinai de xìn',"Grandma's letter"],
 from:['奶奶','nǎinai','Grandma'], to:['小美','Xiǎoměi','Xiaomei'],
 lines:[
  {w:[['宝贝','bǎobèi','sweetie'],['，'],['你好','nǐ hǎo','hello'],['！']], en:'Hello, sweetie!'},
  {w:[['你','nǐ','you'],['好','hǎo','well'],['吗','ma','(question)'],['？']], en:'How are you?'},
  {w:[['奶奶','nǎinai','Grandma'],['很','hěn','very'],['想','xiǎng','misses'],['你','nǐ','you'],['。']], en:'Grandma misses you very much.'},
  {w:[['奶奶','nǎinai','Grandma'],['爱','ài','loves'],['你','nǐ','you'],['！']], en:'Grandma loves you!'},
 ],
 reward:{orb:3}},

{id:'letter_grandpa_1', kind:'letter', level:2, place:null,
 title:['爷爷的信','yéye de xìn',"Grandpa's letter"],
 from:['爷爷','yéye','Grandpa'], to:['小美','Xiǎoměi','Xiaomei'],
 lines:[
  {w:[['宝贝','bǎobèi','sweetie'],['，'],['爷爷','yéye','Grandpa'],['想','xiǎng','misses'],['你','nǐ','you'],['了','le','(now)'],['！']], en:'Sweetie, Grandpa misses you!'},
  {w:[['周末','zhōumò','weekend'],['来','lái','come'],['爷爷','yéye',"Grandpa's"],['家','jiā','home'],['玩','wán','play'],['吧','ba','(OK?)'],['！']], en:"Come and play at Grandpa's this weekend!"},
  {w:[['我们','wǒmen','we'],['一起','yìqǐ','together'],['去','qù','go'],['钓鱼','diàoyú','fishing'],['。']], en:"We'll go fishing together."},
  {w:[['爷爷','yéye','Grandpa'],['做','zuò','cooks'],['鱼','yú','fish'],['给','gěi','for'],['你','nǐ','you'],['吃','chī','to eat'],['！']], en:'Grandpa will cook fish for you!'},
  {w:[['爷爷','yéye','Grandpa'],['爱','ài','loves'],['你','nǐ','you'],['！']], en:'Grandpa loves you!'},
 ],
 reward:{orb:3, berry:1}},

{id:'note_wang_1', kind:'note', level:2, place:'home',
 title:['王阿姨的西红柿','Wáng āyí de xīhóngshì',"Auntie Wang's tomatoes"],
 from:['王阿姨','Wáng āyí','Auntie Wang'], to:['小美','Xiǎoměi','Xiaomei'],
 lines:[
  {w:[['小美','Xiǎoměi','Xiaomei'],['，'],['你好','nǐ hǎo','hello'],['！']], en:'Hello, Xiaomei!'},
  {w:[['我','wǒ','I'],['的','de',"'s"],['西红柿','xīhóngshì','tomatoes'],['不见','bú jiàn','gone'],['了','le','(now)'],['！']], en:'My tomatoes are gone!'},
  {w:[['叶兔','yè tù','Clovehop'],['吃','chī','ate'],['了','le','(done)'],['我','wǒ','I'],['的','de',"'s"],['西红柿','xīhóngshì','tomatoes'],['！']], en:'A Clovehop ate my tomatoes!'},
  {w:[['它','tā','it'],['很','hěn','very'],['小','xiǎo','small'],['，'],['很','hěn','very'],['可爱','kě’ài','cute'],['。']], en:"It's small and very cute."},
  {w:[['你','nǐ','you'],['可以','kěyǐ','can'],['帮','bāng','help'],['我','wǒ','me'],['抓','zhuā','catch'],['它','tā','it'],['吗','ma','(question)'],['？']], en:'Can you help me catch it?'},
 ],
 reward:{orb:3, berry:1}},

{id:'note_lost_1', kind:'note', level:1, place:'home',
 title:['给乐乐','gěi Lèle','For Lele'],
 from:['嘟嘟','Dūdu','Dudu'], to:['乐乐','Lèle','Lele'],
 lines:[
  {w:[['乐乐','Lèle','Lele'],['，'],['你好','nǐ hǎo','hello'],['！']], en:'Hi, Lele!'},
  {w:[['你','nǐ','you'],['是','shì','are'],['我','wǒ','I'],['的','de',"'s"],['好','hǎo','good'],['朋友','péngyou','friend'],['。']], en:"You're my good friend."},
  {w:[['明天','míngtiān','tomorrow'],['一起','yìqǐ','together'],['玩','wán','play'],['吧','ba',"(let's)"],['！']], en:"Let's play together tomorrow!"},
  {w:[['我','wǒ','I'],['有','yǒu','have'],['一个','yí ge','a'],['新','xīn','new'],['球','qiú','ball'],['！']], en:'I have a new ball!'},
 ],
 reward:{orb:2}},

{id:'note_thanks_1', kind:'note', level:1, place:'home',
 title:['谢谢你！','xièxie nǐ!','Thank you!'],
 from:['甜甜','Tiántian','Tiantian'], to:['小美','Xiǎoměi','Xiaomei'],
 lines:[
  {w:[['小美','Xiǎoměi','Xiaomei'],['，'],['谢谢','xièxie','thank'],['你','nǐ','you'],['！']], en:'Thank you, Xiaomei!'},
  {w:[['我','wǒ','I'],['很','hěn','really'],['喜欢','xǐhuan','like'],['你','nǐ','you'],['的','de',"'s"],['画','huà','drawing'],['！']], en:'I really like your drawing!'},
  {w:[['画','huà','drawing'],['上','shang','on'],['有','yǒu','there is'],['一只','yì zhī','a'],['猫','māo','cat'],['。']], en:"There's a cat in the drawing."},
  {w:[['我','wǒ','I'],['很','hěn','very'],['开心','kāixīn','happy'],['！']], en:"I'm so happy!"},
 ],
 reward:{orb:3}},

{id:'note_mom_1', kind:'note', level:1, place:'home',
 title:['给宝贝','gěi bǎobèi','For my sweetie'],
 from:['妈妈','māma','Mom'], to:['小美','Xiǎoměi','Xiaomei'],
 lines:[
  {w:[['妈妈','māma','Mom'],['去','qù','went'],['买','mǎi','buy'],['东西','dōngxi','things'],['了','le','(done)'],['。']], en:'Mom went shopping.'},
  {w:[['六点','liù diǎn',"six o'clock"],['回家','huí jiā','come home'],['。']], en:"I'll be home at six."},
  {w:[['晚上','wǎnshang','tonight'],['吃','chī','eat'],['面条','miàntiáo','noodles'],['！']], en:"We're having noodles tonight!"},
  {w:[['妈妈','māma','Mom'],['爱','ài','loves'],['你','nǐ','you'],['！']], en:'Mom loves you!'},
 ],
 reward:{orb:2}},

{id:'postcard_mira_1', kind:'postcard', level:1, place:'home',
 title:['米拉教练在旧金山','Mǐlā jiàoliàn zài Jiùjīnshān','Coach Mira in San Francisco'],
 from:['米拉教练','Mǐlā jiàoliàn','Coach Mira'], to:['小美','Xiǎoměi','Xiaomei'],
 lines:[
  {w:[['我','wǒ','I'],['在','zài','in'],['旧金山','Jiùjīnshān','San Francisco'],['玩','wán','have fun'],['！']], en:"I'm having fun in San Francisco!"},
  {w:[['金门大桥','Jīnmén Dàqiáo','Golden Gate Bridge'],['很','hěn','very'],['大','dà','big'],['！']], en:'The Golden Gate Bridge is so big!'},
  {w:[['它','tā','it'],['是','shì','is'],['红','hóng','red'],['的','de','(one)'],['！']], en:"It's red!"},
  {w:[['旧金山','Jiùjīnshān','San Francisco'],['很','hěn','very'],['冷','lěng','cold'],['！']], en:'San Francisco is cold!'},
 ],
 reward:{orb:3}},

{id:'postcard_lele_1', kind:'postcard', level:1, place:'home',
 title:['乐乐在海边','Lèle zài hǎibiān','Lele at the beach'],
 from:['乐乐','Lèle','Lele'], to:['小美','Xiǎoměi','Xiaomei'],
 lines:[
  {w:[['我','wǒ','I'],['在','zài','am in'],['圣地亚哥','Shèngdìyàgē','San Diego'],['！']], en:"I'm in San Diego!"},
  {w:[['我','wǒ','I'],['在','zài','at'],['海边','hǎibiān','the beach'],['玩','wán','play'],['！']], en:"I'm playing at the beach!"},
  {w:[['海','hǎi','sea'],['很','hěn','very'],['大','dà','big'],['，'],['很','hěn','very'],['蓝','lán','blue'],['！']], en:'The sea is big and blue!'},
  {w:[['我','wǒ','I'],['看到','kàndào','saw'],['了','le','(done)'],['小海狮','xiǎo hǎi shī','Barkpup'],['！']], en:'I saw a Barkpup!'},
 ],
 reward:{orb:3}},

// ======================= field guide =======================
{id:'guide_smoldy', kind:'guide', level:1, place:'home',
 title:['烟狐','yān hú','Smoldy'],
 lines:[
  {w:[['这','zhè','this'],['是','shì','is'],['烟狐','yān hú','Smoldy'],['。']], en:'This is Smoldy.'},
  {w:[['它','tā','it'],['很','hěn','very'],['小','xiǎo','small'],['，'],['会','huì','can'],['吐火','tǔ huǒ','spit fire'],['！']], en:"It's small, and it can spit fire!"},
  {w:[['它','tā','it'],['不','bù','not'],['喜欢','xǐhuan','like'],['水','shuǐ','water'],['！']], en:"It doesn't like water!"},
  {w:[['它','tā','it'],['会','huì','will'],['进化成','jìnhuà chéng','evolve into'],['焰狐','yàn hú','Smolderox'],['。']], en:'It will evolve into Smolderox.'},
 ],
 reward:{orb:3}},

{id:'guide_flurrle', kind:'guide', level:1, place:'home',
 title:['雪花猫','xuě huā māo','Flurrle'],
 lines:[
  {w:[['这','zhè','this'],['是','shì','is'],['雪花猫','xuě huā māo','Flurrle'],['。']], en:'This is Flurrle.'},
  {w:[['它','tā','it'],['的','de',"'s"],['头上','tóushang','head'],['有','yǒu','has'],['冰','bīng','ice'],['。']], en:'It has ice on its head.'},
  {w:[['它','tā','it'],['喜欢','xǐhuan','likes'],['在','zài','in'],['雪','xuě','snow'],['里','li','inside'],['玩','wán','to play'],['！']], en:'It likes to play in the snow!'},
  {w:[['它','tā','it'],['会','huì','will'],['变成','biànchéng','become'],['霜山猫','shuāng shān māo','Frostlynx'],['。']], en:'It will become Frostlynx.'},
 ],
 reward:{orb:3}},

{id:'guide_basklet', kind:'guide', level:1, place:'Los Angeles',
 title:['沙龟','shā guī','Basklet'],
 lines:[
  {w:[['这','zhè','this'],['是','shì','is'],['沙龟','shā guī','Basklet'],['。']], en:'This is Basklet.'},
  {w:[['它','tā','it'],['很','hěn','very'],['慢','màn','slow'],['，'],['很','hěn','very'],['慢','màn','slow'],['！']], en:"It's slow, so slow!"},
  {w:[['它','tā','it'],['喜欢','xǐhuan','likes'],['晒太阳','shài tàiyáng','sunbathing'],['。']], en:'It likes to lie in the sun.'},
  {w:[['它','tā','it'],['会','huì','will'],['变成','biànchéng','become'],['沙山龟','shā shān guī','Mesadome'],['。']], en:'It will become Mesadome.'},
 ],
 reward:{orb:3}},

{id:'guide_zipbeak', kind:'guide', level:1, place:'San Francisco',
 title:['快蜂鸟','kuài fēng niǎo','Zipbeak'],
 lines:[
  {w:[['这','zhè','this'],['是','shì','is'],['快蜂鸟','kuài fēng niǎo','Zipbeak'],['。']], en:'This is Zipbeak.'},
  {w:[['它','tā','it'],['很','hěn','very'],['小','xiǎo','small'],['，'],['很','hěn','very'],['快','kuài','fast'],['！']], en:"It's tiny and very fast!"},
  {w:[['它','tā','it'],['喜欢','xǐhuan','likes'],['花','huā','flowers'],['。']], en:'It likes flowers.'},
  {w:[['它','tā','it'],['会','huì','will'],['变成','biànchéng','become'],['雷蜂鸟','léi fēng niǎo','Thrumwing'],['。']], en:'It will become Thrumwing.'},
 ],
 reward:{orb:3}},

{id:'guide_barkpup', kind:'guide', level:1, place:'San Diego',
 title:['小海狮','xiǎo hǎi shī','Barkpup'],
 lines:[
  {w:[['这','zhè','this'],['是','shì','is'],['小海狮','xiǎo hǎi shī','Barkpup'],['。']], en:'This is Barkpup.'},
  {w:[['它','tā','it'],['喜欢','xǐhuan','likes'],['吃','chī','to eat'],['鱼','yú','fish'],['。']], en:'It likes to eat fish.'},
  {w:[['它','tā','it'],['在','zài','at'],['海边','hǎibiān','the beach'],['睡觉','shuìjiào','sleeps'],['。']], en:'It sleeps on the beach.'},
  {w:[['它','tā','it'],['会','huì','will'],['变成','biànchéng','become'],['大海狮','dà hǎi shī','Bellowhaul'],['。']], en:'It will become Bellowhaul.'},
 ],
 reward:{orb:3}},

{id:'guide_fizzbit', kind:'guide', level:1, place:'home',
 title:['闪闪虫','shǎn shǎn chóng','Fizzbit'],
 lines:[
  {w:[['这','zhè','this'],['是','shì','is'],['闪闪虫','shǎn shǎn chóng','Fizzbit'],['。']], en:'This is Fizzbit.'},
  {w:[['它','tā','it'],['是','shì','is'],['黄','huáng','yellow'],['的','de','(one)'],['。']], en:"It's yellow."},
  {w:[['它','tā','it'],['会','huì','can'],['飞','fēi','fly'],['。']], en:'It can fly.'},
  {w:[['它','tā','it'],['会','huì','will'],['变成','biànchéng','become'],['闪翼虫','shǎn yì chóng','Fizzlinx'],['。']], en:'It will become Fizzlinx.'},
 ],
 reward:{orb:2}},

{id:'guide_soakbara', kind:'guide', level:2, place:'home',
 title:['水豚','shuǐ tún','Soakbara'],
 lines:[
  {w:[['这','zhè','this'],['是','shì','is'],['水豚','shuǐ tún','Soakbara'],['。']], en:'This is Soakbara.'},
  {w:[['它','tā','it'],['住','zhù','lives'],['在','zài','at'],['湖边','hú biān','Lakeshore'],['。']], en:'It lives at Lakeshore.'},
  {w:[['它','tā','it'],['的','de',"'s"],['头上','tóushang','head'],['有','yǒu','has'],['一个','yí ge','a'],['柚子','yòuzi','yuzu fruit'],['！']], en:'It has a yuzu fruit on its head!'},
  {w:[['它','tā','it'],['喜欢','xǐhuan','likes'],['吃','chī','to eat'],['草','cǎo','grass'],['。']], en:'It likes to eat grass.'},
  {w:[['它','tā','it'],['会','huì','will'],['进化成','jìnhuà chéng','evolve into'],['温泉豚','wēn quán tún','Springbara'],['。']], en:'It will evolve into Springbara.'},
 ],
 reward:{orb:3, berry:1}},

{id:'guide_fernfawn', kind:'guide', level:2, place:'Yosemite',
 title:['小鹿','xiǎo lù','Fernfawn'],
 lines:[
  {w:[['这','zhè','this'],['是','shì','is'],['小鹿','xiǎo lù','Fernfawn'],['。']], en:'This is Fernfawn.'},
  {w:[['它','tā','it'],['住','zhù','lives'],['在','zài','in'],['优胜美地','Yōushèngměidì','Yosemite'],['。']], en:'It lives in Yosemite.'},
  {w:[['它','tā','it'],['的','de',"'s"],['头上','tóushang','head'],['有','yǒu','has'],['叶子','yèzi','leaves'],['！']], en:'It has leaves on its head!'},
  {w:[['它','tā','it'],['喜欢','xǐhuan','likes'],['吃','chī','to eat'],['草','cǎo','grass'],['。']], en:'It likes to eat grass.'},
  {w:[['它','tā','it'],['会','huì','will'],['进化成','jìnhuà chéng','evolve into'],['林鹿','lín lù','Fernhart'],['。']], en:'It will evolve into Fernhart.'},
 ],
 reward:{orb:3, great:1}},

// ======================= newspaper =======================
{id:'news_raid_la', kind:'newspaper', level:2, place:'Los Angeles',
 title:['巨大的石霸王！','jùdà de shí bà wáng!','A giant Monolord!'],
 lines:[
  {w:[['洛杉矶','Luòshānjī','Los Angeles'],['来','lái','came'],['了','le','(done)'],['一只','yì zhī','a'],['石霸王','shí bà wáng','Monolord'],['！']], en:'A Monolord has come to Los Angeles!'},
  {w:[['它','tā','it'],['变','biàn','grew'],['巨大','jùdà','giant'],['了','le','(now)'],['！']], en:'It grew giant!'},
  {w:[['它','tā','it'],['在','zài','is in'],['好莱坞','Hǎoláiwù','Hollywood'],['。']], en:"It's in Hollywood."},
  {w:[['它','tā','it'],['很','hěn','very'],['高','gāo','tall'],['很','hěn','very'],['高','gāo','tall'],['！']], en:"It's very, very tall!"},
  {w:[['大家','dàjiā','everyone'],['一起','yìqǐ','together'],['去','qù','go'],['抓','zhuā','catch'],['它','tā','it'],['吧','ba',"(let's)"],['！']], en:"Let's all go and catch it together!"},
 ],
 reward:{orb:3, great:1}},

{id:'news_lost_sf', kind:'newspaper', level:2, place:'San Francisco',
 title:['小海狮回家了','xiǎo hǎi shī huí jiā le','Barkpup is home'],
 lines:[
  {w:[['一只','yì zhī','a'],['小海狮','xiǎo hǎi shī','Barkpup'],['迷路','mílù','got lost'],['了','le','(done)'],['。']], en:'A Barkpup got lost.'},
  {w:[['它','tā','it'],['在','zài','was'],['金门大桥','Jīnmén Dàqiáo','Golden Gate Bridge'],['下面','xiàmiàn','under'],['。']], en:'It was under the Golden Gate Bridge.'},
  {w:[['一个','yí ge','a'],['阿姨','āyí','lady'],['找到','zhǎodào','found'],['了','le','(done)'],['它','tā','it'],['。']], en:'A kind lady found it.'},
  {w:[['现在','xiànzài','now'],['它','tā','it'],['回家','huí jiā','went home'],['了','le','(done)'],['！']], en:"Now it's back home!"},
  {w:[['太','tài','so'],['好','hǎo','good'],['了','le','(!)'],['！']], en:'Hooray!'},
 ],
 reward:{orb:2, berry:1}},

{id:'news_rift', kind:'newspaper', level:3, place:'rift',
 title:['星幕裂谷打开了！','xīng mù liè gǔ dǎkāi le!','The Starveil Rift is open!'],
 lines:[
  {w:[['昨天','zuótiān','yesterday'],['晚上','wǎnshang','evening'],['，'],['星幕裂谷','xīng mù liè gǔ','Starveil Rift'],['打开','dǎkāi','opened'],['了','le','(done)'],['！']], en:'Last night, the Starveil Rift opened!'},
  {w:[['天上','tiānshàng','sky'],['的','de',"'s"],['星星','xīngxing','stars'],['是','shì','are'],['紫色','zǐsè','purple'],['的','de','(ones)'],['！']], en:'The stars in the sky are purple!'},
  {w:[['那里','nàlǐ','there'],['的','de',"'s"],['生物','shēngwù','creatures'],['会','huì','can'],['闪光','shǎnguāng','sparkle'],['！']], en:'The creatures there sparkle!'},
  {w:[['有人','yǒu rén','someone'],['看到','kàndào','saw'],['了','le','(done)'],['水月龙','shuǐ yuè lóng','Mireluna'],['！']], en:'Someone saw Mireluna!'},
  {w:[['你','nǐ','you'],['想','xiǎng','want'],['去','qù','to go'],['看一看','kàn yi kàn','have a look'],['吗','ma','(question)'],['？']], en:'Do you want to go and have a look?'},
  {w:[['别','bié',"don't"],['怕','pà','be scared'],['，'],['那里','nàlǐ','there'],['很','hěn','very'],['安静','ānjìng','quiet'],['。']], en:"Don't be scared. It's very quiet there."},
 ],
 reward:{ultra:1}},

{id:'news_gym_kai', kind:'newspaper', level:1, place:'San Diego',
 title:['凯赢了！','Kǎi yíng le!','Kai wins!'],
 lines:[
  {w:[['凯','Kǎi','Kai'],['赢','yíng','won'],['了','le','(done)'],['比赛','bǐsài','the match'],['！']], en:'Kai won the match!'},
  {w:[['凯','Kǎi','Kai'],['有','yǒu','has'],['一只','yì zhī','a'],['大海狮','dà hǎi shī','Bellowhaul'],['。']], en:'Kai has a Bellowhaul.'},
  {w:[['大海狮','dà hǎi shī','Bellowhaul'],['很','hěn','very'],['大','dà','big'],['！']], en:'Bellowhaul is really big!'},
  {w:[['太','tài','so'],['棒','bàng','great'],['了','le','(!)'],['，'],['凯','Kǎi','Kai'],['！']], en:'Way to go, Kai!'},
 ],
 reward:{orb:3}},

{id:'news_weather', kind:'newspaper', level:1, place:'home',
 title:['天气','tiānqì','Weather'],
 lines:[
  {w:[['今天','jīntiān','today'],['很','hěn','very'],['热','rè','hot'],['。']], en:"It's hot today."},
  {w:[['明天','míngtiān','tomorrow'],['有','yǒu','there is'],['雨','yǔ','rain'],['。']], en:'There will be rain tomorrow.'},
  {w:[['松岭','sōng lǐng','Pine Ridge'],['有','yǒu','there is'],['雪','xuě','snow'],['！']], en:"There's snow at Pine Ridge!"},
  {w:[['雪花猫','xuě huā māo','Flurrle'],['很','hěn','very'],['开心','kāixīn','happy'],['！']], en:'The Flurrles are very happy!'},
 ],
 reward:{orb:2}},

// ======================= magazine =======================
{id:'mag_cute', kind:'magazine', level:1, place:null,
 title:['最可爱的生物','zuì kě’ài de shēngwù','The cutest creatures'],
 lines:[
  {w:[['第一','dìyī','number one'],['是','shì','is'],['雪花猫','xuě huā māo','Flurrle'],['！']], en:'Number one is Flurrle!'},
  {w:[['第二','dì’èr','number two'],['是','shì','is'],['泡灵','pào líng','Bubbloo'],['！']], en:'Number two is Bubbloo!'},
  {w:[['第三','dìsān','number three'],['是','shì','is'],['小海狮','xiǎo hǎi shī','Barkpup'],['！']], en:'Number three is Barkpup!'},
  {w:[['你','nǐ','you'],['最','zuì','most'],['喜欢','xǐhuan','like'],['谁','shéi','who'],['？']], en:"Who's your favorite?"},
 ],
 reward:{orb:3}},

{id:'mag_curveball', kind:'magazine', level:2, place:null,
 title:['曲线球','qūxiàn qiú','Curveballs'],
 lines:[
  {w:[['你','nǐ','you'],['想','xiǎng','want'],['扔','rēng','to throw'],['曲线球','qūxiàn qiú','a curveball'],['吗','ma','(question)'],['？']], en:'Do you want to throw a curveball?'},
  {w:[['画','huà','draw'],['三个','sān ge','three'],['圈','quān','circles'],['。']], en:'Draw three circles.'},
  {w:[['然后','ránhòu','then'],['往上','wǎng shàng','upward'],['扔','rēng','throw'],['！']], en:'Then throw it up!'},
  {w:[['留球','liú qiú','Stay Orb'],['会','huì','will'],['转弯','zhuǎnwān','curve'],['！']], en:'The Stay Orb will curve!'},
  {w:[['打中','dǎzhòng','hit'],['了','le','(done)'],['！']], en:'It hit!'},
 ],
 reward:{orb:3, great:1}},

{id:'mag_food', kind:'magazine', level:1, place:null,
 title:['生物吃什么？','shēngwù chī shénme?','What do creatures eat?'],
 lines:[
  {w:[['叶兔','yè tù','Clovehop'],['喜欢','xǐhuan','likes'],['吃','chī','to eat'],['叶子','yèzi','leaves'],['。']], en:'Clovehops like to eat leaves.'},
  {w:[['小海狮','xiǎo hǎi shī','Barkpup'],['喜欢','xǐhuan','likes'],['吃','chī','to eat'],['鱼','yú','fish'],['。']], en:'Barkpups like to eat fish.'},
  {w:[['石豆','shí dòu','Pebblin'],['喜欢','xǐhuan','likes'],['吃','chī','to eat'],['石头','shítou','stones'],['！']], en:'Pebblins like to eat stones!'},
  {w:[['你','nǐ','you'],['喜欢','xǐhuan','like'],['吃','chī','to eat'],['什么','shénme','what'],['？']], en:'What do you like to eat?'},
 ],
 reward:{orb:3}},

{id:'mag_recipe', kind:'magazine', level:2, place:null,
 title:['安心莓牛奶','ān xīn méi niúnǎi','Calm Berry milk'],
 lines:[
  {w:[['我们','wǒmen','we'],['来','lái',"(let's)"],['做','zuò','make'],['安心莓','ān xīn méi','Calm Berry'],['牛奶','niúnǎi','milk'],['！']], en:"Let's make Calm Berry milk!"},
  {w:[['要','yào','need'],['五个','wǔ ge','five'],['安心莓','ān xīn méi','Calm Berries'],['。']], en:'You need five Calm Berries.'},
  {w:[['要','yào','need'],['一杯','yì bēi','a cup of'],['牛奶','niúnǎi','milk'],['。']], en:'You need a cup of milk.'},
  {w:[['放','fàng','put'],['在','zài','at'],['一起','yìqǐ','together'],['，'],['打一打','dǎ yi dǎ','blend it'],['！']], en:'Put them together and blend!'},
  {w:[['好喝','hǎohē','yummy'],['！']], en:'Yummy!'},
 ],
 reward:{orb:3, berry:1}},

{id:'mag_didyouknow', kind:'magazine', level:1, place:null,
 title:['你知道吗？','nǐ zhīdào ma?','Did you know?'],
 lines:[
  {w:[['闪闪虫','shǎn shǎn chóng','Fizzbit'],['会','huì','will'],['变成','biànchéng','become'],['鸟','niǎo','a bird'],['！']], en:'Fizzbit will turn into a bird!'},
  {w:[['小鹿','xiǎo lù','Fernfawn'],['头上','tóushang','on its head'],['有','yǒu','has'],['叶子','yèzi','leaves'],['！']], en:'Fernfawn has leaves on its head!'},
  {w:[['快蜂鸟','kuài fēng niǎo','Zipbeak'],['会','huì','can'],['往后','wǎng hòu','backwards'],['飞','fēi','fly'],['！']], en:'Zipbeak can fly backwards!'},
  {w:[['雷牙','léi yá','Boltusk'],['有','yǒu','has'],['大','dà','big'],['牙','yá','tusks'],['！']], en:'Boltusk has big tusks!'},
 ],
 reward:{orb:3}},

// ======================= book pages =======================
{id:'bedtime_1', kind:'book', level:1, place:null,
 title:['月亮在哪里？','yuèliang zài nǎlǐ?','Where is the moon?'],
 lines:[
  {w:[['天','tiān','sky'],['黑','hēi','dark'],['了','le','(now)'],['。']], en:'It is getting dark.'},
  {w:[['小','xiǎo','little'],['雪鸟','xuě niǎo','Hushflake'],['看看','kànkan','looks at'],['天','tiān','sky'],['。']], en:'Little Hushflake looks up at the sky.'},
  {w:[['月亮','yuèliang','moon'],['在','zài','is at'],['哪里','nǎlǐ','where'],['？']], en:'Where is the moon?'},
  {w:[['小','xiǎo','little'],['雪鸟','xuě niǎo','Hushflake'],['要','yào','wants to'],['找','zhǎo','find'],['月亮','yuèliang','moon'],['。']], en:'Little Hushflake wants to find the moon.'},
 ],
 reward:{orb:2}},

{id:'bedtime_2', kind:'book', level:1, place:null,
 title:['小雪鸟飞呀飞','xiǎo xuě niǎo fēi ya fēi','Little Hushflake flies'],
 lines:[
  {w:[['小','xiǎo','little'],['雪鸟','xuě niǎo','Hushflake'],['飞呀飞','fēi ya fēi','flies and flies'],['。']], en:'Little Hushflake flies and flies.'},
  {w:[['它','tā','it'],['看到','kàndào','sees'],['了','le','(done)'],['雪花猫','xuě huā māo','Flurrle'],['。']], en:'It sees Flurrle.'},
  {w:[['“'],['你好','nǐ hǎo','hello'],['，'],['雪花猫','xuě huā māo','Flurrle'],['！'],['”']], en:'"Hello, Flurrle!"'},
  {w:[['“'],['我们','wǒmen','we'],['一起','yìqǐ','together'],['找','zhǎo','look'],['吧','ba',"(let's)"],['！'],['”']], en:'"Let\'s look together!"'},
 ],
 reward:{orb:3}},

{id:'bedtime_3', kind:'book', level:1, place:null,
 title:['晚安，小雪鸟','wǎn’ān, xiǎo xuě niǎo','Good night, little Hushflake'],
 lines:[
  {w:[['月亮','yuèliang','moon'],['来','lái','came'],['了','le','(done)'],['！']], en:'Here comes the moon!'},
  {w:[['月亮','yuèliang','moon'],['很','hěn','very'],['大','dà','big'],['，'],['很','hěn','very'],['白','bái','white'],['。']], en:'The moon is big and white.'},
  {w:[['小','xiǎo','little'],['雪鸟','xuě niǎo','Hushflake'],['累','lèi','tired'],['了','le','(now)'],['。']], en:'Little Hushflake is tired.'},
  {w:[['晚安','wǎn’ān','good night'],['，'],['小','xiǎo','little'],['雪鸟','xuě niǎo','Hushflake'],['！']], en:'Good night, little Hushflake!'},
 ],
 reward:{orb:4}},

{id:'legend_mireluna', kind:'book', level:3, place:'rift',
 title:['水月龙的传说','shuǐ yuè lóng de chuánshuō','The legend of Mireluna'],
 lines:[
  {w:[['很久','hěn jiǔ','long'],['很久','hěn jiǔ','long'],['以前','yǐqián','ago'],['，'],['天上','tiānshàng','in the sky'],['没有','méiyǒu','there was no'],['月亮','yuèliang','moon'],['。']], en:'Long, long ago, there was no moon in the sky.'},
  {w:[['晚上','wǎnshang','nights'],['很','hěn','very'],['黑','hēi','dark'],['，'],['小动物','xiǎo dòngwù','little animals'],['都','dōu','all'],['很','hěn','very'],['怕','pà','scared'],['。']], en:'The nights were very dark, and all the little animals were scared.'},
  {w:[['一天','yì tiān','one day'],['，'],['水月龙','shuǐ yuè lóng','Mireluna'],['从','cóng','from'],['星幕裂谷','xīng mù liè gǔ','Starveil Rift'],['来','lái','came'],['了','le','(done)'],['。']], en:'One day, Mireluna came from the Starveil Rift.'},
  {w:[['它','tā','it'],['的','de',"'s"],['身上','shēnshang','body'],['有','yǒu','has'],['很多','hěn duō','lots of'],['星星','xīngxing','stars'],['。']], en:'It had lots of stars on its body.'},
  {w:[['它','tā','it'],['把','bǎ','took'],['头上','tóushang','head'],['的','de',"'s"],['月亮','yuèliang','moon'],['放','fàng','put'],['在','zài','in'],['天上','tiānshàng','the sky'],['。']], en:'It took the moon from its head and put it in the sky.'},
  {w:[['现在','xiànzài','now'],['，'],['晚上','wǎnshang','at night'],['有','yǒu','there is'],['月亮','yuèliang','moon'],['了','le','(now)'],['！']], en:'Now there is a moon at night!'},
 ],
 reward:{ultra:1}},

// ======================= posters and signs =======================
{id:'poster_gym', kind:'poster', level:2, place:'home',
 title:['后院道馆','hòu yuàn dàoguǎn','Backyard Gym'],
 lines:[
  {w:[['欢迎','huānyíng','welcome'],['来','lái','to'],['后院','hòu yuàn','Backyard'],['道馆','dàoguǎn','gym'],['！']], en:'Welcome to the Backyard Gym!'},
  {w:[['早上','zǎoshang','morning'],['九点','jiǔ diǎn',"nine o'clock"],['开门','kāimén','opens'],['。']], en:'Opens at nine in the morning.'},
  {w:[['下午','xiàwǔ','afternoon'],['五点','wǔ diǎn',"five o'clock"],['关门','guānmén','closes'],['。']], en:'Closes at five in the afternoon.'},
  {w:[['周末','zhōumò','weekends'],['也','yě','also'],['开门','kāimén','open'],['！']], en:'Open on weekends too!'},
  {w:[['米拉教练','Mǐlā jiàoliàn','Coach Mira'],['等','děng','waits for'],['你','nǐ','you'],['！']], en:'Coach Mira is waiting for you!'},
 ],
 reward:{orb:2, great:1}},

{id:'poster_lost', kind:'poster', level:1, place:'home',
 title:['找火熊猫','zhǎo huǒ xióng māo','Looking for Rustkit'],
 lines:[
  {w:[['火熊猫','huǒ xióng māo','Rustkit'],['不见','bú jiàn','gone'],['了','le','(now)'],['！']], en:'Rustkit is lost!'},
  {w:[['它','tā','it'],['是','shì','is'],['红','hóng','red'],['的','de','(one)'],['。']], en:"It's red."},
  {w:[['它','tā','it'],['很','hěn','very'],['小','xiǎo','small'],['，'],['很','hěn','very'],['可爱','kě’ài','cute'],['。']], en:"It's small and very cute."},
  {w:[['请','qǐng','please'],['给','gěi','to'],['我','wǒ','me'],['打电话','dǎ diànhuà','call'],['！']], en:'Please call me!'},
 ],
 reward:{orb:3}},

{id:'poster_yosemite', kind:'poster', level:1, place:'Yosemite',
 title:['请小心！','qǐng xiǎoxīn!','Please be careful!'],
 lines:[
  {w:[['这里','zhèlǐ','here'],['有','yǒu','there are'],['熊','xióng','bears'],['！']], en:'There are bears here!'},
  {w:[['不要','bú yào',"don't"],['给','gěi','give'],['熊','xióng','bears'],['吃','chī','eat'],['东西','dōngxi','things'],['。']], en:"Don't feed the bears."},
  {w:[['不要','bú yào',"don't"],['跑','pǎo','run'],['。']], en:"Don't run."},
  {w:[['请','qǐng','please'],['慢慢','mànmàn','slowly'],['走','zǒu','walk'],['。']], en:'Please walk slowly.'},
 ],
 reward:{orb:2}},

// ======================= diary pages =======================
{id:'diary_1', kind:'diary', level:1, place:'home',
 title:['我的日记','wǒ de rìjì','My diary'],
 lines:[
  {w:[['今天','jīntiān','today'],['我','wǒ','I'],['在','zài','was in'],['后院','hòu yuàn','Backyard'],['。']], en:'Today I was in the Backyard.'},
  {w:[['我','wǒ','I'],['看到','kàndào','saw'],['一只','yì zhī','a'],['叶兔','yè tù','Clovehop'],['。']], en:'I saw a Clovehop.'},
  {w:[['我','wǒ','I'],['扔','rēng','threw'],['了','le','(done)'],['一个','yí ge','a'],['留球','liú qiú','Stay Orb'],['。']], en:'I threw a Stay Orb.'},
  {w:[['我','wǒ','I'],['抓到','zhuādào','caught'],['了','le','(done)'],['！']], en:'I caught it!'},
 ],
 reward:{orb:3}},

{id:'diary_2', kind:'diary', level:1, place:'Yosemite',
 title:['在优胜美地','zài Yōushèngměidì','In Yosemite'],
 lines:[
  {w:[['我','wǒ','I'],['在','zài','am in'],['优胜美地','Yōushèngměidì','Yosemite'],['！']], en:"I'm in Yosemite!"},
  {w:[['半穹顶','Bànqióngdǐng','Half Dome'],['很','hěn','very'],['高','gāo','tall'],['！']], en:'Half Dome is so tall!'},
  {w:[['我','wǒ','I'],['看到','kàndào','saw'],['一只','yì zhī','a'],['小鹿','xiǎo lù','Fernfawn'],['。']], en:'I saw a Fernfawn.'},
  {w:[['小鹿','xiǎo lù','Fernfawn'],['很','hěn','very'],['可爱','kě’ài','cute'],['！']], en:'Fernfawn is so cute!'},
 ],
 reward:{orb:3}},

{id:'diary_3', kind:'diary', level:2, place:'rift',
 title:['好多星星','hǎo duō xīngxing','So many stars'],
 lines:[
  {w:[['今天','jīntiān','today'],['我','wǒ','I'],['去','qù','went to'],['了','le','(done)'],['星幕裂谷','xīng mù liè gǔ','Starveil Rift'],['！']], en:'Today I went to the Starveil Rift!'},
  {w:[['天上','tiānshàng','in the sky'],['有','yǒu','there are'],['好多','hǎo duō','so many'],['星星','xīngxing','stars'],['。']], en:'There were so many stars in the sky.'},
  {w:[['一只','yì zhī','a'],['叶兔','yè tù','Clovehop'],['在','zài','is'],['闪光','shǎnguāng','sparkling'],['！']], en:'A Clovehop was sparkling!'},
  {w:[['我','wǒ','I'],['一点儿','yìdiǎnr','a little bit'],['也','yě','even'],['不','bú','not'],['怕','pà','scared'],['！']], en:"I wasn't scared at all!"},
  {w:[['星星','xīngxing','stars'],['真','zhēn','so'],['漂亮','piàoliang','pretty'],['！']], en:'The stars are so pretty!'},
 ],
 reward:{orb:2, great:1}},

];
