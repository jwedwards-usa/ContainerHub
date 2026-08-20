export function expandShardRecords(shard) {
  const rootDefaults = shard?.defaults || {};
  if (Array.isArray(shard?.groups)) {
    return shard.groups.flatMap(group => {
      const defaults = {...rootDefaults, ...(group?.defaults || {})};
      return (group?.records || []).map(record => ({...defaults, ...record}));
    });
  }
  return (shard?.records || []).map(record => ({...rootDefaults, ...record}));
}
