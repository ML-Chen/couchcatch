// Couchcatch conversations: everyday Mandarin, spoken out loud, with gentle recasts (see runTalk in speak.js).
// Child lines stay short and reuse the same core phrases; NPCs may call her 小朋友 but she never says a name.
window.DIALOGUES = window.DIALOGUES || {};
Object.assign(window.DIALOGUES, {

  // ---------- day one ----------
  intro_neighbor: {
    title:{en:"Hello, Neighbor!", zh:"你好，邻居！", py:"nǐ hǎo, lín jū!"},
    who:{name:"Auntie Wang", zh:"王阿姨", py:"Wáng ā yí", role:"neighbor"},
    setting:"On your very first day, the friendly neighbor leans over the fence to say hello.",
    turns:[
      {npc:{zh:"你好，小朋友！", py:"nǐ hǎo, xiǎo péng you!", en:"Hello, little friend!"}},
      {you:[
        {zh:"你好！", py:"nǐ hǎo!", en:"Hello!", ok:true, reply:{zh:"你好吗？", py:"nǐ hǎo ma?", en:"How are you?"}},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false},
        {zh:"谢谢！", py:"xiè xie!", en:"Thank you!", ok:false}]},
      {you:[
        {zh:"我很好！你呢？", py:"wǒ hěn hǎo! nǐ ne?", en:"I'm great! And you?", ok:true, reply:{zh:"我也很好！", py:"wǒ yě hěn hǎo!", en:"I'm great too!"}},
        {zh:"我好很！", py:"wǒ hǎo hěn!", en:"(mixed-up order) I good very!", ok:false},
        {zh:"我饿了。", py:"wǒ è le.", en:"I'm hungry.", ok:false}]},
      {npc:{zh:"你几岁？", py:"nǐ jǐ suì?", en:"How old are you?"}},
      {you:[
        {zh:"我十岁。", py:"wǒ shí suì.", en:"I'm ten.", ok:true, reply:{zh:"十岁！真棒！", py:"shí suì! zhēn bàng!", en:"Ten! Wonderful!"}},
        {zh:"我十岁。", py:"wǒ shí suì.", en:"I'm ten.", ok:false},
        {zh:"我很好！", py:"wǒ hěn hǎo!", en:"I'm great!", ok:false}]},
      {npc:{zh:"你喜欢小动物吗？", py:"nǐ xǐ huan xiǎo dòng wù ma?", en:"Do you like little creatures?"}},
      {you:[
        {zh:"我喜欢！", py:"wǒ xǐ huan!", en:"I like them!", ok:true, reply:{zh:"太好了！", py:"tài hǎo le!", en:"Great!"}},
        {zh:"我不喜欢。", py:"wǒ bù xǐ huan.", en:"I don't like them.", ok:false},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want it.", ok:false}]},
      {npc:{zh:"在家玩，小动物会来找你！", py:"zài jiā wán, xiǎo dòng wù huì lái zhǎo nǐ!", en:"Stay home and play, and little creatures will come find you!"}},
      {you:[
        {zh:"真的吗？", py:"zhēn de ma?", en:"Really?", ok:true, reply:{zh:"真的！快看！", py:"zhēn de! kuài kàn!", en:"Really! Look!"}},
        {zh:"不是。", py:"bú shì.", en:"No, it isn't.", ok:false},
        {zh:"在哪里？", py:"zài nǎ lǐ?", en:"Where is it?", ok:false}]}
    ],
    end:{zh:"欢迎！我们是邻居了！", py:"huān yíng! wǒ men shì lín jū le!", en:"Welcome! We're neighbors now!"},
    reward:{orb:5}
  },

  // ---------- gym leaders (home region) ----------
  gym_backyard: {
    title:{en:"Weekend Plans", zh:"周末", py:"zhōu mò"},
    who:{name:"Coach Mira", zh:"米拉教练", py:"Mǐ lā jiào liàn", role:"gym leader"},
    setting:"Coach Mira bounces a ball in the backyard gym and asks about your weekend.",
    turns:[
      {npc:{zh:"你好！我是米拉教练！", py:"nǐ hǎo! wǒ shì Mǐ lā jiào liàn!", en:"Hi! I'm Coach Mira!"}},
      {you:[
        {zh:"你好，教练！", py:"nǐ hǎo, jiào liàn!", en:"Hi, Coach!", ok:true, reply:{zh:"今天是周末！", py:"jīn tiān shì zhōu mò!", en:"Today is the weekend!"}},
        {zh:"再见，教练！", py:"zài jiàn, jiào liàn!", en:"Bye, Coach!", ok:false},
        {zh:"对不起。", py:"duì bu qǐ.", en:"I'm sorry.", ok:false}]},
      {npc:{zh:"周末你喜欢做什么？", py:"zhōu mò nǐ xǐ huan zuò shén me?", en:"What do you like to do on weekends?"}},
      {you:[
        {zh:"我喜欢玩！", py:"wǒ xǐ huan wán!", en:"I like to play!", ok:true, reply:{zh:"我也是！", py:"wǒ yě shì!", en:"Me too!"}},
        {zh:"我喜欢画画。", py:"wǒ xǐ huan huà huà.", en:"I like to draw.", ok:true, reply:{zh:"画画很好！", py:"huà huà hěn hǎo!", en:"Drawing is great!"}},
        {zh:"我不喜欢。", py:"wǒ bù xǐ huan.", en:"I don't like it.", ok:false}]},
      {npc:{zh:"周末你在家吗？", py:"zhōu mò nǐ zài jiā ma?", en:"Are you home on weekends?"}},
      {you:[
        {zh:"我在家。", py:"wǒ zài jiā.", en:"I'm at home.", ok:true, reply:{zh:"在家真好！", py:"zài jiā zhēn hǎo!", en:"Home is the best!"}},
        {zh:"我不在家。", py:"wǒ bú zài jiā.", en:"I'm not at home.", ok:false},
        {zh:"在哪里？", py:"zài nǎ lǐ?", en:"Where is it?", ok:false}]},
      {npc:{zh:"现在我们比赛，好吗？", py:"xiàn zài wǒ men bǐ sài, hǎo ma?", en:"Shall we have our match now?"}},
      {you:[
        {zh:"好的！我们开始吧！", py:"hǎo de! wǒ men kāi shǐ ba!", en:"OK! Let's start!", ok:true, reply:{zh:"加油！", py:"jiā yóu!", en:"Go for it!"}},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want to.", ok:false},
        {zh:"我累了。", py:"wǒ lèi le.", en:"I'm tired.", ok:false}]}
    ],
    end:{zh:"来吧！", py:"lái ba!", en:"Here we go!"}
  },

  gym_lakeshore: {
    title:{en:"Lake Weather", zh:"天气", py:"tiān qì"},
    who:{name:"Captain Oro", zh:"奥罗船长", py:"Ào luó chuán zhǎng", role:"gym leader"},
    setting:"Captain Oro squints up at the sky from the dock by the lake.",
    turns:[
      {npc:{zh:"你好！今天天气很好！", py:"nǐ hǎo! jīn tiān tiān qì hěn hǎo!", en:"Hello! The weather is lovely today!"}},
      {you:[
        {zh:"今天很热。", py:"jīn tiān hěn rè.", en:"It's hot today.", ok:true, reply:{zh:"对！太阳很大！", py:"duì! tài yáng hěn dà!", en:"Yes! The sun is strong!"}},
        {zh:"今天很冷。", py:"jīn tiān hěn lěng.", en:"It's cold today.", ok:false},
        {zh:"我很开心！", py:"wǒ hěn kāi xīn!", en:"I'm so happy!", ok:false}]},
      {npc:{zh:"你喜欢晴天吗？", py:"nǐ xǐ huan qíng tiān ma?", en:"Do you like sunny days?"}},
      {you:[
        {zh:"我喜欢晴天！", py:"wǒ xǐ huan qíng tiān!", en:"I like sunny days!", ok:true, reply:{zh:"我也喜欢！", py:"wǒ yě xǐ huan!", en:"I like them too!"}},
        {zh:"我喜欢下雨。", py:"wǒ xǐ huan xià yǔ.", en:"I like rain.", ok:false},
        {zh:"我不知道。", py:"wǒ bù zhī dào.", en:"I don't know.", ok:false}]},
      {npc:{zh:"你热吗？要喝水吗？", py:"nǐ rè ma? yào hē shuǐ ma?", en:"Are you hot? Want some water?"}},
      {you:[
        {zh:"我要水，谢谢！", py:"wǒ yào shuǐ, xiè xie!", en:"Water, please! Thanks!", ok:true, reply:{zh:"给你！", py:"gěi nǐ!", en:"Here you go!"}},
        {zh:"我不要水。", py:"wǒ bú yào shuǐ.", en:"I don't want water.", ok:false},
        {zh:"我饿了。", py:"wǒ è le.", en:"I'm hungry.", ok:false}]},
      {npc:{zh:"喝好了吗？我们比赛吧！", py:"hē hǎo le ma? wǒ men bǐ sài ba!", en:"All done? Let's battle!"}},
      {you:[
        {zh:"加油！", py:"jiā yóu!", en:"Let's go!", ok:true, reply:{zh:"好！上船吧！", py:"hǎo! shàng chuán ba!", en:"Great! All aboard!"}},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false},
        {zh:"等一下。", py:"děng yí xià.", en:"Wait a moment.", ok:false}]}
    ],
    end:{zh:"风来了，开始吧！", py:"fēng lái le, kāi shǐ ba!", en:"Here comes the wind. Let's begin!"}
  },

  gym_quarry: {
    title:{en:"What Time Is It?", zh:"现在几点？", py:"xiàn zài jǐ diǎn?"},
    who:{name:"Foreman Bex", zh:"贝克斯", py:"Bèi kè sī", role:"gym leader"},
    setting:"Foreman Bex taps a big, dusty clock at the old quarry.",
    turns:[
      {npc:{zh:"嘿，小朋友！你好！", py:"hēi, xiǎo péng you! nǐ hǎo!", en:"Hey there, little friend! Hello!"}},
      {you:[
        {zh:"你好！", py:"nǐ hǎo!", en:"Hello!", ok:true, reply:{zh:"哎呀，我的钟坏了！", py:"āi yā, wǒ de zhōng huài le!", en:"Oh no, my clock is broken!"}},
        {zh:"晚安！", py:"wǎn ān!", en:"Good night!", ok:false},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false}]},
      {you:[
        {zh:"现在几点？", py:"xiàn zài jǐ diǎn?", en:"What time is it now?", ok:true, reply:{zh:"我看看……三点！", py:"wǒ kàn kan… sān diǎn!", en:"Let me see... three o'clock!"}},
        {zh:"现在多少点？", py:"xiàn zài duō shao diǎn?", en:"(mixed-up word) Now how-much o'clock?", ok:false},
        {zh:"你几岁？", py:"nǐ jǐ suì?", en:"How old are you?", ok:false}]},
      {npc:{zh:"三点了！你饿了吗？", py:"sān diǎn le! nǐ è le ma?", en:"Three already! Are you hungry?"}},
      {you:[
        {zh:"我饿了。", py:"wǒ è le.", en:"I'm hungry.", ok:true, reply:{zh:"吃个苹果吧！", py:"chī ge píng guǒ ba!", en:"Have an apple!"}},
        {zh:"我饿了吗？", py:"wǒ è le ma?", en:"Am I hungry?", ok:false},
        {zh:"我很好！", py:"wǒ hěn hǎo!", en:"I'm great!", ok:false}]},
      {npc:{zh:"几点比赛？现在！", py:"jǐ diǎn bǐ sài? xiàn zài!", en:"What time is our battle? Right now!"}},
      {you:[
        {zh:"我准备好了！", py:"wǒ zhǔn bèi hǎo le!", en:"I'm ready!", ok:true, reply:{zh:"太好了！", py:"tài hǎo le!", en:"Great!"}},
        {zh:"明天见！", py:"míng tiān jiàn!", en:"See you tomorrow!", ok:false},
        {zh:"我不知道。", py:"wǒ bù zhī dào.", en:"I don't know.", ok:false}]}
    ],
    end:{zh:"三、二、一，开始！", py:"sān, èr, yī, kāi shǐ!", en:"Three, two, one, go!"}
  },

  gym_pineridge: {
    title:{en:"Bundle Up!", zh:"穿暖和", py:"chuān nuǎn huo"},
    who:{name:"Ranger Tull", zh:"塔尔", py:"Tǎ ěr", role:"gym leader"},
    setting:"Ranger Tull stamps the snow off his boots among the tall pines.",
    turns:[
      {npc:{zh:"哇，这里好冷！", py:"wā, zhè lǐ hǎo lěng!", en:"Brr, it's so cold here!"}},
      {you:[
        {zh:"好冷！", py:"hǎo lěng!", en:"So cold!", ok:true, reply:{zh:"你冷吗？", py:"nǐ lěng ma?", en:"Are you cold?"}},
        {zh:"好热！", py:"hǎo rè!", en:"So hot!", ok:false},
        {zh:"好吃！", py:"hǎo chī!", en:"Yummy!", ok:false}]},
      {you:[
        {zh:"我很冷。", py:"wǒ hěn lěng.", en:"I'm really cold.", ok:true, reply:{zh:"穿上外套吧！", py:"chuān shàng wài tào ba!", en:"Put on your coat!"}},
        {zh:"我不冷。", py:"wǒ bù lěng.", en:"I'm not cold.", ok:false},
        {zh:"我很热。", py:"wǒ hěn rè.", en:"I'm really hot.", ok:false}]},
      {npc:{zh:"你有帽子吗？", py:"nǐ yǒu mào zi ma?", en:"Do you have a hat?"}},
      {you:[
        {zh:"我有帽子！", py:"wǒ yǒu mào zi!", en:"I have a hat!", ok:true, reply:{zh:"戴上吧！好看！", py:"dài shàng ba! hǎo kàn!", en:"Put it on! It looks great!"}},
        {zh:"我不有帽子。", py:"wǒ bù yǒu mào zi.", en:"(mixed-up word) I not-have a hat.", ok:false},
        {zh:"我没有帽子。", py:"wǒ méi yǒu mào zi.", en:"I don't have a hat.", ok:false}]},
      {npc:{zh:"暖和了吗？比赛吧！", py:"nuǎn huo le ma? bǐ sài ba!", en:"Warm now? Let's battle!"}},
      {you:[
        {zh:"暖和了！加油！", py:"nuǎn huo le! jiā yóu!", en:"I'm warm! Let's go!", ok:true, reply:{zh:"好！不怕冷！", py:"hǎo! bú pà lěng!", en:"Great! We're not scared of the cold!"}},
        {zh:"我累了。", py:"wǒ lèi le.", en:"I'm tired.", ok:false},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false}]}
    ],
    end:{zh:"松树也在看你！", py:"sōng shù yě zài kàn nǐ!", en:"Even the pine trees are watching you!"}
  },

  gym_stormpier: {
    title:{en:"Rainy Pier", zh:"下雨了", py:"xià yǔ le"},
    who:{name:"Ines Volta", zh:"伊内丝", py:"Yī nèi sī", role:"gym leader"},
    setting:"Thunder rumbles over the stormy pier as Ines Volta twirls a sparkly umbrella.",
    turns:[
      {npc:{zh:"你好！下雨了！", py:"nǐ hǎo! xià yǔ le!", en:"Hi! It's raining!"}},
      {you:[
        {zh:"哎呀，下雨了！", py:"āi yā, xià yǔ le!", en:"Oh no, it's raining!", ok:true, reply:{zh:"你有伞吗？", py:"nǐ yǒu sǎn ma?", en:"Do you have an umbrella?"}},
        {zh:"今天很热。", py:"jīn tiān hěn rè.", en:"It's hot today.", ok:false},
        {zh:"好吃！", py:"hǎo chī!", en:"Yummy!", ok:false}]},
      {you:[
        {zh:"我没有伞。", py:"wǒ méi yǒu sǎn.", en:"I don't have an umbrella.", ok:true, reply:{zh:"没关系，给你！", py:"méi guān xi, gěi nǐ!", en:"No problem, here you go!"}},
        {zh:"我不有伞。", py:"wǒ bù yǒu sǎn.", en:"(mixed-up word) I not-have an umbrella.", ok:false},
        {zh:"我有伞。", py:"wǒ yǒu sǎn.", en:"I have an umbrella.", ok:false}]},
      {you:[
        {zh:"谢谢！", py:"xiè xie!", en:"Thank you!", ok:true, reply:{zh:"不客气！", py:"bú kè qi!", en:"You're welcome!"}},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false},
        {zh:"对不起。", py:"duì bu qǐ.", en:"I'm sorry.", ok:false}]},
      {npc:{zh:"你喜欢下雨吗？", py:"nǐ xǐ huan xià yǔ ma?", en:"Do you like rain?"}},
      {you:[
        {zh:"我喜欢下雨！", py:"wǒ xǐ huan xià yǔ!", en:"I like rain!", ok:true, reply:{zh:"我也喜欢！还有闪电！", py:"wǒ yě xǐ huan! hái yǒu shǎn diàn!", en:"Me too! And lightning!"}},
        {zh:"我不喜欢下雨。", py:"wǒ bù xǐ huan xià yǔ.", en:"I don't like rain.", ok:true, reply:{zh:"没关系，我们有伞！", py:"méi guān xi, wǒ men yǒu sǎn!", en:"That's OK, we have umbrellas!"}},
        {zh:"我渴了。", py:"wǒ kě le.", en:"I'm thirsty.", ok:false}]},
      {npc:{zh:"打雷了！我们比赛吧！", py:"dǎ léi le! wǒ men bǐ sài ba!", en:"Thunder! Let's battle!"}},
      {you:[
        {zh:"我们开始吧！", py:"wǒ men kāi shǐ ba!", en:"Let's start!", ok:true, reply:{zh:"好！闪电来了！", py:"hǎo! shǎn diàn lái le!", en:"OK! Here comes the lightning!"}},
        {zh:"我有点儿怕。", py:"wǒ yǒu diǎnr pà.", en:"I'm a little scared.", ok:false},
        {zh:"我要回家。", py:"wǒ yào huí jiā.", en:"I want to go home.", ok:false}]}
    ],
    end:{zh:"加油，小朋友！", py:"jiā yóu, xiǎo péng you!", en:"Do your best, little friend!"}
  },

  gym_ashhills: {
    title:{en:"Spicy Snacks", zh:"辣不辣？", py:"là bu là?"},
    who:{name:"Warden Kael", zh:"凯尔", py:"Kǎi ěr", role:"gym leader"},
    setting:"Warden Kael is roasting red peppers on a warm rock in the ash hills.",
    turns:[
      {npc:{zh:"你好！你饿了吗？", py:"nǐ hǎo! nǐ è le ma?", en:"Hi! Are you hungry?"}},
      {you:[
        {zh:"我饿了。", py:"wǒ è le.", en:"I'm hungry.", ok:true, reply:{zh:"吃个辣椒吧！", py:"chī ge là jiāo ba!", en:"Have a pepper!"}},
        {zh:"我渴了。", py:"wǒ kě le.", en:"I'm thirsty.", ok:false},
        {zh:"我饱了。", py:"wǒ bǎo le.", en:"I'm full.", ok:false}]},
      {npc:{zh:"辣不辣？你试试！", py:"là bu là? nǐ shì shi!", en:"Is it spicy? Give it a try!"}},
      {you:[
        {zh:"太辣了！", py:"tài là le!", en:"It's too spicy!", ok:true, reply:{zh:"哈哈！快喝水！", py:"hā hā! kuài hē shuǐ!", en:"Ha ha! Quick, drink some water!"}},
        {zh:"不辣。", py:"bú là.", en:"It's not spicy.", ok:false},
        {zh:"好冷！", py:"hǎo lěng!", en:"So cold!", ok:false}]},
      {you:[
        {zh:"我渴了！", py:"wǒ kě le!", en:"I'm thirsty!", ok:true, reply:{zh:"给你水！", py:"gěi nǐ shuǐ!", en:"Here's some water!"}},
        {zh:"我饿了。", py:"wǒ è le.", en:"I'm hungry.", ok:false},
        {zh:"我还要辣椒。", py:"wǒ hái yào là jiāo.", en:"I want more peppers.", ok:false}]},
      {npc:{zh:"好了吗？我们比赛吧！", py:"hǎo le ma? wǒ men bǐ sài ba!", en:"Feeling better? Let's battle!"}},
      {you:[
        {zh:"好的！加油！", py:"hǎo de! jiā yóu!", en:"OK! Let's go!", ok:true, reply:{zh:"来吧！火来了！", py:"lái ba! huǒ lái le!", en:"Come on! Here comes the fire!"}},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want to.", ok:false},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false}]}
    ],
    end:{zh:"你很勇敢！", py:"nǐ hěn yǒng gǎn!", en:"You're very brave!"}
  },

  // ---------- TV interviews after each badge ----------
  interview_1: {
    title:{en:"Champion Interview: How Do You Feel?", zh:"冠军采访", py:"guàn jūn cǎi fǎng"},
    who:{name:"TV Host", zh:"主持人", py:"zhǔ chí rén", role:"host"},
    setting:"Bright lights! The host of a kids' TV show rushes up with a microphone.",
    turns:[
      {npc:{zh:"大家好！今天有小冠军！", py:"dà jiā hǎo! jīn tiān yǒu xiǎo guàn jūn!", en:"Hello, everyone! We have a little champion today!"}},
      {you:[
        {zh:"大家好！", py:"dà jiā hǎo!", en:"Hi, everyone!", ok:true, reply:{zh:"你赢了！你开心吗？", py:"nǐ yíng le! nǐ kāi xīn ma?", en:"You won! Are you happy?"}},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false},
        {zh:"谢谢！", py:"xiè xie!", en:"Thank you!", ok:false}]},
      {you:[
        {zh:"我很开心！", py:"wǒ hěn kāi xīn!", en:"I'm so happy!", ok:true, reply:{zh:"太棒了！", py:"tài bàng le!", en:"Awesome!"}},
        {zh:"我很累。", py:"wǒ hěn lèi.", en:"I'm very tired.", ok:false},
        {zh:"我有点儿怕。", py:"wǒ yǒu diǎnr pà.", en:"I'm a little scared.", ok:false}]},
      {npc:{zh:"比赛难吗？", py:"bǐ sài nán ma?", en:"Was the battle hard?"}},
      {you:[
        {zh:"有点儿难。", py:"yǒu diǎnr nán.", en:"A little hard.", ok:true, reply:{zh:"可是你赢了！", py:"kě shì nǐ yíng le!", en:"But you won!"}},
        {zh:"不难！", py:"bù nán!", en:"Not hard!", ok:true, reply:{zh:"哇，你真厉害！", py:"wā, nǐ zhēn lì hai!", en:"Wow, you're amazing!"}},
        {zh:"好吃！", py:"hǎo chī!", en:"Yummy!", ok:false}]},
      {npc:{zh:"你想说什么？", py:"nǐ xiǎng shuō shén me?", en:"Is there anything you want to say?"}},
      {you:[
        {zh:"谢谢大家！", py:"xiè xie dà jiā!", en:"Thank you, everyone!", ok:true, reply:{zh:"不客气！大家爱你！", py:"bú kè qi! dà jiā ài nǐ!", en:"You're welcome! Everyone loves you!"}},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false},
        {zh:"我饿了。", py:"wǒ è le.", en:"I'm hungry.", ok:false}]}
    ],
    end:{zh:"我们下次见！", py:"wǒ men xià cì jiàn!", en:"See you next time!"},
    reward:{orb:3}
  },

  interview_2: {
    title:{en:"Champion Interview: Favorite Food", zh:"你喜欢吃什么？", py:"nǐ xǐ huan chī shén me?"},
    who:{name:"TV Host", zh:"主持人", py:"zhǔ chí rén", role:"host"},
    setting:"The TV show host is back, waving a microphone and smiling.",
    turns:[
      {npc:{zh:"又见面了！你好吗？", py:"yòu jiàn miàn le! nǐ hǎo ma?", en:"We meet again! How are you?"}},
      {you:[
        {zh:"我很好！你呢？", py:"wǒ hěn hǎo! nǐ ne?", en:"I'm great! And you?", ok:true, reply:{zh:"我也很好！", py:"wǒ yě hěn hǎo!", en:"I'm great too!"}},
        {zh:"我很好吗？", py:"wǒ hěn hǎo ma?", en:"Am I great?", ok:false},
        {zh:"我十岁。", py:"wǒ shí suì.", en:"I'm ten.", ok:false}]},
      {npc:{zh:"你喜欢吃什么？", py:"nǐ xǐ huan chī shén me?", en:"What do you like to eat?"}},
      {you:[
        {zh:"我喜欢吃面条！", py:"wǒ xǐ huan chī miàn tiáo!", en:"I like noodles!", ok:true, reply:{zh:"我也喜欢面条！", py:"wǒ yě xǐ huan miàn tiáo!", en:"I like noodles too!"}},
        {zh:"我喜欢吃饺子！", py:"wǒ xǐ huan chī jiǎo zi!", en:"I like dumplings!", ok:true, reply:{zh:"饺子好吃！", py:"jiǎo zi hǎo chī!", en:"Dumplings are yummy!"}},
        {zh:"我不吃。", py:"wǒ bù chī.", en:"I don't eat.", ok:false}]},
      {npc:{zh:"你喜欢吃水果吗？", py:"nǐ xǐ huan chī shuǐ guǒ ma?", en:"Do you like fruit?"}},
      {you:[
        {zh:"我喜欢苹果！", py:"wǒ xǐ huan píng guǒ!", en:"I like apples!", ok:true, reply:{zh:"苹果很甜！", py:"píng guǒ hěn tián!", en:"Apples are sweet!"}},
        {zh:"我喜欢狗。", py:"wǒ xǐ huan gǒu.", en:"I like dogs.", ok:false},
        {zh:"我不喜欢。", py:"wǒ bù xǐ huan.", en:"I don't like it.", ok:false}]},
      {npc:{zh:"比赛完了，你饿吗？", py:"bǐ sài wán le, nǐ è ma?", en:"The battle's over. Are you hungry?"}},
      {you:[
        {zh:"我饿了！", py:"wǒ è le!", en:"I'm hungry!", ok:true, reply:{zh:"哈哈，快去吃饭吧！", py:"hā hā, kuài qù chī fàn ba!", en:"Ha ha, go eat, quick!"}},
        {zh:"我渴了。", py:"wǒ kě le.", en:"I'm thirsty.", ok:false},
        {zh:"我不饿。", py:"wǒ bú è.", en:"I'm not hungry.", ok:false}]}
    ],
    end:{zh:"大家，我们下次见！", py:"dà jiā, wǒ men xià cì jiàn!", en:"Everyone, see you next time!"},
    reward:{berry:1}
  },

  interview_3: {
    title:{en:"Champion Interview: Favorite Creature", zh:"你最喜欢哪个？", py:"nǐ zuì xǐ huan nǎ ge?"},
    who:{name:"TV Host", zh:"主持人", py:"zhǔ chí rén", role:"host"},
    setting:"The TV cameras zoom in on you and your creatures.",
    turns:[
      {npc:{zh:"大家好！小冠军又赢了！", py:"dà jiā hǎo! xiǎo guàn jūn yòu yíng le!", en:"Hello, everyone! The little champion won again!"}},
      {you:[
        {zh:"谢谢！", py:"xiè xie!", en:"Thank you!", ok:true, reply:{zh:"你最喜欢哪个？", py:"nǐ zuì xǐ huan nǎ ge?", en:"Which one is your favorite?"}},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false}]},
      {you:[
        {zh:"我喜欢这个！", py:"wǒ xǐ huan zhè ge!", en:"I like this one!", ok:true, reply:{zh:"哇，好可爱！", py:"wā, hǎo kě ài!", en:"Wow, so cute!"}},
        {zh:"我不喜欢。", py:"wǒ bù xǐ huan.", en:"I don't like it.", ok:false},
        {zh:"这是什么？", py:"zhè shì shén me?", en:"What is this?", ok:false}]},
      {npc:{zh:"它是什么颜色？", py:"tā shì shén me yán sè?", en:"What color is it?"}},
      {you:[
        {zh:"它是红色的！", py:"tā shì hóng sè de!", en:"It's red!", ok:true, reply:{zh:"红色真漂亮！", py:"hóng sè zhēn piào liang!", en:"Red is so pretty!"}},
        {zh:"它是蓝色的！", py:"tā shì lán sè de!", en:"It's blue!", ok:true, reply:{zh:"蓝色真漂亮！", py:"lán sè zhēn piào liang!", en:"Blue is so pretty!"}},
        {zh:"它很大。", py:"tā hěn dà.", en:"It's very big.", ok:false}]},
      {npc:{zh:"它喜欢吃什么？", py:"tā xǐ huan chī shén me?", en:"What does it like to eat?"}},
      {you:[
        {zh:"它喜欢吃果子！", py:"tā xǐ huan chī guǒ zi!", en:"It likes berries!", ok:true, reply:{zh:"哈哈，跟你一样！", py:"hā hā, gēn nǐ yí yàng!", en:"Ha ha, just like you!"}},
        {zh:"它饿了。", py:"tā è le.", en:"It's hungry.", ok:false},
        {zh:"我喜欢吃。", py:"wǒ xǐ huan chī.", en:"I like eating.", ok:false}]},
      {npc:{zh:"跟大家说再见吧！", py:"gēn dà jiā shuō zài jiàn ba!", en:"Say goodbye to everyone!"}},
      {you:[
        {zh:"再见！", py:"zài jiàn!", en:"Bye!", ok:true, reply:{zh:"再见，小冠军！", py:"zài jiàn, xiǎo guàn jūn!", en:"Bye, little champion!"}},
        {zh:"你好！", py:"nǐ hǎo!", en:"Hello!", ok:false},
        {zh:"谢谢！", py:"xiè xie!", en:"Thank you!", ok:false}]}
    ],
    end:{zh:"今天的节目到这里！", py:"jīn tiān de jié mù dào zhè lǐ!", en:"That's all for today's show!"},
    reward:{orb:3}
  },

  interview_4: {
    title:{en:"Champion Interview: Family", zh:"我爱我的家", py:"wǒ ài wǒ de jiā"},
    who:{name:"TV Host", zh:"主持人", py:"zhǔ chí rén", role:"host"},
    setting:"The TV host says your family might be watching at home right now!",
    turns:[
      {npc:{zh:"小冠军，你好！", py:"xiǎo guàn jūn, nǐ hǎo!", en:"Hello, little champion!"}},
      {you:[
        {zh:"你好！", py:"nǐ hǎo!", en:"Hello!", ok:true, reply:{zh:"你的家人在看吗？", py:"nǐ de jiā rén zài kàn ma?", en:"Is your family watching?"}},
        {zh:"晚安！", py:"wǎn ān!", en:"Good night!", ok:false},
        {zh:"对不起。", py:"duì bu qǐ.", en:"I'm sorry.", ok:false}]},
      {you:[
        {zh:"他们在看！", py:"tā men zài kàn!", en:"They're watching!", ok:true, reply:{zh:"太好了！", py:"tài hǎo le!", en:"Wonderful!"}},
        {zh:"在这里！", py:"zài zhè lǐ!", en:"Right here!", ok:false},
        {zh:"我在看。", py:"wǒ zài kàn.", en:"I'm watching.", ok:false}]},
      {npc:{zh:"跟家人说句话吧！", py:"gēn jiā rén shuō jù huà ba!", en:"Say something to your family!"}},
      {you:[
        {zh:"我爱你们！", py:"wǒ ài nǐ men!", en:"I love you all!", ok:true, reply:{zh:"好温暖！", py:"hǎo wēn nuǎn!", en:"How sweet!"}},
        {zh:"你们好！", py:"nǐ men hǎo!", en:"Hi, everybody!", ok:true, reply:{zh:"他们也说你好！", py:"tā men yě shuō nǐ hǎo!", en:"They're saying hi too!"}},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false}]},
      {npc:{zh:"你在家帮忙吗？", py:"nǐ zài jiā bāng máng ma?", en:"Do you help out at home?"}},
      {you:[
        {zh:"我帮忙！", py:"wǒ bāng máng!", en:"I help!", ok:true, reply:{zh:"真是好孩子！", py:"zhēn shì hǎo hái zi!", en:"What a good kid!"}},
        {zh:"我不帮。", py:"wǒ bù bāng.", en:"I don't help.", ok:false},
        {zh:"我累了。", py:"wǒ lèi le.", en:"I'm tired.", ok:false}]},
      {npc:{zh:"回家想吃什么？", py:"huí jiā xiǎng chī shén me?", en:"What do you want to eat at home?"}},
      {you:[
        {zh:"我想吃饺子！", py:"wǒ xiǎng chī jiǎo zi!", en:"I want dumplings!", ok:true, reply:{zh:"一家人一起吃，真好！", py:"yì jiā rén yì qǐ chī, zhēn hǎo!", en:"Eating together as a family is the best!"}},
        {zh:"我想睡觉。", py:"wǒ xiǎng shuì jiào.", en:"I want to sleep.", ok:false},
        {zh:"我想你。", py:"wǒ xiǎng nǐ.", en:"I miss you.", ok:false}]}
    ],
    end:{zh:"大家下次见！", py:"dà jiā xià cì jiàn!", en:"See you next time, everyone!"},
    reward:{orb:3}
  },

  interview_5: {
    title:{en:"Champion Interview: Hobbies", zh:"你喜欢做什么？", py:"nǐ xǐ huan zuò shén me?"},
    who:{name:"TV Host", zh:"主持人", py:"zhǔ chí rén", role:"host"},
    setting:"The TV host wants to know what the champion does for fun.",
    turns:[
      {npc:{zh:"欢迎回来，小冠军！", py:"huān yíng huí lái, xiǎo guàn jūn!", en:"Welcome back, little champion!"}},
      {you:[
        {zh:"谢谢！", py:"xiè xie!", en:"Thank you!", ok:true, reply:{zh:"你喜欢做什么？", py:"nǐ xǐ huan zuò shén me?", en:"What do you like to do?"}},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false}]},
      {you:[
        {zh:"我喜欢画画。", py:"wǒ xǐ huan huà huà.", en:"I like to draw.", ok:true, reply:{zh:"你画什么？", py:"nǐ huà shén me?", en:"What do you draw?"}},
        {zh:"我喜欢吃。", py:"wǒ xǐ huan chī.", en:"I like eating.", ok:false},
        {zh:"我不喜欢。", py:"wǒ bù xǐ huan.", en:"I don't like it.", ok:false}]},
      {you:[
        {zh:"我画小猫！", py:"wǒ huà xiǎo māo!", en:"I draw kittens!", ok:true, reply:{zh:"好可爱！", py:"hǎo kě ài!", en:"So cute!"}},
        {zh:"我喜欢猫。", py:"wǒ xǐ huan māo.", en:"I like cats.", ok:false},
        {zh:"我是小猫。", py:"wǒ shì xiǎo māo.", en:"I'm a kitten.", ok:false}]},
      {npc:{zh:"你也喜欢唱歌吗？", py:"nǐ yě xǐ huan chàng gē ma?", en:"Do you like singing too?"}},
      {you:[
        {zh:"喜欢！我们一起唱！", py:"xǐ huan! wǒ men yì qǐ chàng!", en:"Yes! Let's sing together!", ok:true, reply:{zh:"好！啦啦啦！", py:"hǎo! lā lā lā!", en:"OK! La la la!"}},
        {zh:"我累了。", py:"wǒ lèi le.", en:"I'm tired.", ok:false},
        {zh:"我们一起吃！", py:"wǒ men yì qǐ chī!", en:"Let's eat together!", ok:false}]}
    ],
    end:{zh:"唱得真好！下次见！", py:"chàng de zhēn hǎo! xià cì jiàn!", en:"Great singing! See you next time!"},
    reward:{orb:3}
  },

  interview_6: {
    title:{en:"Champion Interview: How Old Are You?", zh:"你几岁？", py:"nǐ jǐ suì?"},
    who:{name:"TV Host", zh:"主持人", py:"zhǔ chí rén", role:"host"},
    setting:"The studio audience cheers as you sit down in the big red chair.",
    turns:[
      {npc:{zh:"大家好！小冠军来了！", py:"dà jiā hǎo! xiǎo guàn jūn lái le!", en:"Hello, everyone! The little champion is here!"}},
      {you:[
        {zh:"大家好！", py:"dà jiā hǎo!", en:"Hi, everyone!", ok:true, reply:{zh:"小冠军，你几岁？", py:"xiǎo guàn jūn, nǐ jǐ suì?", en:"Little champion, how old are you?"}},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false},
        {zh:"晚安！", py:"wǎn ān!", en:"Good night!", ok:false}]},
      {you:[
        {zh:"我十岁。", py:"wǒ shí suì.", en:"I'm ten.", ok:true, reply:{zh:"十岁就是冠军！", py:"shí suì jiù shì guàn jūn!", en:"Only ten and already a champion!"}},
        {zh:"我二十岁。", py:"wǒ èrshí suì.", en:"I'm twenty.", ok:false},
        {zh:"我十点。", py:"wǒ shí diǎn.", en:"(mixed-up word) I'm ten o'clock.", ok:false}]},
      {npc:{zh:"你长大想做什么？", py:"nǐ zhǎng dà xiǎng zuò shén me?", en:"What do you want to be when you grow up?"}},
      {you:[
        {zh:"我想当老师！", py:"wǒ xiǎng dāng lǎo shī!", en:"I want to be a teacher!", ok:true, reply:{zh:"好老师！真棒！", py:"hǎo lǎo shī! zhēn bàng!", en:"A great teacher! Wonderful!"}},
        {zh:"我想当医生！", py:"wǒ xiǎng dāng yī shēng!", en:"I want to be a doctor!", ok:true, reply:{zh:"好医生！真棒！", py:"hǎo yī shēng! zhēn bàng!", en:"A great doctor! Wonderful!"}},
        {zh:"我想当小猫！", py:"wǒ xiǎng dāng xiǎo māo!", en:"I want to be a kitten!", ok:false}]},
      {npc:{zh:"你今天几点起床？", py:"nǐ jīn tiān jǐ diǎn qǐ chuáng?", en:"What time did you get up today?"}},
      {you:[
        {zh:"七点。", py:"qī diǎn.", en:"At seven.", ok:true, reply:{zh:"好早！", py:"hǎo zǎo!", en:"So early!"}},
        {zh:"七岁。", py:"qī suì.", en:"Seven years old.", ok:false},
        {zh:"七个。", py:"qī ge.", en:"Seven of them.", ok:false}]}
    ],
    end:{zh:"小冠军，加油！", py:"xiǎo guàn jūn, jiā yóu!", en:"Go, little champion!"},
    reward:{berry:1}
  },

  interview_7: {
    title:{en:"Champion Interview: What's Next?", zh:"下一步", py:"xià yí bù"},
    who:{name:"TV Host", zh:"主持人", py:"zhǔ chí rén", role:"host"},
    setting:"Confetti falls as the TV host asks about your next adventure.",
    turns:[
      {npc:{zh:"小冠军，你又赢了！", py:"xiǎo guàn jūn, nǐ yòu yíng le!", en:"Little champion, you won again!"}},
      {you:[
        {zh:"太棒了！", py:"tài bàng le!", en:"Awesome!", ok:true, reply:{zh:"你累不累？", py:"nǐ lèi bu lèi?", en:"Are you tired?"}},
        {zh:"对不起。", py:"duì bu qǐ.", en:"I'm sorry.", ok:false},
        {zh:"不是。", py:"bú shì.", en:"No, it isn't.", ok:false}]},
      {you:[
        {zh:"我有点儿累。", py:"wǒ yǒu diǎnr lèi.", en:"I'm a little tired.", ok:true, reply:{zh:"休息一下吧！", py:"xiū xi yí xià ba!", en:"Take a little rest!"}},
        {zh:"我不累！", py:"wǒ bú lèi!", en:"I'm not tired!", ok:true, reply:{zh:"哇，好厉害！", py:"wā, hǎo lì hai!", en:"Wow, amazing!"}},
        {zh:"我有点儿饿。", py:"wǒ yǒu diǎnr è.", en:"I'm a little hungry.", ok:false}]},
      {npc:{zh:"下一步你去哪里？", py:"xià yí bù nǐ qù nǎ lǐ?", en:"Where are you going next?"}},
      {you:[
        {zh:"我回家！", py:"wǒ huí jiā!", en:"I'm going home!", ok:true, reply:{zh:"回家吃饭吧！", py:"huí jiā chī fàn ba!", en:"Go home and have dinner!"}},
        {zh:"我去比赛！", py:"wǒ qù bǐ sài!", en:"I'm going to battle!", ok:true, reply:{zh:"哇，还要比赛！", py:"wā, hái yào bǐ sài!", en:"Wow, more battles!"}},
        {zh:"在这里！", py:"zài zhè lǐ!", en:"Right here!", ok:false}]},
      {npc:{zh:"明天你做什么？", py:"míng tiān nǐ zuò shén me?", en:"What will you do tomorrow?"}},
      {you:[
        {zh:"我和朋友玩！", py:"wǒ hé péng you wán!", en:"I'll play with my friends!", ok:true, reply:{zh:"好好玩吧！", py:"hǎo hǎo wán ba!", en:"Have lots of fun!"}},
        {zh:"我去朋友。", py:"wǒ qù péng you.", en:"(mixed-up words) I go friend.", ok:false},
        {zh:"明天见！", py:"míng tiān jiàn!", en:"See you tomorrow!", ok:false}]}
    ],
    end:{zh:"我们等你回来！", py:"wǒ men děng nǐ huí lái!", en:"We'll be waiting for you to come back!"},
    reward:{orb:3}
  },

  interview_8: {
    title:{en:"Champion Interview: Say Hi!", zh:"大家好！", py:"dà jiā hǎo!"},
    who:{name:"TV Host", zh:"主持人", py:"zhǔ chí rén", role:"host"},
    setting:"The camera's red light blinks on: kids everywhere are watching!",
    turns:[
      {npc:{zh:"大家好！我们的小明星来了！", py:"dà jiā hǎo! wǒ men de xiǎo míng xīng lái le!", en:"Hello, everyone! Our little star is here!"}},
      {you:[
        {zh:"你好！", py:"nǐ hǎo!", en:"Hello!", ok:true, reply:{zh:"很多小朋友在看你！", py:"hěn duō xiǎo péng you zài kàn nǐ!", en:"Lots of kids are watching you!"}},
        {zh:"晚安！", py:"wǎn ān!", en:"Good night!", ok:false},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false}]},
      {npc:{zh:"跟大家说你好吧！", py:"gēn dà jiā shuō nǐ hǎo ba!", en:"Say hi to everyone!"}},
      {you:[
        {zh:"大家好！", py:"dà jiā hǎo!", en:"Hi, everyone!", ok:true, reply:{zh:"哇，大家都在拍手！", py:"wā, dà jiā dōu zài pāi shǒu!", en:"Wow, everyone is clapping!"}},
        {zh:"大家再见！", py:"dà jiā zài jiàn!", en:"Bye, everyone!", ok:false},
        {zh:"你好吗？", py:"nǐ hǎo ma?", en:"How are you?", ok:false}]},
      {npc:{zh:"你想对他们说什么？", py:"nǐ xiǎng duì tā men shuō shén me?", en:"What do you want to tell them?"}},
      {you:[
        {zh:"我们一起玩吧！", py:"wǒ men yì qǐ wán ba!", en:"Let's play together!", ok:true, reply:{zh:"好主意！", py:"hǎo zhǔ yi!", en:"Great idea!"}},
        {zh:"加油！", py:"jiā yóu!", en:"You can do it!", ok:true, reply:{zh:"大家一起加油！", py:"dà jiā yì qǐ jiā yóu!", en:"Everyone, let's do our best together!"}},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want to.", ok:false}]},
      {npc:{zh:"最后，跟大家说再见！", py:"zuì hòu, gēn dà jiā shuō zài jiàn!", en:"Last of all, say goodbye to everyone!"}},
      {you:[
        {zh:"大家再见！", py:"dà jiā zài jiàn!", en:"Bye, everyone!", ok:true, reply:{zh:"再见！我们爱你！", py:"zài jiàn! wǒ men ài nǐ!", en:"Bye! We love you!"}},
        {zh:"大家好！", py:"dà jiā hǎo!", en:"Hi, everyone!", ok:false},
        {zh:"对不起。", py:"duì bu qǐ.", en:"I'm sorry.", ok:false}]}
    ],
    end:{zh:"今天的节目到这里！", py:"jīn tiān de jié mù dào zhè lǐ!", en:"That's all for today's show!"},
    reward:{great:1}
  },

  // ---------- airport ----------
  airport_out: {
    title:{en:"Check-In Time", zh:"去机场", py:"qù jī chǎng"},
    who:{name:"Check-in Agent", zh:"值机阿姨", py:"zhí jī ā yí", role:"agent"},
    setting:"At the airport counter, a kind agent smiles down at you and your family.",
    turns:[
      {npc:{zh:"你好！你们去加州吗？", py:"nǐ hǎo! nǐ men qù jiā zhōu ma?", en:"Hello! Are you going to California?"}},
      {you:[
        {zh:"对！我们去玩！", py:"duì! wǒ men qù wán!", en:"Yes! We're going to have fun!", ok:true, reply:{zh:"真好！有几个行李？", py:"zhēn hǎo! yǒu jǐ ge xíng li?", en:"How nice! How many bags do you have?"}},
        {zh:"不是。", py:"bú shì.", en:"No.", ok:false},
        {zh:"我们回家。", py:"wǒ men huí jiā.", en:"We're going home.", ok:false}]},
      {you:[
        {zh:"两个。", py:"liǎng ge.", en:"Two.", ok:true, reply:{zh:"好的，放这里。", py:"hǎo de, fàng zhè lǐ.", en:"OK, put them here."}},
        {zh:"二个。", py:"èr ge.", en:"(mixed-up word) Two-number pieces.", ok:false},
        {zh:"两岁。", py:"liǎng suì.", en:"Two years old.", ok:false}]},
      {npc:{zh:"你想坐窗边吗？", py:"nǐ xiǎng zuò chuāng biān ma?", en:"Would you like a window seat?"}},
      {you:[
        {zh:"我要窗边！", py:"wǒ yào chuāng biān!", en:"I want the window!", ok:true, reply:{zh:"好！你可以看云！", py:"hǎo! nǐ kě yǐ kàn yún!", en:"OK! You can watch the clouds!"}},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want it.", ok:false},
        {zh:"在哪里？", py:"zài nǎ lǐ?", en:"Where is it?", ok:false}]},
      {npc:{zh:"这是你的票！", py:"zhè shì nǐ de piào!", en:"Here's your ticket!"}},
      {you:[
        {zh:"谢谢阿姨！", py:"xiè xie ā yí!", en:"Thank you, ma'am!", ok:true, reply:{zh:"不客气！", py:"bú kè qi!", en:"You're welcome!"}},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false},
        {zh:"对不起。", py:"duì bu qǐ.", en:"I'm sorry.", ok:false}]}
    ],
    end:{zh:"一路平安！玩得开心！", py:"yí lù píng ān! wán de kāi xīn!", en:"Have a safe trip! Have fun!"}
  },

  // ---------- phone calls ----------
  phone_grandma: {
    title:{en:"Call from Grandma", zh:"奶奶的电话", py:"nǎi nai de diàn huà"},
    who:{name:"Grandma", zh:"奶奶", py:"nǎi nai", role:"phone"},
    setting:"Your phone rings while you play. It's Grandma!",
    turns:[
      {npc:{zh:"喂？是我，奶奶！", py:"wèi? shì wǒ, nǎi nai!", en:"Hello? It's me, Grandma!"}},
      {you:[
        {zh:"奶奶，你好！", py:"nǎi nai, nǐ hǎo!", en:"Hi, Grandma!", ok:true, reply:{zh:"宝贝，你好吗？", py:"bǎo bèi, nǐ hǎo ma?", en:"Sweetie, how are you?"}},
        {zh:"奶奶，再见！", py:"nǎi nai, zài jiàn!", en:"Bye, Grandma!", ok:false},
        {zh:"你找谁？", py:"nǐ zhǎo shéi?", en:"Who are you looking for?", ok:false}]},
      {you:[
        {zh:"我很好！你呢？", py:"wǒ hěn hǎo! nǐ ne?", en:"I'm great! And you?", ok:true, reply:{zh:"奶奶也很好！", py:"nǎi nai yě hěn hǎo!", en:"Grandma's great too!"}},
        {zh:"我不好。", py:"wǒ bù hǎo.", en:"I'm not good.", ok:false},
        {zh:"我十岁。", py:"wǒ shí suì.", en:"I'm ten.", ok:false}]},
      {npc:{zh:"你吃饭了吗？", py:"nǐ chī fàn le ma?", en:"Have you eaten yet?"}},
      {you:[
        {zh:"我吃了！", py:"wǒ chī le!", en:"I ate!", ok:true, reply:{zh:"真乖！", py:"zhēn guāi!", en:"Good kid!"}},
        {zh:"我没吃。", py:"wǒ méi chī.", en:"I haven't eaten.", ok:true, reply:{zh:"快去吃饭！", py:"kuài qù chī fàn!", en:"Go eat, quick!"}},
        {zh:"我不吃了。", py:"wǒ bù chī le.", en:"I'm not eating anymore.", ok:false}]},
      {npc:{zh:"奶奶想你了！", py:"nǎi nai xiǎng nǐ le!", en:"Grandma misses you!"}},
      {you:[
        {zh:"我也想你！", py:"wǒ yě xiǎng nǐ!", en:"I miss you too!", ok:true, reply:{zh:"奶奶爱你！", py:"nǎi nai ài nǐ!", en:"Grandma loves you!"}},
        {zh:"你想我吗？", py:"nǐ xiǎng wǒ ma?", en:"Do you miss me?", ok:false},
        {zh:"我想吃。", py:"wǒ xiǎng chī.", en:"I want to eat.", ok:false}]},
      {npc:{zh:"奶奶要做饭了。再见！", py:"nǎi nai yào zuò fàn le. zài jiàn!", en:"Grandma has to go cook now. Bye!"}},
      {you:[
        {zh:"奶奶再见！", py:"nǎi nai zài jiàn!", en:"Bye, Grandma!", ok:true, reply:{zh:"记得多喝水哦！", py:"jì de duō hē shuǐ o!", en:"Remember to drink lots of water!"}},
        {zh:"奶奶你好！", py:"nǎi nai nǐ hǎo!", en:"Hi, Grandma!", ok:false},
        {zh:"早上好！", py:"zǎo shang hǎo!", en:"Good morning!", ok:false}]}
    ],
    end:{zh:"再见，宝贝！", py:"zài jiàn, bǎo bèi!", en:"Bye, sweetie!"},
    reward:{berry:2}
  },

  phone_friend: {
    title:{en:"Play Tomorrow?", zh:"明天玩吗？", py:"míng tiān wán ma?"},
    who:{name:"Lele (friend)", zh:"乐乐", py:"Lè le", role:"phone"},
    setting:"Ring ring! Your friend Lele is calling.",
    turns:[
      {npc:{zh:"喂？是我，乐乐！", py:"wèi? shì wǒ, Lè le!", en:"Hello? It's me, Lele!"}},
      {you:[
        {zh:"你好！", py:"nǐ hǎo!", en:"Hi!", ok:true, reply:{zh:"明天一起玩吗？", py:"míng tiān yì qǐ wán ma?", en:"Want to play tomorrow?"}},
        {zh:"再见！", py:"zài jiàn!", en:"Bye!", ok:false},
        {zh:"你是谁？", py:"nǐ shì shéi?", en:"Who are you?", ok:false}]},
      {you:[
        {zh:"好啊！几点？", py:"hǎo a! jǐ diǎn?", en:"Sure! What time?", ok:true, reply:{zh:"下午三点，好吗？", py:"xià wǔ sān diǎn, hǎo ma?", en:"Three in the afternoon, OK?"}},
        {zh:"好啊！多少点？", py:"hǎo a! duō shao diǎn?", en:"(mixed-up word) Sure! How-much o'clock?", ok:false},
        {zh:"不要，谢谢。", py:"bú yào, xiè xie.", en:"No, thanks.", ok:false}]},
      {you:[
        {zh:"好的！", py:"hǎo de!", en:"OK!", ok:true, reply:{zh:"来我家玩！", py:"lái wǒ jiā wán!", en:"Come play at my house!"}},
        {zh:"三岁。", py:"sān suì.", en:"Three years old.", ok:false},
        {zh:"现在几点？", py:"xiàn zài jǐ diǎn?", en:"What time is it now?", ok:false}]},
      {you:[
        {zh:"好！明天见！", py:"hǎo! míng tiān jiàn!", en:"OK! See you tomorrow!", ok:true, reply:{zh:"明天见！不见不散！", py:"míng tiān jiàn! bú jiàn bú sàn!", en:"See you tomorrow! Be there!"}},
        {zh:"昨天见！", py:"zuó tiān jiàn!", en:"See you yesterday!", ok:false},
        {zh:"晚安！", py:"wǎn ān!", en:"Good night!", ok:false}]}
    ],
    end:{zh:"我好开心！再见！", py:"wǒ hǎo kāi xīn! zài jiàn!", en:"I'm so happy! Bye!"},
    reward:{orb:3}
  },

  phone_grandpa: {
    title:{en:"Call from Grandpa", zh:"爷爷的电话", py:"yé ye de diàn huà"},
    who:{name:"Grandpa", zh:"爷爷", py:"yé ye", role:"phone"},
    setting:"Your phone rings. It's Grandpa, and he wants to hear about your creatures!",
    turns:[
      {npc:{zh:"喂？宝贝，我是爷爷！", py:"wèi? bǎo bèi, wǒ shì yé ye!", en:"Hello? Sweetie, it's Grandpa!"}},
      {you:[
        {zh:"爷爷，你好！", py:"yé ye, nǐ hǎo!", en:"Hi, Grandpa!", ok:true, reply:{zh:"你好吗？", py:"nǐ hǎo ma?", en:"How are you?"}},
        {zh:"爷爷，再见！", py:"yé ye, zài jiàn!", en:"Bye, Grandpa!", ok:false},
        {zh:"奶奶，你好！", py:"nǎi nai, nǐ hǎo!", en:"Hi, Grandma!", ok:false}]},
      {you:[
        {zh:"我很好！你呢？", py:"wǒ hěn hǎo! nǐ ne?", en:"I'm great! And you?", ok:true, reply:{zh:"爷爷很好！你在做什么？", py:"yé ye hěn hǎo! nǐ zài zuò shén me?", en:"Grandpa's great! What are you doing?"}},
        {zh:"我很累。", py:"wǒ hěn lèi.", en:"I'm very tired.", ok:false},
        {zh:"我不好。", py:"wǒ bù hǎo.", en:"I'm not good.", ok:false}]},
      {you:[
        {zh:"我在玩！", py:"wǒ zài wán!", en:"I'm playing!", ok:true, reply:{zh:"你抓到小动物了吗？", py:"nǐ zhuā dào xiǎo dòng wù le ma?", en:"Did you catch any creatures?"}},
        {zh:"我在吃饭。", py:"wǒ zài chī fàn.", en:"I'm eating.", ok:false},
        {zh:"我在哪里？", py:"wǒ zài nǎ lǐ?", en:"Where am I?", ok:false}]},
      {you:[
        {zh:"我抓到了！", py:"wǒ zhuā dào le!", en:"I caught some!", ok:true, reply:{zh:"哇！抓到几个？", py:"wā! zhuā dào jǐ ge?", en:"Wow! How many did you catch?"}},
        {zh:"我不抓到。", py:"wǒ bù zhuā dào.", en:"(mixed-up word) I not-catch.", ok:false},
        {zh:"我抓到你了！", py:"wǒ zhuā dào nǐ le!", en:"I caught you!", ok:false}]},
      {you:[
        {zh:"五个！", py:"wǔ ge!", en:"Five!", ok:true, reply:{zh:"太棒了！爷爷为你高兴！", py:"tài bàng le! yé ye wèi nǐ gāo xìng!", en:"Awesome! Grandpa is so happy for you!"}},
        {zh:"五岁！", py:"wǔ suì!", en:"Five years old!", ok:false},
        {zh:"五点！", py:"wǔ diǎn!", en:"Five o'clock!", ok:false}]}
    ],
    end:{zh:"好好玩！爷爷爱你！", py:"hǎo hǎo wán! yé ye ài nǐ!", en:"Have fun! Grandpa loves you!"},
    reward:{orb:3}
  },

  phone_grandma_2: {
    title:{en:"Grandma Checks In", zh:"奶奶又来电话了", py:"nǎi nai yòu lái diàn huà le"},
    who:{name:"Grandma", zh:"奶奶", py:"nǎi nai", role:"phone"},
    setting:"Ring ring! Grandma is calling again to see how you're doing.",
    turns:[
      {npc:{zh:"喂？宝贝，是奶奶！", py:"wèi? bǎo bèi, shì nǎi nai!", en:"Hello? Sweetie, it's Grandma!"}},
      {you:[
        {zh:"奶奶，你好！", py:"nǎi nai, nǐ hǎo!", en:"Hi, Grandma!", ok:true, reply:{zh:"你今天开心吗？", py:"nǐ jīn tiān kāi xīn ma?", en:"Are you happy today?"}},
        {zh:"奶奶，晚安！", py:"nǎi nai, wǎn ān!", en:"Good night, Grandma!", ok:false},
        {zh:"你是谁？", py:"nǐ shì shéi?", en:"Who are you?", ok:false}]},
      {you:[
        {zh:"我很开心！", py:"wǒ hěn kāi xīn!", en:"I'm really happy!", ok:true, reply:{zh:"太好了！今天吃了什么？", py:"tài hǎo le! jīn tiān chī le shén me?", en:"Wonderful! What did you eat today?"}},
        {zh:"我不开心。", py:"wǒ bù kāi xīn.", en:"I'm not happy.", ok:false},
        {zh:"我十岁。", py:"wǒ shí suì.", en:"I'm ten.", ok:false}]},
      {you:[
        {zh:"我吃了面条！", py:"wǒ chī le miàn tiáo!", en:"I ate noodles!", ok:true, reply:{zh:"真好！今天冷不冷？", py:"zhēn hǎo! jīn tiān lěng bu lěng?", en:"Good! Is it cold today?"}},
        {zh:"我吃了饺子！", py:"wǒ chī le jiǎo zi!", en:"I ate dumplings!", ok:true, reply:{zh:"真好！今天冷不冷？", py:"zhēn hǎo! jīn tiān lěng bu lěng?", en:"Good! Is it cold today?"}},
        {zh:"我喝了面条。", py:"wǒ hē le miàn tiáo.", en:"I drank noodles.", ok:false}]},
      {you:[
        {zh:"有点儿冷。", py:"yǒu diǎnr lěng.", en:"A little cold.", ok:true, reply:{zh:"多穿衣服哦！", py:"duō chuān yī fu o!", en:"Put on more clothes, OK?"}},
        {zh:"有点儿热。", py:"yǒu diǎnr rè.", en:"A little hot.", ok:true, reply:{zh:"多喝水哦！", py:"duō hē shuǐ o!", en:"Drink lots of water, OK?"}},
        {zh:"有点儿饿。", py:"yǒu diǎnr è.", en:"A little hungry.", ok:false}]},
      {you:[
        {zh:"好的！我爱你！", py:"hǎo de! wǒ ài nǐ!", en:"OK! I love you!", ok:true, reply:{zh:"奶奶也爱你！", py:"nǎi nai yě ài nǐ!", en:"Grandma loves you too!"}},
        {zh:"我爱你吗？", py:"wǒ ài nǐ ma?", en:"Do I love you?", ok:false},
        {zh:"你爱我！", py:"nǐ ài wǒ!", en:"You love me!", ok:false}]}
    ],
    end:{zh:"奶奶亲亲你！再见！", py:"nǎi nai qīn qin nǐ! zài jiàn!", en:"Grandma sends you a kiss! Bye!"},
    reward:{berry:2}
  },

  phone_grandpa_2: {
    title:{en:"Visit Grandpa!", zh:"去爷爷家", py:"qù yé ye jiā"},
    who:{name:"Grandpa", zh:"爷爷", py:"yé ye", role:"phone"},
    setting:"Your phone buzzes. Grandpa has an idea for the weekend!",
    turns:[
      {npc:{zh:"喂？是爷爷！你好吗？", py:"wèi? shì yé ye! nǐ hǎo ma?", en:"Hello? It's Grandpa! How are you?"}},
      {you:[
        {zh:"我很好！你呢？", py:"wǒ hěn hǎo! nǐ ne?", en:"I'm great! And you?", ok:true, reply:{zh:"爷爷也很好！", py:"yé ye yě hěn hǎo!", en:"Grandpa's great too!"}},
        {zh:"我很好！我呢？", py:"wǒ hěn hǎo! wǒ ne?", en:"(mixed-up word) I'm great! And me?", ok:false},
        {zh:"爷爷，再见！", py:"yé ye, zài jiàn!", en:"Bye, Grandpa!", ok:false}]},
      {npc:{zh:"周末来爷爷家玩吧！", py:"zhōu mò lái yé ye jiā wán ba!", en:"Come play at Grandpa's this weekend!"}},
      {you:[
        {zh:"好的！", py:"hǎo de!", en:"OK!", ok:true, reply:{zh:"太好了！你想做什么？", py:"tài hǎo le! nǐ xiǎng zuò shén me?", en:"Hooray! What do you want to do?"}},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want to.", ok:false},
        {zh:"我不知道。", py:"wǒ bù zhī dào.", en:"I don't know.", ok:false}]},
      {you:[
        {zh:"我想去钓鱼！", py:"wǒ xiǎng qù diào yú!", en:"I want to go fishing!", ok:true, reply:{zh:"好！我们一起钓鱼！", py:"hǎo! wǒ men yì qǐ diào yú!", en:"OK! We'll go fishing together!"}},
        {zh:"我想吃鱼！", py:"wǒ xiǎng chī yú!", en:"I want to eat fish!", ok:true, reply:{zh:"哈哈，爷爷做鱼给你吃！", py:"hā hā, yé ye zuò yú gěi nǐ chī!", en:"Ha ha, Grandpa will cook fish for you!"}},
        {zh:"我想睡觉。", py:"wǒ xiǎng shuì jiào.", en:"I want to sleep.", ok:false}]},
      {npc:{zh:"爷爷想你了！", py:"yé ye xiǎng nǐ le!", en:"Grandpa misses you!"}},
      {you:[
        {zh:"我也想你！", py:"wǒ yě xiǎng nǐ!", en:"I miss you too!", ok:true, reply:{zh:"宝贝真乖！", py:"bǎo bèi zhēn guāi!", en:"What a sweetheart!"}},
        {zh:"你想我吗？", py:"nǐ xiǎng wǒ ma?", en:"Do you miss me?", ok:false},
        {zh:"我也想吃！", py:"wǒ yě xiǎng chī!", en:"I want to eat too!", ok:false}]},
      {you:[
        {zh:"周末见！爷爷再见！", py:"zhōu mò jiàn! yé ye zài jiàn!", en:"See you this weekend! Bye, Grandpa!", ok:true, reply:{zh:"再见，宝贝！", py:"zài jiàn, bǎo bèi!", en:"Bye, sweetie!"}},
        {zh:"昨天见！", py:"zuó tiān jiàn!", en:"See you yesterday!", ok:false},
        {zh:"爷爷你好！", py:"yé ye nǐ hǎo!", en:"Hi, Grandpa!", ok:false}]}
    ],
    end:{zh:"爷爷等你哦！", py:"yé ye děng nǐ o!", en:"Grandpa will be waiting for you!"},
    reward:{orb:4}
  },

  phone_mom: {
    title:{en:"Dinner Time", zh:"回家吃饭", py:"huí jiā chī fàn"},
    who:{name:"Mom", zh:"妈妈", py:"mā ma", role:"phone"},
    setting:"Your phone rings. It's Mom!",
    turns:[
      {npc:{zh:"喂？宝贝，你在哪里？", py:"wèi? bǎo bèi, nǐ zài nǎ lǐ?", en:"Hello? Sweetie, where are you?"}},
      {you:[
        {zh:"我在外面玩！", py:"wǒ zài wài miàn wán!", en:"I'm playing outside!", ok:true, reply:{zh:"六点回家吃饭，好吗？", py:"liù diǎn huí jiā chī fàn, hǎo ma?", en:"Come home for dinner at six, OK?"}},
        {zh:"你在哪里？", py:"nǐ zài nǎ lǐ?", en:"Where are you?", ok:false},
        {zh:"我在家。", py:"wǒ zài jiā.", en:"I'm at home.", ok:false}]},
      {you:[
        {zh:"好的，妈妈！", py:"hǎo de, mā ma!", en:"OK, Mom!", ok:true, reply:{zh:"你想吃什么？", py:"nǐ xiǎng chī shén me?", en:"What do you want to eat?"}},
        {zh:"不要，妈妈！", py:"bú yào, mā ma!", en:"No, Mom!", ok:false},
        {zh:"我不饿。", py:"wǒ bú è.", en:"I'm not hungry.", ok:false}]},
      {you:[
        {zh:"我想吃面条！", py:"wǒ xiǎng chī miàn tiáo!", en:"I want noodles!", ok:true, reply:{zh:"好！妈妈做面条！", py:"hǎo! mā ma zuò miàn tiáo!", en:"OK! Mom will make noodles!"}},
        {zh:"我想吃饺子！", py:"wǒ xiǎng chī jiǎo zi!", en:"I want dumplings!", ok:true, reply:{zh:"好！妈妈包饺子！", py:"hǎo! mā ma bāo jiǎo zi!", en:"OK! Mom will make dumplings!"}},
        {zh:"我想喝面条。", py:"wǒ xiǎng hē miàn tiáo.", en:"I want to drink noodles.", ok:false}]},
      {npc:{zh:"几点回家？", py:"jǐ diǎn huí jiā?", en:"What time are you coming home?"}},
      {you:[
        {zh:"六点回家！", py:"liù diǎn huí jiā!", en:"Home at six!", ok:true, reply:{zh:"真乖！妈妈爱你！", py:"zhēn guāi! mā ma ài nǐ!", en:"Good kid! Mom loves you!"}},
        {zh:"回家六点。", py:"huí jiā liù diǎn.", en:"(mixed-up order) Home six o'clock.", ok:false},
        {zh:"十点回家！", py:"shí diǎn huí jiā!", en:"Home at ten!", ok:false}]},
      {you:[
        {zh:"妈妈再见！", py:"mā ma zài jiàn!", en:"Bye, Mom!", ok:true, reply:{zh:"再见，宝贝！", py:"zài jiàn, bǎo bèi!", en:"Bye, sweetie!"}},
        {zh:"妈妈你好！", py:"mā ma nǐ hǎo!", en:"Hi, Mom!", ok:false},
        {zh:"妈妈对不起。", py:"mā ma duì bu qǐ.", en:"Sorry, Mom.", ok:false}]}
    ],
    end:{zh:"路上小心哦！", py:"lù shàng xiǎo xīn o!", en:"Be careful on the way!"},
    reward:{berry:1}
  },

  phone_wrong: {
    title:{en:"Wrong Number!", zh:"打错了！", py:"dǎ cuò le!"},
    who:{name:"Wrong Number", zh:"陌生人", py:"mò shēng rén", role:"phone"},
    setting:"Ring ring! Someone you don't know is on the line.",
    turns:[
      {npc:{zh:"喂？是披萨店吗？", py:"wèi? shì pī sà diàn ma?", en:"Hello? Is this the pizza shop?"}},
      {you:[
        {zh:"不是。你找谁？", py:"bú shì. nǐ zhǎo shéi?", en:"No. Who are you looking for?", ok:true, reply:{zh:"我找披萨店！", py:"wǒ zhǎo pī sà diàn!", en:"I'm looking for the pizza shop!"}},
        {zh:"是！", py:"shì!", en:"Yes!", ok:false},
        {zh:"我要披萨！", py:"wǒ yào pī sà!", en:"I want pizza!", ok:false}]},
      {you:[
        {zh:"这里是我家！", py:"zhè lǐ shì wǒ jiā!", en:"This is my house!", ok:true, reply:{zh:"哎呀！对不起，我打错了！", py:"āi yā! duì bu qǐ, wǒ dǎ cuò le!", en:"Oops! Sorry, I called the wrong number!"}},
        {zh:"我是披萨！", py:"wǒ shì pī sà!", en:"I'm a pizza!", ok:false},
        {zh:"这里是披萨店！", py:"zhè lǐ shì pī sà diàn!", en:"This is the pizza shop!", ok:false}]},
      {you:[
        {zh:"没关系！", py:"méi guān xi!", en:"That's OK!", ok:true, reply:{zh:"你真好！再见！", py:"nǐ zhēn hǎo! zài jiàn!", en:"You're so nice! Bye!"}},
        {zh:"不客气！", py:"bú kè qi!", en:"You're welcome!", ok:false},
        {zh:"谢谢！", py:"xiè xie!", en:"Thank you!", ok:false}]}
    ],
    end:{zh:"我还是想吃披萨……", py:"wǒ hái shi xiǎng chī pī sà…", en:"I still want pizza..."},
    reward:{orb:2}
  },

  phone_coach: {
    title:{en:"Call from Coach", zh:"教练的电话", py:"jiào liàn de diàn huà"},
    who:{name:"Coach Mira", zh:"米拉教练", py:"Mǐ lā jiào liàn", role:"phone"},
    setting:"Your phone buzzes. It's Coach Mira from the backyard gym!",
    turns:[
      {npc:{zh:"喂？我是米拉教练！", py:"wèi? wǒ shì Mǐ lā jiào liàn!", en:"Hello? It's Coach Mira!"}},
      {you:[
        {zh:"教练，你好！", py:"jiào liàn, nǐ hǎo!", en:"Hi, Coach!", ok:true, reply:{zh:"恭喜你！你很棒！", py:"gōng xǐ nǐ! nǐ hěn bàng!", en:"Congratulations! You're great!"}},
        {zh:"教练，再见！", py:"jiào liàn, zài jiàn!", en:"Bye, Coach!", ok:false},
        {zh:"你找谁？", py:"nǐ zhǎo shéi?", en:"Who are you looking for?", ok:false}]},
      {you:[
        {zh:"谢谢教练！", py:"xiè xie jiào liàn!", en:"Thanks, Coach!", ok:true, reply:{zh:"不客气！你在做什么？", py:"bú kè qi! nǐ zài zuò shén me?", en:"You're welcome! What are you doing?"}},
        {zh:"不客气！", py:"bú kè qi!", en:"You're welcome!", ok:false},
        {zh:"对不起！", py:"duì bu qǐ!", en:"I'm sorry!", ok:false}]},
      {you:[
        {zh:"我在玩！", py:"wǒ zài wán!", en:"I'm playing!", ok:true, reply:{zh:"我们再比赛一次吧！", py:"wǒ men zài bǐ sài yí cì ba!", en:"Let's battle again!"}},
        {zh:"我在吃饭！", py:"wǒ zài chī fàn!", en:"I'm eating!", ok:true, reply:{zh:"吃完我们再比赛！", py:"chī wán wǒ men zài bǐ sài!", en:"After you eat, let's battle again!"}},
        {zh:"我在哪里？", py:"wǒ zài nǎ lǐ?", en:"Where am I?", ok:false}]},
      {you:[
        {zh:"好啊！加油！", py:"hǎo a! jiā yóu!", en:"Sure! Let's go!", ok:true, reply:{zh:"好！后院见！", py:"hǎo! hòu yuàn jiàn!", en:"Great! See you in the backyard!"}},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want to.", ok:false},
        {zh:"我累了。", py:"wǒ lèi le.", en:"I'm tired.", ok:false}]}
    ],
    end:{zh:"我等你哦！再见！", py:"wǒ děng nǐ o! zài jiàn!", en:"I'll be waiting! Bye!"},
    reward:{great:1}
  },

  // ---------- gym leaders (rift + California) ----------
  gym_starveil: {
    title:{en:"Counting Stars", zh:"数星星", py:"shǔ xīng xing"},
    who:{name:"The Rift Keeper", zh:"守门人", py:"shǒu mén rén", role:"gym leader"},
    setting:"Inside the shimmering rift, the Rift Keeper floats beneath a sky full of stars.",
    turns:[
      {npc:{zh:"你好，小旅人。", py:"nǐ hǎo, xiǎo lǚ rén.", en:"Hello, little traveler."}},
      {you:[
        {zh:"你好！", py:"nǐ hǎo!", en:"Hello!", ok:true, reply:{zh:"你看，天上有星星。", py:"nǐ kàn, tiān shàng yǒu xīng xing.", en:"Look, there are stars in the sky."}},
        {zh:"晚安！", py:"wǎn ān!", en:"Good night!", ok:false},
        {zh:"我饿了。", py:"wǒ è le.", en:"I'm hungry.", ok:false}]},
      {you:[
        {zh:"哇！好漂亮！", py:"wā! hǎo piào liang!", en:"Wow! So pretty!", ok:true, reply:{zh:"你喜欢星星吗？", py:"nǐ xǐ huan xīng xing ma?", en:"Do you like the stars?"}},
        {zh:"好吃！", py:"hǎo chī!", en:"Yummy!", ok:false},
        {zh:"好冷！", py:"hǎo lěng!", en:"So cold!", ok:false}]},
      {you:[
        {zh:"我喜欢星星！", py:"wǒ xǐ huan xīng xing!", en:"I like the stars!", ok:true, reply:{zh:"我们一起数吧。", py:"wǒ men yì qǐ shǔ ba.", en:"Let's count them together."}},
        {zh:"我喜欢月亮！", py:"wǒ xǐ huan yuè liang!", en:"I like the moon!", ok:true, reply:{zh:"月亮也很美。", py:"yuè liang yě hěn měi.", en:"The moon is lovely too."}},
        {zh:"我不喜欢。", py:"wǒ bù xǐ huan.", en:"I don't like them.", ok:false}]},
      {npc:{zh:"一、二、三……好多！", py:"yī, èr, sān… hǎo duō!", en:"One, two, three... so many!"}},
      {npc:{zh:"星星在看你。准备好了吗？", py:"xīng xing zài kàn nǐ. zhǔn bèi hǎo le ma?", en:"The stars are watching you. Are you ready?"}},
      {you:[
        {zh:"我准备好了！", py:"wǒ zhǔn bèi hǎo le!", en:"I'm ready!", ok:true, reply:{zh:"那就开始吧。", py:"nà jiù kāi shǐ ba.", en:"Then let us begin."}},
        {zh:"我有点儿怕。", py:"wǒ yǒu diǎnr pà.", en:"I'm a little scared.", ok:false},
        {zh:"我要回家。", py:"wǒ yào huí jiā.", en:"I want to go home.", ok:false}]}
    ],
    end:{zh:"星光，亮起来！", py:"xīng guāng, liàng qǐ lái!", en:"Starlight, shine!"}
  },

  gym_sandiego: {
    title:{en:"Beach Day", zh:"去海边", py:"qù hǎi biān"},
    who:{name:"Surfer Kai", zh:"凯", py:"Kǎi", role:"gym leader"},
    setting:"Surfer Kai waves from the warm sand with a surfboard under one arm.",
    turns:[
      {npc:{zh:"嘿！你好！来海边玩！", py:"hēi! nǐ hǎo! lái hǎi biān wán!", en:"Hey! Hi! Come play at the beach!"}},
      {you:[
        {zh:"今天很热！", py:"jīn tiān hěn rè!", en:"It's hot today!", ok:true, reply:{zh:"对！我们去游泳吧！", py:"duì! wǒ men qù yóu yǒng ba!", en:"Yeah! Let's go swimming!"}},
        {zh:"今天很冷。", py:"jīn tiān hěn lěng.", en:"It's cold today.", ok:false},
        {zh:"我很冷。", py:"wǒ hěn lěng.", en:"I'm very cold.", ok:false}]},
      {you:[
        {zh:"好啊！我喜欢海！", py:"hǎo a! wǒ xǐ huan hǎi!", en:"Sure! I love the ocean!", ok:true, reply:{zh:"我也是！海很大！", py:"wǒ yě shì! hǎi hěn dà!", en:"Me too! The ocean is so big!"}},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want to.", ok:false},
        {zh:"海在哪里？", py:"hǎi zài nǎ lǐ?", en:"Where's the ocean?", ok:false}]},
      {npc:{zh:"你看！沙子里有什么？", py:"nǐ kàn! shā zi lǐ yǒu shén me?", en:"Look! What's in the sand?"}},
      {you:[
        {zh:"有一个贝壳！", py:"yǒu yí ge bèi ké!", en:"There's a seashell!", ok:true, reply:{zh:"送给你！", py:"sòng gěi nǐ!", en:"It's yours!"}},
        {zh:"有一个苹果！", py:"yǒu yí ge píng guǒ!", en:"There's an apple!", ok:false},
        {zh:"我不知道。", py:"wǒ bù zhī dào.", en:"I don't know.", ok:false}]},
      {npc:{zh:"现在，我们比赛吧！", py:"xiàn zài, wǒ men bǐ sài ba!", en:"Now, let's battle!"}},
      {you:[
        {zh:"好的！我们开始吧！", py:"hǎo de! wǒ men kāi shǐ ba!", en:"OK! Let's start!", ok:true, reply:{zh:"浪来了！加油！", py:"làng lái le! jiā yóu!", en:"Here comes a wave! Go!"}},
        {zh:"我渴了。", py:"wǒ kě le.", en:"I'm thirsty.", ok:false},
        {zh:"明天吧。", py:"míng tiān ba.", en:"Maybe tomorrow.", ok:false}]}
    ],
    end:{zh:"像海浪一样快！", py:"xiàng hǎi làng yí yàng kuài!", en:"Fast like the waves!"}
  },

  gym_losangeles: {
    title:{en:"Lights, Camera!", zh:"看电影", py:"kàn diàn yǐng"},
    who:{name:"Director Vale", zh:"维尔导演", py:"Wéi ěr dǎo yǎn", role:"gym leader"},
    setting:"Director Vale sits in a tall chair on a movie set, holding a megaphone.",
    turns:[
      {npc:{zh:"你好！你喜欢看电影吗？", py:"nǐ hǎo! nǐ xǐ huan kàn diàn yǐng ma?", en:"Hello! Do you like watching movies?"}},
      {you:[
        {zh:"我喜欢看电影！", py:"wǒ xǐ huan kàn diàn yǐng!", en:"I like watching movies!", ok:true, reply:{zh:"太好了！我也是！", py:"tài hǎo le! wǒ yě shì!", en:"Great! Me too!"}},
        {zh:"我不喜欢。", py:"wǒ bù xǐ huan.", en:"I don't like it.", ok:false},
        {zh:"我喜欢看书。", py:"wǒ xǐ huan kàn shū.", en:"I like reading books.", ok:false}]},
      {npc:{zh:"你喜欢什么电影？", py:"nǐ xǐ huan shén me diàn yǐng?", en:"What kind of movies do you like?"}},
      {you:[
        {zh:"我喜欢动画片！", py:"wǒ xǐ huan dòng huà piàn!", en:"I like cartoons!", ok:true, reply:{zh:"动画片很好看！", py:"dòng huà piàn hěn hǎo kàn!", en:"Cartoons are great to watch!"}},
        {zh:"我喜欢小动物！", py:"wǒ xǐ huan xiǎo dòng wù!", en:"I like little animals!", ok:true, reply:{zh:"动物电影很可爱！", py:"dòng wù diàn yǐng hěn kě ài!", en:"Animal movies are so cute!"}},
        {zh:"我喜欢吃！", py:"wǒ xǐ huan chī!", en:"I like eating!", ok:false}]},
      {npc:{zh:"看电影吃什么？", py:"kàn diàn yǐng chī shén me?", en:"What do you eat at the movies?"}},
      {you:[
        {zh:"我要爆米花！", py:"wǒ yào bào mǐ huā!", en:"I want popcorn!", ok:true, reply:{zh:"好！给你一大桶！", py:"hǎo! gěi nǐ yí dà tǒng!", en:"OK! Here's a big bucket!"}},
        {zh:"我卖爆米花。", py:"wǒ mài bào mǐ huā.", en:"I sell popcorn.", ok:false},
        {zh:"我要水。", py:"wǒ yào shuǐ.", en:"I want water.", ok:false}]},
      {npc:{zh:"准备好了吗？开拍！", py:"zhǔn bèi hǎo le ma? kāi pāi!", en:"Ready? Action!"}},
      {you:[
        {zh:"我准备好了！", py:"wǒ zhǔn bèi hǎo le!", en:"I'm ready!", ok:true, reply:{zh:"好！你是大明星！", py:"hǎo! nǐ shì dà míng xīng!", en:"Great! You're a big star!"}},
        {zh:"等一下！", py:"děng yí xià!", en:"Wait a moment!", ok:false},
        {zh:"我有点儿怕。", py:"wǒ yǒu diǎnr pà.", en:"I'm a little scared.", ok:false}]}
    ],
    end:{zh:"灯光，开！", py:"dēng guāng, kāi!", en:"Lights on!"}
  },

  gym_sanfrancisco: {
    title:{en:"Up the Hill", zh:"上坡", py:"shàng pō"},
    who:{name:"Engineer Mae", zh:"梅工程师", py:"Méi gōng chéng shī", role:"gym leader"},
    setting:"Engineer Mae sips a coffee at the top of a very steep San Francisco hill.",
    turns:[
      {npc:{zh:"你好！这个山坡好高！", py:"nǐ hǎo! zhè ge shān pō hǎo gāo!", en:"Hi! This hill is so high!"}},
      {you:[
        {zh:"好高！我累了。", py:"hǎo gāo! wǒ lèi le.", en:"So high! I'm tired.", ok:true, reply:{zh:"休息一下吧！", py:"xiū xi yí xià ba!", en:"Take a little rest!"}},
        {zh:"好矮！", py:"hǎo ǎi!", en:"So short!", ok:false},
        {zh:"好吃！", py:"hǎo chī!", en:"Yummy!", ok:false}]},
      {npc:{zh:"我在喝咖啡。你喝吗？", py:"wǒ zài hē kā fēi. nǐ hē ma?", en:"I'm drinking coffee. Want some?"}},
      {you:[
        {zh:"我不喝咖啡。", py:"wǒ bù hē kā fēi.", en:"I don't drink coffee.", ok:true, reply:{zh:"对，小朋友不喝！", py:"duì, xiǎo péng you bù hē!", en:"Right, kids don't drink it!"}},
        {zh:"我没喝咖啡。", py:"wǒ méi hē kā fēi.", en:"I didn't drink coffee.", ok:false},
        {zh:"我要咖啡！", py:"wǒ yào kā fēi!", en:"I want coffee!", ok:false}]},
      {npc:{zh:"你要喝什么？", py:"nǐ yào hē shén me?", en:"What would you like to drink?"}},
      {you:[
        {zh:"我要牛奶。", py:"wǒ yào niú nǎi.", en:"I want milk.", ok:true, reply:{zh:"好，给你牛奶！", py:"hǎo, gěi nǐ niú nǎi!", en:"OK, here's some milk!"}},
        {zh:"我要水。", py:"wǒ yào shuǐ.", en:"I want water.", ok:true, reply:{zh:"好，给你水！", py:"hǎo, gěi nǐ shuǐ!", en:"OK, here's some water!"}},
        {zh:"我要吃。", py:"wǒ yào chī.", en:"I want to eat.", ok:false}]},
      {npc:{zh:"喝完了，我们比赛吧！", py:"hē wán le, wǒ men bǐ sài ba!", en:"All done? Let's battle!"}},
      {you:[
        {zh:"加油！", py:"jiā yóu!", en:"Let's go!", ok:true, reply:{zh:"好！上坡、下坡，出发！", py:"hǎo! shàng pō, xià pō, chū fā!", en:"OK! Uphill, downhill, here we go!"}},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want to.", ok:false},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false}]}
    ],
    end:{zh:"我的机器人准备好了！", py:"wǒ de jī qì rén zhǔn bèi hǎo le!", en:"My robot is ready!"}
  },

  gym_yosemite: {
    title:{en:"Trail Talk", zh:"去爬山", py:"qù pá shān"},
    who:{name:"Ranger Elm", zh:"艾尔姆", py:"Ài ěr mǔ", role:"gym leader"},
    setting:"Ranger Elm leans on a walking stick beside a roaring waterfall in the valley.",
    turns:[
      {npc:{zh:"你好！你喜欢爬山吗？", py:"nǐ hǎo! nǐ xǐ huan pá shān ma?", en:"Hello! Do you like hiking?"}},
      {you:[
        {zh:"我喜欢爬山！", py:"wǒ xǐ huan pá shān!", en:"I like hiking!", ok:true, reply:{zh:"真好！山上有很多动物！", py:"zhēn hǎo! shān shàng yǒu hěn duō dòng wù!", en:"Great! There are lots of animals in the mountains!"}},
        {zh:"我喜欢爬树！", py:"wǒ xǐ huan pá shù!", en:"I like climbing trees!", ok:false},
        {zh:"我累了。", py:"wǒ lèi le.", en:"I'm tired.", ok:false}]},
      {npc:{zh:"你看到什么了？", py:"nǐ kàn dào shén me le?", en:"What did you see?"}},
      {you:[
        {zh:"我看到一只鹿！", py:"wǒ kàn dào yì zhī lù!", en:"I saw a deer!", ok:true, reply:{zh:"哇，好漂亮！", py:"wā, hǎo piào liang!", en:"Wow, how pretty!"}},
        {zh:"我看到一只熊！", py:"wǒ kàn dào yì zhī xióng!", en:"I saw a bear!", ok:true, reply:{zh:"熊？要小心！", py:"xióng? yào xiǎo xīn!", en:"A bear? Be careful!"}},
        {zh:"我看一只鹿。", py:"wǒ kàn yì zhī lù.", en:"(mixed-up word) I look a deer.", ok:false}]},
      {npc:{zh:"鹿喜欢吃什么？", py:"lù xǐ huan chī shén me?", en:"What do deer like to eat?"}},
      {you:[
        {zh:"它喜欢吃草！", py:"tā xǐ huan chī cǎo!", en:"It likes to eat grass!", ok:true, reply:{zh:"对！你真聪明！", py:"duì! nǐ zhēn cōng ming!", en:"Right! You're so smart!"}},
        {zh:"它喜欢吃肉！", py:"tā xǐ huan chī ròu!", en:"It likes to eat meat!", ok:false},
        {zh:"我不知道。", py:"wǒ bù zhī dào.", en:"I don't know.", ok:false}]},
      {npc:{zh:"准备好了吗？我们比赛吧！", py:"zhǔn bèi hǎo le ma? wǒ men bǐ sài ba!", en:"Ready? Let's battle!"}},
      {you:[
        {zh:"好的！我们开始吧！", py:"hǎo de! wǒ men kāi shǐ ba!", en:"OK! Let's start!", ok:true, reply:{zh:"好！出发！", py:"hǎo! chū fā!", en:"Great! Let's go!"}},
        {zh:"我要回家。", py:"wǒ yào huí jiā.", en:"I want to go home.", ok:false},
        {zh:"我有点儿怕。", py:"wǒ yǒu diǎnr pà.", en:"I'm a little scared.", ok:false}]}
    ],
    end:{zh:"爬到山顶吧！", py:"pá dào shān dǐng ba!", en:"Let's climb to the top!"}
  },

  // ---------- airport, coming home ----------
  airport_home: {
    title:{en:"Flying Home", zh:"回家", py:"huí jiā"},
    who:{name:"Gate Agent", zh:"机场阿姨", py:"jī chǎng ā yí", role:"agent"},
    setting:"At the airport, a smiling agent checks your ticket for the flight home.",
    turns:[
      {npc:{zh:"你好！你们要回家了吗？", py:"nǐ hǎo! nǐ men yào huí jiā le ma?", en:"Hello! Are you heading home?"}},
      {you:[
        {zh:"对！我们回家！", py:"duì! wǒ men huí jiā!", en:"Yes! We're going home!", ok:true, reply:{zh:"在加州玩得开心吗？", py:"zài jiā zhōu wán de kāi xīn ma?", en:"Did you have fun in California?"}},
        {zh:"不是。", py:"bú shì.", en:"No.", ok:false},
        {zh:"我们去玩！", py:"wǒ men qù wán!", en:"We're going to have fun!", ok:false}]},
      {you:[
        {zh:"很开心！", py:"hěn kāi xīn!", en:"So much fun!", ok:true, reply:{zh:"你最喜欢什么？", py:"nǐ zuì xǐ huan shén me?", en:"What did you like best?"}},
        {zh:"不开心。", py:"bù kāi xīn.", en:"Not fun.", ok:false},
        {zh:"很好吃！", py:"hěn hǎo chī!", en:"Very tasty!", ok:false}]},
      {you:[
        {zh:"我喜欢大海！", py:"wǒ xǐ huan dà hǎi!", en:"I liked the ocean!", ok:true, reply:{zh:"大海很美！", py:"dà hǎi hěn měi!", en:"The ocean is beautiful!"}},
        {zh:"我喜欢塔可！", py:"wǒ xǐ huan tǎ kě!", en:"I liked the tacos!", ok:true, reply:{zh:"塔可很好吃！", py:"tǎ kě hěn hǎo chī!", en:"Tacos are so yummy!"}},
        {zh:"我不喜欢。", py:"wǒ bù xǐ huan.", en:"I didn't like it.", ok:false}]},
      {npc:{zh:"你的登机口在这里。", py:"nǐ de dēng jī kǒu zài zhè lǐ.", en:"Your gate is right here."}},
      {you:[
        {zh:"在这里！谢谢！", py:"zài zhè lǐ! xiè xie!", en:"Right here! Thanks!", ok:true, reply:{zh:"不客气！一路平安！", py:"bú kè qi! yí lù píng ān!", en:"You're welcome! Have a safe trip!"}},
        {zh:"在哪里？", py:"zài nǎ lǐ?", en:"Where is it?", ok:false},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false}]}
    ],
    end:{zh:"欢迎再来加州！", py:"huān yíng zài lái jiā zhōu!", en:"Come back to California again!"}
  },

  // ---------- arriving somewhere new ----------
  arrive_sandiego: {
    title:{en:"Taco Time", zh:"吃塔可", py:"chī tǎ kě"},
    who:{name:"Taco Stand Cashier", zh:"卖塔可的叔叔", py:"mài tǎ kě de shū shu", role:"cashier"},
    setting:"A friendly taco stand by the beach smells amazing.",
    turns:[
      {npc:{zh:"你好！你要几个塔可？", py:"nǐ hǎo! nǐ yào jǐ ge tǎ kě?", en:"Hi! How many tacos would you like?"}},
      {you:[
        {zh:"我要两个！", py:"wǒ yào liǎng ge!", en:"I want two!", ok:true, reply:{zh:"好！要辣的吗？", py:"hǎo! yào là de ma?", en:"OK! Do you want them spicy?"}},
        {zh:"我要二个。", py:"wǒ yào èr ge.", en:"(mixed-up word) I want two-number pieces.", ok:false},
        {zh:"我卖两个。", py:"wǒ mài liǎng ge.", en:"I sell two.", ok:false}]},
      {you:[
        {zh:"不要辣的！", py:"bú yào là de!", en:"Not spicy, please!", ok:true, reply:{zh:"好，不辣！", py:"hǎo, bú là!", en:"OK, not spicy!"}},
        {zh:"我要辣的！", py:"wǒ yào là de!", en:"I want them spicy!", ok:true, reply:{zh:"哇，你很勇敢！", py:"wā, nǐ hěn yǒng gǎn!", en:"Wow, you're brave!"}},
        {zh:"我饿了。", py:"wǒ è le.", en:"I'm hungry.", ok:false}]},
      {npc:{zh:"给你！好吃吗？", py:"gěi nǐ! hǎo chī ma?", en:"Here you go! Is it tasty?"}},
      {you:[
        {zh:"好吃！", py:"hǎo chī!", en:"Yummy!", ok:true, reply:{zh:"太好了！", py:"tài hǎo le!", en:"Great!"}},
        {zh:"好喝！", py:"hǎo hē!", en:"Tasty (for drinks)!", ok:false},
        {zh:"不好吃。", py:"bù hǎo chī.", en:"It's not tasty.", ok:false}]},
      {npc:{zh:"你渴吗？要喝什么？", py:"nǐ kě ma? yào hē shén me?", en:"Are you thirsty? What would you like to drink?"}},
      {you:[
        {zh:"我要水，谢谢！", py:"wǒ yào shuǐ, xiè xie!", en:"Water, please! Thanks!", ok:true, reply:{zh:"给你！不客气！", py:"gěi nǐ! bú kè qi!", en:"Here you go! You're welcome!"}},
        {zh:"我要塔可。", py:"wǒ yào tǎ kě.", en:"I want a taco.", ok:false},
        {zh:"我不渴。", py:"wǒ bù kě.", en:"I'm not thirsty.", ok:false}]}
    ],
    end:{zh:"欢迎来圣地亚哥！", py:"huān yíng lái shèng dì yà gē!", en:"Welcome to San Diego!"}
  },

  arrive_losangeles: {
    title:{en:"Where Is the Park?", zh:"公园在哪里？", py:"gōng yuán zài nǎ lǐ?"},
    who:{name:"Kind Local", zh:"热心的阿姨", py:"rè xīn de ā yí", role:"neighbor"},
    setting:"On a sunny Los Angeles street, you ask a kind lady for directions.",
    turns:[
      {npc:{zh:"你好，小朋友！要帮忙吗？", py:"nǐ hǎo, xiǎo péng you! yào bāng máng ma?", en:"Hi there! Do you need help?"}},
      {you:[
        {zh:"公园在哪里？", py:"gōng yuán zài nǎ lǐ?", en:"Where is the park?", ok:true, reply:{zh:"一直走，然后往左。", py:"yì zhí zǒu, rán hòu wǎng zuǒ.", en:"Go straight, then turn left."}},
        {zh:"你在哪里？", py:"nǐ zài nǎ lǐ?", en:"Where are you?", ok:false},
        {zh:"公园是什么？", py:"gōng yuán shì shén me?", en:"What is a park?", ok:false}]},
      {you:[
        {zh:"往左吗？", py:"wǎng zuǒ ma?", en:"To the left?", ok:true, reply:{zh:"对，往左！不是右！", py:"duì, wǎng zuǒ! bú shì yòu!", en:"Yes, left! Not right!"}},
        {zh:"往右吗？", py:"wǎng yòu ma?", en:"To the right?", ok:false},
        {zh:"往上吗？", py:"wǎng shàng ma?", en:"Up?", ok:false}]},
      {you:[
        {zh:"远吗？", py:"yuǎn ma?", en:"Is it far?", ok:true, reply:{zh:"不远，走五分钟。", py:"bù yuǎn, zǒu wǔ fēn zhōng.", en:"Not far, a five-minute walk."}},
        {zh:"近吗？", py:"jìn ma?", en:"Is it close?", ok:true, reply:{zh:"很近，走五分钟。", py:"hěn jìn, zǒu wǔ fēn zhōng.", en:"Very close, a five-minute walk."}},
        {zh:"几点？", py:"jǐ diǎn?", en:"What time?", ok:false}]},
      {you:[
        {zh:"谢谢阿姨！", py:"xiè xie ā yí!", en:"Thank you, ma'am!", ok:true, reply:{zh:"不客气！玩得开心！", py:"bú kè qi! wán de kāi xīn!", en:"You're welcome! Have fun!"}},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false},
        {zh:"对不起。", py:"duì bu qǐ.", en:"I'm sorry.", ok:false}]}
    ],
    end:{zh:"欢迎来洛杉矶！", py:"huān yíng lái luò shān jī!", en:"Welcome to Los Angeles!"}
  },

  arrive_sanfrancisco: {
    title:{en:"Hot Chocolate", zh:"热巧克力", py:"rè qiǎo kè lì"},
    who:{name:"Barista", zh:"咖啡店哥哥", py:"kā fēi diàn gē ge", role:"barista"},
    setting:"In a cozy San Francisco café, the barista leans over the counter to take your order.",
    turns:[
      {npc:{zh:"你好！你要喝什么？", py:"nǐ hǎo! nǐ yào hē shén me?", en:"Hi! What would you like to drink?"}},
      {you:[
        {zh:"我要巧克力！", py:"wǒ yào qiǎo kè lì!", en:"Chocolate, please!", ok:true, reply:{zh:"好！热的还是冷的？", py:"hǎo! rè de hái shi lěng de?", en:"OK! Hot or cold?"}},
        {zh:"我要咖啡！", py:"wǒ yào kā fēi!", en:"Coffee, please!", ok:false},
        {zh:"我卖巧克力。", py:"wǒ mài qiǎo kè lì.", en:"I sell chocolate.", ok:false}]},
      {you:[
        {zh:"热的！", py:"rè de!", en:"Hot, please!", ok:true, reply:{zh:"好。大杯还是小杯？", py:"hǎo. dà bēi hái shi xiǎo bēi?", en:"OK. Big or small?"}},
        {zh:"冷的！", py:"lěng de!", en:"Cold, please!", ok:true, reply:{zh:"好。大杯还是小杯？", py:"hǎo. dà bēi hái shi xiǎo bēi?", en:"OK. Big or small?"}},
        {zh:"好热！", py:"hǎo rè!", en:"It's so hot!", ok:false}]},
      {you:[
        {zh:"小杯，谢谢！", py:"xiǎo bēi, xiè xie!", en:"Small, please! Thanks!", ok:true, reply:{zh:"好的，请等一下。", py:"hǎo de, qǐng děng yí xià.", en:"OK, please wait a moment."}},
        {zh:"大杯，谢谢！", py:"dà bēi, xiè xie!", en:"Big, please! Thanks!", ok:true, reply:{zh:"哇，大杯！请等一下。", py:"wā, dà bēi! qǐng děng yí xià.", en:"Wow, a big one! Please wait a moment."}},
        {zh:"小狗，谢谢！", py:"xiǎo gǒu, xiè xie!", en:"A puppy, please! Thanks!", ok:false}]},
      {npc:{zh:"给你！小心，很烫！", py:"gěi nǐ! xiǎo xīn, hěn tàng!", en:"Here you go! Careful, it's hot!"}},
      {you:[
        {zh:"谢谢！好喝！", py:"xiè xie! hǎo hē!", en:"Thanks! It's delicious!", ok:true, reply:{zh:"不客气！欢迎来旧金山！", py:"bú kè qi! huān yíng lái jiù jīn shān!", en:"You're welcome! Welcome to San Francisco!"}},
        {zh:"谢谢！好吃！", py:"xiè xie! hǎo chī!", en:"Thanks! Yummy (for food)!", ok:false},
        {zh:"不客气！", py:"bú kè qi!", en:"You're welcome!", ok:false}]}
    ],
    end:{zh:"慢慢喝哦！", py:"màn màn hē o!", en:"Sip it slowly!"}
  },

  arrive_yosemite: {
    title:{en:"Welcome to the Park", zh:"欢迎来公园", py:"huān yíng lái gōng yuán"},
    who:{name:"Park Ranger", zh:"护林员", py:"hù lín yuán", role:"ranger"},
    setting:"A park ranger in a wide hat greets you at the trailhead under giant trees.",
    turns:[
      {npc:{zh:"你好！你要去爬山吗？", py:"nǐ hǎo! nǐ yào qù pá shān ma?", en:"Hello! Are you going hiking?"}},
      {you:[
        {zh:"对！我要去爬山！", py:"duì! wǒ yào qù pá shān!", en:"Yes! I'm going hiking!", ok:true, reply:{zh:"你带水了吗？", py:"nǐ dài shuǐ le ma?", en:"Did you bring water?"}},
        {zh:"不是。", py:"bú shì.", en:"No.", ok:false},
        {zh:"我要去游泳。", py:"wǒ yào qù yóu yǒng.", en:"I'm going swimming.", ok:false}]},
      {you:[
        {zh:"我带水了！", py:"wǒ dài shuǐ le!", en:"I brought water!", ok:true, reply:{zh:"很好！爬山要喝水。", py:"hěn hǎo! pá shān yào hē shuǐ.", en:"Good! You need water when you hike."}},
        {zh:"我没带水。", py:"wǒ méi dài shuǐ.", en:"I didn't bring water.", ok:true, reply:{zh:"没关系，给你一瓶！", py:"méi guān xi, gěi nǐ yì píng!", en:"No problem, here's a bottle!"}},
        {zh:"我不带水。", py:"wǒ bú dài shuǐ.", en:"I won't bring water.", ok:false}]},
      {npc:{zh:"小心！这里有熊！", py:"xiǎo xīn! zhè lǐ yǒu xióng!", en:"Be careful! There are bears here!"}},
      {you:[
        {zh:"我有点儿怕。", py:"wǒ yǒu diǎnr pà.", en:"I'm a little scared.", ok:true, reply:{zh:"没关系！别跑，慢慢走。", py:"méi guān xi! bié pǎo, màn màn zǒu.", en:"It's OK! Don't run, just walk slowly."}},
        {zh:"我有点儿饿。", py:"wǒ yǒu diǎnr è.", en:"I'm a little hungry.", ok:false},
        {zh:"我很开心！", py:"wǒ hěn kāi xīn!", en:"I'm so happy!", ok:false}]},
      {you:[
        {zh:"好的，谢谢！", py:"hǎo de, xiè xie!", en:"OK, thank you!", ok:true, reply:{zh:"不客气！玩得开心！", py:"bú kè qi! wán de kāi xīn!", en:"You're welcome! Have fun!"}},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false}]}
    ],
    end:{zh:"欢迎来优胜美地！", py:"huān yíng lái yōu shèng měi dì!", en:"Welcome to Yosemite!"}
  },

  arrive_starveil: {
    title:{en:"Under the Stars", zh:"星空下", py:"xīng kōng xià"},
    who:{name:"Starry Traveler", zh:"星星旅人", py:"xīng xing lǚ rén", role:"traveler"},
    setting:"Through the rift, a gentle traveler made of soft starlight drifts over to you.",
    turns:[
      {npc:{zh:"你好……你从哪里来？", py:"nǐ hǎo… nǐ cóng nǎ lǐ lái?", en:"Hello... where did you come from?"}},
      {you:[
        {zh:"我从家里来。", py:"wǒ cóng jiā lǐ lái.", en:"I came from home.", ok:true, reply:{zh:"家？好远啊。", py:"jiā? hǎo yuǎn a.", en:"Home? That's so far away."}},
        {zh:"我去家里。", py:"wǒ qù jiā lǐ.", en:"I'm going home.", ok:false},
        {zh:"我在这里！", py:"wǒ zài zhè lǐ!", en:"I'm here!", ok:false}]},
      {npc:{zh:"你迷路了吗？", py:"nǐ mí lù le ma?", en:"Are you lost?"}},
      {you:[
        {zh:"没有，我不怕！", py:"méi yǒu, wǒ bú pà!", en:"No, I'm not scared!", ok:true, reply:{zh:"你真勇敢。", py:"nǐ zhēn yǒng gǎn.", en:"You're very brave."}},
        {zh:"我有点儿怕。", py:"wǒ yǒu diǎnr pà.", en:"I'm a little scared.", ok:true, reply:{zh:"别怕，我在这里。", py:"bié pà, wǒ zài zhè lǐ.", en:"Don't be scared. I'm here."}},
        {zh:"我饿了。", py:"wǒ è le.", en:"I'm hungry.", ok:false}]},
      {npc:{zh:"你看，星星！", py:"nǐ kàn, xīng xing!", en:"Look, stars!"}},
      {you:[
        {zh:"哇，好多星星！", py:"wā, hǎo duō xīng xing!", en:"Wow, so many stars!", ok:true, reply:{zh:"每颗星星都在笑。", py:"měi kē xīng xing dōu zài xiào.", en:"Every star is smiling."}},
        {zh:"哇，好多猫！", py:"wā, hǎo duō māo!", en:"Wow, so many cats!", ok:false},
        {zh:"好冷！", py:"hǎo lěng!", en:"So cold!", ok:false}]},
      {you:[
        {zh:"我喜欢这里！", py:"wǒ xǐ huan zhè lǐ!", en:"I like it here!", ok:true, reply:{zh:"星星也喜欢你。", py:"xīng xing yě xǐ huan nǐ.", en:"The stars like you too."}},
        {zh:"我不喜欢。", py:"wǒ bù xǐ huan.", en:"I don't like it.", ok:false},
        {zh:"在这里！", py:"zài zhè lǐ!", en:"Right here!", ok:false}]}
    ],
    end:{zh:"慢慢走，小朋友。", py:"màn màn zǒu, xiǎo péng you.", en:"Go gently, little friend."}
  },

  // ---------- visitors at the door ----------
  visit_weather: {
    title:{en:"What's the Weather?", zh:"天气怎么样？", py:"tiān qì zěn me yàng?"},
    who:{name:"Grandpa Next Door", zh:"邻居爷爷", py:"lín jū yé ye", role:"neighbor"},
    setting:"Knock knock! The grandpa from next door is at the door with a big umbrella.",
    turns:[
      {npc:{zh:"你好！今天天气怎么样？", py:"nǐ hǎo! jīn tiān tiān qì zěn me yàng?", en:"Hello! How's the weather today?"}},
      {you:[
        {zh:"今天下雨了。", py:"jīn tiān xià yǔ le.", en:"It's raining today.", ok:true, reply:{zh:"对，我带了伞。", py:"duì, wǒ dài le sǎn.", en:"Yes, I brought an umbrella."}},
        {zh:"今天很热。", py:"jīn tiān hěn rè.", en:"It's hot today.", ok:false},
        {zh:"今天星期六。", py:"jīn tiān xīng qī liù.", en:"Today is Saturday.", ok:false}]},
      {npc:{zh:"下雨天你做什么？", py:"xià yǔ tiān nǐ zuò shén me?", en:"What do you do on rainy days?"}},
      {you:[
        {zh:"我在家玩！", py:"wǒ zài jiā wán!", en:"I play at home!", ok:true, reply:{zh:"在家玩很好！", py:"zài jiā wán hěn hǎo!", en:"Playing at home is great!"}},
        {zh:"我去游泳！", py:"wǒ qù yóu yǒng!", en:"I go swimming!", ok:false},
        {zh:"我很好！", py:"wǒ hěn hǎo!", en:"I'm great!", ok:false}]},
      {npc:{zh:"明天会晴天！", py:"míng tiān huì qíng tiān!", en:"Tomorrow will be sunny!"}},
      {you:[
        {zh:"太好了！", py:"tài hǎo le!", en:"Great!", ok:true, reply:{zh:"给你一个果子！", py:"gěi nǐ yí ge guǒ zi!", en:"Here's a berry for you!"}},
        {zh:"太冷了！", py:"tài lěng le!", en:"Too cold!", ok:false},
        {zh:"不好。", py:"bù hǎo.", en:"Not good.", ok:false}]},
      {you:[
        {zh:"谢谢爷爷！", py:"xiè xie yé ye!", en:"Thank you, Grandpa!", ok:true, reply:{zh:"不客气！再见！", py:"bú kè qi! zài jiàn!", en:"You're welcome! Bye!"}},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false},
        {zh:"对不起。", py:"duì bu qǐ.", en:"I'm sorry.", ok:false}]}
    ],
    end:{zh:"小心，别淋湿了！", py:"xiǎo xīn, bié lín shī le!", en:"Careful, don't get wet!"},
    reward:{berry:1}
  },

  visit_time: {
    title:{en:"What Time Is It?", zh:"现在几点？", py:"xiàn zài jǐ diǎn?"},
    who:{name:"Delivery Man", zh:"快递叔叔", py:"kuài dì shū shu", role:"neighbor"},
    setting:"The delivery man knocks with a package, but his watch has stopped.",
    turns:[
      {npc:{zh:"你好！有你的包裹！", py:"nǐ hǎo! yǒu nǐ de bāo guǒ!", en:"Hi! There's a package for you!"}},
      {you:[
        {zh:"谢谢叔叔！", py:"xiè xie shū shu!", en:"Thank you, sir!", ok:true, reply:{zh:"小朋友，现在几点？", py:"xiǎo péng you, xiàn zài jǐ diǎn?", en:"Kiddo, what time is it now?"}},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false}]},
      {you:[
        {zh:"现在四点。", py:"xiàn zài sì diǎn.", en:"It's four o'clock.", ok:true, reply:{zh:"四点了！我要快点儿！", py:"sì diǎn le! wǒ yào kuài diǎnr!", en:"Four already! I need to hurry!"}},
        {zh:"现在十点。", py:"xiàn zài shí diǎn.", en:"It's ten o'clock.", ok:false},
        {zh:"现在四岁。", py:"xiàn zài sì suì.", en:"(mixed-up word) Now four years old.", ok:false}]},
      {npc:{zh:"你几点吃晚饭？", py:"nǐ jǐ diǎn chī wǎn fàn?", en:"What time do you eat dinner?"}},
      {you:[
        {zh:"六点。", py:"liù diǎn.", en:"At six.", ok:true, reply:{zh:"我也是六点！", py:"wǒ yě shì liù diǎn!", en:"Me too, at six!"}},
        {zh:"六个。", py:"liù ge.", en:"Six of them.", ok:false},
        {zh:"我饿了。", py:"wǒ è le.", en:"I'm hungry.", ok:false}]},
      {npc:{zh:"拿好，再见！", py:"ná hǎo, zài jiàn!", en:"Hold on to it! Bye!"}},
      {you:[
        {zh:"叔叔再见！", py:"shū shu zài jiàn!", en:"Bye, sir!", ok:true, reply:{zh:"再见，小朋友！", py:"zài jiàn, xiǎo péng you!", en:"Bye, kiddo!"}},
        {zh:"叔叔你好！", py:"shū shu nǐ hǎo!", en:"Hello, sir!", ok:false},
        {zh:"晚安！", py:"wǎn ān!", en:"Good night!", ok:false}]}
    ],
    end:{zh:"包裹里有能量球哦！", py:"bāo guǒ lǐ yǒu néng liàng qiú o!", en:"There are energy orbs in the package!"},
    reward:{orb:3}
  },

  visit_shopping: {
    title:{en:"Going Shopping", zh:"去买东西", py:"qù mǎi dōng xi"},
    who:{name:"Auntie Wang", zh:"王阿姨", py:"Wáng ā yí", role:"neighbor"},
    setting:"Auntie Wang is heading to the store and asks if you need anything.",
    turns:[
      {npc:{zh:"我去买东西。你要什么？", py:"wǒ qù mǎi dōng xi. nǐ yào shén me?", en:"I'm going shopping. What do you want?"}},
      {you:[
        {zh:"我要苹果！", py:"wǒ yào píng guǒ!", en:"I want apples!", ok:true, reply:{zh:"好！要几个？", py:"hǎo! yào jǐ ge?", en:"OK! How many?"}},
        {zh:"我卖苹果！", py:"wǒ mài píng guǒ!", en:"I sell apples!", ok:false},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want anything.", ok:false}]},
      {you:[
        {zh:"三个，谢谢！", py:"sān ge, xiè xie!", en:"Three, please!", ok:true, reply:{zh:"好，三个苹果。还要别的吗？", py:"hǎo, sān ge píng guǒ. hái yào bié de ma?", en:"OK, three apples. Anything else?"}},
        {zh:"三岁，谢谢！", py:"sān suì, xiè xie!", en:"Three years old, thanks!", ok:false},
        {zh:"三点，谢谢！", py:"sān diǎn, xiè xie!", en:"Three o'clock, thanks!", ok:false}]},
      {you:[
        {zh:"我要牛奶！", py:"wǒ yào niú nǎi!", en:"I want milk!", ok:true, reply:{zh:"好，牛奶！", py:"hǎo, niú nǎi!", en:"OK, milk!"}},
        {zh:"不要了，谢谢！", py:"bú yào le, xiè xie!", en:"Nothing else, thanks!", ok:true, reply:{zh:"好的！", py:"hǎo de!", en:"OK!"}},
        {zh:"我渴了。", py:"wǒ kě le.", en:"I'm thirsty.", ok:false}]},
      {you:[
        {zh:"多少钱？", py:"duō shao qián?", en:"How much is it?", ok:true, reply:{zh:"不贵！阿姨请你！", py:"bú guì! ā yí qǐng nǐ!", en:"It's cheap! It's my treat!"}},
        {zh:"几钱？", py:"jǐ qián?", en:"(mixed-up word) How-few money?", ok:false},
        {zh:"几点？", py:"jǐ diǎn?", en:"What time?", ok:false}]},
      {you:[
        {zh:"谢谢阿姨！", py:"xiè xie ā yí!", en:"Thank you, Auntie!", ok:true, reply:{zh:"不客气！一会儿见！", py:"bú kè qi! yí huìr jiàn!", en:"You're welcome! See you soon!"}},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false},
        {zh:"对不起。", py:"duì bu qǐ.", en:"I'm sorry.", ok:false}]}
    ],
    end:{zh:"我很快回来！", py:"wǒ hěn kuài huí lái!", en:"I'll be right back!"},
    reward:{orb:3}
  },

  visit_family: {
    title:{en:"Family Photo", zh:"全家福", py:"quán jiā fú"},
    who:{name:"Dudu", zh:"嘟嘟", py:"Dū du", role:"kid"},
    setting:"The kid from next door runs over with a family photo to show you.",
    turns:[
      {npc:{zh:"你好！你看，我的家人！", py:"nǐ hǎo! nǐ kàn, wǒ de jiā rén!", en:"Hi! Look, my family!"}},
      {you:[
        {zh:"这是谁？", py:"zhè shì shéi?", en:"Who is this?", ok:true, reply:{zh:"这是我妈妈！", py:"zhè shì wǒ mā ma!", en:"This is my mom!"}},
        {zh:"这是什么？", py:"zhè shì shén me?", en:"What is this?", ok:false},
        {zh:"在哪里？", py:"zài nǎ lǐ?", en:"Where is it?", ok:false}]},
      {you:[
        {zh:"她很漂亮！", py:"tā hěn piào liang!", en:"She's very pretty!", ok:true, reply:{zh:"谢谢！这是我爸爸。", py:"xiè xie! zhè shì wǒ bà ba.", en:"Thanks! This is my dad."}},
        {zh:"她很饿！", py:"tā hěn è!", en:"She's very hungry!", ok:false},
        {zh:"我很好！", py:"wǒ hěn hǎo!", en:"I'm great!", ok:false}]},
      {you:[
        {zh:"他很高！", py:"tā hěn gāo!", en:"He's very tall!", ok:true, reply:{zh:"对！还有我的小狗！", py:"duì! hái yǒu wǒ de xiǎo gǒu!", en:"Yes! And here's my puppy!"}},
        {zh:"他很矮！", py:"tā hěn ǎi!", en:"He's very short!", ok:false},
        {zh:"他十岁！", py:"tā shí suì!", en:"He's ten!", ok:false}]},
      {you:[
        {zh:"好可爱！", py:"hǎo kě ài!", en:"So cute!", ok:true, reply:{zh:"它叫豆豆！", py:"tā jiào Dòu dou!", en:"Its name is Doudou!"}},
        {zh:"好吃！", py:"hǎo chī!", en:"Yummy!", ok:false},
        {zh:"好冷！", py:"hǎo lěng!", en:"So cold!", ok:false}]},
      {npc:{zh:"我们是好朋友！", py:"wǒ men shì hǎo péng you!", en:"We're good friends!"}},
      {you:[
        {zh:"对！好朋友！", py:"duì! hǎo péng you!", en:"Yes! Good friends!", ok:true, reply:{zh:"送给你，好朋友！", py:"sòng gěi nǐ, hǎo péng you!", en:"This is for you, good friend!"}},
        {zh:"不是。", py:"bú shì.", en:"No.", ok:false},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false}]}
    ],
    end:{zh:"下次来我家玩！", py:"xià cì lái wǒ jiā wán!", en:"Come play at my house next time!"},
    reward:{orb:3}
  },

  visit_hobby: {
    title:{en:"Let's Sing!", zh:"一起唱歌", py:"yì qǐ chàng gē"},
    who:{name:"Big Sister Next Door", zh:"邻居姐姐", py:"lín jū jiě jie", role:"neighbor"},
    setting:"The big sister from next door stops by with her guitar.",
    turns:[
      {npc:{zh:"你好！你喜欢唱歌吗？", py:"nǐ hǎo! nǐ xǐ huan chàng gē ma?", en:"Hi! Do you like singing?"}},
      {you:[
        {zh:"我喜欢唱歌！", py:"wǒ xǐ huan chàng gē!", en:"I like singing!", ok:true, reply:{zh:"我们一起唱吧！", py:"wǒ men yì qǐ chàng ba!", en:"Let's sing together!"}},
        {zh:"我喜欢吃饭。", py:"wǒ xǐ huan chī fàn.", en:"I like eating.", ok:false},
        {zh:"我不知道。", py:"wǒ bù zhī dào.", en:"I don't know.", ok:false}]},
      {you:[
        {zh:"好的！", py:"hǎo de!", en:"OK!", ok:true, reply:{zh:"啦啦啦！", py:"lā lā lā!", en:"La la la!"}},
        {zh:"不要。", py:"bú yào.", en:"No.", ok:false},
        {zh:"我累了。", py:"wǒ lèi le.", en:"I'm tired.", ok:false}]},
      {npc:{zh:"你还喜欢做什么？", py:"nǐ hái xǐ huan zuò shén me?", en:"What else do you like to do?"}},
      {you:[
        {zh:"我喜欢跳舞！", py:"wǒ xǐ huan tiào wǔ!", en:"I like dancing!", ok:true, reply:{zh:"我也喜欢跳舞！", py:"wǒ yě xǐ huan tiào wǔ!", en:"I like dancing too!"}},
        {zh:"我喜欢画画。", py:"wǒ xǐ huan huà huà.", en:"I like to draw.", ok:true, reply:{zh:"画画也很好！", py:"huà huà yě hěn hǎo!", en:"Drawing is great too!"}},
        {zh:"我喜欢睡觉。", py:"wǒ xǐ huan shuì jiào.", en:"I like sleeping.", ok:false}]},
      {npc:{zh:"你唱得真好！", py:"nǐ chàng de zhēn hǎo!", en:"You sing really well!"}},
      {you:[
        {zh:"谢谢姐姐！", py:"xiè xie jiě jie!", en:"Thank you, big sister!", ok:true, reply:{zh:"不客气！这个给你！", py:"bú kè qi! zhè ge gěi nǐ!", en:"You're welcome! This is for you!"}},
        {zh:"不客气。", py:"bú kè qi.", en:"You're welcome.", ok:false},
        {zh:"对不起。", py:"duì bu qǐ.", en:"I'm sorry.", ok:false}]}
    ],
    end:{zh:"明天再一起唱！", py:"míng tiān zài yì qǐ chàng!", en:"Let's sing together again tomorrow!"},
    reward:{orb:3}
  },

  visit_food: {
    title:{en:"Dumplings!", zh:"吃饺子", py:"chī jiǎo zi"},
    who:{name:"Uncle Next Door", zh:"邻居叔叔", py:"lín jū shū shu", role:"neighbor"},
    setting:"The uncle from next door brings over a warm plate of dumplings.",
    turns:[
      {npc:{zh:"你好！你饿不饿？", py:"nǐ hǎo! nǐ è bu è?", en:"Hi! Are you hungry?"}},
      {you:[
        {zh:"我饿了！", py:"wǒ è le!", en:"I'm hungry!", ok:true, reply:{zh:"我做了饺子！", py:"wǒ zuò le jiǎo zi!", en:"I made dumplings!"}},
        {zh:"我渴了。", py:"wǒ kě le.", en:"I'm thirsty.", ok:false},
        {zh:"我不饿。", py:"wǒ bú è.", en:"I'm not hungry.", ok:false}]},
      {npc:{zh:"你要几个？", py:"nǐ yào jǐ ge?", en:"How many do you want?"}},
      {you:[
        {zh:"我要五个！", py:"wǒ yào wǔ ge!", en:"I want five!", ok:true, reply:{zh:"好！五个饺子！", py:"hǎo! wǔ ge jiǎo zi!", en:"OK! Five dumplings!"}},
        {zh:"我要五岁！", py:"wǒ yào wǔ suì!", en:"I want five years old!", ok:false},
        {zh:"我要多少？", py:"wǒ yào duō shao?", en:"How many do I want?", ok:false}]},
      {npc:{zh:"好吃吗？", py:"hǎo chī ma?", en:"Is it tasty?"}},
      {you:[
        {zh:"好吃！太好吃了！", py:"hǎo chī! tài hǎo chī le!", en:"Yummy! Super yummy!", ok:true, reply:{zh:"哈哈，慢慢吃！", py:"hā hā, màn màn chī!", en:"Ha ha, eat slowly!"}},
        {zh:"好喝！", py:"hǎo hē!", en:"Tasty (for drinks)!", ok:false},
        {zh:"不好吃。", py:"bù hǎo chī.", en:"It's not tasty.", ok:false}]},
      {you:[
        {zh:"我还要！", py:"wǒ hái yào!", en:"I want more!", ok:true, reply:{zh:"好！再给你两个！", py:"hǎo! zài gěi nǐ liǎng ge!", en:"OK! Here are two more!"}},
        {zh:"我饱了。", py:"wǒ bǎo le.", en:"I'm full.", ok:true, reply:{zh:"好，吃饱了就好！", py:"hǎo, chī bǎo le jiù hǎo!", en:"OK, as long as you're full!"}},
        {zh:"你还要！", py:"nǐ hái yào!", en:"You want more!", ok:false}]}
    ],
    end:{zh:"吃饱了，好好玩！", py:"chī bǎo le, hǎo hǎo wán!", en:"Now that you're full, have fun!"},
    reward:{berry:2}
  },

  visit_birthday: {
    title:{en:"Happy Birthday!", zh:"生日快乐！", py:"shēng rì kuài lè!"},
    who:{name:"Tiantian", zh:"甜甜", py:"Tián tian", role:"kid"},
    setting:"A neighbor kid in a party hat knocks, holding a slice of cake.",
    turns:[
      {npc:{zh:"你好！今天是我的生日！", py:"nǐ hǎo! jīn tiān shì wǒ de shēng rì!", en:"Hi! Today is my birthday!"}},
      {you:[
        {zh:"生日快乐！", py:"shēng rì kuài lè!", en:"Happy birthday!", ok:true, reply:{zh:"谢谢！我九岁了！", py:"xiè xie! wǒ jiǔ suì le!", en:"Thanks! I'm nine now!"}},
        {zh:"新年快乐！", py:"xīn nián kuài lè!", en:"Happy New Year!", ok:false},
        {zh:"生日好！", py:"shēng rì hǎo!", en:"(not quite) Birthday good!", ok:false}]},
      {npc:{zh:"你几岁？", py:"nǐ jǐ suì?", en:"How old are you?"}},
      {you:[
        {zh:"我十岁。", py:"wǒ shí suì.", en:"I'm ten.", ok:true, reply:{zh:"我比你大一岁！", py:"wǒ bǐ nǐ dà yí suì!", en:"I'm one year older than you!"}},
        {zh:"我十点。", py:"wǒ shí diǎn.", en:"(mixed-up word) I'm ten o'clock.", ok:false},
        {zh:"我很好。", py:"wǒ hěn hǎo.", en:"I'm fine.", ok:false}]},
      {you:[
        {zh:"今天几号？", py:"jīn tiān jǐ hào?", en:"What's the date today?", ok:true, reply:{zh:"今天五月十号！", py:"jīn tiān wǔ yuè shí hào!", en:"Today is May tenth!"}},
        {zh:"今天多少号？", py:"jīn tiān duō shao hào?", en:"(mixed-up word) Today how-much date?", ok:false},
        {zh:"现在几点？", py:"xiàn zài jǐ diǎn?", en:"What time is it now?", ok:false}]},
      {npc:{zh:"你吃蛋糕吗？", py:"nǐ chī dàn gāo ma?", en:"Do you want some cake?"}},
      {you:[
        {zh:"我要！谢谢！", py:"wǒ yào! xiè xie!", en:"Yes, please! Thanks!", ok:true, reply:{zh:"给你一大块！", py:"gěi nǐ yí dà kuài!", en:"Here's a big piece!"}},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want any.", ok:false},
        {zh:"我是蛋糕！", py:"wǒ shì dàn gāo!", en:"I'm a cake!", ok:false}]}
    ],
    end:{zh:"我们一起唱生日歌！", py:"wǒ men yì qǐ chàng shēng rì gē!", en:"Let's sing the birthday song together!"},
    reward:{berry:2}
  },

  visit_lost: {
    title:{en:"Lost Kitten", zh:"小猫不见了", py:"xiǎo māo bú jiàn le"},
    who:{name:"Kitten's Owner", zh:"小猫的主人", py:"xiǎo māo de zhǔ rén", role:"neighbor"},
    setting:"A worried neighbor knocks: her little kitten is missing!",
    turns:[
      {npc:{zh:"你好！我的小猫不见了！", py:"nǐ hǎo! wǒ de xiǎo māo bú jiàn le!", en:"Hello! My kitten is missing!"}},
      {you:[
        {zh:"什么颜色？", py:"shén me yán sè?", en:"What color is it?", ok:true, reply:{zh:"白色的，很小。", py:"bái sè de, hěn xiǎo.", en:"White, and very small."}},
        {zh:"几岁？", py:"jǐ suì?", en:"How old?", ok:false},
        {zh:"你好吗？", py:"nǐ hǎo ma?", en:"How are you?", ok:false}]},
      {npc:{zh:"你看到它了吗？", py:"nǐ kàn dào tā le ma?", en:"Have you seen it?"}},
      {you:[
        {zh:"我没看到。", py:"wǒ méi kàn dào.", en:"I didn't see it.", ok:true, reply:{zh:"哎呀，它在哪里？", py:"āi yā, tā zài nǎ lǐ?", en:"Oh dear, where is it?"}},
        {zh:"我不看到。", py:"wǒ bú kàn dào.", en:"(mixed-up word) I not-see it.", ok:false},
        {zh:"我看到了！", py:"wǒ kàn dào le!", en:"I saw it!", ok:false}]},
      {npc:{zh:"听！喵喵！", py:"tīng! miāo miāo!", en:"Listen! Meow, meow!"}},
      {you:[
        {zh:"在这里！", py:"zài zhè lǐ!", en:"It's here!", ok:true, reply:{zh:"太好了！谢谢你！", py:"tài hǎo le! xiè xie nǐ!", en:"Hooray! Thank you!"}},
        {zh:"在哪里？", py:"zài nǎ lǐ?", en:"Where is it?", ok:false},
        {zh:"不在这里。", py:"bú zài zhè lǐ.", en:"It's not here.", ok:false}]},
      {you:[
        {zh:"不客气！", py:"bú kè qi!", en:"You're welcome!", ok:true, reply:{zh:"你真是好孩子！", py:"nǐ zhēn shì hǎo hái zi!", en:"You're such a good kid!"}},
        {zh:"谢谢！", py:"xiè xie!", en:"Thank you!", ok:false},
        {zh:"对不起。", py:"duì bu qǐ.", en:"I'm sorry.", ok:false}]}
    ],
    end:{zh:"小猫说：谢谢！喵！", py:"xiǎo māo shuō: xiè xie! miāo!", en:"The kitten says: thank you! Meow!"},
    reward:{orb:4}
  },

  visit_health: {
    title:{en:"How Do You Feel?", zh:"你累吗？", py:"nǐ lèi ma?"},
    who:{name:"Doctor Next Door", zh:"医生阿姨", py:"yī shēng ā yí", role:"neighbor"},
    setting:"The doctor who lives down the street stops by to check on you.",
    turns:[
      {npc:{zh:"你好！你今天好吗？", py:"nǐ hǎo! nǐ jīn tiān hǎo ma?", en:"Hi! How are you today?"}},
      {you:[
        {zh:"我有点儿累。", py:"wǒ yǒu diǎnr lèi.", en:"I'm a little tired.", ok:true, reply:{zh:"玩了很久吧？", py:"wán le hěn jiǔ ba?", en:"You played a long time, huh?"}},
        {zh:"我有点儿冷。", py:"wǒ yǒu diǎnr lěng.", en:"I'm a little cold.", ok:false},
        {zh:"你好吗？", py:"nǐ hǎo ma?", en:"How are you?", ok:false}]},
      {you:[
        {zh:"对！我玩了很久！", py:"duì! wǒ wán le hěn jiǔ!", en:"Yes! I played a long time!", ok:true, reply:{zh:"休息一下吧！", py:"xiū xi yí xià ba!", en:"Take a little rest!"}},
        {zh:"我睡了很久。", py:"wǒ shuì le hěn jiǔ.", en:"I slept a long time.", ok:false},
        {zh:"不是。", py:"bú shì.", en:"No.", ok:false}]},
      {npc:{zh:"你饿吗？渴吗？", py:"nǐ è ma? kě ma?", en:"Are you hungry? Thirsty?"}},
      {you:[
        {zh:"我渴了。", py:"wǒ kě le.", en:"I'm thirsty.", ok:true, reply:{zh:"多喝水，好吗？", py:"duō hē shuǐ, hǎo ma?", en:"Drink lots of water, OK?"}},
        {zh:"我饿了。", py:"wǒ è le.", en:"I'm hungry.", ok:true, reply:{zh:"吃点儿水果，好吗？", py:"chī diǎnr shuǐ guǒ, hǎo ma?", en:"Have some fruit, OK?"}},
        {zh:"我热了。", py:"wǒ rè le.", en:"I'm getting hot.", ok:false}]},
      {you:[
        {zh:"好的！", py:"hǎo de!", en:"OK!", ok:true, reply:{zh:"真乖！", py:"zhēn guāi!", en:"Good kid!"}},
        {zh:"不要！", py:"bú yào!", en:"No!", ok:false},
        {zh:"再见！", py:"zài jiàn!", en:"Goodbye!", ok:false}]}
    ],
    end:{zh:"早点儿睡觉哦！晚安！", py:"zǎo diǎnr shuì jiào o! wǎn ān!", en:"Get to bed early! Good night!"},
    reward:{berry:1}
  },

  visit_play: {
    title:{en:"Let's Play!", zh:"一起玩吧！", py:"yì qǐ wán ba!"},
    who:{name:"Lele", zh:"乐乐", py:"Lè le", role:"friend"},
    setting:"Your friend Lele is at the door with a ball.",
    turns:[
      {npc:{zh:"嘿！我们一起玩吧！", py:"hēi! wǒ men yì qǐ wán ba!", en:"Hey! Let's play together!"}},
      {you:[
        {zh:"好啊！玩什么？", py:"hǎo a! wán shén me?", en:"Sure! What should we play?", ok:true, reply:{zh:"我们踢球吧！", py:"wǒ men tī qiú ba!", en:"Let's kick the ball!"}},
        {zh:"我不要。", py:"wǒ bú yào.", en:"I don't want to.", ok:false},
        {zh:"我们一起玩吧！", py:"wǒ men yì qǐ wán ba!", en:"Let's play together!", ok:false}]},
      {you:[
        {zh:"好！我喜欢踢球！", py:"hǎo! wǒ xǐ huan tī qiú!", en:"OK! I love kicking the ball!", ok:true, reply:{zh:"你先来！", py:"nǐ xiān lái!", en:"You go first!"}},
        {zh:"我喜欢吃球。", py:"wǒ xǐ huan chī qiú.", en:"I like eating balls.", ok:false},
        {zh:"我不会踢球。", py:"wǒ bú huì tī qiú.", en:"I can't kick a ball.", ok:false}]},
      {npc:{zh:"踢！哇，好球！", py:"tī! wā, hǎo qiú!", en:"Kick! Wow, nice shot!"}},
      {you:[
        {zh:"轮到你了！", py:"lún dào nǐ le!", en:"Your turn!", ok:true, reply:{zh:"好！看我的！", py:"hǎo! kàn wǒ de!", en:"OK! Watch me!"}},
        {zh:"轮到我了！", py:"lún dào wǒ le!", en:"My turn!", ok:false},
        {zh:"好吃！", py:"hǎo chī!", en:"Yummy!", ok:false}]},
      {npc:{zh:"我累了。我们休息吧！", py:"wǒ lèi le. wǒ men xiū xi ba!", en:"I'm tired. Let's take a break!"}},
      {you:[
        {zh:"我也累了。", py:"wǒ yě lèi le.", en:"I'm tired too.", ok:true, reply:{zh:"喝点儿水吧！", py:"hē diǎnr shuǐ ba!", en:"Let's drink some water!"}},
        {zh:"我不累！", py:"wǒ bú lèi!", en:"I'm not tired!", ok:true, reply:{zh:"哇，你真厉害！", py:"wā, nǐ zhēn lì hai!", en:"Wow, you're amazing!"}},
        {zh:"我也饿了。", py:"wǒ yě è le.", en:"I'm hungry too.", ok:false}]},
      {you:[
        {zh:"明天再玩！", py:"míng tiān zài wán!", en:"Let's play again tomorrow!", ok:true, reply:{zh:"好！明天见！", py:"hǎo! míng tiān jiàn!", en:"OK! See you tomorrow!"}},
        {zh:"昨天再玩！", py:"zuó tiān zài wán!", en:"Let's play again yesterday!", ok:false},
        {zh:"晚安！", py:"wǎn ān!", en:"Good night!", ok:false}]}
    ],
    end:{zh:"今天真好玩！", py:"jīn tiān zhēn hǎo wán!", en:"Today was so much fun!"},
    reward:{orb:3}
  }

});
