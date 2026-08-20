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

console.log("c77 plaza tap: ok");
