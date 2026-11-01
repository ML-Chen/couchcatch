// Everyday Mandarin phrases for a young beginner, taught audio-first (listen, say it out loud, hear it, say it again).
// Original phrasebook. Order = teaching order. Each phrase is built up from its end in small pieces (backward build-up).
// fields: zh, py, en (the English cue), pic (emoji), build: [[zh,py],...] pieces from the end of the phrase, unit
const PHRASEBOOK=[
 // Unit 1 — hello
 {unit:1,zh:'你好！',py:'nǐ hǎo!',en:'Hello!',pic:'👋',build:[['好','hǎo'],['你好','nǐ hǎo']]},
 {unit:1,zh:'谢谢！',py:'xièxie!',en:'Thank you!',pic:'🙏',build:[]},
 {unit:1,zh:'不客气。',py:'bú kèqi.',en:"You're welcome.",pic:'😊',build:[['客气','kèqi'],['不客气','bú kèqi']]},
 {unit:1,zh:'再见！',py:'zàijiàn!',en:'Goodbye!',pic:'👋',build:[['见','jiàn'],['再见','zàijiàn']]},
 {unit:1,zh:'你好吗？',py:'nǐ hǎo ma?',en:'How are you?',pic:'🙂',build:[['吗','ma'],['好吗','hǎo ma'],['你好吗','nǐ hǎo ma']]},
 {unit:1,zh:'我很好！',py:'wǒ hěn hǎo!',en:"I'm good!",pic:'😄',build:[['很好','hěn hǎo'],['我很好','wǒ hěn hǎo']]},
 {unit:1,zh:'你呢？',py:'nǐ ne?',en:'And you?',pic:'👉',build:[]},
 // Unit 2 — me
 {unit:2,zh:'你叫什么名字？',py:'nǐ jiào shénme míngzi?',en:"What's your name?",pic:'🏷️',build:[['名字','míngzi'],['什么名字','shénme míngzi'],['你叫什么名字','nǐ jiào shénme míngzi']]},
 {unit:2,zh:'我叫小美。',py:'wǒ jiào Xiǎoměi.',en:"My name is Xiaomei.",pic:'🙋‍♀️',build:[['小美','Xiǎoměi'],['我叫小美','wǒ jiào Xiǎoměi']]},
 {unit:2,zh:'你几岁？',py:'nǐ jǐ suì?',en:'How old are you?',pic:'🎂',build:[['几岁','jǐ suì'],['你几岁','nǐ jǐ suì']]},
 {unit:2,zh:'我十岁。',py:'wǒ shí suì.',en:"I'm ten.",pic:'🔟',build:[['十岁','shí suì'],['我十岁','wǒ shí suì']]},
 {unit:2,zh:'很高兴认识你！',py:'hěn gāoxìng rènshi nǐ!',en:'Nice to meet you!',pic:'🤝',build:[['认识你','rènshi nǐ'],['高兴认识你','gāoxìng rènshi nǐ'],['很高兴认识你','hěn gāoxìng rènshi nǐ']]},
 // Unit 3 — I want
 {unit:3,zh:'我要水。',py:'wǒ yào shuǐ.',en:'I want water.',pic:'💧',build:[['水','shuǐ'],['要水','yào shuǐ'],['我要水','wǒ yào shuǐ']]},
 {unit:3,zh:'我要这个。',py:'wǒ yào zhège.',en:'I want this one.',pic:'👇',build:[['这个','zhège'],['我要这个','wǒ yào zhège']]},
 {unit:3,zh:'我不要。',py:'wǒ bú yào.',en:"I don't want it.",pic:'🙅',build:[['不要','bú yào'],['我不要','wǒ bú yào']]},
 {unit:3,zh:'我饿了。',py:'wǒ è le.',en:"I'm hungry.",pic:'🍽️',build:[['饿了','è le'],['我饿了','wǒ è le']]},
 {unit:3,zh:'我渴了。',py:'wǒ kě le.',en:"I'm thirsty.",pic:'🥤',build:[['渴了','kě le'],['我渴了','wǒ kě le']]},
 {unit:3,zh:'好吃！',py:'hǎo chī!',en:'Yummy!',pic:'😋',build:[]},
 {unit:3,zh:'请给我一个苹果。',py:'qǐng gěi wǒ yí ge píngguǒ.',en:'Please give me an apple.',pic:'🍎',build:[['苹果','píngguǒ'],['一个苹果','yí ge píngguǒ'],['给我一个苹果','gěi wǒ yí ge píngguǒ'],['请给我一个苹果','qǐng gěi wǒ yí ge píngguǒ']]},
 // Unit 4 — I like
 {unit:4,zh:'我喜欢猫。',py:'wǒ xǐhuan māo.',en:'I like cats.',pic:'🐱',build:[['猫','māo'],['喜欢猫','xǐhuan māo'],['我喜欢猫','wǒ xǐhuan māo']]},
 {unit:4,zh:'你喜欢什么？',py:'nǐ xǐhuan shénme?',en:'What do you like?',pic:'❓',build:[['什么','shénme'],['喜欢什么','xǐhuan shénme'],['你喜欢什么','nǐ xǐhuan shénme']]},
 {unit:4,zh:'我喜欢画画。',py:'wǒ xǐhuan huà huà.',en:'I like drawing.',pic:'🎨',build:[['画画','huà huà'],['我喜欢画画','wǒ xǐhuan huà huà']]},
 {unit:4,zh:'我不喜欢。',py:'wǒ bù xǐhuan.',en:"I don't like it.",pic:'🙅',build:[['不喜欢','bù xǐhuan'],['我不喜欢','wǒ bù xǐhuan']]},
 // Unit 5 — let's play
 {unit:5,zh:'我们一起玩吧！',py:'wǒmen yìqǐ wán ba!',en:"Let's play together!",pic:'🤸',build:[['玩吧','wán ba'],['一起玩吧','yìqǐ wán ba'],['我们一起玩吧','wǒmen yìqǐ wán ba']]},
 {unit:5,zh:'好的！',py:'hǎo de!',en:'OK!',pic:'👌',build:[]},
 {unit:5,zh:'快看！',py:'kuài kàn!',en:'Look, quick!',pic:'👀',build:[]},
 {unit:5,zh:'加油！',py:'jiāyóu!',en:'You can do it!',pic:'💪',build:[]},
 {unit:5,zh:'太棒了！',py:'tài bàng le!',en:'Awesome!',pic:'🌟',build:[['棒了','bàng le'],['太棒了','tài bàng le']]},
 {unit:5,zh:'轮到你了。',py:'lún dào nǐ le.',en:"It's your turn.",pic:'🔁',build:[['到你了','dào nǐ le'],['轮到你了','lún dào nǐ le']]},
 // Unit 6 — what is it, where is it
 {unit:6,zh:'这是什么？',py:'zhè shì shénme?',en:'What is this?',pic:'🤔',build:[['什么','shénme'],['是什么','shì shénme'],['这是什么','zhè shì shénme']]},
 {unit:6,zh:'这是我的狗。',py:'zhè shì wǒ de gǒu.',en:'This is my dog.',pic:'🐶',build:[['我的狗','wǒ de gǒu'],['这是我的狗','zhè shì wǒ de gǒu']]},
 {unit:6,zh:'在哪里？',py:'zài nǎlǐ?',en:'Where is it?',pic:'🔎',build:[['哪里','nǎlǐ'],['在哪里','zài nǎlǐ']]},
 {unit:6,zh:'在这里！',py:'zài zhèlǐ!',en:"It's here!",pic:'📍',build:[['这里','zhèlǐ'],['在这里','zài zhèlǐ']]},
 // Unit 7 — feelings
 {unit:7,zh:'我很开心！',py:'wǒ hěn kāixīn!',en:"I'm so happy!",pic:'😁',build:[['开心','kāixīn'],['很开心','hěn kāixīn'],['我很开心','wǒ hěn kāixīn']]},
 {unit:7,zh:'我累了。',py:'wǒ lèi le.',en:"I'm tired.",pic:'😴',build:[['累了','lèi le'],['我累了','wǒ lèi le']]},
 {unit:7,zh:'对不起。',py:'duìbuqǐ.',en:"I'm sorry.",pic:'🙇',build:[]},
 {unit:7,zh:'没关系。',py:'méi guānxi.',en:"It's OK.",pic:'🤗',build:[['关系','guānxi'],['没关系','méi guānxi']]},
 {unit:7,zh:'我有点儿怕。',py:'wǒ yǒudiǎnr pà.',en:"I'm a little scared.",pic:'😨',build:[['怕','pà'],['有点儿怕','yǒudiǎnr pà'],['我有点儿怕','wǒ yǒudiǎnr pà']]},
 // Unit 8 — everyday life
 {unit:8,zh:'可以吗？',py:'kěyǐ ma?',en:'May I?',pic:'🙋',build:[['可以吗','kěyǐ ma']]},
 {unit:8,zh:'可以！',py:'kěyǐ!',en:'Yes, you may!',pic:'✅',build:[]},
 {unit:8,zh:'现在几点？',py:'xiànzài jǐ diǎn?',en:'What time is it now?',pic:'⏰',build:[['几点','jǐ diǎn'],['现在几点','xiànzài jǐ diǎn']]},
 {unit:8,zh:'今天很热。',py:'jīntiān hěn rè.',en:"It's hot today.",pic:'☀️',build:[['很热','hěn rè'],['今天很热','jīntiān hěn rè']]},
 {unit:8,zh:'我们走吧！',py:'wǒmen zǒu ba!',en:"Let's go!",pic:'🚶',build:[['走吧','zǒu ba'],['我们走吧','wǒmen zǒu ba']]},
 {unit:8,zh:'晚安！',py:'wǎn’ān!',en:'Good night!',pic:'🌙',build:[]},
];
// Game moments: short phrases the game asks the child to say at the right moment (from the phrasebook above).
const MOMENTS={
 catchStart:['你好！','快看！','我喜欢猫。','这是什么？','我要这个。','太棒了！'],
 battle:['加油！','太棒了！','我们走吧！','轮到你了。'],
 caught:['太棒了！','我很开心！','谢谢！','好的！'],
};
