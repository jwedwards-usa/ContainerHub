import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fitForShelf, orientations, searchRecords, toMm} from '../src/catalog.js';
const records=JSON.parse(fs.readFileSync(new URL('../data/containers.json',import.meta.url),'utf8')).records;
const byId=id=>records.find(r=>r.id===id);

test('seed contains a useful cross-brand catalog',()=>{
  assert.ok(records.length>=15);
  assert.deepEqual([...new Set(records.map(r=>r.brand))].sort(),['Akro-Mils','IRIS USA','Rubbermaid Commercial','Sterilite']);
});

test('base rotation is considered without tipping',()=>{
  const r=byId('sterilite-18g-gray');
  const shelf={width:toMm(48,'imperial'),depth:toMm(48,'imperial'),height:toMm(36,'imperial')};
  const fit=fitForShelf(r,shelf,false);
  assert.equal(fit.count,8);
  assert.equal(fit.high,2);
});

test('tipping is opt-in',()=>{
  const record={external_mm:{length:254,width:254,height:508}};
  const shelf={width:600,depth:600,height:300};
  assert.equal(fitForShelf(record,shelf,false).count,0);
  assert.ok(fitForShelf(record,shelf,true).count>0);
  assert.equal(orientations(record.external_mm,false).length,1);
  assert.ok(orientations(record.external_mm,true).length>=3);
});

test('text search reaches material and SKU fields',()=>{
  assert.equal(searchRecords(records,{query:'HDPE'}).length,3);
  assert.equal(searchRecords(records,{query:'2131929'}).at(0).record.id,'rubbermaid-brute-wheeled-44');
});

test('fit-only removes containers that do not fit',()=>{
  const shelf={width:toMm(20,'imperial'),depth:toMm(20,'imperial'),height:toMm(24,'imperial')};
  const matches=searchRecords(records,{query:'69020CLBKKIT',shelf,fitOnly:true});
  assert.equal(matches.length,1);
  assert.equal(matches[0].fit.count,1);
  const tooSmall={width:100,depth:100,height:100};
  assert.equal(searchRecords(records,{query:'69020CLBKKIT',shelf:tooSmall,fitOnly:true}).length,0);
});

test('lidded filter excludes explicitly open containers',()=>{
  const allRubbermaid=searchRecords(records,{brands:['Rubbermaid Commercial']});
  const lidded=searchRecords(records,{brands:['Rubbermaid Commercial'],lidded:true});
  assert.equal(allRubbermaid.length,4);
  assert.equal(lidded.length,2);
});

test('unknown external dimensions stay searchable but cannot pass fit-only',()=>{
  const missing={...byId('sterilite-18g-gray'),id:'missing-dims',external_mm:null};
  const shelf={width:1000,depth:1000,height:1000};
  assert.equal(fitForShelf(missing,shelf,false),null);
  assert.equal(searchRecords([missing],{query:'Sterilite'}).length,1);
  assert.equal(searchRecords([missing],{shelf,fitOnly:true}).length,0);
});

test('retailer offers participate in text search',()=>{
  const offered={...byId('sterilite-20g-latch'),offers:[{retailer:'Ace Hardware',retailer_sku:'6084707',seller_model:'22173V06'}]};
  assert.equal(searchRecords([offered],{query:'Ace Hardware'}).length,1);
  assert.equal(searchRecords([offered],{query:'6084707'}).length,1);
});

test('unpublished descriptive metadata may be null',()=>{
  const sparse={...byId('sterilite-18g-gray'),id:'sparse-metadata',translucency:null,colors:null,shape:null,handles:null,closure:null,wall_style:null};
  assert.equal(searchRecords([sparse],{query:'Sterilite'}).length,1);
  assert.equal(searchRecords([sparse],{lidded:true}).length,1);
  assert.equal(searchRecords([sparse],{transparent:true}).length,0);
});