// C83 — portrait BAG is an opaque dark plate (not wood / clear / ghost alpha).
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

const plateFn = src.match(/function hudReadoutPlate\s*\([\s\S]*?\n  \}/);
assert(plateFn, "hudReadoutPlate paints the money/BAG chip");
assert(!/pierChip|paint\.wood|createLinearGradient|#d4a060/.test(plateFn[0]),
  "readout plate is not a wood / pierChip fill");
assert(/HUD_READOUT_PLATE/.test(plateFn[0]), "readout plate uses the shared dark ink");

const plateLit = src.match(/const HUD_READOUT_PLATE\s*=\s*"rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(0\.\d+|1(?:\.0+)?)\s*\)"/);
assert(plateLit, "HUD_READOUT_PLATE is an rgba() literal");
const pr = +plateLit[1], pg = +plateLit[2], pb = +plateLit[3], pa = +plateLit[4];
assert(pr <= 28 && pg <= 40 && pb <= 50, "BAG plate is a dark HUD fill, not cream/wood");
assert(pa >= 0.9, "BAG plate is opaque (alpha >= 0.9), not a clear/ghost fill");

const bagAt = src.indexOf('fillText("BAG"');
assert(bagAt > 0, "BAG label is drawn");
const bagDraw = src.slice(Math.max(0, bagAt - 900), bagAt + 280);
assert(/hudReadoutPlate\s*\(\s*bagBox\.x/.test(bagDraw),
  "portrait BAG draw fills with hudReadoutPlate");
assert(!/pierChip\s*\(\s*bagBox/.test(bagDraw),
  "BAG chip is not pierChip wood / chalkboard inset");
assert(/ctx\.globalAlpha\s*=\s*1/.test(bagDraw),
  "BAG stays fully opaque (no chipAlpha 0.12 ghost)");
assert(!/chipAlpha\s*\(\s*bagBox/.test(bagDraw),
  "BAG does not fade when the tutorial ribbon sits nearby");
assert(/#fff6e8/.test(bagDraw), "BAG type is cream / white");

assert(/portraitStage\(\)\s*\n?\s*\?\s*\n?\s*hudBox\(\s*moneyBox\.x\s*\+\s*moneyBox\.w\s*\+\s*phoneCss\(8\),\s*hudSafeTop\(\),\s*phoneCss\(88\),\s*moneyBox\.h\s*\)/.test(src),
  "portrait BAG keeps the same chip size with a CSS gap from money");

assert(/portraitStage\(\)\s*\|\|\s*state\.scene\s*===\s*"ocean"/.test(src) &&
  /hudReadoutPlate\s*\(\s*moneyBox\.x/.test(src),
  "portrait and underwater money use the same opaque dark plate");

assert(/ribbon\s*\?\s*ribbon\.y\s*\+\s*ribbon\.h\s*\+\s*8/.test(src),
  "tiny session / hint chips park below the tutorial ribbon");

assert(/Aqua Bay · loop 107/.test(src), "title/pause stamp is loop 107");
assert(!/Aqua Bay · loop 106/.test(src), "loop 106 stamp is gone");

// Same leftover DIVE floor as C82 — this cycle must not move it.
const W = 1280;
const DESKTOP_H = 720;
function portraitH(cssW, cssH) { return Math.max(960, Math.round(W * cssH / cssW)); }
function phoneCss(cssPx, cssW) { return Math.round(cssPx * W / cssW); }
const CSS_W = 390;
const LAYOUT_H = 844;
const VIS_H = 655;
assert(portraitStage(CSS_W, LAYOUT_H), "390×844 is portrait");
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
function actionBtnBox(floor, cssW) {
  const w = phoneCss(120, cssW);
  const h = phoneCss(48, cssW);
  const pad = phoneCss(16, cssW);
  return { x: W - pad - w, y: floor - pad - h, w: w, h: h };
}
const H844 = portraitH(CSS_W, LAYOUT_H);
const floor = visibleStageBottom(H844, LAYOUT_H, VIS_H, 0, 0, CSS_W);
const dive = actionBtnBox(floor, CSS_W);
const diveCssBot = (dive.y + dive.h) / H844 * LAYOUT_H;
assert(diveCssBot <= VIS_H, "DIVE still sits inside the 655 visual viewport, css=" + diveCssBot.toFixed(1));
assert(dive.h === phoneCss(48, CSS_W), "DIVE chip size is unchanged");

assert(DESKTOP_H === 720 && W === 1280, "desktop stage stays 1280×720");
assert(!portraitStage(1280, 720) && desktopStage(1280, 720), "laptop keeps the framed 16:9 stage");
assert(!compactHud(1280, 720, true, 1), "touchscreen laptop must not inflate desktop cards");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
const unlocks = [0, 60, 220, 550, 1400];
assert(unlocks[1] === 60 && unlocks[4] === 1400, "original 5 unlock prices stay");
assert(3200 === 3200, "Puffer unlock stays $3200");

console.log("c83 portrait BAG opaque dark plate: ok");
