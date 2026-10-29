/* ---------- HORAIRES DE PRIÈRE (calcul local, sans connexion) ---------- */
const PCITIES={'Lille':[50.6292,3.0573],'Paris':[48.8566,2.3522],'Lyon':[45.764,4.8357],'Marseille':[43.2965,5.3698],'Bruxelles':[50.8503,4.3517],'Fès':[34.0331,-5.0003],'Casablanca':[33.5731,-7.5898],'Rabat':[34.0209,-6.8416],'Marrakech':[31.6295,-7.9811],'Tanger':[35.7595,-5.834]};
const PMETH={uoif:{n:'UOIF / France (Fajr 12°, Isha 12°)',f:12,i:12},mwl:{n:'Ligue islamique mondiale (18° / 17°)',f:18,i:17},ma:{n:'Maroc (19° / 17°)',f:19,i:17}};
const PNAMES=[['fajr','Fajr','🌌'],['dhuhr','Dhuhr','☀️'],['asr','Asr','🌤️'],['maghrib','Maghrib','🌇'],['isha','Isha','🌙']];
const dr=x=>x*Math.PI/180,rd=x=>x*180/Math.PI,sn=x=>Math.sin(dr(x)),cs=x=>Math.cos(dr(x)),tn=x=>Math.tan(dr(x)),asn=x=>rd(Math.asin(x)),acs=x=>rd(Math.acos(x)),atn2=(y,x)=>rd(Math.atan2(y,x));
const fa=a=>{a=a-360*Math.floor(a/360);return a},fh=h=>{h=h-24*Math.floor(h/24);return h};
function julian(y,m,d){if(m<=2){y--;m+=12;}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;}
function sunPos(jd){const D=jd-2451545.0,g=fa(357.529+0.98560028*D),q=fa(280.459+0.98564736*D),L=fa(q+1.915*sn(g)+0.020*sn(2*g)),e=23.439-0.00000036*D,RA=atn2(cs(e)*sn(L),cs(L))/15;return{decl:asn(sn(e)*sn(L)),eqt:q/15-fh(RA)};}
function prayerTimes(date,lat,lng,meth){const m=PMETH[meth]||PMETH.uoif;const tz=-date.getTimezoneOffset()/60;const jd=julian(date.getFullYear(),date.getMonth()+1,date.getDate())-lng/360;
 const mid=t=>fh(12-sunPos(jd+t).eqt);
 const sat=(ang,t,ccw)=>{const dc=sunPos(jd+t).decl,nn=mid(t),v=(-sn(ang)-sn(dc)*sn(lat))/(cs(dc)*cs(lat));return nn+(ccw?-1:1)*acs(v)/15;};
 const asr=t=>{const dc=sunPos(jd+t).decl;return sat(-rd(Math.atan(1/(1+tn(Math.abs(lat-dc))))),t,false);};
 let T={fajr:5,sunrise:6,dhuhr:12,asr:13,sunset:18,isha:18};
 for(let k=0;k<2;k++){const p={};for(const x in T)p[x]=T[x]/24;T={fajr:sat(m.f,p.fajr,true),sunrise:sat(0.833,p.sunrise,true),dhuhr:mid(p.dhuhr),asr:asr(p.asr),sunset:sat(0.833,p.sunset,false),isha:sat(m.i,p.isha,false)};}
 for(const x in T)T[x]=T[x]+tz-lng/15;T.maghrib=T.sunset;
 const night=fh(T.sunrise-T.sunset);const fix=(t,base,ang,ccw)=>{const mx=ang/60*night;const diff=ccw?fh(base-t):fh(t-base);return(isNaN(t)||diff>mx)?(ccw?base-mx:base+mx):t;};
 T.fajr=fix(T.fajr,T.sunrise,m.f,true);T.isha=fix(T.isha,T.sunset,m.i,false);
 const out={};for(const x of ['fajr','sunrise','dhuhr','asr','maghrib','isha']){const h=fh(T[x]+1/120);const d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),0,0,0);out[x]=new Date(d.getTime()+Math.floor(h*3600)*1000);if(x==='isha'&&out.isha<out.maghrib)out.isha=new Date(out.isha.getTime()+864e5);}
 return out;}
const pcfg=()=>{const c=S.pl||{lat:50.6292,lon:3.0573,name:'Lille',m:'uoif'};return c;};
function ptoday(off=0){const d=new Date();d.setDate(d.getDate()+off);const c=pcfg();return prayerTimes(d,c.lat,c.lon,c.m||'uoif');}
const hhmm=d=>d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
function pnext(){const now=new Date(),t=ptoday(0);for(const [k,n,e] of PNAMES){if(t[k]>now)return{k,n,e,at:t[k]};}const t2=ptoday(1);return{k:'fajr',n:'Fajr',e:'🌌',at:t2.fajr};}
function pin(ms){const m=Math.max(0,Math.round(ms/60000));return m>=60?`${Math.floor(m/60)} h ${String(m%60).padStart(2,'0')}`:`${m} min`;}
function prayedToday(k){return !!(S.pr&&S.pr[today()]&&S.pr[today()].includes(k));}
function setPrayed(k,v){S.pr=S.pr||{};const t=today();const a=S.pr[t]=S.pr[t]||[];const i=a.indexOf(k);if(v&&i<0)a.push(k);if(!v&&i>=0)a.splice(i,1);const keys=Object.keys(S.pr).sort();while(keys.length>40)delete S.pr[keys.shift()];save();}
function prayerCard(){const nx=pnext();const t=ptoday(0);const pr=PNAMES.filter(p=>prayedToday(p[0])).length;
 return `<div class="plan" style="cursor:pointer" onclick="go('prayer')"><h3>🕌 Prochaine prière : ${nx.e} ${nx.n} à ${hhmm(nx.at)} <span class="mini">· dans ${pin(nx.at-new Date())}</span></h3>
 <div class="pm" style="gap:10px">${PNAMES.map(([k,n,e])=>`<span style="font-size:.8rem;${prayedToday(k)?'color:var(--ok);font-weight:700':''}">${prayedToday(k)?'✅':e} ${n} ${hhmm(t[k])}</span>`).join('')}</div>
 <div class="mini">📍 ${esc(pcfg().name)} · ${pr}/5 aujourd'hui · touche pour régler</div></div>`;}
function pwindowEnd(k,t){return {fajr:t.sunrise,dhuhr:t.asr,asr:t.maghrib,maghrib:t.isha,isha:new Date(t.isha.getTime()+3*3600e3)}[k];}
const PMSG=["Mon amour, c'est l'heure de {n} 🕌 Pose tout et va prier : tes révisions t'attendront, et Allah facilitera ce que tu as appris. Je t'aime 💖","Ma chérie, {n} vient d'entrer 🤲 Une petite pause avec Allah, ça fait du bien au cœur et à la tête. Je suis fier de toi.","Coucou mon cœur 💕 C'est l'heure de {n}. Va te ressourcer, je t'attends ! Les articles ne vont pas s'enfuir 😄","C'est l'heure de {n} 🕌 Prier à l'heure, c'est ta force. Tout va bien se passer, in châ' Allah. Je pense à toi 🤍"];
function prayerPopup(item,t){if(loveOpen||$('#pfo')||document.querySelector('.fm'))return false;loveOpen=true;
 const msg=S.nost?'Il est l\'heure de prier 🤲':PMSG[Math.floor(Math.random()*PMSG.length)].replace('{n}',item.n);const r=relPick(['prayer']);
 const d=document.createElement('div');d.className='lv-ov';
 d.innerHTML=`<div class="lv-card"><div class="lv-ico">🕌</div><h3 style="margin:.2em 0">C'est l'heure de ${item.n} · ${hhmm(t[item.k])}</h3><p class="lv-msg">${esc(msg)}</p>${r?relHtml(r,false):''}${S.nost?'':'<div class="lv-sig">— Khalid ❤️</div>'}<button class="btn" id="pgo">🤲 J'y vais</button> <button class="btn alt" id="psn">⏰ Dans 10 min</button></div>`;
 document.body.appendChild(d);try{navigator.vibrate&&navigator.vibrate([200,100,200]);}catch(e){}adhanPlay(false).then(ok=>{if(ok){const b=document.createElement('button');b.className='btn alt';b.textContent='🔇 Arrêter le son';b.onclick=()=>{adhanStop();b.remove();};const host=$('#psn',d);host&&host.after(' ',b);}});
 const close=()=>{adhanStop();loveOpen=false;d.remove();};
 $('#pgo',d).onclick=()=>{S.pa=S.pa||{};S.pa[today()+':'+item.k]=1;save();close();};
 $('#psn',d).onclick=()=>{S.ps=S.ps||{};S.ps[today()+':'+item.k]=Date.now()+600000;save();close();};
 for(let i=0;i<8;i++){const h=document.createElement('span');h.className='lv-h';h.textContent=['🌙','🤍','✨'][i%3];h.style.cssText=`left:${5+Math.random()*90}%;animation-delay:${Math.random()*2.5}s;font-size:${14+Math.random()*14}px`;d.appendChild(h);}
 return true;}
function prayerTick(){try{if(S.pp===0)return;const now=new Date(),t=ptoday(0);
 for(const p of PNAMES){const [k,n,e]=p,at=t[k],end=pwindowEnd(k,t);if(now<at||now>=end)continue;
  const key=today()+':'+k;if((S.pa&&S.pa[key])||prayedToday(k))continue;if(S.ps&&S.ps[key]&&Date.now()<S.ps[key])continue;
  if(prayerPopup({k,n,e},t)){if(S.pn&&window.Notification&&Notification.permission==='granted'&&document.hidden){try{new Notification(trS('🕌 C\'est l\'heure de '+n),{body:S.nost?trS('Il est l\'heure de prier 🤲'):'Va prier, tes révisions t\'attendent ❤️'});}catch(_){}}}
  break;}
 const pill=$('#pPray');if(pill){const nx=pnext();pill.innerHTML=`🕌 <span class="ibt">${nx.n} ${hhmm(nx.at)}</span>`;pill.title=`Prochaine prière : ${nx.n} à ${hhmm(nx.at)} (dans ${pin(nx.at-now)})`;}}catch(e){}}
setInterval(prayerTick,20000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)prayerTick();});
function viewPrayer(){const nx=pnext(),t=ptoday(0),c=pcfg();
 setApp(`<div class="banner" style="--c:#00695c"><h1>🕌 Horaires de prière</h1><div class="mini" style="color:#fff;opacity:.9">📍 ${esc(c.name)} · ${new Date().toLocaleDateString(isAr()?'ar-MA-u-nu-latn':'fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div></div>
 <div class="plan"><div style="font-size:1.3rem"><b>${nx.e} ${nx.n}</b> à <b>${hhmm(nx.at)}</b> <span class="mini">· dans ${pin(nx.at-new Date())}</span></div></div>
 <div class="plan"><h3>Aujourd'hui</h3>${PNAMES.map(([k,n,e])=>`<div class="task" data-k="${k}" style="cursor:default"><span style="font-size:1.4rem">${e}</span><div><b>${n}</b></div><span class="sp"></span><b>${hhmm(t[k])}</b><button class="btn ${prayedToday(k)?'':'alt'}" data-p="${k}" style="padding:4px 10px">${prayedToday(k)?'✅ Priée':'Marquer'}</button></div>`).join('')}<div class="mini">🌅 Lever du soleil : ${hhmm(t.sunrise)} (fin de Fajr)</div></div>
 <div class="plan"><h3>⚙️ Réglages</h3>
  <div><button class="btn" id="geo">📍 Utiliser ma position</button> <span class="mini" id="geos"></span></div>
  <div class="mini" style="margin-top:8px">Ou choisis ta ville :</div><select id="cty" class="srch" style="max-width:320px">${Object.keys(PCITIES).map(n=>`<option ${n===c.name?'selected':''}>${n}</option>`).join('')}${PCITIES[c.name]?'':`<option selected>${esc(c.name)}</option>`}</select>
  <div class="mini" style="margin-top:8px">Méthode de calcul :</div><select id="mth" class="srch" style="max-width:420px">${Object.entries(PMETH).map(([k,v])=>`<option value="${k}" ${k===(c.m||'uoif')?'selected':''}>${v.n}</option>`).join('')}</select>
  <div style="margin-top:10px"><button class="btn ${S.pp===0?'alt':''}" id="ppt">${S.pp===0?'🔕 Rappels désactivés':'🔔 Rappels pendant les révisions : activés'}</button> <button class="btn alt" id="pnt">📲 Notifications du navigateur</button></div>
  <div style="margin-top:12px"><b>🔊 Adhan</b> <span class="mini">· ${ADH?'fichier chargé ✅ ('+Math.round(ADH.size/1024)+' Ko)':'aucun fichier'}</span><div class="mini">Choisis un fichier audio (mp3, m4a…) de l'adhan que tu aimes : il se jouera à l'heure de la prière quand l'appli est ouverte.</div>
   <div><button class="btn alt" id="adf">📂 Choisir mon adhan</button><input type="file" id="adi" accept="audio/*" hidden> ${ADH?'<button class="btn alt" id="adt">▶️ Tester</button> <button class="btn alt" id="ads">⏹️ Stop</button> <button class="btn alt" id="add">🗑️ Retirer</button>':''}</div>
   ${ADH?`<div class="mini" style="margin-top:6px">Volume : <input type="range" id="adv" min="10" max="100" value="${S.av||80}"> · <button class="btn ${S.ad===0?'alt':''}" id="adon" style="padding:3px 10px">${S.ad===0?'🔇 Son désactivé':'🔔 Son activé'}</button></div>`:''}</div>
  <p class="mini">Les horaires sont calculés directement dans l'appli (sans connexion) selon ta position. Ils peuvent différer de quelques minutes de ta mosquée : en cas de doute, suis le calendrier de ta mosquée. Les rappels s'affichent quand l'appli est ouverte.</p></div>`);
 adhanLoad().then(()=>{if($('#adf')&&!!ADH!==!!$('#adt'))viewPrayer();});
 $('#adf').onclick=()=>$('#adi').click();
 $('#adi').onchange=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>15*1024*1024){toast('Fichier trop lourd (max 15 Mo)');return;}if(f.type&&!/^audio\//.test(f.type)){toast('Choisis un fichier audio');return;}const ok=await IDB.setK('adhan',f);if(ok){ADH=f;toast('Adhan enregistré ✅');viewPrayer();}else toast('Enregistrement impossible sur ce navigateur');};
 const t1=$('#adt');if(t1)t1.onclick=async()=>{const ok=await adhanPlay(true);if(!ok)toast('Lecture impossible : touche d\'abord l\'écran puis réessaie');};
 const t2=$('#ads');if(t2)t2.onclick=adhanStop;
 const t3=$('#add');if(t3)t3.onclick=async()=>{adhanStop();await IDB.delK('adhan');ADH=null;toast('Adhan retiré');viewPrayer();};
 const t4=$('#adv');if(t4)t4.oninput=()=>{S.av=+t4.value;save();if(ADHA)ADHA.volume=S.av/100;};
 const t5=$('#adon');if(t5)t5.onclick=()=>{S.ad=S.ad===0?1:0;save();viewPrayer();};
 document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{setPrayed(b.dataset.p,!prayedToday(b.dataset.p));viewPrayer();});
 $('#cty').onchange=e=>{const n=e.target.value;const [lat,lon]=PCITIES[n]||[c.lat,c.lon];S.pl={lat,lon,name:n,m:c.m||'uoif'};save();viewPrayer();};
 $('#mth').onchange=e=>{S.pl={...c,m:e.target.value};save();viewPrayer();};
 $('#ppt').onclick=()=>{S.pp=S.pp===0?1:0;save();viewPrayer();};
 $('#pnt').onclick=()=>{if(!window.Notification){toast('Non disponible sur ce navigateur');return;}Notification.requestPermission().then(p=>{S.pn=p==='granted'?1:0;save();toast(p==='granted'?'Notifications activées ✅':'Notifications refusées');});};
 $('#geo').onclick=()=>{const st=$('#geos');if(!navigator.geolocation){st.textContent='Position indisponible : choisis ta ville.';return;}st.textContent='Recherche…';
  navigator.geolocation.getCurrentPosition(p=>{S.pl={lat:+p.coords.latitude.toFixed(4),lon:+p.coords.longitude.toFixed(4),name:'Ma position',m:c.m||'uoif'};save();viewPrayer();toast('Position enregistrée ✅');},er=>{st.textContent='Position refusée ou indisponible : choisis ta ville dans la liste.';},{timeout:12000,maximumAge:3600000});};}
