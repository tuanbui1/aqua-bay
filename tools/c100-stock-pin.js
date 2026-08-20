// C100 — pin tap-to-stock to the glowing unlocked tank.
// Loop 99 playtest (390 plaza): BAG 1/5 is Clownfish. drawStockWalkCue
// still paints and goto-stock still walks to that unlocked bowl, but
// the wood drawPierBoardChip sat at W/2 and covered locked Goldfish
// (Unlock $220). Park the chip on the glowing tank (world→screen of
// glowingStockIndex / ts.x), not screen-center. Not a hide-on-locked
// gate. C97–C99 DIVE / SURFACE / dockCorner / stock stay on
// drawPierBoardChip. Same fat ~36 CSS chip and goto-stock hitbox.
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

assert(/C100 — pin that pier-board to the glowing unlocked tank/.test(src),
  "C100 names the tank-local pin rule");
assert(/C99 — leftover first-two-minute cyan chips/.test(src),
  "C99 leftover-chip board rule stays");
assert(/C97 — DIVE \/ SURFACE HUD chips/.test(src),
  "C97 names the DIVE-board rule");
assert(/C98 — first-dive ↑ SURFACE assist/.test(src),
  "C98 names the SURFACE-assist board rule");

const stock = src.match(/function drawStockWalkCue\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(stock, "drawStockWalkCue body is present");
assert(/glowingStockIndex\(\)/.test(stock[0]),
  "stock cue still keys off glowingStockIndex");
assert(/worldToScreen\(t\.x \+ TANK_W \/ 2, t\.y \+ TANK_H \* 0\.42\)/.test(stock[0]),
  "chip anchor is the glowing tank world→screen point");
assert(/clamp\(ts\.x, tw \/ 2 \+ 16, W - tw \/ 2 - 16\)/.test(stock[0]),
  "pier-board x is the glowing tank screen x, not W/2");
assert(!/clamp\(\s*W\s*\/\s*2\s*,/.test(stock[0]),
  "tap-to-stock no longer parks at screen-center W/2");
assert(/wantY = ts\.y - ch \* 0\.65/.test(stock[0]),
  "pier-board y sits on the glowing bowl, not a HUD mid-band");
assert(/drawPierBoardChip\(chip\.x, chip\.y, chip\.w, chip\.h/.test(stock[0]),
  "tap to stock still paints through drawPierBoardChip");
assert(/thumbCopy\(\) \? "tap to stock" : "walk here to stock"/.test(stock[0]),
  "stock cue keeps the same labels");
assert(/btn\("goto-stock", chip\.x, chip\.y, chip\.w, chip\.h\)/.test(stock[0]),
  "stock cue keeps the same hitbox id and box");
const stockHits = stock[0].match(/btn\("goto-stock"/g) || [];
assert(stockHits.length === 2, "both stock-cue paths keep goto-stock");
assert(!/if\s*\(\s*!speciesUnlocked\(\s*i\s*\)\s*\)\s*return/.test(stock[0]),
  "cue is not hidden as a lock gate — pin to the unlocked bag tank");
assert(/phoneCss\(\s*36\s*\)/.test(stock[0]),
  "390-first tap-to-stock hitbox stays 36 CSS tall");
assert(/phoneCss\(\s*200\s*\)/.test(stock[0]),
  "390-first tap-to-stock width cap stays phoneCss(200)");
assert(/:\s*32/.test(stock[0]) && /:\s*260/.test(stock[0]),
  "desktop tap-to-stock stays the planted 32-tall / 260-cap chip");

const corner = src.match(/function drawDockCorner\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(corner, "drawDockCorner body is present");
assert(/drawPierBoardChip\(b\.x, b\.y, b\.w, b\.h/.test(corner[0]),
  "C99 dockCorner DIVE still paints through drawPierBoardChip");

const assist = src.match(/function drawSurfaceAssist\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(assist, "drawSurfaceAssist body is present");
assert(/drawPierBoardChip\(b\.x, b\.y, b\.w, b\.h/.test(assist[0]),
  "C98 first-dive ↑ SURFACE still paints through drawPierBoardChip");

const divePaint = src.match(/else if \(diveChipLegal\(\)\) \{[\s\S]*?btn\("dive", db\.x, db\.y, db\.w, db\.h\);/);
assert(divePaint, "diveChipLegal paint block is present");
assert(/drawPierBoardChip\(db\.x, db\.y, db\.w, db\.h/.test(divePaint[0]),
  "C97 DIVE action chip still paints the pier-board sign");

const surfPaint = src.match(/if \(surfaceActionLegal\(\)\) \{[\s\S]*?ctx\.globalAlpha = 1;\n    \}/);
assert(surfPaint, "surfaceActionLegal paint block is present");
assert(/drawPierBoardChip\(sb\.x, sb\.y, sb\.w, sb\.h/.test(surfPaint[0]),
  "C97 legal SURFACE action chip still paints the pier-board sign");

assert(/function speciesUnlocked\s*\(/.test(src), "C90 unlock gate stays");
assert(/if \(i === 0\) return true/.test(src), "Clownfish starter stays open");
assert(/const open = speciesUnlocked\(i\)/.test(src),
  "locked tanks still key padlock / Unlock $N off speciesUnlocked");
assert(/if \(!open\) drawTankLockGlass\(t\)/.test(src),
  "padlock / frost still paint on locked tanks");
assert(/Unlock  \$" \+ sp\.unlock/.test(src) || /Unlock \$/.test(src),
  "locked tanks still show Unlock $N");

assert(/Aqua Bay · loop 100/.test(src), "title/pause stamp is loop 100");
assert(!/Aqua Bay · loop 99/.test(src), "loop 99 stamp is gone");

assert(/function actionChipInset\s*\(/.test(src), "DIVE chip inset stays");
assert(/visibleStageBottom/.test(src) && /visualViewport/.test(src),
  "visualViewport DIVE floor stays");
assert(/HUD_READOUT_PLATE/.test(src), "BAG / money plates stay");
assert(/function wrapHudLines\s*\(/.test(src), "toast wrap from C85 stays");
assert(/function tankHudClearY\s*\(/.test(src), "C89 HUD-clear nudge stays");
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
assert(/C75|surfaceLock|requestSurface/.test(src), "C75 surface after 1 fish stays");
assert(/C67/.test(src), "C67 second dive after cashier stays");

const W = 1280;
function phoneCss(cssPx, cssW) { return Math.max(8, Math.round(cssPx * W / cssW)); }

const CSS_W = 390;
const LAYOUT_H = 844;
const VIS_H = 655;
assert(portraitStage(CSS_W, LAYOUT_H), "390×844 is portrait");
assert(portraitStage(CSS_W, VIS_H), "390×655 is portrait");
assert(!desktopStage(CSS_W, LAYOUT_H), "390-wide is not desktop");
assert(desktopStage(1280, 720), "1280×720 is desktop 16:9");

const TANK_W = 210, TANK_H = 156;
const TANK_POS = [
  { x: 340, y: 164 }, { x: 558, y: 164 }, { x: 776, y: 164 },
];
const stockH = phoneCss(36, CSS_W);
const stockCap = phoneCss(200, CSS_W);
assert(stockH / W * CSS_W >= 32 && stockH / W * CSS_W <= 44,
  "tap-to-stock stays a fat chip on 390");

function boxesOverlap(a, b, pad) {
  const p = pad || 0;
  return a.x < b.x + b.w + p && a.x + a.w > b.x - p &&
    a.y < b.y + b.h + p && a.y + a.h > b.y - p;
}

// 390 plaza leftover: camera framed so Goldfish sits near W/2 while
// unlocked Clownfish (bag fish) is the left bowl. Same world→screen
// as game.js: (x - cam.x) * z + viewCenterX.
function worldToScreen(x, y, cam, vcx, H) {
  return { x: (x - cam.x) * cam.z + vcx, y: (y - cam.y) * cam.z + H / 2 };
}

function pinChip(ts, tw, ch, top, floor) {
  const cx = clamp(ts.x, tw / 2 + 16, W - tw / 2 - 16);
  const wantY = ts.y - ch * 0.65;
  const cy = clamp(wantY, top + ch / 2, floor - 48 - 8 - ch / 2 - 8);
  return { x: cx - tw / 2, y: cy - ch / 2, w: tw, h: ch };
}

function leftoverChip(tw, ch, top, floor) {
  const cx = clamp(W / 2, tw / 2 + 16, W - tw / 2 - 16);
  const cy = clamp(top + ch / 2 + 8, top + ch / 2, floor - 48 - 8 - ch / 2 - 8);
  return { x: cx - tw / 2, y: cy - ch / 2, w: tw, h: ch };
}

// 390 leftover camera: tank tops sit in the HUD band, Goldfish under
// W/2, unlocked Clownfish (bag fish) on the left. Stage is 1280 wide
// (same as game.js); z=1 matches the planted 210-wide bowls.
const H390 = 720;
const vcx = W * 0.5;
const cam = { x: TANK_POS[2].x + TANK_W / 2, y: 360, z: 1 };
const clown = TANK_POS[0];
const gold = TANK_POS[2];
const clownTs = worldToScreen(clown.x + TANK_W / 2, clown.y + TANK_H * 0.42, cam, vcx, H390);
const goldCenter = worldToScreen(gold.x + TANK_W / 2, gold.y + TANK_H * 0.42, cam, vcx, H390);
const goldBox = {
  x: worldToScreen(gold.x, gold.y, cam, vcx, H390).x,
  y: worldToScreen(gold.x, gold.y, cam, vcx, H390).y,
  w: TANK_W * cam.z,
  h: TANK_H * cam.z,
};
const clownBox = {
  x: worldToScreen(clown.x, clown.y, cam, vcx, H390).x,
  y: worldToScreen(clown.x, clown.y, cam, vcx, H390).y,
  w: TANK_W * cam.z,
  h: TANK_H * cam.z,
};
const top = 120;
const floor = H390 - 80;
const tw = Math.min(360, stockCap);
const old390 = leftoverChip(tw, stockH, top, floor);
const pin390 = pinChip(clownTs, tw, stockH, top, floor);
const oldCx = old390.x + old390.w / 2;
const pinCx = pin390.x + pin390.w / 2;

assert(Math.abs(oldCx - W / 2) < 2,
  "the leftover board parks at W/2");
assert(Math.abs(W / 2 - goldCenter.x) < Math.abs(W / 2 - clownTs.x),
  "W/2 is the Goldfish column on the leftover 390 tank row");
assert(boxesOverlap(old390, goldBox, 8),
  "the leftover W/2 board covers locked Goldfish on a 390 tank row");
assert(!boxesOverlap(pin390, goldBox, 0),
  "tank-local board does not cover locked Goldfish");
assert(Math.abs(pinCx - clownTs.x) < Math.abs(pinCx - goldCenter.x),
  "tank-local board is on Clownfish, not Goldfish");
assert(boxesOverlap(pin390, { x: clownBox.x, y: pin390.y, w: clownBox.w, h: pin390.h }, 24),
  "tank-local board sits over the Clownfish column");
assert(clownTs.x < goldBox.x,
  "Clownfish stays left of Goldfish on the 390 leftover camera");

const deskH = 720;
const deskCam = { x: 880, y: 420, z: 1 };
const deskTs = worldToScreen(clown.x + TANK_W / 2, clown.y + TANK_H * 0.42, deskCam, 640, deskH);
const deskGold = {
  x: worldToScreen(gold.x, gold.y, deskCam, 640, deskH).x,
  y: worldToScreen(gold.x, gold.y, deskCam, 640, deskH).y,
  w: TANK_W,
  h: TANK_H,
};
const oldDesk = leftoverChip(220, 32, 28, deskH);
const pinDesk = pinChip(deskTs, 220, 32, 28, deskH);
assert(Math.abs((oldDesk.x + oldDesk.w / 2) - W / 2) < 2,
  "old desktop path sat at screen-center");
assert(Math.abs((pinDesk.x + pinDesk.w / 2) - deskTs.x) < 2,
  "desktop 16:9 board sits on the glowing tank, not W/2");
assert(!boxesOverlap(pinDesk, deskGold, 0),
  "desktop tank-local board does not cover locked Goldfish");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(clamp(10, 0, 8) === 8, "clamp helper stays available");

console.log("c100 pin tap-to-stock to the glowing tank: ok");
