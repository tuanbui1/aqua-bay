// C157 — serve the west slate three days in a row for a STREAK.
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
assert(!/Aqua Bay · loop 15[0-7]"/.test(src), "loop-number stamps stay gone");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 157 serve the slate three days in a row for a STREAK/.test(src), "C157 names the feature");
assert(/loop 156 yesterday stays on the slate/.test(src), "loop 156 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/function slateStreakN\(/.test(src), "slateStreakN is extractable");
const nFn = extractFn(src, "slateStreakN") || "";
assert(/Math\.min\(5/.test(nFn), "the streak caps at 5");

const sale = src;
assert(/slateStreak = Math\.min\(5, \(state\.slateStreak \| 0\) \+ 1\)/.test(sale),
  "a day-guest sale ticks the streak once");
assert(/STREAK ×/.test(src), "a 3-day run pops STREAK");

const tip = extractFn(src, "slateTipAmount") || "";
assert(/price \* 0\.25/.test(tip), "the base tip is still a quarter of the fish");
assert(/n >= 3/.test(tip) && /n - 2/.test(tip), "a STREAK fattens the tip");

const paint = extractFn(src, "drawDayBoard") || "";
assert(/slateStreakN\(\)/.test(paint), "the slate paints streak stars");
assert(/★/.test(paint), "stars still chalk on the slate");
assert(/YEST /.test(paint), "yesterday stays");
assert(/AGAIN/.test(paint), "AGAIN stays");

const roll = extractFn(src, "rollSessionGoals") || "";
assert(/slateStreak = 0/.test(roll), "a missed day breaks the streak");
assert(/newDay/.test(roll) && /sessionDayGuest = false/.test(roll),
  "Continue on the same day keeps PAID");

assert(/slateStreak: Math\.max\(0, Math\.min\(5, state\.slateStreak \| 0\)\)/.test(src),
  "the streak persists");
assert(/slateStreak: 0/.test(src), "New Game clears the streak");

assert(/slate streak ×/.test(src), "TODAY names a live streak");
assert(/Keep the slate streak/.test(src), "the ribbon points at a live streak");
assert(/Serve the slate three days in a row for a STREAK/.test(src), "help names the streak");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");

console.log("c157 slate streak: ok (stamps=" + stampCount + ", v1.0, STREAK ×3, no IAP)");
