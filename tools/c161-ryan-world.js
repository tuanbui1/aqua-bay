// C161 — Ryan World is a fourth playable diver on the title picker.
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
assert(!/Aqua Bay · loop 16[01]"/.test(src), "loop-number stamps stay gone");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 161 Ryan World is a fourth diver/.test(src), "C161 names the feature");
assert(/loop 160 a read note tucks under the slate/.test(src), "loop 160 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/const SKIN_IDS = \["skip", "reef", "dino", "ryan"\]/.test(src),
  "Ryan is a fourth picker id");
assert(/ryan: \{ name: "Ryan World", blurb: "globe kid" \}/.test(src),
  "Ryan World is named on the card");
assert(/function normalizeSkin\(/.test(src), "normalizeSkin is extractable");
const norm = extractFn(src, "normalizeSkin") || "";
assert(/SKIN_IDS\.indexOf\(id\)/.test(norm), "unknown skins still fall back to Skip");

assert(/function skinPickerCols\(/.test(src), "skinPickerCols is extractable");
assert(/function skinPickerSize\(/.test(src), "skinPickerSize is extractable");

const backdrop = extractFn(src, "drawPickerBackdrop") || "";
assert(/id === "ryan"/.test(backdrop), "Ryan paints a world-map card");
assert(/C95 — painted lagoon/.test(backdrop), "Dino's lagoon stays");
assert(/C95 — painted pier/.test(backdrop), "Skip's pier stays");

const picker = extractFn(src, "drawSkinPicker") || "";
assert(/paintOnly: id === "dino" \|\| id === "ryan"/.test(picker),
  "Ryan uses the matte paint path like Dino");
assert(/skinPickerSize\(cardW, cardH, gap\)/.test(picker),
  "four cards lay out from SKIN_IDS, not a hardcoded row of 3");

const walk = extractFn(src, "drawPlayer") || "";
assert(/skin === "ryan"/.test(walk), "Ryan has a walk paint");
assert(/globe kid/.test(walk), "the walk paint names the globe kid");

const swim = extractFn(src, "drawDiver") || "";
assert(/else if \(skin === "ryan"\)/.test(swim), "Ryan has a swim paint");

assert(/Dino, or Ryan World on title/.test(src), "help names Ryan World");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");

console.log("c161 ryan world: ok (stamps=" + stampCount + ", v1.0, fourth diver, no IAP)");
