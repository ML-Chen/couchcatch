#!/usr/bin/env python3
"""Builds hsk_chars.js: every character used in the HSK 2.0 level 1-4 word lists, in teaching order,
with a kid-friendly gloss, an example word, stroke count and a creature-type theme for Couchcatch tracing.

Usage:  python3 tools/make_hsk.py [--out hsk_chars.js] [--cache DIR] [--hw DIR/hanzi-writer-data]

Sources (downloaded into --cache on first run, pinned to exact commits/versions so output is reproducible):
  * drkameleon/complete-hsk-vocabulary @ 7ac65bf   wordlists/exclusive/old/{1..4}.min.json = HSK 2.0 levels 1-4,
                                                    complete.min.json = all HSK 2.0+3.0 words (only for word pinyin)
  * skishore/makemeahanzi @ bddc96d                 dictionary.txt (fallback character readings)
  * ruddfawcett/hanziDB.csv @ 3e9f908               data/hanziDB.csv (character frequency rank, for ordering)
  * hanzi-writer-data 2.0.1 (npm)                   <char>.json stroke data (stroke counts; chars it lacks are dropped)
The glosses, example words and themes are hand-curated in CURATED below (the dictionary glosses in the sources
are often archaic or adult; e.g. 听 "smile (archaic)", 读 "comma"). The script checks that CURATED covers exactly
the HSK 1-4 character set and that each example word really contains its character.

It also prints the size of the stroke data (strokes+medians+radStrokes, minified JSON) if all characters were embedded.
"""
import argparse, csv, gzip, json, math, os, re, sys, tarfile, tempfile, urllib.request

HSK_COMMIT = '7ac65bf1a6387d35f1ade478906172a19311c7f9'
MMAH_COMMIT = 'bddc96d41bef78427ed0e034e9f7e31d71fd1b92'
HANZIDB_COMMIT = '3e9f908d25f70674862343b201f6b641a36cd226'
HW_VERSION = '2.0.1'
GH = 'https://raw.githubusercontent.com/'
SOURCES = {
    **{f'hsk{l}.json': f'{GH}drkameleon/complete-hsk-vocabulary/{HSK_COMMIT}/wordlists/exclusive/old/{l}.min.json' for l in range(1, 5)},
    'complete.json': f'{GH}drkameleon/complete-hsk-vocabulary/{HSK_COMMIT}/complete.min.json',
    'dictionary.txt': f'{GH}skishore/makemeahanzi/{MMAH_COMMIT}/dictionary.txt',
    'hanziDB.csv': f'{GH}ruddfawcett/hanziDB.csv/{HANZIDB_COMMIT}/data/hanziDB.csv',
    'hanzi-writer-data.tgz': f'https://registry.npmjs.org/hanzi-writer-data/-/hanzi-writer-data-{HW_VERSION}.tgz',
}
THEMES = {'fi': 'fire', 'wa': 'water', 'le': 'leaf', 'sp': 'spark', 'st': 'stone', 'fr': 'frost', 'no': 'normal', 'gi': 'giant', '': ''}

# ch | pinyin (blank = take it from the example word) | english | word[=explicit word pinyin] | word english | theme | flag
# theme codes: fi fire, wa water, le leaf, sp spark, st stone, fr frost, no normal (physical moves), gi giant; blank = none.
# flag: c = concrete/picturable (taught earlier within its level), a = abstract or grammar word (taught later).
CURATED = r"""
# ---------------- HSK 1 ----------------
的|de|of / 's|我的=wǒ de|mine||a
一|yī|one|一起|together||
是||is / yes|是的=shì de|yes, it is||a
不|bù|not / no|不要|don't||a
了|le|done (marker)|好了=hǎo le|all done||a
在||at / in|在家=zài jiā|at home||
人||person|好人=hǎorén|good guy||c
有||to have|有名|famous||
我||I / me|我们|we||
他||he / him|他们=tāmen|they||
这||this|这里=zhèlǐ|here||
个|gè|(counting word)|三个=sān gè|three of them||a
们|men|(more than one)|人们=rénmen|people||a
中||middle|中国|China||
来||to come|过来=guòlai|come over||
上||up / on|上面=shàngmian|on top||
大||big|大象=dàxiàng|elephant|gi|c
和||and|我和你=wǒ hé nǐ|you and me||a
国||country|国家|country||
说||to speak|说话|to talk||
时||time|时间|time||
出||out|出去=chūqu|go out||
会||can (do)|学会=xuéhuì|learn how||
你||you|你好=nǐ hǎo|hello||
对||right / correct|对了=duì le|that's right!||
生||to be born|生日|birthday||
能||can / able|可能|maybe||
子|zǐ|child|孩子|child||c
那||that|那里=nàlǐ|there||
下||down / below|下午|afternoon||
年||year|今年=jīnnián|this year||
后||back / after|后面|behind||
作||to do / work|工作|job / to work||
里||inside|里面=lǐmiàn|inside||
家||home / family|回家=huí jiā|go home||c
多||many / much|很多=hěn duō|lots of|gi|
么|me|(question part)|什么|what||a
去||to go|去玩=qù wán|go play||
学||to learn|学生|student||
都|dōu|all / both|都是=dōu shì|all are||a
同||same|同学|classmate||
现||now / appear|现在|now||
没||not|没有=méiyǒu|don't have|wa|a
面|miàn|noodles|面条|noodles|le|c
起||to get up|起来=qǐlai|get up||
看||to look|看见|to see||
天|tiān|sky / day|天气|weather||
分||minute / split|分钟|minute||
好||good|好吃|yummy||
小||small|小心|be careful||
些|xiē|some|一些=yìxiē|some||a
样|yàng|kind / look|一样|the same||
她||she / her|她们=tāmen|they (girls)||
本|běn|book / root|本子=běnzi|notebook|le|
前||front|前面|in front||
开||to open|开门=kāi mén|open the door|no|
想||to think / want|想到=xiǎngdào|think of||
日||sun / day|日出=rìchū|sunrise|sp|c
机||machine|手机|cell phone|sp|c
十||ten|十月=shíyuè|October||
工||work|工人=gōngrén|worker||
明||bright|明天|tomorrow|sp|
三||three|三月=sānyuè|March||
关||to close|关门=guān mén|close the door||
点||dot / o'clock|几点=jǐ diǎn|what time?|fi|
高||tall / high|高楼=gāo lóu|tall building|gi|
很||very|很好=hěn hǎo|very good|gi|
见||to see|再见|goodbye||
什|shén|(what)|什么|what||a
二||two|第二|second||
果||fruit|水果|fruit|le|c
西||west|西瓜|watermelon||
月||moon / month|月亮|the moon|sp|c
话||words / talk|电话|telephone||
回||to go back|回来=huílai|come back||
老||old|老人=lǎorén|old person||
先||first|先生|Mr. / sir||
儿|ér|child|儿子|son||c
东||east|东西=dōngxi|thing / stuff||
水||water|喝水=hē shuǐ|drink water|wa|c
名||name|名字|name||
几||how many|几个=jǐ gè|how many?||
认||to recognize|认字=rèn zì|read characters||
系|xì|to tie / link|没关系|it's okay||
气||air|空气|air|fr|
打||to hit|打球=dǎ qiú|play ball|no|
女||girl / woman|女孩=nǚhái|girl||c
四||four|四季=sìjì|four seasons||
电||electricity|电视|TV|sp|
少||few / little|多少=duōshao|how many?||
太||too / very|太大=tài dà|too big|gi|
再||again|再见|goodbye||
做||to do / make|做饭=zuò fàn|to cook||
期||period of time|星期|week||
五||five|五月=wǔyuè|May||
书||book|书包=shūbāo|school bag||c
听||to listen|好听=hǎotīng|nice to hear||
住||to live (at)|住在=zhù zài|to live in||
北||north|北方|the north|fr|
觉|jiào|sleep|睡觉|to sleep||
师|shī|teacher|老师|teacher||
今||now / today|今天|today||
院||courtyard|医院|hospital||
识|shí|to know|认识|to know (someone)||
候|hòu|time / to wait|时候|time (when)||
飞||to fly|飞机|airplane|sp|c
车||car / vehicle|火车|train||c
服|fú|clothes|衣服|clothes||
怎||how|怎么|how||a
呢|ne|(and…?)|你呢=nǐ ne|and you?||a
叫||to call / shout|大叫=dà jiào|to shout|no|
影||shadow|电影|movie|sp|
字||character / word|汉字=Hànzì|Chinese character||
爱||to love|可爱|cute||
商||trade / shop|商店|store||
请||please|请进=qǐng jìn|please come in||
火||fire|火山|volcano|fi|c
视||to look|电视|TV|sp|
九||nine|九月=jiǔyuè|September||
写||to write|写字=xiě zì|to write||
八||eight|八月=bāyuè|August||
吗|ma|(question word)|好吗=hǎo ma|okay?||a
吃||to eat|吃饭|to eat a meal|no|
六||six|六月=liùyuè|June||
医||doctor / heal|医生|doctor||
语||language|汉语|Chinese language||
七||seven|七天=qī tiān|seven days||
兴|xìng|joy|高兴|happy||
星||star|星星=xīngxing|star|sp|c
站||to stand / station|车站=chēzhàn|station|no|
京||capital city|北京|Beijing||
米||rice|米饭|cooked rice|le|c
客||guest|客人|guest||
友|yǒu|friend|好友=hǎoyǒu|good friend||
钱||money|钱包=qiánbāo|wallet|st|c
热||hot|热水=rè shuǐ|hot water|fi|
坐||to sit|坐下=zuòxia|sit down|no|
校||school|学校|school||
脑||brain|电脑|computer|sp|
谁|shéi|who|是谁=shì shéi|who is it?||
哪||which|哪里=nǎlǐ|where?||
喜||happy / like|喜欢|to like||
习||to practice|学习|to study|fr|
欢||happy|欢迎|welcome||
冷||cold|好冷=hǎo lěng|so cold|fr|
汉||Chinese|汉语|Chinese language|wa|
衣||clothes|衣服|clothes||c
妈|mā|mom|妈妈|mom||c
读||to read|读书=dúshū|to read / study||
买||to buy|买菜=mǎi cài|buy groceries||
岁||years old|几岁=jǐ suì|how old?||
块||piece / chunk|一块=yí kuài|one piece|st|
姐|jiě|big sister|姐姐|big sister||c
亮||bright|明亮=míngliàng|bright|sp|
朋|péng|friend|朋友|friend||
谢|xiè|to thank|谢谢|thank you||
钟||clock / bell|闹钟=nàozhōng|alarm clock|st|c
雨||rain|下雨|to rain|wa|c
饭||meal / rice|早饭=zǎofàn|breakfast||c
睡||to sleep|睡觉|to sleep||
喝||to drink|喝茶=hē chá|drink tea|wa|
午||noon|中午|noon||
馆||hall / building|饭馆|restaurant||
店||shop|书店=shūdiàn|bookstore||
爸|bà|dad|爸爸|dad||c
桌|zhuō|table|桌子|table|le|c
菜||vegetable / dish|白菜=báicài|cabbage|le|c
茶||tea|绿茶=lǜchá|green tea|le|c
狗||dog|小狗=xiǎo gǒu|puppy||c
零||zero|零下=líng xià|below zero|fr|
杯|bēi|cup|杯子|cup|le|c
租||to rent|出租车|taxi||
昨||yesterday|昨天|yesterday||
漂|piào|pretty|漂亮|pretty|wa|
椅|yǐ|chair|椅子|chair|le|c
猫||cat|小猫=xiǎo māo|kitten||c
喂|wèi|hey / to feed|喂猫=wèi māo|feed the cat||
苹||apple|苹果|apple|le|c
# ---------------- HSK 2 ----------------
为|wèi|for / because|为什么|why||a
到||to arrive|到家=dào jiā|get home||
以|yǐ|so / by|所以|so||a
要||to want|想要=xiǎngyào|to want||
就||right away|就是=jiùshì|exactly||a
可||can / may|可以|can / may||
也||also|也是=yě shì|also is||a
得|de|(how it goes)|跑得快=pǎo de kuài|runs fast||a
着|zhe|(-ing)|看着=kànzhe|watching||a
自||self|自己|myself||
道|dào|road / way|街道|street||
行||to go / okay|自行车|bicycle||
所||place / so|所有|all||a
事||thing / event|故事=gùshi|story||
经||to pass through|已经|already||a
动||to move|动物|animal||
还|hái|still / also|还有=háiyǒu|and also||a
进||to enter|进来=jìnlai|come in||
但||but|但是|but||a
因||because|因为|because||a
从||from|从前=cóngqián|once upon a time||
意||meaning / idea|意思|meaning||
它||it|它们=tāmen|they (things)||
长|cháng|long|长城|Great Wall|gi|
第||(number order)|第一|first||
公||public|公园|park||
已||already|已经|already||a
情|qíng|feeling|心情|mood||
知||to know|知道|to know||
正||straight / just|正好|just right||
外||outside|外面=wàimian|outside||
两||two (of)|两个=liǎng gè|two of them||
间||room / between|房间|room||
问||to ask|问题|question||
最||most|最好|best|gi|
手||hand|手指|finger|no|c
向||toward|方向|direction||
体||body|身体|body||
新||new|新年=xīnnián|New Year||
身||body|身体|body||
表||watch / show|手表|wristwatch||
给||to give|给你=gěi nǐ|here you go||
次||time (occurrence)|下次=xià cì|next time|fr|
门||door|大门=dàmén|front door||c
常|cháng|often|常常=chángcháng|often||
教|jiào|to teach|教室|classroom||
比||to compare|比赛|match / race||
员||member / worker|服务员|waiter||
真||real / true|真的=zhēn de|really||
走||to walk|走路|to walk|no|
题||question / topic|问题|question||
别||don't / other|别人|other people||
报||report / paper|报名|to sign up||
务||task|服务员|waiter||a
场||field / place|机场|airport|st|
件|jiàn|(piece of)|一件=yí jiàn|one item||
便|biàn|handy|方便|convenient||
司||to manage|公司|company||
眼||eye|眼睛|eye||c
非||not / very|非常|very|gi|
白||white|白雪=báixuě|white snow|fr|c
思|sī|to think|意思|meaning||
完||to finish|完了=wán le|all finished||
色||color|颜色|color||
路||road|马路=mǎlù|road / street|no|
告||to tell|告诉=gàosu|to tell||
边|biān|side|旁边|beside||
张||to open wide|张嘴=zhāng zuǐ|open your mouth||
望||to hope|希望|to hope||
共||together|一共|altogether||
让||to let|让开=ràngkāi|make way||
运||to move / luck|运动|sports||
笑||to laugh / smile|笑话|joke||
步||step|跑步|running|no|
每||every|每天=měitiān|every day||
快||fast|快点=kuài diǎn|hurry up!|sp|
元||yuan (money)|十元=shí yuán|ten yuan||
近||near|附近|nearby||
夫|fū|man / husband|丈夫|husband||
准||accurate|准备|to get ready|fr|
始||to begin|开始|to begin||
远||far|很远=hěn yuǎn|very far||
备||to prepare|准备|to get ready||
百||hundred|一百=yìbǎi|one hundred|gi|
离||away from|离开|to leave||
病||sick|生病|to get sick||
息|xī|rest / news|休息|to rest||
早||early / morning|早上|morning|sp|
找||to look for|找到=zhǎodào|to find|no|
吧|ba|(let's…)|好吧=hǎo ba|okay then||a
号||number / date|号码|number||
考||test|考试|exam||
红||red|红花=hóng huā|red flower|fi|c
希||hope|希望|to hope||
房||house|房子=fángzi|house|st|c
黑||black|黑色=hēisè|black|fi|
孩|hái|child|孩子|child||c
答||to answer|回答|to answer||
诉|sù|to tell|告诉=gàosu|to tell||
千||thousand|一千=yìqiān|one thousand|gi|
男||man / boy|男孩=nánhái|boy||c
助||to help|帮助|to help|no|
船||boat|小船=xiǎochuán|little boat|wa|c
乐|lè|happy|快乐|happy||
球||ball|足球=zúqiú|soccer||c
错||wrong|不错|not bad||
晚||evening / late|晚上|evening||
试||to try|试试=shìshi|give it a try||
送||to give / send|送给=sònggěi|to give (a gift)||
药||medicine|吃药=chī yào|take medicine|le|
游||to swim / travel|游泳|to swim|wa|
室||room|教室|classroom||
您||you (polite)|您好=nín hǎo|hello (polite)||
帮||to help|帮忙|to help||
左||left|左边|left side||
右||right (side)|右边|right side||
穿||to wear|穿上=chuānshang|put on||
哥|gē|big brother|哥哥|big brother||c
弟|dì|little brother|弟弟|little brother||c
慢||slow|慢慢=mànmàn|slowly||
忙||busy|很忙=hěn máng|very busy||
介||between|介绍|to introduce||
鱼||fish|金鱼=jīnyú|goldfish|wa|c
跑||to run|跑步|running|no|
贵||expensive|很贵=hěn guì|very expensive||
班||class / shift|上班|go to work||
票||ticket|门票=ménpiào|entry ticket||
睛|jīng|eyeball|眼睛|eye||
旅||to travel|旅游|to travel||
卖||to sell|卖完=màiwán|sold out||
旁||side|旁边|beside||
阴||cloudy / shady|阴天=yīntiān|cloudy day|fr|
跳||to jump|跳高=tiàogāo|high jump|no|
雪||snow|雪人=xuěrén|snowman|fr|c
肉||meat|牛肉=niúròu|beef||c
牛||cow|牛奶|milk||c
纸||paper|报纸|newspaper||c
歌||song|唱歌|to sing||
床||bed|起床|to get up||c
迎||to welcome|欢迎|welcome||
玩||to play|好玩=hǎowán|fun||
妻||wife|妻子=qīzi|wife||
休||to rest|休息|to rest||
舞||dance|跳舞|to dance||
姓||family name|姓名=xìngmíng|full name||
妹|mèi|little sister|妹妹|little sister||c
汽||steam|汽车=qìchē|car|wa|
课||class / lesson|上课=shàngkè|go to class||
懂||to understand|听懂=tīngdǒng|understand||
绍|shào|to connect|介绍|to introduce||
丈||husband / measure|丈夫|husband||
洗||to wash|洗手=xǐ shǒu|wash your hands|wa|
唱||to sing|唱歌|to sing|no|
奶|nǎi|milk|牛奶|milk|fr|c
宜|yí|suitable|便宜=piányi|cheap||
累||tired|很累=hěn lèi|very tired||
羊||sheep|小羊=xiǎo yáng|lamb||c
蛋||egg|鸡蛋|egg||c
鸡||chicken|小鸡=xiǎo jī|chick||c
颜||face / color|颜色|color||
瓜||melon|西瓜|watermelon|le|c
斤||half a kilo|公斤|kilogram||
晴||sunny|晴天=qíngtiān|sunny day|fi|
啡|fēi|(coffee)|咖啡|coffee||
篮||basket|篮球=lánqiú|basketball|le|
咖||(coffee)|咖啡|coffee||
踢||to kick|踢球=tī qiú|kick a ball|no|
泳||to swim|游泳|to swim|wa|
# ---------------- HSK 3 ----------------
地|dì|ground|地上=dìshang|on the ground|st|
而||and / but|而且|also||a
于||at / to|终于|at last||a
过||to pass / cross|过河=guò hé|cross the river||
发|fā|to send out|发现|to discover||
用||to use|有用=yǒuyòng|useful||
然||so / like this|然后|then / after that|fi|a
种|zhǒng|seed / kind|种子=zhǒngzi|seed|le|c
成||to become|完成|to finish||
方|fāng|square / side|地方=dìfang|place||
法||method / law|办法|way / method|wa|
如||if / like|如果|if||a
当|dāng|to be / when|当然|of course||a
定||to decide / sure|一定|surely||
其||its / that|其他|other||a
主||master / main|主人=zhǔrén|owner / master||
理||reason / to tidy|理发|haircut||
心||heart|开心=kāixīn|happy||
只|zhǐ|only|只有=zhǐyǒu|only||a
实||real / solid|其实|actually||
者||person (who does)|作者|author||
力||strength|用力=yònglì|push hard|no|
把||to hold / handle|把手=bǎshǒu|handle|no|
使||to use / make|使用|to use||
又||again|又来=yòu lái|here again||a
业||work / study|作业|homework||
重|zhòng|heavy|很重=hěn zhòng|very heavy|st|
物||thing|礼物|gift||c
应|yīng|should|应该|should||a
头|tóu|head|头发|hair||c
文||writing / language|中文|Chinese (language)||
相|xiāng|each other|相信|to believe||
被||blanket / by|被子=bèizi|blanket||
或||or|或者|or||a
己||self|自己|myself||
加||to add|加油=jiāyóu|go for it!||
特||special|特别|special||
信||letter / to believe|写信=xiě xìn|write a letter||
化||to change|变化|change||
世||world / life|世界|world||
位||place / seat|座位|seat||
通||to go through|交通|traffic||
声||sound / voice|声音|sound||
提||to lift / carry|提高|to raise|no|
解||to untie / solve|解开=jiěkāi|to untie||
口||mouth|门口=ménkǒu|doorway||c
条||long strip|面条|noodles||
平||flat / even|平安=píng'ān|safe and sound||
更||even more|更大=gèng dà|even bigger|gi|
变||to change|变成=biànchéng|turn into||
总||always / total|总是|always||a
数|shù|number|数学|math||
安||safe / calm|晚安=wǎn'ān|good night||
才||only then / just|刚才|just now||a
结||to tie / knot|结束|to end||
目||eye|节目|show / program||
感||to feel|感谢|to thank||
接||to catch|接球=jiē qiú|catch the ball|no|
必||must|必须|must||a
市||city / market|超市|supermarket||
直||straight|一直|straight on||
山||mountain|高山=gāoshān|high mountain|st|c
空|kōng|sky / empty|天空=tiānkōng|sky||
决||to decide|决定|to decide|fr|
马||horse|马上|right away|sp|c
界||boundary / world|世界|world||
放||to let go|放学=fàngxué|school's out||
像||to look like|好像|seems like||
难|nán|hard (difficult)|很难=hěn nán|very hard||
且||and / also|而且|also||a
记||to remember|记住=jìzhù|remember it||
南||south|南方|the south||
求||to ask for|要求|to require||a
据||according to|根据|based on||a
该||should|应该|should||a
万||ten thousand|一万=yíwàn|ten thousand|gi|
清||clear|清水=qīngshuǐ|clear water|wa|
带||to bring / belt|带来=dàilái|to bring||
根||root|树根=shùgēn|tree root|le|c
干|gān|dry / clean|干净|clean||
极||extreme / pole|北极=běijí|North Pole|fr|
办||to do / handle|办法|way / method||
议||to discuss|会议|meeting||
单||single / list|菜单|menu||
调|tiáo|to adjust|空调|air conditioner||
算||to count|打算|to plan||
需||need|需要|to need|wa|
花||flower|开花=kāihuā|to bloom|le|c
城||city / wall|城市|city|st|
级||level / grade|年级|grade (school)||
示||to show|表示|to show||
复||again / repeat|复习|to review||
满||full|满了=mǎn le|it's full|gi|
越||to leap over|越过=yuèguò|leap over|no|
容||to hold / face|容易|easy||
照||to shine / photo|照相=zhàoxiàng|take a photo|fi|
须||must|必须|must||a
包||bag / to wrap|面包|bread||c
片||slice / flat piece|照片|photo||
史||history|历史|history||
乎|hū|(sound word)|几乎|almost||a
查||to check|检查|to check||
轻||light (not heavy)|很轻=hěn qīng|very light||
易|yì|easy|容易|easy||
除||to remove / except|除了|except||a
阿||(name prefix)|阿姨|auntie||
李|lǐ|plum|李子=lǐzi|plum|le|c
图||picture / map|地图|map||
历||to go through|历史|history||
突||sudden|突然|suddenly|sp|
周||week / around|周末|weekend||
较||to compare|比较|rather / quite||
注||to pour / focus|注意|pay attention|wa|
选||to choose|选择|to choose||
响||loud / to ring|很响=hěn xiǎng|very loud|sp|
虽||although|虽然|although||a
参||to join|参加|to take part||
半||half|一半=yíbàn|half||
节||festival / section|节日|holiday||
护||to protect|护士|nurse||
音||sound|音乐|music||
跟||to follow / with|跟着=gēnzhe|to follow|no|
讲||to tell / speak|讲话=jiǎnghuà|to speak||
终||end|终于|at last||
黄||yellow|黄色=huángsè|yellow|sp|c
奇||strange|奇怪|strange||
段||section|一段=yí duàn|a section||
故||old / reason|故事=gùshi|story||
河||river|小河=xiǎo hé|little river|wa|c
害||harm / afraid|害怕|to be scared||
双||pair|一双=yì shuāng|a pair||
境||border / area|环境|surroundings||
举||to lift up|举手=jǔ shǒu|raise your hand|no|
低||low|很低=hěn dī|very low||
愿||to wish|愿意|willing||
网||net / internet|上网|go online|sp|
育||to raise / educate|体育|sports / PE||
脸||face|洗脸=xǐ liǎn|wash your face||c
刻||quarter hour / carve|一刻=yí kè|quarter hour||
刚||just now|刚才|just now||a
般||sort / kind|一般|usually||a
普||common|普通话|Mandarin||
怕||to fear|不怕=bú pà|not afraid||
久||long time|很久=hěn jiǔ|a long time||
拿||to take / hold|拿来=nálái|bring it here|no|
阳||sun|太阳|the sun|fi|c
急||urgent / hurry|着急|in a hurry||
居||to live|邻居|neighbor||
环||ring|环境|surroundings||
云||cloud|白云=báiyún|white cloud|sp|c
树||tree|树叶=shùyè|tree leaf|le|c
层||floor / layer|一层=yì céng|first floor|st|
句||sentence|句子|sentence||
演||to act / perform|表演|to perform|wa|
简||simple|简单|simple||
担|dān|to carry|担心|to worry||
静||quiet / calm|安静|quiet|fr|
检||to check|检查|to check||
差|chà|poor / lacking|差不多|about the same||
角|jiǎo|horn / corner|牛角=niújiǎo|ox horn||c
啊|a|ah! / oh!|好啊=hǎo a|great!||a
超||super / exceed|超人=chāorén|Superman|gi|
银||silver|银行|bank|st|
怪||strange / monster|怪物=guàiwu|monster||
香||fragrant|香蕉|banana|le|c
铁||iron|地铁|subway|st|
草||grass|草地=cǎodì|lawn|le|c
脚||foot|脚印=jiǎoyìn|footprint||c
敢||to dare|勇敢|brave||
酒||wine|酒店=jiǔdiàn|hotel||a
顾||to look after|照顾|to take care of||
换||to change / swap|交换=jiāohuàn|to swap||
闻||to hear / smell|新闻|news||
坏||bad / broken|坏人=huàirén|bad guy||
楚||clear|清楚|clear||
楼||building / floor|楼上=lóushàng|upstairs|st|
画||to draw / picture|画画=huà huà|to draw||
耳||ear|耳朵|ear||c
短||short|很短=hěn duǎn|very short||
遇||to meet|遇到|to run into||
康||healthy|健康|healthy||
旧||old (things)|旧书=jiùshū|old book||
春||spring|春天=chūntiān|spring|le|
附||near / attach|附近|nearby||
礼||gift / manners|礼物|gift||
板||board|黑板|blackboard|le|
婚||marriage|结婚|to marry||
笔||pen / brush|铅笔|pencil|le|c
鲜||fresh|新鲜|fresh|wa|
词||word|词语|words||
择||to choose|选择|to choose||
健||healthy / strong|健康|healthy||
借||to borrow|借书=jiè shū|borrow a book||
园||garden / park|花园|garden|le|
束||to tie / bunch|结束|to end||
练||to practice|练习|to practice||
爷|yé|grandpa|爷爷|grandpa||c
戏||play / show|游戏|game||
典||standard / book|字典|dictionary||
盘||plate|盘子|plate||c
忘||to forget|忘记|to forget||
赛||race / match|赛跑=sàipǎo|running race||
趣||fun / interest|有趣|interesting||
冰||ice|冰箱|fridge|fr|c
努||to strive|努力|to try hard||
绿||green|绿色=lǜsè|green|le|c
街||street|街道|street||
灯||lamp / light|开灯=kāi dēng|turn on the light|fi|c
夏||summer|夏天=xiàtiān|summer|fi|
秋||autumn|秋天=qiūtiān|autumn|le|
末||end|周末|weekend||
蓝||blue|蓝色=lánsè|blue|wa|c
烧||to burn|发烧|to have a fever|fi|
哭||to cry|大哭=dà kū|cry loudly|no|
冒||to give off|感冒|a cold|fr|
惯||habit|习惯|habit||
镜||mirror|镜子|mirror|st|c
鸟||bird|小鸟=xiǎoniǎo|little bird||c
季||season|季节|season||
鼻||nose|鼻子|nose||c
腿||leg|鸡腿=jītuǐ|drumstick||c
迟||late|迟到|to be late||
辆||(counter for cars)|一辆=yí liàng|one car||
净|jìng|clean|干净|clean|fr|
冬||winter|冬天=dōngtiān|winter|fr|c
骑||to ride|骑马=qí mǎ|ride a horse|no|
叔|shū|uncle|叔叔|uncle||c
爬||to climb / crawl|爬山|climb a mountain|no|
扫||to sweep|打扫|to clean up|no|
箱|xiāng|box / case|箱子=xiāngzi|box / suitcase||c
舒||comfortable|舒服|comfortable||
宾||guest|宾馆|hotel||
绩||achievement|成绩|grades / results||
朵||(flower counter)|花朵=huāduǒ|flower|le|
鞋||shoe|鞋子=xiézi|shoes||c
祝||to wish|祝福=zhùfú|blessing||
邻||neighbor|邻居|neighbor||
聪||clever|聪明|smart|sp|
梯||ladder / stairs|电梯|elevator|sp|
疼||sore / hurts|头疼=tóuténg|headache||
熊||bear|熊猫|panda|fi|c
糖||sugar / candy|糖果=tángguǒ|candy||c
帽|mào|hat|帽子|hat||c
炼||to refine (fire)|锻炼|to exercise|fi|
搬||to move (things)|搬家=bānjiā|move house|no|
刷||to brush|刷牙=shuāyá|brush teeth|no|
瘦||thin|很瘦=hěn shòu|very thin||
胖||chubby|胖乎乎=pànghūhū|chubby|gi|
饿||hungry|饿了=è le|hungry||
碗||bowl|饭碗=fànwǎn|rice bowl|st|c
渴||thirsty|口渴=kǒukě|thirsty|wa|
饱||full (from eating)|吃饱=chībǎo|eat your fill||
甜||sweet|甜点=tiándiǎn|dessert||
矮||short (height)|很矮=hěn ǎi|very short||
裤|kù|pants|裤子|pants||c
葡||grape|葡萄|grape|le|c
厨||kitchen|厨房|kitchen|fi|
衫||shirt|衬衫|shirt||
伞||umbrella|雨伞=yǔsǎn|umbrella|wa|c
萄|táo|grape|葡萄|grape|le|
姨|yí|auntie|阿姨|auntie||
刮||to blow / scrape|刮风=guā fēng|wind blows|fr|
糕||cake|蛋糕|cake||c
裙|qún|skirt|裙子|skirt||c
衬||lining|衬衫|shirt||
锻||to forge|锻炼|to exercise|st|
汁||juice|果汁|fruit juice|wa|
铅||lead (metal)|铅笔|pencil|st|
澡||bath|洗澡|to take a bath|wa|
啤||beer|啤酒|beer||a
蕉|jiāo|banana|香蕉|banana|le|c
筷|kuài|chopsticks|筷子|chopsticks|le|c
# ---------------- HSK 4 ----------------
之||of (formal)|之后=zhīhòu|after||a
部||part|全部|all||a
无||no / without|无聊|bored||
与||and / with|你与我=nǐ yǔ wǒ|you and me||a
民||people|人民|the people||
此||this|因此|so / therefore||a
性||nature / character|性格|personality||
全||whole / all|全家=quánjiā|whole family|gi|
将||will / going to|将来|the future||
由||from / because of|由于|due to||a
并||and / also|并且|and also||a
美||beautiful|美丽|beautiful||
利||sharp / benefit|顺利|smoothly||
等||to wait|等等=děngděng|wait a moment||
制||to make / system|制造|to make||
合||to fit / close|合作=hézuò|to work together||
代||era / replace|现代=xiàndài|modern||
内||inside|内容|content||
度||degree|温度|temperature||
任||duty / to allow|任务|mission / task||
海||sea|大海|the ocean|wa|c
原||original|原来|originally||
及||to reach / and|来得及|in time||a
论||to discuss|讨论|to discuss||
处|chù|place|到处|everywhere||
各||each|各种=gèzhǒng|all kinds||
入||to enter|入口|entrance||
活||alive / to live|生活|life|wa|
尔||you / so|偶尔|sometimes||a
神||spirit / god|精神|energy / spirit||
何||what / how|任何|any||a
反||opposite|相反|opposite||
受||to receive / bear|难受|uncomfortable||
量|liàng|amount|数量|amount||
计||to count / plan|计划|plan||
管||tube / to manage|管理|to manage||
资||money / resources|工资|wages||
命||life|生命|life||
金||gold|金子=jīnzi|gold|st|c
指||finger / to point|手指|finger|no|
克||gram / overcome|巧克力|chocolate||
许||to allow / maybe|许多|many|gi|
区||area|地区=dìqū|area||
保||to keep / protect|保护|to protect||
至||to / until|至少|at least||a
社||society|社会|society||
展||to spread out|发展|to develop||
科||science / subject|科学|science||
基||base|基础|foundation|st|
则||rule / then|否则|otherwise||a
却||but / yet|却是=què shì|but is||a
达||to reach|到达=dàodá|to arrive||
光||light|阳光|sunshine|fi|c
即||namely / at once|即使|even if||a
象||elephant / image|大象=dàxiàng|elephant|gi|c
式||style / type|正式|formal||
品||goods / product|食品|food||
程||journey / order|过程|process||
死||to die / dead|死机=sǐjī|(computer) freezes||a
交||to hand over|交朋友=jiāo péngyou|make friends||
规||rule|规定|rule||
取||to take / fetch|取钱=qǔ qián|take out money||
拉||to pull|拉面=lāmiàn|pulled noodles|no|
格||grid / standard|格子=gézi|squares / grid||
术||skill / art|美术=měishù|art (class)||
确||true / sure|正确|correct||
传|chuán|to pass on|传球=chuán qiú|pass the ball|no|
观||to look at|参观|to visit||
切|qiè|all / close to|一切|everything||
导||to guide|导游|tour guide||
争||to fight / compete|竞争|to compete||
风||wind|大风=dà fēng|strong wind|fr|c
改||to change / fix|改变|to change||
收||to receive|收到=shōudào|to receive||
造||to make / build|制造|to make||
言||speech|语言|language||
联||to join|联系|to contact||
持||to hold|支持|to support||
组||group|小组=xiǎozǔ|team / group||
济||to help|经济|economy|wa|
亲||dear / family|亲人=qīnrén|family||
林||woods|森林|forest|le|c
往|wǎng|toward|往前=wǎng qián|go forward||
士||scholar / soldier|护士|nurse||
证||proof|证明|to prove||
失||to lose|失去=shīqù|to lose||
台||platform / stage|舞台=wǔtái|stage||
具||tool|玩具=wánjù|toy||c
流||to flow|流水=liúshuǐ|flowing water|wa|
连||to connect|连接=liánjiē|to connect||
深||deep|很深=hěn shēn|very deep|wa|
质||quality|质量|quality||
集||to gather|集合|to gather||
价||price|价格|price||
整||whole / tidy|整齐|neat||
况||situation|情况|situation|fr|
亚||Asia / second|亚洲|Asia||
技||skill|技术|technology / skill|no|
际||border|国际|international||
约||to arrange / about|大约|about||
究||to research|研究=yánjiū|research||
断||to break / cut|断了=duàn le|it broke||
精||essence / smart|精彩|wonderful||
支||to support / (stick)|一支笔=yì zhī bǐ|one pen||
消||to vanish|消息|news|wa|
增||to increase|增加|to increase|gi|
研||to grind / research|研究=yánjiū|research||
功||skill / merit|功夫=gōngfu|kung fu|no|
农||farming|农村|countryside|le|
广||wide|广场=guǎngchǎng|town square|gi|
标||mark / sign|标准|standard||
谈||to talk|谈话=tánhuà|to talk||
引||to pull / lead|吸引|to attract||
首||head / first|首都|capital city||
专||special|专业|major / specialty||
费||cost / to spend|免费|free (of charge)||
尽|jǐn|utmost|尽管|even though||
另||other|另外|in addition||a
仅||only|不仅|not only||a
随||to follow|随便|as you like||
列||row|排列|to line up||
推||to push|推开=tuīkāi|push open|no|
众||crowd|观众|audience|gi|
案||case / table|答案|answer||
划|huà|to plan / draw|计划|plan||
律||law|法律|law||
态||attitude|态度|attitude||
验||to test|经验|experience||
责||duty|负责|to be in charge||
够||enough|足够=zúgòu|enough|gi|
章||chapter|文章|article||
志||will / aim|杂志|magazine||
底||bottom|海底=hǎidǐ|bottom of the sea||
严||strict|严格|strict||
例||example|例子=lìzi|example||
族||tribe / group|民族|ethnic group||
供||to supply|提供|to provide||
效||effect|效果|effect||
续||to continue|继续|to continue||
留||to stay|留下=liúxià|to stay||
料||material|饮料|drinks||
紧||tight|紧张|nervous||
绝||to cut off|拒绝|to refuse||
察||to examine|警察|police officer||
母||mother|母亲|mother||
批||to criticize / batch|批评|to criticize||
群||group / flock|一群=yì qún|a flock|gi|
按||to press|按下=ànxià|press down|no|
围||to surround|周围|around||
江||river|长江|Yangtze River|wa|
织||to weave|组织|organization||
纪||record / age|世纪|century||
父||father|父亲|father||
密||secret / dense|密码|password||
止||to stop|停止|to stop||
细||thin / fine|仔细|careful||
值||value|值得|worth it||
仍||still|仍然|still||a
破||broken / to break|打破=dǎpò|to break|st|
限||limit|限制|limit||
职||job|职业|job||
速||speed|速度|speed|sp|
否||no / not|否则|otherwise||a
毛||fur / hair|毛衣=máoyī|sweater|fr|
甚||very / even|甚至|even||a
弹|tán|to play (music)|弹琴=tánqín|play the piano|no|
苦||bitter|辛苦|hard work||
假|jià|vacation|放假=fàngjià|holiday break||
印||to print / mark|打印|to print||
预||in advance|预习|to prepare (a lesson)||
微||tiny|微笑=wēixiào|to smile||
继||to continue|继续|to continue||
血|xuè|blood|血型=xuèxíng|blood type||
惊||to startle|吃惊|surprised||
伤||to hurt|伤心|sad||
适||to fit|适合|to suit||
省|shěng|to save / province|省钱=shěng qián|save money||
食||food|食物=shíwù|food||c
险||danger|危险|dangerous||
排||row / line up|排队=páiduì|line up|no|
福||luck / blessing|幸福|happy||
警||alert / police|警察|police officer||
获||to win / get|获得|to obtain||
负||to carry / bear|负责|to be in charge||
停||to stop|停车=tíngchē|to park||
疑||to doubt|怀疑|to doubt||
洲||continent|亚洲|Asia|wa|
范||model / range|范围|range||
竟||unexpectedly|竟然|unexpectedly||a
激||to excite|激动|excited|wa|
村||village|农村|countryside||
卡||card|卡片=kǎpiàn|card||c
判||to judge|判断|to judge||
既||since|既然|since||a
积||to pile up|积极|active||
富||rich / plenty|丰富|plentiful|gi|
修||to fix|修理=xiūlǐ|to repair||
皮||skin|皮球=píqiú|rubber ball||c
降|jiàng|to come down|下降=xiàjiàng|to go down||
坚||hard / firm|坚持|to keep going|st|
免||to avoid / free|免费|free (of charge)||
压||to press|压力|pressure|st|
养||to raise (pets)|养狗=yǎng gǒu|keep a dog||
怀||bosom / to cherish|怀疑|to doubt||
乱||messy|很乱=hěn luàn|very messy||
航||to sail / fly|航班|flight||
优||excellent|优秀|excellent||
著|zhù|famous / to write|著名|famous||
份||portion / copy|一份=yí fèn|one portion||
艺||art / skill|艺术|art||
概||general|大概|probably||
顿||(counter for meals)|一顿=yí dùn|one meal||
户|hù|door / household|户外=hùwài|outdoors||
洋||ocean|海洋|ocean|wa|
评||to judge / review|批评|to criticize||
座||seat / (counter)|一座山=yí zuò shān|a mountain|st|
释||to explain|解释|to explain||
景||view / scene|风景|scenery||
货||goods|售货员|shop assistant||
互||mutual|互相|each other||
危||danger|危险|dangerous||
暗||dark|黑暗=hēi'àn|darkness|sp|
讨||to discuss|讨论|to discuss||
丽||beautiful|美丽|beautiful||
序||order|顺序|order||
永||forever|永远|forever|wa|
味|wèi|taste / smell|味道|taste||
沙||sand|沙子=shāzi|sand|st|c
掉||to fall / drop|掉下=diàoxià|to fall down|no|
括||to include|包括|to include||
杂||mixed|杂志|magazine||
误||mistake|误会|misunderstanding||
减||to reduce|减少|to reduce|fr|
肯||willing|肯定|surely||
败||to lose / fail|失败|to fail||
梦||dream|做梦=zuòmèng|to dream||
散|sàn|to scatter / stroll|散步|to take a walk||
温||warm|温度|temperature|fi|
困||sleepy / stuck|很困=hěn kùn|very sleepy||
渐||gradually|逐渐|gradually|wa|
缺||to lack|缺少|to lack||
掌||palm|鼓掌|to clap|no|
恐||fear|恐龙=kǒnglóng|dinosaur||
松||pine / loose|松树=sōngshù|pine tree|le|c
虑||to think over|考虑|to consider||
幸||lucky|幸运=xìngyùn|lucky||
剧||play / drama|京剧|Beijing opera||
忽||suddenly|忽然|suddenly|sp|
叶||leaf|叶子|leaf|le|c
吸||to suck in|吸管=xīguǎn|drinking straw|no|
呀|ya|(oh!)|好呀=hǎo ya|okay!||a
顺||smooth / along|顺利|smoothly||
输||to lose|输了=shū le|lost||
招||to wave / recruit|招手=zhāoshǒu|to wave|no|
脱||to take off|脱鞋=tuō xié|take off shoes|no|
油||oil|加油站|gas station|wa|
材||material / wood|木材=mùcái|timber|le|
逐||to chase|逐渐|gradually||
博||wide / rich|博物馆=bówùguǎn|museum||
烟||smoke|烟花=yānhuā|fireworks|fi|
授||to teach / give|教授|professor||
禁||to forbid|禁止|forbidden||
孙||grandchild|孙子=sūnzi|grandson||
牙||tooth|牙膏|toothpaste||c
篇||(counter for texts)|一篇=yì piān|one article||
嘴||mouth|嘴巴=zuǐba|mouth||c
遍||time (all through)|一遍=yí biàn|one time through||
础|chǔ|foundation|基础|foundation|st|
翻||to turn over|翻书=fān shū|turn the pages|no|
森||forest|森林|forest|le|
默||silent|幽默|humor||
握||to grip|握手|shake hands|no|
熟|shú|ripe / cooked|熟了=shú le|it's ripe / cooked|fi|
访||to visit|访问|to visit||
软||soft|很软=hěn ruǎn|very soft||
扩||to expand|扩大|to expand|gi|
弄||to do / make|弄坏=nònghuài|to break (it)||
亿||hundred million|一亿=yíyì|100 million|gi|
齐||neat / even|整齐|neat||
刀||knife|小刀=xiǎodāo|small knife||c
窗||window|窗户|window||c
醒||to wake up|醒来=xǐnglái|to wake up||
购||to buy|购物|shopping||
替||to replace|代替|to replace||
虎||tiger|老虎|tiger||c
扬||to raise|表扬|to praise||
毕||to finish|毕业|to graduate||
尤||especially|尤其|especially||a
竞||to compete|竞争|to compete||
弃||to give up|放弃|to give up||
麻|má|hemp / numb|麻烦|trouble||
申||to state|申请|to apply||
售||to sell|售货员|shop assistant||
针||needle|打针=dǎzhēn|get a shot|st|
抱||to hug / hold|拥抱=yōngbào|to hug|no|
鼓||drum|打鼓=dǎ gǔ|play the drum||c
植||to plant|植物|plant|le|
页||page|一页=yí yè|one page||
折||to fold / snap|折纸=zhézhǐ|paper folding|no|
尊||to respect|尊重|to respect||
秀||elegant / show|优秀|excellent||
染||to dye|污染|pollution||
圆||round|圆形=yuánxíng|circle||c
诚||honest|诚实|honest||
宽||wide|很宽=hěn kuān|very wide|gi|
硬||hard|很硬=hěn yìng|very hard|st|
彩||color|彩虹=cǎihóng|rainbow||
抽||to pull out|抽屉=chōuti|drawer|no|
浪||wave|海浪=hǎilàng|ocean wave|wa|
币||coin / money|硬币=yìngbì|coin|st|
丰||plentiful|丰收=fēngshōu|big harvest|gi|
译||to translate|翻译|to translate||
距||distance|距离|distance||
符||symbol|符号=fúhào|symbol||
勇||brave|勇敢|brave|no|
墙||wall|墙上=qiángshang|on the wall|st|c
巧||clever / skillful|巧克力|chocolate||
戴||to wear (hats)|戴上=dàishang|put on||
童||child|儿童|children||
乘||to ride|乘坐|to ride||
挂||to hang|挂上=guàshang|hang up|no|
奖||prize|奖品=jiǎngpǐn|prize||
厚||thick|很厚=hěn hòu|very thick|st|
烦||annoyed|麻烦|trouble|fi|
签||to sign|签名=qiānmíng|to sign (name)||
咱||we / us|咱们|we (you and I)||
奋||to strive|兴奋|excited||
泪||tear (crying)|眼泪=yǎnlèi|tears|wa|
播||to broadcast / sow|广播|broadcast|sp|
桥||bridge|大桥=dàqiáo|big bridge|st|c
寒||cold|寒假|winter vacation|fr|
袋|dài|bag / pocket|口袋=kǒudai|pocket||c
映||to reflect|反映|to reflect|sp|
暂||temporary|暂时|for now||
估||to estimate|估计|to guess||
拒||to refuse|拒绝|to refuse||
忆||to remember|回忆|memory||
孤||alone|孤单|lonely||
闹||noisy|热闹|lively||
厉||stern / fierce|厉害|awesome|gi|
穷||poor|很穷=hěn qióng|very poor||
码||number / code|号码|number||
偶||idol / by chance|偶尔|sometimes||
润||moist|湿润|moist|wa|
稍||slightly|稍微|a little||
抬||to lift|抬头=táitóu|look up|no|
倍||times (x2)|两倍=liǎng bèi|twice as much|gi|
污||dirty|污水=wūshuǐ|dirty water|wa|
耐||to endure|耐心|patient||
粗||thick / rough|粗心|careless||
悉||to know well|熟悉|familiar||
详||detailed|详细|detailed||
允||to allow|允许|to allow||
剩||leftover|剩下=shèngxià|left over||
漫||overflowing|漫画=mànhuà|comic book|wa|
酸||sour|很酸=hěn suān|very sour||
辛||spicy / hard|辛苦|hard work|fi|
挺||quite / straight|挺好=tǐng hǎo|pretty good||
励||to encourage|鼓励|to encourage||
键||key (button)|键盘=jiànpán|keyboard|sp|
扰||to disturb|打扰|to disturb||
阅||to read|阅读|reading||
汗||sweat|出汗=chūhàn|to sweat|wa|
骗||to trick|骗人=piànrén|to fool people||
龄||age|年龄|age||
惜||to cherish|可惜|what a pity||
撞||to bump|撞到=zhuàngdào|bump into|no|
饮||to drink|饮料|drinks|wa|
仔|zǐ|careful / young|仔细|careful||
俩||two (people)|我俩=wǒ liǎ|us two||
凉||cool|凉快|nice and cool|fr|
貌||looks|礼貌|polite||
猜||to guess|猜猜=cāicai|guess!||
怜||to pity|可怜|poor thing||
躺||to lie down|躺下=tǎngxià|lie down|no|
寄||to mail|寄信=jì xìn|mail a letter||
汤||soup|鸡汤=jītāng|chicken soup|wa|c
肥||fat|肥皂=féizào|soap||
尝||to taste|尝尝=chángchang|have a taste||
厌||to dislike|讨厌|to dislike||
脏|zāng|dirty|很脏=hěn zāng|very dirty||
幽||quiet / dim|幽默|funny / humor||
丢||to lose / throw|丢了=diū le|lost it||
陪||to keep company|陪你=péi nǐ|keep you company||
贺||to congratulate|祝贺|congratulations||
瓶||bottle|瓶子|bottle||c
恼||annoyed|烦恼|worries||
敲||to knock|敲门=qiāo mén|knock on the door|no|
湿||wet|湿了=shī le|it's wet|wa|
暖||warm|暖和|warm|fi|
擦||to wipe|擦干=cāgān|wipe dry|no|
猪||pig|小猪=xiǎo zhū|piglet||c
肤||skin|皮肤|skin||
肚|dù|belly|肚子|tummy||c
赢||to win|赢了=yíng le|we won!||
址||address / site|地址|address|st|
悔||to regret|后悔|to regret||
邀||to invite|邀请|to invite||
羽||feather|羽毛=yǔmáo|feather||c
盐||salt|盐水=yánshuǐ|salt water||
傅|fù|teacher / master|师傅|master (skilled)||
帅||handsome / cool|很帅=hěn shuài|so cool||
扔||to throw|扔球=rēng qiú|throw a ball|no|
聊||to chat|聊天|to chat||
傲||proud|骄傲|proud||
拾|shí|to pick up|收拾|to tidy up|no|
填||to fill in|填空|fill in the blank||
扮||to dress up|打扮|to dress up||
愉||joyful|愉快|happy||
慕||to admire|羡慕|to envy||
塑||to mold / plastic|塑料袋|plastic bag||
吵||noisy|很吵=hěn chǎo|very noisy||
羞||shy|害羞|shy||
盒||box|盒子|box||c
棵||(counter for trees)|一棵树=yì kē shù|a tree|le|
谅||to forgive|原谅|to forgive||
谊||friendship|友谊|friendship||
歉||sorry|道歉|to apologize||
赚||to earn|赚钱=zhuàn qián|earn money||
猴|hóu|monkey|猴子|monkey||c
狮|shī|lion|狮子=shīzi|lion||c
脾||temper|脾气|temper||
懒||lazy|懒猫=lǎn māo|lazy cat||
窄||narrow|很窄=hěn zhǎi|very narrow||
骄||proud|骄傲|proud||
聘||to hire|招聘|to hire||
巾||towel / cloth|毛巾|towel||c
堵||to block|堵车|traffic jam||
硕||big / large|硕大=shuòdà|huge|gi|
戚|qī|relative|亲戚|relatives||
笨||clumsy|笨熊=bèn xióng|clumsy bear||
泼||to splash|活泼|lively|wa|
饼||flat cake / cookie|饼干|cookie||c
咳|ké|to cough|咳嗽|to cough||
桶||bucket|水桶=shuǐtǒng|bucket||c
辣||spicy|很辣=hěn là|very spicy|fi|
趟||(trip)|一趟=yí tàng|one trip||
匙|shi|key (part)|钥匙|key||
钥||key|钥匙|key|st|c
咸||salty|很咸=hěn xián|very salty||
燥||dry|干燥|dry|fi|
垃|lā|(trash)|垃圾|trash||
圾|jī|(trash)|垃圾|trash||
逛||to stroll|逛街=guàngjiē|go shopping||
膏||paste / cream|牙膏|toothpaste||
羡||to envy|羡慕|to envy||
暑||summer heat|暑假=shǔjià|summer vacation|fi|
嗽|sòu|to cough|咳嗽|to cough||
袜|wà|sock|袜子|socks||c
柿|shì|persimmon|西红柿|tomato|le|c
乒||ping (sound)|乒乓球|ping-pong||
乓||pong (sound)|乒乓球|ping-pong||
饺|jiǎo|dumpling|饺子|dumplings||c
"""


def fetch(cache, name):
    path = os.path.join(cache, name)
    if not os.path.exists(path):
        os.makedirs(cache, exist_ok=True)
        print('downloading', SOURCES[name], file=sys.stderr)
        with urllib.request.urlopen(SOURCES[name], timeout=120) as r:
            data = r.read()
        with open(path + '.part', 'wb') as f:
            f.write(data)
        os.replace(path + '.part', path)
    return path


def hw_dir(cache, given):
    if given:
        return given
    d = os.path.join(cache, 'hanzi-writer-data')
    if not os.path.isdir(d):
        with tarfile.open(fetch(cache, 'hanzi-writer-data.tgz')) as t:
            for m in t.getmembers():  # only plain .json files, flattened into d
                if m.isfile() and m.name.endswith('.json') and '/' in m.name:
                    base = os.path.basename(m.name)
                    if base in ('package.json',) or '..' in base:
                        continue
                    os.makedirs(d, exist_ok=True)
                    with open(os.path.join(d, base), 'wb') as f:
                        f.write(t.extractfile(m).read())
    return d


# readings the Make Me a Hanzi dictionary lacks but the example words use (toneless)
EXTRA_READINGS = {'谁': 'shei', '觉': 'jiao', '长': 'chang', '地': 'di', '调': 'tiao', '弹': 'tan', '著': 'zhu', '咳': 'ke',
                  '得': 'de', '个': 'ge', '了': 'le', '着': 'zhe', '么': 'me', '子': 'zi', '头': 'tou', '的': 'de'}
TONE_VOWEL = re.compile('[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]')
STRIP = str.maketrans('āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü', 'aaaaeeeeiiiioooouuuuvvvvv')


def join_pinyin(sylls):
    out = sylls[0]
    for s in sylls[1:]:
        out += ("'" if s[:1].translate(STRIP).lower() in 'aoe' else '') + s.lower()  # Cháng Jiāng -> Chángjiāng
    return out


def toneless(s):
    return s.lower().translate(STRIP)


TONES = {v: i % 4 + 1 for i, v in enumerate('āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ')}


def tone(syl):
    return next((TONES[c] for c in syl if c in TONES), 5)


def sandhi(word, wpy, sylls):
    """Mark the usual tone changes of 一 and 不 (yí kuài, yìqǐ, bú pà) so word pinyin matches how it is said;
    一 keeps yī at the end of a word and after 第. Neutral-tone syllables (对不起 duìbuqǐ) are left alone."""
    new = list(sylls)
    for i, c in enumerate(word):
        if c not in '一不' or tone(sylls[i]) == 5:
            continue
        nxt = tone(sylls[i + 1]) if i + 1 < len(word) else None
        if c == '一':
            new[i] = 'yī' if nxt is None or (i and word[i - 1] == '第') else ('yí' if nxt in (4, 5) else 'yì')
        else:
            new[i] = 'bú' if nxt == 4 else 'bù'
    if new == sylls:
        return wpy, sylls
    out, pos = '', 0
    for old, nw in zip(sylls, new):  # rebuild keeping the original spaces / apostrophes
        j = wpy.index(old, pos)
        out += wpy[pos:j] + (nw if old[:1].islower() else nw.capitalize())
        pos = j + len(old)
    return out + wpy[pos:], new


def split_syllables(py, word, syllset, readings):
    """Split pinyin ('hǎorén', "píng'ān", 'pǎo de kuài') into one syllable per character of word. Prefers splits where
    each syllable is a known reading of its character (so 'dàngāo' -> dàn gāo, not dàng āo)."""
    parts = [p for p in re.split(r"[\s']+", py) if p]
    n = len(word)
    for strict in (True, False):
        found = []
        def go(pi, s, acc):
            if found:
                return
            if not s:
                if pi + 1 < len(parts):
                    go(pi + 1, parts[pi + 1], acc)
                elif len(acc) == n:
                    found.append(list(acc))
                return
            if len(acc) >= n:
                return
            for k in range(min(6, len(s)), 0, -1):
                t = toneless(s[:k])
                ok = t in readings.get(word[len(acc)], ()) if strict else t in syllset
                if ok:
                    go(pi, s[k:], acc + [s[:k]])
        if parts:
            go(0, parts[0], [])
        if found:
            return found[0]
    return None

def main():
    ap = argparse.ArgumentParser()
    here = os.path.dirname(os.path.abspath(__file__))
    ap.add_argument('--out', default=os.path.join(here, '..', 'hsk_chars.js'))
    ap.add_argument('--cache', default=os.path.join(tempfile.gettempdir(), 'couchcatch_hsk_cache'), help='download cache directory')
    ap.add_argument('--hw', default=None, help='hanzi-writer-data directory (one <char>.json each); downloaded from npm if omitted')
    ap.add_argument('-v', '--verbose', action='store_true', help='also list readings taken from the dictionary and other notes')
    a = ap.parse_args()

    # ---- HSK 2.0 levels 1-4 words and the level at which each character first appears
    hsk_words, charlvl = {}, {}
    for l in range(1, 5):
        for w in json.load(open(fetch(a.cache, f'hsk{l}.json'), encoding='utf8')):
            s = w['s']
            hsk_words.setdefault(s, (l, w['f'][0]['i']['y']))
            for ch in s:
                if '一' <= ch <= '鿿':
                    charlvl.setdefault(ch, l)
    allwords = {}
    for w in json.load(open(fetch(a.cache, 'complete.json'), encoding='utf8')):
        allwords.setdefault(w['s'], w['f'][0]['i']['y'])
    mmah = {}
    for line in open(fetch(a.cache, 'dictionary.txt'), encoding='utf8'):
        d = json.loads(line)
        mmah[d['character']] = d.get('pinyin') or []
    freq = {r['charcter']: int(r['frequency_rank']) for r in csv.DictReader(open(fetch(a.cache, 'hanziDB.csv'), encoding='utf8'))}
    hw = hw_dir(a.cache, a.hw)
    readings = {c: {toneless(r) for r in rs} for c, rs in mmah.items()}
    for c, r in EXTRA_READINGS.items():
        readings.setdefault(c, set()).add(r)
    syllset = {t for rs in readings.values() for t in rs} | {'r'}

    # ---- curated rows
    rows, problems, notes = {}, [], []
    for ln in CURATED.strip().splitlines():
        if not ln.strip() or ln.startswith('#'):
            continue
        f = ln.split('|')
        if len(f) != 7:
            problems.append('bad line: ' + ln); continue
        ch, py, en, word, wen, theme, flag = f
        wpy = None
        if '=' in word:
            word, wpy = word.split('=')
        if ch in rows:
            problems.append('duplicate: ' + ch)
        if ch not in word:
            problems.append(f'{ch}: example {word} does not contain it')
        if theme not in THEMES or flag not in ('', 'c', 'a'):
            problems.append('bad theme/flag: ' + ln)
        if wpy is None:  # look the word up: HSK 1-4 list first, then the full HSK 2.0+3.0 list
            src = hsk_words.get(word, (None, None))[1] or allwords.get(word)
            if not src:
                problems.append(f'{ch}: no pinyin known for {word}; give it as word=pinyin'); continue
            sylls = src.split()
            if word not in hsk_words:
                sylls = [s.lower() for s in sylls]  # complete.json sometimes lists a surname/proper-noun form first
            wpy = join_pinyin(sylls) if len(sylls) == len(word) else ''.join(sylls)
            if len(sylls) != len(word):
                sylls = split_syllables(wpy, word, syllset, readings)
        else:
            sylls = split_syllables(wpy, word, syllset, readings)
        if not sylls:
            problems.append(f'{ch}: cannot split {wpy!r} into {len(word)} syllables'); continue
        wpy, sylls = sandhi(word, wpy, sylls)
        mine = sylls[word.index(ch)].lower()
        if not py:  # the character's reading = its syllable in the example word, unless that syllable is toneless
            if TONE_VOWEL.search(mine):
                py = mine
            else:  # neutral tone in the word: use the dictionary reading with the same letters
                same = [r for r in mmah.get(ch, []) if toneless(r) == toneless(mine) and TONE_VOWEL.search(r)]
                py = same[0] if same else mine
                notes.append(f'{ch}: toneless in {word} ({wpy}); reading {py} from dictionary')
        if toneless(py) != toneless(mine):
            problems.append(f'{ch}: reading {py} does not match its syllable {mine} in {word} {wpy}')
        elif TONE_VOWEL.search(mine) and py != mine and ch not in '一不':
            notes.append(f'{ch}: reading {py} but {mine} in {word} {wpy}')
        if py not in mmah.get(ch, []) and toneless(py) not in [toneless(r) for r in mmah.get(ch, [])]:
            notes.append(f'{ch}: reading {py} not among dictionary readings {mmah.get(ch)}')
        if len(en.replace('/', ' ').split()) > 3 or len(wen.replace('/', ' ').split()) > 4:
            notes.append(f'{ch}: long gloss {en!r} / {wen!r}')
        rows[ch] = dict(ch=ch, py=py, en=en, word=word, wpy=wpy, wen=wen, theme=THEMES[theme], flag=flag)

    want, have = set(charlvl), set(rows)
    for ch in sorted(want - have):
        problems.append(f'not curated: {ch} (HSK {charlvl[ch]})')
    for ch in sorted(have - want):
        problems.append(f'curated but not in HSK 1-4: {ch}')

    # ---- stroke data; characters hanzi-writer-data lacks are dropped
    entries, missing, embed_bytes, embed = [], [], 0, {}
    for ch in (c for c in rows if c in charlvl):
        p = os.path.join(hw, ch + '.json')
        if not os.path.exists(p):
            missing.append(ch); continue
        j = json.load(open(p, encoding='utf8'))
        e = rows[ch]
        e['hsk'], e['strokes'], e['freq'] = charlvl[ch], len(j['strokes']), freq.get(ch, 9999)
        d = {k: j[k] for k in ('strokes', 'medians', 'radStrokes') if k in j}
        embed[ch] = d
        embed_bytes += len(json.dumps(d, ensure_ascii=False, separators=(',', ':')).encode('utf8'))
        entries.append(e)

    # ---- teaching order: HSK level, then simple + frequent + concrete first
    def score(e):
        s = e['strokes'] + 1.3 * math.log2(e['freq'])
        if e['flag'] == 'c': s -= 4
        if e['flag'] == 'a': s += 6
        return (e['hsk'], s, e['freq'])
    entries.sort(key=score)

    out = ['// Generated by tools/make_hsk.py from the HSK 2.0 level 1-4 word lists - edit the CURATED table there, not this file.',
           '// One entry per character, in teaching order (HSK level, then simple/frequent/concrete first):',
           '// [ch, pinyin, english, word, wordPinyin, wordEnglish, hsk, strokes, theme]  theme: fire water leaf spark stone frost normal giant or ""',
           'window.HSK_CHARS=[']
    for e in entries:
        out.append(json.dumps([e['ch'], e['py'], e['en'], e['word'], e['wpy'], e['wen'], e['hsk'], e['strokes'], e['theme']], ensure_ascii=False) + ',')
    out[-1] = out[-1].rstrip(',')
    out.append('];')
    with open(a.out, 'w', encoding='utf8') as f:
        f.write('\n'.join(out) + '\n')

    allj = json.dumps(embed, ensure_ascii=False, separators=(',', ':')).encode('utf8')
    from collections import Counter
    print(f'{len(entries)} characters -> {os.path.normpath(a.out)}')
    print('per HSK level:', dict(sorted(Counter(e['hsk'] for e in entries).items())))
    print('per theme:', dict(Counter(e['theme'] or '(none)' for e in entries).most_common()))
    print('missing from hanzi-writer-data:', ''.join(missing) or 'none')
    print(f'stroke data if all embedded: {embed_bytes:,} bytes (sum of per-char minified JSON); '
          f'as one object {len(allj):,} bytes, gzipped {len(gzip.compress(allj, 9)):,} bytes')
    if a.verbose and notes:
        print(f'{len(notes)} notes:', *notes, sep='\n  ')
    if problems:
        print(f'{len(problems)} problems:', *problems, sep='\n  ', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
