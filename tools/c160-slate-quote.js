// C160 — a read note tucks under the slate. Walk over it again.
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
assert(/loop 160 a read note tucks under the slate/.test(src), "C160 names the feature");
assert(/loop 159 a scooped tip leaves a note on the west boards/.test(src), "loop 159 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

const tick = extractFn(src, "updateSlateNote") || "";
assert(/slateNote = 0/.test(tick), "walking onto the unread note still clears it");
assert(/slateNoteLine\(\)/.test(tick), "first read still uses the guest line");
assert(/slateQuote = line/.test(tick), "a read note keeps the quote");
assert(/slateQuoteWho/.test(tick), "a read note keeps who wrote it");
assert(/state\.slateQuote/.test(tick), "walking the tucked card reads it again");

const paint = extractFn(src, "drawSlateNote") || "";
assert(/slateNote/.test(paint), "an unread note still paints");
assert(/slateQuote/.test(paint), "a tucked quote paints");
assert(/tucked/.test(paint), "the tucked card is named");

const roll = extractFn(src, "rollSessionGoals") || "";
assert(/slateNote = 0/.test(roll), "a new day still clears an unread note");
assert(!/slateQuote = ""/.test(roll), "a new day keeps the tucked quote");

assert(/slateQuote: \(state\.slateQuote \|\| ""\)\.slice\(0, 40\)/.test(src), "the quote persists");
assert(/slateQuote: ""/.test(src), "New Game clears the quote");
assert(/tucked under the slate/.test(src), "the ribbon names the tucked note");
assert(/A read note tucks under the slate — walk over it again/.test(src), "help names the tuck");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");

console.log("c160 slate quote: ok (stamps=" + stampCount + ", v1.0, tucked note, no IAP)");
