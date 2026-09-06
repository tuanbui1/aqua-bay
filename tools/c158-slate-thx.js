// C158 — scoop the tip and the west slate chalks THX.
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
assert(!/Aqua Bay · loop 15[0-8]"/.test(src), "loop-number stamps stay gone");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 158 scoop the tip and the slate chalks THX/.test(src), "C158 names the feature");
assert(/loop 157 serve the slate three days in a row for a STREAK/.test(src), "loop 157 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/function updateSlateTip\(/.test(src), "updateSlateTip is extractable");
const tick = extractFn(src, "updateSlateTip") || "";
assert(/slateThanks = true/.test(tick), "scooping the tip latches THX");
assert(/left \$" \+ v \+ " on the slate/.test(tick), "the money toast still names the slate");
assert(/"THX"/.test(tick), "scooping pops THX on the slate");

const paint = extractFn(src, "drawDayBoard") || "";
assert(/slateThanks/.test(paint), "the slate reads the thanks latch");
assert(/THX/.test(paint), "the slate chalks THX");
assert(/PAID/.test(paint), "PAID still chalks");
assert(/YEST /.test(paint), "yesterday stays");

const roll = extractFn(src, "rollSessionGoals") || "";
assert(/slateThanks = false/.test(roll), "a new day clears THX");
assert(/newDay/.test(roll) && /sessionDayGuest = false/.test(roll),
  "Continue on the same day keeps PAID");

assert(/slateThanks: !!state\.slateThanks/.test(src), "THX persists");
assert(/slateThanks: false/.test(src), "New Game clears THX");
assert(/chalked THX on the slate/.test(src), "the ribbon names THX");
assert(/Scoop the tip and the slate chalks THX/.test(src), "help names THX");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");

console.log("c158 slate thx: ok (stamps=" + stampCount + ", v1.0, scoop → THX, no IAP)");
