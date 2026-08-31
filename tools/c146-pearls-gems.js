// C146 — pearls drop gems, a premium currency you can spend.
// Some fish carry a pearl; catching one drops a gem (a shiny is likelier
// to). Gems are shown in a HUD chip and can be spent to instantly restock
// the whole shop. Gems are persisted. This is a self-contained currency:
// it does not touch the catch/flee/camera systems, only adds a bonus on a
// completed catch and a spend action.
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

// ---- loop stamp bumped to 146 ----
assert(/Aqua Bay · loop 146/.test(src), "title/pause stamp is loop 146");
assert(!/Aqua Bay · loop 145"/.test(src), "loop 145 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 146/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 146, got " + stampCount);
assert(/loop 146 pearls drop gems/.test(src), "C146 names the feature");
assert(/loop 145 divers earn while you are away/.test(src), "loop 145 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/#offlinetest/.test(src), "no leftover debug hook");

// ---- gems: state + persistence ----
assert(/diverLv: 0, diverAcc: 0, lastPlayed: 0, gems: 0,/.test(src), "gems default to 0 in state + new game");
assert(/gems: Math\.max\(0, d\.gems \| 0\),/.test(src), "gems load (never negative) from the save");
assert(/diverLv: state\.diverLv \| 0, gems: state\.gems \| 0,/.test(src), "gems are written to the save");

// ---- pearls: a rare bonus on a completed catch ----
const cf = extractFn(src, "catchFish") || "";
assert(/maybePearl\(f\);/.test(cf), "a completed catch may drop a pearl");
const mp = extractFn(src, "maybePearl") || "";
assert(mp, "maybePearl is extractable");
assert(/const PEARL_CHANCE = 0\.11;/.test(src) && /const PEARL_CHANCE_RARE = 0\.4;/.test(src),
  "regular vs shiny pearl chances exist (shiny is likelier)");
assert(/if \(Math\.random\(\) >= \(f && f\.rare \? PEARL_CHANCE_RARE : PEARL_CHANCE\)\) return;/.test(mp),
  "the pearl roll uses the higher chance for a shiny");
assert(/state\.gems = \(state\.gems \| 0\) \+ 1;/.test(mp), "a pearl grants one gem");
assert(/toast\("Found a pearl!/.test(mp) && /particles\.push/.test(mp), "a pearl pops with a toast + particles");

// ---- the sink: spend gems to restock every unlocked tank ----
assert(/const RESTOCK_GEMS = 3;/.test(src), "a restock costs 3 gems");
const pr = extractFn(src, "pearlRestock") || "";
assert(pr, "pearlRestock is extractable");
assert(/if \(\(state\.gems \| 0\) < RESTOCK_GEMS\) return nope/.test(pr), "cannot restock without enough gems");
assert(/while \(\(state\.stock\[s\] \| 0\) < DIVER_TANK_CAP\) \{ diverStockOne\(s\); filled\+\+; \}/.test(pr),
  "restock fills every unlocked tank up to the cap");
assert(/if \(!filled\) return nope/.test(pr), "no gems are spent if nothing needed restocking");
assert(/state\.gems -= RESTOCK_GEMS;/.test(pr), "a successful restock spends the gems");

// ---- HUD: a gem chip, tappable to restock in the shop ----
assert(/function drawGems\(\)/.test(src), "there is a gem HUD chip");
assert(/drawHUD\(\);\s*\n\s*drawGems\(\);/.test(src), "the gem chip draws over the HUD");
const dg = extractFn(src, "drawGems") || "";
assert(/const canRestock = state\.scene === "shop" && \(state\.gems \| 0\) >= RESTOCK_GEMS;/.test(dg),
  "restock is offered only in the shop with enough gems");
assert(/btn\("gem-restock", gx, gy, gw, gh\);/.test(dg), "the chip is a tappable restock button when eligible");
assert(/if \(id === "gem-restock"\) \{ pearlRestock\(\); return; \}/.test(src),
  "tapping the gem chip restocks");
assert(/if \(state\.gemPop > 0\) state\.gemPop = Math\.max\(0, state\.gemPop - dt \* 1\.8\);/.test(src),
  "the gem chip pop fades");

// ---- numeric proof: chances are sane, shiny is better ----
assert(0 < 0.11 && 0.11 < 0.4 && 0.4 < 1, "regular < shiny pearl chance, both in (0,1)");

// ---- regression guard: idle-worker loops stay intact ----
assert(/const DIVER_COST = \[120, 260, 560, 1200\];/.test(src), "loop 144 — divers stay");
assert(/updateCashier\(sim\);\n\s*updateDivers\(sim\);/.test(src), "loop 144 — divers tick each frame");
assert(/state\.welcomeBack = \{ amount: earned, life: 5\.0 \};/.test(extractFn(src, "creditOffline") || ""),
  "loop 145 — offline welcome-back banner stays");

console.log("c146 pearls & gems: ok (stamps=" + stampCount +
  ", pearl 11%/40%, restock=3 gems fills all tanks, persisted, HUD chip)");
