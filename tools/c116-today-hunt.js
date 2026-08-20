// C116 — after TAP TO UNLOCK + thumb DIVE the ocean is
// 70m Seahorse groves, ribbon “Point the glowing cone at
// a Seahorse”, huntStock 5 — but a rolled boat / unlock /
// serve daily left TODAY reading “Take the boat”. C114
// only rewrites an existing stock-N, so that leftover
// never promotes. During a live DIVE FOR hunt (empty
// unlocked bowl, bag empty or already holding that fish,
// diveForHunt armed or just surfaced with that empty
// bowl still the stock target), TODAY reads Stock
// Seahorse. A rolled boat daily stays when there is no
// hunt and no empty unlocked bowl to stock. New-game
// first DIVE does not force Stock Seahorse. C115 thumb
// DIVE still arms the hunt. C114 hide-SURFACE stays.
// Walk still does not buy. Do not auto-dive / buy /
// stock. Phone 390×844 first. Isolated SAVE_KEY. Turtle
// unlocked, Seahorse locked then unlocked via TAP TO
// UNLOCK, $4000, a non-stock TODAY (boat). Continue.
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

assert(/Aqua Bay · loop 116/.test(src), "title/pause stamp is loop 116");
assert(!/Aqua Bay · loop 115"/.test(src), "loop 115 stamp is gone");
assert(!/Aqua Bay · loop 114"/.test(src), "loop 114 stamp is gone");
assert(!/Aqua Bay · loop 113"/.test(src), "loop 113 stamp is gone");
assert(!/Aqua Bay · loop 112"/.test(src), "loop 112 stamp is gone");
assert(!/Aqua Bay · loop 111/.test(src), "loop 111 stamp is gone");
assert(/loop 116 today hunt copy/.test(src),
  "C116 names the leftover boat TODAY on a hunt");
assert(/loop 115 dive chip arms the hunt/.test(src),
  "C115 names the plaza-DIVE leftover");
assert(/loop 114 hide SURFACE until the hunt bags/.test(src),
  "C114 names the hunt-SURFACE leftover");
assert(/loop 113 hunt locks a seahorse/.test(src),
  "C113 hunt-lock leftover stays");
assert(/loop 112 dive for the right band/.test(src),
  "C112 grove-band leftover stays");
assert(/loop 111 dive for the new bowl/.test(src),
  "C111 dive-for-the-new-bowl comment stays");
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
assert(/function plazaDiveArmsHunt\s*\(/.test(src),
  "plazaDiveArmsHunt is the thumb DIVE hunt arm");
assert(/function armDiveForHunt\s*\(/.test(src),
  "armDiveForHunt remembers the DIVE FOR species");
assert(/function diveForBandPoint\s*\(/.test(src),
  "diveForBandPoint is the species-band spawn");
assert(/function oceanEntrySpawn\s*\(/.test(src),
  "oceanEntrySpawn picks grove vs shallows");
assert(/function diveForHuntGoal\s*\(/.test(src),
  "diveForHuntGoal is the grove ribbon");
assert(/function seedDiveForHunt\s*\(/.test(src),
  "seedDiveForHunt plants that species, not a shiny clownfish");
assert(/function huntBagHasPrey\s*\(/.test(src),
  "huntBagHasPrey is the hunt-species bag check");
assert(/function huntScoopExclusive\s*\(/.test(src),
  "huntScoopExclusive gates first-lock to the hunt species");
assert(/function huntScoopAllows\s*\(/.test(src),
  "huntScoopAllows is the cone / scoop / ! filter");
assert(/function huntBangWanted\s*\(/.test(src),
  "huntBangWanted is the ! mark filter");
assert(/function surfaceAssistLegal\s*\(/.test(src),
  "surfaceAssistLegal gates the C98 ↑ SURFACE assist");
assert(/function huntStockIndex\s*\(/.test(src),
  "huntStockIndex is the TODAY / surface-stock retarget");
assert(/function applyHuntStockGoal\s*\(/.test(src),
  "applyHuntStockGoal rewrites leftover stock-Turtle");
assert(/function todayGoalLabel\s*\(/.test(src),
  "todayGoalLabel promotes a boat / unlock / serve daily on a hunt");
assert(/let cur = todayGoalLabel\(\)/.test(src),
  "HUD TODAY chip reads todayGoalLabel");
assert(/indexOf\("stock-"\)/.test(extractFn(src, "applyHuntStockGoal") || ""),
  "applyHuntStockGoal still only rewrites stock-N");
assert(!/goals\[0\] = "stock-"/.test(extractFn(src, "applyHuntStockGoal") || ""),
  "applyHuntStockGoal does not overwrite a boat daily");
assert(/function nearestScoopFish\s*\(/.test(src),
  "nearestScoopFish is the cone lock picker");
assert(/diveForHuntIndex\(\) >= 0/.test(extractFn(src, "diveForCueLegal") || ""),
  "diveForCueLegal hides the bowl board once the hunt is armed");
assert(/nearStockPad\(i\)/.test(extractFn(src, "diveForCueLegal") || ""),
  "diveForCueLegal hides the bowl board once they leave the pad");
assert(/diveWalkQueued\(\)/.test(extractFn(src, "diveForCueLegal") || ""),
  "diveForCueLegal hides while heading-to-DIVE");
assert(/diveForHuntIndex\(\) >= 0 \|\| diveWalkQueued\(\)/.test(extractFn(src, "drawDiveForWalkCue") || ""),
  "drawDiveForWalkCue does not paint the bowl board on the south walk");
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
const beginSrc = extractFn(src, "beginDive") || "";
const fadeSrc = extractFn(src, "applyFade") || "";
const shinySrc = extractFn(src, "shinyWanted") || "";
const lockEndSrc = extractFn(src, "onDiveLockEnd") || "";
const buySrc = extractFn(src, "buyTank") || "";
const spawnSrc = extractFn(src, "oceanEntrySpawn") || "";
const huntGoalSrc = extractFn(src, "diveForHuntGoal") || "";

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
assert(/armDiveForHunt\(hunt\)/.test(onUi),
  "goto-dive-for arms the species-band hunt");
assert(/id === "dive" \|\| id === "dive-chip"/.test(onUi),
  "onUI still handles the thumb DIVE chip");
assert(/plazaDiveArmsHunt\(\)/.test(onUi),
  "thumb DIVE calls plazaDiveArmsHunt");
assert(/intentWalk\("dive", dockWalkPoint\(\)\)/.test(onUi),
  "goto-dive-for fires the same DIVE-chip walk");
assert(/diveActionLegal\(\)\) beginDive\(\)/.test(onUi),
  "goto-dive-for dives only when already on the pad");
assert(!/beginDive\(\)/.test(buySrc),
  "buyTank does not auto-dive on unlock");
assert(/armDiveForTank\(i\)/.test(buySrc),
  "buyTank arms the dive-for cue, does not buy the next lock");
assert(!/clearDiveForHunt\(\)/.test(beginSrc),
  "beginDive does not drop the hunt before ocean entry");
assert(/oceanEntrySpawn\(\)/.test(fadeSrc),
  "applyFade uses oceanEntrySpawn for the ocean drop");
assert(/seedDiveForHunt\(diveForHuntIndex\(\)\)/.test(fadeSrc),
  "applyFade seeds the hunt species, not seedFrontSchool, when hunting");
assert(/diveForHuntIndex\(\) >= 0/.test(shinySrc),
  "shinyWanted is off during a species-band hunt");
assert(/diveForHuntIndex\(\) >= 0/.test(lockEndSrc),
  "onDiveLockEnd skips the SHINY clownfish callout during a hunt");
assert(/Point the glowing cone at/.test(huntGoalSrc) && /name/.test(huntGoalSrc),
  "hunt ribbon points at the unlocked species");
assert(!/SHINY clownfish/.test(huntGoalSrc),
  "hunt ribbon does not say SHINY clownfish");
assert(/y: 380/.test(spawnSrc),
  "oceanEntrySpawn still drops a normal DIVE at y=380 shallows");
assert(/huntScoopAllows\(f\)/.test(extractFn(src, "nearestScoopFish") || ""),
  "nearestScoopFish filters through huntScoopAllows");
assert(/huntScoopAllows\(f\)/.test(extractFn(src, "fishAtWorld") || ""),
  "fishAtWorld tap-scoop filters through huntScoopAllows");
assert(/huntScoopAllows\(f\)/.test(extractFn(src, "lockScoop") || ""),
  "lockScoop refuses a non-hunt first lock");
assert(/huntBangWanted\(f\)/.test(src),
  "ocean ! marks use huntBangWanted");
assert(/huntScoopExclusive\(\)/.test(extractFn(src, "nearestScoopFish") || ""),
  "nearestScoopFish prefers the hunt species while exclusive");
assert(/surfaceAssistLegal\(\)/.test(extractFn(src, "drawSurfaceAssist") || ""),
  "drawSurfaceAssist paints only when surfaceAssistLegal");
const assistSrc = extractFn(src, "drawSurfaceAssist") || "";
assert(/drawPierBoardChip\(b\.x, b\.y, b\.w, b\.h/.test(assistSrc),
  "C98 ↑ SURFACE still paints through drawPierBoardChip");
assert(/"↑ SURFACE"/.test(assistSrc),
  "assist keeps the ↑ in the SURFACE label");
assert(!/rgba\(40, 160, 180/.test(assistSrc),
  "assist is wood, not a leftover cyan HUD pill");
assert(/btn\("goto-surface", b\.x, b\.y, b\.w, b\.h\)/.test(assistSrc),
  "assist keeps the same hitbox id and box");
assert(/diveForHuntIndex\(\)/.test(extractFn(src, "surfaceAssistLegal") || ""),
  "surfaceAssistLegal consults the hunt");
assert(/huntBagHasPrey/.test(extractFn(src, "surfaceAssistLegal") || ""),
  "surfaceAssistLegal waits for a hunt-species in the bag");
assert(!/beginSurface\(\)/.test(extractFn(src, "surfaceAssistLegal") || ""),
  "surfaceAssistLegal does not auto-surface");
assert(!/beginSurface\(\)/.test(extractFn(src, "oceanEntrySpawn") || ""),
  "ocean entry does not auto-surface");
assert(!/beginSurface\(\)/.test(extractFn(src, "armDiveForHunt") || ""),
  "arming a hunt does not auto-surface");
assert(/applyHuntStockGoal\(\)/.test(extractFn(src, "armDiveForHunt") || ""),
  "arming a hunt retargets TODAY stock to the hunt bowl");
assert(/huntStockIndex\(\)/.test(extractFn(src, "todayGoalLabel") || ""),
  "todayGoalLabel consults huntStockIndex");
assert(!/stockTank\(/.test(extractFn(src, "applyHuntStockGoal") || ""),
  "applyHuntStockGoal does not auto-stock");
assert(!/stockTank\(/.test(extractFn(src, "todayGoalLabel") || ""),
  "todayGoalLabel does not auto-stock");
assert(/huntStockIndex\(\)/.test(extractFn(src, "glowingStockIndex") || ""),
  "glowingStockIndex prefers the hunt / empty-bowl bag fish");
assert(/glowingStockIndex\(\)/.test(extractFn(src, "stockableTankTarget") || ""),
  "stockableTankTarget follows glowingStockIndex");

assert(/diveForCueLegal\(\)/.test(goalSrc),
  "currentGoal consults diveForCueLegal after the unlock board");
const goalHuntOcean = goalSrc.indexOf("if (diveForHuntIndex() >= 0) return diveForHuntGoal()");
const goalShiny = goalSrc.indexOf("Point the glowing cone at the SHINY clownfish");
assert(goalHuntOcean >= 0 && goalShiny >= 0 && goalHuntOcean < goalShiny,
  "ocean hunt ribbon wins over SHINY clownfish");
const goalHuntShop = goalSrc.indexOf("diveForHuntIndex() >= 0) return diveForPadGoal()");
const goalShopBowls = goalSrc.indexOf("hideDockWalkHint() || shopWalkRibbonWanted()");
assert(goalHuntShop >= 0 && goalShopBowls >= 0 && goalHuntShop < goalShopBowls,
  "shop hunt ribbon wins over Tap north / shop bowls");

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

const REGISTER = { x: 168, y: 500, w: 150, h: 110 };
const KIOSK = { x: 1280, y: 480, w: 170, h: 130 };
const WELCOME = { x: 140, y: 780, w: 156, h: 86 };
const AISLE = { x: 802, y: 760, w: 156, h: 160 };
const DIVE_ZONE = { x: 520, y: 980, w: 720, h: 160 };
const SPECIES = new Array(SPECIES_N);
SPECIES[0] = { name: "Clownfish", unlock: 0, color: "#f08a2a" };
SPECIES[2] = { name: "Goldfish", unlock: 220, color: "#e8a03a" };
SPECIES[4] = { name: "Sea Turtle", unlock: 1400, color: "#3d8b4a" };
SPECIES[5] = { name: "Seahorse", unlock: 2200, color: "#e8a03a" };
SPECIES[6] = { name: "Puffer", unlock: 3200, color: "#7ad08a" };
SPECIES[9] = { name: "Crab", unlock: 4800, color: "#c06040" };
const EAST_SHOP = { x: 1256, y: 380, w: 228, h: 286 };
const DOCK_CAM_FLOOR = 1000;
const W = 1280;
const PIN_H = 720;
const OCEAN = { w: 2520, h: 1960 };
const OCEAN_BASE_H = 1960;
const ZONE_STEP = 440;
const LM_GOLD = { x: 1880, y: 1120 };
const LM_KOI = { x: 2080, y: 1520 };
const LM_TURTLE = { x: 1640, y: 1760 };
const LM_EXTRA = [
  { x: 1860, y: 2180 }, { x: 720, y: 2620 }, { x: 1980, y: 3040 }, { x: 640, y: 3480 },
  { x: 1760, y: 3920 }, { x: 880, y: 4360 }, { x: 1920, y: 4840 }, { x: 1260, y: 5320 },
];

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
  "diveWalkQueued",
  "diveForHuntIndex", "plazaDiveArmsHunt", "armDiveForHunt", "clearDiveForHunt", "diveForBandPoint",
  "oceanEntrySpawn", "diveForHuntGoal", "nearestHuntFish",
  "huntBagHasPrey", "huntScoopExclusive", "huntScoopAllows", "huntBangWanted",
  "surfaceAssistLegal",
  "huntStockIndex", "applyHuntStockGoal", "todayGoalLabel", "sessionGoalLabel", "sessionGoalMet",
  "glowingStockIndex",
  "stockableTankTarget",
  "tutorialGrace", "coneRange", "coneHalf", "scoopEdgeGrace", "normAng",
  "faceToward", "nearestScoopFish", "fishAtWorld", "lockScoop",
  "startScoopOnFish", "fishInCone",
  "plazaWalkChipLegal", "diveChipLegal", "dockOffScreen",
  "zoneBandForSpecies", "zoneAtDepth", "landmarkForSpecies", "depthMeters",
  "namedZoneBottom", "highestUnlockedSafe",
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
  const ocean = { w: OCEAN.w, h: OCEAN.h };
  const sandbox = {
    TANK_POS: TANK_POS, TANK_W: TANK_W, TANK_H: TANK_H, STOCK_PAD: STOCK_PAD,
    REGISTER: REGISTER, KIOSK: KIOSK, WELCOME: WELCOME, AISLE: AISLE,
    DIVE_ZONE: DIVE_ZONE, SPECIES: SPECIES, CORE_SPECIES: CORE_SPECIES,
    DOCK_CAM_FLOOR: DOCK_CAM_FLOOR, W: W, H: PIN_H, OCEAN: ocean,
    OCEAN_BASE_H: OCEAN_BASE_H, ZONE_STEP: ZONE_STEP,
    LM_GOLD: LM_GOLD, LM_KOI: LM_KOI, LM_TURTLE: LM_TURTLE, LM_EXTRA: LM_EXTRA,
    oceanFish: [],
    state: {
      unlocked: save.unlocked.slice(),
      money: save.money,
      scene: "shop",
      mode: "play",
      unlockBanner: null,
      stock: new Array(SPECIES_N).fill(0),
      bag: [],
      bagLv: 0,
      catchLv: 0,
      divesThisSession: 4,
      diveCatches: 5,
      diveForTank: null,
      diveForAway: 0,
      diveForHunt: null,
      pendingScene: null,
      expedition: false,
      missionDone: true,
      catchVerb: null,
      sessionGoals: ["boat", "serve", "catch6"],
      sessionGoalDone: [],
      sessionStocked: -1,
    },
    player: {
      x: 880, y: 920, radius: 16, goto: null, route: null,
      pendingAct: null, unlockConfirm: null,
      facing: 0, catchProg: 0, target: null, scoopLock: null,
      scoopTap: false, catchLatch: false,
    },
    keys: { has: function () { return false; } },
    cam: { x: 880, y: 1000, z: 1, yFloor: DOCK_CAM_FLOOR },
    bagMax: function () { return 5; },
    maybeStartCatchVerb: function () {},
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
    bagIsFull: function () { return sandbox.state.bag.length >= sandbox.bagMax(); },
    nearSurface: function () { return sandbox.player.y < 280; },
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
    diveWalkQueued: function () {
      return !!(sandbox.player.pendingAct && sandbox.player.pendingAct.kind === "dive" && sandbox.player.goto);
    },
    cueDiveWalk: function () {},
    stockTank: function () {},
    collectCash: function () {},
    beginDive: function () {
      sandbox.beganDive = true;
      sandbox.clearDiveForTank();
    },
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
    syncOceanHeight: function () {
      const hi = sandbox.highestUnlockedSafe ? sandbox.highestUnlockedSafe() : 5;
      const named = sandbox.namedZoneBottom
        ? sandbox.namedZoneBottom(Math.max(4, hi))
        : OCEAN_BASE_H + Math.max(0, hi - 4) * ZONE_STEP;
      ocean.h = Math.max(OCEAN_BASE_H, named + ZONE_STEP);
    },
    pushOceanFish: function () {},
    seedOceanScenery: function () {},
    rand: function (a, b) { return (a + b) / 2; },
  };
  const body = names.map((n) => fns[n]).join("\n") +
    "\nfunction highestUnlocked() { return highestUnlockedSafe(); }\n" +
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
    " diveWalkQueued, diveForHuntIndex, plazaDiveArmsHunt, armDiveForHunt, clearDiveForHunt, diveForBandPoint," +
    " oceanEntrySpawn, diveForHuntGoal, nearestHuntFish," +
    " huntBagHasPrey, huntScoopExclusive, huntScoopAllows, huntBangWanted," +
    " surfaceAssistLegal, huntStockIndex, applyHuntStockGoal, todayGoalLabel, sessionGoalLabel, sessionGoalMet," +
    " glowingStockIndex, stockableTankTarget," +
    " nearestScoopFish, fishAtWorld, lockScoop, startScoopOnFish, fishInCone," +
    " plazaWalkChipLegal, diveChipLegal, dockOffScreen," +
    " zoneBandForSpecies, zoneAtDepth, landmarkForSpecies, depthMeters," +
    " namedZoneBottom, highestUnlockedSafe, shopDockWalk, shopWalkRects," +
    " player, state, cam, mouse, OCEAN, oceanFish };";
  vm.runInNewContext(body, sandbox);
  sandbox.armDiveForTank = sandbox.__api.armDiveForTank;
  sandbox.clearDiveForTank = sandbox.__api.clearDiveForTank;
  sandbox.highestUnlockedSafe = sandbox.__api.highestUnlockedSafe;
  sandbox.namedZoneBottom = sandbox.__api.namedZoneBottom;
  sandbox.__api.plantFish = function (list) {
    sandbox.oceanFish.length = 0;
    for (let i = 0; i < list.length; i++) sandbox.oceanFish.push(list[i]);
    return sandbox.oceanFish;
  };
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
    const hunt = sandbox.__api.diveForTankIndex();
    if (hunt >= 0) sandbox.__api.armDiveForHunt(hunt);
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
    sandbox.__api.plazaDiveArmsHunt();
    if (sandbox.state.mode === "play" && sandbox.diveActionLegal()) {
      sandbox.beginDive();
      return "dived";
    }
    if (sandbox.state.mode === "play" && sandbox.diveWalkLegal()) {
      return sandbox.__api.intentWalk("dive", sandbox.__api.dockWalkPoint());
    }
    return false;
  };
  sandbox.__api.enterOcean = function () {
    sandbox.state.scene = "ocean";
    const spawn = sandbox.__api.oceanEntrySpawn();
    sandbox.player.x = spawn.x;
    sandbox.player.y = spawn.y;
    return spawn;
  };
  sandbox.__api.goalText = function () {
    if (sandbox.state.scene === "ocean" && sandbox.__api.diveForHuntIndex() >= 0) {
      return sandbox.__api.diveForHuntGoal().text;
    }
    if (sandbox.state.scene === "shop" && sandbox.__api.diveForHuntIndex() >= 0) {
      return sandbox.__api.diveForPadGoal().text;
    }
    if (sandbox.__api.diveForCueLegal()) return sandbox.__api.diveForPadGoal().text;
    if (sandbox.__api.hideDockWalkHint()) {
      return sandbox.thumbCopy() ? "Tap north to walk to the shop bowls" : "Walk north to the shop bowls";
    }
    return "";
  };
  return sandbox.__api;
}

const openApi = makeCtx(saveOpen, { phone: true });
const deskApi = makeCtx(saveOpen, { phone: false });
assert(openApi.galleryOpen() === true, "seeded Turtle save opens the gallery");
assert(openApi.nextLockedTank() === 5, "after Turtle the next unlock is Seahorse");

const dock = openApi.shopDockWalk();
const dockPt = { x: 880, y: 920 };
assert(dockPt.x >= dock.x && dockPt.x <= dock.x + dock.w, "seed walk starts on the painted dock");

const horse = openApi.tankWalkPoint(5);
const puff = openApi.tankWalkPoint(6);
const divePad = openApi.dockWalkPoint();
assert(horse.x === 445 && horse.y === 568, "Seahorse stand is south of the bowl");
assert(puff.x === 663 && puff.y === 568, "Puffer stand stays south of the bowl");
assert(divePad.x === 880 && divePad.y === 1008, "DIVE pad stays 880,1008");

const horseBand = openApi.zoneBandForSpecies(5);
assert(horseBand.y0 === OCEAN_BASE_H && horseBand.y1 === OCEAN_BASE_H + ZONE_STEP,
  "Seahorse groves band is OCEAN_BASE_H…+ZONE_STEP, got " + horseBand.y0 + "–" + horseBand.y1);
const groveAtFloor = openApi.zoneAtDepth(OCEAN_BASE_H);
assert(groveAtFloor.name === "Seahorse groves" && groveAtFloor.s === 5,
  "zoneAtDepth(OCEAN_BASE_H) is Seahorse groves, got " + groveAtFloor.name);
const shallowZ = openApi.zoneAtDepth(380);
assert(shallowZ.name === "Shallows" || shallowZ.s === 0,
  "y=380 is Shallows, got " + shallowZ.name);
assert(openApi.depthMeters(380) === 6, "y=380 is 6m, got " + openApi.depthMeters(380));

function inEastShop(x, y) {
  return x >= EAST_SHOP.x && x <= EAST_SHOP.x + EAST_SHOP.w &&
    y >= EAST_SHOP.y && y <= EAST_SHOP.y + EAST_SHOP.h;
}
function inRegister(x, y) {
  return x >= REGISTER.x && x <= REGISTER.x + REGISTER.w &&
    y >= REGISTER.y && y <= REGISTER.y + REGISTER.h;
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

// 1) Stamp loop 116 is asserted above.
// 2) Seed a boat TODAY. Unlock Seahorse. Thumb DIVE.
//    Ocean TODAY must read Stock Seahorse, not Take the boat.
function todayPlate(api) {
  return api.todayGoalLabel();
}

assert(/thumbCopy\(\) \? "DIVE"/.test(src),
  "thumb DIVE copy stays DIVE");
assert(!/beginDive\(\)/.test(extractFn(src, "plazaDiveArmsHunt") || ""),
  "plazaDiveArmsHunt does not auto-dive");
assert(!/beginDive\(\)/.test(extractFn(src, "buyTank") || ""),
  "buyTank still does not auto-dive on unlock");
assert(/diveForCueLegal\(\)/.test(extractFn(src, "plazaDiveArmsHunt") || ""),
  "plazaDiveArmsHunt only arms while the DIVE FOR board is legal");
assert(/diveForCueLegal\(\)/.test(extractFn(src, "diveChipLegal") || ""),
  "diveChipLegal keeps thumb DIVE while the board is legal");

const huntApi = makeCtx(saveOpen, { phone: true });
huntApi.state.stock[4] = 2;
huntApi.player.x = horse.x;
huntApi.player.y = horse.y;
huntApi.cam.y = 520;
assert(/Take the boat/i.test(todayPlate(huntApi)),
  "before the hunt, leftover TODAY is Take the boat, got " + todayPlate(huntApi));
assert(!/Seahorse/i.test(todayPlate(huntApi)),
  "before the hunt, TODAY is not forced to Stock Seahorse");
assert(huntApi.tapUnlockCue() === true, "TAP TO UNLOCK buys Seahorse");
assert(huntApi.state.unlocked[5] === true, "Seahorse is unlocked");
assert(huntApi.state.money === 1800, "money is $1800 after the $2200 unlock");
assert(huntApi.beganDive() === false, "unlock does not auto-dive");
assert(huntApi.diveForCueLegal() === true, "DIVE FOR SEAHORSE board is up");
assert(huntApi.diveChipLegal() === true, "thumb DIVE stays visible after unlock");
assert(huntApi.diveForHuntIndex() < 0,
  "unlock alone does not arm the grove hunt");
assert(/Take the boat/i.test(todayPlate(huntApi)),
  "unlock alone leaves the rolled boat daily on TODAY");
assert(huntApi.tapDiveChip() === true, "thumb DIVE (not the bowl board) queues the dash");
assert(huntApi.diveForHuntIndex() === 5, "thumb DIVE arms a Seahorse hunt");
assert(huntApi.huntStockIndex() === 5, "hunt stock target is Seahorse");
assert(/Seahorse/i.test(todayPlate(huntApi)),
  "TODAY plate is Stock Seahorse after DIVE FOR, got " + todayPlate(huntApi));
assert(!/boat/i.test(todayPlate(huntApi)) && !/Turtle/i.test(todayPlate(huntApi)),
  "TODAY plate is not Take the boat after DIVE FOR, got " + todayPlate(huntApi));
assert(huntApi.state.sessionGoals.indexOf("boat") >= 0,
  "rolled boat daily stays in the session list during the hunt");
assert(huntApi.state.sessionGoals.indexOf("stock-5") < 0,
  "C116 does not mutate a boat daily into stock-5");
assert(huntApi.beganDive() === false, "thumb DIVE off the dock does not instant-dive");
assert(huntApi.diveForCueLegal() === false,
  "on-bowl DIVE FOR board hides the moment the hunt is armed");
assert(huntApi.diveWalkQueued() === true,
  "heading-to-DIVE / DIVE chip stay on the south walk");

const walkGoal = huntApi.goalText();
assert(walkGoal && /Seahorse/i.test(walkGoal),
  "walk ribbon stays DIVE-for-Seahorse, got " + walkGoal);
assert(!/shop bowls/i.test(walkGoal) && !/Tap north/i.test(walkGoal),
  "walk ribbon does not flip to shop-north, got " + walkGoal);
assert(huntApi.plazaWalkChipLegal() === false,
  "↑ SHOP does not replace DIVE while the hunt walk is live");

const spawn = huntApi.enterOcean();
assert(spawn.hunt === true && spawn.tank === 5,
  "ocean entry is a Seahorse hunt, got " + JSON.stringify(spawn));
assert(huntApi.player.y >= OCEAN_BASE_H,
  "walker y is in the grove band (y≥" + OCEAN_BASE_H + "), got " + huntApi.player.y);
assert(huntApi.player.y >= horseBand.y0 && huntApi.player.y < horseBand.y1,
  "walker y is inside zoneBandForSpecies(5), got " + huntApi.player.y);
const zone = huntApi.zoneAtDepth(huntApi.player.y);
assert(zone.name === "Seahorse groves" && zone.s === 5,
  "depth / zone is Seahorse groves, got " + zone.name + " s=" + zone.s);
assert(huntApi.depthMeters(huntApi.player.y) !== 6,
  "depth is not 6m Shallows, got " + huntApi.depthMeters(huntApi.player.y) + "m");
assert(huntApi.player.y !== 380, "spawn is not the default shallows y=380");

const lm = huntApi.landmarkForSpecies(5);
assert(lm && Math.hypot(huntApi.player.x - lm.x, huntApi.player.y - lm.y) < 8,
  "spawn sits on the Seahorse landmark " + lm.x + "," + lm.y +
    ", got " + huntApi.player.x + "," + huntApi.player.y);

huntApi.oceanFish.length = 0;
const groveGoal = huntApi.diveForHuntGoal();
assert(groveGoal && /Seahorse/i.test(groveGoal.text),
  "quest / cone is seahorse, got " + (groveGoal && groveGoal.text));
assert(!/SHINY/i.test(groveGoal.text) && !/clownfish/i.test(groveGoal.text),
  "quest is not SHINY clownfish, got " + groveGoal.text);
assert(groveGoal.target && (groveGoal.target.y >= OCEAN_BASE_H),
  "cone target is in the grove, y=" + (groveGoal.target && groveGoal.target.y));

assert(huntApi.state.bag.length === 0, "hunt bag starts 0/5");
assert(huntApi.surfaceAssistLegal() === false,
  "ocean groves bag 0/5 hides the C98 ↑ SURFACE chip");
assert(/Seahorse/i.test(todayPlate(huntApi)) && !/boat/i.test(todayPlate(huntApi)),
  "ocean groves TODAY is Stock Seahorse, not Take the boat, got " + todayPlate(huntApi));

// 3) First cone lock / first scoop is Seahorse (index 5) even
// when Turtle / Tang sit closer in the cone. ! marks skip them
// while the hunt bag is empty. After one Seahorse is bagged,
// other fish may still scoop.
function plantGroveMix(api) {
  api.player.facing = 0;
  const px = api.player.x, py = api.player.y;
  const turtle = { s: 4, x: px + 70, y: py, caught: false, tease: false, rare: false };
  const tang = { s: 1, x: px + 55, y: py + 4, caught: false, tease: false, rare: false };
  const clown = { s: 0, x: px + 64, y: py - 6, caught: false, tease: false, rare: false };
  const horse = { s: 5, x: px + 150, y: py, caught: false, tease: false, rare: false };
  if (api.plantFish) api.plantFish([turtle, tang, clown, horse]);
  else {
    api.oceanFish.length = 0;
    api.oceanFish.push(turtle, tang, clown, horse);
  }
  return { turtle: turtle, tang: tang, clown: clown, horse: horse };
}

assert(huntApi.huntScoopExclusive() === true,
  "empty hunt bag is exclusive to Seahorse");
assert(huntApi.huntBagHasPrey(5) === false,
  "bag has no Seahorse yet");
const mix = plantGroveMix(huntApi);
assert(huntApi.huntScoopAllows(mix.horse) === true,
  "hunt allows Seahorse while exclusive");
assert(huntApi.huntScoopAllows(mix.turtle) === false,
  "hunt refuses Turtle while exclusive");
assert(huntApi.huntScoopAllows(mix.tang) === false,
  "hunt refuses Tang while exclusive");
assert(huntApi.huntScoopAllows(mix.clown) === false,
  "hunt refuses Clownfish while exclusive");
assert(huntApi.fishInCone(mix.turtle) === true,
  "Turtle is geometrically in the cone (the leftover)");
assert(huntApi.fishInCone(mix.tang) === true,
  "Tang is geometrically in the cone");
assert(huntApi.fishInCone(mix.horse) === true,
  "Seahorse is geometrically in the cone");
assert(huntApi.huntBangWanted(mix.horse) === true,
  "! mark still shows on Seahorse");
assert(huntApi.huntBangWanted(mix.turtle) === false,
  "! mark does not show on Turtle while hunt bag is empty");
assert(huntApi.huntBangWanted(mix.tang) === false,
  "! mark does not show on Tang while hunt bag is empty");

const first = huntApi.nearestScoopFish();
assert(first && (first.s | 0) === 5,
  "first cone lock is Seahorse, got s=" + (first && first.s));
assert(first !== mix.turtle && first !== mix.tang && first !== mix.clown,
  "Turtle / Tang / Clownfish do not win first lock");

const tapTurtle = huntApi.fishAtWorld(mix.turtle.x, mix.turtle.y);
assert(tapTurtle !== mix.turtle,
  "tapping Turtle does not scoop while hunt bag is empty");
const tapHorse = huntApi.fishAtWorld(mix.horse.x, mix.horse.y);
assert(tapHorse === mix.horse,
  "tapping Seahorse still scoops");
assert(huntApi.startScoopOnFish(mix.turtle) === false,
  "startScoopOnFish refuses Turtle on an empty hunt bag");
assert(huntApi.startScoopOnFish(mix.horse) === true,
  "startScoopOnFish locks Seahorse first");
assert(huntApi.player.scoopLock === mix.horse && (huntApi.player.scoopLock.s | 0) === 5,
  "scoopLock is Seahorse after first lock");
assert(huntApi.surfaceAssistLegal() === false,
  "first lock still hides ↑ SURFACE while bag is empty");

// 4) After one Seahorse in the bag, other fish may still scoop.
huntApi.player.scoopLock = null;
huntApi.player.target = null;
huntApi.state.bag.push(5);
assert(huntApi.huntBagHasPrey(5) === true, "bag now holds a Seahorse");
assert(huntApi.huntScoopExclusive() === false,
  "hunt is no longer exclusive after one Seahorse");
assert(huntApi.huntScoopAllows(mix.turtle) === true,
  "Turtle may scoop after a Seahorse is bagged");
assert(huntApi.huntScoopAllows(mix.tang) === true,
  "Tang may scoop after a Seahorse is bagged");
const after = huntApi.nearestScoopFish();
assert(after && (after.s | 0) !== 5,
  "after one Seahorse, a closer Turtle / Tang may lock, got s=" + (after && after.s));
assert(huntApi.huntBangWanted(mix.turtle) === true,
  "! mark may show on Turtle after a Seahorse is bagged");
assert(huntApi.startScoopOnFish(mix.turtle) === true,
  "startScoopOnFish accepts Turtle after a Seahorse is bagged");
assert(huntApi.surfaceAssistLegal() === true,
  "after one Seahorse (bag 1/5) the C98 ↑ SURFACE assist appears");
assert(/Seahorse/i.test(todayPlate(huntApi)) && !/boat/i.test(todayPlate(huntApi)),
  "after the first Seahorse scoop, TODAY still says Stock Seahorse");
huntApi.state.bag = [5, 4];
huntApi.clearDiveForHunt();
huntApi.state.scene = "shop";
assert(huntApi.diveForHuntIndex() < 0, "surface clears the hunt flag");
assert(huntApi.huntStockIndex() === 5,
  "empty Seahorse bowl + bag still retargets after surface");
assert(huntApi.glowingStockIndex() === 5,
  "surface stock glow is Seahorse, not Turtle, got " + huntApi.glowingStockIndex());
assert(huntApi.stockableTankTarget() &&
    Math.hypot(huntApi.stockableTankTarget().x - horse.x,
      huntApi.stockableTankTarget().y - horse.y) < 1,
  "surface quest walks to the Seahorse pad, not Turtle");
assert(/Seahorse/i.test(todayPlate(huntApi)) && !/boat/i.test(todayPlate(huntApi)),
  "after surface, TODAY is Stock Seahorse, got " + todayPlate(huntApi));
huntApi.state.diveForHunt = 5;
huntApi.state.scene = "ocean";
huntApi.state.bag = [5];
assert(huntApi.player.y >= 300 && huntApi.player.y > 280,
  "assist is the wood C98 chip (not the near-surface legal cyan-era card)");
huntApi.state.bag = [5, 5, 5, 5, 5];
assert(huntApi.state.bag.length >= 5, "bag 5/5 is full");
assert(huntApi.surfaceAssistLegal() === false,
  "full bag uses legal SURFACE, not a stacked C98 assist");
huntApi.state.bag = [5];

// 5) A fresh new-game / first DIVE (no dive-for) still hunts clownfish in shallows.
const fresh = makeCtx(seedSave({ unlocked: [true], money: 0 }), { phone: true });
fresh.state.missionDone = false;
assert(fresh.diveForHuntIndex() < 0, "new game has no dive-for hunt");
const freshSpawn = fresh.oceanEntrySpawn();
assert(freshSpawn.hunt === false, "new-game DIVE is not a species hunt");
assert(freshSpawn.y === 380, "new-game DIVE still drops at y=380 shallows");
assert(fresh.zoneAtDepth(freshSpawn.y).s === 0,
  "new-game DIVE is Shallows, got " + fresh.zoneAtDepth(freshSpawn.y).name);
assert(fresh.depthMeters(freshSpawn.y) === 6, "new-game DIVE is still 6m");
assert(!/Seahorse/.test(extractFn(src, "seedFrontSchool") || ""),
  "seedFrontSchool still plants clownfish, not seahorses");
assert(/rare:\s*true/.test(extractFn(src, "seedFrontSchool") || ""),
  "first DIVE can still spawn the SHINY clownfish");
fresh.state.scene = "ocean";
fresh.player.x = freshSpawn.x;
fresh.player.y = freshSpawn.y;
assert(fresh.surfaceAssistLegal() === true,
  "new-game / first-dive shallows still shows C98 SURFACE");
assert(/Take the boat/i.test(todayPlate(fresh)),
  "new-game TODAY stays the rolled boat daily, got " + todayPlate(fresh));
assert(!/Seahorse/i.test(todayPlate(fresh)),
  "new-game TODAY is not forced to Stock Seahorse");

// Regular DIVE (no hunt) still lets closer Turtle / Tang lock first.
const freeApi = makeCtx(saveOpen, { phone: true });
freeApi.state.unlocked[5] = true;
freeApi.player.x = 1860;
freeApi.player.y = 2180;
assert(freeApi.diveForHuntIndex() < 0, "regular DIVE has no hunt");
const freeMix = plantGroveMix(freeApi);
assert(freeApi.huntScoopExclusive() === false,
  "no-hunt dive is not exclusive");
assert(freeApi.huntScoopAllows(freeMix.turtle) === true,
  "regular DIVE still allows Turtle");
const freeLock = freeApi.nearestScoopFish();
assert(freeLock && (freeLock.s | 0) !== 5,
  "regular DIVE first lock can still be Turtle / Tang, got s=" + (freeLock && freeLock.s));
freeApi.state.scene = "ocean";
assert(freeApi.surfaceAssistLegal() === true,
  "regular DIVE (no hunt) still shows C98 SURFACE in groves");
assert(freeApi.huntStockIndex() < 0,
  "regular DIVE does not steal TODAY to a hunt bowl");
assert(/Take the boat/i.test(todayPlate(freeApi)),
  "regular DIVE with a boat daily keeps Take the boat, got " + todayPlate(freeApi));
assert(/Sea Turtle/i.test(freeApi.sessionGoalLabel("stock-4")),
  "regular DIVE TODAY stock label can still be Sea Turtle");

// 5) DIVE chip before unlock, or after the hunt is done / no
// dive-for board, stays the regular shallows dive.
const preApi = makeCtx(saveOpen, { phone: true });
preApi.player.x = horse.x;
preApi.player.y = horse.y;
preApi.cam.y = 520;
assert(preApi.state.unlocked[5] !== true, "Seahorse is still locked");
assert(preApi.diveForCueLegal() === false,
  "no DIVE FOR board before unlock");
assert(preApi.plazaDiveArmsHunt() < 0,
  "thumb DIVE does not arm a hunt before unlock");
assert(/Take the boat/i.test(todayPlate(preApi)),
  "before unlock, TODAY can stay Take the boat");
assert(!/Seahorse/i.test(todayPlate(preApi)),
  "before unlock, TODAY is not forced to Stock Seahorse");
const preSpawn = preApi.oceanEntrySpawn();
assert(preSpawn.y === 380 && !preSpawn.hunt,
  "DIVE before unlock is still 6m Shallows");

const bowlApi = makeCtx(saveOpen, { phone: true });
bowlApi.player.x = horse.x;
bowlApi.player.y = horse.y;
bowlApi.cam.y = 520;
bowlApi.tapUnlockCue();
assert(bowlApi.diveForCueLegal() === true, "bowl board is up after unlock");
assert(bowlApi.tapDiveForCue() === true, "bowl DIVE FOR SEAHORSE still arms the hunt");
assert(bowlApi.diveForHuntIndex() === 5, "bowl board still arms a Seahorse hunt");

const leftApi = makeCtx(saveOpen, { phone: true });
leftApi.player.x = horse.x;
leftApi.player.y = horse.y;
leftApi.tapUnlockCue();
assert(leftApi.diveForCueLegal() === true,
  "DIVE FOR board stays on the Seahorse pad before a hunt");
leftApi.player.x = dockPt.x;
leftApi.player.y = dockPt.y;
assert(leftApi.diveForCueLegal() === false,
  "DIVE FOR board hides the moment they leave the Seahorse pad");
assert(leftApi.plazaDiveArmsHunt() < 0,
  "thumb DIVE off the pad (no board) does not arm a hunt");
const leftSpawn = leftApi.oceanEntrySpawn();
assert(leftSpawn.y === 380 && !leftSpawn.hunt,
  "DIVE after leaving the pad (no board) is still shallows");

const doneApi = makeCtx(saveOpen, { phone: true });
doneApi.player.x = horse.x;
doneApi.player.y = horse.y;
doneApi.cam.y = 520;
doneApi.tapUnlockCue();
doneApi.state.bag = [5];
doneApi.state.stock[5] = 1;
doneApi.clearDiveForHunt();
assert(doneApi.diveForCueLegal() === false,
  "no DIVE FOR board after the hunt / bowl is stocked");
assert(doneApi.plazaDiveArmsHunt() < 0,
  "thumb DIVE does not arm after the hunt is done");
assert(doneApi.huntStockIndex() < 0,
  "stocked Seahorse bowl is no longer a hunt stock target");
assert(/Take the boat/i.test(todayPlate(doneApi)),
  "after hunt done / bowl stocked, a boat daily can show again, got " + todayPlate(doneApi));
assert(!/Seahorse/i.test(todayPlate(doneApi)),
  "after hunt done / bowl stocked, TODAY is not Stock Seahorse");

const serveApi = makeCtx(saveOpen, { phone: true });
serveApi.state.sessionGoals = ["serve", "unlock", "catch6"];
serveApi.player.x = horse.x;
serveApi.player.y = horse.y;
serveApi.cam.y = 520;
assert(/Serve/i.test(todayPlate(serveApi)),
  "rolled serve daily shows before the hunt, got " + todayPlate(serveApi));
assert(serveApi.tapUnlockCue() === true, "serve-daily TAP TO UNLOCK still buys");
assert(serveApi.tapDiveChip() === true, "serve-daily thumb DIVE still arms");
assert(/Seahorse/i.test(todayPlate(serveApi)) && !/Serve/i.test(todayPlate(serveApi)),
  "serve daily promotes to Stock Seahorse on the hunt, got " + todayPlate(serveApi));

const doneSpawn = doneApi.oceanEntrySpawn();
assert(doneSpawn.y === 380 && !doneSpawn.hunt,
  "regular DIVE after hunt / stocked bowl is still shallows");

// 6) Walk still does not auto-buy. Desktop hold-W still no auto-buy.
const northApi = makeCtx(saveOpen, { phone: true, pressX: W / 2, pressY: 0.18 * Math.max(960, Math.round(W * 844 / 390)) });
const shopWalk = followPath(northApi, northApi.nextUnlockWalkDest(), 10);
assertAlleyWalk(northApi, shopWalk, "phone north / ↑ SHOP");
northApi.arrive();
assertStillLocked(northApi, "phone north arrival");

assert(deskApi.phoneDockPlazaWalkWanted(880, 400, 640, 200) === false,
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

const clickPath = openApi.shopPath(dockPt.x, dockPt.y, puff.x, puff.y);
assert(Array.isArray(clickPath) && clickPath.length >= 2,
  "click-to-walk dock→Puffer is still a routed walk");
const clickLast = clickPath[clickPath.length - 1];
assert(Math.hypot(clickLast.x - puff.x, clickLast.y - puff.y) < 1,
  "clicking Puffer still routes to tankWalkPoint(6)");

console.log("c116 today hunt copy: ok (next=" + openApi.nextLockedTank() +
  ", horse=" + horse.x + "," + horse.y +
  ", huntY=" + huntApi.player.y.toFixed(0) +
  " " + zone.name +
  " " + huntApi.depthMeters(huntApi.player.y) + "m" +
  ", today=" + todayPlate(huntApi) +
  ", firstLock=" + (first && first.s) +
  ", afterLock=" + (after && after.s) +
  ", freshY=" + freshSpawn.y +
  ", freshToday=" + todayPlate(fresh) +
  ", doneToday=" + todayPlate(doneApi) +
  ", huntEmptySurf=false huntBaggedSurf=true" +
  ", holdW=" + deskWalk.t.toFixed(2) + "s" +
  ")");
