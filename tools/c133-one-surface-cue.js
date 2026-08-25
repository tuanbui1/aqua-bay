// C133 — one SURFACE cue at the waterline.
// loop 131 made the SURFACE action board just the button word, but
// the diegetic waterline marker in the ocean still read the full
// "SURFACE  ·  SPACE or click" sentence — the same double-instruction
// pattern loop 131 removed for DIVE. loop 133 makes that waterline
// marker just the word SURFACE too. The goal ribbon still teaches
// "Surface — SPACE or click", so the instruction is preserved and the
// surface is not labelled twice with a full sentence.
// Stacked on loops 131-132; this also guards those stayed put.
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

// ---- loop stamp bumped to 133, old stamp gone ----
assert(/Aqua Bay · loop 133/.test(src), "title/pause stamp is loop 133");
assert(!/Aqua Bay · loop 132"/.test(src), "loop 132 stamp is gone");
assert(!/Aqua Bay · loop 131"/.test(src), "loop 131 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 133/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 133, got " + stampCount);

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 133 one SURFACE cue at the waterline/.test(src),
  "C133 names the leftover verbose waterline SURFACE cue");
assert(/loop 132 title Who's diving readable/.test(src),
  "loop 132 breadcrumb stays in the history");
assert(/loop 131 one DIVE prompt, opaque pause/.test(src),
  "loop 131 breadcrumb stays in the history");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- the waterline marker is just the word SURFACE ----
assert(!/"SURFACE  ·  SPACE or click"/.test(src),
  "the verbose waterline SURFACE sentence is gone");
assert(/ctx\.fillText\("SURFACE", OCEAN\.w \/ 2, 70\);/.test(src),
  "the ocean waterline marker is just SURFACE");
// the goal ribbon still teaches the surface instruction
assert(/"Surface — SPACE or click"/.test(src),
  "the goal ribbon still teaches Surface — SPACE or click");

// ---- regression guard: loops 131 + 132 still intact ----
assert(!/"SPACE  or  click  to  DIVE"/.test(src),
  "loop 131 — verbose DIVE board label stays gone");
assert(!/"SPACE  or  click  to  SURFACE"/.test(src),
  "loop 131 — verbose SURFACE board label stays gone");
assert(/drawPierBoardChip\(sb\.x, sb\.y, sb\.w, sb\.h, "SURFACE", surfFont\);/.test(src),
  "loop 131 — SURFACE action board stays the plain button word");
assert(/rgba\(6, 16, 22, 0\.86\)/.test(extractFn(src, "drawPause") || ""),
  "loop 131 — the opaque 0.86 pause scrim stays");
assert(/shadowColor = "rgba\(4, 12, 18, 0\.85\)"/.test(extractFn(src, "drawSkinPicker") || ""),
  "loop 132 — the readable title header shadow stays");

console.log("c133 one surface cue: ok (stamps=" + stampCount +
  ", waterlineCue=SURFACE, ribbonTeachesSurface=true, loop131+132Intact=true)");
