# Catalog audit — 2026-08-26

## Result

The authoritative catalog contains **3,000 unique registered product records across 156 product shards**, plus **12 retailer/pack/configuration offers** in `data/offers.json`.

`data/catalog.json` is the authoritative shard manifest. `research/checkpoint.json` carries the matching operational checkpoint.

## Audit method

The previous checkpoint was stale at 1,076 records / 67 shards. The audit used that completed 2026-08-20 reconciliation as a trusted baseline, compared its manifest with current `main`, and counted every current post-baseline shard rather than inferring totals from branch names or commit messages.

The pre-milestone manifest reconciled to **2,796 records across 152 shards**. The audit also checked manifest regressions and superseded historical branches so recovered or duplicate data was not counted twice. In particular, the restored Cambro CamRounds polypropylene shard repaired manifest coverage but was already part of the 1,076-record baseline and therefore did not increase the audited total.

## 3,000-record milestone

U.S. Plastic Corp. / Tamco tray coverage adds exactly **204 net-new retailer item identities**:

- `tamco-lightweight-hdpe-trays-wave-1.json`: 63
- `tamco-polypropylene-trays-wave-1.json`: 65
- `tamco-polypropylene-spigot-trays-wave-1.json`: 67
- `tamco-dipping-trays-wave-1.json`: 9

Arithmetic: **2,796 + 204 = 3,000**.

The plain polypropylene family excludes U.S. Plastic items **14685** and **15442** because the current retailer table explicitly marks them out of stock. Made-to-order spigot configurations remain included because they are current sellable items. Pack and color variants are not multiplied into separate product identities.

For the fabricated HDPE and polypropylene tray families, U.S. Plastic states that published dimensions are inside dimensions, so they are stored only in `internal_mm`; `external_mm` remains unknown. The dipping-tray family publishes approximate outside dimensions, so those dimensions are stored in `external_mm`.

## Integrity checks

- Four milestone shard files contain 63 + 65 + 67 + 9 = 204 records.
- All 204 milestone IDs are unique and use the retailer item number as `model`.
- Repository search found no pre-existing `tamco-usplastic-*` identities before the milestone wave.
- The manifest contains 156 unique shard paths after registering the four milestone shards.
- `data/offers.json` remains at 12 offers; no color/pack-only Tamco rows were added as products.
- Unknown facts remain `null`; no external dimensions were inferred from inside dimensions.

Future audits should start from this 3,000-record checkpoint and count only current manifest members, not historical orphan/superseded files or branch labels.
