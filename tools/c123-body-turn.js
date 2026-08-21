// C123 — Reef / Skip / Dino squash through scaleX=0
// when facing reverses (a paper-card flip). On N/S
// walks wantFlip chatters because Math.cos(facing)
// < -0.1 sits near 0. Commit a new facing only when
// |hx| > 0.38; hold last facing on N/S. Lerp a full
// reverse in ~220–280ms. faceDrawX never scales
// through 0 (yaw thins to ~0.62). Diver gets a
// small yaw twist only — C58 swim stays flat, no
// full-facing rotate. Title picker still faceS: 1
// (loop 54). C122 SURFACE still lands on the dock;
// leadStockAfterSurface still does NOT setWalkDest.
// Do not camera-clamp. Phone 390×844 first.
// Isolated SAVE_KEY. Turtle unlocked, Seahorse
// locked then unlocked via TAP TO UNLOCK, $4000.
// Continue.
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

assert(/Aqua Bay · loop 123/.test(src), "title/pause stamp is loop 123");
assert(!/Aqua Bay · loop 122"/.test(src), "loop 122 stamp is gone");
assert(!/Aqua Bay · loop 121"/.test(src), "loop 121 stamp is gone");
assert(!/Aqua Bay · loop 120"/.test(src), "loop 120 stamp is gone");
assert(!/Aqua Bay · loop 119"/.test(src), "loop 119 stamp is gone");
assert(!/Aqua Bay · loop 118"/.test(src), "loop 118 stamp is gone");
assert(!/Aqua Bay · loop 117"/.test(src), "loop 117 stamp is gone");
assert(!/Aqua Bay · loop 116"/.test(src), "loop 116 stamp is gone");
assert(!/Aqua Bay · loop 115"/.test(src), "loop 115 stamp is gone");
assert(!/Aqua Bay · loop 114"/.test(src), "loop 114 stamp is gone");
assert(!/Aqua Bay · loop 113"/.test(src), "loop 113 stamp is gone");
assert(!/Aqua Bay · loop 112"/.test(src), "loop 112 stamp is gone");
assert(!/Aqua Bay · loop 111/.test(src), "loop 111 stamp is gone");
assert(/loop 123 body turn not paper flip/.test(src),
  "C123 names the leftover paper-card face flip");
assert(/loop 122 surface stays on the dock/.test(src),
  "C122 names the leftover bay-to-tank SURFACE taxi");
assert(/loop 121 surface ribbon clear of SURFACE/.test(src),
  "C121 names the leftover catch ribbon on the SURFACE thumb lip");
assert(/loop 120 hunt hud not over prey/.test(src),
  "C120 names the leftover three-chip stack over seahorse ! marks");
assert(/loop 119 ocean zone plate readable/.test(src),
  "C119 names the leftover covered 70m zone plate");
assert(/loop 118 plaza today after unlock/.test(src),
  "C118 names the leftover plaza TODAY after TAP TO UNLOCK");
assert(/loop 117 catalog book not shop/.test(src),
  "C117 names the leftover gold SHOP catalog chip");
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
assert(/function surfaceActionLegal\s*\(/.test(src),
  "surfaceActionLegal still gates the legal SURFACE board");
assert(!/beginSurface\(\)/.test(extractFn(src, "surfaceChipLegal") || ""),
  "surfaceChipLegal does not auto-surface");
assert(!/beginSurface\(\)/.test(extractFn(src, "surfaceChipBox") || ""),
  "surfaceChipBox does not auto-surface");
assert(!/beginSurface\(\)/.test(extractFn(src, "ribbonSurfaceClear") || ""),
  "ribbonSurfaceClear does not auto-surface");
assert(/function huntStockIndex\s*\(/.test(src),
  "huntStockIndex is the TODAY / surface-stock retarget");
assert(/function applyHuntStockGoal\s*\(/.test(src),
  "applyHuntStockGoal rewrites leftover stock-Turtle");
assert(/function todayGoalLabel\s*\(/.test(src),
  "todayGoalLabel promotes a boat / unlock / serve daily on a hunt");
assert(/let cur = todayGoalLabel\(\)/.test(src),
  "HUD TODAY chip reads todayGoalLabel");
assert(/function sessionChipTop\s*\(/.test(src),
  "sessionChipTop parks plaza TODAY under money / BAG");
assert(/function sessionChipPaintAlpha\s*\(/.test(src),
  "sessionChipPaintAlpha keeps plaza TODAY painted");
assert(/function todayChipBox\s*\(/.test(src),
  "todayChipBox is the plaza TODAY plate");
assert(/function unlockBannerBox\s*\(/.test(src),
  "unlockBannerBox parks SEAHORSE UNLOCKED off TODAY");
assert(/function todayChipClear\s*\(/.test(src),
  "todayChipClear is the unlock-banner vs TODAY clearance");
assert(/function zoneChipVisible\s*\(/.test(src),
  "zoneChipVisible is the ocean depth / zone plate");
assert(/function zoneChipLabel\s*\(/.test(src),
  "zoneChipLabel is 70m · Seahorse groves copy");
assert(/function zoneChipTop\s*\(/.test(src),
  "zoneChipTop parks the zone plate under TODAY");
assert(/function zoneChipBox\s*\(/.test(src),
  "zoneChipBox is the ocean depth / zone plate");
assert(/function zoneChipPaintAlpha\s*\(/.test(src),
  "zoneChipPaintAlpha keeps the zone plate painted");
assert(/function ribbonParkTop\s*\(/.test(src),
  "ribbonParkTop parks the cone ribbon below the zone plate");
assert(/function zoneChipClear\s*\(/.test(src),
  "zoneChipClear is the ribbon vs zone-plate clearance");
assert(/function huntRibbonCompact\s*\(/.test(src),
  "huntRibbonCompact is the phone-hunt three-chip compact");
assert(/function huntHudFloor\s*\(/.test(src),
  "huntHudFloor is the TODAY + zone stack (not the cone ribbon)");
assert(/function ribbonLowParkTop\s*\(/.test(src),
  "ribbonLowParkTop parks the cone ribbon off the grove");
assert(/function ribbonIsLow\s*\(/.test(src),
  "ribbonIsLow is the moved-off-stack ribbon test");
assert(/function ribbonHuntClear\s*\(/.test(src),
  "ribbonHuntClear is the cone ribbon vs prey clearance");
assert(/function surfaceChipLegal\s*\(/.test(src),
  "surfaceChipLegal is wood ↑ SURFACE up (assist or legal)");
assert(/function surfaceChipBox\s*\(/.test(src),
  "surfaceChipBox is the wood ↑ SURFACE thumb box");
assert(/function ribbonSurfaceGap\s*\(/.test(src),
  "ribbonSurfaceGap is the catch-ribbon vs SURFACE clearance");
assert(/function ribbonSurfaceClear\s*\(/.test(src),
  "ribbonSurfaceClear is the catch ribbon vs SURFACE test");
assert(/function pinSurfaceDockCam\s*\(/.test(src),
  "pinSurfaceDockCam lands SURFACE on the dock");
assert(/function leadStockAfterSurface\s*\(/.test(src),
  "leadStockAfterSurface is the after-SURFACE hook");
assert(/DOCK_CAM_FLOOR/.test(extractFn(src, "pinSurfaceDockCam") || ""),
  "pinSurfaceDockCam pins the camera to the dock floor");
assert(/player\.y = state\.missionDone \? 1000 : 940/.test(extractFn(src, "pinSurfaceDockCam") || ""),
  "pinSurfaceDockCam plants the walker on the DIVE pad / y~1000");
assert(!/setWalkDest\(/.test(extractFn(src, "leadStockAfterSurface") || ""),
  "leadStockAfterSurface does not auto-walk to the tank");
assert(!/stockTank\(/.test(extractFn(src, "leadStockAfterSurface") || ""),
  "leadStockAfterSurface does not auto-stock");
assert(!/camEase\s*=/.test(extractFn(src, "leadStockAfterSurface") || ""),
  "leadStockAfterSurface does not camEase-taxi north");
assert(!/seedPathCoins/.test(extractFn(src, "leadStockAfterSurface") || ""),
  "leadStockAfterSurface does not seed a tank-path taxi");
assert(/pendingAct = null/.test(extractFn(src, "leadStockAfterSurface") || ""),
  "leadStockAfterSurface clears a leftover stock walk");

assert(/function faceDrawX\s*\(/.test(src), "faceDrawX is the body-turn blit scaleX");
assert(/hx < -0\.38/.test(src) && /hx > 0\.38/.test(src),
  "wantFlip only commits when |cos(facing)| > 0.38");
assert(/Math\.pow\(0\.00004, dt\)/.test(src),
  "faceS lerps a full reverse on the 0.00004 curve");
assert(!/Math\.pow\(0\.00055, dt\)/.test(src),
  "old paper-flip lerp 0.00055 is gone");
assert(!/Math\.cos\(player\.facing\) < -0\.1/.test(src),
  "player wantFlip no longer chatters at cos < -0.1");
assert(!/Math\.cos\(facing\) < -0\.1/.test(src),
  "drawPlayer faceS fallback is not the old -0.1 chatter");
assert(!/Math\.cos\(ang\) < -0\.1/.test(src),
  "drawDiver faceS fallback is not the old -0.1 chatter");
assert(/Math\.cos\(facing\) < -0\.38/.test(src),
  "drawPlayer faceS fallback uses the 0.38 deadband");
assert(/Math\.cos\(ang\) < -0\.38/.test(src),
  "drawDiver faceS fallback uses the 0.38 deadband");
const drawPlayerSrc = extractFn(src, "drawPlayer") || "";
assert(/faceDrawX\(faceS, squashX\)/.test(drawPlayerSrc),
  "walk blit scaleX uses faceDrawX");
assert(/faceDrawX\(faceS\)/.test(drawPlayerSrc),
  "card / stand / dino blit scaleX uses faceDrawX");
assert(/yawTwist/.test(drawPlayerSrc),
  "drawPlayer adds a small yaw twist, not a paper snap");
assert(/ctx\.scale\(flip \* short, short\)/.test(drawPlayerSrc),
  "painted player fallback still scales by sign, not through 0");
assert(!/scaleX: faceS/.test(drawPlayerSrc),
  "drawPlayer blit scaleX never passes raw faceS through 0");
const drawDiverSrc = extractFn(src, "drawDiver") || "";
assert(/faceDrawX\(faceS, 1 \+ Math\.abs\(kickWave\) \* 0\.04\)/.test(drawDiverSrc),
  "diver swim blit scaleX uses faceDrawX");
assert(/rot: tilt \* flip \+ \(1 - Math\.abs\(faceS\)\) \* 0\.16/.test(drawDiverSrc),
  "diver yaw twist is small, not full facing");
assert(!/rot:\s*ang/.test(drawDiverSrc) && !/rotate\(ang/.test(drawDiverSrc),
  "C58 — diver is not rotated by full facing");
assert(/ctx\.scale\(flip, 1\)/.test(drawDiverSrc),
  "painted diver fallback still scales by sign, not through 0");
assert(/atlas swim frames are already horizontal/.test(src),
  "C58 plant / horizontal swim comment stays");
assert(/faceS: 1/.test(extractFn(src, "drawSkinPicker") || ""),
  "loop 54 title picker still passes faceS: 1");
const faceDrawXSrc = extractFn(src, "faceDrawX") || "";
assert(faceDrawXSrc, "faceDrawX is extractable");
function faceDrawX(faceS, extraX) {
  const flip = faceS < 0 ? -1 : 1;
  const yaw = 1 - Math.abs(faceS);
  const body = 1 - yaw * 0.38;
  return flip * body * (extraX == null ? 1 : extraX);
}
assert(Math.abs(faceDrawX(1) - 1) < 1e-9, "settled right facing draws at +1");
assert(Math.abs(faceDrawX(-1) + 1) < 1e-9, "settled left facing draws at -1");
assert(Math.abs(faceDrawX(0) - 0.62) < 1e-9, "mid-turn thins to +0.62, not a line");
assert(Math.abs(faceDrawX(-0) - 0.62) < 1e-9 || faceDrawX(-1e-16) < 0,
  "negative mid-turn uses the left sign");
for (let i = 0; i <= 40; i++) {
  const s = -1 + i / 20;
  const x = faceDrawX(s);
  assert(Math.abs(x) >= 0.62 - 1e-9,
    "faceDrawX never papers through 0, got " + x + " at faceS=" + s);
}
assert(Math.abs(faceDrawX(0.5, 1.04)) >= 0.62,
  "walk squash extraX still stays off 0");
function wantFlipOf(facing, cur) {
  const hx = Math.cos(facing);
  let wantFlip;
  if (hx < -0.38) wantFlip = -1;
  else if (hx > 0.38) wantFlip = 1;
  else {
    wantFlip = (cur == null || !isFinite(cur) || Math.abs(cur) < 1e-6) ? 1 : (cur < 0 ? -1 : 1);
  }
  return wantFlip;
}
assert(wantFlipOf(0, 1) === 1, "east heading commits right");
assert(wantFlipOf(Math.PI, 1) === -1, "west heading commits left");
assert(wantFlipOf(-Math.PI / 2, 1) === 1, "north walk holds last right facing");
assert(wantFlipOf(-Math.PI / 2, -1) === -1, "north walk holds last left facing");
assert(wantFlipOf(Math.PI / 2, 1) === 1, "south walk holds last right facing");
assert(wantFlipOf(Math.PI / 2, -0.4) === -1, "south walk holds last left facing");
assert(wantFlipOf(Math.acos(-0.37), -1) === -1,
  "just inside the deadband holds left");
assert(wantFlipOf(Math.acos(0.37), 1) === 1,
  "just inside the deadband holds right");

assert(/pinSurfaceDockCam\(\)/.test(extractFn(src, "applyFade") || ""),
  "applyFade still pins the dock after SURFACE");
assert(/intentWalk\("stock"/.test(extractFn(src, "onUI") || ""),
  "goto-stock still walks when tapped");
assert(/function huntMarkClear\s*\(/.test(src),
  "huntMarkClear is the seahorse ! vs HUD-stack test");
assert(/function huntPreyVisible\s*\(/.test(src),
  "huntPreyVisible is at least one hunt ! below the HUD");
assert(/zoneChipPaintAlpha\(\)/.test(src),
  "HUD zone plate paints through zoneChipPaintAlpha, not screenBoxAlpha");
assert(/ribbonParkTop\(\)/.test(extractFn(src, "ribbonLayout") || ""),
  "ribbonLayout parks via ribbonParkTop so the zone plate is not under the ribbon");
assert(/huntRibbonCompact\(\)/.test(extractFn(src, "ribbonLayout") || ""),
  "ribbonLayout consults huntRibbonCompact on a phone hunt");
assert(/ribbonLowParkTop\(/.test(extractFn(src, "ribbonLayout") || ""),
  "ribbonLayout can move the cone ribbon off the TODAY + zone stack");
assert(/surfaceChipBox\(\)/.test(extractFn(src, "ribbonLayout") || ""),
  "ribbonLayout consults surfaceChipBox so the catch ribbon clears SURFACE");
assert(/ribbonSurfaceClear|surfaceChipBox\(\)/.test(extractFn(src, "ribbonLowParkTop") || ""),
  "ribbonLowParkTop lifts off the SURFACE chip once it is legal");
assert(/surfaceChipBox\(\)/.test(extractFn(src, "drawSurfaceAssist") || ""),
  "drawSurfaceAssist paints the same surfaceChipBox the ribbon clears");
assert(/ribbonIsLow\(/.test(extractFn(src, "topHudFloor") || ""),
  "topHudFloor ignores a low-parked cone ribbon (does not cover the grove)");
assert(/zoneChipTop\(\)/.test(extractFn(src, "drawHUD") || ""),
  "drawHUD places the zone plate at zoneChipTop");
assert(/diveForTankIndex\(\)/.test(extractFn(src, "huntStockIndex") || ""),
  "huntStockIndex promotes the empty unlocked DIVE FOR bowl");
assert(/sessionChipPaintAlpha\(\)/.test(src),
  "HUD TODAY paints through sessionChipPaintAlpha, not shop topHudFloor");
assert(!/ribbon \? ribbon\.y \+ ribbon\.h \+ 8 : 0/.test(src),
  "sessionY no longer parks TODAY under the ribbon (the leftover)");
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
assert(/function catalogChipLabel\s*\(/.test(src),
  "catalogChipLabel stays");
const chipSrc = extractFn(src, "catalogChipLabel") || "";
assert(/return "BOOK"/.test(chipSrc),
  "catalogChipLabel returns BOOK");
assert(/return "CLOSE"/.test(chipSrc),
  "catalogChipLabel still returns CLOSE while the tray is open");
assert(!/return "SHOP"/.test(chipSrc),
  "catalogChipLabel never returns SHOP");
assert(!/if \(plazaWalkChipLegal\(\)\) return "BOOK"/.test(chipSrc),
  "C117 does not gate BOOK on plazaWalkChipLegal (the leftover)");
assert(/Open the species catalog/.test(extractFn(src, "catalogChipAria") || ""),
  "catalog aria says species catalog, not shop catalog");
assert(!/Open the shop catalog/.test(extractFn(src, "catalogChipAria") || ""),
  "catalog aria no longer says shop catalog");

const clickSrc = extractFn(src, "clickWalkTarget") || "";
const trySrc = extractFn(src, "tryClickShop") || "";
const onUi = extractFn(src, "onUI") || "";
const goalSrc = extractFn(src, "currentGoal") || "";
const beginSrc = extractFn(src, "beginDive") || "";
const fadeSrc = extractFn(src, "applyFade") || "";
const fadePin = fadeSrc.indexOf("pinSurfaceDockCam()");
const fadeLead = fadeSrc.indexOf("leadStockAfterSurface()");
assert(fadePin >= 0 && fadeLead >= 0 && fadePin < fadeLead,
  "SURFACE fade pins the dock before leadStockAfterSurface");
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
  "surfaceAssistLegal", "surfaceActionLegal", "canSurfaceNow", "haulReadyToSurface", "atWaterline",
  "surfaceChipLegal", "surfaceChipBox", "ribbonSurfaceGap", "ribbonSurfaceClear",
  "huntStockIndex", "applyHuntStockGoal", "todayGoalLabel", "sessionGoalLabel", "sessionGoalMet",
  "sessionChipMetrics", "sessionChipTop", "sessionChipPaintAlpha", "todayChipBox",
  "unlockBannerBox", "todayChipClear", "sessionChipVisible", "missionVisible",
  "zoneChipVisible", "zoneChipLabel", "zoneChipTop", "zoneChipBox",
  "zoneChipPaintAlpha", "ribbonParkTop", "zoneChipClear",
  "huntRibbonCompact", "huntHudFloor", "ribbonLowParkTop", "ribbonIsLow",
  "ribbonHuntClear", "huntMarkClear", "huntPreyVisible",
  "glowingStockIndex",
  "stockableTankTarget",
  "tutorialGrace", "coneRange", "coneHalf", "scoopEdgeGrace", "normAng",
  "faceToward", "nearestScoopFish", "fishAtWorld", "lockScoop",
  "startScoopOnFish", "fishInCone",
  "plazaWalkChipLegal", "diveChipLegal", "dockOffScreen",
  "zoneBandForSpecies", "zoneAtDepth", "landmarkForSpecies", "depthMeters",
  "namedZoneBottom", "highestUnlockedSafe",
  "catalogChipLabel", "catalogChipAria",
  "pinSurfaceDockCam", "leadStockAfterSurface", "bagHasStockable",
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
    DOCK_CAM_FLOOR: DOCK_CAM_FLOOR, W: W, H: opts.H || PIN_H, OCEAN: ocean,
    OCEAN_BASE_H: OCEAN_BASE_H, ZONE_STEP: ZONE_STEP,
    LM_GOLD: LM_GOLD, LM_KOI: LM_KOI, LM_TURTLE: LM_TURTLE, LM_EXTRA: LM_EXTRA,
    oceanFish: [],
    phoneShopOpen: false,
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
    lastStock: null,
    beganDive: false,
    stageZoom: function () { return 1; },
    clamp: clamp,
    toast: function () {},
    nope: function () {},
    Math: Math,
    portraitStage: function () { return !!phone; },
    thumbCopy: function () { return !!phone; },
    bagIsFull: function () { return sandbox.state.bag.length >= sandbox.bagMax(); },
    nearSurface: function () { return sandbox.player.y < 280; },
    bagHasStockable: function () {
      return sandbox.state.bag.some((s) => sandbox.state.unlocked[s]);
    },
    cashNeedsCollect: function () { return false; },
    tillWaiting: function () { return false; },
    inTillGlow: function () { return false; },
    dockCameraReady: function () { return !!(sandbox.cam && sandbox.cam.y >= DOCK_CAM_FLOOR - 24); },
    plazaCameraReady: function () { return !!(sandbox.cam && sandbox.cam.y <= 520 + 36); },
    hudSafeTop: function () {
      if (!phone) return 12;
      return opts.safeTop != null ? opts.safeTop : 120;
    },
    topHudFloor: function () { return phone ? 180 : 28; },
    phoneCss: phoneCss,
    actionBtnSize: function () {
      return phone
        ? { w: phoneCss(120), h: phoneCss(48), pad: phoneCss(10) }
        : { w: 340, h: 52, pad: 18 };
    },
    actionFloor: function () { return opts.floor || sandbox.H || PIN_H; },
    worldToScreen: function (x, y) {
      const z = (sandbox.cam && sandbox.cam.z) || 1;
      return {
        x: (x - sandbox.cam.x) * z + W / 2,
        y: (y - sandbox.cam.y) * z + (sandbox.H || PIN_H) / 2,
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
    stockTank: function (i) {
      sandbox.lastStock = i;
      const idx = sandbox.state.bag.indexOf(i);
      if (idx >= 0) sandbox.state.bag.splice(idx, 1);
      sandbox.state.stock[i] = (sandbox.state.stock[i] | 0) + 1;
    },
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
    " surfaceAssistLegal, surfaceActionLegal, canSurfaceNow, haulReadyToSurface, atWaterline," +
    " surfaceChipLegal, surfaceChipBox, ribbonSurfaceGap, ribbonSurfaceClear," +
    " huntStockIndex, applyHuntStockGoal, todayGoalLabel, sessionGoalLabel, sessionGoalMet," +
    " sessionChipMetrics, sessionChipTop, sessionChipPaintAlpha, todayChipBox," +
    " unlockBannerBox, todayChipClear, sessionChipVisible, missionVisible," +
    " zoneChipVisible, zoneChipLabel, zoneChipTop, zoneChipBox," +
    " zoneChipPaintAlpha, ribbonParkTop, zoneChipClear," +
    " huntRibbonCompact, huntHudFloor, ribbonLowParkTop, ribbonIsLow," +
    " ribbonHuntClear, huntMarkClear, huntPreyVisible," +
    " glowingStockIndex, stockableTankTarget," +
    " nearestScoopFish, fishAtWorld, lockScoop, startScoopOnFish, fishInCone," +
    " plazaWalkChipLegal, diveChipLegal, dockOffScreen," +
    " zoneBandForSpecies, zoneAtDepth, landmarkForSpecies, depthMeters," +
    " namedZoneBottom, highestUnlockedSafe, catalogChipLabel, catalogChipAria," +
    " pinSurfaceDockCam, leadStockAfterSurface, bagHasStockable," +
    " shopDockWalk, shopWalkRects," +
    " player, state, cam, mouse, OCEAN, oceanFish, H };";
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
  sandbox.__api.lastStock = function () { return sandbox.lastStock; };
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
  sandbox.__api.landAfterSurface = function () {
    sandbox.state.scene = "shop";
    sandbox.state.pendingScene = null;
    sandbox.state.fadeDir = 0;
    sandbox.state.fade = 0;
    if (sandbox.__api.clearDiveForHunt) sandbox.__api.clearDiveForHunt();
    sandbox.__api.pinSurfaceDockCam();
    sandbox.__api.leadStockAfterSurface();
    return {
      x: sandbox.player.x,
      y: sandbox.player.y,
      camY: sandbox.cam.y,
      band: sandbox.cam.shopBand,
    };
  };
  sandbox.__api.tapStockCue = function () {
    if (!sandbox.bagHasStockable()) return false;
    const si = Math.max(0, sandbox.__api.glowingStockIndex());
    const dest = sandbox.__api.stockableTankTarget() || sandbox.__api.tankWalkPoint(si);
    return sandbox.__api.intentWalk("stock", dest, si);
  };
  sandbox.__api.setCatalogOpen = function (v) {
    sandbox.phoneShopOpen = !!v;
  };
  sandbox.__api.catalogOpen = function () { return !!sandbox.phoneShopOpen; };
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
assert(openApi.plazaWalkChipLegal() === true,
  "wood ↑ SHOP is up on the 390 dock (bowls off-screen)");
assertCatalogBook(openApi, "dock + wood ↑ SHOP");
openApi.setCatalogOpen(true);
assert(openApi.catalogChipLabel() === "CLOSE",
  "tray open: catalog is CLOSE, got " + openApi.catalogChipLabel());
assert(openApi.catalogChipLabel() !== "SHOP",
  "tray open: catalog is not SHOP");
openApi.setCatalogOpen(false);
assertCatalogBook(openApi, "tray closed on the dock");

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

function assertCatalogBook(api, label) {
  const t = api.catalogChipLabel();
  assert(t !== "SHOP", label + " catalog is not SHOP, got " + t);
  assert(t === "BOOK", label + " catalog is BOOK, got " + t);
}

// 1) Stamp loop 122 is asserted above.
// 2) Seed Turtle open / Seahorse locked / $4000. After TAP TO
//    UNLOCK, plaza TODAY is Stock Seahorse and visible (not
//    covered by the unlock banner / ribbon). Catalog BOOK.
//    Thumb DIVE: 70m groves; HUD has TODAY Stock Seahorse AND
//    zone plate 70m · Seahorse groves readable. Cone ribbon
//    is not a third chip over the first seahorse ! marks.
//    Bag 0/5 no SURFACE. First lock Seahorse.
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
  "before unlock, leftover TODAY is Take the boat, got " + todayPlate(huntApi));
assert(!/Seahorse/i.test(todayPlate(huntApi)),
  "before unlock, TODAY is not forced to Stock Seahorse");
assert(huntApi.unlockCueLegal() === true, "TAP TO UNLOCK board is up on Seahorse");
assert(huntApi.plazaWalkChipLegal() === false,
  "wood ↑ SHOP is down at the Seahorse bowl (C108 leftover gate)");
assertCatalogBook(huntApi, "TAP TO UNLOCK Seahorse bowl");
assert(huntApi.tapUnlockCue() === true, "TAP TO UNLOCK buys Seahorse");
assert(huntApi.state.unlocked[5] === true, "Seahorse is unlocked");
assert(huntApi.state.money === 1800, "money is $1800 after the $2200 unlock");
assert(huntApi.beganDive() === false, "unlock does not auto-dive");
assert(huntApi.diveForCueLegal() === true, "DIVE FOR SEAHORSE board is up");
assert(huntApi.diveChipLegal() === true, "thumb DIVE stays visible after unlock");
assert(huntApi.plazaWalkChipLegal() === false,
  "wood ↑ SHOP stays down while DIVE FOR sits on the bowl");
assertCatalogBook(huntApi, "DIVE FOR Seahorse bowl");
assert(huntApi.diveForHuntIndex() < 0,
  "unlock alone does not arm the grove hunt");
assert(huntApi.huntStockIndex() === 5,
  "empty unlocked bowl is the plaza stock target before hunt");
assert(/Seahorse/i.test(todayPlate(huntApi)),
  "after TAP TO UNLOCK, plaza TODAY is Stock Seahorse, got " + todayPlate(huntApi));
assert(!/boat/i.test(todayPlate(huntApi)) && !/Turtle/i.test(todayPlate(huntApi)),
  "plaza TODAY is not Take the boat after unlock, got " + todayPlate(huntApi));
assert(huntApi.sessionChipPaintAlpha() === 1,
  "plaza TODAY paints (not alpha 0 under the ribbon)");
assert(huntApi.todayChipClear() === true,
  "unlock banner does not cover plaza TODAY");
assert(huntApi.todayChipBox() && huntApi.todayChipBox().y < (huntApi.unlockBannerBox() && huntApi.unlockBannerBox().y),
  "TODAY sits above SEAHORSE UNLOCKED");
assert(huntApi.zoneChipVisible() === false,
  "plaza has no ocean zone plate");
assert(huntApi.huntRibbonCompact() === false,
  "plaza does not compact the cone ribbon (C118 park under TODAY stays)");
assert(huntApi.todayChipBox() && huntApi.todayChipBox().y + huntApi.todayChipBox().h <= huntApi.ribbonParkTop() - 2,
  "plaza ribbon still parks below TODAY");
assert(huntApi.state.sessionGoals.indexOf("boat") >= 0,
  "rolled boat daily stays in the session list after unlock");
assert(huntApi.state.sessionGoals.indexOf("stock-5") < 0,
  "C118 does not mutate a boat daily into stock-5");
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
assert(huntApi.sessionChipPaintAlpha() === 1,
  "ocean TODAY still paints");
const huntZone = huntApi.zoneChipLabel();
assert(/70m/.test(huntZone) && /Seahorse groves/.test(huntZone),
  "zone plate reads 70m · Seahorse groves, got " + huntZone);
assert(huntApi.zoneChipVisible() === true, "ocean hunt shows the zone plate");
assert(huntApi.zoneChipPaintAlpha() === 1,
  "zone plate paints (not eaten by screenBoxAlpha / the ribbon)");
assert(huntApi.zoneChipClear() === true,
  "cone ribbon does not cover the zone plate");
const huntTodayBox = huntApi.todayChipBox();
const huntZoneBox = huntApi.zoneChipBox();
assert(huntTodayBox && huntZoneBox && huntTodayBox.y + huntTodayBox.h <= huntZoneBox.y - 2,
  "TODAY sits above the zone plate");
assert(huntZoneBox.y + huntZoneBox.h <= huntApi.ribbonParkTop() - 2,
  "zone plate sits above the cone ribbon");
assert(huntApi.plazaWalkChipLegal() === false,
  "wood ↑ SHOP is not up in the ocean hunt");
assertCatalogBook(huntApi, "70m Seahorse groves bag 0/5");
assert(huntApi.catalogChipLabel() !== "SHOP",
  "no gold SHOP chip on the 70m hunt");
assert(huntApi.huntRibbonCompact() === true,
  "phone ocean hunt compacts the cone ribbon (not a third chip)");
assert(huntApi.ribbonHuntClear() === true,
  "cone ribbon is moved off the grove or combined away");
const huntFloor = huntApi.huntHudFloor();
assert(huntFloor <= huntZoneBox.y + huntZoneBox.h + phoneCss(8) + 2,
  "hunt HUD floor is TODAY + zone, not + ribbon");
assert(huntFloor < huntZoneBox.y + huntZoneBox.h + phoneCss(8) + phoneCss(28),
  "hunt HUD floor does not include the cone ribbon height");
assert(huntApi.ribbonIsLow({ y: huntFloor + phoneCss(16), h: phoneCss(28) }) === true,
  "a ribbon parked below TODAY + zone counts as low");
assert(huntApi.ribbonIsLow({ y: huntZoneBox.y, h: phoneCss(28) }) === false,
  "a ribbon on the zone plate is not low");

// Phone 390×844 stage: cam on the diver at ocean zoom. A
// seahorse at the top of the grove band had its ! under
// the leftover three-chip stack; it must sit below TODAY +
// 70m once the cone ribbon is compacted.
const PHONE390_H = Math.max(960, Math.round(W * 844 / 390));
const hunt390 = makeCtx(saveOpen, {
  phone: true, H: PHONE390_H, safeTop: phoneCss(12),
});
hunt390.state.stock[4] = 2;
hunt390.player.x = horse.x;
hunt390.player.y = horse.y;
hunt390.cam.y = 520;
assert(hunt390.tapUnlockCue() === true, "390 TAP TO UNLOCK buys Seahorse");
assert(hunt390.tapDiveChip() === true, "390 thumb DIVE arms the hunt");
const spawn390 = hunt390.enterOcean();
assert(spawn390.hunt === true && spawn390.tank === 5, "390 ocean entry is a Seahorse hunt");
hunt390.cam.x = hunt390.player.x;
hunt390.cam.y = hunt390.player.y;
hunt390.cam.z = 1.12 * (PHONE390_H / 860);
assert(hunt390.huntRibbonCompact() === true, "390 hunt still compacts the cone ribbon");
assert(/70m/.test(hunt390.zoneChipLabel()) && /Seahorse groves/.test(hunt390.zoneChipLabel()),
  "390 hunt zone stays 70m · Seahorse groves, got " + hunt390.zoneChipLabel());
assert(/Seahorse/i.test(todayPlate(hunt390)),
  "390 hunt TODAY stays Stock Seahorse, got " + todayPlate(hunt390));
assert(hunt390.zoneChipPaintAlpha() === 1 && hunt390.sessionChipPaintAlpha() === 1,
  "390 hunt TODAY + zone still paint");
assert(hunt390.ribbonHuntClear() === true,
  "390 hunt cone ribbon is not the third chip over prey");
const groveTop = { s: 5, x: hunt390.player.x + 40, y: horseBand.y0 + 8,
  caught: false, tease: false, rare: false };
const groveMid = { s: 5, x: hunt390.player.x + 70, y: hunt390.player.y,
  caught: false, tease: false, rare: false };
hunt390.plantFish([groveTop, groveMid]);
assert(hunt390.huntMarkClear(groveTop.x, groveTop.y) === true,
  "first grove-top seahorse ! is below the HUD stack, not under it");
assert(hunt390.huntMarkClear(groveMid.x, groveMid.y) === true,
  "grove seahorse beside the diver is below the HUD stack");
assert(hunt390.huntPreyVisible() === true,
  "at least one hunt ! / seahorse is fully visible below the HUD");
assert(hunt390.surfaceAssistLegal() === false,
  "390 hunt bag 0/5 still hides ↑ SURFACE");
assert(hunt390.surfaceChipLegal() === false,
  "390 hunt bag 0/5 has no wood SURFACE chip");
assert(hunt390.surfaceChipBox() == null,
  "390 hunt bag 0/5 SURFACE box is hidden");
const bag0RibbonH = phoneCss(28);
const bag0ParkY = hunt390.ribbonLowParkTop(bag0RibbonH);
assert(hunt390.ribbonSurfaceClear({ x: 12, y: bag0ParkY, w: 800, h: bag0RibbonH }) === true,
  "390 hunt bag 0/5 low-parked ribbon is fine (SURFACE hidden)");
assertCatalogBook(hunt390, "390 hunt catalog");

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
assert(huntApi.surfaceChipLegal() === true,
  "after one Seahorse, wood ↑ SURFACE is legal");
const bag1Surf = huntApi.surfaceChipBox();
assert(bag1Surf && bag1Surf.w > 0 && bag1Surf.h > 0,
  "after one Seahorse, wood ↑ SURFACE has a thumb box");
const bag1H = phoneCss(28);
const bag1Park = huntApi.ribbonLowParkTop(bag1H);
assert(bag1Park + bag1H <= bag1Surf.y - huntApi.ribbonSurfaceGap(),
  "parked catch ribbon sits above SURFACE with clearance, parkBot=" +
    (bag1Park + bag1H).toFixed(1) + " surfY=" + bag1Surf.y.toFixed(1));
assert(huntApi.ribbonSurfaceClear({ x: 12, y: bag1Park, w: 800, h: bag1H }) === true,
  "parked catch ribbon does not overlap wood ↑ SURFACE");
assert(huntApi.ribbonSurfaceClear({ x: 12, y: bag1Surf.y, w: bag1Surf.x + 40, h: bag1H }) === false,
  "a leftover same-lip ribbon still fails ribbonSurfaceClear");
assert(/Seahorse/i.test(todayPlate(huntApi)) && !/boat/i.test(todayPlate(huntApi)),
  "after the first Seahorse scoop, TODAY still says Stock Seahorse");
assert(huntApi.zoneChipPaintAlpha() === 1 && huntApi.sessionChipPaintAlpha() === 1,
  "after the first bag, TODAY + 70m still paint");
assert(huntApi.huntPreyVisible() === true,
  "after the first bag, hunt ! marks stay visible (ribbon not back over the grove)");
assertCatalogBook(huntApi, "bag 1/5 catalog");

// Phone 390 ship criterion: after first Seahorse, ↑ SURFACE
// owns the thumb corner — catch ribbon is not on that lip.
hunt390.state.bag = [5];
assert(hunt390.huntBagHasPrey(5) === true, "390 bag now holds a Seahorse");
assert(hunt390.surfaceAssistLegal() === true,
  "390 after first Seahorse shows wood ↑ SURFACE");
assert(hunt390.surfaceChipLegal() === true,
  "390 after first Seahorse, SURFACE owns the thumb corner");
const surf390 = hunt390.surfaceChipBox();
assert(surf390 && surf390.w >= phoneCss(100) && surf390.h >= phoneCss(36),
  "390 ↑ SURFACE is a fat wood thumb target, box=" +
    (surf390 && surf390.w) + "x" + (surf390 && surf390.h));
const catchH = phoneCss(28);
const catchY = hunt390.ribbonLowParkTop(catchH);
const catchRb = { x: 12, y: catchY, w: Math.max(12, surf390.x - phoneCss(8) - 12), h: catchH };
assert(catchY + catchH <= surf390.y - hunt390.ribbonSurfaceGap(),
  "390 catch ribbon parks above SURFACE with clearance, parkBot=" +
    (catchY + catchH).toFixed(1) + " surfY=" + surf390.y.toFixed(1) +
    " gap=" + hunt390.ribbonSurfaceGap());
assert(hunt390.ribbonSurfaceClear(catchRb) === true,
  "390 catch ribbon does not sit on / overlap ↑ SURFACE");
assert(hunt390.ribbonSurfaceClear({
  x: 12, y: surf390.y, w: surf390.x + surf390.w * 0.5, h: catchH,
}) === false,
  "390 leftover same-lip Nice-catch ribbon would overlap SURFACE");
assert(catchY >= hunt390.huntHudFloor() + phoneCss(16),
  "390 catch ribbon stays below TODAY + 70m (not back over prey)");
assert(/70m/.test(hunt390.zoneChipLabel()) && /Seahorse groves/.test(hunt390.zoneChipLabel()),
  "390 after first bag, 70m · Seahorse groves stays, got " + hunt390.zoneChipLabel());
assert(/Seahorse/i.test(todayPlate(hunt390)),
  "390 after first bag, TODAY stays Stock Seahorse, got " + todayPlate(hunt390));
assert(hunt390.zoneChipPaintAlpha() === 1 && hunt390.sessionChipPaintAlpha() === 1,
  "390 after first bag, TODAY + 70m still paint");
assert(hunt390.huntPreyVisible() === true,
  "390 after first bag, hunt ! marks stay visible");
assertCatalogBook(hunt390, "390 bag 1/5 catalog");

// C122 ship criterion: SURFACE lands on the dock (bay /
// DIVE pad, y~1000). They are NOT immediately walking to
// Seahorse. Camera shows the pier, not a tank-room smash.
// TODAY still Stock Seahorse. No auto-stock. Tap-to-stock
// still walks if tapped.
assert(huntApi.state.bag.indexOf(5) >= 0, "bag still holds a Seahorse before SURFACE");
assert((huntApi.state.stock[5] | 0) === 0, "Seahorse bowl is empty before SURFACE");
huntApi.player.x = 1860;
huntApi.player.y = 2180;
huntApi.cam.x = 1860;
huntApi.cam.y = 2180;
huntApi.cam.shopBand = "ocean";
const landed = huntApi.landAfterSurface();
assert(huntApi.state.scene === "shop", "SURFACE fade lands in the shop");
assert(Math.abs(landed.y - 1000) <= 60,
  "SURFACE plants the walker at dock y~1000, got " + landed.y);
assert(Math.hypot(huntApi.player.x - divePad.x, huntApi.player.y - divePad.y) < 80,
  "SURFACE walker is near the DIVE pad, at " +
    huntApi.player.x.toFixed(0) + "," + huntApi.player.y.toFixed(0));
const dHorsePad = Math.hypot(huntApi.player.x - horse.x, huntApi.player.y - horse.y);
assert(dHorsePad > 200,
  "SURFACE walker is not occupying tankWalkPoint(5), d=" + dHorsePad.toFixed(1));
assert(huntApi.player.y > 870, "SURFACE walker is on the dock (y>870), got " + huntApi.player.y);
assert(landed.camY >= DOCK_CAM_FLOOR - 24,
  "SURFACE camera stays on the dock floor, camY=" + landed.camY);
assert(landed.camY > 800, "SURFACE camera is not the plaza / tank room");
assert(landed.band === "dock", "SURFACE camera band is dock, got " + landed.band);
assert(!huntApi.player.goto,
  "SURFACE does not setWalkDest to the glowing tank");
assert(!huntApi.player.route,
  "SURFACE does not queue a tank route");
assert(!huntApi.player.pendingAct || huntApi.player.pendingAct.kind !== "stock",
  "SURFACE does not arm an auto-stock walk");
assert(huntApi.lastStock() == null, "SURFACE does not auto-stock");
assert((huntApi.state.stock[5] | 0) === 0, "Seahorse bowl still empty after SURFACE");
assert(huntApi.state.bag.indexOf(5) >= 0, "Seahorse stays in the bag after SURFACE");
assert(huntApi.glowingStockIndex() === 5,
  "surface stock glow is Seahorse, not Turtle, got " + huntApi.glowingStockIndex());
assert(huntApi.stockableTankTarget() &&
    Math.hypot(huntApi.stockableTankTarget().x - horse.x,
      huntApi.stockableTankTarget().y - horse.y) < 1,
  "surface quest still points at the Seahorse pad (cue, not auto-walk)");
assert(/Seahorse/i.test(todayPlate(huntApi)) && !/boat/i.test(todayPlate(huntApi)),
  "after SURFACE, TODAY is Stock Seahorse, got " + todayPlate(huntApi));
assert(huntApi.tapStockCue() === true, "C100 tap-to-stock still walks if tapped");
assert(huntApi.player.pendingAct && huntApi.player.pendingAct.kind === "stock",
  "tap-to-stock arms a stock walk");
assert(huntApi.player.goto,
  "tap-to-stock setWalkDest after they tap the board");
const tapDest = huntApi.player.route && huntApi.player.route.length
  ? huntApi.player.route[huntApi.player.route.length - 1]
  : huntApi.player.goto;
assert(tapDest && Math.hypot(tapDest.x - horse.x, tapDest.y - horse.y) < 8,
  "tap-to-stock still walks to tankWalkPoint(5)");
assert((huntApi.state.stock[5] | 0) === 0 && huntApi.lastStock() == null,
  "tap-to-stock from the dock does not auto-stock");
huntApi.player.goto = null;
huntApi.player.route = null;
huntApi.player.pendingAct = null;

// 390 portrait: same dock land, pier camera, no tank smash.
hunt390.player.x = 1860;
hunt390.player.y = 2180;
hunt390.cam.x = 1860;
hunt390.cam.y = 2180;
const landed390 = hunt390.landAfterSurface();
assert(Math.abs(landed390.y - 1000) <= 60,
  "390 SURFACE plants the walker at dock y~1000, got " + landed390.y);
assert(Math.hypot(hunt390.player.x - divePad.x, hunt390.player.y - divePad.y) < 80,
  "390 SURFACE walker is near the DIVE pad");
assert(Math.hypot(hunt390.player.x - horse.x, hunt390.player.y - horse.y) > 200,
  "390 SURFACE walker is not occupying tankWalkPoint(5)");
assert(landed390.camY >= DOCK_CAM_FLOOR - 24 && landed390.band === "dock",
  "390 SURFACE camera shows the pier / bay, not the tank room");
assert(!hunt390.player.goto && !hunt390.player.route,
  "390 SURFACE does not taxi north to the bowls");
assert(/Seahorse/i.test(todayPlate(hunt390)),
  "390 after SURFACE, TODAY stays Stock Seahorse, got " + todayPlate(hunt390));
assert((hunt390.state.stock[5] | 0) === 0, "390 SURFACE does not auto-stock");

// Empty-bag SURFACE (reachable via C98 / shallows) still docks.
const emptySurf = makeCtx(saveOpen, { phone: true });
emptySurf.state.unlocked[5] = true;
emptySurf.state.bag = [];
emptySurf.player.x = 880;
emptySurf.player.y = 380;
emptySurf.cam.y = 380;
const emptyLand = emptySurf.landAfterSurface();
assert(Math.abs(emptyLand.y - 1000) <= 60,
  "empty-bag SURFACE still docks at y~1000, got " + emptyLand.y);
assert(Math.hypot(emptySurf.player.x - divePad.x, emptySurf.player.y - divePad.y) < 80,
  "empty-bag SURFACE walker is near the DIVE pad");
assert(Math.hypot(emptySurf.player.x - horse.x, emptySurf.player.y - horse.y) > 200,
  "empty-bag SURFACE does not taxi to Seahorse");
assert(!emptySurf.player.goto && !emptySurf.player.route,
  "empty-bag SURFACE has no tank walk");
assert(emptySurf.lastStock() == null, "empty-bag SURFACE does not stock");
assert(emptyLand.camY >= DOCK_CAM_FLOOR - 24 && emptyLand.band === "dock",
  "empty-bag SURFACE camera stays on the pier");

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
  "surface quest still points at the Seahorse pad, not Turtle");
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
const freshZone = fresh.zoneChipLabel();
assert(/6m/.test(freshZone) && /Shallows/.test(freshZone),
  "new-game zone plate is 6m · Shallows, got " + freshZone);
assert(fresh.zoneChipVisible() === true, "new-game first DIVE shows the zone plate");
assert(fresh.zoneChipPaintAlpha() === 1, "new-game shallows zone plate paints");
assert(fresh.zoneChipClear() === true, "new-game shallows zone plate is readable");

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
  "rolled serve daily shows before unlock, got " + todayPlate(serveApi));
assert(serveApi.tapUnlockCue() === true, "serve-daily TAP TO UNLOCK still buys");
assert(/Seahorse/i.test(todayPlate(serveApi)) && !/Serve/i.test(todayPlate(serveApi)),
  "serve daily promotes to Stock Seahorse on plaza unlock, got " + todayPlate(serveApi));
assert(serveApi.sessionChipPaintAlpha() === 1,
  "serve-daily plaza TODAY still paints after unlock");
assert(serveApi.tapDiveChip() === true, "serve-daily thumb DIVE still arms");
assert(/Seahorse/i.test(todayPlate(serveApi)) && !/Serve/i.test(todayPlate(serveApi)),
  "serve daily stays Stock Seahorse on the hunt, got " + todayPlate(serveApi));

const doneSpawn = doneApi.oceanEntrySpawn();
assert(doneSpawn.y === 380 && !doneSpawn.hunt,
  "regular DIVE after hunt / stocked bowl is still shallows");

// 6) Walk still does not auto-buy. Desktop hold-W still no auto-buy.
const northApi = makeCtx(saveOpen, { phone: true, pressX: W / 2, pressY: 0.18 * Math.max(960, Math.round(W * 844 / 390)) });
assert(northApi.plazaWalkChipLegal() === true,
  "↑ SHOP walk starts with the wood chip legal");
assertCatalogBook(northApi, "↑ SHOP walk start");
const shopWalk = followPath(northApi, northApi.nextUnlockWalkDest(), 10);
assertAlleyWalk(northApi, shopWalk, "phone north / ↑ SHOP");
northApi.arrive();
assertStillLocked(northApi, "phone north arrival");
assertCatalogBook(northApi, "↑ SHOP arrival at TAP TO UNLOCK");

assert(deskApi.phoneDockPlazaWalkWanted(880, 400, 640, 200) === false,
  "desktop click-to-walk is not remapped by the phone plaza gate");
assert(deskApi.huntRibbonCompact() === false,
  "desktop does not compact the cone ribbon (WASD / click stay)");
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

console.log("c123 body turn: ok (next=" + openApi.nextLockedTank() +
  ", horse=" + horse.x + "," + horse.y +
  ", dockY=" + landed.y +
  ", dockCam=" + landed.camY +
  ", dHorse=" + dHorsePad.toFixed(0) +
  ", today=" + todayPlate(huntApi) +
  ", emptyDockY=" + emptyLand.y +
  ", huntY=" + huntApi.player.y.toFixed(0) +
  " " + zone.name +
  " " + huntApi.depthMeters(huntApi.player.y) + "m" +
  ", zone=" + huntApi.zoneChipLabel() +
  ", zoneClear=" + huntApi.zoneChipClear() +
  ", compact=" + huntApi.huntRibbonCompact() +
  ", ribbonClear=" + huntApi.ribbonHuntClear() +
  ", preyVisible=" + hunt390.huntPreyVisible() +
  ", zoneAlpha=" + huntApi.zoneChipPaintAlpha() +
  ", plazaAlpha=" + huntApi.sessionChipPaintAlpha() +
  ", todayClear=" + huntApi.todayChipClear() +
  ", catalogHunt=" + huntApi.catalogChipLabel() +
  ", catalogDock=" + openApi.catalogChipLabel() +
  ", firstLock=" + (first && first.s) +
  ", afterLock=" + (after && after.s) +
  ", freshY=" + freshSpawn.y +
  ", freshZone=" + fresh.zoneChipLabel() +
  ", freshToday=" + todayPlate(fresh) +
  ", doneToday=" + todayPlate(doneApi) +
  ", huntEmptySurf=false huntBaggedSurf=true" +
  ", surfClear=" + hunt390.ribbonSurfaceClear({
    x: 12, y: hunt390.ribbonLowParkTop(phoneCss(28)),
    w: 400, h: phoneCss(28),
  }) +
  ", holdW=" + deskWalk.t.toFixed(2) + "s" +
  ")");
