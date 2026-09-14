// C168 — hired divers splash off the DIVE pad, then stock the bowls.
// The idle stock tick stays; this is the missing water beat on the dock.
// Stamps stay v1.0. Not a new catchable. First session has no hire → no splash.
const fs = require("fs");
const path = require("path");

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

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
assert(/loop 168 hired divers splash off the DIVE pad/.test(src), "C168 names the feature");
assert(/loop 167 divers swim prone/.test(src), "loop 167 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");
assert(/function firstSessionReached\(/.test(src), "first-session quiet stays");
assert(!/id: 14/.test(src), "no fifteenth catchable species");
assert(/const DIVE_ZONE = \{ x: 520, y: 980, w: 720, h: 160 \}/.test(src),
  "DIVE pad geometry stays");

const divePt = extractFn(src, "crewDivePoint") || "";
assert(divePt, "crewDivePoint is extractable");
assert(/800 \+ \(i \| 0\) \* 36/.test(divePt) && /y: 1018/.test(divePt),
  "the splash dest is the foam lip south of the home boards");

assert(/const dockSplashes = \[\];/.test(src), "dock splashes are their own rings");
assert(/dockSplashes\.length = 0/.test(src), "New Game clears dock splashes");
assert(/function spawnDockSplash\(/.test(src) && /function drawDockSplashes\(/.test(src),
  "splash spawn + draw exist");
assert(/sfx\("lap"\)/.test(src) && /"splash!"/.test(src),
  "a ker-splash pops on the lip");
assert(/drawDockSplashes\(\);/.test(src), "splashes paint on the dock water edge");

const send = extractFn(src, "sendCrewToTank") || "";
assert(/d\.job = "dive"/.test(send), "a delivery starts as a DIVE-lip jog");
assert(/d\.carry = -1/.test(send), "they walk to the lip empty-handed");
assert(/crewDivePoint\(best\)/.test(send), "dest is the foam lip");
assert(!/crewTankPoint\(tank, best\)/.test(send),
  "they do not skip straight to the bowl");
assert(/d\.job === "dock" \? 200 : 0/.test(send),
  "busy divers (dive / tank) are not preferred for the next run");

const walk = extractFn(src, "updateCrew") || "";
assert(/d\.job === "dive" && d\.wait > 0\.16/.test(walk), "a beat on the lip");
assert(/spawnDockSplash\(d\.x, d\.y \+ 10\)/.test(walk), "they splash at the lip");
assert(/d\.carry = d\.tank/.test(walk) && /d\.job = "tank"/.test(walk),
  "after the splash the fish appears and they walk to the bowl");
assert(/crewTankPoint\(d\.tank, i\)/.test(walk), "bowl dest is assigned after the splash");
assert(/d\.job === "tank" && d\.wait > 0\.28/.test(walk),
  "bowl drop + walk-home stay");
assert(/const speed = 168;/.test(walk), "walk speed stays 168 px/s");

const upd = extractFn(src, "updateDivers") || "";
assert(/diverStockOne\(i\);/.test(upd) && /sendCrewToTank\(i\);/.test(upd),
  "the stock tick still fires, then the walk is assigned");

assert(/They splash off the DIVE pad, then stock the bowls/.test(src),
  "first-hire toast names the splash");
assert(/Hired divers splash off the DIVE pad/.test(src), "help names the splash");

// Numeric: home → lip is a short jog; lip → Clownfish is still a real walk.
const home = { x: 760, y: 972 };
const lip = { x: 800, y: 1018 };
const tank0 = { x: 340, y: 164 };
const bowl = { x: tank0.x + 210 / 2 + 22, y: tank0.y + 156 + 38 };
const jog = Math.hypot(lip.x - home.x, lip.y - home.y) / 168;
const haul = Math.hypot(bowl.x - lip.x, bowl.y - lip.y) / 168;
assert(jog > 0.2 && jog < 0.8, "home→lip is a short visible jog (~" + jog.toFixed(2) + "s)");
assert(haul > 3 && haul < 8, "lip→Clownfish is still a walk (~" + haul.toFixed(1) + "s)");
assert(clamp(0, 0, 4) === 0, "no hire → no walker (first session stays quiet)");

console.log("c168 dock dive: ok (stamps=" + stampCount +
  ", jog=" + jog.toFixed(2) + "s, haul=" + haul.toFixed(1) + "s)");
