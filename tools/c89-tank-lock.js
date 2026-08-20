// C89 — gold padlock + frost only on locked tanks. Unlocked / starter
// bowls keep live fish (or the empty name / stock cue) and never paint
// a lock. Colorful Tang / Goldfish silhouettes are not a fake "open"
// gallery on a locked species. Paint-only: tank positions, prices,
// cameras, HUD plates, DIVE cues, and walk speeds stay.
const fs = require("fs");
const path = require("path");

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/function drawTankPadlock\s*\(/.test(src), "padlock helper exists");
assert(/function drawTankLockGlass\s*\(/.test(src), "locked glass helper exists");
assert(/function tankHudClearY\s*\(/.test(src), "HUD-clear nudge for badges exists");

const lockGlass = src.match(/function drawTankLockGlass\s*\(\s*t\s*\)\s*\{[\s\S]*?\n  \}/);
assert(lockGlass, "drawTankLockGlass body is present");
assert(/drawTankPadlock\(/.test(lockGlass[0]), "padlock is painted from the locked-glass helper");

const padlockCalls = src.match(/drawTankPadlock\s*\(/g) || [];
assert(padlockCalls.length === 2, "padlock is defined once and called once, got " + padlockCalls.length);

const lockGlassCalls = src.match(/drawTankLockGlass\s*\(/g) || [];
assert(lockGlassCalls.length === 2, "lock glass is defined once and called once, got " + lockGlassCalls.length);
assert(/if \(!open\) drawTankLockGlass\(t\)/.test(src),
  "padlock / frost draw is gated on locked, not painted on every tank");

const drawTank = src.match(/function drawTank\s*\(\s*i\s*\)\s*\{[\s\S]*?\n  \}/);
assert(drawTank, "drawTank body is present");
assert(!/drawTankPadlock\(/.test(drawTank[0]),
  "drawTank does not stamp a padlock on every bowl");
assert(/if \(!open\) drawTankLockGlass\(t\)/.test(drawTank[0]),
  "only the locked branch calls lock glass");
assert(/if \(open\)/.test(drawTank[0]) && /sp\.name/.test(drawTank[0]),
  "unlocked tanks paint a readable species name");
assert(/"empty"/.test(drawTank[0]) || /empty/.test(drawTank[0]),
  "empty unlocked bowls still get a stock cue, not a lock");
assert(/speciesUnlocked\(i\)/.test(drawTank[0]),
  "drawTank keys open / lock off speciesUnlocked, not stock");

const habitat = src.match(/function drawTankHabitat\s*\(\s*i,\s*t,\s*stocked\s*\)\s*\{[\s\S]*?\n  \}/);
assert(habitat, "drawTankHabitat body is present");
const tangHab = (habitat[0].match(/if \(i === 1\) \{[\s\S]*?else if \(i === 2\)/) || [""])[0];
const goldHab = (habitat[0].match(/if \(i === 2\) \{[\s\S]*?else if \(!speciesUnlocked/) || [""])[0];
assert(/if \(speciesUnlocked\(i\)\)/.test(tangHab),
  "Blue Tang habitat is unlocked-only (no live-looking locked tang)");
assert(/if \(speciesUnlocked\(i\)\)/.test(goldHab),
  "Goldfish habitat is unlocked-only (no live-looking locked gold)");
assert(/#2f7dff/.test(tangHab) && /speciesUnlocked\(i\)/.test(tangHab),
  "tang color sits inside the unlocked branch");
assert(/drawTankSilhouetteFish\("lock"/.test(tangHab),
  "locked Tang paints a lock silhouette, not a live blue disc");
assert(/else if \(!speciesUnlocked\(i\)\)/.test(habitat[0]),
  "locked tanks keep their own frost habitat");
assert(/drawTankSilhouetteFish\("lock"/.test(habitat[0]),
  "locked tanks paint a lock silhouette, not a live species");
assert(!/!\s*stocked\s*\|\|\s*!state\.unlocked\[i\]/.test(habitat[0]),
  "colorful silhouettes are not forced on when the species is locked");

const water = src.match(/function tankWaterFill\s*\(\s*i,\s*t\s*\)\s*\{[\s\S]*?\n  \}/);
assert(water, "tankWaterFill body is present");
const tangWater = (water[0].match(/if \(i === 1\) \{[\s\S]*?else if \(i === 2\)/) || [""])[0];
const goldWater = (water[0].match(/if \(i === 2\) \{[\s\S]*?else if \(!speciesUnlocked/) || [""])[0];
assert(/if \(speciesUnlocked\(i\)\)/.test(tangWater) && tangWater.indexOf("80,170,255") >= 0,
  "Tang water is unlocked-only");
assert(/if \(speciesUnlocked\(i\)\)/.test(goldWater) && goldWater.indexOf("180,230,120") >= 0,
  "Goldfish water is unlocked-only");
assert(/!speciesUnlocked\(i\)/.test(water[0]), "locked water stays slate");
assert(tangWater.indexOf("120,140,160") >= 0, "locked Tang water falls back to slate");

function tankShowsPadlock(unlocked) {
  return !unlocked;
}
assert(!tankShowsPadlock(true), "starter / unlocked tank has no padlock");
assert(tankShowsPadlock(false), "locked tank keeps the padlock");
assert(!tankShowsPadlock(true) && tankShowsPadlock(false),
  "padlock gate matches galleryOpen / unlock-not-met (unlocked flag)");

assert(/Aqua Bay · loop 103/.test(src), "title/pause stamp is loop 103");
assert(!/Aqua Bay · loop 102/.test(src), "loop 102 stamp is gone");

assert(/const TANK_W = 210, TANK_H = 156/.test(src), "tank size stays");
const pos = src.match(/const TANK_POS = \[([\s\S]*?)\];/);
assert(pos, "TANK_POS stays");
assert(/\{ x: 340, y: 164 \}/.test(pos[0]) && /\{ x: 776, y: 164 \}/.test(pos[0]),
  "clustered aisle tank positions stay (loop 76)");

assert(/const DIVE_WALK_SPEED\s*=\s*480/.test(src), "dash speed stays 480");
assert(/232 \+ state\.speedLv \* 38 \+ firstBump/.test(src),
  "planted / tap-to-walk base speed stays 232");
assert(/const PLAZA_CAM_CEILING\s*=\s*520/.test(src), "plaza camera ceiling stays 520");
assert(/const DOCK_CAM_FLOOR\s*=\s*1000/.test(src), "dock camera floor stays 1000");
assert(/function actionChipInset\s*\(/.test(src), "DIVE chip inset stays");
assert(/visibleStageBottom/.test(src) && /visualViewport/.test(src),
  "visualViewport DIVE floor stays");
assert(/function wrapHudLines\s*\(/.test(src), "toast wrap from C85 stays");
assert(/HUD_READOUT_PLATE/.test(src), "BAG / money plates stay");
assert(/function drawDiveWalkCue\s*\(/.test(src), "C87 heading chip stays");
assert(/function hideSouthDockHint\s*\(/.test(src), "C87 south-hint gate stays");
assert(/C88 — board seams/.test(src), "C88 plank seams stay");
assert(/#4a9a94/.test(src) && /painted pier-shop clapboard/.test(src),
  "C88 teal clapboard wall stays");

assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/C67/.test(src), "C67 second dive after cashier stays");
assert(/C75|surfaceLock|requestSurface/.test(src), "C75 surface after 1 fish stays");
assert(/function galleryOpen\s*\(/.test(src), "galleryOpen stays");
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(/unlock:\s*0/.test(src) && /unlock:\s*60/.test(src) && /unlock:\s*1400/.test(src),
  "original 5 unlock prices stay");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");

console.log("c89 padlock only on locked tanks: ok");
