// ---------- Creature book entries: tap a creature in the book to see (and hear) it, and where to find it ----------
(function(){
const css=`.dexwrap{position:fixed;inset:0;z-index:58;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(10,14,24,.35)}
.dexcard{width:min(360px,100%);border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:10px;align-items:center;background:rgba(250,251,255,.985)!important;color:#1c2333;box-shadow:0 24px 60px rgba(0,0,0,.35);text-align:center;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.dexcard canvas{width:200px;height:170px}
.dexcard .dzh{font-family:'Noto Sans SC',sans-serif;font-size:1.6rem;font-weight:600;line-height:1.1;cursor:pointer}
.dexcard .dpy{font-size:.85rem;color:#5b6478}.dexcard .den{font-size:.78rem;color:#6b7387}
.dexcard .drow{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;font-size:.78rem;color:#38415a}
.dexcard .dplace{padding:3px 9px;border-radius:99px;background:rgba(60,90,160,.09)}
.dexcard .devo{display:flex;align-items:center;gap:4px;justify-content:center}
.dexcard .devo canvas{width:56px;height:52px}.dexcard .devo span{color:#9aa3b5}
.dexcard button{margin-top:2px}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
function placesFor(i){const s=SP[i];let b=i;while(SP[b].prev!=null)b=SP[b].prev;const out=[];
  PLACES.forEach((p,k)=>{const hab=SP[b].hab&&SP[b].hab.includes(p.key),typ=SP[b].ts.some(t=>p.types.includes(t));if(hab||(typ&&!SP[b].hab))out.push({k,hab})});
  if(SP[b].leg)return[{k:PLACES.findIndex(p=>p.rift),hab:true}];return out.sort((a,b)=>(b.hab-a.hab))}
function mini(cv,i,got,w,h){const d=Math.min(3,devicePixelRatio||1);cv.width=w*d;cv.height=h*d;const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);dc(x,i,w/2,h*.94,fitS(w,h,i,.9),0,got?{awake:true}:{silhouette:'#4a5578'})}
// a creature not found yet keeps its mystery: only its silhouette, no type, evolutions or places
window.openDex=function(i,got){const s=SP[i],z=ZS(s.n);const wrap=document.createElement('div');wrap.className='dexwrap';
  const chain=[];let b=i;while(SP[b].prev!=null)b=SP[b].prev;for(let k=b;k!=null;k=SP[k].next)chain.push(k);
  const seen=new Set([...(S.caught||[]),...S.col.map(c=>c.sp)]);
  const pl=placesFor(i).slice(0,5).map(o=>`<span class="dplace">${o.hab?'★ ':''}${ZP(PLACES[o.k].n).zh||''} ${PLACES[o.k].n}</span>`).join('');
  wrap.innerHTML=`<div class="dexcard"><canvas class="dbig"></canvas>
    ${got?`<div class="dzh" data-say="${z.zh}">${z.zh}</div><div class="dpy">${z.py}</div><div class="den">${s.n}${s.leg?' · Legendary':''}</div>
    <div class="drow">${tyChips(i)}</div>
    ${chain.length>1?`<div class="devo">${chain.map((k,j)=>`${j?'<span>›</span>':''}<canvas data-k="${k}"></canvas>`).join('')}</div>`:''}
    <div class="drow">${pl}</div>`:`<div class="dzh">？？？</div><div class="den">Not found yet${zw('还没找到','hái méi zhǎo dào')}</div>`}
    <button class="small">OK${zw('好的','hǎo de')}</button></div>`;
  document.body.appendChild(wrap);
  const big=wrap.querySelector('.dbig'),d=Math.min(3,devicePixelRatio||1);big.width=200*d;big.height=170*d;const bx=big.getContext('2d');
  const loop=()=>{if(!wrap.isConnected)return;bx.setTransform(d,0,0,d,0,0);bx.clearRect(0,0,200,170);dc(bx,i,100,160,fitS(200,170,i,.9),performance.now()/1000,got?{awake:true}:{silhouette:'#4a5578'});requestAnimationFrame(loop)};loop();
  wrap.querySelectorAll('.devo canvas').forEach(cv=>mini(cv,+cv.dataset.k,seen.has(+cv.dataset.k),56,52));
  wrap.onclick=e=>{if(e.target===wrap||e.target.closest('button'))wrap.remove()};
  if(got&&z.zh)speak(z.zh);try{LOG('dex_open',{sp:s.n,got})}catch(e){}};
document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('.bookcell[data-i]');if(c){openDex(+c.dataset.i,c.dataset.got==='1')}});
})();
