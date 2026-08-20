# ContainerHub

A static, source-backed catalog for comparing plastic containers by real dimensions and shelf fit. No backend and no build step are required.

**Live site:** https://jwedwards-usa.github.io/ContainerHub/

## What works
- Search across brand, model/SKU, material, closure, category, color, notes, source retailer, and additional seller offers.
- Filter by brand, lid, transparency and wheels.
- Enter shelf width, depth and height to rank containers by how many identical units fit.
- Keep sellable products with unpublished external dimensions searchable and purchasable while excluding them from fit ranking.
- Rotate containers on their base by default; tipping onto a side is opt-in.
- Toggle imperial and metric display while canonical catalog data stays metric.
- Compare external dimensions, internal dimensions, capacity and empty weight when published.
- Open source specifications, product previews, primary purchase pages, and additional retailer offers.

The catalog currently contains **1,022 source-backed product records across 60 shards**, plus **12 additional retailer/pack/configuration offers**. Recent breadth waves add current Sterilite manufacturer-index products, Akro-Mils storage bins, Uline bins/totes/jars, and 205 additional Uline bottle, jug, drum, stack/nest, crate, food and waste-container models while preserving the detailed manufacturer and retailer records already in the coordinated catalog.

Retailer enumeration is tracked in `research/retailer-coverage.json`; no retailer is marked exhaustive until every in-scope sellable SKU or variant has an explicit outcome.

## Run locally
```sh
python3 -m http.server 4173
```
Open `http://localhost:4173`.

## Verify
```sh
npm run check
python3 tests/browser_test.py
```

`npm run check` validates catalog invariants and retailer offers, then runs the fit/search unit tests. The Playwright smoke test uses an in-memory bundle so it also runs in network-restricted environments.

## Data
`data/catalog.json` is the manifest; listed shards may use detailed records, compact/index records, or grouped tabular rows expanded by `src/catalog.js`. Additional sellers, packs, or configurations for an existing physical product live in `data/offers.json` rather than duplicate product records. Measurements are canonicalized to millimeters, milliliters and grams. Unknown values are `null`, never estimates. See `AGENTS.md` for research rules.

Generated SVG thumbnails are dimensional schematics rather than product photography and keep the catalog usable on low-bandwidth connections.
