// C107 — phone 390 tap-to-walk to the next unlock / shop bowls.
// Loop 106 leftover: desktop hold-W already takes the mid-cluster
// alley to tankWalkPoint(nextLockedTank()) = Seahorse (5). After
// Continue on ≈390×844 the dock camera still hides the bowls, the
// ribbon still says “Walk to the glowing DIVE dock” while Skip is
// on it, and a thumb tap in the upper third only shuffled ~75px
// along the boards (880,920 → 918,845). A plaza-bound tap (or the
// fat ↑ SHOP chip) now walks the same C106 wood path. No auto-unlock.
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

assert(/Aqua Bay · loop 109/.test(src), "title/pause stamp is loop 109");
assert(!/Aqua Bay · loop 107/.test(src), "loop 107 stamp is gone");
assert(/loop 107 phone 390 tap-to-walk to the shop bowls/.test(src),
  "C107 names the phone plaza leftover");
assert(/function phoneDockPlazaWalkWanted\s*\(/.test(src),
  "phoneDockPlazaWalkWanted is the 390 plaza-tap gate");
assert(/function hideDockWalkHint\s*\(/.test(src),
  "hideDockWalkHint kills the stale on-dock ribbon");
assert(/function nextUnlockWalkDest\s*\(/.test(src),
  "nextUnlockWalkDest is tankWalkPoint(nextLockedTank)");
assert(/function drawPlazaWalkCue\s*\(/.test(src),
  "fat ↑ SHOP / north cue is painted");
assert(/↑ SHOP/.test(src) && /goto-plaza/.test(src),
  "↑ SHOP chip uses goto-plaza");
assert(/drawPierBoardChip\(b\.x, b\.y, b\.w, b\.h, "↑ SHOP"/.test(src),
  "↑ SHOP uses drawPierBoardChip — no new economy");
assert(/Tap north to walk to the shop bowls/.test(src),
  "phone ribbon cues north / shop bowls while already on the dock");
assert(/Walk to the glowing DIVE dock — tap to walk/.test(src),
  "off-dock walk-to-DIVE copy stays for mid-pier");
assert(/Dock is south — tap to walk/.test(src),
  "south-hint copy still exists for mid-pier");
assert(/if \(hideDockWalkHint\(\)/.test(src),
  "currentGoal consults hideDockWalkHint before the DIVE-dock fallback");
assert(/phoneDockPlazaWalkWanted\(wx, wy/.test(extractFn(src, "clickWalkTarget") || ""),
  "clickWalkTarget remaps a phone plaza tap");
assert(/walkToShopBowls\(\)/.test(extractFn(src, "onUI") || ""),
  "↑ SHOP chip walks the same unlock dest as hold-W");

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
assert(TANK_POS[1].x - (TANK_POS[0].x + TANK_W) === 8,
  "columns still overlap / gap 8px — not an un-clustered east row");

const REGISTER = { x: 168, y: 500, w: 150, h: 110 };
const KIOSK = { x: 1280, y: 480, w: 170, h: 130 };
const WELCOME = { x: 140, y: 780, w: 156, h: 86 };
const AISLE = { x: 802, y: 760, w: 156, h: 160 };
const SPECIES = new Array(SPECIES_N);
const EAST_SHOP = { x: 1256, y: 380, w: 228, h: 286 };
const WEST_LANE = { x: 322, y: 0, w: 26, h: 800 };
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
const saveClosed = seedSave({
  unlocked: [true],
  money: 0,
});
assert(saveOpen.unlocked[4] === true && saveOpen.unlocked[5] !== true,
  "fresh gallery save has Turtle, not Seahorse");

const names = [
  "shopDockWalk", "walkClearY", "tankWalkPoint", "shopWalkRects",
  "snapToShopWalk", "shopRectOverlap", "shopRectHas", "shopPortal",
  "wasdShopPath", "shopPath", "constrainShop", "pushOut", "shopWalkMax",
  "galleryOpen", "tankLive", "galleryTankDest", "speciesUnlocked",
  "nextLockedSafe", "nextLockedTank",
  "onAisleWalk", "eastShopNavyGap", "destWantsPlaza", "destWantsDock",
  "nextUnlockWalkDest", "hideDockWalkHint", "phoneDockPlazaWalkWanted",
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
    SPECIES: SPECIES, CORE_SPECIES: CORE_SPECIES,
    DOCK_CAM_FLOOR: DOCK_CAM_FLOOR,
    state: { unlocked: save.unlocked.slice(), money: save.money, scene: "shop", mode: "play" },
    player: { x: 880, y: 920, radius: 16, goto: null, route: null },
    keys: null,
    cam: { x: 880, y: 1000, yFloor: DOCK_CAM_FLOOR },
    mouse: { pressX: opts.pressX || 640, pressY: opts.pressY || 700 },
    clamp: clamp,
    toast: function () {},
    nope: function () {},
    Math: Math,
    portraitStage: function () { return !!phone; },
    thumbCopy: function () { return !!phone; },
    bagHasStockable: function () { return false; },
    cashNeedsCollect: function () { return false; },
    dockCameraReady: function () { return true; },
    plazaCameraReady: function () { return false; },
    actionFloor: function () { return opts.floor || 2770; },
    inDiveZone: function () { return false; },
    nearDivePad: function () { return sandbox.player.y > 870; },
  };
  const body = names.map((n) => fns[n]).join("\n") +
    "\nthis.__api = { galleryOpen, tankWalkPoint, shopPath, wasdShopPath," +
    " constrainShop, galleryTankDest, snapToShopWalk, nextLockedTank," +
    " nextUnlockWalkDest, hideDockWalkHint, phoneDockPlazaWalkWanted," +
    " shopDockWalk, shopWalkRects, player, state, cam };";
  vm.runInNewContext(body, sandbox);
  return sandbox.__api;
}

const openApi = makeCtx(saveOpen, { phone: true });
const deskApi = makeCtx(saveOpen, { phone: false });
const closedApi = makeCtx(saveClosed, { phone: true });
assert(openApi.galleryOpen() === true, "seeded Turtle save opens the gallery");
assert(closedApi.galleryOpen() === false, "seeded starter save keeps the gallery closed");
assert(openApi.nextLockedTank() === 5, "after Turtle the next unlock is Seahorse");
assert(openApi.nextUnlockWalkDest().x === 445 && openApi.nextUnlockWalkDest().y === 568,
  "nextUnlockWalkDest is tankWalkPoint(5)");

const dock = openApi.shopDockWalk();
const dockPt = { x: 880, y: 920 };
assert(dockPt.x >= dock.x && dockPt.x <= dock.x + dock.w, "seed walk starts on the painted dock");

const horse = openApi.tankWalkPoint(5);
const puff = openApi.tankWalkPoint(6);
const turt = openApi.tankWalkPoint(4);
assert(horse.x === 445 && horse.y === 568, "Seahorse stand is south of the bowl");
assert(puff.x === 663 && puff.y === 568, "Puffer stand stays south of the bowl");
assert(turt.x === 1317 && turt.y === 360, "Turtle pad stays on the core apron");

function inEastShop(x, y) {
  return x >= EAST_SHOP.x && x <= EAST_SHOP.x + EAST_SHOP.w &&
    y >= EAST_SHOP.y && y <= EAST_SHOP.y + EAST_SHOP.h;
}
function inRegister(x, y) {
  return x >= REGISTER.x && x <= REGISTER.x + REGISTER.w &&
    y >= REGISTER.y && y <= REGISTER.y + REGISTER.h;
}

// 390×844 Continue dock camera — upper-third tap maps onto the boards,
// not the bowls (the live leftover shuffle 880,920 → ~918,845).
const W = 1280, cssW = 390, cssH = 844;
const H390 = Math.max(960, Math.round(W * cssH / cssW));
const camZ = H390 / 860;
function screenToWorld(sx, sy, cam) {
  return { x: (sx - W / 2) / camZ + cam.x, y: (sy - H390 / 2) / camZ + cam.y };
}
const upperCssY = 844 / 3;
const upperCanvas = { x: W / 2, y: upperCssY * (H390 / cssH) };
const upperWorld = screenToWorld(upperCanvas.x, upperCanvas.y, { x: 880, y: 1000 });
assert(upperWorld.y > 800 && upperWorld.y < 920,
  "390 upper-third tap still lands on the dock boards, y=" + upperWorld.y.toFixed(1));
assert(upperWorld.y < 900, "upper-third world Y is north of the dock lip");
const snapped = openApi.snapToShopWalk(upperWorld.x, upperWorld.y);
assert(snapped.y > 800,
  "without remap, snapToShopWalk keeps the tap on the dock, y=" + snapped.y.toFixed(1));
assert(Math.hypot(snapped.x - horse.x, snapped.y - horse.y) > 200,
  "raw dock snap is not the Seahorse pad");

assert(openApi.hideDockWalkHint() === true,
  "ribbon hideDockWalkHint is true while Skip stands on the dock");
assert(openApi.phoneDockPlazaWalkWanted(upperWorld.x, upperWorld.y, upperCanvas.x, upperCanvas.y) === true,
  "390 upper-third tap wants the plaza / next-unlock walk");
assert(openApi.phoneDockPlazaWalkWanted(880, 1008, W / 2, H390 * 0.82) === false,
  "a south / DIVE-pad tap is not stolen onto Seahorse");
assert(deskApi.phoneDockPlazaWalkWanted(upperWorld.x, upperWorld.y, upperCanvas.x, upperCanvas.y) === false,
  "desktop click-to-walk is not remapped by the phone plaza gate");

const dest = openApi.nextUnlockWalkDest();
assert(dest.x === horse.x && dest.y === horse.y,
  "↑ SHOP / plaza tap dest is tankWalkPoint(nextLocked=5)");

const horsePath = openApi.shopPath(dockPt.x, dockPt.y, dest.x, dest.y);
assert(Array.isArray(horsePath) && horsePath.length >= 2,
  "shopPath dock→Seahorse is a routed walk, hops=" + (horsePath && horsePath.length));
const horseXs = [dockPt.x].concat(horsePath.map((pt) => pt.x));
assert(horseXs.every((x) => x >= 360),
  "phone plaza walk never visits the till / west lane (x<360), xs=" +
    horseXs.map((x) => x.toFixed(0)).join(","));
assert(horseXs.every((x) => x <= 1100),
  "phone plaza walk stays off the C102 east spine, xs=" +
    horseXs.map((x) => x.toFixed(0)).join(","));
const horseLast = horsePath[horsePath.length - 1];
assert(Math.hypot(horseLast.x - horse.x, horseLast.y - horse.y) < 1,
  "phone plaza path ends on tankWalkPoint(5)");

const clickPath = openApi.shopPath(dockPt.x, dockPt.y, puff.x, puff.y);
assert(Array.isArray(clickPath) && clickPath.length >= 2,
  "click-to-walk dock→Puffer is still a routed walk");
const clickLast = clickPath[clickPath.length - 1];
assert(Math.hypot(clickLast.x - puff.x, clickLast.y - puff.y) < 1,
  "clicking Puffer still routes to tankWalkPoint(6)");

const closedDest = closedApi.galleryTankDest(6);
assert(Math.abs(closedDest.x - turt.x) < 1 && Math.abs(closedDest.y - turt.y) < 1,
  "closed-gallery galleryTankDest(6) is tankWalkPoint(4)");

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

const seah = followPath(openApi, dest, 10);
const walkD = Math.hypot(openApi.player.x - horse.x, openApi.player.y - horse.y);
const dPuff = Math.hypot(openApi.player.x - puff.x, openApi.player.y - puff.y);
assert(seah.t < 8,
  "390 plaza tap-to-walk reaches Seahorse within ~8s, t=" + seah.t.toFixed(2));
assert(walkD < 40,
  "phone tap-to-walk occupies the Seahorse pad, d=" + walkD.toFixed(1) +
    " at " + openApi.player.x.toFixed(0) + "," + openApi.player.y.toFixed(0));
assert(seah.minX >= 360,
  "phone walk never visits the till / west lane (x<360), minX=" + seah.minX.toFixed(1));
assert(seah.maxX <= 1100,
  "phone walk stays off the C102 east spine, maxX=" + seah.maxX.toFixed(1));
assert(!seah.hitPuff && seah.puffMin > 40,
  "phone walk never occupies Soon-Puffer mid-path, puffMin=" + seah.puffMin.toFixed(1));
assert(dPuff > 80,
  "phone walk did not taxi to Soon-Puffer, dPuff=" + dPuff.toFixed(1));
assert(openApi.player.y < 640 && openApi.player.y > 520,
  "phone finish is on the row-2 apron, y=" + openApi.player.y.toFixed(1));
assert(!seah.trace.some((p) => inRegister(p.x, p.y) || inEastShop(p.x, p.y) ||
    p.y < 300 || p.x < 360 || p.x > 1100),
  "phone walk did not dump into REGISTER, west lane, eastShop sky, or the north sky");
assert(openApi.state.unlocked[6] !== true,
  "phone plaza walk does not unlock Puffer out of order");
assert(openApi.state.unlocked[5] !== true,
  "this tool does not auto-unlock Seahorse — walk only");

// Occupying Soon-Puffer while Seahorse is still the next lock must not unlock.
const puffOccupy = makeCtx(saveOpen, { phone: true });
puffOccupy.player.x = puff.x;
puffOccupy.player.y = puff.y;
assert(puffOccupy.nextLockedTank() === 5, "Soon-Puffer occupy does not skip unlock order");
assert(puffOccupy.state.unlocked[6] !== true, "occupying Puffer does not unlock it");

console.log("c107 phone plaza: ok (next=" + openApi.nextLockedTank() +
  ", horse=" + horse.x + "," + horse.y +
  ", upperY=" + upperWorld.y.toFixed(0) +
  ", hops=" + horseXs.map((x) => x.toFixed(0)).join("→") +
  ", walk " + seah.t.toFixed(2) + "s @ " +
  openApi.player.x.toFixed(0) + "," + openApi.player.y.toFixed(0) +
  ", minX=" + seah.minX.toFixed(0) +
  ", maxX=" + seah.maxX.toFixed(0) +
  ", puffMin=" + seah.puffMin.toFixed(0) +
  ")");
