# Worker branch reconciliation — 2026-08-20

Final integration target: 294 product records, 42 product shards, 11 retailer/pack offers.

## Coordinated state

The coordinated tree contains the manufacturer/industrial waves, retailer reconciliation, five recovered Really Useful Box sizes, 13 Uline Clear Plastic Shelf Bins, seven standard Cambro FreshPro CamRounds and 12 Akro-Grid dividable boxes.

## Recovered and newly merged work

`catalog/really-useful-box-wave` contributed five non-duplicate physical sizes: 6.5 L, 19 L, 32 L, 42 L and 64 L. Its 9 L and 17 L Staples listings are offers on existing normalized products.

`agent/uline-clear-shelf-bins-20260820` contributed all 13 current Uline Clear Plastic Shelf Bin SKUs.

`catalog/cambro-freshpro-camrounds-20260820` contributed all seven current standard FreshPro CamRounds from 2–22 qt.

`catalog/akro-grid-20260820` contributed 12 Akro-Grid dividable storage boxes across two shards.

## Branch ancestry

Historical branches whose useful files had previously been reconciled without preserving branch ancestry were subsequently merged as additional parents while retaining the stronger coordinated tree byte-for-byte. The same rule is used for late worker branches: preserve their branch heads as ancestry without allowing stale manifests or duplicate product identities to replace current data.

The audited historical set includes:

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
- `catalog/cambro-freshpro-camrounds-20260820`
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
- `catalog/really-useful-box-wave`
- `catalog/reconcile-exhaustive-wave`
- `catalog/sterilite-breadth-wave`
- `catalog/uline-clear-industrial-20260820`
- `catalog/wave2-20260820`

## Duplicate handling

Product identity is separate from seller identity. Pack variants and second retailers for the same physical container belong in `data/offers.json`. Stale manifests are never reintroduced merely to make branch graphs converge.

## Publication rule

Compare `main` immediately before merging. If it moves, rebuild from the newer tree and union manifests rather than force-updating. Publish `gh-pages` with the exact final `main` tree through normal history; no GitHub Actions are required.
