// C135 — dino turns flat, not a paper flip.
// loop 123 stopped the through-zero squash for a body turn (faceDrawX
// floors width at ~0.62), but a turn is still a horizontal MIRROR. The
// dino's floatie / snorkel / mask sit on one side, so mirroring swaps
// them across the body at the thin midpoint — which reads as a paper
// card flip. Reef / Skip are front-symmetric so their mirror is subtle.
// loop 135 draws the asymmetric dino turn FLAT: full width, sign only,
// no yaw squash / twist. Reef / Skip keep the loop 123 yaw turn.
// Stacked on loops 131-134; this also guards those stayed put.
// No gameplay, camera, save, or flow change.
const fs = require("fs");
const path = require("path");

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

function extractFn(src, name) {
  const needle = "function " + name;
  let i = 0;
  while (i < src.length) {
    const at = src.indexOf(needle, i);
    if (at < 0) return null;
    const before = at === 0 ? " " : src[at - 1];
    if (/[\s;{}()]/.test(before)) {
      const paren = src.indexOf("(", at + needle.length);
      const brace = src.indexOf("{", paren);
      if (brace < 0) return null;
      let depth = 0;
      for (let j = brace; j < src.length; j++) {
        if (src[j] === "{") depth++;
        else if (src[j] === "}") {
          depth--;
          if (depth === 0) return src.slice(at, j + 1);
        }
      }
    }
    i = at + needle.length;
  }
  return null;
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

// ---- loop stamp bumped to 135, old stamp gone ----
assert(/Aqua Bay · loop 135/.test(src), "title/pause stamp is loop 135");
assert(!/Aqua Bay · loop 134"/.test(src), "loop 134 stamp is gone");
assert(!/Aqua Bay · loop 133"/.test(src), "loop 133 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 135/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 135, got " + stampCount);

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 135 dino turns flat not a paper flip/.test(src),
  "C135 names the dino paper-flip");
assert(/loop 134 one BOAT cue on the action board/.test(src),
  "loop 134 breadcrumb stays in the history");
assert(/loop 123 body turn not paper flip/.test(src),
  "loop 123 breadcrumb (the origin of faceDrawX) stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- drawPlayer special-cases the asymmetric dino turn ----
const dp = extractFn(src, "drawPlayer") || "";
assert(dp, "drawPlayer is extractable");
assert(/const asymTurn = skin === "dino";/.test(dp),
  "the asymmetric-mascot turn is gated on the dino skin");
assert(/const turnThinDraw = asymTurn \? 0 : turnThin;/.test(dp),
  "the dino turn zeroes the draw-time yaw thinning");
assert(/const yawTwist = turnThinDraw \* 0\.16;/.test(dp),
  "the yaw twist follows turnThinDraw (0 for dino)");
assert(/return asymTurn \? flip \* ex : faceDrawX\(faceS, extraX\);/.test(dp),
  "turnScaleX mirrors flat for dino, faceDrawX for reef / skip");
// reef / skip still route their walk / stand blit through the yaw turn
assert(/scaleX: turnScaleX\(squashX\)/.test(dp),
  "the moving blit uses turnScaleX");
assert((dp.match(/scaleX: turnScaleX\(\)/g) || []).length >= 3,
  "the card / stand / dino-walk0 blits use turnScaleX");
assert(!/scaleX: faceDrawX\(faceS, squashX\)/.test(dp),
  "the raw faceDrawX walk scaleX is now routed through turnScaleX");

// ---- numeric proof: dino never thins, reef still yaws ----
function faceDrawX(faceS, extraX) {
  const flip = faceS < 0 ? -1 : 1;
  const yaw = 1 - Math.abs(faceS);
  const body = 1 - yaw * 0.38;
  return flip * body * (extraX == null ? 1 : extraX);
}
function turnScaleX(asymTurn, faceS, extraX) {
  const flip = faceS < 0 ? -1 : 1;
  const ex = extraX == null ? 1 : extraX;
  return asymTurn ? flip * ex : faceDrawX(faceS, extraX);
}
// dino: magnitude is always full width (1), never the 0.62 squash
for (let i = 0; i <= 40; i++) {
  const s = -1 + i / 20;
  const x = turnScaleX(true, s);
  assert(Math.abs(Math.abs(x) - 1) < 1e-9,
    "dino turn stays full width (no squash), got " + x + " at faceS=" + s);
}
// dino still mirrors by sign across the turn
assert(turnScaleX(true, 1) === 1 && turnScaleX(true, -1) === -1,
  "dino still faces both ways (sign mirror)");
// reef / skip keep the loop 123 yaw: thins to 0.62 at the midpoint
assert(Math.abs(turnScaleX(false, 0) - 0.62) < 1e-9,
  "reef / skip still thin to 0.62 mid-turn (loop 123 intact)");
assert(Math.abs(turnScaleX(false, 1) - 1) < 1e-9,
  "reef / skip settle to full width when facing");

// ---- regression guard: loops 131-134 still intact ----
assert(!/"SPACE  or  click  to  DIVE"/.test(src),
  "loop 131 — verbose DIVE board label stays gone");
assert(/rgba\(6, 16, 22, 0\.86\)/.test(extractFn(src, "drawPause") || ""),
  "loop 131 — the opaque 0.86 pause scrim stays");
assert(/shadowColor = "rgba\(4, 12, 18, 0\.85\)"/.test(extractFn(src, "drawSkinPicker") || ""),
  "loop 132 — the readable title header shadow stays");
assert(/ctx\.fillText\("SURFACE", OCEAN\.w \/ 2, 70\);/.test(src),
  "loop 133 — the waterline marker stays just SURFACE");
assert(/thumbCopy\(\) \? "BOAT \$35" : "Expedition \$35"/.test(src),
  "loop 134 — the boat board stays a plain labelled button");

console.log("c135 dino flat turn: ok (stamps=" + stampCount +
  ", dinoScaleX=|1| always, reefMidTurn=0.62, loop123+131-134Intact=true)");
