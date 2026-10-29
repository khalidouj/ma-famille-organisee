/* ---------- CODE CIVIL ---------- */
const EMPTY={nodes:[],arts:[]};
const CODES={civil:{d:window.__CC__||EMPTY,name:'Code civil',color:'#6d4c41',pre:'',ready:false,idx:new Map(),
 chips:[['1240','1240 · responsabilité'],['1103','1103 · force obligatoire'],['2224','2224 · prescription'],['414-3','414-3 · trouble mental']],
 ph:'Un article (ex. 1240, 414-3, 2224) ou des mots (ex. responsabilité dommage)',
 note:'💡 Dans le cours, l\'ancien <b>art. 489-2</b> du code civil (réparation par celui qui a causé un dommage sous l\'empire d\'un trouble mental) correspond aujourd\'hui à l\'<b>art. 414-3</b>.'},
 penal:{d:window.__CP__||EMPTY,name:'Code pénal',color:'#8e2430',pre:'CP:',ready:false,idx:new Map(),
 chips:[['121-3','121-3 · élément moral'],['122-1','122-1 · discernement'],['221-1','221-1 · meurtre'],['221-3','221-3 · assassinat'],['311-1','311-1 · vol']],
 ph:'Un article (ex. 221-1, 122-1, R610-1) ou des mots (ex. meurtre préméditation)',
 note:'💡 Le Code pénal comprend la <b>partie législative</b> (articles numérotés 111-1…) et la <b>partie réglementaire</b> (articles R… et D…).'}};
let CUR='civil',CC=CODES.civil.d;
const nrm=s=>{let r='';for(let k=0;k<s.length;k++){r+=s[k].normalize('NFD')[0].toLowerCase()[0];}return r;};
let ccIdx=new Map();
function ccInit(){const c=CODES[CUR];CC=c.d;ccIdx=c.idx;if(c.ready)return;CC.arts.forEach((a,i)=>{a.push(nrm(a[2]+' § '+a[1].map(id=>CC.nodes[id][1]).join(' ')));ccIdx.set(a[0].toLowerCase(),i);});c.ready=true;}
function favKey(a){return CODES[CUR].pre+a[0];}
const LVL=['','Livre','Titre','Chapitre','Section','Sous-section','Paragraphe','Sous-paragraphe'];
function ccPaths(a){return a[1].map(i=>CC.nodes[i][1]);}
function ccArt(i,back){ccInit();const a=CC.arts[i];if(!a)return;const fav=(S.fav||[]).includes(favKey(a));
 $('#ccv').innerHTML=`<div class="card" style="margin:12px 0"><div class="row" style="margin:0 0 8px;align-items:center"><button class="btn alt" id="bk">⬅ Retour</button><span class="sp"></span><button class="btn alt" id="pv" ${i<1?'disabled':''}>◀</button><button class="btn alt" id="nx2" ${i>=CC.arts.length-1?'disabled':''}>▶</button><button class="btn alt" id="fv">${fav?'★ Favori':'☆ Favori'}</button><button class="btn alt" id="cp">📋 Copier</button></div>
 <div class="mini">${ccPaths(a).map(esc).join(' › ')}</div><h2 style="margin:.3em 0">Article ${esc(a[0])}</h2>${a[2].split('\n').map(p=>`<p>${esc(p)}</p>`).join('')}</div>`;
 $('#bk').onclick=back;$('#pv').onclick=()=>ccArt(i-1,back);$('#nx2').onclick=()=>ccArt(i+1,back);
 $('#fv').onclick=()=>{S.fav=S.fav||[];const fk=favKey(a),k=S.fav.indexOf(fk);if(k<0)S.fav.push(fk);else S.fav.splice(k,1);save();ccArt(i,back);};
 $('#cp').onclick=()=>{const t=`${CODES[CUR].name}, article ${a[0]}\n\n${a[2]}`;try{navigator.clipboard.writeText(t).then(()=>toast('Copié'),()=>toast('Copie impossible'));}catch(e){toast('Copie impossible');}};
 $('#ccv').scrollIntoView({behavior:'smooth',block:'start'});}
function toast(m,ms){const d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),ms||1500);}
function viewCode(w){CUR=w||'civil';ccInit();const C=CODES[CUR];
 setApp(`<div class="banner" style="--c:${C.color}"><h1>${CUR==='civil'?'📚':'⚖️'} ${C.name}</h1><div class="mini" style="color:#fff;opacity:.9">${esc(CC.src||'')} · ${CC.arts.length} articles</div></div>
 <div class="row" style="margin:0 0 8px"><button class="btn ${CUR==='civil'?'':'alt'}" onclick="go('code')">📚 Code civil</button><button class="btn ${CUR==='penal'?'':'alt'}" onclick="go('penal')">⚖️ Code pénal</button></div>
 <p><input class="srch" id="cq" placeholder="${C.ph}" autocomplete="off"></p>
 <div class="hint">${C.chips.map(c=>`<span class="chip" style="cursor:pointer" data-q="${c[0]}">${c[1]}</span>`).join('')}<span class="chip" style="cursor:pointer" id="favs">★ Mes favoris</span></div>
 <div class="call key">${C.note}</div>
 <div id="ccv"></div><div id="ccr"></div>`);
 const back=()=>{$('#ccv').innerHTML='';};
 const list=(idx,q)=>{$('#ccr').innerHTML=idx.length?idx.map(([i,sn])=>{const a=CC.arts[i];return `<div class="card" style="margin:8px 0;cursor:pointer" data-i="${i}"><b>Article ${esc(a[0])}</b> <span class="mini">${esc(ccPaths(a).slice(-1)[0]||'')}</span><div>${sn}</div></div>`;}).join(''):'<p>Aucun résultat.</p>';
  document.querySelectorAll('#ccr .card').forEach(c=>c.onclick=()=>ccArt(+c.dataset.i,back));};
 const run=raw=>{let q=raw.trim();if(!q){browse();return;}
  const m=nrm(q).replace(/^(art\.?|article)\s*/,'').replace(/\s*(du\s+)?(c\.?\s*(civ|pen)\.?|code (civil|penal))\s*$/,'').trim();
  if(/^[lrd]?\d+(-\d+)*(\s*(bis|ter|quater|[a-z]))?$/.test(m)){const key=m.replace(/\s+/g,' ');
   if(ccIdx.has(key)){ccArt(ccIdx.get(key),back);}else if(ccIdx.has(key.replace(' ','-'))){ccArt(ccIdx.get(key.replace(' ','-')),back);}
   const res=[];CC.arts.forEach((a,i)=>{if(a[0].toLowerCase().startsWith(key)&&a[0].toLowerCase()!==key&&res.length<40)res.push([i,esc(a[2].slice(0,140))+'…']);});list(res,q);return;}
  const toks=nrm(q).split(/\s+/).filter(t=>t.length>1).map(t=>t.length>4?t.replace(/(s|x)$/,''):t);if(!toks.length){list([],q);return;}
  const res=[];CC.arts.forEach((a,i)=>{const t=a[3];let sc=0;for(const k of toks){const p=t.indexOf(k);if(p<0)return;sc+=1+(t.split(k).length-1)*.5+(p<120?1:0);}res.push([i,sc]);});
  res.sort((x,y)=>y[1]-x[1]);
  const out=res.slice(0,50).map(([i])=>{const a=CC.arts[i];let q0=-1;for(const k of toks){const z=a[3].indexOf(k);if(z>=0&&z<a[2].length){q0=z;break;}}const p=q0<0?0:Math.max(0,q0-70);let sn=esc(a[2].slice(p,p+240));return [i,(p>0?'…':'')+sn+'…'];});
  list(out,q);$('#ccr').insertAdjacentHTML('afterbegin',`<div class="mini">${res.length} article(s) trouvé(s)${res.length>50?' (50 premiers)':''}</div>`);};
 const browse=()=>{const kids=new Map();// tree by first-level titles
  let h='<h2>Parcourir</h2>';let curL=-1,curT=-1;
  const byLivre=[];CC.arts.forEach((a,i)=>{const p=a[1];const liv=p.find(id=>CC.nodes[id][0]===1),tit=p.find(id=>CC.nodes[id][0]===2);const key=(liv??'p')+'|'+(tit??'p');if(!byLivre.length||byLivre[byLivre.length-1].key!==key)byLivre.push({key,liv,tit,from:i,to:i});else byLivre[byLivre.length-1].to=i;});
  let lastLiv='';
  byLivre.forEach(g=>{const L=g.liv!==undefined?CC.nodes[g.liv][1]:'';if(L!==lastLiv){h+=`<h3 style="margin:1.2em 0 .3em;color:${CODES[CUR].color}">${esc(L||'Préliminaire')}</h3>`;lastLiv=L;}
   h+=`<details class="acc" data-from="${g.from}" data-to="${g.to}"><summary style="padding:12px 16px;cursor:pointer;font-weight:700">${esc(g.tit!==undefined?CC.nodes[g.tit][1]:'Dispositions générales')} <span class="mini">· art. ${esc(CC.arts[g.from][0])} à ${esc(CC.arts[g.to][0])}</span></summary><div class="body" style="display:block;padding:0 16px 12px"></div></details>`;});
  $('#ccr').innerHTML=h;
  document.querySelectorAll('#ccr details').forEach(d=>d.addEventListener('toggle',()=>{if(!d.open||d.dataset.done)return;d.dataset.done=1;let o='';for(let i=+d.dataset.from;i<=+d.dataset.to;i++){const a=CC.arts[i];o+=`<div style="padding:6px 0;border-top:1px solid var(--line);cursor:pointer" data-i="${i}"><b>Art. ${esc(a[0])}</b> <span class="mini">${esc(a[2].slice(0,110))}…</span></div>`;}const b=d.querySelector('.body');b.innerHTML=o;b.querySelectorAll('[data-i]').forEach(x=>x.onclick=()=>ccArt(+x.dataset.i,back));}));};
 $('#cq').oninput=ev=>run(ev.target.value);
 document.querySelectorAll('.chip[data-q]').forEach(c=>c.onclick=()=>{$('#cq').value=c.dataset.q;run(c.dataset.q);});
 $('#favs').onclick=()=>{const f=S.fav||[];const pf=CODES[CUR].pre,mine=f.filter(n=>pf?n.startsWith(pf):!n.startsWith('CP:')).map(n=>n.slice(pf.length)).filter(n=>ccIdx.has(n.toLowerCase()));list(mine.map(n=>{const i=ccIdx.get(n.toLowerCase());return [i,esc(CC.arts[i][2].slice(0,140))+'…'];}),'');if(!mine.length)$('#ccr').innerHTML='<p>Aucun favori : ouvre un article et clique sur ☆.</p>';};
 browse();}
