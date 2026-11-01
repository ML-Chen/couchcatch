// Simplified Chinese names + Hanyu Pinyin for the bilingual (English / 中文) UI.
// All creature names are original to this game. mean = literal gloss of the characters.
const ZH_SPECIES = {
  // ---- fire ----
  'Smoldy':      {zh:'烟狐',   py:'yān hú',          mean:'smoke + fox'},
  'Smolderox':   {zh:'焰狐',   py:'yàn hú',          mean:'flame + fox'},
  'Pyrothane':   {zh:'炎狐王', py:'yán hú wáng',     mean:'blaze + fox + king'},
  'Emberwren':   {zh:'火雀',   py:'huǒ què',         mean:'fire + sparrow'},
  'Cindercrest': {zh:'火冠雀', py:'huǒ guān què',    mean:'fire + crest + sparrow'},
  // ---- water ----
  'Otterpip':    {zh:'潮獭',   py:'cháo tǎ',         mean:'tide + otter'},
  'Tidemink':    {zh:'潮貂',   py:'cháo diāo',       mean:'tide + mink'},
  'Tidewyrm':    {zh:'潮龙',   py:'cháo lóng',       mean:'tide + dragon'},
  'Finnow':      {zh:'小鳍鱼', py:'xiǎo qí yú',      mean:'little + fin + fish'},
  'Brinejaw':    {zh:'海颚鱼', py:'hǎi è yú',        mean:'sea + jaw + fish'},
  'Bubbloo':     {zh:'泡灵',   py:'pào líng',        mean:'bubble + spirit'},
  // ---- leaf ----
  'Clovehop':    {zh:'叶兔',   py:'yè tù',           mean:'leaf + rabbit'},
  'Thistlehare': {zh:'花叶兔', py:'huā yè tù',       mean:'flower + leaf + rabbit'},
  'Briarbuck':   {zh:'枝角兔', py:'zhī jiǎo tù',     mean:'branch + antler + rabbit'},
  'Burrbit':     {zh:'刺球',   py:'cì qiú',          mean:'thorn + ball'},
  'Thornback':   {zh:'刺背兽', py:'cì bèi shòu',     mean:'thorn + back + beast'},
  // ---- spark ----
  'Fizzbit':     {zh:'闪闪虫', py:'shǎn shǎn chóng', mean:'flash + flash + bug'},
  'Fizzlinx':    {zh:'闪翼虫', py:'shǎn yì chóng',   mean:'flash + wing + bug'},
  'Voltalon':    {zh:'闪爪鹰', py:'shǎn zhǎo yīng',  mean:'flash + talon + eagle'},
  'Boltusk':     {zh:'雷牙',   py:'léi yá',          mean:'thunder + tusk'},
  'Tuskvolt':    {zh:'狂雷牙', py:'kuáng léi yá',    mean:'wild + thunder + tusk'},
  // ---- stone ----
  'Pebblin':     {zh:'石豆',   py:'shí dòu',         mean:'stone + bean'},
  'Bouldern':    {zh:'大石怪', py:'dà shí guài',     mean:'big + stone + monster'},
  'Monolord':    {zh:'石霸王', py:'shí bà wáng',     mean:'stone + overlord'},
  'Rollidil':    {zh:'滚甲球', py:'gǔn jiǎ qiú',     mean:'roll + armor + ball'},
  'Bastionox':   {zh:'堡甲牛', py:'bǎo jiǎ niú',     mean:'fortress + armor + ox'},
  // ---- frost ----
  'Flurrle':     {zh:'雪花猫', py:'xuě huā māo',     mean:'snowflake + cat'},
  'Frostlynx':   {zh:'霜山猫', py:'shuāng shān māo', mean:'frost + mountain + cat (lynx)'},
  'Aurorynx':    {zh:'极光猫', py:'jí guāng māo',    mean:'aurora (pole + light) + cat'},
  'Glacimoth':   {zh:'冰蛾',   py:'bīng é',          mean:'ice + moth'},
  'Glacilune':   {zh:'冰月蛾', py:'bīng yuè é',      mean:'ice + moon + moth'},
  // ---- legendary ----
  'Solvane':     {zh:'烈阳鹿', py:'liè yáng lù',     mean:'blazing + sun + deer'},
  'Mireluna':    {zh:'水月龙', py:'shuǐ yuè lóng',   mean:'water + moon + dragon'},
  'Stormlark':   {zh:'雷暴雀', py:'léi bào què',     mean:'thunder + storm + sparrow (lark)'},
  // ---- wave 2: California trip + friends ----
  'Barkpup':     {zh:'小海狮', py:'xiǎo hǎi shī',    mean:'little + sea + lion (sea lion pup)'},
  'Bellowhaul':  {zh:'大海狮', py:'dà hǎi shī',      mean:'big + sea + lion'},
  'Bellmist':    {zh:'小水母', py:'xiǎo shuǐ mǔ',    mean:'little + jellyfish (water + mother)'},
  'Moonveil':    {zh:'月水母', py:'yuè shuǐ mǔ',     mean:'moon + jellyfish (water + mother)'},
  'Zipbeak':     {zh:'快蜂鸟', py:'kuài fēng niǎo',  mean:'fast + hummingbird (bee + bird)'},
  'Thrumwing':   {zh:'雷蜂鸟', py:'léi fēng niǎo',   mean:'thunder + hummingbird (bee + bird)'},
  'Milkwick':    {zh:'火毛虫', py:'huǒ máo chóng',   mean:'fire + caterpillar (fur + bug)'},
  'Regalflare':  {zh:'火王蝶', py:'huǒ wáng dié',    mean:'fire + king + butterfly (monarch)'},
  'Fernfawn':    {zh:'小鹿',   py:'xiǎo lù',         mean:'little + deer (fawn)'},
  'Fernhart':    {zh:'林鹿',   py:'lín lù',          mean:'forest + deer'},
  'Redwoodhart': {zh:'红木鹿', py:'hóng mù lù',      mean:'red + wood (redwood) + deer'},
  'Basklet':     {zh:'沙龟',   py:'shā guī',         mean:'sand + tortoise'},
  'Mesadome':    {zh:'沙山龟', py:'shā shān guī',    mean:'sand + mountain + tortoise'},
  'Rustkit':     {zh:'火熊猫', py:'huǒ xióng māo',   mean:'fire + red panda (bear + cat)'},
  'Blazebrush':  {zh:'焰熊猫', py:'yàn xióng māo',   mean:'flame + red panda (bear + cat)'},
  'Soakbara':    {zh:'水豚',   py:'shuǐ tún',        mean:'water + pig (capybara)'},
  'Springbara':  {zh:'温泉豚', py:'wēn quán tún',    mean:'hot spring (warm + spring) + pig (capybara)'},
  'Screekid':    {zh:'石羊',   py:'shí yáng',        mean:'stone + goat'},
  'Talusram':    {zh:'石角羊', py:'shí jiǎo yáng',   mean:'stone + horn + goat'},
  'Hushflake':   {zh:'雪鸟',   py:'xuě niǎo',        mean:'snow + bird'},
  'Blizzowl':    {zh:'风雪鸮', py:'fēng xuě xiāo',   mean:'wind + snow (blizzard) + owl'},
};

const ZH_TYPES = {
  fire:  {zh:'火', py:'huǒ'},
  water: {zh:'水', py:'shuǐ'},
  leaf:  {zh:'叶', py:'yè'},
  spark: {zh:'电', py:'diàn'},
  stone: {zh:'石', py:'shí'},
  frost: {zh:'冰', py:'bīng'},
};

const ZH_MOVES = {
  'Cinder Spit':    {zh:'吐火',   py:'tǔ huǒ'},
  'Splash Jet':     {zh:'喷水',   py:'pēn shuǐ'},
  'Bramble Whip':   {zh:'刺鞭',   py:'cì biān'},
  'Static Snap':    {zh:'静电击', py:'jìng diàn jī'},
  'Pebble Barrage': {zh:'碎石雨', py:'suì shí yǔ'},
  'Frost Breath':   {zh:'寒气',   py:'hán qì'},
  'Bonk':           {zh:'敲头',   py:'qiāo tóu'},
};

const ZH_ITEMS = {
  orb:   {zh:'留球',   py:'liú qiú'},      // Stay Orb
  great: {zh:'大留球', py:'dà liú qiú'},   // Great Orb
  ultra: {zh:'超留球', py:'chāo liú qiú'}, // Ultra Orb
  berry: {zh:'安心莓', py:'ān xīn méi'},   // Calm Berry
};

const ZH_PLACES = {
  'Backyard':      {zh:'后院',     py:'hòu yuàn'},
  'Lakeshore':     {zh:'湖边',     py:'hú biān'},
  'Old Quarry':    {zh:'旧采石场', py:'jiù cǎi shí chǎng'},
  'Pine Ridge':    {zh:'松岭',     py:'sōng lǐng'},
  'Storm Pier':    {zh:'风暴码头', py:'fēng bào mǎ tou'},
  'Ash Hills':     {zh:'灰山',     py:'huī shān'},
  'Starveil Rift': {zh:'星幕裂谷', py:'xīng mù liè gǔ'},
  'San Diego':     {zh:'圣地亚哥', py:'Shèngdìyàgē'},
  'Los Angeles':   {zh:'洛杉矶',   py:'Luòshānjī'},
  'San Francisco': {zh:'旧金山',   py:'Jiùjīnshān'},
  'Yosemite':      {zh:'优胜美地', py:'Yōushèngměidì'},
};
