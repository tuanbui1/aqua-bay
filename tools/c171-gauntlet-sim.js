// C171 sim — extract the dock-bell formulas from game.js and check them.
"use strict";
const fs = require("fs");
const path = require("path");

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL", msg);
    process.exit(1);
  }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");
const GAUNTLET_RINGS = 3;
const names = [
  "gauntletGoalOf",
  "gauntletGoalNow",
  "gauntletPayOf",
  "gauntletConsolationOf",
  "gauntletPayout",
  "gauntletRingResult",
];
let body = "";
for (const name of names) {
  const re = new RegExp("function " + name + "\\([\\s\\S]*?\\n  \\}");
  const m = src.match(re);
  assert(m, "missing " + name);
  body += m[0] + "\n";
}
const api = eval(
  body +
  "\n({ gauntletGoalOf, gauntletGoalNow, gauntletPayOf, gauntletConsolationOf, gauntletPayout, gauntletRingResult })"
);
const gauntletGoalOf = api.gauntletGoalOf;
const gauntletGoalNow = api.gauntletGoalNow;
const gauntletPayOf = api.gauntletPayOf;
const gauntletConsolationOf = api.gauntletConsolationOf;
const gauntletPayout = api.gauntletPayout;
const gauntletRingResult = api.gauntletRingResult;

assert(gauntletGoalOf(1, 5, 0) === 3, "first bell asks for 3");
assert(gauntletGoalOf(1, 5, 1) === 4, "second bell on a starter bag asks for 4");
assert(gauntletGoalOf(5, 5, 2) === 5, "high stars cannot ask for more than the bag");
assert(gauntletGoalOf(5, 8, 2) === 8, "a bigger bag can take the full star ask");
assert(gauntletGoalNow(1, 5, 1, 3) === 2, "a nearly full bag shrinks the ask to the space left");
assert(gauntletGoalNow(1, 5, 0, 5) === 0, "a full bag cannot start");

assert(gauntletPayOf(3, 1) === 68, "three fish at one star pays 68");
assert(gauntletPayOf(4, 1) === 84, "four fish at one star pays 84");
assert(gauntletPayOf(8, 5) === 276, "eight fish at five stars pays 276");
assert(gauntletPayOf(0, 5) === 0, "no fish pays nothing");
assert(gauntletConsolationOf(2) === 10, "a short run still leaves a small tip");

const win = gauntletPayout(3, 3, 1);
assert(win.ok && win.pay === 68, "meeting the ask clears");
const miss = gauntletPayout(2, 3, 1);
assert(!miss.ok && miss.pay === 10, "a miss pays the consolation");
const empty = gauntletPayout(0, 3, 1);
assert(!empty.ok && empty.pay === 0, "an empty run pays nothing");

const ring = gauntletRingResult(false, 0, 2, 2, 0, 5);
assert(ring.ok && ring.reason === "ring" && ring.armed && ring.rings === 1, "a free ring arms the bell");
const lit = gauntletRingResult(true, 1, 2, 2, 0, 5);
assert(lit.reason === "lit" && lit.rings === 1, "a lit bell does not spend another ring");
const full = gauntletRingResult(false, 0, 2, 2, 5, 5);
assert(!full.ok && full.reason === "full" && !full.armed, "a full bag cannot ring");
const rest = gauntletRingResult(false, 3, 2, 2, 0, 5);
assert(!rest.ok && rest.reason === "rest", "three rings rest the bell");
const nextDay = gauntletRingResult(false, 3, 2, 3, 0, 5);
assert(nextDay.ok && nextDay.reason === "ring" && nextDay.rings === 1 && nextDay.day === 3, "a new day resets the bell");

assert(/gauntletActive/.test(src) && /drawGauntletBell/.test(src), "bell is wired into the game");
assert(/id === "bell3"/.test(src), "three-bell badge is scored");

console.log("c171 sim: ok (goal, pay, rings, new day)");
