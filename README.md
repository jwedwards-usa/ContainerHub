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
- Open source specifications, primary purchase pages, and additional retailer offers.

The catalog currently contains **275 verified product records across 39 shards**, plus **11 additional retailer/pack offers**. It preserves the coordinated Sterilite, IRIS, Akro-Mils, Rubbermaid, Cambro, Quantum, Uline, Really Useful Box and Buckhorn families, including all 13 current Uline Clear Plastic Shelf Bin sizes recovered from the interrupted worker branch.

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
`data/catalog.json` is the manifest; each listed JSON file is a product shard using `data/schema.json`. Additional sellers for an existing product live in `data/offers.json` rather than duplicate product records. Measurements are canonicalized to millimeters, milliliters and grams. Unknown values are `null`, never estimates. See `AGENTS.md` for research rules.

Generated SVG thumbnails are dimensional schematics rather than product photography and keep the catalog usable on low-bandwidth connections.
