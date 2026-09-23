// C168 sim — pure logic smoke for stars / order fill / nursery rates.
"use strict";

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// Mirror of pierStars scoring (mission done assumed).
function pierStarsOf(s) {
  let pts = 1;
  const unlocked = s.unlocked;
  if (unlocked >= 3) pts++;
  if (unlocked >= 8 || s.gallery) pts++;
  if (s.peakMoney >= 400 || s.streak >= 3 || s.sawWreck) pts++;
  if (s.peakMoney >= 2000 || s.whale || s.badges >= 5) pts++;
  return clamp(pts, 1, 5);
}

assert(pierStarsOf({ unlocked: 1, gallery: false, peakMoney: 0, streak: 0, sawWreck: false, whale: false, badges: 0 }) === 1, "starter pier is ★");
assert(pierStarsOf({ unlocked: 3, gallery: false, peakMoney: 0, streak: 0, sawWreck: false, whale: false, badges: 0 }) === 2, "3 unlocks → ★★");
assert(pierStarsOf({ unlocked: 8, gallery: true, peakMoney: 500, streak: 3, sawWreck: true, whale: false, badges: 2 }) === 4, "mid pier → ★★★★");
assert(pierStarsOf({ unlocked: 10, gallery: true, peakMoney: 2500, streak: 5, sawWreck: true, whale: true, badges: 6 }) === 5, "peak pier → ★★★★★");

function starTipBonus(n) { return n <= 1 ? 1 : 1 + (n - 1) * 0.06; }
assert(Math.round(15 * starTipBonus(5)) === 19, "5★ tips a $15 fish to $19");

function noteOrder(got, needs, speciesId) {
  for (let i = 0; i < needs.length; i++) {
    if (needs[i].s !== speciesId) continue;
    if (got[i] >= needs[i].n) continue;
    got[i]++;
    break;
  }
  return needs.every((n, i) => got[i] >= n.n);
}
const needs = [{ s: 0, n: 2 }, { s: 1, n: 1 }];
const got = [0, 0];
assert(!noteOrder(got, needs, 0), "1/2 clown not done");
assert(!noteOrder(got, needs, 1), "still need 2nd clown");
assert(noteOrder(got, needs, 0), "order completes on last fish");
assert(got[0] === 2 && got[1] === 1, "got counters match");

let hatch = 0;
const rate = (0.011 + 0.003) * (1 + 3 * 0.07) * 1.12;
for (let t = 0; t < 90; t++) hatch += rate; // ~90s tick at 1Hz
assert(hatch >= 1, "nursery reaches a hatch within ~90s of stocked play");

console.log("c168 sim: ok (stars, tips, orders, nursery pace)");
