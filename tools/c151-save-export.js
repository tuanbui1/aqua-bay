// C151 — v1.0 stamp + export / import so a shop survives a cleared browser.
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

assert(/Aqua Bay · v1\.0/.test(src), "title/pause stamp is v1.0");
assert(!/Aqua Bay · loop 150"/.test(src), "loop 150 stamp is gone");
const stampCount = (src.match(/Aqua Bay · v1\.0/g) || []).length;
assert(stampCount >= 3, "all three stamps read v1.0, got " + stampCount);
assert(/loop 151 v1\.0 stamp \+ export/.test(src), "C151 names the feature");
assert(/loop 150 the wreck lantern calls Sable/.test(src), "loop 150 breadcrumb stays");
assert(/const SAVE_KEY = "aqua-bay-save"/.test(src), "save key stays");
assert(!/\bIAP\b/.test(src), "no IAP");

assert(/function savePayload\(/.test(src), "savePayload is extractable");
const payload = extractFn(src, "savePayload") || "";
assert(/game: "aqua-bay"/.test(payload), "export marks the file as aqua-bay");
assert(/v: 1/.test(payload), "payload version is 1");
assert(/wreckLamp: !!state\.wreckLamp/.test(payload), "wreck lamp still persists");
assert(/lastPlayed: Date\.now\(\)/.test(payload), "payload still writes lastPlayed");

assert(/function persist\(/.test(src), "persist exists");
const persist = extractFn(src, "persist") || "";
assert(/savePayload\(\)/.test(persist), "persist writes the shared payload");

assert(/function isAquaBaySave\(/.test(src), "isAquaBaySave is extractable");
const check = extractFn(src, "isAquaBaySave") || "";
assert(/d\.game !== "aqua-bay"/.test(check), "a foreign game field is rejected");
assert(/d\.money == null && !Array\.isArray\(d\.unlocked\)/.test(check),
  "old saves without game still load");

assert(/function exportSave\(/.test(src), "exportSave is extractable");
const exp = extractFn(src, "exportSave") || "";
assert(/aqua-bay-save\.json/.test(exp), "download name is aqua-bay-save.json");
assert(/navigator\.clipboard/.test(exp), "export also copies to the clipboard");
assert(/persist\(\)/.test(exp), "export writes the live shop first");

assert(/function applyImportedSave\(/.test(src), "applyImportedSave is extractable");
const imp = extractFn(src, "applyImportedSave") || "";
assert(/isAquaBaySave\(d\)/.test(imp), "import validates the file");
assert(/loadSave\(\)/.test(imp), "import runs the real loader");
assert(/state\.mode = "title"/.test(imp), "import returns to Continue");

assert(/id === "export"/.test(src), "pause Export save is wired");
assert(/id === "import"/.test(src), "Import save is wired");
assert(/Export save/.test(src) && /Import save/.test(src), "pause labels the pair");
assert(/Save stays on this device/.test(src), "pause says the save stays local");
assert(/Pause → Export save/.test(src), "help names export");

assert(/lastPlayed: \(d\.lastPlayed > 0 \? \+d\.lastPlayed : 0\)/.test(src),
  "lastPlayed still loads as a full millisecond timestamp");

console.log("c151 save export: ok (stamps=" + stampCount + ", v1.0, export+import, no IAP)");
