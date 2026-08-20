# Worker branch reconciliation — 2026-08-20

Final integration target: 275 product records, 39 product shards, 11 retailer/pack offers.

## Coordinated base

The prior all-worker reconciliation reached 262 products across 38 shards plus 11 offers. It preserved the 208-record manufacturer/industrial catalog, the retailer reconciliation, five recovered Really Useful Box sizes, and duplicate seller listings as offers.

## Recovered work

`catalog/really-useful-box-wave` contributed five non-duplicate physical sizes: 6.5 L, 19 L, 32 L, 42 L and 64 L. Its 9 L and 17 L Staples listings are offers on existing normalized products.

`agent/uline-clear-shelf-bins-20260820` had a prepared 13-SKU Uline Clear Plastic Shelf Bin tree when the session was interrupted. The first late-worker audit saw the branch before that tree had been committed and therefore correctly reported zero files ahead at that instant. The prepared tree was subsequently committed as `658860c`, verified as two files ahead of the 262-product `main`, and merged into this reconciliation. No matching Uline shelf-bin IDs existed in the coordinated catalog.

## Superseded/content-covered branches

Useful content from the following branches is present in current `main` or stronger reconciled shards. Stale manifests must not replace the coordinated tree:

- `agent/catalog-wave-2-20260820`
- `agent/catalog-wave-3-20260820`
- `agent/buckhorn-attached-lid-20260820`
- `agent/uline-clear-shelf-bins-20260820`
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
- `catalog/final-retailer-reconcile-v3`
- `catalog/integration-180-20260820`
- `catalog/integration-188-20260820`
- `catalog/quantum-qus-complete-20260820`
- `catalog/reconcile-exhaustive-wave`
- `catalog/sterilite-breadth-wave`
- `catalog/uline-clear-industrial-20260820`
- `catalog/wave2-20260820`

Some branches are Git-history-diverged because earlier coordination reconciled their files without preserving every branch head as a merge parent. Content coverage is the integration criterion; stale manifests and duplicate physical products are not reintroduced merely to make branch graphs converge.

## Duplicate handling

Product identity is separate from seller identity. Pack variants and second retailers for the same physical container belong in `data/offers.json`.

## Publication rule

Compare `main` immediately before merging. If it moves, rebuild from the newer tree and union manifests rather than force-updating. Publish `gh-pages` with the exact final `main` tree through normal history; no GitHub Actions are required.
