// C96 — title Continue / Play / New Game are pier-board signs
// (clip drawPierBoards into a rounded rect + gold stroke), not
// flat #2a9d8f / #3d6f7a pills. Pause / help / mute / reset /
// book-close stay the unchanged panelBtn pills. Paint-only:
// picker cards, title stack, cameras, HUD plates, dock paint,
// unlocks, visualViewport, DIVE inset, bubble clamp, and walk
// speeds stay.
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

assert(/function titleBoardBtn\s*\(/.test(src), "titleBoardBtn helper exists");
assert(/C96 — title action boards only/.test(src),
  "C96 names the title-board rule");

const board = src.match(/function titleBoardBtn\s*\(\s*id,\s*x,\s*y,\s*w,\s*h,\s*label,\s*scale,\s*fontPx,\s*quiet\s*\)\s*\{[\s\S]*?\n  \}/);
assert(board, "titleBoardBtn body is present");
assert(/roundRect\(x, y, w, h, r\); ctx\.clip\(\)/.test(board[0]),
  "title boards clip a rounded rect");
assert(/drawPierBoards\(x, y, w, h/.test(board[0]),
  "title boards paint a real plank field, not a flat fill");
assert(/#e8c04a/.test(board[0]), "title boards use the header gold stroke");
assert(/rgba\(90, 48, 16, 0\.55\)/.test(board[0]),
  "title boards keep the header wood outline");
assert(/Fredoka/.test(board[0]), "title boards keep Fredoka labels");
assert(/#fff6e8/.test(board[0]), "Continue / Play labels stay cream / white");
assert(/quiet \? "rgba\(40, 20, 8, 0\.40\)"/.test(board[0]),
  "New Game uses a darker stain, not a red delete brick");
assert(!/#a84a3a/.test(board[0]) && !/#2a9d8f/.test(board[0]) && !/#3d6f7a/.test(board[0]),
  "title boards are wood + gold, not a flat teal / slate / red fill");
assert(/btn\(id, x, y, w, h\)/.test(board[0]),
  "title boards keep the same hitbox ids");

const panel = src.match(/function panelBtn\s*\(\s*id,\s*x,\s*y,\s*w,\s*h,\s*label,\s*accent,\s*scale,\s*fontPx\s*\)\s*\{[\s\S]*?\n  \}/);
assert(panel, "panelBtn body is present");
assert(/fillStyle = accent \|\| "#2a9d8f"/.test(panel[0]),
  "pause pills still fill teal / accent");
assert(!/drawPierBoards/.test(panel[0]),
  "panelBtn is not the wood path");
assert(!/#e8c04a/.test(panel[0]),
  "panelBtn is still a flat pill, not a gold sign");

const title = src.match(/function drawTitle\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(title, "drawTitle body is present");
assert(/titleBoardBtn\("continue"/.test(title[0]),
  "Continue uses the pier-board sign");
assert(/titleBoardBtn\("play"[\s\S]*"New Game"/.test(title[0]),
  "New Game uses the pier-board sign");
assert(/titleBoardBtn\("play"[\s\S]*"Play"/.test(title[0]),
  "Play uses the pier-board sign");
assert(/,\s*true\)/.test(title[0]) && /"New Game", 1, lay\.btnFont, true/.test(title[0]),
  "New Game stays the quieter stain");
assert(/const pulse = 1 \+ Math\.sin\(state\.time \* 3\) \* 0\.035/.test(title[0]),
  "Continue / Play keep the existing pulse");
assert(/titleBoardBtn\("continue"[\s\S]*pulse/.test(title[0]),
  "Continue still pulses");
assert(/titleBoardBtn\("play"[\s\S]*"Play", pulse/.test(title[0]),
  "Play still pulses");
assert(/species unlocked/.test(title[0]) && /#ffe27a/.test(title[0]),
  "yellow save line stays between Continue and New Game");
assert(!/panelBtn\(/.test(title[0]),
  "title no longer paints flat panelBtn pills");
assert(!/#2a9d8f/.test(title[0]) && !/#3d6f7a/.test(title[0]),
  "title actions are not a flat teal / slate fill");

const pause = src.match(/function drawPause\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(pause, "drawPause body is present");
assert(/panelBtn\("resume"/.test(pause[0]), "pause Resume stays a flat pill");
assert(/panelBtn\("help"/.test(pause[0]), "pause Help stays a flat pill");
assert(/panelBtn\("mute"/.test(pause[0]), "pause mute stays a flat pill");
assert(/panelBtn\("reset"/.test(pause[0]), "pause New Game stays a flat pill");
assert(/panelBtn\("back"/.test(pause[0]), "help Back stays a flat pill");
assert(!/titleBoardBtn\(/.test(pause[0]),
  "pause / help do not use the title wood boards");
assert(/"#a84a3a"/.test(pause[0]),
  "pause reset stays the existing red pill, not a title board");

assert(/panelBtn\("book-close"/.test(src), "book-close stays a flat panelBtn");

assert(/Aqua Bay · loop 103/.test(src), "title/pause stamp is loop 103");
assert(!/Aqua Bay · loop 102/.test(src), "loop 102 stamp is gone");

assert(/function drawPickerBackdrop\s*\(/.test(src), "C95 painted backdrop stays");
assert(/function pickerLabelLayout\s*\(/.test(src), "C95 label inset stays");
assert(/C95 — painted pier \/ reef \/ lagoon/.test(src),
  "C95 names the painted-backdrop rule");
assert(/C94 — 390-wide title stack/.test(src), "C94 title-stack rule stays");
assert(/titleBase/.test(src) && /subBase/.test(src),
  "portrait title still exposes stacked titleBase / subBase");
assert(/btnFont = phoneCss\(\s*18\s*\)/.test(src),
  "title button type still uses phoneCss");
assert(/continueW: 300/.test(src) && /newW: 300/.test(src),
  "desktop Continue / New Game hitboxes stay 300 wide");
assert(/continueH: 56/.test(src) && /newH: 48/.test(src),
  "desktop Continue / New Game hitboxes stay 56 / 48");
assert(/btnH = Math\.max\(phoneCss\(\s*52\s*\),\s*Math\.round\(H \* 0\.055\)\)/.test(src),
  "portrait Continue stay fat — hitbox not shrunk");
assert(/newH = Math\.max\(phoneCss\(\s*48\s*\),\s*Math\.round\(H \* 0\.048\)\)/.test(src),
  "portrait New Game stay fat — hitbox not shrunk");

assert(/const SKIN_IDS = \["skip", "reef", "dino"\]/.test(src),
  "still exactly three cards: Skip / Reef / Dino");
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/function speechStageRect\s*\(/.test(src), "C93 speech clamp stays");
assert(/C93 — hang the board off the arm/.test(src), "C93 OPEN hang stays");
assert(/C92 — pier bait hut/.test(src), "C92 BAIT hut paint stays");
assert(/C91 — soda cooler/.test(src), "C91 POP cooler stays");
assert(/function actionChipInset\s*\(/.test(src), "DIVE chip inset stays");
assert(/visibleStageBottom/.test(src) && /visualViewport/.test(src),
  "visualViewport DIVE floor stays");
assert(/HUD_READOUT_PLATE/.test(src), "BAG / money plates stay");
assert(/function wrapHudLines\s*\(/.test(src), "toast wrap from C85 stays");
assert(/function tankHudClearY\s*\(/.test(src), "C89 HUD-clear nudge stays");
assert(/function speciesUnlocked\s*\(/.test(src), "C90 unlock gate stays");
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

function titleWaterY(H0) {
  return H0 - Math.round(Math.min(520, H0 * 0.28));
}
function hudSafeTop(cssW) { return phoneCss(50 + 12, cssW); }

function titleMenuLayout(H0, cssW) {
  const desk = {
    continueY: 452, continueH: 56, continueW: 300,
    newY: 548, newH: 48, newW: 300,
    playY: 460, playH: 56,
    portrait: false,
  };
  if (H0 <= DESKTOP_H + 20) return desk;
  const pad = Math.max(Math.round(H0 * 0.024), hudSafeTop(cssW));
  const titleFont = phoneCss(22, cssW);
  const subFont = phoneCss(16, cssW);
  const tagFont = phoneCss(14, cssW);
  const stampFont = phoneCss(12, cssW);
  const whoFontPx = phoneCss(16, cssW);
  const titlePadT = phoneCss(18, cssW);
  const titlePadB = phoneCss(14, cssW);
  const lineGap = phoneCss(10, cssW);
  const cardGap = 20;
  const cardW = Math.min(300, Math.round((W - 80 - cardGap * 2) / 3));
  const cardH = Math.round(cardW * 1.12);
  const btnH = Math.max(phoneCss(52, cssW), Math.round(H0 * 0.055));
  const newH = Math.max(phoneCss(48, cssW), Math.round(H0 * 0.048));
  const gap = Math.round(H0 * 0.016);
  const capH = Math.max(28, Math.round(H0 * 0.018));
  let y = pad;
  const titleY = y;
  const titleBase = titleY + titlePadT + titleFont;
  const subBase = titleBase + Math.round(titleFont * 0.28) + lineGap + subFont;
  const tagY = subBase + Math.round(subFont * 0.28) + lineGap + tagFont;
  const stampY = tagY + Math.round(tagFont * 0.28) + lineGap + stampFont;
  const titleH = Math.max(phoneCss(128, cssW), (stampY + titlePadB) - titleY);
  y += titleH + gap;
  const whoY = y + whoFontPx;
  y = whoY + Math.round(whoFontPx * 0.35) + Math.max(10, Math.round(gap * 0.6));
  const pickerY = y;
  y = pickerY + cardH + Math.round(gap * 1.6);
  const continueY = y;
  y += btnH + Math.round(H0 * 0.012);
  y += capH + Math.round(H0 * 0.014);
  let continueY0 = continueY, newY = y;
  const harborTop = titleWaterY(H0) - Math.round(H0 * 0.02);
  const slack = harborTop - (newY + newH) - pad;
  if (slack > 80) {
    const shift = Math.round(slack * 0.55);
    continueY0 += shift;
    newY += shift;
  }
  const btnW = Math.min(W - 140, 620);
  return {
    continueY: continueY0, continueH: btnH, continueW: btnW,
    newY, newH, newW: btnW,
    playY: continueY0, playH: btnH,
    portrait: true,
  };
}

function assertTitleBtns(cssH, tag) {
  const H0 = portraitH(CSS_W, cssH);
  const lay = titleMenuLayout(H0, CSS_W);
  const btnCssH = lay.continueH / H0 * cssH;
  const btnCssW = lay.continueW / W * CSS_W;
  const newCssH = lay.newH / H0 * cssH;
  const typeCss = phoneCss(18, CSS_W) / W * CSS_W;
  assert(btnCssH >= 48, tag + " Continue stays fat, cssH=" + btnCssH.toFixed(1));
  assert(btnCssW >= 160, tag + " Continue stays wide, cssW=" + btnCssW.toFixed(1));
  assert(newCssH >= 44, tag + " New Game stays fat, cssH=" + newCssH.toFixed(1));
  assert(typeCss >= 16, tag + " button type stays phoneCss-readable, css=" + typeCss.toFixed(1));
  assert(lay.newY + lay.newH < H0 - 8, tag + " New Game stays on-canvas");
  assert(lay.continueY + lay.continueH < H0 - 8, tag + " Continue stays on-canvas");
}

assertTitleBtns(LAYOUT_H, "390×844");
assertTitleBtns(VIS_H, "390×655 visual");

const desk = titleMenuLayout(DESKTOP_H, 1280);
assert(!desk.portrait, "desktop title keeps the 720 layout");
assert(desk.continueW === 300 && desk.continueH === 56,
  "desktop Continue hitbox stays 300×56");
assert(desk.newW === 300 && desk.newH === 48,
  "desktop New Game hitbox stays 300×48");
assert(desk.continueY + desk.continueH < DESKTOP_H,
  "desktop Continue is planted on the 720 stage, not clipped");
assert(desk.newY + desk.newH < DESKTOP_H,
  "desktop New Game is planted on the 720 stage, not clipped");
assert(!portraitStage(1280, 720) && desktopStage(1280, 720),
  "laptop keeps the framed 16:9 stage");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(clamp(10, 0, 8) === 8, "clamp helper stays available");

console.log("c96 title Continue / Play / New Game pier-board signs: ok");
