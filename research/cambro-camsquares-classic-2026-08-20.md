# Cambro CamSquares Classic research checkpoint — 2026-08-20

## Scope
Added 21 current CamSquare Classic food-storage containers: seven white polyethylene, seven translucent polypropylene, and seven clear Camwear polycarbonate models in 2, 4, 6, 8, 12, 18, and 22 quart capacities.

## Manufacturer sources
- Polyethylene: https://www.cambro.com/Products/food-storage/square-food-storage-containers/camsquares-classic-food-storage-containers/camsquares-poly/
- Translucent polypropylene: https://www.cambro.com/Industries/catering/food-storage/camsquares-translucent/
- Camwear polycarbonate: https://www.cambro.com/Products/food-storage/square-food-storage-containers/camsquares-classic-food-storage-containers/camsquares-camwear/

Cambro's current tables provide model families, capacities, resin/color variants, and exterior dimensions. The listed dimensions are explicitly published with the compatible cover installed even though covers are sold separately, so every record preserves that qualifier in `notes`.

## Purchase matching
Each record uses a model-matched KaTom Restaurant Supply product page with the exact color/resin suffix: `148` for white polyethylene, `190` for translucent polypropylene, and `135` for clear Camwear polycarbonate.

Purchase URL pattern: `https://www.katom.com/144-<MODEL>.html`

All 21 exact SKU pages were checked on 2026-08-20 before inclusion.

## Data decisions
- Current Cambro dimensions are used rather than older catalog dimensions when they differ. In particular, the current 12 qt table lists 8.25 in height.
- `internal_mm`, `max_load_g`, and `empty_weight_g` remain `null`; no values were derived from capacity or neighboring sizes.
- Loaded stackability is supported by Cambro's square-storage family documentation.
- Empty nesting is supported by current distributor/catalog documentation for the Classic families.
- Lids are accessories, so closure is recorded as open with a compatible lid sold separately.
- The containers are food-storage vessels with solid walls, so `liquid_capable` is true; this does not imply a leakproof lid seal.

## Result
21 records, 21 unique IDs, 21 unique manufacturer model/color identifiers, three independently sharded resin families.
