'use strict';
const $=s=>document.querySelector(s);const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
let cfg=JSON.parse(localStorage.getItem('gia_cfg')||'null');let mode='post';

/* ---------- Configuração ---------- */
function applyTheme(){if(!cfg)return;document.documentElement.style.setProperty('--c1',cfg.c1);document.documentElement.style.setProperty('--c2',cfg.c2);$('#hello').innerHTML=`Olá, <b>${esc(cfg.name)}</b>! O que vamos criar hoje?`;}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function show(id){['setup','home'].forEach(x=>$('#'+x).classList.toggle('hidden',x!==id))}
function openSetup(){const c=cfg||{};$('#cName').value=c.name||'';$('#cRamo').value=c.ramo||'';$('#c1').value=c.c1||'#0B3D91';$('#c2').value=c.c2||'#F5A623';$('#cTom').value=c.tom||'Vendedor';$('#cApi').value=c.api||'';if(c.logo){$('#logoPrev').src=c.logo;$('#logoPrev').classList.remove('hidden')}show('setup')}
$('#cLogo').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const m=400,s=Math.min(1,m/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=img.width*s;c.height=img.height*s;c.getContext('2d').drawImage(img,0,0,c.width,c.height);$('#logoPrev').src=c.toDataURL('image/png');$('#logoPrev').classList.remove('hidden')};img.src=r.result};r.readAsDataURL(f)};
$('#saveCfg').onclick=()=>{const name=$('#cName').value.trim(),ramo=$('#cRamo').value.trim();if(!name||!ramo){alert('Preencha o nome da empresa e o ramo.');return}
cfg={name,ramo,c1:$('#c1').value,c2:$('#c2').value,tom:$('#cTom').value,api:$('#cApi').value.trim(),logo:$('#logoPrev').classList.contains('hidden')?'':$('#logoPrev').src};
localStorage.setItem('gia_cfg',JSON.stringify(cfg));applyTheme();show('home')};
$('#btnCfg').onclick=openSetup;
document.querySelectorAll('.card').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll('.card').forEach(x=>x.classList.toggle('on',x===b));$('#req').focus()});
document.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{$('#req').value=b.textContent});

/* ---------- Motor de texto (local) ---------- */
const THEMES={
 promocao:{re:/promo|desconto|oferta|liquida|queima|barat|%|black/i,tag:['promoção','oferta','desconto','imperdível'],head:['Promoção imperdível','Oferta especial','Preço que dá gosto','Descontos de verdade','Aproveite já']},
 sexta:{re:/sexta|sextou|fim de semana|fds|sábado|sabado|domingo|final de semana/i,tag:['sextou','fimdesemana','sexta'],head:['Sextou!','Sextou com tudo','Fim de semana chegou','Bora curtir a sexta']},
 lancamento:{re:/lan[cç]a|novidade|novo|nova|chegou|estreia|inaugura/i,tag:['lançamento','novidade','chegounovidade'],head:['Chegou novidade','Lançamento','É novo, é nosso','Novidade quentinha']},
 dica:{re:/dica|tutorial|como |aprenda|sabia|curiosidade|explica/i,tag:['dica','ficaadica','vocêsabia'],head:['Fica a dica','Você sabia?','Dica de ouro','Anota essa dica']},
 data:{re:/natal|ano novo|páscoa|pascoa|m[aã]es|pais|namorados|crian[cç]a|black friday|carnaval|consumidor|mulher|anivers/i,tag:['datacomemorativa','celebrar'],head:['Data especial','Vamos celebrar','Um dia para comemorar']},
 depoimento:{re:/depoimento|cliente|avalia|feedback/i,tag:['clientesatisfeito','depoimento'],head:['Quem prova, aprova','Nossos clientes falam']}
};
const DATES={natal:'Natal','ano novo':'Ano Novo','páscoa':'Páscoa',pascoa:'Páscoa','mães':'Dia das Mães','maes':'Dia das Mães',pais:'Dia dos Pais',namorados:'Dia dos Namorados','criança':'Dia das Crianças','crianca':'Dia das Crianças','black friday':'Black Friday',carnaval:'Carnaval',consumidor:'Dia do Consumidor',mulher:'Dia da Mulher',anivers:'Aniversário'};
function analyze(req){const t=[];for(const k in THEMES)if(THEMES[k].re.test(req))t.push(k);if(!t.length)t.push('geral');let date='';const low=req.toLowerCase();for(const k in DATES)if(low.includes(k)){date=DATES[k];break}
 const pct=(req.match(/(\d{1,2})\s*%/)||[])[1];return{themes:t,date,pct}}
const TONE={
 'Sério':{open:['Prezado cliente,','Comunicado importante:','Informamos com satisfação:','Para você que valoriza qualidade:'],cta:['Saiba mais em nossos canais de atendimento.','Entre em contato e conheça.','Visite-nos.','Estamos à disposição.'],emo:['','','✔️','📌'],adj:['qualidade','confiança','excelência','compromisso']},
 'Descontraído':{open:['Ei, você aí! 👀','Bora? 😄','Olha só que delícia de notícia 😍','Pausa pra uma novidade boa 🙌'],cta:['Chama os amigos e cola com a gente! 🥳','Marca aqui quem precisa ver isso 👇','Vem que vem! ✌️','Te esperamos, viu? 😉'],emo:['😄','🙌','✨','🥳','😍'],adj:['carinho','alegria','bom humor','sabor']},
 'Vendedor':{open:['🔥 ATENÇÃO!','🚨 É agora ou nunca!','💥 Oportunidade única!','⚡ Corre que é por tempo limitado!'],cta:['Garanta já o seu! 🛒','Chama no WhatsApp e reserve agora! 📲','Estoque limitado — não fique de fora! ⏳','Clique no link da bio e aproveite! 👉'],emo:['🔥','💥','🤑','⚡','🛒'],adj:['o melhor preço','vantagem','economia','valor imperdível']}
};
function bodyFor(th,c,a){const r=c.ramo,n=c.name;const P={
 promocao:[`${n} preparou ${a.pct?a.pct+'% de desconto':'preços especiais'} para você aproveitar o melhor de ${r}.`,`Tem promoção rolando na ${n}! ${a.pct?'Até '+a.pct+'% OFF':'Condições especiais'} em itens selecionados.`,`Quem acompanha a ${n} sai ganhando: oferta especial em ${r} só por tempo limitado.`],
 sexta:['A sexta-feira pede algo especial','Sextou e o fim de semana começa aqui','Nada melhor que fechar a semana bem'],
 lancamento:[`Acabou de chegar novidade na ${n}!`,`Apresentamos o mais novo lançamento da ${n}.`,`Novidade fresquinha no nosso ${r}.`],
 dica:[`Dica da ${n} para você que gosta de ${r}:`,`Separamos uma dica rápida do mundo de ${r}:`,`Quem entende de ${r} sabe: esta dica faz diferença.`],
 data:[`${a.date||'Esta data especial'} é na ${n}!`,`Celebre ${a.date||'essa data'} com a ${n}.`,`Para ${a.date||'essa ocasião'}, a ${n} preparou algo especial.`],
 depoimento:[`Nada nos deixa mais felizes que clientes satisfeitos com a ${n}.`,`Olha o que estão falando da ${n}:`],
 geral:[`Na ${n}, ${r} é feito com dedicação.`,`A ${n} está pronta para atender você.`,`Conheça o melhor de ${r} na ${n}.`]};return pick(P[th]||P.geral)}
function ideasFor(a,c){const r=c.ramo,n=c.name,pool=[];const has=t=>a.themes.includes(t);
 if(has('promocao'))pool.push(`Carrossel "Antes x Depois do preço" com 3 produtos de ${r} em oferta`,`Reels de 15s com contagem regressiva para o fim da promoção`,`Story com enquete: "Qual produto deveria entrar na promoção?"`,`Combo do dia: monte um kit de ${r} com preço fechado`,`Cupom exclusivo para quem mandar DM com a palavra "${n.split(' ')[0].toUpperCase()}"`);
 if(has('sexta'))pool.push(`Vídeo "Sexta na ${n}": bastidores do dia mais movimentado`,`Story "Sextou" com sticker de contagem até o happy hour`,`Post "Plano perfeito para o fim de semana" com produtos de ${r}`,`Sorteio relâmpago de sexta: comente e marque 2 amigos`);
 if(has('lancamento'))pool.push(`Teaser em 3 stories revelando a novidade aos poucos`,`Reels de unboxing / apresentação do lançamento`,`Post com os 3 diferenciais do novo produto`);
 if(has('dica'))pool.push(`Carrossel "5 dicas de ${r} que ninguém te conta"`,`Reels curto respondendo a dúvida mais comum dos clientes`,`Story com quiz "Verdade ou mito?" sobre ${r}`);
 if(has('data'))pool.push(`Post temático de ${a.date||'data comemorativa'} com sugestão de presente`,`Story com caixinha de mensagens para homenagens`,`Kit especial de ${a.date||'data comemorativa'} com embalagem personalizada`);
 if(has('depoimento'))pool.push(`Print de avaliação de cliente com a arte da marca`,`Reels com cliente real contando a experiência`);
 pool.push(`Foto caprichada do produto mais vendido da ${n} com fundo nas cores da marca`,`Bastidores: mostre a equipe preparando os produtos de ${r}`,`Post "Você sabia?" com uma curiosidade sobre ${r}`,`Story de perguntas: "O que você quer ver aqui?"`,`Depoimento de cliente fiel da ${n}`);
 return shuffle([...new Set(pool)]).slice(0,3)}
function hashtagsFor(a,c){const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]/g,'').toLowerCase();const t=new Set([slug(c.name),slug(c.ramo)]);
 a.themes.forEach(k=>(THEMES[k]?THEMES[k].tag:[]).forEach(x=>t.add(slug(x))));if(a.date)t.add(slug(a.date));
 shuffle([slug(c.ramo)+'sp','saopaulo','comerciolocal','apoieolocal','instabusiness','qualidade','empreendedorismo',slug(c.ramo)+'delicia','novidade','instagood']).slice(0,5).forEach(x=>t.add(x));return [...t].filter(Boolean).slice(0,12).map(x=>'#'+x)}
function headlineFor(req,a){const th=a.themes.find(t=>THEMES[t]);let h=th?pick(THEMES[th].head):'';
 if(a.themes.includes('promocao')&&a.themes.includes('sexta'))h=pick(['Sexta de ofertas','Sextou com desconto','Promoção de sexta','Sexta imperdível']);
 if(a.date)h=pick([a.date+' especial','Feliz '+a.date,'Ofertas de '+a.date]);
 if(!h){h=req.replace(/^(faz|faça|fazer|cria|crie|gera|gere)\s+(um|uma)?\s*(post|arte|banner|imagem)?\s*(de|sobre|para)?\s*/i,'').trim();h=h.charAt(0).toUpperCase()+h.slice(1)}
 return(h||'Novidade para você').slice(0,48)}
function localGenerate(req,c){const a=analyze(req),T=TONE[c.tom]||TONE.Vendedor;
 const body=a.themes.map(t=>bodyFor(t,c,a)).join(' ').replace(/\s+/g,' ');
 const mid=pick([`Aqui você encontra ${pick(T.adj)} em cada detalhe.`,`Tudo com o ${pick(T.adj)} que você já conhece.`,`Feito pensando em você, com ${pick(T.adj)}.`]);
 const caption=`${pick(T.open)}\n\n${body}${/[.!?:]$/.test(body)?'':'!'} ${pick(T.emo)}\n${mid}\n\n${pick(T.cta)}\n📍 ${c.name}`;
 const head=headlineFor(req,a);
 const sub=a.pct?`Até ${a.pct}% OFF`:pick(a.themes.includes('promocao')?['Só por tempo limitado','Condições especiais','Aproveite hoje']:a.themes.includes('dica')?['Confira no nosso perfil','Salve para não esquecer']:['Venha conferir','Esperamos você','Só na '+c.name]);
 return{caption,ideas:ideasFor(a,c),hashtags:hashtagsFor(a,c),headline:head,sub,themes:a.themes}}
/** Ponto único de geração. TODO: quando houver uma API de IA, usar cfg.api (POST {pedido, empresa}) e retornar o mesmo formato {caption, ideas[], hashtags[], headline, sub}. Por padrão usa o motor local. */
async function generate(req,c){
 // TODO: integrar IA real aqui, ex.: if(c.api){const r=await fetch(c.api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pedido:req,empresa:c})});return await r.json()}
 return localGenerate(req,c)}

/* ---------- Motor de imagem (canvas) ---------- */
const STYLES=['Gradiente','Diagonal','Moldura','Círculos','Faixa'];
function hexA(h,a){const n=parseInt(h.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
function lum(h){const n=parseInt(h.slice(1),16);return(0.299*(n>>16&255)+0.587*(n>>8&255)+0.114*(n&255))/255}
function wrap(ctx,text,maxW){const w=text.split(' '),L=[];let l='';for(const x of w){const t=l?l+' '+x:x;if(ctx.measureText(t).width>maxW&&l){L.push(l);l=x}else l=t}L.push(l);return L}
function loadImg(src){return new Promise(r=>{if(!src)return r(null);const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
async function drawArt(cv,c,g,style,story){const W=1080,H=story?1920:1080;cv.width=W;cv.height=H;const x=cv.getContext('2d'),c1=c.c1,c2=c.c2;
 const gr=x.createLinearGradient(0,0,W,H);gr.addColorStop(0,c1);gr.addColorStop(1,c2);x.fillStyle=gr;x.fillRect(0,0,W,H);
 let txt=lum(c1)>0.6?'#1d2433':'#ffffff',panel=null;
 if(style==='Diagonal'){x.fillStyle=c1;x.beginPath();x.moveTo(0,0);x.lineTo(W,0);x.lineTo(W,H*.55);x.lineTo(0,H*.75);x.fill();x.fillStyle=hexA('#ffffff',.12);x.beginPath();x.moveTo(0,H*.8);x.lineTo(W,H*.6);x.lineTo(W,H*.66);x.lineTo(0,H*.86);x.fill()}
 if(style==='Moldura'){x.fillStyle='#ffffff';x.fillRect(60,60,W-120,H-120);x.strokeStyle=c2;x.lineWidth=18;x.strokeRect(90,90,W-180,H-180);txt=c1}
 if(style==='Círculos'){x.fillStyle=c1;x.fillRect(0,0,W,H);[[.85,.12,.35],[.1,.9,.4],[.95,.85,.18],[.15,.2,.12]].forEach(([a,b,r],i)=>{x.fillStyle=hexA(i%2?'#ffffff':c2,i%2?.12:.85);x.beginPath();x.arc(W*a,H*b,W*r,0,7);x.fill()});txt=lum(c1)>0.6?'#1d2433':'#fff'}
 if(style==='Faixa'){x.fillStyle=c1;x.fillRect(0,0,W,H);for(let i=-H;i<W;i+=70){x.fillStyle=hexA('#ffffff',.05);x.beginPath();x.moveTo(i,0);x.lineTo(i+35,0);x.lineTo(i+35+H,H);x.lineTo(i+H,H);x.fill()}panel=[0,H*.32,W,H*.36];x.fillStyle=c2;x.fillRect(...panel);txt=lum(c2)>0.6?'#1d2433':'#fff'}
 if(style==='Gradiente'){const rg=x.createRadialGradient(W*.3,H*.25,10,W*.3,H*.25,W);rg.addColorStop(0,hexA('#ffffff',.25));rg.addColorStop(1,hexA('#000000',.15));x.fillStyle=rg;x.fillRect(0,0,W,H)}
 const logo=await loadImg(c.logo);const top=story?220:120;
 if(logo){const s=Math.min(260/logo.width,(story?200:150)/logo.height);const lw=logo.width*s,lh=logo.height*s;x.fillStyle=hexA('#ffffff',.92);x.beginPath();x.roundRect((W-lw)/2-24,top-24,lw+48,lh+48,24);x.fill();x.drawImage(logo,(W-lw)/2,top,lw,lh)}
 else{x.font='700 44px system-ui,sans-serif';x.fillStyle=txt;x.textAlign='center';x.fillText(c.name.toUpperCase(),W/2,top+60)}
 x.textAlign='center';x.fillStyle=txt;x.shadowColor=style==='Moldura'?'transparent':'rgba(0,0,0,.25)';x.shadowBlur=12;
 let fs=story?150:130;x.font=`900 ${fs}px system-ui,sans-serif`;let lines=wrap(x,g.headline.toUpperCase(),W-180);while(lines.length>3&&fs>70){fs-=10;x.font=`900 ${fs}px system-ui,sans-serif`;lines=wrap(x,g.headline.toUpperCase(),W-180)}
 const cy=H*(story?.45:.5)-(lines.length*fs*1.05)/2+fs*.8;lines.forEach((l,i)=>x.fillText(l,W/2,cy+i*fs*1.05));x.shadowBlur=0;
 const sy=cy+lines.length*fs*1.05+30;x.font='700 52px system-ui,sans-serif';const sw=x.measureText(g.sub).width+80;
 x.fillStyle=style==='Faixa'?c1:(style==='Moldura'?c2:'#ffffff');x.beginPath();x.roundRect((W-sw)/2,sy,sw,90,45);x.fill();
 x.fillStyle=style==='Faixa'?'#fff':(style==='Moldura'?(lum(c2)>.6?'#1d2433':'#fff'):c1);x.fillText(g.sub,W/2,sy+63);
 x.font='600 40px system-ui,sans-serif';x.fillStyle=txt;x.fillText(logo?c.name:c.ramo.charAt(0).toUpperCase()+c.ramo.slice(1),W/2,H-(story?220:130));
 x.font='500 30px system-ui,sans-serif';x.globalAlpha=.8;x.fillText((g.hashtags||[]).slice(0,3).join('  '),W/2,H-(story?160:80));x.globalAlpha=1}

/* ---------- UI de resultados ---------- */
function postHTML(g){return`<div class="box"><h3>✍️ Legenda</h3><div class="cap" id="capTxt">${esc(g.caption)}\n\n${esc(g.hashtags.join(' '))}</div>
<div class="row"><button class="primary mini" id="cpy">📋 Copiar legenda</button><button class="primary mini alt" id="again">🔄 Gerar outra</button></div>
<h3>💡 3 ideias de post</h3><ol>${g.ideas.map(i=>`<li>${esc(i)}</li>`).join('')}</ol><h3>#️⃣ Hashtags</h3><p class="tags">${esc(g.hashtags.join(' '))}</p></div>`}
function imgHTML(){return`<div class="box"><h3>🎨 Arte</h3><div class="row"><label>Formato<select id="fmt"><option value="feed">Feed 1080×1080</option><option value="story">Story 1080×1920</option></select></label><label>Estilo<select id="sty">${STYLES.map(s=>`<option>${s}</option>`).join('')}</select></label></div>
<label>Título da arte<input id="hl"></label><canvas id="cv"></canvas><div class="row wrap"><button class="primary mini" id="dl">⬇️ Baixar PNG</button><button class="primary mini alt" id="sh">📤 Compartilhar</button><button class="primary mini" id="nx">🎲 Outro estilo</button></div></div>`}
let last=null;
async function run(kind){const req=$('#req').value.trim()||'post para o perfil';const g=await generate(req,cfg);last={g,req};
 let h='';if(kind!=='img')h+=postHTML(g);if(kind!=='post')h+=imgHTML();$('#out').innerHTML=h;
 if(kind!=='img'){$('#cpy').onclick=()=>navigator.clipboard?.writeText($('#capTxt').textContent).then(()=>alert('Legenda copiada!'));$('#again').onclick=()=>run(kind)}
 if(kind!=='post'){$('#hl').value=g.headline;$('#sty').value=pick(STYLES);const redraw=()=>{g.headline=$('#hl').value||g.headline;return drawArt($('#cv'),cfg,g,$('#sty').value,$('#fmt').value==='story')};
  ['fmt','sty'].forEach(i=>$('#'+i).onchange=redraw);$('#hl').oninput=redraw;$('#nx').onclick=()=>{const i=STYLES.indexOf($('#sty').value);$('#sty').value=STYLES[(i+1)%STYLES.length];redraw()};
  $('#dl').onclick=()=>{const a=document.createElement('a');a.download=`global-ia-${$('#fmt').value}.png`;a.href=$('#cv').toDataURL('image/png');a.click()};
  $('#sh').onclick=()=>$('#cv').toBlob(async b=>{const text=g.caption+'\n\n'+g.hashtags.join(' ');const f=new File([b],'post.png',{type:'image/png'});
   try{if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],text,title:cfg.name});else if(navigator.share)await navigator.share({text,title:cfg.name});else{await navigator.clipboard?.writeText(text);alert('Compartilhamento não suportado neste navegador. Legenda copiada; baixe a imagem.')}}catch(e){}});
  await redraw()}
 $('#out').scrollIntoView({behavior:'smooth'})}
$('#goPost').onclick=()=>run('post');$('#goImg').onclick=()=>run('img');$('#goFull').onclick=()=>run('full');
$('#req').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();run(mode==='img'?'img':'post')}});
if(cfg){applyTheme();show('home')}else openSetup();
if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js');
