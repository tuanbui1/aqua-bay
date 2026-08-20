// C103 — hold-W from the dock reaches the Puffer pad, not Dolphin glass.
// Loop 102 leftover: click-to-walk already routed dock → aisle → row-3
// → east spine → row-2 → tankWalkPoint(6). Hold-W never took that spine
// (columns have no N–S alley) and dead-ended on the Dolphin apron (y≈776).
// Closed gallery still remaps a Puffer click to the Sea Turtle pad.
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

assert(/Aqua Bay · loop 104/.test(src), "title/pause stamp is loop 104");
assert(!/Aqua Bay · loop 103/.test(src), "loop 103 stamp is gone");
assert(/function wasdShopPath\s*\(/.test(src), "wasdShopPath steers hold-W onto the wood path");
assert(/C103 — hold-W never took that spine/.test(src) ||
  /C103 — hold W \(no A\/D\) from south of the Puffer pad/.test(src),
  "C103 names the Dolphin dead-end / hold-W path");
assert(/C102 — C101's west spine/.test(src), "C102 east-aisle spine stays");
assert(/C101 — live gallery bowls fill the old fat neighborhood/.test(src),
  "C101 apron comment stays");
assert(/C101 — collide with the bowl, not a 28px south pad/.test(src),
  "C101 bowl collider stays");
assert(/pushOut\(t\.x, t\.y, TANK_W, TANK_H \+ 8\)/.test(src),
  "tank walk collider is the bowl + 8px lip");

const walkFn = extractFn(src, "shopWalkRects");
assert(walkFn, "shopWalkRects is present");
assert(!/const spine = \{ x: 300, y: clear, w: 42/.test(walkFn),
  "C101 west/till spine stays gone");
assert(/x: 1204/.test(walkFn), "open-gallery spine stays at the 4-tank east edge");

assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(/function galleryOpen\s*\(/.test(src), "galleryOpen stays");
assert(/function galleryTankDest\s*\(/.test(src), "galleryTankDest stays");
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
assert(/unlock:\s*1400/.test(src), "Sea Turtle unlock stays $1400");
const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/C76 — one tank neighborhood around the aisle/.test(src), "C76 cluster stays");
assert(/C76 — do not trap a dock walker heading up the aisle or to a tank/.test(src) ||
  /C76 — dock snap must not trap a walker heading up the aisle/.test(src),
  "C76 do-not-yank-onto-east-sky stays");
assert(/const PLAZA_CAM_CEILING\s*=\s*520/.test(src), "plaza camera ceiling stays 520");
assert(/const DOCK_CAM_FLOOR\s*=\s*1000/.test(src), "dock camera floor stays 1000");
assert(/function desktopStage\s*\(/.test(src), "desktopStage stays");
assert(/function portraitStage\s*\(/.test(src), "portraitStage stays");
assert(/function actionChipInset\s*\(/.test(src), "C84 DIVE inset stays");
assert(/visibleStageBottom/.test(src) && /visualViewport/.test(src),
  "C82 visualViewport DIVE floor stays");

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
assert(TANK_POS[6].x === 558 && TANK_POS[6].y === 380, "Puffer stays C76 {558,380}");
assert(/\{ x: 558, y: 380 \}/.test(src), "TANK_POS[6] stays planted");

const REGISTER = { x: 168, y: 500, w: 150, h: 110 };
const KIOSK = { x: 1280, y: 480, w: 170, h: 130 };
const WELCOME = { x: 140, y: 780, w: 156, h: 86 };
const AISLE = { x: 802, y: 760, w: 156, h: 160 };
const SPECIES = new Array(SPECIES_N);
const EAST_SHOP = { x: 1256, y: 380, w: 228, h: 286 };

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
  unlocked: [true, true, true, true, true, true],
  money: 3200,
});
const saveClosed = seedSave({
  unlocked: [true],
  money: 0,
});
assert(saveOpen.unlocked[4] === true && saveOpen.unlocked[5] === true &&
  saveOpen.money >= 3200,
  "open save has Turtle + Seahorse so next unlock is Puffer");
assert(saveClosed.unlocked[4] !== true, "closed save has not unlocked Turtle");
assert(saveOpen.unlocked.filter(Boolean).length >= CORE_SPECIES,
  "open save meets galleryOpen via Turtle / core count");

const names = [
  "shopDockWalk", "walkClearY", "tankWalkPoint", "shopWalkRects",
  "snapToShopWalk", "shopRectOverlap", "shopRectHas", "shopPortal",
  "wasdShopPath", "shopPath", "constrainShop", "pushOut", "shopWalkMax",
  "galleryOpen", "tankLive", "galleryTankDest", "speciesUnlocked",
  "nextLockedSafe", "nextLockedTank",
  "onAisleWalk", "eastShopNavyGap", "destWantsPlaza", "destWantsDock",
];
const fns = {};
for (let i = 0; i < names.length; i++) {
  fns[names[i]] = extractFn(src, names[i]);
  assert(fns[names[i]], names[i] + " is extractable from game.js");
}

function makeCtx(save) {
  const sandbox = {
    TANK_POS: TANK_POS, TANK_W: TANK_W, TANK_H: TANK_H,
    REGISTER: REGISTER, KIOSK: KIOSK, WELCOME: WELCOME, AISLE: AISLE,
    SPECIES: SPECIES, CORE_SPECIES: CORE_SPECIES,
    state: { unlocked: save.unlocked.slice(), money: save.money },
    player: { x: 880, y: 920, radius: 16, goto: null, route: null },
    keys: null,
    clamp: clamp,
    toast: function () {},
    nope: function () {},
    Math: Math,
  };
  const body = names.map((n) => fns[n]).join("\n") +
    "\nthis.__api = { galleryOpen, tankWalkPoint, shopPath, wasdShopPath," +
    " constrainShop, galleryTankDest, snapToShopWalk, shopWalkRects," +
    " shopDockWalk, eastShopNavyGap, player, state };";
  vm.runInNewContext(body, sandbox);
  return sandbox.__api;
}

const openApi = makeCtx(saveOpen);
const closedApi = makeCtx(saveClosed);
assert(openApi.galleryOpen() === true, "seeded Turtle save opens the gallery");
assert(closedApi.galleryOpen() === false, "seeded starter save keeps the gallery closed");

const dock = openApi.shopDockWalk();
const dockPt = { x: 880, y: 920 };
assert(dockPt.x >= dock.x && dockPt.x <= dock.x + dock.w, "seed walk starts on the painted dock");

const puff = openApi.tankWalkPoint(6);
const turt = openApi.tankWalkPoint(4);
assert(puff.x === 663 && puff.y === 568, "Puffer stand is south of the bowl");
assert(turt.x === 1317 && turt.y === 360, "Turtle pad stays on the core apron");

function inEastShop(x, y) {
  return x >= EAST_SHOP.x && x <= EAST_SHOP.x + EAST_SHOP.w &&
    y >= EAST_SHOP.y && y <= EAST_SHOP.y + EAST_SHOP.h;
}

const openPath = openApi.shopPath(dockPt.x, dockPt.y, puff.x, puff.y);
assert(Array.isArray(openPath) && openPath.length >= 3,
  "open-gallery dock→Puffer is a routed walk, hops=" + (openPath && openPath.length));
assert(openPath.every((pt) => Number.isFinite(pt.x) && Number.isFinite(pt.y)),
  "open-gallery Puffer path is finite");
const pathXs = [dockPt.x].concat(openPath.map((pt) => pt.x));
assert(pathXs.every((x) => x > 340),
  "open-gallery path stays east of the till, xs=" +
    pathXs.map((x) => x.toFixed(0)).join(","));
assert(!openPath.some((pt) => inEastShop(pt.x, pt.y) || pt.x > 1256),
  "open-gallery path does not sit in eastShop / x>1256 empty wood");
assert(!openPath.some((pt) => pt.x < 400),
  "open-gallery Puffer path does not use the C101 west/till spine");

const last = openPath[openPath.length - 1];
assert(Math.hypot(last.x - puff.x, last.y - puff.y) < 1,
  "path ends on tankWalkPoint(6)");
assert(openPath.length > 1, "Puffer bowl click is not a straight hop through glass");

openApi.player.x = puff.x;
openApi.player.y = puff.y;
openApi.constrainShop();
const occDx = openApi.player.x - puff.x, occDy = openApi.player.y - puff.y;
assert(Math.hypot(occDx, occDy) < 8,
  "walker occupies the Puffer pad under constrainShop, d=" +
    Math.hypot(occDx, occDy).toFixed(2));
assert(openApi.player.x > 340 && openApi.player.y > 520 && openApi.player.y < 640,
  "occupied pad stays on the row-2 apron, not the till");
assert(!inEastShop(openApi.player.x, openApi.player.y),
  "occupied pad is not snapped onto eastShop");

const closedDest = closedApi.galleryTankDest(6);
assert(Math.abs(closedDest.x - turt.x) < 1 && Math.abs(closedDest.y - turt.y) < 1,
  "closed-gallery galleryTankDest(6) is tankWalkPoint(4)");

const closedPath = closedApi.shopPath(dockPt.x, dockPt.y, turt.x, turt.y);
assert(closedPath.length >= 2, "closed gallery still paths dock → Turtle apron");

// Simulated hold-W from the painted dock. Raw north dies on Dolphin (y≈776);
// wasdShopPath must peel onto the east spine and stand at Puffer.
openApi.player.x = dockPt.x;
openApi.player.y = dockPt.y;
openApi.player.goto = null;
openApi.player.route = null;
const dt = 1 / 60, maxSpeed = 232, accel = 1650;
let vx = 0, vy = 0, t = 0, stuck = 0, minY = dockPt.y;
while (t < 18) {
  let ax = 0, ay = -1;
  const around = openApi.wasdShopPath(ax, ay);
  if (around && around.length) {
    const n = around[0];
    const pdx = n.x - openApi.player.x, pdy = n.y - openApi.player.y;
    const pd = Math.hypot(pdx, pdy);
    if (pd > 8) { ax = pdx / pd; ay = pdy / pd; }
  }
  vx += ax * accel * dt;
  vy += ay * accel * dt;
  const fr = 5.2;
  vx -= vx * fr * dt;
  vy -= vy * fr * dt;
  const sp = Math.hypot(vx, vy);
  if (sp > maxSpeed) { vx *= maxSpeed / sp; vy *= maxSpeed / sp; }
  const ox = openApi.player.x, oy = openApi.player.y;
  openApi.player.x += vx * dt;
  openApi.player.y += vy * dt;
  openApi.constrainShop();
  const stepped = Math.hypot(openApi.player.x - ox, openApi.player.y - oy);
  if (stepped < 0.2) stuck++;
  else stuck = 0;
  if (openApi.player.y < minY) minY = openApi.player.y;
  t += dt;
  const dPad = Math.hypot(openApi.player.x - puff.x, openApi.player.y - puff.y);
  if (dPad < 28) break;
  if (stuck > 45) break;
}
const wasdD = Math.hypot(openApi.player.x - puff.x, openApi.player.y - puff.y);
assert(wasdD < 28,
  "WASD-north from the dock occupies the Puffer pad, d=" + wasdD.toFixed(1) +
    " at " + openApi.player.x.toFixed(0) + "," + openApi.player.y.toFixed(0));
assert(openApi.player.y < 640 && openApi.player.y > 520,
  "WASD finish is on the row-2 apron, not Dolphin y≈776, y=" +
    openApi.player.y.toFixed(1));
assert(Math.abs(openApi.player.y - 776) > 40,
  "WASD-north did not dead-end on the Dolphin apron");
assert(openApi.player.x > 340 && !inEastShop(openApi.player.x, openApi.player.y),
  "WASD finish stays on wood (not till, not eastShop)");
assert(minY < 640, "hold-W actually walked north of row 3");

// Closed gallery: hold-W must not be forced onto a Puffer path.
closedApi.player.x = dockPt.x;
closedApi.player.y = dockPt.y;
assert(closedApi.wasdShopPath(0, -1) == null,
  "closed gallery does not steal hold-W onto a Puffer path");

console.log("c103 puffer pad: ok (open hops=" + openPath.length +
  ", xs=" + pathXs.map((x) => Math.round(x)).join("→") +
  ", wasd " + t.toFixed(2) + "s @ " +
  openApi.player.x.toFixed(0) + "," + openApi.player.y.toFixed(0) + ")");
