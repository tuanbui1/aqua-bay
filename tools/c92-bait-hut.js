// C92 — first-dock BAIT is a pier hut, not a toy triangle roof.
// OPEN is the hanging shop sign only — no ghost in the dusk town.
// Paint-only: planted positions, walk colliders, cameras, HUD, DIVE,
// unlocks, and prices stay.
const fs = require("fs");
const path = require("path");

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

const hut = src.match(/function drawBaitShack\s*\(\s*x,\s*y\s*\)\s*\{[\s\S]*?\n  \}/);
assert(hut, "drawBaitShack body is present");
assert(/C92 — pier bait hut/.test(hut[0]), "BAIT draw path is the C92 hut");
assert(/porch post/.test(hut[0]), "hut has a porch post");
assert(/hanging life ring/.test(hut[0]), "hut hangs a life ring");
assert(/fillText\("BAIT"/.test(hut[0]), "hut still says BAIT");
assert(/800 13px Fredoka/.test(hut[0]), "BAIT type is readable on the facade");
assert(/[Ww]ood walls/.test(hut[0]), "hut comment names wood walls");
assert(/roundRect\(bx, by, bw, bh/.test(hut[0]), "hut paints a wall box, not a lone roof");
assert(/createLinearGradient\(postX/.test(hut[0]), "porch post is a timber, not a missing stick");
assert(/ctx\.arc\(0, 0, 12/.test(hut[0]), "life ring is a painted ring, not a blue oval blob");
assert(/Shallow shed roof/.test(hut[0]) || /fillRect\(bx - 8, by - 4/.test(hut[0]),
  "roof is a shed on the walls, not a lone triangle");
assert(!/moveTo\(x - 50, y \+ 22\)/.test(hut[0]), "old toy triangle roof is gone");
assert(!/800 9px Fredoka/.test(hut[0]), "old 9px roof BAIT scrap is gone");
assert(!/ellipse\(x \+ 28, y \+ 52, 7, 10/.test(src), "old blue oval blob is gone");

const opens = src.match(/fillText\("OPEN"/g) || [];
assert(opens.length === 1, "OPEN is drawn once — the hanging sign");
const sign = src.match(/function drawHangingSign\s*\(\s*x,\s*y\s*\)\s*\{[\s\S]*?\n  \}/);
assert(sign && /fillText\("OPEN"/.test(sign[0]), "the one OPEN is the hanging shop sign");
assert(!/fillText\("OPEN", bx \+ bw \* 0\.5/.test(src),
  "town inn no longer ghosts OPEN in the dusk sky");
assert(/C92 — dusk town is backdrop only/.test(src),
  "town backdrop comments the one-OPEN rule");
assert(/function townBackdropAlpha\s*\(/.test(src),
  "town fade is well-only, not a top-edge ghost");
assert(/kind: "inn", fx: 0\.500/.test(src),
  "dusk inn is not stacked on the hanging OPEN x");
assert(!/kind: "inn", fx: 0\.568/.test(src), "old inn-over-OPEN slot is gone");

assert(/const BAIT_HUT = \{ x: 1124, y: 918 \}/.test(src), "hut planted position stays");
assert(/const POP_VEND = \{ x: 996, y: 918 \}/.test(src), "POP planted position stays");
assert(/const OPEN_SIGN = \{ x: 1052, y: 924 \}/.test(src), "OPEN planted position stays");
assert(/return \{ x: 500, y: 890, w: 760, h: 130 \}/.test(src),
  "shopDockWalk collider stays");
assert(!/pushOut\(BAIT_HUT/.test(src) && !/pushOut\(POP_VEND/.test(src) &&
  !/pushOut\(OPEN_SIGN/.test(src),
  "hut / POP / OPEN did not grow walk colliders");

assert(/Aqua Bay · loop 92/.test(src), "title/pause stamp is loop 92");
assert(!/Aqua Bay · loop 91/.test(src), "loop 91 stamp is gone");

assert(/C91 — soda cooler/.test(src), "C91 POP cooler stays");
assert(/C91 — hanging shop sign/.test(src), "C91 hanging OPEN stays");
assert(/C91 — south lip/.test(src), "C91 water-edge foam stays");
assert(/const DIVE_WALK_SPEED\s*=\s*480/.test(src), "dash speed stays 480");
assert(/232 \+ state\.speedLv \* 38 \+ firstBump/.test(src),
  "planted / tap-to-walk base speed stays 232");
assert(/const PLAZA_CAM_CEILING\s*=\s*520/.test(src), "plaza camera ceiling stays 520");
assert(/const DOCK_CAM_FLOOR\s*=\s*1000/.test(src), "dock camera floor stays 1000");
assert(/function actionChipInset\s*\(/.test(src), "DIVE chip inset stays");
assert(/visibleStageBottom/.test(src) && /visualViewport/.test(src),
  "visualViewport DIVE floor stays");
assert(/function wrapHudLines\s*\(/.test(src), "toast wrap from C85 stays");
assert(/HUD_READOUT_PLATE/.test(src), "BAG / money plates stay");
assert(/function drawDiveWalkCue\s*\(/.test(src), "C87 heading chip stays");
assert(/function hideSouthDockHint\s*\(/.test(src), "C87 south-hint gate stays");
assert(/C88 — board seams/.test(src), "C88 plank seams stay");
assert(/#4a9a94/.test(src) && /painted pier-shop clapboard/.test(src),
  "C88 teal clapboard wall stays");
assert(/function tankHudClearY\s*\(/.test(src), "C89 HUD-clear nudge stays");
assert(/function speciesUnlocked\s*\(/.test(src), "C90 unlock gate stays");
assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/C67/.test(src), "C67 second dive after cashier stays");
assert(/C75|surfaceLock|requestSurface/.test(src), "C75 surface after 1 fish stays");
assert(/function galleryOpen\s*\(/.test(src), "galleryOpen stays");
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
assert(/unlock:\s*0/.test(src) && /unlock:\s*60/.test(src) && /unlock:\s*1400/.test(src),
  "original 5 unlock prices stay");
assert(/unlock:\s*220/.test(src) && /unlock:\s*550/.test(src),
  "Goldfish / Koi unlock prices stay");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/Homa/.test(src), "no Homa names");

console.log("c92 bait hut / one OPEN sign: ok");
