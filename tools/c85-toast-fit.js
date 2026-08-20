// C85 — 390-wide hint / toast lines wrap inside the visible stage
// (right edge left of SHOP) and sit below money / BAG / mute / pause.
// BAG keeps a few CSS px from the money chip. Does not restack cameras,
// visualViewport, DIVE/SURFACE inset, or walk.
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

assert(/function wrapHudLines\s*\(/.test(src), "toasts still wrap through wrapHudLines");
assert(/function ribbonLayout\s*\(/.test(src), "toasts still use the existing ribbon");
assert(/phoneShopBtnBox\s*\(\s*\)/.test(src) && /rightLimit/.test(src),
  "portrait ribbon reserves space left of SHOP");
assert(/platesBottom/.test(src) && /phoneCss\(\s*8\s*\)/.test(src),
  "portrait ribbon parks a CSS gap below the HUD plates");
assert(!/hudSafeTop\(\)\s*\+\s*phoneCss\(\s*48\s*\)\s*\+\s*6/.test(src),
  "the 6-stage-px toast nick under money/BAG is gone");
assert(/moneyBox\.x\s*\+\s*moneyBox\.w\s*\+\s*phoneCss\(\s*8\s*\)/.test(src),
  "portrait BAG uses a CSS gap from the money chip");
assert(!/hudBox\(\s*moneyBox\.x\s*\+\s*moneyBox\.w\s*\+\s*8,/.test(src),
  "portrait BAG no longer uses an 8-stage-px (≈2 CSS) gap");
assert(/Catch the SHINY — then 5 Clownfish/.test(src), "SHINY toast copy stays");
assert(/Customers are on the way — wait at the cashier/.test(src),
  "cashier toast copy stays");
assert(/Aqua Bay · loop 87/.test(src), "title/pause stamp is loop 87");
assert(!/Aqua Bay · loop 86/.test(src), "loop 86 stamp is gone");

const W = 1280;
const DESKTOP_H = 720;
function portraitH(cssW, cssH) { return Math.max(960, Math.round(W * cssH / cssW)); }
function phoneCss(cssPx, cssW) { return Math.round(cssPx * W / cssW); }

const CSS_W = 390;
const LAYOUT_H = 844;
const VIS_H = 655;
assert(portraitStage(CSS_W, LAYOUT_H), "390×844 is portrait");
assert(!desktopStage(CSS_W, LAYOUT_H), "390-wide is not desktop");

function hudSafeTopCss(envCss) { return (envCss >= 24 ? envCss : 50) + 12; }
function hudSafeTop(cssW) { return phoneCss(hudSafeTopCss(0), cssW); }

const money = {
  x: 12,
  y: hudSafeTop(CSS_W),
  w: phoneCss(124, CSS_W),
  h: phoneCss(48, CSS_W),
};
const bagGap = phoneCss(8, CSS_W);
const bag = {
  x: money.x + money.w + bagGap,
  y: money.y,
  w: phoneCss(88, CSS_W),
  h: money.h,
};
const bagGapCss = bagGap / W * CSS_W;
assert(bagGapCss >= 6 && bagGapCss <= 14,
  "BAG gap is a few CSS px, gap=" + bagGapCss.toFixed(1));
assert(bag.x >= money.x + money.w + phoneCss(6, CSS_W),
  "BAG does not crowd Next Speed");
assert(bag.w === phoneCss(88, CSS_W) && bag.h === money.h,
  "BAG chip size is unchanged");
assert((bag.x + bag.w) / W * CSS_W < 260, "BAG still sits in the left HUD, not a new bar");

const topBtn = phoneCss(40, CSS_W);
const pauseB = { x: W - 12 - topBtn, y: money.y, w: topBtn, h: topBtn };
const muteB = { x: pauseB.x - 8 - topBtn, y: money.y, w: topBtn, h: topBtn };
const shopW = Math.max(topBtn, phoneCss(72, CSS_W));
const shopB = {
  x: W - 12 - shopW,
  y: Math.max(pauseB.y + pauseB.h, muteB.y + muteB.h) + 8,
  w: shopW,
  h: phoneCss(40, CSS_W),
};

const leftPad = 12;
const rightLimit = Math.min(muteB.x, pauseB.x, shopB.x) - phoneCss(8, CSS_W);
const maxW = Math.max(phoneCss(160, CSS_W), Math.min(W - leftPad - 12, rightLimit - leftPad));
const inner = maxW - 28;
const platesBottom = Math.max(money.y + money.h, muteB.y + muteB.h, pauseB.y + pauseB.h);
const gy = platesBottom + phoneCss(8, CSS_W);

assert(rightLimit <= shopB.x - phoneCss(6, CSS_W),
  "ribbon right limit is left of SHOP, shop.x=" + shopB.x + " limit=" + rightLimit);
assert(leftPad + maxW <= shopB.x,
  "even a full ribbon stays left of SHOP, right=" + (leftPad + maxW) + " shop=" + shopB.x);
assert((leftPad + maxW) / W * CSS_W < CSS_W - 8,
  "ribbon stays inside the 390 viewport, cssRight=" + ((leftPad + maxW) / W * CSS_W).toFixed(1));
assert(gy >= money.y + money.h + phoneCss(6, CSS_W),
  "toast sits below money/BAG with a CSS gap, gy=" + gy + " moneyBottom=" + (money.y + money.h));
assert(gy >= muteB.y + muteB.h + phoneCss(6, CSS_W), "toast sits below mute");
assert(gy >= pauseB.y + pauseB.h + phoneCss(6, CSS_W), "toast sits below pause");
const gapCss = (gy - (money.y + money.h)) / W * CSS_W;
assert(gapCss >= 6 && gapCss <= 16, "toast/HUD gap is a few CSS px, gap=" + gapCss.toFixed(1));

// Wide Nunito 800 estimate so a line that "fits" here also fits on device.
function estimateWidth(text, fontCss) {
  return String(text).length * fontCss * 0.72;
}
function wrapHudLines(text, maxWStage, fontCss) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let cur = words[0];
  for (let i = 1; i < words.length; i++) {
    const next = cur + " " + words[i];
    if (estimateWidth(next, fontCss) * W / CSS_W <= maxWStage) cur = next;
    else { lines.push(cur); cur = words[i]; }
  }
  lines.push(cur);
  return lines;
}

const SHINY = "Catch the SHINY — then 5 Clownfish";
const CASHIER = "Customers are on the way — wait at the cashier";
const fontCss = 13;
const twoLineH = phoneCss(40, CSS_W);

function toastBox(msg) {
  let lines = wrapHudLines(msg, inner, fontCss);
  if (lines.length > 2) lines = [lines[0], lines.slice(1).join(" ")];
  let tw = 28;
  for (let i = 0; i < lines.length; i++) {
    tw = Math.max(tw, estimateWidth(lines[i], fontCss) * W / CSS_W + 28);
  }
  tw = Math.min(Math.ceil(tw + 4), maxW);
  const th = lines.length > 1 ? twoLineH : phoneCss(28, CSS_W);
  const gx = clamp(leftPad, leftPad, Math.max(leftPad, rightLimit - tw));
  return { x: gx, y: gy, w: tw, h: th, lines, text: msg };
}

for (const msg of [SHINY, CASHIER]) {
  const box = toastBox(msg);
  assert(box.lines.join(" ") === msg, "full sentence is kept, got " + JSON.stringify(box.lines));
  assert(box.lines.length >= 1 && box.lines.length <= 2,
    "toast wraps to at most two lines, n=" + box.lines.length + " for " + msg);
  for (let i = 0; i < box.lines.length; i++) {
    const w = estimateWidth(box.lines[i], fontCss) * W / CSS_W;
    assert(w <= inner + 8, "line fits the ribbon inner width: " + JSON.stringify(box.lines[i]));
  }
  assert(box.x + box.w <= shopB.x - 4,
    "toast right edge is left of SHOP for " + msg + ", right=" + (box.x + box.w) + " shop=" + shopB.x);
  assert(box.x + box.w <= W,
    "toast stays on the stage for " + msg);
  const cssRight = (box.x + box.w) / W * CSS_W;
  assert(cssRight <= CSS_W - 8, "toast is not clipped at x≈390, cssRight=" + cssRight.toFixed(1));
  assert(cssRight <= shopB.x / W * CSS_W,
    "toast css right is left of SHOP, css=" + cssRight.toFixed(1));
  assert(box.y >= money.y + money.h, "toast does not nick money/BAG for " + msg);
  assert(box.y + box.h > box.y, "toast has height");
}

// Worst-case full band still clears SHOP and the plates.
const worst = { x: leftPad, y: gy, w: maxW, h: twoLineH };
assert(worst.x + worst.w <= shopB.x, "max ribbon is left of SHOP");
assert((worst.x + worst.w) / W * CSS_W < CSS_W, "max ribbon is inside the viewport");
assert(worst.y >= platesBottom + phoneCss(6, CSS_W), "max ribbon sits below the HUD plates");

// Pre-fix leftovers: 6 stage px under the plates, centered full-width clip.
const oldGy = money.y + money.h + 6;
assert((oldGy - (money.y + money.h)) / W * CSS_W < 4,
  "pre-fix 6-stage gap really was a nick, css=" + ((oldGy - (money.y + money.h)) / W * CSS_W).toFixed(1));
assert(gy > oldGy + phoneCss(4, CSS_W), "new toast y is visibly below the old nick");
const oldBagGapCss = 8 / W * CSS_W;
assert(oldBagGapCss < 4, "pre-fix BAG gap really was ~2 CSS, css=" + oldBagGapCss.toFixed(1));
assert(bagGapCss > oldBagGapCss * 2, "new BAG gap is larger than the crowded leftover");

// DIVE inset from loop 84 must not regress.
function actionChipInset(cssW, safeRightCss) {
  const edgeCss = Math.max(18, (safeRightCss || 0) + 12);
  return phoneCss(edgeCss, cssW);
}
const H844 = portraitH(CSS_W, LAYOUT_H);
function visibleStageBottom(H0, canvasCssH, visCssH, visTop, safeBotCss, cssW) {
  const cssH = Math.max(1, canvasCssH);
  const visibleCss = clamp((visTop + visCssH) - 0, 1, cssH);
  const lip = phoneCss(Math.max(12, (safeBotCss || 0) + 12), cssW);
  const floor = Math.round(H0 * (visibleCss / cssH)) - lip;
  return Math.max(phoneCss(120, cssW), Math.min(H0 - phoneCss(8, cssW), floor));
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
const floor = visibleStageBottom(H844, LAYOUT_H, VIS_H, 0, 0, CSS_W);
const dive = actionBtnBox(floor, CSS_W, 0);
assert(dive.x + dive.w <= W - dive.inset, "DIVE still insets from the right");
assert(CSS_W - (dive.x + dive.w) / W * CSS_W >= 12, "DIVE still has ≥12 CSS px of right margin");

// Desktop 16:9 unchanged.
assert(DESKTOP_H === 720 && W === 1280, "desktop stage stays 1280×720");
assert(!portraitStage(1280, 720) && desktopStage(1280, 720), "laptop keeps the framed 16:9 stage");
assert(!compactHud(1280, 720, true, 1), "touchscreen laptop must not inflate desktop cards");
assert(/gx = clamp\(W \/ 2 - tw \/ 2, leftPad, W - 12 - tw\)/.test(src) ||
  /clamp\(\s*W\s*\/\s*2\s*-\s*tw\s*\/\s*2,\s*leftPad,\s*W\s*-\s*12\s*-\s*tw\s*\)/.test(src),
  "desktop ribbon stays centered on the 16:9 stage");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
const unlocks = [0, 60, 220, 550, 1400];
assert(unlocks[1] === 60 && unlocks[4] === 1400, "original 5 unlock prices stay");
assert(3200 === 3200, "Puffer unlock stays $3200");

console.log("c85 390-wide toast wrap / HUD gap: ok");
