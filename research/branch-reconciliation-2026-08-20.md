# Worker branch reconciliation — 2026-08-20

Final coordinated state: 326 product records, 46 product shards, 12 retailer/pack/configuration offers.

## Recovered and coordinated work

The reconciliation retains all manufacturer, retailer and industrial waves and recovered late worker work:

- five non-duplicate Really Useful Box sizes from `catalog/really-useful-box-wave`;
- all 13 Uline Clear Plastic Shelf Bins from `agent/uline-clear-shelf-bins-20260820`;
- all seven standard Cambro FreshPro CamRounds from `catalog/cambro-freshpro-camrounds-20260820`;
- all 12 Akro-Grid dividable storage boxes from `catalog/akro-grid-20260820`;
- all nine current Akro-Mils Nest & Stack Totes from `catalog/akro-nest-stack-20260820`;
- all 12 current Akro-Mils Straight Wall configurations from `catalog/akro-straight-wall-20260820`;
- both current KeepBox physical sizes from `catalog/akro-keepbox-20260820`, with the 66486FILEB hanging-file configuration represented as an offer on the 12-gallon KeepBox rather than a duplicate product;
- nine unique Target Brightroom products from `catalog/target-brightroom-wave-3-20260820` spanning latching, clear stacking, frosted, waterproof/IP67 and wheeled formats.

Overlapping seller, pack and configuration listings remain offers in `data/offers.json` rather than duplicate physical products.

## Branch ancestry

The coordinated history preserves worker ancestry wherever branch heads are available, and content reconciliation always starts from the newest `main`. Historical worker and integration branches whose files had previously been copied without their branch heads were merged as additional parents while retaining the stronger coordinated tree. Stale manifests are never restored.

During the late Akro pass, preview-dialog work advanced `main` several times. KeepBox and Straight Wall were rebuilt on the newest preview tree, and a subsequent ancestry-only merge recorded the KeepBox source/integration heads without changing the 317-product tree. Target wave 3 initially appeared as an asset-only branch, then grew to a nine-record shard; all nine TCINs were checked against the indexed coordinated catalog before integration and had no existing match.

After the 326-product metadata merge, re-run the full branch inventory and compare every surfaced branch against `main`. Any branch with `ahead_by > 0` must be content-reconciled or ancestry-merged before publication.

## Current families added during final coordination

Akro-Grid covers models 33105, 33162, 33164, 33165, 33166, 33168, 33220, 33222, 33223, 33224, 33226 and 33228. FreshPro CamRounds cover 2, 4, 6, 8, 12, 18 and 22 qt. Uline Clear Plastic Shelf Bins cover all 13 current sizes represented by the worker wave. Akro-Mils Nest & Stack coverage includes 35180, 35185, 35190, 35195, 35200, 35225, 35230, 35240 and 35300. Akro-Mils Straight Wall coverage includes 37208, 37278, 37288, 37608, 37612, 37616, 37672, 37676, 37678, 37682, 37686 and 37688. KeepBox coverage includes 66486CLDBL and 66497CLDGN. Target Brightroom wave 3 adds TCINs 89977303, 89050689, 88941044, 88941038, 94908601, 93251234, 93251237, 93251223 and 94958932.

## Duplicate handling

Product identity is separate from seller identity. Pack variants, accessory configurations and second retailers for the same physical container belong in `data/offers.json`. Unknown facts remain `null`; stale manifests and duplicate records are not reintroduced merely to make branch graphs converge.

## Publication rule

Compare `main` immediately before publication. Re-run the branch inventory because workers can appear during integration. `gh-pages` must serve the exact final `main` tree through normal Git history; no GitHub Actions or force updates are required.
