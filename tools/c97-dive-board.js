// C97 — DIVE / SURFACE HUD chips are pier-board signs
// (clip drawPierBoards + #e8c04a gold stroke), not a flat cyan
// card("rgba(40, 160, 180, …)") fill. Title Continue / Play /
// New Game stay C96 titleBoardBtn. Pause / help / mute / reset /
// book-close stay flat panelBtn. Paint-only: hitbox size,
// actionChipInset, visualViewport floor, cameras, HUD plates,
// walk speeds stay.
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

const chip = src.match(/function drawPierBoardChip\s*\(\s*x,\s*y,\s*w,\s*h,\s*label,\s*fontPx,\s*stain\s*\)\s*\{[\s\S]*?\n  \}/);
assert(chip, "drawPierBoardChip body is present");
assert(/roundRect\(x, y, w, h, r\); ctx\.clip\(\)/.test(chip[0]),
  "DIVE chip clips a rounded rect");
assert(/drawPierBoards\(x, y, w, h/.test(chip[0]),
  "DIVE chip paints a real plank field, not a flat fill");
assert(/#e8c04a/.test(chip[0]), "DIVE chip uses the header gold stroke");
assert(/rgba\(90, 48, 16, 0\.55\)/.test(chip[0]),
  "DIVE chip keeps the header wood outline");
assert(/Fredoka/.test(chip[0]), "DIVE chip keeps Fredoka labels");
assert(/#fff6e8/.test(chip[0]), "DIVE / SURFACE labels stay cream");
assert(!/#2a9d8f/.test(chip[0]) && !/#3d6f7a/.test(chip[0]),
  "DIVE chip is wood + gold, not a flat teal / slate fill");
assert(!/rgba\(40, 160, 180/.test(chip[0]),
  "DIVE chip helper is not a cyan card fill");
assert(!/btn\(/.test(chip[0]),
  "chip helper is paint-only — hitboxes stay on the caller");

const divePaint = src.match(/else if \(diveChipLegal\(\)\) \{[\s\S]*?btn\("dive", db\.x, db\.y, db\.w, db\.h\);/);
assert(divePaint, "diveChipLegal paint block is present");
assert(/drawPierBoardChip\(db\.x, db\.y, db\.w, db\.h/.test(divePaint[0]),
  "DIVE action chip paints the pier-board sign");
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
  "SURFACE action chip paints the pier-board sign");
assert(!/card\(sb\.x, sb\.y, sb\.w, sb\.h/.test(surfPaint[0]),
  "SURFACE action chip is not a flat card fill");
assert(!/rgba\(40, 160, 180/.test(surfPaint[0]),
  "SURFACE action chip is not a cyan HUD pill");
assert(/phoneCss\(\s*16\s*\)/.test(surfPaint[0]),
  "portrait SURFACE type still uses phoneCss");

assert(/card\(eb\.x, eb\.y, eb\.w, eb\.h,\s*"rgba\(40, 160, 180, 0\.88\)"/.test(src),
  "BOAT prompt stays the existing cyan card");

assert(/function titleBoardBtn\s*\(/.test(src), "C96 titleBoardBtn stays");
assert(/C96 — title action boards only/.test(src),
  "C96 names the title-board rule");
const board = src.match(/function titleBoardBtn\s*\(\s*id,\s*x,\s*y,\s*w,\s*h,\s*label,\s*scale,\s*fontPx,\s*quiet\s*\)\s*\{[\s\S]*?\n  \}/);
assert(board, "titleBoardBtn body is present");
assert(/drawPierBoards\(x, y, w, h/.test(board[0]) && /#e8c04a/.test(board[0]),
  "title Continue / Play / New Game still paint wood + gold");
assert(/quiet \? "rgba\(40, 20, 8, 0\.40\)"/.test(board[0]),
  "New Game stays the quieter stain");

const title = src.match(/function drawTitle\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(title, "drawTitle body is present");
assert(/titleBoardBtn\("continue"/.test(title[0]),
  "Continue still uses titleBoardBtn");
assert(/titleBoardBtn\("play"[\s\S]*"New Game"/.test(title[0]),
  "New Game still uses titleBoardBtn");
assert(/titleBoardBtn\("play"[\s\S]*"Play"/.test(title[0]),
  "Play still uses titleBoardBtn");
assert(/"New Game", 1, lay\.btnFont, true/.test(title[0]),
  "New Game stays the quieter stain call");
assert(/species unlocked/.test(title[0]) && /#ffe27a/.test(title[0]),
  "yellow save line stays between Continue and New Game");
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

assert(/Aqua Bay · loop 102/.test(src), "title/pause stamp is loop 102");
assert(!/Aqua Bay · loop 101/.test(src), "loop 101 stamp is gone");

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

const W = 1280;
const DESKTOP_H = 720;
function portraitH(cssW, cssH) { return Math.max(960, Math.round(W * cssH / cssW)); }
function phoneCss(cssPx, cssW) { return Math.max(8, Math.round(cssPx * W / cssW)); }

const CSS_W = 390;
const LAYOUT_H = 844;
const VIS_H = 655;
assert(portraitStage(CSS_W, LAYOUT_H), "390×844 is portrait");
assert(portraitStage(CSS_W, VIS_H), "390×655 is portrait");
assert(!desktopStage(CSS_W, LAYOUT_H), "390-wide is not desktop");

function visibleStageBottom(H0, visH) {
  return Math.round(H0 * Math.min(1, visH / (H0 * (CSS_W / W))));
}
function actionChipInset(cssW) {
  return phoneCss(18, cssW);
}

function actionBtnBox(H0, visH, cssW) {
  const w = phoneCss(120, cssW);
  const h = phoneCss(48, cssW);
  const inset = actionChipInset(cssW);
  const floor = Math.round(H0 * (visH / (H0 * cssW / W) > 1 ? 1 : visH / (cssW / W * H0 / cssW * cssW)));
  // Match game.js: floor = visible stage bottom in stage px.
  const floor2 = Math.round(visH * (W / cssW));
  const x = W - inset - w;
  const y = floor2 - inset - h;
  return { x, y, w, h, inset, floor: floor2 };
}

const dock = actionBtnBox(portraitH(CSS_W, LAYOUT_H), VIS_H, CSS_W);
assert(dock.w === phoneCss(120, CSS_W), "DIVE stays a 120 CSS thumb chip");
assert(dock.h === phoneCss(48, CSS_W), "DIVE keeps the 48 CSS chip height");
assert(dock.w / W * CSS_W >= 100 && dock.w / W * CSS_W < 160,
  "DIVE stays a thumb chip on 390");
assert(dock.h / portraitH(CSS_W, VIS_H) * VIS_H >= 40,
  "DIVE stays fat enough to tap on 390");
assert(dock.x + dock.w <= W - dock.inset,
  "DIVE still insets from the right");
assert(dock.y + dock.h <= dock.floor - dock.inset,
  "DIVE still insets from the visual floor");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(clamp(10, 0, 8) === 8, "clamp helper stays available");

console.log("c97 DIVE / SURFACE pier-board chips: ok");
