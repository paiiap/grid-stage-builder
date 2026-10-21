(function initRealScale(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.GridRealScale = api;
})(typeof globalThis !== "undefined" ? globalThis : null, function createRealScale() {
  "use strict";

  // Real-world scale on top of the tile grid. The grid stays the gameplay truth
  // (blocking, paths, stages); these helpers describe what the room really looks
  // like inside it: thin walls on tile centre lines, doors with real widths and
  // furniture with real dimensions placed inside their tile footprints.
  // Everything here is optional data: documents without it behave as before.

  const DEFAULT_SCALE = {
    tile_cm: 60,
    wall_thickness_cm: 30,
    wall_height_cm: 240,
    floor_levels_cm: { indoor_floor: 40, outdoor_ground: 20, garden: 0, void: 0 }
  };

  // Typical real sizes, relative to `facing`: w runs along the front edge, d from front to back,
  // h is the height. A missing w or d means "fill the footprint" in that direction, so long wall
  // furniture (counters, closets) still spans its tiles but gets a real depth.
  // align: "back" = against the side opposite `facing` (wall furniture),
  //        "front" = against the facing side (a bed's head is on its facing side), default centre.
  const REAL_SIZES_CM = {
    sofa: { d: 95, h: 85, align: "back" },
    armchair: { w: 85, d: 85, h: 85, align: "back" },
    tv_stand: { d: 45, h: 50, align: "back" },
    bookshelf: { d: 40, h: 190, align: "back" },
    low_shelf: { d: 40, h: 90 },
    floor_lamp: { w: 40, d: 40, h: 150 },
    bed: { h: 55, align: "front" },
    nightstand: { w: 45, d: 40, h: 55, align: "back" },
    closet: { d: 60, h: 210, align: "back" },
    clothes_rail: { d: 55, h: 190, align: "back" },
    vanity: { d: 45, h: 75, align: "back" },
    laundry_basket: { w: 45, d: 45, h: 50 },
    dining_chair: { w: 45, d: 48, h: 90 },
    display_cabinet: { d: 45, h: 170, align: "back" },
    fridge: { d: 75, h: 185, align: "back" },
    kitchen_counter: { d: 62, h: 90, align: "back" },
    toilet: { w: 45, d: 70, h: 80, align: "back" },
    shoe_cabinet: { d: 35, h: 96, align: "back" },
    cat_bed: { w: 60, d: 60, h: 25 },
    litter_box: { w: 50, d: 40, h: 30 },
    scratching_post: { w: 40, d: 40, h: 90 },
    plant: { w: 45, d: 45, h: 120 },
    birdbath: { w: 60, d: 60, h: 82 },
    stone_lantern: { w: 50, d: 50, h: 110 }
  };

  const FACING_VECTORS = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] };

  function scaleOf(doc) {
    const source = doc?.map?.scale || {};
    return Object.assign({}, DEFAULT_SCALE, source, {
      floor_levels_cm: Object.assign({}, DEFAULT_SCALE.floor_levels_cm, source.floor_levels_cm || {})
    });
  }

  function cmToTiles(doc, cm) {
    return Number(cm) / scaleOf(doc).tile_cm;
  }

  function rotatedFootprint(object) {
    const rotation = ((Number(object.rotation) || 0) % 360 + 360) % 360;
    const rotated = rotation === 90 || rotation === 270;
    const width = Number(object.width || 1);
    const height = Number(object.height || 1);
    return {
      x: Number(object.x || 0),
      y: Number(object.y || 0),
      width: rotated ? height : width,
      height: rotated ? width : height,
      rotated
    };
  }

  // Real size in cm for an object: its own size_cm first, then the catalogue.
  // Returns null for categories without a known size (they keep filling their tiles).
  function realSizeCm(object) {
    const preset = REAL_SIZES_CM[object?.category] || null;
    const own = object?.size_cm || null;
    if (!own && !preset) return null;
    return {
      w: Number(own?.w ?? preset?.w ?? 0) || null,
      d: Number(own?.d ?? preset?.d ?? 0) || null,
      h: Number(own?.h ?? preset?.h ?? 0) || null,
      align: own?.align || object?.align || preset?.align || "center"
    };
  }

  // Real box inside the footprint, in tile units: {x, y, width, height, real}.
  // real is false when the object simply fills its footprint.
  function realRect(doc, object) {
    const foot = rotatedFootprint(object);
    const size = realSizeCm(object);
    const full = { x: foot.x, y: foot.y, width: foot.width, height: foot.height, real: false };
    if (!size || (!size.w && !size.d)) return full;
    const tile = scaleOf(doc).tile_cm;
    const facing = object.facing || "south";
    const acrossX = facing === "north" || facing === "south"; // the front edge runs along x
    const along = acrossX ? foot.width : foot.height;
    const deep = acrossX ? foot.height : foot.width;
    const w = Math.min(size.w ? size.w / tile : along, along);
    const d = Math.min(size.d ? size.d / tile : deep, deep);
    const width = acrossX ? w : d;
    const height = acrossX ? d : w;
    let x = foot.x + (foot.width - width) / 2;
    let y = foot.y + (foot.height - height) / 2;
    // "back" hugs the side behind the object, "front" hugs the side it faces
    const toBack = size.align === "back";
    const toFront = size.align === "front";
    if (toBack || toFront) {
      const side = toBack ? { south: "north", north: "south", east: "west", west: "east" }[facing] : facing;
      if (side === "north") y = foot.y;
      if (side === "south") y = foot.y + foot.height - height;
      if (side === "west") x = foot.x;
      if (side === "east") x = foot.x + foot.width - width;
    }
    const real = Math.abs(width - foot.width) > 1e-6 || Math.abs(height - foot.height) > 1e-6;
    return { x, y, width, height, real };
  }

  function cellKey(x, y) {
    return `${x},${y}`;
  }

  function structureLookup(doc) {
    const lookup = new Map();
    for (const tile of doc?.tiles || []) lookup.set(cellKey(tile.x, tile.y), tile);
    return lookup;
  }

  function doorObjects(doc) {
    return (doc?.objects || []).filter((object) => object.category === "door");
  }

  function doorCells(doc) {
    const cells = new Set();
    for (const door of doorObjects(doc)) {
      const foot = rotatedFootprint(door);
      for (let y = foot.y; y < foot.y + foot.height; y += 1) {
        for (let x = foot.x; x < foot.x + foot.width; x += 1) cells.add(cellKey(x, y));
      }
    }
    return cells;
  }

  function isWallTile(lookup, x, y) {
    const tile = lookup.get(cellKey(x, y));
    return Boolean(tile && (tile.structure === "wall" || tile.structure === "window"));
  }

  // Opening of a door along its wall in tile units: {axis: "x"|"y", a0, a1, line, footprint}.
  // width_cm narrows (filler wall) or widens (cuts into the next wall tile) from the hinge side.
  function doorOpening(doc, door, lookup) {
    const tiles = lookup || structureLookup(doc);
    const foot = rotatedFootprint(door);
    let axis;
    if (isWallTile(tiles, foot.x - 1, foot.y) || isWallTile(tiles, foot.x + foot.width, foot.y)) axis = "x";
    else if (isWallTile(tiles, foot.x, foot.y - 1) || isWallTile(tiles, foot.x, foot.y + foot.height)) axis = "y";
    else axis = foot.width >= foot.height ? "x" : "y";
    let a0 = axis === "x" ? foot.x : foot.y;
    let a1 = axis === "x" ? foot.x + foot.width : foot.y + foot.height;
    const line = axis === "x" ? foot.y + 0.5 : foot.x + 0.5;
    const widthCm = Number(door.width_cm || 0);
    if (widthCm > 0 && door.door_type !== "folding" && door.door_type !== "sliding") {
      const span = cmToTiles(doc, widthCm);
      if ((door.door_hinge || "start") === "start") a1 = a0 + span;
      else a0 = a1 - span;
    }
    return { axis, a0, a1, line, footprint: foot };
  }

  function bandRect(axis, a0, a1, line, half) {
    return axis === "x"
      ? { x: a0, y: line - half, width: a1 - a0, height: half * 2 }
      : { x: line - half, y: a0, width: half * 2, height: a1 - a0 };
  }

  function rectMinus(rect, cut) {
    const x1 = rect.x + rect.width;
    const y1 = rect.y + rect.height;
    const cx1 = cut.x + cut.width;
    const cy1 = cut.y + cut.height;
    if (cut.x >= x1 || cx1 <= rect.x || cut.y >= y1 || cy1 <= rect.y) return [rect];
    const my0 = Math.max(rect.y, cut.y);
    const my1 = Math.min(y1, cy1);
    return [
      { x: rect.x, y: rect.y, width: rect.width, height: cut.y - rect.y },
      { x: rect.x, y: cy1, width: rect.width, height: y1 - cy1 },
      { x: rect.x, y: my0, width: cut.x - rect.x, height: my1 - my0 },
      { x: cx1, y: my0, width: x1 - cx1, height: my1 - my0 }
    ].filter((piece) => piece.width > 1e-4 && piece.height > 1e-4);
  }

  // Thin-wall geometry in tile units:
  // { walls: [rect], windows: [{rect, axis}], doors: [{door, opening}], thinWalls: [rect], thinOpenings: [...] }
  function wallGeometry(doc) {
    const lookup = structureLookup(doc);
    const doorsAt = doorCells(doc);
    const half = cmToTiles(doc, scaleOf(doc).wall_thickness_cm) / 2;
    const h0 = 0.5 - half;
    const h1 = 0.5 + half;
    const connects = (x, y) => isWallTile(lookup, x, y) || doorsAt.has(cellKey(x, y));
    const doors = doorObjects(doc).map((door) => ({ door, opening: doorOpening(doc, door, lookup) }));
    const cuts = doors.map(({ opening }) => bandRect(opening.axis, opening.a0, opening.a1, opening.line, half + 0.1));
    const walls = [];
    const windows = [];
    for (const tile of doc?.tiles || []) {
      if (tile.structure !== "wall" && tile.structure !== "window") continue;
      const { x, y } = tile;
      const n = { W: connects(x - 1, y), E: connects(x + 1, y), N: connects(x, y - 1), S: connects(x, y + 1) };
      const horiz = n.W || n.E;
      const vert = n.N || n.S;
      const pieces = [{ x: x + h0, y: y + h0, width: h1 - h0, height: h1 - h0 }];
      if (n.W || (n.E && !vert)) pieces.push({ x, y: y + h0, width: h0, height: h1 - h0 });
      if (n.E || (n.W && !vert)) pieces.push({ x: x + h1, y: y + h0, width: 1 - h1, height: h1 - h0 });
      if (n.N || (n.S && !horiz)) pieces.push({ x: x + h0, y, width: h1 - h0, height: h0 });
      if (n.S || (n.N && !horiz)) pieces.push({ x: x + h0, y: y + h1, width: h1 - h0, height: 1 - h1 });
      if (tile.structure === "window") {
        const axis = isWallTile(lookup, x - 1, y) || isWallTile(lookup, x + 1, y) ? "x" : "y";
        for (const piece of pieces) windows.push({ rect: piece, axis, tile });
        continue;
      }
      let parts = pieces;
      for (const cut of cuts) parts = parts.flatMap((part) => rectMinus(part, cut));
      walls.push(...parts);
    }
    for (const { opening } of doors) { // filler where a door is narrower than its tiles
      const foot = opening.footprint;
      const lo = opening.axis === "x" ? foot.x : foot.y;
      const hi = opening.axis === "x" ? foot.x + foot.width : foot.y + foot.height;
      for (const [f0, f1] of [[lo, Math.min(opening.a0, hi)], [Math.max(opening.a1, lo), hi]]) {
        if (f1 - f0 > 1e-3) walls.push(bandRect(opening.axis, f0, f1, opening.line, half));
      }
    }
    const thinWalls = [];
    const thinOpenings = [];
    for (const wall of doc?.thin_walls || []) {
      const axis = wall.axis === "vertical" || wall.axis === "y" ? "y" : "x";
      const thick = cmToTiles(doc, wall.thickness_cm || 10) / 2;
      let parts = [bandRect(axis, Number(wall.from), Number(wall.to), Number(wall.at), thick)];
      for (const opening of wall.openings || []) {
        const cut = bandRect(axis, Number(opening.from), Number(opening.to), Number(wall.at), thick + 0.05);
        parts = parts.flatMap((part) => rectMinus(part, cut));
        thinOpenings.push({ wall, opening, axis, rect: bandRect(axis, Number(opening.from), Number(opening.to), Number(wall.at), thick) });
      }
      thinWalls.push(...parts);
    }
    return { walls, windows, doors, thinWalls, thinOpenings, half };
  }

  // Unit vector (tile units) pointing to the side a door swings into.
  function doorSwingSide(doc, door, opening) {
    const lookup = structureLookup(doc);
    const foot = opening.footprint;
    const sideA = opening.axis === "x" ? lookup.get(cellKey(foot.x, foot.y - 1)) : lookup.get(cellKey(foot.x - 1, foot.y));
    const sideB = opening.axis === "x" ? lookup.get(cellKey(foot.x, foot.y + foot.height)) : lookup.get(cellKey(foot.x + foot.width, foot.y));
    const towardA = opening.axis === "x" ? [0, -1] : [-1, 0];
    const towardB = towardA.map((v) => -v);
    const own = door.room_id;
    const swingIn = (door.door_swing || "in") === "in";
    const target = swingIn ? own : (sideA?.room_id === own ? sideB?.room_id : sideA?.room_id);
    if (sideA && sideA.room_id === target) return towardA;
    if (sideB && sideB.room_id === target) return towardB;
    return FACING_VECTORS[door.facing] || towardB;
  }

  // Door leaves for plan drawing (tile units): hinge point, direction along the closed leaf, length.
  function doorLeaves(doc, door, opening) {
    const axisVector = opening.axis === "x" ? [1, 0] : [0, 1];
    const back = axisVector.map((v) => -v);
    const swingSide = doorSwingSide(doc, door, opening);
    const length = opening.a1 - opening.a0;
    const start = opening.axis === "x" ? [opening.a0, opening.line] : [opening.line, opening.a0];
    const end = opening.axis === "x" ? [opening.a1, opening.line] : [opening.line, opening.a1];
    if (door.door_type === "sliding" || door.door_type === "folding") return { swingSide, leaves: [], start, end };
    const double = length * scaleOf(doc).tile_cm > 100;
    const hingeEnd = (door.door_hinge || "start") === "end";
    const leaves = double
      ? [{ hinge: start, along: axisVector, length: length / 2 }, { hinge: end, along: back, length: length / 2 }]
      : [{ hinge: hingeEnd ? end : start, along: hingeEnd ? back : axisVector, length }];
    return { swingSide, leaves, start, end };
  }

  return {
    DEFAULT_SCALE,
    REAL_SIZES_CM,
    scaleOf,
    cmToTiles,
    realSizeCm,
    realRect,
    rotatedFootprint,
    doorOpening,
    doorLeaves,
    wallGeometry,
    rectMinus,
    bandRect
  };
});
