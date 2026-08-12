(function initWallModel(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.GridWallModel = api;
})(typeof globalThis !== "undefined" ? globalThis : null, function createWallModel() {
  "use strict";

  const DIR = { N: 1, NE: 2, E: 4, SE: 8, S: 16, SW: 32, W: 64, NW: 128 };
  const CARDINAL_MASK = DIR.N | DIR.E | DIR.S | DIR.W;

  function normalizeNeighborMask(mask) {
    return (mask & 255) & CARDINAL_MASK;
  }

  const canonicalMasks = [...new Set(
    Array.from({ length: 256 }, (_, mask) => normalizeNeighborMask(mask))
  )].sort((a, b) => a - b);

  function mapSize(map) {
    const source = map?.map || map || {};
    return { width: Number(source.width || 0), height: Number(source.height || 0) };
  }

  function clamp(value, maximum) {
    return Math.max(0, Math.min(Math.max(0, maximum - 1), Math.round(Number(value) || 0)));
  }

  function normalizeWallSegment(segment, map) {
    const size = mapSize(map);
    const axis = segment?.axis === "vertical" ? "vertical" : "horizontal";
    const start = segment?.start || {};
    const end = segment?.end || {};
    if (axis === "vertical") {
      const x = clamp(start.x, size.width);
      const firstY = clamp(start.y, size.height);
      const lastY = clamp(end.y, size.height);
      return {
        id: segment?.id,
        axis,
        start: { x, y: Math.min(firstY, lastY) },
        end: { x, y: Math.max(firstY, lastY) }
      };
    }
    const y = clamp(start.y, size.height);
    const firstX = clamp(start.x, size.width);
    const lastX = clamp(end.x, size.width);
    return {
      id: segment?.id,
      axis,
      start: { x: Math.min(firstX, lastX), y },
      end: { x: Math.max(firstX, lastX), y }
    };
  }

  function axisLockedEndpoint(start, current) {
    const dx = Number(current.x) - Number(start.x);
    const dy = Number(current.y) - Number(start.y);
    if (Math.abs(dx) >= Math.abs(dy)) {
      return { axis: "horizontal", end: { x: current.x, y: start.y } };
    }
    return { axis: "vertical", end: { x: start.x, y: current.y } };
  }

  function rasterizeWallSegment(segment) {
    const cells = [];
    if (!segment) return cells;
    if (segment.axis === "vertical") {
      const x = segment.start.x;
      const firstY = Math.min(segment.start.y, segment.end.y);
      const lastY = Math.max(segment.start.y, segment.end.y);
      for (let y = firstY; y <= lastY; y += 1) cells.push({ x, y });
      return cells;
    }
    const y = segment.start.y;
    const firstX = Math.min(segment.start.x, segment.end.x);
    const lastX = Math.max(segment.start.x, segment.end.x);
    for (let x = firstX; x <= lastX; x += 1) cells.push({ x, y });
    return cells;
  }

  function segmentsAtCell(segments, cell, axis) {
    return (segments || []).slice().reverse().filter((segment) => {
      if (!segment || (axis && segment.axis !== axis)) return false;
      return rasterizeWallSegment(segment).some((item) => item.x === cell.x && item.y === cell.y);
    });
  }

  function selectionAxisAtPoint(cell, point, size) {
    const tileSize = Math.max(1, Number(size) || 1);
    const centerX = Number(cell.x) * tileSize + tileSize / 2;
    const centerY = Number(cell.y) * tileSize + tileSize / 2;
    return Math.abs(Number(point.x) - centerX) >= Math.abs(Number(point.y) - centerY)
      ? "horizontal"
      : "vertical";
  }

  function resizeWallSegment(segment, handle, cell, map) {
    const next = {
      id: segment?.id,
      axis: segment?.axis,
      start: Object.assign({}, segment?.start),
      end: Object.assign({}, segment?.end)
    };
    const endpoint = handle === "end" ? next.end : next.start;
    if (next.axis === "vertical") endpoint.y = cell.y;
    else endpoint.x = cell.x;
    return normalizeWallSegment(next, map);
  }

  function wallCoverage(segments) {
    const coverage = new Set();
    for (const segment of segments || []) {
      for (const cell of rasterizeWallSegment(segment)) coverage.add(`${cell.x},${cell.y}`);
    }
    return coverage;
  }

  function atlasIndexForMask(mask) {
    return canonicalMasks.indexOf(normalizeNeighborMask(mask));
  }

  function tileAt(mapState, x, y) {
    const size = mapSize(mapState);
    if (x < 0 || y < 0 || x >= size.width || y >= size.height) return null;
    return (mapState.tiles || []).find((tile) => tile.x === x && tile.y === y) || null;
  }

  function hasLegacyWall(cells, x, y) {
    return cells.has(`${x},${y}`);
  }

  function nextSegmentId(segments) {
    return `wall_${String(segments.length + 1).padStart(3, "0")}`;
  }

  function openingId(mapState, category, x, y) {
    const usedIds = new Set((mapState.objects || []).map((object) => object.id));
    const base = `${category}_${x}_${y}`;
    let id = base;
    let index = 2;
    while (usedIds.has(id)) {
      id = `${base}_${index}`;
      index += 1;
    }
    return id;
  }

  function openingCells(object) {
    const rotation = ((Number(object.rotation) || 0) % 360 + 360) % 360;
    const rotated = rotation === 90 || rotation === 270;
    const width = Math.max(1, Math.round(Number(rotated ? object.height : object.width) || 1));
    const height = Math.max(1, Math.round(Number(rotated ? object.width : object.height) || 1));
    const cells = [];
    for (let y = object.y; y < object.y + height; y += 1) {
      for (let x = object.x; x < object.x + width; x += 1) cells.push({ x, y });
    }
    return cells;
  }

  function isOpening(object) {
    return object?.category === "window" || object?.category === "door";
  }

  function facingForAxis(axis) {
    return axis === "horizontal" ? "south" : "east";
  }

  function axisForFacing(facing) {
    if (facing === "north" || facing === "south") return "horizontal";
    if (facing === "east" || facing === "west") return "vertical";
    return null;
  }

  function openingCellAttachment(mapState, opening, cell) {
    const segments = segmentsAtCell(mapState?.wall_segments || [], cell);
    const axes = [...new Set(segments.map((segment) => segment.axis))];
    const preferredAxis = axisForFacing(opening.facing);
    return {
      x: cell.x,
      y: cell.y,
      attached: axes.length > 0,
      ambiguous: axes.length > 1,
      axis: preferredAxis && axes.includes(preferredAxis) ? preferredAxis : segments[0]?.axis || null,
      axes
    };
  }

  function openingCellAttachments(mapState, opening) {
    if (!isOpening(opening)) return [];
    return openingCells(opening).map((cell) => openingCellAttachment(mapState, opening, cell));
  }

  function openingAttachment(mapState, opening) {
    const cells = openingCellAttachments(mapState, opening);
    if (!cells.length) return { attached: false, ambiguous: false, axis: null };
    const attachedCells = cells.filter((cell) => cell.attached);
    const attached = attachedCells.length === cells.length;
    const preferredAxis = axisForFacing(opening.facing);
    const commonAxes = attachedCells.length
      ? ["horizontal", "vertical"].filter((axis) => attachedCells.every((cell) => cell.axes.includes(axis)))
      : [];
    const chosenAxes = new Set(attachedCells.map((cell) => cell.axis).filter(Boolean));
    const axis = preferredAxis && commonAxes.includes(preferredAxis)
      ? preferredAxis
      : commonAxes[0] || attachedCells[0]?.axis || null;
    const ambiguous = cells.some((cell) => cell.ambiguous) || chosenAxes.size > 1;
    return { attached, ambiguous, axis };
  }

  function openingOrientation(mapState, opening) {
    return openingAttachment(mapState, opening).axis;
  }

  function openingRunRoleAtCell(mapState, cell, axis) {
    if (!axis) return "single";
    const coordinate = axis === "horizontal" ? "x" : "y";
    const occupied = new Set();
    for (const candidate of mapState?.objects || []) {
      if (!isOpening(candidate)) continue;
      for (const candidateCell of openingCellAttachments(mapState, candidate)) {
        if (candidateCell.attached && candidateCell.axis === axis) occupied.add(`${candidateCell.x},${candidateCell.y}`);
      }
    }
    const beforeCell = Object.assign({}, cell, { [coordinate]: Number(cell[coordinate]) - 1 });
    const afterCell = Object.assign({}, cell, { [coordinate]: Number(cell[coordinate]) + 1 });
    const before = occupied.has(`${beforeCell.x},${beforeCell.y}`);
    const after = occupied.has(`${afterCell.x},${afterCell.y}`);
    if (before && after) return "middle";
    if (after) return "start";
    if (before) return "end";
    return "single";
  }

  function openingRenderCells(mapState, opening) {
    return openingCellAttachments(mapState, opening).map((cell) => ({
      x: cell.x,
      y: cell.y,
      attached: cell.attached,
      ambiguous: cell.ambiguous,
      axis: cell.axis,
      runRole: openingRunRoleAtCell(mapState, cell, cell.axis)
    }));
  }

  function openingRunRole(mapState, opening) {
    return openingRenderCells(mapState, opening)[0]?.runRole || "single";
  }

  function migrateWallSegments(mapState) {
    if (Array.isArray(mapState.wall_segments)) {
      mapState.wall_segments = mapState.wall_segments.map((segment) => normalizeWallSegment(segment, mapState));
      return mapState.wall_segments;
    }

    const legacyCells = new Set((mapState.tiles || [])
      .filter((tile) => tile.structure === "wall" || tile.structure === "window")
      .map((tile) => `${tile.x},${tile.y}`));
    const segments = [];
    const sortedCells = Array.from(legacyCells, (key) => key.split(",").map(Number))
      .sort((a, b) => a[1] - b[1] || a[0] - b[0]);

    for (const [x, y] of sortedCells) {
      if (hasLegacyWall(legacyCells, x - 1, y) || !hasLegacyWall(legacyCells, x + 1, y)) continue;
      let endX = x;
      while (hasLegacyWall(legacyCells, endX + 1, y)) endX += 1;
      segments.push({ id: nextSegmentId(segments), axis: "horizontal", start: { x, y }, end: { x: endX, y } });
    }
    for (const [x, y] of sortedCells) {
      if (hasLegacyWall(legacyCells, x, y - 1) || !hasLegacyWall(legacyCells, x, y + 1)) continue;
      let endY = y;
      while (hasLegacyWall(legacyCells, x, endY + 1)) endY += 1;
      segments.push({ id: nextSegmentId(segments), axis: "vertical", start: { x, y }, end: { x, y: endY } });
    }
    for (const [x, y] of sortedCells) {
      if (hasLegacyWall(legacyCells, x - 1, y) || hasLegacyWall(legacyCells, x + 1, y) ||
        hasLegacyWall(legacyCells, x, y - 1) || hasLegacyWall(legacyCells, x, y + 1)) continue;
      segments.push({ id: nextSegmentId(segments), axis: "horizontal", start: { x, y }, end: { x, y } });
    }

    mapState.objects = Array.isArray(mapState.objects) ? mapState.objects : [];
    for (const tile of mapState.tiles || []) {
      if (tile.structure !== "window") continue;
      const exists = mapState.objects.some((object) => object.category === "window" && object.x === tile.x && object.y === tile.y);
      if (!exists) {
        mapState.objects.push({
          id: openingId(mapState, "window", tile.x, tile.y),
          name: "Window",
          category: "window",
          x: tile.x,
          y: tile.y,
          width: 1,
          height: 1,
          blocking: false,
          room_id: tile.room_id || null,
          notes: ""
        });
      }
    }
    mapState.wall_segments = segments.map((segment) => normalizeWallSegment(segment, mapState));
    return mapState.wall_segments;
  }

  function materializeWallState(mapState) {
    for (const tile of mapState.tiles || []) {
      if (tile.structure === "wall" || tile.structure === "window") tile.structure = "none";
    }
    const coverage = wallCoverage(mapState.wall_segments || []);
    for (const key of coverage) {
      const [x, y] = key.split(",").map(Number);
      const tile = tileAt(mapState, x, y);
      if (tile) tile.structure = "wall";
    }
    for (const object of mapState.objects || []) {
      if (object.category !== "window" && object.category !== "door") continue;
      const cells = openingCells(object);
      if (!cells.every((cell) => coverage.has(`${cell.x},${cell.y}`))) continue;
      for (const cell of cells) {
        const tile = tileAt(mapState, cell.x, cell.y);
        if (tile && object.category === "window") tile.structure = "window";
        if (tile && object.category === "door") tile.structure = "none";
      }
    }
  }

  return {
    DIR,
    canonicalMasks,
    normalizeNeighborMask,
    atlasIndexForMask,
    normalizeWallSegment,
    axisLockedEndpoint,
    rasterizeWallSegment,
    segmentsAtCell,
    selectionAxisAtPoint,
    resizeWallSegment,
    wallCoverage,
    facingForAxis,
    openingAttachment,
    openingOrientation,
    openingRenderCells,
    openingRunRole,
    migrateWallSegments,
    materializeWallState
  };
});
