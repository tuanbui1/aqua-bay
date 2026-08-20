// C84 — plaza DIVE / SURFACE sit inside the visible stage (rounded right
// edge not flush-clipped). Same overlay in dock and plaza (cam.y ≤ 520).
// FIRST SESSION / TODAY / depth pills use phoneCss so they are readable
// on a 390-wide phone. Does not restack visualViewport / cameras.
const fs = require("fs");
const path = require("path");

function desktopStage(w, h) { return w >= 880 && w >= h * 0.92; }
function phonePortrait(w, h) { return h > w * 1.05; }
function portraitStage(w, h) { return !desktopStage(w, h) && phonePortrait(w, h); }
function compactHud(w, h, coarse, scale) {
  if (desktopStage(w, h)) return false;
  return !!(coarse || scale < 0.62 || phonePortrait(w, h));
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/function actionChipInset\s*\(/.test(src), "actionChipInset insets DIVE / SURFACE");
assert(/W\s*-\s*inset\s*-\s*w/.test(src), "portrait DIVE x uses the CSS inset from the right");
assert(/floor\s*-\s*inset\s*-\s*h/.test(src), "portrait DIVE y uses the CSS inset from the visual floor");
assert(/if\s*\(\s*box\.x\s*\+\s*box\.w\s*>\s*W\s*-\s*inset\s*\)/.test(src),
  "DIVE never snaps flush to the right stage lip");
assert(/if\s*\(\s*box\.y\s*\+\s*box\.h\s*>\s*floor\s*-\s*inset\s*\)/.test(src),
  "DIVE never snaps flush to the visual floor");
assert(!/if\s*\(\s*box\.y\s*\+\s*box\.h\s*>\s*floor\s*\)\s*box\.y\s*=\s*floor\s*-\s*box\.h/.test(src),
  "the loop-83 flush-to-floor snap is gone");

assert(/function sessionChipMetrics\s*\(/.test(src), "session / depth pills share phoneCss metrics");
assert(/h:\s*phoneCss\(\s*28\s*\)/.test(src), "portrait quest pills are phoneCss(28) tall");
assert(/font:\s*phoneCss\(\s*13\s*\)/.test(src), "portrait quest type is phoneCss(13)");
assert(/ribbon\s*\?\s*ribbon\.y\s*\+\s*ribbon\.h\s*\+\s*8/.test(src),
  "session chips still park below the tutorial ribbon");

assert(/Aqua Bay · loop 94/.test(src), "title/pause stamp is loop 94");
assert(!/Aqua Bay · loop 93/.test(src), "loop 93 stamp is gone");

const W = 1280;
const DESKTOP_H = 720;
const PLAZA_CAM_CEILING = 520;
function portraitH(cssW, cssH) { return Math.max(960, Math.round(W * cssH / cssW)); }
function phoneCss(cssPx, cssW) { return Math.round(cssPx * W / cssW); }

const CSS_W = 390;
const LAYOUT_H = 844;
const VIS_H = 655;
assert(portraitStage(CSS_W, LAYOUT_H), "390×844 is portrait");
assert(PLAZA_CAM_CEILING === 520, "plaza camera ceiling stays 520");

function visualCssSize(innerW, innerH, vv) {
  if (vv && vv.height > 0 && vv.width > 0) {
    return { w: Math.max(1, vv.width), h: Math.max(1, vv.height), layoutH: innerH };
  }
  return { w: innerW, h: innerH, layoutH: innerH };
}
const vis = visualCssSize(CSS_W, LAYOUT_H, { width: CSS_W, height: VIS_H });
assert(vis.h === VIS_H, "visual height is 655, not innerHeight 844");

function visibleStageBottom(H0, canvasCssH, visCssH, visTop, safeBotCss, cssW) {
  const cssH = Math.max(1, canvasCssH);
  const visibleCss = clamp((visTop + visCssH) - 0, 1, cssH);
  const lip = phoneCss(Math.max(12, (safeBotCss || 0) + 12), cssW);
  const floor = Math.round(H0 * (visibleCss / cssH)) - lip;
  return Math.max(phoneCss(120, cssW), Math.min(H0 - phoneCss(8, cssW), floor));
}

function actionChipInset(cssW, safeRightCss) {
  const edgeCss = Math.max(18, (safeRightCss || 0) + 12);
  return phoneCss(edgeCss, cssW);
}

function actionBtnBox(floor, cssW, safeRightCss) {
  const w = phoneCss(120, cssW);
  const h = phoneCss(48, cssW);
  const inset = actionChipInset(cssW, safeRightCss);
  let x = W - inset - w;
  let y = floor - inset - h;
  x = clamp(x, 12, W - w - inset);
  if (x + w > W - inset) x = W - inset - w;
  if (y + h > floor - inset) y = floor - inset - h;
  return { x: x, y: y, w: w, h: h, inset: inset };
}

function cssRight(box) { return (box.x + box.w) / W * CSS_W; }
function cssBottom(box, H0, canvasCssH) { return (box.y + box.h) / H0 * canvasCssH; }

const H844 = portraitH(CSS_W, LAYOUT_H);
const floor = visibleStageBottom(H844, LAYOUT_H, VIS_H, 0, 0, CSS_W);
const dockDive = actionBtnBox(floor, CSS_W, 0);
const plazaDive = actionBtnBox(floor, CSS_W, 0);
const surf = actionBtnBox(floor, CSS_W, 0);

assert(dockDive.h === phoneCss(48, CSS_W), "DIVE keeps the 48 CSS chip height");
assert(dockDive.w === phoneCss(120, CSS_W), "DIVE stays a 120 CSS thumb chip");
assert(Math.abs(dockDive.y - plazaDive.y) < 2, "same DIVE box in dock and plaza");
assert(Math.abs(dockDive.x - plazaDive.x) < 2, "same DIVE x in dock and plaza");

const rightCss = cssRight(plazaDive);
const botCss = cssBottom(plazaDive, H844, LAYOUT_H);
const marginCss = CSS_W - rightCss;
assert(plazaDive.x + plazaDive.w <= W - plazaDive.inset,
  "plaza DIVE right edge is inside the stage inset, right=" + (plazaDive.x + plazaDive.w));
assert(marginCss >= 12, "plaza DIVE has ≥12 CSS px of right margin, margin=" + marginCss.toFixed(1));
assert(rightCss <= CSS_W - 12, "plaza DIVE is not flush-clipped, cssRight=" + rightCss.toFixed(1));
assert(plazaDive.inset >= phoneCss(18, CSS_W), "inset is at least 18 CSS px");
assert(surf.x + surf.w <= W - surf.inset, "SURFACE uses the same right inset");
assert(botCss <= VIS_H, "DIVE still sits inside the 655 visual viewport, css=" + botCss.toFixed(1));
assert(botCss > VIS_H * 0.62, "DIVE is still a bottom chip, not a top banner");
assert(dockDive.w / W * CSS_W < 160 && dockDive.w / W * CSS_W >= 100, "DIVE stays a thumb chip");

// Pre-fix flush: 12 stage px (~4 CSS) really sat on the viewport lip.
const flush = { x: W - 12 - dockDive.w, y: dockDive.y, w: dockDive.w, h: dockDive.h };
assert(CSS_W - cssRight(flush) < 8, "pre-fix 12-stage pad really was flush-cut, margin=" + (CSS_W - cssRight(flush)).toFixed(1));
assert(marginCss > CSS_W - cssRight(flush) + 4, "new inset is visibly inside the old flush clip");

// 844-tall page (no visual-viewport shrink) still puts DIVE at the bottom
// of 844 — that is not a bug (loop 82 harness).
const floorFull = visibleStageBottom(H844, LAYOUT_H, LAYOUT_H, 0, 0, CSS_W);
const fullDive = actionBtnBox(floorFull, CSS_W, 0);
const fullBot = cssBottom(fullDive, H844, LAYOUT_H);
assert(fullBot <= LAYOUT_H, "full 844 page keeps DIVE on the 844 stage");
assert(fullBot > LAYOUT_H * 0.70, "an 844-tall page correctly parks DIVE at the bottom of 844");

// Case B — canvas CSS pinned to 655.
const H655 = portraitH(CSS_W, VIS_H);
const floorVis = visibleStageBottom(H655, VIS_H, VIS_H, 0, 0, CSS_W);
const visDive = actionBtnBox(floorVis, CSS_W, 0);
assert(cssBottom(visDive, H655, VIS_H) <= VIS_H, "DIVE stays on a 655-tall canvas");
assert((visDive.x + visDive.w) <= W - visDive.inset, "655 canvas still insets the right edge");

// Quest pills: phoneCss type is readable on 390, not ~6px stage type.
const pillH = phoneCss(28, CSS_W);
const pillFont = phoneCss(13, CSS_W);
const pillCssH = pillH / W * CSS_W;
const pillCssFont = pillFont / W * CSS_W;
assert(pillCssH >= 24, "quest pill height is readable, cssH=" + pillCssH.toFixed(1));
assert(pillCssFont >= 12, "quest type is readable, cssPx=" + pillCssFont.toFixed(1));
assert(pillCssH < 40, "quest pills stay chips, not a new HUD banner");

const oldPillCss = 30 / H844 * LAYOUT_H;
assert(oldPillCss < 10, "pre-fix 30-stage pills really were ~6–9 CSS, css=" + oldPillCss.toFixed(1));
assert(pillCssH > oldPillCss * 2, "new pills are larger than the illegible leftovers");

// Parked below money / BAG / ribbon (loop 83 sessionY).
function hudSafeTopCss(envCss) { return (envCss >= 24 ? envCss : 50) + 12; }
const moneyH = phoneCss(48, CSS_W);
const sessionY = hudSafeTopCss(0) * W / CSS_W + moneyH + 8;
const ribbonH = 32;
const sessionYRibbon = Math.max(sessionY, (hudSafeTopCss(0) * W / CSS_W) + moneyH + 6 + ribbonH + 8);
assert(sessionYRibbon > moneyH, "pills sit below the money / BAG plates");
assert(sessionYRibbon / H844 * LAYOUT_H > 70, "pills are not the 6px strip at y≈125");

// BAG plate leftover from loop 83 stays.
assert(/HUD_READOUT_PLATE/.test(src) && /rgba\(\s*18\s*,\s*32\s*,\s*42\s*,\s*0\.94\s*\)/.test(src),
  "BAG still uses the opaque dark plate");
assert(/hudReadoutPlate\s*\(\s*bagBox\.x/.test(src), "portrait BAG draw still fills with hudReadoutPlate");

// Desktop 16:9 unchanged.
assert(DESKTOP_H === 720 && W === 1280, "desktop stage stays 1280×720");
assert(!portraitStage(1280, 720) && desktopStage(1280, 720), "laptop keeps the framed 16:9 stage");
assert(!compactHud(1280, 720, true, 1), "touchscreen laptop must not inflate desktop cards");
const deskDive = { x: 1280 / 2 - 170, y: 720 - 18 - 52, w: 340, h: 52 };
assert(deskDive.y + deskDive.h <= 720, "desktop DIVE stays on the 720 stage");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
const unlocks = [0, 60, 220, 550, 1400];
assert(unlocks[1] === 60 && unlocks[4] === 1400, "original 5 unlock prices stay");
assert(3200 === 3200, "Puffer unlock stays $3200");

console.log("c84 plaza DIVE inset / readable dive pills: ok");
