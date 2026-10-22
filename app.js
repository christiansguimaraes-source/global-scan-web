const $=s=>document.getElementById(s);let pages=[],db;
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
const req=indexedDB.open('globalscan',1);req.onupgradeneeded=e=>e.target.result.createObjectStore('files',{keyPath:'id',autoIncrement:true});
req.onsuccess=e=>{db=e.target.result;list()};
const tx=m=>db.transaction('files',m).objectStore('files');
function list(){const out=[];tx('readonly').openCursor(null,'prev').onsuccess=e=>{const c=e.target.result;if(c){out.push(c.value);c.continue()}else render(out)}}
function render(fs){$('list').innerHTML=fs.length?'':'<div class="item"><small>Nenhum arquivo ainda.</small></div>';
 fs.forEach(f=>{const d=document.createElement('div');d.className='item';d.innerHTML=`<div>${f.name}<br><small>${new Date(f.date).toLocaleString('pt-BR')} · ${f.pages} pág.</small></div><span><button data-a="o">Abrir</button><button data-a="s">Compartilhar</button><button data-a="d">Excluir</button></span>`;
 d.onclick=ev=>{const a=ev.target.dataset.a;if(a==='o')window.open(URL.createObjectURL(f.blob));if(a==='s')share(f);if(a==='d'&&confirm('Excluir este arquivo?')){tx('readwrite').delete(f.id).onsuccess=list}};$('list').appendChild(d)})}
async function share(f){const file=new File([f.blob],f.name,{type:'application/pdf'});
 if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:f.name})}catch(e){}}
 else{const a=document.createElement('a');a.href=URL.createObjectURL(f.blob);a.download=f.name;a.click()}}
function loadImg(file){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=URL.createObjectURL(file)})}
// downscale to max 2000px for speed
function toCanvas(img,max=2000){const s=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=img.width*s|0;c.height=img.height*s|0;c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c}
let cur,pts,scale,drag=-1;
async function handle(files){for(const f of files){await editPage(toCanvas(await loadImg(f)))}}
$('cam').onchange=e=>{handle(e.target.files);e.target.value=''};$('gal').onchange=e=>{handle(e.target.files);e.target.value=''};
function detect(c){const w=c.width,h=c.height,def={topLeftCorner:{x:w*.05,y:h*.05},topRightCorner:{x:w*.95,y:h*.05},bottomRightCorner:{x:w*.95,y:h*.95},bottomLeftCorner:{x:w*.05,y:h*.95}};
 if(!window.cvReady)return def;try{const s=new jscanify(),m=cv.imread(c),ct=s.findPaperContour(m);if(!ct){m.delete();return def}const p=s.getCornerPoints(ct);m.delete();
 const area=Math.abs((p.topRightCorner.x-p.topLeftCorner.x)*(p.bottomLeftCorner.y-p.topLeftCorner.y));return (p.topLeftCorner&&area>w*h*.15)?p:def}catch(e){return def}}
let resolveEdit;
function editPage(c){return new Promise(res=>{resolveEdit=res;cur=c;$('edit').style.display='flex';const p=detect(c);
 pts=[p.topLeftCorner,p.topRightCorner,p.bottomRightCorner,p.bottomLeftCorner].map(o=>({x:o.x,y:o.y}));draw()})}
function draw(){const W=$('wrap').clientWidth,H=$('wrap').clientHeight;scale=Math.min(W/cur.width,H/cur.height);const cv_=$('cv');cv_.width=cur.width*scale;cv_.height=cur.height*scale;
 cv_.style.left=(W-cv_.width)/2+'px';cv_.style.top=(H-cv_.height)/2+'px';const g=cv_.getContext('2d');g.drawImage(cur,0,0,cv_.width,cv_.height);
 g.strokeStyle='#DBBA6A';g.lineWidth=3;g.beginPath();pts.forEach((p,i)=>g[i?'lineTo':'moveTo'](p.x*scale,p.y*scale));g.closePath();g.stroke();g.fillStyle='rgba(219,186,106,.15)';g.fill();
 pts.forEach(p=>{g.beginPath();g.arc(p.x*scale,p.y*scale,14,0,7);g.fillStyle='#DFBF72';g.fill()})}
const pos=e=>{const r=$('cv').getBoundingClientRect(),t=e.touches?e.touches[0]:e;return{x:(t.clientX-r.left)/scale,y:(t.clientY-r.top)/scale}};
['touchstart','mousedown'].forEach(ev=>$('cv').addEventListener(ev,e=>{const q=pos(e);drag=pts.findIndex(p=>Math.hypot(p.x-q.x,p.y-q.y)<40/scale)}));
['touchmove','mousemove'].forEach(ev=>$('cv').addEventListener(ev,e=>{if(drag<0)return;e.preventDefault();const q=pos(e);pts[drag]={x:Math.max(0,Math.min(cur.width,q.x)),y:Math.max(0,Math.min(cur.height,q.y))};draw()},{passive:false}));
['touchend','mouseup'].forEach(ev=>window.addEventListener(ev,()=>drag=-1));
$('cancel').onclick=()=>{$('edit').style.display='none';resolveEdit()};
$('ok').onclick=()=>{let out;const W=1240,H=1754;// A4 @150dpi
 if(window.cvReady){const s=new jscanify();out=s.extractPaper(cur,W,H,{topLeftCorner:pts[0],topRightCorner:pts[1],bottomRightCorner:pts[2],bottomLeftCorner:pts[3]})}
 else{out=document.createElement('canvas');out.width=W;out.height=H;out.getContext('2d').drawImage(cur,0,0,W,H)}
 pages.push(out.toDataURL('image/jpeg',.82));showPages();$('edit').style.display='none';resolveEdit()};
function showPages(){$('n').textContent=pages.length;$('pages').innerHTML='';pages.forEach((p,i)=>{const d=document.createElement('div');d.innerHTML=`<img src="${p}"><button>×</button>`;d.querySelector('button').onclick=()=>{pages.splice(i,1);showPages()};$('pages').appendChild(d)})}
$('mk').onclick=()=>{if(!pages.length)return alert('Digitalize ao menos uma página.');const{jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'mm',format:'a4'});
 pages.forEach((p,i)=>{if(i)pdf.addPage();pdf.addImage(p,'JPEG',0,0,210,297)});
 const d=new Date(),name=`Documento_${d.toISOString().slice(0,16).replace(/[-:T]/g,'')}.pdf`,f={name,date:+d,pages:pages.length,blob:pdf.output('blob')};
 tx('readwrite').add(f).onsuccess=ev=>{f.id=ev.target.result;pages=[];showPages();list();$('status').textContent='PDF salvo em Meus Arquivos';share(f)}};
