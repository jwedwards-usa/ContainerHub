import {capacityLabel, lengthLabel, searchRecords, toMm, weightLabel} from './src/catalog.js';

const $ = id => document.getElementById(id);
const els = {
  query:$('query'), shelfWidth:$('shelfWidth'), shelfDepth:$('shelfDepth'), shelfHeight:$('shelfHeight'),
  fitOnly:$('fitOnly'), allowTipping:$('allowTipping'), brand:$('brandFilter'), lidded:$('lidded'),
  transparent:$('transparent'), wheels:$('wheels'), clear:$('clear'), results:$('results'), resultCount:$('resultCount'),
  fitHint:$('fitHint'), unitToggle:$('unitToggle'), cardTemplate:$('cardTemplate')
};
const storage={get(key){try{return localStorage.getItem(key)}catch{return null}},set(key,value){try{localStorage.setItem(key,value)}catch{}}};
let unit = storage.get('containerhub-unit') || 'imperial';
let records = [];

function shelfFromInputs() {
  const raw = {width:Number(els.shelfWidth.value), depth:Number(els.shelfDepth.value), height:Number(els.shelfHeight.value)};
  if (!Object.values(raw).every(v => Number.isFinite(v) && v > 0)) return null;
  return Object.fromEntries(Object.entries(raw).map(([k,v]) => [k,toMm(v,unit)]));
}

function formatDims(d) {
  if (!d) return 'unknown';
  return `${lengthLabel(d.length,unit)} × ${lengthLabel(d.width,unit)} × ${lengthLabel(d.height,unit)}`;
}

function addSpec(dl,label,value) {
  const dt=document.createElement('dt'); dt.textContent=label;
  const dd=document.createElement('dd'); dd.textContent=value;
  dl.append(dt,dd);
}

function purchaseOptions(r) {
  const options=[{retailer:r.purchase_site,url:r.purchase_url},...(r.offers||[])];
  const seen=new Set();
  return options.filter(option=>{
    if(!option?.url || seen.has(option.url)) return false;
    seen.add(option.url);
    return true;
  });
}

function renderCard(item) {
  const {record:r,fit}=item;
  const node=els.cardTemplate.content.firstElementChild.cloneNode(true);
  const img=node.querySelector('.thumb'); img.src=r.image; img.alt=`${r.brand} ${r.name} dimensional schematic`;
  node.querySelector('.eyebrow').textContent=`${r.brand} · ${r.model}`;
  node.querySelector('h2').textContent=r.name;
  const chips=node.querySelector('.chips');
  [r.category,r.translucency,r.material.split(';')[0]].forEach(text=>{const c=document.createElement('span');c.className='chip';c.textContent=text;chips.append(c)});
  const dl=node.querySelector('.specs');
  addSpec(dl,'External',formatDims(r.external_mm));
  addSpec(dl,'Internal',formatDims(r.internal_mm));
  addSpec(dl,'Capacity',capacityLabel(r.capacity_ml,unit));
  addSpec(dl,'Empty weight',weightLabel(r.empty_weight_g,unit));
  addSpec(dl,'Closure',r.closure);
  const fitBox=node.querySelector('.fit-result');
  if (!r.external_mm) {
    fitBox.textContent='External dimensions unavailable; excluded from fit ranking.';
  } else if (fit) {
    if (fit.count > 0) {
      fitBox.classList.add('good');
      fitBox.textContent=`Fits ${fit.count} per shelf: ${fit.across} across × ${fit.deep} deep × ${fit.high} high · ${Math.round(fit.utilization*100)}% bounding-box use`;
    } else {
      fitBox.classList.add('bad'); fitBox.textContent='Does not fit the entered shelf dimensions.';
    }
  } else fitBox.textContent='Enter shelf width, depth and height for fit count.';
  const notes=node.querySelector('.notes');
  [...r.notes, `Verified ${r.verified_at} from ${r.source_site}.`].forEach(text=>{const li=document.createElement('li');li.textContent=text;notes.append(li)});
  node.querySelector('.source-link').href=r.source_url;
  const options=purchaseOptions(r);
  const purchase=node.querySelector('.purchase-link');
  if(options[0]) {
    purchase.href=options[0].url;
    purchase.textContent=`Buy at ${options[0].retailer}`;
  } else purchase.remove();
  const sellers=node.querySelector('.seller-links');
  options.slice(1).forEach(option=>{
    const a=document.createElement('a');
    a.className='seller-link'; a.href=option.url; a.target='_blank'; a.rel='noopener noreferrer';
    a.textContent=`Buy at ${option.retailer}${option.channel?` via ${option.channel}`:''}`;
    sellers.append(a);
  });
  return node;
}

function render() {
  const shelf=shelfFromInputs();
  const items=searchRecords(records,{
    query:els.query.value, brands:els.brand.value?[els.brand.value]:[], shelf, fitOnly:els.fitOnly.checked,
    allowTipping:els.allowTipping.checked, lidded:els.lidded.checked, transparent:els.transparent.checked, wheels:els.wheels.checked
  });
  els.resultCount.textContent=items.length;
  els.fitHint.textContent=shelf ? 'Ranked by identical containers per shelf, then bounding-box utilization.' : 'Enter shelf dimensions to rank by fit.';
  els.results.replaceChildren();
  if (!items.length) { const empty=document.createElement('div'); empty.className='empty'; empty.textContent='No containers match these filters.'; els.results.append(empty); return; }
  const frag=document.createDocumentFragment(); items.forEach(i=>frag.append(renderCard(i))); els.results.append(frag);
}

function updateUnitUI() {
  els.unitToggle.textContent=unit==='imperial'?'Imperial':'Metric';
  ['widthUnit','depthUnit','heightUnit'].forEach(id=>$(id).textContent=unit==='imperial'?'in':'mm');
}
function switchUnit() {
  const old=unit; unit=unit==='imperial'?'metric':'imperial'; storage.set('containerhub-unit',unit);
  for (const el of [els.shelfWidth,els.shelfDepth,els.shelfHeight]) {
    const v=Number(el.value); if (!Number.isFinite(v)||v<=0) continue;
    el.value=old==='imperial'?(v*25.4).toFixed(0):(v/25.4).toFixed(2);
  }
  updateUnitUI(); render();
}
function clearFilters(){[els.query,els.shelfWidth,els.shelfDepth,els.shelfHeight].forEach(e=>e.value='');[els.fitOnly,els.allowTipping,els.lidded,els.transparent,els.wheels].forEach(e=>e.checked=false);els.brand.value='';render()}

async function fetchJson(path) {
  const response=await fetch(path);
  if (!response.ok) throw new Error(`Catalog request failed for ${path}: ${response.status}`);
  return response.json();
}

async function loadCatalog() {
  const manifest=await fetchJson('./data/catalog.json');
  const catalogPromise=Promise.all(manifest.shards.map(name=>fetchJson(`./data/${name}`)));
  const offersPromise=manifest.offers ? fetchJson(`./data/${manifest.offers}`) : Promise.resolve({offers:[]});
  const [catalogs,offerData]=await Promise.all([catalogPromise,offersPromise]);
  const loaded=catalogs.flatMap(catalog=>catalog.records);
  const byProduct=new Map();
  for(const offer of offerData.offers || []) {
    const list=byProduct.get(offer.product_id) || [];
    list.push(offer); byProduct.set(offer.product_id,list);
  }
  return loaded.map(record=>({...record,offers:byProduct.get(record.id)||[]}));
}

async function init() {
  records=await loadCatalog();
  [...new Set(records.map(r=>r.brand))].sort().forEach(brand=>{const o=document.createElement('option');o.value=o.textContent=brand;els.brand.append(o)});
  updateUnitUI(); render();
  document.querySelector('.search-panel').addEventListener('input',render);
  document.querySelector('.search-panel').addEventListener('change',render);
  els.unitToggle.addEventListener('click',switchUnit); els.clear.addEventListener('click',clearFilters);
}

init().catch(error=>{els.results.innerHTML=`<div class="empty">Could not load catalog: ${error.message}</div>`});
