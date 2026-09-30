// C170 — deeper forever bands, pearl caches, depth records, deep catch fun.
"use strict";
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

assert(/Aqua Bay · v1\.0/.test(src), "stamps stay v1.0");
assert(/loop 170 deeper forever bands/.test(src), "C170 names the feature");
assert(/loop 169 divers walk \+ swim verified/.test(src), "loop 169 breadcrumb stays");
assert(/loop 168 pier stars/.test(src), "loop 168 breadcrumb stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/SPECIES\.length\s*=\s*15|species.*15th/i.test(src), "no 15th species");

assert(/Pressure garden/.test(src) && /Pearl sink/.test(src), "forever names expanded");
assert(/DEPTH_CACHE_PAY_BASE/.test(src), "pearl pay base");
assert(/deepestM/.test(src) && /depthCaches/.test(src), "depth save fields");
assert(/depthCombo/.test(src) && /DEPTH ×/.test(src), "depth combo juice");
assert(/sessionPearl/.test(src) && /sessionDepthRecord/.test(src), "session goal flags");

const helpers = [
  "depthCacheTarget", "openDepthCache", "noteDepthRecord", "drawDepthCache",
  "drawVisibleDepthCaches", "depthPayMult", "foreverLapAt", "isDepthCache",
];
for (const name of helpers) {
  assert(!!extractFn(src, name), name + " exists");
}

assert(/drawVisibleDepthCaches\(\)/.test(src), "ocean draws visible pearls");
assert(/Hold the cone on the depth pearl/.test(src), "goal cue for pearl");
assert(/Crack a depth pearl/.test(src), "TODAY pearl goal");
assert(/Set a depth record/.test(src), "TODAY record goal");
assert(/Swim past Whale road into forever zones/.test(src), "help names forever pearls");
assert(/Deep scoops stack a DEPTH combo/.test(src), "help names depth combo");

const hunt = extractFn(src, "huntScoopAllows") || "";
assert(/isDepthCache\(f\)/.test(hunt), "hunt allows depth pearls");
assert(!/isChestTarget\(f\) return !!state\.wreckChestReady/.test(hunt),
  "pearls are not gated on wreckChestReady");

const start = extractFn(src, "startScoopOnFish") || "";
assert(/isChestTarget\(f\)/.test(start), "full bag still scoops chest/pearl");

const climax = extractFn(src, "beginCatchClimax") || "";
assert(/isDepthCache\(f\)/.test(climax) && /openDepthCache/.test(climax),
  "climax opens depth pearl");

const nearest = extractFn(src, "nearestScoopFish") || "";
assert(/depthCacheTarget\(\)/.test(nearest), "cone nearest picks pearl");

const catchFn = extractFn(src, "catchFish") || "";
assert(/depthCombo/.test(catchFn) && /noteDepthRecord/.test(catchFn),
  "deep catch stacks combo + records depth");

// Pay / lap math mirrors (forever lap uses /8 like zoneAtDepth).
function foreverLapAt(band) {
  if (band < 8) return 0;
  return (((band - 8) / 8) | 0) + 1;
}
assert(foreverLapAt(7) === 0, "named bowls are not forever laps");
assert(foreverLapAt(8) === 1, "first forever lap");
assert(foreverLapAt(15) === 1, "still lap 1 within first 8 forever");
assert(foreverLapAt(16) === 2, "second forever lap");

const DEPTH_CACHE_PAY_BASE = 28;
function pearlPay(band) {
  const lap = band < 8 ? 1 : foreverLapAt(band);
  return DEPTH_CACHE_PAY_BASE + Math.min(90, band * 6 + lap * 10);
}
assert(pearlPay(0) === 38, "shallow named pearl pay");
assert(pearlPay(8) >= 80, "forever pearl pays more");
assert(pearlPay(20) === 28 + 90, "pay caps at +90");

function depthPayMult(band) {
  if (band < 8) return 1 + Math.min(0.2, (band + 1) * 0.025);
  const lap = foreverLapAt(band);
  return 1 + Math.min(0.55, 0.12 + lap * 0.08);
}
assert(depthPayMult(0) > 1, "named deep pay bump");
assert(depthPayMult(16) > depthPayMult(8), "deeper forever pays more");
assert(depthPayMult(40) <= 1.55, "pay mult caps");

console.log("c170 deeper fun: ok");
