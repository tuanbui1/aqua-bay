// C143 — fish cruise in gentle S-curves, not straight lines.
// Fish used to cruise in near-straight lines at a steady pace. loop 143
// layers, at the ocean-fish integration step, a slow per-fish speed ebb
// (drift → glide) and a gentle vertical waver so mid-water fish trace
// organic up-down curves; the fish also noses into its swim velocity at
// draw time so the curve reads as swimming, not sliding. Per-fish phase
// desyncs the school; bottom crawlers (crab / octopus) skip the vertical
// waver. It runs only on the cruise / coast path (cruising flag) — the
// flee and locked paths keep their own straight velocity, so the catch
// feel is unchanged. (Runtime-verified: a pinned clownfish's vertical
// range reached ~115-180px with vy swinging positive↔negative.)
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

// ---- loop stamp bumped to 143, old stamp gone, no debug leftovers ----
assert(/Aqua Bay · loop 143/.test(src), "title/pause stamp is loop 143");
assert(!/Aqua Bay · loop 141"/.test(src), "loop 141 stamp is gone");
assert(!/Aqua Bay · loop 142"/.test(src), "no stray loop 142 stamp (that attempt was discarded)");
const stampCount = (src.match(/Aqua Bay · loop 143/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 143, got " + stampCount);
assert(!/__fishDbg|DBG cru=/.test(src), "no debug instrumentation left in the shipped code");

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 143 fish cruise in gentle S-curves/.test(src),
  "C143 names the straight-line fish");
assert(/loop 141 diver pitches into a real dive/.test(src),
  "loop 141 breadcrumb stays");
assert(!/loop 142/.test(src), "the discarded loop 142 left no breadcrumb");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- the waver lives at the integration step, gated to cruising fish ----
const upd = extractFn(src, "updateOceanFish") || "";
assert(upd, "updateOceanFish is extractable");
assert(/let cruising = !locked;/.test(upd),
  "a cruising flag defaults on for every non-locked fish");
assert(/} else if \(d < fleeR\) \{\s*\n\s*cruising = false;/.test(upd),
  "an actively fleeing fish is flagged not-cruising (its straight dash is kept)");
assert(/if \(cruising\) \{[\s\S]*?const ebb = 0\.9 \+ 0\.22 \* Math\.sin\(state\.time \* 0\.5 \+ f\.ph\);/.test(upd),
  "the swim curve only applies to cruising / coasting fish");
assert(/f\.vx \*= ebb;/.test(upd), "the ebb modulates horizontal speed (drift → glide)");
assert(/const bottomGait = sp\.gait === "scuttle" \|\| sp\.gait === "crawl";/.test(upd),
  "bottom crawlers are detected so they skip the vertical waver");
assert(/f\.vy = f\.vy \* ebb \+ \(bottomGait \? 0 : Math\.sin\(state\.time \* 1\.1 \+ f\.ph \* 2\.3\) \* sp\.cruise \* 0\.5\);/.test(upd),
  "a visible vertical waver traces the S-curve at the integration step");
// the ebb + waver run before the position integrates, so f.y actually moves
const cruiseBlockIdx = upd.indexOf("if (cruising) {");
const integrateIdx = upd.indexOf("f.x += f.vx * dt; f.y += f.vy * dt;", cruiseBlockIdx);
assert(cruiseBlockIdx > 0 && integrateIdx > cruiseBlockIdx,
  "the waver is applied before the fish position integrates");

// ---- the fish noses into its swim velocity at draw time (draw-only) ----
assert(/const velP = clamp\(Math\.atan2\(f\.vy, Math\.max\(1, Math\.abs\(f\.vx\)\)\), -0\.5, 0\.5\);/.test(src),
  "the draw angle derives a clamped velocity pitch");
assert(/dang = \(Math\.cos\(f\.ang\) < 0\) \? \(Math\.PI - velP\) : velP;/.test(src),
  "the fish noses into its velocity (facing kept, pitch from the S-curve)");
assert(/if \(f\.s !== 5 && f\.s !== 8 && f\.s !== 9\) \{/.test(src),
  "the velocity-nose is skipped for the top-down critters");

// ---- the catch/flee path is NOT touched by the waver ----
assert(/f\.vx = \(dx \/ d\) \* fleeSp \* boost;/.test(upd),
  "the flee branch still sets its own velocity");
assert(/applySpeciesGait\(f, dt, sp\)/.test(upd), "applySpeciesGait still drives the cruise gait");

// ---- numeric proof: gentle ebb + a clear, bounded S-curve waver, desynced ----
function cruise(gait, t, ph, cruiseSp, baseVx, baseVy) {
  const bottom = gait === "scuttle" || gait === "crawl";
  const ebb = 0.9 + 0.22 * Math.sin(t * 0.5 + ph);
  const vx = baseVx * ebb;
  const vy = baseVy * ebb + (bottom ? 0 : Math.sin(t * 1.1 + ph * 2.3) * cruiseSp * 0.5);
  return { ebb, vx, vy };
}
let eLo = 9, eHi = -9;
for (let k = 0; k < 400; k++) {
  const e = cruise("dart", k / 20, 0.7, 70, 60, 0).ebb;
  eLo = Math.min(eLo, e); eHi = Math.max(eHi, e);
}
assert(eLo > 0.66 && eHi < 1.13, "the speed ebb is gentle (~0.68–1.12), got " + eLo.toFixed(2) + "–" + eHi.toFixed(2));
let vyAmp = 0;
for (let k = 0; k < 400; k++) vyAmp = Math.max(vyAmp, Math.abs(cruise("glide", k / 20, 0.3, 70, 0, 0).vy));
assert(vyAmp > 70 * 0.5 * 0.85 && vyAmp < 70 * 0.5 * 1.15,
  "a clownfish (cruise 70) gets a clear vertical waver (~0.5·cruise), got " + vyAmp.toFixed(1));
for (let k = 0; k < 200; k++) {
  const c = cruise("scuttle", k / 20, 0.3, 70, 70, 5);
  assert(Math.abs(c.vy - 5 * c.ebb) < 1e-9, "a bottom crawler adds no vertical waver");
}
assert(Math.abs(cruise("dart", 3.1, 0.0, 70, 60, 0).vy - cruise("dart", 3.1, 2.0, 70, 60, 0).vy) > 1,
  "different per-fish phases desync the school");

// ---- regression guard: loops 131-141 still intact ----
assert(!/"SPACE  or  click  to  DIVE"/.test(src), "loop 131 — DIVE board label stays gone");
assert(/rgba\(6, 16, 22, 0\.86\)/.test(extractFn(src, "drawPause") || ""), "loop 131 — pause scrim stays");
assert(/shadowColor = "rgba\(4, 12, 18, 0\.85\)"/.test(extractFn(src, "drawSkinPicker") || ""), "loop 132 — title shadow stays");
assert(/ctx\.fillText\("SURFACE", OCEAN\.w \/ 2, 70\);/.test(src), "loop 133 — waterline SURFACE stays");
assert(/thumbCopy\(\) \? "BOAT \$35" : "Expedition \$35"/.test(src), "loop 134 — boat board stays");
assert(/return asymTurn \? flip \* ex : faceDrawX\(faceS, extraX\);/.test(extractFn(src, "drawPlayer") || ""), "loop 135 — flat dino walk stays");
assert(/flip \* \(1 \+ Math\.abs\(kickWave\) \* 0\.04\)/.test(extractFn(src, "drawDiver") || ""), "loop 136 — flat dino swim stays");
assert(/const showNeed = need > 0 && \(i === next \|\| \(hover && need > 0\)\);/.test(extractFn(src, "drawSpeciesStrip") || ""), "loop 137 — no-hover shortfall stays");
assert(/ctx\.moveTo\(11, 0\);/.test(extractFn(src, "drawStockWalkCue") || ""), "loop 138 — stock arrow stays");
assert(/if \(canBuy\) ctx\.globalAlpha \*= 0\.85 \+ 0\.15 \* Math\.sin\(state\.time \* 4\);/.test(extractFn(src, "drawMoneyReadout") || ""), "loop 139 — next-buy nudge stays");
assert(/const flip = topView \? 1 : \(Math\.cos\(ang\) < 0 \? -1 : 1\);/.test(extractFn(src, "drawFishBody") || ""), "loop 140 — fish orientation stays");
assert(/const pitch = clamp\(\(player\.pitch \|\| 0\) \* 1\.0 \+ headingPitch \+ kickWave \* 0\.05, -0\.9, 0\.9\);/.test(extractFn(src, "drawDiver") || ""), "loop 141 — diver dive angle stays");

console.log("c143 wavy swim paths: ok (stamps=" + stampCount +
  ", ebb=" + eLo.toFixed(2) + "-" + eHi.toFixed(2) + ", clownfish vyAmp~" + vyAmp.toFixed(0) +
  ", bottom no-waver, flee untouched, no debug, loop131-141Intact=true)");
