// C150 — the hung wreck lantern calls Sable.
// She walks to the east eave, says "the light!", then buys (2×).
// Continue with wreckLamp already true still sprouts her.
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

assert(/Aqua Bay · loop 150/.test(src), "title/pause stamp is loop 150");
assert(!/Aqua Bay · loop 149"/.test(src), "loop 149 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 150/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 150, got " + stampCount);
assert(/loop 150 the wreck lantern calls Sable/.test(src), "C150 names the feature");
assert(/loop 149 Nico hangs a wreck lantern/.test(src), "loop 149 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/function maybeNightGuest\(/.test(src), "maybeNightGuest is extractable");
const guest = extractFn(src, "maybeNightGuest") || "";
assert(/if \(!state\.wreckLamp/.test(guest), "Sable only comes after the lamp hangs");
assert(/name: "Sable"/.test(guest), "the night guest is Sable");
assert(/state: "lamp"/.test(guest), "she walks to the lamp first");
assert(/nightGuest: true/.test(guest), "she does not steal Maya / Nico / Jun slots");
assert(/payMult: 2/.test(guest), "Sable pays 2×");
assert(/The lantern called a night guest/.test(guest), "toast names the call");

assert(/function hangWreckLamp\(/.test(src), "hangWreckLamp still exists");
const hang = extractFn(src, "hangWreckLamp") || "";
assert(/maybeNightGuest\(\)/.test(hang), "hanging the lamp calls Sable");
assert(/maybeNightGuest\(\)/.test(extractFn(src, "startPlay") || ""),
  "Continue with wreckLamp already true still sprouts Sable");

assert(/c\.state === "lamp"/.test(src), "customers have a lamp stand state");
assert(/c\.saidLine = "the light!"/.test(src), "Sable's sale barks the light");
assert(/sessionSable = true/.test(src), "serving Sable completes the goal");
assert(/Serve Sable at the lantern/.test(src), "TODAY can roll Serve Sable");
assert(/Sable came for the lantern/.test(src), "dock ribbon points at Sable");

assert(/Sable: \{ hat:/.test(src), "Sable has a regular look");
assert(/sunglasses: true/.test(src), "Sable wears night glasses");
assert(/REGULAR_TINTS[\s\S]*Sable:/.test(src), "Sable has a talk tint");

assert(/if \(!c\.nightGuest\) n\+\+/.test(src), "ensureRegulars ignores the night guest");
assert(/wreckLamp: !!d\.wreckLamp/.test(src), "wreck lamp still persists");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");

console.log("c150 night guest: ok (stamps=" + stampCount + ", Sable-at-lamp, 2x, Continue sprouts)");
