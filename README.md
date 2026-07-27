# Grid Stage Builder

A browser-based map and stage editor for tile-based games.

Grid Stage Builder helps you design one master map, split it into playable stages, place gameplay markers, draw enemy paths, preview the result, and export data for production use.

It started as a house-map workflow for a mobile tower defense game, but the tool is intentionally generic enough for any block-grid stage design.

## What It Does

- Build a full master map on a fixed 48 x 48 grid.
- Divide the master map into multiple named stages.
- Place room areas, furniture/object blocks, doors, walls, build zones, and terrain.
- Add stage gameplay markers such as spawn, base, build slot, waypoint, and choke point.
- Draw multiple paths per stage and connect each path to its spawn and base.
- Expand path areas by painting extra walkable blocks.
- Preview a selected stage before export.
- Export project JSON, stage JSON, image prompts, and PNG previews.
- Show validation errors with stage context, path context, and blocking object references.
- Switch between classic, dark, and pastel UI themes.

## Main Workflow

1. Open the editor in a browser.
2. Use `Maps` mode to draw the master map.
3. Add rooms and place map objects.
4. Switch to `Stage` mode.
5. Create a stage frame over the area that should become a playable level.
6. Add spawn and base markers.
7. Create one or more paths and assign the matching spawn/base pair.
8. Use path expansion for wider walking areas.
9. Check validation and stage preview.
10. Export the stage data or the full project.

## Modes

### Maps

Use this mode to build the reusable master map.

Maps mode handles the house/layout data: rooms, tile properties, walls, build state, furniture blocks, doors, and object placement.

### Stage

Use this mode to design playable levels from the master map.

Stage mode handles level-specific data: stage bounds, spawn/base markers, paths, path width, path expansion, stage preview, and stage export.

## Project Save / Load

The top toolbar uses project language because a saved project includes both map data and stage data.

- `New Project` creates a fresh editor document.
- `Save Project` exports the full project JSON.
- `Load Project` imports a previously saved project JSON.
- `Load Sample` restores the built-in sample layout.

The editor also saves the current project in browser `localStorage` while you work.

## Stage Export

Each stage can be exported separately.

Available stage exports:

- `JSON เกม` for game/runtime data.
- `Prompt ภาพ` for image-generation prompt text.
- `PNG Preview` for a visual block-grid preview.

Stage JSON is cropped to the stage area and includes only the relevant tiles, rooms, objects, markers, and paths used by that stage.

## Validation

The validation panel catches common stage-design issues before export.

Examples:

- path missing spawn or base
- path does not start on its assigned spawn
- path does not end on its assigned base
- path goes through a blocked tile
- path collides with a blocking object
- stage area leaves the master map

When a path hits furniture or another blocking object, the message includes the stage and object, so it is easier to fix the correct level.

## Run Locally

No build step is required.

Open `index.html` directly in a browser.

For a local server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Test

```bash
npm test
npm run check
```

The tests cover core map/stage behavior, export rules, validation rules, and static UI wiring.

## Files

- `index.html` - application shell and controls
- `styles.css` - layout, themes, and visual styling
- `app.js` - editor interaction, rendering, persistence, and UI state
- `core.js` - map data model, stage export, path rasterization, and validation
- `tests/` - Node tests for core behavior and UI structure

## Status

This is an early production-tool prototype.

The current focus is making stage design fast, readable, and exportable for a tile-based game pipeline.
