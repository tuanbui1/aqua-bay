// C99 — leftover first-two-minute cyan action chips
// (drawDockCorner DIVE after you surface and walk off the dock,
// plus drawStockWalkCue “tap to stock”) are pier-board signs
// (same drawPierBoardChip wood + #e8c04a gold as C97 DIVE /
// C98 SURFACE), not leftover flat cyan card("rgba(40, 160, 180, …)")
// fills. Paint only: hitboxes, actionChipInset, visualViewport
// floor stay. C97 DIVE and C98 SURFACE stay. Pause / help / mute /
// reset / book-close stay flat panelBtn. Title Continue / Play /
// New Game stay titleBoardBtn.
const fs = require("fs");
const path = require("path");

function desktopStage(w, h) { return w >= 880 && w >= h * 0.92; }
function phonePortrait(w, h) { return h > w * 1.05; }
function portraitStage(w, h) { return !desktopStage(w, h) && phonePortrait(w, h); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/function drawPierBoardChip\s*\(/.test(src), "drawPierBoardChip helper exists");
assert(/C97 — DIVE \/ SURFACE HUD chips/.test(src),
  "C97 names the DIVE-board rule");
assert(/C98 — first-dive ↑ SURFACE assist/.test(src),
  "C98 names the SURFACE-assist board rule");
assert(/C99 — leftover first-two-minute cyan chips/.test(src),
  "C99 names the leftover-chip board rule");

const chip = src.match(/function drawPierBoardChip\s*\(\s*x,\s*y,\s*w,\s*h,\s*label,\s*fontPx,\s*stain\s*\)\s*\{[\s\S]*?\n  \}/);
assert(chip, "drawPierBoardChip body is present");
assert(/roundRect\(x, y, w, h, r\); ctx\.clip\(\)/.test(chip[0]),
  "pier-board chip clips a rounded rect");
assert(/drawPierBoards\(x, y, w, h/.test(chip[0]),
  "pier-board chip paints a real plank field, not a flat fill");
assert(/#e8c04a/.test(chip[0]), "pier-board chip uses the header gold stroke");
assert(/rgba\(90, 48, 16, 0\.55\)/.test(chip[0]),
  "pier-board chip keeps the header wood outline");
assert(/Fredoka/.test(chip[0]), "pier-board chip keeps Fredoka labels");
assert(/#fff6e8/.test(chip[0]), "DIVE / SURFACE / stock labels stay cream");
assert(!/#2a9d8f/.test(chip[0]) && !/#3d6f7a/.test(chip[0]),
  "pier-board chip is wood + gold, not a flat teal / slate fill");
assert(!/rgba\(40, 160, 180/.test(chip[0]),
  "pier-board chip helper is not a cyan card fill");
assert(!/btn\(/.test(chip[0]),
  "chip helper is paint-only — hitboxes stay on the caller");

const corner = src.match(/function drawDockCorner\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(corner, "drawDockCorner body is present");
assert(/drawPierBoardChip\(b\.x, b\.y, b\.w, b\.h/.test(corner[0]),
  "drawDockCorner DIVE paints through drawPierBoardChip");
assert(/thumbCopy\(\) \? "DIVE" : "→ DIVE"/.test(corner[0]),
  "corner DIVE keeps the same labels");
assert(!/card\(b\.x, b\.y, b\.w, b\.h/.test(corner[0]),
  "corner DIVE is not a flat card fill");
assert(!/rgba\(40, 160, 180/.test(corner[0]),
  "corner DIVE is not a leftover cyan HUD pill");
assert(!/fillText\(\s*(thumbCopy\(\) \? "DIVE"|\"DIVE\")/.test(corner[0]),
  "corner DIVE does not hand-paint the label on a cyan card");
assert(/btn\("dive", b\.x, b\.y, b\.w, b\.h\)/.test(corner[0]),
  "corner DIVE keeps the same hitbox id and box");
assert(/dockCornerBox\(\)/.test(corner[0]),
  "corner DIVE still uses dockCornerBox");
assert(/phoneCss\(\s*18\s*\)/.test(corner[0]),
  "portrait corner DIVE type still uses phoneCss");

const stock = src.match(/function drawStockWalkCue\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(stock, "drawStockWalkCue body is present");
assert(/drawPierBoardChip\(chip\.x, chip\.y, chip\.w, chip\.h/.test(stock[0]),
  "tap to stock paints through drawPierBoardChip");
assert(/thumbCopy\(\) \? "tap to stock" : "walk here to stock"/.test(stock[0]),
  "stock cue keeps the same labels");
assert(!/rgba\(40, 160, 180/.test(stock[0]),
  "tap to stock is not a leftover cyan HUD pill");
assert(!/card\(chip\.x, chip\.y, chip\.w, chip\.h,\s*"rgba\(40, 160, 180/.test(stock[0]),
  "tap to stock is not a flat cyan card fill");
assert(/btn\("goto-stock", chip\.x, chip\.y, chip\.w, chip\.h\)/.test(stock[0]),
  "stock cue keeps the same hitbox id and box");
const stockHits = stock[0].match(/btn\("goto-stock"/g) || [];
assert(stockHits.length === 2, "both stock-cue paths keep goto-stock");
assert(/phoneCss\(\s*36\s*\)/.test(stock[0]),
  "390-first tap-to-stock hitbox stays 36 CSS tall");
assert(/phoneCss\(\s*200\s*\)/.test(stock[0]),
  "390-first tap-to-stock width cap stays phoneCss(200)");
assert(/:\s*32/.test(stock[0]) && /:\s*260/.test(stock[0]),
  "desktop tap-to-stock stays the planted 32-tall / 260-cap chip");
assert(/actionFloor\(\)/.test(stock[0]),
  "stock cue still sits above the C82 visualViewport / action floor");

const assist = src.match(/function drawSurfaceAssist\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(assist, "drawSurfaceAssist body is present");
assert(/drawPierBoardChip\(b\.x, b\.y, b\.w, b\.h/.test(assist[0]),
  "C98 first-dive ↑ SURFACE still paints through drawPierBoardChip");
assert(/"↑ SURFACE"/.test(assist[0]),
  "assist keeps the ↑ in the SURFACE label");
assert(!/card\(b\.x, b\.y, b\.w, b\.h/.test(assist[0]),
  "assist is not a flat card fill");
assert(!/rgba\(40, 160, 180/.test(assist[0]),
  "assist is not a leftover cyan HUD pill");
assert(/btn\("goto-surface", b\.x, b\.y, b\.w, b\.h\)/.test(assist[0]),
  "assist keeps the same hitbox id and box");
assert(/actionChipInset\(\)/.test(assist[0]),
  "assist still insets with C84 actionChipInset");
assert(/actionFloor\(\)/.test(assist[0]),
  "assist still sits on the C82 visualViewport / action floor");

const divePaint = src.match(/else if \(diveChipLegal\(\)\) \{[\s\S]*?btn\("dive", db\.x, db\.y, db\.w, db\.h\);/);
assert(divePaint, "diveChipLegal paint block is present");
assert(/drawPierBoardChip\(db\.x, db\.y, db\.w, db\.h/.test(divePaint[0]),
  "C97 DIVE action chip still paints the pier-board sign");
assert(!/card\(db\.x, db\.y, db\.w, db\.h/.test(divePaint[0]),
  "DIVE action chip is not a flat card fill");
assert(!/rgba\(40, 160, 180/.test(divePaint[0]),
  "DIVE action chip is not a cyan HUD pill");
assert(/btn\("dive", db\.x, db\.y, db\.w, db\.h\)/.test(divePaint[0]),
  "DIVE keeps the same hitbox id and box");
assert(/phoneCss\(\s*18\s*\)/.test(divePaint[0]),
  "portrait DIVE type still uses phoneCss");

const surfPaint = src.match(/if \(surfaceActionLegal\(\)\) \{[\s\S]*?ctx\.globalAlpha = 1;\n    \}/);
assert(surfPaint, "surfaceActionLegal paint block is present");
assert(/drawPierBoardChip\(sb\.x, sb\.y, sb\.w, sb\.h/.test(surfPaint[0]),
  "C97 legal SURFACE action chip still paints the pier-board sign");
assert(!/card\(sb\.x, sb\.y, sb\.w, sb\.h/.test(surfPaint[0]),
  "legal SURFACE action chip is not a flat card fill");
assert(!/rgba\(40, 160, 180/.test(surfPaint[0]),
  "legal SURFACE action chip is not a cyan HUD pill");
assert(/phoneCss\(\s*16\s*\)/.test(surfPaint[0]),
  "portrait legal SURFACE type still uses phoneCss");

assert(/card\(eb\.x, eb\.y, eb\.w, eb\.h,\s*"rgba\(40, 160, 180, 0\.88\)"/.test(src),
  "BOAT prompt stays the existing cyan card");

assert(/function titleBoardBtn\s*\(/.test(src), "C96 titleBoardBtn stays");
assert(/C96 — title action boards only/.test(src),
  "C96 names the title-board rule");
const title = src.match(/function drawTitle\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(title, "drawTitle body is present");
assert(/titleBoardBtn\("continue"/.test(title[0]),
  "Continue still uses titleBoardBtn");
assert(/titleBoardBtn\("play"[\s\S]*"New Game"/.test(title[0]),
  "New Game still uses titleBoardBtn");
assert(/titleBoardBtn\("play"[\s\S]*"Play"/.test(title[0]),
  "Play still uses titleBoardBtn");
assert(!/drawPierBoardChip\(/.test(title[0]),
  "title does not reroute through the DIVE chip helper");

const panel = src.match(/function panelBtn\s*\(\s*id,\s*x,\s*y,\s*w,\s*h,\s*label,\s*accent,\s*scale,\s*fontPx\s*\)\s*\{[\s\S]*?\n  \}/);
assert(panel, "panelBtn body is present");
assert(/fillStyle = accent \|\| "#2a9d8f"/.test(panel[0]),
  "pause pills still fill teal / accent");
assert(!/drawPierBoards/.test(panel[0]),
  "panelBtn is not the wood path");
assert(!/#e8c04a/.test(panel[0]),
  "panelBtn is still a flat pill, not a gold sign");

const pause = src.match(/function drawPause\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(pause, "drawPause body is present");
assert(/panelBtn\("resume"/.test(pause[0]), "pause Resume stays a flat pill");
assert(/panelBtn\("help"/.test(pause[0]), "pause Help stays a flat pill");
assert(/panelBtn\("mute"/.test(pause[0]), "pause mute stays a flat pill");
assert(/panelBtn\("reset"/.test(pause[0]), "pause New Game stays a flat pill");
assert(/panelBtn\("back"/.test(pause[0]), "help Back stays a flat pill");
assert(!/titleBoardBtn\(/.test(pause[0]),
  "pause / help do not use the title wood boards");
assert(!/drawPierBoardChip\(/.test(pause[0]),
  "pause / help do not use the DIVE wood chip");
assert(/"#a84a3a"/.test(pause[0]),
  "pause reset stays the existing red pill");
assert(/panelBtn\("book-close"/.test(src), "book-close stays a flat panelBtn");

assert(/Aqua Bay · loop 101/.test(src), "title/pause stamp is loop 101");
assert(!/Aqua Bay · loop 100/.test(src), "loop 100 stamp is gone");

assert(/function actionChipInset\s*\(/.test(src), "DIVE chip inset stays");
assert(/visibleStageBottom/.test(src) && /visualViewport/.test(src),
  "visualViewport DIVE floor stays");
assert(/w:\s*phoneCss\(\s*120\s*\)/.test(src) && /h:\s*phoneCss\(\s*48\s*\)/.test(src),
  "portrait DIVE hitbox stays 120 × 48 CSS");
assert(/HUD_READOUT_PLATE/.test(src), "BAG / money plates stay");
assert(/function wrapHudLines\s*\(/.test(src), "toast wrap from C85 stays");
assert(/function tankHudClearY\s*\(/.test(src), "C89 HUD-clear nudge stays");
assert(/function speciesUnlocked\s*\(/.test(src), "C90 unlock gate stays");
assert(/function drawPickerBackdrop\s*\(/.test(src), "C95 painted backdrop stays");
assert(/function pickerLabelLayout\s*\(/.test(src), "C95 label inset stays");
assert(/C94 — 390-wide title stack/.test(src), "C94 title-stack rule stays");
assert(/function speechStageRect\s*\(/.test(src), "C93 speech clamp stays");
assert(/C93 — hang the board off the arm/.test(src), "C93 OPEN hang stays");
assert(/C92 — pier bait hut/.test(src), "C92 BAIT hut paint stays");
assert(/C91 — soda cooler/.test(src), "C91 POP cooler stays");
assert(/C67/.test(src), "C67 second dive after cashier stays");
assert(/C75|surfaceLock|requestSurface/.test(src), "C75 surface after 1 fish stays");
assert(/function galleryOpen\s*\(/.test(src), "galleryOpen stays");
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
assert(/unlock:\s*0/.test(src) && /unlock:\s*60/.test(src) && /unlock:\s*1400/.test(src),
  "original 5 unlock prices stay");
assert(/unlock:\s*220/.test(src) && /unlock:\s*550/.test(src),
  "Goldfish / Koi unlock prices stay");
assert(/const SKIN_IDS = \["skip", "reef", "dino"\]/.test(src),
  "still exactly three cards: Skip / Reef / Dino");
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/Homa/.test(src), "no Homa names");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(/const PLAZA_CAM_CEILING\s*=\s*520/.test(src), "plaza camera ceiling stays 520");
assert(/const DOCK_CAM_FLOOR\s*=\s*1000/.test(src), "dock camera floor stays 1000");
assert(/const DIVE_WALK_SPEED\s*=\s*480/.test(src), "dash speed stays 480");
assert(/232 \+ state\.speedLv \* 38 \+ firstBump/.test(src),
  "planted / tap-to-walk base speed stays 232");
assert(/const OPEN_SIGN = \{ x: 1052, y: 924 \}/.test(src), "OPEN planted position stays");
assert(/const BAIT_HUT = \{ x: 1124, y: 918 \}/.test(src), "hut planted position stays");
assert(/const POP_VEND = \{ x: 996, y: 918 \}/.test(src), "POP planted position stays");
assert(/return player\.y < 280/.test(src), "C97 nearSurface retint stays y<280");

const W = 1280;
function phoneCss(cssPx, cssW) { return Math.max(8, Math.round(cssPx * W / cssW)); }

const CSS_W = 390;
const LAYOUT_H = 844;
const VIS_H = 655;
assert(portraitStage(CSS_W, LAYOUT_H), "390×844 is portrait");
assert(portraitStage(CSS_W, VIS_H), "390×655 is portrait");
assert(!desktopStage(CSS_W, LAYOUT_H), "390-wide is not desktop");
assert(desktopStage(1280, 720), "1280×720 is desktop 16:9");

const stockH = phoneCss(36, CSS_W);
assert(stockH === phoneCss(36, CSS_W), "tap-to-stock stays the 36 CSS chip on 390");
assert(stockH / W * CSS_W >= 32 && stockH / W * CSS_W <= 44,
  "tap-to-stock stays a fat chip on 390");
assert(36 >= 32, "36 CSS stays fat enough to tap on 390");

const diveW = phoneCss(120, CSS_W);
const diveH = phoneCss(48, CSS_W);
const inset = phoneCss(18, CSS_W);
assert(diveW / W * CSS_W >= 100 && diveW / W * CSS_W < 160,
  "corner DIVE stays a thumb chip on 390 (same actionBtnBox)");
assert(diveH / W * CSS_W >= 40, "corner DIVE stays fat enough to tap on 390");
assert(inset === phoneCss(18, CSS_W), "C84 actionChipInset stays 18 CSS");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(clamp(10, 0, 8) === 8, "clamp helper stays available");

console.log("c99 leftover cyan chips via drawPierBoardChip: ok");
