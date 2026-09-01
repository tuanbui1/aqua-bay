// C146 — hired divers are visible NPCs on the dock, not just a timer.
// loop 144 added the hire + auto-stock mechanic. loop 145 closed the
// idle loop with offline accrual. loop 146 paints the crew: each hire
// is a goggled walker who lives at the DIVE pad, walks to the bowl
// they just stocked (fish in hand), then walks home. The stock tick
// itself is unchanged so the idle economy stays.
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

// ---- loop stamp bumped to 146 ----
assert(/Aqua Bay · loop 146/.test(src), "title/pause stamp is loop 146");
assert(!/Aqua Bay · loop 145"/.test(src), "loop 145 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 146/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 146, got " + stampCount);
assert(/loop 146 visible hired diver NPCs/.test(src), "C146 names the feature");
assert(/loop 145 divers earn while you are away/.test(src), "loop 145 breadcrumb stays");
assert(/loop 144 hireable auto-catching divers/.test(src), "loop 144 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

// ---- crew data + helpers ----
assert(/const CREW_LOOKS = \[/.test(src), "CREW_LOOKS exists");
assert(/shirt: "#148a8c"/.test(src) && /shirt: "#e85d4c"/.test(src) &&
  /shirt: "#2a6a38"/.test(src) && /shirt: "#3d5a9a"/.test(src),
  "four distinct crew wetsuit colors");
assert(/const crew = \[\];/.test(src), "a live crew array sits next to customers");
assert(/crew\.length = 0/.test(src), "New Game clears the crew");
assert(/if \(opt\.crew \|\| opt\.goggles\) return null;/.test(src),
  "crew never blit a cashier / regular sprite");

const home = extractFn(src, "crewHome") || "";
assert(home, "crewHome is extractable");
assert(/760 \+ \(i \| 0\) \* 40/.test(home) && /y: 972/.test(home),
  "crew home is on the painted dock boards, staggered per hire");
const pad = extractFn(src, "crewTankPoint") || "";
assert(/TANK_POS\[tank\]/.test(pad) && /TANK_H \+ 38/.test(pad),
  "a delivery dest is the front of that bowl");

const sync = extractFn(src, "syncCrew") || "";
assert(sync, "syncCrew is extractable");
assert(/const n = clamp\(state\.diverLv \| 0, 0, DIVER_MAX\);/.test(sync),
  "crew size matches the hired diver count");
assert(/while \(crew\.length > n\) crew\.pop\(\);/.test(sync), "extras leave when the crew shrinks");
assert(/crew\.push\(\{/.test(sync) && /goggles: true, crew: true/.test(sync),
  "each hire is a goggled crew person");
assert(/CREW_LOOKS\[i % CREW_LOOKS\.length\]/.test(sync), "looks rotate so a full crew is not clones");

const send = extractFn(src, "sendCrewToTank") || "";
assert(send, "sendCrewToTank is extractable");
assert(/d\.job = "tank"/.test(send) && /d\.carry = tank/.test(send),
  "a delivery puts a fish in a diver's hands and sends them to that bowl");
assert(/crewTankPoint\(tank, best\)/.test(send), "the dest is the bowl they just stocked");

const walk = extractFn(src, "updateCrew") || "";
assert(walk, "updateCrew is extractable");
assert(/const speed = 168;/.test(walk), "crew walk at a readable 168 px/s");
assert(/d\.job === "tank" && d\.wait > 0\.28/.test(walk),
  "after a beat at the bowl they drop the fish and walk home");
assert(/d\.job === "dock" && d\.wait > 1\.4/.test(walk),
  "idle crew wander the DIVE pad instead of statue-ing");

// ---- the stock tick still fires, then the walk is assigned ----
const upd = extractFn(src, "updateDivers") || "";
assert(/syncCrew\(\);/.test(upd), "updateDivers keeps the crew in sync");
assert(/const i = diverStockTarget\(\);/.test(upd) && /diverStockOne\(i\);/.test(upd),
  "each tick still stocks the chosen tank");
assert(/sendCrewToTank\(i\);/.test(upd), "each tick also sends a walker to that tank");
assert(/updateCrew\(dt\);/.test(upd), "the walkers tick every play frame");
assert(/buyDiver[\s\S]*syncCrew\(\);/.test(src), "hiring a diver sprouts them immediately");

// ---- they draw in the shop actor pass, with goggles + a carried fish ----
assert(/for \(const d of crew\) pushActorPerson\(d\);/.test(src),
  "crew y-sort with customers and the player");
assert(/if \(opt\.goggles\) \{/.test(src) && /rgba\(90, 210, 230/.test(src),
  "goggles paint a teal dive mask");
assert(/if \(opt\.crew\) drawFishBody\(SPECIES\[opt\.carry\]/.test(src),
  "a delivering diver carries the fish, not a brown parcel");
assert(/opt\.carry >= 0 \? "STOCK" : "DIVER"/.test(src),
  "a DIVER / STOCK chip labels the walker so they are not a silent extra");

// ---- numeric proof: crew size, walk time dock→Clownfish ----
function crewCount(diverLv) { return clamp(diverLv | 0, 0, 4); }
assert(crewCount(0) === 0, "no hire → no walker");
assert(crewCount(1) === 1 && crewCount(3) === 3 && crewCount(4) === 4,
  "1..4 hires → that many walkers");
assert(crewCount(9) === 4, "crew never exceeds DIVER_MAX");
function homeX(i) { return 760 + i * 40; }
assert(homeX(0) === 760 && homeX(3) === 880, "a full crew still stands on the dive-pad boards");
const tank0 = { x: 340, y: 164 };
const dest = { x: tank0.x + 210 / 2 + 22, y: tank0.y + 156 + 38 };
const dist = Math.hypot(dest.x - 760, dest.y - 972);
const walkSec = dist / 168;
assert(walkSec > 3 && walkSec < 7,
  "dock→Clownfish is a visible walk (~" + walkSec.toFixed(1) + "s), not a teleport");

// ---- regression: idle economy + recent polish stay ----
assert(/const DIVER_COST = \[120, 260, 560, 1200\];/.test(src), "loop 144 — divers stay");
assert(/updateCashier\(sim\);\n\s*updateDivers\(sim\);/.test(src), "loop 144 — divers tick each play frame");
assert(/function creditOffline\(\)/.test(src) && /function offlineEarnings\(/.test(src),
  "loop 145 — offline accrual stays");
assert(/const flip = topView \? 1 : \(Math\.cos\(ang\) < 0 \? -1 : 1\);/.test(extractFn(src, "drawFishBody") || ""),
  "loop 140 — fish orientation stays");
assert(/const pitch = clamp\(\(player\.pitch \|\| 0\) \* 1\.0 \+ headingPitch \+ kickWave \* 0\.05, -0\.9, 0\.9\);/.test(extractFn(src, "drawDiver") || ""),
  "loop 141 — diver dive angle stays");

console.log("c146 visible divers: ok (stamps=" + stampCount +
  ", crew 0/1/4=" + [crewCount(0), crewCount(1), crewCount(4)].join("/") +
  ", dock→clownfish=" + walkSec.toFixed(1) + "s)");
