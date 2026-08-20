import fs from 'node:fs';
import path from 'node:path';

const root=new URL('../',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
const errors=[];
if(manifest.schema_version!==1) errors.push('catalog manifest schema_version must be 1');
if(!Array.isArray(manifest.shards)||!manifest.shards.length) errors.push('catalog manifest must list shards');

const datasets=(manifest.shards||[]).map(name=>({name,data:JSON.parse(fs.readFileSync(new URL(`../data/${name}`,import.meta.url),'utf8'))}));
const compactNulls={model:null,material:null,translucency:null,colors:null,shape:null,handles:null,closure:null,wall_style:null,liquid_capable:null,stackable:null,nestable:null,wheels:null,external_mm:null,internal_mm:null,capacity_ml:null,max_load_g:null,empty_weight_g:null,notes:[]};
const required=['id','brand','name','model','category','source_site','source_url','purchase_site','purchase_url','verified_at','material','translucency','colors','shape','handles','closure','wall_style','liquid_capable','stackable','nestable','wheels','external_mm','internal_mm','capacity_ml','max_load_g','empty_weight_g','notes','image'];
const ids=new Set(), identities=new Set(), sourceUrls=new Set();
let recordCount=0;

function humanizeHandle(handle){
  let value=handle.replace(/-\d+$/,'');
  value=value.replace(/(\d+)-(\d+)-(qt|gal|bu|cup|oz)(?=-|$)/g,'$1.$2 $3');
  const special={qt:'Qt.',gal:'Gal.',bu:'Bu.',cup:'Cup',oz:'Oz.',ez:'EZ',clearview:'ClearView',stepon:'StepOn',touchtop:'TouchTop',swingtop:'SwingTop',hingelid:'HingeLID',ultraseal:'UltraSeal',ultra:'Ultra',hiphold:'HipHold',shelftotes:'ShelfTotes',tuff1:'Tuff1'};
  return value.split('-').map(word=>special[word]||`${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ');
}

function expandDataset(data){
  const defaults={...compactNulls,...(data.defaults||{})};
  if(data.index){
    if(!Array.isArray(data.items)||!data.items.length) return [];
    return data.items.map(item=>{
      const entry=typeof item==='string'?{handle:item}:item;
      const handle=entry.handle;
      const url=entry.url||`${data.url_prefix}${handle}/`;
      const {handle:discard,...overrides}=entry;
      return {...defaults,id:entry.id||`${data.id_prefix}${handle}`,name:entry.name||humanizeHandle(handle),source_url:entry.source_url||url,purchase_url:entry.purchase_url||url,...overrides,notes:[...(defaults.notes||[]),...(entry.notes||[])]};
    });
  }
  if(data.compact) return (data.records||[]).map(raw=>({...defaults,...raw,notes:[...(defaults.notes||[]),...(raw.notes||[])]}));
  return data.records||[];
}

for(const {name,data} of datasets){
  if(data.schema_version!==1) errors.push(`${name}: schema_version must be 1`);
  if(data.index){
    if(!data.defaults||!data.id_prefix||!data.url_prefix||!Array.isArray(data.items)) errors.push(`${name}: index shards require defaults, id_prefix, url_prefix and items`);
  } else if(!Array.isArray(data.records)) errors.push(`${name}: records must be an array`);
  const expanded=expandDataset(data);
  recordCount+=expanded.length;
  for(const [i,r] of expanded.entries()){
    const p=`${name}.records[${i}]`;
    for(const key of required) if(!(key in r)) errors.push(`${p}.${key} is required`);
    if(ids.has(r.id)) errors.push(`${p}.id duplicate ${r.id}`); ids.add(r.id);
    if(r.model!=null){const identity=`${String(r.brand).toLowerCase()}|${String(r.model).toLowerCase()}`;if(identities.has(identity)) errors.push(`${p} duplicate brand/model ${r.brand} ${r.model}`);identities.add(identity)}
    if(sourceUrls.has(r.source_url)) errors.push(`${p}.source_url duplicate ${r.source_url}`); sourceUrls.add(r.source_url);
    for(const key of ['source_url','purchase_url']){try{const u=new URL(r[key]);if(u.protocol!=='https:') errors.push(`${p}.${key} must be https`)}catch{errors.push(`${p}.${key} invalid URL`)}}
    if(r.external_mm!=null) for(const key of ['length','width','height']) if(!(r.external_mm?.[key]>0)) errors.push(`${p}.external_mm.${key} must be > 0`);
    if(r.internal_mm!=null) for(const key of ['length','width','height']){if(!(r.internal_mm?.[key]>0)) errors.push(`${p}.internal_mm.${key} must be > 0`);if(r.external_mm&&r.internal_mm[key]>r.external_mm[key]) errors.push(`${p}.internal_mm.${key} exceeds external dimension`)}
    const imagePath=path.join(root.pathname,r.image);if(!fs.existsSync(imagePath)) errors.push(`${p}.image missing ${r.image}`);
  }
}
if(recordCount<10) errors.push('catalog must contain at least 10 records');

let offerCount=0;
if(manifest.offers){
  const offerData=JSON.parse(fs.readFileSync(new URL(`../data/${manifest.offers}`,import.meta.url),'utf8'));
  if(offerData.schema_version!==1) errors.push(`${manifest.offers}: schema_version must be 1`);
  if(!Array.isArray(offerData.offers)) errors.push(`${manifest.offers}: offers must be an array`);
  const offerKeys=new Set();
  for(const [i,offer] of (offerData.offers||[]).entries()){
    const p=`${manifest.offers}.offers[${i}]`;offerCount++;
    for(const key of ['product_id','retailer','url','verified_at']) if(!offer[key]) errors.push(`${p}.${key} is required`);
    if(!ids.has(offer.product_id)) errors.push(`${p}.product_id unknown ${offer.product_id}`);
    try{const u=new URL(offer.url);if(u.protocol!=='https:') errors.push(`${p}.url must be https`)}catch{errors.push(`${p}.url invalid URL`)}
    const key=`${offer.product_id}|${offer.retailer}|${offer.url}`;if(offerKeys.has(key)) errors.push(`${p} duplicate offer`);offerKeys.add(key);
  }
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`catalog valid: ${recordCount} records, ${ids.size} unique ids across ${datasets.length} shards, ${offerCount} retailer offers`);
