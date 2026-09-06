// C156 — yesterday stays on the slate. A return pays 3×.
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
assert(!/Aqua Bay · loop 15[0-6]"/.test(src), "loop-number stamps stay gone");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 156 yesterday stays on the slate/.test(src), "C156 names the feature");
assert(/loop 155 a 2× sale leaves a tip on the west slate/.test(src), "loop 155 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/function dayGuestAgain\(/.test(src), "dayGuestAgain is extractable");
const again = extractFn(src, "dayGuestAgain") || "";
assert(/yestGuest/.test(again) && /dayGuest/.test(again), "a return is yesterday === today");

assert(/function dayGuestMult\(/.test(src), "dayGuestMult is extractable");
const mult = extractFn(src, "dayGuestMult") || "";
assert(/dayGuestAgain\(\) \? 3 : 2/.test(mult), "a return pays 3×, else 2×");

assert(/function dayGuestName\(/.test(src), "dayGuestName is extractable");
const name = extractFn(src, "dayGuestName") || "";
assert(/yestGuest/.test(name), "some mornings last night's regular walks back");
assert(/lanternRumor/.test(name), "Nico's live lantern ask still owns him");

const apply = extractFn(src, "applyDayGuest") || "";
assert(/payMult = 2/.test(apply), "2× pay stays");
assert(/dayGuestAgain\(\)\) c\.payMult = 3/.test(apply), "a return overrides to 3×");

const paint = extractFn(src, "drawDayBoard") || "";
assert(/YEST /.test(paint), "the slate chalks yesterday");
assert(/AGAIN/.test(paint), "a return chalks AGAIN");
assert(/PAID 3×/.test(paint), "a served return chalks PAID 3×");
assert(/drawFishBody/.test(paint), "the wanted fish still paints");

const roll = extractFn(src, "rollSessionGoals") || "";
const yestAt = roll.indexOf("yestGuest");
const rollAt = roll.indexOf("rollDayGuest");
assert(yestAt >= 0 && rollAt >= 0 && yestAt < rollAt, "yesterday latches before today's roll");
assert(/newDay/.test(roll) && /sessionDayGuest = false/.test(roll), "Continue on the same day keeps PAID");
assert(/slateTip = 0/.test(roll), "a new day still clears an old tip");

assert(/yestGuest: state\.yestGuest \|\| ""/.test(src), "yesterday persists");
assert(/yestGuest: ""/.test(src), "New Game clears yesterday");
assert(/typeof d\.yestGuest === "string"/.test(src), "Continue loads yesterday");

assert(/PAID 2×/.test(src) && /PAID 3×/.test(src), "the sale pops 2× or 3×");
assert(/again \(3×\)/.test(src), "TODAY names a return");
assert(/back — 3× at the slate/.test(src), "the ribbon points at a return");
assert(/Yesterday stays on the slate — a return pays 3×/.test(src), "help names the return");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");

console.log("c156 yest again: ok (stamps=" + stampCount + ", v1.0, YEST + 3× return, no IAP)");
