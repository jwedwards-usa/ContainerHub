# Buckhorn straight-wall catalog wave

Verified: 2026-08-20

## Scope

Sixteen current Buckhorn straight-wall container SKUs were added in two independent catalog shards. This family was selected after reviewing the current commit stream so it would not overlap concurrent Sterilite, IRIS, HDX, Brightroom, Cambro, Quantum, Uline, Michaels, or Really Useful Box work.

## Sources

- CustomMHS current Buckhorn Straight Wall Plastic Containers family catalog: https://www.custommhs.com/buckhorn-straight-wall-plastic-containers
- Buckhorn current SW151207F1 product page: https://buckhorninc.com/product/straight-wall-container-sw151207f1/
- Buckhorn modular packaging specification sheet: https://static1.1.sqspcdn.com/static/f/1278283/16782423/1330100548147/modular%2Bpackaging.pdf
- Each record also links its current CustomMHS SKU page as the purchase source.

The distributor SKU pages provide current sellable listings. The Buckhorn specification material was used to cross-check model identity, external dimensions, bottom interior dimensions, usable height, HDPE construction, stack-only geometry, capacities, and historical tare/load values.

## Model coverage

SW12070502, SW15120602, SW151208A2, SW151207F1, SW15121002, SW241504A2, SW24150602, SW241508A2, SW24151002, SW241511A2, SW24151502, SW242208A2, SW242211A2, SW242215A2, SW32150802, SW48150802.

## Reconciliation notes

- SW151207F1 uses the current Buckhorn dimensions, capacity, and tare weight. Current distributor pages disagree on its load rating, so `max_load_g` is null.
- SW241511A2, SW24151502, and SW242208A2 use the current distributor tare weights. Their records note the older Buckhorn-sheet values instead of silently masking the discrepancy.
- Interior dimensions retain Buckhorn's bottom-footprint/usable-height convention.
- Optional lids are not represented as included closures.
- Liquid capability remains false because neither source establishes these straight-wall totes as liquid-containment vessels.
