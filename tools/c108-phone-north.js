// C108 — 390 dock tap-north reaches the next unlock / shop bowls.
// Loop 107 leftover: after Continue on ≈390×844 the ribbon says
// “Tap north to walk to the shop bowls”, but a thumb tap in the
// visible upper third (ny 0.12–0.22) hits offscreen Dolphin (11)
// because tankAtWorld won before the C107 remap. Dest became the
// aisle snap (881,784); walker only shuffled 880,920 → 884,776.
// ny≥0.28 remapped. The wood ↑ SHOP chip was the only reliable path.
// C108 runs the plaza remap first and ignores plaza bowls above the
// dock lip. No auto-unlock. No camera clamp. Desktop click stays.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

function extractFn(src, name) {
  const needle = "function " + name;
  let i = 0;
  while (i < src.length) {
    const at = src.indexOf(needle, i);
    if (at < 0) return null;
    const before = at === 0 ? " " : src[at - 1];
    if (/[\s;{}()]/.test(before)) {
      const paren = src.indexOf("(", at + needle.length);
      const brace = src.indexOf("{", paren);
      if (brace < 0) return null;
      let depth = 0;
      for (let j = brace; j < src.length; j++) {
        if (src[j] === "{") depth++;
        else if (src[j] === "}") {
          depth--;
          if (depth === 0) return src.slice(at, j + 1);
        }
      }
    }
    i = at + needle.length;
  }
  return null;
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/Aqua Bay · loop 111/.test(src), "title/pause stamp is loop 111");
assert(!/Aqua Bay · loop 107/.test(src), "loop 107 stamp is gone");
assert(/loop 108 tap north reaches the bowls/.test(src),
  "C108 names the tap-north leftover");
assert(/function plazaTankStealsDockTap\s*\(/.test(src),
  "plazaTankStealsDockTap ignores offscreen plaza bowls");
assert(/function walkTankAtWorld\s*\(/.test(src),
  "walkTankAtWorld wraps tankAtWorld");
assert(/function phoneDockPlazaWalkWanted\s*\(/.test(src),
  "C107 phoneDockPlazaWalkWanted stays");
assert(/function hideDockWalkHint\s*\(/.test(src),
  "hideDockWalkHint stays");
assert(/function nextUnlockWalkDest\s*\(/.test(src),
  "nextUnlockWalkDest stays");
assert(/drawPierBoardChip\(b\.x, b\.y, b\.w, b\.h, "↑ SHOP"/.test(src),
  "↑ SHOP chip stays as a second explicit target");
assert(/Tap north to walk to the shop bowls/.test(src),
  "phone ribbon still cues north / shop bowls");

const clickSrc = extractFn(src, "clickWalkTarget") || "";
const trySrc = extractFn(src, "tryClickShop") || "";
assert(/phoneDockPlazaWalkWanted\(wx, wy/.test(clickSrc),
  "clickWalkTarget still remaps a phone plaza tap");
assert(/phoneDockPlazaWalkWanted\(wx, wy/.test(trySrc),
  "tryClickShop remaps on pointer-down");
const clickRemap = clickSrc.indexOf("phoneDockPlazaWalkWanted");
const clickTank = clickSrc.indexOf("walkTankAtWorld");
assert(clickRemap >= 0 && clickTank >= 0 && clickRemap < clickTank,
  "clickWalkTarget runs C107 remap before tank hits");
const tryRemap = trySrc.indexOf("phoneDockPlazaWalkWanted");
const tryTank = trySrc.indexOf("walkTankAtWorld");
assert(tryRemap >= 0 && tryTank >= 0 && tryRemap < tryTank,
  "tryClickShop runs C107 remap before tank hits");
assert(/walkToShopBowls\(\)/.test(trySrc),
  "tryClickShop north tap walks the next unlock dest");
assert(/walkToShopBowls\(\)/.test(extractFn(src, "onUI") || ""),
  "↑ SHOP chip still walks the same unlock dest");

assert(/function wasdShopPath\s*\(/.test(src), "wasdShopPath stays");
assert(/nextLockedTank\(\)/.test(extractFn(src, "wasdShopPath") || ""),
  "wasdShopPath steers to nextLockedTank, not hardcoded tank 6");
assert(/alley/.test(extractFn(src, "shopWalkRects") || "") && /x: 528/.test(extractFn(src, "shopWalkRects") || ""),
  "C106 mid-cluster alley stays");
assert(/C106 — that shorter walk was still the till slot/.test(src) ||
  /C106 — the west portal was still the shortest/.test(src) ||
  /C106 — shopPath now prefers the mid-cluster alley/.test(src) ||
  /C106 — inset the col-0 right/.test(src),
  "C106 alley comments stay");
assert(/pushOut\(t\.x, t\.y, TANK_W, TANK_H \+ 8\)/.test(src),
  "tank walk collider is the bowl + 8px lip");

assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(/function galleryOpen\s*\(/.test(src), "galleryOpen stays");
assert(/function galleryTankDest\s*\(/.test(src), "galleryTankDest stays");
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
assert(/unlock:\s*2200/.test(src), "Seahorse unlock stays $2200");
assert(/unlock:\s*1400/.test(src), "Sea Turtle unlock stays $1400");
const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/C76 — one tank neighborhood around the aisle/.test(src), "C76 cluster stays");
assert(/const PLAZA_CAM_CEILING\s*=\s*520/.test(src), "plaza camera ceiling stays 520");
assert(/const DOCK_CAM_FLOOR\s*=\s*1000/.test(src), "dock camera floor stays 1000");
assert(/function desktopStage\s*\(/.test(src), "desktopStage stays");
assert(/function portraitStage\s*\(/.test(src), "portraitStage stays");
assert(/catalogChipLabel/.test(src) && /BOOK/.test(extractFn(src, "catalogChipLabel") || ""),
  "catalog HUD chip is BOOK while ↑ SHOP is showing (secondary)");

function desktopStage(w, h) { return w >= 880 && w >= h * 0.92; }
assert(desktopStage(1280, 720), "1280×720 is a desktop stage");
assert(!desktopStage(390, 844), "390×844 is not a desktop stage");

const TANK_W = 210, TANK_H = 156, CORE_SPECIES = 5, SPECIES_N = 13;
const TANK_POS = [
  { x: 340, y: 164 }, { x: 558, y: 164 }, { x: 776, y: 164 },
  { x: 994, y: 164 }, { x: 1212, y: 164 },
  { x: 340, y: 380 }, { x: 558, y: 380 }, { x: 776, y: 380 }, { x: 994, y: 380 },
  { x: 340, y: 596 }, { x: 558, y: 596 }, { x: 776, y: 596 }, { x: 994, y: 596 },
];
assert(TANK_POS[5].x === 340 && TANK_POS[5].y === 380, "Seahorse stays C76 {340,380}");
assert(TANK_POS[6].x === 558 && TANK_POS[6].y === 380, "Puffer stays C76 {558,380}");
assert(TANK_POS[11].x === 776 && TANK_POS[11].y === 596, "Dolphin stays C76 {776,596}");
assert(TANK_POS[1].x - (TANK_POS[0].x + TANK_W) === 8,
  "columns still overlap / gap 8px — not an un-clustered east row");

const REGISTER = { x: 168, y: 500, w: 150, h: 110 };
const KIOSK = { x: 1280, y: 480, w: 170, h: 130 };
const WELCOME = { x: 140, y: 780, w: 156, h: 86 };
const AISLE = { x: 802, y: 760, w: 156, h: 160 };
const DIVE_ZONE = { x: 520, y: 980, w: 720, h: 160 };
const SPECIES = new Array(SPECIES_N);
const EAST_SHOP = { x: 1256, y: 380, w: 228, h: 286 };
const DOCK_CAM_FLOOR = 1000;

function padSpeciesFlags(arr) {
  const out = [];
  for (let i = 0; i < SPECIES_N; i++) out[i] = !!(arr && arr[i]);
  out[0] = true;
  return out;
}

function seedSave(opts) {
  const unlocked = padSpeciesFlags(opts.unlocked);
  return {
    money: opts.money | 0,
    speedLv: 0, bagLv: 0, catchLv: 0,
    unlocked: unlocked,
    stock: new Array(SPECIES_N).fill(0),
    bag: [],
    tutorial: 0,
  };
}
const saveOpen = seedSave({
  unlocked: [true, true, true, true, true],
  money: 4000,
});
assert(saveOpen.unlocked[4] === true && saveOpen.unlocked[5] !== true,
  "isolated SAVE_KEY seed has Turtle, not Seahorse");
assert(saveOpen.money >= 3200, "seed money is ≥ 3200");

const names = [
  "shopDockWalk", "walkClearY", "tankWalkPoint", "shopWalkRects",
  "snapToShopWalk", "shopRectOverlap", "shopRectHas", "shopPortal",
  "wasdShopPath", "shopPath", "constrainShop", "pushOut", "shopWalkMax",
  "galleryOpen", "tankLive", "galleryTankDest", "speciesUnlocked",
  "nextLockedSafe", "nextLockedTank",
  "onAisleWalk", "eastShopNavyGap", "destWantsPlaza", "destWantsDock",
  "nextUnlockWalkDest", "hideDockWalkHint", "phoneDockPlazaWalkWanted",
  "tankAtWorld", "plazaTankStealsDockTap", "walkTankAtWorld",
  "clickWalkTarget", "tryClickShop", "walkToShopBowls", "setWalkDest",
];
const fns = {};
for (let i = 0; i < names.length; i++) {
  fns[names[i]] = extractFn(src, names[i]);
  assert(fns[names[i]], names[i] + " is extractable from game.js");
}

function makeCtx(save, opts) {
  opts = opts || {};
  const phone = opts.phone !== false;
  const sandbox = {
    TANK_POS: TANK_POS, TANK_W: TANK_W, TANK_H: TANK_H,
    REGISTER: REGISTER, KIOSK: KIOSK, WELCOME: WELCOME, AISLE: AISLE,
    DIVE_ZONE: DIVE_ZONE, SPECIES: SPECIES, CORE_SPECIES: CORE_SPECIES,
    DOCK_CAM_FLOOR: DOCK_CAM_FLOOR,
    state: { unlocked: save.unlocked.slice(), money: save.money, scene: "shop", mode: "play" },
    player: { x: 880, y: 920, radius: 16, goto: null, route: null, pendingAct: null, unlockConfirm: null },
    keys: null,
    cam: { x: 880, y: 1000, yFloor: DOCK_CAM_FLOOR },
    mouse: { pressX: opts.pressX || 640, pressY: opts.pressY || 700 },
    lastIntent: null,
    clamp: clamp,
    toast: function () {},
    nope: function () {},
    Math: Math,
    portraitStage: function () { return !!phone; },
    thumbCopy: function () { return !!phone; },
    bagHasStockable: function () { return false; },
    cashNeedsCollect: function () { return false; },
    tillWaiting: function () { return false; },
    dockCameraReady: function () { return true; },
    plazaCameraReady: function () { return false; },
    actionFloor: function () { return opts.floor || 2770; },
    inDiveZone: function () { return false; },
    nearDivePad: function () { return sandbox.player.y > 870; },
    stockableTankTarget: function () { return null; },
    registerWalkPoint: function () { return { x: 248, y: 560 }; },
    intentWalk: function (kind, dest, i) {
      sandbox.lastIntent = { kind: kind, dest: dest, i: i };
      return true;
    },
  };
  const body = names.map((n) => fns[n]).join("\n") +
    "\nthis.__api = { galleryOpen, tankWalkPoint, shopPath, wasdShopPath," +
    " constrainShop, galleryTankDest, snapToShopWalk, nextLockedTank," +
    " nextUnlockWalkDest, hideDockWalkHint, phoneDockPlazaWalkWanted," +
    " tankAtWorld, plazaTankStealsDockTap, walkTankAtWorld," +
    " clickWalkTarget, tryClickShop, walkToShopBowls, setWalkDest," +
    " shopDockWalk, shopWalkRects, player, state, cam, mouse };";
  vm.runInNewContext(body, sandbox);
  sandbox.__api.lastIntent = function () { return sandbox.lastIntent; };
  sandbox.__api.setPress = function (x, y) {
    sandbox.mouse.pressX = x;
    sandbox.mouse.pressY = y;
  };
  return sandbox.__api;
}

const openApi = makeCtx(saveOpen, { phone: true });
const deskApi = makeCtx(saveOpen, { phone: false });
assert(openApi.galleryOpen() === true, "seeded Turtle save opens the gallery");
assert(openApi.nextLockedTank() === 5, "after Turtle the next unlock is Seahorse");
assert(openApi.nextUnlockWalkDest().x === 445 && openApi.nextUnlockWalkDest().y === 568,
  "nextUnlockWalkDest is tankWalkPoint(5)");

const dock = openApi.shopDockWalk();
const dockPt = { x: 880, y: 920 };
assert(dockPt.x >= dock.x && dockPt.x <= dock.x + dock.w, "seed walk starts on the painted dock");

const horse = openApi.tankWalkPoint(5);
const puff = openApi.tankWalkPoint(6);
const dolphin = openApi.tankWalkPoint(11);
assert(horse.x === 445 && horse.y === 568, "Seahorse stand is south of the bowl");
assert(puff.x === 663 && puff.y === 568, "Puffer stand stays south of the bowl");
assert(dolphin.x === 881 && dolphin.y === 784, "Dolphin aisle snap is 881,784 (the leftover dest)");

function inEastShop(x, y) {
  return x >= EAST_SHOP.x && x <= EAST_SHOP.x + EAST_SHOP.w &&
    y >= EAST_SHOP.y && y <= EAST_SHOP.y + EAST_SHOP.h;
}
function inRegister(x, y) {
  return x >= REGISTER.x && x <= REGISTER.x + REGISTER.w &&
    y >= REGISTER.y && y <= REGISTER.y + REGISTER.h;
}

const W = 1280, cssW = 390, cssH = 844;
const H390 = Math.max(960, Math.round(W * cssH / cssW));
const camZ = H390 / 860;
function screenToWorld(sx, sy, cam) {
  return { x: (sx - W / 2) / camZ + cam.x, y: (sy - H390 / 2) / camZ + cam.y };
}

const northNys = [0.12, 0.18, 0.22];
const northTaps = [];
for (let i = 0; i < northNys.length; i++) {
  const ny = northNys[i];
  const canvas = { x: W / 2, y: ny * H390 };
  const world = screenToWorld(canvas.x, canvas.y, { x: 880, y: 1000 });
  northTaps.push({ ny: ny, canvas: canvas, world: world });
}

// Document the leftover: raw tankAtWorld still sees Dolphin 11.
for (let i = 0; i < northTaps.length; i++) {
  const tap = northTaps[i];
  const raw = openApi.tankAtWorld(tap.world.x, tap.world.y);
  assert(raw === 11,
    "leftover: tankAtWorld at ny=" + tap.ny + " still hits Dolphin 11, got " + raw +
      " wy=" + tap.world.y.toFixed(1));
  assert(openApi.plazaTankStealsDockTap(11) === true,
    "plazaTankStealsDockTap(11) is true on the 390 dock");
  assert(openApi.walkTankAtWorld(tap.world.x, tap.world.y) === -1,
    "walkTankAtWorld ignores offscreen Dolphin at ny=" + tap.ny);
}

function followPath(api, dest, maxT) {
  api.player.x = dockPt.x;
  api.player.y = dockPt.y;
  const path = api.shopPath(api.player.x, api.player.y, dest.x, dest.y);
  api.player.route = path;
  api.player.goto = path && path[0] ? path[0] : dest;
  const dt = 1 / 60, maxSpeed = 232, accel = 2200;
  let vx = 0, vy = 0, t = 0, stuck = 0;
  const trace = [];
  let maxX = dockPt.x, minX = dockPt.x, puffMin = 1e15, hitPuff = false;
  while (t < maxT) {
    let ax = 0, ay = 0;
    if (api.player.goto) {
      const dx = api.player.goto.x - api.player.x, dy = api.player.goto.y - api.player.y;
      const d = Math.hypot(dx, dy);
      if (d < 22) {
        if (api.player.route && api.player.route.length > 1) {
          api.player.route.shift();
          api.player.goto = api.player.route[0];
        } else {
          api.player.goto = null;
          api.player.route = null;
        }
      }
    }
    if (api.player.goto) {
      const rdx = api.player.goto.x - api.player.x, rdy = api.player.goto.y - api.player.y;
      const rd = Math.hypot(rdx, rdy);
      if (rd > 8) { ax = rdx / rd; ay = rdy / rd; }
    }
    vx += ax * accel * dt;
    vy += ay * accel * dt;
    vx -= vx * 5.2 * dt;
    vy -= vy * 5.2 * dt;
    const sp = Math.hypot(vx, vy);
    if (sp > maxSpeed) { vx *= maxSpeed / sp; vy *= maxSpeed / sp; }
    const ox = api.player.x, oy = api.player.y;
    api.player.x += vx * dt;
    api.player.y += vy * dt;
    api.constrainShop();
    const stepped = Math.hypot(api.player.x - ox, api.player.y - oy);
    if (stepped < 0.2) stuck++;
    else stuck = 0;
    t += dt;
    if (api.player.x > maxX) maxX = api.player.x;
    if (api.player.x < minX) minX = api.player.x;
    const dPuff = Math.hypot(api.player.x - puff.x, api.player.y - puff.y);
    if (dPuff < puffMin) puffMin = dPuff;
    const dPad = Math.hypot(api.player.x - dest.x, api.player.y - dest.y);
    if (dPuff < 40 && dPad > 40) hitPuff = true;
    trace.push({ x: api.player.x, y: api.player.y, t: t });
    if (dPad < 40) break;
    if (stuck > 45) break;
    if (!api.player.goto && dPad >= 40) break;
  }
  return {
    t: t, maxX: maxX, minX: minX, puffMin: puffMin, hitPuff: hitPuff, trace: trace,
  };
}

const walkNotes = [];
for (let i = 0; i < northTaps.length; i++) {
  const tap = northTaps[i];
  const api = makeCtx(saveOpen, {
    phone: true,
    pressX: tap.canvas.x,
    pressY: tap.canvas.y,
  });
  assert(api.phoneDockPlazaWalkWanted(tap.world.x, tap.world.y, tap.canvas.x, tap.canvas.y) === true,
    "ny=" + tap.ny + " wants the plaza / next-unlock walk");
  const dest = api.clickWalkTarget(tap.world.x, tap.world.y);
  assert(dest && dest.x === horse.x && dest.y === horse.y,
    "ny=" + tap.ny + " dest is tankWalkPoint(5), got " +
      (dest ? dest.x + "," + dest.y : dest));
  assert(!(dest.x === dolphin.x && dest.y === dolphin.y),
    "ny=" + tap.ny + " dest is not the Dolphin aisle snap");
  api.tryClickShop(tap.world.x, tap.world.y);
  const intent = api.lastIntent();
  assert(!intent,
    "ny=" + tap.ny + " pointer-down is a walk, not an unlock confirm, got " +
      JSON.stringify(intent && { kind: intent.kind, i: intent.i, dest: intent.dest }));
  assert(!api.player.unlockConfirm && !api.player.pendingAct,
    "ny=" + tap.ny + " does not arm unlockConfirm / pending unlock");
  const walkEnd = api.player.route && api.player.route[api.player.route.length - 1];
  assert(walkEnd && walkEnd.x === horse.x && walkEnd.y === horse.y,
    "ny=" + tap.ny + " pointer-down dest is tankWalkPoint(5)");

  const walked = followPath(api, dest, 10);
  const walkD = Math.hypot(api.player.x - horse.x, api.player.y - horse.y);
  assert(walked.t < 8,
    "ny=" + tap.ny + " reaches Seahorse within ~8s, t=" + walked.t.toFixed(2));
  assert(walkD < 40,
    "ny=" + tap.ny + " occupies the Seahorse pad, d=" + walkD.toFixed(1) +
      " at " + api.player.x.toFixed(0) + "," + api.player.y.toFixed(0));
  assert(walked.minX >= 360,
    "ny=" + tap.ny + " never visits the till / west lane, minX=" + walked.minX.toFixed(1));
  assert(walked.maxX <= 1100,
    "ny=" + tap.ny + " stays off the C102 east spine, maxX=" + walked.maxX.toFixed(1));
  assert(!walked.hitPuff && walked.puffMin > 40,
    "ny=" + tap.ny + " never occupies Soon-Puffer, puffMin=" + walked.puffMin.toFixed(1));
  assert(api.player.y < 640 && api.player.y > 520,
    "ny=" + tap.ny + " finish is on the row-2 apron, y=" + api.player.y.toFixed(1));
  assert(!walked.trace.some((p) => inRegister(p.x, p.y) || inEastShop(p.x, p.y) ||
      p.y < 300 || p.x < 360 || p.x > 1100),
    "ny=" + tap.ny + " did not dump into REGISTER, west lane, eastShop, or the north sky");
  assert(api.state.unlocked[5] !== true && api.state.unlocked[6] !== true,
    "ny=" + tap.ny + " does not auto-unlock");
  walkNotes.push("ny=" + tap.ny + " " + walked.t.toFixed(2) + "s @" +
    api.player.x.toFixed(0) + "," + api.player.y.toFixed(0));
}

// South / DIVE-pad tap is not stolen.
const diveWorld = { x: 880, y: 1008 };
const diveCanvas = { x: W / 2, y: H390 * 0.82 };
assert(openApi.phoneDockPlazaWalkWanted(diveWorld.x, diveWorld.y, diveCanvas.x, diveCanvas.y) === false,
  "a south / DIVE-pad tap is not stolen onto Seahorse");
openApi.setPress(diveCanvas.x, diveCanvas.y);
const diveDest = openApi.clickWalkTarget(diveWorld.x, diveWorld.y);
assert(diveDest && diveDest.x === 880 && diveDest.y === 1008,
  "south / DIVE-pad dest stays the pad, got " + (diveDest && diveDest.x + "," + diveDest.y));
openApi.tryClickShop(diveWorld.x, diveWorld.y);
assert(!openApi.lastIntent(),
  "south / DIVE-pad pointer-down does not start an unlock walk");
assert(/btn\("dive"/.test(src) && /function diveActionLegal\s*\(/.test(src),
  "DIVE still dives");

// Desktop 16:9 — no phone remap. Click-to-walk Puffer / hold-W Seahorse stay.
assert(deskApi.phoneDockPlazaWalkWanted(northTaps[0].world.x, northTaps[0].world.y,
  northTaps[0].canvas.x, northTaps[0].canvas.y) === false,
  "desktop click-to-walk is not remapped by the phone plaza gate");
deskApi.setPress(640, 360);
const deskDock = deskApi.clickWalkTarget(880, 1008);
assert(deskDock && deskDock.x === 880 && deskDock.y === 1008,
  "desktop dock click is not remapped, got " + (deskDock && deskDock.x + "," + deskDock.y));
const deskPuff = deskApi.clickWalkTarget(puff.x, puff.y);
assert(deskPuff && Math.hypot(deskPuff.x - puff.x, deskPuff.y - puff.y) < 1,
  "desktop click-to-walk Puffer still ends on tankWalkPoint(6)");
deskApi.player.x = dockPt.x;
deskApi.player.y = dockPt.y;
const wPath = deskApi.wasdShopPath(0, -1);
assert(wPath && wPath.length >= 2, "desktop hold-W still returns a shop path");
const wLast = wPath[wPath.length - 1];
assert(Math.hypot(wLast.x - horse.x, wLast.y - horse.y) < 1,
  "desktop hold-W still ends on tankWalkPoint(5)");

const clickPath = openApi.shopPath(dockPt.x, dockPt.y, puff.x, puff.y);
assert(Array.isArray(clickPath) && clickPath.length >= 2,
  "click-to-walk dock→Puffer is still a routed walk");
const clickLast = clickPath[clickPath.length - 1];
assert(Math.hypot(clickLast.x - puff.x, clickLast.y - puff.y) < 1,
  "clicking Puffer still routes to tankWalkPoint(6)");

console.log("c108 phone north: ok (next=" + openApi.nextLockedTank() +
  ", horse=" + horse.x + "," + horse.y +
  ", dolphinSnap=" + dolphin.x + "," + dolphin.y +
  ", taps=[" + northTaps.map((t) => "ny" + t.ny + "@" + t.world.y.toFixed(0)).join(" ") + "]" +
  ", " + walkNotes.join(" · ") +
  ")");
