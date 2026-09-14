// C164 — ocean monsters: jellies sting, urchins poke, a moray lunges.
// First New Game dive stays quiet (same sharkLegal gate as loop 163).
// Not new catchables. Stamps stay v1.0.
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
assert(/loop 164 ocean monsters/.test(src), "C164 names the feature");
assert(/loop 163 a reef shark patrols/.test(src), "loop 163 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");
assert(!/id: 14/.test(src), "no fifteenth catchable species");

const legal = extractFn(src, "sharkLegal") || "";
assert(/divesThisSession \| 0\) >= 2/.test(legal), "first-dive New Game stays quiet");

const seed = extractFn(src, "seedOceanScenery") || "";
assert(/kind: "eel"/.test(seed), "a moray seeds with the shark pack");
assert(/kind: "urchin"/.test(seed), "urchins seed with the shark pack");
assert(/sharkLegal\(\)/.test(seed), "monsters only seed when legal");

const sting = extractFn(src, "jellySting") || "";
assert(/A jelly stung you/.test(sting), "jellies toast a sting");
assert(!/dropLastBagCatch/.test(sting), "a sting does not drop the bag");

const bite = extractFn(src, "morayBite") || "";
assert(/dropLastBagCatch\(\)/.test(bite), "a moray lunge can drop the last catch");
assert(/A moray lunged/.test(bite), "the lunge names the moray");

const poke = extractFn(src, "urchinPoke") || "";
assert(/urchinSlow/.test(poke), "an urchin poke slows the swim");
assert(/Urchin spines/.test(poke), "the poke names the urchin");

const swim = extractFn(src, "swimSpeed") || "";
assert(/urchinSlow/.test(swim), "urchin slow actually cuts swimSpeed");

const upd = extractFn(src, "updateOceanScenery") || "";
assert(/jellySting\(s\)/.test(upd), "jellies can sting on a close pass");
assert(/s\.kind === "eel"/.test(upd), "the moray updates");
assert(/morayBite\(s\)/.test(upd), "the moray can bite");
assert(/s\.kind === "urchin"/.test(upd), "urchins sit on the bed");
assert(/urchinPoke\(\)/.test(upd), "urchins can poke");

assert(/function drawSceneryEel\(/.test(src), "the moray paints");
assert(/function drawSceneryUrchin\(/.test(src), "the urchin paints");
assert(/Jellies sting, urchins poke, and a moray lunges/.test(src), "help names the pack");
assert(/kind: "shark"/.test(seed), "the reef shark still seeds");

console.log("c164 ocean monsters: ok (stamps=" + stampCount + ", v1.0, first-dive quiet, no IAP)");
