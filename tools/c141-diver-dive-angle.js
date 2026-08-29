// C141 — diver pitches into a real dive, not always on his belly.
// The diver's body pitch was weighted to ~0.7 and clamped to ±0.48 rad
// (~27°), so descending or ascending he still read as swimming flat on
// his belly. loop 141 lets the vertical velocity pitch him fully: a
// descent reads head-down (~50°), an ascent head-up, while a level swim
// still lies prone (pitch≈0). Two constants: the wantPitch target range
// and the drawDiver pitch weight/clamp.
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

// ---- loop stamp bumped to 141, old stamp gone ----
assert(/Aqua Bay · loop 141/.test(src), "title/pause stamp is loop 141");
assert(!/Aqua Bay · loop 140"/.test(src), "loop 140 stamp is gone");
assert(!/Aqua Bay · loop 139"/.test(src), "loop 139 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 141/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 141, got " + stampCount);

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 141 diver pitches into a real dive/.test(src),
  "C141 names the always-on-his-belly diver");
assert(/loop 140 fish face where they swim not belly-up/.test(src),
  "loop 140 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- the pitch target range and the draw weight/clamp both opened up ----
assert(/const wantPitch = ocean \? clamp\(player\.vy \/ 120, -0\.85, 0\.85\) : 0;/.test(src),
  "the vertical-velocity pitch target range is wider (vy/120, ±0.85)");
assert(!/clamp\(player\.vy \/ 160, -0\.55, 0\.55\)/.test(src),
  "the old shallow ±0.55 pitch target is gone");
const dd = extractFn(src, "drawDiver") || "";
assert(dd, "drawDiver is extractable");
assert(/const pitch = clamp\(\(player\.pitch \|\| 0\) \* 1\.0 \+ headingPitch \+ kickWave \* 0\.05, -0\.9, 0\.9\);/.test(dd),
  "the drawDiver pitch is weighted fully and clamped to ±0.9");
assert(!/-0\.48, 0\.48\)/.test(dd),
  "the old ±0.48 diver pitch clamp is gone");

// ---- numeric proof: real dive angle, level stays prone ----
function diverPitch(playerPitch, ang, kickWave) {
  const headingPitch = Math.sin(ang) * 0.38;
  return clamp((playerPitch || 0) * 1.0 + headingPitch + kickWave * 0.05, -0.9, 0.9);
}
function oldDiverPitch(playerPitch, ang, kickWave) {
  const headingPitch = Math.sin(ang) * 0.38;
  return clamp((playerPitch || 0) * 0.7 + headingPitch + kickWave * 0.05, -0.48, 0.48);
}
// a fast descent (player.pitch settled near the +0.85 target) reads head-down (>= ~45°)
const diveNow = diverPitch(0.85, 0, 0);
assert(diveNow >= 0.78, "a descent now pitches the diver clearly head-down, got " + diveNow.toFixed(2));
assert(diveNow > oldDiverPitch(0.55, 0, 0) + 0.25,
  "the new dive angle is meaningfully steeper than before");
// a fast ascent reads head-up
assert(diverPitch(-0.85, 0, 0) <= -0.78, "an ascent now pitches the diver head-up");
// a level swim (no vertical velocity, horizontal heading) still lies prone
assert(Math.abs(diverPitch(0, 0, 0)) < 1e-9, "a level swim stays prone (belly-down) at pitch 0");
assert(Math.abs(diverPitch(0, Math.PI, 0)) < 1e-9, "swimming straight left is still level");

// ---- regression guard: loops 131-140 still intact ----
assert(!/"SPACE  or  click  to  DIVE"/.test(src), "loop 131 — DIVE board label stays gone");
assert(/rgba\(6, 16, 22, 0\.86\)/.test(extractFn(src, "drawPause") || ""),
  "loop 131 — the opaque pause scrim stays");
assert(/shadowColor = "rgba\(4, 12, 18, 0\.85\)"/.test(extractFn(src, "drawSkinPicker") || ""),
  "loop 132 — the title header shadow stays");
assert(/ctx\.fillText\("SURFACE", OCEAN\.w \/ 2, 70\);/.test(src),
  "loop 133 — the waterline marker stays SURFACE");
assert(/thumbCopy\(\) \? "BOAT \$35" : "Expedition \$35"/.test(src),
  "loop 134 — the boat board stays a labelled button");
assert(/return asymTurn \? flip \* ex : faceDrawX\(faceS, extraX\);/.test(extractFn(src, "drawPlayer") || ""),
  "loop 135 — the flat dino WALK turn stays");
assert(/flip \* \(1 \+ Math\.abs\(kickWave\) \* 0\.04\)/.test(dd),
  "loop 136 — the flat dino SWIM turn stays");
assert(/const showNeed = need > 0 && \(i === next \|\| \(hover && need > 0\)\);/.test(extractFn(src, "drawSpeciesStrip") || ""),
  "loop 137 — the no-hover next-unlock shortfall stays");
assert(/ctx\.moveTo\(11, 0\);/.test(extractFn(src, "drawStockWalkCue") || ""),
  "loop 138 — the clearer stock direction arrow stays");
assert(/if \(canBuy\) ctx\.globalAlpha \*= 0\.85 \+ 0\.15 \* Math\.sin\(state\.time \* 4\);/.test(extractFn(src, "drawMoneyReadout") || ""),
  "loop 139 — the next-buy ready nudge stays");
assert(/const flip = topView \? 1 : \(Math\.cos\(ang\) < 0 \? -1 : 1\);/.test(extractFn(src, "drawFishBody") || ""),
  "loop 140 — the fish face-where-they-swim mirror stays");

console.log("c141 diver dive angle: ok (stamps=" + stampCount +
  ", descent=" + diveNow.toFixed(2) + " rad head-down, level=prone, loop131-140Intact=true)");
