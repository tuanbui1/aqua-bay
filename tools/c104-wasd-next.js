// C104 — hold-W after galleryOpen goes to the next locked bowl, not
// Soon-Puffer. Loop 103 leftover: wasdShopPath hardcoded tank 6, so a
// player who just unlocked Turtle always taxied the east spine to a
// locked Puffer. nextLockedTank() after Turtle is Seahorse (5, $2200).
// Click-to-walk Puffer still routes there. Unlock order stays.
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
assert(/function wasdShopPath\s*\(/.test(src), "wasdShopPath stays");
assert(/nextLockedTank\(\)/.test(extractFn(src, "wasdShopPath") || ""),
  "wasdShopPath steers to nextLockedTank, not hardcoded tank 6");
assert(!/tankWalkPoint\(6\)/.test(extractFn(src, "wasdShopPath") || ""),
  "wasdShopPath is not a Puffer magnet");
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

const REGISTER = { x: 168, y: 500, w: 150, h: 110 };
const KIOSK = { x: 1280, y: 480, w: 170, h: 130 };
const WELCOME = { x: 140, y: 780, w: 156, h: 86 };
const AISLE = { x: 802, y: 760, w: 156, h: 160 };
const SPECIES = new Array(SPECIES_N);

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
const saveAll = seedSave({
  unlocked: new Array(SPECIES_N).fill(true),
  money: 0,
});
assert(saveOpen.unlocked[4] === true && saveOpen.unlocked[5] !== true,
  "fresh gallery save has Turtle, not Seahorse");
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
    " shopDockWalk, player, state };";
  vm.runInNewContext(body, sandbox);
  return sandbox.__api;
}

const openApi = makeCtx(saveOpen);
const closedApi = makeCtx(saveClosed);
const allApi = makeCtx(saveAll);
assert(openApi.galleryOpen() === true, "seeded Turtle save opens the gallery");
assert(closedApi.galleryOpen() === false, "seeded starter save keeps the gallery closed");
assert(openApi.nextLockedTank() === 5, "after Turtle the next unlock is Seahorse");
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
  return x >= 1256 && x <= 1256 + 228 && y >= 380 && y <= 380 + 286;
}

const clickPath = openApi.shopPath(dockPt.x, dockPt.y, puff.x, puff.y);
assert(Array.isArray(clickPath) && clickPath.length >= 3,
  "click-to-walk dock→Puffer is still a routed walk");
const clickLast = clickPath[clickPath.length - 1];
assert(Math.hypot(clickLast.x - puff.x, clickLast.y - puff.y) < 1,
  "clicking Puffer still routes to tankWalkPoint(6)");

const closedDest = closedApi.galleryTankDest(6);
assert(Math.abs(closedDest.x - turt.x) < 1 && Math.abs(closedDest.y - turt.y) < 1,
  "closed-gallery galleryTankDest(6) is tankWalkPoint(4)");

const closedPath = closedApi.shopPath(dockPt.x, dockPt.y, turt.x, turt.y);
assert(closedPath.length >= 2, "closed gallery still paths dock → Turtle apron");
assert(closedApi.wasdShopPath(0, -1) == null,
  "closed gallery does not steal hold-W onto a gallery path");

function holdW(api, dest, maxT) {
  api.player.x = dockPt.x;
  api.player.y = dockPt.y;
  api.player.goto = null;
  api.player.route = null;
  const dt = 1 / 60, maxSpeed = 232, accel = 1650;
  let vx = 0, vy = 0, t = 0, stuck = 0;
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
    const dPad = Math.hypot(api.player.x - dest.x, api.player.y - dest.y);
    if (dPad < 40) break;
    if (stuck > 45) break;
  }
  return t;
}

const t = holdW(openApi, horse, 12);
const wasdD = Math.hypot(openApi.player.x - horse.x, openApi.player.y - horse.y);
const dPuff = Math.hypot(openApi.player.x - puff.x, openApi.player.y - puff.y);
assert(t < 10,
  "hold-W reaches the next unlock in under 10s, t=" + t.toFixed(2));
assert(wasdD < 40,
  "WASD-north from the dock occupies the Seahorse pad, d=" + wasdD.toFixed(1) +
    " at " + openApi.player.x.toFixed(0) + "," + openApi.player.y.toFixed(0));
assert(dPuff > 80,
  "hold-W did not taxi to Soon-Puffer, dPuff=" + dPuff.toFixed(1));
assert(openApi.player.y < 640 && openApi.player.y > 520,
  "WASD finish is on the row-2 apron, not Dolphin y≈776, y=" +
    openApi.player.y.toFixed(1));
assert(Math.abs(openApi.player.y - 776) > 40,
  "WASD-north did not dead-end on the Dolphin apron");
assert(openApi.player.x > 340 && openApi.player.x < 560 &&
  !inEastShop(openApi.player.x, openApi.player.y),
  "WASD finish is on the Seahorse apron (not till, not Puffer, not eastShop)");
assert(openApi.state.unlocked[6] !== true,
  "hold-W arrival does not unlock Puffer out of order");
assert(openApi.state.unlocked[5] !== true,
  "this tool does not auto-unlock Seahorse — walk only");

console.log("c104 wasd next: ok (next=" + openApi.nextLockedTank() +
  ", horse=" + horse.x + "," + horse.y +
  ", wasd " + t.toFixed(2) + "s @ " +
  openApi.player.x.toFixed(0) + "," + openApi.player.y.toFixed(0) +
  ", dPuff=" + dPuff.toFixed(0) + ")");
