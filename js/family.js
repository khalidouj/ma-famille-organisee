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
 ${instCard()}<div class="row"><button class="btn" id="aEv">📅 + Rendez-vous</button><button class="btn" id="aTk">✅ + Tâche</button></div>
 ${!fam().length?`<div class="plan"><h3>👪 Commence par ta famille</h3><div class="mini">Ajoute les personnes dont tu gères les rendez-vous, les papiers et les tâches.</div><div class="row"><button class="btn" onclick="quickAddFam()">Ajouter plusieurs personnes d'un coup</button><button class="btn alt" onclick="pForm()">Une seule personne</button></div></div>`:''}
 ${od.length?`<div class="plan" style="border-color:#e53935"><h3>⚠️ En retard (${od.length})</h3>${od.slice(0,6).map(x=>rowHtml({k:'tk',id:x.id,t:x.t,tm:x.tm,w:x.w,date:x.d,it:x},1)).join('')}${od.length>6?`<div class="mini">… et ${od.length-6} autres, dans l'onglet Tâches</div>`:''}</div>`:''}
 <div class="plan"><h3>📌 Aujourd'hui</h3>${todayItems.length?todayItems.map(x=>rowHtml(x)).join(''):'<div class="mini">Rien de prévu. Profites-en ! 🌿</div>'}</div>
 ${prayerCard()}
 <div class="plan"><h3>🌅 Demain</h3>${tom.length?tom.map(x=>rowHtml(x)).join(''):'<div class="mini">Rien de prévu.</div>'}</div>
 ${nextDays.length?`<div class="plan"><h3>🗓️ Les prochains jours</h3>${nextDays.map(([d,l])=>`<div class="mini" style="margin-top:6px"><b>${fdate(d,1)}</b></div>${l.map(x=>rowHtml(x)).join('')}`).join('')}</div>`:''}
 ${noDate.length?`<div class="plan"><h3>📝 Sans date (${noDate.length})</h3>${noDate.slice(0,5).map(x=>rowHtml({k:'tk',id:x.id,t:x.t,tm:'',w:x.w,date:'',it:x})).join('')}</div>`:''}
 <div class="plan" style="cursor:pointer" onclick="go('etudes')"><h3>📚 Mes études de droit</h3><div class="mini">Avancement total : <b>${overall()}%</b> · session du jour, quiz, flashcards, codes</div></div>`);
 bindRows($('#app'));$('#aEv').onclick=()=>evForm();$('#aTk').onclick=()=>tkForm();instBind();}
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
 ${famCard()}${chCard()}<div class="row"><button class="btn" onclick="pForm()">+ Ajouter une personne</button><button class="btn alt" onclick="quickAddFam()">Ajouter plusieurs d'un coup</button></div>
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
const TABS=[['','🏠','Aujourd\'hui'],['cal','📅','Agenda'],['tasks','✅','Tâches'],['fam','👪','Famille'],['etudes','📚','Études']];
function renderTabs(a){const nav=$('#tabbar');if(!nav)return;const TB=S.nost?TABS.filter(t=>t[0]!=='etudes'):TABS;const cur=['','cal','tasks','fam','etudes'].includes(a)?a:(a==='p'||a==='chat'?'fam':['e','exam','review','science','search','code','penal','spirit','today','weak'].includes(a)?'etudes':a==='data'||a==='prayer'||a==='sync'?null:'');
 nav.innerHTML=TB.map(([h,e,l])=>`<button class="tb ${h===cur?'on':''}" onclick="go('${h}')"><span>${e}</span><small>${l}</small></button>`).join('');}
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
function syUI(){try{admVis();}catch(e){}const b=$('#pSync');if(b){const m={out:['☁️','Synchronisation : non connecté'],idle:['☁️','Synchronisation'],sync:['🔄','Synchronisation en cours…'],ok:['✅','Synchronisé'],off:['📴','Hors connexion : se synchronisera plus tard'],err:['⚠️','Problème de synchronisation']}[SY.st]||['☁️',''];b.textContent='👤';b.dataset.st=(SY.st==='sync'||SY.st==='off'||SY.st==='err')?m[0]:'';b.title='Mon compte · '+m[1];b.classList.toggle('dim',SY.st==='out');}
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
function viewGate(){setApp(`<div style="max-width:440px;margin:18px auto 0;text-align:center"><div style="font-size:3.2rem">🏡</div><h1 style="margin:.2em 0">Ma famille</h1><div class="mini" style="margin-bottom:6px">Agenda, tâches, prière et famille : tout au même endroit.</div></div><div style="max-width:440px;margin:0 auto">${instCard(1)}</div><div id="syBody" style="max-width:440px;margin:0 auto"></div>`);syFill();instBind();}
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
function nfHelp(){const ios=/iphone|ipad/i.test(navigator.userAgent),sa=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
 if(!window.Notification||(ios&&!sa))return '<div class="card mini" style="margin-top:10px">📵 '+(ios&&!sa?'Sur iPhone, installe d\'abord l\'appli : touche Partager puis « Sur l\'écran d\'accueil », rouvre-la depuis l\'icône, puis reviens ici.':'Ce navigateur ne permet pas les notifications. Ouvre l\'appli dans Chrome, ou installe-la sur l\'écran d\'accueil.')+'</div>';
 if(Notification.permission==='denied')return '<div class="card mini" style="margin-top:10px">🚫 Les notifications sont bloquées pour cette appli. Pour les autoriser : appui long sur l\'icône de l\'appli → Infos de l\'appli → Notifications → Autoriser. (Ou dans Chrome : ⋮ → Paramètres → Paramètres des sites → Notifications → autoriser ce site.) Puis rouvre cette fenêtre.</div>';
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
/* installation */
function instCard(f){if((!f&&S.inst)||matchMedia('(display-mode: standalone)').matches||navigator.standalone)return '';return `<div class="card" id="instC" style="margin:12px 0"><b>📲 Installer l'application</b><div class="mini">Ajoute Ma famille à ton écran d'accueil : elle s'ouvre comme une vraie appli, sans te reconnecter.</div><div class="row" style="margin-top:8px"><button class="btn" id="instGo">Installer</button>${f?'':'<button class="btn alt" id="instLt">Plus tard</button>'}</div></div>`;}
function instBind(){const g=$('#instGo');if(!g)return;g.onclick=()=>{if(DEFER)doInstall();else toast(/iphone|ipad/i.test(navigator.userAgent)?'Touche Partager puis « Sur l’écran d’accueil »':'Menu ⋮ du navigateur, puis « Installer l’application »',6000);};const lt=$('#instLt');if(lt)lt.onclick=()=>{S.inst=1;save();$('#instC').remove();};}
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
function openAccount(){if($('#acO'))return;const d=document.createElement('div');d.className='lv-ov';d.id='acO';
 const typ=S.stl==='h'?'👩‍🎓 Hajar (études de droit affichées)':S.stl==='o'?'👤 Compte famille':'';
 d.innerHTML=`<div class="lv-card pf" style="text-align:start;padding:18px 16px"><h3 style="margin:0 0 4px">👤 Mon compte</h3>
 <div><b data-nt>${esc(S.me||'—')}</b> <span class="mini" data-nt>${esc(SY.email||'')}</span>${typ?`<div class="mini">${typ}</div>`:''}</div>
 ${SY.at?`<div class="acav"><span id="acAvI">${chAvSpan(chMe(),esc((S.me||'?').trim().charAt(0).toUpperCase()||'?'),chCol(chMe()),'big')}</span><div style="display:grid;gap:6px"><button class="btn alt" id="acAv" type="button">📷 Photo de profil</button>${AV.m[chMe()]?'<button class="btn alt" id="acAvX" type="button">Retirer la photo</button>':''}</div><input type="file" id="acAvF" accept="image/*" hidden></div>`:''}
 ${SY.fid?`<div class="mini" style="margin-top:4px">👪 <b data-nt>${esc(SY.fname||'')}</b> · <span style="font-family:monospace;letter-spacing:.08em;user-select:all" data-nt>${esc(SY.code||'')}</span></div>`:'<div class="mini" style="margin-top:4px">👪 Pas encore de famille : va dans l\'onglet « Famille ».</div>'}
 <div class="mini" style="margin:4px 0 10px" data-nt>${esc(syStatTxt())}</div>
 <div class="acg"><button class="btn" id="acSy">🔄 Synchroniser</button>${matchMedia('(display-mode: standalone)').matches?'':'<button class="btn alt" id="acIn">📲 Installer</button>'}<button class="btn alt" id="acPw">🔑 Mot de passe</button><button class="btn alt" id="acDt">☁️ Détails synchro</button>${S.stl==='h'?'':'<button class="btn alt" id="acH">👩‍🎓 Je suis Hajar</button>'}${SY.adm||SY.email===OWNER?'<button class="btn alt" id="acAd">🛠️ Admin</button>':''}<button class="btn alt" id="acWp">🧹 Effacer cet appareil</button><button class="btn alt" id="acDel" style="color:#c62828">🗑️ Supprimer mon compte</button></div>
 <div class="acg" style="margin-top:8px"><button class="btn alt" id="acOut" style="color:#c62828">🚪 Me déconnecter</button><button class="btn" id="acX">Fermer</button></div></div>`;
 document.body.appendChild(d);const c=()=>d.remove();d.onclick=e=>{if(e.target===d)c();};$('#acX',d).onclick=c;
 $('#acSy',d).onclick=()=>{syncNow();toast('Synchronisation…');c();};$('#acDt',d).onclick=()=>{c();go('sync');};$('#acPw',d).onclick=()=>{c();pwForm();};$('#acOut',d).onclick=doLogout;$('#acDel',d).onclick=deleteMyAccount;
 $('#acWp',d).onclick=async()=>{if(!confirm('Effacer toutes les données locales de cet appareil (personnes, rendez-vous, tâches, progression) ? Celles de ton compte en ligne sont conservées et seront rechargées.'))return;c();await resetUserData();route();syncNow();toast('Appareil nettoyé ✅');};
 const avb=$('#acAv',d);if(avb){avb.onclick=()=>$('#acAvF',d).click();$('#acAvF',d).onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;if(!/^image\//.test(f.type)){toast('Choisis une photo');return;}await avSet(f);const x=$('#acAvX',d);if(!x&&AV.m[chMe()]){const b2=document.createElement('button');b2.className='btn alt';b2.id='acAvX';b2.type='button';b2.textContent=trS('Retirer la photo');b2.onclick=async()=>{await avSet(null);b2.remove();};avb.parentNode.appendChild(b2);}};const ax=$('#acAvX',d);if(ax)ax.onclick=async()=>{await avSet(null);ax.remove();};}
 const ad=$('#acAd',d);if(ad)ad.onclick=()=>{c();go('admin');};
 const ins=$('#acIn',d);if(ins)ins.onclick=()=>{if(DEFER){c();doInstall();}else toast(/iphone|ipad/i.test(navigator.userAgent)?'Touche Partager puis « Sur l’écran d’accueil »':'Menu ⋮ du navigateur, puis « Installer l’application »',6000);};
 const h=$('#acH',d);if(h)h.onclick=async()=>{const k=(prompt('Code de vérification')||'').trim();if(!k)return;if((await sha256(k))!==HJH){toast('Code de vérification incorrect.');return;}S.stl='h';S.nost=0;S.nsa=0;save();c();langApply();renderTabs((location.hash.slice(1).split('/')[0])||'');route();toast('Compte Hajar activé ✅');};
 const o2=$('#acO2',d);if(o2)o2.onclick=()=>{if(!confirm('Compte famille : la partie études et les messages personnels seront masqués. Continuer ?'))return;S.stl='o';S.nost=1;S.nsa=0;save();c();langApply();renderTabs('');route();};}
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
async function chOverview(){if(!chOn())return;try{CH.ov=await sbData('/rest/v1/rpc/chat_overview',{m:'POST',b:{f:SY.fid}});}catch(e){return;}chBadge();CH.ov.convs.forEach(c=>{if(!c.unread&&c.conv!==CH.conv)chClearBell(c.conv,8000);else if(c.unread&&c.last&&c.last.sender!==chMe()&&c.conv!==CH.conv){const k=c.conv+':'+c.last.id;if(!CH.nfs[k]){CH.nfs[k]=1;if(!nfList().some(x=>x.go==='chat/'+c.conv))nfAdd('💬',chName(c.last.sender)+' : '+chPrev(c.last).slice(0,60),'chat/'+c.conv,'cmo'+k,'chat-'+c.conv);}}});avSync();if(location.hash==='#chat'&&$('#chLs'))chListDraw();}
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
 setApp(`<div class="chv" id="chV"><div class="chh"><button class="btn alt" id="chBk" type="button" style="padding:6px 12px">←</button><span id="chHav">${chHeadAv(conv)}</span><div style="flex:1;min-width:0"><b class="chtt">${esc(chTitle(conv))}</b><div class="mini" id="chTy" style="min-height:1em"></div></div></div><div class="chl" id="chL"><div class="mini" style="text-align:center;margin:30px">Chargement…</div></div><div id="chRq"></div><div class="chc" id="chC"></div></div>`);
 const V=$('#chV'),pos=()=>{const th=($('.top')||{}).offsetHeight||56,vv=window.visualViewport;V.style.top=((vv?vv.offsetTop:0)+th)+'px';V.style.height=((vv?vv.height:innerHeight)-th)+'px';V.style.bottom='auto';};pos();
 if(window.visualViewport){CH.vvf=()=>{if($('#chV')){pos();const L=$('#chL');if(L)L.scrollTop=L.scrollHeight;}};visualViewport.addEventListener('resize',CH.vvf);visualViewport.addEventListener('scroll',CH.vvf);}
 $('#chBk').onclick=()=>go('chat');const L=$('#chL');chBindMedia(L);
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
Object.assign(AR,{"Agenda, tâches, prière et famille : tout au même endroit.": "الأجندة والمهام والصلاة والعائلة: كل شيء في مكان واحد.", "Connecté": "متصل", "📲 Installer l'application": "📲 تثبيت التطبيق", "Installer l'application": "تثبيت التطبيق", "Ajoute Ma famille à ton écran d'accueil : elle s'ouvre comme une vraie appli, sans te reconnecter.": "أضف «عائلتي» إلى شاشتك الرئيسية: يفتح مثل تطبيق حقيقي دون إعادة تسجيل الدخول.", "Installer": "تثبيت", "Plus tard": "لاحقاً", "Touche Partager puis « Sur l’écran d’accueil »": "اضغط على مشاركة ثم «إضافة إلى الشاشة الرئيسية»", "Menu ⋮ du navigateur, puis « Installer l’application »": "من قائمة ⋮ في المتصفح اختر «تثبيت التطبيق»", "Notifications": "الإشعارات", "Aucune notification pour l'instant.": "لا توجد إشعارات حالياً.", "Activer sur le téléphone": "تفعيل على الهاتف", "Vider": "مسح الكل", "Fermer": "إغلاق", "Notifications activées ✅": "تم تفعيل الإشعارات ✅", "Notifications refusées": "تم رفض الإشعارات", "Rejoins ta famille": "انضم إلى عائلتك", "Entre le code reçu : tu retrouves tout de suite ta famille, ses rendez-vous et ses tâches.": "أدخل الرمز الذي وصلك: ستجد عائلتك ومواعيدها ومهامها فوراً.", "Code de la famille": "رمز العائلة", "Rejoindre": "انضمام", "Pas de code ? Créer une nouvelle famille": "ليس لديك رمز؟ أنشئ عائلة جديدة", "Notre famille": "عائلتنا", "Créer": "إنشاء", "Entre le code.": "أدخل الرمز.", "Famille rejointe ✅": "تم الانضمام إلى العائلة ✅", "Famille créée ✅": "تم إنشاء العائلة ✅", "Code copié": "تم نسخ الرمز", "Message copié": "تم نسخ الرسالة", "Code à donner pour inviter quelqu’un :": "الرمز الذي تعطيه لمن تريد دعوته:", "Copier le code": "نسخ الرمز", "Envoyer": "إرسال", "Adhan": "الأذان", "Choisis l'adhan qui se jouera à l'heure de la prière (quand l'appli est ouverte). Pour le Fajr, la version avec « Aş-şalât khayrun mina n-nawm » est utilisée.": "اختر الأذان الذي سيُرفع عند وقت الصلاة (عندما يكون التطبيق مفتوحاً). في الفجر تُستعمل النسخة التي فيها «الصلاة خير من النوم».", "Choisir": "اختيار", "✅ Choisi": "✅ تم الاختيار", "Aucun (silencieux)": "بدون (صامت)", "Mon propre fichier": "ملفي الخاص", "chargé ✅": "تم التحميل ✅", "Stop": "إيقاف", "Adhan enregistré ✅": "تم حفظ الأذان ✅", "Connexion nécessaire pour télécharger l'adhan": "يلزم الاتصال بالإنترنت لتحميل الأذان", "Lecture impossible : vérifie ta connexion": "تعذّر التشغيل: تحقق من اتصالك", "Volume :": "مستوى الصوت :"});
Object.assign(AR,{"✅ Passer en méthode France (UOIF 12°/12°)": "✅ اعتماد طريقة فرنسا (UOIF 12°/12°)", "Méthode France activée ✅": "تم تفعيل طريقة فرنسا ✅"});
Object.assign(AR,{"Discussions": "المحادثات", "Écrire, envoyer un vocal ou une photo à la famille": "اكتب أو أرسل رسالة صوتية أو صورة للعائلة", "En direct · vocaux · photos": "مباشر · رسائل صوتية · صور", "Les messages sont visibles uniquement par la famille.": "الرسائل مرئية فقط للعائلة.", "Toute la famille": "كل العائلة", "Conversations à deux": "محادثات ثنائية", "Aucun message": "لا توجد رسائل", "Aucun message pour l'instant.": "لا توجد رسائل بعد.", "Écris le premier": "اكتب أول رسالة", "Écrire un message…": "اكتب رسالة…", "Messages plus anciens": "رسائل أقدم", "↑ Messages plus anciens": "↑ رسائل أقدم", "Moi": "أنا", "Hier": "أمس", "Photo": "صورة", "Message vocal": "رسالة صوتية", "RDV ou tâche": "موعد أو مهمة", "Partager un rendez-vous ou une tâche": "مشاركة موعد أو مهمة", "Rien à partager pour le moment.": "لا شيء للمشاركة حاليًا.", "Copier": "نسخ", "Supprimer pour tous": "حذف للجميع", "Message supprimé": "تم حذف الرسالة", "Tâche partagée": "مهمة مشتركة", "RDV partagé": "موعد مشترك", "Ouvrir": "فتح", "Enregistrement…": "جارٍ التسجيل…", "Non envoyé · réessayer": "لم تُرسل · أعد المحاولة", "Rejoins d'abord une famille pour pouvoir discuter avec elle.": "انضم أولًا إلى عائلة لتتمكن من التحدث معها.", "Rejoindre une famille": "الانضمام إلى عائلة", "Vocal trop court": "الرسالة الصوتية قصيرة جدًا", "Micro refusé : autorise-le dans les réglages du site": "تم رفض الميكروفون: اسمح به من إعدادات الموقع", "Vocal non disponible sur ce navigateur": "الرسائل الصوتية غير متاحة في هذا المتصفح", "Pas de connexion : touche « réessayer »": "لا يوجد اتصال: اضغط «أعد المحاولة»", "Photo illisible": "تعذّرت قراءة الصورة", "Choisis une photo": "اختر صورة", "Vocal introuvable": "الرسالة الصوتية غير موجودة", "Ajouté ✅": "تمت الإضافة ✅", "Options": "خيارات", "Joindre": "إرفاق"});
Object.assign(AR,{"Le serveur a déjà envoyé trop de mails de confirmation. Réessaie dans environ 1 h, ou connecte-toi si ton compte existe déjà.": "أرسل الخادم عدداً كبيراً من رسائل التأكيد. أعد المحاولة بعد ساعة تقريباً، أو سجّل الدخول إذا كان حسابك موجوداً.", "↩️ Répondre": "↩️ رد", "📷 Photo de profil": "📷 صورة الملف الشخصي", "Retirer la photo": "إزالة الصورة", "Photo de profil mise à jour ✅": "تم تحديث الصورة ✅", "Photo retirée": "تمت إزالة الصورة", "Message plus ancien : charge d'abord les messages précédents": "رسالة أقدم: حمّل الرسائل السابقة أولاً"});
Object.assign(AR,{"Impossible de charger les messages.":"تعذّر تحميل الرسائل.","Réessayer":"إعادة المحاولة","Aucun micro trouvé sur cet appareil":"لم يتم العثور على ميكروفون"});
Object.assign(AR,{"Mon compte": "حسابي", "Pas encore de famille : va dans l'onglet « Famille ».": "لا توجد عائلة بعد: اذهب إلى تبويب «العائلة».", "Type de compte": "نوع الحساب", "Je suis Hajar": "أنا هاجر", "Autre personne": "شخص آخر", "Synchroniser": "مزامنة", "Installer": "تثبيت", "Détails de la synchro": "تفاصيل المزامنة", "Me déconnecter": "تسجيل الخروج", "Hajar (études de droit affichées)": "هاجر (قسم دراسة القانون ظاهر)", "Compte famille": "حساب عائلي", "Compte Hajar activé ✅": "تم تفعيل حساب هاجر ✅", ": choisis pour adapter l'appli.": ": اختر لتكييف التطبيق.", "Code de vérification": "رمز التحقق", "Te déconnecter ? Tes données restent sur cet appareil.": "تسجيل الخروج؟ تبقى بياناتك على هذا الجهاز.", "Compte famille : la partie études et les messages personnels seront masqués. Continuer ?": "حساب عائلي: سيتم إخفاء قسم الدراسة والرسائل الشخصية. المتابعة؟", "Synchronisation…": "جارٍ المزامنة…"});
Object.assign(AR,{"Mot de passe oublié ?": "هل نسيت كلمة المرور؟", "Écris d'abord ton adresse e-mail.": "اكتب بريدك الإلكتروني أولاً.", "Si ce compte existe, un mail vient d'être envoyé : ouvre le lien depuis ton téléphone.": "إذا كان الحساب موجوداً فقد أُرسل إليك بريد: افتح الرابط من هاتفك.", "Nouveau mot de passe": "كلمة مرور جديدة", "Changer mon mot de passe": "تغيير كلمة المرور", "Nouveau mot de passe (6 caractères minimum)": "كلمة المرور الجديدة (6 أحرف على الأقل)", "Répète le mot de passe": "أعد كتابة كلمة المرور", "Enregistrer": "حفظ", "Annuler": "إلغاء", "Mot de passe : 6 caractères minimum.": "كلمة المرور: 6 أحرف على الأقل.", "Les deux mots de passe sont différents.": "كلمتا المرور مختلفتان.", "Mot de passe enregistré ✅": "تم حفظ كلمة المرور ✅", "Lien expiré ou invalide : refais « Mot de passe oublié ».": "الرابط منتهي أو غير صالح: أعد طلب «نسيت كلمة المرور».", "Mot de passe": "كلمة المرور"});
Object.assign(AR,{"Effacer les données de cet appareil": "مسح بيانات هذا الجهاز", "Supprimer mon compte": "حذف حسابي", "Compte supprimé": "تم حذف الحساب", "Appareil nettoyé ✅": "تم تنظيف الجهاز ✅", "Annulé": "تم الإلغاء"});
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
