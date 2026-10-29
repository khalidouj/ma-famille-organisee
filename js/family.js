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
 ${CAL.list?`<div class="plan">${listHtml}</div>`:`<div class="cal"><div class="cw">${(isAr()?['إ','ث','ر','خ','ج','س','ح']:['L','M','M','J','V','S','D']).map(x=>`<b>${x}</b>`).join('')}</div><div class="cg">${cells}</div></div>
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
function renderTabs(a){const nav=$('#tabbar');if(!nav)return;const TB=S.nost?TABS.filter(t=>t[0]!=='etudes'):TABS;const cur=['','cal','tasks','fam','etudes'].includes(a)?a:(a==='p'?'fam':['e','exam','review','science','search','code','penal','spirit','today','weak'].includes(a)?'etudes':a==='data'||a==='prayer'||a==='sync'?null:'');
 nav.innerHTML=TB.map(([h,e,l])=>`<button class="tb ${h===cur?'on':''}" onclick="go('${h}')"><span>${e}</span><small>${l}</small></button>`).join('');}
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

/* ---------- SYNCHRO ---------- */
const SB={url:'https://ucbzuvvxlyunmevssfji.supabase.co',key:'sb_publishable_o5-12DDt7fx7eR4lsWQOuA_hP7s7V0S'};
const SH=['fam','ev','tk'],EXC=['fam','ev','tk','_h','dl','_ph','pt','rf','rs','bk','ut'];
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
  (rem[k]||[]).forEach(r=>{const l=m.get(r.id);if(!l&&k!=='fam'&&r.by&&r.by!==S.me&&!(S.dl[r.id]>=(r._u||0)))SY.news.push(r);if(!l||(r._u||0)>(l._u||0))m.set(r.id,r);});
  const out=[];m.forEach((v,id)=>{if(S.dl[id]&&S.dl[id]>=(v._u||0)){delete H[id];return;}out.push(v);});
  if(cj(out)!==cj(S[k]||[])){changed=true;S[k]=out;}
  out.forEach(it=>{const {_u,...rest}=it;H[it.id]=hsh(JSON.stringify(rest));});});
 return changed;}
/* ---- réseau ---- */
const FR_ERR=[['Invalid login credentials','E-mail ou mot de passe incorrect.'],['already registered','Ce mail a déjà un compte : choisis « Me connecter ».'],['at least 6','Mot de passe : 6 caractères minimum.'],['rate limit','Trop d’essais. Réessaie dans quelques minutes.'],['valid email','Cette adresse e-mail n’est pas valide.'],['Email not confirmed','Mail non confirmé : vérifie ta boîte mail.'],['Code inconnu','Code inconnu : vérifie les lettres et chiffres.'],['Signups not allowed','Les inscriptions sont désactivées sur le serveur.']];
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
 if(r&&r[0]){SY.fid=r[0].family_id;SY.code=r[0].families&&r[0].families.code;SY.fname=r[0].families&&r[0].families.name;}else{SY.fid=SY.code=SY.fname='';}sySave();}
async function syAuth(mode,email,pw){const p=mode==='up'?'/auth/v1/signup':'/auth/v1/token?grant_type=password';
 const j=await sbReq(p,{m:'POST',auth:false,b:{email,password:pw}});
 if(!j.access_token){const e=new Error('Compte créé. Confirme ton adresse via le mail reçu, puis connecte-toi.');e.info=1;throw e;}
 sbSession(j);SY.email=email;SY.st='idle';sySave();await syLoadFamily();}
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
 if(cj(merged)!==cj(per)){try{localStorage.setItem('gp-pre-sync',JSON.stringify(S));}catch(e){}Object.assign(S,merged);if(S.stl==='o')S.nost=1;SYCH=true;}
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
  SY.last=Date.now();SY.err='';SY.st='ok';SY.bound=SY.uid;sySave();if(SY.news.length&&!first0){const n=SY.news;toast(n.length===1?`${n[0].by} a ajouté : ${n[0].t}`:`${n.length} nouveautés ajoutées par ta famille`,4500);}SY.news=[];}
 catch(e){SY.err=frErr(e.message);SY.st=e.net?'off':'err';if(e.out){SY.st='out';SY.err='Session expirée : reconnecte-toi.';}}
 SYBUSY=false;syUI();
 if(SYCH){applyPrefs();langApply();hud();syRerender();}
 if(SYAGAIN){SYAGAIN=false;syncSoon();}}
function syRerender(){if(document.querySelector('.lv-ov'))return;const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&$('#app').contains(a))return;
 const h=location.hash.slice(1).split('/')[0];if(['sync','data','prayer','spirit','exam','review','art','e'].includes(h))return;const y=window.scrollY;route();window.scrollTo(0,y);}
const syStatTxt=()=>{const ar=isAr(),dt=SY.last?new Date(SY.last).toLocaleString(ar?'ar-MA-u-nu-latn':'fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):(ar?'لم تتم بعد':'pas encore');
 const st=ar?{ok:'✅ محدّث',sync:'🔄 جارٍ المزامنة…',off:'📴 بدون اتصال',err:'⚠️ '+trS(SY.err),idle:'…',out:''}:{ok:'✅ À jour',sync:'🔄 Synchronisation…',off:'📴 Hors connexion',err:'⚠️ '+SY.err,idle:'…',out:''};
 return (st[SY.st]||'')+(ar?' · آخر مزامنة : ':' · dernière synchro : ')+dt;};
function syUI(){const b=$('#pSync');if(b){const m={out:['☁️','Synchronisation : non connecté'],idle:['☁️','Synchronisation'],sync:['🔄','Synchronisation en cours…'],ok:['✅','Synchronisé'],off:['📴','Hors connexion : se synchronisera plus tard'],err:['⚠️','Problème de synchronisation']}[SY.st]||['☁️',''];b.textContent=m[0];b.title=m[1];b.classList.toggle('dim',SY.st==='out');}
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
  ${syMode==='up'?'<input class="srch" id="syN" placeholder="Ton prénom (ex : Khalid)" autocomplete="given-name" style="margin-top:10px"><label style="display:flex;gap:8px;align-items:flex-start;margin-top:10px;font-size:.92em;text-align:start"><input type="checkbox" id="syH" style="margin-top:4px"><span>Je suis Hajar (étudiante en droit)<br><span class="mini">Si tu coches, la partie études (cours, quiz, codes) est affichée. Sinon, elle reste cachée.</span><input class="srch" id="syHc" inputmode="numeric" placeholder="Code de vérification (donné par Khalid)" style="margin-top:6px;display:none"></span></label>':''}<input class="srch" id="syE" type="email" autocomplete="email" autocapitalize="none" autocorrect="off" placeholder="Adresse e-mail" style="margin-top:10px"><input class="srch" id="syP" type="password" autocomplete="${syMode==='up'?'new-password':'current-password'}" placeholder="Mot de passe (6 caractères minimum)" style="margin-top:8px">
  <div class="mini" id="syM" style="margin-top:8px;color:#c62828">${esc(SY.err||'')}</div><button class="btn" id="syGo" style="margin-top:8px">${syMode==='up'?'Créer mon compte':'Me connecter'}</button></div>`;
  $('#syIn').onclick=()=>{syMode='in';SY.err='';syFill();};$('#syUp').onclick=()=>{syMode='up';SY.err='';syFill();};
  const go1=async()=>{const e=$('#syE').value.trim(),p=$('#syP').value;if(!e||!p){$('#syM').textContent='Écris ton e-mail et ton mot de passe.';return;}
   $('#syGo').disabled=true;$('#syM').style.color='#666';$('#syM').textContent='Un instant…';
   try{const nm=syMode==='up'?($('#syN').value.trim()):'';const hj=syMode==='up'&&$('#syH')&&$('#syH').checked;if(hj&&(await sha256(($('#syHc').value||'').trim()))!=='bbccfae45b516388f759fce5b32b1197b838e6daaba52cc6a650f29e220f48ef'){$('#syGo').disabled=false;$('#syM').style.color='#c62828';$('#syM').textContent='Code de vérification incorrect.';return;}if(syMode==='up'&&!nm){$('#syGo').disabled=false;$('#syM').textContent='Écris ton prénom.';return;}await syAuth(syMode,e,p);if(nm){S.me=nm;}if(syMode==='up'){S.stl=hj?'h':'o';S.nost=hj?0:1;S.nsa=0;}save();langApply();renderTabs((location.hash.slice(1).split('/')[0])||'');hud();SY.err='';toast('Connecté ✅');syUI();syncNow();viewSync();}catch(x){$('#syGo').disabled=false;$('#syM').style.color=x.info?'#2e7d32':'#c62828';$('#syM').textContent=x.net?x.message:frErr(x.message);}};
  if($('#syH'))$('#syH').onchange=()=>{$('#syHc').style.display=$('#syH').checked?'block':'none';};
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
 $('#syOut').onclick=()=>{if(!confirm('Te déconnecter ? Tes données restent sur cet appareil.'))return;SY.at=SY.rt='';SY.fid=SY.code=SY.fname='';SY.st='out';sySave();syUI();viewSync();};
 const err=m=>{const e=$('#syM2');if(e)e.textContent=m;};
 if(!SY.fid){$('#syCr').onclick=async()=>{$('#syCr').disabled=true;try{const r=await sbData('/rest/v1/rpc/create_family',{m:'POST',b:{n:$('#syFn').value}});SY.fid=r.id;SY.code=r.code;SY.fname=r.name;sySave();toast('Famille créée ✅');await syncNow();viewSync();}catch(x){$('#syCr').disabled=false;err(frErr(x.message));}};
  $('#syJn').onclick=async()=>{const c=$('#syCd').value.trim();if(!c){err('Entre le code.');return;}$('#syJn').disabled=true;try{const r=await sbData('/rest/v1/rpc/join_family',{m:'POST',b:{c}});SY.fid=r.id;SY.code=r.code;SY.fname=r.name;sySave();toast('Famille rejointe ✅');await syncNow();viewSync();}catch(x){$('#syJn').disabled=false;err(frErr(x.message));}};}
 else{$('#syCp').onclick=()=>{try{navigator.clipboard.writeText(SY.code);toast('Code copié');}catch(e){toast(SY.code);}};
  $('#syShare').onclick=()=>{const t=isAr()?`انضم إلى عائلتنا في التطبيق: افتح ${location.origin+location.pathname} ثم ☁️ ثم إنشاء حساب، وأدخل الرمز ${SY.code}`:`Rejoins notre famille sur l’appli : ouvre ${location.origin+location.pathname} → ☁️ → Créer mon compte, puis entre le code ${SY.code}`;if(navigator.share)navigator.share({text:t}).catch(()=>{});else{try{navigator.clipboard.writeText(t);toast('Message copié');}catch(e){}}};
  $('#syLv').onclick=async()=>{if(!confirm('Quitter cette famille ? Les données restent sur cet appareil mais ne seront plus partagées.'))return;try{await sbData('/rest/v1/members?user_id=eq.'+SY.uid+'&family_id=eq.'+SY.fid,{m:'DELETE'});SY.fid=SY.code=SY.fname='';sySave();viewSync();}catch(x){toast(frErr(x.message));}};}}
function syPromo(){if(SY.at||(S.syp&&S.syp>Date.now()))return;const a=$('#app');if(!a||$('#syp'))return;const d=document.createElement('div');d.id='syp';d.className='card';d.style.margin='12px 0';
 d.innerHTML=`<b>☁️ Retrouve tout sur ton téléphone et ton PC</b><div class="mini">Crée un compte gratuit : tes données ne se perdent plus et se partagent avec ta famille.</div><div class="row" style="margin-top:8px"><button class="btn" id="sypo">Configurer</button><button class="btn alt" id="sypl">Plus tard</button></div>`;
 a.insertBefore(d,a.children[1]||null);$('#sypo').onclick=()=>go('sync');$('#sypl').onclick=()=>{S.syp=Date.now()+7*DAY;save();d.remove();};}
/* ---------- LANGUE (français / arabe) ---------- */
const FR_J=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],FR_M=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const AR_J=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],AR_M=['يناير','فبراير','مارس','أبريل','ماي','يونيو','يوليوز','غشت','شتنبر','أكتوبر','نونبر','دجنبر'];
const isAr=()=>S.lang==='ar';
function langArrays(){JOURS.splice(0,7,...(isAr()?AR_J:FR_J));MOIS.splice(0,12,...(isAr()?AR_M:FR_M));}
const AR=Object.assign(Object.create(null),{"Aujourd'hui": "اليوم", "Agenda": "الأجندة", "Tâches": "المهام", "Famille": "العائلة", "Études": "الدراسة", "Ma famille": "عائلتي", "Bonjour": "صباح الخير", "Bon après-midi": "نهارك سعيد", "Bonsoir": "مساء الخير", "Bonne nuit": "تصبح على خير", "+ Ajouter une personne": "+ إضافة شخص", "Ajouter une personne": "إضافة شخص", "+ RDV": "+ موعد", "+ Rendez-vous": "+ موعد", "+ Tâche": "+ مهمة", "Ajouter": "إضافة", "Ajouter plusieurs d'un coup": "إضافة عدة أشخاص دفعة واحدة", "Ajouter plusieurs personnes d'un coup": "إضافة عدة أشخاص دفعة واحدة", "Ajouter plusieurs personnes": "إضافة عدة أشخاص", "Ajouter une tâche… (Entrée)": "أضف مهمة… (Enter)", "Ajoute les personnes dont tu gères les rendez-vous, les papiers et les tâches.": "أضف الأشخاص الذين تنظّم مواعيدهم وأوراقهم ومهامهم.", "Commence par ta famille": "ابدأ بعائلتك", "Ta famille": "عائلتك", "Nouvelle personne": "شخص جديد", "Personne": "شخص", "Nouveau rendez-vous": "موعد جديد", "Rendez-vous": "موعد", "Nouvelle tâche": "مهمة جديدة", "Tâche": "مهمة", "Modifier": "تعديل", "Supprimer": "حذف", "Enregistrer": "حفظ", "Annuler": "إلغاء", "Fermer": "إغلاق", "OK": "حسنًا", "Quoi ?": "ماذا؟", "À faire": "للإنجاز", "Fait": "تم", "Faites récemment": "أُنجزت مؤخرًا", "Toutes": "الكل", "Tous": "الكل", "Important": "مهم", "Date": "التاريخ", "Pour le": "بتاريخ", "Pour qui ?": "لمن؟", "Lieu": "المكان", "Notes": "ملاحظات", "Rôle": "الصفة", "Prénom": "الاسم", "Prénom 1": "الاسم 1", "Prénom 2": "الاسم 2", "Heure (facultatif)": "الساعة (اختياري)", "Journée": "طوال اليوم", "Répéter": "التكرار", "Rappel": "تذكير", "Anniversaire": "تاريخ الميلاد", "Couleur": "اللون", "Emoji": "رمز تعبيري", "Une seule fois": "مرة واحدة", "Chaque jour": "كل يوم", "Chaque semaine": "كل أسبوع", "Chaque mois": "كل شهر", "Chaque année": "كل سنة", "Aucun rappel": "بدون تذكير", "À l'heure": "في الوقت", "15 min avant": "قبل 15 دقيقة", "1 h avant": "قبل ساعة", "La veille": "في اليوم السابق", "Le matin même (8 h)": "صباح اليوم نفسه (8 س)", "Calendrier": "التقويم", "Mois": "شهري", "Liste": "قائمة", "Les prochains jours": "الأيام القادمة", "Demain": "غدًا", "Sans date": "بدون تاريخ", "Rien de prévu.": "لا شيء مبرمج.", "Rien de prévu. Profites-en !": "لا شيء مبرمج. استمتع بوقتك!", "Rien ce jour-là.": "لا شيء في هذا اليوم.", "Rien dans les 30 prochains jours.": "لا شيء خلال 30 يومًا القادمة.", "Rien à faire pour le moment.": "لا شيء للإنجاز حاليًا.", "Personne pour l'instant.": "لا أحد حتى الآن.", "Ajouter plusieurs": "إضافة عدة", "Vu": "تم الاطلاع", "J'y vais": "أنا ذاهب", "C'est fait": "تم", "Dans 10 min": "بعد 10 دقائق", "À quoi ça sert ?": "ما فائدتها؟", "Explication": "الشرح", "Explication :": "الشرح:", "Notes (école, médecin, allergies…)": "ملاحظات (المدرسة، الطبيب، الحساسية…)", "Évite d'écrire des mots de passe ou numéros sensibles.": "تجنّب كتابة كلمات المرور أو الأرقام الحساسة.", "adresse, nom du cabinet…": "العنوان، اسم العيادة…", "documents à apporter, numéro de téléphone…": "وثائق يجب إحضارها، رقم الهاتف…", "ex : Dentiste, Réunion école…": "مثال: طبيب الأسنان، اجتماع المدرسة…", "ex : Maman, Papa, Fils, Grand-mère…": "مثال: أمي، أبي، ابني، جدتي…", "ex : Payer la cantine, Appeler la mairie…": "مثال: دفع مصاريف المطعم، الاتصال بالبلدية…", "Écris un prénom par ligne (ex : « Maman », « Yassine »…). Tu pourras modifier chaque fiche ensuite.": "اكتب اسمًا في كل سطر (مثال: «أمي»، «ياسين»…). يمكنك تعديل كل بطاقة لاحقًا.", "Fajr": "الفجر", "Dhuhr": "الظهر", "Asr": "العصر", "Maghrib": "المغرب", "Isha": "العشاء", "Horaires de prière": "أوقات الصلاة", "Marquer": "تسجيل", "Priée": "تمّت", "Réglages": "الإعدادات", "Utiliser ma position": "استخدام موقعي", "Ou choisis ta ville :": "أو اختر مدينتك:", "Méthode de calcul :": "طريقة الحساب:", "Ligue islamique mondiale (18° / 17°)": "رابطة العالم الإسلامي (18° / 17°)", "Maroc (19° / 17°)": "المغرب (19° / 17°)", "UOIF / France (Fajr 12°, Isha 12°)": "اتحاد المنظمات الإسلامية بفرنسا (الفجر 12°، العشاء 12°)", "Rappels désactivés": "التذكيرات معطّلة", "Rappels pendant les révisions : activés": "تذكير بأوقات الصلاة : مفعّل", "Notifications du navigateur": "إشعارات المتصفح", "Adhan": "الأذان", "Choisir mon adhan": "اختيار الأذان", "Tester": "تجربة", "Stop": "إيقاف", "Retirer": "إزالة", "aucun fichier": "لا يوجد ملف", "Volume :": "مستوى الصوت :", "Son activé": "الصوت مفعّل", "Son désactivé": "الصوت معطّل", "à": "على الساعة", "Choisis un fichier audio (mp3, m4a…) de l'adhan que tu aimes : il se jouera à l'heure de la prière quand l'appli est ouverte.": "اختر ملفًا صوتيًا (mp3، m4a…) للأذان الذي تحبه: سيُشغَّل في وقت الصلاة عندما يكون التطبيق مفتوحًا.", "Les horaires sont calculés directement dans l'appli (sans connexion) selon ta position. Ils peuvent différer de quelques minutes de ta mosquée : en cas de doute, suis le calendrier de ta mosquée. Les rappels s'affichent quand l'appli est ouverte.": "تُحسب الأوقات داخل التطبيق مباشرة (بدون إنترنت) حسب موقعك. قد تختلف بضع دقائق عن مسجدك: عند الشك اتبع تقويم مسجدك. تظهر التنبيهات عندما يكون التطبيق مفتوحًا.", "Chaque prière a un moment précis dans la journée. Ce verset rappelle que prier à son heure fait partie de l'obéissance. C'est pour cela que l'appli te prévient : ton emploi du temps d'étudiante s'organise autour de ces moments.": "لكل صلاة وقت محدد في اليوم. وتذكّرنا هذه الآية بأن الصلاة في وقتها من الطاعة؛ ولهذا ينبّهك التطبيق.", "La prière a ses horaires : l'heure qui vient est une invitation.": "للصلاة أوقاتها: والوقت القادم دعوة إليها.", "Pourquoi ce message ?": "لماذا هذه الرسالة؟", "« La prière demeure, pour les croyants, une prescription à temps déterminé. »": "﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾", "Traduction du sens en français": "معنى الآية", "Sourate 4 · An-Nisa (« Les Femmes »), verset 103 (fin du verset)": "سورة النساء، الآية 103 (آخر الآية)", "Qu'Allah accepte ta prière": "تقبّل الله صلاتك", "Il est l'heure de prier 🤲": "حان وقت الصلاة 🤲 تقبّل الله طاعتك", "Paris": "باريس", "Lille": "ليل", "Lyon": "ليون", "Marseille": "مرسيليا", "Bruxelles": "بروكسل", "Casablanca": "الدار البيضاء", "Rabat": "الرباط", "Fès": "فاس", "Marrakech": "مراكش", "Tanger": "طنجة", "Affichage": "العرض", "Affichage : thème, taille du texte": "العرض: المظهر وحجم الخط", "Thème": "المظهر", "Auto (sombre le soir)": "تلقائي (داكن في المساء)", "Clair": "فاتح", "Sépia": "سيبيا", "Sombre": "داكن", "Normal": "عادي", "Activer": "تفعيل", "Affichées": "ظاهرة", "Masquées": "مخفية", "Langue / اللغة": "اللغة", "Études de droit (cours, quiz, codes)": "دراسة القانون (دروس، اختبارات، مدونات)", "Mode lecture (texte plus grand et plus aéré, colonne étroite)": "وضع القراءة (خط أكبر وأوسع، عمود ضيق)", "Ma sauvegarde": "نسختي الاحتياطية", "Ta progression est enregistrée automatiquement": "يُحفظ تقدّمك تلقائيًا", "sur cet appareil, à deux endroits du navigateur (par sécurité).": "على هذا الجهاز، في مكانين من المتصفح (للأمان).", "Elle ne se perd pas en fermant l'appli. Elle ne disparaît que si tu vides les données du navigateur ou si tu changes d'appareil.": "لا يضيع عند إغلاق التطبيق. ولا يختفي إلا إذا مسحت بيانات المتصفح أو غيّرت الجهاز.", "Dernière sauvegarde en fichier :": "آخر نسخة احتياطية في ملف:", "jamais": "أبدًا", "Télécharger ma sauvegarde": "تنزيل نسختي الاحتياطية", "Restaurer depuis un fichier": "استرجاع من ملف", "Astuce : envoie-toi le fichier par mail ou WhatsApp pour retrouver ta progression sur un autre appareil.": "نصيحة: أرسل الملف إلى نفسك عبر البريد أو واتساب لتجد بياناتك على جهاز آخر.", "Ouvrir la synchronisation": "فتح المزامنة", "Synchronisation entre appareils": "المزامنة بين الأجهزة", "Pas encore activée : un compte te permet de tout retrouver sur ton téléphone et ton PC.": "غير مفعّلة بعد: الحساب يتيح لك إيجاد كل شيء على هاتفك وحاسوبك.", "Synchronisation": "المزامنة", "Retrouve tout sur ton téléphone et ton PC": "تجد كل شيء على هاتفك وحاسوبك", "Ne perds plus rien, et partage avec ta famille": "لا تضيّع شيئًا، وشارك مع عائلتك", "Avec un compte, ta progression, ton agenda, tes tâches et ta famille se retrouvent sur tous tes appareils. Les rendez-vous et tâches sont partagés avec les personnes de ta famille que tu invites.": "بحساب واحد تجد أجندتك ومهامك وعائلتك على جميع أجهزتك. المواعيد والمهام تُشارَك مع أفراد عائلتك الذين تدعوهم.", "Me connecter": "تسجيل الدخول", "Créer mon compte": "إنشاء حسابي", "Adresse e-mail": "البريد الإلكتروني", "Mot de passe (6 caractères minimum)": "كلمة المرور (6 أحرف على الأقل)", "Ton prénom": "اسمك", "Ton prénom (ex : Khalid)": "اسمك (مثال: خالد)", "Me déconnecter": "تسجيل الخروج", "Synchroniser maintenant": "مزامنة الآن", "Configurer": "إعداد", "Plus tard": "لاحقًا", "Crée un compte gratuit : tes données ne se perdent plus et se partagent avec ta famille.": "أنشئ حسابًا مجانيًا: لن تضيع بياناتك وتُشارَك مع عائلتك.", "La première personne crée la famille et reçoit un code. L’autre personne (toi ou ton mari) entre ce code sur son appareil.": "يُنشئ الشخص الأول العائلة ويحصل على رمز. ويُدخل الشخص الآخر هذا الرمز على جهازه.", "Nom de la famille": "اسم العائلة", "Créer la famille": "إنشاء العائلة", "Ou rejoindre une famille existante :": "أو انضم إلى عائلة موجودة:", "Code reçu (ex : 7F3A9C21BD)": "الرمز الذي وصلك (مثال: 7F3A9C21BD)", "Rejoindre avec le code": "الانضمام بالرمز", "Code à donner pour inviter quelqu’un :": "الرمز الذي تعطيه لدعوة شخص:", "Copier le code": "نسخ الرمز", "Envoyer": "إرسال", "Partagé dans la famille :": "مشترك داخل العائلة:", "personnes, rendez-vous et tâches.": "الأشخاص والمواعيد والمهام.", "Reste personnel :": "يبقى شخصيًا:", "tes cours, ta progression, tes réglages (mais retrouvés sur tous tes appareils).": "دروسك وتقدّمك وإعداداتك (لكنها تظهر على جميع أجهزتك).", "Quitter cette famille": "مغادرة هذه العائلة", "Ça marche aussi sans internet : tout est gardé sur l’appareil et se met à jour dès que la connexion revient.": "يعمل أيضًا بدون إنترنت: كل شيء محفوظ على الجهاز ويتحدّث بمجرد عودة الاتصال.", "Synchronisation : non connecté": "المزامنة: غير متصل", "Synchronisation en cours…": "جارٍ المزامنة…", "Synchronisé": "تمت المزامنة", "Hors connexion : se synchronisera plus tard": "بدون اتصال: ستتم المزامنة لاحقًا", "Problème de synchronisation": "مشكلة في المزامنة", "E-mail ou mot de passe incorrect.": "البريد الإلكتروني أو كلمة المرور غير صحيحة.", "Ce mail a déjà un compte : choisis « Me connecter ».": "هذا البريد لديه حساب بالفعل: اختر «تسجيل الدخول».", "Mot de passe : 6 caractères minimum.": "كلمة المرور: 6 أحرف على الأقل.", "Trop d’essais. Réessaie dans quelques minutes.": "محاولات كثيرة. أعد المحاولة بعد دقائق.", "Cette adresse e-mail n’est pas valide.": "عنوان البريد الإلكتروني غير صالح.", "Mail non confirmé : vérifie ta boîte mail.": "لم يتم تأكيد البريد: تحقق من صندوق بريدك.", "Code inconnu : vérifie les lettres et chiffres.": "الرمز غير معروف: تحقق من الحروف والأرقام.", "Les inscriptions sont désactivées sur le serveur.": "التسجيل معطّل على الخادم.", "Pas de connexion internet": "لا يوجد اتصال بالإنترنت", "Session expirée : reconnecte-toi.": "انتهت الجلسة: أعد تسجيل الدخول.", "Écris ton e-mail et ton mot de passe.": "اكتب بريدك الإلكتروني وكلمة المرور.", "Un instant…": "لحظة…", "Écris ton prénom.": "اكتب اسمك.", "Entre le code.": "أدخل الرمز.", "Compte créé. Confirme ton adresse via le mail reçu, puis connecte-toi.": "تم إنشاء الحساب. أكّد عنوانك عبر البريد الذي وصلك ثم سجّل الدخول.", "Famille introuvable": "العائلة غير موجودة", "Sauvegarde restaurée ✅": "تم استرجاع النسخة ✅", "Fichier invalide ❌": "ملف غير صالح ❌", "Donne un titre": "اكتب عنوانًا", "Écris la tâche": "اكتب المهمة", "Écris un prénom": "اكتب اسمًا", "Bravo, une de moins ✅": "أحسنت، مهمة أقل ✅", "Connecté ✅": "تم الاتصال ✅", "Prénom enregistré ✅": "تم حفظ الاسم ✅", "Synchronisation…": "جارٍ المزامنة…", "Famille créée ✅": "تم إنشاء العائلة ✅", "Famille rejointe ✅": "تم الانضمام إلى العائلة ✅", "Code copié": "تم نسخ الرمز", "Message copié": "تم نسخ الرسالة", "Copié": "تم النسخ", "Copie impossible": "تعذّر النسخ", "Supprimer définitivement ?": "حذف نهائيًا؟", "Remplacer ta progression actuelle par cette sauvegarde ?": "استبدال تقدّمك الحالي بهذه النسخة؟", "Te déconnecter ? Tes données restent sur cet appareil.": "تسجيل الخروج؟ تبقى بياناتك على هذا الجهاز.", "Quitter cette famille ? Les données restent sur cet appareil mais ne seront plus partagées.": "مغادرة هذه العائلة؟ تبقى البيانات على هذا الجهاز لكنها لن تُشارَك بعد الآن.", "Position enregistrée ✅": "تم حفظ الموقع ✅", "Notifications activées ✅": "تم تفعيل الإشعارات ✅", "Notifications refusées": "تم رفض الإشعارات", "Non disponible sur ce navigateur": "غير متاح في هذا المتصفح", "Adhan enregistré ✅": "تم حفظ الأذان ✅", "Adhan retiré": "تمت إزالة الأذان", "Choisis un fichier audio": "اختر ملفًا صوتيًا", "Fichier trop lourd (max 15 Mo)": "الملف كبير جدًا (الحد الأقصى 15 ميغا)", "Enregistrement impossible sur ce navigateur": "تعذّر الحفظ في هذا المتصفح", "Lecture impossible : touche d'abord l'écran puis réessaie": "تعذّر التشغيل: المس الشاشة أولاً ثم أعد المحاولة", "Une seule personne": "شخص واحد", "En retard": "متأخرة", "RDV": "موعد", "Prénom 1\nPrénom 2\n…": "الاسم 1\nالاسم 2\n…"});
const ARP=[["Prochaine prière : (\\P{L}*)(Fajr|Dhuhr|Asr|Maghrib|Isha) à (\\d\\d:\\d\\d) \\(dans (\\d+) h (\\d+)\\)", "الصلاة القادمة : {1}{2} على الساعة {3} (بعد {4} س {5} د)"], ["Prochaine prière : (\\P{L}*)(Fajr|Dhuhr|Asr|Maghrib|Isha) à (\\d\\d:\\d\\d) \\(dans (\\d+) min\\)", "الصلاة القادمة : {1}{2} على الساعة {3} (بعد {4} دقيقة)"], ["Prochaine prière : (\\P{L}*)(Fajr|Dhuhr|Asr|Maghrib|Isha) à (\\d\\d:\\d\\d)", "الصلاة القادمة : {1}{2} على الساعة {3}"], ["(Fajr|Dhuhr|Asr|Maghrib|Isha) (\\d\\d:\\d\\d)", "{1} {2}"], ["C'est l'heure de (Fajr|Dhuhr|Asr|Maghrib|Isha) · (\\d\\d:\\d\\d)", "حان وقت صلاة {1} · {2}"], ["C'est l'heure de (Fajr|Dhuhr|Asr|Maghrib|Isha)", "حان وقت صلاة {1}"], ["dans (\\d+) h (\\d+)", "بعد {1} س {2} د"], ["dans (\\d+) h", "بعد {1} س"], ["dans (\\d+) min", "بعد {1} دقيقة"], ["Dans (\\d+) min", "بعد {1} دقيقة"], ["Lever du soleil : (\\d\\d:\\d\\d) \\(fin de Fajr\\)", "شروق الشمس : {1} (نهاية الفجر)"], ["(.+) · (\\d)/5 aujourd'hui · touche pour régler", "{1} · {2}/5 اليوم · المس للتعديل"], ["(Paris|Lille|Lyon|Marseille|Bruxelles|Casablanca|Rabat|Fès|Marrakech|Tanger) · (.*)", "{1} · {2}"], ["Taille du texte : (\\d+) %", "حجم الخط : {1} %"], ["Connecté : (.*)", "متصل : {1}"], ["Anniversaire de (.*) \\((\\d+) ans\\)", "عيد ميلاد {1} ({2} سنة)"], ["Anniversaire de (.*)", "عيد ميلاد {1}"], ["Coran · Coran (\\d+:\\d+)", "القرآن · {1}"], ["fichier chargé ✅ \\((\\d+) Ko\\)", "تم تحميل الملف ✅ ({1} ك.ب)"], ["(\\d+) personnes", "{1} أشخاص"], ["(\\d+) à venir \\(30 j\\) · 🎂 (.*)", "{1} قادمة خلال 30 يومًا · 🎂 {2}"], ["(\\d+) à venir \\(30 j\\)", "{1} قادمة خلال 30 يومًا"], ["En retard \\((\\d+)\\)", "متأخرة ({1})"], ["(\\d+) en retard", "{1} متأخرة"], ["À venir \\((\\d+) jours\\)", "القادمة ({1} يومًا)"], ["À venir \\((\\d+)\\)", "القادمة ({1})"], ["Sans date \\((\\d+)\\)", "بدون تاريخ ({1})"], ["Faites récemment \\((\\d+)\\)", "أُنجزت مؤخرًا ({1})"], ["… et (\\d+) autres, dans l'onglet Tâches", "… و{1} أخرى في تبويب المهام"], ["À faire · (.*)", "للإنجاز · {1}"], ["Rendez-vous · (.*)", "موعد · {1}"], ["(.*) · (\\d+) chose(s?) aujourd'hui", "{1} · {2} مهمة اليوم"], ["(.*) · rien de prévu aujourd'hui", "{1} · لا شيء مبرمج اليوم"], ["Prochaine fois : (.*)", "المرة القادمة : {1}"], ["(.*) a ajouté : (.*)", "{1} أضاف : {2}"], ["(\\d+) nouveautés ajoutées par ta famille", "{1} إضافات جديدة من عائلتك"], ["Prochaine prière", "الصلاة القادمة"]];
const _lead=/^[^\p{L}\p{N}]*/u,_tail=/[^\p{L}\p{N}]*$/u;
Object.assign(AR,{'Code de vérification incorrect.':'رمز التحقق غير صحيح.','Versets & hadiths':'آيات وأحاديث','Je suis Hajar (étudiante en droit)':'أنا هاجر (طالبة القانون)','Si tu coches, la partie études (cours, quiz, codes) est affichée. Sinon, elle reste cachée.':'عند التحديد يظهر قسم الدراسة (الدروس والاختبارات والقوانين)، وإلا يبقى مخفياً.'});
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
 if(ar){document.title='عائلتي';if(!trMO){trMO=new MutationObserver(ms=>{if(document.body.classList.contains('study'))return;ms.forEach(m=>{if(m.type==='characterData')trNode(m.target);else m.addedNodes.forEach(trNode);});});trMO.observe(document.body,{childList:true,subtree:true,characterData:true});}trNode(document.body);}
 else{document.title='Ma famille';}}
function setLang(l){S.lang=l;if(S.stl==='o')S.nost=1;else if(!S.stl){if(l==='ar'&&S.nost===undefined){S.nost=1;S.nsa=1;}if(l==='fr'&&S.nsa){S.nost=0;S.nsa=0;}}flush();langApply();hud();route();toast(l==='ar'?'تم تغيير اللغة':'Langue : français');}
const _cf=window.confirm.bind(window),_al=window.alert.bind(window);window.confirm=m=>_cf(trS(m));window.alert=m=>_al(trS(m));
