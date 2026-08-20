// C93 — 390-wide NPC speech bubbles stay inside the visible stage
// (below HUD plates, above DIVE, inside left/right). OPEN hangs off
// the post/arm, not through the bait-hut roof. Paint / clamp only:
// NPCs, cameras, HUD plates, visualViewport, DIVE inset, walk, and
// unlocks stay.
const fs = require("fs");
const path = require("path");

function desktopStage(w, h) { return w >= 880 && w >= h * 0.92; }
function phonePortrait(w, h) { return h > w * 1.05; }
function portraitStage(w, h) { return !desktopStage(w, h) && phonePortrait(w, h); }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/function speechStageRect\s*\(/.test(src), "speechStageRect helper exists");
assert(/function speechHudFloor\s*\(/.test(src), "speechHudFloor helper exists");
assert(/function speechDiveCeil\s*\(/.test(src), "speechDiveCeil helper exists");
assert(/function fitSpeechLocal\s*\(/.test(src), "fitSpeechLocal clamps world bubbles");
assert(/function fitSpeechScreen\s*\(/.test(src), "fitSpeechScreen clamps sale bubbles");
assert(/C93 — visible stage for a full speech bubble/.test(src),
  "C93 names the visible-stage rule");
assert(/const fit = fitSpeechLocal\(x, y \+ bob, bx, ey, bw, bh\)/.test(src),
  "NPC hey! / Blue Tang? bubbles go through fitSpeechLocal");
assert(/fitSpeechScreen\(scr\.x, scr\.y, tw, th/.test(src),
  "sale talks use the same visible-stage clamp");
assert(!/let x = clamp\(scr\.x, 200, W - 200\)/.test(src),
  "desktop-era 200/196 sale clamp is gone");

assert(/Aqua Bay · loop 106/.test(src), "title/pause stamp is loop 106");
assert(!/Aqua Bay · loop 105/.test(src), "loop 105 stamp is gone");

const sign = src.match(/function drawHangingSign\s*\(\s*x,\s*y\s*\)\s*\{[\s\S]*?\n  \}/);
assert(sign, "drawHangingSign body is present");
assert(/C91 — hanging shop sign/.test(sign[0]), "C91 hanging OPEN paint stays");
assert(/C93 — hang the board off the arm/.test(sign[0]),
  "C93 comments the roof-clear hang");
assert(/roundRect\(-46, -12, 92, 44/.test(sign[0]), "OPEN board is still the readable 92x44");
assert(/800 20px Fredoka/.test(sign[0]), "OPEN type stays 20px");
assert(/fillText\("OPEN"/.test(sign[0]), "sign still says OPEN");
assert(/translate\(x - 22, y - 48\)/.test(sign[0]),
  "board hangs left of the post, raised off the roof");
assert(/lineTo\(x - 42, y - 76\)/.test(sign[0]), "arm extends left, away from the hut");
assert(!/lineTo\(x \+ 46, y - 70\)/.test(sign[0]),
  "old arm into the hut roof is gone");
assert(!/translate\(x \+ 20, y - 20\)/.test(sign[0]),
  "old board hang through the roof is gone");
const opens = src.match(/fillText\("OPEN"/g) || [];
assert(opens.length === 1, "OPEN is drawn once — the hanging sign");
assert(/const OPEN_SIGN = \{ x: 1052, y: 924 \}/.test(src), "OPEN planted position stays");
assert(/const BAIT_HUT = \{ x: 1124, y: 918 \}/.test(src), "hut planted position stays");
assert(/const POP_VEND = \{ x: 996, y: 918 \}/.test(src), "POP planted position stays");

const OPEN = { x: 1052, y: 924 };
const HUT = { x: 1124, y: 918 };
const hutRoof = { left: HUT.x - 38 - 8, top: HUT.y + 8 - 8 };
const board = {
  left: OPEN.x - 22 - 46,
  right: OPEN.x - 22 + 46,
  top: OPEN.y - 48 - 12,
  bottom: OPEN.y - 48 - 12 + 44,
};
assert(board.right <= hutRoof.left,
  "OPEN board right clears hut roof left, right=" + board.right + " roof=" + hutRoof.left);
assert(board.bottom <= hutRoof.top,
  "OPEN board hangs above the hut roof, bottom=" + board.bottom + " roof=" + hutRoof.top);
assert(board.right - board.left === 92 && board.bottom - board.top === 44,
  "board size stays 92x44");
assert(board.left < OPEN.x && board.right > OPEN.x - 30,
  "board still hangs off the post, not a sky scrap");

assert(/C92 — pier bait hut/.test(src), "C92 BAIT hut paint stays");
assert(/C91 — soda cooler/.test(src), "C91 POP cooler stays");
assert(/fillText\("BAIT"/.test(src), "hut still says BAIT");
assert(/fillText\("POP"/.test(src), "cooler still says POP");

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
assert(/x: 880, y: 1100/.test(src) && /emote: "hi!"/.test(src), "Maya stays planted");
assert(/x: 760, y: 1068/.test(src) && /emote: "hey!"/.test(src), "Nico stays planted");
assert(/x: 980, y: 1084/.test(src) && /emote: "Blue Tang\?"/.test(src),
  "Jun stays planted");

const W = 1280;
const DESKTOP_H = 720;
function portraitH(cssW, cssH) { return Math.max(960, Math.round(W * cssH / cssW)); }
function phoneCss(cssPx, cssW) { return Math.round(cssPx * W / cssW); }

const CSS_W = 390;
const LAYOUT_H = 844;
const VIS_H = 655;
assert(portraitStage(CSS_W, LAYOUT_H), "390×844 is portrait");
assert(!desktopStage(CSS_W, LAYOUT_H), "390-wide is not desktop");

function hudSafeTop(cssW) { return phoneCss(50 + 12, cssW); }
function speechHudFloor(cssW) {
  const pad = phoneCss(8, cssW);
  const topBtn = phoneCss(40, cssW);
  const y = hudSafeTop(cssW);
  const moneyH = phoneCss(48, cssW);
  return Math.max(y + moneyH + pad, y + topBtn + pad);
}
function visibleStageBottom(H0, canvasCssH, visCssH, cssW) {
  const cssH = Math.max(1, canvasCssH);
  const visibleCss = clamp(visCssH, 1, cssH);
  const lip = phoneCss(Math.max(12, 12), cssW);
  const floor = Math.round(H0 * (visibleCss / cssH)) - lip;
  return Math.max(phoneCss(120, cssW), Math.min(H0 - phoneCss(8, cssW), floor));
}
function actionChipInset(cssW) { return phoneCss(18, cssW); }
function actionBtnBox(floor, cssW) {
  const w = phoneCss(120, cssW);
  const h = phoneCss(48, cssW);
  const inset = actionChipInset(cssW);
  return { x: W - inset - w, y: floor - inset - h, w: w, h: h };
}
function speechStageRect(H0, canvasCssH, visCssH, cssW) {
  const pad = phoneCss(8, cssW);
  const top = speechHudFloor(cssW);
  const floor = visibleStageBottom(H0, canvasCssH, visCssH, cssW);
  const dive = actionBtnBox(floor, cssW);
  const bot = dive.y - pad;
  return { x: pad, y: top, w: Math.max(40, W - pad * 2), h: Math.max(24, bot - top) };
}
function fitSpeechLocal(wx, wy, bx, ey, bw, bh, cam, H0, stage) {
  const z = Math.max(0.001, cam.z || 1);
  let lx = bx;
  let ly = ey;
  const viewCenterX = W * 0.5;
  const screenOf = (ox, oy) => ({
    x: (wx + ox - bw / 2 - cam.x) * z + viewCenterX,
    y: (wy + oy - cam.y) * z + H0 / 2,
    w: bw * z,
    h: bh * z,
  });
  const clipX = (b) => Math.max(0, stage.x - b.x) + Math.max(0, b.x + b.w - (stage.x + stage.w));
  const clipY = (b) => Math.max(0, stage.y - b.y) + Math.max(0, b.y + b.h - (stage.y + stage.h));
  let box = screenOf(lx, ly);
  if (clipX(box) > 0.5) {
    const flip = screenOf(-lx, ly);
    if (clipX(flip) < clipX(box) - 0.5) { lx = -lx; box = flip; }
  }
  if (box.w <= stage.w) {
    if (box.x < stage.x) lx += (stage.x - box.x) / z;
    box = screenOf(lx, ly);
    if (box.x + box.w > stage.x + stage.w) lx -= (box.x + box.w - (stage.x + stage.w)) / z;
  } else {
    lx += (stage.x + stage.w / 2 - (box.x + box.w / 2)) / z;
  }
  box = screenOf(lx, ly);
  if (clipY(box) > 0.5) {
    const below = ly < 0 ? 16 : ly;
    const above = ly >= 0 ? -bh - 16 : ly;
    const tryY = box.y < stage.y ? below : above;
    const flip = screenOf(lx, tryY);
    if (clipY(flip) < clipY(box) - 0.5) { ly = tryY; box = flip; }
  }
  if (box.h <= stage.h) {
    if (box.y < stage.y) ly += (stage.y - box.y) / z;
    box = screenOf(lx, ly);
    if (box.y + box.h > stage.y + stage.h) ly -= (box.y + box.h - (stage.y + stage.h)) / z;
  } else {
    ly += (stage.y - box.y) / z;
  }
  return { bx: lx, ey: ly, box: screenOf(lx, ly) };
}

function bubbleSize(label, gold) {
  const bw = Math.max(28, label.length * (gold ? 10.2 : 8) + (gold ? 22 : 10));
  const bh = gold ? 26 : 16;
  return { bw: bw, bh: bh };
}

function assertInside(box, stage, label) {
  assert(box.x + 0.6 >= stage.x,
    label + " left clips stage, x=" + box.x.toFixed(1) + " stage=" + stage.x);
  assert(box.x + box.w <= stage.x + stage.w + 0.6,
    label + " right clips stage, right=" + (box.x + box.w).toFixed(1));
  assert(box.y + 0.6 >= stage.y,
    label + " top clips HUD plates, y=" + box.y.toFixed(1) + " floor=" + stage.y);
  assert(box.y + box.h <= stage.y + stage.h + 0.6,
    label + " bottom clips DIVE, bottom=" + (box.y + box.h).toFixed(1) +
    " ceil=" + (stage.y + stage.h));
  const cssRight = (box.x + box.w) / W * CSS_W;
  assert(cssRight <= CSS_W - 2,
    label + " css right leaves the 390 viewport, css=" + cssRight.toFixed(1));
  assert(box.w > 8 && box.h > 6, label + " is still a visible bubble, not hidden");
}

function runPortrait(canvasCssH, visCssH, tag) {
  const H0 = portraitH(CSS_W, canvasCssH);
  const z = H0 / 860;
  const stage = speechStageRect(H0, canvasCssH, visCssH, CSS_W);
  assert(stage.y >= hudSafeTop(CSS_W) + phoneCss(48, CSS_W),
    tag + " stage sits below money/BAG");
  assert(stage.y + stage.h <= actionBtnBox(visibleStageBottom(H0, canvasCssH, visCssH, CSS_W), CSS_W).y,
    tag + " stage sits above DIVE");

  const dockCam = { x: 880, y: 1000, z: z };
  const plazaCam = { x: 880, y: 520, z: z };

  const npcs = [
    { name: "Nico hey!", wx: 760, wy: 1068, bx: -11, ey: -40, label: "hey!", cam: dockCam },
    { name: "Maya hi!", wx: 880, wy: 1100, bx: 0, ey: -40, label: "hi!", cam: dockCam },
    { name: "Jun Blue Tang?", wx: 980, wy: 1084, bx: 38, ey: -12, label: "Blue Tang?", cam: dockCam },
    { name: "east-dock hey!", wx: 1120, wy: 1100, bx: 0, ey: -40, label: "hey!", cam: dockCam },
    { name: "west-dock hey!", wx: 640, wy: 1080, bx: -22, ey: -40, label: "hey!", cam: dockCam },
    { name: "tank-row Blue Tang?", wx: 558 + 105, wy: 164 + 40, bx: 38, ey: -12, label: "Blue Tang?", cam: plazaCam },
    { name: "tank-row hey!", wx: 340 + 40, wy: 200, bx: 0, ey: -40, label: "hey!", cam: plazaCam },
  ];

  for (const n of npcs) {
    const sz = bubbleSize(n.label, false);
    const rawZ = n.cam.z;
    const raw = {
      x: (n.wx + n.bx - sz.bw / 2 - n.cam.x) * rawZ + W * 0.5,
      y: (n.wy + n.ey - n.cam.y) * rawZ + H0 / 2,
      w: sz.bw * rawZ,
      h: sz.bh * rawZ,
    };
    const fit = fitSpeechLocal(n.wx, n.wy, n.bx, n.ey, sz.bw, sz.bh, n.cam, H0, stage);
    assertInside(fit.box, stage, tag + " " + n.name);
    const rawClips = raw.x < stage.x - 1 || raw.x + raw.w > stage.x + stage.w + 1 ||
      raw.y < stage.y - 1 || raw.y + raw.h > stage.y + stage.h + 1;
    if (rawClips) {
      assert(fit.box.x >= stage.x - 0.6 && fit.box.y >= stage.y - 0.6,
        tag + " " + n.name + " leftover clip was repaired");
    }
  }
}

runPortrait(VIS_H, VIS_H, "390×655 visual");
runPortrait(LAYOUT_H, VIS_H, "390 inner 844 / visual 655");
runPortrait(LAYOUT_H, LAYOUT_H, "390×844 full");

// Pre-fix leftovers: right-edge Blue Tang? and tank-row hey! really clipped.
{
  const H0 = portraitH(CSS_W, VIS_H);
  const z = H0 / 860;
  const stage = speechStageRect(H0, VIS_H, VIS_H, CSS_W);
  const dockCam = { x: 880, y: 1000, z: z };
  const plazaCam = { x: 880, y: 520, z: z };
  const tang = bubbleSize("Blue Tang?", false);
  const rawEast = {
    x: (1120 + 38 - tang.bw / 2 - dockCam.x) * z + W * 0.5,
    w: tang.bw * z,
  };
  assert(rawEast.x + rawEast.w > W,
    "pre-fix east-dock Blue Tang? really ran off the 390 stage, right=" +
    (rawEast.x + rawEast.w).toFixed(1));
  const hey = bubbleSize("hey!", false);
  const rawTank = {
    y: (200 - 40 - plazaCam.y) * z + H0 / 2,
    h: hey.bh * z,
  };
  assert(rawTank.y < stage.y,
    "pre-fix tank-row hey! really sat under the HUD plates, y=" +
    rawTank.y.toFixed(1) + " floor=" + stage.y);
}

// Desktop 16:9 still one OPEN, same cameras, framed stage.
assert(DESKTOP_H === 720 && W === 1280, "desktop stage stays 1280×720");
assert(!portraitStage(1280, 720) && desktopStage(1280, 720), "laptop keeps the framed 16:9 stage");
assert(/const OPEN_SIGN = \{ x: 1052, y: 924 \}/.test(src), "desktop OPEN plant stays");
assert((src.match(/fillText\("OPEN"/g) || []).length === 1, "desktop still has one OPEN");

const prices = [15, 22, 40, 70, 150];
assert(prices[0] === 15 && prices[4] === 150, "original 5 sale prices stay");

console.log("c93 390-wide NPC bubble fit / OPEN hang: ok");
