// C165 — the deep has worse teeth: an angler and a leviathan.
// They spawn only after you swim past the reef (y ≥ 980), same
// first-dive quiet as the shallows pack. Not new catchables.
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
assert(/loop 165 the deep has worse teeth/.test(src), "C165 names the feature");
assert(/loop 164 ocean monsters/.test(src), "loop 164 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");
assert(!/id: 14/.test(src), "no fifteenth catchable species");

const legal = extractFn(src, "deepScaryLegal") || "";
assert(/sharkLegal\(\)/.test(legal), "deep scare reuses the first-dive quiet gate");
assert(/player\.y >= 980/.test(legal), "they have to swim into the reef");

const ensure = extractFn(src, "ensureDeepMonsters") || "";
assert(/kind: "angler"/.test(ensure), "an angler seeds in the deep");
assert(/kind: "leviathan"/.test(ensure), "a leviathan seeds in the deep");
assert(/deepScaryLegal\(\)/.test(ensure), "shallows do not spawn deep monsters");
assert(/kind: "abyss-eye"/.test(ensure), "glowing eyes sit in the dark");
assert(/herdDeepMonster\(/.test(ensure), "a fast descent does not leave them at the reef lip");

const seed = extractFn(src, "seedOceanScenery") || "";
assert(!/kind: "angler"/.test(seed), "the angler is not a shallows seed");
assert(!/kind: "leviathan"/.test(seed), "the leviathan is not a shallows seed");
assert(/kind: "shark"/.test(seed), "the reef shark still seeds the shallows");

const bite = extractFn(src, "anglerBite") || "";
assert(/dropLastBagCatch\(\)/.test(bite), "an angler bite can drop the last catch");
assert(/The lure had teeth/.test(bite), "the bite names the lure");

const sweep = extractFn(src, "leviathanSweep") || "";
assert(/dropLastBagCatch\(\)/.test(sweep), "a leviathan sweep can drop the last catch");
assert(/Something huge moved in the dark/.test(sweep), "the sweep names the dark");

const upd = extractFn(src, "updateOceanScenery") || "";
assert(/ensureDeepMonsters\(\)/.test(upd), "swimming down can spawn the pack");
assert(/s\.kind === "angler"/.test(upd), "the angler updates");
assert(/anglerBite\(s\)/.test(upd), "the angler can bite");
assert(/s\.kind === "leviathan"/.test(upd), "the leviathan updates");
assert(/leviathanSweep\(s\)/.test(upd), "the leviathan can sweep");
assert(/clamp\(s\.y, 980/.test(upd), "deep monsters stay out of the shallows");
assert(/player\.y >= 960/.test(upd), "hits only fire once you are deep");

assert(/function drawSceneryAngler\(/.test(src), "the angler paints");
assert(/function drawSceneryLeviathan\(/.test(src), "the leviathan paints");
assert(/function drawSceneryAbyssEye\(/.test(src), "the eyes paint");
assert(/The deep has worse teeth/.test(src), "help names the deep pack");
assert(/LURE/.test(extractFn(src, "drawSceneryAngler") || ""), "the angler wears a LURE plate");
assert(/DEEP/.test(extractFn(src, "drawSceneryLeviathan") || ""), "the leviathan wears a DEEP plate");

assert(/the deep goes black/.test(src) && /player\.y >= 900/.test(src),
  "the deep wash starts at the reef");

console.log("c165 deep monsters: ok (stamps=" + stampCount + ", v1.0, first-dive quiet, no IAP)");
