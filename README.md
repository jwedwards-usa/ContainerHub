# ContainerHub

A static, source-backed catalog for comparing plastic containers by real dimensions and shelf fit. No backend and no build step are required.

**Live site:** https://jwedwards-usa.github.io/ContainerHub/

## What works
- Search across brand, model/SKU, material, closure, category, color, notes, source retailer, and additional seller offers.
- Filter by brand, lid, transparency and wheels.
- Enter shelf width, depth and height to rank containers by how many identical units fit.
- Keep sellable products with unpublished external dimensions in the catalog; they stay searchable and purchasable but are excluded from fit ranking.
- Rotate containers on their base by default; tipping onto a side is explicitly opt-in.
- Toggle imperial and metric display while canonical catalog data stays metric.
- Compare external dimensions, internal dimensions when published, capacity and empty weight when published.
- Open the source specification, preview the primary purchase page, or follow additional retailer offers for the same product identity.

The catalog currently contains **159 verified product records across 23 shards**, plus **9 additional retailer/pack offers**. Retailer enumeration is tracked in `research/retailer-coverage.json`; no retailer is marked exhaustive until every in-scope sellable SKU or variant has an explicit outcome.

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
`data/catalog.json` is the catalog manifest; each listed JSON file is a deployable product shard using `data/schema.json`. Additional sellers for an existing product live in `data/offers.json` rather than duplicate product records. Measurements are canonicalized to millimeters, milliliters and grams. Unknown values are `null`, never estimates. See `AGENTS.md` for the research rules.

Generated SVG thumbnails are dimensional schematics rather than product photography. They average well under 1 KB each and keep the initial catalog usable on low-bandwidth connections.
