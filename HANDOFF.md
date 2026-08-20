# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a static GitHub Pages catalog with no backend and no required build step. The coordinated catalog contains **245 source-backed product records across 35 product shards**, plus **9 retailer/pack offers** in `data/offers.json`.

The tree preserves all prior manufacturer and retailer waves, including the 196-record coordinated Cambro/Quantum/Uline/Buckhorn state that landed while retailer reconciliation was in progress. The final reconciliation was rebuilt on top of that newer `main` rather than merging a stale manifest.

Recent manufacturer work covers all three Cambro Classic CamRound material families, Classic and FreshPro CamSquares, the current Quantum QUS sequence through QUS275MOB, all eight Uline Clear Industrial attached-lid tote sizes, and the Buckhorn straight-wall family. Existing Sterilite, IRIS USA, Akro-Mils, Rubbermaid Commercial, Really Useful Box, Cambro food-box, Quantum and Uline waves are retained unchanged.

The reconciled retailer wave adds 49 genuinely new product identities after deduping against newer `main`: 10 Container Store Clear Weathertight sizes, 11 Ace Craftsman/Rubbermaid products, five Lowe's Project Source clear-latch sizes, 17 unique Target/Brightroom SKUs, four unique Home Depot HDX SKUs, IRIS WeatherPro 6.5 qt, and a Tom Thumb Signature Select 16 fl oz spray bottle.

The same Signature Select bottle is also sellable through Safeway; Safeway is represented as an additional retailer offer rather than a duplicate product. Product identity and seller identity are now separate: one normalized product can have several retailer or pack offers.

## Catalog behavior
The UI supports free-text search across product identity, taxonomy, source/purchase retailer, and attached retailer offers; brand/lid/translucency/wheel filters; imperial/metric conversion; shelf fit and orientation handling; ranked fit counts; source links; primary purchase previews; additional seller links; and lightweight SVG schematics.

Sellable products no longer need fabricated dimensions to enter the catalog. `external_mm: null` is allowed when geometry is genuinely unpublished. Such products remain searchable and purchasable but are excluded from shelf-fit calculations.

`data/catalog.json` lists 35 product shards and `data/offers.json` stores additional sellers for an existing product identity. Unknown product facts stay `null`; never infer values from adjacent sizes.

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
catalog valid: 245 records, 245 unique ids across 35 shards, 9 retailer offers
```

The browser smoke test loads every manifest shard plus the offer file and verifies the 245-record initial render, Safeway offer search, null-dimension fit exclusion, Ace offer search/link rendering, legacy SKU/material/brand search, shelf fit, unit conversion, and purchase preview.

The VM cannot resolve `github.com`, so publication and branch verification use the connected GitHub API rather than GitHub Actions or a normal `git push`.

## Data and sourcing rules
Prefer manufacturer specifications, then established retailers that clearly match the same model or SKU. Capture external and internal dimensions separately and preserve qualifiers such as top/bottom measurements or dimensions with an accessory cover. Do not derive missing capacity, material, load rating, internal dimensions, empty weight, waterproofness, or liquid capability from neighboring products.

A retailer can be the purchase source while a manufacturer is the stronger specification source; document that join. A second retailer selling the same physical product is an offer, not a duplicate product record. Put seller-specific SKUs, pack/color variants that share the same physical identity, and additional purchase URLs in `data/offers.json`.

Do not reject a current sellable SKU solely because the retailer omits physical dimensions. Keep unpublished facts `null`; only the fit engine requires positive external dimensions.

Catalog mining is sharded. Keep source families in separate files so parallel workers can add products without editing the same data file; reconcile only `data/catalog.json` at integration time. When another worker advances `main`, rebuild the integration tree from the new `main` and retain the stronger/newer duplicate before adding only genuinely new product identities.

`research/retailer-coverage.json` is the source of truth for exhaustive retailer progress. A retailer remains active until every in-scope sellable SKU or variant has been enumerated or given an explicit blocked, seasonal, marketplace, or unavailable outcome. A representative SKU or completed batch is not retailer completion.

## Next useful work
1. Continue each requested retailer from `research/retailer-coverage.json` until enumeration is actually complete.
2. Prioritize Walmart and Target because their storage and marketplace inventories are broad and change frequently.
3. Continue Home Depot HDX/marketplace and Lowe's Project Source/COMMANDER families.
4. Mine H-E-B, Tom Thumb, Safeway, and Brookshire's reusable food-storage and household container categories without requiring dimensions as an admission gate.
5. Expand Hobby Lobby and Michaels craft-storage cases, organizers, crates, and bins.
6. Finish Container Store and Ace remaining tote/bin/box families.
7. Continue Buckhorn attached-lid/bulk, Cambro FreshPro CamRounds, Quantum non-QUS, Uline additional house-brand, and IRIS direct-manufacturer breadth.
8. Add stale-record refresh tooling and field-level provenance as catalog size grows.

## Deployment
There are no GitHub Actions credits available. The site is raw static content. Keep `main` as source of truth and advance `gh-pages` through normal Git history to the same verified static tree; never force shared refs.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid filler and comments that merely restate code. Favor auditable data and deterministic behavior. Leave data quality, coverage, tests, or research checkpoints measurably better than you found them.
