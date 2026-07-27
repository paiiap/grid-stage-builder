(function initCore(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.HouseMapCore = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : null, function createCore() {
  "use strict";

  const MAP_WIDTH = 48;
  const MAP_HEIGHT = 48;
  const TILE_SIZE = 48;
  const TERRAIN = ["indoor_floor", "outdoor_ground", "garden", "void"];
  const STRUCTURE = ["none", "wall", "door", "window", "blocked"];
  const BUILD = ["allowed", "blocked", "reserved"];
  const MARKERS = ["spawn", "base", "build_slot", "choke_point", "waypoint"];
  const DEFAULT_ROOM_DEFINITIONS = [
    { id: "living_room", name: "ห้องนั่งเล่น", type: "living_room", color: "#2f8f73", terrain: "indoor_floor" },
    { id: "kitchen", name: "ครัว", type: "kitchen", color: "#c27a34", terrain: "indoor_floor" },
    { id: "dining_room", name: "ห้องกินข้าว", type: "dining_room", color: "#b69535", terrain: "indoor_floor" },
    { id: "bedroom", name: "ห้องนอน", type: "bedroom", color: "#5e82c4", terrain: "indoor_floor" },
    { id: "bathroom", name: "ห้องน้ำ", type: "bathroom", color: "#4aa0b5", terrain: "indoor_floor" },
    { id: "cat_room", name: "ห้องแมว", type: "cat_room", color: "#b0659f", terrain: "indoor_floor" },
    { id: "garden", name: "สวน", type: "garden", color: "#4f9b58", terrain: "garden" },
    { id: "balcony", name: "ระเบียงบ้าน", type: "balcony", color: "#9f7b4f", terrain: "outdoor_ground" }
  ];
  const DEFAULT_OBJECT_DEFINITIONS = [
    { room_id: "common", id: "door", name: "ประตู" },
    { room_id: "common", id: "window", name: "หน้าต่าง" },
    { room_id: "common", id: "plant", name: "ต้นไม้" },
    { room_id: "common", id: "decoration", name: "ของตกแต่ง" },
    { room_id: "common", id: "gameplay_obstacle", name: "สิ่งกีดขวาง" },
    { room_id: "living_room", id: "sofa", name: "โซฟา" },
    { room_id: "living_room", id: "coffee_table", name: "โต๊ะกลาง" },
    { room_id: "living_room", id: "tv", name: "ทีวี" },
    { room_id: "living_room", id: "tv_stand", name: "ชั้นวางทีวี" },
    { room_id: "living_room", id: "rug", name: "พรม" },
    { room_id: "living_room", id: "bookshelf", name: "ชั้นหนังสือ" },
    { room_id: "living_room", id: "armchair", name: "เก้าอี้เดี่ยว" },
    { room_id: "living_room", id: "floor_lamp", name: "โคมไฟ" },
    { room_id: "kitchen", id: "fridge", name: "ตู้เย็น" },
    { room_id: "kitchen", id: "sink", name: "อ่างล้างจาน" },
    { room_id: "kitchen", id: "stove", name: "เตา" },
    { room_id: "kitchen", id: "kitchen_counter", name: "เคาน์เตอร์ครัว" },
    { room_id: "kitchen", id: "kitchen_island", name: "เกาะกลางครัว" },
    { room_id: "kitchen", id: "trash_bin", name: "ถังขยะ" },
    { room_id: "kitchen", id: "storage_shelf", name: "ชั้นเก็บของ" },
    { room_id: "kitchen", id: "cat_bowl", name: "ชามอาหารแมว" },
    { room_id: "dining_room", id: "dining_table", name: "โต๊ะกินข้าว" },
    { room_id: "dining_room", id: "dining_chair", name: "เก้าอี้" },
    { room_id: "dining_room", id: "display_cabinet", name: "ตู้โชว์" },
    { room_id: "dining_room", id: "serving_cart", name: "รถเข็นอาหาร" },
    { room_id: "dining_room", id: "rug", name: "พรม" },
    { room_id: "bedroom", id: "bed", name: "เตียง" },
    { room_id: "bedroom", id: "nightstand", name: "โต๊ะหัวเตียง" },
    { room_id: "bedroom", id: "closet", name: "ตู้เสื้อผ้า" },
    { room_id: "bedroom", id: "vanity", name: "โต๊ะเครื่องแป้ง" },
    { room_id: "bedroom", id: "floor_lamp", name: "โคมไฟ" },
    { room_id: "bedroom", id: "rug", name: "พรม" },
    { room_id: "bedroom", id: "laundry_basket", name: "ตะกร้าผ้า" },
    { room_id: "bathroom", id: "tub", name: "อ่างอาบน้ำ" },
    { room_id: "bathroom", id: "toilet", name: "โถส้วม" },
    { room_id: "bathroom", id: "sink", name: "อ่างล้างจาน" },
    { room_id: "bathroom", id: "shower", name: "ฝักบัว" },
    { room_id: "bathroom", id: "medicine_cabinet", name: "ตู้ยา" },
    { room_id: "bathroom", id: "towel_shelf", name: "ชั้นผ้าเช็ดตัว" },
    { room_id: "bathroom", id: "bath_mat", name: "พรมห้องน้ำ" },
    { room_id: "cat_room", id: "cat_tree", name: "คอนโดแมว" },
    { room_id: "cat_room", id: "litter_box", name: "กระบะทราย" },
    { room_id: "cat_room", id: "cat_bowl", name: "ชามอาหารแมว" },
    { room_id: "cat_room", id: "cat_bed", name: "ที่นอนแมว" },
    { room_id: "cat_room", id: "cat_toy", name: "ของเล่นแมว" },
    { room_id: "cat_room", id: "scratching_post", name: "เสาลับเล็บ" },
    { room_id: "cat_room", id: "cat_tunnel", name: "อุโมงค์แมว" },
    { room_id: "garden", id: "plant", name: "ต้นไม้" },
    { room_id: "garden", id: "potted_plant", name: "กระถาง" },
    { room_id: "garden", id: "bush", name: "พุ่มไม้" },
    { room_id: "garden", id: "garden_table", name: "โต๊ะสนาม" },
    { room_id: "garden", id: "garden_chair", name: "เก้าอี้สนาม" },
    { room_id: "garden", id: "small_fountain", name: "น้ำพุเล็ก" },
    { room_id: "garden", id: "stepping_stone", name: "หินทางเดิน" },
    { room_id: "garden", id: "low_fence", name: "รั้วเตี้ย" },
    { room_id: "balcony", id: "balcony_chair", name: "เก้าอี้ระเบียง" },
    { room_id: "balcony", id: "small_table", name: "โต๊ะเล็ก" },
    { room_id: "balcony", id: "potted_plant", name: "กระถาง" },
    { room_id: "balcony", id: "balcony_rail", name: "ราวระเบียง" },
    { room_id: "balcony", id: "mat", name: "เสื่อ" },
    { room_id: "balcony", id: "storage_box", name: "กล่องเก็บของ" }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function cellKey(x, y) {
    return `${x},${y}`;
  }

  function inBounds(doc, x, y) {
    return x >= 0 && y >= 0 && x < doc.map.width && y < doc.map.height;
  }

  function tileIndex(doc, x, y) {
    return y * doc.map.width + x;
  }

  function createDocument() {
    const map = {
      id: "pawtectors_house",
      name: "Pawtectors House",
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      tile_size: TILE_SIZE,
      floor_count: 1
    };
    const tiles = Array.from({ length: MAP_WIDTH * MAP_HEIGHT }, (_, index) => ({
      x: index % MAP_WIDTH,
      y: Math.floor(index / MAP_WIDTH),
      terrain: "void",
      structure: "none",
      room_id: null,
      build: "blocked",
      notes: ""
    }));
    return {
      schema_version: 1,
      active_map_id: map.id,
      map,
      tiles,
      rooms: [],
      room_definitions: clone(DEFAULT_ROOM_DEFINITIONS),
      objects: [],
      object_definitions: clone(DEFAULT_OBJECT_DEFINITIONS),
      paths: [],
      markers: [],
      stages: [],
      maps: [{
        id: map.id,
        name: map.name,
        map: clone(map),
        tiles: clone(tiles),
        rooms: [],
        room_definitions: clone(DEFAULT_ROOM_DEFINITIONS),
        objects: [],
        object_definitions: clone(DEFAULT_OBJECT_DEFINITIONS),
        paths: [],
        markers: [],
        stages: []
      }]
    };
  }

  function getTile(doc, x, y) {
    if (!inBounds(doc, x, y)) return null;
    return doc.tiles[tileIndex(doc, x, y)];
  }

  function setTile(doc, x, y, patch) {
    if (!inBounds(doc, x, y)) return doc;
    const next = clone(doc);
    const index = tileIndex(next, x, y);
    next.tiles[index] = Object.assign({}, next.tiles[index], patch, { x, y });
    return next;
  }

  function mutateTile(doc, x, y, patch) {
    if (!inBounds(doc, x, y)) return;
    const index = tileIndex(doc, x, y);
    doc.tiles[index] = Object.assign({}, doc.tiles[index], patch, { x, y });
  }

  function rectCells(x, y, width, height) {
    const cells = [];
    for (let yy = y; yy < y + height; yy += 1) {
      for (let xx = x; xx < x + width; xx += 1) {
        cells.push({ x: xx, y: yy });
      }
    }
    return cells;
  }

  function rotatedSize(object) {
    const rotation = Number(object.rotation || 0) % 360;
    if (rotation === 90 || rotation === 270) {
      return { width: Number(object.height || 1), height: Number(object.width || 1) };
    }
    return { width: Number(object.width || 1), height: Number(object.height || 1) };
  }

  function objectFootprint(object) {
    const size = rotatedSize(object);
    return rectCells(Number(object.x || 0), Number(object.y || 0), size.width, size.height);
  }

  function expandPoint(point, widthTiles, axis) {
    if (widthTiles <= 1) return [{ x: point.x, y: point.y }];
    const cells = [];
    for (let offset = 0; offset < widthTiles; offset += 1) {
      if (axis === "x") {
        cells.push({ x: point.x + offset, y: point.y });
      } else {
        cells.push({ x: point.x, y: point.y + offset });
      }
    }
    return cells;
  }

  function perpendicularAxis(a, b) {
    if (a.x === b.x) return "x";
    return "y";
  }

  function lineCells(a, b) {
    const cells = [];
    if (a.x !== b.x && a.y !== b.y) return cells;
    const dx = Math.sign(b.x - a.x);
    const dy = Math.sign(b.y - a.y);
    let x = a.x;
    let y = a.y;
    cells.push({ x, y });
    while (x !== b.x || y !== b.y) {
      x += dx;
      y += dy;
      cells.push({ x, y });
    }
    return cells;
  }

  function rasterizePath(path) {
    const seen = new Set();
    const cells = [];
    const points = path.points || [];
    const widthTiles = Math.max(1, Number(path.width_tiles || 1));
    for (let index = 0; index < points.length - 1; index += 1) {
      const axis = perpendicularAxis(points[index], points[index + 1]);
      for (const center of lineCells(points[index], points[index + 1])) {
        for (const cell of expandPoint(center, widthTiles, axis)) {
          const key = cellKey(cell.x, cell.y);
          if (!seen.has(key)) {
            seen.add(key);
            cells.push(cell);
          }
        }
      }
    }
    if (points.length === 1) {
      for (const cell of expandPoint(points[0], widthTiles, "y")) {
        const key = cellKey(cell.x, cell.y);
        if (!seen.has(key)) {
          seen.add(key);
          cells.push(cell);
        }
      }
    }
    return cells;
  }

  function pathAreaCells(areas) {
    const seen = new Set();
    const cells = [];
    for (const area of areas || []) {
      for (const cell of rectCells(Number(area.x || 0), Number(area.y || 0), Number(area.width || 1), Number(area.height || 1))) {
        const key = cellKey(cell.x, cell.y);
        if (!seen.has(key)) {
          seen.add(key);
          cells.push(cell);
        }
      }
    }
    return cells;
  }

  function markerAtPoint(markers, type, point) {
    if (!point) return null;
    return (markers || []).find((marker) => marker.type === type && point.x >= marker.x && point.y >= marker.y && point.x < marker.x + (marker.width || 1) && point.y < marker.y + (marker.height || 1));
  }

  function pathEndpointId(path, markers, type) {
    const explicit = type === "spawn" ? path.spawn_id : path.base_id;
    if (explicit) return explicit;
    const points = path.points || [];
    const point = type === "spawn" ? points[0] : points[points.length - 1];
    return markerAtPoint(markers, type, point)?.id || "";
  }

  function mergeCells(groups) {
    const seen = new Set();
    const cells = [];
    for (const group of groups) {
      for (const cell of group) {
        const key = cellKey(cell.x, cell.y);
        if (!seen.has(key)) {
          seen.add(key);
          cells.push(cell);
        }
      }
    }
    return cells;
  }

  function stageForId(doc, stageId) {
    return doc.stages.find((stage) => stage.id === stageId) || doc.stages[0] || null;
  }

  function stageBounds(stage) {
    const bounds = stage.bounds || stage;
    return {
      x: Number(bounds.x || 0),
      y: Number(bounds.y || 0),
      width: Number(bounds.width || 0),
      height: Number(bounds.height || 0)
    };
  }

  function stageMarkers(doc, stage) {
    if (Array.isArray(stage.markers)) return stage.markers;
    return (doc.markers || []).filter((marker) => markerInsideStage(marker, stage));
  }

  function stagePaths(doc, stage) {
    if (Array.isArray(stage.paths)) return stage.paths;
    return doc.paths || [];
  }

  function insideRect(item, rect) {
    return item.x >= rect.x && item.y >= rect.y && item.x < rect.x + rect.width && item.y < rect.y + rect.height;
  }

  function markerInsideStage(marker, stage) {
    const width = marker.width || 1;
    const height = marker.height || 1;
    const bounds = stageBounds(stage);
    return marker.x >= bounds.x &&
      marker.y >= bounds.y &&
      marker.x + width <= bounds.x + bounds.width &&
      marker.y + height <= bounds.y + bounds.height;
  }

  function validateDocument(doc) {
    const errors = [];
    const warnings = [];
    if (!doc || doc.schema_version !== 1) errors.push("schema_version must be 1.");
    if (!doc || !doc.map || doc.map.width !== MAP_WIDTH || doc.map.height !== MAP_HEIGHT) {
      errors.push("map dimensions must be 48 x 48.");
    }
    if (!doc || !Array.isArray(doc.tiles) || doc.tiles.length !== MAP_WIDTH * MAP_HEIGHT) {
      errors.push("tiles must contain 2304 entries.");
    }
    if (!doc) return { errors, warnings };

    const roomIds = new Set((doc.rooms || []).map((room) => room.id));
    for (const tile of doc.tiles || []) {
      if (!inBounds(doc, tile.x, tile.y)) errors.push(`tile ${tile.x},${tile.y} is outside map.`);
      if (!TERRAIN.includes(tile.terrain)) errors.push(`tile ${tile.x},${tile.y} has invalid terrain.`);
      if (!STRUCTURE.includes(tile.structure)) errors.push(`tile ${tile.x},${tile.y} has invalid structure.`);
      if (!BUILD.includes(tile.build)) errors.push(`tile ${tile.x},${tile.y} has invalid build state.`);
      if (tile.room_id && !roomIds.has(tile.room_id)) errors.push(`tile ${tile.x},${tile.y} references missing room ${tile.room_id}.`);
    }

    const blockingCells = new Set();
    const blockingObjectsByCell = new Map();
    for (const object of doc.objects || []) {
      for (const cell of objectFootprint(object)) {
        if (!inBounds(doc, cell.x, cell.y)) errors.push(`object ${object.id} extends outside map.`);
        const key = cellKey(cell.x, cell.y);
        if (object.blocking && !object.allow_overlap && blockingCells.has(key)) errors.push(`object ${object.id} overlaps another blocking object.`);
        if (object.blocking && !object.allow_overlap) {
          blockingCells.add(key);
          if (!blockingObjectsByCell.has(key)) blockingObjectsByCell.set(key, []);
          blockingObjectsByCell.get(key).push(object.id);
        }
      }
    }

    for (const marker of doc.markers || []) {
      if (!MARKERS.includes(marker.type)) errors.push(`marker ${marker.id} has invalid type.`);
      if (!inBounds(doc, marker.x, marker.y)) errors.push(`marker ${marker.id} is outside map.`);
    }

    const blockingObjectLabel = (cell) => {
      const ids = blockingObjectsByCell.get(cellKey(cell.x, cell.y)) || [];
      return ids.length ? ` object ${ids.join(",")}` : " blocking object";
    };
    const stageLabel = (stage) => `${stage.name || stage.id} (${stage.id})`;
    const pathLabel = (path, stage) => stage ? `stage ${stageLabel(stage)} path ${path.id}` : `path ${path.id}`;

    const validatePath = (path, markersForPath, stage) => {
      const seen = new Set();
      const points = path.points || [];
      if (points.length < 2) errors.push(`${pathLabel(path, stage)} needs at least two points.`);
      for (const point of points) {
        if (!inBounds(doc, point.x, point.y)) errors.push(`${pathLabel(path, stage)} point ${point.x},${point.y} is outside map.`);
        const key = cellKey(point.x, point.y);
        if (seen.has(key)) warnings.push(`${pathLabel(path, stage)} repeats ${key}.`);
        seen.add(key);
      }
      for (let index = 0; index < points.length - 1; index += 1) {
        const a = points[index];
        const b = points[index + 1];
        if (a.x !== b.x && a.y !== b.y) errors.push(`${pathLabel(path, stage)} has diagonal step from ${a.x},${a.y} to ${b.x},${b.y}.`);
      }
      for (const cell of rasterizePath(path)) {
        if (!inBounds(doc, cell.x, cell.y)) errors.push(`${pathLabel(path, stage)} footprint leaves map at ${cell.x},${cell.y}.`);
        const tile = getTile(doc, cell.x, cell.y);
        if (tile && (tile.structure === "wall" || tile.structure === "blocked")) {
          errors.push(`${pathLabel(path, stage)} collides with blocked tile ${cell.x},${cell.y}.`);
        }
        if (blockingCells.has(cellKey(cell.x, cell.y))) {
          errors.push(`${pathLabel(path, stage)} collides with${blockingObjectLabel(cell)} at ${cell.x},${cell.y}.`);
        }
      }
      for (const cell of pathAreaCells(path.areas)) {
        if (!inBounds(doc, cell.x, cell.y)) errors.push(`${pathLabel(path, stage)} area leaves map at ${cell.x},${cell.y}.`);
        const tile = getTile(doc, cell.x, cell.y);
        if (tile && (tile.structure === "wall" || tile.structure === "blocked")) {
          errors.push(`${pathLabel(path, stage)} area collides with blocked tile ${cell.x},${cell.y}.`);
        }
        if (blockingCells.has(cellKey(cell.x, cell.y))) {
          errors.push(`${pathLabel(path, stage)} area collides with${blockingObjectLabel(cell)} at ${cell.x},${cell.y}.`);
        }
      }
      if (markersForPath) {
        const spawnId = pathEndpointId(path, markersForPath, "spawn");
        const baseId = pathEndpointId(path, markersForPath, "base");
        const spawn = markersForPath.find((marker) => marker.id === spawnId && marker.type === "spawn");
        const base = markersForPath.find((marker) => marker.id === baseId && marker.type === "base");
        if (!spawnId) errors.push(`${pathLabel(path, stage)} needs a spawn.`);
        if (spawnId && !spawn) errors.push(`${pathLabel(path, stage)} references missing spawn ${spawnId}.`);
        if (!baseId) errors.push(`${pathLabel(path, stage)} needs a base.`);
        if (baseId && !base) errors.push(`${pathLabel(path, stage)} references missing base ${baseId}.`);
        if (spawn && points[0] && !markerAtPoint([spawn], "spawn", points[0])) errors.push(`${pathLabel(path, stage)} must start on spawn ${spawn.id}.`);
        if (base && points[points.length - 1] && !markerAtPoint([base], "base", points[points.length - 1])) errors.push(`${pathLabel(path, stage)} must end on base ${base.id}.`);
      }
    };

    for (const path of doc.paths || []) validatePath(path);

    for (const stage of doc.stages || []) {
      const bounds = stageBounds(stage);
      if (bounds.width <= 0 || bounds.height <= 0) errors.push(`stage ${stage.id} has empty bounds.`);
      if (bounds.x < 0 || bounds.y < 0 || bounds.x + bounds.width > MAP_WIDTH || bounds.y + bounds.height > MAP_HEIGHT) {
        errors.push(`stage ${stage.id} is outside the master map.`);
      }
      for (const marker of stage.markers || []) {
        if (!MARKERS.includes(marker.type)) errors.push(`marker ${marker.id} has invalid type.`);
        if (!inBounds(doc, marker.x, marker.y)) errors.push(`marker ${marker.id} is outside map.`);
      }
      const markersForStage = stageMarkers(doc, stage);
      for (const path of stage.paths || []) validatePath(path, markersForStage, stage);
      for (const cell of pathAreaCells(stage.path_areas)) {
        if (!inBounds(doc, cell.x, cell.y)) errors.push(`stage ${stage.id} path area leaves map at ${cell.x},${cell.y}.`);
        const tile = getTile(doc, cell.x, cell.y);
        if (tile && (tile.structure === "wall" || tile.structure === "blocked")) {
          errors.push(`stage ${stage.id} path area collides with blocked tile ${cell.x},${cell.y}.`);
        }
        if (blockingCells.has(cellKey(cell.x, cell.y))) {
          errors.push(`stage ${stageLabel(stage)} path area collides with${blockingObjectLabel(cell)} at ${cell.x},${cell.y}.`);
        }
      }
      const spawns = markersForStage.filter((marker) => marker.type === "spawn");
      const bases = markersForStage.filter((marker) => marker.type === "base");
      if (!spawns.length && (stage.paths || []).length) errors.push(`stage ${stage.id} needs at least one spawn for its paths.`);
      if (!bases.length && (stage.paths || []).length) errors.push(`stage ${stage.id} needs at least one base for its paths.`);
      if (!markersForStage.some((marker) => marker.type === "build_slot")) warnings.push(`stage ${stage.id} has no build slots.`);
    }

    return { errors: Array.from(new Set(errors)), warnings: Array.from(new Set(warnings)) };
  }

  function exportSize(stage) {
    const bounds = stageBounds(stage);
    const direction = stage.top_direction || "north";
    if (direction === "east" || direction === "west") return { width: bounds.height, height: bounds.width };
    return { width: bounds.width, height: bounds.height };
  }

  function rotateLocalPoint(x, y, bounds, direction) {
    if (direction === "east") return { x: y, y: bounds.width - 1 - x };
    if (direction === "south") return { x: bounds.width - 1 - x, y: bounds.height - 1 - y };
    if (direction === "west") return { x: bounds.height - 1 - y, y: x };
    return { x, y };
  }

  function rotateFacing(facing, direction) {
    const order = ["north", "east", "south", "west"];
    const index = order.indexOf(facing);
    if (index < 0) return facing;
    const turns = { north: 0, east: 3, south: 2, west: 1 }[direction] || 0;
    return order[(index + turns) % order.length];
  }

  function normalizePoint(point, stage) {
    const bounds = stageBounds(stage);
    const local = { x: point.x - bounds.x, y: point.y - bounds.y };
    const rotated = rotateLocalPoint(local.x, local.y, bounds, stage.top_direction || "north");
    return { x: rotated.x, y: rotated.y, master_x: point.x, master_y: point.y };
  }

  function markerCells(marker) {
    return rectCells(marker.x, marker.y, marker.width || 1, marker.height || 1);
  }

  function stageGameplayCells(doc, stage) {
    const cells = [];
    for (const marker of stageMarkers(doc, stage)) cells.push(...markerCells(marker));
    for (const path of stagePaths(doc, stage)) cells.push(...rasterizePath(path), ...pathAreaCells(path.areas));
    cells.push(...pathAreaCells(stage.path_areas));
    return mergeCells([cells]).filter((cell) => insideRect(cell, stageBounds(stage)));
  }

  function stageExportScope(doc, stage) {
    const gameplayCells = stageGameplayCells(doc, stage);
    const gameplayCellKeys = new Set(gameplayCells.map((cell) => cellKey(cell.x, cell.y)));
    const roomIds = new Set();
    for (const cell of gameplayCells) {
      const tile = getTile(doc, cell.x, cell.y);
      if (tile?.room_id) roomIds.add(tile.room_id);
    }
    return { roomIds, gameplayCellKeys };
  }

  function tileInStageExportScope(tile, scope) {
    if (tile.room_id && scope.roomIds.has(tile.room_id)) return true;
    return scope.gameplayCellKeys.has(cellKey(tile.x, tile.y));
  }

  function objectInStageExportScope(doc, object, scope) {
    return objectFootprint(object).some((cell) => {
      if (scope.gameplayCellKeys.has(cellKey(cell.x, cell.y))) return true;
      const tile = getTile(doc, cell.x, cell.y);
      return tile?.room_id && scope.roomIds.has(tile.room_id);
    });
  }

  function exportRooms(doc, roomIds, localTiles) {
    return (doc.rooms || [])
      .filter((room) => roomIds.has(room.id))
      .map((room) => Object.assign({}, room, {
        cells: localTiles
          .filter((tile) => tile.room_id === room.id)
          .map((tile) => ({ x: tile.x, y: tile.y, master_x: tile.master_x, master_y: tile.master_y }))
      }));
  }

  function normalizeObject(object, stage) {
    const bounds = stageBounds(stage);
    const direction = stage.top_direction || "north";
    const cells = objectFootprint(object)
      .filter((cell) => insideRect(cell, bounds))
      .map((cell) => rotateLocalPoint(cell.x - bounds.x, cell.y - bounds.y, bounds, direction));
    const minX = Math.min(...cells.map((cell) => cell.x));
    const minY = Math.min(...cells.map((cell) => cell.y));
    const maxX = Math.max(...cells.map((cell) => cell.x));
    const maxY = Math.max(...cells.map((cell) => cell.y));
    const rotationTurns = { north: 0, east: 270, south: 180, west: 90 }[direction] || 0;
    return Object.assign({}, object, {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      rotation: (Number(object.rotation || 0) + rotationTurns) % 360,
      facing: rotateFacing(object.facing, direction),
      master_x: object.x,
      master_y: object.y
    });
  }

  function exportStageJson(doc, stageId) {
    const stage = stageForId(doc, stageId);
    if (!stage) throw new Error("No stage frame available.");
    const bounds = stageBounds(stage);
    const size = exportSize(stage);
    const scope = stageExportScope(doc, stage);
    const localTiles = (doc.tiles || [])
      .filter((tile) => insideRect(tile, bounds) && tileInStageExportScope(tile, scope))
      .map((tile) => Object.assign({}, tile, normalizePoint(tile, stage)));
    const roomsInStage = new Set(localTiles.map((tile) => tile.room_id).filter(Boolean));
    const objectList = (doc.objects || [])
      .filter((object) => objectFootprint(object).some((cell) => insideRect(cell, bounds)) && objectInStageExportScope(doc, object, scope))
      .map((object) => normalizeObject(object, stage));
    const sourceMarkers = stageMarkers(doc, stage).filter((marker) => markerInsideStage(marker, stage));
    const markerList = sourceMarkers
      .map((marker) => Object.assign({}, marker, normalizePoint(marker, stage)));
    const pathList = stagePaths(doc, stage)
      .map((path, index) => {
        const extraAreas = pathAreaCells([...(path.areas || []), ...(index === 0 ? stage.path_areas || [] : [])]);
        return Object.assign({}, path, {
          spawn_id: pathEndpointId(path, sourceMarkers, "spawn"),
          base_id: pathEndpointId(path, sourceMarkers, "base"),
          points: (path.points || []).filter((point) => insideRect(point, bounds)).map((point) => normalizePoint(point, stage)),
          footprint: mergeCells([rasterizePath(path), extraAreas])
          .filter((cell) => insideRect(cell, bounds))
          .map((cell) => normalizePoint(cell, stage))
        });
      })
      .filter((path) => path.points.length > 0 || path.footprint.length > 0);
    return {
      schema_version: 1,
      source_map_id: doc.map.id,
      stage_id: stage.id,
      name: stage.name,
      bounds,
      local: { width: size.width, height: size.height, tile_size: stage.export_tile_size || doc.map.tile_size },
      rooms: exportRooms(doc, roomsInStage, localTiles),
      tiles: localTiles,
      objects: objectList,
      paths: pathList,
      markers: markerList,
      export: {
        padding_color: stage.padding_color || "#ebe2d2",
        top_direction: stage.top_direction || "north",
        portrait: size.height >= size.width
      }
    };
  }

  function buildPrompt(doc, stageId) {
    const stage = exportStageJson(doc, stageId);
    const roomNames = stage.rooms.map((room) => room.name || room.id).join(", ") || "unnamed rooms";
    const objectText = stage.objects.map((object) => `${object.name || object.id} at tile ${object.x},${object.y} size ${object.width}x${object.height} rotation ${object.rotation || 0}`).join("; ") || "no furniture objects";
    const markers = stage.markers.map((marker) => `${marker.type} at ${marker.x},${marker.y}`).join("; ") || "no markers";
    const pathText = stage.paths.length
      ? `${stage.paths.length} enemy paths with ${stage.paths.reduce((sum, path) => sum + path.points.length, 0)} total centerline points`
      : "no enemy path";
    return [
      `Portrait top-down block-grid game map, ${stage.local.width} x ${stage.local.height} tiles, square 48x48 pixel cells, single-floor Pawtectors house stage.`,
      `Included zones: ${roomNames}.`,
      `Objects: ${objectText}.`,
      `Gameplay layout: ${pathText}; markers: ${markers}.`,
      "Use warm wood indoor floors, muted green outdoor or garden tiles, cool gray walls, cream enemy path, coral spawn arrows, blue base marker, and dashed white build slots.",
      "Keep all walls, furniture footprints, doors, paths, and build slots aligned exactly to the visible block grid.",
      "Negative: no perspective, no isometric camera, no distorted cells, no extra doors, no extra furniture, no HUD, no text labels, no characters, no enemies."
    ].join("\n");
  }

  function addRoom(doc, room) {
    doc.rooms.push(room);
    for (const cell of room.cells || []) {
      mutateTile(doc, cell.x, cell.y, {
        terrain: room.type === "garden" || room.type === "front_yard" ? "garden" : "indoor_floor",
        structure: "none",
        room_id: room.id,
        build: "allowed"
      });
    }
  }

  function makeSampleDocument() {
    const doc = createDocument();
    addRoom(doc, {
      id: "living_room",
      name: "Living Room",
      type: "living_room",
      color: "#c9975d",
      notes: "Warm wooden living area with couch lane.",
      cells: rectCells(2, 3, 18, 28)
    });
    addRoom(doc, {
      id: "kitchen",
      name: "Kitchen",
      type: "kitchen",
      color: "#8ebf72",
      notes: "Kitchen zone connected to living room.",
      cells: rectCells(20, 8, 12, 16)
    });
    for (const cell of rectCells(2, 3, 18, 28)) {
      if (cell.x === 2 || cell.x === 19 || cell.y === 3 || cell.y === 30) {
        mutateTile(doc, cell.x, cell.y, { structure: "wall", build: "blocked" });
      }
    }
    for (const cell of rectCells(3, 4, 16, 26)) {
      mutateTile(doc, cell.x, cell.y, { structure: "none", build: "allowed" });
    }
    doc.objects.push(
      { id: "blue_sofa", name: "Blue Sofa", category: "furniture", x: 7, y: 5, width: 7, height: 3, rotation: 0, room_id: "living_room", blocking: true, notes: "Large couch along north wall." },
      { id: "coffee_table", name: "Coffee Table", category: "furniture", x: 8, y: 15, width: 5, height: 3, rotation: 0, room_id: "living_room", blocking: true, notes: "Central low table." },
      { id: "plant_corner", name: "Corner Plant", category: "plant", x: 16, y: 7, width: 2, height: 2, rotation: 0, room_id: "living_room", blocking: true, notes: "Plant cover." },
      { id: "entry_door", name: "Entry Door", category: "door", x: 2, y: 16, width: 1, height: 2, rotation: 0, facing: "east", door_type: "hinged", door_swing: "in", open_state: "open", room_id: "living_room", blocking: false, notes: "Object-based door." },
      { id: "kitchen_door", name: "Kitchen Door", category: "door", x: 19, y: 20, width: 1, height: 2, rotation: 0, facing: "east", door_type: "sliding", door_swing: "right", open_state: "closed", room_id: "living_room", blocking: true, notes: "Object-based sliding door." }
    );
    doc.stages.push({
      id: "stage_living_room",
      name: "Living Room Stage",
      x: 2,
      y: 3,
      width: 18,
      height: 28,
      bounds: { x: 2, y: 3, width: 18, height: 28 },
      ratio: "custom",
      top_direction: "north",
      included_room_ids: ["living_room"],
      padding_color: "#efe5d2",
      export_tile_size: 48,
      markers: [
        { id: "spawn_01", type: "spawn", x: 3, y: 17, width: 1, height: 1, label: "Spawn" },
        { id: "base_01", type: "base", x: 18, y: 22, width: 1, height: 1, label: "Base" },
        { id: "slot_01", type: "build_slot", x: 5, y: 9, width: 2, height: 2, label: "Slot A" },
        { id: "slot_02", type: "build_slot", x: 12, y: 16, width: 2, height: 2, label: "Slot B" },
        { id: "slot_03", type: "build_slot", x: 15, y: 24, width: 2, height: 2, label: "Slot C" }
      ],
      paths: [{
        id: "main_path",
        name: "Main Path",
        width_tiles: 1,
        points: [
          { x: 3, y: 17 },
          { x: 7, y: 17 },
          { x: 7, y: 12 },
          { x: 14, y: 12 },
          { x: 14, y: 22 },
          { x: 18, y: 22 }
        ]
      }],
      path_areas: [],
      build_tiles: [],
      waves: []
    });
    doc.active_map_id = doc.map.id;
    doc.maps = [{
      id: doc.map.id,
      name: doc.map.name,
      map: clone(doc.map),
      tiles: clone(doc.tiles),
      rooms: clone(doc.rooms),
      room_definitions: clone(doc.room_definitions || DEFAULT_ROOM_DEFINITIONS),
      objects: clone(doc.objects),
      object_definitions: clone(doc.object_definitions || DEFAULT_OBJECT_DEFINITIONS),
      paths: clone(doc.paths),
      markers: clone(doc.markers),
      stages: clone(doc.stages)
    }];
    return doc;
  }

  return {
    MAP_WIDTH,
    MAP_HEIGHT,
    TILE_SIZE,
    TERRAIN,
    STRUCTURE,
    BUILD,
    MARKERS,
    createDocument,
    getTile,
    setTile,
    rectCells,
    objectFootprint,
    rasterizePath,
    pathAreaCells,
    stageBounds,
    validateDocument,
    exportStageJson,
    buildPrompt,
    makeSampleDocument
  };
});
