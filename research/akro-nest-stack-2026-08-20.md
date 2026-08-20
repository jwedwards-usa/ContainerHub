# Akro-Mils Nest & Stack — 2026-08-20

Scope: all nine current Akro-Mils Nest & Stack Tote models: 35180, 35185, 35190, 35195, 35200, 35225, 35230, 35240 and 35300.

Primary source: current Akro-Mils Nest & Stack family and model pages. Manufacturer pages provide outside dimensions, bottom interior dimensions, inside height, gallon capacity, load rating, standard colors, nesting/stacking behavior and optional-lid status.

Purchase source: current Simplastics exact-model pages `https://simplastics.com/<model>`. The family listing exposes all nine current models with add-to-cart pricing and carton quantities.

Normalization:
- dimensions are stored in millimeters; interior length/width use the manufacturer's bottom dimensions;
- capacity converts published U.S. gallons to milliliters;
- load rating converts published pounds to grams;
- polypropylene is cross-checked against current Simplastics model listings;
- unsupported individual empty weights remain null;
- liquid capability remains null because chemical/water resistance is not treated as a liquid-containment claim;
- blue, gray and red are the standard normalized colors; special-order clear variants are noted rather than duplicated as separate physical products;
- optional lids are accessories and are not included in the container record.

Result: 9 unique product records in `data/akro-nest-stack.json`.
