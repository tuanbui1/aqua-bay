// C168 — pier stars, special orders, tank nursery, badges, share pier.
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
assert(!/Aqua Bay · loop 168"/.test(src), "loop-number stamps stay gone");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 168 pier stars/.test(src), "C168 names the feature");
assert(/loop 167 divers swim prone/.test(src), "loop 167 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/id: 14/.test(src), "no fifteenth catchable species");

assert(/function pierStars\(/.test(src), "pierStars exists");
assert(/function rollPierOrder\(/.test(src), "rollPierOrder exists");
assert(/function updateTankNursery\(/.test(src), "updateTankNursery exists");
assert(/function sharePier\(/.test(src), "sharePier exists");
assert(/function refreshBadges\(/.test(src), "refreshBadges exists");
assert(/BADGE_DEFS/.test(src), "badge defs exist");
assert(/id === "share"/.test(src), "share UI id wired");
assert(/Share my pier/.test(src), "pause share button");
assert(/starTipBonus\(\)/.test(src), "sales use star tip bonus");
assert(/starSpawnMul\(\)/.test(src), "customers use star spawn mul");
assert(/noteOrderSale\(/.test(src), "sales feed special orders");
assert(/updatePierOrder\(sim\)/.test(src), "frame ticks orders");
assert(/updateTankNursery\(sim\)/.test(src), "frame ticks nursery");
assert(/hatchProg:/.test(src), "hatchProg persists");
assert(/ordersFilled:/.test(src), "ordersFilled persists");
assert(/badges:/.test(src), "badges persist");
assert(/function sharePier\(\) \{/.test(src), "sharePier function exists");
assert(/navigator\.clipboard && navigator\.clipboard\.writeText/.test(src), "share copies to clipboard");
assert(/navigator\.share/.test(src), "share uses Web Share when available");
assert(/function sharePierBlurb\(/.test(src), "sharePierBlurb exists");
assert(/tuanbui1\.github\.io\/aqua-bay\//.test(src), "share links the live play URL");
assert(/Special ORDER goals appear/.test(src), "help names orders");
assert(/Pier stars rise/.test(src), "help names stars");
assert(/Earn bay badges/.test(src), "help names badges");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");
assert(/const SKIN_IDS = \["skip", "reef", "dino", "ryan"\]/.test(src),
  "Ryan World stays a fourth picker id");

const nursery = extractFn(src, "updateTankNursery") || "";
assert(/stockRare\[i\]/.test(nursery), "nursery hatches shinies into stockRare");
assert(/state\.hatches/.test(nursery), "nursery counts hatches");

console.log("c168 world-class bay: ok (stamps=" + stampCount + ", v1.0, no IAP, depth systems)");
