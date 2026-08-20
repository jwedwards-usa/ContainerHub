# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a static GitHub Pages catalog with no backend and no required build step. The coordinated catalog contains **262 source-backed product records across 38 product shards**, plus **11 retailer/pack offers** in `data/offers.json`.

The final retailer reconciliation was rebuilt on top of the 208-record coordinated `main`, so all concurrent Akro-Mils, Buckhorn, Cambro, Quantum and Uline work is preserved. A final worker-branch audit then recovered five additional Really Useful Box sizes that had never reached the coordinated tree. The overlapping Really Useful 9 L and 17 L Staples listings are represented as additional seller offers rather than duplicate product identities.

Recent manufacturer and industrial coverage includes the six-size Akro-Mils Attached Lid Container family, Buckhorn straight-wall and eight attached-lid totes, all three Cambro Classic CamRound material families, Classic and FreshPro CamSquares, the Quantum QUS sequence through QUS275MOB, all eight Uline Clear Industrial attached-lid tote sizes, and Really Useful Box sizes through 64 L represented by normalized physical products and retailer offers.

The reconciled retailer additions are 10 Container Store Clear Weathertight sizes, 11 Ace Craftsman/Rubbermaid products, five Lowe's Project Source clear-latch sizes, 17 unique Target/Brightroom SKUs, four unique Home Depot HDX SKUs, IRIS WeatherPro 6.5 qt, and a Tom Thumb Signature Select 16 fl oz spray bottle. The same Signature Select bottle is represented as an additional Safeway offer rather than a duplicate product.

`research/branch-reconciliation-2026-08-20.md` records the worker-branch audit, superseded branches, and recovered orphan work.

## Catalog behavior
The UI supports free-text search across product identity, taxonomy, source/purchase retailer, and attached retailer offers; brand/lid/translucency/wheel filters; imperial/metric conversion; shelf fit and orientation handling; ranked fit counts; source links; primary purchase links; additional seller links; and lightweight SVG schematics.

Sellable products may have `external_mm: null` when geometry is genuinely unpublished. They remain searchable and purchasable but are excluded from shelf-fit calculations. Product identity and seller identity are separate: additional retailers and pack/color offers that share one physical product live in `data/offers.json`.

`data/catalog.json` lists 38 product shards. Unknown product facts stay `null`; never infer values from adjacent sizes.

## Verification
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

The expected validator result is:
```text
catalog valid: 262 records, 262 unique ids across 38 shards, 11 retailer offers
```

The browser smoke test derives its expected initial render count directly from the manifest, then verifies Safeway offer search, null-dimension fit exclusion, Ace offer search/link rendering, legacy SKU/material/brand search, shelf fit, unit conversion, and purchase navigation.

The VM cannot reliably resolve `github.com`, so publication and branch verification use the connected GitHub API rather than GitHub Actions or a normal `git push`.

## Data and sourcing rules
Prefer manufacturer specifications, then established retailers that clearly match the same model or SKU. Capture external and internal dimensions separately and preserve source qualifiers. Do not derive missing capacity, material, load rating, internal dimensions, empty weight, waterproofness, or liquid capability from neighboring products.

A second retailer selling the same physical product is an offer, not a duplicate product. Put seller-specific SKUs, pack/color variants that share the same physical identity, and additional purchase URLs in `data/offers.json`.

Do not reject a current sellable SKU solely because the retailer omits physical dimensions. Keep unpublished facts `null`; only the fit engine requires positive external dimensions.

Catalog mining is sharded. Keep source families in separate files so parallel workers can add products without editing the same data file; reconcile only `data/catalog.json` at integration time. When another worker advances `main`, rebuild the integration tree from the new `main` and retain the stronger/newer duplicate before adding only genuinely new product identities.

`research/retailer-coverage.json` is the source of truth for exhaustive retailer progress. A retailer remains active until every in-scope sellable SKU or variant has been enumerated or given an explicit blocked, seasonal, marketplace, unavailable, or duplicate-product outcome.

## Next useful work
1. Continue every requested retailer from `research/retailer-coverage.json` until enumeration is actually complete.
2. Prioritize Walmart and Target because their storage and marketplace inventories are broad and change frequently.
3. Continue Home Depot HDX/marketplace and Lowe's Project Source/COMMANDER families.
4. Mine H-E-B, Tom Thumb, Safeway and Brookshire's reusable food-storage and household container categories without requiring dimensions as an admission gate.
5. Expand Hobby Lobby and Michaels craft-storage cases, organizers, crates and bins.
6. Finish Container Store and Ace remaining tote/bin/box families.
7. Continue Buckhorn modular nesting/bulk, Akro-Mils Akro-Grid/Nest & Stack/Straight Wall/KeepBox, Cambro FreshPro CamRounds, Quantum non-QUS, Uline additional house-brand, and IRIS direct-manufacturer breadth.
8. Add stale-record refresh tooling and field-level provenance as catalog size grows.

## Deployment
There are no GitHub Actions credits available. The site is raw static content. Keep `main` as source of truth and advance `gh-pages` through normal Git history to the same verified static tree; never force shared refs.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid filler and comments that merely restate code. Favor auditable data and deterministic behavior. Leave data quality, coverage, tests or research checkpoints measurably better than you found them.
