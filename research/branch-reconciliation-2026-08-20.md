# Worker branch reconciliation — 2026-08-20

Final integration target: 262 product records, 38 product shards, 11 retailer/pack offers.

## Coordinated base

Current `main` reached 257 products across 37 shards plus 9 offers by merging the retailer reconciliation on top of the 208-record manufacturer/industrial catalog. That tree already contains the Akro-Mils attached-lid completion and Buckhorn attached-lid worker shard.

## Recovered work

`catalog/really-useful-box-wave` contained useful data that had not reached the coordinated tree. Five non-duplicate physical sizes are recovered: 6.5 L, 19 L, 32 L, 42 L and 64 L. The 4 L physical product already existed. The 9 L and 17 L Staples listings are reconciled as additional offers for the existing normalized products rather than duplicate records.

During the audit, `catalog/akro-alc-complete-20260820` and `agent/buckhorn-attached-lid-20260820` were initially identified as orphan work. Before final merge, another coordination pass advanced `main` and included both families. The integration was therefore rebuilt from that newer `main` rather than re-merging duplicate shards.

## Superseded/content-covered branches

The useful content from these branches is already present in current `main` or newer reconciled shards. Their stale manifests must not replace the coordinated tree:

- `agent/catalog-wave-2-20260820`
- `agent/catalog-wave-3-20260820`
- `agent/buckhorn-attached-lid-20260820`
- `catalog/akro-alc-complete-20260820`
- `catalog/buckhorn-straight-wall-20260820`
- `catalog/cambro-camrounds-wave`
- `catalog/cambro-camsquares-20260820`
- `catalog/cambro-camsquares-pp-20260820`
- `catalog/cambro-camsquares-wave`
- `catalog/cambro-freshpro-20260820`
- `catalog/cambro-poly-camrounds-wave`
- `catalog/cambro-translucent-camrounds-wave`
- `catalog/exhaustive-retailer-wave`
- `catalog/final-retailer-reconcile`
- `catalog/integration-180-20260820`
- `catalog/integration-188-20260820`
- `catalog/quantum-qus-complete-20260820`
- `catalog/reconcile-exhaustive-wave`
- `catalog/sterilite-breadth-wave`
- `catalog/uline-clear-industrial-20260820`
- `catalog/wave2-20260820`

Some branches are Git-history-diverged because prior coordination passes reconciled their files without preserving every branch head as a merge parent. Content coverage is the integration criterion; stale manifests and duplicate physical products are not reintroduced merely to make branch graphs converge.

## Duplicate handling

Product identity is separate from seller identity. Pack variants and second retailers for the same physical container belong in `data/offers.json`. The Really Useful reconciliation follows that rule for the Staples 9 L and 17 L listings.

## Publication rule

Compare `main` immediately before merging. If it moves, rebuild from the newer tree and union manifests rather than force-updating. Publish `gh-pages` with the exact final `main` tree through normal history; no GitHub Actions are required.
