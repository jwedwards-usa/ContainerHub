# Worker branch reconciliation — 2026-08-20

Final coordinated state: 305 product records, 44 product shards, 12 retailer/pack/configuration offers.

## Recovered and coordinated work

The reconciliation retains all manufacturer, retailer and industrial waves and recovered late worker work:

- five non-duplicate Really Useful Box sizes from `catalog/really-useful-box-wave`;
- all 13 Uline Clear Plastic Shelf Bins from `agent/uline-clear-shelf-bins-20260820`;
- all seven standard Cambro FreshPro CamRounds from `catalog/cambro-freshpro-camrounds-20260820`;
- all 12 Akro-Grid dividable storage boxes from `catalog/akro-grid-20260820`;
- all nine current Akro-Mils Nest & Stack Totes from `catalog/akro-nest-stack-20260820`;
- both current Akro-Mils KeepBox physical sizes from `catalog/akro-keepbox-20260820`, with the 66486FILEB hanging-file configuration represented as an offer on the shared 12-gallon box geometry.

Overlapping seller listings and sellable configurations sharing the same physical container remain offers in `data/offers.json` rather than duplicate physical products.

## Branch ancestry

The coordinated history preserves worker ancestry. Historical worker and integration branches whose files had previously been copied or reconciled without their branch heads were merged as additional parents while retaining the stronger coordinated tree byte-for-byte. Stale manifests were never restored.

The branch audit covers all visible non-publication branches, including historical catalog waves, retailer reconciliations, integration branches, late industrial-family branches and metadata audit branches. The Nest & Stack data/metadata work was fully absorbed before KeepBox integration. The KeepBox source branch is merged by content and ancestry through the final integration merge rather than replaying its stale pre-Nest manifest.

## Current families added during final coordination

Akro-Grid covers models 33105, 33162, 33164, 33165, 33166, 33168, 33220, 33222, 33223, 33224, 33226 and 33228. FreshPro CamRounds cover 2, 4, 6, 8, 12, 18 and 22 qt. Uline Clear Plastic Shelf Bins cover all 13 current sizes represented by the worker wave. Akro-Mils Nest & Stack coverage includes 35180, 35185, 35190, 35195, 35200, 35225, 35230, 35240 and 35300. KeepBox coverage includes 66486CLDBL and 66497CLDGN; the 66486FILEB hanging-file configuration is an additional offer.

## Duplicate handling

Product identity is separate from seller identity. Pack variants, second retailers and accessory configurations sharing the same physical container belong in `data/offers.json`. Unknown facts remain `null`; stale manifests and duplicate records are not reintroduced merely to make branch graphs converge.

## Publication rule

Compare `main` immediately before publication. `gh-pages` must serve the exact final `main` tree through normal Git history; no GitHub Actions or force updates are required.
