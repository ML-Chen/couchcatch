// Builds hanzi_writer.js: the Hanzi Writer library (MIT) plus stroke data (Arphic Public License) for every character in trace.js.
// Usage: node tools/make_hanzi.js <node_modules dir> <trace.js> <out hanzi_writer.js> [hsk_chars.js] [extra files with ['字','pinyin',…] entries…]
const fs=require('fs'),path=require('path');const [nm,tracePath,out,hskPath]=process.argv.slice(2);
const src=fs.readFileSync(tracePath,'utf8');const sets=src.slice(src.indexOf('const TRACE_SETS='),src.indexOf('};',src.indexOf('const TRACE_SETS='))+2);
let chars=[...new Set([...sets.matchAll(/\[\s*'(.)'\s*,/g)].map(m=>m[1]))];
for(const extra of process.argv.slice(6)){if(fs.existsSync(extra)){const x=fs.readFileSync(extra,'utf8');chars=[...new Set([...chars,...[...x.matchAll(/\[\s*'(.)'\s*,\s*'[^']*'\s*,/g)].map(m=>m[1])])]}}
if(hskPath&&fs.existsSync(hskPath)){const vm=require('vm'),w={};vm.runInNewContext(fs.readFileSync(hskPath,'utf8'),{window:w});chars=[...new Set([...chars,...(w.HSK_CHARS||[]).map(e=>e[0])])]}
const data={},missing=[];for(const c of chars){const f=path.join(nm,'hanzi-writer-data',c+'.json');if(fs.existsSync(f)){const j=JSON.parse(fs.readFileSync(f,'utf8'));data[c]={strokes:j.strokes,medians:j.medians.map(md=>md.map(pt=>pt.map(Math.round))),radStrokes:j.radStrokes}}else missing.push(c)}
const lib=fs.readFileSync(path.join(nm,'hanzi-writer','dist','hanzi-writer.min.js'),'utf8');
fs.writeFileSync(out,'/* Hanzi Writer 3.5.0 (MIT, (c) David Chanin) */\n'+lib+'\n/* Stroke data: hanzi-writer-data 2.0.1, derived from Make Me a Hanzi (Arphic Public License) */\nwindow.TRACE_DATA='+JSON.stringify(data)+';\n');
console.log(chars.length+' chars:',chars.length>80?chars.slice(0,80).join('')+'…':chars.join(''),'| missing:',missing.join('')||'none','| bytes',fs.statSync(out).size);
