// C88 — plaza tank-draw path is not three identical fills. Clownfish,
// Goldfish, and locked bowls each have a unique water / habitat / lock
// silhouette. Candy-stripe awning is gone. Paint-only: tank positions,
// prices, cameras, HUD, DIVE cues, and walk speeds stay.
const fs = require("fs");
const path = require("path");

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/function drawTankHabitat\s*\(/.test(src), "unique habitat helper exists");
assert(/function tankWaterFill\s*\(/.test(src), "unique water helper exists");
assert(/function drawTankLockGlass\s*\(/.test(src), "locked glass helper exists");
assert(/function drawTankSilhouetteFish\s*\(/.test(src), "species silhouette helper exists");
assert(/function drawPlazaShopWall\s*\(/.test(src), "painted shop wall exists");

const habitat = src.match(/function drawTankHabitat\s*\(\s*i,\s*t,\s*stocked\s*\)\s*\{[\s\S]*?\n  \}/);
assert(habitat, "drawTankHabitat body is present");
assert(/if \(i === 0\)/.test(habitat[0]), "Clownfish habitat is its own branch");
assert(/if \(i === 1\)/.test(habitat[0]), "Tang habitat is its own branch");
assert(/if \(i === 2\)/.test(habitat[0]), "Goldfish habitat is its own branch");
assert(/else if \(!speciesUnlocked\(i\)\)/.test(habitat[0]), "locked tanks have their own habitat");
assert(/#e8786a/.test(habitat[0]) && /if \(i === 0\)/.test(habitat[0]),
  "Clownfish tank paints its anemone garden");
assert(/#ffe14a/.test(habitat[0]) && /if \(i === 1\)/.test(habitat[0]),
  "Tang tank paints its reef-yellow habitat");
assert(/#6aaa3a/.test(habitat[0]) && /if \(i === 2\)/.test(habitat[0]),
  "Goldfish tank paints its garden habitat");
assert(/drawTankSilhouetteFish\("lock"/.test(habitat[0]), "locked tanks paint a lock silhouette");
assert(!/#e8786a/.test(habitat[0].split("if (i === 2)")[1] || ""),
  "Goldfish branch does not reuse the Clownfish anemone fill");

const water = src.match(/function tankWaterFill\s*\(\s*i,\s*t\s*\)\s*\{[\s\S]*?\n  \}/);
assert(water, "tankWaterFill body is present");
assert(/if \(i === 0\)/.test(water[0]), "Clownfish water is unique");
assert(/if \(i === 1\)/.test(water[0]), "Tang water is unique");
assert(/if \(i === 2\)/.test(water[0]), "Goldfish water is unique");
assert(/!speciesUnlocked\(i\)/.test(water[0]), "locked water is unique");
const clownStop = (water[0].match(/if \(i === 0\) \{[\s\S]*?else if/) || [""])[0];
const tangStop = (water[0].match(/if \(i === 1\) \{[\s\S]*?else if/) || [""])[0];
const goldStop = (water[0].match(/if \(i === 2\) \{[\s\S]*?else if/) || [""])[0];
const lockStop = (water[0].match(/!speciesUnlocked\(i\)\) \{[\s\S]*?else/) || [""])[0];
assert(clownStop.indexOf("255,196,120") >= 0, "Clownfish water has warm amber");
assert(tangStop.indexOf("80,170,255") >= 0, "Tang water has reef blue");
assert(goldStop.indexOf("180,230,120") >= 0, "Goldfish water has garden green");
assert(lockStop.indexOf("120,140,160") >= 0, "locked water is slate, not the open teal");
assert(clownStop !== goldStop && goldStop !== lockStop && tangStop !== goldStop,
  "the gallery water fills are not identical");
assert(/kind === "tang"/.test(src), "tang silhouette is its own shape");

assert(/drawTankHabitat\(i, t, stocked\)/.test(src), "drawTank uses the unique habitat path");
assert(/if \(!open\) drawTankLockGlass\(t\)/.test(src) || /if \(!speciesUnlocked\(i\)\) drawTankLockGlass\(t\)/.test(src),
  "locked tanks get frost + padlock on the glass");
assert(/kind === "clown"/.test(src) && /kind === "gold"/.test(src),
  "silhouette kinds are distinct, not one shared oval");

assert(!/i % 2 \? "#e85d4c" : "#fff6e8"/.test(src),
  "red/white candy-stripe awning is gone");
assert(/#4a9a94/.test(src) && /painted pier-shop clapboard/.test(src),
  "shop wall is painted teal clapboard");
assert(/drawPlazaShopWall\(\)/.test(src), "shop wall is painted behind the tanks");

assert(/C88 — board seams/.test(src), "deck plank seams are the C88 pass");
assert(/rgba\(36, 16, 6, 0\.42\)/.test(src), "board grooves are dark enough to read at 390");
assert(/rgba\(168, 108, 52, 0\.05\)/.test(src), "tan wash no longer flattens the deck");

const pos = src.match(/const TANK_POS = \[([\s\S]*?)\];/);
assert(pos, "TANK_POS stays");
assert(/\{ x: 340, y: 164 \}/.test(pos[0]) && /\{ x: 776, y: 164 \}/.test(pos[0]),
  "clustered aisle tank positions stay (loop 76)");
assert(/const TANK_W = 210, TANK_H = 156/.test(src), "tank size stays");

assert(/Aqua Bay · loop 103/.test(src), "title/pause stamp is loop 103");
assert(!/Aqua Bay · loop 102/.test(src), "loop 102 stamp is gone");

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

console.log("c88 plaza tanks / planks / painted wall: ok");
