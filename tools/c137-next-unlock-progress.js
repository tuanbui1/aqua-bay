// C137 — next unlock shows how much more you need.
// The right rail focuses the next unlock. On a locked card the price
// showed by default and "need $X more" only appeared on hover — so on
// a phone (no hover) and for most players the shortfall was invisible,
// even though it is the core progression signal. loop 137 shows
// "need $X more" on the FOCUSED next-unlock card without a hover; once
// it's affordable it flips to the gold buy price with the pulse. Other
// locked cards keep the plain price (hover still bumps their shortfall).
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

// ---- loop stamp bumped to 137, old stamp gone ----
assert(/Aqua Bay · loop 137/.test(src), "title/pause stamp is loop 137");
assert(!/Aqua Bay · loop 136"/.test(src), "loop 136 stamp is gone");
assert(!/Aqua Bay · loop 135"/.test(src), "loop 135 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 137/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 137, got " + stampCount);

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 137 next unlock shows how much more you need/.test(src),
  "C137 names the hover-only shortfall");
assert(/loop 136 dino swims flat not a paper flip/.test(src),
  "loop 136 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- the focused next-unlock shortfall is no longer hover-only ----
const strip = extractFn(src, "drawSpeciesStrip") || "";
assert(strip, "drawSpeciesStrip is extractable");
assert(/const showNeed = need > 0 && \(i === next \|\| \(hover && need > 0\)\);/.test(strip),
  "showNeed shows the shortfall for the focused next unlock (or any hovered locked card)");
assert(/ctx\.fillText\(showNeed \? "need \$" \+ need \+ " more" : "\$" \+ SPECIES\[i\]\.unlock/.test(strip),
  "the price line reads showNeed, not hover-only");
assert(!/hover && need > 0 \? "need \$" \+ need \+ " more"/.test(strip),
  "the old hover-only shortfall gate is gone");
// price/need font + colour follow showNeed
assert(/\(showNeed \? needPx : pricePx\)/.test(strip),
  "the shortfall font follows showNeed");
assert(/affordable \? "#ffe27a" : showNeed \? "#ffb08a" : "#ffe27a"/.test(strip),
  "unaffordable focus shows the peach shortfall, affordable flips to gold");

// ---- logic proof: reimplement the label choice ----
function label(unlocked, isNext, unlock, money, hover) {
  if (unlocked) return "$" + /*price*/ unlock; // not under test
  const need = Math.max(0, unlock - (money | 0));
  const affordable = isNext && money >= unlock;
  const showNeed = need > 0 && (isNext || (hover && need > 0));
  void affordable;
  return showNeed ? "need $" + need + " more" : "$" + unlock;
}
// focused next unlock, cannot afford, NOT hovering → shortfall shows anyway
assert(label(false, true, 60, 25, false) === "need $35 more",
  "focused next unlock shows the shortfall with no hover");
// focused next unlock, affordable → gold price, no shortfall
assert(label(false, true, 60, 60, false) === "$60",
  "affordable focus shows the price");
// a non-focused locked card without hover keeps the plain price
assert(label(false, false, 220, 25, false) === "$220",
  "a non-focused locked card keeps the price when not hovered");
// a non-focused locked card still reveals its shortfall on hover
assert(label(false, false, 220, 25, true) === "need $195 more",
  "a hovered non-focused locked card still shows its shortfall");

// ---- regression guard: loops 131-136 still intact ----
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

console.log("c137 next unlock progress: ok (stamps=" + stampCount +
  ", focusedShortfall=no-hover, nonFocus=price/hover, loop131-136Intact=true)");
