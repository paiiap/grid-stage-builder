const test = require("node:test");
const assert = require("node:assert/strict");
const realScale = require("../real-scale.js");

function docWith(tiles, objects, extra) {
  return Object.assign({ map: { width: 10, height: 10 }, tiles, objects }, extra || {});
}

function wallRow(y, x0, x1, gaps) {
  const tiles = [];
  for (let x = x0; x <= x1; x += 1) {
    tiles.push({ x, y, structure: gaps.includes(x) ? "none" : "wall", room_id: "living_room" });
  }
  return tiles;
}

test("scale defaults to 60 cm tiles and 30 cm walls", () => {
  const scale = realScale.scaleOf({ map: {} });
  assert.equal(scale.tile_cm, 60);
  assert.equal(scale.wall_thickness_cm, 30);
  assert.equal(scale.floor_levels_cm.indoor_floor, 40);
  assert.equal(realScale.scaleOf({ map: { scale: { tile_cm: 50 } } }).tile_cm, 50);
});

test("real rect uses facing: w along the front edge, d front to back", () => {
  const doc = docWith([], []);
  // counter facing west, 2 x 5 tiles, real depth 62 cm against the east (back) side
  const counter = { category: "kitchen_counter", x: 0, y: 0, width: 2, height: 5, facing: "west" };
  const rect = realScale.realRect(doc, counter);
  assert.ok(rect.real);
  assert.equal(rect.height, 5); // fills its length
  assert.ok(Math.abs(rect.width - 62 / 60) < 1e-9);
  assert.ok(Math.abs(rect.x - (2 - 62 / 60)) < 1e-9); // pushed to the back (east) side
});

test("objects without a real size fill their footprint", () => {
  const rect = realScale.realRect(docWith([], []), { category: "unknown_thing", x: 3, y: 4, width: 2, height: 1 });
  assert.deepEqual(rect, { x: 3, y: 4, width: 2, height: 1, real: false });
});

test("size_cm overrides the catalogue and align front hugs the facing side", () => {
  const bed = { category: "bed", x: 0, y: 0, width: 3, height: 4, facing: "south", size_cm: { d: 210 } };
  const rect = realScale.realRect(docWith([], []), bed);
  assert.ok(Math.abs(rect.height - 3.5) < 1e-9);
  assert.ok(Math.abs(rect.y - 0.5) < 1e-9); // head (facing side, south) stays at the bottom
});

test("door width_cm narrows the opening from the hinge side", () => {
  const tiles = [
    { x: 1, y: 0, structure: "wall" }, { x: 1, y: 1, structure: "none" }, { x: 1, y: 2, structure: "none" },
    { x: 1, y: 3, structure: "wall" }
  ];
  const door = { category: "door", x: 1, y: 1, width: 1, height: 2, door_hinge: "start", width_cm: 90 };
  const opening = realScale.doorOpening(docWith(tiles, [door]), door);
  assert.equal(opening.axis, "y");
  assert.equal(opening.a0, 1);
  assert.ok(Math.abs(opening.a1 - 2.5) < 1e-9);
  assert.equal(opening.line, 1.5);
});

test("wall geometry is thin, joined, and leaves a gap for the door", () => {
  const tiles = wallRow(0, 0, 5, [2, 3]);
  const door = { category: "door", x: 2, y: 0, width: 2, height: 1, door_type: "hinged" };
  const geometry = realScale.wallGeometry(docWith(tiles, [door]));
  const half = 0.25; // 30 cm wall in 60 cm tiles
  for (const rect of geometry.walls) {
    assert.ok(Math.abs(rect.y - (0.5 - half)) < 1e-9 && Math.abs(rect.height - half * 2) < 1e-9);
    // nothing inside the door opening x 2..4
    assert.ok(rect.x + rect.width <= 2 + 1e-9 || rect.x >= 4 - 1e-9);
  }
  // the walls beside the opening reach its edges, so a lintel can join them
  assert.ok(geometry.walls.some((rect) => Math.abs(rect.x + rect.width - 2) < 1e-9));
  assert.ok(geometry.walls.some((rect) => Math.abs(rect.x - 4) < 1e-9));
});

test("thin walls are cut around their openings", () => {
  const doc = docWith([], [], {
    thin_walls: [{ axis: "vertical", at: 5, from: 0, to: 6, thickness_cm: 10, openings: [{ from: 2, to: 4, type: "sliding" }] }]
  });
  const geometry = realScale.wallGeometry(doc);
  assert.equal(geometry.thinWalls.length, 2);
  assert.equal(geometry.thinOpenings.length, 1);
  assert.ok(geometry.thinWalls.every((rect) => rect.y + rect.height <= 2 + 1e-9 || rect.y >= 4 - 1e-9));
});
