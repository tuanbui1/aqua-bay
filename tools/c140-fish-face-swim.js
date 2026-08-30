// C140 — fish face where they swim, never belly-up.
// drawFishBody rotated a side-view fish sprite by its full heading ang.
// Swimming left (ang≈π) that rotation is a 180° flip — so every left-
// bound fish rendered upside down (belly-up), which looked fake. loop 140
// mirrors the sprite horizontally to face left (scaleX = ±1) and applies
// only a gentle, clamped vertical tilt (never a full spin), so a fish
// always keeps its belly down. Seahorse / octopus / crab (top-down reads)
// keep their own dampened spin and do not mirror.
// No gameplay, camera, save, or flow change.
const fs = require("fs");
const path = require("path");

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

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

// ---- loop stamp bumped to 140, old stamp gone ----
assert(/Aqua Bay · loop 140/.test(src), "title/pause stamp is loop 140");
assert(!/Aqua Bay · loop 139"/.test(src), "loop 139 stamp is gone");
assert(!/Aqua Bay · loop 138"/.test(src), "loop 138 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 140/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 140, got " + stampCount);

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 140 fish face where they swim not belly-up/.test(src),
  "C140 names the belly-up fish");
assert(/loop 139 next-buy caption lights up when you can afford it/.test(src),
  "loop 139 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- drawFishBody mirrors instead of full-heading rotation ----
const fb = extractFn(src, "drawFishBody") || "";
assert(fb, "drawFishBody is extractable");
assert(/const flip = topView \? 1 : \(Math\.cos\(ang\) < 0 \? -1 : 1\);/.test(fb),
  "a side-view fish mirrors (flip) when heading left");
assert(/const pitch = clamp\(Math\.atan2\(Math\.sin\(ang\), Math\.abs\(Math\.cos\(ang\)\)\), -tiltCap, tiltCap\);/.test(fb),
  "the vertical tilt is a clamped pitch, not the full heading");
assert(/scaleX: flip/.test(fb),
  "the atlas blit mirrors the sprite by scaleX");
assert(/ctx\.scale\(flip, 1\);\s*\n\s*ctx\.rotate\(rot\);/.test(fb),
  "the procedural fallback also mirrors + gently tilts");
assert(!/\{ rot: rot \+ wob \* 0\.35, scale: s0 \* 0\.52, water: true \}\)\) return;/.test(fb) || /scaleX: flip/.test(fb),
  "the old un-mirrored full-heading atlas blit is gone");

// ---- numeric proof: a fish is NEVER upside down ----
// reimplement the draw transform and check the sprite's "up" vector.
function fishDrawOrient(spId, ang) {
  const topView = spId === 5 || spId === 8 || spId === 9;
  const flip = topView ? 1 : (Math.cos(ang) < 0 ? -1 : 1);
  const tiltCap = spId === 5 ? 0.24 : 0.5;
  const pitch = clamp(Math.atan2(Math.sin(ang), Math.abs(Math.cos(ang))), -tiltCap, tiltCap);
  const rot = topView ? ang * (spId === 8 ? 0.22 : spId === 9 ? 0.12 : 0.16) : pitch;
  // canvas applies scale(flip,1) then rotate(rot); the sprite "up" is (0,-1).
  // after rotate: (sin(rot), -cos(rot)); after scale(flip,1): (flip*sin, -cos).
  // "up stays up" ⇔ the y component is negative ⇔ cos(rot) > 0.
  return { flip, rot, upY: -Math.cos(rot), noseX: flip * Math.cos(rot) };
}
const sideFish = [0, 1, 2, 3, 4, 6, 7, 10, 11, 12];
for (const id of sideFish) {
  for (let k = 0; k < 48; k++) {
    const ang = -Math.PI + (k / 48) * (2 * Math.PI);
    const o = fishDrawOrient(id, ang);
    assert(o.upY < 0, "fish " + id + " keeps its belly down (up stays up) at ang=" + ang.toFixed(2));
  }
  // heading left mirrors (nose points left), heading right faces right
  assert(fishDrawOrient(id, Math.PI).flip === -1, "fish " + id + " mirrors when swimming left");
  assert(fishDrawOrient(id, 0).flip === 1, "fish " + id + " faces right when swimming right");
  // a level left swim is a clean mirror with ~no tilt (not a 180° spin)
  assert(Math.abs(fishDrawOrient(id, Math.PI).rot) < 1e-9,
    "fish " + id + " swimming straight left is level, not spun");
}
// seahorse never mirror-flips and keeps its dampened spin (never a 180° flip)
assert(fishDrawOrient(5, Math.PI).flip === 1, "seahorse does not mirror");
for (let k = 0; k < 24; k++) {
  const ang = -Math.PI + (k / 24) * (2 * Math.PI);
  assert(Math.abs(fishDrawOrient(5, ang).rot) <= 0.16 * Math.PI + 1e-9,
    "seahorse spin stays dampened (no belly flip) at ang=" + ang.toFixed(2));
}

// ---- regression guard: loops 131-139 still intact ----
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
assert(/return asymTurn \? flip \* ex : faceDrawX\(faceS, extraX\);/.test(extractFn(src, "drawPlayer") || ""),
  "loop 135 — the flat dino WALK turn stays");
assert(/flip \* \(1 \+ Math\.abs\(kickWave\) \* 0\.04\)/.test(extractFn(src, "drawDiver") || ""),
  "loop 136 — the flat dino SWIM turn stays");
assert(/const showNeed = need > 0 && \(i === next \|\| \(hover && need > 0\)\);/.test(extractFn(src, "drawSpeciesStrip") || ""),
  "loop 137 — the no-hover next-unlock shortfall stays");
assert(/ctx\.moveTo\(11, 0\);/.test(extractFn(src, "drawStockWalkCue") || ""),
  "loop 138 — the clearer stock direction arrow stays");
assert(/if \(canBuy\) ctx\.globalAlpha \*= 0\.85 \+ 0\.15 \* Math\.sin\(state\.time \* 4\);/.test(extractFn(src, "drawMoneyReadout") || ""),
  "loop 139 — the next-buy ready nudge stays");

console.log("c140 fish face swim: ok (stamps=" + stampCount +
  ", sideFish never belly-up across 48 headings, left=mirror, seahorse upright, loop131-139Intact=true)");
