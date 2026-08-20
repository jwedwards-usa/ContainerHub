import {capacityLabel, lengthLabel, searchRecords, toMm, weightLabel} from './src/catalog.js';

const $ = id => document.getElementById(id);
const els = {
  query:$('query'), shelfWidth:$('shelfWidth'), shelfDepth:$('shelfDepth'), shelfHeight:$('shelfHeight'),
  fitOnly:$('fitOnly'), allowTipping:$('allowTipping'), brand:$('brandFilter'), lidded:$('lidded'),
  transparent:$('transparent'), wheels:$('wheels'), clear:$('clear'), results:$('results'), resultCount:$('resultCount'),
  fitHint:$('fitHint'), unitToggle:$('unitToggle'), dialog:$('previewDialog'), frame:$('previewFrame'),
  previewTitle:$('previewTitle'), openPurchase:$('openPurchase'), closePreview:$('closePreview'), cardTemplate:$('cardTemplate')
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
  if (fit) {
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
  node.querySelector('.preview-buy').addEventListener('click',()=>openPreview(r));
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

function openPreview(r) {
  els.previewTitle.textContent=`${r.purchase_site}: ${r.name}`;
  els.frame.src=r.purchase_url;
  els.openPurchase.href=r.purchase_url;
  els.dialog.showModal();
}
function closePreview(){els.frame.src='about:blank';els.dialog.close()}

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

async function init() {
  const response=await fetch('./data/containers.json');
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
  records=(await response.json()).records;
  [...new Set(records.map(r=>r.brand))].sort().forEach(brand=>{const o=document.createElement('option');o.value=o.textContent=brand;els.brand.append(o)});
  updateUnitUI(); render();
  document.querySelector('.search-panel').addEventListener('input',render);
  document.querySelector('.search-panel').addEventListener('change',render);
  els.unitToggle.addEventListener('click',switchUnit); els.clear.addEventListener('click',clearFilters);
  els.closePreview.addEventListener('click',closePreview); els.dialog.addEventListener('close',()=>{els.frame.src='about:blank'});
}

init().catch(error=>{els.results.innerHTML=`<div class="empty">Could not load catalog: ${error.message}</div>`});
