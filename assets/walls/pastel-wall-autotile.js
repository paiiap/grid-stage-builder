(function initGridWallAtlasMetadata(root, factory) {
  const metadata = factory();
  if (typeof module === "object" && module && module.exports) module.exports = metadata;
  if (root) root.GridWallAtlasMetadata = metadata;
})(typeof globalThis !== "undefined" ? globalThis : null, function createGridWallAtlasMetadata() {
  "use strict";
  return {
  "tile_size": 48,
  "columns": 8,
  "masks": {
    "0": {
      "index": 0,
      "x": 0,
      "y": 0
    },
    "1": {
      "index": 1,
      "x": 48,
      "y": 0
    },
    "4": {
      "index": 2,
      "x": 96,
      "y": 0
    },
    "5": {
      "index": 3,
      "x": 144,
      "y": 0
    },
    "16": {
      "index": 4,
      "x": 192,
      "y": 0
    },
    "17": {
      "index": 5,
      "x": 240,
      "y": 0
    },
    "20": {
      "index": 6,
      "x": 288,
      "y": 0
    },
    "21": {
      "index": 7,
      "x": 336,
      "y": 0
    },
    "64": {
      "index": 8,
      "x": 0,
      "y": 48
    },
    "65": {
      "index": 9,
      "x": 48,
      "y": 48
    },
    "68": {
      "index": 10,
      "x": 96,
      "y": 48
    },
    "69": {
      "index": 11,
      "x": 144,
      "y": 48
    },
    "80": {
      "index": 12,
      "x": 192,
      "y": 48
    },
    "81": {
      "index": 13,
      "x": 240,
      "y": 48
    },
    "84": {
      "index": 14,
      "x": 288,
      "y": 48
    },
    "85": {
      "index": 15,
      "x": 336,
      "y": 48
    }
  },
  "windows": {
    "horizontal": {
      "index": 0,
      "x": 0,
      "y": 0
    }
  },
  "doors": {
    "horizontal": {
      "index": 0,
      "x": 0,
      "y": 0
    },
    "vertical": {
      "index": 1,
      "x": 48,
      "y": 0
    }
  }
};
});
