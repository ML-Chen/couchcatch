// Couchcatch story readings for the "Little Star 小星" arc: papers lying around once a story chapter is done.
// Same format as readings.js; chapter = how many story chapters must be finished first (S.story.ch, see reader.js).
// Load AFTER readings.js (it assigns window.READINGS = [...]), so these entries are not overwritten.
window.READINGS = window.READINGS || [];
window.READINGS.push(...[

// after chapter 2: Little Star draws its family
{id:'star_drawing', kind:'note', level:1, chapter:2, place:null,
 title:['小星的画','Xiǎo Xīng de huà',"Little Star's drawing"],
 from:['小星','Xiǎo Xīng','Little Star'],
 lines:[
  {w:[['这','zhè','this'],['是','shì','is'],['我','wǒ','me'],['。']], en:'This is me.'},
  {w:[['这','zhè','this'],['是','shì','is'],['我','wǒ','my'],['妈妈','māma','mom'],['。']], en:'This is my mom.'},
  {w:[['我的','wǒ de','my'],['家','jiā','home'],['在','zài','is in'],['天上','tiānshàng','the sky'],['。']], en:'My home is in the sky.'},
  {w:[['我','wǒ','I'],['想','xiǎng','want to'],['回家','huíjiā','go home'],['。']], en:'I want to go home.'},
 ],
 reward:{orb:2}},

// after chapter 3: the best friend's diary
{id:'star_diary_lele', kind:'diary', level:1, chapter:3, place:null,
 title:['乐乐的日记','Lèle de rìjì',"Lele's diary"],
 lines:[
  {w:[['今天','jīntiān','today'],['我','wǒ','I'],['去','qù','went to'],['小美','Xiǎoměi',"Xiaomei's"],['家','jiā','house'],['。']], en:"Today I went to Xiaomei's house."},
  {w:[['我','wǒ','I'],['看到','kàndào','saw'],['小星','Xiǎo Xīng','Little Star'],['了','le','(done)'],['！']], en:'I saw Little Star!'},
  {w:[['小星','Xiǎo Xīng','Little Star'],['很','hěn','very'],['小','xiǎo','small'],['，'],['很','hěn','very'],['亮','liàng','bright'],['。']], en:'Little Star is small and bright.'},
  {w:[['我们','wǒmen','we'],['是','shì','are'],['好','hǎo','good'],['朋友','péngyou','friends'],['！']], en:'We are good friends!'},
 ],
 reward:{orb:3}},

// after chapter 3: a page from Professor Lin's notebook
{id:'star_lin_notes', kind:'guide', level:1, chapter:3, place:null,
 title:['星星宝宝','xīngxing bǎobao','Baby star creatures'],
 from:['林教授','Lín jiàoshòu','Professor Lin'],
 lines:[
  {w:[['星星','xīngxing','star'],['宝宝','bǎobao','babies'],['很','hěn','are very'],['小','xiǎo','small'],['。']], en:'Baby stars are very small.'},
  {w:[['它们','tāmen','they'],['会','huì','can'],['发光','fāguāng','glow'],['。']], en:'They can glow.'},
  {w:[['它们的','tāmen de','their'],['家','jiā','home'],['在','zài','is in'],['星幕','xīngmù','the Starveil'],['。']], en:'Their home is in the Starveil.'},
  {w:[['三个','sān ge','three'],['碎片','suìpiàn','pieces'],['开','kāi','open'],['门','mén','the door'],['。']], en:'Three star pieces open the door.'},
 ],
 reward:{orb:2, great:1}},

// after chapter 5: the newspaper
{id:'star_news_bridge', kind:'newspaper', level:1, chapter:5, place:null,
 title:['大桥上的光','dàqiáo shàng de guāng','Strange lights over the Golden Gate Bridge'],
 lines:[
  {w:[['金门大桥','Jīnmén Dàqiáo','Golden Gate Bridge'],['上','shàng','over'],['有','yǒu','there were'],['光','guāng','lights'],['！']], en:'There were lights over the Golden Gate Bridge!'},
  {w:[['光','guāng','the lights'],['是','shì','were'],['黄色','huángsè','yellow'],['的','de','(ones)'],['。']], en:'The lights were yellow.'},
  {w:[['它们','tāmen','they'],['一闪一闪','yì shǎn yì shǎn','twinkled on and off'],['。']], en:'They twinkled on and off.'},
  {w:[['是','shì','are they'],['星星','xīngxing','stars'],['吗','ma','(question)'],['？']], en:'Were they stars?'},
 ],
 reward:{orb:3}},

// after chapter 6: the rangers' poster
{id:'star_poster', kind:'poster', level:1, chapter:6, place:null,
 title:['今晚看星星！','jīnwǎn kàn xīngxing!','Look at the stars tonight!'],
 from:['护林员','hùlínyuán','the park rangers'],
 lines:[
  {w:[['今晚','jīnwǎn','tonight'],['天','tiān','the sky'],['很','hěn','very'],['黑','hēi','dark'],['。']], en:'Tonight the sky will be very dark.'},
  {w:[['星星','xīngxing','the stars'],['很','hěn','very'],['亮','liàng','bright'],['！']], en:'The stars will be very bright!'},
  {w:[['来','lái','come to'],['半穹顶','Bàn Qióngdǐng','Half Dome'],['看','kàn','look at'],['星星','xīngxing','stars'],['。']], en:'Come to Half Dome to see the stars.'},
  {w:[['请','qǐng','please'],['带','dài','bring'],['水','shuǐ','water'],['，'],['慢慢','mànmàn','slowly'],['走','zǒu','walk'],['。']], en:'Please bring water and walk slowly.'},
 ],
 reward:{orb:2, berry:1}},

// after chapter 8: the Star Mother's lullaby (original)
{id:'star_lullaby', kind:'book', level:1, chapter:8, place:null,
 title:['星星妈妈的歌','xīngxing māma de gē',"The Star Mother's lullaby"],
 lines:[
  {w:[['小','xiǎo','little'],['星星','xīngxing','star'],['，'],['睡','shuì','sleep'],['吧','ba','(now)'],['。']], en:'Little star, go to sleep.'},
  {w:[['天','tiān','the sky'],['黑','hēi','dark'],['了','le','(now)'],['，'],['不要','bú yào',"don't"],['怕','pà','be scared'],['。']], en:"The sky is dark. Don't be scared."},
  {w:[['妈妈','māma','Mommy'],['在','zài','is'],['这里','zhèlǐ','here'],['。']], en:'Mommy is here.'},
  {w:[['晚安',"wǎn'ān",'good night'],['，'],['小','xiǎo','little'],['星星','xīngxing','star'],['。']], en:'Good night, little star.'},
 ],
 reward:{great:1}},

]);
