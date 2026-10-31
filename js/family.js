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
const fdate=(s,long)=>{const d=pdt(s);if(S.lang==='ar')return JOURS[d.getDay()]+' '+d.getDate()+' '+MOIS[d.getMonth()];return (long?JOURS[d.getDay()]+' ':JOURS[d.getDay()].slice(0,3)+'. ')+d.getDate()+' '+(long?MOIS[d.getMonth()]:MOIS[d.getMonth()].slice(0,4)+(MOIS[d.getMonth()].length>4?'.':''));};
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
  const o={id:id||uid(),t,d:$('#f_d',d).value||today(),tm:$('#f_tm',d).value,w:sel,pl:$('#f_pl',d).value.trim(),nt:$('#f_nt',d).value.trim(),rp:$('#f_rp',d).value,rm:$('#f_rm',d).value};if(!id&&S.me)o.by=S.me;
  if(id)Object.assign(e,o);else evs().push(o);save();refresh();setTimeout(famTick,300);}});pickBind(d,sel);}
function tkForm(id,date){const e=id?tks().find(x=>x.id===id):{t:'',d:date||'',tm:'',w:[],pr:0,nt:'',rp:'',rm:''};if(!e)return;const sel=[...(e.w||[])];
 const d=modal(id?'✏️ Tâche':'✅ Nouvelle tâche',`<label class="fl">À faire<input class="srch" id="f_t" placeholder="ex : Payer la cantine, Appeler la mairie…" value="${esc(e.t)}"></label>
 <div class="fgrid"><label class="fl">Pour le<input type="date" class="srch" id="f_d" value="${e.d||''}"></label><label class="fl">Heure (facultatif)<input type="time" class="srch" id="f_tm" value="${e.tm||''}"></label></div>
 <div class="fl">Pour qui ?${pickHtml(sel)}</div>
 <div class="fgrid"><label class="fl">Répéter<select class="srch" id="f_rp">${opt(RP,e.rp)}</select></label><label class="fl">Rappel<select class="srch" id="f_rm">${opt(RM,e.rm)}</select></label></div>
 <label class="fl" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="f_pr" ${e.pr?'checked':''}> ⭐ Important</label>
 <label class="fl">Notes<textarea class="srch" id="f_nt" rows="2">${esc(e.nt||'')}</textarea></label>`,
 {del:id?()=>{S.tk=tks().filter(x=>x.id!==id);save();refresh();}:null,onSave:d=>{const t=$('#f_t',d).value.trim();if(!t){toast('Écris la tâche');return false;}
  const o={id:id||uid(),t,d:$('#f_d',d).value,tm:$('#f_tm',d).value,w:sel,pr:$('#f_pr',d).checked?1:0,nt:$('#f_nt',d).value.trim(),rp:$('#f_rp',d).value,rm:$('#f_rm',d).value,dn:e.dn||0};if(!id&&S.me)o.by=S.me;
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
 return `<div class="frow2 ${x.k}" data-k="${x.k}" data-id="${x.id}" data-date="${x.date}">${tk?`<button class="chk ${done?'on':''}" data-chk="${x.id}" title="Fait">${done?'✓':''}</button>`:`<span class="ico">${x.k==='bd'?'🎂':'📅'}</span>`}<div class="fb2"><div>${star}${esc(x.t)}</div><div class="mini">${when} ${x.pl?'· 📍 '+esc(x.pl):''}${x.it&&x.it.by?' · ✍️ '+esc(x.it.by):''}</div><div>${pchips(x.w)}</div></div></div>`;}
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
 ${instCard()}
 ${stDashCard()}${lgDashCard()}${mmDashCard()}${laDashCard()}
 ${!fam().length?`<div class="plan"><h3>👪 Commence par ta famille</h3><div class="mini">Ajoute les personnes dont tu gères les rendez-vous, les papiers et les tâches.</div><div class="row"><button class="btn" onclick="quickAddFam()">Ajouter ma famille</button><button class="btn alt" onclick="pForm()">Une seule personne</button></div></div>`:''}
 ${od.length?`<div class="plan" style="border-color:#e53935"><h3>⚠️ En retard (${od.length})</h3>${od.slice(0,6).map(x=>rowHtml({k:'tk',id:x.id,t:x.t,tm:x.tm,w:x.w,date:x.d,it:x},1)).join('')}${od.length>6?`<div class="mini">… et ${od.length-6} autres, dans l'onglet Tâches</div>`:''}</div>`:''}
 <div class="plan"><h3>📌 Aujourd'hui</h3>${todayItems.length?todayItems.map(x=>rowHtml(x)).join(''):'<div class="mini">Rien de prévu. Profites-en ! 🌿</div>'}</div>
 ${prayerCard()}
 <div class="plan"><h3>🌅 Demain</h3>${tom.length?tom.map(x=>rowHtml(x)).join(''):'<div class="mini">Rien de prévu.</div>'}</div>
 ${nextDays.length?`<div class="plan"><h3>🗓️ Les prochains jours</h3>${nextDays.map(([d,l])=>`<div class="mini" style="margin-top:6px"><b>${fdate(d,1)}</b></div>${l.map(x=>rowHtml(x)).join('')}`).join('')}</div>`:''}
 ${noDate.length?`<div class="plan"><h3>📝 Sans date (${noDate.length})</h3>${noDate.slice(0,5).map(x=>rowHtml({k:'tk',id:x.id,t:x.t,tm:'',w:x.w,date:'',it:x})).join('')}</div>`:''}
 <div class="plan" style="cursor:pointer" onclick="go('etudes')"><h3>📚 Mes études de droit</h3><div class="mini">Avancement total : <b>${overall()}%</b> · session du jour, quiz, flashcards, codes</div></div>`);
 bindRows($('#app'));instBind();}
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
 ${CAL.list?`<div class="plan">${listHtml}</div>`:`<div class="cal"><div class="cw">${(isAr()?['إ','ث','ر','خ','ج','س','ح']:['L','M','M','J','V','S','D']).map(x=>`<b>${x}</b>`).join('')}</div><div class="cg">${cells}</div></div>
 <div class="plan"><h3>${fdate(CAL.sel,1)}</h3>${sel.length?sel.map(x=>rowHtml(x)).join(''):'<div class="mini">Rien ce jour-là.</div>'}</div>`}`);
 bindRows($('#app'));
 $('#cp').onclick=()=>{CAL.m--;if(CAL.m<0){CAL.m=11;CAL.y--;}viewCal();};$('#cn').onclick=()=>{CAL.m++;if(CAL.m>11){CAL.m=0;CAL.y++;}viewCal();};
 $('#ct').onclick=()=>{const n=new Date();CAL.y=n.getFullYear();CAL.m=n.getMonth();CAL.sel=today();viewCal();};$('#cl').onclick=()=>{CAL.list=CAL.list?0:1;viewCal();};
 document.querySelectorAll('.cd[data-d]').forEach(c=>c.onclick=()=>{CAL.sel=c.dataset.d;viewCal();});
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
 ${famCard()}${chCard()}
 ${fam().map(p=>{let n=0;for(let i=0;i<30;i++)n+=itemsOn(addD(t,i),[p.id]).filter(x=>x.k!=='bd').length;const late=tks().filter(x=>!x.dn&&x.d&&x.d<t&&(x.w||[]).includes(p.id)).length;
  return `<div class="card pcard" style="--pc:${p.c}" onclick="go('p/${p.id}')"><span class="pav" style="background:${p.c}">${p.e}</span><div style="flex:1"><b style="font-size:1.1rem">${esc(p.n)}</b> <span class="mini">${esc(p.r||'')}</span><div class="mini">${n} à venir (30 j)${late?` · <span style="color:#e53935">${late} en retard</span>`:''}${p.b?' · 🎂 '+pdt(p.b).getDate()+' '+MOIS[pdt(p.b).getMonth()]:''}</div></div>➜</div>`;}).join('')||'<div class="plan"><div class="mini">Personne pour l\'instant.</div></div>'}`);famCardBind();}
function viewPerson(id){const p=person(id);if(!p)return viewFam();const t=today();const up=[];for(let i=0;i<60;i++){const d=addD(t,i);itemsOn(d,[id]).forEach(x=>up.push(x));}
 const late=tks().filter(x=>!x.dn&&x.d&&x.d<t&&(x.w||[]).includes(id));
 setApp(`<div class="banner" style="--c:${p.c}"><h1>${p.e} ${esc(p.n)}</h1><div class="mini" style="color:#fff;opacity:.9">${esc(p.r||'')}</div></div>
 <div class="row"><button class="btn" onclick="go('fam')">⬅ Famille</button><button class="btn alt" id="pe">✏️ Modifier</button><button class="btn alt" id="pa">📅 + RDV</button><button class="btn alt" id="pt">✅ + Tâche</button></div>
 ${p.nt?`<div class="plan"><h3>📝 Notes</h3><div style="white-space:pre-wrap">${esc(p.nt)}</div></div>`:''}
 ${late.length?`<div class="plan" style="border-color:#e53935"><h3>⚠️ En retard</h3>${late.map(x=>rowHtml({k:'tk',id:x.id,t:x.t,tm:x.tm,w:x.w,date:x.d,it:x},1)).join('')}</div>`:''}
 <div class="plan"><h3>🗓️ À venir (60 jours)</h3>${up.length?up.map(x=>rowHtml(x,1)).join(''):'<div class="mini">Rien de prévu.</div>'}</div>`);
 bindRows($('#app'));$('#pe').onclick=()=>pForm(id);$('#pa').onclick=()=>{evForm();setTimeout(()=>{const b=document.querySelector(`.fm .pk[data-id="${id}"]`);b&&b.click();},30);};$('#pt').onclick=()=>{tkForm();setTimeout(()=>{const b=document.querySelector(`.fm .pk[data-id="${id}"]`);b&&b.click();},30);};}
/* ---- navigation bar ---- */
const TABS=[['','🏠','Aujourd\'hui'],['cal','📅','Agenda'],['tasks','✅','Tâches'],['fam','👪','Famille'],['more','🧩','Plus']];
function renderTabs(a){const nav=$('#tabbar');if(!nav)return;const MORE=['more','etudes','log','mm','la','prayer','spirit','me','admin','sync','data','e','exam','review','science','search','code','penal','today','weak','art','fiches','res'];const cur=['','cal','tasks','fam'].includes(a)?a:(a==='p'||a==='chat'?'fam':MORE.includes(a)?'more':'');
 nav.innerHTML=TABS.map(([h,e,l])=>`<button class="tb ${h===cur?'on':''}" onclick="go('${h}')"><span>${e}</span><small>${l}</small></button>`).join('');}
/* ================= 🚚 LOGISTIQUE (profil Papa) ================= */
const LG_TIPS=[
{f:"Un EVP (ou TEU) est l'unité de mesure des conteneurs : 1 EVP = un conteneur de 20 pieds. Un 40 pieds = 2 EVP.",a:"الـ EVP (أو TEU) وحدة لقياس الحاويات: 1 EVP = حاوية 20 قدماً. وحاوية 40 قدماً = 2 EVP."},
{f:"Palette Europe : 80 × 120 cm. Un semi-remorque de 13,6 m en transporte en général 33.",a:"باليت أوروبا: 80 × 120 سم. وشاحنة بمقطورة طولها 13,6 م تحمل عادةً 33 باليت."},
{f:"En Europe, une pause de 45 minutes est obligatoire après 4 h 30 de conduite (elle peut se faire en 15 min puis 30 min).",a:"في أوروبا، الاستراحة 45 دقيقة إلزامية بعد 4 ساعات و30 دقيقة من القيادة (يمكن تقسيمها: 15 دقيقة ثم 30 دقيقة)."},
{f:"Conduite maximale par jour : 9 h, et 10 h deux fois par semaine au maximum.",a:"الحد الأقصى للقيادة في اليوم: 9 ساعات، و10 ساعات مرتين فقط في الأسبوع."},
{f:"Poids taxable = le plus grand entre le poids réel et le poids volumétrique. Un colis léger mais encombrant se facture au volume.",a:"الوزن المحتسب = الأكبر بين الوزن الفعلي والوزن الحجمي. فالطرد الخفيف الكبير الحجم يُحتسب بحجمه."},
{f:"En avion, 1 m³ compte pour 167 kg (formule : L × l × h en cm ÷ 6 000).",a:"في الشحن الجوي، 1 م³ يُحتسب بـ 167 كلغ (المعادلة: الطول × العرض × الارتفاع بالسنتيمتر ÷ 6000)."},
{f:"En groupage routier en Europe, on compte souvent 1 m³ = 333 kg et 1 mètre linéaire de plateau = environ 1 850 kg.",a:"في الشحن الطرقي المجمّع بأوروبا يُحتسب غالباً 1 م³ = 333 كلغ، والمتر الطولي من المنصة ≈ 1850 كلغ."},
{f:"En maritime groupé (LCL), la règle courante : 1 m³ = 1 tonne, on facture le plus élevé des deux.",a:"في الشحن البحري المجمّع (LCL) القاعدة المعتادة: 1 م³ = 1 طن، ويُحتسب الأكبر منهما."},
{f:"FIFO : premier entré, premier sorti. FEFO : premier périmé, premier sorti — indispensable pour l'alimentaire.",a:"FIFO: ما يدخل أولاً يخرج أولاً. FEFO: ما ينتهي صلاحيته أولاً يخرج أولاً — ضروري للمواد الغذائية."},
{f:"Cross-docking : la marchandise passe du camion qui arrive au camion qui repart, sans être stockée.",a:"كروس دوكينغ: تنتقل البضاعة من الشاحنة الواصلة إلى الشاحنة المغادرة مباشرة دون تخزين."},
{f:"Le « dernier kilomètre » est l'ultime étape de la livraison jusqu'au client : c'est souvent la plus compliquée.",a:"«الميل الأخير» هو المرحلة الأخيرة من التوصيل إلى الزبون النهائي، وغالباً ما تكون الأصعب."},
{f:"Le CMR est le document du transport routier international : il prouve le contrat entre l'expéditeur et le transporteur.",a:"وثيقة CMR هي وثيقة النقل الطرقي الدولي، وتثبت العقد بين المرسِل والناقل."},
{f:"Le connaissement (B/L) est le document du transport maritime : c'est le reçu de la marchandise ET, en général, le titre qui permet de la retirer.",a:"بوليصة الشحن البحري (B/L) هي إيصال استلام البضاعة، وفي الغالب هي السند الذي يُسلَّم بموجبه الشحن."},
{f:"Carnet TIR : il permet de traverser plusieurs pays sous scellés douaniers, sans payer les droits à chaque frontière.",a:"دفتر TIR يسمح بعبور عدة دول تحت أختام الجمارك دون دفع الرسوم عند كل حدود."},
{f:"Incoterm EXW : le vendeur ne fait presque rien. DDP : le vendeur fait presque tout, droits d'import compris.",a:"EXW: البائع لا يتحمل إلا القليل. DDP: البائع يتحمل كل شيء تقريباً بما فيه رسوم الاستيراد."},
{f:"Les surestaries (demurrage) sont des pénalités quand un conteneur reste trop longtemps au port après le temps gratuit.",a:"غرامات التأخير (Demurrage) تُفرض عندما تبقى الحاوية في الميناء مدة أطول من المهلة المجانية."},
{f:"Un conteneur 40' High Cube fait environ 76 m³ : 30 cm de plus en hauteur qu'un 40' standard (67 m³).",a:"حاوية 40 قدماً عالية (High Cube) سعتها نحو 76 م³: أعلى بـ 30 سم من حاوية 40 قدماً العادية (67 م³)."},
{f:"Chaîne du froid : on ne coupe jamais la température. Vérifier et enregistrer la température au chargement et à la livraison.",a:"سلسلة التبريد: لا تنقطع درجة الحرارة أبداً. تُسجَّل الحرارة عند التحميل وعند التسليم."},
{f:"ADR : l'accord européen sur le transport des marchandises dangereuses par route (formation et équipement spécifiques).",a:"ADR: الاتفاق الأوروبي لنقل البضائع الخطرة عبر الطرق (يتطلب تكويناً ومعدات خاصة)."},
{f:"Le tachygraphe enregistre la conduite, les pauses et les repos du chauffeur. Il sert de preuve lors des contrôles.",a:"الطاكوغراف يسجل القيادة والاستراحات وفترات الراحة للسائق، ويُستعمل كدليل عند المراقبة."},
{f:"Repos quotidien du chauffeur : 11 h (réduit à 9 h au maximum trois fois entre deux repos hebdomadaires).",a:"الراحة اليومية للسائق: 11 ساعة (تُخفَّض إلى 9 ساعات بحد أقصى ثلاث مرات بين راحتين أسبوعيتين)."},
{f:"Taux de remplissage : un camion qui roule à moitié vide coûte presque autant qu'un camion plein. Optimiser les chargements = gagner de l'argent.",a:"نسبة الامتلاء: الشاحنة التي تسير نصف فارغة تكلف تقريباً مثل الممتلئة. تحسين التحميل يعني ربحاً."},
{f:"Avant de charger : vérifier le poids par essieu. Une surcharge, même légère, expose à une amende et à l'immobilisation.",a:"قبل التحميل: تحقّق من الوزن على كل محور. فالحمولة الزائدة ولو قليلاً قد تعرّض لغرامة وتوقيف الشاحنة."},
{f:"Palette filmée et sanglée : une marchandise mal arrimée est la première cause de casse pendant le transport.",a:"الباليت المغلّف والمشدود جيداً: سوء تثبيت البضاعة هو السبب الأول للكسر أثناء النقل."},
{f:"Transitaire : il organise le transport et les formalités pour le compte du client. Commissionnaire en douane : il s'occupe de la déclaration en douane.",a:"الوسيط الناقل (Transitaire) ينظّم النقل والإجراءات لحساب الزبون. أما المخلّص الجمركي فيتولى التصريح لدى الجمارك."},
{f:"Toujours noter les réserves sur le bon de livraison à la réception (colis abîmé, manquant) : sans réserve écrite, il devient très difficile de se faire indemniser.",a:"دوّن دائماً التحفظات على وصل التسليم عند الاستلام (طرد تالف أو ناقص): دون تحفظ مكتوب يصعب جداً الحصول على تعويض."},
{f:"Le fret retour (backhaul) : chercher une marchandise pour le trajet de retour évite de rouler à vide.",a:"شحنة العودة (Backhaul): البحث عن حمولة لرحلة العودة يجنّب السير فارغاً."}
];
const LG_QZ=[
{q:{f:"Que signifie EVP (ou TEU) ?",a:"ماذا يعني EVP (أو TEU)؟"},o:[{f:"Un conteneur de 20 pieds",a:"حاوية 20 قدماً"},{f:"Un conteneur de 40 pieds",a:"حاوية 40 قدماً"},{f:"Une palette Europe",a:"باليت أوروبا"},{f:"Un camion de 20 tonnes",a:"شاحنة 20 طناً"}],c:0,e:{f:"EVP = équivalent vingt pieds. Un 40 pieds vaut 2 EVP.",a:"EVP = ما يعادل 20 قدماً. وحاوية 40 قدماً = 2 EVP."}},
{q:{f:"Après combien de conduite continue la pause de 45 min est-elle obligatoire (UE) ?",a:"بعد كم من القيادة المتواصلة تكون الاستراحة 45 دقيقة إلزامية (الاتحاد الأوروبي)؟"},o:[{f:"3 h",a:"3 ساعات"},{f:"4 h 30",a:"4 ساعات و30 دقيقة"},{f:"6 h",a:"6 ساعات"},{f:"9 h",a:"9 ساعات"}],c:1,e:{f:"4 h 30 de conduite, puis 45 min de pause (ou 15 + 30 min).",a:"بعد 4 ساعات و30 دقيقة قيادة، استراحة 45 دقيقة (أو 15 + 30 دقيقة)."}},
{q:{f:"Quelle est la durée maximale de conduite journalière standard ?",a:"ما هو الحد الأقصى المعتاد للقيادة في اليوم؟"},o:[{f:"7 h",a:"7 ساعات"},{f:"8 h",a:"8 ساعات"},{f:"9 h",a:"9 ساعات"},{f:"12 h",a:"12 ساعة"}],c:2,e:{f:"9 h, étendues à 10 h deux fois par semaine au maximum.",a:"9 ساعات، ويمكن رفعها إلى 10 ساعات مرتين في الأسبوع على الأكثر."}},
{q:{f:"Avec quel Incoterm le vendeur supporte-t-il tout, droits d'import compris ?",a:"في أي Incoterm يتحمل البائع كل شيء بما فيه رسوم الاستيراد؟"},o:[{f:"EXW",a:"EXW"},{f:"FOB",a:"FOB"},{f:"CIF",a:"CIF"},{f:"DDP",a:"DDP"}],c:3,e:{f:"DDP : rendu droits acquittés. À l'opposé, EXW : l'acheteur gère presque tout.",a:"DDP: التسليم مع دفع الرسوم. وعلى العكس، في EXW يتولى المشتري تقريباً كل شيء."}},
{q:{f:"Avec FOB, à quel moment le risque passe-t-il à l'acheteur ?",a:"في FOB، متى ينتقل الخطر إلى المشتري؟"},o:[{f:"Au départ de l'usine",a:"عند مغادرة المصنع"},{f:"Quand la marchandise est à bord du navire",a:"عندما تكون البضاعة على متن السفينة"},{f:"À l'arrivée au port de destination",a:"عند الوصول إلى ميناء الوجهة"},{f:"À la livraison chez le client",a:"عند التسليم لدى الزبون"}],c:1,e:{f:"FOB (Free On Board) : le risque passe quand la marchandise est chargée à bord, au port d'embarquement.",a:"FOB (التسليم على ظهر السفينة): ينتقل الخطر عند تحميل البضاعة على السفينة في ميناء الشحن."}},
{q:{f:"Quel document accompagne un transport routier international ?",a:"أي وثيقة ترافق النقل الطرقي الدولي؟"},o:[{f:"Le connaissement (B/L)",a:"بوليصة الشحن البحري (B/L)"},{f:"La lettre de transport aérien (AWB)",a:"وثيقة النقل الجوي (AWB)"},{f:"Le CMR",a:"وثيقة CMR"},{f:"Le certificat d'origine",a:"شهادة المنشأ"}],c:2,e:{f:"Le CMR est la lettre de voiture du transport routier international.",a:"CMR هي وثيقة النقل الطرقي الدولي."}},
{q:{f:"Combien de kg compte 1 m³ en fret aérien ?",a:"كم كيلوغراماً يُحتسب 1 م³ في الشحن الجوي؟"},o:[{f:"100 kg",a:"100 كلغ"},{f:"167 kg",a:"167 كلغ"},{f:"333 kg",a:"333 كلغ"},{f:"1 000 kg",a:"1000 كلغ"}],c:1,e:{f:"Aérien : L × l × h (cm) ÷ 6 000, soit 167 kg par m³.",a:"جوي: الطول × العرض × الارتفاع (سم) ÷ 6000، أي 167 كلغ لكل م³."}},
{q:{f:"Quelles sont les dimensions d'une palette Europe ?",a:"ما هي أبعاد باليت أوروبا؟"},o:[{f:"80 × 120 cm",a:"80 × 120 سم"},{f:"100 × 100 cm",a:"100 × 100 سم"},{f:"120 × 120 cm",a:"120 × 120 سم"},{f:"60 × 80 cm",a:"60 × 80 سم"}],c:0,e:{f:"La palette EUR (EPAL) mesure 80 × 120 cm.",a:"باليت EUR (EPAL) أبعاده 80 × 120 سم."}},
{q:{f:"Le connaissement (B/L) est le document de quel mode de transport ?",a:"بوليصة الشحن (B/L) هي وثيقة أي وسيلة نقل؟"},o:[{f:"Maritime",a:"البحري"},{f:"Aérien",a:"الجوي"},{f:"Routier",a:"الطرقي"},{f:"Ferroviaire",a:"السككي"}],c:0,e:{f:"Le B/L (Bill of Lading) est le document du transport maritime.",a:"B/L (Bill of Lading) هي وثيقة النقل البحري."}},
{q:{f:"Que fait-on en cross-docking ?",a:"ماذا نفعل في الكروس دوكينغ؟"},o:[{f:"On stocke 3 mois",a:"نخزّن 3 أشهر"},{f:"On transfère d'un camion à l'autre sans stocker",a:"ننقل من شاحنة إلى أخرى دون تخزين"},{f:"On retourne la marchandise",a:"نُرجع البضاعة"},{f:"On détruit les invendus",a:"نُتلف غير المباع"}],c:1,e:{f:"Cross-docking : transbordement direct, sans stockage intermédiaire.",a:"كروس دوكينغ: نقل مباشر بين الشاحنات دون تخزين وسيط."}},
{q:{f:"FEFO signifie…",a:"FEFO تعني…"},o:[{f:"Premier entré, premier sorti",a:"الأول دخولاً الأول خروجاً"},{f:"Dernier entré, premier sorti",a:"الأخير دخولاً الأول خروجاً"},{f:"Premier périmé, premier sorti",a:"الأقرب انتهاءً للصلاحية يخرج أولاً"},{f:"Premier payé, premier sorti",a:"الأول دفعاً الأول خروجاً"}],c:2,e:{f:"FEFO (First Expired, First Out) : on sort d'abord ce qui périme le plus tôt.",a:"FEFO: يخرج أولاً ما تنتهي صلاحيته أقرب."}},
{q:{f:"Quel est le volume approximatif d'un conteneur 40' High Cube ?",a:"ما هي السعة التقريبية لحاوية 40 قدماً عالية (High Cube)؟"},o:[{f:"33 m³",a:"33 م³"},{f:"67 m³",a:"67 م³"},{f:"76 m³",a:"76 م³"},{f:"90 m³",a:"90 م³"}],c:2,e:{f:"≈ 76 m³ (40' standard ≈ 67 m³, 20' ≈ 33 m³).",a:"≈ 76 م³ (حاوية 40 العادية ≈ 67 م³، و20 ≈ 33 م³)."}},
{q:{f:"CIF = CFR + quoi ?",a:"CIF = CFR + ماذا؟"},o:[{f:"Le dédouanement import",a:"التخليص الجمركي للاستيراد"},{f:"L'assurance",a:"التأمين"},{f:"Le déchargement",a:"التفريغ"},{f:"La manutention",a:"المناولة"}],c:1,e:{f:"CIF = coût, assurance et fret : le vendeur paie aussi une assurance (couverture minimale).",a:"CIF = التكلفة والتأمين والشحن: يدفع البائع أيضاً تأميناً (بتغطية دنيا)."}},
{q:{f:"Le « dernier kilomètre », c'est…",a:"«الميل الأخير» هو…"},o:[{f:"Le trajet entre deux ports",a:"الرحلة بين ميناءين"},{f:"La dernière étape de livraison jusqu'au client",a:"آخر مرحلة من التسليم إلى الزبون"},{f:"Le contrôle à la frontière",a:"المراقبة عند الحدود"},{f:"Le plein de carburant",a:"تعبئة الوقود"}],c:1,e:{f:"C'est la livraison finale chez le client : souvent la plus coûteuse et la plus délicate.",a:"هو التسليم النهائي للزبون: غالباً الأكثر كلفة وحساسية."}},
{q:{f:"À quoi sert le carnet TIR ?",a:"فيمَ يُستعمل دفتر TIR؟"},o:[{f:"À enregistrer le temps de conduite",a:"لتسجيل زمن القيادة"},{f:"À traverser des pays sous scellés douaniers sans payer à chaque frontière",a:"لعبور دول تحت أختام الجمارك دون الدفع عند كل حدود"},{f:"À assurer la marchandise",a:"لتأمين البضاعة"},{f:"À réserver un quai",a:"لحجز رصيف"}],c:1,e:{f:"Le carnet TIR couvre le transit douanier international avec garantie.",a:"دفتر TIR يغطي العبور الجمركي الدولي بضمانة."}},
{q:{f:"LCL, en maritime, c'est…",a:"LCL في الشحن البحري هو…"},o:[{f:"Un conteneur complet pour un seul client",a:"حاوية كاملة لزبون واحد"},{f:"Du groupage : plusieurs clients partagent un conteneur",a:"شحن مجمّع: عدة زبائن يتقاسمون حاوية"},{f:"Un conteneur frigorifique",a:"حاوية مبرّدة"},{f:"Un navire pétrolier",a:"سفينة نفط"}],c:1,e:{f:"LCL = Less than Container Load (groupage). FCL = conteneur complet.",a:"LCL = أقل من حمولة حاوية (مجمّع). FCL = حاوية كاملة."}},
{q:{f:"Que signifie ADR ?",a:"ماذا يعني ADR؟"},o:[{f:"Transport des marchandises dangereuses par route",a:"نقل البضائع الخطرة بالطرق"},{f:"Assurance des remorques",a:"تأمين المقطورات"},{f:"Autorisation de roulage en ville",a:"ترخيص السير داخل المدن"},{f:"Aide au démarrage",a:"المساعدة على الإقلاع"}],c:0,e:{f:"ADR : accord européen relatif au transport international des marchandises dangereuses par route.",a:"ADR: الاتفاق الأوروبي الخاص بنقل البضائع الخطرة دولياً عبر الطرق."}}
];
const LG_INCO=[
["EXW","any",{f:"Départ usine : le vendeur met la marchandise à disposition dans ses locaux. L'acheteur supporte presque tout.",a:"التسليم في المصنع: يضع البائع البضاعة في مقره والمشتري يتحمل تقريباً كل شيء."}],
["FCA","any",{f:"Franco transporteur : le vendeur remet la marchandise au transporteur choisi par l'acheteur (et fait l'export).",a:"التسليم للناقل: يسلّم البائع البضاعة للناقل الذي اختاره المشتري (ويتولى التصدير)."}],
["CPT","any",{f:"Port payé jusqu'à : le vendeur paie le transport jusqu'au lieu convenu ; le risque passe à la remise au 1er transporteur.",a:"النقل مدفوع إلى: يدفع البائع النقل حتى المكان المتفق عليه؛ وينتقل الخطر عند التسليم للناقل الأول."}],
["CIP","any",{f:"CPT + le vendeur paie une assurance étendue.",a:"CPT + يدفع البائع تأميناً موسّعاً."}],
["DAP","any",{f:"Rendu au lieu de destination, prêt à décharger. L'acheteur décharge et dédouane l'import.",a:"التسليم في مكان الوجهة جاهزاً للتفريغ. المشتري يفرّغ ويخلّص الاستيراد."}],
["DPU","any",{f:"Comme DAP, mais le vendeur décharge aussi.",a:"مثل DAP لكن البائع يتولى التفريغ أيضاً."}],
["DDP","any",{f:"Rendu droits acquittés : le vendeur supporte tous les frais et risques, import compris.",a:"التسليم مع دفع الرسوم: يتحمل البائع كل التكاليف والمخاطر بما فيها الاستيراد."}],
["FAS","sea",{f:"Le long du navire : la marchandise est posée sur le quai, à côté du navire.",a:"التسليم بمحاذاة السفينة: توضع البضاعة على الرصيف بجانب السفينة."}],
["FOB","sea",{f:"Franco à bord : le risque passe quand la marchandise est chargée à bord du navire.",a:"التسليم على ظهر السفينة: ينتقل الخطر عند تحميل البضاعة على السفينة."}],
["CFR","sea",{f:"Coût et fret : le vendeur paie le transport jusqu'au port de destination ; le risque passe à bord.",a:"التكلفة والشحن: يدفع البائع الشحن حتى ميناء الوجهة؛ وينتقل الخطر عند التحميل."}],
["CIF","sea",{f:"CFR + assurance (couverture minimale) payée par le vendeur.",a:"CFR + تأمين (بتغطية دنيا) يدفعه البائع."}]
];
const LG_DOCS=[
["CMR",{f:"Lettre de voiture du transport routier international.",a:"وثيقة النقل الطرقي الدولي."}],
["B/L",{f:"Connaissement : document du transport maritime (reçu + titre).",a:"بوليصة الشحن البحري (إيصال + سند)."}],
["AWB",{f:"Lettre de transport aérien.",a:"وثيقة النقل الجوي."}],
["Facture commerciale|الفاتورة التجارية",{f:"Prix et conditions de vente ; base de la déclaration en douane.",a:"السعر وشروط البيع؛ وهي أساس التصريح الجمركي."}],
["Packing list|قائمة التعبئة",{f:"Liste de colisage : contenu, poids et dimensions de chaque colis.",a:"قائمة محتوى وأوزان وأبعاد كل طرد."}],
["Certificat d'origine|شهادة المنشأ",{f:"Prouve le pays d'origine de la marchandise.",a:"تثبت بلد منشأ البضاعة."}],
["EUR.1",{f:"Certificat de circulation pour bénéficier de droits réduits dans certains accords commerciaux.",a:"شهادة تنقّل تتيح رسوماً مخفضة في بعض الاتفاقيات التجارية."}],
["Carnet TIR|دفتر TIR",{f:"Transit douanier international sous scellés, avec garantie.",a:"عبور جمركي دولي تحت الأختام مع ضمانة."}],
["Bon de livraison|وصل التسليم",{f:"Preuve de livraison : toujours noter les réserves à la réception.",a:"إثبات التسليم: دوّن دائماً التحفظات عند الاستلام."}]
];
const LG_CAP=[
["Conteneur 20'|حاوية 20 قدماً","≈ 33 m³","≈ 28 t","≈ 10 palettes EUR"],
["Conteneur 40'|حاوية 40 قدماً","≈ 67 m³","≈ 26–28 t","≈ 20–23"],
["Conteneur 40' HC|حاوية 40 قدماً HC","≈ 76 m³","≈ 26–28 t","≈ 20–23"],
["Semi 13,6 m|شاحنة بمقطورة 13,6 م","≈ 90 m³","≈ 24–25 t","33 palettes EUR"]
];
const LG_LEX=[
["Fret","الشحن / أجرة النقل"],["Transitaire","الوسيط الناقل"],["Commissionnaire en douane","المخلّص الجمركي"],["Groupage","الشحن المجمّع"],["Conteneur","حاوية"],["Palette","باليت (منصة تحميل)"],["Entrepôt","مستودع"],["Quai","رصيف"],["Armateur","مالك السفينة"],["Affréteur","مستأجر السفينة"],["Connaissement","بوليصة الشحن البحري"],["Lettre de voiture","وثيقة النقل (CMR)"],["Douane","الجمارك"],["Droits de douane","الرسوم الجمركية"],["Dédouanement","التخليص الجمركي"],["Transit","العبور"],["Expéditeur","المرسِل"],["Destinataire","المستلِم"],["Chargeur","الشاحن / المُحمِّل"],["Transporteur","الناقل"],["Chauffeur","السائق"],["Tachygraphe","الطاكوغراف (جهاز تسجيل القيادة)"],["Semi-remorque","شاحنة بمقطورة"],["Hayon","الرافعة الخلفية (هايون)"],["Tare","الوزن الفارغ"],["Poids brut","الوزن الإجمالي"],["Poids net","الوزن الصافي"],["Charge utile","الحمولة المفيدة"],["Mètre linéaire","المتر الطولي"],["Tonnage","الحمولة بالطن"],["Délai de livraison","مهلة التسليم"],["Rupture de stock","نفاد المخزون"],["Chaîne du froid","سلسلة التبريد"],["Marchandises dangereuses","البضائع الخطرة"],["Dernier kilomètre","الميل الأخير"],["Surestaries","غرامات تأخير الحاوية"],["Fret retour","شحنة العودة"],["Taux de remplissage","نسبة الامتلاء"],["Manutention","المناولة"],["Arrimage","التثبيت والربط"]
];
const LGL=(f,a)=>isAr()?a:f;
const LGB=s=>{const p=String(s).split('|');return p.length>1?(isAr()?p[1]:p[0]):s;};
const lgNum=v=>{const x=parseFloat(String(v==null?'':v).replace(/\s/g,'').replace(',','.'));return isFinite(x)?x:0;};
const lgFmt=(n,d)=>(+n).toLocaleString(isAr()?'ar-MA-u-nu-latn':'fr-FR',{maximumFractionDigits:d==null?1:d});
const lgDayN=()=>{const [y,m,d]=today().split('-').map(Number);return Math.floor(Date.UTC(y,m-1,d)/DAY);};
const lgTip=(i)=>{const t=LG_TIPS[((i%LG_TIPS.length)+LG_TIPS.length)%LG_TIPS.length];return isAr()?t.a:t.f;};
const lgQs=()=>{const n=lgDayN(),N=LG_QZ.length;return [0,1,2].map(k=>(n*3+k)%N);};
const LGS={tab:'',tip:0};
function lgDaily(){if(!S.lgd||S.lgd.d!==today())S.lgd={d:today(),r:[null,null,null]};return S.lgd;}
function lgTipCard(compact){const i=lgDayN()+(LGS.tip||0);return `<div class="plan lgtip"><h3>💡 ${LGL('Astuce du jour','نصيحة اليوم')}</h3><div class="lgtt" data-nt>${esc(lgTip(i))}</div>${compact?'':`<div class="row" style="margin-top:8px"><button class="btn alt" id="lgNx" type="button">🎲 ${LGL('Une autre astuce','نصيحة أخرى')}</button></div>`}</div>`;}
function lgQuizHtml(){const d=lgDaily(),ids=lgQs();const done=d.r.filter(x=>x!==null).length;const ok=ids.filter((q,k)=>d.r[k]===LG_QZ[q].c).length;
 return `<div class="plan"><h3>🧠 ${LGL('Le défi du jour','تحدّي اليوم')} <span class="mini">· ${done}/3</span></h3>`+ids.map((qi,k)=>{const Q=LG_QZ[qi],r=d.r[k];
  return `<div class="lgq" data-nt><div class="lgqq"><b>${k+1}.</b> ${esc(isAr()?Q.q.a:Q.q.f)}</div>${Q.o.map((o,j)=>{let cls='btn alt lgo';if(r!==null){if(j===Q.c)cls='btn lgo lgok';else if(j===r)cls='btn alt lgo lgko';}return `<button type="button" class="${cls}" data-q="${k}" data-o="${j}" ${r!==null?'disabled':''}>${esc(isAr()?o.a:o.f)}</button>`;}).join('')}${r!==null?`<div class="mini lgex">${r===Q.c?'✅ ':'❌ '}${esc(isAr()?Q.e.a:Q.e.f)}</div>`:''}</div>`;}).join('')+
  (done===3?`<div class="lgfin">${ok===3?'🏆':ok>=2?'👏':'💪'} ${LGL(`Bravo : ${ok}/3 aujourd’hui. Reviens demain pour 3 nouvelles questions !`,`أحسنت: ${ok}/3 اليوم. عُد غداً لثلاثة أسئلة جديدة!`)}</div>`:'')+`</div>`;}
function lgBindQuiz(root){root.querySelectorAll('.lgo').forEach(b=>b.onclick=()=>{const d=lgDaily(),k=+b.dataset.q,j=+b.dataset.o;if(d.r[k]!==null)return;d.r[k]=j;const qi=lgQs()[k],good=j===LG_QZ[qi].c,st=lgSt();st.tot++;if(good){st.ok++;st.w=st.w.filter(x=>x!==qi);}else if(!st.w.includes(qi)){st.w.push(qi);if(st.w.length>30)st.w.shift();}
  if(d.r.every(x=>x!==null)){if(!st.days.includes(today())){st.days.push(today());if(st.days.length>120)st.days=st.days.slice(-120);}if(d.r.every((x,i)=>x===LG_QZ[lgQs()[i]].c))st.perf++;st.bs=Math.max(st.bs,lgStreak());}
  S.lgd=d;save();if(good)addXp(10);else touchStreak();lgCheck();const h=$('#lgQz');if(h){h.innerHTML=lgQuizHtml();lgBindQuiz(h);}lgRevDraw();});}
/* ---- outils ---- */
const LG_MODES=[["air",{f:"✈️ Aérien (÷ 6 000)",a:"✈️ جوي (÷ 6000)"},167],["exp",{f:"📦 Express (÷ 5 000)",a:"📦 سريع (÷ 5000)"},200],["road",{f:"🚚 Route, groupage (1 m³ = 333 kg)",a:"🚚 طرقي مجمّع (1 م³ = 333 كلغ)"},333],["sea",{f:"🚢 Maritime LCL (1 m³ = 1 000 kg)",a:"🚢 بحري مجمّع (1 م³ = 1000 كلغ)"},1000]];
function lgTools(){const f=(id,lab,ph,v)=>`<label class="lgf"><span class="mini">${lab}</span><input class="srch" id="${id}" inputmode="decimal" placeholder="${ph||''}" value="${v||''}"></label>`;
 return lgWhTools()+`<div class="plan"><h3>⚖️ ${LGL('Poids taxable (volume ou poids réel)','الوزن المحتسب (الحجم أو الوزن الفعلي)')}</h3>
 <select class="srch" id="vwM">${LG_MODES.map(m=>`<option value="${m[0]}">${isAr()?m[1].a:m[1].f}</option>`).join('')}</select>
 <div class="lgg">${f('vwL',LGL('Long. (cm)','الطول (سم)'),'120')}${f('vwW',LGL('Larg. (cm)','العرض (سم)'),'80')}${f('vwH',LGL('Haut. (cm)','الارتفاع (سم)'),'100')}</div>
 <div class="lgg2">${f('vwN',LGL('Nb de colis','عدد الطرود'),'1','1')}${f('vwK',LGL('Poids réel total (kg)','الوزن الفعلي الإجمالي (كلغ)'),'150')}</div>
 <div class="lgr" id="vwR" data-nt>—</div></div>
 <div class="plan"><h3>📦 ${LGL('Remplissage : ça rentre ?','هل تتسع الحمولة؟')}</h3>
 <select class="srch" id="fcC">${LG_CAP.map((c,i)=>`<option value="${i}">${LGB(c[0])} · ${c[1]} · ${c[2]}</option>`).join('')}</select>
 <div class="lgg2">${f('fcV',LGL('Volume à charger (m³)','الحجم المراد تحميله (م³)'),'40')}${f('fcP',LGL('Poids à charger (t)','الوزن المراد تحميله (طن)'),'12')}</div>
 <div class="lgr" id="fcR" data-nt>—</div></div>
 <div class="plan"><h3>⏱️ ${LGL('Temps de conduite (règle UE)','زمن القيادة (قواعد الاتحاد الأوروبي)')}</h3>
 <div class="lgg2">${f('tdS',LGL('Départ (hh:mm)','وقت الانطلاق (س:د)'),'06:30')}${f('tdD',LGL('Déjà conduit sans pause (h)','ساعات القيادة دون استراحة'),'0','0')}</div>
 <div class="lgr" id="tdR" data-nt>—</div>
 <div class="mini" style="margin-top:6px">${LGL('Rappel : 4 h 30 de conduite → 45 min de pause · 9 h/jour (10 h deux fois par semaine) · repos quotidien 11 h.','تذكير: 4س30د قيادة ← استراحة 45د · 9 ساعات يومياً (10 ساعات مرتين أسبوعياً) · راحة يومية 11 ساعة.')}</div></div>
 <div class="plan"><h3>⛽ ${LGL('Coût carburant d’un trajet','تكلفة الوقود لرحلة')}</h3>
 <div class="lgg">${f('cfD',LGL('Distance (km)','المسافة (كلم)'),'500')}${f('cfC',LGL('Conso (L/100 km)','الاستهلاك (ل/100كلم)'),'30')}${f('cfP',LGL('Prix du litre','سعر اللتر'),'1,60')}</div>
 <div class="lgr" id="cfR" data-nt>—</div></div>
 <div class="plan"><h3>🔁 ${LGL('Convertisseur','محوّل الوحدات')}</h3>
 <select class="srch" id="cvT">${[['kg|lb','kg ⇄ lb',2.20462],['km|mi','km ⇄ miles',0.621371],['m3|ft3','m³ ⇄ ft³',35.3147],['l|gal','L ⇄ gal (US)',0.264172],['kmh|kn','km/h ⇄ nœuds',0.539957]].map((c,i)=>`<option value="${i}">${c[1]}</option>`).join('')}</select>
 <div class="lgg2"><label class="lgf"><span class="mini" id="cvA">kg</span><input class="srch" id="cvX" inputmode="decimal" placeholder="1"></label><label class="lgf"><span class="mini" id="cvB">lb</span><input class="srch" id="cvY" inputmode="decimal" placeholder="1"></label></div></div>`;}
function lgBindTools(root){const g=id=>root.querySelector('#'+id),v=id=>lgNum(g(id).value);root.addEventListener('input',()=>{const q=lgSt();if(!q.t){q.t=1;save();lgCheck();}});
 const vw=()=>{const m=LG_MODES.find(x=>x[0]===g('vwM').value);const n=Math.max(1,v('vwN')||1),vol=v('vwL')*v('vwW')*v('vwH')/1e6*n,kg=v('vwK');const k=m[0]==='air'?1000/6:m[0]==='exp'?200:m[2];const vwt=vol*k,tax=Math.max(vwt,kg);
  g('vwR').innerHTML=vol&&(kg||vwt)?`${LGL('Volume','الحجم')} : <b>${lgFmt(vol,3)} m³</b><br>${LGL('Poids volumétrique','الوزن الحجمي')} : <b>${lgFmt(vwt,1)} kg</b> · ${LGL('Poids réel','الوزن الفعلي')} : <b>${lgFmt(kg,1)} kg</b><br>➡️ ${LGL('Poids taxable','الوزن المحتسب')} : <b class="lgbig">${lgFmt(tax,1)} kg</b> <span class="mini">(${vwt>kg?LGL('facturé au volume','يُحتسب بالحجم'):LGL('facturé au poids réel','يُحتسب بالوزن الفعلي')})</span>`:'—';};
 const fc=()=>{const c=LG_CAP[+g('fcC').value];const capV=lgNum(c[1].replace(/[^\d,.]/g,'')),capT=lgNum(c[2].replace('≈','').split('–')[0].replace(/[^\d,.]/g,''));const pv=capV?v('fcV')/capV*100:0,pt=capT?v('fcP')/capT*100:0;
  g('fcR').innerHTML=(v('fcV')||v('fcP'))?`${LGL('Volume','الحجم')} : <b>${lgFmt(pv,0)} %</b> · ${LGL('Poids','الوزن')} : <b>${lgFmt(pt,0)} %</b><br>${pv>100||pt>100?'⚠️ '+LGL('Ça ne rentre pas : ','لا يتسع: ')+(pv>100&&pt>100?LGL('volume et poids dépassent.','الحجم والوزن يتجاوزان.'):pv>100?LGL('le volume dépasse.','الحجم يتجاوز.'):LGL('le poids dépasse.','الوزن يتجاوز.')):'✅ '+LGL('Ça rentre. Facteur limitant : ','يتسع. العامل المحدِّد: ')+(pv>=pt?LGL('le volume','الحجم'):LGL('le poids','الوزن'))}<div class="mini">${LGL('Valeurs indicatives (charge utile prudente, selon le matériel).','قيم تقريبية (الحمولة المفيدة تختلف حسب المعدّات).')}</div>`:'—';};
 const td=()=>{const m=/^(\d{1,2})[:h](\d{2})$/.exec((g('tdS').value||'').trim());if(!m){g('tdR').textContent='—';return;}const st=(+m[1])*60+(+m[2]),done=Math.max(0,v('tdD')),rest=Math.max(0,4.5-done)*60,hh=x=>{x=((Math.round(x)%1440)+1440)%1440;return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0');};
  g('tdR').innerHTML=done>=4.5?`⚠️ <b>${LGL('Pause de 45 min à prendre maintenant.','يجب أخذ استراحة 45 دقيقة الآن.')}</b>`:`${LGL('Pause de 45 min à prendre avant','استراحة 45 دقيقة قبل')} <b class="lgbig">${hh(st+rest)}</b><br>${LGL('Fin de conduite max. de la journée (9 h, pauses non comptées) : environ','نهاية القيادة القصوى لليوم (9 ساعات، دون احتساب الاستراحات): نحو')} <b>${hh(st+540+45)}</b>`;};
 const cf=()=>{const d=v('cfD'),c=v('cfC'),p=v('cfP');g('cfR').innerHTML=d&&c&&p?`${LGL('Carburant','الوقود')} : <b>${lgFmt(d*c/100,1)} L</b> · ${LGL('Coût','التكلفة')} : <b class="lgbig">${lgFmt(d*c/100*p,2)}</b><br><span class="mini">${LGL('Par km','لكل كلم')} : ${lgFmt(c/100*p,3)}</span>`:'—';};
 const CV=[['kg','lb',2.20462],['km','miles',0.621371],['m³','ft³',35.3147],['L','gal',0.264172],['km/h',LGL('nœuds','عقدة'),0.539957]];
 let last='x';const cv=src=>{const c=CV[+g('cvT').value];g('cvA').textContent=c[0];g('cvB').textContent=c[1];if(src)last=src;if(last==='x'){const x=g('cvX').value;g('cvY').value=x===''?'':String(+(lgNum(x)*c[2]).toFixed(4)).replace('.',isAr()?'.':',');}else{const y=g('cvY').value;g('cvX').value=y===''?'':String(+(lgNum(y)/c[2]).toFixed(4)).replace('.',isAr()?'.':',');}};
 [['vwM',vw],['vwL',vw],['vwW',vw],['vwH',vw],['vwN',vw],['vwK',vw],['fcC',fc],['fcV',fc],['fcP',fc],['tdS',td],['tdD',td],['cfD',cf],['cfC',cf],['cfP',cf]].forEach(([id,fn])=>{g(id).addEventListener('input',fn);g(id).addEventListener('change',fn);});
 g('cvT').addEventListener('change',()=>cv());g('cvX').addEventListener('input',()=>cv('x'));g('cvY').addEventListener('input',()=>cv('y'));cv();vw();fc();td();cf();lgBindWh(root);}
/* ---- mémo ---- */
function lgMemo(){const row=r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(isAr()?r[2].a:r[2].f)}</td></tr>`;
 return `<div class="plan"><h3>📜 Incoterms 2020</h3><div class="mini" style="margin-bottom:6px">${LGL('Tous modes de transport','لكل وسائل النقل')}</div><table class="lgt" data-nt>${LG_INCO.filter(r=>r[1]==='any').map(row).join('')}</table>
 <div class="mini" style="margin:10px 0 6px">${LGL('Maritime et fluvial uniquement','البحري والنهري فقط')}</div><table class="lgt" data-nt>${LG_INCO.filter(r=>r[1]==='sea').map(row).join('')}</table></div>
 <div class="plan"><h3>🗂️ ${LGL('Documents du transport','وثائق النقل')}</h3><table class="lgt" data-nt>${LG_DOCS.map(r=>`<tr><td><b>${esc(LGB(r[0]))}</b></td><td>${esc(isAr()?r[1].a:r[1].f)}</td></tr>`).join('')}</table></div>
 <div class="plan"><h3>📐 ${LGL('Capacités indicatives','سعات تقريبية')}</h3><div style="overflow-x:auto"><table class="lgt" data-nt><tr><th></th><th>${LGL('Volume','الحجم')}</th><th>${LGL('Charge','الحمولة')}</th><th>${LGL('Palettes','الباليت')}</th></tr>${LG_CAP.map(c=>`<tr><td><b>${esc(LGB(c[0]))}</b></td><td>${c[1]}</td><td>${c[2]}</td><td>${c[3]}</td></tr>`).join('')}</table></div><div class="mini" style="margin-top:6px">${LGL('Valeurs indicatives : varient selon le matériel et le pays.','قيم تقريبية: تختلف حسب المعدّات والبلد.')}</div></div>
 ${lgWhMemo()}
 <div class="plan"><h3>🔤 ${LGL('Lexique FR ⇄ العربية','قاموس فرنسي ⇄ عربي')}</h3><input class="srch" id="lxQ" placeholder="${LGL('Chercher un mot…','ابحث عن كلمة…')}" autocomplete="off"><div id="lxL" data-nt></div></div>`;}
function lgBindMemo(root){const q=root.querySelector('#lxQ'),L=root.querySelector('#lxL');const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');const draw=()=>{const k=norm(q.value.trim());const r=LG_LEX.filter(x=>!k||norm(x[0]).includes(k)||x[1].includes(q.value.trim()));L.innerHTML=r.length?`<table class="lgt">${r.map(x=>`<tr><td><b>${esc(x[0])}</b></td><td dir="rtl" style="text-align:right">${esc(x[1])}</td></tr>`).join('')}</table>`:`<div class="mini">${LGL('Aucun résultat','لا توجد نتائج')}</div>`;};q.addEventListener('input',draw);draw();}
/* ---- actus & suivi ---- */
function lgNewsUrl(q,ar){const u=ar?'&hl=ar&gl=MA&ceid=MA:ar':'&hl=fr&gl=FR&ceid=FR:fr';return 'https://news.google.com/search?q='+encodeURIComponent(q)+u;}
function lgNews(){const lk=(ic,t,u)=>`<a class="task lgl" href="${u}" target="_blank" rel="noopener"><span style="font-size:1.4rem">${ic}</span><div><b data-nt>${esc(t)}</b></div><span class="sp"></span><span>↗</span></a>`;
 const ar=isAr();const N=[['🚛',LGL('Transport routier','النقل الطرقي'),ar?'النقل الطرقي':'transport routier'],['📦',LGL('Logistique et supply chain','اللوجستيك وسلاسل الإمداد'),ar?'اللوجستيك':'logistique supply chain'],['🚢',LGL('Transport maritime et ports','النقل البحري والموانئ'),ar?'النقل البحري الموانئ':'transport maritime ports'],['⚓',LGL('Tanger Med','طنجة المتوسط'),ar?'ميناء طنجة المتوسط':'Tanger Med'],['⛽',LGL('Prix du carburant','أسعار الوقود'),ar?'أسعار المحروقات':'prix carburant gazole']];
 return `<div class="plan"><h3>📰 ${LGL('Actus du moment','أخبار اللحظة')}</h3><div class="mini" style="margin-bottom:6px">${LGL('Ouvre les dernières actualités sur chaque sujet.','افتح آخر الأخبار حول كل موضوع.')}</div>${N.map(n=>lk(n[0],n[1],lgNewsUrl(n[2],ar))).join('')}</div>
 <div class="plan"><h3>🛰️ ${LGL('Suivi et infos pratiques','التتبّع ومعلومات عملية')}</h3>${lk('🚢',LGL('Suivre un navire (MarineTraffic)','تتبّع سفينة (MarineTraffic)'),'https://www.marinetraffic.com/')}${lk('✈️',LGL('Suivre un vol (Flightradar24)','تتبّع رحلة جوية (Flightradar24)'),'https://www.flightradar24.com/')}${lk('🚦',LGL('Trafic routier en France (Bison Futé)','حركة المرور في فرنسا (Bison Futé)'),'https://www.bison-fute.gouv.fr/')}${lk('⛽',LGL('Prix des carburants en France','أسعار الوقود في فرنسا'),'https://www.prix-carburants.gouv.fr/')}${lk('🛃',LGL('Douane marocaine (ADII)','الجمارك المغربية (ADII)'),'https://www.douane.gov.ma/')}${lk('⚓',LGL('Port Tanger Med','ميناء طنجة المتوسط'),'https://www.tangermed.ma/')}</div>`;}
/* ---- vue ---- */
function viewLog(sub){if(!S.lg){location.hash='';return;}const TB=[['','🏠',LGL('Du jour','اليوم')],['out','🧰',LGL('Outils','أدوات')],['memo','📖',LGL('Mémo','مذكّرة')],['news','📰',LGL('Actus','أخبار')],['tips','🎓',LGL('Partager','مشاركة')]];sub=TB.some(t=>t[0]===sub)?sub:'';LGS.tab=sub;
 lgSt().v[sub||'day']=1;
 const body=sub==='out'?lgTools():sub==='memo'?lgMemo():sub==='news'?lgNews():sub==='tips'?lgTipsHtml():`<div id="lgPf">${lgProfile()}</div>${lgTipCard()}<div id="lgQz">${lgQuizHtml()}</div><div id="lgRv">${lgRevCard()}</div>`;
 setApp(`<div class="banner" style="--c:#ef6c00"><h1>🚚 ${LGL('Logistique & transport','اللوجستيك والنقل')}</h1><div class="mini" style="color:#fff;opacity:.9">${LGL('Astuces, outils et infos du métier','نصائح وأدوات ومعلومات عن المهنة')}</div></div>
 <div class="tabs lgtabs">${TB.map(t=>`<button class="tab ${t[0]===sub?'on':''}" data-s="${t[0]}" type="button"><span class="lgti">${t[1]}</span><span>${t[2]}</span></button>`).join('')}</div>${body}`);
 const A=$('#app');A.querySelectorAll('.lgtabs .tab').forEach(b=>b.onclick=()=>go(b.dataset.s?'log/'+b.dataset.s:'log'));
 if(sub==='out')lgBindTools(A);else if(sub==='memo')lgBindMemo(A);else if(sub==='tips')lgBindTips(A);else if(!sub){lgBindQuiz(A);lgBindProfile($('#lgPf'));lgRevBind($('#lgRv'));const nx=$('#lgNx');if(nx)nx.onclick=()=>{LGS.tip=(LGS.tip||0)+1;const c=$('.lgtip');if(c)c.outerHTML=lgTipCard();const n2=$('#lgNx');if(n2)n2.onclick=nx.onclick;};}lgCheck();}
function lgDashCard(){if(!S.lg)return '';const i=lgDayN();const d=lgDaily();const n=d.r.filter(x=>x!==null).length;return `<div class="plan lgdash" onclick="go('log')" style="cursor:pointer"><h3>🚚 ${LGL('Astuce du jour','نصيحة اليوم')}</h3><div class="lgtt" data-nt>${esc(lgTip(i))}</div><div class="mini" style="margin-top:6px">🏅 ${LGL('Niveau','المستوى')} ${lgLvl(lgPts(lgSt()))+1} · ${esc(isAr()?LG_LV[lgLvl(lgPts(lgSt()))][2]:LG_LV[lgLvl(lgPts(lgSt()))][1])} · 🧠 ${LGL('Défi du jour','تحدّي اليوم')} : ${n}/3 ${n<3?'· '+LGL('touche pour jouer','المس للعب'):'✅'}</div></div>`;}
/* ---- extension : entrepôt, sûreté, grands comptes ---- */
LG_TIPS.push(
{f:"Réception : compare toujours ce qui arrive au bon de livraison (quantités, références, état) AVANT de signer. Une fois signé, c'est ta responsabilité.",a:"عند الاستلام: قارن دائماً ما وصل مع وصل التسليم (الكميات والمراجع والحالة) قبل التوقيع. بعد التوقيع تصبح المسؤولية عليك."},
{f:"Note le numéro du scellé au chargement et vérifie-le à l'arrivée. Scellé différent ou cassé : photo, réserve écrite et alerte immédiate.",a:"سجّل رقم الختم عند التحميل وتحقّق منه عند الوصول. ختم مختلف أو مكسور: صورة وتحفّظ مكتوب وإنذار فوري."},
{f:"Règle des 4 yeux : pour les opérations sensibles (sorties de valeur, corrections de stock), deux personnes valident.",a:"قاعدة «أربع أعين»: في العمليات الحساسة (خروج بضائع ثمينة، تصحيح المخزون) يوافق شخصان."},
{f:"Inventaire tournant : compter un peu chaque jour plutôt que tout une fois par an. Les écarts se repèrent vite, avant qu'ils grossissent.",a:"الجرد الدوري: عدّ جزء من المخزون كل يوم بدل جرد كامل مرة في السنة. تُكتشف الفروق بسرعة قبل أن تكبر."},
{f:"Classification ABC : environ 20 % des références font l'essentiel des mouvements. Range-les au plus près des quais.",a:"تصنيف ABC: نحو 20% من المراجع تمثل معظم الحركة. ضعها أقرب ما يمكن إلى الأرصفة."},
{f:"Cosmétiques, parfums, alimentaire : le suivi par numéro de lot permet de retrouver un produit en quelques minutes en cas de rappel.",a:"مستحضرات التجميل والعطور والغذاء: التتبّع برقم الدفعة يسمح بالعثور على المنتج في دقائق عند سحبه من السوق."},
{f:"TAPA : norme de sécurité pour les sites (FSR, niveaux A, B, C) et les transports (TSR, niveaux 1 à 3) de marchandises de valeur. Les grands groupes l'exigent souvent.",a:"TAPA: معيار أمني للمواقع (FSR بمستويات A وB وC) ولنقل البضائع (TSR بمستويات 1 إلى 3) الثمينة. وكثيراً ما تشترطه الشركات الكبرى."},
{f:"Ne parle jamais de la marchandise transportée ni de l'itinéraire à des inconnus. L'information est le premier outil des voleurs.",a:"لا تتحدث أبداً عن البضاعة أو خط السير مع الغرباء. المعلومة هي أول أداة للسرّاق."},
{f:"Camion chargé : jamais sans surveillance. S'arrêter dans une zone sécurisée, éclairée et passante.",a:"الشاحنة المحمّلة: لا تُترك دون مراقبة. توقّف في منطقة آمنة ومضاءة وكثيرة الحركة."},
{f:"À l'entrée du site : contrôler l'identité du chauffeur et la plaque du camion avant d'ouvrir un quai, et tout noter dans le registre.",a:"عند مدخل الموقع: تحقق من هوية السائق ولوحة الشاحنة قبل فتح الرصيف، وسجّل كل شيء في السجل."},
{f:"Prends des photos à la réception et au chargement (palettes, scellé, plaque). C'est ta meilleure preuve en cas de litige.",a:"التقط صوراً عند الاستلام والتحميل (الباليتات والختم واللوحة). هي أفضل دليل لك عند النزاع."},
{f:"OTIF (On Time In Full) : livré à l'heure ET complet. C'est l'indicateur n°1 des grands donneurs d'ordre.",a:"OTIF (في الوقت وكاملاً): التسليم في الموعد وكاملاً. هو المؤشر الأول عند كبار العملاء."},
{f:"Produits sensibles (cosmétiques, parfums) : éviter la forte chaleur et le gel, respecter la plage de température demandée par le client.",a:"المنتجات الحساسة (مستحضرات التجميل والعطور): تجنّب الحرارة الشديدة والصقيع واحترم مجال الحرارة الذي يطلبه العميل."},
{f:"Chariots élévateurs : seules les personnes formées et autorisées les conduisent, et on ne circule jamais fourches levées.",a:"الرافعات الشوكية: لا يقودها إلا المكوَّنون والمرخَّص لهم، ولا يُسار أبداً والشوكتان مرفوعتان."},
{f:"Une place pour chaque chose, chaque chose à sa place : emplacements identifiés (allée, travée, niveau) = moins d'erreurs et de temps perdu.",a:"لكل شيء مكان وكل شيء في مكانه: مواقع محددة (ممر، مقطع، مستوى) تعني أخطاء أقل ووقتاً أقل ضائعاً."},
{f:"Palette abîmée : ne la stocke pas en hauteur. Reconditionne-la (nouvelle palette, film) avant de la gerber.",a:"باليت تالف: لا تخزّنه في الأعلى. أعد تجهيزه (باليت جديد وتغليف) قبل رصّه."},
{f:"Avant de partir : prépare le trajet (pauses, parkings sûrs, météo, horaires de livraison). Cela évite la plupart des imprévus.",a:"قبل الانطلاق: حضّر الرحلة (الاستراحات ومواقف آمنة والطقس ومواعيد التسليم). هذا يجنّب معظم المفاجآت."}
);
LG_QZ.push(
{q:{f:"À la réception, que faut-il faire AVANT de signer le bon de livraison ?",a:"عند الاستلام، ماذا يجب فعله قبل توقيع وصل التسليم؟"},o:[{f:"Signer vite pour libérer le camion",a:"التوقيع بسرعة لتحرير الشاحنة"},{f:"Vérifier quantités, références et état, et noter les réserves",a:"التحقق من الكميات والمراجع والحالة وتدوين التحفظات"},{f:"Attendre le lendemain",a:"الانتظار إلى اليوم التالي"},{f:"Rien : on vérifiera plus tard",a:"لا شيء: سنتحقق لاحقاً"}],c:1,e:{f:"Une fois signé sans réserve, il devient très difficile de faire reconnaître un manquant ou une casse.",a:"بعد التوقيع دون تحفظ يصعب جداً إثبات نقص أو كسر."}},
{q:{f:"Le scellé du camion est cassé à l'arrivée. Que fait-on ?",a:"ختم الشاحنة مكسور عند الوصول. ماذا نفعل؟"},o:[{f:"On décharge normalement sans rien dire",a:"نفرّغ عادياً دون إخبار أحد"},{f:"On photographie, on note une réserve et on prévient le responsable",a:"نصوّر وندوّن تحفظاً ونُبلغ المسؤول"},{f:"On jette le scellé",a:"نرمي الختم"},{f:"On renvoie le camion sans le dire",a:"نُعيد الشاحنة دون إخبار"}],c:1,e:{f:"Scellé cassé ou différent = anomalie à documenter tout de suite (photo, réserve écrite, alerte).",a:"ختم مكسور أو مختلف = حالة شاذة تُوثَّق فوراً (صورة، تحفّظ مكتوب، إنذار)."}},
{q:{f:"TAPA, c'est…",a:"TAPA هو…"},o:[{f:"Un type de palette",a:"نوع من الباليتات"},{f:"Une norme de sécurité pour sites et transports de marchandises de valeur",a:"معيار أمني للمواقع ولنقل البضائع الثمينة"},{f:"Un logiciel de comptabilité",a:"برنامج محاسبة"},{f:"Un permis de conduire",a:"رخصة قيادة"}],c:1,e:{f:"TAPA : FSR pour les sites (niveaux A, B, C), TSR pour le transport (niveaux 1 à 3).",a:"TAPA: ‏FSR للمواقع (A وB وC) و‏TSR للنقل (من 1 إلى 3)."}},
{q:{f:"L'inventaire tournant consiste à…",a:"الجرد الدوري يعني…"},o:[{f:"Tout compter une fois par an",a:"عدّ كل شيء مرة في السنة"},{f:"Compter chaque jour une partie du stock",a:"عدّ جزء من المخزون كل يوم"},{f:"Faire tourner les palettes",a:"تدوير الباليتات"},{f:"Changer les emplacements",a:"تغيير المواقع"}],c:1,e:{f:"Compter régulièrement une partie du stock permet de détecter les écarts plus tôt.",a:"عدّ جزء من المخزون بانتظام يكشف الفروق مبكراً."}},
{q:{f:"Dans la classification ABC, les références « A » sont…",a:"في تصنيف ABC، المراجع «A» هي…"},o:[{f:"Les plus rares, rangées tout au fond",a:"الأندر، وتوضع في الأعماق"},{f:"Celles qui bougent le plus : à ranger près des quais",a:"الأكثر حركة: تُوضع قرب الأرصفة"},{f:"Les produits périmés",a:"المنتجات منتهية الصلاحية"},{f:"Les produits dangereux",a:"المنتجات الخطرة"}],c:1,e:{f:"Les références A génèrent le plus de mouvements : on les place au plus près pour gagner du temps.",a:"المراجع A هي الأكثر حركة: نضعها أقرب ما يمكن لتوفير الوقت."}},
{q:{f:"OTIF signifie…",a:"OTIF تعني…"},o:[{f:"On Time In Full : à l'heure et complet",a:"في الوقت وكاملاً"},{f:"Only Trucks In Factory",a:"شاحنات فقط في المصنع"},{f:"Over Time In Fuel",a:"وقت إضافي في الوقود"},{f:"Out Of Time, In Flow",a:"خارج الوقت"}],c:0,e:{f:"OTIF mesure les livraisons faites à l'heure ET complètes.",a:"OTIF يقيس التسليمات التي تمت في الموعد وكاملة."}},
{q:{f:"Le picking, c'est…",a:"الـ picking هو…"},o:[{f:"La préparation des commandes",a:"تحضير الطلبيات"},{f:"Le lavage des camions",a:"غسل الشاحنات"},{f:"Le paiement du fret",a:"دفع أجرة الشحن"},{f:"Le contrôle des pneus",a:"فحص العجلات"}],c:0,e:{f:"Picking = prélever les produits dans le stock pour préparer une commande.",a:"Picking = سحب المنتجات من المخزون لتحضير طلبية."}},
{q:{f:"WMS, c'est…",a:"WMS هو…"},o:[{f:"Le logiciel de gestion d'entrepôt",a:"برنامج تسيير المستودع"},{f:"Un type de chariot",a:"نوع من الرافعات"},{f:"Une norme douanière",a:"معيار جمركي"},{f:"Un permis poids lourd",a:"رخصة شاحنات ثقيلة"}],c:0,e:{f:"WMS = Warehouse Management System : il suit les stocks, emplacements et mouvements.",a:"WMS = نظام إدارة المستودع: يتتبّع المخزون والمواقع والحركات."}},
{q:{f:"La règle des « 4 yeux », c'est…",a:"قاعدة «أربع أعين» هي…"},o:[{f:"Deux personnes valident une opération sensible",a:"شخصان يوافقان على عملية حساسة"},{f:"Porter des lunettes de sécurité",a:"ارتداء نظارات السلامة"},{f:"Deux caméras par quai",a:"كاميرتان لكل رصيف"},{f:"Deux contrôles par an",a:"مراقبتان في السنة"}],c:0,e:{f:"Double validation : réduit les erreurs et les fraudes.",a:"موافقة مزدوجة: تقلّل الأخطاء والاحتيال."}},
{q:{f:"Qui peut conduire un chariot élévateur ?",a:"من يحق له قيادة الرافعة الشوكية؟"},o:[{f:"N'importe qui, s'il est pressé",a:"أي شخص إذا كان مستعجلاً"},{f:"Seulement une personne formée et autorisée",a:"فقط شخص مكوَّن ومرخَّص له"},{f:"Le visiteur",a:"الزائر"},{f:"Le chauffeur livreur",a:"سائق التسليم"}],c:1,e:{f:"La conduite exige une formation et une autorisation (CACES en France).",a:"القيادة تتطلب تكويناً وترخيصاً (CACES في فرنسا)."}},
{q:{f:"Le gerbage, c'est…",a:"الـ gerbage هو…"},o:[{f:"Empiler des palettes les unes sur les autres",a:"رصّ الباليتات فوق بعضها"},{f:"Laver un entrepôt",a:"غسل مستودع"},{f:"Compter le stock",a:"عدّ المخزون"},{f:"Étiqueter un colis",a:"وضع ملصق على طرد"}],c:0,e:{f:"Gerber = empiler. Une palette abîmée ne doit pas être gerbée.",a:"Gerber = رصّ. ولا يجوز رصّ باليت تالف."}}
);
LG_LEX.push(["Réception","الاستلام"],["Rangement","التخزين والترتيب"],["Picking (préparation de commandes)","تحضير الطلبيات"],["Inventaire","الجرد"],["Écart d'inventaire","فرق الجرد"],["Scellé","الختم"],["Gerbage","رصّ الباليتات فوق بعضها"],["Emplacement","موقع التخزين"],["Allée","الممر"],["Quai de chargement","رصيف التحميل"],["Chariot élévateur","الرافعة الشوكية"],["Cariste","سائق الرافعة الشوكية"],["Transpalette","ناقلة الباليت (ترانسباليت)"],["Gardiennage","الحراسة"],["Vidéosurveillance","المراقبة بالكاميرات"],["Contrôle d'accès","مراقبة الدخول"],["Alarme","جهاز الإنذار"],["Traçabilité","التتبّع"],["Numéro de lot","رقم الدفعة"],["Réserve (sur bon de livraison)","تحفّظ (على وصل التسليم)"],["Litige","نزاع"],["Assurance marchandises","تأمين البضائع"],["Donneur d'ordre","العميل المُكلِّف"],["Prestataire logistique (3PL)","مزوّد خدمات لوجستية"],["Stock de sécurité","مخزون الأمان"],["Couverture de stock","تغطية المخزون (بالأيام)"],["Rotation des stocks","دوران المخزون"],["Préparateur de commandes","محضّر الطلبيات"],["Entrepôt sous douane","مستودع تحت الرقابة الجمركية"],["Flux tendu","التدفق المشدود"]);
const LG_WH=[
["Réception|الاستلام",{f:"Contrôler quantités, références et état par rapport au bon de livraison ; noter les réserves ; photographier ; enregistrer.",a:"مراقبة الكميات والمراجع والحالة مقابل وصل التسليم؛ تدوين التحفظات؛ التصوير؛ التسجيل."}],
["Rangement|التخزين",{f:"Chaque palette reçoit un emplacement précis (allée, travée, niveau). On range les produits qui bougent le plus près des quais.",a:"كل باليت له موقع محدد (ممر، مقطع، مستوى). والأكثر حركة يوضع قرب الأرصفة."}],
["Préparation|التحضير",{f:"Picking : prélever dans le stock ce que demande la commande, puis contrôler avant l'expédition.",a:"Picking: سحب المطلوب من المخزون ثم المراقبة قبل الشحن."}],
["Expédition|الشحن",{f:"Vérifier le chargement, filmer et sangler, poser le scellé, noter son numéro, remettre les documents au chauffeur.",a:"التحقق من التحميل، التغليف والشد، وضع الختم وتدوين رقمه، تسليم الوثائق للسائق."}],
["Inventaire|الجرد",{f:"Annuel (tout compter) ou tournant (un peu chaque jour). L'objectif : stock réel = stock informatique.",a:"سنوي (عدّ كل شيء) أو دوري (قليلاً كل يوم). الهدف: المخزون الفعلي = المخزون في النظام."}],
["FIFO / FEFO",{f:"FIFO : premier entré, premier sorti. FEFO : premier périmé, premier sorti.",a:"FIFO: الأول دخولاً الأول خروجاً. FEFO: الأقرب انتهاءً للصلاحية يخرج أولاً."}],
["OTIF",{f:"Livré à l'heure et complet : l'indicateur clé des grands comptes.",a:"التسليم في الموعد وكاملاً: المؤشر الأساسي عند كبار العملاء."}],
["TAPA",{f:"Normes de sécurité des sites (FSR : A, B, C) et des transports (TSR : 1 à 3) de marchandises de valeur.",a:"معايير أمن المواقع (FSR: ‏A وB وC) ونقل البضائع الثمينة (TSR: من 1 إلى 3)."}]
];
const LG_SAFE=[
{f:"Contrôler l'identité du chauffeur et la plaque avant d'ouvrir un quai",a:"التحقق من هوية السائق ولوحة الشاحنة قبل فتح الرصيف"},
{f:"Registre des entrées et sorties à jour (visiteurs, camions)",a:"سجل الدخول والخروج محدَّث (الزوار والشاحنات)"},
{f:"Numéro de scellé noté au départ, vérifié à l'arrivée",a:"رقم الختم مدوَّن عند الانطلاق ومراقَب عند الوصول"},
{f:"Photos à la réception et au chargement",a:"صور عند الاستلام وعند التحميل"},
{f:"Double validation pour les sorties de valeur",a:"موافقة مزدوجة على خروج البضائع الثمينة"},
{f:"Camion chargé jamais sans surveillance, parking sécurisé",a:"الشاحنة المحمّلة لا تُترك دون مراقبة، ومواقف آمنة"},
{f:"Alarme, caméras et éclairage vérifiés régulièrement",a:"فحص الإنذار والكاميرات والإضاءة بانتظام"},
{f:"Ne pas communiquer la marchandise ni l'itinéraire à des inconnus",a:"عدم إخبار الغرباء بنوع البضاعة أو خط السير"}
];
const lgWhMemo=()=>`<div class="plan"><h3>🏭 ${LGL('Entrepôt : le cycle','المستودع: الدورة')}</h3><table class="lgt" data-nt>${LG_WH.map(r=>`<tr><td><b>${esc(LGB(r[0]))}</b></td><td>${esc(isAr()?r[1].a:r[1].f)}</td></tr>`).join('')}</table></div>
 <div class="plan"><h3>🔒 ${LGL('Sûreté : liste de contrôle','الأمن: قائمة مراجعة')}</h3><div data-nt>${LG_SAFE.map(t=>`<div class="lgck">✅ ${esc(isAr()?t.a:t.f)}</div>`).join('')}</div></div>`;
const lgWhTools=()=>{const f=(id,lab,ph,v)=>`<label class="lgf"><span class="mini">${lab}</span><input class="srch" id="${id}" inputmode="decimal" placeholder="${ph||''}" value="${v||''}"></label>`;
 return `<div class="plan"><h3>🏭 ${LGL('Capacité de stockage (palettes)','سعة التخزين (باليت)')}</h3>
 <div class="lgg">${f('whS',LGL('Surface (m²)','المساحة (م²)'),'1000')}${f('whU',LGL('% stockage','% للتخزين'),'40','40')}${f('whN',LGL('Niveaux','المستويات'),'1','1')}</div>
 <div class="lgr" id="whR" data-nt>—</div><div class="mini" style="margin-top:6px">${LGL('Le reste de la surface sert aux allées, quais et bureaux. 1 palette EUR ≈ 0,96 m² au sol.','باقي المساحة للممرات والأرصفة والمكاتب. باليت EUR ≈ 0,96 م² على الأرض.')}</div></div>
 <div class="plan"><h3>🔄 ${LGL('Rotation et couverture du stock','دوران وتغطية المخزون')}</h3>
 <div class="lgg">${f('rtS',LGL('Stock moyen','متوسط المخزون'),'500')}${f('rtO',LGL('Sorties sur la période','الخارج في الفترة'),'3000')}${f('rtD',LGL('Jours','الأيام'),'30','30')}</div>
 <div class="lgr" id="rtR" data-nt>—</div></div>
 <div class="plan"><h3>🧮 ${LGL('Fiabilité de l’inventaire','دقة الجرد')}</h3>
 <div class="lgg2">${f('ivC',LGL('Lignes comptées','الأسطر المعدودة'),'200')}${f('ivE',LGL('Lignes en écart','الأسطر ذات الفرق'),'4')}</div>
 <div class="lgr" id="ivR" data-nt>—</div></div>`;};
function lgBindWh(root){const g=id=>root.querySelector('#'+id),v=id=>lgNum(g(id).value);
 const wh=()=>{const s=v('whS'),u=Math.min(100,Math.max(0,v('whU'))),n=Math.max(1,v('whN')||1);const sol=s*u/100/0.96;g('whR').innerHTML=s?`${LGL('Emplacements au sol','المواقع على الأرض')} : <b>${lgFmt(Math.floor(sol),0)}</b><br>➡️ ${LGL('Capacité totale','السعة الإجمالية')} : <b class="lgbig">${lgFmt(Math.floor(sol)*n,0)} ${LGL('palettes','باليت')}</b>`:'—';};
 const rt=()=>{const s=v('rtS'),o=v('rtO'),d=v('rtD');g('rtR').innerHTML=s&&o&&d?`${LGL('Rotation','الدوران')} : <b>${lgFmt(o/s,2)}×</b> ${LGL('sur la période','في الفترة')}<br>${LGL('Couverture','التغطية')} : <b class="lgbig">${lgFmt(s/(o/d),1)} ${LGL('jours','يوماً')}</b>`:'—';};
 const iv=()=>{const c=v('ivC'),e=v('ivE');g('ivR').innerHTML=c&&e<=c?`${LGL('Exactitude','الدقة')} : <b class="lgbig">${lgFmt((1-e/c)*100,1)} %</b> <span class="mini">(${lgFmt(c-e,0)}/${lgFmt(c,0)} ${LGL('lignes justes','أسطر صحيحة')})</span>`:'—';};
 [['whS',wh],['whU',wh],['whN',wh],['rtS',rt],['rtO',rt],['rtD',rt],['ivC',iv],['ivE',iv]].forEach(([id,fn])=>g(id).addEventListener('input',fn));wh();rt();iv();}
/* ---- niveaux, badges, révision, coin de Papa ---- */
const LG_LV=[[0,"Apprenti","متدرّب"],[60,"Préparateur","محضّر طلبيات"],[160,"Cariste","سائق رافعة"],[320,"Chauffeur confirmé","سائق متمرّس"],[550,"Chef de quai","رئيس رصيف"],[850,"Responsable dépôt","مسؤول مستودع"],[1250,"Expert sûreté","خبير أمن"],[1800,"Maître logisticien","أستاذ اللوجستيك"]];
function lgSt(){const s=S.lgs=S.lgs&&typeof S.lgs==='object'?S.lgs:{};['ok','tot','perf','sh','bs','t','rv'].forEach(k=>{if(typeof s[k]!=='number')s[k]=0;});if(!Array.isArray(s.days))s.days=[];if(!Array.isArray(s.w))s.w=[];if(!s.v||typeof s.v!=='object')s.v={};if(!s.b||typeof s.b!=='object')s.b={};return s;}
function lgStreak(){const set=new Set(lgSt().days);let n=0,d=today();if(!set.has(d))d=addD(d,-1);while(set.has(d)){n++;d=addD(d,-1);}return n;}
const lgPts=s=>s.ok*10+(s.tot-s.ok)*2+s.sh*15+s.days.length*10;
function lgLvl(p){let i=0;LG_LV.forEach((l,k)=>{if(p>=l[0])i=k;});return i;}
const LG_BD=[
['first','🥉',{f:'Premier pas',a:'الخطوة الأولى'},{f:'Répondre à une première question.',a:'أجب عن أول سؤال.'},s=>s.tot>=1],
['perf','🎯',{f:'Sans faute',a:'بلا أخطاء'},{f:'3 bonnes réponses sur 3 dans un défi.',a:'3 إجابات صحيحة من 3 في تحدٍّ واحد.'},s=>s.perf>=1],
['st3','🔥',{f:'3 jours d’affilée',a:'3 أيام متتالية'},{f:'Terminer le défi 3 jours de suite.',a:'إنهاء التحدي 3 أيام متتالية.'},s=>s.bs>=3],
['st7','🏆',{f:'7 jours d’affilée',a:'7 أيام متتالية'},{f:'Terminer le défi 7 jours de suite.',a:'إنهاء التحدي 7 أيام متتالية.'},s=>s.bs>=7],
['ok50','📚',{f:'50 bonnes réponses',a:'50 إجابة صحيحة'},{f:'Atteindre 50 bonnes réponses.',a:'الوصول إلى 50 إجابة صحيحة.'},s=>s.ok>=50],
['reg','⭐',{f:'Régulier',a:'منتظم'},{f:'Terminer 10 défis du jour.',a:'إنهاء 10 تحديات يومية.'},s=>s.days.length>=10],
['tool','🧰',{f:'Touche-à-tout',a:'متعدد المهارات'},{f:'Essayer un outil de calcul.',a:'تجربة أداة حساب.'},s=>s.t>=1],
['explo','🧭',{f:'Explorateur',a:'مستكشف'},{f:'Visiter toutes les sections.',a:'زيارة كل الأقسام.'},s=>['day','out','memo','news','tips'].every(k=>s.v[k])],
['share','🎓',{f:'Transmetteur',a:'ناقل الخبرة'},{f:'Partager une astuce avec la famille.',a:'مشاركة نصيحة مع العائلة.'},s=>s.sh>=1],
['rev','🛡️',{f:'Réviseur',a:'مراجِع'},{f:'Corriger une erreur en révision.',a:'تصحيح خطأ في المراجعة.'},s=>s.rv>=1]
];
function lgCheck(){const s=lgSt(),msg=[];const l0=typeof s.lv==='number'?s.lv:lgLvl(lgPts(s));
 LG_BD.forEach(b=>{if(!s.b[b[0]]&&b[4](s)){s.b[b[0]]=today();msg.push('🏅 '+(isAr()?b[2].a:b[2].f));}});
 const l1=lgLvl(lgPts(s));if(l1>l0)msg.unshift('🎉 '+LGL('Niveau','المستوى')+' '+(l1+1)+' : '+(isAr()?LG_LV[l1][2]:LG_LV[l1][1]));s.lv=l1;save();
 if(msg.length)toast(msg.join('  ·  '),4500);
 const p=$('#lgPf');if(p){p.innerHTML=lgProfile();lgBindProfile(p);}}
function lgProfile(){const s=lgSt(),p=lgPts(s),i=lgLvl(p),nx=LG_LV[i+1],cur=LG_LV[i],pc=nx?Math.round((p-cur[0])/(nx[0]-cur[0])*100):100,n=Object.keys(s.b).length;
 return `<div class="plan"><h3>🏅 ${LGL('Niveau','المستوى')} ${i+1} · ${esc(isAr()?cur[2]:cur[1])}</h3><div class="lgbar"><i style="width:${pc}%"></i></div><div class="mini" style="margin-top:6px">${nx?LGL(`${p} points · encore ${nx[0]-p} pour devenir « ${nx[1]} »`,`${p} نقطة · تبقّى ${nx[0]-p} لتصبح «${nx[2]}»`):LGL(`${p} points · niveau maximum atteint 👑`,`${p} نقطة · بلغت أعلى مستوى 👑`)}</div>
 <div class="mini" style="margin:10px 0 6px">${LGL('Mes badges','شاراتي')} (${n}/${LG_BD.length}) · 🔥 ${LGL('série','سلسلة')} ${lgStreak()}</div><div class="lgbds">${LG_BD.map(b=>`<button type="button" class="lgbd ${s.b[b[0]]?'':'off'}" data-b="${b[0]}" aria-label="${esc(isAr()?b[2].a:b[2].f)}">${s.b[b[0]]?b[1]:'🔒'}</button>`).join('')}</div><div class="mini lgpts">ℹ️ ${LGL('Points : +10 bonne réponse · +2 mauvaise réponse · +10 défi du jour terminé · +15 astuce partagée. Joue chaque jour pour monter de niveau !','النقاط: ‎+10 إجابة صحيحة · ‎+2 إجابة خاطئة · ‎+10 إنهاء تحدّي اليوم · ‎+15 مشاركة نصيحة. العب كل يوم لترتقي في المستوى!')}</div></div>`;}
function lgBindProfile(root){root.querySelectorAll('.lgbd').forEach(b=>b.onclick=()=>{const d=LG_BD.find(x=>x[0]===b.dataset.b);if(!d)return;const on=lgSt().b[d[0]];toast((on?d[1]:'🔒')+' '+(isAr()?d[2].a:d[2].f)+' : '+(isAr()?d[3].a:d[3].f),3500);});}
/* ---- révision des erreurs ---- */
function lgRevCard(){const s=lgSt();if(LGS.rq)return lgRevQ();if(!s.w.length)return '';return `<div class="plan"><h3>🔁 ${LGL('Réviser mes erreurs','مراجعة أخطائي')}</h3><div class="mini">${LGL(`${s.w.length} question${s.w.length>1?'s':''} à revoir : on les rejoue jusqu’à les réussir.`,`${s.w.length} أسئلة للمراجعة: نعيدها حتى تنجح فيها.`)}</div><div class="row" style="margin-top:8px"><button class="btn" id="rvGo" type="button">▶️ ${LGL('Commencer','ابدأ')}</button></div></div>`;}
function lgRevQ(){const s=lgSt(),q=LGS.rq;if(!s.w.length&&q.a===null){LGS.rq=null;return `<div class="plan"><h3>🔁 ${LGL('Révision terminée','انتهت المراجعة')}</h3><div class="lgfin">🏆 ${LGL('Plus aucune erreur à revoir. Bravo !','لا توجد أخطاء للمراجعة. أحسنت!')}</div></div>`;}
 if(q.qi==null||(q.a===null&&!s.w.includes(q.qi)))q.qi=s.w[0];const Q=LG_QZ[q.qi];
 return `<div class="plan"><h3>🔁 ${LGL('Révision','مراجعة')} <span class="mini">· ${s.w.length} ${LGL('restante(s)','متبقٍّ')}</span></h3><div class="lgq" data-nt><div class="lgqq">${esc(isAr()?Q.q.a:Q.q.f)}</div>${Q.o.map((o,j)=>{let cls='btn alt lgo';if(q.a!==null){if(j===Q.c)cls='btn lgo lgok';else if(j===q.a)cls='btn alt lgo lgko';}return `<button type="button" class="${cls}" data-rv="${j}" ${q.a!==null?'disabled':''}>${esc(isAr()?o.a:o.f)}</button>`;}).join('')}${q.a!==null?`<div class="mini lgex">${q.a===Q.c?'✅ ':'❌ '}${esc(isAr()?Q.e.a:Q.e.f)}</div><div class="row" style="margin-top:8px"><button class="btn" id="rvNx" type="button">${s.w.length?LGL('Suivant','التالي')+' ➜':LGL('Terminer','إنهاء')+' ✓'}</button><button class="btn alt" id="rvEnd" type="button">${LGL('Arrêter','إيقاف')}</button></div>`:''}</div></div>`;}
function lgRevBind(root){const go=root.querySelector('#rvGo');if(go)go.onclick=()=>{LGS.rq={qi:null,a:null};lgRevDraw();};
 root.querySelectorAll('[data-rv]').forEach(b=>b.onclick=()=>{const q=LGS.rq,s=lgSt();if(!q||q.a!==null)return;const j=+b.dataset.rv,Q=LG_QZ[q.qi];q.a=j;if(j===Q.c){s.w=s.w.filter(x=>x!==q.qi);s.rv++;addXp(5);}else{s.w=s.w.filter(x=>x!==q.qi);s.w.push(q.qi);}save();lgCheck();lgRevDraw();});
 const nx=root.querySelector('#rvNx');if(nx)nx.onclick=()=>{const s=lgSt();LGS.rq={qi:s.w.find(x=>x!==LGS.rq.qi)??s.w[0]??null,a:null};lgRevDraw();};
 const en=root.querySelector('#rvEnd');if(en)en.onclick=()=>{LGS.rq=null;lgRevDraw();};}
function lgRevDraw(){const h=$('#lgRv');if(!h)return;h.innerHTML=lgRevCard();lgRevBind(h);}
/* ---- coin de Papa : partager une astuce ---- */
const LG_CAT=[['route','🚛',{f:'Route',a:'الطريق'}],['depot','🏭',{f:'Dépôt',a:'المستودع'}],['sec','🔒',{f:'Sécurité',a:'الأمن'}],['autre','💬',{f:'Autre',a:'أخرى'}]];
const lgCatOf=c=>LG_CAT.find(x=>x[0]===c)||LG_CAT[3];
function lgTipsHtml(){if(!SY.fid)return `<div class="plan"><h3>🎓 ${LGL('Le coin de Papa','ركن بابا')}</h3><div class="mini">${LGL('Rejoins d’abord ta famille (onglet Famille) pour pouvoir partager tes astuces.','انضم أولاً إلى عائلتك (تبويب العائلة) لتتمكن من مشاركة نصائحك.')}</div></div>`;
 return `<div class="plan"><h3>🎓 ${LGL('Partager une astuce avec la famille','شارك نصيحة مع العائلة')}</h3><div class="mini">${LGL('Ton expérience compte : écris une astuce de ton métier. Toute la famille la reçoit.','خبرتك مهمة: اكتب نصيحة من مهنتك وستصل إلى كل العائلة.')}</div>
 <div class="lgcat">${LG_CAT.map(c=>`<button type="button" class="lgcb ${(LGS.cat||'autre')===c[0]?'on':''}" data-c="${c[0]}">${c[1]} ${isAr()?c[2].a:c[2].f}</button>`).join('')}</div>
 <textarea class="srch" id="tpT" rows="4" maxlength="600" dir="auto" placeholder="${LGL('Mon astuce…','نصيحتي…')}" style="width:100%;resize:vertical"></textarea>
 <div class="row" style="margin-top:8px"><button class="btn" id="tpGo" type="button">📣 ${LGL('Partager','مشاركة')}</button><span class="mini" id="tpN">0/600</span></div></div>
 <div class="plan"><h3>📚 ${LGL('Les astuces de la famille','نصائح العائلة')}</h3><div id="tpL"><div class="mini">${LGL('Chargement…','جارٍ التحميل…')}</div></div></div>`;}
async function lgTipsLoad(){const L=$('#tpL');if(!L||!SY.fid)return;if(!CH.ov){try{await chOverview();}catch(e){}}
 let r;try{r=await sbData('/rest/v1/rpc/chat_tips',{m:'POST',b:{f:SY.fid}})||[];}catch(e){const L1=$('#tpL');if(L1)L1.innerHTML=`<div class="mini">${LGL('Impossible de charger la liste pour le moment.','تعذّر تحميل القائمة حالياً.')}</div>`;return;}
 const L2=$('#tpL');if(!L2)return;
 L2.innerHTML=r.length?r.map(m=>{const mine=m.sender===chMe(),c=lgCatOf(m.meta&&m.meta.c),dt=new Date(m.created_at).toLocaleDateString(isAr()?'ar-MA-u-nu-latn':'fr-FR',{day:'numeric',month:'short'});
  return `<div class="lgtp" data-id="${m.id}"><div class="mini" data-nt><b>${esc(mine?LGL('Moi','أنا'):chName(m.sender))}</b> · ${c[1]} ${esc(isAr()?c[2].a:c[2].f)} · ${esc(dt)}</div><div class="lgtt" dir="auto" data-nt>${esc(m.body||'')}</div><div class="row" style="margin-top:6px"><button class="btn alt tpR" type="button">💬 ${LGL('Répondre','رد')}</button>${mine?`<button class="btn alt tpD" type="button">🗑️</button>`:''}</div></div>`;}).join(''):`<div class="mini">${LGL('Aucune astuce pour le moment. Sois le premier !','لا توجد نصائح بعد. كن الأول!')}</div>`;
 L2.querySelectorAll('.lgtp').forEach(el=>{const id=+el.dataset.id;const rp=el.querySelector('.tpR');if(rp)rp.onclick=()=>go('chat/fam');const d=el.querySelector('.tpD');if(d)d.onclick=async()=>{if(!confirm(LGL('Supprimer cette astuce ?','حذف هذه النصيحة؟')))return;try{await sbData('/rest/v1/rpc/chat_delete',{m:'POST',b:{mid:id}});toast(LGL('Astuce supprimée','تم حذف النصيحة'));lgTipsLoad();}catch(e){toast(frErr(e.message));}};});}
async function lgTipPost(){const t=$('#tpT'),v=(t.value||'').trim();if(v.length<5){toast(LGL('Écris au moins quelques mots','اكتب بضع كلمات على الأقل'));return;}
 const b=$('#tpGo');b.disabled=true;try{await sbData('/rest/v1/rpc/chat_send',{m:'POST',b:{f:SY.fid,to_u:null,k:'text',b:v.slice(0,600),m:null,mi:null,d:null,mt:{tip:1,c:LGS.cat||'autre'}}});t.value='';const n=$('#tpN');if(n)n.textContent='0/600';const s=lgSt();s.sh++;save();lgCheck();toast(LGL('Astuce partagée avec la famille 🎓','تمت مشاركة النصيحة مع العائلة 🎓'),3000);lgTipsLoad();}
 catch(e){toast(e&&e.net?LGL('Pas de connexion : réessaie','لا يوجد اتصال: أعد المحاولة'):frErr(e&&e.message));}const b2=$('#tpGo');if(b2)b2.disabled=false;}
function lgBindTips(root){root.querySelectorAll('.lgcb').forEach(b=>b.onclick=()=>{LGS.cat=b.dataset.c;root.querySelectorAll('.lgcb').forEach(x=>x.classList.toggle('on',x===b));});
 const t=root.querySelector('#tpT');if(t){t.addEventListener('input',()=>{const n=root.querySelector('#tpN');if(n)n.textContent=t.value.length+'/600';});}
 const g=root.querySelector('#tpGo');if(g)g.onclick=lgTipPost;lgTipsLoad();}
/* ================= 🌸 COIN DE MAMAN (100 % arabe) ================= */
const MM_DUA=[
["رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ","البقرة ٢٠١"],
["رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي","طه ٢٥-٢٦"],
["رَبِّ زِدْنِي عِلْمًا","طه ١١٤"],
["حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ","آل عمران ١٧٣"],
["رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا","الفرقان ٧٤"],
["رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ","إبراهيم ٤١"],
["لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ","الأنبياء ٨٧"],
["رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا","البقرة ٢٨٦"],
["رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ","البقرة ١٢٧"],
["رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ","آل عمران ٨"],
["اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ","دعاء"],
["اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ","دعاء"],
["يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ","دعاء"],
["اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي","دعاء"]
];
const MM_ZK_COMMON=[
{t:"اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",n:1,h:"آية الكرسي"},
{t:"قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",n:3,h:"سورة الإخلاص"},
{t:"قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",n:3,h:"سورة الفلق"},
{t:"قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",n:3,h:"سورة الناس"}
];
const MM_ZK_MORNING=MM_ZK_COMMON.concat([
{t:"اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",n:1},
{t:"اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",n:1,h:"سيد الاستغفار"},
{t:"بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",n:3},
{t:"رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",n:3},
{t:"حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",n:7},
{t:"اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",n:10},
{t:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",n:100},
{t:"أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",n:100}
]);
const MM_ZK_EVENING=MM_ZK_COMMON.concat([
{t:"اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",n:1},
{t:"اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",n:1,h:"سيد الاستغفار"},
{t:"بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",n:3},
{t:"رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",n:3},
{t:"حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",n:7},
{t:"اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",n:10},
{t:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",n:100},
{t:"أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",n:100}
]);
const MM_TS=[["سُبْحَانَ اللَّهِ",33],["الْحَمْدُ لِلَّهِ",33],["اللَّهُ أَكْبَرُ",34],["لَا إِلَٰهَ إِلَّا اللَّهُ",100],["أَسْتَغْفِرُ اللَّهَ",100],["اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",100]];
const MMS={tab:'',set:null,open:null};
const mmN=n=>(+n).toLocaleString('ar-MA-u-nu-latn');
function mmD(){const d=S.mmd=S.mmd&&typeof S.mmd==='object'?S.mmd:{};if(!d.a||d.a.d!==today())d.a={d:today(),k:{},f:{}};if(!d.t||typeof d.t!=='object')d.t={i:0,n:0};return d;}
const mmSet=()=>MMS.set||(new Date().getHours()<15?'m':'e');
const mmDua=()=>MM_DUA[((lgDayN()%MM_DUA.length)+MM_DUA.length)%MM_DUA.length];
function mmDuaCard(compact){const d=mmDua();return `<div class="plan mmc"><h3>🤲 دعاء اليوم</h3><div class="mmq" data-nt>${esc(d[0])}</div><div class="mini" data-nt>${esc(d[1])}</div></div>`;}
function mmVerse(){const L=REL.filter(r=>{const A=RELAR[r.i];return A&&A.a&&!RELX.has(r.i);});if(!L.length)return '';const r=L[((lgDayN()%L.length)+L.length)%L.length];return `<div class="plan mmc"><h3>📖 تذكرة اليوم</h3><div class="mm-rel" data-nt>${relHtml(r,false)}</div></div>`;}
function mmHello(){const h=new Date().getHours(),n=(S.me||'').trim();return (h<12?'صباح الخير':h<18?'نهارك سعيد':'مساء الخير')+(n?' يا '+n:'')+' 🌸';}
function mmDay(){const d=mmD(),set=mmSet(),Z=set==='m'?MM_ZK_MORNING:MM_ZK_EVENING;const done=Z.every((z,i)=>(d.a.k[set+i]||0)>=z.n);
 return `<div class="plan"><h3>${esc(mmHello())}</h3><div class="mini">${esc(new Date().toLocaleDateString('ar-MA-u-nu-latn',{weekday:'long',day:'numeric',month:'long'}))}</div></div>
 ${prayerCard()}${mmDuaCard()}${mmWordCard()}
 <div class="plan" style="cursor:pointer" onclick="go('mm/dhikr')"><h3>${set==='m'?'🌅 أذكار الصباح':'🌙 أذكار المساء'}</h3><div class="mini">${done?'✅ أتممتِها اليوم، تقبّل الله منك':'اضغطي لقراءتها الآن'}</div></div>
 ${mmVerse()}`;}
/* ---- أذكار ---- */
function mmDhikr(){const d=mmD(),set=mmSet(),Z=set==='m'?MM_ZK_MORNING:MM_ZK_EVENING;
 return `<div class="row mmseg"><button type="button" class="btn ${set==='m'?'':'alt'}" data-set="m">🌅 الصباح</button><button type="button" class="btn ${set==='e'?'':'alt'}" data-set="e">🌙 المساء</button></div>
 <div class="mini" style="margin:6px 0 10px">اضغطي على كل ذكر بعد قراءته ليُحتسب التكرار.</div>
 ${Z.map((z,i)=>{const c=Math.min(d.a.k[set+i]||0,z.n),ok=c>=z.n;return `<div class="plan mmz ${ok?'ok':''}" data-i="${i}" role="button" tabindex="0">${z.h?`<div class="mini"><b>${esc(z.h)}</b></div>`:''}<div class="mmq" data-nt>${esc(z.t)}</div><div class="mmcnt">${ok?'✅':''} ${mmN(c)} / ${mmN(z.n)}</div></div>`;}).join('')}
 <div class="mini" style="margin-top:8px">للتأكد من صحة النصوص راجعي أهل العلم أو مصحفك.</div>`;}
function mmBindDhikr(root){root.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{MMS.set=b.dataset.set;viewMm('dhikr');});
 root.querySelectorAll('.mmz').forEach(el=>{const tap=()=>{const d=mmD(),set=mmSet(),Z=set==='m'?MM_ZK_MORNING:MM_ZK_EVENING,i=+el.dataset.i,z=Z[i];const k=set+i;if((d.a.k[k]||0)>=z.n)return;d.a.k[k]=(d.a.k[k]||0)+1;try{navigator.vibrate&&navigator.vibrate(15);}catch(e){}
   const all=Z.every((q,j)=>(d.a.k[set+j]||0)>=q.n);if(all&&!d.a.f[set]){d.a.f[set]=1;toast('تقبّل الله منك 🤲',3500);}save();
   const c=Math.min(d.a.k[k],z.n),ok=c>=z.n;el.classList.toggle('ok',ok);const ct=el.querySelector('.mmcnt');if(ct)ct.textContent=(ok?'✅ ':'')+mmN(c)+' / '+mmN(z.n);};
  el.onclick=tap;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tap();}};});}
/* ---- مسبحة ---- */
function mmTasbih(){const t=mmD().t,[txt,goal]=MM_TS[t.i]||MM_TS[0];
 return `<div class="plan" style="text-align:center"><select class="srch" id="tsS" style="font-size:1.1rem">${MM_TS.map((x,i)=>`<option value="${i}" ${i===t.i?'selected':''}>${esc(x[0])}</option>`).join('')}</select>
 <div class="mmq" style="margin:14px 0" data-nt>${esc(txt)}</div>
 <button type="button" class="mmtap" id="tsB" aria-label="تسبيح"><span id="tsN">${mmN(t.n)}</span><small>/ ${mmN(goal)}</small></button>
 <div class="row" style="justify-content:center;margin-top:14px"><button type="button" class="btn alt" id="tsR">🔄 من جديد</button></div></div>`;}
function mmBindTasbih(root){const t=mmD().t,B=root.querySelector('#tsB');
 const goalOf=()=>(MM_TS[mmD().t.i]||MM_TS[0])[1];
 B.onclick=()=>{const q=mmD().t;q.n++;try{navigator.vibrate&&navigator.vibrate(q.n>=goalOf()?[60,40,60]:12);}catch(e){}root.querySelector('#tsN').textContent=mmN(q.n);if(q.n===goalOf())toast('ما شاء الله، أتممتِ العدد 🌟',3000);save();};
 root.querySelector('#tsR').onclick=()=>{const q=mmD().t;q.n=0;root.querySelector('#tsN').textContent=mmN(0);save();};
 root.querySelector('#tsS').onchange=e=>{const q=mmD().t;q.i=+e.target.value;q.n=0;save();viewMm('tasbih');};}
/* ---- وصفات ---- */
function mmRcHtml(meta,who){const I=(meta.i||[]).map(x=>`<li>${esc(x)}</li>`).join(''),St=(meta.s||[]).map(x=>`<li>${esc(x)}</li>`).join('');
 return `<div class="mmrc" dir="rtl" data-nt><div class="mini"><b>🍲 وصفة من ${esc(who)}</b></div><div class="mmrt">${esc(meta.t||'')}</div><div class="mini"><b>المقادير</b></div><ul>${I}</ul><div class="mini"><b>الطريقة</b></div><ol>${St}</ol></div>`;}
function mmRecipes(){if(!SY.fid)return `<div class="plan"><div class="mini">انضمي أولاً إلى عائلتك (تبويب العائلة) لتتمكني من مشاركة وصفاتك.</div></div>`;
 return `<div class="plan"><h3>🍲 شاركي وصفة مع العائلة</h3><div class="mini" style="margin-bottom:8px">اكتبي وصفتك أو أملِيها بصوتك عبر زر الميكروفون في لوحة المفاتيح. ستصل إلى كل العائلة.</div>
 <input class="srch" id="rcT" maxlength="60" placeholder="اسم الأكلة (مثال: طاجين بالبرقوق)" dir="auto" style="width:100%">
 <div class="mini" style="margin-top:8px">المقادير (مقدار في كل سطر)</div><textarea class="srch" id="rcI" rows="5" dir="auto" placeholder="كيلو لحم&#10;٣ بصلات&#10;ملعقة سمن" style="width:100%;resize:vertical"></textarea>
 <div class="mini" style="margin-top:8px">الطريقة (خطوة في كل سطر)</div><textarea class="srch" id="rcS" rows="6" dir="auto" placeholder="نقطّع اللحم…&#10;نضيف التوابل…" style="width:100%;resize:vertical"></textarea>
 <div class="row" style="margin-top:8px"><button class="btn" id="rcGo" type="button">📣 مشاركة الوصفة</button></div></div>
 <div class="plan"><h3>📚 وصفات العائلة</h3><div id="rcL"><div class="mini">جارٍ التحميل…</div></div></div>`;}
async function mmRcLoad(){const L=$('#rcL');if(!L||!SY.fid)return;if(!CH.ov){try{await chOverview();}catch(e){}}
 let r;try{r=await sbData('/rest/v1/rpc/chat_recipes',{m:'POST',b:{f:SY.fid}})||[];}catch(e){const L1=$('#rcL');if(L1)L1.innerHTML='<div class="mini">تعذّر تحميل القائمة حالياً.</div>';return;}
 const L2=$('#rcL');if(!L2)return;
 L2.innerHTML=r.length?r.map(m=>{const mine=m.sender===chMe(),dt=new Date(m.created_at).toLocaleDateString('ar-MA-u-nu-latn',{day:'numeric',month:'short'}),who=mine?'أنا':chName(m.sender);
  return `<details class="mmd" data-id="${m.id}"><summary><b data-nt>${esc((m.meta&&m.meta.t)||m.body||'')}</b> <span class="mini" data-nt>· ${esc(who)} · ${esc(dt)}</span></summary>${mmRcHtml(m.meta||{},who)}<div class="row" style="margin-top:6px"><button class="btn alt rcR" type="button">💬 رد</button>${mine?'<button class="btn alt rcD" type="button">🗑️ حذف</button>':''}</div></details>`;}).join(''):'<div class="mini">لا توجد وصفات بعد. كوني أول من يشارك 🌸</div>';
 L2.querySelectorAll('.mmd').forEach(el=>{const id=+el.dataset.id,rp=el.querySelector('.rcR');if(rp)rp.onclick=()=>go('chat/fam');const d=el.querySelector('.rcD');if(d)d.onclick=async()=>{if(!confirm('حذف هذه الوصفة؟'))return;try{await sbData('/rest/v1/rpc/chat_delete',{m:'POST',b:{mid:id}});toast('تم حذف الوصفة');mmRcLoad();}catch(e){toast(frErr(e.message));}};});}
async function mmRcPost(){const T=$('#rcT'),I=$('#rcI'),St=$('#rcS');const ln=v=>String(v||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
 const t=(T.value||'').trim().slice(0,60),i=ln(I.value).slice(0,25).map(x=>x.slice(0,100)),s=ln(St.value).slice(0,20).map(x=>x.slice(0,220));
 if(t.length<2){toast('اكتبي اسم الأكلة');return;}if(!i.length){toast('اكتبي المقادير');return;}if(!s.length){toast('اكتبي طريقة التحضير');return;}
 const meta={rc:1,t,i,s};if(JSON.stringify(meta).length>2800){toast('الوصفة طويلة جداً، اختصريها قليلاً');return;}
 const b=$('#rcGo');b.disabled=true;try{await sbData('/rest/v1/rpc/chat_send',{m:'POST',b:{f:SY.fid,to_u:null,k:'text',b:t,m:null,mi:null,d:null,mt:meta}});T.value=I.value=St.value='';toast('تمت مشاركة الوصفة مع العائلة 🍲',3000);mmRcLoad();}
 catch(e){toast(e&&e.net?'لا يوجد اتصال: أعيدي المحاولة':frErr(e&&e.message));}const b2=$('#rcGo');if(b2)b2.disabled=false;}
/* ---- vue ---- */
function viewMm(sub,extra){if(!S.mm){location.hash='';return;}const TB=[['','🏠','اليوم'],['dhikr','📿','الأذكار'],['tasbih','🔢','المسبحة'],['fr','🇫🇷','الفرنسية'],['rcp','🍲','الوصفات']];sub=TB.some(t=>t[0]===sub)?sub:'';MMS.tab=sub;
 const body=sub==='dhikr'?mmDhikr():sub==='tasbih'?mmTasbih():sub==='fr'?mmFr(extra||''):sub==='rcp'?mmRecipes():mmDay();
 setApp(`<div class="mm" dir="rtl" lang="ar"><div class="banner" style="--c:#ad1457"><h1 data-nt>🌸 ركني</h1><div class="mini" data-nt style="color:#fff;opacity:.9">أذكار، مسبحة ووصفات العائلة</div></div>
 <div class="tabs lgtabs mmtabs">${TB.map(t=>`<button class="tab ${t[0]===sub?'on':''}" data-s="${t[0]}" type="button"><span class="lgti">${t[1]}</span><span>${t[2]}</span></button>`).join('')}</div>${body}</div>`);
 const A=$('#app');A.querySelectorAll('.mmtabs .tab').forEach(b=>b.onclick=()=>go(b.dataset.s?'mm/'+b.dataset.s:'mm'));
 if(sub==='dhikr')mmBindDhikr(A);else if(sub==='tasbih')mmBindTasbih(A);else if(sub==='fr')mmBindFr(A,extra||'');else if(!sub){const ws=$('#wdSay');if(ws)ws.onclick=()=>mmSay(mmWordToday()[0]);}else if(sub==='rcp'){const g=$('#rcGo');if(g){g.onclick=mmRcPost;mmRcLoad();}}}
function mmDashCard(){if(!S.mm)return '';const d=mmDua(),dd=mmD(),set=mmSet(),Z=set==='m'?MM_ZK_MORNING:MM_ZK_EVENING,done=Z.every((z,i)=>(dd.a.k[set+i]||0)>=z.n);
 return `<div class="plan mmdash" dir="rtl" onclick="go('mm')" style="cursor:pointer"><h3>🌸 ${esc(mmHello())}</h3><div class="mmq" data-nt>${esc(d[0])}</div><div class="mini" style="margin-top:6px">${set==='m'?'🌅 أذكار الصباح':'🌙 أذكار المساء'} : ${done?'✅':'اضغطي للقراءة'}</div></div>`;}
/* ---- 🇫🇷 تعلّم الفرنسية خطوة بخطوة (pour Maman) ---- */
const MM_FR=[
{id:'hi',ic:'👋',ar:'التحيات',fr:'Les salutations',w:[
["Bonjour","صباح الخير / مرحباً (في النهار)","بونجور"],["Bonsoir","مساء الخير","بونسوار"],["Salut","سلام (بين الأصدقاء والعائلة)","سالي"],["Au revoir","إلى اللقاء","أورڤوار"],["Merci","شكراً","ميرسي"],["S'il vous plaît","من فضلك","سيل ڤو بليه"],["Excusez-moi","المعذرة / عفواً","إكسكيزيه موا"],["Comment allez-vous ?","كيف حالك؟","كومان تاليه ڤو"],["Je vais bien, merci","أنا بخير، شكراً","جو ڤيه بيان، ميرسي"],["Enchantée","تشرّفت بمعرفتك (امرأة تقولها)","انشانتيه"]]},
{id:'me',ic:'🙋‍♀️',ar:'أعرّف بنفسي',fr:'Se présenter',w:[
["Je m'appelle…","اسمي…","جو مابيل"],["Comment vous appelez-vous ?","ما اسمك؟","كومان ڤو زابليه ڤو"],["Je suis marocaine","أنا مغربية","جو سوي ماروكين"],["J'habite à…","أسكن في…","جابيت آ"],["Oui","نعم","ويي"],["Non","لا","نون"],["Je ne comprends pas","لا أفهم","جو نو كونبران با"],["Parlez lentement, s'il vous plaît","تكلّم ببطء من فضلك","بارليه لانتمان، سيل ڤو بليه"],["Pouvez-vous répéter ?","هل يمكنك أن تعيد؟","بوڤيه ڤو ريبيتيه"],["Je parle un peu français","أتكلم قليلاً من الفرنسية","جو بارل أون بو فرانسيه"]]},
{id:'nb',ic:'🔢',ar:'الأرقام',fr:'Les nombres',w:[
["Un","١ — واحد","أون"],["Deux","٢ — اثنان","دو"],["Trois","٣ — ثلاثة","تروا"],["Quatre","٤ — أربعة","كاتر"],["Cinq","٥ — خمسة","سانك"],["Six","٦ — ستة","سيس"],["Sept","٧ — سبعة","سيت"],["Huit","٨ — ثمانية","ويت"],["Neuf","٩ — تسعة","نوف"],["Dix","١٠ — عشرة","ديس"]]},
{id:'fa',ic:'👨‍👩‍👧',ar:'العائلة',fr:'La famille',w:[
["La famille","العائلة","لا فاميي"],["Mon mari","زوجي","مون ماري"],["Ma fille","ابنتي","ما فيي"],["Mon fils","ابني","مون فيس"],["Mes enfants","أولادي","ميز انفان"],["Mon gendre","زوج ابنتي (صهري)","مون جاندر"],["Mes petits-enfants","أحفادي","مي بوتي زانفان"],["Ma sœur","أختي","ما سور"],["Mon frère","أخي","مون فرير"],["Ma maison","بيتي","ما ميزون"]]},
{id:'fd',ic:'🍞',ar:'الأكل والمشروبات',fr:'À table',w:[
["Le pain","الخبز","لو بان"],["L'eau","الماء","لو"],["Le lait","الحليب","لو ليه"],["La viande","اللحم","لا ڤيياند"],["Le poulet","الدجاج","لو بوليه"],["Les légumes","الخضر","ليه ليڭيم"],["Le thé","الشاي","لو تيه"],["Le sel","الملح","لو سيل"],["Le sucre","السكر","لو سيكر"],["J'ai faim","أنا جائعة","جيه فان"],["J'ai soif","أنا عطشانة","جيه سواف"]]},
{id:'sh',ic:'🛒',ar:'في السوق والمتجر',fr:'Au magasin',w:[
["Combien ça coûte ?","بكم هذا؟","كونبيان سا كوت"],["C'est trop cher","هذا غالٍ جداً","سي ترو شير"],["Je voudrais…","أريد…","جو ڤودريه"],["Un kilo de…","كيلوغرام من…","أون كيلو دو"],["Avez-vous… ?","هل عندكم…؟","أڤيه ڤو"],["Je prends ça","سآخذ هذا","جو بران سا"],["Où est la caisse ?","أين الصندوق (الدفع)؟","أو إي لا كيس"],["Je paie par carte","أدفع بالبطاقة","جو بيه بار كارت"],["En espèces","نقداً","آن إسبيس"],["Le ticket, s'il vous plaît","الوصل من فضلك","لو تيكيه، سيل ڤو بليه"]]},
{id:'dr',ic:'🩺',ar:'عند الطبيب والصيدلية',fr:'Chez le médecin',w:[
["J'ai mal à la tête","عندي ألم في الرأس","جيه مال آ لا تيت"],["J'ai mal au ventre","عندي ألم في البطن","جيه مال أو ڤانتر"],["J'ai de la fièvre","عندي حمّى","جيه دو لا فييڤر"],["Je ne me sens pas bien","لا أشعر أنني بخير","جو نو مو سان با بيان"],["Le médecin","الطبيب","لو ميدسان"],["La pharmacie","الصيدلية","لا فارماسي"],["Un médicament","دواء","أون ميديكامان"],["Une ordonnance","وصفة طبية","أون أوردونانس"],["C'est urgent","الأمر مستعجل","سي تورجان"],["Appelez une ambulance","اتصلوا بالإسعاف","أبليه أون أنبيلانس"],["Au secours !","النجدة!","أو سوكور"]]},
{id:'ct',ic:'🧭',ar:'في الطريق والمواصلات',fr:'En ville',w:[
["Où est… ?","أين…؟","أو إي"],["À gauche","يساراً","آ ڭوش"],["À droite","يميناً","آ دروات"],["Tout droit","إلى الأمام مباشرة","تو دروا"],["La gare","المحطة","لا ڭار"],["L'arrêt de bus","موقف الحافلة","لاريه دو بيس"],["Je suis perdue","أنا تائهة","جو سوي بيردي"],["C'est loin ?","هل هو بعيد؟","سي لوان"],["C'est près d'ici","إنه قريب من هنا","سي بري ديسي"],["Un billet, s'il vous plaît","تذكرة من فضلك","أون بييه، سيل ڤو بليه"]]},
{id:'dy',ic:'📅',ar:'الأيام والوقت',fr:'Les jours',w:[
["Lundi","الاثنين","لوندي"],["Mardi","الثلاثاء","ماردي"],["Mercredi","الأربعاء","ميركرودي"],["Jeudi","الخميس","جودي"],["Vendredi","الجمعة","ڤانردي"],["Samedi","السبت","سامدي"],["Dimanche","الأحد","ديمانش"],["Aujourd'hui","اليوم","أوجوردوي"],["Demain","غداً","دومان"],["Hier","أمس","إيير"]]}
];
const mmCanSay=()=>typeof speechSynthesis!=='undefined'&&typeof SpeechSynthesisUtterance!=='undefined';
function mmSay(t,slow){if(!mmCanSay()){toast('الصوت غير متاح على هذا الهاتف');return;}try{const u=new SpeechSynthesisUtterance(String(t).replace(/…/g,'').replace(/\s+/g,' '));u.lang='fr-FR';u.rate=slow?0.6:0.85;const v=(speechSynthesis.getVoices()||[]).find(x=>/^fr/i.test(x.lang));if(v)u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){toast('الصوت غير متاح على هذا الهاتف');}}
const mmFrAll=()=>[].concat(...MM_FR.map(l=>l.w.map(w=>({l:l.id,w}))));
function mmFrStars(id){const f=(mmD().fr=mmD().fr||{});return f[id]||0;}
function mmWordToday(){const a=mmFrAll();return a[((lgDayN()%a.length)+a.length)%a.length].w;}
function mmWordCard(){const w=mmWordToday();return `<div class="plan mmc"><h3>🇫🇷 كلمة اليوم</h3><div class="mmfr" dir="ltr">${esc(w[0])}</div><div class="mmpr">${esc(w[2])}</div><div class="mmq" style="font-size:1.1rem" data-nt>${esc(w[1])}</div>${mmCanSay()?'<div class="row" style="margin-top:8px"><button class="btn alt" type="button" id="wdSay">🔊 استمعي</button></div>':''}<div class="mini" style="margin-top:8px;cursor:pointer" onclick="go(\'mm/fr\')">اضغطي هنا لتتعلمي المزيد ←</div></div>`;}
function mmFrList(){const done=MM_FR.filter(l=>mmFrStars(l.id)>0).length;
 return `<div class="plan"><h3>🇫🇷 تعلّمي الفرنسية خطوة بخطوة</h3><div class="mini">درس صغير كل يوم يكفي. استمعي، كرّري، ثم جرّبي الاختبار. أنهيتِ ${mmN(done)} من ${mmN(MM_FR.length)} دروس.</div></div>
 ${MM_FR.map((l,i)=>{const s=mmFrStars(l.id);return `<div class="plan mmles" data-l="${l.id}" role="button" tabindex="0"><div class="mmlh"><span class="mmli">${l.ic}</span><div style="flex:1"><div><b>${mmN(i+1)}. ${esc(l.ar)}</b></div><div class="mini" dir="ltr" style="text-align:start">${esc(l.fr)} · ${mmN(l.w.length)} عبارات</div></div><div class="mmst">${'⭐'.repeat(s)}${'☆'.repeat(3-s)}</div></div></div>`;}).join('')}`;}
function mmLesson(id){const l=MM_FR.find(x=>x.id===id);if(!l)return mmFrList();
 return `<div class="row" style="margin:6px 0"><button class="btn alt" type="button" id="frBk">→ الدروس</button><span class="sp"></span>${mmCanSay()?'<button class="btn alt" type="button" id="frSl">🐢 ببطء</button>':''}</div>
 <div class="plan"><h3>${l.ic} ${esc(l.ar)}</h3><div class="mini" dir="ltr" style="text-align:start;margin:-4px 0 6px">${esc(l.fr)}</div><div class="mini">اضغطي على 🔊 للاستماع ثم كرّري بصوت عالٍ. الأحرف العربية تحت الكلمة تساعدك على النطق.</div></div>
 ${l.w.map((w,i)=>`<div class="plan mmw"><div class="mmwr"><div style="flex:1"><div class="mmfr" dir="ltr">${esc(w[0])}</div><div class="mmpr">${esc(w[2])}</div><div class="mmq" style="font-size:1.1rem" data-nt>${esc(w[1])}</div></div>${mmCanSay()?`<button type="button" class="mmsay" data-i="${i}" aria-label="استماع">🔊</button>`:''}</div></div>`).join('')}
 <div class="row" style="margin:12px 0"><button class="btn" type="button" id="frQz">📝 ابدئي الاختبار</button></div>${mmCanSay()?'':'<div class="mini">ملاحظة: النطق الصوتي غير متاح في هذا المتصفح.</div>'}`;}
/* quiz */
function mmQzMake(id){const l=MM_FR.find(x=>x.id===id),pool=l.w.slice().sort(()=>Math.random()-.5),pick=pool.slice(0,5),can=mmCanSay();
 return {l:id,i:0,sc:0,a:null,qs:pick.map((w,k)=>{const t=can&&k%2===1?'b':'a';const others=l.w.filter(x=>x!==w).sort(()=>Math.random()-.5).slice(0,3);const opts=others.concat([w]).sort(()=>Math.random()-.5);return {t,w,opts};})};}
function mmQzHtml(){const q=MMS.qz,l=MM_FR.find(x=>x.id===q.l);
 if(q.i>=q.qs.length){const s=q.sc>=5?3:q.sc>=4?2:q.sc>=3?1:0;return `<div class="plan" style="text-align:center"><h3>🏁 النتيجة</h3><div style="font-size:2rem">${'⭐'.repeat(s)}${'☆'.repeat(3-s)}</div><div class="mmq">${mmN(q.sc)} / ${mmN(q.qs.length)}</div><div class="mini">${s===3?'ما شاء الله! ممتاز 🌟':s>=1?'أحسنتِ! أعيدي الدرس لتحصلي على نجوم أكثر.':'لا بأس، أعيدي الدرس ثم جرّبي من جديد 💪'}</div><div class="row" style="justify-content:center;margin-top:10px"><button class="btn" type="button" id="qzAg">🔄 إعادة</button><button class="btn alt" type="button" id="qzBk">← الدرس</button></div></div>`;}
 const Q=q.qs[q.i],w=Q.w;
 const prompt=Q.t==='a'?`<div class="mmfr" dir="ltr" style="text-align:center">${esc(w[0])}</div>${mmCanSay()?'<div style="text-align:center"><button type="button" class="mmsay" id="qzPl">🔊</button></div>':''}<div class="mmq" style="text-align:center;font-size:1.1rem">ما معناها؟</div>`:`<div style="text-align:center"><button type="button" class="mmsay mmbig" id="qzPl">🔊</button></div><div class="mmq" style="text-align:center;font-size:1.1rem">ماذا سمعتِ؟</div>`;
 return `<div class="plan"><div class="mini">${l.ic} ${esc(l.ar)} · السؤال ${mmN(q.i+1)} / ${mmN(q.qs.length)}</div>${prompt}<div class="lgq">${Q.opts.map((o,j)=>{let cls='btn alt lgo';if(q.a!==null){if(o===w)cls='btn lgo lgok';else if(j===q.a)cls='btn alt lgo lgko';}return `<button type="button" class="${cls}" data-o="${j}" ${q.a!==null?'disabled':''} ${Q.t==='b'?'dir="ltr"':''}>${esc(Q.t==='a'?o[1]:o[0])}</button>`;}).join('')}</div>
 ${q.a!==null?`<div class="mini lgex" style="margin-top:8px">${Q.opts[q.a]===w?'✅ أحسنتِ!':'❌ الجواب:'} <b dir="ltr">${esc(w[0])}</b> = ${esc(w[1])}</div><div class="row" style="margin-top:8px"><button class="btn" type="button" id="qzNx">${q.i+1>=q.qs.length?'النتيجة':'التالي'} ←</button></div>`:''}</div>`;}
function mmQzDraw(){const h=$('#frBody');if(!h)return;h.innerHTML=mmQzHtml();mmQzBind(h);}
function mmQzBind(h){const q=MMS.qz;if(!q)return;
 const pl=h.querySelector('#qzPl');if(pl&&q.i<q.qs.length)pl.onclick=()=>mmSay(q.qs[q.i].w[0]);
 h.querySelectorAll('.lgo[data-o]').forEach(b=>b.onclick=()=>{if(q.a!==null)return;const Q=q.qs[q.i];q.a=+b.dataset.o;if(Q.opts[q.a]===Q.w)q.sc++;mmQzDraw();});
 const nx=h.querySelector('#qzNx');if(nx)nx.onclick=()=>{q.i++;q.a=null;if(q.i>=q.qs.length){const s=q.sc>=5?3:q.sc>=4?2:q.sc>=3?1:0,f=(mmD().fr=mmD().fr||{});if(s>(f[q.l]||0)){f[q.l]=s;}else if(!(q.l in f))f[q.l]=0;save();}mmQzDraw();if(q.i<q.qs.length&&q.qs[q.i].t==='b')setTimeout(()=>mmSay(q.qs[q.i].w[0]),250);};
 const ag=h.querySelector('#qzAg');if(ag)ag.onclick=()=>{MMS.qz=mmQzMake(q.l);mmQzDraw();if(MMS.qz.qs[0].t==='b')setTimeout(()=>mmSay(MMS.qz.qs[0].w[0]),250);};
 const bk=h.querySelector('#qzBk');if(bk)bk.onclick=()=>{MMS.qz=null;viewMm('fr',q.l);};}
function mmFr(extra){if(MM_FR.some(l=>l.id===extra))return `<div id="frBody">${MMS.qz&&MMS.qz.l===extra?mmQzHtml():mmLesson(extra)}</div>`;MMS.qz=null;return mmFrList();}
function mmBindFr(root,extra){const l=MM_FR.find(x=>x.id===extra);
 if(!l){root.querySelectorAll('.mmles').forEach(el=>{const open=()=>go('mm/fr/'+el.dataset.l);el.onclick=open;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};});return;}
 if(MMS.qz&&MMS.qz.l===extra){mmQzBind(root.querySelector('#frBody'));return;}
 let slow=false;const sl=root.querySelector('#frSl');if(sl)sl.onclick=()=>{slow=!slow;sl.classList.toggle('alt',!slow);sl.textContent=slow?'🐢 ببطء ✓':'🐢 ببطء';};
 root.querySelectorAll('.mmsay[data-i]').forEach(b=>b.onclick=()=>mmSay(l.w[+b.dataset.i][0],slow));
 root.querySelector('#frBk').onclick=()=>go('mm/fr');
 root.querySelector('#frQz').onclick=()=>{MMS.qz=mmQzMake(extra);const b=$('#frBody');b.innerHTML=mmQzHtml();mmQzBind(b);if(MMS.qz.qs[0].t==='b')setTimeout(()=>mmSay(MMS.qz.qs[0].w[0]),250);};}
/* ================= 🔤 LIRE L'ARABE : du zéro aux premières sourates ================= */
const LA_ZWJ='‍',LA_F='َ',LA_K='ِ',LA_D='ُ',LA_SK='ْ',LA_SH='ّ',LA_FT='ً',LA_KT='ٍ',LA_DT='ٌ';
/* [lettre, nom FR, nom parlé, indice de prononciation, [mot, translit, sens], ne se lie pas à gauche] */
const LA_LET=[
["ا","Alif","أَلِف","Il sert de « support » : seul, il allonge le son « â ». Au début d'un mot, il porte une voyelle (a, i, ou).",["أَسَد","asad","lion"],1],
["ب","Bâ","بَاء","Comme le « b » de bateau.",["بَاب","bâb","porte"]],
["ت","Tâ","تَاء","Comme le « t » de table.",["تِين","tîn","figue"]],
["ث","Thâ","ثَاء","Comme le « th » anglais de « think » (langue entre les dents). En darija, on dit souvent « t ».",["ثَوْب","thawb","vêtement"]],
["ج","Jîm","جِيم","Comme le « j » de jour.",["جَمَل","jamal","chameau"]],
["ح","Ḥâ","حَاء","Un « h » soufflé du fond de la gorge, comme pour réchauffer ses mains.",["حَلِيب","ḥalîb","lait"]],
["خ","Khâ","خَاء","Comme le « j » espagnol de Juan, ou le « ch » allemand de Bach.",["خُبْز","khoubz","pain"]],
["د","Dâl","دَال","Comme le « d » de dos.",["دَار","dâr","maison"],1],
["ذ","Dhâl","ذَال","Comme le « th » anglais de « this » (langue entre les dents).",["ذَهَب","dhahab","or"],1],
["ر","Râ","رَاء","Un « r » roulé, comme en espagnol.",["رَجُل","rajoul","homme"],1],
["ز","Zây","زَاي","Comme le « z » de zèbre.",["زَيْت","zayt","huile"],1],
["س","Sîn","سِين","Comme le « s » de soleil.",["سَمَك","samak","poisson"]],
["ش","Chîn","شِين","Comme le « ch » de chat.",["شَمْس","chams","soleil"]],
["ص","Ṣâd","صَاد","Un « s » « lourd », prononcé avec la gorge pleine.",["صَبَاح","ṣabâḥ","matin"]],
["ض","Ḍâd","ضَاد","Un « d » « lourd », prononcé avec la gorge pleine.",["ضَوْء","ḍaw’","lumière"]],
["ط","Ṭâ","طَاء","Un « t » « lourd », prononcé avec la gorge pleine.",["طَاوِلَة","ṭâwila","table"]],
["ظ","Ẓâ","ظَاء","Un « dh » « lourd », prononcé avec la gorge pleine.",["ظَهْر","ẓahr","dos"]],
["ع","ʿAyn","عَيْن","Un son de gorge : serre la gorge en disant « a ». L'audio t'aidera.",["عَيْن","ʿayn","œil"]],
["غ","Ghayn","غَيْن","Comme le « r » français « gargouillé », au fond de la gorge.",["غَيْم","ghaym","nuage"]],
["ف","Fâ","فَاء","Comme le « f » de fleur.",["فِيل","fîl","éléphant"]],
["ق","Qâf","قَاف","Un « k » prononcé tout au fond de la gorge.",["قَمَر","qamar","lune"]],
["ك","Kâf","كَاف","Comme le « k » de kilo.",["كِتَاب","kitâb","livre"]],
["ل","Lâm","لَام","Comme le « l » de lune.",["لَيْل","layl","nuit"]],
["م","Mîm","مِيم","Comme le « m » de mer.",["مَاء","mâ’","eau"]],
["ن","Nûn","نُون","Comme le « n » de nuit.",["نُور","noûr","lumière"]],
["ه","Hâ","هَاء","Un « h » léger, soufflé.",["هِلَال","hilâl","croissant de lune"]],
["و","Wâw","وَاو","Comme « ou » (ou « w »).",["وَرْدَة","warda","rose"],1],
["ي","Yâ","يَاء","Comme « i » long, ou « y ».",["يَد","yad","main"]]
];
const LA_LAT={"ب":"b","ت":"t","ث":"th","ج":"j","ح":"ḥ","خ":"kh","د":"d","ذ":"dh","ر":"r","ز":"z","س":"s","ش":"ch","ص":"ṣ","ض":"ḍ","ط":"ṭ","ظ":"ẓ","ع":"ʿ","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ي":"y"};
const LA_C1=['ب','ت','م','ن','ل','ر','س','د','ك','ف'];
const LA_C2=LA_C1.concat(['ج','ش','ز','ه']);
const LA_WORDS=[
[["بَاب","bâb","porte"],["بَيْت","bayt","maison"],["كِتَاب","kitâb","livre"],["قَلَم","qalam","stylo"],["مَاء","mâ’","eau"],["شَمْس","chams","soleil"],["قَمَر","qamar","lune"],["نُور","noûr","lumière"],["وَلَد","walad","garçon"],["بِنْت","bint","fille"]],
[["أُمّ","oumm","mère"],["أَب","ab","père"],["أَخ","akh","frère"],["أُخْت","oukht","sœur"],["جَدّ","jadd","grand-père"],["جَدَّة","jadda","grand-mère"],["رَجُل","rajoul","homme"],["امْرَأَة","imra’a","femme"],["طِفْل","ṭifl","enfant"],["صَدِيق","ṣadîq","ami"]],
[["اللَّه","Allâh","Allah"],["رَبّ","rabb","Seigneur"],["رَحْمَة","raḥma","miséricorde"],["صَلَاة","ṣalât","prière"],["صَبْر","ṣabr","patience"],["جَنَّة","janna","paradis"],["نَار","nâr","feu"],["يَوْم","yawm","jour"],["حَقّ","ḥaqq","vérité"],["دِين","dîn","religion"]]
];
const LA_SUR=[
{id:'ikh',n:"Al-Ikhlâs",ar:"الإخلاص",v:[
["قُلْ هُوَ اللَّهُ أَحَدٌ","Qoul houwa Llâhou aḥad","Dis : Il est Allah, Unique."],
["اللَّهُ الصَّمَدُ","Allâhou ṣ-ṣamad","Allah, le Seul à être imploré."],
["لَمْ يَلِدْ وَلَمْ يُولَدْ","Lam yalid wa lam yoûlad","Il n'a jamais engendré, ni été engendré."],
["وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ","Wa lam yakoun lahoû koufouwan aḥad","Et nul n'est égal à Lui."]]},
{id:'kaw',n:"Al-Kawthar",ar:"الكوثر",v:[
["إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ","Innâ aʿṭaynâka l-kawthar","Nous t'avons certes accordé l'abondance."],
["فَصَلِّ لِرَبِّكَ وَانْحَرْ","Fa ṣalli li-rabbika wanḥar","Prie donc ton Seigneur et sacrifie."],
["إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ","Inna châniʾaka houwa l-abtar","Celui qui te hait est, lui, le sans-postérité."]]},
{id:'asr',n:"Al-ʿAṣr",ar:"العصر",v:[
["وَالْعَصْرِ","Wa l-ʿaṣr","Par le temps !"],
["إِنَّ الْإِنسَانَ لَفِي خُسْرٍ","Inna l-insâna la-fî khousr","L'homme est certes en perdition,"],
["إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ","Illa lladhîna âmanoû wa ʿamiloû ṣ-ṣâliḥâti wa tawâṣaw bi-l-ḥaqqi wa tawâṣaw bi-ṣ-ṣabr","sauf ceux qui croient, font de bonnes œuvres, s'enjoignent mutuellement la vérité et l'endurance."]]},
{id:'fat',n:"Al-Fâtiḥa",ar:"الفاتحة",v:[
["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ","Bismi Llâhi r-raḥmâni r-raḥîm","Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux."],
["الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ","Al-ḥamdou li-Llâhi rabbi l-ʿâlamîn","Louange à Allah, Seigneur des mondes,"],
["الرَّحْمَٰنِ الرَّحِيمِ","Ar-raḥmâni r-raḥîm","le Tout Miséricordieux, le Très Miséricordieux,"],
["مَالِكِ يَوْمِ الدِّينِ","Mâliki yawmi d-dîn","Maître du Jour de la rétribution."],
["إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ","Iyyâka naʿboudou wa iyyâka nastaʿîn","C'est Toi que nous adorons, et c'est Toi dont nous implorons le secours."],
["اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ","Ihdinâ ṣ-ṣirâṭa l-moustaqîm","Guide-nous dans le droit chemin,"],
["صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ","Ṣirâṭa lladhîna anʿamta ʿalayhim ghayri l-maghḍoûbi ʿalayhim wa lâ ḍ-ḍâllîn","le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés."]]}
];
const LA_MOD=[["🔤","Les lettres"],["🅰️","Les voyelles courtes"],["🎵","Les voyelles longues"],["✨","Sukûn, shadda, tanwîn"],["📖","Lire des mots"],["🕌","Les premières sourates"]];
const LA_LES=[
{id:'l1',m:0,ic:'🅰️',t:"Alif, Bâ, Tâ, Thâ",ty:'let',L:[0,1,2,3],intro:"<h3>Bienvenue ! 🎉</h3><p>L'arabe s'écrit et se lit de <b>droite à gauche</b> ➡️⬅️. Il a <b>28 lettres</b>, et on va les apprendre par petits groupes.</p><p>Bonne nouvelle : si tu parles <b>darija</b>, tu connais déjà tous ces sons. Il ne reste qu'à reconnaître les formes. 💪</p><p>Chaque lettre a une forme qui change un peu selon sa place dans le mot. Pas de panique, on y va doucement.</p>"},
{id:'l2',m:0,ic:'🐪',t:"Jîm, Ḥâ, Khâ",ty:'let',L:[4,5,6],intro:"<h3>Les « cousines » 👭</h3><p>Ces trois lettres ont la <b>même forme</b>, seul le <b>point</b> change : sans point, un point dessous, un point dessus. Regarde bien les points !</p>"},
{id:'l3',m:0,ic:'🏡',t:"Dâl, Dhâl, Râ, Zây",ty:'let',L:[7,8,9,10],intro:"<h3>Les lettres « solitaires » 🧍</h3><p>Ces lettres <b>ne se lient pas à la lettre suivante</b> : elles s'arrêtent net. C'est facile à retenir.</p>"},
{id:'l4',m:0,ic:'☀️',t:"Sîn, Chîn, Ṣâd, Ḍâd",ty:'let',L:[11,12,13,14],intro:"<h3>Les « dents » et les « boucles » 🦷</h3><p><b>Sîn</b> et <b>Chîn</b> se ressemblent : Chîn a 3 points. <b>Ṣâd</b> et <b>Ḍâd</b> ont une grande boucle, Ḍâd a un point.</p>"},
{id:'l5',m:0,ic:'🔊',t:"Ṭâ, Ẓâ, ʿAyn, Ghayn",ty:'let',L:[15,16,17,18],intro:"<h3>Les lettres de gorge 🗣️</h3><p>Ces sons viennent du fond de la gorge. En darija, tu les dis tous les jours ! <b>ʿAyn</b> et <b>Ghayn</b> : même forme, Ghayn a un point.</p>"},
{id:'l6',m:0,ic:'🌙',t:"Fâ, Qâf, Kâf, Lâm",ty:'let',L:[19,20,21,22],intro:"<h3>Fâ et Qâf 🌙</h3><p><b>Fâ</b> a un point au-dessus, <b>Qâf</b> en a deux. Attention à ne pas les confondre !</p>"},
{id:'l7',m:0,ic:'🏁',t:"Mîm, Nûn, Hâ, Wâw, Yâ",ty:'let',L:[23,24,25,26,27],intro:"<h3>Dernier groupe ! 🏁</h3><p>Plus que 5 lettres. Après ça, tu connais tout l'alphabet. Bravo d'avance ! 👏</p>"},
{id:'l8',m:0,ic:'🏆',t:"Révision de l'alphabet",ty:'letrev',intro:"<h3>Le grand quiz 🏆</h3><p>Voyons ce que tu retiens des 28 lettres. Pas de stress : tu peux recommencer autant que tu veux.</p>"},
{id:'v1',m:1,ic:'🔼',t:"La fatha : le son « a »",ty:'syl',v:'a',intro:"<h3>Les voyelles courtes</h3><p>En arabe, les lettres sont des <b>consonnes</b>. Pour savoir quelle voyelle dire, on ajoute de <b>petits signes</b>.</p><p>La <b>fatha</b> est un petit trait <b>au-dessus</b> de la lettre : elle donne le son <b>« a »</b>. Exemple : بَ = <b>ba</b>.</p>"},
{id:'v2',m:1,ic:'🔽',t:"La kasra : le son « i »",ty:'syl',v:'i',intro:"<h3>La kasra</h3><p>La <b>kasra</b> est un petit trait <b>sous</b> la lettre : elle donne le son <b>« i »</b>. Exemple : بِ = <b>bi</b>.</p>"},
{id:'v3',m:1,ic:'🔸',t:"La damma : le son « ou »",ty:'syl',v:'ou',intro:"<h3>La damma</h3><p>La <b>damma</b> ressemble à un petit « و » <b>au-dessus</b> de la lettre : elle donne le son <b>« ou »</b>. Exemple : بُ = <b>bou</b>.</p>"},
{id:'v4',m:1,ic:'🎲',t:"Mélange : a, i, ou",ty:'syl',v:'mix',intro:"<h3>Le mélange 🎲</h3><p>Maintenant les trois voyelles ensemble : regarde <b>où est le petit signe</b> (dessus à gauche = a, dessous = i, dessus avec une boucle = ou).</p>"},
{id:'g1',m:2,ic:'🎼',t:"Le long « â » (avec alif)",ty:'long',v:'a',intro:"<h3>Les voyelles longues</h3><p>Quand on ajoute un <b>alif</b> (ا) après une <b>fatha</b>, le son « a » devient <b>long</b> : بَا = <b>bâ</b>. Il se tient plus longtemps (2 temps).</p>"},
{id:'g2',m:2,ic:'🎶',t:"Les longs « î » et « oû »",ty:'long',v:'iu',intro:"<h3>Î et oû</h3><p><b>Kasra + yâ (ي)</b> donne un « î » long : بِي = <b>bî</b>.</p><p><b>Damma + wâw (و)</b> donne un « oû » long : بُو = <b>boû</b>.</p>"},
{id:'g3',m:2,ic:'🎹',t:"Mélange des voyelles longues",ty:'long',v:'mix',intro:"<h3>Mélange 🎹</h3><p>Court ou long ? C'est le petit <b>alif, yâ ou wâw</b> après la lettre qui fait la différence.</p>"},
{id:'s1',m:3,ic:'🛑',t:"Le sukûn : on s'arrête",ty:'suk',intro:"<h3>Le sukûn</h3><p>Un petit <b>rond</b> au-dessus d'une lettre veut dire : <b>pas de voyelle</b>, on s'arrête sur la consonne. Exemple : بَتْ = <b>bat</b>.</p>"},
{id:'s2',m:3,ic:'💪',t:"La shadda : on double",ty:'shd',intro:"<h3>La shadda</h3><p>Un petit signe en forme de <b>« w »</b> au-dessus d'une lettre veut dire : on <b>double</b> la consonne. Exemple : بَّ = <b>bba</b>.</p><p>Tu la verras dans le mot <b>Allâh</b> : اللَّه !</p>"},
{id:'s3',m:3,ic:'🔁',t:"Le tanwîn : « an, in, oun »",ty:'tan',intro:"<h3>Le tanwîn</h3><p>À la fin d'un mot, une <b>voyelle doublée</b> ajoute un son « n » : ـً = <b>an</b>, ـٍ = <b>in</b>, ـٌ = <b>oun</b>. Exemple : شُكْرًا = <b>choukran</b> (merci !).</p>"},
{id:'w1',m:4,ic:'🏠',t:"Mes premiers mots",ty:'words',W:0,intro:"<h3>Je lis mes premiers mots ! 🎉</h3><p>Tu sais lire les lettres et les voyelles : tu peux lire de vrais mots. Lis lentement, lettre après lettre, de droite à gauche.</p>"},
{id:'w2',m:4,ic:'👪',t:"La famille",ty:'words',W:1,intro:"<h3>La famille 👨‍👩‍👧</h3><p>Des mots que tu connais déjà à l'oral, maintenant tu les lis !</p>"},
{id:'w3',m:4,ic:'🌟',t:"Mots du Coran",ty:'words',W:2,intro:"<h3>Mots du Coran 🌟</h3><p>Des mots qu'on rencontre très souvent dans le Coran. Tu vas les reconnaître en lisant.</p>"},
{id:'q1',m:5,ic:'💎',t:"Sourate Al-Ikhlâs",ty:'sur',S:0,intro:"<h3>Ta première sourate ! 💎</h3><p>Touche chaque mot pour l'entendre. Lis d'abord toute seule, puis vérifie avec la translittération.</p><p class='lanote'>Pour la bonne récitation (tajwîd), écoute un récitateur ou un enseignant : cette appli t'aide à <b>lire</b>, pas à remplacer l'apprentissage oral.</p>"},
{id:'q2',m:5,ic:'🌊',t:"Sourate Al-Kawthar",ty:'sur',S:1,intro:"<h3>Al-Kawthar 🌊</h3><p>La plus courte sourate : 3 versets. Tu peux déjà la lire !</p>"},
{id:'q3',m:5,ic:'⏳',t:"Sourate Al-ʿAṣr",ty:'sur',S:2,intro:"<h3>Al-ʿAṣr ⏳</h3><p>3 versets, dont un long. Lis-le mot par mot, sans te presser.</p>"},
{id:'q4',m:5,ic:'🌹',t:"Sourate Al-Fâtiḥa",ty:'sur',S:3,intro:"<h3>Al-Fâtiḥa 🌹</h3><p>La sourate qu'on lit à chaque prière. Tu es prête à la lire ! 🤲</p>"}
];
const LA_LV=[[0,"Graine","🌱"],[60,"Pousse","🌿"],[180,"Bourgeon","🌷"],[360,"Fleur","🌸"],[600,"Lectrice","📖"],[900,"Étoile","⭐"]];

/* ---- vue : Lire l'arabe ---- */
const LAS={id:null,st:0,qz:null,items:null,tr:false,slow:false,sel:0};
const laCan=()=>typeof speechSynthesis!=='undefined'&&typeof SpeechSynthesisUtterance!=='undefined';
function laSay(t,slow){if(!laCan()){toast('Pas de voix disponible sur ce téléphone');return;}try{const u=new SpeechSynthesisUtterance(String(t));u.lang='ar-SA';u.rate=slow?0.45:0.7;const v=(speechSynthesis.getVoices()||[]).find(x=>/^ar/i.test(x.lang));if(v)u.voice=v;u.onerror=()=>{};speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){toast('Pas de voix disponible sur ce téléphone');}}
function laD(){const d=S.lad=S.lad&&typeof S.lad==='object'?S.lad:{};if(!d.d||typeof d.d!=='object')d.d={};if(!Array.isArray(d.days))d.days=[];return d;}
const laStars=id=>laD().d[id]||0;
const laPts=()=>LA_LES.reduce((s,l)=>{const st=laStars(l.id);return s+(st>0?20+st*10:0);},0);
function laLevel(p){let i=0;LA_LV.forEach((l,k)=>{if(p>=l[0])i=k;});return {i,cur:LA_LV[i],nx:LA_LV[i+1]||null};}
function laStreak(){const s=new Set(laD().days);let n=0,d=today();if(!s.has(d))d=addD(d,-1);while(s.has(d)){n++;d=addD(d,-1);}return n;}
const laOpen=i=>i===0||laStars(LA_LES[i-1].id)>0;
const laNext=()=>{const i=LA_LES.findIndex(l=>laStars(l.id)===0);return i<0?null:LA_LES[i];};
const laShuf=a=>a.slice().sort(()=>Math.random()-.5);
const LA_V={a:[LA_F,'a'],i:[LA_K,'i'],ou:[LA_D,'ou']};
function laGen(l){const T=l.ty,C=laShuf(LA_C2),out=[];
 if(T==='let'||T==='letrev'){return (T==='let'?l.L:LA_LET.map((_,i)=>i)).map(i=>({ar:LA_LET[i][0],lat:LA_LET[i][1],say:LA_LET[i][2],ix:i}));}
 if(T==='words'){return LA_WORDS[l.W].map(w=>({ar:w[0],lat:w[2],tr:w[1],say:w[0]}));}
 if(T==='syl'){const vs=l.v==='mix'?['a','i','ou']:[l.v],n=l.v==='mix'?12:C.length;for(let k=0;k<n;k++){const c=C[k%C.length],v=vs[k%vs.length];out.push({ar:c+LA_V[v][0],lat:LA_LAT[c]+LA_V[v][1]});}}
 else if(T==='long'){const F={a:[LA_F+'ا','â'],i:[LA_K+'ي','î'],u:[LA_D+'و','oû']},vs=l.v==='a'?['a']:l.v==='iu'?['i','u']:['a','i','u'],n=l.v==='a'?C.length:l.v==='iu'?14:12;for(let k=0;k<n;k++){const c=C[k%C.length],f=F[vs[k%vs.length]];out.push({ar:c+f[0],lat:LA_LAT[c]+f[1]});}}
 else if(T==='suk'){const vs=['a','i','ou'];for(let k=0;k<12;k++){const c=C[k%C.length],d=C[(k+5)%C.length],v=vs[k%3];out.push({ar:c+LA_V[v][0]+d+LA_SK,lat:LA_LAT[c]+LA_V[v][1]+LA_LAT[d]});}}
 else if(T==='shd'){const vs=['a','i','ou'],C1=laShuf(LA_C1);for(let k=0;k<10;k++){const c=C1[k%C1.length],v=vs[k%3];out.push({ar:c+LA_SH+LA_V[v][0],lat:LA_LAT[c]+LA_LAT[c]+LA_V[v][1]});}}
 else if(T==='tan'){const t=[[LA_FT+'ا','an'],[LA_KT,'in'],[LA_DT,'oun']];for(let k=0;k<12;k++){const c=C[k%C.length],x=t[k%3];out.push({ar:c+x[0],lat:LA_LAT[c]+x[1]});}}
 return out;}
const laSteps=l=>l.ty==='sur'?1+LA_SUR[l.S].v.length:l.ty==='let'?l.L.length+2:3;
/* ---- quiz ---- */
function laPool(l,items){if(l.ty==='words')return [].concat(...LA_WORDS).map(w=>({ar:w[0],lat:w[2],tr:w[1],say:w[0]}));if(l.ty==='let'){const mx=Math.max.apply(null,l.L);return LA_LET.slice(0,mx+1).map((x,i)=>({ar:x[0],lat:x[1],say:x[2],ix:i}));}return items;}
function laQzMake(l,items){const N=l.ty==='letrev'?10:8,can=laCan(),words=l.ty==='words',pool=laPool(l,items);let base=laShuf(items);while(base.length<N)base=base.concat(laShuf(items));base=base.slice(0,N);
 const T=can?['hear','see','rev']:['see','rev'];
 return {l:l.id,N,i:0,sc:0,a:null,qs:base.map((it,k)=>{const t=T[k%T.length],others=laShuf(pool.filter(x=>x.ar!==it.ar&&x.lat!==it.lat)).slice(0,3),opts=laShuf(others.concat([it]));return {t,it,opts,oa:(t!=='see')&&!(words&&t==='hear')};})};}
const laStarsOf=(sc,N)=>sc>=N-1?3:sc>=Math.ceil(N*.7)?2:sc>=Math.ceil(N*.4)?1:0;
function laQzHtml(l){const q=LAS.qz,words=l.ty==='words';
 if(q.i>=q.N){const s=laStarsOf(q.sc,q.N),first=q.first;return `<div class="plan" style="text-align:center"><h3>🏁 Résultat</h3><div style="font-size:2.2rem">${'⭐'.repeat(s)}${'☆'.repeat(3-s)}</div><div class="lgbig">${q.sc} / ${q.N}</div><div class="mini" style="margin:6px 0">${s===3?'Machallah, parfait ! 🌟':s===2?'Très bien ! Encore un petit effort pour les 3 étoiles 💪':s===1?'Bravo, c’est validé ! Tu peux rejouer pour plus d’étoiles.':'Il faut au moins '+Math.ceil(q.N*.4)+' bonnes réponses pour valider. Relis la leçon, puis réessaie, tu vas y arriver 💪'}</div>${s>0&&first?`<div class="mini">🔓 Leçon suivante débloquée !</div>`:''}<div class="row" style="justify-content:center;margin-top:10px"><button class="btn alt" type="button" id="laAg">🔄 Rejouer</button><button class="btn alt" type="button" id="laRv">📖 Revoir</button>${s>0?'<button class="btn" type="button" id="laNx2">Continuer →</button>':''}</div></div>`;}
 const Q=q.qs[q.i],it=Q.it;
 const pr=Q.t==='see'?`<div class="laBig laa" lang="ar">${esc(it.ar)}</div><div style="text-align:center">${laCan()?'<button type="button" class="mmsay laPl" data-s="'+esc(it.say||it.ar)+'">🔊</button>':''}</div><div class="lgqq" style="text-align:center">${words?'Que veut dire ce mot ?':l.ty==='let'||l.ty==='letrev'?'Quelle est cette lettre ?':'Comment ça se lit ?'}</div>`
  :Q.t==='hear'?`<div style="text-align:center"><button type="button" class="mmsay mmbig laPl" data-s="${esc(it.say||it.ar)}">🔊</button></div><div class="lgqq" style="text-align:center">${words?'Écoute, puis choisis le sens :':'Écoute : laquelle entends-tu ?'}</div>`
  :`<div class="laLat">${esc(it.lat)}</div><div class="lgqq" style="text-align:center">${words?'Trouve ce mot en arabe :':'Trouve-le en arabe :'}</div>`;
 return `<div class="plan"><div class="mini">Question ${q.i+1} / ${q.N}</div><div class="lgbar" style="margin:4px 0 8px"><i style="width:${Math.round(q.i/q.N*100)}%"></i></div>${pr}<div class="${Q.oa?'lgg2':'lgq'}" style="margin-top:10px">${Q.opts.map((o,j)=>{let c='btn alt lgo'+(Q.oa?' laOa':'');if(q.a!==null){if(o===it)c='btn lgo lgok'+(Q.oa?' laOa':'');else if(j===q.a)c='btn alt lgo lgko'+(Q.oa?' laOa':'');}return `<button type="button" class="${c}" data-o="${j}" ${q.a!==null?'disabled':''}>${Q.oa?`<span class="laa" lang="ar">${esc(o.ar)}</span>`:esc(o.lat)}</button>`;}).join('')}</div>
 ${q.a!==null?`<div class="mini lgex" style="margin-top:8px">${Q.opts[q.a]===it?'✅ Bravo !':'❌ La réponse :'} <span class="laa" lang="ar" style="font-size:1.5rem">${esc(it.ar)}</span> = <b>${esc(it.lat)}</b>${it.tr?` <i>(${esc(it.tr)})</i>`:''}</div><div class="row" style="margin-top:8px"><button class="btn" type="button" id="laNx">${q.i+1>=q.N?'Résultat':'Suivant'} →</button></div>`:''}</div>`;}
function laQzFinish(l){const q=LAS.qz,s=laStarsOf(q.sc,q.N);q.first=false;if(s>0)laDone(l,s,q);}
function laDone(l,s,q){const d=laD(),old=d.d[l.id]||0;if(q)q.first=old===0;if(s>old)d.d[l.id]=s;const t=today();if(!d.days.includes(t)){d.days.push(t);d.days=d.days.slice(-90);}save();addXp(old===0?20+s*5:(s>old?(s-old)*5:1));if(s===3&&old<3){try{confetti();}catch(e){}}}
/* ---- leçons ---- */
function laForms(ix){const c=LA_LET[ix][0],nj=LA_LET[ix][5];const F=[['Seule',c],['Début',nj?c:c+LA_ZWJ],['Milieu',nj?LA_ZWJ+c:LA_ZWJ+c+LA_ZWJ],['Fin',LA_ZWJ+c]];
 return `<div class="laFm">${F.map(f=>`<div><div class="laa" lang="ar">${esc(f[1])}</div><div class="mini">${f[0]}</div></div>`).join('')}</div>${nj?'<div class="mini" style="text-align:center">⛔ Cette lettre ne se lie pas à la suivante.</div>':''}`;}
function laLetCard(ix,n,tot){const x=LA_LET[ix],ex=x[4];return `<div class="plan laC"><div class="mini">Lettre ${n} / ${tot}</div><div class="laBig laa" lang="ar">${esc(x[0])}</div><div class="laNm">${esc(x[1])}</div>
 <div class="row" style="justify-content:center;gap:10px">${laCan()?`<button type="button" class="mmsay laPl" data-s="${esc(x[2])}">🔊</button><button type="button" class="mmsay laPl" data-s="${esc(x[2])}" data-sl="1" title="Lentement">🐢</button>`:''}</div>
 <div class="lgr">🗣️ ${esc(x[3])}</div>${laForms(ix)}
 <div class="lgr">📝 Exemple : <span class="laa" lang="ar" style="font-size:1.6rem">${esc(ex[0])}</span> — <b>${esc(ex[1])}</b> (${esc(ex[2])}) ${laCan()?`<button type="button" class="mmsay laPl" style="width:40px;height:40px;font-size:1.1rem" data-s="${esc(ex[0])}">🔊</button>`:''}</div></div>`;}
function laGrid(l){const w=l.ty==='words';return `<div class="plan"><h3>${w?'Lis, écoute, répète':'Touche pour écouter'}</h3><div class="mini">${w?'Lis chaque mot lentement, de droite à gauche. Touche 🔊 pour vérifier.':'Lis la case, puis touche-la pour entendre. La prononciation est écrite dessous.'}</div></div>${w?LAS.items.map((x,i)=>`<div class="plan laW"><div class="laWr"><div class="laa" lang="ar" style="font-size:2rem">${esc(x.ar)}</div><div style="flex:1;text-align:start"><b>${esc(x.tr)}</b><div class="mini">${esc(x.lat)}</div></div>${laCan()?`<button type="button" class="mmsay laPl" data-s="${esc(x.ar)}">🔊</button>`:''}</div></div>`).join(''):`<div class="laGd">${LAS.items.map(x=>`<button type="button" class="laCell laPl" data-s="${esc(x.ar)}"><span class="laa" lang="ar">${esc(x.ar)}</span><small>${esc(x.lat)}</small></button>`).join('')}</div>`}`;}
function laSur(l,st){const S0=LA_SUR[l.S],n=S0.v.length;if(st>n)return `<div class="plan" style="text-align:center"><h3>🎉 Bravo !</h3><div class="mini">Tu as lu toute la sourate <b>${esc(S0.n)}</b>.</div><div style="font-size:2.2rem">⭐⭐⭐</div><div class="row" style="justify-content:center;margin-top:10px"><button class="btn" type="button" id="laFin">${laStars(l.id)>0?'Terminer':'Valider la leçon ✅'}</button></div></div>`;
 const v=S0.v[st-1],ws=v[0].split(' ');return `<div class="plan"><div class="mini">${esc(S0.n)} · verset ${st} / ${n}</div><div class="laVs laa" lang="ar">${ws.map((w,i)=>`<span class="laWd laPl" data-s="${esc(w)}">${esc(w)}</span>`).join(' ')}</div><div class="mini" style="text-align:center">👆 Touche un mot pour l’entendre</div>
 <div class="row" style="justify-content:center;margin:8px 0">${laCan()?`<button type="button" class="btn alt laPl" data-s="${esc(v[0])}">🔊 Verset</button><button type="button" class="btn alt laPl" data-s="${esc(v[0])}" data-sl="1">🐢 Lent</button>`:''}</div>
 <div class="lgr laTr">🗣️ <i>${esc(v[1])}</i></div><div class="row" style="margin-top:8px"><button type="button" class="btn alt" id="laTg">${LAS.tr?'🙈 Cacher la traduction':'👁️ Voir la traduction'}</button></div>${LAS.tr?`<div class="lgr">🇫🇷 ${esc(v[2])}</div>`:''}</div>`;}
const laLast=l=>l.ty==='sur'?LA_SUR[l.S].v.length+1:l.ty==='let'?l.L.length+1:l.ty==='letrev'?1:2;
function laKind(l,st){if(st===0)return 'intro';if(l.ty==='sur')return st>LA_SUR[l.S].v.length?'end':'verse';if(l.ty==='let')return st<=l.L.length?'card':'qz';if(l.ty==='letrev')return 'qz';return st===1?'grid':'qz';}
function laLesBody(l){const st=LAS.st,k=laKind(l,st);
 if(k==='intro')return `<div class="plan">${l.intro}</div>`;
 if(k==='card')return laLetCard(l.L[st-1],st,l.L.length);
 if(k==='grid')return laGrid(l);
 if(k==='verse'||k==='end')return laSur(l,st);
 LAS.qz=LAS.qz||laQzMake(l,LAS.items);return laQzHtml(l);}
function laNavHtml(l){const st=LAS.st,k=laKind(l,st),last=laLast(l);if(k==='qz'||k==='end')return '';const nk=laKind(l,st+1);
 return `<div class="row laNav">${st>0?'<button type="button" class="btn alt" id="laPv">← Précédent</button>':'<span></span>'}<button type="button" class="btn" id="laGo">${st===0?'C’est parti ! →':nk==='qz'?'Passer au quiz →':nk==='end'?'Terminer →':'Suivant →'}</button></div>`;}
function laLesson(id){const l=LA_LES.find(x=>x.id===id);if(!l)return laHome();
 if(!LAS.items||LAS.id!==id){LAS.id=id;LAS.st=0;LAS.qz=null;LAS.tr=false;LAS.items=l.ty==='sur'?[]:laGen(l);}
 const tot=laLast(l)+1;
 return `<div class="row" style="margin:6px 0"><button class="btn alt" type="button" id="laBk">← Parcours</button><span class="sp"></span><span class="mini">${l.ic} ${esc(l.t)}</span></div><div class="lgbar" style="margin-bottom:8px"><i style="width:${Math.round(LAS.st/(tot-1)*100)}%"></i></div><div id="laBody">${laLesBody(l)}</div><div id="laNav">${laNavHtml(l)}</div>`;}
function laDraw(){const l=LA_LES.find(x=>x.id===LAS.id);const b=$('#laBody');if(!l||!b)return;b.innerHTML=laLesBody(l);$('#laNav').innerHTML=laNavHtml(l);laBindLesson(l);window.scrollTo(0,0);}
function laBindLesson(l){const A=$('#app');
 A.querySelectorAll('.laPl').forEach(b=>b.onclick=ev=>{ev.stopPropagation();laSay(b.dataset.s,!!b.dataset.sl||LAS.slow);});
 const bk=$('#laBk');if(bk)bk.onclick=()=>go('la');
 const pv=$('#laPv');if(pv)pv.onclick=()=>{LAS.st=Math.max(0,LAS.st-1);laDraw();};
 const gg=$('#laGo');if(gg)gg.onclick=()=>{LAS.st=Math.min(laLast(l),LAS.st+1);laDraw();if(laKind(l,LAS.st)==='qz')laQzAuto(l);};
 const tg=$('#laTg');if(tg)tg.onclick=()=>{LAS.tr=!LAS.tr;const sy=window.scrollY;laDraw();window.scrollTo(0,sy);};
 const fin=$('#laFin');if(fin)fin.onclick=()=>{if(laStars(l.id)===0){laDone(l,3);toast('Sourate validée ! 🌟');}go('la');};
 if(laKind(l,LAS.st)==='qz')laQzBind(l);}
function laQzAuto(l){const q=LAS.qz;if(q&&q.i<q.N&&q.qs[q.i].t==='hear'){const it=q.qs[q.i].it,i0=q.i;setTimeout(()=>{if(LAS.qz===q&&q.i===i0)laSay(it.say||it.ar);},300);}}
function laQzDraw(l){const b=$('#laBody');if(!b)return;b.innerHTML=laQzHtml(l);laBindLesson(l);}
function laQzBind(l){const q=LAS.qz;if(!q)return;
 $('#app').querySelectorAll('.lgo[data-o]').forEach(b=>b.onclick=()=>{if(q.a!==null)return;const Q=q.qs[q.i];q.a=+b.dataset.o;if(Q.opts[q.a]===Q.it)q.sc++;laQzDraw(l);});
 const nx=$('#laNx');if(nx)nx.onclick=()=>{q.i++;q.a=null;if(q.i>=q.N)laQzFinish(l);laQzDraw(l);laQzAuto(l);};
 const ag=$('#laAg');if(ag)ag.onclick=()=>{LAS.qz=laQzMake(l,LAS.items);laQzDraw(l);laQzAuto(l);};
 const rv=$('#laRv');if(rv)rv.onclick=()=>{LAS.st=l.ty==='letrev'?0:1;LAS.qz=null;laDraw();};
 const n2=$('#laNx2');if(n2)n2.onclick=()=>{const i=LA_LES.findIndex(x=>x.id===l.id),nx=LA_LES[i+1];LAS.id=null;LAS.items=null;LAS.qz=null;if(nx)go('la/l/'+nx.id);else go('la');};}
/* ---- accueil / parcours ---- */
function laHome(){const p=laPts(),lv=laLevel(p),nx=laNext(),stk=laStreak(),done=LA_LES.filter(l=>laStars(l.id)>0).length;
 const pct=lv.nx?Math.round((p-lv.cur[0])/(lv.nx[0]-lv.cur[0])*100):100;
 return `<div class="plan ladash"><div class="mmlh"><span class="mmli">${lv.cur[2]}</span><div style="flex:1"><div><b>Niveau : ${esc(lv.cur[1])}</b></div><div class="mini">${p} points${lv.nx?' · encore '+(lv.nx[0]-p)+' pour « '+esc(lv.nx[1])+' » '+lv.nx[2]:' · niveau maximum 🎉'}</div></div><div class="mini" title="Jours de suite">🔥 ${stk}</div></div><div class="lgbar" style="margin-top:8px"><i style="width:${pct}%"></i></div><div class="mini" style="margin-top:6px">${done} leçon${done>1?'s':''} sur ${LA_LES.length} terminée${done>1?'s':''}</div>
 ${nx?`<div class="row" style="margin-top:10px"><button class="btn" type="button" id="laCont">▶️ ${done?'Continuer':'Commencer'} : ${esc(nx.t)}</button></div>`:'<div class="mini" style="margin-top:8px">🎓 Parcours terminé, machallah ! Tu peux tout rejouer pour réviser.</div>'}</div>
 ${LA_MOD.map((m,mi)=>{const ls=LA_LES.map((l,i)=>[l,i]).filter(x=>x[0].m===mi);return `<div class="plan"><h3>${m[0]} ${esc(m[1])}</h3>${ls.map(([l,i])=>{const op=laOpen(i),s=laStars(l.id);return `<div class="laLs ${op?'':'lock'}" data-l="${l.id}" role="button" tabindex="0"><span class="mmli">${op?l.ic:'🔒'}</span><div style="flex:1;min-width:0"><b>${esc(l.t)}</b></div><div class="mmst">${op?'⭐'.repeat(s)+'☆'.repeat(3-s):''}</div></div>`;}).join('')}</div>`;}).join('')}
 <div class="plan"><div class="mini">💡 Conseil : 5 minutes par jour valent mieux qu’une heure par semaine. Et pour bien réciter (tajwîd), écoute aussi un récitateur ou un enseignant : l’appli t’aide à <b>lire</b>.</div></div>`;}
function laAbc(){return `${laLetCard(LAS.sel,LAS.sel+1,28)}<div class="plan"><h3>🔤 L’alphabet arabe</h3><div class="mini">Touche une lettre pour la voir en détail et l’entendre. Elle s’écrit de droite à gauche.</div><div class="laAl">${LA_LET.map((y,i)=>`<button type="button" class="laCell laSel ${i===LAS.sel?'on':''}" data-i="${i}"><span class="laa" lang="ar">${esc(y[0])}</span><small>${esc(y[1])}</small></button>`).join('')}</div></div>`;}
function stDashCard(){if(S.nost)return '';return `<div class="plan stdash" onclick="go('etudes')" style="cursor:pointer"><h3>📚 Mes études</h3><div class="mini">Les grands procès · avancement <b>${overall()}%</b></div><div class="row" style="margin-top:8px">${sxResumeBtn()}</div></div>`;}
function laDashCard(){if(!S.la)return '';const nx=laNext(),p=laPts(),lv=laLevel(p),stk=laStreak();return `<div class="plan ladash" onclick="go('la')" style="cursor:pointer"><h3>🔤 J’apprends à lire l’arabe</h3><div class="mini">${lv.cur[2]} ${esc(lv.cur[1])} · 🔥 ${stk} jour${stk>1?'s':''}</div><div class="lgtt" style="margin-top:4px">${nx?(laStars(LA_LES[0].id)?'Prochaine leçon : ':'Première leçon : ')+'<b>'+esc(nx.t)+'</b>':'🎓 Parcours terminé !'}</div></div>`;}
function viewLa(sub,extra){if(!S.la){location.hash='';return;}const TB=[['','🗺️','Parcours'],['abc','🔤','Alphabet']];
 if(sub==='l'){const i=LA_LES.findIndex(x=>x.id===extra);if(i<0||!laOpen(i)){location.hash='la';return;}}else{sub=sub==='abc'?'abc':'';LAS.id=null;LAS.items=null;LAS.qz=null;}
 const body=sub==='l'?laLesson(extra):sub==='abc'?laAbc():laHome(),act=sub==='abc'?'abc':sub==='l'?'x':'';
 setApp(`<div class="laroot" dir="ltr" lang="fr" data-nt><div class="banner" style="--c:#00897b"><h1>🔤 Lire l’arabe</h1><div class="mini" style="color:#fff;opacity:.9">Du zéro aux premières sourates, pas à pas</div></div>
 ${sub==='l'?'':`<div class="tabs lgtabs latabs">${TB.map(t=>`<button class="tab ${t[0]===act?'on':''}" data-s="${t[0]}" type="button"><span class="lgti">${t[1]}</span><span>${t[2]}</span></button>`).join('')}</div>`}${body}</div>`);
 const A=$('#app');A.querySelectorAll('.latabs .tab').forEach(b=>b.onclick=()=>go(b.dataset.s?'la/'+b.dataset.s:'la'));
 if(sub==='l'){laBindLesson(LA_LES.find(x=>x.id===extra));return;}
 A.querySelectorAll('.laPl').forEach(b=>b.onclick=ev=>{ev.stopPropagation();laSay(b.dataset.s,!!b.dataset.sl);});
 if(sub==='abc'){A.querySelectorAll('.laSel').forEach(b=>b.onclick=()=>{LAS.sel=+b.dataset.i;viewLa('abc');});return;}
 const c=$('#laCont');if(c)c.onclick=()=>go('la/l/'+laNext().id);
 A.querySelectorAll('.laLs').forEach(el=>{const open=()=>{if(el.classList.contains('lock')){toast('Termine d’abord la leçon précédente 🔒');return;}go('la/l/'+el.dataset.l);};el.onclick=open;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};});}

/* ================= 🧭 MENUS : barre du haut, « Plus », Profil, bouton ＋ ================= */
const MEO={sp:0,info:1,fam:1};
function hdAv(){const b=$('#pSync');if(!b)return;if(!SY.at){b.textContent='👤';b.classList.remove('hav');return;}const n=(S.me||SY.email||'?').trim().charAt(0).toUpperCase()||'?';b.innerHTML=chAvSpan(chMe(),esc(n),chCol(chMe()),'hd');b.classList.add('hav');}
const UX_TIPS=[
["Le bouton ＋ en bas à droite ajoute un rendez-vous, une tâche ou une personne.","زر ＋ في أسفل الشاشة يضيف موعداً أو مهمة أو شخصاً."],
["Touche ta photo en haut à droite pour ouvrir ton profil.","اضغط على صورتك في أعلى الشاشة لفتح ملفك الشخصي."],
["Ajoute ton numéro dans ton profil : ta famille pourra t’appeler d’un geste (WhatsApp ou appel).","أضف رقم هاتفك في ملفك الشخصي ليتصل بك أهلك بلمسة واحدة (واتساب أو مكالمة)."],
["Le menu « Plus » regroupe tous tes espaces et tes outils.","قائمة «المزيد» تجمع كل مساحاتك وأدواتك."],
["Dans Famille, touche une personne pour voir ses rendez-vous, ses papiers et ses tâches.","في العائلة، اضغط على شخص لرؤية مواعيده وأوراقه ومهامه."],
["Les horaires de prière fonctionnent même sans connexion.","مواقيت الصلاة تعمل حتى بدون اتصال بالإنترنت."],
["Dans Discussions, tu peux envoyer un vocal ou une photo à toute la famille.","في المحادثات يمكنك إرسال رسالة صوتية أو صورة لكل العائلة."]];
const uxTip=()=>UX_TIPS[((lgDayN()%UX_TIPS.length)+UX_TIPS.length)%UX_TIPS.length];
function uxTile(g,ic,t,s,x){return `<button type="button" class="mtile" data-g="${g}"><span class="mti">${ic}</span><b>${t}</b>${s?`<small>${s}</small>`:''}${x||''}</button>`;}
function viewMore(){const T=LGL,tp=uxTip(),un=(typeof chUnread==='function'&&SY.fid)?chUnread():0;
 const sp=[];if(!S.nost)sp.push(uxTile('etudes','📚',T('Études','الدراسة'),T('Droit pénal','القانون الجنائي')));if(S.lg)sp.push(uxTile('log','🚚',T('Logistique','اللوجستيك')));if(S.mm)sp.push(uxTile('mm','🌸','ركني'));if(S.la)sp.push(uxTile('la','🔤',T('Lire l’arabe','تعلّم القراءة'),T('Du zéro aux sourates','من الصفر إلى السور')));
 sp.push(uxTile('me/sp','➕',T('Ajouter un espace','إضافة مساحة'),T('Logistique, Maman, arabe…','لوجستيك، ماما، عربية…')));
 const isAd=SY.at&&(SY.adm||SY.email===OWNER);
 setApp(`<div class="mrt" data-nt><div class="banner" style="--c:#546e7a"><h1>${T('Plus','المزيد')}</h1><div class="mini" style="color:#fff;opacity:.9">${T('Tes espaces, tes outils et tes réglages','مساحاتك وأدواتك وإعداداتك')}</div></div>
 <h2 class="mh">${T('Mes espaces','مساحاتي')}</h2><div class="mgrid">${sp.join('')}</div>
 <h2 class="mh">${T('Outils','أدوات')}</h2><div class="mgrid">${uxTile('prayer','🕌',T('Prière','الصلاة'),T('Horaires & rappels','المواقيت والتذكير'))}${uxTile('spirit','🌙',T('Versets & hadiths','آيات وأحاديث'),T('Un rappel par jour','تذكير يومي'))}${SY.fid?uxTile('chat','💬',T('Discussions','المحادثات'),T('Famille & messages privés','العائلة والرسائل'),un?`<span class="mbadge">${un}</span>`:''):''}${uxTile('data','💾',T('Ma sauvegarde','نسختي الاحتياطية'),T('Exporter / importer','تصدير / استيراد'))}</div>
 <h2 class="mh">${T('Moi','أنا')}</h2><div class="mgrid">${uxTile('me','👤',T('Mon profil','ملفي الشخصي'),T('Photo, infos, famille','الصورة والمعلومات والعائلة'))}${uxTile('@prefs','🎨',T('Affichage','المظهر'),T('Thème, taille du texte','المظهر وحجم الخط'))}${uxTile('@lang','🌐',isAr()?'Français':'العربية',T('Changer de langue','تغيير اللغة'))}${uxTile('@help','❓',T('Aide','مساعدة'),T('Comment ça marche ?','كيف يعمل التطبيق؟'))}${isAd?uxTile('admin','🛠️','Admin'):''}</div>
 <div class="plan uxtip"><b>💡 ${T('Astuce du jour','نصيحة اليوم')}</b><div class="mini" style="margin-top:4px">${esc(isAr()?tp[1]:tp[0])}</div></div></div>`);
 $('#app').querySelectorAll('.mtile').forEach(b=>b.onclick=()=>{const g=b.dataset.g;if(g==='@prefs')openPrefs();else if(g==='@help')openHelp();else if(g==='@lang')setLang(isAr()?'fr':'ar');else go(g);});}
/* ---- bouton ＋ ---- */
function fabRoute(){const a=location.hash.slice(1).split('/')[0];return ['','cal','tasks','fam'].includes(a)?a:null;}
function fabUpdate(){let f=$('#fab');if(!f){f=document.createElement('button');f.id='fab';f.type='button';f.className='fab';f.textContent='＋';f.setAttribute('aria-label','Ajouter');f.onclick=fabOpen;document.body.appendChild(f);}
 const r=fabRoute(),on=!!(SY.at&&r!==null);f.style.display=on?'':'none';if(!on){const m=$('#fabM');if(m)m.remove();}}
function fabOpen(){const old=$('#fabM');if(old){old.remove();return;}const r=fabRoute(),T=LGL,dt=r==='cal'?CAL.sel:undefined;
 const it=[['📅',T('Rendez-vous','موعد'),()=>evForm(null,dt)],['✅',T('Tâche','مهمة'),()=>tkForm(null,dt)],['👤',T('Personne','شخص'),()=>pForm()]];if(r==='fam'||!fam().length)it.push(['👥',T('Plusieurs personnes','عدة أشخاص'),()=>quickAddFam()]);
 const m=document.createElement('div');m.id='fabM';m.className='fabm';m.innerHTML=it.map((x,i)=>`<button type="button" data-i="${i}"><span>${x[0]}</span>${x[1]}</button>`).join('');document.body.appendChild(m);
 m.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();m.remove();it[+b.dataset.i][2]();});
 setTimeout(()=>{const h=e=>{if(!e.target.closest('#fabM,#fab')){const x=$('#fabM');if(x)x.remove();document.removeEventListener('click',h);}};document.addEventListener('click',h);},0);}
/* ---- profil ---- */
function meSec(id,ic,t,body,open){return `<details class="mesec" id="me-${id}" ${open?'open':''}><summary><span>${ic}</span><b>${t}</b><i>›</i></summary><div class="mebody">${body}</div></details>`;}
function meSw(id,ic,t,s,on){return `<div class="mesw"><span class="mti">${ic}</span><div style="flex:1;min-width:0"><b>${t}</b>${s?`<div class="mini">${s}</div>`:''}</div><button type="button" class="swb ${on?'on':''}" id="${id}" role="switch" aria-checked="${on?'true':'false'}"><i></i></button></div>`;}
function viewMe(sub){if(!SY.at){go('');return;}const T=LGL,nm=S.me||'',inits=(nm||SY.email||'?').trim().charAt(0).toUpperCase()||'?',lvl=Math.floor((S.xp||0)/200)+1;
 const mem=(CH.ov&&CH.ov.members)||[];
 const memH=mem.length?`<div class="mem">${mem.map(m=>`<div class="memr" data-u="${esc(m.id)}">${chAvSpan(m.id,esc((m.name||'?').trim().charAt(0).toUpperCase()),chCol(m.id),'')}<div style="flex:1;min-width:0"><b>${esc(m.name||'—')}</b>${m.id===chMe()?` <span class="mini">(${T('moi','أنا')})</span>`:''}</div>${m.id!==chMe()?`<button type="button" class="btn alt memc" data-u="${esc(m.id)}">💬</button>`:''}</div>`).join('')}</div>`:'';
 const famB=SY.fid?`<div class="mini">${T('Famille','العائلة')} : <b data-nt>${esc(SY.fname||'')}</b></div><div class="mecode" data-nt>${esc(SY.code||'')}</div><div class="row"><button class="btn alt" id="fcCp" type="button">📋 ${T('Copier le code','نسخ الرمز')}</button><button class="btn alt" id="fcSh" type="button">📤 ${T('Inviter','دعوة')}</button></div>${memH}`:`<div class="mini">${T('Pas encore de famille. Entre le code reçu ou crée la tienne.','لا توجد عائلة بعد. أدخل الرمز الذي وصلك أو أنشئ عائلتك.')}</div>${famCard()}`;
 const info=`<label class="mel">${T('Prénom','الاسم')}</label><div class="acph"><input class="srch" id="acNm" value="${esc(nm)}" maxlength="30" autocomplete="given-name"><button class="btn alt" id="acNmS" type="button">${T('Enregistrer','حفظ')}</button></div>
 <label class="mel">${T('E-mail','البريد الإلكتروني')}</label><div class="mero" data-nt>${esc(SY.email||'—')}</div>
 <label class="mel">${T('Téléphone','الهاتف')}</label><div class="acph"><input class="srch" id="acPh" type="tel" inputmode="tel" autocomplete="tel" placeholder="+33 6 12 34 56 78" value="${esc(PH.m[chMe()]||'')}"><button class="btn alt" id="acPhS" type="button">${T('Enregistrer','حفظ')}</button></div><div class="mini">📞 ${T('Pour que ta famille puisse t’appeler (WhatsApp ou appel). Seuls les membres de ta famille le voient.','ليتمكن أهلك من الاتصال بك (واتساب أو مكالمة). لا يراه إلا أفراد عائلتك.')}</div>`;
 const spaces=(S.stl==='h'?meSw('swSt','📚',T('Études de droit','دراسة القانون'),T('Compte de Hajar','حساب هاجر'),1):'')+(S.stl!=='h'?meSw('swSt','📚',T('Études de droit','دراسة القانون'),T('Réservé à Hajar (code requis)','خاص بهاجر (يلزم رمز)'),0):'')+meSw('swLg','🚚',T('Logistique','اللوجستيك'),T('Astuces, outils et défis (Papa)','نصائح وأدوات وتحديات (بابا)'),!!S.lg)+meSw('swMm','🌸','ركني',T('Coin de Maman, 100 % arabe','ركن ماما، بالعربية بالكامل'),!!S.mm)+meSw('swLa','🔤',T('Lire l’arabe','تعلّم قراءة العربية'),T('Du zéro aux premières sourates','من الصفر إلى السور الأولى'),!!S.la);
 const disp=`<div class="mgrid" style="margin-top:0">${uxTile('@prefs','🎨',T('Thème & texte','المظهر والخط'),T('Clair, sombre, taille','فاتح، داكن، الحجم'))}${uxTile('@lang','🌐',isAr()?'Français':'العربية',T('Changer de langue','تغيير اللغة'))}</div>`;
 const acct=`<div class="mini" data-nt style="margin-bottom:8px">${esc(syStatTxt())}</div><div class="megrid"><button class="btn" id="acSy" type="button">🔄 ${T('Synchroniser','مزامنة')}</button>${matchMedia('(display-mode: standalone)').matches?'':`<button class="btn alt" id="acIn" type="button">📲 ${T('Installer l’appli','تثبيت التطبيق')}</button>`}<button class="btn alt" id="acPw" type="button">🔑 ${T('Mot de passe','كلمة المرور')}</button><button class="btn alt" id="acDt" type="button">☁️ ${T('Détails synchro','تفاصيل المزامنة')}</button><button class="btn alt" id="acBk" type="button">💾 ${T('Ma sauvegarde','نسختي')}</button><button class="btn alt" id="acHl" type="button">❓ ${T('Aide','مساعدة')}</button>${SY.adm||SY.email===OWNER?`<button class="btn alt" id="acAd" type="button">🛠️ Admin</button>`:''}</div>`;
 const dang=`<div class="megrid"><button class="btn alt" id="acWp" type="button">🧹 ${T('Effacer cet appareil','مسح هذا الجهاز')}</button><button class="btn alt" id="acDel" type="button" style="color:#c62828">🗑️ ${T('Supprimer mon compte','حذف حسابي')}</button></div>`;
 setApp(`<div class="mert" data-nt><div class="mehero"><div class="meav"><span id="acAvI">${chAvSpan(chMe(),esc(inits),chCol(chMe()),'huge')}</span><button type="button" id="acAv" class="mecam" aria-label="${T('Changer la photo','تغيير الصورة')}">📷</button></div><input type="file" id="acAvF" accept="image/*" hidden>
 <div class="mename" data-nt>${esc(nm||T('Mon profil','ملفي'))}</div><div class="mini" style="color:#fff;opacity:.85" data-nt>${esc(SY.email||'')}</div>
 <div class="mechips">${SY.fid?`<span>👪 ${esc(SY.fname||'')}</span>`:''}<span>🏅 ${T('Niv.','مستوى')} ${lvl}</span><span>🔥 ${S.streak||0} ${T('j','يوم')}</span></div>${AV.m[chMe()]?`<button type="button" class="meax" id="acAvX">${T('Retirer la photo','إزالة الصورة')}</button>`:''}</div>
 ${meSec('info','✏️',T('Mes infos','معلوماتي'),info,MEO.info)}${meSec('fam','👪',T('Ma famille','عائلتي'),famB,MEO.fam)}${meSec('sp','🧩',T('Mes espaces','مساحاتي'),spaces,MEO.sp||sub==='sp')}${meSec('disp','🎨',T('Affichage & langue','المظهر واللغة'),disp,0)}${meSec('acct','⚙️',T('Compte & données','الحساب والبيانات'),acct,0)}${meSec('dang','⚠️',T('Zone sensible','منطقة حساسة'),dang,0)}
 <div class="row" style="margin:14px 0 6px"><button class="btn alt" id="acOut" type="button" style="color:#c62828;width:100%">🚪 ${T('Me déconnecter','تسجيل الخروج')}</button></div></div>`);
 meBind(sub);}
function meBind(sub){const A=$('#app'),c=()=>{};
 A.querySelectorAll('details.mesec').forEach(d=>d.addEventListener('toggle',()=>{const k=d.id.slice(3);if(k in MEO)MEO[k]=d.open?1:0;}));
 if(sub==='sp'){const e=$('#me-sp');if(e)setTimeout(()=>e.scrollIntoView({block:'start'}),50);}
 A.querySelectorAll('.mtile').forEach(b=>b.onclick=()=>{const g=b.dataset.g;if(g==='@prefs')openPrefs();else if(g==='@lang')setLang(isAr()?'fr':'ar');else go(g);});
 const ns=$('#acNmS');ns.onclick=()=>{const v=$('#acNm').value.trim();if(!v){toast(LGL('Écris ton prénom','اكتب اسمك'));return;}S.me=v;save();syncNow();hdAv();toast(LGL('Prénom enregistré ✅','تم حفظ الاسم ✅'));viewMe();};
 $('#acNm').onkeydown=e=>{if(e.key==='Enter')ns.onclick();};
 const phb=$('#acPhS');phSync(1).then(()=>{const i=$('#acPh');if(i&&!i.value&&PH.m[chMe()])i.value=PH.m[chMe()];});phb.onclick=async()=>{const i=$('#acPh');const r=await phSet(i.value);if(r!==false&&i)i.value=r||'';};
 $('#acAv').onclick=()=>$('#acAvF').click();$('#acAvF').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;if(!/^image\//.test(f.type)){toast(LGL('Choisis une photo','اختر صورة'));return;}await avSet(f);hdAv();if(location.hash.slice(1).split('/')[0]==='me')viewMe();};
 const ax=$('#acAvX');if(ax)ax.onclick=async()=>{await avSet(null);hdAv();viewMe();};
 if($('#fcCp')){$('#fcCp').onclick=()=>{try{navigator.clipboard.writeText(SY.code);toast(LGL('Code copié','تم نسخ الرمز'));}catch(e){toast(SY.code);}};$('#fcSh').onclick=famShare;}else famCardBind();
 A.querySelectorAll('.memc').forEach(b=>b.onclick=()=>go('chat/'+b.dataset.u));
 if(SY.fid&&!(CH.ov&&CH.ov.members&&CH.ov.members.length)){chOverview().then(()=>{if(location.hash.slice(1).split('/')[0]==='me'&&$('#me-fam')&&CH.ov&&CH.ov.members&&CH.ov.members.length)viewMe();});}
 const tb=()=>renderTabs((location.hash.slice(1).split('/')[0])||'');
 const tog=(id,key,onMsg,offMsg,dest)=>{const b=$('#'+id);b.onclick=()=>{if(S[key]){if(!confirm(LGL('Retirer cet espace de ton compte ? Ta progression est conservée.','إزالة هذه المساحة من حسابك؟ تقدمك محفوظ.')))return;S[key]=0;save();langApply();tb();viewMe('sp');toast(offMsg);}else{S[key]=1;save();langApply();tb();go(dest);toast(onMsg);}};};
 tog('swLg','lg',LGL('Espace Logistique ajouté 🚚','تمت إضافة اللوجستيك 🚚'),LGL('Espace retiré','تمت الإزالة'),'log');
 tog('swLa','la',LGL('Espace « Lire l’arabe » ajouté 🔤','تمت إضافة تعلّم القراءة 🔤'),LGL('Espace retiré','تمت الإزالة'),'la');
 const mm=$('#swMm');mm.onclick=()=>{if(S.mm){if(!confirm(LGL('Retirer l’espace Maman de ce compte ?','إزالة ركن ماما من هذا الحساب؟')))return;S.mm=0;save();langApply();tb();viewMe('sp');toast(LGL('Espace retiré','تمت الإزالة'));return;}S.mm=1;S.fs=Math.max(S.fs||100,115);save();if(!isAr())setLang('ar');applyPrefs();tb();go('mm');toast('تم تفعيل ملف ماما 🌸');};
 $('#swSt').onclick=async()=>{if(S.stl==='h'){toast(LGL('Compte Hajar actif ✅','حساب هاجر مفعّل ✅'));return;}const k=(prompt(LGL('Code de vérification (réservé à Hajar)','رمز التحقق (خاص بهاجر)'))||'').trim();if(!k)return;if((await sha256(k))!==HJH){toast(LGL('Code de vérification incorrect.','رمز التحقق غير صحيح.'));return;}S.stl='h';S.nost=0;S.nsa=0;save();langApply();tb();toast(LGL('Compte Hajar activé ✅','تم تفعيل حساب هاجر ✅'));viewMe('sp');};
 $('#acSy').onclick=()=>{syncNow();toast(LGL('Synchronisation…','جارٍ المزامنة…'));};$('#acDt').onclick=()=>go('sync');$('#acPw').onclick=()=>pwForm();$('#acHl').onclick=()=>openHelp();$('#acBk').onclick=()=>go('data');$('#acOut').onclick=doLogout;$('#acDel').onclick=deleteMyAccount;
 $('#acWp').onclick=async()=>{if(!confirm('Effacer toutes les données locales de cet appareil (personnes, rendez-vous, tâches, progression) ? Celles de ton compte en ligne sont conservées et seront rechargées.'))return;await resetUserData();route();syncNow();toast('Appareil nettoyé ✅');};
 const ad=$('#acAd');if(ad)ad.onclick=()=>go('admin');
 const ins=$('#acIn');if(ins)ins.onclick=()=>{if(DEFER){doInstall();}else toast(/iphone|ipad/i.test(navigator.userAgent)?(/crios|fxios|edgios|opios/i.test(navigator.userAgent)?'Ouvre ce lien dans Safari, puis touche Partager et « Sur l’écran d’accueil »':'Touche Partager puis « Sur l’écran d’accueil »'):'Menu ⋮ du navigateur, puis « Installer l’application »',6000);};}

/* ---- sx: réussir l'examen (reprendre, fiches, ressources, actu 2026) ---- */
const SX_AFF=[
 [1,'Benalla',[['Sénat · rapport d\'enquête de la commission des lois','https://www.senat.fr/salle-de-presse/201902/rapport-denquete-de-la-commission-des-lois-sur-laffaire-benalla.html']]],
 [1,'Cahuzac',[['INA · L\'affaire Cahuzac','https://www.ina.fr/ina-eclaire-actu/l-affaire-cahuzac'],['INA · La Revue des médias : l\'enregistrement secret','https://larevuedesmedias.ina.fr/affaire-cahuzac-fraude-fiscale-fabrice-arfi-mediapart-source-enquete-enregistrement']]],
 [2,'Marc Machin',[['INA · la demande de révision du procès','https://www.ina.fr/ina-eclaire-actu/video/pa00001402063/meurtre-d-une-femme-au-pont-de-neuilly-demande-de-revision-du-proces']]],
 [2,'Patrick Dils',[['INA · décision de la Cour de révision','http://www.ina.fr/video/CAC01018256'],['INA · erreur judiciaire','https://www.ina.fr/ina-eclaire-actu/video/cab99023019/erreur-judiciaire-patrick-dils']]],
 [3,'Omar Raddad',[['Légifrance · Cour de révision, 20 novembre 2002','https://www.legifrance.gouv.fr/juri/id/JURITEXT000007070659/'],['INA · 30 ans de rebondissements','https://www.ina.fr/ina-eclaire-actu/l-affaire-omar-raddad-30-ans-de-rebondissements']]],
 [3,'Dany Leprince',[['INA · verdict du procès','https://www.ina.fr/ina-eclaire-actu/video/cab97143172/verdict-dany-leprince']]],
 [4,'Marie Besnard',[['INA · trois procès et un acquittement','https://www.ina.fr/ina-eclaire-actu/l-affaire-marie-besnard']]],
 [4,'Henri-Jean Jacomet',[]],
 [5,'Abdelkader Merah',[['INA · un procès hors-normes','https://www.ina.fr/ina-eclaire-actu/video/s666539_001/affaire-merah-un-proces-hors-normes']]],
 [5,'Samuel Paty',[]],
 [6,'Grégory Villemin',[['INA · rappel en archives','https://www.ina.fr/ina-eclaire-actu/affaire-gregory-meurtre-enfant-1984-enquete-villemin-laroche-police-gendarmerie']]],
 [6,'Émile Louis',[['INA · les aveux','https://www.ina.fr/ina-eclaire-actu/video/cac00064736/les-disparues-de-l-yonne-les-aveux-d-emile-louis'],['INA · la justice en cause','https://www.ina.fr/ina-eclaire-actu/video/1884795001016/la-justice-en-cause-dans-l-affaire-des-disparues-de-l-yonne']]],
 [6,'Guy Georges',[['INA · verdict du procès','https://www.ina.fr/ina-eclaire-actu/video/cab01017024/verdict-du-proces-de-guy-georges']]],
 [6,'Michel Fourniret',[['INA · Monique Olivier et le procès','https://www.ina.fr/ina-eclaire-actu/monique-olivier-michel-fourniret-proces-justice-viol']]],
 [7,'Sœurs Papin',[['Criminocorpus · affaire Papin (1933)','https://criminocorpus.org/fr/bibliotheque/doc/3547/']]],
 [7,'Alain Lamare',[['INA · arrestation du gendarme « tueur de l\'Oise »','http://www.ina.fr/video/RCC8903030449']]],
 [7,'Romain Dupuy',[['Légifrance · cour d\'appel de Pau, 14 décembre 2007','https://www.legifrance.gouv.fr/juri/id/JURITEXT000019581726']]],
 [7,'Sarah Halimi',[['Légifrance · Cass. crim., 14 avril 2021, n° 20-80.135','https://www.legifrance.gouv.fr/juri/id/JURITEXT000043473408'],['Ministère de la Justice · irresponsabilité pénale','https://www.justice.gouv.fr/actualites/espace-presse/irresponsabilite-penale']]]];
const sxA=(u,t)=>`<a class="sxl" href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`;

function sxResume(){
 const due=allQuestions().filter(x=>isDue(x.id)).length,w=weakItems().length,f=focusE(),ov=overall();
 if(due>=8)return {i:'🔁',t:`Revoir ${due} questions`,s:'Elles sont prêtes : c\'est le meilleur moment pour les ancrer',h:'review'};
 if(w>=8)return {i:'🎯',t:'Corriger mes points faibles',s:`${w} questions ratées à retravailler`,h:'weak'};
 if(ov>=85)return {i:'🏛️',t:'Faire un examen blanc',s:'20 questions en 20 minutes, comme le jour J',h:'exam'};
 const tb=nextTab(f);return {i:f.emoji,t:`Continuer l'étape ${f.n}`,s:`${progress(f)}% fait`,h:`e/${f.n}/${tb}`};}
function sxResumeBtn(){const r=sxResume();return `<button class="btn sxres" type="button" onclick="event.stopPropagation();go('${r.h}')"><span class="sxri">${r.i}</span><span><b>${esc(r.t)}</b><small>${esc(r.s)}</small></span></button>`;}

function sxActu(short){
 return `<div class="sxwarn" data-nt><b>⚠️ À jour 2026 — la CCD a changé</b><br>La <b>loi n° 2026-651 du 23 juillet 2026</b> (justice criminelle et respect des victimes), en vigueur depuis le <b>25 juillet 2026</b>, modifie les cours criminelles départementales. D'après le CNB : les crimes commis <b>en état de récidive légale</b> peuvent désormais relever de la CCD (art. 380-16 et 181-1 CPP) — alors que le cours (version d'avant la loi) les exclut.${short?'':' Le délai d\'audiencement revient à <b>un an</b> (art. 181 CPP) et des avocats honoraires pourront être assesseurs à partir du <b>1er janvier 2027</b>.'}<br><span class="mini">👉 À l'examen, réponds selon la version que <b>ton professeur</b> attend (demande-lui !) et vérifie sur Légifrance. <a class="sxl" href="#res/actu">Détails et sources</a></span></div>`;}

function sxTerms(b){const seen=new Set(),out=[];(b.items||[]).forEach(it=>{if(typeof it!=='string')return;(it.match(/\*\*(.+?)\*\*/g)||[]).forEach(m=>{const t=m.slice(2,-2).trim();const k=t.toLowerCase();if(t.length<2||t.length>64||seen.has(k))return;seen.add(k);out.push(t);});});return out.slice(0,12);}
function sxFiche(e){
 const aff=SX_AFF.filter(a=>a[0]===e.n);
 return `<section class="card sxf" style="--c:#${e.color};border-top:6px solid #${e.color}"><h2>${e.emoji} Étape ${e.n} · ${esc(e.title)}</h2><div class="mini">${esc(e.pages)}</div>
 <div class="bref" style="margin-top:8px"><b>🔎 En bref</b><br>${rt(e.bref)}</div>
 ${e.blocks.map(b=>{const t=sxTerms(b);return `<h3 class="sxh">${esc(b.h)}</h3>${t.length?`<div class="sxk">${t.map(x=>`<span class="chip" onclick="this.classList.toggle('rv')">${rt(x)}</span>`).join('')}</div>`:''}`;}).join('')}
 ${aff.length?`<h3 class="sxh">🎬 Raconte chaque affaire en 4 temps</h3><div class="mini">faits → procédure → décision → enseignement juridique</div><div class="sxk">${aff.map(a=>`<span class="chip">${esc(a[1])}</span>`).join('')}</div>`:''}
 <div class="row noprint" style="margin-top:10px"><button class="btn alt" onclick="go('e/${e.n}/cours')">📖 Relire le cours</button><button class="btn alt" onclick="go('e/${e.n}/quiz')">🎯 Quiz</button></div></section>`;}
function viewFiches(sub){
 const n=sub==='all'?'all':(sub===''||sub==null?'':+sub);
 const nav=`<div class="row noprint"><button class="btn alt" id="sxHide">🙈 Mode rappel actif</button><button class="btn alt" onclick="window.print()">🖨️ Imprimer / PDF</button></div>`;
 let body='';
 if(n===''){
  body=`<p>Un résumé par étape, fabriqué à partir de ton cours : les notions clés de chaque partie. <b>Astuce :</b> active le mode rappel, devine chaque notion, puis touche-la pour la révéler.</p>
  <div class="grid2">${E.map(e=>`<div class="card" style="cursor:pointer;border-top:6px solid #${e.color}" onclick="go('fiches/${e.n}')"><b>${e.emoji} Étape ${e.n}</b><div>${esc(e.title)}</div><div class="mini">${esc(e.pages)} · ${progress(e)}% fait</div></div>`).join('')}</div>
  <div class="row"><button class="btn" onclick="go('fiches/all')">📄 Toutes les fiches (à imprimer)</button></div>`;
 }else if(n==='all'){body=nav+E.map(sxFiche).join('');}
 else{const e=E.find(x=>x.n===n);if(!e)return viewFiches('');body=nav+sxFiche(e)+`<div class="row noprint">${n>0?`<button class="btn alt" onclick="go('fiches/${n-1}')">⬅️ Étape ${n-1}</button>`:''}${n<E.length-1?`<button class="btn alt" onclick="go('fiches/${n+1}')">Étape ${n+1} ➡️</button>`:''}</div>`;}
 setApp(`<div class="sxroot" data-nt><div class="banner" style="--c:#00695c"><h1>📝 Fiches de révision</h1><div class="mini" style="color:#fff;opacity:.9">L'essentiel de chaque étape, sur une page</div></div>${n===0||n==='all'?sxActu(true):''}${body}<div class="row noprint"><button class="btn alt" onclick="go('etudes')">🏠 Retour aux études</button></div></div>`);
 const hb=$('#sxHide');if(hb)hb.onclick=()=>{const r=document.querySelector('.sxroot');r.classList.toggle('sxhide');hb.textContent=r.classList.contains('sxhide')?'👀 Tout afficher':'🙈 Mode rappel actif';addXp(2);};
}

const SX_FMT={
 qcm:['✅','QCM',["Lis la question en entier <b>puis toutes les propositions</b> avant de répondre.","Méfie-toi de « toujours », « jamais », « seulement », « obligatoirement ».","Élimine d'abord les propositions fausses ; si tu bloques, passe et reviens.","Entraîne-toi en conditions réelles : <a class=\"sxl\" href=\"#exam\">Examen blanc 20 questions / 20 min</a>."]],
 cas:['⚖️','Cas pratique',["Dans l'ordre : <b>1) faits utiles · 2) problème de droit · 3) règle (texte ou jurisprudence) · 4) application aux faits · 5) conclusion</b>.","Ne raconte pas : <b>qualifie</b> les faits (quelle infraction, quelle juridiction, quelle procédure).","Cite les articles et les décisions, même de mémoire approximative : <a class=\"sxl\" href=\"#exam\">8 cas pratiques</a> pour t'entraîner."]],
 diss:['✍️','Dissertation / question de cours',["Introduction : accroche, définition des termes, intérêt, <b>problématique</b>, annonce du plan.","Un plan en deux parties, deux sous-parties, avec des titres qui répondent au sujet.","Illustre chaque idée avec une affaire du cours (Machin, Dils, Raddad, Halimi…)."]],
 oral:['🎤','Oral',["Prépare chaque affaire en 3 minutes : <b>faits → procédure → décision → enseignement</b>.","Entraîne-toi à voix haute, chronomètre en main.","Commence par une phrase d'accroche, finis par la leçon juridique."]]};
function sxFmtCard(){
 const f=S.xfmt&&SX_FMT[S.xfmt]?S.xfmt:'';
 return `<div class="card"><b>Quel est le format de ton examen ?</b> <span class="mini">(demande-le à ton professeur si tu ne sais pas)</span>
 <div class="sxk" style="margin-top:8px">${Object.entries(SX_FMT).map(([k,v])=>`<button class="lgcb ${f===k?'on':''}" type="button" data-f="${k}">${v[0]} ${v[1]}</button>`).join('')}</div>
 ${f?`<ul style="margin:10px 0 0;padding-inline-start:20px;line-height:1.6">${SX_FMT[f][2].map(x=>`<li>${x}</li>`).join('')}</ul>`:'<div class="mini">Choisis ton format pour voir la méthode adaptée.</div>'}</div>`;}

function sxPlan(){
 const dl=daysLeft();
 if(dl===null||dl<0)return `<div class="card"><b>📅 Planning de révision</b><div class="mini">Indique la date de ton examen et je te prépare un planning jour par jour.</div><div class="row"><button class="btn" onclick="go('etudes')">Renseigner la date</button></div></div>`;
 const fd=n=>new Date(addD(today(),n)+'T00:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
 if(dl<7)return `<div class="card"><b>📅 J-${dl} : mode sprint</b><ul style="padding-inline-start:20px;line-height:1.7"><li>Chaque jour : <a class="sxl" href="#today">session du jour</a> + <a class="sxl" href="#weak">points faibles</a></li><li>Relis les <a class="sxl" href="#fiches">fiches</a> une fois par jour (mode rappel)</li><li>Un <a class="sxl" href="#exam">examen blanc</a> en conditions réelles</li><li>La veille : léger, couche-toi tôt. Le sommeil fixe la mémoire 🌙</li></ul></div>`;
 const a0=dl>=21?.5:.45,b0=.25,c0=dl>=21?.15:.2;
 let a=Math.max(1,Math.round(dl*a0)),b=Math.max(1,Math.round(dl*b0)),c=Math.max(1,Math.round(dl*c0)),d=dl-a-b-c;if(d<1){c=Math.max(1,c+d-1);d=dl-a-b-c;}
 const ph=[[a,'🧠 Apprendre','Une étape tous les 2–3 jours : palais → cours → flashcards → quiz'],[b,'⚖️ Appliquer','Les 8 cas pratiques + <a class="sxl" href="#weak">points faibles</a>'],[c,'🔁 Mémoriser','Session du jour + <a class="sxl" href="#fiches">fiches</a> en mode rappel'],[d,'🏁 Dernière ligne droite','Examens blancs, relecture des fiches, sommeil']];
 let cur=0;return `<div class="card"><b>📅 Planning · J-${dl}</b><div class="mini">calculé à partir de la date de ton examen</div>${ph.map(p=>{const s=cur,e=cur+p[0]-1;cur+=p[0];return `<div class="lgck"><b>${p[1]}</b> <span class="mini">· ${fd(s)} → ${fd(e)}</span><div class="mini">${p[2]}</div></div>`;}).join('')}</div>`;}

function viewRes(sub){
 const L=(u,t,d)=>`<div class="lgck">${sxA(u,t)}${d?`<div class="mini">${d}</div>`:''}</div>`;
 setApp(`<div class="sxroot" data-nt><div class="banner" style="--c:#283593"><h1>🎓 Réussir l'examen</h1><div class="mini" style="color:#fff;opacity:.9">Méthode, planning, affaires réelles et liens utiles</div></div>
 <div class="row"><button class="btn" onclick="go('fiches')">📝 Fiches de révision</button><button class="btn alt" onclick="go('exam')">🏛️ Examen blanc</button></div>
 <div id="actu">${sxActu(false)}</div>
 <h2>🗓️ Mon planning</h2>${sxPlan()}
 <h2>🧭 Ma méthode</h2><div id="sxfmt">${sxFmtCard()}</div>
 <div class="card"><b>Le réflexe « grand procès » : raconter chaque affaire en 4 temps</b><ol style="padding-inline-start:22px;line-height:1.7;margin:6px 0 0"><li><b>Les faits</b> : qui, quoi, quand (3 phrases max)</li><li><b>La procédure</b> : enquête, instruction, juridiction, voies de recours</li><li><b>La décision</b> : condamnation, acquittement, révision, irresponsabilité…</li><li><b>L'enseignement</b> : quelle règle de droit ou quelle limite de la justice cette affaire illustre ?</li></ol></div>
 <div class="card"><b>⚠️ Pièges classiques (d'après ton cours)</b><ul style="padding-inline-start:20px;line-height:1.7;margin:6px 0 0"><li>Cour d'assises : <b>3 magistrats + 6 jurés</b> en 1re instance, <b>9 jurés</b> en appel.</li><li>CCD : <b>1 président + 4 assesseurs</b>, <b>pas de jurés</b>.</li><li>Procès équitable : <b>art. 6 CEDH</b> — à citer dès que la question touche aux droits de la défense, aux médias ou à la preuve.</li><li>Vérifie toujours la <a class="sxl" href="#res/actu">réforme de 2026</a> avant de répondre sur la CCD.</li></ul></div>
 <h2>🎬 Les affaires du cours : sources</h2><div class="mini">Uniquement des sources officielles ou institutionnelles (Légifrance, Sénat, ministère de la Justice, archives publiques de l'INA, Criminocorpus). Quand je n'en ai pas trouvé en ligne, c'est indiqué : ton cours fait foi. Pour l'examen, la partie juridique compte plus que le récit des faits.</div>
 ${E.filter(e=>e.n>0).map(e=>`<details class="mesec"><summary><span>${e.emoji}</span><b>Étape ${e.n}</b><i>›</i></summary><div class="mebody">${SX_AFF.filter(a=>a[0]===e.n).map(a=>`<div class="lgck"><b>${esc(a[1])}</b>${a[2].length?a[2].map(l=>`<div class="mini">${sxA(l[1],esc(l[0]))}</div>`).join(''):'<div class="mini">Pas de source officielle trouvée en ligne : réfère-toi à ton cours.</div>'}</div>`).join('')}</div></details>`).join('')}
 <h2>🔗 Sources officielles</h2><div class="card">
 ${L('https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071154/','Code de procédure pénale (Légifrance)','Pour vérifier un article, et sa version en vigueur à la date voulue.')}
 ${L('https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070719/','Code pénal (Légifrance)')}
 ${L('https://www.legifrance.gouv.fr/jorf/id/JORFSCTA000054470586','Loi n° 2026-651 du 23 juillet 2026 sur la justice criminelle et le respect des victimes','Texte officiel de la réforme.')}
 ${L('https://cnb.avocat.fr/actualite/tout-savoir-sur-la-loi-justice-criminelle','Conseil national des barreaux : tout savoir sur la loi justice criminelle','Résumé clair des changements (CCD, délais, entrées en vigueur).')}
 ${L('https://www.justice.gouv.fr/sites/default/files/2026-07/Annexe%201%20-%20Tableau%20entr%C3%A9e%20en%20vigueur%20des%20dispositions%20p%C3%A9nales%20de%20la%20loi%20JCRV.pdf','Ministère de la Justice : tableau d\'entrée en vigueur (PDF)','Quelle disposition s\'applique à partir de quelle date.')}
 ${L('https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006071154/LEGISCTA000006138099/','Révision et réexamen : CPP, art. 622 à 626-1','Le texte qui encadre les erreurs judiciaires (Machin, Dils, Raddad, Leprince).')}
 ${L('https://www.courdecassation.fr/','Cour de cassation','Arrêts et communiqués.')}
 ${L('https://www.vie-publique.fr/','Vie-publique.fr','Fiches pédagogiques sur la justice et les institutions.')}
 ${L('https://criminocorpus.org/','Criminocorpus','Histoire de la justice, des crimes et des prisons.')}
 </div>
 <div class="card"><b>📣 Les annales de TON examen</b><div class="mini" style="line-height:1.6">Les sujets de ton professeur ne sont en général pas publiés en ligne. Demande-les à ton université, à des camarades de l'année d'avant ou directement au professeur : <i>format, durée, barème, documents autorisés (Code ?)</i>. Dès que tu les as, entraîne-toi dessus après avoir fini les 8 étapes.</div></div>
 <div class="card" style="text-align:center"><div style="font-size:1.1rem;line-height:1.9">🤲 <b>رَبِّ زِدْنِي عِلْمًا</b><div class="mini">« Seigneur, augmente mes connaissances. » (Coran 20:114)</div></div><div style="margin-top:8px;font-size:1.1rem;line-height:1.9"><b>فَإِنَّ مَعَ الْعُسْرِ يُسْرًا</b><div class="mini">« Avec la difficulté vient la facilité. » (Coran 94:6)</div></div><div class="mini" style="margin-top:8px">Tu as tout ce qu'il faut. Je suis fier de toi, quoi qu'il arrive 💖</div></div>
 <div class="row noprint"><button class="btn alt" onclick="go('etudes')">🏠 Retour aux études</button></div></div>`);
 viewResBind();
 if(sub==='actu')setTimeout(()=>{const a=$('#actu');if(a)a.scrollIntoView({behavior:'smooth'});},60);
}
function viewResBind(){document.querySelectorAll('#sxfmt [data-f]').forEach(b=>b.onclick=()=>{S.xfmt=b.dataset.f;save();$('#sxfmt').innerHTML=sxFmtCard();viewResBind();});}

/* ---- rappels ---- */
function fireAt(date,tm,rm){if(rm==='m')return dtm(date,'08:00');const base=dtm(date,tm||'08:00');return new Date(base.getTime()-Number(rm)*60000);}
function famTick(){try{if(!SY.at||loveOpen||document.querySelector('.fm,.lv-ov'))return;const now=Date.now();S.rf=S.rf||{};
 const cand=[];const t=today();
 for(const date of [addD(t,-1),t,addD(t,1)]){evs().forEach(e=>{if(e.rm!==''&&e.rm!==undefined&&occurs(e,date))cand.push({k:'ev',e,date});});}
 tks().forEach(x=>{if(!x.dn&&x.d&&x.rm!==''&&x.rm!==undefined)cand.push({k:'tk',e:x,date:x.d});});
 for(const c of cand){const e=c.e,key=`${c.k}:${e.id}:${c.date}:${e.rm}`;if(S.rf[key])continue;const f=fireAt(c.date,e.tm,e.rm).getTime();const end=(e.tm?dtm(c.date,e.tm).getTime()+3*3600e3:dtm(addD(c.date,1),'00:00').getTime());
  if(S.rs&&S.rs[key]&&now<S.rs[key])continue;if(now<f||now>end&&c.k==='ev')continue;if(c.k==='tk'&&now>end+864e5*3)continue;
  remindPopup(c,key);break;}
 const ks=Object.keys(S.rf);if(ks.length>400){ks.sort().slice(0,200).forEach(k=>delete S.rf[k]);save();}}catch(e){}}
function remindPopup(c,key){const e=c.e;if(loveOpen)return;nfAdd('🔔',`${e.tm?e.tm+' · ':''}${e.t}`,'','r'+key);loveOpen=true;const when=e.tm?`à ${e.tm}`:'aujourd\'hui';
 const d=document.createElement('div');d.className='lv-ov';d.innerHTML=`<div class="lv-card"><div class="lv-ico">🔔</div><h3 style="margin:.2em 0">${c.k==='ev'?'Rendez-vous':'À faire'} · ${fdate(c.date)}${e.tm?' · '+e.tm:''}</h3><p class="lv-msg"><b>${esc(e.t)}</b></p><div>${pchips(e.w)}</div>${e.pl?`<div class="mini">📍 ${esc(e.pl)}</div>`:''}${e.nt?`<div class="mini" style="margin-top:6px">${esc(e.nt)}</div>`:''}<div style="margin-top:12px">${c.k==='tk'?'<button class="btn" id="rdn">✅ C\'est fait</button> ':''}<button class="btn ${c.k==='tk'?'alt':''}" id="rok">👍 Vu</button> <button class="btn alt" id="rsn">⏰ Dans 10 min</button></div></div>`;
 document.body.appendChild(d);try{navigator.vibrate&&navigator.vibrate([200,100,200]);}catch(_){}
 if(window.Notification&&Notification.permission==='granted'&&document.hidden){devNotify('🔔 '+e.t,{body:(e.tm?e.tm+' · ':'')+(e.pl||'')});}
 const close=()=>{loveOpen=false;d.remove();};
 $('#rok',d).onclick=()=>{S.rf[key]=1;save();close();};$('#rsn',d).onclick=()=>{S.rs=S.rs||{};S.rs[key]=Date.now()+600000;save();close();};
 const dn=$('#rdn',d);if(dn)dn.onclick=()=>{S.rf[key]=1;close();toggleTask(e.id);};}
setInterval(famTick,20000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)famTick();});

/* ---------- SYNCHRO ---------- */
const SB={url:'https://ucbzuvvxlyunmevssfji.supabase.co',key:'sb_publishable_o5-12DDt7fx7eR4lsWQOuA_hP7s7V0S'};
const SH=['fam','ev','tk'],EXC=['fam','ev','tk','_h','dl','_ph','pt','rf','rs','bk','ut','nf','nfd','inst'];
let SY=(()=>{try{return JSON.parse(localStorage.getItem('gp-sb')||'null')||{};}catch(e){return{};}})();
SY.st=SY.at?'idle':'out';SY.err='';
function sySave(){try{localStorage.setItem('gp-sb',JSON.stringify({at:SY.at,rt:SY.rt,exp:SY.exp,uid:SY.uid,email:SY.email,fid:SY.fid,code:SY.code,fname:SY.fname,last:SY.last,bound:SY.bound}));}catch(e){}}
function hsh(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return h.toString(36);}
function cj(o){if(Array.isArray(o))return '['+o.map(cj).join(',')+']';if(o&&typeof o==='object')return '{'+Object.keys(o).sort().map(k=>JSON.stringify(k)+':'+cj(o[k])).join(',')+'}';return JSON.stringify(o===undefined?null:o);}
const sharedDoc=()=>({fam:S.fam||[],ev:S.ev||[],tk:S.tk||[],dl:S.dl||{}});
const sharedKey=d=>{d=d||{};return cj({fam:[...(d.fam||[])].sort((a,b)=>a.id<b.id?-1:1),ev:[...(d.ev||[])].sort((a,b)=>a.id<b.id?-1:1),tk:[...(d.tk||[])].sort((a,b)=>a.id<b.id?-1:1),dl:d.dl||{}});};
function personalDoc(){const o={};Object.keys(S).forEach(k=>{if(!EXC.includes(k))o[k]=S[k];});return o;}
/* repère les éléments modifiés / supprimés (sans toucher au reste de l'appli) */
function stampAll(){let ch=false;const first=!S._h;const H=S._h=S._h||{};S.dl=S.dl||{};const seen={},now=Date.now();
 SH.forEach(k=>{(S[k]||[]).forEach(it=>{if(!it||!it.id)return;seen[it.id]=1;const {_u,...rest}=it;const h=hsh(JSON.stringify(rest));
  if(H[it.id]!==h){H[it.id]=h;it._u=(first&&_u)?_u:(first?(S.ut||1):now);ch=true;}});});
 Object.keys(H).forEach(id=>{if(!seen[id]){delete H[id];S.dl[id]=now;ch=true;}});
 const old=now-90*DAY;Object.keys(S.dl).forEach(id=>{if(S.dl[id]<old)delete S.dl[id];});
 const ph=hsh(cj(personalDoc()));
 if(S._ph===undefined){S._ph=ph;S.pt=S.pt||0;}else if(S._ph!==ph){S._ph=ph;S.pt=now;ch=true;}
 return ch;}
/* fusion de la partie partagée : le plus récent gagne, élément par élément */
function mergeShared(rem){rem=rem||{};const H=S._h=S._h||{};S.dl=S.dl||{};const rdl=rem.dl||{};
 Object.keys(rdl).forEach(id=>{if(!(S.dl[id]>=rdl[id]))S.dl[id]=rdl[id];});
 let changed=false;
 SH.forEach(k=>{const m=new Map();(S[k]||[]).forEach(x=>m.set(x.id,x));
  (rem[k]||[]).forEach(r=>{const l=m.get(r.id);if(!l&&k!=='fam'&&r.by&&r.by!==S.me&&!(S.dl[r.id]>=(r._u||0)))SY.news.push(Object.assign({_k:k},r));if(!l||(r._u||0)>(l._u||0))m.set(r.id,r);});
  const out=[];m.forEach((v,id)=>{if(S.dl[id]&&S.dl[id]>=(v._u||0)){delete H[id];return;}out.push(v);});
  if(cj(out)!==cj(S[k]||[])){changed=true;S[k]=out;}
  out.forEach(it=>{const {_u,...rest}=it;H[it.id]=hsh(JSON.stringify(rest));});});
 return changed;}
/* ---- réseau ---- */
const FR_ERR=[['Invalid login credentials','E-mail ou mot de passe incorrect.'],['already registered','Ce mail a déjà un compte : choisis « Me connecter ».'],['at least 6','Mot de passe : 6 caractères minimum.'],['email rate limit','Le serveur a déjà envoyé trop de mails de confirmation. Réessaie dans environ 1 h, ou connecte-toi si ton compte existe déjà.'],['rate limit','Trop d’essais. Réessaie dans quelques minutes.'],['valid email','Cette adresse e-mail n’est pas valide.'],['Email not confirmed','Mail non confirmé : vérifie ta boîte mail.'],['Code inconnu','Code inconnu : vérifie les lettres et chiffres.'],['Signups not allowed','Les inscriptions sont désactivées sur le serveur.']];
const frErr=m=>{m=String(m||'');const f=FR_ERR.find(x=>m.includes(x[0]));return f?f[1]:m;};
async function sbReq(path,o={}){const h={apikey:SB.key,'Content-Type':'application/json',...(o.h||{})};if(o.auth!==false&&SY.at)h.Authorization='Bearer '+SY.at;
 let r;try{r=await fetch(SB.url+path,{method:o.m||'GET',headers:h,body:o.b!==undefined?JSON.stringify(o.b):undefined});}catch(e){const x=new Error('Pas de connexion internet');x.net=1;throw x;}
 const t=await r.text();let j=null;try{j=t?JSON.parse(t):null;}catch(e){}
 if(!r.ok){const x=new Error((j&&(j.msg||j.message||j.error_description||j.error))||('Erreur '+r.status));x.status=r.status;x.auth=r.status===401;throw x;}
 return j;}
function sbSession(j){SY.at=j.access_token;SY.rt=j.refresh_token;SY.exp=Date.now()+(j.expires_in||3600)*1000;if(j.user){SY.uid=j.user.id;SY.email=j.user.email||SY.email;}sySave();}
async function syRefresh(){if(!SY.rt)throw Object.assign(new Error('Session expirée'),{auth:1,out:1});
 try{sbSession(await sbReq('/auth/v1/token?grant_type=refresh_token',{m:'POST',auth:false,b:{refresh_token:SY.rt}}));}
 catch(e){if(e.net)throw e;SY.at='';SY.rt='';sySave();e.out=1;throw e;}}
async function sbData(path,o){if(SY.exp&&SY.exp-60000<Date.now())await syRefresh();
 try{return await sbReq(path,o);}catch(e){if(e.auth&&!e.net){await syRefresh();return await sbReq(path,o);}throw e;}}
async function syLoadFamily(){const r=await sbData('/rest/v1/members?select=family_id,families(name,code)&user_id=eq.'+SY.uid);
 if(r&&r[0]){SY.fid=r[0].family_id;SY.code=r[0].families&&r[0].families.code;SY.fname=r[0].families&&r[0].families.name;}else{SY.fid=SY.code=SY.fname='';}sySave();setTimeout(()=>{try{chTick();}catch(e){}},400);}
async function syAuth(mode,email,pw){const p=mode==='up'?'/auth/v1/signup':'/auth/v1/token?grant_type=password';
 const j=await sbReq(p,{m:'POST',auth:false,b:{email,password:pw}});
 if(!j.access_token){const e=new Error('Compte créé. Confirme ton adresse via le mail reçu, puis connecte-toi.');e.info=1;throw e;}
 const prevB=SY.bound;sbSession(j);SY.email=email;SY.st='idle';if(prevB&&prevB!==SY.uid)await resetUserData();sySave();await syLoadFamily();}
/* ---- synchronisation ---- */
SY.news=[];let SYBUSY=false,SYAGAIN=false,syT=null,SYCH=false;
function syncSoon(){if(!SY.at)return;clearTimeout(syT);syT=setTimeout(()=>syncNow(),2500);}
async function syFamily(){for(let i=0;i<4;i++){
  const r=await sbData('/rest/v1/family_data?select=data,updated_at&family_id=eq.'+SY.fid);const row=r&&r[0];if(!row)throw new Error('Famille introuvable');
  if(mergeShared(row.data)){SYCH=true;flush();}
  if(sharedKey(sharedDoc())===sharedKey(row.data))return;
  const res=await sbData('/rest/v1/family_data?family_id=eq.'+SY.fid+'&updated_at=eq.'+encodeURIComponent(row.updated_at),{m:'PATCH',h:{Prefer:'return=representation'},b:{data:sharedDoc(),updated_at:new Date().toISOString()}});
  if(res&&res.length)return;}}
const isO=x=>x&&typeof x==='object'&&!Array.isArray(x);
const subst=d=>!!(d&&(d.xp>0||d.exam||Object.keys(d.items||{}).length||Object.keys(d.pg||{}).length));
/* fusion à 3 voies : on garde ce qui a changé de chaque côté depuis la dernière synchro */
function merge3(b,l,r,lw,k){const cl=cj(l),cr=cj(r);if(cl===cr)return l;const cb=cj(b);if(cb===cl)return r;if(cb===cr)return l;
 if(isO(l)&&isO(r)){const o={},bo=isO(b)?b:{};new Set([...Object.keys(l),...Object.keys(r)]).forEach(x=>{const il=x in l,ir=x in r;
  if(il&&ir)o[x]=merge3(bo[x],l[x],r[x],lw,x);
  else if(il){if(!(x in bo)||cj(bo[x])!==cj(l[x]))o[x]=l[x];}
  else{if(!(x in bo)||cj(bo[x])!==cj(r[x]))o[x]=r[x];}});return o;}
 if(typeof l==='number'&&typeof r==='number')return Math.max(l,r);
 if(k==='last'&&typeof l==='string'&&typeof r==='string')return l>r?l:r;
 return lw?l:r;}
async function syUser(){for(let i=0;i<4;i++){
 const r=await sbData('/rest/v1/user_data?select=data,updated_at&user_id=eq.'+SY.uid);const row=r&&r[0];const per=personalDoc();
 if(!row||!row.data||!row.data.d){await sbData('/rest/v1/user_data',{m:'POST',h:{Prefer:'resolution=merge-duplicates,return=minimal'},b:{user_id:SY.uid,data:{pt:S.pt||0,d:per},updated_at:new Date().toISOString()}});await IDB.setK('syb',per);return;}
 const rd=row.data.d,rp=row.data.pt||0,lp=S.pt||0,first=SY.bound!==SY.uid;
 const base=first?undefined:await IDB.getK('syb');
 const lw=(first&&!subst(per))?false:lp>rp;
 const merged=merge3(base,per,rd,lw,'');
 if(cj(merged)!==cj(per)){try{localStorage.setItem('gp-pre-sync',JSON.stringify(S));}catch(e){}Object.assign(S,merged);if(S.stl!=='h'){S.stl='o';S.nost=1;}SYCH=true;}
 S.pt=Math.max(lp,rp);S._ph=hsh(cj(personalDoc()));if(SYCH)flush();
 if(cj(merged)===cj(rd)){await IDB.setK('syb',merged);return;}
 const res=await sbData('/rest/v1/user_data?user_id=eq.'+SY.uid+'&updated_at=eq.'+encodeURIComponent(row.updated_at),{m:'PATCH',h:{Prefer:'return=representation'},b:{data:{pt:S.pt,d:merged},updated_at:new Date().toISOString()}});
 if(res&&res.length){await IDB.setK('syb',merged);return;}}}
async function sha256(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function syncNow(){if(!SY.at||SYBUSY){if(SYBUSY)SYAGAIN=true;return;}
 SYBUSY=true;SY.st='sync';syUI();SYCH=false;SY.news=[];const first0=SY.bound!==SY.uid;
 try{try{clearTimeout(st);flush();}catch(e){}
  if(SY.fid)await syFamily();
  await syUser();
  admCheck();SY.last=Date.now();SY.err='';SY.st='ok';SY.bound=SY.uid;sySave();if(SY.news.length&&!first0){const n=SY.news;n.forEach(x=>nfAdd(x._k==='tk'?'✅':'📅',`${x.by} a ajouté ${x._k==='tk'?'une tâche':'un rendez-vous'} : ${x.t}`,x._k==='tk'?'tasks':'cal','n'+x.id));toast(n.length===1?`${n[0].by} a ajouté : ${n[0].t}`:`${n.length} nouveautés ajoutées par ta famille`,4500);}SY.news=[];}
 catch(e){SY.err=frErr(e.message);SY.st=e.net?'off':'err';if(e.out){SY.st='out';SY.err='Session expirée : reconnecte-toi.';}}
 SYBUSY=false;syUI();
 if(SYCH){applyPrefs();langApply();hud();syRerender();}
 if(SYAGAIN){SYAGAIN=false;syncSoon();}}
function syRerender(){if(document.querySelector('.lv-ov'))return;const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&$('#app').contains(a))return;
 const h=location.hash.slice(1).split('/')[0];if(['sync','data','prayer','spirit','exam','review','art','e','chat'].includes(h))return;const y=window.scrollY;route();window.scrollTo(0,y);}
const syStatTxt=()=>{const ar=isAr(),dt=SY.last?new Date(SY.last).toLocaleString(ar?'ar-MA-u-nu-latn':'fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):(ar?'لم تتم بعد':'pas encore');
 const st=ar?{ok:'✅ محدّث',sync:'🔄 جارٍ المزامنة…',off:'📴 بدون اتصال',err:'⚠️ '+trS(SY.err),idle:'…',out:''}:{ok:'✅ À jour',sync:'🔄 Synchronisation…',off:'📴 Hors connexion',err:'⚠️ '+SY.err,idle:'…',out:''};
 return (st[SY.st]||'')+(ar?' · آخر مزامنة : ':' · dernière synchro : ')+dt;};
function syUI(){try{admVis();}catch(e){}const b=$('#pSync');if(b){const m={out:['☁️','Synchronisation : non connecté'],idle:['☁️','Synchronisation'],sync:['🔄','Synchronisation en cours…'],ok:['✅','Synchronisé'],off:['📴','Hors connexion : se synchronisera plus tard'],err:['⚠️','Problème de synchronisation']}[SY.st]||['☁️',''];b.textContent='👤';b.dataset.st=(SY.st==='sync'||SY.st==='off'||SY.st==='err')?m[0]:'';b.title='Mon compte · '+m[1];b.classList.toggle('dim',SY.st==='out');try{hdAv();}catch(e){}}
 const t=$('#syStat');if(t)t.textContent=syStatTxt();}
window.addEventListener('online',()=>syncNow());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncNow();});
setInterval(()=>{if(!document.hidden)syncNow();},45000);
/* ---- écran ---- */
let syMode='in';
function viewSync(){setApp(`<div class="banner" style="--c:#0277bd"><h1>☁️ Synchronisation</h1><div class="mini" style="color:#fff;opacity:.9">Retrouve tout sur ton téléphone et ton PC</div></div><div id="syBody"></div>`);syFill();}
function syFill(){const d=$('#syBody');if(!d)return;
 if(!SY.at){d.innerHTML=`<div class="card" style="margin:12px 0"><b>Ne perds plus rien, et partage avec ta famille</b><div class="mini">Avec un compte, ta progression, ton agenda, tes tâches et ta famille se retrouvent sur tous tes appareils. Les rendez-vous et tâches sont partagés avec les personnes de ta famille que tu invites.</div>
  <div class="row" style="margin-top:10px"><button class="btn ${syMode==='in'?'':'alt'}" id="syIn">Me connecter</button><button class="btn ${syMode==='up'?'':'alt'}" id="syUp">Créer mon compte</button></div>
  ${syMode==='up'?'<input class="srch" id="syN" placeholder="Ton prénom (ex : Khalid)" autocomplete="given-name" style="margin-top:10px"><label style="display:flex;gap:8px;align-items:flex-start;margin-top:10px;font-size:.92em;text-align:start"><input type="checkbox" id="syH" style="margin-top:4px"><span>Je suis Hajar (étudiante en droit)<br><span class="mini">Si tu coches, la partie études (cours, quiz, codes) est affichée. Sinon, elle reste cachée.</span><input class="srch" id="syHc" inputmode="numeric" placeholder="Code de vérification" style="margin-top:6px;display:none"></span></label>':''}<input class="srch" id="syE" type="email" autocomplete="email" autocapitalize="none" autocorrect="off" placeholder="Adresse e-mail" style="margin-top:10px"><input class="srch" id="syP" type="password" autocomplete="${syMode==='up'?'new-password':'current-password'}" placeholder="Mot de passe (6 caractères minimum)" style="margin-top:8px">
  <div class="mini" id="syM" style="margin-top:8px;color:#c62828">${esc(SY.err||'')}</div><button class="btn" id="syGo" style="margin-top:8px">${syMode==='up'?'Créer mon compte':'Me connecter'}</button>${syMode==='in'?'<div class="mini" style="margin-top:10px"><a href="#" id="syFg">Mot de passe oublié ?</a></div>':''}</div>`;
  $('#syIn').onclick=()=>{syMode='in';SY.err='';syFill();};$('#syUp').onclick=()=>{syMode='up';SY.err='';syFill();};
  const go1=async()=>{const e=$('#syE').value.trim(),p=$('#syP').value;if(!e||!p){$('#syM').textContent='Écris ton e-mail et ton mot de passe.';return;}
   $('#syGo').disabled=true;$('#syM').style.color='#666';$('#syM').textContent='Un instant…';
   try{const nm=syMode==='up'?($('#syN').value.trim()):'';const hj=syMode==='up'&&$('#syH')&&$('#syH').checked;if(hj&&(await sha256(($('#syHc').value||'').trim()))!==HJH){$('#syGo').disabled=false;$('#syM').style.color='#c62828';$('#syM').textContent='Code de vérification incorrect.';return;}if(syMode==='up'&&!nm){$('#syGo').disabled=false;$('#syM').textContent='Écris ton prénom.';return;}await syAuth(syMode,e,p);if(nm){S.me=nm;}if(syMode==='up'){S.stl=hj?'h':'o';S.nost=hj?0:1;S.nsa=0;}save();langApply();renderTabs((location.hash.slice(1).split('/')[0])||'');hud();SY.err='';toast('Connecté ✅');document.body.classList.remove('gate');syUI();syncNow().then(()=>{if(!SY.fid&&['','gate','sync'].includes(location.hash.slice(1)))go('fam');});route();}catch(x){$('#syGo').disabled=false;$('#syM').style.color=x.info?'#2e7d32':'#c62828';$('#syM').textContent=x.net?x.message:frErr(x.message);}};
  if($('#syH'))$('#syH').onchange=()=>{$('#syHc').style.display=$('#syH').checked?'block':'none';};
  const fg=$('#syFg');if(fg)fg.onclick=async ev=>{ev.preventDefault();const e=$('#syE').value.trim(),m=$('#syM');if(!e){m.style.color='#c62828';m.textContent='Écris d\'abord ton adresse e-mail.';return;}
   try{m.style.color='#666';m.textContent='Un instant…';await sbReq('/auth/v1/recover?redirect_to='+encodeURIComponent(location.origin+location.pathname),{m:'POST',auth:false,b:{email:e}});m.style.color='#2e7d32';m.textContent='Si ce compte existe, un mail vient d\'être envoyé : ouvre le lien depuis ton téléphone.';}catch(x){m.style.color='#c62828';m.textContent=x.net?x.message:frErr(x.message);}};
  $('#syGo').onclick=go1;$('#syP').onkeydown=e=>{if(e.key==='Enter')go1();};return;}
 let h=`<div class="card" style="margin:12px 0"><b>Connecté : ${esc(SY.email||'')}</b><div class="mini" id="syStat" data-nt>${esc(syStatTxt())}</div><div class="row" style="margin-top:8px"><input class="srch" id="syNm" placeholder="Ton prénom" value="${esc(S.me||'')}" style="flex:1;min-width:120px"><button class="btn alt" id="syNs">OK</button></div><div class="row" style="margin-top:8px"><button class="btn" id="syNow">🔄 Synchroniser maintenant</button><button class="btn alt" id="syOut">Me déconnecter</button></div></div>`;
 if(!SY.fid)h+=`<div class="card" style="margin:12px 0"><b>👪 Ta famille</b><div class="mini">La première personne crée la famille et reçoit un code. L’autre personne (toi ou ton mari) entre ce code sur son appareil.</div>
  <input class="srch" id="syFn" placeholder="Nom de la famille" value="Notre famille" style="margin-top:10px"><button class="btn" id="syCr" style="margin-top:8px">➕ Créer la famille</button>
  <div class="mini" style="margin-top:14px"><b>Ou rejoindre une famille existante :</b></div><input class="srch" id="syCd" placeholder="Code reçu (ex : 7F3A9C21BD)" autocapitalize="characters" style="margin-top:6px"><button class="btn alt" id="syJn" style="margin-top:8px">🔗 Rejoindre avec le code</button><div class="mini" id="syM2" style="margin-top:8px;color:#c62828"></div></div>`;
 else h+=`<div class="card" style="margin:12px 0"><b>👪 ${esc(SY.fname||'Ma famille')}</b><div class="mini">Code à donner pour inviter quelqu’un :</div><div style="font:700 1.6rem/1.2 monospace;letter-spacing:.12em;margin:8px 0;user-select:all">${esc(SY.code||'')}</div>
  <div class="row"><button class="btn" id="syCp">📋 Copier le code</button><button class="btn alt" id="syShare">📤 Envoyer</button></div><div class="mini" style="margin-top:10px"><b>Partagé dans la famille :</b> personnes, rendez-vous et tâches.<br><b>Reste personnel :</b> tes cours, ta progression, tes réglages (mais retrouvés sur tous tes appareils).</div>
  <div class="mini" style="margin-top:12px"><button class="btn alt" id="syLv">Quitter cette famille</button></div></div>`;
 h+=`<div class="mini" style="margin:6px 0 14px">Ça marche aussi sans internet : tout est gardé sur l’appareil et se met à jour dès que la connexion revient.</div>`;
 d.innerHTML=h;
 $('#syNs').onclick=()=>{S.me=$('#syNm').value.trim();save();toast('Prénom enregistré ✅');};$('#syNow').onclick=()=>{syncNow();toast('Synchronisation…');};
 $('#syOut').onclick=()=>doLogout();
 const err=m=>{const e=$('#syM2');if(e)e.textContent=m;};
 if(!SY.fid){$('#syCr').onclick=async()=>{$('#syCr').disabled=true;try{const r=await sbData('/rest/v1/rpc/create_family',{m:'POST',b:{n:$('#syFn').value}});SY.fid=r.id;SY.code=r.code;SY.fname=r.name;sySave();toast('Famille créée ✅');await syncNow();viewSync();}catch(x){$('#syCr').disabled=false;err(frErr(x.message));}};
  $('#syJn').onclick=async()=>{const c=$('#syCd').value.trim();if(!c){err('Entre le code.');return;}$('#syJn').disabled=true;try{const r=await sbData('/rest/v1/rpc/join_family',{m:'POST',b:{c}});SY.fid=r.id;SY.code=r.code;SY.fname=r.name;sySave();toast('Famille rejointe ✅');await syncNow();viewSync();}catch(x){$('#syJn').disabled=false;err(frErr(x.message));}};}
 else{$('#syCp').onclick=()=>{try{navigator.clipboard.writeText(SY.code);toast('Code copié');}catch(e){toast(SY.code);}};
  $('#syShare').onclick=famShare;
  $('#syLv').onclick=async()=>{if(!confirm('Quitter cette famille ? Les données restent sur cet appareil mais ne seront plus partagées.'))return;try{await sbData('/rest/v1/members?user_id=eq.'+SY.uid+'&family_id=eq.'+SY.fid,{m:'DELETE'});SY.fid=SY.code=SY.fname='';sySave();viewSync();}catch(x){toast(frErr(x.message));}};}}
function syPromo(){if(SY.at||(S.syp&&S.syp>Date.now()))return;const a=$('#app');if(!a||$('#syp'))return;const d=document.createElement('div');d.id='syp';d.className='card';d.style.margin='12px 0';
 d.innerHTML=`<b>☁️ Retrouve tout sur ton téléphone et ton PC</b><div class="mini">Crée un compte gratuit : tes données ne se perdent plus et se partagent avec ta famille.</div><div class="row" style="margin-top:8px"><button class="btn" id="sypo">Configurer</button><button class="btn alt" id="sypl">Plus tard</button></div>`;
 a.insertBefore(d,a.children[1]||null);$('#sypo').onclick=()=>go('sync');$('#sypl').onclick=()=>{S.syp=Date.now()+7*DAY;save();d.remove();};}
/* ---------- ACCUEIL CONNEXION, NOTIFICATIONS, REJOINDRE ---------- */
function viewGate(){setApp(`<div style="max-width:440px;margin:18px auto 0;text-align:center"><div style="font-size:3.2rem">🏡</div><h1 style="margin:.2em 0">Ma famille</h1><div class="mini" style="margin-bottom:6px">Agenda, tâches, prière et famille : tout au même endroit.</div></div><div style="max-width:440px;margin:0 auto"><div style="text-align:center;margin:8px 0 4px"><button class="btn alt" id="hlpGo" type="button">❓ Aide : comment ça marche ?</button></div>${instCard(1)}</div><div id="syBody" style="max-width:440px;margin:0 auto"></div>`);syFill();instBind();const hg=$('#hlpGo');if(hg)hg.onclick=()=>openHelp();}
function famInvText(){const u=location.origin+location.pathname;return isAr()?`انضم إلى عائلتنا في التطبيق: افتح ${u} ثم أنشئ حسابك، وفي تبويب «العائلة» أدخل الرمز ${SY.code}`:`Rejoins notre famille sur l’appli : ouvre ${u}, crée ton compte, puis dans l’onglet « Famille » entre le code ${SY.code}`;}
function famShare(){const t=famInvText();if(navigator.share)navigator.share({text:t}).catch(()=>{});else{try{navigator.clipboard.writeText(t);toast('Message copié');}catch(e){}}}
function famCard(){if(SY.fid)return `<div class="card" style="margin:10px 0"><b>👪 ${esc(SY.fname||'Ma famille')}</b><div class="mini">Code à donner pour inviter quelqu’un :</div><div style="font:700 1.5rem/1.2 monospace;letter-spacing:.12em;margin:6px 0;user-select:all" data-nt>${esc(SY.code||'')}</div><div class="row"><button class="btn alt" id="fcCp">📋 Copier le code</button><button class="btn alt" id="fcSh">📤 Envoyer</button></div></div>`;
 return `<div class="plan" style="border-color:#8e24aa"><h3>👪 Rejoins ta famille</h3><div class="mini">Entre le code reçu : tu retrouves tout de suite ta famille, ses rendez-vous et ses tâches.</div><div class="row" style="margin-top:8px"><input class="srch" id="fjCd" placeholder="Code famille" autocapitalize="characters" autocomplete="off" style="flex:1;min-width:150px;font-family:monospace;letter-spacing:.1em"><button class="btn" id="fjGo">Rejoindre</button></div><div class="mini" id="fjM" style="color:#c62828"></div>
 <details style="margin-top:8px"><summary class="mini">Pas de code ? Créer une nouvelle famille</summary><div class="row" style="margin-top:8px"><input class="srch" id="fcNm" value="Notre famille" style="flex:1;min-width:150px"><button class="btn alt" id="fcGo">Créer</button></div></details></div>`;}
function famCardBind(){const cp=$('#fcCp');if(cp){cp.onclick=()=>{try{navigator.clipboard.writeText(SY.code);toast('Code copié');}catch(e){toast(SY.code);}};$('#fcSh').onclick=famShare;return;}
 const err=m=>{const e=$('#fjM');if(e)e.textContent=m;};const go1=$('#fjGo');if(!go1)return;
 const join=async()=>{const c=($('#fjCd').value||'').trim();if(!c){err('Entre le code.');return;}go1.disabled=true;err('');try{const r=await sbData('/rest/v1/rpc/join_family',{m:'POST',b:{c}});SY.fid=r.id;SY.code=r.code;SY.fname=r.name;sySave();toast('Famille rejointe ✅');await syncNow();viewFam();}catch(x){go1.disabled=false;err(frErr(x.message));}};
 go1.onclick=join;$('#fjCd').onkeydown=e=>{if(e.key==='Enter')join();};
 $('#fcGo').onclick=async()=>{$('#fcGo').disabled=true;try{const r=await sbData('/rest/v1/rpc/create_family',{m:'POST',b:{n:$('#fcNm').value}});SY.fid=r.id;SY.code=r.code;SY.fname=r.name;sySave();toast('Famille créée ✅');await syncNow();viewFam();}catch(x){$('#fcGo').disabled=false;err(frErr(x.message));}};}
/* notifications */
function devNotify(t,o){o=Object.assign({icon:'icons/icon-192.png',badge:'icons/badge-96.png'},o||{});try{if(navigator.serviceWorker&&navigator.serviceWorker.ready){navigator.serviceWorker.ready.then(r=>r.showNotification(t,o)).catch(()=>{try{new Notification(t,o);}catch(_){}});return;}}catch(_){}try{new Notification(t,o);}catch(_){}}

function nfList(){S.nf=S.nf||[];return S.nf;}
function nfBadge(){const n=nfList().filter(x=>!x.r).length;const b=$('#nfB');if(b){b.textContent=n>9?'9+':n;b.style.display=n?'block':'none';}}
function nfAdd(ic,t,go,key,tag){const l=nfList();if(key&&l.some(x=>x.key===key))return;l.unshift({ts:Date.now(),ic,t,go:go||'',r:0,key:key||''});if(l.length>60)l.length=60;save();nfBadge();
 try{if(window.Notification&&Notification.permission==='granted'&&document.hidden)devNotify(trS(ic+' '+t),{tag:tag||key||undefined});}catch(e){}}
function nfDaily(){try{if(!S.me&&!SY.at)return;const t=today();if(S.nfd===t)return;S.nfd=t;const a=itemsOn(t).filter(x=>x.k!=='bd'),tm=itemsOn(addD(t,1)).filter(x=>x.k!=='bd'),od=overdue().length;
 if(a.length)nfAdd('📅',`Aujourd'hui : ${a.length} à faire`,'', 'd'+t);
 if(od)nfAdd('⚠️',`${od} en retard`,'tasks','o'+t);
 if(tm.length)nfAdd('🌙',`Demain : ${tm.length} à prévoir`,'cal','m'+t);
 itemsOn(t).filter(x=>x.k==='bd').forEach(x=>nfAdd('🎂',String(x.t||''),'', 'b'+t+x.t));save();}catch(e){}}
function nfHelp(){const ua=navigator.userAgent,ios=/iphone|ipad/i.test(ua),sa=matchMedia('(display-mode: standalone)').matches||navigator.standalone,cri=/crios|fxios|edgios|opios/i.test(ua);
 const card=t=>'<div class="card mini" style="margin-top:10px">'+t+'</div>';
 if(ios&&!sa)return card('📵 '+(cri?'Sur iPhone, les notifications marchent seulement si l\'appli est ajoutée depuis Safari : ouvre ce lien dans Safari, touche Partager puis « Sur l\'écran d\'accueil », puis ouvre l\'appli depuis la nouvelle icône et reviens ici.':'Sur iPhone, installe d\'abord l\'appli : touche Partager puis « Sur l\'écran d\'accueil », rouvre-la depuis l\'icône, puis reviens ici.'));
 if(!window.Notification)return card('📵 '+(ios?'Ton iPhone doit avoir iOS 16.4 ou plus récent pour recevoir les notifications (Réglages → Général → Informations).':'Ce navigateur ne permet pas les notifications. Ouvre l\'appli dans Chrome, ou installe-la sur l\'écran d\'accueil.'));
 if(Notification.permission==='denied')return card(ios?'🚫 Les notifications sont bloquées pour cette appli. Pour les autoriser : Réglages de l\'iPhone → Notifications → Ma famille → Autoriser les notifications. Puis rouvre cette fenêtre.':'🚫 Les notifications sont bloquées pour cette appli. Pour les autoriser : appui long sur l\'icône de l\'appli → Infos de l\'appli → Notifications → Autoriser. (Ou dans Chrome : ⋮ → Paramètres → Paramètres des sites → Notifications → autoriser ce site.) Puis rouvre cette fenêtre.');
 return '';}
function openNotifs(){if($('#nfo'))return;const d=document.createElement('div');d.className='lv-ov';d.id='nfo';
 const l=nfList(),loc=isAr()?'ar-MA-u-nu-latn':'fr-FR';
 const perm=window.Notification&&Notification.permission==='default';
 d.innerHTML=`<div class="lv-card pf" style="text-align:start"><h3 style="margin:0 0 8px">🔔 Notifications</h3>${l.length?l.map((x,i)=>`<div class="nfi ${x.r?'':'nfu'}" data-i="${i}"><span>${x.ic}</span><div><b>${esc(x.t)}</b><span class="mini" data-nt>${esc(new Date(x.ts).toLocaleString(loc,{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))}</span></div></div>`).join(''):'<div class="mini">Aucune notification pour l\'instant.</div>'}
 ${nfHelp()}<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">${perm?'<button class="btn" id="nfPm">🔔 Activer sur le téléphone</button>':''}${l.length?'<button class="btn alt" id="nfClr">Vider</button>':''}<span style="flex:1"></span><button class="btn" id="nfX">Fermer</button></div></div>`;
 document.body.appendChild(d);const close=()=>{d.remove();};d.onclick=e=>{if(e.target===d)close();};$('#nfX',d).onclick=close;
 d.querySelectorAll('.nfi').forEach(el=>el.onclick=()=>{const it=l[+el.dataset.i];close();if(it&&it.go)go(it.go);});
 const c=$('#nfClr',d);if(c)c.onclick=()=>{S.nf=[];save();nfBadge();close();};
 const pm=$('#nfPm',d);if(pm)pm.onclick=()=>{Notification.requestPermission().then(p=>{S.pn=p==='granted'?1:0;save();if(p==='granted')pushInit(1);toast(p==='granted'?'Notifications activées ✅':'Notifications refusées');close();});};
 l.forEach(x=>x.r=1);save();nfBadge();}
/* ---- aide : guide FR / AR ---- */
const HELP={"fr": "<div class=\"chips\"><button type=\"button\" class=\"chip\" data-go=\"h-fr-s1\"><b>1<\/b>Installer<\/button><button type=\"button\" class=\"chip\" data-go=\"h-fr-s2\"><b>2<\/b>Créer mon compte<\/button><button type=\"button\" class=\"chip\" data-go=\"h-fr-s3\"><b>3<\/b>Rejoindre la famille<\/button><button type=\"button\" class=\"chip\" data-go=\"h-fr-s4\"><b>4<\/b>Notifications<\/button><button type=\"button\" class=\"chip\" data-go=\"h-fr-s5\">Utiliser l’appli<\/button><button type=\"button\" class=\"chip\" data-go=\"h-fr-s6\">Si ça ne marche pas<\/button><\/div><section id=\"h-fr-s1\" class=\"sec \"><header><span class=\"num\">1<\/span><h2>Installer l’appli sur ton téléphone<\/h2><\/header><p class=\"intro\">Installe l’appli pour l’avoir sur ton écran d’accueil, comme WhatsApp. C’est nécessaire pour recevoir les notifications.<\/p><div class=\"plat\"><h4><span>🤖<\/span>Android (Samsung, Xiaomi, Oppo…)<\/h4><ol class=\"steps\"><li><span>Ouvre le lien de l’appli avec <b>Chrome<\/b>.<\/span><\/li><li><span>Appuie sur le bouton <span class=\"hpill\">📲 Installer<\/span>. Si tu ne le vois pas : appuie sur <span class=\"ic\">⋮<\/span> (en haut à droite), puis sur <b>Installer l’application<\/b>.<\/span><\/li><li><span>Appuie sur <b>Installer<\/b>. L’icône de l’appli apparaît sur ton écran d’accueil.<\/span><\/li><\/ol><\/div><p class=\"note info\">Si Android affiche un message de sécurité, choisis <b>Installer quand même<\/b>. L’appli est sûre.<\/p><div class=\"plat\"><h4><span>🍎<\/span>iPhone<\/h4><ol class=\"steps\"><li><span>Ouvre le lien de l’appli avec <b>Safari<\/b> (pas Chrome).<\/span><\/li><li><span>Appuie sur <b>Partager<\/b> (le carré avec une flèche vers le haut).<\/span><\/li><li><span>Descends dans la liste, appuie sur <b>Sur l’écran d’accueil<\/b>, puis sur <b>Ajouter<\/b>.<\/span><\/li><\/ol><\/div><p class=\"note info\">Sur iPhone, il faut iOS 16.4 ou plus récent pour recevoir les notifications.<\/p><\/section><section id=\"h-fr-s2\" class=\"sec \"><header><span class=\"num\">2<\/span><h2>Créer ton compte<\/h2><\/header><p class=\"intro\">Le compte garde tes données sur tous tes appareils et te permet de parler avec ta famille.<\/p><ol class=\"steps\"><li><span>Ouvre l’appli depuis son icône et appuie sur <span class=\"hpill\">Créer mon compte<\/span>.<\/span><\/li><li><span>Écris ton <b>prénom<\/b>, par exemple « Maman ».<\/span><\/li><li><span>Écris ton <b>adresse e-mail<\/b> et choisis un <b>mot de passe<\/b> (6 caractères au minimum). Note-le dans un endroit sûr.<\/span><\/li><li><span>Laisse la case « Je suis Hajar » <b>vide<\/b>. Elle est réservée à Hajar.<\/span><\/li><li><span>Appuie sur <span class=\"hpill\">Créer mon compte<\/span>.<\/span><\/li><\/ol><p class=\"note tip\">Si on te demande de confirmer ton e-mail, ouvre le mail reçu et appuie sur le lien. Reviens ensuite dans l’appli et appuie sur <span class=\"hpill\">Me connecter<\/span>.<\/p><p class=\"note tip\">Les fois suivantes, appuie sur <span class=\"hpill\">Me connecter<\/span> avec le même e-mail et le même mot de passe.<\/p><\/section><section id=\"h-fr-s3\" class=\"sec \"><header><span class=\"num\">3<\/span><h2>Rejoindre ta famille<\/h2><\/header><p class=\"intro\">Pour voir l’agenda, les tâches et les discussions de la famille, il faut entrer le code famille.<\/p><ol class=\"steps\"><li><span>Demande le <b>code famille<\/b> à Khalid ou à Hajar.<\/span><\/li><li><span>Dans l’appli, appuie sur l’onglet <b>Famille<\/b> (en bas à droite).<\/span><\/li><li><span>Appuie sur <span class=\"hpill\">Rejoindre avec le code<\/span>, écris le code, puis appuie sur <span class=\"hpill\">Rejoindre<\/span>.<\/span><\/li><\/ol><p class=\"note tip\">Le nom de la famille s’affiche. Les rendez-vous et les tâches partagés apparaissent maintenant chez toi.<\/p><\/section><section id=\"h-fr-s4\" class=\"sec teal\"><header><span class=\"num\">4<\/span><h2>Activer les notifications<\/h2><\/header><p class=\"intro\">Les notifications t’avertissent quand un message arrive, même si l’appli est fermée. Il faut les autoriser une seule fois, sur chaque téléphone.<\/p><ol class=\"steps\"><li><span>Vérifie que l’appli est <b>installée sur l’écran d’accueil<\/b> (étape 1) et ouvre-la depuis son icône.<\/span><\/li><li><span>Appuie sur la cloche <span class=\"ic\">🔔<\/span> en haut de l’écran.<\/span><\/li><li><span>Appuie sur <span class=\"hpill\">Activer sur le téléphone<\/span>.<\/span><\/li><li><span>Une fenêtre demande ton accord : appuie sur <b>Autoriser<\/b>.<\/span><\/li><li><span>C’est fait. Tu recevras une notification à chaque nouveau message.<\/span><\/li><\/ol><h3>Tu as refusé par erreur ?<\/h3><div class=\"plat\"><h4><span>🤖<\/span>Android<\/h4><ol class=\"steps\"><li><span>Appuie longtemps sur l’icône de l’appli.<\/span><\/li><li><span>Appuie sur <b>Infos de l’appli<\/b>, puis sur <b>Notifications<\/b>.<\/span><\/li><li><span>Active <b>Autoriser les notifications<\/b>.<\/span><\/li><\/ol><\/div><div class=\"plat\"><h4><span>🍎<\/span>iPhone<\/h4><ol class=\"steps\"><li><span>Ouvre <b>Réglages<\/b>, puis <b>Notifications<\/b>.<\/span><\/li><li><span>Choisis <b>Ma famille<\/b>.<\/span><\/li><li><span>Active <b>Autoriser les notifications<\/b>.<\/span><\/li><\/ol><\/div><h3>Sur iPhone, ça ne s’active pas ?<\/h3><ol class=\"steps\"><li><span>Vérifie la version : <b>Réglages<\/b>, <b>Général<\/b>, <b>Informations<\/b>. Il faut <b>iOS 16.4<\/b> ou plus récent.<\/span><\/li><li><span>Supprime l’ancienne icône : appui long dessus, puis <b>Supprimer le signet<\/b>.<\/span><\/li><li><span>Ouvre le lien de l’appli dans <b>Safari<\/b> (pas dans Chrome). Appuie sur <b>Partager<\/b>, puis <b>Sur l’écran d’accueil<\/b>, puis <b>Ajouter<\/b>.<\/span><\/li><li><span>Ouvre l’appli <b>depuis la nouvelle icône<\/b>, jamais depuis Safari.<\/span><\/li><li><span>Appuie sur <span class=\"ic\">🔔<\/span>, puis sur <span class=\"hpill\">Activer sur le téléphone<\/span>, puis <b>Autoriser<\/b>.<\/span><\/li><\/ol><p class=\"note info\">Si tu avais refusé : ouvre <b>Réglages<\/b>, <b>Notifications<\/b>, <b>Ma famille<\/b>, puis active <b>Autoriser les notifications<\/b>. Vérifie aussi que le mode <b>Concentration<\/b> ou <b>Ne pas déranger<\/b> n’est pas activé.<\/p><h3>À savoir<\/h3><ul class=\"dots\"><li>Les <b>messages<\/b> arrivent même quand l’appli est fermée.<\/li><li>Les <b>rappels<\/b> (rendez-vous, prière) s’affichent quand l’appli est ouverte ou en arrière-plan. Si tu la fermes complètement, ils peuvent ne pas arriver.<\/li><li>L’<b>appel à la prière<\/b> en son ne joue que lorsque l’appli est ouverte.<\/li><li>Si ton téléphone est en mode silencieux ou « Ne pas déranger », la notification arrive sans son.<\/li><\/ul><\/section><section id=\"h-fr-s5\" class=\"sec \"><header><span class=\"num dot\">★<\/span><h2>Utiliser l’appli<\/h2><\/header><h3>Les 5 onglets, en bas<\/h3><dl class=\"kv \"><div><dt><span class=\"ic\">🏠<\/span> Aujourd’hui<\/dt><dd>Ce que tu as à faire aujourd’hui.<\/dd><\/div><div><dt><span class=\"ic\">📅<\/span> Agenda<\/dt><dd>Les rendez-vous de la famille.<\/dd><\/div><div><dt><span class=\"ic\">✅<\/span> Tâches<\/dt><dd>La liste des choses à faire.<\/dd><\/div><div><dt><span class=\"ic\">👪<\/span> Famille<\/dt><dd>Les membres de la famille et l’accès aux discussions.<\/dd><\/div><div><dt><span class=\"ic\">🧩<\/span> Plus<\/dt><dd>Tes espaces (études, logistique, arabe…), la prière, les versets, les réglages et l’aide.<\/dd><\/div><\/dl><h3>Les boutons, en haut<\/h3><dl class=\"kv \"><div><dt><span class=\"ic\">💬<\/span><\/dt><dd>Les discussions.<\/dd><\/div><div><dt><span class=\"ic\">🔔<\/span><\/dt><dd>Les notifications.<\/dd><\/div><div><dt><span class=\"ic\">🕌<\/span><\/dt><dd>Les horaires de prière.<\/dd><\/div><div><dt><span class=\"ic\">👤<\/span><\/dt><dd>Ton profil (ta photo) : prénom, téléphone, famille, espaces, langue, thème, mot de passe, déconnexion.<\/dd><\/div><\/dl><h3>Le bouton ＋<\/h3><ul class=\"dots\"><li>En bas à droite : ajoute un rendez-vous, une tâche ou une personne.<\/li><\/ul><h3>Les discussions <span class=\"ic\">💬<\/span><\/h3><ul class=\"dots\"><li>Choisis <b>toute la famille<\/b>, ou une personne pour parler à deux.<\/li><li><b>Écrire<\/b> : tape ton message puis appuie sur <span class=\"ic\">➤<\/span>.<\/li><li><b>Message vocal<\/b> : appuie sur <span class=\"ic\">🎤<\/span>, parle, puis <span class=\"ic\">➤<\/span> pour envoyer ou <span class=\"ic\">🗑️<\/span> pour annuler. La première fois, autorise le micro.<\/li><li><b>Photo, rendez-vous, tâche<\/b> : appuie sur <span class=\"ic\">📎<\/span>.<\/li><li><b>Réagir, répondre, copier, supprimer<\/b> : appuie sur <span class=\"ic\">⋯<\/span> à côté du message.<\/li><li><span class=\"ic\">✓<\/span> veut dire envoyé. <span class=\"ic\">✓✓<\/span> en bleu veut dire que la personne l’a lu.<\/li><li>Seuls les membres de la famille voient les messages. Ils sont gardés 90 jours.<\/li><\/ul><h3>Ma photo<\/h3><ul class=\"dots\"><li>Appuie sur ta photo <span class=\"ic\">👤<\/span> en haut, puis sur le petit <span class=\"hpill\">📷<\/span> de ton profil. Ta photo apparaît dans les discussions.<\/li><\/ul><\/section><section id=\"h-fr-s6\" class=\"sec \"><header><span class=\"num dot\">★<\/span><h2>Si ça ne marche pas<\/h2><\/header><dl class=\"kv faq\"><div><dt>Je ne reçois pas les notifications<\/dt><dd>Reprends l’étape 4. Vérifie que l’appli est installée sur l’écran d’accueil et que tu as appuyé sur <span class=\"hpill\">Activer sur le téléphone<\/span>. Sur Android, ouvre <b>Réglages<\/b>, puis <b>Batterie<\/b>, choisis l’appli et mets <b>Sans restriction<\/b>.<\/dd><\/div><div><dt>Le micro est refusé<\/dt><dd>Android : appui long sur l’icône de l’appli, <b>Infos de l’appli<\/b>, <b>Autorisations<\/b>, <b>Microphone<\/b>, puis <b>Autoriser<\/b>.<\/dd><\/div><div><dt>Un bouton manque ou l’appli semble ancienne<\/dt><dd>Ferme complètement l’appli (retire-la des applis récentes) et rouvre-la. Attends 5 secondes, ferme-la encore une fois, puis rouvre-la.<\/dd><\/div><div><dt>J’ai oublié mon mot de passe<\/dt><dd>Sur l’écran de connexion, appuie sur <b>Mot de passe oublié ?<\/b>.<\/dd><\/div><div><dt>Un message dit « trop de mails » ou « trop d’essais »<\/dt><dd>Attends environ une heure, puis réessaie. Si tu ne peux pas attendre, préviens Khalid.<\/dd><\/div><\/dl><\/section><p class=\"foot\">Besoin d’aide ? Demande à Khalid ou à Hajar.<\/p>", "ar": "<div class=\"chips\"><button type=\"button\" class=\"chip\" data-go=\"h-ar-s1\"><b>1<\/b>التثبيت<\/button><button type=\"button\" class=\"chip\" data-go=\"h-ar-s2\"><b>2<\/b>إنشاء الحساب<\/button><button type=\"button\" class=\"chip\" data-go=\"h-ar-s3\"><b>3<\/b>الانضمام للعائلة<\/button><button type=\"button\" class=\"chip\" data-go=\"h-ar-s4\"><b>4<\/b>الإشعارات<\/button><button type=\"button\" class=\"chip\" data-go=\"h-ar-s5\">استعمال التطبيق<\/button><button type=\"button\" class=\"chip\" data-go=\"h-ar-s6\">إذا لم يعمل<\/button><\/div><section id=\"h-ar-s1\" class=\"sec \"><header><span class=\"num\">1<\/span><h2>تثبيت التطبيق على هاتفك<\/h2><\/header><p class=\"intro\">ثبّت التطبيق لتجده على الشاشة الرئيسية مثل واتساب. التثبيت ضروري لكي تصلك الإشعارات.<\/p><div class=\"plat\"><h4><span>🤖<\/span>أندرويد (سامسونغ، شاومي، أوبو…)<\/h4><ol class=\"steps\"><li><span>افتح رابط التطبيق بمتصفح <b>Chrome<\/b>.<\/span><\/li><li><span>اضغط على زر <span class=\"hpill\">📲 تثبيت<\/span>. إن لم تجده: اضغط على <span class=\"ic\">⋮<\/span> (أعلى الشاشة) ثم على <b>تثبيت التطبيق<\/b>.<\/span><\/li><li><span>اضغط على <b>تثبيت<\/b>. ستظهر أيقونة التطبيق على شاشتك الرئيسية.<\/span><\/li><\/ol><\/div><p class=\"note info\">إذا ظهرت رسالة أمان في أندرويد، اختر <b>التثبيت على أي حال<\/b>. التطبيق آمن.<\/p><div class=\"plat\"><h4><span>🍎<\/span>آيفون<\/h4><ol class=\"steps\"><li><span>افتح رابط التطبيق بمتصفح <b>Safari<\/b> (وليس Chrome).<\/span><\/li><li><span>اضغط على <b>مشاركة<\/b> (المربع الذي فيه سهم إلى الأعلى).<\/span><\/li><li><span>مرّر القائمة إلى الأسفل، واضغط على <b>إضافة إلى الشاشة الرئيسية<\/b> ثم على <b>إضافة<\/b>.<\/span><\/li><\/ol><\/div><p class=\"note info\">في آيفون يلزم نظام iOS 16.4 أو أحدث لكي تصلك الإشعارات.<\/p><\/section><section id=\"h-ar-s2\" class=\"sec \"><header><span class=\"num\">2<\/span><h2>إنشاء حسابك<\/h2><\/header><p class=\"intro\">الحساب يحفظ بياناتك على كل أجهزتك، ويتيح لك التواصل مع عائلتك.<\/p><ol class=\"steps\"><li><span>افتح التطبيق من أيقونته واضغط على <span class=\"hpill\">إنشاء حسابي<\/span>.<\/span><\/li><li><span>اكتب <b>اسمك<\/b>، مثلاً «ماما».<\/span><\/li><li><span>اكتب <b>بريدك الإلكتروني<\/b> واختر <b>كلمة المرور<\/b> (6 أحرف على الأقل). احتفظ بها في مكان آمن.<\/span><\/li><li><span>اترك خانة «أنا هاجر» <b>فارغة<\/b>. هذه الخانة خاصة بهاجر فقط.<\/span><\/li><li><span>اضغط على <span class=\"hpill\">إنشاء حسابي<\/span>.<\/span><\/li><\/ol><p class=\"note tip\">إذا طُلب منك تأكيد بريدك، افتح الرسالة التي وصلتك واضغط على الرابط. ثم ارجع إلى التطبيق واضغط على <span class=\"hpill\">تسجيل الدخول<\/span>.<\/p><p class=\"note tip\">في المرات القادمة: اضغط على <span class=\"hpill\">تسجيل الدخول<\/span> بنفس البريد ونفس كلمة المرور.<\/p><\/section><section id=\"h-ar-s3\" class=\"sec \"><header><span class=\"num\">3<\/span><h2>الانضمام إلى عائلتك<\/h2><\/header><p class=\"intro\">لكي ترى أجندة العائلة ومهامها ومحادثاتها، يجب إدخال رمز العائلة.<\/p><ol class=\"steps\"><li><span>اطلب <b>رمز العائلة<\/b> من خالد أو من هاجر.<\/span><\/li><li><span>في التطبيق، اضغط على تبويب <b>العائلة<\/b> (أسفل الشاشة).<\/span><\/li><li><span>اضغط على <span class=\"hpill\">الانضمام بالرمز<\/span>، اكتب الرمز، ثم اضغط على <span class=\"hpill\">انضمام<\/span>.<\/span><\/li><\/ol><p class=\"note tip\">سيظهر اسم العائلة. والمواعيد والمهام المشتركة ستظهر عندك الآن.<\/p><\/section><section id=\"h-ar-s4\" class=\"sec teal\"><header><span class=\"num\">4<\/span><h2>تفعيل الإشعارات<\/h2><\/header><p class=\"intro\">الإشعارات تنبّهك عند وصول رسالة جديدة، حتى لو كان التطبيق مغلقاً. يجب السماح بها مرة واحدة فقط، على كل هاتف.<\/p><ol class=\"steps\"><li><span>تأكد أن التطبيق <b>مثبّت على الشاشة الرئيسية<\/b> (الخطوة 1) وافتحه من أيقونته.<\/span><\/li><li><span>اضغط على الجرس <span class=\"ic\">🔔<\/span> في أعلى الشاشة.<\/span><\/li><li><span>اضغط على <span class=\"hpill\">تفعيل على الهاتف<\/span>.<\/span><\/li><li><span>ستظهر نافذة تطلب موافقتك: اضغط على <b>سماح<\/b>.<\/span><\/li><li><span>تم. ستصلك إشعارات مع كل رسالة جديدة.<\/span><\/li><\/ol><h3>رفضتَ بالخطأ؟<\/h3><div class=\"plat\"><h4><span>🤖<\/span>أندرويد<\/h4><ol class=\"steps\"><li><span>اضغط مطولاً على أيقونة التطبيق.<\/span><\/li><li><span>اضغط على <b>معلومات التطبيق<\/b> ثم على <b>الإشعارات<\/b>.<\/span><\/li><li><span>فعّل <b>السماح بالإشعارات<\/b>.<\/span><\/li><\/ol><\/div><div class=\"plat\"><h4><span>🍎<\/span>آيفون<\/h4><ol class=\"steps\"><li><span>افتح <b>الإعدادات<\/b> ثم <b>الإشعارات<\/b>.<\/span><\/li><li><span>اختر <b>Ma famille<\/b>.<\/span><\/li><li><span>فعّل <b>السماح بالإشعارات<\/b>.<\/span><\/li><\/ol><\/div><h3>في آيفون لا يتم التفعيل؟<\/h3><ol class=\"steps\"><li><span>تحقق من النسخة: <b>الإعدادات<\/b> ثم <b>عام<\/b> ثم <b>حول<\/b>. يلزم <b>iOS 16.4<\/b> أو أحدث.<\/span><\/li><li><span>احذف الأيقونة القديمة: اضغط عليها مطولاً ثم <b>حذف الإشارة المرجعية<\/b>.<\/span><\/li><li><span>افتح رابط التطبيق في <b>Safari<\/b> (وليس في Chrome). اضغط على <b>مشاركة<\/b> ثم <b>إضافة إلى الشاشة الرئيسية<\/b> ثم <b>إضافة<\/b>.<\/span><\/li><li><span>افتح التطبيق <b>من الأيقونة الجديدة<\/b>، وليس من Safari.<\/span><\/li><li><span>اضغط على <span class=\"ic\">🔔<\/span> ثم على <span class=\"hpill\">تفعيل على الهاتف<\/span> ثم <b>سماح<\/b>.<\/span><\/li><\/ol><p class=\"note info\">إذا كنت قد رفضت: افتح <b>الإعدادات<\/b> ثم <b>الإشعارات<\/b> ثم <b>Ma famille<\/b>، وفعّل <b>السماح بالإشعارات<\/b>. وتأكد أن وضع <b>التركيز<\/b> أو <b>عدم الإزعاج<\/b> غير مفعّل.<\/p><h3>مهم أن تعرف<\/h3><ul class=\"dots\"><li><b>الرسائل<\/b> تصلك حتى لو كان التطبيق مغلقاً.<\/li><li><b>التذكيرات<\/b> (المواعيد والصلاة) تظهر عندما يكون التطبيق مفتوحاً أو في الخلفية. إذا أغلقته تماماً فقد لا تصلك.<\/li><li><b>أذان الصلاة<\/b> بالصوت لا يعمل إلا والتطبيق مفتوح.<\/li><li>إذا كان هاتفك على الوضع الصامت أو «عدم الإزعاج»، يصل الإشعار بدون صوت.<\/li><\/ul><\/section><section id=\"h-ar-s5\" class=\"sec \"><header><span class=\"num dot\">★<\/span><h2>استعمال التطبيق<\/h2><\/header><h3>التبويبات الخمسة في الأسفل<\/h3><dl class=\"kv \"><div><dt><span class=\"ic\">🏠<\/span> اليوم<\/dt><dd>ما عليك فعله اليوم.<\/dd><\/div><div><dt><span class=\"ic\">📅<\/span> الأجندة<\/dt><dd>مواعيد العائلة.<\/dd><\/div><div><dt><span class=\"ic\">✅<\/span> المهام<\/dt><dd>قائمة الأشياء التي يجب إنجازها.<\/dd><\/div><div><dt><span class=\"ic\">👪<\/span> العائلة<\/dt><dd>أفراد العائلة والوصول إلى المحادثات.<\/dd><\/div><div><dt><span class=\"ic\">🧩<\/span> المزيد<\/dt><dd>مساحاتك (الدراسة، اللوجستيك، العربية…) والصلاة والآيات والإعدادات والمساعدة.<\/dd><\/div><\/dl><h3>الأزرار في الأعلى<\/h3><dl class=\"kv \"><div><dt><span class=\"ic\">💬<\/span><\/dt><dd>المحادثات.<\/dd><\/div><div><dt><span class=\"ic\">🔔<\/span><\/dt><dd>الإشعارات.<\/dd><\/div><div><dt><span class=\"ic\">🕌<\/span><\/dt><dd>مواقيت الصلاة.<\/dd><\/div><div><dt><span class=\"ic\">👤<\/span><\/dt><dd>ملفك الشخصي (صورتك): الاسم والهاتف والعائلة والمساحات واللغة والمظهر وكلمة المرور وتسجيل الخروج.<\/dd><\/div><\/dl><h3>زر ＋<\/h3><ul class=\"dots\"><li>في أسفل الشاشة: يضيف موعداً أو مهمة أو شخصاً.<\/li><\/ul><h3>المحادثات <span class=\"ic\">💬<\/span><\/h3><ul class=\"dots\"><li>اختر <b>كل العائلة<\/b>، أو شخصاً واحداً للمحادثة معه.<\/li><li><b>للكتابة<\/b>: اكتب رسالتك ثم اضغط على <span class=\"ic\">➤<\/span>.<\/li><li><b>رسالة صوتية<\/b>: اضغط على <span class=\"ic\">🎤<\/span> وتكلّم، ثم <span class=\"ic\">➤<\/span> للإرسال أو <span class=\"ic\">🗑️<\/span> للإلغاء. في المرة الأولى اسمح باستعمال الميكروفون.<\/li><li><b>صورة أو موعد أو مهمة<\/b>: اضغط على <span class=\"ic\">📎<\/span>.<\/li><li><b>للتفاعل أو الرد أو النسخ أو الحذف<\/b>: اضغط على <span class=\"ic\">⋯<\/span> بجانب الرسالة.<\/li><li><span class=\"ic\">✓<\/span> تعني أن الرسالة أُرسلت. و<span class=\"ic\">✓✓<\/span> باللون الأزرق تعني أن الشخص قرأها.<\/li><li>لا يرى الرسائل إلا أفراد العائلة. وتُحفظ لمدة 90 يوماً.<\/li><\/ul><h3>صورتي<\/h3><ul class=\"dots\"><li>اضغط على صورتك <span class=\"ic\">👤<\/span> في الأعلى، ثم على <span class=\"hpill\">📷<\/span> في ملفك الشخصي. ستظهر صورتك في المحادثات.<\/li><\/ul><\/section><section id=\"h-ar-s6\" class=\"sec \"><header><span class=\"num dot\">★<\/span><h2>إذا لم يعمل شيء<\/h2><\/header><dl class=\"kv faq\"><div><dt>لا تصلني الإشعارات<\/dt><dd>ارجع إلى الخطوة 4. تأكد أن التطبيق مثبّت على الشاشة الرئيسية وأنك ضغطت على <span class=\"hpill\">تفعيل على الهاتف<\/span>. في أندرويد افتح <b>الإعدادات<\/b> ثم <b>البطارية<\/b>، واختر التطبيق وضعه على <b>بدون قيود<\/b>.<\/dd><\/div><div><dt>الميكروفون مرفوض<\/dt><dd>في أندرويد: اضغط مطولاً على أيقونة التطبيق، ثم <b>معلومات التطبيق<\/b>، ثم <b>الأذونات<\/b>، ثم <b>الميكروفون<\/b>، ثم <b>سماح<\/b>.<\/dd><\/div><div><dt>ينقصني زر أو يبدو التطبيق قديماً<\/dt><dd>أغلق التطبيق تماماً (احذفه من التطبيقات الأخيرة) ثم افتحه. انتظر 5 ثوانٍ، وأغلقه مرة أخرى، ثم افتحه.<\/dd><\/div><div><dt>نسيت كلمة المرور<\/dt><dd>في شاشة الدخول اضغط على <b>هل نسيت كلمة المرور؟<\/b>.<\/dd><\/div><div><dt>تظهر رسالة «عدد كبير من الرسائل» أو «محاولات كثيرة»<\/dt><dd>انتظر نحو ساعة ثم حاول من جديد. وإن لم تستطع الانتظار فأخبر خالد.<\/dd><\/div><\/dl><\/section><p class=\"foot\">تحتاج مساعدة؟ اسأل خالد أو هاجر.<\/p>"};
function openHelp(l0){if($('#hlpO'))return;let l=l0||(isAr()?'ar':'fr');const o=document.createElement('div');o.id='hlpO';o.className='hlpO';o.setAttribute('data-nt','1');
 const kd=e=>{if(e.key==='Escape')close();},close=()=>{o.remove();document.removeEventListener('keydown',kd);};
 const draw=()=>{o.innerHTML=`<div class="hlpT"><div class="seg" role="group" aria-label="Langue"><button type="button" data-l="fr" aria-pressed="${l==='fr'}">Français</button><button type="button" data-l="ar" aria-pressed="${l==='ar'}">العربية</button></div><button type="button" class="hlpX" id="hlpX" aria-label="Fermer">✕</button></div><div class="hlp" lang="${l}" dir="${l==='ar'?'rtl':'ltr'}">${HELP[l]}</div>`;
  o.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{l=b.dataset.l;draw();o.scrollTop=0;});$('#hlpX',o).onclick=close;
  o.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{const el=o.querySelector('#'+c.dataset.go);if(el)el.scrollIntoView({block:'start'});});};
 draw();document.addEventListener('keydown',kd);document.body.appendChild(o);o.scrollTop=0;}
/* installation */
function instCard(f){if((!f&&S.inst)||matchMedia('(display-mode: standalone)').matches||navigator.standalone)return '';return `<div class="card" id="instC" style="margin:12px 0"><b>📲 Installer l'application</b><div class="mini">Ajoute Ma famille à ton écran d'accueil : elle s'ouvre comme une vraie appli, sans te reconnecter.</div><div class="row" style="margin-top:8px"><button class="btn" id="instGo">Installer</button>${f?'':'<button class="btn alt" id="instLt">Plus tard</button>'}</div></div>`;}
function instBind(){const g=$('#instGo');if(!g)return;g.onclick=()=>{if(DEFER)doInstall();else toast(/iphone|ipad/i.test(navigator.userAgent)?(/crios|fxios|edgios|opios/i.test(navigator.userAgent)?'Ouvre ce lien dans Safari, puis touche Partager et « Sur l’écran d’accueil »':'Touche Partager puis « Sur l’écran d’accueil »'):'Menu ⋮ du navigateur, puis « Installer l’application »',6000);};const lt=$('#instLt');if(lt)lt.onclick=()=>{S.inst=1;save();$('#instC').remove();};}
/* ---------- ADMIN ---------- */
const admRpc=(fn,b)=>sbData('/rest/v1/rpc/'+fn,{m:'POST',b:b||{}});
const OWNER='mrkhalidou120@gmail.com';
function admVis(){const b=$('#pAdm');if(b)b.style.display=(SY.at&&(SY.adm||SY.email===OWNER))?'':'none';}
async function admCheck(){if(!SY.at||SY.adm!==undefined)return;SY.adm=false;SY.admE='';try{SY.adm=(await admRpc('is_admin'))===true;if(!SY.adm)SY.admE='no';}catch(e){SY.adm=false;SY.admE=e.net?'net':'nofn';}admVis();}
const admD=i=>i?new Date(i).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
let ADMD=null;
function admOv(html){const d=document.createElement('div');d.className='lv-ov';d.setAttribute('data-nt','');d.innerHTML=`<div class="lv-card pf" style="text-align:left;max-width:640px;width:94vw;max-height:88vh;overflow:auto">${html}<div style="margin-top:12px;text-align:right"><button class="btn" id="admX">Fermer</button></div></div>`;document.body.appendChild(d);const c=()=>d.remove();d.onclick=e=>{if(e.target===d)c();};$('#admX',d).onclick=c;d.close=c;return d;}
async function viewAdmin(){if(!SY.at){go('');return;}
 if(!SY.adm){setApp(`<div data-nt><div class="banner" style="--c:#37474f"><h1>🛠️ Admin</h1></div><div class="mini">Vérification…</div></div>`);SY.adm=undefined;await admCheck();
  if(!SY.adm){const m={net:'Pas de connexion : réessaie quand tu es en ligne.',nofn:'Le script SQL admin n\'a pas encore été exécuté dans Supabase (SQL Editor → coller supabase_admin.sql → Run).',no:'Le serveur ne te reconnaît pas comme admin. Exécute (ou relance) le script supabase_admin.sql dans Supabase : il te déclare admin d\'après ton e-mail ('+esc(SY.email||'')+'). Ce compte doit exister dans Authentication → Users.'}[SY.admE]||'Accès refusé.';
   setApp(`<div data-nt><div class="banner" style="--c:#37474f"><h1>🛠️ Admin</h1></div><div class="card">⚠️ ${m}</div><div class="row"><button class="btn" onclick="SY.adm=undefined;viewAdmin()">🔄 Réessayer</button></div></div>`);return;}}
 setApp(`<div data-nt><div class="banner" style="--c:#37474f"><h1>🛠️ Admin</h1><div class="mini" style="color:#fff;opacity:.9">Vue complète : comptes, familles et données</div></div><div id="admB"><div class="mini">Chargement…</div></div></div>`);
 try{ADMD=await admRpc('admin_overview');}catch(x){const e=$('#admB');if(e)e.innerHTML=`<div class="card">⚠️ ${esc(frErr(x.message))}<div class="mini">Première fois ? Exécute le script « supabase_admin.sql » dans Supabase (SQL Editor).</div></div>`;return;}
 admDraw();}
function admDraw(){const d=ADMD,e=$('#admB');if(!e||!d)return;const now=Date.now(),U=d.users||[],F=d.families||[];
 const act=U.filter(u=>u.last&&now-new Date(u.last)<864e5).length,nw=U.filter(u=>now-new Date(u.created)<7*864e5).length;
 const st=(n,l)=>`<div class="card" style="flex:1;min-width:110px;text-align:center"><div style="font-size:1.6rem;font-weight:800">${n}</div><div class="mini">${l}</div></div>`;
 e.innerHTML=`<div class="row" style="gap:8px;flex-wrap:wrap;margin:10px 0">${st(U.length,'comptes')}${st(F.length,'familles')}${st(act,'actifs (24 h)')}${st(nw,'nouveaux (7 j)')}${st(F.reduce((a,f)=>a+f.events,0),'rendez-vous')}${st(F.reduce((a,f)=>a+f.tasks,0),'tâches')}</div>
 <div class="row"><button class="btn" id="admR">🔄 Actualiser</button><button class="btn alt" id="admEx">💾 Exporter tout (JSON)</button></div>
 <h3 style="margin:16px 0 4px">👪 Familles (${F.length})</h3>
 ${F.map(f=>`<div class="card" style="margin:8px 0"><b>${esc(f.name)}</b> <span class="mini" style="font-family:monospace">${esc(f.code)}</span><div class="mini">${f.members} membre${f.members>1?'s':''} · ${f.people} personne${f.people>1?'s':''} · ${f.events} rdv · ${f.tasks} tâche${f.tasks>1?'s':''} · créée ${admD(f.created)} · modifiée ${admD(f.updated)}</div><div class="row" style="margin-top:6px"><button class="btn" data-a="fo" data-id="${f.id}">Ouvrir</button><button class="btn alt" data-a="fdel" data-id="${f.id}" data-n="${esc(f.name)}">🗑️ Supprimer</button></div></div>`).join('')||'<div class="mini">Aucune famille.</div>'}
 <h3 style="margin:16px 0 4px">👤 Comptes (${U.length})</h3>
 ${U.map(u=>`<div class="card" style="margin:8px 0"><b>${esc(u.email||'')}</b> ${u.admin?'<span class="pill">admin</span>':''}<div class="mini">${esc(u.name||'sans prénom')} · ${u.stl==='h'?'👩‍🎓 Hajar':u.stl==='o'?'👤 autre':'— (ancien compte)'} · XP ${esc(u.xp||'0')} · série ${esc(u.streak||'0')}</div><div class="mini">Créé ${admD(u.created)} · dernière connexion ${admD(u.last)}${u.confirmed?'':' · ⚠️ mail non confirmé'}</div><div class="mini">Familles : ${(u.families||[]).map(esc).join(', ')||'aucune'}</div><div class="row" style="margin-top:6px"><button class="btn alt" data-a="ud" data-id="${u.id}">👁️ Données</button>${u.id===SY.uid?'':`<button class="btn alt" data-a="uadm" data-id="${u.id}" data-v="${u.admin?0:1}" data-n="${esc(u.email||'')}">${u.admin?'⭐ Retirer admin':'⭐ Nommer admin'}</button><button class="btn alt" data-a="udel" data-id="${u.id}" data-n="${esc(u.email||'')}">🗑️ Supprimer le compte</button>`}</div></div>`).join('')}`;
 $('#admR').onclick=viewAdmin;
 $('#admEx').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(ADMD,null,1)],{type:'application/json'}));a.download='ma-famille-admin-'+new Date().toISOString().slice(0,10)+'.json';a.click();};
 e.onclick=async ev=>{const b=ev.target.closest('[data-a]');if(!b)return;const id=b.dataset.id,a=b.dataset.a;
  try{if(a==='fo')return admFam(id);
   if(a==='ud'){const x=await admRpc('admin_user_data',{u:id});const o=admOv(`<h3 style="margin:0 0 6px">👁️ Données du compte</h3><div class="mini">Données personnelles synchronisées (progression, réglages, prénom…)</div><pre style="white-space:pre-wrap;word-break:break-word;font-size:.75rem;max-height:55vh;overflow:auto">${esc(JSON.stringify(x,null,1))}</pre>`);return;}
   if(a==='uadm'){const v=b.dataset.v==='1';if(!confirm((v?'Donner':'Retirer')+' les droits admin '+(v?'à ':'de ')+b.dataset.n+' ?'+(v?'\nCette personne pourra tout voir et tout gérer.':'')))return;await admRpc('admin_set_admin',{u:id,v});toast(v?'Admin ajouté ✅':'Admin retiré');return viewAdmin();}
   if(a==='udel'){if(!confirm('Supprimer définitivement le compte '+b.dataset.n+' ?\nSes données personnelles seront effacées.'))return;await admRpc('admin_delete_user',{u:id});toast('Compte supprimé');return viewAdmin();}
   if(a==='fdel'){if(!confirm('Supprimer la famille « '+b.dataset.n+' » et toutes ses données partagées ?'))return;await admRpc('admin_delete_family',{f:id});toast('Famille supprimée');return viewAdmin();}
  }catch(x){toast(frErr(x.message));}};}
async function admFam(fid){let r;try{r=await admRpc('admin_family',{f:fid});}catch(x){toast(frErr(x.message));return;}
 const o=admOv('<div id="admF"></div>');
 const draw=()=>{const f=r.family,dt=r.data||{},ev=dt.ev||[],tk=dt.tk||[],pp=dt.fam||[];
  const li=(k,arr,fmt)=>`<h4 style="margin:12px 0 4px">${fmt[0]} (${arr.length})</h4>${arr.map(x=>`<div class="adr"><span class="nm">${esc(fmt[1](x))}</span><button class="btn alt" data-k="${k}" data-i="${esc(x.id)}">🗑️</button></div>`).join('')||'<div class="mini">Aucun.</div>'}`;
  $('#admF',o).innerHTML=`<h3 style="margin:0">👪 ${esc(f.name)}</h3><div class="mini">Code : <b style="font-family:monospace">${esc(f.code)}</b> · créée ${admD(f.created_at)}</div>
  <div class="row" style="margin:8px 0"><button class="btn alt" id="fRn">✏️ Renommer</button><button class="btn alt" id="fNc">🔑 Nouveau code</button><button class="btn alt" id="fRaw">{ } Données brutes</button><button class="btn alt" id="fChat">💬 Lire les messages</button></div>
  <h4 style="margin:12px 0 4px">Membres (${r.members.length})</h4>${r.members.map(m=>`<div class="adr"><span class="nm">${esc(m.email||'')} <span class="mini">${esc(m.name||'')}</span></span><button class="btn alt" data-m="${m.id}">Retirer</button></div>`).join('')||'<div class="mini">Aucun.</div>'}
  ${li('fam',pp,['Personnes',x=>`${x.e||''} ${x.n||''}${x.r?' · '+x.r:''}`])}${li('ev',ev,['Rendez-vous',x=>`${x.d||''} ${x.tm||''} · ${x.t||''}${x.by?' · par '+x.by:''}`])}${li('tk',tk,['Tâches',x=>`${x.dn?'✅ ':''}${x.d||'sans date'} · ${x.t||''}${x.by?' · par '+x.by:''}`])}`;
  const save=async()=>{await admRpc('admin_set_family_data',{f:f.id,d:dt});};
  $('#fRn',o).onclick=async()=>{const n=prompt('Nouveau nom',f.name);if(!n)return;await admRpc('admin_rename_family',{f:f.id,n});f.name=n;draw();};
  $('#fNc',o).onclick=async()=>{if(!confirm('Générer un nouveau code ? L\'ancien ne marchera plus pour rejoindre.'))return;f.code=await admRpc('admin_new_code',{f:f.id});draw();};
  $('#fChat',o).onclick=()=>admChat(f.id);
  $('#fRaw',o).onclick=()=>admOv(`<pre style="white-space:pre-wrap;word-break:break-word;font-size:.75rem;max-height:60vh;overflow:auto">${esc(JSON.stringify(dt,null,1))}</pre>`);
  o.querySelectorAll('[data-m]').forEach(b=>b.onclick=async()=>{if(!confirm('Retirer ce membre de la famille ?'))return;await admRpc('admin_remove_member',{u:b.dataset.m,f:f.id});r.members=r.members.filter(m=>m.id!==b.dataset.m);draw();});
  o.querySelectorAll('[data-k]').forEach(b=>b.onclick=async()=>{if(!confirm('Supprimer cet élément pour toute la famille ?'))return;const k=b.dataset.k,id=b.dataset.i;dt[k]=(dt[k]||[]).filter(x=>x.id!==id);dt.dl=dt.dl||{};dt.dl[id]=Date.now();await save();draw();});};
 draw();}
const HJH='bb0c3ca40c41fe006b1e4117548511317ccb665906c1acfea94eeaa51db7a2ca';
function doLogout(){if(!confirm('Te déconnecter ? Tes données restent sur cet appareil.'))return;const o=$('#acO');if(o)o.remove();const fin=()=>{SY.at=SY.rt='';SY.fid=SY.code=SY.fname='';SY.adm=undefined;SY.st='out';sySave();chStop();syUI();route();};pushDrop().then(fin,fin);}
function openAccount(){go('me');}
/* mot de passe : oublié / changer */
function pwForm(tok,rt,exp,rec){const d=document.createElement('div');d.className='lv-ov';d.id='pwO';
 d.innerHTML=`<div class="lv-card pf" style="text-align:start"><h3 style="margin:0 0 6px">🔑 ${rec?'Nouveau mot de passe':'Changer mon mot de passe'}</h3><input class="srch" id="pw1" type="password" autocomplete="new-password" placeholder="Nouveau mot de passe (6 caractères minimum)"><input class="srch" id="pw2" type="password" autocomplete="new-password" placeholder="Répète le mot de passe" style="margin-top:8px"><div class="mini" id="pwM" style="margin-top:8px;color:#c62828"></div><div class="row" style="margin-top:8px"><button class="btn" id="pwOk">Enregistrer</button><button class="btn alt" id="pwNo">Annuler</button></div></div>`;
 document.body.appendChild(d);$('#pw1',d).focus();$('#pwNo',d).onclick=()=>d.remove();
 $('#pwOk',d).onclick=async()=>{const a=$('#pw1',d).value,b=$('#pw2',d).value,m=$('#pwM',d);if(a.length<6){m.textContent='Mot de passe : 6 caractères minimum.';return;}if(a!==b){m.textContent='Les deux mots de passe sont différents.';return;}
  $('#pwOk',d).disabled=true;m.textContent='';try{
   if(!rec&&SY.exp&&SY.exp-60000<Date.now())await syRefresh();
   const j=await sbReq('/auth/v1/user',{m:'PUT',auth:false,h:{Authorization:'Bearer '+(rec?tok:SY.at)},b:{password:a}});
   if(rec){const prevB=SY.bound;sbSession({access_token:tok,refresh_token:rt,expires_in:exp,user:j});if(prevB&&prevB!==SY.uid)await resetUserData();SY.email=j.email||SY.email;SY.st='idle';sySave();await syLoadFamily().catch(()=>{});document.body.classList.remove('gate');syUI();route();syncNow();}
   d.remove();toast('Mot de passe enregistré ✅');}catch(x){$('#pwOk',d).disabled=false;m.textContent=x.net?x.message:frErr(x.message);}};}
function recoveryCheck(){try{const q=new URLSearchParams(location.hash.slice(1));
 if(q.get('error_code')||q.get('error')){history.replaceState(null,'',location.pathname+location.search);toast('Lien expiré ou invalide : refais « Mot de passe oublié ».',6000);return;}
 if(q.get('type')==='recovery'&&q.get('access_token')){const t=q.get('access_token'),r=q.get('refresh_token')||'',e=+q.get('expires_in')||3600;history.replaceState(null,'',location.pathname+location.search);setTimeout(()=>pwForm(t,r,e,true),300);}}catch(e){}}
/* données locales : isolation entre comptes */
async function resetUserData(){try{chStop();}catch(e){}const k={};['lang','theme','fs','rd','pl','ad','av','ak','pn'].forEach(x=>{if(S[x]!==undefined)k[x]=S[x];});
 S={xp:0,streak:0,last:'',items:{},theme:'auto',best:{},fav:[],pg:{},fs:100,rd:0,exam:'',bk:0,ut:0,...k,stl:'o',nost:1};
 SY.bound='';SY.fid=SY.code=SY.fname='';SY.adm=undefined;try{await IDB.delK('syb');localStorage.removeItem('gp-pre-sync');}catch(e){}
 sySave();flush();try{langApply();applyPrefs();}catch(e){}}
async function deleteMyAccount(){if(!confirm('Supprimer définitivement ton compte ?\nTes données en ligne seront effacées (compte, progression, appartenance aux familles). Une famille sans aucun membre est supprimée avec ses données. Cette action est irréversible.'))return;
 const w=(prompt('Pour confirmer, écris : SUPPRIMER')||'').trim().toUpperCase();if(w!=='SUPPRIMER'){toast('Annulé');return;}
 try{await sbData('/rest/v1/rpc/delete_my_account',{m:'POST',b:{}});}catch(x){toast(frErr(x.message));return;}
 const o=$('#acO');if(o)o.remove();SY.at=SY.rt='';SY.uid='';SY.email='';await resetUserData();SY.st='out';sySave();syUI();route();toast('Compte supprimé');}
/* ---------- CHAT (discussions, vocaux, photos, partage) + PUSH ---------- */
const VAPID_PUB='BD9xSq-d2OxumjW5VcmadY0YxKXO9UqnC4WdniSZL9msqU35lAotDdwUKg_sSFvK83dSf6Vb-zjjE0hp1Sm6Md4';
const CH={ov:null,conv:'',msgs:[],rx:{},ws:null,wsOk:0,tp:{},mc:new Map(),rm:{},more:0,n:0,pushOn:0,poll:null,rec:null,sh:0,sn:{},re:null,nfs:{}};
const CHA={a:null,id:'',sp:1};
const CHE=['❤️','👍','😂','🙏','😮','🤲'];
const chOn=()=>!!(SY.at&&SY.fid);
const chMe=()=>SY.uid;
const chMem=()=>(CH.ov&&CH.ov.members)||[];
const chName=id=>{if(id===chMe())return 'Moi';const m=chMem().find(x=>x.id===id);return m?m.name:'…';};
const chConvOf=r=>!r.to_user?'fam':(r.sender===chMe()?r.to_user:r.sender);
const chPrev=m=>m.deleted?trS('🚫 Message supprimé'):m.kind==='voice'?trS('🎤 Message vocal'):m.kind==='image'?trS('📷 Photo'):m.kind==='share'?(m.meta&&m.meta.k==='tk'?trS('✅ Tâche partagée'):trS('📅 RDV partagé')):String(m.body||'').replace(/\s+/g,' ');
const chCol=id=>{let h=0;for(const c of String(id))h=(h*31+c.charCodeAt(0))%360;return `hsl(${h} 55% 42%)`;};
const chUnread=()=>CH.ov?CH.ov.convs.reduce((a,c)=>a+(c.unread||0),0):0;
const chFmt=s=>{const m=Math.max(0,Math.round(s||0));return Math.floor(m/60)+':'+String(m%60).padStart(2,'0');};
function chBadge(){const n=chUnread();const b=$('#chB');if(b){b.textContent=n>9?'9+':n;b.style.display=n?'block':'none';}const c=$('#chCardB');if(c){c.textContent=n;c.style.display=n?'inline-block':'none';}}
function chCard(){if(!SY.at)return '';const n=chUnread();return `<div class="card chcard" onclick="go('chat')" style="cursor:pointer;display:flex;gap:10px;align-items:center;margin:10px 0"><span style="font-size:1.6rem">💬</span><div style="flex:1"><b>Discussions</b><div class="mini">Écrire, envoyer un vocal ou une photo à la famille</div></div><span class="chub" id="chCardB" style="${n?'':'display:none'}">${n}</span></div>`;}

/* ---- données ---- */
async function chOverview(){if(!chOn())return;try{CH.ov=await sbData('/rest/v1/rpc/chat_overview',{m:'POST',b:{f:SY.fid}});}catch(e){return;}chBadge();CH.ov.convs.forEach(c=>{if(!c.unread&&c.conv!==CH.conv)chClearBell(c.conv,8000);else if(c.unread&&c.last&&c.last.sender!==chMe()&&c.conv!==CH.conv){const k=c.conv+':'+c.last.id;if(!CH.nfs[k]){CH.nfs[k]=1;if(!nfList().some(x=>x.go==='chat/'+c.conv))nfAdd('💬',chName(c.last.sender)+' : '+chPrev(c.last).slice(0,60),'chat/'+c.conv,'cmo'+k,'chat-'+c.conv);}}});avSync();phSync();if(location.hash==='#chat'&&$('#chLs'))chListDraw();}
async function chFetch(conv,opt){opt=opt||{};let q='/rest/v1/messages?select=*&family_id=eq.'+SY.fid+'&order=id.'+(opt.after?'asc':'desc')+'&limit=40';
 q+=conv==='fam'?'&to_user=is.null':'&or=(and(sender.eq.'+chMe()+',to_user.eq.'+conv+'),and(sender.eq.'+conv+',to_user.eq.'+chMe()+'))';
 if(opt.before)q+='&id=lt.'+opt.before;if(opt.after)q+='&id=gt.'+opt.after;
 const r=await sbData(q)||[];return opt.after?r:r.reverse();}
async function chFetchRx(ids){if(!ids.length)return;const r=await sbData('/rest/v1/msg_reactions?select=msg_id,user_id,emoji&msg_id=in.('+ids.join(',')+')')||[];const o={};ids.forEach(i=>o[i]=[]);r.forEach(x=>o[x.msg_id].push({u:x.user_id,e:x.emoji}));Object.assign(CH.rx,o);}
const chReal=()=>CH.msgs.filter(x=>!x.tmp);
async function chLoad(conv){CH.err='';try{const rows=await chFetch(conv);if(CH.conv!==conv)return;CH.msgs=rows;CH.more=rows.length>=40?1:0;await chFetchRx(rows.map(x=>x.id));}catch(e){if(CH.conv===conv){CH.err=frErr(e.message)||'Erreur';toast(CH.err,4500);}}if(CH.conv!==conv)return;chSeen();chRender(1);chRead();}
async function chOlder(){const f=chReal()[0];if(!f)return;try{const rows=await chFetch(CH.conv,{before:f.id});CH.more=rows.length>=40?1:0;await chFetchRx(rows.map(x=>x.id));CH.msgs=rows.concat(CH.msgs);chRender(0,1);}catch(e){toast(frErr(e.message));}}
async function chPoll(){if(!CH.conv||document.hidden||!chOn())return;if(!CH.wsOk)chSeen();try{const l=chReal();const last=l.length?l[l.length-1].id:0;const rows=await chFetch(CH.conv,{after:last});let ch=0;if(rows.length){await chFetchRx(rows.map(x=>x.id));rows.forEach(r=>{if(!CH.msgs.some(x=>x.id===r.id)){CH.msgs.push(r);ch=1;}});}
  const ids=chReal().slice(-40).map(x=>x.id),before=JSON.stringify(ids.map(i=>CH.rx[i]||[]));await chFetchRx(ids);if(before!==JSON.stringify(ids.map(i=>CH.rx[i]||[])))ch=1;
  if(ch){chRender(1);chRead();}}catch(e){}}
function chRead(){if(!CH.conv||document.hidden)return;const real=chReal();const last=real.length?real[real.length-1].id:0;const c=CH.ov&&CH.ov.convs.find(x=>x.conv===CH.conv);
 if(!c||c.unread||(CH.rm[CH.conv]||0)<last||nfList().some(x=>x.go==='chat/'+CH.conv))chClear(CH.conv);
 if(!last)return;if((CH.rm[CH.conv]||0)>=last&&(!c||!c.unread))return;CH.rm[CH.conv]=last;if(c)c.unread=0;chBadge();chBcast('read',{u:chMe(),c:CH.conv,last});sbData('/rest/v1/rpc/chat_mark_read',{m:'POST',b:{f:SY.fid,c:CH.conv,last}}).catch(()=>{});}

/* ---- médias ---- */
async function chUpload(blob,mime,ext){if(SY.exp&&SY.exp-60000<Date.now())await syRefresh();const path=SY.fid+'/'+(crypto.randomUUID?crypto.randomUUID():uid()+uid()+uid())+'.'+ext;
 const r=await fetch(SB.url+'/storage/v1/object/chat/'+path,{method:'POST',headers:{apikey:SB.key,Authorization:'Bearer '+SY.at,'Content-Type':mime,'x-upsert':'false'},body:blob});
 if(!r.ok){let t='';try{t=(await r.json()).message||'';}catch(_){}throw new Error(t||('Envoi du fichier impossible ('+r.status+')'));}
 CH.mc.set(path,Promise.resolve(URL.createObjectURL(blob)));return path;}
function chMedia(p){if(!CH.mc.has(p))CH.mc.set(p,(async()=>{if(SY.exp&&SY.exp-60000<Date.now())await syRefresh();const r=await fetch(SB.url+'/storage/v1/object/authenticated/chat/'+p,{headers:{apikey:SB.key,Authorization:'Bearer '+SY.at}});if(!r.ok){CH.mc.delete(p);throw new Error('Fichier introuvable');}return URL.createObjectURL(await r.blob());})());return CH.mc.get(p);}
async function chImgPrep(file){let bmp=null,er=null,src=file;
 try{const ab=await file.arrayBuffer();if(!ab.byteLength)throw new Error('fichier vide');src=new Blob([ab],{type:file.type||'image/jpeg'});}catch(e){er=e;}
 const ld=()=>new Promise((ok,ko)=>{const u=URL.createObjectURL(src),i=new Image();i.onload=()=>ok(i);i.onerror=()=>ko(new Error('format non lisible'));i.src=u;});
 const sm=async()=>{const t=await createImageBitmap(src);const k=Math.min(1,1280/Math.max(t.width,t.height));if(k>=1)return t;const r=await createImageBitmap(src,{resizeWidth:Math.round(t.width*k),resizeHeight:Math.round(t.height*k),resizeQuality:'medium'});if(t.close)t.close();return r;};
 for(const f of [()=>createImageBitmap(src,{imageOrientation:'from-image'}),sm,()=>createImageBitmap(src),ld]){try{bmp=await f();if(bmp&&(bmp.width||bmp.naturalWidth))break;bmp=null;}catch(e){er=e;bmp=null;}}
 if(!bmp){if(src.size&&src.size<=6e6&&/^image\/(jpeg|png|webp)$/.test(src.type))return src;throw er||new Error('décodage impossible');}
 const w=bmp.width||bmp.naturalWidth,h=bmp.height||bmp.naturalHeight,k=Math.min(1,1280/Math.max(w,h));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(bmp,0,0,c.width,c.height);if(bmp.close)try{bmp.close();}catch(e){}
 const out=await new Promise(ok=>c.toBlob(b=>ok(b),'image/jpeg',.72));if(out)return out;if(src.size&&src.size<=6e6)return src;throw new Error('export JPEG impossible');}

/* ---- affichage d'un message (fil + admin) ---- */
function chBody(m,mine){if(m.deleted)return '<i class="mini">🚫 Message supprimé</i>';
 if(m.kind==='voice'){const d=m.dur||0;return `<div class="cva" data-id="${m.id}" data-p="${esc(m.media||'')}" data-l="${m.local||''}" data-d="${d}"><button class="cvp" type="button">▶️</button><input class="cvr" type="range" min="0" max="${Math.max(1,d*10)}" value="0"><span class="cvt">${chFmt(d)}</span><button class="cvx" type="button">${CHA.sp}×</button></div>`;}
 if(m.kind==='image')return `<img class="chi" data-p="${esc(m.media||'')}" data-l="${m.local||''}" alt="Photo">`;
 if(m.kind==='share'){const x=m.meta||{},ev=x.k!=='tk',have=(ev?evs():tks()).some(i=>i.id===x.id);return `<div class="chsh"><b data-nt>${ev?'📅':'✅'} ${esc(x.t||'')}</b><div class="mini" data-nt>${[x.d?fdate(x.d,1):'',x.tm,x.pl].filter(Boolean).map(esc).join(' · ')}${x.who?'<br>'+esc(x.who):''}</div><div class="row" style="margin-top:6px"><button class="btn alt chso" type="button" data-id="${m.id}">Ouvrir</button>${have?'':`<button class="btn chsa" type="button" data-id="${m.id}">➕ Ajouter</button>`}</div></div>`;}
 if(m.meta&&m.meta.rc)return mmRcHtml(m.meta,m.sender===chMe()?'أنا':chName(m.sender));
 if(m.meta&&m.meta.tip){const c=lgCatOf(m.meta.c);return `<div class="chtip" data-nt><div class="mini"><b>💡 ${esc(LGL('Astuce de','نصيحة من'))} ${esc(m.sender===chMe()?LGL('moi','أنا'):chName(m.sender))}</b> · ${c[1]} ${esc(isAr()?c[2].a:c[2].f)}</div><span dir="auto">${esc(m.body||'')}</span></div>`;}
 return `<span dir="auto" data-nt>${esc(m.body||'')}</span>`;}
function chHydrate(root){root.querySelectorAll('img.chi[data-p]').forEach(im=>{if(im.dataset.ok)return;const p=im.dataset.p,l=im.dataset.l;im.dataset.ok=1;if(l){im.src=l;return;}if(!p)return;chMedia(p).then(u=>{im.src=u;}).catch(()=>{im.alt='📷 Photo introuvable';});});}
function chAudUI(){document.querySelectorAll('.cva').forEach(el=>{const on=CHA.a&&CHA.id===el.dataset.id;const p=el.querySelector('.cvp');p.textContent=on&&!CHA.a.paused?'⏸️':'▶️';const r=el.querySelector('.cvr'),t=el.querySelector('.cvt'),d=+el.dataset.d||0;if(on){const ct=CHA.a.currentTime||0;r.value=Math.round(ct*10);t.textContent=chFmt(CHA.a.paused&&ct===0?d:Math.max(0,d-ct));}else{r.value=0;t.textContent=chFmt(d);}el.querySelector('.cvx').textContent=CHA.sp+'×';});}
async function chPlay(el){const id=el.dataset.id;if(CHA.a&&CHA.id===id){if(CHA.a.paused)CHA.a.play().catch(()=>{});else CHA.a.pause();return;}
 chAudStop();el.classList.add('ld');let u;try{u=el.dataset.l||await chMedia(el.dataset.p);}catch(e){toast('Vocal introuvable');el.classList.remove('ld');return;}el.classList.remove('ld');
 const a=new Audio(u);a.playbackRate=CHA.sp;CHA.a=a;CHA.id=id;a.onplay=a.onpause=a.ontimeupdate=chAudUI;a.onended=()=>{chAudStop();};a.play().catch(()=>{toast('Lecture impossible : touche l\'écran puis réessaie');});chAudUI();}
function chAudStop(){if(CHA.a){try{CHA.a.pause();}catch(_){}CHA.a.onplay=CHA.a.onpause=CHA.a.ontimeupdate=CHA.a.onended=null;}CHA.a=null;CHA.id='';chAudUI();}
function chZoom(src){document.querySelectorAll('.chz').forEach(x=>x.remove());const o=document.createElement('div');o.className='lv-ov chz';o.innerHTML='<button type="button" class="chzx" aria-label="Fermer">✕</button><img alt="">';o.querySelector('img').src=src;
 const kd=e=>{if(e.key==='Escape')close();},close=()=>{o.remove();document.removeEventListener('keydown',kd);};document.addEventListener('keydown',kd);o.addEventListener('click',close);document.body.appendChild(o);}
function chBindMedia(root){root.addEventListener('click',e=>{const t=e.target;
  if(t.closest('.cvp')){chPlay(t.closest('.cva'));return;}
  if(t.closest('.cvx')){CHA.sp=CHA.sp===1?1.5:CHA.sp===1.5?2:1;if(CHA.a)CHA.a.playbackRate=CHA.sp;chAudUI();return;}
  if(t.closest('img.chi')){const s=t.closest('img.chi').src;if(s)chZoom(s);}});
 root.addEventListener('load',e=>{if(e.target&&e.target.tagName==='IMG'&&CH.stick)root.scrollTop=root.scrollHeight;},true);
 root.addEventListener('scroll',()=>{CH.stick=root.scrollHeight-root.scrollTop-root.clientHeight<120;},{passive:true});
 root.addEventListener('input',e=>{const r=e.target.closest&&e.target.closest('.cvr');if(!r)return;const el=r.closest('.cva');if(CHA.a&&CHA.id===el.dataset.id)CHA.a.currentTime=r.value/10;});}

/* ---- le fil ---- */
function chDay(d){const t=today(),k=ld(d);if(k===t)return "Aujourd'hui";if(k===addD(t,-1))return 'Hier';return fdate(k,1);}
function chRender(bottom,keep){const L=$('#chL');if(!L)return;const near=L.scrollHeight-L.scrollTop-L.clientHeight<140;CH.stick=!!(bottom||near);const h0=L.scrollHeight;let html='',day='',fam=CH.conv==='fam';
 if(CH.more)html+='<button class="btn alt" id="chOl" type="button" style="align-self:center;margin:6px">↑ Messages plus anciens</button>';
 if(CH.err&&!CH.msgs.length)html+=`<div class="mini" style="text-align:center;margin:30px 10px">⚠️ Impossible de charger les messages.<div style="margin-top:6px" data-nt>${esc(CH.err)}</div><button class="btn" id="chRl" type="button" style="margin-top:10px">Réessayer</button></div>`;else if(!CH.msgs.length)html+=`<div class="mini" style="text-align:center;margin:30px 10px">Aucun message pour l'instant.<br>Écris le premier 👋</div>`;
 let lm=null;for(let j=CH.msgs.length-1;j>=0;j--){const x=CH.msgs[j];if(x.sender===chMe()&&!x.tmp&&!x.deleted){lm=x.id;break;}}
 CH.msgs.forEach((m,i)=>{const d=new Date(m.created_at),dk=ld(d);if(dk!==day){day=dk;html+=`<div class="chd">${chDay(d)}</div>`;}
  const mine=m.sender===chMe(),p=CH.msgs[i-1],first=!p||p.sender!==m.sender||ld(new Date(p.created_at))!==dk;
  const rx=(CH.rx[m.id]||[]),g={};rx.forEach(r=>{g[r.e]=g[r.e]||{n:0,me:0};g[r.e].n++;if(r.u===chMe())g[r.e].me=1;});
  const pills=Object.entries(g).map(([e,v])=>`<button class="chrx ${v.me?'on':''}" type="button" data-id="${m.id}" data-e="${e}">${e}${v.n>1?' '+v.n:''}</button>`).join('');
  const tk=chTk(m,m.id===lm);const st=m.tmp?(m.st==='f'?'<button class="chrt" type="button" data-id="'+m.id+'">⚠️ Non envoyé · réessayer</button>':'⏳'):'';
  html+=`<div class="chm ${mine?'me':'th'}" data-id="${m.id}">${!mine&&fam&&first?`<div class="chn" data-nt style="color:${chCol(m.sender)}">${chAvSpan(m.sender,chIni(m.sender),chCol(m.sender),'xs')}${esc(chName(m.sender))}</div>`:''}<div class="chb ${m.kind}">${chQuote(m)}${chBody(m,mine)}</div>${pills?`<div class="chr">${pills}</div>`:''}<div class="cht"><span>${hhmm(d)}</span>${tk}${st}${m.tmp||m.deleted?'':`<button class="chmn" type="button" data-id="${m.id}" aria-label="Options">⋯</button>`}</div></div>`;});
 L.innerHTML=html;chHydrate(L);chAudUI();
 if(bottom||near)L.scrollTop=L.scrollHeight;else if(keep){CH.stick=false;L.scrollTop=L.scrollHeight-h0;}
 const ty=$('#chTy');if(ty)chTypUI();}
function chTypUI(){const ty=$('#chTy');if(!ty)return;const now=Date.now(),who=Object.entries(CH.tp).filter(([u,t])=>now-t<4500&&(CH.conv==='fam'||u===CH.conv)).map(([u])=>chName(u));ty.textContent=who.length?(who[0]+(isAr()?' يكتب…':' écrit…')):'';}
function chSheet(id){const m=CH.msgs.find(x=>String(x.id)===String(id));if(!m||m.tmp)return;const mine=m.sender===chMe();const d=document.createElement('div');d.className='lv-ov chsh2';
 d.innerHTML=`<div class="lv-card" style="padding:14px;max-width:340px"><div class="chem">${CHE.map(e=>`<button type="button" data-e="${e}">${e}</button>`).join('')}</div><div style="display:grid;gap:8px;margin-top:10px">${m.deleted?'':'<button class="btn alt" id="shRe" type="button">↩️ Répondre</button>'}${m.kind==='text'?'<button class="btn alt" id="shCp" type="button">📋 Copier</button>':''}${mine?'<button class="btn alt" id="shDl" type="button" style="color:#c62828">🗑️ Supprimer pour tous</button>':''}<button class="btn" id="shX" type="button">Fermer</button></div></div>`;
 document.body.appendChild(d);const close=()=>d.remove();d.onclick=e=>{if(e.target===d)close();};$('#shX',d).onclick=close;
 d.querySelectorAll('.chem button').forEach(b=>b.onclick=()=>{close();chReact(m.id,b.dataset.e);});
 const re=$('#shRe',d);if(re)re.onclick=()=>{close();CH.re={id:m.id,s:m.sender,k:m.kind,t:chRePrev(m)};chReUI();};
 const cp=$('#shCp',d);if(cp)cp.onclick=()=>{try{navigator.clipboard.writeText(m.body||'');toast('Copié');}catch(e){toast('Copie impossible');}close();};
 const dl=$('#shDl',d);if(dl)dl.onclick=async()=>{close();if(!confirm('Supprimer ce message pour tout le monde ?'))return;try{await sbData('/rest/v1/rpc/chat_delete',{m:'POST',b:{mid:m.id}});m.deleted=true;m.body=null;m.meta=null;chRender();}catch(e){toast(frErr(e.message));}};}
async function chReact(id,e){const rx=CH.rx[id]=CH.rx[id]||[];const me=chMe(),i=rx.findIndex(r=>r.u===me),same=i>=0&&rx[i].e===e;if(same)rx.splice(i,1);else if(i>=0)rx[i].e=e;else rx.push({u:me,e});chRender();
 try{await sbData('/rest/v1/rpc/chat_react',{m:'POST',b:{mid:id,e}});}catch(x){toast(frErr(x.message));chPoll();}}

/* ---- lecture, vu, réponses, photos de profil ---- */
function chClearBell(conv,minAge){const l=nfList(),go='chat/'+conv,lim=Date.now()-(minAge||0);const k=l.filter(x=>!(x.go===go&&x.ts<=lim));if(k.length!==l.length){S.nf=k;save();nfBadge();return 1;}return 0;}
function chClearSys(conv){try{if(!navigator.serviceWorker)return;navigator.serviceWorker.getRegistration().then(r=>{if(r&&r.getNotifications)return r.getNotifications({tag:'chat-'+conv}).then(a=>a.forEach(n=>n.close()));}).catch(()=>{});}catch(e){}}
function chClear(conv){chClearBell(conv,0);chClearSys(conv);}
function chBcast(ev,p){try{if(CH.ws&&CH.wsOk)CH.ws.send(JSON.stringify({topic:'realtime:chat-'+SY.fid,event:'broadcast',payload:{type:'broadcast',event:ev,payload:p},ref:String(++CH.n)}));}catch(_){}}
function chOnRead(p){if(!p||!p.u||!p.c)return;const me=chMe(),last=Number(p.last)||0;
 if(p.u===me){CH.rm[p.c]=Math.max(CH.rm[p.c]||0,last);const c=CH.ov&&CH.ov.convs.find(x=>x.conv===p.c);if(c&&(!c.last||last>=c.last.id))c.unread=0;if(!c||!c.unread)chClear(p.c);chBadge();if($('#chLs'))chListDraw();return;}
 const mine=p.c==='fam'?CH.conv==='fam':(p.c===me&&CH.conv===p.u);
 if(mine){CH.sn[p.u]=Math.max(CH.sn[p.u]||0,last);chRender();}}
async function chSeen(){if(!CH.conv||!chOn())return;const conv=CH.conv;try{const r=await sbData('/rest/v1/rpc/chat_seen',{m:'POST',b:{f:SY.fid,c:conv}})||[];if(CH.conv!==conv)return;const o={};r.forEach(x=>{o[x.u]=Number(x.last)||0;});if(JSON.stringify(o)!==JSON.stringify(CH.sn)){CH.sn=o;chRender();}}catch(e){}}
function chTk(m,isLast){if(m.sender!==chMe()||m.tmp||m.deleted)return '';const me=chMe(),fam=CH.conv==='fam';const ids=fam?chMem().filter(x=>x.id!==me).map(x=>x.id):[CH.conv];if(!ids.length)return '';
 const seen=ids.filter(u=>(CH.sn[u]||0)>=m.id),some=seen.length>0,all=seen.length===ids.length;
 let h=`<span class="chk${all?' on':''}" aria-hidden="true">${some?'✓✓':'✓'}</span>`;
 if(isLast&&some){const ar=isAr();h+=`<span data-nt>${fam?(all?(ar?'شاهدها الجميع':'Vu par tous'):(ar?'شاهدها ':'Vu par ')+esc(seen.map(u=>chName(u)).join(', '))):(ar?'شوهدت':'Vu')}</span>`;}
 return h;}
const chRePrev=m=>m.kind==='voice'?'🎤 Message vocal':m.kind==='image'?'📷 Photo':m.kind==='share'?(m.meta&&m.meta.k==='tk'?'✅ Tâche partagée':'📅 RDV partagé'):String(m.body||'').replace(/\s+/g,' ').slice(0,80);
const chReWho=s=>s===chMe()?(isAr()?'أنت':'Toi'):chName(s);
function chMeta(extra){const m=Object.assign({},extra||{});if(CH.re){m.re=CH.re;CH.re=null;chReUI();}return Object.keys(m).length?m:null;}
function chReUI(){const R=$('#chRq');if(!R)return;const q=CH.re;if(!q){R.innerHTML='';R.style.display='none';return;}R.style.display='flex';
 R.innerHTML=`<div class="chq2"><b data-nt>${esc(chReWho(q.s))}</b><span data-nt>${q.k==='text'?esc(q.t):esc(trS(q.t))}</span></div><button type="button" id="chRqX" aria-label="Annuler">✕</button>`;$('#chRqX').onclick=()=>{CH.re=null;chReUI();};const t=$('#chT');if(t)t.focus();}
function chQuote(m){const q=m.meta&&m.meta.re;if(!q||m.deleted)return '';const o=CH.msgs.find(x=>String(x.id)===String(q.id));const gone=o&&o.deleted;
 const tx=gone?esc(trS('🚫 Message supprimé')):q.k==='text'?esc(String(q.t||'')):esc(trS(String(q.t||'')));
 return `<div class="chq" data-q="${esc(q.id)}"><b data-nt>${esc(chReWho(q.s))}</b><span data-nt>${tx}</span></div>`;}
function chJump(id){const el=document.querySelector('#chL .chm[data-id="'+String(id).replace(/[^0-9a-z]/gi,'')+'"]');if(el){el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.add('chfl');setTimeout(()=>el.classList.remove('chfl'),1500);}else toast('Message plus ancien : charge d\'abord les messages précédents');}
/* photos de profil */
const AV={m:(()=>{try{return JSON.parse(localStorage.getItem('gp-av')||'{}')||{};}catch(e){return {};}})(),busy:0};
const avOk=x=>typeof x==='string'&&x.length<65000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(x);
const avSave=()=>{try{localStorage.setItem('gp-av',JSON.stringify(AV.m));}catch(e){}};
const avStyle=id=>{const a=AV.m[id];return a&&avOk(a.img)?`background:#cfd8dc url(${a.img}) center/cover no-repeat`:'';};
function chAvSpan(id,ic,col,cls){const st=avStyle(id);return `<span class="chav${cls?' '+cls:''}" style="${st||('background:'+col)}">${st?'':ic}</span>`;}
const chIni=id=>esc(String((chMem().find(x=>x.id===id)||{}).name||'?').trim().charAt(0).toUpperCase()||'?');
const chHeadAv=conv=>conv==='fam'?chAvSpan('fam','👪','#8e24aa','hd'):chAvSpan(conv,chIni(conv),chCol(conv),'hd');
function avRedraw(){if($('#chLs'))chListDraw();else if(CH.conv){const h=$('#chHav');if(h)h.innerHTML=chHeadAv(CH.conv);chRender();}const a=$('#acAvI');if(a)a.innerHTML=chAvSpan(chMe(),esc((S.me||'?').trim().charAt(0).toUpperCase()||'?'),chCol(chMe()),'big');}
async function avSync(){if(AV.busy||!CH.ov)return;const keep={};let need=0,ch=0;chMem().forEach(m=>{if(m.av){keep[m.id]=1;if(!AV.m[m.id]||AV.m[m.id].v!==m.av)need=1;}});
 Object.keys(AV.m).forEach(k=>{if(!keep[k]){delete AV.m[k];ch=1;}});
 if(need){AV.busy=1;try{const r=await sbData('/rest/v1/rpc/avatar_get',{m:'POST',b:{f:SY.fid}})||{};Object.keys(r).forEach(k=>{if(r[k]&&avOk(r[k].img)){AV.m[k]={v:r[k].v,img:r[k].img};ch=1;}});}catch(e){}AV.busy=0;}
 if(ch){avSave();avRedraw();}}
async function avPrep(file){const b=await chImgPrep(file);const bmp=await createImageBitmap(b);const w=bmp.width,h=bmp.height,n=Math.min(w,h),c=document.createElement('canvas');c.width=c.height=192;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,192,192);g.drawImage(bmp,(w-n)/2,(h-n)/2,n,n,0,0,192,192);
 for(const q of [.82,.7,.55,.4]){const u=c.toDataURL('image/jpeg',q);if(u.length<=50000)return u;}throw new Error('photo trop lourde');}
async function avSet(file){try{const u=file?await avPrep(file):'';await sbData('/rest/v1/rpc/avatar_set',{m:'POST',b:{img:u}});if(u)AV.m[chMe()]={v:0,img:u};else delete AV.m[chMe()];avSave();avRedraw();toast(u?'Photo de profil mise à jour ✅':'Photo retirée');await chOverview();}catch(e){toast(file&&!/^(Non connecté|Photo invalide)/.test(String(e&&e.message))&&!e.status?'Photo illisible ('+String(e&&e.message||e).slice(0,50)+')':frErr(e.message));}}

/* ---- téléphone / appel ---- */
const PH={m:(()=>{try{return JSON.parse(localStorage.getItem('gp-ph')||'{}')||{};}catch(e){return {};}})(),t:0};
const phSave=()=>{try{localStorage.setItem('gp-ph',JSON.stringify(PH.m));}catch(e){}};
function phNorm(v){let x=String(v||'').replace(/[\s.\-()]/g,'');if(/^00/.test(x))x='+'+x.slice(2);if(/^0\d{9}$/.test(x))x='+33'+x.slice(1);return /^\+[1-9]\d{7,14}$/.test(x)?x:'';}
async function phSync(force){if(!SY.fid||(!force&&Date.now()-PH.t<60000))return;PH.t=Date.now();try{const r=await sbData('/rest/v1/rpc/phone_get',{m:'POST',b:{f:SY.fid}})||{};const n={};Object.keys(r).forEach(k=>{const q=phNorm(r[k]);if(q)n[k]=q;});if(JSON.stringify(n)!==JSON.stringify(PH.m)){PH.m=n;phSave();}}catch(e){}}
async function phSet(v){const raw=String(v||'').trim();const q=raw?phNorm(raw):'';if(raw&&!q){toast('Numéro invalide : écris-le avec l’indicatif, ex. +33 6 12 34 56 78',3500);return false;}
 try{await sbData('/rest/v1/rpc/phone_set',{m:'POST',b:{n:q}});if(q)PH.m[chMe()]=q;else delete PH.m[chMe()];phSave();toast(q?'Numéro enregistré ✅':'Numéro retiré');return q;}catch(e){toast(frErr(e.message));return false;}}
async function chCallOpen(conv){let q=PH.m[conv];if(!q){await phSync(1);q=PH.m[conv];}if(!q){toast(chName(conv)+' n’a pas encore enregistré son numéro (👤 Mon compte)',3500);return;}if($('#callO'))return;
 const o=document.createElement('div');o.className='callO';o.id='callO';
 o.innerHTML=`<div class="callC"><b data-nt>${esc(chName(conv))}</b><a class="btn" href="https://wa.me/${q.slice(1)}" target="_blank" rel="noopener">💬 WhatsApp</a><a class="btn alt" href="tel:${q}">📞 Appel normal</a><button class="btn alt" type="button" id="callX">Annuler</button></div>`;
 document.body.appendChild(o);try{trNode(o);}catch(e){}
 o.addEventListener('click',e=>{if(e.target===o||e.target.closest('#callX')||e.target.closest('a'))setTimeout(()=>o.remove(),60);});}

/* ---- envoi ---- */
function chPost(o){const tmp={id:'t'+(++CH.n),tmp:1,st:'p',sender:chMe(),to_user:o.conv==='fam'?null:o.conv,kind:o.kind,body:o.body||null,media:o.media||null,mime:o.mime||null,dur:o.dur||null,meta:o.meta||null,created_at:new Date().toISOString(),_o:o};
 if(o.blob)tmp.local=URL.createObjectURL(o.blob);CH.msgs.push(tmp);if(CH.conv===o.conv)chRender(1);chSend(tmp);}
async function chSend(tmp){const o=tmp._o;tmp.st='p';try{if(o.blob&&!o.media)o.media=await chUpload(o.blob,o.mime,o.ext);
  const id=await sbData('/rest/v1/rpc/chat_send',{m:'POST',b:{f:SY.fid,to_u:o.conv==='fam'?null:o.conv,k:o.kind,b:o.body||null,m:o.media||null,mi:o.mime||null,d:o.dur||null,mt:o.meta||null}});
  const i=CH.msgs.indexOf(tmp);if(CH.msgs.some(x=>x.id===id)){if(i>=0)CH.msgs.splice(i,1);}else if(i>=0){Object.assign(tmp,{id,tmp:0,st:'',media:o.media});delete tmp._o;}
  if(CH.ov){const c=CH.ov.convs.find(x=>x.conv===o.conv);const l={id,kind:o.kind,body:(o.body||'').slice(0,80),sender:chMe(),deleted:false,created_at:new Date().toISOString()};if(c)c.last=l;else CH.ov.convs.push({conv:o.conv,last:l,unread:0});}
 }catch(e){tmp.st='f';if(e.net)toast('Pas de connexion : touche « réessayer »');else toast(frErr(e.message));}
 if(CH.conv===o.conv)chRender();}
function chSendText(){const t=$('#chT');if(!t)return;const v=t.value.trim();if(!v)return;t.value='';t.style.height='auto';chSendBtn();chPost({conv:CH.conv,kind:'text',body:v.slice(0,2000),meta:chMeta()});}
function chSendBtn(){const t=$('#chT'),b=$('#chS');if(!t||!b)return;b.textContent=t.value.trim()?'➤':'🎤';b.dataset.m=t.value.trim()?'s':'r';}
function chTyping(){const now=Date.now();if(now-(CH.lt||0)<2500||!CH.ws||!CH.wsOk)return;CH.lt=now;try{CH.ws.send(JSON.stringify({topic:'realtime:chat-'+SY.fid,event:'broadcast',payload:{type:'broadcast',event:'typing',payload:{u:chMe(),c:CH.conv==='fam'?'fam':CH.conv}},ref:String(++CH.n)}));}catch(_){}}

/* ---- vocal ---- */
function chRecMime(){const l=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'];if(!window.MediaRecorder)return '';return l.find(m=>{try{return MediaRecorder.isTypeSupported(m);}catch(e){return false;}})||'';}
async function chRecStart(){if(!navigator.mediaDevices||!window.MediaRecorder){toast('Vocal non disponible sur ce navigateur');return;}let st;try{st=await navigator.mediaDevices.getUserMedia({audio:true});}catch(e){const n=e&&e.name;toast(n==='NotFoundError'||n==='OverconstrainedError'?'Aucun micro trouvé sur cet appareil':n==='NotAllowedError'||n==='SecurityError'?'Micro refusé : autorise-le dans les réglages du site':'Micro indisponible : '+(n||'erreur'),4500);return;}
 const stopSt=()=>{try{st.getTracks().forEach(t=>t.stop());}catch(e){}};
 if(CH.rec||document.hidden||!chOn()){stopSt();return;}
 let mt,rc;try{mt=chRecMime();rc=new MediaRecorder(st,mt?{mimeType:mt}:undefined);}catch(e){stopSt();toast('Vocal non disponible sur ce navigateur');return;}
 const ch=[];const R=CH.rec={rc,st,ch,t0:Date.now(),conv:CH.conv,send:0,mt:(mt||rc.mimeType||'audio/webm').split(';')[0]};
 rc.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data);};
 st.getTracks().forEach(t=>{t.onended=()=>{if(CH.rec===R)chRecStop(1);};});
 rc.onstop=()=>{stopSt();clearInterval(R.tm);const dur=Math.round((Date.now()-R.t0)/1000);const send=R.send;CH.rec=null;chComposer();if(!send)return;if(dur<1){toast('Vocal trop court');return;}const blob=new Blob(ch,{type:R.mt});const ext=/mp4/.test(R.mt)?'m4a':/ogg/.test(R.mt)?'ogg':'webm';chPost({conv:R.conv,kind:'voice',blob,mime:R.mt,ext,dur:Math.min(120,dur),meta:chMeta()});};
 rc.start(250);R.tm=setInterval(()=>{const s=(Date.now()-R.t0)/1000;const el=$('#chRt');if(el)el.textContent=chFmt(s);if(s>=120)chRecStop(1);},250);chComposer();}
function chRecStop(send){const R=CH.rec;if(!R)return;R.send=send?1:0;clearInterval(R.tm);if(!send)try{R.st.getTracks().forEach(t=>t.stop());}catch(e){}else setTimeout(()=>{try{R.st.getTracks().forEach(t=>t.stop());}catch(e){}},1500);try{if(R.rc.state!=='inactive')R.rc.stop();else{CH.rec=null;chComposer();}}catch(e){CH.rec=null;chComposer();}}
/* libère le micro dès que l'appli passe en arrière-plan (appel, autre appli) */
function chMicFree(){if(CH.rec){const long=(Date.now()-CH.rec.t0)>1500;chRecStop(0);if(long)toast('Vocal annulé : appli passée en arrière-plan');}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)chMicFree();});window.addEventListener('pagehide',chMicFree);

/* ---- partage RDV / tâche ---- */
function chShareOpen(){const t=today(),seen=new Set(),rows=[];for(let i=0;i<30;i++){itemsOn(addD(t,i)).forEach(x=>{if(x.k==='bd')return;const k=x.k+x.id;if(seen.has(k))return;seen.add(k);rows.push({k:x.k,id:x.id,t:x.t,d:x.date,tm:x.tm,pl:x.pl,w:x.w});});}
 tks().filter(x=>!x.dn&&!x.d).forEach(x=>rows.push({k:'tk',id:x.id,t:x.t,d:'',tm:'',w:x.w}));
 const d=document.createElement('div');d.className='lv-ov chsh2';d.innerHTML=`<div class="lv-card" style="padding:14px;max-width:420px;max-height:80vh;overflow:auto;text-align:start"><h3 style="margin:0 0 8px">📅 Partager un rendez-vous ou une tâche</h3>${rows.length?rows.map((r,i)=>`<button class="btn alt chpk" type="button" data-i="${i}" style="display:block;width:100%;text-align:start;margin:5px 0">${r.k==='tk'?'✅':'📅'} <b>${esc(r.t)}</b><div class="mini">${[r.d?fdate(r.d,1):'sans date',r.tm].filter(Boolean).map(esc).join(' · ')}</div></button>`).join(''):'<div class="mini">Rien à partager pour le moment.</div>'}<div style="text-align:end;margin-top:8px"><button class="btn" id="chpX" type="button">Fermer</button></div></div>`;
 document.body.appendChild(d);const close=()=>d.remove();d.onclick=e=>{if(e.target===d)close();};$('#chpX',d).onclick=close;
 d.querySelectorAll('.chpk').forEach(b=>b.onclick=()=>{const r=rows[+b.dataset.i];close();const who=(r.w||[]).map(i=>{const p=person(i);return p?p.e+' '+p.n:'';}).filter(Boolean).join(', ');
  chPost({conv:CH.conv,kind:'share',meta:chMeta({k:r.k,id:r.id,t:r.t,d:r.d||'',tm:r.tm||'',pl:r.pl||'',who})});});}
function chShareOpenItem(m){const x=m.meta||{};if(x.k==='tk'){go('tasks');return;}if(x.d){const d=pdt(x.d);CAL.y=d.getFullYear();CAL.m=d.getMonth();CAL.sel=x.d;}go('cal');}
function chShareAdd(m){const x=m.meta||{};const o={id:uid(),t:x.t||'',d:x.d||'',tm:x.tm||'',w:[],nt:'',rp:'',rm:x.k==='tk'?'':'60'};if(x.k==='tk'){Object.assign(o,{pr:0,dn:0});tks().push(o);}else{o.pl=x.pl||'';if(!o.d)o.d=today();evs().push(o);}if(S.me)o.by=S.me;save();toast('Ajouté ✅');chRender();}

/* ---- écrans ---- */
function chTitle(c){return c==='fam'?'👪 '+(SY.fname||'Famille'):chName(c);}
function chListDraw(){const L=$('#chLs');if(!L)return;const ov=CH.ov,me=chMe();if(!ov){L.innerHTML='<div class="mini">Chargement…</div>';return;}
 const cv=id=>ov.convs.find(c=>c.conv===id);
 const row=(id,ic,name,col)=>{const c=cv(id),l=c&&c.last;return `<div class="card chrow" data-c="${id}">${chAvSpan(id,ic,col)}<div style="flex:1;min-width:0"><b data-nt>${esc(name)}</b><div class="mini chlp" dir="auto" data-nt>${l?(l.sender===me?(isAr()?'أنت : ':'Toi : '):'')+esc(chPrev(l)):trS('Aucun message')}</div></div>${l?`<span class="mini">${hhmm(new Date(l.created_at))}</span>`:''}${c&&c.unread?`<span class="chub">${c.unread}</span>`:''}</div>`;};
 const others=ov.members.filter(m=>m.id!==me).sort((a,b)=>{const la=(cv(a.id)||{}).last,lb=(cv(b.id)||{}).last;return (lb?lb.created_at:'')<(la?la.created_at:'')?-1:(lb?lb.created_at:'')>(la?la.created_at:'')?1:a.name.localeCompare(b.name);});
 L.innerHTML=row('fam','👪',SY.fname||'Toute la famille','#8e24aa')+(others.length?'<div class="mini" style="margin:12px 4px 2px">Conversations à deux</div>':'')+others.map(m=>row(m.id,chIni(m.id),m.name,chCol(m.id))).join('')+(others.length?'':'<div class="mini" style="margin:12px 4px">Les autres membres de ta famille apparaîtront ici dès qu\'ils auront rejoint avec le code.</div>');
 L.querySelectorAll('.chrow').forEach(r=>r.onclick=()=>go('chat/'+r.dataset.c));}
function chLeave(){document.querySelectorAll('.chz').forEach(x=>x.remove());if(CH.poll){clearInterval(CH.poll);CH.poll=null;}if(CH.rec)chRecStop(0);chAudStop();if(CH.vvf&&window.visualViewport){visualViewport.removeEventListener('resize',CH.vvf);visualViewport.removeEventListener('scroll',CH.vvf);CH.vvf=null;}CH.conv='';CH.sn={};CH.re=null;}
function viewChat(conv){if(CH.conv&&CH.conv!==conv)chLeave();
 if(!SY.fid){setApp(`<div class="banner" style="--c:#00897b"><h1>💬 Discussions</h1></div><div class="card">Rejoins d'abord une famille pour pouvoir discuter avec elle.<div class="row" style="margin-top:8px"><button class="btn" onclick="go('fam')">👪 Rejoindre une famille</button></div></div>`);return;}
 if(!conv){CH.conv='';setApp(`<div class="banner" style="--c:#00897b"><h1>💬 Discussions</h1><div class="mini" style="color:#fff;opacity:.9">En direct · vocaux · photos</div></div><div class="mini" style="margin:6px 2px 10px">🔒 Les messages sont visibles uniquement par la famille.</div><div id="chLs"></div>`);chListDraw();chOverview();return;}
 CH.conv=conv;CH.msgs=[];CH.more=0;CH.sn={};CH.re=null;
 setApp(`<div class="chv" id="chV"><div class="chh"><button class="btn alt" id="chBk" type="button" style="padding:6px 12px">←</button><span id="chHav">${chHeadAv(conv)}</span><div style="flex:1;min-width:0"><b class="chtt">${esc(chTitle(conv))}</b><div class="mini" id="chTy" style="min-height:1em"></div></div>${conv!=='fam'?'<button class="btn alt" id="chCall" type="button" aria-label="Appeler" style="padding:6px 12px">📞</button>':''}</div><div class="chl" id="chL"><div class="mini" style="text-align:center;margin:30px">Chargement…</div></div><div id="chRq"></div><div class="chc" id="chC"></div></div>`);
 const V=$('#chV'),pos=()=>{const th=($('.top')||{}).offsetHeight||56,vv=window.visualViewport;V.style.top=((vv?vv.offsetTop:0)+th)+'px';V.style.height=((vv?vv.height:innerHeight)-th)+'px';V.style.bottom='auto';};pos();
 if(window.visualViewport){CH.vvf=()=>{if($('#chV')){pos();const L=$('#chL');if(L)L.scrollTop=L.scrollHeight;}};visualViewport.addEventListener('resize',CH.vvf);visualViewport.addEventListener('scroll',CH.vvf);}
 $('#chBk').onclick=()=>go('chat');const cb=$('#chCall');if(cb){cb.onclick=()=>chCallOpen(conv);phSync();}const L=$('#chL');chBindMedia(L);
 L.addEventListener('click',e=>{const t=e.target;let b;
  if(b=t.closest('#chOl')){chOlder();return;}
  if(b=t.closest('#chRl')){chLoad(CH.conv);return;}
  if(b=t.closest('.chq')){chJump(b.dataset.q);return;}
  if(b=t.closest('.chmn')){chSheet(b.dataset.id);return;}
  if(b=t.closest('.chrx')){chReact(+b.dataset.id,b.dataset.e);return;}
  if(b=t.closest('.chrt')){const m=CH.msgs.find(x=>String(x.id)===b.dataset.id);if(m){m.st='p';chRender();chSend(m);}return;}
  if(b=t.closest('.chso')){const m=CH.msgs.find(x=>String(x.id)===b.dataset.id);if(m)chShareOpenItem(m);return;}
  if(b=t.closest('.chsa')){const m=CH.msgs.find(x=>String(x.id)===b.dataset.id);if(m)chShareAdd(m);return;}});
 L.addEventListener('contextmenu',e=>{const m=e.target.closest('.chm');if(m&&!e.target.closest('a')){e.preventDefault();chSheet(m.dataset.id);}});
 chComposer();chLoad(conv);CH.poll=setInterval(()=>{if(CH.wsOk&&++CH.pc%5)return;chPoll();chTypUI();},4000);CH.pc=0;}
function chComposer(){const C=$('#chC');if(!C)return;
 if(CH.rec){C.innerHTML=`<button class="btn alt chsend" id="chRc" type="button" aria-label="Annuler">🗑️</button><div class="chrec"><span class="chdot"></span><b id="chRt">0:00</b><span class="mini">Enregistrement…</span></div><button class="btn chsend" id="chRs" type="button" aria-label="Envoyer">➤</button>`;$('#chRc').onclick=()=>chRecStop(0);$('#chRs').onclick=()=>chRecStop(1);return;}
 C.innerHTML=`<button class="btn alt chsend" id="chA" type="button" aria-label="Joindre">📎</button><textarea id="chT" rows="1" dir="auto" placeholder="Écrire un message…"></textarea><button class="btn chsend" id="chS" type="button" data-m="r">🎤</button><input type="file" id="chF" accept="image/*" hidden>`;
 const t=$('#chT');t.oninput=()=>{t.style.height='auto';t.style.height=Math.min(120,t.scrollHeight)+'px';chSendBtn();chTyping();};
 t.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&matchMedia('(pointer:fine)').matches){e.preventDefault();chSendText();}};
 $('#chS').onclick=()=>{if($('#chS').dataset.m==='s')chSendText();else chRecStart();};
 $('#chA').onclick=()=>{if($('#chMn')){$('#chMn').remove();return;}const m=document.createElement('div');m.id='chMn';m.className='chmenu';m.innerHTML='<button type="button" id="chM1">📷 Photo</button><button type="button" id="chM2">📅 RDV ou tâche</button>';C.appendChild(m);$('#chM1').onclick=()=>{m.remove();$('#chF').click();};$('#chM2').onclick=()=>{m.remove();chShareOpen();};};
 $('#chF').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;if(!/^image\//.test(f.type)){toast('Choisis une photo');return;}let blob;try{blob=await chImgPrep(f);}catch(x){toast('Photo illisible ('+String(x&&x.message||x).slice(0,60)+')');return;}try{chPost({conv:CH.conv,kind:'image',meta:chMeta(),blob,mime:blob.type||'image/jpeg',ext:(blob.type||'').includes('png')?'png':(blob.type||'').includes('webp')?'webp':'jpg'});}catch(x){toast('Envoi impossible : '+String(x&&x.message||x).slice(0,60));}};}

/* ---- temps réel ---- */
function chRtStart(){if(!chOn()||CH.ws||CH.stop)return;let ws;try{ws=new WebSocket(SB.url.replace(/^http/,'ws')+'/realtime/v1/websocket?apikey='+SB.key+'&vsn=1.0.0');}catch(e){return;}
 CH.ws=ws;const topic='realtime:chat-'+SY.fid,fid=SY.fid;let ref=0;const send=o=>{try{ws.send(JSON.stringify(o));}catch(e){}};CH.tok=SY.at;
 ws.onopen=()=>{send({topic,event:'phx_join',payload:{config:{broadcast:{self:false,ack:false},presence:{key:''},postgres_changes:[{event:'*',schema:'public',table:'messages',filter:'family_id=eq.'+fid},{event:'*',schema:'public',table:'msg_reactions',filter:'family_id=eq.'+fid}],private:false},access_token:SY.at},ref:String(++ref),join_ref:'1'});
  CH.hb=setInterval(()=>{send({topic:'phoenix',event:'heartbeat',payload:{},ref:String(++ref)});if(CH.tok!==SY.at&&SY.at){CH.tok=SY.at;send({topic,event:'access_token',payload:{access_token:SY.at},ref:String(++ref)});}},25000);};
 ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(_){return;}if(!m)return;
  if(m.event==='phx_reply'&&m.topic===topic){if(m.payload&&m.payload.status==='ok'){const was=CH.wsOk;CH.wsOk=1;CH.back=0;if(!was)chCatchUp();}else CH.wsOk=0;}
  else if(m.event==='postgres_changes'&&m.payload&&m.payload.data)chOnRt(m.payload.data);
  else if(m.event==='broadcast'&&m.payload&&m.payload.event==='read')chOnRead(m.payload.payload||{});
  else if(m.event==='broadcast'&&m.payload&&m.payload.event==='typing'){const p=m.payload.payload||{};if(p.u&&p.u!==chMe()&&((p.c==='fam'&&CH.conv==='fam')||(p.c===chMe()&&p.u===CH.conv))){CH.tp[p.u]=Date.now();chTypUI();setTimeout(chTypUI,4700);}}};
 ws.onclose=()=>{clearInterval(CH.hb);if(CH.ws===ws){CH.ws=null;CH.wsOk=0;}if(!CH.stop&&chOn())setTimeout(chRtStart,Math.min(30000,CH.back=(CH.back||2000)*1.7));};
 ws.onerror=()=>{try{ws.close();}catch(_){}};}
function chCatchUp(){chOverview();if(CH.conv){chPoll();chSeen();}}
function chOnRt(d){const r=d.record||{},o=d.old_record||{};
 if(d.table==='msg_reactions'){const id=r.msg_id||o.msg_id;if(!id)return;const a=CH.rx[id]=CH.rx[id]||[];const u=r.user_id||o.user_id;const i=a.findIndex(x=>x.u===u);if(d.type==='DELETE'){if(i>=0)a.splice(i,1);}else if(i>=0)a[i].e=r.emoji;else a.push({u,e:r.emoji});if(CH.conv&&CH.msgs.some(x=>x.id===id))chRender();return;}
 if(d.table!=='messages')return;const me=chMe(),conv=chConvOf(r);
 if(d.type==='UPDATE'){const m=CH.msgs.find(x=>x.id===r.id);if(m){Object.assign(m,{deleted:r.deleted,body:r.body,meta:r.meta});chRender();}if(CH.ov){const c=CH.ov.convs.find(x=>x.conv===conv);if(c&&c.last&&c.last.id===r.id){c.last.deleted=r.deleted;c.last.body=r.body;}}return;}
 if(d.type!=='INSERT')return;
 if(CH.conv===conv){if(!CH.msgs.some(x=>x.id===r.id)){CH.msgs.push(r);chRender();}if(r.sender!==me)chRead();}
 if(r.sender===me)return;
 if(CH.conv===conv&&!document.hidden){chOvBump(conv,r,0);return;}
 chOvBump(conv,r,1);nfAdd('💬',chName(r.sender)+' : '+chPrev(r).slice(0,60),'chat/'+conv,'cm'+conv+':'+(CH.rm[conv]||0),'chat-'+(conv==='fam'?'fam':r.sender));}
function chOvBump(conv,r,un){if(!CH.ov){chOverview();return;}let c=CH.ov.convs.find(x=>x.conv===conv);if(!c){c={conv,last:null,unread:0};CH.ov.convs.push(c);}c.last={id:r.id,kind:r.kind,body:String(r.body||'').slice(0,80),sender:r.sender,deleted:r.deleted,created_at:r.created_at};if(un)c.unread=(c.unread||0)+1;chBadge();if($('#chLs'))chListDraw();}
function chTick(){if(!chOn()){if(CH.ws||CH.ov)chStop();return;}CH.stop=0;if(!CH.ov)chOverview();if(!CH.ws)chRtStart();pushInit();}
function chStop(){CH.stop=1;try{CH.ws&&CH.ws.close();}catch(e){}CH.ws=null;CH.wsOk=0;CH.ov=null;CH.msgs=[];CH.rx={};CH.rm={};CH.sn={};CH.re=null;CH.psub='';CH.pushOn=0;chLeave();chBadge();}

/* ---- notifications push (appli fermée) ---- */
const b64u=s=>{const p='='.repeat((4-s.length%4)%4),b=(s+p).replace(/-/g,'+').replace(/_/g,'/'),r=atob(b);return Uint8Array.from([...r].map(c=>c.charCodeAt(0)));};
async function pushInit(force){try{if(!SY.at||!('serviceWorker' in navigator)||!('PushManager' in window)||!window.Notification||Notification.permission!=='granted'||!VAPID_PUB||VAPID_PUB.startsWith('__'))return;
 const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(VAPID_PUB)});
 const j=sub.toJSON(),key=SY.uid+'|'+j.endpoint;if(CH.psub===key&&!force)return;await sbData('/rest/v1/rpc/push_save',{m:'POST',b:{e:j.endpoint,p:j.keys.p256dh,a:j.keys.auth}});CH.psub=key;CH.pushOn=1;}catch(e){}}
async function pushDrop(){try{if(!('serviceWorker' in navigator))return;const reg=await Promise.race([navigator.serviceWorker.ready,new Promise((_,k)=>setTimeout(k,1500))]);const sub=await reg.pushManager.getSubscription();if(sub&&SY.at){await Promise.race([sbData('/rest/v1/rpc/push_drop',{m:'POST',b:{e:sub.endpoint}}),new Promise(r=>setTimeout(r,2500))]);}}catch(e){}}
if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.go!==undefined)go(e.data.go);});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&chOn()){chTick();if(CH.ov)chOverview();if(CH.conv){chPoll();chRead();}}});
setInterval(chTick,15000);setTimeout(chTick,2500);

/* ---- admin : lire les messages d'une famille ---- */
async function admChat(fid){let rows;try{rows=await admRpc('admin_chat',{f:fid,lim:400});}catch(x){toast(frErr(x.message));return;}
 const d=document.createElement('div');d.className='lv-ov chsh2';let day='';
 const html=(rows||[]).map(m=>{const dt=new Date(m.created_at),dk=ld(dt);let h='';if(dk!==day){day=dk;h+=`<div class="chd">${chDay(dt)}</div>`;}
  h+=`<div class="chm th" style="max-width:100%"><div class="chn" style="color:${chCol(m.sender)}">${esc(m.sender_name||'?')}${m.to_name?' ➜ '+esc(m.to_name):' ➜ 👪 famille'} · ${hhmm(dt)}</div><div class="chb ${m.kind}">${chBody(m,false)}</div></div>`;return h;}).join('')||'<div class="mini">Aucun message.</div>';
 d.innerHTML=`<div class="lv-card" style="padding:14px;max-width:520px;width:100%;max-height:85vh;display:flex;flex-direction:column;text-align:start"><h3 style="margin:0 0 8px">💬 Messages de la famille</h3><div class="mini" style="margin-bottom:6px">Lecture seule · ${rows?rows.length:0} derniers messages</div><div class="chl" style="overflow:auto;flex:1">${html}</div><div style="text-align:end;margin-top:8px"><button class="btn" id="acX" type="button">Fermer</button></div></div>`;
 document.body.appendChild(d);chBindMedia(d);chHydrate(d);d.querySelectorAll('.chso,.chsa').forEach(b=>b.remove());const close=()=>{chAudStop();d.remove();};d.onclick=e=>{if(e.target===d)close();};$('#acX',d).onclick=close;}

/* ---------- LANGUE (français / arabe) ---------- */
const FR_J=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],FR_M=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const AR_J=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],AR_M=['يناير','فبراير','مارس','أبريل','ماي','يونيو','يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر'];
const isAr=()=>S.lang==='ar';
function langArrays(){JOURS.splice(0,7,...(isAr()?AR_J:FR_J));MOIS.splice(0,12,...(isAr()?AR_M:FR_M));}
const AR=Object.assign(Object.create(null),{"Aujourd'hui": "اليوم", "Agenda": "الأجندة", "Tâches": "المهام", "Famille": "العائلة", "Études": "الدراسة", "Ma famille": "عائلتي", "Bonjour": "صباح الخير", "Bon après-midi": "نهارك سعيد", "Bonsoir": "مساء الخير", "Bonne nuit": "تصبح على خير", "+ Ajouter une personne": "+ إضافة شخص", "Ajouter une personne": "إضافة شخص", "+ RDV": "+ موعد", "+ Rendez-vous": "+ موعد", "+ Tâche": "+ مهمة", "Ajouter": "إضافة", "Ajouter plusieurs d'un coup": "إضافة عدة أشخاص دفعة واحدة", "Ajouter plusieurs personnes d'un coup": "إضافة عدة أشخاص دفعة واحدة", "Ajouter plusieurs personnes": "إضافة عدة أشخاص", "Ajouter une tâche… (Entrée)": "أضف مهمة… (Enter)", "Ajoute les personnes dont tu gères les rendez-vous, les papiers et les tâches.": "أضف الأشخاص الذين تنظّم مواعيدهم وأوراقهم ومهامهم.", "Commence par ta famille": "ابدأ بعائلتك", "Ta famille": "عائلتك", "Nouvelle personne": "شخص جديد", "Personne": "شخص", "Nouveau rendez-vous": "موعد جديد", "Rendez-vous": "موعد", "Nouvelle tâche": "مهمة جديدة", "Tâche": "مهمة", "Modifier": "تعديل", "Supprimer": "حذف", "Enregistrer": "حفظ", "Annuler": "إلغاء", "Fermer": "إغلاق", "OK": "حسنًا", "Quoi ?": "ماذا؟", "À faire": "للإنجاز", "Fait": "تم", "Faites récemment": "أُنجزت مؤخرًا", "Toutes": "الكل", "Tous": "الكل", "Important": "مهم", "Date": "التاريخ", "Pour le": "بتاريخ", "Pour qui ?": "لمن؟", "Lieu": "المكان", "Notes": "ملاحظات", "Rôle": "الصفة", "Prénom": "الاسم", "Prénom 1": "الاسم 1", "Prénom 2": "الاسم 2", "Heure (facultatif)": "الساعة (اختياري)", "Journée": "طوال اليوم", "Répéter": "التكرار", "Rappel": "تذكير", "Anniversaire": "تاريخ الميلاد", "Couleur": "اللون", "Emoji": "رمز تعبيري", "Une seule fois": "مرة واحدة", "Chaque jour": "كل يوم", "Chaque semaine": "كل أسبوع", "Chaque mois": "كل شهر", "Chaque année": "كل سنة", "Aucun rappel": "بدون تذكير", "À l'heure": "في الوقت", "15 min avant": "قبل 15 دقيقة", "1 h avant": "قبل ساعة", "La veille": "في اليوم السابق", "Le matin même (8 h)": "صباح اليوم نفسه (8 س)", "Calendrier": "التقويم", "Mois": "شهري", "Liste": "قائمة", "Les prochains jours": "الأيام القادمة", "Demain": "غدًا", "Sans date": "بدون تاريخ", "Rien de prévu.": "لا شيء مبرمج.", "Rien de prévu. Profites-en !": "لا شيء مبرمج. استمتع بوقتك!", "Rien ce jour-là.": "لا شيء في هذا اليوم.", "Rien dans les 30 prochains jours.": "لا شيء خلال 30 يومًا القادمة.", "Rien à faire pour le moment.": "لا شيء للإنجاز حاليًا.", "Personne pour l'instant.": "لا أحد حتى الآن.", "Ajouter plusieurs": "إضافة عدة", "Vu": "تم الاطلاع", "J'y vais": "أنا ذاهب", "C'est fait": "تم", "Dans 10 min": "بعد 10 دقائق", "À quoi ça sert ?": "ما فائدتها؟", "Explication": "الشرح", "Explication :": "الشرح:", "Notes (école, médecin, allergies…)": "ملاحظات (المدرسة، الطبيب، الحساسية…)", "Évite d'écrire des mots de passe ou numéros sensibles.": "تجنّب كتابة كلمات المرور أو الأرقام الحساسة.", "adresse, nom du cabinet…": "العنوان، اسم العيادة…", "documents à apporter, numéro de téléphone…": "وثائق يجب إحضارها، رقم الهاتف…", "ex : Dentiste, Réunion école…": "مثال: طبيب الأسنان، اجتماع المدرسة…", "ex : Maman, Papa, Fils, Grand-mère…": "مثال: أمي، أبي، ابني، جدتي…", "ex : Payer la cantine, Appeler la mairie…": "مثال: دفع مصاريف المطعم، الاتصال بالبلدية…", "Écris un prénom par ligne (ex : « Maman », « Yassine »…). Tu pourras modifier chaque fiche ensuite.": "اكتب اسمًا في كل سطر (مثال: «أمي»، «ياسين»…). يمكنك تعديل كل بطاقة لاحقًا.", "Fajr": "الفجر", "Dhuhr": "الظهر", "Asr": "العصر", "Maghrib": "المغرب", "Isha": "العشاء", "Horaires de prière": "أوقات الصلاة", "Marquer": "تسجيل", "Priée": "تمّت", "Réglages": "الإعدادات", "Utiliser ma position": "استخدام موقعي", "Ou choisis ta ville :": "أو اختر مدينتك:", "Méthode de calcul :": "طريقة الحساب:", "Ligue islamique mondiale (18° / 17°)": "رابطة العالم الإسلامي (18° / 17°)", "Maroc (19° / 17°)": "المغرب (19° / 17°)", "UOIF / France (Fajr 12°, Isha 12°)": "اتحاد المنظمات الإسلامية بفرنسا (الفجر 12°، العشاء 12°)", "Rappels désactivés": "التذكيرات معطّلة", "Rappels pendant les révisions : activés": "تذكير بأوقات الصلاة : مفعّل", "Notifications du navigateur": "إشعارات المتصفح", "Adhan": "الأذان", "Choisir mon adhan": "اختيار الأذان", "Tester": "تجربة", "Stop": "إيقاف", "Retirer": "إزالة", "aucun fichier": "لا يوجد ملف", "Volume :": "مستوى الصوت :", "Son activé": "الصوت مفعّل", "Son désactivé": "الصوت معطّل", "à": "على الساعة", "Choisis un fichier audio (mp3, m4a…) de l'adhan que tu aimes : il se jouera à l'heure de la prière quand l'appli est ouverte.": "اختر ملفًا صوتيًا (mp3، m4a…) للأذان الذي تحبه: سيُشغَّل في وقت الصلاة عندما يكون التطبيق مفتوحًا.", "Les horaires sont calculés directement dans l'appli (sans connexion) selon ta position. Ils peuvent différer de quelques minutes de ta mosquée : en cas de doute, suis le calendrier de ta mosquée. Les rappels s'affichent quand l'appli est ouverte.": "تُحسب الأوقات داخل التطبيق مباشرة (بدون إنترنت) حسب موقعك. قد تختلف بضع دقائق عن مسجدك: عند الشك اتبع تقويم مسجدك. تظهر التنبيهات عندما يكون التطبيق مفتوحًا.", "Chaque prière a un moment précis dans la journée. Ce verset rappelle que prier à son heure fait partie de l'obéissance. C'est pour cela que l'appli te prévient : ton emploi du temps d'étudiante s'organise autour de ces moments.": "لكل صلاة وقت محدد في اليوم. وتذكّرنا هذه الآية بأن الصلاة في وقتها من الطاعة؛ ولهذا ينبّهك التطبيق.", "La prière a ses horaires : l'heure qui vient est une invitation.": "للصلاة أوقاتها: والوقت القادم دعوة إليها.", "Pourquoi ce message ?": "لماذا هذه الرسالة؟", "« La prière demeure, pour les croyants, une prescription à temps déterminé. »": "﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾", "Traduction du sens en français": "معنى الآية", "Sourate 4 · An-Nisa (« Les Femmes »), verset 103 (fin du verset)": "سورة النساء، الآية 103 (آخر الآية)", "Qu'Allah accepte ta prière": "تقبّل الله صلاتك", "Il est l'heure de prier 🤲": "حان وقت الصلاة 🤲 تقبّل الله طاعتك", "Paris": "باريس", "Lille": "ليل", "Lyon": "ليون", "Marseille": "مرسيليا", "Bruxelles": "بروكسل", "Casablanca": "الدار البيضاء", "Rabat": "الرباط", "Fès": "فاس", "Marrakech": "مراكش", "Tanger": "طنجة", "Affichage": "العرض", "Affichage : thème, taille du texte": "العرض: المظهر وحجم الخط", "Thème": "المظهر", "Auto (sombre le soir)": "تلقائي (داكن في المساء)", "Clair": "فاتح", "Sépia": "سيبيا", "Sombre": "داكن", "Normal": "عادي", "Activer": "تفعيل", "Affichées": "ظاهرة", "Masquées": "مخفية", "Langue / اللغة": "اللغة", "Études de droit (cours, quiz, codes)": "دراسة القانون (دروس، اختبارات، مدونات)", "Mode lecture (texte plus grand et plus aéré, colonne étroite)": "وضع القراءة (خط أكبر وأوسع، عمود ضيق)", "Ma sauvegarde": "نسختي الاحتياطية", "Ta progression est enregistrée automatiquement": "يُحفظ تقدّمك تلقائيًا", "sur cet appareil, à deux endroits du navigateur (par sécurité).": "على هذا الجهاز، في مكانين من المتصفح (للأمان).", "Elle ne se perd pas en fermant l'appli. Elle ne disparaît que si tu vides les données du navigateur ou si tu changes d'appareil.": "لا يضيع عند إغلاق التطبيق. ولا يختفي إلا إذا مسحت بيانات المتصفح أو غيّرت الجهاز.", "Dernière sauvegarde en fichier :": "آخر نسخة احتياطية في ملف:", "jamais": "أبدًا", "Télécharger ma sauvegarde": "تنزيل نسختي الاحتياطية", "Restaurer depuis un fichier": "استرجاع من ملف", "Astuce : envoie-toi le fichier par mail ou WhatsApp pour retrouver ta progression sur un autre appareil.": "نصيحة: أرسل الملف إلى نفسك عبر البريد أو واتساب لتجد بياناتك على جهاز آخر.", "Ouvrir la synchronisation": "فتح المزامنة", "Synchronisation entre appareils": "المزامنة بين الأجهزة", "Pas encore activée : un compte te permet de tout retrouver sur ton téléphone et ton PC.": "غير مفعّلة بعد: الحساب يتيح لك إيجاد كل شيء على هاتفك وحاسوبك.", "Synchronisation": "المزامنة", "Retrouve tout sur ton téléphone et ton PC": "تجد كل شيء على هاتفك وحاسوبك", "Ne perds plus rien, et partage avec ta famille": "لا تضيّع شيئًا، وشارك مع عائلتك", "Avec un compte, ta progression, ton agenda, tes tâches et ta famille se retrouvent sur tous tes appareils. Les rendez-vous et tâches sont partagés avec les personnes de ta famille que tu invites.": "بحساب واحد تجد أجندتك ومهامك وعائلتك على جميع أجهزتك. المواعيد والمهام تُشارَك مع أفراد عائلتك الذين تدعوهم.", "Me connecter": "تسجيل الدخول", "Créer mon compte": "إنشاء حسابي", "Adresse e-mail": "البريد الإلكتروني", "Mot de passe (6 caractères minimum)": "كلمة المرور (6 أحرف على الأقل)", "Ton prénom": "اسمك", "Ton prénom (ex : Khalid)": "اسمك (مثال: خالد)", "Me déconnecter": "تسجيل الخروج", "Synchroniser maintenant": "مزامنة الآن", "Configurer": "إعداد", "Plus tard": "لاحقًا", "Crée un compte gratuit : tes données ne se perdent plus et se partagent avec ta famille.": "أنشئ حسابًا مجانيًا: لن تضيع بياناتك وتُشارَك مع عائلتك.", "La première personne crée la famille et reçoit un code. L’autre personne (toi ou ton mari) entre ce code sur son appareil.": "يُنشئ الشخص الأول العائلة ويحصل على رمز. ويُدخل الشخص الآخر هذا الرمز على جهازه.", "Nom de la famille": "اسم العائلة", "Créer la famille": "إنشاء العائلة", "Ou rejoindre une famille existante :": "أو انضم إلى عائلة موجودة:", "Code reçu (ex : 7F3A9C21BD)": "الرمز الذي وصلك (مثال: 7F3A9C21BD)", "Rejoindre avec le code": "الانضمام بالرمز", "Code à donner pour inviter quelqu’un :": "الرمز الذي تعطيه لدعوة شخص:", "Copier le code": "نسخ الرمز", "Envoyer": "إرسال", "Partagé dans la famille :": "مشترك داخل العائلة:", "personnes, rendez-vous et tâches.": "الأشخاص والمواعيد والمهام.", "Reste personnel :": "يبقى شخصيًا:", "tes cours, ta progression, tes réglages (mais retrouvés sur tous tes appareils).": "دروسك وتقدّمك وإعداداتك (لكنها تظهر على جميع أجهزتك).", "Quitter cette famille": "مغادرة هذه العائلة", "Ça marche aussi sans internet : tout est gardé sur l’appareil et se met à jour dès que la connexion revient.": "يعمل أيضًا بدون إنترنت: كل شيء محفوظ على الجهاز ويتحدّث بمجرد عودة الاتصال.", "Synchronisation : non connecté": "المزامنة: غير متصل", "Synchronisation en cours…": "جارٍ المزامنة…", "Synchronisé": "تمت المزامنة", "Hors connexion : se synchronisera plus tard": "بدون اتصال: ستتم المزامنة لاحقًا", "Problème de synchronisation": "مشكلة في المزامنة", "E-mail ou mot de passe incorrect.": "البريد الإلكتروني أو كلمة المرور غير صحيحة.", "Ce mail a déjà un compte : choisis « Me connecter ».": "هذا البريد لديه حساب بالفعل: اختر «تسجيل الدخول».", "Mot de passe : 6 caractères minimum.": "كلمة المرور: 6 أحرف على الأقل.", "Trop d’essais. Réessaie dans quelques minutes.": "محاولات كثيرة. أعد المحاولة بعد دقائق.", "Cette adresse e-mail n’est pas valide.": "عنوان البريد الإلكتروني غير صالح.", "Mail non confirmé : vérifie ta boîte mail.": "لم يتم تأكيد البريد: تحقق من صندوق بريدك.", "Code inconnu : vérifie les lettres et chiffres.": "الرمز غير معروف: تحقق من الحروف والأرقام.", "Les inscriptions sont désactivées sur le serveur.": "التسجيل معطّل على الخادم.", "Pas de connexion internet": "لا يوجد اتصال بالإنترنت", "Session expirée : reconnecte-toi.": "انتهت الجلسة: أعد تسجيل الدخول.", "Écris ton e-mail et ton mot de passe.": "اكتب بريدك الإلكتروني وكلمة المرور.", "Un instant…": "لحظة…", "Écris ton prénom.": "اكتب اسمك.", "Entre le code.": "أدخل الرمز.", "Compte créé. Confirme ton adresse via le mail reçu, puis connecte-toi.": "تم إنشاء الحساب. أكّد عنوانك عبر البريد الذي وصلك ثم سجّل الدخول.", "Famille introuvable": "العائلة غير موجودة", "Sauvegarde restaurée ✅": "تم استرجاع النسخة ✅", "Fichier invalide ❌": "ملف غير صالح ❌", "Donne un titre": "اكتب عنوانًا", "Écris la tâche": "اكتب المهمة", "Écris un prénom": "اكتب اسمًا", "Bravo, une de moins ✅": "أحسنت، مهمة أقل ✅", "Connecté ✅": "تم الاتصال ✅", "Prénom enregistré ✅": "تم حفظ الاسم ✅", "Synchronisation…": "جارٍ المزامنة…", "Famille créée ✅": "تم إنشاء العائلة ✅", "Famille rejointe ✅": "تم الانضمام إلى العائلة ✅", "Code copié": "تم نسخ الرمز", "Message copié": "تم نسخ الرسالة", "Copié": "تم النسخ", "Copie impossible": "تعذّر النسخ", "Supprimer définitivement ?": "حذف نهائيًا؟", "Remplacer ta progression actuelle par cette sauvegarde ?": "استبدال تقدّمك الحالي بهذه النسخة؟", "Te déconnecter ? Tes données restent sur cet appareil.": "تسجيل الخروج؟ تبقى بياناتك على هذا الجهاز.", "Quitter cette famille ? Les données restent sur cet appareil mais ne seront plus partagées.": "مغادرة هذه العائلة؟ تبقى البيانات على هذا الجهاز لكنها لن تُشارَك بعد الآن.", "Position enregistrée ✅": "تم حفظ الموقع ✅", "Notifications activées ✅": "تم تفعيل الإشعارات ✅", "Notifications refusées": "تم رفض الإشعارات", "Non disponible sur ce navigateur": "غير متاح في هذا المتصفح", "Adhan enregistré ✅": "تم حفظ الأذان ✅", "Adhan retiré": "تمت إزالة الأذان", "Choisis un fichier audio": "اختر ملفًا صوتيًا", "Fichier trop lourd (max 15 Mo)": "الملف كبير جدًا (الحد الأقصى 15 ميغا)", "Enregistrement impossible sur ce navigateur": "تعذّر الحفظ في هذا المتصفح", "Lecture impossible : touche d'abord l'écran puis réessaie": "تعذّر التشغيل: المس الشاشة أولاً ثم أعد المحاولة", "Une seule personne": "شخص واحد", "En retard": "متأخرة", "RDV": "موعد", "Prénom 1\nPrénom 2\n…": "الاسم 1\nالاسم 2\n…"});
const ARP=[["📐 Méthode : (.*) · (.*)", "📐 الطريقة : {1} · {2}"], ["Prochaine prière : (\\P{L}*)(Fajr|Dhuhr|Asr|Maghrib|Isha) à (\\d\\d:\\d\\d) \\(dans (\\d+) h (\\d+)\\)", "الصلاة القادمة : {1}{2} على الساعة {3} (بعد {4} س {5} د)"], ["Prochaine prière : (\\P{L}*)(Fajr|Dhuhr|Asr|Maghrib|Isha) à (\\d\\d:\\d\\d) \\(dans (\\d+) min\\)", "الصلاة القادمة : {1}{2} على الساعة {3} (بعد {4} دقيقة)"], ["Prochaine prière : (\\P{L}*)(Fajr|Dhuhr|Asr|Maghrib|Isha) à (\\d\\d:\\d\\d)", "الصلاة القادمة : {1}{2} على الساعة {3}"], ["(Fajr|Dhuhr|Asr|Maghrib|Isha) (\\d\\d:\\d\\d)", "{1} {2}"], ["C'est l'heure de (Fajr|Dhuhr|Asr|Maghrib|Isha) · (\\d\\d:\\d\\d)", "حان وقت صلاة {1} · {2}"], ["C'est l'heure de (Fajr|Dhuhr|Asr|Maghrib|Isha)", "حان وقت صلاة {1}"], ["dans (\\d+) h (\\d+)", "بعد {1} س {2} د"], ["dans (\\d+) h", "بعد {1} س"], ["dans (\\d+) min", "بعد {1} دقيقة"], ["Dans (\\d+) min", "بعد {1} دقيقة"], ["Lever du soleil : (\\d\\d:\\d\\d) \\(fin de Fajr\\)", "شروق الشمس : {1} (نهاية الفجر)"], ["(.+) · (\\d)/5 aujourd'hui · touche pour régler", "{1} · {2}/5 اليوم · المس للتعديل"], ["(Paris|Lille|Lyon|Marseille|Bruxelles|Casablanca|Rabat|Fès|Marrakech|Tanger) · (.*)", "{1} · {2}"], ["Taille du texte : (\\d+) %", "حجم الخط : {1} %"], ["Connecté : (.*)", "متصل : {1}"], ["Anniversaire de (.*) \\((\\d+) ans\\)", "عيد ميلاد {1} ({2} سنة)"], ["Anniversaire de (.*)", "عيد ميلاد {1}"], ["Coran · Coran (\\d+:\\d+)", "القرآن · {1}"], ["fichier chargé ✅ \\((\\d+) Ko\\)", "تم تحميل الملف ✅ ({1} ك.ب)"], ["(\\d+) personnes", "{1} أشخاص"], ["(\\d+) à venir \\(30 j\\) · 🎂 (.*)", "{1} قادمة خلال 30 يومًا · 🎂 {2}"], ["(\\d+) à venir \\(30 j\\)", "{1} قادمة خلال 30 يومًا"], ["En retard \\((\\d+)\\)", "متأخرة ({1})"], ["(\\d+) en retard", "{1} متأخرة"], ["À venir \\((\\d+) jours\\)", "القادمة ({1} يومًا)"], ["À venir \\((\\d+)\\)", "القادمة ({1})"], ["Sans date \\((\\d+)\\)", "بدون تاريخ ({1})"], ["Faites récemment \\((\\d+)\\)", "أُنجزت مؤخرًا ({1})"], ["… et (\\d+) autres, dans l'onglet Tâches", "… و{1} أخرى في تبويب المهام"], ["À faire · (.*)", "للإنجاز · {1}"], ["Rendez-vous · (.*)", "موعد · {1}"], ["(.*) · (\\d+) chose(s?) aujourd'hui", "{1} · {2} مهمة اليوم"], ["(.*) · rien de prévu aujourd'hui", "{1} · لا شيء مبرمج اليوم"], ["Prochaine fois : (.*)", "المرة القادمة : {1}"], ["(.*) a ajouté : (.*)", "{1} أضاف : {2}"], ["(\\d+) nouveautés ajoutées par ta famille", "{1} إضافات جديدة من عائلتك"], ["Prochaine prière", "الصلاة القادمة"]];
const _lead=/^[^\p{L}\p{N}]*/u,_tail=/[^\p{L}\p{N}]*$/u;
ARP.push(['(\\d+) personnes?','{1} شخص']);
ARP.push(["(.+?) a ajouté un rendez-vous : (.+)", "موعد جديد من {1} : {2}"],["(.+?) a ajouté une tâche : (.+)", "مهمة جديدة من {1} : {2}"],["Aujourd'hui : (\\d+) à faire", "اليوم : {1} مهام"],["Demain : (\\d+) à prévoir", "غداً : {1} مهام"],["(\\d+) en retard", "{1} متأخرة"]);
Object.assign(AR,{"Mon numéro : +33 6 12 34 56 78":"رقمي: ‎+33 6 12 34 56 78","Enregistrer":"حفظ","Annuler":"إلغاء","Appel normal":"مكالمة عادية","📞 Appel normal":"📞 مكالمة عادية","📞 Pour que ta famille puisse t’appeler (WhatsApp ou appel). Seuls les membres de ta famille le voient.":"📞 ليتمكن أفراد عائلتك من الاتصال بك (واتساب أو مكالمة). لا يراه إلا أفراد عائلتك.","Numéro enregistré ✅":"تم حفظ الرقم ✅","Numéro retiré":"تم حذف الرقم","Numéro invalide : écris-le avec l’indicatif, ex. +33 6 12 34 56 78":"رقم غير صحيح: اكتبه مع رمز البلد، مثال ‎+33 6 12 34 56 78"});
Object.assign(AR,{"Logistique":"اللوجستيك","🚚 Profil Logistique (Papa)":"🚚 ملف اللوجستيك (بابا)","🚚 Retirer le profil Logistique":"🚚 إزالة ملف اللوجستيك","Retirer l’onglet Logistique de ce compte ?":"إزالة تبويب اللوجستيك من هذا الحساب؟","Profil Logistique activé 🚚":"تم تفعيل ملف اللوجستيك 🚚","Profil Logistique retiré":"تمت إزالة ملف اللوجستيك"});
Object.assign(AR,{"🌸 Profil Maman":"🌸 ملف ماما","🌸 Retirer le profil Maman":"🌸 إزالة ملف ماما","Retirer l’onglet Maman de ce compte ?":"إزالة تبويب ماما من هذا الحساب؟","Profil Maman retiré":"تمت إزالة ملف ماما"});
Object.assign(AR,{"Agenda, tâches, prière et famille : tout au même endroit.": "الأجندة والمهام والصلاة والعائلة: كل شيء في مكان واحد.", "Connecté": "متصل", "📲 Installer l'application": "📲 تثبيت التطبيق", "Installer l'application": "تثبيت التطبيق", "Ajoute Ma famille à ton écran d'accueil : elle s'ouvre comme une vraie appli, sans te reconnecter.": "أضف «عائلتي» إلى شاشتك الرئيسية: يفتح مثل تطبيق حقيقي دون إعادة تسجيل الدخول.", "Installer": "تثبيت", "Plus tard": "لاحقاً", "Touche Partager puis « Sur l’écran d’accueil »": "اضغط على مشاركة ثم «إضافة إلى الشاشة الرئيسية»", "Menu ⋮ du navigateur, puis « Installer l’application »": "من قائمة ⋮ في المتصفح اختر «تثبيت التطبيق»", "Notifications": "الإشعارات", "Aucune notification pour l'instant.": "لا توجد إشعارات حالياً.", "Activer sur le téléphone": "تفعيل على الهاتف", "Vider": "مسح الكل", "Fermer": "إغلاق", "Notifications activées ✅": "تم تفعيل الإشعارات ✅", "Notifications refusées": "تم رفض الإشعارات", "Rejoins ta famille": "انضم إلى عائلتك", "Entre le code reçu : tu retrouves tout de suite ta famille, ses rendez-vous et ses tâches.": "أدخل الرمز الذي وصلك: ستجد عائلتك ومواعيدها ومهامها فوراً.", "Code de la famille": "رمز العائلة", "Rejoindre": "انضمام", "Pas de code ? Créer une nouvelle famille": "ليس لديك رمز؟ أنشئ عائلة جديدة", "Notre famille": "عائلتنا", "Créer": "إنشاء", "Entre le code.": "أدخل الرمز.", "Famille rejointe ✅": "تم الانضمام إلى العائلة ✅", "Famille créée ✅": "تم إنشاء العائلة ✅", "Code copié": "تم نسخ الرمز", "Message copié": "تم نسخ الرسالة", "Code à donner pour inviter quelqu’un :": "الرمز الذي تعطيه لمن تريد دعوته:", "Copier le code": "نسخ الرمز", "Envoyer": "إرسال", "Adhan": "الأذان", "Choisis l'adhan qui se jouera à l'heure de la prière (quand l'appli est ouverte). Pour le Fajr, la version avec « Aş-şalât khayrun mina n-nawm » est utilisée.": "اختر الأذان الذي سيُرفع عند وقت الصلاة (عندما يكون التطبيق مفتوحاً). في الفجر تُستعمل النسخة التي فيها «الصلاة خير من النوم».", "Choisir": "اختيار", "✅ Choisi": "✅ تم الاختيار", "Aucun (silencieux)": "بدون (صامت)", "Mon propre fichier": "ملفي الخاص", "chargé ✅": "تم التحميل ✅", "Stop": "إيقاف", "Adhan enregistré ✅": "تم حفظ الأذان ✅", "Connexion nécessaire pour télécharger l'adhan": "يلزم الاتصال بالإنترنت لتحميل الأذان", "Lecture impossible : vérifie ta connexion": "تعذّر التشغيل: تحقق من اتصالك", "Volume :": "مستوى الصوت :"});
Object.assign(AR,{"✅ Passer en méthode France (UOIF 12°/12°)": "✅ اعتماد طريقة فرنسا (UOIF 12°/12°)", "Méthode France activée ✅": "تم تفعيل طريقة فرنسا ✅"});
Object.assign(AR,{"Discussions": "المحادثات", "Écrire, envoyer un vocal ou une photo à la famille": "اكتب أو أرسل رسالة صوتية أو صورة للعائلة", "En direct · vocaux · photos": "مباشر · رسائل صوتية · صور", "Les messages sont visibles uniquement par la famille.": "الرسائل مرئية فقط للعائلة.", "Toute la famille": "كل العائلة", "Conversations à deux": "محادثات ثنائية", "Aucun message": "لا توجد رسائل", "Aucun message pour l'instant.": "لا توجد رسائل بعد.", "Écris le premier": "اكتب أول رسالة", "Écrire un message…": "اكتب رسالة…", "Messages plus anciens": "رسائل أقدم", "↑ Messages plus anciens": "↑ رسائل أقدم", "Moi": "أنا", "Hier": "أمس", "Photo": "صورة", "Message vocal": "رسالة صوتية", "RDV ou tâche": "موعد أو مهمة", "Partager un rendez-vous ou une tâche": "مشاركة موعد أو مهمة", "Rien à partager pour le moment.": "لا شيء للمشاركة حاليًا.", "Copier": "نسخ", "Supprimer pour tous": "حذف للجميع", "Message supprimé": "تم حذف الرسالة", "Tâche partagée": "مهمة مشتركة", "RDV partagé": "موعد مشترك", "Ouvrir": "فتح", "Enregistrement…": "جارٍ التسجيل…", "Non envoyé · réessayer": "لم تُرسل · أعد المحاولة", "Rejoins d'abord une famille pour pouvoir discuter avec elle.": "انضم أولًا إلى عائلة لتتمكن من التحدث معها.", "Rejoindre une famille": "الانضمام إلى عائلة", "Vocal trop court": "الرسالة الصوتية قصيرة جدًا", "Micro refusé : autorise-le dans les réglages du site": "تم رفض الميكروفون: اسمح به من إعدادات الموقع", "Vocal non disponible sur ce navigateur": "الرسائل الصوتية غير متاحة في هذا المتصفح", "Pas de connexion : touche « réessayer »": "لا يوجد اتصال: اضغط «أعد المحاولة»", "Photo illisible": "تعذّرت قراءة الصورة", "Choisis une photo": "اختر صورة", "Vocal introuvable": "الرسالة الصوتية غير موجودة", "Ajouté ✅": "تمت الإضافة ✅", "Options": "خيارات", "Joindre": "إرفاق"});
Object.assign(AR,{"❓ Aide : comment ça marche ?": "❓ مساعدة: كيف يعمل التطبيق؟", "❓ Aide": "❓ مساعدة", "Ouvre ce lien dans Safari, puis touche Partager et « Sur l’écran d’accueil »": "افتح هذا الرابط في Safari، ثم اضغط على مشاركة و«إضافة إلى الشاشة الرئيسية»", "📵 Sur iPhone, les notifications marchent seulement si l'appli est ajoutée depuis Safari : ouvre ce lien dans Safari, touche Partager puis « Sur l'écran d'accueil », puis ouvre l'appli depuis la nouvelle icône et reviens ici.": "📵 في آيفون تعمل الإشعارات فقط إذا أُضيف التطبيق من Safari: افتح هذا الرابط في Safari، اضغط على مشاركة ثم «إضافة إلى الشاشة الرئيسية»، ثم افتح التطبيق من الأيقونة الجديدة وارجع إلى هنا.", "📵 Ton iPhone doit avoir iOS 16.4 ou plus récent pour recevoir les notifications (Réglages → Général → Informations).": "📵 يلزم أن يكون هاتفك بنظام iOS 16.4 أو أحدث لتصلك الإشعارات (الإعدادات ← عام ← حول).", "🚫 Les notifications sont bloquées pour cette appli. Pour les autoriser : Réglages de l'iPhone → Notifications → Ma famille → Autoriser les notifications. Puis rouvre cette fenêtre.": "🚫 الإشعارات محظورة لهذا التطبيق. للسماح بها: إعدادات الآيفون ← الإشعارات ← Ma famille ← السماح بالإشعارات. ثم أعد فتح هذه النافذة.", "Le serveur a déjà envoyé trop de mails de confirmation. Réessaie dans environ 1 h, ou connecte-toi si ton compte existe déjà.": "أرسل الخادم عدداً كبيراً من رسائل التأكيد. أعد المحاولة بعد ساعة تقريباً، أو سجّل الدخول إذا كان حسابك موجوداً.", "↩️ Répondre": "↩️ رد", "📷 Photo de profil": "📷 صورة الملف الشخصي", "Retirer la photo": "إزالة الصورة", "Photo de profil mise à jour ✅": "تم تحديث الصورة ✅", "Photo retirée": "تمت إزالة الصورة", "Message plus ancien : charge d'abord les messages précédents": "رسالة أقدم: حمّل الرسائل السابقة أولاً"});
Object.assign(AR,{"Impossible de charger les messages.":"تعذّر تحميل الرسائل.","Réessayer":"إعادة المحاولة","Aucun micro trouvé sur cet appareil":"لم يتم العثور على ميكروفون"});
Object.assign(AR,{"Mon compte": "حسابي", "Pas encore de famille : va dans l'onglet « Famille ».": "لا توجد عائلة بعد: اذهب إلى تبويب «العائلة».", "Type de compte": "نوع الحساب", "Je suis Hajar": "أنا هاجر", "Autre personne": "شخص آخر", "Synchroniser": "مزامنة", "Installer": "تثبيت", "Détails de la synchro": "تفاصيل المزامنة", "Me déconnecter": "تسجيل الخروج", "Hajar (études de droit affichées)": "هاجر (قسم دراسة القانون ظاهر)", "Compte famille": "حساب عائلي", "Compte Hajar activé ✅": "تم تفعيل حساب هاجر ✅", ": choisis pour adapter l'appli.": ": اختر لتكييف التطبيق.", "Code de vérification": "رمز التحقق", "Te déconnecter ? Tes données restent sur cet appareil.": "تسجيل الخروج؟ تبقى بياناتك على هذا الجهاز.", "Compte famille : la partie études et les messages personnels seront masqués. Continuer ?": "حساب عائلي: سيتم إخفاء قسم الدراسة والرسائل الشخصية. المتابعة؟", "Synchronisation…": "جارٍ المزامنة…"});
Object.assign(AR,{"Mot de passe oublié ?": "هل نسيت كلمة المرور؟", "Écris d'abord ton adresse e-mail.": "اكتب بريدك الإلكتروني أولاً.", "Si ce compte existe, un mail vient d'être envoyé : ouvre le lien depuis ton téléphone.": "إذا كان الحساب موجوداً فقد أُرسل إليك بريد: افتح الرابط من هاتفك.", "Nouveau mot de passe": "كلمة مرور جديدة", "Changer mon mot de passe": "تغيير كلمة المرور", "Nouveau mot de passe (6 caractères minimum)": "كلمة المرور الجديدة (6 أحرف على الأقل)", "Répète le mot de passe": "أعد كتابة كلمة المرور", "Enregistrer": "حفظ", "Annuler": "إلغاء", "Mot de passe : 6 caractères minimum.": "كلمة المرور: 6 أحرف على الأقل.", "Les deux mots de passe sont différents.": "كلمتا المرور مختلفتان.", "Mot de passe enregistré ✅": "تم حفظ كلمة المرور ✅", "Lien expiré ou invalide : refais « Mot de passe oublié ».": "الرابط منتهي أو غير صالح: أعد طلب «نسيت كلمة المرور».", "Mot de passe": "كلمة المرور"});
Object.assign(AR,{"Effacer les données de cet appareil": "مسح بيانات هذا الجهاز", "Supprimer mon compte": "حذف حسابي", "Compte supprimé": "تم حذف الحساب", "Appareil nettoyé ✅": "تم تنظيف الجهاز ✅", "Annulé": "تم الإلغاء"});
Object.assign(AR,{"Plus":"المزيد"});
Object.assign(AR,{"Effacer cet appareil": "مسح هذا الجهاز", "Détails synchro": "تفاصيل المزامنة"});
Object.assign(AR,{'Tu es Hajar ? Entre le code de vérification pour afficher les études.':'هل أنتِ هاجر؟ أدخلي رمز التحقق لإظهار قسم الدراسة.','Code de vérification':'رمز التحقق','Code famille':'رمز العائلة','Rien de prévu. Profites-en':'لا شيء مبرمج. استمتع بوقتك','Code de vérification incorrect.':'رمز التحقق غير صحيح.','Versets & hadiths':'آيات وأحاديث','Je suis Hajar (étudiante en droit)':'أنا هاجر (طالبة القانون)','Si tu coches, la partie études (cours, quiz, codes) est affichée. Sinon, elle reste cachée.':'عند التحديد يظهر قسم الدراسة (الدروس والاختبارات والقوانين)، وإلا يبقى مخفياً.'});
ARP.push(["Toi : (.*)", "أنت : {1}"], ["(.*) écrit…", "{1} يكتب…"], ["Lecture seule · (\\d+) derniers messages", "للقراءة فقط · آخر {1} رسالة"]);
const ARPC=ARP.map(([s,t])=>[new RegExp('^([^\\p{L}\\p{N}]*)'+s+'([^\\p{L}\\p{N}]*)$','u'),t]);
function trS(s){if(!isAr()||!s||typeof s!=='string')return s;const m=s.match(/^(\s*)([\s\S]*?)(\s*)$/);const c0=m[2];if(!c0)return s;
 let o=AR[c0];if(o!==undefined)return m[1]+o+m[3];
 for(const [re,t] of ARPC){const x=c0.match(re);if(x){const r=x[1]+t.replace(/\{(\d)\}/g,(_,i)=>{const v=x[+i+1];return AR[v]!==undefined?AR[v]:v;})+x[x.length-1];return m[1]+r+m[3];}}
 const lead=c0.match(_lead)[0],rest=c0.slice(lead.length);if(!rest)return s;o=AR[rest];if(o!==undefined)return m[1]+lead+o+m[3];
 const tail=rest.match(_tail)[0],core=rest.slice(0,rest.length-tail.length);o=AR[core];if(o!==undefined)return m[1]+lead+o+tail+m[3];return s;}
function trNode(n){if(!isAr()||!n)return;if(n.nodeType===3){const p=n.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName)||(p.closest&&p.closest('[data-nt]')))return;const v=trS(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;return;}
 if(n.nodeType!==1||/^(SCRIPT|STYLE)$/.test(n.tagName)||(n.closest&&n.closest('[data-nt]')))return;
 const w=document.createTreeWalker(n,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{acceptNode:x=>x.nodeType===1?((x.hasAttribute('data-nt')||/^(SCRIPT|STYLE)$/.test(x.tagName))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT):NodeFilter.FILTER_ACCEPT});
 const at=e=>['placeholder','title','aria-label'].forEach(a=>{if(e.hasAttribute&&e.hasAttribute(a)){const v=trS(e.getAttribute(a));if(v!==e.getAttribute(a))e.setAttribute(a,v);}});
 at(n);let c;while((c=w.nextNode())){if(c.nodeType===3){if(c.parentNode.tagName==='TEXTAREA')continue;const v=trS(c.nodeValue);if(v!==c.nodeValue)c.nodeValue=v;}else at(c);}}
let trMO=null;
function langApply(){const ar=isAr();document.documentElement.lang=ar?'ar':'fr';document.documentElement.dir=ar?'rtl':'ltr';langArrays();
 if(document.body){document.body.classList.toggle('ar',ar);document.body.classList.toggle('nost',!!S.nost);}
 const b=$('#pLang');if(b){b.textContent=ar?'FR':'ع';b.title=ar?'Français':'العربية';}
 if(ar){document.title='عائلتي';if(!trMO){trMO=new MutationObserver(ms=>{if(document.body.classList.contains('study')&&!S.nost)return;ms.forEach(m=>{if(m.type==='characterData')trNode(m.target);else m.addedNodes.forEach(trNode);});});trMO.observe(document.body,{childList:true,subtree:true,characterData:true});}trNode(document.body);}
 else{document.title='Ma famille';}}
function setLang(l){S.lang=l;if(S.stl==='o')S.nost=1;else if(!S.stl){if(l==='ar'&&S.nost===undefined){S.nost=1;S.nsa=1;}if(l==='fr'&&S.nsa){S.nost=0;S.nsa=0;}}flush();langApply();hud();route();toast(l==='ar'?'تم تغيير اللغة':'Langue : français');}
const _cf=window.confirm.bind(window),_al=window.alert.bind(window);window.confirm=m=>_cf(trS(m));window.alert=m=>_al(trS(m));
