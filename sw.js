const CACHE='gp-0950b77f59';
const ASSETS=["./", "index.html", "css/style.css", "manifest.webmanifest", "js/data-course.js", "js/data-civil.js", "js/data-penal.js", "js/core.js", "js/views.js", "js/planning.js", "js/prayer.js", "js/family.js", "js/codes.js", "js/fx.js", "js/love.js", "js/init.js", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith('gp-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting();});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>r.mode==='navigate'?caches.match('index.html'):Response.error())));});
