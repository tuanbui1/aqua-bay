// C90 — Clownfish stays unlocked when empty. New Game / fresh save
// opens the starter bowl (clear glass, name, empty cue — no padlock).
// Selling or emptying a tank must not re-lock an unlocked species.
// Frost / padlock follow species unlock, never stock === 0.
const fs = require("fs");
const path = require("path");

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/function speciesUnlocked\s*\(/.test(src), "speciesUnlocked helper exists");
assert(/function ensureUnlockFlags\s*\(/.test(src), "ensureUnlockFlags helper exists");
assert(/out\[0\]\s*=\s*true/.test(src), "padSpeciesFlags always forces Clownfish");
assert(/if \(i === 0\) return true/.test(src), "speciesUnlocked treats Clownfish as always open");

const padFn = src.match(/function padSpeciesFlags\s*\(\s*arr\s*\)\s*\{[\s\S]*?\n  \}/);
assert(padFn, "padSpeciesFlags body is present");
assert(/out\[0\]\s*=\s*true/.test(padFn[0]), "Clownfish flag is forced inside padSpeciesFlags");

const speciesFn = src.match(/function speciesUnlocked\s*\(\s*i\s*\)\s*\{[\s\S]*?\n  \}/);
assert(speciesFn, "speciesUnlocked body is present");
assert(!/stock/.test(speciesFn[0]), "speciesUnlocked does not read tank stock");

assert(/if \(!open\) drawTankLockGlass\(t\)/.test(src),
  "padlock / frost draw is gated on species unlock, not empty");
assert(/const open = speciesUnlocked\(i\)/.test(src),
  "drawTank computes open from speciesUnlocked");
assert(/const stocked = open && state\.stock\[i\] > 0/.test(src),
  "stocked is open-and-count, not a lock key");

const drawTank = src.match(/function drawTank\s*\(\s*i\s*\)\s*\{[\s\S]*?\n  \}/);
assert(drawTank, "drawTank body is present");
assert(/if \(!open\) drawTankLockGlass\(t\)/.test(drawTank[0]),
  "empty unlocked bowls do not call lock glass");
assert(/sp\.name/.test(drawTank[0]) && /"empty"/.test(drawTank[0]),
  "unlocked-empty paints the species name and empty cue");
assert(!/if\s*\(\s*!stocked\s*\)\s*drawTankLockGlass/.test(src),
  "padlock is not keyed off empty / !stocked");
assert(!/if\s*\(\s*!stocked\s*\|\|/.test(drawTank[0]),
  "drawTank does not treat empty as locked");

const habitat = src.match(/function drawTankHabitat\s*\(\s*i,\s*t,\s*stocked\s*\)\s*\{[\s\S]*?\n  \}/);
assert(habitat, "drawTankHabitat body is present");
const clownHab = (habitat[0].match(/if \(i === 0\) \{[\s\S]*?else if \(i === 1\)/) || [""])[0];
assert(clownHab.indexOf("drawTankSilhouetteFish") < 0,
  "empty Clownfish bowl has no lock / ghost silhouette");
assert(/drawTankSilhouetteFish\("lock"/.test(habitat[0]),
  "locked neighbors still paint a lock silhouette");

assert(/ensureUnlockFlags\(\)/.test(src), "New Game / load / persist heal unlock flags");
assert(/function startPlay\s*\([\s\S]*?ensureUnlockFlags\(\)/.test(src),
  "startPlay (New Game / Play) forces starter unlock");
assert(/function persist\s*\([\s\S]*?ensureUnlockFlags\(\)/.test(src),
  "persist writes the healed unlock flags");
assert(/function playTankSale\s*\([\s\S]*?ensureUnlockFlags\(\)/.test(src),
  "a cashier sell heals unlock flags instead of re-locking");
assert(!/unlocked\[i\]\s*=\s*false/.test(src),
  "no path sets unlocked[i] = false after a sell");
assert(!/unlocked\[0\]\s*=\s*false/.test(src),
  "no path clears the Clownfish unlock flag");

// Simulate New Game + sell. Same rules as game.js (13 species, starter = 0).
const SPECIES_N = 13;
function padSpeciesFlags(arr) {
  const out = [];
  for (let i = 0; i < SPECIES_N; i++) out[i] = !!(arr && arr[i]);
  out[0] = true;
  return out;
}
function speciesUnlocked(i, unlocked) {
  if (i === 0) return true;
  return !!(unlocked && unlocked[i]);
}
function tankShowsPadlock(i, unlocked, stock) {
  void stock;
  return !speciesUnlocked(i, unlocked);
}

const newGame = { unlocked: padSpeciesFlags([true]), stock: new Array(SPECIES_N).fill(0), money: 0, bag: [] };
assert(newGame.unlocked[0] === true, "New Game has Clownfish unlocked");
assert(newGame.unlocked.filter(Boolean).length === 1, "only the starter is unlocked on New Game");
assert(speciesUnlocked(0, newGame.unlocked), "speciesUnlocked(0) is true on New Game");
assert(!tankShowsPadlock(0, newGame.unlocked, 0),
  "New Game empty Clownfish has no padlock");
assert(tankShowsPadlock(1, newGame.unlocked, 0), "Blue Tang stays locked at $0");
assert(tankShowsPadlock(2, newGame.unlocked, 0), "Goldfish stays locked at $0");
assert(tankShowsPadlock(6, newGame.unlocked, 0), "Puffer stays locked");

const freshLoad = { unlocked: padSpeciesFlags([]), stock: new Array(SPECIES_N).fill(0) };
assert(freshLoad.unlocked[0] === true, "fresh / empty save still unlocks Clownfish");
assert(!tankShowsPadlock(0, freshLoad.unlocked, 0),
  "fresh-save empty starter has no padlock");

const stale = padSpeciesFlags([false, false, false]);
assert(stale[0] === true, "padSpeciesFlags repairs a false Clownfish flag");
assert(speciesUnlocked(0, [false, false, false]),
  "speciesUnlocked(0) is true even if the raw flag is false");
assert(!tankShowsPadlock(0, [false], 0),
  "padlock is not drawn on Clownfish when the flag is stale");

// Dive → stock → sell: stock returns to 0, unlock stays.
const play = { unlocked: padSpeciesFlags([true]), stock: new Array(SPECIES_N).fill(0) };
play.stock[0] = 3;
assert(!tankShowsPadlock(0, play.unlocked, play.stock[0]),
  "stocked Clownfish has no padlock");
play.stock[0] = 0;
play.unlocked = padSpeciesFlags(play.unlocked);
assert(play.unlocked[0] === true, "sell does not clear Clownfish unlock");
assert(speciesUnlocked(0, play.unlocked), "sold-empty Clownfish is still unlocked");
assert(!tankShowsPadlock(0, play.unlocked, 0),
  "sold-empty Clownfish has no padlock");
assert(tankShowsPadlock(1, play.unlocked, 0), "neighbors stay locked after a sell");

play.unlocked[1] = true;
play.stock[1] = 2;
play.stock[1] = 0;
assert(speciesUnlocked(1, play.unlocked), "unlocked Tang stays unlocked when emptied");
assert(!tankShowsPadlock(1, play.unlocked, 0),
  "empty unlocked Tang has no padlock");
assert(tankShowsPadlock(2, play.unlocked, 0), "Goldfish stays locked until its price");

assert(/Aqua Bay · loop 100/.test(src), "title/pause stamp is loop 100");
assert(!/Aqua Bay · loop 99/.test(src), "loop 99 stamp is gone");

assert(/const TANK_W = 210, TANK_H = 156/.test(src), "tank size stays");
const pos = src.match(/const TANK_POS = \[([\s\S]*?)\];/);
assert(pos, "TANK_POS stays");
assert(/\{ x: 340, y: 164 \}/.test(pos[0]) && /\{ x: 776, y: 164 \}/.test(pos[0]),
  "clustered aisle tank positions stay (loop 76)");
assert(/const DIVE_WALK_SPEED\s*=\s*480/.test(src), "dash speed stays 480");
assert(/232 \+ state\.speedLv \* 38 \+ firstBump/.test(src),
  "planted / tap-to-walk base speed stays 232");
assert(/const PLAZA_CAM_CEILING\s*=\s*520/.test(src), "plaza camera ceiling stays 520");
assert(/const DOCK_CAM_FLOOR\s*=\s*1000/.test(src), "dock camera floor stays 1000");
assert(/function actionChipInset\s*\(/.test(src), "DIVE chip inset stays");
assert(/visibleStageBottom/.test(src) && /visualViewport/.test(src),
  "visualViewport DIVE floor stays");
assert(/function wrapHudLines\s*\(/.test(src), "toast wrap from C85 stays");
assert(/HUD_READOUT_PLATE/.test(src), "BAG / money plates stay");
assert(/function drawDiveWalkCue\s*\(/.test(src), "C87 heading chip stays");
assert(/function hideSouthDockHint\s*\(/.test(src), "C87 south-hint gate stays");
assert(/C88 — board seams/.test(src), "C88 plank seams stay");
assert(/#4a9a94/.test(src) && /painted pier-shop clapboard/.test(src),
  "C88 teal clapboard wall stays");
assert(/function tankHudClearY\s*\(/.test(src), "C89 HUD-clear nudge stays");
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/C67/.test(src), "C67 second dive after cashier stays");
assert(/C75|surfaceLock|requestSurface/.test(src), "C75 surface after 1 fish stays");
assert(/function galleryOpen\s*\(/.test(src), "galleryOpen stays");
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
assert(/unlock:\s*0/.test(src) && /unlock:\s*60/.test(src) && /unlock:\s*1400/.test(src),
  "original 5 unlock prices stay");
assert(/unlock:\s*220/.test(src) && /unlock:\s*550/.test(src),
  "Goldfish / Koi unlock prices stay");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");

console.log("c90 starter unlock stays when empty: ok");
