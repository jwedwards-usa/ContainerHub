import {capacityLabel, lengthLabel, searchRecords, toMm, weightLabel} from './src/catalog.js';

const $ = id => document.getElementById(id);
const els = {
  query:$('query'), shelfWidth:$('shelfWidth'), shelfDepth:$('shelfDepth'), shelfHeight:$('shelfHeight'),
  fitOnly:$('fitOnly'), allowTipping:$('allowTipping'), brand:$('brandFilter'), lidded:$('lidded'),
  transparent:$('transparent'), wheels:$('wheels'), clear:$('clear'), results:$('results'), resultCount:$('resultCount'),
  fitHint:$('fitHint'), unitToggle:$('unitToggle'), cardTemplate:$('cardTemplate'), dialog:$('previewDialog'),
  closePreview:$('closePreview'), previewEyebrow:$('previewEyebrow'), previewTitle:$('previewTitle'), previewImage:$('previewImage'),
  previewChips:$('previewChips'), previewSpecs:$('previewSpecs'), previewFit:$('previewFit'), previewNotes:$('previewNotes'),
  previewPurchase:$('previewPurchase'), previewSellers:$('previewSellers'), previewSource:$('previewSource')
};
const storage={get(key){try{return localStorage.getItem(key)}catch{return null}},set(key,value){try{localStorage.setItem(key,value)}catch{}}};
const compactNulls={model:null,material:null,translucency:null,colors:null,shape:null,handles:null,closure:null,wall_style:null,liquid_capable:null,stackable:null,nestable:null,wheels:null,external_mm:null,internal_mm:null,capacity_ml:null,max_load_g:null,empty_weight_g:null,notes:[]};
let unit = storage.get('containerhub-unit') || 'imperial';
let records = [];
let currentPreview = null;

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

function renderSpecs(dl,r) {
  dl.replaceChildren();
  addSpec(dl,'External',formatDims(r.external_mm));
  addSpec(dl,'Internal',formatDims(r.internal_mm));
  addSpec(dl,'Capacity',capacityLabel(r.capacity_ml,unit));
  addSpec(dl,'Empty weight',weightLabel(r.empty_weight_g,unit));
  addSpec(dl,'Closure',r.closure || 'unknown');
}

function renderChips(container,r) {
  container.replaceChildren();
  [r.category,r.translucency,r.material?.split(';')[0]].filter(Boolean).forEach(text=>{
    const chip=document.createElement('span'); chip.className='chip'; chip.textContent=text; container.append(chip);
  });
}

function renderFit(fitBox,r,fit) {
  fitBox.classList.remove('good','bad');
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
}

function renderNotes(container,r) {
  container.replaceChildren();
  [...r.notes, `Verified ${r.verified_at} from ${r.source_site}.`].forEach(text=>{
    const li=document.createElement('li'); li.textContent=text; container.append(li);
  });
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

function configurePrimaryPurchase(link,option) {
  if (!option) {
    link.hidden=true;
    link.removeAttribute('href');
    return;
  }
  link.hidden=false;
  link.href=option.url;
  link.textContent=`Buy at ${option.retailer}`;
}

function renderSellerLinks(container,options) {
  container.replaceChildren();
  options.slice(1).forEach(option=>{
    const a=document.createElement('a');
    a.className='seller-link'; a.href=option.url; a.target='_blank'; a.rel='noopener noreferrer';
    a.textContent=`Buy at ${option.retailer}${option.channel?` via ${option.channel}`:''}`;
    container.append(a);
  });
}

function recordEyebrow(r) {
  return [r.brand,r.model].filter(Boolean).join(' · ');
}

function renderCard(item) {
  const {record:r,fit}=item;
  const node=els.cardTemplate.content.firstElementChild.cloneNode(true);
  const img=node.querySelector('.thumb'); img.src=r.image; img.alt=`${r.brand} ${r.name} dimensional schematic`;
  node.querySelector('.eyebrow').textContent=recordEyebrow(r);
  node.querySelector('h2').textContent=r.name;
  renderChips(node.querySelector('.chips'),r);
  renderSpecs(node.querySelector('.specs'),r);
  renderFit(node.querySelector('.fit-result'),r,fit);
  renderNotes(node.querySelector('.notes'),r);
  node.querySelector('.source-link').href=r.source_url;
  const options=purchaseOptions(r);
  configurePrimaryPurchase(node.querySelector('.purchase-link'),options[0]);
  renderSellerLinks(node.querySelector('.seller-links'),options);
  node.querySelector('.preview-button').addEventListener('click',()=>openPreview(r,fit));
  return node;
}

function fillPreview(r,fit) {
  els.previewEyebrow.textContent=recordEyebrow(r);
  els.previewTitle.textContent=r.name;
  els.previewImage.src=r.image;
  els.previewImage.alt=`${r.brand} ${r.name} dimensional schematic`;
  renderChips(els.previewChips,r);
  renderSpecs(els.previewSpecs,r);
  renderFit(els.previewFit,r,fit);
  renderNotes(els.previewNotes,r);
  const options=purchaseOptions(r);
  configurePrimaryPurchase(els.previewPurchase,options[0]);
  renderSellerLinks(els.previewSellers,options);
  els.previewSource.href=r.source_url;
}

function openPreview(r,fit) {
  currentPreview={record:r,fit};
  fillPreview(r,fit);
  els.dialog.showModal();
}

function closePreview() {
  currentPreview=null;
  els.dialog.close();
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
  if (currentPreview && els.dialog.open) fillPreview(currentPreview.record,currentPreview.fit);
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

function humanizeHandle(handle) {
  let value=handle.replace(/-\d+$/,'');
  value=value.replace(/(\d+)-(\d+)-(qt|gal|bu|cup|oz)(?=-|$)/g,'$1.$2 $3');
  const special={qt:'Qt.',gal:'Gal.',bu:'Bu.',cup:'Cup',oz:'Oz.',ez:'EZ',clearview:'ClearView',stepon:'StepOn',touchtop:'TouchTop',swingtop:'SwingTop',hingelid:'HingeLID',ultraseal:'UltraSeal',ultra:'Ultra',hiphold:'HipHold',shelftotes:'ShelfTotes',tuff1:'Tuff1'};
  return value.split('-').map(word=>special[word]||`${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
}

function expandDataset(dataset) {
  if (dataset.index) {
    const defaults={...compactNulls,...(dataset.defaults||{})};
    return dataset.items.map(item=>{
      const data=typeof item==='string'?{handle:item}:item;
      const handle=data.handle;
      const url=data.url||`${dataset.url_prefix}${handle}/`;
      return {...defaults,id:data.id||`${dataset.id_prefix}${handle}`,name:data.name||humanizeHandle(handle),source_url:data.source_url||url,purchase_url:data.purchase_url||url,...data,handle:undefined,notes:[...(defaults.notes||[]),...(data.notes||[])]};
    });
  }
  if (!dataset.compact) return dataset.records;
  const defaults={...compactNulls,...(dataset.defaults||{})};
  return dataset.records.map(record=>({...defaults,...record,notes:[...(defaults.notes||[]),...(record.notes||[])]}));
}

async function loadCatalog() {
  const manifest=await fetchJson('./data/catalog.json');
  const catalogPromise=Promise.all(manifest.shards.map(name=>fetchJson(`./data/${name}`)));
  const offersPromise=manifest.offers ? fetchJson(`./data/${manifest.offers}`) : Promise.resolve({offers:[]});
  const [catalogs,offerData]=await Promise.all([catalogPromise,offersPromise]);
  const loaded=catalogs.flatMap(expandDataset);
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
  els.closePreview.addEventListener('click',closePreview);
  els.dialog.addEventListener('close',()=>{currentPreview=null});
  els.dialog.addEventListener('click',event=>{if(event.target===els.dialog) closePreview()});
}

init().catch(error=>{els.results.innerHTML=`<div class="empty">Could not load catalog: ${error.message}</div>`});
