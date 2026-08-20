# Worker branch reconciliation — 2026-08-20

Final integration target: 294 product records, 42 product shards, 11 retailer/pack offers.

## Coordinated base

The coordinated tree reached 282 products across 40 shards plus 11 offers before the Akro-Grid integration. It preserves the manufacturer/industrial catalog, retailer reconciliation, five recovered Really Useful Box sizes, 13 Uline Clear Plastic Shelf Bins, all audited historical worker ancestry, and seven Cambro FreshPro CamRounds.

Commit `8435838616fff84e531820b5b46695a1ec1eb68a` records the remaining audited historical worker bundle as merge ancestry without changing the already-reconciled product tree. Commit `de5db68ae10aa00d1c51a9f36c2737ae35d56737` then merges the Cambro FreshPro CamRound worker family.

## Recovered and newly integrated work

`catalog/really-useful-box-wave` contributed five non-duplicate physical sizes: 6.5 L, 19 L, 32 L, 42 L and 64 L. Its 9 L and 17 L Staples listings are offers on existing normalized products.

`agent/uline-clear-shelf-bins-20260820` contributed 13 current Uline Clear Plastic Shelf Bin SKUs after its prepared tree was committed. Those products are present in the coordinated tree and the worker ancestry is recorded.

`catalog/akro-grid-20260820` contributes the complete current 12-model Akro-Grid dividable-container family: 33105, 33162, 33164, 33165, 33166, 33168, 33220, 33222, 33223, 33224, 33226 and 33228. The integration tree is rebuilt on the latest `main`; its stale feature-branch manifest is not used.

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
- `catalog/integration-all-262-20260820`
- `catalog/integration-all-262-rebased-20260820`
- `catalog/quantum-qus-complete-20260820`
- `catalog/reconcile-exhaustive-wave`
- `catalog/sterilite-breadth-wave`
- `catalog/uline-clear-industrial-20260820`
- `catalog/wave2-20260820`

The rebased 262 integration branch is strictly behind the coordinated tree with no files ahead. The older 262 integration branch is a stale divergent precursor whose useful files are already represented by newer reconciled shards and code. Content is not reintroduced solely to make stale branch graphs converge.

## Duplicate handling

Product identity is separate from seller identity. Pack variants and second retailers for the same physical container belong in `data/offers.json`.

## Publication rule

Compare `main` immediately before merging. If it moves, rebuild from the newer tree and union manifests rather than force-updating. Publish `gh-pages` with the exact final `main` tree through normal history; no GitHub Actions are required.
