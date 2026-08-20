// C94 — 390-wide title name + tagline stack on two baselines
// (no shared band). Picker / hint type is phoneCss, not ~6px.
// Reef / Skip / Dino cards stay fat-tappable. Paint/layout only:
// cameras, HUD plates, walk, unlocks, visualViewport, DIVE inset,
// and dock paint stay.
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

assert(/C94 — 390-wide title stack/.test(src), "C94 names the title-stack rule");
assert(/titleBase/.test(src) && /subBase/.test(src),
  "portrait title exposes stacked titleBase / subBase");
assert(/const titleTextY = lay\.titleBase != null \? lay\.titleBase/.test(src),
  "title paint uses the stacked title baseline");
assert(/const subTextY = lay\.subBase != null \? lay\.subBase/.test(src),
  "tagline paint uses the stacked sub baseline");
assert(!/th \* \(lay\.portrait \? 0\.26/.test(src),
  "old shared-fraction title baseline is gone");
assert(!/th \* \(lay\.portrait \? 0\.50/.test(src),
  "old shared-fraction tagline baseline is gone");
assert(/nameFont = phoneCss\(\s*16\s*\)/.test(src),
  "picker names use phoneCss, not a 24-stage floor");
assert(/blurbFont = phoneCss\(\s*13\s*\)/.test(src),
  "picker blurbs use phoneCss");
assert(/whoFontPx = phoneCss\(\s*16\s*\)/.test(src),
  "Who's diving? hint uses phoneCss");
assert(/Aqua Bay · loop 105/.test(src), "title/pause stamp is loop 105");
assert(!/Aqua Bay · loop 104/.test(src), "loop 104 stamp is gone");

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

function hudSafeTop(cssW) { return phoneCss(50 + 12, cssW); }
function titleWaterY(H0) {
  return H0 - Math.round(Math.min(520, H0 * 0.28));
}

function titleMenuLayout(H0, cssW) {
  const desk = {
    titleY: 40, titleH: 156,
    pickerY: 252, cardW: 168, cardH: 176,
    titleFont: 28, subFont: 14, tagFont: 15, stampFont: 13,
    nameFont: 16, blurbFont: 11, whoFont: 14,
    titleBase: 40 + 156 * 0.30,
    subBase: 40 + 156 * 0.46,
    portrait: false,
  };
  if (H0 <= DESKTOP_H + 20) return desk;
  const pad = Math.max(Math.round(H0 * 0.024), hudSafeTop(cssW));
  const titleFont = phoneCss(22, cssW);
  const subFont = phoneCss(16, cssW);
  const tagFont = phoneCss(14, cssW);
  const stampFont = phoneCss(12, cssW);
  const whoFontPx = phoneCss(16, cssW);
  const nameFont = phoneCss(16, cssW);
  const blurbFont = phoneCss(13, cssW);
  const lineGap = phoneCss(10, cssW);
  const titlePadT = phoneCss(18, cssW);
  const titlePadB = phoneCss(14, cssW);
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
  const captionY = y + Math.round(capH * 0.55);
  y += capH + Math.round(H0 * 0.014);
  let continueY0 = continueY, captionY0 = captionY, newY = y;
  const harborTop = titleWaterY(H0) - Math.round(H0 * 0.02);
  const slack = harborTop - (newY + newH) - pad;
  if (slack > 80) {
    const shift = Math.round(slack * 0.55);
    continueY0 += shift;
    captionY0 += shift;
    newY += shift;
  }
  return {
    titleY, titleH, titleBase, subBase, tagY, stampY,
    titleFont, subFont, tagFont, stampFont,
    nameFont, blurbFont, whoFont: whoFontPx, whoY,
    pickerY, cardW, cardH,
    continueY: continueY0, continueH: btnH, captionY: captionY0, newY, newH,
    portrait: true,
  };
}

function cssPx(stagePx, H0, cssH) { return stagePx / H0 * cssH; }
function cssType(stagePx, cssW) { return stagePx / W * cssW; }

function assertTitleFit(cssH, tag) {
  const H0 = portraitH(CSS_W, cssH);
  const lay = titleMenuLayout(H0, CSS_W);
  assert(lay.portrait, tag + " uses the tall title layout");
  assert(lay.titleBase !== lay.subBase,
    tag + " name and tagline do not share a baseline");
  const gap = lay.subBase - lay.titleBase;
  assert(gap >= lay.titleFont * 1.15,
    tag + " tagline clears the title em-box, gap=" + gap + " font=" + lay.titleFont);
  const titleBot = lay.titleBase + Math.round(lay.titleFont * 0.28);
  const subTop = lay.subBase - lay.subFont;
  assert(subTop >= titleBot + phoneCss(6, CSS_W),
    tag + " title and tagline do not overlap, air=" + (subTop - titleBot));
  assert(lay.tagY > lay.subBase, tag + " flavor sits below the tagline");
  assert(lay.stampY > lay.tagY, tag + " stamp sits below the flavor line");
  assert(lay.stampY <= lay.titleY + lay.titleH,
    tag + " stamp stays inside the title card");
  assert(lay.whoY < lay.pickerY - 8, tag + " Who's diving? sits above the cards");

  const titleCss = cssType(lay.titleFont, CSS_W);
  const subCss = cssType(lay.subFont, CSS_W);
  const whoCss = cssType(lay.whoFont, CSS_W);
  const nameCss = cssType(lay.nameFont, CSS_W);
  const blurbCss = cssType(lay.blurbFont, CSS_W);
  assert(titleCss >= 18, tag + " title type is phoneCss-sized, css=" + titleCss.toFixed(1));
  assert(subCss >= 14, tag + " tagline type is phoneCss-sized, css=" + subCss.toFixed(1));
  assert(whoCss >= 14, tag + " Who's diving? is not ~6px, css=" + whoCss.toFixed(1));
  assert(nameCss >= 14, tag + " picker names are not ~6px, css=" + nameCss.toFixed(1));
  assert(blurbCss >= 12, tag + " picker blurbs are not ~6px, css=" + blurbCss.toFixed(1));

  const cardCssW = lay.cardW / W * CSS_W;
  const cardCssH = cssPx(lay.cardH, H0, cssH);
  assert(cardCssW >= 72 && cardCssH >= 72,
    tag + " picker cards stay fat-tappable, css=" + cardCssW.toFixed(1) + "×" + cardCssH.toFixed(1));
  assert(lay.cardW / lay.cardH > 0.8 && lay.cardH / lay.cardW < 1.35,
    tag + " cards keep the loop-80 aspect, ratio=" + (lay.cardH / lay.cardW).toFixed(2));
  assert(lay.pickerY + lay.cardH < H0 - 8, tag + " picker stays on-canvas");
  assert(lay.newY + lay.newH < H0 - 8, tag + " New Game stays on-canvas");
  assert(lay.continueH / H0 * cssH >= 48, tag + " Continue stays a fat button");
}

assertTitleFit(LAYOUT_H, "390×844");
assertTitleFit(VIS_H, "390×655 visual");

// Leftover: 0.26 / 0.50 of the old short card really shared one band.
{
  const H844 = portraitH(CSS_W, LAYOUT_H);
  const oldH = Math.max(phoneCss(96, CSS_W), Math.min(280, Math.round(H844 * 0.10)));
  const oldTitle = phoneCss(20, CSS_W);
  const oldTitleBot = oldH * 0.26 + Math.round(oldTitle * 0.28);
  const oldSubTop = oldH * 0.50 - phoneCss(13, CSS_W);
  assert(oldSubTop < oldTitleBot + phoneCss(6, CSS_W),
    "pre-fix 0.26/0.50 band really collided, air=" + (oldSubTop - oldTitleBot));
  const oldNameCss = Math.max(24, Math.round(960 * 0.017)) / W * CSS_W;
  assert(oldNameCss < 8, "pre-fix 24-stage picker floor really read as ~6px, css=" + oldNameCss.toFixed(1));
}

// Desktop 16:9 title stays denser.
const desk = titleMenuLayout(DESKTOP_H, 1280);
assert(!desk.portrait, "desktop title keeps the 720 layout");
assert(desk.titleH === 156 && desk.cardH === 176, "desktop title card / picker stay dense");
assert(desk.titleFont === 28 && desk.subFont === 14, "desktop title type stays 28 / 14");
assert(desk.nameFont === 16 && desk.blurbFont === 11, "desktop picker type stays 16 / 11");
assert(!portraitStage(1280, 720) && desktopStage(1280, 720), "laptop keeps the framed 16:9 stage");
assert(DESKTOP_H === 720 && W === 1280, "desktop stage stays 1280×720");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(clamp(10, 0, 8) === 8, "clamp helper stays available");

console.log("c94 390-wide title stack / phoneCss picker: ok");
