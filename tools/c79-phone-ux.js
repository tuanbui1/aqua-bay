// C79 — leftover phone UX: tall title, tap copy, playfield SURFACE, dive rail.
function desktopStage(w, h) { return w >= 880 && w >= h * 0.92; }
function phonePortrait(w, h) { return h > w * 1.05; }
function portraitStage(w, h) { return !desktopStage(w, h) && phonePortrait(w, h); }
function compactHud(w, h, coarse, scale) {
  if (desktopStage(w, h)) return false;
  return !!(coarse || scale < 0.62 || phonePortrait(w, h));
}
function thumbCopy(w, h, coarse, scale) {
  return compactHud(w, h, coarse, scale) || portraitStage(w, h);
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const W = 1280;
const DESKTOP_H = 720;
function portraitH(cssW, cssH) { return Math.max(960, Math.round(W * cssH / cssW)); }
const H390 = portraitH(390, 844);

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
  const pad = Math.round(H * 0.028);
  const titleH = Math.round(H * 0.155);
  const whoH = Math.round(H * 0.026);
  const cardH = Math.round(H * 0.30);
  const btnH = Math.max(96, Math.round(H * 0.082));
  const newH = Math.max(88, Math.round(H * 0.072));
  const gap = Math.round(H * 0.02);
  const capH = Math.round(H * 0.026);
  let y = pad;
  const titleY = y;
  y += titleH + gap;
  const pickerY = y + whoH + Math.round(H * 0.006);
  y = pickerY + cardH + Math.round(gap * 1.35);
  const continueY = y;
  y += btnH + Math.round(H * 0.016);
  const captionY = y + Math.round(capH * 0.55);
  y += capH + Math.round(H * 0.018);
  const newY = y;
  return {
    titleY, titleH, pickerY, cardH,
    continueY, continueH: btnH, captionY, newY, newH,
    portrait: true,
  };
}

assert(desktopStage(1280, 720), "desktop 16:9 stays desktop");
assert(!portraitStage(1280, 720), "desktop is not portrait");
assert(portraitStage(390, 844), "390×844 is portrait");

const deskLay = titleMenuLayout(DESKTOP_H);
assert(!deskLay.portrait, "desktop title keeps the 720 layout");
assert(deskLay.cardH === 176 && deskLay.continueH === 56, "desktop cards/buttons unchanged");
assert(deskLay.newY - (deskLay.continueY + deskLay.continueH) >= 20, "desktop buttons stay stacked");

const phoneLay = titleMenuLayout(H390);
assert(phoneLay.portrait, "390×844 uses the tall title layout");
assert(phoneLay.cardH > 400, "character cards use the extra height, got " + phoneLay.cardH);
assert(phoneLay.continueH >= 96, "Continue is a fat button, got " + phoneLay.continueH);
assert(phoneLay.newH >= 88, "New Game is a fat button, got " + phoneLay.newH);
const btnGap = phoneLay.newY - (phoneLay.continueY + phoneLay.continueH);
assert(btnGap >= 80, "Continue and New Game must not overlap, gap=" + btnGap);
assert(phoneLay.captionY > phoneLay.continueY + phoneLay.continueH, "caption sits below Continue");
assert(phoneLay.captionY < phoneLay.newY, "caption sits above New Game");
const blockH = (phoneLay.newY + phoneLay.newH) - phoneLay.titleY;
assert(blockH > H390 * 0.55, "title menu must use most of 844px, used=" + blockH + " of " + H390);
assert(phoneLay.newY + phoneLay.newH < H390 - 40, "buttons stay on-canvas");

function walkHint(thumb) {
  return thumb ? "Walk to the glowing DIVE dock — tap to walk" : "Walk to the glowing DIVE dock and press SPACE";
}
function diveHint(thumb) {
  return thumb ? "Tap DIVE" : "Press SPACE or click to DIVE";
}
const phone = thumbCopy(390, 844, true, 390 / 1280);
const desk = thumbCopy(1280, 720, false, 1);
const deskTouch = thumbCopy(1280, 720, true, 1);
assert(phone, "phone uses tap copy");
assert(!desk, "desktop keeps SPACE/click copy");
assert(!deskTouch, "touchscreen laptop keeps desktop wording");
assert(!/SPACE/i.test(walkHint(phone)), "phone walk hint must not say SPACE");
assert(/tap to walk/i.test(walkHint(phone)), "phone walk hint says tap to walk");
assert(/SPACE/.test(walkHint(desk)), "desktop walk hint keeps SPACE");
assert(diveHint(phone) === "Tap DIVE", "phone dive hint is Tap DIVE");
assert(/SPACE/.test(diveHint(desk)), "desktop dive hint keeps SPACE");

function cssToStage(cssPx, cssW) { return Math.round(cssPx * W / cssW); }
const rail390 = cssToStage(48, 390);
assert(rail390 < 200, "rail is still a thumb column " + rail390);
const gutterLeft = Math.max(Math.round(W * 0.82), W - rail390 - 12);
const playCss = gutterLeft / W * 390;
assert(playCss > 300, "playfield stays the wide part of 390px");
assert((390 - playCss) < 90, "rail must not eat a third of 390px");

const surfW = 260, surfH = 88;
const surfX = Math.max(12, Math.min(gutterLeft - 16 - surfW, gutterLeft - surfW - 12));
assert(surfX + surfW <= gutterLeft, "SURFACE stays in the playfield, right=" + (surfX + surfW) + " gutter=" + gutterLeft);
assert(surfX >= 12, "SURFACE is on-canvas");

function railBarsReady(scene, mode, money) {
  if (portraitStage(390, 844)) {
    return mode === "play" && (money >= 25 || scene === "ocean");
  }
  return scene === "shop";
}
assert(railBarsReady("ocean", "play", 51), "Speed/Bag/Catch stay visible during a phone dive");
assert(railBarsReady("shop", "play", 51), "upgrades stay visible on the plaza");
assert(!railBarsReady("ocean", "title", 0), "title does not show the rail upgrades");

function lowDeckBuys(hitId, x, y) {
  if (String(hitId).startsWith("up-") && y > H390 * 0.42 && x < gutterLeft) return false;
  return String(hitId).startsWith("up-");
}
assert(!lowDeckBuys("up-bag", 200, H390 * 0.7), "a low-deck tap still does not purchase");
assert(lowDeckBuys("up-bag", gutterLeft + 8, H390 * 0.7), "a rail tap can still arm a buy");

function spriteAlpha(sx, r, rightEdge) {
  const fade = 120;
  return clamp((rightEdge - (sx + r)) / fade, 0, 1);
}
assert(spriteAlpha(gutterLeft - 10, 40, gutterLeft - 12) <= 0.04, "a sprite at the well fades out as a whole");
assert(spriteAlpha(gutterLeft - 200, 40, gutterLeft - 12) > 0.9, "a sprite well left of the rail stays opaque");

assert(!portraitStage(1280, 720) && desktopStage(1280, 720), "laptop keeps the framed 16:9 stage");
const deskClick = { x: 200 * (1280 / 1280), y: 400 * (720 / 720) };
assert(deskClick.x === 200 && deskClick.y === 400, "desktop click is 1:1 on a 1280×720 canvas");

console.log("c79 phone menu / tap copy / rail: ok");
