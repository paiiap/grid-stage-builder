const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const coreSource = fs.readFileSync(path.join(root, "core.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

function functionBody(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `missing function ${name}`);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  throw new Error(`unterminated function ${name}`);
}

test("program copy is English only", () => {
  assert.doesNotMatch(html, /[ก-๙]/);
  assert.doesNotMatch(app, /[ก-๙]/);
  assert.doesNotMatch(coreSource, /[ก-๙]/);
});

test("toolbox uses English labels with keyboard shortcut hints", () => {
  assert.match(html, /data-tool="select"[\s\S]*<kbd>V<\/kbd>[\s\S]*Select/);
  assert.match(html, /data-tool="tile"[\s\S]*<kbd>T<\/kbd>[\s\S]*Paint/);
  assert.match(html, /data-tool="room"[\s\S]*<kbd>R<\/kbd>[\s\S]*Rooms/);
  assert.match(html, /data-tool="path"[\s\S]*<kbd>P<\/kbd>[\s\S]*Path/);
});

test("app uses neutral Grid Stage Builder branding", () => {
  assert.match(html, /<title>Grid Stage Builder<\/title>/);
  assert.match(html, /<strong>Grid Stage Builder<\/strong>/);
  assert.match(html, /<span>Map &amp; Stage Editor<\/span>/);
});

test("project menu uses save load wording before sample controls", () => {
  assert.match(html, /id="newDocBtn"[\s\S]*New Project[\s\S]*id="exportMasterBtn"[\s\S]*Save Project[\s\S]*id="importBtn"[\s\S]*Load Project[\s\S]*id="sampleBtn"[\s\S]*Load Sample/);
  assert.match(html, /<button id="exportMasterBtn" title="Save project JSON" type="button">Save Project<\/button>/);
  assert.doesNotMatch(html, /Export master JSON/);
  assert.doesNotMatch(html, />MJ</);
  assert.doesNotMatch(html, />In</);
});

test("view and theme controls sit above show hide controls", () => {
  assert.match(html, /class="rail-view-controls"[\s\S]*id="zoomOutBtn"[\s\S]*id="zoomInBtn"[\s\S]*id="gridBtn"/);
  assert.match(html, /class="rail-theme-controls"[\s\S]*data-theme-choice="classic"[\s\S]*data-theme-choice="dark"[\s\S]*data-theme-choice="sweet"/);
  assert(html.indexOf('class="rail-view-controls"') < html.indexOf('class="rail-theme-controls"'));
  assert(html.indexOf('class="rail-theme-controls"') < html.indexOf("<h2>SHOW/HIDE</h2>"));
  const toolbarBody = html.match(/<div class="toolbar"[\s\S]*?<\/div>/)?.[0] || "";
  assert.doesNotMatch(toolbarBody, /id="zoomOutBtn"/);
  assert.doesNotMatch(toolbarBody, /id="zoomInBtn"/);
  assert.doesNotMatch(toolbarBody, /id="gridBtn"/);
  assert.match(css, /\.rail-view-controls\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.rail-theme-controls\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
});

test("app applies and persists selectable themes", () => {
  assert.match(css, /:root\[data-theme="dark"\]/);
  assert.match(css, /:root\[data-theme="sweet"\]/);
  assert.match(app, /THEME_STORAGE_KEY/);
  assert.match(app, /function applyTheme/);
  assert.match(app, /localStorage\.getItem\(THEME_STORAGE_KEY\)/);
  assert.match(app, /localStorage\.setItem\(THEME_STORAGE_KEY,\s*theme\)/);
  assert.match(app, /document\.documentElement\.dataset\.theme = theme/);
  assert(app.includes('querySelectorAll("[data-theme-choice]")'));
});

test("paint panel exposes English named buttons instead of visible selects", () => {
  assert.match(html, /data-paint-target="structure"[\s\S]*Wall/);
  assert.match(html, /data-paint-target="build"[\s\S]*Allowed/);
  assert.match(html, /class="paint-value"[^>]+id="structureInput"/);
  assert.match(html, /class="paint-value"[^>]+id="buildInput"/);
  assert.doesNotMatch(html, /data-paint-target="terrain"/);
});

test("app maps keyboard shortcuts to tools and ignores form typing", () => {
  assert.match(app, /TOOL_SHORTCUTS/);
  assert.match(app, /v:\s*"select"/);
  assert.match(app, /t:\s*"tile"/);
  assert.match(app, /isTypingTarget/);
  assert.match(app, /keydown/);
});

test("grid renderer emphasizes every five tiles", () => {
  assert.match(app, /GRID_MAJOR_EVERY\s*=\s*5/);
  assert.match(app, /drawGridLine/);
  assert.match(app, /index % GRID_MAJOR_EVERY === 0/);
  assert.match(app, /major \? 2 : 1/);
});

test("layer panel exposes independent show hide toggles", () => {
  assert.match(html, /class="rail-layers"/);
  assert(html.indexOf("class=\"toolrail\"") < html.indexOf("class=\"rail-layers\""));
  assert(html.indexOf("class=\"rail-layers\"") < html.indexOf("</nav>"));
  assert.match(html, /id="layerRoomInput"[\s\S]*Room Color/);
  assert.match(html, /id="layerTerrainInput"[\s\S]*Terrain i\/o/);
  assert.match(html, /id="layerStructureInput"[\s\S]*Structure/);
  assert.match(html, /id="layerBuildInput"[\s\S]*Build a\/b\/r/);
  assert.match(html, /id="layerObjectsInput"[\s\S]*Objects/);
  assert.match(html, /id="layerDoorsInput"[\s\S]*Doors/);
  assert.match(html, /id="layerPathInput"[\s\S]*Path/);
  assert.match(html, /id="layerMarkersInput"[\s\S]*Markers/);
  assert.match(html, /id="layerGridInput"[\s\S]*Grid/);
});

test("left rail is wide enough for full tool names and keeps layers at the bottom", () => {
  assert.match(css, /grid-template-columns:\s*140px minmax\(320px,\s*1fr\) 340px/);
  assert.match(css, /\.toolrail\s*\{[\s\S]*align-items:\s*stretch/);
  assert.match(css, /\.tool\s*\{[\s\S]*width:\s*124px/);
  assert.match(css, /\.rail-layers\s*\{[\s\S]*margin-top:\s*auto/);
});

test("renderer gates map layers independently", () => {
  assert.match(app, /layers:\s*\{/);
  assert.match(app, /drawTerrainLayer/);
  assert.match(app, /drawRoomLayer/);
  assert.match(app, /drawStructureLayer/);
  assert.match(app, /drawBuildLayer/);
  assert.match(app, /drawObjects\(context,\s*size,\s*layers\)/);
  assert.match(app, /object\.category === "door" && !layers\.doors/);
  assert.match(app, /if \(state\.mode === "stage" && layers\.path\) drawPath/);
  assert.match(app, /if \(state\.mode === "stage" && layers\.markers\) drawMarkers/);
  assert.match(app, /if \(state\.mode === "stage"\) drawStages/);
  assert.match(app, /if \(layers\.grid\) drawGrid/);
});

test("map manager is shown below selection and manages multiple maps", () => {
  const body = functionBody(app, "updateInspectorPanels");
  assert.match(html, /id="mapModeBtn"[\s\S]*>Maps<\/button>/);
  assert(html.indexOf('data-panel="status"') < html.indexOf('data-panel="map-manager"'));
  assert.match(html, /data-panel="map-manager"[\s\S]*id="mapList"/);
  assert.match(html, /id="mapNameInput"/);
  assert.match(html, /id="addMapBtn"[\s\S]*New Map/);
  assert.match(html, /id="duplicateMapBtn"[\s\S]*Duplicate/);
  assert.match(html, /id="deleteMapBtn"[\s\S]*Delete/);
  assert.match(app, /mapList:\s*document\.getElementById\("mapList"\)/);
  assert.match(app, /function normalizeMaps/);
  assert.match(app, /function setActiveMapId/);
  assert.match(app, /function addMap/);
  assert.match(app, /function duplicateMap/);
  assert.match(app, /function deleteMap/);
  assert.match(body, /state\.mode === "map"[\s\S]*visible\.add\("map-manager"\)/);
  assert.doesNotMatch(body, /new Set\(\["status",\s*"map-manager"/);
});

test("map manager imports and exports selected map bundles", () => {
  assert.match(html, /id="exportMapsBtn"[\s\S]*Export Selected/);
  assert.match(html, /id="importMapsBtn"[\s\S]*Import maps/);
  assert.match(html, /id="mapBundleInput"[\s\S]*multiple/);
  assert.match(app, /selectedMapIds:\s*new Set\(\)/);
  assert.match(app, /data-map-select-id/);
  assert.match(app, /function exportSelectedMaps/);
  assert.match(app, /export_type:\s*"pawtectors_map_bundle"/);
  assert.match(app, /function importMapFiles/);
  assert.match(app, /function mergeImportedMaps/);
  assert.match(app, /function uniqueMapId/);
  assert.match(app, /function uniqueMapName/);
  assert.match(app, /mapBundleFile:\s*document\.getElementById\("mapBundleInput"\)/);
  assert.match(app, /elements\.mapBundleFile\.addEventListener\("change"/);
});

test("rectangle tool has drag preview and commits on pointer release", () => {
  assert.match(app, /previewRect:\s*null/);
  assert.match(app, /drawDragPreview/);
  assert.match(app, /state\.tool === "rect" \|\| state\.tool === "stage"/);
  assert.match(app, /if \(state\.tool === "rect"\)[\s\S]*drawRect\(state\.dragStart,\s*point,\s*"room"\)/);
});

test("room panel only exposes room type and uses preset colors", () => {
  assert.doesNotMatch(html, /Room ID <input/);
  assert.doesNotMatch(html, /Color <input id="roomColorInput"/);
  assert.match(html, /<h2>Rooms<\/h2>/);
  assert.match(html, /id="roomList"/);
  assert.match(html, /id="roomNameInput"/);
  assert.match(html, /id="addRoomBtn"[\s\S]*\+ Room/);
  assert.match(html, /id="deleteRoomBtn"[\s\S]*Delete/);
  assert.match(app, /ROOM_TYPE_PRESETS/);
  assert.match(app, /living_room:\s*\{[\s\S]*color:\s*"#/);
  assert.match(app, /room\.color \|\| preset\.color/);
  assert.match(app, /\$\{room\.color \|\| definition\.color \|\| preset\.color\}99/);
});

test("room type list removes hallway and entire house and adds cat room", () => {
  assert.doesNotMatch(html, /value="hallway"/);
  assert.doesNotMatch(html, /value="entire_house"/);
  assert.match(app, /cat_room:\s*\{[\s\S]*name:\s*"Cat Room"/);
  assert.match(app, /cat_room:\s*\{[\s\S]*name:\s*"Cat Room"/);
  assert.doesNotMatch(app, /hallway:\s*\{/);
  assert.doesNotMatch(app, /entire_house:\s*\{/);
});

test("object inspector supports facing and door-specific controls", () => {
  assert.match(html, /id="objectFacingInput"/);
  assert.match(html, /value="north"[\s\S]*North/);
  assert.match(app, /door:\s*"Door"/);
  assert.match(app, /room_id:\s*"common"[\s\S]*id:\s*"door"/);
  assert.match(html, /id="doorTypeInput"[\s\S]*Hinged[\s\S]*Sliding/);
  assert.match(html, /id="doorSwingInput"[\s\S]*Swing in[\s\S]*Swing out/);
  assert.match(html, /id="doorOpenStateInput"[\s\S]*Open[\s\S]*Closed/);
});

test("object inspector uses category buttons with editable catalog names", () => {
  assert.doesNotMatch(html, /<select id="objectCategoryInput"/);
  assert.match(html, /id="objectCategoryInput" type="hidden" value="sofa"/);
  assert.match(html, /id="objectNameInput"/);
  assert.doesNotMatch(html, /object-icon/);
  assert.match(html, /id="objectCategoryButtons"/);
  assert.match(app, /setObjectCategory/);
  assert.match(app, /objectCategoryLabels/);
  assert.match(app, /objectCategoryDefaults/);
  assert.match(app, /door:\s*\{\s*width:\s*1,\s*height:\s*2/);
});

test("object catalog is grouped by selected room type", () => {
  assert.match(app, /DEFAULT_OBJECT_DEFINITIONS/);
  assert.match(app, /room_id:\s*"living_room"[\s\S]*id:\s*"tv"[\s\S]*id:\s*"bookshelf"/);
  assert.match(app, /room_id:\s*"kitchen"[\s\S]*id:\s*"stove"[\s\S]*id:\s*"cat_bowl"/);
  assert.match(app, /room_id:\s*"bathroom"[\s\S]*id:\s*"toilet"[\s\S]*id:\s*"medicine_cabinet"/);
  assert.match(app, /room_id:\s*"cat_room"[\s\S]*id:\s*"cat_tree"[\s\S]*id:\s*"litter_box"/);
  assert.match(app, /room_id:\s*"garden"[\s\S]*id:\s*"bush"[\s\S]*id:\s*"garden_chair"/);
  assert.match(app, /renderObjectPalette/);
  assert.match(app, /objectCategoryRooms/);
  assert.match(app, /elements\.roomType\.addEventListener\("change",[\s\S]*renderObjectPalette/);
});

test("object panel exposes its own room selector for object catalog", () => {
  assert.match(html, /id="objectRoomList"/);
  assert.match(html, /id="objectNameInput"/);
  assert.match(html, /id="addObjectDefinitionBtn"[\s\S]*\+ Object/);
  assert.match(html, /id="deleteObjectDefinitionBtn"[\s\S]*Delete/);
  assert.match(app, /objectRoomType:\s*document\.getElementById\("objectRoomTypeInput"\)/);
  assert.match(app, /const roomId = elements\.objectRoomType\.value/);
  assert.match(app, /elements\.objectRoomType\.addEventListener\("change",[\s\S]*renderObjectPalette/);
});

test("room and object definitions can be edited without touching placed instances", () => {
  assert.match(app, /function ensureDefinitions/);
  assert.match(app, /function renderRoomList/);
  assert.match(app, /function addRoomDefinition/);
  assert.match(app, /function deleteRoomDefinition/);
  assert.match(app, /function updateRoomDefinitionName/);
  assert.match(app, /function renderObjectRoomList/);
  assert.match(app, /function addObjectDefinition/);
  assert.match(app, /function deleteObjectDefinition/);
  assert.match(app, /function updateObjectDefinitionName/);
  assert.match(app, /state\.doc\.object_definitions/);
  assert.match(app, /object\.name = objectDefinitionLabel\(category\)/);
});

test("delete definition buttons remove selected items instead of restoring them", () => {
  assert.match(app, /const hadRoomDefinitions = Array\.isArray\(state\.doc\.room_definitions\) && state\.doc\.room_definitions\.length/);
  assert.match(app, /if \(!hadRoomDefinitions\)[\s\S]*for \(const room of state\.doc\.rooms \|\| \[\]\)/);
  assert.match(app, /state\.doc\.rooms = state\.doc\.rooms\.filter\(\(room\) => room\.id !== id\)/);
  assert.match(app, /state\.doc\.objects = state\.doc\.objects\.filter\(\(object\) => object\.room_id !== id\)/);
  assert.match(app, /if \(tile\.room_id === id\) Object\.assign\(tile,[\s\S]*room_id:\s*null/);
  const deleteBody = functionBody(app, "deleteRoomDefinition");
  assert.doesNotMatch(deleteBody, /terrain:\s*"void"/);
  assert.doesNotMatch(deleteBody, /build:\s*"blocked"/);
  assert.match(app, /const definition = objectDefinitionForId\(id\)/);
  assert.match(app, /state\.doc\.object_definitions = state\.doc\.object_definitions\.filter\(\(item\) => item !== definition\)/);
});

test("object definition add and delete refresh the palette immediately", () => {
  const refreshBody = functionBody(app, "refreshInspector");
  const roomListIndex = refreshBody.indexOf("renderObjectRoomList();");
  const paletteIndex = refreshBody.indexOf("renderObjectPalette();");
  const stageFieldIndex = refreshBody.indexOf("syncStageFields();");
  assert(roomListIndex >= 0);
  assert(paletteIndex > roomListIndex);
  assert(paletteIndex < stageFieldIndex);
  assert.match(app, /state\.doc\.object_definitions\.push\(\{ room_id: roomId, id, name \}\);[\s\S]*afterChange\(true\)/);
  assert.match(app, /state\.doc\.object_definitions = state\.doc\.object_definitions\.filter\(\(item\) => item !== definition\);[\s\S]*afterChange\(true\)/);
});

test("inspector panels and door fields are contextual", () => {
  assert.match(html, /data-panel="room"/);
  assert.match(html, /data-panel="object"/);
  assert.match(html, /class="field-row door-fields" hidden/);
  assert.match(app, /updateInspectorPanels/);
  assert.match(app, /updateObjectFields/);
  assert.match(app, /elements\.doorFields\.hidden = elements\.objectCategory\.value !== "door"/);
});

test("object renderer draws directional doors sofas and beds", () => {
  assert.match(app, /object\.facing/);
  assert.match(app, /door_type:\s*elements\.doorType\.value/);
  assert.match(app, /drawDoorObject/);
  assert.match(app, /drawSofaObject/);
  assert.match(app, /drawBedObject/);
  assert.match(app, /drawFacingArrow/);
});

test("object selection exposes canvas controls for move rotate and delete", () => {
  assert.match(app, /selectedObject\(\)/);
  assert.match(app, /objectAtTile/);
  assert.match(app, /objectActionAtPoint/);
  assert.match(app, /drawObjectControls/);
  assert.match(app, /rotateSelectedObject/);
  assert.match(app, /deleteSelectedObject/);
  assert.match(app, /moveObjectTo/);
  assert.match(app, /objectDrag:\s*null/);
});

test("overlap allowed objects render above regular objects", () => {
  assert.match(app, /drawableObjects\(\)/);
  assert.match(app, /Number\(Boolean\(a\.allow_overlap\)\) - Number\(Boolean\(b\.allow_overlap\)\)/);
  assert.match(app, /for \(const object of drawableObjects\(\)\)/);
});

test("selected object details edit the placed object live", () => {
  assert.match(html, /data-panel="selected-object"/);
  assert.match(html, /id="selectedObjectWidthInput"/);
  assert.match(html, /id="selectedObjectHeightInput"/);
  assert.match(html, /id="selectedObjectFacingInput"/);
  assert.match(html, /id="selectedObjectOverlapInput"[\s\S]*Allow overlap/);
  assert.match(html, /class="field-row selected-door-fields" hidden/);
  assert.match(app, /syncSelectedObjectFields/);
  assert.match(app, /updateSelectedObjectFromFields/);
  assert.match(app, /elements\.selectedObjectWidth/);
  assert.match(app, /object\.allow_overlap = elements\.selectedObjectOverlap\.checked/);
  assert.match(app, /elements\.selectedDoorFields\.hidden = object\.category !== "door"/);
  assert.match(app, /moveObjectTo\(object,\s*object\.x,\s*object\.y\)/);
});

test("door renderer uses clearer hinged and sliding symbols", () => {
  assert.match(app, /drawHingedDoorSymbol/);
  assert.match(app, /drawSlidingDoorSymbol/);
  assert.match(app, /drawDoorClosedLine/);
  assert.match(app, /drawDoorOpenGuide/);
  assert.match(app, /Math\.PI \/ 2/);
  assert.match(app, /door_swing/);
  assert.doesNotMatch(app, /drawDoorLabel/);
});

test("door hinge corner can be changed after placement", () => {
  assert.match(html, /id="doorHingeInput"[\s\S]*Start corner[\s\S]*End corner/);
  assert.match(html, /id="selectedDoorHingeInput"[\s\S]*Start corner[\s\S]*End corner/);
  assert.match(app, /door_hinge:\s*elements\.doorHinge\.value/);
  assert.match(app, /elements\.selectedDoorHinge\.value = object\.door_hinge \|\| "start"/);
  assert.match(app, /object\.door_hinge = elements\.selectedDoorHinge\.value/);
  assert.match(app, /doorGeometry\(rect,\s*facing,\s*object\.door_hinge \|\| "start"\)/);
});

test("paint panel removes terrain and keeps doors as objects only", () => {
  assert.doesNotMatch(html, /data-paint-target="terrain"/);
  assert.doesNotMatch(html, /id="terrainInput"/);
  assert.doesNotMatch(html, /data-paint-target="structure" data-paint-value="door"/);
  assert.match(app, /door:\s*"Door"/);
  assert.match(app, /room_id:\s*"common"[\s\S]*id:\s*"door"/);
  assert.doesNotMatch(app, /terrain:\s*document\.getElementById\("terrainInput"\)/);
  assert.doesNotMatch(app, /terrain:\s*elements\.terrain\.value/);
});

test("erase tool removes objects before touching tile terrain", () => {
  const body = functionBody(app, "eraseTile");
  const objectIndex = body.indexOf("const object = objectAtTile(x, y);");
  const tileIndex = body.indexOf("const tile = core.getTile");
  assert(objectIndex >= 0);
  assert(tileIndex > objectIndex);
  assert.match(body, /if \(object\) \{[\s\S]*state\.doc\.objects = state\.doc\.objects\.filter\(\(item\) => item\.id !== object\.id\);[\s\S]*return;[\s\S]*\}/);
});

test("room types use garden and balcony as room-driven terrain presets", () => {
  assert.doesNotMatch(html, /value="backyard"/);
  assert.match(app, /garden:\s*\{[\s\S]*name:\s*"Garden"/);
  assert.match(app, /balcony:\s*\{[\s\S]*name:\s*"Balcony"/);
  assert.match(app, /garden:\s*\{[\s\S]*name:\s*"Garden"[\s\S]*terrain:\s*"garden"/);
  assert.match(app, /balcony:\s*\{[\s\S]*name:\s*"Balcony"[\s\S]*terrain:\s*"outdoor_ground"/);
});

test("stage manager exposes stage list ratio and export direction controls", () => {
  assert.match(html, /data-panel="stage-list"[\s\S]*id="stageList"/);
  assert.match(html, /id="addStageBtn"[\s\S]*New Stage/);
  assert.match(html, /id="duplicateStageBtn"[\s\S]*Duplicate/);
  assert.match(html, /id="deleteStageBtn"[\s\S]*Delete/);
  assert.match(html, /id="stageDetailControls"/);
  assert.doesNotMatch(html, /Stage ID/);
  assert.match(html, /id="stageIdInput" type="hidden"/);
  assert.match(html, /Stage name <input id="stageNameInput"/);
  assert.match(html, /id="stageRatioInput"[\s\S]*9:16[\s\S]*4:3[\s\S]*16:9[\s\S]*1:1[\s\S]*custom/);
  assert.match(html, /id="stageTopDirectionInput"[\s\S]*North[\s\S]*East[\s\S]*South[\s\S]*West/);
  assert.match(app, /renderStageList/);
  assert.match(app, /setActiveStageId/);
  assert.match(app, /applyStageRatio/);
  assert.match(app, /stage\.top_direction = elements\.stageTopDirection\.value/);
});

test("stage detail controls only show while using the stage frame tool", () => {
  assert.match(app, /stageDetail:\s*document\.getElementById\("stageDetailControls"\)/);
  assert.match(app, /function updateContextualControls/);
  assert.match(app, /elements\.stageDetail\.hidden = state\.mode !== "stage" \|\| state\.tool !== "stage"/);
});

test("stage mode tool order puts stage marker path and path area before erase and pan", () => {
  const stageIndex = html.indexOf('data-mode-tool="stage" data-tool="stage"');
  const markerIndex = html.indexOf('data-mode-tool="stage" data-tool="marker"');
  const pathIndex = html.indexOf('data-mode-tool="stage" data-tool="path"');
  const pathAreaIndex = html.indexOf('data-mode-tool="stage" data-tool="path_area"');
  const eraseIndex = html.indexOf('data-mode-tool="all" data-tool="erase"');
  const panIndex = html.indexOf('data-mode-tool="all" data-tool="pan"');
  assert(stageIndex > 0);
  assert(stageIndex < markerIndex);
  assert(markerIndex < pathIndex);
  assert(pathIndex < pathAreaIndex);
  assert(pathAreaIndex < eraseIndex);
  assert(eraseIndex < panIndex);
});

test("stage inspector panels are scoped to the selected stage tool", () => {
  assert.match(html, /data-panel="stage-list"/);
  assert.match(html, /data-panel="stage-marker"/);
  assert.match(html, /data-panel="stage-path"/);
  assert.doesNotMatch(html, /data-panel="marker-stage"/);
  assert.match(app, /path_area:\s*\["stage-path"\]/);
  assert.match(app, /path:\s*\["stage-path"\]/);
  assert.match(app, /marker:\s*\["stage-marker"\]/);
  assert.match(app, /stage:\s*\["stage-list"\]/);
  assert.match(app, /visible\.add\("stage-list"\)/);
  assert.match(app, /visible\.add\("stage-preview"\)/);
});

test("stage gameplay uses the active stage instead of master marker and path arrays", () => {
  assert.match(app, /activeStageMarkers\(\)/);
  assert.match(app, /activeStagePaths\(\)/);
  assert.match(app, /stage\.markers\.push/);
  assert.match(app, /stage\.paths\.push/);
  assert.match(app, /for \(const marker of activeStageMarkers\(\)\)/);
  assert.match(app, /for \(const path of activeStagePaths\(\)\)/);
});

test("stage path width controls default to one tile and update the active path", () => {
  assert.match(html, /id="pathWidthInput"[^>]+min="1"[^>]+max="6"[^>]+value="1"/);
  assert.match(html, /id="pathWidthControls"/);
  assert.match(html, /data-path-width="1"[\s\S]*1 Tile/);
  assert.match(html, /data-path-width="2"[\s\S]*2 Tiles/);
  assert.match(html, /data-path-width="3"[\s\S]*3 Tiles/);
  assert.match(app, /pathWidth:\s*document\.getElementById\("pathWidthInput"\)/);
  assert.match(app, /function syncPathWidthField/);
  assert.match(app, /function updatePathWidthFromField/);
  assert.match(app, /width_tiles:\s*clamp\(Number\(elements\.pathWidth\.value \|\| 1\),\s*1,\s*6\)/);
  assert.match(app, /path\.width_tiles = clamp\(Number\(elements\.pathWidth\.value \|\| 1\),\s*1,\s*6\)/);
  assert.match(app, /\[data-path-width\]/);
  assert.match(app, /pathWidthControls:\s*document\.getElementById\("pathWidthControls"\)/);
  assert.match(app, /elements\.pathWidthControls\.hidden = state\.mode !== "stage" \|\| state\.tool !== "path"/);
});

test("stage mode can select add and delete multiple paths", () => {
  assert.match(html, /id="pathSelectInput"/);
  assert.match(html, /id="pathSpawnInput"/);
  assert.match(html, /id="pathBaseInput"/);
  assert.match(html, /id="addPathBtn"[\s\S]*New Path/);
  assert.match(html, /id="deletePathBtn"[\s\S]*Delete Path/);
  assert.match(app, /pathSelect:\s*document\.getElementById\("pathSelectInput"\)/);
  assert.match(app, /pathSpawn:\s*document\.getElementById\("pathSpawnInput"\)/);
  assert.match(app, /pathBase:\s*document\.getElementById\("pathBaseInput"\)/);
  assert.match(app, /addPath:\s*document\.getElementById\("addPathBtn"\)/);
  assert.match(app, /deletePath:\s*document\.getElementById\("deletePathBtn"\)/);
  assert.match(app, /activePathId/);
  assert.match(app, /function renderPathSelect/);
  assert.match(app, /function renderPathEndpointSelects/);
  assert.match(app, /function updatePathEndpointsFromFields/);
  assert.match(app, /function addPath/);
  assert.match(app, /function deletePath/);
  assert.match(app, /path\.areas\.push/);
});

test("stage gameplay markers use per-stage numbered labels", () => {
  const addBody = functionBody(app, "addMarker");
  const labelBody = functionBody(app, "stageMarkerLabel");
  const numberBody = functionBody(app, "markerNumberLabel");
  const drawBody = functionBody(app, "drawMarkers");
  assert.match(app, /function nextStageMarkerNumber/);
  assert.match(addBody, /label:\s*stageMarkerLabel\(stage,\s*type\)/);
  assert.match(labelBody, /type === "spawn" \? "Spawn" : type === "base" \? "Base" : "Slot"/);
  assert.match(labelBody, /nextStageMarkerNumber\(stage,\s*type\)/);
  assert.match(numberBody, /\^\(Spawn\|Base\|Slot\)/);
  assert.match(drawBody, /markerNumberLabel\(marker\)/);
  assert.doesNotMatch(drawBody, /continue;/);
});

test("stage mode validation list focuses on the active stage", () => {
  const refreshBody = functionBody(app, "refreshInspector");
  const scopeBody = functionBody(app, "validationForCurrentScope");
  const docBody = functionBody(app, "stageScopedValidationDocument");
  assert.match(app, /function stageScopedValidationDocument/);
  assert.match(docBody, /stages:\s*\[stage\]/);
  assert.match(docBody, /paths:\s*\[\]/);
  assert.match(docBody, /markers:\s*\[\]/);
  assert.match(scopeBody, /state\.mode !== "stage"/);
  assert.match(scopeBody, /activeStage\(\)/);
  assert.match(scopeBody, /core\.validateDocument\(stageScopedValidationDocument\(stage\)\)/);
  assert.match(refreshBody, /const scopedValidation = validationForCurrentScope\(validation\)/);
  assert.match(refreshBody, /for \(const message of scopedValidation\.errors\)/);
  assert.match(refreshBody, /refreshStagePreview\(scopedValidation\)/);
});

test("stage path renderer dims inactive paths while editing paths", () => {
  const body = functionBody(app, "drawPathAreas");
  assert.match(app, /function pathDisplayAlpha/);
  assert.match(app, /state\.mode === "stage" && \(state\.tool === "path" \|\| state\.tool === "path_area"\)/);
  assert.match(app, /path\.id === active\.id \? 1 : 0\.28/);
  assert.match(app, /context\.globalAlpha = pathDisplayAlpha\(path,\s*active\)/);
  assert.match(body, /context\.globalAlpha = pathDisplayAlpha\(path,\s*active\)[\s\S]*area\.x \* size/);
});

test("stage path layer renders above map objects stage frames and grid but below markers", () => {
  const body = functionBody(app, "drawDocument");
  const pathIndex = body.indexOf("drawPath(context, size)");
  assert(pathIndex > body.indexOf("drawObjects(context, size, layers)"));
  assert(pathIndex > body.indexOf("drawStages(context, size)"));
  assert(pathIndex > body.indexOf("drawGrid(context, size)"));
  assert(pathIndex < body.indexOf("drawMarkers(context, size)"));
});

test("stage list selection refreshes the active stage and canvas", () => {
  const body = functionBody(app, "setActiveStageId");
  assert.match(body, /state\.activeStageId = stage\.id/);
  assert.match(body, /state\.activePathId = stage\.active_path_id/);
  assert.match(body, /syncStageFields\(\)/);
  assert.match(body, /saveDocument\(\)/);
  assert.match(body, /render\(\)/);
});

test("stage details can edit name without renaming the internal stage id", () => {
  const body = functionBody(app, "updateStageFromFields");
  assert.match(body, /stage\.name = elements\.stageName\.value\.trim\(\) \|\| stage\.id/);
  assert.doesNotMatch(body, /const nextId = elements\.stageId\.value/);
  assert.doesNotMatch(body, /stage\.id = nextId/);
});

test("global pointer release does not rebuild panels when no canvas drag is active", () => {
  const body = functionBody(app, "handlePointerUp");
  assert.match(body, /if \(!state\.isDragging\) return/);
  assert.match(body, /const point = canvasToTile\(event\)/);
  assert(body.indexOf("if (!state.isDragging) return") < body.indexOf("const point = canvasToTile(event)"));
});

test("stage mode can drag rectangular path area expansions", () => {
  assert.match(html, /data-mode-tool="stage"[\s\S]*data-tool="path_area"[\s\S]*Expand path/);
  assert.match(app, /x:\s*"path_area"/);
  assert.match(app, /STAGE_MODE_TOOLS[\s\S]*"path_area"/);
  assert.match(app, /function addPathArea/);
  assert.match(app, /path\.areas\.push/);
  assert.match(app, /state\.tool === "rect" \|\| state\.tool === "stage" \|\| state\.tool === "path_area"/);
  assert.match(app, /if \(state\.tool === "path_area"\)[\s\S]*addPathArea\(state\.dragStart,\s*point\)/);
  assert.match(app, /drawPathAreas/);
});

test("stage path area expansions render directional arrows", () => {
  const areaBody = functionBody(app, "drawPathAreas");
  const directionBody = functionBody(app, "nearestPathSegmentDirection");
  assert.match(app, /function nearestPathSegmentDirection/);
  assert.match(directionBody, /distanceToPathSegment/);
  assert.match(areaBody, /drawPathAreaArrow\(context,\s*area,\s*direction,\s*size\)/);
  assert.match(app, /function drawPathAreaArrow/);
});

test("stage path area expansion frames stay solid while drawing and after placement", () => {
  const areaBody = functionBody(app, "drawPathAreas");
  const previewBody = functionBody(app, "drawDragPreview");
  assert.doesNotMatch(areaBody, /setLineDash/);
  assert.match(previewBody, /if \(state\.tool !== "path_area"\) context\.setLineDash\(\[10,\s*6\]\)/);
});

test("stage path drawing stops after the selected base is reached", () => {
  const body = functionBody(app, "addPathPoint");
  assert.match(app, /function pathHasReachedBase/);
  assert.match(app, /function pointInsideMarker/);
  assert.match(body, /if \(pathHasReachedBase\(path,\s*stage\)\) return/);
});

test("stage marker tool can select and drag existing markers", () => {
  const downBody = functionBody(app, "handlePointerDown");
  const moveBody = functionBody(app, "handlePointerMove");
  const upBody = functionBody(app, "handlePointerUp");
  assert.match(app, /function markerAtTile/);
  assert.match(app, /markerDrag:\s*null/);
  assert.match(downBody, /state\.tool === "marker" && state\.mode === "stage"[\s\S]*const marker = markerAtTile\(point\.x,\s*point\.y\)/);
  assert.match(downBody, /state\.selected = \{ type: "marker", id: marker\.id \}/);
  assert.match(downBody, /state\.markerDrag = \{ id: marker\.id/);
  assert.match(moveBody, /if \(state\.markerDrag\)[\s\S]*const nextX = clamp/);
  assert.match(moveBody, /marker\.x = nextX/);
  assert.match(moveBody, /marker\.y = nextY/);
  assert.match(upBody, /const markerDrag = state\.markerDrag/);
  assert.match(upBody, /state\.markerDrag = null/);
});

test("stage select tool can select and drag gameplay markers and paths", () => {
  const downBody = functionBody(app, "handlePointerDown");
  const moveBody = functionBody(app, "handlePointerMove");
  const upBody = functionBody(app, "handlePointerUp");
  assert.match(app, /function pathAtTile/);
  assert.match(app, /function movePathByDelta/);
  assert.match(app, /pathDrag:\s*null/);
  assert.match(downBody, /state\.tool === "select"[\s\S]*state\.mode === "stage"[\s\S]*const marker = markerAtTile\(point\.x,\s*point\.y\)/);
  assert.match(downBody, /state\.markerDrag = \{ id: marker\.id/);
  assert.match(downBody, /const path = pathAtTile\(point\.x,\s*point\.y\)/);
  assert.match(downBody, /state\.selected = \{ type: "path", id: path\.id \}/);
  assert.match(downBody, /state\.pathDrag = \{ id: path\.id/);
  assert.match(moveBody, /if \(state\.pathDrag\)[\s\S]*movePathByDelta\(path,\s*nextDx - state\.pathDrag\.appliedDx,\s*nextDy - state\.pathDrag\.appliedDy\)/);
  assert.match(moveBody, /state\.pathDrag\.appliedDx \+= moved\.dx/);
  assert.match(moveBody, /state\.pathDrag\.appliedDy \+= moved\.dy/);
  assert.match(upBody, /const pathDrag = state\.pathDrag/);
  assert.match(upBody, /state\.pathDrag = null/);
});

test("stage mode exposes preview and export panel", () => {
  assert.match(html, /data-mode-panel="stage"[\s\S]*data-panel="stage-preview"/);
  assert.match(html, /id="stagePreviewSummary"/);
  assert.match(html, /id="stagePreviewStats"/);
  assert.match(html, /id="exportStageJsonBtn"[\s\S]*Game JSON/);
  assert.match(html, /id="exportStagePromptBtn"[\s\S]*Image Prompt/);
  assert.match(html, /id="exportStageGameplayPngBtn"[\s\S]*PNG Path\/Points\/Grid/);
  assert.match(html, /id="exportStageArtPngBtn"[\s\S]*PNG Art\/Grid/);
  assert.match(html, /id="exportStageFullPngBtn"[\s\S]*PNG Full/);
  assert.match(app, /stagePreviewSummary:\s*document\.getElementById\("stagePreviewSummary"\)/);
  assert.match(app, /function stageExportData/);
  assert.match(app, /function refreshStagePreview/);
  assert.match(app, /elements\.stagePreviewStats\.innerHTML/);
  assert.match(app, /exportStageJsonBtn/);
  assert.match(app, /exportStagePromptBtn/);
  assert.match(app, /exportStageGameplayPngBtn/);
  assert.match(app, /exportStageArtPngBtn/);
  assert.match(app, /exportStageFullPngBtn/);
});

test("stage PNG export uses the same east west top direction as JSON export", () => {
  const body = functionBody(app, "exportStagePng");
  assert.match(body, /stage\.top_direction === "east"[\s\S]*off\.rotate\(-Math\.PI \/ 2\)/);
  assert.match(body, /stage\.top_direction === "west"[\s\S]*off\.rotate\(Math\.PI \/ 2\)/);
});

test("stage PNG export supports gameplay art and full layer presets", () => {
  const presetBody = functionBody(app, "stagePngLayers");
  const exportBody = functionBody(app, "exportStagePng");
  assert.match(presetBody, /kind === "gameplay"[\s\S]*path:\s*true[\s\S]*markers:\s*true[\s\S]*grid:\s*true/);
  assert.match(presetBody, /kind === "art"[\s\S]*objects:\s*true[\s\S]*doors:\s*true[\s\S]*path:\s*false[\s\S]*markers:\s*false[\s\S]*grid:\s*true/);
  assert.match(presetBody, /path:\s*true[\s\S]*markers:\s*true[\s\S]*grid:\s*true/);
  assert.match(exportBody, /drawDocument\(off,\s*size,\s*\{ layers: stagePngLayers\(kind\) \}\)/);
  assert.match(app, /exportStageGameplayPngBtn"\)\.addEventListener\("click", \(\) => exportStagePng\("gameplay"\)\)/);
  assert.match(app, /exportStageArtPngBtn"\)\.addEventListener\("click", \(\) => exportStagePng\("art"\)\)/);
  assert.match(app, /exportStageFullPngBtn"\)\.addEventListener\("click", \(\) => exportStagePng\("full"\)\)/);
});

test("stage mode always shows saved stage list and preview panels", () => {
  assert.match(app, /state\.mode === "stage"[\s\S]*visible\.add\("stage-list"\)/);
  assert.match(app, /state\.mode === "stage"[\s\S]*visible\.add\("stage-preview"\)/);
});

test("mode switch separates map drawing tools from stage gameplay tools", () => {
  assert.match(html, /id="mapModeBtn"[\s\S]*Maps/);
  assert.match(html, /id="stageModeBtn"[\s\S]*Stage/);
  assert.match(html, /data-mode-tool="map"[\s\S]*data-tool="room"/);
  assert.match(html, /data-mode-tool="map"[\s\S]*data-tool="object"/);
  assert.match(html, /data-mode-tool="stage"[\s\S]*data-tool="path"/);
  assert.match(html, /data-mode-tool="stage"[\s\S]*data-tool="marker"/);
  assert.doesNotMatch(html, /data-mode-action="map"[\s\S]*id="exportMasterBtn"/);
  assert.match(html, /data-mode-action="stage"[\s\S]*id="exportStageBtn"/);
  assert.match(app, /mode:\s*"map"/);
  assert.match(app, /setMode/);
  assert.match(app, /updateModeUi/);
  assert.match(app, /MAP_MODE_TOOLS/);
  assert.match(app, /STAGE_MODE_TOOLS/);
});

test("stage mode cannot select or edit master map objects", () => {
  assert.match(app, /if \(state\.mode === "stage"\) return null/);
  assert.match(app, /if \(state\.mode === "stage"\)[\s\S]*return;/);
  assert.match(app, /selectedObject\(\) && state\.mode === "map"/);
  assert.match(app, /visible\.add\("selected-object"\)/);
});
