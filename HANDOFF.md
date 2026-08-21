# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a static GitHub Pages catalog with no backend and no required build step. The 2026-08-20 branch reconciliation produced **1,076 unique source-backed product records across 67 product shards**, plus **12 retailer/pack/configuration offers** in `data/offers.json`. Run `npm run validate` for the current counts because parallel mining changes them frequently.

The reconciliation starts from the coordinated product tree, preserves richer records when branches overlap, and adds only identities absent from that tree. In particular, richer Uline bottle/jug/tank records were retained instead of being replaced by sparse index variants. `research/branch-reconciliation-2026-08-20.md` records the union and duplicate handling.

## Catalog behavior
The UI supports weighted free-text search across identity, taxonomy, source/purchase retailer and offers; brand/lid/translucency/wheel filters; imperial/metric conversion; source and purchase links; product-preview dialogs with retained direct buy links; additional seller links; lightweight SVG schematics; progressive rendering for large result sets; outside/inside dimensional search; and standard paper/file fit flags derived from published internal dimensions.

Sellable products may have `external_mm: null` or `internal_mm: null` when geometry is unpublished. They remain searchable and purchasable but are excluded only from the geometric mode that needs the missing measurement. Grouped, compact, index and tabular shards expand to the same runtime record shape.

`data/catalog.json` is the authoritative shard manifest. Unknown product facts stay `null`; never infer values from adjacent sizes or related models.

## Geometry/search v3
Dimensional search has two explicit modes:

- **Outside dimensions — fit into a space** uses `external_mm`. The entered width/depth/height is the maximum shelf/cubby envelope. True fits sort above near misses and the default score prefers the closest fitting outside geometry.
- **Inside dimensions — hold an item** uses `internal_mm`. The entered width/depth/height is the minimum usable interior required. The ratios reverse so the smallest qualifying interior ranks highest. Missing interiors never pass fit-only. Shelf-combination planning and `Most per shelf` / `Footprint use` are disabled in this mode.

Every allowed orientation is evaluated. Base rotation is automatic; tipping is opt-in. In inside mode the tipping option means the required item envelope may use a different vertical axis.

The standard-format layer is intentionally conservative and never substitutes external dimensions for missing interiors:
- US Letter: 215.9 × 279.4 mm.
- US Legal: 215.9 × 355.6 mm.
- A4: 210 × 297 mm.
- Standard letter hanging-file envelope: 12.75 in horizontal rod span and 9.25 in upright folder-body height. This is an envelope-fit badge only; it does not claim the container has rails or file-support hardware.

Paper flags use the internal base footprint with 90° rotation. Clearly round/cylindrical interiors require the paper diagonal to fit the published internal diameter rather than using the circle's bounding box. Standard-fit labels also participate in weighted text search and are available as a dedicated filter.

The hanging-file dimensions are based on a Pendaflex letter hanging folder listing that publishes a 12.75 in rod and 11.75 × 9.25 in folder body. A4 follows ISO 216; US Letter/Legal use the common 8.5 × 11 in / 8.5 × 14 in dimensions.

## Geometry/search v2 foundation
Outside/shelf dimensions trigger closest-size ranking by default. True fits always sort above near misses, then the best orientation is scored from geometric-mean axis fill, worst-axis fill, average fill and dimensional balance. This prevents tiny containers from winning merely because many copies fit.

Alternative external sort modes remain explicit:
- `Most per shelf` maximizes safely counted repeated units.
- `Footprint use` maximizes one-layer floor coverage.
- `A–Z` removes geometric ranking.

Vertical layers count only when `stackable === true`. A product with `stackable: false` or `stackable: null` contributes one layer to the packed count. The fit object retains the purely geometric possible layer count separately for diagnostics.

Text search is token-aware and weighted. Exact model/SKU and seller-SKU matches receive the strongest scores, followed by name, brand, category/material, construction and descriptive/source fields. All query tokens must match somewhere, so a query can span fields without becoming a broad substring OR.

Outside shelf searches also generate up to three **one-layer combination plans**. The planner builds physically valid top-down rows, allows base rotation, mixes up to three product identities, and uses bounded beam search to balance footprint coverage, depth use, height harmony and SKU simplicity. The UI presents each plan as a scaled shelf mosaic with a clickable product legend. The planner never assumes vertical stacking.

Only the first 60 result cards render initially; the full match count stays visible and `Show more` adds cards in 60-item batches.

## Verification
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

`tests/geometry.test.mjs` covers closest-fit ranking, pack-sort compatibility, near-miss ordering, internal-fit ranking and fit-only behavior, exact SKU/model relevance, cross-field token search, US Letter/Legal/A4 flags, hanging-file envelope flags, round-interior paper geometry, conservative non-stackable layer counting, and physical bounds for mixed shelf plans.

The browser smoke test derives its initial render count from the manifest and verifies progressive rendering, standard-format filtering, internal-dimension search, offer search, null-dimension exclusion, seller links, preview navigation, legacy SKU/material/brand search, shelf fit, shelf-plan rendering and unit conversion.

A synthetic 10,000-record benchmark on the documented VM measured about 196 ms for the first weighted shelf search, 50 ms after search-index caching, and 94 ms for shelf-plan generation. These are observations, not strict thresholds.

The current execution VM cannot reliably resolve `github.com`, so publication and branch verification use the connected GitHub API rather than GitHub Actions or a normal `git push`.

## Reconciliation result
A full branch inventory found 61 branches before final product integration. Most historical worker/integration branches were already strict ancestors of `main` or identical. Five divergent late branches were reconciled at product identity level:

- `catalog/final-1000-plus-20260820`: retained non-overlapping industrial and food/refuse models; overlapping sparse bottles were superseded by richer records.
- `catalog/integration-902-bottles-jugs-20260820`: retained detailed jug, jerrican, carboy and tank records.
- `catalog/bulk-wave-1-572-20260820`: overlapping bin, jar, bottle and Akro identities were already represented by stronger current shards; detailed jug content was preserved through the reconciled jug shard.
- `catalog/scale-1000-20260820`: Akro-Mils identities were already represented by the stronger current bulk wave.
- `catalog/1000-product-expansion-20260820`: overlapping bottle, jar and Sterilite identities were already represented; otherwise-missing Uline-family models were recovered.

Do not reintroduce superseded sparse duplicates when mining or reconciling future branches.

## Data and sourcing rules
Prefer manufacturer specifications, then established retailers that clearly match the same model or SKU. Capture external and internal dimensions separately and preserve source qualifiers. Do not derive missing capacity, material, load rating, internal dimensions, empty weight, waterproofness or liquid capability from neighboring products.

A second retailer, pack, color-only variant, or accessory configuration using the same physical product belongs in `data/offers.json` rather than becoming a duplicate product.

Do not reject a current sellable SKU solely because physical dimensions are unpublished. Geometric modes should degrade independently: outside search requires `external_mm`; inside search and standard-fit badges require `internal_mm`.

Keep source families in separate shard files so future workers can add products without editing the same data file. Reconcile `data/catalog.json` at integration time. If `main` advances, rebuild from the newer tree and retain the stronger/newer duplicate before adding only genuinely new identities.

`research/retailer-coverage.json` remains the source of truth for exhaustive retailer progress.

## Next useful work
1. Enrich index-first Uline and Sterilite records with model-specific external **and internal** dimensions and material/capacity/closure facts from canonical pages; inside search benefits directly from interior coverage.
2. Continue every requested retailer from `research/retailer-coverage.json` until enumeration is actually complete.
3. Prioritize Walmart, Target, Home Depot and Lowe's because their inventories are broad and change frequently.
4. Continue H-E-B, Tom Thumb, Safeway, Brookshire's, Hobby Lobby, Michaels, The Container Store and Ace.
5. Expand IRIS USA, Quantum non-QUS, Buckhorn modular/bulk and remaining Cambro food-storage families.
6. Add stale-record refresh tooling and field-level provenance as catalog size grows.
7. If shelf planning becomes a major workflow, add user-selectable planning objectives such as fewest SKUs versus maximum coverage without changing the deterministic geometry primitives.

## Deployment
There are no GitHub Actions credits available. The site is raw static content. Keep `main` as source of truth and advance `gh-pages` through normal Git history to the exact same verified tree; never force shared refs.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid filler and comments that merely restate code. Favor auditable data and deterministic behavior. Leave data quality, coverage, tests or research checkpoints measurably better than you found them.
