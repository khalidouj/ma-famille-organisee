/* ---------- HOME ---------- */
function viewHome(){setTimeout(bindPlan,0);
 const due=allQuestions().filter(x=>isDue(x.id)).length+allFlash().filter(x=>isDue(x.id)).length;
 const stats=allQuestions().length;
 setApp(`<div class="hero">
  <span class="float" style="left:8%;top:12%">⚖️</span><span class="float" style="right:12%;top:18%;animation-delay:-2s">📚</span><span class="float" style="right:30%;bottom:8%;animation-delay:-4s">🧠</span>
  <h1>Les grands procès du XXe et XXIe siècle</h1>
  <p>Droit pénal · ton cours complet, transformé en <b>aventure à mémoriser</b>.</p>
  <p class="mini" style="color:#fff;opacity:.9">🏁 Avancement total : <b>${overall()}%</b></p>
  <p class="mini" style="color:#fff;opacity:.8">8 étapes · ${stats} questions · palais mental · flashcards · révision espacée · examen type barreau</p>
  <div class="row">
   <button class="btn" onclick="go('today')">▶️ Ma session du jour</button>
   <button class="btn ghost" onclick="go('review')">🔁 Révision espacée (${due})</button>
   <button class="btn ghost" onclick="go('exam')">🏛️ Examen barreau</button>
   <button class="btn ghost" onclick="go('science')">🔬 La science de la mémoire</button>
   <button class="btn ghost" onclick="go('search')">🔎 Chercher dans le cours</button>
   <button class="btn ghost" onclick="go('code')">📚 Code civil</button>
   <button class="btn ghost" onclick="go('penal')">⚖️ Code pénal</button>
  </div></div>
  ${prayerCard()}
  ${planCard()}
  <h2>🗺️ Ta route (clique une étape)</h2>
  <div class="stations">${E.map((e,i)=>`<div class="st" style="--c:#${e.color};animation-delay:${i*70}ms" onclick="go('e/${e.n}')">
    <span class="n">${e.n}</span><div class="em">${e.emoji}</div><h3>${esc(e.title)}</h3><div class="mini">${esc(e.pages)}</div>
    <div class="ring" title="Avancement : palais + cours + flashcards + quiz" style="--p:${progress(e)}"><span>${progress(e)}%</span></div>${(()=>{const p=parts(e);const f=x=>Math.round(100*x);return `<div class="pm"><span>🧠 ${f(p.p)}%</span><span>📖 ${f(p.c)}%</span>${p.f===null?'':`<span>🃏 ${f(p.f)}%</span>`}<span>🎯 ${f(p.q)}%</span></div>`;})()}</div>`).join('')}
   <div class="st" style="--c:#b71c1c;animation-delay:600ms" onclick="go('exam')"><span class="n">G</span><div class="em">🏛️</div><h3>QCM global type barreau</h3><div class="mini">8 cas pratiques + questions mixtes</div></div></div>
  <p style="text-align:center;margin-top:20px"><button class="btn alt" onclick="go('data')">💾 Ma sauvegarde</button> <button class="btn" id="instBtn" style="display:none" onclick="doInstall()">📲 Installer l'appli</button></p>
  <h2>🎯 Le truc pour retenir</h2>
  <div class="grid2">
   <div class="card"><b>1. Palais mental</b><br>Chaque étape est une pièce. Clique les objets : un fait = une image.</div>
   <div class="card"><b>2. Rappel actif</b><br>Cache les textes, essaie de te souvenir, puis vérifie.</div>
   <div class="card"><b>3. Répétition espacée</b><br>Tes erreurs reviennent plus souvent (boîtes de Leitner).</div>
  </div>`);
}
/* ---------- ETAPE ---------- */
function viewEtape(n,tab){const e=E.find(x=>x.n===n);if(!e)return viewHome();
 const tabs=[['palais','🧠 Palais mental'],['cours','📖 Cours'],['cartes','🃏 Flashcards'],['quiz','🎯 Quiz']];
 setApp(`<div style="--c:#${e.color}">
  <div class="banner"><div class="mini" style="color:#fff;opacity:.85">ÉTAPE ${e.n} · ${esc(e.pages.toUpperCase())}</div><h1>${e.emoji} ${esc(e.title)}</h1></div>
  <div class="bref"><b>🔎 En bref</b><br>${rt(e.bref)}</div>
  <div class="tabs">${tabs.map(t=>{const pp=parts(e);const v={palais:pp.p,cours:pp.c,cartes:pp.f,quiz:pp.q}[t[0]];const lab=v==null?'':v>=1?' ✓':v>0?' '+Math.round(v*100)+'%':'';return `<button class="tab ${t[0]===tab?'on':''}" onclick="go('e/${n}/${t[0]}')">${t[1]}${lab}</button>`;}).join('')}
   <button class="tab" onclick="go('etudes')" style="margin-left:auto">🏠</button></div>
  <div id="pane"></div></div>`);
 ({palais:()=>paneRoom(e),cours:()=>paneCours(e),cartes:()=>paneCards(e),quiz:()=>runQuiz($('#pane'),itemsOf(e),{title:`Quiz · Étape ${e.n}`,color:'#'+e.color,shuffleQ:true,onEnd:()=>{}})}[tab]||(()=>paneRoom(e)))();
}
function paneRoom(e){const p=e.palace;let hidden=false;
 $('#pane').innerHTML=`<div class="room"><h2 style="margin:0 0 8px">${esc(p.room)}</h2>
 <div class="story">📖 <b>L'histoire à visualiser :</b> ${rt(p.story)}</div>
 <div class="row"><button class="btn alt" id="hd">🙈 Mode rappel actif (cacher les titres)</button><button class="btn alt" id="op">👁️ Tout ouvrir</button></div>
 <p class="mini">Astuce : ferme les yeux, imagine-toi marcher dans cette pièce et « touche » chaque objet. Chaque objet est lié à un fait précis.</p>
 <div class="anch">${p.anchors.map(a=>`<div class="an"><span class="e">${a[0]}</span><span class="l">${esc(a[1])}</span><div class="f">${rt(a[2])}</div></div>`).join('')}</div></div>`;
 document.querySelectorAll('.an').forEach((el,k)=>el.onclick=()=>{el.classList.toggle('open');if(el.classList.contains('open'))markPg(e.n,'p',k);});
 $('#hd').onclick=()=>{hidden=!hidden;document.querySelectorAll('.an').forEach(el=>el.classList.toggle('hid',hidden));$('#hd').textContent=hidden?'👀 Révéler les titres':'🙈 Mode rappel actif (cacher les titres)';addXp(2);};
 $('#op').onclick=()=>document.querySelectorAll('.an').forEach((el,k)=>{el.classList.add('open');markPg(e.n,'p',k);});
}
function paneCours(e){
 $('#pane').innerHTML=`<div class="row" style="margin:0 0 8px"><button class="btn alt" id="ao">📂 Tout ouvrir</button></div>`+e.blocks.map((b,i)=>`<div class="acc ${i===0?'open':''}"><button>${esc(b.h)}</button><div class="body">${b.items.map(it=>{
  if(typeof it==='string')return `<div class="pt">${rt(it)}</div>`;
  if(it.tl)return `<div class="tl">${it.tl.map(([d,t])=>`<div class="tle"><div class="d">${rt(d)}</div>${rt(t)}</div>`).join('')}</div>`;
  if(it.key)return `<div class="call key">⭐ <b>À retenir :</b> ${rt(it.key)}</div>`;
  if(it.tip)return `<div class="call tip">⚠️ <b>Piège :</b> ${rt(it.tip)}</div>`;return '';}).join('')}</div></div>`).join('');
 markPg(e.n,'c',0);document.querySelectorAll('.acc>button').forEach((b,k)=>b.onclick=()=>{b.parentElement.classList.toggle('open');if(b.parentElement.classList.contains('open'))markPg(e.n,'c',k);observe();});
 $('#ao').onclick=()=>{document.querySelectorAll('.acc').forEach((a,k)=>{a.classList.add('open');markPg(e.n,'c',k);});observe();addXp(5);};
 observe();
}
function paneCards(e){const list=flashOf(e);runCards($('#pane'),list,'#'+e.color);}
function runCards(root,list,color){let i=0,fl=false;list=shuffle(list);
 if(!list.length){root.innerHTML='<div class="card">Rien à réviser ici 🎉</div>';return;}
 const draw=()=>{const c=list[i];root.innerHTML=`<div style="--c:${c.color?'#'+String(c.color).replace('#',''):color}"><div class="prog"><i style="width:${i/list.length*100}%"></i></div><div class="mini" style="text-align:center">Carte ${i+1}/${list.length} · clique pour retourner</div>
  <div class="fc" id="fc"><div class="in"><div class="f"><div>${rt(c.front)}</div></div><div class="b"><div>${rt(c.back)}</div></div></div></div>
  <div class="row" style="justify-content:center"><button class="btn alt" id="no">😅 À revoir</button><button class="btn" id="yes">😎 Je savais</button></div></div>`;
  $('#fc').onclick=()=>$('#fc').classList.toggle('flip');
  const nx=ok=>{rec(c.id,ok);addXp(ok?3:1);i++;if(i>=list.length){root.innerHTML=`<div class="card" style="text-align:center"><div class="big">🎉</div><h2>Série terminée !</h2><button class="btn" onclick="go('etudes')">Retour à la route</button></div>`;confetti();setTimeout(()=>love('cards'),1200);}else draw();};
  $('#yes').onclick=()=>nx(true);$('#no').onclick=()=>nx(false);};
 draw();}
/* ---------- QUIZ ENGINE ---------- */
function runQuiz(root,items,opt){
 let list=opt.shuffleQ?shuffle(items):[...items];if(opt.limit)list=list.slice(0,opt.limit);
 let i=0,score=0,combo=0,wrong=[],t0=Date.now(),tm=null,left=opt.minutes?opt.minutes*60:0,done=false;
 const col=opt.color||'#f4b400';
 const fin=()=>{if(done)return;done=true;clearInterval(tm);const pct=Math.round(100*score/list.length);
  const msg=pct>=80?'🏆 Excellent, tu maîtrises !':pct>=60?'👍 Bien, relis les points ratés':'📚 Courage, retourne au palais mental';
  const key='best:'+opt.title;S.best[key]=Math.max(S.best[key]||0,pct);save();
  root.innerHTML=`<div class="qwrap" style="--c:${col}"><div class="card" style="text-align:center"><div class="big">${pct}%</div><h2>${score} / ${list.length}</h2><p>${msg}</p><p class="mini">Meilleur score : ${S.best[key]}%</p>
  <div class="row" style="justify-content:center"><button class="btn" id="again">🔁 Recommencer</button>${wrong.length?'<button class="btn alt" id="rw">❌ Refaire mes erreurs ('+wrong.length+')</button>':''}<button class="btn alt" onclick="go('etudes')">🏠 Accueil</button></div></div>
  ${wrong.length?`<h3>À revoir</h3>`+wrong.map(w=>`<div class="card" style="margin:8px 0"><b>${rt(w.q)}</b><br><span style="color:var(--ok)">✔ ${rt(w.right)}</span><br><span class="mini">${rt(w.e)}${w.p?' (cours p. '+w.p+')':''}</span></div>`).join(''):''}</div>`;
  $('#again').onclick=()=>runQuiz(root,items,opt);const rw=$('#rw');if(rw)rw.onclick=()=>runQuiz(root,wrong.map(w=>w.item),{...opt,title:opt.title+' (erreurs)',shuffleQ:true});
  if(pct>=80)confetti();addXp(score>=list.length?25:5);setTimeout(()=>love('quiz',pct),1100);if(opt.onEnd)opt.onEnd(pct);};
 const draw=()=>{const x=list[i];const tf=x.o===undefined;
  const opts=tf?[['Vrai',true],['Faux',false]]:shuffle(x.o.map((t,k)=>[t,k===x.a]));
  const ctx=x.ctx&&(i===0||list[i-1].ctx!==x.ctx)?`<div class="ctx"><b>📄 ${esc(x.ctxTitle||'Énoncé')}</b><br>${rt(x.ctx)}</div>`:(x.ctx?`<details class="ctx"><summary><b>📄 Revoir l'énoncé</b></summary>${rt(x.ctx)}</details>`:'');
  root.innerHTML=`<div class="qwrap" style="--c:${col}"><div class="row" style="margin:0;align-items:center"><b>${esc(opt.title)}</b><span class="sp"></span>${opt.minutes?`<span class="pill timer" id="tm"></span>`:''}<span class="pill">✅ ${score}</span><span class="pill">🔥 x${combo}</span></div>
   <div class="prog"><i style="width:${i/list.length*100}%"></i></div><div class="mini">Question ${i+1} / ${list.length}</div>${ctx}
   <div class="q">${rt(x.q)}</div><div id="os">${opts.map((o,k)=>`<button class="opt" data-k="${k}" style="animation-delay:${k*70}ms"><b class="l">${tf?(k?'✗':'✓'):'ABCD'[k]}</b><span>${rtn(o[0])}</span></button>`).join('')}</div><div id="fb"></div></div>`;
  if(opt.minutes)tick();
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const k=+b.dataset.k;const ok=opts[k][1]===true||(!tf&&opts[k][1]);const good=tf?(x.a===opts[k][1]):opts[k][1];
   document.querySelectorAll('.opt').forEach((bb,kk)=>{bb.classList.add('lock');const g=tf?(x.a===opts[kk][1]):opts[kk][1];if(g)bb.classList.add('good');});
   if(!good)b.classList.add('bad');
   const right=tf?(x.a?'Vrai':'Faux'):x.o[x.a];
   rec(x.id,good);if(good){score++;combo++;addXp(10+Math.min(combo,5));}else{combo=0;wrong.push({q:x.q,right,e:x.e,p:x.p,item:x});}
   $('#fb').innerHTML=`<div class="fb ${good?'ok':'ko'}"><b>${good?'✔ Bravo !':'✘ Pas tout à fait.'}</b> ${good?'':'Bonne réponse : <b>'+rt(right)+'</b>. '}<br>${rt(x.e)}${x.p?` <span class="mini">(cours p. ${x.p})</span>`:''}</div><div class="row"><button class="btn" id="nx">${i+1>=list.length?'🏁 Voir mon score':'Suivant ➜'}</button></div>`;
   $('#nx').onclick=()=>{i++;if(i>=list.length)fin();else draw();};$('#nx').focus();});};
 const tick=()=>{const f=()=>{const m=Math.floor(left/60),s=left%60;const el=$('#tm');if(el)el.textContent=`⏱ ${m}:${String(s).padStart(2,'0')}`;};f();clearInterval(tm);tm=setInterval(()=>{left--;f();if(left<=0)fin();},1000);};
 document.onkeydown=ev=>{const k={'1':0,'2':1,'3':2,'4':3,a:0,b:1,c:2,d:3}[ev.key.toLowerCase()];if(k!==undefined){const b=document.querySelectorAll('.opt')[k];if(b&&!b.classList.contains('lock'))b.click();}if(ev.key==='Enter'){const n=$('#nx');if(n)n.click();}};
 draw();}
/* ---------- EXAM ---------- */
function viewExam(){
 setApp(`<div class="banner" style="--c:#b71c1c"><h1>🏛️ QCM global · type examen du barreau</h1></div>
 <p>${rt(G.intro)}</p>
 <div class="row"><button class="btn" id="blanc">⏱️ Examen blanc (20 questions, 20 min)</button><button class="btn alt" id="mix">🧩 Série mixte (${G.mixed.length})</button><button class="btn alt" id="allc">⚖️ Tous les cas pratiques</button></div>
 <h2>⚖️ Cas pratiques</h2><div class="grid2">${G.cases.map((c,i)=>`<div class="card" style="cursor:pointer" onclick="startCase(${i})"><b>${esc(c.title)}</b><div class="mini">${esc(c.theme)} · ${c.qs.length} questions</div><div class="mini">Meilleur : ${S.best['best:'+c.title]??'–'}%</div></div>`).join('')}</div><div id="ex"></div>`);
 $('#blanc').onclick=()=>{$('#ex').scrollIntoView();runQuiz($('#ex'),shuffle(allQuestions()).slice(0,20),{title:'Examen blanc',color:'#b71c1c',minutes:20});};
 $('#mix').onclick=()=>{$('#ex').scrollIntoView();runQuiz($('#ex'),G.mixed.map((q,i)=>({...q,id:qid('gm',i)})),{title:'Série mixte',color:'#b71c1c',shuffleQ:true});};
 $('#allc').onclick=()=>{$('#ex').scrollIntoView();runQuiz($('#ex'),G.cases.flatMap((c,ci)=>c.qs.map((q,i)=>({...q,id:qid('gc'+ci,i),ctx:c.facts,ctxTitle:c.title}))),{title:'Tous les cas pratiques',color:'#b71c1c'});};
}
function startCase(ci){const c=G.cases[ci];setTimeout(()=>{$('#ex').scrollIntoView({behavior:'smooth'});},50);runQuiz($('#ex'),c.qs.map((q,i)=>({...q,id:qid('gc'+ci,i),ctx:c.facts,ctxTitle:c.title})),{title:c.title,color:'#b71c1c'});}
/* ---------- REVIEW ---------- */
function viewReview(){
 const qs=allQuestions().filter(x=>isDue(x.id)),fs=allFlash().filter(x=>isDue(x.id));
 const boxes=[1,2,3,4,5].map(b=>Object.values(S.items).filter(i=>i.box===b).length);
 setApp(`<div class="banner" style="--c:#2e7d32"><h1>🔁 Révision espacée</h1></div>
 <p>Méthode de <b>Leitner</b> : une bonne réponse fait monter la carte de boîte (rappel de plus en plus espacé : 1, 3, 7, 16 jours) ; une erreur la ramène en boîte 1.</p>
 <div class="grid2">${boxes.map((n,i)=>`<div class="card" style="text-align:center"><div class="big" style="font-size:2rem">${n}</div>Boîte ${i+1}</div>`).join('')}</div>
 <div class="row"><button class="btn" id="rq" ${qs.length?'':'disabled'}>🎯 Questions à réviser (${qs.length})</button><button class="btn alt" id="rf" ${fs.length?'':'disabled'}>🃏 Flashcards à réviser (${fs.length})</button></div>
 ${!qs.length&&!fs.length?'<p>🎉 Rien à réviser pour le moment. Fais d\'abord des quiz : tes erreurs reviendront ici.</p>':''}<div id="ex"></div>`);
 $('#rq').onclick=()=>runQuiz($('#ex'),qs,{title:'Révision espacée',color:'#2e7d32',shuffleQ:true});
 $('#rf').onclick=()=>runCards($('#ex'),fs,'#2e7d32');
}
/* ---------- SCIENCE ---------- */
function viewScience(){
 setApp(`<div class="banner" style="--c:#5e35b1"><h1>🔬 La science derrière cette appli</h1></div>
 <div class="grid2" style="margin-top:16px">
 <div class="card"><h3>🏛️ Méthode des lieux</h3>Tu associes chaque fait à un objet dans un lieu imaginé : le <b>palais mental</b> (pratiqué depuis l'Antiquité, utilisé par les champions de mémoire). Le cerveau retient mieux l'espace et les images que les listes abstraites.</div>
 <div class="card"><h3>🖼️ Double codage</h3>Un fait associé à <b>un mot + une image</b> est stocké de deux façons : plus de chemins pour le retrouver (théorie de Paivio).</div>
 <div class="card"><h3>🎯 Rappel actif</h3>Se tester est plus efficace que relire (« testing effect »). C'est pourquoi chaque pièce a un mode <b>cacher les titres</b> et pourquoi il y a autant de quiz.</div>
 <div class="card"><h3>⏳ Répétition espacée</h3>Revoir juste avant d'oublier (courbe de l'oubli d'Ebbinghaus). Les <b>boîtes de Leitner</b> automatisent cet espacement.</div>
 <div class="card"><h3>🔀 Pratique entremêlée</h3>L'examen blanc mélange les thèmes : tu t'entraînes à <b>choisir la bonne règle</b>, comme au barreau.</div>
 <div class="card"><h3>🧩 Découpage et récit</h3>Le cours est découpé en petits blocs (étapes, frises) et relié par une <b>histoire</b> : un récit est plus facile à retenir qu'une liste de dates.</div>
 <div class="card"><h3>🎮 Motivation</h3>XP, série de jours et confettis : un petit retour positif immédiat t'aide à revenir chaque jour.</div></div>
 <p class="mini">Conseil : 15 à 20 minutes par jour valent mieux qu'une longue session la veille.</p>`);
}
/* ---------- SEARCH ---------- */
function viewSearch(){
 setApp(`<div class="banner" style="--c:#455a64"><h1>🔎 Chercher dans le cours</h1></div><p><input class="srch" id="sq" placeholder="ex : Raddad, art. 622, CCD, 18 mois…" autofocus></p><div id="sr"></div>`);
 const idx=[];E.forEach(e=>e.blocks.forEach(b=>b.items.forEach(it=>{if(typeof it==='string')idx.push([e,b.h,it]);else if(it.tl)it.tl.forEach(t=>idx.push([e,b.h,t[0]+' : '+t[1]]));else if(it.key||it.tip)idx.push([e,b.h,it.key||it.tip]);})));
 const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 $('#sq').oninput=ev=>{const q=norm(ev.target.value.trim());if(q.length<2){$('#sr').innerHTML='';return;}
  const hit=idx.filter(x=>norm(x[2]).includes(q)).slice(0,40);
  $('#sr').innerHTML=hit.length?hit.map(([e,h,t])=>`<div class="card" style="margin:8px 0;--c:#${e.color}"><span class="chip" style="cursor:pointer" onclick="go('e/${e.n}/cours')">${e.emoji} Étape ${e.n} · ${esc(h)}</span><div>${rt(t).replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>')}</div></div>`).join(''):'<p>Aucun résultat.</p>';};
}

