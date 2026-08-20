import fs from 'node:fs';
import path from 'node:path';
const root=new URL('../',import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL('../data/containers.json',import.meta.url),'utf8'));
const ids=new Set();
const errors=[];
if(data.schema_version!==1) errors.push('schema_version must be 1');
if(!Array.isArray(data.records)||data.records.length<10) errors.push('catalog must contain at least 10 records');
for(const [i,r] of data.records.entries()){
  const p=`records[${i}]`;
  for(const key of ['id','brand','name','model','source_url','purchase_url','verified_at','external_mm','image']) if(r[key]==null||r[key]==='') errors.push(`${p}.${key} is required`);
  if(ids.has(r.id)) errors.push(`${p}.id duplicate ${r.id}`); ids.add(r.id);
  for(const key of ['source_url','purchase_url']) {try{const u=new URL(r[key]);if(u.protocol!=='https:') errors.push(`${p}.${key} must be https`)}catch{errors.push(`${p}.${key} invalid URL`)}}
  for(const key of ['length','width','height']) if(!(r.external_mm?.[key]>0)) errors.push(`${p}.external_mm.${key} must be > 0`);
  if(r.internal_mm) for(const key of ['length','width','height']) if(!(r.internal_mm[key]>0) || r.internal_mm[key]>r.external_mm[key]) errors.push(`${p}.internal_mm.${key} invalid`);
  const imagePath=path.join(root.pathname,r.image);
  if(!fs.existsSync(imagePath)) errors.push(`${p}.image missing ${r.image}`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`catalog valid: ${data.records.length} records, ${ids.size} unique ids`);
