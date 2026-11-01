// Loads the game the way the Android app serves it (same fake HTTPS address, same Content-Security-Policy,
// outside hosts blocked except the allowed three) and checks it starts, catches, and saves without errors.
const {chromium}=require('playwright');const fs=require('fs');
const csp=fs.readFileSync(__dirname+'/../android/src/app/couchcatch/MainActivity.java','utf8')
  .match(/CONTENT_SECURITY_POLICY =\s*([\s\S]*?);\n/)[1].split('\n').map(l=>(l.match(/"([^"]*)"/)||[])[1]||'').join('');
const allowed=['fonts.googleapis.com','fonts.gstatic.com','cdn.jsdelivr.net'];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:360,height:629}});
 const errors=[],blocked=[];
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());
   if(u.host==='appassets.androidplatform.net'){ if(u.pathname==='/'||u.pathname==='/index.html') return r.fulfill({status:200,contentType:'text/html; charset=utf-8',headers:{'Content-Security-Policy':csp},body:fs.readFileSync(process.argv[2])}); return r.fulfill({status:404,body:''}); }
   if(u.protocol==='https:'&&allowed.includes(u.host)) return r.fulfill({status:200,body:''}); // offline stand-in
   blocked.push(u.href); return r.abort();});
 const p=await ctx.newPage();
 p.on('pageerror',e=>errors.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'||/Content Security Policy|Refused/.test(m.text()))errors.push(m.type()+': '+m.text().slice(0,200))});
 await p.goto('https://appassets.androidplatform.net/index.html');
 await p.waitForSelector('#starterList button',{timeout:60000});
 await p.click('#starterList button >> nth=0');await p.waitForTimeout(1500);
 const saved=await p.evaluate(()=>!!localStorage.getItem('couchcatch2'));
 // Play a little: finish the neighbor chat if it is open, stay, let creatures come, tap one so the tracing spell opens.
 await p.evaluate(()=>{try{document.querySelectorAll('.talkopts button').forEach(b=>b.click())}catch(e){}});
 await p.waitForTimeout(500);
 await p.evaluate(()=>{const s=document.getElementById('bStay');if(s)s.click()});
 await p.waitForTimeout(6000);
 const traced=await p.evaluate(async()=>{if(typeof traceChar!=='function')return 'no traceChar';const r=traceChar('fire',{purpose:'spell',title:'test'});await new Promise(z=>setTimeout(z,2500));const ok=!!document.querySelector('.tracewrap svg, .tracewrap canvas');document.querySelectorAll('.tracewrap').forEach(e=>e.remove());return ok});
 console.log('tracing overlay drew strokes:',traced);
 console.log('CSP:',csp.slice(0,80)+'…');console.log('started and saved:',saved);console.log('blocked requests:',blocked.length?blocked:'none');
 console.log(errors.length?'ERRORS:\n'+errors.join('\n'):'no page errors or CSP violations');
 await b.close();process.exit(errors.length||!saved?1:0)})();
