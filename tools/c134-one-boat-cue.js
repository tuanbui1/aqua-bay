// C134 — one BOAT cue on the action board.
// The third action board completes the loop 131 dedup. Near the boat
// the goal ribbon says "Press SPACE to start an expedition ($35)"
// while the action board separately said "SPACE · Expedition $35" —
// the same double SPACE-instruction the DIVE (loop 131) and SURFACE
// (loop 133) boards had. loop 134 makes the board a plain labelled
// button ("Expedition $35" on desktop, "BOAT $35" on the phone thumb),
// leaving the ribbon to carry the instruction.
// Stacked on loops 131-133; this also guards those stayed put.
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

// ---- loop stamp bumped to 134, old stamp gone ----
assert(/Aqua Bay · loop 134/.test(src), "title/pause stamp is loop 134");
assert(!/Aqua Bay · loop 133"/.test(src), "loop 133 stamp is gone");
assert(!/Aqua Bay · loop 132"/.test(src), "loop 132 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 134/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 134, got " + stampCount);

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 134 one BOAT cue on the action board/.test(src),
  "C134 names the leftover double BOAT instruction");
assert(/loop 133 one SURFACE cue at the waterline/.test(src),
  "loop 133 breadcrumb stays in the history");
assert(/loop 131 one DIVE prompt, opaque pause/.test(src),
  "loop 131 breadcrumb stays in the history");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- the boat board is a plain labelled button ----
assert(!/"SPACE · Expedition \$35"/.test(src),
  "the verbose SPACE · Expedition board label is gone");
assert(/thumbCopy\(\) \? "BOAT \$35" : "Expedition \$35"/.test(src),
  "the boat board is Expedition $35 (desktop) / BOAT $35 (thumb)");
// the goal ribbon still teaches the expedition instruction
assert(/"Press SPACE to start an expedition \(\$35\)"/.test(src),
  "the goal ribbon still teaches Press SPACE to start an expedition");

// ---- regression guard: loops 131-133 still intact ----
assert(!/"SPACE  or  click  to  DIVE"/.test(src),
  "loop 131 — verbose DIVE board label stays gone");
assert(/drawPierBoardChip\(sb\.x, sb\.y, sb\.w, sb\.h, "SURFACE", surfFont\);/.test(src),
  "loop 131 — SURFACE action board stays the plain button word");
assert(/rgba\(6, 16, 22, 0\.86\)/.test(extractFn(src, "drawPause") || ""),
  "loop 131 — the opaque 0.86 pause scrim stays");
assert(/shadowColor = "rgba\(4, 12, 18, 0\.85\)"/.test(extractFn(src, "drawSkinPicker") || ""),
  "loop 132 — the readable title header shadow stays");
assert(/ctx\.fillText\("SURFACE", OCEAN\.w \/ 2, 70\);/.test(src),
  "loop 133 — the waterline marker stays just SURFACE");

console.log("c134 one boat cue: ok (stamps=" + stampCount +
  ", boatBoard=Expedition $35/BOAT $35, ribbonTeachesBoat=true, loop131-133Intact=true)");
