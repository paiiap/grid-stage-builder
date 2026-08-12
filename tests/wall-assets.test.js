const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const zlib = require("node:zlib");
const walls = require("../wall-model.js");

const assetsDirectory = path.join(__dirname, "../assets/walls");
const metadataPath = path.join(assetsDirectory, "pastel-wall-autotile.json");
const metadataScriptPath = path.join(assetsDirectory, "pastel-wall-autotile.js");
const wallAtlasPath = path.join(assetsDirectory, "pastel-wall-autotile-48.png");
const windowAtlasPath = path.join(assetsDirectory, "pastel-window-overlays-48.png");
const doorAtlasPath = path.join(assetsDirectory, "pastel-door-overlays-48.png");
const doorSourcePath = path.join(assetsDirectory, "source/pastel-door.png");
const windowSourcePath = path.join(assetsDirectory, "source/pastel-window.png");

function sha256(filePath) {
  return require("node:crypto").createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readPngSize(filePath) {
  const header = fs.readFileSync(filePath).subarray(0, 24);
  assert.equal(header.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(header.subarray(12, 16).toString("ascii"), "IHDR");
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

function paethPredictor(left, above, upperLeft) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  if (aboveDistance <= upperLeftDistance) return above;
  return upperLeft;
}

function readPngRgba(filePath) {
  const file = fs.readFileSync(filePath);
  let offset = 8;
  let width = 0;
  let height = 0;
  const compressed = [];
  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.subarray(offset + 4, offset + 8).toString("ascii");
    const data = file.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      assert.equal(data[8], 8, "pixel regression expects 8-bit PNG data");
      assert.equal(data[9], 6, "pixel regression expects RGBA PNG data");
      assert.equal(data[12], 0, "pixel regression expects non-interlaced PNG data");
    } else if (type === "IDAT") {
      compressed.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += length + 12;
  }

  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const filtered = zlib.inflateSync(Buffer.concat(compressed));
  const pixels = Buffer.alloc(height * stride);
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = filtered[sourceOffset];
    sourceOffset += 1;
    for (let x = 0; x < stride; x += 1) {
      const raw = filtered[sourceOffset + x];
      const destination = y * stride + x;
      const left = x >= bytesPerPixel ? pixels[destination - bytesPerPixel] : 0;
      const above = y > 0 ? pixels[destination - stride] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? pixels[destination - stride - bytesPerPixel] : 0;
      if (filter === 0) pixels[destination] = raw;
      else if (filter === 1) pixels[destination] = (raw + left) & 255;
      else if (filter === 2) pixels[destination] = (raw + above) & 255;
      else if (filter === 3) pixels[destination] = (raw + Math.floor((left + above) / 2)) & 255;
      else if (filter === 4) pixels[destination] = (raw + paethPredictor(left, above, upperLeft)) & 255;
      else assert.fail(`unsupported PNG filter ${filter}`);
    }
    sourceOffset += stride;
  }

  return {
    alpha(x, y) {
      return pixels[y * stride + x * bytesPerPixel + 3];
    }
  };
}

test("wall atlas contains 16 cardinal 48 pixel slots", () => {
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  assert.equal(metadata.tile_size, 48);
  assert.equal(metadata.columns, 8);
  assert.equal(Object.keys(metadata.masks).length, 16);
  assert.deepEqual(Object.keys(metadata.masks).map(Number), walls.canonicalMasks);
  assert.deepEqual(readPngSize(wallAtlasPath), { width: 384, height: 96 });

  for (const [index, mask] of walls.canonicalMasks.entries()) {
    assert.deepEqual(metadata.masks[mask], {
      index,
      x: (index % 8) * 48,
      y: Math.floor(index / 8) * 48
    });
  }
});

test("browser wall metadata matches the deterministic JSON asset", () => {
  delete require.cache[require.resolve(metadataScriptPath)];
  const browserMetadata = require(metadataScriptPath);
  const jsonMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  assert.deepEqual(browserMetadata, jsonMetadata);
  assert.equal(Object.keys(browserMetadata.masks).length, 16);
});

test("browser wall metadata tolerates a null CommonJS module binding", () => {
  const context = { module: null };
  vm.runInNewContext(fs.readFileSync(metadataScriptPath, "utf8"), context);
  assert.equal(Object.keys(context.GridWallAtlasMetadata.masks).length, 16);
  assert(Object.keys(context.GridWallAtlasMetadata.windows).length > 0);
  assert(Object.keys(context.GridWallAtlasMetadata.doors).length > 0);
});

test("opening atlases expose complete 48 pixel overlay coordinates", () => {
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  assert.deepEqual(readPngSize(windowAtlasPath), { width: 48, height: 48 });
  assert.deepEqual(readPngSize(doorAtlasPath), { width: 96, height: 48 });

  assert.deepEqual(Object.keys(metadata.windows), ["horizontal"]);
  assert.deepEqual(Object.keys(metadata.doors), ["horizontal", "vertical"]);

  assert.deepEqual(metadata.windows.horizontal, { index: 0, x: 0, y: 0 });
  for (const [index, slot] of Object.values(metadata.doors).entries()) {
    assert.deepEqual(slot, { index, x: index * 48, y: 0 });
  }
});

test("opening atlas sources use the selected pastel door and window sprites", () => {
  assert.equal(sha256(doorSourcePath), "9153e3aab1456f1ec3d879777258f645e975fffc1cae73293e4175b12cd64274");
  assert.equal(sha256(windowSourcePath), "856b000d430a2191d36cccb6d215c6b598cbc29ca56b857553f20ce185be3201");
});

test("window overlay tile renders substantial opaque pane content", () => {
  const atlas = readPngRgba(windowAtlasPath);
  let opaquePixels = 0;
  for (let y = 0; y < 48; y += 1) {
    for (let x = 0; x < 48; x += 1) {
      if (atlas.alpha(x, y) > 200) opaquePixels += 1;
    }
  }
  assert(opaquePixels > 200, "window tile should have substantial opaque pane content");
});

test("door horizontal and vertical frames render the same opaque open-door artwork", () => {
  // Only one door-opening picture is selected; rotating it for a vertical
  // wall reads as a tilted lid rather than a door, so both orientations
  // intentionally reuse the identical unrotated pose.
  const atlas = readPngRgba(doorAtlasPath);
  const opaqueCount = (originX) => {
    let count = 0;
    for (let y = 0; y < 48; y += 1) {
      for (let x = 0; x < 48; x += 1) {
        if (atlas.alpha(originX + x, y) > 200) count += 1;
      }
    }
    return count;
  };
  assert(opaqueCount(0) > 50, "horizontal door frame should have opaque door artwork");
  assert(opaqueCount(48) > 50, "vertical door frame should have opaque door artwork");

  for (let y = 0; y < 48; y += 1) {
    for (let x = 0; x < 48; x += 1) {
      assert.equal(atlas.alpha(x, y), atlas.alpha(48 + x, y));
    }
  }
});
