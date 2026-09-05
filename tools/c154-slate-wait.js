// C154 — today's regular waits at the chalkboard. Serving them chalks PAID.
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
assert(!/Aqua Bay · loop 15[0-4]"/.test(src), "loop-number stamps stay gone");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 154 today's regular waits at the slate/.test(src), "C154 names the feature");
assert(/loop 153 the west chalkboard names today's regular/.test(src), "loop 153 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/function dayBoardStand\(/.test(src), "dayBoardStand is extractable");
const stand = extractFn(src, "dayBoardStand") || "";
assert(/DAY_BOARD\.x \+ 36/.test(stand), "they stand in front of the slate");

assert(/function applyDayGuest\(/.test(src), "applyDayGuest is extractable");
const apply = extractFn(src, "applyDayGuest") || "";
assert(/c\.state = "slate"/.test(apply), "an unserved regular is sent to the slate");
assert(/sessionDayGuest/.test(apply), "a paid regular is not sent back");
assert(/payMult = 2/.test(apply), "2× pay stays");

assert(/function ensureDayGuest\(/.test(src), "ensureDayGuest is extractable");
const ensure = extractFn(src, "ensureDayGuest") || "";
assert(/if \(state\.sessionDayGuest\) return/.test(ensure), "a paid day does not sprout another waiter");
assert(/state: "slate"/.test(ensure), "a fresh regular walks to the slate");

assert(/c\.state === "slate"/.test(src), "the shop tick walks the slate state");
const customers = extractFn(src, "updateCustomers") || "";
assert(/dayBoardStand\(\)/.test(customers), "slate walking uses the stand point");
assert(/c\.state = "tank"/.test(customers), "they leave the slate to buy once stocked");

assert(/function drawDayBoard\(/.test(src), "drawDayBoard is extractable");
const paint = extractFn(src, "drawDayBoard") || "";
assert(/sessionDayGuest/.test(paint), "a served day marks the slate");
assert(/PAID/.test(paint), "the slate chalks PAID");

assert(/pop\(DAY_BOARD\.x/.test(src), "the sale pops PAID 2× on the slate");
const rollGoals = extractFn(src, "rollSessionGoals") || "";
assert(/if \(newDay\) state\.sessionDayGuest = false/.test(rollGoals),
  "Continue on the same day keeps PAID");
assert(/waits at the west slate/.test(src), "help names the wait");
assert(/is at the slate/.test(src), "the ribbon points at a waiting regular");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");
const reached = extractFn(src, "firstSessionReached") || "";
assert(/return 1;/.test(reached), "a fresh dock is still 1 / 6");

console.log("c154 slate wait: ok (stamps=" + stampCount + ", v1.0, wait + PAID, no IAP)");
