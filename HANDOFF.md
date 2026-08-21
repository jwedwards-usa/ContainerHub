# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a static GitHub Pages catalog with no backend and no required build step. The fully reconciled catalog contains **1,076 unique source-backed product records across 67 product shards**, plus **12 retailer/pack/configuration offers** in `data/offers.json`.

The final branch reconciliation starts from the 902-product coordinated tree, preserves its richer 85-model Uline bottle wave, and adds only product identities absent from that tree: 20 detailed Uline jug/tank records, 59 non-overlapping industrial container models, 61 food/refuse/container models, and 34 additional Uline-family models recovered from an older scale branch. Sparse overlapping bottle, jar, Akro-Mils and Sterilite index records were not reintroduced.

Where branches overlapped, the stronger record won. In particular, the reconciled jug/tank shard retains published material, capacity, closure and available dimensional data instead of replacing those products with the sparse versions from the 1,022-record integration branch.

## Catalog behavior
The UI supports free-text search across identity, taxonomy, source/purchase retailer and offers; brand/lid/translucency/wheel filters; imperial/metric conversion; shelf fit and orientation handling; ranked fit counts; source and purchase links; product-preview dialogs with retained direct buy links; additional seller links; and lightweight SVG schematics.

Sellable products may have `external_mm: null` when geometry is unpublished. They remain searchable and purchasable but are excluded from shelf-fit calculations. Grouped and tabular shards expand to the same runtime record shape as legacy shards.

`data/catalog.json` lists 67 product shards. Unknown product facts stay `null`; never infer values from adjacent sizes or related models.

## Verification
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

Expected validator result for this tree:
```text
catalog valid: 1076 records, 1076 unique ids across 67 shards, 12 retailer offers
```

The browser smoke test derives its initial render count from the manifest and verifies offer search, null-dimension fit exclusion, retailer link rendering, preview navigation, legacy SKU/material/brand search, shelf fit and unit conversion.

The current execution VM cannot reliably resolve `github.com`, so publication and branch verification use the connected GitHub API rather than GitHub Actions or a normal `git push`.

## Reconciliation result
A full branch inventory found 61 branches before final integration, including `main` and `gh-pages`. Fifty-four historical worker/integration branches were already strict ancestors of `main` or identical. Five divergent late branches were reconciled at product identity level:

- `catalog/final-1000-plus-20260820`: retained its non-overlapping industrial and food/refuse models; overlapping sparse bottles were superseded by the richer current bottle wave.
- `catalog/integration-902-bottles-jugs-20260820`: retained the richer detailed jug, jerrican, carboy and tank records.
- `catalog/bulk-wave-1-572-20260820`: its bin, jar, bottle and Akro product identities were already represented by stronger current shards; its detailed jug content is preserved through the reconciled jug shard.
- `catalog/scale-1000-20260820`: its Akro-Mils identities were already represented by the current 82-model Akro bulk wave.
- `catalog/1000-product-expansion-20260820`: its bottle, jar and Sterilite identities were already represented; 34 otherwise-missing Uline-family models were recovered.

`research/branch-reconciliation-2026-08-20.md` records the final union and duplicate handling.

## Data and sourcing rules
Prefer manufacturer specifications, then established retailers that clearly match the same model or SKU. Capture external and internal dimensions separately and preserve source qualifiers. Do not derive missing capacity, material, load rating, internal dimensions, empty weight, waterproofness or liquid capability from neighboring products.

A second retailer, pack, color-only variant, or accessory configuration using the same physical product belongs in `data/offers.json` rather than becoming a duplicate product.

Do not reject a current sellable SKU solely because physical dimensions are unpublished. Only the fit engine requires positive external dimensions.

Keep source families in separate shard files so future workers can add products without editing the same data file. Reconcile `data/catalog.json` at integration time. If `main` advances, rebuild from the newer tree and retain the stronger/newer duplicate before adding only genuinely new identities.

`research/retailer-coverage.json` remains the source of truth for exhaustive retailer progress.

## Next useful work
1. Enrich index-first Uline and Sterilite records with model-specific dimensions and material/capacity/closure facts from canonical pages.
2. Continue every requested retailer from `research/retailer-coverage.json` until enumeration is actually complete.
3. Prioritize Walmart, Target, Home Depot and Lowe's because their inventories are broad and change frequently.
4. Continue H-E-B, Tom Thumb, Safeway, Brookshire's, Hobby Lobby, Michaels, The Container Store and Ace.
5. Expand IRIS USA, Quantum non-QUS, Buckhorn modular/bulk and remaining Cambro food-storage families.
6. Add stale-record refresh tooling and field-level provenance as catalog size grows.

## Deployment
There are no GitHub Actions credits available. The site is raw static content. Keep `main` as source of truth and advance `gh-pages` through normal Git history to the exact same verified tree; never force shared refs.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid filler and comments that merely restate code. Favor auditable data and deterministic behavior. Leave data quality, coverage, tests or research checkpoints measurably better than you found them.
