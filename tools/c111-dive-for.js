// C111 — after a C110 TAP TO UNLOCK buy the lock board and
// lock-ribbon vanish on an empty bowl (bag 0/5). Preview fish
// swim; the plate says empty + a 0 badge; the only fat verb is
// DIVE at the south thumb. C111 pins a fat wood DIVE FOR
// SEAHORSE / TAP TO DIVE pier-board to that empty unlocked bowl
// (C100 tank-local — not Crab / Clownfish). Ribbon: DIVE to
// catch a Seahorse. Tapping the board walks to the DIVE pad
// (C86 dash) — do not auto-dive on unlock and do not auto-buy
// the next lock. If the bag already holds that species, keep
// C100 tap-to-stock (one board). Hide once they leave the pad
// for a while, the bowl has stock, or they enter the ocean.
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

assert(/Aqua Bay · loop 111/.test(src), "title/pause stamp is loop 111");
assert(!/Aqua Bay · loop 110/.test(src), "loop 110 stamp is gone");
assert(/loop 111 dive for the new bowl/.test(src),
  "C111 names the empty-bowl leftover");
assert(/loop 110 tap the lock/.test(src),
  "C110 tap-the-lock leftover stays");
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
assert(/function diveForCueLegal\s*\(/.test(src),
  "diveForCueLegal gates the empty-unlocked-bowl board");
assert(/function diveForCueBox\s*\(/.test(src),
  "diveForCueBox pins the board in screen space");
assert(/function diveForPadGoal\s*\(/.test(src),
  "diveForPadGoal is the dive-for-species ribbon");
assert(/function drawDiveForWalkCue\s*\(/.test(src),
  "drawDiveForWalkCue paints the dive-for board");
assert(/function armDiveForTank\s*\(/.test(src),
  "armDiveForTank remembers the just-unlocked bowl");
assert(/function tickDiveForCue\s*\(/.test(src),
  "tickDiveForCue hides after they leave the pad");
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
const drawSrc = extractFn(src, "drawDiveForWalkCue") || "";
const boxSrc = extractFn(src, "diveForCueBox") || "";
const legalSrc = extractFn(src, "diveForCueLegal") || "";
const goalFn = extractFn(src, "diveForPadGoal") || "";
const buySrc = extractFn(src, "buyTank") || "";

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
  "onUI still handles the TAP TO UNLOCK board");
assert(/id === "goto-dive-for"/.test(onUi),
  "onUI handles the DIVE FOR board");
assert(/intentWalk\("dive", dockWalkPoint\(\)\)/.test(onUi),
  "goto-dive-for fires the same DIVE-chip walk");
assert(/diveActionLegal\(\)\) beginDive\(\)/.test(onUi),
  "goto-dive-for dives only when already on the pad");
assert(!/beginDive\(\)/.test(buySrc),
  "buyTank does not auto-dive on unlock");
assert(/armDiveForTank\(i\)/.test(buySrc),
  "buyTank arms the dive-for cue, does not buy the next lock");
assert(/diveForCueLegal\(\)/.test(goalSrc),
  "currentGoal consults diveForCueLegal after the unlock board");
const goalUnlock = goalSrc.indexOf("if (unlockCueLegal())");
const goalDiveFor = goalSrc.indexOf("if (diveForCueLegal())");
const goalDive = goalSrc.lastIndexOf("Walk to the glowing DIVE dock");
assert(goalUnlock >= 0 && goalDiveFor >= 0 && goalUnlock < goalDiveFor,
  "tap-the-lock ribbon still wins while the bowl is locked");
assert(goalDiveFor >= 0 && goalDive >= 0 && goalDiveFor < goalDive,
  "dive-for-species ribbon wins over Walk to the glowing DIVE dock");
assert(/DIVE to catch/.test(goalFn),
  "ribbon copy is DIVE to catch a <species>");
assert(!/Walk to the glowing DIVE dock/.test(goalFn),
  "dive-for ribbon does not bring back Walk to the glowing DIVE dock");
assert(!/Tap the lock/.test(goalFn),
  "dive-for ribbon does not bring back Tap the lock");
assert(/drawPierBoardChip\(chip\.x, chip\.y, chip\.w, chip\.h, diveForCueLabel\(\)/.test(drawSrc),
  "dive-for cue paints through drawPierBoardChip — not a cyan pill");
assert(/btn\("goto-dive-for", chip\.x, chip\.y, chip\.w, chip\.h\)/.test(drawSrc),
  "dive-for cue hitbox is goto-dive-for");
assert(/DIVE FOR /.test(extractFn(src, "diveForCueLabel") || "") && /TAP TO DIVE/.test(src),
  "board copy is DIVE FOR <SPECIES> / TAP TO DIVE");
assert(/t\.x \+ TANK_W \/ 2, t\.y \+ TANK_H \* 0\.42/.test(boxSrc),
  "chip anchor is the just-unlocked tank world→screen point");
assert(/clamp\(ts\.x, tw \/ 2 \+ 16, W - tw \/ 2 - 16\)/.test(boxSrc),
  "pier-board x is the unlocked tank screen x, not W/2");
assert(/wantY = ts\.y - ch \* 0\.65/.test(boxSrc),
  "pier-board y sits on the unlocked bowl, not a HUD mid-band");
assert(/phoneCss\(\s*36\s*\)/.test(boxSrc),
  "390-first dive-for hitbox stays 36 CSS tall");
assert(/state\.bag\.some/.test(legalSrc),
  "cue yields to C100 tap-to-stock when the bag holds that species");
assert(/state\.stock\[i\]/.test(legalSrc),
  "cue hides once the bowl has stock");

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
assert(/const DIVE_WALK_SPEED\s*=\s*480/.test(src), "C86 dash speed stays 480");
assert(/232 \+ state\.speedLv \* 38 \+ firstBump/.test(src),
  "planted / tap-to-walk base speed stays 232");

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
const DIVE_FOR_AWAY = 2.8;

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
  "unlockPadGoal", "dockWalkPoint",
  "diveForTankIndex", "armDiveForTank", "clearDiveForTank", "tickDiveForCue",
  "diveForCueLegal", "diveForCueLabel", "diveForCueBox", "diveForPadGoal",
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
    DOCK_CAM_FLOOR: DOCK_CAM_FLOOR, W: W, DIVE_FOR_AWAY: DIVE_FOR_AWAY,
    state: {
      unlocked: save.unlocked.slice(),
      money: save.money,
      scene: "shop",
      mode: "play",
      unlockBanner: null,
      stock: new Array(SPECIES_N).fill(0),
      bag: [],
      diveForTank: null,
      diveForAway: 0,
      pendingScene: null,
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
    beganDive: false,
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
    inDiveZone: function () {
      return sandbox.player.x > DIVE_ZONE.x && sandbox.player.x < DIVE_ZONE.x + DIVE_ZONE.w &&
        sandbox.player.y > DIVE_ZONE.y - 40 && sandbox.player.y < DIVE_ZONE.y + DIVE_ZONE.h;
    },
    nearDivePad: function () { return sandbox.player.y > 870; },
    stockableTankTarget: function () { return null; },
    registerWalkPoint: function () { return { x: 248, y: 560 }; },
    bagCanStock: function () { return false; },
    diveWalkLegal: function () {
      return sandbox.state.mode === "play" && sandbox.state.scene === "shop";
    },
    diveActionLegal: function () {
      return sandbox.diveWalkLegal() && (sandbox.inDiveZone() || sandbox.nearDivePad());
    },
    cueDiveWalk: function () {},
    stockTank: function () {},
    collectCash: function () {},
    beginDive: function () { sandbox.beganDive = true; },
    buyTank: function (i) {
      if (sandbox.state.unlocked[i]) return;
      const c = SPECIES[i].unlock;
      if (sandbox.state.money < c) return;
      sandbox.state.money -= c;
      sandbox.state.unlocked[i] = true;
      sandbox.state.unlockBanner = { name: SPECIES[i].name, life: 0.9 };
      sandbox.lastBuy = i;
      sandbox.armDiveForTank(i);
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
    " unlockCueLabel, unlockCueBox, unlockPadGoal, dockWalkPoint," +
    " diveForTankIndex, armDiveForTank, clearDiveForTank, tickDiveForCue," +
    " diveForCueLegal, diveForCueLabel, diveForCueBox, diveForPadGoal," +
    " shopDockWalk, shopWalkRects, player, state, cam, mouse };";
  vm.runInNewContext(body, sandbox);
  sandbox.armDiveForTank = sandbox.__api.armDiveForTank;
  sandbox.__api.lastIntent = function () { return sandbox.lastIntent; };
  sandbox.__api.lastBuy = function () { return sandbox.lastBuy; };
  sandbox.__api.beganDive = function () { return sandbox.beganDive; };
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
  sandbox.__api.tapDiveForCue = function () {
    if (sandbox.state.mode === "play" && sandbox.diveActionLegal()) {
      sandbox.beginDive();
      return "dived";
    }
    if (sandbox.state.mode === "play" && sandbox.diveWalkLegal()) {
      return sandbox.__api.intentWalk("dive", sandbox.__api.dockWalkPoint());
    }
    return false;
  };
  sandbox.__api.tapDiveChip = function () {
    return sandbox.__api.tapDiveForCue();
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
const divePad = openApi.dockWalkPoint();
assert(horse.x === 445 && horse.y === 568, "Seahorse stand is south of the bowl");
assert(puff.x === 663 && puff.y === 568, "Puffer stand stays south of the bowl");
assert(divePad.x === 880 && divePad.y === 1008, "DIVE pad stays 880,1008");

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

function followQueuedWalk(api, dest, maxT) {
  const dt = 1 / 60, maxSpeed = 480, accel = 3200;
  let vx = 0, vy = 0, t = 0, stuck = 0;
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
    const dPad = Math.hypot(api.player.x - dest.x, api.player.y - dest.y);
    if (dPad < 40) break;
    if (stuck > 45) break;
    if (!api.player.goto && dPad >= 40) break;
  }
  return t;
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
}

function assertDiveForOnSeahorse(api, label) {
  assert(api.state.unlocked[5] === true, label + " Seahorse is unlocked");
  assert(api.state.money === 1800, label + " money is $1800, got " + api.state.money);
  assert((api.state.stock[5] | 0) === 0, label + " Seahorse bowl stock is 0");
  assert(!api.state.bag.length, label + " bag is still 0/5");
  assert(api.diveForCueLegal() === true, label + " dive-for cue is legal on the empty bowl");
  assert(api.unlockCueLegal() === false, label + " TAP TO UNLOCK is gone after the buy");
  const labelTxt = api.diveForCueLabel();
  assert(/DIVE FOR SEAHORSE/.test(labelTxt) || /TAP TO DIVE/.test(labelTxt) || /DIVE · SEAHORSE/.test(labelTxt),
    label + " board copy is DIVE FOR SEAHORSE / TAP TO DIVE, got " + labelTxt);
  const goal = api.diveForPadGoal();
  assert(goal && /DIVE to catch a Seahorse/.test(goal.text),
    label + " ribbon says DIVE to catch a Seahorse, got " + (goal && goal.text));
  assert(!/Walk to the glowing DIVE dock/.test(goal.text),
    label + " ribbon does not bring back Walk to the glowing DIVE dock");
  assert(!/Tap the lock/.test(goal.text),
    label + " ribbon does not bring back Tap the lock");
  assert(api.beganDive() === false, label + " did not auto-dive on unlock");
  assert(api.state.unlocked[6] !== true, label + " did not auto-buy Puffer");
  api.cam.x = 445;
  api.cam.y = 420;
  api.cam.z = 1;
  const chip = api.diveForCueBox();
  assert(chip && chip.tank === 5, label + " cue is keyed to Seahorse");
  const horseBox = tankScreenBox(5, api.cam);
  const crabBox = tankScreenBox(9, api.cam);
  const clownBox = tankScreenBox(0, api.cam);
  const goldBox = tankScreenBox(2, api.cam);
  const puffBox = tankScreenBox(6, api.cam);
  const chipCx = chip.x + chip.w / 2;
  const horseCx = horseBox.x + horseBox.w / 2;
  const goldCx = goldBox.x + goldBox.w / 2;
  const crabCy = crabBox.y + crabBox.h / 2;
  const clownCy = clownBox.y + clownBox.h / 2;
  const horseAnchor = horseBox.y + horseBox.h * 0.42;
  const chipCy = chip.y + chip.h / 2;
  assert(Math.abs(chipCx - horseCx) < Math.abs(chipCx - goldCx),
    label + " board is on Seahorse, not Goldfish / Clownfish-center");
  assert(Math.abs(chipCy - horseAnchor) < Math.abs(chipCy - crabCy),
    label + " board sits on Seahorse, not Crab");
  assert(Math.abs(chipCy - horseAnchor) < Math.abs(chipCy - clownCy),
    label + " board sits on Seahorse, not Clownfish");
  assert(!boxesOverlap(chip, clownBox, 0),
    label + " board does not cover Clownfish");
  assert(!boxesOverlap(chip, crabBox, 0),
    label + " board does not cover Crab");
  assert(!boxesOverlap(chip, goldBox, 0),
    label + " board does not cover Goldfish");
  assert(!boxesOverlap(chip, puffBox, 0),
    label + " board does not cover Puffer");
  assert(boxesOverlap(chip, { x: horseBox.x, y: chip.y, w: horseBox.w, h: chip.h }, 24),
    label + " board sits over the Seahorse column");
}

// 1) Stamp loop 111 is asserted above.
// 2) ny 0.18 / ↑ SHOP — walk, arrive, still locked, TAP TO UNLOCK on Seahorse.
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
assert(northApi.diveForCueLegal() === false, "locked bowl does not show dive-for yet");
assert(northApi.state.money === 4000, "still $4000 before the buy");

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

// 3) Tap unlock: $1800, Seahorse unlocked, DIVE FOR SEAHORSE on Seahorse.
northApi.setPress(W / 2, PIN_H * 0.35);
assert(northApi.tapUnlockCue() === true, "tapping the TAP TO UNLOCK board buys");
assert(northApi.state.unlocked[5] === true,
  "explicit cue tap unlocks Seahorse when they can afford it");
assert(northApi.state.money === 1800,
  "explicit cue tap spends $2200, money=" + northApi.state.money);
assert(northApi.state.unlockBanner && /seahorse/i.test(northApi.state.unlockBanner.name),
  "explicit cue tap may show the Seahorse unlock banner");
assert(northApi.unlockCueLegal() === false, "unlock cue hides once Seahorse is unlocked");
assertDiveForOnSeahorse(northApi, "after unlock");

// Bag already has Seahorse → C100 tap-to-stock, no stacked dive-for board.
const bagApi = makeCtx(saveOpen, { phone: true });
bagApi.player.x = horse.x;
bagApi.player.y = horse.y;
bagApi.tapUnlockCue();
assert(bagApi.diveForCueLegal() === true, "empty bag shows dive-for after unlock");
bagApi.state.bag = [5];
assert(bagApi.diveForCueLegal() === false,
  "bag holding Seahorse keeps C100 tap-to-stock (no stacked dive-for board)");
bagApi.state.bag = [];
assert(bagApi.diveForCueLegal() === true, "emptying the bag brings dive-for back");

// Hide: leave the pad for a while, stock the bowl, or enter the ocean.
const hideX = northApi.player.x, hideY = northApi.player.y;
northApi.player.x = dockPt.x;
northApi.player.y = dockPt.y;
assert(northApi.diveForCueLegal() === true, "just leaving the pad still shows the cue");
northApi.tickDiveForCue(1.0);
assert(northApi.diveForCueLegal() === true, "1s off the pad still shows the cue");
northApi.tickDiveForCue(2.0);
assert(northApi.diveForCueLegal() === false, "leaving the pad for a while hides the cue");
northApi.player.x = hideX;
northApi.player.y = hideY;
northApi.armDiveForTank(5);
northApi.state.stock[5] = 1;
assert(northApi.diveForCueLegal() === false, "stocked bowl hides the dive-for cue");
northApi.state.stock[5] = 0;
northApi.armDiveForTank(5);
assert(northApi.diveForCueLegal() === true, "empty bowl on the pad shows the cue again");
northApi.state.scene = "ocean";
assert(northApi.diveForCueLegal() === false, "entering the ocean hides the dive-for cue");
northApi.state.scene = "shop";
northApi.armDiveForTank(5);

// 4) Tap that board: walker heads to DIVE pad / ocean (same as DIVE chip).
const diveCueApi = makeCtx(saveOpen, { phone: true });
diveCueApi.player.x = horse.x;
diveCueApi.player.y = horse.y;
diveCueApi.cam.x = 445;
diveCueApi.cam.y = 420;
assert(diveCueApi.tapUnlockCue() === true, "pad tap unlocks Seahorse");
assert(diveCueApi.beganDive() === false, "unlock does not auto-dive");
assert(diveCueApi.diveForCueLegal() === true, "dive-for board is up after unlock");
assert(diveCueApi.tapDiveForCue() === true, "tapping DIVE FOR SEAHORSE queues the DIVE walk");
assert(diveCueApi.beganDive() === false, "tapping the board off the dock does not instant-dive");
assert(diveCueApi.player.pendingAct && diveCueApi.player.pendingAct.kind === "dive",
  "board tap arms the same pending dive as the DIVE chip");
const end = diveCueApi.player.route && diveCueApi.player.route.length
  ? diveCueApi.player.route[diveCueApi.player.route.length - 1]
  : diveCueApi.player.goto;
assert(end && Math.hypot(end.x - divePad.x, end.y - divePad.y) < 1,
  "board tap dest is the DIVE pad, got " + (end && end.x + "," + end.y));
const dashT = followQueuedWalk(diveCueApi, divePad, 6);
assert(dashT < 4, "C86-style dash reaches the DIVE pad, t=" + dashT.toFixed(2));
assert(Math.hypot(diveCueApi.player.x - divePad.x, diveCueApi.player.y - divePad.y) < 40,
  "walker occupies the DIVE pad after the board tap");
assert(diveCueApi.state.scene === "shop", "board tap does not teleport into the ocean");
assert(diveCueApi.state.unlocked[6] !== true, "board tap does not buy Puffer");

// 5) DIVE chip still works. South tap on dock not stolen to Seahorse.
const chipApi = makeCtx(saveOpen, { phone: true });
chipApi.player.x = horse.x;
chipApi.player.y = horse.y;
chipApi.tapUnlockCue();
assert(chipApi.tapDiveChip() === true, "DIVE chip still queues a walk from the tank row");
assert(chipApi.player.pendingAct && chipApi.player.pendingAct.kind === "dive",
  "DIVE chip still arms pending dive");

const diveWorld = { x: 880, y: 1008 };
const diveCanvas = { x: W / 2, y: H390 * 0.82 };
assert(openApi.phoneDockPlazaWalkWanted(diveWorld.x, diveWorld.y, diveCanvas.x, diveCanvas.y) === false,
  "a south / DIVE-pad tap is not stolen onto Seahorse");
openApi.setPress(diveCanvas.x, diveCanvas.y);
const southDest = openApi.clickWalkTarget(diveWorld.x, diveWorld.y);
assert(southDest && southDest.x === 880 && southDest.y === 1008,
  "south / DIVE-pad dest stays the pad, got " + (southDest && southDest.x + "," + southDest.y));
openApi.tryClickShop(diveWorld.x, diveWorld.y);
assert(!openApi.player.unlockConfirm,
  "south / DIVE-pad pointer-down does not arm an unlock");

// 6) Desktop 16:9 hold-W still reaches Seahorse without unlocking.
//    Click-to-walk Puffer still works. After unlock the same cue can show.
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
assert(deskApi.tapUnlockCue() === true, "desktop unlock board still buys");
assert(deskApi.beganDive() === false, "desktop unlock does not auto-dive");
assert(deskApi.diveForCueLegal() === true,
  "desktop after unlock still shows the dive-for cue");
assert(/DIVE/.test(deskApi.diveForCueLabel()),
  "desktop dive-for copy mentions DIVE, got " + deskApi.diveForCueLabel());
assert(/DIVE to catch a Seahorse/.test(deskApi.diveForPadGoal().text),
  "desktop ribbon is still dive-for-species");

const clickPath = openApi.shopPath(dockPt.x, dockPt.y, puff.x, puff.y);
assert(Array.isArray(clickPath) && clickPath.length >= 2,
  "click-to-walk dock→Puffer is still a routed walk");
const clickLast = clickPath[clickPath.length - 1];
assert(Math.hypot(clickLast.x - puff.x, clickLast.y - puff.y) < 1,
  "clicking Puffer still routes to tankWalkPoint(6)");

console.log("c111 dive for: ok (next=" + openApi.nextLockedTank() +
  ", horse=" + horse.x + "," + horse.y +
  ", ny18=" + northWalk.t.toFixed(2) + "s locked→$" + northApi.state.money +
  " diveFor@" + (diveCueApi.diveForCueBox() && diveCueApi.diveForCueBox().tank) +
  ", dash=" + dashT.toFixed(2) + "s" +
  ", holdW=" + deskWalk.t.toFixed(2) + "s" +
  ")");
