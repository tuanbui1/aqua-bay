// C102 — open-gallery dock walk reaches Puffer on the row-2 apron.
// Loop 101 leftover: the west spine (x=300–342) sat west of column 0
// (tanks start at 340) on the till / water. shopPath(dock → tank 6)
// portaled to x≈321; WASD north from Dolphin followed that spine into
// REGISTER. Spine belongs east of the 4-tank cluster (right edge 1204).
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

assert(/Aqua Bay · loop 111/.test(src), "title/pause stamp is loop 111");
assert(!/Aqua Bay · loop 107/.test(src), "loop 107 stamp is gone");
assert(/C102 — C101's west spine/.test(src), "C102 names the east-aisle spine");
assert(/C101 — live gallery bowls fill the old fat neighborhood/.test(src),
  "C101 apron comment stays");
assert(/C101 — collide with the bowl, not a 28px south pad/.test(src),
  "C101 bowl collider stays");
assert(/pushOut\(t\.x, t\.y, TANK_W, TANK_H \+ 8\)/.test(src),
  "tank walk collider is the bowl + 8px lip");

const walkFn = extractFn(src, "shopWalkRects");
assert(walkFn, "shopWalkRects is present");
assert(!/const spine = \{ x: 300, y: clear, w: 42/.test(walkFn),
  "C101 west/till spine is gone");
assert(/x: 1204/.test(walkFn), "open-gallery spine starts at the 4-tank east edge");

assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(/function galleryOpen\s*\(/.test(src), "galleryOpen stays");
assert(/function galleryTankDest\s*\(/.test(src), "galleryTankDest stays");
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
assert(/unlock:\s*1400/.test(src), "Sea Turtle unlock stays $1400");
const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/C76 — one tank neighborhood around the aisle/.test(src), "C76 cluster stays");
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

function padSpeciesFlags(arr) {
  const out = [];
  for (let i = 0; i < SPECIES_N; i++) out[i] = !!(arr && arr[i]);
  out[0] = true;
  return out;
}

// Persist-shaped aqua-bay-save payloads (same key / unlock rules as game.js).
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
  money: 3200,
});
const saveClosed = seedSave({
  unlocked: [true],
  money: 0,
});
assert(saveOpen.unlocked[4] === true && saveOpen.money >= 3200,
  "open save has Sea Turtle + Puffer cash");
assert(saveClosed.unlocked[4] !== true, "closed save has not unlocked Turtle");
assert(saveOpen.unlocked.filter(Boolean).length >= CORE_SPECIES,
  "open save meets galleryOpen via Turtle / core count");

const names = [
  "shopDockWalk", "walkClearY", "tankWalkPoint", "shopWalkRects",
  "snapToShopWalk", "shopRectOverlap", "shopRectHas", "shopPortal",
  "shopPath", "constrainShop", "pushOut", "shopWalkMax",
  "galleryOpen", "tankLive", "galleryTankDest",
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
    "\nthis.__api = { galleryOpen, tankWalkPoint, shopPath, constrainShop," +
    " galleryTankDest, snapToShopWalk, shopWalkRects, shopDockWalk, player, state };";
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

const tillEast = TANK_POS[0].x;
const shopEast = TANK_POS[4].x + TANK_W + 80;
assert(tillEast === 340, "till / water is west of the tank cluster");
assert(shopEast === 1502, "shop bound is measured from Turtle + walk slack");

const openPath = openApi.shopPath(dockPt.x, dockPt.y, puff.x, puff.y);
assert(Array.isArray(openPath) && openPath.length >= 3,
  "open-gallery dock→Puffer is a routed walk, hops=" + (openPath && openPath.length));
assert(openPath.every((pt) => Number.isFinite(pt.x) && Number.isFinite(pt.y)),
  "open-gallery Puffer path is finite");
const pathXs = [dockPt.x].concat(openPath.map((pt) => pt.x));
assert(pathXs.every((x) => x > REGISTER.x + REGISTER.w && x < shopEast),
  "open-gallery path stays east of REGISTER / inside the shop, xs=" +
    pathXs.map((x) => x.toFixed(0)).join(","));
assert(!openPath.some((pt) => pt.x >= 300 && pt.x < 318),
  "open-gallery Puffer path does not use the C101 west/till spine");

const last = openPath[openPath.length - 1];
assert(Math.hypot(last.x - puff.x, last.y - puff.y) < 1,
  "path ends on tankWalkPoint(6)");

// Clicking the Puffer bowl itself is the same dest — not a 1-hop glass cut.
assert(openPath.length > 1, "Puffer bowl click is not a straight hop through glass");

openApi.player.x = puff.x;
openApi.player.y = puff.y;
openApi.constrainShop();
const occDx = openApi.player.x - puff.x, occDy = openApi.player.y - puff.y;
assert(Math.hypot(occDx, occDy) < 8,
  "walker occupies the Puffer pad under constrainShop, d=" +
    Math.hypot(occDx, occDy).toFixed(2));
assert(openApi.player.x > tillEast && openApi.player.y > 520 && openApi.player.y < 640,
  "occupied pad stays on the row-2 apron, not the till");

const closedDest = closedApi.galleryTankDest(6);
assert(Math.abs(closedDest.x - turt.x) < 1 && Math.abs(closedDest.y - turt.y) < 1,
  "closed-gallery galleryTankDest(6) is tankWalkPoint(4)");

const closedPath = closedApi.shopPath(dockPt.x, dockPt.y, turt.x, turt.y);
assert(closedPath.length >= 2, "closed gallery still paths dock → Turtle apron");

console.log("c102 puffer aisle: ok (open hops=" + openPath.length +
  ", xs=" + pathXs.map((x) => Math.round(x)).join("→") + ")");
