// C147 — the wreck is a real east place, not another deeper clone band.
// Ocean widens past the old 2520 wall. A hull + chest sit at WRECK.
// Lanternfish (id 13, unlock $90) spawn only there. Boat lands on the
// wreck. After the first stock a toast points east. Finding the hull
// opens the lantern bowl even before Sea Turtle opens the gallery.
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

// ---- loop stamp bumped to 147 ----
assert(/Aqua Bay · loop 147/.test(src), "title/pause stamp is loop 147");
assert(!/Aqua Bay · loop 146"/.test(src), "loop 146 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 147/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 147, got " + stampCount);
assert(/loop 147 the wreck east of the shallows/.test(src), "C147 names the feature");
assert(/loop 146 visible hired diver NPCs/.test(src), "loop 146 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

// ---- ocean is wider, wreck is a place ----
assert(/const OCEAN = \{ w: 3200, h: 1960 \}/.test(src), "ocean is 3200 wide (was 2520)");
assert(/const WRECK = \{ x: 2680, y: 520, w: 460, h: 340 \}/.test(src), "WRECK sits in the new east water");
assert(/const LM_WRECK = \{ x: 2880, y: 680 \}/.test(src), "wreck landmark is inside the hull");
assert(/const WRECK_CHEST = \{ x: 2988, y: 760 \}/.test(src), "chest sits in the wreck");
assert(2680 > 2520, "wreck x is past the old ocean wall");

const inW = extractFn(src, "inWreck") || "";
assert(inW, "inWreck is extractable");
assert(/WRECK\.x/.test(inW) && /WRECK\.w/.test(inW), "inWreck uses the hull rect");

const cur = extractFn(src, "wreckCurrentX") || "";
assert(cur, "wreckCurrentX is extractable");
assert(/x > 2080/.test(cur) && /return 48/.test(cur), "east current pulls toward the hull");
assert(/inWreck\(x, y\)/.test(cur), "inside the hull the current is milder");

const zone = extractFn(src, "zoneAtDepth") || "";
assert(/The wreck/.test(zone) && /wreck: true/.test(zone), "zone plate names The wreck when x,y are in the hull");

// ---- lanternfish is a 14th species, wreck-only ----
assert(/name: "Lanternfish"/.test(src) && /home: "wreck"/.test(src), "Lanternfish is wreck-home");
assert(/unlock: 90/.test(src), "lantern unlock is $90");
assert(/\{ x: 1212, y: 380 \}/.test(src), "14th tank sits in the free plaza cell");
assert(/A living lantern that never leaves the wreck/.test(src), "book flavor names the wreck");
assert(/Glows only inside the wreck/.test(src), "book hint points at the wreck");
assert(/function drawLanternfish\(/.test(src), "lantern has its own paint");
assert(/else if \(sp\.id === 13\) drawLanternfish/.test(src), "drawFishBody dispatches lantern");

const spawn = extractFn(src, "spawnFish") || "";
assert(/isWreckSpecies\(s\)/.test(spawn) && /WRECK\.x/.test(spawn), "lanterns spawn inside the hull");

assert(/function seedOcean\(\) \{[\s\S]*?if \(!state\.unlocked\[s\] && !isWreckSpecies\(s\)\) continue;/.test(src),
  "wreck fish seed even before unlock");
assert(/const counts = \[16, 11, 9, 7, 3, 6, 5, 5, 4, 5, 4, 3, 2, 3\];/.test(src),
  "counts array has a lantern slot");

const stock = extractFn(src, "ensureOceanStock") || "";
assert(/!isWreckSpecies\(s\)/.test(stock), "ensureOceanStock keeps lanterns in the wreck");

// ---- wreck does not deepen the forever stack ----
const hi = extractFn(src, "highestUnlockedSafe") || "";
assert(/isWreckSpecies\(i\)/.test(hi) && /continue/.test(hi), "lantern unlock does not open whale-road depth");
const nxt = extractFn(src, "nextLockedSafe") || "";
assert(/isWreckSpecies\(i\)/.test(nxt), "depth next-lock skips the wreck species");

const nlt = extractFn(src, "nextLockedTank") || "";
assert(/lanternUnlockReady/.test(nlt) && /bestCost/.test(nlt), "shop next-lock is cheapest, wreck gated until found");

const live = extractFn(src, "tankLive") || "";
assert(/isWreckSpecies\(i\) && lanternUnlockReady/.test(live), "lantern bowl appears after the wreck, before Turtle gallery");

const buy = extractFn(src, "buyTank") || "";
assert(/!isWreckSpecies\(i\)/.test(buy), "buying lantern does not redirect to Sea Turtle");
assert(/Lanterns haunt the wreck to the east/.test(buy), "lantern unlock toast names the wreck, not a new band");

// ---- discovery, chest, boat ----
assert(/function maybeWreckRumor\(/.test(src), "first stock hints at the wreck");
assert(/A wreck lies east of the shallows/.test(src), "the hint copy is east, not deeper");
assert(/function seedWreckTease\(/.test(src) && /s: 13/.test(extractFn(src, "seedWreckTease") || ""), "dive 2 teases a lantern east of spawn");
assert(/function tryScoopWreckChest\(/.test(src) && /const pay = 28/.test(extractFn(src, "tryScoopWreckChest") || ""), "chest pays $28 once per dive");
assert(/state\.wreckChestReady = true/.test(src), "each dive arms the chest");
assert(/THE WRECK/.test(src) && /The wreck! Lanterns live here/.test(src), "first enter titles THE WRECK");
assert(/Visit the wreck/.test(src), "TODAY can roll a wreck goal");

const entry = extractFn(src, "oceanEntrySpawn") || "";
assert(/LM_WRECK\.x/.test(entry) && /LM_WRECK\.y/.test(entry), "boat spawn is the wreck landmark");
assert(/x: 1880, y: 400/.test(entry), "after first stock a regular dive starts east toward the current");

const pocket = extractFn(src, "seedExpeditionPocket") || "";
assert(/LM_WRECK\.x/.test(pocket) && /pushOceanFish\(13/.test(pocket), "expedition pocket seeds lanterns at the wreck");
assert(!/player\.x = 2200; player\.y = 1600/.test(src), "old mid-ocean boat drop is gone");
assert(/player\.x = LM_WRECK\.x; player\.y = LM_WRECK\.y/.test(src), "fade-in boat drop is the wreck");

assert(/function drawWreck\(/.test(src) && /drawWreck\(\);/.test(src), "the hull paints in the ocean pass");
assert(/sawWreck: !!d\.sawWreck/.test(src) && /wreckHinted: !!state\.wreckHinted/.test(src), "wreck flags persist");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");

// ---- numeric: wreck is a swim, not a step ----
const spawnX = 1880, wreckX = 2680;
const swim = (wreckX - spawnX) / 160;
assert(swim > 4 && swim < 8, "east tease spawn → wreck is a visible swim (~" + swim.toFixed(1) + "s), not a step");

console.log("c147 wreck current: ok (stamps=" + stampCount +
  ", ocean=3200, wreck@" + wreckX +
  ", tease-swim=" + swim.toFixed(1) + "s)");
