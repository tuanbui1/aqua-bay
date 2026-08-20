// C91 — first-dock paint is a pier shop, not a stick-and-dots POP
// and a 12px OPEN scrap. Cooler has a body, glass, and cans. OPEN
// is a hanging readable sign. South lip has fascia + pilings + foam.
// Paint-only: planted positions, walk colliders, cameras, HUD, DIVE,
// unlocks, and prices stay.
const fs = require("fs");
const path = require("path");

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

const vend = src.match(/function drawVending\s*\(\s*x,\s*y\s*\)\s*\{[\s\S]*?\n  \}/);
assert(vend, "drawVending body is present");
assert(/C91 — soda cooler/.test(vend[0]), "POP draw path is the C91 cooler");
assert(/function drawPopCan\s*\(/.test(src), "can helper exists");
assert(/drawPopCan\(/.test(vend[0]), "cooler paints real cans, not dots");
assert(/const bw = 78, bh = 118/.test(vend[0]), "cooler body is a box, not a 40x76 stick");
assert(/if \(portraitStage\(\)\) return 1/.test(src),
  "portrait phone does not ghost POP / OPEN against a missing rail well");
assert(/#9ef0ff/.test(vend[0]) && /glass/.test(vend[0]), "cooler has a glass door");
assert(/fillText\("POP"/.test(vend[0]), "cooler stays labeled POP");
assert(!/roundRect\(x - 18, y, 40, 76/.test(src), "old 40x76 stick body is gone");
assert(!/arc\(x - 6 \+ \(i % 2\) \* 14, y \+ 16 \+ \(\(i \/ 2\) \| 0\) \* 8, 3\.2/.test(src),
  "old 3.2px colored-dot grid is gone");
assert(!/800 8px Nunito/.test(vend[0]), "old 8px POP scrap label is gone");

const sign = src.match(/function drawHangingSign\s*\(\s*x,\s*y\s*\)\s*\{[\s\S]*?\n  \}/);
assert(sign, "drawHangingSign body is present");
assert(/C91 — hanging shop sign/.test(sign[0]), "OPEN draw path is the C91 hanging sign");
assert(/800 20px Fredoka/.test(sign[0]), "OPEN type is 20px, not a 12px scrap");
assert(/roundRect\(-46, -12, 92, 44/.test(sign[0]), "OPEN board is a readable hanging sign");
assert(/fillText\("OPEN"/.test(sign[0]), "sign still says OPEN");
assert(!/roundRect\(-28, -8, 56, 28/.test(src), "old 56x28 scrap board is gone");
assert(!/800 11px Fredoka/.test(sign[0]), "old 11px OPEN scrap type is gone");

assert(/function drawDockWaterEdge\s*\(/.test(src), "dock water-edge helper exists");
assert(/drawDockWaterEdge\(500, 890, dockW, 130\)/.test(src),
  "south dock lip is painted after the boards");
const edge = src.match(/function drawDockWaterEdge\s*\(\s*x,\s*y,\s*w,\s*h\s*\)\s*\{[\s\S]*?\n  \}/);
assert(edge, "drawDockWaterEdge body is present");
assert(/drawFoamBand\(/.test(edge[0]), "water edge paints foam at the lip");
assert(/drawPierPost\(/.test(edge[0]), "water edge paints pilings under the fascia");
assert(/C91 — south lip/.test(edge[0]), "south lip is the C91 pass");
assert(/fascia/.test(edge[0]) || /#8a5a30/.test(edge[0]),
  "south lip has a timber fascia, not a hard color cut");

assert(/const POP_VEND = \{ x: 996, y: 918 \}/.test(src), "POP planted position stays");
assert(/const OPEN_SIGN = \{ x: 1052, y: 924 \}/.test(src), "OPEN planted position stays");
assert(/return \{ x: 500, y: 890, w: 760, h: 130 \}/.test(src),
  "shopDockWalk collider stays");
assert(!/pushOut\(POP_VEND/.test(src) && !/pushOut\(OPEN_SIGN/.test(src),
  "POP / OPEN did not grow walk colliders");

assert(/Aqua Bay · loop 102/.test(src), "title/pause stamp is loop 102");
assert(!/Aqua Bay · loop 101/.test(src), "loop 101 stamp is gone");

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
assert(/function tankHudClearY\s*\(/.test(src), "C89 HUD-clear nudge stays");
assert(/function speciesUnlocked\s*\(/.test(src), "C90 unlock gate stays");
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/C67/.test(src), "C67 second dive after cashier stays");
assert(/C75|surfaceLock|requestSurface/.test(src), "C75 surface after 1 fish stays");
assert(/function galleryOpen\s*\(/.test(src), "galleryOpen stays");
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
assert(/unlock:\s*0/.test(src) && /unlock:\s*60/.test(src) && /unlock:\s*1400/.test(src),
  "original 5 unlock prices stay");
assert(/unlock:\s*220/.test(src) && /unlock:\s*550/.test(src),
  "Goldfish / Koi unlock prices stay");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/Homa/.test(src), "no Homa names");

console.log("c91 dock POP cooler / OPEN sign / water edge: ok");
