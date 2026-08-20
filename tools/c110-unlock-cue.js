// C110 — after a C109 walk occupies the next locked pad the ribbon
// dies and the fat DIVE chip is the only verb. Player is on the
// Seahorse pad with $4000, lock plate says Unlock $2200, and the
// next obvious tap is DIVE (south, away from the bowl).
// C110 pins a fat wood TAP TO UNLOCK / UNLOCK $N pier-board to
// that locked bowl (C100 tank-local — not Crab / Goldfish) and
// the ribbon says tap the lock. Tapping the board / lock plate
// is the explicit buy. Walk-to-bowl still does not buy.
// Phone 390×844 first. Isolated SAVE_KEY. Turtle unlocked,
// Seahorse locked, $4000. Continue.
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

assert(/Aqua Bay · loop 110/.test(src), "title/pause stamp is loop 110");
assert(!/Aqua Bay · loop 109/.test(src), "loop 109 stamp is gone");
assert(/loop 110 tap the lock/.test(src),
  "C110 names the tap-the-lock leftover");
assert(/loop 109 walk is not a buy/.test(src),
  "C109 walk-is-not-a-buy comment stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

assert(/function walkToShopBowls\s*\(/.test(src),
  "walkToShopBowls is the plaza walk (not a buy)");
assert(/function confirmUnlockWalk\s*\(/.test(src),
  "confirmUnlockWalk is the explicit bowl / lock tap");
assert(/player\.unlockConfirm !== i/.test(src),
  "tryUnlockOnArrival requires an explicit unlock confirm");
assert(/function unlockCueLegal\s*\(/.test(src),
  "unlockCueLegal gates the occupy-and-afford board");
assert(/function unlockCueBox\s*\(/.test(src),
  "unlockCueBox pins the board in screen space");
assert(/function unlockPadGoal\s*\(/.test(src),
  "unlockPadGoal is the occupy ribbon");
assert(/function drawUnlockWalkCue\s*\(/.test(src),
  "drawUnlockWalkCue paints the unlock board");
assert(/function plazaTankStealsDockTap\s*\(/.test(src),
  "plazaTankStealsDockTap stays");
assert(/function phoneDockPlazaWalkWanted\s*\(/.test(src),
  "phoneDockPlazaWalkWanted stays");
assert(/function hideDockWalkHint\s*\(/.test(src),
  "hideDockWalkHint stays");
assert(/drawPierBoardChip\(b\.x, b\.y, b\.w, b\.h, "↑ SHOP"/.test(src),
  "↑ SHOP chip stays");
assert(/catalogChipLabel/.test(src) && /BOOK/.test(extractFn(src, "catalogChipLabel") || ""),
  "catalog HUD chip is BOOK while ↑ SHOP is showing");

const clickSrc = extractFn(src, "clickWalkTarget") || "";
const trySrc = extractFn(src, "tryClickShop") || "";
const onUi = extractFn(src, "onUI") || "";
const goalSrc = extractFn(src, "currentGoal") || "";
const drawSrc = extractFn(src, "drawUnlockWalkCue") || "";
const boxSrc = extractFn(src, "unlockCueBox") || "";
const legalSrc = extractFn(src, "unlockCueLegal") || "";

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
  "north remap walks via walkToShopBowls, not intentWalk unlock");
assert(!/intentWalk\("unlock", dest, n\)/.test(trySrc),
  "tryClickShop plaza remap no longer arms unlock");
assert(/walkToShopBowls\(\)/.test(onUi),
  "↑ SHOP chip walks via walkToShopBowls");
assert(/confirmUnlockWalk\(tankWalkPoint\(tankHit\)/.test(trySrc),
  "explicit locked-bowl tap still confirms unlock");
assert(/id === "goto-unlock"/.test(onUi),
  "onUI handles the TAP TO UNLOCK board");
assert(/confirmUnlockWalk\(tankWalkPoint\(n\), n\)/.test(onUi),
  "goto-unlock is confirmUnlockWalk — an explicit buy");
assert(/unlockCueLegal\(\)/.test(goalSrc),
  "currentGoal consults unlockCueLegal before the DIVE-dock fallback");
const goalUnlock = goalSrc.indexOf("unlockCueLegal");
const goalDive = goalSrc.indexOf("Walk to the glowing DIVE dock");
assert(goalUnlock >= 0 && goalDive >= 0 && goalUnlock < goalDive,
  "tap-the-lock ribbon wins over Walk to the glowing DIVE dock");
assert(/Tap the lock to unlock/.test(src),
  "ribbon copy says Tap the lock to unlock <species>");
assert(!/Walk to the glowing DIVE dock/.test(extractFn(src, "unlockPadGoal") || ""),
  "occupy ribbon does not bring back Walk to the glowing DIVE dock");
assert(/drawPierBoardChip\(chip\.x, chip\.y, chip\.w, chip\.h, unlockCueLabel\(\)/.test(drawSrc),
  "unlock cue paints through drawPierBoardChip — not a cyan pill");
assert(/btn\("goto-unlock", chip\.x, chip\.y, chip\.w, chip\.h\)/.test(drawSrc),
  "unlock cue hitbox is goto-unlock");
assert(/TAP TO UNLOCK/.test(src) && /UNLOCK \$/.test(extractFn(src, "unlockCueLabel") || ""),
  "board copy is TAP TO UNLOCK / UNLOCK $N");
assert(/t\.x \+ TANK_W \/ 2, t\.y \+ TANK_H \* 0\.42/.test(boxSrc),
  "chip anchor is the next locked tank world→screen point");
assert(/clamp\(ts\.x, tw \/ 2 \+ 16, W - tw \/ 2 - 16\)/.test(boxSrc),
  "pier-board x is the locked tank screen x, not W/2");
assert(/wantY = ts\.y - ch \* 0\.65/.test(boxSrc),
  "pier-board y sits on the locked bowl, not a HUD mid-band");
assert(/phoneCss\(\s*36\s*\)/.test(boxSrc),
  "390-first unlock hitbox stays 36 CSS tall");
assert(/nearStockPad\(n\)/.test(legalSrc),
  "cue hides if they walk off the pad");
assert(/state\.money < SPECIES\[n\]\.unlock/.test(legalSrc),
  "cue hides if they cannot afford it");

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
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
assert(/unlock:\s*2200/.test(src), "Seahorse unlock stays $2200");
assert(/unlock:\s*1400/.test(src), "Sea Turtle unlock stays $1400");
assert(/unlock:\s*0/.test(src) && /unlock:\s*60/.test(src),
  "original 5 unlock prices stay");
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/C76 — one tank neighborhood around the aisle/.test(src), "C76 cluster stays");
assert(/const PLAZA_CAM_CEILING\s*=\s*520/.test(src), "plaza camera ceiling stays 520");
assert(/const DOCK_CAM_FLOOR\s*=\s*1000/.test(src), "dock camera floor stays 1000");
assert(/function desktopStage\s*\(/.test(src), "desktopStage stays");
assert(/btn\("dive"/.test(src) && /function diveActionLegal\s*\(/.test(src),
  "DIVE still dives");
assert(/C47/.test(src) || /camEase/.test(src), "C47 camera ease stays");

function desktopStage(w, h) { return w >= 880 && w >= h * 0.92; }
assert(desktopStage(1280, 720), "1280×720 is a desktop stage");
assert(!desktopStage(390, 844), "390×844 is not a desktop stage");

const TANK_W = 210, TANK_H = 156, CORE_SPECIES = 5, SPECIES_N = 13;
const STOCK_PAD = 64;
const TANK_POS = [
  { x: 340, y: 164 }, { x: 558, y: 164 }, { x: 776, y: 164 },
  { x: 994, y: 164 }, { x: 1212, y: 164 },
  { x: 340, y: 380 }, { x: 558, y: 380 }, { x: 776, y: 380 }, { x: 994, y: 380 },
  { x: 340, y: 596 }, { x: 558, y: 596 }, { x: 776, y: 596 }, { x: 994, y: 596 },
];
assert(TANK_POS[5].x === 340 && TANK_POS[5].y === 380, "Seahorse stays C76 {340,380}");
assert(TANK_POS[6].x === 558 && TANK_POS[6].y === 380, "Puffer stays C76 {558,380}");
assert(TANK_POS[9].x === 340 && TANK_POS[9].y === 596, "Crab stays C76 {340,596}");
assert(TANK_POS[2].x === 776 && TANK_POS[2].y === 164, "Goldfish stays C76 {776,164}");

const REGISTER = { x: 168, y: 500, w: 150, h: 110 };
const KIOSK = { x: 1280, y: 480, w: 170, h: 130 };
const WELCOME = { x: 140, y: 780, w: 156, h: 86 };
const AISLE = { x: 802, y: 760, w: 156, h: 160 };
const DIVE_ZONE = { x: 520, y: 980, w: 720, h: 160 };
const SPECIES = new Array(SPECIES_N);
SPECIES[2] = { name: "Goldfish", unlock: 220, color: "#e8a03a" };
SPECIES[5] = { name: "Seahorse", unlock: 2200, color: "#e8a03a" };
SPECIES[6] = { name: "Puffer", unlock: 3200, color: "#7ad08a" };
SPECIES[9] = { name: "Crab", unlock: 4800, color: "#c06040" };
const EAST_SHOP = { x: 1256, y: 380, w: 228, h: 286 };
const DOCK_CAM_FLOOR = 1000;
const W = 1280;
const PIN_H = 720;

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
assert(saveOpen.money === 4000, "seed money is $4000");

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
  "clearWalk", "nearRect", "nearStockPad", "tryUnlockOnArrival",
  "confirmUnlockWalk", "intentWalk", "canPerformAct", "performPendingAct",
  "unlockPadOccupied", "unlockCueLegal", "unlockCueLabel", "unlockCueBox",
  "unlockPadGoal",
];
const fns = {};
for (let i = 0; i < names.length; i++) {
  fns[names[i]] = extractFn(src, names[i]);
  assert(fns[names[i]], names[i] + " is extractable from game.js");
}

function phoneCss(cssPx) { return Math.max(8, Math.round(cssPx * W / 390)); }

function makeCtx(save, opts) {
  opts = opts || {};
  const phone = opts.phone !== false;
  const sandbox = {
    TANK_POS: TANK_POS, TANK_W: TANK_W, TANK_H: TANK_H, STOCK_PAD: STOCK_PAD,
    REGISTER: REGISTER, KIOSK: KIOSK, WELCOME: WELCOME, AISLE: AISLE,
    DIVE_ZONE: DIVE_ZONE, SPECIES: SPECIES, CORE_SPECIES: CORE_SPECIES,
    DOCK_CAM_FLOOR: DOCK_CAM_FLOOR, W: W,
    state: {
      unlocked: save.unlocked.slice(),
      money: save.money,
      scene: "shop",
      mode: "play",
      unlockBanner: null,
      stock: new Array(SPECIES_N).fill(0),
    },
    player: {
      x: 880, y: 920, radius: 16, goto: null, route: null,
      pendingAct: null, unlockConfirm: null,
    },
    keys: null,
    cam: { x: 880, y: 1000, z: 1, yFloor: DOCK_CAM_FLOOR },
    mouse: { pressX: opts.pressX || 640, pressY: opts.pressY || 700 },
    lastIntent: null,
    lastBuy: null,
    clamp: clamp,
    toast: function () {},
    nope: function () {},
    Math: Math,
    portraitStage: function () { return !!phone; },
    thumbCopy: function () { return !!phone; },
    bagHasStockable: function () { return false; },
    cashNeedsCollect: function () { return false; },
    tillWaiting: function () { return false; },
    inTillGlow: function () { return false; },
    dockCameraReady: function () { return !!(sandbox.cam && sandbox.cam.y >= DOCK_CAM_FLOOR - 24); },
    plazaCameraReady: function () { return !!(sandbox.cam && sandbox.cam.y <= 520 + 36); },
    actionFloor: function () { return opts.floor || PIN_H; },
    hudSafeTop: function () { return phone ? 120 : 12; },
    topHudFloor: function () { return phone ? 180 : 28; },
    phoneCss: phoneCss,
    actionBtnSize: function () {
      return phone
        ? { w: phoneCss(120), h: phoneCss(48), pad: phoneCss(10) }
        : { w: 340, h: 52, pad: 18 };
    },
    worldToScreen: function (x, y) {
      const z = (sandbox.cam && sandbox.cam.z) || 1;
      return {
        x: (x - sandbox.cam.x) * z + W / 2,
        y: (y - sandbox.cam.y) * z + PIN_H / 2,
      };
    },
    inDiveZone: function () { return false; },
    nearDivePad: function () { return sandbox.player.y > 870; },
    stockableTankTarget: function () { return null; },
    registerWalkPoint: function () { return { x: 248, y: 560 }; },
    bagCanStock: function () { return false; },
    diveActionLegal: function () { return false; },
    cueDiveWalk: function () {},
    stockTank: function () {},
    collectCash: function () {},
    beginDive: function () {},
    buyTank: function (i) {
      if (sandbox.state.unlocked[i]) return;
      const c = SPECIES[i].unlock;
      if (sandbox.state.money < c) return;
      sandbox.state.money -= c;
      sandbox.state.unlocked[i] = true;
      sandbox.state.unlockBanner = { name: SPECIES[i].name, life: 0.9 };
      sandbox.lastBuy = i;
    },
  };
  const body = names.map((n) => fns[n]).join("\n") +
    "\nthis.__api = { galleryOpen, tankWalkPoint, shopPath, wasdShopPath," +
    " constrainShop, galleryTankDest, snapToShopWalk, nextLockedTank," +
    " nextUnlockWalkDest, hideDockWalkHint, phoneDockPlazaWalkWanted," +
    " tankAtWorld, plazaTankStealsDockTap, walkTankAtWorld," +
    " clickWalkTarget, tryClickShop, walkToShopBowls, setWalkDest," +
    " tryUnlockOnArrival, confirmUnlockWalk, intentWalk, canPerformAct," +
    " performPendingAct, nearStockPad, unlockPadOccupied, unlockCueLegal," +
    " unlockCueLabel, unlockCueBox, unlockPadGoal," +
    " shopDockWalk, shopWalkRects, player, state, cam, mouse };";
  vm.runInNewContext(body, sandbox);
  sandbox.__api.lastIntent = function () { return sandbox.lastIntent; };
  sandbox.__api.lastBuy = function () { return sandbox.lastBuy; };
  sandbox.__api.setPress = function (x, y) {
    sandbox.mouse.pressX = x;
    sandbox.mouse.pressY = y;
  };
  sandbox.__api.arrive = function () {
    if (sandbox.__api.performPendingAct()) return true;
    sandbox.__api.tryUnlockOnArrival();
    return !!sandbox.lastBuy;
  };
  sandbox.__api.tapUnlockCue = function () {
    const n = sandbox.__api.nextLockedTank();
    if (n < 0) return false;
    return sandbox.__api.confirmUnlockWalk(sandbox.__api.tankWalkPoint(n), n);
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
assert(horse.x === 445 && horse.y === 568, "Seahorse stand is south of the bowl");
assert(puff.x === 663 && puff.y === 568, "Puffer stand stays south of the bowl");

function inEastShop(x, y) {
  return x >= EAST_SHOP.x && x <= EAST_SHOP.x + EAST_SHOP.w &&
    y >= EAST_SHOP.y && y <= EAST_SHOP.y + EAST_SHOP.h;
}
function inRegister(x, y) {
  return x >= REGISTER.x && x <= REGISTER.x + REGISTER.w &&
    y >= REGISTER.y && y <= REGISTER.y + REGISTER.h;
}

const cssW = 390, cssH = 844;
const H390 = Math.max(960, Math.round(W * cssH / cssW));
const camZ = H390 / 860;
function screenToWorld(sx, sy, cam) {
  return { x: (sx - W / 2) / camZ + cam.x, y: (sy - H390 / 2) / camZ + cam.y };
}

const tapNy = 0.18;
const tapCanvas = { x: W / 2, y: tapNy * H390 };
const tapWorld = screenToWorld(tapCanvas.x, tapCanvas.y, { x: 880, y: 1000 });

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

function assertAlleyWalk(api, walked, label) {
  const walkD = Math.hypot(api.player.x - horse.x, api.player.y - horse.y);
  assert(walked.t < 8, label + " reaches Seahorse within ~8s, t=" + walked.t.toFixed(2));
  assert(walkD < 40,
    label + " occupies the Seahorse pad, d=" + walkD.toFixed(1) +
      " at " + api.player.x.toFixed(0) + "," + api.player.y.toFixed(0));
  assert(walked.minX >= 360, label + " never visits the till / west lane, minX=" + walked.minX.toFixed(1));
  assert(walked.maxX <= 1100, label + " stays off the C102 east spine, maxX=" + walked.maxX.toFixed(1));
  assert(!walked.hitPuff && walked.puffMin > 40,
    label + " never occupies Soon-Puffer, puffMin=" + walked.puffMin.toFixed(1));
  assert(api.player.y < 640 && api.player.y > 520,
    label + " finish is on the row-2 apron, y=" + api.player.y.toFixed(1));
  assert(!walked.trace.some((p) => inRegister(p.x, p.y) || inEastShop(p.x, p.y) ||
      p.y < 300 || p.x < 360 || p.x > 1100),
    label + " did not dump into REGISTER, west lane, eastShop, or the north sky");
}

function assertStillLocked(api, label) {
  assert(api.state.unlocked[5] !== true, label + " leaves Seahorse locked");
  assert(api.state.money === 4000, label + " does not spend, money=" + api.state.money);
  assert(!api.state.unlockBanner,
    label + " has no SEAHORSE UNLOCKED banner");
  assert(api.lastBuy() == null, label + " did not call buyTank");
}

function tankScreenBox(i, cam) {
  const z = cam.z || 1;
  return {
    x: (TANK_POS[i].x - cam.x) * z + W / 2,
    y: (TANK_POS[i].y - cam.y) * z + PIN_H / 2,
    w: TANK_W * z,
    h: TANK_H * z,
  };
}
function boxesOverlap(a, b, pad) {
  const p = pad || 0;
  return a.x < b.x + b.w + p && a.x + a.w > b.x - p &&
    a.y < b.y + b.h + p && a.y + a.h > b.y - p;
}

function assertUnlockCueOnSeahorse(api, label) {
  assert(api.unlockPadOccupied() === true, label + " occupies the next locked pad");
  assert(api.unlockCueLegal() === true, label + " unlock cue is legal with $4000");
  assert(/TAP TO UNLOCK/.test(api.unlockCueLabel()) || /UNLOCK \$2200/.test(api.unlockCueLabel()),
    label + " board copy is TAP TO UNLOCK / UNLOCK $2200, got " + api.unlockCueLabel());
  const goal = api.unlockPadGoal();
  assert(goal && /Tap the lock to unlock Seahorse/.test(goal.text),
    label + " ribbon says tap the lock to unlock Seahorse, got " + (goal && goal.text));
  assert(!/Walk to the glowing DIVE dock/.test(goal.text),
    label + " ribbon does not bring back Walk to the glowing DIVE dock");
  api.cam.x = 445;
  api.cam.y = 420;
  api.cam.z = 1;
  const chip = api.unlockCueBox();
  assert(chip && chip.tank === 5, label + " cue is keyed to Seahorse");
  const horseBox = tankScreenBox(5, api.cam);
  const crabBox = tankScreenBox(9, api.cam);
  const goldBox = tankScreenBox(2, api.cam);
  const puffBox = tankScreenBox(6, api.cam);
  const chipCx = chip.x + chip.w / 2;
  const horseCx = horseBox.x + horseBox.w / 2;
  const goldCx = goldBox.x + goldBox.w / 2;
  const crabCy = crabBox.y + crabBox.h / 2;
  const chipCy = chip.y + chip.h / 2;
  assert(Math.abs(chipCx - horseCx) < Math.abs(chipCx - goldCx),
    label + " board is on Seahorse, not Goldfish");
  assert(Math.abs(chipCy - (horseBox.y + horseBox.h * 0.42)) < Math.abs(chipCy - crabCy),
    label + " board sits on Seahorse, not Crab");
  assert(!boxesOverlap(chip, goldBox, 0),
    label + " board does not cover Goldfish");
  assert(!boxesOverlap(chip, crabBox, 0),
    label + " board does not cover Crab");
  assert(!boxesOverlap(chip, puffBox, 0),
    label + " board does not cover Puffer");
  assert(boxesOverlap(chip, { x: horseBox.x, y: chip.y, w: horseBox.w, h: chip.h }, 24),
    label + " board sits over the Seahorse column");
}

// 1) Stamp loop 110 is asserted above.
// 2) ny 0.18 / ↑ SHOP — walk, arrive, no buy, cue on Seahorse.
const northApi = makeCtx(saveOpen, {
  phone: true,
  pressX: tapCanvas.x,
  pressY: tapCanvas.y,
});
assert(northApi.phoneDockPlazaWalkWanted(tapWorld.x, tapWorld.y, tapCanvas.x, tapCanvas.y) === true,
  "ny=0.18 wants the plaza / next-unlock walk");
const northDest = northApi.clickWalkTarget(tapWorld.x, tapWorld.y);
assert(northDest && northDest.x === horse.x && northDest.y === horse.y,
  "ny=0.18 dest is tankWalkPoint(5)");
northApi.tryClickShop(tapWorld.x, tapWorld.y);
assert(!northApi.player.unlockConfirm && !northApi.player.pendingAct,
  "ny=0.18 does not arm unlockConfirm / pending unlock");
const northWalk = followPath(northApi, northDest, 10);
assertAlleyWalk(northApi, northWalk, "ny=0.18");
northApi.arrive();
assertStillLocked(northApi, "ny=0.18 arrival");
assertUnlockCueOnSeahorse(northApi, "ny=0.18 occupy");

const shopApi = makeCtx(saveOpen, { phone: true });
assert(shopApi.walkToShopBowls() === true, "↑ SHOP / walkToShopBowls starts");
assert(!shopApi.player.unlockConfirm && !shopApi.player.pendingAct,
  "↑ SHOP does not arm unlockConfirm / pending unlock");
const shopDest = shopApi.nextUnlockWalkDest();
const shopWalk = followPath(shopApi, shopDest, 10);
assertAlleyWalk(shopApi, shopWalk, "↑ SHOP");
shopApi.arrive();
assertStillLocked(shopApi, "↑ SHOP arrival");
assertUnlockCueOnSeahorse(shopApi, "↑ SHOP occupy");

// Hide if they walk away or cannot afford.
const awayX = shopApi.player.x, awayY = shopApi.player.y;
shopApi.player.x = dockPt.x;
shopApi.player.y = dockPt.y;
assert(shopApi.unlockCueLegal() === false, "walk away hides the unlock cue");
shopApi.player.x = awayX;
shopApi.player.y = awayY;
shopApi.state.money = 100;
assert(shopApi.unlockCueLegal() === false, "broke hide the unlock cue");
shopApi.state.money = 4000;
assert(shopApi.unlockCueLegal() === true, "re-afforded cue returns while still on the pad");

// 3) Tap the cue / lock: then unlock fires ($1800, banner).
northApi.setPress(W / 2, PIN_H * 0.35);
assert(northApi.tapUnlockCue() === true, "tapping the TAP TO UNLOCK board buys");
assert(northApi.state.unlocked[5] === true,
  "explicit cue tap unlocks Seahorse when they can afford it");
assert(northApi.state.money === 1800,
  "explicit cue tap spends $2200, money=" + northApi.state.money);
assert(northApi.state.unlockBanner && /seahorse/i.test(northApi.state.unlockBanner.name),
  "explicit cue tap may show the Seahorse unlock banner");
assert(northApi.unlockCueLegal() === false, "cue hides once Seahorse is unlocked");

const lockApi = makeCtx(saveOpen, { phone: true });
lockApi.player.x = horse.x;
lockApi.player.y = horse.y;
lockApi.cam.x = 445;
lockApi.cam.y = 520;
assert(lockApi.unlockCueLegal() === true, "standing on the pad with $4000 shows the cue");
lockApi.setPress(W / 2, PIN_H * 0.35);
const bowl = { x: TANK_POS[5].x + TANK_W / 2, y: TANK_POS[5].y + TANK_H / 2 };
assert(lockApi.walkTankAtWorld(bowl.x, bowl.y) === 5, "bowl tap hits Seahorse");
assert(lockApi.phoneDockPlazaWalkWanted(bowl.x, bowl.y, W / 2, PIN_H * 0.35) === false,
  "standing at the pad, a bowl tap is not remapped as a plaza walk");
lockApi.tryClickShop(bowl.x, bowl.y);
assert(lockApi.state.unlocked[5] === true,
  "explicit Seahorse lock-plate tap unlocks when they can afford it");
assert(lockApi.state.money === 1800,
  "explicit lock tap spends $2200, money=" + lockApi.state.money);

// 4) South / DIVE-pad tap is not stolen. DIVE still dives.
const diveWorld = { x: 880, y: 1008 };
const diveCanvas = { x: W / 2, y: H390 * 0.82 };
assert(openApi.phoneDockPlazaWalkWanted(diveWorld.x, diveWorld.y, diveCanvas.x, diveCanvas.y) === false,
  "a south / DIVE-pad tap is not stolen onto Seahorse");
openApi.setPress(diveCanvas.x, diveCanvas.y);
const diveDest = openApi.clickWalkTarget(diveWorld.x, diveWorld.y);
assert(diveDest && diveDest.x === 880 && diveDest.y === 1008,
  "south / DIVE-pad dest stays the pad, got " + (diveDest && diveDest.x + "," + diveDest.y));
openApi.tryClickShop(diveWorld.x, diveWorld.y);
assert(!openApi.player.unlockConfirm,
  "south / DIVE-pad pointer-down does not arm an unlock");

// 5) Desktop 16:9 hold-W reaches Seahorse without unlocking.
//    Click-to-walk Puffer still works.
assert(deskApi.phoneDockPlazaWalkWanted(tapWorld.x, tapWorld.y, tapCanvas.x, tapCanvas.y) === false,
  "desktop click-to-walk is not remapped by the phone plaza gate");
deskApi.player.x = dockPt.x;
deskApi.player.y = dockPt.y;
const wPath = deskApi.wasdShopPath(0, -1);
assert(wPath && wPath.length >= 2, "desktop hold-W still returns a shop path");
const wLast = wPath[wPath.length - 1];
assert(Math.hypot(wLast.x - horse.x, wLast.y - horse.y) < 1,
  "desktop hold-W still ends on tankWalkPoint(5)");
const deskWalk = followPath(deskApi, horse, 10);
assertAlleyWalk(deskApi, deskWalk, "desktop hold-W");
deskApi.arrive();
assertStillLocked(deskApi, "desktop hold-W arrival");
assert(deskApi.unlockCueLegal() === true,
  "desktop hold-W occupy still shows an unlock board (click may unlock)");
assert(deskApi.unlockCueLabel().indexOf("UNLOCK $2200") >= 0,
  "desktop board copy is UNLOCK $2200");

const clickPath = openApi.shopPath(dockPt.x, dockPt.y, puff.x, puff.y);
assert(Array.isArray(clickPath) && clickPath.length >= 2,
  "click-to-walk dock→Puffer is still a routed walk");
const clickLast = clickPath[clickPath.length - 1];
assert(Math.hypot(clickLast.x - puff.x, clickLast.y - puff.y) < 1,
  "clicking Puffer still routes to tankWalkPoint(6)");

console.log("c110 unlock cue: ok (next=" + openApi.nextLockedTank() +
  ", horse=" + horse.x + "," + horse.y +
  ", ny18=" + northWalk.t.toFixed(2) + "s cue@" +
  (northApi.unlockCueBox() && northApi.unlockCueBox().tank) +
  " locked→$" + northApi.state.money +
  ", shop=" + shopWalk.t.toFixed(2) + "s" +
  ", holdW=" + deskWalk.t.toFixed(2) + "s locked" +
  ")");
