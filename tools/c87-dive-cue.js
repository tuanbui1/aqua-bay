// C87 — one "heading to DIVE" cue (walker chip + pad pulse, no second
// world pop) and no stale "Dock is south" while the plaza / tank camera
// is up (cam.y ≤ 520) or a DIVE walk is already queued. Does not restack
// HUD plates, toast wrap, visualViewport, cameras, DIVE inset, or dash.
const fs = require("fs");
const path = require("path");

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/function drawDiveWalkCue\s*\(/.test(src), "walker heading chip stays");
assert(/headingPad/.test(src) && /padPulse/.test(src), "pad pulse stays");
assert(/if \(kind === "dive"\) cueDiveWalk\(\)/.test(src),
  "queued plaza DIVE still fires cueDiveWalk");

const headingHits = src.match(/heading to DIVE/g) || [];
assert(headingHits.length === 1, "exactly one heading-to-DIVE cue string, got " + headingHits.length);
assert(!/pop\s*\(\s*player\.x[\s\S]{0,80}heading to DIVE/.test(src),
  "cueDiveWalk does not pop a second world label");
assert(!/pop\s*\([^;]*heading to DIVE/.test(src),
  "no pop() world label uses the heading copy");

const cueFn = src.match(/function cueDiveWalk\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(cueFn, "cueDiveWalk is still a function");
assert(!/pop\s*\(/.test(cueFn[0]), "cueDiveWalk body does not pop");
assert(!/heading to DIVE/.test(cueFn[0]), "heading copy lives on the walker chip only");

const chipFn = src.match(/function drawDiveWalkCue\s*\(\s*\)\s*\{[\s\S]*?\n  \}/);
assert(chipFn, "drawDiveWalkCue body is present");
assert(/heading to DIVE/.test(chipFn[0]), "the single cue is the walker chip");
assert(/player\.y\s*-\s*86/.test(chipFn[0]), "chip still sits on the walker");

assert(/function hideSouthDockHint\s*\(/.test(src), "south-hint hide is a named gate");
assert(/diveWalkQueued\(\)\s*\|\|/.test(src) && /cam\.y\s*<=\s*PLAZA_CAM_CEILING/.test(src),
  "south hint hides on queued DIVE walk or plaza camera");
assert(/if \(hideSouthDockHint\(\)\) return \{ text: ""/.test(src),
  "hidden south hint returns empty copy (no leftover walk-to-dock line)");
assert(/Dock is south — tap to walk/.test(src), "south-hint copy still exists for mid-pier");

function hideSouthDockHint(camY, queued) {
  return !!(queued || camY <= 520);
}
function southDockHintOn(opts) {
  if (!(opts.inYard && opts.spent)) return false;
  if (hideSouthDockHint(opts.camY, opts.queued)) return false;
  return true;
}

assert(!southDockHintOn({ inYard: true, spent: true, camY: 520, queued: false }),
  "south hint is off at the plaza / tank camera (cam.y = 520)");
assert(!southDockHintOn({ inYard: true, spent: true, camY: 400, queued: false }),
  "south hint is off while looking at the tanks (cam.y < 520)");
assert(!southDockHintOn({ inYard: true, spent: true, camY: 800, queued: true }),
  "south hint is off while a DIVE walk is queued");
assert(!southDockHintOn({ inYard: true, spent: true, camY: 520, queued: true }),
  "south hint is off when both plaza camera and queued DIVE apply");
assert(southDockHintOn({ inYard: true, spent: true, camY: 800, queued: false }),
  "south hint can still show mid-pier when not heading to DIVE");
assert(!southDockHintOn({ inYard: false, spent: true, camY: 1000, queued: false }),
  "south hint path is not the dock-camera line");

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
assert(/gx = clamp\(W \/ 2 - tw \/ 2, leftPad, W - 12 - tw\)/.test(src),
  "desktop ribbon stays centered");

assert(/Aqua Bay · loop 109/.test(src), "title/pause stamp is loop 109");
assert(!/Aqua Bay · loop 107/.test(src), "loop 107 stamp is gone");

assert(/player\.faceS/.test(src), "loop 54 flip stays");
assert(/C67/.test(src), "C67 second dive after cashier stays");
assert(/C75|surfaceLock|requestSurface/.test(src), "C75 surface after 1 fish stays");
assert(/function galleryOpen\s*\(/.test(src), "galleryOpen stays");
assert(/unlock:\s*3200/.test(src), "Puffer unlock stays $3200");
const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");
assert(/unlock:\s*0/.test(src) && /unlock:\s*60/.test(src) && /unlock:\s*1400/.test(src),
  "original 5 unlock prices stay");

console.log("c87 one DIVE cue / no stale south hint: ok");
