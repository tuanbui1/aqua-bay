// C155 — a 2× sale leaves a tip coin on the west slate. Walk over it.
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
assert(!/Aqua Bay · loop 15[0-5]"/.test(src), "loop-number stamps stay gone");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 155 a 2× sale leaves a tip on the west slate/.test(src), "C155 names the feature");
assert(/loop 154 today's regular waits at the slate/.test(src), "loop 154 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/function slateTipPos\(/.test(src), "slateTipPos is extractable");
const pos = extractFn(src, "slateTipPos") || "";
assert(/DAY_BOARD/.test(pos), "the tip sits on the boards by the slate");

assert(/function slateTipAmount\(/.test(src), "slateTipAmount is extractable");
const amt = extractFn(src, "slateTipAmount") || "";
assert(/price \* 0\.25/.test(amt), "the tip is a quarter of the fish");
assert(/Math\.max\(6/.test(amt), "the tip has a $6 floor");

assert(/function dropSlateTip\(/.test(src), "dropSlateTip is extractable");
const drop = extractFn(src, "dropSlateTip") || "";
assert(/slateTip \| 0\) > 0/.test(drop), "one tip per day");
assert(/slateTipAmount\(\)/.test(drop), "drop uses the amount helper");

assert(/function updateSlateTip\(/.test(src), "updateSlateTip is extractable");
const tick = extractFn(src, "updateSlateTip") || "";
assert(/state\.money \+= v/.test(tick), "walking onto the tip pays");
assert(/left \$" \+ v \+ " on the slate/.test(tick), "the toast names the slate");

assert(/function drawSlateTip\(/.test(src), "drawSlateTip is extractable");
assert(/drawSlateTip\(\)/.test(src), "the shop paints the tip");
assert(/dropSlateTip\(\)/.test(src), "the 2× sale drops the tip");
assert(/updateSlateTip\(\)/.test(src), "the shop tick scoops the tip");

assert(/slateTip: Math\.max\(0, state\.slateTip \| 0\)/.test(src), "an uncollected tip persists");
assert(/slateTip: 0/.test(src), "New Game clears the tip");
const roll = extractFn(src, "rollSessionGoals") || "";
assert(/slateTip = 0/.test(roll), "a new day clears an old tip");

assert(/Scoop .* tip at the slate/.test(src), "the ribbon points at the tip");
assert(/tip on the slate — walk over it/.test(src), "help names the tip");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");

console.log("c155 slate tip: ok (stamps=" + stampCount + ", v1.0, scoopable tip, no IAP)");
