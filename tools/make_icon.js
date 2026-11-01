// Renders the launcher icon from the game's own procedural art: Smoldy on a soft glass-blue circle.
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:600,height:600}});
await p.goto('file://'+process.argv[2]);await p.waitForFunction(()=>typeof dc==='function'&&typeof SP!=='undefined'&&typeof fitS==='function',null,{timeout:60000});
const sizes={mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192};
for(const [name,s] of Object.entries(sizes)){
 const data=await p.evaluate((s)=>{const c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');
  const g=x.createRadialGradient(s*.42,s*.35,s*.05,s*.5,s*.5,s*.5);g.addColorStop(0,'#ffffff');g.addColorStop(.55,'#dfeafc');g.addColorStop(1,'#a9c4f2');
  x.fillStyle=g;x.beginPath();x.arc(s/2,s/2,s*.48,0,7);x.fill();
  x.save();x.beginPath();x.arc(s/2,s/2,s*.48,0,7);x.clip();
  const i=SP.findIndex(z=>z.n==='Smoldy');dc(x,i,s*.24,s*.98,fitS(s*.86,s*.86,i,.95)*1.45,0.4,{awake:true});x.restore();
  return c.toDataURL('image/png').split(',')[1]},s);
 fs.mkdirSync(process.argv[3]+'/mipmap-'+name,{recursive:true});fs.writeFileSync(process.argv[3]+'/mipmap-'+name+'/ic_launcher.png',Buffer.from(data,'base64'));}
await b.close();})();
