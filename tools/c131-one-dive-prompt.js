// C131 — one DIVE prompt, opaque pause.
// The dock used to show the DIVE instruction twice: the goal
// ribbon ("Press SPACE or click to DIVE") AND the big pier-board
// action chip ("SPACE  or  click  to  DIVE"). Two identical
// sentences on one screen. loop 131 keeps the teaching ribbon and
// makes the action board just the button word (DIVE / SURFACE) —
// the walk-to-pad cue stays a directional "→ DIVE". The pause
// scrim also went from 0.62 to 0.86 so the upgrade rail / collect
// chip / price cards do not read through the paused menu.
// No gameplay, camera, save, or flow change.
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
        else if (src[j] === "}") {
          depth--;
          if (depth === 0) return src.slice(at, j + 1);
        }
      }
    }
    i = at + needle.length;
  }
  return null;
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

// ---- loop stamp bumped to 131, old stamp gone ----
assert(/Aqua Bay · loop 131/.test(src), "title/pause stamp is loop 131");
assert(!/Aqua Bay · loop 130"/.test(src), "loop 130 stamp is gone");
assert(!/Aqua Bay · loop 129"/.test(src), "loop 129 stamp is gone");
assert(!/Aqua Bay · loop 128"/.test(src), "loop 128 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 131/g) || []).length;
assert(stampCount >= 3, "all three stamps (HUD + pause + help) read loop 131, got " + stampCount);

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 131 one DIVE prompt, opaque pause/.test(src),
  "C131 names the leftover double DIVE prompt");
assert(/loop 130 east dock tap walks east/.test(src),
  "loop 130 breadcrumb stays in the history");
assert(/loop 127 DIVE works on the dock/.test(src),
  "loop 127 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- the goal ribbon still teaches the full DIVE instruction ----
// (the instruction is preserved — only the duplicate on the button is gone)
assert(/"Press SPACE or click to DIVE"/.test(src),
  "the goal ribbon still teaches Press SPACE or click to DIVE");

// ---- the DIVE / SURFACE action boards are just the button word ----
const drawHudSrc = extractFn(src, "drawHUD") || "";
assert(drawHudSrc, "drawHUD is extractable");
assert(!/"SPACE  or  click  to  DIVE"/.test(src),
  "the old verbose desktop DIVE board label is gone");
assert(!/"SPACE  or  click  to  SURFACE"/.test(src),
  "the old verbose desktop SURFACE board label is gone");
// DIVE board: legal => "DIVE", walk-to-pad => directional "→ DIVE"
assert(/const diveLbl = diveActionLegal\(\)\s*\n\s*\? "DIVE"\s*\n\s*: \(thumbCopy\(\) \? "DIVE" : "→ DIVE"\);/.test(src),
  "diveLbl is DIVE when legal, → DIVE while walking to the pad");
// SURFACE board is the plain button word on every platform
assert(/drawPierBoardChip\(sb\.x, sb\.y, sb\.w, sb\.h, "SURFACE", surfFont\);/.test(src),
  "the SURFACE action board is just SURFACE");
// the button words still exist on both boards
assert(/\? "DIVE"/.test(drawHudSrc), "DIVE button word stays");

// ---- pause scrim is opaque enough to cover the HUD ----
const drawPauseSrc = extractFn(src, "drawPause") || "";
assert(drawPauseSrc, "drawPause is extractable");
assert(/rgba\(6, 16, 22, 0\.86\)/.test(drawPauseSrc),
  "pause scrim is the heavier 0.86 fill");
assert(!/rgba\(6, 16, 22, 0\.62\)/.test(drawPauseSrc),
  "the old 0.62 pause scrim is gone");
assert(/ctx\.fillRect\(0, 0, W, H\)/.test(drawPauseSrc),
  "pause scrim still covers the whole stage before the card");

console.log("c131 one dive prompt: ok (stamps=" + stampCount +
  ", diveLbl=DIVE/→DIVE, surfaceLbl=SURFACE, pauseScrim=0.86" +
  ", ribbonTeachesDive=true)");
