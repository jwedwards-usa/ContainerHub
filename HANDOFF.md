# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a static GitHub Pages catalog with no backend and no required build step. The coordinated catalog contains 208 source-backed products across 29 shards.

The current tree preserves all prior manufacturer and retailer waves. Recent coordinated work adds 16 FreshPro CamSquares, completes the Quantum QUS sequence with 17 more models, adds all eight Uline Clear Industrial attached-lid totes, completes all three Cambro Classic CamRound material families, completes the six-size Akro-Mils Attached Lid Container family, and adds eight current Buckhorn attached-lid totes with direct US distributor purchase listings.

### Cambro Classic CamRounds
The CamRounds catalog covers every 1, 2, 4, 6, 8, 12, 18, and 22 qt size in clear Camwear polycarbonate, translucent polypropylene, and natural-white polyethylene. Current Cambro specifications provide capacities, diameters, materials, and heights. Model-matched KaTom pages provide direct purchase links. Diameter is stored as both length and width for shelf-fit calculations. Cambro publishes height with the compatible cover installed while covers are sold separately, so that qualifier is retained. Case/shipping weights are not treated as individual empty-container weights.

### Cambro FreshPro CamSquares
FreshPro coverage includes translucent polypropylene mini 0.5 qt and 1 qt containers plus 2–22 qt translucent polypropylene and clear Camwear polycarbonate families. FreshPro uses its own cover system and geometry; covers are sold separately and are not interchangeable with Classic CamSquares.

### Quantum QUS and Uline Clear Industrial
The Quantum expansion completes the current standard/mobile QUS sequence through QUS270 plus QUS275MOB, preserving model-specific load ratings. The Uline expansion covers all eight current Clear Industrial Tote sizes using outside-top dimensions, conservative bottom interior footprints, published inside heights, and individual empty weights where sourced.

### Akro-Mils Attached Lid Containers
The Akro-Mils ALC family is complete across models 39085, 39120, 39160, 39170, 39175, and 39280. The four larger sizes use current Akro-Mils model/family specifications and current model-matched U.S. Plastic purchase pages. Bottom interior footprints are stored with published inside heights, and individual tare weights come from current retailer listings.

### Buckhorn Attached Lid Containers
The Buckhorn attached-lid wave adds AC21150902, AC21151202, AR20120702, AR24201202, AR27171202, AS22131202, AS28211502, and AS34242012. Current Buckhorn model pages supply outside-top dimensions, inside-bottom dimensions, usable heights, capacities, load limits, tare weights, lid type, colors, and bottom construction. Current Custom Material Handling Solutions listings provide model-level US purchase entries and identify the family as HDPE. Recessed-lid and strapping-lid models remain distinct. Solid-bottom leakage resistance is not treated as proof of liquid containment.

The UI supports free-text search, brand/lid/translucency/wheel filters, imperial/metric conversion, shelf fit and orientation handling, ranked fit counts, source/purchase links, iframe purchase previews with fallback, and lightweight SVG thumbnails.

`data/catalog.json` lists 29 shards. All shards use `data/schema.json`. Unknown product facts stay `null`; do not infer values from adjacent sizes.

## Verification
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

The expected catalog validator result is 208 records / 208 unique IDs across 29 shards. Compare `main` immediately before integration and publication. If another worker advances it, rebuild the integration tree from the new `main`; never replace a newer manifest with a stale feature-branch manifest. Keep source-family commits manifest-free when practical so they remain reusable across concurrent manifest changes. If another worker lands the same family first, abandon the overlap and move to a different family.

The current VM cannot reliably resolve `github.com`, so publication and branch verification use the connected GitHub API. Rerun local validator/browser commands from a network-independent checkout when available.

## Data and sourcing rules
Prefer manufacturer specifications, then established retailers that clearly match the same model or SKU. Capture external and internal dimensions separately and preserve qualifiers such as top/bottom measurements or dimensions with an accessory cover. Do not derive missing capacity, material, load rating, internal dimensions, or empty weight from neighboring products. Do not use case/shipping weight as tare unless the source explicitly identifies individual product weight.

A retailer can be the purchase source while a manufacturer is the stronger specification source; document that join. Do not treat gasketed moisture resistance or leakage-resistant solid construction as proof of liquid containment without an explicit claim.

Tom Thumb and Safeway remain unresolved because indexed listings have not exposed exact SKU-level external dimensions required for shelf fit.

## Deployment
There are no GitHub Actions credits available. The site is raw static content. Publish source-of-truth content to `main` and the same static tree to `gh-pages` through normal Git history; preserve separate `gh-pages` publication history with merge commits and never force shared refs.

## Next useful work
1. Resolve Tom Thumb and Safeway with exact SKU-to-dimension matches.
2. Continue exhaustive SKU mining at Target, Walmart, Lowe's, Home Depot, Michaels, Hobby Lobby, The Container Store, and Ace.
3. Expand Buckhorn into modular nesting and bulk containers.
4. Expand Akro-Mils into Akro-Grid, Nest & Stack, Straight Wall, and KeepBox families.
5. Expand Cambro into FreshPro CamRounds and additional food-storage families.
6. Expand Quantum beyond QUS into other dimensioned bin families.
7. Expand Uline into additional attached-lid, bulk, crate, shelf-bin, and liquid-capable families.
8. Add field-level provenance and stale-record refresh tooling.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid filler and comments that merely restate code. Favor auditable data and deterministic behavior. Leave data quality, coverage, tests, or research checkpoints measurably better than you found them.
