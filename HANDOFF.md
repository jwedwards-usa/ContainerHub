# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a static GitHub Pages catalog with no backend and no required build step. The coordinated catalog is split across many product shards plus retailer/pack/configuration offers in `data/offers.json`. Do not hard-code a record count in handoff text; run `npm run validate` for the current counts because parallel mining changes them frequently.

The all-worker reconciliation preserves the manufacturer/industrial waves, retailer breadth waves, five recovered Really Useful Box sizes, the Uline shelf-bin recovery, the full standard Cambro FreshPro CamRound family, the Akro-Grid recovery, the complete current Akro-Mils Nest & Stack Tote family, all 12 current Akro-Mils Straight Wall configurations, both current KeepBox sizes, and nine additional Brightroom products from Target wave 3.

Recent manufacturer and industrial coverage includes the six-size Akro-Mils Attached Lid Container family, 12 Akro-Grid dividable boxes, all nine current Nest & Stack Totes, all 12 current Straight Wall Containers, both current KeepBoxes, Buckhorn straight-wall and eight attached-lid totes, all three Cambro Classic CamRound material families, Classic and FreshPro CamSquares, seven standard FreshPro CamRounds, the Quantum QUS sequence through QUS275MOB, eight Uline Clear Industrial attached-lid totes, 13 Uline Clear Plastic Shelf Bins, and Really Useful Box sizes through 64 L.

The Target Brightroom wave 3 adds nine unique TCINs: a 12-gallon latching tote; a 4 L clear stacking bin; medium and large frosted latching boxes; a 20-gallon heavy-duty waterproof tote; medium, large and XL IP67/sealed boxes; and a 40-gallon wheeled heavy-duty tote. Code search against the coordinated catalog found no existing matches for any of the nine TCINs before integration.

The Straight Wall wave covers models 37208, 37278, 37288, 37608, 37612, 37616, 37672, 37676, 37678, 37682, 37686 and 37688 across all-mesh, solid-bottom/mesh-side and all-solid configurations. The KeepBox wave adds 66486CLDBL and 66497CLDGN; the 66486FILEB hanging-file configuration shares the 12-gallon physical box and is stored as an offer rather than a duplicate product.

Reconciled retailer additions cover The Container Store, Ace, Lowe's, Target, Home Depot, Tom Thumb and Safeway. Product identity and seller identity are separate: duplicate retailer listings and pack/color/configuration offers belong in `data/offers.json`.

## Catalog behavior
The UI supports weighted free-text search across identity, taxonomy, source/purchase retailer and offers; brand/lid/translucency/wheel filters; imperial/metric conversion; source and purchase links; product-preview dialogs with retained direct buy links; additional seller links; lightweight SVG schematics; and progressive rendering for large result sets.

### Geometry/search v2
Shelf dimensions now trigger **closest-size ranking by default**. Every base orientation is evaluated against the entered width/depth/height. True fits always sort above near misses, then the best orientation is scored from geometric-mean axis fill, worst-axis fill, average fill and dimensional balance. This prevents tiny bins from winning simply because many copies fit.

Alternative sort modes remain explicit:
- `Most per shelf` maximizes safely counted repeated units.
- `Footprint use` maximizes one-layer floor coverage.
- `A–Z` removes geometric ranking.

Vertical layers count only when `stackable === true`. A product with `stackable: false` or `stackable: null` contributes one layer to the packed count. The fit object still records the purely geometric possible layer count separately for diagnostics.

Text search is token-aware and weighted. Exact model/SKU and seller-SKU matches receive the strongest scores, followed by name, brand, category/material, construction and descriptive/source fields. All query tokens must match somewhere, so queries such as `Sterilite HDPE` can match across separate fields without devolving to a broad substring OR.

Shelf searches also generate up to three **one-layer combination plans**. The planner builds physically valid top-down rows, allows base rotation, mixes up to three product identities, and uses bounded beam search to balance footprint coverage, depth use, height harmony and SKU simplicity. The UI shows each plan as a scaled shelf mosaic with a clickable legend. It never assumes vertical stacking.

Only the first 60 result cards are rendered initially; the full match count remains visible and `Show more` adds cards in 60-item batches. This is important now that catalog breadth is much larger than the original seed.

Sellable products may have `external_mm: null` when geometry is unpublished. They remain searchable and purchasable but are excluded from shelf-fit calculations.

`data/catalog.json` is the authoritative shard manifest. Unknown product facts stay `null`; never infer values from adjacent sizes.

## Verification
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

`tests/geometry.test.mjs` covers closest-fit ranking, pack-sort compatibility, near-miss ordering, exact SKU/model relevance, cross-field token search, conservative non-stackable layer counting, and physical bounds for mixed shelf plans.

The browser smoke test derives its initial render count from the manifest and verifies offer search, null-dimension fit exclusion, retailer link rendering, preview navigation, legacy SKU/material/brand search, shelf fit and unit conversion. Keep it compatible with progressive card rendering and the shelf-plan panel.

A synthetic 10,000-record benchmark on the documented VM measured about 196 ms for the first weighted shelf search, 50 ms after search-index caching, and 94 ms for shelf-plan generation. These are observations, not strict thresholds.

The VM cannot reliably resolve `github.com`, so publication and branch verification use the connected GitHub API rather than GitHub Actions or a normal `git push`.

## Data and sourcing rules
Prefer manufacturer specifications, then established retailers that clearly match the same model or SKU. Capture external and internal dimensions separately and preserve source qualifiers. Do not derive missing capacity, material, load rating, internal dimensions, empty weight, waterproofness or liquid capability from neighboring products.

A second retailer, pack, or accessory configuration using the same physical product is an offer, not a duplicate product. Keep seller-specific SKUs and additional purchase URLs in `data/offers.json`.

Do not reject a current sellable SKU solely because physical dimensions are unpublished. Only the fit engine requires positive external dimensions.

Keep source families in separate shard files so parallel workers can add products without editing the same data file. Reconcile `data/catalog.json` at integration time. If `main` advances, rebuild from the newer tree and retain the stronger/newer duplicate before adding only genuinely new identities.

`research/retailer-coverage.json` is the source of truth for exhaustive retailer progress. A retailer remains active until every in-scope sellable SKU or variant has an explicit completed, blocked, seasonal, marketplace, unavailable or duplicate-product outcome.

## Next useful work
1. Continue every requested retailer from `research/retailer-coverage.json` until enumeration is actually complete.
2. Continue Target beyond the newly merged Brightroom wave, and prioritize Walmart because both inventories are broad and change frequently.
3. Continue Home Depot HDX/marketplace and Lowe's Project Source/COMMANDER families.
4. Mine H-E-B, Tom Thumb, Safeway and Brookshire's reusable food-storage and household container categories without requiring dimensions as an admission gate.
5. Expand Hobby Lobby and Michaels craft-storage cases, organizers, crates and bins.
6. Finish Container Store and Ace remaining tote/bin/box families.
7. Continue Buckhorn modular nesting/bulk, Cambro FreshPro pails/other food-storage families, Quantum non-QUS, Uline families beyond Clear Industrial/Clear Shelf Bins, IRIS direct-manufacturer breadth, and additional Akro-Mils families beyond Attached Lid/Akro-Grid/Nest & Stack/Straight Wall/KeepBox.
8. Add stale-record refresh tooling and field-level provenance as catalog size grows.
9. If shelf planning becomes a major workflow, add user-selectable planning objectives (fewest SKUs vs maximum coverage) without changing the deterministic geometry primitives.

## Deployment
There are no GitHub Actions credits available. The site is raw static content. Keep `main` as source of truth and advance `gh-pages` through normal Git history to the same verified static tree; never force shared refs.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid filler and comments that merely restate code. Favor auditable data and deterministic behavior. Leave data quality, coverage, tests or research checkpoints measurably better than you found them.
