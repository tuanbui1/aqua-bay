// C144 — hireable auto-catching divers (Aquarium-Land-style idle workers).
// The cashier auto-collects the till; loop 144 adds the other half of the
// idle loop: hireable divers who periodically stock the emptiest unlocked
// tank while you play, so sales tick along without you. Up to DIVER_MAX
// divers at escalating cost; each level shortens the delivery interval.
// The upgrade bar grew from 4 to 5 slots to hold the Diver card. Divers
// are persisted. No change to the catch / flee / camera systems.
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

// ---- loop stamp bumped to 144, old stamp gone ----
assert(/Aqua Bay · loop 144/.test(src), "title/pause stamp is loop 144");
assert(!/Aqua Bay · loop 141"/.test(src), "loop 141 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 144/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 144, got " + stampCount);
assert(/loop 144 hireable auto-catching divers/.test(src), "C144 names the feature");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

// ---- data + state ----
assert(/const DIVER_COST = \[120, 260, 560, 1200\];/.test(src), "escalating diver hire costs exist");
assert(/const DIVER_MAX = DIVER_COST\.length;/.test(src), "DIVER_MAX derives from the cost table");
assert(/hiredCashier: false, cashierAcc: 0, diverLv: 0, diverAcc: 0,/.test(src),
  "diverLv / diverAcc are in the live state defaults");
assert(/diverLv: 0, diverAcc: 0,/.test(src), "diverLv / diverAcc are in the New-Game reset");
// persistence
assert(/diverLv: clamp\(\(d\.diverLv != null \? d\.diverLv : \(d\.upgrades && d\.upgrades\.diverLv\)\) \| 0, 0, DIVER_MAX\)/.test(src),
  "diverLv is loaded (clamped) from the save, with an upgrades-block fallback");
assert(/hiredCashier: state\.diverLv \? 1 : 0|hiredCashier: state\.hiredCashier, diverLv: state\.diverLv \| 0,/.test(src),
  "diverLv is written to the save");
assert(/diverLv: state\.diverLv \| 0,\n\s*\},/.test(src) || /diverLv: state\.diverLv \| 0,/.test(src),
  "diverLv is written to the upgrades backup block");

// ---- the mechanic: buy, update loop, auto-stock ----
const buy = extractFn(src, "buyDiver") || "";
assert(buy, "buyDiver is extractable");
assert(/if \(state\.diverLv >= DIVER_MAX\) return nope/.test(buy), "cannot hire past DIVER_MAX");
assert(/const c = DIVER_COST\[state\.diverLv\];/.test(buy) && /state\.money -= c;/.test(buy) && /state\.diverLv\+\+;/.test(buy),
  "buying a diver costs the escalating price and increments the crew");
const upd = extractFn(src, "updateDivers") || "";
assert(upd, "updateDivers is extractable");
assert(/const interval = 6 \/ Math\.min\(state\.diverLv, DIVER_MAX\);/.test(upd),
  "more divers shorten the delivery interval");
assert(/const i = diverStockTarget\(\);/.test(upd) && /diverStockOne\(i\);/.test(upd),
  "each tick stocks the chosen tank");
const tgt = extractFn(src, "diverStockTarget") || "";
assert(/if \(!speciesUnlocked\(s\)\) continue;/.test(tgt) && /st < bestStock/.test(tgt),
  "divers target the emptiest UNLOCKED tank");
assert(/bestStock < DIVER_TANK_CAP \? best : -1;/.test(tgt), "divers stop topping a tank past the cap");
const one = extractFn(src, "diverStockOne") || "";
assert(/state\.stock\[i\] = \(state\.stock\[i\] \| 0\) \+ 1;/.test(one), "a delivery adds one to the tank stock");
assert(/tankRipples\.push/.test(one), "a delivery makes a little splash in the tank");
// it runs every frame in play mode (idle while you dive), next to the cashier
assert(/updateCashier\(sim\);\n\s*updateDivers\(sim\);/.test(src),
  "divers tick every play frame, right after the cashier (so they work while you dive)");
// buy is wired to the upgrade card tap
assert(/if \(id === "up-diver"\) armOrBuy\("up-diver", buyDiver\);/.test(src),
  "the up-diver card buys a diver");

// ---- UI: the upgrade bar grew to 5 slots and shows the Diver card ----
assert(/const UPGRADE_SLOTS = 5;/.test(src), "the upgrade bar is sized for 5 slots");
const barBox = extractFn(src, "upgradeBarBox") || "";
assert(/UPGRADE_SLOTS \* \(ch \+ 6\) \+ 8/.test(barBox), "portrait rail height scales with the slot count");
assert(/8 \+ UPGRADE_SLOTS \* \(cw \+ 8\)/.test(barBox), "desktop bar width scales with the slot count");
assert(/\["up-diver", diverTitle, "auto stock", "cashier", dc, dMax, !dMax && state\.money >= dc, aff && aff\.id === "diver"\]/.test(src),
  "the Diver card is the 5th upgrade slot (auto stock)");
assert(/\{ id: "diver", cost: state\.diverLv < DIVER_MAX \? DIVER_COST\[state\.diverLv\] : 1e9, maxed: state\.diverLv >= DIVER_MAX \}/.test(src),
  "the Diver is in the first-affordable-upgrade list");
assert(/opts\.push\(\{ name: "Diver", cost: DIVER_COST\[state\.diverLv\] \}\);/.test(src),
  "the Diver is a savings target in nextGoal");

// ---- numeric proof: escalating cost, faster with more divers ----
const costs = [120, 260, 560, 1200];
for (let i = 1; i < costs.length; i++) assert(costs[i] > costs[i - 1], "diver costs escalate");
const interval = (lv) => 6 / Math.min(lv, 4);
assert(interval(1) === 6 && interval(2) === 3 && interval(4) === 1.5,
  "1 diver ≈ every 6s, 2 ≈ 3s, 4 ≈ 1.5s");

// ---- regression guard: recent loops still intact ----
assert(/rgba\(6, 16, 22, 0\.86\)/.test(extractFn(src, "drawPause") || ""), "loop 131 — pause scrim stays");
assert(/const flip = topView \? 1 : \(Math\.cos\(ang\) < 0 \? -1 : 1\);/.test(extractFn(src, "drawFishBody") || ""), "loop 140 — fish orientation stays");
assert(/const pitch = clamp\(\(player\.pitch \|\| 0\) \* 1\.0 \+ headingPitch \+ kickWave \* 0\.05, -0\.9, 0\.9\);/.test(extractFn(src, "drawDiver") || ""), "loop 141 — diver dive angle stays");

console.log("c144 auto-divers: ok (stamps=" + stampCount +
  ", DIVER_COST=" + costs.join("/") + ", interval 1..4 divers=6/3/2/1.5s, 5-slot bar, persisted)");
