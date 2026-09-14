// C166 — a pearl glints in the dark. Swim into it for $35.
// Same first-dive quiet / reef gate as the deep pack. Not a catchable.
// Stamps stay v1.0.
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
assert(/loop 166 a pearl glints in the dark/.test(src), "C166 names the feature");
assert(/loop 165 the deep has worse teeth/.test(src), "loop 165 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");
assert(!/id: 14/.test(src), "no fifteenth catchable species");

const legal = extractFn(src, "deepScaryLegal") || "";
assert(/sharkLegal\(\)/.test(legal), "the pearl reuses the first-dive quiet gate");
assert(/player\.y >= 980/.test(legal), "they have to swim into the reef");

const ensure = extractFn(src, "ensureDeepMonsters") || "";
assert(/kind: "pearl"/.test(ensure), "a pearl seeds with the deep pack");
assert(/deepScaryLegal\(\)/.test(ensure), "shallows do not spawn the pearl");
assert(/A pearl glints in the dark/.test(ensure), "a toast names the pearl");

const scoop = extractFn(src, "scoopDeepPearl") || "";
assert(/state\.money \+= pay/.test(scoop), "the pearl pays out");
assert(/pay = 35/.test(scoop), "the pearl is $35");
assert(/A pearl from the dark/.test(scoop), "the scoop names the dark");
assert(!/state\.bag\.push/.test(scoop), "the pearl is not a bag fish");
assert(/pearl-gone/.test(scoop), "the scooped pearl leaves the water");

const upd = extractFn(src, "updateOceanScenery") || "";
assert(/s\.kind === "pearl"/.test(upd), "the pearl updates");
assert(/scoopDeepPearl\(s\)/.test(upd), "swimming into the glow scoops it");
assert(/pd < 28/.test(upd), "a close pass takes the pearl");

assert(/function drawSceneryPearl\(/.test(src), "the pearl paints");
assert(/PEARL/.test(extractFn(src, "drawSceneryPearl") || ""), "the pearl wears a PEARL plate");
assert(/A pearl glints in the dark — swim into the glow/.test(src), "help names the pearl");
assert(/deepPearlReady = true/.test(src), "each dive can grow a new pearl");

const seed = extractFn(src, "seedOceanScenery") || "";
assert(!/kind: "pearl"/.test(seed), "the pearl is not a shallows seed");

console.log("c166 deep pearl: ok (stamps=" + stampCount + ", v1.0, first-dive quiet, no IAP)");
