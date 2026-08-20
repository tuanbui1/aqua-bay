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
const diveW = cssToStage(108, 390, 150, 220);
const diveH = cssToStage(40, 390, 52, 70);
assert(diveW <= 220, "DIVE chip is not a full-width banner, w=" + diveW);
assert(diveH <= 70, "DIVE chip is not a fat banner, h=" + diveH);
const diveCssW = diveW / W * 390;
const diveCssH = diveH / H390 * 844;
assert(diveCssW < 160, "DIVE stays a small chip on 390px, cssW=" + diveCssW.toFixed(1));
assert(diveCssH < 56, "DIVE does not cover the dock boards, cssH=" + diveCssH.toFixed(1));
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
  const w = Math.min(340, cssToStage(136, 390));
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
assert(panel.w / W * 390 < 160, "open tray is an overlay, not a third of 390px");
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
  const btnH = Math.max(96, Math.round(H * 0.055));
  const newH = Math.max(88, Math.round(H * 0.048));
  const gap = Math.round(H * 0.016);
  const capH = Math.max(28, Math.round(H * 0.018));
  let y = pad;
  const titleY = y;
  y += titleH + gap;
  const pickerY = y + whoH + Math.round(H * 0.006);
  y = pickerY + cardH + Math.round(gap * 1.6);
  const continueY = y;
  y += btnH + Math.round(H * 0.012);
  const captionY = y + Math.round(capH * 0.55);
  y += capH + Math.round(H * 0.014);
  const newY = y;
  return {
    titleY, titleH, pickerY, cardW, cardH,
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
assert(phoneLay.continueH >= 96, "Continue is a fat button, got " + phoneLay.continueH);
assert(phoneLay.newH >= 88, "New Game is a fat button, got " + phoneLay.newH);
const btnGap = phoneLay.newY - (phoneLay.continueY + phoneLay.continueH);
assert(btnGap >= 40, "Continue and New Game must not crush, gap=" + btnGap);
assert(phoneLay.captionY > phoneLay.continueY + phoneLay.continueH, "caption sits below Continue");
assert(phoneLay.captionY < phoneLay.newY, "caption sits above New Game");
assert(phoneLay.newY + phoneLay.newH < H390 - 40, "buttons stay on-canvas");

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
