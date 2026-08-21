import test from 'node:test';
import assert from 'node:assert/strict';
import {buildShelfLayouts, fitForShelf, scoreSearchRecord, searchRecords} from '../src/catalog.js';

const make=(id,l,w,h,extra={})=>({id,brand:'Example',name:id,model:id,external_mm:{length:l,width:w,height:h},stackable:true,...extra});

test('closest fit outranks tiny high-count bins',()=>{
  const shelf={width:1000,depth:500,height:400};
  const close=make('close',490,980,390);
  const tiny=make('tiny',100,100,100);
  const results=searchRecords([tiny,close],{shelf});
  assert.equal(results[0].record.id,'close');
  assert.ok(results[0].fit.sizeScore>90);
  assert.ok(results[1].fit.count>results[0].fit.count);
});

test('pack sort still surfaces the most repeated units',()=>{
  const shelf={width:1000,depth:500,height:400};
  const close=make('close',490,980,390);
  const tiny=make('tiny',100,100,100);
  const results=searchRecords([close,tiny],{shelf,sort:'pack'});
  assert.equal(results[0].record.id,'tiny');
});

test('fit sort always places fitting boxes ahead of almost-fitting boxes',()=>{
  const shelf={width:1000,depth:500,height:400};
  const fit=make('fit',450,900,350);
  const oversize=make('oversize',505,995,395);
  const results=searchRecords([oversize,fit],{shelf});
  assert.equal(results[0].record.id,'fit');
  assert.equal(results[1].fit.fits,false);
});

test('text relevance favors exact model and SKU matches',()=>{
  const exact=make('exact',100,100,100,{name:'General tote',model:'ABC-123'});
  const loose=make('loose',100,100,100,{name:'ABC 123 compatible storage tote',model:'ZZZ'});
  assert.ok(scoreSearchRecord(exact,'ABC-123')>scoreSearchRecord(loose,'ABC-123'));
  assert.equal(searchRecords([loose,exact],{query:'ABC-123'})[0].record.id,'exact');
});

test('multi-token search can match across fields',()=>{
  const one=make('one',100,100,100,{brand:'Sterilite',material:'HDPE plastic',name:'Latch tote'});
  const two=make('two',100,100,100,{brand:'Other',material:'HDPE plastic',name:'Latch tote'});
  const results=searchRecords([two,one],{query:'Sterilite HDPE'});
  assert.equal(results.length,1);
  assert.equal(results[0].record.id,'one');
});

test('non-stackable records do not get fictitious vertical layers',()=>{
  const shelf={width:600,depth:600,height:600};
  const record=make('open',200,200,200,{stackable:false});
  const fit=fitForShelf(record,shelf);
  assert.equal(fit.floorCount,9);
  assert.equal(fit.geometricHigh,3);
  assert.equal(fit.high,1);
  assert.equal(fit.count,9);
});

test('shelf layouts generate physical one-layer placements within bounds',()=>{
  const shelf={width:1000,depth:600,height:400};
  const records=[
    make('large',300,500,350),
    make('medium',200,250,300),
    make('small',150,200,180)
  ];
  const plans=buildShelfLayouts(records,shelf);
  assert.ok(plans.length>=2);
  assert.ok(plans.some(plan=>plan.skuCount>=2));
  for(const plan of plans){
    assert.ok(plan.utilization>0&&plan.utilization<=1+1e-9);
    for(const p of plan.placements){
      assert.ok(p.x>=0&&p.y>=0);
      assert.ok(p.x+p.width<=shelf.width+1e-7);
      assert.ok(p.y+p.depth<=shelf.depth+1e-7);
    }
  }
});
