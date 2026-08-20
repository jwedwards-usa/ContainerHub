# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a static GitHub Pages catalog with no backend and no required build step. The coordinated catalog contains 196 source-backed products across 27 shards.

The current tree preserves all prior manufacturer and retailer waves. Recent coordinated work adds 16 FreshPro CamSquares, completes the Quantum QUS sequence with 17 more models, adds all eight Uline Clear Industrial attached-lid totes, and completes all three Cambro Classic CamRound material families.

### Cambro Classic CamRounds
The CamRounds catalog now covers every 1, 2, 4, 6, 8, 12, 18, and 22 qt size in clear Camwear polycarbonate, translucent polypropylene, and natural-white polyethylene. Current Cambro specifications provide capacities, diameters, materials, and heights. Model-matched KaTom pages provide direct purchase links. Diameter is stored as both length and width for shelf-fit calculations. Cambro publishes height with the compatible cover installed while covers are sold separately, so that qualifier is retained in every record. Case/shipping weights are not treated as individual empty-container weights.

### Cambro FreshPro CamSquares
FreshPro coverage includes translucent polypropylene mini 0.5 qt and 1 qt containers plus 2–22 qt translucent polypropylene and clear Camwear polycarbonate families. FreshPro uses its own cover system and geometry; covers are sold separately and are not interchangeable with Classic CamSquares.

### Quantum QUS and Uline Clear Industrial
The Quantum expansion completes the current standard/mobile QUS sequence through QUS270 plus QUS275MOB, preserving model-specific load ratings. The Uline expansion covers all eight current Clear Industrial Tote sizes using outside-top dimensions, conservative bottom interior footprints, published inside heights, and individual empty weights where sourced.

The UI supports free-text search, brand/lid/translucency/wheel filters, imperial/metric conversion, shelf fit and orientation handling, ranked fit counts, source/purchase links, iframe purchase previews with fallback, and lightweight SVG thumbnails.

`data/catalog.json` lists 27 shards. All shards use `data/schema.json`. Unknown product facts stay `null`; do not infer values from adjacent sizes.

## Verification
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

The expected catalog validator result is 196 records / 196 unique IDs across 27 shards. Compare `main` immediately before integration and publication. If another worker advances it, rebuild the integration tree from the new `main`; never replace a newer manifest with a stale feature-branch manifest. If another worker lands the same family first, abandon the overlap and move to a different family.

## Data and sourcing rules
Prefer manufacturer specifications, then established retailers that clearly match the same model or SKU. Capture external and internal dimensions separately and preserve qualifiers such as top/bottom measurements or dimensions with an accessory cover. Do not derive missing capacity, material, load rating, internal dimensions, or empty weight from neighboring products. Do not use case/shipping weight as tare unless the source explicitly identifies individual product weight.

A retailer can be the purchase source while a manufacturer is the stronger specification source; document that join. Do not treat gasketed moisture resistance as proof of liquid containment without an explicit claim.

Tom Thumb and Safeway remain unresolved because indexed listings have not exposed exact SKU-level external dimensions required for shelf fit.

## Deployment
There are no GitHub Actions credits available. The site is raw static content. Publish source-of-truth content to `main` and the same static tree to `gh-pages` through normal Git history; preserve separate `gh-pages` publication history with merge commits and never force shared refs.

## Next useful work
1. Resolve Tom Thumb and Safeway with exact SKU-to-dimension matches.
2. Continue exhaustive SKU mining at Target, Walmart, Lowe's, Home Depot, Michaels, Hobby Lobby, The Container Store, and Ace.
3. Expand Buckhorn into attached-lid and bulk containers.
4. Expand Cambro into FreshPro CamRounds and additional food-storage families.
5. Expand Quantum beyond QUS into other dimensioned bin families.
6. Expand Uline into additional attached-lid, bulk, crate, shelf-bin, and liquid-capable families.
7. Add field-level provenance and stale-record refresh tooling.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid filler and comments that merely restate code. Favor auditable data and deterministic behavior. Leave data quality, coverage, tests, or research checkpoints measurably better than you found them.
