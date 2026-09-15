// C169 — swim under the shallows manta for a lift.
// The ray stays uncatchable scenery. It never drops a bag fish.
// First-dive threats stay quiet; this is a wonder beat, not a sting.
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
assert(/loop 169 a manta glides the shallows/.test(src), "C169 names the feature");
assert(/loop 167 divers swim prone/.test(src), "loop 167 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");
assert(!/id: 14/.test(src), "no fifteenth catchable species");

const seed = extractFn(src, "seedOceanScenery") || "";
assert(/kind: "ray"/.test(seed), "the manta still seeds with the shallows pack");

const draft = extractFn(src, "rayDraft") || "";
assert(draft, "rayDraft is extractable");
assert(/d > 78/.test(draft), "the lift is a close pass under the manta");
assert(/player\.vx \+= \(s\.vx \|\| 0\) \* 0\.62/.test(draft),
  "the lift follows the manta heading");
assert(/"glide!"/.test(draft), "a glide! pop names the lift");
assert(!/dropLastBagCatch/.test(draft), "the manta never drops a catch");
assert(!/whoa!/.test(draft), "whoa! stays the sting / near-miss word");

const upd = extractFn(src, "updateOceanScenery") || "";
assert(/rayDraft\(s\)/.test(upd), "the ray tick offers a lift");
assert(/state\.rayDraftLock/.test(upd), "a cooldown keeps the lift from buzzing");

assert(/state\.rayShade/.test(src), "a shade sits under the diver during the lift");
assert(/A manta glides the shallows/.test(src), "help names the manta lift");
assert(/function sharkLegal\(/.test(src) && /divesThisSession \| 0\) >= 2/.test(src),
  "first-dive shark quiet stays");

console.log("c169 manta glide: ok (stamps=" + stampCount + ", v1.0, no IAP)");
