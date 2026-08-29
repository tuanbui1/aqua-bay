// C139 — next-buy caption lights up when you can afford it.
// The money readout's "Next <thing> $<cost>" caption (the cheapest next
// upgrade / unlock from nextGoal) looked identical whether you were still
// saving or could already afford it. loop 139 brightens it to cream and
// gives a gentle pulse once state.money >= cost (matching the affordable
// tank / upgrade cards); otherwise it stays the quiet gold savings target.
// Same copy, same position, scoped by save/restore.
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

// ---- loop stamp bumped to 139, old stamp gone ----
assert(/Aqua Bay · loop 139/.test(src), "title/pause stamp is loop 139");
assert(!/Aqua Bay · loop 138"/.test(src), "loop 138 stamp is gone");
assert(!/Aqua Bay · loop 137"/.test(src), "loop 137 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 139/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 139, got " + stampCount);

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 139 next-buy caption lights up when you can afford it/.test(src),
  "C139 names the flat next-buy caption");
assert(/loop 138 clearer walk-to-stock direction arrow/.test(src),
  "loop 138 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- the caption reacts to affordability, scoped by save/restore ----
const mr = extractFn(src, "drawMoneyReadout") || "";
assert(mr, "drawMoneyReadout is extractable");
assert(/const canBuy = \(state\.money \| 0\) >= ng\.cost;/.test(mr),
  "the caption computes affordability from money vs the next cost");
assert(/if \(canBuy\) ctx\.globalAlpha \*= 0\.85 \+ 0\.15 \* Math\.sin\(state\.time \* 4\);/.test(mr),
  "an affordable next-buy gently pulses");
assert(/ctx\.fillStyle = canBuy \? "#fff2c4" : "#ffe27a";/.test(mr),
  "an affordable next-buy brightens to cream, otherwise quiet gold");
// copy + position unchanged, and the effect cannot leak (save/restore)
assert(/ctx\.fillText\("Next " \+ ng\.name \+ " \$" \+ ng\.cost, textX,/.test(mr),
  "the caption copy and position are unchanged");
assert(/const canBuy[\s\S]*ctx\.save\(\);[\s\S]*ctx\.fillText\("Next "[\s\S]*ctx\.restore\(\);/.test(mr),
  "the brighten / pulse is scoped by save/restore so it cannot leak");

// ---- regression guard: loops 131-138 still intact ----
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
assert(/ctx\.moveTo\(11, 0\);/.test(extractFn(src, "drawStockWalkCue") || ""),
  "loop 138 — the clearer stock direction arrow stays");

console.log("c139 next-buy ready: ok (stamps=" + stampCount +
  ", affordable=cream+pulse, saving=quiet gold, loop131-138Intact=true)");
