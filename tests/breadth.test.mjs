import test from 'node:test';
import assert from 'node:assert/strict';
import {expandCatalogShard} from '../src/catalog.js';

test('compact breadth records preserve unknowns as null',()=>{
  const [record]=expandCatalogShard({compact:true,defaults:{brand:'Example',category:'box',source_site:'Example',purchase_site:'Example',verified_at:'2026-08-20',image:'assets/thumbs/generic-container.svg'},records:[{id:'example-box',name:'Box',source_url:'https://example.com/box',purchase_url:'https://example.com/box'}]});
  assert.equal(record.model,null);
  assert.equal(record.external_mm,null);
  assert.deepEqual(record.notes,[]);
});

test('indexed breadth records build stable product URLs',()=>{
  const [record]=expandCatalogShard({index:true,defaults:{brand:'Example',category:'box'},id_prefix:'example-',url_prefix:'https://example.com/product/',items:['12-qt-box']});
  assert.equal(record.id,'example-12-qt-box');
  assert.equal(record.source_url,'https://example.com/product/12-qt-box/');
  assert.equal(record.name,'12 Qt Box');
});
