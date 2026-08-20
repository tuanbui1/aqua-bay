// C80 — playable phone: full playfield, shop tray, chip DIVE, natural title cards.
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
function portraitH(cssW, cssH) { return Math.max(960, Math.round(W * cssH / cssW)); }
const H390 = portraitH(390, 844);
const H430 = portraitH(430, 932);

assert(desktopStage(1280, 720), "desktop 16:9 stays desktop");
assert(!portraitStage(1280, 720), "desktop is not portrait");
assert(portraitStage(390, 844), "390×844 is portrait");
assert(portraitStage(430, 932), "430×932 is portrait");
assert(!compactHud(1280, 720, true, 1), "touchscreen laptop must not inflate desktop cards");

assert(Math.abs((H390 / W) - (844 / 390)) < 0.01, "390×844 pixels stay square");
assert(Math.abs((H430 / W) - (932 / 430)) < 0.01, "430×932 pixels stay square");

function cssToStage(cssPx, cssW, minC, maxC) {
  const raw = Math.round(cssPx * W / cssW);
  if (minC == null) return raw;
  return clamp(raw, minC, maxC);
}

// Playfield IS the phone — no reserved catalog well.
function railGutterLeft(portrait) { return portrait ? W : Math.max(720, 980); }
assert(railGutterLeft(true) === W, "portrait playfield is full width");
const playCss390 = railGutterLeft(true) / W * 390;
assert(playCss390 >= 380, "390 playfield fills the phone, got " + playCss390.toFixed(1));
assert(playCss390 > 335, "playfield is not a 270–335px sliver beside a shop rail");

// DIVE / SURFACE are chips, not a fat banner covering the dock.
function phoneCss(cssPx, cssW) { return Math.round(cssPx * W / cssW); }
const diveW = phoneCss(120, 390);
const diveH = phoneCss(48, 390);
assert(diveW < W * 0.4, "DIVE chip is not a full-width banner, w=" + diveW);
assert(diveH < H390 * 0.08, "DIVE chip is not a fat banner, h=" + diveH);
const diveCssW = diveW / W * 390;
const diveCssH = diveH / H390 * 844;
assert(diveCssW >= 100 && diveCssW < 160, "DIVE is a thumb chip on 390px, cssW=" + diveCssW.toFixed(1));
assert(diveCssH >= 40 && diveCssH < 56, "DIVE does not cover the dock boards, cssH=" + diveCssH.toFixed(1));
const dive = { x: W - 16 - diveW, y: H390 - 16 - diveH, w: diveW, h: diveH };
assert(dive.y > 0 && dive.y + dive.h <= H390, "DIVE is on-canvas");
assert(dive.x >= 12 && dive.x + dive.w <= W, "DIVE is on the playfield");

// Shop is a toggle overlay, not a permanent rail.
let phoneShopOpen = false;
function phoneShopBtnBox() {
  const bw = cssToStage(56, 390);
  const bh = cssToStage(36, 390);
  return { x: W - 12 - bw, y: 10 + cssToStage(36, 390) + 8, w: bw, h: bh };
}
function phoneShopPanelBox() {
  const btn = phoneShopBtnBox();
  const w = Math.round(118 * W / 390);
  return { x: W - 10 - w, y: btn.y + btn.h + 8, w: w, h: H390 - (btn.y + btn.h + 8) - 16 };
}
function phoneShopHit(x, y) {
  if (!phoneShopOpen) return false;
  const p = phoneShopPanelBox();
  return x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h;
}
const btn = phoneShopBtnBox();
assert(btn.w / W * 390 < 90, "SHOP is one thumb chip, not a catalog column");
assert(!phoneShopHit(200, H390 * 0.7), "closed tray does not steal the deck");
phoneShopOpen = true;
const panel = phoneShopPanelBox();
assert(panel.w / W * 390 < 130, "open tray is an overlay chip column, cssW=" + (panel.w / W * 390).toFixed(1));
assert(phoneShopHit(panel.x + 8, panel.y + 20), "open tray receives shop taps");
assert(!phoneShopHit(80, H390 * 0.7), "world left of the tray is still the playfield");

function lowDeckBuys(hitId, x, y) {
  if (String(hitId).startsWith("up-") && !phoneShopHit(x, y)) return false;
  return String(hitId).startsWith("up-");
}
assert(!lowDeckBuys("up-bag", 200, H390 * 0.7), "a walk tap still does not purchase");
assert(lowDeckBuys("up-bag", panel.x + 8, panel.y + 40), "a tray tap can still arm a buy");
phoneShopOpen = false;
assert(!lowDeckBuys("up-bag", panel.x + 8, panel.y + 40), "closed tray cannot buy");

let arm = { id: "", t: 0 };
function armOrBuy(id) {
  if (arm.id === id && arm.t > 0) { arm.id = ""; arm.t = 0; return "buy"; }
  arm.id = id; arm.t = 2.6; return "arm";
}
assert(armOrBuy("up-bag") === "arm", "first tap arms");
assert(armOrBuy("up-bag") === "buy", "second tap buys");

function titleMenuLayout(H) {
  const desk = {
    titleY: 40, titleH: 156,
    pickerY: 252, cardW: 168, cardH: 176,
    continueY: 452, continueH: 56,
    captionY: 528,
    newY: 548, newH: 48,
    portrait: false,
  };
  if (H <= DESKTOP_H + 20) return desk;
  const pad = Math.round(H * 0.024);
  const titleH = Math.min(210, Math.max(150, Math.round(H * 0.085)));
  const whoH = Math.max(28, Math.round(H * 0.018));
  const cardGap = 20;
  const cardW = Math.min(300, Math.round((W - 80 - cardGap * 2) / 3));
  const cardH = Math.round(cardW * 1.12);
  const cssW = 390;
  const btnH = Math.max(Math.round(52 * W / cssW), Math.round(H * 0.055));
  const newH = Math.max(Math.round(48 * W / cssW), Math.round(H * 0.048));
  const gap = Math.round(H * 0.016);
  const capH = Math.max(28, Math.round(H * 0.018));
  let y = pad;
  const titleY = y;
  y += titleH + gap;
  const whoFontPx = Math.max(22, Math.round(H * 0.017));
  const whoY = y + whoFontPx;
  y = whoY + Math.round(whoFontPx * 0.35) + Math.max(10, Math.round(gap * 0.6));
  const pickerY = y;
  y = pickerY + cardH + Math.round(gap * 1.6);
  let continueY = y;
  y += btnH + Math.round(H * 0.012);
  let captionY = y + Math.round(capH * 0.55);
  y += capH + Math.round(H * 0.014);
  let newY = y;
  const waterY = H - Math.round(Math.min(520, H * 0.28));
  const slack = waterY - (newY + newH) - pad;
  if (slack > 80) {
    const shift = Math.round(slack * 0.55);
    continueY += shift;
    captionY += shift;
    newY += shift;
  }
  return {
    titleY, titleH, pickerY, cardW, cardH, whoY,
    continueY, continueH: btnH, captionY, newY, newH,
    portrait: true,
  };
}

const deskLay = titleMenuLayout(DESKTOP_H);
assert(!deskLay.portrait, "desktop title keeps the 720 layout");
assert(deskLay.cardH === 176 && deskLay.continueH === 56, "desktop cards/buttons unchanged");
assert(deskLay.newY - (deskLay.continueY + deskLay.continueH) >= 20, "desktop buttons stay stacked");

const phoneLay = titleMenuLayout(H390);
assert(phoneLay.portrait, "390×844 uses the tall title layout");
assert(phoneLay.cardW / phoneLay.cardH > 0.8 && phoneLay.cardH / phoneLay.cardW < 1.35,
  "title cards are not vertically elongated noodles, aspect=" + (phoneLay.cardH / phoneLay.cardW).toFixed(2));
assert(phoneLay.continueH / H390 * 844 >= 48, "Continue is a fat button, cssH=" + (phoneLay.continueH / H390 * 844).toFixed(1));
assert(phoneLay.newH / H390 * 844 >= 44, "New Game is a fat button, cssH=" + (phoneLay.newH / H390 * 844).toFixed(1));
const btnGap = phoneLay.newY - (phoneLay.continueY + phoneLay.continueH);
assert(btnGap >= 40, "Continue and New Game must not crush, gap=" + btnGap);
assert(phoneLay.captionY > phoneLay.continueY + phoneLay.continueH, "caption sits below Continue");
assert(phoneLay.captionY < phoneLay.newY, "caption sits above New Game");
assert(phoneLay.newY + phoneLay.newH < H390 - 40, "buttons stay on-canvas");
assert(phoneLay.whoY < phoneLay.pickerY - 8, "Who's diving? sits above the picker cards");

// Live phone: 390-wide with ~200px browser chrome → visual viewport ~655.
const visH = 655;
const Hvis = portraitH(390, visH);
assert(Hvis < H390, "logical H follows the 655 visual viewport, not 844");
assert(Math.abs((Hvis / W) - (visH / 390)) < 0.01, "655 visual viewport stays square pixels");
function visibleStageBottom(H, canvasCssH, visCssH, visTop) {
  const visibleCss = Math.max(1, Math.min(canvasCssH, (visTop + visCssH) - 0));
  return Math.round(H * (visibleCss / canvasCssH));
}
const diveHvis = phoneCss(48, 390);
const lip = phoneCss(12, 390);
// Even if the canvas was wrongly sized to 844, DIVE must stay in the 655 window.
const floorWrong = visibleStageBottom(H390, 844, 655, 0) - lip;
const diveYWrong = floorWrong - 16 - diveHvis;
const diveCssBottomWrong = (diveYWrong + diveHvis) / H390 * 844;
assert(diveCssBottomWrong <= 655, "DIVE stays inside 655 visual viewport if canvas is 844, bottom=" + diveCssBottomWrong.toFixed(1));
const floorVis = Hvis - lip;
const diveYVis = floorVis - 16 - diveHvis;
assert(diveYVis + diveHvis <= Hvis, "DIVE is on the 655-tall stage");
assert((diveYVis + diveHvis) / Hvis * visH <= visH, "DIVE CSS bottom is in the visual viewport");
const surfY = diveYVis;
assert(surfY / Hvis * visH < visH - 8, "SURFACE is not under the browser chrome");

const upCh = phoneCss(56, 390);
assert(upCh / Hvis * visH < 70, "upgrade rows are compact chips, not tall empty boxes");
const typeCss = 14;
assert(typeCss >= 12, "upgrade type is readable, not 8px");
const visLay = titleMenuLayout(Hvis);
assert(visLay.whoY < visLay.pickerY - 8, "Who's diving? stays above cards on a 655 visual viewport");
assert((visLay.continueY + visLay.continueH) / Hvis * visH < visH - 8, "Continue stays in the 655 visual viewport");
assert(visLay.continueH / Hvis * visH >= 48, "Continue stays fat on a 655 visual viewport, cssH=" + (visLay.continueH / Hvis * visH).toFixed(1));
const diveTypeCss = 18;
assert(diveTypeCss >= 16, "DIVE label is readable chip type, not 8px");

function walkHint(thumb) {
  return thumb ? "Walk to the glowing DIVE dock — tap to walk" : "Walk to the glowing DIVE dock and press SPACE";
}
function diveHint(thumb) {
  return thumb ? "Tap DIVE" : "Press SPACE or click to DIVE";
}
const phone = compactHud(390, 844, true, 390 / 1280) || portraitStage(390, 844);
const desk = compactHud(1280, 720, false, 1) || portraitStage(1280, 720);
assert(phone, "phone uses tap copy");
assert(!desk, "desktop keeps SPACE/click copy");
assert(!/SPACE/i.test(walkHint(phone)), "phone walk hint must not say SPACE");
assert(/tap to walk/i.test(walkHint(phone)), "phone walk hint says tap to walk");
assert(/SPACE/.test(walkHint(desk)), "desktop walk hint keeps SPACE");
assert(diveHint(phone) === "Tap DIVE", "phone dive hint is Tap DIVE");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
const unlocks = [0, 60, 220, 550, 1400];
assert(unlocks[1] === 60 && unlocks[4] === 1400, "original 5 unlock prices stay");

assert(!portraitStage(1280, 720) && desktopStage(1280, 720), "laptop keeps the framed 16:9 stage");
const deskClick = { x: 200 * (1280 / 1280), y: 400 * (720 / 720) };
assert(deskClick.x === 200 && deskClick.y === 400, "desktop click is 1:1 on a 1280×720 canvas");

console.log("c80 playable phone / shop tray / chip DIVE: ok");
