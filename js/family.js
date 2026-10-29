/* ---------- VIE DE FAMILLE ---------- */
const FCOL=['#e91e63','#3f51b5','#009688','#ff9800','#9c27b0','#4caf50','#795548','#00bcd4','#f44336','#607d8b'];
const FEMO=['👩','👨','👧','👦','👵','👴','🧒','👶','🧕','🧔'];
const MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const JOURS=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const uid=()=>Math.random().toString(36).slice(2,9);
const ld=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const pdt=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);};
const addD=(s,n)=>{const d=pdt(s);d.setDate(d.getDate()+n);return ld(d);};
const dtm=(s,tm)=>{const d=pdt(s);const [h,m]=(tm||'00:00').split(':').map(Number);d.setHours(h,m,0,0);return d;};
const fam=()=>S.fam=S.fam||[],evs=()=>S.ev=S.ev||[],tks=()=>S.tk=S.tk||[];
const person=id=>fam().find(p=>p.id===id);
const pchips=ids=>(ids||[]).map(id=>{const p=person(id);return p?`<span class="pchip" style="--pc:${p.c}">${p.e} ${esc(p.n)}</span>`:'';}).join('');
const fdate=(s,long)=>{const d=pdt(s);return (long?JOURS[d.getDay()]+' ':JOURS[d.getDay()].slice(0,3)+'. ')+d.getDate()+' '+(long?MOIS[d.getMonth()]:MOIS[d.getMonth()].slice(0,4)+(MOIS[d.getMonth()].length>4?'.':''));};
const RP=[['','Une seule fois'],['d','Chaque jour'],['w','Chaque semaine'],['m','Chaque mois'],['y','Chaque année']];
const RM=[['','Aucun rappel'],['0',"À l'heure"],['15','15 min avant'],['60','1 h avant'],['1440','La veille'],['m','Le matin même (8 h)']];
function occurs(it,date){const s=it.d;if(!s||date<s)return false;if(!it.rp)return date===s;const a=pdt(s),b=pdt(date);
 if(it.rp==='d')return true;if(it.rp==='w')return a.getDay()===b.getDay();
 if(it.rp==='m'){const last=new Date(b.getFullYear(),b.getMonth()+1,0).getDate();return b.getDate()===Math.min(a.getDate(),last);}
 if(it.rp==='y'){const dd=(a.getMonth()===1&&a.getDate()===29&&!(b.getFullYear()%4===0&&(b.getFullYear()%100!==0||b.getFullYear()%400===0)))?28:a.getDate();return b.getMonth()===a.getMonth()&&b.getDate()===dd;}
 return false;}
function itemsOn(date,filt){const out=[];
 evs().forEach(e=>{if(occurs(e,date))out.push({k:'ev',id:e.id,t:e.t,tm:e.tm,w:e.w,pl:e.pl,date,it:e});});
 tks().forEach(t=>{if(!t.d||t.dn)return;if(t.d===date)out.push({k:'tk',id:t.id,t:t.t,tm:t.tm,w:t.w,date,it:t});});
 fam().forEach(p=>{if(p.b&&p.b.slice(5)===date.slice(5)){const age=p.b.slice(0,4)&&+date.slice(0,4)-+p.b.slice(0,4);out.push({k:'bd',id:p.id,t:`🎂 Anniversaire de ${p.n}${age>0&&age<120?' ('+age+' ans)':''}`,w:[p.id],date});}});
 const f=filt&&filt.length?out.filter(x=>x.k==='bd'?filt.includes(x.id):(x.w||[]).some(i=>filt.includes(i))||!(x.w||[]).length&&0):out;
 return f.sort((a,b)=>(a.tm||'')<(b.tm||'')?-1:(a.tm||'')>(b.tm||'')?1:0);}
function overdue(){const t=today();return tks().filter(x=>!x.dn&&x.d&&x.d<t).sort((a,b)=>a.d<b.d?-1:1);}
/* ---- modal helper ---- */
function modal(title,html,o){const d=document.createElement('div');d.className='lv-ov fm';
 d.innerHTML=`<div class="lv-card fcard"><h3 style="margin:0 0 8px">${title}</h3><div>${html}</div><div class="frow"><button class="btn" id="msave">${o.save||'Enregistrer'}</button>${o.del?'<button class="btn alt" id="mdel">🗑️ Supprimer</button>':''}<span style="flex:1"></span><button class="btn alt" id="mcan">Annuler</button></div></div>`;
 document.body.appendChild(d);const close=()=>d.remove();d.onclick=e=>{if(e.target===d)close();};$('#mcan',d).onclick=close;
 $('#msave',d).onclick=()=>{if(o.onSave(d)!==false)close();};if(o.del)$('#mdel',d).onclick=()=>{if(confirm('Supprimer définitivement ?')){o.del();close();}};return d;}
function pickHtml(sel){if(!fam().length)return '<div class="mini">Ajoute d\'abord des personnes dans « Famille ».</div>';return `<div class="pick">${fam().map(p=>`<button type="button" class="pchip pk ${(sel||[]).includes(p.id)?'on':''}" data-id="${p.id}" style="--pc:${p.c}">${p.e} ${esc(p.n)}</button>`).join('')}</div>`;}
function pickBind(d,sel){d.querySelectorAll('.pk').forEach(b=>b.onclick=()=>{const i=sel.indexOf(b.dataset.id);if(i<0){sel.push(b.dataset.id);b.classList.add('on');}else{sel.splice(i,1);b.classList.remove('on');}});}
const opt=(arr,v)=>arr.map(([k,l])=>`<option value="${k}" ${String(v??'')===k?'selected':''}>${l}</option>`).join('');
function refresh(){route();}
/* ---- forms ---- */
function evForm(id,date){const e=id?evs().find(x=>x.id===id):{t:'',d:date||today(),tm:'',w:[],pl:'',nt:'',rp:'',rm:'60'};if(!e)return;const sel=[...(e.w||[])];
 const d=modal(id?'✏️ Rendez-vous':'📅 Nouveau rendez-vous',`<label class="fl">Quoi ?<input class="srch" id="f_t" placeholder="ex : Dentiste, Réunion école…" value="${esc(e.t)}"></label>
 <div class="fgrid"><label class="fl">Date<input type="date" class="srch" id="f_d" value="${e.d}"></label><label class="fl">Heure (facultatif)<input type="time" class="srch" id="f_tm" value="${e.tm||''}"></label></div>
 <div class="fl">Pour qui ?${pickHtml(sel)}</div><label class="fl">Lieu<input class="srch" id="f_pl" value="${esc(e.pl||'')}" placeholder="adresse, nom du cabinet…"></label>
 <div class="fgrid"><label class="fl">Répéter<select class="srch" id="f_rp">${opt(RP,e.rp)}</select></label><label class="fl">Rappel<select class="srch" id="f_rm">${opt(RM,e.rm)}</select></label></div>
 <label class="fl">Notes<textarea class="srch" id="f_nt" rows="2" placeholder="documents à apporter, numéro de téléphone…">${esc(e.nt||'')}</textarea></label>`,
 {del:id?()=>{S.ev=evs().filter(x=>x.id!==id);save();refresh();}:null,onSave:d=>{const t=$('#f_t',d).value.trim();if(!t){toast('Donne un titre');return false;}
  const o={id:id||uid(),t,d:$('#f_d',d).value||today(),tm:$('#f_tm',d).value,w:sel,pl:$('#f_pl',d).value.trim(),nt:$('#f_nt',d).value.trim(),rp:$('#f_rp',d).value,rm:$('#f_rm',d).value};
  if(id)Object.assign(e,o);else evs().push(o);save();refresh();setTimeout(famTick,300);}});pickBind(d,sel);}
function tkForm(id,date){const e=id?tks().find(x=>x.id===id):{t:'',d:date||'',tm:'',w:[],pr:0,nt:'',rp:'',rm:''};if(!e)return;const sel=[...(e.w||[])];
 const d=modal(id?'✏️ Tâche':'✅ Nouvelle tâche',`<label class="fl">À faire<input class="srch" id="f_t" placeholder="ex : Payer la cantine, Appeler la mairie…" value="${esc(e.t)}"></label>
 <div class="fgrid"><label class="fl">Pour le<input type="date" class="srch" id="f_d" value="${e.d||''}"></label><label class="fl">Heure (facultatif)<input type="time" class="srch" id="f_tm" value="${e.tm||''}"></label></div>
 <div class="fl">Pour qui ?${pickHtml(sel)}</div>
 <div class="fgrid"><label class="fl">Répéter<select class="srch" id="f_rp">${opt(RP,e.rp)}</select></label><label class="fl">Rappel<select class="srch" id="f_rm">${opt(RM,e.rm)}</select></label></div>
 <label class="fl" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="f_pr" ${e.pr?'checked':''}> ⭐ Important</label>
 <label class="fl">Notes<textarea class="srch" id="f_nt" rows="2">${esc(e.nt||'')}</textarea></label>`,
 {del:id?()=>{S.tk=tks().filter(x=>x.id!==id);save();refresh();}:null,onSave:d=>{const t=$('#f_t',d).value.trim();if(!t){toast('Écris la tâche');return false;}
  const o={id:id||uid(),t,d:$('#f_d',d).value,tm:$('#f_tm',d).value,w:sel,pr:$('#f_pr',d).checked?1:0,nt:$('#f_nt',d).value.trim(),rp:$('#f_rp',d).value,rm:$('#f_rm',d).value,dn:e.dn||0};
  if(o.rp&&!o.d)o.d=today();if(o.rm&&!o.d)o.rm='';
  if(id)Object.assign(e,o);else tks().push(o);save();refresh();setTimeout(famTick,300);}});pickBind(d,sel);}
function pForm(id){const p=id?person(id):{n:'',e:FEMO[fam().length%FEMO.length],c:FCOL[fam().length%FCOL.length],r:'',b:'',nt:''};if(!p)return;let emo=p.e,col=p.c;
 const d=modal(id?'✏️ Personne':'👪 Nouvelle personne',`<label class="fl">Prénom<input class="srch" id="f_n" value="${esc(p.n)}"></label>
 <label class="fl">Rôle<input class="srch" id="f_r" value="${esc(p.r||'')}" placeholder="ex : Maman, Papa, Fils, Grand-mère…"></label>
 <div class="fl">Emoji<div class="pick">${FEMO.map(x=>`<button type="button" class="pchip pk2 ${x===emo?'on':''}" data-e="${x}" style="--pc:#888">${x}</button>`).join('')}</div></div>
 <div class="fl">Couleur<div class="pick">${FCOL.map(x=>`<button type="button" class="sw ${x===col?'on':''}" data-c="${x}" style="background:${x}"></button>`).join('')}</div></div>
 <label class="fl">Anniversaire<input type="date" class="srch" id="f_b" value="${p.b||''}"></label>
 <label class="fl">Notes (école, médecin, allergies…)<textarea class="srch" id="f_nt" rows="3" placeholder="Évite d'écrire des mots de passe ou numéros sensibles.">${esc(p.nt||'')}</textarea></label>`,
 {del:id?()=>{S.fam=fam().filter(x=>x.id!==id);evs().forEach(e=>e.w=(e.w||[]).filter(i=>i!==id));tks().forEach(e=>e.w=(e.w||[]).filter(i=>i!==id));save();go('fam');refresh();}:null,onSave:d=>{const n=$('#f_n',d).value.trim();if(!n){toast('Écris un prénom');return false;}
  const o={id:id||uid(),n,e:emo,c:col,r:$('#f_r',d).value.trim(),b:$('#f_b',d).value,nt:$('#f_nt',d).value.trim()};if(id)Object.assign(p,o);else fam().push(o);save();refresh();}});
 d.querySelectorAll('.pk2').forEach(b=>b.onclick=()=>{emo=b.dataset.e;d.querySelectorAll('.pk2').forEach(x=>x.classList.toggle('on',x===b));});
 d.querySelectorAll('.sw').forEach(b=>b.onclick=()=>{col=b.dataset.c;d.querySelectorAll('.sw').forEach(x=>x.classList.toggle('on',x===b));});}
function quickAddFam(){const d=modal('👪 Ajouter plusieurs personnes',`<div class="mini">Écris un prénom par ligne (ex : « Maman », « Yassine »…). Tu pourras modifier chaque fiche ensuite.</div><textarea class="srch" id="f_l" rows="8" placeholder="Prénom 1\nPrénom 2\n…"></textarea>`,{save:'Ajouter',onSave:d=>{const l=$('#f_l',d).value.split('\n').map(x=>x.trim()).filter(Boolean);if(!l.length)return false;l.forEach(n=>{const k=fam().length;fam().push({id:uid(),n,e:FEMO[k%FEMO.length],c:FCOL[k%FCOL.length],r:'',b:'',nt:''});});save();refresh();}});}
/* ---- rows ---- */
function rowHtml(x,showDate){const tk=x.k==='tk';const done=tk&&x.it.dn;const star=tk&&x.it.pr?'⭐ ':'';
 const when=showDate?`<span class="mini">${fdate(x.date)}${x.tm?' · '+x.tm:''}</span>`:(x.tm?`<b>${x.tm}</b>`:'<span class="mini">Journée</span>');
 return `<div class="frow2 ${x.k}" data-k="${x.k}" data-id="${x.id}" data-date="${x.date}">${tk?`<button class="chk ${done?'on':''}" data-chk="${x.id}" title="Fait">${done?'✓':''}</button>`:`<span class="ico">${x.k==='bd'?'🎂':'📅'}</span>`}<div class="fb2"><div>${star}${esc(x.t)}</div><div class="mini">${when} ${x.pl?'· 📍 '+esc(x.pl):''}</div><div>${pchips(x.w)}</div></div></div>`;}
function bindRows(root){root.querySelectorAll('.frow2').forEach(r=>r.onclick=e=>{const c=e.target.closest('[data-chk]');if(c){e.stopPropagation();toggleTask(c.dataset.chk);return;}
 const k=r.dataset.k;if(k==='ev')evForm(r.dataset.id);else if(k==='tk')tkForm(r.dataset.id);else go('p/'+r.dataset.id);});}
function advance(t){if(t.rp==='d')t.d=addD(t.d,1);else if(t.rp==='w')t.d=addD(t.d,7);else if(t.rp==='m'){const d=pdt(t.d);const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+1);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));t.d=ld(d);}else if(t.rp==='y'){const d=pdt(t.d);d.setFullYear(d.getFullYear()+1);t.d=ld(d);}}
function toggleTask(id){const t=tks().find(x=>x.id===id);if(!t)return;if(t.rp&&!t.dn){advance(t);toast('Prochaine fois : '+fdate(t.d));}else{t.dn=t.dn?0:1;t.dnAt=t.dn?Date.now():0;if(t.dn)toast('Bravo, une de moins ✅');}save();refresh();}
/* ---- views ---- */
function greet(){const h=new Date().getHours();return h<5?'Bonne nuit 🌙':h<12?'Bonjour ☀️':h<18?'Bon après-midi 🌤️':'Bonsoir 🌙';}
function viewDash(){const t=today(),od=overdue(),now=items=>items;const todayItems=itemsOn(t),tom=itemsOn(addD(t,1));
 const nextDays=[];for(let i=2;i<=7;i++){const d=addD(t,i);const it=itemsOn(d);if(it.length)nextDays.push([d,it]);}
 const noDate=tks().filter(x=>!x.dn&&!x.d);const open=tks().filter(x=>!x.dn).length;
 setApp(`<div class="banner" style="--c:#3949ab"><h1>${greet()}</h1><div class="mini" style="color:#fff;opacity:.9">${fdate(t,1)} · ${todayItems.length?todayItems.length+' chose'+(todayItems.length>1?'s':'')+' aujourd\'hui':'rien de prévu aujourd\'hui'}</div></div>
 <div class="row"><button class="btn" id="aEv">📅 + Rendez-vous</button><button class="btn" id="aTk">✅ + Tâche</button></div>
 ${!fam().length?`<div class="plan"><h3>👪 Commence par ta famille</h3><div class="mini">Ajoute les personnes dont tu gères les rendez-vous, les papiers et les tâches.</div><div class="row"><button class="btn" onclick="quickAddFam()">Ajouter plusieurs personnes d'un coup</button><button class="btn alt" onclick="pForm()">Une seule personne</button></div></div>`:''}
 ${od.length?`<div class="plan" style="border-color:#e53935"><h3>⚠️ En retard (${od.length})</h3>${od.slice(0,6).map(x=>rowHtml({k:'tk',id:x.id,t:x.t,tm:x.tm,w:x.w,date:x.d,it:x},1)).join('')}${od.length>6?`<div class="mini">… et ${od.length-6} autres, dans l'onglet Tâches</div>`:''}</div>`:''}
 <div class="plan"><h3>📌 Aujourd'hui</h3>${todayItems.length?todayItems.map(x=>rowHtml(x)).join(''):'<div class="mini">Rien de prévu. Profites-en ! 🌿</div>'}</div>
 ${prayerCard()}
 <div class="plan"><h3>🌅 Demain</h3>${tom.length?tom.map(x=>rowHtml(x)).join(''):'<div class="mini">Rien de prévu.</div>'}</div>
 ${nextDays.length?`<div class="plan"><h3>🗓️ Les prochains jours</h3>${nextDays.map(([d,l])=>`<div class="mini" style="margin-top:6px"><b>${fdate(d,1)}</b></div>${l.map(x=>rowHtml(x)).join('')}`).join('')}</div>`:''}
 ${noDate.length?`<div class="plan"><h3>📝 Sans date (${noDate.length})</h3>${noDate.slice(0,5).map(x=>rowHtml({k:'tk',id:x.id,t:x.t,tm:'',w:x.w,date:'',it:x})).join('')}</div>`:''}
 <div class="plan" style="cursor:pointer" onclick="go('etudes')"><h3>📚 Mes études de droit</h3><div class="mini">Avancement total : <b>${overall()}%</b> · session du jour, quiz, flashcards, codes</div></div>`);
 bindRows($('#app'));$('#aEv').onclick=()=>evForm();$('#aTk').onclick=()=>tkForm();}
const CAL={y:new Date().getFullYear(),m:new Date().getMonth(),sel:today(),f:[],list:0};
function viewCal(){const first=new Date(CAL.y,CAL.m,1),start=(first.getDay()+6)%7,days=new Date(CAL.y,CAL.m+1,0).getDate(),t=today();
 let cells='';for(let i=0;i<start;i++)cells+='<div class="cd off"></div>';
 for(let d=1;d<=days;d++){const ds=`${CAL.y}-${String(CAL.m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const it=itemsOn(ds,CAL.f);
  const cols=[...new Set(it.map(x=>(person((x.w||[])[0])||{c:'#9e9e9e'}).c))].slice(0,4);
  cells+=`<div class="cd ${ds===t?'today':''} ${ds===CAL.sel?'sel':''}" data-d="${ds}"><span>${d}</span><div class="dots">${cols.map(c=>`<i style="background:${c}"></i>`).join('')}</div>${it.length>1?`<small>${it.length}</small>`:''}</div>`;}
 const sel=itemsOn(CAL.sel,CAL.f);
 let listHtml='';if(CAL.list){for(let i=0;i<30;i++){const d=addD(t,i);const it=itemsOn(d,CAL.f);if(it.length)listHtml+=`<div class="mini" style="margin-top:8px"><b>${fdate(d,1)}</b></div>${it.map(x=>rowHtml(x)).join('')}`;}if(!listHtml)listHtml='<div class="mini">Rien dans les 30 prochains jours.</div>';}
 setApp(`<div class="banner" style="--c:#00897b"><h1>📅 Calendrier</h1></div>
 ${fam().length?`<div class="pick" style="margin:8px 0"><button class="pchip pk ${CAL.f.length?'':'on'}" id="fAll" style="--pc:#555">Tous</button>${fam().map(p=>`<button class="pchip pk ${CAL.f.includes(p.id)?'on':''}" data-f="${p.id}" style="--pc:${p.c}">${p.e} ${esc(p.n)}</button>`).join('')}</div>`:''}
 <div class="row" style="margin:6px 0"><button class="btn alt" id="cp">◀</button><b style="flex:1;text-align:center;font-size:1.1rem">${MOIS[CAL.m][0].toUpperCase()+MOIS[CAL.m].slice(1)} ${CAL.y}</b><button class="btn alt" id="cn">▶</button><button class="btn alt" id="ct">Aujourd'hui</button><button class="btn alt" id="cl">${CAL.list?'🗓️ Mois':'📋 Liste'}</button></div>
 ${CAL.list?`<div class="plan">${listHtml}</div>`:`<div class="cal"><div class="cw">${['L','M','M','J','V','S','D'].map(x=>`<b>${x}</b>`).join('')}</div><div class="cg">${cells}</div></div>
 <div class="plan"><h3>${fdate(CAL.sel,1)}</h3>${sel.length?sel.map(x=>rowHtml(x)).join(''):'<div class="mini">Rien ce jour-là.</div>'}<div class="row"><button class="btn" id="aEv">📅 + Rendez-vous</button><button class="btn alt" id="aTk">✅ + Tâche</button></div></div>`}
 <div class="row"><button class="btn" id="aEv2">📅 + Rendez-vous</button></div>`);
 bindRows($('#app'));
 $('#cp').onclick=()=>{CAL.m--;if(CAL.m<0){CAL.m=11;CAL.y--;}viewCal();};$('#cn').onclick=()=>{CAL.m++;if(CAL.m>11){CAL.m=0;CAL.y++;}viewCal();};
 $('#ct').onclick=()=>{const n=new Date();CAL.y=n.getFullYear();CAL.m=n.getMonth();CAL.sel=today();viewCal();};$('#cl').onclick=()=>{CAL.list=CAL.list?0:1;viewCal();};
 document.querySelectorAll('.cd[data-d]').forEach(c=>c.onclick=()=>{CAL.sel=c.dataset.d;viewCal();});
 const a=$('#aEv');if(a)a.onclick=()=>evForm(null,CAL.sel);const b=$('#aTk');if(b)b.onclick=()=>tkForm(null,CAL.sel);$('#aEv2').onclick=()=>evForm(null,CAL.sel);
 const fa=$('#fAll');if(fa)fa.onclick=()=>{CAL.f=[];viewCal();};document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const i=CAL.f.indexOf(b.dataset.f);if(i<0)CAL.f.push(b.dataset.f);else CAL.f.splice(i,1);viewCal();});}
let TKF=[];
function viewTasks(){const t=today();const all=tks().filter(x=>!x.dn&&(!TKF.length||(x.w||[]).some(i=>TKF.includes(i))));
 const late=all.filter(x=>x.d&&x.d<t).sort((a,b)=>a.d<b.d?-1:1),tod=all.filter(x=>x.d===t),soon=all.filter(x=>x.d&&x.d>t).sort((a,b)=>a.d<b.d?-1:1),none=all.filter(x=>!x.d);
 const done=tks().filter(x=>x.dn&&Date.now()-(x.dnAt||0)<14*864e5).sort((a,b)=>(b.dnAt||0)-(a.dnAt||0));
 const sec=(title,l,color)=>l.length?`<div class="plan" ${color?`style="border-color:${color}"`:''}><h3>${title} (${l.length})</h3>${l.map(x=>rowHtml({k:'tk',id:x.id,t:x.t,tm:x.tm,w:x.w,date:x.d||'',it:x},!!x.d)).join('')}</div>`:'';
 setApp(`<div class="banner" style="--c:#f57c00"><h1>✅ Tâches</h1></div>
 <div class="row" style="margin:10px 0"><input class="srch" id="qa" placeholder="Ajouter une tâche… (Entrée)" style="flex:1"><button class="btn" id="qb">+</button></div>
 ${fam().length?`<div class="pick" style="margin:6px 0"><button class="pchip pk ${TKF.length?'':'on'}" id="tAll" style="--pc:#555">Toutes</button>${fam().map(p=>`<button class="pchip pk ${TKF.includes(p.id)?'on':''}" data-f="${p.id}" style="--pc:${p.c}">${p.e} ${esc(p.n)}</button>`).join('')}</div>`:''}
 ${sec('⚠️ En retard',late,'#e53935')}${sec("📌 Aujourd'hui",tod)}${sec('🗓️ À venir',soon)}${sec('📝 Sans date',none)}
 ${!all.length?'<div class="plan"><div class="mini">🎉 Rien à faire pour le moment.</div></div>':''}
 ${done.length?`<details class="plan"><summary><b>✔️ Faites récemment (${done.length})</b></summary>${done.slice(0,15).map(x=>rowHtml({k:'tk',id:x.id,t:x.t,tm:'',w:x.w,date:'',it:x})).join('')}</details>`:''}`);
 bindRows($('#app'));const add=()=>{const v=$('#qa').value.trim();if(!v)return;tks().push({id:uid(),t:v,d:'',tm:'',w:TKF.length===1?[...TKF]:[],pr:0,nt:'',rp:'',rm:'',dn:0});save();viewTasks();setTimeout(()=>{const q=$('#qa');q&&q.focus();},50);};
 $('#qb').onclick=add;$('#qa').onkeydown=e=>{if(e.key==='Enter')add();};
 const ta=$('#tAll');if(ta)ta.onclick=()=>{TKF=[];viewTasks();};document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const i=TKF.indexOf(b.dataset.f);if(i<0)TKF.push(b.dataset.f);else TKF.splice(i,1);viewTasks();});}
function viewFam(){const t=today();
 setApp(`<div class="banner" style="--c:#8e24aa"><h1>👪 Famille</h1><div class="mini" style="color:#fff;opacity:.9">${fam().length} personne${fam().length>1?'s':''}</div></div>
 <div class="row"><button class="btn" onclick="pForm()">+ Ajouter une personne</button><button class="btn alt" onclick="quickAddFam()">Ajouter plusieurs d'un coup</button></div>
 ${fam().map(p=>{let n=0;for(let i=0;i<30;i++)n+=itemsOn(addD(t,i),[p.id]).filter(x=>x.k!=='bd').length;const late=tks().filter(x=>!x.dn&&x.d&&x.d<t&&(x.w||[]).includes(p.id)).length;
  return `<div class="card pcard" style="--pc:${p.c}" onclick="go('p/${p.id}')"><span class="pav" style="background:${p.c}">${p.e}</span><div style="flex:1"><b style="font-size:1.1rem">${esc(p.n)}</b> <span class="mini">${esc(p.r||'')}</span><div class="mini">${n} à venir (30 j)${late?` · <span style="color:#e53935">${late} en retard</span>`:''}${p.b?' · 🎂 '+pdt(p.b).getDate()+' '+MOIS[pdt(p.b).getMonth()]:''}</div></div>➜</div>`;}).join('')||'<div class="plan"><div class="mini">Personne pour l\'instant.</div></div>'}`);}
function viewPerson(id){const p=person(id);if(!p)return viewFam();const t=today();const up=[];for(let i=0;i<60;i++){const d=addD(t,i);itemsOn(d,[id]).forEach(x=>up.push(x));}
 const late=tks().filter(x=>!x.dn&&x.d&&x.d<t&&(x.w||[]).includes(id));
 setApp(`<div class="banner" style="--c:${p.c}"><h1>${p.e} ${esc(p.n)}</h1><div class="mini" style="color:#fff;opacity:.9">${esc(p.r||'')}</div></div>
 <div class="row"><button class="btn" onclick="go('fam')">⬅ Famille</button><button class="btn alt" id="pe">✏️ Modifier</button><button class="btn alt" id="pa">📅 + RDV</button><button class="btn alt" id="pt">✅ + Tâche</button></div>
 ${p.nt?`<div class="plan"><h3>📝 Notes</h3><div style="white-space:pre-wrap">${esc(p.nt)}</div></div>`:''}
 ${late.length?`<div class="plan" style="border-color:#e53935"><h3>⚠️ En retard</h3>${late.map(x=>rowHtml({k:'tk',id:x.id,t:x.t,tm:x.tm,w:x.w,date:x.d,it:x},1)).join('')}</div>`:''}
 <div class="plan"><h3>🗓️ À venir (60 jours)</h3>${up.length?up.map(x=>rowHtml(x,1)).join(''):'<div class="mini">Rien de prévu.</div>'}</div>`);
 bindRows($('#app'));$('#pe').onclick=()=>pForm(id);$('#pa').onclick=()=>{evForm();setTimeout(()=>{const b=document.querySelector(`.fm .pk[data-id="${id}"]`);b&&b.click();},30);};$('#pt').onclick=()=>{tkForm();setTimeout(()=>{const b=document.querySelector(`.fm .pk[data-id="${id}"]`);b&&b.click();},30);};}
/* ---- navigation bar ---- */
const TABS=[['','🏠','Aujourd\'hui'],['cal','📅','Agenda'],['tasks','✅','Tâches'],['fam','👪','Famille'],['etudes','📚','Études']];
function renderTabs(a){const nav=$('#tabbar');if(!nav)return;const cur=['','cal','tasks','fam','etudes'].includes(a)?a:(a==='p'?'fam':['e','exam','review','science','search','code','penal','spirit','today','weak'].includes(a)?'etudes':a==='data'||a==='prayer'?null:'');
 nav.innerHTML=TABS.map(([h,e,l])=>`<button class="tb ${h===cur?'on':''}" onclick="go('${h}')"><span>${e}</span><small>${l}</small></button>`).join('');}
/* ---- rappels ---- */
function fireAt(date,tm,rm){if(rm==='m')return dtm(date,'08:00');const base=dtm(date,tm||'08:00');return new Date(base.getTime()-Number(rm)*60000);}
function famTick(){try{if(loveOpen||document.querySelector('.fm,.lv-ov'))return;const now=Date.now();S.rf=S.rf||{};
 const cand=[];const t=today();
 for(const date of [addD(t,-1),t,addD(t,1)]){evs().forEach(e=>{if(e.rm!==''&&e.rm!==undefined&&occurs(e,date))cand.push({k:'ev',e,date});});}
 tks().forEach(x=>{if(!x.dn&&x.d&&x.rm!==''&&x.rm!==undefined)cand.push({k:'tk',e:x,date:x.d});});
 for(const c of cand){const e=c.e,key=`${c.k}:${e.id}:${c.date}:${e.rm}`;if(S.rf[key])continue;const f=fireAt(c.date,e.tm,e.rm).getTime();const end=(e.tm?dtm(c.date,e.tm).getTime()+3*3600e3:dtm(addD(c.date,1),'00:00').getTime());
  if(S.rs&&S.rs[key]&&now<S.rs[key])continue;if(now<f||now>end&&c.k==='ev')continue;if(c.k==='tk'&&now>end+864e5*3)continue;
  remindPopup(c,key);break;}
 const ks=Object.keys(S.rf);if(ks.length>400){ks.sort().slice(0,200).forEach(k=>delete S.rf[k]);save();}}catch(e){}}
function remindPopup(c,key){const e=c.e;if(loveOpen)return;loveOpen=true;const when=e.tm?`à ${e.tm}`:'aujourd\'hui';
 const d=document.createElement('div');d.className='lv-ov';d.innerHTML=`<div class="lv-card"><div class="lv-ico">🔔</div><h3 style="margin:.2em 0">${c.k==='ev'?'Rendez-vous':'À faire'} · ${fdate(c.date)}${e.tm?' · '+e.tm:''}</h3><p class="lv-msg"><b>${esc(e.t)}</b></p><div>${pchips(e.w)}</div>${e.pl?`<div class="mini">📍 ${esc(e.pl)}</div>`:''}${e.nt?`<div class="mini" style="margin-top:6px">${esc(e.nt)}</div>`:''}<div style="margin-top:12px">${c.k==='tk'?'<button class="btn" id="rdn">✅ C\'est fait</button> ':''}<button class="btn ${c.k==='tk'?'alt':''}" id="rok">👍 Vu</button> <button class="btn alt" id="rsn">⏰ Dans 10 min</button></div></div>`;
 document.body.appendChild(d);try{navigator.vibrate&&navigator.vibrate([200,100,200]);}catch(_){}
 if(S.pn&&window.Notification&&Notification.permission==='granted'&&document.hidden){try{new Notification('🔔 '+e.t,{body:(e.tm?e.tm+' · ':'')+(e.pl||'')});}catch(_){}}
 const close=()=>{loveOpen=false;d.remove();};
 $('#rok',d).onclick=()=>{S.rf[key]=1;save();close();};$('#rsn',d).onclick=()=>{S.rs=S.rs||{};S.rs[key]=Date.now()+600000;save();close();};
 const dn=$('#rdn',d);if(dn)dn.onclick=()=>{S.rf[key]=1;close();toggleTask(e.id);};}
setInterval(famTick,20000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)famTick();});

