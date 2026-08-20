const INCH_MM = 25.4;
const LB_G = 453.59237;
const GAL_ML = 3785.411784;

const UNPUBLISHED_DEFAULTS = {
  model:null, material:null, translucency:null, colors:null, shape:null, handles:null,
  closure:null, wall_style:null, liquid_capable:null, stackable:null, nestable:null,
  wheels:null, external_mm:null, internal_mm:null, capacity_ml:null, max_load_g:null,
  empty_weight_g:null, notes:[]
};

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

export function fitForShelf(record, shelf, allowTipping = false) {
  if (!record?.external_mm || !shelf || !['width','depth','height'].every(k => Number.isFinite(shelf[k]) && shelf[k] > 0)) {
    return null;
  }
  let best = null;
  for (const o of orientations(record.external_mm, allowTipping)) {
    const across = Math.floor(shelf.width / o.width);
    const deep = Math.floor(shelf.depth / o.length);
    const high = Math.floor(shelf.height / o.height);
    const count = across * deep * high;
    const usedVolume = count * o.length * o.width * o.height;
    const shelfVolume = shelf.width * shelf.depth * shelf.height;
    const utilization = shelfVolume ? usedVolume / shelfVolume : 0;
    const result = {count, across, deep, high, utilization, orientation:o};
    if (!best || count > best.count || (count === best.count && utilization > best.utilization)) best = result;
  }
  return best;
}

function offerTerms(record) {
  return (record.offers || []).flatMap(offer => [offer.retailer, offer.retailer_sku, offer.seller_model, offer.channel]).filter(Boolean);
}

export function searchRecords(records, filters = {}) {
  const q = (filters.query || '').trim().toLowerCase();
  const brands = new Set(filters.brands || []);
  const closures = new Set(filters.closures || []);
  const shelf = filters.shelf || null;
  const fitOnly = Boolean(filters.fitOnly && shelf);
  const allowTipping = Boolean(filters.allowTipping);

  return records.map(record => ({record, fit: fitForShelf(record, shelf, allowTipping)}))
    .filter(({record, fit}) => {
      const haystack = [record.brand, record.name, record.model, record.category, record.material,
        record.translucency, record.shape, record.handles, record.closure, record.wall_style,
        record.source_site, record.purchase_site, ...(record.colors || []), ...(record.notes || []), ...offerTerms(record)]
        .filter(Boolean).join(' ').toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (brands.size && !brands.has(record.brand)) return false;
      if (closures.size && ![...closures].some(c => record.closure?.includes(c))) return false;
      if (filters.lidded === true && record.closure?.startsWith('open')) return false;
      if (filters.transparent === true && record.translucency !== 'transparent') return false;
      if (filters.wheels === true && record.wheels !== true) return false;
      if (fitOnly && (!fit || fit.count < 1)) return false;
      return true;
    })
    .sort((a,b) => {
      if (shelf) {
        const ac = a.fit?.count || 0, bc = b.fit?.count || 0;
        if (bc !== ac) return bc - ac;
        const au = a.fit?.utilization || 0, bu = b.fit?.utilization || 0;
        if (bu !== au) return bu - au;
      }
      return `${a.record.brand} ${a.record.name}`.localeCompare(`${b.record.brand} ${b.record.name}`);
    });
}

export function toMm(value, unit) {
  if (!Number.isFinite(value)) return null;
  return unit === 'imperial' ? value * INCH_MM : value;
}

export function lengthLabel(mm, unit, digits=1) {
  if (mm == null) return 'unknown';
  return unit === 'imperial' ? `${(mm / INCH_MM).toFixed(digits)} in` : `${Math.round(mm)} mm`;
}

export function weightLabel(g, unit) {
  if (g == null) return 'unknown';
  return unit === 'imperial' ? `${(g / LB_G).toFixed(2)} lb` : `${(g / 1000).toFixed(2)} kg`;
}

export function capacityLabel(ml, unit) {
  if (ml == null) return 'unknown';
  return unit === 'imperial' ? `${(ml / GAL_ML).toFixed(1)} gal` : `${(ml / 1000).toFixed(1)} L`;
}