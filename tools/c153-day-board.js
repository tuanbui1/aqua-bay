// C153 — after the first session, a west chalkboard names today's regular.
// They pay 2× for the fish on the slate. Continue keeps the same day.
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
assert(!/Aqua Bay · loop 15[0123]"/.test(src), "loop-number stamps stay gone");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 153 the west chalkboard names today's regular/.test(src), "C153 names the feature");
assert(/loop 152 first-session polish/.test(src), "loop 152 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/const DAY_BOARD = \{ x: 348, y: 942 \}/.test(src), "slate is planted west of the life ring");
assert(/const DAY_GUESTS = \["Maya", "Nico", "Jun"\]/.test(src), "the board rotates the three regulars");

assert(/function dayBoardReady\(/.test(src), "dayBoardReady is extractable");
const ready = extractFn(src, "dayBoardReady") || "";
assert(/missionDone/.test(ready), "the board waits until the first session ends");
assert(/dayGuest/.test(ready) && /dayWant/.test(ready), "ready needs a named regular and a fish");

assert(/function rollDayGuest\(/.test(src), "rollDayGuest is extractable");
const roll = extractFn(src, "rollDayGuest") || "";
assert(/sessionDay/.test(roll), "the roll is keyed to the day");
assert(/dayAt === day/.test(roll), "Continue does not reroll the same day");

assert(/function applyDayGuest\(/.test(src), "applyDayGuest is extractable");
const apply = extractFn(src, "applyDayGuest") || "";
assert(/payMult = 2/.test(apply), "today's regular pays 2×");
assert(/nightGuest/.test(apply), "Sable is not overwritten");
assert(/lanternRumor/.test(apply), "Nico's live lantern ask still owns him");

assert(/function drawDayBoard\(/.test(src), "drawDayBoard is extractable");
const paint = extractFn(src, "drawDayBoard") || "";
assert(/DAY /.test(paint), "the slate paints DAY N");
assert(/dayGuest/.test(paint), "the slate paints the regular");
assert(/drawFishBody/.test(paint), "the slate shows the fish they want");

assert(/function ensureDayGuest\(/.test(src), "ensureDayGuest is extractable");
assert(/ensureDayGuest\(\)/.test(src), "Continue / the shop tick sprout the regular");
assert(/rollDayGuest\(\)/.test(src), "startPlay / TODAY roll the slate");

assert(/id === "guest"/.test(src), "TODAY can ask you to serve today's regular");
const rollGoals = extractFn(src, "rollSessionGoals") || "";
assert(/picked\.push\("guest"\)/.test(rollGoals), "TODAY pins today's regular first");
assert(/sessionDayGuest/.test(src), "serving them counts the day goal");
assert(/dayGuest: state\.dayGuest \|\| ""/.test(src), "the slate persists");
assert(/dayWant: state\.dayWant == null \? -1 : \(state\.dayWant \| 0\)/.test(src), "the fish persists");
assert(/dayAt: state\.dayAt \| 0/.test(src), "the day latch persists");

assert(/paintWorldSprite\(DAY_BOARD\.x/.test(src), "the shop paints the slate");
assert(/west chalkboard names today's regular/.test(src), "help names the board");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");
const reached = extractFn(src, "firstSessionReached") || "";
assert(/return 1;/.test(reached), "a fresh dock is still 1 / 6");

console.log("c153 day board: ok (stamps=" + stampCount + ", v1.0, slate + 2× regular, no IAP)");
