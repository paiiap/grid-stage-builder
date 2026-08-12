const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const core = require("../core.js");
const walls = require("../wall-model.js");

test("createDocument builds a 48 x 48 single-floor map", () => {
  const doc = core.createDocument();
  assert.equal(doc.schema_version, 1);
  assert.equal(doc.map.width, 48);
  assert.equal(doc.map.height, 48);
  assert.equal(doc.map.tile_size, 48);
  assert.equal(doc.map.floor_count, 1);
  assert.equal(doc.tiles.length, 48 * 48);
});

test("createDocument keeps the active map in a map collection", () => {
  const doc = core.createDocument();
  assert.equal(doc.active_map_id, "house");
  assert.equal(doc.map.name, "House");
  assert.equal(doc.maps.length, 1);
  assert.equal(doc.maps[0].id, doc.map.id);
  assert.equal(doc.maps[0].name, doc.map.name);
  assert.equal(doc.maps[0].tiles.length, 48 * 48);
});

test("createDocument includes editable room and object definitions", () => {
  const doc = core.createDocument();
  assert(doc.room_definitions.some((room) => room.id === "living_room" && room.name === "Living Room"));
  assert(doc.object_definitions.some((object) => object.room_id === "living_room" && object.id === "sofa"));
  assert(doc.object_definitions.some((object) => object.room_id === "common" && object.id === "door"));
  assert.deepEqual(doc.maps[0].room_definitions, doc.room_definitions);
  assert.deepEqual(doc.maps[0].object_definitions, doc.object_definitions);
});

test("new documents initialize wall segments for the active map and snapshot", () => {
  const doc = core.createDocument();
  assert.deepEqual(doc.wall_segments, []);
  assert.deepEqual(doc.maps[0].wall_segments, []);
});

test("rotated object footprints stay grid aligned", () => {
  const object = { id: "sofa", x: 4, y: 7, width: 3, height: 2, rotation: 90 };
  assert.deepEqual(core.objectFootprint(object), [
    { x: 4, y: 7 }, { x: 5, y: 7 },
    { x: 4, y: 8 }, { x: 5, y: 8 },
    { x: 4, y: 9 }, { x: 5, y: 9 }
  ]);
});

test("path rasterization expands a two-tile path without diagonals", () => {
  const cells = core.rasterizePath({
    id: "main_path",
    width_tiles: 2,
    points: [{ x: 1, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 5 }]
  });
  assert(cells.some((cell) => cell.x === 1 && cell.y === 2));
  assert(cells.some((cell) => cell.x === 4 && cell.y === 5));
  assert(cells.some((cell) => cell.x === 4 && cell.y === 4));
});

test("vertical path width expands across x from the selected tiles", () => {
  const cells = core.rasterizePath({
    id: "vertical_path",
    width_tiles: 3,
    points: [{ x: 4, y: 2 }, { x: 4, y: 5 }]
  });
  assert(cells.some((cell) => cell.x === 4 && cell.y === 2));
  assert(cells.some((cell) => cell.x === 5 && cell.y === 2));
  assert(cells.some((cell) => cell.x === 6 && cell.y === 2));
  assert.equal(cells.some((cell) => cell.x === 3 && cell.y === 2), false);
  assert.equal(cells.some((cell) => cell.x === 4 && cell.y === 6), false);
});

test("horizontal path width expands across y from the selected tiles", () => {
  const cells = core.rasterizePath({
    id: "horizontal_path",
    width_tiles: 3,
    points: [{ x: 2, y: 4 }, { x: 5, y: 4 }]
  });
  assert(cells.some((cell) => cell.x === 2 && cell.y === 4));
  assert(cells.some((cell) => cell.x === 2 && cell.y === 5));
  assert(cells.some((cell) => cell.x === 2 && cell.y === 6));
  assert.equal(cells.some((cell) => cell.x === 2 && cell.y === 3), false);
  assert.equal(cells.some((cell) => cell.x === 6 && cell.y === 4), false);
});

test("document validation blocks diagonal paths and missing stage endpoints", () => {
  const doc = core.createDocument();
  doc.paths.push({ id: "bad", name: "Bad", width_tiles: 2, points: [{ x: 1, y: 1 }, { x: 2, y: 2 }] });
  doc.stages.push({
    id: "stage_01",
    name: "Stage 01",
    x: 0,
    y: 0,
    width: 12,
    height: 20,
    export_tile_size: 48,
    markers: [
      { id: "spawn_01", type: "spawn", x: 1, y: 1 },
      { id: "base_01", type: "base", x: 10, y: 10 }
    ],
    paths: [{ id: "stage_path", name: "Stage Path", width_tiles: 1, points: [{ x: 2, y: 2 }, { x: 3, y: 2 }] }]
  });
  const result = core.validateDocument(doc);
  assert(result.errors.some((message) => message.includes("diagonal")));
  assert(result.errors.some((message) => message.includes("spawn")));
  assert(result.errors.some((message) => message.includes("base")));
});

test("stage JSON normalizes local and master coordinates", () => {
  const doc = core.makeSampleDocument();
  const stage = core.exportStageJson(doc, "stage_living_room");
  assert.equal(stage.schema_version, 1);
  assert.equal(stage.bounds.x, 2);
  assert.equal(stage.local.width, 18);
  assert(stage.markers.some((marker) => marker.type === "spawn" && marker.x === 1 && marker.master_x === 3));
  assert(stage.paths[0].points.every((point) => Number.isInteger(point.x) && Number.isInteger(point.master_x)));
});

test("sample stage path defaults to one tile wide", () => {
  const doc = core.makeSampleDocument();
  const stage = core.exportStageJson(doc, "stage_living_room");
  assert.equal(stage.paths[0].width_tiles, 1);
});

test("sample document materializes its legacy wall tiles as editable segments", () => {
  const doc = core.makeSampleDocument();
  const coverage = walls.wallCoverage(doc.wall_segments);
  const legacyWalls = doc.tiles.filter((tile) => tile.structure === "wall");
  const openingCells = new Set(doc.objects
    .filter((object) => object.category === "door" || object.category === "window")
    .flatMap((object) => core.objectFootprint(object))
    .map((cell) => `${cell.x},${cell.y}`));

  assert(legacyWalls.length > 0);
  assert.equal(doc.wall_segments.length > 0, true);
  assert(legacyWalls.every((tile) => coverage.has(`${tile.x},${tile.y}`)));
  assert.equal(Array.from(coverage).every((key) => {
    const [x, y] = key.split(",").map(Number);
    return core.getTile(doc, x, y).structure === "wall" || openingCells.has(key);
  }), true);
});

test("stage GameJSON materializes tile structures from canonical wall segments", () => {
  const doc = core.makeSampleDocument();
  const coveredCells = walls.rasterizeWallSegment(doc.wall_segments[0]).slice(0, 2);
  core.getTile(doc, coveredCells[0].x, coveredCells[0].y).structure = "none";
  core.getTile(doc, coveredCells[1].x, coveredCells[1].y).structure = "blocked";

  const stage = core.exportStageJson(doc, "stage_living_room");
  const structures = coveredCells.map((cell) => stage.tiles.find((tile) => tile.master_x === cell.x && tile.master_y === cell.y)?.structure);

  assert.deepEqual(structures, ["wall", "wall"]);
  assert.equal(Object.hasOwn(stage, "wall_segments"), false);
});

test("prompt includes stage dimensions, rooms, path, and negative constraints", () => {
  const doc = core.makeSampleDocument();
  const prompt = core.buildPrompt(doc, "stage_living_room");
  assert.match(prompt, /portrait top-down/i);
  assert.match(prompt, /18 x 28 tiles/i);
  assert.match(prompt, /living room/i);
  assert.match(prompt, /enemy path/i);
  assert.match(prompt, /Negative/i);
});

test("setTile keeps coordinates and patches editable fields", () => {
  const doc = core.createDocument();
  const next = core.setTile(doc, 5, 6, {
    terrain: "indoor_floor",
    structure: "none",
    room_id: "living_room",
    build: "allowed"
  });
  const tile = core.getTile(next, 5, 6);
  assert.equal(tile.x, 5);
  assert.equal(tile.y, 6);
  assert.equal(tile.terrain, "indoor_floor");
  assert.equal(tile.room_id, "living_room");
  assert.equal(tile.build, "allowed");
});

test("valid sample document has no blocking validation errors", () => {
  const result = core.validateDocument(core.makeSampleDocument());
  assert.deepEqual(result.errors, []);
});

test("wall autotile showcase fixture is a loadable project", () => {
  const fixturePath = path.join(__dirname, "fixtures", "wall-autotile-showcase.json");
  const doc = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  const result = core.validateDocument(doc);

  assert.deepEqual(result.errors, []);
  assert.equal(doc.schema_version, 1);
  assert.equal(doc.map.width, 48);
  assert.equal(doc.map.height, 48);
  assert.equal(doc.tiles.length, 2304);
  assert.equal(doc.active_map_id, "wall_autotile_showcase");
  assert.equal(doc.maps.length, 1);
  assert.equal(doc.maps[0].id, doc.active_map_id);
  assert.equal(doc.maps[0].map.width, 48);
  assert.equal(doc.maps[0].map.height, 48);
  assert.equal(doc.maps[0].tiles.length, 2304);
  assert.deepEqual(doc.maps[0].wall_segments, doc.wall_segments);
  assert.deepEqual(doc.maps[0].objects, doc.objects);
  assert.deepEqual(result.warnings, [
    "opening unattached_window is not attached to a wall segment.",
    "opening unattached_door is not attached to a wall segment."
  ]);
});

test("wall opening validation warns when an opening is unattached or ambiguous", () => {
  const doc = core.createDocument();
  doc.wall_segments = [
    { id: "horizontal", axis: "horizontal", start: { x: 2, y: 5 }, end: { x: 8, y: 5 } },
    { id: "vertical", axis: "vertical", start: { x: 5, y: 2 }, end: { x: 5, y: 8 } }
  ];
  doc.objects.push(
    { id: "window_unattached", category: "window", x: 1, y: 1, width: 1, height: 1 },
    { id: "door_junction", category: "door", x: 5, y: 5, width: 1, height: 1 },
    { id: "window_straight", category: "window", x: 3, y: 5, width: 1, height: 1 }
  );

  const result = core.validateDocument(doc);

  assert.deepEqual(result.errors, []);
  assert(result.warnings.includes("opening window_unattached is not attached to a wall segment."));
  assert(result.warnings.includes("opening door_junction is placed on an ambiguous wall junction."));
  assert.equal(result.warnings.some((message) => message.includes("window_straight")), false);
});

test("wall opening validation checks every cell in an opening footprint", () => {
  const doc = core.createDocument();
  doc.wall_segments = [{ id: "vertical", axis: "vertical", start: { x: 5, y: 2 }, end: { x: 5, y: 5 } }];
  doc.objects.push(
    { id: "door_attached", category: "door", x: 5, y: 3, width: 1, height: 2 },
    { id: "window_partial", category: "window", x: 5, y: 5, width: 2, height: 1 }
  );

  const result = core.validateDocument(doc);

  assert.equal(result.warnings.some((message) => message.includes("door_attached")), false);
  assert(result.warnings.includes("opening window_partial is not attached to a wall segment."));
});

test("unattached opening remains an object and produces one attachment warning", () => {
  const doc = core.createDocument();
  const opening = { id: "window_unattached", category: "window", x: 1, y: 1, width: 1, height: 1 };
  doc.objects.push(opening);

  const result = core.validateDocument(doc);

  assert.equal(doc.objects.includes(opening), true);
  assert.equal(result.warnings.filter((message) => message === "opening window_unattached is not attached to a wall segment.").length, 1);
});

test("sample document includes small furniture sprite placement trials", () => {
  const doc = core.makeSampleDocument();
  const expected = [
    "bedding_stack_with_curtain",
    "decorative_floor_lamp",
    "potted_plant_square",
    "cat_cushion_stack",
    "pet_bowl_pair",
    "cat_food_bag",
    "toilet_side_unit",
    "potted_plant_round",
    "small_wall_drawer",
    "tissue_box",
    "bathroom_vanity_sink_wide",
    "square_pet_bed",
    "brown_armchair",
    "blue_armchair",
    "open_door_vertical",
    "single_speaker_left",
    "double_speaker_right",
    "bathroom_vanity_sink_small",
    "bedroom_wash_basin",
    "wood_door_panel",
    "laundry_basket",
    "bedside_table_lamp",
    "open_door_bottom",
    "small_nightstand"
  ];
  const categories = new Set(doc.objects.map((object) => object.category));
  for (const category of expected) assert(categories.has(category), `missing ${category}`);
  assert(doc.objects.every((object) => !expected.includes(object.category) || (object.width <= 2 && object.height <= 2)));
});

test("legacy sample furniture objects use sprite images instead of generic blocks", () => {
  const doc = core.makeSampleDocument();
  const blueSofa = doc.objects.find((object) => object.id === "blue_sofa");
  const coffeeTable = doc.objects.find((object) => object.id === "coffee_table");
  const plant = doc.objects.find((object) => object.id === "plant_corner");
  assert.match(blueSofa.sprite, /blue_sofa_vertical\.png$/);
  assert.match(coffeeTable.sprite, /living_rug_coffee_table\.png$/);
  assert.match(plant.sprite, /potted_plant_round\.png$/);
});

test("validation allows an object marked overlap allowed to sit on a blocking object", () => {
  const doc = core.createDocument();
  doc.objects.push(
    { id: "tv_stand", category: "tv_stand", x: 4, y: 4, width: 3, height: 1, blocking: true },
    { id: "tv", category: "tv", x: 4, y: 4, width: 2, height: 1, blocking: true, allow_overlap: true }
  );
  const result = core.validateDocument(doc);
  assert.equal(result.errors.some((message) => message.includes("overlaps another blocking object")), false);
});

test("stage validation names the stage and object when a path hits furniture", () => {
  const doc = core.createDocument();
  doc.objects.push({ id: "sofa_01", category: "sofa", x: 3, y: 3, width: 2, height: 1, blocking: true });
  doc.stages.push({
    id: "stage_living",
    name: "Living Test",
    x: 0,
    y: 0,
    width: 8,
    height: 8,
    export_tile_size: 48,
    markers: [
      { id: "spawn_01", type: "spawn", x: 1, y: 3 },
      { id: "base_01", type: "base", x: 6, y: 3 }
    ],
    paths: [
      { id: "path_01", name: "Path 01", spawn_id: "spawn_01", base_id: "base_01", width_tiles: 1, points: [{ x: 1, y: 3 }, { x: 6, y: 3 }] }
    ]
  });
  const result = core.validateDocument(doc);
  assert(result.errors.some((message) => message.includes("stage Living Test (stage_living)") && message.includes("object sofa_01")));
});

test("stage export only includes entities inside bounds", () => {
  const doc = core.makeSampleDocument();
  doc.stages[0].markers.push({ id: "outside_slot", type: "build_slot", x: 40, y: 40, width: 1, height: 1, label: "Outside" });
  const stage = core.exportStageJson(doc, "stage_living_room");
  assert.equal(stage.markers.some((marker) => marker.id === "outside_slot"), false);
});

test("stage export only includes rooms and objects used by stage gameplay", () => {
  const doc = core.createDocument();
  doc.rooms.push(
    { id: "kitchen", name: "Kitchen", type: "kitchen", color: "#dca45c", cells: [] },
    { id: "garden", name: "Garden", type: "garden", color: "#68a357", cells: [] }
  );
  for (let y = 0; y < 6; y += 1) {
    for (let x = 0; x < 12; x += 1) {
      const roomId = x < 6 ? "kitchen" : "garden";
      const tile = doc.tiles[y * doc.map.width + x];
      Object.assign(tile, {
        terrain: roomId === "kitchen" ? "indoor_floor" : "outdoor_ground",
        structure: "none",
        room_id: roomId,
        build: "blocked"
      });
      doc.rooms.find((room) => room.id === roomId).cells.push({ x, y });
    }
  }
  doc.rooms.find((room) => room.id === "kitchen").cells.push({ x: 0, y: 47 });
  doc.objects.push(
    { id: "counter", category: "counter", x: 2, y: 2, width: 2, height: 1, room_id: "kitchen", blocking: true },
    { id: "garden_bench", category: "bench", x: 8, y: 2, width: 2, height: 1, room_id: "garden", blocking: true }
  );
  doc.stages.push({
    id: "stage_kitchen",
    name: "Stage Kitchen",
    bounds: { x: 0, y: 0, width: 12, height: 6 },
    markers: [
      { id: "spawn_01", type: "spawn", x: 1, y: 1 },
      { id: "base_01", type: "base", x: 4, y: 4 },
      { id: "slot_01", type: "build_slot", x: 2, y: 4, width: 1, height: 1 }
    ],
    paths: [{ id: "path_1", spawn_id: "spawn_01", base_id: "base_01", width_tiles: 1, points: [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 4 }] }]
  });

  const stage = core.exportStageJson(doc, "stage_kitchen");

  assert.deepEqual(stage.rooms.map((room) => room.id), ["kitchen"]);
  assert.equal(stage.rooms[0].cells.some((cell) => cell.y === 47), false);
  assert(stage.rooms[0].cells.every((cell) => cell.x >= 0 && cell.y >= 0 && cell.x < stage.local.width && cell.y < stage.local.height));
  assert.equal(stage.tiles.some((tile) => tile.room_id === "garden"), false);
  assert.equal(stage.objects.some((object) => object.id === "garden_bench"), false);
  assert(stage.objects.some((object) => object.id === "counter"));
});

test("stage path areas export as additional path footprint cells", () => {
  const doc = core.createDocument();
  doc.stages.push({
    id: "stage_path_area",
    name: "Stage Path Area",
    bounds: { x: 0, y: 0, width: 8, height: 12 },
    markers: [
      { id: "spawn_01", type: "spawn", x: 1, y: 1 },
      { id: "base_01", type: "base", x: 1, y: 10 },
      { id: "slot_01", type: "build_slot", x: 4, y: 4, width: 2, height: 2 }
    ],
    paths: [{ id: "main_path", width_tiles: 1, points: [{ x: 1, y: 1 }, { x: 1, y: 10 }] }],
    path_areas: [{ x: 0, y: 5, width: 1, height: 4 }]
  });

  const stage = core.exportStageJson(doc, "stage_path_area");

  assert(stage.paths[0].footprint.some((cell) => cell.master_x === 0 && cell.master_y === 5));
  assert(stage.paths[0].footprint.some((cell) => cell.master_x === 0 && cell.master_y === 8));
  assert(stage.paths[0].footprint.some((cell) => cell.master_x === 1 && cell.master_y === 5));
});

test("stage export keeps path areas on their own paths", () => {
  const doc = core.createDocument();
  doc.stages.push({
    id: "stage_multi_path_area",
    name: "Stage Multi Path Area",
    bounds: { x: 0, y: 0, width: 12, height: 12 },
    markers: [
      { id: "spawn_01", type: "spawn", x: 1, y: 1 },
      { id: "spawn_02", type: "spawn", x: 9, y: 1 },
      { id: "base_01", type: "base", x: 1, y: 10 },
      { id: "slot_01", type: "build_slot", x: 4, y: 4, width: 2, height: 2 }
    ],
    paths: [
      { id: "path_1", width_tiles: 1, points: [{ x: 1, y: 1 }, { x: 1, y: 10 }], areas: [{ x: 0, y: 4, width: 1, height: 2 }] },
      { id: "path_2", width_tiles: 1, points: [{ x: 9, y: 1 }, { x: 9, y: 10 }], areas: [{ x: 10, y: 6, width: 1, height: 2 }] }
    ]
  });

  const stage = core.exportStageJson(doc, "stage_multi_path_area");
  const path1 = stage.paths.find((path) => path.id === "path_1");
  const path2 = stage.paths.find((path) => path.id === "path_2");

  assert(path1.footprint.some((cell) => cell.master_x === 0 && cell.master_y === 4));
  assert.equal(path1.footprint.some((cell) => cell.master_x === 10 && cell.master_y === 6), false);
  assert(path2.footprint.some((cell) => cell.master_x === 10 && cell.master_y === 6));
  assert.equal(path2.footprint.some((cell) => cell.master_x === 0 && cell.master_y === 4), false);
});

test("stage paths can target multiple spawns and bases", () => {
  const doc = core.createDocument();
  doc.stages.push({
    id: "stage_multi_endpoint",
    name: "Stage Multi Endpoint",
    bounds: { x: 0, y: 0, width: 14, height: 14 },
    markers: [
      { id: "spawn_01", type: "spawn", x: 1, y: 1 },
      { id: "spawn_02", type: "spawn", x: 10, y: 1 },
      { id: "base_01", type: "base", x: 6, y: 12 },
      { id: "base_02", type: "base", x: 12, y: 12 },
      { id: "slot_01", type: "build_slot", x: 4, y: 4, width: 2, height: 2 }
    ],
    paths: [
      { id: "path_1", spawn_id: "spawn_01", base_id: "base_01", width_tiles: 1, points: [{ x: 1, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 12 }] },
      { id: "path_2", spawn_id: "spawn_01", base_id: "base_02", width_tiles: 1, points: [{ x: 1, y: 1 }, { x: 12, y: 1 }, { x: 12, y: 12 }] },
      { id: "path_3", spawn_id: "spawn_02", base_id: "base_01", width_tiles: 1, points: [{ x: 10, y: 1 }, { x: 10, y: 12 }, { x: 6, y: 12 }] }
    ]
  });

  const result = core.validateDocument(doc);
  const exported = core.exportStageJson(doc, "stage_multi_endpoint");

  assert.deepEqual(result.errors, []);
  assert.equal(exported.markers.filter((marker) => marker.type === "spawn").length, 2);
  assert.equal(exported.markers.filter((marker) => marker.type === "base").length, 2);
  assert.deepEqual(exported.paths.map((path) => [path.id, path.spawn_id, path.base_id]), [
    ["path_1", "spawn_01", "base_01"],
    ["path_2", "spawn_01", "base_02"],
    ["path_3", "spawn_02", "base_01"]
  ]);
});

test("stage can hold loose spawn and base markers before paths are created", () => {
  const doc = core.createDocument();
  doc.stages.push({
    id: "stage_loose_markers",
    name: "Stage Loose Markers",
    bounds: { x: 0, y: 0, width: 10, height: 10 },
    markers: [
      { id: "spawn_01", type: "spawn", x: 1, y: 1 },
      { id: "spawn_02", type: "spawn", x: 8, y: 1 },
      { id: "base_01", type: "base", x: 5, y: 8 },
      { id: "base_02", type: "base", x: 8, y: 8 }
    ],
    paths: []
  });

  assert.deepEqual(core.validateDocument(doc).errors, []);
});

test("stage gameplay data is isolated per stage", () => {
  const doc = core.createDocument();
  doc.stages.push(
    {
      id: "stage_a",
      name: "Stage A",
      bounds: { x: 0, y: 0, width: 12, height: 20 },
      markers: [
        { id: "spawn_a", type: "spawn", x: 1, y: 1 },
        { id: "base_a", type: "base", x: 10, y: 18 },
        { id: "slot_a", type: "build_slot", x: 4, y: 4, width: 2, height: 2 }
      ],
      paths: [{ id: "path_a", width_tiles: 1, points: [{ x: 1, y: 1 }, { x: 10, y: 1 }, { x: 10, y: 18 }] }]
    },
    {
      id: "stage_b",
      name: "Stage B",
      bounds: { x: 0, y: 0, width: 12, height: 20 },
      markers: [
        { id: "spawn_b", type: "spawn", x: 2, y: 2 },
        { id: "base_b", type: "base", x: 9, y: 18 },
        { id: "slot_b", type: "build_slot", x: 7, y: 7, width: 2, height: 2 }
      ],
      paths: [{ id: "path_b", width_tiles: 1, points: [{ x: 2, y: 2 }, { x: 9, y: 2 }, { x: 9, y: 18 }] }]
    }
  );

  const exported = core.exportStageJson(doc, "stage_b");
  assert.equal(exported.markers.some((marker) => marker.id === "spawn_a"), false);
  assert.equal(exported.markers.some((marker) => marker.id === "spawn_b"), true);
  assert.equal(exported.paths.length, 1);
  assert.equal(exported.paths[0].id, "path_b");
  assert.deepEqual(core.validateDocument(doc).errors, []);
});

test("stage export rotates local coordinates by selected top direction", () => {
  const doc = core.createDocument();
  doc.stages.push({
    id: "stage_rotated",
    name: "Rotated Stage",
    bounds: { x: 10, y: 20, width: 4, height: 6 },
    top_direction: "east",
    markers: [
      { id: "spawn_01", type: "spawn", x: 10, y: 20 },
      { id: "base_01", type: "base", x: 13, y: 25 },
      { id: "slot_01", type: "build_slot", x: 11, y: 22, width: 2, height: 2 }
    ],
    paths: [{ id: "main_path", width_tiles: 1, points: [{ x: 10, y: 20 }, { x: 13, y: 20 }] }]
  });

  const exported = core.exportStageJson(doc, "stage_rotated");
  const spawn = exported.markers.find((marker) => marker.id === "spawn_01");
  const base = exported.markers.find((marker) => marker.id === "base_01");

  assert.deepEqual(exported.local, { width: 6, height: 4, tile_size: 48 });
  assert.equal(exported.export.top_direction, "east");
  assert.equal(spawn.x, 0);
  assert.equal(spawn.y, 3);
  assert.equal(spawn.master_x, 10);
  assert.equal(spawn.master_y, 20);
  assert.equal(base.y, 0);
  assert.deepEqual(exported.paths[0].points[0], { x: 0, y: 3, master_x: 10, master_y: 20 });
  assert.deepEqual(exported.paths[0].points[1], { x: 0, y: 0, master_x: 13, master_y: 20 });
});
