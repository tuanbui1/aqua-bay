// Aqua Bay — original pier aquarium tycoon (vanilla Canvas 2D)
(() => {
  "use strict";

  // ===== CONFIG =====
  const W = 1280, H = 720;
  const SAVE_KEY = "aqua-bay-save";
  const SHOP = { w: 1760, h: 1260 };
  const SHOP_GALLERY_W = 2280;
  const OCEAN = { w: 2520, h: 1960 };
  const OCEAN_BASE_H = 1960;
  const ZONE_STEP = 440;
  const CORE_SPECIES = 5;
  const MAX_CUSTOMERS = 8;
  const SPECIES = [
    { id: 0, name: "Clownfish",  color: "#f08a2a", accent: "#fff6e8", outline: "#5a2a10", price: 15, unlock: 0,    cruise: 70, flee: 170, fleeR: 132, size: 15, gait: "dart" },
    { id: 1, name: "Blue Tang",  color: "#2f7dff", accent: "#ffe14a", outline: "#10224a", price: 22, unlock: 60,   cruise: 80, flee: 200, fleeR: 150, size: 16, gait: "figure8" },
    { id: 2, name: "Goldfish",   color: "#ff8a2b", accent: "#ffd27a", outline: "#7a2e10", price: 40, unlock: 220,  cruise: 64, flee: 175, fleeR: 150, size: 17, gait: "loaf" },
    { id: 3, name: "Koi",        color: "#f4f0ea", accent: "#e23b2f", outline: "#4a2a22", price: 70, unlock: 550,  cruise: 60, flee: 165, fleeR: 160, size: 19, gait: "parade" },
    { id: 4, name: "Sea Turtle", color: "#3d8b4a", accent: "#c6e38a", outline: "#1d3a20", price: 150, unlock: 1400, cruise: 42, flee: 110, fleeR: 170, size: 26, gait: "paddle" },
    { id: 5, name: "Seahorse",   color: "#e8a03a", accent: "#ffe27a", outline: "#5a3010", price: 180, unlock: 2200, cruise: 28, flee: 90, fleeR: 140, size: 16, gait: "hover" },
    { id: 6, name: "Puffer",     color: "#f0d24a", accent: "#7ad08a", outline: "#4a3a10", price: 220, unlock: 3200, cruise: 36, flee: 80, fleeR: 150, size: 18, gait: "puff" },
    { id: 7, name: "Angelfish",  color: "#f4e8c8", accent: "#e85d4c", outline: "#3a2415", price: 260, unlock: 4500, cruise: 62, flee: 160, fleeR: 155, size: 18, gait: "figure8" },
    { id: 8, name: "Octopus",    color: "#c45ec8", accent: "#ffb0e0", outline: "#3a1840", price: 320, unlock: 6200, cruise: 48, flee: 140, fleeR: 165, size: 20, gait: "crawl" },
    { id: 9, name: "Crab",       color: "#e85d4c", accent: "#ffe27a", outline: "#5a1810", price: 360, unlock: 8400, cruise: 54, flee: 150, fleeR: 145, size: 17, gait: "scuttle" },
    { id: 10, name: "Squid",     color: "#7ad0e8", accent: "#ffe8a8", outline: "#143040", price: 420, unlock: 11000, cruise: 88, flee: 210, fleeR: 170, size: 20, gait: "jet" },
    { id: 11, name: "Dolphin",   color: "#7aa0c8", accent: "#fff6e8", outline: "#1a3048", price: 560, unlock: 15000, cruise: 96, flee: 190, fleeR: 180, size: 24, gait: "parade" },
    { id: 12, name: "Whale Shark", color: "#4a6a78", accent: "#fff6e8", outline: "#122028", price: 780, unlock: 20000, cruise: 38, flee: 70, fleeR: 200, size: 30, gait: "glide" },
  ];
  const SPECIES_N = SPECIES.length;
  const REGULAR_LINES = {
    Maya: ["the usual!", "my clownfish!", "don't skimp!"],
    Nico: ["the usual!", "perfect.", "again please"],
    Jun: ["the usual!", "don't skimp!", "again please"],
    _: ["the usual!", "same as always", "you know me"],
  };
  const SALE_BARK_POOL = ["the usual!", "my clownfish!", "don't skimp!", "perfect.", "again please"];
  const REGULAR_LOOKS = {
    Maya: { hawaii: true, hat: "#e8c04a", shirt: "#1b6b5a", hair: "#3a2415", hairCut: 1, idle: "glance" },
    Nico: { sailor: true, hat: "#f4efe6", shirt: "#3d8bfd", hair: "#1b1b1b", hairCut: 0, idle: "whistle" },
    Jun: { visor: true, hat: "#e85d4c", shirt: "#f0b429", hair: "#8a4a1a", hairCut: 2, idle: "bounce" },
  };
  const REGULAR_TINTS = {
    Maya: { fill: "rgba(18, 78, 68, 0.95)", ink: "#ffe27a", stroke: "#7ad0b0" },
    Nico: { fill: "rgba(16, 48, 108, 0.95)", ink: "#d6ecff", stroke: "#8eb8ff" },
    Jun: { fill: "rgba(122, 36, 30, 0.95)", ink: "#ffe27a", stroke: "#f0a060" },
  };
  const BOOK_FLAVOR = [
    "Orange stripes and zero fear — first regular of the bay.",
    "A blue streak that treats the reef like a racetrack.",
    "Fat, sunny, and happiest among garden weeds.",
    "Painted scales that turn the current into a parade.",
    "An old shell that maps every current by memory.",
    "A curled pony of the groves — it nods hello with its tail.",
    "A balloon with spikes and a grin that says 'boop'.",
    "A disk of moonlight with a lipstick stripe.",
    "Eight arms, one brain, and a lot of hide-and-seek.",
    "Sideways scuttle, big claws, bigger attitude.",
    "A jet with a soft lantern belly.",
    "A smile that leaps the current just to say hi.",
    "A spotted bus of the deep — kids never forget it.",
  ];
  const BOOK_HINT = [
    "Already home in the shallows",
    "Lives on the reef",
    "Loves the goldfish garden",
    "Waits beyond the koi gate",
    "Wanders the turtle meadow",
    "Hides in the seahorse groves",
    "Puffs in the pocket gardens",
    "Glides the angel garden",
    "Tucks into octopus dens",
    "Skitters the crab flats",
    "Flashes in the squid lights",
    "Runs with the dolphin current",
    "Cruises the whale road",
  ];
  const FOREVER_ZONE_NAMES = [
    "Midnight trench", "Crystal canyon", "Glow abyss", "Starfall hollow",
    "Ribbon rift", "Quiet cathedral", "Lantern stairs", "Forever blue",
  ];
  const SPEED_COST = [40, 90, 180, 350, 600];
  const BAG_COST   = [50, 120, 250, 450, 700];
  const CATCH_COST = [45, 100, 200, 400, 750];
  const CASHIER_COST = 80;
  const DECOR_COST = [25, 40, 70];
  const DECOR_NAMES = ["String lights", "Shop sign", "Fountain"];
  const DECOR_TOAST = ["String lights hung!", "Shop sign painted!", "Plaza fountain installed!"];
  const BAG_STEPS  = [5, 8, 11, 14, 17, 20];
  const TANK_POS = [
    { x: 170, y: 168 }, { x: 430, y: 168 }, { x: 690, y: 168 },
    { x: 950, y: 168 }, { x: 1210, y: 168 },
    { x: 1720, y: 168 }, { x: 1980, y: 168 },
    { x: 1720, y: 348 }, { x: 1980, y: 348 },
    { x: 1720, y: 528 }, { x: 1980, y: 528 },
    { x: 1720, y: 708 }, { x: 1980, y: 708 },
  ];
  const TANK_W = 210, TANK_H = 156;
  const STOCK_PAD = 64;
  const SESSION_GOAL_BONUS = 8;
  const REGISTER = { x: 168, y: 500, w: 150, h: 110 };
  const KIOSK    = { x: 1280, y: 480, w: 170, h: 130 };
  const WELCOME  = { x: 300, y: 668, w: 156, h: 86 };
  const DIVE_ZONE = { x: 520, y: 980, w: 720, h: 160 };
  const AISLE = { x: 802, y: 318, w: 156, h: 560 };
  const EXPEDITION_COST = 35;
  const EXPEDITION_SECS = 45;
  const BOAT = { x: 1224, y: 1052 };
  const REEF_Y = 1000, REEF_X = 1700;
  const LM_GOLD = { x: 1880, y: 1120 };
  const LM_KOI = { x: 2080, y: 1520 };
  const LM_TURTLE = { x: 1640, y: 1760 };
  const LM_EXTRA = [
    { x: 1860, y: 2180 }, { x: 720, y: 2620 }, { x: 1980, y: 3040 }, { x: 640, y: 3480 },
    { x: 1760, y: 3920 }, { x: 880, y: 4360 }, { x: 1920, y: 4840 }, { x: 1260, y: 5320 },
  ];
  const SHIRTS = ["#e85d4c", "#3d8bfd", "#f0b429", "#7ad08a", "#c86bde", "#f2789f", "#5ec8c0"];
  const CUST_NAMES = ["Maya", "Nico", "Jun", "Sable", "Rio", "Piper", "Eden", "Wren"];
  const SKIN_IDS = ["skip", "reef", "dino"];
  const SKIN_META = {
    skip: { name: "Skip", blurb: "dock kid" },
    reef: { name: "Reef", blurb: "reef girl" },
    dino: { name: "Dino", blurb: "snorkel dino" },
  };

  function speciesN() { return SPECIES.length; }
  function padSpeciesFlags(arr) {
    const out = [];
    for (let i = 0; i < SPECIES.length; i++) out[i] = !!(arr && arr[i]);
    if (!out[0]) out[0] = true;
    return out;
  }
  function padSpeciesNums(arr) {
    const out = [];
    for (let i = 0; i < SPECIES.length; i++) out[i] = (arr && arr[i]) | 0;
    return out;
  }
  function galleryOpen() {
    return !!(state && (state.unlocked[4] || (state.unlocked && state.unlocked.filter(Boolean).length >= CORE_SPECIES)));
  }
  function tankLive(i) {
    return i >= 0 && i < SPECIES.length && (i < CORE_SPECIES || galleryOpen());
  }
  function shopWalkMax() {
    return galleryOpen() ? 2200 : 1650;
  }
  function shopW() {
    return galleryOpen() ? SHOP_GALLERY_W : SHOP.w;
  }
  function namedZoneBottom(s) {
    if (s <= 4) return OCEAN_BASE_H;
    return OCEAN_BASE_H + (s - 4) * ZONE_STEP;
  }
  function zoneBandForSpecies(s) {
    if (s <= 0) return { y0: 260, y1: 880 };
    if (s === 1) return { y0: 920, y1: 1280 };
    if (s === 2) return { y0: 1040, y1: 1400 };
    if (s === 3) return { y0: 1400, y1: 1680 };
    if (s === 4) return { y0: 1640, y1: 1960 };
    const y0 = OCEAN_BASE_H + (s - 5) * ZONE_STEP;
    return { y0, y1: y0 + ZONE_STEP };
  }
  function zoneAtDepth(y) {
    if (y < 900) return { name: "Shallows", s: 0, y0: 220, y1: 900 };
    if (y < 1200) return { name: "Reef", s: 1, y0: 900, y1: 1200 };
    if (y < 1480) return { name: "Gold garden", s: 2, y0: 1200, y1: 1480 };
    if (y < 1720) return { name: "Koi gate", s: 3, y0: 1480, y1: 1720 };
    if (y < OCEAN_BASE_H) return { name: "Turtle meadow", s: 4, y0: 1720, y1: OCEAN_BASE_H };
    const extra = Math.max(0, y - OCEAN_BASE_H);
    const band = (extra / ZONE_STEP) | 0;
    if (band < 8) {
      const s = 5 + band;
      const names = ["Seahorse groves", "Puffer pockets", "Angel garden", "Octopus dens", "Crab flats", "Squid lights", "Dolphin run", "Whale road"];
      const y0 = OCEAN_BASE_H + band * ZONE_STEP;
      return { name: names[band], s, y0, y1: y0 + ZONE_STEP };
    }
    const forever = band - 8;
    const s = 5 + (forever % 8);
    const y0 = OCEAN_BASE_H + band * ZONE_STEP;
    const lap = ((forever / 8) | 0) + 1;
    return { name: FOREVER_ZONE_NAMES[forever % 8] + " · " + lap, s, y0, y1: y0 + ZONE_STEP, forever: true };
  }
  function depthMeters(y) {
    return Math.max(1, ((y - 200) / 28) | 0);
  }
  function syncOceanHeight() {
    const hi = highestUnlockedSafe();
    const next = nextLockedSafe();
    const deep = Math.max(hi, next < 0 ? SPECIES.length - 1 : next);
    const named = namedZoneBottom(Math.max(4, deep));
    let h = Math.max(OCEAN_BASE_H, named + ZONE_STEP);
    if (state && state.scene === "ocean" && player) {
      const chase = player.y + 1100;
      if (chase > h) h = Math.ceil(chase / ZONE_STEP) * ZONE_STEP;
    }
    OCEAN.h = Math.max(OCEAN_BASE_H, h);
  }
  function highestUnlockedSafe() {
    if (!state || !state.unlocked) return 0;
    let h = 0;
    for (let i = 0; i < SPECIES.length; i++) if (state.unlocked[i]) h = i;
    return h;
  }
  function nextLockedSafe() {
    if (!state || !state.unlocked) return 1;
    for (let i = 0; i < SPECIES.length; i++) if (!state.unlocked[i]) return i;
    return -1;
  }
  function landmarkForSpecies(s) {
    if (s === 2) return LM_GOLD;
    if (s === 3) return LM_KOI;
    if (s === 4) return LM_TURTLE;
    if (s >= 5 && s <= 12) return LM_EXTRA[s - 5];
    return null;
  }

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  let canvasDpr = 1;

  // Loop 48 characters/fish + loop 49 painted pier / water / beds (drawImage).
  const ATLAS = {"skip_stand":{"x":2,"y":2,"w":128,"h":176,"ax":64,"ay":168},"skip_walk":{"x":132,"y":2,"w":128,"h":176,"ax":64,"ay":168},"skip_dive":{"x":262,"y":2,"w":176,"h":96,"ax":96,"ay":48},"reef_stand":{"x":440,"y":2,"w":128,"h":176,"ax":64,"ay":168},"reef_walk":{"x":570,"y":2,"w":128,"h":176,"ax":64,"ay":168},"reef_dive":{"x":700,"y":2,"w":176,"h":96,"ax":96,"ay":48},"dino_stand":{"x":878,"y":2,"w":128,"h":176,"ax":64,"ay":168},"dino_walk":{"x":1008,"y":2,"w":128,"h":176,"ax":64,"ay":168},"dino_dive":{"x":1138,"y":2,"w":176,"h":96,"ax":96,"ay":48},"fish0":{"x":1316,"y":2,"w":112,"h":72,"ax":62,"ay":36},"fish1":{"x":2,"y":180,"w":112,"h":72,"ax":62,"ay":36},"fish2":{"x":116,"y":180,"w":112,"h":72,"ax":62,"ay":36},"fish3":{"x":230,"y":180,"w":112,"h":72,"ax":62,"ay":36},"fish4":{"x":344,"y":180,"w":112,"h":72,"ax":62,"ay":36},"fish5":{"x":458,"y":180,"w":112,"h":72,"ax":62,"ay":36},"fish6":{"x":572,"y":180,"w":112,"h":72,"ax":62,"ay":36},"fish7":{"x":686,"y":180,"w":112,"h":72,"ax":62,"ay":36},"fish8":{"x":800,"y":180,"w":112,"h":72,"ax":62,"ay":36},"fish9":{"x":914,"y":180,"w":112,"h":72,"ax":62,"ay":36},"fish10":{"x":1028,"y":180,"w":112,"h":72,"ax":62,"ay":36},"fish11":{"x":1142,"y":180,"w":112,"h":72,"ax":62,"ay":36},"fish12":{"x":1256,"y":180,"w":112,"h":72,"ax":62,"ay":36},"harbor":{"x":2,"y":254,"w":480,"h":320,"ax":240.0,"ay":230.39999999999998},"maya":{"x":484,"y":254,"w":96,"h":140,"ax":48,"ay":132},"nico":{"x":582,"y":254,"w":96,"h":140,"ax":48,"ay":132},"jun":{"x":680,"y":254,"w":96,"h":140,"ax":48,"ay":132},"cashier":{"x":778,"y":254,"w":96,"h":140,"ax":48,"ay":132},"vip":{"x":876,"y":254,"w":96,"h":140,"ax":48,"ay":132},"kid":{"x":974,"y":254,"w":96,"h":140,"ax":48,"ay":132},"g0":{"x":1072,"y":254,"w":96,"h":140,"ax":48,"ay":132},"g1":{"x":1170,"y":254,"w":96,"h":140,"ax":48,"ay":132},"g2":{"x":1268,"y":254,"w":96,"h":140,"ax":48,"ay":132},"g3":{"x":1366,"y":254,"w":96,"h":140,"ax":48,"ay":132},"g4":{"x":2,"y":576,"w":96,"h":140,"ax":48,"ay":132},"g5":{"x":100,"y":576,"w":96,"h":140,"ax":48,"ay":132},"crown":{"x":198,"y":576,"w":40,"h":32,"ax":20,"ay":28},"shades":{"x":240,"y":576,"w":40,"h":20,"ax":20,"ay":12},"sky":{"x":282,"y":576,"w":360,"h":91,"ax":180.0,"ay":91},"tankglass":{"x":644,"y":576,"w":140,"h":110,"ax":70,"ay":55},"plank":{"x":786,"y":576,"w":196,"h":54,"ax":98,"ay":27},"plank1":{"x":984,"y":576,"w":196,"h":54,"ax":98,"ay":27},"plank2":{"x":1182,"y":576,"w":196,"h":54,"ax":98,"ay":27},"water":{"x":2,"y":718,"w":320,"h":176,"ax":160,"ay":70},"waterline":{"x":324,"y":718,"w":360,"h":60,"ax":180,"ay":40},"post":{"x":686,"y":718,"w":44,"h":110,"ax":22,"ay":104},"bed0":{"x":732,"y":718,"w":220,"h":92,"ax":110,"ay":68},"bed1":{"x":954,"y":718,"w":220,"h":92,"ax":110,"ay":68},"bed2":{"x":1176,"y":718,"w":220,"h":92,"ax":110,"ay":68},"bed3":{"x":2,"y":896,"w":220,"h":92,"ax":110,"ay":68},"bed4":{"x":224,"y":896,"w":220,"h":92,"ax":110,"ay":68},"bed5":{"x":446,"y":896,"w":220,"h":92,"ax":110,"ay":68},"bed6":{"x":668,"y":896,"w":220,"h":92,"ax":110,"ay":68},"bed7":{"x":890,"y":896,"w":220,"h":92,"ax":110,"ay":68}};
  const ART = { img: null, ready: false };
  (function loadBayArt() {
    const img = new Image();
    img.onload = function () { ART.img = img; ART.ready = true; };
    img.src = "art/bay.png";
  })();
  function blit(name, x, y, opt) {
    const c = ATLAS[name];
    if (!c || !ART.ready) return false;
    opt = opt || {};
    const sc = opt.scale == null ? 1 : opt.scale;
    if (!opt.flat && !opt.water) {
      ctx.save();
      const g = ctx.createRadialGradient(x - 3, y + 3, 0.4, x - 2, y + 5, 18 * sc);
      g.addColorStop(0, "rgba(16, 8, 4, 0.34)");
      g.addColorStop(0.55, "rgba(16, 8, 4, 0.12)");
      g.addColorStop(1, "rgba(16, 8, 4, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x - 2, y + 5, 16 * sc, 4.2 * sc, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(x, y);
    if (opt.flip) ctx.scale(-1, 1);
    if (opt.rot) ctx.rotate(opt.rot);
    ctx.drawImage(ART.img, c.x, c.y, c.w, c.h, -c.ax * sc, -c.ay * sc, c.w * sc, c.h * sc);
    if (!opt.flat) {
      ctx.globalCompositeOperation = "source-atop";
      const sun = state.scene === "shop" ? sunAmt(x, y) : 0.52;
      const lg = ctx.createLinearGradient(-c.ax * sc, -c.ay * sc, c.w * sc * 0.38, c.h * sc);
      if (opt.water) {
        lg.addColorStop(0, "rgba(190,236,255," + (0.14 + 0.06 * Math.sin((state.time || 0) * 1.6)) + ")");
        lg.addColorStop(0.48, "rgba(40,100,130,0.05)");
        lg.addColorStop(1, "rgba(8,36,62,0.16)");
      } else {
        lg.addColorStop(0, "rgba(255,228,170," + (0.10 + sun * 0.10) + ")");
        lg.addColorStop(0.42, "rgba(255,255,255,0)");
        lg.addColorStop(1, "rgba(22,26,46," + (0.11 + (1 - sun) * 0.10) + ")");
      }
      ctx.fillStyle = lg;
      ctx.fillRect(-c.ax * sc - 1, -c.ay * sc - 1, c.w * sc + 2, c.h * sc + 2);
    }
    ctx.restore();
    return true;
  }
  function blitHorizon(x, y, w, h) {
    const c = ATLAS.harbor || ATLAS.horizon;
    if (!c || !ART.ready) return false;
    ctx.drawImage(ART.img, c.x, c.y, c.w, c.h, x, y, w, h);
    return true;
  }
  function blitTile(name, x, y, w, h) {
    const c = ATLAS[name];
    if (!c || !ART.ready) return false;
    ctx.drawImage(ART.img, c.x, c.y, c.w, c.h, x, y, w, h);
    return true;
  }
  function blitHarborPart(sx, sy, sw, sh, dx, dy, dw, dh) {
    const c = ATLAS.harbor;
    if (!c || !ART.ready) return false;
    ctx.drawImage(
      ART.img,
      c.x + c.w * sx, c.y + c.h * sy,
      Math.max(1, c.w * sw), Math.max(1, c.h * sh),
      dx, dy, dw, dh
    );
    return true;
  }
  function custSpriteName(opt) {
    if (opt.kid) return "kid";
    if (opt.name === "Maya" || opt.hawaii) return "maya";
    if (opt.name === "Nico" || opt.sailor) return "nico";
    if (opt.name === "Jun" || opt.visor) return "jun";
    if (opt.vip || opt.crown) return "vip";
    if (opt.hat === "#c4483a" && opt.shirt === "#1b4d6b") return "cashier";
    let h = 0;
    const s = String(opt.name || "") + String(opt.shirt || "") + String(opt.hairCut || 0);
    for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) | 0;
    return "g" + ((h >>> 0) % 6);
  }

  // ===== STATE =====
  const state = {
    mode: "title", scene: "shop", money: 0, speedLv: 0, bagLv: 0, catchLv: 0,
    unlocked: padSpeciesFlags([true]), stock: padSpeciesNums([]), bag: [],
    tutorial: 0, fade: 0, fadeDir: 0, pendingScene: null, time: 0, toasts: [],
    registerCash: 0, coins: [], hasSave: false, lifetimeCatches: 0, muted: false,
    hitStop: 0, camPunch: 0, bagPunch: 1, moneyPunch: 1, displayMoney: 0,
    moneyRollFrom: 0, moneyRollTo: 0, moneyRollT: 0, audioUnlocked: false,
    diveCatches: 0, bagBonus: 1, flash: 0, dustTimer: 0,
    splash: null, tankReveal: null, unlockBanner: null, comboPop: null,
    shopSwimmers: [], didFirstCollect: false, didFirstUnlock: false,
    hiredCashier: false, cashierAcc: 0,
    sawReef: false, sawGoldGarden: false, sawKoiGate: false, sawTurtleMeadow: false,
    inReef: false, zoneTitle: null,
    expedition: false, expeditionTime: 0, peakMoney: 0, vipCooldown: 0,
    caughtCount: padSpeciesNums([]), bookOpen: null,
    decor: [false, false, false], expeditionCount: 0, nightExpedition: false,
    decorOpen: false,
    missionStep: 0, missionDone: false, caughtRare: false,
    bagRare: [], stockRare: padSpeciesNums([]),
    sessionDay: 1, sawDeepZone: 0,
    diveLock: 0, surfaceLock: 0,
    didMove: false, shinyCallout: 0, shinyFocus: 0,
    sessionGoals: [], sessionGoalDone: [], sessionSales: 0,
    sessionCaughtRare: false, sessionBoat: false,
    bookOpened: false, bookTeaseShown: false, sawBookTease: false,
    pendingBookTease: false, bookTeaseWait: 0,
    didFirstStock: false, didFirstSale: false,
    shinyHold: 0, shinyHoldName: "",
    boatHint: 0, boatGlance: 0,
    coneFlash: 0, registerPunch: 1, tankShake: null, cardShake: null, priceFlash: null, nopeFlash: 0,
    catchClimax: null,
    divesThisSession: 0, tangRumor: false, freezeFrame: 0,
    aisleSchoolWait: 0, nearMiss: [], nearMissLife: 0, surfaceYell: null,
    catchVerb: null, tankFlash: null, pierChirp: 0,
    camNudge: 0, camNudgeMax: 0, camSettle: 0, camEase: 0,
    camTillHold: 0,
    almostSfxAt: 0,
    skin: "skip",
    surfaceQuiet: 0,
    playClock: 0,
    tillSlip: null,
    escapeBar: null, escapeGate: 0,
  };
  const player = { x: 880, y: 920, vx: 0, vy: 0, facing: 0, bob: 0, catchProg: 0, target: null, radius: 16, goto: null, walkPhase: 0, lean: 0, pendingAct: null, catchLatch: false, scoopLock: null, scoopTap: false, tillDwell: 0, holdGrace: 0 };
  const cam = { x: 880, y: 920, z: 1, rail: 28 };
  const oceanFish = [];
  const tankFish = SPECIES.map(() => []);
  const customers = [];
  const particles = [];
  const pops = [];
  const bubbles = [];
  const flyers = [];
  const hudCoins = [];
  const worldCoins = [];
  const titleBubbles = [];
  const dockTeasers = [];
  const hudPops = [];
  const stockHops = [];
  const bagGhosts = [];
  const pathGlints = [];
  const pathCoins = [];
  const saleTalks = [];
  const tankRipples = [];
  const tankReceipts = [];
  const pierLife = { gull: null, gull2: null, skiff: null, seeded: false };
  const oceanScenery = [];
  const tankExits = [];
  let saleBarkDeck = [];
  const saleBarkRecent = [];
  const keys = new Set();
  const mouse = { x: W / 2, y: H / 2, down: false, ui: false, held: 0, acted: false, pressX: 0, pressY: 0, scoopPress: false };
  let uiHits = [];
  let custTimer = 0;
  let browseTimer = 0.35;

  // ===== AUDIO =====
  let actx = null;
  const music = { started: false, pad: null, padGain: null, lfo: null, wash: null, washGain: null, washFilter: null, step: 0, acc: 0 };
  function audio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === "suspended") actx.resume();
    if (!state.audioUnlocked) {
      state.audioUnlocked = true;
      startMusic();
    }
    return actx;
  }
  function tone(freq, dur, type, vol, slide) {
    const a = actx || audio();
    if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(1, slide), a.currentTime + dur);
    g.gain.setValueAtTime(vol || 0.07, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur);
  }
  function noiseBurst(dur, startF, endF, vol) {
    const a = actx || audio();
    if (!a) { tone(220, dur, "sine", vol || 0.05, 90); return; }
    try {
      const n = Math.max(1, (a.sampleRate * dur) | 0);
      const buf = a.createBuffer(1, n, a.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = a.createBufferSource();
      src.buffer = buf;
      const f = a.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(startF, a.currentTime);
      f.frequency.exponentialRampToValueAtTime(Math.max(40, endF), a.currentTime + dur);
      const g = a.createGain();
      g.gain.setValueAtTime(vol || 0.1, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
      src.connect(f); f.connect(g); g.connect(a.destination);
      src.start();
    } catch (e) {
      tone(220, dur, "sine", vol || 0.05, 90);
    }
  }
  function startMusic() {
    const a = actx;
    if (!a || music.started) return;
    music.started = true;
    try {
      music.pad = a.createOscillator();
      music.pad.type = "sine";
      music.pad.frequency.value = 110;
      music.padGain = a.createGain();
      music.padGain.gain.value = state.muted ? 0 : 0.022;
      music.lfo = a.createOscillator();
      music.lfo.frequency.value = 0.12;
      const lfoGain = a.createGain();
      lfoGain.gain.value = 7;
      music.lfo.connect(lfoGain);
      lfoGain.connect(music.pad.frequency);
      music.pad.connect(music.padGain);
      music.padGain.connect(a.destination);
      music.pad.start();
      music.lfo.start();
      const n = Math.max(1, (a.sampleRate * 2.4) | 0);
      const buf = a.createBuffer(1, n, a.sampleRate);
      const data = buf.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < n; i++) {
        brown = clamp(brown + (Math.random() * 2 - 1) * 0.02, -1, 1);
        data[i] = brown * 0.7 + (Math.random() * 2 - 1) * 0.08;
      }
      music.wash = a.createBufferSource();
      music.wash.buffer = buf;
      music.wash.loop = true;
      music.washFilter = a.createBiquadFilter();
      music.washFilter.type = "lowpass";
      music.washFilter.frequency.value = 420;
      music.washGain = a.createGain();
      music.washGain.gain.value = state.muted ? 0 : 0.016;
      music.wash.connect(music.washFilter);
      music.washFilter.connect(music.washGain);
      music.washGain.connect(a.destination);
      music.wash.start();
    } catch (e) { music.started = false; }
  }
  function tickMusic(dt) {
    if (!music.started || !actx) return;
    const ocean = state.mode !== "title" && state.scene === "ocean";
    const sectionB = (music.step % 96) >= 64;
    const padFreq = ocean ? (sectionB ? 73 : 82) : (sectionB ? 98 : 110);
    if (music.pad) {
      music.pad.frequency.setTargetAtTime(padFreq, actx.currentTime, 0.35);
      if (music.padGain) music.padGain.gain.setTargetAtTime(state.muted ? 0 : (sectionB ? 0.016 : 0.02), actx.currentTime, 0.12);
    }
    if (music.washFilter) {
      music.washFilter.frequency.setTargetAtTime(ocean ? 280 : 460, actx.currentTime, 0.4);
    }
    if (music.washGain) {
      const washVol = ocean ? 0.022 : 0.014;
      music.washGain.gain.setTargetAtTime(state.muted ? 0 : washVol, actx.currentTime, 0.18);
    }
    const tick = ocean ? 0.28 : 0.18;
    music.acc += dt;
    if (music.acc >= tick) {
      music.acc -= tick;
      if (!state.muted) {
        const notesA = [0, 3, 5, 7, 5, 3, 0, -2];
        const notesB = [2, 5, 3, 7, 10, 7, 5, 3];
        const notes = sectionB ? notesB : notesA;
        const n = notes[music.step & 7];
        tone(220 * Math.pow(2, n / 12), sectionB ? 0.12 : 0.1, "sine", sectionB ? 0.016 : 0.018);
        music.step++;
      }
    }
  }
  function sfx(kind, vol) {
    if (state.muted) return;
    if (kind === "catch") {
      tone(523, 0.055, "triangle", 0.075);
      setTimeout(() => { if (!state.muted) tone(659, 0.055, "triangle", 0.075); }, 55);
      setTimeout(() => { if (!state.muted) tone(784, 0.055, "triangle", 0.07); }, 110);
      setTimeout(() => { if (!state.muted) tone(1046, 0.07, "triangle", 0.06); }, 165);
    } else if (kind === "coin") {
      const v = vol == null ? 1 : vol;
      tone(880, 0.07, "square", 0.045 * v, 1320);
      tone(1320, 0.05, "sine", 0.04 * v);
    } else if (kind === "unlock") {
      tone(392, 0.09, "triangle", 0.07);
      setTimeout(() => { if (!state.muted) tone(523, 0.09, "triangle", 0.07); }, 90);
      setTimeout(() => { if (!state.muted) tone(659, 0.09, "triangle", 0.075); }, 180);
      setTimeout(() => { if (!state.muted) tone(784, 0.12, "triangle", 0.08); }, 270);
    } else if (kind === "dive") {
      noiseBurst(0.28, 400, 80, 0.11);
    } else if (kind === "stock") {
      noiseBurst(0.1, 900, 400, 0.07);
      tone(400, 0.08, "sine", 0.05, 640);
    } else if (kind === "click") { tone(400, 0.04, "square", 0.03); }
    else if (kind === "no") {
      tone(220, 0.07, "square", 0.08, 130);
      setTimeout(() => { if (!state.muted) tone(130, 0.12, "square", 0.07); }, 50);
    }
    else if (kind === "shiny") {
      tone(659, 0.06, "triangle", 0.08);
      setTimeout(() => { if (!state.muted) tone(880, 0.07, "triangle", 0.08); }, 50);
      setTimeout(() => { if (!state.muted) tone(1175, 0.08, "sine", 0.07); }, 110);
      setTimeout(() => { if (!state.muted) tone(1568, 0.1, "triangle", 0.06); }, 180);
    } else if (kind === "step") {
      noiseBurst(0.045, 280, 90, 0.035);
    } else if (kind === "sale") {
      tone(740, 0.05, "square", 0.055, 1180);
      tone(988, 0.08, "sine", 0.05);
    } else if (kind === "firstsale") {
      tone(392, 0.07, "square", 0.07);
      setTimeout(() => { if (!state.muted) tone(523, 0.08, "square", 0.075, 784); }, 55);
      setTimeout(() => { if (!state.muted) tone(784, 0.1, "triangle", 0.08); }, 120);
      setTimeout(() => { if (!state.muted) tone(1046, 0.12, "sine", 0.07); }, 190);
      setTimeout(() => { if (!state.muted) tone(1319, 0.16, "triangle", 0.055); }, 280);
    } else if (kind === "cashin") {
      tone(523, 0.06, "triangle", 0.07);
      setTimeout(() => { if (!state.muted) tone(784, 0.07, "square", 0.06, 1175); }, 45);
      setTimeout(() => { if (!state.muted) tone(1046, 0.1, "sine", 0.055); }, 100);
    } else if (kind === "almost") {
      tone(490, 0.045, "sine", 0.022, 360);
    } else if (kind === "tang") {
      tone(494, 0.07, "sine", 0.07, 740);
      setTimeout(() => { if (!state.muted) tone(740, 0.08, "triangle", 0.07); }, 70);
      setTimeout(() => { if (!state.muted) tone(988, 0.1, "sine", 0.065); }, 150);
      setTimeout(() => { if (!state.muted) tone(1480, 0.12, "triangle", 0.05); }, 240);
    } else if (kind === "gull") {
      tone(980, 0.055, "triangle", 0.032, 640);
      setTimeout(() => { if (!state.muted) tone(720, 0.09, "sine", 0.026, 480); }, 80);
    } else if (kind === "lap") {
      noiseBurst(0.18, 280, 60, 0.026);
    } else if (kind === "receipt") {
      tone(1046, 0.045, "square", 0.04);
      tone(1480, 0.06, "sine", 0.028);
    } else if (kind === "escape") {
      tone(420, 0.07, "triangle", 0.04, 180);
    }
  }
  function playAlmostSfx() {
    if (state.time - (state.almostSfxAt || 0) < 2.4) return;
    state.almostSfxAt = state.time;
    sfx("almost");
  }

  // ===== SAVE =====
  function defaultSave() {
    return {
      money: 0, speedLv: 0, bagLv: 0, catchLv: 0,
      unlocked: padSpeciesFlags([true]),
      stock: padSpeciesNums([]), bag: [], tutorial: 0, registerCash: 0,
      lifetimeCatches: 0, muted: false, hiredCashier: false,
      sawReef: false, sawGoldGarden: false, sawKoiGate: false, sawTurtleMeadow: false,
      peakMoney: 0, caughtCount: padSpeciesNums([]),
      decor: [false, false, false], expeditionCount: 0,
      missionStep: 0, missionDone: false, caughtRare: false,
      bagRare: [], stockRare: padSpeciesNums([]),
      sessionGoals: [], sessionGoalDone: [], sessionSales: 0,
      sessionDay: 1, sawDeepZone: 0,
      sessionCaughtRare: false, sessionBoat: false,
      bookOpened: false, bookTeaseShown: false, sawBookTease: false,
      pendingBookTease: false,
      didFirstStock: false, didFirstSale: false,
      skin: "skip",
    };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      Object.assign(state, {
        money: d.money | 0, speedLv: d.speedLv | 0, bagLv: d.bagLv | 0, catchLv: d.catchLv | 0,
        unlocked: padSpeciesFlags(Array.isArray(d.unlocked) ? d.unlocked : [true]),
        stock: padSpeciesNums(Array.isArray(d.stock) ? d.stock : []),
        bag: Array.isArray(d.bag) ? d.bag : [],
        tutorial: d.tutorial | 0, registerCash: d.registerCash | 0,
        lifetimeCatches: d.lifetimeCatches | 0,
        muted: !!d.muted,
        displayMoney: d.money | 0,
        didFirstCollect: !!(d.didFirstCollect || (d.money | 0) > 0),
        didFirstUnlock: !!(d.didFirstUnlock || (Array.isArray(d.unlocked) && d.unlocked.filter(Boolean).length > 1)),
        hiredCashier: !!d.hiredCashier,
        cashierAcc: 0,
        sawReef: !!d.sawReef, sawGoldGarden: !!d.sawGoldGarden,
        sawKoiGate: !!d.sawKoiGate, sawTurtleMeadow: !!d.sawTurtleMeadow,
        inReef: false, zoneTitle: null,
        peakMoney: Math.max(d.peakMoney | 0, d.money | 0),
        expedition: false, expeditionTime: 0, vipCooldown: 0,
        caughtCount: padSpeciesNums(Array.isArray(d.caughtCount) ? d.caughtCount : []),
        bookOpen: null,
        decor: Array.isArray(d.decor) ? [0, 1, 2].map(i => !!d.decor[i]) : [false, false, false],
        expeditionCount: d.expeditionCount | 0,
        nightExpedition: false,
        decorOpen: false,
        missionStep: d.missionStep | 0,
        missionDone: !!d.missionDone,
        caughtRare: !!d.caughtRare,
        bagRare: Array.isArray(d.bag) ? d.bag.map((_, i) => !!(d.bagRare && d.bagRare[i])) : [],
        stockRare: padSpeciesNums(Array.isArray(d.stockRare) ? d.stockRare : []),
        sessionGoals: Array.isArray(d.sessionGoals) ? d.sessionGoals.slice(0, 3) : [],
        sessionGoalDone: Array.isArray(d.sessionGoalDone) ? d.sessionGoalDone.slice() : [],
        sessionDay: Math.max(1, d.sessionDay | 0),
        sawDeepZone: d.sawDeepZone | 0,
        sessionSales: d.sessionSales | 0,
        sessionCaughtRare: !!d.sessionCaughtRare,
        sessionBoat: !!d.sessionBoat,
        bookOpened: !!d.bookOpened,
        bookTeaseShown: !!d.bookTeaseShown,
        sawBookTease: !!d.sawBookTease,
        pendingBookTease: !!d.pendingBookTease,
        didFirstStock: !!(d.didFirstStock || (Array.isArray(d.stock) && d.stock.some(n => (n | 0) > 0))),
        didFirstSale: !!(d.didFirstSale || d.didFirstCollect || (d.money | 0) > 0),
        skin: normalizeSkin(d.skin),
      });
      if (!state.missionDone) {
        if ((state.tutorial | 0) >= 1) state.missionStep = Math.max(state.missionStep | 0, 1);
        if (((state.caughtCount && state.caughtCount[0]) | 0) >= 5) state.missionStep = Math.max(state.missionStep | 0, 2);
        if ((state.money | 0) >= 60 && (state.tutorial | 0) >= 4) state.missionDone = true;
      }
      state.hasSave = true;
      rebuildTankFish();
      return true;
    } catch (e) { return false; }
  }
  function persist() {
    try {
      state.peakMoney = Math.max(state.peakMoney | 0, state.money | 0);
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        money: state.money, speedLv: state.speedLv, bagLv: state.bagLv, catchLv: state.catchLv,
        unlocked: padSpeciesFlags(state.unlocked), stock: padSpeciesNums(state.stock), bag: state.bag,
        tutorial: state.tutorial, registerCash: state.registerCash,
        lifetimeCatches: state.lifetimeCatches, muted: state.muted,
        didFirstCollect: state.didFirstCollect, didFirstUnlock: state.didFirstUnlock,
        hiredCashier: state.hiredCashier,
        sawReef: state.sawReef, sawGoldGarden: state.sawGoldGarden,
        sawKoiGate: state.sawKoiGate, sawTurtleMeadow: state.sawTurtleMeadow,
        peakMoney: Math.max(state.peakMoney | 0, state.money | 0),
        caughtCount: padSpeciesNums(state.caughtCount),
        decor: state.decor || [false, false, false],
        expeditionCount: state.expeditionCount | 0,
        missionStep: state.missionStep | 0,
        missionDone: !!state.missionDone,
        caughtRare: !!state.caughtRare,
        bagRare: state.bagRare || [],
        stockRare: padSpeciesNums(state.stockRare),
        sessionGoals: state.sessionGoals || [],
        sessionGoalDone: state.sessionGoalDone || [],
        sessionSales: state.sessionSales | 0,
        sessionDay: Math.max(1, state.sessionDay | 0),
        sawDeepZone: state.sawDeepZone | 0,
        sessionCaughtRare: !!state.sessionCaughtRare,
        sessionBoat: !!state.sessionBoat,
        bookOpened: !!state.bookOpened,
        bookTeaseShown: !!state.bookTeaseShown,
        sawBookTease: !!state.sawBookTease,
        pendingBookTease: !!state.pendingBookTease,
        didFirstStock: !!state.didFirstStock,
        didFirstSale: !!state.didFirstSale,
        skin: normalizeSkin(state.skin),
      }));
      state.hasSave = true;
    } catch (e) {}
  }
  function resetSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    const keepMute = state.muted;
    const keepSkin = normalizeSkin(state.skin);
    Object.assign(state, defaultSave(), { mode: "title", scene: "shop", fade: 0, coins: [], toasts: [],
      muted: keepMute, skin: keepSkin, hitStop: 0, camPunch: 0, bagPunch: 1, moneyPunch: 1, displayMoney: 0,
      moneyRollT: 0, audioUnlocked: state.audioUnlocked,
      diveCatches: 0, bagBonus: 1, flash: 0, dustTimer: 0,
      splash: null, tankReveal: null, unlockBanner: null, comboPop: null, shopSwimmers: [],
      didFirstCollect: false, didFirstUnlock: false, hiredCashier: false, cashierAcc: 0,
      sawReef: false, sawGoldGarden: false, sawKoiGate: false, sawTurtleMeadow: false,
      inReef: false, zoneTitle: null, expedition: false, expeditionTime: 0, peakMoney: 0, vipCooldown: 0,
      caughtCount: padSpeciesNums([]), bookOpen: null,
      decor: [false, false, false], expeditionCount: 0, nightExpedition: false, decorOpen: false,
      missionStep: 0, missionDone: false, caughtRare: false,
      bagRare: [], stockRare: padSpeciesNums([]),
      sessionDay: 1, sawDeepZone: 0,
      diveLock: 0, surfaceLock: 0, didMove: false, shinyCallout: 0, shinyFocus: 0,
      sessionGoals: [], sessionGoalDone: [], sessionSales: 0,
      sessionCaughtRare: false, sessionBoat: false,
      bookOpened: false, bookTeaseShown: false, sawBookTease: false,
      pendingBookTease: false, bookTeaseWait: 0,
      didFirstStock: false, didFirstSale: false,
      shinyHold: 0, shinyHoldName: "",
      boatHint: 0, boatGlance: 0,
      coneFlash: 0, registerPunch: 1, tankShake: null, cardShake: null, priceFlash: null, nopeFlash: 0,
      catchClimax: null, divesThisSession: 0, tangRumor: false, freezeFrame: 0,
      aisleSchoolWait: 0, nearMiss: [], nearMissLife: 0, surfaceYell: null,
      catchVerb: null, tankFlash: null, pierChirp: 0,
      camNudge: 0, camNudgeMax: 0, camSettle: 0, camEase: 0, camTillHold: 0, almostSfxAt: 0, surfaceQuiet: 0,
      playClock: 0, tillSlip: null, escapeBar: null, escapeGate: 0 });
    state.hasSave = false;
    player.x = 880; player.y = 920; player.vx = 0; player.vy = 0; player.catchProg = 0; player.target = null; player.goto = null; player.walkPhase = 0; player.lean = 0; player.pendingAct = null; player.catchLatch = false; player.scoopLock = null; player.scoopTap = false; player.tillDwell = 0; player.holdGrace = 0;
    cam.x = 880; cam.y = 920; cam.z = 1; cam.rail = 28;
    customers.length = 0; oceanFish.length = 0; particles.length = 0; pops.length = 0; bubbles.length = 0;
    flyers.length = 0; hudCoins.length = 0; worldCoins.length = 0; hudPops.length = 0;
    stockHops.length = 0; bagGhosts.length = 0; pathGlints.length = 0; pathCoins.length = 0;
    saleTalks.length = 0; tankRipples.length = 0; tankReceipts.length = 0;
    oceanScenery.length = 0; tankExits.length = 0;
    pierLife.gull = null; pierLife.gull2 = null; pierLife.skiff = null; pierLife.seeded = false;
    saleBarkDeck.length = 0; saleBarkRecent.length = 0;
    browseTimer = 0.35;
    for (let i = 0; i < SPECIES.length; i++) tankFish[i].length = 0;
    seedOcean();
  }

  // ===== HELPERS =====
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  function normalizeSkin(id) {
    return SKIN_IDS.indexOf(id) >= 0 ? id : "skip";
  }
  function isCoarsePointer() {
    return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }
  function displayScale() {
    const r = canvas.getBoundingClientRect();
    return r.width > 8 ? r.width / W : 1;
  }
  function compactHud() {
    return isCoarsePointer() || displayScale() < 0.62;
  }
  function topCtrlBoxes() {
    const topBtn = compactHud() ? thumbCanvas(44, 54, 84) : 54;
    const pauseB = hudBox(W - 16 - topBtn, 14, topBtn, Math.max(40, topBtn - 8));
    const muteB = hudBox(pauseB.x - 8 - topBtn, 14, topBtn, pauseB.h);
    return { topBtn, pauseB, muteB };
  }
  function topHudFloor() {
    let floor = 14 + 52 + 8;
    if (missionVisible() || sessionChipVisible()) floor += 38;
    const rb = ribbonLayout();
    if (rb) floor = Math.max(floor, rb.y + rb.h + 8);
    return floor;
  }
  function thumbCanvas(cssPx, minC, maxC) {
    const s = Math.max(0.28, displayScale());
    return clamp(Math.round(cssPx / s), minC, maxC);
  }
  function layoutStage() {
    const wrap = document.getElementById("wrap");
    if (!wrap) return;
    const vv = window.visualViewport;
    const w = vv ? vv.width : window.innerWidth;
    const h = vv ? vv.height : window.innerHeight;
    wrap.style.width = Math.max(1, w) + "px";
    wrap.style.height = Math.max(1, h) + "px";
    wrap.style.left = ((vv && vv.offsetLeft) || 0) + "px";
    wrap.style.top = ((vv && vv.offsetTop) || 0) + "px";
    const cw = wrap.clientWidth || w;
    const ch = wrap.clientHeight || h;
    const scale = Math.min(cw / W, ch / H);
    let cssW = Math.max(1, Math.round(W * scale));
    let cssH = Math.max(1, Math.round(cssW * H / W));
    if (cssH > ch) {
      cssH = Math.max(1, Math.round(H * scale));
      cssW = Math.max(1, Math.round(cssH * W / H));
    }
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    const bw = Math.max(1, Math.round(cssW * dpr));
    const bh = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    canvasDpr = bw / W;
    beginCanvas();
  }
  function beginCanvas() {
    ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";
  }
  function normAng(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }
  function bagMax() { return BAG_STEPS[clamp(state.bagLv, 0, BAG_STEPS.length - 1)]; }
  function walkSpeed() {
    // First-session dock↔tank is the dead stretch. A small free bump until Speed is bought.
    const firstBump = (state.speedLv === 0 && !state.missionDone) ? 24 : 0;
    return 232 + state.speedLv * 38 + firstBump;
  }
  function aisleMidX() { return AISLE.x + AISLE.w / 2; }
  function inAisleWater(x, y) {
    return x > AISLE.x + 10 && x < AISLE.x + AISLE.w - 10 &&
      y > AISLE.y + 16 && y < AISLE.y + AISLE.h - 16;
  }
  function inTankWater(x, y) {
    for (let i = 0; i < SPECIES.length; i++) {
      if (!tankLive(i)) continue;
      const t = TANK_POS[i];
      if (x > t.x + 10 && x < t.x + TANK_W - 10 && y > t.y + 10 && y < t.y + TANK_H - 10) return true;
    }
    return false;
  }
  function inDockWater(x, y) {
    return y > 900;
  }
  function onDryWood(x, y) {
    if (inAisleWater(x, y) || inTankWater(x, y) || inDockWater(x, y)) return false;
    return x > 70 && x < (galleryOpen() ? 2220 : 1700) && y > 70 && y < 900;
  }
  function confineShopSwimmer(sw) {
    const pad = 28;
    const top = AISLE.y + pad;
    const bot = AISLE.y + AISLE.h - pad;
    sw.x = aisleMidX() + Math.sin(state.time * 1.55 + sw.ph) * (AISLE.w * 0.18);
    sw.y = clamp(sw.y, top, bot);
    if (!inAisleWater(sw.x, sw.y) || onDryWood(sw.x, sw.y)) {
      sw.x = aisleMidX();
      sw.y = clamp(sw.y, top, bot);
    }
  }
  function regularLinePool(c) {
    if (c && REGULAR_LINES[c.name]) return REGULAR_LINES[c.name];
    return REGULAR_LINES._;
  }
  function isUsualLine(s) {
    return s === "the usual!" || s === "the usual?";
  }
  function shuffleSaleBarkDeck() {
    const pool = SALE_BARK_POOL.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    if (isUsualLine(pool[0]) && pool.length > 1) {
      const j = 1 + ((Math.random() * (pool.length - 1)) | 0);
      const tmp = pool[0]; pool[0] = pool[j]; pool[j] = tmp;
    }
    const last = saleBarkRecent.length ? saleBarkRecent[saleBarkRecent.length - 1] : "";
    if (last && pool[0] === last && pool.length > 1) {
      const tmp = pool[0]; pool[0] = pool[1]; pool[1] = tmp;
    }
    saleBarkDeck = pool;
  }
  function nextRegularLine(c) {
    if (!saleBarkDeck.length) shuffleSaleBarkDeck();
    const line = saleBarkDeck.shift();
    saleBarkRecent.push(line);
    if (saleBarkRecent.length > 3) saleBarkRecent.shift();
    if (c) {
      c.saidLine = line;
      c.lineSeq = (c.lineSeq | 0) + 1;
    }
    return line;
  }
  function regularBark(c) {
    if (c && c.saidLine) return c.saidLine;
    return nextRegularLine(c);
  }
  function isGoldTalk(label) {
    const s = String(label || "");
    if (isUsualLine(s)) return true;
    if (SALE_BARK_POOL.indexOf(s) >= 0) return true;
    for (const k of Object.keys(REGULAR_LINES)) {
      if (REGULAR_LINES[k].indexOf(s) >= 0) return true;
    }
    return false;
  }
  function applyRegularLook(c) {
    const look = c && REGULAR_LOOKS[c.name];
    if (!look) return c;
    c.hawaii = !!look.hawaii;
    c.sailor = !!look.sailor;
    c.visor = !!look.visor;
    if (look.hat) c.hat = look.hat;
    c.shirt = look.shirt;
    c.hair = look.hair;
    c.hairCut = look.hairCut;
    c.idle = look.idle;
    c.regular = true;
    if (c.favorite == null) c.favorite = 0;
    return c;
  }
  function applySpeciesGait(f, dt, sp) {
    if (f.gaitT == null) f.gaitT = f.ph || 0;
    f.gaitT += dt;
    const gait = sp.gait || "dart";
    if (gait === "dart") {
      if (f.dartWait == null) f.dartWait = 0.12;
      f.dartWait -= dt;
      if (f.dartWait <= 0) {
        f.darting = !f.darting;
        f.dartWait = f.darting ? rand(0.14, 0.26) : rand(0.28, 0.55);
        if (f.darting) f.ang += (Math.random() - 0.5) * 1.7;
      }
      const cruise = sp.cruise * (f.darting ? 2.15 : 0.22);
      f.vx = Math.cos(f.ang) * cruise;
      f.vy = Math.sin(f.ang) * cruise * 0.85;
    } else if (gait === "hover") {
      f.vx = Math.sin(f.gaitT * 1.4 + f.ph) * 18;
      f.vy = Math.cos(f.gaitT * 2.1 + f.ph) * 22;
      f.ang = -1.2 + Math.sin(f.gaitT * 1.6) * 0.18;
    } else if (gait === "puff") {
      if (Math.random() < dt * 0.2) f.ang += (Math.random() - 0.5) * 0.5;
      const puff = 0.2 + 0.18 * (0.5 + 0.5 * Math.sin(f.gaitT * 0.9 + f.ph));
      f.vx = Math.cos(f.ang) * sp.cruise * puff;
      f.vy = Math.sin(f.ang) * sp.cruise * puff + Math.sin(f.gaitT * 0.8 + f.ph) * 16;
    } else if (gait === "crawl") {
      if (Math.random() < dt * 0.35) f.ang += (Math.random() - 0.5) * 1.1;
      f.vx = Math.cos(f.ang) * sp.cruise * 0.7;
      f.vy = Math.sin(f.ang) * sp.cruise * 0.55;
    } else if (gait === "scuttle") {
      f.ang = Math.sin(f.gaitT * 3.4 + f.ph) > 0 ? 0.08 : Math.PI - 0.08;
      f.vx = Math.cos(f.ang) * sp.cruise * 1.35;
      f.vy = Math.sin(f.gaitT * 6 + f.ph) * 28;
    } else if (gait === "jet") {
      if (f.dartWait == null) f.dartWait = 0.2;
      f.dartWait -= dt;
      if (f.dartWait <= 0) {
        f.darting = !f.darting;
        f.dartWait = f.darting ? rand(0.1, 0.2) : rand(0.4, 0.8);
        if (f.darting) f.ang += (Math.random() - 0.5) * 0.9;
      }
      const jet = sp.cruise * (f.darting ? 2.4 : 0.12);
      f.vx = Math.cos(f.ang) * jet;
      f.vy = Math.sin(f.ang) * jet * 0.7;
    } else if (gait === "glide") {
      f.ang += Math.sin(f.gaitT * 0.28 + f.ph) * 0.12 * dt;
      f.vx = Math.cos(f.ang) * sp.cruise;
      f.vy = Math.sin(f.ang) * sp.cruise * 0.35 + Math.sin(f.gaitT * 0.6) * 8;
    } else if (gait === "figure8") {
      const a = f.gaitT * 2.35 + f.ph;
      f.vx = Math.cos(a) * sp.cruise * 1.15;
      f.vy = Math.sin(a * 2) * sp.cruise * 0.62;
      f.ang = Math.atan2(f.vy, f.vx);
    } else if (gait === "loaf") {
      if (Math.random() < dt * 0.18) f.ang += (Math.random() - 0.5) * 0.45;
      const loaf = 0.12 + 0.14 * (0.5 + 0.5 * Math.sin(f.gaitT * 0.7 + f.ph));
      f.vx = Math.cos(f.ang) * sp.cruise * loaf;
      f.vy = Math.sin(f.ang) * sp.cruise * loaf + Math.sin(f.gaitT * 1.05 + f.ph) * 26;
    } else if (gait === "parade") {
      f.ang += Math.sin(f.gaitT * 0.42 + f.ph) * 0.28 * dt;
      f.vx = Math.cos(f.ang) * sp.cruise * 1.08;
      f.vy = Math.sin(f.ang) * sp.cruise * 0.28;
    } else {
      const stroke = Math.sin(f.gaitT * 2.35 + f.ph);
      const speed = sp.cruise * (0.42 + 0.58 * Math.max(0, stroke));
      if (Math.random() < dt * 0.1) f.ang += (Math.random() - 0.5) * 0.22;
      f.vx = Math.cos(f.ang) * speed;
      f.vy = Math.sin(f.ang) * speed * 0.55 + Math.sin(f.gaitT * 1.15 + f.ph) * 10;
    }
  }
  function swimSpeed() { return 215 + state.speedLv * 42; }
  function catchTime() { return (state.lifetimeCatches < 3 ? 0.62 : 0.74) / (1 + 0.24 * state.catchLv); }
  function catchHoldingRaw() {
    return !!(mouse.down || keys.has(" ") || keys.has("enter") || player.scoopTap);
  }
  function catchHolding() {
    return catchHoldingRaw() || (player.holdGrace || 0) > 0;
  }
  function tickHoldGrace(dt) {
    if (catchHoldingRaw()) player.holdGrace = 0.14;
    else if ((player.holdGrace || 0) > 0) player.holdGrace = Math.max(0, player.holdGrace - (dt || 0));
  }
  function teasersAllowed() { return !!state.unlocked[1]; }
  function allowAutoStock() { return !!state.didFirstStock; }
  function ribbonLockedToGoal() {
    return !state.unlocked[1] || (state.playClock || 0) < 120;
  }
  // First 2–3 catches of dive 1: wide cone / auto-target, then taper.
  function tutorialGrace() {
    if ((state.divesThisSession | 0) !== 1) return 0;
    const n = state.diveCatches | 0;
    if (n < 2) return 1;
    if (n < 3) return 0.45;
    return 0;
  }
  function dockWalkPoint() { return { x: 880, y: 1008 }; }
  function dockOffScreen() {
    if (state.scene !== "shop") return false;
    const s = worldToScreen(880, 1008);
    return s.x < 48 || s.x > W - 48 || s.y < 56 || s.y > H - 56;
  }
  function dockCornerBox() {
    const s = worldToScreen(880, 1008);
    const w = compactHud() ? 118 : 132;
    const h = compactHud() ? 42 : 36;
    return dodgeUpgradeTray(hudBox(clamp(s.x - w / 2, 16, W - 16 - w), clamp(s.y - h / 2, 74, H - 18 - h), w, h));
  }
  function walkToDock() {
    player.goto = dockWalkPoint();
    player.pendingAct = null;
  }
  function cashNeedsCollect() {
    return tillWaiting() && !cashierHandlingIt();
  }
  function tillWorld() {
    return { x: REGISTER.x + REGISTER.w / 2, y: REGISTER.y + REGISTER.h / 2 };
  }
  function holdTillView(secs) {
    state.camTillHold = Math.max(state.camTillHold || 0, secs == null ? 1.6 : secs);
    state.camEase = Math.max(state.camEase || 0, 0.46);
  }
  function wantTillFrame() {
    if (state.scene !== "shop") return false;
    if (state.bookOpen != null || (state.boatGlance || 0) > 0) return false;
    if ((state.camTillHold || 0) > 0) return true;
    if (cashNeedsCollect()) return true;
    if (player.pendingAct && player.pendingAct.kind === "cash") return true;
    if (player.goto) {
      const tw = tillWorld();
      if (Math.hypot(player.goto.x - tw.x, player.goto.y - tw.y) < 160) return true;
    }
    return false;
  }
  function tillOffScreen() {
    if (state.scene !== "shop") return false;
    const t = tillWorld();
    const s = worldToScreen(t.x, t.y);
    return s.x < 56 || s.x > W - 56 || s.y < 64 || s.y > H - 64;
  }
  function tillCornerBox() {
    const t = tillWorld();
    const s = worldToScreen(t.x, t.y);
    const w = compactHud() ? 132 : 148;
    const h = compactHud() ? 42 : 36;
    return dodgeUpgradeTray(hudBox(clamp(s.x - w / 2, 16, W - 16 - w), clamp(s.y - h / 2, 74, H - 18 - h), w, h));
  }
  function isDockDest(pt) {
    if (!pt) return false;
    return Math.hypot(pt.x - 880, pt.y - 1008) < 80 ||
      (pt.x > DIVE_ZONE.x && pt.x < DIVE_ZONE.x + DIVE_ZONE.w &&
       pt.y > DIVE_ZONE.y - 20 && pt.y < DIVE_ZONE.y + DIVE_ZONE.h + 20);
  }
  function clickOnDiveStrip() {
    const w = screenToWorld(mouse.pressX, mouse.pressY);
    return w.x > DIVE_ZONE.x + 24 && w.x < DIVE_ZONE.x + DIVE_ZONE.w - 24 &&
           w.y > DIVE_ZONE.y && w.y < DIVE_ZONE.y + DIVE_ZONE.h;
  }
  function diveChipBox() { return { x: 820, y: 910, w: 120, h: 36 }; }
  function clickOnDiveChip() {
    const w = screenToWorld(mouse.pressX, mouse.pressY);
    const b = diveChipBox();
    return w.x > b.x - 8 && w.x < b.x + b.w + 8 && w.y > b.y - 8 && w.y < b.y + b.h + 8;
  }
  function nearDivePad() {
    return player.x > DIVE_ZONE.x - 48 && player.x < DIVE_ZONE.x + DIVE_ZONE.w + 48 &&
           player.y > DIVE_ZONE.y - 110 && player.y < DIVE_ZONE.y + DIVE_ZONE.h + 24;
  }
  function scoopEdgeGrace() {
    return 10 + 2 / Math.max(0.55, cam.z || 1);
  }
  function haulReadyToSurface() {
    if (bagIsFull()) return true;
    if (state.didFirstStock || (state.divesThisSession | 0) > 1) return true;
    const n = state.bag.length | 0;
    return n === 0 || n >= 3;
  }
  function canSurfaceNow() {
    return state.scene === "ocean" && (bagIsFull() || (nearSurface() && haulReadyToSurface()));
  }
  function coneRange() { return 200 + state.catchLv * 8 + tutorialGrace() * 70; }
  function coneHalf() { return 0.85 + tutorialGrace() * 0.42; }
  function scoopStayR(f) {
    const base = (f && f.verb) ? coneRange() * 1.35 : coneRange() * 1.2;
    return base + tutorialGrace() * 36 + scoopEdgeGrace();
  }
  function toast(msg, col, life, opts) {
    const t = { msg, col: col || "#fff6d2", life: life == null ? 2.2 : life };
    if (opts && typeof opts === "object") {
      t.big = !!opts.big;
      t.kind = opts.kind || "";
    }
    // Book / boat / VIP stay teasers until Tang — they must not steal the ribbon.
    if (!teasersAllowed() && (t.kind === "book" || t.kind === "boat" || t.kind === "vip")) return;
    // One channel: drop a duplicate of the line already showing or queued next.
    if (state.toasts.some((q) => q.msg === t.msg)) return;
    state.toasts.push(t);
  }
  function pop(x, y, text, col, life, scale) {
    pops.push({ x, y, text, col: col || "#ffe27a", life: life || 1, vy: -42, scale: scale || 1 });
  }
  function hudPop(text, col, x, y, life) {
    const scr = (x != null && y != null) ? worldToScreen(x, y) : { x: W / 2, y: 168 };
    const minX = (missionVisible() || sessionChipVisible()) ? 280 : 210;
    const minY = 92;
    const aim = text === "STREAK!" || text === "almost!";
    let sx = scr.x, sy = scr.y;
    if (aim && x != null) {
      const side = scr.x < W * 0.58 ? 1 : -1;
      sx = scr.x + side * 132;
      sy = Math.min(scr.y - 36, H * 0.26);
    }
    hudPops.push({
      text, col: col || "#ffe27a",
      x: clamp(sx, minX, W - 210),
      y: clamp(sy, minY, H - 150),
      life: life == null ? 2.4 : life,
      max: life == null ? 2.4 : life,
      small: aim,
    });
  }
  function hudBox(x, y, w, h, pad) {
    const p = pad == null ? 10 : pad;
    return {
      x: clamp(x, p, W - p - w),
      y: clamp(y, p, H - p - h),
      w, h,
    };
  }
  function nope(opts) {
    const o = opts || {};
    sfx("no");
    state.nopeFlash = 0.28;
    if (o.tank >= 0) {
      state.tankShake = { i: o.tank, t: 0.55 };
      state.priceFlash = { tank: o.tank, t: 0.48 };
    }
    if (o.card) {
      state.cardShake = { id: o.card, t: 0.55 };
      state.priceFlash = { id: o.card, t: 0.48 };
    }
    if (o.x != null && o.y != null) pop(o.x, o.y, o.msg || "Not yet", "#ff6a5a", 1.05, 1.15);
  }
  function playSale(who, speciesName, pay, wx, wy, first, line) {
    pop(wx, wy - 10, "+$" + pay, "#ffe27a", first ? 2.2 : 1.9, first ? 2.55 : 2.15);
    if (who && REGULAR_LOOKS[who]) {
      pop(wx, wy - 42, who, "#fff6e8", 1.35, 1.05);
    }
    const bark = line && isGoldTalk(line) ? line : "";
    if (bark) spawnSaleTalk(who, bark, wx, wy);
    state.registerPunch = first ? 1.48 : 1.36;
  }
  function spawnSaleTalk(who, line, wx, wy) {
    const tint = REGULAR_TINTS[who] || { fill: "rgba(40, 28, 10, 0.94)", ink: "#ffe27a", stroke: "#e8c04a" };
    // Queue only. drawSaleTalks must call drawSpeech — never paint a second full bubble.
    if (saleTalks.length >= 3) return;
    saleTalks.push({ who: who || "", line, wx, wy, life: 2.75, max: 2.75, tint });
  }
  function salePayParts(c, rareSale) {
    const price = SPECIES[c.carry].price;
    const stockBonus = 1 + Math.min(0.35, (state.stock[c.carry] || 0) * 0.03);
    const bagBonus = state.bagBonus || 1;
    const payMult = c.payMult || 1;
    const rare2 = rareSale ? 2 : 1;
    const pay = Math.round(price * stockBonus * bagBonus * payMult * rare2);
    return { price, stockBonus, bagBonus, payMult, rare2, pay, name: SPECIES[c.carry].name };
  }
  function addTillLine(parts) {
    if (!state.tillSlip) state.tillSlip = { items: [], extra: 0, total: 0 };
    const slip = state.tillSlip;
    let row = null;
    for (let i = 0; i < slip.items.length; i++) {
      if (slip.items[i].name === parts.name && slip.items[i].price === parts.price) { row = slip.items[i]; break; }
    }
    if (!row) {
      row = { n: 0, name: parts.name, price: parts.price };
      slip.items.push(row);
    }
    row.n++;
    slip.extra += parts.pay - parts.price;
    slip.total += parts.pay;
  }
  function playTankSale(i, who) {
    const t = TANK_POS[i];
    if (!t) return;
    const tx = t.x + TANK_W / 2, ty = t.y + TANK_H * 0.42;
    const tint = REGULAR_TINTS[who] || null;
    state.tankFlash = { i, life: 0.46, max: 0.46, tint };
    for (const f of tankFish[i]) f.dip = 0.55;
    tankRipples.push({ i, x: tx + rand(-10, 10), y: ty + rand(-6, 6), life: 0.42, max: 0.42 });
    tankReceipts.push({
      x: tx + 18, y: t.y + 18, life: 0.95, max: 0.95,
      who: who || "", tint,
    });
    pop(tx - 8, t.y + 8, "sold", tint ? tint.ink : "#fff6e8", 0.85, 1.05);
    spawnP(tx, ty, 8, tint ? [tint.stroke, "#ffe27a", "#fff"] : ["#ffe27a", "#fff6e8", "#9ef0ff"], 54);
    sfx("receipt");
  }
  function expeditionUnlocked() { return !!state.unlocked[1] || (state.peakMoney | 0) >= 60; }
  function nearBoat() {
    return state.scene === "shop" && Math.hypot(player.x - BOAT.x, player.y - BOAT.y) < 78;
  }
  function boughtAnUpgrade() {
    return (state.speedLv | 0) > 0 || (state.bagLv | 0) > 0 || (state.catchLv | 0) > 0 || !!state.hiredCashier;
  }
  function shopBarsReady() {
    return state.scene === "shop" && !inDiveZone() && (state.tutorial >= 5 || state.money >= 25);
  }
  function diveActionLegal() {
    return state.mode === "play" && state.scene === "shop" && (inDiveZone() || nearDivePad()) && state.surfaceLock <= 0 && !bagHasStockable() && !cashNeedsCollect();
  }
  function surfaceActionLegal() {
    return state.mode === "play" && canSurfaceNow();
  }
  function actionPromptVisible() {
    return diveActionLegal() || surfaceActionLegal();
  }
  function actionBtnSize() {
    const compact = compactHud();
    return {
      w: compact ? thumbCanvas(168, 300, 540) : 340,
      h: compact ? thumbCanvas(58, 64, 150) : 52,
      pad: compact ? 22 : 18,
    };
  }
  function actionBtnBox() {
    const compact = compactHud();
    const sz = actionBtnSize();
    const w = sz.w, h = sz.h;
    let x = W / 2 - w / 2;
    let y = H - sz.pad - h;
    if (compact && state.scene === "shop" && shopBarsReady()) {
      x = clamp(W - 18 - w, 16, W - 18 - w);
    }
    return dodgeUpgradeTray(hudBox(x, y, w, h));
  }
  function upgradeBarBox() {
    const compact = compactHud();
    const cw = compact ? thumbCanvas(136, 156, 220) : 160;
    const ch = compact ? thumbCanvas(50, 64, 96) : 66;
    const w = compact ? cw * 2 + 24 : 688;
    const h = compact ? ch * 2 + 24 : 82;
    const x = 16;
    const y = H - (compact ? 22 : 18) - h;
    return Object.assign(hudBox(x, y, w, h), { cw, ch, compact });
  }
  function upgradeTrayFootprint() {
    const bar = upgradeBarBox();
    const extra = decorHudReady() ? (compactHud() ? thumbCanvas(72, 100, 140) : 118) + 8 : 0;
    return { x: bar.x, y: bar.y, w: bar.w + extra, h: bar.h };
  }
  function dodgeUpgradeTray(box) {
    if (!box || !shopBarsReady()) return box;
    const tray = upgradeTrayFootprint();
    if (!boxesOverlap(box, tray, 8)) return box;
    const rightX = tray.x + tray.w + 10;
    if (rightX + box.w <= W - 10) return hudBox(rightX, box.y, box.w, box.h);
    const upY = tray.y - 10 - box.h;
    if (upY >= topHudFloor()) return hudBox(box.x, upY, box.w, box.h);
    const leftX = tray.x - 10 - box.w;
    if (leftX >= 10) return hudBox(leftX, box.y, box.w, box.h);
    return box;
  }
  function decorHudReady() {
    return shopBarsReady() && (boughtAnUpgrade() || !!state.unlocked[1]);
  }
  function highestUnlocked() {
    return highestUnlockedSafe();
  }
  function nextLockedTank() {
    return nextLockedSafe();
  }
  function inReefZone(x, y) { return y > REEF_Y || x > REEF_X; }
  function nextGoal() {
    const opts = [];
    if (state.speedLv < SPEED_COST.length) opts.push({ name: "Speed", cost: SPEED_COST[state.speedLv] });
    if (state.bagLv < BAG_COST.length) opts.push({ name: "Bag", cost: BAG_COST[state.bagLv] });
    if (state.catchLv < CATCH_COST.length) opts.push({ name: "Catch", cost: CATCH_COST[state.catchLv] });
    const nl = nextLockedTank();
    if (nl >= 0) opts.push({ name: SPECIES[nl].name, cost: SPECIES[nl].unlock });
    if (!state.hiredCashier) opts.push({ name: "Cashier", cost: CASHIER_COST });
    opts.sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
    return opts[0] || null;
  }
  function firstAffordableUp() {
    const items = [
      { id: "speed", cost: state.speedLv < SPEED_COST.length ? SPEED_COST[state.speedLv] : 1e9, maxed: state.speedLv >= SPEED_COST.length },
      { id: "bag", cost: state.bagLv < BAG_COST.length ? BAG_COST[state.bagLv] : 1e9, maxed: state.bagLv >= BAG_COST.length },
      { id: "catch", cost: state.catchLv < CATCH_COST.length ? CATCH_COST[state.catchLv] : 1e9, maxed: state.catchLv >= CATCH_COST.length },
      { id: "cashier", cost: state.hiredCashier ? 1e9 : CASHIER_COST, maxed: state.hiredCashier },
    ];
    let best = null;
    for (const it of items) {
      if (it.maxed || state.money < it.cost) continue;
      if (!best || it.cost < best.cost) best = it;
    }
    return best;
  }
  function triggerFlash() {
    state.flash = 0.16;
  }
  function missionVisible() {
    return !state.missionDone && state.mode === "play";
  }
  function advanceMission() {
    if (state.missionDone) return;
    let step = state.missionStep | 0;
    if (step < 1 && (state.scene === "ocean" || state.pendingScene === "ocean" || (state.tutorial | 0) >= 1)) step = 1;
    if (step < 2 && ((state.caughtCount && state.caughtCount[0]) | 0) >= 5) step = 2;
    if (step !== (state.missionStep | 0)) { state.missionStep = step; persist(); }
    if (step >= 2 && (state.money | 0) >= 60 && (state.tutorial | 0) >= 4) {
      state.missionDone = true;
      state.money += 10;
      state.moneyRollFrom = state.displayMoney;
      state.moneyRollTo = state.money;
      state.moneyRollT = 0.35;
      state.moneyPunch = 1.28;
      state.bagPunch = 1.32;
      toast("Session complete! +$10", "#ffe27a");
      persist();
      rollSessionGoals();
    }
  }
  function sessionChipVisible() {
    return !!state.missionDone && state.mode === "play" && (state.sessionGoals || []).length > 0;
  }
  function sessionGoalLabel(id) {
    if (id === "tang") return "Unlock Blue Tang";
    if (id === "shiny") return "Catch a shiny";
    if (id === "cashier") return "Hire the cashier";
    if (id === "serve") return "Serve 3 customers  " + Math.min(3, state.sessionSales | 0) + "/3";
    if (id === "speed") return "Buy Speed";
    if (id === "boat") return "Take the boat";
    if (id === "reef") return "Visit the reef";
    if (id === "catch6") return "Catch 6 fish  " + Math.min(6, state.sessionDiveCatch | 0) + "/6";
    if (id === "deep") return "Dive a new zone";
    if (id === "unlock") {
      const n = nextLockedTank();
      return n >= 0 ? "Unlock " + SPECIES[n].name : "Unlock a new friend";
    }
    if (id && id.indexOf("stock-") === 0) {
      const s = id.slice(6) | 0;
      return "Stock " + (SPECIES[s] ? SPECIES[s].name : "a tank");
    }
    return id;
  }
  function sessionGoalMet(id) {
    if (id === "tang") return !!state.unlocked[1];
    if (id === "shiny") return !!state.sessionCaughtRare;
    if (id === "cashier") return !!state.hiredCashier;
    if (id === "serve") return (state.sessionSales | 0) >= 3;
    if (id === "speed") return (state.speedLv | 0) > 0;
    if (id === "boat") return !!state.sessionBoat;
    if (id === "reef") return !!state.sawReef;
    if (id === "catch6") return (state.sessionDiveCatch | 0) >= 6;
    if (id === "deep") return (state.sessionSawDeep | 0) > (state.goalDeepAt | 0);
    if (id === "unlock") {
      const want = state.goalUnlockAt | 0;
      return highestUnlocked() > want || nextLockedTank() < 0;
    }
    if (id && id.indexOf("stock-") === 0) {
      const s = id.slice(6) | 0;
      return (state.sessionStocked === s);
    }
    return false;
  }
  function rollSessionGoals() {
    if (!state.missionDone) return;
    const pool = [];
    if (!state.unlocked[1]) pool.push("tang");
    if (!state.caughtRare) pool.push("shiny");
    else pool.push("shiny");
    if (!state.hiredCashier) pool.push("cashier");
    pool.push("serve");
    pool.push("catch6");
    if ((state.speedLv | 0) === 0) pool.push("speed");
    if (expeditionUnlocked()) pool.push("boat");
    if (state.unlocked[1] && !state.sawReef) pool.push("reef");
    if (state.unlocked[4]) pool.push("deep");
    const nl = nextLockedTank();
    if (nl >= 0) pool.push("unlock");
    const hi = highestUnlocked();
    if (state.unlocked[hi]) pool.push("stock-" + hi);
    const picked = [];
    const bag = pool.slice();
    while (picked.length < 3 && bag.length) {
      const i = (Math.random() * bag.length) | 0;
      const id = bag.splice(i, 1)[0];
      if (picked.indexOf(id) < 0) picked.push(id);
    }
    if (!picked.length) picked.push("serve", "catch6", "shiny");
    state.sessionGoals = picked.slice(0, 3);
    state.sessionGoalDone = [];
    state.sessionSales = 0;
    state.sessionCaughtRare = false;
    state.sessionBoat = false;
    state.sessionDiveCatch = 0;
    state.sessionStocked = -1;
    state.goalUnlockAt = highestUnlocked();
    state.goalDeepAt = state.sawDeepZone | 0;
    state.sessionSawDeep = state.sawDeepZone | 0;
    persist();
  }
  function grantSessionBonus(id) {
    state.money += SESSION_GOAL_BONUS;
    state.moneyRollFrom = state.displayMoney;
    state.moneyRollTo = state.money;
    state.moneyRollT = 0.35;
    state.moneyPunch = 1.22;
    const nice = sessionGoalLabel(id).replace(/\s+\d+\/\d+$/, "");
    toast("Goal! +$" + SESSION_GOAL_BONUS + "  ·  " + nice, "#ffe27a", 2.8);
    persist();
  }
  function checkSessionGoals() {
    if (!state.missionDone) return;
    if (!(state.sessionGoals || []).length) rollSessionGoals();
    if (!state.sessionGoalDone) state.sessionGoalDone = [];
    for (const id of state.sessionGoals) {
      if (state.sessionGoalDone.indexOf(id) >= 0) continue;
      if (!sessionGoalMet(id)) continue;
      state.sessionGoalDone.push(id);
      grantSessionBonus(id);
    }
    if (state.sessionGoals.length && state.sessionGoalDone.length >= state.sessionGoals.length) {
      state.sessionDay = (state.sessionDay | 0) + 1;
      toast("New day! Fresh TODAY goals", "#9ef0ff", 2.6);
      rollSessionGoals();
    }
  }
  function spawnP(x, y, n, cols, spread) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = rand(20, spread || 90);
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: rand(0.35, 0.8), r: rand(2, 5), col: pick(cols) });
    }
  }
  function beatMoment(kind, x, y) {
    const specs = {
      catch: { stop: 0.12, punch: 0.16, n: 22, cols: ["#fff6e8", "#ffe27a", "#9ef0ff"], spread: 180, sfx: "catch" },
      shiny: { stop: 0.13, punch: 0.22, n: 34, cols: ["#ffd24a", "#fff6e8", "#ffe27a"], spread: 270, sfx: "shiny" },
      sale: { stop: 0.04, punch: 0.027, n: 14, cols: ["#ffe27a", "#ffd24a", "#fff6e8"], spread: 110, sfx: "sale" },
      firstsale: { stop: 0.08, punch: 0.066, n: 32, cols: ["#ffe27a", "#ffd24a", "#fff"], spread: 210, sfx: "firstsale" },
      cashin: { stop: 0.05, punch: 0.048, n: 24, cols: ["#ffe27a", "#ffd24a", "#fff6e8"], spread: 150, sfx: "cashin" },
      tang: { stop: 0.15, punch: 0.24, n: 38, cols: ["#2f7dff", "#ffe14a", "#fff6e8"], spread: 230, sfx: "tang" },
    };
    const s = specs[kind] || specs.catch;
    state.hitStop = Math.max(state.hitStop || 0, s.stop);
    state.freezeFrame = Math.max(state.freezeFrame || 0, s.stop + 0.04);
    state.camPunch = Math.max(state.camPunch || 0, s.punch);
    if (kind === "firstsale" || kind === "sale" || kind === "cashin") {
      holdTillView(kind === "cashin" ? 1.8 : 1.45);
    }
    if (x != null && y != null) spawnP(x, y, s.n, s.cols, s.spread);
    sfx(s.sfx);
  }
  function rebuildTankFish() {
    while (tankFish.length < SPECIES.length) tankFish.push([]);
    for (let i = 0; i < SPECIES.length; i++) {
      tankFish[i].length = 0;
      const n = Math.min(state.stock[i], 10);
      for (let k = 0; k < n; k++) {
        tankFish[i].push({ x: rand(20, TANK_W - 20), y: rand(30, TANK_H - 20), a: rand(0, Math.PI * 2), ph: rand(0, 20) });
      }
      if (state.unlocked[i] && n === 0) {
        tankFish[i].push({ x: rand(24, TANK_W - 24), y: rand(36, TANK_H - 18), a: rand(0, 6), ph: rand(0, 20), ceremonial: true });
      }
    }
  }
  function popSaleFish(i) {
    const wait = tankExitCount(i) * 0.28;
    const arr = tankFish[i];
    for (let k = arr.length - 1; k >= 0; k--) {
      if (arr[k].ceremonial || arr[k].exiting) continue;
      const f = arr[k];
      arr.splice(k, 1);
      tankExits.push({
        i, s: i, x: f.x, y: f.y, ph: f.ph || 0,
        life: 0.62, max: 0.62, wait,
      });
      return;
    }
    tankExits.push({
      i, s: i, x: rand(40, TANK_W - 40), y: rand(40, TANK_H - 30), ph: rand(0, 8),
      life: 0.62, max: 0.62, wait,
    });
  }
  function tankExitCount(i) {
    let n = 0;
    for (const e of tankExits) if (e.i === i) n++;
    return n;
  }
  function tankBadge(i) {
    return (state.stock[i] | 0) + tankExitCount(i);
  }
  function pickBrowseTank(exclude) {
    const buyers = new Set();
    for (const c of customers) if (c.state === "tank") buyers.add(c.tank);
    const free = [], all = [];
    for (let k = 0; k < SPECIES.length; k++) {
      if (!state.unlocked[k] || k === exclude) continue;
      all.push(k);
      if (!buyers.has(k)) free.push(k);
    }
    if (free.length) return pick(free);
    if (all.length) return pick(all);
    return exclude >= 0 ? exclude : 0;
  }
  function tankQueueOffX(tank, self) {
    let n = 0;
    for (const c of customers) if (c !== self && c.state === "tank" && c.tank === tank) n++;
    return n === 0 ? 0 : (n % 2 ? -28 : 28);
  }
  function talkVisible(c) {
    if (!c || !c.emote) return false;
    const label = String(c.emote);
    if ((state.surfaceQuiet || 0) > 0 && !isGoldTalk(label) && !/tang/i.test(label)) return false;
    return true;
  }
  function talkSort(a, b) {
    const an = String(a.name || a.who || a.line || "");
    const bn = String(b.name || b.who || b.line || "");
    if (an !== bn) return an < bn ? -1 : 1;
    const ax = a.x != null ? a.x : (a.wx || 0);
    const bx = b.x != null ? b.x : (b.wx || 0);
    if (ax !== bx) return ax - bx;
    const ay = a.y != null ? a.y : (a.wy || 0);
    const by = b.y != null ? b.y : (b.wy || 0);
    return ay - by;
  }
  // Entire canvas: at most one full speech bubble. Clusters returning self
  // (C26 / C29 / C30) let every walker draw beside saleTalks.
  // C31 compared speechFocus() === who on every head. Greetings (hey!/hi!)
  // and VIP/tang (Blue Tang?/VIP) are customer objects, so that usually
  // picked one — but nothing latched the winner. A later head that lost
  // the === test had no second chance, yet a later speechFocus() call
  // could return a *different* object (saleTalks vs walker, or the
  // talker list shifting) and fire a second full(). Cache once per frame
  // and refuse a second full().
  let speechWinner = null;
  let speechDrew = false;
  function speechFocus() {
    if (saleTalks[0]) return saleTalks[0];
    const talkers = [];
    for (const c of customers) if (talkVisible(c)) talkers.push(c);
    if (!talkers.length) return null;
    talkers.sort(talkSort);
    return talkers[Math.floor(state.time / 1.65) % talkers.length];
  }
  function beginSpeechFrame() {
    speechWinner = speechFocus();
    speechDrew = false;
  }
  // THE gate. Greeting / VIP / sale / till emote all call this.
  // Winner draws the one full bubble; everyone else is a pearl or is not spawned.
  function drawSpeech(who, full, pearl) {
    if (!who) return false;
    if (!speechDrew && who === speechWinner) {
      speechDrew = true;
      if (full) full();
      return true;
    }
    if (pearl) pearl();
    return false;
  }
  function unusedName() {
    const used = new Set(customers.map((c) => c.name));
    for (const n of Object.keys(REGULAR_LOOKS)) used.add(n);
    const pool = CUST_NAMES.filter((n) => !used.has(n));
    return pick(pool.length ? pool : CUST_NAMES.filter((n) => !REGULAR_LOOKS[n]));
  }
  function newCustomer(extra) {
    const c = Object.assign({
      x: rand(700, 1060), y: 1040, vx: 0, vy: 0,
      shirt: pick(SHIRTS), hair: pick(["#3a2415", "#1b1b1b", "#8a4a1a", "#d8c07a"]),
      skin: pick(["#f0c2a0", "#d0a07a", "#8d5a3a", "#f3d3b4"]),
      state: "tank", tank: 0, carry: -1, bob: rand(0, 8), wait: 0,
      emote: "", emoteOff: ((customers.length % 5) - 2) * 11,
      hat: Math.random() < 0.33, hairCut: (Math.random() * 3) | 0, offX: 0,
      name: unusedName(),
    }, extra);
    if (c.regular) applyRegularLook(c);
    return c;
  }
  function seedLivingPier() {
    if (customers.length > 0) return;
    customers.push(newCustomer({
      x: 880, y: 1100, state: "browse", tank: 0, hops: 10, offX: 0,
      name: "Maya", regular: true, favorite: 0, emote: "hi!",
    }));
    customers.push(newCustomer({
      x: 760, y: 1068, state: "browse", tank: 0, hops: 4, offX: -24,
      name: "Nico", regular: true, favorite: 0, emote: "hey!",
    }));
    customers.push(newCustomer({
      x: 980, y: 1084, state: "browse", tank: 1, hops: 5, offX: 20,
      name: "Jun", regular: true, favorite: 0, emote: "Blue Tang?", teaseTang: true,
    }));
  }
  function seedDockTeasers() {
    if (dockTeasers.length) return;
    dockTeasers.push({ s: 1, x: -50, y: 1148, vx: 40, ph: 0.4 });
    dockTeasers.push({ s: 1, x: 520, y: 1204, vx: 32, ph: 2.1 });
  }
  function seedPierLife() {
    if (pierLife.seeded) return;
    pierLife.seeded = true;
    pierLife.gull = {
      x: 780, y: 988, perchX: 780, perchY: 988,
      mode: "perch", t: 0, facing: -1, hop: 0,
    };
    pierLife.gull2 = {
      x: 1496, y: 798, perchX: 1496, perchY: 798,
      mode: "perch", t: 1.1, facing: 1, hop: 0,
    };
    pierLife.skiff = { x: 1092, y: 1196, ph: 1.2 };
    state.pierChirp = 1.6;
  }
  function updateOneGull(g, dt, lo, hi, glideY) {
    if (!g) return;
    g.t += dt;
    if (g.mode === "perch") {
      g.x = g.perchX;
      g.y = g.perchY + Math.sin(state.time * 2.2 + (g.t || 0)) * 1.2;
      if (g.t > 3.4) {
        g.mode = Math.random() < 0.55 ? "hop" : "glide";
        g.t = 0;
        g.hop = 0;
      }
    } else if (g.mode === "hop") {
      g.hop += dt;
      const u = clamp(g.hop / 0.42, 0, 1);
      g.x = g.perchX + g.facing * 18 * u;
      g.y = g.perchY - Math.sin(u * Math.PI) * 14;
      if (u >= 1) {
        g.perchX = clamp(g.x, lo, hi);
        g.facing *= -1;
        g.mode = "perch";
        g.t = 0;
      }
    } else {
      g.x += g.facing * 46 * dt;
      g.y = glideY + Math.sin(state.time * 3.1) * 8;
      if (g.t > 1.8 || g.x < lo - 40 || g.x > hi + 40) {
        g.facing *= -1;
        g.mode = "perch";
        g.t = 0;
        g.x = g.perchX;
        g.y = g.perchY;
      }
    }
  }
  function updatePierLife(dt) {
    if (state.scene !== "shop") return;
    seedPierLife();
    updateOneGull(pierLife.gull, dt, 660, 1020, 970);
    updateOneGull(pierLife.gull2, dt, 1380, 1580, 780);
    state.pierChirp -= dt;
    if (state.pierChirp <= 0 && state.mode === "play") {
      state.pierChirp = rand(5.5, 9.5);
      if (Math.random() < 0.55) sfx("gull");
      else sfx("lap");
    }
  }
  function drawGull(g) {
    if (!g) return;
    const flap = g.mode === "glide" ? Math.sin(state.time * 14) * 0.55 : 0.12;
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.scale(g.facing, 1);
    ctx.fillStyle = "rgba(8, 20, 28, 0.22)";
    ctx.beginPath(); ctx.ellipse(0, 10, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f4efe6";
    ctx.beginPath(); ctx.ellipse(0, 0, 7.5, 4.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7, -2, 3.4, 2.6, 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e8c04a";
    ctx.beginPath();
    ctx.moveTo(10, -2); ctx.lineTo(15, -1); ctx.lineTo(10, 0.6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#2a1a12";
    ctx.beginPath(); ctx.arc(8.2, -2.6, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#f4efe6";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-2, -1);
    ctx.quadraticCurveTo(-12, -10 - flap * 10, -18, -2 + flap * 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-1, 1);
    ctx.quadraticCurveTo(-10, 8 + flap * 4, -16, 3);
    ctx.stroke();
    ctx.strokeStyle = "#e8c04a";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-1, 4); ctx.lineTo(-2, 9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, 4); ctx.lineTo(3, 9); ctx.stroke();
    ctx.restore();
  }
  function drawSkiff(s) {
    if (!s) return;
    const bob = Math.sin(state.time * 1.15 + s.ph) * 3.2;
    ctx.save();
    ctx.translate(s.x, s.y + bob);
    ctx.fillStyle = "rgba(8, 28, 40, 0.28)";
    ctx.beginPath(); ctx.ellipse(2, 12, 34, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6b3a22";
    ctx.beginPath();
    ctx.moveTo(-32, 2);
    ctx.quadraticCurveTo(-28, 12, -4, 13);
    ctx.lineTo(22, 12);
    ctx.quadraticCurveTo(36, 8, 32, 1);
    ctx.lineTo(24, -5);
    ctx.quadraticCurveTo(0, -9, -22, -4);
    ctx.quadraticCurveTo(-34, 0, -32, 2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#3a1e10"; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.fillStyle = "#d8c07a";
    ctx.fillRect(-4, -18, 2, 16);
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath(); ctx.moveTo(-2, -18); ctx.lineTo(10, -12); ctx.lineTo(-2, -8); ctx.fill();
    ctx.restore();
  }
  function drawMopBucket(x, y) {
    ctx.fillStyle = "rgba(20, 16, 10, 0.2)";
    ctx.beginPath(); ctx.ellipse(x, y + 16, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3d6f7a";
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.lineTo(x + 8, y + 14);
    ctx.lineTo(x - 8, y + 14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#2a7d8a";
    ctx.beginPath(); ctx.ellipse(x, y, 10.5, 3.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(180, 230, 240, 0.45)";
    ctx.beginPath(); ctx.ellipse(x, y + 1, 7, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#8a5a30"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x + 2, y + 2); ctx.lineTo(x + 16, y - 22); ctx.stroke();
    ctx.fillStyle = "#c8b090";
    ctx.beginPath(); ctx.ellipse(x + 17, y - 24, 6, 4, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#9a8060"; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 14 + i, y - 22);
      ctx.lineTo(x + 12 + i * 2, y - 16);
      ctx.stroke();
    }
  }
  function drawHangingSign(x, y) {
    const sway = Math.sin(state.time * 1.4) * 0.08;
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(x - 4, y - 40, 8, 52);
    ctx.fillStyle = "#8a5a30";
    ctx.fillRect(x - 4, y - 40, 3, 52);
    ctx.strokeStyle = "#4a2a14"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 16, y - 36); ctx.lineTo(x - 12, y - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 16, y - 36); ctx.lineTo(x + 12, y - 8); ctx.stroke();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sway);
    ctx.fillStyle = "#6b3a18";
    roundRect(-28, -8, 56, 28, 4); ctx.fill();
    ctx.strokeStyle = "#e8c04a"; ctx.lineWidth = 2;
    roundRect(-25, -5, 50, 22, 3); ctx.stroke();
    ctx.fillStyle = "#fff6e8";
    ctx.font = "800 11px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("OPEN", 0, 10);
    ctx.restore();
  }
  function spawnAisleCrossing() {
    if (customers.length >= MAX_CUSTOMERS) return;
    for (const c of customers) if (c.state === "cross") return;
    customers.push(newCustomer({
      x: 220, y: 508, state: "cross", destX: 1540, destY: 548,
      kid: true, cart: true, emote: "",
    }));
  }

  // ===== INPUT =====
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase());
    if (e.key === "Escape") {
      if (state.bookOpen != null) state.bookOpen = null;
      else if (state.mode === "play") state.mode = "pause";
      else if (state.mode === "pause" || state.mode === "help") state.mode = "play";
    }
    if (e.key === " " || e.code === "Space" || e.key === "Enter") {
      // Full bag + Space/Enter always surfaces, even with a walk target.
      if (state.mode === "play" && state.scene === "ocean" && bagIsFull() && !state.fadeDir) {
        player.goto = null;
        beginSurface();
      } else {
        tryAction({ fromKey: true });
      }
    }
    audio();
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
  function canvasPos(ev) {
    const r = canvas.getBoundingClientRect();
    const rw = r.width || 1, rh = r.height || 1;
    return { x: (ev.clientX - r.left) * (W / rw), y: (ev.clientY - r.top) * (H / rh) };
  }
  canvas.addEventListener("pointerdown", (e) => {
    if (e.cancelable) e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    const p = canvasPos(e);
    mouse.x = p.x; mouse.y = p.y; mouse.down = true; mouse.ui = false;
    mouse.held = 0; mouse.acted = false; mouse.pressX = p.x; mouse.pressY = p.y;
    audio();
    const hit = hitUI(p.x, p.y);
    if (hit) {
      if (hit === "surface" && state.mode === "play" && state.scene === "ocean" && !bagIsFull() && !state.fadeDir) {
        const sb = actionBtnBox();
        const onBar = p.x >= sb.x && p.x <= sb.x + sb.w && p.y >= sb.y && p.y <= sb.y + sb.h;
        if (!onBar) {
          const w = screenToWorld(p.x, p.y);
          const f = fishAtWorld(w.x, w.y) || nearestScoopFish();
          if (f && startScoopOnFish(f)) { mouse.acted = true; mouse.scoopPress = true; return; }
          if (scoopBlocksSurface() || scoopHoldActive()) return;
        }
      }
      mouse.ui = true; mouse.acted = true; onUI(hit); return;
    }
    if (state.mode === "play") {
      const touch = e.pointerType === "touch";
      if (state.scene === "shop") {
        const w = screenToWorld(p.x, p.y);
        if (tryClickShop(w.x, w.y)) { mouse.acted = true; return; }
      }
      if (state.scene === "ocean" && bagIsFull() && !state.fadeDir) {
        if (!touch) { mouse.acted = true; player.goto = null; beginSurface(); return; }
      } else if (state.scene === "ocean" && !state.fadeDir && !bagIsFull()) {
        const w = screenToWorld(p.x, p.y);
        const f = fishAtWorld(w.x, w.y);
        if (f && startScoopOnFish(f)) { mouse.acted = true; mouse.scoopPress = true; return; }
      }
      if (tryAction({ fromTouch: touch })) {
        mouse.acted = true; player.goto = null; return;
      }
    }
  });
  canvas.addEventListener("pointermove", (e) => { const p = canvasPos(e); mouse.x = p.x; mouse.y = p.y; });
  canvas.addEventListener("pointerup", (e) => {
    if (mouse.scoopPress && mouse.held < 0.22 && player.scoopLock) player.scoopTap = true;
    if (state.mode === "play" && !mouse.ui && !mouse.acted && mouse.held < 0.22) {
      const touch = e && e.pointerType === "touch";
      if (mouse.scoopPress || player.scoopLock) {
        // Scoop tap / hold — do not turn the release into a swim dash.
      } else if (!(state.scene === "ocean" && bagIsFull() && !touch)) {
        const w = screenToWorld(mouse.pressX, mouse.pressY);
        player.scoopTap = false;
        player.scoopLock = null;
        if (state.scene === "shop") {
          const tankHit = tankAtWorld(w.x, w.y);
          if (tankHit >= 0 && state.unlocked[tankHit] && bagCanStock(tankHit)) {
            intentWalk("stock", tankWalkPoint(tankHit), tankHit);
          } else {
            player.goto = clickWalkTarget(w.x, w.y);
          }
        } else {
          player.goto = clickWalkTarget(w.x, w.y);
        }
      }
    }
    mouse.down = false; mouse.ui = false; mouse.held = 0; mouse.acted = false; mouse.scoopPress = false;
  });
  canvas.addEventListener("pointercancel", () => { mouse.down = false; mouse.ui = false; mouse.held = 0; mouse.scoopPress = false; });
  canvas.addEventListener("pointerleave", () => { mouse.down = false; mouse.held = 0; });
  window.addEventListener("touchmove", (e) => {
    if (e.target === canvas && e.cancelable) e.preventDefault();
  }, { passive: false });
  window.addEventListener("gesturestart", (e) => { e.preventDefault(); }, { passive: false });
  window.addEventListener("resize", layoutStage);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", layoutStage);
    window.visualViewport.addEventListener("scroll", layoutStage);
  }
  function tankAtWorld(wx, wy) {
    for (let i = 0; i < SPECIES.length; i++) {
      if (!tankLive(i)) continue;
      const t = TANK_POS[i];
      if (wx > t.x - 8 && wx < t.x + TANK_W + 8 && wy > t.y - 8 && wy < t.y + TANK_H + 28) return i;
    }
    return -1;
  }
  function clickWalkTarget(wx, wy) {
    if (state.scene === "shop") {
      const tankHit = tankAtWorld(wx, wy);
      if (tankHit >= 0) {
        if (!state.unlocked[tankHit]) {
          const t = TANK_POS[tankHit];
          const ready = tankHit === nextLockedTank();
          const can = ready && state.money >= SPECIES[tankHit].unlock;
          if (!can) {
            nope({
              tank: tankHit,
              x: t.x + TANK_W / 2,
              y: t.y + 36,
              msg: !ready ? "Soon" : "$" + SPECIES[tankHit].unlock,
            });
          }
        }
        return tankWalkPoint(tankHit);
      }
      const inDock = wx > DIVE_ZONE.x - 10 && wx < DIVE_ZONE.x + DIVE_ZONE.w + 10 &&
          wy > DIVE_ZONE.y - 12 && wy < DIVE_ZONE.y + DIVE_ZONE.h + 20;
      if (inDock) {
        // With fish in the bag, dock clicks must walk to the tanks — not snap-dive.
        if (bagHasStockable()) {
          return stockableTankTarget() || tankWalkPoint(0);
        }
        if (cashNeedsCollect()) return registerWalkPoint();
        return { x: 880, y: 1008 };
      }
    }
    if (state.scene === "ocean" && wy < player.y - 16) {
      return { x: wx, y: Math.max(120, Math.min(wy, player.y) - 140) };
    }
    return { x: wx, y: wy };
  }
  function hitUI(x, y) {
    for (let i = uiHits.length - 1; i >= 0; i--) {
      const b = uiHits[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
    }
    return null;
  }
  function btn(id, x, y, w, h) { uiHits.push({ id, x, y, w, h }); }
  function onUI(id) {
    sfx("click");
    if (id === "decor-toggle") { state.decorOpen = !state.decorOpen; return; }
    if (!String(id).startsWith("decor-")) state.decorOpen = false;
    if (String(id).startsWith("skin-")) {
      state.skin = normalizeSkin(String(id).slice(5));
      if (state.hasSave) persist();
      return;
    }
    if (id === "play") {
      if (state.hasSave && state.mode === "title") resetSave();
      startPlay();
      persist();
      return;
    }
    if (id === "continue") { startPlay(); return; }
    if (id === "pause") { state.mode = "pause"; return; }
    if (id === "resume") { state.mode = "play"; return; }
    if (id === "help") { state.mode = "help"; return; }
    if (id === "back") { state.mode = "pause"; return; }
    if (id === "reset") { resetSave(); return; }
    if (id === "mute") { state.muted = !state.muted; persist(); return; }
    if (id === "till") { intentWalk("cash", registerWalkPoint()); return; }
    if (id === "up-speed") buySpeed();
    if (id === "up-bag") buyBag();
    if (id === "up-catch") buyCatch();
    if (id === "up-cashier") buyCashier();
    if (id.startsWith("decor-")) buyDecor(+id.split("-")[1]);
    if (id.startsWith("unlock-")) {
      const i = +id.split("-")[1];
      const t = TANK_POS[i];
      const ready = i === nextLockedTank();
      const can = ready && state.money >= SPECIES[i].unlock;
      if (!can) {
        nope({
          tank: i,
          x: t.x + TANK_W / 2,
          y: t.y + 36,
          msg: !ready ? "Soon" : "$" + SPECIES[i].unlock,
        });
      }
      intentWalk("unlock", tankWalkPoint(i), i);
      return;
    }
    if (id === "book-dismiss" || id === "book-close") { state.bookOpen = null; return; }
    if (id === "book-panel") return;
    if (id === "goto-dock") {
      if (state.mode === "play" && state.scene === "shop") walkToDock();
      return;
    }
    if (id === "goto-stock") {
      if (state.mode === "play" && state.scene === "shop" && bagHasStockable()) {
        const dest = stockableTankTarget() || tankWalkPoint(Math.max(0, glowingStockIndex()));
        intentWalk("stock", dest, Math.max(0, glowingStockIndex()));
      }
      return;
    }
    if (id.startsWith("book-")) {
      const n = +id.split("-")[1];
      if (n >= 0 && n < SPECIES.length) {
        if (!state.unlocked[n]) {
          const t = TANK_POS[n];
          const ready = n === nextLockedTank();
          const can = ready && state.money >= SPECIES[n].unlock;
          if (!can) {
            nope({
              tank: n,
              x: t.x + TANK_W / 2,
              y: t.y + 36,
              msg: !ready ? "Soon" : "$" + SPECIES[n].unlock,
            });
          }
          intentWalk("unlock", tankWalkPoint(n), n);
          return;
        }
        state.bookOpen = n;
        if (!state.bookOpened) { state.bookOpened = true; }
        state.sawBookTease = true;
        state.pendingBookTease = false;
        state.bookTeaseWait = 0;
        persist();
      }
    }
    if (id === "surface") {
      if (state.mode === "play") { player.goto = null; beginSurface(); }
      return;
    }
    if (id === "goto-till") {
      if (state.mode === "play" && state.scene === "shop" && cashNeedsCollect()) {
        intentWalk("cash", registerWalkPoint());
      }
      return;
    }
    if (id === "goto-surface") {
      if (state.mode === "play" && state.scene === "ocean" && !bagIsFull()) {
        player.goto = { x: player.x, y: 150 };
        player.pendingAct = null;
      }
      return;
    }
    if (id === "dive" || id === "dive-chip") {
      if (state.mode === "play" && (inDiveZone() || nearDivePad()) && state.surfaceLock <= 0 && !bagHasStockable() && !cashNeedsCollect()) beginDive();
      else if (state.mode === "play" && state.scene === "shop" && !bagHasStockable() && !cashNeedsCollect()) walkToDock();
      return;
    }
  }
  function startPlay() {
    if (oceanFish.length === 0) seedOcean();
    rebuildTankFish();
    state.mode = "play";
    state.decorOpen = false;
    if (state.scene !== "shop" && state.scene !== "ocean") state.scene = "shop";
    if (state.scene === "shop") {
      player.x = 880; player.y = 920;
      cam.x = 880; cam.y = 920; cam.z = 1; cam.rail = 28; cam.shopBand = null;
      state.camTillHold = 0;
      player.goto = null;
      if (state.tutorial === 0) state.didMove = false;
    }
    state.displayMoney = state.money;
    state.playClock = 0;
    seedDockTeasers();
    if (state.tutorial === 0 || state.stock.reduce((a, b) => a + b, 0) === 0) seedLivingPier();
    seedPierLife();
    if (!saleBarkDeck.length) shuffleSaleBarkDeck();
    if (state.missionDone) rollSessionGoals();
    ensureBaySchool();
    maybeBookTease();
  }
  function bagIsFull() {
    return state.bag.length >= bagMax();
  }
  function bagHasStockable() {
    return state.bag.some((s) => state.unlocked[s]);
  }
  function glowingStockIndex() {
    for (let i = 0; i < SPECIES.length; i++) {
      if (state.unlocked[i] && state.bag.some((s) => (s | 0) === i)) return i;
    }
    return -1;
  }
  function scoopTargetingFish() {
    if (state.scene !== "ocean") return false;
    const f = player.scoopLock || player.target;
    return !!(f && !f.caught && oceanFish.indexOf(f) >= 0);
  }
  function scoopHoldActive() {
    return state.scene === "ocean" && !bagIsFull() &&
      !!(mouse.scoopPress || player.scoopLock || catchHolding());
  }
  function scoopBlocksSurface() {
    if (state.scene !== "ocean" || bagIsFull()) return false;
    if (scoopHoldActive()) return true;
    if (scoopTargetingFish() && catchHolding()) return true;
    if (nearestScoopFish()) return true;
    return false;
  }
  function nearSurface() {
    return player.y < 280;
  }
  function shouldSurface() {
    return canSurfaceNow();
  }
  function tryAction(opts) {
    const fromKey = !!(opts && opts.fromKey);
    const fromTouch = !!(opts && opts.fromTouch);
    if (state.mode !== "play") return false;
    if (state.fadeDir) return true;
    if (state.scene === "ocean" && bagIsFull()) {
      if (fromTouch && !fromKey) return false;
      state.bookOpen = null;
      player.goto = null;
      beginSurface();
      return true;
    }
    if (state.bookOpen != null) return false;
    if (state.scene === "shop" && nearBoat() && expeditionUnlocked()) { beginExpedition(); return true; }
    if (state.scene === "shop" && (inDiveZone() || (clickOnDiveChip() && nearDivePad()))) {
      if (state.surfaceLock > 0) return fromKey;
      // Cash waiting: a walk-click toward the cashier must not dive.
      if (cashNeedsCollect()) return false;
      // Clicks walk to the tanks while the bag still has fish; Space can still re-dive.
      if (!fromKey && bagHasStockable()) return false;
      // Touch uses the on-screen DIVE button; tap-to-walk still reaches the dock.
      if (fromTouch && !fromKey && !clickOnDiveChip()) return false;
      // World clicks only dive on the dock strip / DIVE chip — not a walk toward the till.
      if (!fromKey && !clickOnDiveStrip() && !clickOnDiveChip()) return false;
      beginDive();
      return true;
    }
    if (shouldSurface()) {
      if (fromTouch && !fromKey) return false;
      if (scoopBlocksSurface() || scoopHoldActive()) return false;
      player.goto = null; beginSurface(); return true;
    }
    return false;
  }
  function inDiveZone() {
    return player.x > DIVE_ZONE.x && player.x < DIVE_ZONE.x + DIVE_ZONE.w &&
           player.y > DIVE_ZONE.y - 40 && player.y < DIVE_ZONE.y + DIVE_ZONE.h;
  }
  function beginDive() {
    if (state.fadeDir || state.surfaceLock > 0) return;
    player.catchLatch = false;
    player.scoopLock = null; player.scoopTap = false; player.holdGrace = 0;
    sfx("dive"); state.fadeDir = 1; state.pendingScene = "ocean";
    state.decorOpen = false;
    if (state.tutorial === 0) state.tutorial = 1;
    advanceMission();
  }
  function beginSurface() {
    if (state.scene !== "ocean") return;
    if (state.pendingScene === "shop") return;
    if (state.fadeDir > 0) return;
    clearCatchVerb();
    player.goto = null;
    player.catchLatch = false;
    player.scoopLock = null; player.scoopTap = false; player.holdGrace = 0;
    sfx("dive"); state.fadeDir = 1; state.pendingScene = "shop";
    if (state.tutorial === 2) state.tutorial = 3;
    if ((state.bagBonus || 1) > 1) {
      toast("Sale bonus +10%", "#ffe27a");
      const want = state.bag.length ? (state.bag[0] | 0) : 0;
      let waiting = false;
      for (const c of customers) if (c.state === "tank") waiting = true;
      if (!waiting && customers.length < MAX_CUSTOMERS) {
        customers.push(newCustomer({
          x: 880, y: 1088, state: "tank", tank: want, offX: 0, emote: "!",
        }));
      }
      spawnAisleCrossing();
    }
  }
  function beginExpedition() {
    if (!expeditionUnlocked() || state.expedition) return sfx("no");
    if (state.money < EXPEDITION_COST) return sfx("no");
    state.money -= EXPEDITION_COST;
    state.expeditionCount = (state.expeditionCount | 0) + 1;
    state.nightExpedition = (state.expeditionCount % 3 === 0);
    persist();
    sfx("dive");
    state.expedition = true;
    state.expeditionTime = EXPEDITION_SECS;
    state.fadeDir = 1;
    state.pendingScene = "ocean";
    if (state.nightExpedition) toast("Night expedition — rares are out", "#9ef0ff");
    state.sessionBoat = true;
    checkSessionGoals();
  }
  function seedExpeditionPocket() {
    const hi = highestUnlocked();
    const nxt = hi > 0 ? hi - 1 : 0;
    const px = 2200, py = 1600;
    pushOceanFish(hi, px + rand(-36, 36), py + rand(-28, 28));
    if (state.nightExpedition) pushOceanFish(hi, px + rand(-40, 40), py + rand(-32, 32), { rare: true });
    for (let i = 0; i < 4; i++) pushOceanFish(nxt, px + rand(-88, 88), py + rand(-64, 64));
    for (let i = 0; i < 3; i++) pushOceanFish(0, px + rand(-110, 110), py + rand(-72, 72));
  }
  function worldToScreen(x, y) { return { x: (x - cam.x) * cam.z + W / 2, y: (y - cam.y) * cam.z + H / 2 }; }
  function screenToWorld(x, y) { return { x: (x - W / 2) / cam.z + cam.x, y: (y - H / 2) / cam.z + cam.y }; }
  function worldHudFade(wx, wy) {
    const s = worldToScreen(wx, wy);
    const floor = state.scene === "shop" ? topHudFloor() : 88;
    if (s.y >= floor) return 1;
    return clamp((s.y - 8) / Math.max(12, floor - 8), 0, 1);
  }
  // Hide a chip before any edge bisects it. Fully on-canvas stays 1.
  // Edge inset (not area fraction) so a wide banner cannot stay opaque while cut.
  function screenBoxAlpha(x, y, w, h, pad) {
    const p = pad == null ? 6 : pad;
    const topSafe = state.scene === "shop" ? topHudFloor() : 0;
    const inset = Math.min(x, y - topSafe, W - (x + w), H - (y + h));
    if (inset >= p) return 1;
    if (inset <= 0) return 0;
    return inset / p;
  }
  function worldBoxAlpha(wx, wy, ww, wh) {
    const s = worldToScreen(wx, wy);
    const z = Math.max(0.001, cam.z);
    return screenBoxAlpha(s.x, s.y, ww * z, wh * z, 16);
  }
  function worldLabelAlpha(wx, wy, ww, wh) {
    return Math.min(worldBoxAlpha(wx, wy, ww, wh), worldHudFade(wx + ww / 2, wy));
  }
  // Money / BAG sit in screen space after the world pass. A world card that
  // still has edge-alpha 1 can tuck under those chips — hide the label first.
  function glowingTankHudBox() {
    const i = glowingStockIndex();
    if (i < 0 || state.scene !== "shop") return null;
    const b = tankScreenBox(i);
    if (!b) return null;
    return { x: b.x - 10, y: b.y - 10, w: b.w + 20, h: b.h + 20 };
  }
  function parkHudFromGlow(box) {
    const glow = glowingTankHudBox();
    if (!glow || !boxesOverlap(box, glow, 10)) return box;
    const down = hudBox(box.x, glow.y + glow.h + 8, box.w, box.h);
    if (down.y + down.h < H * 0.48) return down;
    const right = hudBox(glow.x + glow.w + 8, box.y, box.w, box.h);
    if (right.x + right.w < W - 220) return right;
    return down;
  }
  function topHudChips() {
    ctx.save();
    const ribbon = ribbonLayout();
    const chips = {
      money: dodgeUpgradeTray(parkChip(hudBox(16, 14, 200, 52), ribbon)),
      bag: dodgeUpgradeTray(parkChip(hudBox(224, 14, 168, 52), ribbon)),
    };
    ctx.restore();
    return chips;
  }
  function hudReadoutClear(sx, sy) {
    const chips = topHudChips();
    const sessionY = Math.max(74, chips.money.y + chips.money.h + 8, chips.bag.y + chips.bag.h + 8);
    const goal = { x: 16, y: sessionY, w: 320, h: 30 };
    const pad = 18;
    const hits = (b) => sx >= b.x - pad && sx <= b.x + b.w + pad && sy >= b.y - pad && sy <= b.y + b.h + pad;
    if (hits(chips.money) || hits(chips.bag) || hits(goal)) return 0.16;
    const floor = topHudFloor();
    if (sy < floor + 6) return clamp((sy - 8) / Math.max(12, floor), 0.12, 1);
    return 1;
  }
  function hudChipClear(wx, wy, ww, wh) {
    const s = worldToScreen(wx, wy);
    const z = Math.max(0.001, cam.z);
    const box = { x: s.x, y: s.y, w: ww * z, h: wh * z };
    const chips = topHudChips();
    if (boxesOverlap(box, chips.bag, 8) || boxesOverlap(box, chips.money, 8)) return 0;
    return 1;
  }
  // C34 faded only the unlock *text* box (t.y+78). The dark card panel is the
  // full tank — same rule as the pier sign: fade the whole panel before any
  // edge bisects it. Glass under the overlay can still scroll.
  function tankUnlockCardAlpha(t) {
    return Math.min(
      worldBoxAlpha(t.x, t.y, TANK_W, TANK_H),
      worldLabelAlpha(t.x + 10, t.y + 78, TANK_W - 20, 46),
      hudChipClear(t.x + 10, t.y + 78, TANK_W - 20, 46)
    );
  }

  // ===== OCEAN FISH =====
  function pushOceanFish(s, x, y, extra) {
    oceanFish.push({
      s, x: clamp(x, 80, OCEAN.w - 80), y: clamp(y, 260, OCEAN.h - 80),
      vx: rand(-30, 30), vy: rand(-18, 18), ang: rand(-0.4, 0.6), ph: rand(0, 40), fleeT: 0, caught: false,
      rare: !!(extra && extra.rare),
    });
  }
  function seedFrontSchool() {
    const wantShiny = !state.caughtRare;
    const mixed = state.unlocked[1] && Math.random() < 0.3;
    if (wantShiny) {
      // In front of the diver and inside the opening view — never off-camera.
      pushOceanFish(0, player.x + 118, player.y + 52, { rare: true });
    }
    if (mixed) {
      for (let i = 0; i < 4; i++) {
        pushOceanFish(0, player.x + rand(40, 160), player.y + 240 + rand(-20, 70));
      }
      for (let i = 0; i < 2; i++) {
        pushOceanFish(1, player.x + rand(80, 200), player.y + 330 + rand(-20, 50));
      }
    } else {
      for (let i = 0; i < 6; i++) {
        pushOceanFish(0, player.x + rand(30, 170), player.y + 230 + rand(-24, 80));
      }
    }
    if ((state.divesThisSession | 0) >= 2) {
      for (let i = 0; i < 4; i++) {
        pushOceanFish(0, player.x + rand(-80, 200), player.y + 160 + rand(-30, 90));
      }
    }
    seedOceanScenery();
    seedDiveLandmark();
    seedTangTease();
  }
  function seedOceanScenery() {
    oceanScenery.length = 0;
    const px = player.x, py = player.y;
    oceanScenery.push({
      kind: "ray", x: px + 210, y: py + 148, vx: -34, vy: 6, ph: 0.4, facing: -1,
    });
    oceanScenery.push({
      kind: "jelly", x: px - 168, y: py + 78, vx: 7, vy: -10, ph: 1.1,
    });
    for (let i = 0; i < 7; i++) {
      oceanScenery.push({
        kind: "minnow",
        x: px - 40 + i * 22,
        y: py + 196 + Math.sin(i * 1.3) * 14,
        vx: 78, vy: 0, ph: i * 0.38,
      });
    }
  }
  function seedDiveLandmark() {
    if (state.expedition || state.unlocked[1]) return;
    if ((state.divesThisSession | 0) !== 1) return;
    const x = clamp(player.x + 168, 180, OCEAN.w - 180);
    const y = clamp(player.y + 228, 520, 820);
    oceanScenery.push({ kind: "kelp", x, y, ph: 0.35, landmark: true });
    for (let i = 0; i < 3; i++) {
      pushOceanFish(0, x + rand(-46, 46), y + rand(-28, 40));
    }
  }
  function diveLandmark() {
    for (const s of oceanScenery) {
      if (s.kind === "kelp" && s.landmark) return { x: s.x, y: s.y - 18 };
    }
    return null;
  }
  function updateOceanScenery(dt) {
    for (const s of oceanScenery) {
      if (s.kind === "ray") {
        s.x += s.vx * dt;
        s.y += Math.sin(state.time * 0.7 + s.ph) * 18 * dt;
        s.y = clamp(s.y, 280, OCEAN.h - 120);
        if (s.x < 90) { s.x = 90; s.vx = Math.abs(s.vx); s.facing = 1; }
        if (s.x > OCEAN.w - 90) { s.x = OCEAN.w - 90; s.vx = -Math.abs(s.vx); s.facing = -1; }
      } else if (s.kind === "jelly") {
        s.y += Math.sin(state.time * 1.15 + s.ph) * 22 * dt - 8 * dt;
        s.x += Math.sin(state.time * 0.55 + s.ph) * 16 * dt;
        if (s.y < 250) s.y = OCEAN.h - 160;
        s.x = clamp(s.x, 80, OCEAN.w - 80);
      } else if (s.kind === "kelp") {
        s.x += Math.sin(state.time * 0.7 + s.ph) * 4 * dt;
      } else {
        s.x += s.vx * dt;
        s.y += Math.sin(state.time * 6 + s.ph) * 28 * dt;
        if (s.x > OCEAN.w + 40) {
          s.x = -40;
          s.y = clamp(player.y + 180 + Math.sin(s.ph) * 40, 300, OCEAN.h - 100);
        }
      }
    }
  }
  function seedOcean() {
    syncOceanHeight();
    oceanFish.length = 0;
    const counts = [16, 11, 9, 7, 3, 6, 5, 5, 4, 5, 4, 3, 2];
    for (let s = 0; s < SPECIES.length; s++) {
      if (!state.unlocked[s]) continue;
      const n = counts[s] != null ? counts[s] : 3;
      for (let i = 0; i < n; i++) spawnFish(s);
    }
  }
  function spawnFish(s) {
    let cx, cy;
    if (s === 0) {
      const school = (Math.random() * 4) | 0;
      cx = 280 + school * 500 + rand(-80, 80);
      cy = 420 + rand(-60, 60) + (state.unlocked[1] ? rand(0, 380) : ((s * 97) % 900));
      if (state.unlocked[1] && Math.random() < 0.82) cy = rand(280, 880);
    } else if (s >= 5) {
      const band = zoneBandForSpecies(s);
      const lm = landmarkForSpecies(s);
      if (lm && Math.random() < 0.6) {
        cx = lm.x + rand(-110, 110);
        cy = lm.y + rand(-80, 80);
      } else {
        cx = rand(160, OCEAN.w - 120);
        cy = rand(band.y0 + 20, Math.min(OCEAN.h - 90, band.y1 - 20));
      }
    } else if (state.unlocked[1]) {
      const lm = landmarkForSpecies(s);
      if (lm && Math.random() < 0.55) {
        cx = lm.x + rand(-90, 90);
        cy = lm.y + rand(-70, 70);
      } else if (Math.random() < 0.55) {
        cx = rand(180, OCEAN.w - 100);
        cy = rand(1040, OCEAN.h - 90);
      } else {
        cx = rand(1720, OCEAN.w - 90);
        cy = rand(420, OCEAN.h - 90);
      }
    } else {
      const school = (Math.random() * 4) | 0;
      cx = 280 + school * 500 + rand(-80, 80);
      cy = 420 + ((s * 97) % 900) + rand(-60, 60);
    }
    oceanFish.push({
      s, x: clamp(cx + rand(-90, 90), 80, OCEAN.w - 80),
      y: clamp(cy + rand(-80, 80), 260, OCEAN.h - 80),
      vx: rand(-40, 40), vy: rand(-30, 30), ang: rand(0, Math.PI * 2), ph: rand(0, 40), fleeT: 0, caught: false,
    });
  }
  function ensureOceanStock() {
    syncOceanHeight();
    const want = [24, 11, 9, 7, 3, 7, 6, 6, 5, 5, 4, 3, 2];
    for (let s = 0; s < SPECIES.length; s++) {
      if (!state.unlocked[s]) continue;
      let n = 0;
      for (const f of oceanFish) if (f.s === s && !f.caught) n++;
      const need = want[s] != null ? want[s] : 3;
      while (n < need) { spawnFish(s); n++; }
    }
    ensureNearbyFish();
  }
  function ensureNearbyFish() {
    if (state.scene !== "ocean") return;
    let near = 0, total = 0;
    for (const f of oceanFish) {
      if (f.caught) continue;
      total++;
      if (Math.hypot(f.x - player.x, f.y - player.y) < 440) near++;
    }
    while (near < 3 && total < 40) {
      const side = near % 2 === 0 ? 1 : -1;
      const ang = (side > 0 ? 0.35 : Math.PI - 0.35) + rand(-0.4, 0.4);
      const d = rand(220, 360);
      const local = zoneAtDepth(player.y);
      const sid = (state.unlocked[local.s] ? local.s : 0);
      pushOceanFish(sid, player.x + Math.cos(ang) * d, player.y + Math.sin(ang) * d + 50);
      near++;
      total++;
    }
  }
  function firstRareFish() {
    let best = null, bestD = 1e9;
    for (const f of oceanFish) {
      if (!f.rare || f.caught) continue;
      const d = Math.hypot(f.x - player.x, f.y - player.y);
      if (d < bestD) { bestD = d; best = f; }
    }
    return best;
  }
  function onScreenWorldPos(wx, wy, pad) {
    const p = pad == null ? 70 : pad;
    const s = worldToScreen(wx, wy);
    return s.x > p && s.x < W - p && s.y > p && s.y < H - p;
  }
  function shinyLeashPoint() {
    const ahead = 132;
    let x = player.x + Math.cos(player.facing) * ahead + 36;
    let y = player.y + Math.sin(player.facing) * ahead + 28;
    const halfW = (W * 0.32) / Math.max(0.7, cam.z);
    const halfH = (H * 0.26) / Math.max(0.7, cam.z);
    x = clamp(x, cam.x - halfW, cam.x + halfW);
    y = clamp(y, cam.y - halfH, cam.y + halfH);
    return { x: clamp(x, 90, OCEAN.w - 90), y: clamp(y, 270, OCEAN.h - 90) };
  }
  function placeShinyInView(f) {
    if (!f || f.caught) return;
    const p = shinyLeashPoint();
    f.x = p.x; f.y = p.y;
    f.nudgeX = p.x; f.nudgeY = p.y; f.nudgeT = 0.35;
    f.vx = 0; f.vy = 0;
  }
  function shinyWanted() {
    return !state.caughtRare && !bagIsFull() && state.scene === "ocean" && !state.fadeDir && !state.expedition;
  }
  function ensureShiny() {
    if (!shinyWanted()) return;
    if (firstRareFish()) return;
    const p = shinyLeashPoint();
    pushOceanFish(0, p.x, p.y, { rare: true });
    placeShinyInView(firstRareFish());
  }
  function leashShiny(dt) {
    if (!shinyWanted() || state.diveLock > 0) return;
    ensureShiny();
    const f = firstRareFish();
    if (!f) return;
    const p = shinyLeashPoint();
    const d = Math.hypot(f.x - player.x, f.y - player.y);
    const off = !onScreenWorldPos(f.x, f.y, 48);
    if (off || d > 300) {
      placeShinyInView(f);
      return;
    }
    if (d > 200) {
      const nx = p.x - f.x, ny = p.y - f.y, nd = Math.hypot(nx, ny) || 1;
      const pull = d > 260 ? 220 : 150;
      f.vx = (nx / nd) * pull;
      f.vy = (ny / nd) * pull;
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.ang = Math.atan2(f.vy, f.vx);
    }
  }
  function updateOceanFish(dt) {
    const px = player.x, py = player.y;
    for (const f of oceanFish) {
      if (f.caught) continue;
      if (state.catchClimax && state.catchClimax.fish === f) continue;
      const sp = SPECIES[f.s];
      if (f.tease) {
        const dx = f.x - px, dy = f.y - py, d = Math.hypot(dx, dy) || 1;
        if (d < 160) {
          f.vx = (dx / d) * 95;
          f.vy = (dy / d) * 70 + 18;
        } else {
          f.ang += Math.sin(state.time * 1.8 + f.ph) * 1.6 * dt;
          f.vx = Math.cos(f.ang) * 52;
          f.vy = Math.sin(f.ang) * 28 + Math.sin(state.time * 1.4 + f.ph) * 16;
        }
        f.x = clamp(f.x + f.vx * dt, 80, OCEAN.w - 80);
        f.y = clamp(f.y + f.vy * dt, 560, OCEAN.h - 90);
        f.ang = Math.atan2(f.vy, f.vx);
        if (Math.random() < dt * 8) {
          particles.push({
            x: f.x + rand(-10, 10), y: f.y + rand(-8, 8),
            vx: rand(-12, 12), vy: rand(-28, -6), life: rand(0.3, 0.6),
            r: rand(1.4, 2.8), col: pick(["#2f7dff", "#ffe14a", "#9ef0ff"]),
          });
        }
        continue;
      }
      if (f.rare && state.diveLock > 0) {
        f.x += Math.cos(state.time * 2.1 + f.ph) * 6 * dt;
        f.y += Math.sin(state.time * 1.7 + f.ph) * 4 * dt;
        f.vx = 0; f.vy = 0;
        continue;
      }
      if (f.nudgeT > 0) {
        f.nudgeT -= dt;
        const nx = (f.nudgeX != null ? f.nudgeX : px + 150) - f.x;
        const ny = (f.nudgeY != null ? f.nudgeY : py + 80) - f.y;
        const nd = Math.hypot(nx, ny) || 1;
        f.vx = (nx / nd) * 70;
        f.vy = (ny / nd) * 70;
        f.ang = Math.atan2(f.vy, f.vx);
        f.x += f.vx * dt; f.y += f.vy * dt;
        continue;
      }
      if (f.verb && player.target === f && !f.caught) {
        tickCatchVerbFish(f, dt);
        continue;
      }
      const dx = f.x - px, dy = f.y - py;
      const d = Math.hypot(dx, dy) || 0.001;
      const locked = player.scoopLock === f && catchHolding();
      const firstDive = (state.divesThisSession | 0) === 1;
      let fleeR = f.rare ? sp.fleeR * 0.38 : sp.fleeR;
      let fleeSp = f.rare ? sp.flee * 0.36 : sp.flee;
      if (locked) {
        fleeR *= 0.28;
        fleeSp *= 0.16;
      } else if (firstDive) {
        fleeR *= 0.52;
        fleeSp *= 0.38;
      }
      if (locked) {
        applySpeciesGait(f, dt, sp);
        f.vx *= 0.42;
        f.vy *= 0.42;
      } else if (d < fleeR) {
        f.fleeT = f.rare ? 0.22 : (firstDive ? 0.22 : 0.45);
        const boost = (!f.rare && !firstDive && d < 70) ? 1.25 : 1;
        f.vx = (dx / d) * fleeSp * boost;
        f.vy = (dy / d) * fleeSp * boost;
        f.ang = Math.atan2(f.vy, f.vx);
      } else if (f.fleeT > 0) {
        f.fleeT -= dt;
      } else {
        if (f.s === 3) {
          let sx = 0, sy = 0, c = 0;
          for (const o of oceanFish) {
            if (o === f || o.s !== f.s || o.caught) continue;
            const dd = Math.hypot(o.x - f.x, o.y - f.y);
            if (dd < 110) { sx += o.x; sy += o.y; c++; }
          }
          if (c) f.ang = lerp(f.ang, Math.atan2(sy / c - f.y, sx / c - f.x), 0.04);
        }
        applySpeciesGait(f, dt, sp);
      }
      f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.x < 70) { f.x = 70; f.vx = Math.abs(f.vx); f.ang = 0; }
      if (f.x > OCEAN.w - 70) { f.x = OCEAN.w - 70; f.vx = -Math.abs(f.vx); f.ang = Math.PI; }
      if (f.y < 230) { f.y = 230; f.vy = Math.abs(f.vy); }
      if (f.y > OCEAN.h - 70) { f.y = OCEAN.h - 70; f.vy = -Math.abs(f.vy); }
      if (f.rare && Math.random() < dt * 14) {
        particles.push({
          x: f.x + rand(-16, 16), y: f.y + rand(-12, 12),
          vx: rand(-16, 16), vy: rand(-42, -10), life: rand(0.4, 0.85),
          r: rand(1.6, 3.2), col: pick(["#ffd24a", "#fff6e8", "#ffe27a", "#fff"]),
        });
      }
    }
    if (state.diveLock <= 0) ensureNearbyFish();
    leashShiny(dt);
  }
  function fishInCone(f) {
    const dx = f.x - player.x, dy = f.y - player.y;
    const d = Math.hypot(dx, dy);
    const grace = tutorialGrace();
    const range = coneRange() + (f.rare ? 56 : 0) + grace * 64 + scoopEdgeGrace();
    if (d > range || d < 16) return false;
    const half = (f.rare ? 1.28 : coneHalf()) + grace * 0.12 + 0.035;
    return Math.abs(normAng(Math.atan2(dy, dx) - player.facing)) < half;
  }
  function fishNearCone(f) {
    const dx = f.x - player.x, dy = f.y - player.y;
    const d = Math.hypot(dx, dy);
    const verbPad = f.verb ? 36 : 0;
    const grace = tutorialGrace();
    const range = coneRange() + (f.rare ? 92 : 16) + verbPad + grace * 80 + scoopEdgeGrace();
    if (d > range || d < 16) return false;
    const half = (f.rare ? 1.48 : (f.verb ? 1.22 : 0.98)) + grace * 0.65 + 0.05;
    return Math.abs(normAng(Math.atan2(dy, dx) - player.facing)) < half;
  }
  function faceToward(x, y) {
    const dx = x - player.x, dy = y - player.y;
    if (Math.hypot(dx, dy) > 4) player.facing = Math.atan2(dy, dx);
  }
  function fishAtWorld(wx, wy) {
    const tapR = 88 + tutorialGrace() * 40;
    let best = null, bestD = tapR;
    for (const f of oceanFish) {
      if (f.caught || f.tease) continue;
      const d = Math.hypot(f.x - wx, f.y - wy);
      if (d < bestD) { bestD = d; best = f; }
    }
    return best;
  }
  function nearestScoopFish() {
    let best = null, bestD = 1e9, bestRare = null, bestRareD = 1e9;
    const grace = tutorialGrace();
    const maxD = coneRange() * (1.05 + grace * 0.35) + scoopEdgeGrace();
    const half = coneHalf() + 0.35 + grace * 0.55 + 0.04;
    for (const f of oceanFish) {
      if (f.caught || f.tease) continue;
      const dx = f.x - player.x, dy = f.y - player.y;
      const d = Math.hypot(dx, dy);
      if (d > maxD || d < 16) continue;
      if (Math.abs(normAng(Math.atan2(dy, dx) - player.facing)) > half) continue;
      if (f.rare && d < bestRareD) { bestRareD = d; bestRare = f; }
      if (d < bestD) { bestD = d; best = f; }
    }
    return bestRare || best;
  }
  function lockScoop(f) {
    if (!f || f.caught || f.tease) return false;
    if (player.scoopLock !== f) {
      if (player.scoopLock && player.scoopLock.verb) player.scoopLock.verb = "";
      if (player.target && player.target !== f && player.target.verb) player.target.verb = "";
      state.catchVerb = null;
      player.scoopLock = f;
      player.target = f;
      maybeStartCatchVerb(f);
    } else {
      player.target = f;
    }
    faceToward(f.x, f.y);
    player.goto = null;
    return true;
  }
  function startScoopOnFish(f) {
    if (!f || f.caught || f.tease || state.bag.length >= bagMax()) return false;
    if (player.catchLatch && (keys.has(" ") || keys.has("enter"))) return false;
    player.catchLatch = false;
    return lockScoop(f);
  }
  function cueEscaped(f, prog) {
    if ((state.escapeGate || 0) > 0) return;
    if (state.escapeBar && state.escapeBar.life > 0.18) return;
    state.escapeGate = 0.95;
    const x = f ? f.x : player.x + Math.cos(player.facing) * 40;
    const y = f ? f.y : player.y + Math.sin(player.facing) * 40;
    pop(x, y - 18, "escaped!", "#ff9a7a", 0.82, 1.2);
    state.escapeBar = { x, y: y - 38, prog: clamp(prog, 0.12, 1), life: 0.48, max: 0.48 };
    sfx("escape");
  }
  function clearScoop(reason) {
    const f = player.scoopLock || player.target;
    const prog = player.catchProg;
    if (reason === "escape" && f && !f.caught && prog > 0.1) cueEscaped(f, prog);
    if (f && f.verb && reason !== "catch") f.verb = "";
    if (reason !== "catch") state.catchVerb = null;
    player.scoopLock = null;
    player.scoopTap = false;
    if (reason === "fade" || reason === "catch") {
      player.target = null;
      if (reason === "fade") player.catchProg = 0;
    }
  }
  function beginDashHold(f) {
    if (!f || f.rare || f.verb) return;
    f.verb = "dash";
    f.dashT = 0;
    f.dashDir = (f.x >= player.x ? 1 : -1);
    f.dashX = f.x;
    f.dashY = f.y;
    state.catchVerb = "dash";
    state.camPunch = Math.max(state.camPunch || 0, 0.07);
    const liveDash = pops.filter((p) => p.text === "dash!");
    if (!liveDash.length) pop(f.x, f.y - 22, "dash!", "#9ef0ff", 0.72, 1.2);
    else {
      const d = liveDash[0];
      d.x = f.x + 28;
      d.y = f.y - 40;
      d.life = Math.max(d.life, 0.72);
    }
    sfx("click");
  }
  function beginSitHold(f) {
    if (!f || f.rare || f.verb) return;
    f.verb = "sit";
    f.sitT = 0;
    f.sitCx = f.x;
    f.sitCy = f.y;
    state.catchVerb = "sit";
    state.camPunch = Math.max(state.camPunch || 0, 0.05);
    partSchoolAround(f.x, f.y);
    pop(f.x, f.y - 22, "easy…", "#fff6e8", 0.8, 1.15);
    sfx("stock");
  }
  function beginYankHold(f) {
    if (!f || f.rare || f.verb) return;
    f.verb = "yank";
    f.yankT = 0;
    f.yankX = f.x;
    f.yankY = f.y;
    f.yankDir = Math.atan2(f.y - player.y, f.x - player.x) || 0.2;
    f.yankShown = true;
    state.catchVerb = "yank";
    state.camPunch = Math.max(state.camPunch || 0, 0.12);
    state.hitStop = Math.max(state.hitStop || 0, 0.08);
  }
  function partSchoolAround(x, y) {
    for (const o of oceanFish) {
      if (o.caught || o.tease || o.rare || o.verb) continue;
      const d = Math.hypot(o.x - x, o.y - y);
      if (d < 170 && d > 8) {
        o.fleeT = 0.55;
        o.vx = ((o.x - x) / d) * 210;
        o.vy = ((o.y - y) / d) * 160;
        o.ang = Math.atan2(o.vy, o.vx);
      }
    }
  }
  function tickCatchVerbFish(f, dt) {
    if (f.verb === "dash") {
      f.dashT = (f.dashT || 0) + dt;
      const sway = Math.sin(f.dashT * 2.35) * 78;
      f.x = clamp((f.dashX || f.x) + (f.dashDir || 1) * sway, 80, OCEAN.w - 80);
      f.y = (f.dashY || f.y) + Math.sin(f.dashT * 7.2) * 7;
      f.vx = (f.dashDir || 1) * 90;
      f.vy = 0;
      f.ang = (f.dashDir || 1) > 0 ? 0.05 : Math.PI - 0.05;
      if (Math.random() < dt * 18) {
        particles.push({
          x: f.x - (f.dashDir || 1) * 16, y: f.y + rand(-4, 4),
          vx: -(f.dashDir || 1) * rand(20, 50), vy: rand(-10, 10),
          life: rand(0.18, 0.36), r: rand(1.6, 3.2), col: "#9ef0ff",
        });
      }
      return;
    }
    if (f.verb === "sit") {
      f.sitT = (f.sitT || 0) + dt;
      if (f.sitT < 0.48) {
        const a = (f.sitT / 0.48) * Math.PI * 2;
        f.x = (f.sitCx || f.x) + Math.cos(a) * 30;
        f.y = (f.sitCy || f.y) + Math.sin(a) * 16;
        f.ang = a + Math.PI / 2;
      } else {
        f.x = f.sitCx || f.x;
        f.y = f.sitCy || f.y;
        f.vx = 0; f.vy = 0;
        f.ang = 0.08;
      }
      return;
    }
    if (f.verb === "yank") {
      f.yankT = (f.yankT || 0) + dt;
      const u = f.yankT;
      const pull = Math.sin(Math.min(u, 0.62) / 0.62 * Math.PI) * 52;
      const ang = f.yankDir || 0.2;
      let nx = (f.yankX || f.x) + Math.cos(ang) * pull;
      let ny = (f.yankY || f.y) + Math.sin(ang) * pull;
      const d = Math.hypot(nx - player.x, ny - player.y);
      const maxD = coneRange() * 0.82;
      if (d > maxD) {
        const k = maxD / d;
        nx = player.x + (nx - player.x) * k;
        ny = player.y + (ny - player.y) * k;
      }
      f.x = clamp(nx, 80, OCEAN.w - 80);
      f.y = clamp(ny, 240, OCEAN.h - 70);
      f.vx = Math.cos(ang) * 40;
      f.vy = Math.sin(ang) * 30;
      f.ang = ang + Math.sin(u * 18) * 0.35;
    }
  }
  function maybeStartCatchVerb(f) {
    if (!f || f.rare || f.tease || f.verb || state.catchVerb) return;
    const n = (state.diveCatches | 0) + 1;
    const firstDive = (state.divesThisSession | 0) === 1;
    if (n === 3) beginYankHold(f);
    else if (firstDive && n === 2) beginDashHold(f);
    else if (firstDive && n === 4) beginSitHold(f);
  }
  function clearCatchVerb() {
    if (player.target && player.target.verb) player.target.verb = "";
    state.catchVerb = null;
  }
  function updateCatch(dt) {
    tickHoldGrace(dt);
    if (state.catchClimax) {
      tickCatchClimax(dt);
      return;
    }
    if (state.fadeDir || state.diveLock > 0) {
      clearCatchVerb();
      clearScoop("fade");
      player.target = null;
      player.catchProg = 0;
      return;
    }
    if (player.catchLatch && !catchHolding()) player.catchLatch = false;
    if (state.bag.length >= bagMax()) {
      clearCatchVerb();
      clearScoop("fade");
      player.target = null;
      player.catchProg = 0;
      return;
    }
    const holding = catchHolding();
    if (!holding) {
      player.scoopLock = null;
      player.scoopTap = false;
    }
    let rareNear = false;
    for (const f of oceanFish) {
      if (f.caught || f.tease) continue;
      if (f.rare && fishNearCone(f)) rareNear = true;
    }
    if (rareNear && player.scoopLock && !player.scoopLock.rare) {
      if (player.scoopLock.verb) player.scoopLock.verb = "";
      state.catchVerb = null;
      player.scoopLock = null;
    }
    if (player.scoopLock && (player.scoopLock.caught || oceanFish.indexOf(player.scoopLock) < 0)) {
      player.scoopLock = null;
      player.scoopTap = false;
    }
    if (holding && player.scoopLock && !player.scoopLock.caught) {
      const f = player.scoopLock;
      const d = Math.hypot(f.x - player.x, f.y - player.y);
      if (d > scoopStayR(f)) {
        const prog = player.catchProg;
        clearScoop("escape");
        player.catchProg = Math.max(0, prog - dt * 1.6);
        if (player.catchProg <= 0) { clearCatchVerb(); player.target = null; }
        return;
      }
      faceToward(f.x, f.y);
      player.target = f;
      const gated = !!player.catchLatch;
      if (gated) {
        player.catchProg = Math.max(0, player.catchProg - dt * 1.6);
      } else {
        const hold = f.verb ? catchTime() * 0.92 : catchTime();
        player.catchProg += dt / hold;
        if (player.catchProg >= 1) beginCatchClimax(f);
      }
      return;
    }
    let best = null, bestD = 1e9;
    let bestRare = null, bestRareD = 1e9;
    for (const f of oceanFish) {
      if (f.caught || f.tease) continue;
      const inC = f.rare ? fishNearCone(f) : fishInCone(f);
      if (!inC) continue;
      const d = Math.hypot(f.x - player.x, f.y - player.y);
      if (f.rare && d < bestRareD) { bestRareD = d; bestRare = f; }
      if (d < bestD) { bestD = d; best = f; }
    }
    if (bestRare) best = bestRare;
    else if (rareNear) best = null;
    if (rareNear && player.target && !player.target.rare) {
      clearCatchVerb();
      player.target = null;
      player.catchProg = 0;
    }
    if (holding && !player.scoopLock) {
      const snap = best || nearestScoopFish();
      if (snap) lockScoop(snap);
    }
    const locked = player.scoopLock;
    if (locked && holding) {
      faceToward(locked.x, locked.y);
      player.target = locked;
      const gated = !!player.catchLatch;
      if (gated) {
        player.catchProg = Math.max(0, player.catchProg - dt * 1.6);
      } else {
        const hold = locked.verb ? catchTime() * 0.92 : catchTime();
        player.catchProg += dt / hold;
        if (player.catchProg >= 1) beginCatchClimax(locked);
      }
      return;
    }
    const gated = !holding || !!player.catchLatch;
    if (best) {
      if (player.target !== best) {
        if (player.target && player.target.verb) player.target.verb = "";
        state.catchVerb = null;
        player.target = best;
        maybeStartCatchVerb(best);
      } else {
        player.target = best;
      }
      if (gated) {
        player.catchProg = Math.max(0, player.catchProg - dt * 1.6);
      } else {
        const hold = best.verb ? catchTime() * 0.92 : catchTime();
        player.catchProg += dt / hold;
        if (player.catchProg >= 1) beginCatchClimax(best);
      }
    } else if (player.target && !player.target.caught) {
      const d = Math.hypot(player.target.x - player.x, player.target.y - player.y);
      const stay = scoopStayR(player.target);
      if (!gated && (d < stay || fishNearCone(player.target))) {
        player.catchProg += dt / catchTime();
        if (player.catchProg >= 1) beginCatchClimax(player.target);
      } else {
        if (!gated && player.catchProg > 0.1) cueEscaped(player.target, player.catchProg);
        player.catchProg = Math.max(0, player.catchProg - dt * 1.6);
        if (player.catchProg <= 0) { clearCatchVerb(); player.target = null; }
      }
    } else {
      player.catchProg = Math.max(0, player.catchProg - dt * 1.6);
      if (player.catchProg <= 0) { clearCatchVerb(); player.target = null; }
    }
  }
  function beginCatchClimax(f) {
    if (!f || f.caught || state.catchClimax) return;
    player.catchProg = 1;
    player.target = f;
    const n = (state.diveCatches | 0) + 1;
    const escape = !f.rare && n === 3;
    const snap = !f.rare && n === 2;
    const sitScoop = !f.rare && n === 4;
    const flourish = !f.rare && n >= 5;
    state.catchClimax = {
      fish: f, t: 0,
      max: f.rare ? 0.62 : escape ? 1.28 : snap ? 0.42 : sitScoop ? 0.74 : flourish ? 0.78 : 0.62,
      rare: !!f.rare, ox: f.x, oy: f.y,
      escape: escape, snap: snap, sitScoop: sitScoop, flourish: flourish, n,
      yelled: !!f.yankShown,
    };
    state.coneFlash = f.rare ? 0.34 : escape ? 0.52 : sitScoop ? 0.3 : 0.22;
    state.camPunch = f.rare ? 0.16 : escape ? 0.18 : sitScoop ? 0.12 : snap ? 0.1 : 0.08;
    state.hitStop = Math.max(state.hitStop || 0, f.rare ? 0.12 : escape ? 0.14 : sitScoop ? 0.11 : 0.1);
    if (f.rare) state.flash = 0.2;
  }
  function tickCatchClimax(dt) {
    const cl = state.catchClimax;
    if (!cl || !cl.fish) { state.catchClimax = null; return; }
    const f = cl.fish;
    cl.t += dt;
    const u = clamp(cl.t / cl.max, 0, 1);
    if (cl.escape) {
      const yank = u < 0.6 ? (u / 0.6) : 0;
      const snap = u >= 0.6 ? (u - 0.6) / 0.4 : 0;
      const away = Math.atan2(cl.oy - player.y, cl.ox - player.x);
      const pull = 86 * Math.sin(yank * Math.PI);
      const back = 1 - snap * snap * (3 - 2 * snap);
      f.x = cl.ox + Math.cos(away) * pull * (1 - snap) + Math.sin(cl.t * 36) * 10 * back;
      f.y = cl.oy + Math.sin(away) * pull * (1 - snap) + Math.cos(cl.t * 30) * 7 * back;
      if (u > 0.48 && !cl.yelled) {
        cl.yelled = true;
        pop(f.x, f.y - 26, "almost!", "#fff6e8", 1.7, 1.9);
        hudPop("almost!", "#fff6e8", f.x, f.y - 36, 1.7);
        state.hitStop = Math.max(state.hitStop || 0, 0.18);
        state.camPunch = Math.max(state.camPunch || 0, 0.18);
        playAlmostSfx();
      }
    } else if (cl.snap) {
      const wig = (1 - u) * 7;
      f.x = cl.ox + Math.sin(cl.t * 64) * wig;
      f.y = cl.oy + Math.cos(cl.t * 52) * wig * 0.4;
    } else if (cl.sitScoop) {
      const lift = Math.sin(u * Math.PI) * 22;
      f.x = cl.ox;
      f.y = cl.oy - lift;
    } else {
      const wig = (1 - u * 0.35) * (cl.rare ? 16 : cl.flourish ? 15 : 12);
      f.x = cl.ox + Math.sin(cl.t * 48) * wig;
      f.y = cl.oy + Math.cos(cl.t * 40) * wig * 0.6;
    }
    player.target = f;
    player.catchProg = 1;
    if (cl.t >= cl.max) {
      f.x = cl.ox; f.y = cl.oy;
      state.catchClimax = null;
      catchFish(f);
    }
  }
  function catchFish(f) {
    f.caught = true;
    f.verb = "";
    state.catchVerb = null;
    state.bag.push(f.s);
    if (!state.bagRare) state.bagRare = [];
    state.bagRare.push(!!f.rare);
    player.catchProg = 0; player.target = null; player.catchLatch = true;
    player.scoopLock = null; player.scoopTap = false;
    state.lifetimeCatches++;
    state.diveCatches++;
    if (!state.caughtCount || state.caughtCount.length < SPECIES.length) state.caughtCount = padSpeciesNums(state.caughtCount);
    state.caughtCount[f.s] = (state.caughtCount[f.s] | 0) + 1;
    state.sessionDiveCatch = (state.sessionDiveCatch | 0) + 1;
    if (f.rare) {
      state.caughtRare = true;
      state.sessionCaughtRare = true;
      state.shinyHold = 5.4;
      state.shinyHoldName = SPECIES[f.s].name;
      toast("Shiny " + SPECIES[f.s].name + "!", "#ffd24a", 5.6, { big: true, kind: "shiny" });
      state.flash = Math.max(state.flash, 0.22);
      state.pendingBookTease = true;
    }
    if (state.diveCatches >= 3 && !f.rare) {
      state.bagBonus = 1.1;
      const word = state.diveCatches >= 5 ? "AMAZING" : state.diveCatches === 4 ? "GREAT" : "STREAK!";
      const col = state.diveCatches >= 5 ? "#ff8ad4" : state.diveCatches === 4 ? "#9ef0ff" : "#ffe27a";
      const isStreak = state.diveCatches === 3;
      const hold = isStreak ? 2.7 : 0.7;
      const blocked = state.comboPop && state.comboPop.keep && state.comboPop.life > 0.45;
      if (isStreak) {
        state.hitStop = Math.max(state.hitStop || 0, 0.42);
        state.freezeFrame = Math.max(state.freezeFrame || 0, 0.42);
        hudPop("STREAK!", "#ffe27a", f.x, f.y - 48, 2.2);
      } else if (!blocked) {
        state.comboPop = { text: word, col, life: hold, max: hold, keep: false };
      }
    } else if (state.diveCatches >= 3) {
      state.bagBonus = 1.1;
    }
    state.bagPunch = 1.28;
    const scr = worldToScreen(f.x, f.y);
    flyers.push({
      s: f.s, rare: !!f.rare,
      x: scr.x, y: scr.y, sx: scr.x, sy: scr.y,
      tx: 300, ty: 40,
      life: 0.52, max: 0.52,
    });
    flyers.push({
      plus: "+1",
      x: scr.x, y: scr.y - 12, sx: scr.x, sy: scr.y - 12,
      tx: 308, ty: 40,
      life: 0.7, max: 0.7,
    });
    beatMoment(f.rare ? "shiny" : "catch", f.x, f.y);
    pop(f.x, f.y - 18, (f.rare ? "Shiny " : "") + SPECIES[f.s].name + "!", f.rare ? "#ffd24a" : SPECIES[f.s].accent);
    if (state.tutorial === 1) state.tutorial = 2;
    for (let i = oceanFish.length - 1; i >= 0; i--) if (oceanFish[i].caught) oceanFish.splice(i, 1);
    ensureOceanStock();
    if (shinyWanted()) {
      const shiny = firstRareFish();
      if (shiny) placeShinyInView(shiny);
      else ensureShiny();
    }
    persist();
    advanceMission();
    checkSessionGoals();
  }

  // ===== PLAYER =====
  function updatePlayer(dt) {
    const ocean = state.scene === "ocean";
    const max = ocean ? swimSpeed() : walkSpeed();
    let ax = 0, ay = 0;
    if (mouse.down) mouse.held += dt; else mouse.held = 0;
    if (keys.has("w") || keys.has("arrowup")) ay -= 1;
    if (keys.has("s") || keys.has("arrowdown")) ay += 1;
    if (keys.has("a") || keys.has("arrowleft")) ax -= 1;
    if (keys.has("d") || keys.has("arrowright")) ax += 1;
    if (ax || ay) {
      const m = Math.hypot(ax, ay) || 1; ax /= m; ay /= m;
      player.goto = null;
    } else if (mouse.down && !mouse.ui && !mouse.acted && state.mode === "play" && mouse.held > 0.16) {
      if (state.scene === "ocean" && !bagIsFull()) {
        // Hold is scoop. Never dash or buoyancy-steer from the same drag.
      } else {
        player.goto = null;
        const w = screenToWorld(mouse.x, mouse.y);
        const dx = w.x - player.x, dy = w.y - player.y, d = Math.hypot(dx, dy);
        if (d > 8) { ax = dx / d; ay = dy / d; }
      }
    } else if (player.goto && state.mode === "play") {
      const dx = player.goto.x - player.x, dy = player.goto.y - player.y, d = Math.hypot(dx, dy);
      if (d < 22) {
        if (state.scene === "shop") {
          if (!performPendingAct()) {
            tryStockOnArrival();
            tryUnlockOnArrival();
          }
        }
        // stockTank may have handed us a new cashier walk — keep that dest.
        if (player.goto && Math.hypot(player.goto.x - player.x, player.goto.y - player.y) < 22) {
          player.goto = null;
          if (player.pendingAct && !canPerformAct(player.pendingAct)) player.pendingAct = null;
        }
      } else { ax = dx / d; ay = dy / d; }
    }
    const accel = player.goto ? 2200 : 1650;
    player.vx += ax * accel * dt; player.vy += ay * accel * dt;
    const headingUp = ocean && (ay < -0.12 || (player.goto && player.goto.y < player.y - 8));
    if (headingUp) {
      player.vy -= 640 * dt;
      if (player.vy > 0) player.vy *= Math.pow(0.04, Math.min(dt, 0.05));
    }
    const fr = ax || ay ? 5.2 : 8.5;
    player.vx -= player.vx * fr * dt;
    player.vy -= player.vy * (headingUp ? 3.4 : fr) * dt;
    const sp = Math.hypot(player.vx, player.vy);
    if (sp > max) { player.vx *= max / sp; player.vy *= max / sp; }
    if (headingUp && player.vy > 12) player.vy = 12;
    player.x += player.vx * dt; player.y += player.vy * dt;
    if (!state.didMove && Math.hypot(player.x - 880, player.y - 920) > 28) state.didMove = true;
    const faceMin = (ocean && mouse.down) ? 6 : 18;
    if (player.scoopLock && catchHolding() && !player.scoopLock.caught) {
      faceToward(player.scoopLock.x, player.scoopLock.y);
    } else if (sp > faceMin) {
      player.facing = Math.atan2(player.vy, player.vx);
    }
    const moving = sp > 28;
    const wantLean = moving ? Math.cos(player.facing) * clamp(sp / max, 0, 1) * 0.22 : 0;
    player.lean = lerp(player.lean || 0, wantLean, 1 - Math.pow(0.0004, dt));
    if (moving) player.walkPhase += dt * (ocean ? 10 : 12) * clamp(sp / 80, 0.55, 1.65);
    player.bob += dt * (ocean ? 7 : 9) * (moving ? 1 : 0.22);
    if (ocean) {
      player.x = clamp(player.x, 60, OCEAN.w - 60);
      player.y = clamp(player.y, 90, OCEAN.h - 60);
      if (bubbles.length < 40 && Math.random() < dt * 7) {
        bubbles.push({
          x: player.x + Math.cos(player.facing) * 16,
          y: player.y + Math.sin(player.facing) * 16,
          r: rand(1.5, 3), v: rand(30, 50), ph: rand(0, 5),
        });
      }
    } else {
      constrainShop();
      if (moving) {
        state.dustTimer -= dt;
        if (state.dustTimer <= 0) {
          state.dustTimer = 0.13;
          const foot = Math.sin(player.walkPhase) >= 0 ? 6 : -6;
          particles.push({
            x: player.x + foot + rand(-3, 3), y: player.y + 12,
            vx: -player.vx * 0.12 + rand(-22, 22), vy: rand(-18, 2),
            life: rand(0.34, 0.55), r: rand(7, 13),
            col: "rgba(210,170,110,0.72)", kind: "dust",
          });
          if (!state.muted && Math.random() < 0.45) sfx("step");
        }
      } else {
        state.dustTimer = 0;
      }
    }
  }
  function constrainShop() {
    const r = player.radius;
    if (player.y < 890) {
      player.x = clamp(player.x, 110 + r, shopWalkMax() - r);
      player.y = clamp(player.y, 118 + r, 890);
    } else {
      player.x = clamp(player.x, 500 + r, 1320 - r);
      player.y = clamp(player.y, 860, 1080);
    }
    for (let i = 0; i < SPECIES.length; i++) {
      if (!tankLive(i)) continue;
      const t = TANK_POS[i];
      pushOut(t.x - 8, t.y - 8, TANK_W + 16, TANK_H + 28);
    }
    pushOut(REGISTER.x - 6, REGISTER.y - 6, REGISTER.w + 12, REGISTER.h + 12);
    pushOut(KIOSK.x - 6, KIOSK.y - 6, KIOSK.w + 12, KIOSK.h + 12);
    pushOut(WELCOME.x, WELCOME.y, WELCOME.w, WELCOME.h);
  }
  function pushOut(x, y, w, h) {
    const r = player.radius;
    const cx = clamp(player.x, x, x + w), cy = clamp(player.y, y, y + h);
    const dx = player.x - cx, dy = player.y - cy, d = Math.hypot(dx, dy);
    if (d < r && d > 0.001) { player.x = cx + (dx / d) * r; player.y = cy + (dy / d) * r; }
    else if (d === 0) player.y = y + h + r;
  }
  function nearRect(x, y, w, h, pad) {
    return player.x > x - pad && player.x < x + w + pad && player.y > y - pad && player.y < y + h + pad;
  }
  function tankWalkPoint(i) {
    const t = TANK_POS[i] || TANK_POS[0];
    return { x: t.x + TANK_W / 2, y: t.y + TANK_H + 48 };
  }
  function nearStockPad(i) {
    const t = TANK_POS[i];
    if (nearRect(t.x, t.y, TANK_W, TANK_H, STOCK_PAD)) return true;
    const p = tankWalkPoint(i);
    return Math.hypot(player.x - p.x, player.y - p.y) < 56;
  }
  function tryStockOnArrival() {
    if (!bagHasStockable()) return;
    for (let i = 0; i < SPECIES.length; i++) {
      if (state.unlocked[i] && bagCanStock(i) && nearStockPad(i)) stockTank(i);
    }
  }
  function tryUnlockOnArrival() {
    const i = nextLockedTank();
    if (i < 0 || state.unlocked[i] || !nearStockPad(i)) return;
    if (state.money < SPECIES[i].unlock) return;
    buyTank(i);
  }
  function bookTeaseReady() {
    if (state.sawBookTease || state.bookOpened || state.bookOpen != null) return false;
    if (!state.didFirstCollect) return false;
    return !!(state.didFirstStock || state.caughtRare || state.pendingBookTease);
  }
  function maybeBookTease() {
    if (!bookTeaseReady()) return;
    if (state.scene !== "shop") {
      state.pendingBookTease = true;
      persist();
      return;
    }
    if (state.bookTeaseWait > 0) return;
    if ((state.surfaceQuiet || 0) > 0) return;
    if (state.toasts.length) return;
    state.bookTeaseWait = 1.15;
  }
  function flushBookTease() {
    if (!bookTeaseReady() || state.scene !== "shop") return;
    state.sawBookTease = true;
    state.bookTeaseShown = true;
    state.pendingBookTease = false;
    state.bookTeaseWait = 0;
    toast("Tap a fish on the right to open your book", "#9ef0ff", 4.4, { big: true, kind: "book" });
    persist();
  }
  function maybeTangRumor() {
    if (state.unlocked[1] || state.tangRumor) return;
    if (!state.didFirstStock) return;
    state.tangRumor = true;
    toast("Maya wants a Blue Tang — something blue flashed in the deep", "#9ef0ff", 4.2);
    let maya = null;
    for (const c of customers) {
      if (c.name === "Maya" || (c.regular && c.favorite === 0)) {
        c.emote = "Blue Tang!";
        c.teaseTang = true;
        c.tank = 1;
        if (c.name === "Maya") maya = c;
      }
    }
    if (!maya && customers.length < MAX_CUSTOMERS) {
      customers.push(newCustomer({
        x: 880, y: 1088, state: "browse", tank: 1, hops: 8, offX: 0,
        name: "Maya", regular: true, favorite: 0, emote: "Blue Tang!", teaseTang: true,
      }));
    }
  }
  function firstTeaseFish() {
    for (const f of oceanFish) if (f.tease && !f.caught) return f;
    return null;
  }
  function seedTangTease() {
    if (state.unlocked[1] || state.expedition) {
      for (let i = oceanFish.length - 1; i >= 0; i--) if (oceanFish[i].tease) oceanFish.splice(i, 1);
      return;
    }
    if ((state.divesThisSession | 0) < 2 && !state.didFirstStock) return;
    for (let i = oceanFish.length - 1; i >= 0; i--) if (oceanFish[i].tease) oceanFish.splice(i, 1);
    const x = clamp(player.x + 70, 120, OCEAN.w - 120);
    const y = clamp(player.y + 340, 720, OCEAN.h - 180);
    oceanFish.push({
      s: 1, x, y, vx: 36, vy: -6, ang: 0.15, ph: rand(0, 8), fleeT: 0, caught: false, tease: true,
    });
  }
  function tillWaiting() {
    return state.scene === "shop" && state.registerCash > 0;
  }
  function tillRingR() { return 128; }
  function inTillGlow() {
    if (!tillWaiting()) return false;
    const rcx = REGISTER.x + REGISTER.w / 2;
    const rcy = REGISTER.y + REGISTER.h / 2 + 8;
    return Math.hypot(player.x - rcx, player.y - rcy) <= tillRingR();
  }
  function updateShopInteract(dt) {
    if (allowAutoStock()) {
      for (let i = 0; i < SPECIES.length; i++) {
        if (state.unlocked[i] && nearStockPad(i)) stockTank(i);
      }
    } else {
      tryStockOnArrival();
    }
    const pendingCash = player.pendingAct && player.pendingAct.kind === "cash";
    if (tillWaiting() && inTillGlow() && !pendingCash && !cashierHandlingIt()) {
      player.tillDwell = (player.tillDwell || 0) + (dt || 0);
      if (player.tillDwell >= 0.3) {
        player.tillDwell = 0;
        collectCash();
      }
    } else if (!pendingCash) {
      player.tillDwell = 0;
    }
  }
  function stockTank(i) {
    if (!state.unlocked[i]) return;
    const flags = state.bagRare || [];
    const hopped = [];
    const keep = [];
    const keepRare = [];
    for (let j = 0; j < state.bag.length; j++) {
      const s = state.bag[j] | 0;
      const rare = !!flags[j];
      const match = s === i;
      // Shiny leftover of this species, or a shiny that cannot go anywhere else.
      const leftoverShiny = rare && (s === i || !state.unlocked[s]);
      if (match || leftoverShiny) hopped.push({ s: match ? i : (state.unlocked[s] ? s : i), rare });
      else { keep.push(s); keepRare.push(rare); }
    }
    // If nothing else in the bag can stock another unlocked tank, drain the rest too.
    if (keep.length && !keep.some((s) => state.unlocked[s] && s !== i)) {
      for (let j = 0; j < keep.length; j++) hopped.push({ s: i, rare: !!keepRare[j] });
      keep.length = 0;
      keepRare.length = 0;
    }
    if (!hopped.length) return;
    let n = 0, rares = 0;
    for (const h of hopped) { n++; if (h.rare) rares++; }
    state.bag = keep;
    state.bagRare = keepRare;
    state.stock[i] += n;
    if (!state.stockRare || state.stockRare.length < SPECIES.length) state.stockRare = padSpeciesNums(state.stockRare);
    state.stockRare[i] = (state.stockRare[i] | 0) + rares;
    state.sessionStocked = i;
    for (let k = tankFish[i].length - 1; k >= 0; k--) if (tankFish[i][k].ceremonial) tankFish[i].splice(k, 1);
    const room = Math.max(0, 10 - tankFish[i].length);
    for (let k = 0; k < Math.min(n, room); k++) {
      tankFish[i].push({ x: rand(24, TANK_W - 24), y: rand(36, TANK_H - 18), a: rand(0, 6), ph: rand(0, 20) });
    }
    const t = TANK_POS[i];
    const tx = t.x + TANK_W / 2, ty = t.y + TANK_H * 0.58;
    bagGhosts.length = 0;
    for (let k = 0; k < hopped.length; k++) {
      bagGhosts.push({ s: hopped[k].s, rare: hopped[k].rare, life: 0.18 + k * 0.05 });
      stockHops.push({
        s: hopped[k].s, rare: hopped[k].rare, tank: i,
        wait: k * 0.08, life: 0.22, max: 0.22,
        sx: player.x + (k % 2 ? -44 : 44), sy: player.y + 26,
        tx: tx + rand(-14, 14), ty: ty + rand(-8, 8),
        x: player.x, y: player.y + 26, launched: false,
        visual: true,
      });
    }
    state.camPunch = Math.max(state.camPunch || 0, 0.1);
    state.bagPunch = 1.3;
    spawnP(tx, t.y + TANK_H / 2, 10, [SPECIES[i].color, "#b8f3ff", "#fff"], 70);
    pop(tx, t.y, "+" + n + " " + SPECIES[i].name, "#b8f3ff");
    sfx("stock"); toast("Stocked " + n + " " + SPECIES[i].name, "#b8f3ff");
    if (!state.didFirstStock) { state.didFirstStock = true; maybeBookTease(); maybeTangRumor(); }
    if (state.tutorial === 3) state.tutorial = 4;
    let converted = false;
    for (const c of customers) {
      if (c.state !== "browse") continue;
      if (c.teaseTang && !state.unlocked[1]) continue;
      c.state = "tank";
      c.tank = i;
      c.wait = 0;
      c.emote = c.regular ? regularBark(c) : "!";
      c.offX = tankQueueOffX(i, c);
      converted = true;
      if (c.regular) break;
    }
    if (!converted && !customers.some((c) => c.state === "tank")) {
      customers.push(newCustomer({
        x: 880, y: 1080, state: "tank", tank: i, wait: 0, emote: "!", offX: 0,
      }));
      custTimer = 0.55;
    }
    persist();
    advanceMission();
    checkSessionGoals();
    if (!bagHasStockable() && state.registerCash > 0 && !cashierHandlingIt()) {
      const dest = registerWalkPoint();
      player.goto = dest;
      player.pendingAct = { kind: "cash" };
      seedPathCoins([[player.x, player.y], [520, 380], [dest.x, dest.y]], 3);
    }
  }
  function collectCash(fromStaff) {
    const got = state.registerCash;
    if (got <= 0) return;
    const prev = state.money;
    state.money += got; state.registerCash = 0; state.coins.length = 0;
    state.moneyRollFrom = state.displayMoney;
    state.moneyRollTo = state.money;
    state.moneyRollT = 0.35;
    state.moneyPunch = 1.25;
    const rs = worldToScreen(REGISTER.x + REGISTER.w / 2, REGISTER.y + 20);
    const moneyAim = moneyHudBox(ribbonLayout());
    for (let i = 0; i < 6; i++) {
      hudCoins.push({
        x: rs.x + rand(-10, 10), y: rs.y + rand(-8, 8),
        tx: moneyAim.x + 28, ty: moneyAim.y + 26, life: 0.35 + i * 0.04, max: 0.35 + i * 0.04,
      });
    }
    pop(REGISTER.x + 70, REGISTER.y - 8, "+$" + got, "#ffe27a", 2.0, 2.2);
    if (fromStaff) {
      spawnP(REGISTER.x + 75, REGISTER.y + 20, 12, ["#ffe27a", "#ffd24a", "#fff"], 90);
      sfx("coin", 0.55);
    } else {
      beatMoment("cashin", REGISTER.x + 75, REGISTER.y + 20);
    }
    state.registerPunch = Math.max(state.registerPunch || 1, 1.42);
    if (!state.didFirstCollect) { state.didFirstCollect = true; triggerFlash(); persist(); }
    if (!state.didFirstSale) state.didFirstSale = true;
    if (prev < 40 && state.money >= 40 && state.missionDone) toast("Cashed in! Speed is ready", "#ffe27a");
    if (state.tutorial === 4) state.tutorial = 5;
    persist();
    advanceMission();
    checkSessionGoals();
    state.tillSlip = null;
    holdTillView(1.9);
    if (!fromStaff && !state.missionDone && !bagHasStockable()) {
      walkToDock();
      seedPathCoins([[player.x, player.y], [720, 640], [880, 1008]], 2);
    } else if (!state.hiredCashier && !bagHasStockable() && (state.tutorial | 0) <= 5) {
      seedPathCoins([[player.x, player.y], [720, 640], [880, 1008]], 2);
    }
  }
  function buySpeed() {
    if (state.speedLv >= SPEED_COST.length) return nope({ card: "up-speed" });
    const c = SPEED_COST[state.speedLv];
    if (state.money < c) return nope({ card: "up-speed" });
    state.money -= c; state.speedLv++; sfx("unlock"); toast("Speed up!", "#9ef0ff"); persist();
    if (state.tutorial === 5) state.tutorial = 6;
    checkSessionGoals();
  }
  function buyBag() {
    if (state.bagLv >= BAG_COST.length) return nope({ card: "up-bag" });
    const c = BAG_COST[state.bagLv];
    if (state.money < c) return nope({ card: "up-bag" });
    state.money -= c; state.bagLv++; sfx("unlock"); toast("Bigger bag!", "#9ef0ff"); persist();
    if (state.tutorial === 5) state.tutorial = 6;
  }
  function buyCatch() {
    if (state.catchLv >= CATCH_COST.length) return nope({ card: "up-catch" });
    const c = CATCH_COST[state.catchLv];
    if (state.money < c) return nope({ card: "up-catch" });
    state.money -= c; state.catchLv++; sfx("unlock"); toast("Faster catch!", "#9ef0ff"); persist();
    if (state.tutorial === 5) state.tutorial = 6;
  }
  function buyTank(i) {
    if (state.unlocked[i]) return;
    if (!nearStockPad(i)) { intentWalk("unlock", tankWalkPoint(i), i); return; }
    const c = SPECIES[i].unlock;
    if (state.money < c) {
      const t = TANK_POS[i];
      return nope({ tank: i, x: t.x + TANK_W / 2, y: t.y + 40, msg: "$" + c });
    }
    state.money -= c; state.unlocked[i] = true;
    if (i === 1) beatMoment("tang", TANK_POS[i].x + TANK_W / 2, TANK_POS[i].y + 70);
    else sfx("unlock");
    toast("Unlocked " + SPECIES[i].name + "!", SPECIES[i].color);
    toast("New fish in the ocean!", "#9ef0ff");
    spawnP(TANK_POS[i].x + TANK_W / 2, TANK_POS[i].y + 70, 28, [SPECIES[i].color, "#fff", "#ffe27a", "#9ef0ff"], 170);
    state.tankReveal = { i, life: 0.4, max: 0.4 };
    state.unlockBanner = { name: SPECIES[i].name, color: SPECIES[i].color, life: 0.9 };
    for (let k = 0; k < 3; k++) {
      tankFish[i].push({ x: rand(24, TANK_W - 24), y: rand(36, TANK_H - 18), a: rand(0, 6), ph: rand(0, 20), ceremonial: true });
    }
    if (i === 1) {
      for (let k = oceanFish.length - 1; k >= 0; k--) if (oceanFish[k].tease) oceanFish.splice(k, 1);
      toast("The bay just opened up", "#9ef0ff", 3.4);
      toast("The boat is ready — $35 on the right dock", "#ffe27a", 4.6, { big: true, kind: "boat" });
      state.boatHint = 6.5;
      state.boatGlance = 2.2;
      state.aisleSchoolWait = 1.35;
    } else if (i === 4) {
      toast("East pier tanks opened — walk right", "#ffe27a", 3.6);
      toast("Deeper zones stacked under the meadow", "#9ef0ff", 3.2);
      state.aisleSchoolWait = Math.max(state.aisleSchoolWait || 0, 0.95);
    } else if (i >= 5) {
      toast("A new dive band opened below", "#9ef0ff", 2.8);
      state.aisleSchoolWait = Math.max(state.aisleSchoolWait || 0, 0.95);
    } else {
      state.aisleSchoolWait = Math.max(state.aisleSchoolWait || 0, 0.95);
    }
    syncOceanHeight();
    if (!state.didFirstUnlock) { state.didFirstUnlock = true; triggerFlash(); }
    ensureOceanStock(); persist();
    if (state.tutorial === 5) state.tutorial = 6;
    checkSessionGoals();
  }
  function buyCashier() {
    if (state.hiredCashier) return nope({ card: "up-cashier" });
    if (state.money < CASHIER_COST) return nope({ card: "up-cashier" });
    state.money -= CASHIER_COST;
    state.hiredCashier = true;
    state.cashierAcc = 0;
    sfx("unlock");
    toast("Cashier hired! They collect while you dive.", "#ffe27a");
    persist();
    checkSessionGoals();
  }
  function buyDecor(i) {
    if (!state.decor || state.decor.length < 3) state.decor = [false, false, false];
    if (i < 0 || i > 2 || state.decor[i]) return nope({ card: "decor-" + i });
    const c = DECOR_COST[i];
    if (state.money < c) return nope({ card: "decor-" + i });
    state.money -= c;
    state.decor[i] = true;
    sfx("unlock");
    toast(DECOR_TOAST[i], "#ffe27a");
    persist();
  }
  function playerNearRegister() {
    const rcx = REGISTER.x + REGISTER.w / 2;
    const rcy = REGISTER.y + REGISTER.h / 2;
    return state.scene === "shop" && Math.hypot(player.x - rcx, player.y - rcy) <= 200;
  }
  function updateCashier(dt) {
    if (!state.hiredCashier || state.registerCash <= 0) { state.cashierAcc = 0; return; }
    if (playerNearRegister()) { state.cashierAcc = 0; return; }
    state.cashierAcc += dt;
    if (state.cashierAcc >= 1.2) {
      state.cashierAcc -= 1.2;
      collectCash(true);
    }
  }
  function updateReefPresence() {
    if (state.scene !== "ocean" || !state.unlocked[1]) { state.inReef = false; return; }
    const reef = inReefZone(player.x, player.y);
    if (reef && !state.inReef) {
      state.inReef = true;
      state.zoneTitle = { text: "REEF", life: 0.8, max: 0.8 };
      if (!state.sawReef) {
        state.sawReef = true;
        toast("The reef! New fish live here.", "#9ef0ff");
        state.camPunch = 0.14;
        persist();
        checkSessionGoals();
      }
    } else if (!reef) {
      state.inReef = false;
    }
    if (state.unlocked[2] && !state.sawGoldGarden && Math.hypot(player.x - LM_GOLD.x, player.y - LM_GOLD.y) < 210) {
      state.sawGoldGarden = true; toast("Goldfish garden", "#ffd27a"); persist();
    }
    if (state.unlocked[3] && !state.sawKoiGate && Math.hypot(player.x - LM_KOI.x, player.y - LM_KOI.y) < 220) {
      state.sawKoiGate = true; toast("Koi gate", "#f4f0ea"); persist();
    }
    if (state.unlocked[4] && !state.sawTurtleMeadow && Math.hypot(player.x - LM_TURTLE.x, player.y - LM_TURTLE.y) < 240) {
      state.sawTurtleMeadow = true; toast("Turtle meadow", "#c6e38a"); persist();
    }
    if (player.y > OCEAN_BASE_H - 40) {
      const z = zoneAtDepth(player.y);
      const tag = z.y0 | 0;
      if ((state.zoneStamp | 0) !== tag) {
        state.zoneStamp = tag;
        state.zoneTitle = { text: z.name.toUpperCase(), life: 0.85, max: 0.85 };
        if ((state.sawDeepZone | 0) < tag) {
          state.sawDeepZone = tag;
          state.sessionSawDeep = tag;
          toast(z.name, SPECIES[z.s] ? SPECIES[z.s].color : "#9ef0ff");
          persist();
          checkSessionGoals();
        }
      }
    }
  }

  // ===== CUSTOMERS =====
  function trySpawnVIP() {
    if (state.unlocked.filter(Boolean).length < 2) return false;
    if (state.vipCooldown > 0) return false;
    for (const c of customers) if (c.vip) return false;
    if (Math.random() >= 0.12) return false;
    const pool = [];
    for (let i = 0; i < SPECIES.length; i++) if (state.unlocked[i]) pool.push(i);
    if (!pool.length) return false;
    const want = pick(pool);
    const gold = Math.random() < 0.5;
    customers.push(newCustomer({
      vip: true, want, tank: want, payMult: 3,
      shirt: gold ? "#e6c34a" : pick(SHIRTS),
      sunglasses: !gold || Math.random() < 0.4,
      crown: Math.random() < 0.7,
      hat: true,
      emote: "VIP",
      offX: tankQueueOffX(want),
    }));
    state.vipCooldown = 25;
    toast("A VIP wants " + SPECIES[want].name + "!", "#ffe27a", 2.2, { kind: "vip" });
    return true;
  }
  function spawnCustomer() {
    if (customers.length >= MAX_CUSTOMERS) return;
    if (trySpawnVIP()) return;
    const stocked = [];
    for (let i = 0; i < SPECIES.length; i++) if (state.unlocked[i] && state.stock[i] > 0) stocked.push(i);
    if (!stocked.length) return;
    let pickI = stocked[0], best = -1;
    for (const i of stocked) {
      const w = state.stock[i] + Math.random() * 2;
      if (w > best) { best = w; pickI = i; }
    }
    const wantRegular = !!(state.didFirstSale || state.didFirstCollect) &&
      customers.filter((c) => c.regular).length < 2 && Math.random() < 0.42;
    const fav = 0;
    if (wantRegular && state.stock[fav] > 0) pickI = fav;
    customers.push(newCustomer({
      state: "tank", tank: pickI, offX: tankQueueOffX(pickI),
      regular: wantRegular || undefined,
      favorite: wantRegular ? fav : undefined,
    }));
  }
  function ensureRegulars() {
    if (!(state.didFirstSale || state.didFirstCollect)) return;
    let n = 0;
    const names = new Set();
    for (const c of customers) {
      if (c.regular) {
        n++;
        if (c.favorite == null) c.favorite = 0;
      }
      if (c.name) names.add(c.name);
    }
    if (n >= 3 || customers.length >= MAX_CUSTOMERS) return;
    if (!names.has("Maya")) {
      customers.push(newCustomer({
        x: 880, y: 1088, state: "tank", tank: 0, hops: 8, offX: 0,
        name: "Maya", regular: true, favorite: 0, emote: "hey!",
      }));
      n++;
    }
    if (n < 3 && !names.has("Nico") && customers.length < MAX_CUSTOMERS) {
      customers.push(newCustomer({
        x: 760, y: 1096, state: "tank", tank: 0, hops: 6, offX: -20,
        name: "Nico", regular: true, favorite: 0, emote: "hey!",
      }));
      n++;
    }
    if (n < 3 && !names.has("Jun") && customers.length < MAX_CUSTOMERS) {
      customers.push(newCustomer({
        x: 1000, y: 1090, state: "tank", tank: 0, hops: 6, offX: 20,
        name: "Jun", regular: true, favorite: 0, emote: "hey!",
      }));
    }
  }
  function ensureBaySchool() {
    if (!state.unlocked[1]) return;
    if ((state.aisleSchoolWait || 0) > 0) return;
    if (state.unlockBanner) return;
    if (state.scene !== "shop") return;
    let n = 0;
    for (const sw of state.shopSwimmers) if (sw.school === 2) n++;
    while (n < 4) {
      state.shopSwimmers.push({
        s: n % 3 === 2 ? 0 : 1,
        x: aisleMidX(),
        y: AISLE.y + 160 + n * 90,
        vx: rand(68, 102),
        ph: rand(0, 8),
        school: 2,
      });
      n++;
    }
  }
  function spawnBrowser() {
    let nBrowse = 0;
    for (const c of customers) if (c.state === "browse") nBrowse++;
    if (nBrowse >= 2 || customers.length >= MAX_CUSTOMERS) return;
    const tank = pickBrowseTank(-1);
    customers.push(newCustomer({
      state: "browse", tank, offX: Math.random() < 0.5 ? -24 : 24,
      hops: 1 + ((Math.random() * 2) | 0),
    }));
  }
  function updateCustomers(dt) {
    if (state.vipCooldown > 0) state.vipCooldown = Math.max(0, state.vipCooldown - dt);
    const totalFish = state.stock.reduce((a, b) => a + b, 0);
    const dec = state.decor || [false, false, false];
    const decorMul = 1 + (dec[0] ? 0.04 : 0) + (dec[1] ? 0.04 : 0) + (dec[2] ? 0.06 : 0);
    const rate = (0.22 + totalFish * 0.045 + state.unlocked.filter(Boolean).length * 0.04) * decorMul;
    custTimer -= dt;
    if (custTimer <= 0) { spawnCustomer(); custTimer = 1 / rate + rand(0.2, 0.8); }
    if (totalFish === 0) {
      browseTimer -= dt;
      if (browseTimer <= 0) {
        spawnBrowser();
        browseTimer = rand(1.4, 2.6);
      }
    } else {
      browseTimer = 0.4;
    }
    if (state.didFirstSale || state.didFirstCollect) ensureRegulars();
    for (let i = customers.length - 1; i >= 0; i--) {
      const c = customers[i];
      c.bob += dt * 10;
      let tx = c.x, ty = c.y;
      if (c.regular && c.favorite != null && state.stock[c.favorite] > 0 &&
          (c.state === "tank" || c.state === "browse") && !c.vip &&
          !(c.teaseTang && !state.unlocked[1])) {
        c.tank = c.favorite;
      }
      if (c.state === "tank") {
        const t = TANK_POS[c.tank];
        const stand = state.unlocked[c.tank] ? 36 : 86;
        tx = t.x + TANK_W / 2 + (c.offX || 0); ty = t.y + TANK_H + stand;
        if (state.stock[c.tank] <= 0 && Math.hypot(c.x - tx, c.y - ty) >= 18 && !c.vip) c.emote = "…";
        if (Math.hypot(c.x - tx, c.y - ty) < 18) {
          if (c.vip) {
            if (state.stock[c.tank] > 0) {
              c.emote = "$$$";
              c.wait += dt;
              if (c.wait > 0.35) {
                state.stock[c.tank]--;
                popSaleFish(c.tank);
                playTankSale(c.tank, c.regular ? c.name : "");
                c.carry = c.tank; c.state = "reg"; c.wait = 0;
                c.emote = (c.regular && c.favorite === c.tank) ? regularBark(c) : "VIP";
              }
            } else {
              c.emote = "…";
              c.wait += dt;
              if (c.wait > 3) {
                const alt = [];
                for (let k = 0; k < SPECIES.length; k++) if (state.stock[k] > 0) alt.push(k);
                if (alt.length) {
                  c.tank = pick(alt); c.payMult = 1.5; c.wait = 0;
                  c.emote = "VIP"; c.offX = tankQueueOffX(c.tank, c);
                } else { c.state = "leave"; c.emote = "…"; }
              }
            }
          } else {
            c.emote = state.stock[c.tank] > 0 ? "!" : "…";
            c.wait += dt;
            if (c.wait > 0.35) {
              if (state.stock[c.tank] > 0) {
                state.stock[c.tank]--;
                popSaleFish(c.tank);
                playTankSale(c.tank, c.regular ? c.name : "");
                c.carry = c.tank; c.state = "reg"; c.wait = 0;
                c.emote = (c.regular && (c.favorite == null || c.favorite === c.tank)) ? regularBark(c) : "";
              } else {
                const alt = [];
                for (let k = 0; k < SPECIES.length; k++) if (state.stock[k] > 0) alt.push(k);
                if (alt.length) { c.tank = pick(alt); c.wait = 0; c.emote = "…"; c.offX = tankQueueOffX(c.tank, c); }
                else { c.state = "leave"; c.emote = "…"; }
              }
            }
          }
        }
      } else if (c.state === "reg") {
        let ahead = 0;
        for (const o of customers) { if (o === c) break; if (o.state === "reg") ahead++; }
        if (ahead === 0) {
          tx = REGISTER.x + REGISTER.w + 32; ty = REGISTER.y + REGISTER.h / 2 + 8;
        } else {
          tx = REGISTER.x + REGISTER.w + 58; ty = REGISTER.y + REGISTER.h + 26;
        }
        if (Math.hypot(c.x - tx, c.y - ty) < 16) {
          if (c.regular && (c.favorite == null || c.favorite === c.carry)) {
            c.emote = regularBark(c);
          } else c.emote = c.vip ? "$$$" : "$";
          c.wait += dt;
          if (c.wait > 0.15) {
            if (!state.stockRare || state.stockRare.length < SPECIES.length) state.stockRare = padSpeciesNums(state.stockRare);
            const rareSale = (state.stockRare[c.carry] | 0) > 0;
            if (rareSale) state.stockRare[c.carry]--;
            const parts = salePayParts(c, rareSale);
            const pay = parts.pay;
            addTillLine(parts);
            state.registerCash += pay;
            const first = !state.didFirstSale;
            state.coins.push({ x: REGISTER.x + rand(30, 120), y: REGISTER.y + rand(16, 50), v: pay, ph: rand(0, 6) });
            const coinN = first ? 5 : 4;
            for (let k = 0; k < coinN; k++) {
              worldCoins.push({
                x: c.x + rand(-10, 10), y: c.y - 12 + rand(-8, 8),
                sx: c.x, sy: c.y - 14,
                tx: REGISTER.x + 75, ty: REGISTER.y + 28,
                life: 0.62 + k * 0.07, max: 0.62 + k * 0.07,
                fat: first ? 1.35 : 1.2,
              });
            }
            const who = c.name || "A guest";
            playSale(who, SPECIES[c.carry].name, pay, c.x, c.y - 28, first, c.saidLine || c.emote);
            beatMoment(first ? "firstsale" : "sale", c.x, c.y - 20);
            holdTillView(1.5);
            c.buyHop = 0.55;
            if (!state.didFirstSale) state.didFirstSale = true;
            state.sessionSales = (state.sessionSales | 0) + 1;
            if (!bagHasStockable() && cashNeedsCollect()) {
              if (!player.goto || isDockDest(player.goto)) {
                player.goto = registerWalkPoint();
                player.pendingAct = { kind: "cash" };
              }
            }
            const usual = c.regular && (c.favorite == null || c.favorite === c.carry);
            const said = usual ? regularBark(c) : "";
            c.carry = -1; c.state = "leave"; c.wait = 0;
            c.emote = said;
            persist();
            checkSessionGoals();
          }
        }
      } else if (c.state === "browse") {
        if (c.regular && state.unlocked[c.tank] && state.stock[c.tank] > 0) {
          c.state = "tank"; c.wait = 0;
          c.emote = (c.favorite == null || c.favorite === c.tank) ? regularBark(c) : "!";
        } else {
          const t = TANK_POS[c.tank] || TANK_POS[0];
          const stand = state.unlocked[c.tank] ? 36 : 86;
          tx = t.x + TANK_W / 2 + (c.offX || 24); ty = t.y + TANK_H + stand;
          if (Math.hypot(c.x - tx, c.y - ty) < 18) {
            if ((c.teaseTang || c.tank === 1) && !state.unlocked[1]) c.emote = "Blue Tang?";
            else if (c.regular && (c.favorite == null || c.favorite === c.tank)) {
              if (!isGoldTalk(c.emote) && !c.saidLine) c.emote = "hey!";
            } else if (c.regular) c.emote = c.emote || "wow";
            else c.emote = "!";
            c.wait += dt;
            if (c.wait > (c.regular ? 1.6 : 1.2)) {
              c.wait = 0;
              c.hops = (c.hops || 1) - 1;
              if (c.regular && c.hops <= 0) c.hops = 3;
              if (c.hops > 0) {
                if (c.teaseTang && !state.unlocked[1] && Math.random() < 0.55) {
                  c.tank = 1; c.offX = Math.random() < 0.5 ? -24 : 24; c.emote = "Blue Tang?";
                } else {
                  const nxt = pickBrowseTank(c.tank);
                  if (nxt !== c.tank) { c.tank = nxt; c.offX = Math.random() < 0.5 ? -24 : 24; c.emote = ""; }
                  else if (!c.regular) { c.state = "leave"; c.emote = ""; }
                }
              } else {
                c.state = "leave"; c.emote = "";
              }
            }
          }
        }
      } else if (c.state === "cross") {
        tx = c.destX != null ? c.destX : 1500;
        ty = c.destY != null ? c.destY : c.y;
        if (Math.hypot(c.x - tx, c.y - ty) < 22) { c.state = "leave"; c.emote = ""; }
      } else {
        ty = 1180;
        if (c.y > 1120) { customers.splice(i, 1); continue; }
      }
      const dx = tx - c.x, dy = ty - c.y, d = Math.hypot(dx, dy) || 1;
      c.gaitT = (c.gaitT || 0) + dt;
      if (c.regular && !c.vip && d > 86 && (c.pauseT || 0) <= 0 && Math.random() < dt * 0.7) {
        c.pauseT = rand(0.16, 0.34);
        c.glanceHold = rand(0.28, 0.5);
      }
      if ((c.pauseT || 0) > 0) c.pauseT = Math.max(0, c.pauseT - dt);
      if ((c.glanceHold || 0) > 0) c.glanceHold = Math.max(0, c.glanceHold - dt);
      const pausing = c.regular && !c.vip && (c.pauseT || 0) > 0 && d > 64;
      const pace = pausing ? 0 : (c.regular ? 136 + Math.sin((c.gaitT || 0) * 1.7) * 18 : 150);
      const weave = (c.regular && !c.vip && d > 48 && !pausing) ? Math.sin((c.gaitT || 0) * 3.1 + (c.bob || 0)) * 26 : 0;
      c.x += (dx / d) * pace * dt + (-dy / d) * weave * dt;
      c.y += (dy / d) * pace * dt + (dx / d) * weave * dt;
      const pdx = player.x - c.x, pdy = player.y - c.y;
      const nearYou = Math.hypot(pdx, pdy) < 240;
      const peek = (c.glanceHold || 0) > 0 ? 1 : 0;
      const wantGlance = nearYou || peek ? clamp(pdx / 40, -1, 1) : 0;
      c.glance = lerp(c.glance || 0, wantGlance, 1 - Math.pow(0.02, dt));
      if (c.buyHop > 0) c.buyHop = Math.max(0, c.buyHop - dt);
      updateRegularPresence(c, dt);
    }
  }
  function updateRegularPresence(c, dt) {
    if (c.mutterCd > 0) c.mutterCd = Math.max(0, c.mutterCd - dt);
    if (c.wave > 0) c.wave = Math.max(0, c.wave - dt);
    if (!c.regular || c.vip || c.state === "leave" || c.state === "reg") return;
    const d = Math.hypot(player.x - c.x, player.y - c.y);
    const haul = bagHasStockable();
    const till = state.registerCash > 0 && !cashierHandlingIt();
    if (!(haul || till)) return;
    if (d < 86 && d > 18 && (c.mutterCd || 0) <= 0) {
      c.wave = Math.max(c.wave || 0, 1.15);
      if (!isGoldTalk(c.emote) && !/tang/i.test(c.emote || "")) {
        c.emote = haul ? pick(["this way!", "over here!", "nice haul"]) : pick(["the till!", "don't forget", "hey!"]);
        c.mutterCd = 3.8;
      }
    } else if (d < 260 && d > 80 && (c.wave || 0) <= 0 && (c.mutterCd || 0) <= 0.6) {
      c.wave = 1.4;
    }
  }
  function cuePathWelcome() {
    let greeter = null;
    for (const c of customers) {
      if (c.name === "Nico" && c.state !== "reg" && c.state !== "leave") { greeter = c; break; }
    }
    if (!greeter) {
      for (const c of customers) {
        if (c.regular && c.state !== "reg" && c.state !== "leave" && !c.teaseTang) { greeter = c; break; }
      }
    }
    if (!greeter) return;
    greeter.x = 880;
    greeter.y = 640;
    greeter.wave = 2.4;
    greeter.mutterCd = 2.2;
    if (!isGoldTalk(greeter.emote) && !/tang/i.test(greeter.emote || "")) greeter.emote = "this way!";
  }
  function updateFX(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 40 * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = pops.length - 1; i >= 0; i--) {
      pops[i].life -= dt; pops[i].y += pops[i].vy * dt;
      if (pops[i].life <= 0) pops.splice(i, 1);
    }
    if (state.toasts.length && !state.unlockBanner) {
      state.toasts[0].life -= dt;
      if (state.toasts[0].life <= 0) state.toasts.shift();
    }
    for (let i = hudPops.length - 1; i >= 0; i--) {
      hudPops[i].life -= dt;
      hudPops[i].y -= 18 * dt;
      if (hudPops[i].life <= 0) hudPops.splice(i, 1);
    }
    if (state.shinyCallout > 0) state.shinyCallout = Math.max(0, state.shinyCallout - dt);
    if (state.shinyFocus > 0) state.shinyFocus = Math.max(0, state.shinyFocus - dt);
    if (state.shinyHold > 0) state.shinyHold = Math.max(0, state.shinyHold - dt);
    if (state.surfaceQuiet > 0) state.surfaceQuiet = Math.max(0, state.surfaceQuiet - dt);
    if (state.boatHint > 0) state.boatHint = Math.max(0, state.boatHint - dt);
    if (state.boatGlance > 0) state.boatGlance = Math.max(0, state.boatGlance - dt);
    if (state.bookTeaseWait > 0) {
      state.bookTeaseWait = Math.max(0, state.bookTeaseWait - dt);
      if (state.bookTeaseWait <= 0) flushBookTease();
    } else if (state.pendingBookTease && state.scene === "shop" && state.mode === "play") {
      maybeBookTease();
    }
    for (let i = flyers.length - 1; i >= 0; i--) {
      const fl = flyers[i];
      fl.life -= dt;
      const max = fl.max || 0.52;
      const u = 1 - clamp(fl.life / max, 0, 1);
      const e = u * u * (3 - 2 * u);
      const tx = fl.tx != null ? fl.tx : 300, ty = fl.ty != null ? fl.ty : 40;
      const sx = fl.sx != null ? fl.sx : fl.x, sy = fl.sy != null ? fl.sy : fl.y;
      fl.x = lerp(sx, tx, e);
      fl.y = lerp(sy, ty, e) - Math.sin(u * Math.PI) * 70;
      if (fl.life <= 0) {
        state.bagPunch = 1.32;
        flyers.splice(i, 1);
      }
    }
    for (let i = hudCoins.length - 1; i >= 0; i--) {
      const c = hudCoins[i];
      c.life -= dt;
      const u = 1 - clamp(c.life / c.max, 0, 1);
      const e = u * u * (3 - 2 * u);
      c.drawX = lerp(c.x, c.tx, e);
      c.drawY = lerp(c.y, c.ty, e);
      if (c.life <= 0) hudCoins.splice(i, 1);
    }
    for (let i = worldCoins.length - 1; i >= 0; i--) {
      const c = worldCoins[i];
      c.life -= dt;
      const max = c.max || 0.55;
      const u = 1 - clamp(c.life / max, 0, 1);
      const e = u * u * (3 - 2 * u);
      const sx = c.sx != null ? c.sx : c.x, sy = c.sy != null ? c.sy : c.y;
      c.x = lerp(sx, c.tx, e);
      c.y = lerp(sy, c.ty, e) - Math.sin(u * Math.PI) * 86;
      if (c.life <= 0) {
        state.registerPunch = Math.max(state.registerPunch || 1, 1.32);
        worldCoins.splice(i, 1);
      }
    }
    if (state.coneFlash > 0) state.coneFlash = Math.max(0, state.coneFlash - dt);
    if (state.escapeGate > 0) state.escapeGate = Math.max(0, state.escapeGate - dt);
    if (state.escapeBar) {
      state.escapeBar.life -= dt;
      if (state.escapeBar.life <= 0) state.escapeBar = null;
    }
    if (state.nopeFlash > 0) state.nopeFlash = Math.max(0, state.nopeFlash - dt * 0.85);
    if (state.registerPunch > 1) state.registerPunch = Math.max(1, state.registerPunch - dt * 2.4);
    if (state.tankShake) {
      state.tankShake.t -= dt;
      if (state.tankShake.t <= 0) state.tankShake = null;
    }
    if (state.tankFlash) {
      state.tankFlash.life -= dt;
      if (state.tankFlash.life <= 0) state.tankFlash = null;
    }
    for (let i = 0; i < SPECIES.length; i++) {
      for (const f of tankFish[i]) {
        if (f.dip > 0) f.dip = Math.max(0, f.dip - dt);
      }
    }
    for (let i = tankExits.length - 1; i >= 0; i--) {
      const e = tankExits[i];
      if ((e.wait || 0) > 0) {
        e.wait = Math.max(0, e.wait - dt);
        continue;
      }
      e.life -= dt;
      const u = 1 - clamp(e.life / (e.max || 0.62), 0, 1);
      e.x += (i % 2 ? 18 : -14) * dt;
      e.y -= 36 * dt + Math.sin(u * Math.PI) * 10 * dt;
      if (e.life <= 0) tankExits.splice(i, 1);
    }
    for (let i = tankReceipts.length - 1; i >= 0; i--) {
      tankReceipts[i].life -= dt;
      tankReceipts[i].y -= 28 * dt;
      if (tankReceipts[i].life <= 0) tankReceipts.splice(i, 1);
    }
    if (state.cardShake) {
      state.cardShake.t -= dt;
      if (state.cardShake.t <= 0) state.cardShake = null;
    }
    if (state.priceFlash) {
      state.priceFlash.t -= dt;
      if (state.priceFlash.t <= 0) state.priceFlash = null;
    }
    if (state.moneyRollT > 0) {
      state.moneyRollT = Math.max(0, state.moneyRollT - dt);
      const u = 1 - state.moneyRollT / 0.35;
      state.displayMoney = Math.round(lerp(state.moneyRollFrom, state.moneyRollTo, u));
    } else {
      state.displayMoney = state.money;
    }
    if (state.bagPunch > 1) state.bagPunch = Math.max(1, state.bagPunch - dt * 2.2);
    if (state.moneyPunch > 1) state.moneyPunch = Math.max(1, state.moneyPunch - dt * 2.2);
    if (state.scene === "ocean") {
      const bubbleRate = (state.divesThisSession | 0) >= 2 ? 12 : 8;
      if (bubbles.length < 40 && Math.random() < dt * bubbleRate) {
        bubbles.push({ x: rand(40, OCEAN.w - 40), y: OCEAN.h - 20, r: rand(2, 5), v: rand(28, 55), ph: rand(0, 8) });
      }
      if (bubbles.length > 40) bubbles.length = 40;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.v * dt; b.x += Math.sin(state.time * 2 + b.ph) * 12 * dt;
        if (b.y < 120) bubbles.splice(i, 1);
      }
    }
    if (state.splash) {
      state.splash.life -= dt;
      if (state.splash.life <= 0) state.splash = null;
    }
    if (state.tankReveal) {
      state.tankReveal.life -= dt;
      if (state.tankReveal.life <= 0) state.tankReveal = null;
    }
    if (state.unlockBanner) {
      state.unlockBanner.life -= dt;
      if (state.unlockBanner.life <= 0) state.unlockBanner = null;
    }
    if (state.comboPop) {
      state.comboPop.life -= dt;
      if (state.comboPop.life <= 0) state.comboPop = null;
    }
    if (state.zoneTitle) {
      state.zoneTitle.life -= dt;
      if (state.zoneTitle.life <= 0) state.zoneTitle = null;
    }
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);
    if (state.freezeFrame > 0) state.freezeFrame = Math.max(0, state.freezeFrame - dt);
    if (saleTalks.length) {
      saleTalks[0].life -= dt;
      if (saleTalks[0].life <= 0) saleTalks.shift();
    }
    for (let i = tankRipples.length - 1; i >= 0; i--) {
      tankRipples[i].life -= dt;
      if (tankRipples[i].life <= 0) tankRipples.splice(i, 1);
    }
    for (let i = state.shopSwimmers.length - 1; i >= 0; i--) {
      const sw = state.shopSwimmers[i];
      if (state.scene !== "shop") continue;
      const dir = sw.vx >= 0 ? 1 : -1;
      sw.y += Math.abs(sw.vx) * 0.7 * dir * dt;
      confineShopSwimmer(sw);
      const top = AISLE.y + 22;
      const bot = AISLE.y + AISLE.h - 22;
      if (sw.y >= bot && dir > 0) {
        if (sw.school === 2 && state.unlocked[1]) sw.y = top;
        else state.shopSwimmers.splice(i, 1);
      } else if (sw.y <= top && dir < 0) {
        if (sw.school === 2 && state.unlocked[1]) sw.y = bot;
        else state.shopSwimmers.splice(i, 1);
      }
    }
    if (state.aisleSchoolWait > 0) {
      state.aisleSchoolWait = Math.max(0, state.aisleSchoolWait - dt);
    }
    updateStockHops(dt);
    updateBagGhosts(dt);
    updatePathCoins(dt);
    updatePathGlints(dt);
    if (state.scene === "shop") {
      ensureBaySchool();
      seedDockTeasers();
      for (const t of dockTeasers) {
        t.x += t.vx * dt;
        t.y += Math.sin(state.time * 1.5 + t.ph) * 10 * dt + Math.sin(state.time * 2.4 + t.ph) * 4 * dt;
        t.y = clamp(t.y, 1108, 1236);
        if (t.x > shopW() + 70) {
          t.x = -70;
          t.y = rand(1120, 1220);
        }
      }
    }
  }
  function updateStockHops(dt) {
    for (let i = stockHops.length - 1; i >= 0; i--) {
      const h = stockHops[i];
      if (!h.launched) {
        h.wait -= dt;
        if (h.wait > 0) continue;
        h.launched = true;
        state.bagPunch = 1.24;
        sfx("click");
      }
      h.life -= dt;
      const max = h.max || 0.32;
      const u = 1 - clamp(h.life / max, 0, 1);
      const e = u * u * (3 - 2 * u);
      h.x = lerp(h.sx, h.tx, e);
      h.y = lerp(h.sy, h.ty, e) - Math.sin(u * Math.PI) * 92;
      if (h.life <= 0) {
        spawnP(h.tx, h.ty, 14, [SPECIES[h.s].color, "#b8f3ff", "#fff", "#9ef0ff"], 78);
        tankRipples.push({ i: h.tank, x: h.tx, y: h.ty, life: 0.48, max: 0.48 });
        state.camPunch = Math.max(state.camPunch || 0, 0.07);
        sfx("stock");
        stockHops.splice(i, 1);
      }
    }
  }
  function updateBagGhosts(dt) {
    for (let i = bagGhosts.length - 1; i >= 0; i--) {
      const g = bagGhosts[i];
      g.life = (g.life == null ? 0.22 : g.life) - dt;
      if (g.life <= 0) bagGhosts.splice(i, 1);
    }
  }
  function registerWalkPoint() {
    return { x: REGISTER.x + REGISTER.w / 2 + 36, y: REGISTER.y + REGISTER.h + 40 };
  }
  function seedPathCoins(pts, n) {
    if (!pts || pts.length < 2) return;
    pathCoins.length = 0;
    const count = clamp(n | 0, 2, 3);
    for (let i = 0; i < count; i++) {
      const u = (i + 0.55) / (count + 0.2);
      const f = u * (pts.length - 1);
      const a = clamp(f | 0, 0, pts.length - 2);
      const t = f - a;
      pathCoins.push({
        x: lerp(pts[a][0], pts[a + 1][0], t) + rand(-10, 10),
        y: lerp(pts[a][1], pts[a + 1][1], t) + rand(-8, 8),
        v: 2,
        bob: rand(0, 6),
        life: 22,
      });
    }
  }
  function updatePathCoins(dt) {
    if (state.scene !== "shop") {
      for (let i = pathCoins.length - 1; i >= 0; i--) {
        pathCoins[i].life -= dt * 3;
        if (pathCoins[i].life <= 0) pathCoins.splice(i, 1);
      }
      return;
    }
    for (let i = pathCoins.length - 1; i >= 0; i--) {
      const c = pathCoins[i];
      c.life -= dt;
      if (c.life <= 0) { pathCoins.splice(i, 1); continue; }
      if (Math.hypot(player.x - c.x, player.y - c.y) < 38) {
        state.money += c.v;
        state.moneyRollFrom = state.displayMoney;
        state.moneyRollTo = state.money;
        state.moneyRollT = 0.22;
        state.moneyPunch = 1.16;
        pop(c.x, c.y - 12, "+$" + c.v, "#ffe27a", 1.1, 1.15);
        sfx("coin");
        pathCoins.splice(i, 1);
        persist();
      }
    }
  }
  function bagCanStock(i) {
    if (!state.unlocked[i] || !state.bag.length) return false;
    const flags = state.bagRare || [];
    let other = false;
    for (let j = 0; j < state.bag.length; j++) {
      const s = state.bag[j] | 0;
      if (s === i) return true;
      if (flags[j] && !state.unlocked[s]) return true;
      if (state.unlocked[s] && s !== i) other = true;
    }
    return !other;
  }
  function canPerformAct(act) {
    if (!act || state.scene !== "shop") return false;
    if (act.kind === "stock") {
      return nearStockPad(act.i) && bagCanStock(act.i);
    }
    if (act.kind === "unlock") {
      return nearStockPad(act.i) && !state.unlocked[act.i] && act.i === nextLockedTank() && state.money >= SPECIES[act.i].unlock;
    }
    if (act.kind === "cash") {
      return tillWaiting() && (inTillGlow() || nearRect(REGISTER.x, REGISTER.y, REGISTER.w, REGISTER.h, 48));
    }
    return false;
  }
  function performPendingAct() {
    const act = player.pendingAct;
    if (!act || !canPerformAct(act)) return false;
    player.pendingAct = null;
    player.goto = null;
    if (act.kind === "stock") stockTank(act.i);
    else if (act.kind === "unlock") buyTank(act.i);
    else if (act.kind === "cash") collectCash();
    return true;
  }
  function intentWalk(kind, dest, i) {
    const act = { kind, i };
    player.pendingAct = act;
    if (canPerformAct(act)) {
      performPendingAct();
      return true;
    }
    player.goto = dest;
    return true;
  }
  function tryClickShop(wx, wy) {
    if (state.scene !== "shop" || state.mode !== "play") return false;
    const tankHit = tankAtWorld(wx, wy);
    if (tankHit >= 0) {
      if (!state.unlocked[tankHit]) {
        const t = TANK_POS[tankHit];
        const ready = tankHit === nextLockedTank();
        const can = ready && state.money >= SPECIES[tankHit].unlock;
        if (!can) {
          nope({
            tank: tankHit,
            x: t.x + TANK_W / 2,
            y: t.y + 36,
            msg: !ready ? "Soon" : "$" + SPECIES[tankHit].unlock,
          });
        }
        return intentWalk("unlock", tankWalkPoint(tankHit), tankHit);
      }
      return intentWalk("stock", tankWalkPoint(tankHit), tankHit);
    }
    if (tillWaiting()) {
      const rcx = REGISTER.x + REGISTER.w / 2;
      const rcy = REGISTER.y + REGISTER.h / 2;
      if (Math.hypot(wx - rcx, wy - rcy) < tillRingR() + 24) {
        return intentWalk("cash", registerWalkPoint());
      }
    }
    return false;
  }
  function updatePathGlints(dt) {
    const haul = state.scene === "shop" && bagHasStockable();
    const till = state.scene === "shop" && state.registerCash > 0 && !cashierHandlingIt();
    if (!haul && !till) {
      for (let i = pathGlints.length - 1; i >= 0; i--) {
        pathGlints[i].life -= dt * 2.4;
        if (pathGlints[i].life <= 0) pathGlints.splice(i, 1);
      }
      return;
    }
    const pts = haul
      ? [[880, 1000], [880, 820], [880, 640], [880, 460], [880, 340], [275, 342]]
      : [[880, 360], [720, 360], [520, 380], [340, 440], [248, 530]];
    if (pathGlints.length < 11 && Math.random() < dt * 7) {
      const i = (Math.random() * (pts.length - 1)) | 0;
      const u = Math.random();
      pathGlints.push({
        x: lerp(pts[i][0], pts[i + 1][0], u) + rand(-8, 8),
        y: lerp(pts[i][1], pts[i + 1][1], u) + rand(-8, 8),
        life: rand(0.55, 1.15), max: 1,
        r: rand(2.1, 4.4),
        coin: till && Math.random() < 0.45,
      });
    }
    for (let i = pathGlints.length - 1; i >= 0; i--) {
      const g = pathGlints[i];
      g.life -= dt;
      if (g.life <= 0) pathGlints.splice(i, 1);
    }
  }
  function updateTitleFX(dt) {
    if (titleBubbles.length < 28 && Math.random() < dt * 14) {
      titleBubbles.push({ x: rand(30, W - 30), y: H + 8, r: rand(2, 6), v: rand(36, 88), ph: rand(0, 8) });
    }
    for (let i = titleBubbles.length - 1; i >= 0; i--) {
      const b = titleBubbles[i];
      b.y -= b.v * dt;
      b.x += Math.sin(state.time * 2 + b.ph) * 18 * dt;
      if (b.y < -12) titleBubbles.splice(i, 1);
    }
  }

  // ===== DRAW HELPERS =====
  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
  function shadow(x, y, rx, ry) {
    ctx.save();
    const g = ctx.createRadialGradient(x - 2, y + 2, 0.2, x - 1, y + 3, rx * 1.15);
    g.addColorStop(0, "rgba(16, 8, 4, 0.36)");
    g.addColorStop(0.5, "rgba(16, 8, 4, 0.12)");
    g.addColorStop(1, "rgba(16, 8, 4, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x - 1, y + 3, rx * 0.92, ry * 0.62, -0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function groundBlob(x, y, rx, ry) {
    ctx.fillStyle = "rgba(10, 6, 4, 0.36)";
    ctx.beginPath(); ctx.ellipse(x - 4, y, rx * 1.08, ry, -0.18, 0, Math.PI * 2); ctx.fill();
  }
  // C43 — painted harbor art. Cached tiles only; no downloaded photos.
  const paint = { ready: false, wood: null, woodTeal: null, clouds: null };
  function hash2(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return n - Math.floor(n);
  }
  function makeOff(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }
  function paintWoodTile(c, teal) {
    const g = c.getContext("2d");
    const w = c.width, h = c.height;
    const base = g.createLinearGradient(0, 0, 0, h);
    if (teal) {
      base.addColorStop(0, "#c8c4a4");
      base.addColorStop(0.45, "#9aaa86");
      base.addColorStop(1, "#6e7e5c");
    } else {
      base.addColorStop(0, "#c89a62");
      base.addColorStop(0.4, "#9a6a38");
      base.addColorStop(1, "#6a4220");
    }
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 28; i++) {
      const yy = 3 + i * (h / 28);
      g.strokeStyle = teal
        ? "rgba(40,48,28," + (0.1 + (i % 4) * 0.04) + ")"
        : "rgba(48,22,8," + (0.12 + (i % 4) * 0.045) + ")";
      g.lineWidth = i % 5 === 0 ? 1.6 : 0.8;
      g.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const py = yy + Math.sin(x * 0.035 + i * 1.7) * 1.8 + Math.sin(x * 0.11 + i) * 0.7;
        if (x === 0) g.moveTo(x, py); else g.lineTo(x, py);
      }
      g.stroke();
    }
    for (let k = 0; k < 4; k++) {
      const kx = 28 + k * 56 + hash2(k, 3) * 18;
      const ky = 8 + hash2(k, 9) * (h - 16);
      g.save();
      g.translate(kx, ky);
      g.rotate(hash2(k, 1) * 0.8);
      g.strokeStyle = teal ? "rgba(36,42,22,0.5)" : "rgba(52,26,10,0.55)";
      g.fillStyle = teal ? "rgba(70,78,48,0.35)" : "rgba(86,48,18,0.4)";
      g.beginPath(); g.ellipse(0, 0, 7.5, 4.6, 0, 0, Math.PI * 2); g.fill();
      for (let r = 2; r <= 7; r += 1.6) {
        g.beginPath(); g.ellipse(0, 0, r * 1.15, r * 0.68, 0, 0, Math.PI * 2); g.stroke();
      }
      g.restore();
    }
    g.fillStyle = teal ? "rgba(255,245,200,0.08)" : "rgba(255,220,150,0.1)";
    g.fillRect(0, 0, w, 6);
    g.fillStyle = "rgba(20,10,4,0.18)";
    g.fillRect(0, h - 5, w, 5);
  }
  function paintCloudTile(c) {
    const g = c.getContext("2d");
    g.clearRect(0, 0, c.width, c.height);
    for (let i = 0; i < 7; i++) {
      const cx = 40 + i * 70;
      const cy = 28 + (i % 3) * 10;
      const rad = 22 + (i % 4) * 8;
      const puff = g.createRadialGradient(cx, cy, 4, cx, cy + 4, rad);
      puff.addColorStop(0, "rgba(255,255,255,0.85)");
      puff.addColorStop(0.45, "rgba(236,244,255,0.45)");
      puff.addColorStop(1, "rgba(200,220,240,0)");
      g.fillStyle = puff;
      g.beginPath(); g.ellipse(cx, cy, rad * 1.6, rad * 0.7, 0, 0, Math.PI * 2); g.fill();
    }
  }
  function stampPlankTile(c, teal, name) {
    const g = c.getContext("2d");
    const f = ATLAS[name || "plank"] || ATLAS.plank;
    g.clearRect(0, 0, c.width, c.height);
    if (ART.ready && f) {
      g.drawImage(ART.img, f.x, f.y, f.w, f.h, 0, 0, c.width, c.height);
      if (teal) {
        g.fillStyle = "rgba(36, 92, 72, 0.22)";
        g.fillRect(0, 0, c.width, c.height);
      }
      const shine = g.createLinearGradient(0, 0, 0, c.height);
      shine.addColorStop(0, "rgba(200, 230, 245, 0.22)");
      shine.addColorStop(0.38, "rgba(255, 255, 255, 0)");
      shine.addColorStop(1, "rgba(12, 28, 36, 0.22)");
      g.fillStyle = shine;
      g.fillRect(0, 0, c.width, c.height);
      return true;
    }
    paintWoodTile(c, teal);
    return false;
  }
  function plankCell(i) {
    const names = ["plank", "plank1", "plank2"];
    return ATLAS[names[((i % 3) + 3) % 3]] || ATLAS.plank;
  }
  function ensurePaint() {
    if (!paint.wood) {
      paint.wood = makeOff(196, 54);
      paint.woodTeal = makeOff(196, 54);
      paint.clouds = makeOff(520, 80);
      paintCloudTile(paint.clouds);
    }
    if (ART.ready && ATLAS.plank && !paint.sprited) {
      stampPlankTile(paint.wood, false, "plank");
      stampPlankTile(paint.woodTeal, true, "plank1");
      paint.sprited = true;
      paint.ready = true;
      return;
    }
    if (paint.ready) return;
    paintWoodTile(paint.wood, false);
    paintWoodTile(paint.woodTeal, true);
    paint.ready = true;
  }
  function sunAmt(x, y) {
    return clamp(0.4 + (x - 180) / 2200 * 0.48 - (y - 70) / 1500 * 0.16, 0.2, 0.94);
  }
  function fillCapsule(x0, y0, x1, y1, r) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * r, ny = dx / len * r;
    ctx.beginPath();
    ctx.moveTo(x0 + nx, y0 + ny);
    ctx.lineTo(x1 + nx, y1 + ny);
    ctx.arc(x1, y1, r, Math.atan2(ny, nx), Math.atan2(-ny, -nx));
    ctx.lineTo(x0 - nx, y0 - ny);
    ctx.arc(x0, y0, r, Math.atan2(-ny, -nx), Math.atan2(ny, nx));
    ctx.closePath();
    ctx.fill();
  }
  function drawLimbChain(x, y, a1, len1, a2, len2, r, col, tipCol) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a1);
    ctx.fillStyle = col;
    fillCapsule(0, 0, 0, len1, r);
    ctx.translate(0, len1);
    ctx.rotate(a2);
    ctx.fillStyle = tipCol || col;
    fillCapsule(0, 0, 0, len2, r * 0.82);
    ctx.restore();
  }
  function drawCaustics(x, y, w, h, t, a) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      ctx.strokeStyle = "rgba(210,245,255," + (a * (0.55 + 0.45 * Math.sin(t * 1.1 + i))) + ")";
      ctx.lineWidth = 1.1 + (i % 3) * 0.35;
      ctx.beginPath();
      const yy = y + ((i * 47 + t * 22) % Math.max(14, h));
      for (let px = x; px <= x + w; px += 12) {
        const py = yy + Math.sin(px * 0.016 + t * 1.6 + i) * 11 + Math.sin(px * 0.041 - t * 0.8 + i) * 6;
        if (px === x) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawSunGlitter(x, y, w, t, n) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < n; i++) {
      const tw = Math.sin(t * 6.4 + i * 2.17);
      if (tw < 0.28) continue;
      const px = x + ((i * 149 + Math.sin(t * 0.35 + i) * 28 + w) % w);
      const py = y + Math.sin(t * 1.55 + i * 0.73) * 5.5;
      const a = 0.12 + tw * 0.48;
      ctx.fillStyle = "rgba(255,246,200," + a + ")";
      ctx.beginPath();
      ctx.ellipse(px, py, 4.5 + tw * 6, 0.9 + tw * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      if (tw > 0.82) {
        ctx.strokeStyle = "rgba(255,255,240," + (a * 0.7) + ")";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(px - 7, py); ctx.lineTo(px + 7, py);
        ctx.moveTo(px, py - 3.2); ctx.lineTo(px, py + 3.2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  function drawWaterMotes(x, y, w, h, t, n, col) {
    ctx.save();
    ctx.fillStyle = col || "rgba(220,245,255,0.55)";
    for (let i = 0; i < n; i++) {
      const px = x + ((i * 97 + t * 14 + w) % w);
      const py = y + ((i * 53 + Math.sin(t * 0.45 + i) * 22 + h * 8) % h);
      ctx.globalAlpha = 0.12 + 0.28 * (0.5 + 0.5 * Math.sin(t * 2.1 + i));
      ctx.beginPath();
      ctx.arc(px, py, i % 6 === 0 ? 1.7 : 0.85, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawFoamBand(x, y, w, t) {
    ctx.save();
    for (let i = 0; i < w; i += 11) {
      const px = x + i + Math.sin(t * 2.05 + i * 0.06) * 4.2;
      const py = y + Math.sin(t * 2.8 + i * 0.09) * 2.6;
      const r = 7.2 + (i * 13) % 6;
      const a = 0.38 + 0.28 * Math.sin(t * 2.2 + i * 0.05);
      ctx.fillStyle = "rgba(255,255,255," + a + ")";
      ctx.beginPath(); ctx.ellipse(px, py, r, 3.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(210,236,255,0.28)";
      ctx.beginPath(); ctx.ellipse(px + 4, py + 3.2, r * 0.72, 2.2, 0, 0, Math.PI * 2); ctx.fill();
      if (i % 33 === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.beginPath(); ctx.ellipse(px - 6, py - 2, 4, 2, -0.3, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }
  function drawSunDisc(x, y, r) {
    const halo = ctx.createRadialGradient(x - r * 0.15, y - r * 0.15, r * 0.12, x, y, r * 3.1);
    halo.addColorStop(0, "rgba(255,248,210,0.95)");
    halo.addColorStop(0.22, "rgba(255,214,120,0.42)");
    halo.addColorStop(0.55, "rgba(255,186,80,0.12)");
    halo.addColorStop(1, "rgba(255,170,60,0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, r * 3.1, 0, Math.PI * 2); ctx.fill();
    const core = ctx.createRadialGradient(x - r * 0.22, y - r * 0.24, r * 0.1, x, y, r);
    core.addColorStop(0, "#fff6d8");
    core.addColorStop(0.45, "#ffe27a");
    core.addColorStop(1, "#f0b429");
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  function drawPaintedSky(x, y, w, h, t) {
    ensurePaint();
    if (blitTile("sky", x, y, w, h)) {
      const haze = ctx.createLinearGradient(x, y + h * 0.5, x, y + h);
      haze.addColorStop(0, "rgba(255,220,160,0)");
      haze.addColorStop(1, "rgba(255,196,120,0.22)");
      ctx.fillStyle = haze;
      ctx.fillRect(x, y, w, h);
      blitHorizon(x - 8, y + h - 120, w + 16, 128);
      return;
    }
    const sky = ctx.createLinearGradient(x, y, x, y + h);
    sky.addColorStop(0, "#8fd4f4");
    sky.addColorStop(0.22, "#5eb8e6");
    sky.addColorStop(0.55, "#3aa0cc");
    sky.addColorStop(0.82, "#2f8eb4");
    sky.addColorStop(1, "#4ea8b0");
    ctx.fillStyle = sky;
    ctx.fillRect(x, y, w, h);
    const haze = ctx.createLinearGradient(x, y + h * 0.5, x, y + h);
    haze.addColorStop(0, "rgba(255,220,160,0)");
    haze.addColorStop(1, "rgba(255,196,120,0.28)");
    ctx.fillStyle = haze;
    ctx.fillRect(x, y, w, h);
    if (paint.clouds) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      const drift = (t * 6) % 180;
      ctx.drawImage(paint.clouds, x - 40 + drift, y + 18, 360, 56);
      ctx.globalAlpha = 0.38;
      ctx.drawImage(paint.clouds, x + w * 0.42 - drift * 0.6, y + 8, 400, 64);
      ctx.restore();
    }
    blitHorizon(x - 8, y + h - 120, w + 16, 128);
  }
  function drawPierPost(x, footY, sc) {
    const s = sc || 1.15;
    const t = state.time || 0;
    ctx.fillStyle = "rgba(8, 24, 32, 0.38)";
    ctx.beginPath(); ctx.ellipse(x, footY + 4, 15 * s, 5.2 * s, 0, 0, Math.PI * 2); ctx.fill();
    if (blit("post", x, footY, { scale: s })) {
      ctx.fillStyle = "rgba(8, 40, 52, 0.42)";
      ctx.beginPath(); ctx.ellipse(x, footY + 2, 12 * s, 3.6 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(180, 230, 240, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x, footY + 1, 11 * s, 3.1 * s, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.translate(x + Math.sin(t * 2.1 + x * 0.02) * 2.4, footY + 8);
      ctx.scale(1.05, -0.38);
      ctx.transform(1, 0, Math.sin(t * 1.6 + x) * 0.12, 1, 0, 0);
      blit("post", 0, 0, { scale: s, flat: true });
      ctx.restore();
      return;
    }
    ctx.fillStyle = "#3a2210";
    ctx.fillRect(x - 7, footY - 40, 14, 40);
    ctx.fillStyle = "#8a5a30";
    ctx.fillRect(x - 7, footY - 40, 5, 40);
  }
  function drawZoneBed(z) {
    const y0 = z.y0, y1 = z.y1, s = z.s | 0;
    const sandY = y1 - 56;
    const cols = [
      ["#e8d090", "#c8a868"], ["#d8b878", "#6a8a60"], ["#e0c070", "#c8a040"],
      ["#d4b090", "#b07050"], ["#c8c070", "#4a8a50"], ["#b8a068", "#3a7a4a"],
      ["#d0c060", "#8a7a30"], ["#e8d8b0", "#c8a878"], ["#6a5a70", "#3a2850"],
      ["#c8a868", "#a06040"], ["#4a7080", "#204050"], ["#7a90a0", "#3a5060"],
      ["#3a4a58", "#1a2830"],
    ];
    const pair = cols[Math.min(s, cols.length - 1)];
    ctx.save();
    ctx.fillStyle = pair[0];
    ctx.beginPath(); ctx.moveTo(0, sandY + 20);
    for (let x = 0; x <= OCEAN.w; x += 28) {
      ctx.lineTo(x, sandY + Math.sin(x * 0.012 + y1 * 0.01) * 14);
    }
    ctx.lineTo(OCEAN.w, y1 + 8); ctx.lineTo(0, y1 + 8); ctx.closePath(); ctx.fill();
    const g = ctx.createLinearGradient(0, sandY, 0, y1);
    g.addColorStop(0, "rgba(40,24,10,0)");
    g.addColorStop(1, pair[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, sandY + 8, OCEAN.w, y1 - sandY);
    const bedId = z.forever
      ? ((FOREVER_ZONE_NAMES.indexOf((z.name || "").split(" · ")[0]) + 8) % 8)
      : Math.min(s, 7);
    if (ATLAS["bed" + bedId]) {
      ctx.save();
      const step = 118;
      for (let x = -90, n = 0; x < OCEAN.w + 80; x += step, n++) {
        const id = (bedId + (n * 3 + ((y1 / 17) | 0))) % 8;
        const jx = x + Math.sin(n * 1.7 + y1 * 0.02) * 22;
        const jy = sandY - 36 + ((n * 5) % 3) * 7 + Math.sin(n * 0.9) * 4;
        const bw = 210 + (n % 3) * 18;
        const bh = 86 + (n % 2) * 12;
        ctx.globalAlpha = 0.78 + (n % 4) * 0.05;
        blitTile("bed" + id, jx, jy, bw, bh);
      }
      ctx.restore();
    }
    if (z.forever) {
      const kind = (FOREVER_ZONE_NAMES.indexOf((z.name || "").split(" · ")[0]) + 8) % 8;
      if (kind === 0) {
        ctx.fillStyle = "rgba(80,220,255,0.35)";
        for (let i = 0; i < 18; i++) {
          ctx.globalAlpha = 0.2 + 0.35 * (0.5 + 0.5 * Math.sin(state.time * 2 + i));
          ctx.beginPath(); ctx.arc((i * 137 + 40) % OCEAN.w, sandY - 20 - (i % 5) * 16, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else if (kind === 1) {
        ctx.fillStyle = "rgba(200,240,255,0.28)";
        for (let i = 0; i < 10; i++) {
          const px = 80 + i * 240, py = sandY - 10;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 8, py - 36); ctx.lineTo(px + 16, py); ctx.fill();
        }
      } else if (kind === 2) {
        ctx.fillStyle = "rgba(180,90,255,0.16)";
        ctx.fillRect(0, y0, OCEAN.w, y1 - y0);
      }
    } else if (s === 0) {
      ctx.strokeStyle = "#3d8b4a"; ctx.lineWidth = 2.2;
      for (let i = 0; i < 16; i++) {
        const px = 60 + i * 150;
        ctx.beginPath();
        ctx.moveTo(px, sandY + 8);
        ctx.quadraticCurveTo(px + Math.sin(state.time + i) * 10, sandY - 18, px + 6, sandY - 40);
        ctx.stroke();
      }
    } else if (s === 1) {
      for (let i = 0; i < 12; i++) {
        const px = 90 + i * 190, py = sandY + 4;
        ctx.fillStyle = i % 2 ? "#e85d6a" : "#c45ec8";
        ctx.beginPath(); ctx.ellipse(px, py - 8, 16, 7, i * 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#5a6a70";
        ctx.beginPath(); ctx.ellipse(px + 22, py, 18, 10, 0.2, 0, Math.PI * 2); ctx.fill();
      }
    } else if (s === 2) {
      ctx.fillStyle = "rgba(232, 192, 74, 0.18)";
      ctx.fillRect(0, y0, OCEAN.w, y1 - y0);
    } else if (s >= 5) {
      ctx.strokeStyle = s === 5 ? "#2a8a5a" : "rgba(120,200,220,0.35)";
      ctx.lineWidth = 2.4;
      for (let i = 0; i < 10; i++) {
        const px = 120 + i * 220;
        ctx.beginPath();
        ctx.moveTo(px, sandY);
        ctx.quadraticCurveTo(px + Math.sin(state.time * 1.2 + i) * 12, sandY - 30, px + 4, sandY - 70);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  function drawDiveBeds() {
    const top = cam.y - (H * 0.7) / Math.max(0.6, cam.z);
    const bot = cam.y + (H * 0.7) / Math.max(0.6, cam.z);
    const seen = {};
    let y = Math.max(220, top);
    while (y < bot + 90) {
      const z = zoneAtDepth(y);
      if (!seen[z.y0]) { seen[z.y0] = 1; drawZoneBed(z); }
      y += 90;
    }
  }
  function waterlineY(x, y, t) {
    return y + Math.sin(x * 0.026 + t * 1.35) * 6.5 + Math.sin(x * 0.07 - t * 0.9) * 2.8;
  }
  function drawBayWater(x, y, w, h, t, teal) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - 10, y + h + 12);
    ctx.lineTo(x - 10, waterlineY(x, y, t));
    for (let px = x; px <= x + w + 8; px += 14) {
      ctx.lineTo(px, waterlineY(px, y, t));
    }
    ctx.lineTo(x + w + 10, y + h + 12);
    ctx.closePath();
    ctx.clip();
    const g = ctx.createLinearGradient(x, y, x, y + h);
    if (teal) {
      g.addColorStop(0, "#8af4ea");
      g.addColorStop(0.08, "#3ed8d0");
      g.addColorStop(0.28, "#18a8a8");
      g.addColorStop(0.58, "#0c6e78");
      g.addColorStop(0.82, "#064850");
      g.addColorStop(1, "#021820");
    } else {
      g.addColorStop(0, "#b4f4fc");
      g.addColorStop(0.06, "#62d8ea");
      g.addColorStop(0.2, "#2a9ec0");
      g.addColorStop(0.44, "#0e6a86");
      g.addColorStop(0.7, "#08485c");
      g.addColorStop(1, "#031820");
    }
    ctx.fillStyle = g;
    ctx.fillRect(x - 12, y - 12, w + 24, h + 24);
    const cell = ATLAS.water;
    if (ART.ready && cell) {
      const tw = 280, th = 168;
      ctx.save();
      ctx.globalAlpha = 0.55;
      for (let row = 0, iy = y - 28; iy < y + h + 20; row++, iy += th * 0.58) {
        const shift = (row % 2) * (tw * 0.34);
        for (let ix = x - 50 - shift; ix < x + w + 40; ix += tw * 0.62) {
          ctx.drawImage(ART.img, cell.x, cell.y, cell.w, cell.h, ix, iy, tw, th);
        }
      }
      ctx.restore();
      if (teal) {
        ctx.fillStyle = "rgba(18, 140, 132, 0.16)";
        ctx.fillRect(x - 8, y - 8, w + 16, h + 16);
      }
    }
    const sg = ctx.createRadialGradient(x + w * 0.78, y + 4, 6, x + w * 0.68, y + 48, w * 0.58);
    sg.addColorStop(0, "rgba(255,236,170,0.38)");
    sg.addColorStop(0.35, "rgba(255,210,120,0.12)");
    sg.addColorStop(1, "rgba(255,200,100,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(x, y, w, Math.min(h, 260));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      const rx = x + w * (0.18 + i * 0.16) + Math.sin(t * 0.25 + i) * 20;
      ctx.fillStyle = "rgba(190,230,255," + (0.04 + 0.025 * Math.sin(t + i)) + ")";
      ctx.beginPath();
      ctx.moveTo(rx, y);
      ctx.lineTo(rx + 36, y);
      ctx.lineTo(rx + 110, y + h);
      ctx.lineTo(rx - 40, y + h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    drawCaustics(x, y, w, h, t, teal ? 0.2 : 0.15);
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "#e8ffff";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      const yy = y + 28 + i * 42 + Math.sin(t * 1.15 + i) * 7;
      for (let px = x; px <= x + w; px += 16) {
        const py = yy + Math.sin(px * 0.018 + t * 2.1 + i) * 6 + Math.sin(px * 0.05 - t + i) * 2.4;
        if (px === x) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
    drawSunGlitter(x, y + 6, w, t, 46);
    drawWaterMotes(x, y + 40, w, Math.max(40, h - 40), t, 28, "rgba(230,250,255,0.5)");
    const abyss = ctx.createLinearGradient(x, y + h * 0.38, x, y + h);
    abyss.addColorStop(0, "rgba(2,12,20,0)");
    abyss.addColorStop(0.45, "rgba(2,10,18,0.28)");
    abyss.addColorStop(1, "rgba(1,6,12,0.62)");
    ctx.fillStyle = abyss;
    ctx.fillRect(x, y + h * 0.38, w, h * 0.62);
    ctx.restore();
  }
  function drawWetWaterline(x, y, w, t) {
    const cell = ATLAS.waterline;
    if (ART.ready && cell) {
      ctx.save();
      for (let ix = x - 16, n = 0; ix < x + w + 8; ix += 210, n++) {
        const jy = y - 18 + Math.sin(n * 1.3 + t) * 2;
        ctx.globalAlpha = 0.88;
        ctx.drawImage(ART.img, cell.x, cell.y, cell.w, cell.h, ix, jy, 230, 52);
      }
      ctx.restore();
    }
    drawFoamBand(x - 6, y + 4, w + 12, t);
  }
  function drawPierBoards(x, y, w, h, opts) {
    ensurePaint();
    const plank = (opts && opts.plank) || 26;
    const wetY = opts && opts.wetY;
    const teal = !!(opts && opts.teal);
    const tile = teal ? paint.woodTeal : paint.wood;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    for (let row = 0, yy = y; yy < y + h; row++, yy += plank) {
      const ph = Math.min(plank - 1.6, y + h - yy);
      if (ph <= 0) break;
      let sx = x - (row % 2) * 58 - hash2(row, 4) * 22;
      let n = 0;
      while (sx < x + w + 10) {
        const pw = 92 + ((row * 11 + n * 17) % 5) * 16;
        const cell = plankCell(row * 5 + n);
        if (ART.ready && cell) {
          ctx.drawImage(ART.img, cell.x, cell.y, cell.w, cell.h, sx, yy, pw, ph);
        } else if (tile) {
          ctx.drawImage(tile, sx, yy, pw, ph);
        }
        if (teal) {
          ctx.fillStyle = "rgba(40, 90, 72, 0.12)";
          ctx.fillRect(sx, yy, pw, ph);
        }
        const lit = sunAmt(sx + pw * 0.5, yy);
        const shine = ctx.createLinearGradient(sx, yy, sx + pw * 0.42, yy + ph);
        shine.addColorStop(0, "rgba(255,226,160," + (0.08 + lit * 0.12) + ")");
        shine.addColorStop(0.4, "rgba(255,220,150,0)");
        shine.addColorStop(1, "rgba(28,14,6," + (0.12 + (1 - lit) * 0.12) + ")");
        ctx.fillStyle = shine;
        ctx.fillRect(sx, yy, pw, ph);
        ctx.fillStyle = "rgba(32,16,8,0.55)";
        ctx.fillRect(sx + pw - 1.4, yy, 2.2, ph);
        ctx.fillStyle = "rgba(22,12,6,0.78)";
        ctx.beginPath(); ctx.arc(sx + 8, yy + 6, 1.45, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + pw - 8, yy + 6, 1.45, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,220,160,0.5)";
        ctx.beginPath(); ctx.arc(sx + 7.4, yy + 5.3, 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + pw - 8.6, yy + 5.3, 0.45, 0, Math.PI * 2); ctx.fill();
        sx += pw + 2.4;
        n++;
      }
      ctx.fillStyle = "rgba(24,12,6,0.48)";
      ctx.fillRect(x, yy + ph, w, 1.8);
    }
    ctx.restore();
    if (wetY != null) {
      const wet = ctx.createLinearGradient(x, wetY - 72, x, wetY + 18);
      wet.addColorStop(0, "rgba(18,70,90,0)");
      wet.addColorStop(0.38, "rgba(16,70,88,0.22)");
      wet.addColorStop(0.72, "rgba(10,48,64,0.5)");
      wet.addColorStop(1, "rgba(6,24,34,0.68)");
      ctx.fillStyle = wet;
      ctx.fillRect(x, wetY - 72, w, 90);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const t = state.time || 0;
      const sheen = ctx.createLinearGradient(x + ((t * 46) % (w + 160)) - 80, wetY - 18, x + ((t * 46) % (w + 160)) + 90, wetY + 8);
      sheen.addColorStop(0, "rgba(200,240,255,0)");
      sheen.addColorStop(0.45, "rgba(220,250,255,0.16)");
      sheen.addColorStop(1, "rgba(180,230,240,0)");
      ctx.fillStyle = sheen;
      ctx.fillRect(x, wetY - 16, w, 22);
      ctx.fillStyle = "rgba(180,230,240,0.1)";
      ctx.fillRect(x, wetY - 6, w, 8);
      ctx.restore();
      drawWetWaterline(x, wetY - 8, w, state.time || 0);
    }
  }
  function drawPierShade() {
    const sh = ctx.createLinearGradient(80, 70, 1680, 110);
    sh.addColorStop(0, "rgba(28, 40, 62, 0.32)");
    sh.addColorStop(0.28, "rgba(36, 48, 68, 0.12)");
    sh.addColorStop(0.58, "rgba(255, 214, 130, 0)");
    sh.addColorStop(1, "rgba(255, 204, 100, 0.1)");
    ctx.fillStyle = sh;
    ctx.fillRect(80, 70, 1600, 830);
    const eaves = ctx.createLinearGradient(80, 70, 80, 188);
    eaves.addColorStop(0, "rgba(18, 14, 10, 0.42)");
    eaves.addColorStop(0.55, "rgba(22, 16, 10, 0.16)");
    eaves.addColorStop(1, "rgba(28, 20, 12, 0)");
    ctx.fillStyle = eaves;
    ctx.fillRect(80, 70, 1600, 118);
  }
  function drawTurtle(ang, s, t) {
    ctx.save(); ctx.rotate(ang);
    const flap = Math.sin(t * 5.4) * 0.38;
    function flipper(side, ox, oy, rx, ry, rot) {
      ctx.save();
      ctx.translate(ox * s, oy * s);
      ctx.rotate(rot);
      const g = ctx.createLinearGradient(0, 0, rx * s, 0);
      g.addColorStop(0, "#3a6a3c");
      g.addColorStop(0.55, "#2a5230");
      g.addColorStop(1, "#1a3820");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(0, 0, rx * s, ry * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#142418"; ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.strokeStyle = "rgba(180,210,140,0.28)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(-rx * 0.2 * s, 0); ctx.lineTo(rx * 0.7 * s, side * ry * 0.15 * s); ctx.stroke();
      ctx.restore();
    }
    flipper(1, -3, 10, 8.6, 3.1, 0.55 - flap);
    flipper(-1, -3, -10, 8.6, 3.1, -0.55 + flap);
    flipper(1, -10, 5.2, 5.2, 2.0, 2.55 + flap * 0.25);
    flipper(-1, -10, -5.2, 5.2, 2.0, -2.55 - flap * 0.25);
    ctx.fillStyle = "#2a4a2c";
    ctx.beginPath();
    ctx.moveTo(-11 * s, -1.8 * s);
    ctx.quadraticCurveTo(-17.4 * s, 0, -11 * s, 1.8 * s);
    ctx.closePath(); ctx.fill();
    const shell = ctx.createRadialGradient(-2 * s, -3 * s, 2 * s, 0, 1 * s, 14 * s);
    shell.addColorStop(0, "#7cbc62");
    shell.addColorStop(0.35, "#4e8e44");
    shell.addColorStop(0.72, "#2f6234");
    shell.addColorStop(1, "#1a3a22");
    ctx.fillStyle = shell;
    ctx.beginPath(); ctx.ellipse(0.4 * s, 0, 13.6 * s, 10.2 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#142418"; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0.4 * s, 0, 13.6 * s, 10.2 * s, 0, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = "rgba(198, 220, 130, 0.55)"; ctx.lineWidth = 1.15;
    ctx.beginPath(); ctx.ellipse(0.2 * s, -0.4 * s, 4.4 * s, 3.6 * s, 0, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.32;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 7.4 * s, Math.sin(a) * 5.5 * s, 3.6 * s, 2.6 * s, a, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(220,240,170,0.16)";
    ctx.beginPath(); ctx.ellipse(-2 * s, -3.6 * s, 6.2 * s, 3.2 * s, -0.35, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const neck = ctx.createLinearGradient(10 * s, -3 * s, 16 * s, 3 * s);
    neck.addColorStop(0, "#5a9a4a");
    neck.addColorStop(1, "#2e6234");
    ctx.fillStyle = neck;
    ctx.beginPath(); ctx.ellipse(12.4 * s, 0.3 * s, 5.8 * s, 3.6 * s, 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#142418"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "#3a6a34";
    ctx.beginPath();
    ctx.moveTo(16.6 * s, -0.8 * s);
    ctx.lineTo(19.2 * s, 0.2 * s);
    ctx.lineTo(16.4 * s, 1.4 * s);
    ctx.closePath(); ctx.fill();
    drawFishEye(s, 14.4, -1.05, 0.18, 0);
    ctx.restore();
  }
  function drawFishEye(s, ox, oy, lookX, lookY) {
    const lx = lookX || 0, ly = lookY || 0;
    ctx.fillStyle = "#fff8ee";
    ctx.beginPath(); ctx.ellipse(ox * s, oy * s, 2.25 * s, 2.05 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1a120c";
    ctx.beginPath(); ctx.arc((ox + 0.45 + lx) * s, (oy + ly) * s, 1.18 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3a2818";
    ctx.beginPath(); ctx.arc((ox + 0.55 + lx) * s, (oy + 0.15 + ly) * s, 0.55 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc((ox - 0.55) * s, (oy - 0.72) * s, 0.58 * s, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc((ox + 0.7) * s, (oy + 0.55) * s, 0.22 * s, 0, Math.PI * 2); ctx.fill();
  }
  function fishLook(sp, t) {
    const rate = 1.05 + sp.id * 0.38;
    return {
      x: Math.sin(t * rate + sp.id * 1.7) * (sp.id === 1 ? 0.55 : 0.38),
      y: Math.sin(t * 0.72 + sp.id) * 0.22,
    };
  }
  function clownBodyPath(s) {
    ctx.beginPath();
    ctx.moveTo(-9.2 * s, 0);
    ctx.bezierCurveTo(-9.4 * s, -8.6 * s, -1.2 * s, -9.6 * s, 6.4 * s, -7.2 * s);
    ctx.bezierCurveTo(11.6 * s, -5.2 * s, 13.2 * s, -1.6 * s, 13.0 * s, 0);
    ctx.bezierCurveTo(13.2 * s, 1.6 * s, 11.6 * s, 5.2 * s, 6.4 * s, 7.2 * s);
    ctx.bezierCurveTo(-1.2 * s, 9.6 * s, -9.4 * s, 8.6 * s, -9.2 * s, 0);
    ctx.closePath();
  }
  function drawClownfish(s, t, wob, look) {
    ctx.fillStyle = "#d45a12";
    ctx.beginPath();
    ctx.moveTo(-8.2 * s, 0);
    ctx.lineTo(-18.4 * s, -8.8 * s + wob * 7);
    ctx.quadraticCurveTo(-13.2 * s, 0, -18.4 * s, 8.8 * s - wob * 7);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#1a0c06"; ctx.lineWidth = 1.35 * Math.max(0.7, s); ctx.stroke();
    ctx.fillStyle = "#e07020";
    ctx.beginPath();
    ctx.moveTo(-2.4 * s, -6.2 * s);
    ctx.quadraticCurveTo(1.2 * s, -16.8 * s + wob * 2.4, 7.4 * s, -7.4 * s);
    ctx.lineTo(1.0 * s, -5.4 * s);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#1a0c06"; ctx.lineWidth = 1.1; ctx.stroke();
    ctx.fillStyle = "#c44810";
    ctx.beginPath();
    ctx.moveTo(0.6 * s, 6.2 * s);
    ctx.quadraticCurveTo(5.2 * s, 13.6 * s - wob * 2, 8.8 * s, 6.6 * s);
    ctx.closePath(); ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.translate(3.2 * s, 3.6 * s);
    ctx.rotate(0.7 + wob * 0.45);
    ctx.fillStyle = "#f08a2a";
    ctx.beginPath(); ctx.ellipse(0, 0, 5.4 * s, 2.15 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1a0c06"; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.restore();
    const body = ctx.createLinearGradient(0, -9 * s, 1 * s, 9 * s);
    body.addColorStop(0, "#ffb04a");
    body.addColorStop(0.38, "#f0781c");
    body.addColorStop(0.72, "#d45010");
    body.addColorStop(1, "#8a2e08");
    ctx.fillStyle = body;
    clownBodyPath(s); ctx.fill();
    ctx.save();
    clownBodyPath(s); ctx.clip();
    function bar(x0, x1, bulge) {
      ctx.fillStyle = "#fff8ee";
      ctx.beginPath();
      ctx.moveTo(x0 * s, -10 * s);
      ctx.quadraticCurveTo((x0 + bulge) * s, 0, x0 * s, 10 * s);
      ctx.lineTo(x1 * s, 10 * s);
      ctx.quadraticCurveTo((x1 + bulge) * s, 0, x1 * s, -10 * s);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#141008";
      ctx.lineWidth = 1.7 * Math.max(0.65, s);
      ctx.beginPath();
      ctx.moveTo(x0 * s, -10 * s); ctx.quadraticCurveTo((x0 + bulge) * s, 0, x0 * s, 10 * s);
      ctx.moveTo(x1 * s, -10 * s); ctx.quadraticCurveTo((x1 + bulge) * s, 0, x1 * s, 10 * s);
      ctx.stroke();
    }
    bar(-7.4, -3.6, 2.4);
    bar(0.2, 3.8, 1.8);
    bar(7.0, 9.8, 1.1);
    ctx.fillStyle = "rgba(255,230,170,0.22)";
    ctx.beginPath(); ctx.ellipse(2 * s, -3.4 * s, 5.6 * s, 2.8 * s, -0.28, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#1a0c06"; ctx.lineWidth = 1.55;
    clownBodyPath(s); ctx.stroke();
    drawFishEye(s, 8.4, -1.35, look.x, look.y);
  }
  function drawBlueTang(s, t, wob, look) {
    ctx.fillStyle = "#f6d424";
    ctx.beginPath();
    ctx.moveTo(-6.2 * s, 0);
    ctx.quadraticCurveTo(-12.6 * s, -15.4 * s + wob * 5, -23.6 * s, -11.2 * s + wob * 6);
    ctx.quadraticCurveTo(-16.4 * s, 0, -23.6 * s, 11.2 * s - wob * 6);
    ctx.quadraticCurveTo(-12.6 * s, 14.8 * s - wob * 5, -6.2 * s, 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#1a1404"; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = "#2f7dff";
    ctx.beginPath();
    ctx.moveTo(-2.6 * s, -9.4 * s);
    ctx.quadraticCurveTo(4.2 * s, -19.2 * s + wob * 3, 11.2 * s, -10.6 * s);
    ctx.lineTo(1.4 * s, -8.2 * s);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-2.6 * s, 9.4 * s);
    ctx.quadraticCurveTo(4.2 * s, 18.4 * s - wob * 3, 10.6 * s, 10.4 * s);
    ctx.lineTo(1.4 * s, 8.0 * s);
    ctx.closePath(); ctx.fill();
    const disc = ctx.createRadialGradient(-1 * s, -3 * s, 2 * s, 1 * s, 2 * s, 13 * s);
    disc.addColorStop(0, "#6ab4ff");
    disc.addColorStop(0.4, "#2f7dff");
    disc.addColorStop(0.78, "#1a4ec8");
    disc.addColorStop(1, "#0c2a78");
    ctx.fillStyle = disc;
    ctx.beginPath(); ctx.ellipse(1.2 * s, 0, 10.2 * s, 12.4 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(1.2 * s, 0, 10.2 * s, 12.4 * s, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "#0a1838";
    ctx.beginPath(); ctx.ellipse(8.2 * s, -0.2 * s, 5.8 * s, 9.2 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#0a1020";
    ctx.lineWidth = 2.6 * Math.max(0.7, s);
    ctx.beginPath();
    ctx.ellipse(1.2 * s, 0, 9.2 * s, 11.2 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(190,230,255,0.22)";
    ctx.beginPath(); ctx.ellipse(-0.4 * s, -4.8 * s, 5.4 * s, 3.4 * s, -0.32, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#f6d424";
    ctx.beginPath(); ctx.ellipse(-8.2 * s, 0, 1.85 * s, 2.55 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#10224a"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(1.2 * s, 0, 10.2 * s, 12.4 * s, 0, 0, Math.PI * 2); ctx.stroke();
    drawFishEye(s, 7.0, -1.4, look.x, look.y);
  }
  function drawGoldfish(s, t, wob, look) {
    ctx.globalAlpha = 0.92;
    const veil = ctx.createLinearGradient(-8 * s, 0, -30 * s, 0);
    veil.addColorStop(0, "#ff8a28");
    veil.addColorStop(0.55, "#ffc46a");
    veil.addColorStop(1, "rgba(255,210,140,0.15)");
    ctx.fillStyle = veil;
    ctx.beginPath();
    ctx.moveTo(-6.2 * s, 0);
    ctx.quadraticCurveTo(-18 * s, -19 * s + wob * 14, -32 * s, -9.2 * s);
    ctx.quadraticCurveTo(-20 * s, -2 * s, -11 * s, 0);
    ctx.quadraticCurveTo(-20 * s, 3 * s, -32 * s, 10.2 * s);
    ctx.quadraticCurveTo(-18 * s, 19 * s - wob * 14, -6.2 * s, 0);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#ffe08a";
    ctx.beginPath();
    ctx.moveTo(-10 * s, 0);
    ctx.quadraticCurveTo(-21 * s, -11 * s + wob * 8, -27 * s, -3.2 * s);
    ctx.quadraticCurveTo(-18 * s, 0, -27 * s, 5.4 * s);
    ctx.quadraticCurveTo(-21 * s, 13 * s - wob * 8, -10 * s, 0);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#e07020";
    ctx.beginPath();
    ctx.moveTo(-0.2 * s, 7.6 * s);
    ctx.quadraticCurveTo(4.2 * s, 13.4 * s, 8.0 * s, 7.6 * s);
    ctx.closePath(); ctx.fill();
    const fat = ctx.createRadialGradient(2 * s, -3 * s, 2 * s, 1 * s, 2 * s, 12 * s);
    fat.addColorStop(0, "#ffd27a");
    fat.addColorStop(0.35, "#ff9a32");
    fat.addColorStop(0.7, "#e06818");
    fat.addColorStop(1, "#8a340c");
    ctx.fillStyle = fat;
    ctx.beginPath(); ctx.ellipse(1.8 * s, 0, 11.4 * s, 10.2 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(1.8 * s, 0, 11.4 * s, 10.2 * s, 0, 0, Math.PI * 2); ctx.clip();
    ctx.strokeStyle = "rgba(160,60,16,0.28)";
    ctx.lineWidth = 0.7;
    for (let i = -3; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(2 * s, 0, (6 + i * 1.4) * s, (5.4 + i * 1.15) * s, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,236,190,0.28)";
    ctx.beginPath(); ctx.ellipse(3.8 * s, -3.2 * s, 5.4 * s, 3.6 * s, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#7a2e10"; ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.ellipse(1.8 * s, 0, 11.4 * s, 10.2 * s, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#ffd27a";
    ctx.beginPath();
    ctx.moveTo(-1.0 * s, -8.6 * s);
    ctx.quadraticCurveTo(3.2 * s, -15.2 * s + wob * 4, 7.2 * s, -8.2 * s);
    ctx.lineTo(1.4 * s, -7.6 * s);
    ctx.closePath(); ctx.fill();
    drawFishEye(s, 8.4, -1.4, look.x, look.y);
  }
  function drawKoi(s, t, wob, look) {
    ctx.fillStyle = "#f4efe6";
    ctx.beginPath();
    ctx.moveTo(-14.2 * s, 0);
    ctx.lineTo(-26.4 * s, -6.4 * s + wob * 5);
    ctx.quadraticCurveTo(-21 * s, 0, -26.4 * s, 6.4 * s - wob * 5);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#4a2a22"; ctx.lineWidth = 1.05; ctx.stroke();
    ctx.fillStyle = "#e8d8c8";
    ctx.beginPath();
    ctx.moveTo(-2.4 * s, -4.6 * s);
    ctx.quadraticCurveTo(3.2 * s, -9.6 * s + wob * 3, 8.4 * s, -4.2 * s);
    ctx.lineTo(1.6 * s, -3.8 * s);
    ctx.closePath(); ctx.fill();
    const koi = ctx.createLinearGradient(0, -6 * s, 0, 6 * s);
    koi.addColorStop(0, "#fffaf4");
    koi.addColorStop(0.5, "#f0e6da");
    koi.addColorStop(1, "#c8b4a0");
    ctx.fillStyle = koi;
    ctx.beginPath(); ctx.ellipse(0.6 * s, 0, 17.8 * s, 5.8 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0.6 * s, 0, 17.8 * s, 5.8 * s, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "#d8241c";
    ctx.beginPath(); ctx.ellipse(-5.8 * s, -1.1 * s, 5.8 * s, 2.9 * s, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e85a22";
    ctx.beginPath(); ctx.ellipse(5.6 * s, 1.5 * s, 4.2 * s, 2.15 * s, -0.34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d8241c";
    ctx.beginPath(); ctx.ellipse(12.2 * s, -0.85 * s, 3.1 * s, 1.95 * s, 0.18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath(); ctx.ellipse(2 * s, -2.2 * s, 8 * s, 1.8 * s, -0.08, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#4a2a22"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0.6 * s, 0, 17.8 * s, 5.8 * s, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#3a2218"; ctx.lineWidth = 1.15;
    ctx.beginPath(); ctx.moveTo(16.8 * s, 1.5 * s); ctx.lineTo(20.0 * s, 2.9 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(16.8 * s, 2.4 * s); ctx.lineTo(19.6 * s, 3.9 * s); ctx.stroke();
    drawFishEye(s, 12.2, -1.0, look.x, look.y);
  }
  function drawSeahorse(s, t, wob, look) {
    const curl = Math.sin(t * 3.2) * 0.18;
    ctx.strokeStyle = "#c87820"; ctx.lineWidth = 2.4 * Math.max(0.7, s); ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-2 * s, 8 * s);
    ctx.quadraticCurveTo(-8 * s + curl * 8, 12 * s, -4 * s, 16 * s + curl * 4);
    ctx.quadraticCurveTo(2 * s, 14 * s, 0, 10 * s);
    ctx.stroke();
    const body = ctx.createLinearGradient(-4 * s, -10 * s, 6 * s, 10 * s);
    body.addColorStop(0, "#ffe27a");
    body.addColorStop(0.45, "#e8a03a");
    body.addColorStop(1, "#a85a18");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0.6 * s, 1.2 * s, 5.2 * s, 9.4 * s, 0.18, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#5a3010"; ctx.lineWidth = 1.15;
    ctx.beginPath(); ctx.ellipse(0.6 * s, 1.2 * s, 5.2 * s, 9.4 * s, 0.18, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,226,122,0.45)"; ctx.lineWidth = 0.9;
    for (let i = -2; i < 3; i++) {
      ctx.beginPath(); ctx.arc(-1.4 * s, i * 2.6 * s, 1.6 * s, 0.2, 2.6); ctx.stroke();
    }
    ctx.fillStyle = "#e8a03a";
    ctx.beginPath();
    ctx.moveTo(-1.2 * s, -6 * s);
    ctx.quadraticCurveTo(1.2 * s, -16 * s + wob * 3, 5.4 * s, -8 * s);
    ctx.lineTo(1.6 * s, -6.2 * s);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#d88828";
    ctx.beginPath(); ctx.ellipse(6.2 * s, -1.4 * s, 4.6 * s, 3.4 * s, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c87018";
    ctx.beginPath();
    ctx.moveTo(9.6 * s, -1.6 * s);
    ctx.quadraticCurveTo(13.4 * s, -4.2 * s, 12.2 * s, 0.4 * s);
    ctx.closePath(); ctx.fill();
    drawFishEye(s, 6.6, -2.2, look.x, look.y);
  }
  function drawPuffer(s, t, wob, look) {
    const puff = 1 + Math.sin(t * 2.1) * 0.06;
    const body = ctx.createRadialGradient(-2 * s, -3 * s, 2 * s, 0, 1 * s, 13 * s);
    body.addColorStop(0, "#fff6b0");
    body.addColorStop(0.4, "#f0d24a");
    body.addColorStop(1, "#c8a018");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0.4 * s, 0.4 * s, 11.6 * s * puff, 10.4 * s * puff, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#7ad08a";
    ctx.beginPath(); ctx.ellipse(0.4 * s, 4.6 * s, 8.8 * s * puff, 5.2 * s * puff, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2a4a22";
    for (const [ox, oy] of [[-4, 3.6], [0.6, 5.2], [5.2, 3.8], [-2.2, 6.4], [3.2, 6.6]]) {
      ctx.beginPath(); ctx.arc(ox * s, oy * s, 0.85 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = "#4a3a10"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0.4 * s, 0.4 * s, 11.6 * s * puff, 10.4 * s * puff, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#e8c04a";
    for (let i = 0; i < 7; i++) {
      const a = -0.9 + i * 0.3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 10.6 * s * puff, Math.sin(a) * 9.2 * s * puff);
      ctx.lineTo(Math.cos(a) * 14.2 * s * puff, Math.sin(a) * 12.4 * s * puff);
      ctx.lineTo(Math.cos(a + 0.12) * 10.4 * s * puff, Math.sin(a + 0.12) * 9 * s * puff);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#f0d24a";
    ctx.beginPath(); ctx.moveTo(-10 * s, 0); ctx.lineTo(-16 * s, -4 * s + wob * 3); ctx.lineTo(-16 * s, 4 * s - wob * 3); ctx.closePath(); ctx.fill();
    drawFishEye(s, 5.6, -2.4, look.x, look.y);
  }
  function drawAngelfish(s, t, wob, look) {
    ctx.fillStyle = "#f4e8c8";
    ctx.beginPath();
    ctx.moveTo(-1 * s, -2 * s);
    ctx.quadraticCurveTo(2 * s, -22 * s + wob * 4, 10 * s, -8 * s);
    ctx.lineTo(2 * s, -2 * s);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-1 * s, 2 * s);
    ctx.quadraticCurveTo(2 * s, 22 * s - wob * 4, 10 * s, 8 * s);
    ctx.lineTo(2 * s, 2 * s);
    ctx.closePath(); ctx.fill();
    const disc = ctx.createRadialGradient(-1 * s, -2 * s, 2 * s, 1 * s, 1 * s, 12 * s);
    disc.addColorStop(0, "#fffaf0");
    disc.addColorStop(0.45, "#f0d8a8");
    disc.addColorStop(1, "#c8a070");
    ctx.fillStyle = disc;
    ctx.beginPath(); ctx.ellipse(1.2 * s, 0, 9.6 * s, 11.8 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(1.2 * s, 0, 9.6 * s, 11.8 * s, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "#e85d4c";
    ctx.beginPath(); ctx.ellipse(-2.2 * s, 0, 2.2 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2a1a12";
    ctx.beginPath(); ctx.ellipse(4.6 * s, 0, 1.4 * s, 11 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#3a2415"; ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.ellipse(1.2 * s, 0, 9.6 * s, 11.8 * s, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#e8c8a0";
    ctx.beginPath(); ctx.moveTo(-8 * s, 0); ctx.lineTo(-16 * s, -6 * s + wob * 4); ctx.lineTo(-16 * s, 6 * s - wob * 4); ctx.closePath(); ctx.fill();
    drawFishEye(s, 6.8, -1.6, look.x, look.y);
  }
  function drawOctopus(s, t, wob, look) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      const wave = Math.sin(t * 3.4 + i) * 4;
      ctx.strokeStyle = i % 2 ? "#a848b0" : "#c45ec8";
      ctx.lineWidth = 2.1 * Math.max(0.7, s);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 4 * s, Math.sin(a) * 3 * s + 2 * s);
      ctx.quadraticCurveTo(
        Math.cos(a) * 10 * s + wave, Math.sin(a) * 9 * s + 6 * s,
        Math.cos(a) * 14 * s + wob * 3, Math.sin(a) * 13 * s + 8 * s + wave
      );
      ctx.stroke();
      ctx.fillStyle = "#ffb0e0";
      ctx.beginPath(); ctx.arc(Math.cos(a) * 14 * s + wob * 3, Math.sin(a) * 13 * s + 8 * s + wave, 1.15 * s, 0, Math.PI * 2); ctx.fill();
    }
    const head = ctx.createRadialGradient(-1 * s, -3 * s, 2 * s, 1 * s, 1 * s, 10 * s);
    head.addColorStop(0, "#e890e0");
    head.addColorStop(0.5, "#c45ec8");
    head.addColorStop(1, "#7a3088");
    ctx.fillStyle = head;
    ctx.beginPath(); ctx.ellipse(0.8 * s, -1.2 * s, 8.8 * s, 7.6 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#3a1840"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0.8 * s, -1.2 * s, 8.8 * s, 7.6 * s, 0, 0, Math.PI * 2); ctx.stroke();
    drawFishEye(s, 3.6, -2.4, look.x, look.y);
    ctx.save(); ctx.scale(-1, 1);
    drawFishEye(s, 2.2, -2.4, -look.x, look.y);
    ctx.restore();
  }
  function drawCrab(s, t, wob, look) {
    ctx.fillStyle = "#c4483a";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 6 * s, 1 * s);
      ctx.lineTo(side * 14 * s, -6 * s + wob * 2);
      ctx.lineTo(side * 12 * s, 2 * s);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#5a1810"; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(side * 5 * s, 3 * s);
      ctx.lineTo(side * 13 * s, 8 * s + wob);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(side * 4 * s, 4 * s);
      ctx.lineTo(side * 11 * s, 10 * s - wob);
      ctx.stroke();
    }
    const shell = ctx.createRadialGradient(-1 * s, -2 * s, 2 * s, 0, 1 * s, 10 * s);
    shell.addColorStop(0, "#ff8a6a");
    shell.addColorStop(0.5, "#e85d4c");
    shell.addColorStop(1, "#8a2818");
    ctx.fillStyle = shell;
    ctx.beginPath(); ctx.ellipse(0, 0.6 * s, 9.4 * s, 6.4 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#5a1810"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0, 0.6 * s, 9.4 * s, 6.4 * s, 0, 0, Math.PI * 2); ctx.stroke();
    drawFishEye(s, -3.2, -2.2, look.x, look.y);
    drawFishEye(s, 3.2, -2.2, look.x, look.y);
  }
  function drawSquid(s, t, wob, look) {
    ctx.strokeStyle = "#5aa8c0"; ctx.lineWidth = 1.7 * Math.max(0.7, s); ctx.lineCap = "round";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 1.6 * s, 6 * s);
      ctx.quadraticCurveTo(i * 2.4 * s + wob * 4, 12 * s, i * 1.2 * s, 16 * s + Math.sin(t * 5 + i) * 2);
      ctx.stroke();
    }
    const body = ctx.createLinearGradient(0, -12 * s, 0, 8 * s);
    body.addColorStop(0, "#d8f4ff");
    body.addColorStop(0.4, "#7ad0e8");
    body.addColorStop(1, "#2a6a80");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0.4 * s, -1.2 * s, 6.2 * s, 11.6 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffe8a8";
    ctx.beginPath(); ctx.ellipse(0.4 * s, 2.4 * s, 3.4 * s, 2.6 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#143040"; ctx.lineWidth = 1.15;
    ctx.beginPath(); ctx.ellipse(0.4 * s, -1.2 * s, 6.2 * s, 11.6 * s, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#9ee0f0";
    ctx.beginPath(); ctx.moveTo(-4 * s, -10 * s); ctx.lineTo(0.4 * s, -16 * s + wob * 2); ctx.lineTo(4.8 * s, -10 * s); ctx.closePath(); ctx.fill();
    drawFishEye(s, 2.4, -4.6, look.x, look.y);
    ctx.save(); ctx.scale(-1, 1);
    drawFishEye(s, 1.6, -4.6, -look.x, look.y);
    ctx.restore();
  }
  function drawDolphin(s, t, wob, look) {
    ctx.fillStyle = "#6a90b8";
    ctx.beginPath();
    ctx.moveTo(-2 * s, -6 * s);
    ctx.quadraticCurveTo(2 * s, -16 * s + wob * 3, 8 * s, -6 * s);
    ctx.lineTo(1 * s, -5 * s);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#5a80a8";
    ctx.beginPath();
    ctx.moveTo(-14 * s, 0);
    ctx.lineTo(-24 * s, -6 * s + wob * 4);
    ctx.quadraticCurveTo(-20 * s, 0, -24 * s, 6 * s - wob * 4);
    ctx.closePath(); ctx.fill();
    const body = ctx.createLinearGradient(0, -7 * s, 0, 6 * s);
    body.addColorStop(0, "#c8dcec");
    body.addColorStop(0.45, "#7aa0c8");
    body.addColorStop(1, "#3a5878");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0.8 * s, 0, 15.6 * s, 6.4 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath(); ctx.ellipse(2 * s, 2.6 * s, 9 * s, 2.6 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1a3048"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0.8 * s, 0, 15.6 * s, 6.4 * s, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#7aa0c8";
    ctx.beginPath();
    ctx.moveTo(12 * s, -0.6 * s);
    ctx.lineTo(19.4 * s, -1.4 * s);
    ctx.lineTo(12.2 * s, 1.4 * s);
    ctx.closePath(); ctx.fill();
    drawFishEye(s, 10.4, -1.4, look.x, look.y);
  }
  function drawWhaleShark(s, t, wob, look) {
    ctx.fillStyle = "#3a5460";
    ctx.beginPath();
    ctx.moveTo(-4 * s, -5 * s);
    ctx.quadraticCurveTo(2 * s, -14 * s + wob * 2, 10 * s, -5 * s);
    ctx.lineTo(1 * s, -4 * s);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#2a404c";
    ctx.beginPath();
    ctx.moveTo(-16 * s, 0);
    ctx.lineTo(-28 * s, -7 * s + wob * 3);
    ctx.quadraticCurveTo(-22 * s, 0, -28 * s, 7 * s - wob * 3);
    ctx.closePath(); ctx.fill();
    const body = ctx.createLinearGradient(0, -8 * s, 0, 8 * s);
    body.addColorStop(0, "#7a96a4");
    body.addColorStop(0.45, "#4a6a78");
    body.addColorStop(1, "#243848");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0.4 * s, 0, 18.4 * s, 7.4 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(0.4 * s, 0, 18.4 * s, 7.4 * s, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "#fff6e8";
    for (let i = 0; i < 14; i++) {
      const ox = -10 + (i % 7) * 3.4;
      const oy = -2.6 + ((i / 7) | 0) * 3.6;
      ctx.beginPath(); ctx.arc(ox * s, oy * s, 0.7 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#1a2830";
    ctx.fillRect(8 * s, -2.4 * s, 10 * s, 1.1 * s);
    ctx.restore();
    ctx.strokeStyle = "#122028"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.ellipse(0.4 * s, 0, 18.4 * s, 7.4 * s, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath(); ctx.ellipse(2 * s, 3.2 * s, 10 * s, 2.2 * s, 0, 0, Math.PI * 2); ctx.fill();
    drawFishEye(s, 12.6, -1.6, look.x, look.y);
  }
  function drawFishBody(sp, x, y, ang, scale, t) {
    const s0 = scale || 1;
    const rates = [10, 14, 6.2, 7.2, 4, 5.4, 4.6, 8.2, 3.4, 9, 12, 6.4, 3.2];
    const amts = [0.12, 0.2, 0.16, 0.1, 0.08, 0.1, 0.08, 0.14, 0.1, 0.16, 0.18, 0.1, 0.06];
    const wob = Math.sin((t || 0) * (rates[sp.id] || 10)) * (amts[sp.id] || 0.12);
    let rot = ang;
    if (sp.id === 5) rot = ang * 0.16;
    else if (sp.id === 8) rot = ang * 0.22;
    else if (sp.id === 9) rot = ang * 0.12;
    if (blit("fish" + sp.id, x, y, { rot: rot + wob * 0.35, scale: s0 * 0.52, water: true })) return;
    ctx.save();
    ctx.translate(x, y);
    if (sp.id === 4) { drawTurtle(ang, scale, t); ctx.restore(); return; }
    if (sp.id === 8) { ctx.rotate(ang * 0.25); drawOctopus(scale, t, 0, fishLook(sp, t)); ctx.restore(); return; }
    if (sp.id === 9) { ctx.rotate(ang * 0.15); drawCrab(scale, t, Math.sin(t * 8) * 0.8, fishLook(sp, t)); ctx.restore(); return; }
    ctx.rotate(ang);
    const s = scale;
    const look = fishLook(sp, t);
    if (sp.id === 0) drawClownfish(s, t, wob, look);
    else if (sp.id === 1) drawBlueTang(s, t, wob, look);
    else if (sp.id === 2) drawGoldfish(s, t, wob, look);
    else if (sp.id === 3) drawKoi(s, t, wob, look);
    else if (sp.id === 5) drawSeahorse(s, t, wob, look);
    else if (sp.id === 6) drawPuffer(s, t, wob, look);
    else if (sp.id === 7) drawAngelfish(s, t, wob, look);
    else if (sp.id === 10) drawSquid(s, t, wob, look);
    else if (sp.id === 11) drawDolphin(s, t, wob, look);
    else if (sp.id === 12) drawWhaleShark(s, t, wob, look);
    else drawKoi(s, t, wob, look);
    ctx.restore();
  }
  function drawCarryParcel(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.18);
    ctx.fillStyle = "#c4894a";
    roundRect(-7, -6, 14, 11, 2); ctx.fill();
    ctx.strokeStyle = "#8b5a2b"; ctx.lineWidth = 1.1;
    roundRect(-7, -6, 14, 11, 2); ctx.stroke();
    ctx.strokeStyle = "#ffe27a"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.stroke();
    ctx.restore();
  }
  function drawPerson(x, y, opt) {
    const hop = opt.buyHop > 0 ? Math.sin((1 - opt.buyHop / 0.55) * Math.PI) * 7 : 0;
    const bounce = opt.idle === "bounce" ? 3.5 : 2.2;
    const bob = Math.sin(opt.bob || 0) * bounce - hop;
    const walk = Math.sin((opt.bob || 0) * 1.6);
    const squash = 1 + walk * 0.07 + (hop ? 0.08 : 0);
    shadow(x, y + 4, opt.kid ? 8 : 10.5, opt.kid ? 3.6 : 4.6);
    const spr = blit(custSpriteName(opt), x, y + bob, {
      flip: (opt.vx || 0) < -8,
      scale: (opt.kid ? 0.5 : 0.58) * (1 + walk * 0.03),
    });
    ctx.save();
    ctx.translate(x, y + bob);
    if (spr) {
      if (opt.cart) {
        ctx.fillStyle = "#c4894a";
        roundRect(14, 2, 18, 12, 3); ctx.fill();
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(15, -1, 16, 4);
        ctx.fillStyle = "#2a2a32";
        ctx.beginPath(); ctx.arc(18, 14, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(28, 14, 2.4, 0, Math.PI * 2); ctx.fill();
      }
      if (opt.carry >= 0) drawCarryParcel(16, -6);
      if (opt.idle === "whistle" && Math.sin(state.time * 2.2 + (opt.bob || 0)) > 0.35) {
        ctx.fillStyle = "#2a1a12";
        ctx.font = "800 11px Fredoka, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("♪", 14, -36);
      }
    } else {
    if (opt.kid) ctx.scale(0.82, 0.82);
    else ctx.scale(1.08, 1.08);
    ctx.scale(1 / Math.sqrt(Math.max(0.85, squash)), squash);
    ctx.fillStyle = "#3a3a48";
    fillCapsule(-5.2, 8, -4.6, 17.2 + walk * 2.2, 2.4);
    fillCapsule(4.8, 8, 5.2, 17.2 - walk * 2.2, 2.4);
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath(); ctx.ellipse(-4.6, 17.6 + walk * 2.2, 3.2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(5.2, 17.6 - walk * 2.2, 3.2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    const swing = walk * 6;
    const waving = (opt.wave || 0) > 0 && !(opt.carry >= 0);
    const waveAmt = waving ? 1.15 + 0.55 * Math.sin(state.time * 10) : 0;
    ctx.fillStyle = opt.skin;
    ctx.save(); ctx.translate(-10, -1); ctx.rotate(0.12 + swing * 0.07);
    fillCapsule(0, 0, 0.2, waving ? 12 : 10, 2.1); ctx.restore();
    ctx.save(); ctx.translate(10, -1); ctx.rotate(-0.12 - swing * 0.07 - waveAmt);
    fillCapsule(0, 0, -0.2, waving ? 12 : 10, 2.1); ctx.restore();
    const shirtG = ctx.createLinearGradient(-6, -8, 8, 12);
    shirtG.addColorStop(0, opt.shirt);
    shirtG.addColorStop(1, "rgba(20,12,8,0.22)");
    ctx.fillStyle = shirtG;
    roundRect(-10, -7, 20, 17, 6); ctx.fill();
    ctx.fillStyle = "rgba(255,230,180,0.12)";
    ctx.beginPath(); ctx.ellipse(-2, -3, 6, 4, -0.3, 0, Math.PI * 2); ctx.fill();
    if (opt.hawaii) {
      ctx.fillStyle = "#ffd24a"; ctx.beginPath(); ctx.arc(-3, 0, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(4, 3, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e85d4c"; ctx.beginPath(); ctx.arc(2, -2, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = opt.skin;
    fillCapsule(0, -8, 0, -13.2, 2.35);
    ctx.beginPath(); ctx.ellipse(0, -16.2, 7.4, 8.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,220,180,0.16)";
    ctx.beginPath(); ctx.ellipse(-1.6, -17.4, 3.4, 2.4, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = opt.hair;
    const cut = opt.hairCut | 0;
    if (cut === 1) {
      ctx.beginPath(); ctx.arc(-2, -17, 7.4, Math.PI * 0.85, Math.PI * 2.05); ctx.fill();
      ctx.beginPath(); ctx.ellipse(6, -15, 3.2, 4.2, 0.3, 0, Math.PI * 2); ctx.fill();
    } else if (cut === 2) {
      ctx.beginPath(); ctx.arc(0, -18.5, 6.4, Math.PI, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-5, -16, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(5, -16, 3.4, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, -17, 7.2, Math.PI, Math.PI * 2); ctx.fill();
    }
    if (opt.crown) {
      ctx.fillStyle = "#ffd24a";
      ctx.beginPath();
      ctx.moveTo(-7.4, -20);
      ctx.lineTo(-7.2, -29);
      ctx.lineTo(-3.2, -23.5);
      ctx.lineTo(0, -31);
      ctx.lineTo(3.2, -23.5);
      ctx.lineTo(7.2, -29);
      ctx.lineTo(7.4, -20);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#e85d4c";
      ctx.beginPath(); ctx.arc(0, -29.2, 1.5, 0, Math.PI * 2); ctx.fill();
    } else if (opt.sailor) {
      ctx.fillStyle = "#f4efe6";
      ctx.fillRect(-6.4, -26.4, 12.8, 6.2);
      ctx.fillStyle = "#1b3a6b";
      ctx.beginPath(); ctx.ellipse(0, -20.2, 10.4, 2.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-2.1, -28.4, 4.2, 3.2);
    } else if (opt.visor) {
      ctx.fillStyle = opt.hat === true ? "#e85d4c" : (opt.hat || "#e85d4c");
      ctx.fillRect(-6.2, -21.8, 12.4, 3.4);
      ctx.beginPath(); ctx.ellipse(4.2, -18.8, 8.2, 2.3, 0.12, 0, Math.PI * 2); ctx.fill();
    } else if (opt.hat) {
      ctx.fillStyle = opt.hat === true ? "#c4483a" : opt.hat;
      ctx.beginPath(); ctx.ellipse(0, -21, 9.5, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-6.5, -26, 13, 6);
    }
    if (opt.idle === "whistle" && !waving && Math.sin(state.time * 2.2 + (opt.bob || 0)) > 0.35) {
      ctx.fillStyle = "#2a1a12";
      ctx.font = "800 11px Fredoka, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("♪", 11, -26);
    }
    ctx.fillStyle = "#2a1a12";
    const glance = clamp(opt.glance || 0, -1, 1);
    ctx.beginPath(); ctx.arc(-2.4 + glance * 1.7, -16.2, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2.6 + glance * 1.7, -16.2, 1.1, 0, Math.PI * 2); ctx.fill();
    if (opt.sunglasses) {
      ctx.fillStyle = "#1a1a22";
      roundRect(-6.4, -18.6, 12.8, 3.6, 1.4); ctx.fill();
      ctx.fillStyle = "#3a4860";
      ctx.fillRect(-5.6, -18.0, 5, 2.4);
      ctx.fillRect(0.6, -18.0, 5, 2.4);
    }
    if (opt.cart) {
      ctx.fillStyle = "#c4894a";
      roundRect(11, 4, 18, 12, 3); ctx.fill();
      ctx.fillStyle = "#8b5a2b";
      ctx.fillRect(12, 1, 16, 4);
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath(); ctx.arc(15, 16, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(25, 16, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    if (opt.carry >= 0) drawCarryParcel(14, -2);
    }
    if (talkVisible(opt)) {
      let ox = opt.emoteOff || 0;
      const label = String(opt.emote);
      const gold = isGoldTalk(label);
      const tint = gold ? (REGULAR_TINTS[opt.name] || null) : null;
      const tangTalk = /tang/i.test(label);
      drawSpeech(opt, () => {
        let ey = gold ? -56 : -40;
        let alpha = 1;
        let bx = ox;
        if (tangTalk) {
          bx += (bx >= 0 ? 38 : -38);
          ey = -12;
          const tank = TANK_POS[opt.tank != null ? opt.tank : 1];
          if (tank && !state.unlocked[opt.tank != null ? opt.tank : 1]) {
            const overCard = opt.y != null
              ? (opt.y - 48 < tank.y + TANK_H + 8)
              : true;
            if (overCard) { ey = 18; alpha = 0.82; }
          }
        }
        const pulse = gold ? 1 + 0.08 * Math.sin(state.time * 7) : 1;
        const bw = Math.max(28, label.length * (gold ? 10.2 : 8) + (gold ? 22 : 10)) * pulse;
        const bh = gold ? 26 : 16;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = tint ? tint.fill : gold ? "rgba(255, 236, 170, 0.96)" : "rgba(255,255,255,0.94)";
        roundRect(-bw / 2 + bx, ey, bw, bh, 8); ctx.fill();
        if (gold) {
          ctx.strokeStyle = tint ? tint.stroke : "rgba(200, 140, 30, 0.55)";
          ctx.lineWidth = 2;
          roundRect(-bw / 2 + bx, ey, bw, bh, 8); ctx.stroke();
        }
        ctx.fillStyle = tint ? tint.ink : "#2a1a12";
        ctx.font = (gold ? "800 16px" : "800 12px") + " Fredoka, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(label, bx, ey + (gold ? 18 : 12));
        ctx.restore();
      }, () => {
        ctx.save();
        ctx.globalAlpha = 0.42;
        ctx.fillStyle = tint ? tint.stroke : gold ? "rgba(232, 192, 74, 0.7)" : "rgba(255,255,255,0.55)";
        ctx.beginPath(); ctx.arc(ox, -32, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
    }
    ctx.restore();
  }
  function drawWetsuitMarks() {
    ctx.fillStyle = "#ffd24a";
    ctx.beginPath(); ctx.arc(-3.2, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e85d4c";
    ctx.beginPath(); ctx.arc(-3.2, 0, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#7ad08a";
    ctx.beginPath(); ctx.ellipse(5.2, 4, 3.4, 1.6, 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath(); ctx.arc(3.2, -2.2, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(10,30,36,0.35)"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath(); ctx.ellipse(-3.4, -4.2, 4.6, 2.4, -0.4, 0, Math.PI * 2); ctx.fill();
  }
  function drawMaskVisor(cx, cy, rx, ry, swim) {
    ctx.fillStyle = "#1a2830";
    ctx.beginPath(); ctx.ellipse(cx, cy, rx + 1.15, ry + 0.9, 0, 0, Math.PI * 2); ctx.fill();
    const glass = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
    glass.addColorStop(0, swim ? "rgba(90,210,230,0.62)" : "rgba(70,190,220,0.42)");
    glass.addColorStop(0.45, swim ? "rgba(20,90,130,0.38)" : "rgba(30,100,140,0.28)");
    glass.addColorStop(1, "rgba(8,28,48,0.45)");
    ctx.fillStyle = glass;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#0e1c24"; ctx.lineWidth = 1.7;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.15;
    ctx.beginPath(); ctx.ellipse(cx - rx * 0.28, cy - ry * 0.38, rx * 0.38, ry * 0.24, -0.35, 0, Math.PI * 2); ctx.stroke();
  }
  function drawSnorkel(ax, ay, tipX, tipY) {
    ctx.strokeStyle = "#c4483a"; ctx.lineWidth = 2.35; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(tipX, tipY); ctx.lineTo(tipX - 3.2, tipY - 1.6); ctx.stroke();
    ctx.lineCap = "butt";
    ctx.fillStyle = "#e85d4c";
    ctx.beginPath(); ctx.arc(tipX - 3.2, tipY - 1.6, 2.05, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.beginPath(); ctx.arc(tipX - 3.8, tipY - 2.2, 0.7, 0, Math.PI * 2); ctx.fill();
  }
  function drawPlayer(x, y, pose) {
    const p = pose || player;
    const skin = normalizeSkin(p.skin != null ? p.skin : state.skin);
    const vx = p.vx != null ? p.vx : 0;
    const vy = p.vy != null ? p.vy : 0;
    const facing = p.facing != null ? p.facing : 0;
    const walkPhase = p.walkPhase != null ? p.walkPhase : 0;
    const leanAmt = p.lean != null ? p.lean : 0;
    const bobT = p.bob != null ? p.bob : 0;
    const sp = Math.hypot(vx, vy);
    const moving = sp > 28;
    const phase = moving ? walkPhase : bobT * 0.7;
    const bob = Math.sin(phase) * (moving ? 3.4 : 1.4);
    const walk = Math.sin(phase * 1.15);
    const swing = Math.sin(phase) * (moving ? 0.55 : 0.18);
    const flip = Math.cos(facing) < -0.12 ? -1 : 1;
    const lean = leanAmt * flip;
    const short = skin === "reef" ? 0.98 : skin === "dino" ? 1.02 : 1.1;
    shadow(x, y + 5, moving ? 13 : 11, moving ? 5.4 : 4.6);
    const frame = moving && Math.sin(phase) > 0 ? "walk" : "stand";
    if (blit(skin + "_" + frame, x, y + bob, { flip: flip < 0, rot: lean * 0.28, scale: 0.42 * short })) return;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(flip * short, short);
    ctx.rotate(lean * 0.55 + (moving ? walk * 0.04 : 0));
    if (skin === "dino") {
      drawLimbChain(-4.6, 8, 0.12 + walk * 0.42, 8.4, walk * 0.32, 8.2, 2.7, "#2a6a34", "#1e4a24");
      drawLimbChain(4.8, 8, 0.12 - walk * 0.42, 8.4, -walk * 0.32, 8.2, 2.7, "#2a6a34", "#1e4a24");
      ctx.fillStyle = "#1e4a24";
      ctx.beginPath(); ctx.ellipse(-4.2, 24.2 + walk * 3.4, 3.8, 1.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5.2, 24.2 - walk * 3.4, 3.8, 1.7, 0, 0, Math.PI * 2); ctx.fill();
      drawLimbChain(-11, 1, 0.28 + swing, 7.2, 0.35, 6.4, 2.35, "#3d9a4a", "#2a6a34");
      drawLimbChain(11, 1, -0.28 - swing, 7.2, -0.35, 6.4, 2.35, "#3d9a4a", "#2a6a34");
      const dinoBody = ctx.createLinearGradient(-4, -10, 8, 12);
      dinoBody.addColorStop(0, "#62c86e");
      dinoBody.addColorStop(0.5, "#46b35a");
      dinoBody.addColorStop(1, "#2f7a3a");
      ctx.fillStyle = dinoBody;
      ctx.beginPath();
      ctx.moveTo(-11, -8);
      ctx.quadraticCurveTo(-13, 2, -9, 12);
      ctx.lineTo(9, 12);
      ctx.quadraticCurveTo(13, 2, 11, -8);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#2f7a3a";
      ctx.beginPath(); ctx.ellipse(-4, -1, 2.2, 1.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5, 3, 2.5, 1.7, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#cfd8e3";
      roundRect(-17, -9, 8, 16, 3); ctx.fill();
      ctx.fillStyle = "#8aa0b5"; ctx.fillRect(-15.2, -9, 3.4, 16);
      ctx.fillStyle = "#46b35a";
      ctx.save(); ctx.translate(-10, 6); ctx.rotate(-0.55 + walk * 0.18);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.quadraticCurveTo(-10, 4, -17, 1);
      ctx.quadraticCurveTo(-9, 10, 1, 5); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(moving ? 1.4 : 0, 0);
      ctx.rotate(lean * 0.2);
      ctx.fillStyle = "#3d9a4a";
      fillCapsule(0, -9, 0, -13.4, 2.5);
      ctx.fillStyle = "#46b35a";
      ctx.beginPath(); ctx.ellipse(0, -18.2, 8.2, 8.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(8.8, -16.2, 5.8, 3.5, 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2a1a12";
      ctx.beginPath(); ctx.arc(-2.4, -18.4, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(2.6, -18.2, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff6e8";
      ctx.beginPath(); ctx.arc(-3.1, -19.2, 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(11.0, -16.2, 1.15, 0, Math.PI * 2); ctx.fill();
      drawMaskVisor(1.4, -18.6, 5.4, 3.5, false);
      drawSnorkel(4.2, -22.8, 6.2, -31.4);
      ctx.restore();
    } else {
      const suitDark = "#1b4a52";
      const suitMid = "#2a9d8f";
      drawLimbChain(-4.8, 8, 0.14 + walk * 0.48, 8.6, 0.22 + walk * 0.28, 8.8, 2.9, "#243848", suitDark);
      drawLimbChain(5.0, 8, 0.14 - walk * 0.48, 8.6, 0.22 - walk * 0.28, 8.8, 2.9, "#243848", suitDark);
      ctx.fillStyle = "#1a2430";
      ctx.beginPath(); ctx.ellipse(-4.4, 25.2 + walk * 3.6, 3.7, 1.65, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5.4, 25.2 - walk * 3.6, 3.7, 1.65, 0, 0, Math.PI * 2); ctx.fill();
      drawLimbChain(-11.4, -1, 0.32 + swing, 7.8, 0.28, 7.2, 2.55, "#f0c2a0", "#e8b090");
      drawLimbChain(11.4, -1, -0.32 - swing, 7.8, -0.28, 7.2, 2.55, "#f0c2a0", "#e8b090");
      const suit = ctx.createLinearGradient(-6, -10, 8, 12);
      suit.addColorStop(0, "#4ad4c4");
      suit.addColorStop(0.4, suitMid);
      suit.addColorStop(1, "#1b6e66");
      ctx.fillStyle = suit;
      ctx.beginPath();
      ctx.moveTo(-11.5, -8);
      ctx.quadraticCurveTo(-13.5, 1, -8.5, 12);
      ctx.lineTo(8.5, 12);
      ctx.quadraticCurveTo(13.5, 1, 11.5, -8);
      ctx.closePath(); ctx.fill();
      drawWetsuitMarks();
      ctx.save();
      ctx.translate(moving ? 1.6 : 0, 0);
      ctx.rotate(lean * 0.2);
      ctx.fillStyle = "#f0c2a0";
      fillCapsule(0, -8.2, 0, -13.6, 2.45);
      ctx.beginPath(); ctx.ellipse(0, -18.6, 7.6, 8.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-7.6, -17.2, 2.05, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(7.6, -17.2, 2.05, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,220,180,0.2)";
      ctx.beginPath(); ctx.ellipse(-1.8, -20, 3.6, 2.4, -0.3, 0, Math.PI * 2); ctx.fill();
      if (skin === "reef") {
        ctx.fillStyle = "#5a2a14";
        ctx.beginPath(); ctx.arc(0, -21.6, 8.2, Math.PI * 0.92, Math.PI * 2.12); ctx.fill();
        ctx.beginPath(); ctx.ellipse(-7.6, -17.2, 3.5, 5.2, -0.35, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(7.4, -18.4, 3.1, 6.0, 0.4, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.translate(-8.2, -11.2); ctx.rotate(-0.35 + walk * 0.12);
        ctx.beginPath(); ctx.ellipse(0, 7, 3.1, 7.2, 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#e85d4c";
        ctx.beginPath(); ctx.arc(6.2, -23.6, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffe27a";
        ctx.beginPath(); ctx.arc(6.2, -23.6, 0.7, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "#3a2415";
        ctx.beginPath(); ctx.arc(0, -21.4, 7.6, Math.PI, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-5.2, -19.4, 3.0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(5.0, -20.2, 2.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#2a1a12";
      ctx.beginPath(); ctx.arc(-2.5, -17.8, 1.15, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(2.7, -17.8, 1.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(-3.1, -18.5, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#c48a6a"; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(0, -15.6, 2.1, 0.2, Math.PI - 0.2); ctx.stroke();
      drawMaskVisor(0.3, -22.4, 5.7, 2.7, false);
      drawSnorkel(5.6, -24.2, 7.8, -32.4);
      ctx.restore();
    }
    ctx.restore();
  }
  function drawDiver(x, y, ang, t, skinId) {
    const skin = normalizeSkin(skinId != null ? skinId : state.skin);
    shadow(x, y + 6, 12, 5);
    const sway = Math.sin(t * 11) * 0.06;
    if (blit(skin + "_dive", x, y, { rot: ang + sway, scale: 0.5 })) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    const kick = Math.sin(t * 11) * 0.48;
    const stroke = Math.sin(t * 7.5) * 0.22;
    const fin = skin === "dino" ? "#3d9a4a" : "#f0b429";
    const finEdge = skin === "dino" ? "#1e4a24" : "#8a6a10";
    function kickFin(side) {
      ctx.save();
      ctx.rotate(side * (0.28 + kick));
      ctx.fillStyle = fin;
      ctx.beginPath();
      ctx.moveTo(-12, side * 2.4);
      ctx.lineTo(-30, side * 12);
      ctx.quadraticCurveTo(-33, side * 2, -28, side * 0.6);
      ctx.lineTo(-13, side * 1.0);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = finEdge; ctx.lineWidth = 1.05; ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.beginPath(); ctx.ellipse(-21, side * 5, 5.4, 1.5, 0.2 * side, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    drawLimbChain(-2, 4, Math.PI * 0.92 + kick * 0.35, 8, kick * 0.4, 7, 2.4, skin === "dino" ? "#2a6a34" : "#243848");
    drawLimbChain(2, 4, -Math.PI * 0.92 - kick * 0.35, 8, -kick * 0.4, 7, 2.4, skin === "dino" ? "#2a6a34" : "#243848");
    kickFin(1);
    kickFin(-1);
    if (skin === "dino") {
      ctx.fillStyle = "#cfd8e3";
      roundRect(-13, -8, 9, 16, 3); ctx.fill();
      ctx.fillStyle = "#8aa0b5"; ctx.fillRect(-11, -8, 3.6, 16);
      const db = ctx.createLinearGradient(-4, -10, 10, 10);
      db.addColorStop(0, "#62c86e");
      db.addColorStop(1, "#2f7a3a");
      ctx.fillStyle = db;
      ctx.beginPath();
      ctx.ellipse(2, 0, 12, 9.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2f7a3a";
      ctx.beginPath(); ctx.ellipse(-1, 1, 2.2, 1.5, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5, -3, 1.8, 1.3, 0, 0, Math.PI * 2); ctx.fill();
      drawLimbChain(4, -6, -1.15 + stroke, 7, -0.4, 6, 2.2, "#3d9a4a");
      drawLimbChain(4, 6, 1.15 - stroke, 7, 0.4, 6, 2.2, "#3d9a4a");
      ctx.fillStyle = "#3d9a4a";
      fillCapsule(10, 0, 13.6, 0, 2.3);
      ctx.fillStyle = "#46b35a";
      ctx.beginPath(); ctx.ellipse(16.4, 0, 7.0, 6.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(21.2, 1.2, 5.4, 3.2, 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2a1a12";
      ctx.beginPath(); ctx.arc(15.4, -1.4, 1.05, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(18.4, -0.8, 1.05, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff6e8";
      ctx.beginPath(); ctx.arc(22.6, 0.8, 1.05, 0, Math.PI * 2); ctx.fill();
      drawMaskVisor(18.0, -0.5, 5.0, 3.5, true);
      drawSnorkel(19.2, -3.4, 21.4, -13.6);
    } else {
      ctx.fillStyle = "#cfd8e3";
      roundRect(-12, -10, 10, 20, 3); ctx.fill();
      ctx.fillStyle = "#8aa0b5"; ctx.fillRect(-10, -10, 4, 20);
      const sb = ctx.createLinearGradient(-4, -10, 10, 10);
      sb.addColorStop(0, "#3ec4b4");
      sb.addColorStop(1, "#1b4d6b");
      ctx.fillStyle = sb;
      ctx.beginPath();
      ctx.ellipse(2, 0, 11.6, skin === "reef" ? 8.2 : 9.0, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.beginPath(); ctx.ellipse(2, -3.2, 6, 2.4, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2a9d8f"; ctx.fillRect(-1, -5, 11, 4);
      drawLimbChain(4, -6.2, -1.2 + stroke, 7.4, -0.35, 6.2, 2.25, "#f0c2a0");
      drawLimbChain(4, 6.2, 1.2 - stroke, 7.4, 0.35, 6.2, 2.25, "#f0c2a0");
      ctx.fillStyle = "#f0c2a0";
      fillCapsule(11, 0, 14.2, 0, 2.2);
      ctx.beginPath(); ctx.ellipse(17.2, 0, skin === "reef" ? 6.4 : 7.0, 6.8, 0, 0, Math.PI * 2); ctx.fill();
      if (skin === "reef") {
        ctx.fillStyle = "#5a2a14";
        ctx.beginPath(); ctx.arc(15.6, -3.2, 5.4, Math.PI * 0.7, Math.PI * 1.85); ctx.fill();
        ctx.beginPath(); ctx.ellipse(13.4, 3.6, 2.6, 4.2, 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#e85d4c";
        ctx.beginPath(); ctx.arc(14.4, -6.4, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      drawMaskVisor(19.4, -0.2, 5.0, 3.6, true);
      drawSnorkel(20.8, -3.2, 23.0, -13.8);
    }
    ctx.restore();
  }
  function drawPot(x, y, leaf, sc) {
    const s = sc || 1;
    groundBlob(x, y + 18 * s, 13 * s, 4.2 * s);
    ctx.fillStyle = "#c45c3a";
    ctx.beginPath();
    ctx.moveTo(x - 12 * s, y); ctx.lineTo(x + 12 * s, y); ctx.lineTo(x + 8 * s, y + 18 * s); ctx.lineTo(x - 8 * s, y + 18 * s);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = leaf;
    ctx.beginPath(); ctx.ellipse(x, y - 8 * s, 14 * s, 16 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2e7a40";
    ctx.beginPath(); ctx.ellipse(x - 8 * s, y - 2 * s, 8 * s, 10 * s, -0.4, 0, Math.PI * 2); ctx.fill();
  }
  function drawCrate(x, y, w, h) {
    groundBlob(x + w / 2, y + h + 3, w * 0.46, 5);
    const cell = plankCell((x + y) | 0);
    if (ART.ready && cell) {
      ctx.save();
      roundRect(x, y, w, h, 3); ctx.clip();
      ctx.drawImage(ART.img, cell.x, cell.y, cell.w, cell.h, x - 2, y - 2, w + 4, h + 4);
      ctx.restore();
    } else {
      ctx.fillStyle = "#b07a3a";
      roundRect(x, y, w, h, 3); ctx.fill();
    }
    ctx.strokeStyle = "#7a4e1e"; ctx.lineWidth = 2;
    roundRect(x, y, w, h, 3); ctx.stroke();
    ctx.strokeStyle = "rgba(90,50,16,0.45)";
    ctx.beginPath(); ctx.moveTo(x + 6, y + h / 2); ctx.lineTo(x + w - 6, y + h / 2); ctx.stroke();
    ctx.fillStyle = "rgba(212, 160, 90, 0.55)";
    ctx.fillRect(x + 4, y + 3, w - 8, 4);
  }
  function drawCrateStack(x, y) {
    drawCrate(x, y, 42, 28);
    drawCrate(x + 10, y - 22, 38, 26);
  }
  function drawLifeRing(x, y) {
    groundBlob(x, y + 18, 16, 5);
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "#e85d4c"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#fff6e8"; ctx.lineWidth = 8;
    ctx.setLineDash([8, 8]); ctx.lineDashOffset = 4;
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#c4483a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  function drawBaitShack(x, y) {
    groundBlob(x + 4, y + 78, 56, 13);
    ctx.fillStyle = "#8a4a22";
    roundRect(x - 40, y + 18, 88, 58, 4); ctx.fill();
    if (ART.ready && ATLAS.plank) {
      ctx.save();
      roundRect(x - 40, y + 18, 88, 58, 4); ctx.clip();
      ctx.globalAlpha = 0.55;
      ctx.drawImage(ART.img, ATLAS.plank.x, ATLAS.plank.y, ATLAS.plank.w, ATLAS.plank.h, x - 42, y + 16, 92, 62);
      ctx.restore();
    }
    ctx.fillStyle = "#6b3416";
    ctx.fillRect(x - 38, y + 22, 8, 52);
    ctx.fillRect(x + 34, y + 22, 8, 52);
    ctx.fillStyle = "#c4483a";
    ctx.beginPath();
    ctx.moveTo(x - 50, y + 22);
    ctx.lineTo(x, y - 8);
    ctx.lineTo(x + 50, y + 22);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#e8c04a";
    ctx.fillRect(x - 48, y + 20, 96, 4);
    ctx.fillStyle = "#3a2415";
    roundRect(x - 10, y + 40, 22, 34, 3); ctx.fill();
    ctx.fillStyle = "#6b3a18";
    roundRect(x - 32, y + 36, 16, 14, 2); ctx.fill();
    ctx.strokeStyle = "#e8c04a"; ctx.lineWidth = 1.4;
    roundRect(x - 32, y + 36, 16, 14, 2); ctx.stroke();
    ctx.fillStyle = "#fff6e8";
    ctx.font = "800 9px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BAIT", x, y + 14);
    ctx.fillStyle = "#2a7d8a";
    ctx.beginPath(); ctx.ellipse(x + 28, y + 52, 7, 10, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9ef0ff";
    ctx.beginPath(); ctx.ellipse(x + 28, y + 50, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
  function drawVending(x, y) {
    groundBlob(x + 2, y + 78, 22, 7);
    ctx.fillStyle = "#2a4a58";
    roundRect(x - 18, y, 40, 76, 5); ctx.fill();
    ctx.fillStyle = "#1a3038";
    roundRect(x - 14, y + 8, 32, 40, 3); ctx.fill();
    const cols = ["#e85d4c", "#3d8bfd", "#f0b429", "#7ad08a"];
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath();
      ctx.arc(x - 6 + (i % 2) * 14, y + 16 + ((i / 2) | 0) * 8, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#0a181c";
    roundRect(x - 10, y + 52, 24, 10, 2); ctx.fill();
    ctx.fillStyle = "#ffe27a";
    ctx.font = "800 8px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("POP", x + 2, y + 60);
    ctx.fillStyle = "#7dffa0";
    ctx.fillRect(x + 14, y + 64, 4, 6);
  }
  function drawBench(x, y) {
    groundBlob(x + 40, y + 30, 38, 7);
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(x + 6, y + 16, 6, 14);
    ctx.fillRect(x + 68, y + 16, 6, 14);
    ctx.fillStyle = "#c4894a";
    roundRect(x, y, 80, 12, 3); ctx.fill();
    ctx.fillStyle = "#a87438";
    roundRect(x + 2, y - 10, 76, 8, 2); ctx.fill();
  }
  function drawUrn(x, y, sc, col) {
    const s = sc || 1;
    ctx.fillStyle = col || "#c47a3a";
    ctx.beginPath();
    ctx.moveTo(x - 14 * s, y);
    ctx.lineTo(x + 14 * s, y);
    ctx.quadraticCurveTo(x + 16 * s, y + 22 * s, x + 10 * s, y + 28 * s);
    ctx.lineTo(x - 10 * s, y + 28 * s);
    ctx.quadraticCurveTo(x - 16 * s, y + 22 * s, x - 14 * s, y);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#e0a05a";
    ctx.beginPath(); ctx.ellipse(x, y, 16 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(90,40,16,0.35)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(x, y + 12 * s, 11 * s, 3 * s, 0, 0, Math.PI * 2); ctx.stroke();
  }
  function drawGoldGarden(x, y) {
    ctx.fillStyle = "rgba(210, 140, 60, 0.22)";
    ctx.beginPath(); ctx.ellipse(x, y + 18, 90, 28, 0, 0, Math.PI * 2); ctx.fill();
    drawUrn(x - 36, y - 4, 1.15, "#c46a32");
    drawUrn(x + 8, y + 6, 0.85, "#d4883a");
    drawUrn(x + 42, y - 2, 1.05, "#b85a28");
    ctx.fillStyle = "#e85d6a";
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + state.time * 0.15;
      ctx.beginPath(); ctx.ellipse(x - 36 + Math.cos(a) * 5, y - 16 + Math.sin(a) * 3, 8, 3, a, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#ffd27a"; ctx.beginPath(); ctx.arc(x - 36, y - 16, 4, 0, Math.PI * 2); ctx.fill();
  }
  function drawKoiGate(x, y) {
    ctx.fillStyle = "rgba(40, 20, 16, 0.2)";
    ctx.beginPath(); ctx.ellipse(x, y + 8, 70, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c4483a";
    ctx.fillRect(x - 42, y - 96, 12, 96);
    ctx.fillRect(x + 30, y - 96, 12, 96);
    ctx.fillRect(x - 58, y - 108, 116, 12);
    ctx.fillRect(x - 48, y - 88, 96, 8);
    ctx.fillStyle = "#e8c04a";
    ctx.fillRect(x - 58, y - 111, 116, 4);
    ctx.fillRect(x - 42, y - 4, 12, 5);
    ctx.fillRect(x + 30, y - 4, 12, 5);
    ctx.fillStyle = "#8a3228";
    ctx.fillRect(x - 40, y - 70, 8, 18);
    ctx.fillRect(x + 32, y - 70, 8, 18);
    ctx.fillStyle = "#d4a06a";
    ctx.save(); ctx.translate(x + 70, y - 8); ctx.rotate(-0.18);
    ctx.fillRect(-22, -6, 44, 10); ctx.restore();
    ctx.save(); ctx.translate(x + 86, y + 10); ctx.rotate(0.28);
    ctx.fillRect(-16, -5, 34, 9); ctx.restore();
    ctx.strokeStyle = "#c4483a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 54, y - 10); ctx.lineTo(x + 96, y + 16); ctx.stroke();
  }
  function drawDeepLandmark(s, x, y) {
    ctx.save();
    ctx.fillStyle = "rgba(8, 24, 36, 0.28)";
    ctx.beginPath(); ctx.ellipse(x, y + 18, 110, 28, 0, 0, Math.PI * 2); ctx.fill();
    if (s === 5) {
      ctx.strokeStyle = "#2a8a5a"; ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 70 + i * 18, y + 16);
        ctx.quadraticCurveTo(x - 64 + i * 18 + Math.sin(state.time + i) * 8, y - 20, x - 60 + i * 18, y - 54);
        ctx.stroke();
      }
    } else if (s === 6) {
      ctx.fillStyle = "#e8c04a";
      for (let i = 0; i < 5; i++) ctx.beginPath(), ctx.arc(x - 40 + i * 20, y + Math.sin(state.time + i) * 4, 7, 0, Math.PI * 2), ctx.fill();
    } else if (s === 7) {
      ctx.fillStyle = "#f4e8c8";
      ctx.beginPath(); ctx.ellipse(x, y - 10, 36, 48, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e85d4c"; ctx.fillRect(x - 6, y - 40, 8, 70);
    } else if (s === 8) {
      ctx.fillStyle = "#3a2450";
      ctx.beginPath(); ctx.ellipse(x, y, 70, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c45ec8";
      ctx.beginPath(); ctx.arc(x + 18, y - 8, 10, 0, Math.PI * 2); ctx.fill();
    } else if (s === 9) {
      ctx.fillStyle = "#c8b070";
      ctx.beginPath(); ctx.ellipse(x, y + 8, 90, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e85d4c";
      ctx.beginPath(); ctx.ellipse(x - 20, y, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
    } else if (s === 10) {
      ctx.fillStyle = "rgba(120,220,255,0.22)";
      for (let i = 0; i < 6; i++) ctx.beginPath(), ctx.arc(x - 50 + i * 20, y - 10 - (i % 3) * 12, 6, 0, Math.PI * 2), ctx.fill();
    } else if (s === 11) {
      ctx.strokeStyle = "rgba(160,210,240,0.45)"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(x, y, 48, 0.2, 2.6); ctx.stroke();
    } else {
      ctx.fillStyle = "#2a3a44";
      ctx.beginPath(); ctx.ellipse(x, y, 80, 22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff6e8";
      for (let i = 0; i < 8; i++) ctx.beginPath(), ctx.arc(x - 30 + i * 8, y - 4, 1.4, 0, Math.PI * 2), ctx.fill();
    }
    ctx.restore();
  }
  function drawForeverBand(y0) {
    const z = zoneAtDepth(y0 + 40);
    ctx.save();
    const g = ctx.createLinearGradient(0, y0, 0, y0 + ZONE_STEP);
    const kind = ((y0 / ZONE_STEP) | 0) % 8;
    if (kind === 0) {
      g.addColorStop(0, "rgba(2,8,18,0)");
      g.addColorStop(1, "rgba(0,4,12,0.42)");
    } else if (kind === 1) {
      g.addColorStop(0, "rgba(40,80,110,0)");
      g.addColorStop(1, "rgba(80,160,200,0.16)");
    } else if (kind === 2) {
      g.addColorStop(0, "rgba(40,10,60,0)");
      g.addColorStop(1, "rgba(90,30,120,0.2)");
    } else {
      g.addColorStop(0, "rgba(4,16,28,0)");
      g.addColorStop(0.5, "rgba(8,28,48,0.18)");
      g.addColorStop(1, "rgba(2,10,20,0.28)");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, y0, OCEAN.w, ZONE_STEP);
    if (kind === 0) {
      ctx.fillStyle = "rgba(90,230,255,0.22)";
      for (let i = 0; i < 24; i++) {
        ctx.globalAlpha = 0.15 + 0.3 * (0.5 + 0.5 * Math.sin(state.time * 1.8 + i));
        ctx.beginPath(); ctx.arc((i * 173) % OCEAN.w, y0 + 80 + (i * 37) % 300, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "rgba(180,230,255,0.16)";
    ctx.font = "800 22px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(z.name, OCEAN.w * 0.5, y0 + 36);
    ctx.restore();
  }
  function drawTurtleMeadow(x, y) {
    ctx.fillStyle = "rgba(50, 110, 70, 0.28)";
    ctx.beginPath(); ctx.ellipse(x, y + 16, 130, 36, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#2a8a4a";
    for (let i = 0; i < 18; i++) {
      const ox = x - 100 + i * 12;
      ctx.lineWidth = 2 + (i % 3) * 0.4;
      ctx.beginPath();
      ctx.moveTo(ox, y + 18);
      ctx.quadraticCurveTo(ox + Math.sin(state.time * 1.4 + i) * 10, y - 8, ox + Math.sin(state.time * 1.1 + i) * 8, y - 36 - (i % 4) * 6);
      ctx.stroke();
    }
    ctx.fillStyle = "#5a6a70";
    ctx.beginPath(); ctx.ellipse(x - 58, y + 4, 24, 38, -0.08, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 58, y + 6, 26, 40, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6d7c82";
    ctx.beginPath();
    ctx.moveTo(x - 78, y - 16);
    ctx.quadraticCurveTo(x, y - 92, x + 80, y - 14);
    ctx.lineTo(x + 54, y - 4);
    ctx.quadraticCurveTo(x, y - 68, x - 52, y - 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#4a585c";
    ctx.beginPath(); ctx.ellipse(x - 70, y + 16, 16, 10, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 72, y + 18, 18, 11, -0.15, 0, Math.PI * 2); ctx.fill();
  }
  function drawFramedPrint(x, y, sid) {
    ctx.fillStyle = "#8b5a2b";
    roundRect(x, y, 52, 42, 4); ctx.fill();
    ctx.fillStyle = "#1a4450";
    roundRect(x + 5, y + 5, 42, 32, 2); ctx.fill();
    ctx.strokeStyle = "#e8c04a"; ctx.lineWidth = 1.4;
    roundRect(x + 5, y + 5, 42, 32, 2); ctx.stroke();
    drawFishBody(SPECIES[sid], x + 26, y + 22, -0.08, 0.62, state.time + sid);
  }
  function drawCoralSouvenir(x, y) {
    ctx.fillStyle = "#c45c3a";
    ctx.beginPath();
    ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y); ctx.lineTo(x + 7, y + 14); ctx.lineTo(x - 7, y + 14);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#e85d6a";
    ctx.beginPath(); ctx.ellipse(x - 2, y - 8, 8, 3.2, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 3, y - 6, 7, 2.8, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3ec8b0";
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y - 16); ctx.lineTo(x + 2, y); ctx.closePath(); ctx.fill();
  }

  function drawBoat() {
    const bob = Math.sin(state.time * 1.55) * 2.4;
    if (state.unlocked[1] || expeditionUnlocked()) {
      const pulse = (state.unlocked[1] ? 0.22 : 0.1) + 0.12 * Math.sin(state.time * 3);
      ctx.fillStyle = "rgba(70, 230, 220," + pulse + ")";
      ctx.beginPath(); ctx.ellipse(BOAT.x, BOAT.y + 10 + bob, 68, 30, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.save();
    ctx.translate(BOAT.x, BOAT.y + bob);
    ctx.fillStyle = "rgba(8, 36, 52, 0.3)";
    ctx.beginPath(); ctx.ellipse(2, 20, 50, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c4483a";
    ctx.beginPath();
    ctx.moveTo(-48, 3);
    ctx.quadraticCurveTo(-42, 17, -10, 19);
    ctx.lineTo(30, 17);
    ctx.quadraticCurveTo(54, 11, 48, 2);
    ctx.lineTo(38, -7);
    ctx.quadraticCurveTo(6, -13, -30, -7);
    ctx.quadraticCurveTo(-52, -2, -48, 3);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#6a2418"; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.strokeStyle = "#fff6e8"; ctx.lineWidth = 2.1;
    ctx.beginPath(); ctx.moveTo(-38, 2); ctx.quadraticCurveTo(6, 6, 40, 3); ctx.stroke();
    ctx.fillStyle = "#2a6f7a";
    roundRect(-8, -24, 30, 18, 4); ctx.fill();
    ctx.fillStyle = "#1b4d6b";
    ctx.fillRect(-6, -27, 26, 4);
    ctx.fillStyle = "#9ef0ff";
    roundRect(-4, -20, 10, 8, 2); ctx.fill();
    roundRect(8, -20, 9, 8, 2); ctx.fill();
    ctx.fillStyle = "#2a2a32";
    ctx.fillRect(42, -4, 9, 12);
    ctx.fillRect(44, 8, 5, 9);
    ctx.fillStyle = "#ffe27a";
    ctx.fillRect(-2, -36, 2.2, 12);
    ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(11, -31); ctx.lineTo(0, -26); ctx.fill();
    ctx.restore();
    if (nearBoat()) {
      const ly = BOAT.y - 56 + bob;
      ctx.fillStyle = "rgba(255,226,122,0.95)";
      roundRect(BOAT.x - 58, ly, 116, 24, 8); ctx.fill();
      ctx.fillStyle = "#3a2a10";
      ctx.font = "800 13px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("EXPEDITION", BOAT.x, ly + 17);
    } else if (state.unlocked[1] && expeditionUnlocked()) {
      const ly = BOAT.y - 52 + bob;
      ctx.fillStyle = "rgba(40, 180, 190, 0.88)";
      roundRect(BOAT.x - 36, ly, 72, 20, 8); ctx.fill();
      ctx.fillStyle = "#fff6e8";
      ctx.font = "800 11px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("BOAT", BOAT.x, ly + 14);
    }
  }

  function drawStringLights() {
    const anchors = [130, 400, 670, 940, 1210, 1480, 1650];
    ctx.strokeStyle = "#3a2412";
    ctx.lineWidth = 1.35;
    for (let s = 0; s < anchors.length - 1; s++) {
      const x0 = anchors[s], x1 = anchors[s + 1];
      ctx.beginPath();
      for (let i = 0; i <= 14; i++) {
        const u = i / 14;
        const x = x0 + (x1 - x0) * u;
        const y = 72 + Math.sin(u * Math.PI) * 20;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      for (let i = 1; i < 14; i++) {
        const u = i / 14;
        const x = x0 + (x1 - x0) * u;
        const y = 72 + Math.sin(u * Math.PI) * 20;
        const pulse = 0.72 + 0.28 * Math.sin(state.time * 3.1 + i * 0.9 + s);
        const lg = ctx.createRadialGradient(x, y + 3, 1, x, y + 3, 16);
        lg.addColorStop(0, "rgba(255,196,90," + (0.5 * pulse) + ")");
        lg.addColorStop(1, "rgba(255,160,50,0)");
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.arc(x, y + 3, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = i % 3 === 0 ? "#ffd27a" : i % 3 === 1 ? "#ff9a3a" : "#ffe8a8";
        ctx.beginPath(); ctx.ellipse(x, y + 3.4, 3.1, 3.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,230,0.7)";
        ctx.beginPath(); ctx.arc(x - 0.7, y + 2, 1.1, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  function drawFountain() {
    const fx = 880, fy = 412;
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath(); ctx.ellipse(fx, fy + 20, 40, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#8a96a2";
    ctx.beginPath(); ctx.ellipse(fx, fy + 12, 38, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6d7a86";
    ctx.beginPath(); ctx.ellipse(fx, fy + 8, 32, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(70, 190, 210, 0.55)";
    ctx.beginPath(); ctx.ellipse(fx, fy + 7, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c5d0d8";
    ctx.beginPath(); ctx.ellipse(fx, fy - 6, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(fx - 6, fy - 24, 12, 18);
    ctx.fillStyle = "#d8e2e8";
    ctx.beginPath(); ctx.ellipse(fx, fy - 24, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(180, 240, 255, 0.72)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + state.time * 0.9;
      const h = 20 + Math.sin(state.time * 4 + i) * 5;
      ctx.beginPath();
      ctx.moveTo(fx, fy - 24);
      ctx.quadraticCurveTo(fx + Math.cos(a) * 14, fy - 24 - h, fx + Math.cos(a) * 22, fy + 4);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(200, 245, 255, 0.85)";
    for (let i = 0; i < 8; i++) {
      const a = state.time * 2.2 + i * 0.75;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(a) * 16, fy - 8 + Math.sin(a * 1.6) * 14, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function drawShopBanner() {
    ctx.save();
    const sign = (state.decor && state.decor[1])
      ? { x: 728, y: 58, w: 304, h: 80 }
      : { x: 720, y: 78, w: 320, h: 36 };
    const a = worldBoxAlpha(sign.x, sign.y, sign.w, sign.h);
    if (a < 0.04) { ctx.restore(); return; }
    ctx.globalAlpha = a;
    if (state.decor && state.decor[1]) {
      ctx.strokeStyle = "#c8a050"; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(768, 58); ctx.lineTo(786, 86); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(992, 58); ctx.lineTo(974, 86); ctx.stroke();
      const glow = ctx.createRadialGradient(880, 108, 8, 880, 108, 90);
      glow.addColorStop(0, "rgba(255, 210, 100, 0.32)");
      glow.addColorStop(1, "rgba(255, 190, 70, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(880, 108, 90, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#6b3a18";
      roundRect(728, 82, 304, 50, 8); ctx.fill();
      ctx.strokeStyle = "#e8c04a"; ctx.lineWidth = 3;
      roundRect(734, 87, 292, 40, 6); ctx.stroke();
      ctx.fillStyle = "#fff6e8";
      ctx.font = "700 22px Fredoka, Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("AQUA BAY", 880, 114);
      ctx.fillStyle = "#ffe27a";
      ctx.font = "700 11px Nunito, sans-serif";
      ctx.fillText("PIER MART", 880, 128);
      const tw = 0.7 + 0.3 * Math.sin(state.time * 4);
      ctx.fillStyle = "rgba(255, 226, 122," + tw + ")";
      ctx.beginPath(); ctx.arc(746, 107, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(1014, 107, 3.6, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "#2a6f7a";
      roundRect(720, 78, 320, 36, 8); ctx.fill();
      ctx.fillStyle = "#fff6e8";
      ctx.font = "700 18px Fredoka, Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("AQUA BAY  ·  PIER MART", 880, 102);
    }
    ctx.restore();
  }

  // ===== SHOP SCENE =====
  function drawEastGallery() {
    ctx.save();
    ctx.fillStyle = state.unlocked[1] ? "#dce8d8" : "#e8d2ae";
    ctx.fillRect(1680, 70, 540, 830);
    drawPierBoards(1688, 80, 524, 810, { plank: 28, wetY: 890, teal: !!state.unlocked[1] });
    ctx.fillStyle = "#f3e6d2";
    ctx.fillRect(1680, 70, 540, 48);
    ctx.fillRect(2184, 70, 36, 830);
    ctx.fillStyle = "#c9a06a"; ctx.fillRect(1680, 112, 540, 8);
    ctx.fillStyle = "#c4483a"; ctx.fillRect(1680, 50, 540, 8);
    const a = worldLabelAlpha(1860, 86, 160, 22);
    if (a > 0.04) {
      ctx.globalAlpha = a;
      ctx.fillStyle = "#1b4d6b";
      roundRect(1860, 86, 160, 22, 6); ctx.fill();
      ctx.fillStyle = "#9ef0ff";
      ctx.font = "800 12px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("EAST PIER", 1940, 102);
    }
    ctx.restore();
  }
  function drawShop() {
    ensurePaint();
    ctx.fillStyle = "#0a3040";
    ctx.fillRect(-480, -240, shopW() + 960, SHOP.h + 480);
    blitTile("sky", -200, -280, shopW() + 400, 400);
    blitHarborPart(0, 0, 1, 0.44, -200, -280, shopW() + 400, 400);
    blitHarborPart(0.08, 0.38, 0.92, 0.62, -160, 740, shopW() + 320, 280);
    const harborFade = ctx.createLinearGradient(0, 40, 0, 220);
    harborFade.addColorStop(0, "rgba(90, 170, 210, 0)");
    harborFade.addColorStop(1, "rgba(12, 48, 62, 0.22)");
    ctx.fillStyle = harborFade;
    ctx.fillRect(-200, 40, shopW() + 400, 200);
    const bayFade = ctx.createLinearGradient(0, 760, 0, 980);
    bayFade.addColorStop(0, "rgba(18, 70, 86, 0.18)");
    bayFade.addColorStop(1, "rgba(6, 28, 40, 0)");
    ctx.fillStyle = bayFade;
    ctx.fillRect(-160, 760, shopW() + 320, 220);
    drawBayWater(-8, 888, shopW() + 16, SHOP.h - 880, state.time, !!state.unlocked[1]);
    drawWetWaterline(-8, 886, shopW() + 16, state.time);
    for (const t of dockTeasers) {
      if (onDryWood(t.x, t.y) || t.y < 1080) continue;
      ctx.save();
      if (state.unlocked[1]) {
        ctx.globalAlpha = 0.78;
      } else {
        ctx.globalAlpha = 0.38;
        ctx.filter = "brightness(0.22) saturate(0.35)";
      }
      drawFishBody(SPECIES[t.s], t.x, t.y, 0.08, 1.22, state.time + t.ph);
      ctx.filter = "none";
      ctx.restore();
    }
    for (let i = 0; i < 7; i++) drawPierPost(500 + i * 130, 1072, 1.2);
    drawPierPost(180, 1074, 1.05);
    drawPierPost(shopW() - 80, 1074, 1.05);
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(-40, 70, 120, 830);
    ctx.fillStyle = "#5a3618";
    ctx.fillRect(-40, 70, 28, 830);
    ctx.fillStyle = state.unlocked[1] ? "#dce8d8" : "#e8d2ae"; ctx.fillRect(80, 70, 1600, 830);
    drawPierBoards(90, 80, 1580, 810, { plank: 28, wetY: 890, teal: !!state.unlocked[1] });
    ctx.save();
    ctx.globalAlpha = 0.22;
    blitHarborPart(0.02, 0.70, 0.96, 0.28, 90, 620, 1580, 270);
    ctx.restore();
    drawPierShade();
    const sunPatch = ctx.createRadialGradient(1240, 220, 20, 1100, 420, 520);
    sunPatch.addColorStop(0, "rgba(255, 220, 130, 0.16)");
    sunPatch.addColorStop(1, "rgba(255, 200, 100, 0)");
    ctx.fillStyle = sunPatch;
    ctx.fillRect(90, 80, 1580, 810);
    ctx.strokeStyle = "rgba(255, 214, 130, 0.18)";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(880, 860);
    ctx.lineTo(880, 360);
    ctx.quadraticCurveTo(760, 348, 520, 370);
    ctx.quadraticCurveTo(340, 410, 250, 520);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 236, 180, 0.10)";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = "rgba(90, 48, 20, 0.28)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 860);
    for (let x = 120; x < 1640; x += 36) ctx.lineTo(x, 852 + Math.sin(x * 0.04) * 3);
    ctx.stroke();
    ctx.strokeStyle = "rgba(196, 72, 58, 0.45)";
    ctx.lineWidth = 2.2;
    for (let x = 160; x < 1600; x += 70) {
      ctx.beginPath(); ctx.moveTo(x, 848); ctx.lineTo(x, 868); ctx.stroke();
    }
    ctx.fillStyle = "#f3e6d2";
    ctx.fillRect(80, 70, 1600, 48); ctx.fillRect(80, 70, 36, 830); ctx.fillRect(1644, 70, 36, 830);
    ctx.fillStyle = "#c9a06a"; ctx.fillRect(80, 112, 1600, 8);
    ctx.fillStyle = "rgba(255,220,140,0.16)";
    ctx.fillRect(1610, 70, 70, 830);
    ctx.fillStyle = "rgba(30,40,60,0.16)";
    ctx.fillRect(80, 70, 48, 830);
    for (let i = 0; i < 22; i++) {
      ctx.fillStyle = i % 2 ? "#e85d4c" : "#fff6e8";
      ctx.fillRect(90 + i * 72, 54, 72, 28);
    }
    ctx.fillStyle = "#c4483a"; ctx.fillRect(80, 50, 1600, 8);
    // aisle water — painted channel, wet wood lip, no hard teal slab
    const ax = AISLE.x, ay = AISLE.y, aw = AISLE.w, ah = AISLE.h;
    ctx.fillStyle = "rgba(18, 70, 88, 0.28)";
    roundRect(ax - 10, ay - 8, aw + 20, ah + 16, 22); ctx.fill();
    const aisleWet = ctx.createLinearGradient(ax, ay, ax, ay + ah);
    if (state.unlocked[1]) {
      aisleWet.addColorStop(0, "rgba(70, 230, 220, 0.94)");
      aisleWet.addColorStop(0.2, "rgba(28, 170, 168, 0.92)");
      aisleWet.addColorStop(0.55, "rgba(12, 110, 120, 0.94)");
      aisleWet.addColorStop(1, "rgba(6, 52, 62, 0.96)");
    } else {
      aisleWet.addColorStop(0, "rgba(90, 220, 230, 0.9)");
      aisleWet.addColorStop(0.22, "rgba(36, 160, 178, 0.88)");
      aisleWet.addColorStop(0.6, "rgba(16, 96, 118, 0.9)");
      aisleWet.addColorStop(1, "rgba(8, 48, 64, 0.94)");
    }
    ctx.fillStyle = aisleWet;
    ctx.beginPath();
    ctx.moveTo(ax + 16, ay);
    for (let x = ax; x <= ax + aw; x += 12) {
      ctx.lineTo(x, ay + Math.sin(x * 0.08 + state.time) * 3);
    }
    ctx.lineTo(ax + aw - 8, ay + ah);
    for (let x = ax + aw; x >= ax; x -= 12) {
      ctx.lineTo(x, ay + ah + Math.sin(x * 0.07 - state.time) * 2.4);
    }
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.clip();
    if (ATLAS.water && ART.ready) {
      ctx.globalAlpha = 0.4;
      blitTile("water", ax - 20, ay - 10, aw + 40, ah + 20);
      ctx.globalAlpha = 1;
    }
    drawCaustics(ax, ay, aw, ah, state.time, 0.2);
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = "#e8ffff"; ctx.lineWidth = 1.6;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const yy = ay + 36 + i * 108 + Math.sin(state.time * 1.3 + i) * 5;
      for (let x = ax; x <= ax + aw; x += 10) {
        const y = yy + Math.sin(x * 0.06 + state.time * 2.1 + i) * 4;
        if (x === ax) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = state.unlocked[1] ? "rgba(90, 240, 230, 0.55)" : "rgba(80, 220, 210, 0.4)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let x = ax; x <= ax + aw; x += 10) {
      const y = ay + Math.sin(x * 0.08 + state.time) * 3;
      if (x === ax) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // warm sun key + lamp glows along the back wall
    drawSunDisc(1588, 28, 22);
    const key = ctx.createRadialGradient(1520, 40, 20, 1100, 420, 920);
    key.addColorStop(0, "rgba(255, 214, 120, 0.2)");
    key.addColorStop(0.45, "rgba(255, 190, 90, 0.06)");
    key.addColorStop(1, "rgba(255, 180, 80, 0)");
    ctx.fillStyle = key;
    ctx.fillRect(80, 50, 1600, 860);
    for (const lx of [400, 880, 1360]) {
      const lg = ctx.createRadialGradient(lx, 96, 6, lx, 110, 110);
      lg.addColorStop(0, "rgba(255, 200, 110, 0.38)");
      lg.addColorStop(0.45, "rgba(255, 180, 80, 0.12)");
      lg.addColorStop(1, "rgba(255, 170, 70, 0)");
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.arc(lx, 108, 110, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2a241c";
      roundRect(lx - 6, 58, 12, 16, 2); ctx.fill();
      ctx.fillStyle = "#f4d078";
      ctx.beginPath(); ctx.arc(lx, 90, 7.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#1a1610"; ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.strokeStyle = "rgba(40, 24, 10, 0.55)";
      ctx.beginPath(); ctx.moveTo(lx - 6, 90); ctx.lineTo(lx + 6, 90); ctx.stroke();
    }
    if (state.unlocked[1]) drawFramedPrint(220, 76, 1);
    if (state.unlocked[2]) drawCoralSouvenir(508, 92);
    if (state.unlocked[3]) drawFramedPrint(1124, 76, 3);
    if (state.unlocked[4]) drawCoralSouvenir(1508, 92);
    if (state.decor && state.decor[0]) drawStringLights();
    drawPierBoards(500, 890, 760, 130, { plank: 22, wetY: 1010 });
    drawWetWaterline(488, 1008, 784, state.time + 0.7);
    ctx.fillStyle = "rgba(80,230,255,0.12)";
    roundRect(DIVE_ZONE.x, DIVE_ZONE.y, DIVE_ZONE.w, DIVE_ZONE.h, 16); ctx.fill();
    ctx.strokeStyle = "rgba(180,255,255,0.35)"; ctx.setLineDash([8, 8]); ctx.stroke(); ctx.setLineDash([]);
    const chip = diveChipBox();
    const diveA = worldBoxAlpha(chip.x, chip.y, chip.w, chip.h);
    if (diveA > 0.04) {
      ctx.save();
      ctx.globalAlpha = diveA;
      ctx.fillStyle = "#1b4d6b";
      roundRect(chip.x, chip.y, chip.w, chip.h, 8); ctx.fill();
      ctx.fillStyle = "#9ef0ff";
      ctx.font = "800 18px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("DIVE", chip.x + chip.w / 2, chip.y + 24);
      ctx.restore();
    }
    if (state.mode === "play") btn("dive-chip", ...screenBtnFromWorld(chip.x, chip.y, chip.w, chip.h));
    const pathPts = [
      [880, 1008], [880, 860], [880, 680], [880, 500], [880, 360],
      [720, 360], [520, 370], [340, 430], [250, 520],
    ];
    ctx.fillStyle = "rgba(255, 236, 180, 0.42)";
    for (let i = 0; i < pathPts.length - 1; i++) {
      const [x0, y0] = pathPts[i], [x1, y1] = pathPts[i + 1];
      const steps = 5;
      for (let s = 0; s < steps; s++) {
        const u = s / steps;
        ctx.beginPath();
        ctx.arc(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    for (const g of pathGlints) {
      const a = clamp(g.life / 0.35, 0, 1);
      ctx.globalAlpha = a;
      if (g.coin) {
        ctx.fillStyle = "#ffd24a";
        ctx.beginPath(); ctx.ellipse(g.x, g.y, g.r + 1.4, g.r, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#c49210"; ctx.lineWidth = 1.1; ctx.stroke();
      } else {
        ctx.fillStyle = "#fff6c8";
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    drawPot(140, 400, "#4cba6a"); drawPot(1600, 400, "#3aa35a");
    drawPot(168, 780, "#3aa35a", 1.7); drawPot(1588, 780, "#2e8b4a", 1.75);
    drawCrateStack(360, 760);
    drawCrateStack(1288, 748);
    drawCrate(1004, 948, 40, 26);
    drawCrate(1014, 928, 34, 22);
    drawMopBucket(748, 944);
    drawHangingSign(1020, 888);
    drawBench(1088, 780);
    drawLifeRing(548, 888);
    drawVending(1396, 688);
    drawBaitShack(1488, 812);
    drawSkiff(pierLife.skiff);
    drawGull(pierLife.gull);
    drawGull(pierLife.gull2);
    if (state.decor && state.decor[2]) drawFountain();
    drawBoat();
    // side welcome counter (inward so the starting camera keeps it on-canvas)
    ctx.fillStyle = "#c45c4a";
    roundRect(WELCOME.x, WELCOME.y, WELCOME.w, WELCOME.h, 12); ctx.fill();
    const welcomeA = worldLabelAlpha(WELCOME.x + 8, WELCOME.y + 8, WELCOME.w - 16, WELCOME.h - 16);
    if (welcomeA > 0.04) {
      ctx.save();
      ctx.globalAlpha = welcomeA;
      ctx.fillStyle = "#ead7b4";
      roundRect(WELCOME.x + 10, WELCOME.y + 10, WELCOME.w - 20, WELCOME.h - 20, 8); ctx.fill();
      ctx.fillStyle = "#2a7d8a";
      ctx.font = "700 12px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Welcome to", WELCOME.x + WELCOME.w / 2, WELCOME.y + 38);
      ctx.fillText("the pier", WELCOME.x + WELCOME.w / 2, WELCOME.y + 54);
      ctx.restore();
    }
    drawRegister(); drawKiosk();
    if (galleryOpen()) drawEastGallery();
    for (let i = 0; i < SPECIES.length; i++) {
      if (tankLive(i)) drawTank(i);
    }
    if (!state.unlockBanner && (state.aisleSchoolWait || 0) <= 0 &&
        !(state.fadeDir && state.pendingScene === "ocean")) {
      ctx.save();
      roundRect(AISLE.x, AISLE.y, AISLE.w, AISLE.h, 18);
      ctx.clip();
      for (const sw of state.shopSwimmers) {
        if (!inAisleWater(sw.x, sw.y) || onDryWood(sw.x, sw.y)) continue;
        const ang = (sw.vx >= 0 ? 1 : -1) * Math.PI / 2;
        drawFishBody(SPECIES[sw.s], sw.x, sw.y, ang + Math.sin(state.time * 2 + sw.ph) * 0.12, 1.15, state.time + sw.ph);
      }
      ctx.restore();
    }
    const sorted = customers.slice().sort((a, b) => a.y - b.y);
    let pDrawn = false;
    for (const c of sorted) {
      if (!pDrawn && player.y < c.y) {
        drawPlayer(player.x, player.y);
        pDrawn = true;
      }
      drawPerson(c.x, c.y, c);
    }
    if (!pDrawn) drawPlayer(player.x, player.y);
    drawShopBanner();
  }
  function drawRegister() {
    const r = REGISTER;
    if (tillWaiting() && !cashierHandlingIt()) {
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2 + 10;
      const rad = tillRingR();
      const pulse = 0.5 + 0.28 * Math.sin(state.time * 3.6);
      const dwell = clamp((player.tillDwell || 0) / 0.3, 0, 1);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = "rgba(255,226,122,0.95)";
      ctx.lineWidth = 6 + dwell * 4;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(255,226,122," + (0.12 + dwell * 0.12) + ")";
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,246,232,0.45)";
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(cx, cy, rad * 0.72, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      if (!inTillGlow()) {
        const bounce = Math.abs(Math.sin(state.time * 5.2)) * 6;
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = "rgba(40, 24, 8, 0.82)";
        roundRect(cx - 58, cy - rad - 28 - bounce, 116, 24, 8); ctx.fill();
        ctx.fillStyle = "#ffe27a";
        ctx.font = "800 13px Nunito, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("COLLECT  $" + state.registerCash, cx, cy - rad - 11 - bounce);
        ctx.restore();
      }
    }
    const punch = state.registerPunch || 1;
    ctx.fillStyle = "rgba(12, 8, 4, 0.28)";
    ctx.beginPath();
    ctx.ellipse(r.x + r.w / 2, r.y + r.h + 10, r.w * 0.48, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
    ctx.scale(punch, punch);
    ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
    ctx.fillStyle = "#8b5a2b"; roundRect(r.x, r.y, r.w, r.h, 10); ctx.fill();
    // Same rule as Welcome: fade the inner plaque + $ chip as one unit
    // before the left frame bisects them. C34 only boxed the CASHIER
    // word (inset, 26px tall), so $0 / the bouncing $ sat at alpha 1
    // while the counter sat flush-cut.
    const cashA = worldLabelAlpha(r.x, r.y - 34, r.w, r.h + 34);
    if (cashA > 0.04) {
      ctx.save();
      ctx.globalAlpha = cashA;
      ctx.fillStyle = "#c4894a"; roundRect(r.x + 8, r.y + 8, r.w - 16, 36, 6); ctx.fill();
      ctx.fillStyle = "#1b1b22"; roundRect(r.x + 18, r.y + 14, 70, 22, 4); ctx.fill();
      ctx.fillStyle = "#7dffa0"; ctx.font = "700 12px Nunito, sans-serif"; ctx.textAlign = "left";
      ctx.fillText("$" + state.registerCash, r.x + 24, r.y + 30);
      ctx.fillStyle = "#fff6e8"; ctx.font = "700 13px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("CASHIER", r.x + r.w / 2, r.y + r.h - 14);
      if (state.registerCash > 0 && !nearRect(r.x, r.y, r.w, r.h, 140)) {
        const bounce = Math.abs(Math.sin(state.time * 6)) * 12;
        ctx.fillStyle = "#ffe27a";
        ctx.font = "800 26px Fredoka, sans-serif";
        ctx.fillText("$", r.x + r.w / 2, r.y - 6 - bounce);
      }
      ctx.restore();
    }
    if (state.hiredCashier) {
      drawPerson(r.x + 46, r.y + 20, {
        shirt: "#1b4d6b", hair: "#2a1a12", skin: "#d0a07a",
        bob: state.time * 3.2, hat: "#c4483a", hairCut: 0, carry: -1,
      });
    }
    for (const c of state.coins) {
      const by = c.y + Math.sin(state.time * 4 + c.ph) * 5;
      ctx.fillStyle = "#ffd24a";
      ctx.beginPath(); ctx.ellipse(c.x, by, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#c49210"; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = "#a87410";
      ctx.font = "800 12px Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("$", c.x, by + 4);
    }
    if (nearRect(r.x, r.y, r.w, r.h, 40) && state.registerCash > 0) {
      const colA = worldBoxAlpha(r.x - 10, r.y - 34, r.w + 20, 26);
      if (colA > 0.04) {
        ctx.save();
        ctx.globalAlpha = colA;
        ctx.fillStyle = "rgba(255,226,122,0.9)";
        roundRect(r.x - 10, r.y - 34, r.w + 20, 26, 8); ctx.fill();
        ctx.fillStyle = "#3a2a10"; ctx.font = "700 13px Nunito, sans-serif"; ctx.textAlign = "center";
        ctx.fillText("Collect  $" + state.registerCash, r.x + r.w / 2, r.y - 16);
        ctx.restore();
      }
    }
    ctx.restore();
    drawTillSlip();
    if (tillWaiting()) {
      const pad = tillRingR() - Math.min(r.w, r.h) / 2;
      btn("till", ...screenBtnFromWorld(r.x - pad, r.y - pad, r.w + pad * 2, r.h + pad * 2));
    }
  }
  function drawTillSlip() {
    const slip = state.tillSlip;
    if (!slip || !slip.items || !slip.items.length) return;
    const lines = [];
    for (let i = 0; i < slip.items.length; i++) {
      const it = slip.items[i];
      lines.push(it.n + " " + it.name + " × $" + it.price);
    }
    const extra = slip.extra | 0;
    lines.push((extra > 0 ? "tip / bonus  +$" : extra < 0 ? "tip / bonus  $" : "tip / bonus  $") + extra);
    lines.push("total  $" + slip.total);
    const r = REGISTER;
    const w = 176, lineH = 16;
    const h = 22 + lines.length * lineH;
    const x = r.x + r.w + 12, y = r.y - 6;
    const a = worldLabelAlpha(x, y, w, h);
    if (a <= 0.04) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = "#fff6e8";
    roundRect(x, y, w, h, 6); ctx.fill();
    ctx.strokeStyle = "#c49210";
    ctx.lineWidth = 1.4;
    roundRect(x, y, w, h, 6); ctx.stroke();
    ctx.textAlign = "left";
    for (let i = 0; i < lines.length; i++) {
      const last = i === lines.length - 1;
      ctx.font = last ? "800 13px Nunito, sans-serif" : "700 12px Nunito, sans-serif";
      ctx.fillStyle = last ? "#8a4a10" : "#3a2a10";
      ctx.fillText(lines[i], x + 10, y + 18 + i * lineH);
    }
    ctx.restore();
  }
  function drawKiosk() {
    const k = KIOSK;
    const ks = worldToScreen(k.x, k.y);
    const ke = worldToScreen(k.x + k.w, k.y + k.h);
    if (ks.y < 12 || ke.y > H - 12 || ks.x < 8 || ke.x > W - 8) return;
    const labelA = worldLabelAlpha(k.x, k.y, k.w, k.h);
    const strip = speciesStripLayout();
    const kioskBox = { x: ks.x, y: ks.y, w: ke.x - ks.x, h: ke.y - ks.y };
    // C35 hid UPGRADES text when the book chips sat in this box, but still
    // painted the empty teal slab. Only draw the panel when its chips/copy
    // actually go in it.
    if (labelA <= 0.04 || boxesOverlap(kioskBox, strip, 10)) return;
    ctx.save();
    ctx.globalAlpha = labelA;
    ctx.fillStyle = "#2a7d8a"; roundRect(k.x, k.y, k.w, k.h, 12); ctx.fill();
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 14px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("UPGRADES", k.x + k.w / 2, k.y + 42);
    ctx.fillStyle = "#c8e8ee";
    ctx.font = "700 12px Nunito, sans-serif";
    ctx.fillText("Tap the cards", k.x + k.w / 2, k.y + 68);
    ctx.fillStyle = "#ffd24a";
    ctx.beginPath(); ctx.arc(k.x + k.w / 2, k.y + 98, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#a87410"; ctx.font = "800 14px Nunito, sans-serif";
    ctx.fillText("$", k.x + k.w / 2, k.y + 103);
    ctx.restore();
  }
  function screenBtnFromWorld(x, y, w, h) {
    const a = worldToScreen(x, y), b = worldToScreen(x + w, y + h);
    return [a.x, a.y, b.x - a.x, b.y - a.y];
  }
  function drawFishSilhouette(sp, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha *= 0.55;
    ctx.filter = "brightness(0)";
    drawFishBody(sp, 0, 0, 0, scale, 0);
    ctx.filter = "none";
    ctx.restore();
  }
  function drawTank(i) {
    const t = TANK_POS[i], sp = SPECIES[i];
    const shake = (state.tankShake && state.tankShake.i === i)
      ? Math.sin(state.tankShake.t * 64) * 24 * clamp(state.tankShake.t / 0.18, 0, 1)
      : 0;
    ctx.save();
    ctx.translate(shake, 0);
    ctx.fillStyle = "rgba(12, 8, 4, 0.28)";
    ctx.beginPath();
    ctx.ellipse(t.x + TANK_W / 2, t.y + TANK_H + 16, TANK_W * 0.42, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6a3a18";
    roundRect(t.x + 8, t.y + TANK_H - 4, TANK_W - 16, 24, 4); ctx.fill();
    ctx.fillStyle = "#8a5224";
    roundRect(t.x + 14, t.y + TANK_H - 2, TANK_W - 28, 8, 2); ctx.fill();
    ctx.fillStyle = "rgba(255, 210, 140, 0.16)";
    ctx.fillRect(t.x + 16, t.y + TANK_H - 2, 18, 6);
    const stocked = state.unlocked[i] && state.stock[i] > 0;
    const water = ctx.createLinearGradient(t.x, t.y, t.x, t.y + TANK_H);
    if (i === 0 && stocked) {
      water.addColorStop(0, "rgba(255,244,210,0.22)");
      water.addColorStop(0.12, "rgba(255,214,150,0.18)");
      water.addColorStop(0.34, "rgba(56,186,198,0.58)");
      water.addColorStop(0.72, "rgba(16,86,112,0.86)");
      water.addColorStop(1, "rgba(8,42,68,0.96)");
    } else {
      water.addColorStop(0, "rgba(230,250,255,0.18)");
      water.addColorStop(0.12, "rgba(150,226,240,0.34)");
      water.addColorStop(0.42, "rgba(32,140,176,0.64)");
      water.addColorStop(0.78, "rgba(10,62,88,0.9)");
      water.addColorStop(1, "rgba(6,32,52,0.96)");
    }
    ctx.fillStyle = "#e8f2f6";
    roundRect(t.x - 4, t.y - 4, TANK_W + 8, TANK_H + 8, 13); ctx.fill();
    ctx.fillStyle = "#6e8894";
    roundRect(t.x + 1, t.y + 1, TANK_W - 2, TANK_H - 2, 10); ctx.fill();
    ctx.save();
    roundRect(t.x + 5, t.y + 5, TANK_W - 10, TANK_H - 10, 8); ctx.clip();
    ctx.fillStyle = "#0a2230";
    ctx.fillRect(t.x, t.y, TANK_W, TANK_H);
    ctx.fillStyle = water; ctx.fillRect(t.x, t.y, TANK_W, TANK_H);
    ctx.save();
    ctx.globalAlpha = 0.55;
    blitTile("tankglass", t.x + 4, t.y + 4, TANK_W - 8, TANK_H - 8);
    ctx.restore();
    const depth = ctx.createLinearGradient(t.x, t.y + 20, t.x, t.y + TANK_H);
    depth.addColorStop(0, "rgba(8,24,36,0)");
    depth.addColorStop(1, "rgba(4,16,28,0.38)");
    ctx.fillStyle = depth;
    ctx.fillRect(t.x, t.y, TANK_W, TANK_H);
    const lineY = t.y + 18;
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(t.x, t.y, TANK_W, 18);
    ctx.strokeStyle = "rgba(255,255,255,0.82)";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(t.x + 6, lineY);
    for (let x = t.x; x <= t.x + TANK_W; x += 6) {
      ctx.lineTo(x, lineY + Math.sin(x * 0.14 + state.time * 2.4 + i) * 1.15);
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(8,28,40,0.35)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(t.x + 8, lineY + 3);
    ctx.quadraticCurveTo(t.x + 18, lineY + 7, t.x + 28, lineY + 3);
    ctx.moveTo(t.x + TANK_W - 28, lineY + 3);
    ctx.quadraticCurveTo(t.x + TANK_W - 18, lineY + 7, t.x + TANK_W - 8, lineY + 3);
    ctx.stroke();
    ctx.fillStyle = i === 0 && stocked ? "rgba(180,100,42,0.58)" : "rgba(140,112,62,0.5)";
    ctx.fillRect(t.x, t.y + TANK_H - 26, TANK_W, 22);
    ctx.fillStyle = i === 0 && stocked ? "rgba(230,160,80,0.36)" : "rgba(200,170,100,0.28)";
    ctx.beginPath();
    ctx.moveTo(t.x, t.y + TANK_H - 18);
    for (let p = 0; p <= 10; p++) {
      ctx.lineTo(t.x + p * (TANK_W / 10), t.y + TANK_H - 16 + Math.sin(p * 1.3 + i) * 3.2);
    }
    ctx.lineTo(t.x + TANK_W, t.y + TANK_H);
    ctx.lineTo(t.x, t.y + TANK_H);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = i % 2 ? "#2e8b4a" : "#3aa35a";
    ctx.lineWidth = 1.8;
    for (let p = 0; p < 4; p++) {
      const px = t.x + 22 + p * 48 + (i % 3) * 6;
      const sway = Math.sin(state.time * 1.4 + i + p) * 4;
      ctx.beginPath();
      ctx.moveTo(px, t.y + TANK_H - 24);
      ctx.quadraticCurveTo(px + sway, t.y + TANK_H - 48, px + sway * 0.4, t.y + TANK_H - 70);
      ctx.stroke();
    }
    ctx.fillStyle = "#4a5a50";
    ctx.beginPath();
    ctx.moveTo(t.x + 16, t.y + TANK_H - 18);
    ctx.quadraticCurveTo(t.x + 28, t.y + TANK_H - 30, t.x + 42, t.y + TANK_H - 16);
    ctx.quadraticCurveTo(t.x + 30, t.y + TANK_H - 12, t.x + 16, t.y + TANK_H - 18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(t.x + TANK_W - 48, t.y + TANK_H - 16);
    ctx.quadraticCurveTo(t.x + TANK_W - 32, t.y + TANK_H - 28, t.x + TANK_W - 16, t.y + TANK_H - 15);
    ctx.quadraticCurveTo(t.x + TANK_W - 30, t.y + TANK_H - 10, t.x + TANK_W - 48, t.y + TANK_H - 16);
    ctx.fill();
    drawCaustics(t.x, t.y + 18, TANK_W, TANK_H - 40, state.time + i, 0.14);
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "#e8ffff";
    ctx.lineWidth = 2;
    for (let b = 0; b < 4; b++) {
      ctx.beginPath();
      const yy = t.y + 18 + b * 28 + Math.sin(state.time * 1.4 + b + i) * 5;
      for (let x = t.x; x <= t.x + TANK_W; x += 8) {
        const y = yy + Math.sin(x * 0.08 + state.time * 2.2 + b) * 4;
        if (x === t.x) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    if (state.unlocked[i]) {
      const sc = stocked ? 0.96 : 0.84;
      const tm = state.time; // shared with tankExits — must stay outside the swim loop
      for (const f of tankFish[i]) {
        let ox = Math.sin(tm * 1.2 + f.ph) * 10, oy = Math.sin(tm * 0.8 + f.ph) * 6;
        if (i === 0) {
          const dart = Math.sin(tm * 9 + f.ph) > 0.35 ? 1 : 0.15;
          ox = Math.sin(tm * 3.4 + f.ph) * 28 * dart; oy = Math.sin(tm * 5.2 + f.ph) * 7 * dart;
        } else if (i === 1) {
          ox = Math.sin(tm * 2.2 + f.ph) * 26; oy = Math.sin((tm * 2.2 + f.ph) * 2) * 14;
        } else if (i === 2) {
          ox = Math.sin(tm * 0.55 + f.ph) * 6; oy = Math.sin(tm * 0.9 + f.ph) * 10;
        } else if (i === 3) {
          ox = (tm * 22 + f.ph * 18) % (TANK_W - 40); oy = Math.sin(tm * 0.4 + f.ph) * 3;
        } else {
          const stroke = Math.max(0, Math.sin(tm * 2.2 + f.ph));
          ox = Math.sin(tm * 0.35 + f.ph) * 5 + stroke * 4; oy = Math.sin(tm * 0.55 + f.ph) * 4;
        }
        const fx = t.x + 20 + ((f.x + ox) % (TANK_W - 40) + (TANK_W - 40)) % (TANK_W - 40);
        const fy = t.y + 28 + ((f.y + oy) % (TANK_H - 50) + (TANK_H - 50)) % (TANK_H - 50);
        const dip = (f.dip || 0) > 0 ? Math.sin((1 - f.dip / 0.55) * Math.PI) * 11 : 0;
        const bobY = fy + Math.sin(tm * (i === 2 ? 1.1 : 2.2) + f.ph) * (i === 2 ? 6 : 3) + dip;
        const lookA = i === 1 ? Math.sin(tm * 2.2 + f.ph) * 1.05
          : i === 0 ? Math.sin(tm * 4.2 + f.ph) * 0.55
          : i === 4 ? Math.sin(tm * 2.2 + f.ph) * 0.18
          : Math.sin(tm * 0.7 + f.ph) * 0.28;
        if (!inTankWater(fx, bobY)) continue;
        drawFishBody(sp, fx, bobY, lookA, sc, tm + f.ph);
      }
      for (const e of tankExits) {
        if (e.i !== i) continue;
        const u = 1 - clamp(e.life / (e.max || 0.62), 0, 1);
        const fx = t.x + 20 + ((e.x % (TANK_W - 40) + (TANK_W - 40)) % (TANK_W - 40));
        const fy = t.y + 28 + ((e.y % (TANK_H - 50) + (TANK_H - 50)) % (TANK_H - 50));
        const hideY = fy - u * 36;
        ctx.save();
        ctx.globalAlpha = 1 - u * 0.92;
        drawFishBody(sp, fx, hideY, 0.4 + u * 1.2, sc * (1 - u * 0.25), tm + (e.ph || 0));
        ctx.restore();
      }
      for (const r of tankRipples) {
        if (r.i !== i) continue;
        const u = 1 - clamp(r.life / r.max, 0, 1);
        ctx.strokeStyle = "rgba(230,250,255," + (0.75 * (1 - u)) + ")";
        ctx.lineWidth = 3.2 - u * 1.6;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, 14 + u * 52, 6 + u * 18, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(180,230,255," + (0.4 * (1 - u)) + ")";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, 8 + u * 32, 4 + u * 10, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    drawWaterMotes(t.x + 8, t.y + 22, TANK_W - 16, TANK_H - 48, state.time + i, 10, "rgba(230,250,255,0.45)");
    const sheen = ctx.createLinearGradient(t.x, t.y, t.x + TANK_W * 0.55, t.y + TANK_H);
    sheen.addColorStop(0, "rgba(255,255,255,0.5)");
    sheen.addColorStop(0.18, "rgba(255,255,255,0.16)");
    sheen.addColorStop(0.26, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.moveTo(t.x + 8, t.y + 6);
    ctx.lineTo(t.x + 62, t.y + 6);
    ctx.lineTo(t.x + 24, t.y + TANK_H - 8);
    ctx.lineTo(t.x + 8, t.y + TANK_H - 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.moveTo(t.x + TANK_W - 20, t.y + 10);
    ctx.lineTo(t.x + TANK_W - 8, t.y + 10);
    ctx.lineTo(t.x + TANK_W - 8, t.y + 56);
    ctx.lineTo(t.x + TANK_W - 24, t.y + 42);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(230,245,255,0.22)";
    for (let d = 0; d < 6; d++) {
      const dx = t.x + 18 + (d * 31 + i * 13) % (TANK_W - 36);
      const dy = t.y + 28 + (d * 19) % (TANK_H - 50);
      ctx.beginPath(); ctx.ellipse(dx, dy, 1.6, 2.4, 0.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    if (state.unlocked[i] && state.bag.some((s) => s === i)) {
      ctx.strokeStyle = "rgba(120,255,210," + (0.45 + 0.35 * Math.sin(state.time * 4)) + ")";
      ctx.lineWidth = 6;
      roundRect(t.x - 3, t.y - 3, TANK_W + 6, TANK_H + 6, 12); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.82)"; ctx.lineWidth = 3.4;
    roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.stroke();
    ctx.strokeStyle = "rgba(12, 28, 40, 0.28)"; ctx.lineWidth = 5;
    roundRect(t.x + 3, t.y + 3, TANK_W - 6, TANK_H - 6, 8); ctx.stroke();
    ctx.strokeStyle = "rgba(210,240,255,0.58)"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(t.x + 10, t.y + 3); ctx.lineTo(t.x + TANK_W - 12, t.y + 3); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(t.x + 8, t.y + 10); ctx.lineTo(t.x + 8, t.y + TANK_H - 14); ctx.stroke();
    if (state.unlocked[i]) {
      const nameA = Math.min(
        worldLabelAlpha(t.x + 8, t.y + TANK_H - 32, TANK_W - 16, 24),
        hudChipClear(t.x + 8, t.y + TANK_H - 32, TANK_W - 16, 24)
      );
      if (nameA > 0.04) {
        ctx.globalAlpha = nameA;
        ctx.fillStyle = "rgba(30,40,50,0.72)";
        roundRect(t.x + 8, t.y + TANK_H - 32, TANK_W - 16, 24, 6); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "700 12px Nunito, sans-serif"; ctx.textAlign = "left";
        ctx.fillText(sp.name, t.x + 16, t.y + TANK_H - 16);
        ctx.textAlign = "right"; ctx.fillStyle = "#ffe27a";
        ctx.fillText("$" + sp.price, t.x + TANK_W - 16, t.y + TANK_H - 16);
        ctx.globalAlpha = 1;
      }
      const badgeA = worldLabelAlpha(t.x + TANK_W - 22, t.y - 4, 28, 28);
      if (badgeA > 0.04) {
        ctx.globalAlpha = badgeA;
        ctx.fillStyle = "#ff7a3a";
        ctx.beginPath(); ctx.arc(t.x + TANK_W - 8, t.y + 10, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "800 13px Nunito, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(String(tankBadge(i)), t.x + TANK_W - 8, t.y + 15);
        ctx.globalAlpha = 1;
      }
      if (nearStockPad(i) && state.bag.some((s) => s === i)) {
        const stockA = worldLabelAlpha(t.x + 20, t.y - 30, TANK_W - 40, 24);
        if (stockA > 0.04) {
          ctx.globalAlpha = stockA;
          ctx.fillStyle = "rgba(80,230,180,0.92)";
          roundRect(t.x + 20, t.y - 30, TANK_W - 40, 24, 8); ctx.fill();
          ctx.fillStyle = "#123"; ctx.font = "700 12px Nunito, sans-serif";
          ctx.fillText("Stock tank", t.x + TANK_W / 2, t.y - 13);
          ctx.globalAlpha = 1;
        }
      }
    } else {
      const next = nextLockedTank();
      const affordable = i === next && state.money >= sp.unlock;
      const glow = i === next ? (0.32 + 0.28 * Math.sin(state.time * 4)) : 0.12;
      const cardA = tankUnlockCardAlpha(t);
      if (cardA > 0.04) {
        ctx.save();
        ctx.globalAlpha = cardA;
        ctx.fillStyle = "rgba(12,16,24,0.62)";
        roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.fill();
        if (i === next) {
          ctx.fillStyle = "rgba(255,186,80," + (0.1 + glow * 0.18) + ")";
          roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.fill();
          ctx.strokeStyle = "rgba(255,180,80," + glow + ")";
          ctx.lineWidth = 6;
          roundRect(t.x - 4, t.y - 4, TANK_W + 8, TANK_H + 8, 12); ctx.stroke();
        }
        drawFishSilhouette(sp, t.x + TANK_W / 2, t.y + 58, 1.15);
        const priceNope = state.priceFlash && state.priceFlash.tank === i;
        const name = sp.name;
        const price = "Unlock  $" + sp.unlock;
        ctx.fillStyle = "#fff6e8";
        ctx.font = "800 16px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(name, t.x + TANK_W / 2, t.y + 96);
        ctx.font = (priceNope ? "800 16px" : "700 13px") + " Nunito, sans-serif";
        ctx.fillStyle = priceNope ? "#ff6a5a" : affordable ? "#ffe27a" : "#d0c4b0";
        ctx.fillText(price, t.x + TANK_W / 2, t.y + 116);
        if (affordable) {
          ctx.strokeStyle = "rgba(255,226,122," + (0.4 + 0.35 * Math.sin(state.time * 6)) + ")";
          ctx.lineWidth = 5;
          roundRect(t.x - 3, t.y - 3, TANK_W + 6, TANK_H + 6, 12); ctx.stroke();
        }
        ctx.restore();
      }
      btn("unlock-" + i, ...screenBtnFromWorld(t.x, t.y, TANK_W, TANK_H));
    }
    if (state.tankReveal && state.tankReveal.i === i) {
      ctx.fillStyle = "rgba(255,255,255," + (0.55 * (state.tankReveal.life / state.tankReveal.max)) + ")";
      roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.fill();
    }
    if (state.tankFlash && state.tankFlash.i === i) {
      const a = clamp(state.tankFlash.life / 0.2, 0, 1) * 0.48;
      const tint = state.tankFlash.tint;
      ctx.fillStyle = tint
        ? "rgba(255,255,255," + (a * 0.55) + ")"
        : "rgba(255,255,255," + a + ")";
      roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.fill();
      if (tint) {
        ctx.strokeStyle = tint.stroke;
        ctx.globalAlpha = a;
        ctx.lineWidth = 5;
        roundRect(t.x - 2, t.y - 2, TANK_W + 4, TANK_H + 4, 12); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }

  // ===== OCEAN SCENE =====
  function isNightOcean() { return !!(state.expedition && state.nightExpedition); }
  function drawOcean() {
    const night = isNightOcean();
    const g = ctx.createLinearGradient(0, 0, 0, OCEAN.h);
    if (night) {
      g.addColorStop(0, "#1a3a58");
      g.addColorStop(0.12, "#0c2848");
      g.addColorStop(0.55, "#061828");
      g.addColorStop(1, "#020810");
    } else {
      g.addColorStop(0, "#c4f6fc");
      g.addColorStop(0.05, "#6adcec");
      g.addColorStop(0.14, "#2aa8c8");
      g.addColorStop(0.32, "#0e6a88");
      g.addColorStop(0.54, "#084c64");
      g.addColorStop(0.78, "#032838");
      g.addColorStop(1, "#021018");
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, OCEAN.w, OCEAN.h);
    if (!night) {
      const sunWash = ctx.createRadialGradient(1980, 40, 20, 1680, 280, 980);
      sunWash.addColorStop(0, "rgba(255,228,150,0.34)");
      sunWash.addColorStop(0.4, "rgba(255,200,110,0.1)");
      sunWash.addColorStop(1, "rgba(255,190,90,0)");
      ctx.fillStyle = sunWash;
      ctx.fillRect(0, 0, OCEAN.w, 640);
      drawSunGlitter(0, 148, OCEAN.w, state.time, 70);
    }
    const murk = ctx.createLinearGradient(0, 320, 0, OCEAN.h);
    murk.addColorStop(0, "rgba(4,18,28,0)");
    murk.addColorStop(0.32, night ? "rgba(2,8,16,0.22)" : "rgba(4,22,32,0.2)");
    murk.addColorStop(0.7, night ? "rgba(1,6,12,0.42)" : "rgba(2,12,18,0.38)");
    murk.addColorStop(1, night ? "rgba(0,3,8,0.68)" : "rgba(1,8,14,0.6)");
    ctx.fillStyle = murk;
    ctx.fillRect(0, 320, OCEAN.w, OCEAN.h - 320);
    drawWaterMotes(0, 220, OCEAN.w, OCEAN.h - 280, state.time, night ? 40 : 70, night ? "rgba(160,220,255,0.4)" : "rgba(220,245,255,0.45)");
    if (state.unlocked[1]) {
      const rg = ctx.createLinearGradient(0, 820, 0, OCEAN.h);
      rg.addColorStop(0, "rgba(18, 150, 128, 0)");
      rg.addColorStop(0.22, night ? "rgba(10, 90, 88, 0.14)" : "rgba(16, 148, 126, 0.16)");
      rg.addColorStop(1, night ? "rgba(4, 40, 42, 0.28)" : "rgba(8, 86, 78, 0.3)");
      ctx.fillStyle = rg; ctx.fillRect(0, 820, OCEAN.w, OCEAN.h - 820);
      const xg = ctx.createLinearGradient(1480, 0, OCEAN.w, 0);
      xg.addColorStop(0, "rgba(24, 150, 132, 0)");
      xg.addColorStop(1, night ? "rgba(10, 80, 78, 0.16)" : "rgba(18, 132, 118, 0.18)");
      ctx.fillStyle = xg; ctx.fillRect(1480, 0, OCEAN.w - 1480, OCEAN.h);
    }
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    if (night) {
      const mx = 1260 + Math.sin(state.time * 0.15) * 20;
      ctx.fillStyle = "rgba(170,200,255,0.08)";
      ctx.beginPath();
      ctx.moveTo(mx - 28, 0); ctx.lineTo(mx + 46, 0); ctx.lineTo(mx + 130, OCEAN.h); ctx.lineTo(mx - 70, OCEAN.h);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(200,220,255,0.06)";
      ctx.beginPath();
      ctx.moveTo(mx - 6, 0); ctx.lineTo(mx + 16, 0); ctx.lineTo(mx + 52, OCEAN.h); ctx.lineTo(mx - 24, OCEAN.h);
      ctx.closePath(); ctx.fill();
    } else {
      const follow = player.x * 0.42;
      for (let i = 0; i < 8; i++) {
        const x = 80 + i * 320 + Math.sin(state.time * 0.3 + i) * 40 + follow;
        ctx.fillStyle = "rgba(200,236,255," + (0.055 + 0.03 * Math.sin(state.time + i)) + ")";
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + 64, 0); ctx.lineTo(x + 230, OCEAN.h); ctx.lineTo(x - 46, OCEAN.h);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
    if (!night) drawCaustics(0, 180, OCEAN.w, OCEAN.h - 180, state.time, 0.08);
    ctx.save(); ctx.globalAlpha = 0.08; ctx.strokeStyle = "#c8f4ff"; ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      const yy = 200 + i * 160;
      for (let x = 0; x < OCEAN.w; x += 16) {
        const y = yy + Math.sin(x * 0.01 + state.time * 1.4 + i) * 18 + Math.sin(x * 0.02 - state.time + i) * 10;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = night ? "rgba(140,180,220,0.12)" : "rgba(200,245,255,0.28)";
    ctx.fillRect(0, 0, OCEAN.w, 170);
    ctx.fillStyle = night ? "rgba(200,220,255,0.08)" : "rgba(255,255,255,0.18)";
    for (let x = 0; x < OCEAN.w; x += 40) {
      const y = 150 + Math.sin(x * 0.04 + state.time * 3) * 8;
      ctx.beginPath(); ctx.ellipse(x, y, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (!night) drawFoamBand(0, 142, OCEAN.w, state.time);
    if (night) {
      ctx.fillStyle = "#6ef0e0";
      for (let i = 0; i < 80; i++) {
        const bx = (i * 173 + state.time * 14) % OCEAN.w;
        const by = 260 + ((i * 97 + 50) % (OCEAN.h - 340));
        const tw = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(state.time * 2.5 + i * 1.7));
        ctx.globalAlpha = tw * 0.85;
        ctx.beginPath(); ctx.arc(bx, by, i % 6 === 0 ? 1.9 : 1.15, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if ((canSurfaceNow() || bagIsFull()) && !scoopBlocksSurface()) {
      ctx.globalAlpha = bagIsFull() ? 0.85 : clamp((280 - player.y) / 100, 0, 0.85);
      ctx.fillStyle = "#fff";
      ctx.font = "700 16px Fredoka, Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(compactHud() ? "SURFACE" : "SURFACE  ·  SPACE or click", OCEAN.w / 2, 70);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "#b89458";
    ctx.beginPath(); ctx.moveTo(0, OCEAN.h);
    for (let x = 0; x <= OCEAN.w; x += 30) ctx.lineTo(x, OCEAN.h - 54 - Math.sin(x * 0.01) * 16);
    ctx.lineTo(OCEAN.w, OCEAN.h); ctx.closePath(); ctx.fill();
    const sand = ctx.createLinearGradient(0, OCEAN.h - 70, 0, OCEAN.h);
    sand.addColorStop(0, "rgba(210,180,110,0.28)");
    sand.addColorStop(1, "rgba(90,64,32,0.35)");
    ctx.fillStyle = sand;
    ctx.fillRect(0, OCEAN.h - 70, OCEAN.w, 70);
    if (state.unlocked[1]) {
      ctx.fillStyle = "rgba(46, 140, 118, 0.28)";
      ctx.beginPath(); ctx.moveTo(1480, OCEAN.h);
      for (let x = 1480; x <= OCEAN.w; x += 30) ctx.lineTo(x, OCEAN.h - 54 - Math.sin(x * 0.01) * 16);
      ctx.lineTo(OCEAN.w, OCEAN.h); ctx.closePath(); ctx.fill();
    }
    drawDiveBeds();
    drawDecorOcean();
    if (state.splash) {
      const u = 1 - clamp(state.splash.life / state.splash.max, 0, 1);
      ctx.strokeStyle = "rgba(230,250,255," + (0.75 * (1 - u)) + ")";
      ctx.lineWidth = 4 - u * 2;
      ctx.beginPath();
      ctx.ellipse(state.splash.x, state.splash.y, 18 + u * 90, 8 + u * 32, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(180,230,255," + (0.4 * (1 - u)) + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(state.splash.x, state.splash.y, 10 + u * 56, 5 + u * 18, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(220,250,255,0.35)";
    for (const b of bubbles) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); }
    drawOceanScenery();
    const list = oceanFish.filter((f) => !f.caught).sort((a, b) => a.y - b.y);
    for (const f of list) {
      if (night) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "rgba(70, 230, 255, 0.28)";
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, SPECIES[f.s].size * 1.2, SPECIES[f.s].size * 0.72, f.ang, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (f.rare) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "rgba(255, 210, 70, 0.48)";
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, SPECIES[f.s].size * 1.85, SPECIES[f.s].size * 1.15, f.ang, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (f.tease) {
        ctx.save();
        ctx.globalAlpha = 0.72;
        ctx.filter = "brightness(0.35) saturate(1.6)";
        drawFishBody(SPECIES[1], f.x, f.y, f.ang, 1.35, state.time + f.ph);
        ctx.filter = "none";
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "rgba(47,125,255,0.35)";
        ctx.beginPath(); ctx.ellipse(f.x, f.y, 28, 16, f.ang, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#9ef0ff";
        ctx.font = "800 14px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Blue Tang?", f.x, f.y - 26 + Math.sin(state.time * 5) * 3);
        continue;
      }
      let dang = f.ang;
      if (f.s === 0) dang += (f.darting ? 0.18 : -0.06) * Math.sin(state.time * 14 + f.ph);
      else if (f.s === 2) dang += Math.sin(state.time * 0.85 + f.ph) * 0.32;
      else if (f.s === 3) dang += Math.sin(state.time * 0.4 + f.ph) * 0.08;
      else if (f.s === 4) dang += Math.sin(state.time * 2.35 + f.ph) * 0.22;
      if (f.verb === "dash") {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(158,240,255,0.55)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x - (f.dashDir || 1) * 34, f.y);
        ctx.stroke();
        ctx.restore();
      } else if (f.verb === "sit") {
        const sitting = (f.sitT || 0) >= 0.48;
        ctx.save();
        ctx.strokeStyle = sitting ? "rgba(255,246,232,0.7)" : "rgba(158,240,255,0.45)";
        ctx.lineWidth = sitting ? 2.4 : 1.6;
        ctx.beginPath();
        ctx.ellipse(f.sitCx || f.x, f.sitCy || f.y, sitting ? 18 : 28, sitting ? 8 : 16, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (f.verb === "yank") {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(255,246,232,0.55)";
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(f.x, f.y);
        ctx.stroke();
        ctx.restore();
      }
      drawFishBody(SPECIES[f.s], f.x, f.y, dang, SPECIES[f.s].size / 15 * (f.rare ? 1.18 : 1), state.time + f.ph);
      if (f.rare) {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.ang);
        ctx.strokeStyle = "#ffd24a";
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, SPECIES[f.s].size * 1.35, SPECIES[f.s].size * 0.78, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,246,232,0.85)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, SPECIES[f.s].size * 1.55, SPECIES[f.s].size * 0.95, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "#ffd24a";
        ctx.font = state.shinyCallout > 0 ? "800 18px Fredoka, sans-serif" : "800 13px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SHINY", f.x, f.y - 28 + Math.sin(state.time * 6) * 2);
        if (state.shinyCallout > 0) {
          const bounce = Math.sin(state.time * 8) * 6;
          ctx.fillStyle = "#ffe27a";
          ctx.font = "800 22px Fredoka, sans-serif";
          ctx.fillText("SHINY!", f.x, f.y - 52 + bounce);
          ctx.save();
          ctx.translate(f.x, f.y - 72 + bounce);
          ctx.fillStyle = "#ffd24a";
          ctx.strokeStyle = "rgba(80,50,10,0.45)";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(0, 16);
          ctx.lineTo(10, 0);
          ctx.lineTo(3, 2);
          ctx.lineTo(3, -12);
          ctx.lineTo(-3, -12);
          ctx.lineTo(-3, 2);
          ctx.lineTo(-10, 0);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
          ctx.restore();
        }
      }
    }
    if (state.catchClimax && state.catchClimax.fish) {
      const f = state.catchClimax.fish;
      const tug = 0.5 + 0.5 * Math.sin(state.time * 26);
      ctx.save();
      ctx.strokeStyle = f.rare
        ? "rgba(255,210,74," + (0.5 + tug * 0.45) + ")"
        : state.catchClimax.sitScoop
          ? "rgba(158,240,255," + (0.5 + tug * 0.4) + ")"
          : state.catchClimax.snap
            ? "rgba(255,210,122," + (0.48 + tug * 0.4) + ")"
            : "rgba(255,246,232," + (0.42 + tug * 0.4) + ")";
      ctx.lineWidth = 2.6 + tug * 2.2;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      const mx = (player.x + f.x) / 2;
      const my = (player.y + f.y) / 2 + Math.sin(state.time * 20) * 7;
      ctx.quadraticCurveTo(mx, my, f.x, f.y);
      ctx.stroke();
      ctx.restore();
    }
    drawNearMiss();
    drawCone();
    drawDiver(player.x, player.y, player.facing, player.bob);
    for (const f of list) {
      if (f === player.target || !fishInCone(f)) continue;
      ctx.fillStyle = "#ffe27a";
      ctx.font = "800 22px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("!", f.x, f.y - 22 + Math.sin(state.time * 8) * 2);
    }
    if (player.catchProg > 0 && (player.target || player.scoopLock || catchHolding())) {
      const f = player.target || player.scoopLock;
      const bx = f ? f.x : player.x + Math.cos(player.facing) * 40;
      const by = f ? f.y - 38 : player.y - 44;
      const wbar = 56;
      const col = f ? SPECIES[f.s].color : "#9ef0ff";
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      roundRect(bx - wbar / 2, by, wbar, 11, 4); ctx.fill();
      ctx.fillStyle = col;
      roundRect(bx - wbar / 2, by, wbar * clamp(player.catchProg, 0, 1), 11, 4); ctx.fill();
      ctx.strokeStyle = "rgba(255,246,232,0.55)";
      ctx.lineWidth = 1.2;
      roundRect(bx - wbar / 2, by, wbar, 11, 4); ctx.stroke();
    }
    if (state.escapeBar) {
      const e = state.escapeBar;
      const u = clamp(e.life / e.max, 0, 1);
      const wbar = 52 * (0.28 + 0.72 * u);
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.65 * u;
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      roundRect(e.x - wbar / 2, e.y, wbar, 10, 4); ctx.fill();
      ctx.fillStyle = "#ff8a7a";
      roundRect(e.x - wbar / 2, e.y, wbar * e.prog * u, 10, 4); ctx.fill();
      ctx.restore();
    }
    if (state.zoneTitle) {
      const u = clamp(state.zoneTitle.life / state.zoneTitle.max, 0, 1);
      const t = 1 - u;
      const a = t < 0.22 ? t / 0.22 : t > 0.62 ? (1 - t) / 0.38 : 1;
      ctx.save();
      ctx.globalAlpha = a * 0.92;
      ctx.font = "800 56px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillStyle = "rgba(8, 28, 32, 0.35)";
      ctx.fillText(state.zoneTitle.text, cam.x + 2, cam.y - 70);
      ctx.fillStyle = "#9ef0ff";
      ctx.fillText(state.zoneTitle.text, cam.x, cam.y - 72);
      ctx.restore();
    }
  }
  function drawDecorOcean() {
    const spots = [
      [180, 1880, 1], [420, 1860, 2], [700, 1900, 1], [1100, 1870, 3],
      [1500, 1890, 2], [1900, 1860, 1], [2300, 1888, 3], [980, 1840, 2],
      [260, 700, 1], [2100, 900, 2], [1600, 1400, 1], [600, 1500, 3],
      [1200, 500, 4], [1100, 620, 1], [1400, 580, 2], [1000, 740, 3],
      [1550, 700, 1], [1260, 820, 4],
      [320, 1280, 1], [780, 1340, 2], [1400, 1220, 3], [2000, 1380, 1],
      [480, 1560, 2], [980, 1620, 1], [1680, 1500, 3], [2200, 1600, 2],
      [240, 1760, 3], [860, 1720, 4], [1320, 1800, 1], [1880, 1740, 2],
    ];
    for (const [x, y, kind] of spots) {
      if (kind === 4) {
        ctx.fillStyle = "#5a6a70";
        ctx.beginPath(); ctx.ellipse(x, y, 30, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#6d7c82";
        ctx.beginPath(); ctx.ellipse(x - 18, y + 5, 18, 12, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#4a585c";
        ctx.beginPath(); ctx.ellipse(x + 16, y + 6, 14, 10, 0.25, 0, Math.PI * 2); ctx.fill();
      } else if (kind === 1) {
        ctx.strokeStyle = "#1f7a3a"; ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          const ox = x + i * 7;
          ctx.moveTo(ox, y);
          ctx.quadraticCurveTo(ox + Math.sin(state.time * 1.5 + i) * 10, y - 40, ox + Math.sin(state.time * 1.2 + i) * 8, y - 80);
          ctx.stroke();
        }
      } else if (kind === 2) {
        ctx.fillStyle = "#e85d6a";
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + state.time * 0.2;
          ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 6, y + Math.sin(a) * 4, 14, 5, a, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = "#ffd27a"; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "#c45ec8";
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16, y - 40); ctx.lineTo(x + 8, y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#7ad0e8";
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12, y - 34); ctx.lineTo(x + 4, y); ctx.closePath(); ctx.fill();
      }
    }
    // deeper sand bands so the descent isn't void
    ctx.save();
    for (const [yy, col, amp] of [[1240, "rgba(180,150,80,0.16)", 14], [1480, "rgba(160,130,70,0.2)", 18], [1720, "rgba(140,110,60,0.22)", 12]]) {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(0, yy + 40);
      for (let x = 0; x <= OCEAN.w; x += 28) ctx.lineTo(x, yy + Math.sin(x * 0.012 + yy) * amp);
      ctx.lineTo(OCEAN.w, yy + 80); ctx.lineTo(0, yy + 80); ctx.closePath(); ctx.fill();
    }
    // distant hull silhouette
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = "#0a1820";
    ctx.beginPath();
    ctx.moveTo(1680, 1520);
    ctx.lineTo(1760, 1420);
    ctx.lineTo(2280, 1400);
    ctx.lineTo(2380, 1500);
    ctx.lineTo(2320, 1580);
    ctx.lineTo(1720, 1590);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(1980, 1320, 18, 90);
    ctx.beginPath();
    ctx.moveTo(1990, 1320); ctx.lineTo(2060, 1360); ctx.lineTo(1990, 1370);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    if (state.unlocked[1]) {
      const reefSpots = [
        [1760, 1080, 2], [1920, 1040, 3], [2080, 1120, 2], [2240, 1060, 3],
        [1840, 1280, 3], [2160, 1220, 2], [2360, 1300, 3], [1980, 1360, 2],
        [1720, 1460, 2], [2280, 1480, 3], [2440, 1560, 2], [1860, 1600, 3],
        [2100, 1680, 2], [2320, 1720, 3], [1960, 1780, 2], [1680, 1640, 4],
        [2200, 1140, 4], [1800, 1180, 4], [2400, 1400, 4], [2040, 1020, 2],
        [1900, 1480, 3], [2140, 1580, 2],
      ];
      for (const [x, y, kind] of reefSpots) {
        if (kind === 4) {
          ctx.fillStyle = "#4e6a68";
          ctx.beginPath(); ctx.ellipse(x, y, 28, 15, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#62807c";
          ctx.beginPath(); ctx.ellipse(x - 16, y + 4, 16, 11, -0.2, 0, Math.PI * 2); ctx.fill();
        } else if (kind === 2) {
          ctx.fillStyle = "#e85d6a";
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 + state.time * 0.2;
            ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 6, y + Math.sin(a) * 4, 14, 5, a, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = "#ffd27a"; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = "#c45ec8";
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16, y - 40); ctx.lineTo(x + 8, y); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#3ec8b0";
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12, y - 34); ctx.lineTo(x + 4, y); ctx.closePath(); ctx.fill();
        }
      }
    }
    if (state.unlocked[2]) drawGoldGarden(LM_GOLD.x, LM_GOLD.y);
    if (state.unlocked[3]) drawKoiGate(LM_KOI.x, LM_KOI.y);
    if (state.unlocked[4]) drawTurtleMeadow(LM_TURTLE.x, LM_TURTLE.y);
    for (let s = 5; s < SPECIES.length; s++) {
      if (!state.unlocked[s]) continue;
      const lm = landmarkForSpecies(s);
      if (lm) drawDeepLandmark(s, lm.x, lm.y);
    }
    if (OCEAN.h > OCEAN_BASE_H) {
      for (let y0 = OCEAN_BASE_H; y0 < OCEAN.h - 80; y0 += ZONE_STEP) drawForeverBand(y0);
    }
  }
  function drawCone() {
    const range = coneRange();
    const flash = state.catchClimax
      ? 0.55 + 0.45 * Math.sin(state.time * 28)
      : (state.coneFlash > 0 ? clamp(state.coneFlash / 0.22, 0, 1) : 0);
    ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.facing);
    const grd = ctx.createRadialGradient(0, 0, 10, 0, 0, range);
    const inner = flash > 0
      ? (player.target && player.target.rare ? "rgba(255,220,80," + (0.42 + flash * 0.4) + ")" : "rgba(200,255,255," + (0.38 + flash * 0.4) + ")")
      : "rgba(120,230,255,0.22)";
    grd.addColorStop(0, inner);
    grd.addColorStop(1, "rgba(120,230,255,0.02)");
    ctx.fillStyle = grd;
    const half = coneHalf();
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.arc(0, 0, range, -half, half); ctx.closePath(); ctx.fill();
    if (flash > 0) {
      ctx.strokeStyle = player.target && player.target.rare
        ? "rgba(255,210,74," + (0.75 + flash * 0.25) + ")"
        : "rgba(255,255,255," + (0.7 + flash * 0.3) + ")";
      ctx.lineWidth = 5 + flash * 4;
    } else if (player.target) {
      ctx.strokeStyle = "rgba(255,255,255," + (0.5 + 0.4 * Math.sin(state.time * 9)) + ")";
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = "rgba(180,250,255,0.45)"; ctx.lineWidth = 2;
    }
    ctx.stroke();
    ctx.restore();
  }
  function drawWorld() {
    ctx.fillStyle = "#07141c";
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(cam.z, cam.z);
    ctx.translate(-cam.x, -cam.y);
    if (state.scene === "shop") drawShop(); else drawOcean();
    for (const h of stockHops) {
      if (!h.launched) continue;
      const u = 1 - clamp(h.life / (h.max || 0.32), 0, 1);
      const pop = 0.92 + Math.sin(u * Math.PI) * 0.28;
      ctx.globalAlpha = clamp(h.life / 0.08, 0, 1);
      if (h.rare) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "rgba(255,210,74,0.4)";
        ctx.beginPath(); ctx.ellipse(h.x, h.y, 18, 11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      drawFishBody(SPECIES[h.s], h.x, h.y, 0.35 + u * 0.8, pop, state.time);
      ctx.globalAlpha = 1;
    }
    for (const r of tankRipples) {
      const u = 1 - clamp(r.life / r.max, 0, 1);
      ctx.strokeStyle = "rgba(230,250,255," + (0.55 * (1 - u)) + ")";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, 10 + u * 36, 5 + u * 12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life / 0.5, 0, 1);
      ctx.fillStyle = p.col;
      ctx.beginPath();
      if (p.kind === "dust") ctx.ellipse(p.x, p.y, p.r, p.r * 0.45, 0, 0, Math.PI * 2);
      else ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (player.goto) {
      const pulse = 0.5 + 0.4 * Math.sin(state.time * 7);
      const act = !!player.pendingAct;
      const r = (act ? 22 : 14) + Math.sin(state.time * 6) * 4;
      ctx.strokeStyle = "rgba(255,226,122," + pulse + ")";
      ctx.lineWidth = act ? 4.2 : 3;
      ctx.beginPath(); ctx.arc(player.goto.x, player.goto.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(255,246,180," + (0.28 + pulse * 0.25) + ")";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(player.goto.x, player.goto.y, r + 8, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(255,226,122,0.32)";
      ctx.beginPath(); ctx.arc(player.goto.x, player.goto.y, 6, 0, Math.PI * 2); ctx.fill();
    }
    for (const c of pathCoins) {
      const bob = Math.sin(state.time * 5 + c.bob) * 4;
      const a = clamp(c.life / 0.4, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = "#ffd24a";
      ctx.beginPath(); ctx.ellipse(c.x, c.y + bob, 11, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#c49210"; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = "#a87410";
      ctx.font = "800 11px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("$", c.x, c.y + bob + 4);
      ctx.globalAlpha = 1;
    }
    for (const p of pops) {
      const scr = worldToScreen(p.x, p.y);
      ctx.globalAlpha = clamp(p.life, 0, 1) * hudReadoutClear(scr.x, scr.y);
      ctx.fillStyle = p.col;
      const sc = p.scale || 1;
      const base = (p.text && p.text.length > 18 ? 13 : 16) * sc;
      ctx.font = "800 " + Math.round(base) + "px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
    for (const c of worldCoins) {
      const fat = c.fat || 1;
      const scr = worldToScreen(c.x, c.y);
      ctx.globalAlpha = hudReadoutClear(scr.x, scr.y);
      ctx.fillStyle = "#ffd24a";
      ctx.beginPath(); ctx.ellipse(c.x, c.y, 10 * fat, 8 * fat, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#c49210"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#a87410";
      ctx.font = "800 " + Math.round(11 * fat) + "px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("$", c.x, c.y + 4 * fat);
      ctx.globalAlpha = 1;
    }
    for (const r of tankReceipts) {
      const a = clamp(r.life / 0.22, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(r.x, r.y);
      ctx.rotate(-0.08);
      ctx.fillStyle = "#fff6e8";
      roundRect(-14, -10, 28, 20, 3); ctx.fill();
      ctx.strokeStyle = r.tint ? r.tint.stroke : "#c49210";
      ctx.lineWidth = 1.4;
      roundRect(-14, -10, 28, 20, 3); ctx.stroke();
      ctx.fillStyle = "#c49210";
      ctx.fillRect(-10, -6, 12, 2);
      ctx.fillRect(-10, -2, 16, 2);
      ctx.fillStyle = "#ffe27a";
      ctx.beginPath(); ctx.ellipse(8, 4, 5.5, 4.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#a87410";
      ctx.font = "800 8px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("$", 8, 7);
      ctx.restore();
    }
    ctx.restore();
  }

  // ===== HUD =====
  function nearestOceanFish() {
    let best = null, bestD = 1e9;
    for (const f of oceanFish) {
      if (f.caught || f.tease) continue;
      const d = Math.hypot(f.x - player.x, f.y - player.y);
      if (d < bestD) { bestD = d; best = f; }
    }
    return best ? { x: best.x, y: best.y } : null;
  }
  function stockableTankTarget() {
    for (let i = 0; i < SPECIES.length; i++) {
      if (state.unlocked[i] && state.bag.some(s => s === i)) return tankWalkPoint(i);
    }
    return null;
  }
  function activeVIP() {
    for (const c of customers) {
      if (c.vip && (c.state === "tank" || c.state === "browse")) return c;
    }
    return null;
  }
  function cashierHandlingIt() {
    return !!state.hiredCashier && !playerNearRegister();
  }
  function firstSessionReached() {
    if (state.missionDone) return 6;
    let r = 0;
    if (state.didMove || (state.tutorial | 0) >= 1 || state.scene === "ocean") r = 1;
    if ((state.tutorial | 0) >= 1 || state.scene === "ocean" || state.pendingScene === "ocean") r = 2;
    if (((state.caughtCount && state.caughtCount[0]) | 0) >= 1) r = 2;
    if (((state.caughtCount && state.caughtCount[0]) | 0) >= 5 || bagIsFull() || state.didFirstStock) r = 3;
    if (state.didFirstStock) r = 4;
    if (state.didFirstCollect || state.didFirstSale || (state.money | 0) > 0) r = 5;
    // peakMoney / unlock latch so spending Tang $60 cannot drop 6/6 → 5/6.
    if ((state.didFirstCollect || state.didFirstSale) &&
        ((state.money | 0) >= 15 || (state.peakMoney | 0) >= 15 || state.didFirstUnlock || state.unlocked[1])) {
      r = 6;
    }
    return r;
  }
  function firstSessionIndex() {
    if (state.missionDone) return -1;
    const ocean = state.scene === "ocean" || state.pendingScene === "ocean";
    if (ocean) {
      if (bagIsFull()) return 3;
      if (((state.caughtCount && state.caughtCount[0]) | 0) >= 5 && state.bag.length > 0) return 3;
      return 2;
    }
    if (bagHasStockable()) return 4;
    if (cashNeedsCollect()) return 5;
    if (inDiveZone() && state.surfaceLock <= 0 && !bagHasStockable() && !cashNeedsCollect()) return 1;
    return 0;
  }
  function ribbonHidesForDock() {
    if (cashNeedsCollect()) return false;
    if (state.scene === "shop" && inDiveZone() && state.surfaceLock <= 0 && !bagHasStockable()) return true;
    if (state.scene === "ocean" && canSurfaceNow()) return true;
    return false;
  }
  function currentGoal() {
    if (!ribbonLockedToGoal() && state.scene === "shop" && state.boatHint > 0 && !bagHasStockable()) {
      return { text: "The boat is ready — $35 on the right dock", target: { x: BOAT.x, y: BOAT.y } };
    }
    if (!state.missionDone) {
      const step = firstSessionIndex();
      if (step === 0) return { text: "Walk to the glowing dock", target: { x: 880, y: 980 } };
      if (step === 1) return { text: compactHud() ? "Tap DIVE" : "Press SPACE or click to DIVE", target: { x: 880, y: 980 } };
      if (step === 2) {
        const n = Math.min(5, (state.caughtCount && state.caughtCount[0]) | 0);
        const shiny = firstRareFish();
        const mark = diveLandmark();
        if (shiny && (state.shinyCallout > 0 || !state.caughtRare) && n === 0) {
          return { text: "Catch the SHINY — then 5 Clownfish", target: { x: shiny.x, y: shiny.y } };
        }
        if (state.didFirstStock && !state.unlocked[1]) {
          const tease = firstTeaseFish();
          if (tease) return { text: "A blue flash in the deep — Maya asked for Tang", target: { x: tease.x, y: tease.y } };
          return { text: "Catch more — Maya wants a Blue Tang", target: nearestOceanFish() };
        }
        if (mark && n < 5) {
          return { text: "Catch 5 at the glowing reef  ·  " + n + "/5", target: mark };
        }
        return { text: "Catch 5  ·  " + n + "/5", target: nearestOceanFish() };
      }
      if (step === 3) return { text: compactHud() ? "Tap SURFACE" : "Surface — SPACE or click", target: { x: player.x, y: 140 } };
      if (step === 4 && bagHasStockable() && state.scene === "shop") {
        return { text: "Stock the glowing tank", target: stockableTankTarget() || { x: TANK_POS[0].x + TANK_W / 2, y: TANK_POS[0].y + TANK_H / 2 } };
      }
      if (step === 5 && state.registerCash > 0) return { text: "Collect  $" + state.registerCash, target: { x: REGISTER.x + REGISTER.w / 2, y: REGISTER.y + REGISTER.h / 2 } };
    }
    if (state.scene === "ocean" || state.pendingScene === "ocean") {
      if (state.scene !== "ocean") {
        return { text: "Hold or tap a fish — the cone locks on until the bar fills", target: null };
      }
      if (bagIsFull()) {
        return { text: compactHud() ? "Bag full — tap SURFACE" : "Bag full — SPACE or click to surface", target: { x: player.x, y: 140 } };
      }
      if (state.expedition) {
        return { text: "Expedition · catch rares, then surface", target: state.bag.length > 0 ? { x: player.x, y: 140 } : nearestOceanFish() };
      }
      if (state.bag.length > 0) {
        if (!haulReadyToSurface()) {
          const n = state.bag.length | 0;
          if (state.shinyHold > 0 && state.shinyHoldName) {
            return { text: "Shiny " + state.shinyHoldName + "! Keep scooping  ·  " + n + "/3", target: nearestOceanFish() };
          }
          return { text: "Nice catch! Keep scooping  ·  " + n + "/3", target: nearestOceanFish() };
        }
        if (state.shinyHold > 0 && state.shinyHoldName) {
          return { text: "Shiny " + state.shinyHoldName + "! Grab more, or swim up to stock", target: { x: player.x, y: 140 } };
        }
        return { text: "Nice catch! Grab more, or swim up to stock", target: { x: player.x, y: 140 } };
      }
      const shiny = firstRareFish();
      if (shiny && (state.shinyCallout > 0 || !state.caughtRare)) {
        return { text: "Point the glowing cone at the SHINY clownfish", target: { x: shiny.x, y: shiny.y } };
      }
      if (!state.unlocked[1] && (state.divesThisSession >= 2 || state.didFirstStock)) {
        const tease = firstTeaseFish();
        if (tease) return { text: "A blue flash in the deep — rumor of Blue Tang", target: { x: tease.x, y: tease.y } };
      }
      return { text: "Hold or tap a fish — the cone locks on until the bar fills", target: nearestOceanFish() };
    }
    if (nearBoat() && expeditionUnlocked() && !state.expedition) {
      return { text: "Press SPACE to start an expedition ($35)", target: { x: BOAT.x, y: BOAT.y } };
    }
    if (state.scene === "shop" && bagHasStockable()) {
      return { text: "Walk into the glowing tank to stock your catch", target: stockableTankTarget() || { x: TANK_POS[0].x + TANK_W / 2, y: TANK_POS[0].y + TANK_H / 2 } };
    }
    if (state.scene === "shop" && cashNeedsCollect()) {
      return { text: "Collect  $" + state.registerCash + "  ·  stand in the till glow", target: tillWorld() };
    }
    if (inDiveZone() && state.surfaceLock <= 0) {
      return { text: compactHud() ? "Tap DIVE" : "Press SPACE or click to DIVE", target: { x: 880, y: 980 } };
    }
    const vip = !ribbonLockedToGoal() ? activeVIP() : null;
    if (vip) {
      const want = clamp((vip.want != null ? vip.want : vip.tank) | 0, 0, 4);
      const t = TANK_POS[want];
      return { text: "A VIP wants " + SPECIES[want].name + " — stock that tank", target: { x: t.x + TANK_W / 2, y: t.y + TANK_H / 2 } };
    }
    if (state.stock.some(n => n > 0) && state.registerCash === 0) {
      return { text: "Customers are on the way — wait at the cashier", target: { x: REGISTER.x + REGISTER.w / 2, y: REGISTER.y + REGISTER.h / 2 } };
    }
    return { text: "Walk to the glowing DIVE dock and press SPACE", target: { x: 880, y: 980 } };
  }
  function goalText() {
    return currentGoal().text;
  }
  function guideTarget() {
    return currentGoal().target;
  }
  function drawGuideArrow() {
    const tgt = guideTarget();
    if (!tgt) return;
    const ps = worldToScreen(player.x, player.y);
    const ts = worldToScreen(tgt.x, tgt.y);
    const dx = ts.x - ps.x, dy = ts.y - ps.y;
    const d = Math.hypot(dx, dy);
    if (d < 48) return;
    const ang = Math.atan2(dy, dx);
    const bounce = Math.sin(state.time * 5) * 4;
    const dist = 48 + bounce;
    const ax = ps.x + Math.cos(ang) * dist, ay = ps.y + Math.sin(ang) * dist;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(ang);
    ctx.fillStyle = "#ffe27a";
    ctx.strokeStyle = "rgba(80,50,10,0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-8, 9);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, -9);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
    if (d > 220 && state.boatHint > 0 && tgt.x === BOAT.x && tgt.y === BOAT.y) {
      ctx.fillStyle = "#ffe27a";
      ctx.font = "800 12px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BOAT", ax + Math.cos(ang) * 22, ay + Math.sin(ang) * 22 + 4);
    }
  }
  function drawStockWalkCue() {
    if (state.mode !== "play" || state.scene !== "shop") return;
    if (!bagHasStockable()) return;
    const i = glowingStockIndex();
    if (i < 0) return;
    if (nearStockPad(i)) return;
    const t = TANK_POS[i];
    const tgt = stockableTankTarget() || tankWalkPoint(i);
    const ts = worldToScreen(t.x + TANK_W / 2, t.y + TANK_H * 0.42);
    const on = ts.x > 36 && ts.x < W - 36 && ts.y > 28 && ts.y < H - 36;
    const pulse = 0.55 + 0.35 * Math.sin(state.time * 6);
    const label = "walk here to stock";
    if (on) {
      const bounce = Math.sin(state.time * 5) * 5;
      const ax = ts.x, ay = ts.y - 52 + bounce;
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "#ffe27a";
      ctx.strokeStyle = "rgba(80,50,10,0.45)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-9, 10);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-9, -10);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.font = "800 13px Nunito, sans-serif";
      const tw = Math.min(ctx.measureText(label).width + 22, 240);
      const chip = hudBox(ax - tw / 2, ay - 36, tw, 26);
      card(chip.x, chip.y, chip.w, chip.h, "rgba(18, 48, 40, " + (0.82 + pulse * 0.1) + ")");
      ctx.fillStyle = "#ffe27a";
      ctx.textAlign = "center";
      ctx.fillText(label, chip.x + chip.w / 2, chip.y + 18);
      btn("goto-stock", chip.x, chip.y, chip.w, chip.h);
      return;
    }
    const ps = worldToScreen(player.x, player.y);
    const dest = worldToScreen(tgt.x, tgt.y);
    const ang = Math.atan2(dest.y - ps.y, dest.x - ps.x);
    const cx = clamp(ts.x, 88, W - 88);
    const cy = clamp(ts.y, topHudFloor() + 10, H - 96);
    ctx.font = "800 13px Nunito, sans-serif";
    const tw = Math.min(ctx.measureText(label).width + 36, 260);
    const chip = hudBox(cx - tw / 2, cy - 16, tw, 32);
    card(chip.x, chip.y, chip.w, chip.h, "rgba(40, 160, 180," + (0.74 + pulse * 0.16) + ")");
    ctx.fillStyle = "#fff6e8";
    ctx.textAlign = "center";
    ctx.fillText(label, chip.x + chip.w / 2, chip.y + 21);
    ctx.save();
    ctx.translate(chip.x + 14, chip.y + 16);
    ctx.rotate(ang);
    ctx.fillStyle = "#ffe27a";
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-5, 5);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-5, -5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    btn("goto-stock", chip.x, chip.y, chip.w, chip.h);
  }
  function drawDockCorner() {
    if (state.mode !== "play" || state.scene !== "shop") return;
    if (cashNeedsCollect()) return;
    if (!dockOffScreen()) return;
    const b = dockCornerBox();
    const pulse = 0.55 + 0.35 * Math.sin(state.time * 6);
    card(b.x, b.y, b.w, b.h, "rgba(40, 160, 180," + (0.78 + pulse * 0.16) + ")");
    ctx.fillStyle = "#fff6e8";
    ctx.font = (b.h > 38 ? "800 20px" : "800 16px") + " Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("→ DIVE", b.x + b.w / 2, b.y + b.h / 2 + 6);
    btn("goto-dock", b.x, b.y, b.w, b.h);
  }
  function drawTillCollectCue() {
    if (state.mode !== "play" || state.scene !== "shop") return;
    if (!cashNeedsCollect()) return;
    if (inTillGlow()) return;
    const t = tillWorld();
    const ts = worldToScreen(t.x, t.y);
    const on = !tillOffScreen();
    const pulse = 0.55 + 0.35 * Math.sin(state.time * 6);
    const cash = "$" + state.registerCash;
    const label = compactHud() ? "COLLECT  " + cash : "→ TILL  ·  collect  " + cash;
    if (on) {
      const bounce = Math.sin(state.time * 5) * 5;
      const ax = ts.x, ay = ts.y - 64 + bounce;
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = "#ffe27a";
      ctx.strokeStyle = "rgba(80,50,10,0.45)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-9, 10);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-9, -10);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.font = "800 14px Nunito, sans-serif";
      const tw = Math.min(ctx.measureText(label).width + 24, 280);
      const chip = dodgeUpgradeTray(hudBox(ax - tw / 2, ay - 38, tw, 28));
      card(chip.x, chip.y, chip.w, chip.h, "rgba(80, 48, 10, " + (0.84 + pulse * 0.1) + ")");
      ctx.fillStyle = "#ffe27a";
      ctx.textAlign = "center";
      ctx.fillText(label, chip.x + chip.w / 2, chip.y + 19);
      btn("goto-till", chip.x, chip.y, chip.w, chip.h);
      return;
    }
    const b = tillCornerBox();
    card(b.x, b.y, b.w, b.h, "rgba(200, 140, 30," + (0.8 + pulse * 0.16) + ")");
    ctx.fillStyle = "#fff6e8";
    ctx.font = (b.h > 38 ? "800 18px" : "800 15px") + " Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(compactHud() ? "→ TILL" : "→ TILL  ·  collect", b.x + b.w / 2, b.y + b.h / 2 + 6);
    btn("goto-till", b.x, b.y, b.w, b.h);
  }
  function drawSurfaceAssist() {
    if (state.mode !== "play" || state.scene !== "ocean") return;
    if (bagIsFull() || nearSurface() || player.y < 300) return;
    const pulse = 0.55 + 0.35 * Math.sin(state.time * 6);
    const w = compactHud() ? 118 : 132;
    const h = compactHud() ? 42 : 36;
    const sz = actionBtnSize();
    const b = hudBox(W - 16 - w, H - sz.pad - 12 - h, w, h);
    card(b.x, b.y, b.w, b.h, "rgba(40, 160, 180," + (0.78 + pulse * 0.16) + ")");
    ctx.fillStyle = "#fff6e8";
    ctx.font = (b.h > 38 ? "800 18px" : "800 15px") + " Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("↑ SURFACE", b.x + b.w / 2, b.y + b.h / 2 + 6);
    btn("goto-surface", b.x, b.y, b.w, b.h);
  }
  function drawBoatEdgeHint() {
    if (state.boatHint <= 0 || state.scene !== "shop") return;
    const ts = worldToScreen(BOAT.x, BOAT.y);
    if (ts.x > 70 && ts.x < W - 70 && ts.y > 70 && ts.y < H - 90) return;
    const cx = clamp(ts.x, 80, W - 80);
    const cy = clamp(ts.y, 90, H - 120);
    const pulse = 0.55 + 0.35 * Math.sin(state.time * 6);
    ctx.globalAlpha = clamp(state.boatHint / 0.4, 0, 1);
    card(cx - 46, cy - 16, 92, 32, "rgba(40, 160, 180," + (0.72 + pulse * 0.18) + ")");
    ctx.fillStyle = "#fff6e8";
    ctx.font = "800 16px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BOAT", cx, cy + 6);
    ctx.globalAlpha = 1;
  }
  function card(x, y, w, h, fill) {
    ctx.fillStyle = fill || "rgba(18, 32, 42, 0.78)";
    roundRect(x, y, w, h, 12); ctx.fill();
    ctx.strokeStyle = "rgba(255,230,180,0.18)"; ctx.lineWidth = 1.5;
    roundRect(x, y, w, h, 12); ctx.stroke();
  }
  function drawCoin(x, y, r) {
    ctx.fillStyle = "#ffd24a";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#c49210"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#a87410"; ctx.font = "800 " + Math.round(r * 1.15) + "px Nunito, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("$", x, y + 1);
    ctx.textBaseline = "alphabetic";
  }
  function drawSpeaker(x, y, muted) {
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 5);
    ctx.lineTo(x - 2, y - 5);
    ctx.lineTo(x + 5, y - 11);
    ctx.lineTo(x + 5, y + 11);
    ctx.lineTo(x - 2, y + 5);
    ctx.lineTo(x - 8, y + 5);
    ctx.closePath();
    ctx.fill();
    if (muted) {
      ctx.strokeStyle = "#ff8a7a";
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(x - 12, y - 10); ctx.lineTo(x + 14, y + 10); ctx.stroke();
    } else {
      ctx.strokeStyle = "#fff6e8";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x + 6, y, 6, -0.55, 0.55); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 6, y, 10, -0.5, 0.5); ctx.stroke();
    }
  }
  function drawSaleTalks() {
    const t = saleTalks[0];
    if (!t) return;
    drawSpeech(t, () => {
      const a = clamp(t.life / 0.4, 0, 1);
      const scr = worldToScreen(t.wx, t.wy - 10);
      ctx.font = "800 20px Fredoka, sans-serif";
      const label = t.who ? (t.who + "  ·  " + t.line) : t.line;
      const tw = Math.min(ctx.measureText(label).width + 40, 540);
      const th = 42;
      let x = clamp(scr.x, 200, W - 200);
      let y = clamp(scr.y, 196, H - (actionPromptVisible() ? 210 : 130));
      const till = worldToScreen(REGISTER.x + REGISTER.w / 2, REGISTER.y + 28);
      const tillBox = { x: till.x - 86, y: till.y - 22, w: 172, h: 56 };
      const { muteB, pauseB } = topCtrlBoxes();
      const bump = (box) => {
        const mine = { x: x - tw / 2, y: y - 24, w: tw, h: th };
        if (!boxesOverlap(mine, box, 10)) return;
        const above = box.y - 14;
        const below = box.y + box.h + 28;
        if (above >= 196) y = above;
        else y = clamp(below, 196, H - 130);
        x = clamp(x, 200, W - 200);
      };
      bump(tillBox);
      bump(muteB);
      bump(pauseB);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = t.tint.fill;
      roundRect(x - tw / 2, y - 24, tw, th, 12); ctx.fill();
      ctx.strokeStyle = t.tint.stroke;
      ctx.lineWidth = 2.3;
      roundRect(x - tw / 2, y - 24, tw, th, 12); ctx.stroke();
      ctx.fillStyle = t.tint.ink;
      ctx.textAlign = "center";
      ctx.fillText(label, x, y + 5);
      ctx.restore();
    });
  }
  function boxesOverlap(a, b, pad) {
    const p = pad == null ? 6 : pad;
    return !(a.x + a.w < b.x - p || a.x > b.x + b.w + p || a.y + a.h < b.y - p || a.y > b.y + b.h + p);
  }
  function wrapHudLines(text, maxW) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    if (!words.length) return [""];
    const lines = [];
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
      const next = cur + " " + words[i];
      if (ctx.measureText(next).width <= maxW) cur = next;
      else { lines.push(cur); cur = words[i]; }
    }
    lines.push(cur);
    return lines;
  }
  function ribbonFont(live) {
    if (live && live.big) return "800 15px Nunito, sans-serif";
    if (live) return "800 14px Nunito, sans-serif";
    return "700 13px Nunito, sans-serif";
  }
  function ribbonLayout() {
    const toastLive = !ribbonLockedToGoal() && state.toasts.length && !state.unlockBanner;
    if (ribbonHidesForDock() && !toastLive) return null;
    const live = toastLive ? state.toasts[0] : null;
    const gt = live ? live.msg : goalText();
    if (!gt) return null;
    const { muteB } = topCtrlBoxes();
    const leftPad = 210;
    const rightPad = W - muteB.x + 16;
    const maxW = Math.max(280, Math.min(680, W - leftPad - rightPad));
    let font = ribbonFont(live);
    ctx.font = font;
    const inner = maxW - 28;
    let lines = wrapHudLines(gt, inner);
    if (lines.length > 2) {
      font = live ? "800 12px Nunito, sans-serif" : "700 12px Nunito, sans-serif";
      ctx.font = font;
      lines = wrapHudLines(gt, inner);
    }
    if (lines.length > 2) {
      font = "700 11px Nunito, sans-serif";
      ctx.font = font;
      lines = wrapHudLines(gt, inner);
    }
    if (lines.length > 2) lines = [lines[0], lines.slice(1).join(" ")];
    let tw = 28;
    for (let i = 0; i < lines.length; i++) tw = Math.max(tw, ctx.measureText(lines[i]).width + 28);
    tw = Math.min(Math.ceil(tw + 4), maxW);
    const th = lines.length > 1 ? (live && live.big ? 54 : 50) : (live && live.big ? 36 : 32);
    const gx = clamp(W / 2 - tw / 2, leftPad, W - rightPad - tw);
    return Object.assign(hudBox(gx, 16, tw, th), {
      text: gt,
      lines,
      font,
      col: live ? live.col : "#e8fbff",
      toast: !!live,
    });
  }
  function chipAlpha(box, ribbon) {
    if (!ribbon) return 1;
    if (boxesOverlap(box, ribbon, 10)) return 0.12;
    if (state.camPunch > 0 && box.y < 70) return 0.55;
    return 1;
  }
  function parkChip(box, ribbon) {
    if (!ribbon || !boxesOverlap(box, ribbon, 12)) return box;
    return hudBox(box.x, ribbon.y + ribbon.h + 8, box.w, box.h);
  }
  function drawRibbon(rb) {
    if (!rb) return;
    card(rb.x, rb.y, rb.w, rb.h, rb.toast ? "rgba(18, 36, 44, 0.92)" : "rgba(20, 50, 62, 0.9)");
    ctx.fillStyle = rb.col || "#e8fbff";
    ctx.textAlign = "center";
    ctx.font = rb.font || ribbonFont(rb.toast ? { big: rb.h > 34 } : null);
    const lines = rb.lines && rb.lines.length ? rb.lines : [rb.text];
    const step = lines.length > 1 ? 17 : 0;
    const y0 = rb.y + rb.h / 2 + 5 - step * (lines.length - 1) / 2;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], rb.x + rb.w / 2, y0 + i * step);
    }
  }
  function moneyHudBox(ribbon) {
    return dodgeUpgradeTray(parkChip(hudBox(16, 14, 200, 52), ribbon));
  }
  function drawMoneyReadout(moneyBox) {
    ctx.save();
    ctx.translate(moneyBox.x + 94, moneyBox.y + 26);
    ctx.scale(state.moneyPunch, state.moneyPunch);
    ctx.translate(-(moneyBox.x + 94), -(moneyBox.y + 26));
    card(moneyBox.x, moneyBox.y, moneyBox.w, moneyBox.h);
    drawCoin(moneyBox.x + 28, moneyBox.y + 26, 14);
    ctx.fillStyle = "#fff6e8"; ctx.font = "800 22px Nunito, sans-serif"; ctx.textAlign = "left";
    ctx.fillText(String(state.displayMoney), moneyBox.x + 52, moneyBox.y + 26);
    const ng = nextGoal();
    if (ng) {
      ctx.fillStyle = "#ffe27a";
      ctx.font = "700 11px Nunito, sans-serif";
      ctx.fillText("Next " + ng.name + " $" + ng.cost, moneyBox.x + 52, moneyBox.y + 42);
    }
    ctx.restore();
  }
  function drawHUD() {
    const ribbon = ribbonLayout();
    const moneyBox = moneyHudBox(ribbon);
    ctx.save();
    ctx.globalAlpha = chipAlpha(moneyBox, ribbon);
    drawMoneyReadout(moneyBox);
    ctx.restore();
    const bagBox = dodgeUpgradeTray(parkChip(hudBox(224, 14, 168, 52), ribbon));
    ctx.save();
    ctx.globalAlpha = chipAlpha(bagBox, ribbon);
    ctx.translate(bagBox.x + 84, bagBox.y + 26);
    ctx.scale(state.bagPunch, state.bagPunch);
    ctx.translate(-(bagBox.x + 84), -(bagBox.y + 26));
    card(bagBox.x, bagBox.y, bagBox.w, bagBox.h);
    ctx.fillStyle = "#9ef0ff"; ctx.font = "700 13px Nunito, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("BAG", bagBox.x + 14, bagBox.y + 20);
    ctx.fillStyle = "#fff"; ctx.font = "800 22px Nunito, sans-serif";
    const bagShown = state.bag.length;
    ctx.fillText(bagShown + " / " + bagMax(), bagBox.x + 14, bagBox.y + 42);
    ctx.restore();
    if (bagShown || bagGhosts.length) {
      const pipN = bagShown + bagGhosts.length;
      const bw = Math.min(36 + pipN * 28, 340);
      let ib = hudBox(400, 14, bw, 52);
      if (ribbon && boxesOverlap(ib, ribbon, 12)) {
        ib = hudBox(400, ribbon.y + ribbon.h + 8, bw, 52);
      }
      ctx.save();
      ctx.globalAlpha = chipAlpha(ib, ribbon);
      card(ib.x, ib.y, ib.w, ib.h);
      let pip = 0;
      const drawPip = (s, rare, ghost) => {
        if (pip >= 11) return;
        const px = ib.x + 28 + pip * 28, py = ib.y + 26;
        ctx.save();
        if (ghost) ctx.globalAlpha *= 0.55;
        if (rare) {
          ctx.strokeStyle = "#ffd24a"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(px, py, 14, 8, 0, 0, Math.PI * 2); ctx.stroke();
        }
        drawFishBody(SPECIES[s], px, py, 0, 0.7, state.time + pip);
        if (rare) {
          ctx.fillStyle = "#ffd24a";
          ctx.font = "800 9px Nunito, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("x2", px + 11, py + 12);
        }
        ctx.restore();
        pip++;
      };
      for (let i = 0; i < state.bag.length; i++) {
        drawPip(state.bag[i], !!(state.bagRare && state.bagRare[i]), false);
      }
      for (let i = 0; i < bagGhosts.length; i++) {
        const fade = bagGhosts[i].life == null ? 0.55 : clamp(bagGhosts[i].life / 0.22, 0.12, 0.7);
        ctx.save();
        ctx.globalAlpha *= fade;
        drawPip(bagGhosts[i].s, !!bagGhosts[i].rare, true);
        ctx.restore();
      }
      ctx.restore();
    }
    const sessionY = Math.max(74, moneyBox.y + moneyBox.h + 8, bagBox.y + bagBox.h + 8);
    if (missionVisible()) {
      const reached = Math.max(1, Math.min(6, firstSessionReached() || (firstSessionIndex() + 1)));
      const chip = hudBox(16, sessionY, 176, 30);
      const a = screenBoxAlpha(chip.x, chip.y, chip.w, chip.h);
      if (a > 0.04) {
        ctx.save();
        ctx.globalAlpha = a;
        card(chip.x, chip.y, chip.w, chip.h, "rgba(16, 36, 46, 0.88)");
        ctx.fillStyle = "#ffe27a";
        ctx.font = "800 12px Nunito, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("FIRST SESSION  " + reached + " / 6", chip.x + 12, chip.y + 20);
        ctx.restore();
      }
    } else if (sessionChipVisible()) {
      const goals = state.sessionGoals || [];
      let cur = "";
      for (let i = 0; i < goals.length; i++) {
        const ok = (state.sessionGoalDone || []).indexOf(goals[i]) >= 0 || sessionGoalMet(goals[i]);
        if (!ok) { cur = sessionGoalLabel(goals[i]); break; }
      }
      if (!cur) {
        rollSessionGoals();
        cur = sessionGoalLabel((state.sessionGoals || [])[0] || "serve");
      }
      const day = Math.max(1, state.sessionDay | 0);
      ctx.font = "700 12px Nunito, sans-serif";
      const label = "TODAY " + day + "  ·  " + cur;
      const tw = Math.min(ctx.measureText(label).width + 28, 360);
      const chip = hudBox(16, sessionY, tw, 30);
      const a = screenBoxAlpha(chip.x, chip.y, chip.w, chip.h);
      if (a > 0.04) {
        ctx.save();
        ctx.globalAlpha = a;
        card(chip.x, chip.y, chip.w, chip.h, "rgba(16, 36, 46, 0.88)");
        ctx.fillStyle = "#9ef0ff";
        ctx.font = "800 12px Nunito, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(label, chip.x + 12, chip.y + 20);
        ctx.restore();
      }
    }
    if (state.scene === "ocean" && state.mode === "play") {
      const z = zoneAtDepth(player.y);
      const meters = depthMeters(player.y);
      const depthTxt = meters + "m  ·  " + z.name;
      ctx.font = "800 13px Nunito, sans-serif";
      const dw = Math.min(ctx.measureText(depthTxt).width + 28, 340);
      const dy = sessionY + ((missionVisible() || sessionChipVisible()) ? 36 : 0);
      const dchip = hudBox(16, dy, dw, 28);
      const da = screenBoxAlpha(dchip.x, dchip.y, dchip.w, dchip.h);
      if (da > 0.04) {
        ctx.save();
        ctx.globalAlpha = da;
        card(dchip.x, dchip.y, dchip.w, dchip.h, "rgba(10, 28, 40, 0.88)");
        ctx.fillStyle = "#9ef0ff";
        ctx.font = "800 13px Nunito, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(depthTxt, dchip.x + 12, dchip.y + 19);
        ctx.restore();
      }
    }
    drawSpeciesStrip(ribbon);
    const { muteB, pauseB } = topCtrlBoxes();
    card(muteB.x, muteB.y, muteB.w, muteB.h);
    drawSpeaker(muteB.x + muteB.w / 2, muteB.y + muteB.h / 2, state.muted);
    btn("mute", muteB.x, muteB.y, muteB.w, muteB.h);
    card(pauseB.x, pauseB.y, pauseB.w, pauseB.h);
    ctx.fillStyle = "#fff6e8"; ctx.font = "800 18px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("II", pauseB.x + pauseB.w / 2, pauseB.y + pauseB.h / 2 + 7);
    btn("pause", pauseB.x, pauseB.y, pauseB.w, pauseB.h);
    drawRibbon(ribbon);
    // scene prompts
    if (state.expedition) {
      const sec = Math.max(0, Math.ceil(state.expeditionTime));
      const ss = sec % 60;
      const clock = ((sec / 60) | 0) + ":" + (ss < 10 ? "0" : "") + ss;
      const ey = 70;
      if (state.nightExpedition) {
        card(W / 2 - 92, ey, 184, 28, "rgba(10, 18, 36, 0.92)");
        ctx.fillStyle = sec <= 10 ? "#ff8a7a" : "#9ef0ff";
        ctx.font = "800 15px Nunito, sans-serif"; ctx.textAlign = "center";
        ctx.fillText("NIGHT · " + clock, W / 2, ey + 20);
      } else {
        card(W / 2 - 58, ey, 116, 28, "rgba(20, 50, 62, 0.9)");
        ctx.fillStyle = sec <= 10 ? "#ff8a7a" : "#ffe27a";
        ctx.font = "800 15px Nunito, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(clock, W / 2, ey + 20);
      }
    }
    if (state.scene === "shop" && nearBoat() && expeditionUnlocked()) {
      const eb = actionBtnBox();
      card(eb.x, eb.y, eb.w, eb.h, "rgba(40, 160, 180, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = (eb.h > 70 ? "800 28px" : "700 16px") + " Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(compactHud() ? "EXPEDITION  $35" : "SPACE · Expedition $35", eb.x + eb.w / 2, eb.y + eb.h / 2 + 8);
    } else if (diveActionLegal()) {
      const db = actionBtnBox();
      card(db.x, db.y, db.w, db.h, "rgba(40, 160, 180, 0.92)");
      ctx.fillStyle = "#fff";
      ctx.font = (db.h > 70 ? "800 34px" : "700 16px") + " Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(compactHud() ? "DIVE" : "SPACE  or  click  to  DIVE", db.x + db.w / 2, db.y + db.h / 2 + 10);
      btn("dive", db.x, db.y, db.w, db.h);
    }
    if (surfaceActionLegal()) {
      ctx.globalAlpha = bagIsFull() ? 1 : clamp((280 - player.y) / 80, 0.45, 1);
      const sb = actionBtnBox();
      card(sb.x, sb.y, sb.w, sb.h, "rgba(40, 160, 180, 0.92)");
      ctx.fillStyle = "#fff";
      ctx.font = (sb.h > 70 ? "800 34px" : "700 16px") + " Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(compactHud() ? "SURFACE" : "SPACE  or  click  to  SURFACE", sb.x + sb.w / 2, sb.y + sb.h / 2 + 10);
      ctx.globalAlpha = 1;
    }
    if (state.scene === "ocean" && bagIsFull()) {
      const by = state.expedition ? 104 : 70;
      const fb = hudBox(W / 2 - 150, by, 300, 32);
      card(fb.x, fb.y, fb.w, fb.h, "rgba(255, 140, 60, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = "700 14px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(compactHud() ? "Bag full — tap SURFACE" : "Bag full — SPACE or click!", fb.x + fb.w / 2, fb.y + 22);
    }
    drawSaleTalks();
    for (const hp of hudPops) {
      const a = clamp(hp.life / Math.max(0.2, hp.max * 0.28), 0, 1);
      ctx.globalAlpha = a;
      ctx.font = hp.small ? "800 13px Fredoka, sans-serif" : "800 16px Fredoka, sans-serif";
      const tw = Math.min(ctx.measureText(hp.text).width + (hp.small ? 20 : 28), hp.small ? 220 : 460);
      const hb = hudBox(hp.x - tw / 2, hp.y - (hp.small ? 12 : 16), tw, hp.small ? 24 : 30);
      card(hb.x, hb.y, hb.w, hb.h, "rgba(18, 36, 44, 0.88)");
      ctx.fillStyle = hp.col;
      ctx.textAlign = "center";
      ctx.fillText(hp.text, hb.x + hb.w / 2, hb.y + (hp.small ? 16 : 20));
      ctx.globalAlpha = 1;
    }
    for (const fl of flyers) {
      const u = 1 - clamp(fl.life / (fl.max || 0.52), 0, 1);
      const pop = 0.85 + Math.sin(u * Math.PI) * 0.35;
      ctx.globalAlpha = clamp(fl.life / 0.12, 0, 1);
      if (fl.plus) {
        ctx.fillStyle = "#ffe27a";
        ctx.font = "800 22px Fredoka, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(fl.plus, fl.x, fl.y);
        ctx.globalAlpha = 1;
        continue;
      }
      if (fl.rare) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "rgba(255,210,74,0.45)";
        ctx.beginPath(); ctx.ellipse(fl.x, fl.y, 22, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      drawFishBody(SPECIES[fl.s], fl.x, fl.y, 0.2 + u * 0.4, pop, state.time);
      ctx.globalAlpha = 1;
    }
    for (const c of hudCoins) {
      if (c.drawX == null) continue;
      const u = 1 - clamp(c.life / Math.max(0.001, c.max), 0, 1);
      ctx.globalAlpha = clamp(c.life / 0.12, 0, 1) * (u < 0.78 ? 1 : 1 - (u - 0.78) / 0.22);
      drawCoin(c.drawX, c.drawY, 8);
      ctx.globalAlpha = 1;
    }
    if (hudCoins.length) {
      ctx.save();
      ctx.globalAlpha = chipAlpha(moneyBox, ribbon);
      drawMoneyReadout(moneyBox);
      ctx.restore();
    }
    drawGuideArrow();
    drawStockWalkCue();
    drawTillCollectCue();
    drawSurfaceAssist();
    drawBoatEdgeHint();
    drawDockCorner();
    if (shopBarsReady()) {
      const nearK = nearRect(KIOSK.x, KIOSK.y, KIOSK.w, KIOSK.h, 90);
      if (nearK) {
        ctx.strokeStyle = "rgba(255,226,122," + (0.35 + 0.3 * Math.sin(state.time * 5)) + ")";
        ctx.lineWidth = 3;
        const bar = upgradeBarBox();
        const barW = decorHudReady() && !bar.compact ? 854 : bar.w;
        const hb = hudBox(bar.x, bar.y, barW, bar.h);
        roundRect(hb.x, hb.y, hb.w, hb.h, 12); ctx.stroke();
      }
      drawUpgradeBar();
      if (decorHudReady()) drawDecorBar();
    }
    if (state.comboPop) {
      const u = clamp(state.comboPop.life / state.comboPop.max, 0, 1);
      const t = 1 - u;
      const late = state.comboPop.keep ? 0.9 : 0.65;
      const fade = state.comboPop.keep ? 0.1 : 0.35;
      const a = t < 0.08 ? t / 0.08 : t > late ? (1 - t) / fade : 1;
      const sc = 0.94 + u * 0.12;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(W / 2, 78);
      ctx.scale(sc, sc);
      ctx.fillStyle = "rgba(8,16,24,0.28)";
      ctx.font = "800 26px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(state.comboPop.text, 1, 2);
      ctx.fillStyle = state.comboPop.col;
      ctx.fillText(state.comboPop.text, 0, 0);
      ctx.restore();
    }
    if (state.unlockBanner) {
      const u = clamp(state.unlockBanner.life / 0.9, 0, 1);
      const a = u > 0.75 ? (1 - u) / 0.25 : u < 0.2 ? u / 0.2 : 1;
      const midY = 78;
      const bw = Math.min(520, W - 280);
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(8, 16, 24, 0.5)";
      roundRect(W / 2 - bw / 2, midY - 22, bw, 44, 12); ctx.fill();
      ctx.fillStyle = state.unlockBanner.color;
      ctx.font = "800 22px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(state.unlockBanner.name.toUpperCase() + " UNLOCKED", W / 2, midY + 8);
      ctx.globalAlpha = 1;
    }
    if (state.flash > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(0, 0, W, H);
    }
    if (state.freezeFrame > 0) {
      const a = clamp(state.freezeFrame / 0.12, 0, 1) * 0.22;
      ctx.fillStyle = "rgba(255,246,220," + a + ")";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(8, 20, 28," + (a * 0.55) + ")";
      ctx.fillRect(0, 0, W, 18);
      ctx.fillRect(0, H - 18, W, 18);
    }
    if (state.nopeFlash > 0) {
      ctx.fillStyle = "rgba(255, 70, 60," + (0.2 * clamp(state.nopeFlash / 0.28, 0, 1)) + ")";
      ctx.fillRect(0, 0, W, H);
    }
  }
  function registerSurfaceHits() {
    if (!surfaceActionLegal()) return;
    const sb = actionBtnBox();
    // Last-registered wins hit-testing, so these beat click-to-walk and other HUD.
    btn("surface", sb.x, sb.y, sb.w, sb.h);
    if (bagIsFull()) {
      const by = state.expedition ? 104 : 70;
      const fb = hudBox(W / 2 - 150, by, 300, 32);
      btn("surface", fb.x, fb.y, fb.w, fb.h);
    }
  }
  function drawUpIcon(kind, x, y) {
    ctx.save();
    ctx.translate(x, y);
    if (kind === "speed") {
      ctx.strokeStyle = "#ffe27a"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-6, 3); ctx.lineTo(2, 3); ctx.lineTo(-1, 0); ctx.moveTo(2, 3); ctx.lineTo(-1, 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(7, -2); ctx.lineTo(4, -5); ctx.moveTo(7, -2); ctx.lineTo(4, 1); ctx.stroke();
    } else if (kind === "bag") {
      ctx.strokeStyle = "#9ef0ff"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(-5, -2); ctx.lineTo(-4, 6); ctx.lineTo(4, 6); ctx.lineTo(5, -2); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -2, 3.2, Math.PI, 0); ctx.stroke();
    } else if (kind === "catch") {
      ctx.strokeStyle = "#9ef0ff"; ctx.lineWidth = 1.7;
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(6, 0, 4.5, -0.7, 0.7); ctx.stroke();
    } else {
      ctx.fillStyle = "#ffe27a";
      ctx.beginPath(); ctx.arc(0, -2, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-2.4, 1, 4.8, 5);
    }
    ctx.restore();
  }
  function upCard(id, x, y, title, promise, icon, cost, maxed, can, pulse, size) {
    const w = (size && size.w) || 168, h = (size && size.h) || 72;
    const shaking = state.cardShake && state.cardShake.id === id;
    const shake = shaking
      ? Math.sin(state.cardShake.t * 68) * 26 * clamp(state.cardShake.t / 0.2, 0, 1)
      : 0;
    x += shake;
    const flashing = state.priceFlash && state.priceFlash.id === id;
    const fill = maxed ? "rgba(40,70,60,0.85)" : can ? "rgba(28, 58, 52, 0.9)" : flashing
      ? "rgba(72, 24, 22, 0.92)" : "rgba(40, 32, 28, 0.82)";
    card(x, y, w, h, fill);
    if (pulse) {
      ctx.strokeStyle = "rgba(255,226,122," + (0.45 + 0.35 * Math.sin(state.time * 6)) + ")";
      ctx.lineWidth = 3;
      roundRect(x, y, w, h, 12); ctx.stroke();
    }
    if (flashing) {
      ctx.strokeStyle = "rgba(255,90,70," + (0.55 + 0.35 * clamp(state.priceFlash.t / 0.2, 0, 1)) + ")";
      ctx.lineWidth = 3;
      roundRect(x, y, w, h, 12); ctx.stroke();
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 13px Fredoka, sans-serif";
    ctx.fillText(title, x + 10, y + 20);
    ctx.fillStyle = can ? "rgba(20, 48, 44, 0.95)" : "rgba(28, 24, 20, 0.88)";
    const pillY = y + h - 32;
    roundRect(x + 8, pillY, Math.min(128, w - 20), 22, 8); ctx.fill();
    drawUpIcon(icon, x + 20, pillY + 11);
    ctx.fillStyle = can ? "#ffe27a" : "#e8f4f8";
    ctx.font = "800 11px Nunito, sans-serif";
    ctx.fillText(promise, x + 32, pillY + 15);
    ctx.textAlign = "right";
    ctx.fillStyle = maxed ? "#8fd" : flashing ? "#ff6a5a" : can ? "#ffe27a" : "#c4b8a4";
    ctx.font = flashing ? "800 16px Nunito, sans-serif" : "800 13px Nunito, sans-serif";
    ctx.fillText(maxed ? "MAX" : "$" + cost, x + w - 10, y + 22);
    if (!maxed) btn(id, x, y, w, h);
  }
  function drawUpgradeBar() {
    const bar = upgradeBarBox();
    const size = { w: bar.cw, h: bar.ch };
    card(bar.x, bar.y, bar.w, bar.h, "rgba(12, 28, 36, 0.72)");
    const sMax = state.speedLv >= SPEED_COST.length;
    const bMax = state.bagLv >= BAG_COST.length;
    const cMax = state.catchLv >= CATCH_COST.length;
    const sc = sMax ? 0 : SPEED_COST[state.speedLv];
    const bc = bMax ? 0 : BAG_COST[state.bagLv];
    const cc = cMax ? 0 : CATCH_COST[state.catchLv];
    const aff = firstAffordableUp();
    const speedPromise = "faster walk";
    const slots = [
      ["up-speed", "Speed  Lv " + (state.speedLv + 1), speedPromise, "speed", sc, sMax, !sMax && state.money >= sc, aff && aff.id === "speed"],
      ["up-bag", "Bag  " + bagMax() + "/20", "bigger bag", "bag", bc, bMax, !bMax && state.money >= bc, aff && aff.id === "bag"],
      ["up-catch", "Catch  Lv " + (state.catchLv + 1), "quicker scoop", "catch", cc, cMax, !cMax && state.money >= cc, aff && aff.id === "catch"],
      ["up-cashier", "Cashier", "auto till", "cashier", CASHIER_COST, state.hiredCashier, !state.hiredCashier && state.money >= CASHIER_COST, aff && aff.id === "cashier"],
    ];
    for (let i = 0; i < slots.length; i++) {
      const col = bar.compact ? (i % 2) : i;
      const row = bar.compact ? ((i / 2) | 0) : 0;
      const x = bar.x + 8 + col * (size.w + 8);
      const y = bar.y + 8 + row * (size.h + 8);
      upCard(slots[i][0], x, y, slots[i][1], slots[i][2], slots[i][3], slots[i][4], slots[i][5], slots[i][6], slots[i][7], size);
    }
  }
  function drawDecorBar() {
    const bar = upgradeBarBox();
    const chipW = compactHud() ? thumbCanvas(72, 100, 140) : 118;
    const chipH = compactHud() ? thumbCanvas(48, 56, 80) : 64;
    const chip = hudBox(bar.x + bar.w + 8, bar.y + bar.h - chipH, chipW, chipH);
    const chipX = chip.x, chipY = chip.y;
    const dec = state.decor || [false, false, false];
    const ownedN = (dec[0] ? 1 : 0) + (dec[1] ? 1 : 0) + (dec[2] ? 1 : 0);
    const open = !!state.decorOpen;
    card(chipX, chipY, chipW, chipH, open ? "rgba(28, 58, 52, 0.92)" : "rgba(12, 28, 36, 0.82)");
    if (open) {
      ctx.strokeStyle = "rgba(255,226,122," + (0.4 + 0.25 * Math.sin(state.time * 5)) + ")";
      ctx.lineWidth = 2;
      roundRect(chipX, chipY, chipW, chipH, 12); ctx.stroke();
    }
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffe27a";
    ctx.font = "700 15px Fredoka, sans-serif";
    ctx.fillText("Decor", chipX + chipW / 2, chipY + 26);
    ctx.fillStyle = "#c8e8ee";
    ctx.font = "700 11px Nunito, sans-serif";
    ctx.fillText(ownedN + " / 3", chipX + chipW / 2, chipY + 46);
    btn("decor-toggle", chipX, chipY, chipW, chipH);
    if (!open) return;
    const labels = ["Lights", "Sign", "Fountain"];
    const pw = 168, ph = 48;
    const floor = topHudFloor();
    const stackH = 3 * ph + 2 * 6;
    let stackX = chipX;
    let stackY = chipY - 8 - stackH;
    if (stackY < floor) {
      stackY = Math.max(floor, Math.min(chipY + chipH - stackH, H - 10 - stackH));
      stackX = chipX - 10 - pw;
      if (stackX < 10) stackX = clamp(chipX + chipW + 10, 10, W - 10 - pw);
    }
    for (let i = 0; i < 3; i++) {
      const x = stackX;
      const y = stackY + i * (ph + 6);
      const owned = !!dec[i];
      const cost = DECOR_COST[i];
      const can = !owned && state.money >= cost;
      const id = "decor-" + i;
      const shaking = state.cardShake && state.cardShake.id === id;
      const shake = shaking
        ? Math.sin(state.cardShake.t * 68) * 24 * clamp(state.cardShake.t / 0.2, 0, 1)
        : 0;
      const flashing = state.priceFlash && state.priceFlash.id === id;
      const dx = x + shake;
      const fill = owned ? "rgba(40,70,60,0.92)" : can ? "rgba(28, 58, 52, 0.94)" : flashing
        ? "rgba(72, 24, 22, 0.94)" : "rgba(40, 32, 28, 0.92)";
      card(dx, y, pw, ph, fill);
      if (flashing) {
        ctx.strokeStyle = "rgba(255,90,70,0.7)";
        ctx.lineWidth = 2.5;
        roundRect(dx, y, pw, ph, 12); ctx.stroke();
      }
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff6e8";
      ctx.font = "700 13px Fredoka, sans-serif";
      ctx.fillText(labels[i], dx + 10, y + 20);
      ctx.fillStyle = "#c8e8ee";
      ctx.font = "700 10px Nunito, sans-serif";
      ctx.fillText(owned ? "Installed" : "Pier decor", dx + 10, y + 36);
      ctx.textAlign = "right";
      ctx.fillStyle = owned ? "#8fd" : flashing ? "#ff6a5a" : can ? "#ffe27a" : "#c4b8a4";
      ctx.font = flashing ? "800 16px Nunito, sans-serif" : "800 13px Nunito, sans-serif";
      ctx.fillText(owned ? "OWNED" : "$" + cost, dx + pw - 10, y + 30);
      if (!owned) btn(id, dx, y, pw, ph);
    }
  }

  // ===== OVERLAYS =====
  function panelBtn(id, x, y, w, h, label, accent, scale) {
    const s = scale || 1;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(s, s);
    ctx.translate(-(x + w / 2), -(y + h / 2));
    ctx.fillStyle = accent || "#2a9d8f";
    roundRect(x, y, w, h, 12); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "700 18px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h / 2 + 6);
    ctx.restore();
    btn(id, x, y, w, h);
  }
  function drawSkinPicker(cx, cy, cardW, cardH, gap) {
    const total = cardW * 3 + gap * 2;
    let x = cx - total / 2;
    const chosen = normalizeSkin(state.skin);
    ctx.fillStyle = "#c8e8ee";
    ctx.font = "700 14px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Who's diving?", cx, cy - 10);
    for (let i = 0; i < SKIN_IDS.length; i++) {
      const id = SKIN_IDS[i];
      const meta = SKIN_META[id];
      const selected = chosen === id;
      card(x, cy, cardW, cardH, selected ? "rgba(28, 58, 52, 0.94)" : "rgba(12, 28, 36, 0.78)");
      ctx.save();
      roundRect(x + 6, cy + 8, cardW - 12, cardH * 0.58, 8); ctx.clip();
      drawBayWater(x + 6, cy + 8, cardW - 12, cardH * 0.42, state.time + i, false);
      drawPierBoards(x + 6, cy + 8 + cardH * 0.36, cardW - 12, cardH * 0.28, { plank: 10, wetY: cy + 8 + cardH * 0.4 });
      ctx.restore();
      if (selected) {
        ctx.strokeStyle = "rgba(255,226,122," + (0.55 + 0.3 * Math.sin(state.time * 5)) + ")";
        ctx.lineWidth = 3;
        roundRect(x, cy, cardW, cardH, 12); ctx.stroke();
      }
      drawPlayer(x + cardW / 2, cy + cardH * 0.46, {
        skin: id, vx: 0, vy: 0, facing: 0.12,
        walkPhase: state.time * 2.2 + i, lean: 0, bob: state.time * 1.6 + i,
      });
      ctx.fillStyle = "#fff6e8";
      ctx.font = "800 16px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(meta.name, x + cardW / 2, cy + cardH - 28);
      ctx.fillStyle = selected ? "#ffe27a" : "#9ec8d0";
      ctx.font = "700 11px Nunito, sans-serif";
      ctx.fillText(meta.blurb, x + cardW / 2, cy + cardH - 12);
      btn("skin-" + id, x, cy, cardW, cardH);
      x += cardW + gap;
    }
  }
  function drawTitle() {
    ensurePaint();
    blitTile("sky", 0, 0, W, H * 0.52);
    if (!blitHorizon(0, 0, W, H)) {
      drawPaintedSky(0, 0, W, H * 0.42, state.time);
      drawSunDisc(1088, 78, 38);
      drawBayWater(-20, H * 0.3, W + 40, H * 0.78, state.time, false);
    }
    ctx.save();
    const wash = ctx.createLinearGradient(0, H * 0.55, 0, H);
    wash.addColorStop(0, "rgba(8, 40, 56, 0)");
    wash.addColorStop(1, "rgba(8, 30, 42, 0.28)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    ctx.restore();
    drawFoamBand(-10, H - 78, W + 20, state.time);
    drawPierBoards(-8, H - 64, W + 16, 72, { plank: 18, seg: 96, wetY: H - 52 });
    for (const px of [90, 240, 1040, 1190]) drawPierPost(px + 7, H - 52, 1.05);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = "rgba(255,236,180," + (0.045 + 0.025 * Math.sin(state.time + i)) + ")";
      ctx.beginPath();
      const x = 90 + i * 230;
      ctx.moveTo(x, 0); ctx.lineTo(x + 56, 0); ctx.lineTo(x + 170, H); ctx.lineTo(x - 24, H); ctx.fill();
    }
    ctx.restore();
    const tf = [
      { s: 0, x: 200, y: 400, a: 0.35, ax: 42, ay: 12, sc: 1.7 },
      { s: 1, x: 1060, y: 490, a: 0.28, ax: 38, ay: 11, sc: 1.6 },
      { s: 2, x: 380, y: 560, a: 0.24, ax: 48, ay: 13, sc: 1.55 },
      { s: 3, x: 940, y: 340, a: 0.22, ax: 40, ay: 10, sc: 1.65 },
      { s: 4, x: 640, y: 610, a: 0.18, ax: 32, ay: 8, sc: 1.8 },
      { s: 5, x: 820, y: 430, a: 0.26, ax: 22, ay: 16, sc: 1.45 },
      { s: 11, x: 1180, y: 380, a: 0.16, ax: 50, ay: 10, sc: 1.35 },
    ];
    for (let i = 0; i < tf.length; i++) {
      const f = tf[i];
      const px = f.x + Math.sin(state.time * f.a + i) * f.ax;
      const py = f.y + Math.sin(state.time * (f.a * 1.6) + i * 1.3) * f.ay;
      const face = Math.cos(state.time * f.a + i) >= 0 ? 0.08 : Math.PI - 0.08;
      drawFishBody(SPECIES[f.s], px, py, face, f.sc, state.time + i * 1.7);
    }
    ctx.fillStyle = "rgba(220,250,255,0.4)";
    for (const b of titleBubbles) {
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    }
    card(W / 2 - 250, 48, 500, 168, "rgba(12, 28, 36, 0.78)");
    ctx.save();
    roundRect(W / 2 - 210, 64, 420, 72, 10); ctx.clip();
    drawPierBoards(W / 2 - 210, 64, 420, 72, { plank: 16, seg: 78 });
    ctx.fillStyle = "rgba(40, 20, 8, 0.18)";
    ctx.fillRect(W / 2 - 210, 64, 420, 72);
    ctx.restore();
    ctx.strokeStyle = "#e8c04a"; ctx.lineWidth = 3;
    roundRect(W / 2 - 204, 69, 408, 62, 8); ctx.stroke();
    ctx.strokeStyle = "rgba(90, 48, 16, 0.55)"; ctx.lineWidth = 1.4;
    roundRect(W / 2 - 210, 64, 420, 72, 10); ctx.stroke();
    drawFishBody(SPECIES[0], W / 2 - 168, 100, 0.08, 1.35, state.time);
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 28px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Aqua Bay Pier Mart", W / 2 + 18, 96);
    ctx.fillStyle = "#ffe27a"; ctx.font = "700 14px Nunito, sans-serif";
    ctx.fillText("Dive. Stock. Sell.", W / 2 + 18, 120);
    ctx.fillStyle = "#9ef0ff"; ctx.font = "700 15px Nunito, sans-serif";
    ctx.fillText("A sunny pier aquarium of your own", W / 2, 168);
    ctx.fillStyle = "rgba(255, 226, 122, 0.92)";
    ctx.font = "700 13px Nunito, sans-serif";
    ctx.fillText("Aqua Bay · loop 49", W / 2, 194);
    drawSkinPicker(W / 2, 236, 168, 176, 16);
    const pulse = 1 + Math.sin(state.time * 3) * 0.035;
    if (state.hasSave) {
      panelBtn("continue", W / 2 - 150, 440, 300, 56, "Continue", null, pulse);
      const nSp = state.unlocked.filter(Boolean).length;
      ctx.fillStyle = "#ffe27a"; ctx.font = "700 14px Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("$" + (state.money | 0) + "  ·  " + nSp + " species unlocked", W / 2, 516);
      panelBtn("play", W / 2 - 150, 536, 300, 48, "New Game", "#3d6f7a");
    } else {
      panelBtn("play", W / 2 - 150, 448, 300, 56, "Play", null, pulse);
    }
  }
  function drawPause() {
    ctx.fillStyle = "rgba(6, 16, 22, 0.62)"; ctx.fillRect(0, 0, W, H);
    if (state.mode === "help") {
      card(W / 2 - 250, 56, 500, 608, "rgba(16, 32, 42, 0.94)");
      ctx.fillStyle = "#fff6e8"; ctx.font = "700 32px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("How to play", W / 2, 108);
      ctx.fillStyle = "#e8f4f8"; ctx.font = "600 15px Nunito, sans-serif"; ctx.textAlign = "left";
      const lines = [
        "WASD or Arrows — move  ·  tap / click to walk  ·  hold to steer",
        "DIVE chip, DIVE button, or SPACE at the dock — dive (chip works once you are near the pad)",
        "↑ SURFACE swims up  ·  SURFACE / SPACE — full bag, or waterline after a few catches",
        "Hold on a fish — the cone locks on  ·  tap a fish to scoop  ·  first catches are forgiving",
        "Tap a tank, till, or unlock card — act now, or walk there then act",
        "Walk into a matching tank — stock  ·  bag clears the instant it lands",
        "→ TILL chip or stand in the till glow to collect  ·  scoop coins on the path",
        "Hire a cashier — they collect while you dive",
        "SPACE at the boat — $35 timed expedition",
        "Every 3rd expedition is a night dive (rares)",
        "Deeper stacked zones never end — east pier tanks after Turtle",
        "Decor chip — lights, sign, fountain",
        "Mute button — sound on/off",
        "Esc — pause / resume  ·  pick Reef, Skip, or Dino on title",
      ];
      lines.forEach((ln, i) => ctx.fillText(ln, W / 2 - 210, 142 + i * 26));
      ctx.fillStyle = "#8ab"; ctx.font = "600 12px Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Inspired by the aquarium-tycoon genre", W / 2, 518);
      ctx.fillStyle = "#ffe27a"; ctx.font = "700 13px Nunito, sans-serif";
      ctx.fillText("Aqua Bay · loop 49", W / 2, 538);
      panelBtn("back", W / 2 - 110, 552, 220, 48, "Back");
    } else {
      card(W / 2 - 250, 56, 500, 608, "rgba(16, 32, 42, 0.94)");
      ctx.fillStyle = "#fff6e8"; ctx.font = "700 36px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Paused", W / 2, 108);
      ctx.fillStyle = "#c8e8ee"; ctx.font = "600 15px Nunito, sans-serif";
      ctx.fillText("A sunny little pier mart of your own.", W / 2, 142);
      panelBtn("resume", W / 2 - 140, 164, 280, 48, "Resume");
      panelBtn("help", W / 2 - 140, 222, 280, 44, "Help", "#2a7d8a");
      panelBtn("mute", W / 2 - 140, 276, 280, 44, state.muted ? "Sound Off" : "Sound On", "#3d6f7a");
      drawSkinPicker(W / 2, 352, 140, 148, 12);
      panelBtn("reset", W / 2 - 140, 528, 280, 44, "New Game", "#a84a3a");
      ctx.fillStyle = "#8ab"; ctx.font = "600 12px Nunito, sans-serif";
      ctx.fillText("Inspired by the aquarium-tycoon genre", W / 2, 590);
      ctx.fillText("Esc to resume", W / 2, 608);
      ctx.fillStyle = "#ffe27a"; ctx.font = "700 14px Nunito, sans-serif";
      ctx.fillText("Aqua Bay · loop 49", W / 2, 632);
    }
  }

  function baitShackScreenBox() {
    if (state.scene !== "shop") return null;
    const p = worldToScreen(1428, 786);
    return { x: p.x, y: p.y, w: 156 * cam.z, h: 136 * cam.z };
  }
  function tankScreenBox(i) {
    const t = TANK_POS[i];
    if (!t) return null;
    const p = worldToScreen(t.x, t.y);
    return { x: p.x, y: p.y, w: TANK_W * cam.z, h: TANK_H * cam.z };
  }
  function lockedTankScreenBoxes() {
    const out = [];
    if (state.scene !== "shop") return out;
    for (let i = 0; i < SPECIES.length; i++) {
      if (!tankLive(i) || state.unlocked[i]) continue;
      const b = tankScreenBox(i);
      if (b) out.push(b);
    }
    return out;
  }
  function speciesStripLayout() {
    const cw = compactHud() ? thumbCanvas(64, 70, 92) : 86;
    const ch = compactHud() ? thumbCanvas(50, 56, 72) : 64;
    const { muteB, pauseB } = topCtrlBoxes();
    const colH = railSpeciesIds().length * (ch + 6);
    const xCol = muteB.x - 12 - cw;
    const startY = muteB.y + muteB.h + 12;
    return { x: xCol, y: startY, w: cw, h: colH, cw, ch, muteB, pauseB };
  }
  function railSpeciesIds() {
    const next = nextLockedTank();
    const hi = highestUnlocked();
    if (hi < 4 && (next < 0 || next < 5)) return [0, 1, 2, 3, 4];
    const ids = [];
    const start = Math.max(0, hi - 1);
    for (let i = start; i <= hi; i++) ids.push(i);
    if (next >= 0 && ids.indexOf(next) < 0) ids.push(next);
    return ids.slice(0, 4);
  }
  function drawSpeciesStrip(ribbon) {
    const { x: xCol, y: startY, cw, ch, muteB, pauseB } = speciesStripLayout();
    const next = nextLockedTank();
    const ids = railSpeciesIds();
    for (let n = 0; n < ids.length; n++) {
      const i = ids[n];
      const b = hudBox(xCol, startY + n * (ch + 6), cw, ch);
      const x = b.x, y = b.y;
      const chip = { x, y, w: cw, h: ch + 2 };
      if (boxesOverlap(chip, muteB, 6) || boxesOverlap(chip, pauseB, 6)) continue;
      const hover = mouse.x >= x && mouse.x <= x + cw && mouse.y >= y && mouse.y <= y + ch + 2;
      const affordable = !state.unlocked[i] && i === next && state.money >= SPECIES[i].unlock;
      const need = !state.unlocked[i] ? Math.max(0, SPECIES[i].unlock - (state.money | 0)) : 0;
      ctx.save();
      ctx.globalAlpha = chipAlpha(chip, ribbon);
      if (hover) {
        ctx.translate(x + cw / 2, y + (ch + 2) / 2);
        ctx.scale(1.07, 1.07);
        ctx.translate(-(x + cw / 2), -(y + (ch + 2) / 2));
      }
      const fill = state.unlocked[i]
        ? (hover ? "rgba(28, 62, 70, 0.94)" : "rgba(18,40,48,0.88)")
        : affordable
          ? "rgba(40, 52, 28, 0.94)"
          : (hover ? "rgba(32, 28, 24, 0.9)" : "rgba(20,20,24,0.78)");
      card(x, y, cw, ch + 2, fill);
      if (state.bookOpen === i || hover) {
        ctx.strokeStyle = "rgba(255,226,122," + (hover ? 0.72 : 0.55 + 0.25 * Math.sin(state.time * 6)) + ")";
        ctx.lineWidth = hover ? 3.2 : 2.4;
        roundRect(x, y, cw, ch + 2, 12); ctx.stroke();
      }
      if (affordable) {
        ctx.strokeStyle = "rgba(255,226,122," + (0.5 + 0.4 * Math.sin(state.time * 6)) + ")";
        ctx.lineWidth = 3.4;
        roundRect(x - 2, y - 2, cw + 4, ch + 6, 13); ctx.stroke();
      }
      if (state.unlocked[i]) drawFishBody(SPECIES[i], x + cw / 2, y + ch * 0.42, 0, 0.92, state.time + i);
      else {
        drawFishSilhouette(SPECIES[i], x + cw / 2, y + ch * 0.28, 0.7);
        ctx.fillStyle = affordable ? "#ffe27a" : hover && need > 0 ? "#ffb08a" : "#ffe27a";
        ctx.font = hover && need > 0 ? "800 11px Nunito, sans-serif" : "800 13px Nunito, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(hover && need > 0 ? "need $" + need + " more" : "$" + SPECIES[i].unlock, x + cw / 2, y + ch - 18);
        ctx.fillStyle = affordable ? "#fff6e8" : "#c8e8ee";
        ctx.font = compactHud() ? "700 10px Nunito, sans-serif" : "700 11px Nunito, sans-serif";
        ctx.fillText(SPECIES[i].name, x + cw / 2, y + ch - 2);
      }
      btn("book-" + i, x, y, cw, ch + 2);
      ctx.restore();
    }
  }
  function drawCollectionBook() {
    if (state.bookOpen == null) return;
    const i = state.bookOpen | 0;
    const sp = SPECIES[i];
    ctx.fillStyle = "rgba(6, 16, 22, 0.58)";
    ctx.fillRect(0, 0, W, H);
    btn("book-dismiss", 0, 0, W, H);
    const pw = 500, ph = 368;
    const px = W / 2 - pw / 2, py = H / 2 - ph / 2;
    card(px, py, pw, ph, "rgba(16, 32, 42, 0.96)");
    btn("book-panel", px, py, pw, ph);
    ctx.fillStyle = "#9ef0ff";
    ctx.font = "700 14px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("COLLECTION", W / 2, py + 32);
    panelBtn("book-close", px + pw - 112, py + 16, 92, 36, "Close", "#3d6f7a");
    if (state.unlocked[i]) {
      drawFishBody(sp, W / 2, py + 128, 0, 2.55, state.time);
      ctx.fillStyle = "#fff6e8";
      ctx.font = "700 28px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(sp.name, W / 2, py + 198);
      ctx.fillStyle = "#ffe27a";
      ctx.font = "800 18px Nunito, sans-serif";
      ctx.fillText("$" + sp.price, W / 2, py + 226);
      const n = (state.caughtCount && state.caughtCount[i]) | 0;
      ctx.fillStyle = "#9ef0ff";
      ctx.font = "700 15px Nunito, sans-serif";
      ctx.fillText("Caught " + n + (n === 1 ? " time" : " times"), W / 2, py + 252);
      ctx.fillStyle = "#c8e8ee";
      ctx.font = "600 15px Nunito, sans-serif";
      ctx.fillText(BOOK_FLAVOR[i], W / 2, py + 286);
    } else {
      ctx.save();
      ctx.filter = "brightness(0)";
      ctx.globalAlpha = 0.42;
      drawFishBody(sp, W / 2, py + 128, 0, 2.55, 0);
      ctx.restore();
      ctx.fillStyle = "#fff6e8";
      ctx.font = "700 28px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(sp.name, W / 2, py + 198);
      ctx.fillStyle = "#ffe27a";
      ctx.font = "800 18px Nunito, sans-serif";
      ctx.fillText("Unlock $" + sp.unlock, W / 2, py + 226);
      ctx.fillStyle = "#c8e8ee";
      ctx.font = "600 15px Nunito, sans-serif";
      ctx.fillText(BOOK_HINT[i], W / 2, py + 262);
    }
    drawSpeciesStrip();
  }

  // ===== LOOP =====
  function fadeSpeed() {
    if (state.pendingScene === "shop") return 4.8;
    if (state.scene === "shop" && state.fadeDir) return 4.8;
    return 2.4;
  }
  function applyFade(dt) {
    if (!state.fadeDir) return;
    state.fade += state.fadeDir * dt * fadeSpeed();
    if (state.fadeDir > 0 && state.fade >= 1) {
      state.fade = 1;
      if (state.pendingScene === "ocean") {
        state.scene = "ocean";
        if (state.expedition) {
          player.x = 2200; player.y = 1600; player.vx = 0; player.vy = 20;
          state.expeditionTime = EXPEDITION_SECS;
        } else {
          player.x = OCEAN.w / 2; player.y = 380; player.vx = 0; player.vy = 0;
          player.facing = 0.22;
        }
        state.diveCatches = 0;
        state.catchVerb = null;
        player.scoopLock = null; player.scoopTap = false; player.catchProg = 0; player.target = null;
        state.escapeBar = null;
        state.diveLock = 1.6;
        state.bagBonus = 1;
        state.divesThisSession = (state.divesThisSession | 0) + 1;
        state.splash = { x: player.x, y: player.y + 8, life: 0.45, max: 0.45 };
        bubbles.length = 0;
        const splashN = (state.divesThisSession | 0) >= 2 ? 26 : 18;
        for (let i = 0; i < splashN && bubbles.length < 40; i++) {
          const a = (i / 18) * Math.PI * 2 + rand(-0.2, 0.2);
          bubbles.push({
            x: player.x + Math.cos(a) * rand(8, 36),
            y: player.y + Math.sin(a) * rand(4, 18),
            r: rand(2, 5), v: rand(36, 70), ph: rand(0, 8),
          });
        }
        cam.x = player.x;
        cam.y = player.y;
        cam.z = 1.1;
        state.camPunch = 0;
        state.camSettle = 0.4;
        state.camEase = 0.4;
        if (state.expedition) { seedExpeditionPocket(); seedOceanScenery(); }
        else seedFrontSchool();
        ensureOceanStock();
      } else if (state.pendingScene === "shop") {
        state.scene = "shop";
        state.surfaceLock = 1.05;
        if (state.expedition) {
          player.x = 1188; player.y = 1000; player.vx = 0; player.vy = -30;
          toast("Expedition complete", "#ffe27a");
          state.expedition = false;
          state.expeditionTime = 0;
          state.nightExpedition = false;
        } else {
          player.x = 880; player.y = state.missionDone ? 1000 : 940; player.vx = 0; player.vy = -40;
        }
        state.diveCatches = 0;
        state.surfaceQuiet = 2.2;
        if (bagHasStockable() && allowAutoStock()) {
          let si = 0;
          for (let i = 0; i < SPECIES.length; i++) {
            if (state.unlocked[i] && state.bag.some((s) => (s | 0) === i)) { si = i; break; }
          }
          player.goto = stockableTankTarget() || tankWalkPoint(si);
          player.pendingAct = { kind: "stock", i: si };
          cuePathWelcome();
          seedPathCoins([[880, 1008], [880, 820], [880, 640], [880, 460], [player.goto.x, player.goto.y]], 3);
        } else if (bagHasStockable()) {
          player.goto = null;
          player.pendingAct = null;
        } else if (state.registerCash <= 0) {
          seedPathCoins([[880, 860], [880, 1008]], 2);
        }
        maybeBookTease();
        maybeTangRumor();
        cam.x = player.x;
        cam.y = player.y;
        cam.z = 1.02;
        state.camPunch = 0;
        state.camSettle = 0.4;
        state.camEase = 0.4;
      }
      state.pendingScene = null; state.fadeDir = -1;
    }
    if (state.fadeDir < 0 && state.fade <= 0) { state.fade = 0; state.fadeDir = 0; }
  }
  function updateCam(dt) {
    const tz = state.scene === "ocean"
      ? (state.catchVerb === "dash" ? 1.28 : state.catchVerb === "sit" ? 0.96 : state.catchVerb === "yank" ? 1.22 : 1.12)
      : 1.00;
    cam.z = lerp(cam.z, tz, 1 - Math.pow(0.001, dt));
    if (state.camPunch > 0) {
      cam.z *= 1 + 0.006 * clamp(state.camPunch / 0.12, 0, 1);
      state.camPunch = Math.max(0, state.camPunch - dt);
    }
    const look = state.scene === "ocean" ? 80 : (player.goto ? 72 : 40);
    const ww = state.scene === "shop" ? shopW() : OCEAN.w;
    const hh = state.scene === "shop" ? SHOP.h : OCEAN.h;
    const hw = (W / 2) / cam.z, hhv = (H / 2) / cam.z;
    const minX = hw, maxX = Math.max(hw, ww - hw);
    const minY = hhv, maxY = Math.max(hhv, hh - hhv);
    let lx = Math.cos(player.facing) * look + player.vx * 0.10;
    let ly = Math.sin(player.facing) * look + player.vy * 0.10;
    if (lx > 0) lx *= clamp((maxX - player.x) / Math.max(1, lx), 0, 1);
    else if (lx < 0) lx *= clamp((player.x - minX) / Math.max(1, -lx), 0, 1);
    if (ly > 0) ly *= clamp((maxY - player.y) / Math.max(1, ly), 0, 1);
    else if (ly < 0) ly *= clamp((player.y - minY) / Math.max(1, -ly), 0, 1);
    let tx = player.x + lx;
    let ty = player.y + ly;
    if (state.shinyFocus > 0 && state.scene === "ocean") {
      const shiny = firstRareFish();
      if (shiny) {
        tx = lerp(player.x, shiny.x, 0.42);
        ty = lerp(player.y, shiny.y, 0.42);
      }
    }
    if (state.bookOpen != null && state.scene === "shop") {
      const t = TANK_POS[state.bookOpen | 0];
      if (t) {
        tx = lerp(tx, t.x + TANK_W / 2, 0.22);
        ty = lerp(ty, t.y + TANK_H * 0.62, 0.22);
      }
    } else if (state.boatGlance > 0 && state.scene === "shop") {
      const u = clamp(state.boatGlance / 2.2, 0, 1);
      const pull = u > 0.35 ? 0.78 : 0.78 * (u / 0.35);
      tx = lerp(tx, BOAT.x, pull);
      ty = lerp(ty, BOAT.y, pull);
    } else if (player.goto && state.scene === "shop" && !wantTillFrame() && !isDockDest(player.goto)) {
      tx = lerp(tx, player.goto.x, 0.07);
      ty = lerp(ty, player.goto.y, 0.07);
    }
    const tillFrame = wantTillFrame();
    if (tillFrame) {
      const tw = tillWorld();
      tx = lerp(tx, tw.x + 72, 0.10);
      ty = lerp(ty, tw.y + 32, 0.08);
      state.camEase = Math.max(state.camEase || 0, 0.46);
    }
    if (state.scene === "shop" && state.bookOpen == null && (state.boatGlance || 0) <= 0) {
      const band = player.y < 680 ? "plaza" : (player.y > 860 ? "dock" : "mid");
      if (cam.shopBand && cam.shopBand !== band && (band === "plaza" || band === "dock")) {
        state.camEase = Math.max(state.camEase || 0, 0.46);
      }
      cam.shopBand = band;
      const glowI = glowingStockIndex();
      const z = Math.max(0.7, cam.z);
      const hudClear = Math.max(topHudFloor() + 16, 176);
      const onPlaza = player.y < 720;
      if (!tillFrame && onPlaza && glowI >= 0) {
        const plaza = clamp((640 - player.y) / 280, 0, 1);
        const shelfL = TANK_POS[0].x;
        const shelfR = TANK_POS[4].x + TANK_W;
        const minCam = shelfR - (W / 2) / z + 8 / z;
        const maxCam = shelfL + (W / 2) / z - 8 / z;
        const pull = Math.max(plaza * 0.18, 0.08);
        if (glowI >= CORE_SPECIES && TANK_POS[glowI]) {
          tx = lerp(tx, TANK_POS[glowI].x + TANK_W / 2, pull);
        } else if (minCam <= maxCam) tx = lerp(tx, clamp(tx, minCam, maxCam), pull);
        else tx = lerp(tx, (minCam + maxCam) * 0.5, pull * 0.45);
        const t = TANK_POS[glowI];
        const camForGlow = (t.y - 10) - (hudClear - H / 2) / z;
        const bottomKeep = shopBarsReady() ? 136 : 88;
        const minCamForPlayer = player.y - (H / 2 - bottomKeep) / z;
        const tankCam = Math.max(camForGlow, minCamForPlayer);
        if (ty > tankCam) ty = lerp(ty, tankCam, Math.max(plaza * 0.16, 0.08));
      }
      if (!tillFrame && glowI >= 0) {
        const cardTop = TANK_POS[0].y;
        const maxCamForCards = cardTop - (hudClear - H / 2) / z;
        const cardScr = (cardTop - ty) * z + H / 2;
        if (cardScr > 4 && cardScr < hudClear) {
          ty = lerp(ty, maxCamForCards, 0.08);
        }
      }
    }
    if ((state.camTillHold || 0) > 0) state.camTillHold = Math.max(0, state.camTillHold - dt);
    if ((state.camSettle || 0) > 0) state.camSettle = Math.max(0, state.camSettle - dt);
    if ((state.camEase || 0) > 0) state.camEase = Math.max(0, state.camEase - dt);
    const easing = (state.camEase || 0) > 0 || (state.camSettle || 0) > 0 || tillFrame;
    const followPow = easing ? 0.00065 : 0.0014;
    const follow = 1 - Math.pow(followPow, dt);
    let nx = lerp(cam.x, tx, follow);
    let ny = lerp(cam.y, ty, follow);
    const rightRail = 70;
    const wantRail = shopBarsReady() ? 112 : (state.tutorial === 0 && !state.didMove ? 100 : 28);
    cam.rail = cam.rail == null ? wantRail : lerp(cam.rail, wantRail, 1 - Math.pow(0.05, Math.min(dt, 0.05)));
    const padL = 88, padR = rightRail + 48;
    const padT = Math.max(topHudFloor() + 12, 64);
    const padB = cam.rail + 36;
    let psx = (player.x - nx) * cam.z + W / 2;
    let psy = (player.y - ny) * cam.z + H / 2;
    if (psx < padL) nx = player.x - (padL - W / 2) / cam.z;
    if (psx > W - padR) nx = player.x - (W - padR - W / 2) / cam.z;
    if (psy < padT) ny = player.y - (padT - H / 2) / cam.z;
    if (psy > H - padB) ny = player.y - (H - padB - H / 2) / cam.z;
    const step = Math.hypot(nx - cam.x, ny - cam.y);
    const pace = state.scene === "ocean" ? swimSpeed() : walkSpeed();
    const cap = Math.max(pace, easing ? pace : pace + 40) * Math.min(dt, 0.05);
    if (step > cap && step > 0.001) {
      nx = cam.x + (nx - cam.x) * (cap / step);
      ny = cam.y + (ny - cam.y) * (cap / step);
    }
    psx = (player.x - nx) * cam.z + W / 2;
    psy = (player.y - ny) * cam.z + H / 2;
    if (psx < padL) nx = player.x - (padL - W / 2) / cam.z;
    if (psx > W - padR) nx = player.x - (W - padR - W / 2) / cam.z;
    if (psy < padT) ny = player.y - (padT - H / 2) / cam.z;
    if (psy > H - padB) ny = player.y - (H - padB - H / 2) / cam.z;
    cam.x = clamp(nx, minX, maxX);
    cam.y = clamp(ny, minY, maxY);
    if (state.camNudge > 0) {
      const max = state.camNudgeMax || 0.48;
      const u = 1 - state.camNudge / max;
      const kick = Math.sin(u * Math.PI);
      cam.y = clamp(cam.y + kick * 2.0, minY, maxY);
      cam.x = clamp(cam.x + Math.sin(u * Math.PI * 2) * 0.9, minX, maxX);
      state.camNudge = Math.max(0, state.camNudge - dt);
    }
  }
  function seedNearMissSchool() {
    if ((state.divesThisSession | 0) !== 2 || state.expedition || state.nearMissLife > 0) return;
    state.nearMiss = [];
    const y = player.y + 18;
    for (let i = 0; i < 6; i++) {
      state.nearMiss.push({
        x: player.x - 240 - i * 26,
        y: y + Math.sin(i * 1.1) * 18,
        vx: 520,
        ph: i * 0.45,
      });
    }
    state.nearMissLife = 1.15;
    pop(player.x + 40, player.y - 28, "whoa!", "#9ef0ff", 0.85, 1.2);
    sfx("stock");
  }
  function updateNearMiss(dt) {
    if (state.nearMissLife <= 0) { state.nearMiss.length = 0; return; }
    state.nearMissLife = Math.max(0, state.nearMissLife - dt);
    for (const f of state.nearMiss) {
      f.x += f.vx * dt;
      f.y += Math.sin(state.time * 8 + f.ph) * 40 * dt;
    }
  }
  function drawNearMiss() {
    if (state.nearMissLife <= 0) return;
    const a = clamp(state.nearMissLife / 0.2, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.72 * a;
    for (const f of state.nearMiss) {
      drawFishBody(SPECIES[0], f.x, f.y, 0.05, 0.95, state.time + f.ph);
    }
    ctx.restore();
  }
  function drawOceanScenery() {
    for (const s of oceanScenery) {
      if (s.kind === "ray") drawSceneryRay(s);
      else if (s.kind === "jelly") drawSceneryJelly(s);
      else if (s.kind === "kelp") drawKelpPatch(s);
      else drawSceneryMinnow(s);
    }
  }
  function drawKelpPatch(s) {
    const glow = 0.42 + 0.22 * Math.sin(state.time * 3.2 + s.ph);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.globalCompositeOperation = "lighter";
    const halo = ctx.createRadialGradient(0, 8, 6, 0, 4, 78);
    halo.addColorStop(0, "rgba(120, 255, 210," + (0.28 + glow * 0.2) + ")");
    halo.addColorStop(0.45, "rgba(70, 210, 180, 0.12)");
    halo.addColorStop(1, "rgba(40, 160, 150, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.ellipse(0, 10, 72, 34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(18, 70, 58, 0.55)";
    ctx.beginPath(); ctx.ellipse(0, 22, 40, 10, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 7; i++) {
      const sway = Math.sin(state.time * 1.6 + s.ph + i * 0.7) * (10 + i);
      const h = 38 + (i % 3) * 16;
      ctx.strokeStyle = i % 2 ? "#2f8a5a" : "#1f6a48";
      ctx.lineWidth = 3.2 - (i % 3) * 0.4;
      ctx.beginPath();
      ctx.moveTo(-24 + i * 8, 20);
      ctx.quadraticCurveTo(-20 + i * 8 + sway * 0.4, 4, -18 + i * 8 + sway, 20 - h);
      ctx.stroke();
      ctx.fillStyle = "rgba(90, 230, 160, 0.55)";
      ctx.beginPath();
      ctx.ellipse(-18 + i * 8 + sway, 18 - h, 5, 9, sway * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255, 246, 180, " + (0.55 + glow * 0.35) + ")";
    ctx.font = "800 13px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("REEF", 0, -36);
    ctx.restore();
  }
  function drawSceneryRay(s) {
    const flap = Math.sin(state.time * 1.6 + s.ph) * 0.22;
    const face = (s.facing || (s.vx >= 0 ? 1 : -1)) >= 0 ? 0.04 : Math.PI - 0.04;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(face + flap * 0.15);
    ctx.globalAlpha = 0.38;
    ctx.fillStyle = "#0a2a38";
    ctx.beginPath();
    ctx.moveTo(38, 0);
    ctx.quadraticCurveTo(8, -22 - flap * 10, -28, -6);
    ctx.lineTo(-40, 0);
    ctx.lineTo(-28, 6);
    ctx.quadraticCurveTo(8, 22 + flap * 10, 38, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(20, 60, 78, 0.7)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = "rgba(8, 28, 38, 0.55)";
    ctx.beginPath();
    ctx.moveTo(-36, 0);
    ctx.quadraticCurveTo(-58, 4 + flap * 6, -72, 14);
    ctx.quadraticCurveTo(-50, 2, -36, 0);
    ctx.fill();
    ctx.restore();
  }
  function drawSceneryJelly(s) {
    const pulse = 1 + Math.sin(state.time * 1.8 + s.ph) * 0.12;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = "rgba(180, 230, 255, 0.55)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 * pulse, 11 * pulse, 0, Math.PI, 0);
    ctx.quadraticCurveTo(10, 8, 0, 7);
    ctx.quadraticCurveTo(-10, 8, -16 * pulse, 0);
    ctx.fill();
    ctx.strokeStyle = "rgba(210, 245, 255, 0.45)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = "rgba(160, 220, 240, 0.7)";
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 5; i++) {
      const ox = -10 + i * 5;
      ctx.beginPath();
      ctx.moveTo(ox, 6);
      for (let k = 1; k <= 4; k++) {
        ctx.lineTo(ox + Math.sin(state.time * 2.4 + s.ph + i + k) * 3.2, 6 + k * 7);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawSceneryMinnow(s) {
    const wob = Math.sin(state.time * 9 + s.ph) * 0.35;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(0.05 + wob);
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = "#0c2430";
    ctx.beginPath();
    ctx.ellipse(0, 0, 7.2, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-11, -3 + wob * 2);
    ctx.lineTo(-11, 3 - wob * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function onDiveLockEnd() {
    if (state.expedition) return;
    seedNearMissSchool();
    const shiny = firstRareFish();
    if (!shiny) return;
    state.shinyCallout = 3.4;
    state.shinyFocus = 1.7;
    placeShinyInView(shiny);
  }
  let last = performance.now();
  function frame(now) {
    const dt = clamp((now - last) / 1000, 0, 0.05);
    last = now;
    state.time += dt;
    uiHits = [];
    tickMusic(dt);
    beginCanvas();
    if (state.mode === "title") {
      updateTitleFX(dt);
      drawTitle();
    } else {
      if (state.mode === "play") {
        if (state.hitStop > 0) state.hitStop = Math.max(0, state.hitStop - dt);
        const sim = state.hitStop > 0 ? 0 : dt;
        updatePlayer(sim);
        if (state.scene === "ocean") { syncOceanHeight(); updateOceanFish(sim); updateOceanScenery(sim); updateCatch(sim); updateReefPresence(); updateNearMiss(sim); }
        else { updateShopInteract(sim); updateCustomers(sim); updatePierLife(sim); }
        if (state.diveLock > 0) {
          const prevLock = state.diveLock;
          state.diveLock = Math.max(0, state.diveLock - sim);
          if (prevLock > 0 && state.diveLock <= 0) onDiveLockEnd();
        }
        if (state.surfaceLock > 0) state.surfaceLock = Math.max(0, state.surfaceLock - sim);
        if (state.expedition && state.scene === "ocean" && !state.fadeDir) {
          state.expeditionTime -= sim;
          if (state.expeditionTime <= 0) beginSurface();
        }
        if (state.scene === "ocean" && !state.fadeDir && bagIsFull() && nearSurface()) beginSurface();
        updateCashier(sim);
        state.playClock = (state.playClock || 0) + dt;
        updateFX(dt);
        applyFade(dt);
        updateCam(dt);
        if (state.time % 5 < dt) persist();
      } else {
        updateCam(dt);
      }
      beginSpeechFrame();
      drawWorld();
      if (state.fade > 0) {
        ctx.fillStyle = "rgba(8, 40, 52," + state.fade + ")";
        ctx.fillRect(0, 0, W, H);
      }
      drawHUD();
      if (state.mode === "pause" || state.mode === "help") drawPause();
      drawCollectionBook();
      registerSurfaceHits();
    }
    requestAnimationFrame(frame);
  }
  layoutStage();
  loadSave();
  seedOcean();
  seedDockTeasers();
  seedPierLife();
  for (let i = 0; i < 16; i++) {
    titleBubbles.push({ x: rand(30, W - 30), y: rand(40, H + 20), r: rand(2, 6), v: rand(36, 88), ph: rand(0, 8) });
  }
  requestAnimationFrame(frame);
})();
