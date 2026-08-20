# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a working static GitHub Pages catalog with no backend and no required build step. The coordinated catalog contains 180 source-backed products across 25 shards.

The catalog now includes the original manufacturer/retailer waves, 16 Buckhorn straight-wall totes, 21 Cambro CamSquares Classic containers, eight Cambro Camwear CamRounds, 16 Cambro CamSquares FreshPro containers, a completed 22-model Quantum QUS standard/mobile family, and eight Uline Clear Industrial attached-lid totes.

The FreshPro square wave adds translucent polypropylene mini 0.5 qt and 1 qt containers plus 2–22 qt translucent polypropylene and clear Camwear polycarbonate families. FreshPro geometry, recessed handles, material, and dimensions come from current Cambro specifications; model-matched current WebstaurantStore pages provide direct purchase links. FreshPro covers are sold separately and are not interchangeable with Classic CamSquares.

The Quantum expansion adds the 17 QUS models missing from the initial five-record seed, through QUS270 plus the wheeled QUS275MOB. Current manufacturer dimensions and model pages are used directly. Standard and clear-view variants with different published load ratings are kept distinct in notes, and models without a published load rating remain null.

The Uline expansion covers all eight current Clear Industrial Tote sizes. Exterior dimensions use Uline's outside-top measurements. Internal length and width use the conservative bottom footprint while height uses the published inside-top height. `max_load_g` stores Uline's contents-weight capacity, not the much larger stacking-strength figure. Empty tote weights are captured from current product listings.

The retailer coverage includes The Container Store, Target, Walmart, Ace Hardware, The Home Depot, Lowe's, H-E-B, Hobby Lobby, Michaels, Brookshire's, IRIS USA, Uline, Really Useful Box, KaTom Restaurant Supply, and WebstaurantStore, with manufacturer/direct-source families from Sterilite, Cambro, Quantum Storage Systems, Akro-Mils, Rubbermaid Commercial, and Buckhorn. Tom Thumb and Safeway remain blocked because indexed listings have not exposed exact SKU-level external dimensions needed for shelf fit.

The UI supports free-text search, brand/lid/translucency/wheel filters, imperial/metric conversion, shelf width/depth/height fit search, orientation handling, fit ranking, source and purchase links, iframe purchase previews with fallback, and lightweight dimensional SVG thumbnails.

`data/catalog.json` lists 25 catalog shards. All shards use `data/schema.json`. Unknown product facts stay `null`; values are not inferred from adjacent sizes.

## Verification
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

The expected catalog validator result after this coordinated wave is 180 records / 180 unique IDs across 25 shards. Connected GitHub comparisons are used immediately before publication to detect concurrent branch movement and reconcile manifests. The current VM cannot reliably resolve `github.com`, so publication and branch verification use the connected GitHub API; rerun the local validator/browser commands from a network-independent checkout when available.

## Data and coordination rules
Prefer manufacturer specifications, then established retailers that clearly match the same model or SKU. Capture external and internal dimensions separately and retain qualifiers when dimensions are measured at the top, bottom, usable interior, or with an accessory cover installed.

Keep source families in separate shard files so parallel workers can add products without editing the same data file. Reconcile only `data/catalog.json` at integration time. If another worker advances `main`, build the integration tree from the new `main`; never replace its manifest with a stale feature-branch manifest. If another worker lands the same family first, abandon the overlap and move to a different family.

Do not derive missing capacity, weight, material, load rating, or interior dimensions from a neighboring size. Do not treat gasketed moisture resistance as liquid containment unless the source explicitly supports it. For Uline, distinguish contents capacity from stacking strength. For Quantum, distinguish standard QUS models from clear-view variants when ratings differ.

## Deployment
There are no GitHub Actions credits available. The site is raw static content, so no production build is required. Publish source-of-truth content to `main` and the same static tree to `gh-pages` through normal Git history/PRs; do not force shared refs.

## Next useful work
1. Resolve Tom Thumb and Safeway with exact SKU-to-dimension matches.
2. Continue exhaustive SKU mining at Target, Walmart, Lowe's, Home Depot, Michaels, Hobby Lobby, The Container Store, and Ace.
3. Expand Buckhorn into attached-lid and bulk containers.
4. Expand Cambro into translucent CamRounds, FreshPro CamRounds, CamSquare Seal Covers where they are sold as container kits, and additional food-storage families.
5. Expand Quantum beyond QUS into other bin families with stable model-level dimensions.
6. Expand Uline into additional attached-lid, bulk, crate, shelf-bin, and liquid-capable families.
7. Add direct retailer purchase joins for manufacturer-only records where exact model matching is available.
8. Add field-level provenance and stale-record refresh tooling as the catalog grows.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid filler and comments that merely restate code. Favor auditable data and deterministic search behavior. Each session should leave data quality, coverage, tests, or research checkpoints measurably better than it found them.
