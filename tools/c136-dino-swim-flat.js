// C136 — dino swims flat, not a paper flip.
// loop 135 fixed the dino WALK turn (drawPlayer). The underwater SWIM
// (drawDiver) had the identical setup: faceDrawX squash-then-mirror
// plus a (1-|faceS|)*0.16 yaw twist. The dino's floatie / snorkel sit
// on one side, so mirroring swaps them at the thin midpoint and reads
// as a paper flip while swimming and turning. loop 136 mirrors the
// dino swim FLAT (full width, sign only, no yaw twist); Reef / Skip
// keep the loop 123 yaw swim.
// Stacked-independent (branched off main after loops 131-135 merged);
// this also guards those stayed put.
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

// ---- loop stamp bumped to 136, old stamp gone ----
assert(/Aqua Bay · loop 136/.test(src), "title/pause stamp is loop 136");
assert(!/Aqua Bay · loop 135"/.test(src), "loop 135 stamp is gone");
assert(!/Aqua Bay · loop 134"/.test(src), "loop 134 stamp is gone");
const stampCount = (src.match(/Aqua Bay · loop 136/g) || []).length;
assert(stampCount >= 3, "all three stamps read loop 136, got " + stampCount);

// ---- breadcrumbs: this loop named, prior loops preserved ----
assert(/loop 136 dino swims flat not a paper flip/.test(src),
  "C136 names the dino swim paper-flip");
assert(/loop 135 dino turns flat not a paper flip/.test(src),
  "loop 135 breadcrumb (the walk fix) stays");
assert(/loop 123 body turn not paper flip/.test(src),
  "loop 123 breadcrumb (origin of faceDrawX) stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(!/Homa/.test(src), "no Homa names");

// ---- drawDiver mirrors the asymmetric dino swim flat ----
const dd = extractFn(src, "drawDiver") || "";
assert(dd, "drawDiver is extractable");
assert(/const asymTurn = skin === "dino";/.test(dd),
  "the swim asymmetric-mascot turn is gated on the dino skin");
assert(/const swimYaw = asymTurn \? 0 : \(1 - Math\.abs\(faceS\)\) \* 0\.16;/.test(dd),
  "the dino swim drops the yaw twist");
assert(/flip \* \(1 \+ Math\.abs\(kickWave\) \* 0\.04\)/.test(dd),
  "the dino swim scaleX is a flat sign mirror at full width");
assert(/faceDrawX\(faceS, 1 \+ Math\.abs\(kickWave\) \* 0\.04\)/.test(dd),
  "reef / skip swim keep the faceDrawX yaw");
assert(/scaleX: swimScaleX/.test(dd) && /rot: tilt \* flip \+ swimYaw/.test(dd),
  "the swim blit consumes swimScaleX / swimYaw");
// C58 — the diver is never rotated by full facing
assert(!/rot:\s*ang/.test(dd) && !/rotate\(ang/.test(dd),
  "C58 — diver is not rotated by full facing");

// ---- numeric proof: dino swim never thins, reef still yaws ----
function faceDrawX(faceS, extraX) {
  const flip = faceS < 0 ? -1 : 1;
  const yaw = 1 - Math.abs(faceS);
  const body = 1 - yaw * 0.38;
  return flip * body * (extraX == null ? 1 : extraX);
}
function swimScaleX(asymTurn, faceS, kickWave) {
  const flip = faceS < 0 ? -1 : 1;
  const ex = 1 + Math.abs(kickWave) * 0.04;
  return asymTurn ? flip * ex : faceDrawX(faceS, ex);
}
// dino: magnitude stays >= full width (never the 0.62 squash)
for (let i = 0; i <= 40; i++) {
  const s = -1 + i / 20;
  const x = swimScaleX(true, s, 0);
  assert(Math.abs(Math.abs(x) - 1) < 1e-9,
    "dino swim stays full width (no squash), got " + x + " at faceS=" + s);
}
assert(swimScaleX(true, 1, 0) === 1 && swimScaleX(true, -1, 0) === -1,
  "dino swim still faces both ways (sign mirror)");
// reef / skip keep the loop 123 yaw: thins to 0.62 at the midpoint
assert(Math.abs(swimScaleX(false, 0, 0) - 0.62) < 1e-9,
  "reef / skip still thin to 0.62 mid-swim-turn (loop 123 intact)");

// ---- regression guard: loops 131-135 still intact ----
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

console.log("c136 dino swim flat: ok (stamps=" + stampCount +
  ", dinoSwimScaleX=|1| always, reefMidTurn=0.62, loop123+131-135Intact=true)");
