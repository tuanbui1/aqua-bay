// C167 — divers swim prone: flutter kick, arms along the body.
// Atlas swim frames were a standing walk laid on its side.
// Stamps stay v1.0. Not a new catchable.
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
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 167 divers swim prone/.test(src), "C167 names the feature");
assert(/loop 165 the deep has worse teeth/.test(src), "loop 165 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");
assert(/const SKIN_IDS = \["skip", "reef", "dino", "ryan"\]/.test(src),
  "Ryan World stays a fourth picker id");
assert(!/id: 14/.test(src), "no fifteenth catchable species");

const dive = extractFn(src, "drawDiver") || "";
assert(dive, "drawDiver is extractable");
assert(!/blitGait\(skin, "swim"/.test(dive), "atlas swim frames are no longer the ocean pose");
assert((dive.match(/-1\.52/g) || []).length >= 2,
  "both arms reach forward along the heading (−1.52), not one forward / one back");
assert(/paintTrailFlipper/.test(dive), "flippers trail the flutter kick");
assert(/skin === "reef"/.test(dive) && /skin === "ryan"/.test(dive) && /skin === "dino"/.test(dive),
  "all four divers paint a prone swim");
assert(/function swimFoot\(/.test(src), "kick feet are placed from the hips");
assert(/Math\.sin\(player\.facing\) \* 0\.58/.test(src), "pitch follows the swim heading");
assert(/Divers swim prone/.test(src), "help names the prone swim");

console.log("c167 natural swim: ok (stamps=" + stampCount + ", v1.0, no IAP)");
