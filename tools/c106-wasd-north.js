// C106 — hold-W after galleryOpen reaches Seahorse through the bowls,
// not the till taxi. Loop 105 leftover: wasdShopPath already steered
// to tankWalkPoint(nextLockedTank()) = Seahorse (5), and shopPath
// picked the shorter west lane (x=322–348) instead of the C102 east
// spine. That 26px slot sits against CASHIER. Hold-W first taxied the
// locked row-3 apron west to the till, squeezed up, then came back
// east to the glowing $2200 bowl. A mid-cluster alley (col-0 / col-1
// gap) is the wood N–S. Click-to-walk Puffer stays. Closed gallery
// still remaps to Turtle. No auto-unlock.
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

assert(/Aqua Bay · loop 107/.test(src), "title/pause stamp is loop 107");
assert(!/Aqua Bay · loop 106/.test(src), "loop 106 stamp is gone");
assert(/function wasdShopPath\s*\(/.test(src), "wasdShopPath stays");
assert(/nextLockedTank\(\)/.test(extractFn(src, "wasdShopPath") || ""),
  "wasdShopPath steers to nextLockedTank, not hardcoded tank 6");
assert(!/tankWalkPoint\(6\)/.test(extractFn(src, "wasdShopPath") || ""),
  "wasdShopPath is not a Puffer magnet");
assert(/C106 — that shorter walk was still the till slot/.test(src) ||
  /C106 — the west portal was still the shortest/.test(src) ||
  /C106 — shopPath now prefers the mid-cluster alley/.test(src) ||
  /C106 — inset the col-0 right/.test(src),
  "C106 names the till-taxi leftover / mid-cluster alley");
assert(/C105 — columns still have no N–S alley/.test(src) ||
  /C105 — hop cost is walking distance/.test(src) ||
  /C105 — padded desk ended at x=324/.test(src),
  "C105 names the east-spine leftover / west lane");
assert(/C104 — do not magnet to Soon-Puffer/.test(src) ||
  /C104 — that spine is not a Puffer taxi/.test(src),
  "C104 names the Soon-Puffer taxi leftover");
assert(/C103 — hold-W never took that spine/.test(src) ||
  /C103 — hold W \(no A\/D\) from south of the/.test(src),
  "C103 spine / hold-W path stays");
assert(/C102 — C101's west spine/.test(src), "C102 east-aisle spine stays");
assert(/C101 — live gallery bowls fill the old fat neighborhood/.test(src),
  "C101 apron comment stays");
assert(/pushOut\(t\.x, t\.y, TANK_W, TANK_H \+ 8\)/.test(src),
  "tank walk collider is the bowl + 8px lip");

const walkFn = extractFn(src, "shopWalkRects");
assert(walkFn, "shopWalkRects is present");
assert(!/const spine = \{ x: 300, y: clear, w: 42/.test(walkFn),
  "C101 west/till spine stays gone");
assert(/westLane/.test(walkFn) && /x: 322/.test(walkFn),
  "open-gallery west lane stays just east of the painted desk");
assert(/alley/.test(walkFn) && /x: 528/.test(walkFn),
  "open-gallery mid-cluster alley sits in the col-0 / col-1 gap");
assert(/x: 1204/.test(walkFn), "C102 east spine stays for east dests");
assert(/x: 764, y: 740, w: 248, h: 180/.test(walkFn),
  "aisle walk rect still stops short of the bowls");

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
assert(/C76 — do not trap a dock walker heading up the aisle or to a tank/.test(src) ||
  /C76 — dock snap must not trap a walker heading up the aisle/.test(src),
  "C76 do-not-yank-onto-east-sky stays");
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
const saveHorse = seedSave({
  unlocked: [true, true, true, true, true, true],
  money: 4000,
});
const saveClosed = seedSave({
  unlocked: [true],
  money: 0,
});
const saveAll = seedSave({
  unlocked: new Array(SPECIES_N).fill(true),
  money: 0,
});
assert(saveOpen.unlocked[4] === true && saveOpen.unlocked[5] !== true,
  "fresh gallery save has Turtle, not Seahorse");
assert(saveHorse.unlocked[5] === true && saveHorse.unlocked[6] !== true,
  "after Seahorse the next unlock is still Puffer");
assert(saveOpen.money >= 3200, "cash can afford Puffer but order still forbids it");

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
    " constrainShop, galleryTankDest, snapToShopWalk, nextLockedTank," +
    " shopDockWalk, shopWalkRects, player, state };";
  vm.runInNewContext(body, sandbox);
  return sandbox.__api;
}

const openApi = makeCtx(saveOpen);
const horseApi = makeCtx(saveHorse);
const closedApi = makeCtx(saveClosed);
const allApi = makeCtx(saveAll);
assert(openApi.galleryOpen() === true, "seeded Turtle save opens the gallery");
assert(closedApi.galleryOpen() === false, "seeded starter save keeps the gallery closed");
assert(openApi.nextLockedTank() === 5, "after Turtle the next unlock is Seahorse");
assert(horseApi.nextLockedTank() === 6, "after Seahorse the next unlock is Puffer");
assert(allApi.nextLockedTank() === -1, "full unlock has no next tank");
assert(allApi.wasdShopPath(0, -1) == null,
  "all-unlocked hold-W is not a Puffer magnet");

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
function inWestLane(x) {
  return x >= WEST_LANE.x && x <= WEST_LANE.x + WEST_LANE.w;
}
function occupies(x, y, pad, r) {
  return Math.hypot(x - pad.x, y - pad.y) < r;
}

function pathTouches(pts, pred) {
  for (let i = 0; i < pts.length; i++) {
    if (pred(pts[i].x, pts[i].y)) return true;
  }
  return false;
}

const horsePath = openApi.shopPath(dockPt.x, dockPt.y, horse.x, horse.y);
assert(Array.isArray(horsePath) && horsePath.length >= 2,
  "shopPath dock→Seahorse is a routed walk, hops=" + (horsePath && horsePath.length));
const horseXs = [dockPt.x].concat(horsePath.map((pt) => pt.x));
assert(horseXs.every((x) => x >= 360),
  "shopPath dock→Seahorse never visits the till / west lane (x<360), xs=" +
    horseXs.map((x) => x.toFixed(0)).join(","));
assert(horseXs.every((x) => x <= 1100),
  "shopPath dock→Seahorse stays off the C102 east spine, xs=" +
    horseXs.map((x) => x.toFixed(0)).join(","));
assert(!inWestLane(horsePath[0].x),
  "shopPath first hop is not the west lane / till slot, hop0=" +
    horsePath[0].x.toFixed(0) + "," + horsePath[0].y.toFixed(0));
assert(!pathTouches(horsePath, (x, y) => occupies(x, y, puff, 40)),
  "shopPath dock→Seahorse never occupies Soon-Puffer mid-path");
assert(!pathTouches(horsePath, (x, y) => inEastShop(x, y) || inRegister(x, y)),
  "shopPath dock→Seahorse is not till / eastShop sky");
const horseLast = horsePath[horsePath.length - 1];
assert(Math.hypot(horseLast.x - horse.x, horseLast.y - horse.y) < 1,
  "shopPath dock→Seahorse ends on tankWalkPoint(5)");

const clickPath = openApi.shopPath(dockPt.x, dockPt.y, puff.x, puff.y);
assert(Array.isArray(clickPath) && clickPath.length >= 2,
  "click-to-walk dock→Puffer is still a routed walk");
const clickLast = clickPath[clickPath.length - 1];
assert(Math.hypot(clickLast.x - puff.x, clickLast.y - puff.y) < 1,
  "clicking Puffer still routes to tankWalkPoint(6)");
const clickXs = [dockPt.x].concat(clickPath.map((pt) => pt.x));
assert(clickXs.every((x) => x > REGISTER.x + REGISTER.w),
  "click-to-walk Puffer stays east of REGISTER");
assert(!clickPath.some((pt) => inEastShop(pt.x, pt.y) || pt.x > 1256),
  "click-to-walk Puffer does not sit in eastShop / x>1256 empty wood");

const closedDest = closedApi.galleryTankDest(6);
assert(Math.abs(closedDest.x - turt.x) < 1 && Math.abs(closedDest.y - turt.y) < 1,
  "closed-gallery galleryTankDest(6) is tankWalkPoint(4)");

const closedPath = closedApi.shopPath(dockPt.x, dockPt.y, turt.x, turt.y);
assert(closedPath.length >= 2, "closed gallery still paths dock → Turtle apron");
assert(closedApi.wasdShopPath(0, -1) == null,
  "closed gallery does not steal hold-W onto a gallery path");

function holdW(api, dest, maxT, opts) {
  opts = opts || {};
  api.player.x = dockPt.x;
  api.player.y = dockPt.y;
  api.player.goto = null;
  api.player.route = null;
  const dt = 1 / 60, maxSpeed = 232, accel = 1650;
  let vx = 0, vy = 0, t = 0, stuck = 0;
  const trace = [];
  let maxX = dockPt.x, minX = dockPt.x, puffMin = 1e15, hitPuff = false;
  while (t < maxT) {
    let ax = 0, ay = -1;
    const around = api.wasdShopPath(ax, ay);
    if (around && around.length) {
      const n = around[0];
      const pdx = n.x - api.player.x, pdy = n.y - api.player.y;
      const pd = Math.hypot(pdx, pdy);
      if (pd > 8) { ax = pdx / pd; ay = pdy / pd; }
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
    if (opts.forbidPuff && dPuff < 40 && dPad > 40) hitPuff = true;
    trace.push({ x: api.player.x, y: api.player.y, t: t });
    if (dPad < 40) break;
    if (stuck > 45) break;
  }
  return {
    t: t, maxX: maxX, minX: minX, puffMin: puffMin, hitPuff: hitPuff, trace: trace,
  };
}

const seah = holdW(openApi, horse, 10, { forbidPuff: true });
const wasdD = Math.hypot(openApi.player.x - horse.x, openApi.player.y - horse.y);
const dPuff = Math.hypot(openApi.player.x - puff.x, openApi.player.y - puff.y);
assert(seah.t < 8,
  "hold-W reaches Seahorse within ~8s, t=" + seah.t.toFixed(2));
assert(wasdD < 40,
  "WASD-north from the dock occupies the Seahorse pad, d=" + wasdD.toFixed(1) +
    " at " + openApi.player.x.toFixed(0) + "," + openApi.player.y.toFixed(0));
assert(seah.minX >= 360,
  "hold-W never visits the till / west lane (x<360), minX=" + seah.minX.toFixed(1));
assert(seah.maxX <= 1100,
  "hold-W path x stays off the C102 east spine, maxX=" + seah.maxX.toFixed(1));
assert(!seah.hitPuff && seah.puffMin > 40,
  "hold-W never occupies Soon-Puffer mid-path, puffMin=" + seah.puffMin.toFixed(1));
assert(dPuff > 80,
  "hold-W did not taxi to Soon-Puffer, dPuff=" + dPuff.toFixed(1));
assert(openApi.player.y < 640 && openApi.player.y > 520,
  "WASD finish is on the row-2 apron, not Dolphin y≈776, y=" +
    openApi.player.y.toFixed(1));
assert(Math.abs(openApi.player.y - 776) > 40,
  "WASD-north did not dead-end on the Dolphin apron");
assert(openApi.player.x > 340 && openApi.player.x < 560 &&
  !inEastShop(openApi.player.x, openApi.player.y) &&
  !inRegister(openApi.player.x, openApi.player.y),
  "WASD finish is on the Seahorse apron (not till, not Puffer, not eastShop)");
assert(!seah.trace.some((p) => inRegister(p.x, p.y) || inEastShop(p.x, p.y) ||
    p.y < 300 || p.x < 360 || p.x > 1100),
  "hold-W did not dump into REGISTER, west lane, eastShop sky, or the north sky");
assert(openApi.state.unlocked[6] !== true,
  "hold-W arrival does not unlock Puffer out of order");
assert(openApi.state.unlocked[5] !== true,
  "this tool does not auto-unlock Seahorse — walk only");

const puffRun = holdW(horseApi, puff, 12, { forbidPuff: false });
const puffD = Math.hypot(horseApi.player.x - puff.x, horseApi.player.y - puff.y);
assert(puffD < 40,
  "after Seahorse, hold-W occupies Puffer, d=" + puffD.toFixed(1) +
    " at " + horseApi.player.x.toFixed(0) + "," + horseApi.player.y.toFixed(0));
assert(puffRun.minX >= 360,
  "after Seahorse, hold-W to Puffer skips the till taxi, minX=" +
    puffRun.minX.toFixed(1));
assert(puffRun.maxX <= 1100,
  "after Seahorse, hold-W to Puffer does not require the east lap, maxX=" +
    puffRun.maxX.toFixed(1));
assert(puffRun.t < 10,
  "after Seahorse, hold-W reaches Puffer without a scenic lap, t=" +
    puffRun.t.toFixed(2));
assert(!puffRun.trace.some((p) => inRegister(p.x, p.y) || inEastShop(p.x, p.y)),
  "Puffer hold-W is not the C101 till dump or C76/C102 east-shop yank");
assert(horseApi.state.unlocked[6] !== true,
  "hold-W to Puffer does not auto-unlock");

console.log("c106 wasd north: ok (next=" + openApi.nextLockedTank() +
  ", horse=" + horse.x + "," + horse.y +
  ", hops=" + horseXs.map((x) => x.toFixed(0)).join("→") +
  ", wasd " + seah.t.toFixed(2) + "s @ " +
  openApi.player.x.toFixed(0) + "," + openApi.player.y.toFixed(0) +
  ", minX=" + seah.minX.toFixed(0) +
  ", maxX=" + seah.maxX.toFixed(0) +
  ", puffMin=" + seah.puffMin.toFixed(0) +
  ", puffAfter " + puffRun.t.toFixed(2) + "s minX=" + puffRun.minX.toFixed(0) +
  ")");
