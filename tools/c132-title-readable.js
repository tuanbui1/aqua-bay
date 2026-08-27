// C132 — title "Who's diving?" readable.
// The picker header was light cyan (#c8e8ee) painted straight over
// the bright animated water / sky with no plate or shadow, so it
// washed out — while the name plates below it already sit on a dark
// plate. loop 132 wraps the header in a soft dark drop shadow (and a
// touch brighter fill) so it stays legible, then restores canvas
// state so the shadow does not leak onto the character cards.
// Stacked on loop 131, so this also guards that loop 131 stayed put.
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

// ---- loop stamp bumped to 132, old stamp gone ----
assert(/Aqua Bay · loop 132/.test(src), "title/pause stamp is loop 132");
assert(!/Aqua Bay · loop 131"/.test(src), "loop 131 stamp is gone");
assert(!/Aqua Bay · loop 130"/.test(src), "loop 130 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 132/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 132, got " + stampCount);

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 132 title Who's diving readable/.test(src),
  "C132 names the washed-out picker header");
assert(/loop 131 one DIVE prompt, opaque pause/.test(src),
  "loop 131 breadcrumb stays in the history");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- the header gets a shadow, drawn then restored (no leak) ----
const pickerSrc = extractFn(src, "drawSkinPicker") || "";
assert(pickerSrc, "drawSkinPicker is extractable");
assert(/shadowColor = "rgba\(4, 12, 18, 0\.85\)"/.test(pickerSrc),
  "the header gets a soft dark drop shadow");
assert(/shadowBlur = 8/.test(pickerSrc), "the header shadow has a soft blur");
// the shadow is wrapped in save/restore right around the header fillText
assert(/ctx\.save\(\);[\s\S]*?shadowColor[\s\S]*?fillText\("Who's diving\?", cx, whoY\);[\s\S]*?ctx\.restore\(\);/.test(pickerSrc),
  "the header shadow is scoped by save/restore so it cannot leak to the cards");
// the name-plate fills after the header must not inherit a shadow state
assert(pickerSrc.indexOf("ctx.restore();") < pickerSrc.indexOf('fillText(meta.name'),
  "canvas state is restored before the character name plates draw");

// ---- regression guard: loop 131 changes are still intact ----
assert(!/"SPACE  or  click  to  DIVE"/.test(src),
  "loop 131 — verbose DIVE board label stays gone");
assert(/drawPierBoardChip\(sb\.x, sb\.y, sb\.w, sb\.h, "SURFACE", surfFont\);/.test(src),
  "loop 131 — SURFACE board stays the plain button word");
assert(/rgba\(6, 16, 22, 0\.86\)/.test(extractFn(src, "drawPause") || ""),
  "loop 131 — the opaque 0.86 pause scrim stays");

console.log("c132 title readable: ok (stamps=" + stampCount +
  ", headerShadow=0.85/blur8, restored=true, loop131Intact=true)");
