// C145 — divers earn while you are away (offline accrual).
// loop 144 added hireable divers who stock tanks while you play. loop 145
// closes the idle loop: on Continue, credit what those divers would have
// stocked-and-sold while the tab was closed. It is deliberately modest and
// hard-capped so it is a nice "welcome back", never a way to skip the game:
// no divers → nothing, quick reloads (<60s) ignored, idle credit capped at
// 2 hours and at ~30 sales per diver. New Game resets diverLv to 0, so it
// grants nothing. lastPlayed is persisted.
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

// ---- loop stamp bumped to 145 ----
assert(/Aqua Bay · loop 145/.test(src), "title/pause stamp is loop 145");
assert(!/Aqua Bay · loop 144"/.test(src), "loop 144 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 145/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 145, got " + stampCount);
assert(/loop 145 divers earn while you are away/.test(src), "C145 names the feature");
assert(/loop 144 hireable auto-catching divers/.test(src), "loop 144 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

// ---- lastPlayed is persisted, loaded, and reset ----
assert(/lastPlayed: Date\.now\(\),/.test(src), "persist writes the current time as lastPlayed");
assert(/lastPlayed: d\.lastPlayed \| 0,/.test(src), "load reads lastPlayed from the save");
assert(/diverLv: 0, diverAcc: 0, lastPlayed: 0,/.test(src), "lastPlayed defaults to 0 (state + new game)");

// ---- the credit hook runs on Continue, before displayMoney ----
const startPlay = extractFn(src, "startPlay") || "";
assert(/creditOffline\(\);\s*\n\s*state\.displayMoney = state\.money;/.test(startPlay),
  "creditOffline runs in startPlay before displayMoney syncs");
const credit = extractFn(src, "creditOffline") || "";
assert(credit, "creditOffline is extractable");
assert(/const away = state\.lastPlayed \? \(Date\.now\(\) - state\.lastPlayed\) \/ 1000 : 0;/.test(credit),
  "credit uses the real elapsed time since last play");
assert(/state\.money \+= earned;/.test(credit) && /toast\("Welcome back!/.test(credit),
  "credit adds the money and shows a welcome-back toast");
assert(/state\.welcomeBack = \{ amount: earned, life: 5\.0 \};/.test(credit),
  "credit raises a dedicated welcome-back banner (a toast alone is masked by the goal ribbon)");
assert(/state\.lastPlayed = Date\.now\(\);/.test(credit), "credit stamps the new lastPlayed");
// the banner is drawn (on top of the HUD) and ticks down
assert(/function drawWelcomeBack\(\)/.test(src), "there is a welcome-back banner draw");
assert(/drawHUD\(\);\s*\n\s*drawWelcomeBack\(\);/.test(src), "the banner draws over the HUD each frame");
assert(/if \(state\.welcomeBack\) \{\s*\n\s*state\.welcomeBack\.life -= dt;/.test(src),
  "the banner fades out over time");
assert(/welcomeBack: null,/.test(src), "welcomeBack defaults to null");
assert(/Your divers earned \$" \+ wb\.amount \+ " while you were away/.test(src),
  "the banner reads out the amount the crew earned");
// no debug test hook shipped
assert(!/#offlinetest/.test(src), "no #offlinetest debug hook is left in the shipped code");

// ---- the formula: modest and hard-capped ----
const fn = extractFn(src, "offlineEarnings") || "";
assert(fn, "offlineEarnings is extractable");
assert(/if \(!\(state\.diverLv > 0\)\) return 0;/.test(fn), "no divers → no offline income");
assert(/const secs = clamp\(elapsedSec, 0, 2 \* 3600\);/.test(fn), "idle credit is capped at 2 hours");
assert(/if \(secs < 60\) return 0;/.test(fn), "quick reloads (<60s) are ignored");
assert(/const perSec = state\.diverLv \* avg \* 0\.012;/.test(fn), "the per-second rate scales with the crew");
assert(/const cap = avg \* state\.diverLv \* 30;/.test(fn), "the total is capped at ~30 sales per diver");

// ---- numeric proof ----
function earned(diverLv, avg, elapsedSec) {
  if (!(diverLv > 0)) return 0;
  const secs = clamp(elapsedSec, 0, 2 * 3600);
  if (secs < 60) return 0;
  const perSec = diverLv * avg * 0.012;
  const cap = avg * diverLv * 30;
  return Math.max(0, Math.min(Math.floor(perSec * secs), Math.floor(cap)));
}
assert(earned(0, 60, 3600) === 0, "no divers earns nothing offline");
assert(earned(1, 15, 30) === 0, "a 30s reload earns nothing");
assert(earned(1, 15, 600) > 0, "10 minutes away with a diver earns something");
// capped at 2 hours: 3h and 2h earn the same
assert(earned(2, 60, 3 * 3600) === earned(2, 60, 2 * 3600), "credit is capped at 2 hours");
// capped at ~30 sales/diver: a full 2h never exceeds the cap
assert(earned(4, 200, 2 * 3600) === Math.floor(200 * 4 * 30), "the crew cap holds (≈30 sales/diver)");
// monotonic up to the cap
assert(earned(1, 40, 600) <= earned(1, 40, 1200), "more time away → at least as much, up to the cap");

// ---- regression guard: loop 144 divers + a couple earlier ----
assert(/const DIVER_COST = \[120, 260, 560, 1200\];/.test(src), "loop 144 — divers stay");
assert(/updateCashier\(sim\);\n\s*updateDivers\(sim\);/.test(src), "loop 144 — divers tick each play frame");
assert(/const UPGRADE_SLOTS = 5;/.test(src), "loop 144 — the 5-slot upgrade bar stays");
assert(/const flip = topView \? 1 : \(Math\.cos\(ang\) < 0 \? -1 : 1\);/.test(extractFn(src, "drawFishBody") || ""), "loop 140 — fish orientation stays");

console.log("c145 offline accrual: ok (stamps=" + stampCount +
  ", noDivers=0, quickReload=0, cap=2h & ~30 sales/diver, e.g. 4 divers/$200 2h=$" +
  earned(4, 200, 2 * 3600) + ")");
