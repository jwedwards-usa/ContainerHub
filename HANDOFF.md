# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a static GitHub Pages catalog with no backend and no required build step. The coordinated catalog contains **305 source-backed product records across 44 product shards**, plus **12 retailer/pack/configuration offers** in `data/offers.json`.

The all-worker reconciliation preserves the manufacturer/industrial waves, retailer breadth waves, five recovered Really Useful Box sizes, the Uline shelf-bin recovery, the full standard Cambro FreshPro CamRound family, the Akro-Grid recovery, the complete current Akro-Mils Nest & Stack Tote family, and both current Akro-Mils KeepBox physical sizes.

Recent manufacturer and industrial coverage includes the six-size Akro-Mils Attached Lid Container family, 12 Akro-Grid dividable boxes, all nine current Nest & Stack Totes, both current KeepBoxes, Buckhorn straight-wall and eight attached-lid totes, all three Cambro Classic CamRound material families, Classic and FreshPro CamSquares, seven standard FreshPro CamRounds, the Quantum QUS sequence through QUS275MOB, eight Uline Clear Industrial attached-lid totes, 13 Uline Clear Plastic Shelf Bins, and Really Useful Box sizes through 64 L.

The Nest & Stack wave covers models 35180, 35185, 35190, 35195, 35200, 35225, 35230, 35240 and 35300. Akro-Mils supplies current outside dimensions, bottom interior dimensions, inside heights, gallon capacities, load ratings and stack/nest behavior; current Simplastics exact-model listings supply direct purchase pages and polypropylene cross-checks. Unsupported tare weights remain null, and special-order clear variants are noted rather than duplicated.

The KeepBox wave adds 66486CLDBL and 66497CLDGN with current manufacturer geometry, polypropylene construction, attached lids, stack/nest behavior and load ratings. The 66486FILEB hanging-file configuration shares the 12-gallon physical box and is therefore an additional Grainger offer rather than a duplicate product. Akro-Mils markets 66497 as 18 gallons while its current full-line table lists 17 gallons; the record preserves the marketed nominal value and documents the discrepancy.

Reconciled retailer additions cover The Container Store, Ace, Lowe's, Target, Home Depot, Tom Thumb and Safeway. Product identity and seller identity are separate: duplicate retailer listings, pack/color variants, and accessory configurations sharing one physical container belong in `data/offers.json`.

## Catalog behavior
The UI supports free-text search across identity, taxonomy, source/purchase retailer and offers; brand/lid/translucency/wheel filters; imperial/metric conversion; shelf fit and orientation handling; ranked fit counts; source and purchase links; additional seller links; and lightweight SVG schematics.

Sellable products may have `external_mm: null` when geometry is unpublished. They remain searchable and purchasable but are excluded from shelf-fit calculations.

`data/catalog.json` lists 44 product shards. Unknown product facts stay `null`; never infer values from adjacent sizes.

## Verification
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

Expected validator result:
```text
catalog valid: 305 records, 305 unique ids across 44 shards, 12 retailer offers
```

The browser smoke test derives its initial render count from the manifest and verifies offer search, null-dimension fit exclusion, retailer link rendering, legacy SKU/material/brand search, shelf fit, unit conversion and purchase navigation.

The VM cannot reliably resolve `github.com`, so publication and branch verification use the connected GitHub API rather than GitHub Actions or a normal `git push`.

## Data and sourcing rules
Prefer manufacturer specifications, then established retailers that clearly match the same model or SKU. Capture external and internal dimensions separately and preserve source qualifiers. Do not derive missing capacity, material, load rating, internal dimensions, empty weight, waterproofness or liquid capability from neighboring products.

A second retailer selling the same physical product is an offer, not a duplicate product. Keep seller-specific SKUs, pack/color variants, and accessory configurations that share the same physical identity in `data/offers.json`.

Do not reject a current sellable SKU solely because physical dimensions are unpublished. Only the fit engine requires positive external dimensions.

Keep source families in separate shard files so parallel workers can add products without editing the same data file. Reconcile `data/catalog.json` at integration time. If `main` advances, rebuild from the newer tree and retain the stronger/newer duplicate before adding only genuinely new identities.

`research/retailer-coverage.json` is the source of truth for exhaustive retailer progress. A retailer remains active until every in-scope sellable SKU or variant has an explicit completed, blocked, seasonal, marketplace, unavailable or duplicate-product outcome.

## Next useful work
1. Continue every requested retailer from `research/retailer-coverage.json` until enumeration is actually complete.
2. Prioritize Walmart and Target because their storage and marketplace inventories are broad and change frequently.
3. Continue Home Depot HDX/marketplace and Lowe's Project Source/COMMANDER families.
4. Mine H-E-B, Tom Thumb, Safeway and Brookshire's reusable food-storage and household container categories without requiring dimensions as an admission gate.
5. Expand Hobby Lobby and Michaels craft-storage cases, organizers, crates and bins.
6. Finish Container Store and Ace remaining tote/bin/box families.
7. Continue Buckhorn modular nesting/bulk, Akro-Mils Straight Wall, Cambro FreshPro pails/other food-storage families, Quantum non-QUS, Uline families beyond Clear Industrial/Clear Shelf Bins, and IRIS direct-manufacturer breadth.
8. Add stale-record refresh tooling and field-level provenance as catalog size grows.

## Deployment
There are no GitHub Actions credits available. The site is raw static content. Keep `main` as source of truth and advance `gh-pages` through normal Git history to the same verified static tree; never force shared refs.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid filler and comments that merely restate code. Favor auditable data and deterministic behavior. Leave data quality, coverage, tests or research checkpoints measurably better than you found them.
