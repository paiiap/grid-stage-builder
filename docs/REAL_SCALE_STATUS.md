# Real-scale view: status

Last updated: 2026-10-21

Adds a real-world view on top of the tile grid (1 tile = 60 cm) and optional real-scale fields in the
project JSON. The grid stays the gameplay truth; real-scale data only changes how the map is drawn and
what renderers (e.g. the Pawtectors Blender build) can read. Field reference: `README.md` → "Real-scale view".

## Done

- [x] `real-scale.js`: real sizes per category (`REAL_SIZES_CM`), real box inside the footprint (`realRect`),
      door opening by `width_cm` and hinge (`doorOpening`), thin-wall geometry joined at corners and cut
      around doors (`wallGeometry`), door leaves (`doorLeaves`)
- [x] "Real scale" layer: 30 cm walls on tile centre lines, windows as a glass line in the wall,
      doors with real-width leaves and swing arcs, folding doors as zig-zag panels
- [x] Furniture drawn at real size inside the footprint (dashed outline = blocking footprint),
      `W x D x H cm` label on the selected object, 1 m / 2 m scale bar
- [x] "Garden decor" layer: trees, ponds, mounds, flower beds, rock gardens, boulders, bushes,
      `decor_paths` (paved paths, stepping stones, fences with gates), `thin_walls` with sliding doors
- [x] Object Details: Real W / D / H cm, align (back / center), door width cm, door type Folding,
      window sill / head cm
- [x] New categories: low_shelf, clothes_rail, shoe_cabinet, tree, boulder, pond, mound, flower_bed,
      rock_garden, birdbath, stone_lantern, garden_bench, garden_seating, canopy_swing
- [x] Map snapshots, import/export and `createDocument` keep `thin_walls` and `decor_paths`
- [x] Checked in the browser: the Pawtectors project loads with 0 validation errors, editing a door
      width in the inspector is saved to the document

## To do

- [ ] Run `npm test` (no Node.js on the machine used for this work) and fix anything it finds
- [ ] Tests for `real-scale.js` (`realRect`, `doorOpening`, `wallGeometry`)
- [ ] Tool to draw / edit `thin_walls`
- [ ] Tool to draw / edit `decor_paths`
- [ ] Decide whether `thin_walls` should block paths (edge blocking is not modelled; tiles only)
- [ ] Fold this into `docs/map-builder-status.md`

## Git

- [ ] Fix "dubious ownership" for this folder (the E: drive does not record file owners):
      `git config --global --add safe.directory E:/@job/2026/15pawtectors/grid-stage-builder`
- [ ] New branch, e.g. `feature/real-scale` (not straight to `main`)
- [ ] Commit only this work: `real-scale.js`, `app.js`, `core.js`, `index.html`, `README.md`, `docs/REAL_SCALE_STATUS.md`
- [ ] Leave out files that were untracked before this work: `assets/floor-tiles/`, `assets/furniture/`,
      `assets/maps/`, `assets/wall-pieces/`, `assets/wall-tiles/`, `docs/objects.numbers`, `docs/._objects.numbers`
      (decide separately: commit or `.gitignore`)
- [ ] Tests pass before merging
