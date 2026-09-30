// C169 — all four divers walk upright and swim prone (Ryan paint fix).
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
        else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(at, j + 1); }
      }
    }
    i = at + needle.length;
  }
  return null;
}

const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");

assert(/Aqua Bay · v1\.0/.test(src), "stamps stay v1.0");
assert(/loop 169 divers walk \+ swim verified/.test(src), "C169 names the feature");
assert(/loop 168 pier stars/.test(src), "loop 168 breadcrumb stays");
assert(/loop 167 divers swim prone/.test(src), "loop 167 breadcrumb stays");
assert(!/\bIAP\b/.test(src), "no IAP");
assert(/const SKIN_IDS = \["skip", "reef", "dino", "ryan"\]/.test(src), "four skins");

const dive = extractFn(src, "drawDiver") || "";
assert(/blitGait\(skin, "swim"/.test(dive), "atlas swim for Skip/Reef/Dino");
assert(/skin === "ryan"/.test(dive), "Ryan paint swim path");
assert(/Belly-side globe floatie/.test(dive) || /belly-side globe floatie/i.test(dive),
  "Ryan floatie sits under the belly (prone), not through the chest");
assert(/ellipse\(1\.4, 6\.0/.test(dive), "Ryan floatie y matches Dino belly side");
assert(!/ellipse\(1\.2, 1\.4, 9\.6, 6\.8/.test(dive), "old tall waist ring is gone");

const flip = extractFn(src, "paintTrailFlipper") || "";
assert(/ryan \? "#e8c06a"/.test(flip), "Ryan kick fins are sand, not teal");
assert(/ryan \? "#8a6030"/.test(flip), "Ryan fin edge is khaki");

const walk = extractFn(src, "drawPlayer") || "";
assert(/skin === "ryan"/.test(walk), "Ryan walk paint");
assert(/skin === "dino"/.test(walk), "Dino walk path");
assert(/blitGait\(skin, "walk"/.test(walk), "atlas walk for Skip/Reef/Dino");
assert(/asymTurn = skin === "dino"/.test(walk), "Dino flat turn (no paper flip)");

assert(/\?qa=1/.test(src), "qa probe stays URL-gated");
assert(/window\.__aquaBayQA/.test(src), "qa probe exists");
assert(/Divers swim prone/.test(src), "help names prone swim");

console.log("c169 diver walk+swim: ok (four skins, Ryan prone floatie, sand fins, qa gate)");
