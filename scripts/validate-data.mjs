import fs from 'node:fs';
import path from 'node:path';

const root=new URL('../',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
const errors=[];
if(manifest.schema_version!==1) errors.push('catalog manifest schema_version must be 1');
if(!Array.isArray(manifest.shards)||!manifest.shards.length) errors.push('catalog manifest must list shards');

const datasets=(manifest.shards||[]).map(name=>({
  name,
  data:JSON.parse(fs.readFileSync(new URL(`../data/${name}`,import.meta.url),'utf8'))
}));
const ids=new Set();
let recordCount=0;

for(const {name,data} of datasets){
  if(data.schema_version!==1) errors.push(`${name}: schema_version must be 1`);
  if(!Array.isArray(data.records)) {errors.push(`${name}: records must be an array`); continue}
  recordCount+=data.records.length;
  for(const [i,r] of data.records.entries()){
    const p=`${name}.records[${i}]`;
    for(const key of ['id','brand','name','model','source_url','purchase_url','verified_at','external_mm','image']) {
      if(r[key]==null||r[key]==='') errors.push(`${p}.${key} is required`);
    }
    if(ids.has(r.id)) errors.push(`${p}.id duplicate ${r.id}`); ids.add(r.id);
    for(const key of ['source_url','purchase_url']) {
      try{const u=new URL(r[key]);if(u.protocol!=='https:') errors.push(`${p}.${key} must be https`)}
      catch{errors.push(`${p}.${key} invalid URL`)}
    }
    for(const key of ['length','width','height']) if(!(r.external_mm?.[key]>0)) errors.push(`${p}.external_mm.${key} must be > 0`);
    if(r.internal_mm) for(const key of ['length','width','height']) {
      if(!(r.internal_mm[key]>0) || r.internal_mm[key]>r.external_mm[key]) errors.push(`${p}.internal_mm.${key} invalid`);
    }
    const imagePath=path.join(root.pathname,r.image);
    if(!fs.existsSync(imagePath)) errors.push(`${p}.image missing ${r.image}`);
  }
}
if(recordCount<10) errors.push('catalog must contain at least 10 records');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`catalog valid: ${recordCount} records, ${ids.size} unique ids across ${datasets.length} shards`);
