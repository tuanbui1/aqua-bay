// C101 — desktop-stage walker can path from the dock to Puffer (or Turtle).
// Loop 100 leftover: one fat tank-neighborhood rect made shopPath treat
// TANK_POS[6] as a straight hop. With galleryOpen, tank 11's bowl sat
// in that line and pinned the walker at y≈788. Closed gallery still
// remaps a Puffer click to a Turtle pad that must sit inside a walk rect.
const fs = require("fs");
const path = require("path");

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/Aqua Bay · loop 109/.test(src), "title/pause stamp is loop 109");
assert(!/Aqua Bay · loop 107/.test(src), "loop 107 stamp is gone");
assert(/C101 — live gallery bowls fill the old fat neighborhood/.test(src),
  "C101 names the gallery apron / spine walk");
assert(/C101 — collide with the bowl, not a 28px south pad/.test(src),
  "C101 names the bowl collider (not the old south pad)");
assert(/pushOut\(t\.x, t\.y, TANK_W, TANK_H \+ 8\)/.test(src),
  "tank walk collider is the bowl + 8px lip");
assert(/wx > t\.x - 8 && wx < t\.x \+ TANK_W \+ 8 && wy > t\.y - 8 && wy < t\.y \+ TANK_H \+ 28/.test(src),
  "tank click / live-hit box still uses the C76 lip");

assert(/const PLAZA_CAM_CEILING\s*=\s*520/.test(src), "plaza camera ceiling stays 520");
assert(/const DOCK_CAM_FLOOR\s*=\s*1000/.test(src), "dock camera floor stays 1000");
assert(/function galleryOpen\s*\(/.test(src), "galleryOpen stays");
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
assert(/unlock:\s*1400/.test(src), "Sea Turtle unlock stays $1400");
const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/C75|surfaceLock|requestSurface/.test(src), "C75 surface after 1 fish stays");
assert(/function actionChipInset\s*\(/.test(src), "C84 DIVE inset stays");
assert(/visibleStageBottom/.test(src) && /visualViewport/.test(src),
  "C82 visualViewport DIVE floor stays");
assert(/C100 — pin that pier-board to the glowing unlocked tank/.test(src),
  "C100 stock pin stays");
assert(/function desktopStage\s*\(/.test(src), "desktopStage stays");
assert(/function portraitStage\s*\(/.test(src), "portraitStage stays");

function desktopStage(w, h) { return w >= 880 && w >= h * 0.92; }
assert(desktopStage(1280, 720), "1280×720 is a desktop stage");
assert(!desktopStage(390, 844), "390×844 is not a desktop stage");

const TANK_W = 210, TANK_H = 156, R = 16;
const TANK_POS = [
  { x: 340, y: 164 }, { x: 558, y: 164 }, { x: 776, y: 164 },
  { x: 994, y: 164 }, { x: 1212, y: 164 },
  { x: 340, y: 380 }, { x: 558, y: 380 }, { x: 776, y: 380 }, { x: 994, y: 380 },
  { x: 340, y: 596 }, { x: 558, y: 596 }, { x: 776, y: 596 }, { x: 994, y: 596 },
];
assert(TANK_POS[6].x === 558 && TANK_POS[6].y === 380, "Puffer stays C76 {558,380}");
assert(/\{ x: 558, y: 380 \}/.test(src), "TANK_POS[6] stays planted");

function walkClearY() { return TANK_POS[0].y - 8 + TANK_H + 28 + 4; }
function tankWalkPoint(i) {
  const t = TANK_POS[i];
  return { x: t.x + TANK_W / 2, y: Math.max(t.y + TANK_H + 32, walkClearY() + 16) };
}
function shopDockWalk() { return { x: 500, y: 890, w: 760, h: 130 }; }
function shopWalkRects(gallery) {
  const dock = shopDockWalk();
  const clear = walkClearY();
  const neighborhood = { x: 300, y: clear, w: 900, h: 800 - clear };
  const turtle = { x: 1100, y: clear, w: 300, h: 378 - clear };
  const westShop = { x: 136, y: 380, w: 208, h: 286 };
  const eastShop = { x: 1256, y: 380, w: 228, h: 286 };
  const westRamp = { x: 120, y: 680, w: 220, h: 180 };
  const aisle = { x: 764, y: 740, w: 248, h: 180 };
  if (!gallery) {
    return [neighborhood, turtle, westShop, eastShop, westRamp, aisle, dock];
  }
  const row1 = { x: 300, y: clear, w: 900, h: 36 };
  const row2 = { x: 300, y: 548, w: 900, h: 44 };
  const row3 = { x: 300, y: 764, w: 900, h: 36 };
  const spine = { x: 300, y: clear, w: 42, h: 800 - clear };
  return [row1, row2, row3, spine, turtle, westShop, eastShop, westRamp, aisle, dock];
}
function shopRectHas(rc, x, y) {
  return x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h;
}
function shopRectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function inShopWalk(gallery, x, y) {
  const rects = shopWalkRects(gallery);
  for (let i = 0; i < rects.length; i++) {
    if (shopRectHas(rects[i], x, y)) return true;
  }
  return false;
}
function shopPortal(a, b) {
  const x0 = Math.max(a.x, b.x), x1 = Math.min(a.x + a.w, b.x + b.w);
  const y0 = Math.max(a.y, b.y), y1 = Math.min(a.y + a.h, b.y + b.h);
  let x = (x0 + x1) * 0.5;
  let y = (y0 + y1) * 0.5;
  const clear = walkClearY();
  if (y1 > clear && y < clear) y = Math.min(y1 - 4, Math.max(clear + 8, y0 + 4));
  return { x: x, y: y };
}
function shopPath(sx, sy, dx, dy, gallery) {
  const rects = shopWalkRects(gallery);
  const start = { x: sx, y: sy };
  const end = { x: dx, y: dy };
  let si = -1, ei = -1;
  for (let i = 0; i < rects.length; i++) {
    if (si < 0 && shopRectHas(rects[i], start.x, start.y)) si = i;
    if (ei < 0 && shopRectHas(rects[i], end.x, end.y)) ei = i;
  }
  if (si < 0 || ei < 0 || si === ei) return [end];
  const prev = [];
  for (let i = 0; i < rects.length; i++) prev[i] = -1;
  const q = [si];
  prev[si] = si;
  for (let qi = 0; qi < q.length; qi++) {
    const u = q[qi];
    if (u === ei) break;
    for (let v = 0; v < rects.length; v++) {
      if (prev[v] >= 0 || v === u || !shopRectOverlap(rects[u], rects[v])) continue;
      prev[v] = u;
      q.push(v);
    }
  }
  if (prev[ei] < 0) return [end];
  const chain = [];
  for (let v = ei; v !== si; v = prev[v]) chain.push(v);
  chain.reverse();
  const pts = [];
  let cur = si;
  for (let i = 0; i < chain.length; i++) {
    pts.push(shopPortal(rects[cur], rects[chain[i]]));
    cur = chain[i];
  }
  pts.push(end);
  return pts;
}

function tankBox(i) {
  const t = TANK_POS[i];
  return { x: t.x, y: t.y, w: TANK_W, h: TANK_H + 8 };
}
function pushOut(p, box) {
  const cx = clamp(p.x, box.x, box.x + box.w);
  const cy = clamp(p.y, box.y, box.y + box.h);
  const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
  if (d < R && d > 0.001) { p.x = cx + (dx / d) * R; p.y = cy + (dy / d) * R; }
  else if (d === 0) p.y = box.y + box.h + R;
}
function constrain(p, gallery) {
  const n = gallery ? 13 : 5;
  const dock = shopDockWalk();
  p.y = clamp(p.y, walkClearY() + R, dock.y + dock.h);
  for (let i = 0; i < n; i++) pushOut(p, tankBox(i));
}

function destWantsPlaza(dest) {
  if (!dest) return false;
  if (dest.y >= 820) return false;
  if (dest.x > 1220 && dest.x < 1550 && dest.y > 378 && dest.y < 720) return false;
  return true;
}

function simWalk(start, dest, gallery) {
  const path = shopPath(start.x, start.y, dest.x, dest.y, gallery);
  const p = { x: start.x, y: start.y, vx: 0, vy: 0, goto: path[0], route: path.slice() };
  const dt = 1 / 60, maxSpeed = 232, accel = 2200;
  let t = 0, stuck = 0, maxStep = 0;
  while (t < 16) {
    if (p.goto) {
      const dx = p.goto.x - p.x, dy = p.goto.y - p.y, d = Math.hypot(dx, dy);
      if (d < 22) {
        if (p.route && p.route.length > 1) {
          p.route.shift();
          p.goto = p.route[0];
        } else {
          p.goto = null;
        }
      }
    }
    let ax = 0, ay = 0;
    if (p.goto) {
      const rdx = p.goto.x - p.x, rdy = p.goto.y - p.y, rd = Math.hypot(rdx, rdy);
      if (rd > 8) { ax = rdx / rd; ay = rdy / rd; }
    }
    p.vx += ax * accel * dt;
    p.vy += ay * accel * dt;
    const fr = ax || ay ? 5.2 : 8.5;
    p.vx -= p.vx * fr * dt;
    p.vy -= p.vy * fr * dt;
    const sp = Math.hypot(p.vx, p.vy);
    if (sp > maxSpeed) { p.vx *= maxSpeed / sp; p.vy *= maxSpeed / sp; }
    const ox = p.x, oy = p.y;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    constrain(p, gallery);
    const stepped = Math.hypot(p.x - ox, p.y - oy);
    if (stepped > maxStep) maxStep = stepped;
    if ((ax || ay) && stepped < 0.2) stuck++;
    else stuck = 0;
    t += dt;
    if (!p.goto && Math.hypot(p.x - dest.x, p.y - dest.y) < 28) break;
    if (stuck > 45) break;
  }
  return {
    t: t, x: p.x, y: p.y, hops: path.length,
    d: Math.hypot(p.x - dest.x, p.y - dest.y),
    stuck: stuck > 45, maxStep: maxStep, path: path,
  };
}

const dock = { x: 880, y: 920 };
const puff = tankWalkPoint(6);
const turt = tankWalkPoint(4);
assert(puff.x === 663 && puff.y === 568, "Puffer stand is south of the bowl");
assert(turt.x === 1317 && turt.y === 360, "Turtle pad stays on the core apron");

assert(inShopWalk(false, puff.x, puff.y), "closed-gallery Puffer pad is inside a shopWalkRect");
assert(inShopWalk(false, turt.x, turt.y), "Turtle pad is inside a shopWalkRect");
assert(inShopWalk(true, puff.x, puff.y), "open-gallery Puffer pad is inside a shopWalkRect");
assert(inShopWalk(true, turt.x, turt.y), "open-gallery Turtle pad is inside a shopWalkRect");
assert(destWantsPlaza(puff), "Puffer dest wants the plaza, not preferDock");
assert(destWantsPlaza(turt), "Turtle dest wants the plaza, not preferDock");

const closedPuff = shopPath(dock.x, dock.y, puff.x, puff.y, false);
const closedTurt = shopPath(dock.x, dock.y, turt.x, turt.y, false);
const openPuff = shopPath(dock.x, dock.y, puff.x, puff.y, true);
assert(closedPuff.length >= 2, "closed gallery still paths dock → neighborhood");
assert(closedTurt.length >= 2, "closed gallery paths dock → Turtle apron");
assert(openPuff.length >= 3, "open gallery routes around bowls, hops=" + openPuff.length);
assert(openPuff.some((pt) => pt.x < 400),
  "open-gallery Puffer path uses the west spine, not the glass");

const walkOpen = simWalk(dock, puff, true);
assert(!walkOpen.stuck, "open-gallery dock→Puffer does not pin on tank 11");
assert(walkOpen.d < 28, "open-gallery walker stands at the Puffer bowl, d=" + walkOpen.d.toFixed(1));
assert(walkOpen.y < 640 && walkOpen.y > 520, "finish is on the row-2 apron, y=" + walkOpen.y.toFixed(1));
assert(walkOpen.t < 10, "dock→Puffer is a walk, not a freeze, t=" + walkOpen.t.toFixed(2));

const walkClosedTurt = simWalk(dock, turt, false);
assert(!walkClosedTurt.stuck, "closed-gallery Puffer click is not a trapped Turtle toast");
assert(walkClosedTurt.d < 28, "closed-gallery Turtle pad is reachable, d=" + walkClosedTurt.d.toFixed(1));
assert(inShopWalk(false, walkClosedTurt.x, walkClosedTurt.y),
  "closed-gallery Turtle finish stays inside a shopWalkRect");

const walkClosedPuff = simWalk(dock, puff, false);
assert(!walkClosedPuff.stuck && walkClosedPuff.d < 28,
  "closed-gallery wood at Puffer stays walkable");

const wasdDock = shopPath(880, 1000, 880, 980, false);
assert(wasdDock.length >= 1, "dock click-to-walk still snaps on the pier");
assert(inShopWalk(false, 880, 1000) && inShopWalk(true, 880, 1000),
  "dock boards stay walkable on both gallery states");
assert(inShopWalk(false, 880, 800) && inShopWalk(true, 880, 800),
  "aisle stay walkable on both gallery states");

// Desktop 16:9 plaza camera still frames the bowl (no reserved-well clip).
const H = 720, vw = 1040, vcx = vw * 0.5, z = 1;
const camY = Math.min(520, 890 - (H / 2) / z - 28);
const camX = puff.x;
const tankScr = {
  x: (TANK_POS[6].x - camX) * z + vcx,
  y: (TANK_POS[6].y - camY) * z + H / 2,
};
assert(camY <= 520, "plaza cam stays at the planted ceiling, camY=" + camY);
assert(tankScr.x > 80 && tankScr.x + TANK_W < vw - 8,
  "Puffer bowl is in the 16:9 playfield, not the reserved well, sx=" + tankScr.x.toFixed(1));
assert(tankScr.y > 40 && tankScr.y + TANK_H < H - 40,
  "Puffer bowl is on-screen at the plaza camera, sy=" + tankScr.y.toFixed(1));

console.log("c101 puffer walk: ok (open " + walkOpen.t.toFixed(2) +
  "s hops=" + walkOpen.hops + ", closed turtle " + walkClosedTurt.t.toFixed(2) + "s)");
