(function initApp() {
  "use strict";

  const core = window.HouseMapCore;
  const STORAGE_KEY = "pawtectors.houseMapBuilder.v1";
  const THEME_STORAGE_KEY = "gridStageBuilder.theme";
  const THEME_CHOICES = new Set(["classic", "dark", "sweet"]);
  const GRID_MAJOR_EVERY = 5;
  const ROOM_TYPE_PRESETS = {
    living_room: { id: "living_room", name: "Living Room", color: "#2f8f73", terrain: "indoor_floor" },
    kitchen: { id: "kitchen", name: "Kitchen", color: "#c27a34", terrain: "indoor_floor" },
    dining_room: { id: "dining_room", name: "Dining Room", color: "#b69535", terrain: "indoor_floor" },
    bedroom: { id: "bedroom", name: "Bedroom", color: "#5e82c4", terrain: "indoor_floor" },
    bathroom: { id: "bathroom", name: "Bathroom", color: "#4aa0b5", terrain: "indoor_floor" },
    cat_room: { id: "cat_room", name: "Cat Room", color: "#b0659f", terrain: "indoor_floor" },
    garden: { id: "garden", name: "Garden", color: "#4f9b58", terrain: "garden" },
    balcony: { id: "balcony", name: "Balcony", color: "#9f7b4f", terrain: "outdoor_ground" }
  };
  const TOOL_SHORTCUTS = {
    v: "select",
    t: "tile",
    r: "room",
    q: "rect",
    p: "path",
    x: "path_area",
    o: "object",
    m: "marker",
    f: "stage",
    e: "erase",
    h: "pan"
  };
  const MAP_MODE_TOOLS = new Set(["select", "tile", "room", "rect", "object", "erase", "pan"]);
  const STAGE_MODE_TOOLS = new Set(["select", "stage", "path", "path_area", "marker", "erase", "pan"]);
  const TOOL_PANELS = {
    tile: ["tile"],
    room: ["room"],
    rect: ["room"],
    object: ["object"],
    path: ["stage-path"],
    path_area: ["stage-path"],
    marker: ["stage-marker"],
    stage: ["stage-list"]
  };
  const STAGE_RATIO_PRESETS = {
    "9:16": { width: 9, height: 16 },
    "4:3": { width: 4, height: 3 },
    "16:9": { width: 16, height: 9 },
    "1:1": { width: 1, height: 1 }
  };
  const objectCategoryLabels = {
    sofa: "Sofa",
    coffee_table: "Coffee Table",
    tv: "TV",
    tv_stand: "TV Stand",
    rug: "Rug",
    bookshelf: "Bookshelf",
    armchair: "Armchair",
    floor_lamp: "Floor Lamp",
    bed: "Bed",
    nightstand: "Nightstand",
    vanity: "Vanity",
    laundry_basket: "Laundry Basket",
    door: "Door",
    window: "Window",
    table: "Table",
    dining_table: "Dining Table",
    dining_chair: "Chair",
    display_cabinet: "Display Cabinet",
    serving_cart: "Serving Cart",
    fridge: "Fridge",
    sink: "Sink",
    stove: "Stove",
    kitchen_counter: "Kitchen Counter",
    kitchen_island: "Kitchen Island",
    trash_bin: "Trash Bin",
    storage_shelf: "Storage Shelf",
    cat_bowl: "Cat Bowl",
    tub: "Tub",
    toilet: "Toilet",
    shower: "Shower",
    medicine_cabinet: "Medicine Cabinet",
    towel_shelf: "Towel Shelf",
    bath_mat: "Bath Mat",
    closet: "Closet",
    cat_tree: "Cat Tower",
    litter_box: "Litter Box",
    cat_bed: "Cat Bed",
    cat_toy: "Cat Toy",
    scratching_post: "Scratching Post",
    cat_tunnel: "Cat Tunnel",
    plant: "Plant",
    potted_plant: "Potted Plant",
    bush: "Bush",
    garden_table: "Garden Table",
    garden_chair: "Garden Chair",
    small_fountain: "Small Fountain",
    stepping_stone: "Stepping Stone",
    low_fence: "Low Fence",
    balcony_chair: "Balcony Chair",
    small_table: "Small Table",
    balcony_rail: "Balcony Rail",
    mat: "Mat",
    storage_box: "Storage Box",
    decoration: "Decoration",
    gameplay_obstacle: "Obstacle"
  };
  const objectCategoryDefaults = {
    sofa: { width: 3, height: 2, facing: "south" },
    coffee_table: { width: 2, height: 1, facing: "south" },
    tv: { width: 2, height: 1, facing: "south" },
    tv_stand: { width: 3, height: 1, facing: "south" },
    rug: { width: 4, height: 3, facing: "south", blocking: false },
    bookshelf: { width: 1, height: 3, facing: "south" },
    armchair: { width: 1, height: 1, facing: "south" },
    floor_lamp: { width: 1, height: 1, facing: "south" },
    bed: { width: 3, height: 4, facing: "north" },
    nightstand: { width: 1, height: 1, facing: "south" },
    vanity: { width: 2, height: 1, facing: "south" },
    laundry_basket: { width: 1, height: 1, facing: "south" },
    door: { width: 1, height: 2, facing: "east" },
    window: { width: 2, height: 1, facing: "south", blocking: false },
    table: { width: 2, height: 2, facing: "south" },
    dining_table: { width: 4, height: 2, facing: "south" },
    dining_chair: { width: 1, height: 1, facing: "south" },
    display_cabinet: { width: 2, height: 1, facing: "south" },
    serving_cart: { width: 1, height: 2, facing: "south" },
    fridge: { width: 1, height: 2, facing: "south" },
    sink: { width: 2, height: 1, facing: "south" },
    stove: { width: 2, height: 1, facing: "south" },
    kitchen_counter: { width: 4, height: 1, facing: "south" },
    kitchen_island: { width: 3, height: 2, facing: "south" },
    trash_bin: { width: 1, height: 1, facing: "south" },
    storage_shelf: { width: 2, height: 1, facing: "south" },
    cat_bowl: { width: 1, height: 1, facing: "south", blocking: false },
    tub: { width: 3, height: 2, facing: "south" },
    toilet: { width: 1, height: 1, facing: "south" },
    shower: { width: 2, height: 2, facing: "south" },
    medicine_cabinet: { width: 1, height: 1, facing: "south" },
    towel_shelf: { width: 2, height: 1, facing: "south" },
    bath_mat: { width: 2, height: 1, facing: "south", blocking: false },
    closet: { width: 2, height: 1, facing: "south" },
    cat_tree: { width: 2, height: 2, facing: "south" },
    litter_box: { width: 2, height: 1, facing: "south" },
    cat_bed: { width: 2, height: 2, facing: "south", blocking: false },
    cat_toy: { width: 1, height: 1, facing: "south", blocking: false },
    scratching_post: { width: 1, height: 1, facing: "south" },
    cat_tunnel: { width: 3, height: 1, facing: "east" },
    plant: { width: 1, height: 1, facing: "south" },
    potted_plant: { width: 1, height: 1, facing: "south" },
    bush: { width: 2, height: 1, facing: "south" },
    garden_table: { width: 2, height: 2, facing: "south" },
    garden_chair: { width: 1, height: 1, facing: "south" },
    small_fountain: { width: 2, height: 2, facing: "south" },
    stepping_stone: { width: 1, height: 1, facing: "south", blocking: false },
    low_fence: { width: 3, height: 1, facing: "east" },
    balcony_chair: { width: 1, height: 1, facing: "south" },
    small_table: { width: 1, height: 1, facing: "south" },
    balcony_rail: { width: 3, height: 1, facing: "east" },
    mat: { width: 2, height: 1, facing: "south", blocking: false },
    storage_box: { width: 1, height: 1, facing: "south" },
    decoration: { width: 1, height: 1, facing: "south" },
    gameplay_obstacle: { width: 2, height: 2, facing: "south" }
  };
  const DEFAULT_ROOM_DEFINITIONS = Object.values(ROOM_TYPE_PRESETS).map((room) => Object.assign({}, room));
  const DEFAULT_OBJECT_DEFINITIONS = [
    { room_id: "common", id: "door", name: "Door" },
    { room_id: "common", id: "window", name: "Window" },
    { room_id: "common", id: "plant", name: "Plant" },
    { room_id: "common", id: "decoration", name: "Decoration" },
    { room_id: "common", id: "gameplay_obstacle", name: "Obstacle" },
    { room_id: "living_room", id: "sofa", name: "Sofa" },
    { room_id: "living_room", id: "coffee_table", name: "Coffee Table" },
    { room_id: "living_room", id: "tv", name: "TV" },
    { room_id: "living_room", id: "tv_stand", name: "TV Stand" },
    { room_id: "living_room", id: "rug", name: "Rug" },
    { room_id: "living_room", id: "bookshelf", name: "Bookshelf" },
    { room_id: "living_room", id: "armchair", name: "Armchair" },
    { room_id: "living_room", id: "floor_lamp", name: "Floor Lamp" },
    { room_id: "kitchen", id: "fridge", name: "Fridge" },
    { room_id: "kitchen", id: "sink", name: "Sink" },
    { room_id: "kitchen", id: "stove", name: "Stove" },
    { room_id: "kitchen", id: "kitchen_counter", name: "Kitchen Counter" },
    { room_id: "kitchen", id: "kitchen_island", name: "Kitchen Island" },
    { room_id: "kitchen", id: "trash_bin", name: "Trash Bin" },
    { room_id: "kitchen", id: "storage_shelf", name: "Storage Shelf" },
    { room_id: "kitchen", id: "cat_bowl", name: "Cat Bowl" },
    { room_id: "dining_room", id: "dining_table", name: "Dining Table" },
    { room_id: "dining_room", id: "dining_chair", name: "Chair" },
    { room_id: "dining_room", id: "display_cabinet", name: "Display Cabinet" },
    { room_id: "dining_room", id: "serving_cart", name: "Serving Cart" },
    { room_id: "dining_room", id: "rug", name: "Rug" },
    { room_id: "bedroom", id: "bed", name: "Bed" },
    { room_id: "bedroom", id: "nightstand", name: "Nightstand" },
    { room_id: "bedroom", id: "closet", name: "Closet" },
    { room_id: "bedroom", id: "vanity", name: "Vanity" },
    { room_id: "bedroom", id: "floor_lamp", name: "Floor Lamp" },
    { room_id: "bedroom", id: "rug", name: "Rug" },
    { room_id: "bedroom", id: "laundry_basket", name: "Laundry Basket" },
    { room_id: "bathroom", id: "tub", name: "Tub" },
    { room_id: "bathroom", id: "toilet", name: "Toilet" },
    { room_id: "bathroom", id: "sink", name: "Sink" },
    { room_id: "bathroom", id: "shower", name: "Shower" },
    { room_id: "bathroom", id: "medicine_cabinet", name: "Medicine Cabinet" },
    { room_id: "bathroom", id: "towel_shelf", name: "Towel Shelf" },
    { room_id: "bathroom", id: "bath_mat", name: "Bath Mat" },
    { room_id: "cat_room", id: "cat_tree", name: "Cat Tower" },
    { room_id: "cat_room", id: "litter_box", name: "Litter Box" },
    { room_id: "cat_room", id: "cat_bowl", name: "Cat Bowl" },
    { room_id: "cat_room", id: "cat_bed", name: "Cat Bed" },
    { room_id: "cat_room", id: "cat_toy", name: "Cat Toy" },
    { room_id: "cat_room", id: "scratching_post", name: "Scratching Post" },
    { room_id: "cat_room", id: "cat_tunnel", name: "Cat Tunnel" },
    { room_id: "garden", id: "plant", name: "Plant" },
    { room_id: "garden", id: "potted_plant", name: "Potted Plant" },
    { room_id: "garden", id: "bush", name: "Bush" },
    { room_id: "garden", id: "garden_table", name: "Garden Table" },
    { room_id: "garden", id: "garden_chair", name: "Garden Chair" },
    { room_id: "garden", id: "small_fountain", name: "Small Fountain" },
    { room_id: "garden", id: "stepping_stone", name: "Stepping Stone" },
    { room_id: "garden", id: "low_fence", name: "Low Fence" },
    { room_id: "balcony", id: "balcony_chair", name: "Balcony Chair" },
    { room_id: "balcony", id: "small_table", name: "Small Table" },
    { room_id: "balcony", id: "potted_plant", name: "Potted Plant" },
    { room_id: "balcony", id: "balcony_rail", name: "Balcony Rail" },
    { room_id: "balcony", id: "mat", name: "Mat" },
    { room_id: "balcony", id: "storage_box", name: "Storage Box" }
  ];
  const canvas = document.getElementById("mapCanvas");
  const ctx = canvas.getContext("2d");
  const elements = {
    scroller: document.getElementById("canvasScroller"),
    mapMode: document.getElementById("mapModeBtn"),
    stageMode: document.getElementById("stageModeBtn"),
    selectionSummary: document.getElementById("selectionSummary"),
    mapList: document.getElementById("mapList"),
    mapName: document.getElementById("mapNameInput"),
    addMap: document.getElementById("addMapBtn"),
    duplicateMap: document.getElementById("duplicateMapBtn"),
    deleteMap: document.getElementById("deleteMapBtn"),
    exportMaps: document.getElementById("exportMapsBtn"),
    importMaps: document.getElementById("importMapsBtn"),
    structure: document.getElementById("structureInput"),
    build: document.getElementById("buildInput"),
    roomList: document.getElementById("roomList"),
    roomId: document.getElementById("roomIdInput"),
    roomName: document.getElementById("roomNameInput"),
    roomType: document.getElementById("roomTypeInput"),
    roomColor: document.getElementById("roomColorInput"),
    addRoom: document.getElementById("addRoomBtn"),
    deleteRoom: document.getElementById("deleteRoomBtn"),
    objectRoomList: document.getElementById("objectRoomList"),
    objectRoomType: document.getElementById("objectRoomTypeInput"),
    objectCategory: document.getElementById("objectCategoryInput"),
    objectCategoryButtons: document.getElementById("objectCategoryButtons"),
    objectName: document.getElementById("objectNameInput"),
    addObjectDefinition: document.getElementById("addObjectDefinitionBtn"),
    deleteObjectDefinition: document.getElementById("deleteObjectDefinitionBtn"),
    objectWidth: document.getElementById("objectWidthInput"),
    objectHeight: document.getElementById("objectHeightInput"),
    objectFacing: document.getElementById("objectFacingInput"),
    objectRotation: document.getElementById("objectRotationInput"),
    objectBlocking: document.getElementById("objectBlockingInput"),
    doorFields: document.querySelector(".door-fields"),
    doorType: document.getElementById("doorTypeInput"),
    doorSwing: document.getElementById("doorSwingInput"),
    doorOpenState: document.getElementById("doorOpenStateInput"),
    doorHinge: document.getElementById("doorHingeInput"),
    selectedObjectSummary: document.getElementById("selectedObjectSummary"),
    selectedObjectWidth: document.getElementById("selectedObjectWidthInput"),
    selectedObjectHeight: document.getElementById("selectedObjectHeightInput"),
    selectedObjectFacing: document.getElementById("selectedObjectFacingInput"),
    selectedObjectBlocking: document.getElementById("selectedObjectBlockingInput"),
    selectedObjectOverlap: document.getElementById("selectedObjectOverlapInput"),
    selectedDoorFields: document.querySelector(".selected-door-fields"),
    selectedDoorType: document.getElementById("selectedDoorTypeInput"),
    selectedDoorSwing: document.getElementById("selectedDoorSwingInput"),
    selectedDoorOpenState: document.getElementById("selectedDoorOpenStateInput"),
    selectedDoorHinge: document.getElementById("selectedDoorHingeInput"),
    markerType: document.getElementById("markerTypeInput"),
    stageList: document.getElementById("stageList"),
    addStage: document.getElementById("addStageBtn"),
    duplicateStage: document.getElementById("duplicateStageBtn"),
    deleteStage: document.getElementById("deleteStageBtn"),
    stageDetail: document.getElementById("stageDetailControls"),
    pathSelect: document.getElementById("pathSelectInput"),
    pathSpawn: document.getElementById("pathSpawnInput"),
    pathBase: document.getElementById("pathBaseInput"),
    addPath: document.getElementById("addPathBtn"),
    deletePath: document.getElementById("deletePathBtn"),
    pathWidthControls: document.getElementById("pathWidthControls"),
    pathWidth: document.getElementById("pathWidthInput"),
    stageId: document.getElementById("stageIdInput"),
    stageName: document.getElementById("stageNameInput"),
    stageWidth: document.getElementById("stageWidthInput"),
    stageHeight: document.getElementById("stageHeightInput"),
    stageRatio: document.getElementById("stageRatioInput"),
    stageCustomRatio: document.getElementById("stageCustomRatioInput"),
    stageTopDirection: document.getElementById("stageTopDirectionInput"),
    stagePreviewSummary: document.getElementById("stagePreviewSummary"),
    stagePreviewStats: document.getElementById("stagePreviewStats"),
    prompt: document.getElementById("promptOutput"),
    validationList: document.getElementById("validationList"),
    coordStatus: document.getElementById("coordStatus"),
    toolStatus: document.getElementById("toolStatus"),
    zoomStatus: document.getElementById("zoomStatus"),
    validationStatus: document.getElementById("validationStatus"),
    fileInput: document.getElementById("fileInput"),
    mapBundleFile: document.getElementById("mapBundleInput"),
    layerRoom: document.getElementById("layerRoomInput"),
    layerTerrain: document.getElementById("layerTerrainInput"),
    layerStructure: document.getElementById("layerStructureInput"),
    layerBuild: document.getElementById("layerBuildInput"),
    layerObjects: document.getElementById("layerObjectsInput"),
    layerDoors: document.getElementById("layerDoorsInput"),
    layerPath: document.getElementById("layerPathInput"),
    layerMarkers: document.getElementById("layerMarkersInput"),
    layerGrid: document.getElementById("layerGridInput")
  };
  let syncingSelectedObjectFields = false;

  function applyTheme(theme) {
    if (!THEME_CHOICES.has(theme)) theme = "classic";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.classList.toggle("active", button.dataset.themeChoice === theme);
    });
  }

  function loadTheme() {
    applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || "classic");
  }

  const colors = {
    terrain: {
      indoor_floor: "#cda36f",
      outdoor_ground: "#8fb86d",
      garden: "#6fa662",
      void: "#eadfcf"
    },
    structure: {
      wall: "#8b8780",
      door: "#a97a42",
      window: "#7fb2c8",
      blocked: "#65625d"
    },
    path: "#f2dec2",
    pathLine: "#d6684a",
    spawn: "#d64f3c",
    base: "#2f6fbc",
    build: "#fffaf0",
    selected: "#1f6f9f",
    stage: "#7a4fa3"
  };

  const state = {
    doc: loadSavedDocument() || core.makeSampleDocument(),
    mode: "map",
    tool: "select",
    zoom: 0.45,
    showGrid: true,
    layers: {
      room: true,
      terrain: true,
      structure: true,
      build: false,
      objects: true,
      doors: true,
      path: true,
      markers: true,
      grid: true
    },
    activeStageId: null,
    activePathId: null,
    selectedMapIds: new Set(),
    selected: null,
    history: [],
    future: [],
    dragStart: null,
    dragCurrent: null,
    previewRect: null,
    isDragging: false,
    objectDrag: null,
    markerDrag: null,
    pathDrag: null,
    panStart: null
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function uniqueId(base, usedIds) {
    const clean = String(base || "item").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "item";
    let id = clean;
    let index = 2;
    while (usedIds.has(id)) {
      id = `${clean}_${index}`;
      index += 1;
    }
    return id;
  }

  function ensureDefinitions() {
    const hadRoomDefinitions = Array.isArray(state.doc.room_definitions) && state.doc.room_definitions.length;
    if (!hadRoomDefinitions) {
      state.doc.room_definitions = clone(DEFAULT_ROOM_DEFINITIONS);
    }
    if (!Array.isArray(state.doc.object_definitions) || !state.doc.object_definitions.length) {
      state.doc.object_definitions = clone(DEFAULT_OBJECT_DEFINITIONS);
    }
    if (!hadRoomDefinitions) {
      for (const room of state.doc.rooms || []) {
        if (room.id && !state.doc.room_definitions.some((definition) => definition.id === room.id)) {
          const preset = ROOM_TYPE_PRESETS[room.type] || ROOM_TYPE_PRESETS.living_room;
          state.doc.room_definitions.push({
            id: room.id,
            name: room.name || room.id,
            type: room.type || room.id,
            color: room.color || preset.color,
            terrain: preset.terrain || "indoor_floor"
          });
        }
      }
    }
    const firstRoom = state.doc.room_definitions[0] || DEFAULT_ROOM_DEFINITIONS[0];
    if (!elements.roomType.value || !state.doc.room_definitions.some((room) => room.id === elements.roomType.value)) {
      elements.roomType.value = firstRoom.id;
    }
    if (!elements.objectRoomType.value || !state.doc.room_definitions.some((room) => room.id === elements.objectRoomType.value)) {
      elements.objectRoomType.value = elements.roomType.value || firstRoom.id;
    }
  }

  function activeMapSnapshot() {
    ensureDefinitions();
    return {
      id: state.doc.map.id,
      name: state.doc.map.name,
      map: clone(state.doc.map),
      tiles: clone(state.doc.tiles || []),
      rooms: clone(state.doc.rooms || []),
      room_definitions: clone(state.doc.room_definitions || []),
      objects: clone(state.doc.objects || []),
      object_definitions: clone(state.doc.object_definitions || []),
      paths: clone(state.doc.paths || []),
      markers: clone(state.doc.markers || []),
      stages: clone(state.doc.stages || [])
    };
  }

  function applyMapSnapshot(snapshot) {
    state.doc.active_map_id = snapshot.id;
    state.doc.map = clone(snapshot.map || state.doc.map);
    state.doc.map.id = snapshot.id;
    state.doc.map.name = snapshot.name || snapshot.id;
    state.doc.tiles = clone(snapshot.tiles || []);
    state.doc.rooms = clone(snapshot.rooms || []);
    state.doc.room_definitions = clone(snapshot.room_definitions || DEFAULT_ROOM_DEFINITIONS);
    state.doc.objects = clone(snapshot.objects || []);
    state.doc.object_definitions = clone(snapshot.object_definitions || DEFAULT_OBJECT_DEFINITIONS);
    state.doc.paths = clone(snapshot.paths || []);
    state.doc.markers = clone(snapshot.markers || []);
    state.doc.stages = clone(snapshot.stages || []);
    state.activeStageId = state.doc.stages[0]?.id || null;
    state.activePathId = null;
    state.selected = null;
  }

  function normalizeMaps() {
    if (!Array.isArray(state.doc.maps) || !state.doc.maps.length) {
      state.doc.maps = [activeMapSnapshot()];
    }
    if (!state.doc.active_map_id || !state.doc.maps.some((map) => map.id === state.doc.active_map_id)) {
      state.doc.active_map_id = state.doc.map.id || state.doc.maps[0].id;
    }
    const active = state.doc.maps.find((map) => map.id === state.doc.active_map_id);
    if (active) Object.assign(active, activeMapSnapshot(), { id: active.id, name: state.doc.map.name || active.name });
  }

  function nextMapId() {
    let index = state.doc.maps.length + 1;
    let id = `map_${String(index).padStart(2, "0")}`;
    while (state.doc.maps.some((map) => map.id === id)) {
      index += 1;
      id = `map_${String(index).padStart(2, "0")}`;
    }
    return id;
  }

  function uniqueMapId(rawId, usedIds) {
    return uniqueId(rawId || "map", usedIds);
  }

  function uniqueMapName(rawName, usedNames) {
    const base = String(rawName || "Map").trim() || "Map";
    let name = base;
    let index = 2;
    while (usedNames.has(name)) {
      name = index === 2 ? `${base} Copy` : `${base} Copy ${index}`;
      index += 1;
    }
    return name;
  }

  function blankMapSnapshot(id, name) {
    const doc = core.createDocument();
    doc.map.id = id;
    doc.map.name = name;
    return {
      id,
      name,
      map: clone(doc.map),
      tiles: clone(doc.tiles),
      rooms: [],
      room_definitions: clone(doc.room_definitions || DEFAULT_ROOM_DEFINITIONS),
      objects: [],
      object_definitions: clone(doc.object_definitions || DEFAULT_OBJECT_DEFINITIONS),
      paths: [],
      markers: [],
      stages: []
    };
  }

  function loadSavedDocument() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const doc = JSON.parse(raw);
      const result = core.validateDocument(doc);
      if (result.errors.some((message) => message.includes("schema") || message.includes("dimensions") || message.includes("tiles"))) {
        return null;
      }
      return doc;
    } catch (error) {
      return null;
    }
  }

  function saveDocument() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.doc));
  }

  function pushHistory() {
    state.history.push(JSON.stringify(state.doc));
    if (state.history.length > 100) state.history.shift();
    state.future = [];
  }

  function undo() {
    if (state.history.length === 0) return;
    state.future.push(JSON.stringify(state.doc));
    state.doc = JSON.parse(state.history.pop());
    afterChange(false);
  }

  function redo() {
    if (state.future.length === 0) return;
    state.history.push(JSON.stringify(state.doc));
    state.doc = JSON.parse(state.future.pop());
    afterChange(false);
  }

  function afterChange(recordHistory) {
    ensureDefinitions();
    ensureStage();
    normalizeMaps();
    if (recordHistory) saveDocument();
    refreshInspector();
    render();
  }

  function toolAllowedInMode(tool, mode) {
    return mode === "stage" ? STAGE_MODE_TOOLS.has(tool) : MAP_MODE_TOOLS.has(tool);
  }

  function updateModeUi() {
    elements.mapMode.classList.toggle("active", state.mode === "map");
    elements.stageMode.classList.toggle("active", state.mode === "stage");
    document.querySelectorAll("[data-mode-tool]").forEach((button) => {
      button.hidden = button.dataset.modeTool !== "all" && button.dataset.modeTool !== state.mode;
    });
    document.querySelectorAll("[data-mode-action]").forEach((button) => {
      button.hidden = button.dataset.modeAction !== state.mode;
    });
    if (!toolAllowedInMode(state.tool, state.mode)) state.tool = "select";
    if (state.mode === "stage" && state.selected?.type === "object") state.selected = null;
  }

  function setMode(mode) {
    state.mode = mode;
    updateModeUi();
    setTool(toolAllowedInMode(state.tool, mode) ? state.tool : "select");
    refreshInspector();
  }

  function normalizePath(path, index) {
    path.id = path.id || `path_${index + 1}`;
    path.name = path.name || `Path ${index + 1}`;
    path.width_tiles = clamp(Number(path.width_tiles || 1), 1, 6);
    path.spawn_id = path.spawn_id || "";
    path.base_id = path.base_id || "";
    if (!Array.isArray(path.points)) path.points = [];
    if (!Array.isArray(path.areas)) path.areas = [];
    return path;
  }

  function markerLabel(marker) {
    return marker.label || marker.id;
  }

  function markersOfType(stage, type) {
    return (stage?.markers || []).filter((marker) => marker.type === type);
  }

  function nextStageMarkerNumber(stage, type) {
    const prefix = type === "spawn" ? "Spawn" : type === "base" ? "Base" : "Slot";
    const numbers = markersOfType(stage, type)
      .map((marker) => String(marker.label || "").match(new RegExp(`^${prefix} (\\d+)$`))?.[1])
      .filter(Boolean)
      .map(Number);
    return Math.max(0, ...numbers) + 1;
  }

  function stageMarkerLabel(stage, type) {
    if (type !== "spawn" && type !== "base" && type !== "build_slot") return type;
    const prefix = type === "spawn" ? "Spawn" : type === "base" ? "Base" : "Slot";
    return `${prefix} ${nextStageMarkerNumber(stage, type)}`;
  }

  function markerNumberLabel(marker) {
    const match = String(marker.label || "").match(/^(Spawn|Base|Slot) (\d+)$/);
    if (!match) return marker.type === "spawn" ? "S" : marker.type === "base" ? "B" : "M";
    const prefix = match[1] === "Spawn" ? "S" : match[1] === "Base" ? "B" : "SL";
    return `${prefix}${match[2]}`;
  }

  function createPath(stage) {
    const index = stage.paths.length + 1;
    let id = `path_${index}`;
    let suffix = index;
    while (stage.paths.some((path) => path.id === id)) {
      suffix += 1;
      id = `path_${suffix}`;
    }
    const path = normalizePath({
      id,
      name: `Path ${suffix}`,
      spawn_id: markersOfType(stage, "spawn")[0]?.id || "",
      base_id: markersOfType(stage, "base")[0]?.id || "",
      width_tiles: clamp(Number(elements.pathWidth.value || 1), 1, 6),
      points: [],
      areas: []
    }, suffix - 1);
    stage.paths.push(path);
    stage.active_path_id = path.id;
    state.activePathId = path.id;
    return path;
  }

  function normalizeStage(stage) {
    if (!stage.bounds) stage.bounds = { x: stage.x || 0, y: stage.y || 0, width: stage.width || 18, height: stage.height || 32 };
    stage.x = stage.bounds.x;
    stage.y = stage.bounds.y;
    stage.width = stage.bounds.width;
    stage.height = stage.bounds.height;
    if (!Array.isArray(stage.markers)) stage.markers = [];
    if (!Array.isArray(stage.paths)) stage.paths = [];
    stage.paths.forEach((path, index) => normalizePath(path, index));
    if (!Array.isArray(stage.path_areas)) stage.path_areas = [];
    if (stage.path_areas.length) {
      if (!stage.paths.length) createPath(stage);
      stage.paths[0].areas.push(...stage.path_areas);
      stage.path_areas = [];
    }
    if (stage.paths.length && !stage.paths.some((path) => path.id === stage.active_path_id)) stage.active_path_id = stage.paths[0].id;
    if (!Array.isArray(stage.build_tiles)) stage.build_tiles = [];
    if (!Array.isArray(stage.waves)) stage.waves = [];
    stage.ratio = stage.ratio || "9:16";
    stage.custom_ratio = stage.custom_ratio || "9:16";
    stage.top_direction = stage.top_direction || "north";
    stage.export_tile_size = stage.export_tile_size || 48;
    return stage;
  }

  function normalizeStages() {
    if (!Array.isArray(state.doc.stages)) state.doc.stages = [];
    for (const stage of state.doc.stages) {
      normalizeStage(stage);
      if ((!stage.markers.length || !stage.paths.length) && state.doc.stages.length === 1) {
        if (!stage.markers.length && Array.isArray(state.doc.markers)) stage.markers = state.doc.markers.filter((marker) => marker.x >= stage.x && marker.y >= stage.y && marker.x < stage.x + stage.width && marker.y < stage.y + stage.height);
        if (!stage.paths.length && Array.isArray(state.doc.paths)) stage.paths = state.doc.paths.slice();
      }
    }
    if (!state.activeStageId && state.doc.stages[0]) state.activeStageId = state.doc.stages[0].id;
  }

  function createDefaultStage(index) {
    const id = `stage_${String(index).padStart(2, "0")}`;
    return normalizeStage({
      id,
      name: `Stage ${String(index).padStart(2, "0")}`,
      bounds: { x: 0, y: 0, width: 18, height: 32 },
      included_room_ids: [],
      padding_color: "#efe5d2",
      export_tile_size: 48,
      ratio: "9:16",
      custom_ratio: "9:16",
      top_direction: "north",
      markers: [],
      paths: [],
      path_areas: [],
      build_tiles: [],
      waves: []
    });
  }

  function ensureStage() {
    normalizeStages();
    if (!state.doc.stages.length) {
      const stage = createDefaultStage(1);
      state.doc.stages.push(stage);
      state.activeStageId = stage.id;
    }
    return activeStage();
  }

  function setActiveStageId(id) {
    normalizeStages();
    const stage = state.doc.stages.find((item) => item.id === id);
    if (!stage) return;
    state.activeStageId = stage.id;
    normalizeStage(stage);
    if (stage.paths.length && !stage.paths.some((path) => path.id === stage.active_path_id)) stage.active_path_id = stage.paths[0].id;
    if (!stage.paths.length) stage.active_path_id = "";
    state.activePathId = stage.active_path_id;
    syncStageFields();
    saveDocument();
    refreshInspector();
    render();
  }

  function activeStageMarkers() {
    const stage = ensureStage();
    return stage ? stage.markers : [];
  }

  function activeStagePaths() {
    const stage = ensureStage();
    return stage ? stage.paths : [];
  }

  function activePath() {
    const stage = ensureStage();
    let path = stage.paths.find((item) => item.id === (stage.active_path_id || state.activePathId || elements.pathSelect.value));
    if (!path) path = stage.paths[0] || null;
    if (!path) {
      stage.active_path_id = "";
      state.activePathId = "";
      return null;
    }
    stage.active_path_id = path.id;
    state.activePathId = path.id;
    return path;
  }

  function tileSize() {
    return state.doc.map.tile_size;
  }

  function canvasToTile(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / (tileSize() * state.zoom));
    const y = Math.floor((event.clientY - rect.top) / (tileSize() * state.zoom));
    return {
      x: clamp(x, 0, state.doc.map.width - 1),
      y: clamp(y, 0, state.doc.map.height - 1)
    };
  }

  function canvasToCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / state.zoom,
      y: (event.clientY - rect.top) / state.zoom
    };
  }

  function roomForId(id) {
    return state.doc.rooms.find((room) => room.id === id) || null;
  }

  function roomDefinitionForId(id) {
    ensureDefinitions();
    return state.doc.room_definitions.find((room) => room.id === id) || state.doc.room_definitions[0] || DEFAULT_ROOM_DEFINITIONS[0];
  }

  function activeRoomDefinition() {
    return roomDefinitionForId(elements.roomType.value);
  }

  function objectDefinitionsForRoom(roomId) {
    ensureDefinitions();
    return state.doc.object_definitions.filter((definition) => definition.room_id === roomId || definition.room_id === "common");
  }

  function objectDefinitionForId(id) {
    ensureDefinitions();
    return state.doc.object_definitions.find((definition) => definition.id === id && definition.room_id === elements.objectRoomType.value) ||
      state.doc.object_definitions.find((definition) => definition.id === id && definition.room_id === "common") ||
      state.doc.object_definitions.find((definition) => definition.id === id) ||
      null;
  }

  function objectDefinitionLabel(id) {
    return objectDefinitionForId(id)?.name || objectCategoryLabels[id] || id;
  }

  function selectedObject() {
    if (state.mode === "stage") return null;
    if (state.selected?.type !== "object") return null;
    return state.doc.objects.find((object) => object.id === state.selected.id) || null;
  }

  function objectAtTile(x, y) {
    if (state.mode === "stage") return null;
    return [...state.doc.objects].reverse().find((item) => core.objectFootprint(item).some((cell) => cell.x === x && cell.y === y)) || null;
  }

  function markerAtTile(x, y) {
    if (state.mode !== "stage") return null;
    return [...activeStageMarkers()].reverse().find((item) => x >= item.x && y >= item.y && x < item.x + (item.width || 1) && y < item.y + (item.height || 1)) || null;
  }

  function pathAtTile(x, y) {
    if (state.mode !== "stage") return null;
    return [...activeStagePaths()].reverse().find((path) => {
      if (core.rasterizePath(path).some((cell) => cell.x === x && cell.y === y)) return true;
      return (path.areas || []).some((area) => x >= area.x && y >= area.y && x < area.x + area.width && y < area.y + area.height);
    }) || null;
  }

  function pathBounds(path) {
    const cells = [
      ...(path.points || []),
      ...core.pathAreaCells(path.areas || [])
    ];
    if (!cells.length) return null;
    const minX = Math.min(...cells.map((cell) => cell.x));
    const minY = Math.min(...cells.map((cell) => cell.y));
    const maxX = Math.max(...cells.map((cell) => cell.x));
    const maxY = Math.max(...cells.map((cell) => cell.y));
    return { minX, minY, maxX, maxY };
  }

  function pointInsideMarker(point, marker) {
    if (!point || !marker) return false;
    return point.x >= marker.x && point.y >= marker.y && point.x < marker.x + (marker.width || 1) && point.y < marker.y + (marker.height || 1);
  }

  function pathHasReachedBase(path, stage) {
    if (!path || !stage || !path.base_id || !(path.points || []).length) return false;
    const base = markersOfType(stage, "base").find((marker) => marker.id === path.base_id);
    return pointInsideMarker(path.points[path.points.length - 1], base);
  }

  function movePathByDelta(path, dx, dy) {
    const bounds = pathBounds(path);
    if (!bounds || (!dx && !dy)) return { dx: 0, dy: 0 };
    const clampedDx = clamp(dx, -bounds.minX, state.doc.map.width - 1 - bounds.maxX);
    const clampedDy = clamp(dy, -bounds.minY, state.doc.map.height - 1 - bounds.maxY);
    for (const point of path.points || []) {
      point.x += clampedDx;
      point.y += clampedDy;
    }
    for (const area of path.areas || []) {
      area.x += clampedDx;
      area.y += clampedDy;
    }
    return { dx: clampedDx, dy: clampedDy };
  }

  function objectBounds(object) {
    const footprint = core.objectFootprint(object);
    const minX = Math.min(...footprint.map((cell) => cell.x));
    const minY = Math.min(...footprint.map((cell) => cell.y));
    const maxX = Math.max(...footprint.map((cell) => cell.x));
    const maxY = Math.max(...footprint.map((cell) => cell.y));
    return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
  }

  function objectRect(object, size) {
    const bounds = objectBounds(object);
    return {
      x: bounds.minX * size + 5,
      y: bounds.minY * size + 5,
      width: bounds.width * size - 10,
      height: bounds.height * size - 10
    };
  }

  function objectControlRects(object, size) {
    const rect = objectRect(object, size);
    const buttonSize = Math.max(22, size * 0.42);
    const gap = 6;
    return {
      rotate: {
        x: rect.x + rect.width - buttonSize * 2 - gap,
        y: rect.y - buttonSize - gap,
        width: buttonSize,
        height: buttonSize
      },
      delete: {
        x: rect.x + rect.width - buttonSize,
        y: rect.y - buttonSize - gap,
        width: buttonSize,
        height: buttonSize
      }
    };
  }

  function pointInRect(point, rect) {
    return point.x >= rect.x && point.y >= rect.y && point.x <= rect.x + rect.width && point.y <= rect.y + rect.height;
  }

  function objectActionAtPoint(x, y) {
    const object = selectedObject();
    if (!object) return null;
    const point = { x, y };
    const controls = objectControlRects(object, tileSize());
    if (pointInRect(point, controls.rotate)) return "rotate";
    if (pointInRect(point, controls.delete)) return "delete";
    return null;
  }

  function ensureRoom() {
    const definition = activeRoomDefinition();
    const preset = ROOM_TYPE_PRESETS[definition.type] || definition || ROOM_TYPE_PRESETS.living_room;
    const id = definition.id;
    let room = roomForId(id);
    if (!room) {
      room = {
        id,
        name: definition.name,
        type: definition.type || definition.id,
        color: definition.color || preset.color,
        notes: "",
        cells: []
      };
      state.doc.rooms.push(room);
    } else {
      room.name = definition.name;
      room.type = definition.type || definition.id;
      room.color = definition.color || room.color || preset.color;
    }
    elements.roomId.value = room.id;
    elements.roomName.value = room.name;
    elements.roomColor.value = room.color || definition.color || preset.color;
    return room;
  }

  function paintTile(x, y) {
    const tile = core.getTile(state.doc, x, y);
    if (!tile) return;
    Object.assign(tile, {
      structure: elements.structure.value,
      build: elements.build.value
    });
  }

  function paintRoom(x, y) {
    const tile = core.getTile(state.doc, x, y);
    if (!tile) return;
    const room = ensureRoom();
    const definition = roomDefinitionForId(room.id);
    const preset = ROOM_TYPE_PRESETS[room.type] || definition || ROOM_TYPE_PRESETS.living_room;
    tile.room_id = room.id;
    tile.terrain = definition.terrain || preset.terrain;
    tile.build = tile.structure === "wall" ? "blocked" : "allowed";
    if (!room.cells.some((cell) => cell.x === x && cell.y === y)) room.cells.push({ x, y });
  }

  function eraseTile(x, y) {
    if (state.mode === "stage") {
      const stage = activeStage();
      if (!stage) return;
      stage.markers = stage.markers.filter((marker) => !(x >= marker.x && y >= marker.y && x < marker.x + (marker.width || 1) && y < marker.y + (marker.height || 1)));
      for (const path of stage.paths) {
        path.points = (path.points || []).filter((point) => point.x !== x || point.y !== y);
        path.areas = (path.areas || []).filter((area) => !(x >= area.x && y >= area.y && x < area.x + area.width && y < area.y + area.height));
      }
      stage.path_areas = (stage.path_areas || []).filter((area) => !(x >= area.x && y >= area.y && x < area.x + area.width && y < area.y + area.height));
      return;
    }
    const object = objectAtTile(x, y);
    if (object) {
      state.doc.objects = state.doc.objects.filter((item) => item.id !== object.id);
      if (state.selected?.type === "object" && state.selected.id === object.id) state.selected = null;
      return;
    }
    const tile = core.getTile(state.doc, x, y);
    if (!tile) return;
    Object.assign(tile, { terrain: "void", structure: "none", build: "blocked", room_id: null, notes: "" });
    for (const room of state.doc.rooms) {
      room.cells = (room.cells || []).filter((cell) => cell.x !== x || cell.y !== y);
    }
    state.doc.objects = state.doc.objects.filter((object) => !core.objectFootprint(object).some((cell) => cell.x === x && cell.y === y));
    const stage = activeStage();
    if (stage) stage.markers = stage.markers.filter((marker) => marker.x !== x || marker.y !== y);
  }

  function drawRect(a, b, mode) {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const width = Math.abs(a.x - b.x) + 1;
    const height = Math.abs(a.y - b.y) + 1;
    for (const cell of core.rectCells(x, y, width, height)) {
      if (mode === "room") paintRoom(cell.x, cell.y);
      else paintTile(cell.x, cell.y);
    }
  }

  function addPathArea(a, b) {
    const stage = ensureStage();
    const path = activePath() || createPath(stage);
    const rect = rectFromPoints(a, b);
    path.areas.push(rect);
  }

  function activeStage() {
    normalizeStages();
    const id = state.activeStageId || elements.stageId.value.trim();
    return state.doc.stages.find((stage) => stage.id === id) || state.doc.stages[0] || null;
  }

  function parseRatio(value) {
    const text = String(value || "").trim();
    const match = text.match(/^(\d+(?:\.\d+)?)(?::|x)(\d+(?:\.\d+)?)$/i);
    if (!match) return null;
    const width = Number(match[1]);
    const height = Number(match[2]);
    if (!width || !height) return null;
    return { width, height };
  }

  function activeStageRatio() {
    const stage = activeStage();
    if (!stage) return null;
    if (stage.ratio === "custom") return parseRatio(stage.custom_ratio);
    return STAGE_RATIO_PRESETS[stage.ratio] || null;
  }

  function applyStageRatio(rect) {
    const ratio = activeStageRatio();
    if (!ratio) return rect;
    const widthFromHeight = Math.max(1, Math.round(rect.height * ratio.width / ratio.height));
    const heightFromWidth = Math.max(1, Math.round(rect.width * ratio.height / ratio.width));
    if (Math.abs(widthFromHeight - rect.width) <= Math.abs(heightFromWidth - rect.height)) {
      return Object.assign({}, rect, { width: clamp(widthFromHeight, 1, state.doc.map.width - rect.x) });
    }
    return Object.assign({}, rect, { height: clamp(heightFromWidth, 1, state.doc.map.height - rect.y) });
  }

  function createStage(a, b) {
    const rect = applyStageRatio(rectFromPoints(a, b));
    const x = rect.x;
    const y = rect.y;
    const width = rect.width;
    const height = rect.height;
    const id = elements.stageId.value.trim() || `stage_${state.doc.stages.length + 1}`;
    let stage = state.doc.stages.find((item) => item.id === id);
    if (!stage) {
      stage = normalizeStage({ id, name: elements.stageName.value.trim() || id, bounds: { x, y, width, height }, included_room_ids: [], padding_color: "#efe5d2", export_tile_size: 48 });
      state.doc.stages.push(stage);
    } else {
      normalizeStage(stage);
      Object.assign(stage, { name: elements.stageName.value.trim() || stage.name, x, y, width, height });
      stage.bounds = { x, y, width, height };
    }
    state.activeStageId = stage.id;
  }

  function addPathPoint(x, y) {
    const stage = ensureStage();
    const path = activePath() || createPath(stage);
    if (pathHasReachedBase(path, stage)) return;
    const last = path.points[path.points.length - 1];
    if (!last || last.x !== x || last.y !== y) path.points.push({ x, y });
  }

  function addObject(x, y) {
    if (state.mode === "stage") return;
    const id = `object_${Date.now().toString(36)}`;
    const category = elements.objectCategory.value;
    const object = {
      id,
      name: "Object",
      category,
      x,
      y,
      width: Number(elements.objectWidth.value || 1),
      height: Number(elements.objectHeight.value || 1),
      facing: elements.objectFacing.value,
      rotation: Number(elements.objectRotation.value || 0),
      door_type: elements.doorType.value,
      door_swing: elements.doorSwing.value,
      open_state: elements.doorOpenState.value,
      door_hinge: elements.doorHinge.value,
      room_id: core.getTile(state.doc, x, y)?.room_id || null,
      blocking: elements.objectBlocking.checked,
      notes: ""
    };
    object.name = objectDefinitionLabel(category);
    state.doc.objects.push(object);
    state.selected = { type: "object", id };
  }

  function moveObjectTo(object, x, y) {
    object.x = clamp(x, 0, state.doc.map.width - Math.max(1, object.width || 1));
    object.y = clamp(y, 0, state.doc.map.height - Math.max(1, object.height || 1));
    object.room_id = core.getTile(state.doc, object.x, object.y)?.room_id || null;
  }

  function rotateFacing(facing) {
    return { north: "east", east: "south", south: "west", west: "north" }[facing] || "east";
  }

  function rotateSelectedObject() {
    const object = selectedObject();
    if (!object) return;
    const width = object.width || 1;
    object.width = object.height || 1;
    object.height = width;
    object.rotation = ((Number(object.rotation || 0) + 90) % 360);
    object.facing = rotateFacing(object.facing);
    moveObjectTo(object, object.x, object.y);
  }

  function deleteSelectedObject() {
    const object = selectedObject();
    if (!object) return;
    state.doc.objects = state.doc.objects.filter((item) => item.id !== object.id);
    state.selected = null;
  }

  function addMarker(x, y) {
    if (state.mode !== "stage") return;
    const stage = ensureStage();
    const type = elements.markerType.value;
    const id = `${type}_${Date.now().toString(36)}`;
    stage.markers.push({ id, type, x, y, width: type === "build_slot" ? 2 : 1, height: type === "build_slot" ? 2 : 1, label: stageMarkerLabel(stage, type) });
    renderPathEndpointSelects();
  }

  function selectAt(x, y) {
    if (state.mode === "stage") {
      const marker = markerAtTile(x, y);
      if (marker) {
        state.selected = { type: "marker", id: marker.id };
        return;
      }
      const path = pathAtTile(x, y);
      if (path) {
        state.selected = { type: "path", id: path.id };
        setActivePathId(path.id);
        return;
      }
      state.selected = { type: "tile", x, y };
      return;
    }
    const object = objectAtTile(x, y);
    if (object) {
      state.selected = { type: "object", id: object.id };
      return;
    }
    state.selected = { type: "tile", x, y };
  }

  function handlePointerDown(event) {
    const point = canvasToTile(event);
    const canvasPoint = canvasToCanvasPoint(event);
    state.isDragging = true;
    state.dragStart = point;
    state.dragCurrent = point;
    state.previewRect = null;
    state.objectDrag = null;
    state.markerDrag = null;
    state.pathDrag = null;
    if (state.tool === "pan") {
      state.panStart = { x: event.clientX, y: event.clientY, left: elements.scroller.scrollLeft, top: elements.scroller.scrollTop };
      return;
    }
    if (state.tool === "select") {
      if (state.mode === "stage") {
        const marker = markerAtTile(point.x, point.y);
        if (marker) {
          pushHistory();
          state.selected = { type: "marker", id: marker.id };
          state.markerDrag = { id: marker.id, offsetX: point.x - marker.x, offsetY: point.y - marker.y, moved: false };
          afterChange(false);
          return;
        }
        const path = pathAtTile(point.x, point.y);
        if (path) {
          pushHistory();
          state.selected = { type: "path", id: path.id };
          setActivePathId(path.id);
          state.pathDrag = { id: path.id, startX: point.x, startY: point.y, appliedDx: 0, appliedDy: 0, moved: false };
          afterChange(false);
          return;
        }
      }
      const action = objectActionAtPoint(canvasPoint.x, canvasPoint.y);
      if (action === "rotate") {
        pushHistory();
        rotateSelectedObject();
        afterChange(true);
        return;
      }
      if (action === "delete") {
        pushHistory();
        deleteSelectedObject();
        afterChange(true);
        return;
      }
      const object = objectAtTile(point.x, point.y);
      if (object) {
        pushHistory();
        state.selected = { type: "object", id: object.id };
        state.objectDrag = { id: object.id, offsetX: point.x - object.x, offsetY: point.y - object.y, moved: false };
        afterChange(false);
        return;
      }
    }
    if (state.tool === "marker" && state.mode === "stage") {
      const marker = markerAtTile(point.x, point.y);
      if (marker) {
        pushHistory();
        state.selected = { type: "marker", id: marker.id };
        state.markerDrag = { id: marker.id, offsetX: point.x - marker.x, offsetY: point.y - marker.y, moved: false };
        afterChange(false);
        return;
      }
    }
    if (state.tool === "rect" || state.tool === "stage" || state.tool === "path_area") {
      state.previewRect = rectFromPoints(point, point);
      render();
      return;
    }
    pushHistory();
    if (state.tool === "select") selectAt(point.x, point.y);
    if (state.tool === "tile") paintTile(point.x, point.y);
    if (state.tool === "room") paintRoom(point.x, point.y);
    if (state.tool === "erase") eraseTile(point.x, point.y);
    if (state.tool === "path" && state.mode === "stage") addPathPoint(point.x, point.y);
    if (state.tool === "object") addObject(point.x, point.y);
    if (state.tool === "marker" && state.mode === "stage") addMarker(point.x, point.y);
    afterChange(true);
  }

  function handlePointerMove(event) {
    const point = canvasToTile(event);
    elements.coordStatus.textContent = `x ${point.x}, y ${point.y}`;
    if (!state.isDragging) return;
    state.dragCurrent = point;
    if (state.tool === "pan" && state.panStart) {
      elements.scroller.scrollLeft = state.panStart.left - (event.clientX - state.panStart.x);
      elements.scroller.scrollTop = state.panStart.top - (event.clientY - state.panStart.y);
      return;
    }
    if (event.buttons !== 1) return;
    if (state.objectDrag) {
      const object = state.doc.objects.find((item) => item.id === state.objectDrag.id);
      if (object) {
        const nextX = point.x - state.objectDrag.offsetX;
        const nextY = point.y - state.objectDrag.offsetY;
        if (nextX !== object.x || nextY !== object.y) state.objectDrag.moved = true;
        moveObjectTo(object, nextX, nextY);
      }
      render();
      return;
    }
    if (state.markerDrag) {
      const stage = activeStage();
      const marker = stage?.markers?.find((item) => item.id === state.markerDrag.id);
      if (marker) {
        const nextX = clamp(point.x - state.markerDrag.offsetX, 0, state.doc.map.width - Math.max(1, marker.width || 1));
        const nextY = clamp(point.y - state.markerDrag.offsetY, 0, state.doc.map.height - Math.max(1, marker.height || 1));
        if (nextX !== marker.x || nextY !== marker.y) state.markerDrag.moved = true;
        marker.x = nextX;
        marker.y = nextY;
      }
      render();
      return;
    }
    if (state.pathDrag) {
      const stage = activeStage();
      const path = stage?.paths?.find((item) => item.id === state.pathDrag.id);
      if (path) {
        const nextDx = point.x - state.pathDrag.startX;
        const nextDy = point.y - state.pathDrag.startY;
        const moved = movePathByDelta(path, nextDx - state.pathDrag.appliedDx, nextDy - state.pathDrag.appliedDy);
        state.pathDrag.appliedDx += moved.dx;
        state.pathDrag.appliedDy += moved.dy;
        if (moved.dx || moved.dy) state.pathDrag.moved = true;
      }
      render();
      return;
    }
    if (state.tool === "rect" || state.tool === "stage" || state.tool === "path_area") {
      state.previewRect = rectFromPoints(state.dragStart, point);
      render();
      return;
    }
    if (state.tool === "tile") paintTile(point.x, point.y);
    if (state.tool === "room") paintRoom(point.x, point.y);
    if (state.tool === "erase") eraseTile(point.x, point.y);
    render();
  }

  function handlePointerUp(event) {
    if (!state.isDragging) return;
    const point = canvasToTile(event);
    if (state.dragStart) {
      if (state.tool === "rect") {
        pushHistory();
        drawRect(state.dragStart, point, "room");
      }
      if (state.tool === "stage") {
        pushHistory();
        createStage(state.dragStart, point);
      }
      if (state.tool === "path_area") {
        pushHistory();
        addPathArea(state.dragStart, point);
      }
    }
    state.isDragging = false;
    state.dragStart = null;
    state.dragCurrent = null;
    state.previewRect = null;
    const objectDrag = state.objectDrag;
    const markerDrag = state.markerDrag;
    const pathDrag = state.pathDrag;
    state.objectDrag = null;
    state.markerDrag = null;
    state.pathDrag = null;
    state.panStart = null;
    afterChange(objectDrag?.moved || markerDrag?.moved || pathDrag?.moved || state.tool === "rect" || state.tool === "stage" || state.tool === "path_area");
  }

  function setTool(tool) {
    if (!toolAllowedInMode(tool, state.mode)) return;
    state.tool = tool;
    document.querySelectorAll(".tool").forEach((button) => button.classList.toggle("active", button.dataset.tool === tool));
    refreshInspector();
  }

  function isTypingTarget(target) {
    if (!target) return false;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
  }

  function setPaintValue(target, value) {
    const input = elements[target];
    if (!input) return;
    input.value = value;
    refreshPaintButtons();
  }

  function setObjectCategory(category) {
    elements.objectCategory.value = category;
    const defaults = objectCategoryDefaults[category];
    if (defaults) {
      elements.objectWidth.value = defaults.width;
      elements.objectHeight.value = defaults.height;
      elements.objectFacing.value = defaults.facing;
      elements.objectBlocking.checked = defaults.blocking !== false;
    }
    elements.objectName.value = objectDefinitionLabel(category);
    refreshObjectCategoryButtons();
    updateObjectFields();
  }

  function objectCategoryRooms() {
    const roomId = elements.objectRoomType.value;
    return objectDefinitionsForRoom(roomId).map((definition) => definition.id);
  }

  function renderObjectPalette() {
    const categories = objectCategoryRooms();
    elements.objectCategoryButtons.innerHTML = "";
    for (const category of categories) {
      const button = document.createElement("button");
      button.className = "choice-btn object-choice";
      button.dataset.objectCategory = category;
      button.type = "button";
      button.textContent = objectDefinitionLabel(category);
      button.addEventListener("click", () => setObjectCategory(category));
      elements.objectCategoryButtons.appendChild(button);
    }
    if (!categories.includes(elements.objectCategory.value)) setObjectCategory(categories[0] || "door");
    else refreshObjectCategoryButtons();
    elements.objectName.value = objectDefinitionLabel(elements.objectCategory.value);
  }

  function refreshObjectCategoryButtons() {
    document.querySelectorAll("[data-object-category]").forEach((button) => {
      button.classList.toggle("active", button.dataset.objectCategory === elements.objectCategory.value);
    });
  }

  function updateObjectFields() {
    elements.doorFields.hidden = elements.objectCategory.value !== "door";
    refreshObjectCategoryButtons();
  }

  function updateContextualControls() {
    elements.stageDetail.hidden = state.mode !== "stage" || state.tool !== "stage";
    elements.pathWidthControls.hidden = state.mode !== "stage" || state.tool !== "path";
  }

  function updateInspectorPanels() {
    const visible = new Set(["status", ...(TOOL_PANELS[state.tool] || [])]);
    if (state.mode === "map") visible.add("map-manager");
    if (state.mode === "stage") {
      visible.add("stage-list");
      visible.add("stage-preview");
    }
    if (selectedObject() && state.mode === "map") visible.add("selected-object");
    document.querySelectorAll(".inspector .panel[data-panel]").forEach((panel) => {
      const panelMode = panel.dataset.modePanel;
      panel.hidden = !visible.has(panel.dataset.panel) || Boolean(panelMode && panelMode !== state.mode);
    });
    updateContextualControls();
  }

  function syncSelectedObjectFields() {
    const object = selectedObject();
    if (!object) {
      elements.selectedDoorFields.hidden = true;
      elements.selectedObjectSummary.textContent = "No object selected";
      return;
    }
    elements.selectedDoorFields.hidden = object.category !== "door";
    syncingSelectedObjectFields = true;
    elements.selectedObjectSummary.textContent = `${object.name || object.id} | ${object.x}, ${object.y}`;
    elements.selectedObjectWidth.value = object.width || 1;
    elements.selectedObjectHeight.value = object.height || 1;
    elements.selectedObjectFacing.value = object.facing || "south";
    elements.selectedObjectBlocking.checked = Boolean(object.blocking);
    elements.selectedObjectOverlap.checked = Boolean(object.allow_overlap);
    elements.selectedDoorType.value = object.door_type || "hinged";
    elements.selectedDoorSwing.value = object.door_swing || "in";
    elements.selectedDoorOpenState.value = object.open_state || "open";
    elements.selectedDoorHinge.value = object.door_hinge || "start";
    syncingSelectedObjectFields = false;
  }

  function updateSelectedObjectFromFields() {
    if (syncingSelectedObjectFields) return;
    const object = selectedObject();
    if (!object) return;
    pushHistory();
    object.width = clamp(Number(elements.selectedObjectWidth.value || 1), 1, 12);
    object.height = clamp(Number(elements.selectedObjectHeight.value || 1), 1, 12);
    object.facing = elements.selectedObjectFacing.value;
    object.blocking = elements.selectedObjectBlocking.checked;
    object.allow_overlap = elements.selectedObjectOverlap.checked;
    object.door_type = elements.selectedDoorType.value;
    object.door_swing = elements.selectedDoorSwing.value;
    object.open_state = elements.selectedDoorOpenState.value;
    object.door_hinge = elements.selectedDoorHinge.value;
    moveObjectTo(object, object.x, object.y);
    afterChange(true);
  }

  function syncStageFields() {
    const stage = ensureStage();
    if (!stage) return;
    elements.stageId.value = stage.id;
    elements.stageName.value = stage.name || stage.id;
    elements.stageWidth.value = stage.width;
    elements.stageHeight.value = stage.height;
    elements.stageRatio.value = stage.ratio || "9:16";
    elements.stageCustomRatio.value = stage.custom_ratio || "9:16";
    elements.stageTopDirection.value = stage.top_direction || "north";
    elements.stageCustomRatio.disabled = elements.stageRatio.value !== "custom";
    syncPathWidthField();
  }

  function syncPathWidthField() {
    const path = activePath();
    elements.pathWidth.value = path ? path.width_tiles || 1 : 1;
  }

  function updatePathWidthFromField() {
    const path = activePath();
    if (!path) return;
    path.width_tiles = clamp(Number(elements.pathWidth.value || 1), 1, 6);
    elements.pathWidth.value = path.width_tiles;
    afterChange(true);
  }

  function renderPathSelect() {
    const stage = ensureStage();
    const active = activePath();
    elements.pathSelect.innerHTML = "";
    for (const path of stage.paths) {
      const option = document.createElement("option");
      option.value = path.id;
      option.textContent = path.name || path.id;
      elements.pathSelect.appendChild(option);
    }
    elements.pathSelect.value = active?.id || "";
    renderPathEndpointSelects();
  }

  function fillMarkerSelect(select, markers, value, emptyLabel) {
    select.innerHTML = "";
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = emptyLabel;
    select.appendChild(empty);
    for (const marker of markers) {
      const option = document.createElement("option");
      option.value = marker.id;
      option.textContent = markerLabel(marker);
      select.appendChild(option);
    }
    select.value = markers.some((marker) => marker.id === value) ? value : "";
  }

  function renderPathEndpointSelects() {
    const stage = ensureStage();
    const path = activePath();
    fillMarkerSelect(elements.pathSpawn, markersOfType(stage, "spawn"), path?.spawn_id || "", "Select Spawn");
    fillMarkerSelect(elements.pathBase, markersOfType(stage, "base"), path?.base_id || "", "Select Base");
    elements.pathSpawn.disabled = !path;
    elements.pathBase.disabled = !path;
  }

  function updatePathEndpointsFromFields() {
    const path = activePath();
    if (!path) return;
    path.spawn_id = elements.pathSpawn.value;
    path.base_id = elements.pathBase.value;
    afterChange(true);
  }

  function setActivePathId(id) {
    const stage = ensureStage();
    const path = stage.paths.find((item) => item.id === id);
    if (!path) return;
    stage.active_path_id = path.id;
    state.activePathId = path.id;
    saveDocument();
    refreshInspector();
    render();
  }

  function addPath() {
    const stage = ensureStage();
    pushHistory();
    createPath(stage);
    afterChange(true);
  }

  function deletePath() {
    const stage = ensureStage();
    const path = activePath();
    if (!path) return;
    pushHistory();
    stage.paths = stage.paths.filter((item) => item.id !== path.id);
    stage.active_path_id = stage.paths[0]?.id || "";
    state.activePathId = stage.active_path_id;
    afterChange(true);
  }

  function updateStageFromFields() {
    const stage = ensureStage();
    if (!stage) return;
    stage.name = elements.stageName.value.trim() || stage.id;
    stage.width = clamp(Number(elements.stageWidth.value || stage.width), 1, state.doc.map.width - stage.x);
    stage.height = clamp(Number(elements.stageHeight.value || stage.height), 1, state.doc.map.height - stage.y);
    stage.bounds = { x: stage.x, y: stage.y, width: stage.width, height: stage.height };
    stage.ratio = elements.stageRatio.value;
    stage.custom_ratio = elements.stageCustomRatio.value.trim() || "9:16";
    stage.top_direction = elements.stageTopDirection.value;
    elements.stageCustomRatio.disabled = stage.ratio !== "custom";
    afterChange(true);
  }

  function renderStageList() {
    normalizeStages();
    elements.stageList.innerHTML = "";
    for (const stage of state.doc.stages) {
      const button = document.createElement("button");
      button.className = "stage-list-item";
      button.type = "button";
      button.dataset.stageId = stage.id;
      button.classList.toggle("active", activeStage()?.id === stage.id);
      button.textContent = `${stage.name || stage.id} ${stage.width}x${stage.height}`;
      button.addEventListener("click", () => setActiveStageId(stage.id));
      elements.stageList.appendChild(button);
    }
  }

  function renderMapList() {
    normalizeMaps();
    elements.mapList.innerHTML = "";
    const validIds = new Set(state.doc.maps.map((map) => map.id));
    for (const id of Array.from(state.selectedMapIds)) {
      if (!validIds.has(id)) state.selectedMapIds.delete(id);
    }
    for (const map of state.doc.maps) {
      const row = document.createElement("div");
      row.className = "map-list-row";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.setAttribute("data-map-select-id", map.id);
      checkbox.checked = state.selectedMapIds.has(map.id);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) state.selectedMapIds.add(map.id);
        else state.selectedMapIds.delete(map.id);
      });
      const button = document.createElement("button");
      button.className = "stage-list-item";
      button.type = "button";
      button.dataset.mapId = map.id;
      button.classList.toggle("active", map.id === state.doc.active_map_id);
      button.textContent = map.name || map.id;
      button.addEventListener("click", () => setActiveMapId(map.id));
      row.appendChild(checkbox);
      row.appendChild(button);
      elements.mapList.appendChild(row);
    }
    elements.mapName.value = state.doc.map.name || state.doc.map.id;
    elements.deleteMap.disabled = state.doc.maps.length <= 1;
  }

  function renderRoomList() {
    ensureDefinitions();
    elements.roomList.innerHTML = "";
    for (const room of state.doc.room_definitions) {
      const button = document.createElement("button");
      button.className = "stage-list-item";
      button.type = "button";
      button.dataset.roomId = room.id;
      button.classList.toggle("active", room.id === elements.roomType.value);
      button.textContent = room.name || room.id;
      button.addEventListener("click", () => setActiveRoomDefinition(room.id));
      elements.roomList.appendChild(button);
    }
    const room = activeRoomDefinition();
    elements.roomId.value = room.id;
    elements.roomType.value = room.id;
    elements.roomName.value = room.name || room.id;
    elements.roomColor.value = room.color || (ROOM_TYPE_PRESETS[room.type] || ROOM_TYPE_PRESETS.living_room).color;
    elements.deleteRoom.disabled = state.doc.room_definitions.length <= 1;
  }

  function renderObjectRoomList() {
    ensureDefinitions();
    elements.objectRoomList.innerHTML = "";
    for (const room of state.doc.room_definitions) {
      const button = document.createElement("button");
      button.className = "stage-list-item";
      button.type = "button";
      button.dataset.objectRoomId = room.id;
      button.classList.toggle("active", room.id === elements.objectRoomType.value);
      button.textContent = room.name || room.id;
      button.addEventListener("click", () => {
        elements.objectRoomType.value = room.id;
        renderObjectPalette();
        refreshInspector();
      });
      elements.objectRoomList.appendChild(button);
    }
  }

  function setActiveRoomDefinition(id) {
    const room = roomDefinitionForId(id);
    elements.roomType.value = room.id;
    elements.objectRoomType.value = room.id;
    renderObjectPalette();
    refreshInspector();
  }

  function addRoomDefinition() {
    ensureDefinitions();
    pushHistory();
    const id = uniqueId(`room_${state.doc.room_definitions.length + 1}`, new Set(state.doc.room_definitions.map((room) => room.id)));
    const color = ["#2f8f73", "#c27a34", "#5e82c4", "#b0659f", "#4aa0b5", "#9f7b4f"][state.doc.room_definitions.length % 6];
    state.doc.room_definitions.push({ id, name: `New Room ${state.doc.room_definitions.length + 1}`, type: id, color, terrain: "indoor_floor" });
    elements.roomType.value = id;
    elements.objectRoomType.value = id;
    afterChange(true);
  }

  function deleteRoomDefinition() {
    ensureDefinitions();
    if (state.doc.room_definitions.length <= 1) return;
    const id = elements.roomType.value;
    pushHistory();
    const index = Math.max(0, state.doc.room_definitions.findIndex((room) => room.id === id));
    state.doc.room_definitions = state.doc.room_definitions.filter((room) => room.id !== id);
    state.doc.object_definitions = state.doc.object_definitions.filter((definition) => definition.room_id !== id);
    state.doc.rooms = state.doc.rooms.filter((room) => room.id !== id);
    state.doc.objects = state.doc.objects.filter((object) => object.room_id !== id);
    for (const tile of state.doc.tiles || []) {
      if (tile.room_id === id) Object.assign(tile, { room_id: null });
    }
    const next = state.doc.room_definitions[Math.min(index, state.doc.room_definitions.length - 1)];
    elements.roomType.value = next.id;
    elements.objectRoomType.value = next.id;
    afterChange(true);
  }

  function updateRoomDefinitionName() {
    const room = roomDefinitionForId(elements.roomType.value);
    if (!room) return;
    pushHistory();
    room.name = elements.roomName.value.trim() || room.id;
    const placed = roomForId(room.id);
    if (placed) placed.name = room.name;
    afterChange(true);
  }

  function addObjectDefinition() {
    ensureDefinitions();
    pushHistory();
    const roomId = elements.objectRoomType.value || activeRoomDefinition().id;
    const usedIds = new Set(state.doc.object_definitions.map((definition) => definition.id));
    const id = uniqueId(`object_${state.doc.object_definitions.length + 1}`, usedIds);
    const name = `New Object ${objectDefinitionsForRoom(roomId).filter((definition) => definition.room_id === roomId).length + 1}`;
    state.doc.object_definitions.push({ room_id: roomId, id, name });
    elements.objectCategory.value = id;
    afterChange(true);
  }

  function deleteObjectDefinition() {
    ensureDefinitions();
    const id = elements.objectCategory.value;
    const roomId = elements.objectRoomType.value;
    const definition = objectDefinitionForId(id);
    if (!definition) return;
    pushHistory();
    state.doc.object_definitions = state.doc.object_definitions.filter((item) => item !== definition);
    const next = objectDefinitionsForRoom(roomId)[0] || state.doc.object_definitions[0];
    elements.objectCategory.value = next?.id || "door";
    afterChange(true);
  }

  function updateObjectDefinitionName() {
    const definition = objectDefinitionForId(elements.objectCategory.value);
    if (!definition) return;
    pushHistory();
    definition.name = elements.objectName.value.trim() || definition.id;
    afterChange(true);
  }

  function setActiveMapId(id) {
    normalizeMaps();
    const map = state.doc.maps.find((item) => item.id === id);
    if (!map) return;
    pushHistory();
    applyMapSnapshot(map);
    afterChange(true);
  }

  function updateMapName() {
    normalizeMaps();
    state.doc.map.name = elements.mapName.value.trim() || state.doc.map.id;
    const map = state.doc.maps.find((item) => item.id === state.doc.active_map_id);
    if (map) {
      map.name = state.doc.map.name;
      if (map.map) map.map.name = state.doc.map.name;
    }
    afterChange(true);
  }

  function addMap() {
    normalizeMaps();
    pushHistory();
    const id = nextMapId();
    const map = blankMapSnapshot(id, `Map ${state.doc.maps.length + 1}`);
    state.doc.maps.push(map);
    applyMapSnapshot(map);
    afterChange(true);
  }

  function duplicateMap() {
    normalizeMaps();
    pushHistory();
    const id = nextMapId();
    const map = activeMapSnapshot();
    map.id = id;
    map.name = `${state.doc.map.name || state.doc.map.id} Copy`;
    map.map.id = id;
    map.map.name = map.name;
    state.doc.maps.push(map);
    applyMapSnapshot(map);
    afterChange(true);
  }

  function deleteMap() {
    normalizeMaps();
    if (state.doc.maps.length <= 1) return;
    pushHistory();
    const activeId = state.doc.active_map_id;
    const index = Math.max(0, state.doc.maps.findIndex((map) => map.id === activeId));
    state.doc.maps = state.doc.maps.filter((map) => map.id !== activeId);
    applyMapSnapshot(state.doc.maps[Math.min(index, state.doc.maps.length - 1)]);
    afterChange(true);
  }

  function addStage() {
    pushHistory();
    const stage = createDefaultStage(state.doc.stages.length + 1);
    state.doc.stages.push(stage);
    state.activeStageId = stage.id;
    afterChange(true);
  }

  function duplicateStage() {
    const stage = activeStage();
    if (!stage) return;
    pushHistory();
    const copy = clone(stage);
    const index = state.doc.stages.length + 1;
    copy.id = `stage_${String(index).padStart(2, "0")}`;
    copy.name = `${stage.name || stage.id} copy`;
    state.doc.stages.push(normalizeStage(copy));
    state.activeStageId = copy.id;
    afterChange(true);
  }

  function deleteStage() {
    if (state.doc.stages.length <= 1) return;
    const stage = activeStage();
    if (!stage) return;
    pushHistory();
    state.doc.stages = state.doc.stages.filter((item) => item.id !== stage.id);
    state.activeStageId = state.doc.stages[0]?.id || null;
    afterChange(true);
  }

  function refreshPaintButtons() {
    document.querySelectorAll("[data-paint-target]").forEach((button) => {
      const input = elements[button.dataset.paintTarget];
      button.classList.toggle("active", input && input.value === button.dataset.paintValue);
    });
  }

  function terrainCode(tile) {
    if (tile.terrain === "indoor_floor") return "i";
    if (tile.terrain === "outdoor_ground" || tile.terrain === "garden") return "o";
    return "";
  }

  function drawTerrainLayer(context, tile, size) {
    const x = tile.x * size;
    const y = tile.y * size;
    context.fillStyle = colors.terrain[tile.terrain] || colors.terrain.void;
    context.fillRect(x, y, size, size);
    const code = terrainCode(tile);
    if (!code) return;
    context.fillStyle = "rgba(54, 45, 35, 0.58)";
    context.font = `800 ${Math.max(12, size * 0.24)}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(code, x + size / 2, y + size / 2);
  }

  function drawRoomLayer(context, tile, size) {
    const x = tile.x * size;
    const y = tile.y * size;
    if (tile.room_id) {
      const room = roomForId(tile.room_id);
      if (room) {
        const definition = roomDefinitionForId(room.id);
        const preset = ROOM_TYPE_PRESETS[room.type] || definition || ROOM_TYPE_PRESETS.living_room;
        context.fillStyle = `${room.color || definition.color || preset.color}99`;
        context.fillRect(x + 1, y + 1, size - 2, size - 2);
      }
    }
  }

  function drawStructureLayer(context, tile, size) {
    const x = tile.x * size;
    const y = tile.y * size;
    if (tile.structure !== "none") {
      context.fillStyle = colors.structure[tile.structure] || colors.structure.blocked;
      if (tile.structure === "wall" || tile.structure === "blocked") context.fillRect(x, y, size, size);
      else context.fillRect(x + size * 0.18, y + size * 0.18, size * 0.64, size * 0.64);
    }
  }

  function drawBuildLayer(context, tile, size) {
    const label = { allowed: "a", blocked: "b", reserved: "r" }[tile.build] || "";
    if (!label) return;
    const x = tile.x * size;
    const y = tile.y * size;
    context.fillStyle = tile.build === "allowed" ? "rgba(54, 112, 58, 0.74)" : tile.build === "reserved" ? "rgba(173, 123, 39, 0.78)" : "rgba(133, 58, 48, 0.74)";
    context.font = `800 ${Math.max(12, size * 0.26)}px sans-serif`;
    context.textAlign = "right";
    context.textBaseline = "bottom";
    context.fillText(label, x + size - 5, y + size - 4);
  }

  function drawTile(context, tile, size, layers) {
    if (layers.terrain) drawTerrainLayer(context, tile, size);
    if (layers.room) drawRoomLayer(context, tile, size);
    if (layers.structure) drawStructureLayer(context, tile, size);
    if (layers.build) drawBuildLayer(context, tile, size);
  }

  function pathDisplayAlpha(path, active) {
    if (!(state.mode === "stage" && (state.tool === "path" || state.tool === "path_area"))) return 1;
    if (!active) return 1;
    return path.id === active.id ? 1 : 0.28;
  }

  function drawPath(context, size) {
    const active = activePath();
    for (const path of activeStagePaths()) {
      context.save();
      context.globalAlpha = pathDisplayAlpha(path, active);
      context.fillStyle = colors.path;
      for (const cell of core.rasterizePath(path)) {
        context.fillRect(cell.x * size + 2, cell.y * size + 2, size - 4, size - 4);
      }
      context.strokeStyle = colors.pathLine;
      context.fillStyle = colors.pathLine;
      context.lineWidth = Math.max(2, size * 0.08);
      const points = path.points || [];
      for (let index = 0; index < points.length - 1; index += 1) {
        const a = points[index];
        const b = points[index + 1];
        const ax = a.x * size + size / 2;
        const ay = a.y * size + size / 2;
        const bx = b.x * size + size / 2;
        const by = b.y * size + size / 2;
        context.beginPath();
        context.moveTo(ax, ay);
        context.lineTo(bx, by);
        context.stroke();
        drawArrowHead(context, ax, ay, bx, by, size);
      }
      context.restore();
    }
    drawPathAreas(context, size);
  }

  function drawPathAreas(context, size) {
    const stage = activeStage();
    if (!stage) return;
    const active = activePath();
    context.save();
    context.fillStyle = colors.path;
    context.strokeStyle = "rgba(214, 104, 74, 0.64)";
    context.lineWidth = Math.max(2, size * 0.05);
    for (const path of stage.paths || []) {
      context.globalAlpha = pathDisplayAlpha(path, active);
      context.strokeStyle = path.id === active?.id ? "rgba(214, 104, 74, 0.86)" : "rgba(214, 104, 74, 0.42)";
      for (const area of path.areas || []) {
        const direction = nearestPathSegmentDirection(path, area);
        context.fillRect(area.x * size + 2, area.y * size + 2, area.width * size - 4, area.height * size - 4);
        context.strokeRect(area.x * size + 4, area.y * size + 4, area.width * size - 8, area.height * size - 8);
        drawPathAreaArrow(context, area, direction, size);
      }
    }
    context.restore();
  }

  function nearestPathSegmentDirection(path, area) {
    const points = path.points || [];
    if (points.length < 2) return "east";
    const target = { x: area.x + (area.width - 1) / 2, y: area.y + (area.height - 1) / 2 };
    let best = { distance: Infinity, direction: "east" };
    for (let index = 0; index < points.length - 1; index += 1) {
      const a = points[index];
      const b = points[index + 1];
      const distance = distanceToPathSegment(target, a, b);
      if (distance < best.distance) best = { distance, direction: pathSegmentDirection(a, b) };
    }
    return best.direction;
  }

  function pathSegmentDirection(a, b) {
    if (a.x === b.x) return b.y >= a.y ? "south" : "north";
    return b.x >= a.x ? "east" : "west";
  }

  function distanceToPathSegment(point, a, b) {
    if (a.x === b.x) {
      const minY = Math.min(a.y, b.y);
      const maxY = Math.max(a.y, b.y);
      const clampedY = clamp(point.y, minY, maxY);
      return Math.hypot(point.x - a.x, point.y - clampedY);
    }
    if (a.y === b.y) {
      const minX = Math.min(a.x, b.x);
      const maxX = Math.max(a.x, b.x);
      const clampedX = clamp(point.x, minX, maxX);
      return Math.hypot(point.x - clampedX, point.y - a.y);
    }
    return Math.min(Math.hypot(point.x - a.x, point.y - a.y), Math.hypot(point.x - b.x, point.y - b.y));
  }

  function drawPathAreaArrow(context, area, direction, size) {
    const vector = {
      north: { x: 0, y: -1 },
      east: { x: 1, y: 0 },
      south: { x: 0, y: 1 },
      west: { x: -1, y: 0 }
    }[direction] || { x: 1, y: 0 };
    const step = Math.max(1, Math.floor(Math.min(area.width, area.height) / 2));
    for (let y = area.y; y < area.y + area.height; y += step) {
      for (let x = area.x; x < area.x + area.width; x += step) {
        const centerX = x * size + size / 2;
        const centerY = y * size + size / 2;
        const length = size * 0.42;
        const ax = centerX - vector.x * length * 0.32;
        const ay = centerY - vector.y * length * 0.32;
        const bx = centerX + vector.x * length * 0.32;
        const by = centerY + vector.y * length * 0.32;
        context.beginPath();
        context.moveTo(ax, ay);
        context.lineTo(bx, by);
        context.stroke();
        drawArrowHead(context, ax, ay, bx, by, size * 0.72);
      }
    }
  }

  function drawArrowHead(context, ax, ay, bx, by, size) {
    const angle = Math.atan2(by - ay, bx - ax);
    const length = size * 0.28;
    context.beginPath();
    context.moveTo(bx, by);
    context.lineTo(bx - Math.cos(angle - 0.45) * length, by - Math.sin(angle - 0.45) * length);
    context.lineTo(bx - Math.cos(angle + 0.45) * length, by - Math.sin(angle + 0.45) * length);
    context.closePath();
    context.fill();
  }

  function drawableObjects() {
    return [...state.doc.objects].sort((a, b) => Number(Boolean(a.allow_overlap)) - Number(Boolean(b.allow_overlap)));
  }

  function drawObjects(context, size, layers) {
    for (const object of drawableObjects()) {
      if (object.category === "door" && !layers.doors) continue;
      if (object.category !== "door" && !layers.objects) continue;
      const rect = objectRect(object, size);
      if (object.category === "door") drawDoorObject(context, object, rect, size);
      else if (object.category === "sofa") drawSofaObject(context, object, rect, size);
      else if (object.category === "bed") drawBedObject(context, object, rect, size);
      else drawGenericObject(context, object, rect, size);
    }
  }

  function drawObjectControls(context, size) {
    const object = selectedObject();
    if (!object) return;
    const rect = objectRect(object, size);
    const controls = objectControlRects(object, size);
    context.save();
    context.strokeStyle = colors.selected;
    context.lineWidth = 4;
    context.setLineDash([10, 6]);
    context.strokeRect(rect.x - 4, rect.y - 4, rect.width + 8, rect.height + 8);
    context.setLineDash([]);
    drawControlButton(context, controls.rotate, "↻", "#2f6f9f");
    drawControlButton(context, controls.delete, "×", "#b9473d");
    context.restore();
  }

  function drawControlButton(context, rect, label, color) {
    context.fillStyle = color;
    context.strokeStyle = "#fffaf0";
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(rect.x, rect.y, rect.width, rect.height, 6);
    context.fill();
    context.stroke();
    context.fillStyle = "#ffffff";
    context.font = `800 ${Math.max(14, rect.height * 0.58)}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2);
  }

  function drawGenericObject(context, object, rect, size) {
    context.fillStyle = object.category === "plant" ? "#4f8748" : object.category === "table" ? "#8a6544" : "#7b5b3f";
    context.strokeStyle = "#3b3128";
    context.lineWidth = 2;
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    drawFacingArrow(context, object.facing || "south", rect, size);
  }

  function drawDoorObject(context, object, rect, size) {
    context.save();
    context.fillStyle = "rgba(255, 246, 220, 0.58)";
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    if (object.door_type === "sliding") drawSlidingDoorSymbol(context, object, rect, size);
    else drawHingedDoorSymbol(context, object, rect, size);
    context.restore();
  }

  function drawHingedDoorSymbol(context, object, rect, size) {
    const facing = object.facing || "north";
    const geometry = doorGeometry(rect, facing, object.door_hinge || "start");
    drawDoorOpenGuide(context, object, geometry, size);
    drawDoorClosedLine(context, geometry.closed, Math.max(5, size * 0.12), "#2f2924");
  }

  function drawSlidingDoorSymbol(context, object, rect, size) {
    const geometry = doorGeometry(rect, object.facing || "north", object.door_hinge || "start");
    const horizontal = Math.abs(geometry.closed.x2 - geometry.closed.x1) >= Math.abs(geometry.closed.y2 - geometry.closed.y1);
    const offset = Math.max(4, size * 0.1);
    const secondary = horizontal
      ? { x1: geometry.closed.x1, y1: geometry.closed.y1 + offset, x2: geometry.closed.x2, y2: geometry.closed.y2 + offset }
      : { x1: geometry.closed.x1 + offset, y1: geometry.closed.y1, x2: geometry.closed.x2 + offset, y2: geometry.closed.y2 };
    drawDoorClosedLine(context, secondary, Math.max(2, size * 0.05), "rgba(47, 41, 36, 0.5)");
    drawDoorOpenGuide(context, object, geometry, size);
    drawDoorClosedLine(context, geometry.closed, Math.max(5, size * 0.12), "#2f2924");
  }

  function doorGeometry(rect, facing, hingePosition) {
    const inset = Math.max(4, Math.min(rect.width, rect.height) * 0.12);
    const line = {
      north: { x1: rect.x + inset, y1: rect.y + inset, x2: rect.x + rect.width - inset, y2: rect.y + inset },
      south: { x1: rect.x + inset, y1: rect.y + rect.height - inset, x2: rect.x + rect.width - inset, y2: rect.y + rect.height - inset },
      east: { x1: rect.x + rect.width - inset, y1: rect.y + inset, x2: rect.x + rect.width - inset, y2: rect.y + rect.height - inset },
      west: { x1: rect.x + inset, y1: rect.y + inset, x2: rect.x + inset, y2: rect.y + rect.height - inset }
    }[facing] || { x1: rect.x + inset, y1: rect.y + inset, x2: rect.x + rect.width - inset, y2: rect.y + inset };
    const hinge = hingePosition === "end" ? { x: line.x2, y: line.y2 } : { x: line.x1, y: line.y1 };
    return { closed: line, hinge };
  }

  function drawDoorClosedLine(context, line, width, color) {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(line.x1, line.y1);
    context.lineTo(line.x2, line.y2);
    context.stroke();
  }

  function drawDoorOpenGuide(context, object, geometry, size) {
    const closedAngle = Math.atan2(geometry.closed.y2 - geometry.closed.y1, geometry.closed.x2 - geometry.closed.x1);
    const swing = object.door_swing || "in";
    const direction = swing === "out" || swing === "right" ? 1 : -1;
    const openAngle = closedAngle + direction * (Math.PI / 2);
    const length = Math.hypot(geometry.closed.x2 - geometry.closed.x1, geometry.closed.y2 - geometry.closed.y1);
    const end = {
      x: geometry.hinge.x + Math.cos(openAngle) * length,
      y: geometry.hinge.y + Math.sin(openAngle) * length
    };
    context.strokeStyle = "rgba(47, 41, 36, 0.38)";
    context.lineWidth = Math.max(2, size * 0.04);
    context.lineCap = "round";
    context.setLineDash([6, 5]);
    context.beginPath();
    context.moveTo(geometry.hinge.x, geometry.hinge.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.setLineDash([]);
    context.strokeStyle = "rgba(47, 41, 36, 0.22)";
    context.beginPath();
    context.arc(geometry.hinge.x, geometry.hinge.y, Math.min(length * 0.55, size * 0.7), closedAngle, openAngle, direction < 0);
    context.stroke();
  }

  function drawSofaObject(context, object, rect, size) {
    const facing = object.facing || "south";
    context.fillStyle = "#416f9f";
    context.strokeStyle = "#20364f";
    context.lineWidth = 2;
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    context.fillStyle = "#274967";
    drawSideBand(context, oppositeDirection(facing), rect, Math.max(6, size * 0.18));
    drawFacingArrow(context, facing, rect, size);
  }

  function drawBedObject(context, object, rect, size) {
    const facing = object.facing || "north";
    context.fillStyle = "#e2d5bd";
    context.strokeStyle = "#5d5144";
    context.lineWidth = 2;
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    context.fillStyle = "#8a6a4e";
    drawSideBand(context, facing, rect, Math.max(7, size * 0.2));
    drawFacingArrow(context, facing, rect, size);
  }

  function drawSideBand(context, side, rect, thickness) {
    if (side === "north") context.fillRect(rect.x, rect.y, rect.width, thickness);
    if (side === "south") context.fillRect(rect.x, rect.y + rect.height - thickness, rect.width, thickness);
    if (side === "east") context.fillRect(rect.x + rect.width - thickness, rect.y, thickness, rect.height);
    if (side === "west") context.fillRect(rect.x, rect.y, thickness, rect.height);
  }

  function oppositeDirection(direction) {
    return { north: "south", south: "north", east: "west", west: "east" }[direction] || "north";
  }

  function drawFacingArrow(context, facing, rect, size) {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const length = Math.min(rect.width, rect.height, size) * 0.34;
    const vector = {
      north: { x: 0, y: -1 },
      east: { x: 1, y: 0 },
      south: { x: 0, y: 1 },
      west: { x: -1, y: 0 }
    }[facing] || { x: 0, y: 1 };
    context.save();
    context.strokeStyle = "#fffaf0";
    context.fillStyle = "#fffaf0";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX + vector.x * length, centerY + vector.y * length);
    context.stroke();
    drawArrowHead(context, centerX, centerY, centerX + vector.x * length, centerY + vector.y * length, size * 0.6);
    context.restore();
  }

  function drawMarkers(context, size) {
    for (const marker of activeStageMarkers()) {
      const x = marker.x * size;
      const y = marker.y * size;
      const width = (marker.width || 1) * size;
      const height = (marker.height || 1) * size;
      if (marker.type === "build_slot") {
        context.strokeStyle = colors.build;
        context.lineWidth = 3;
        context.setLineDash([8, 6]);
        context.strokeRect(x + 4, y + 4, width - 8, height - 8);
        context.setLineDash([]);
      } else {
        context.fillStyle = marker.type === "spawn" ? colors.spawn : marker.type === "base" ? colors.base : "#7d5fb0";
        context.fillRect(x + 6, y + 6, width - 12, height - 12);
      }
      context.fillStyle = "#ffffff";
      context.font = `700 ${Math.max(12, size * 0.3)}px sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(markerNumberLabel(marker), x + width / 2, y + height / 2);
    }
  }

  function drawStages(context, size) {
    const active = activeStage();
    for (const stage of state.doc.stages) {
      normalizeStage(stage);
      context.lineWidth = active && stage.id === active.id ? 5 : 2;
      context.strokeStyle = active && stage.id === active.id ? colors.stage : "rgba(122, 79, 163, 0.42)";
      context.strokeRect(stage.x * size + 2, stage.y * size + 2, stage.width * size - 4, stage.height * size - 4);
    }
  }

  function drawGridLine(context, index, size, vertical) {
    const major = index % GRID_MAJOR_EVERY === 0;
    context.strokeStyle = major ? "rgba(40, 34, 29, 0.48)" : "rgba(54, 45, 35, 0.2)";
    context.lineWidth = major ? 2 : 1;
    const position = index * size + 0.5;
    context.beginPath();
    if (vertical) {
      context.moveTo(position, 0);
      context.lineTo(position, state.doc.map.height * size);
    } else {
      context.moveTo(0, position);
      context.lineTo(state.doc.map.width * size, position);
    }
    context.stroke();
  }

  function drawGrid(context, size) {
    for (let x = 0; x <= state.doc.map.width; x += 1) {
      drawGridLine(context, x, size, true);
    }
    for (let y = 0; y <= state.doc.map.height; y += 1) {
      drawGridLine(context, y, size, false);
    }
  }

  function drawSelection(context, size) {
    if (!state.selected || state.selected.type !== "tile") return;
    context.strokeStyle = colors.selected;
    context.lineWidth = 4;
    context.strokeRect(state.selected.x * size + 2, state.selected.y * size + 2, size - 4, size - 4);
  }

  function rectFromPoints(a, b) {
    return {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      width: Math.abs(a.x - b.x) + 1,
      height: Math.abs(a.y - b.y) + 1
    };
  }

  function stagePreviewRect() {
    if (!state.previewRect || state.tool !== "stage") return state.previewRect;
    return applyStageRatio(state.previewRect);
  }

  function drawDragPreview(context, size) {
    if (!state.previewRect) return;
    const rect = stagePreviewRect();
    context.save();
    context.fillStyle = state.tool === "stage" ? "rgba(122, 79, 163, 0.12)" : state.tool === "path_area" ? "rgba(242, 222, 194, 0.44)" : "rgba(31, 111, 159, 0.14)";
    context.strokeStyle = state.tool === "stage" ? "rgba(122, 79, 163, 0.9)" : state.tool === "path_area" ? "rgba(214, 104, 74, 0.9)" : "rgba(31, 111, 159, 0.9)";
    context.lineWidth = 4;
    if (state.tool !== "path_area") context.setLineDash([10, 6]);
    context.fillRect(rect.x * size, rect.y * size, rect.width * size, rect.height * size);
    context.strokeRect(rect.x * size + 2, rect.y * size + 2, rect.width * size - 4, rect.height * size - 4);
    context.restore();
  }

  function drawDocument(context, size, options) {
    const layers = Object.assign({}, state.layers, options?.layers || {});
    if (options?.grid === false) layers.grid = false;
    context.clearRect(0, 0, state.doc.map.width * size, state.doc.map.height * size);
    context.fillStyle = colors.terrain.void;
    context.fillRect(0, 0, state.doc.map.width * size, state.doc.map.height * size);
    for (const tile of state.doc.tiles) drawTile(context, tile, size, layers);
    drawObjects(context, size, layers);
    if (state.mode === "stage") drawStages(context, size);
    if (layers.grid) drawGrid(context, size);
    if (state.mode === "stage" && layers.path) drawPath(context, size);
    if (state.mode === "stage" && layers.markers) drawMarkers(context, size);
    drawSelection(context, size);
    if (layers.objects || layers.doors) drawObjectControls(context, size);
    drawDragPreview(context, size);
  }

  function render() {
    canvas.style.transform = `scale(${state.zoom})`;
    canvas.style.marginRight = `${canvas.width * (state.zoom - 1)}px`;
    canvas.style.marginBottom = `${canvas.height * (state.zoom - 1)}px`;
    drawDocument(ctx, tileSize(), { layers: state.layers });
  }

  function stageExportData() {
    const stage = activeStage();
    if (!stage) return null;
    try {
      return core.exportStageJson(state.doc, stage.id);
    } catch (error) {
      return null;
    }
  }

  function stageStat(label, value) {
    return `<div><strong>${value}</strong><span>${label}</span></div>`;
  }

  function refreshStagePreview(validation) {
    const stage = activeStage();
    const data = stageExportData();
    if (!stage || !data) {
      elements.stagePreviewSummary.textContent = "No stage selected";
      elements.stagePreviewStats.innerHTML = "";
      return;
    }
    const pathCellCount = data.paths.reduce((sum, path) => sum + (path.footprint || []).length, 0);
    const pathAreaCount = stage.paths.reduce((sum, path) => sum + (path.areas || []).length, 0);
    const markerCounts = data.markers.reduce((counts, marker) => {
      counts[marker.type] = (counts[marker.type] || 0) + 1;
      return counts;
    }, {});
    elements.stagePreviewSummary.textContent = `${data.name || data.stage_id} | ${data.local.width} x ${data.local.height} | top ${data.export.top_direction}`;
    elements.stagePreviewStats.innerHTML = [
      stageStat("Tiles", data.tiles.length),
      stageStat("Rooms", data.rooms.length),
      stageStat("Objects", data.objects.length),
      stageStat("Paths", data.paths.length),
      stageStat("Path cells", pathCellCount),
      stageStat("Path areas", pathAreaCount),
      stageStat("Spawn/Base", `${markerCounts.spawn || 0}/${markerCounts.base || 0}`),
      stageStat("Build slots", markerCounts.build_slot || 0),
      stageStat("Issues", `${validation.errors.length}/${validation.warnings.length}`)
    ].join("");
  }

  function stageScopedValidationDocument(stage) {
    const bounds = { x: stage.x, y: stage.y, width: stage.width, height: stage.height };
    const objects = (state.doc.objects || []).filter((object) => core.objectFootprint(object).some((cell) => cell.x >= bounds.x && cell.y >= bounds.y && cell.x < bounds.x + bounds.width && cell.y < bounds.y + bounds.height));
    return Object.assign({}, state.doc, {
      objects,
      paths: [],
      markers: [],
      stages: [stage]
    });
  }

  function validationForCurrentScope(validation) {
    const stage = activeStage();
    if (state.mode !== "stage" || !stage) return validation;
    return core.validateDocument(stageScopedValidationDocument(stage));
  }

  function refreshInspector() {
    ensureDefinitions();
    normalizeStages();
    updateModeUi();
    elements.toolStatus.textContent = `tool ${state.tool}`;
    elements.zoomStatus.textContent = `${Math.round(state.zoom * 100)}%`;
    syncLayerInputs();
    renderMapList();
    renderRoomList();
    renderObjectRoomList();
    renderObjectPalette();
    syncStageFields();
    renderPathSelect();
    renderStageList();
    updateInspectorPanels();
    updateObjectFields();
    syncSelectedObjectFields();
    if (state.selected?.type === "tile") {
      const tile = core.getTile(state.doc, state.selected.x, state.selected.y);
      elements.selectionSummary.textContent = `Tile ${state.selected.x}, ${state.selected.y} | ${tile.terrain} | ${tile.structure} | ${tile.room_id || "no room"}`;
      elements.structure.value = tile.structure;
      elements.build.value = tile.build;
      refreshPaintButtons();
      if (tile.room_id) {
        const room = roomForId(tile.room_id);
        if (room) {
          elements.roomType.value = room.id;
          elements.objectRoomType.value = room.id;
          renderObjectPalette();
          elements.roomId.value = room.id;
          elements.roomName.value = room.name;
          elements.roomColor.value = room.color || (roomDefinitionForId(room.id) || ROOM_TYPE_PRESETS.living_room).color;
        }
      }
    } else if (state.selected?.type === "object") {
      const object = selectedObject();
      elements.selectionSummary.textContent = object ? `${object.name || object.id} | ${object.x}, ${object.y} | ${object.width} x ${object.height}` : "No object selected";
    } else if (state.mode === "stage" && state.selected?.type === "marker") {
      const marker = activeStageMarkers().find((item) => item.id === state.selected.id);
      elements.selectionSummary.textContent = marker ? `${markerLabel(marker)} | ${marker.type} | ${marker.x}, ${marker.y}` : "No marker selected";
    } else if (state.mode === "stage" && state.selected?.type === "path") {
      const path = activeStagePaths().find((item) => item.id === state.selected.id);
      elements.selectionSummary.textContent = path ? `${path.name || path.id} | ${path.points.length} points | width ${path.width_tiles || 1}` : "No path selected";
    } else {
      const stage = activeStage();
      elements.selectionSummary.textContent = stage ? `Stage ${stage.name}: ${stage.width} x ${stage.height} | top ${stage.top_direction || "north"}` : "No tile selected";
    }
    const validation = core.validateDocument(state.doc);
    const scopedValidation = validationForCurrentScope(validation);
    elements.validationList.innerHTML = "";
    for (const message of scopedValidation.errors) {
      const item = document.createElement("li");
      item.textContent = message;
      elements.validationList.appendChild(item);
    }
    for (const message of scopedValidation.warnings) {
      const item = document.createElement("li");
      item.textContent = message;
      item.className = "warning";
      elements.validationList.appendChild(item);
    }
    elements.validationStatus.textContent = state.mode === "stage" ? `${scopedValidation.errors.length} stage errors (${validation.errors.length} all)` : `${validation.errors.length} errors`;
    refreshStagePreview(scopedValidation);
    try {
      const stage = activeStage();
      elements.prompt.value = stage ? core.buildPrompt(state.doc, stage.id) : "";
    } catch (error) {
      elements.prompt.value = "";
    }
  }

  function syncLayerInputs() {
    document.querySelectorAll("[data-layer]").forEach((input) => {
      input.checked = state.layers[input.dataset.layer] !== false;
    });
  }

  function downloadText(filename, content, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const doc = JSON.parse(String(reader.result));
        const validation = core.validateDocument(doc);
        if (validation.errors.some((message) => message.includes("schema") || message.includes("dimensions") || message.includes("tiles"))) {
          alert(`Import rejected:\n${validation.errors.join("\n")}`);
          return;
        }
        pushHistory();
        state.doc = doc;
        afterChange(true);
      } catch (error) {
        alert(`Import rejected:\n${error.message}`);
      }
    };
    reader.readAsText(file);
  }

  function selectedMapsForExport() {
    normalizeMaps();
    const selected = state.doc.maps.filter((map) => state.selectedMapIds.has(map.id));
    if (selected.length) return selected;
    return state.doc.maps.filter((map) => map.id === state.doc.active_map_id);
  }

  function exportSelectedMaps() {
    const maps = selectedMapsForExport().map((map) => clone(map));
    const bundle = {
      schema_version: 1,
      export_type: "pawtectors_map_bundle",
      maps
    };
    downloadText("pawtectors-maps.json", JSON.stringify(bundle, null, 2), "application/json");
  }

  function exportMasterDocument() {
    normalizeMaps();
    downloadText("pawtectors-house-master.json", JSON.stringify(state.doc, null, 2), "application/json");
  }

  function readJsonFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(JSON.parse(String(reader.result)));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error || new Error("Cannot read file"));
      reader.readAsText(file);
    });
  }

  function extractImportMaps(payload) {
    if (payload?.export_type === "pawtectors_map_bundle" && Array.isArray(payload.maps)) return payload.maps;
    if (Array.isArray(payload?.maps)) return payload.maps;
    if (payload?.map && Array.isArray(payload.tiles)) return [payload];
    return [];
  }

  function normalizeImportedMapSnapshot(raw) {
    const source = clone(raw);
    const mapData = Object.assign({}, core.createDocument().map, source.map || {});
    const id = source.id || mapData.id || "map";
    const name = source.name || mapData.name || id;
    return {
      id,
      name,
      map: Object.assign({}, mapData, { id, name }),
      tiles: Array.isArray(source.tiles) ? source.tiles : [],
      rooms: Array.isArray(source.rooms) ? source.rooms : [],
      room_definitions: Array.isArray(source.room_definitions) ? source.room_definitions : clone(DEFAULT_ROOM_DEFINITIONS),
      objects: Array.isArray(source.objects) ? source.objects : [],
      object_definitions: Array.isArray(source.object_definitions) ? source.object_definitions : clone(DEFAULT_OBJECT_DEFINITIONS),
      paths: Array.isArray(source.paths) ? source.paths : [],
      markers: Array.isArray(source.markers) ? source.markers : [],
      stages: Array.isArray(source.stages) ? source.stages : []
    };
  }

  function mergeImportedMaps(importedMaps) {
    const snapshots = importedMaps.map(normalizeImportedMapSnapshot).filter((map) => map.tiles.length);
    if (!snapshots.length) throw new Error("No valid maps found");
    normalizeMaps();
    pushHistory();
    const usedIds = new Set(state.doc.maps.map((map) => map.id));
    const usedNames = new Set(state.doc.maps.map((map) => map.name || map.id));
    const added = [];
    for (const snapshot of snapshots) {
      const id = uniqueMapId(snapshot.id, usedIds);
      const name = uniqueMapName(snapshot.name, usedNames);
      usedIds.add(id);
      usedNames.add(name);
      snapshot.id = id;
      snapshot.name = name;
      snapshot.map.id = id;
      snapshot.map.name = name;
      state.doc.maps.push(snapshot);
      state.selectedMapIds.add(id);
      added.push(snapshot);
    }
    applyMapSnapshot(added[0]);
    afterChange(true);
  }

  async function importMapFiles(files) {
    try {
      const payloads = await Promise.all(Array.from(files).map(readJsonFile));
      const maps = payloads.flatMap(extractImportMaps);
      mergeImportedMaps(maps);
    } catch (error) {
      alert(`Import maps rejected:\n${error.message}`);
    }
  }

  function exportActiveStageJson() {
    const stage = activeStage();
    if (!stage) return;
    downloadText(`pawtectors-${stage.id}.json`, JSON.stringify(core.exportStageJson(state.doc, stage.id), null, 2), "application/json");
  }

  function exportActiveStagePrompt() {
    const stage = activeStage();
    if (!stage) return;
    const prompt = core.buildPrompt(state.doc, stage.id);
    elements.prompt.value = prompt;
    downloadText(`pawtectors-${stage.id}-prompt.txt`, prompt, "text/plain");
  }

  function bindEvents() {
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    document.querySelectorAll(".tool").forEach((button) => {
      button.addEventListener("click", () => setTool(button.dataset.tool));
    });
    elements.mapMode.addEventListener("click", () => setMode("map"));
    elements.stageMode.addEventListener("click", () => setMode("stage"));
    document.querySelectorAll("[data-paint-target]").forEach((button) => {
      button.addEventListener("click", () => setPaintValue(button.dataset.paintTarget, button.dataset.paintValue));
    });
    elements.roomType.addEventListener("change", () => {
      elements.objectRoomType.value = elements.roomType.value;
      renderObjectPalette();
      refreshInspector();
    });
    elements.objectRoomType.addEventListener("change", () => {
      renderObjectPalette();
      refreshInspector();
    });
    elements.roomName.addEventListener("change", updateRoomDefinitionName);
    elements.addRoom.addEventListener("click", addRoomDefinition);
    elements.deleteRoom.addEventListener("click", deleteRoomDefinition);
    elements.objectName.addEventListener("change", updateObjectDefinitionName);
    elements.addObjectDefinition.addEventListener("click", addObjectDefinition);
    elements.deleteObjectDefinition.addEventListener("click", deleteObjectDefinition);
    document.querySelectorAll("[data-layer]").forEach((input) => {
      input.addEventListener("change", () => {
        state.layers[input.dataset.layer] = input.checked;
        if (input.dataset.layer === "grid") state.showGrid = input.checked;
        render();
      });
    });
    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.addEventListener("click", () => applyTheme(button.dataset.themeChoice));
    });
    window.addEventListener("keydown", (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return;
      const tool = TOOL_SHORTCUTS[event.key.toLowerCase()];
      if (!tool) return;
      event.preventDefault();
      setTool(tool);
    });
    document.getElementById("newDocBtn").addEventListener("click", () => {
      pushHistory();
      state.doc = core.createDocument();
      state.activeStageId = null;
      normalizeMaps();
      afterChange(true);
    });
    document.getElementById("sampleBtn").addEventListener("click", () => {
      pushHistory();
      state.doc = core.makeSampleDocument();
      state.activeStageId = state.doc.stages[0]?.id || null;
      normalizeMaps();
      afterChange(true);
    });
    document.getElementById("undoBtn").addEventListener("click", undo);
    document.getElementById("redoBtn").addEventListener("click", redo);
    document.getElementById("importBtn").addEventListener("click", () => elements.fileInput.click());
    elements.fileInput.addEventListener("change", () => {
      if (elements.fileInput.files[0]) importJson(elements.fileInput.files[0]);
      elements.fileInput.value = "";
    });
    elements.importMaps.addEventListener("click", () => elements.mapBundleFile.click());
    elements.mapBundleFile.addEventListener("change", () => {
      if (elements.mapBundleFile.files.length) importMapFiles(elements.mapBundleFile.files);
      elements.mapBundleFile.value = "";
    });
    document.getElementById("exportMasterBtn").addEventListener("click", exportMasterDocument);
    elements.exportMaps.addEventListener("click", exportSelectedMaps);
    document.getElementById("exportStageBtn").addEventListener("click", exportActiveStageJson);
    document.getElementById("exportPromptBtn").addEventListener("click", exportActiveStagePrompt);
    document.getElementById("exportPngBtn").addEventListener("click", exportStagePng);
    document.getElementById("exportStageJsonBtn").addEventListener("click", exportActiveStageJson);
    document.getElementById("exportStagePromptBtn").addEventListener("click", exportActiveStagePrompt);
    document.getElementById("exportStageGameplayPngBtn").addEventListener("click", () => exportStagePng("gameplay"));
    document.getElementById("exportStageArtPngBtn").addEventListener("click", () => exportStagePng("art"));
    document.getElementById("exportStageFullPngBtn").addEventListener("click", () => exportStagePng("full"));
    elements.mapName.addEventListener("change", updateMapName);
    elements.addMap.addEventListener("click", addMap);
    elements.duplicateMap.addEventListener("click", duplicateMap);
    elements.deleteMap.addEventListener("click", deleteMap);
    elements.addStage.addEventListener("click", addStage);
    elements.duplicateStage.addEventListener("click", duplicateStage);
    elements.deleteStage.addEventListener("click", deleteStage);
    elements.pathSelect.addEventListener("change", () => setActivePathId(elements.pathSelect.value));
    elements.pathSpawn.addEventListener("change", updatePathEndpointsFromFields);
    elements.pathBase.addEventListener("change", updatePathEndpointsFromFields);
    elements.addPath.addEventListener("click", addPath);
    elements.deletePath.addEventListener("click", deletePath);
    elements.pathWidth.addEventListener("change", updatePathWidthFromField);
    document.querySelectorAll("[data-path-width]").forEach((button) => {
      button.addEventListener("click", () => {
        elements.pathWidth.value = button.dataset.pathWidth;
        updatePathWidthFromField();
      });
    });
    document.getElementById("zoomOutBtn").addEventListener("click", () => {
      state.zoom = clamp(state.zoom - 0.1, 0.2, 1.5);
      afterChange(false);
    });
    document.getElementById("zoomInBtn").addEventListener("click", () => {
      state.zoom = clamp(state.zoom + 0.1, 0.2, 1.5);
      afterChange(false);
    });
    document.getElementById("gridBtn").addEventListener("click", () => {
      state.layers.grid = !state.layers.grid;
      state.showGrid = state.layers.grid;
      afterChange(false);
    });
    [
      elements.objectWidth, elements.objectHeight, elements.objectFacing, elements.objectRotation,
      elements.objectBlocking, elements.doorType, elements.doorSwing, elements.doorOpenState, elements.doorHinge,
      elements.markerType
    ].forEach((input) => input.addEventListener("change", refreshInspector));
    [
      elements.stageId, elements.stageName, elements.stageWidth, elements.stageHeight,
      elements.stageRatio, elements.stageCustomRatio, elements.stageTopDirection
    ].forEach((input) => input.addEventListener("change", updateStageFromFields));
    [
      elements.selectedObjectWidth, elements.selectedObjectHeight, elements.selectedObjectFacing,
      elements.selectedObjectBlocking, elements.selectedObjectOverlap, elements.selectedDoorType, elements.selectedDoorSwing, elements.selectedDoorOpenState, elements.selectedDoorHinge
    ].forEach((input) => {
      input.addEventListener("change", updateSelectedObjectFromFields);
    });
  }

  function stagePngLayers(kind) {
    const allOff = {
      room: false,
      terrain: false,
      structure: false,
      build: false,
      objects: false,
      doors: false,
      path: false,
      markers: false,
      grid: false
    };
    if (kind === "gameplay") {
      return Object.assign({}, allOff, { path: true, markers: true, grid: true });
    }
    if (kind === "art") {
      return Object.assign({}, allOff, {
        room: true,
        terrain: true,
        structure: true,
        objects: true,
        doors: true,
        path: false,
        markers: false,
        grid: true
      });
    }
    return {
      room: true,
      terrain: true,
      structure: true,
      build: true,
      objects: true,
      doors: true,
      path: true,
      markers: true,
      grid: true
    };
  }

  function exportStagePng(kind = "full") {
    const stage = activeStage();
    if (!stage) return;
    const size = stage.export_tile_size || 48;
    const exported = core.exportStageJson(state.doc, stage.id);
    const offscreen = document.createElement("canvas");
    offscreen.width = exported.local.width * size;
    offscreen.height = exported.local.height * size;
    const off = offscreen.getContext("2d");
    off.fillStyle = stage.padding_color || "#efe5d2";
    off.fillRect(0, 0, offscreen.width, offscreen.height);
    off.save();
    if (stage.top_direction === "east") {
      off.translate(0, offscreen.height);
      off.rotate(-Math.PI / 2);
    } else if (stage.top_direction === "south") {
      off.translate(offscreen.width, offscreen.height);
      off.rotate(Math.PI);
    } else if (stage.top_direction === "west") {
      off.translate(offscreen.width, 0);
      off.rotate(Math.PI / 2);
    }
    off.translate(-stage.x * size, -stage.y * size);
    drawDocument(off, size, { layers: stagePngLayers(kind) });
    off.restore();
    const link = document.createElement("a");
    link.href = offscreen.toDataURL("image/png");
    link.download = `pawtectors-${stage.id}-${kind}.png`;
    link.click();
  }

  loadTheme();
  bindEvents();
  renderObjectPalette();
  normalizeMaps();
  saveDocument();
  refreshInspector();
  render();
})();
