/* ---------- init ---------- */
load().then(()=>{if(S.stl==='o')S.nost=1;if(S.lang===undefined&&/^ar/i.test(navigator.language||'')){S.lang='ar';if(S.nost===undefined)S.nost=1;}touchStreak();hud();langApply();route();syUI();setTimeout(syncNow,1200);setTimeout(()=>{nfDaily();nfBadge();},1500);setTimeout(prayerTick,200);setTimeout(famTick,900);setTimeout(()=>{const dl=daysLeft();S.exm=S.exm||{};if(S.exam&&dl===1&&!S.exm.eve){S.exm.eve=1;save();love('eve');}else if(S.exam&&dl===0&&!S.exm.day){S.exm.day=1;save();love('exday');}else love('open');},1400);});

/* ---------- installation & mises à jour (PWA) ---------- */
function showUpdate(w){if($('#updbar'))return;const d=document.createElement('div');d.id='updbar';d.className='toast';d.style.cssText+=';display:flex;gap:10px;align-items:center';d.innerHTML='🔄 Nouvelle version disponible <button class="btn" style="padding:4px 12px">Mettre à jour</button>';d.querySelector('button').onclick=()=>{try{w.postMessage('skip');}catch(e){location.reload();}};document.body.appendChild(d);}
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)){
 navigator.serviceWorker.register('sw.js').then(reg=>{
  const chk=()=>reg.waiting&&navigator.serviceWorker.controller&&showUpdate(reg.waiting);chk();
  reg.addEventListener('updatefound',()=>{const nw=reg.installing;nw&&nw.addEventListener('statechange',()=>{if(nw.state==='installed'&&navigator.serviceWorker.controller)showUpdate(nw);});});
  setInterval(()=>reg.update().catch(()=>{}),3600e3);
 }).catch(()=>{});
 let rl=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(rl)return;rl=true;location.reload();});
}
