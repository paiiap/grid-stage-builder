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

- [x] `npm test`: 146 / 146 pass (ran with the Node.js bundled with Adobe Creative Cloud, v24.19.0)
- [x] Tests for `real-scale.js` (`tests/real-scale.test.js`)
- [x] Tool to draw / edit `thin_walls` (Lines tool: partitions + sliding doors)
- [x] Tool to draw / edit `decor_paths` (Lines tool: paved, stepping stones, fence + gates)
- [ ] Lines tool: move / reshape points of an existing line (now: delete and redraw)
- [ ] Decide whether `thin_walls` should block paths (edge blocking is not modelled; tiles only)
- [ ] Fold this into `docs/map-builder-status.md`

## Git

- [x] Fix "dubious ownership" for this folder (the E: drive does not record file owners):
      `git config --global --add safe.directory E:/@job/2026/15pawtectors/grid-stage-builder`
- [x] New branch `feature/real-scale` (not straight to `main`)
- [x] Commit only this work (59d72c5): `real-scale.js`, `app.js`, `core.js`, `index.html`, `README.md`, `docs/REAL_SCALE_STATUS.md`
- [x] Leave out files that were untracked before this work: `assets/floor-tiles/`, `assets/furniture/`,
      `assets/maps/`, `assets/wall-pieces/`, `assets/wall-tiles/`, `docs/objects.numbers`, `docs/._objects.numbers`
      (decide separately: commit or `.gitignore`)
- [ ] Decide on those untracked files (commit or `.gitignore`)
- [x] Tests pass before merging
