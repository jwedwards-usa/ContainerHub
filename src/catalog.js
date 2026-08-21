const INCH_MM = 25.4;
const LB_G = 453.59237;
const GAL_ML = 3785.411784;
const EPSILON = 1e-7;
const SEARCH_CACHE = new WeakMap();
const STANDARD_CACHE = new WeakMap();

const UNPUBLISHED_DEFAULTS = {
  model:null, material:null, translucency:null, colors:null, shape:null, handles:null,
  closure:null, wall_style:null, liquid_capable:null, stackable:null, nestable:null,
  wheels:null, external_mm:null, internal_mm:null, capacity_ml:null, max_load_g:null,
  empty_weight_g:null, notes:[]
};

const STANDARD_FORMATS = [
  {id:'us-letter',label:'US Letter',kind:'paper',length:279.4,width:215.9,detail:'8.5 × 11 in sheet'},
  {id:'us-legal',label:'US Legal',kind:'paper',length:355.6,width:215.9,detail:'8.5 × 14 in sheet'},
  {id:'a4',label:'A4',kind:'paper',length:297,width:210,detail:'210 × 297 mm sheet'},
  {id:'letter-hanging',label:'Letter hanging file',kind:'hanging',span:323.85,height:234.95,detail:'12.75 in hanging rod span × 9.25 in folder body; rail support not verified'}
];

function groupRecords(group) {
  if (Array.isArray(group?.records)) return group.records;
  if (!Array.isArray(group?.fields) || !Array.isArray(group?.rows)) return [];
  return group.rows.map(row=>Object.fromEntries(group.fields.map((field,index)=>[field,row[index]])));
}

function humanizeHandle(handle) {
  return handle.replace(/-\d+$/,'').replace(/(\d+)-(\d+)-(qt|gal|bu|cup|oz)(?=-|$)/g,'$1.$2 $3')
    .split('-').map(word=>word ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : '').join(' ');
}

export function expandCatalogShard(data) {
  if (data?.index) {
    const defaults={...UNPUBLISHED_DEFAULTS,...(data.defaults||{})};
    return (data.items||[]).map(item=>{
      const entry=typeof item==='string'?{handle:item}:item;
      const handle=entry.handle;
      const url=entry.url||`${data.url_prefix}${handle}/`;
      const {handle:discard,...overrides}=entry;
      return {...defaults,id:entry.id||`${data.id_prefix}${handle}`,name:entry.name||humanizeHandle(handle),source_url:entry.source_url||url,purchase_url:entry.purchase_url||url,...overrides,notes:[...(defaults.notes||[]),...(entry.notes||[])]};
    });
  }
  if (data?.compact) {
    const defaults={...UNPUBLISHED_DEFAULTS,...(data.defaults||{})};
    return (data.records||[]).map(record=>({...defaults,...record,notes:[...(defaults.notes||[]),...(record.notes||[])]}));
  }
  if (Array.isArray(data?.records)) return data.records;
  return (data?.groups || []).flatMap(group => {
    const defaults={...(data?.defaults||{}),...(group?.defaults||{})};
    return groupRecords(group).map(record=>({...defaults,...record}));
  });
}

export function orientations(d, allowTipping = false) {
  if (!d || !['length','width','height'].every(k => Number.isFinite(d[k]) && d[k] > 0)) return [];
  const values = [d.length, d.width, d.height];
  const raw = allowTipping
    ? [[0,1,2],[1,0,2],[0,2,1],[2,0,1],[1,2,0],[2,1,0]]
    : [[0,1,2],[1,0,2]];
  const seen = new Set();
  return raw.map(([a,b,c]) => ({length: values[a], width: values[b], height: values[c]}))
    .filter(x => {
      const key = `${x.length}|${x.width}|${x.height}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function validTarget(target) {
  return target && ['width','depth','height'].every(k => Number.isFinite(target[k]) && target[k] > 0);
}

function clamp01(value) {
  return Math.max(0,Math.min(1,value));
}

function orientationMatch(o,target,dimensionMode='external') {
  const internal=dimensionMode==='internal';
  const axisFill=internal ? {
    width:target.width/o.width,
    depth:target.depth/o.length,
    height:target.height/o.height
  } : {
    width:o.width/target.width,
    depth:o.length/target.depth,
    height:o.height/target.height
  };
  const fills=Object.values(axisFill);
  const fits=fills.every(value=>value<=1+EPSILON);
  const clearance_mm=internal ? {
    width:o.width-target.width,
    depth:o.length-target.depth,
    height:o.height-target.height
  } : {
    width:target.width-o.width,
    depth:target.depth-o.length,
    height:target.height-o.height
  };
  const oversize_mm={
    width:Math.max(0,-clearance_mm.width),
    depth:Math.max(0,-clearance_mm.depth),
    height:Math.max(0,-clearance_mm.height)
  };
  const capped=fills.map(value=>Math.min(value,1));
  const mean=capped.reduce((sum,value)=>sum+value,0)/3;
  const volumeFill=capped.reduce((product,value)=>product*value,1);
  const geometricFill=Math.cbrt(volumeFill);
  const minFill=Math.min(...capped);
  const spread=Math.max(...capped)-minFill;
  const balance=clamp01(1-spread);
  let sizeScore;
  if (fits) {
    sizeScore=100*(0.52*geometricFill+0.23*minFill+0.17*mean+0.08*balance);
  } else {
    const excess=[
      oversize_mm.width/(internal?o.width:target.width),
      oversize_mm.depth/(internal?o.length:target.depth),
      oversize_mm.height/(internal?o.height:target.height)
    ];
    const rms=Math.sqrt(excess.reduce((sum,value)=>sum+value*value,0)/3);
    sizeScore=Math.max(0,48-140*rms);
  }
  return {fits,sizeScore,axisFill,volumeFill,clearance_mm,oversize_mm,orientation:o,dimensionMode};
}

function betterClosest(a,b) {
  if (!a) return b;
  if (a.fits!==b.fits) return b.fits?b:a;
  if (b.sizeScore!==a.sizeScore) return b.sizeScore>a.sizeScore?b:a;
  const aGap=Object.values(a.fits?a.clearance_mm:a.oversize_mm).reduce((s,v)=>s+Math.max(0,v),0);
  const bGap=Object.values(b.fits?b.clearance_mm:b.oversize_mm).reduce((s,v)=>s+Math.max(0,v),0);
  return bGap<aGap?b:a;
}

export function fitForShelf(record, target, allowTipping = false, dimensionMode = 'external') {
  if (!validTarget(target)) return null;
  const mode=dimensionMode==='internal'?'internal':'external';
  const dimensions=mode==='internal'?record?.internal_mm:record?.external_mm;
  if (!dimensions) return null;
  let packing = null;
  let closest = null;
  for (const o of orientations(dimensions, allowTipping)) {
    closest=betterClosest(closest,orientationMatch(o,target,mode));
    if (mode==='internal') continue;
    const across=Math.floor((target.width+EPSILON)/o.width);
    const deep=Math.floor((target.depth+EPSILON)/o.length);
    const geometricHigh=Math.floor((target.height+EPSILON)/o.height);
    const floorCount=across*deep;
    const high=record.stackable===true?geometricHigh:Math.min(1,geometricHigh);
    const count=floorCount*high;
    const usedVolume=count*o.length*o.width*o.height;
    const targetVolume=target.width*target.depth*target.height;
    const utilization=targetVolume?usedVolume/targetVolume:0;
    const targetArea=target.width*target.depth;
    const footprintUtilization=targetArea?floorCount*o.length*o.width/targetArea:0;
    const result={count,across,deep,high,geometricHigh,floorCount,utilization,footprintUtilization,orientation:o};
    if (!packing || count>packing.count || (count===packing.count && utilization>packing.utilization)) packing=result;
  }
  if (mode==='internal') {
    const o=closest?.orientation;
    const footprintUtilization=o?Math.min(1,(target.width*target.depth)/(o.width*o.length)):0;
    return {
      count:closest?.fits?1:0,across:closest?.fits?1:0,deep:closest?.fits?1:0,high:closest?.fits?1:0,
      geometricHigh:1,floorCount:closest?.fits?1:0,utilization:closest?.volumeFill||0,footprintUtilization,
      orientation:o||null,fits:Boolean(closest?.fits),sizeScore:closest?.sizeScore||0,axisFill:closest?.axisFill||null,
      clearance_mm:closest?.clearance_mm||null,oversize_mm:closest?.oversize_mm||null,closestOrientation:o||null,
      singleVolumeFill:closest?.volumeFill||0,stacking:'not-applicable',dimensionMode:mode
    };
  }
  return {
    ...packing,
    fits:Boolean(closest?.fits),
    sizeScore:closest?.sizeScore||0,
    axisFill:closest?.axisFill||null,
    clearance_mm:closest?.clearance_mm||null,
    oversize_mm:closest?.oversize_mm||null,
    closestOrientation:closest?.orientation||null,
    singleVolumeFill:closest?.volumeFill||0,
    stacking:record.stackable===true?'verified':record.stackable===false?'not-stackable':'unknown',
    dimensionMode:mode
  };
}

function validInternal(d) {
  return d && ['length','width','height'].every(k=>Number.isFinite(d[k])&&d[k]>0);
}

function flatRectangleFits(record,d,length,width) {
  const shape=String(record?.shape||'').toLowerCase();
  if (shape.includes('round')||shape.includes('circular')||shape.includes('cylind')) {
    return Math.hypot(length,width)<=Math.min(d.length,d.width)+EPSILON;
  }
  return (d.length+EPSILON>=length&&d.width+EPSILON>=width)||(d.length+EPSILON>=width&&d.width+EPSILON>=length);
}

export function standardFitTags(record) {
  if (STANDARD_CACHE.has(record)) return STANDARD_CACHE.get(record);
  const d=record?.internal_mm;
  if (!validInternal(d)) {
    STANDARD_CACHE.set(record,[]);
    return [];
  }
  const tags=[];
  for (const standard of STANDARD_FORMATS) {
    let fits=false;
    if (standard.kind==='paper') fits=flatRectangleFits(record,d,standard.length,standard.width);
    else if (standard.kind==='hanging') fits=Math.max(d.length,d.width)+EPSILON>=standard.span&&d.height+EPSILON>=standard.height;
    if (fits) tags.push({...standard});
  }
  STANDARD_CACHE.set(record,tags);
  return tags;
}

function offerTerms(record) {
  return (record.offers || []).flatMap(offer => [offer.retailer, offer.retailer_sku, offer.seller_model, offer.channel]).filter(Boolean);
}

function normalizeSearch(value) {
  return String(value??'').normalize('NFKD').toLowerCase()
    .replace(/[×✕]/g,' x ')
    .replace(/\bquarts?\b/g,' qt ')
    .replace(/\bgallons?\b/g,' gal ')
    .replace(/\binches?\b/g,' in ')
    .replace(/\bmillimeters?\b/g,' mm ')
    .replace(/[^a-z0-9.]+/g,' ')
    .trim().replace(/\s+/g,' ');
}

function searchableFields(record) {
  const offers=record.offers||[];
  const standards=standardFitTags(record).map(tag=>tag.label);
  return [
    [record.model,6],[...offers.map(o=>o.retailer_sku),6],[...offers.map(o=>o.seller_model),6],
    [record.name,5],[record.brand,4],[record.category,3.5],[record.material,3],[...standards,2.8],
    [record.closure,2.6],[record.shape,2.4],[record.handles,2],[record.wall_style,2],
    [record.source_site,1.8],[record.purchase_site,1.8],[...offers.map(o=>o.retailer),2.2],
    [...offers.map(o=>o.channel),1.5],[...(record.colors||[]),1.8],[...(record.notes||[]),1]
  ].flatMap(([value,weight])=>Array.isArray(value)?value.map(v=>[v,weight]):[[value,weight]])
    .filter(([value])=>value!=null && value!=='');
}

function searchIndex(record) {
  if (SEARCH_CACHE.has(record)) return SEARCH_CACHE.get(record);
  const fields=searchableFields(record).map(([value,weight])=>{
    const text=normalizeSearch(value);
    return {text,words:text.split(' '),weight};
  });
  const index={fields,haystack:fields.map(field=>field.text).join(' ')};
  SEARCH_CACHE.set(record,index);
  return index;
}

function tokenFieldScore(token,field) {
  if (!field.text) return 0;
  if (field.text===token) return 120*field.weight;
  if (field.words.includes(token)) return 80*field.weight;
  if (field.words.some(word=>word.startsWith(token))) return 45*field.weight;
  if (field.text.includes(token)) return 24*field.weight;
  return 0;
}

export function scoreSearchRecord(record, query) {
  const normalized=normalizeSearch(query);
  if (!normalized) return 0;
  const tokens=normalized.split(' ').filter(Boolean);
  const index=searchIndex(record);
  let score=0;
  for (const token of tokens) {
    let best=0;
    for (const field of index.fields) best=Math.max(best,tokenFieldScore(token,field));
    if (!best) return -1;
    score+=best;
  }
  if (index.fields.some(field=>field.text===normalized)) score+=500;
  else if (index.fields.some(field=>field.text.startsWith(normalized))) score+=180;
  else if (index.haystack.includes(normalized)) score+=60;
  return score;
}

function nameOrder(a,b) {
  return `${a.record.brand||''} ${a.record.name||''}`.localeCompare(`${b.record.brand||''} ${b.record.name||''}`);
}

export function searchRecords(records, filters = {}) {
  const q=(filters.query||'').trim();
  const brands=new Set(filters.brands||[]);
  const closures=new Set(filters.closures||[]);
  const target=filters.shelf||null;
  const fitOnly=Boolean(filters.fitOnly&&target);
  const allowTipping=Boolean(filters.allowTipping);
  const dimensionMode=filters.dimensionMode==='internal'?'internal':'external';
  const requestedSort=filters.sort||'best';
  const sortMode=dimensionMode==='internal'&&['pack','space'].includes(requestedSort)?'best':requestedSort;
  const standard=filters.standard||'';

  return records.map(record=>({record,fit:fitForShelf(record,target,allowTipping,dimensionMode),relevance:scoreSearchRecord(record,q)}))
    .filter(({record,fit,relevance})=>{
      if (q&&relevance<0) return false;
      if (brands.size&&!brands.has(record.brand)) return false;
      if (closures.size&&![...closures].some(c=>record.closure?.includes(c))) return false;
      if (filters.lidded===true&&record.closure?.startsWith('open')) return false;
      if (filters.transparent===true&&record.translucency!=='transparent') return false;
      if (filters.wheels===true&&record.wheels!==true) return false;
      if (standard&&!standardFitTags(record).some(tag=>tag.id===standard)) return false;
      if (fitOnly&&(!fit||!fit.fits)) return false;
      return true;
    })
    .sort((a,b)=>{
      if (sortMode==='name') return nameOrder(a,b);
      if (target) {
        const af=Boolean(a.fit?.fits),bf=Boolean(b.fit?.fits);
        if (af!==bf) return bf-af;
        if (dimensionMode==='external'&&sortMode==='pack') {
          const count=(b.fit?.count||0)-(a.fit?.count||0);
          if (count) return count;
          const util=(b.fit?.utilization||0)-(a.fit?.utilization||0);
          if (util) return util;
        } else if (dimensionMode==='external'&&sortMode==='space') {
          const util=(b.fit?.footprintUtilization||0)-(a.fit?.footprintUtilization||0);
          if (util) return util;
          const score=(b.fit?.sizeScore||0)-(a.fit?.sizeScore||0);
          if (score) return score;
        } else {
          const score=(b.fit?.sizeScore||0)-(a.fit?.sizeScore||0);
          if (score) return score;
          const util=(b.fit?.footprintUtilization||0)-(a.fit?.footprintUtilization||0);
          if (util) return util;
        }
        if (q&&b.relevance!==a.relevance) return b.relevance-a.relevance;
        return nameOrder(a,b);
      }
      if (q&&b.relevance!==a.relevance) return b.relevance-a.relevance;
      return nameOrder(a,b);
    });
}

function shelfModules(records,shelf,allowTipping=false,maxModules=72) {
  const raw=[];
  for (const record of records) {
    if (!record?.external_mm) continue;
    for (const o of orientations(record.external_mm,allowTipping)) {
      if (o.height>shelf.height+EPSILON||o.width>shelf.width+EPSILON||o.length>shelf.depth+EPSILON) continue;
      const across=Math.floor((shelf.width+EPSILON)/o.width);
      if (!across) continue;
      const rowArea=across*o.width*o.length;
      const rowFill=across*o.width/shelf.width;
      raw.push({record,orientation:o,across,depth:o.length,rowArea,rowFill,height:o.height});
    }
  }
  const buckets=new Map();
  for (const module of raw) {
    const bucket=Math.min(11,Math.floor(module.depth/shelf.depth*12));
    const list=buckets.get(bucket)||[];
    list.push(module);
    list.sort((a,b)=>(b.rowFill-a.rowFill)||((b.depth/shelf.depth)-(a.depth/shelf.depth)));
    buckets.set(bucket,list.slice(0,8));
  }
  return [...buckets.values()].flat().sort((a,b)=>(b.rowFill-a.rowFill)||b.rowArea-a.rowArea).slice(0,maxModules);
}

function heightHarmony(rows,shelfHeight) {
  if (!rows.length) return 0;
  const heights=rows.map(row=>row.height);
  return clamp01(1-(Math.max(...heights)-Math.min(...heights))/shelfHeight);
}

function stateValue(state,shelf,preferMixed=false) {
  const skuCount=state.skuIds.length;
  const utilization=state.area/(shelf.width*shelf.depth);
  const depthFill=state.usedDepth/shelf.depth;
  const harmony=heightHarmony(state.rows,shelf.height);
  const simplicity=skuCount<=1?1:skuCount===2?.7:.45;
  const mixBonus=preferMixed?(skuCount===2?.055:skuCount===3?.04:-.06):0;
  return utilization*.72+depthFill*.12+harmony*.07+simplicity*.09+mixBonus;
}

function pushBeam(bucket,state,shelf,beamWidth,preferMixed) {
  const signature=`${state.skuIds.slice().sort().join('|')}::${state.rows.slice(-2).map(row=>`${row.record.id}:${Math.round(row.orientation.width)}:${Math.round(row.orientation.length)}`).join('|')}`;
  const existing=bucket.findIndex(candidate=>candidate.signature===signature);
  const wrapped={...state,signature,beamScore:stateValue(state,shelf,preferMixed)};
  if (existing>=0) {
    if (wrapped.beamScore>bucket[existing].beamScore) bucket[existing]=wrapped;
  } else bucket.push(wrapped);
  bucket.sort((a,b)=>b.beamScore-a.beamScore);
  if (bucket.length>beamWidth) bucket.length=beamWidth;
}

function beamLayout(modules,shelf,{maxSkus=3,preferMixed=false,requireMixed=false,beamWidth=14}={}) {
  if (!modules.length) return null;
  const step=Math.max(5,Math.ceil(shelf.depth/260));
  const maxUnits=Math.ceil(shelf.depth/step);
  const buckets=Array.from({length:maxUnits+1},()=>[]);
  buckets[0].push({usedDepth:0,usedUnits:0,area:0,rows:[],skuIds:[],signature:'',beamScore:0});
  const finished=[];
  for (let unit=0;unit<=maxUnits;unit++) {
    for (const state of buckets[unit]) {
      if (state.rows.length) finished.push(state);
      for (const module of modules) {
        const nextDepth=state.usedDepth+module.depth;
        if (nextDepth>shelf.depth+EPSILON) continue;
        const skuIds=state.skuIds.includes(module.record.id)?state.skuIds:[...state.skuIds,module.record.id];
        if (skuIds.length>maxSkus) continue;
        const moduleUnits=Math.max(1,Math.ceil(module.depth/step));
        const nextUnits=state.usedUnits+moduleUnits;
        if (nextUnits>maxUnits) continue;
        pushBeam(buckets[nextUnits],{
          usedDepth:nextDepth,usedUnits:nextUnits,area:state.area+module.rowArea,
          rows:[...state.rows,module],skuIds
        },shelf,beamWidth,preferMixed);
      }
    }
  }
  const candidates=finished.filter(state=>!requireMixed||state.skuIds.length>=2);
  candidates.sort((a,b)=>stateValue(b,shelf,preferMixed)-stateValue(a,shelf,preferMixed));
  return candidates[0]||null;
}

function repeatedLayout(modules,shelf) {
  let best=null;
  for (const module of modules) {
    const rows=Math.floor((shelf.depth+EPSILON)/module.depth);
    if (!rows) continue;
    const state={usedDepth:rows*module.depth,area:rows*module.rowArea,rows:Array.from({length:rows},()=>module),skuIds:[module.record.id]};
    if (!best||stateValue(state,shelf,false)>stateValue(best,shelf,false)) best=state;
  }
  return best;
}

function materializePlan(state,shelf,title) {
  if (!state) return null;
  let y=0;
  const placements=[];
  const counts=new Map();
  const records=new Map();
  for (const row of state.rows) {
    records.set(row.record.id,row.record);
    for (let i=0;i<row.across;i++) {
      placements.push({productId:row.record.id,x:i*row.orientation.width,y,width:row.orientation.width,depth:row.orientation.length});
      counts.set(row.record.id,(counts.get(row.record.id)||0)+1);
    }
    y+=row.depth;
  }
  const products=[...counts.entries()].map(([id,count])=>({record:records.get(id),count}));
  const utilization=state.area/(shelf.width*shelf.depth);
  return {
    title,utilization,usedDepth:state.usedDepth,remainingDepth:Math.max(0,shelf.depth-state.usedDepth),
    totalCount:placements.length,skuCount:products.length,products,placements,
    heightHarmony:heightHarmony(state.rows,shelf.height)
  };
}

function planSignature(plan) {
  return plan.products.map(item=>`${item.record.id}:${item.count}`).sort().join('|')+`@${Math.round(plan.usedDepth)}`;
}

export function buildShelfLayouts(records,shelf,options={}) {
  if (!validTarget(shelf)) return [];
  const modules=shelfModules(records,shelf,Boolean(options.allowTipping),options.maxModules||72);
  if (!modules.length) return [];
  const plans=[
    materializePlan(beamLayout(modules,shelf,{maxSkus:3,beamWidth:14}),shelf,'Best coverage'),
    materializePlan(beamLayout(modules,shelf,{maxSkus:3,preferMixed:true,requireMixed:true,beamWidth:18}),shelf,'Balanced mix'),
    materializePlan(repeatedLayout(modules,shelf),shelf,'Simple repeat')
  ].filter(Boolean);
  const seen=new Set();
  return plans.filter(plan=>{
    const key=planSignature(plan);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0,options.maxPlans||3);
}

export function toMm(value, unit) {
  if (!Number.isFinite(value)) return null;
  return unit==='imperial'?value*INCH_MM:value;
}

export function lengthLabel(mm, unit, digits=1) {
  if (mm==null) return 'unknown';
  return unit==='imperial'?`${(mm/INCH_MM).toFixed(digits)} in`:`${Math.round(mm)} mm`;
}

export function weightLabel(g, unit) {
  if (g==null) return 'unknown';
  return unit==='imperial'?`${(g/LB_G).toFixed(2)} lb`:`${(g/1000).toFixed(2)} kg`;
}

export function capacityLabel(ml, unit) {
  if (ml==null) return 'unknown';
  return unit==='imperial'?`${(ml/GAL_ML).toFixed(1)} gal`:`${(ml/1000).toFixed(1)} L`;
}
