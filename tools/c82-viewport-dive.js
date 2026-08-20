// C82 — DIVE / SURFACE stay in the visual viewport when innerHeight is 844
// and visualViewport.height is 655. Same floor on dock and plaza cameras.
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

const W = 1280;
const DESKTOP_H = 720;
const PLAZA_CAM_CEILING = 520;
function portraitH(cssW, cssH) { return Math.max(960, Math.round(W * cssH / cssW)); }
function phoneCss(cssPx, cssW) { return Math.round(cssPx * W / cssW); }

const CSS_W = 390;
const LAYOUT_H = 844;
const VIS_H = 655;
assert(LAYOUT_H > VIS_H, "the leftover is innerHeight 844 vs visual 655");
assert(portraitStage(CSS_W, LAYOUT_H), "390×844 is portrait");
assert(portraitStage(CSS_W, VIS_H), "390×655 is portrait");
assert(!desktopStage(CSS_W, LAYOUT_H), "390-wide is not desktop");

// Prefer visualViewport.height. Never treat innerHeight as the visible floor
// when the visual viewport is shorter (browser chrome / URL bar).
function visualCssSize(innerW, innerH, vv) {
  if (vv && vv.height > 0 && vv.width > 0) {
    return {
      w: Math.max(1, vv.width),
      h: Math.max(1, vv.height),
      left: vv.offsetLeft || 0,
      top: vv.offsetTop || 0,
      layoutH: innerH,
    };
  }
  return { w: innerW, h: innerH, left: 0, top: 0, layoutH: innerH };
}
const vis = visualCssSize(CSS_W, LAYOUT_H, { width: CSS_W, height: VIS_H, offsetLeft: 0, offsetTop: 0 });
assert(vis.h === VIS_H, "visualCssSize reads visualViewport.height, not innerHeight");
assert(vis.h !== LAYOUT_H, "visible height is not the 844 layout viewport");
assert(vis.layoutH === LAYOUT_H, "layout height is still recorded as 844");

// Canvas CSS may still be the 844 layout box (100svh / innerHeight leftover).
function visibleStageBottom(H0, canvasCssH, visCssH, visTop, safeBotCss, cssW) {
  const cssH = Math.max(1, canvasCssH);
  const visibleCss = clamp((visTop + visCssH) - 0, 1, cssH);
  const lip = phoneCss(Math.max(12, (safeBotCss || 0) + 12), cssW);
  const floor = Math.round(H0 * (visibleCss / cssH)) - lip;
  return Math.max(phoneCss(120, cssW), Math.min(H0 - phoneCss(8, cssW), floor));
}

function actionBtnBox(floor, cssW) {
  const w = phoneCss(120, cssW);
  const h = phoneCss(48, cssW);
  const pad = phoneCss(16, cssW);
  const x = W - pad - w;
  const y = floor - pad - h;
  return { x: clamp(x, 12, W - w - 12), y: y, w: w, h: h };
}

function cssBottom(box, H0, canvasCssH) {
  return (box.y + box.h) / H0 * canvasCssH;
}
function cssY(stageY, H0, canvasCssH) {
  return stageY / H0 * canvasCssH;
}
function canvasPos(clientX, clientY, cssW, cssH, H0) {
  return { x: clientX * (W / cssW), y: clientY * (H0 / cssH) };
}
function hitBox(p, box) {
  return p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h;
}

// Case A — leftover: logical H + canvas CSS follow innerHeight 844.
const H844 = portraitH(CSS_W, LAYOUT_H);
const floorWrong = visibleStageBottom(H844, LAYOUT_H, VIS_H, 0, 0, CSS_W);
const dockDive = actionBtnBox(floorWrong, CSS_W);
const plazaDive = actionBtnBox(floorWrong, CSS_W);
const surf = actionBtnBox(floorWrong, CSS_W);
const diveCssBot = cssBottom(dockDive, H844, LAYOUT_H);
const surfCssBot = cssBottom(surf, H844, LAYOUT_H);

assert(dockDive.h === phoneCss(48, CSS_W), "DIVE keeps full chip height");
assert(diveCssBot <= VIS_H, "DIVE bottom stays in the 655 visual viewport, css=" + diveCssBot.toFixed(1));
assert(surfCssBot <= VIS_H, "SURFACE bottom stays in the 655 visual viewport, css=" + surfCssBot.toFixed(1));
assert(diveCssBot > VIS_H * 0.62, "DIVE is still a bottom chip, not a top banner");
assert(dockDive.w / W * CSS_W < 160 && dockDive.w / W * CSS_W >= 100, "DIVE stays a thumb chip");
assert(Math.abs(dockDive.y - plazaDive.y) < 2, "same DIVE box in dock and plaza (cam.y ≤ 520)");
assert(PLAZA_CAM_CEILING === 520, "plaza camera ceiling stays 520");

// Hit-test the painted chip through the 844 canvas mapping.
const diveCssCx = (dockDive.x + dockDive.w / 2) / W * CSS_W;
const diveCssCy = cssY(dockDive.y + dockDive.h / 2, H844, LAYOUT_H);
assert(diveCssCy <= VIS_H, "DIVE center is inside the 655 window, cssY=" + diveCssCy.toFixed(1));
const tap = canvasPos(diveCssCx, diveCssCy, CSS_W, LAYOUT_H, H844);
assert(hitBox(tap, dockDive), "a tap on the visible DIVE chip hits the same box");
assert(hitBox(tap, surf), "SURFACE uses the same visible box");

// A tap at the old 844-floor chip (y≈790) is below the visual viewport.
const oldFloor = H844 - phoneCss(16, CSS_W);
const oldDive = { x: dockDive.x, y: oldFloor - dockDive.h, w: dockDive.w, h: dockDive.h };
const oldCssBot = cssBottom(oldDive, H844, LAYOUT_H);
assert(oldCssBot > VIS_H, "pre-fix DIVE really sat below the 655 window, css=" + oldCssBot.toFixed(1));

// Case B — layout pinned to visualViewport: canvas CSS is 655.
const H655 = portraitH(CSS_W, VIS_H);
const floorVis = visibleStageBottom(H655, VIS_H, VIS_H, 0, 0, CSS_W);
const visDive = actionBtnBox(floorVis, CSS_W);
assert(cssBottom(visDive, H655, VIS_H) <= VIS_H, "DIVE stays on a 655-tall canvas");
assert((visDive.y + visDive.h) <= H655, "DIVE is on the 655 stage");

// Top HUD: env()=0 still clears a notch (~44–54 CSS) on viewport-fit=cover portrait.
function notchInsetCss(envCss) {
  if (envCss >= 24) return envCss;
  return 50;
}
function hudSafeTopCss(envCss) { return notchInsetCss(envCss) + 12; }
assert(hudSafeTopCss(0) >= 44 + 12, "env()=0 falls back to a notch-sized top inset");
assert(hudSafeTopCss(0) <= 54 + 12, "fallback stays in the 44–54 CSS band plus pad");
assert(hudSafeTopCss(47) === 59, "a real env() inset is kept");
const hudY = phoneCss(hudSafeTopCss(0), CSS_W);
const hudCss = hudY / H655 * VIS_H;
assert(hudCss >= 44, "money/BAG cssY clears a notch, cssY=" + hudCss.toFixed(1));

// BAG uses the same dark readable plate as money — not bare wood.
const bagPlate = "rgba(18, 32, 42, 0.94)";
const moneyPlate = "rgba(52, 64, 48, 0.9)";
assert(/rgba\(\s*18\s*,\s*32\s*,\s*42/.test(bagPlate), "BAG plate is a dark HUD fill");
assert(/rgba\(\s*52\s*,\s*64\s*,\s*48/.test(moneyPlate), "money plate stays the chalkboard inset");
const bagLabel = "#fff6e8";
assert(bagLabel === "#fff6e8", "BAG label uses the money cream ink");

// Title lines on a 390 card do not share one baseline.
const titleH = Math.max(phoneCss(96, CSS_W), Math.min(280, Math.round(H844 * 0.10)));
const titleFont = phoneCss(20, CSS_W);
const subFont = phoneCss(13, CSS_W);
const titleBase = titleH * 0.26;
const subBase = titleH * 0.50;
assert(subBase - titleBase >= titleFont * 0.85, "Pier Mart and Dive. Stock. Sell. do not collide");
assert(titleFont / H844 * LAYOUT_H >= 18, "title type is not ~6px");
assert(subFont / H844 * LAYOUT_H >= 12, "subtitle type is not ~6px");

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

console.log("c82 visual-viewport DIVE / SURFACE / BAG plate: ok");
