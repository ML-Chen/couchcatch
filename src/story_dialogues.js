// Couchcatch story arc: "Little Star 小星 (Xiǎo Xīng)". A baby star creature fell out of the Starveil into the backyard
// and wants to go home. Chapters story_1 … story_9 are started by story.js; each one ends with the next goal, said simply.
// Same format and rules as dialogues.js: child lines stay short (<= 8 characters), only correct options (ok:true).
// Star pieces: one per badge (story.js counts badges), so Coach Mira's badge comes with the first piece.
window.DIALOGUES = window.DIALOGUES || {};
Object.assign(window.DIALOGUES, {

  // ---------- chapter 1: a star in the backyard ----------
  story_1: {
    title:{en:"Little Star: A Star Fell Down!", zh:"星星掉下来了！", py:"xīng xing diào xià lái le!"},
    who:{name:"Auntie Wang", zh:"王阿姨", py:"Wáng ā yí", role:"neighbor"},
    setting:"Auntie Wang hurries to the fence. She has big news about last night!",
    turns:[
      {npc:{zh:"小朋友，你好！", py:"xiǎo péng you, nǐ hǎo!", en:"Hello, little friend!"}},
      {you:[
        {zh:"王阿姨，你好！", py:"Wáng ā yí, nǐ hǎo!", en:"Hi, Auntie Wang!", ok:true, reply:{zh:"昨晚有星星掉下来了！", py:"zuó wǎn yǒu xīng xing diào xià lái le!", en:"Last night a star fell down!"}}]},
      {you:[
        {zh:"真的吗？在哪里？", py:"zhēn de ma? zài nǎ lǐ?", en:"Really? Where?", ok:true, reply:{zh:"在你家后院！我们去看看！", py:"zài nǐ jiā hòu yuàn! wǒ men qù kàn kan!", en:"In your backyard! Let's go and look!"}}]},
      {npc:{zh:"快看！小树下面有光！", py:"kuài kàn! xiǎo shù xià miàn yǒu guāng!", en:"Look! There's a light under the bush!"}},
      {you:[
        {zh:"这是什么？", py:"zhè shì shén me?", en:"What is this?", ok:true, reply:{zh:"是小星星！它在发光！", py:"shì xiǎo xīng xing! tā zài fā guāng!", en:"It's a little star! It's glowing!"}}]},
      {npc:{zh:"它有点儿怕。", py:"tā yǒu diǎnr pà.", en:"It's a little scared."}},
      {you:[
        {zh:"别怕！我们是朋友！", py:"bié pà! wǒ men shì péng you!", en:"Don't be scared! We're friends!", ok:true, reply:{zh:"看！它出来了！它喜欢你！", py:"kàn! tā chū lái le! tā xǐ huan nǐ!", en:"Look! It came out! It likes you!"}},
        {zh:"你好，小星星！", py:"nǐ hǎo, xiǎo xīng xing!", en:"Hello, little star!", ok:true, reply:{zh:"看！它出来了！它喜欢你！", py:"kàn! tā chū lái le! tā xǐ huan nǐ!", en:"Look! It came out! It likes you!"}}]},
      {npc:{zh:"它要一个名字。", py:"tā yào yí ge míng zi.", en:"It needs a name."}},
      {you:[
        {zh:"叫它小星吧！", py:"jiào tā Xiǎo Xīng ba!", en:"Let's call it Little Star!", ok:true, reply:{zh:"小星！好名字！", py:"Xiǎo Xīng! hǎo míng zi!", en:"Little Star! What a good name!"}}]},
      {npc:{zh:"小星看着天上。它想家了。", py:"Xiǎo Xīng kàn zhe tiān shàng. tā xiǎng jiā le.", en:"Little Star is looking up at the sky. It misses home."}},
      {you:[
        {zh:"小星的家在哪里？", py:"Xiǎo Xīng de jiā zài nǎ lǐ?", en:"Where is Little Star's home?", ok:true, reply:{zh:"我不知道。问问米拉教练吧！", py:"wǒ bù zhī dào. wèn wen Mǐ lā jiào liàn ba!", en:"I don't know. Let's ask Coach Mira!"}}]}
    ],
    end:{zh:"米拉教练在后院道馆。赢她的徽章吧！", py:"Mǐ lā jiào liàn zài hòu yuàn dào guǎn. yíng tā de huī zhāng ba!", en:"Coach Mira is at the Backyard gym. Go win her badge!"},
    reward:{orb:3, berry:1}
  },

  // ---------- chapter 2: Coach Mira knows starlight ----------
  story_2: {
    title:{en:"Little Star: Starlight", zh:"星光", py:"xīng guāng"},
    who:{name:"Coach Mira", zh:"米拉教练", py:"Mǐ lā jiào liàn", role:"coach"},
    setting:"You just won the Backyard badge! Coach Mira jogs over, then stops and stares at Little Star.",
    turns:[
      {npc:{zh:"你赢了！这是你的徽章！", py:"nǐ yíng le! zhè shì nǐ de huī zhāng!", en:"You won! Here's your badge!"}},
      {you:[
        {zh:"谢谢教练！", py:"xiè xie jiào liàn!", en:"Thanks, Coach!", ok:true, reply:{zh:"咦？你后面是谁？", py:"yí? nǐ hòu miàn shì shéi?", en:"Huh? Who's that behind you?"}},
        {zh:"太棒了！谢谢！", py:"tài bàng le! xiè xie!", en:"Awesome! Thanks!", ok:true, reply:{zh:"咦？你后面是谁？", py:"yí? nǐ hòu miàn shì shéi?", en:"Huh? Who's that behind you?"}}]},
      {you:[
        {zh:"这是小星！", py:"zhè shì Xiǎo Xīng!", en:"This is Little Star!", ok:true, reply:{zh:"它在发光！这是星光！", py:"tā zài fā guāng! zhè shì xīng guāng!", en:"It's glowing! That's starlight!"}}]},
      {npc:{zh:"星光从星幕来。", py:"xīng guāng cóng xīng mù lái.", en:"Starlight comes from the Starveil."}},
      {you:[
        {zh:"星幕是什么？", py:"xīng mù shì shén me?", en:"What's the Starveil?", ok:true, reply:{zh:"是星星的家，很远很远。", py:"shì xīng xing de jiā, hěn yuǎn hěn yuǎn.", en:"It's where the stars live. Very, very far away."}}]},
      {you:[
        {zh:"小星想回家！", py:"Xiǎo Xīng xiǎng huí jiā!", en:"Little Star wants to go home!", ok:true, reply:{zh:"我找到这个。给小星吧！", py:"wǒ zhǎo dào zhè ge. gěi Xiǎo Xīng ba!", en:"I found this. It's for Little Star!"}}]},
      {you:[
        {zh:"哇！亮亮的！", py:"wā! liàng liàng de!", en:"Wow! It's so shiny!", ok:true, reply:{zh:"林教授知道这是什么。", py:"Lín jiào shòu zhī dào zhè shì shén me.", en:"Professor Lin will know what it is."}}]},
      {you:[
        {zh:"林教授在哪里？", py:"Lín jiào shòu zài nǎ lǐ?", en:"Where is Professor Lin?", ok:true, reply:{zh:"他在湖边！他人很好。", py:"tā zài hú biān! tā rén hěn hǎo.", en:"He's at the Lakeshore! He's very kind."}}]}
    ],
    end:{zh:"去湖边找林教授吧！加油！", py:"qù hú biān zhǎo Lín jiào shòu ba! jiā yóu!", en:"Go to the Lakeshore and find Professor Lin! You can do it!"},
    reward:{great:1, orb:2}
  },

  // ---------- chapter 3: Professor Lin and the star pieces ----------
  story_3: {
    title:{en:"Little Star: Star Pieces", zh:"星星碎片", py:"xīng xing suì piàn"},
    who:{name:"Professor Lin", zh:"林教授", py:"Lín jiào shòu", role:"professor"},
    setting:"By the lake, a kind creature scientist peers at Little Star through big round glasses.",
    turns:[
      {npc:{zh:"你好！我是林教授。", py:"nǐ hǎo! wǒ shì Lín jiào shòu.", en:"Hello! I'm Professor Lin."}},
      {you:[
        {zh:"林教授，你好！", py:"Lín jiào shòu, nǐ hǎo!", en:"Hello, Professor Lin!", ok:true, reply:{zh:"哇！这是星星宝宝！", py:"wā! zhè shì xīng xing bǎo bao!", en:"Wow! This is a baby star!"}}]},
      {you:[
        {zh:"它叫小星！", py:"tā jiào Xiǎo Xīng!", en:"Its name is Little Star!", ok:true, reply:{zh:"小星，你好！", py:"Xiǎo Xīng, nǐ hǎo!", en:"Hello, Little Star!"}},
        {zh:"它是我的朋友！", py:"tā shì wǒ de péng you!", en:"It's my friend!", ok:true, reply:{zh:"你们是好朋友！真好！", py:"nǐ men shì hǎo péng you! zhēn hǎo!", en:"You're good friends! How nice!"}}]},
      {npc:{zh:"它的家人在星幕。", py:"tā de jiā rén zài xīng mù.", en:"Its family lives in the Starveil."}},
      {you:[
        {zh:"我们怎么去？", py:"wǒ men zěn me qù?", en:"How do we get there?", ok:true, reply:{zh:"要三个星星碎片。", py:"yào sān ge xīng xing suì piàn.", en:"You need three star pieces."}},
        {zh:"我们可以去吗？", py:"wǒ men kě yǐ qù ma?", en:"Can we go there?", ok:true, reply:{zh:"可以！要三个星星碎片。", py:"kě yǐ! yào sān ge xīng xing suì piàn.", en:"Yes! You need three star pieces."}}]},
      {npc:{zh:"有三个，门就开了！", py:"yǒu sān ge, mén jiù kāi le!", en:"With three, the door home opens!"}},
      {you:[
        {zh:"我有一个！你看！", py:"wǒ yǒu yí ge! nǐ kàn!", en:"I have one! Look!", ok:true, reply:{zh:"对！这是星星碎片！", py:"duì! zhè shì xīng xing suì piàn!", en:"Yes! This is a star piece!"}}]},
      {you:[
        {zh:"还有两个在哪里？", py:"hái yǒu liǎng ge zài nǎ lǐ?", en:"Where are the other two?", ok:true, reply:{zh:"道馆的教练有！", py:"dào guǎn de jiào liàn yǒu!", en:"The gym leaders have them!"}}]},
      {npc:{zh:"一个徽章，一个碎片。", py:"yí ge huī zhāng, yí ge suì piàn.", en:"One badge, one star piece."}},
      {you:[
        {zh:"好的！加油！", py:"hǎo de! jiā yóu!", en:"OK! Let's do it!", ok:true, reply:{zh:"小星也说加油！", py:"Xiǎo Xīng yě shuō jiā yóu!", en:"Little Star says 'go for it' too!"}},
        {zh:"我们走吧！", py:"wǒ men zǒu ba!", en:"Let's go!", ok:true, reply:{zh:"好！小星也说加油！", py:"hǎo! Xiǎo Xīng yě shuō jiā yóu!", en:"Great! Little Star says 'go for it' too!"}}]}
    ],
    end:{zh:"再赢两个徽章吧！", py:"zài yíng liǎng ge huī zhāng ba!", en:"Win two more badges!"},
    reward:{orb:4}
  },

  // ---------- chapter 4: Grandma's big idea ----------
  story_4: {
    title:{en:"Little Star: Grandma's Big Idea", zh:"去看星星", py:"qù kàn xīng xing"},
    who:{name:"Grandma", zh:"奶奶", py:"nǎi nai", role:"phone"},
    setting:"Ring ring! It's Grandma, and you have so much to tell her.",
    turns:[
      {npc:{zh:"喂？宝贝，是奶奶！", py:"wèi? bǎo bèi, shì nǎi nai!", en:"Hello? Sweetie, it's Grandma!"}},
      {you:[
        {zh:"奶奶，你好！", py:"nǎi nai, nǐ hǎo!", en:"Hi, Grandma!", ok:true, reply:{zh:"你好吗？在做什么？", py:"nǐ hǎo ma? zài zuò shén me?", en:"How are you? What are you up to?"}}]},
      {you:[
        {zh:"我有一个新朋友！", py:"wǒ yǒu yí ge xīn péng you!", en:"I have a new friend!", ok:true, reply:{zh:"真的吗？是谁？", py:"zhēn de ma? shì shéi?", en:"Really? Who?"}}]},
      {you:[
        {zh:"它是小星星！", py:"tā shì xiǎo xīng xing!", en:"It's a little star!", ok:true, reply:{zh:"哇！星星朋友！", py:"wā! xīng xing péng you!", en:"Wow! A star friend!"}}]},
      {you:[
        {zh:"我有三个碎片了！", py:"wǒ yǒu sān ge suì piàn le!", en:"I have three star pieces now!", ok:true, reply:{zh:"太棒了！你真厉害！", py:"tài bàng le! nǐ zhēn lì hai!", en:"Awesome! You're amazing!"}}]},
      {you:[
        {zh:"我们去哪里呢？", py:"wǒ men qù nǎ lǐ ne?", en:"Where should we go?", ok:true, reply:{zh:"去看星星！优胜美地的星星最亮！", py:"qù kàn xīng xing! yōu shèng měi dì de xīng xing zuì liàng!", en:"Go see the stars! The stars are brightest in Yosemite!"}}]},
      {npc:{zh:"优胜美地在加州。你们去玩吧！", py:"yōu shèng měi dì zài jiā zhōu. nǐ men qù wán ba!", en:"Yosemite is in California. Take a trip there!"}},
      {you:[
        {zh:"好的！我们去加州！", py:"hǎo de! wǒ men qù jiā zhōu!", en:"OK! We're going to California!", ok:true, reply:{zh:"奶奶爱你！一路平安！", py:"nǎi nai ài nǐ! yí lù píng ān!", en:"Grandma loves you! Have a safe trip!"}},
        {zh:"太棒了！谢谢奶奶！", py:"tài bàng le! xiè xie nǎi nai!", en:"Awesome! Thanks, Grandma!", ok:true, reply:{zh:"不客气！一路平安！", py:"bú kè qi! yí lù píng ān!", en:"You're welcome! Have a safe trip!"}}]}
    ],
    end:{zh:"坐飞机去加州吧！再见，宝贝！", py:"zuò fēi jī qù jiā zhōu ba! zài jiàn, bǎo bèi!", en:"Fly to California! Bye, sweetie!"},
    reward:{berry:2, orb:2}
  },

  // ---------- chapter 5: Ranger Gao saw lights ----------
  story_5: {
    title:{en:"Little Star: Lights in the Sky", zh:"天上的光", py:"tiān shàng de guāng"},
    who:{name:"Ranger Gao", zh:"高叔叔", py:"Gāo shū shu", role:"ranger"},
    setting:"Your first stop in California! A friendly park ranger in a wide hat waves hello.",
    turns:[
      {npc:{zh:"你好！欢迎来加州！", py:"nǐ hǎo! huān yíng lái jiā zhōu!", en:"Hello! Welcome to California!"}},
      {you:[
        {zh:"谢谢！我喜欢加州！", py:"xiè xie! wǒ xǐ huan jiā zhōu!", en:"Thanks! I like California!", ok:true, reply:{zh:"我是护林员高叔叔。", py:"wǒ shì hù lín yuán Gāo shū shu.", en:"I'm a park ranger. Call me Ranger Gao."}},
        {zh:"你好，叔叔！", py:"nǐ hǎo, shū shu!", en:"Hello, sir!", ok:true, reply:{zh:"我是护林员高叔叔。", py:"wǒ shì hù lín yuán Gāo shū shu.", en:"I'm a park ranger. Call me Ranger Gao."}}]},
      {you:[
        {zh:"这是我的朋友小星！", py:"zhè shì wǒ de péng you Xiǎo Xīng!", en:"This is my friend Little Star!", ok:true, reply:{zh:"哇，它在发光！", py:"wā, tā zài fā guāng!", en:"Wow, it's glowing!"}}]},
      {npc:{zh:"我昨晚看到这样的光！", py:"wǒ zuó wǎn kàn dào zhè yàng de guāng!", en:"I saw lights just like that last night!"}},
      {you:[
        {zh:"在哪里？", py:"zài nǎ lǐ?", en:"Where?", ok:true, reply:{zh:"在旧金山的金门大桥！", py:"zài jiù jīn shān de jīn mén dà qiáo!", en:"Over the Golden Gate Bridge in San Francisco!"}}]},
      {you:[
        {zh:"金门大桥是什么？", py:"jīn mén dà qiáo shì shén me?", en:"What's the Golden Gate Bridge?", ok:true, reply:{zh:"是一个很大的红桥！", py:"shì yí ge hěn dà de hóng qiáo!", en:"It's a great big red bridge!"}}]},
      {npc:{zh:"光很多，一闪一闪的！", py:"guāng hěn duō, yì shǎn yì shǎn de!", en:"There were lots of lights, twinkling on and off!"}},
      {you:[
        {zh:"是小星的家人吗？", py:"shì Xiǎo Xīng de jiā rén ma?", en:"Is it Little Star's family?", ok:true, reply:{zh:"可能是！去看看吧！", py:"kě néng shì! qù kàn kan ba!", en:"Maybe! Go and see!"}}]},
      {you:[
        {zh:"好的！我们去旧金山！", py:"hǎo de! wǒ men qù jiù jīn shān!", en:"OK! Let's go to San Francisco!", ok:true, reply:{zh:"好！路上小心！", py:"hǎo! lù shàng xiǎo xīn!", en:"Great! Be careful on the way!"}},
        {zh:"谢谢叔叔！", py:"xiè xie shū shu!", en:"Thank you, sir!", ok:true, reply:{zh:"不客气！路上小心！", py:"bú kè qi! lù shàng xiǎo xīn!", en:"You're welcome! Be careful on the way!"}}]}
    ],
    end:{zh:"去旧金山，找金门大桥！", py:"qù jiù jīn shān, zhǎo jīn mén dà qiáo!", en:"Go to San Francisco and find the Golden Gate Bridge!"},
    reward:{orb:3, berry:1}
  },

  // ---------- chapter 6: a kite at the Golden Gate Bridge ----------
  story_6: {
    title:{en:"Little Star: The Kite and the Star", zh:"风筝和星星", py:"fēng zheng hé xīng xing"},
    who:{name:"Xiao Le", zh:"小乐", py:"Xiǎo Lè", role:"kid"},
    setting:"Wind whooshes across the Golden Gate Bridge. A kid is flying a bright red kite.",
    turns:[
      {npc:{zh:"你好！你看我的风筝！", py:"nǐ hǎo! nǐ kàn wǒ de fēng zheng!", en:"Hi! Look at my kite!"}},
      {you:[
        {zh:"我喜欢你的风筝！", py:"wǒ xǐ huan nǐ de fēng zheng!", en:"I like your kite!", ok:true, reply:{zh:"谢谢！我叫小乐。", py:"xiè xie! wǒ jiào Xiǎo Lè.", en:"Thanks! My name is Xiao Le."}},
        {zh:"哇！好漂亮！", py:"wā! hǎo piào liang!", en:"Wow! So pretty!", ok:true, reply:{zh:"谢谢！我叫小乐。", py:"xiè xie! wǒ jiào Xiǎo Lè.", en:"Thanks! My name is Xiao Le."}}]},
      {you:[
        {zh:"这是小星！", py:"zhè shì Xiǎo Xīng!", en:"This is Little Star!", ok:true, reply:{zh:"小星，你好！你好亮！", py:"Xiǎo Xīng, nǐ hǎo! nǐ hǎo liàng!", en:"Hi, Little Star! You're so bright!"}}]},
      {npc:{zh:"昨晚我看到大星星！", py:"zuó wǎn wǒ kàn dào dà xīng xing!", en:"Last night I saw a big star!"}},
      {npc:{zh:"它会飞，飞过了大桥！", py:"tā huì fēi, fēi guò le dà qiáo!", en:"It could fly! It flew right over the bridge!"}},
      {you:[
        {zh:"它去哪里了？", py:"tā qù nǎ lǐ le?", en:"Where did it go?", ok:true, reply:{zh:"它飞去大山那边了。", py:"tā fēi qù dà shān nà biān le.", en:"It flew off toward the big mountains."}}]},
      {you:[
        {zh:"什么山？", py:"shén me shān?", en:"Which mountains?", ok:true, reply:{zh:"优胜美地的大山！", py:"yōu shèng měi dì de dà shān!", en:"The big mountains of Yosemite!"}}]},
      {npc:{zh:"快看！小星好开心！", py:"kuài kàn! Xiǎo Xīng hǎo kāi xīn!", en:"Look! Little Star is so happy!"}},
      {you:[
        {zh:"是小星的妈妈吗？", py:"shì Xiǎo Xīng de mā ma ma?", en:"Is it Little Star's mom?", ok:true, reply:{zh:"可能是！你们快去吧！", py:"kě néng shì! nǐ men kuài qù ba!", en:"Maybe! Hurry and go!"}}]},
      {you:[
        {zh:"谢谢你，小乐！", py:"xiè xie nǐ, Xiǎo Lè!", en:"Thank you, Xiao Le!", ok:true, reply:{zh:"不客气！再见，小星！", py:"bú kè qi! zài jiàn, Xiǎo Xīng!", en:"You're welcome! Bye, Little Star!"}},
        {zh:"我们走吧！", py:"wǒ men zǒu ba!", en:"Let's go!", ok:true, reply:{zh:"好！再见，小星！", py:"hǎo! zài jiàn, Xiǎo Xīng!", en:"OK! Bye, Little Star!"}}]}
    ],
    end:{zh:"去优胜美地吧！加油！", py:"qù yōu shèng měi dì ba! jiā yóu!", en:"Go to Yosemite! You can do it!"},
    reward:{orb:4}
  },

  // ---------- chapter 7: the sky opens at Half Dome ----------
  story_7: {
    title:{en:"Little Star: The Sky Opens", zh:"星幕打开了", py:"xīng mù dǎ kāi le"},
    who:{name:"Ranger Gao", zh:"高叔叔", py:"Gāo shū shu", role:"ranger"},
    setting:"Night in Yosemite. Under the giant rock called Half Dome, the sky is full of stars. Ranger Gao is here too!",
    turns:[
      {npc:{zh:"你好！又见面了！", py:"nǐ hǎo! yòu jiàn miàn le!", en:"Hello! We meet again!"}},
      {you:[
        {zh:"高叔叔，你好！", py:"Gāo shū shu, nǐ hǎo!", en:"Hi, Ranger Gao!", ok:true, reply:{zh:"你看，这是半穹顶。", py:"nǐ kàn, zhè shì bàn qióng dǐng.", en:"Look, this is Half Dome."}}]},
      {you:[
        {zh:"哇！好多星星！", py:"wā! hǎo duō xīng xing!", en:"Wow! So many stars!", ok:true, reply:{zh:"今晚的星星最亮！", py:"jīn wǎn de xīng xing zuì liàng!", en:"The stars are brightest tonight!"}},
        {zh:"哇！好大的山！", py:"wā! hǎo dà de shān!", en:"Wow! What a big mountain!", ok:true, reply:{zh:"对！今晚的星星也最亮！", py:"duì! jīn wǎn de xīng xing yě zuì liàng!", en:"Yes! And the stars are brightest tonight!"}}]},
      {npc:{zh:"你有星星碎片吗？", py:"nǐ yǒu xīng xing suì piàn ma?", en:"Do you have the star pieces?"}},
      {you:[
        {zh:"有！我有三个！", py:"yǒu! wǒ yǒu sān ge!", en:"Yes! I have three!", ok:true, reply:{zh:"好！我们举起来！", py:"hǎo! wǒ men jǔ qǐ lái!", en:"Great! Let's hold them up high!"}}]},
      {you:[
        {zh:"一、二、三！", py:"yī, èr, sān!", en:"One, two, three!", ok:true, reply:{zh:"快看！天开了！", py:"kuài kàn! tiān kāi le!", en:"Look! The sky is opening!"}}]},
      {npc:{zh:"这是星幕！好漂亮！", py:"zhè shì xīng mù! hǎo piào liang!", en:"It's the Starveil! So beautiful!"}},
      {you:[
        {zh:"我不怕！", py:"wǒ bú pà!", en:"I'm not scared!", ok:true, reply:{zh:"你真勇敢！小星也不怕！", py:"nǐ zhēn yǒng gǎn! Xiǎo Xīng yě bú pà!", en:"You're so brave! Little Star isn't scared either!"}},
        {zh:"我有点儿怕。", py:"wǒ yǒu diǎnr pà.", en:"I'm a little scared.", ok:true, reply:{zh:"别怕。小星在你身边。", py:"bié pà. Xiǎo Xīng zài nǐ shēn biān.", en:"Don't be scared. Little Star is right beside you."}}]},
      {you:[
        {zh:"小星，我们走吧！", py:"Xiǎo Xīng, wǒ men zǒu ba!", en:"Little Star, let's go!", ok:true, reply:{zh:"好！我在这里等你。", py:"hǎo! wǒ zài zhè lǐ děng nǐ.", en:"OK! I'll wait for you right here."}}]}
    ],
    end:{zh:"走进星幕吧！加油！", py:"zǒu jìn xīng mù ba! jiā yóu!", en:"Step into the Starveil! You can do it!"},
    reward:{great:2}
  },

  // ---------- chapter 8: home at last ----------
  story_8: {
    title:{en:"Little Star: Home at Last", zh:"回家了", py:"huí jiā le"},
    who:{name:"Star Mother", zh:"星星妈妈", py:"xīng xing mā ma", role:"star"},
    setting:"Inside the Starveil, soft light glows everywhere. A great, gentle star floats down, and Little Star zooms to her.",
    turns:[
      {npc:{zh:"小星！我的宝宝！", py:"Xiǎo Xīng! wǒ de bǎo bao!", en:"Little Star! My baby!"}},
      {npc:{zh:"小星说：妈妈！妈妈！", py:"Xiǎo Xīng shuō: mā ma! mā ma!", en:"Little Star says: Mommy! Mommy!"}},
      {you:[
        {zh:"你是小星的妈妈吗？", py:"nǐ shì Xiǎo Xīng de mā ma ma?", en:"Are you Little Star's mom?", ok:true, reply:{zh:"是的。我是星星妈妈。", py:"shì de. wǒ shì xīng xing mā ma.", en:"Yes. I am the Star Mother."}}]},
      {npc:{zh:"谢谢你，小朋友。你带小星回家了。", py:"xiè xie nǐ, xiǎo péng you. nǐ dài Xiǎo Xīng huí jiā le.", en:"Thank you, little friend. You brought Little Star home."}},
      {you:[
        {zh:"不客气！", py:"bú kè qi!", en:"You're welcome!", ok:true, reply:{zh:"你真好，真勇敢。", py:"nǐ zhēn hǎo, zhēn yǒng gǎn.", en:"You are so kind, and so brave."}},
        {zh:"我们是好朋友！", py:"wǒ men shì hǎo péng you!", en:"We're good friends!", ok:true, reply:{zh:"是的。你真好，真勇敢。", py:"shì de. nǐ zhēn hǎo, zhēn yǒng gǎn.", en:"Yes. You are so kind, and so brave."}}]},
      {npc:{zh:"这是给你的礼物。", py:"zhè shì gěi nǐ de lǐ wù.", en:"This is a gift for you."}},
      {you:[
        {zh:"谢谢！好漂亮！", py:"xiè xie! hǎo piào liang!", en:"Thank you! It's so pretty!", ok:true, reply:{zh:"里面有星光哦。", py:"lǐ miàn yǒu xīng guāng o.", en:"There's starlight inside."}}]},
      {you:[
        {zh:"小星，我会想你的。", py:"Xiǎo Xīng, wǒ huì xiǎng nǐ de.", en:"Little Star, I'll miss you.", ok:true, reply:{zh:"小星说：我也想你！", py:"Xiǎo Xīng shuō: wǒ yě xiǎng nǐ!", en:"Little Star says: I'll miss you too!"}}]},
      {you:[
        {zh:"你会来看我吗？", py:"nǐ huì lái kàn wǒ ma?", en:"Will you come and visit me?", ok:true, reply:{zh:"小星说：我会来看你！", py:"Xiǎo Xīng shuō: wǒ huì lái kàn nǐ!", en:"Little Star says: I'll come and visit you!"}}]},
      {npc:{zh:"回家吧。晚上看看天，小星在那里。", py:"huí jiā ba. wǎn shang kàn kan tiān, Xiǎo Xīng zài nà lǐ.", en:"Go home now. At night, look up at the sky. Little Star will be there."}},
      {you:[
        {zh:"小星，再见！", py:"Xiǎo Xīng, zài jiàn!", en:"Bye, Little Star!", ok:true, reply:{zh:"小星飞了一圈，亮亮的！", py:"Xiǎo Xīng fēi le yì quān, liàng liàng de!", en:"Little Star does a sparkly loop in the air!"}},
        {zh:"再见！我爱你！", py:"zài jiàn! wǒ ài nǐ!", en:"Goodbye! I love you!", ok:true, reply:{zh:"小星说：我也爱你！", py:"Xiǎo Xīng shuō: wǒ yě ài nǐ!", en:"Little Star says: I love you too!"}}]}
    ],
    end:{zh:"谢谢你！再见！我们是好朋友。", py:"xiè xie nǐ! zài jiàn! wǒ men shì hǎo péng you.", en:"Thank you! Goodbye! We are good friends."},
    reward:{ultra:3, great:3}
  },

  // ---------- chapter 9: Grandma is proud ----------
  story_9: {
    title:{en:"Little Star: Grandma Is Proud", zh:"奶奶为你骄傲", py:"nǎi nai wèi nǐ jiāo ào"},
    who:{name:"Grandma", zh:"奶奶", py:"nǎi nai", role:"phone"},
    setting:"Your phone rings. It's Grandma, and she wants to hear everything!",
    turns:[
      {npc:{zh:"喂？宝贝！小星回家了吗？", py:"wèi? bǎo bèi! Xiǎo Xīng huí jiā le ma?", en:"Hello? Sweetie! Did Little Star get home?"}},
      {you:[
        {zh:"小星回家了！", py:"Xiǎo Xīng huí jiā le!", en:"Little Star went home!", ok:true, reply:{zh:"太棒了！奶奶好开心！", py:"tài bàng le! nǎi nai hǎo kāi xīn!", en:"Awesome! Grandma is so happy!"}}]},
      {you:[
        {zh:"我见到星星妈妈了！", py:"wǒ jiàn dào xīng xing mā ma le!", en:"I met the Star Mother!", ok:true, reply:{zh:"哇！你真勇敢！", py:"wā! nǐ zhēn yǒng gǎn!", en:"Wow! You're so brave!"}}]},
      {npc:{zh:"奶奶为你骄傲！", py:"nǎi nai wèi nǐ jiāo ào!", en:"Grandma is so proud of you!"}},
      {you:[
        {zh:"谢谢奶奶！", py:"xiè xie nǎi nai!", en:"Thank you, Grandma!", ok:true, reply:{zh:"你想小星吗？", py:"nǐ xiǎng Xiǎo Xīng ma?", en:"Do you miss Little Star?"}}]},
      {you:[
        {zh:"想！晚上我看星星。", py:"xiǎng! wǎn shang wǒ kàn xīng xing.", en:"Yes! At night I look at the stars.", ok:true, reply:{zh:"小星也在看你！", py:"Xiǎo Xīng yě zài kàn nǐ!", en:"Little Star is looking at you too!"}},
        {zh:"我很想它！", py:"wǒ hěn xiǎng tā!", en:"I miss it a lot!", ok:true, reply:{zh:"看看天上，小星也在看你！", py:"kàn kan tiān shàng, Xiǎo Xīng yě zài kàn nǐ!", en:"Look up at the sky. Little Star is looking at you too!"}}]}
    ],
    end:{zh:"奶奶爱你！晚安，宝贝！", py:"nǎi nai ài nǐ! wǎn ān, bǎo bèi!", en:"Grandma loves you! Good night, sweetie!"},
    reward:{great:1, berry:2}
  }

});
