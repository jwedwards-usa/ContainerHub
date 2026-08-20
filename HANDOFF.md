# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a working static GitHub Pages catalog with no backend and no required build step. The reconciled catalog contains **159 source-backed product records across 23 product shards**, plus **9 retailer/pack offers** in `data/offers.json`.

This reconciliation started from the current 110-record `main`, not the older retailer feature branch. The stale branch was 22 commits behind `main`, so overlapping Target, Home Depot, and IRIS records were discarded in favor of the newer `main` versions. Only 49 genuinely additive product identities were carried forward: 10 Container Store Weathertight sizes, 11 Ace Craftsman/Rubbermaid products, five Lowe's Project Source clear-latch sizes, 17 unique Target/Brightroom SKUs, four unique Home Depot HDX SKUs, IRIS WeatherPro 6.5 qt, and a Tom Thumb Signature Select 16 fl oz spray bottle.

The same Signature Select bottle is also currently sellable through Safeway; Safeway is represented as an additional retailer offer instead of a duplicate product record. Product identity and seller identity are now separate: one normalized product can have several retailer/pack offers.

The UI supports:
- free-text search across product identity, taxonomy, source/purchase retailer, and attached retailer offers;
- brand, lid, translucency, and wheel filters;
- imperial/metric input and display conversion;
- shelf width/depth/height fit search;
- base rotation by default and optional tipping;
- ranking by number of identical containers that fit, then bounding-box utilization;
- source links, primary purchase preview, and direct links to additional sellers;
- lightweight SVG dimensional thumbnails and generic schematic fallbacks.

Sellable products no longer need fabricated dimensions to enter the catalog. `external_mm: null` is allowed when geometry is genuinely unpublished; those products remain searchable and purchasable but are excluded from fit calculations.

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
catalog valid: 159 records, 159 unique ids across 23 shards, 9 retailer offers
```

The browser smoke test loads every manifest shard plus the offer file. It verifies the 159-record initial render, Safeway offer search, null-dimension fit exclusion, Ace offer search/link rendering, legacy SKU/material/brand search, shelf fit, unit conversion, and purchase preview.

The local VM cannot resolve `github.com`, so publication and branch verification use the connected GitHub API rather than GitHub Actions or a normal `git push`.

## Data/research lessons
Good records need a stable manufacturer/brand + model/SKU identity. A second store selling the same item is an offer, not a second product. Put seller-specific SKUs, pack/color variants that share the same physical identity, and additional retailer URLs in `data/offers.json`.

Do not reject a current sellable SKU solely because the retailer omits physical dimensions. Keep unpublished facts `null`; only the fit engine requires positive external dimensions.

Catalog mining is sharded. Keep source families in separate shard files so parallel workers can add products without editing the same data file; reconcile only `data/catalog.json` at integration time. Validate globally for duplicate IDs and duplicate brand/model identities.

`research/retailer-coverage.json` is now the source of truth for exhaustive retailer progress. A retailer remains active until every in-scope sellable SKU or variant has been enumerated or given an explicit blocked/seasonal/marketplace outcome. A representative SKU or completed batch is not retailer completion.

When another worker advances `main`, do not merge a stale manifest wholesale. Reconcile by product identity and retain the stronger/newer source record before adding only genuinely new identities.

Do not derive missing capacity, weight, material, interior dimensions, waterproofness, or liquid capability from a nearby SKU. Preserve conflicts and source qualifiers in notes.

## Next useful research work
1. Continue each requested retailer from `research/retailer-coverage.json` until its enumeration is actually complete.
2. Prioritize Walmart and Target because their storage/marketplace inventories are broad and change frequently.
3. Continue Home Depot HDX/marketplace and Lowe's Project Source/COMMANDER families.
4. Mine H-E-B, Tom Thumb, Safeway, and Brookshire's reusable food-storage/household container categories without requiring dimensions as an admission gate.
5. Expand Hobby Lobby and Michaels craft-storage cases, organizers, crates, and bins.
6. Finish Container Store and Ace remaining tote/bin/box families.
7. Continue direct-manufacturer breadth for IRIS, Cambro, Quantum, Buckhorn, Uline, and related US-sellable families.
8. Add stale-record refresh tooling and field-level provenance as catalog size grows.

## Deployment
There are no GitHub Actions credits available for this project and deployment must not depend on Actions. The site is already raw static content. Keep `main` as source of truth and `gh-pages` on the same verified commit while no build step exists.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid generated filler and comments that merely restate code. Favor auditable data and deterministic search behavior. Each session should leave the codebase, data quality, coverage ledger, tests, or research checkpoint measurably better than it found them.
