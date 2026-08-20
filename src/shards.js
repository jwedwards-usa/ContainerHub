export function expandShardRecords(shard) {
  const defaults = shard?.defaults || {};
  return (shard?.records || []).map(record => ({...defaults, ...record}));
}
