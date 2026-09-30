// C170 puppeteer smoke — forever bands, pearl crack, DEPTH combo.
"use strict";
const puppeteer = require("puppeteer");

function assert(cond, msg) {
  if (!cond) { console.error("FAIL", msg); process.exit(1); }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/local/bin/google-chrome",
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--window-size=1280,720",
    ],
    userDataDir: "/tmp/aqua-bay-c170-chrome-" + Date.now(),
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);
  await page.goto("http://127.0.0.1:8765/index.html?qa=1", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => typeof window.__aquaBayQA === "function", { timeout: 45000 });

  await page.evaluate(() => {
    try { localStorage.clear(); } catch (e) {}
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => typeof window.__aquaBayQA === "function", { timeout: 45000 });
  // Give the canvas a couple frames to boot.
  await new Promise((r) => setTimeout(r, 800));

  // Title → New Game / Continue via QA play
  await page.evaluate(() => window.__aquaBayQA("play"));
  await page.evaluate(() => window.__aquaBayQA("unlockDeep"));
  await page.evaluate(() => window.__aquaBayQA("resetDepth"));

  // Named deep bowl (band 5 = Squid lights)
  let goto = await page.evaluate(() => window.__aquaBayQA("gotoBand", 5));
  assert(goto && goto.pearl, "band 5 has a pearl cache");
  let probe = await page.evaluate(() => window.__aquaBayQA("probe"));
  assert(probe.scene === "ocean", "in ocean");
  assert(probe.pearl && probe.pearl.band === 5, "probe sees pearl band 5");
  assert(probe.deepestM > 0, "depth record tracks meters: " + probe.deepestM);

  const cracked = await page.evaluate(() => window.__aquaBayQA("crackPearl"));
  assert(cracked.ok, "pearl crack ok");
  assert(cracked.pay >= 28, "pearl paid out $" + cracked.pay);
  assert(cracked.sessionPearl, "sessionPearl set");
  probe = await page.evaluate(() => window.__aquaBayQA("probe"));
  assert(!probe.pearl, "pearl gone after crack");

  // Forever band (band 8 = first forever)
  goto = await page.evaluate(() => window.__aquaBayQA("gotoBand", 8));
  assert(goto && goto.pearl, "forever band 8 has pearl");
  probe = await page.evaluate(() => window.__aquaBayQA("probe"));
  assert(probe.forever, "zone marked forever: " + probe.zone);
  assert(/Midnight trench|Crystal canyon|Glow abyss|Starfall hollow|Ribbon rift|Quiet cathedral|Lantern stairs|Forever blue|Pressure garden|Echo vault|Cobalt stairs|Pearl sink/i.test(probe.zone),
    "forever zone name: " + probe.zone);

  const foreverPearl = await page.evaluate(() => window.__aquaBayQA("crackPearl"));
  assert(foreverPearl.ok && foreverPearl.pay > cracked.pay, "forever pearl pays more (" + foreverPearl.pay + " > " + cracked.pay + ")");

  // DEPTH combo from deep scoops
  const s1 = await page.evaluate(() => window.__aquaBayQA("scoopDeep"));
  const s2 = await page.evaluate(() => window.__aquaBayQA("scoopDeep"));
  const s3 = await page.evaluate(() => window.__aquaBayQA("scoopDeep"));
  assert(s1.combo === 1 && s2.combo === 2 && s3.combo === 3, "DEPTH combo stacks 1→2→3 got " + [s1.combo, s2.combo, s3.combo]);
  assert(s3.bagBonus > 1.1, "depth bagBonus beats streak floor: " + s3.bagBonus);

  // Second forever name cycle uses expanded list (band 8+11 = Pressure garden etc.)
  goto = await page.evaluate(() => window.__aquaBayQA("gotoBand", 19));
  probe = await page.evaluate(() => window.__aquaBayQA("probe"));
  assert(probe.forever, "band 19 forever");
  assert(probe.pearl, "band 19 pearl available");

  // Screenshot for evidence
  await page.screenshot({ path: "/opt/cursor/artifacts/c170-forever-pearl.png", fullPage: false });

  console.log("c170 puppeteer: ok", {
    namedPay: cracked.pay,
    foreverPay: foreverPearl.pay,
    combo: s3.combo,
    bagBonus: s3.bagBonus,
    zone: probe.zone,
    deepestM: probe.deepestM,
  });
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
