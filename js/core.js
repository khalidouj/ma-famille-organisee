
const DATA=window.__DATA__;
const E=DATA.etapes, G=DATA.global;
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const rtn=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
const rt=s=>linkArts(rtn(s));
const ARTMAP={};function artIdx(c){if(!ARTMAP[c]){const m=new Map();((CODES[c]||{}).d||{arts:[]}).arts.forEach((a,i)=>m.set(String(a[0]).toLowerCase(),i));ARTMAP[c]=m;}return ARTMAP[c];}
function linkArts(h){if(!h||!/art/i.test(h))return h;
 return h.replace(/\b(art(?:icles?|\.)?\s*)([LRD]?\d{1,4}(?:-\d{1,3}){0,2})(?![\d-])([^<]{0,48})/gi,(m,pre,num,after)=>{
  const a=after||'';let c=null;
  if(/^\s*(?:\*\*)?\s*(?:du\s+)?(?:code\s+p[ée]nal|CP\b)/i.test(a))c='penal';
  else if(/^\s*(?:\*\*)?\s*(?:du\s+)?(?:code\s+civil|C\.?\s?civ)/i.test(a))c='civil';
  else if(/CPP|CEDH|CPC|DDHC|loi\b|proc[ée]dure|décret|decret/i.test(a.slice(0,22)))c=null;
  else if(num.indexOf('-')>0&&artIdx('penal').has(num.toLowerCase()))c='penal';
  if(!c||!artIdx(c).has(num.toLowerCase()))return m;
  return `<span class="al" data-c="${c}" data-a="${num}" title="Voir l'article dans le ${c==='penal'?'Code pénal':'Code civil'}">${pre}${num}</span>${a}`;});}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.al');if(t){e.preventDefault();e.stopPropagation();showArt(t.dataset.c,t.dataset.a);}},true);
function showArt(c,num){const i=artIdx(c).get(String(num).toLowerCase());if(i===undefined)return;const a=CODES[c].d.arts[i];const d=document.createElement('div');d.className='lv-ov';
 d.innerHTML=`<div class="lv-card" style="text-align:left"><div class="mini">${CODES[c].name} · ${a[1].map(k=>esc(CODES[c].d.nodes[k][1])).join(' › ')}</div><h3 style="margin:.3em 0">Article ${esc(a[0])}</h3>${a[2].split('\n').map(p=>`<p>${esc(p)}</p>`).join('')}<div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap"><button class="btn alt" id="aop">📖 Ouvrir dans le code</button><button class="btn" id="acl">Fermer</button></div></div>`;
 d.onclick=e=>{if(e.target===d)d.remove();};document.body.appendChild(d);$('#acl',d).onclick=()=>d.remove();$('#aop',d).onclick=()=>{d.remove();go('art/'+c+'/'+encodeURIComponent(num));};}
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const DAY=864e5, BOX=[0,0,1,3,7,16];
/* ---------- state ---------- */
let S={xp:0,streak:0,last:'',items:{},theme:'auto',best:{},fav:[],pg:{},fs:100,rd:0,exam:'',bk:0,ut:0};
const IDB={db:null,open(){return new Promise(res=>{try{const r=indexedDB.open('gp-db',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>{IDB.db=r.result;res(IDB.db);};r.onerror=()=>res(null);setTimeout(()=>res(null),1500);}catch(e){res(null);}});},
 async get(){const d=IDB.db||await IDB.open();if(!d)return null;return new Promise(res=>{try{const q=d.transaction('kv').objectStore('kv').get('S');q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null);setTimeout(()=>res(null),1500);}catch(e){res(null);}});},
 async set(v){const d=IDB.db||await IDB.open();if(!d)return;try{d.transaction('kv','readwrite').objectStore('kv').put(v,'S');}catch(e){}}};
IDB.getK=async function(k){const d=IDB.db||await IDB.open();if(!d)return null;return new Promise(res=>{try{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null);setTimeout(()=>res(null),2500);}catch(e){res(null);}});};
IDB.setK=async function(k,v){const d=IDB.db||await IDB.open();if(!d)return false;return new Promise(res=>{try{const tx=d.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=()=>res(true);tx.onerror=()=>res(false);}catch(e){res(false);}});};
IDB.delK=async function(k){const d=IDB.db||await IDB.open();if(!d)return;try{d.transaction('kv','readwrite').objectStore('kv').delete(k);}catch(e){}};
let ADH=null,ADHA=null;
const ADL=[['makkah','🕋 Makkah (La Mecque)'],['mishary','🎙️ Mishary Alafasy'],['refaat','🕌 Mohammad Refaat (Égypte)']];var ADHF=null;async function adhanLoad(){try{ADH=await IDB.getK('adhan');}catch(e){ADH=null;}try{ADHF=await IDB.getK('adhanf');}catch(e){ADHF=null;}if(ADH&&!S.ak)S.ak='custom';}
function adhanStop(){try{if(ADHA){ADHA.pause();ADHA.currentTime=0;}}catch(e){}ADHA=null;}
async function adhanPlay(test,pk){if(!test&&S.ad===0)return false;if(!ADH)await adhanLoad();if(!ADH)return false;adhanStop();try{const u=URL.createObjectURL(pk==='fajr'&&ADHF&&S.ak&&S.ak!=='custom'?ADHF:ADH);ADHA=new Audio(u);ADHA.volume=Math.min(1,Math.max(.1,(S.av||80)/100));ADHA.onended=()=>{try{URL.revokeObjectURL(u);}catch(e){}ADHA=null;};await ADHA.play();return true;}catch(e){ADHA=null;return false;}}
async function load(){let a=null,b=null;try{a=JSON.parse(localStorage.getItem('gp-v1')||'null');}catch(e){}try{b=await IDB.get();}catch(e){}
 const pick=(a&&b)?((b.ut||0)>(a.ut||0)?b:a):(a||b);if(pick)S={...S,...pick};applyPrefs();}
let st;function flush(){let ch=false;try{ch=typeof stampAll==='function'&&stampAll();}catch(e){}S.ut=Date.now();const j=JSON.stringify(S);try{localStorage.setItem('gp-v1',j);}catch(e){}try{IDB.set(JSON.parse(j));}catch(e){}if(ch&&typeof syncSoon==='function')syncSoon();}
function save(){clearTimeout(st);st=setTimeout(flush,300);}
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(st);flush();}});
window.addEventListener('pagehide',()=>{clearTimeout(st);flush();});
/* ---------- affichage ---------- */
function resolveTheme(){const t=S.theme||'auto';if(t!=='auto')return t;const h=new Date().getHours();return(h>=20||h<7)?'dark':'light';}
function applyPrefs(){try{langApply();}catch(e){}document.documentElement.dataset.theme=resolveTheme();document.documentElement.style.fontSize=(S.fs||100)+'%';document.body&&document.body.classList.toggle('read',!!S.rd);}
setInterval(()=>{if((S.theme||'auto')==='auto')applyPrefs();},60000);
function openPrefs(){if($('#pfo'))return;const d=document.createElement('div');d.className='lv-ov';d.id='pfo';
 const draw=()=>{const T=[['auto','🌗 Auto (sombre le soir)'],['light','☀️ Clair'],['sepia','📜 Sépia'],['dark','🌙 Sombre']];
  d.innerHTML=`<div class="lv-card pf" style="text-align:left"><h3 style="margin:0 0 8px">🎨 Affichage</h3><div class="mini">Thème</div><div>${T.map(t=>`<button class="btn ${((S.theme||'auto')===t[0])?'':'alt'}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>
  <div class="mini" style="margin-top:10px">Taille du texte : ${S.fs||100} %</div><div><button class="btn alt" id="fm">A −</button><button class="btn alt" id="fp">A +</button><button class="btn alt" id="fr">Normal</button></div>
  <div class="mini" style="margin-top:10px">Mode lecture (texte plus grand et plus aéré, colonne étroite)</div><div><button class="btn ${S.rd?'':'alt'}" id="rd">${S.rd?'✅ Activé':'Activer'}</button></div>
  <div class="mini" style="margin-top:10px">Langue / اللغة</div><div><button class="btn ${isAr()?'alt':''}" id="lgf" data-nt>Français</button><button class="btn ${isAr()?'':'alt'}" id="lga" data-nt>العربية</button></div>
  ${S.stl==='o'?'':`<div class="mini" style="margin-top:10px">Études de droit (cours, quiz, codes)</div><div><button class="btn ${S.nost?'alt':''}" id="nst">${S.nost?'Masquées':'Affichées'}</button></div>`}
  <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn alt" id="bkp">💾 Ma sauvegarde</button><span style="flex:1"></span><button class="btn" id="pfx">Fermer</button></div></div>`;
  d.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{S.theme=b.dataset.t;applyPrefs();save();draw();});
  $('#fm').onclick=()=>{S.fs=Math.max(80,(S.fs||100)-10);applyPrefs();save();draw();};$('#fp').onclick=()=>{S.fs=Math.min(160,(S.fs||100)+10);applyPrefs();save();draw();};$('#fr').onclick=()=>{S.fs=100;applyPrefs();save();draw();};
  $('#rd').onclick=()=>{S.rd=S.rd?0:1;applyPrefs();save();draw();};$('#lgf').onclick=()=>{d.remove();setLang('fr');};$('#lga').onclick=()=>{d.remove();setLang('ar');};if($('#nst'))$('#nst').onclick=()=>{S.nsa=0;S.nost=S.nost?0:1;flush();langApply();renderTabs((location.hash.slice(1).split('/')[0])||'');draw();};$('#pfx').onclick=()=>d.remove();$('#bkp').onclick=()=>{d.remove();go('data');};};
 d.onclick=e=>{if(e.target===d)d.remove();};document.body.appendChild(d);draw();}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function touchStreak(){const t=today();if(S.last===t)return;const y=ld(new Date(Date.now()-DAY));S.streak=S.last===y?S.streak+1:1;S.last=t;}
function addXp(n){const l0=Math.floor(S.xp/200)+1;S.xp+=n;touchStreak();hud();save();const l1=Math.floor(S.xp/200)+1;if(l1>l0)setTimeout(()=>love('level',l1),1800);}
function hud(){const lvl=Math.floor(S.xp/200)+1,p=(S.xp%200)/2;$('#pLvl').innerHTML=`🏅 Niv. ${lvl} · ${S.xp} XP <span class="xpbar"><i style="width:${p}%"></i></span>`;$('#pStreak').textContent=`🔥 ${S.streak||0} j`;}
function rec(id,ok){const it=S.items[id]||{box:1,due:0,ok:0,ko:0};if(ok){it.box=Math.min(5,it.box+1);it.ok++;}else{it.box=1;it.ko++;}it.due=Date.now()+BOX[it.box]*DAY;S.items[id]=it;S.nr=(S.nr||0)+1;{const w=wk();w.q++;const t=today();if(!w.days.includes(t))w.days.push(t);}save();goalCheck();if(S.nr%14===0)setTimeout(()=>love('mid'),700);}
const isDue=id=>{const it=S.items[id];return it&&it.due<=Date.now();};
/* ---------- data helpers ---------- */
const qid=(k,i)=>`q:${k}:${i}`;
function itemsOf(e){return e.quiz.map((q,i)=>({...q,id:qid('e'+e.n,i),color:e.color}));}
function flashOf(e){const out=[];e.blocks.forEach(b=>b.items.forEach(it=>{if(it.tl)it.tl.forEach(([f,bk])=>out.push({id:`f:e${e.n}:${out.length}`,front:f,back:bk,color:e.color,etape:e}));}));return out;}
function globalItems(){const out=[];G.cases.forEach((c,ci)=>c.qs.forEach((q,i)=>out.push({...q,id:qid('gc'+ci,i),ctx:c.facts,ctxTitle:c.title,color:'#b71c1c'})));G.mixed.forEach((q,i)=>out.push({...q,id:qid('gm',i),color:'#b71c1c'}));return out;}
function allQuestions(){return E.flatMap(itemsOf).concat(globalItems());}
function allFlash(){return E.flatMap(flashOf);}
function quizM(e){const its=itemsOf(e);let m=0;its.forEach(x=>{const k=S.items[x.id]?.box||0;m+=k>=3?1:k===2?.5:0;});return m/its.length;}
function parts(e){const g=S.pg[e.n]||{p:[],c:[]};const fl=flashOf(e);
 return {p:Math.min(1,(g.p||[]).length/e.palace.anchors.length),c:Math.min(1,(g.c||[]).length/e.blocks.length),f:fl.length?fl.filter(x=>S.items[x.id]).length/fl.length:null,q:quizM(e)};}
function progress(e){const p=parts(e);const v=[p.p,p.c,p.f,p.q].filter(x=>x!==null);return Math.round(100*v.reduce((a,b)=>a+b,0)/v.length);}
const mastery=progress;
function markPg(n,k,i){const g=S.pg[n]=S.pg[n]||{p:[],c:[]};if(!g[k].includes(i)){g[k].push(i);save();}}
function overall(){return Math.round(E.reduce((a,e)=>a+progress(e),0)/E.length);}
function nextTab(e){const p=parts(e);return p.p<1?'palais':p.c<1?'cours':(p.f!==null&&p.f<1)?'cartes':'quiz';}
function focusE(){return [...E].sort((a,b)=>progress(a)-progress(b)).find(e=>progress(e)<100)||E[0];}
function daysLeft(){if(!S.exam)return null;const d=new Date(S.exam+'T00:00:00');const t=new Date(today()+'T00:00:00');return Math.round((d-t)/DAY);}
function weekKey(){const d=new Date();const wd=(d.getDay()+6)%7;const m=new Date(d.getTime()-wd*DAY);return ld(m);}
function wk(){const k=weekKey();if(!S.wk||S.wk.k!==k)S.wk={k,days:[],q:0,done:{}};return S.wk;}
function goalCheck(){const w=wk();const G2=[['d3',w.days.length>=3,'Réviser 3 jours cette semaine'],['q50',w.q>=50,'Répondre à 50 questions cette semaine']];
 for(const [id,ok,txt] of G2){if(ok&&!w.done[id]){w.done[id]=1;save();setTimeout(()=>love('goal',txt),1500);break;}}}
function weakItems(){return allQuestions().filter(x=>{const it=S.items[x.id];return it&&it.ko>0&&it.box<=2;}).sort((a,b)=>S.items[b.id].ko-S.items[a.id].ko);}
function dailySet(n=15){const all=allQuestions();const due=shuffle(all.filter(x=>isDue(x.id)));let out=due.slice(0,n);
 if(out.length<n){const f=focusE();const unseen=itemsOf(f).filter(x=>!S.items[x.id]).concat(all.filter(x=>!S.items[x.id]&&!x.id.startsWith('q:e'+f.n+':')));for(const x of unseen){if(out.length>=n)break;if(!out.includes(x))out.push(x);}}
 if(out.length<n){const low=all.filter(x=>S.items[x.id]&&!out.includes(x)).sort((a,b)=>S.items[a.id].box-S.items[b.id].box);for(const x of low){if(out.length>=n)break;out.push(x);}}
 return shuffle(out);}
/* ---------- router ---------- */
function go(h){location.hash=h;}
window.addEventListener('hashchange',route);
function route(){const h=location.hash.slice(1);window.scrollTo(0,0);const [a,b,c]=h.split('/');const _g=!SY.at;document.body.classList.toggle('gate',_g);document.body.classList.toggle('chth',a==='chat'&&!!b);if(a!=='chat'&&CH.conv)chLeave();if(_g)return viewGate();if(S.stl==='o'&&['e','exam','review','science','search','code','penal','today','weak','etudes'].includes(a)){location.hash='';return;}document.body.classList.toggle('study',['e','exam','review','science','search','code','penal','spirit','today','weak','etudes'].includes(a));renderTabs(a||'');
 if(a==='e')return viewEtape(+b,c||'palais');
 if(a==='exam')return viewExam();
 if(a==='review')return viewReview();
 if(a==='science')return viewScience();
 if(a==='search')return viewSearch();
 if(a==='code')return viewCode('civil');
 if(a==='penal')return viewCode('penal');
 if(a==='spirit')return viewSpirit();
 if(a==='admin')return viewAdmin();
 if(a==='today')return viewToday();
 if(a==='cal')return viewCal();
 if(a==='tasks')return viewTasks();
 if(a==='chat')return viewChat(b||'');
 if(a==='log')return viewLog(b||'');
 if(a==='fam')return viewFam();
 if(a==='p')return viewPerson(b);
 if(a==='etudes')return viewHome();
 if(a==='prayer')return viewPrayer();
 if(a==='weak')return viewWeak();
 if(a==='data')return viewData();
 if(a==='sync')return viewSync();
 if(a==='art'){viewCode(b);const i=artIdx(b).get(decodeURIComponent(c||'').toLowerCase());if(i!==undefined)ccArt(i,()=>go(b==='civil'?'code':'penal'));return;}
 viewDash();syPromo();}
function setApp(html){const a=$('#app');a.innerHTML=html;a.firstElementChild&&0;observe();}
function observe(){const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}}),{threshold:.1});document.querySelectorAll('.pt,.tle').forEach((el,i)=>{el.style.transitionDelay=(i%6)*60+'ms';io.observe(el);});}
