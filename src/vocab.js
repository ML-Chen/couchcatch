// Beginner Chinese vocabulary, in teaching order (concrete, picturable words first).
// Each entry: [hanzi, pinyin, english, group, picture]  picture = emoji, or 'color:#hex', or 'dots:N'
const VOCAB=[
 ['火','huǒ','fire','nature','🔥'],['水','shuǐ','water','nature','💧'],['叶','yè','leaf','nature','🍃'],['电','diàn','electricity','nature','⚡'],['石','shí','stone','nature','🪨'],['冰','bīng','ice','nature','🧊'],
 ['猫','māo','cat','animal','🐱'],['狗','gǒu','dog','animal','🐶'],['鱼','yú','fish','animal','🐟'],['鸟','niǎo','bird','animal','🐦'],['兔','tù','rabbit','animal','🐰'],['狐','hú','fox','animal','🦊'],
 ['一','yī','one','number','dots:1'],['二','èr','two','number','dots:2'],['三','sān','three','number','dots:3'],
 ['红','hóng','red','color','color:#e53935'],['蓝','lán','blue','color','color:#1e63d6'],['绿','lǜ','green','color','color:#2e9e44'],
 ['山','shān','mountain','nature','⛰️'],['海','hǎi','sea','nature','🌊'],['树','shù','tree','nature','🌳'],['花','huā','flower','nature','🌸'],
 ['大','dà','big','describe','🐘'],['小','xiǎo','small','describe','🐭'],['你好','nǐ hǎo','hello','phrase','👋'],['谢谢','xièxie','thank you','phrase','🙏'],
 ['四','sì','four','number','dots:4'],['五','wǔ','five','number','dots:5'],['黄','huáng','yellow','color','color:#f2c418'],['白','bái','white','color','color:#f4f4f4'],['黑','hēi','black','color','color:#1b1b1b'],
 ['熊','xióng','bear','animal','🐻'],['马','mǎ','horse','animal','🐴'],['龙','lóng','dragon','animal','🐉'],['虫','chóng','bug','animal','🐛'],
 ['日','rì','sun','nature','☀️'],['月','yuè','moon','nature','🌙'],['星','xīng','star','nature','⭐'],['雨','yǔ','rain','nature','🌧️'],['雪','xuě','snow','nature','❄️'],['风','fēng','wind','nature','🌬️'],['天','tiān','sky','nature','🌤️'],
 ['球','qiú','ball','thing','⚽'],['家','jiā','home','phrase','🏠'],['吃','chī','to eat','action','🍜'],['喝','hē','to drink','action','🥤'],['看','kàn','to look','action','👀'],
 ['六','liù','six','number','dots:6'],['七','qī','seven','number','dots:7'],['八','bā','eight','number','dots:8'],['九','jiǔ','nine','number','dots:9'],['十','shí','ten','number','dots:10'],['紫','zǐ','purple','color','color:#8e44c9'],
 ['走','zǒu','to walk','action','🚶'],['跑','pǎo','to run','action','🏃'],['飞','fēi','to fly','action','🕊️'],['快','kuài','fast','describe','🐇'],['慢','màn','slow','describe','🐢'],['好','hǎo','good','describe','👍'],
 ['我','wǒ','I / me','phrase','🙋'],['你','nǐ','you','phrase','👉'],['朋友','péngyou','friend','phrase','🤝'],['再见','zàijiàn','goodbye','phrase','👋'],['是','shì','yes / to be','phrase','✅'],['不','bù','no / not','phrase','❌'],['有','yǒu','to have','phrase','🎁'],
 ['抓','zhuā','to catch','action','✊'],['扔','rēng','to throw','action','🤾'],['留下','liú xià','to stay','action','🛋️'],['出发','chūfā','to set off','action','🚀'],['赢','yíng','to win','action','🏆'],['输','shū','to lose','action','😞'],
 ['加州','Jiāzhōu','California','place','🌴'],['旧金山','Jiùjīnshān','San Francisco','place','🌉'],['洛杉矶','Luòshānjī','Los Angeles','place','🎬'],['圣地亚哥','Shèngdìyàgē','San Diego','place','🏖️'],['优胜美地','Yōushèngměidì','Yosemite','place','🏞️'],
];
// Short phrases the game says out loud (also recorded as audio clips).
const PHRASES=['野生的','巨大的','抓到了','使用了','倒下了','进化成了','正在进化','到达','出发去','留在','你在','效果很好','效果不太好','不错','很好','太棒了','打中了','曲线球',
 '太轻了','没打到','太重了','飞过头了','偏了','没打中','它挣脱了','再扔一次','它挣脱后逃走了','你赢了','你输了','变巨大了','暴击','答对了','答错了','正确答案是',
 '吃了果子','安静下来了','开战','穿过去','星幕裂隙打开了','生物会来找你','你好！我们一起学中文吧。','闪光的','传说的','出现了','任务完成','学习','留下','出发','道馆','队伍','任务','背包','设置',
 '新词','懂了','提示','什么意思','电话来了','有人来了','你是说','吧','对','继续','说了','听一听','再说一次','说一说','我会了','再来','停','说中文','能量球','打','写一写','暴击','写好了'];
