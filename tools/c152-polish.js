// C152 — first-session polish so a New Game dock reads like a pier, not a jam build.
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
const css = fs.readFileSync(path.join(__dirname, "..", "style.css"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

assert(/Aqua Bay · v1\.0/.test(src), "title/pause stamp is still v1.0");
assert(!/Aqua Bay · loop 15[012]"/.test(src), "loop-number stamps stay gone");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 152 first-session polish/.test(src), "C152 names the feature");
assert(/loop 151 v1\.0 stamp \+ export/.test(src), "loop 151 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/function firstSessionReached\(/.test(src), "firstSessionReached is extractable");
const reached = extractFn(src, "firstSessionReached") || "";
assert(/return 1;/.test(reached), "a fresh dock is 1 / 6");
assert(!/firstSessionIndex\(\)/.test(reached), "progress does not borrow firstSessionIndex");
assert(!/firstSessionReached\(\) \|\| \(firstSessionIndex\(\) \+ 1\)/.test(src),
  "HUD does not skip to 2 / 6 via firstSessionIndex + 1");

assert(/function nextGoal\(/.test(src), "nextGoal is extractable");
const goal = extractFn(src, "nextGoal") || "";
assert(/didFirstCollect/.test(goal), "Next Speed waits for the first collect");
assert(/return null/.test(goal), "nextGoal can hide the caption");

assert(/function speciesRailReady\(/.test(src), "speciesRailReady is extractable");
const rail = extractFn(src, "speciesRailReady") || "";
assert(/didFirstStock/.test(rail), "desktop rail waits for a stock");
assert(/portraitStage\(\)/.test(rail), "phone BOOK tray is not the desktop gate");
assert(/speciesRailReady\(\)/.test(src), "desktop strip uses the quiet gate");

assert(/function syncChrome\(/.test(src), "syncChrome is extractable");
const chrome = extractFn(src, "syncChrome") || "";
assert(/ab-playing/.test(chrome), "play mode marks the document");
assert(/html\.ab-playing \.more-games/.test(css), "More games hides during play");

assert(/titleBoardBtn\("import"/.test(src), "title Import save is a wood chip");
assert(!/fillText\("Import save"/.test(src), "title Import is not raw cyan text");

assert(/music\.fifth/.test(src), "pad has a fifth");
assert(/music\.sub/.test(src), "pad has a triangle sub");

assert(/cursor:\s*pointer/.test(css), "canvas cursor is a pointer");
assert(!/cursor:\s*crosshair/.test(css), "crosshair cursor is gone");

assert(/rel="icon" href="art\/bay.png"/.test(html), "favicon uses the bay art");
assert(/theme-color/.test(html), "theme-color is set");
assert(/og:image/.test(html), "share card has an image");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");

console.log("c152 polish: ok (stamps=" + stampCount + ", v1.0, quiet first session, no IAP)");
