import {buildShelfLayouts, capacityLabel, expandCatalogShard, fitForShelf, lengthLabel, searchRecords, standardFitTags, toMm, weightLabel} from './src/catalog.js';

const $=id=>document.getElementById(id);
const PAGE_SIZE=60;
const els={
  query:$('query'),shelfWidth:$('shelfWidth'),shelfDepth:$('shelfDepth'),shelfHeight:$('shelfHeight'),
  dimensionMode:$('dimensionMode'),dimensionLegend:$('dimensionLegend'),fitHelp:$('fitHelp'),fitOnlyText:$('fitOnlyText'),allowTippingText:$('allowTippingText'),
  fitOnly:$('fitOnly'),allowTipping:$('allowTipping'),brand:$('brandFilter'),standard:$('standardFilter'),lidded:$('lidded'),
  transparent:$('transparent'),wheels:$('wheels'),clear:$('clear'),sortMode:$('sortMode'),
  results:$('results'),resultCount:$('resultCount'),fitHint:$('fitHint'),showMore:$('showMore'),
  shelfIdeas:$('shelfIdeas'),shelfPlanList:$('shelfPlanList'),unitToggle:$('unitToggle'),cardTemplate:$('cardTemplate'),
  dialog:$('previewDialog'),closePreview:$('closePreview'),previewEyebrow:$('previewEyebrow'),previewTitle:$('previewTitle'),
  previewImage:$('previewImage'),previewChips:$('previewChips'),previewSpecs:$('previewSpecs'),previewFit:$('previewFit'),
  previewNotes:$('previewNotes'),previewPurchase:$('previewPurchase'),previewSellers:$('previewSellers'),previewSource:$('previewSource')
};
const storage={get(key){try{return localStorage.getItem(key)}catch{return null}},set(key,value){try{localStorage.setItem(key,value)}catch{}}};
let unit=storage.get('containerhub-unit')||'imperial';
let records=[];
let currentPreview=null;
let visibleLimit=PAGE_SIZE;
let planJob=0;

function dimensionMode(){return els.dimensionMode.value==='internal'?'internal':'external'}

function shelfFromInputs(){
  const raw={width:Number(els.shelfWidth.value),depth:Number(els.shelfDepth.value),height:Number(els.shelfHeight.value)};
  if(!Object.values(raw).every(v=>Number.isFinite(v)&&v>0)) return null;
  return Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,toMm(v,unit)]));
}

function formatDims(d){
  if(!d) return 'unknown';
  return `${lengthLabel(d.length,unit)} × ${lengthLabel(d.width,unit)} × ${lengthLabel(d.height,unit)}`;
}

function addSpec(dl,label,value){
  const dt=document.createElement('dt');dt.textContent=label;
  const dd=document.createElement('dd');dd.textContent=value??'unknown';
  dl.append(dt,dd);
}

function renderSpecs(dl,r){
  dl.replaceChildren();
  addSpec(dl,'External',formatDims(r.external_mm));
  addSpec(dl,'Internal',formatDims(r.internal_mm));
  addSpec(dl,'Capacity',capacityLabel(r.capacity_ml,unit));
  addSpec(dl,'Empty weight',weightLabel(r.empty_weight_g,unit));
  addSpec(dl,'Closure',r.closure);
}

function renderChips(container,r){
  container.replaceChildren();
  [r.category,r.translucency,r.material?.split(';')[0]].filter(Boolean).forEach(text=>{
    const chip=document.createElement('span');chip.className='chip';chip.textContent=text;container.append(chip);
  });
  standardFitTags(r).forEach(tag=>{
    const chip=document.createElement('span');chip.className='chip standard-chip';chip.textContent=`✓ ${tag.label}`;
    chip.title=tag.kind==='hanging'?`${tag.detail}. Based on published internal dimensions; hanging rails/support are not verified.`:`Fits a ${tag.detail} flat, based on published internal dimensions.`;
    container.append(chip);
  });
}

function clearanceText(fit){
  if(!fit) return '';
  const internal=fit.dimensionMode==='internal';
  if(fit.fits){
    const c=fit.clearance_mm;
    const prefix=internal?'extra room':'clearance';
    return `${prefix} W ${lengthLabel(c.width,unit)} · D ${lengthLabel(c.depth,unit)} · H ${lengthLabel(c.height,unit)}`;
  }
  const labels=internal?{width:'more width',depth:'more depth',height:'more height'}:{width:'wide',depth:'deep',height:'tall'};
  const over=Object.entries(fit.oversize_mm||{}).filter(([,value])=>value>0.01);
  if(!over.length) return internal?'inside space is too small':'does not fit';
  return internal
    ? `needs ${over.map(([axis,value])=>`${lengthLabel(value,unit)} ${labels[axis]}`).join(' · ')}`
    : `too ${over.map(([axis,value])=>`${lengthLabel(value,unit)} ${labels[axis]}`).join(' · ')}`;
}

function renderFit(fitBox,r,fit){
  const mode=dimensionMode();
  const geometry=mode==='internal'?r.internal_mm:r.external_mm;
  fitBox.classList.remove('good','bad');fitBox.replaceChildren();
  const primary=document.createElement('div');primary.className='fit-primary';
  const secondary=document.createElement('div');secondary.className='fit-secondary';
  if(!geometry){
    primary.textContent=mode==='internal'?'Internal dimensions unavailable':'External dimensions unavailable';
    secondary.textContent='Excluded from this geometric ranking.';
  }else if(fit){
    if(fit.fits){
      fitBox.classList.add('good');
      if(mode==='internal'){
        primary.textContent=`${Math.round(fit.sizeScore)}% inside match · Holds target`;
        secondary.textContent=clearanceText(fit);
      }else{
        primary.textContent=`${Math.round(fit.sizeScore)}% size match · Fits ${fit.count} per shelf`;
        const layerNote=fit.stacking==='verified'&&fit.high>1?` · ${fit.high} verified stack layers`:'';
        secondary.textContent=`${clearanceText(fit)} · ${Math.round(fit.footprintUtilization*100)}% one-layer footprint use${layerNote}`;
      }
    }else{
      fitBox.classList.add('bad');
      primary.textContent=mode==='internal'?'Inside too small':'Near miss';
      secondary.textContent=clearanceText(fit);
    }
  }else{
    primary.textContent=mode==='internal'?'Enter the minimum inside size you need':'Enter a shelf or space size';
    secondary.textContent=mode==='internal'?'Results will rank by the closest usable interior.':'Results will rank by dimensional closeness.';
  }
  fitBox.append(primary,secondary);
}

function renderNotes(container,r){
  container.replaceChildren();
  [...(r.notes||[]),`Verified ${r.verified_at} from ${r.source_site}.`].forEach(text=>{
    const li=document.createElement('li');li.textContent=text;container.append(li);
  });
}

function purchaseOptions(r){
  const options=[{retailer:r.purchase_site,url:r.purchase_url},...(r.offers||[])];
  const seen=new Set();
  return options.filter(option=>{if(!option?.url||seen.has(option.url)) return false;seen.add(option.url);return true});
}

function configurePrimaryPurchase(link,option){
  if(!option){link.hidden=true;link.removeAttribute('href');return}
  link.hidden=false;link.href=option.url;link.textContent=`Buy at ${option.retailer}`;
}

function renderSellerLinks(container,options){
  container.replaceChildren();
  options.slice(1).forEach(option=>{
    const a=document.createElement('a');a.className='seller-link';a.href=option.url;a.target='_blank';a.rel='noopener noreferrer';
    a.textContent=`Buy at ${option.retailer}${option.channel?` via ${option.channel}`:''}`;container.append(a);
  });
}

function renderCard(item,index){
  const {record:r,fit}=item;
  const node=els.cardTemplate.content.firstElementChild.cloneNode(true);node.dataset.productId=r.id;
  const img=node.querySelector('.thumb');img.src=r.image;img.alt=`${r.brand} ${r.name} dimensional schematic`;
  node.querySelector('.rank').textContent=String(index+1);node.querySelector('.eyebrow').textContent=[r.brand,r.model].filter(Boolean).join(' · ');node.querySelector('h2').textContent=r.name;
  renderChips(node.querySelector('.chips'),r);renderSpecs(node.querySelector('.specs'),r);renderFit(node.querySelector('.fit-result'),r,fit);renderNotes(node.querySelector('.notes'),r);
  node.querySelector('.source-link').href=r.source_url;
  const options=purchaseOptions(r);configurePrimaryPurchase(node.querySelector('.purchase-link'),options[0]);renderSellerLinks(node.querySelector('.seller-links'),options);
  node.querySelector('.preview-button').addEventListener('click',()=>openPreview(r,fit));return node;
}

function fillPreview(r,fit){
  els.previewEyebrow.textContent=[r.brand,r.model].filter(Boolean).join(' · ');els.previewTitle.textContent=r.name;
  els.previewImage.src=r.image;els.previewImage.alt=`${r.brand} ${r.name} dimensional schematic`;
  renderChips(els.previewChips,r);renderSpecs(els.previewSpecs,r);renderFit(els.previewFit,r,fit);renderNotes(els.previewNotes,r);
  const options=purchaseOptions(r);configurePrimaryPurchase(els.previewPurchase,options[0]);renderSellerLinks(els.previewSellers,options);els.previewSource.href=r.source_url;
}

function openPreview(r,fit){currentPreview={record:r,fit};fillPreview(r,fit);els.dialog.showModal()}
function closePreview(){currentPreview=null;els.dialog.close()}

function planProductButton(item,fitById){
  const button=document.createElement('button');button.type='button';button.className='plan-product';button.textContent=`${item.count}× ${item.record.brand} ${item.record.name}`;
  button.addEventListener('click',()=>openPreview(item.record,fitById.get(item.record.id)||null));return button;
}

function renderPlan(plan,shelf,index,fitById){
  const card=document.createElement('article');card.className='plan-card';
  const head=document.createElement('div');head.className='plan-head';const title=document.createElement('h3');title.textContent=plan.title;
  const metric=document.createElement('strong');metric.textContent=`${Math.round(plan.utilization*100)}% footprint`;head.append(title,metric);
  const stats=document.createElement('p');stats.className='plan-stats';stats.textContent=`${plan.totalCount} containers · ${plan.skuCount} size${plan.skuCount===1?'':'s'} · ${lengthLabel(plan.remainingDepth,unit)} depth left`;
  const map=document.createElement('div');map.className='shelf-map';map.setAttribute('role','img');map.setAttribute('aria-label',`${plan.title}: top-down shelf arrangement using ${plan.totalCount} containers`);map.style.aspectRatio=`${shelf.width}/${shelf.depth}`;
  const colorById=new Map(plan.products.map((item,i)=>[item.record.id,i%6]));
  for(const placement of plan.placements){
    const piece=document.createElement('span');piece.className=`plan-piece tone-${colorById.get(placement.productId)}`;
    piece.style.left=`${placement.x/shelf.width*100}%`;piece.style.top=`${placement.y/shelf.depth*100}%`;piece.style.width=`${placement.width/shelf.width*100}%`;piece.style.height=`${placement.depth/shelf.depth*100}%`;
    piece.textContent=String(colorById.get(placement.productId)+1);map.append(piece);
  }
  const legend=document.createElement('div');legend.className='plan-legend';
  plan.products.forEach((item,i)=>{const row=document.createElement('div');row.className='plan-legend-row';const key=document.createElement('span');key.className=`legend-key tone-${i%6}`;key.textContent=String(i+1);row.append(key,planProductButton(item,fitById));legend.append(row)});
  card.append(head,stats,map,legend);return card;
}

function renderShelfPlans(items,shelf,token){
  if(token!==planJob||dimensionMode()==='internal') return;
  const fitById=new Map(items.map(item=>[item.record.id,item.fit]));
  const plans=buildShelfLayouts(items.map(item=>item.record),shelf,{allowTipping:els.allowTipping.checked,maxPlans:3});
  if(token!==planJob) return;els.shelfPlanList.replaceChildren();
  if(!plans.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='No one-layer combinations fit these dimensions and filters.';els.shelfPlanList.append(empty);return}
  const frag=document.createDocumentFragment();plans.forEach((plan,index)=>frag.append(renderPlan(plan,shelf,index,fitById)));els.shelfPlanList.append(frag);
}

function scheduleShelfPlans(items,shelf){
  const token=++planJob;
  if(!shelf||dimensionMode()==='internal'){els.shelfIdeas.hidden=true;els.shelfPlanList.replaceChildren();return}
  els.shelfIdeas.hidden=false;els.shelfPlanList.innerHTML='<div class="plan-loading">Finding compact combinations…</div>';setTimeout(()=>renderShelfPlans(items,shelf,token),40);
}

function sortHint(target,query){
  if(!target) return query?'Ranked by text relevance across names, models, SKUs, retailers and materials.':'Enter dimensions for geometric ranking, or search by product details.';
  if(dimensionMode()==='internal') return 'Closest published internal dimensions first; containers that hold the requested size always outrank undersized interiors.';
  if(els.sortMode.value==='pack') return 'Fitting containers first, then most verified packed units.';
  if(els.sortMode.value==='space') return 'Fitting containers first, then highest one-layer footprint use.';
  if(els.sortMode.value==='name') return 'Sorted A–Z.';
  return 'Closest outside-dimensional match first; fitting containers always outrank near misses.';
}

function updateSortOptions(target){
  const inside=dimensionMode()==='internal';
  [...els.sortMode.options].forEach(option=>{if(['pack','space'].includes(option.value)) option.disabled=!target||inside});
  if((!target||inside)&&['pack','space'].includes(els.sortMode.value)) els.sortMode.value='best';
}

function updateDimensionUI(){
  const inside=dimensionMode()==='internal';
  els.dimensionLegend.textContent=inside?'Find usable inside space':'Fit a shelf or space';
  els.fitHelp.textContent=inside?'Enter the minimum usable inside dimensions you need. Only products with published internal dimensions can be ranked.':'Enter the clear shelf/cubby dimensions. Results rank by the closest outside size that actually fits.';
  els.fitOnlyText.textContent=inside?'Only containers with enough inside space':'Only containers that fit';
  els.allowTippingText.textContent=inside?'Allow the target to rotate onto its side':'Allow containers on their side';
}

function render({keepLimit=false}={}){
  if(!keepLimit) visibleLimit=PAGE_SIZE;updateDimensionUI();
  const target=shelfFromInputs();updateSortOptions(target);
  const items=searchRecords(records,{
    query:els.query.value,brands:els.brand.value?[els.brand.value]:[],shelf:target,fitOnly:els.fitOnly.checked,
    allowTipping:els.allowTipping.checked,dimensionMode:dimensionMode(),standard:els.standard.value,
    lidded:els.lidded.checked,transparent:els.transparent.checked,wheels:els.wheels.checked,sort:els.sortMode.value
  });
  els.resultCount.textContent=items.length;els.fitHint.textContent=sortHint(target,els.query.value.trim());els.results.replaceChildren();
  if(!items.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='No containers match these filters.';els.results.append(empty)}
  else{const frag=document.createDocumentFragment();items.slice(0,visibleLimit).forEach((item,index)=>frag.append(renderCard(item,index)));els.results.append(frag)}
  const remaining=Math.max(0,items.length-visibleLimit);els.showMore.hidden=remaining===0;els.showMore.textContent=`Show ${Math.min(PAGE_SIZE,remaining)} more · ${remaining} remaining`;
  scheduleShelfPlans(items,target);
  if(currentPreview&&els.dialog.open){const previewFit=fitForShelf(currentPreview.record,target,els.allowTipping.checked,dimensionMode());fillPreview(currentPreview.record,previewFit)}
}

function updateUnitUI(){els.unitToggle.textContent=unit==='imperial'?'Imperial':'Metric';['widthUnit','depthUnit','heightUnit'].forEach(id=>$(id).textContent=unit==='imperial'?'in':'mm')}

function switchUnit(){
  const old=unit;unit=unit==='imperial'?'metric':'imperial';storage.set('containerhub-unit',unit);
  for(const el of [els.shelfWidth,els.shelfDepth,els.shelfHeight]){const v=Number(el.value);if(!Number.isFinite(v)||v<=0) continue;el.value=old==='imperial'?(v*25.4).toFixed(0):(v/25.4).toFixed(2)}
  updateUnitUI();render({keepLimit:true});
}

function clearFilters(){
  [els.query,els.shelfWidth,els.shelfDepth,els.shelfHeight].forEach(e=>e.value='');[els.fitOnly,els.allowTipping,els.lidded,els.transparent,els.wheels].forEach(e=>e.checked=false);
  els.brand.value='';els.standard.value='';els.dimensionMode.value='external';els.sortMode.value='best';render();
}

async function fetchJson(path){const response=await fetch(path);if(!response.ok) throw new Error(`Catalog request failed for ${path}: ${response.status}`);return response.json()}

async function loadCatalog(){
  const manifest=await fetchJson('./data/catalog.json');const catalogPromise=Promise.all(manifest.shards.map(name=>fetchJson(`./data/${name}`)));
  const offersPromise=manifest.offers?fetchJson(`./data/${manifest.offers}`):Promise.resolve({offers:[]});const [catalogs,offerData]=await Promise.all([catalogPromise,offersPromise]);
  const loaded=catalogs.flatMap(expandCatalogShard);const byProduct=new Map();for(const offer of offerData.offers||[]){const list=byProduct.get(offer.product_id)||[];list.push(offer);byProduct.set(offer.product_id,list)}
  return loaded.map(record=>({...record,offers:byProduct.get(record.id)||[]}));
}

async function init(){
  records=await loadCatalog();[...new Set(records.map(r=>r.brand).filter(Boolean))].sort().forEach(brand=>{const o=document.createElement('option');o.value=o.textContent=brand;els.brand.append(o)});
  updateUnitUI();render();document.querySelector('.search-panel').addEventListener('input',()=>render());document.querySelector('.search-panel').addEventListener('change',()=>render());
  els.sortMode.addEventListener('change',()=>render());els.unitToggle.addEventListener('click',switchUnit);els.clear.addEventListener('click',clearFilters);els.showMore.addEventListener('click',()=>{visibleLimit+=PAGE_SIZE;render({keepLimit:true})});
  els.closePreview.addEventListener('click',closePreview);els.dialog.addEventListener('close',()=>{currentPreview=null});els.dialog.addEventListener('click',event=>{if(event.target===els.dialog) closePreview()});
}

init().catch(error=>{els.results.innerHTML=`<div class="empty">Could not load catalog: ${error.message}</div>`});
