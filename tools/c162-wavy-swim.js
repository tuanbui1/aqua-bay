// C162 — fish cruise in gentle S-curves, not straight lines.
// Ports the unmerged loop-143 swim curve onto current main: at the
// ocean-fish integration step, cruising fish get a slow speed ebb
// (drift → glide) and a gentle vertical waver; they also nose into
// swim velocity at draw time. Bottom crawlers skip the waver. Flee /
// locked paths keep their own velocity. Stamps stay v1.0.
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
        else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(at, j + 1); }
      }
    }
    i = at + needle.length;
  }
  return null;
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/Aqua Bay · v1\.0/.test(src), "title/pause stamp is still v1.0");
assert(!/Aqua Bay · loop 16[0-9]"/.test(src), "loop-number stamps stay gone");
assert(!/Aqua Bay · loop 143"/.test(src), "do not restore the old loop 143 stamp");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 162 fish cruise in gentle S-curves/.test(src), "C162 names the feature");
assert(/loop 161 Ryan World is a fourth diver/.test(src), "loop 161 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");
assert(/const SKIN_IDS = \["skip", "reef", "dino", "ryan"\]/.test(src),
  "Ryan World stays a fourth picker id");

const upd = extractFn(src, "updateOceanFish") || "";
assert(upd, "updateOceanFish is extractable");
assert(/let cruising = !locked;/.test(upd),
  "a cruising flag defaults on for every non-locked fish");
assert(/} else if \(d < fleeR\) \{\s*\n\s*cruising = false;/.test(upd),
  "an actively fleeing fish is flagged not-cruising");
assert(/if \(cruising\) \{[\s\S]*?const ebb = 0\.9 \+ 0\.22 \* Math\.sin\(state\.time \* 0\.5 \+ f\.ph\);/.test(upd),
  "the swim curve only applies to cruising / coasting fish");
assert(/f\.vx \*= ebb;/.test(upd), "the ebb modulates horizontal speed");
assert(/const bottomGait = sp\.gait === "scuttle" \|\| sp\.gait === "crawl";/.test(upd),
  "bottom crawlers skip the vertical waver");
assert(/f\.vy = f\.vy \* ebb \+ \(bottomGait \? 0 : Math\.sin\(state\.time \* 1\.1 \+ f\.ph \* 2\.3\) \* sp\.cruise \* 0\.5\);/.test(upd),
  "a visible vertical waver traces the S-curve at the integration step");
const cruiseBlockIdx = upd.indexOf("if (cruising) {");
const integrateIdx = upd.indexOf("f.x += f.vx * dt; f.y += f.vy * dt;", cruiseBlockIdx);
assert(cruiseBlockIdx > 0 && integrateIdx > cruiseBlockIdx,
  "the waver is applied before the fish position integrates");

assert(/const velP = clamp\(Math\.atan2\(f\.vy, Math\.max\(1, Math\.abs\(f\.vx\)\)\), -0\.5, 0\.5\);/.test(src),
  "the draw angle derives a clamped velocity pitch");
assert(/dang = \(Math\.cos\(f\.ang\) < 0\) \? \(Math\.PI - velP\) : velP;/.test(src),
  "the fish noses into its velocity");
assert(/if \(f\.s !== 5 && f\.s !== 8 && f\.s !== 9\) \{/.test(src),
  "the velocity-nose is skipped for the top-down critters");

assert(/f\.vx = \(dx \/ d\) \* fleeSp \* boost;/.test(upd),
  "the flee branch still sets its own velocity");
assert(/applySpeciesGait\(f, dt, sp\)/.test(upd), "applySpeciesGait still drives the cruise gait");

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

const fb = extractFn(src, "drawFishBody") || "";
assert(/const flip = topView \? 1 : \(Math\.cos\(ang\) < 0 \? -1 : 1\);/.test(fb),
  "loop 140 — side-view fish still mirror when heading left");
assert(/const pitch = clamp\(Math\.atan2\(Math\.sin\(ang\), Math\.abs\(Math\.cos\(ang\)\)\), -tiltCap, tiltCap\);/.test(fb),
  "loop 140 — vertical tilt stays a clamped pitch");
assert(/const pitch = clamp\(\(player\.pitch \|\| 0\) \* 1\.0 \+ headingPitch \+ kickWave \* 0\.05, -0\.9, 0\.9\);/.test(extractFn(src, "drawDiver") || ""),
  "loop 141 — diver dive angle stays");

console.log("c162 wavy swim: ok (stamps=" + stampCount +
  ", v1.0, ebb=" + eLo.toFixed(2) + "-" + eHi.toFixed(2) +
  ", clownfish vyAmp~" + vyAmp.toFixed(0) + ", no IAP)");
