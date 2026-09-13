// C163 — a reef shark patrols; a bump drops your last catch.
// First New Game dive stays quiet. After they have surfaced once
// (or a shop that already stocks), scenery shark patrols. Not a new
// catchable. Stamps stay v1.0.
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
assert(/loop 163 a reef shark patrols/.test(src), "C163 names the feature");
assert(/loop 162 fish cruise in gentle S-curves/.test(src), "loop 162 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");
assert(/const SKIN_IDS = \["skip", "reef", "dino", "ryan"\]/.test(src),
  "Ryan World stays a fourth picker id");
assert(!/id: 14/.test(src), "no fifteenth catchable species");

const legal = extractFn(src, "sharkLegal") || "";
assert(/divesThisSession \| 0\) >= 2/.test(legal),
  "a first-dive New Game does not spawn the shark");
assert(/didFirstStock/.test(legal), "a shop that already stocks can meet a shark");

const seed = extractFn(src, "seedOceanScenery") || "";
assert(/kind: "shark"/.test(seed), "seedOceanScenery can push a reef shark");
assert(/sharkLegal\(\)/.test(seed), "the shark only seeds when legal");

const bump = extractFn(src, "reefSharkBump") || "";
assert(bump, "reefSharkBump is extractable");
assert(/dropLastBagCatch\(\)/.test(bump), "a bump can drop the last bag fish");
assert(/clearScoop\("shark"\)/.test(bump), "a bump breaks the scoop without a second escaped! toast");
assert(/A reef shark bumped you/.test(bump), "the bump names the shark");

const drop = extractFn(src, "dropLastBagCatch") || "";
assert(/state\.bag\.pop\(\)/.test(drop), "the drop takes the last bag slot");
assert(/pushOceanFish/.test(drop), "the dropped fish returns to the water");

const upd = extractFn(src, "updateOceanScenery") || "";
assert(/s\.kind === "shark"/.test(upd), "the shark patrols in scenery update");
assert(/d < 52/.test(upd), "a close pass bumps");
assert(/reefSharkBump\(s\)/.test(upd), "the patrol calls the bump");

const paint = extractFn(src, "drawSceneryShark") || "";
assert(paint, "drawSceneryShark is extractable");
assert(/SHARK/.test(paint), "the shark wears a readable plate");
assert(/drawOceanScenery/.test(src) && /drawSceneryShark/.test(extractFn(src, "drawOceanScenery") || ""),
  "ocean scenery paints the shark");

assert(/After the first dive a reef shark patrols/.test(src), "help names the shark");
assert(/if \(cruising\) \{/.test(src), "loop 162 waver stays");

console.log("c163 reef shark: ok (stamps=" + stampCount + ", v1.0, first-dive quiet, no IAP)");
