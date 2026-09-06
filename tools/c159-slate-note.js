// C159 — a scooped tip leaves a folded note on the west boards.
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
assert(!/Aqua Bay · loop 15[0-9]"/.test(src), "loop-number stamps stay gone");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 159 a scooped tip leaves a note on the west boards/.test(src), "C159 names the feature");
assert(/loop 158 scoop the tip and the slate chalks THX/.test(src), "loop 158 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/function slateNotePos\(/.test(src), "slateNotePos is extractable");
const pos = extractFn(src, "slateNotePos") || "";
assert(/DAY_BOARD/.test(pos), "the note sits on the boards by the slate");

assert(/function slateNoteLine\(/.test(src), "slateNoteLine is extractable");
const line = extractFn(src, "slateNoteLine") || "";
assert(/same time tomorrow/.test(line), "Maya has a line");
assert(/fair winds/.test(line), "Nico has a line");

const scoop = extractFn(src, "updateSlateTip") || "";
assert(/slateNote = 1/.test(scoop), "scooping the tip drops a note");
assert(/slateNoteLock = 0\.55/.test(scoop), "the note does not auto-read on the same step");
assert(/slateThanks = true/.test(scoop), "THX still latches");

assert(/function updateSlateNote\(/.test(src), "updateSlateNote is extractable");
const tick = extractFn(src, "updateSlateNote") || "";
assert(/slateNote = 0/.test(tick), "walking onto the note clears it");
assert(/slateNoteLine\(\)/.test(tick), "the toast uses the guest line");

assert(/function drawSlateNote\(/.test(src), "drawSlateNote is extractable");
assert(/drawSlateNote\(\)/.test(src), "the shop paints the note");
assert(/updateSlateNote\(dt\)/.test(src), "the shop tick reads the note");

const roll = extractFn(src, "rollSessionGoals") || "";
assert(/slateNote = 0/.test(roll), "a new day clears an unread note");

assert(/slateNote: \(state\.slateNote \| 0\) \? 1 : 0/.test(src), "an unread note persists");
assert(/slateNote: 0/.test(src), "New Game clears the note");

assert(/note at the slate/.test(src), "the ribbon points at the note");
assert(/A scooped tip leaves a note — walk over it/.test(src), "help names the note");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");

console.log("c159 slate note: ok (stamps=" + stampCount + ", v1.0, folded note, no IAP)");
