# Worker branch reconciliation — 2026-08-20

Final integration target: 262 product records, 38 product shards, 11 retailer/pack offers.

## Base integration

`catalog/final-retailer-reconcile` is the strongest coordinated base. It contains 245 products across 35 shards plus 9 offers, including the 196-record manufacturer integration and the deduplicated retailer wave.

## Recovered work

- `catalog/akro-alc-complete-20260820`: recovered four larger Akro-Mils attached-lid models (`39160`, `39170`, `39175`, `39280`) and the family thumbnail. The two smaller ALC models were already in the base catalog.
- `agent/buckhorn-attached-lid-20260820`: recovered eight Buckhorn attached-lid models and the family thumbnail. The worker had created `data/buckhorn-attached-lid.json` but had not added it to that branch's manifest.
- `catalog/really-useful-box-wave`: recovered five non-duplicate sizes (6.5 L, 19 L, 32 L, 42 L, 64 L). The 4 L physical product already existed. The 9 L and 17 L Staples listings were reconciled as additional offers for the existing normalized products rather than duplicate product records.

## Superseded/content-covered branches

The useful product content from these branches is already present in the coordinated base or a newer reconciled shard and should not be merged by replacing the current manifest:

- `agent/catalog-wave-2-20260820`
- `agent/catalog-wave-3-20260820`
- `catalog/buckhorn-straight-wall-20260820`
- `catalog/cambro-camrounds-wave`
- `catalog/cambro-camsquares-20260820`
- `catalog/cambro-camsquares-pp-20260820`
- `catalog/cambro-camsquares-wave`
- `catalog/cambro-freshpro-20260820`
- `catalog/cambro-poly-camrounds-wave`
- `catalog/cambro-translucent-camrounds-wave`
- `catalog/exhaustive-retailer-wave`
- `catalog/integration-180-20260820`
- `catalog/integration-188-20260820`
- `catalog/quantum-qus-complete-20260820`
- `catalog/reconcile-exhaustive-wave`
- `catalog/sterilite-breadth-wave`
- `catalog/uline-clear-industrial-20260820`
- `catalog/wave2-20260820`

These branches may be Git-history-diverged because some coordination passes copied/reconciled their files rather than retaining the original commit as a merge parent. Content coverage, not branch ancestry, is the integration criterion; stale manifests must never overwrite the stronger 262-record tree.

## Duplicate handling

Product identity is separate from seller identity. Pack variants and second retailers for the same physical container belong in `data/offers.json`. The Really Useful reconciliation follows that rule for the Staples 9 L and 17 L listings.

## Publication rule

Before advancing `main`, compare its current head to this integration branch. If `main` moved, rebuild on the newer tree and union manifests rather than force-updating. Publish `gh-pages` with the exact verified `main` tree through normal history; no GitHub Actions are required.
