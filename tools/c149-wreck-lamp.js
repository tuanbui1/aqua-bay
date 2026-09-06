// C149 — Nico's lantern comes home to the pier.
// When Nico buys a lanternfish he hangs a glowing wreck lantern on
// the east dock. Continue with wreckLamp already true still shows it.
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

assert(/Aqua Bay · loop 149/.test(src), "title/pause stamp is loop 149");
assert(!/Aqua Bay · loop 148"/.test(src), "loop 148 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 149/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 149, got " + stampCount);
assert(/loop 149 Nico hangs a wreck lantern on the east dock/.test(src), "C149 names the feature");
assert(/loop 148 hold the cone on the wreck chest/.test(src), "loop 148 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/const WRECK_LAMP = /.test(src), "WRECK_LAMP is planted on the east dock");
assert(/BAIT_HUT\.x \+ 56/.test(src), "the lamp hangs off the bait hut's east eave");

assert(/function hangWreckLamp\(/.test(src), "hangWreckLamp is extractable");
const hang = extractFn(src, "hangWreckLamp") || "";
assert(/if \(state\.wreckLamp\) return/.test(hang), "one hang — already hung is a no-op");
assert(/state\.wreckLamp = true/.test(hang), "hang sets the persist flag");
assert(/Nico hung a lantern on the east dock/.test(hang), "toast names the east-dock hang");
assert(/sfx\("unlock"\)/.test(hang), "hang plays unlock");
assert(/persist\(\)/.test(hang), "hang writes the save");

assert(/function drawWreckLamp\(/.test(src), "drawWreckLamp is extractable");
const draw = extractFn(src, "drawWreckLamp") || "";
assert(/if \(!state\.wreckLamp\) return/.test(draw), "lamp paints only after the hang");
assert(/sitShadow/.test(draw), "lamp casts a sit shadow on the boards");
assert(/globalCompositeOperation = "lighter"/.test(draw), "lamp glow uses the wreck language");
assert(/ctx\.scale\(1\.35, 1\.35\)/.test(draw), "lamp reads at dock-camera size");

assert(/drawWreckLamp\(WRECK_LAMP\.x, WRECK_LAMP\.y\)/.test(src), "shop pass paints the planted lamp");

assert(/wreckLamp: !!d\.wreckLamp/.test(src), "wreckLamp loads from the save");
assert(/wreckLamp: !!state\.wreckLamp/.test(src), "wreckLamp persists");
assert(/wreckLamp: false/.test(src), "New Game clears the lamp");

const sale = src.slice(src.indexOf("if (c.name === \"Nico\" && (c.carry | 0) === 13)"));
assert(/c\.saidLine = "from the wreck!"/.test(sale), "Nico's lantern sale barks from the wreck");
assert(/hangWreckLamp\(\)/.test(sale), "that sale hangs the lamp");

assert(/from the wreck!/.test(src), "Nico's unique bark is in the file");
assert(/Hang Nico's lantern/.test(src), "TODAY can roll Hang Nico's lantern");
assert(/id === "lamp"/.test(src), "lamp is a session goal id");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");

console.log("c149 wreck lamp: ok (stamps=" + stampCount + ", hang-once, persist, east-dock paint)");
