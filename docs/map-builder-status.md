# Map Builder Status

Last updated: 2026-08-04

This document tracks the current state of the map-writing side of Grid Stage Builder.

## Current Scope

Grid Stage Builder is a browser-based editor for building one master map and cutting it into playable stages.

The map editor currently targets a fixed 48 x 48 tile grid with 48 px tiles.

The project is still a prototype, but the core workflow is usable for map layout, stage layout, preview, validation, and export.

## Implemented

- Project save and load are named `Save Project` and `Load Project`.
- Multiple maps can be added, duplicated, renamed, deleted, imported, and exported.
- Maps mode owns master-map data such as rooms, tile properties, structures, build status, furniture, and doors.
- Stage mode owns gameplay data such as stage bounds, spawn/base markers, build slots, paths, path areas, preview, and export.
- Room definitions are editable.
- Object definitions are editable and scoped to the selected room.
- Objects can be selected, moved, rotated, deleted, resized, and marked as overlap allowed.
- Furniture can render from PNG sprites when a matching asset exists.
- Floor rendering can use room floor texture tiles instead of flat colors.
- Wall placement is currently stored as `tile.structure = "wall"`.
- Wall rendering currently reads wall tiles and draws exposed wall runs.
- Door objects cut openings from wall rendering and draw hinged/sliding symbols.
- Stage validation is scoped to the active stage and names the relevant stage/path/object.
- Stage JSON export crops to the stage area and includes only relevant tiles, rooms, objects, paths, and markers.
- PNG export supports `PNG Full`, `PNG Art`, and `PNG Game Points`.
- PNG furniture export can show object names.
- UI copy is English for the public project.
- Tests cover the current map/stage data model, UI wiring, validation, and export behavior.

## Recent Decision

The attempted edge-based wall tool was reverted.

Wall editing is back to the previous tile-based structure workflow.

The next wall-system change needs a clearer design before another implementation pass.

## Known Gaps

- Wall tiles still need a better game-ready authoring model.
- Door placement still behaves as an object workflow, not a dedicated wall/opening workflow.
- The current wall renderer is functional, but visual tile composition around corners and doors still needs improvement.
- Godot-friendly array export is not implemented as the primary stage export format yet.
- Furniture assets are partially integrated; not every old object category has a final production sprite.
- Sample assets and generated art files need cleanup before a clean public release.

## Recommended Next Steps

1. Define the wall data model before coding the next wall tool.
2. Decide whether walls should remain tile-based or become a dedicated wall-layer format.
3. Add a separate Godot export format after the editor data model is stable.
4. Clean up generated asset folders and decide which assets belong in the public repo.
5. Add a small visual wall-system design document before changing the renderer again.

## Verification

Current local verification command:

```bash
node --check app.js
node --check core.js
node --test tests/ui-static.test.js tests/core.test.js
```

Latest result: 95 passing tests.
