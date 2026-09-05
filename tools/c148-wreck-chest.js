// C148 — the wreck chest is a cone scoop, not a walk-by.
// Hold fills the catch bar. Crack it: pearls ($50) and a lantern
// slip into the bag. Finding the wreck (or cracking the chest)
// sends Nico to the dock asking for that lantern (2× pay).
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

assert(/Aqua Bay · loop 148/.test(src), "title/pause stamp is loop 148");
assert(!/Aqua Bay · loop 147"/.test(src), "loop 147 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 148/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 148, got " + stampCount);
assert(/loop 148 hold the cone on the wreck chest/.test(src), "C148 names the feature");
assert(/loop 147 the wreck east of the shallows/.test(src), "loop 147 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/function isChestTarget\(/.test(src), "chest is a scoop target type");
assert(/function wreckChestTarget\(/.test(src), "wreckChestTarget is extractable");
const tgt = extractFn(src, "wreckChestTarget") || "";
assert(/chest: true/.test(tgt) && /WRECK_CHEST/.test(tgt), "the live target sits on the painted chest");

assert(/function openWreckChest\(/.test(src), "openWreckChest exists");
const open = extractFn(src, "openWreckChest") || "";
assert(/const pay = 50/.test(open), "pearls pay $50");
assert(/state\.bag\.push\(13\)/.test(open), "a lantern slips into the bag");
assert(/A lantern slipped out/.test(open), "toast names the lantern");
assert(/maybeLanternRumor\(\)/.test(open), "cracking the chest tells Nico");

assert(!/function tryScoopWreckChest\(/.test(src), "walk-by chest scoop is gone");
assert(/the chest is a cone scoop, not a walk-by/.test(src), "player update no longer auto-opens");

const climax = extractFn(src, "beginCatchClimax") || "";
assert(/isChestTarget\(f\)/.test(climax) && /openWreckChest\(\)/.test(climax),
  "a full catch bar on the chest opens it, not catchFish");

const hunt = extractFn(src, "huntScoopAllows") || "";
assert(/isChestTarget\(f\)/.test(hunt) && /wreckChestReady/.test(hunt),
  "the chest is scoopable even during a species hunt");

assert(/Hold the cone on the wreck chest/.test(src), "ribbon at the hull points at the chest");
assert(/drawWorldPlate\(cx, cy - 36 \+ bob, "CHEST"/.test(src), "a CHEST plate marks the scoop");

const rumor = extractFn(src, "maybeLanternRumor") || "";
assert(/Nico wants a lanternfish from the wreck/.test(rumor), "Nico rumor copy");
assert(/favorite: 13/.test(rumor) && /payMult: 2/.test(rumor), "Nico pays 2× for a lantern");
assert(/teaseLantern: true/.test(rumor), "he will not buy clownfish while waiting");
assert(/maybeLanternRumor\(\)/.test(extractFn(src, "updateReefPresence") || ""),
  "first enter THE WRECK also tells Nico");

assert(/Crack the wreck chest/.test(src), "TODAY can roll a chest goal");
assert(/Sell Nico a lantern/.test(src), "TODAY can roll Nico's lantern");
assert(/sessionNicoLantern = true/.test(src), "selling Nico a lantern completes the goal");
assert(/lanternRumor: !!d\.lanternRumor/.test(src), "Nico's ask persists");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");

console.log("c148 wreck chest: ok (stamps=" + stampCount + ", pearls=$50, lantern-in-bag, Nico 2x)");
