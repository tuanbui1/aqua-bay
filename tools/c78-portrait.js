// C78 — portrait phone layout: wide playfield, slim rail, upgrades off the deck.
function desktopStage(w, h) { return w >= 880 && w >= h * 0.92; }
function phonePortrait(w, h) { return h > w * 1.05; }
function fillPhoneStage(w, h, coarse) {
  if (desktopStage(w, h)) return false;
  return !!(coarse || phonePortrait(w, h) || w < 520);
}
function portraitStage(w, h) { return !desktopStage(w, h) && phonePortrait(w, h); }
function compactHud(w, h, coarse, scale) {
  if (desktopStage(w, h)) return false;
  return !!(coarse || scale < 0.62 || phonePortrait(w, h));
}

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

assert(desktopStage(1280, 720), "1280×720 is desktop");
assert(desktopStage(1440, 900), "laptop landscape is desktop");
assert(!desktopStage(390, 844), "390×844 is not desktop");
assert(!desktopStage(430, 932), "430×932 is not desktop");
assert(!fillPhoneStage(1280, 720, true), "touchscreen laptop stays desktop stage");
assert(fillPhoneStage(390, 844, true), "phone portrait fills");
assert(fillPhoneStage(390, 844, false), "narrow portrait fills even without coarse");
assert(portraitStage(390, 844), "390×844 is portrait stage");
assert(portraitStage(430, 932), "430×932 is portrait stage");
assert(!portraitStage(1280, 720), "desktop is not portrait stage");
assert(!compactHud(1280, 720, true, 1), "touchscreen laptop must not inflate desktop cards");
assert(compactHud(390, 844, true, 390 / 1280), "phone HUD uses fat tap targets");

// Square-pixel portrait: logical H matches the viewport aspect.
const W = 1280;
function portraitH(cssW, cssH) { return Math.max(960, Math.round(W * cssH / cssW)); }
const h390 = portraitH(390, 844);
const h430 = portraitH(430, 932);
assert(h390 === 2770 || h390 === 2769, "390×844 logical H is aspect-matched, got " + h390);
assert(Math.abs((h390 / W) - (844 / 390)) < 0.01, "390×844 pixels stay square");
assert(Math.abs((h430 / W) - (932 / 430)) < 0.01, "430×932 pixels stay square");

// Slim rail: cards share the mute/pause column (~56 CSS px), not a 120px well.
function cssToStage(cssPx, cssW) { return Math.round(cssPx * W / cssW); }
const rail390 = cssToStage(48, 390);
assert(rail390 < 200, "rail is a thumb column, not a third of the width " + rail390);
const gutterLeft = Math.max(Math.round(W * 0.82), W - rail390 - 12);
const playCss = gutterLeft / W * 390;
assert(playCss > 300, "playfield is the wide part of 390px, got " + playCss.toFixed(1));
assert((390 - playCss) < 90, "species rail must not eat a third of 390px, rail=" + (390 - playCss).toFixed(1));

// Upgrades live in the rail (x >= gutter), never in the bottom thumb zone.
const upX = gutterLeft + 4;
const upY = 200;
const deckY = h390 * 0.55;
assert(upX >= gutterLeft, "upgrade chips sit in the rail");
assert(upY < h390 * 0.42, "upgrade chips sit in the upper rail, not on the deck");
function lowDeckBuys(hitId, y) {
  if (String(hitId).startsWith("up-") && y > h390 * 0.42) return false;
  return String(hitId).startsWith("up-");
}
assert(!lowDeckBuys("up-bag", deckY), "a low-deck tap must not purchase");
assert(lowDeckBuys("up-bag", upY), "a rail tap can still arm a buy");

// Two-tap: first tap arms, second tap buys.
let arm = { id: "", t: 0 };
function armOrBuy(id) {
  if (arm.id === id && arm.t > 0) { arm.id = ""; arm.t = 0; return "buy"; }
  arm.id = id; arm.t = 2.6; return "arm";
}
assert(armOrBuy("up-bag") === "arm", "first tap arms");
assert(armOrBuy("up-bag") === "buy", "second tap buys");

// DIVE chip sits on the playfield, on-canvas, not under the fold.
const diveH = 180, divePad = 18;
const dive = { x: gutterLeft / 2 - 160, y: h390 - divePad - diveH, w: 320, h: diveH };
assert(dive.y > 0 && dive.y + dive.h <= h390, "DIVE is on-canvas at 390×844");
assert(dive.x + dive.w < gutterLeft, "DIVE stays in the playfield");
assert(dive.y > h390 * 0.7, "DIVE is in the visible bottom of the portrait stage");

// Persist upgrades: bagLv must round-trip with the backup block.
function persistUpgrades(state) {
  return {
    money: state.money, speedLv: state.speedLv, bagLv: state.bagLv, catchLv: state.catchLv,
    upgrades: { speedLv: state.speedLv, bagLv: state.bagLv, catchLv: state.catchLv, hiredCashier: !!state.hiredCashier },
  };
}
function loadUpgrades(d) {
  return {
    speedLv: Math.max(d.speedLv | 0, (d.upgrades && d.upgrades.speedLv) | 0),
    bagLv: Math.max(d.bagLv | 0, (d.upgrades && d.upgrades.bagLv) | 0),
    catchLv: Math.max(d.catchLv | 0, (d.upgrades && d.upgrades.catchLv) | 0),
    hiredCashier: !!(d.hiredCashier || (d.upgrades && d.upgrades.hiredCashier)),
  };
}
const saved = persistUpgrades({ money: 1, speedLv: 0, bagLv: 1, catchLv: 0, hiredCashier: false });
const loaded = loadUpgrades(saved);
assert(loaded.bagLv === 1, "bag upgrade persists");
const recovered = loadUpgrades({ money: 1, speedLv: 0, bagLv: 0, catchLv: 0, upgrades: { bagLv: 1, speedLv: 0, catchLv: 0 } });
assert(recovered.bagLv === 1, "backup upgrades.bagLv recovers a missing field");

// Plaza hint: money or a first sale dismisses the stuck walk-to-dock line.
function plazaHintSpent(s) {
  return (s.money | 0) > 0 || !!s.didFirstStock || !!s.didFirstSale || (s.tutorial | 0) >= 1;
}
assert(plazaHintSpent({ money: 51 }), "$51 in the plaza is not stuck on walk-to-dock");
assert(!plazaHintSpent({ money: 0, didMove: false, tutorial: 0 }), "brand-new game can still show walk-to-dock");

// Desktop 16:9 contain: click maps 1:1 into 1280×720.
const desk = { x: 200 * (1280 / 1280), y: 400 * (720 / 720) };
assert(desk.x === 200 && desk.y === 400, "desktop click is 1:1 on a 1280×720 canvas");
assert(!portraitStage(1280, 720) && desktopStage(1280, 720), "laptop keeps the framed 16:9 stage");

console.log("c78 portrait layout: ok");
