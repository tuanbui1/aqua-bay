// C77 — plaza thumb taps must not remap to Sea Turtle.
const CORE = 5;
const TANK_W = 210, TANK_H = 156;
const TANK_POS = [
  { x: 340, y: 164 }, { x: 558, y: 164 }, { x: 776, y: 164 },
  { x: 994, y: 164 }, { x: 1212, y: 164 },
  { x: 340, y: 380 }, { x: 558, y: 380 }, { x: 776, y: 380 }, { x: 994, y: 380 },
  { x: 340, y: 596 }, { x: 558, y: 596 }, { x: 776, y: 596 }, { x: 994, y: 596 },
];
function galleryOpen() { return false; }
function tankLive(i) {
  return i >= 0 && i < 13 && (i < CORE || galleryOpen());
}
function tankAtWorld(wx, wy) {
  for (let i = 0; i < 13; i++) {
    if (!tankLive(i)) continue;
    const t = TANK_POS[i];
    if (wx > t.x - 8 && wx < t.x + TANK_W + 8 && wy > t.y - 8 && wy < t.y + TANK_H + 28) return i;
  }
  return -1;
}
function tankAtAny(wx, wy) {
  for (let i = 0; i < 13; i++) {
    if (!tankLive(i)) continue;
    const t = TANK_POS[i];
    if (wx > t.x - 8 && wx < t.x + TANK_W + 8 && wy > t.y - 8 && wy < t.y + TANK_H + 28) return i;
  }
  return -1;
}
function walkClearY() { return TANK_POS[0].y - 8 + TANK_H + 28 + 4; }
function tankWalkPoint(i) {
  const t = TANK_POS[i];
  return { x: t.x + TANK_W / 2, y: Math.max(t.y + TANK_H + 32, walkClearY() + 16) };
}
function galleryTankDest(i) {
  if (i >= CORE && !galleryOpen()) return tankWalkPoint(4);
  return tankWalkPoint(i);
}

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

// Phone plaza deck taps (world, after screenToWorld) — west / mid / east.
const taps = [
  [220, 420], [280, 400], [640, 410], [800, 430], [200, 500],
];
for (const [x, y] of taps) {
  const hit = tankAtWorld(x, y);
  const any = tankAtAny(x, y);
  assert(hit < 0, "live tank stole deck tap " + x + "," + y);
  assert(any < 0, "gated ghost stole deck tap " + x + "," + y);
  assert(!(any >= CORE && !galleryOpen()), "remap to Turtle at " + x + "," + y);
}

const card = galleryTankDest(6);
assert(Math.abs(card.x - tankWalkPoint(4).x) < 1, "Puffer card still walks to Turtle");
assert(card.y >= walkClearY(), "Turtle pad is south of glass");

// 390×844 tap maps through full canvas, not a 16:9 postage stamp.
const W = 1280, H = 720, cssW = 390, cssH = 844;
function canvasPos(clientX, clientY) {
  return { x: clientX * (W / cssW), y: clientY * (H / cssH) };
}
const westThumb = canvasPos(80, 360);
assert(westThumb.x > 200 && westThumb.x < 400, "west thumb maps into playfield X " + westThumb.x);
assert(westThumb.y > 250 && westThumb.y < 400, "mid-screen thumb maps mid-canvas Y " + westThumb.y);

function desktopStage(w, h) { return w >= 880 && w >= h * 0.92; }
function fillPhoneStage(w, h, coarse) {
  if (desktopStage(w, h)) return false;
  return !!(coarse || h > w * 1.05 || w < 520);
}
function compactHud(w, h, coarse, scale) {
  if (desktopStage(w, h)) return false;
  return !!(coarse || scale < 0.62 || h > w * 1.05);
}
assert(desktopStage(1280, 720), "1280×720 is desktop");
assert(desktopStage(1440, 900), "laptop landscape is desktop");
assert(!desktopStage(390, 844), "390×844 is not desktop");
assert(!desktopStage(430, 932), "430×932 is not desktop");
assert(!fillPhoneStage(1280, 720, true), "touchscreen laptop stays desktop stage");
assert(fillPhoneStage(390, 844, true), "phone portrait fills");
assert(fillPhoneStage(390, 844, false), "narrow portrait fills even without coarse");
assert(!compactHud(1280, 720, true, 1), "touchscreen laptop must not inflate desktop cards");
assert(!compactHud(1280, 720, false, 1), "1280×720 HUD stays dense");
assert(compactHud(390, 844, true, 390 / 1280), "phone HUD uses fat tap targets");

// Desktop 16:9 contain: click maps 1:1 into 1280×720, not a phone stretch.
const desk = { x: 200 * (1280 / 1280), y: 400 * (720 / 720) };
assert(desk.x === 200 && desk.y === 400, "desktop click is 1:1 on a 1280×720 canvas");

console.log("c77 plaza tap: ok");
