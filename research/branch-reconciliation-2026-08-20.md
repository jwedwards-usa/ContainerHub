# Worker branch reconciliation — 2026-08-20

Final integration target: 294 product records, 42 product shards, 11 retailer/pack offers.

## Coordinated base

The prior all-worker reconciliation reached 275 products across 39 shards plus 11 offers. It preserved the manufacturer/industrial catalog, retailer reconciliation, five recovered Really Useful Box sizes, duplicate seller listings as offers, and the recovered Uline Clear Plastic Shelf Bin family.

## Recovered and newly merged work

`catalog/really-useful-box-wave` contributed five non-duplicate physical sizes: 6.5 L, 19 L, 32 L, 42 L and 64 L. Its 9 L and 17 L Staples listings are offers on existing normalized products.

`agent/uline-clear-shelf-bins-20260820` had a prepared 13-SKU Uline Clear Plastic Shelf Bin tree when an earlier session was interrupted. That tree was subsequently committed and merged; no matching shelf-bin IDs existed in the coordinated catalog.

`catalog/cambro-freshpro-camrounds-20260820` adds seven current standard FreshPro CamRounds from 2–22 qt. Its source-family commit was merged with explicit parent ancestry after rebuilding the manifest on the latest main.

`catalog/akro-grid-20260820` appeared after the previous final audit with 12 unique Akro-Grid dividable box records split across two shards. The two product shards and family thumbnail are merged here; its stale manifest is not used.

## Final late-branch audit

The final branch sweep was rerun after the 294-product head landed. `agent/uline-clear-shelf-bins-20260820`, `catalog/cambro-freshpro-camrounds-20260820`, `catalog/integration-all-262-20260820`, and `catalog/integration-all-262-rebased-20260820` are fully behind `main` with no files ahead.

`catalog/final-akro-grid-integration-20260820` and `catalog/integration-287-20260820` are history-diverged integration attempts whose product delta is the same Akro-Grid family already present in `main`; their remaining differences are older manifest/count metadata. They are content-covered and must not replace the current 294-record reconciliation.

The Akro source branch itself remains graph-diverged because its source commits were recovered onto the coordinated head rather than replaying its stale manifest. Direct branch-tree inspection confirmed both `akro-grid-a.json` and `akro-grid-b.json` plus `akro-grid-family.svg`; all are present in current `main`. No surfaced worker branch contains a unique product/source file outside the coordinated tree after this audit.

## Superseded/content-covered branches

Useful content from the following branches is present in current `main` or stronger reconciled shards. Stale manifests must not replace the coordinated tree:

- `agent/catalog-wave-2-20260820`
- `agent/catalog-wave-3-20260820`
- `agent/buckhorn-attached-lid-20260820`
- `agent/uline-clear-shelf-bins-20260820`
- `catalog/akro-alc-complete-20260820`
- `catalog/akro-grid-20260820`
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
- `catalog/final-akro-grid-integration-20260820`
- `catalog/final-retailer-reconcile`
- `catalog/final-retailer-reconcile-v3`
- `catalog/integration-180-20260820`
- `catalog/integration-188-20260820`
- `catalog/integration-287-20260820`
- `catalog/integration-all-262-20260820`
- `catalog/integration-all-262-rebased-20260820`
- `catalog/quantum-qus-complete-20260820`
- `catalog/really-useful-box-wave`
- `catalog/reconcile-exhaustive-wave`
- `catalog/sterilite-breadth-wave`
- `catalog/uline-clear-industrial-20260820`
- `catalog/wave2-20260820`

Some branches are Git-history-diverged because earlier coordination reconciled their files without preserving every branch head as a merge parent. Content coverage is the integration criterion; stale manifests and duplicate physical products are not reintroduced merely to make branch graphs converge.

## Duplicate handling

Product identity is separate from seller identity. Pack variants and second retailers for the same physical container belong in `data/offers.json`.

## Publication rule

Compare `main` immediately before merging. If it moves, rebuild from the newer tree and union manifests rather than force-updating. Publish `gh-pages` with the exact final `main` tree through normal history; no GitHub Actions are required.
