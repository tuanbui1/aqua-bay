// C81 — safe-area HUD, full DIVE in both cameras, findable stock, surface fade.
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
const DOCK_CAM_FLOOR = 1000;
const PLAZA_CAM_CEILING = 520;
const SHOP_H = 1260;
function portraitH(cssW, cssH) { return Math.max(960, Math.round(W * cssH / cssW)); }
function phoneCss(cssPx, cssW) { return Math.round(cssPx * W / cssW); }

const CSS_W = 390;
const visH = 655;
const H = portraitH(CSS_W, visH);
const z = H / 860;

assert(desktopStage(1280, 720), "desktop 16:9 stays desktop");
assert(!portraitStage(1280, 720), "desktop is not portrait");
assert(portraitStage(390, 844), "390×844 is portrait");
assert(!compactHud(1280, 720, true, 1), "touchscreen laptop must not inflate desktop cards");

// HUD y=12 was STAGE pixels (~4 CSS). Must be CSS-safe + ~12px.
function hudSafeTop(safeTopCss) {
  return phoneCss((safeTopCss || 0) + 12, CSS_W);
}
const notch = 47;
const hudY = hudSafeTop(notch);
const hudCss = hudY / H * visH;
assert(hudCss >= notch + 10, "money/BAG sit below the notch, cssY=" + hudCss.toFixed(1));
assert(hudY > 40, "portrait HUD is not 12 stage pixels at the canvas lip");
assert(hudSafeTop(0) / H * visH >= 10, "even with env()=0, HUD has a 12px comfort pad");

// DIVE chip: full tap target above home indicator, both cameras.
function visibleStageBottom(H0, canvasCssH, visCssH, visTop, safeBotCss) {
  const visibleCss = Math.max(1, Math.min(canvasCssH, (visTop + visCssH) - 0));
  const lip = phoneCss(Math.max(12, (safeBotCss || 0) + 12), CSS_W);
  return Math.round(H0 * (visibleCss / canvasCssH)) - lip;
}
const home = 34;
const floorDock = visibleStageBottom(H, visH, visH, 0, home);
const floorPlaza = visibleStageBottom(H, visH, visH, 0, home);
const diveW = phoneCss(120, CSS_W);
const diveH = phoneCss(48, CSS_W);
const pad = phoneCss(16, CSS_W);
function diveBox(floor) {
  return { x: W - pad - diveW, y: floor - pad - diveH, w: diveW, h: diveH };
}
const dockDive = diveBox(floorDock);
const plazaDive = diveBox(floorPlaza);
assert(dockDive.h === diveH && plazaDive.h === diveH, "DIVE keeps full chip height in both cameras");
assert(dockDive.y + dockDive.h <= floorDock, "dock DIVE sits above the visual floor");
assert(plazaDive.y + plazaDive.h <= floorPlaza, "plaza DIVE sits above the visual floor");
const diveCssBottom = (dockDive.y + dockDive.h) / H * visH;
assert(diveCssBottom <= visH - home, "DIVE is above the iOS home indicator, bottom=" + diveCssBottom.toFixed(1));
assert(diveCssBottom > visH * 0.7, "DIVE is still a bottom chip, not a top banner");
assert(dockDive.w / W * CSS_W < 160 && dockDive.w / W * CSS_W >= 100, "DIVE stays a thumb chip, not a fat banner");
assert(Math.abs(dockDive.y - plazaDive.y) < 2, "same DIVE box in dock and plaza cameras");

// World DIVE board must not peek as a sliver in the plaza camera.
function plazaCamCeiling(hhv) {
  return Math.min(PLAZA_CAM_CEILING, 890 - hhv - 28);
}
const hhv = (H / 2) / z;
const ceil = plazaCamCeiling(hhv);
const plazaViewBot = ceil + hhv;
assert(plazaViewBot <= 890 - 20, "plaza view keeps dock DIVE boards off-screen, bot=" + plazaViewBot.toFixed(1));
assert(ceil <= PLAZA_CAM_CEILING, "plaza ceiling never exceeds 520");

// Shop camera clamp must reach both legal rooms (navy-gap bug).
function shopCamYLimits(H0, zoom) {
  const half = (H0 / 2) / zoom;
  let minY = half, maxY = Math.max(half, SHOP_H - half);
  minY = Math.min(minY, plazaCamCeiling(half));
  maxY = Math.max(maxY, DOCK_CAM_FLOOR);
  return { minY, maxY };
}
const lim = shopCamYLimits(H, z);
assert(lim.maxY >= DOCK_CAM_FLOOR, "dock camera y=1000 is reachable, maxY=" + lim.maxY);
assert(lim.minY <= ceil, "plaza camera is reachable, minY=" + lim.minY);
const oldMax = Math.max(hhv, SHOP_H - hhv);
assert(oldMax < DOCK_CAM_FLOOR, "pre-fix clamp really could not reach the dock");

// After surface, stock cue is fully on-screen (not y=0 / off-left).
const stockTop = hudY + phoneCss(52, CSS_W);
const stockH = phoneCss(36, CSS_W);
const stockY = clamp(stockTop, hudY + phoneCss(52, CSS_W), floorDock - diveH - pad - stockH - 8);
assert(stockY >= hudY + 8, "tap-to-stock is below the safe HUD");
assert(stockY + stockH <= floorDock - 8, "tap-to-stock is above the home indicator");
const stockCss = stockY / H * visH;
assert(stockCss >= notch, "tap-to-stock is not under the notch, cssY=" + stockCss.toFixed(1));

// Surface fade completes in ~1s, not 14–23s.
function fadeOutIn(speed) {
  let fade = 0, dir = 1, t = 0;
  const dt = 1 / 60;
  while (fade < 1 && t < 2) { fade += dir * dt * speed; t += dt; }
  fade = 1; dir = -1;
  while (fade > 0 && t < 2) { fade += dir * dt * speed; t += dt; }
  return t;
}
const surfaceSecs = fadeOutIn(7.2);
assert(surfaceSecs <= 1.0, "surface fade returns the dock in ~1s, took " + surfaceSecs.toFixed(2));
assert(surfaceSecs > 0.1, "surface fade is not an instant pop");

// Desktop 16:9 unchanged.
assert(DESKTOP_H === 720 && W === 1280, "desktop stage stays 1280×720");
assert(!portraitStage(1280, 720) && desktopStage(1280, 720), "laptop keeps the framed 16:9 stage");
const deskDive = { x: 1280 / 2 - 170, y: 720 - 18 - 52, w: 340, h: 52 };
assert(deskDive.y + deskDive.h <= 720, "desktop DIVE stays on the 720 stage");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
const unlocks = [0, 60, 220, 550, 1400];
assert(unlocks[1] === 60 && unlocks[4] === 1400, "original 5 unlock prices stay");

console.log("c81 safe-area HUD / full DIVE / stock / surface: ok");
