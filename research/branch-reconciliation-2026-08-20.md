# Worker branch reconciliation — 2026-08-20

Final coordinated union: **1,076 unique product records, 67 product shards and 12 retailer/pack/configuration offers**.

## Audit scope
The initial closing inventory contained 61 branches including `main` and `gh-pages`. Fifty-four historical worker, integration and metadata branches were strict ancestors of the 902-product `main` head or identical to it. They contained no unique file delta and required no product recovery.

Five late divergent branches were inspected at product-identity level rather than merged wholesale, because their manifests and sparse records overlapped stronger data already on `main`.

## Recovered unique products
- `catalog/integration-902-bottles-jugs-20260820`: 20 detailed jug/tank records. Sixteen overlap sparse records from the later 1,022 branch but contain stronger material, capacity, closure and dimensional data; four are additional models: Uline S-16915, H-11432, H-11433 and Rubbermaid H-10889.
- `catalog/final-1000-plus-20260820`: 59 non-overlapping industrial models after removing the 16 jug/carboy identities covered by the richer shard, plus 61 food/refuse/container models.
- `catalog/1000-product-expansion-20260820`: 34 unique Uline-family models not present in the current bins/totes, industrial, food/refuse, bottle or jar waves.
- `catalog/bulk-wave-1-572-20260820`: its remaining Akro, bin, jar and bottle identities are already present in stronger current shards.
- `catalog/scale-1000-20260820`: its Akro-Mils identities are already present in the current 82-model Akro storage bulk wave.

The resulting union adds 174 product identities to the 902-product coordinated tree: 20 + 59 + 61 + 34 = 174.

## Duplicate handling
The 69 sparse Uline bottle records in `catalog/final-1000-plus-20260820` were not reintroduced because the current 85-model bottle wave is broader and source-enriched. The old Uline jar and storage index families were likewise omitted where current grouped shards contain the same brand/model identities with stronger capacity or dimensional data. Sterilite index shards from the older 1,000-product branch are already in current `main`.

Physical identity remains separate from seller, pack, color-only and accessory configurations; those belong in `data/offers.json`. Unknown source facts remain `null`.

## Closing branch refresh
A post-publication refresh first increased the visible inventory to 67 refs because concurrent workers surfaced `search-geometry-v2`, `catalog/final-all-branches-reconcile-20260820-staging`, `catalog/final-all-branches-reconcile-20260820`, `catalog/final-union-1076-20260820`, `catalog/final-union-working-20260820`, and the final reconciliation source branch itself. The two `final-union` refs and the final reconciliation source branch were identical to the 1,076-product `main`; the two `final-all-branches` refs and `search-geometry-v2` were behind it. None contained a unique product or code delta.

A final live refresh found 68 refs because `search-geometry-v2-rebased` appeared afterward. Direct comparison against `main` showed that branch is two commits behind with zero files ahead, so it also contains no unique product or code delta. The live 68-ref inventory therefore has no unmerged unique content outside `main` and `gh-pages`.

## Publication
`main` is the source of truth. `gh-pages` must be advanced through normal Git history to the exact same final tree. No GitHub Actions or force updates are required.

## Branch cleanup
After final publication and tree verification, all branches other than `main` and `gh-pages` are superseded by this reconciliation and are safe to delete.
