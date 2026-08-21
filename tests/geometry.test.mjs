import test from 'node:test';
import assert from 'node:assert/strict';
import {buildShelfLayouts, fitForShelf, scoreSearchRecord, searchRecords, standardFitTags} from '../src/catalog.js';

const make=(id,l,w,h,extra={})=>({id,brand:'Example',name:id,model:id,external_mm:{length:l,width:w,height:h},stackable:true,...extra});
const inside=(id,l,w,h,extra={})=>make(id,l+20,w+20,h+20,{internal_mm:{length:l,width:w,height:h},...extra});

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

test('internal search requires enough usable inside space and ranks the closest interior first',()=>{
  const target={width:300,depth:400,height:200};
  const close=inside('close-inside',410,305,205);
  const huge=inside('huge-inside',900,800,700);
  const small=inside('too-small',390,290,190);
  const results=searchRecords([huge,small,close],{shelf:target,dimensionMode:'internal'});
  assert.equal(results[0].record.id,'close-inside');
  assert.equal(results[0].fit.fits,true);
  assert.equal(results[1].record.id,'huge-inside');
  assert.equal(results[2].fit.fits,false);
  assert.ok(results[0].fit.sizeScore>results[1].fit.sizeScore);
});

test('internal fit-only excludes missing and undersized interiors',()=>{
  const target={width:300,depth:400,height:200};
  const good=inside('good',410,310,210);
  const small=inside('small',390,290,190);
  const missing=make('missing',500,500,500,{internal_mm:null});
  const results=searchRecords([missing,small,good],{shelf:target,dimensionMode:'internal',fitOnly:true});
  assert.deepEqual(results.map(item=>item.record.id),['good']);
  assert.equal(fitForShelf(missing,target,false,'internal'),null);
});

test('internal search may rotate the target on its base without tipping',()=>{
  const record=inside('rotated',410,310,210);
  const target={width:400,depth:300,height:200};
  assert.equal(fitForShelf(record,target,false,'internal').fits,true);
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

test('standard paper flags use published internal footprint only',()=>{
  const letterOnly=inside('letter',285,220,80);
  const legal=inside('legal',360,220,80);
  const exteriorOnly=make('exterior-only',400,300,100,{internal_mm:null});
  assert.deepEqual(standardFitTags(letterOnly).map(tag=>tag.id).sort(),['us-letter']);
  assert.ok(standardFitTags(legal).some(tag=>tag.id==='us-letter'));
  assert.ok(standardFitTags(legal).some(tag=>tag.id==='us-legal'));
  assert.ok(standardFitTags(legal).some(tag=>tag.id==='a4'));
  assert.deepEqual(standardFitTags(exteriorOnly),[]);
});

test('round interiors require the paper diagonal to fit the diameter',()=>{
  const round=inside('round',300,300,100,{shape:'round'});
  assert.ok(!standardFitTags(round).some(tag=>tag.id==='us-letter'));
  const wider=inside('round-wide',360,360,100,{shape:'cylindrical'});
  assert.ok(standardFitTags(wider).some(tag=>tag.id==='us-letter'));
});

test('letter hanging-file badge requires rod span and upright body height',()=>{
  const good=inside('file-box',330,250,240);
  const short=inside('short-file-box',330,250,220);
  assert.ok(standardFitTags(good).some(tag=>tag.id==='letter-hanging'));
  assert.ok(!standardFitTags(short).some(tag=>tag.id==='letter-hanging'));
});

test('standard format filter is searchable and deterministic',()=>{
  const letter=inside('letter',285,220,80);
  const small=inside('small',200,150,80);
  assert.deepEqual(searchRecords([small,letter],{standard:'us-letter'}).map(item=>item.record.id),['letter']);
  assert.equal(searchRecords([small,letter],{query:'US Letter'}).at(0).record.id,'letter');
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
  const records=[make('large',300,500,350),make('medium',200,250,300),make('small',150,200,180)];
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
