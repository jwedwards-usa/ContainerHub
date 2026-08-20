# ContainerHub

A static, source-backed catalog for comparing plastic containers by real dimensions and shelf fit. No backend and no build step are required.

**Live site:** https://jwedwards-usa.github.io/ContainerHub/

## What works
- Search across brand, model/SKU, material, closure, category, color and notes.
- Filter by brand, lid, transparency and wheels.
- Enter shelf width, depth and height to rank containers by how many identical units fit.
- Rotate containers on their base by default; tipping onto a side is explicitly opt-in.
- Toggle imperial and metric display while canonical catalog data stays metric.
- Compare external dimensions, internal dimensions when published, capacity and empty weight when published.
- Open the source specification or preview the purchase page with a new-tab fallback for stores that block iframes.

The catalog currently contains 196 verified products across 27 manufacturer and retailer shards. Recent coordinated waves complete Cambro Classic CamRounds in clear Camwear polycarbonate, translucent polypropylene, and natural-white polyethylene; add FreshPro CamSquares; complete the current Quantum QUS sequence; and add Uline Clear Industrial Totes.

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

`npm run check` validates catalog invariants and runs the fit/search unit tests. The Playwright smoke test uses an in-memory bundle so it also runs in network-restricted environments.

## Data
`data/catalog.json` is the catalog manifest; each listed JSON file is a deployable shard using `data/schema.json`. Measurements are canonicalized to millimeters, milliliters and grams. Unknown values are `null`, never estimates. See `AGENTS.md` and `HANDOFF.md` for research and coordination rules.

Generated SVG thumbnails are dimensional schematics rather than product photography. They keep the catalog usable on low-bandwidth connections.
