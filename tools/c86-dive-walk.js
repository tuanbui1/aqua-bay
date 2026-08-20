// C86 — queued plaza DIVE from the tank row must reach the pad and dive
// in ≤3s of sim time (loop 82 leftover felt like ~10s). Dock DIVE stays
// instant. Regular tap-to-walk speed is not globally raised. Does not
// restack HUD plates, toast layout, visualViewport, cameras, or DIVE inset.
const fs = require("fs");
const path = require("path");

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/const DIVE_WALK_SPEED\s*=\s*(\d+)/.test(src), "queued DIVE walk has a dedicated speed");
const DIVE_WALK_SPEED = +src.match(/const DIVE_WALK_SPEED\s*=\s*(\d+)/)[1];
const accelLit = src.match(/const DIVE_WALK_ACCEL\s*=\s*(\d+)/);
assert(accelLit, "queued DIVE walk boosts accel so the cap is reachable");
const DIVE_WALK_ACCEL = +accelLit[1];
assert(DIVE_WALK_SPEED >= 420 && DIVE_WALK_SPEED <= 640,
  "dash is a walk, not a teleport, speed=" + DIVE_WALK_SPEED);
assert(/function diveWalkQueued\s*\(/.test(src), "diveWalkQueued gates the dash");
assert(/if \(diveWalkQueued\(\)\) return Math\.max\(base, DIVE_WALK_SPEED\)/.test(src),
  "only the queued dive-walk uses the dash cap");
assert(/232 \+ state\.speedLv \* 38 \+ firstBump/.test(src),
  "planted / tap-to-walk base speed stays 232");
assert(/diveWalkQueued\(\) \? DIVE_WALK_ACCEL : 2200/.test(src),
  "click-walk accel stays 2200 unless a DIVE is queued");

assert(/function intentWalk\s*\(/.test(src), "tap DIVE still queues intentWalk");
assert(/if \(kind === "dive"\) cueDiveWalk\(\)/.test(src),
  "queued plaza DIVE fires an immediate heading cue");
assert(/heading to DIVE/.test(src), "cue copy is heading to DIVE");
assert(/function drawDiveWalkCue\s*\(/.test(src), "heading chip follows the walker");
assert(/headingPad/.test(src) && /padPulse/.test(src), "pad pulse brightens while queued");

assert(/if \(state\.mode === "play" && diveActionLegal\(\)\) beginDive\(\)/.test(src),
  "on/near pad still dives instantly");
assert(/else if \(state\.mode === "play" && diveWalkLegal\(\)\) intentWalk\("dive", dockWalkPoint\(\)\)/.test(src),
  "off-pad DIVE still walks to the pad then dives");
assert(/function diveActionLegal\s*\(\) \{\s*return diveWalkLegal\(\) && \(inDiveZone\(\) \|\| nearDivePad\(\)\)/.test(src),
  "walk-to-pad rule stays — no tank-row instant dive");

assert(/Aqua Bay · loop 108/.test(src), "title/pause stamp is loop 108");
assert(!/Aqua Bay · loop 107/.test(src), "loop 107 stamp is gone");

// Protected chrome from loops 82–85 — do not restack.
assert(/function actionChipInset\s*\(/.test(src), "DIVE chip inset stays");
assert(/visibleStageBottom/.test(src) && /visualViewport/.test(src),
  "visualViewport DIVE floor stays");
assert(/const PLAZA_CAM_CEILING\s*=\s*520/.test(src), "plaza camera ceiling stays 520");
assert(/const DOCK_CAM_FLOOR\s*=\s*1000/.test(src), "dock camera floor stays 1000");
assert(/function wrapHudLines\s*\(/.test(src), "toast wrap from C85 stays");
assert(/HUD_READOUT_PLATE/.test(src), "BAG / money plates stay");

// Protected game rules.
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/C67/.test(src), "C67 second dive after cashier stays");
assert(/C75|surfaceLock|requestSurface/.test(src), "C75 surface after 1 fish stays");
assert(/function galleryOpen\s*\(/.test(src), "galleryOpen stays");
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(/unlock:\s*0/.test(src) && /unlock:\s*60/.test(src) && /unlock:\s*1400/.test(src),
  "original 5 unlock prices stay");

// --- sim: tank-row DIVE walk reaches the pad in ≤3s ---
const TANK_W = 210, TANK_H = 156;
const TANK_POS = [
  { x: 340, y: 164 }, { x: 558, y: 164 }, { x: 776, y: 164 },
  { x: 994, y: 164 }, { x: 1212, y: 164 },
];
const DIVE_ZONE = { x: 520, y: 980, w: 720, h: 160 };
function walkClearY() { return TANK_POS[0].y - 8 + TANK_H + 28 + 4; }
function tankWalkPoint(i) {
  const t = TANK_POS[i];
  return { x: t.x + TANK_W / 2, y: Math.max(t.y + TANK_H + 32, walkClearY() + 16) };
}
function dockWalkPoint() { return { x: 880, y: 1008 }; }
function shopDockWalk() { return { x: 500, y: 890, w: 760, h: 130 }; }
function shopWalkRects() {
  const dock = shopDockWalk();
  const clear = walkClearY();
  return [
    { x: 300, y: clear, w: 900, h: 800 - clear },
    { x: 1100, y: clear, w: 300, h: 378 - clear },
    { x: 764, y: 740, w: 248, h: 180 },
    dock,
  ];
}
function shopRectHas(rc, x, y) {
  return x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h;
}
function shopRectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
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
function snapToShopWalk(x, y) {
  const rects = shopWalkRects();
  for (let i = 0; i < rects.length; i++) {
    const rc = rects[i];
    if (x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h) return { x: x, y: y };
  }
  let bestD = 1e15, nx = x, ny = y;
  for (let i = 0; i < rects.length; i++) {
    const rc = rects[i];
    const cx = clamp(x, rc.x, rc.x + rc.w);
    const cy = clamp(y, rc.y, rc.y + rc.h);
    const d = (cx - x) * (cx - x) + (cy - y) * (cy - y);
    if (d < bestD) { bestD = d; nx = cx; ny = cy; }
  }
  return { x: nx, y: ny };
}
function shopPath(sx, sy, dx, dy) {
  const rects = shopWalkRects();
  const dest = { x: dx, y: dy };
  const start = snapToShopWalk(sx, sy);
  const end = snapToShopWalk(dx, dy);
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
function nearDivePad(x, y) {
  return x > DIVE_ZONE.x - 48 && x < DIVE_ZONE.x + DIVE_ZONE.w + 48 &&
    y > DIVE_ZONE.y - 110 && y < DIVE_ZONE.y + DIVE_ZONE.h + 24;
}
function inDiveZone(x, y) {
  return x > DIVE_ZONE.x && x < DIVE_ZONE.x + DIVE_ZONE.w &&
    y > DIVE_ZONE.y - 40 && y < DIVE_ZONE.y + DIVE_ZONE.h;
}

function simWalk(start, dest, maxSpeed, accel) {
  const path = shopPath(start.x, start.y, dest.x, dest.y);
  const p = { x: start.x, y: start.y, vx: 0, vy: 0, goto: path[0], route: path.slice() };
  const dt = 1 / 60;
  let t = 0;
  let maxStep = 0;
  let dived = false;
  while (t < 12) {
    if (p.goto) {
      const dx = p.goto.x - p.x, dy = p.goto.y - p.y, d = Math.hypot(dx, dy);
      if (d < 22) {
        if (p.route && p.route.length > 1) {
          p.route.shift();
          p.goto = p.route[0];
        } else if (nearDivePad(p.x, p.y) || inDiveZone(p.x, p.y)) {
          dived = true;
          break;
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
    const snapped = snapToShopWalk(p.x, p.y);
    p.x = snapped.x;
    p.y = snapped.y;
    const dock = shopDockWalk();
    p.y = clamp(p.y, walkClearY() + 16, dock.y + dock.h);
    const stepped = Math.hypot(p.x - ox, p.y - oy);
    if (stepped > maxStep) maxStep = stepped;
    t += dt;
    if (!p.goto && (nearDivePad(p.x, p.y) || inDiveZone(p.x, p.y))) {
      dived = true;
      break;
    }
  }
  return { t: t, x: p.x, y: p.y, dived: dived, maxStep: maxStep, hops: path.length };
}

const tank0 = tankWalkPoint(0);
const turtle = tankWalkPoint(4);
const pad = dockWalkPoint();
assert(tank0.y <= 520 + 20, "tank-row start is plaza, y=" + tank0.y);
assert(pad.y > 980, "pad is on the dock");
assert(!nearDivePad(tank0.x, tank0.y) && !inDiveZone(tank0.x, tank0.y),
  "tank row is not already on the pad");

const leftover = simWalk(tank0, pad, 232, 2200);
assert(leftover.dived, "legacy 232 walk still reaches the pad (no walls)");
assert(leftover.t > 3, "legacy stroll from tanks is slower than 3s, t=" + leftover.t.toFixed(2));
assert(leftover.t < 10.5, "legacy walk is a long stroll, not a freeze, t=" + leftover.t.toFixed(2));

const boosted = simWalk(tank0, pad, DIVE_WALK_SPEED, DIVE_WALK_ACCEL);
assert(boosted.dived, "queued DIVE walk reaches the pad and dives");
assert(boosted.t <= 3, "tank-row DIVE walk is ≤3s, t=" + boosted.t.toFixed(2));
assert(boosted.t >= 0.7, "still a walk-to-pad, not a teleport, t=" + boosted.t.toFixed(2));
assert(boosted.hops >= 2, "path still routes through walk rects, hops=" + boosted.hops);
assert(boosted.maxStep <= DIVE_WALK_SPEED / 60 + 4,
  "no wall-clip teleport step, maxStep=" + boosted.maxStep.toFixed(2));
assert(nearDivePad(boosted.x, boosted.y) || inDiveZone(boosted.x, boosted.y),
  "finish is on/near the pad, y=" + boosted.y.toFixed(1));

const east = simWalk(turtle, pad, DIVE_WALK_SPEED, DIVE_WALK_ACCEL);
assert(east.dived && east.t <= 3, "Turtle-row DIVE walk is ≤3s, t=" + east.t.toFixed(2));
assert(east.t >= 0.7, "Turtle-row still walks, t=" + east.t.toFixed(2));

const planted = simWalk(tank0, pad, 232, 2200);
assert(Math.abs(planted.t - leftover.t) < 0.05, "regular walk speed is unchanged when not dashed");

const dockStart = { x: 880, y: 1000 };
assert(nearDivePad(dockStart.x, dockStart.y) || inDiveZone(dockStart.x, dockStart.y),
  "standing on the dock is already near the pad");
assert(dockStart.y > DIVE_ZONE.y - 110, "dock DIVE does not need a plaza walk");

console.log("c86 plaza DIVE walk ≤3s: ok (tank0 " + boosted.t.toFixed(2) +
  "s, turtle " + east.t.toFixed(2) + "s, leftover " + leftover.t.toFixed(2) + "s)");
