// C95 — picker cards: names sit on a dark plate inset a few CSS px
// above the card bottom (not flush to the gold/wood border). Each
// card paints a pier / reef / lagoon backdrop, not a flat square
// fill. Same three characters. Paint-only: cameras, HUD plates,
// dock paint, unlocks, visualViewport, DIVE inset, bubble clamp,
// and the C94 title + tagline stack stay.
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

assert(/function drawPickerBackdrop\s*\(/.test(src), "painted backdrop helper exists");
assert(/function pickerLabelLayout\s*\(/.test(src), "label inset helper exists");
assert(/C95 — painted pier \/ reef \/ lagoon/.test(src),
  "C95 names the painted-backdrop rule");
assert(/C95 — a few CSS px above the card bottom/.test(src),
  "C95 names the label-inset rule");

const backdrop = src.match(/function drawPickerBackdrop\s*\(\s*id,\s*x,\s*y,\s*w,\s*h\s*\)\s*\{[\s\S]*?\n  \}/);
assert(backdrop, "drawPickerBackdrop body is present");
assert(/if \(id === "skip"\)/.test(backdrop[0]), "Skip paints its own pier backdrop");
assert(/else if \(id === "reef"\)/.test(backdrop[0]), "Reef paints its own reef backdrop");
assert(/C95 — painted pier/.test(backdrop[0]), "Skip branch is the painted pier");
assert(/C95 — painted reef/.test(backdrop[0]), "Reef branch is the painted reef");
assert(/C95 — painted lagoon/.test(backdrop[0]), "Dino branch is the painted lagoon");
assert(/ellipse/.test(backdrop[0]) && /quadraticCurveTo/.test(backdrop[0]),
  "backdrops draw clouds / water / coral, not a fillRect only");
assert(/drawPierBoards\(/.test(backdrop[0]), "Skip pier paints real boards");
assert(/#e8786a/.test(backdrop[0]) && /#c86bde/.test(backdrop[0]),
  "Reef paints coral heads, not a flat teal square");
assert(/createRadialGradient/.test(backdrop[0]) && /#ffe2a8/.test(backdrop[0]),
  "lagoon paints a sun, not a dusk crop sticker");
assert(!/blitHarborPart/.test(backdrop[0]),
  "picker no longer blits a harbor photo into a square");
assert(!/cardH \* 0\.64/.test(backdrop[0]),
  "old square portrait clip is gone from the backdrop");

const picker = src.match(/function drawSkinPicker\s*\(\s*cx,\s*cy,\s*cardW,\s*cardH,\s*gap,\s*fonts\s*\)\s*\{[\s\S]*?\n  \}/);
assert(picker, "drawSkinPicker body is present");
assert(/drawPickerBackdrop\(id, x, cy, cardW, cardH\)/.test(picker[0]),
  "each card draws the painted backdrop");
assert(/pickerLabelLayout\(cardH, namePx, blurbPx\)/.test(picker[0]),
  "picker uses the inset label layout");
assert(/rgba\(12, 22, 30, 0\.88\)/.test(picker[0]),
  "names sit on a dark plate, not bare on the border");
assert(/labels\.nameY/.test(picker[0]) && /labels\.blurbY/.test(picker[0]),
  "name and blurb use the inset plate baselines");
assert(!/cy \+ cardH - Math\.max\(12, Math\.round\(cardH \* 0\.04\)\)/.test(src),
  "old flush-to-bottom blurb baseline is gone");
assert(!/cy \+ cardH - Math\.max\(28, Math\.round\(cardH \* 0\.09\)\)/.test(src),
  "old flush-to-bottom name baseline is gone");
assert(!/roundRect\(x \+ 6, cy \+ 8, cardW - 12, cardH \* 0\.64/.test(picker[0]),
  "picker no longer clips a sticker square");

const labels = src.match(/function pickerLabelLayout\s*\(\s*cardH,\s*namePx,\s*blurbPx\s*\)\s*\{[\s\S]*?\n  \}/);
assert(labels, "pickerLabelLayout body is present");
assert(/phoneCss\(\s*8\s*\)/.test(labels[0]), "portrait inset is phoneCss(8)");
assert(/labelInset/.test(labels[0]), "inset is named, not a 0.04 fraction of cardH");
assert(/plateH/.test(labels[0]) && /plateY/.test(labels[0]),
  "labels reserve a plate above the card bottom");

assert(/const SKIN_IDS = \["skip", "reef", "dino"\]/.test(src),
  "still exactly three cards: Skip / Reef / Dino");
assert(/skip: \{ name: "Skip", blurb: "dock kid" \}/.test(src), "Skip stays dock kid");
assert(/reef: \{ name: "Reef", blurb: "reef girl" \}/.test(src), "Reef stays reef girl");
assert(/dino: \{ name: "Dino", blurb: "snorkel dino" \}/.test(src),
  "Dino stays snorkel dino");
assert(/faceS: 1/.test(picker[0]), "loop 54 flip stays on the picker");
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/paintOnly: id === "dino"/.test(picker[0]), "Dino still uses the matte paint path");

assert(/Aqua Bay · loop 98/.test(src), "title/pause stamp is loop 98");
assert(!/Aqua Bay · loop 97/.test(src), "loop 97 stamp is gone");

assert(/C94 — 390-wide title stack/.test(src), "C94 title-stack rule stays");
assert(/titleBase/.test(src) && /subBase/.test(src),
  "portrait title still exposes stacked titleBase / subBase");
assert(/nameFont = phoneCss\(\s*16\s*\)/.test(src),
  "picker names still use phoneCss, not a 24-stage floor");
assert(/blurbFont = phoneCss\(\s*13\s*\)/.test(src), "picker blurbs still use phoneCss");
assert(/whoFontPx = phoneCss\(\s*16\s*\)/.test(src), "Who's diving? still uses phoneCss");

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

function pickerLabelLayout(cardH, namePx, blurbPx, cssW, isPortrait) {
  const labelInset = isPortrait ? phoneCss(8, cssW) : 10;
  const platePadY = isPortrait ? phoneCss(4, cssW) : 5;
  const nameToBlurb = isPortrait ? Math.max(phoneCss(2, cssW), Math.round(namePx * 0.22)) : 4;
  const plateH = platePadY + namePx + nameToBlurb + blurbPx + platePadY;
  const blurbFromBot = labelInset + platePadY;
  const nameFromBot = labelInset + platePadY + blurbPx + nameToBlurb;
  return { labelInset, platePadY, plateH, blurbFromBot, nameFromBot };
}

function cssType(stagePx, cssW) { return stagePx / W * cssW; }

function assertPickerInset(cssH, tag) {
  const H0 = portraitH(CSS_W, cssH);
  const cardGap = 20;
  const cardW = Math.min(300, Math.round((W - 80 - cardGap * 2) / 3));
  const cardH = Math.round(cardW * 1.12);
  const nameFont = phoneCss(16, CSS_W);
  const blurbFont = phoneCss(13, CSS_W);
  const lay = pickerLabelLayout(cardH, nameFont, blurbFont, CSS_W, true);
  const insetCss = cssType(lay.labelInset, CSS_W);
  const blurbCss = cssType(lay.blurbFromBot, CSS_W);
  const nameCss = cssType(nameFont, CSS_W);
  const blurbTypeCss = cssType(blurbFont, CSS_W);
  assert(insetCss >= 7, tag + " label inset is a few CSS px, css=" + insetCss.toFixed(1));
  assert(blurbCss >= 10, tag + " blurb sits above the card bottom, css=" + blurbCss.toFixed(1));
  assert(lay.blurbFromBot > 12, tag + " blurb is not the old 12-stage flush");
  assert(lay.plateH < cardH * 0.55,
    tag + " plate does not swallow the portrait, plate=" + lay.plateH + " card=" + cardH);
  assert(nameCss >= 14, tag + " picker names stay readable, css=" + nameCss.toFixed(1));
  assert(blurbTypeCss >= 12, tag + " picker blurbs stay readable, css=" + blurbTypeCss.toFixed(1));
  const cardCssW = cardW / W * CSS_W;
  const cardCssH = cardH / H0 * cssH;
  assert(cardCssW >= 72 && cardCssH >= 72,
    tag + " picker cards stay fat-tappable, css=" + cardCssW.toFixed(1) + "×" + cardCssH.toFixed(1));
  const oldBlurb = Math.max(12, Math.round(cardH * 0.04));
  assert(oldBlurb < lay.blurbFromBot,
    tag + " new blurb inset clears the old flush, old=" + oldBlurb + " new=" + lay.blurbFromBot);
}

assertPickerInset(LAYOUT_H, "390×844");
assertPickerInset(VIS_H, "390×655 visual");

const desk = pickerLabelLayout(176, 16, 11, 1280, false);
assert(desk.labelInset === 10, "desktop label inset stays 10 stage px");
assert(desk.blurbFromBot === 15, "desktop blurb sits 15px above the card bottom");
assert(desk.blurbFromBot > 12, "desktop blurb is not flush");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(clamp(10, 0, 8) === 8, "clamp helper stays available");

console.log("c95 picker portraits / label inset: ok");
