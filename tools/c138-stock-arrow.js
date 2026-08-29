// C138 — clearer walk-to-stock direction arrow.
// When the tank to stock is off-screen, drawStockWalkCue draws a small
// pier-board chip with a direction arrow — the only "which way" cue. It
// was an 8px filled triangle with no outline, pinned at a fixed y, so it
// read faint next to the bold chip (a playtest got confused about where
// to walk). loop 138 makes that arrow match the on-tank arrow: bigger
// (11px), outlined, and centered in the chip. Visual only — the
// goto-stock hitbox, the label, and the navigation are unchanged.
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

// ---- loop stamp bumped to 138, old stamp gone ----
assert(/Aqua Bay · loop 138/.test(src), "title/pause stamp is loop 138");
assert(!/Aqua Bay · loop 137"/.test(src), "loop 137 stamp is gone");
assert(!/Aqua Bay · loop 136"/.test(src), "loop 136 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 138/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 138, got " + stampCount);

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 138 clearer walk-to-stock direction arrow/.test(src),
  "C138 names the faint off-screen stock arrow");
assert(/loop 137 next unlock shows how much more you need/.test(src),
  "loop 137 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- the off-screen stock arrow is bigger, outlined, centered ----
const cue = extractFn(src, "drawStockWalkCue") || "";
assert(cue, "drawStockWalkCue is extractable");
assert(/ctx\.translate\(chip\.x \+ 15, chip\.y \+ chip\.h \/ 2\);/.test(cue),
  "the off-screen arrow is centered in the chip");
assert(/ctx\.strokeStyle = "rgba\(80,50,10,0\.5\)"/.test(cue) && /ctx\.fill\(\); ctx\.stroke\(\);/.test(cue),
  "the off-screen arrow now has an outline stroke like the on-tank arrow");
assert(/ctx\.moveTo\(11, 0\);/.test(cue),
  "the off-screen arrow is the larger 11px triangle");
assert(!/ctx\.translate\(chip\.x \+ 14, chip\.y \+ 16\);/.test(cue),
  "the old faint fixed-position arrow is gone");
// the goto-stock hitbox and label are untouched
assert(/btn\("goto-stock", chip\.x, chip\.y, chip\.w, chip\.h\);/.test(cue),
  "the goto-stock hitbox stays on the chip");
assert(/const label = thumbCopy\(\) \? "tap to stock" : "walk here to stock";/.test(cue),
  "the stock label copy is unchanged");

// ---- regression guard: loops 131-137 still intact ----
assert(!/"SPACE  or  click  to  DIVE"/.test(src),
  "loop 131 — verbose DIVE board label stays gone");
assert(/rgba\(6, 16, 22, 0\.86\)/.test(extractFn(src, "drawPause") || ""),
  "loop 131 — the opaque 0.86 pause scrim stays");
assert(/shadowColor = "rgba\(4, 12, 18, 0\.85\)"/.test(extractFn(src, "drawSkinPicker") || ""),
  "loop 132 — the readable title header shadow stays");
assert(/ctx\.fillText\("SURFACE", OCEAN\.w \/ 2, 70\);/.test(src),
  "loop 133 — the waterline marker stays just SURFACE");
assert(/thumbCopy\(\) \? "BOAT \$35" : "Expedition \$35"/.test(src),
  "loop 134 — the boat board stays a plain labelled button");
assert(/return asymTurn \? flip \* ex : faceDrawX\(faceS, extraX\);/.test(extractFn(src, "drawPlayer") || ""),
  "loop 135 — the flat dino WALK turn stays");
assert(/flip \* \(1 \+ Math\.abs\(kickWave\) \* 0\.04\)/.test(extractFn(src, "drawDiver") || ""),
  "loop 136 — the flat dino SWIM turn stays");
assert(/const showNeed = need > 0 && \(i === next \|\| \(hover && need > 0\)\);/.test(extractFn(src, "drawSpeciesStrip") || ""),
  "loop 137 — the no-hover next-unlock shortfall stays");

console.log("c138 stock arrow: ok (stamps=" + stampCount +
  ", arrow=11px/outlined/centered, hitbox+label unchanged, loop131-137Intact=true)");
