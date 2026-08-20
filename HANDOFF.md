# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a static GitHub Pages catalog with no backend and no required build step. The coordinated catalog contains **1,022 source-backed product records across 60 product shards**, plus **12 retailer/pack/configuration offers** in `data/offers.json`.

The 1,000-product scale pass preserves the prior manufacturer/industrial and retailer waves, then adds large current-source breadth from Sterilite, Akro-Mils and Uline. The latest Uline wave adds 205 non-overlapping models across plastic bottles, jugs, jerricans, carboys, IBC tanks, drums, overpacks, stack/nest containers, crates, rigid/corrugated boxes, conductive bins, ingredient bins, refuse/recycling containers, vials, deli/take-out containers and plastic cups.

The catalog supports detailed source records alongside compact/index and grouped tabular shards. Those formats expand to the same runtime record shape in `src/catalog.js`. They exist to keep large source-family enumerations DRY while preserving one auditable model or canonical manufacturer page per identity. Unpublished facts remain `null`; index-first records can be enriched later without changing product identity.

## Catalog behavior
The UI supports free-text search across identity, taxonomy, source/purchase retailer and offers; brand/lid/translucency/wheel filters; imperial/metric conversion; shelf fit and orientation handling; ranked fit counts; source and purchase links; product-preview dialogs with retained direct buy links; additional seller links; and lightweight SVG schematics.

Sellable products may have `external_mm: null` when geometry is unpublished. They remain searchable and purchasable but are excluded from shelf-fit calculations.

`data/catalog.json` lists 60 product shards. Unknown product facts stay `null`; never infer values from adjacent sizes or related models.

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
catalog valid: 1022 records, 1022 unique ids across 60 shards, 12 retailer offers
```

The browser smoke test derives its initial render count from the manifest and verifies offer search, null-dimension fit exclusion, retailer link rendering, preview navigation, legacy SKU/material/brand search, shelf fit and unit conversion.

The current execution VM has no repository checkout and cannot reliably resolve `github.com`, so publication and branch verification use the connected GitHub API rather than GitHub Actions or a normal `git push`. Re-run the local commands above whenever a network-independent checkout is available.

## Data and sourcing rules
Prefer manufacturer specifications, then established retailers that clearly match the same model or SKU. Capture external and internal dimensions separately and preserve source qualifiers. Do not derive missing capacity, material, load rating, internal dimensions, empty weight, waterproofness or liquid capability from neighboring products.

A second retailer, pack, color-only variant, or accessory configuration using the same physical product belongs in `data/offers.json` rather than becoming a duplicate product.

Do not reject a current sellable SKU solely because physical dimensions are unpublished. Only the fit engine requires positive external dimensions.

Keep source families in separate shard files so parallel workers can add products without editing the same data file. Reconcile `data/catalog.json` at integration time. If `main` advances, rebuild from the newer tree and retain the stronger/newer duplicate before adding only genuinely new identities.

`research/retailer-coverage.json` is the source of truth for exhaustive retailer progress. A retailer remains active until every in-scope sellable SKU or variant has an explicit completed, blocked, seasonal, marketplace, unavailable or duplicate-product outcome.

## Next useful work
1. Enrich index-first Sterilite and Uline records with model-specific dimensions, material, capacity and closure facts from their canonical source pages.
2. Continue every requested retailer from `research/retailer-coverage.json` until enumeration is actually complete.
3. Prioritize Walmart, Target, Home Depot and Lowe's because their plastic storage inventories are broad and change frequently.
4. Continue H-E-B, Tom Thumb, Safeway, Brookshire's, Hobby Lobby, Michaels, The Container Store and Ace.
5. Expand IRIS USA direct-manufacturer breadth, Quantum non-QUS families, Buckhorn modular/bulk families and remaining Cambro food-storage families.
6. Add stale-record refresh tooling and field-level provenance as catalog size grows.

## Deployment
There are no GitHub Actions credits available. The site is raw static content. Keep `main` as source of truth and advance `gh-pages` through normal Git history to the exact same final tree; never force shared refs.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid filler and comments that merely restate code. Favor auditable data and deterministic behavior. Leave data quality, coverage, tests or research checkpoints measurably better than you found them.
