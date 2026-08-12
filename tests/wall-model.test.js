const test = require("node:test");
const assert = require("node:assert/strict");
const walls = require("../wall-model.js");

function makeMapState() {
  const width = 12;
  const height = 12;
  return {
    map: { width, height },
    tiles: Array.from({ length: width * height }, (_, index) => ({
      x: index % width,
      y: Math.floor(index / width),
      terrain: "indoor_floor",
      structure: "none",
      build: "allowed"
    })),
    objects: []
  };
}

function tileAt(state, x, y) {
  return state.tiles[y * state.map.width + x];
}

test("axis lock chooses the dominant cardinal direction", () => {
  assert.deepEqual(
    walls.axisLockedEndpoint({ x: 4, y: 4 }, { x: 10, y: 6 }),
    { axis: "horizontal", end: { x: 10, y: 4 } }
  );
  assert.deepEqual(
    walls.axisLockedEndpoint({ x: 4, y: 4 }, { x: 5, y: 11 }),
    { axis: "vertical", end: { x: 4, y: 11 } }
  );
});

test("T junction selection respects the requested axis", () => {
  const horizontal = { id: "h", axis: "horizontal", start: { x: 2, y: 4 }, end: { x: 8, y: 4 } };
  const vertical = { id: "v", axis: "vertical", start: { x: 5, y: 1 }, end: { x: 5, y: 4 } };
  assert.deepEqual(walls.segmentsAtCell([horizontal, vertical], { x: 5, y: 4 }, "horizontal").map((item) => item.id), ["h"]);
  assert.deepEqual(walls.segmentsAtCell([horizontal, vertical], { x: 5, y: 4 }, "vertical").map((item) => item.id), ["v"]);
});

test("junction pointer position selects the intended horizontal or vertical segment", () => {
  const cell = { x: 5, y: 4 };
  const size = 48;
  const horizontal = { id: "h", axis: "horizontal", start: { x: 2, y: 4 }, end: { x: 8, y: 4 } };
  const vertical = { id: "v", axis: "vertical", start: { x: 5, y: 1 }, end: { x: 5, y: 7 } };
  const segments = [horizontal, vertical];
  const horizontalAxis = walls.selectionAxisAtPoint(cell, { x: cell.x * size + 8, y: cell.y * size + 24 }, size);
  const verticalAxis = walls.selectionAxisAtPoint(cell, { x: cell.x * size + 24, y: cell.y * size + 8 }, size);

  assert.equal(horizontalAxis, "horizontal");
  assert.equal(verticalAxis, "vertical");
  assert.deepEqual(walls.segmentsAtCell(segments, cell, horizontalAxis).map((item) => item.id), ["h"]);
  assert.deepEqual(walls.segmentsAtCell(segments, cell, verticalAxis).map((item) => item.id), ["v"]);
});

test("wall selection returns overlapping segments newest first", () => {
  const older = { id: "older", axis: "horizontal", start: { x: 2, y: 4 }, end: { x: 8, y: 4 } };
  const newer = { id: "newer", axis: "horizontal", start: { x: 4, y: 4 }, end: { x: 9, y: 4 } };
  assert.deepEqual(walls.segmentsAtCell([older, newer], { x: 5, y: 4 }, "horizontal").map((item) => item.id), ["newer", "older"]);
});

test("wall selection candidates cycle in newest-first order", () => {
  const older = { id: "older", axis: "horizontal", start: { x: 2, y: 4 }, end: { x: 8, y: 4 } };
  const newer = { id: "newer", axis: "horizontal", start: { x: 4, y: 4 }, end: { x: 9, y: 4 } };
  const candidates = walls.segmentsAtCell([older, newer], { x: 5, y: 4 }, "horizontal");
  assert.deepEqual([0, 1, 2].map((index) => candidates[index % candidates.length].id), ["newer", "older", "newer"]);
});

test("resizing endpoint normalizes a segment after crossing its other endpoint", () => {
  const segment = { id: "h", axis: "horizontal", start: { x: 3, y: 4 }, end: { x: 7, y: 4 } };
  assert.deepEqual(
    walls.resizeWallSegment(segment, "start", { x: 9, y: 9 }, { width: 12, height: 12 }),
    { id: "h", axis: "horizontal", start: { x: 7, y: 4 }, end: { x: 9, y: 4 } }
  );
});

test("segment rasterization is inclusive and survives endpoint crossing", () => {
  const segment = walls.normalizeWallSegment({
    id: "wall_1",
    axis: "horizontal",
    start: { x: 8, y: 3 },
    end: { x: 4, y: 3 }
  }, { width: 48, height: 48 });
  assert.deepEqual(segment.start, { x: 4, y: 3 });
  assert.deepEqual(segment.end, { x: 8, y: 3 });
  assert.equal(walls.rasterizeWallSegment(segment).length, 5);
});

test("normalized wall masks use the 16 cardinal atlas states", () => {
  assert.deepEqual(walls.canonicalMasks, [
    0, 1, 4, 5, 16, 17, 20, 21,
    64, 65, 68, 69, 80, 81, 84, 85
  ]);
  assert.equal(walls.normalizeNeighborMask(255), 85);
  assert.equal(walls.normalizeNeighborMask(7), 5);
  for (let mask = 0; mask < 256; mask += 1) {
    assert.notEqual(walls.atlasIndexForMask(mask), -1);
  }
});

test("legacy L-shaped, cross, and isolated walls preserve every covered cell", () => {
  const state = makeMapState();
  for (const [x, y] of [[1, 1], [2, 1], [3, 1], [1, 2], [1, 3], [6, 2], [5, 3], [6, 3], [7, 3], [6, 4], [9, 8]]) {
    tileAt(state, x, y).structure = "wall";
  }

  const segments = walls.migrateWallSegments(state);
  const coverage = walls.wallCoverage(segments);

  for (const [x, y] of [[1, 1], [2, 1], [3, 1], [1, 2], [1, 3], [6, 2], [5, 3], [6, 3], [7, 3], [6, 4], [9, 8]]) {
    assert.equal(coverage.has(`${x},${y}`), true);
  }
  assert(segments.some((segment) => segment.axis === "horizontal" && segment.start.x === 1 && segment.start.y === 1 && segment.end.x === 3));
  assert(segments.some((segment) => segment.axis === "vertical" && segment.start.x === 1 && segment.start.y === 1 && segment.end.y === 3));
  assert(segments.some((segment) => segment.axis === "horizontal" && segment.start.x === 9 && segment.end.x === 9 && segment.start.y === 8));
});

test("legacy windows become movable opening objects", () => {
  const state = makeMapState();
  tileAt(state, 4, 2).structure = "window";

  const segments = walls.migrateWallSegments(state);

  assert(segments.some((segment) => walls.rasterizeWallSegment(segment).some((cell) => cell.x === 4 && cell.y === 2)));
  assert(state.objects.some((object) => object.category === "window" && object.x === 4 && object.y === 2));
});

test("opening orientation follows its supporting wall segment", () => {
  const state = makeMapState();
  state.wall_segments = [{ id: "h", axis: "horizontal", start: { x: 2, y: 5 }, end: { x: 8, y: 5 } }];
  const opening = { id: "w1", category: "window", x: 4, y: 5, width: 1, height: 1 };

  assert.equal(walls.openingOrientation(state, opening), "horizontal");
});

test("opening attachment prefers its current facing at an ambiguous junction", () => {
  const state = makeMapState();
  state.wall_segments = [
    { id: "h", axis: "horizontal", start: { x: 2, y: 5 }, end: { x: 8, y: 5 } },
    { id: "v", axis: "vertical", start: { x: 5, y: 2 }, end: { x: 5, y: 8 } }
  ];

  assert.deepEqual(
    walls.openingAttachment(state, { id: "d1", category: "door", x: 5, y: 5, width: 1, height: 1, facing: "east" }),
    { attached: true, ambiguous: true, axis: "vertical" }
  );
});

test("multi-cell openings expose every supported horizontal and vertical render cell", () => {
  const state = makeMapState();
  state.wall_segments = [
    { id: "h", axis: "horizontal", start: { x: 2, y: 5 }, end: { x: 8, y: 5 } },
    { id: "v", axis: "vertical", start: { x: 9, y: 2 }, end: { x: 9, y: 8 } }
  ];
  const window = { id: "w2", category: "window", x: 4, y: 5, width: 2, height: 1, facing: "south" };
  const door = { id: "d2", category: "door", x: 9, y: 3, width: 1, height: 2, facing: "east" };
  state.objects.push(window, door);

  assert.deepEqual(walls.openingAttachment(state, window), { attached: true, ambiguous: false, axis: "horizontal" });
  assert.deepEqual(walls.openingRenderCells(state, window), [
    { x: 4, y: 5, attached: true, ambiguous: false, axis: "horizontal", runRole: "start" },
    { x: 5, y: 5, attached: true, ambiguous: false, axis: "horizontal", runRole: "end" }
  ]);
  assert.deepEqual(walls.openingAttachment(state, door), { attached: true, ambiguous: false, axis: "vertical" });
  assert.deepEqual(walls.openingRenderCells(state, door), [
    { x: 9, y: 3, attached: true, ambiguous: false, axis: "vertical", runRole: "start" },
    { x: 9, y: 4, attached: true, ambiguous: false, axis: "vertical", runRole: "end" }
  ]);
});

test("partial opening attachment exposes supported cells without treating the footprint as fully attached", () => {
  const state = makeMapState();
  state.wall_segments = [{ id: "h", axis: "horizontal", start: { x: 2, y: 5 }, end: { x: 4, y: 5 } }];
  const window = { id: "partial", category: "window", x: 4, y: 5, width: 2, height: 1, facing: "south" };
  state.objects.push(window);

  assert.deepEqual(walls.openingAttachment(state, window), { attached: false, ambiguous: false, axis: "horizontal" });
  assert.deepEqual(walls.openingRenderCells(state, window), [
    { x: 4, y: 5, attached: true, ambiguous: false, axis: "horizontal", runRole: "single" },
    { x: 5, y: 5, attached: false, ambiguous: false, axis: null, runRole: "single" }
  ]);
});

test("unattached multi-cell openings do not inherit an axis from facing", () => {
  const state = makeMapState();
  state.wall_segments = [];
  const door = { id: "unattached", category: "door", x: 4, y: 5, width: 1, height: 2, facing: "east" };

  assert.deepEqual(walls.openingAttachment(state, door), { attached: false, ambiguous: false, axis: null });
  assert.deepEqual(walls.openingRenderCells(state, door), [
    { x: 4, y: 5, attached: false, ambiguous: false, axis: null, runRole: "single" },
    { x: 4, y: 6, attached: false, ambiguous: false, axis: null, runRole: "single" }
  ]);
});

test("adjacent door and window share a run without deleting either object", () => {
  const state = makeMapState();
  state.wall_segments = [{ id: "h", axis: "horizontal", start: { x: 2, y: 5 }, end: { x: 8, y: 5 } }];
  state.objects.push(
    { id: "d1", category: "door", x: 4, y: 5, width: 1, height: 1 },
    { id: "w1", category: "window", x: 5, y: 5, width: 1, height: 1 }
  );

  assert.equal(walls.openingRunRole(state, state.objects[0]), "start");
  assert.equal(walls.openingRunRole(state, state.objects[1]), "end");
  assert.equal(state.objects.length, 2);
});

test("legacy windows migrate to opening objects only once", () => {
  const state = makeMapState();
  tileAt(state, 4, 2).structure = "window";

  walls.migrateWallSegments(state);
  walls.migrateWallSegments(state);

  assert.equal(state.objects.filter((object) => object.category === "window" && object.x === 4 && object.y === 2).length, 1);
});

test("materialization keeps attached openings and leaves unattached openings on floor tiles", () => {
  const state = makeMapState();
  state.wall_segments = [
    { id: "horizontal", axis: "horizontal", start: { x: 2, y: 5 }, end: { x: 8, y: 5 } },
    { id: "vertical", axis: "vertical", start: { x: 5, y: 2 }, end: { x: 5, y: 8 } }
  ];
  state.objects.push(
    { id: "window_attached", category: "window", x: 6, y: 5, width: 2, height: 1 },
    { id: "door_attached", category: "door", x: 5, y: 3, width: 1, height: 2 },
    { id: "window_partial", category: "window", x: 8, y: 5, width: 2, height: 1 },
    { id: "window_unattached", category: "window", x: 10, y: 10, width: 1, height: 1 }
  );
  tileAt(state, 10, 10).terrain = "garden";
  tileAt(state, 0, 0).structure = "blocked";

  walls.materializeWallState(state);

  assert.equal(tileAt(state, 2, 5).structure, "wall");
  assert.equal(tileAt(state, 6, 5).structure, "window");
  assert.equal(tileAt(state, 7, 5).structure, "window");
  assert.equal(tileAt(state, 5, 3).structure, "none");
  assert.equal(tileAt(state, 5, 4).structure, "none");
  assert.equal(tileAt(state, 8, 5).structure, "wall");
  assert.equal(tileAt(state, 10, 10).terrain, "garden");
  assert.equal(tileAt(state, 10, 10).structure, "none");
  assert.equal(tileAt(state, 0, 0).structure, "blocked");
});

test("shortening one segment preserves cells covered by another segment", () => {
  const state = makeMapState();
  state.wall_segments = [
    { id: "a", axis: "horizontal", start: { x: 2, y: 5 }, end: { x: 8, y: 5 } },
    { id: "b", axis: "vertical", start: { x: 5, y: 2 }, end: { x: 5, y: 8 } }
  ];
  walls.materializeWallState(state);
  state.wall_segments[0].end.x = 4;
  walls.materializeWallState(state);

  assert.equal(tileAt(state, 5, 5).structure, "wall");
});

test("removing a supporting segment preserves an unattached opening object", () => {
  const state = makeMapState();
  state.wall_segments = [{ id: "horizontal", axis: "horizontal", start: { x: 2, y: 5 }, end: { x: 8, y: 5 } }];
  const opening = { id: "window", category: "window", x: 5, y: 5, width: 1, height: 1 };
  state.objects.push(opening);

  walls.materializeWallState(state);
  state.wall_segments = [];
  walls.materializeWallState(state);

  assert.equal(state.objects.includes(opening), true);
  assert.equal(tileAt(state, 5, 5).structure, "none");
});
