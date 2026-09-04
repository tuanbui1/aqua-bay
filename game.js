// Aqua Bay — original pier aquarium tycoon (vanilla Canvas 2D)
// loop 153 the west chalkboard names today's regular — they pay 2× for that fish
// loop 152 first-session polish — quiet HUD, wood Import, warmer music
// loop 151 v1.0 stamp + export / import so a shop survives a cleared browser
// loop 150 the wreck lantern calls Sable, a night guest on the east dock
// loop 149 Nico hangs a wreck lantern on the east dock after he buys one
// loop 148 hold the cone on the wreck chest — pearls + a lantern, Nico wants it
// loop 147 the wreck east of the shallows + lanternfish
// loop 146 visible hired diver NPCs walk the dock and stock the bowls
// loop 145 divers earn while you are away (offline accrual)
(() => {
  "use strict";

  // ===== CONFIG =====
  const W = 1280;
  const DESKTOP_H = 720;
  let H = DESKTOP_H;
  const SAVE_KEY = "aqua-bay-save";
  const SHOP = { w: 1760, h: 1260 };
  const SHOP_GALLERY_W = 1760;
  const OCEAN = { w: 3200, h: 1960 };
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
    // loop 147 — wreck-only. Unlock $90 after you find the hull, not a
    // deeper clone band. home:"wreck" keeps it out of the forever stack.
    { id: 13, name: "Lanternfish", color: "#f4d06a", accent: "#9ef0ff", outline: "#1a3040", price: 55, unlock: 90, cruise: 74, flee: 180, fleeR: 140, size: 14, gait: "dart", home: "wreck" },
  ];
  const SPECIES_N = SPECIES.length;
  const REGULAR_LINES = {
    Maya: ["the usual!", "my clownfish!", "don't skimp!"],
    Nico: ["the usual!", "perfect.", "again please", "from the wreck!"],
    Jun: ["the usual!", "don't skimp!", "again please"],
    Sable: ["the light!", "pretty!", "night swim?"],
    _: ["the usual!", "same as always", "you know me"],
  };
  const SALE_BARK_POOL = ["the usual!", "my clownfish!", "don't skimp!", "perfect.", "again please"];
  const REGULAR_LOOKS = {
    Maya: { hawaii: true, hat: "#e8c04a", shirt: "#1b6b5a", hair: "#3a2415", hairCut: 1, idle: "glance" },
    Nico: { sailor: true, hat: "#f4efe6", shirt: "#3d8bfd", hair: "#1b1b1b", hairCut: 0, idle: "whistle" },
    Jun: { visor: true, hat: "#e85d4c", shirt: "#f0b429", hair: "#8a4a1a", hairCut: 2, idle: "bounce" },
    Sable: { hat: "#1a1428", shirt: "#3a2458", hair: "#1a1020", hairCut: 1, idle: "glance", sunglasses: true },
  };
  const REGULAR_TINTS = {
    Maya: { fill: "rgba(18, 78, 68, 0.95)", ink: "#ffe27a", stroke: "#7ad0b0" },
    Nico: { fill: "rgba(16, 48, 108, 0.95)", ink: "#d6ecff", stroke: "#8eb8ff" },
    Jun: { fill: "rgba(122, 36, 30, 0.95)", ink: "#ffe27a", stroke: "#f0a060" },
    Sable: { fill: "rgba(28, 16, 48, 0.95)", ink: "#f4d06a", stroke: "#c4a0ff" },
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
    "A living lantern that never leaves the wreck.",
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
    "Glows only inside the wreck",
  ];
  const FOREVER_ZONE_NAMES = [
    "Midnight trench", "Crystal canyon", "Glow abyss", "Starfall hollow",
    "Ribbon rift", "Quiet cathedral", "Lantern stairs", "Forever blue",
  ];
  const SPEED_COST = [40, 90, 180, 350, 600];
  const BAG_COST   = [50, 120, 250, 450, 700];
  const CATCH_COST = [45, 100, 200, 400, 750];
  const CASHIER_COST = 80;
  // loop 144 — hireable auto-catching divers (Aquarium-Land-style idle
  // workers). Each level adds a diver who periodically stocks the emptiest
  // unlocked tank while you play, so sales tick along without you.
  const DIVER_COST = [120, 260, 560, 1200];
  const DIVER_MAX = DIVER_COST.length;
  // loop 146 — each hire is a real person on the dock, not just a timer.
  // Four looks so a full crew does not clone. Goggles + wetsuit keep them
  // from reading as another cashier or a Maya/Nico regular.
  const CREW_LOOKS = [
    { shirt: "#148a8c", hair: "#2a1a12", skin: "#c88858", hat: "#1a3a48", hairCut: 0 },
    { shirt: "#e85d4c", hair: "#4a2810", skin: "#d4a070", hat: "#2a5080", hairCut: 1 },
    { shirt: "#2a6a38", hair: "#1b1b1b", skin: "#b87848", hat: "#e8c04a", hairCut: 2 },
    { shirt: "#3d5a9a", hair: "#3a2415", skin: "#e0b080", hat: "#148a8c", hairCut: 0 },
  ];
  const DECOR_COST = [25, 40, 70];
  const DECOR_NAMES = ["String lights", "Shop sign", "Fountain"];
  const DECOR_TOAST = ["String lights hung!", "Shop sign painted!", "Plaza fountain installed!"];
  const BAG_STEPS  = [5, 8, 11, 14, 17, 20];
  // C76 — one tank neighborhood around the aisle, not two buildings
  // 500px apart. 5×3-ish grid on the north plaza (never the dock).
  const TANK_COL = 218;
  const TANK_ROW = 216;
  const TANK_GRID_X = 340;
  const TANK_GRID_Y = 164;
  const TANK_POS = [
    { x: 340, y: 164 }, { x: 558, y: 164 }, { x: 776, y: 164 },
    { x: 994, y: 164 }, { x: 1212, y: 164 },
    { x: 340, y: 380 }, { x: 558, y: 380 }, { x: 776, y: 380 }, { x: 994, y: 380 },
    { x: 340, y: 596 }, { x: 558, y: 596 }, { x: 776, y: 596 }, { x: 994, y: 596 },
    { x: 1212, y: 380 },
  ];
  const TANK_W = 210, TANK_H = 156;
  const STOCK_PAD = 64;
  const SESSION_GOAL_BONUS = 8;
  const REGISTER = { x: 168, y: 500, w: 150, h: 110 };
  const KIOSK    = { x: 1280, y: 480, w: 170, h: 130 };
  const WELCOME  = { x: 140, y: 780, w: 156, h: 86 };
  const DIVE_ZONE = { x: 520, y: 980, w: 720, h: 160 };
  // East dressing sits on the same painted dock as the west walk — not
  // a second room at plaza Y. C72 parked hut / POP on the east shop
  // deck (y≈548); walking east then opened the navy gap. Whole-sprite
  // fade hides them before the reserved well.
  const BAIT_HUT = { x: 1124, y: 918 };
  const POP_VEND = { x: 996, y: 918 };
  // Between POP (right 1018) and the hut body (left 1084) so "OPEN" is
  // not buried under the kiosk. Same dock y as the shops. C93 hangs the
  // board off the arm (left of the post) — planted X/Y stay.
  const OPEN_SIGN = { x: 1052, y: 924 };
  const EAST_CRATES = { x: 1056, y: 936 };
  // loop 153 — west of the life ring / DIVE post so the first-session
  // dock stays quiet and Continue still reads the slate on dock cam.
  const DAY_BOARD = { x: 348, y: 942 };
  const DAY_GUESTS = ["Maya", "Nico", "Jun"];
  // loop 149 — Nico hangs the wreck lantern off the bait hut's east eave
  // so OPEN / the life ring stay readable and the glow sits on the dusk dock.
  const WRECK_LAMP = { x: BAIT_HUT.x + 56, y: BAIT_HUT.y + 8 };
  // Aisle boards stop here on the dock camera so the ramp does not
  // hard-cut into the sky. Plaza camera still paints the full aisle.
  const NORTH_WALK_CAP_Y = 760;
  const DOCK_CAM_FLOOR = 1000;
  const PLAZA_CAM_CEILING = 520;
  const AISLE = { x: 802, y: 760, w: 156, h: 160 };
  const EXPEDITION_COST = 35;
  const EXPEDITION_SECS = 45;
  const BOAT = { x: 1224, y: 1052 };
  const REEF_Y = 1000, REEF_X = 1700;
  const LM_GOLD = { x: 1880, y: 1120 };
  const LM_KOI = { x: 2080, y: 1520 };
  const LM_TURTLE = { x: 1640, y: 1760 };
  // loop 147 — a real east place, past the old 2520 wall. Hull sits in
  // the new water so swim-east is a destination, not another deeper band.
  const WRECK = { x: 2680, y: 520, w: 460, h: 340 };
  const LM_WRECK = { x: 2880, y: 680 };
  const WRECK_CHEST = { x: 2988, y: 760 };
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
    out[0] = true;
    return out;
  }
  // C90 — species unlock, not tank count / stock. Clownfish is the starter:
  // New Game, fresh save, and an emptied bowl stay open. Selling must not
  // re-lock. Frost / padlock read this helper, never `stock === 0`.
  function speciesUnlocked(i) {
    if (i === 0) return true;
    return !!(state && state.unlocked && state.unlocked[i]);
  }
  function ensureUnlockFlags() {
    if (!state) return;
    state.unlocked = padSpeciesFlags(state.unlocked);
  }
  function padSpeciesNums(arr) {
    const out = [];
    for (let i = 0; i < SPECIES.length; i++) out[i] = (arr && arr[i]) | 0;
    return out;
  }
  function galleryOpen() {
    return !!(state && (state.unlocked[4] || (state.unlocked && state.unlocked.filter(Boolean).length >= CORE_SPECIES)));
  }
  function isWreckSpecies(s) {
    return !!(SPECIES[s] && SPECIES[s].home === "wreck");
  }
  function lanternUnlockReady() {
    return !!(state && (state.sawWreck || ((state.caughtCount && state.caughtCount[13]) | 0) > 0));
  }
  function tankLive(i) {
    if (i < 0 || i >= SPECIES.length) return false;
    if (i < CORE_SPECIES) return true;
    if (galleryOpen()) return true;
    if (speciesUnlocked(i)) return true;
    // loop 147 — lantern bowl appears after you find the wreck, even
    // before Sea Turtle opens the rest of the gallery.
    if (isWreckSpecies(i) && lanternUnlockReady()) return true;
    return false;
  }
  function shopWalkMax() {
    return 1480;
  }
  function onAisleWalk(x, y) {
    return x > AISLE.x - 16 && x < AISLE.x + AISLE.w + 16 &&
      y > AISLE.y - 12 && y < AISLE.y + AISLE.h + 40;
  }
  function eastShopNavyGap(x, y) {
    // Empty east-shop wood (y≈380–666) while feet stay on the dock — C73 yank.
    // Keep the core-5 walk pad (Turtle ≈ y=352) out of this so it stays plaza.
    return x > 1220 && x < 1550 && y > 378 && y < 720;
  }
  function destWantsPlaza(dest) {
    if (!dest) return false;
    if (onWestDockWalk(dest.x, dest.y)) return false;
    if (onEastDockWalk(dest.x, dest.y)) return false;
    if (dest.y >= 820) return false;
    if (eastShopNavyGap(dest.x, dest.y)) return false;
    return true;
  }
  function destWantsDock(dest) {
    if (!dest) return false;
    if (onWestDockWalk(dest.x, dest.y)) return true;
    if (onEastDockWalk(dest.x, dest.y)) return true;
    if (eastShopNavyGap(dest.x, dest.y)) return true;
    return dest.y > 820;
  }
  function shopW() {
    return SHOP.w;
  }
  function namedZoneBottom(s) {
    if (s <= 4) return OCEAN_BASE_H;
    return OCEAN_BASE_H + (s - 4) * ZONE_STEP;
  }
  function zoneBandForSpecies(s) {
    if (isWreckSpecies(s)) return { y0: WRECK.y, y1: WRECK.y + WRECK.h };
    if (s <= 0) return { y0: 260, y1: 880 };
    if (s === 1) return { y0: 920, y1: 1280 };
    if (s === 2) return { y0: 1040, y1: 1400 };
    if (s === 3) return { y0: 1400, y1: 1680 };
    if (s === 4) return { y0: 1640, y1: 1960 };
    const y0 = OCEAN_BASE_H + (s - 5) * ZONE_STEP;
    return { y0, y1: y0 + ZONE_STEP };
  }
  function inWreck(x, y) {
    return x > WRECK.x - 80 && x < WRECK.x + WRECK.w + 80 &&
      y > WRECK.y - 60 && y < WRECK.y + WRECK.h + 90;
  }
  function isChestTarget(f) {
    return !!(f && f.chest);
  }
  function wreckChestTarget() {
    if (state.scene !== "ocean" || !state.wreckChestReady) return null;
    if (!state.wreckChestObj) {
      state.wreckChestObj = { chest: true, x: WRECK_CHEST.x, y: WRECK_CHEST.y, vx: 0, vy: 0, ang: 0 };
    }
    state.wreckChestObj.x = WRECK_CHEST.x;
    state.wreckChestObj.y = WRECK_CHEST.y;
    return state.wreckChestObj;
  }
  function wreckCurrentX(x, y) {
    if (y > 980 || y < 240) return 0;
    if (x > 2080 && x < WRECK.x + 40) return 48;
    if (inWreck(x, y)) return 14;
    return 0;
  }
  function zoneAtDepth(y, x) {
    if (x != null && inWreck(x, y)) {
      return { name: "The wreck", s: 13, y0: WRECK.y, y1: WRECK.y + WRECK.h, wreck: true };
    }
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
    for (let i = 0; i < SPECIES.length; i++) {
      if (isWreckSpecies(i)) continue;
      if (state.unlocked[i]) h = i;
    }
    return h;
  }
  function nextLockedSafe() {
    if (!state || !state.unlocked) return 1;
    for (let i = 0; i < SPECIES.length; i++) {
      if (isWreckSpecies(i)) continue;
      if (!speciesUnlocked(i)) return i;
    }
    return -1;
  }
  function landmarkForSpecies(s) {
    if (isWreckSpecies(s)) return LM_WRECK;
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
  let canvasSx = 1;
  let canvasSy = 1;

  // Loop 48 characters/fish + loop 53 walk/swim + loop 55 skyline + loop 56 cone/props + loop 57 pier/paddle + loop 58 plant + loop 59 clean blit/pier + loop 60 plant props + loop 61 NPC plate/shadow + loop 62 continuous pier + loop 63 water-on-water + loop 64 seabed/DIVE + loop 65 unique deep bed + loop 66 hang/lang + loop 67 second dive + loop 68 scroll tear + loop 69 HUD gutter + loop 70 reserved rail + loop 71 rail fade / last plank + loop 72 one-scene dock / whole-sprite rail + loop 73 east dock one scene + loop 74 dusk sky / north cap / OPEN + loop 75 surface unstick / visible dusk town / east cap / one SHINY + loop 76 aisle / gallery tank walk + loop 77 plaza click / WASD + loop 78 portrait phone layout + loop 79 phone menu / tap copy / rail + loop 80 playable phone (full playfield, shop tray, chip DIVE) + loop 81 safe-area HUD / full DIVE / findable stock + loop 82 visual-viewport DIVE / BAG plate / notch + loop 83 portrait BAG opaque plate + loop 84 plaza DIVE inset / readable dive pills + loop 85 phone toasts wrap / HUD gap + loop 86 faster plaza DIVE walk + loop 87 one DIVE cue / no stale south hint + loop 88 plaza tanks / planks / painted shop wall + loop 89 padlock only on locked tanks + loop 90 starter unlock stays when empty + loop 91 dock POP cooler / OPEN sign / water-edge foam + loop 92 bait hut / one OPEN sign + loop 93 NPC bubbles stay on stage / OPEN hang + loop 94 390-wide title stack / phoneCss picker + loop 95 picker portraits / label inset + loop 96 pier-board title buttons + loop 97 pier-board DIVE chip + loop 100 pin tap-to-stock to the glowing tank + loop 101 desktop walk to Puffer + loop 102 east gallery aisle to Puffer + loop 103 hold-W east spine + loop 104 hold-W next unlock + loop 105 hold-W west lane + loop 106 hold-W north through the bowls + loop 107 phone 390 tap-to-walk to the shop bowls + loop 108 tap north reaches the bowls + loop 109 walk is not a buy + loop 110 tap the lock + loop 111 dive for the new bowl + loop 112 dive for the right band + loop 113 hunt locks a seahorse + loop 114 hide SURFACE until the hunt bags + loop 115 dive chip arms the hunt + loop 116 today hunt copy + loop 117 catalog book not shop + loop 118 plaza today after unlock + loop 119 ocean zone plate readable + loop 120 hunt hud not over prey + loop 121 surface ribbon clear of SURFACE + loop 122 surface stays on the dock + loop 123 body turn not paper flip + loop 124 north walk is not a south-dock quest + loop 125 one shore no water-walk boat tap only + loop 126 no store-to-shore cut + loop 127 DIVE works on the dock. + loop 128 walk the west dock + loop 129 west dock tap walks west + loop 130 east dock tap walks east + loop 131 one DIVE prompt, opaque pause + loop 132 title Who's diving readable + loop 133 one SURFACE cue at the waterline + loop 134 one BOAT cue on the action board + loop 135 dino turns flat not a paper flip + loop 136 dino swims flat not a paper flip + loop 137 next unlock shows how much more you need + loop 138 clearer walk-to-stock direction arrow + loop 139 next-buy caption lights up when you can afford it + loop 140 fish face where they swim not belly-up + loop 141 diver pitches into a real dive + loop 144 hireable auto-catching divers + loop 145 divers earn while you are away + loop 146 visible hired diver NPCs + loop 147 the wreck east of the shallows / lanternfish
  const ATLAS = {"skip_walk0":{"x":2,"y":2,"w":140,"h":184,"ax":70.0,"ay":176},"skip_walk1":{"x":144,"y":2,"w":140,"h":184,"ax":70.0,"ay":176},"skip_walk2":{"x":286,"y":2,"w":140,"h":184,"ax":70.0,"ay":176},"skip_walk3":{"x":428,"y":2,"w":140,"h":184,"ax":70.0,"ay":176},"skip_walk4":{"x":570,"y":2,"w":140,"h":184,"ax":70.0,"ay":176},"skip_walk5":{"x":712,"y":2,"w":140,"h":184,"ax":70.0,"ay":176},"skip_swim0":{"x":854,"y":2,"w":196,"h":108,"ax":98.0,"ay":54.0},"skip_swim1":{"x":1052,"y":2,"w":196,"h":108,"ax":98.0,"ay":54.0},"skip_swim2":{"x":1250,"y":2,"w":196,"h":108,"ax":98.0,"ay":54.0},"skip_swim3":{"x":2,"y":188,"w":196,"h":108,"ax":98.0,"ay":54.0},"skip_swim4":{"x":200,"y":188,"w":196,"h":108,"ax":98.0,"ay":54.0},"skip_swim5":{"x":398,"y":188,"w":196,"h":108,"ax":98.0,"ay":54.0},"reef_walk0":{"x":596,"y":188,"w":140,"h":184,"ax":70.0,"ay":176},"reef_walk1":{"x":738,"y":188,"w":140,"h":184,"ax":70.0,"ay":176},"reef_walk2":{"x":880,"y":188,"w":140,"h":184,"ax":70.0,"ay":176},"reef_walk3":{"x":1022,"y":188,"w":140,"h":184,"ax":70.0,"ay":176},"reef_walk4":{"x":1164,"y":188,"w":140,"h":184,"ax":70.0,"ay":176},"reef_walk5":{"x":1306,"y":188,"w":140,"h":184,"ax":70.0,"ay":176},"reef_swim0":{"x":2,"y":374,"w":196,"h":108,"ax":98.0,"ay":54.0},"reef_swim1":{"x":200,"y":374,"w":196,"h":108,"ax":98.0,"ay":54.0},"reef_swim2":{"x":398,"y":374,"w":196,"h":108,"ax":98.0,"ay":54.0},"reef_swim3":{"x":596,"y":374,"w":196,"h":108,"ax":98.0,"ay":54.0},"reef_swim4":{"x":794,"y":374,"w":196,"h":108,"ax":98.0,"ay":54.0},"reef_swim5":{"x":992,"y":374,"w":196,"h":108,"ax":98.0,"ay":54.0},"dino_walk0":{"x":1190,"y":374,"w":140,"h":184,"ax":70.0,"ay":176},"dino_walk1":{"x":1332,"y":374,"w":140,"h":184,"ax":70.0,"ay":176},"dino_walk2":{"x":2,"y":560,"w":140,"h":184,"ax":70.0,"ay":176},"dino_walk3":{"x":144,"y":560,"w":140,"h":184,"ax":70.0,"ay":176},"dino_walk4":{"x":286,"y":560,"w":140,"h":184,"ax":70.0,"ay":176},"dino_walk5":{"x":428,"y":560,"w":140,"h":184,"ax":70.0,"ay":176},"dino_swim0":{"x":570,"y":560,"w":196,"h":108,"ax":98.0,"ay":54.0},"dino_swim1":{"x":768,"y":560,"w":196,"h":108,"ax":98.0,"ay":54.0},"dino_swim2":{"x":966,"y":560,"w":196,"h":108,"ax":98.0,"ay":54.0},"dino_swim3":{"x":1164,"y":560,"w":196,"h":108,"ax":98.0,"ay":54.0},"dino_swim4":{"x":1362,"y":560,"w":196,"h":108,"ax":98.0,"ay":54.0},"dino_swim5":{"x":2,"y":746,"w":196,"h":108,"ax":98.0,"ay":54.0},"skip_stand":{"x":200,"y":746,"w":128,"h":176,"ax":64,"ay":168},"skip_walk":{"x":330,"y":746,"w":128,"h":176,"ax":64,"ay":168},"skip_dive":{"x":460,"y":746,"w":176,"h":96,"ax":96,"ay":48},"reef_stand":{"x":638,"y":746,"w":128,"h":176,"ax":64,"ay":168},"reef_walk":{"x":768,"y":746,"w":128,"h":176,"ax":64,"ay":168},"reef_dive":{"x":898,"y":746,"w":176,"h":96,"ax":96,"ay":48},"dino_stand":{"x":1076,"y":746,"w":128,"h":176,"ax":64,"ay":168},"dino_walk":{"x":1206,"y":746,"w":128,"h":176,"ax":64,"ay":168},"dino_dive":{"x":1336,"y":746,"w":176,"h":96,"ax":96,"ay":48},"fish0":{"x":2,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish1":{"x":116,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish2":{"x":230,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish3":{"x":344,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish4":{"x":458,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish5":{"x":572,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish6":{"x":686,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish7":{"x":800,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish8":{"x":914,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish9":{"x":1028,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish10":{"x":1142,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish11":{"x":1256,"y":924,"w":112,"h":72,"ax":62,"ay":36},"fish12":{"x":1370,"y":924,"w":112,"h":72,"ax":62,"ay":36},"maya":{"x":1484,"y":924,"w":96,"h":140,"ax":48,"ay":132},"nico":{"x":2,"y":1066,"w":96,"h":140,"ax":48,"ay":132},"jun":{"x":100,"y":1066,"w":96,"h":140,"ax":48,"ay":132},"cashier":{"x":198,"y":1066,"w":96,"h":140,"ax":48,"ay":132},"vip":{"x":296,"y":1066,"w":96,"h":140,"ax":48,"ay":132},"kid":{"x":394,"y":1066,"w":96,"h":140,"ax":48,"ay":132},"g0":{"x":492,"y":1066,"w":96,"h":140,"ax":48,"ay":132},"g1":{"x":590,"y":1066,"w":96,"h":140,"ax":48,"ay":132},"g2":{"x":688,"y":1066,"w":96,"h":140,"ax":48,"ay":132},"g3":{"x":786,"y":1066,"w":96,"h":140,"ax":48,"ay":132},"g4":{"x":884,"y":1066,"w":96,"h":140,"ax":48,"ay":132},"g5":{"x":982,"y":1066,"w":96,"h":140,"ax":48,"ay":132},"crown":{"x":1080,"y":1066,"w":40,"h":32,"ax":20,"ay":28},"shades":{"x":1122,"y":1066,"w":40,"h":20,"ax":20,"ay":12},"tankglass":{"x":1164,"y":1066,"w":140,"h":110,"ax":70,"ay":55},"bed0":{"x":1306,"y":1066,"w":220,"h":92,"ax":110,"ay":68},"bed1":{"x":2,"y":1208,"w":220,"h":92,"ax":110,"ay":68},"bed2":{"x":224,"y":1208,"w":220,"h":92,"ax":110,"ay":68},"bed3":{"x":446,"y":1208,"w":220,"h":92,"ax":110,"ay":68},"bed4":{"x":668,"y":1208,"w":220,"h":92,"ax":110,"ay":68},"bed5":{"x":890,"y":1208,"w":220,"h":92,"ax":110,"ay":68},"bed6":{"x":1112,"y":1208,"w":220,"h":92,"ax":110,"ay":68},"bed7":{"x":1334,"y":1208,"w":220,"h":92,"ax":110,"ay":68},"post":{"x":2,"y":1302,"w":44,"h":110,"ax":22,"ay":104},"skip_card":{"x":48,"y":1302,"w":140,"h":184,"ax":70.0,"ay":176},"reef_card":{"x":190,"y":1302,"w":140,"h":184,"ax":70.0,"ay":176},"dino_card":{"x":332,"y":1302,"w":140,"h":184,"ax":70.0,"ay":176},"harbortown":{"x":474,"y":1302,"w":630,"h":420,"ax":315.0,"ay":386.40000000000003},"harbor":{"x":1106,"y":1302,"w":480,"h":320,"ax":240.0,"ay":288.0},"sky":{"x":2,"y":1724,"w":630,"h":176,"ax":315.0,"ay":176},"plank":{"x":634,"y":1724,"w":240,"h":40,"ax":120.0,"ay":20.0},"plank1":{"x":876,"y":1724,"w":240,"h":40,"ax":120.0,"ay":20.0},"plank2":{"x":1118,"y":1724,"w":240,"h":40,"ax":120.0,"ay":20.0},"plank3":{"x":2,"y":1902,"w":240,"h":40,"ax":120.0,"ay":20.0},"plank4":{"x":244,"y":1902,"w":240,"h":40,"ax":120.0,"ay":20.0},"plank5":{"x":486,"y":1902,"w":240,"h":40,"ax":120.0,"ay":20.0},"plank6":{"x":728,"y":1902,"w":240,"h":40,"ax":120.0,"ay":20.0},"plank7":{"x":970,"y":1902,"w":240,"h":40,"ax":120.0,"ay":20.0},"water":{"x":1212,"y":1902,"w":300,"h":200,"ax":150.0,"ay":56.00000000000001},"waterline":{"x":2,"y":2104,"w":360,"h":56,"ax":180,"ay":38},"waterline2":{"x":364,"y":2104,"w":360,"h":56,"ax":180,"ay":38},"divepad":{"x":726,"y":2104,"w":220,"h":110,"ax":110.0,"ay":94.6},"lifering":{"x":948,"y":2104,"w":96,"h":96,"ax":48,"ay":86},"anchor":{"x":1046,"y":2104,"w":90,"h":110,"ax":45,"ay":102}};
  const ART = { img: null, ready: false };
  (function loadBayArt() {
    const img = new Image();
    img.onload = function () { ART.img = img; ART.ready = true; };
    img.src = "art/bay.png";
  })();
  // Afternoon sun from the upper-left. Dock props, NPCs, and the dinghy
  // share one contact shade so they sit on the boards instead of floating.
  const SUN = { dx: -7, dy: 3 };
  const CUST_PLATE = {
    maya: 1, nico: 1, jun: 1, cashier: 1, vip: 1, kid: 1,
    g0: 1, g1: 1, g2: 1, g3: 1, g4: 1, g5: 1,
  };
  const plateCan = {};
  function sitShadow(x, y, rx, ry, a) {
    ctx.save();
    const ox = SUN.dx * 0.45, oy = SUN.dy * 0.85;
    const g = ctx.createRadialGradient(x + ox * 0.15, y + oy * 0.1, 0.4, x + ox, y + oy + 1, rx * 1.18);
    const alpha = a == null ? 0.38 : a;
    g.addColorStop(0, "rgba(16, 8, 4," + alpha + ")");
    g.addColorStop(0.5, "rgba(16, 8, 4," + (alpha * 0.36) + ")");
    g.addColorStop(1, "rgba(16, 8, 4, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x + ox * 0.28, y + oy * 0.35, rx, Math.max(2.2, ry * 0.62), -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function sunWashBox(x, y, w, h, rad) {
    ctx.save();
    if (rad) { roundRect(x, y, w, h, rad); ctx.clip(); }
    const sun = sunAmt(x + w * 0.5, y + h * 0.5);
    const lg = ctx.createLinearGradient(x, y, x + w * 0.42, y + h);
    lg.addColorStop(0, "rgba(255,228,170," + (0.11 + sun * 0.10) + ")");
    lg.addColorStop(0.46, "rgba(255,255,255,0)");
    lg.addColorStop(1, "rgba(22,26,46," + (0.10 + (1 - sun) * 0.08) + ")");
    ctx.fillStyle = lg;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
  function plateSrc(name) {
    if (!CUST_PLATE[name] || !ART.ready) return null;
    if (plateCan[name]) return plateCan[name];
    const c = ATLAS[name];
    if (!c) return null;
    const off = document.createElement("canvas");
    off.width = c.w;
    off.height = c.h;
    const g = off.getContext("2d");
    g.drawImage(ART.img, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
    const img = g.getImageData(0, 0, c.w, c.h);
    const d = img.data, w = c.w, h = c.h;
    // Packed leftover plates are pale mint / cyan slabs painted *behind*
    // the person. They sit inset in the cell (transparent padding), so an
    // edge-flood of the canvas never starts. Seed from the opaque bbox.
    function plateAt(i) {
      const r = d[i], gv = d[i + 1], b = d[i + 2], a = d[i + 3];
      if (a < 18) return false;
      // Keep warm paint: skin, orange dress, straw hat, wood, hair.
      if (r > gv + 14 && r > b + 8) return false;
      if (r > 198 && gv > 150 && b < 150) return false;
      const mx = gv > b ? gv : b, mn = gv < b ? gv : b;
      const cyan = (gv + b) > r * 1.42;
      const dull = (mx - mn) < 92;
      // Pale packed slabs only — keep dark navy / forest shirts.
      return cyan && dull && mx > 118 && r < 168 && r < mn + 22;
    }
    let x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] >= 18) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    const seen = new Uint8Array(w * h);
    const stack = [];
    function push(p) {
      if (p < 0 || p >= w * h || seen[p]) return;
      if (!plateAt(p * 4)) return;
      seen[p] = 1;
      stack.push(p);
    }
    if (x1 >= x0) {
      const ring = 10;
      for (let t = 0; t < ring; t++) {
        for (let x = x0; x <= x1; x++) {
          push((y0 + t) * w + x);
          push((y1 - t) * w + x);
        }
        for (let y = y0; y <= y1; y++) {
          push(y * w + (x0 + t));
          push(y * w + (x1 - t));
        }
      }
    }
    while (stack.length) {
      const p = stack.pop();
      d[p * 4 + 3] = 0;
      const x = p % w;
      if (x > 0) push(p - 1);
      if (x < w - 1) push(p + 1);
      if (p >= w) push(p - w);
      if (p < w * (h - 1)) push(p + w);
      if (x > 0 && p >= w) push(p - w - 1);
      if (x < w - 1 && p >= w) push(p - w + 1);
      if (x > 0 && p < w * (h - 1)) push(p + w - 1);
      if (x < w - 1 && p < w * (h - 1)) push(p + w + 1);
    }
    // Peel a few leftover slab columns on the hard packed rect.
    if (x1 >= x0) {
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x0 + 5 && x <= x1; x++) {
          const i = (y * w + x) * 4;
          if (plateAt(i)) d[i + 3] = 0;
          else if (d[i + 3] >= 18) break;
        }
        for (let x = x1; x >= x1 - 5 && x >= x0; x--) {
          const i = (y * w + x) * 4;
          if (plateAt(i)) d[i + 3] = 0;
          else if (d[i + 3] >= 18) break;
        }
      }
    }
    g.putImageData(img, 0, 0);
    plateCan[name] = off;
    return off;
  }
  // Scratch pad so lighting / CSS filters never composite onto the live
  // canvas. source-atop fillRect on the dest (old path) painted a pale
  // rectangle over already-drawn water — the fish "bounding box" halo.
  let blitPad = null;
  function blitScratch(w, h) {
    const tw = Math.max(8, w | 0);
    const th = Math.max(8, h | 0);
    if (!blitPad || blitPad.width < tw || blitPad.height < th) {
      blitPad = document.createElement("canvas");
      blitPad.width = Math.max(tw, 256);
      blitPad.height = Math.max(th, 160);
    }
    const g = blitPad.getContext("2d");
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
    g.filter = "none";
    g.clearRect(0, 0, blitPad.width, blitPad.height);
    return g;
  }
  function blit(name, x, y, opt) {
    const c = ATLAS[name];
    if (!c || !ART.ready) return false;
    opt = opt || {};
    const sc = opt.scale == null ? 1 : opt.scale;
    const plate = plateSrc(name);
    const src = plate || ART.img;
    const sx0 = plate ? 0 : c.x, sy0 = plate ? 0 : c.y;
    const sw0 = plate ? plate.width : c.w, sh0 = plate ? plate.height : c.h;
    if (!opt.flat && !opt.water && !opt.noShadow) {
      sitShadow(x + SUN.dx * 0.08, y + 6, Math.max(12, 18 * sc), Math.max(4.2, 5.6 * sc), 0.44);
    }
    const incoming = opt.filter || (ctx.filter && ctx.filter !== "none" ? ctx.filter : "");
    const litLand = !opt.flat && !opt.water;
    ctx.save();
    ctx.translate(x, y);
    const sx = (opt.scaleX == null ? 1 : opt.scaleX) * (opt.flip ? -1 : 1);
    const sy = opt.scaleY == null ? 1 : opt.scaleY;
    if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
    if (opt.rot) ctx.rotate(opt.rot);
    // Water fish: painted edges only. No source-atop wash on the dest
    // (C59 scratch-pad isolation). Depth tint + 1px sprite AA live on
    // the pad so they cannot leave a pale dest-rect.
    if (!incoming && !litLand) {
      ctx.filter = "none";
      if (!opt.water) {
        ctx.drawImage(src, sx0, sy0, sw0, sh0, -c.ax * sc, -c.ay * sc, c.w * sc, c.h * sc);
        ctx.restore();
        return true;
      }
      const dw = Math.max(1, Math.ceil(c.w * sc));
      const dh = Math.max(1, Math.ceil(c.h * sc));
      const pad = 2;
      const g = blitScratch(dw + pad * 2, dh + pad * 2);
      g.globalAlpha = 0.3;
      g.drawImage(src, sx0, sy0, sw0, sh0, pad - 0.55, pad, dw, dh);
      g.drawImage(src, sx0, sy0, sw0, sh0, pad + 0.55, pad, dw, dh);
      g.drawImage(src, sx0, sy0, sw0, sh0, pad, pad - 0.55, dw, dh);
      g.drawImage(src, sx0, sy0, sw0, sh0, pad, pad + 0.55, dw, dh);
      g.globalAlpha = 1;
      g.drawImage(src, sx0, sy0, sw0, sh0, pad, pad, dw, dh);
      const deep = state.scene === "ocean" ? clamp((y - 240) / 1700, 0, 0.7) : 0.1;
      g.globalCompositeOperation = "source-atop";
      const tg = g.createLinearGradient(pad, pad, pad, dh + pad);
      tg.addColorStop(0, "rgba(170, 226, 236, " + (0.03 + deep * 0.05) + ")");
      tg.addColorStop(1, "rgba(6, 26, 42, " + (0.08 + deep * 0.26) + ")");
      g.fillStyle = tg;
      g.fillRect(0, 0, dw + pad * 2, dh + pad * 2);
      g.globalCompositeOperation = "source-over";
      ctx.drawImage(blitPad, 0, 0, dw + pad * 2, dh + pad * 2, -c.ax * sc - pad, -c.ay * sc - pad, dw + pad * 2, dh + pad * 2);
      ctx.restore();
      return true;
    }
    const dw = Math.max(1, Math.ceil(c.w * sc));
    const dh = Math.max(1, Math.ceil(c.h * sc));
    const pad = 2;
    const g = blitScratch(dw + pad * 2, dh + pad * 2);
    if (incoming) g.filter = incoming;
    g.drawImage(src, sx0, sy0, sw0, sh0, pad, pad, dw, dh);
    g.filter = "none";
    if (incoming) {
      // hue-rotate / saturate / brightness leave a dest-rect veil on
      // transparent pixels. Punch back to the sprite's own alpha.
      g.globalCompositeOperation = "destination-in";
      g.drawImage(src, sx0, sy0, sw0, sh0, pad, pad, dw, dh);
      g.globalCompositeOperation = "source-over";
    }
    if (litLand) {
      const sun = state.scene === "shop" ? sunAmt(x, y) : 0.52;
      const lg = g.createLinearGradient(pad, pad, dw * 0.38, dh);
      lg.addColorStop(0, "rgba(255,228,170," + (0.10 + sun * 0.10) + ")");
      lg.addColorStop(0.42, "rgba(255,255,255,0)");
      lg.addColorStop(1, "rgba(22,26,46," + (0.11 + (1 - sun) * 0.10) + ")");
      g.globalCompositeOperation = "source-atop";
      g.fillStyle = lg;
      g.fillRect(0, 0, dw + pad * 2, dh + pad * 2);
      g.globalCompositeOperation = "source-over";
    }
    ctx.filter = "none";
    ctx.drawImage(blitPad, 0, 0, dw + pad * 2, dh + pad * 2, -c.ax * sc - pad, -c.ay * sc - pad, dw + pad * 2, dh + pad * 2);
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
    const c = ATLAS.harbortown || ATLAS.harbor;
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
    if (opt.crew || opt.goggles) return null;
    // g0–g5 atlas cells still pack a teal slab that collides with teal
    // shirts. Paint generics so no raw plate sits behind anyone.
    return null;
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
    splash: null, tankReveal: null, unlockBanner: null, comboPop: null, welcomeBack: null,
    shopSwimmers: [], didFirstCollect: false, didFirstUnlock: false,
    hiredCashier: false, cashierAcc: 0, diverLv: 0, diverAcc: 0, lastPlayed: 0,
    sawReef: false, sawGoldGarden: false, sawKoiGate: false, sawTurtleMeadow: false,
    sawWreck: false, wreckHinted: false, wreckChestReady: false, lanternRumor: false, wreckLamp: false, sessionChest: false, sessionNicoLantern: false, sessionSable: false, sableCd: 0, sableHinted: false,
    inReef: false, inWreck: false, zoneTitle: null,
    expedition: false, expeditionTime: 0, peakMoney: 0, vipCooldown: 0,
    caughtCount: padSpeciesNums([]), bookOpen: null,
    decor: [false, false, false], expeditionCount: 0, nightExpedition: false,
    decorOpen: false,
    missionStep: 0, missionDone: false, caughtRare: false,
    bagRare: [], stockRare: padSpeciesNums([]),
    sessionDay: 1, sawDeepZone: 0,
    dayGuest: "", dayWant: -1, dayAt: 0, sessionDayGuest: false,
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
    tangHintLife: 0, tangHintDone: false,
    diveForTank: null, diveForAway: 0, diveForHunt: null,
  };
  const player = { x: 880, y: 920, vx: 0, vy: 0, facing: 0, bob: 0, catchProg: 0, target: null, radius: 16, goto: null, route: null, blockT: 0, walkPhase: 0, lean: 0, faceS: 1, pitch: 0, pendingAct: null, unlockConfirm: null, catchLatch: false, scoopLock: null, scoopTap: false, tillDwell: 0, holdGrace: 0, surfaceIntent: false };
  const cam = { x: 880, y: 920, z: 1, rail: 28 };
  const oceanFish = [];
  const tankFish = SPECIES.map(() => []);
  const customers = [];
  const crew = [];
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
  let upgradeArm = { id: "", t: 0 };
  let phoneShopOpen = false;
  let menuYShift = 0;
  let custTimer = 0;
  let browseTimer = 0.35;

  // ===== AUDIO =====
  let actx = null;
  const music = { started: false, pad: null, padGain: null, fifth: null, fifthGain: null, sub: null, subGain: null, lfo: null, wash: null, washGain: null, washFilter: null, step: 0, acc: 0 };
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
      // loop 152 — a fifth and a quiet triangle sub so the pad is a
      // chord, not a lone 110 Hz sine. Mute still zeros every gain.
      music.fifth = a.createOscillator();
      music.fifth.type = "sine";
      music.fifth.frequency.value = 165;
      music.fifthGain = a.createGain();
      music.fifthGain.gain.value = state.muted ? 0 : 0.010;
      music.fifth.connect(music.fifthGain);
      music.fifthGain.connect(a.destination);
      music.fifth.start();
      music.sub = a.createOscillator();
      music.sub.type = "triangle";
      music.sub.frequency.value = 55;
      music.subGain = a.createGain();
      music.subGain.gain.value = state.muted ? 0 : 0.007;
      music.sub.connect(music.subGain);
      music.subGain.connect(a.destination);
      music.sub.start();
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
    if (music.fifth) {
      music.fifth.frequency.setTargetAtTime(padFreq * 1.5, actx.currentTime, 0.35);
      if (music.fifthGain) music.fifthGain.gain.setTargetAtTime(state.muted ? 0 : (sectionB ? 0.007 : 0.009), actx.currentTime, 0.12);
    }
    if (music.sub) {
      music.sub.frequency.setTargetAtTime(padFreq * 0.5, actx.currentTime, 0.4);
      if (music.subGain) music.subGain.gain.setTargetAtTime(state.muted ? 0 : 0.006, actx.currentTime, 0.16);
    }
    if (music.washFilter) {
      music.washFilter.frequency.setTargetAtTime(ocean ? 300 : 500, actx.currentTime, 0.4);
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
    sawWreck: false, wreckHinted: false, wreckChestReady: false, lanternRumor: false, wreckLamp: false, sessionChest: false, sessionNicoLantern: false, sessionSable: false, sableCd: 0, sableHinted: false,
      peakMoney: 0, caughtCount: padSpeciesNums([]),
      decor: [false, false, false], expeditionCount: 0,
      missionStep: 0, missionDone: false, caughtRare: false,
      bagRare: [], stockRare: padSpeciesNums([]),
      sessionGoals: [], sessionGoalDone: [], sessionSales: 0,
      sessionDay: 1, sawDeepZone: 0,
      dayGuest: "", dayWant: -1, dayAt: 0, sessionDayGuest: false,
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
        money: d.money | 0,
        speedLv: Math.max(d.speedLv | 0, (d.upgrades && d.upgrades.speedLv) | 0),
        bagLv: Math.max(d.bagLv | 0, (d.upgrades && d.upgrades.bagLv) | 0),
        catchLv: Math.max(d.catchLv | 0, (d.upgrades && d.upgrades.catchLv) | 0),
        unlocked: padSpeciesFlags(Array.isArray(d.unlocked) ? d.unlocked : [true]),
        stock: padSpeciesNums(Array.isArray(d.stock) ? d.stock : []),
        bag: Array.isArray(d.bag) ? d.bag : [],
        tutorial: d.tutorial | 0, registerCash: d.registerCash | 0,
        lifetimeCatches: d.lifetimeCatches | 0,
        muted: !!d.muted,
        displayMoney: d.money | 0,
        didFirstCollect: !!(d.didFirstCollect || (d.money | 0) > 0),
        didFirstUnlock: !!(d.didFirstUnlock || (Array.isArray(d.unlocked) && d.unlocked.filter(Boolean).length > 1)),
        hiredCashier: !!(d.hiredCashier || (d.upgrades && d.upgrades.hiredCashier)),
        cashierAcc: 0,
        diverLv: clamp((d.diverLv != null ? d.diverLv : (d.upgrades && d.upgrades.diverLv)) | 0, 0, DIVER_MAX),
        diverAcc: 0,
        sawReef: !!d.sawReef, sawGoldGarden: !!d.sawGoldGarden,
        sawKoiGate: !!d.sawKoiGate, sawTurtleMeadow: !!d.sawTurtleMeadow,
        sawWreck: !!d.sawWreck, wreckHinted: !!d.wreckHinted, wreckChestReady: false,
        lanternRumor: !!d.lanternRumor, wreckLamp: !!d.wreckLamp, sessionChest: false, sessionNicoLantern: false, sessionSable: false, sableCd: 0, sableHinted: false,
        inReef: false, inWreck: false, zoneTitle: null,
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
        dayGuest: typeof d.dayGuest === "string" ? d.dayGuest : "",
        dayWant: d.dayWant == null ? -1 : (d.dayWant | 0),
        dayAt: d.dayAt | 0,
        sessionDayGuest: !!d.sessionDayGuest,
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
        lastPlayed: (d.lastPlayed > 0 ? +d.lastPlayed : 0),
        skin: normalizeSkin(d.skin),
      });
      ensureUnlockFlags();
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
  function savePayload() {
    // loop 151 — one blob for persist, download, and clipboard.
    // game + v mark an Aqua Bay file; old saves without them still load.
    ensureUnlockFlags();
    state.peakMoney = Math.max(state.peakMoney | 0, state.money | 0);
    return {
      game: "aqua-bay",
      v: 1,
      lastPlayed: Date.now(),
      money: state.money, speedLv: state.speedLv, bagLv: state.bagLv, catchLv: state.catchLv,
      upgrades: {
        speedLv: state.speedLv | 0,
        bagLv: state.bagLv | 0,
        catchLv: state.catchLv | 0,
        hiredCashier: !!state.hiredCashier,
        diverLv: state.diverLv | 0,
      },
      unlocked: padSpeciesFlags(state.unlocked), stock: padSpeciesNums(state.stock), bag: state.bag,
      tutorial: state.tutorial, registerCash: state.registerCash,
      lifetimeCatches: state.lifetimeCatches, muted: state.muted,
      didFirstCollect: state.didFirstCollect, didFirstUnlock: state.didFirstUnlock,
      hiredCashier: state.hiredCashier, diverLv: state.diverLv | 0,
      sawReef: state.sawReef, sawGoldGarden: state.sawGoldGarden,
      sawKoiGate: state.sawKoiGate, sawTurtleMeadow: state.sawTurtleMeadow,
      sawWreck: !!state.sawWreck, wreckHinted: !!state.wreckHinted,
      lanternRumor: !!state.lanternRumor,
      wreckLamp: !!state.wreckLamp,
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
      dayGuest: state.dayGuest || "",
      dayWant: state.dayWant == null ? -1 : (state.dayWant | 0),
      dayAt: state.dayAt | 0,
      sessionDayGuest: !!state.sessionDayGuest,
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
    };
  }
  function persist() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(savePayload()));
      state.hasSave = true;
    } catch (e) {}
  }
  function isAquaBaySave(d) {
    if (!d || typeof d !== "object") return false;
    if (d.game != null && d.game !== "aqua-bay") return false;
    if (d.money == null && !Array.isArray(d.unlocked)) return false;
    return true;
  }
  let saveFileInput = null;
  function exportSave() {
    persist();
    let text = "";
    try { text = localStorage.getItem(SAVE_KEY) || ""; } catch (e) { text = ""; }
    if (!text) {
      toast("Nothing to export yet", "#ff8a7a", 2.2);
      return;
    }
    try {
      const blob = new Blob([text], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "aqua-bay-save.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    } catch (e) {}
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
    } catch (e) {}
    toast("Save exported — keep the JSON file", "#9ef0ff", 3.2);
  }
  function ensureSaveFileInput() {
    if (saveFileInput) return saveFileInput;
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "application/json,.json,text/plain";
    inp.setAttribute("aria-label", "Import Aqua Bay save");
    inp.style.position = "fixed";
    inp.style.left = "-9999px";
    inp.addEventListener("change", function () {
      const f = inp.files && inp.files[0];
      inp.value = "";
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function () { applyImportedSave(String(reader.result || "")); };
      reader.readAsText(f);
    });
    document.body.appendChild(inp);
    saveFileInput = inp;
    return inp;
  }
  function pickImportSave() {
    ensureSaveFileInput().click();
  }
  function applyImportedSave(raw) {
    try {
      const d = JSON.parse(raw);
      if (!isAquaBaySave(d)) {
        toast("Not an Aqua Bay save", "#ff8a7a", 2.4);
        return false;
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
      if (!loadSave()) {
        toast("Could not load that save", "#ff8a7a", 2.4);
        return false;
      }
      toast("Save imported — Continue when ready", "#9ef0ff", 3.0);
      if (state.mode === "play" || state.mode === "pause" || state.mode === "help") state.mode = "title";
      return true;
    } catch (e) {
      toast("Could not read that file", "#ff8a7a", 2.4);
      return false;
    }
  }
  function resetSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    const keepMute = state.muted;
    const keepSkin = normalizeSkin(state.skin);
    Object.assign(state, defaultSave(), { mode: "title", scene: "shop", fade: 0, coins: [], toasts: [],
      muted: keepMute, skin: keepSkin, hitStop: 0, camPunch: 0, bagPunch: 1, moneyPunch: 1, displayMoney: 0,
      moneyRollT: 0, audioUnlocked: state.audioUnlocked,
      diveCatches: 0, bagBonus: 1, flash: 0, dustTimer: 0,
      splash: null, tankReveal: null, unlockBanner: null, comboPop: null, welcomeBack: null, shopSwimmers: [],
      didFirstCollect: false, didFirstUnlock: false, hiredCashier: false, cashierAcc: 0,
      diverLv: 0, diverAcc: 0, lastPlayed: 0,
      sawReef: false, sawGoldGarden: false, sawKoiGate: false, sawTurtleMeadow: false,
      sawWreck: false, wreckHinted: false, wreckChestReady: false, lanternRumor: false, wreckLamp: false, sessionChest: false, sessionNicoLantern: false, sessionSable: false, sableCd: 0, sableHinted: false,
      inReef: false, inWreck: false, zoneTitle: null, expedition: false, expeditionTime: 0, peakMoney: 0, vipCooldown: 0,
      caughtCount: padSpeciesNums([]), bookOpen: null,
      decor: [false, false, false], expeditionCount: 0, nightExpedition: false, decorOpen: false,
      missionStep: 0, missionDone: false, caughtRare: false,
      bagRare: [], stockRare: padSpeciesNums([]),
      sessionDay: 1, sawDeepZone: 0,
      dayGuest: "", dayWant: -1, dayAt: 0, sessionDayGuest: false,
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
      playClock: 0, tillSlip: null, escapeBar: null, escapeGate: 0,
      diveForTank: null, diveForAway: 0, diveForHunt: null });
    ensureUnlockFlags();
    state.hasSave = false;
    player.x = 880; player.y = 920; player.vx = 0; player.vy = 0; player.catchProg = 0; player.target = null; player.goto = null; player.route = null; player.blockT = 0; player.walkPhase = 0; player.lean = 0; player.faceS = 1; player.pitch = 0; player.pendingAct = null; player.unlockConfirm = null; player.catchLatch = false; player.scoopLock = null; player.scoopTap = false; player.tillDwell = 0; player.holdGrace = 0; player.surfaceIntent = false;
    cam.x = 880; cam.y = 1000; cam.z = stageZoom(); cam.rail = 28;
    customers.length = 0; crew.length = 0; oceanFish.length = 0; particles.length = 0; pops.length = 0; bubbles.length = 0;
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
  function viewportSize() {
    const vis = visualCssSize();
    return { w: vis.w, h: vis.h };
  }
  // Visible CSS box. innerHeight stays the large layout (844) while
  // Safari/Chrome chrome shrinks visualViewport.height (~655). Always
  // prefer the visual viewport — never the layout / 100svh / innerHeight.
  function visualCssSize() {
    const vv = window.visualViewport;
    const layoutW = window.innerWidth || 1;
    const layoutH = window.innerHeight || 1;
    if (vv && vv.height > 0 && vv.width > 0) {
      return {
        w: Math.max(1, vv.width),
        h: Math.max(1, vv.height),
        left: vv.offsetLeft || 0,
        top: vv.offsetTop || 0,
        layoutW: layoutW,
        layoutH: layoutH,
      };
    }
    return { w: layoutW, h: layoutH, left: 0, top: 0, layoutW: layoutW, layoutH: layoutH };
  }
  function wrapSafeInset(side) {
    const wrap = document.getElementById("wrap");
    if (!wrap) return 0;
    const pad = parseFloat(getComputedStyle(wrap)["padding" + side]) || 0;
    return pad;
  }
  function isiOSPhone() {
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (!nav) return false;
    const ua = String(nav.userAgent || "");
    return /iPhone|iPad|iPod/.test(ua) || !!nav.standalone;
  }
  // CSS px of the notch / home indicator that still overlap the canvas.
  // #wrap may already have env() padding — only count what still covers
  // the bitmap. iOS Safari often reports env() as 0 with viewport-fit=cover,
  // so a flush canvas on iPhone still reserves the status / home strips.
  function safeOverlapCss(side) {
    const vis = visualCssSize();
    const rect = canvas.getBoundingClientRect();
    const env = wrapSafeInset(side);
    let already = 0;
    if (side === "Top") already = Math.max(0, rect.top - vis.top);
    else if (side === "Bottom") already = Math.max(0, (vis.top + vis.h) - (rect.top + rect.height));
    else if (side === "Left") already = Math.max(0, rect.left - vis.left);
    else if (side === "Right") already = Math.max(0, (vis.left + vis.w) - (rect.left + rect.width));
    const remain = Math.max(0, env - already);
    const flush = already < 2;
    if (portraitStage() && flush) {
      // viewport-fit=cover often reports env() as 0 on Chrome and iOS.
      // A notch / status bar is ~44–54 CSS px — 12px comfort is not enough.
      if (side === "Top") return remain >= 24 ? remain : 50;
      if (side === "Bottom" && remain < 8) return isiOSPhone() ? 28 : remain;
    }
    return remain;
  }
  function hudSafeTop() {
    if (!portraitStage()) return 12;
    return phoneCss(safeOverlapCss("Top") + 12);
  }
  // Stage Y of the last pixel that is actually on-screen in the visual
  // viewport, above the home indicator. innerHeight / canvas CSS may
  // still be 844 while visualViewport.height is 655 — DIVE / SURFACE
  // must use that visible floor in BOTH dock and plaza cameras.
  function visibleStageBottom() {
    if (!portraitStage()) return H;
    const vis = visualCssSize();
    const rect = canvas.getBoundingClientRect();
    const cssH = Math.max(1, rect.height || vis.layoutH || vis.h);
    const visibleCss = clamp((vis.top + vis.h) - rect.top, 1, cssH);
    const lip = phoneCss(Math.max(12, safeOverlapCss("Bottom") + 12));
    const floor = Math.round(H * (visibleCss / cssH)) - lip;
    return Math.max(phoneCss(120), Math.min(H - phoneCss(8), floor));
  }
  function actionFloor() {
    return portraitStage() ? visibleStageBottom() : H;
  }
  function desktopStage() {
    // One live page: a 1280×720 (or any wide landscape) window keeps the
    // 16:9 framed stage and dense HUD. Coarse pointers on a laptop must
    // not flip the whole UI into phone chrome.
    const vp = viewportSize();
    return vp.w >= 880 && vp.w >= vp.h * 0.92;
  }
  function phonePortrait() {
    const vp = viewportSize();
    return vp.h > vp.w * 1.05;
  }
  function fillPhoneStage() {
    if (desktopStage()) return false;
    const vp = viewportSize();
    return isCoarsePointer() || phonePortrait() || vp.w < 520;
  }
  function portraitStage() {
    return !desktopStage() && phonePortrait();
  }
  function compactHud() {
    if (desktopStage()) return false;
    return isCoarsePointer() || displayScale() < 0.62 || phonePortrait();
  }
  function thumbCopy() {
    return compactHud() || portraitStage();
  }
  function cssToStage(cssPx, minC, maxC) {
    const vp = viewportSize();
    const cssW = fillPhoneStage() ? vp.w : Math.max(8, (canvas.getBoundingClientRect().width || vp.w));
    const s = Math.max(0.2, cssW / W);
    return clamp(Math.round(cssPx / s), minC, maxC);
  }
  // Portrait HUD in real CSS pixels. 720-era stage clamps (max 70) collapse
  // to ~21px on a 2769-tall canvas and make DIVE / SHOP untappable.
  function phoneCss(cssPx) {
    const vp = viewportSize();
    const cssW = Math.max(1, fillPhoneStage() ? vp.w : (canvas.getBoundingClientRect().width || vp.w));
    return Math.max(8, Math.round(cssPx * W / cssW));
  }
  function thumbCanvas(cssPx, minC, maxC) {
    if (portraitStage()) return cssToStage(cssPx, minC, maxC);
    const s = Math.max(0.22, displayScale());
    return clamp(Math.round(cssPx / s), minC, maxC);
  }
  function stageZoom() {
    if (!portraitStage() || H <= DESKTOP_H + 8) return 1;
    // Keep a ~860px world window so plaza/dock stay two rooms, but the
    // playfield is still the wide part of the phone.
    return H / 860;
  }
  function titleWaterY() {
    if (!portraitStage() || H <= DESKTOP_H + 20) return H * 0.50;
    // Compact harbor band at the bottom — not a 1300px water column with
    // a sliver dock. Town sits on a short water strip above the pier.
    return H - Math.round(Math.min(520, H * 0.28));
  }
  function menuOriginY() {
    if (H <= DESKTOP_H + 20) return 0;
    if (portraitStage()) return 0;
    const block = 620;
    return clamp(Math.round((H - block) * 0.36), 48, Math.max(48, H - block - 64));
  }
  function titleMenuLayout() {
    const desk = {
      shift: 0,
      titleX: W / 2 - 250, titleY: 40, titleW: 500, titleH: 156,
      pickerY: 252, cardW: 168, cardH: 176, cardGap: 16,
      continueY: 452, continueH: 56, continueW: 300,
      captionY: 528,
      newY: 548, newH: 48, newW: 300,
      playY: 460, playH: 56,
      stampY: 178,
      titleFont: 28, subFont: 14, tagFont: 15, stampFont: 13,
      nameFont: 16, blurbFont: 11, btnFont: 18, whoFont: 14,
      whoY: 232,
      portrait: false,
    };
    if (!portraitStage() || H <= DESKTOP_H + 20) return desk;
    const pad = Math.max(Math.round(H * 0.024), hudSafeTop());
    // C94 — 390-wide title stack. Fractional 0.26 / 0.50 of a short card
    // puts "Aqua Bay Pier Mart" and "Dive. Stock. Sell." on one band
    // (~3 CSS px). 24-stage picker floors read as ~6 CSS px on 390.
    const titleFont = phoneCss(22);
    const subFont = phoneCss(16);
    const tagFont = phoneCss(14);
    const stampFont = phoneCss(12);
    const whoFontPx = phoneCss(16);
    const nameFont = phoneCss(16);
    const blurbFont = phoneCss(13);
    const btnFont = phoneCss(18);
    const lineGap = phoneCss(10);
    const titlePadT = phoneCss(18);
    const titlePadB = phoneCss(14);
    const cardGap = 20;
    const cardW = Math.min(300, Math.round((W - 80 - cardGap * 2) / 3));
    // Natural picker cards (near desktop 168×176). Extra phone height
    // goes to padding + fat buttons, not 2.5:1 noodle slots.
    const cardH = Math.round(cardW * 1.12);
    const btnH = Math.max(phoneCss(52), Math.round(H * 0.055));
    const newH = Math.max(phoneCss(48), Math.round(H * 0.048));
    const gap = Math.round(H * 0.016);
    const capH = Math.max(28, Math.round(H * 0.018));
    let y = pad;
    const titleY = y;
    const titleBase = titleY + titlePadT + titleFont;
    const subBase = titleBase + Math.round(titleFont * 0.28) + lineGap + subFont;
    const tagY = subBase + Math.round(subFont * 0.28) + lineGap + tagFont;
    const stampY = tagY + Math.round(tagFont * 0.28) + lineGap + stampFont;
    const titleH = Math.max(phoneCss(128), (stampY + titlePadB) - titleY);
    y += titleH + gap;
    const whoY = y + whoFontPx;
    y = whoY + Math.round(whoFontPx * 0.35) + Math.max(10, Math.round(gap * 0.6));
    const pickerY = y;
    y = pickerY + cardH + Math.round(gap * 1.6);
    const continueY = y;
    y += btnH + Math.round(H * 0.012);
    const captionY = y + Math.round(capH * 0.55);
    y += capH + Math.round(H * 0.014);
    let continueY0 = continueY, captionY0 = captionY, newY = y;
    const titleW = Math.min(W - 56, 1000);
    const btnW = Math.min(W - 140, 620);
    // Sit fat buttons nearer the harbor / thumb. Do not stretch the cards.
    const harborTop = titleWaterY() - Math.round(H * 0.02);
    const slack = harborTop - (newY + newH) - pad;
    if (slack > 80) {
      const shift = Math.round(slack * 0.55);
      continueY0 += shift;
      captionY0 += shift;
      newY += shift;
    }
    return {
      shift: 0,
      titleX: W / 2 - titleW / 2, titleY, titleW, titleH,
      titleBase, subBase, tagY,
      pickerY, cardW, cardH, cardGap,
      continueY: continueY0, continueH: btnH, continueW: btnW,
      captionY: captionY0,
      newY, newH, newW: btnW,
      playY: continueY0, playH: btnH,
      stampY,
      titleFont, subFont, tagFont, stampFont,
      nameFont, blurbFont, btnFont,
      whoFont: whoFontPx,
      whoY,
      portrait: true,
    };
  }
  function topCtrlBoxes() {
    if (portraitStage()) {
      const topBtn = phoneCss(40);
      const y = hudSafeTop();
      const pauseB = hudBox(W - 12 - topBtn, y, topBtn, topBtn);
      const muteB = hudBox(pauseB.x - 8 - topBtn, y, topBtn, topBtn);
      return { topBtn, pauseB, muteB };
    }
    const topBtn = compactHud() ? thumbCanvas(44, 54, 84) : 54;
    const pauseB = hudBox(W - 16 - topBtn, 14, topBtn, Math.max(40, topBtn - 8));
    const muteB = hudBox(pauseB.x - 8 - topBtn, 14, topBtn, pauseB.h);
    return { topBtn, pauseB, muteB };
  }
  function topHudFloor() {
    let floor = 14 + 52 + 8;
    if (portraitStage()) floor = hudSafeTop() + phoneCss(48) + 8;
    if (missionVisible() || sessionChipVisible()) floor += sessionChipMetrics().h + 8;
    if (zoneChipVisible()) floor += sessionChipMetrics().h + 8;
    const rb = ribbonLayout();
    // C120 — a cone ribbon parked low (off the TODAY + zone
    // stack) must not stretch this floor over the grove.
    // C121 does not put that low ribbon back over prey —
    // it only lifts it off the SURFACE thumb lip.
    // loop 120 hunt hud not over prey.
    // loop 121 surface ribbon clear of SURFACE.
    // C122 does not move this floor — the leftover is the
    // SURFACE fade taxi from the bay into the tank room.
    // loop 122 surface stays on the dock.
    if (rb && !ribbonIsLow(rb)) floor = Math.max(floor, rb.y + rb.h + 8);
    return floor;
  }
  // Resize / visualViewport events must not mutate the live transform or
  // backing store mid-draw. That reset the world blit to screen space and
  // stacked a leftover pier / HUD strip across the top while the camera
  // eased (C47) to the till.
  let frameDrawing = false;
  let pendingBacking = null;
  function layoutStage() {
    const wrap = document.getElementById("wrap");
    if (!wrap) return;
    const vis = visualCssSize();
    const root = document.documentElement;
    // Pin the page to the visual viewport so 100svh / innerHeight (844)
    // cannot keep the canvas taller than the URL-bar window (655).
    if (root) {
      root.style.width = vis.w + "px";
      root.style.height = vis.h + "px";
    }
    if (document.body) {
      document.body.style.width = vis.w + "px";
      document.body.style.height = vis.h + "px";
    }
    wrap.style.width = vis.w + "px";
    wrap.style.height = vis.h + "px";
    wrap.style.maxWidth = vis.w + "px";
    wrap.style.maxHeight = vis.h + "px";
    wrap.style.left = vis.left + "px";
    wrap.style.top = vis.top + "px";
    const padL = wrapSafeInset("Left");
    const padR = wrapSafeInset("Right");
    const padT = wrapSafeInset("Top");
    const padB = wrapSafeInset("Bottom");
    const cw = Math.max(1, vis.w - padL - padR);
    const ch = Math.max(1, vis.h - padT - padB);
    let cssW, cssH;
    if (fillPhoneStage() && phonePortrait()) {
      // Portrait phone: canvas IS the visual viewport (not 100dvh / 844
      // with DIVE under the URL bar). Square pixels. When the chrome
      // hides or shows, visualViewport resize/scroll re-runs this.
      H = Math.max(960, Math.round(W * ch / Math.max(1, cw)));
      cssW = Math.max(1, Math.round(cw));
      cssH = Math.max(1, Math.round(ch));
    } else {
      H = DESKTOP_H;
      if (fillPhoneStage()) {
        cssW = Math.max(1, Math.round(cw));
        cssH = Math.max(1, Math.round(ch));
      } else {
        const scale = Math.min(cw / W, ch / H);
        cssW = Math.max(1, Math.round(W * scale));
        cssH = Math.max(1, Math.round(cssW * H / W));
        if (cssH > ch) {
          cssH = Math.max(1, Math.round(H * scale));
          cssW = Math.max(1, Math.round(cssH * W / H));
        }
      }
    }
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    const bw = Math.max(1, Math.round(cssW * dpr));
    const bh = Math.max(1, Math.round(cssH * dpr));
    pendingBacking = { bw: bw, bh: bh, sx: bw / W, sy: bh / H };
    if (!frameDrawing) applyCanvasBacking();
  }
  function applyCanvasBacking() {
    if (!pendingBacking) return;
    const bw = pendingBacking.bw, bh = pendingBacking.bh;
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    canvasSx = pendingBacking.sx;
    canvasSy = pendingBacking.sy;
    canvasDpr = canvasSx;
    pendingBacking = null;
  }
  function unwindCanvas() {
    // Extra restore is a no-op. Pop a leaked save so a leftover evenodd
    // water clip cannot punch holes in the next full-canvas clear.
    for (let i = 0; i < 24; i++) ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    try { ctx.filter = "none"; } catch (err) { /* old canvas */ }
    ctx.shadowBlur = 0;
    ctx.shadowColor = "rgba(0,0,0,0)";
    ctx.beginPath();
  }
  function beginCanvas() {
    unwindCanvas();
    // Identity clear covers the backing store. fillRect(0,0,W,H) after a
    // DPR setTransform can miss a device-pixel strip (rounding), which
    // stacked previous-frame wood / water / HUD while cam.y eased.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(canvasSx, 0, 0, canvasSy, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";
  }
  function beginHudSpace() {
    // HUD stays screen-pinned (C47). Reset so a leaked world translate
    // cannot double-blit the upgrade tray or price cards at cam offsets.
    unwindCanvas();
    ctx.setTransform(canvasSx, 0, 0, canvasSy, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";
  }
  function normAng(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }
  function bagMax() { return BAG_STEPS[clamp(state.bagLv, 0, BAG_STEPS.length - 1)]; }
  const DIVE_WALK_SPEED = 480;
  const DIVE_WALK_ACCEL = 3200;
  const DIVE_FOR_AWAY = 2.8;
  function diveWalkQueued() {
    return !!(player.pendingAct && player.pendingAct.kind === "dive" && player.goto);
  }
  function walkSpeed() {
    // First-session dock↔tank is the dead stretch. A small free bump until Speed is bought.
    const firstBump = (state.speedLv === 0 && !state.missionDone) ? 24 : 0;
    const base = 232 + state.speedLv * 38 + firstBump;
    // C86 — plaza DIVE from the tank row used to stroll ~10s. Dash only
    // the queued walk-to-pad; planted WASD / tap-to-walk stay at `base`.
    if (diveWalkQueued()) return Math.max(base, DIVE_WALK_SPEED);
    return base;
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
    return x > 70 && x < 1700 && y > 70 && y < 900;
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
    c.sunglasses = !!look.sunglasses;
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
    if (portraitStage()) return actionBtnBox();
    const s = worldToScreen(880, 1008);
    const w = compactHud() ? thumbCanvas(132, 160, 280) : 132;
    const h = compactHud() ? thumbCanvas(52, 56, 88) : 36;
    const floor = actionFloor();
    return dodgeUpgradeTray(hudBox(clamp(s.x - w / 2, 16, W - 16 - w), clamp(s.y - h / 2, 74, floor - 18 - h), w, h));
  }
  function walkToDock() {
    player.pendingAct = null;
    setWalkDest(dockWalkPoint());
    // C67 — do not pin the camera on the till while the walker heads back
    // to the pier. A 1.9s hold made the auto-walk look like a freeze, and
    // the next Space / → DIVE / ArrowRight then cancelled a dead straight
    // line into the mid-left wood pocket.
    if ((state.camTillHold || 0) > 0.28) state.camTillHold = 0.28;
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
    const routeEnd = player.route && player.route.length ? player.route[player.route.length - 1] : player.goto;
    if (isDockDest(routeEnd) || isDockDest(player.goto)) return false;
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
    const w = compactHud() ? thumbCanvas(148, 176, 300) : 148;
    const h = compactHud() ? thumbCanvas(52, 56, 88) : 36;
    const floor = actionFloor();
    return dodgeUpgradeTray(hudBox(clamp(s.x - w / 2, 16, W - 16 - w), clamp(s.y - h / 2, topHudFloor(), floor - 18 - h), w, h));
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
  function diveChipBox() { return { x: 796, y: 988, w: 172, h: 72 }; }
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
  function atWaterline() {
    return state.scene === "ocean" && player.y < 210;
  }
  function haulReadyToSurface() {
    if (bagIsFull()) return true;
    if (player.surfaceIntent || atWaterline()) return true;
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
    return base + tutorialGrace() * 36 + scoopEdgeGrace() + (isChestTarget(f) ? 48 : 0);
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
    const top = portraitStage() ? hudSafeTop() : p;
    const bot = portraitStage() ? visibleStageBottom() : H;
    const maxY = bot - Math.max(p, 4) - h;
    return {
      x: clamp(x, p, W - p - w),
      y: clamp(y, top, Math.max(top, maxY)),
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
    ensureUnlockFlags();
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
  function boatChipLegal() {
    // loop 127 DIVE works on the dock
    // BOAT chip owns actionBtnBox only while standing at the hull
    // with expeditions unlocked. DIVE uses that same box otherwise.
    return state.scene === "shop" && nearBoat() && expeditionUnlocked();
  }
  function clickOnBoat() {
    // loop 125 one shore no water-walk boat tap only
    // loop 127 DIVE works on the dock
    // Hull, or the on-screen BOAT chip — never the DIVE chip
    // that shares actionBtnBox().
    const sx = mouse.pressX, sy = mouse.pressY;
    if (boatChipLegal()) {
      const b = actionBtnBox();
      if (sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h) return true;
    }
    const w = screenToWorld(sx, sy);
    return Math.hypot(w.x - BOAT.x, w.y - BOAT.y) < 70;
  }
  function clickOnDiveHud() {
    // loop 127 DIVE works on the dock
    // Thumb DIVE (actionBtnBox) when that chip is actually DIVE.
    if (!diveChipLegal() || boatChipLegal()) return false;
    const b = actionBtnBox();
    const sx = mouse.pressX, sy = mouse.pressY;
    return sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h;
  }
  function boughtAnUpgrade() {
    return (state.speedLv | 0) > 0 || (state.bagLv | 0) > 0 || (state.catchLv | 0) > 0 || !!state.hiredCashier;
  }
  function shopBarsReady() {
    return state.scene === "shop" && !inDiveZone() && (state.tutorial >= 5 || state.money >= 25);
  }
  function railBarsReady() {
    if (portraitStage()) {
      return phoneShopOpen && state.mode === "play";
    }
    return shopBarsReady();
  }
  function speciesRailReady() {
    // loop 152 — desktop species cards wait until the first stock /
    // collect. Phone BOOK still opens the same tray.
    if (portraitStage()) return true;
    return shopBarsReady() || !!state.didFirstStock || !!state.didFirstCollect || (state.tutorial | 0) >= 4;
  }
  function syncChrome() {
    const root = document.documentElement;
    if (!root) return;
    root.classList.toggle("ab-playing", state.mode === "play");
  }
  function diveWalkLegal() {
    return state.mode === "play" && state.scene === "shop" && state.surfaceLock <= 0 && !bagHasStockable() && !cashNeedsCollect();
  }
  function diveActionLegal() {
    return diveWalkLegal() && (inDiveZone() || nearDivePad());
  }
  function onShopDock() {
    // loop 127 DIVE works on the dock
    // Pier boards plus the DIVE pad. C126 continuous camera
    // sits at cam.y~900–1000 here, so plazaCameraReady is false.
    if (state.scene !== "shop" || !player) return false;
    const dock = shopDockWalk();
    return player.y > 820 &&
      player.x >= dock.x - 48 && player.x <= dock.x + dock.w + 48 &&
      player.y <= dock.y + dock.h + 24;
  }
  function diveChipLegal() {
    // loop 127 DIVE works on the dock
    // Thumb DIVE is always legal on shop when they can walk-dive
    // (empty bag, no cash waiting, surfaceLock 0). Do not require
    // plazaCameraReady — C126's one-shore camera sits at cam.y~1000
    // on the pier, so that plaza gate hid the chip a step off
    // nearDivePad while the pad was still on screen (dockOffScreen
    // false). C112 / C115 — hunt / DIVE FOR still keep the chip.
    if (diveWalkLegal()) return true;
    return diveForHuntIndex() >= 0 || diveForCueLegal();
  }
  function surfaceActionLegal() {
    return state.mode === "play" && canSurfaceNow();
  }
  function actionPromptVisible() {
    return diveActionLegal() || surfaceActionLegal();
  }
  function actionBtnSize() {
    if (portraitStage()) {
      return {
        w: phoneCss(120),
        h: phoneCss(48),
        pad: actionChipInset(),
      };
    }
    const compact = compactHud();
    return {
      w: compact ? thumbCanvas(200, 320, 620) : 340,
      h: compact ? thumbCanvas(72, 88, 180) : 52,
      pad: compact ? 18 : 18,
    };
  }
  // A few CSS px of right + bottom so the rounded DIVE / SURFACE chip
  // is never flush-cut by the viewport. Same overlay in dock and plaza
  // (cam.y ≤ 520). Does not restack visibleStageBottom / cameras.
  function actionChipInset() {
    if (!portraitStage()) return 18;
    // Right safe-area only. visibleStageBottom already owns the home lip.
    const edgeCss = Math.max(18, safeOverlapCss("Right") + 12);
    return phoneCss(edgeCss);
  }
  function actionBtnBox() {
    const compact = compactHud();
    const sz = actionBtnSize();
    const w = sz.w, h = sz.h;
    let x = W / 2 - w / 2;
    let y = H - sz.pad - h;
    if (portraitStage()) {
      const floor = visibleStageBottom();
      const inset = actionChipInset();
      x = W - inset - w;
      y = floor - inset - h;
      if (phoneShopOpen) {
        const panel = phoneShopPanelBox();
        x = Math.min(x, panel.x - 10 - w);
      }
      x = clamp(x, 12, W - w - inset);
      y = clamp(y, hudSafeTop() + phoneCss(56), floor - h - inset);
      const box = hudBox(x, y, w, h, inset);
      // Keep the full rounded chip inside the visible stage — never
      // snap flush to the right or bottom lip (plaza used to clip).
      if (box.x + box.w > W - inset) box.x = W - inset - box.w;
      if (box.y + box.h > floor - inset) box.y = floor - inset - box.h;
      if (box.y < hudSafeTop()) box.y = hudSafeTop();
      if (box.x < 12) box.x = 12;
      return box;
    }
    if (compact && state.scene === "shop" && shopBarsReady()) {
      x = clamp(W - 18 - w, 16, W - 18 - w);
    }
    return dodgeUpgradeTray(hudBox(x, y, w, h));
  }
  const UPGRADE_SLOTS = 5; // loop 144 — Speed, Bag, Catch, Cashier, Diver
  function upgradeBarBox() {
    if (portraitStage()) {
      const strip = speciesStripLayout();
      const cw = strip.cw;
      const ch = phoneCss(56);
      const x = strip.x;
      const y = strip.y + strip.h + 10;
      const h = UPGRADE_SLOTS * (ch + 6) + 8;
      return Object.assign(hudBox(x, y, cw, h), { cw, ch, compact: false, phoneRail: true, stacked: true });
    }
    const compact = compactHud();
    const cw = compact ? thumbCanvas(148, 168, 260) : 160;
    const ch = compact ? thumbCanvas(56, 72, 110) : 66;
    const rows = compact ? Math.ceil(UPGRADE_SLOTS / 2) : 1;
    const w = compact ? cw * 2 + 24 : 8 + UPGRADE_SLOTS * (cw + 8);
    const h = compact ? ch * rows + 8 * rows + 8 : 82;
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
    if (portraitStage() && !phoneShopOpen) return box;
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
    // Cheapest locked bowl, so lantern ($90) can unlock after the wreck
    // without waiting for Whale Shark. Depth bands still use nextLockedSafe.
    let best = -1, bestCost = 1e15;
    for (let i = 0; i < SPECIES.length; i++) {
      if (speciesUnlocked(i)) continue;
      if (isWreckSpecies(i) && !lanternUnlockReady()) continue;
      const c = SPECIES[i].unlock | 0;
      if (c < bestCost || (c === bestCost && (best < 0 || i < best))) {
        bestCost = c;
        best = i;
      }
    }
    return best;
  }
  function inReefZone(x, y) { return y > REEF_Y || x > REEF_X; }
  function nextGoal() {
    // loop 152 — hide "Next Speed $40" until the first dollar is real.
    if (!state.didFirstCollect && !state.didFirstSale) return null;
    const opts = [];
    if (state.speedLv < SPEED_COST.length) opts.push({ name: "Speed", cost: SPEED_COST[state.speedLv] });
    if (state.bagLv < BAG_COST.length) opts.push({ name: "Bag", cost: BAG_COST[state.bagLv] });
    if (state.catchLv < CATCH_COST.length) opts.push({ name: "Catch", cost: CATCH_COST[state.catchLv] });
    const nl = nextLockedTank();
    if (nl >= 0) opts.push({ name: SPECIES[nl].name, cost: SPECIES[nl].unlock });
    if (!state.hiredCashier) opts.push({ name: "Cashier", cost: CASHIER_COST });
    if (state.diverLv < DIVER_MAX) opts.push({ name: "Diver", cost: DIVER_COST[state.diverLv] });
    opts.sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
    return opts[0] || null;
  }
  function firstAffordableUp() {
    const items = [
      { id: "speed", cost: state.speedLv < SPEED_COST.length ? SPEED_COST[state.speedLv] : 1e9, maxed: state.speedLv >= SPEED_COST.length },
      { id: "bag", cost: state.bagLv < BAG_COST.length ? BAG_COST[state.bagLv] : 1e9, maxed: state.bagLv >= BAG_COST.length },
      { id: "catch", cost: state.catchLv < CATCH_COST.length ? CATCH_COST[state.catchLv] : 1e9, maxed: state.catchLv >= CATCH_COST.length },
      { id: "cashier", cost: state.hiredCashier ? 1e9 : CASHIER_COST, maxed: state.hiredCashier },
      { id: "diver", cost: state.diverLv < DIVER_MAX ? DIVER_COST[state.diverLv] : 1e9, maxed: state.diverLv >= DIVER_MAX },
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
  // FIRST SESSION / TODAY / depth pills. Portrait used 12×30 stage px
  // (~4–9 CSS on a 390-wide / 2770-tall canvas) — illegible. Size with
  // phoneCss so they stay the same HUD chips, just readable.
  function sessionChipMetrics() {
    if (portraitStage()) {
      return { x: 12, h: phoneCss(28), font: phoneCss(13), pad: phoneCss(12), maxW: phoneCss(220), gap: phoneCss(8) };
    }
    return { x: 16, h: 30, font: 12, pad: 12, maxW: 360, gap: 6 };
  }
  function sessionChipTop() {
    // C118 — plaza TODAY sits under money / BAG. Do not park it
    // under the DIVE-to-catch ribbon (that pushed the plate onto
    // topHudFloor; screenBoxAlpha then ate it — no TODAY chip
    // after TAP TO UNLOCK). Unlock toast / ribbon park below
    // this slot. C119 does not move TODAY — the leftover is the
    // ocean zone plate sharing the ribbon-park slot.
    // C120 does not move TODAY — the leftover is the cone
    // ribbon as a third chip over the first seahorse ! marks.
    // C121 does not move TODAY — the leftover is that low
    // catch ribbon on the same lip as wood ↑ SURFACE.
    // C122 does not move TODAY — the leftover is the
    // SURFACE dock taxi into the bowls.
    // loop 118 plaza today after unlock.
    // loop 119 ocean zone plate readable.
    // loop 120 hunt hud not over prey.
    // loop 121 surface ribbon clear of SURFACE.
    // loop 122 surface stays on the dock.
    if (portraitStage()) return hudSafeTop() + phoneCss(48) + 8;
    return 74;
  }
  function sessionChipPaintAlpha() {
    // HUD-pinned FIRST SESSION / TODAY. Shop screenBoxAlpha uses
    // topHudFloor, which includes this chip, so plaza alpha was 0
    // whenever a ribbon or unlock banner was live. Ocean already
    // painted (topSafe 0). Do not hide TODAY.
    // loop 118 plaza today after unlock.
    if (!(missionVisible() || sessionChipVisible())) return 0;
    return 1;
  }
  function todayChipBox() {
    if (!(missionVisible() || sessionChipVisible())) return null;
    const m = sessionChipMetrics();
    return { x: m.x, y: sessionChipTop(), w: m.maxW, h: m.h };
  }
  function unlockBannerBox() {
    if (!state.unlockBanner) return null;
    const bw = Math.min(520, W - 280);
    const bh = portraitStage() ? phoneCss(36) : 44;
    const today = todayChipBox();
    const gap = portraitStage() ? phoneCss(8) : 8;
    let y = portraitStage() ? hudSafeTop() + phoneCss(48) + gap : 56;
    if (today) y = today.y + today.h + gap;
    // Leave a ribbon-sized slot under TODAY so SEAHORSE UNLOCKED
    // cannot cover Stock Seahorse. loop 118 plaza today after unlock.
    const ribbonSlot = portraitStage() ? phoneCss(28) + gap : 32 + 8;
    y += ribbonSlot;
    return { x: W / 2 - bw / 2, y: y, w: bw, h: bh };
  }
  function todayChipClear() {
    // Visible TODAY is not covered by the unlock banner.
    const today = todayChipBox();
    if (!today || sessionChipPaintAlpha() < 1) return false;
    const banner = unlockBannerBox();
    if (!banner) return true;
    return today.y + today.h <= banner.y - 2;
  }
  function zoneChipVisible() {
    return state.scene === "ocean" && state.mode === "play";
  }
  function zoneChipLabel() {
    const z = zoneAtDepth(player.y, player.x);
    const meters = depthMeters(player.y);
    return meters + "m  ·  " + z.name;
  }
  function zoneChipTop() {
    // C119 — depth / zone sits under TODAY (or FIRST SESSION).
    // Do not share the C118 ribbon-park slot — that covered
    // 70m · Seahorse groves with the cone / catch ribbon.
    // C120 does not move this plate — only the cone ribbon.
    // C121 does not move this plate — only the catch ribbon
    // off the SURFACE thumb lip.
    // C122 does not move this plate — only the SURFACE
    // landing (stay on the dock, no tank taxi).
    // loop 119 ocean zone plate readable.
    // loop 120 hunt hud not over prey.
    // loop 121 surface ribbon clear of SURFACE.
    // loop 122 surface stays on the dock.
    const m = sessionChipMetrics();
    const gap = portraitStage() ? phoneCss(8) : 8;
    if (missionVisible() || sessionChipVisible()) return sessionChipTop() + m.h + gap;
    return sessionChipTop();
  }
  function zoneChipBox() {
    if (!zoneChipVisible()) return null;
    const m = sessionChipMetrics();
    return { x: m.x, y: zoneChipTop(), w: m.maxW, h: m.h };
  }
  function zoneChipPaintAlpha() {
    // HUD-pinned 70m · Seahorse groves (or the band they spawned
    // in). C118 parked the cone ribbon on this slot; drawing the
    // ribbon after the plate (and screenBoxAlpha) ate it. TODAY
    // stays. Do not hide the zone plate.
    // loop 119 ocean zone plate readable.
    // loop 120 hunt hud not over prey.
    if (!zoneChipVisible()) return 0;
    return 1;
  }
  function ribbonParkTop() {
    // C118 — plaza TODAY under money / BAG; ribbon parks below
    // that slot. C119 — on a DIVE, also reserve the depth / zone
    // plate so the cone / catch ribbon cannot cover 70m groves.
    // C120 still keeps this slot for clearance math; the
    // painted phone-hunt ribbon moves off the grove (or
    // combines away) so it is not a third chip over prey.
    // C121 still keeps this slot for clearance math.
    // No TODAY / no zone: 0 so callers keep their own gy.
    // loop 118 plaza today after unlock.
    // loop 119 ocean zone plate readable.
    // loop 120 hunt hud not over prey.
    // loop 121 surface ribbon clear of SURFACE.
    const m = sessionChipMetrics();
    const gap = portraitStage() ? phoneCss(8) : 8;
    const sessionLift = (missionVisible() || sessionChipVisible()) ? m.h + gap : 0;
    const zoneLift = zoneChipVisible() ? m.h + gap : 0;
    if (!sessionLift && !zoneLift) return 0;
    return sessionChipTop() + sessionLift + zoneLift;
  }
  function zoneChipClear() {
    // Visible zone plate is not covered by the cone / catch ribbon.
    const zone = zoneChipBox();
    if (!zone || zoneChipPaintAlpha() < 1) return false;
    const ribbonY = ribbonParkTop();
    if (!ribbonY) return true;
    return zone.y + zone.h <= ribbonY - 2;
  }
  function huntRibbonCompact() {
    // C120 — phone 390 DIVE FOR hunt (portrait ocean with
    // TODAY + the C119 zone plate): do not stack the cone
    // ribbon as a third chip under TODAY + 70m. That stack
    // hid the first seahorse ! marks. Compact, combine, or
    // move the ribbon — do not cover the prey. TODAY and
    // 70m · Seahorse groves stay readable. Do not camera-clamp.
    // C121 does not undo this compact — it only lifts the
    // parked ribbon off wood ↑ SURFACE after a bag.
    // loop 120 hunt hud not over prey.
    // loop 121 surface ribbon clear of SURFACE.
    return portraitStage() && zoneChipVisible() &&
      (missionVisible() || sessionChipVisible());
  }
  function huntHudFloor() {
    // Bottom of the TODAY + zone stack (money / BAG sit
    // above). The cone ribbon is not part of this floor
    // on a phone hunt — that was the leftover three-chip
    // cover. C121 still ignores the catch ribbon here so
    // a lift off SURFACE cannot cover prey.
    // loop 120 hunt hud not over prey.
    // loop 121 surface ribbon clear of SURFACE.
    const gap = portraitStage() ? phoneCss(8) : 8;
    if (zoneChipVisible()) {
      const z = zoneChipBox();
      if (z) return z.y + z.h + gap;
    }
    const t = todayChipBox();
    if (t) return t.y + t.h + gap;
    if (portraitStage()) return hudSafeTop() + phoneCss(48) + 8;
    return 74;
  }
  function ribbonLowParkTop(th) {
    // Phone ocean: park the cone / catch ribbon above
    // DIVE / SURFACE / the home lip — not under TODAY +
    // 70m over the grove. loop 120 hunt hud not over prey.
    // C121 — once wood ↑ SURFACE is legal (bag ≥ 1), that
    // C120 park sat on the same thumb lip as the chip.
    // Leave a fat gap above the SURFACE box. Bag 0/5 still
    // hides SURFACE (C114); that low ribbon stays.
    // C122 does not undo this lift.
    // loop 121 surface ribbon clear of SURFACE.
    // loop 122 surface stays on the dock.
    const h = th != null ? th : (portraitStage() ? phoneCss(28) : 32);
    const gap = portraitStage() ? phoneCss(8) : 8;
    const act = actionBtnSize();
    const floor = actionFloor();
    const reserve = (act && act.h ? act.h : 0) + (act && act.pad ? act.pad : 0) + gap;
    let y = Math.max(0, floor - reserve - h);
    const surf = typeof surfaceChipBox === "function" ? surfaceChipBox() : null;
    if (surf) {
      const thumb = typeof ribbonSurfaceGap === "function"
        ? ribbonSurfaceGap()
        : (portraitStage() ? phoneCss(28) : 20);
      const lift = portraitStage() ? phoneCss(28) : 20;
      y = Math.min(y, Math.max(0, surf.y - Math.max(thumb, lift) - h));
    } else if (typeof surfaceAssistLegal === "function" && surfaceAssistLegal()) {
      const surfH = portraitStage() ? phoneCss(40) : 36;
      const inset = (act && act.pad != null) ? act.pad : (portraitStage() ? phoneCss(18) : 16);
      const thumb = portraitStage() ? phoneCss(28) : 20;
      const surfY = floor - inset - surfH;
      y = Math.min(y, Math.max(0, surfY - thumb - h));
    }
    return y;
  }
  function ribbonIsLow(rb) {
    // Painted ribbon sits below the TODAY + zone stack
    // (moved off the grove). loop 120 hunt hud not over prey.
    // C121 a further lift off SURFACE is still "low".
    // loop 121 surface ribbon clear of SURFACE.
    if (!rb) return false;
    const gap = portraitStage() ? phoneCss(16) : 16;
    return rb.y >= huntHudFloor() + gap;
  }
  function ribbonHuntClear() {
    // Cone ribbon is not a third chip covering grove prey.
    // Moved below huntHudFloor, or combined away when the
    // action lip leaves no room (no painted third chip).
    // loop 120 hunt hud not over prey.
    // C121 may hide the ribbon when SURFACE owns the lip.
    // loop 121 surface ribbon clear of SURFACE.
    if (!huntRibbonCompact()) return true;
    const low = ribbonLowParkTop();
    const floor = huntHudFloor();
    const gap = portraitStage() ? phoneCss(16) : 16;
    return low >= floor + gap || low < floor;
  }
  function huntMarkClear(wx, wy) {
    // A world seahorse / ! at (wx, wy) is fully below the
    // TODAY + zone HUD stack (not under the leftover
    // three-chip cover). Bang sits ~24 world px above.
    // loop 120 hunt hud not over prey.
    if (wx == null || wy == null) return false;
    const bang = worldToScreen(wx, wy - 24);
    const z = Math.max(0.001, (cam && cam.z) || 1);
    const plateR = 10 * z;
    return bang.y - plateR >= huntHudFloor();
  }
  function ribbonSurfaceGap() {
    // Fat clearance so the catch ribbon cannot share the
    // SURFACE thumb lip. The leftover C120 park sat on
    // that same bottom strip. loop 121 surface ribbon
    // clear of SURFACE.
    return portraitStage() ? phoneCss(20) : 16;
  }
  function ribbonSurfaceClear(rb) {
    // Catch / cone ribbon does not sit on / overlap the
    // wood ↑ SURFACE chip. After a hunt-species is bagged
    // SURFACE owns the thumb corner. A missing ribbon
    // (combined away) is clear. Bag 0/5 hides SURFACE
    // (C114) — that low ribbon is fine.
    // loop 121 surface ribbon clear of SURFACE.
    const surf = typeof surfaceChipBox === "function" ? surfaceChipBox() : null;
    if (!surf) return true;
    if (!rb) return true;
    const gap = ribbonSurfaceGap();
    if (rb.y + rb.h <= surf.y - gap) return true;
    if (rb.x + rb.w <= surf.x - gap) return true;
    return false;
  }
  function huntPreyVisible() {
    // At least one hunt ! / seahorse is fully visible
    // below the HUD stack. loop 120 hunt hud not over prey.
    if (state.scene !== "ocean") return false;
    const hunt = diveForHuntIndex();
    const list = oceanFish || [];
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      if (!f || f.caught) continue;
      if (hunt >= 0 && (f.s | 0) !== hunt) continue;
      if (huntMarkClear(f.x, f.y)) return true;
    }
    return false;
  }
  function huntStockIndex() {
    // C114 — TODAY / surface-stock follow the DIVE FOR bowl
    // (empty Seahorse), not a leftover Stock Sea Turtle plate.
    // Hunt stays armed in the ocean; after surface the hunt is
    // cleared, so a bag that already holds that fish and an
    // empty bowl still wins. Do not auto-stock.
    // C116 — this same index is the TODAY promote: a live hunt
    // or a just-surfaced empty bowl still the stock target.
    // C118 — after TAP TO UNLOCK the empty unlocked bowl is
    // already the stock target. Do not wait for diveForHunt
    // (70m groves). DIVE FOR board legal + bag empty of that
    // fish: plaza TODAY reads Stock Seahorse.
    // loop 114 hide SURFACE until the hunt bags.
    // loop 116 today hunt copy.
    // loop 118 plaza today after unlock.
    const hunt = diveForHuntIndex();
    if (hunt >= 0 && speciesUnlocked(hunt) && (state.stock[hunt] | 0) === 0)
      return hunt;
    const cue = diveForTankIndex();
    if (cue >= 0 && speciesUnlocked(cue) && (state.stock[cue] | 0) === 0)
      return cue;
    let best = -1;
    const bag = state.bag || [];
    for (let n = 0; n < bag.length; n++) {
      const s = bag[n] | 0;
      if (s < 0 || !speciesUnlocked(s)) continue;
      if ((state.stock[s] | 0) > 0) continue;
      if (s > best) best = s;
    }
    return best;
  }
  function applyHuntStockGoal() {
    // C114 — rewrite leftover stock-N (stock-Turtle → stock-Seahorse).
    // C116 — a boat / unlock / serve daily is not a stock-N, so this
    // rewrite never fires. TODAY copy uses todayGoalLabel() so a live
    // hunt still reads Stock Seahorse. Do not mutate the rolled boat
    // daily — after the hunt / bowl is stocked it can show again.
    // C118 — plaza copy also promotes via huntStockIndex() the
    // moment the empty unlocked bowl is the DIVE FOR cue, not
    // only once diveForHunt is armed. Do not auto-stock.
    // loop 116 today hunt copy.
    // loop 118 plaza today after unlock.
    const want = huntStockIndex();
    if (want < 0) return;
    const goals = state.sessionGoals;
    if (!goals || !goals.length) return;
    const id = "stock-" + want;
    for (let i = 0; i < goals.length; i++) {
      const g = goals[i];
      if (!g || ("" + g).indexOf("stock-") !== 0) continue;
      const s = ("" + g).slice(6) | 0;
      if (want > s) goals[i] = id;
    }
  }
  function todayGoalLabel() {
    // C116 — during a live DIVE FOR hunt (empty unlocked bowl,
    // bag empty or already holding that fish, diveForHunt armed
    // or just surfaced with that empty bowl still the stock
    // target), TODAY reads Stock {species}, not leftover
    // "Take the boat" / "Unlock …" / "Serve 3…".
    // C118 — after TAP TO UNLOCK that same empty unlocked bowl
    // (DIVE FOR board legal, bag empty of that fish) plaza TODAY
    // already reads Stock {species}. Do not wait until the
    // ocean hunt is armed. A rolled boat daily stays when there
    // is no hunt and no empty unlocked bowl to stock. New-game
    // first DIVE does not force Stock Seahorse. After the bowl
    // is stocked the rolled daily can show again. Do not
    // auto-stock. loop 116 today hunt copy.
    // loop 118 plaza today after unlock.
    applyHuntStockGoal();
    const want = huntStockIndex();
    if (want >= 0) return sessionGoalLabel("stock-" + want);
    const goals = state.sessionGoals || [];
    for (let i = 0; i < goals.length; i++) {
      const ok = (state.sessionGoalDone || []).indexOf(goals[i]) >= 0 || sessionGoalMet(goals[i]);
      if (!ok) return sessionGoalLabel(goals[i]);
    }
    return "";
  }
  function sessionGoalLabel(id) {
    if (id === "tang") return "Unlock Blue Tang";
    if (id === "shiny") return "Catch a shiny";
    if (id === "cashier") return "Hire the cashier";
    if (id === "serve") return "Serve 3 customers  " + Math.min(3, state.sessionSales | 0) + "/3";
    if (id === "speed") return "Buy Speed";
    if (id === "boat") return "Take the boat";
    if (id === "reef") return "Visit the reef";
    if (id === "wreck") return "Visit the wreck";
    if (id === "chest") return "Crack the wreck chest";
    if (id === "nico") return "Sell Nico a lantern";
    if (id === "lamp") return "Hang Nico's lantern";
    if (id === "sable") return "Serve Sable at the lantern";
    if (id === "guest") {
      const who = state.dayGuest || "a regular";
      const sp = SPECIES[state.dayWant | 0];
      return "Serve " + who + (sp ? " a " + sp.name : "");
    }
    if (id === "catch6") return "Catch 6 fish  " + Math.min(6, state.sessionDiveCatch | 0) + "/6";
    if (id === "deep") return "Dive a new zone";
    if (id === "unlock") {
      const n = nextLockedTank();
      return n >= 0 ? "Unlock " + SPECIES[n].name : "Unlock a new friend";
    }
    if (id && id.indexOf("stock-") === 0) {
      const over = huntStockIndex();
      const rolled = id.slice(6) | 0;
      const s = (over >= 0 && over > rolled) ? over : rolled;
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
    if (id === "wreck") return !!state.sawWreck;
    if (id === "chest") return !!state.sessionChest;
    if (id === "nico") return !!state.sessionNicoLantern;
    if (id === "lamp") return !!state.wreckLamp;
    if (id === "sable") return !!state.sessionSable;
    if (id === "guest") return !!state.sessionDayGuest;
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
    if (state.didFirstStock && !state.sawWreck) pool.push("wreck");
    if (state.sawWreck) pool.push("chest");
    if (state.lanternRumor && ((state.stock && state.stock[13]) | 0) === 0) pool.push("nico");
    if (state.lanternRumor && !state.wreckLamp && ((state.stock && state.stock[13]) | 0) > 0) pool.push("lamp");
    if (state.wreckLamp) pool.push("sable");
    rollDayGuest();
    if (dayBoardReady()) pool.push("guest");
    if (state.unlocked[4]) pool.push("deep");
    const nl = nextLockedTank();
    if (nl >= 0) pool.push("unlock");
    const hi = highestUnlocked();
    if (state.unlocked[hi]) pool.push("stock-" + hi);
    const picked = [];
    if (dayBoardReady()) {
      picked.push("guest");
      const gi = pool.indexOf("guest");
      if (gi >= 0) pool.splice(gi, 1);
    }
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
    state.sessionChest = false;
    state.sessionNicoLantern = false;
    state.sessionSable = false;
    state.sessionDayGuest = false;
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
    applyHuntStockGoal();
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
      // C90 — empty unlocked is an empty bowl, not a ceremonial fish
      // that reads as "stocked" or a lock silhouette.
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
  // C93 — visible stage for a full speech bubble. Below money / BAG /
  // mute / pause plates, above the DIVE chip, inside the left/right
  // lips. Does not hide the line. NPCs stay planted.
  function speechHudFloor() {
    const pad = portraitStage() ? phoneCss(8) : 8;
    const { muteB, pauseB } = topCtrlBoxes();
    let floor = portraitStage()
      ? hudSafeTop() + phoneCss(48) + pad
      : 14 + 52 + pad;
    floor = Math.max(floor, muteB.y + muteB.h + pad, pauseB.y + pauseB.h + pad);
    return floor;
  }
  function speechDiveCeil() {
    const pad = portraitStage() ? phoneCss(8) : 12;
    let bot = portraitStage() ? visibleStageBottom() : H;
    if (actionPromptVisible()) {
      const dive = actionBtnBox();
      bot = Math.min(bot, dive.y);
    }
    return bot - pad;
  }
  function speechStageRect() {
    const pad = portraitStage() ? phoneCss(8) : 12;
    const top = speechHudFloor();
    const bot = speechDiveCeil();
    return {
      x: pad,
      y: top,
      w: Math.max(40, W - pad * 2),
      h: Math.max(24, bot - top),
    };
  }
  function fitSpeechLocal(wx, wy, bx, ey, bw, bh) {
    const z = Math.max(0.001, cam.z || 1);
    const stage = speechStageRect();
    let lx = bx;
    let ly = ey;
    const screenOf = (ox, oy) => ({
      x: (wx + ox - bw / 2 - cam.x) * z + viewCenterX(),
      y: (wy + oy - cam.y) * z + H / 2,
      w: bw * z,
      h: bh * z,
    });
    const clipX = (b) => Math.max(0, stage.x - b.x) + Math.max(0, b.x + b.w - (stage.x + stage.w));
    const clipY = (b) => Math.max(0, stage.y - b.y) + Math.max(0, b.y + b.h - (stage.y + stage.h));
    let box = screenOf(lx, ly);
    if (clipX(box) > 0.5) {
      const flip = screenOf(-lx, ly);
      if (clipX(flip) < clipX(box) - 0.5) {
        lx = -lx;
        box = flip;
      }
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
      if (clipY(flip) < clipY(box) - 0.5) {
        ly = tryY;
        box = flip;
      }
    }
    if (box.h <= stage.h) {
      if (box.y < stage.y) ly += (stage.y - box.y) / z;
      box = screenOf(lx, ly);
      if (box.y + box.h > stage.y + stage.h) ly -= (box.y + box.h - (stage.y + stage.h)) / z;
    } else {
      ly += (stage.y - box.y) / z;
    }
    return { bx: lx, ey: ly };
  }
  function fitSpeechScreen(cx, cy, tw, th, topOff) {
    const stage = speechStageRect();
    const lift = topOff == null ? 24 : topOff;
    let x = cx;
    let y = cy;
    const boxOf = (px, py) => ({ x: px - tw / 2, y: py - lift, w: tw, h: th });
    const clipX = (b) => Math.max(0, stage.x - b.x) + Math.max(0, b.x + b.w - (stage.x + stage.w));
    const clipY = (b) => Math.max(0, stage.y - b.y) + Math.max(0, b.y + b.h - (stage.y + stage.h));
    let box = boxOf(x, y);
    if (clipX(box) > 0.5 && clipX(boxOf(W - x, y)) < clipX(box) - 0.5) {
      x = W - x;
      box = boxOf(x, y);
    }
    if (box.w <= stage.w) {
      if (box.x < stage.x) x += stage.x - box.x;
      box = boxOf(x, y);
      if (box.x + box.w > stage.x + stage.w) x -= box.x + box.w - (stage.x + stage.w);
    } else {
      x = stage.x + stage.w / 2;
    }
    box = boxOf(x, y);
    if (clipY(box) > 0.5) {
      const flipped = y < stage.y + stage.h / 2 ? y + th + lift + 20 : y - th - 20;
      if (clipY(boxOf(x, flipped)) < clipY(box) - 0.5) {
        y = flipped;
        box = boxOf(x, y);
      }
    }
    if (box.h <= stage.h) {
      if (box.y < stage.y) y += stage.y - box.y;
      box = boxOf(x, y);
      if (box.y + box.h > stage.y + stage.h) y -= box.y + box.h - (stage.y + stage.h);
    } else {
      y += stage.y - box.y;
    }
    return { x: x, y: y };
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
    applyDayGuest(c);
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
    ctx.fillStyle = "rgba(8, 28, 40, 0.4)";
    ctx.beginPath(); ctx.ellipse(SUN.dx * 0.35, 16, 40, 8.5, 0.05, 0, Math.PI * 2); ctx.fill();
    const hull = ctx.createLinearGradient(-10, -8, 8, 14);
    hull.addColorStop(0, "#c45c42");
    hull.addColorStop(0.45, "#8a3824");
    hull.addColorStop(1, "#4a1c12");
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(-32, 2);
    ctx.quadraticCurveTo(-28, 12, -4, 13);
    ctx.lineTo(22, 12);
    ctx.quadraticCurveTo(36, 8, 32, 1);
    ctx.lineTo(24, -5);
    ctx.quadraticCurveTo(0, -9, -22, -4);
    ctx.quadraticCurveTo(-34, 0, -32, 2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255, 210, 160, 0.22)";
    ctx.beginPath();
    ctx.moveTo(-18, -2);
    ctx.quadraticCurveTo(0, -7, 18, -2);
    ctx.quadraticCurveTo(4, 2, -18, -2);
    ctx.fill();
    ctx.strokeStyle = "#3a1e10"; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.strokeStyle = "rgba(255, 200, 140, 0.35)"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(-20, 1); ctx.lineTo(22, 2); ctx.stroke();
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
    // C91 — hanging shop sign, readable on a 390-wide phone. Not a
    // 12px brown scrap. Planted at OPEN_SIGN; paint only.
    // C93 — hang the board off the arm, left of the post, so it sits
    // in the POP–hut gap above the roof — not through the hut corner.
    // Same planted post X/Y. One OPEN.
    const sway = Math.sin(state.time * 1.35) * 0.06;
    sitShadow(x - 8, y + 22, 28, 8, 0.42);
    const post = ctx.createLinearGradient(x - 6, y - 78, x + 8, y + 18);
    post.addColorStop(0, "#c49248");
    post.addColorStop(0.4, "#8a5a30");
    post.addColorStop(1, "#3a1c0c");
    ctx.fillStyle = post;
    ctx.fillRect(x - 5, y - 78, 10, 98);
    ctx.fillStyle = "rgba(255, 226, 170, 0.28)";
    ctx.fillRect(x - 5, y - 78, 3.2, 98);
    ctx.fillStyle = "rgba(20, 10, 6, 0.28)";
    ctx.fillRect(x + 3.2, y - 78, 1.8, 98);
    ctx.fillStyle = "#5a3418";
    ctx.fillRect(x - 8, y - 80, 16, 7);
    ctx.fillStyle = "#e8c04a";
    ctx.fillRect(x - 8, y - 78, 16, 3);
    ctx.strokeStyle = "#2a1a10";
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 76);
    ctx.lineTo(x - 42, y - 76);
    ctx.lineTo(x - 42, y - 64);
    ctx.stroke();
    ctx.fillStyle = "#3a2a18";
    ctx.beginPath(); ctx.arc(x - 42, y - 64, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(x - 22, y - 48);
    ctx.rotate(sway);
    ctx.strokeStyle = "#2a1a10";
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(-28, -28); ctx.lineTo(-24, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, -28); ctx.lineTo(24, -8); ctx.stroke();
    ctx.fillStyle = "rgba(16, 8, 4, 0.24)";
    roundRect(-40 + SUN.dx * 0.3, 36, 84, 8, 3); ctx.fill();
    ctx.fillStyle = "#3a1c0c";
    roundRect(-44, -10, 88, 44, 6); ctx.fill();
    const board = ctx.createLinearGradient(-44, -12, 20, 34);
    board.addColorStop(0, "#a85a28");
    board.addColorStop(0.45, "#7a3e16");
    board.addColorStop(1, "#3a1808");
    ctx.fillStyle = board;
    roundRect(-46, -12, 92, 44, 6); ctx.fill();
    sunWashBox(-46, -12, 92, 44, 6);
    ctx.strokeStyle = "#ffe27a";
    ctx.lineWidth = 3;
    roundRect(-42, -8, 84, 36, 5); ctx.stroke();
    ctx.fillStyle = "rgba(255, 236, 180, 0.18)";
    ctx.fillRect(-38, -6, 22, 32);
    ctx.fillStyle = "#fff6e8";
    ctx.font = "800 20px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("OPEN", 0, 10);
    ctx.textBaseline = "alphabetic";
    ctx.restore();
  }
  function dayBoardReady() {
    return !!state.missionDone && !!state.dayGuest && (state.dayWant | 0) >= 0;
  }
  function dayGuestName(day) {
    let guest = DAY_GUESTS[(Math.max(1, day | 0) - 1) % DAY_GUESTS.length];
    // Nico's live lantern ask still owns him — the slate names Maya that day.
    if (guest === "Nico" && state.lanternRumor && !state.wreckLamp) guest = "Maya";
    return guest;
  }
  function dayWantIndex(day, guest) {
    const pool = [];
    for (let i = 0; i < SPECIES.length; i++) {
      if (!speciesUnlocked(i)) continue;
      if (isWreckSpecies(i) && !state.sawWreck) continue;
      pool.push(i);
    }
    if (!pool.length) return 0;
    const n = Math.max(1, day | 0);
    const salt = (guest || "").length + n * 7;
    return pool[salt % pool.length];
  }
  function rollDayGuest() {
    // loop 153 — keyed to sessionDay so Continue keeps the same regular.
    if (!state.missionDone) return;
    const day = Math.max(1, state.sessionDay | 0);
    if (state.dayAt === day && state.dayGuest && (state.dayWant | 0) >= 0) return;
    const guest = dayGuestName(day);
    const want = dayWantIndex(day, guest);
    state.dayGuest = guest;
    state.dayWant = want;
    state.dayAt = day;
    persist();
  }
  function applyDayGuest(c) {
    if (!dayBoardReady() || !c || c.name !== state.dayGuest) return;
    if (c.nightGuest) return;
    if (c.name === "Nico" && state.lanternRumor && !state.wreckLamp) return;
    const want = state.dayWant | 0;
    c.favorite = want;
    c.tank = want;
    c.payMult = 2;
    c.dayGuest = true;
    const sp = SPECIES[want];
    if (sp && !c.saidLine) c.emote = (sp.name.split(" ")[0] || sp.name) + "!";
  }
  function ensureDayGuest() {
    if (!dayBoardReady() || state.mode !== "play" || state.scene !== "shop") return;
    rollDayGuest();
    for (const c of customers) {
      if (c.name === state.dayGuest) { applyDayGuest(c); return; }
    }
    if (customers.length >= MAX_CUSTOMERS) return;
    const want = state.dayWant | 0;
    const sp = SPECIES[want];
    customers.push(newCustomer({
      x: 400, y: 1064, state: "browse", tank: want, hops: 8, offX: -12,
      name: state.dayGuest, regular: true, favorite: want, payMult: 2,
      emote: ((sp && sp.name.split(" ")[0]) || "hey") + "!",
      dayGuest: true,
    }));
  }
  function drawDayBoard(x, y) {
    // loop 153 — a leaning slate. DAY N + regular + the fish they want.
    const sway = Math.sin(state.time * 0.7) * 0.015;
    sitShadow(x + 2, y + 18, 44, 10, 0.4);
    ctx.fillStyle = "#6a4224";
    ctx.fillRect(x + 22, y - 8, 7, 28);
    ctx.fillStyle = "rgba(255, 220, 160, 0.22)";
    ctx.fillRect(x + 22, y - 8, 2.2, 28);
    ctx.save();
    ctx.translate(x + 4, y - 36);
    ctx.rotate(-0.08 + sway);
    ctx.fillStyle = "#3a2414";
    roundRect(-40, -28, 88, 62, 6); ctx.fill();
    ctx.fillStyle = "#24382c";
    roundRect(-36, -24, 80, 54, 5); ctx.fill();
    ctx.strokeStyle = "#c8a060";
    ctx.lineWidth = 2;
    roundRect(-36, -24, 80, 54, 5); ctx.stroke();
    ctx.fillStyle = "#ffe27a";
    ctx.font = "800 12px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("DAY " + Math.max(1, state.sessionDay | 0), 4, -10);
    ctx.fillStyle = "#e8f4e8";
    ctx.font = "700 11px Nunito, sans-serif";
    ctx.fillText(state.dayGuest || "", 4, 6);
    const sp = SPECIES[state.dayWant | 0];
    if (sp) {
      ctx.save();
      ctx.translate(4, 22);
      drawFishBody(sp, 0, 0, 0.08, 0.55, state.time);
      ctx.restore();
    }
    ctx.textBaseline = "alphabetic";
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
    if (e.key === " " || e.code === "Space" || e.key === "Enter" || e.key === "e" || e.key === "E") {
      // Full bag + Space/Enter always surfaces, even with a walk target.
      if (state.mode === "play" && state.scene === "ocean" && bagIsFull() && !state.fadeDir) {
        clearWalk();
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
  function eventCanvasPos(ev) {
    const t = (ev.changedTouches && ev.changedTouches[0]) || (ev.touches && ev.touches[0]);
    if (t) return canvasPos({ clientX: t.clientX, clientY: t.clientY });
    return canvasPos(ev);
  }
  let lastPtrDownAt = 0, lastPtrUpAt = 0;
  function playPointerDown(p, opts) {
    const touch = !!(opts && opts.fromTouch);
    mouse.x = p.x; mouse.y = p.y; mouse.down = true; mouse.ui = false;
    mouse.held = 0; mouse.acted = false; mouse.pressX = p.x; mouse.pressY = p.y;
    audio();
    let hit = hitUI(p.x, p.y);
    if (hit && String(hit).startsWith("up-") && portraitStage() && !phoneShopHit(p.x, p.y)) {
      // Walk taps never purchase. Only the open SHOP tray can arm a buy.
      hit = null;
    }
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
      if (!inWorldPlayfield(p.x)) {
        mouse.ui = true;
        return;
      }
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
  }
  function playPointerMove(p) {
    mouse.x = p.x; mouse.y = p.y;
  }
  function playPointerUp(opts) {
    const touch = !!(opts && opts.fromTouch);
    if (mouse.scoopPress && mouse.held < 0.22 && player.scoopLock) player.scoopTap = true;
    if (state.mode === "play" && !mouse.ui && !mouse.acted && mouse.held < 0.22) {
      if (mouse.scoopPress || player.scoopLock) {
        // Scoop tap / hold — do not turn the release into a swim dash.
      } else if (!inWorldPlayfield(mouse.pressX)) {
        // Reserved HUD rail — not a walk target.
      } else if (!(state.scene === "ocean" && bagIsFull() && !touch)) {
        const w = screenToWorld(mouse.pressX, mouse.pressY);
        player.scoopTap = false;
        player.scoopLock = null;
        if (state.scene === "shop") {
          const tankHit = walkTankAtWorld(w.x, w.y);
          if (tankHit >= 0 && speciesUnlocked(tankHit) && bagCanStock(tankHit)) {
            intentWalk("stock", tankWalkPoint(tankHit), tankHit);
          } else {
            // Free deck / locked painted tank. A leftover Turtle unlock
            // pendingAct must not keep the next thumb tap frozen.
            player.pendingAct = null;
            setWalkDest(clickWalkTarget(w.x, w.y));
          }
        } else {
          player.pendingAct = null;
          setWalkDest(clickWalkTarget(w.x, w.y));
        }
      }
    }
    mouse.down = false; mouse.ui = false; mouse.held = 0; mouse.acted = false; mouse.scoopPress = false;
  }
  canvas.addEventListener("pointerdown", (e) => {
    if (e.cancelable) e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    lastPtrDownAt = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    playPointerDown(canvasPos(e), { fromTouch: e.pointerType === "touch" || e.pointerType === "pen" });
  });
  canvas.addEventListener("pointermove", (e) => { playPointerMove(canvasPos(e)); });
  canvas.addEventListener("pointerup", (e) => {
    lastPtrUpAt = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    playPointerUp({ fromTouch: e && (e.pointerType === "touch" || e.pointerType === "pen") });
  });
  canvas.addEventListener("pointercancel", () => { mouse.down = false; mouse.ui = false; mouse.held = 0; mouse.scoopPress = false; });
  canvas.addEventListener("pointerleave", () => { mouse.down = false; mouse.held = 0; });
  canvas.addEventListener("touchstart", (e) => {
    if (e.cancelable) e.preventDefault();
    const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    if (now - lastPtrDownAt < 80) return;
    lastPtrDownAt = now;
    playPointerDown(eventCanvasPos(e), { fromTouch: true });
  }, { passive: false });
  canvas.addEventListener("touchmove", (e) => {
    if (e.cancelable) e.preventDefault();
    playPointerMove(eventCanvasPos(e));
  }, { passive: false });
  canvas.addEventListener("touchend", (e) => {
    if (e.cancelable) e.preventDefault();
    const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    if (now - lastPtrUpAt < 80) return;
    lastPtrUpAt = now;
    playPointerUp({ fromTouch: true });
  }, { passive: false });
  canvas.addEventListener("touchcancel", () => { mouse.down = false; mouse.ui = false; mouse.held = 0; mouse.scoopPress = false; });
  window.addEventListener("touchmove", (e) => {
    if (e.target === canvas && e.cancelable) e.preventDefault();
  }, { passive: false });
  window.addEventListener("gesturestart", (e) => { e.preventDefault(); }, { passive: false });
  window.addEventListener("resize", layoutStage);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", layoutStage);
    window.visualViewport.addEventListener("scroll", layoutStage);
  }
  window.addEventListener("pagehide", persist);
  window.addEventListener("beforeunload", persist);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") persist();
  });
  function tankAtWorld(wx, wy) {
    for (let i = 0; i < SPECIES.length; i++) {
      if (!tankLive(i)) continue;
      const t = TANK_POS[i];
      if (wx > t.x - 8 && wx < t.x + TANK_W + 8 && wy > t.y - 8 && wy < t.y + TANK_H + 28) return i;
    }
    return -1;
  }
  function plazaTankStealsDockTap(i) {
    // C108 — 390 dock camera. Clustered bowls sit above the dock lip.
    // tankAtWorld hitting Dolphin (11) at ny≈0.12–0.22 must not beat
    // the C107 north remap (leftover aisle snap 881,784).
    if (!(portraitStage() || thumbCopy())) return false;
    if (state.scene !== "shop") return false;
    const onDockCam = !!(dockCameraReady() || (cam && cam.y >= DOCK_CAM_FLOOR - 40));
    const onDock = !!(player && player.y > 800);
    if (!onDock && !onDockCam) return false;
    const t = TANK_POS[i];
    if (!t) return false;
    return t.y + TANK_H < 860;
  }
  function walkTankAtWorld(wx, wy) {
    const i = tankAtWorld(wx, wy);
    if (i < 0) return -1;
    if (plazaTankStealsDockTap(i)) return -1;
    return i;
  }
  function clickWalkTarget(wx, wy) {
    if (state.scene === "shop") {
      // C129 — west dock tap walks west before C108 plaza remap.
      // C130 — east dock tap walks east before C108 plaza remap.
      if (westDockTapWanted(wx, wy) || onWestDockWalk(wx, wy) ||
          eastDockTapWanted(wx, wy) || onEastDockWalk(wx, wy)) return snapToShopWalk(wx, wy);
      // C108 — plaza remap before tankAtWorld so an offscreen bowl
      // (Dolphin 11) cannot steal the visible upper-third tap.
      if (phoneDockPlazaWalkWanted(wx, wy, mouse.pressX, mouse.pressY)) {
        const dest = nextUnlockWalkDest();
        if (dest) return dest;
      }
      const tankHit = walkTankAtWorld(wx, wy);
      if (tankHit >= 0) {
        if (tankHit >= CORE_SPECIES && !galleryOpen()) return galleryTankDest(tankHit);
        if (!speciesUnlocked(tankHit)) {
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
    if (state.scene === "shop") {
      // loop 125 one shore no water-walk boat tap only
      // A tap south of the boards / off the plank x is not a water walk.
      const dock = shopDockWalk();
      const south = dock.y + dock.h;
      if (player && player.y > 820 && (wy > south || wx < dock.x || wx > dock.x + dock.w)) {
        // C128 — tap on the painted west finger walks there, not a clamp to dock.x.
        if (onWestDockWalk(wx, wy)) return snapToShopWalk(wx, wy);
        return {
          x: clamp(wx, dock.x + 16, dock.x + dock.w - 16),
          y: clamp(wy > south ? player.y : wy, dock.y + 12, south - 8),
        };
      }
      return snapToShopWalk(wx, wy);
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
  function btn(id, x, y, w, h, meta) {
    const hit = { id, x, y: y + menuYShift, w, h };
    if (meta) {
      if (meta.label) hit.label = meta.label;
      if (meta.aria) hit.aria = meta.aria;
    }
    uiHits.push(hit);
  }
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
    if (id === "export") { exportSave(); return; }
    if (id === "import") { pickImportSave(); return; }
    if (id === "mute") { state.muted = !state.muted; persist(); return; }
    if (id === "shop-toggle") { phoneShopOpen = !phoneShopOpen; return; }
    if (id === "shop-panel") return;
    if (id === "till") { intentWalk("cash", registerWalkPoint()); return; }
    if (id === "up-speed") armOrBuy("up-speed", buySpeed);
    if (id === "up-bag") armOrBuy("up-bag", buyBag);
    if (id === "up-catch") armOrBuy("up-catch", buyCatch);
    if (id === "up-cashier") armOrBuy("up-cashier", buyCashier);
    if (id === "up-diver") armOrBuy("up-diver", buyDiver);
    if (id.startsWith("decor-")) buyDecor(+id.split("-")[1]);
    if (id.startsWith("unlock-")) {
      const i = +id.split("-")[1];
      if (i >= CORE_SPECIES && !galleryOpen()) {
        confirmUnlockWalk(galleryTankDest(i), 4);
        return;
      }
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
      confirmUnlockWalk(tankWalkPoint(i), i);
      return;
    }
    if (id === "book-dismiss" || id === "book-close") { state.bookOpen = null; return; }
    if (id === "book-panel") return;
    if (id === "goto-dock") {
      if (state.mode === "play" && state.scene === "shop") {
        if (diveWalkLegal()) intentWalk("dive", dockWalkPoint());
        else walkToDock();
      }
      return;
    }
    if (id === "goto-stock") {
      // C122 — SURFACE no longer auto-walks to the tank.
      // This board / ribbon still walks when they tap it.
      // loop 122 surface stays on the dock.
      if (state.mode === "play" && state.scene === "shop" && bagHasStockable()) {
        const dest = stockableTankTarget() || tankWalkPoint(Math.max(0, glowingStockIndex()));
        intentWalk("stock", dest, Math.max(0, glowingStockIndex()));
      }
      return;
    }
    if (id === "goto-plaza") {
      // C107 — fat ↑ SHOP / north cue. Same dest desktop hold-W uses.
      // C109 — walk only. Arriving at the bowl is not a purchase.
      if (state.mode === "play" && state.scene === "shop") walkToShopBowls();
      return;
    }
    if (id === "goto-unlock") {
      // C110 — fat TAP TO UNLOCK / UNLOCK $N board on the next locked
      // bowl. Explicit buy — same confirmUnlockWalk as a lock-plate
      // tap. Walk-to-bowl still does not arm this.
      if (state.mode === "play" && state.scene === "shop") {
        const n = nextLockedTank();
        if (n >= 0) confirmUnlockWalk(tankWalkPoint(n), n);
      }
      return;
    }
    if (id === "goto-dive-for") {
      // C111 — fat DIVE FOR <SPECIES> / TAP TO DIVE board on the
      // empty unlocked bowl. Same path as the DIVE chip (C86 dash).
      // C112 — arm the species band so that dash lands in Seahorse
      // groves, not 6m Shallows. loop 112 dive for the right band.
      // Do not auto-dive on unlock and do not auto-buy the next lock.
      const hunt = diveForTankIndex();
      if (hunt >= 0) armDiveForHunt(hunt);
      if (state.mode === "play" && diveActionLegal()) beginDive();
      else if (state.mode === "play" && diveWalkLegal()) intentWalk("dive", dockWalkPoint());
      return;
    }
    if (id.startsWith("book-")) {
      const n = +id.split("-")[1];
      if (n >= 0 && n < SPECIES.length) {
        if (!state.unlocked[n]) {
          if (n >= CORE_SPECIES && !galleryOpen()) {
            confirmUnlockWalk(galleryTankDest(n), 4);
            return;
          }
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
          confirmUnlockWalk(tankWalkPoint(n), n);
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
      if (state.mode === "play") { player.goto = null; requestSurface(); }
      return;
    }
    if (id === "goto-till") {
      if (state.mode === "play" && state.scene === "shop" && cashNeedsCollect()) {
        intentWalk("cash", registerWalkPoint());
      }
      return;
    }
    if (id === "goto-surface") {
      if (state.mode === "play" && state.scene === "ocean") requestSurface();
      return;
    }
    if (id === "boat") {
      // loop 125 one shore no water-walk boat tap only
      if (state.mode === "play" && state.scene === "shop" && nearBoat() && expeditionUnlocked()) {
        beginExpedition();
      }
      return;
    }
    if (id === "dive" || id === "dive-chip") {
      // C115 — while DIVE FOR {species} is legal, this thumb
      // DIVE arms the same hunt as the bowl board.
      // loop 115 dive chip arms the hunt.
      // loop 127 DIVE works on the dock
      // HUD DIVE always begins the dive on the pad, else walks
      // to dockWalkPoint then dives. Never a boat tap.
      plazaDiveArmsHunt();
      if (state.mode === "play" && diveActionLegal()) beginDive();
      else if (state.mode === "play" && diveWalkLegal()) intentWalk("dive", dockWalkPoint());
      return;
    }
  }
  function startPlay() {
    ensureUnlockFlags();
    if (oceanFish.length === 0) seedOcean();
    rebuildTankFish();
    state.mode = "play";
    state.decorOpen = false;
    phoneShopOpen = false;
    if (state.scene !== "shop" && state.scene !== "ocean") state.scene = "shop";
    if (state.scene === "shop") {
      player.x = 880; player.y = 920;
      cam.x = 880; cam.y = 1000; cam.z = stageZoom(); cam.rail = 28; cam.shopBand = null;
      state.camTillHold = 0;
      clearWalk();
      if (state.tutorial === 0) state.didMove = false;
    }
    creditOffline();
    maybeLanternRumor();
    maybeNightGuest();
    rollDayGuest();
    ensureDayGuest();
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
    const hunt = huntStockIndex();
    if (hunt >= 0 && state.bag && state.bag.some((s) => (s | 0) === hunt))
      return hunt;
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
    // loop 125 one shore no water-walk boat tap only
    // loop 127 DIVE works on the dock
    // SPACE near the boat, or a tap on the hull / BOAT chip.
    // Shore taps while nearBoat walk — they must not fade to ocean.
    // A HUD DIVE-chip tap is never clickOnBoat (same actionBtnBox).
    if (state.scene === "shop" && nearBoat() && expeditionUnlocked() && !clickOnDiveHud()) {
      if (fromTouch && !fromKey && !clickOnBoat()) return false;
      if (!fromKey && !clickOnBoat()) return false;
      beginExpedition();
      return true;
    }
    // C67 — Space / E in the till glow always pockets. A leftover cash
    // pendingAct used to stall tillDwell, so the first sale never cleared
    // and dive stayed illegal.
    if (state.scene === "shop" && fromKey && cashNeedsCollect()) {
      if (inTillGlow()) { collectCash(); return true; }
      intentWalk("cash", registerWalkPoint());
      return true;
    }
    if (state.scene === "shop" && (inDiveZone() || nearDivePad() || clickOnDiveHud() || (clickOnDiveChip() && nearDivePad()))) {
      if (state.surfaceLock > 0) return fromKey;
      // Cash waiting: a walk-click toward the cashier must not dive.
      if (cashNeedsCollect()) return false;
      // Clicks walk to the tanks while the bag still has fish; Space can still re-dive.
      if (!fromKey && bagHasStockable()) return false;
      // loop 127 DIVE works on the dock
      // Touch uses the HUD DIVE chip or the world pad. A DIVE-chip
      // tap always begins the dive here — never a boat expedition.
      if (fromTouch && !fromKey && !clickOnDiveChip() && !clickOnDiveHud()) return false;
      // World clicks only dive on the dock strip / DIVE chip — not a walk toward the till.
      if (!fromKey && !clickOnDiveStrip() && !clickOnDiveChip() && !clickOnDiveHud()) return false;
      beginDive();
      return true;
    }
    // C67 — Space / E after the till must walk the pier back to the pad.
    // Off the dock they used to no-op, so the objective froze on
    // "Walk to the glowing dock" while the walker sat at the register.
    if (state.scene === "shop" && fromKey && !bagHasStockable() && !cashNeedsCollect()) {
      if (state.surfaceLock > 0) return true;
      if (nearDivePad()) { beginDive(); return true; }
      walkToDock();
      return true;
    }
    if (shouldSurface()) {
      if (fromTouch && !fromKey) return false;
      if (scoopBlocksSurface() || scoopHoldActive()) return false;
      player.goto = null; requestSurface(); return true;
    }
    return false;
  }
  function inDiveZone() {
    return player.x > DIVE_ZONE.x && player.x < DIVE_ZONE.x + DIVE_ZONE.w &&
           player.y > DIVE_ZONE.y - 40 && player.y < DIVE_ZONE.y + DIVE_ZONE.h;
  }
  function beginDive() {
    if (state.fadeDir || state.surfaceLock > 0) return;
    // C111 hides the on-bowl board. C112 keeps diveForHunt through
    // the fade so ocean entry can open that species' band.
    clearDiveForTank();
    player.catchLatch = false;
    player.scoopLock = null; player.scoopTap = false; player.holdGrace = 0;
    player.surfaceIntent = false;
    sfx("dive"); state.fadeDir = 1; state.pendingScene = "ocean";
    state.fadeClock = 0;
    state.decorOpen = false;
    if (state.tutorial === 0) state.tutorial = 1;
    advanceMission();
  }
  function requestSurface() {
    if (state.scene !== "ocean" || state.mode !== "play") return;
    if (state.pendingScene === "shop" || state.fadeDir > 0) return;
    player.surfaceIntent = true;
    player.catchLatch = false;
    player.scoopLock = null;
    player.scoopTap = false;
    player.holdGrace = 0;
    player.pendingAct = null;
    player.goto = null;
    // Button / Space must leave the water. A swim-up-only path left
    // first-dive 1-fish bags floating at 1m after the chip hid.
    beginSurface();
  }
  function beginSurface() {
    if (state.scene !== "ocean") return;
    if (state.pendingScene === "shop") return;
    if (state.fadeDir > 0) return;
    clearCatchVerb();
    player.goto = null;
    player.catchLatch = false;
    player.scoopLock = null; player.scoopTap = false; player.holdGrace = 0;
    player.surfaceIntent = false;
    sfx("dive"); state.fadeDir = 1; state.pendingScene = "shop";
    state.fadeClock = 0;
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
    state.fadeClock = 0;
    if (state.nightExpedition) toast("Night expedition — rares are out", "#9ef0ff");
    state.sessionBoat = true;
    checkSessionGoals();
  }
  function seedExpeditionPocket() {
    const hi = highestUnlocked();
    const nxt = hi > 0 ? hi - 1 : 0;
    const px = LM_WRECK.x, py = LM_WRECK.y;
    pushOceanFish(hi, px + rand(-36, 36), py + rand(-28, 28));
    if (state.nightExpedition) pushOceanFish(hi, px + rand(-40, 40), py + rand(-32, 32), { rare: true });
    for (let i = 0; i < 4; i++) pushOceanFish(nxt, px + rand(-88, 88), py + rand(-64, 64));
    for (let i = 0; i < 3; i++) pushOceanFish(0, px + rand(-110, 110), py + rand(-72, 72));
    for (let i = 0; i < 4; i++) pushOceanFish(13, px + rand(-70, 70), py + rand(-50, 50));
  }
  function worldToScreen(x, y) { return { x: (x - cam.x) * cam.z + viewCenterX(), y: (y - cam.y) * cam.z + H / 2 }; }
  function screenToWorld(x, y) { return { x: (x - viewCenterX()) / cam.z + cam.x, y: (y - H / 2) / cam.z + cam.y }; }
  // Reserved HUD rail. Cards stay HUD-pinned. The world pass is clipped
  // to this width and the camera treats it as the view, so pier / water /
  // fish / diver cannot paint under the chips or in the strip past them.
  // C66 may still hide chips over the bait shack — the column never slides.
  function railGutterLeft() {
    if (portraitStage()) {
      // C80 — the playfield IS the phone. Shop is an overlay tray, not a
      // reserved well that clips the dock into a skinny column.
      return W;
    }
    const strip = speciesStripLayout();
    const left = strip.x - 10;
    if (compactHud()) {
      const well = Math.max(strip.w + 18, thumbCanvas(72, 96, 200));
      return clamp(left, Math.round(W * 0.54), W - well);
    }
    return Math.max(720, left);
  }
  function viewWidth() {
    if (state.mode === "title") return W;
    return railGutterLeft();
  }
  function viewCenterX() {
    return viewWidth() * 0.5;
  }
  function inWorldPlayfield(sx) {
    return sx < viewWidth();
  }
  // World X of the last painted pixel left of the reserved well.
  // Decks stop here so planks / hut / POP are not sawed by the clip.
  function playfieldWorldRight() {
    const z = Math.max(0.001, cam.z || 1);
    return cam.x + (viewWidth() - 16 - viewCenterX()) / z;
  }
  function hudGutterLeft() {
    return railGutterLeft();
  }
  function hudGutterOccupied() {
    return state.mode !== "title";
  }
  function worldSpriteAlpha(wx, wy, rad) {
    const s = worldToScreen(wx, wy);
    const r = (rad == null ? 40 : rad) * Math.max(0.6, cam.z || 1);
    const fade = 72;
    const rightEdge = viewWidth();
    const aL = clamp((s.x - r + fade) / fade, 0, 1);
    const aR = clamp((rightEdge - (s.x + r)) / fade, 0, 1);
    const aT = clamp((s.y - r + fade) / fade, 0, 1);
    const aB = clamp((H - (s.y + r)) / fade, 0, 1);
    return clamp(Math.min(aL, aR, aT, aB), 0, 1);
  }
  function townBackdropAlpha(wx, wy, rad) {
    // C92 — fade town only into the reserved well. worldSpriteAlpha's
    // top fade sat a ghost OPEN in the dusk sky on desktop 16:9.
    if (portraitStage()) return 1;
    const s = worldToScreen(wx, wy);
    const r = (rad == null ? 40 : rad) * Math.max(0.6, cam.z || 1);
    const fade = 72;
    const rightEdge = viewWidth();
    const aL = clamp((s.x - r + fade) / fade, 0, 1);
    const aR = clamp((rightEdge - (s.x + r)) / fade, 0, 1);
    return clamp(Math.min(aL, aR), 0, 1);
  }
  function paintWorldSprite(wx, wy, rad, draw) {
    const a = worldSpriteAlpha(wx, wy, rad);
    if (a <= 0.04) return false;
    ctx.save();
    ctx.globalAlpha *= a;
    draw();
    ctx.restore();
    return true;
  }
  // Furniture near the reserved well fades as a whole sprite before the
  // hard clip, so the hut / POP / crates never read as sawed in half.
  // Alpha hits 0 when the sprite's right edge reaches the well — C72's
  // 80px / undersized rad still left POP under the razor at x≈798.
  function railPropAlpha(wx, wy, rad) {
    // C80 / C91 — on a portrait phone the playfield IS the screen.
    // Do not ghost the dock cooler / OPEN sign against a reserved well
    // that is not there (viewWidth === W, cam.z ≈ H/860).
    if (portraitStage()) return 1;
    const s = worldToScreen(wx, wy);
    const r = (rad == null ? 88 : rad) * Math.max(0.6, cam.z || 1);
    const fade = 120;
    const rightEdge = viewWidth() - 12;
    return clamp((rightEdge - (s.x + r)) / fade, 0, 1);
  }
  function paintRailProp(wx, wy, rad, draw) {
    const a = railPropAlpha(wx, wy, rad);
    if (a <= 0.04) return false;
    ctx.save();
    ctx.globalAlpha *= a;
    draw();
    ctx.restore();
    return true;
  }
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
    const rightSafe = viewWidth();
    const botSafe = portraitStage() ? visibleStageBottom() : H;
    const inset = Math.min(x, y - topSafe, rightSafe - (x + w), botSafe - (y + h));
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
      sc: s === 0 ? rand(0.56, 1.48) : 1,
      hue: s === 0 ? rand(-48, 42) : 0,
      sat: s === 0 ? rand(0.55, 1.38) : 1,
      br: s === 0 ? rand(0.78, 1.22) : 1,
      flip: s === 0 ? Math.random() < 0.5 : Math.random() < 0.42,
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
    seedWreckTease();
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
    oceanScenery.push({
      kind: "jelly", x: px + 220, y: py + 140, vx: -5, vy: -8, ph: 2.4,
    });
    oceanScenery.push({
      kind: "jelly", x: px + 40, y: py + 260, vx: 4, vy: -6, ph: 3.8,
    });
    for (let i = 0; i < 7; i++) {
      oceanScenery.push({
        kind: "minnow",
        x: px - 40 + i * 22,
        y: py + 196 + Math.sin(i * 1.3) * 14,
        vx: 78, vy: 0, ph: i * 0.38,
      });
    }
    for (let i = 0; i < 5; i++) {
      oceanScenery.push({
        kind: "kelp",
        x: px + rand(-240, 300),
        y: py + 150 + rand(30, 240),
        ph: rand(0, 8),
        seed: 11 + i * 19,
        sc: rand(0.68, 1.38),
        landmark: false,
      });
    }
    for (let i = 0; i < 3; i++) {
      oceanScenery.push({
        kind: "rock",
        x: px + rand(-200, 260),
        y: py + 190 + rand(20, 200),
        seed: 5 + i * 13,
        sc: rand(0.72, 1.45),
        ph: rand(0, 4),
      });
    }
  }
  function seedDiveLandmark() {
    if (state.expedition || state.unlocked[1]) return;
    if ((state.divesThisSession | 0) !== 1) return;
    const x = clamp(player.x + 168, 180, OCEAN.w - 180);
    const y = clamp(player.y + 228, 520, 820);
    oceanScenery.push({ kind: "kelp", x, y, ph: 0.35, landmark: true, seed: 41, sc: 1.15 });
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
    const counts = [16, 11, 9, 7, 3, 6, 5, 5, 4, 5, 4, 3, 2, 3];
    for (let s = 0; s < SPECIES.length; s++) {
      if (!state.unlocked[s] && !isWreckSpecies(s)) continue;
      const n = counts[s] != null ? counts[s] : 3;
      for (let i = 0; i < n; i++) spawnFish(s);
    }
  }
  function spawnFish(s) {
    let cx, cy;
    if (isWreckSpecies(s)) {
      cx = WRECK.x + 50 + Math.random() * (WRECK.w - 100);
      cy = WRECK.y + 40 + Math.random() * (WRECK.h - 80);
    } else if (s === 0) {
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
      sc: s === 0 ? rand(0.56, 1.48) : 1,
      hue: s === 0 ? rand(-48, 42) : 0,
      sat: s === 0 ? rand(0.55, 1.38) : 1,
      br: s === 0 ? rand(0.78, 1.22) : 1,
      flip: s === 0 ? Math.random() < 0.5 : Math.random() < 0.42,
    });
  }
  function ensureOceanStock() {
    syncOceanHeight();
    const want = [24, 11, 9, 7, 3, 7, 6, 6, 5, 5, 4, 3, 2, 3];
    for (let s = 0; s < SPECIES.length; s++) {
      if (!state.unlocked[s] && !isWreckSpecies(s)) continue;
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
      const local = zoneAtDepth(player.y, player.x);
      const sid = local.wreck ? 13 : (state.unlocked[local.s] ? local.s : 0);
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
    return s.x > p && s.x < viewWidth() - p && s.y > p && s.y < H - p;
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
    // C112 — a DIVE FOR <species> hunt is not the first-clownfish
    // shiny quest. New-game / normal DIVE still wants the SHINY.
    if (diveForHuntIndex() >= 0) return false;
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
    const range = coneRange() + (f.rare ? 56 : 0) + grace * 64 + scoopEdgeGrace() + (isChestTarget(f) ? 28 : 0);
    const minD = isChestTarget(f) ? 4 : 16;
    if (d > range || d < minD) return false;
    const half = (f.rare ? 1.28 : coneHalf()) + grace * 0.12 + 0.035;
    return Math.abs(normAng(Math.atan2(dy, dx) - player.facing)) < half;
  }
  function fishNearCone(f) {
    const dx = f.x - player.x, dy = f.y - player.y;
    const d = Math.hypot(dx, dy);
    const verbPad = f.verb ? 36 : 0;
    const grace = tutorialGrace();
    const range = coneRange() + (f.rare ? 92 : 16) + verbPad + grace * 80 + scoopEdgeGrace() + (isChestTarget(f) ? 36 : 0);
    const minD = isChestTarget(f) ? 4 : 16;
    if (d > range || d < minD) return false;
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
      if (!huntScoopAllows(f)) continue;
      const d = Math.hypot(f.x - wx, f.y - wy);
      if (d < bestD) { bestD = d; best = f; }
    }
    const chest = wreckChestTarget();
    if (chest) {
      const d = Math.hypot(chest.x - wx, chest.y - wy);
      if (d < bestD) best = chest;
    }
    return best;
  }
  function nearestScoopFish() {
    let best = null, bestD = 1e9, bestRare = null, bestRareD = 1e9;
    const grace = tutorialGrace();
    const maxD = coneRange() * (1.05 + grace * 0.35) + scoopEdgeGrace();
    const half = coneHalf() + 0.35 + grace * 0.55 + 0.04;
    const exclusive = huntScoopExclusive();
    for (const f of oceanFish) {
      if (f.caught || f.tease) continue;
      if (!huntScoopAllows(f)) continue;
      const dx = f.x - player.x, dy = f.y - player.y;
      const d = Math.hypot(dx, dy);
      if (d > maxD || d < 16) continue;
      if (Math.abs(normAng(Math.atan2(dy, dx) - player.facing)) > half) continue;
      if (f.rare && d < bestRareD) { bestRareD = d; bestRare = f; }
      if (d < bestD) { bestD = d; best = f; }
    }
    const chest = wreckChestTarget();
    if (chest) {
      const dx = chest.x - player.x, dy = chest.y - player.y;
      const d = Math.hypot(dx, dy);
      if (d <= maxD + 28 && d >= 4 &&
          Math.abs(normAng(Math.atan2(dy, dx) - player.facing)) <= half + 0.2) {
        return chest;
      }
    }
    if (exclusive) {
      if (best) return best;
      const prey = nearestHuntFish(diveForHuntIndex());
      if (!prey) return null;
      const d = Math.hypot(prey.x - player.x, prey.y - player.y);
      return (d < maxD && d >= 16) ? prey : null;
    }
    return bestRare || best;
  }
  function lockScoop(f) {
    if (!f || f.caught || f.tease) return false;
    if (!huntScoopAllows(f)) return false;
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
    if (!f || f.rare || f.tease || f.verb || f.chest || state.catchVerb) return;
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
    if (state.bag.length >= bagMax() && !(wreckChestTarget() && inWreck(player.x, player.y))) {
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
    if (player.scoopLock && !huntScoopAllows(player.scoopLock)) {
      if (player.scoopLock.verb) player.scoopLock.verb = "";
      state.catchVerb = null;
      player.scoopLock = null;
    }
    if (player.target && !huntScoopAllows(player.target) && !player.scoopLock) {
      if (player.target.verb) player.target.verb = "";
      state.catchVerb = null;
      player.target = null;
      player.catchProg = 0;
    }
    let rareNear = false;
    for (const f of oceanFish) {
      if (f.caught || f.tease) continue;
      if (!huntScoopAllows(f)) continue;
      if (f.rare && fishNearCone(f)) rareNear = true;
    }
    if (rareNear && player.scoopLock && !player.scoopLock.rare && !isChestTarget(player.scoopLock)) {
      if (player.scoopLock.verb) player.scoopLock.verb = "";
      state.catchVerb = null;
      player.scoopLock = null;
    }
    if (player.scoopLock && !isChestTarget(player.scoopLock) &&
        (player.scoopLock.caught || oceanFish.indexOf(player.scoopLock) < 0)) {
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
    const chestAim = wreckChestTarget();
    if (chestAim && (fishInCone(chestAim) || fishNearCone(chestAim))) {
      best = chestAim;
      bestD = Math.hypot(chestAim.x - player.x, chestAim.y - player.y);
    }
    for (const f of oceanFish) {
      if (f.caught || f.tease) continue;
      if (!huntScoopAllows(f)) continue;
      const inC = f.rare ? fishNearCone(f) : fishInCone(f);
      if (!inC) continue;
      const d = Math.hypot(f.x - player.x, f.y - player.y);
      if (f.rare && d < bestRareD) { bestRareD = d; bestRare = f; }
      if (d < bestD) { bestD = d; best = f; }
    }
    if (chestAim && best === chestAim) { /* wreck chest wins the cone in the hull */ }
    else if (bestRare) best = bestRare;
    else if (rareNear) best = null;
    if (rareNear && player.target && !player.target.rare && !isChestTarget(player.target)) {
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
    if (isChestTarget(f)) {
      openWreckChest();
      return;
    }
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
    if ((f.s | 0) === 13) maybeLanternRumor();
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
    const ox = player.x, oy = player.y;
    let ax = 0, ay = 0;
    if (mouse.down) mouse.held += dt; else mouse.held = 0;
    if (keys.has("w") || keys.has("arrowup")) ay -= 1;
    if (keys.has("s") || keys.has("arrowdown")) ay += 1;
    if (keys.has("a") || keys.has("arrowleft")) ax -= 1;
    if (keys.has("d") || keys.has("arrowright")) ax += 1;
    if (ax || ay) {
      const m = Math.hypot(ax, ay) || 1; ax /= m; ay /= m;
      clearWalk();
      // C103 — hold-W from the dock has no N–S alley through the bowls.
      // C104 — do not magnet to Soon-Puffer. Follow the wood path to
      // the next locked live bowl (Seahorse after Turtle). Click-to-walk
      // Puffer and the ribbon goal stay.
      // C105 — that path used to be the west lane (east of REGISTER),
      // not the C102 east-spine scenic route past Soon-Puffer.
      // C106 — the west lane taxied row-3 to the till first. Hold-W
      // now takes the mid-cluster alley through the bowls.
      const around = wasdShopPath(ax, ay);
      if (around && around.length) {
        const n = around[0];
        const pdx = n.x - player.x, pdy = n.y - player.y, pd = Math.hypot(pdx, pdy);
        if (pd > 8) { ax = pdx / pd; ay = pdy / pd; }
      }
    } else if (mouse.down && !mouse.ui && !mouse.acted && state.mode === "play" && mouse.held > 0.16) {
      if (state.scene === "ocean" && !bagIsFull()) {
        // Hold is scoop. Never dash or buoyancy-steer from the same drag.
      } else {
        clearWalk();
        if (inWorldPlayfield(mouse.x)) {
          const w = screenToWorld(mouse.x, mouse.y);
          const dest = state.scene === "shop" ? snapToShopWalk(w.x, w.y, w) : w;
          const dx = dest.x - player.x, dy = dest.y - player.y, d = Math.hypot(dx, dy);
          if (d > 8) { ax = dx / d; ay = dy / d; }
        }
      }
    } else if (player.goto && state.mode === "play") {
      const dx = player.goto.x - player.x, dy = player.goto.y - player.y, d = Math.hypot(dx, dy);
      if (d < 22) {
        if (player.route && player.route.length > 1) {
          player.route.shift();
          player.goto = player.route[0];
        } else if (state.scene === "shop") {
          if (!performPendingAct()) {
            tryStockOnArrival();
            tryUnlockOnArrival();
          }
          // stockTank may have handed us a new cashier walk — keep that dest.
          if (player.goto && Math.hypot(player.goto.x - player.x, player.goto.y - player.y) < 22) {
            clearWalk();
            if (player.pendingAct && !canPerformAct(player.pendingAct)) player.pendingAct = null;
          }
        } else {
          clearWalk();
        }
      }
      if (player.goto) {
        const rdx = player.goto.x - player.x, rdy = player.goto.y - player.y, rd = Math.hypot(rdx, rdy);
        if (rd > 8) { ax = rdx / rd; ay = rdy / rd; }
      }
    }
    const accel = player.goto ? (diveWalkQueued() ? DIVE_WALK_ACCEL : 2200) : 1650;
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
    const moving = sp > 18;
    const wantLean = moving ? Math.cos(player.facing) * clamp(sp / max, 0, 1) * (ocean ? 0.16 : 0.26) : 0;
    player.lean = lerp(player.lean || 0, wantLean, 1 - Math.pow(0.0004, dt));
    // C123 — only commit a new facing when horizontal heading is
    // clear. Hold last facing on N/S walks so wantFlip does not
    // chatter near Math.cos(facing) ≈ 0. Lerp a full reverse in
    // ~220–280ms so the body turns, not a paper-card snap.
    // loop 123 body turn not paper flip
    const hx = Math.cos(player.facing);
    let wantFlip;
    if (hx < -0.38) wantFlip = -1;
    else if (hx > 0.38) wantFlip = 1;
    else {
      const cur = player.faceS;
      wantFlip = (cur == null || !isFinite(cur) || Math.abs(cur) < 1e-6) ? 1 : (cur < 0 ? -1 : 1);
    }
    if (player.faceS == null || !isFinite(player.faceS)) player.faceS = wantFlip;
    player.faceS = lerp(player.faceS, wantFlip, 1 - Math.pow(0.00004, dt));
    // loop 141 real diving angle — the diver used to lean at most ~27°, so
    // he always read as swimming flat on his belly. Let the vertical velocity
    // pitch him toward a genuine head-down dive / head-up ascent.
    const wantPitch = ocean ? clamp(player.vy / 120, -0.85, 0.85) : 0;
    player.pitch = lerp(player.pitch || 0, wantPitch, 1 - Math.pow(0.0018, dt));
    if (ocean) {
      // Flutter-kick even while scooping / hovering — a frozen swim frame
      // reads as a standing sticker.
      player.walkPhase += dt * (moving ? 11.6 : 7.2) * (moving ? clamp(sp / 90, 0.7, 1.8) : 1);
    } else if (moving) {
      player.walkPhase += dt * 11.2 * clamp(sp / 90, 0.5, 1.7);
    }
    player.bob += dt * (ocean ? 7 : 9) * (moving ? 1 : 0.22);
    if (ocean) {
      const drift = wreckCurrentX(player.x, player.y);
      if (drift) player.x += drift * dt;
      player.x = clamp(player.x, 60, OCEAN.w - 60);
      player.y = clamp(player.y, 90, OCEAN.h - 60);
      // loop 148 — the chest is a cone scoop, not a walk-by.
      if (bubbles.length < 40 && Math.random() < dt * 7) {
        bubbles.push({
          x: player.x + Math.cos(player.facing) * 16,
          y: player.y + Math.sin(player.facing) * 16,
          r: rand(1.5, 3), v: rand(30, 50), ph: rand(0, 5),
        });
      }
    } else {
      constrainShop();
      const stepped = Math.hypot(player.x - ox, player.y - oy);
      if ((ax || ay) && stepped < 0.45 && player.goto) {
        // Click-walk only. WASD / hold-steer must not be hijacked onto
        // the ribbon goal — that path portal sat inside the tank glass
        // and froze plaza Arrow keys at Turtle.
        player.blockT = (player.blockT || 0) + dt;
        if (player.blockT > 0.16) {
          const tgt = currentGoal() && currentGoal().target;
          if (tgt) {
            const path = shopPath(ox, oy, tgt.x, tgt.y);
            const n = path && path[0];
            if (n) {
              const pdx = n.x - ox, pdy = n.y - oy, pd = Math.hypot(pdx, pdy);
              if (pd > 8) {
                player.x = ox; player.y = oy;
                player.vx += (pdx / pd) * 2200 * dt;
                player.vy += (pdy / pd) * 2200 * dt;
                const sp2 = Math.hypot(player.vx, player.vy);
                if (sp2 > max) { player.vx *= max / sp2; player.vy *= max / sp2; }
                player.x += player.vx * dt; player.y += player.vy * dt;
                constrainShop();
              }
            }
          }
        }
      } else {
        player.blockT = 0;
      }
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
  // C57 — walkable wood only. The painted harbor (sky / hills / roofs) is a
  // backdrop. Old plaza box (y=118–890, full shop width) let the walker
  // stand in the skyline; dock min y=860 let them step off the boards
  // onto the painting. C71 — the east dock finger (x past 1260 / y past
  // 1010) was open water past the last plank. C72 — walk rect matches
  // the painted boards exactly so snap cannot lift feet off the grain.
  // C73 — east walk stays on this dock. The plaza east deck is north,
  // up the aisle — not a sideways yank into the navy gap.
  // C76 — dock snap must not trap a walker heading up the aisle / to a
  // tank. Prefer dock only for dock dests and east-west board walks.
  function shopDockWalk() {
    // Painted dock: drawPierBoards(500, 890, 760, 130). Last plank x=1260.
    // loop 127 DIVE works on the dock
    // Boards include the DIVE pad (dockWalkPoint y=1008).
    // Do not shrink south of that pad. Do not extend into ocean.
    // C128 does not extend the main dock into ocean. West walk is
    // shopWestDockWalk (drawPierBoards 140,760,180,110).
    return { x: 500, y: 890, w: 760, h: 130 };
  }
  function shopWestDockWalk() {
    // Painted west finger: drawPierBoards(140, 760, 180, 110).
    // loop 128 walk the west dock
    // C125 called this water. It is boards. Ocean is south
    // of y=870 and west of the main dock (x < 500).
    return { x: 140, y: 760, w: 180, h: 110 };
  }
  function onWestDockWalk(x, y) {
    const w = shopWestDockWalk();
    return x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h;
  }
  function westDockTapWanted(wx, wy) {
    // loop 129 west dock tap walks west
    // C108 plaza remap is north-to-bowls, not a left tap toward
    // the painted west finger (140,760,180,110).
    if (!player || player.y <= 800) return false;
    if (onWestDockWalk(wx, wy)) return true;
    if (wx < 500 && wy > 720 && wy < 930) return true;
    if (wx < player.x - 56 && wx < 700 && wy > 740 && wy < 930) return true;
    return false;
  }
  function onEastDockWalk(x, y) {
    // POP / OPEN / bait hut / east boards. wy 870–899 is the
    // top of the hut, still the east walk — not the plaza.
    // y≥820 keeps C108's upper-third world Y (≈725–760) as north.
    return x >= 960 && x <= 1260 && y >= 820 && y <= 1020;
  }
  function eastDockTapWanted(wx, wy) {
    // loop 130 east dock tap walks east
    // C108 plaza remap is north-to-bowls, not a right tap toward
    // POP / OPEN / bait hut (996–1124, y≈870–960).
    if (!player || player.y <= 800) return false;
    if (onEastDockWalk(wx, wy)) return true;
    if (wx > 960 && wy > 820 && wy < 1020) return true;
    if (wx > player.x + 56 && wx > 880 && wy > 740 && wy < 1020) return true;
    return false;
  }
  function shopWalkRects() {
    const dock = shopDockWalk();
    const clear = walkClearY();
    const neighborhood = { x: 300, y: clear, w: 900, h: 800 - clear };
    const turtle = { x: 1100, y: clear, w: 300, h: 378 - clear };
    const westShop = { x: 136, y: 380, w: 208, h: 286 };
    const eastShop = { x: 1256, y: 380, w: 228, h: 286 };
    const westRamp = { x: 120, y: 680, w: 220, h: 180 };
    const aisle = { x: 764, y: 740, w: 248, h: 180 };
    if (!galleryOpen()) {
      return [neighborhood, turtle, westShop, eastShop, westRamp, aisle, dock];
    }
    // C101 — live gallery bowls fill the old fat neighborhood. One rect
    // made shopPath treat Puffer as a straight hop through glass; tank 11
    // then pinned a dock walker at y≈788. Walk the south aprons.
    // C102 — C101's west spine (x=300, w=42) sat on the till / water
    // west of column 0 (tanks start at 340). North from the Dolphin
    // apron followed that spine into REGISTER instead of the Puffer
    // pad. Spine sits east of the 4-tank cluster (right edge 1204),
    // in the real aisle beside the bowls — not the till. Aprons reach
    // 1260 so they overlap that spine; columns still have no N–S alley.
    // C103 — hold-W never took that spine (dead-end on Dolphin y≈776).
    // C104 — that spine is not a Puffer taxi. wasdShopPath steers
    // hold-W to nextLockedTank() (Seahorse after Turtle). Click-to-walk
    // Puffer stays.
    // C105 — columns still have no N–S alley. The C102 east spine
    // (x=1204–1260) is a scenic lap: Dolphin y≈776, then the whole
    // row-2 apron past Soon-Puffer, then Seahorse. A west lane sits
    // just east of the painted desk (x=322–348), not C101's till dump
    // (x=300, w=42) and not the east-shop sky yank. The padded till
    // collider stops at 300 so a r=16 walker fits beside column 0.
    // shopPath picks the shorter wood walk, so hold-W from the dock
    // reaches tankWalkPoint(nextLocked) without the east lap.
    // C106 — that shorter walk was still the till slot. Row-gap bands
    // between row 3 (y≈596) and row 2 (y≈380) are the row-2 apron —
    // they cannot pierce the row-3 bowl wall. The aisle
    // {x:764,y:740,w:248,h:180} still stops short of the bowls so it
    // cannot become a Puffer taxi along y=568. A mid-cluster alley
    // sits in the col-0 / col-1 gap (x=528–580), west of Soon-Puffer.
    // Columns still overlap 8px — this is not an un-cluster.
    const row1 = { x: 300, y: clear, w: 960, h: 36 };
    const row2 = { x: 300, y: 548, w: 960, h: 44 };
    const row3 = { x: 300, y: 764, w: 960, h: 36 };
    const alley = { x: 528, y: clear, w: 52, h: 800 - clear };
    const westLane = { x: 322, y: clear, w: 26, h: 800 - clear };
    const spine = { x: 1204, y: clear, w: 56, h: 800 - clear };
    return [row1, row2, row3, alley, westLane, spine, turtle, westShop, eastShop, westRamp, aisle, dock];
  }
  function snapToShopWalk(x, y, destHint) {
    const rects = shopWalkRects();
    const dock = shopDockWalk();
    // Prefer the band the walker is already on. At the east dock lip the
    // east shop deck (y≈380–666) is closer in X than it looks, and a
    // naive nearest-rect yank lifted her ~150px onto sky / empty wood.
    // C76 — do not trap a dock walker heading up the aisle or to a tank.
    // loop 125 one shore no water-walk boat tap only
    // Dock feet stay on painted wood. C128 — westRamp / west finger
    // are boards (ocean is y>870 west of x=500). eastShop is a plaza
    // deck — not a dock snap onto ocean.
    const dest = destHint || (player && player.goto) ||
      (player && player.route && player.route.length ? player.route[player.route.length - 1] : null);
    const onAisle = player && onAisleWalk(player.x, player.y);
    const headingPlaza = destWantsPlaza(dest) || onAisle;
    const keyedNS = keys && (keys.has("w") || keys.has("s") ||
      keys.has("arrowup") || keys.has("arrowdown"));
    const keyedEW = keys && (keys.has("a") || keys.has("d") ||
      keys.has("arrowleft") || keys.has("arrowright")) && !keyedNS;
    const preferDock = player && player.y > 820 && !onAisle && !headingPlaza &&
      (destWantsDock(dest) || keyedEW || !dest);
    const dockFeet = !!(player && player.y > 820 && !onAisle && !headingPlaza);
    function skipWater(rc) {
      if (rc.x + rc.w < dock.x && rc.y >= 870) return true;
      if ((dockFeet || preferDock) && rc.x >= 1240 && rc.y < 420) return true;
      return false;
    }
    if ((dockFeet || preferDock) && (y > dock.y + dock.h || x < dock.x || x > dock.x + dock.w)) {
      // C128 — west finger is painted boards. Do not clamp onto the
      // main dock. Still clamp real ocean (south of dock, or x < 140,
      // or x < 500 && y > 870).
      const destOnWest = !!(dest && onWestDockWalk(dest.x, dest.y));
      const allowWest = onWestDockWalk(x, y) ||
        (player && onWestDockWalk(player.x, player.y)) || destOnWest;
      const realOcean = y > dock.y + dock.h || x < 140 || (x < 500 && y > 870);
      if (!allowWest || realOcean) {
        return {
          x: clamp(x, dock.x + 8, dock.x + dock.w - 8),
          y: clamp(y, dock.y + 8, dock.y + dock.h - 8),
        };
      }
    }
    for (let i = 0; i < rects.length; i++) {
      const rc = rects[i];
      if (skipWater(rc)) continue;
      if (x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h) {
        /* Dock walker heading along the pier must not accept east empty
           wood just because the tank neighborhood now sits nearer the aisle. */
        if (preferDock && eastShopNavyGap(x, y)) break;
        return { x: x, y: y };
      }
    }
    const keyed = !!(keyedNS || keyedEW);
    let bestD = 1e15, nx = x, ny = y;
    for (let i = 0; i < rects.length; i++) {
      const rc = rects[i];
      if (skipWater(rc)) continue;
      const cx = clamp(x, rc.x, rc.x + rc.w);
      const cy = clamp(y, rc.y, rc.y + rc.h);
      let d = (cx - x) * (cx - x) + (cy - y) * (cy - y);
      if (player && player.y > 820 && eastShopNavyGap(cx, cy)) d += 520 * 520;
      if (preferDock && cy < 820 && !onAisleWalk(cx, cy)) {
        d += (keyed ? 520 : 360) * (keyed ? 520 : 360);
      }
      if (d < bestD) { bestD = d; nx = cx; ny = cy; }
    }
    return { x: nx, y: ny };
  }
  function shopRectOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function shopRectHas(rc, x, y) {
    return x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h;
  }
  function shopPortal(a, b) {
    const x0 = Math.max(a.x, b.x), x1 = Math.min(a.x + a.w, b.x + b.w);
    const y0 = Math.max(a.y, b.y), y1 = Math.min(a.y + a.h, b.y + b.h);
    let x = (x0 + x1) * 0.5;
    let y = (y0 + y1) * 0.5;
    // Sit on the south lip so a tank-row overlap is not a gate inside glass.
    const clear = walkClearY();
    if (y1 > clear && y < clear) y = Math.min(y1 - 4, Math.max(clear + 8, y0 + 4));
    return { x: x, y: y };
  }
  function wasdShopPath(ax, ay) {
    // C103 — hold W (no A/D) from south of the bowls. Columns have
    // no N–S alley, so raw north dies on the Dolphin apron.
    // C104 — do not magnet to Soon-Puffer (index 6). Steer to the next
    // locked live bowl — Seahorse (5) after Turtle. Click-to-walk a
    // Soon tank still routes there. No out-of-order unlock.
    // C105 — shopPath uses the west lane, so this is not the east-spine
    // taxi that occupied Soon-Puffer on the way to Seahorse.
    // C106 — shopPath now prefers the mid-cluster alley, so hold-W
    // does not taxi to the till / west lane as the first hop.
    if (!galleryOpen()) return null;
    if (!(ay < -0.5 && Math.abs(ax) < 0.2)) return null;
    if (!player) return null;
    const i = nextLockedTank();
    if (i < 0 || !tankLive(i)) return null;
    const pad = tankWalkPoint(i);
    // Cut out on the pad itself, or once north of that row (row-1 /
    // Turtle). Do not cut out on the east spine at the same Y.
    if (Math.hypot(player.x - pad.x, player.y - pad.y) < 28) return null;
    const onPadRow = player.y >= pad.y - 20 && player.y <= pad.y + 24;
    if (player.y <= pad.y + 12 && !onPadRow) return null;
    const path = shopPath(player.x, player.y, pad.x, pad.y);
    if (!path || !path.length) return path;
    // Already standing on the current portal (row-3 / spine overlap) —
    // take the next hop or we oscillate at y≈776 and never turn north.
    const n = path[0];
    const pd = Math.hypot(n.x - player.x, n.y - player.y);
    if (pd <= 22 && path.length > 1) return path.slice(1);
    return path;
  }
  function shopPath(sx, sy, dx, dy) {
    // C105 — hop cost is walking distance, not first-found BFS. The
    // east spine is one hop from row-3, so unweighted search always
    // taxied the C102 wall even when the dest was Seahorse (west).
    // C106 — the west portal was still the shortest until the
    // mid-cluster alley opened a wood N–S through the bowls.
    const rects = shopWalkRects();
    const dest = { x: dx, y: dy };
    const start = snapToShopWalk(sx, sy, dest);
    const end = snapToShopWalk(dx, dy, dest);
    let si = -1, ei = -1;
    for (let i = 0; i < rects.length; i++) {
      if (si < 0 && shopRectHas(rects[i], start.x, start.y)) si = i;
      if (ei < 0 && shopRectHas(rects[i], end.x, end.y)) ei = i;
    }
    if (si < 0 || ei < 0 || si === ei) return [end];
    const INF = 1e15;
    const dist = [], prev = [], viaX = [], viaY = [], used = [];
    for (let i = 0; i < rects.length; i++) {
      dist[i] = INF; prev[i] = -1; viaX[i] = start.x; viaY[i] = start.y;
    }
    dist[si] = 0;
    prev[si] = si;
    for (let n = 0; n < rects.length; n++) {
      let u = -1, best = INF;
      for (let i = 0; i < rects.length; i++) {
        if (!used[i] && dist[i] < best) { best = dist[i]; u = i; }
      }
      if (u < 0) break;
      used[u] = true;
      if (u === ei) break;
      const ux = u === si ? start.x : viaX[u];
      const uy = u === si ? start.y : viaY[u];
      for (let v = 0; v < rects.length; v++) {
        if (used[v] || v === u || !shopRectOverlap(rects[u], rects[v])) continue;
        const p = shopPortal(rects[u], rects[v]);
        let cost = dist[u] + Math.hypot(p.x - ux, p.y - uy);
        if (v === ei) cost += Math.hypot(end.x - p.x, end.y - p.y);
        if (cost < dist[v]) {
          dist[v] = cost;
          prev[v] = u;
          viaX[v] = p.x;
          viaY[v] = p.y;
        }
      }
    }
    if (prev[ei] < 0) return [end];
    const chain = [];
    for (let v = ei; v !== si; v = prev[v]) chain.push(v);
    chain.reverse();
    const pts = [];
    let cur = si;
    for (let i = 0; i < chain.length; i++) {
      pts.push(shopPortal(rects[cur], rects[chain[i]]));
      cur = chain[i];
    }
    pts.push(end);
    return pts;
  }
  function clearWalk() {
    player.goto = null;
    player.route = null;
  }
  function setWalkDest(pt) {
    if (!pt) { clearWalk(); return; }
    if (state.scene !== "shop") {
      player.route = null;
      player.goto = pt;
      return;
    }
    const path = shopPath(player.x, player.y, pt.x, pt.y);
    player.route = path;
    player.goto = path && path[0] ? path[0] : pt;
  }
  function constrainShop() {
    const r = player.radius;
    const snapped = snapToShopWalk(player.x, player.y);
    player.x = snapped.x;
    player.y = snapped.y;
    const dock = shopDockWalk();
    const west = shopWestDockWalk();
    // loop 125 one shore no water-walk boat tap only
    // Dock walker: do not let the wide shop clamp walk them onto water.
    // C128 — west finger uses west.x+r … dock.right-r, not dock.x+r.
    const dest = (player && player.goto) ||
      (player && player.route && player.route.length ? player.route[player.route.length - 1] : null);
    const headingWest = onWestDockWalk(player.x, player.y) ||
      !!(dest && onWestDockWalk(dest.x, dest.y));
    if (player.y > 820 && !onAisleWalk(player.x, player.y)) {
      if (headingWest) {
        player.x = clamp(player.x, west.x + r, dock.x + dock.w - r);
      } else {
        player.x = clamp(player.x, dock.x + r, dock.x + dock.w - r);
      }
    } else {
      player.x = clamp(player.x, 90 + r, shopWalkMax() + 48);
    }
    player.y = clamp(player.y, walkClearY() + r, dock.y + dock.h);
    for (let i = 0; i < SPECIES.length; i++) {
      if (!tankLive(i)) continue;
      const t = TANK_POS[i];
      // C101 — collide with the bowl, not a 28px south pad that sealed
      // the C76 row gaps. Feet stay on the apron in front of the glass.
      // C106 — inset the col-0 right / col-1 left faces so a r=16
      // walker fits the mid-cluster alley. Other faces stay full bowl.
      if (galleryOpen() && t.x === TANK_POS[0].x) {
        pushOut(t.x, t.y, TANK_W - 22, TANK_H + 8);
      } else if (galleryOpen() && t.x === TANK_POS[1].x) {
        pushOut(t.x + 22, t.y, TANK_W - 22, TANK_H + 8);
      } else {
        pushOut(t.x, t.y, TANK_W, TANK_H + 8);
      }
    }
    // C105 — padded desk ended at x=324, 16px from column 0 (340). A
    // r=16 walker cannot pass that pinch (C101 till dump). Painted
    // counter stays; collider stops at 300 so the west lane fits.
    pushOut(REGISTER.x - 6, REGISTER.y - 6, REGISTER.w - 12, REGISTER.h + 12);
    pushOut(KIOSK.x - 6, KIOSK.y - 6, KIOSK.w + 12, KIOSK.h + 12);
    pushOut(WELCOME.x, WELCOME.y, WELCOME.w, WELCOME.h);
    // C128 — life ring at 512,918 is a small prop, not a west-dock wall.
    pushOut(498, 900, 28, 28);
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
  function walkClearY() {
    // South of the core-row pushOut box (t.y-8 + TANK_H+28 = 340).
    return TANK_POS[0].y - 8 + TANK_H + 28 + 4;
  }
  function tankWalkPoint(i) {
    const t = TANK_POS[i] || TANK_POS[0];
    const y = Math.max(t.y + TANK_H + 32, walkClearY() + 16);
    return { x: t.x + TANK_W / 2, y: y };
  }
  function galleryTankDest(i) {
    if (i >= CORE_SPECIES && !galleryOpen() && !isWreckSpecies(i)) {
      const t = TANK_POS[4];
      toast("Unlock Sea Turtle first — it opens the tanks next to the aisle", "#ffe27a", 2.8);
      nope({
        tank: 4,
        x: t.x + TANK_W / 2,
        y: t.y + 36,
        msg: "Turtle first",
      });
      return tankWalkPoint(4);
    }
    return tankWalkPoint(i);
  }
  function tankAtAny(wx, wy) {
    // Only tanks that are actually painted. C76 parked gated gallery
    // tanks on the plaza walk deck (row y=380). Hitting those invisible
    // boxes remapped every free-deck click to Turtle.
    for (let i = 0; i < SPECIES.length; i++) {
      if (!tankLive(i)) continue;
      const t = TANK_POS[i];
      if (!t) continue;
      if (wx > t.x - 8 && wx < t.x + TANK_W + 8 && wy > t.y - 8 && wy < t.y + TANK_H + 28) return i;
    }
    return -1;
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
      if (speciesUnlocked(i) && bagCanStock(i) && nearStockPad(i)) stockTank(i);
    }
  }
  function tryUnlockOnArrival() {
    // C109 — occupying tankWalkPoint(nextLockedTank()) is not a buy.
    // Phone north tap / ↑ SHOP used to auto-spend ($4000 → $1800,
    // SEAHORSE UNLOCKED) because tryUnlockOnArrival treated any pad
    // arrival as confirm. Desktop hold-W never buys. Walk ≠ buy
    // unless they explicitly tapped the locked bowl / lock plate.
    const i = nextLockedTank();
    if (i < 0 || speciesUnlocked(i) || !nearStockPad(i)) return;
    if (state.money < SPECIES[i].unlock) return;
    if (player.unlockConfirm !== i) return;
    buyTank(i);
    player.unlockConfirm = null;
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
  function maybeWreckRumor() {
    if (state.wreckHinted || state.sawWreck) return;
    if (!state.didFirstStock) return;
    state.wreckHinted = true;
    toast("A wreck lies east of the shallows.", "#f4d06a", 4.4);
    persist();
  }
  function maybeTangRumor() {
    if (state.unlocked[1] || state.tangRumor) return;
    if (!state.didFirstStock) return;
    state.tangRumor = true;
    state.tangHintDone = false;
    state.tangHintLife = 4.2;
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
  function seedWreckTease() {
    if (state.sawWreck || state.expedition) return;
    if ((state.divesThisSession | 0) < 2 && !state.didFirstStock) return;
    for (let i = oceanFish.length - 1; i >= 0; i--) {
      if (oceanFish[i].tease && oceanFish[i].s === 13) oceanFish.splice(i, 1);
    }
    const x = clamp(player.x + 420, 1680, WRECK.x - 80);
    const y = clamp(player.y + 36, 340, 700);
    oceanFish.push({
      s: 13, x, y, vx: 32, vy: -4, ang: 0.08, ph: rand(0, 8), fleeT: 0, caught: false, tease: true,
    });
  }
  function maybeLanternRumor() {
    if (state.lanternRumor || !state.sawWreck) return;
    state.lanternRumor = true;
    toast("Nico wants a lanternfish from the wreck", "#f4d06a", 4.2);
    let nico = null;
    for (const c of customers) {
      if (c.name === "Nico") {
        c.emote = "Lantern!";
        c.teaseLantern = true;
        c.favorite = 13;
        c.tank = 13;
        c.payMult = 2;
        nico = c;
      }
    }
    if (!nico && customers.length < MAX_CUSTOMERS) {
      customers.push(newCustomer({
        x: 760, y: 1096, state: "browse", tank: 13, hops: 8, offX: -20,
        name: "Nico", regular: true, favorite: 13, emote: "Lantern!",
        teaseLantern: true, payMult: 2,
      }));
    }
    persist();
  }
  function hangWreckLamp() {
    // loop 149 — Nico's lantern comes home to the pier. One hang.
    if (state.wreckLamp) return;
    state.wreckLamp = true;
    spawnP(WRECK_LAMP.x, WRECK_LAMP.y + 20, 22, ["#ffe27a", "#f4d06a", "#fff6e8", "#9ef0ff"], 90);
    pop(WRECK_LAMP.x, WRECK_LAMP.y - 8, "Nico's lantern", "#f4d06a");
    sfx("unlock");
    toast("Nico hung a lantern on the east dock", "#f4d06a", 3.4);
    persist();
    maybeNightGuest();
  }
  function maybeNightGuest() {
    // loop 150 — the hung wreck lantern calls Sable. Continue with
    // wreckLamp already true still sprouts her under the eave.
    if (!state.wreckLamp || state.mode !== "play") return;
    if (state.scene !== "shop") return;
    if ((state.sableCd || 0) > 0) return;
    for (const c of customers) if (c.name === "Sable") return;
    if (customers.length >= MAX_CUSTOMERS) return;
    const want = ((state.stock && state.stock[13]) | 0) > 0 ? 13 : 0;
    customers.push(newCustomer({
      x: 1320, y: 1040, state: "lamp", tank: want, hops: 6, offX: -16,
      name: "Sable", regular: true, favorite: want, nightGuest: true,
      payMult: 2, emote: "the light!",
    }));
    if (!state.sableHinted) {
      state.sableHinted = true;
      toast("The lantern called a night guest", "#c4a0ff", 3.2);
    }
  }
  function openWreckChest() {
    if (!state.wreckChestReady) return;
    state.wreckChestReady = false;
    state.sessionChest = true;
    const pay = 50;
    state.money += pay;
    state.moneyRollFrom = state.displayMoney;
    state.moneyRollTo = state.money;
    state.moneyRollT = 0.35;
    state.moneyPunch = 1.28;
    spawnP(WRECK_CHEST.x, WRECK_CHEST.y, 26, ["#ffe27a", "#f4d06a", "#fff6e8", "#9ef0ff"], 110);
    pop(WRECK_CHEST.x, WRECK_CHEST.y - 22, "Pearls! +$" + pay, "#ffe27a");
    sfx("unlock");
    toast("Pearls! +$" + pay, "#ffe27a", 2.6);
    if (state.bag.length < bagMax()) {
      state.bag.push(13);
      if (!state.bagRare) state.bagRare = [];
      state.bagRare.push(false);
      if (!state.caughtCount || state.caughtCount.length < SPECIES.length) {
        state.caughtCount = padSpeciesNums(state.caughtCount);
      }
      state.caughtCount[13] = (state.caughtCount[13] | 0) + 1;
      state.lifetimeCatches = (state.lifetimeCatches | 0) + 1;
      state.diveCatches = (state.diveCatches | 0) + 1;
      state.sessionDiveCatch = (state.sessionDiveCatch | 0) + 1;
      state.bagPunch = 1.28;
      pop(WRECK_CHEST.x + 18, WRECK_CHEST.y - 40, "Lanternfish!", "#f4d06a");
      toast("A lantern slipped out!", "#f4d06a", 2.8);
    } else {
      pushOceanFish(13, WRECK_CHEST.x + 24, WRECK_CHEST.y - 20);
      toast("Bag full — a lantern darted out", "#f4d06a", 2.6);
    }
    player.catchProg = 0;
    player.target = null;
    player.scoopLock = null;
    player.scoopTap = false;
    player.catchLatch = true;
    maybeLanternRumor();
    checkSessionGoals();
    persist();
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
        if (speciesUnlocked(i) && nearStockPad(i)) stockTank(i);
      }
    } else {
      tryStockOnArrival();
    }
    if (tillWaiting() && inTillGlow() && !cashierHandlingIt()) {
      if (player.pendingAct && player.pendingAct.kind === "cash") {
        player.pendingAct = null;
        player.tillDwell = 0;
        collectCash();
      } else {
        player.tillDwell = (player.tillDwell || 0) + (dt || 0);
        if (player.tillDwell >= 0.3) {
          player.tillDwell = 0;
          collectCash();
        }
      }
    } else {
      player.tillDwell = 0;
    }
  }
  function stockTank(i) {
    if (!speciesUnlocked(i)) return;
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
    if ((state.diveForTank | 0) === i) clearDiveForTank();
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
    if (!state.didFirstStock) { state.didFirstStock = true; maybeBookTease(); maybeTangRumor(); maybeWreckRumor(); }
    if (state.tutorial === 3) state.tutorial = 4;
    let converted = false;
    for (const c of customers) {
      if (c.state !== "browse") continue;
      if (c.teaseTang && !state.unlocked[1]) continue;
      if (c.teaseLantern && ((state.stock && state.stock[13]) | 0) === 0) continue;
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
      player.pendingAct = { kind: "cash" };
      setWalkDest(dest);
      seedPathCoins([[player.x, player.y], [520, 380], [dest.x, dest.y]], 3);
    }
  }
  function dismissSaleHints() {
    state.tillSlip = null;
    for (let i = state.toasts.length - 1; i >= 0; i--) {
      if (/collect|→\s*till|till\s*·|receipt/i.test(state.toasts[i].msg || "")) {
        state.toasts.splice(i, 1);
      }
    }
    for (let i = pops.length - 1; i >= 0; i--) {
      if (/collect|→\s*till/i.test(pops[i].text || "")) pops.splice(i, 1);
    }
    for (let i = hudPops.length - 1; i >= 0; i--) {
      if (/collect|→\s*till/i.test(hudPops[i].text || "")) hudPops.splice(i, 1);
    }
  }
  function collectCash(fromStaff) {
    const got = state.registerCash;
    if (got <= 0) { dismissSaleHints(); return; }
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
    dismissSaleHints();
    holdTillView(1.9);
    if (!fromStaff && !state.missionDone && !bagHasStockable()) {
      walkToDock();
      seedPathCoins([[player.x, player.y], [720, 640], [880, 1008]], 2);
    } else if (!state.hiredCashier && !bagHasStockable() && (state.tutorial | 0) <= 5) {
      seedPathCoins([[player.x, player.y], [720, 640], [880, 1008]], 2);
    }
  }
  function armOrBuy(id, fn) {
    if (!portraitStage() && !compactHud()) {
      fn();
      return;
    }
    if (upgradeArm.id === id && upgradeArm.t > 0) {
      upgradeArm.id = "";
      upgradeArm.t = 0;
      fn();
      persist();
      return;
    }
    upgradeArm.id = id;
    upgradeArm.t = 2.6;
    toast("Tap again to buy", "#ffe27a", 1.8);
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
    if (speciesUnlocked(i)) return;
    if (i >= CORE_SPECIES && !galleryOpen() && !isWreckSpecies(i)) {
      confirmUnlockWalk(galleryTankDest(i), 4);
      return;
    }
    if (!nearStockPad(i)) { confirmUnlockWalk(tankWalkPoint(i), i); return; }
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
      toast("New tanks opened next to the aisle", "#ffe27a", 3.6);
      toast("Deeper zones stacked under the meadow", "#9ef0ff", 3.2);
      state.aisleSchoolWait = Math.max(state.aisleSchoolWait || 0, 0.95);
    } else if (isWreckSpecies(i)) {
      toast("Lanterns haunt the wreck to the east", "#f4d06a", 3.2);
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
    // C111 — empty new bowl: cue DIVE for this species. Do not
    // auto-dive and do not arm the next lock. loop 111 dive for the new bowl.
    armDiveForTank(i);
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
  const DIVER_TANK_CAP = 8;
  function diverStockTarget() {
    // Fill the emptiest unlocked tank so the whole shop keeps selling.
    let best = -1, bestStock = 1e9;
    for (let s = 0; s < SPECIES.length; s++) {
      if (!speciesUnlocked(s)) continue;
      const st = state.stock[s] | 0;
      if (st < bestStock) { bestStock = st; best = s; }
    }
    return bestStock < DIVER_TANK_CAP ? best : -1;
  }
  function diverStockOne(i) {
    if (i < 0 || !speciesUnlocked(i)) return false;
    state.stock[i] = (state.stock[i] | 0) + 1;
    if (tankFish[i].length < 10) {
      tankFish[i].push({ x: rand(24, TANK_W - 24), y: rand(36, TANK_H - 18), a: rand(0, 6), ph: rand(0, 20) });
    }
    // A small splash in the tank so a delivered fish reads as "a diver
    // just dropped this off". loop 146 also sends a crew NPC to that bowl.
    const t = TANK_POS[i];
    tankRipples.push({ x: t.x + TANK_W / 2, y: t.y + TANK_H * 0.4, life: 0.5, max: 0.5 });
    return true;
  }
  function crewHome(i) {
    // On the painted dock boards, left of the DIVE pad — not in the foam.
    return { x: 760 + (i | 0) * 40, y: 972 };
  }
  function crewTankPoint(tank, i) {
    const t = TANK_POS[tank] || TANK_POS[0];
    return { x: t.x + TANK_W / 2 + 22 + ((i | 0) % 2) * 12, y: t.y + TANK_H + 38 };
  }
  function syncCrew() {
    const n = clamp(state.diverLv | 0, 0, DIVER_MAX);
    while (crew.length > n) crew.pop();
    while (crew.length < n) {
      const i = crew.length;
      const home = crewHome(i);
      const look = CREW_LOOKS[i % CREW_LOOKS.length];
      crew.push({
        x: home.x, y: home.y, vx: 0, destX: home.x, destY: home.y,
        tank: -1, carry: -1, bob: i * 1.7, job: "dock", wait: 0,
        shirt: look.shirt, hair: look.hair, skin: look.skin,
        hat: look.hat, hairCut: look.hairCut, goggles: true, crew: true,
      });
    }
  }
  function sendCrewToTank(tank) {
    if (!crew.length) return;
    let best = 0, bestScore = -1e9;
    for (let i = 0; i < crew.length; i++) {
      const d = crew[i];
      const idle = d.job !== "tank" ? 200 : 0;
      const t = TANK_POS[tank] || TANK_POS[0];
      const dist = Math.hypot(d.x - (t.x + TANK_W / 2), d.y - (t.y + TANK_H));
      const score = idle - dist * 0.1;
      if (score > bestScore) { bestScore = score; best = i; }
    }
    const d = crew[best];
    d.job = "tank";
    d.tank = tank;
    d.carry = tank;
    d.wait = 0;
    const p = crewTankPoint(tank, best);
    d.destX = p.x;
    d.destY = p.y;
  }
  function updateCrew(dt) {
    syncCrew();
    for (let i = 0; i < crew.length; i++) {
      const d = crew[i];
      d.bob += dt * 10;
      const dx = d.destX - d.x, dy = d.destY - d.y;
      const dist = Math.hypot(dx, dy);
      const speed = 168;
      if (dist > 4) {
        const step = Math.min(dist, speed * dt);
        d.x += (dx / dist) * step;
        d.y += (dy / dist) * step;
        d.vx = (dx / dist) * speed;
      } else {
        d.vx = 0;
        d.x = d.destX;
        d.y = d.destY;
        d.wait = (d.wait || 0) + dt;
        if (d.job === "tank" && d.wait > 0.28) {
          d.carry = -1;
          d.job = "dock";
          d.wait = 0;
          const home = crewHome(i);
          d.destX = home.x;
          d.destY = home.y;
        } else if (d.job === "dock" && d.wait > 1.4) {
          d.wait = 0;
          const home = crewHome(i);
          d.destX = home.x + (Math.random() - 0.5) * 36;
          d.destY = home.y + (Math.random() - 0.5) * 20;
        }
      }
    }
  }
  function updateDivers(dt) {
    syncCrew();
    if (!(state.diverLv > 0)) { state.diverAcc = 0; updateCrew(dt); return; }
    state.diverAcc = (state.diverAcc || 0) + dt;
    // One delivery every ~6s per diver, capped so a big crew is not silly.
    const interval = 6 / Math.min(state.diverLv, DIVER_MAX);
    let guard = 0;
    while (state.diverAcc >= interval && guard++ < 4) {
      state.diverAcc -= interval;
      const i = diverStockTarget();
      if (i < 0) { state.diverAcc = 0; break; }
      diverStockOne(i);
      sendCrewToTank(i);
    }
    updateCrew(dt);
  }
  // loop 145 — offline accrual. Credit what the hired divers would have
  // stocked-and-sold while the tab was closed. Modest and hard-capped so
  // it is a nice "welcome back", never a way to skip the game: no divers →
  // nothing, quick reloads ignored, idle credit capped at 2 hours and at
  // ~30 sales per diver.
  function avgUnlockedPrice() {
    let sum = 0, n = 0;
    for (let s = 0; s < SPECIES.length; s++) if (speciesUnlocked(s)) { sum += SPECIES[s].price; n++; }
    return n ? sum / n : 12;
  }
  function offlineEarnings(elapsedSec) {
    if (!(state.diverLv > 0)) return 0;
    const secs = clamp(elapsedSec, 0, 2 * 3600);
    if (secs < 60) return 0;
    const avg = avgUnlockedPrice();
    const perSec = state.diverLv * avg * 0.012;
    const cap = avg * state.diverLv * 30;
    return Math.max(0, Math.min(Math.floor(perSec * secs), Math.floor(cap)));
  }
  function creditOffline() {
    const away = state.lastPlayed ? (Date.now() - state.lastPlayed) / 1000 : 0;
    const earned = offlineEarnings(away);
    if (earned > 0) {
      state.money += earned;
      state.peakMoney = Math.max(state.peakMoney | 0, state.money | 0);
      toast("Welcome back! Your divers earned $" + earned + " while you were away.", "#ffe27a", 4.8, { big: true });
      // A dedicated banner as well — a toast is masked by the goal ribbon,
      // and a returning player should always see what their crew brought in.
      state.welcomeBack = { amount: earned, life: 5.0 };
      persist();
    }
    state.lastPlayed = Date.now();
  }
  function buyDiver() {
    if (state.diverLv >= DIVER_MAX) return nope({ card: "up-diver" });
    const c = DIVER_COST[state.diverLv];
    if (state.money < c) return nope({ card: "up-diver" });
    state.money -= c;
    state.diverLv++;
    state.diverAcc = 0;
    syncCrew();
    sfx("unlock");
    toast(state.diverLv === 1
      ? "Diver hired! They stock tanks while you dive."
      : "Another diver! Tanks fill faster.", "#ffe27a");
    persist();
    checkSessionGoals();
  }
  function updateReefPresence() {
    if (state.scene !== "ocean") { state.inReef = false; state.inWreck = false; return; }
    if (inWreck(player.x, player.y)) {
      if (!state.inWreck) {
        state.inWreck = true;
        state.zoneTitle = { text: "THE WRECK", life: 0.7, max: 0.7 };
        if (!state.sawWreck) {
          state.sawWreck = true;
          toast("The wreck! Lanterns live here.", "#f4d06a", 3.6);
          state.camPunch = 0.16;
          persist();
          checkSessionGoals();
        }
        maybeLanternRumor();
      }
    } else {
      state.inWreck = false;
    }
    if (!state.unlocked[1]) { state.inReef = false; return; }
    const reef = inReefZone(player.x, player.y) && !inWreck(player.x, player.y);
    if (reef && !state.inReef) {
      state.inReef = true;
      state.zoneTitle = { text: "REEF", life: 0.55, max: 0.55 };
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
        state.zoneTitle = { text: z.name.toUpperCase(), life: 0.55, max: 0.55 };
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
        if (!c.nightGuest) n++;
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
    if (state.sableCd > 0) state.sableCd = Math.max(0, state.sableCd - dt);
    maybeNightGuest();
    ensureDayGuest();
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
          !(c.teaseTang && !state.unlocked[1]) &&
          !(c.teaseLantern && ((state.stock && state.stock[13]) | 0) === 0)) {
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
            if (c.name === "Nico" && (c.carry | 0) === 13) {
              // loop 149 — unique bark + hang the wreck lantern on the east dock
              state.sessionNicoLantern = true;
              c.teaseLantern = false;
              c.saidLine = "from the wreck!";
              hangWreckLamp();
            }
            if (c.name === "Sable") {
              state.sessionSable = true;
              c.saidLine = "the light!";
            }
            if (c.dayGuest && c.name === state.dayGuest && (c.carry | 0) === (state.dayWant | 0)) {
              state.sessionDayGuest = true;
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
                player.pendingAct = { kind: "cash" };
                setWalkDest(registerWalkPoint());
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
            else if (c.teaseLantern && ((state.stock && state.stock[13]) | 0) === 0) c.emote = "Lantern!";
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
      } else if (c.state === "lamp") {
        tx = WRECK_LAMP.x - 20; ty = WRECK_LAMP.y + 54;
        if (Math.hypot(c.x - tx, c.y - ty) < 16) {
          c.emote = "the light!";
          c.wait += dt;
          if (c.wait > 1.6) {
            if ((state.stock && state.stock[13] | 0) > 0) {
              c.tank = 13; c.favorite = 13; c.state = "tank"; c.wait = 0;
            } else {
              const alt = [];
              for (let k = 0; k < SPECIES.length; k++) if (state.stock[k] > 0) alt.push(k);
              if (alt.length) {
                c.tank = pick(alt); c.favorite = c.tank; c.state = "tank"; c.wait = 0;
              } else {
                c.hops = (c.hops || 1) - 1;
                c.wait = 0.4;
                if (c.hops <= 0) { c.state = "leave"; c.emote = "later"; state.sableCd = 8; }
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
        if (c.y > 1120) {
          if (c.nightGuest) state.sableCd = 10;
          customers.splice(i, 1); continue;
        }
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
    if ((state.tangHintLife || 0) > 0) {
      state.tangHintLife = Math.max(0, state.tangHintLife - dt);
      if (state.tangHintLife <= 0) state.tangHintDone = true;
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
    if (upgradeArm.t > 0) {
      upgradeArm.t -= dt;
      if (upgradeArm.t <= 0) { upgradeArm.t = 0; upgradeArm.id = ""; }
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
    if (state.welcomeBack) {
      state.welcomeBack.life -= dt;
      if (state.welcomeBack.life <= 0) state.welcomeBack = null;
    }
    tickDiveForCue(dt);
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
    if (act.kind === "dive") {
      return diveActionLegal();
    }
    return false;
  }
  function performPendingAct() {
    const act = player.pendingAct;
    if (!act || !canPerformAct(act)) return false;
    player.pendingAct = null;
    clearWalk();
    if (act.kind === "stock") stockTank(act.i);
    else if (act.kind === "unlock") buyTank(act.i);
    else if (act.kind === "cash") collectCash();
    else if (act.kind === "dive") beginDive();
    return true;
  }
  function cueDiveWalk() {
    // C87 — tap-landed feedback is the walker chip + pad pulse only.
    // A world pop here lingered at the tap point as a second label.
  }
  function intentWalk(kind, dest, i) {
    const act = { kind, i };
    player.pendingAct = act;
    if (canPerformAct(act)) {
      performPendingAct();
      return true;
    }
    setWalkDest(dest);
    if (kind === "dive") cueDiveWalk();
    return true;
  }
  function confirmUnlockWalk(dest, i) {
    player.unlockConfirm = i;
    return intentWalk("unlock", dest, i);
  }
  function walkToShopBowls() {
    // C109 — north tap / ↑ SHOP walks to the next bowl. Not a buy.
    // Same dest hold-W uses. Do not arm unlockConfirm / pending unlock.
    // C112 — walking back to the tanks cancels the dive-for hunt.
    const dest = nextUnlockWalkDest();
    if (!dest) return false;
    player.pendingAct = null;
    player.unlockConfirm = null;
    clearDiveForHunt();
    setWalkDest(dest);
    return true;
  }
  function tryClickShop(wx, wy) {
    if (state.scene !== "shop" || state.mode !== "play") return false;
    // C108 — pointer-down path. Remap before tankAtWorld so Dolphin 11
    // cannot steal a 390 upper-third tap (ny≈0.12–0.22).
    // C109 — that remap is a walk, not an unlock confirm.
    // C129 — west dock tap walks west, not walkToShopBowls.
    // C130 — east dock tap walks east, not walkToShopBowls.
    if (westDockTapWanted(wx, wy) || onWestDockWalk(wx, wy) ||
        eastDockTapWanted(wx, wy) || onEastDockWalk(wx, wy)) {
      // fall through to normal shop click / snap walk
    } else if (phoneDockPlazaWalkWanted(wx, wy, mouse.pressX, mouse.pressY)) {
      if (walkToShopBowls()) return true;
    }
    const tankHit = walkTankAtWorld(wx, wy);
    if (tankHit >= 0) {
      if (tankHit >= CORE_SPECIES && !galleryOpen()) {
        return confirmUnlockWalk(galleryTankDest(tankHit), 4);
      }
      if (!speciesUnlocked(tankHit)) {
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
        return confirmUnlockWalk(tankWalkPoint(tankHit), tankHit);
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
    const heading = diveWalkQueued();
    if (!haul && !till && !heading) {
      for (let i = pathGlints.length - 1; i >= 0; i--) {
        pathGlints[i].life -= dt * 2.4;
        if (pathGlints[i].life <= 0) pathGlints.splice(i, 1);
      }
      return;
    }
    const pts = haul
      ? [[880, 1000], [880, 820], [880, 640], [663, 568], [445, 352]]
      : heading
        ? [[445, 352], [663, 568], [880, 760], [880, 860], [880, 1008]]
        : [[880, 540], [720, 500], [520, 500], [340, 500], [248, 530]];
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
    sitShadow(x, y, rx, ry, 0.36);
  }
  function groundBlob(x, y, rx, ry) {
    sitShadow(x, y, rx * 1.08, ry * 1.15, 0.36);
  }
  // C43 — painted harbor art. Cached tiles only; no downloaded photos.
  // C51 — a second, taller pier canvas so the dock camera sees roofs, not the
  // water-half of the title painting.
  const paint = { ready: false, wood: null, woodTeal: null, clouds: null, harbor: null, pier: null, planks: null };
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
  function paintUniqueTown(g, w, h, base, sc, worldOx) {
    const s = sc || 1;
    function gable(bx, by, bw, rise, col) {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(bx - 5 * s, by + 4);
      g.lineTo(bx + bw * 0.5, by - rise);
      g.lineTo(bx + bw + 5 * s, by + 4);
      g.closePath();
      g.fill();
    }
    function win(x, y, ww, hh, lit) {
      g.fillStyle = lit ? "#ffe27a" : "#6a90a0";
      g.fillRect(x, y, ww, hh);
      g.strokeStyle = "rgba(60, 32, 16, 0.35)";
      g.lineWidth = 1;
      g.strokeRect(x, y, ww, hh);
    }
    const specs = [
      { kind: "tower", fx: 0.035, fw: 0.075, fh: 0.24, wall: "#efe4c8", roof: "#c45c4a" },
      { kind: "cafe", fx: 0.118, fw: 0.10, fh: 0.145, wall: "#d45a48", roof: "#8b3a2a" },
      { kind: "cottage", fx: 0.228, fw: 0.082, fh: 0.11, wall: "#e8c04a", roof: "#8a5a28" },
      { kind: "villa", fx: 0.318, fw: 0.112, fh: 0.175, wall: "#f4efe6", roof: "#c45c4a" },
      { kind: "boat", fx: 0.440, fw: 0.118, fh: 0.10, wall: "#8a6a48", roof: "#5a3a22" },
      { kind: "inn", fx: 0.500, fw: 0.102, fh: 0.155, wall: "#e0b070", roof: "#a04830" },
      { kind: "church", fx: 0.678, fw: 0.078, fh: 0.22, wall: "#eee6d4", roof: "#6a6a70" },
      { kind: "pink", fx: 0.768, fw: 0.082, fh: 0.13, wall: "#e8b0b8", roof: "#c45c4a" },
      { kind: "stall", fx: 0.858, fw: 0.10, fh: 0.12, wall: "#3d7aad", roof: "#2a5a7a" },
    ];
    const wellFade = (g === ctx && hudGutterOccupied() && worldOx != null);
    for (let i = 0; i < specs.length; i++) {
      const b = specs[i];
      const bx = w * b.fx, bw = w * b.fw, bh = h * b.fh * s, by = base - bh;
      const fadeA = wellFade ? townBackdropAlpha(worldOx + bx + bw * 0.5, by + bh * 0.5, Math.max(bw, bh) * 0.52) : 1;
      if (fadeA <= 0.04) continue;
      g.save();
      g.globalAlpha *= fadeA;
      g.fillStyle = "rgba(20, 28, 24, 0.18)";
      g.fillRect(bx + 3, base, bw, h * 0.01);
      g.fillStyle = b.wall;
      g.fillRect(bx, by, bw, bh + 2);
      g.fillStyle = "rgba(255, 236, 200, 0.16)";
      g.fillRect(bx, by, bw * 0.32, bh);
      g.fillStyle = "rgba(40, 24, 12, 0.10)";
      g.fillRect(bx + bw * 0.62, by, bw * 0.38, bh);
      if (b.kind === "tower") {
        g.fillStyle = b.roof;
        g.fillRect(bx - 2, by - h * 0.018, bw + 4, h * 0.02);
        g.beginPath();
        g.moveTo(bx - 3, by - h * 0.016);
        g.quadraticCurveTo(bx + bw * 0.5, by - h * 0.055, bx + bw + 3, by - h * 0.016);
        g.fill();
        g.fillStyle = "#fff6e8";
        g.beginPath(); g.arc(bx + bw * 0.5, by + bh * 0.22, Math.max(5, bw * 0.18), 0, Math.PI * 2); g.fill();
        g.strokeStyle = "#8a5a28"; g.lineWidth = 1.4;
        g.beginPath(); g.arc(bx + bw * 0.5, by + bh * 0.22, Math.max(5, bw * 0.18), 0, Math.PI * 2); g.stroke();
        win(bx + bw * 0.22, by + bh * 0.48, bw * 0.2, bh * 0.14, true);
        win(bx + bw * 0.58, by + bh * 0.48, bw * 0.2, bh * 0.14, true);
        win(bx + bw * 0.36, by + bh * 0.72, bw * 0.28, bh * 0.18, false);
      } else if (b.kind === "cafe") {
        gable(bx, by, bw, h * 0.028, b.roof);
        g.fillStyle = "#ffe27a";
        g.beginPath();
        g.moveTo(bx + 2, by + bh * 0.42);
        g.lineTo(bx + bw - 2, by + bh * 0.42);
        g.lineTo(bx + bw - 6, by + bh * 0.28);
        g.lineTo(bx + 6, by + bh * 0.28);
        g.closePath(); g.fill();
        g.fillStyle = "#fff6e8";
        g.fillRect(bx + 4, by + bh * 0.28, bw - 8, 3);
        win(bx + bw * 0.14, by + bh * 0.52, bw * 0.22, bh * 0.2, true);
        win(bx + bw * 0.62, by + bh * 0.52, bw * 0.22, bh * 0.2, true);
        g.fillStyle = "#5a3018";
        g.fillRect(bx + bw * 0.38, by + bh * 0.62, bw * 0.22, bh * 0.38);
      } else if (b.kind === "cottage") {
        gable(bx, by, bw, h * 0.032, b.roof);
        g.fillStyle = "#8a4a22";
        g.fillRect(bx + bw * 0.72, by - h * 0.04, 5, h * 0.045);
        win(bx + bw * 0.18, by + bh * 0.38, bw * 0.22, bh * 0.22, true);
        win(bx + bw * 0.58, by + bh * 0.38, bw * 0.22, bh * 0.22, true);
        g.fillStyle = "#6b3416";
        g.fillRect(bx + bw * 0.38, by + bh * 0.58, bw * 0.24, bh * 0.42);
        g.fillStyle = "#3d8b4a";
        g.fillRect(bx + 3, by + bh * 0.78, bw * 0.2, bh * 0.12);
      } else if (b.kind === "villa") {
        gable(bx, by, bw, h * 0.026, b.roof);
        win(bx + bw * 0.12, by + bh * 0.22, bw * 0.18, bh * 0.16, true);
        win(bx + bw * 0.42, by + bh * 0.22, bw * 0.18, bh * 0.16, false);
        win(bx + bw * 0.70, by + bh * 0.22, bw * 0.18, bh * 0.16, true);
        g.fillStyle = "rgba(40, 28, 18, 0.35)";
        g.fillRect(bx + bw * 0.1, by + bh * 0.42, bw * 0.8, 4);
        g.strokeStyle = "#2a1a12"; g.lineWidth = 1.2;
        for (let k = 0; k < 5; k++) {
          g.beginPath();
          g.moveTo(bx + bw * (0.16 + k * 0.16), by + bh * 0.42);
          g.lineTo(bx + bw * (0.16 + k * 0.16), by + bh * 0.52);
          g.stroke();
        }
        win(bx + bw * 0.14, by + bh * 0.58, bw * 0.2, bh * 0.16, true);
        win(bx + bw * 0.64, by + bh * 0.58, bw * 0.2, bh * 0.16, true);
        g.fillStyle = "#5a3018";
        g.fillRect(bx + bw * 0.4, by + bh * 0.62, bw * 0.2, bh * 0.38);
      } else if (b.kind === "boat") {
        g.fillStyle = b.roof;
        g.fillRect(bx - 2, by, bw + 4, 8);
        g.fillStyle = "#3a2415";
        g.fillRect(bx + bw * 0.12, by + 14, bw * 0.22, bh * 0.55);
        g.fillRect(bx + bw * 0.40, by + 14, bw * 0.22, bh * 0.55);
        g.fillRect(bx + bw * 0.68, by + 14, bw * 0.22, bh * 0.55);
        g.fillStyle = "#1b4d6b";
        g.beginPath();
        g.ellipse(bx + bw * 0.5, base + 2, bw * 0.28, 5, 0, 0, Math.PI * 2);
        g.fill();
      } else if (b.kind === "inn") {
        // C92 — dusk town is backdrop only. Do not paint OPEN here;
        // the hanging dock sign is the one OPEN a kid should read.
        gable(bx, by, bw, h * 0.024, b.roof);
        win(bx + bw * 0.14, by + bh * 0.28, bw * 0.2, bh * 0.16, true);
        win(bx + bw * 0.42, by + bh * 0.28, bw * 0.16, bh * 0.16, true);
        win(bx + bw * 0.66, by + bh * 0.28, bw * 0.2, bh * 0.16, false);
        win(bx + bw * 0.14, by + bh * 0.56, bw * 0.2, bh * 0.16, true);
        win(bx + bw * 0.66, by + bh * 0.56, bw * 0.2, bh * 0.16, true);
        g.fillStyle = "#6b3416";
        g.fillRect(bx + bw * 0.38, by + bh * 0.58, bw * 0.24, bh * 0.42);
        g.fillStyle = "#8a5a28";
        g.fillRect(bx + bw * 0.3, by + bh * 0.12, bw * 0.4, 5);
        g.fillStyle = "#3d8b4a";
        g.fillRect(bx + 3, by + bh * 0.78, bw * 0.18, bh * 0.12);
      } else if (b.kind === "church") {
        g.fillStyle = b.roof;
        g.beginPath();
        g.moveTo(bx + bw * 0.5, by - h * 0.05);
        g.lineTo(bx - 2, by + 6);
        g.lineTo(bx + bw + 2, by + 6);
        g.closePath(); g.fill();
        g.fillStyle = "#fff6e8";
        g.fillRect(bx + bw * 0.46, by - h * 0.062, 3, h * 0.02);
        win(bx + bw * 0.32, by + bh * 0.28, bw * 0.36, bh * 0.22, true);
        g.fillStyle = "#5a3018";
        g.fillRect(bx + bw * 0.36, by + bh * 0.62, bw * 0.28, bh * 0.38);
      } else if (b.kind === "pink") {
        gable(bx, by, bw, h * 0.03, b.roof);
        g.fillStyle = "#ffe27a";
        g.beginPath(); g.arc(bx + bw * 0.5, by + bh * 0.38, bw * 0.16, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#6b3416";
        g.fillRect(bx + bw * 0.36, by + bh * 0.62, bw * 0.28, bh * 0.38);
      } else {
        g.fillStyle = b.roof;
        g.beginPath();
        g.moveTo(bx - 4, by + 8);
        g.lineTo(bx + bw * 0.5, by - 4);
        g.lineTo(bx + bw + 4, by + 8);
        g.closePath(); g.fill();
        g.fillStyle = "#2a4a58";
        g.fillRect(bx + 4, by + bh * 0.38, bw - 8, bh * 0.28);
        g.fillStyle = "#f08a2a";
        g.fillRect(bx + 8, by + bh * 0.44, 6, 4);
        g.fillStyle = "#3d8bfd";
        g.fillRect(bx + 16, by + bh * 0.44, 6, 4);
      }
      g.restore();
    }
    const trees = [[0.02, 0.92], [0.21, 0.90], [0.41, 0.93], [0.54, 0.91], [0.75, 0.90], [0.97, 0.92]];
    for (let i = 0; i < trees.length; i++) {
      const [fx, fy] = trees[i];
      const tx = w * fx, ty = base * fy + base * (1 - fy) * 0.15;
      g.fillStyle = "#5a3618";
      g.fillRect(tx, ty, 3.4 * s, h * 0.03 * s);
      g.fillStyle = i % 2 ? "#2e7a3c" : "#3d8b4a";
      g.beginPath();
      g.ellipse(tx + 1.6, ty - 6 * s, w * 0.016 + i, h * 0.022 * s + (i % 3), 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  function paintHarborScene(c) {
    const g = c.getContext("2d");
    const w = c.width, h = c.height;
    g.clearRect(0, 0, w, h);
    const sky = g.createLinearGradient(0, 0, 0, h * 0.46);
    sky.addColorStop(0, "#b8e8fa");
    sky.addColorStop(0.2, "#7ec8ee");
    sky.addColorStop(0.55, "#4aacd4");
    sky.addColorStop(0.82, "#5eb0c0");
    sky.addColorStop(1, "#7ec8c0");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    const sx = w * 0.84, sy = h * 0.11, sr = h * 0.05;
    const halo = g.createRadialGradient(sx, sy, sr * 0.15, sx, sy, sr * 4.2);
    halo.addColorStop(0, "rgba(255,248,214,0.96)");
    halo.addColorStop(0.22, "rgba(255,214,120,0.38)");
    halo.addColorStop(1, "rgba(255,176,80,0)");
    g.fillStyle = halo;
    g.beginPath(); g.arc(sx, sy, sr * 4.2, 0, Math.PI * 2); g.fill();
    const core = g.createRadialGradient(sx - sr * 0.2, sy - sr * 0.22, sr * 0.12, sx, sy, sr);
    core.addColorStop(0, "#fff8dc");
    core.addColorStop(0.48, "#ffe27a");
    core.addColorStop(1, "#f0b429");
    g.fillStyle = core;
    g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
    const clouds = [
      [0.1, 0.075, 0.15, 0.032], [0.26, 0.048, 0.11, 0.026],
      [0.46, 0.095, 0.17, 0.03], [0.63, 0.055, 0.13, 0.028],
      [0.34, 0.13, 0.09, 0.02],
    ];
    for (let i = 0; i < clouds.length; i++) {
      const [fx, fy, rw, rh] = clouds[i];
      const puff = g.createRadialGradient(w * fx, h * fy, 4, w * fx, h * fy + 6, w * rw);
      puff.addColorStop(0, "rgba(255,255,255,0.82)");
      puff.addColorStop(0.5, "rgba(236,244,255,0.4)");
      puff.addColorStop(1, "rgba(200,220,240,0)");
      g.fillStyle = puff;
      g.beginPath();
      g.ellipse(w * fx, h * fy, w * rw, h * rh, -0.08 + i * 0.04, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.ellipse(w * fx + w * rw * 0.38, h * fy + 3, w * rw * 0.55, h * rh * 0.78, 0.1, 0, Math.PI * 2);
      g.fill();
    }
    function hill(pts, col) {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(0, h * pts[1]);
      for (let i = 0; i < pts.length; i += 2) g.lineTo(w * pts[i], h * pts[i + 1]);
      g.lineTo(w, h * 0.62);
      g.lineTo(0, h * 0.62);
      g.fill();
    }
    hill([0, 0.40, 0.12, 0.33, 0.24, 0.38, 0.4, 0.30, 0.55, 0.36, 0.7, 0.28, 0.84, 0.35, 1, 0.32], "#7aab88");
    hill([0, 0.45, 0.1, 0.40, 0.22, 0.44, 0.38, 0.38, 0.54, 0.43, 0.7, 0.37, 0.86, 0.42, 1, 0.39], "#4e7e62");
    hill([0, 0.50, 0.16, 0.46, 0.34, 0.49, 0.52, 0.45, 0.72, 0.48, 0.9, 0.46, 1, 0.48], "#3d6a52");
    paintUniqueTown(g, w, h, h * 0.52, 1);
    const wf = g.createLinearGradient(0, h * 0.5, 0, h);
    wf.addColorStop(0, "#8ed4d0");
    wf.addColorStop(0.12, "#4ab4c0");
    wf.addColorStop(0.34, "#1e88a0");
    wf.addColorStop(0.58, "#0e6280");
    wf.addColorStop(0.8, "#084858");
    wf.addColorStop(1, "#042430");
    g.fillStyle = wf;
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, h * 0.545);
    for (let x = 0; x <= w; x += 6) {
      const yy = h * 0.52 + Math.sin(x * 0.018) * h * 0.014 + Math.sin(x * 0.051 + 1.2) * h * 0.007;
      g.lineTo(x, yy);
    }
    g.lineTo(w, h);
    g.closePath();
    g.fill();
    for (let i = 0; i < 16; i++) {
      const bx = w * (0.06 + (i % 8) * 0.12 + hash2(i, 2) * 0.04);
      const by = h * (0.62 + hash2(i, 4) * 0.28);
      const rad = 30 + hash2(i, 6) * 70;
      const blob = g.createRadialGradient(bx, by, 4, bx, by, rad);
      blob.addColorStop(0, i % 2 ? "rgba(180,240,240,0.16)" : "rgba(8,48,64,0.18)");
      blob.addColorStop(1, "rgba(10,60,80,0)");
      g.fillStyle = blob;
      g.beginPath(); g.ellipse(bx, by, rad, rad * 0.45, 0, 0, Math.PI * 2); g.fill();
    }
    function boat(fx, fy, len, hull, sail) {
      const bx = w * fx, by = h * fy, bw = w * len;
      g.fillStyle = hull;
      g.beginPath();
      g.moveTo(bx, by);
      g.lineTo(bx + bw, by - 2);
      g.lineTo(bx + bw * 0.92, by + h * 0.016);
      g.lineTo(bx + bw * 0.08, by + h * 0.016);
      g.closePath();
      g.fill();
      g.fillStyle = "#fff6e8";
      g.fillRect(bx + bw * 0.46, by - h * 0.04, 2.2, h * 0.04);
      g.fillStyle = sail;
      g.beginPath();
      g.moveTo(bx + bw * 0.48, by - h * 0.042);
      g.lineTo(bx + bw * 0.72, by - h * 0.01);
      g.lineTo(bx + bw * 0.48, by - h * 0.006);
      g.fill();
    }
    boat(0.08, 0.58, 0.09, "#5a3a22", "#fff6e8");
    boat(0.62, 0.60, 0.11, "#1b4d6b", "#e85d4c");
    boat(0.84, 0.57, 0.07, "#3a2415", "#ffe27a");
    g.fillStyle = "rgba(255,255,255,0.35)";
    for (let x = 0; x < w; x += 18) {
      const py = h * 0.525 + Math.sin(x * 0.04) * 3;
      g.beginPath();
      g.ellipse(x, py, 8 + (x % 5), 2.2, 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  // Dock-facing harbor: lots of sky, then hills, then a readable waterfront
  // that sits on the world waterline. C50 stretched the title canvas so the
  // dock camera only saw the painting's water half (teal + leftover plank decks).
  function paintPierBackdrop(c) {
    const g = c.getContext("2d");
    const w = c.width, h = c.height;
    g.clearRect(0, 0, w, h);
    const sky = g.createLinearGradient(0, 0, 0, h * 0.62);
    sky.addColorStop(0, "#c8eefc");
    sky.addColorStop(0.18, "#8ed0f0");
    sky.addColorStop(0.48, "#5eb4dc");
    sky.addColorStop(0.78, "#6ab8c4");
    sky.addColorStop(1, "#8eccc4");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    const sx = w * 0.82, sy = h * 0.09, sr = h * 0.042;
    const halo = g.createRadialGradient(sx, sy, sr * 0.15, sx, sy, sr * 5);
    halo.addColorStop(0, "rgba(255,248,214,0.96)");
    halo.addColorStop(0.2, "rgba(255,214,120,0.36)");
    halo.addColorStop(1, "rgba(255,176,80,0)");
    g.fillStyle = halo;
    g.beginPath(); g.arc(sx, sy, sr * 5, 0, Math.PI * 2); g.fill();
    const core = g.createRadialGradient(sx - sr * 0.2, sy - sr * 0.22, sr * 0.12, sx, sy, sr);
    core.addColorStop(0, "#fff8dc");
    core.addColorStop(0.48, "#ffe27a");
    core.addColorStop(1, "#f0b429");
    g.fillStyle = core;
    g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
    const clouds = [
      [0.08, 0.06, 0.14, 0.028], [0.24, 0.04, 0.1, 0.022],
      [0.44, 0.08, 0.16, 0.026], [0.62, 0.05, 0.12, 0.024],
      [0.33, 0.11, 0.08, 0.018], [0.74, 0.07, 0.11, 0.02],
    ];
    for (let i = 0; i < clouds.length; i++) {
      const [fx, fy, rw, rh] = clouds[i];
      const puff = g.createRadialGradient(w * fx, h * fy, 4, w * fx, h * fy + 6, w * rw);
      puff.addColorStop(0, "rgba(255,255,255,0.8)");
      puff.addColorStop(0.5, "rgba(236,244,255,0.38)");
      puff.addColorStop(1, "rgba(200,220,240,0)");
      g.fillStyle = puff;
      g.beginPath();
      g.ellipse(w * fx, h * fy, w * rw, h * rh, -0.08 + i * 0.03, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.ellipse(w * fx + w * rw * 0.36, h * fy + 3, w * rw * 0.52, h * rh * 0.76, 0.1, 0, Math.PI * 2);
      g.fill();
    }
    function hill(pts, col, base) {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(0, h * pts[1]);
      for (let i = 0; i < pts.length; i += 2) g.lineTo(w * pts[i], h * pts[i + 1]);
      g.lineTo(w, h * base);
      g.lineTo(0, h * base);
      g.fill();
    }
    hill([0, 0.38, 0.14, 0.30, 0.28, 0.36, 0.46, 0.28, 0.62, 0.34, 0.78, 0.26, 0.9, 0.33, 1, 0.29], "#7aab88", 0.78);
    hill([0, 0.46, 0.12, 0.40, 0.26, 0.45, 0.42, 0.38, 0.58, 0.44, 0.74, 0.37, 0.88, 0.43, 1, 0.40], "#4e7e62", 0.82);
    hill([0, 0.56, 0.18, 0.50, 0.36, 0.54, 0.54, 0.49, 0.72, 0.53, 0.9, 0.50, 1, 0.52], "#3d6a52", 0.88);
    paintUniqueTown(g, w, h, h * 0.88, 1.15);
    const wf = g.createLinearGradient(0, h * 0.88, 0, h);
    wf.addColorStop(0, "#8ed4d0");
    wf.addColorStop(0.35, "#4ab4c0");
    wf.addColorStop(1, "#1e88a0");
    g.fillStyle = wf;
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, h * 0.905);
    for (let x = 0; x <= w; x += 6) {
      const yy = h * 0.892 + Math.sin(x * 0.016) * h * 0.01 + Math.sin(x * 0.05 + 1.1) * h * 0.005;
      g.lineTo(x, yy);
    }
    g.lineTo(w, h);
    g.closePath();
    g.fill();
    function boat(fx, fy, len, hull, sail) {
      const bx = w * fx, by = h * fy, bw = w * len;
      g.fillStyle = hull;
      g.beginPath();
      g.moveTo(bx, by);
      g.lineTo(bx + bw, by - 2);
      g.lineTo(bx + bw * 0.92, by + h * 0.012);
      g.lineTo(bx + bw * 0.08, by + h * 0.012);
      g.closePath();
      g.fill();
      g.fillStyle = "#fff6e8";
      g.fillRect(bx + bw * 0.46, by - h * 0.03, 2.2, h * 0.03);
      g.fillStyle = sail;
      g.beginPath();
      g.moveTo(bx + bw * 0.48, by - h * 0.032);
      g.lineTo(bx + bw * 0.7, by - h * 0.008);
      g.lineTo(bx + bw * 0.48, by - h * 0.005);
      g.fill();
    }
    boat(0.07, 0.915, 0.08, "#5a3a22", "#fff6e8");
    boat(0.58, 0.922, 0.1, "#1b4d6b", "#e85d4c");
    boat(0.86, 0.91, 0.07, "#3a2415", "#ffe27a");
    g.fillStyle = "rgba(255,255,255,0.38)";
    for (let x = 0; x < w; x += 16) {
      const py = h * 0.896 + Math.sin(x * 0.04) * 2.6;
      g.beginPath();
      g.ellipse(x, py, 7 + (x % 5), 1.8, 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  function drawTownSkyline(x, waterY, w, townH, teal) {
    ensurePaint();
    const top = waterY - townH;
    if (ATLAS.sky && ART.ready) {
      blitTile("sky", x, top - 80, w, Math.min(220, townH * 0.42));
    }
    if (ATLAS.harbortown && ART.ready) {
      blitTile("harbortown", x, top, w, townH);
    } else if (ATLAS.harbor && ART.ready) {
      blitTile("harbor", x, top, w, townH);
    } else if (paint.pier && townH > 480) {
      ctx.drawImage(paint.pier, x, top, w, townH);
    } else if (paint.harbor) {
      ctx.drawImage(paint.harbor, x, top, w, townH);
    } else {
      const sky = ctx.createLinearGradient(x, top, x, waterY);
      sky.addColorStop(0, "#b8e8fa");
      sky.addColorStop(0.55, "#7ec8ee");
      sky.addColorStop(1, "#7ec8c0");
      ctx.fillStyle = sky;
      ctx.fillRect(x, top, w, townH);
    }
    if (teal) {
      ctx.fillStyle = "rgba(18, 132, 124, 0.10)";
      ctx.fillRect(x, top, w, townH);
    }
    return true;
  }
  function drawHarborTown(x, y, w, h, teal) {
    return drawTownSkyline(x, y + h, w, h, teal);
  }
  // C57/C58 — town is a distant shore BEHIND the pier, not a 560px mural
  // stretched across the bay. C58 crops tighter on the waterline so the
  // roofs do not read as a walkable terrace. The bay below is water.
  function paintDockHarborSky(x, top, w, bot) {
    // Dusk harbor fill. Height is bot-top — C71/C73 used townTop+8 as the
    // fillRect HEIGHT so the wash ended at y=442 and the dock camera
    // (world y≈540–714) read as a flat navy slab.
    const h = Math.max(8, bot - top);
    const sky = ctx.createLinearGradient(x, top, x, bot);
    sky.addColorStop(0, "#2a3a68");
    sky.addColorStop(0.22, "#3d4a86");
    sky.addColorStop(0.46, "#6a6a9c");
    sky.addColorStop(0.68, "#c88878");
    sky.addColorStop(0.86, "#e8b888");
    sky.addColorStop(1, "#d8c4a4");
    ctx.fillStyle = sky;
    ctx.fillRect(x, top, w, h);
    // Sit the sun on the horizon band the dock camera actually sees
    // (cam.y ≥ 1000, H=720 → world y≈640+). A 20%-from-bottom disc on
    // a 1100px fill landed at y≈500 — off the top of the frame.
    const sx = x + w * 0.78, sy = bot - 86, sr = 22;
    const halo = ctx.createRadialGradient(sx, sy, 4, sx, sy, 120);
    halo.addColorStop(0, "rgba(255, 226, 160, 0.90)");
    halo.addColorStop(0.28, "rgba(255, 168, 96, 0.34)");
    halo.addColorStop(1, "rgba(255, 140, 80, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(sx, sy, 120, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffe2a8";
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
  }
  function paintVisibleDuskClouds(x, y, w, h) {
    // Big readable puffs in the peach band the dock camera frames.
    const clouds = [
      [0.08, 0.34, 72, 22], [0.24, 0.18, 88, 26],
      [0.42, 0.40, 96, 24], [0.61, 0.16, 78, 22],
      [0.78, 0.36, 84, 24], [0.93, 0.22, 70, 20],
    ];
    for (let i = 0; i < clouds.length; i++) {
      const [fx, fy, rw, rh] = clouds[i];
      const cx = x + w * fx, cy = y + h * fy;
      ctx.fillStyle = "rgba(255, 236, 220, 0.82)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, rw, rh, -0.05 + i * 0.02, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 246, 232, 0.70)";
      ctx.beginPath();
      ctx.ellipse(cx + rw * 0.42, cy + 4, rw * 0.62, rh * 0.78, 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - rw * 0.36, cy + 3, rw * 0.48, rh * 0.62, -0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(210, 170, 168, 0.22)";
      ctx.beginPath();
      ctx.ellipse(cx + 6, cy + rh * 0.55, rw * 0.72, rh * 0.42, 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function drawHorizonTown(x, waterY, w, townH, teal) {
    // Hills + unique roofs sitting on the waterline so the peach gradient
    // meets the town. Backdrop only — walk snap is unchanged.
    const top = waterY - townH;
    ctx.fillStyle = "#5a7a62";
    ctx.beginPath();
    ctx.moveTo(x, waterY + 4);
    ctx.lineTo(x, waterY - townH * 0.38);
    for (let i = 0; i <= 10; i++) {
      const px = x + w * (i / 10);
      const py = waterY - townH * (0.30 + 0.20 * Math.sin(i * 1.35) + 0.08 * Math.sin(i * 2.8));
      ctx.lineTo(px, py);
    }
    ctx.lineTo(x + w, waterY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3d5a48";
    ctx.beginPath();
    ctx.moveTo(x, waterY + 4);
    ctx.lineTo(x, waterY - townH * 0.22);
    for (let i = 0; i <= 8; i++) {
      const px = x + w * (i / 8);
      const py = waterY - townH * (0.16 + 0.14 * Math.sin(i * 1.7 + 0.4));
      ctx.lineTo(px, py);
    }
    ctx.lineTo(x + w, waterY + 4);
    ctx.closePath();
    ctx.fill();
    // Painted unique roofs on the waterline. Do not stretch the C55
    // harbortown water crop here — that buried the skyline under the bay.
    ctx.save();
    ctx.translate(x, 0);
    paintUniqueTown(ctx, w, 560, waterY - 2, 1.08, x);
    ctx.restore();
    if (teal) {
      ctx.fillStyle = "rgba(18, 132, 124, 0.08)";
      ctx.fillRect(x, top, w, townH);
    }
  }
  function drawShopHarbor(teal) {
    ensurePaint();
    const x = -420;
    const w = shopW() + 840;
    // Bay water starts at 772. Sit the town on that horizon so the dock
    // camera (visible world y≈640–772) sees roofs, not a blank peach slab.
    const waterY = 776;
    const townH = 168;
    paintDockHarborSky(x, -400, w, waterY + 4);
    paintVisibleDuskClouds(x, 628, w, 86);
    drawHorizonTown(x, waterY, w, townH, teal);
    return true;
  }
  function peelPlankSky(g, w, h) {
    // Packed plank row sits against harbortown / sky / water. A live
    // atlas blit picks those neighbors up as cyan bands across the deck.
    try {
      const img = g.getImageData(0, 0, w, h);
      const d = img.data;
      for (let y = 0; y < h; y++) {
        let wr = 168, wg = 112, wb = 58;
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const r = d[i], gv = d[i + 1], b = d[i + 2], a = d[i + 3];
          if (a < 10) continue;
          const sky = b > r + 14 && b > 118 && gv > 90;
          const water = (gv + b) > r * 1.52 && b > 86 && r < 148;
          if (!sky && !water) { wr = r; wg = gv; wb = b; }
          else { d[i] = wr; d[i + 1] = wg; d[i + 2] = wb; d[i + 3] = 255; }
        }
      }
      g.putImageData(img, 0, 0);
    } catch (err) { /* ignore tainted scratch */ }
  }
  function stampPlankTile(c, teal, name) {
    const g = c.getContext("2d");
    const f = ATLAS[name || "plank"] || ATLAS.plank;
    g.clearRect(0, 0, c.width, c.height);
    if (ART.ready && f) {
      // Inset 2px so bilinear never samples the packed neighbor. plank2
      // is two boards in one 40px cell — take the top board only so a
      // row is not a mid-tile wrap.
      const dual = name === "plank2";
      const sx = f.x + 2;
      const sy = dual ? f.y + 1 : f.y + 2;
      const sw = Math.max(8, f.w - 4);
      const sh = dual ? Math.max(8, (f.h * 0.48) | 0) : Math.max(8, f.h - 4);
      g.drawImage(ART.img, sx, sy, sw, sh, 0, 0, c.width, c.height);
      peelPlankSky(g, c.width, c.height);
      if (teal) {
        g.fillStyle = "rgba(36, 92, 72, 0.18)";
        g.fillRect(0, 0, c.width, c.height);
      }
      const shine = g.createLinearGradient(0, 0, 0, c.height);
      shine.addColorStop(0, "rgba(255, 226, 170, 0.08)");
      shine.addColorStop(1, "rgba(40, 18, 8, 0.08)");
      g.fillStyle = shine;
      g.fillRect(0, 0, c.width, c.height);
      return true;
    }
    paintWoodTile(c, teal);
    return false;
  }
  function plankCell(i) {
    const names = ["plank", "plank1", "plank2", "plank3", "plank4", "plank5", "plank6", "plank7"];
    const n = names.length;
    return ATLAS[names[((i % n) + n) % n]] || ATLAS.plank;
  }
  function ensurePaint() {
    if (!paint.wood) {
      paint.wood = makeOff(240, 40);
      paint.woodTeal = makeOff(240, 40);
      paint.clouds = makeOff(520, 80);
      paint.harbor = makeOff(1024, 576);
      paint.pier = makeOff(1024, 900);
      paint.planks = [];
      for (let i = 0; i < 8; i++) {
        const c = makeOff(240, 40);
        paintWoodTile(c, false);
        const g = c.getContext("2d");
        g.fillStyle = i % 2 ? "rgba(40, 18, 8, 0.06)" : "rgba(255, 220, 150, 0.05)";
        g.fillRect(0, 0, 240, 40);
        paint.planks.push(c);
      }
      paintCloudTile(paint.clouds);
      paintHarborScene(paint.harbor);
      paintPierBackdrop(paint.pier);
    }
    if (ART.ready && ATLAS.plank && !paint.sprited) {
      stampPlankTile(paint.wood, false, "plank");
      stampPlankTile(paint.woodTeal, true, "plank1");
      const names = ["plank", "plank1", "plank2", "plank3", "plank4", "plank5", "plank6", "plank7"];
      for (let i = 0; i < names.length; i++) {
        if (!paint.planks[i]) paint.planks[i] = makeOff(240, 40);
        stampPlankTile(paint.planks[i], false, names[i]);
      }
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
  function drawPierPost(x, footY, sc, seed) {
    const s = sc || 1.15;
    const id = seed == null ? ((Math.abs(x) * 17 + Math.abs(footY) * 3) | 0) : seed;
    const t = state.time || 0;
    const kind = (id + ((hash2(id, 0) * 7) | 0)) % 7;
    const lean = (hash2(id, 1) - 0.5) * (0.14 + kind * 0.05);
    const hMul = 0.72 + hash2(id, 2) * 0.55 + (kind === 1 ? -0.18 : kind === 4 ? 0.22 : 0);
    const footW = (9 + hash2(id, 4) * 10 + (kind === 5 ? 4 : 0)) * s;
    const footH = (2.2 + hash2(id, 5) * 3.6) * s;
    const stain = hash2(id, 12);
    const woods = [
      ["#4a3018", "#8a5a28"], ["#2e2216", "#6a4a28"], ["#5a3a1c", "#c09048"],
      ["#3a2814", "#7a4a22"], ["#4a3820", "#9a7040"], ["#2a2018", "#5a4030"],
      ["#5a2814", "#a06030"],
    ];
    const pair = woods[kind];
    ctx.fillStyle = "rgba(8, 24, 32," + (0.18 + hash2(id, 8) * 0.16) + ")";
    ctx.beginPath();
    ctx.ellipse(x + lean * 10, footY + 6, footW, footH, lean * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(x, footY);
    ctx.rotate(lean);
    ctx.scale(1, hMul);
    const hw = (6.2 + (kind === 5 ? 2.2 : kind === 1 ? -0.8 : 0) + hash2(id, 3) * 1.4) * s;
    const hh = (38 + hash2(id, 6) * 10) * s;
    const trunk = ctx.createLinearGradient(-hw, -hh, hw, 4);
    trunk.addColorStop(0, pair[1]);
    trunk.addColorStop(0.35, pair[0]);
    trunk.addColorStop(1, "#1a1008");
    ctx.fillStyle = trunk;
    ctx.beginPath();
    if (kind === 1) {
      ctx.moveTo(-hw * 0.7, 2);
      ctx.lineTo(-hw * 1.05, -hh * 0.55);
      ctx.lineTo(-hw * 0.2, -hh);
      ctx.lineTo(hw * 0.55, -hh * 0.92);
      ctx.lineTo(hw, 2);
    } else if (kind === 4) {
      ctx.moveTo(-hw, 2);
      ctx.quadraticCurveTo(-hw * 1.15, -hh * 0.5, -hw * 0.55, -hh);
      ctx.lineTo(hw * 0.4, -hh * 0.96);
      ctx.quadraticCurveTo(hw * 0.9, -hh * 0.4, hw * 0.75, 2);
    } else {
      ctx.moveTo(-hw, 2);
      ctx.lineTo(-hw * (0.85 + hash2(id, 7) * 0.15), -hh);
      ctx.lineTo(hw * (0.7 + hash2(id, 9) * 0.2), -hh);
      ctx.lineTo(hw, 2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 214, 150," + (0.08 + hash2(id, 21) * 0.1) + ")";
    ctx.fillRect(-hw * 0.85, -hh, hw * 0.38, hh);
    if (kind === 2 || kind === 6) {
      ctx.fillStyle = "rgba(40, 70, 48, 0.28)";
      ctx.fillRect(-hw, -hh * (0.35 + hash2(id, 14) * 0.2), hw * 2, hh * 0.22);
    }
    if (kind === 3) {
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(-hw * 1.15, -hh * 0.62, hw * 2.3, 3.4 * s);
      ctx.fillRect(-hw * 1.15, -hh * 0.28, hw * 2.3, 3.2 * s);
      ctx.fillStyle = "#8a8a88";
      ctx.fillRect(-hw * 1.15, -hh * 0.62, hw * 2.3, 1.1 * s);
    }
    if (kind === 0 || kind === 5) {
      ctx.strokeStyle = "rgba(196, 96, 48, 0.88)";
      ctx.lineWidth = 2.6 + hash2(id, 16);
      ctx.beginPath();
      ctx.arc(0, -hh * (0.28 + hash2(id, 17) * 0.2), hw * 1.15, 0.15, 2.95);
      ctx.stroke();
    }
    if (kind === 2 || kind === 4 || kind === 6) {
      ctx.strokeStyle = kind === 4 ? "rgba(90, 64, 32, 0.85)" : "rgba(160, 120, 64, 0.78)";
      ctx.lineWidth = 1.8 + hash2(id, 16) * 1.4;
      const wraps = 1 + (kind === 4 ? 2 : 0);
      for (let w = 0; w < wraps; w++) {
        ctx.beginPath();
        ctx.arc(0, -hh * (0.18 + w * 0.16 + hash2(id, 17 + w) * 0.08), hw * (1.05 + w * 0.08), 0.25, 2.85);
        ctx.stroke();
      }
    }
    if (kind === 5) {
      ctx.strokeStyle = "#2a2218";
      ctx.lineWidth = 3.2 * s;
      ctx.beginPath();
      ctx.ellipse(hw * 1.35, -hh * 0.22, hw * 1.15, hw * 0.85, 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#4a4030";
      ctx.lineWidth = 1.4 * s;
      ctx.stroke();
    }
    if (kind === 1) {
      ctx.fillStyle = "rgba(48, 88, 52, 0.55)";
      ctx.beginPath();
      ctx.moveTo(-hw * 0.2, -hh * 0.15);
      ctx.quadraticCurveTo(hw * 0.8, -hh * 0.05, hw * 0.2, hh * 0.02);
      ctx.quadraticCurveTo(-hw * 0.4, -hh * 0.02, -hw * 0.2, -hh * 0.15);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(210, 200, 180, 0.72)";
    const barn = 1 + ((hash2(id, 18) * 4) | 0) + (kind === 6 ? 2 : 0);
    for (let i = 0; i < barn; i++) {
      ctx.beginPath();
      ctx.arc((-hw + hash2(id, 20 + i) * hw * 2) * 0.7, -hash2(id, 30 + i) * hh * 0.7, 1.0 + hash2(id, 40 + i) * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = pair[0];
    ctx.beginPath();
    ctx.ellipse(0, -hh, hw * 0.72, 2.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function plantInSand(x, y, rx, ry, tone) {
    // Contact AO + raised mound so kelp / coral sit *in* the sand.
    ctx.fillStyle = "rgba(10, 16, 12, 0.34)";
    ctx.beginPath();
    ctx.ellipse(x + 1.6, y + 2.4, rx * 1.08, Math.max(2.4, ry * 0.42), -0.16, 0, Math.PI * 2);
    ctx.fill();
    const warm = tone == null ? 0.5 : tone;
    const g = ctx.createRadialGradient(x - rx * 0.22, y - ry * 0.55, 1.2, x, y + 1, rx * 1.05);
    g.addColorStop(0, warm > 0.55 ? "rgba(236, 214, 150, 0.82)" : "rgba(196, 178, 112, 0.7)");
    g.addColorStop(0.42, warm > 0.55 ? "rgba(200, 164, 88, 0.5)" : "rgba(148, 128, 72, 0.42)");
    g.addColorStop(1, "rgba(70, 52, 28, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0.08 + (warm - 0.5) * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  function blitBedStamp(id, x, y, w, h, rot, flip, seed) {
    const c = ATLAS["bed" + ((id % 8) + 8) % 8];
    // Inner crop in a dune clip — never the atlas triangle silhouette
    // and never a radial leaf polygon.
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    if (flip) ctx.scale(-1, 1);
    ctx.beginPath();
    const hw = w * 0.5, hh = h * 0.5;
    ctx.moveTo(-hw, hh * 0.82);
    ctx.quadraticCurveTo(-hw * 0.55, -hh * (0.15 + hash2(seed, 8) * 0.35), -hw * 0.12, -hh * (0.55 + hash2(seed, 9) * 0.35));
    ctx.quadraticCurveTo(hw * (hash2(seed, 10) - 0.5) * 0.4, -hh * (0.82 + hash2(seed, 11) * 0.22), hw * 0.18, -hh * (0.48 + hash2(seed, 12) * 0.3));
    ctx.quadraticCurveTo(hw * 0.62, -hh * (0.08 + hash2(seed, 13) * 0.28), hw, hh * 0.82);
    ctx.closePath();
    ctx.clip();
    if (c && ART.ready) {
      const padL = 18 + hash2(seed, 2) * 56;
      const padT = 12 + hash2(seed, 3) * 28;
      const padR = 18 + hash2(seed, 4) * 52;
      const padB = 10 + hash2(seed, 5) * 18;
      const sx = c.x + padL;
      const sy = c.y + padT;
      const sw = Math.max(36, c.w - padL - padR);
      const sh = Math.max(22, c.h - padT - padB);
      ctx.drawImage(ART.img, sx, sy, sw, sh, -w * 0.5, -h * 0.5, w, h);
    } else {
      ctx.fillStyle = "#d8b878";
      ctx.fill();
    }
    ctx.restore();
    return true;
  }
  function paintDuneLobe(cx, footY, hw, hh, seed, pair, stampId) {
    // Smooth unique mound — quadratic shoulders, not a 16px sawtooth polyline
    // and not a wide leaf ellipse at one y.
    const lean = (hash2(seed, 1) - 0.5) * hw * 0.34;
    const peakX = cx + lean;
    const peakY = footY - hh * (0.86 + hash2(seed, 4) * 0.2);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - hw, footY + 14);
    ctx.quadraticCurveTo(
      cx - hw * (0.62 + hash2(seed, 2) * 0.14) + lean * 0.15,
      footY - hh * (0.22 + hash2(seed, 3) * 0.2),
      cx - hw * (0.22 + hash2(seed, 5) * 0.12) + lean * 0.4,
      footY - hh * (0.58 + hash2(seed, 6) * 0.18)
    );
    ctx.quadraticCurveTo(peakX, peakY, cx + hw * (0.2 + hash2(seed, 7) * 0.12) + lean * 0.35, footY - hh * (0.54 + hash2(seed, 8) * 0.2));
    ctx.quadraticCurveTo(
      cx + hw * (0.66 + hash2(seed, 9) * 0.12) + lean * 0.12,
      footY - hh * (0.2 + hash2(seed, 10) * 0.18),
      cx + hw, footY + 14
    );
    ctx.closePath();
    const sandG = ctx.createLinearGradient(cx - hw * 0.35, peakY, cx + hw * 0.2, footY + 8);
    sandG.addColorStop(0, pair[0]);
    sandG.addColorStop(0.55, pair[0]);
    sandG.addColorStop(1, pair[1]);
    ctx.fillStyle = sandG;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.globalAlpha = 0.38 + hash2(seed, 14) * 0.32;
    const tw = hw * (1.15 + hash2(seed, 15) * 0.55);
    const th = hh * (1.05 + hash2(seed, 16) * 0.5);
    blitBedStamp(stampId, peakX, footY - hh * 0.38, tw, th,
      (hash2(seed, 17) - 0.5) * 0.42, hash2(seed, 18) > 0.5, seed + 3);
    ctx.globalAlpha = 1;
    const bits = 2 + ((hash2(seed, 19) * 3) | 0);
    for (let b = 0; b < bits; b++) {
      const bx = cx + (hash2(seed, 20 + b) - 0.5) * hw * 1.2;
      const by = footY - 2 - hash2(seed, 30 + b) * hh * 0.45;
      const br = 2 + hash2(seed, 40 + b) * 5.2;
      ctx.fillStyle = hash2(seed, 50 + b) > 0.55
        ? "rgba(232, 196, 130, 0.7)"
        : hash2(seed, 51 + b) > 0.35
          ? "rgba(168, 120, 72, 0.65)"
          : "rgba(90, 110, 78, 0.55)";
      ctx.beginPath();
      ctx.ellipse(bx, by, br, br * (0.42 + hash2(seed, 52 + b) * 0.38),
        (hash2(seed, 53 + b) - 0.5) * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();
    return { x: peakX, y: footY - 5, hw, hh, footY };
  }
  function bedIdentity(z) {
    const cols = [
      ["#e8d090", "#c8a868"], ["#d8b878", "#6a8a60"], ["#e0c070", "#c8a040"],
      ["#d4b090", "#b07050"], ["#c8c070", "#4a8a50"], ["#b8a068", "#3a7a4a"],
      ["#d0c060", "#8a7a30"], ["#e8d8b0", "#c8a878"], ["#6a5a70", "#3a2850"],
      ["#c8a868", "#a06040"], ["#4a7080", "#204050"], ["#7a90a0", "#3a5060"],
      ["#3a4a58", "#1a2830"],
    ];
    const langs = [
      "shallow", "reef", "gold", "koi", "turtle",
      "horse", "puffer", "angel", "octo", "crab",
      "squid", "dolphin", "whale",
    ];
    const s = z.s | 0;
    if (z.forever) {
      const kind = (FOREVER_ZONE_NAMES.indexOf((z.name || "").split(" · ")[0]) + 8) % 8;
      const flang = ["trench", "crystal", "glow", "starfall", "ribbon", "cathedral", "lantern", "forever"][kind];
      return {
        lang: flang,
        seed: 211 + kind * 29 + ((z.y1 / 17) | 0),
        pair: cols[8 + (kind % 5)],
        stamp: kind,
        s,
      };
    }
    const i = Math.min(Math.max(s, 0), langs.length - 1);
    return {
      lang: langs[i],
      seed: 17 + i * 53 + ((z.y1 / 11) | 0),
      pair: cols[i],
      stamp: i % 8,
      s,
    };
  }
  function bedSmooth(seed, x, w, salt) {
    const cell = (x / w) | 0;
    const t = (x / w) - cell;
    const u = t * t * (3 - 2 * t);
    return hash2(seed + salt, cell) * (1 - u) + hash2(seed + salt, cell + 1) * u;
  }
  function bedRise(x, id, y1) {
    const seed = id.seed, lang = id.lang;
    const sm = function (w, salt) { return bedSmooth(seed, x, w, salt); };
    if (lang === "shallow") {
      const slow = sm(190, 0), broad = sm(320, 7);
      const wave = Math.sin(x * 0.0048 + seed * 0.37) * 6 + Math.sin(x * 0.014 + y1 * 0.004) * 3;
      const bay = hash2(seed, 900 + ((x / 150) | 0)) > 0.82 ? 0.22 + hash2(seed, 910 + ((x / 150) | 0)) * 0.2 : 1;
      return (12 + slow * 30 + broad * 18 + wave) * bay;
    }
    if (lang === "reef") {
      const head = sm(88, 3);
      const shelf = sm(210, 9);
      const notch = hash2(seed, 80 + ((x / 70) | 0)) > 0.72 ? 0.28 : 1;
      return (6 + Math.pow(head, 1.6) * 38 + shelf * 10) * notch;
    }
    if (lang === "gold") {
      const cell = 240 + hash2(seed, 2) * 70;
      const t = (x / cell) - ((x / cell) | 0);
      const mound = (t > 0.18 && t < 0.82) ? Math.sin((t - 0.18) / 0.64 * Math.PI) : 0;
      const fat = 0.7 + sm(cell, 5) * 0.6;
      return 4 + mound * mound * (28 + sm(cell, 8) * 18) * fat;
    }
    if (lang === "koi") {
      const step = sm(130, 4);
      const terrace = (step * 4) | 0;
      return 8 + terrace * 11 + sm(40, 12) * 3;
    }
    if (lang === "turtle") {
      return 8 + sm(360, 1) * 16 + Math.sin(x * 0.0031 + seed * 0.2) * 7 + sm(90, 6) * 4;
    }
    if (lang === "horse") {
      const cluster = sm(260, 2);
      const spike = Math.abs(Math.sin(x * 0.042 + seed * 0.61 + sm(40, 14) * 0.8));
      return cluster > 0.42
        ? 8 + Math.pow(spike, 0.7) * (36 + cluster * 22)
        : 3 + spike * 7;
    }
    if (lang === "puffer") {
      const span = 190 + hash2(seed, 3) * 50;
      const u = (x / span) - ((x / span) | 0);
      const bowl = Math.sin(u * Math.PI);
      const rim = Math.pow(Math.sin(u * Math.PI * 2), 2);
      return 6 + rim * 26 + (1 - bowl) * 4;
    }
    if (lang === "angel") {
      const a = Math.abs(Math.sin(x * 0.0086 + seed * 0.33));
      const b = Math.abs(Math.sin(x * 0.017 + 1.3 + seed * 0.11));
      const c = Math.abs(Math.sin(x * 0.0052 + 2.1));
      return 8 + Math.pow(a, 1.4) * 26 + Math.pow(b, 2.2) * 20 + c * 6;
    }
    if (lang === "octo") {
      const cave = sm(160, 5);
      const lip = Math.pow(sm(70, 9), 2);
      return cave > 0.62 ? 4 + lip * 8 : 10 + (1 - cave) * 28 + lip * 10;
    }
    if (lang === "crab") {
      return 5 + sm(400, 1) * 8 + sm(55, 8) * 5;
    }
    if (lang === "squid") {
      const spike = Math.pow(Math.abs(Math.sin(x * 0.028 + seed * 0.4)), 3.2);
      return 5 + spike * 40 + sm(120, 6) * 6;
    }
    if (lang === "dolphin") {
      return 10 + Math.sin(x * 0.0062 + seed * 0.25) * 14 + Math.sin(x * 0.0024) * 8 + sm(200, 3) * 6;
    }
    if (lang === "whale") {
      return 14 + sm(480, 1) * 22 + Math.sin(x * 0.0018 + seed * 0.1) * 6;
    }
    if (lang === "trench") {
      return 4 + Math.pow(sm(140, 2), 2) * 44 + sm(40, 8) * 6;
    }
    if (lang === "crystal") {
      const facet = ((sm(70, 4) * 5) | 0);
      return 6 + facet * 9 + Math.abs(Math.sin(x * 0.02 + seed)) * 8;
    }
    if (lang === "glow") {
      return 7 + sm(180, 3) * 20 + Math.sin(x * 0.011 + seed) * 10;
    }
    if (lang === "starfall") {
      return 5 + Math.pow(sm(90, 6), 2.4) * 36;
    }
    if (lang === "ribbon") {
      return 8 + Math.abs(Math.sin(x * 0.009 + seed * 0.5)) * 18 + sm(220, 2) * 12;
    }
    if (lang === "cathedral") {
      const arch = Math.abs(Math.sin(x * 0.007 + seed * 0.2));
      return 6 + Math.pow(1 - arch, 2) * 34 + sm(160, 5) * 8;
    }
    if (lang === "lantern") {
      return 7 + sm(100, 3) * 16 + Math.pow(sm(50, 9), 3) * 22;
    }
    return 8 + sm(200, 1) * 18 + Math.sin(x * 0.004 + seed) * 6;
  }
  function drawZoneBed(z) {
    const y0 = z.y0, y1 = z.y1;
    const id = bedIdentity(z);
    const seed = id.seed, pair = id.pair, lang = id.lang;
    const sites = [];
    ctx.save();
    if (lang === "gold") {
      ctx.fillStyle = "rgba(232, 192, 74, 0.12)";
      ctx.fillRect(0, y0, OCEAN.w, y1 - y0);
    } else if (lang === "glow") {
      ctx.fillStyle = "rgba(180,90,255,0.10)";
      ctx.fillRect(0, y0, OCEAN.w, y1 - y0);
    }
    // Ribbon langs keep a contour strip at y1. Feature langs (gold / horse /
    // puffer / angel / …) plant their silhouette on the lip you cross (y0)
    // so 79m named "Puffer pockets" is craters under the diver — not the
    // previous band's dune strip sitting 15m below the name change.
    const feature = /^(gold|horse|puffer|angel|octo|squid|starfall|cathedral|lantern)$/.test(lang);
    const ridgeY = feature ? y0 + 8 : y1;
    const step = lang === "reef" || lang === "koi" || lang === "crystal" ? 8 : 6;
    const pts = [];
    for (let x = -24; x <= OCEAN.w + 24; x += step) {
      const rise = feature ? (3 + bedSmooth(seed, x, 420, 1) * 4) : bedRise(x, id, y1);
      pts.push([x, ridgeY + 3 - rise]);
    }
    const thick = feature ? 6 : (lang === "crab" || lang === "turtle" ? 14 : (lang === "whale" ? 22 : 16));
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1] + thick);
    ctx.lineTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last[0], last[1]);
    ctx.lineTo(last[0], last[1] + thick);
    for (let i = pts.length - 1; i > 0; i--) {
      const a = pts[i], b = pts[i - 1];
      ctx.quadraticCurveTo(a[0], a[1] + thick, (a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5 + thick);
    }
    ctx.closePath();
    const sandG = ctx.createLinearGradient(0, ridgeY - 64, 160, ridgeY + 8);
    sandG.addColorStop(0, pair[0]);
    sandG.addColorStop(0.55, pair[0]);
    sandG.addColorStop(1, pair[1]);
    ctx.fillStyle = sandG;
    ctx.fill();
    if (!feature) {
      ctx.save();
      ctx.clip();
      let k = 0;
      for (let p = 8; p < pts.length - 8; p += 7 + ((hash2(seed, 140 + p) * 4) | 0)) {
        const pt = pts[p];
        if (y1 - pt[1] < 10) continue;
        const sid = (id.stamp + k * 3 + ((hash2(seed, 150 + k) * 8) | 0)) % 8;
        ctx.globalAlpha = 0.24 + hash2(seed, 160 + k) * 0.26;
        blitBedStamp(sid, pt[0], pt[1] + 10, 48 + hash2(seed, 170 + k) * 64, 14 + hash2(seed, 180 + k) * 16,
          (hash2(seed, 190 + k) - 0.5) * 0.32, hash2(seed, 195 + k) > 0.5, seed + k * 13);
        ctx.globalAlpha = 1;
        k++;
      }
      ctx.restore();
    }
    for (let p = 6; p < pts.length - 6; p += 5) {
      const left = pts[p - 2][1], mid = pts[p][1], right = pts[p + 2][1];
      if (mid < left - 2 && mid < right - 2 && ridgeY - mid > 14) {
        sites.push({ x: pts[p][0], y: mid + 8, hw: 28, hh: ridgeY - mid, footY: ridgeY });
      }
    }
    if (lang === "gold") {
      let x = 70 + hash2(seed, 4) * 80;
      let m = 0;
      while (x < OCEAN.w - 60) {
        const foot = ridgeY - 2;
        const hw = 70 + hash2(seed, 220 + m) * 55;
        const hh = 28 + hash2(seed, 230 + m) * 22;
        sites.push(paintDuneLobe(x, foot, hw, hh, seed + 400 + m * 23, pair, (id.stamp + m) % 8));
        x += hw * 2.2 + 90 + hash2(seed, 235 + m) * 80;
        m++;
      }
    } else if (lang === "puffer") {
      let x = 80 + hash2(seed, 6) * 60;
      let m = 0;
      while (x < OCEAN.w - 50) {
        const cy = ridgeY - 4;
        const rw = 52 + hash2(seed, 260 + m) * 26;
        const rh = 18 + hash2(seed, 270 + m) * 10;
        ctx.fillStyle = pair[1];
        ctx.beginPath();
        ctx.ellipse(x, cy + 12, rw + 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#6a5830";
        ctx.beginPath();
        ctx.ellipse(x, cy + 2, rw, rh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a140c";
        ctx.beginPath();
        ctx.ellipse(x, cy + 4, rw * 0.62, rh * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(40, 28, 12, 0.55)";
        ctx.beginPath();
        ctx.ellipse(x + 2, cy + 6, rw * 0.38, rh * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pair[0];
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.ellipse(x, cy + 1, rw * 0.98, rh * 0.92, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        sites.push({ x, y: cy + 6, hw: rw, hh: rh * 2, footY: ridgeY });
        x += rw * 2.2 + 56 + hash2(seed, 275 + m) * 60;
        m++;
      }
    } else if (lang === "angel") {
      let x = 90 + hash2(seed, 7) * 70;
      let m = 0;
      while (x < OCEAN.w - 70) {
        const cy = ridgeY - 4;
        ctx.fillStyle = pair[1];
        ctx.beginPath();
        ctx.ellipse(x, cy + 8, 56, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pair[0];
        ctx.beginPath();
        ctx.moveTo(x - 58, cy + 10);
        for (let p = 0; p <= 6; p++) {
          const a = Math.PI + (p / 6) * Math.PI;
          const r = (p % 2 ? 36 : 16) + hash2(seed, 290 + m + p) * 10;
          ctx.lineTo(x + Math.cos(a) * r * 1.55, cy + Math.sin(a) * r * 0.85);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255, 236, 190, 0.22)";
        ctx.beginPath();
        ctx.ellipse(x, cy - 10, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        sites.push({ x, y: cy - 8, hw: 48, hh: 28, footY: ridgeY });
        x += 150 + hash2(seed, 296 + m) * 90;
        m++;
      }
    } else if (lang === "horse") {
      let x = 60 + hash2(seed, 8) * 50;
      let m = 0;
      while (x < OCEAN.w - 40) {
        const n = 3 + ((hash2(seed, 300 + m) * 3) | 0);
        for (let g = 0; g < n; g++) {
          const gx = x + g * (14 + hash2(seed, 305 + m + g) * 9);
          const foot = ridgeY;
          const hh = 42 + hash2(seed, 320 + m + g) * 34;
          const lean = (hash2(seed, 310 + m + g) - 0.5) * 16;
          plantInSand(gx, foot, 9, 4, 0.35);
          ctx.strokeStyle = hash2(seed, 312 + g) > 0.5 ? "#2a6a40" : "#1e4a30";
          ctx.lineWidth = 2.4 + hash2(seed, 314 + g) * 1.6;
          ctx.beginPath();
          ctx.moveTo(gx, foot);
          ctx.quadraticCurveTo(gx + lean * 0.4, foot - hh * 0.45, gx + lean, foot - hh);
          ctx.stroke();
          ctx.fillStyle = hash2(seed, 316 + g) > 0.45 ? "#3d8b4a" : "#c8a040";
          ctx.beginPath();
          ctx.ellipse(gx + lean, foot - hh - 2, 7 + hash2(seed, 318 + g) * 5, 11 + hash2(seed, 319 + g) * 6, lean * 0.04, 0, Math.PI * 2);
          ctx.fill();
          sites.push({ x: gx, y: foot - 4, hw: 12, hh, footY: ridgeY });
        }
        x += 120 + n * 16 + hash2(seed, 330 + m) * 80;
        m++;
      }
    } else {
      const extra = 1 + ((hash2(seed, 5) * 2) | 0);
      for (let m = 0; m < extra; m++) {
        const cx = 90 + hash2(seed, 200 + m) * (OCEAN.w - 180);
        const foot = ridgeY - 8 - hash2(seed, 210 + m) * 28;
        const hw = 36 + hash2(seed, 220 + m) * 40;
        const hh = 12 + hash2(seed, 230 + m) * 16;
        sites.push(paintDuneLobe(cx, foot, hw, hh, seed + 400 + m * 23, pair, (id.stamp + 5 + m * 2) % 8));
      }
    }
    for (let i = 0; i < sites.length; i++) {
      if (hash2(seed, 300 + i) < 0.38) continue;
      const p = sites[i];
      const px = p.x + (hash2(seed, 310 + i) - 0.5) * p.hw * 0.45;
      const py = p.y;
      plantInSand(px, py + 3, 14 + hash2(seed, 320 + i) * 10, 6 + hash2(seed, 322 + i) * 3, hash2(seed, 324 + i));
      if (lang === "trench" || lang === "glow") {
        ctx.fillStyle = lang === "glow" ? "rgba(180,90,255,0.4)" : "rgba(80,220,255,0.35)";
        ctx.globalAlpha = 0.22 + 0.32 * (0.5 + 0.5 * Math.sin(state.time * 2 + i));
        ctx.beginPath(); ctx.arc(px + 6, py - 10, 1.6 + hash2(seed, 330 + i) * 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (lang === "crystal" || lang === "starfall") {
        ctx.fillStyle = "rgba(200,240,255,0.34)";
        ctx.beginPath();
        ctx.moveTo(px - 3, py);
        ctx.quadraticCurveTo(px + 4 + hash2(seed, 332 + i) * 6, py - 18, px + 2, py - 30 - hash2(seed, 334 + i) * 12);
        ctx.quadraticCurveTo(px + 10, py - 12, px + 12, py);
        ctx.closePath();
        ctx.fill();
      } else if (lang === "shallow" || lang === "horse" || lang === "turtle") {
        ctx.strokeStyle = hash2(seed, 340 + i) > 0.5 ? "#2f8a5a" : "#3d8b4a";
        ctx.lineWidth = 1.7 + hash2(seed, 342 + i) * 1.5;
        const sway = Math.sin(state.time + i * 0.7) * (8 + hash2(seed, 344 + i) * 8);
        const h = lang === "horse" ? 38 : 30;
        ctx.beginPath();
        ctx.moveTo(px, py + 2);
        ctx.quadraticCurveTo(px + sway * 0.45, py - 16, px + sway * 0.15, py - h - hash2(seed, 346 + i) * 16);
        ctx.stroke();
      } else if (lang === "reef") {
        const rot = (hash2(seed, 350 + i) - 0.5) * 0.9;
        const sc = 0.65 + hash2(seed, 352 + i) * 0.65;
        ctx.fillStyle = hash2(seed, 354 + i) > 0.5 ? "#e85d6a" : "#c45ec8";
        ctx.beginPath();
        ctx.ellipse(px, py - 8, 13 * sc, 5.5 * sc, rot, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#5a6a70";
        ctx.beginPath();
        ctx.ellipse(px + 15 * sc, py + 1, 15 * sc, 7 * sc, rot * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (lang === "angel" || lang === "gold") {
        ctx.fillStyle = lang === "angel" ? "rgba(244, 232, 200, 0.55)" : "rgba(232, 192, 74, 0.45)";
        ctx.beginPath();
        ctx.ellipse(px, py - 6, 7 + hash2(seed, 356 + i) * 6, 3.2, (hash2(seed, 358 + i) - 0.5) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (lang === "puffer" || lang === "octo" || lang === "squid" || lang === "whale") {
        ctx.strokeStyle = lang === "puffer" ? "#3a7a48" : "rgba(120,200,220,0.45)";
        ctx.lineWidth = 1.8 + hash2(seed, 360 + i) * 1.3;
        const sway = Math.sin(state.time * 1.15 + i) * (8 + hash2(seed, 362 + i) * 7);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px + sway * 0.5, py - 22, px + sway * 0.12, py - 42 - hash2(seed, 364 + i) * 18);
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
  function appendDeckPoly(d) {
    if (d.taper) {
      const topW = d.w * (d.topW != null ? d.topW : 0.56);
      const inset = (d.w - topW) / 2;
      ctx.moveTo(d.x + inset, d.y);
      ctx.lineTo(d.x + d.w - inset, d.y);
      ctx.lineTo(d.x + d.w + 2, d.y + d.h);
      ctx.lineTo(d.x - 2, d.y + d.h);
      ctx.closePath();
    } else {
      ctx.rect(d.x, d.y, d.w, d.h);
    }
  }
  function clipOutDecks(decks) {
    if (!decks || !decks.length) return;
    ctx.beginPath();
    ctx.rect(-8000, -8000, 16000, 16000);
    for (let i = 0; i < decks.length; i++) appendDeckPoly(decks[i]);
    ctx.clip("evenodd");
  }
  function shopDryDecks() {
    // Leave a thin front lip so water can kiss the deck edge.
    const lip = 10;
    const decks = [
      { x: 90, y: 80, w: 1480, h: 300 },
      { x: 300, y: 300, w: 1140, h: 470 },
      { x: 800, y: 760, w: 176, h: 140 - lip, taper: true, topW: 0.62 },
      { x: 156, y: 380, w: 172, h: 240 },
      { x: 1272, y: 380, w: 188, h: 246 },
      { x: 140, y: 760, w: 180, h: 110 },
      { x: 500, y: 890, w: 760, h: 130 - lip },
    ];
    return decks;
  }
  function drawBayWater(x, y, w, h, t, teal, dry) {
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
    // Wet wash / caustics / glitter stay in the water. Dry boards are
    // punched out so a refraction band cannot sweep the deck.
    clipOutDecks(dry);
    const g = ctx.createLinearGradient(x, y, x, y + h);
    if (teal) {
      g.addColorStop(0, "#8af0e6");
      g.addColorStop(0.18, "#4ad4c8");
      g.addColorStop(0.42, "#1aa8a4");
      g.addColorStop(0.68, "#0c6a70");
      g.addColorStop(1, "#042028");
    } else {
      g.addColorStop(0, "#b8f2fa");
      g.addColorStop(0.16, "#6ec8dc");
      g.addColorStop(0.4, "#2a90a8");
      g.addColorStop(0.7, "#0c5870");
      g.addColorStop(1, "#041c28");
    }
    ctx.fillStyle = g;
    ctx.fillRect(x - 12, y - 12, w + 24, h + 24);
    ctx.save();
    for (let n = 0; n < 90; n++) {
      const px = x + hash2(n, 1) * w;
      const py = y + hash2(n, 4) * h;
      ctx.fillStyle = n % 2
        ? "rgba(200, 245, 250," + (0.03 + hash2(n, 7) * 0.05) + ")"
        : "rgba(4, 24, 36," + (0.04 + hash2(n, 8) * 0.06) + ")";
      ctx.beginPath();
      ctx.ellipse(px, py, 18 + hash2(n, 9) * 40, 8 + hash2(n, 11) * 22, hash2(n, 13) * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    for (let i = 0; i < 22; i++) {
      const bx = x + hash2(i, 3) * w;
      const by = y + 10 + hash2(i, 8) * h;
      const rad = 50 + hash2(i, 5) * 210;
      const blob = ctx.createRadialGradient(bx, by, 6, bx, by, rad);
      blob.addColorStop(0, teal
        ? (i % 3 ? "rgba(90, 230, 210, 0.14)" : "rgba(8, 50, 56, 0.16)")
        : (i % 3 ? "rgba(170, 240, 250, 0.14)" : "rgba(8, 40, 56, 0.14)"));
      blob.addColorStop(1, "rgba(8, 40, 56, 0)");
      ctx.fillStyle = blob;
      ctx.beginPath();
      ctx.ellipse(bx, by + Math.sin(t * 0.55 + i) * 16, rad, rad * (0.28 + hash2(i, 7) * 0.4), hash2(i, 9) * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    const cell = ATLAS.water;
    if (ART.ready && cell) {
      ctx.save();
      ctx.globalAlpha = 0.16;
      for (let n = 0; n < 3; n++) {
        const jx = x - 40 + hash2(n, 1) * (w * 0.28) + Math.sin(t * 0.18 + n) * 18;
        const jy = y - 10 + hash2(n, 4) * (h * 0.18);
        const jw = w * (0.55 + hash2(n, 6) * 0.2);
        const jh = h * (0.55 + hash2(n, 8) * 0.15);
        ctx.drawImage(ART.img, cell.x, cell.y, cell.w, cell.h, jx, jy, jw, jh);
      }
      ctx.restore();
      if (teal) {
        ctx.fillStyle = "rgba(18, 140, 132, 0.06)";
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
    ctx.globalAlpha = 0.10;
    ctx.strokeStyle = "#e8ffff";
    ctx.lineWidth = 1.15;
    for (let i = 0; i < 6; i++) {
      const yy = y + 22 + hash2(i, 2) * (h * 0.55) + Math.sin(t * 0.7 + i) * 12;
      const tilt = (hash2(i, 4) - 0.5) * 0.11;
      ctx.beginPath();
      let started = false;
      for (let px = x; px <= x + w; px += 16) {
        if (hash2(i, px | 0) < 0.28) { started = false; continue; }
        const py = yy + (px - x) * tilt + Math.sin(px * 0.012 + t * 1.4 + i) * 10 + Math.sin(px * 0.033 - t + i) * 4;
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
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
  function drawWetWaterline(x, y, w, t, dry) {
    ctx.save();
    clipOutDecks(dry);
    const a = ATLAS.waterline;
    const b = ATLAS.waterline2 || a;
    if (ART.ready && a) {
      ctx.save();
      let n = 0;
      for (let ix = x - 28; ix < x + w + 16; n++) {
        const cell = n % 2 ? b : a;
        const jw = 200 + hash2(n, 3) * 70;
        const jy = y - 20 + Math.sin(n * 1.1 + t) * 3.2 + hash2(n, 6) * 4;
        ctx.globalAlpha = 0.78 + hash2(n, 2) * 0.16;
        ctx.drawImage(ART.img, cell.x, cell.y, cell.w, cell.h, ix, jy, jw, 50 + hash2(n, 8) * 8);
        ix += jw * 0.62;
      }
      ctx.restore();
    }
    drawFoamBand(x - 6, y + 4, w + 12, t);
    ctx.restore();
  }
  function drawPierBoards(x, y, w, h, opts) {
    ensurePaint();
    // Integer deck + integer rows. A fractional camera Y or a
    // `plank - 0.35` step sheared each row into an offset band, and a
    // live atlas window wrapped mid-board into sky / water.
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const plank = Math.max(8, Math.round((opts && opts.plank) || 30));
    const wetY = opts && opts.wetY;
    const teal = !!(opts && opts.teal);
    const tile = teal ? paint.woodTeal : paint.wood;
    const alignY = opts && opts.alignY != null ? Math.round(opts.alignY) : y;
    const taper = !!(opts && opts.taper) || (h > w * 1.85);
    const topW = taper ? w * (opts && opts.topW != null ? opts.topW : 0.56) : w;
    ctx.save();
    if (taper) {
      const inset = (w - topW) / 2;
      ctx.beginPath();
      ctx.moveTo(x + inset, y);
      ctx.lineTo(x + w - inset, y);
      ctx.lineTo(x + w + 2, y + h);
      ctx.lineTo(x - 2, y + h);
      ctx.closePath();
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
    }
    // Continuous underpaint — gaps never flash the harbor / bay.
    const under = ctx.createLinearGradient(x, y, x + w * 0.12, y + h);
    if (teal) {
      under.addColorStop(0, "#9aaa86");
      under.addColorStop(0.55, "#7a8a68");
      under.addColorStop(1, "#5a6a48");
    } else {
      under.addColorStop(0, "#c89a62");
      under.addColorStop(0.55, "#9a6a38");
      under.addColorStop(1, "#6a4220");
    }
    ctx.fillStyle = under;
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    const startY = alignY + Math.floor((y - alignY) / plank) * plank;
    for (let yy = startY; yy < y + h; yy += plank) {
      const row = Math.round((yy - alignY) / plank);
      const ph = Math.min(plank + 1, y + h - yy);
      if (ph <= 0) break;
      const u = taper ? clamp((yy - y) / Math.max(1, h), 0, 1) : 1;
      const rowW = taper ? topW + (w - topW) * u : w;
      const rowX = taper ? x + (w - rowW) / 2 : x;
      // Long overlapping unique boards (C59). Stagger joints only —
      // do not shear the grain with a per-row source cut.
      const joint = (row % 2 ? 34 : 0) + Math.round(hash2(row, 2) * 16);
      let sx = rowX - joint;
      let n = 0;
      while (sx < rowX + rowW + 8) {
        const pw = 220 + Math.round(hash2(row * 19 + n * 13, 1) * 170) + ((row + n * 5) % 5) * 14;
        const overlap = 14;
        // One honey-pine tile. Sibling atlas cells (pale / teak / amber)
        // left rectangular patches whose edges cut the grain.
        const src = tile;
        const grade = hash2(row * 17 + n * 9, 4);
        ctx.save();
        if (src) {
          const pad = 2;
          const sw = Math.max(8, src.width - pad * 2);
          const sh = Math.max(8, src.height - pad * 2);
          if (hash2(row, n + 11) > 0.5) {
            ctx.translate(Math.round(sx + pw + overlap), yy);
            ctx.scale(-1, 1);
            ctx.drawImage(src, pad, pad, sw, sh, 0, 0, pw + overlap, ph);
          } else {
            ctx.drawImage(src, pad, pad, sw, sh, Math.round(sx), yy, pw + overlap, ph);
          }
        }
        ctx.restore();
        if (grade > 0.72) {
          ctx.fillStyle = "rgba(255, 214, 150, 0.035)";
          ctx.fillRect(sx, yy, pw, ph);
        } else if (grade < 0.16) {
          ctx.fillStyle = "rgba(70, 36, 12, 0.04)";
          ctx.fillRect(sx, yy, pw, ph);
        }
        const wear = hash2(row, n + 3);
        if (wear > 0.78) {
          ctx.strokeStyle = "rgba(255, 226, 160, 0.12)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          const gy = yy + 3 + hash2(n, 9) * (ph * 0.5);
          ctx.moveTo(sx + 12, gy);
          ctx.lineTo(sx + pw * 0.55, gy + 1);
          ctx.stroke();
        } else if (wear < 0.16) {
          ctx.strokeStyle = "rgba(40, 18, 8, 0.14)";
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          const gy = yy + ph * 0.45;
          ctx.moveTo(sx + pw * 0.18, gy);
          ctx.lineTo(sx + pw * 0.62, gy + 0.8);
          ctx.stroke();
        }
        if (teal) {
          ctx.fillStyle = "rgba(36, 82, 68, 0.06)";
          ctx.fillRect(sx, yy, pw, ph);
        }
        const lit = sunAmt(sx + pw * 0.5, yy);
        const shine = ctx.createLinearGradient(sx, yy, sx + pw * 0.7, yy + ph);
        shine.addColorStop(0, "rgba(255,226,160," + (0.03 + lit * 0.05) + ")");
        shine.addColorStop(0.5, "rgba(255,220,150,0)");
        shine.addColorStop(1, "rgba(28,14,6," + (0.04 + (1 - lit) * 0.06) + ")");
        ctx.fillStyle = shine;
        ctx.fillRect(sx, yy, pw, ph);
        // Unique knots — not the same stamp at both ends of every tile.
        if (hash2(row + n * 7, 8) > 0.55) {
          const kx = sx + 18 + hash2(row, n + 14) * Math.max(24, pw - 36);
          const ky = yy + 3 + hash2(n, 9) * (ph * 0.45);
          ctx.fillStyle = "rgba(22,12,6,0.55)";
          ctx.beginPath(); ctx.ellipse(kx, ky, 2.4 + hash2(n, 2) * 2.2, 1.4, hash2(n, 5) * 0.8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(255,220,160,0.28)";
          ctx.beginPath(); ctx.ellipse(kx - 0.6, ky - 0.5, 1.1, 0.6, 0, 0, Math.PI * 2); ctx.fill();
        }
        if (hash2(row + n, 15) > 0.62) {
          ctx.fillStyle = "rgba(22,12,6,0.55)";
          ctx.beginPath(); ctx.arc(sx + 8 + hash2(n, 1) * 6, yy + 4, 1.05, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(255,220,160,0.36)";
          ctx.beginPath(); ctx.arc(sx + 7.6 + hash2(n, 1) * 6, yy + 3.5, 0.35, 0, Math.PI * 2); ctx.fill();
        }
        // End-joint so neighboring boards do not melt into one tan slab.
        ctx.fillStyle = "rgba(28, 12, 6, 0.34)";
        ctx.fillRect(Math.round(sx + pw) - 1, yy, 2, ph);
        ctx.fillStyle = "rgba(255, 226, 170, 0.10)";
        ctx.fillRect(Math.round(sx + pw) - 2, yy, 1, ph);
        sx += pw;
        n++;
      }
      // C88 — board seams that survive a 390-wide phone. The old 1px
      // 0.14 groove vanished under the tan wash and read as a flat fill.
      ctx.fillStyle = "rgba(36, 16, 6, 0.42)";
      ctx.fillRect(rowX, yy + ph - 2, rowW, 2);
      ctx.fillStyle = "rgba(255, 228, 176, 0.16)";
      ctx.fillRect(rowX, yy + 0.5, rowW, 1);
    }
    ctx.restore();
    ctx.save();
    if (taper) {
      const inset = (w - topW) / 2;
      ctx.beginPath();
      ctx.moveTo(x + inset, y);
      ctx.lineTo(x + w - inset, y);
      ctx.lineTo(x + w + 2, y + h);
      ctx.lineTo(x - 2, y + h);
      ctx.closePath();
      ctx.clip();
    }
    ctx.fillStyle = "rgba(168, 108, 52, 0.05)";
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    if (wetY != null) {
      // Thin front lip only. The old 36+16 wash + sweeping sheen +
      // waterline tiles painted a refraction band across dry boards.
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      const lip = 10;
      const lipBot = Math.min(y + h, (wetY | 0) + 4);
      const lipTop = Math.max(y, lipBot - lip);
      const wetH = lipBot - lipTop;
      if (wetH > 1) {
        const wet = ctx.createLinearGradient(x, lipTop, x, lipBot);
        wet.addColorStop(0, "rgba(18,70,90,0)");
        wet.addColorStop(0.55, "rgba(16,60,78,0.10)");
        wet.addColorStop(1, "rgba(10,40,52,0.22)");
        ctx.fillStyle = wet;
        ctx.fillRect(x, lipTop, w, wetH);
      }
      ctx.restore();
    }
  }
  function drawDeckPosts(x, y, w, h, n) {
    const count = Math.max(2, n || 3);
    // Plant on the painted waterline — y+h+6 sat a few posts above the
    // foam when the aisle taper scrolled in, so one piling floated.
    const foot = 890;
    for (let i = 0; i < count; i++) {
      const px = x + 16 + (w - 32) * (i / Math.max(1, count - 1));
      const id = 40 + i + ((x + y) | 0) % 17;
      paintWorldSprite(px, foot, 40, function () {
        drawPierPost(px, foot, 0.62 + hash2(id, 3) * 0.28, id);
      });
    }
  }
  function onAisleForCam(x, y) {
    return x > AISLE.x - 8 && x < AISLE.x + AISLE.w + 8 &&
      y < 820 && y > AISLE.y - 20;
  }
  function shopViewBand() {
    if (player && (player.y < 800 || onAisleForCam(player.x, player.y))) return "plaza";
    if (player && player.y > 820) return "dock";
    if (cam && cam.y >= DOCK_CAM_FLOOR - 20) return "dock";
    if (cam && cam.y <= PLAZA_CAM_CEILING + 20) return "plaza";
    return "mid";
  }
  // Shop floor / kiosk / tanks belong to the plaza. The dock camera must
  // not peek them as a strip over the sky. C72 hid them by player band
  // only and pinned cam.y at 848 — that still framed the east shop deck
  // (y≈380–626) plus a sky void, then walking east yanked onto it.
  function plazaCamCeiling() {
    const z = Math.max(0.001, (cam && cam.z) || 1);
    const hhv = (H / 2) / z;
    // Dock boards / planted DIVE start at y=890. Keep that row fully
    // below the plaza view so DIVE cannot become a 19px sliver.
    const hideDock = 890 - hhv - 28;
    return Math.min(PLAZA_CAM_CEILING, hideDock);
  }
  function plazaCameraReady() {
    return !!(cam && cam.y <= PLAZA_CAM_CEILING + 36);
  }
  function dockCameraReady() {
    return !!(cam && cam.y >= DOCK_CAM_FLOOR - 24);
  }
  function shopCamYLimits() {
    const z = Math.max(0.001, cam.z || 1);
    const hhv = (H / 2) / z;
    // loop 126 no store-to-shore cut
    // Continuous shore camera: tank row through the DIVE pad.
    // plazaCamCeiling() used hideDock (890 - hhv - 28) as a
    // room wall so the pier stayed below the plaza view and
    // walking south jumped to DOCK_CAM_FLOOR. One minY/maxY
    // range — no hole between bowls and dock.
    // Tall portrait + stageZoom used to clamp maxY≈839, so the
    // dock camera (1000) was unreachable. Keep DIVE reachable.
    let minY = Math.min(hhv, PLAZA_CAM_CEILING);
    let maxY = Math.max(hhv, SHOP.h - hhv, DOCK_CAM_FLOOR);
    return { minY, maxY, hhv };
  }
  function plazaPropAlpha() {
    // loop 126 no store-to-shore cut
    // Store scrolls off as you walk. Do not pop tanks to
    // alpha 0 just because the player walked south of 840
    // or the camera left PLAZA_CAM_CEILING. A fade-to-zero
    // of the store while bowls are on screen is a cut.
    return 1;
  }
  function midWoodAlpha() {
    // loop 126 no store-to-shore cut
    // Mid wood is the aisle between bowls and pier.
    // Do not hard-cut it when the dock camera is up or
    // the walker is south of 860 — it scrolls off.
    return 1;
  }
  function aisleBoardAlpha() {
    // loop 126 no store-to-shore cut
    // Aisle wood stays painted while the walker scrolls
    // south. Do not drop it to a sliver just because the
    // camera left the plaza room. Dock still keeps the
    // ramp lip; store scrolls off, it does not pop.
    if (dockCameraReady() || (cam && cam.y >= 900)) return 0.72;
    return Math.max(0.82, midWoodAlpha());
  }
  function drawWalkRail(x, y, w, h, taper) {
    const topW = taper ? w * 0.56 : w;
    const edgeX = (yy) => {
      if (!taper) return { l: x + 5, r: x + w - 5 };
      const u = clamp((yy - y) / Math.max(1, h), 0, 1);
      const rw = topW + (w - topW) * u;
      const rx = x + (w - rw) / 2;
      return { l: rx + 5, r: rx + rw - 5 };
    };
    ctx.save();
    ctx.strokeStyle = "rgba(90, 48, 20, 0.42)";
    ctx.lineWidth = 3.2;
    const a = edgeX(y + 8), b = edgeX(y + h - 10);
    ctx.beginPath();
    ctx.moveTo(a.l, y + 8);
    ctx.lineTo(b.l, y + h - 10);
    ctx.moveTo(a.r, y + 8);
    ctx.lineTo(b.r, y + h - 10);
    ctx.stroke();
    ctx.strokeStyle = "rgba(196, 160, 80, 0.4)";
    ctx.lineWidth = 2;
    for (let yy = y + 24; yy < y + h - 16; yy += 46) {
      const e = edgeX(yy);
      ctx.beginPath();
      ctx.moveTo(e.l - 3, yy);
      ctx.lineTo(e.l + 5, yy);
      ctx.moveTo(e.r - 5, yy + 8);
      ctx.lineTo(e.r + 3, yy + 8);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawNorthPierCap(x, endY, w) {
    // Finished north end of the aisle ramp — last planks + rail so the
    // walkway vanishes into the harbor instead of a hard sky cut.
    const aisleY = 360, aisleH = 530, topW = w * 0.56;
    const u = clamp((endY - aisleY) / aisleH, 0, 1);
    const rw = topW + (w - topW) * u;
    const rx = x + (w - rw) / 2;
    ctx.save();
    const haze = ctx.createLinearGradient(rx, endY - 22, rx, endY + 18);
    haze.addColorStop(0, "rgba(216, 196, 164, 0.22)");
    haze.addColorStop(1, "rgba(216, 196, 164, 0)");
    ctx.fillStyle = haze;
    ctx.fillRect(rx - 10, endY - 22, rw + 20, 40);
    ctx.fillStyle = "#6b3a18";
    ctx.fillRect(rx - 6, endY - 8, rw + 12, 12);
    ctx.fillStyle = "#c89a62";
    ctx.fillRect(rx - 4, endY - 5, rw + 8, 6);
    ctx.fillStyle = "rgba(255, 226, 170, 0.16)";
    ctx.fillRect(rx - 4, endY - 5, rw + 8, 2);
    const posts = [rx + 10, rx + rw * 0.5, rx + rw - 10];
    for (let i = 0; i < posts.length; i++) {
      const px = posts[i];
      ctx.fillStyle = "#4a2a14";
      ctx.fillRect(px - 3.2, endY - 30, 6.4, 32);
      ctx.fillStyle = "rgba(255, 214, 150, 0.20)";
      ctx.fillRect(px - 3.2, endY - 30, 2.2, 32);
    }
    ctx.fillStyle = "#5a3418";
    ctx.fillRect(rx + 6, endY - 32, rw - 12, 5);
    ctx.fillStyle = "#c49248";
    ctx.fillRect(rx + 6, endY - 30, rw - 12, 3);
    ctx.strokeStyle = "rgba(90, 48, 20, 0.55)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(rx + 8, endY - 28);
    ctx.lineTo(rx - 4, endY + 40);
    ctx.moveTo(rx + rw - 8, endY - 28);
    ctx.lineTo(rx + rw + 4, endY + 40);
    ctx.stroke();
    ctx.restore();
  }
  function drawEastPierCap(endX, y, h) {
    // Finished east end of the shop dock — last-plank end board + two
    // posts standing above the deck, same language as the north cap.
    // Decorative only; shopDockWalk / snap stay at x=1260.
    ctx.save();
    const haze = ctx.createLinearGradient(endX - 18, y, endX + 46, y);
    haze.addColorStop(0, "rgba(216, 196, 164, 0)");
    haze.addColorStop(1, "rgba(216, 196, 164, 0.18)");
    ctx.fillStyle = haze;
    ctx.fillRect(endX - 18, y - 36, 68, h + 52);
    ctx.fillStyle = "#6b3a18";
    ctx.fillRect(endX - 8, y - 8, 16, h + 18);
    ctx.fillStyle = "#c89a62";
    ctx.fillRect(endX - 5, y - 5, 10, h + 12);
    ctx.fillStyle = "rgba(255, 226, 170, 0.18)";
    ctx.fillRect(endX - 5, y - 5, 3, h + 12);
    const posts = [y + 28, y + h - 24];
    for (let i = 0; i < posts.length; i++) {
      const py = posts[i];
      ctx.fillStyle = "#4a2a14";
      ctx.fillRect(endX - 6, py - 44, 8, 48);
      ctx.fillStyle = "rgba(255, 214, 150, 0.22)";
      ctx.fillRect(endX - 6, py - 44, 2.6, 48);
    }
    ctx.fillStyle = "#5a3418";
    ctx.fillRect(endX - 10, y - 20, 20, 6);
    ctx.fillStyle = "#c49248";
    ctx.fillRect(endX - 10, y - 18, 20, 3);
    ctx.strokeStyle = "rgba(90, 48, 20, 0.58)";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(endX - 58, y - 16);
    ctx.lineTo(endX + 8, y - 16);
    ctx.moveTo(endX - 4, y - 16);
    ctx.lineTo(endX - 4, y + h + 4);
    ctx.stroke();
    ctx.restore();
  }
  function drawDockWaterEdge(x, y, w, h) {
    // C91 — south lip of the shop dock. Fascia + connected pilings +
    // foam so the boards do not hard-cut onto a flat blue fill. Town
    // stays backdrop; shopDockWalk / snap stay put.
    const lipY = y + h;
    ctx.save();
    const shade = ctx.createLinearGradient(x, lipY - 8, x, lipY + 28);
    shade.addColorStop(0, "rgba(8, 20, 28, 0)");
    shade.addColorStop(0.35, "rgba(8, 18, 24, 0.28)");
    shade.addColorStop(1, "rgba(4, 12, 18, 0)");
    ctx.fillStyle = shade;
    ctx.fillRect(x - 6, lipY - 6, w + 12, 36);
    ctx.fillStyle = "#3a1c0c";
    ctx.fillRect(x - 2, lipY - 12, w + 4, 18);
    ctx.fillStyle = "#8a5a30";
    ctx.fillRect(x, lipY - 10, w, 12);
    ctx.fillStyle = "#c49248";
    ctx.fillRect(x, lipY - 10, w, 5);
    ctx.fillStyle = "rgba(255, 226, 170, 0.22)";
    ctx.fillRect(x, lipY - 10, w, 2.2);
    ctx.fillStyle = "rgba(20, 10, 6, 0.4)";
    ctx.fillRect(x, lipY + 2, w, 3);
    const posts = 5;
    for (let i = 0; i < posts; i++) {
      const px = x + 28 + (w - 56) * (i / Math.max(1, posts - 1));
      const id = 90 + i + ((x | 0) % 11);
      const sc = 0.78 + hash2(id, 3) * 0.18;
      ctx.save();
      ctx.globalAlpha = 0.92;
      drawPierPost(px, lipY + 22, sc, id);
      ctx.restore();
      ctx.fillStyle = "#5a3418";
      ctx.fillRect(px - 5, lipY - 10, 10, 12);
      ctx.fillStyle = "#c49248";
      ctx.fillRect(px - 4, lipY - 8, 8, 5);
    }
    drawFoamBand(x - 8, lipY + 4, w + 16, state.time);
    const t = state.time || 0;
    for (let i = 0; i < w; i += 18) {
      const px = x + i + Math.sin(t * 1.8 + i * 0.05) * 5;
      const py = lipY + 6 + Math.sin(t * 2.4 + i * 0.08) * 2.4;
      const r = 10 + (i * 11) % 7;
      ctx.fillStyle = "rgba(255,255,255," + (0.52 + 0.28 * Math.sin(t * 2 + i * 0.04)) + ")";
      ctx.beginPath(); ctx.ellipse(px, py, r, 5.2, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  function drawPlazaShopWall() {
    // C88 — painted pier-shop clapboard behind the tank row. Not a
    // red/white candy awning. Same x-span as the roof band; does not
    // move walk colliders or tank positions.
    const x = 90, y = 48, w = 1480, h = 118;
    const wall = ctx.createLinearGradient(x, y, x, y + h);
    wall.addColorStop(0, "#4a9a94");
    wall.addColorStop(0.42, "#2f7872");
    wall.addColorStop(1, "#1b5854");
    ctx.fillStyle = wall;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(255, 226, 176, 0.07)";
    ctx.fillRect(x, y, w, 18);
    ctx.strokeStyle = "rgba(12, 42, 40, 0.32)";
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 6; i++) {
      const yy = y + 16 + i * 16;
      ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke();
    }
    ctx.fillStyle = "rgba(232, 156, 112, 0.20)";
    for (let i = 0; i < 5; i++) {
      roundRect(x + 36 + i * 292, y + 22, 248, 72, 8); ctx.fill();
    }
    ctx.fillStyle = "#f2e4c6";
    ctx.fillRect(x, y, w, 11);
    ctx.fillStyle = "#c4a06a";
    ctx.fillRect(x, y + 11, w, 3);
    ctx.fillStyle = "#3a2416";
    ctx.fillRect(x, y + h - 8, w, 8);
    ctx.fillStyle = "rgba(255, 236, 196, 0.14)";
    ctx.fillRect(x, y + h - 9, w, 2);
  }
  function drawPlazaRoofBand() {
    ctx.fillStyle = "#6a3a18";
    ctx.fillRect(90, 148, 1480, 20);
    ctx.fillStyle = "rgba(232, 192, 74, 0.22)";
    ctx.fillRect(90, 148, 1480, 5);
    ctx.fillStyle = "#4a2810";
    ctx.fillRect(90, 166, 1480, 3);
  }
  function drawPlazaLantern(lx, ly) {
    const lg = ctx.createRadialGradient(lx, ly + 10, 6, lx, ly + 24, 110);
    lg.addColorStop(0, "rgba(255, 200, 110, 0.38)");
    lg.addColorStop(0.45, "rgba(255, 180, 80, 0.12)");
    lg.addColorStop(1, "rgba(255, 170, 70, 0)");
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(lx, ly + 22, 110, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#8a5a28";
    ctx.beginPath();
    ctx.moveTo(lx - 7, ly - 32);
    ctx.lineTo(lx + 7, ly - 32);
    ctx.lineTo(lx + 5, ly - 14);
    ctx.lineTo(lx - 5, ly - 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f4d078";
    ctx.beginPath(); ctx.ellipse(lx, ly, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#c49210"; ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = "rgba(90, 48, 20, 0.45)";
    ctx.beginPath(); ctx.moveTo(lx, ly - 32); ctx.lineTo(lx, ly - 8); ctx.stroke();
  }
  function drawPierShade() {
    const sh = ctx.createLinearGradient(80, 70, 1680, 110);
    sh.addColorStop(0, "rgba(28, 40, 62, 0.28)");
    sh.addColorStop(0.28, "rgba(36, 48, 68, 0.1)");
    sh.addColorStop(0.58, "rgba(255, 214, 130, 0)");
    sh.addColorStop(1, "rgba(255, 204, 100, 0.08)");
    ctx.fillStyle = sh;
    ctx.fillRect(80, 70, 1600, 300);
    const eaves = ctx.createLinearGradient(80, 70, 80, 188);
    eaves.addColorStop(0, "rgba(18, 14, 10, 0.38)");
    eaves.addColorStop(0.55, "rgba(22, 16, 10, 0.14)");
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
  function drawLanternfish(s, t, wob, look) {
    const glow = 0.42 + 0.28 * Math.sin((t || 0) * 5.2);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const halo = ctx.createRadialGradient(8 * s, 1.2 * s, 1, 8 * s, 1.2 * s, 16 * s);
    halo.addColorStop(0, "rgba(255, 230, 120," + (0.55 + glow * 0.35) + ")");
    halo.addColorStop(0.4, "rgba(255, 200, 80, 0.18)");
    halo.addColorStop(1, "rgba(255, 180, 40, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(8 * s, 1.2 * s, 16 * s, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#1a3040";
    ctx.beginPath();
    ctx.moveTo(-18 * s, 0);
    ctx.lineTo(-24 * s, -5 * s + wob * 3);
    ctx.quadraticCurveTo(-20 * s, 0, -24 * s, 5 * s - wob * 3);
    ctx.closePath(); ctx.fill();
    const body = ctx.createLinearGradient(-10 * s, -6 * s, 10 * s, 6 * s);
    body.addColorStop(0, "#2a4a58");
    body.addColorStop(0.55, "#1a3040");
    body.addColorStop(1, "#0c1820");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0.4 * s, 0, 11.2 * s, 4.6 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f4d06a";
    ctx.beginPath(); ctx.arc(8.2 * s, 1.1 * s, 1.7 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,240,160,0.85)";
    ctx.beginPath(); ctx.arc(8.2 * s, 1.1 * s, 0.7 * s, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1a3040"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.ellipse(0.4 * s, 0, 11.2 * s, 4.6 * s, 0, 0, Math.PI * 2); ctx.stroke();
    drawFishEye(s, 6.4, -1.4, look.x, look.y);
  }
  function drawFishBody(sp, x, y, ang, scale, t) {
    const s0 = scale || 1;
    const rates = [10, 14, 6.2, 7.2, 4, 5.4, 4.6, 8.2, 3.4, 9, 12, 6.4, 3.2, 11];
    const amts = [0.12, 0.2, 0.16, 0.1, 0.08, 0.1, 0.08, 0.14, 0.1, 0.16, 0.18, 0.1, 0.06, 0.14];
    const wob = Math.sin((t || 0) * (rates[sp.id] || 10)) * (amts[sp.id] || 0.12);
    // loop 140 fish face where they swim — rotating a side-view sprite by
    // the full heading flipped it belly-up when it swam left (ang≈π). Mirror
    // horizontally to face left, and apply only a gentle vertical tilt, so a
    // fish never goes upside down. Seahorse / octopus / crab keep their own
    // dampened spin (they read top-down, not side-on) and never mirror-flip.
    const topView = sp.id === 5 || sp.id === 8 || sp.id === 9;
    const flip = topView ? 1 : (Math.cos(ang) < 0 ? -1 : 1);
    const tiltCap = sp.id === 5 ? 0.24 : 0.5;
    const pitch = clamp(Math.atan2(Math.sin(ang), Math.abs(Math.cos(ang))), -tiltCap, tiltCap);
    const rot = topView ? ang * (sp.id === 8 ? 0.22 : sp.id === 9 ? 0.12 : 0.16) : pitch;
    if (blit("fish" + sp.id, x, y, { rot: rot + wob * 0.35, scaleX: flip, scale: s0 * 0.52, water: true })) return;
    ctx.save();
    ctx.translate(x, y);
    if (sp.id === 4) { drawTurtle(ang, scale, t); ctx.restore(); return; }
    if (sp.id === 8) { ctx.rotate(ang * 0.25); drawOctopus(scale, t, 0, fishLook(sp, t)); ctx.restore(); return; }
    if (sp.id === 9) { ctx.rotate(ang * 0.15); drawCrab(scale, t, Math.sin(t * 8) * 0.8, fishLook(sp, t)); ctx.restore(); return; }
    ctx.scale(flip, 1);
    ctx.rotate(rot);
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
    else if (sp.id === 13) drawLanternfish(s, t, wob, look);
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
    const bounce = opt.idle === "bounce" ? 1.15 : 0.45;
    const bob = Math.max(0, Math.sin(opt.bob || 0) * bounce) - hop;
    const walk = Math.sin((opt.bob || 0) * 1.6);
    const squash = 1 + walk * 0.07 + (hop ? 0.08 : 0);
    const kid = !!opt.kid;
    sitShadow(x + 2, y + 6, kid ? 11 : 17, kid ? 4.6 : 6.4, 0.52);
    const spr = blit(custSpriteName(opt), x, y + bob + 1.8, {
      flip: (opt.vx || 0) < -8,
      scale: (kid ? 0.5 : 0.58) * (1 + walk * 0.03),
      noShadow: true,
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
      if (opt.carry >= 0) {
        if (opt.crew) drawFishBody(SPECIES[opt.carry] || SPECIES[0], 16, -8, 0.22, 0.82, state.time);
        else drawCarryParcel(16, -6);
      }
      if (opt.goggles) {
        ctx.fillStyle = "#1a2830";
        ctx.fillRect(-7.2, -18.8, 14.4, 3.4);
        ctx.fillStyle = "rgba(90, 210, 230, 0.62)";
        ctx.fillRect(-6.4, -18.4, 5.4, 2.4);
        ctx.fillRect(1.0, -18.4, 5.4, 2.4);
      }
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
    if (opt.goggles) {
      ctx.fillStyle = "#1a2830";
      ctx.fillRect(-7.2, -18.8, 14.4, 3.4);
      ctx.fillStyle = "rgba(90, 210, 230, 0.62)";
      ctx.fillRect(-6.4, -18.4, 5.4, 2.4);
      ctx.fillRect(1.0, -18.4, 5.4, 2.4);
    } else if (opt.sunglasses) {
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
    if (opt.carry >= 0) {
      if (opt.crew) drawFishBody(SPECIES[opt.carry] || SPECIES[0], 14, -4, 0.22, 0.82, state.time);
      else drawCarryParcel(14, -2);
    }
    }
    if (opt.crew) {
      ctx.fillStyle = "rgba(18, 32, 42, 0.9)";
      roundRect(-20, -40, 40, 12, 4); ctx.fill();
      ctx.fillStyle = opt.carry >= 0 ? "#ffe27a" : "#9ef0ff";
      ctx.font = "800 8px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(opt.carry >= 0 ? "STOCK" : "DIVER", 0, -31);
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
        const fit = fitSpeechLocal(x, y + bob, bx, ey, bw, bh);
        bx = fit.bx;
        ey = fit.ey;
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
    ctx.fillStyle = "rgba(255,236,210,0.12)";
    ctx.beginPath(); ctx.arc(tipX - 3.8, tipY - 2.2, 0.55, 0, Math.PI * 2); ctx.fill();
  }
  function gaitIndex(phase, n) {
    let u = phase / (Math.PI * 2);
    u -= Math.floor(u);
    if (u < 0) u += 1;
    return (u * n) | 0;
  }
  function blitGait(skin, kind, idx, x, y, opt) {
    if (blit(skin + "_" + kind + idx, x, y, opt)) return true;
    if (kind === "walk") return blit(skin + (idx % 2 ? "_walk" : "_stand"), x, y, opt);
    return blit(skin + "_dive", x, y, opt);
  }
  function drawDiveWalkCue() {
    if (!diveWalkQueued()) return;
    const pulse = 0.78 + 0.18 * Math.sin(state.time * 8);
    const label = "heading to DIVE";
    ctx.save();
    ctx.font = "800 15px Fredoka, sans-serif";
    ctx.textAlign = "center";
    const tw = 156;
    const th = 26;
    const x = player.x - tw / 2;
    const y = player.y - 86;
    ctx.globalAlpha = pulse;
    roundRect(x, y, tw, th, 8);
    ctx.fillStyle = "rgba(18, 48, 58, 0.94)";
    ctx.fill();
    ctx.strokeStyle = "rgba(158, 240, 255, 0.9)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.fillStyle = "#9ef0ff";
    ctx.fillText(label, player.x, y + 18);
    ctx.restore();
  }
  // C123 — blit scaleX from a body-turn, never through 0.
  // flip swaps at the thin midpoint; yaw thins to ~0.62, not a line.
  // loop 123 body turn not paper flip
  function faceDrawX(faceS, extraX) {
    const flip = faceS < 0 ? -1 : 1;
    const yaw = 1 - Math.abs(faceS);
    const body = 1 - yaw * 0.38;
    return flip * body * (extraX == null ? 1 : extraX);
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
    const moving = sp > 18;
    const phase = moving ? walkPhase : bobT * 0.7;
    const passing = Math.sin(phase);
    const contact = Math.cos(phase);
    // C58 — plant soles on the boards. Old bob (−1.5…+2.5) plus strideX
    // fought the floor and the flip origin; painted walk frames already stride.
    const bob = moving ? Math.max(0, 0.9 - Math.abs(passing) * 1.05) : Math.sin(phase) * 0.28;
    const walk = passing;
    const swing = passing * (moving ? 0.55 : 0.18);
    const faceS = p.faceS != null ? p.faceS : (Math.cos(facing) < -0.38 ? -1 : 1);
    const flip = faceS < 0 ? -1 : 1;
    const turnThin = 1 - Math.abs(faceS);
    const lean = leanAmt * (faceS >= 0 ? 1 : -1);
    // loop 135 dino turns flat — the floatie / snorkel / mask sit on one
    // side, so faceDrawX's squash-then-mirror swaps them across the body
    // at the thin midpoint and reads as a paper flip (loop 123 only killed
    // the through-zero collapse, not the asymmetric mirror). For the
    // asymmetric dino, mirror flat: full width, sign only, no yaw squash.
    // Reef / Skip keep the loop 123 yaw turn — they read front-symmetric.
    const asymTurn = skin === "dino";
    const turnThinDraw = asymTurn ? 0 : turnThin;
    const yawTwist = turnThinDraw * 0.16;
    const turnScaleX = (extraX) => {
      const ex = extraX == null ? 1 : extraX;
      return asymTurn ? flip * ex : faceDrawX(faceS, extraX);
    };
    const drawSc = p.drawScale == null ? 1 : p.drawScale;
    const short = drawSc * (skin === "reef" ? 0.98 : skin === "dino" ? 1.02 : 1.1);
    const blitSc = 0.42 * short;
    const squashX = moving ? 1 + Math.abs(contact) * 0.018 : 1;
    const squashY = moving ? 1 - Math.abs(contact) * 0.022 : 1;
    // Sink soles 2px into the plank seam so they read as standing on wood,
    // not hovering on the grain. Shadow sits on the same baseline.
    const plant = y + 2.4 + bob;
    shadow(x, y + 3, moving ? 13 : 11, moving ? 4.8 : 4.0);
    const fi = moving ? gaitIndex(walkPhase, 6) : 0;
    const skipAtlas = !!p.paintOnly;
    const skipCard = skipAtlas || skin === "dino";
    if (!skipAtlas && moving) {
      if (blitGait(skin, "walk", fi, x, plant, {
        scaleX: turnScaleX(squashX), scaleY: squashY + turnThinDraw * 0.08,
        rot: lean * 0.16 + yawTwist, scale: blitSc, flat: true,
      })) return;
    } else if (
      (!skipCard && blit(skin + "_card", x, plant, {
        scaleX: turnScaleX(), scaleY: 1 + turnThinDraw * 0.06,
        rot: lean * 0.1 + yawTwist, scale: blitSc, flat: true,
      })) ||
      (!skipAtlas && blit(skin + "_stand", x, plant, {
        scaleX: turnScaleX(), scaleY: 1 + turnThinDraw * 0.06,
        rot: lean * 0.1 + yawTwist, scale: blitSc, flat: true,
      })) ||
      (skin === "dino" && blit("dino_walk0", x, plant, {
        scaleX: turnScaleX(), scaleY: 1 + turnThinDraw * 0.06,
        rot: lean * 0.1 + yawTwist, scale: blitSc, flat: true,
      }))
    ) return;
    ctx.save();
    ctx.translate(x, plant);
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
      ctx.fillStyle = "#3a8a44";
      ctx.beginPath();
      ctx.moveTo(-11, -8);
      ctx.quadraticCurveTo(-13, 2, -9, 12);
      ctx.lineTo(9, 12);
      ctx.quadraticCurveTo(13, 2, 11, -8);
      ctx.closePath(); ctx.fill();
      // Matte kids-paint dabs — same read as Reef / Skip, not a glossy toy.
      ctx.fillStyle = "rgba(30, 74, 36, 0.32)";
      ctx.beginPath(); ctx.ellipse(-3.2, 2, 3.4, 2.2, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(4.4, 6, 2.8, 1.8, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2f7a3a";
      ctx.beginPath(); ctx.ellipse(-4, -1, 2.2, 1.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5, 3, 2.5, 1.7, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e85d4c";
      ctx.beginPath(); ctx.arc(3.4, -3.2, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd24a";
      ctx.beginPath(); ctx.arc(-5.2, 5.2, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8a96a0";
      roundRect(-17, -9, 8, 16, 3); ctx.fill();
      ctx.fillStyle = "#5a6874"; ctx.fillRect(-15.2, -9, 3.4, 16);
      ctx.fillStyle = "#3a8a44";
      ctx.save(); ctx.translate(-10, 6); ctx.rotate(-0.55 + walk * 0.18);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.quadraticCurveTo(-10, 4, -17, 1);
      ctx.quadraticCurveTo(-9, 10, 1, 5); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(moving ? 1.4 : 0, 0);
      ctx.rotate(lean * 0.2);
      ctx.fillStyle = "#2f7a3a";
      fillCapsule(0, -9, 0, -13.4, 2.5);
      ctx.fillStyle = "#3a8a44";
      ctx.beginPath(); ctx.ellipse(0, -18.2, 8.2, 8.8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(8.8, -16.2, 5.8, 3.5, 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2a1a12";
      ctx.beginPath(); ctx.arc(-2.4, -18.4, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(2.6, -18.2, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255, 236, 200, 0.14)";
      ctx.beginPath(); ctx.arc(-3.1, -19.2, 0.35, 0, Math.PI * 2); ctx.fill();
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
  function paintSwimFlipper(side, kick, skin) {
    const dino = skin === "dino";
    const col = dino ? "#4aaa4a" : "#2ec8c4";
    const edge = dino ? "#1e4a24" : "#146a6e";
    const tip = dino ? "#8fd86a" : "#f0b429";
    ctx.save();
    ctx.translate(dino ? -20 : -32, side * (dino ? 7.2 : 8.6));
    ctx.rotate(side * (0.38 + kick * 0.92));
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(dino ? -12 : -20, side * (dino ? 5.2 : 8.4));
    ctx.quadraticCurveTo(dino ? -16 : -28, side * 0.8, dino ? -11 : -18, side * -1.6);
    ctx.lineTo(1, side * -0.7);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.fillStyle = tip;
    ctx.beginPath();
    ctx.moveTo(dino ? -8 : -14, side * (dino ? 2.2 : 3.4));
    ctx.lineTo(dino ? -12 : -20, side * (dino ? 5.0 : 8.0));
    ctx.lineTo(dino ? -10 : -16, side * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, side * 0.6);
    ctx.lineTo(dino ? -10 : -16, side * (dino ? 3.2 : 5.2));
    ctx.stroke();
    ctx.restore();
  }
  function drawSwimPaddle(skin, phase, kickWave, stroke, arms) {
    paintSwimFlipper(1, kickWave, skin);
    paintSwimFlipper(-1, -kickWave, skin);
    if (skin === "dino" && arms) {
      ctx.save();
      ctx.translate(-6 + kickWave * 3.2, 1);
      ctx.rotate(-0.18 + kickWave * 0.42);
      ctx.fillStyle = "#3d9a4a";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-16, kickWave * 6, -28, kickWave * 3);
      ctx.quadraticCurveTo(-16, 8 + kickWave * 2, 2, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f0b429";
      ctx.beginPath();
      ctx.moveTo(-10, 1);
      ctx.lineTo(-18, kickWave * 4);
      ctx.lineTo(-8, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(2, stroke * 1.8);
      ctx.strokeStyle = "rgba(255, 140, 60, 0.85)";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(4, 0, 9.5, 0.4 + kickWave * 0.15, Math.PI * 1.7 + kickWave * 0.15);
      ctx.stroke();
      ctx.restore();
    } else if (arms) {
      const arm = 0.55 + stroke * 0.7;
      drawLimbChain(8, -5.4, -1.15 + arm, 8.2, -0.4, 6.6, 2.3, "#f0c2a0");
      drawLimbChain(6, 5.8, 1.2 - arm * 0.85, 7.4, 0.35, 6.0, 2.2, "#f0c2a0");
    }
  }
  function drawDiver(x, y, ang, t, skinId) {
    const skin = normalizeSkin(skinId != null ? skinId : state.skin);
    ctx.save();
    ctx.fillStyle = "rgba(4, 22, 40, 0.28)";
    ctx.beginPath();
    ctx.ellipse(x, y + 11, 20, 7.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const phase = player.walkPhase != null ? player.walkPhase : t;
    const kickWave = Math.sin(phase);
    const stroke = Math.sin(phase + 1.15);
    // C58 — atlas swim frames are already horizontal. Rotating by full
    // facing (dock walk is ≈π/2 down) stood the diver upright in the bay.
    const faceS = player.faceS != null ? player.faceS : (Math.cos(ang) < -0.38 ? -1 : 1);
    const flip = faceS < 0 ? -1 : 1;
    const headingPitch = Math.sin(ang) * 0.38;
    // loop 141 real diving angle — weight the vertical-velocity pitch fully
    // and open the clamp so a descent reads head-down (~50°), an ascent
    // head-up, and a level swim still lies prone (belly-down) at pitch≈0.
    const pitch = clamp((player.pitch || 0) * 1.0 + headingPitch + kickWave * 0.05, -0.9, 0.9);
    const sway = Math.sin(t * 8) * 0.03;
    const tilt = pitch + sway;
    const fi = gaitIndex(phase, 6);
    // C123 — body-turn scaleX, never paper-flip through 0. Small yaw
    // twist only — do not rotate by full facing (C58 swim stays flat).
    // loop 123 body turn not paper flip
    // loop 136 dino swims flat — same asymmetric-mirror fix as loop 135's
    // walk turn: the dino's floatie / snorkel sit on one side, so the
    // faceDrawX squash-then-mirror swaps them at the thin midpoint and
    // reads as a paper flip. Mirror the dino swim flat (full width, sign
    // only, no yaw twist); Reef / Skip keep the loop 123 yaw swim.
    const asymTurn = skin === "dino";
    const swimYaw = asymTurn ? 0 : (1 - Math.abs(faceS)) * 0.16;
    const swimScaleX = asymTurn
      ? flip * (1 + Math.abs(kickWave) * 0.04)
      : faceDrawX(faceS, 1 + Math.abs(kickWave) * 0.04);
    const drew = blitGait(skin, "swim", fi, x, y, {
      rot: tilt * flip + swimYaw,
      scale: 0.58,
      scaleX: swimScaleX,
      scaleY: 1 - Math.abs(kickWave) * 0.045,
      water: true,
    });
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip, 1);
    ctx.rotate(tilt);
    if (drew) {
      ctx.restore();
      return;
    }
    drawSwimPaddle(skin, phase, kickWave, stroke, true);
    const kick = kickWave * 0.48;
    drawLimbChain(-2, 4, Math.PI * 0.92 + kick * 0.35, 8, kick * 0.4, 7, 2.4, skin === "dino" ? "#2a6a34" : "#243848");
    drawLimbChain(2, 4, -Math.PI * 0.92 - kick * 0.35, 8, -kick * 0.4, 7, 2.4, skin === "dino" ? "#2a6a34" : "#243848");
    if (skin === "dino") {
      ctx.fillStyle = "#b8c4ce";
      roundRect(-13, -8, 9, 16, 3); ctx.fill();
      ctx.fillStyle = "#7a8c9c"; ctx.fillRect(-11, -8, 3.6, 16);
      const db = ctx.createLinearGradient(-4, -10, 10, 10);
      db.addColorStop(0, "#54b45e");
      db.addColorStop(1, "#2a6a34");
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
  function drawDiveSign(cx, footY) {
    // Yard-sign post planted on the boards. Hook, chains, and board
    // share one integer X so a snapped camera cannot slide the hang
    // off the pole. Never blit the atlas divepad sticker.
    cx = Math.round(cx);
    footY = Math.round(footY);
    sitShadow(cx, footY + 8, 18, 8, 0.56);
    ctx.save();
    ctx.translate(cx, footY);
    // Stained pole — darker than the honey dock so the hang has a
    // readable centerline. Symmetric, integer X.
    const post = ctx.createLinearGradient(-7, -124, 7, 10);
    post.addColorStop(0, "#8a5a28");
    post.addColorStop(0.4, "#5a3214");
    post.addColorStop(1, "#2a1408");
    ctx.fillStyle = post;
    ctx.beginPath();
    ctx.moveTo(-7, -124);
    ctx.lineTo(7, -124);
    ctx.lineTo(7, 6);
    ctx.lineTo(-7, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 214, 150, 0.16)";
    ctx.fillRect(-7, -124, 3, 130);
    ctx.fillStyle = "rgba(10, 4, 2, 0.35)";
    ctx.fillRect(4, -124, 3, 130);
    ctx.strokeStyle = "rgba(30, 14, 6, 0.7)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-7, -124, 14, 130);
    ctx.fillStyle = "#3a2010";
    for (const by of [-108, -52, -8]) {
      ctx.fillRect(-8, by, 16, 5);
      ctx.fillStyle = "#c8a060";
      ctx.fillRect(-8, by, 16, 1.2);
      ctx.fillStyle = "#3a2010";
    }
    ctx.fillStyle = "#3a2010";
    ctx.beginPath();
    ctx.moveTo(-9, 6);
    ctx.lineTo(9, 6);
    ctx.lineTo(5, 11);
    ctx.lineTo(-5, 11);
    ctx.closePath();
    ctx.fill();
    // Iron hook on the post centerline — the hang origin.
    ctx.strokeStyle = "#1a1008";
    ctx.lineWidth = 3.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -118);
    ctx.lineTo(0, -100);
    ctx.arc(0, -92, 8, -Math.PI * 0.5, Math.PI * 0.72, false);
    ctx.stroke();
    ctx.fillStyle = "#1a1008";
    ctx.beginPath(); ctx.arc(0, -118, 3.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c8a060";
    ctx.beginPath(); ctx.arc(-0.6, -118.6, 0.9, 0, Math.PI * 2); ctx.fill();
    const bw = 80, bh = 50;
    const boardTop = -78;
    ctx.strokeStyle = "#4a2814";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -86);
    ctx.lineTo(-22, boardTop + 2);
    ctx.moveTo(0, -86);
    ctx.lineTo(22, boardTop + 2);
    ctx.stroke();
    ctx.fillStyle = "#3a2010";
    ctx.beginPath(); ctx.arc(-22, boardTop + 2, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(22, boardTop + 2, 2.1, 0, Math.PI * 2); ctx.fill();
    const board = ctx.createLinearGradient(-bw / 2, boardTop, bw / 2 * 0.4, boardTop + bh);
    board.addColorStop(0, "#d8a868");
    board.addColorStop(0.4, "#b07a3a");
    board.addColorStop(1, "#6a4220");
    ctx.fillStyle = board;
    roundRect(-bw / 2, boardTop, bw, bh, 6); ctx.fill();
    if (ART.ready && ATLAS.plank) {
      ctx.save();
      roundRect(-bw / 2, boardTop, bw, bh, 6); ctx.clip();
      ctx.globalAlpha = 0.58;
      ctx.drawImage(ART.img, ATLAS.plank.x, ATLAS.plank.y, ATLAS.plank.w, ATLAS.plank.h,
        -bw / 2 - 2, boardTop - 2, bw + 4, bh + 4);
      ctx.restore();
    }
    sunWashBox(-bw / 2, boardTop, bw, bh, 6);
    ctx.strokeStyle = "rgba(80, 42, 16, 0.55)";
    ctx.lineWidth = 2;
    roundRect(-bw / 2, boardTop, bw, bh, 6); ctx.stroke();
    ctx.fillStyle = "rgba(40, 22, 10, 0.22)";
    roundRect(-bw / 2 + 6, boardTop + 6, bw - 12, bh - 12, 5); ctx.fill();
    ctx.fillStyle = "#ead7b4";
    roundRect(-bw / 2 + 8, boardTop + 8, bw - 16, bh - 16, 4); ctx.fill();
    ctx.fillStyle = "rgba(255, 236, 190, 0.14)";
    ctx.fillRect(-bw / 2 + 10, boardTop + 10, bw - 20, 8);
    ctx.fillStyle = "#5a3614";
    ctx.beginPath(); ctx.arc(-22, boardTop + 18, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(22, boardTop + 18, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c8a060";
    ctx.beginPath(); ctx.arc(-22.4, boardTop + 17.6, 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(21.6, boardTop + 17.6, 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#5a3614";
    ctx.font = "800 16px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("· DIVE ·", 0, boardTop + bh * 0.52);
    ctx.textBaseline = "alphabetic";
    ctx.restore();
  }
  function drawLifeRing(x, y) {
    sitShadow(x + 5, y + 22, 26, 8, 0.46);
    // Lean on the boards and take the shared sun — not a face-on sticker.
    if (blit("lifering", x + 1, y + 10, { scale: 0.82, rot: -0.16, noShadow: true })) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.16);
    const ring = ctx.createLinearGradient(-18, -16, 14, 14);
    ring.addColorStop(0, "#f07860");
    ring.addColorStop(0.45, "#e85d4c");
    ring.addColorStop(1, "#8a2c22");
    ctx.strokeStyle = ring; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#fff6e8"; ctx.lineWidth = 8;
    ctx.setLineDash([8, 8]); ctx.lineDashOffset = 4;
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#c4483a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(255, 228, 170, 0.35)"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(-3, -6, 15, -2.4, -0.6); ctx.stroke();
    ctx.restore();
  }
  function drawAnchor(x, y) {
    groundBlob(x, y + 18, 20, 6);
    if (blit("anchor", x, y + 6, { scale: 0.72, noShadow: true })) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "#6a4a32"; ctx.lineWidth = 4.2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, 16); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -16, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-14, 6); ctx.quadraticCurveTo(0, 22, 14, 6);
    ctx.stroke();
    ctx.restore();
  }
  function drawBaitShack(x, y) {
    // C92 — pier bait hut, not a toy triangle roof. Planted at BAIT_HUT
    // (~y 918). Wood walls, porch post, hanging life ring, BAIT on the
    // facade. Paint only; walk colliders stay put.
    drawPierBoards(x - 52, y + 62, 112, 28, { plank: 14 });
    sitShadow(x + 2, y + 80, 54, 13, 0.5);
    const bw = 84, bh = 70;
    const bx = x - 38, by = y + 8;
    // porch post — fat front-left timber; the ring hangs off it
    const postX = bx - 12;
    const post = ctx.createLinearGradient(postX, by - 4, postX + 12, y + 84);
    post.addColorStop(0, "#d4a058");
    post.addColorStop(0.4, "#8a5a30");
    post.addColorStop(1, "#3a1c0c");
    ctx.fillStyle = post;
    ctx.fillRect(postX, by - 2, 10, 82);
    ctx.fillStyle = "rgba(255, 226, 170, 0.32)";
    ctx.fillRect(postX, by - 2, 3.2, 82);
    ctx.fillStyle = "#3a1c0c";
    ctx.fillRect(postX - 3, y + 76, 16, 7);
    ctx.fillStyle = "#5a3418";
    ctx.fillRect(postX - 1, by - 6, 36, 8);
    ctx.fillStyle = "#c49248";
    ctx.fillRect(postX - 1, by - 6, 36, 3);
    const wall = ctx.createLinearGradient(bx, by, bx + bw * 0.16, by + bh);
    wall.addColorStop(0, "#d4a868");
    wall.addColorStop(0.38, "#8a5a30");
    wall.addColorStop(1, "#4a2814");
    ctx.fillStyle = wall;
    roundRect(bx, by, bw, bh, 3); ctx.fill();
    if (ART.ready && ATLAS.plank) {
      ctx.save();
      roundRect(bx, by, bw, bh, 3); ctx.clip();
      ctx.globalAlpha = 0.55;
      ctx.drawImage(ART.img, ATLAS.plank.x, ATLAS.plank.y, ATLAS.plank.w, ATLAS.plank.h,
        bx - 2, by - 2, bw + 4, bh + 4);
      ctx.restore();
    }
    ctx.strokeStyle = "rgba(40, 18, 8, 0.4)";
    ctx.lineWidth = 1.3;
    for (let i = 1; i < 7; i++) {
      const sx = bx + 5 + i * 11;
      ctx.beginPath(); ctx.moveTo(sx, by + 3); ctx.lineTo(sx, by + bh - 3); ctx.stroke();
    }
    sunWashBox(bx, by, bw, bh, 3);
    // Shallow shed roof on the walls — not a lone toy triangle.
    ctx.fillStyle = "#6b2418";
    ctx.fillRect(bx - 8, by - 4, bw + 16, 12);
    ctx.fillStyle = "#c4483a";
    ctx.fillRect(bx - 6, by - 8, bw + 12, 10);
    ctx.fillStyle = "#e85d4c";
    ctx.fillRect(bx - 6, by - 8, bw + 12, 4);
    ctx.fillStyle = "#e8c04a";
    ctx.fillRect(bx - 8, by + 2, bw + 16, 4);
    ctx.fillStyle = "#2a1408";
    roundRect(x - 6, by + 28, 20, bh - 30, 3); ctx.fill();
    ctx.fillStyle = "#3a2010";
    roundRect(x - 4, by + 30, 16, bh - 34, 2); ctx.fill();
    ctx.fillStyle = "#e8c04a";
    ctx.beginPath(); ctx.arc(x + 8, by + 52, 1.7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#123844";
    roundRect(bx + 8, by + 28, 18, 16, 2); ctx.fill();
    ctx.fillStyle = "rgba(158, 240, 255, 0.4)";
    roundRect(bx + 9, by + 29, 16, 14, 2); ctx.fill();
    ctx.strokeStyle = "#e8c04a"; ctx.lineWidth = 1.6;
    roundRect(bx + 8, by + 28, 18, 16, 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + 17, by + 28); ctx.lineTo(bx + 17, by + 44); ctx.stroke();
    // BAIT on the facade, not the roof.
    ctx.fillStyle = "#3a1c0c";
    roundRect(x - 26, by + 8, 52, 18, 3); ctx.fill();
    ctx.fillStyle = "#7a3e16";
    roundRect(x - 28, by + 6, 56, 18, 3); ctx.fill();
    ctx.strokeStyle = "#ffe27a"; ctx.lineWidth = 1.8;
    roundRect(x - 26, by + 8, 52, 14, 2); ctx.stroke();
    ctx.fillStyle = "#fff6e8";
    ctx.font = "800 13px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BAIT", x, by + 15);
    ctx.textBaseline = "alphabetic";
    // hanging life ring on the porch post
    ctx.save();
    ctx.translate(postX - 2, by + 36);
    ctx.strokeStyle = "#2a1a10";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(6, -22); ctx.lineTo(2, -8); ctx.stroke();
    const ring = ctx.createLinearGradient(-12, -10, 10, 10);
    ring.addColorStop(0, "#f07860");
    ring.addColorStop(0.5, "#e85d4c");
    ring.addColorStop(1, "#8a2c22");
    ctx.strokeStyle = ring; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#fff6e8"; ctx.lineWidth = 7;
    ctx.setLineDash([6.5, 6.5]); ctx.lineDashOffset = 3;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#c4483a"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 15.5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  function drawWreckLamp(x, y) {
    // loop 149 — hanging wreck lantern. Same dusk-dock language as OPEN /
    // the bait hut: sit shadow, sway, warm glass. Brighter pulse so the
    // east dock reads as changed after Nico's sale. Continue with
    // wreckLamp already true still paints it.
    if (!state.wreckLamp) return;
    const sway = Math.sin(state.time * 1.55) * 0.07;
    const pulse = 0.58 + Math.sin(state.time * 2.6) * 0.22;
    sitShadow(x + 2, y + 58, 22, 10, 0.28 + pulse * 0.16);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sway);
    ctx.scale(1.35, 1.35);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const halo = ctx.createRadialGradient(0, 24, 2, 0, 24, 40);
    halo.addColorStop(0, "rgba(255, 226, 122," + (0.62 + pulse * 0.28) + ")");
    halo.addColorStop(0.42, "rgba(244, 208, 106," + (0.24 + pulse * 0.12) + ")");
    halo.addColorStop(0.78, "rgba(158, 240, 255, 0.08)");
    halo.addColorStop(1, "rgba(158, 240, 255, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(0, 24, 40, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#2a1a10";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke();
    ctx.fillStyle = "#3a1c0c";
    ctx.beginPath(); ctx.arc(0, -8, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#5a3418";
    roundRect(-8, 6, 16, 6, 2); ctx.fill();
    ctx.fillStyle = "#c49248";
    roundRect(-7, 7, 14, 3, 1); ctx.fill();
    ctx.fillStyle = "rgba(255, 236, 160, 0.78)";
    ctx.beginPath();
    ctx.moveTo(-8, 12);
    ctx.lineTo(-11, 28);
    ctx.quadraticCurveTo(0, 36, 11, 28);
    ctx.lineTo(8, 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(158, 240, 255, 0.28)";
    ctx.beginPath();
    ctx.moveTo(-4, 14);
    ctx.lineTo(-6, 26);
    ctx.quadraticCurveTo(0, 30, 1, 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe27a";
    ctx.beginPath(); ctx.ellipse(0, 22, 3.4, 6.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath(); ctx.ellipse(0, 23, 1.5, 3.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3a1c0c";
    roundRect(-6, 30, 12, 4, 1); ctx.fill();
    ctx.fillStyle = "#e8c04a";
    roundRect(-5, 31, 10, 2, 1); ctx.fill();
    ctx.restore();
  }
  function drawPopCan(cx, cy, col, top) {
    ctx.fillStyle = col;
    roundRect(cx - 9, cy - 4, 18, 24, 4); ctx.fill();
    ctx.fillStyle = top || "#fff6e8";
    ctx.beginPath(); ctx.ellipse(cx, cy - 4, 9, 3.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255, 246, 232, 0.42)";
    ctx.fillRect(cx - 6.5, cy - 1, 3.4, 16);
    ctx.fillStyle = "rgba(16, 8, 4, 0.22)";
    ctx.beginPath(); ctx.ellipse(cx, cy + 20, 9, 2.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255, 236, 190, 0.4)";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, cy - 4, 7.6, 2.6, 0, 0, Math.PI * 2); ctx.stroke();
  }
  function drawVending(x, y) {
    // C91 — soda cooler, not a 40px stick of dots. Planted at POP_VEND.
    // Body + glass + cans; paint only, no walk collider.
    const bw = 78, bh = 118;
    const bx = x - 44, by = y - 12;
    sitShadow(x - 2, y + 104, 38, 11, 0.48);
    const body = ctx.createLinearGradient(bx, by, bx + bw * 0.2, by + bh);
    body.addColorStop(0, "#f4efe6");
    body.addColorStop(0.35, "#d8c4a0");
    body.addColorStop(1, "#8a6a48");
    ctx.fillStyle = body;
    roundRect(bx, by, bw, bh, 8); ctx.fill();
    ctx.fillStyle = "#c4483a";
    roundRect(bx, by, bw, 22, 8); ctx.fill();
    ctx.fillRect(bx, by + 14, bw, 10);
    ctx.fillStyle = "#ffe27a";
    roundRect(bx + 12, by + 5, bw - 24, 14, 3); ctx.fill();
    ctx.fillStyle = "#5a1810";
    ctx.font = "800 13px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("POP", x - 5, by + 16);
    const glass = ctx.createLinearGradient(bx + 8, by + 28, bx + 8, by + 90);
    glass.addColorStop(0, "#9ef0ff");
    glass.addColorStop(0.18, "#2a7d8a");
    glass.addColorStop(0.72, "#123844");
    glass.addColorStop(1, "#0a181c");
    ctx.fillStyle = "#d8e0e4";
    roundRect(bx + 7, by + 26, 50, 68, 5); ctx.fill();
    ctx.fillStyle = glass;
    roundRect(bx + 10, by + 29, 44, 62, 4); ctx.fill();
    ctx.save();
    roundRect(bx + 10, by + 29, 44, 62, 4); ctx.clip();
    const cans = [
      [bx + 22, by + 44, "#e85d4c", "#ffe27a"],
      [bx + 42, by + 44, "#3d8bfd", "#fff6e8"],
      [bx + 22, by + 72, "#f0b429", "#fff6e8"],
      [bx + 42, by + 72, "#7ad08a", "#e8fff0"],
    ];
    for (let i = 0; i < cans.length; i++) {
      drawPopCan(cans[i][0], cans[i][1], cans[i][2], cans[i][3]);
    }
    ctx.fillStyle = "rgba(220, 250, 255, 0.22)";
    ctx.beginPath();
    ctx.moveTo(bx + 12, by + 30);
    ctx.lineTo(bx + 22, by + 30);
    ctx.lineTo(bx + 16, by + 82);
    ctx.lineTo(bx + 10, by + 82);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#2a1a14";
    roundRect(bx + 60, by + 30, 12, 60, 3); ctx.fill();
    ctx.fillStyle = "#8a9aa4";
    roundRect(bx + 62, by + 50, 6, 24, 2); ctx.fill();
    ctx.fillStyle = "#3a2415";
    roundRect(bx + 8, by + 98, bw - 16, 16, 3); ctx.fill();
    ctx.fillStyle = "#ffe27a";
    ctx.font = "800 11px Nunito, sans-serif";
    ctx.fillText("POP", x - 5, by + 110);
    ctx.fillStyle = "#7dffa0";
    ctx.beginPath(); ctx.arc(bx + bw - 14, by + 106, 3.8, 0, Math.PI * 2); ctx.fill();
    sunWashBox(bx, by, bw, bh, 8);
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
    ctx.fillStyle = "rgba(8, 28, 40, 0.38)";
    ctx.beginPath(); ctx.ellipse(SUN.dx * 0.4, 22, 56, 11, 0.04, 0, Math.PI * 2); ctx.fill();
    const hull = ctx.createLinearGradient(-18, -12, 16, 18);
    hull.addColorStop(0, "#e07058");
    hull.addColorStop(0.42, "#c4483a");
    hull.addColorStop(1, "#6a1c14");
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(-48, 3);
    ctx.quadraticCurveTo(-42, 17, -10, 19);
    ctx.lineTo(30, 17);
    ctx.quadraticCurveTo(54, 11, 48, 2);
    ctx.lineTo(38, -7);
    ctx.quadraticCurveTo(6, -13, -30, -7);
    ctx.quadraticCurveTo(-52, -2, -48, 3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255, 210, 160, 0.22)";
    ctx.beginPath();
    ctx.moveTo(-22, -4);
    ctx.quadraticCurveTo(4, -10, 26, -3);
    ctx.quadraticCurveTo(6, 1, -22, -4);
    ctx.fill();
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
    // C76 — gallery tanks sit in the aisle neighborhood, not a second
    // east-pier building 500px away.
  }
  function drawShop() {
    ensurePaint();
    ctx.fillStyle = "#0a3040";
    ctx.fillRect(-480, -240, shopW() + 960, SHOP.h + 480);
    drawShopHarbor(!!state.unlocked[1]);
    // Bay water starts under the distant shore so the mid-shop sides are
    // ocean (foam / depth), not town tiles floating on the surface.
    const dryDecks = shopDryDecks();
    drawBayWater(-8, 772, shopW() + 16, SHOP.h - 764, state.time, !!state.unlocked[1], dryDecks);
    drawWetWaterline(-8, 886, shopW() + 16, state.time, dryDecks);
    for (const t of dockTeasers) {
      if (onDryWood(t.x, t.y) || t.y < 1080) continue;
      const ta = worldSpriteAlpha(t.x, t.y, 26);
      if (ta <= 0.04) continue;
      ctx.save();
      if (state.unlocked[1]) {
        ctx.globalAlpha = 0.78 * ta;
      } else {
        ctx.globalAlpha = 0.38 * ta;
        ctx.filter = "brightness(0.22) saturate(0.35)";
      }
      drawFishBody(SPECIES[t.s], t.x, t.y, 0.08, 1.22, state.time + t.ph);
      ctx.filter = "none";
      ctx.restore();
    }
    const dockPosts = [
      [148, 1086, 0.82, 0], [392, 1062, 1.46, 1], [448, 1080, 0.94, 2],
      [718, 1056, 1.40, 3], [886, 1074, 1.08, 4], [1062, 1090, 1.52, 5],
      [1218, 1060, 0.86, 6], [1394, 1078, 1.26, 7], [shopW() - 48, 1068, 1.16, 8],
    ];
    // C58 — dock pilings sort with the walker so feet do not draw through
    // the front posts. Far-side posts still paint as waterline backdrop.
    for (const [px, py, sc, id] of dockPosts) {
      if (py < 1008) {
        paintWorldSprite(px, py, 36, function () { drawPierPost(px, py, sc, id); });
      }
    }
    const teal = !!state.unlocked[1];
    const plazaA = plazaPropAlpha();
    const midA = midWoodAlpha();
    const aisleA = aisleBoardAlpha();
    // Main plaza deck stays opaque — fading it punched sky through the
    // aisle. It sits off-screen at the dock camera (cam.y ≥ 1000).
    // Dock camera still crops to the playfield so the rail is not a saw.
    // Plaza camera paints the full tank neighborhood — C76's deckEnd cut
    // a vertical seam through Turtle into the dusk town.
    const deckEnd = playfieldWorldRight() - 56;
    // loop 126 no store-to-shore cut
    // Full plaza neighborhood stays painted. It scrolls off
    // when the camera walks south — do not shrink it just
    // because the camera left PLAZA_CAM_CEILING.
    const plazaFull = true;
    const plazaW = plazaFull ? 1480 : Math.max(0, Math.min(1480, deckEnd - 90));
    if (plazaW > 24 && (plazaA > 0.04 || dockCameraReady())) {
      drawPierBoards(90, 80, plazaW, 300, { plank: 26, teal: teal, alignY: 80 });
    }
    if (plazaA > 0.04) {
      const yardW = plazaFull ? 1140 : Math.max(0, Math.min(1140, deckEnd - 300));
      if (yardW > 24) drawPierBoards(300, 300, yardW, 470, { plank: 26, teal: teal, alignY: 80 });
    }
    if (aisleA > 0.04) {
      ctx.save();
      ctx.globalAlpha = aisleA;
      const dockLooking = (player && player.y > 820) || (cam && cam.y >= 860);
      if (dockLooking) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(760, NORTH_WALK_CAP_Y, 256, 280);
        ctx.clip();
        drawPierBoards(800, 760, 176, 140, { plank: 26, wetY: 890, teal: teal, taper: true, topW: 0.62, alignY: 80 });
        drawWalkRail(800, 760, 176, 140, true);
        ctx.restore();
        drawNorthPierCap(800, NORTH_WALK_CAP_Y, 176);
      } else {
        drawPierBoards(800, 760, 176, 140, { plank: 26, wetY: 890, teal: teal, taper: true, topW: 0.62, alignY: 80 });
        drawWalkRail(800, 760, 176, 140, true);
      }
      ctx.restore();
    }
    if (plazaA > 0.04) {
      ctx.save();
      ctx.globalAlpha = plazaA;
      const westW = plazaFull ? 172 : Math.max(0, Math.min(172, deckEnd - 156));
      if (westW > 20) drawPierBoards(156, 380, westW, 240, { plank: 20, teal: teal, alignY: 80 });
      // Full east deck when the plaza camera is up — shrinking to
      // deckEnd made eastW=0 at cam.x≈880, so feet and POP sat on sky.
      const eastPaint = plazaFull ? 188 : Math.max(0, Math.min(188, playfieldWorldRight() - 8 - 1272));
      if (eastPaint > 20) drawPierBoards(1272, 380, eastPaint, 246, { plank: 20, teal: teal, alignY: 80 });
      drawPierBoards(140, 760, 180, 110, { plank: 18, teal: teal, alignY: 80 });
      drawPierShade();
      const sunPatch = ctx.createRadialGradient(1240, 220, 20, 1100, 420, 520);
      sunPatch.addColorStop(0, "rgba(255, 220, 130, 0.16)");
      sunPatch.addColorStop(1, "rgba(255, 200, 100, 0)");
      ctx.fillStyle = sunPatch;
      ctx.fillRect(90, 80, 1480, 300);
      ctx.restore();
    }
    if (midA > 0.04) {
      ctx.save();
      ctx.globalAlpha = midA;
      ctx.strokeStyle = "rgba(255, 214, 130, 0.18)";
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(880, 860);
      ctx.lineTo(880, 760);
      ctx.quadraticCurveTo(760, 700, 520, 520);
      ctx.quadraticCurveTo(340, 500, 250, 520);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 236, 180, 0.10)";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = "rgba(90, 48, 20, 0.28)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(760, 880);
    for (let x = 760; x < 1000; x += 24) ctx.lineTo(x, 872 + Math.sin(x * 0.05) * 2);
    ctx.stroke();
    // aisle water — painted channel, wet wood lip, no hard teal slab.
    // Hidden on the dock camera so it does not become a leftover teal column
    // over the harbor town.
    const ax = AISLE.x, ay = Math.max(AISLE.y, 340), aw = AISLE.w, ah = AISLE.h - (Math.max(AISLE.y, 340) - AISLE.y);
    if (midA > 0.04) {
    ctx.save();
    ctx.globalAlpha = midA;
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
      ctx.globalAlpha = 0.28 * midA;
      blitTile("water", ax - 24, ay - 12, aw + 48, ah + 24);
    }
    ctx.globalAlpha = midA;
    drawCaustics(ax, ay, aw, ah, state.time, 0.2);
    ctx.globalAlpha = 0.28 * midA;
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
    ctx.restore();
    }
    // warm sun key + lamp glows along the back wall — plaza only
    if (plazaA > 0.04) {
      ctx.save();
      ctx.globalAlpha = plazaA;
      drawSunDisc(1588, 28, 22);
      const key = ctx.createRadialGradient(1520, 40, 20, 1100, 420, 920);
      key.addColorStop(0, "rgba(255, 214, 120, 0.2)");
      key.addColorStop(0.45, "rgba(255, 190, 90, 0.06)");
      key.addColorStop(1, "rgba(255, 180, 80, 0)");
      ctx.fillStyle = key;
      ctx.fillRect(80, 50, 1600, 360);
      drawPlazaShopWall();
      drawPlazaRoofBand();
      for (const lx of [400, 880, 1360]) drawPlazaLantern(lx, 86);
      if (state.unlocked[1]) drawFramedPrint(220, 76, 1);
      if (state.unlocked[2]) drawCoralSouvenir(508, 92);
      if (state.unlocked[3]) drawFramedPrint(1124, 76, 3);
      if (state.unlocked[4]) drawCoralSouvenir(1508, 92);
      if (state.decor && state.decor[0]) drawStringLights();
      ctx.restore();
    }
    {
      const dockW = Math.max(0, Math.min(760, deckEnd - 500));
      if (dockW > 24) {
        drawPierBoards(500, 890, dockW, 130, { plank: 28, wetY: 1010 });
        drawDockWaterEdge(500, 890, dockW, 130);
        drawEastPierCap(500 + dockW, 890, 130);
      }
    }
    // Soft jump glow in the water — never a dashed debug rectangle.
    // C86 — queued plaza DIVE brightens the pad so the walk has a target.
    const headingPad = diveWalkQueued();
    const padPulse = headingPad ? (0.55 + 0.35 * Math.sin(state.time * 7.2)) : 0;
    const glow = ctx.createRadialGradient(880, 1040, 20, 880, 1048, headingPad ? 340 : 280);
    glow.addColorStop(0, headingPad
      ? ("rgba(160, 250, 255," + (0.42 + padPulse * 0.22) + ")")
      : "rgba(160, 250, 255, 0.22)");
    glow.addColorStop(0.4, headingPad
      ? ("rgba(80, 210, 230," + (0.20 + padPulse * 0.12) + ")")
      : "rgba(80, 210, 230, 0.10)");
    glow.addColorStop(1, "rgba(80, 210, 230, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(880, 1048, headingPad ? 330 : 290, headingPad ? 78 : 62, 0, 0, Math.PI * 2);
    ctx.fill();
    const chip = diveChipBox();
    // Planted DIVE post on the left lip — board hangs off the walk lane.
    const diveSign = { x: 598, y: 1014 };
    if (state.mode === "play") btn("dive-chip", ...screenBtnFromWorld(chip.x, chip.y, chip.w, chip.h));
    const pathPts = [
      [880, 1008], [880, 860], [880, 760], [663, 568], [445, 352],
      [720, 500], [520, 500], [340, 500], [250, 520],
    ];
    ctx.fillStyle = "rgba(255, 236, 180, 0.42)";
    for (let i = 0; i < pathPts.length - 1; i++) {
      if (midA < 0.04 && pathPts[i][1] < 880 && pathPts[i + 1][1] < 880) continue;
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
    if (plazaA > 0.04) {
      ctx.save();
      ctx.globalAlpha = plazaA;
      paintWorldSprite(140, 400, 28, function () { drawPot(140, 400, "#4cba6a"); });
      paintWorldSprite(1468, 420, 28, function () { drawPot(1468, 420, "#3aa35a"); });
      paintWorldSprite(168, 780, 36, function () { drawPot(168, 780, "#3aa35a", 1.7); });
      paintWorldSprite(1448, 640, 36, function () { drawPot(1448, 640, "#2e8b4a", 1.75); });
      paintWorldSprite(381, 748, 52, function () { drawCrateStack(360, 760); });
      ctx.restore();
    }
    paintRailProp(EAST_CRATES.x + 21, EAST_CRATES.y - 12, 72, function () {
      drawCrateStack(EAST_CRATES.x, EAST_CRATES.y);
    });
    paintWorldSprite(1024, 961, 36, function () { drawCrate(1004, 948, 40, 26); });
    paintWorldSprite(1031, 939, 32, function () { drawCrate(1014, 928, 34, 22); });
    paintWorldSprite(748, 944, 28, function () { drawMopBucket(748, 944); });
    paintWorldSprite(1148, 942, 48, function () { drawBench(1108, 942); });
    paintWorldSprite(512, 918, 28, function () { drawLifeRing(512, 918); });
    if (dayBoardReady()) {
      paintWorldSprite(DAY_BOARD.x, DAY_BOARD.y, 52, function () { drawDayBoard(DAY_BOARD.x, DAY_BOARD.y); });
    }
    {
      const diveA = worldBoxAlpha(diveSign.x - 48, diveSign.y - 136, 96, 152);
      if (diveA > 0.04) {
        ctx.save();
        ctx.globalAlpha = diveA;
        drawDiveSign(diveSign.x, diveSign.y);
        ctx.restore();
      }
    }
    paintWorldSprite(1196, 952, 32, function () { drawAnchor(1196, 952); });
    paintRailProp(POP_VEND.x, POP_VEND.y + 38, 96, function () { drawVending(POP_VEND.x, POP_VEND.y); });
    paintRailProp(OPEN_SIGN.x, OPEN_SIGN.y - 18, 96, function () { drawHangingSign(OPEN_SIGN.x, OPEN_SIGN.y); });
    paintRailProp(BAIT_HUT.x, BAIT_HUT.y + 36, 96, function () { drawBaitShack(BAIT_HUT.x, BAIT_HUT.y); });
    if (state.wreckLamp) {
      paintRailProp(WRECK_LAMP.x, WRECK_LAMP.y + 28, 72, function () { drawWreckLamp(WRECK_LAMP.x, WRECK_LAMP.y); });
    }
    drawSkiff(pierLife.skiff);
    drawGull(pierLife.gull);
    drawGull(pierLife.gull2);
    drawBoat();
    if (plazaA > 0.04) {
      ctx.save();
      ctx.globalAlpha = plazaA;
      if (state.decor && state.decor[2]) drawFountain();
      drawWelcome();
      drawRegister(); drawKiosk();
      if (galleryOpen()) drawEastGallery();
      ensureUnlockFlags();
      for (let i = 0; i < SPECIES.length; i++) {
        if (tankLive(i)) drawTank(i);
      }
      ctx.restore();
    }
    if (midA > 0.04 && !state.unlockBanner && (state.aisleSchoolWait || 0) <= 0 &&
        !(state.fadeDir && state.pendingScene === "ocean")) {
      ctx.save();
      ctx.globalAlpha = midA;
      roundRect(AISLE.x, AISLE.y, AISLE.w, AISLE.h, 18);
      ctx.clip();
      for (const sw of state.shopSwimmers) {
        if (!inAisleWater(sw.x, sw.y) || onDryWood(sw.x, sw.y)) continue;
        const sa = worldSpriteAlpha(sw.x, sw.y, 28);
        if (sa <= 0.04) continue;
        ctx.save();
        ctx.globalAlpha *= sa;
        const ang = (sw.vx >= 0 ? 1 : -1) * Math.PI / 2;
        drawFishBody(SPECIES[sw.s], sw.x, sw.y, ang + Math.sin(state.time * 2 + sw.ph) * 0.12, 1.15, state.time + sw.ph);
        ctx.restore();
      }
      ctx.restore();
    }
    const actors = [];
    function pushActorPerson(c) {
      actors.push({
        y: c.y,
        draw: function () {
          if (c.y < 860) {
            const a = plazaPropAlpha();
            if (a <= 0.04) return;
            ctx.save();
            ctx.globalAlpha *= a;
            drawPerson(c.x, c.y, c);
            ctx.restore();
          } else {
            drawPerson(c.x, c.y, c);
          }
        },
      });
    }
    for (const c of customers) pushActorPerson(c);
    for (const d of crew) pushActorPerson(d);
    actors.push({ y: player.y, draw: function () { drawPlayer(player.x, player.y); } });
    if (diveWalkQueued()) {
      actors.push({ y: player.y + 1, draw: drawDiveWalkCue });
    }
    for (let i = 0; i < dockPosts.length; i++) {
      const px = dockPosts[i][0], py = dockPosts[i][1], sc = dockPosts[i][2], id = dockPosts[i][3];
      if (py < 1008) continue;
      actors.push({
        y: py,
        draw: function () {
          paintWorldSprite(px, py, 36, function () { drawPierPost(px, py, sc, id); });
        },
      });
    }
    actors.sort(function (a, b) { return a.y - b.y; });
    for (let i = 0; i < actors.length; i++) actors[i].draw();
    if (plazaA > 0.04) {
      ctx.save();
      ctx.globalAlpha = plazaA;
      drawShopBanner();
      ctx.restore();
    }
  }
  function drawWelcome() {
    const b = WELCOME;
    sitShadow(b.x + b.w / 2 + 3, b.y + b.h + 7, b.w * 0.5, 10, 0.44);
    const leg = ctx.createLinearGradient(b.x, b.y, b.x + 16, b.y + b.h + 8);
    leg.addColorStop(0, "#a87440");
    leg.addColorStop(1, "#5a3018");
    ctx.fillStyle = leg;
    ctx.fillRect(b.x + 10, b.y + b.h - 8, 10, 14);
    ctx.fillRect(b.x + b.w - 20, b.y + b.h - 8, 10, 14);
    ctx.fillStyle = "rgba(255, 220, 160, 0.18)";
    ctx.fillRect(b.x + 10, b.y + b.h - 8, 3, 14);
    ctx.fillRect(b.x + b.w - 20, b.y + b.h - 8, 3, 14);
    const body = ctx.createLinearGradient(b.x, b.y, b.x + b.w * 0.4, b.y + b.h);
    body.addColorStop(0, "#d48858");
    body.addColorStop(0.4, "#b86a3a");
    body.addColorStop(1, "#6b3416");
    ctx.fillStyle = body;
    roundRect(b.x, b.y, b.w, b.h, 12); ctx.fill();
    if (ART.ready && ATLAS.plank) {
      ctx.save();
      roundRect(b.x, b.y, b.w, b.h, 12); ctx.clip();
      ctx.globalAlpha = 0.62;
      ctx.drawImage(ART.img, ATLAS.plank.x, ATLAS.plank.y, ATLAS.plank.w, ATLAS.plank.h,
        b.x - 4, b.y - 4, b.w + 8, b.h + 8);
      ctx.restore();
    }
    sunWashBox(b.x, b.y, b.w, b.h, 12);
    ctx.fillStyle = "rgba(255, 226, 170, 0.16)";
    ctx.fillRect(b.x + 8, b.y + 4, b.w - 16, 8);
    const welcomeA = worldLabelAlpha(b.x + 8, b.y + 8, b.w - 16, b.h - 16);
    if (welcomeA > 0.04) {
      ctx.save();
      ctx.globalAlpha = welcomeA;
      ctx.fillStyle = "rgba(40, 22, 10, 0.18)";
      roundRect(b.x + 12, b.y + 14, b.w - 20, b.h - 22, 8); ctx.fill();
      ctx.fillStyle = "#ead7b4";
      roundRect(b.x + 10, b.y + 12, b.w - 20, b.h - 24, 8); ctx.fill();
      sunWashBox(b.x + 10, b.y + 12, b.w - 20, b.h - 24, 8);
      ctx.fillStyle = "#2a7d8a";
      ctx.font = "700 12px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Welcome to", b.x + b.w / 2, b.y + 38);
      ctx.fillText("the pier", b.x + b.w / 2, b.y + 54);
      ctx.restore();
    }
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
    ctx.fillStyle = "#6a3a18"; roundRect(r.x, r.y, r.w, r.h, 10); ctx.fill();
    const cell = plankCell((r.x + r.y) | 0);
    if (ART.ready && cell) {
      ctx.save();
      roundRect(r.x, r.y, r.w, r.h, 10); ctx.clip();
      ctx.drawImage(ART.img, cell.x, cell.y, cell.w, cell.h, r.x - 4, r.y - 4, r.w + 8, r.h + 8);
      ctx.restore();
    }
    ctx.strokeStyle = "#4a2410"; ctx.lineWidth = 2.2;
    roundRect(r.x, r.y, r.w, r.h, 10); ctx.stroke();
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
    if (state.registerCash <= 0) { state.tillSlip = null; return; }
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
    ctx.fillStyle = "#5a3214"; roundRect(k.x, k.y, k.w, k.h, 12); ctx.fill();
    const cell = plankCell((k.x + k.y) | 0);
    if (ART.ready && cell) {
      ctx.save();
      roundRect(k.x, k.y, k.w, k.h, 12); ctx.clip();
      ctx.drawImage(ART.img, cell.x, cell.y, cell.w, cell.h, k.x - 6, k.y - 6, k.w + 12, k.h + 12);
      ctx.restore();
    }
    ctx.strokeStyle = "#3a1c0c"; ctx.lineWidth = 2.4;
    roundRect(k.x, k.y, k.w, k.h, 12); ctx.stroke();
    ctx.fillStyle = "rgba(20, 70, 78, 0.72)";
    roundRect(k.x + 10, k.y + 12, k.w - 20, k.h - 24, 8); ctx.fill();
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
    ctx.globalAlpha *= 0.92;
    ctx.filter = "saturate(0.92) brightness(0.96)";
    drawFishBody(sp, 0, 0, 0.08, scale, state.time + sp.id);
    ctx.filter = "none";
    ctx.restore();
  }
  function tankWaterFill(i, t) {
    // C88 — unique bowl water per species / lock, not one shared teal slab.
    const water = ctx.createLinearGradient(t.x, t.y, t.x, t.y + TANK_H);
    if (i === 0) {
      water.addColorStop(0, "rgba(255,244,210,0.28)");
      water.addColorStop(0.14, "rgba(255,196,120,0.22)");
      water.addColorStop(0.38, "rgba(56,186,198,0.62)");
      water.addColorStop(0.74, "rgba(16,86,112,0.88)");
      water.addColorStop(1, "rgba(8,42,68,0.96)");
    } else if (i === 1) {
      if (speciesUnlocked(i)) {
        water.addColorStop(0, "rgba(200,236,255,0.22)");
        water.addColorStop(0.18, "rgba(80,170,255,0.36)");
        water.addColorStop(0.5, "rgba(20,80,180,0.7)");
        water.addColorStop(1, "rgba(8,24,72,0.96)");
      } else {
        water.addColorStop(0, "rgba(210,218,228,0.16)");
        water.addColorStop(0.2, "rgba(120,140,160,0.28)");
        water.addColorStop(0.5, "rgba(48,62,78,0.62)");
        water.addColorStop(1, "rgba(16,22,32,0.94)");
      }
    } else if (i === 2) {
      if (speciesUnlocked(i)) {
        water.addColorStop(0, "rgba(232,255,210,0.24)");
        water.addColorStop(0.16, "rgba(180,230,120,0.28)");
        water.addColorStop(0.42, "rgba(40,150,118,0.62)");
        water.addColorStop(0.78, "rgba(12,72,58,0.9)");
        water.addColorStop(1, "rgba(8,40,32,0.96)");
      } else {
        water.addColorStop(0, "rgba(210,218,228,0.16)");
        water.addColorStop(0.2, "rgba(120,140,160,0.28)");
        water.addColorStop(0.5, "rgba(48,62,78,0.62)");
        water.addColorStop(1, "rgba(16,22,32,0.94)");
      }
    } else if (!speciesUnlocked(i)) {
      water.addColorStop(0, "rgba(210,218,228,0.16)");
      water.addColorStop(0.2, "rgba(120,140,160,0.28)");
      water.addColorStop(0.5, "rgba(48,62,78,0.62)");
      water.addColorStop(1, "rgba(16,22,32,0.94)");
    } else {
      water.addColorStop(0, "rgba(230,250,255,0.18)");
      water.addColorStop(0.12, "rgba(150,226,240,0.34)");
      water.addColorStop(0.42, "rgba(32,140,176,0.64)");
      water.addColorStop(0.78, "rgba(10,62,88,0.9)");
      water.addColorStop(1, "rgba(6,32,52,0.96)");
    }
    return water;
  }
  function drawTankSilhouetteFish(kind, cx, cy, sc) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sc || 1, sc || 1);
    if (kind === "clown") {
      ctx.fillStyle = "#f08a2a";
      ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff6e8";
      ctx.fillRect(-7, -11, 5, 22);
      ctx.fillRect(5, -10, 4, 20);
      ctx.fillStyle = "#f08a2a";
      ctx.beginPath();
      ctx.moveTo(-20, 0); ctx.lineTo(-32, -9); ctx.lineTo(-32, 9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#5a2a10";
      ctx.beginPath(); ctx.arc(10, -2, 2.2, 0, Math.PI * 2); ctx.fill();
    } else if (kind === "gold") {
      ctx.fillStyle = "#ff8a2b";
      ctx.beginPath(); ctx.ellipse(2, 1, 20, 15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd27a";
      ctx.beginPath(); ctx.ellipse(7, -2, 8, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ff8a2b";
      ctx.beginPath();
      ctx.moveTo(-16, 1); ctx.lineTo(-30, -11); ctx.lineTo(-28, 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#7a2e10";
      ctx.beginPath(); ctx.arc(12, -1, 2.3, 0, Math.PI * 2); ctx.fill();
    } else if (kind === "tang") {
      ctx.fillStyle = "#2f7dff";
      ctx.beginPath(); ctx.ellipse(0, 0, 20, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffe14a";
      ctx.beginPath();
      ctx.moveTo(-16, 0); ctx.lineTo(-30, -10); ctx.lineTo(-28, 11); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#10224a";
      ctx.beginPath(); ctx.arc(10, -2, 2.2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "rgba(36, 48, 62, 0.88)";
      ctx.beginPath(); ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-16, 0); ctx.lineTo(-26, -7); ctx.lineTo(-26, 7); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function drawTankPadlock(cx, cy, sc) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sc || 1, sc || 1);
    ctx.strokeStyle = "#e0c878";
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -7, 7.2, Math.PI, 0, false);
    ctx.stroke();
    ctx.fillStyle = "#d4b05a";
    roundRect(-11, -7, 22, 18, 3); ctx.fill();
    ctx.fillStyle = "#5a4010";
    ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-1.3, 0, 2.6, 6);
    ctx.restore();
  }
  function drawTankHabitat(i, t, stocked) {
    // Unique coral / fish silhouettes so the north row is a gallery,
    // not three identical blue rectangles. Positions stay TANK_POS.
    const x = t.x, y = t.y, w = TANK_W, h = TANK_H;
    const bedY = y + h - 26;
    if (i === 0) {
      ctx.fillStyle = stocked ? "rgba(180,100,42,0.62)" : "rgba(168,92,40,0.56)";
      ctx.fillRect(x, bedY, w, 22);
      ctx.fillStyle = "rgba(230,160,80,0.38)";
      ctx.beginPath();
      ctx.moveTo(x, y + h - 18);
      for (let p = 0; p <= 10; p++) {
        ctx.lineTo(x + p * (w / 10), y + h - 16 + Math.sin(p * 1.1) * 3);
      }
      ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#e8786a";
      ctx.beginPath(); ctx.ellipse(x + 48, y + h - 28, 30, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffb08a";
      for (let k = 0; k < 7; k++) {
        const a = -1.05 + k * 0.3;
        ctx.beginPath();
        ctx.ellipse(x + 48 + Math.cos(a) * 18, y + h - 42 + Math.sin(a) * 7, 5.6, 15, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#c45ec8";
      ctx.beginPath(); ctx.ellipse(x + w - 38, y + h - 22, 20, 12, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f4a0d8";
      ctx.beginPath(); ctx.ellipse(x + w - 38, y + h - 26, 10, 7, 0.15, 0, Math.PI * 2); ctx.fill();
    } else if (i === 1) {
      if (speciesUnlocked(i)) {
        ctx.fillStyle = "rgba(36, 72, 140, 0.5)";
        ctx.fillRect(x, bedY, w, 22);
        ctx.fillStyle = "#ffe14a";
        ctx.beginPath(); ctx.ellipse(x + 38, y + h - 26, 24, 14, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#2f7dff";
        ctx.beginPath(); ctx.ellipse(x + w - 42, y + h - 22, 20, 11, 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#7ad0ff";
        ctx.lineWidth = 2.6;
        for (let p = 0; p < 3; p++) {
          const px = x + 70 + p * 36;
          ctx.beginPath();
          ctx.moveTo(px, y + h - 22);
          ctx.quadraticCurveTo(px + 8, y + h - 50, px - 2, y + h - 78);
          ctx.stroke();
        }
      } else {
        drawTankSilhouetteFish("lock", x + w * 0.5, y + 58, 1.05);
      }
    } else if (i === 2) {
      if (speciesUnlocked(i)) {
        ctx.fillStyle = "rgba(120,140,52,0.55)";
        ctx.fillRect(x, bedY, w, 22);
        ctx.fillStyle = "rgba(200,210,90,0.3)";
        ctx.beginPath();
        ctx.moveTo(x, y + h - 18);
        for (let p = 0; p <= 8; p++) {
          ctx.lineTo(x + p * (w / 8), y + h - 15 + Math.sin(p * 0.9 + 1) * 2.6);
        }
        ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#3a8a3a";
        ctx.lineWidth = 3.2;
        ctx.lineCap = "round";
        for (let p = 0; p < 5; p++) {
          const px = x + 18 + p * 40;
          const sway = Math.sin(state.time * 1.1 + p) * 5;
          ctx.beginPath();
          ctx.moveTo(px, y + h - 22);
          ctx.quadraticCurveTo(px + sway, y + h - 58, px - 4, y + h - 88);
          ctx.stroke();
          ctx.fillStyle = p % 2 ? "#7ad04a" : "#c8e05a";
          ctx.beginPath();
          ctx.ellipse(px + sway * 0.4, y + h - 70, 8, 5, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#6aaa3a";
        ctx.beginPath(); ctx.ellipse(x + 36, y + h - 24, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        drawTankSilhouetteFish("lock", x + w * 0.5, y + 58, 1.05);
      }
    } else if (!speciesUnlocked(i)) {
      ctx.fillStyle = "rgba(70, 78, 88, 0.55)";
      ctx.fillRect(x, bedY, w, 22);
      ctx.fillStyle = "rgba(40, 48, 58, 0.4)";
      ctx.beginPath();
      ctx.moveTo(x + 20, y + h - 16);
      ctx.quadraticCurveTo(x + 40, y + h - 28, x + 62, y + h - 14);
      ctx.lineTo(x + 20, y + h - 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(90, 100, 112, 0.45)";
      ctx.beginPath();
      ctx.moveTo(x + w - 70, y + h - 14);
      ctx.quadraticCurveTo(x + w - 44, y + h - 26, x + w - 18, y + h - 13);
      ctx.lineTo(x + w - 70, y + h - 13); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(70, 88, 78, 0.55)";
      ctx.lineWidth = 2;
      for (let p = 0; p < 3; p++) {
        const px = x + 36 + p * 56;
        ctx.beginPath();
        ctx.moveTo(px, y + h - 22);
        ctx.quadraticCurveTo(px + 4, y + h - 44, px - 2, y + h - 62);
        ctx.stroke();
      }
      drawTankSilhouetteFish("lock", x + w * 0.5, y + 58, 1.05);
    } else {
      ctx.fillStyle = "rgba(140,112,62,0.5)";
      ctx.fillRect(x, bedY, w, 22);
      ctx.fillStyle = "rgba(200,170,100,0.28)";
      ctx.beginPath();
      ctx.moveTo(x, y + h - 18);
      for (let p = 0; p <= 10; p++) {
        ctx.lineTo(x + p * (w / 10), y + h - 16 + Math.sin(p * 1.3 + i) * 3.2);
      }
      ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = i % 2 ? "#2e8b4a" : "#3aa35a";
      ctx.lineWidth = 1.8;
      for (let p = 0; p < 4; p++) {
        const px = x + 22 + p * 48 + (i % 3) * 6;
        const sway = Math.sin(state.time * 1.4 + i + p) * 4;
        ctx.beginPath();
        ctx.moveTo(px, y + h - 24);
        ctx.quadraticCurveTo(px + sway, y + h - 48, px + sway * 0.4, y + h - 70);
        ctx.stroke();
      }
      ctx.fillStyle = "#4a5a50";
      ctx.beginPath();
      ctx.moveTo(x + 16, y + h - 18);
      ctx.quadraticCurveTo(x + 28, y + h - 30, x + 42, y + h - 16);
      ctx.quadraticCurveTo(x + 30, y + h - 12, x + 16, y + h - 18);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + w - 48, y + h - 16);
      ctx.quadraticCurveTo(x + w - 32, y + h - 28, x + w - 16, y + h - 15);
      ctx.quadraticCurveTo(x + w - 30, y + h - 10, x + w - 48, y + h - 16);
      ctx.fill();
    }
  }
  function tankHudClearY(wx, wy) {
    // C89 — sit names / padlocks below money/BAG/SHOP. Tanks stay put.
    const s = worldToScreen(wx, wy);
    const floor = topHudFloor() + (portraitStage() ? phoneCss(8) : 6);
    if (s.y >= floor) return wy;
    const z = Math.max(0.001, cam.z);
    return wy + (floor - s.y) / z;
  }
  function drawTankLockGlass(t) {
    const frost = ctx.createLinearGradient(t.x, t.y, t.x, t.y + TANK_H);
    frost.addColorStop(0, "rgba(210, 220, 230, 0.16)");
    frost.addColorStop(0.45, "rgba(36, 46, 58, 0.18)");
    frost.addColorStop(1, "rgba(12, 16, 24, 0.28)");
    ctx.fillStyle = frost;
    ctx.fillRect(t.x, t.y, TANK_W, TANK_H);
    ctx.strokeStyle = "rgba(220, 230, 240, 0.18)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(t.x + 18, t.y + 28);
    ctx.lineTo(t.x + TANK_W - 22, t.y + TANK_H - 36);
    ctx.moveTo(t.x + TANK_W - 28, t.y + 32);
    ctx.lineTo(t.x + 24, t.y + TANK_H - 40);
    ctx.stroke();
    const lockY = Math.min(tankHudClearY(t.x + TANK_W / 2, t.y + 52), t.y + TANK_H * 0.46);
    drawTankPadlock(t.x + TANK_W / 2, lockY, 1);
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
    const open = speciesUnlocked(i);
    const stocked = open && state.stock[i] > 0;
    const water = tankWaterFill(i, t);
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
    drawTankHabitat(i, t, stocked);
    if (!open) drawTankLockGlass(t);
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
    if (open) {
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
    if (open && state.bag.some((s) => s === i)) {
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
    if (open) {
      const labelY = tankHudClearY(t.x + TANK_W / 2, t.y + TANK_H - 32);
      const nameA = worldLabelAlpha(t.x + 8, labelY, TANK_W - 16, 24);
      if (nameA > 0.04) {
        ctx.globalAlpha = nameA;
        ctx.fillStyle = "rgba(18, 28, 38, 0.88)";
        roundRect(t.x + 8, labelY, TANK_W - 16, 24, 6); ctx.fill();
        ctx.fillStyle = "#fff6e8"; ctx.font = "800 13px Nunito, sans-serif"; ctx.textAlign = "left";
        ctx.fillText(sp.name, t.x + 16, labelY + 16);
        ctx.textAlign = "right"; ctx.fillStyle = stocked ? "#ffe27a" : "#c8d4dc";
        ctx.fillText(stocked ? "$" + sp.price : "empty", t.x + TANK_W - 16, labelY + 16);
        ctx.globalAlpha = 1;
      }
      const badgeY = tankHudClearY(t.x + TANK_W - 8, t.y + 18);
      const badgeA = worldLabelAlpha(t.x + TANK_W - 22, badgeY - 14, 28, 28);
      if (badgeA > 0.04) {
        ctx.globalAlpha = badgeA;
        ctx.fillStyle = "#ff7a3a";
        ctx.beginPath(); ctx.arc(t.x + TANK_W - 8, badgeY, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "800 13px Nunito, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(String(tankBadge(i)), t.x + TANK_W - 8, badgeY + 5);
        ctx.globalAlpha = 1;
      }
      if (nearStockPad(i) && state.bag.some((s) => s === i)) {
        const cueY = tankHudClearY(t.x + TANK_W / 2, t.y + 8);
        const stockA = worldLabelAlpha(t.x + 20, cueY, TANK_W - 40, 24);
        if (stockA > 0.04) {
          ctx.globalAlpha = stockA;
          ctx.fillStyle = "rgba(80,230,180,0.92)";
          roundRect(t.x + 20, cueY, TANK_W - 40, 24, 8); ctx.fill();
          ctx.fillStyle = "#123"; ctx.font = "700 12px Nunito, sans-serif";
          ctx.fillText("Stock tank", t.x + TANK_W / 2, cueY + 17);
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
        ctx.fillStyle = "rgba(12,16,24,0.28)";
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
  function drawWreck() {
    const wx = WRECK.x, wy = WRECK.y, ww = WRECK.w, wh = WRECK.h;
    ctx.save();
    const sa = worldSpriteAlpha(wx + ww / 2, wy + wh / 2, 220);
    if (sa <= 0.04) { ctx.restore(); return; }
    ctx.globalAlpha *= sa;
    const keel = ctx.createLinearGradient(wx, wy, wx, wy + wh);
    keel.addColorStop(0, "#3a2a22");
    keel.addColorStop(0.45, "#2a1c16");
    keel.addColorStop(1, "#16100c");
    ctx.fillStyle = keel;
    ctx.beginPath();
    ctx.moveTo(wx + 28, wy + 70);
    ctx.lineTo(wx + ww - 20, wy + 40);
    ctx.lineTo(wx + ww - 8, wy + 150);
    ctx.quadraticCurveTo(wx + ww * 0.62, wy + wh - 8, wx + 18, wy + wh - 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1a100c";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#4a3228";
    ctx.beginPath();
    ctx.moveTo(wx + 48, wy + 58);
    ctx.lineTo(wx + ww - 70, wy + 36);
    ctx.lineTo(wx + ww - 86, wy + 88);
    ctx.lineTo(wx + 62, wy + 108);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#2a1a12";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx + 118, wy + 52);
    ctx.lineTo(wx + 96, wy - 36);
    ctx.lineTo(wx + 188, wy + 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx + 96, wy - 36);
    ctx.lineTo(wx + 40, wy + 8);
    ctx.stroke();
    ctx.fillStyle = "rgba(40, 28, 20, 0.55)";
    ctx.beginPath();
    ctx.moveTo(wx + 96, wy - 36);
    ctx.lineTo(wx + 188, wy + 18);
    ctx.lineTo(wx + 168, wy + 28);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      const px = wx + 90 + i * 78;
      const py = wy + 118 + (i % 2) * 16;
      const tw = 0.45 + 0.4 * Math.sin(state.time * 2.4 + i * 1.3);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(px, py, 2, px, py, 28);
      g.addColorStop(0, "rgba(255, 210, 90," + (0.35 + tw * 0.25) + ")");
      g.addColorStop(1, "rgba(255, 180, 40, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, 28, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#0c1014";
      ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#c8a060";
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.stroke();
    }
    const cx = WRECK_CHEST.x, cy = WRECK_CHEST.y;
    ctx.fillStyle = state.wreckChestReady ? "#8a5a22" : "#4a3820";
    roundRect(cx - 22, cy - 12, 44, 24, 4); ctx.fill();
    ctx.fillStyle = state.wreckChestReady ? "#c4894a" : "#6a5430";
    roundRect(cx - 22, cy - 20, 44, 12, 3); ctx.fill();
    ctx.strokeStyle = "#e8c04a";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - 20, cy - 8); ctx.lineTo(cx + 20, cy - 8); ctx.stroke();
    ctx.fillStyle = "#ffe27a";
    ctx.beginPath(); ctx.arc(cx, cy - 2, 3.2, 0, Math.PI * 2); ctx.fill();
    if (state.wreckChestReady) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const cg = ctx.createRadialGradient(cx, cy, 4, cx, cy, 36);
      cg.addColorStop(0, "rgba(255, 220, 100, 0.35)");
      cg.addColorStop(1, "rgba(255, 190, 70, 0)");
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, 36, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = "rgba(255, 226, 122, 0.88)";
    ctx.font = "700 13px Fredoka, Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("WRECK", wx + ww * 0.48, wy + 28);
    if (state.wreckChestReady) {
      const bob = Math.sin(state.time * 6) * 2;
      drawWorldPlate(cx, cy - 36 + bob, "CHEST", "shiny");
    }
    ctx.restore();
  }
  function isNightOcean() { return !!(state.expedition && state.nightExpedition); }
  function drawOceanSky() {
    // Looking up from the waterline: dusk + town sit above the foam so
    // 1m · Shallows is not a blank peach band. Not a new room.
    const x = -240, w = OCEAN.w + 480;
    const waterY = 148;
    if (isNightOcean()) {
      const ng = ctx.createLinearGradient(x, -220, x, waterY);
      ng.addColorStop(0, "#0c1428");
      ng.addColorStop(0.55, "#1a2848");
      ng.addColorStop(1, "#243050");
      ctx.fillStyle = ng;
      ctx.fillRect(x, -220, w, waterY + 220);
      return;
    }
    paintDockHarborSky(x, -220, w, waterY);
    paintVisibleDuskClouds(x, waterY - 132, w, 100);
    drawHorizonTown(x, waterY, w, 132, !!state.unlocked[1]);
  }
  function drawOcean() {
    const night = isNightOcean();
    const g = ctx.createLinearGradient(0, 140, 0, OCEAN.h);
    if (night) {
      g.addColorStop(0, "#1a3a58");
      g.addColorStop(0.28, "#0c2848");
      g.addColorStop(0.62, "#061828");
      g.addColorStop(1, "#020810");
    } else {
      g.addColorStop(0, "#c4f2fa");
      g.addColorStop(0.16, "#62c4d8");
      g.addColorStop(0.38, "#2a8eaa");
      g.addColorStop(0.66, "#0c5870");
      g.addColorStop(1, "#041820");
    }
    ctx.fillStyle = g; ctx.fillRect(0, 140, OCEAN.w, OCEAN.h - 140);
    ctx.save();
    for (let n = 0; n < 70; n++) {
      const px = hash2(n, 1) * OCEAN.w;
      const py = 40 + hash2(n, 4) * Math.min(OCEAN.h, 1600);
      ctx.fillStyle = n % 2
        ? "rgba(190, 240, 250," + (0.03 + hash2(n, 7) * 0.05) + ")"
        : "rgba(4, 20, 32," + (0.04 + hash2(n, 8) * 0.06) + ")";
      ctx.beginPath();
      ctx.ellipse(px, py, 28 + hash2(n, 9) * 70, 12 + hash2(n, 11) * 36, hash2(n, 13) * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (!night) {
      for (let i = 0; i < 20; i++) {
        const bx = hash2(i, 2) * OCEAN.w;
        const by = 40 + hash2(i, 5) * 980;
        const rad = 120 + hash2(i, 7) * 340;
        const blob = ctx.createRadialGradient(bx, by, 10, bx, by, rad);
        blob.addColorStop(0, i % 3 ? "rgba(180, 240, 246, 0.12)" : "rgba(8, 48, 64, 0.12)");
        blob.addColorStop(1, "rgba(10, 50, 70, 0)");
        ctx.fillStyle = blob;
        ctx.beginPath();
        ctx.ellipse(bx, by, rad, rad * (0.28 + hash2(i, 11) * 0.36), hash2(i, 9) * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
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
    ctx.save(); ctx.globalAlpha = 0.06; ctx.strokeStyle = "#c8f4ff"; ctx.lineWidth = 1.6;
    for (let i = 0; i < 12; i++) {
      const yy = 160 + hash2(i, 3) * (OCEAN.h * 0.7);
      const tilt = (hash2(i, 6) - 0.5) * 0.05;
      ctx.beginPath();
      let started = false;
      for (let x = 0; x < OCEAN.w; x += 18) {
        if (hash2(i, x) < 0.2) { started = false; continue; }
        const y = yy + x * tilt + Math.sin(x * 0.008 + state.time * 1.2 + i) * 22 + Math.sin(x * 0.02 - state.time + i) * 10;
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    const foamTop = ctx.createLinearGradient(0, 0, 0, 188);
    foamTop.addColorStop(0, night ? "rgba(140,180,220,0.1)" : "rgba(200,245,255,0.2)");
    foamTop.addColorStop(0.55, night ? "rgba(140,180,220,0.05)" : "rgba(180,236,246,0.08)");
    foamTop.addColorStop(1, "rgba(200,245,255,0)");
    ctx.fillStyle = foamTop;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(OCEAN.w, 0);
    for (let x = OCEAN.w; x >= 0; x -= 22) {
      ctx.lineTo(x, 150 + Math.sin(x * 0.03 + state.time * 1.4) * 10 + Math.sin(x * 0.08) * 4);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = night ? "rgba(200,220,255,0.08)" : "rgba(255,255,255,0.18)";
    for (let x = 0; x < OCEAN.w; x += 40) {
      const y = 150 + Math.sin(x * 0.04 + state.time * 3) * 8;
      ctx.beginPath(); ctx.ellipse(x, y, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (true) {
      const wg = ctx.createLinearGradient(WRECK.x - 180, 0, WRECK.x + WRECK.w, 0);
      wg.addColorStop(0, "rgba(8, 16, 28, 0)");
      wg.addColorStop(0.35, night ? "rgba(6, 12, 22, 0.22)" : "rgba(10, 22, 36, 0.16)");
      wg.addColorStop(1, night ? "rgba(4, 10, 18, 0.34)" : "rgba(8, 18, 30, 0.22)");
      ctx.fillStyle = wg;
      ctx.fillRect(WRECK.x - 180, 200, WRECK.w + 280, 900);
    }
    drawOceanSky();
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
      // loop 133 one SURFACE cue — this diegetic waterline marker is just
      // the word SURFACE (like loop 131's action board); the goal ribbon
      // still teaches "Surface — SPACE or click", so the instruction is
      // not lost and the surface is not labelled twice with a full sentence.
      ctx.fillText("SURFACE", OCEAN.w / 2, 70);
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
    drawWreck();
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
      const fa = worldSpriteAlpha(f.x, f.y, Math.max(40, SPECIES[f.s].size * 2.8));
      if (fa <= 0.04) continue;
      ctx.save();
      ctx.globalAlpha *= fa;
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
        ctx.restore();
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
      ctx.save();
      if (f.flip) { ctx.translate(f.x, f.y); ctx.scale(-1, 1); ctx.translate(-f.x, -f.y); }
      if (f.s === 0) {
        ctx.filter = "hue-rotate(" + ((f.hue || 0) | 0) + "deg) saturate(" + (f.sat == null ? 1 : f.sat) + ") brightness(" + (f.br == null ? 1 : f.br) + ")";
      } else if (f.hue || (f.sat != null && f.sat !== 1)) {
        ctx.filter = "hue-rotate(" + ((f.hue || 0) | 0) + "deg) saturate(" + (f.sat == null ? 1 : f.sat) + ")";
      }
      drawFishBody(SPECIES[f.s], f.x, f.y, dang, SPECIES[f.s].size / 15 * (f.rare ? 1.18 : 1) * (f.sc || 1), state.time + f.ph);
      ctx.filter = "none";
      ctx.restore();
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
        const bob = Math.sin(state.time * 6) * 2;
        if (state.shinyCallout > 0) {
          const bounce = Math.sin(state.time * 8) * 6;
          drawWorldPlate(f.x, f.y - 48 + bounce, "SHINY!", "shiny");
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
        } else {
          drawWorldPlate(f.x, f.y - 30 + bob, "SHINY", "shiny");
        }
      }
      ctx.restore();
    }
    drawReefPlates();
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
      if (f === player.target || !huntBangWanted(f)) continue;
      const fa = worldSpriteAlpha(f.x, f.y, 22);
      if (fa <= 0.04) continue;
      ctx.save();
      ctx.globalAlpha *= fa;
      drawWorldPlate(f.x, f.y - 24 + Math.sin(state.time * 8) * 2, "!", "bang");
      ctx.restore();
    }
    if (player.catchProg > 0 && (player.target || player.scoopLock || catchHolding())) {
      const f = player.target || player.scoopLock;
      const bx = f ? f.x : player.x + Math.cos(player.facing) * 40;
      const by = f ? f.y - 38 : player.y - 44;
      const wbar = 56;
      const col = isChestTarget(f) ? "#ffe27a" : (f && SPECIES[f.s] ? SPECIES[f.s].color : "#9ef0ff");
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
    // Zone names live on the HUD depth chip (C65) — never a mid-screen
    // world title through the diver.
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
    for (let n = 0; n < spots.length; n++) {
      const [x, y, kind] = spots[n];
      if (kind === 4) {
        drawRockProp(x, y, 20 + n * 7, 0.85 + (n % 5) * 0.12);
      } else if (kind === 1) {
        drawKelpPatch({ x, y, ph: n * 0.7, seed: 8 + n * 11, sc: 0.72 + (n % 4) * 0.14, landmark: false });
      } else if (kind === 2) {
        plantInSand(x, y + 8, 22, 8, 0.62);
        ctx.fillStyle = "#e85d6a";
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + state.time * 0.2;
          ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 6, y + Math.sin(a) * 4, 14, 5, a, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = "#ffd27a"; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
      } else {
        plantInSand(x, y + 6, 18, 7, 0.4);
        ctx.fillStyle = "#c45ec8";
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 16, y - 40); ctx.lineTo(x + 8, y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#7ad0e8";
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12, y - 34); ctx.lineTo(x + 4, y); ctx.closePath(); ctx.fill();
      }
    }
    // Mid-depth beds live in drawZoneBed — unique silhouette per band (C66).
    ctx.save();
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
          drawRockProp(x, y, 90 + ((x + y) | 0), 0.9 + ((x | 0) % 5) * 0.08);
        } else if (kind === 2) {
          plantInSand(x, y + 8, 22, 8, 0.62);
          ctx.fillStyle = "#e85d6a";
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 + state.time * 0.2;
            ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 6, y + Math.sin(a) * 4, 14, 5, a, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = "#ffd27a"; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        } else {
          plantInSand(x, y + 6, 18, 7, 0.4);
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
    const half = coneHalf();
    const flash = state.catchClimax
      ? 0.55 + 0.45 * Math.sin(state.time * 28)
      : (state.coneFlash > 0 ? clamp(state.coneFlash / 0.22, 0, 1) : 0);
    const rare = !!(player.target && player.target.rare);
    const lock = !!player.target || flash > 0;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.facing);
    const wedge = (r, h) => {
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.arc(0, 0, r, -h, h);
      ctx.closePath();
    };
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const bloom = ctx.createRadialGradient(4, 0, 6, 8, 0, range);
    if (rare) {
      bloom.addColorStop(0, "rgba(255, 220, 120," + (0.16 + flash * 0.18) + ")");
      bloom.addColorStop(0.38, "rgba(255, 190, 70," + (0.08 + flash * 0.1) + ")");
      bloom.addColorStop(1, "rgba(255, 180, 60, 0)");
    } else {
      bloom.addColorStop(0, "rgba(170, 240, 255," + (0.14 + flash * 0.16) + ")");
      bloom.addColorStop(0.42, "rgba(90, 210, 230," + (0.07 + flash * 0.08) + ")");
      bloom.addColorStop(1, "rgba(80, 200, 220, 0)");
    }
    ctx.fillStyle = bloom;
    ctx.shadowColor = rare ? "rgba(255, 210, 90, 0.32)" : "rgba(140, 236, 255, 0.26)";
    ctx.shadowBlur = 20 + flash * 10;
    wedge(range, half);
    ctx.fill();
    ctx.restore();
    ctx.save();
    wedge(range, half);
    ctx.clip();
    const along = ctx.createLinearGradient(8, 0, range, 0);
    if (rare) {
      along.addColorStop(0, "rgba(255, 236, 170," + (0.22 + flash * 0.16) + ")");
      along.addColorStop(0.22, "rgba(255, 200, 80," + (0.12 + flash * 0.1) + ")");
      along.addColorStop(0.62, "rgba(230, 160, 40, 0.05)");
      along.addColorStop(1, "rgba(200, 140, 30, 0)");
    } else if (lock) {
      along.addColorStop(0, "rgba(220, 250, 255," + (0.2 + flash * 0.14) + ")");
      along.addColorStop(0.24, "rgba(140, 230, 240," + (0.11 + flash * 0.08) + ")");
      along.addColorStop(0.7, "rgba(70, 190, 210, 0.04)");
      along.addColorStop(1, "rgba(50, 170, 190, 0)");
    } else {
      along.addColorStop(0, "rgba(190, 236, 246, 0.16)");
      along.addColorStop(0.28, "rgba(110, 210, 224, 0.08)");
      along.addColorStop(0.74, "rgba(70, 180, 200, 0.03)");
      along.addColorStop(1, "rgba(60, 170, 190, 0)");
    }
    ctx.fillStyle = along;
    ctx.fillRect(0, -range, range + 8, range * 2);
    const cross = ctx.createLinearGradient(0, -range * Math.sin(half), 0, range * Math.sin(half));
    cross.addColorStop(0, "rgba(255,255,255,0)");
    cross.addColorStop(0.5, "rgba(230, 250, 255," + (0.07 + flash * 0.06) + ")");
    cross.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cross;
    ctx.fillRect(0, -range, range, range * 2);
    for (let i = 0; i < 4; i++) {
      const a = -half * 0.7 + (i / 3) * half * 1.4 + Math.sin(state.time * 1.5 + i * 1.7) * 0.035;
      const rib = ctx.createLinearGradient(8, 0, Math.cos(a) * range, Math.sin(a) * range);
      rib.addColorStop(0, "rgba(255,255,255,0)");
      rib.addColorStop(0.32, "rgba(230, 255, 255," + (0.05 + 0.04 * Math.sin(state.time * 2.1 + i)) + ")");
      rib.addColorStop(1, "rgba(200, 240, 255, 0)");
      ctx.strokeStyle = rib;
      ctx.lineWidth = 6.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(Math.cos(a) * range * 0.96, Math.sin(a) * range * 0.96);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }
  function shadeWorldUnderTopHud() {
    const floor = Math.min(topHudFloor() + 8, 128);
    if (floor < 20) return;
    const g = ctx.createLinearGradient(0, 0, 0, floor);
    g.addColorStop(0, "rgba(7, 20, 28, 0.58)");
    g.addColorStop(0.62, "rgba(7, 20, 28, 0.22)");
    g.addColorStop(1, "rgba(7, 20, 28, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewWidth(), floor);
  }
  function drawPlayfieldStile() {
    const x = viewWidth();
    if (x >= W - 2) return;
    // Soft recess into the well — not a 4px razor, not a fake wood fence.
    const fade = 72;
    const play = ctx.createLinearGradient(x - fade, 0, x, 0);
    play.addColorStop(0, "rgba(7, 20, 28, 0)");
    play.addColorStop(0.45, "rgba(7, 20, 28, 0.16)");
    play.addColorStop(1, "rgba(7, 20, 28, 0.55)");
    ctx.fillStyle = play;
    ctx.fillRect(x - fade, 0, fade, H);
    const well = ctx.createLinearGradient(x, 0, x + 6, 0);
    well.addColorStop(0, "rgba(0, 4, 8, 0.38)");
    well.addColorStop(1, "rgba(0, 4, 8, 0)");
    ctx.fillStyle = well;
    ctx.fillRect(x, 0, 6, H);
  }
  function drawWorld() {
    ctx.fillStyle = "#07141c";
    ctx.fillRect(-4, -4, W + 8, H + 8);
    ctx.save();
    const playW = viewWidth();
    ctx.beginPath();
    ctx.rect(0, 0, playW, H);
    ctx.clip();
    ctx.translate(viewCenterX(), H / 2);
    ctx.scale(cam.z, cam.z);
    // Integer world blit — a fractional cam.y sheared every pier row
    // into an offset horizontal band under tanks / NPCs. C62 snap stays;
    // the frame clear above is identity (beginCanvas) so a leftover
    // previous-frame strip cannot stack while this translate eases.
    ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
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
    shadeWorldUnderTopHud();
    drawPlayfieldStile();
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
    const hunt = glowingStockIndex();
    if (hunt >= 0) return tankWalkPoint(hunt);
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
    // loop 152 — a New Game dock is 1 / 6. Do not treat spawn-on-pad
    // or the current-verb index plus one as step 2 before they have dived.
    if (state.missionDone) return 6;
    // peakMoney / unlock latch so spending Tang $60 cannot drop 6/6 → 5/6.
    if ((state.didFirstCollect || state.didFirstSale) &&
        ((state.money | 0) >= 15 || (state.peakMoney | 0) >= 15 || state.didFirstUnlock || state.unlocked[1])) {
      return 6;
    }
    if (state.didFirstCollect || state.didFirstSale || (state.money | 0) > 0) return 5;
    if (state.didFirstStock) return 4;
    if (((state.caughtCount && state.caughtCount[0]) | 0) >= 5 || bagIsFull()) return 3;
    if (state.scene === "ocean" || state.pendingScene === "ocean" ||
        ((state.caughtCount && state.caughtCount[0]) | 0) >= 1 || (state.tutorial | 0) >= 2) {
      return 2;
    }
    return 1;
  }
  function inPlazaYard() {
    return state.scene === "shop" && player.y < 800;
  }
  function plazaHintSpent() {
    return (state.money | 0) > 0 || !!state.didFirstStock || !!state.didFirstSale ||
      (state.tutorial | 0) >= 1 || ((state.playClock || 0) > 5 && !!state.didMove && inPlazaYard());
  }
  function hideSouthDockHint() {
    // Already in the plaza / tank camera, or already walking to DIVE.
    return diveWalkQueued() || !!(cam && cam.y <= PLAZA_CAM_CEILING);
  }
  function nextUnlockWalkDest() {
    const n = nextLockedTank();
    if (n < 0 || !tankLive(n)) return null;
    return tankWalkPoint(n);
  }
  function hideDockWalkHint() {
    // C107 — already standing on the dock / dock camera. Do not say
    // "Walk to the glowing DIVE dock" or "Dock is south".
    if (state.scene !== "shop") return false;
    if (inDiveZone() || nearDivePad()) return true;
    if (player && player.y > 860) return true;
    if (dockCameraReady()) return true;
    if (cam && cam.y >= DOCK_CAM_FLOOR - 24) return true;
    return false;
  }
  function walkFinalDest() {
    if (player && player.route && player.route.length) return player.route[player.route.length - 1];
    return (player && player.goto) || null;
  }
  function shopWalkRibbonWanted() {
    // C109 — ~280ms after a north tap the camera is already on the
    // plaza tanks. hideDockWalkHint is dock-only, so the DIVE-dock
    // quest came back while Skip was still walking north to the bowls.
    // Keep the shop / bowls ribbon until they occupy the dest pad.
    if (state.scene !== "shop") return false;
    if (bagHasStockable() || cashNeedsCollect()) return false;
    const dest = nextUnlockWalkDest();
    if (!dest) return false;
    if (Math.hypot(player.x - dest.x, player.y - dest.y) < 48) return false;
    if (player.pendingAct && player.pendingAct.kind === "unlock") {
      const n = nextLockedTank();
      if (n >= 0 && (player.pendingAct.i == null || player.pendingAct.i === n)) return true;
    }
    const end = walkFinalDest();
    if (!end) return false;
    if (Math.hypot(end.x - dest.x, end.y - dest.y) < 40) return true;
    return destWantsPlaza(end);
  }
  function shopBowlsGoal() {
    const n = nextLockedTank();
    if (n >= 0 && !bagHasStockable() && !cashNeedsCollect()) {
      return {
        text: thumbCopy() ? "Tap north to walk to the shop bowls" : "Walk north to the shop bowls",
        target: tankWalkPoint(n),
      };
    }
    return { text: "", target: null };
  }
  function unlockPadOccupied() {
    const n = nextLockedTank();
    if (n < 0 || !tankLive(n) || speciesUnlocked(n)) return false;
    return nearStockPad(n);
  }
  function unlockCueLegal() {
    // C110 — after a C109 walk occupies tankWalkPoint(nextLocked)
    // the ribbon died and DIVE was the only verb. Pin a fat wood
    // unlock board to that locked bowl while they stand on the pad
    // and can afford it. Hide once unlocked, walked away, or broke.
    // Walk-to-bowl still does not buy.
    if (state.mode !== "play" || state.scene !== "shop") return false;
    if (bagHasStockable() || cashNeedsCollect()) return false;
    const n = nextLockedTank();
    if (n < 0 || !tankLive(n) || speciesUnlocked(n)) return false;
    if (!nearStockPad(n)) return false;
    if (state.money < SPECIES[n].unlock) return false;
    return true;
  }
  function unlockCueLabel() {
    const n = nextLockedTank();
    if (n < 0) return thumbCopy() ? "TAP TO UNLOCK" : "UNLOCK";
    return thumbCopy() ? "TAP TO UNLOCK" : ("UNLOCK $" + SPECIES[n].unlock);
  }
  function unlockCueBox() {
    const n = nextLockedTank();
    if (n < 0) return null;
    const t = TANK_POS[n];
    const ts = worldToScreen(t.x + TANK_W / 2, t.y + TANK_H * 0.42);
    const floor = actionFloor();
    const top = portraitStage() ? Math.max(hudSafeTop() + phoneCss(52), topHudFloor()) : 28;
    const ch = portraitStage() ? phoneCss(36) : 32;
    const tankSw = TANK_W * Math.max(0.001, (cam && cam.z) || 1);
    const cap = portraitStage() ? phoneCss(200) : 260;
    const tw = Math.min(cap, tankSw + 16);
    const cx = clamp(ts.x, tw / 2 + 16, W - tw / 2 - 16);
    const wantY = ts.y - ch * 0.65;
    const sz = actionBtnSize();
    const cy = clamp(wantY, top + ch / 2, floor - sz.h - sz.pad - ch / 2 - 8);
    return { x: cx - tw / 2, y: cy - ch / 2, w: tw, h: ch, tank: n };
  }
  function unlockPadGoal() {
    const n = nextLockedTank();
    if (n < 0) return { text: "", target: null };
    const t = TANK_POS[n];
    return {
      text: "Tap the lock to unlock " + SPECIES[n].name,
      target: { x: t.x + TANK_W / 2, y: t.y + TANK_H / 2 },
    };
  }
  function diveForTankIndex() {
    const i = state.diveForTank;
    if (i == null || i < 0) return -1;
    return i | 0;
  }
  function armDiveForTank(i) {
    if (i == null || i < 0) return;
    state.diveForTank = i | 0;
    state.diveForAway = 0;
  }
  function clearDiveForTank() {
    state.diveForTank = null;
    state.diveForAway = 0;
  }
  function tickDiveForCue(dt) {
    const i = diveForTankIndex();
    if (i < 0) return;
    if (state.scene === "ocean" || state.pendingScene === "ocean") {
      clearDiveForTank();
      return;
    }
    if ((state.stock[i] | 0) > 0) {
      clearDiveForTank();
      return;
    }
    if (nearStockPad(i)) {
      state.diveForAway = 0;
      return;
    }
    state.diveForAway = (state.diveForAway || 0) + (dt || 0);
    if (state.diveForAway >= DIVE_FOR_AWAY) clearDiveForTank();
  }
  function diveForCueLegal() {
    // C111 — after they just unlocked nextLockedTank (now that
    // species) the TAP TO UNLOCK board and lock-ribbon vanish on
    // an empty bowl (bag 0/5). Preview fish swim; the plate says
    // empty + a 0 badge; the only fat verb is DIVE at the south
    // thumb. Pin a fat wood DIVE FOR <SPECIES> / TAP TO DIVE
    // pier-board to that empty unlocked bowl (C100 tank-local —
    // on Seahorse, not Crab / Clownfish). Hide once they leave
    // the pad for a while, the bowl has stock, or they enter the
    // ocean. If the bag already holds that species, keep C100
    // tap-to-stock (do not stack two boards on the bowl).
    // loop 111 dive for the new bowl.
    // C113 — after TAP DIVE FOR, the bowl board used to stay
    // legal and world-pin onto the dock camera (clamped over
    // harbor water for the whole south walk). Hide the on-bowl
    // board the moment the hunt is armed or they leave the
    // Seahorse pad. heading-to-DIVE / the DIVE chip stay.
    // loop 113 hunt locks a seahorse.
    if (state.mode !== "play" || state.scene !== "shop") return false;
    if (state.pendingScene === "ocean") return false;
    if (cashNeedsCollect()) return false;
    if (diveForHuntIndex() >= 0) return false;
    if (diveWalkQueued()) return false;
    const i = diveForTankIndex();
    if (i < 0 || !tankLive(i) || !speciesUnlocked(i)) return false;
    if ((state.stock[i] | 0) > 0) return false;
    if (state.bag && state.bag.some((s) => (s | 0) === i)) return false;
    return nearStockPad(i);
  }
  function diveForCueLabel() {
    const i = diveForTankIndex();
    const name = (i >= 0 && SPECIES[i]) ? SPECIES[i].name.toUpperCase() : "FISH";
    // Phone: DIVE FOR SEAHORSE. Desktop: shorter DIVE · SEAHORSE.
    // TAP TO DIVE is the same verb as the DIVE chip (not a lock).
    return thumbCopy() ? ("DIVE FOR " + name) : ("DIVE · " + name);
  }
  function diveForCueBox() {
    const i = diveForTankIndex();
    if (i < 0) return null;
    const t = TANK_POS[i];
    const ts = worldToScreen(t.x + TANK_W / 2, t.y + TANK_H * 0.42);
    const floor = actionFloor();
    const top = portraitStage() ? Math.max(hudSafeTop() + phoneCss(52), topHudFloor()) : 28;
    const ch = portraitStage() ? phoneCss(36) : 32;
    const tankSw = TANK_W * Math.max(0.001, (cam && cam.z) || 1);
    const cap = portraitStage() ? phoneCss(200) : 260;
    const tw = Math.min(cap, tankSw + 16);
    const cx = clamp(ts.x, tw / 2 + 16, W - tw / 2 - 16);
    const wantY = ts.y - ch * 0.65;
    const sz = actionBtnSize();
    const cy = clamp(wantY, top + ch / 2, floor - sz.h - sz.pad - ch / 2 - 8);
    return { x: cx - tw / 2, y: cy - ch / 2, w: tw, h: ch, tank: i };
  }
  function diveForPadGoal() {
    const i = diveForTankIndex();
    if (i < 0) return { text: "", target: null };
    const name = SPECIES[i].name;
    const art = /^[aeiou]/i.test(name) ? "an" : "a";
    return {
      text: "DIVE to catch " + art + " " + name,
      target: dockWalkPoint(),
    };
  }
  function diveForHuntIndex() {
    const i = state.diveForHunt;
    if (i == null || i < 0) return -1;
    return i | 0;
  }
  function plazaDiveArmsHunt() {
    // C115 — after TAP TO UNLOCK the DIVE FOR board sits on the
    // empty bowl and the thumb DIVE chip stays live. Loop 114
    // hid SURFACE on that hunt but left this easier DIVE dropping
    // 6m Shallows + shiny clown. While the board is legal (just
    // unlocked empty bowl, bag empty of that fish), thumb DIVE
    // arms the same diveForHunt as TAP DIVE FOR. Do not hide
    // DIVE. Do not auto-dive on unlock. Before unlock / after
    // the hunt is done / bowl stocked: regular shallows.
    // loop 115 dive chip arms the hunt.
    if (!diveForCueLegal()) return -1;
    const i = diveForTankIndex();
    if (i < 0 || !speciesUnlocked(i)) return -1;
    armDiveForHunt(i);
    return i;
  }
  function armDiveForHunt(i) {
    // C112 — remember the species they tapped DIVE FOR so the
    // C86 dash / beginDive opens that band, not 6m Shallows.
    // loop 112 dive for the right band.
    if (i == null || i < 0) return;
    if (!speciesUnlocked(i)) return;
    state.diveForHunt = i | 0;
    applyHuntStockGoal();
  }
  function clearDiveForHunt() {
    state.diveForHunt = null;
  }
  function diveForBandPoint(i) {
    // Seahorse groves (and later extra bands) live at
    // zoneBandForSpecies — not the default ocean spawn (y=380).
    const s = i | 0;
    const band = zoneBandForSpecies(s);
    const lm = landmarkForSpecies(s);
    syncOceanHeight();
    const x = clamp(lm ? lm.x : OCEAN.w / 2, 90, OCEAN.w - 90);
    let y = lm ? lm.y : (band ? band.y0 + 220 : 380);
    const lo = band && band.y0 != null ? band.y0 + 24 : 280;
    const hi = Math.max(lo + 8, OCEAN.h - 80);
    y = clamp(y, lo, hi);
    return { x: x, y: y, band: band, tank: s };
  }
  function seedDiveForHunt(i) {
    const dest = diveForBandPoint(i);
    const s = i | 0;
    for (let n = 0; n < 6; n++) {
      pushOceanFish(s, dest.x + rand(-90, 130), dest.y + rand(-50, 90));
    }
    seedOceanScenery();
  }
  function nearestHuntFish(i) {
    let best = null, bestD = 1e9;
    for (const f of oceanFish) {
      if (f.caught || (f.s | 0) !== (i | 0)) continue;
      const d = Math.hypot(f.x - player.x, f.y - player.y);
      if (d < bestD) { bestD = d; best = f; }
    }
    return best;
  }
  function huntBagHasPrey(i) {
    const s = i == null || i < 0 ? diveForHuntIndex() : (i | 0);
    if (s < 0) return false;
    const bag = state.bag || [];
    for (let n = 0; n < bag.length; n++) {
      if ((bag[n] | 0) === s) return true;
    }
    return false;
  }
  function huntScoopExclusive() {
    // C113 — empty hunt bag: cone / scoop / ! marks only
    // the DIVE FOR species. Turtle / Tang already in a
    // bowl must not win first lock. After one hunt-species
    // is bagged they can scoop the rest of the dive.
    // loop 113 hunt locks a seahorse.
    const i = diveForHuntIndex();
    return i >= 0 && !huntBagHasPrey(i);
  }
  function surfaceAssistLegal() {
    // C114 — during a DIVE FOR hunt, hide the C98 ↑ SURFACE
    // assist until the bag holds a hunt-species (or is full).
    // A fat-finger SURFACE on bag 0/5 kills the first scoop
    // while the ribbon still says point the cone at a Seahorse.
    // Regular / first-dive (no hunt) still shows C98 in shallows.
    // Do not auto-surface. loop 114 hide SURFACE until the hunt bags.
    if (state.mode !== "play" || state.scene !== "ocean") return false;
    if (bagIsFull() || nearSurface() || player.y < 300) return false;
    const hunt = diveForHuntIndex();
    if (hunt >= 0 && !huntBagHasPrey(hunt)) return false;
    return true;
  }
  function surfaceChipLegal() {
    // Wood ↑ SURFACE is up: C98 assist (hunt bagged) or
    // legal SURFACE (near-surface / full bag). After bag
    // ≥ 1 this chip owns the thumb corner.
    // loop 121 surface ribbon clear of SURFACE.
    return surfaceAssistLegal() || surfaceActionLegal();
  }
  function surfaceChipBox() {
    // Same thumb-corner chip drawSurfaceAssist / legal
    // SURFACE paint. Bag 0/5 hunt returns null (C114).
    // loop 121 surface ribbon clear of SURFACE.
    if (!surfaceChipLegal()) return null;
    const legal = surfaceActionLegal();
    const sz = actionBtnSize();
    const w = portraitStage() ? phoneCss(120) : (legal ? sz.w : 132);
    const h = portraitStage()
      ? (legal ? sz.h : phoneCss(40))
      : (legal ? sz.h : 36);
    const inset = portraitStage()
      ? (sz.pad != null ? sz.pad : phoneCss(18))
      : 16;
    const floor = actionFloor();
    const playW = typeof viewWidth === "function" ? viewWidth() : W;
    let x = clamp(playW - inset - w, 12, playW - w - inset);
    if (portraitStage() && phoneShopOpen && typeof phoneShopPanelBox === "function") {
      const panel = phoneShopPanelBox();
      if (panel) {
        x = Math.min(x, panel.x - 10 - w);
        x = clamp(x, 12, playW - w - inset);
      }
    }
    return { x: x, y: floor - inset - h, w: w, h: h };
  }
  function huntScoopAllows(f) {
    if (isChestTarget(f)) return !!state.wreckChestReady;
    if (!f || f.caught || f.tease) return false;
    if (!huntScoopExclusive()) return true;
    return (f.s | 0) === diveForHuntIndex();
  }
  function huntBangWanted(f) {
    // ! marks follow the same hunt lock as the cone.
    return !!(f && f !== player.target && fishInCone(f) && huntScoopAllows(f));
  }
  function diveForHuntGoal() {
    const i = diveForHuntIndex();
    if (i < 0) return { text: "", target: null };
    const name = SPECIES[i].name;
    const art = /^[aeiou]/i.test(name) ? "an" : "a";
    const f = nearestHuntFish(i);
    const dest = diveForBandPoint(i);
    return {
      text: "Point the glowing cone at " + art + " " + name,
      target: f ? { x: f.x, y: f.y } : { x: dest.x, y: dest.y },
    };
  }
  function oceanEntrySpawn() {
    // C112 — DIVE FOR <species> opens that species' band.
    // C115 — plaza thumb DIVE, while that board is legal, arms
    // the same hunt before this spawn (Seahorse groves).
    // A normal DIVE chip (no hunt / board not legal) still
    // drops in shallows. loop 115 dive chip arms the hunt.
    if (state.expedition) {
      return { x: LM_WRECK.x, y: LM_WRECK.y, vx: 0, vy: 20, hunt: false };
    }
    const hunt = diveForHuntIndex();
    if (hunt >= 0) {
      const dest = diveForBandPoint(hunt);
      return { x: dest.x, y: dest.y, vx: 0, vy: 0, hunt: true, tank: hunt };
    }
    if (state.didFirstStock && !state.sawWreck) {
      return { x: 1880, y: 400, vx: 22, vy: 0, hunt: false };
    }
    return { x: OCEAN.w / 2, y: 380, vx: 0, vy: 0, hunt: false };
  }
  function phoneDockPlazaWalkWanted(wx, wy, sx, sy) {
    // C107 — 390 dock camera cannot see the bowls. A tap toward the
    // plaza / tanks (upper third, or north of the dock lip) walks the
    // same C106 alley shopPath hold-W uses. Desktop click-to-walk
    // and a Soon tank hit stay. No WASD / hover / pinch-zoom.
    if (!(portraitStage() || thumbCopy())) return false;
    if (state.scene !== "shop" || state.mode !== "play") return false;
    if (bagHasStockable() || cashNeedsCollect()) return false;
    const dest = nextUnlockWalkDest();
    if (!dest) return false;
    const onDockCam = !!(dockCameraReady() || (cam && cam.y >= DOCK_CAM_FLOOR - 40));
    const onDock = !!(player && player.y > 800);
    if (!onDock && !onDockCam) return false;
    // C129 — west dock tap walks west. C108 plaza remap is
    // north-to-bowls, not a left tap toward the painted west finger.
    if (westDockTapWanted(wx, wy) || onWestDockWalk(wx, wy)) return false;
    // C130 — east dock tap walks east. wy 870–899 is the top of
    // hut / POP, still the east boards — not a north-to-bowls tap.
    if (eastDockTapWanted(wx, wy) || onEastDockWalk(wx, wy)) return false;
    if (Math.hypot(player.x - dest.x, player.y - dest.y) < 48) return false;
    const floor = actionFloor();
    const screenY = sy != null ? sy : (mouse && mouse.pressY);
    const upper = screenY != null && screenY < floor * 0.42;
    const northWorld = wy < 900 || (player && wy < player.y - 28);
    return !!(upper || northWorld);
  }
  function plazaWalkChipLegal() {
    if (!portraitStage()) return false;
    if (state.mode !== "play" || state.scene !== "shop") return false;
    if (bagHasStockable() || cashNeedsCollect()) return false;
    // C112 — while a dive-for hunt walk is live the verb is DIVE,
    // not ↑ SHOP (secondary leftover: shop-north on the DIVE dock).
    if (diveForHuntIndex() >= 0) return false;
    const dest = nextUnlockWalkDest();
    if (!dest) return false;
    const n = nextLockedTank();
    if (n >= 0 && nearStockPad(n)) return false;
    const bowlsOff = dockCameraReady() || (player && player.y > 800 && !plazaCameraReady());
    return !!bowlsOff;
  }
  function plazaWalkChipBox() {
    const sz = actionBtnSize();
    const dive = actionBtnBox();
    const w = Math.max(sz.w, phoneCss(120));
    const h = sz.h;
    const gap = phoneCss(10);
    let x = dive.x - gap - w;
    let y = dive.y;
    if (x < 12) {
      x = dive.x;
      y = dive.y - gap - h;
    }
    const floor = actionFloor();
    const inset = actionChipInset();
    x = clamp(x, 12, W - w - inset);
    y = clamp(y, hudSafeTop() + phoneCss(56), floor - h - inset);
    return hudBox(x, y, w, h, inset);
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
    if ((inDiveZone() || nearDivePad() || diveActionLegal()) && state.surfaceLock <= 0 && !bagHasStockable() && !cashNeedsCollect()) return 1;
    // Already in the plaza with progress — do not stick on "Walk to the glowing dock".
    if (plazaHintSpent()) return -1;
    // loop 124 north walk is not a south-dock quest
    if (shopWalkRibbonWanted()) return -1;
    if (state.scene === "shop" && player && player.y < DIVE_ZONE.y - 40 && !nearDivePad()) return -1;
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
      // C112 — a dive-for hunt walk keeps the species ribbon even
      // if first-session dock copy would otherwise win.
      if (state.scene === "shop" && diveForHuntIndex() >= 0) return diveForPadGoal();
      const step = firstSessionIndex();
      // loop 124 north walk is not a south-dock quest
      if (step === 0) {
        if (hideDockWalkHint() || shopWalkRibbonWanted()) return shopBowlsGoal();
        if (state.scene === "shop" && player && player.y < DIVE_ZONE.y - 40 && !nearDivePad()) return shopBowlsGoal();
        return { text: thumbCopy() ? "Tap the glowing dock to walk" : "Walk to the glowing dock", target: { x: 880, y: 980 } };
      }
      if (step === 1) return { text: thumbCopy() ? "Tap DIVE" : "Press SPACE or click to DIVE", target: { x: 880, y: 980 } };
      if (step === 2) {
        const n = Math.min(5, (state.caughtCount && state.caughtCount[0]) | 0);
        const shiny = firstRareFish();
        const mark = diveLandmark();
        if (shiny && (state.shinyCallout > 0 || !state.caughtRare) && n === 0) {
          return { text: "Catch the SHINY — then 5 Clownfish", target: { x: shiny.x, y: shiny.y } };
        }
        if (state.didFirstStock && !state.unlocked[1] && (state.tangHintLife || 0) > 0 && !state.tangHintDone) {
          const tease = firstTeaseFish();
          if (tease) return { text: "A blue flash in the deep — Maya asked for Tang", target: { x: tease.x, y: tease.y } };
          return { text: "Catch more — Maya wants a Blue Tang", target: nearestOceanFish() };
        }
        if (mark && n < 5) {
          return { text: "Catch 5 at the glowing reef  ·  " + n + "/5", target: mark };
        }
        return { text: "Catch 5  ·  " + n + "/5", target: nearestOceanFish() };
      }
      if (step === 3) return { text: thumbCopy() ? "Tap SURFACE" : "Surface — SPACE or click", target: { x: player.x, y: 140 } };
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
        return { text: thumbCopy() ? "Bag full — tap SURFACE" : "Bag full — SPACE or click to surface", target: { x: player.x, y: 140 } };
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
      // C112 — DIVE FOR <species> points at that fish / grove, not
      // the first-dive SHINY clownfish. loop 112 dive for the right band.
      if (diveForHuntIndex() >= 0) return diveForHuntGoal();
      const chest = wreckChestTarget();
      if (chest && (inWreck(player.x, player.y) ||
          Math.hypot(player.x - chest.x, player.y - chest.y) < 460)) {
        return { text: "Hold the cone on the wreck chest", target: { x: chest.x, y: chest.y } };
      }
      const shiny = firstRareFish();
      if (shiny && (state.shinyCallout > 0 || !state.caughtRare)) {
        return { text: "Point the glowing cone at the SHINY clownfish", target: { x: shiny.x, y: shiny.y } };
      }
      if (!state.unlocked[1] && (state.divesThisSession >= 2 || state.didFirstStock) &&
          (state.tangHintLife || 0) > 0 && !state.tangHintDone) {
        const tease = firstTeaseFish();
        if (tease) return { text: "A blue flash in the deep — rumor of Blue Tang", target: { x: tease.x, y: tease.y } };
      }
      return { text: "Hold or tap a fish — the cone locks on until the bar fills", target: nearestOceanFish() };
    }
    if (nearBoat() && expeditionUnlocked() && !state.expedition) {
      return { text: thumbCopy() ? "Tap to start an expedition ($35)" : "Press SPACE to start an expedition ($35)", target: { x: BOAT.x, y: BOAT.y } };
    }
    if (state.scene === "shop" && bagHasStockable()) {
      return { text: "Walk into the glowing tank to stock your catch", target: stockableTankTarget() || { x: TANK_POS[0].x + TANK_W / 2, y: TANK_POS[0].y + TANK_H / 2 } };
    }
    if (state.scene === "shop" && cashNeedsCollect()) {
      return { text: "Collect  $" + state.registerCash + "  ·  stand in the till glow", target: tillWorld() };
    }
    // C112 — after tapping DIVE FOR, keep the species ribbon on the
    // walk south / DIVE pad. Do not flip to shop-north. Secondary.
    if (state.scene === "shop" && diveForHuntIndex() >= 0) return diveForPadGoal();
    if (inDiveZone() && state.surfaceLock <= 0) {
      return { text: thumbCopy() ? "Tap DIVE" : "Press SPACE or click to DIVE", target: { x: 880, y: 980 } };
    }
    const vip = !ribbonLockedToGoal() ? activeVIP() : null;
    if (vip) {
      const want = clamp((vip.want != null ? vip.want : vip.tank) | 0, 0, 4);
      const t = TANK_POS[want];
      return { text: "A VIP wants " + SPECIES[want].name + " — stock that tank", target: { x: t.x + TANK_W / 2, y: t.y + TANK_H / 2 } };
    }
    if (state.scene === "shop" && state.wreckLamp && player && player.y > 860) {
      for (const c of customers) {
        if (c.name === "Sable" && c.state === "lamp") {
          return { text: "Sable came for the lantern", target: { x: WRECK_LAMP.x, y: WRECK_LAMP.y + 48 } };
        }
      }
    }
    if (state.scene === "shop" && dayBoardReady() && !state.sessionDayGuest && player && player.y > 860) {
      const sp = SPECIES[state.dayWant | 0];
      const wantName = sp ? sp.name : "a fish";
      for (const c of customers) {
        if (c.dayGuest && c.name === state.dayGuest) {
          return { text: state.dayGuest + " wants " + wantName + " today", target: { x: c.x, y: c.y } };
        }
      }
      return { text: "Today: " + state.dayGuest + " · " + wantName, target: { x: DAY_BOARD.x, y: DAY_BOARD.y } };
    }
    if (state.stock.some(n => n > 0) && state.registerCash === 0) {
      return { text: "Customers are on the way — wait at the cashier", target: { x: REGISTER.x + REGISTER.w / 2, y: REGISTER.y + REGISTER.h / 2 } };
    }
    // C110 — occupying the next locked pad is not a DIVE-dock quest.
    // After C109 the ribbon died on arrival and DIVE was the only verb.
    // Cue tap-the-lock while they can afford it. Walk is still not a buy.
    if (unlockCueLegal()) return unlockPadGoal();
    // C111 — after the C110 buy the lock board vanishes on an empty
    // bowl and DIVE at the south thumb is the only verb. Cue DIVE
    // for that species while the new tank is empty. Do not bring
    // back the DIVE-dock quest or the tap-the-lock line.
    if (diveForCueLegal()) return diveForPadGoal();
    if (diveForHuntIndex() >= 0) return diveForPadGoal();
    // C109 — shop-walk ribbon before the plaza-south / DIVE-dock
    // fallbacks. Mid-walk the camera is already on Goldfish / Angelfish
    // / Dolphin; hideDockWalkHint is false the moment they leave the pad.
    // loop 124 north walk is not a south-dock quest
    if (hideDockWalkHint() || shopWalkRibbonWanted() ||
        (state.scene === "shop" && player && player.y < DIVE_ZONE.y - 40 && !nearDivePad())) return shopBowlsGoal();
    if (inPlazaYard() && plazaHintSpent()) {
      if (hideSouthDockHint()) return { text: "", target: null };
      return { text: thumbCopy() ? "Dock is south — tap to walk" : "The glowing dock is south — walk or tap", target: { x: 880, y: 980 } };
    }
    return { text: thumbCopy() ? "Walk to the glowing DIVE dock — tap to walk" : "Walk to the glowing DIVE dock and press SPACE", target: { x: 880, y: 980 } };
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
  // C99 — HUD “tap to stock” is the same pier-board sign as C97 DIVE /
  // C98 SURFACE (not a leftover cyan card). On-tank pointer stays a
  // world label. goto-stock hitbox stays on the caller.
  // C100 — pin that pier-board to the glowing unlocked tank
  // (world→screen of glowingStockIndex), not W/2. On a 390 tank row
  // W/2 covers locked Goldfish while the bag fish (Clownfish) sits
  // left. Same fat chip / goto-stock. Not a hide-on-locked gate.
  function drawStockWalkCue() {
    if (state.mode !== "play" || state.scene !== "shop") return;
    if (!bagHasStockable()) return;
    const i = glowingStockIndex();
    if (i < 0) return;
    if (nearStockPad(i)) return;
    const t = TANK_POS[i];
    const tgt = stockableTankTarget() || tankWalkPoint(i);
    const ts = worldToScreen(t.x + TANK_W / 2, t.y + TANK_H * 0.42);
    const floor = actionFloor();
    const top = portraitStage() ? Math.max(hudSafeTop() + phoneCss(52), topHudFloor()) : 28;
    const on = ts.x > 36 && ts.x < W - 36 && ts.y > top && ts.y < floor - 36;
    const pulse = 0.55 + 0.35 * Math.sin(state.time * 6);
    const label = thumbCopy() ? "tap to stock" : "walk here to stock";
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
    ctx.font = portraitStage() ? ("800 " + phoneCss(14) + "px Nunito, sans-serif") : "800 13px Nunito, sans-serif";
    const tw = Math.min(ctx.measureText(label).width + 36, portraitStage() ? phoneCss(200) : 260);
    const ch = portraitStage() ? phoneCss(36) : 32;
    const cx = clamp(ts.x, tw / 2 + 16, W - tw / 2 - 16);
    const wantY = ts.y - ch * 0.65;
    const cy = clamp(wantY, top + ch / 2, floor - actionBtnSize().h - actionBtnSize().pad - ch / 2 - 8);
    const chip = hudBox(cx - tw / 2, cy - ch / 2, tw, ch);
    const stain = 0.10 + pulse * 0.10;
    const stockFont = portraitStage() ? phoneCss(14) : 13;
    drawPierBoardChip(chip.x, chip.y, chip.w, chip.h, label, stockFont, stain);
    // loop 138 clearer stock direction — when the tank is off-screen this
    // little arrow is the only "which way" cue, so make it as legible as
    // the on-tank arrow: bigger, outlined, and centered in the chip.
    ctx.save();
    ctx.translate(chip.x + 15, chip.y + chip.h / 2);
    ctx.rotate(ang);
    ctx.fillStyle = "#ffe27a";
    ctx.strokeStyle = "rgba(80,50,10,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(-6, 7);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-6, -7);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
    btn("goto-stock", chip.x, chip.y, chip.w, chip.h);
  }
  // C99 — leftover first-two-minute cyan chips (off-dock DIVE after
  // SURFACE, then tap-to-stock) share C97/C98 drawPierBoardChip paint.
  // Paint only — dockCornerBox / goto-stock hitboxes stay.
  function drawDockCorner() {
    if (state.mode !== "play" || state.scene !== "shop") return;
    if (cashNeedsCollect()) return;
    if (diveChipLegal()) return;
    if (!dockOffScreen()) return;
    const b = dockCornerBox();
    const pulse = 0.55 + 0.35 * Math.sin(state.time * 6);
    const stain = 0.10 + pulse * 0.10;
    const diveFont = portraitStage() ? phoneCss(18) : (b.h > 38 ? 20 : 16);
    drawPierBoardChip(b.x, b.y, b.w, b.h, thumbCopy() ? "DIVE" : "→ DIVE", diveFont, stain);
    btn("dive", b.x, b.y, b.w, b.h);
  }
  // C107 — fat ↑ SHOP / north cue on the 390 dock camera so a thumb
  // tap walks the C106 alley to the next unlock bowl. Same
  // drawPierBoardChip paint as DIVE / tap-to-stock. No hover, no WASD.
  function drawPlazaWalkCue() {
    if (!plazaWalkChipLegal()) return;
    const b = plazaWalkChipBox();
    const pulse = 0.55 + 0.35 * Math.sin(state.time * 6);
    const stain = 0.10 + pulse * 0.10;
    const font = phoneCss(16);
    drawPierBoardChip(b.x, b.y, b.w, b.h, "↑ SHOP", font, stain);
    btn("goto-plaza", b.x, b.y, b.w, b.h);
  }
  // C110 — pin a fat wood TAP TO UNLOCK board to the next locked
  // bowl once they occupy the pad and can afford it. Same C100
  // tank-local pier-board as tap-to-stock / DIVE (not a cyan pill,
  // not W/2 over Crab / Goldfish). Walk-to-bowl still does not buy.
  function drawUnlockWalkCue() {
    if (!unlockCueLegal()) return;
    const chip = unlockCueBox();
    if (!chip) return;
    const pulse = 0.55 + 0.35 * Math.sin(state.time * 6);
    const stain = 0.10 + pulse * 0.10;
    const font = portraitStage() ? phoneCss(14) : 13;
    drawPierBoardChip(chip.x, chip.y, chip.w, chip.h, unlockCueLabel(), font, stain);
    btn("goto-unlock", chip.x, chip.y, chip.w, chip.h);
  }
  // C111 — pin a fat wood DIVE FOR <SPECIES> / TAP TO DIVE board to
  // the empty unlocked bowl after the C110 buy. Same C100 tank-local
  // pier-board as tap-to-stock / TAP TO UNLOCK (not a cyan pill, not
  // W/2 over Crab / Clownfish). Tapping walks to the DIVE pad —
  // same path as the DIVE chip. Do not auto-dive on unlock.
  function drawDiveForWalkCue() {
    if (!diveForCueLegal()) return;
    if (diveForHuntIndex() >= 0 || diveWalkQueued()) return;
    if (unlockCueLegal()) return;
    const chip = diveForCueBox();
    if (!chip) return;
    const pulse = 0.55 + 0.35 * Math.sin(state.time * 6);
    const stain = 0.10 + pulse * 0.10;
    const font = portraitStage() ? phoneCss(13) : 13;
    drawPierBoardChip(chip.x, chip.y, chip.w, chip.h, diveForCueLabel(), font, stain);
    btn("goto-dive-for", chip.x, chip.y, chip.w, chip.h);
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
  // C98 — first-dive ↑ SURFACE assist is the same pier-board sign as
  // C97 DIVE / legal SURFACE (clip drawPierBoards + #e8c04a gold).
  // Paint only — box, actionChipInset, visualViewport floor, and
  // btn("goto-surface") stay. First dive starts at y=380 / 6m, so
  // the legal SURFACE board (nearSurface y<280) never paints here.
  // C114 — hunt dives hide this chip (and the goto-surface hitbox)
  // until the bag holds a hunt-species. A full bag uses the legal
  // SURFACE board (canSurfaceNow), not a stacked C98 assist.
  // loop 114 hide SURFACE until the hunt bags.
  // C121 — box comes from surfaceChipBox so the catch
  // ribbon can clear the same thumb target.
  // loop 121 surface ribbon clear of SURFACE.
  function drawSurfaceAssist() {
    if (!surfaceAssistLegal()) return;
    const pulse = 0.55 + 0.35 * Math.sin(state.time * 6);
    const raw = surfaceChipBox();
    if (!raw) return;
    const inset = portraitStage() ? actionChipInset() : 10;
    const b = hudBox(raw.x, raw.y, raw.w, raw.h, inset);
    const surfFont = portraitStage() ? phoneCss(16) : (b.h > 38 ? 18 : 15);
    const stain = 0.10 + pulse * 0.10;
    drawPierBoardChip(b.x, b.y, b.w, b.h, "↑ SURFACE", surfFont, stain);
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
  // Money / BAG readout plate. Opaque dark fill — not pierChip wood, not a
  // clear/low-alpha inset. Loop 82 passed the dark ink into pierChip; the
  // wood frame still painted first, and portrait chipAlpha (ribbon overlap)
  // dropped BAG to 0.12 so cream type sat on dock grain.
  const HUD_READOUT_PLATE = "rgba(18, 32, 42, 0.94)";
  function hudReadoutPlate(x, y, w, h) {
    ctx.fillStyle = HUD_READOUT_PLATE;
    roundRect(x, y, w, h, 10); ctx.fill();
    ctx.strokeStyle = "rgba(90, 48, 16, 0.45)";
    ctx.lineWidth = 1.5;
    roundRect(x, y, w, h, 10); ctx.stroke();
    ctx.strokeStyle = "rgba(255, 226, 170, 0.16)";
    ctx.lineWidth = 1;
    roundRect(x + 1.5, y + 1.5, w - 3, h - 3, 8.5); ctx.stroke();
  }
  function pierChip(x, y, w, h, ink) {
    // Honey-pine frame + chalkboard inset — belongs to the pier, still HUD-pinned.
    ensurePaint();
    const wood = ctx.createLinearGradient(x, y, x + w * 0.42, y + h);
    wood.addColorStop(0, "#d4a060");
    wood.addColorStop(0.45, "#b07a3a");
    wood.addColorStop(1, "#6a4220");
    ctx.fillStyle = wood;
    roundRect(x, y, w, h, 10); ctx.fill();
    if (paint.wood) {
      ctx.save();
      roundRect(x, y, w, h, 10); ctx.clip();
      ctx.globalAlpha = 0.52;
      ctx.drawImage(paint.wood, 0, 2, paint.wood.width, paint.wood.height, x - 3, y - 1, w + 6, h + 2);
      ctx.restore();
    }
    sunWashBox(x, y, w, h, 10);
    ctx.fillStyle = ink || "rgba(52, 64, 48, 0.9)";
    roundRect(x + 7, y + 6, w - 14, h - 12, 6); ctx.fill();
    ctx.fillStyle = "rgba(255, 236, 190, 0.12)";
    ctx.fillRect(x + 10, y + 8, w - 20, 6);
    ctx.strokeStyle = "rgba(90, 48, 16, 0.5)";
    ctx.lineWidth = 1.5;
    roundRect(x, y, w, h, 10); ctx.stroke();
    ctx.strokeStyle = "rgba(255, 226, 170, 0.16)";
    ctx.lineWidth = 1;
    roundRect(x + 1.5, y + 1.5, w - 3, h - 3, 8.5); ctx.stroke();
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
      const parked = fitSpeechScreen(scr.x, scr.y, tw, th, 24);
      let x = parked.x;
      let y = parked.y;
      const till = worldToScreen(REGISTER.x + REGISTER.w / 2, REGISTER.y + 28);
      const tillBox = { x: till.x - 86, y: till.y - 22, w: 172, h: 56 };
      const { muteB, pauseB } = topCtrlBoxes();
      const bump = (box) => {
        const mine = { x: x - tw / 2, y: y - 24, w: tw, h: th };
        if (!boxesOverlap(mine, box, 10)) return;
        const stage = speechStageRect();
        const above = box.y - 14;
        const below = box.y + box.h + 28;
        if (above >= stage.y) y = above;
        else y = clamp(below, stage.y, stage.y + stage.h);
        const parked2 = fitSpeechScreen(x, y, tw, th, 24);
        x = parked2.x;
        y = parked2.y;
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
    const px = portraitStage()
      ? (live && live.big ? phoneCss(15) : live ? phoneCss(14) : phoneCss(13))
      : (live && live.big ? 15 : live ? 14 : 13);
    return (live ? "800 " : "700 ") + px + "px Nunito, sans-serif";
  }
  function ribbonLayout() {
    const toastLive = !ribbonLockedToGoal() && state.toasts.length && !state.unlockBanner;
    if (ribbonHidesForDock() && !toastLive) return null;
    const live = toastLive ? state.toasts[0] : null;
    const gt = live ? live.msg : goalText();
    if (!gt) return null;
    const { muteB, pauseB } = topCtrlBoxes();
    if (!portraitStage()) {
      const leftPad = 210;
      const rightPad = W - muteB.x + 16;
      const maxW = Math.max(280, Math.min(680, W - leftPad - rightPad));
      let font = ribbonFont(live);
      ctx.font = font;
      const inner = maxW - 28;
      let lines = wrapHudLines(gt, inner);
      if (lines.length > 2) {
        font = (live ? "800 " : "700 ") + 12 + "px Nunito, sans-serif";
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
      const gx = clamp(W / 2 - tw / 2, leftPad, W - 12 - tw);
      // Desktop DIVE copy used to sit on the dusk sky / shop signage.
      const gy = /DIVE/i.test(gt) ? 64 : 16;
      // C118 — park under TODAY so the ribbon cannot eat the plate.
      // C119 — on a DIVE, park under the zone plate too so
      // 70m · Seahorse groves is not under the cone ribbon.
      // loop 118 plaza today after unlock.
      // loop 119 ocean zone plate readable.
      const parkedY = Math.max(gy, ribbonParkTop());
      return Object.assign(hudBox(gx, parkedY, tw, th), {
        text: gt,
        lines,
        font,
        col: live ? live.col : "#e8fbff",
        toast: !!live,
        lineStep: 17,
      });
    }
    // Portrait: wrap inside the stage left of SHOP / mute, and park
    // below money / BAG / mute / pause. Staying left of SHOP (instead of
    // dropping under it) keeps world labels like CASHIER readable.
    const shopB = phoneShopBtnBox();
    const leftPad = 12;
    let rightLimit = Math.min(muteB.x, pauseB.x, shopB.x) - phoneCss(8);
    const surfEarly = typeof surfaceChipBox === "function" ? surfaceChipBox() : null;
    if (surfEarly) rightLimit = Math.min(rightLimit, surfEarly.x - phoneCss(8));
    const maxW = Math.max(phoneCss(160), Math.min(W - leftPad - 12, rightLimit - leftPad));
    let font = ribbonFont(live);
    ctx.font = font;
    const inner = maxW - 28;
    let lines = wrapHudLines(gt, inner);
    if (lines.length > 2) {
      font = (live ? "800 " : "700 ") + phoneCss(12) + "px Nunito, sans-serif";
      ctx.font = font;
      lines = wrapHudLines(gt, inner);
    }
    if (lines.length > 2) {
      font = "700 " + phoneCss(11) + "px Nunito, sans-serif";
      ctx.font = font;
      lines = wrapHudLines(gt, inner);
    }
    if (lines.length > 2) lines = [lines[0], lines.slice(1).join(" ")];
    let tw = 28;
    for (let i = 0; i < lines.length; i++) tw = Math.max(tw, ctx.measureText(lines[i]).width + 28);
    tw = Math.min(Math.ceil(tw + 4), maxW);
    const lineStep = live && live.big ? phoneCss(18) : phoneCss(16);
    const th = lines.length > 1
      ? phoneCss(live && live.big ? 44 : 40)
      : phoneCss(live && live.big ? 32 : 28);
    const platesBottom = Math.max(
      hudSafeTop() + phoneCss(48),
      muteB.y + muteB.h,
      pauseB.y + pauseB.h
    );
    // C118 — park the DIVE-to-catch ribbon under TODAY so the
    // unlock toast / ribbon cannot eat the plate.
    // C119 — on a DIVE, also clear the depth / zone plate.
    // C120 — on a phone hunt, do not paint that ribbon as a
    // third chip over the first seahorse ! marks. Move it
    // above DIVE / SURFACE, or combine it away when the
    // action lip leaves no room. TODAY + 70m stay.
    // C121 — once ↑ SURFACE is legal, that low park sat on
    // the same thumb lip as the wood chip. Stay left of
    // SURFACE, park above it with clearance, or combine
    // away. Do not put the ribbon back over the grove.
    // C122 does not undo C121 — the leftover is the
    // SURFACE fade taxi from the bay into the tank room.
    // loop 118 plaza today after unlock.
    // loop 119 ocean zone plate readable.
    // loop 120 hunt hud not over prey.
    // loop 121 surface ribbon clear of SURFACE.
    // loop 122 surface stays on the dock.
    const parkedY = Math.max(platesBottom + phoneCss(8), ribbonParkTop());
    let gy = parkedY;
    const surf = surfEarly;
    if (huntRibbonCompact() && !toastLive) {
      const lowY = ribbonLowParkTop(th);
      const clear = huntHudFloor() + phoneCss(16);
      if (lowY >= clear) gy = lowY;
      else return null;
    }
    if (surf && !toastLive) {
      const gap = typeof ribbonSurfaceGap === "function" ? ribbonSurfaceGap() : phoneCss(20);
      if (gy + th > surf.y - gap) {
        const liftY = surf.y - Math.max(gap, phoneCss(28)) - th;
        if (liftY >= huntHudFloor() + phoneCss(16)) gy = liftY;
        else return null;
      }
    }
    const gx = clamp(leftPad, leftPad, Math.max(leftPad, rightLimit - tw));
    return Object.assign(hudBox(gx, gy, tw, th), {
      text: gt,
      lines,
      font,
      col: live ? live.col : "#e8fbff",
      toast: !!live,
      lineStep,
    });
  }
  function chipAlpha(box, ribbon, opts) {
    // Rail cards live in the reserved well. Do not hide them when the
    // shack walks by — that dropped the stack from 5 to 2 in C72.
    if (!(opts && opts.rail)) {
      const shack = baitShackScreenBox();
      if (shack && boxesOverlap(box, shack, 18)) return 0;
    }
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
    const step = lines.length > 1 ? (rb.lineStep != null ? rb.lineStep : 17) : 0;
    const base = portraitStage() ? Math.round(rb.h * 0.12) : 5;
    const y0 = rb.y + rb.h / 2 + base - step * (lines.length - 1) / 2;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], rb.x + rb.w / 2, y0 + i * step);
    }
  }
  function moneyHudBox(ribbon) {
    if (portraitStage()) {
      return hudBox(12, hudSafeTop(), phoneCss(124), phoneCss(48));
    }
    return dodgeUpgradeTray(parkChip(hudBox(16, 14, 200, 52), ribbon));
  }
  function drawMoneyReadout(moneyBox) {
    const cx = moneyBox.x + moneyBox.w * 0.5, cy = moneyBox.y + moneyBox.h * 0.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(state.moneyPunch, state.moneyPunch);
    ctx.translate(-cx, -cy);
    if (portraitStage() || state.scene === "ocean") {
      hudReadoutPlate(moneyBox.x, moneyBox.y, moneyBox.w, moneyBox.h);
    } else {
      pierChip(moneyBox.x, moneyBox.y, moneyBox.w, moneyBox.h);
    }
    const coinR = portraitStage() ? Math.max(8, Math.round(moneyBox.h * 0.22)) : 14;
    drawCoin(moneyBox.x + Math.round(moneyBox.w * 0.18), cy, coinR);
    const cashPx = portraitStage() ? Math.max(14, Math.round(moneyBox.h * 0.34)) : 22;
    const goalPx = portraitStage() ? Math.max(10, Math.round(moneyBox.h * 0.20)) : 11;
    const textX = moneyBox.x + Math.round(moneyBox.w * 0.34);
    ctx.fillStyle = "#fff6e8"; ctx.font = "800 " + cashPx + "px Nunito, sans-serif"; ctx.textAlign = "left";
    ctx.fillText(String(state.displayMoney), textX, moneyBox.y + Math.round(moneyBox.h * 0.46));
    const ng = nextGoal();
    if (ng) {
      // loop 139 next-buy ready nudge — the cheapest next upgrade / unlock
      // caption looked the same whether you were saving for it or could
      // already afford it. When you can, brighten it to cream and give a
      // gentle pulse (like the affordable tank / upgrade cards) so the
      // ready buy is not easy to miss; otherwise it stays the quiet gold
      // savings target. Same "Next X $Y" copy, same position.
      const canBuy = (state.money | 0) >= ng.cost;
      ctx.save();
      if (canBuy) ctx.globalAlpha *= 0.85 + 0.15 * Math.sin(state.time * 4);
      ctx.fillStyle = canBuy ? "#fff2c4" : "#ffe27a";
      ctx.font = "700 " + goalPx + "px Nunito, sans-serif";
      ctx.fillText("Next " + ng.name + " $" + ng.cost, textX, moneyBox.y + Math.round(moneyBox.h * 0.78));
      ctx.restore();
    }
    ctx.restore();
  }
  function drawHUD() {
    const ribbon = ribbonLayout();
    const moneyBox = moneyHudBox(ribbon);
    ctx.save();
    ctx.globalAlpha = 1;
    drawMoneyReadout(moneyBox);
    ctx.restore();
    const bagBox = portraitStage()
      ? hudBox(moneyBox.x + moneyBox.w + phoneCss(8), hudSafeTop(), phoneCss(88), moneyBox.h)
      : dodgeUpgradeTray(parkChip(hudBox(224, 14, 168, 52), ribbon));
    ctx.save();
    ctx.globalAlpha = 1;
    const bcx = bagBox.x + bagBox.w * 0.5, bcy = bagBox.y + bagBox.h * 0.5;
    ctx.translate(bcx, bcy);
    ctx.scale(state.bagPunch, state.bagPunch);
    ctx.translate(-bcx, -bcy);
    hudReadoutPlate(bagBox.x, bagBox.y, bagBox.w, bagBox.h);
    const bagLabelPx = portraitStage() ? Math.max(11, Math.round(bagBox.h * 0.24)) : 13;
    const bagCountPx = portraitStage() ? Math.max(14, Math.round(bagBox.h * 0.32)) : 22;
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 " + bagLabelPx + "px Nunito, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("BAG", bagBox.x + Math.round(bagBox.w * 0.12), bagBox.y + Math.round(bagBox.h * 0.40));
    ctx.fillStyle = "#fff6e8"; ctx.font = "800 " + bagCountPx + "px Nunito, sans-serif";
    const bagShown = state.bag.length;
    ctx.fillText(bagShown + " / " + bagMax(), bagBox.x + Math.round(bagBox.w * 0.12), bagBox.y + Math.round(bagBox.h * 0.78));
    ctx.restore();
    if (bagShown || bagGhosts.length) {
      const pipN = bagShown + bagGhosts.length;
      const bw = Math.min(36 + pipN * 28, portraitStage() ? Math.max(80, W - 24) : 340);
      let ib = portraitStage()
        ? hudBox(12, Math.max(moneyBox.y + moneyBox.h + 6, (ribbon ? ribbon.y + ribbon.h + 6 : hudSafeTop())), bw, Math.min(52, moneyBox.h))
        : hudBox(400, 14, bw, 52);
      if (ribbon && boxesOverlap(ib, ribbon, 12)) {
        ib = hudBox(portraitStage() ? 12 : 400, ribbon.y + ribbon.h + 8, bw, 52);
      }
      ctx.save();
      ctx.globalAlpha = chipAlpha(ib, ribbon);
      pierChip(ib.x, ib.y, ib.w, ib.h);
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
    const sessionY = Math.max(
      sessionChipTop(),
      moneyBox.y + moneyBox.h + 8,
      bagBox.y + bagBox.h + 8
    );
    const sessionM = sessionChipMetrics();
    if (missionVisible()) {
      const reached = Math.max(1, Math.min(6, firstSessionReached()));
      const label = "FIRST SESSION  " + reached + " / 6";
      ctx.font = "800 " + sessionM.font + "px Nunito, sans-serif";
      const tw = Math.min(ctx.measureText(label).width + sessionM.pad * 2, sessionM.maxW);
      const chip = hudBox(sessionM.x, sessionY, tw, sessionM.h);
      const a = sessionChipPaintAlpha();
      if (a > 0.04) {
        ctx.save();
        ctx.globalAlpha = a;
        pierChip(chip.x, chip.y, chip.w, chip.h, "rgba(46, 52, 34, 0.9)");
        ctx.fillStyle = "#ffe27a";
        ctx.font = "800 " + sessionM.font + "px Nunito, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(label, chip.x + sessionM.pad, chip.y + Math.round(chip.h * 0.68));
        ctx.restore();
      }
    } else if (sessionChipVisible()) {
      let cur = todayGoalLabel();
      if (!cur) {
        rollSessionGoals();
        cur = todayGoalLabel() || sessionGoalLabel((state.sessionGoals || [])[0] || "serve");
      }
      const day = Math.max(1, state.sessionDay | 0);
      ctx.font = "800 " + sessionM.font + "px Nunito, sans-serif";
      const label = "TODAY " + day + "  ·  " + cur;
      const tw = Math.min(ctx.measureText(label).width + sessionM.pad * 2, sessionM.maxW);
      const chip = hudBox(sessionM.x, sessionY, tw, sessionM.h);
      const a = sessionChipPaintAlpha();
      if (a > 0.04) {
        ctx.save();
        ctx.globalAlpha = a;
        pierChip(chip.x, chip.y, chip.w, chip.h, "rgba(40, 50, 42, 0.9)");
        ctx.fillStyle = "#dce8b0";
        ctx.font = "800 " + sessionM.font + "px Nunito, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(label, chip.x + sessionM.pad, chip.y + Math.round(chip.h * 0.68));
        ctx.restore();
      }
    }
    if (zoneChipVisible()) {
      const depthTxt = zoneChipLabel();
      ctx.font = "800 " + sessionM.font + "px Nunito, sans-serif";
      const dw = Math.min(ctx.measureText(depthTxt).width + sessionM.pad * 2, sessionM.maxW);
      const dchip = hudBox(sessionM.x, zoneChipTop(), dw, sessionM.h);
      const da = zoneChipPaintAlpha();
      if (da > 0.04) {
        ctx.save();
        ctx.globalAlpha = da;
        pierChip(dchip.x, dchip.y, dchip.w, dchip.h, "rgba(36, 48, 40, 0.92)");
        ctx.fillStyle = "#e8f4c8";
        ctx.font = "800 " + sessionM.font + "px Nunito, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(depthTxt, dchip.x + sessionM.pad, dchip.y + Math.round(dchip.h * 0.68));
        if (state.zoneTitle) {
          const u = clamp(state.zoneTitle.life / state.zoneTitle.max, 0, 1);
          const t = 1 - u;
          const a = t < 0.2 ? t / 0.2 : t > 0.48 ? (1 - t) / 0.52 : 1;
          ctx.strokeStyle = "rgba(255, 226, 122," + (0.28 + 0.5 * a) + ")";
          ctx.lineWidth = 2.2;
          roundRect(dchip.x, dchip.y, dchip.w, dchip.h, 10); ctx.stroke();
        }
        ctx.restore();
      }
    }
    if (portraitStage()) {
      drawPhoneShopBtn();
      if (phoneShopOpen || state.bookOpen != null) {
        drawPhoneShopPanel();
        drawSpeciesStrip(ribbon);
      }
    } else if (speciesRailReady()) {
      drawSpeciesStrip(ribbon);
    }
    const { muteB, pauseB } = topCtrlBoxes();
    card(muteB.x, muteB.y, muteB.w, muteB.h);
    drawSpeaker(muteB.x + muteB.w / 2, muteB.y + muteB.h / 2, state.muted);
    btn("mute", muteB.x, muteB.y, muteB.w, muteB.h);
    card(pauseB.x, pauseB.y, pauseB.w, pauseB.h);
    ctx.fillStyle = "#fff6e8"; ctx.font = "800 " + (portraitStage() ? phoneCss(16) : 18) + "px Nunito, sans-serif";
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
    if (boatChipLegal()) {
      const eb = actionBtnBox();
      card(eb.x, eb.y, eb.w, eb.h, "rgba(40, 160, 180, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = (portraitStage() ? "800 " + phoneCss(16) + "px" : (eb.h > 70 ? "800 28px" : "700 16px")) + " Fredoka, sans-serif";
      ctx.textAlign = "center";
      // loop 134 one BOAT cue — the goal ribbon already teaches "Press
      // SPACE to start an expedition ($35)", so this action board is just
      // the labelled button (Expedition $35 / BOAT $35), not a second
      // SPACE sentence — matching the DIVE / SURFACE boards.
      ctx.fillText(thumbCopy() ? "BOAT $35" : "Expedition $35", eb.x + eb.w / 2, eb.y + eb.h / 2 + 8);
      btn("boat", eb.x, eb.y, eb.w, eb.h);
    } else if (diveChipLegal()) {
      const db = actionBtnBox();
      const heading = diveWalkQueued();
      const stain = heading ? (0.08 + 0.12 * (0.5 + 0.5 * Math.sin(state.time * 8))) : 0.18;
      const diveFont = portraitStage() ? phoneCss(18) : (db.h > 70 ? 34 : 16);
      // loop 131 one DIVE prompt, opaque pause — the goal ribbon already
      // teaches "Press SPACE or click to DIVE", so this action board is
      // just the button (DIVE), not a second identical sentence. The
      // walk-to-pad cue stays a directional "→ DIVE".
      const diveLbl = diveActionLegal()
        ? "DIVE"
        : (thumbCopy() ? "DIVE" : "→ DIVE");
      drawPierBoardChip(db.x, db.y, db.w, db.h, diveLbl, diveFont, stain);
      btn("dive", db.x, db.y, db.w, db.h);
    }
    if (surfaceActionLegal()) {
      ctx.globalAlpha = bagIsFull() ? 1 : clamp((280 - player.y) / 80, 0.45, 1);
      const sb = actionBtnBox();
      const surfFont = portraitStage() ? phoneCss(16) : (sb.h > 70 ? 34 : 16);
      // loop 131 one DIVE prompt, opaque pause — match DIVE: the board is
      // the button (SURFACE); the goal ribbon carries the SPACE/click hint.
      drawPierBoardChip(sb.x, sb.y, sb.w, sb.h, "SURFACE", surfFont);
      ctx.globalAlpha = 1;
    }
    if (state.scene === "ocean" && bagIsFull()) {
      const by = state.expedition ? 104 : 70;
      const fb = hudBox(W / 2 - 150, by, 300, 32);
      card(fb.x, fb.y, fb.w, fb.h, "rgba(255, 140, 60, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = "700 14px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(thumbCopy() ? "Bag full — tap SURFACE" : "Bag full — SPACE or click!", fb.x + fb.w / 2, fb.y + 22);
    }
    drawSaleTalks();
    for (const hp of hudPops) {
      const a = clamp(hp.life / Math.max(0.2, hp.max * 0.28), 0, 1);
      ctx.globalAlpha = a;
      ctx.font = hp.small ? "800 13px Fredoka, sans-serif" : "800 16px Fredoka, sans-serif";
      const tw = Math.min(ctx.measureText(hp.text).width + (hp.small ? 20 : 28), hp.small ? 220 : 460);
      let hb = hudBox(hp.x - tw / 2, hp.y - (hp.small ? 12 : 16), tw, hp.small ? 24 : 30);
      if (ribbon && boxesOverlap(hb, ribbon, 8)) {
        hb = hudBox(hb.x, ribbon.y + ribbon.h + 8, hb.w, hb.h);
      }
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
      ctx.globalAlpha = 1;
      drawMoneyReadout(moneyBox);
      ctx.restore();
    }
    drawGuideArrow();
    drawStockWalkCue();
    drawUnlockWalkCue();
    drawDiveForWalkCue();
    drawTillCollectCue();
    drawSurfaceAssist();
    drawBoatEdgeHint();
    drawDockCorner();
    drawPlazaWalkCue();
    if (railBarsReady()) {
      const nearK = shopBarsReady() && nearRect(KIOSK.x, KIOSK.y, KIOSK.w, KIOSK.h, 90);
      if (nearK) {
        ctx.strokeStyle = "rgba(255,226,122," + (0.35 + 0.3 * Math.sin(state.time * 5)) + ")";
        ctx.lineWidth = 3;
        const bar = upgradeBarBox();
        const barW = decorHudReady() && !bar.compact ? 854 : bar.w;
        const hb = hudBox(bar.x, bar.y, barW, bar.h);
        roundRect(hb.x, hb.y, hb.w, hb.h, 12); ctx.stroke();
      }
      drawUpgradeBar();
      if (decorHudReady() && shopBarsReady()) drawDecorBar();
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
      const box = unlockBannerBox() || { x: W / 2 - 260, y: 56, w: Math.min(520, W - 280), h: 44 };
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(8, 16, 24, 0.5)";
      roundRect(box.x, box.y, box.w, box.h, 12); ctx.fill();
      ctx.fillStyle = state.unlockBanner.color;
      ctx.font = "800 " + (portraitStage() ? phoneCss(16) : 22) + "px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(state.unlockBanner.name.toUpperCase() + " UNLOCKED", box.x + box.w / 2, box.y + Math.round(box.h * 0.68));
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
    const titlePx = (size && size.titlePx) || 13;
    const promisePx = (size && size.promisePx) || 11;
    const pricePx = (size && size.pricePx) || 13;
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
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 " + titlePx + "px Fredoka, sans-serif";
    ctx.fillText(title, x + 10, y + Math.max(16, Math.round(h * 0.32)));
    ctx.fillStyle = can ? "rgba(20, 48, 44, 0.95)" : "rgba(28, 24, 20, 0.88)";
    const pillH = Math.max(18, Math.round(h * 0.36));
    const pillY = y + h - pillH - 6;
    roundRect(x + 8, pillY, Math.min(Math.max(96, w - 16), w - 12), pillH, 8); ctx.fill();
    drawUpIcon(icon, x + 20, pillY + pillH / 2);
    ctx.fillStyle = can ? "#ffe27a" : "#e8f4f8";
    ctx.font = "800 " + promisePx + "px Nunito, sans-serif";
    ctx.fillText(promise, x + 32, pillY + Math.round(pillH * 0.68));
    ctx.textAlign = "right";
    ctx.fillStyle = maxed ? "#8fd" : flashing ? "#ff6a5a" : can ? "#ffe27a" : "#c4b8a4";
    ctx.font = flashing ? "800 " + Math.max(pricePx, 16) + "px Nunito, sans-serif" : "800 " + pricePx + "px Nunito, sans-serif";
    ctx.fillText(maxed ? "MAX" : "$" + cost, x + w - 10, y + Math.max(16, Math.round(h * 0.34)));
    if (!maxed) btn(id, x, y, w, h);
  }
  function drawWelcomeBack() {
    const wb = state.welcomeBack;
    if (!wb || wb.life <= 0) return;
    const age = 5.0 - wb.life;
    let alpha = 1;
    if (age < 0.3) alpha = age / 0.3;
    else if (wb.life < 0.6) alpha = wb.life / 0.6;
    const line1 = "Welcome back!";
    const line2 = "Your divers earned $" + wb.amount + " while you were away";
    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.font = "700 14px Nunito, sans-serif";
    const bw = Math.min(Math.max(ctx.measureText(line2).width, 180) + 44, W - 40);
    const bh = 62;
    const bx = W / 2 - bw / 2, by = 92;
    card(bx, by, bw, bh, "rgba(18, 46, 40, 0.95)");
    ctx.strokeStyle = "rgba(255,226,122,0.85)"; ctx.lineWidth = 2;
    roundRect(bx, by, bw, bh, 12); ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffe27a"; ctx.font = "800 19px Fredoka, sans-serif";
    ctx.fillText(line1, W / 2, by + 24);
    ctx.fillStyle = "#dfeff2"; ctx.font = "700 14px Nunito, sans-serif";
    ctx.fillText(line2, W / 2, by + 46);
    ctx.restore();
  }
  function drawUpgradeBar() {
    const bar = upgradeBarBox();
    const size = bar.phoneRail
      ? { w: bar.cw, h: bar.ch, titlePx: phoneCss(14), promisePx: phoneCss(12), pricePx: phoneCss(14) }
      : { w: bar.cw, h: bar.ch };
    card(bar.x, bar.y, bar.w, bar.h, "rgba(12, 28, 36, 0.72)");
    const sMax = state.speedLv >= SPEED_COST.length;
    const bMax = state.bagLv >= BAG_COST.length;
    const cMax = state.catchLv >= CATCH_COST.length;
    const sc = sMax ? 0 : SPEED_COST[state.speedLv];
    const bc = bMax ? 0 : BAG_COST[state.bagLv];
    const cc = cMax ? 0 : CATCH_COST[state.catchLv];
    const aff = firstAffordableUp();
    const speedPromise = "faster walk";
    const dMax = state.diverLv >= DIVER_MAX;
    const dc = dMax ? 0 : DIVER_COST[state.diverLv];
    const diverTitle = state.diverLv <= 0 ? "Diver" : (dMax ? "Divers  " + state.diverLv : "Diver  Lv " + (state.diverLv + 1));
    const slots = [
      ["up-speed", "Speed  Lv " + (state.speedLv + 1), speedPromise, "speed", sc, sMax, !sMax && state.money >= sc, aff && aff.id === "speed"],
      ["up-bag", "Bag  " + bagMax() + "/20", "bigger bag", "bag", bc, bMax, !bMax && state.money >= bc, aff && aff.id === "bag"],
      ["up-catch", "Catch  Lv " + (state.catchLv + 1), "quicker scoop", "catch", cc, cMax, !cMax && state.money >= cc, aff && aff.id === "catch"],
      ["up-cashier", "Cashier", "auto till", "cashier", CASHIER_COST, state.hiredCashier, !state.hiredCashier && state.money >= CASHIER_COST, aff && aff.id === "cashier"],
      ["up-diver", diverTitle, "auto stock", "cashier", dc, dMax, !dMax && state.money >= dc, aff && aff.id === "diver"],
    ];
    for (let i = 0; i < slots.length; i++) {
      const col = bar.stacked ? 0 : (bar.compact ? (i % 2) : i);
      const row = bar.stacked ? i : (bar.compact ? ((i / 2) | 0) : 0);
      const x = bar.x + (bar.stacked ? 2 : 8) + col * (size.w + 8);
      const y = bar.y + (bar.stacked ? 4 : 8) + row * (size.h + 8);
      const label = bar.phoneRail
        ? (upgradeArm.id === slots[i][0] && upgradeArm.t > 0 ? "Tap again" : slots[i][1].split("  ")[0])
        : slots[i][1];
      upCard(slots[i][0], x, y, label, slots[i][2], slots[i][3], slots[i][4], slots[i][5], slots[i][6], slots[i][7] || (upgradeArm.id === slots[i][0] && upgradeArm.t > 0), size);
    }
  }
  function drawDecorBar() {
    const bar = upgradeBarBox();
    const chipW = bar.phoneRail ? bar.cw : (compactHud() ? thumbCanvas(72, 100, 140) : 118);
    const chipH = bar.phoneRail ? cssToStage(36, 48, 70) : (compactHud() ? thumbCanvas(48, 56, 80) : 64);
    const chip = bar.phoneRail
      ? hudBox(bar.x, bar.y + bar.h + 8, chipW, chipH)
      : hudBox(bar.x + bar.w + 8, bar.y + bar.h - chipH, chipW, chipH);
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
  function panelBtn(id, x, y, w, h, label, accent, scale, fontPx) {
    const s = scale || 1;
    const fs = fontPx || Math.max(18, Math.round(h * 0.38));
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(s, s);
    ctx.translate(-(x + w / 2), -(y + h / 2));
    ctx.fillStyle = accent || "#2a9d8f";
    roundRect(x, y, w, h, Math.min(18, Math.round(h * 0.22))); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "700 " + fs + "px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h / 2 + Math.round(fs * 0.34));
    ctx.restore();
    btn(id, x, y, w, h);
  }
  // C97 — DIVE / SURFACE HUD chips share the C96 title-board paint
  // (clip drawPierBoards + #e8c04a gold stroke). Paint only — hitboxes
  // stay on the caller so C82 visualViewport / C84 actionChipInset do
  // not move. Title Continue / Play / New Game stay titleBoardBtn.
  function drawPierBoardChip(x, y, w, h, label, fontPx, stain) {
    const fs = fontPx || Math.max(16, Math.round(h * 0.38));
    const r = Math.min(14, Math.round(h * 0.22));
    const inset = Math.max(4, Math.round(Math.min(w, h) * 0.10));
    ctx.save();
    roundRect(x, y, w, h, r); ctx.clip();
    drawPierBoards(x, y, w, h, { plank: Math.max(10, Math.round(h * 0.28)), seg: 78 });
    ctx.fillStyle = "rgba(40, 20, 8, " + (stain != null ? stain : 0.18) + ")";
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.strokeStyle = "#e8c04a"; ctx.lineWidth = 3;
    roundRect(x + inset, y + Math.max(3, inset - 1), w - inset * 2, h - Math.max(6, inset * 2 - 2), Math.max(6, r - 2));
    ctx.stroke();
    ctx.strokeStyle = "rgba(90, 48, 16, 0.55)"; ctx.lineWidth = 1.4;
    roundRect(x, y, w, h, r); ctx.stroke();
    ctx.fillStyle = "#fff6e8";
    ctx.font = "700 " + fs + "px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h / 2 + Math.round(fs * 0.34));
  }
  // C96 — title action boards only. Clip a drawPierBoards plank field
  // into a rounded rect and gold-stroke it like the Aqua Bay Pier Mart
  // header. Pause / help / mute / reset / book-close stay flat panelBtn
  // pills. Continue / Play keep the pulse; New Game is a quieter stain.
  function titleBoardBtn(id, x, y, w, h, label, scale, fontPx, quiet) {
    const s = scale || 1;
    const fs = fontPx || Math.max(18, Math.round(h * 0.38));
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(s, s);
    ctx.translate(-(x + w / 2), -(y + h / 2));
    const r = Math.min(14, Math.round(h * 0.22));
    const inset = Math.max(4, Math.round(Math.min(w, h) * 0.10));
    ctx.save();
    roundRect(x, y, w, h, r); ctx.clip();
    drawPierBoards(x, y, w, h, { plank: Math.max(10, Math.round(h * 0.28)), seg: 78 });
    ctx.fillStyle = quiet ? "rgba(40, 20, 8, 0.40)" : "rgba(40, 20, 8, 0.18)";
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.strokeStyle = "#e8c04a"; ctx.lineWidth = quiet ? 2.4 : 3;
    roundRect(x + inset, y + Math.max(3, inset - 1), w - inset * 2, h - Math.max(6, inset * 2 - 2), Math.max(6, r - 2));
    ctx.stroke();
    ctx.strokeStyle = "rgba(90, 48, 16, 0.55)"; ctx.lineWidth = 1.4;
    roundRect(x, y, w, h, r); ctx.stroke();
    ctx.fillStyle = quiet ? "#efe0c4" : "#fff6e8";
    ctx.font = "700 " + fs + "px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + w / 2, y + h / 2 + Math.round(fs * 0.34));
    ctx.restore();
    btn(id, x, y, w, h);
  }
  // C95 — painted pier / reef / lagoon so picker portraits sit in a
  // scene, not a flat square sticker. Original canvas paint only.
  function drawPickerBackdrop(id, x, y, w, h) {
    ctx.save();
    roundRect(x, y, w, h, 12); ctx.clip();
    if (id === "skip") {
      // C95 — painted pier: noon sky, clouds, shed, boards, pilings.
      const sky = ctx.createLinearGradient(x, y, x, y + h);
      sky.addColorStop(0, "#8ec8f0");
      sky.addColorStop(0.38, "#6ab4dc");
      sky.addColorStop(0.58, "#4a9cc4");
      sky.addColorStop(0.72, "#3a8aaa");
      sky.addColorStop(1, "#c89a58");
      ctx.fillStyle = sky;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "rgba(255, 246, 232, 0.78)";
      ctx.beginPath(); ctx.ellipse(x + w * 0.22, y + h * 0.16, w * 0.18, h * 0.05, -0.08, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + w * 0.34, y + h * 0.14, w * 0.14, h * 0.045, 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + w * 0.78, y + h * 0.20, w * 0.16, h * 0.04, 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d8784a";
      ctx.beginPath();
      ctx.moveTo(x + w * 0.62, y + h * 0.38);
      ctx.lineTo(x + w * 0.78, y + h * 0.28);
      ctx.lineTo(x + w * 0.94, y + h * 0.38);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#e8c070";
      ctx.fillRect(x + w * 0.66, y + h * 0.38, w * 0.24, h * 0.16);
      ctx.fillStyle = "#6a3a18";
      ctx.fillRect(x + w * 0.74, y + h * 0.44, w * 0.06, h * 0.10);
      ctx.fillStyle = "rgba(46, 140, 168, 0.55)";
      ctx.fillRect(x, y + h * 0.58, w, h * 0.16);
      const deckY = y + h * 0.62;
      const deckH = h * 0.22;
      drawPierBoards(x - 2, deckY, w + 4, deckH, { plank: Math.max(8, Math.round(h * 0.055)) });
      ctx.fillStyle = "#5a3214";
      ctx.fillRect(x + w * 0.12, y + h * 0.58, w * 0.055, h * 0.28);
      ctx.fillRect(x + w * 0.82, y + h * 0.58, w * 0.055, h * 0.28);
      ctx.fillStyle = "#8a5a30";
      ctx.beginPath(); ctx.ellipse(x + w * 0.147, y + h * 0.58, w * 0.038, h * 0.016, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + w * 0.847, y + h * 0.58, w * 0.038, h * 0.016, 0, 0, Math.PI * 2); ctx.fill();
    } else if (id === "reef") {
      // C95 — painted reef: sky, turquoise shallows, coral heads, sand.
      const sky = ctx.createLinearGradient(x, y, x, y + h);
      sky.addColorStop(0, "#7ec8e8");
      sky.addColorStop(0.32, "#4aa8c4");
      sky.addColorStop(0.48, "#2a8aaa");
      sky.addColorStop(0.72, "#1e7a86");
      sky.addColorStop(1, "#d4a070");
      ctx.fillStyle = sky;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "rgba(255, 246, 232, 0.55)";
      ctx.beginPath(); ctx.ellipse(x + w * 0.70, y + h * 0.14, w * 0.16, h * 0.04, 0.08, 0, Math.PI * 2); ctx.fill();
      const water = ctx.createLinearGradient(x, y + h * 0.36, x, y + h);
      water.addColorStop(0, "rgba(90, 210, 210, 0.55)");
      water.addColorStop(0.35, "rgba(30, 150, 160, 0.42)");
      water.addColorStop(1, "rgba(20, 90, 100, 0.20)");
      ctx.fillStyle = water;
      ctx.fillRect(x, y + h * 0.36, w, h * 0.64);
      ctx.strokeStyle = "rgba(210, 250, 255, 0.45)";
      ctx.lineWidth = Math.max(1.2, h * 0.012);
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.38);
      ctx.quadraticCurveTo(x + w * 0.35, y + h * 0.34, x + w * 0.7, y + h * 0.39);
      ctx.quadraticCurveTo(x + w * 0.88, y + h * 0.42, x + w, y + h * 0.37);
      ctx.stroke();
      ctx.fillStyle = "#e8c890";
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.86);
      ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.78, x + w, y + h * 0.88);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath(); ctx.fill();
      const corals = [
        [0.16, 0.78, 0.10, 0.14, "#e8786a"],
        [0.30, 0.82, 0.08, 0.10, "#f0a05a"],
        [0.78, 0.76, 0.11, 0.16, "#c86bde"],
        [0.62, 0.80, 0.07, 0.11, "#ffe14a"],
      ];
      for (let c = 0; c < corals.length; c++) {
        const [fx, fy, rw, rh, col] = corals[c];
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(x + w * fx, y + h * fy, w * rw, h * rh, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255, 246, 220, 0.28)";
        ctx.beginPath(); ctx.ellipse(x + w * fx - w * rw * 0.25, y + h * fy - h * rh * 0.2, w * rw * 0.45, h * rh * 0.4, -0.3, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      // C95 — painted lagoon: warm sun, calm water, sandy spit.
      const sky = ctx.createLinearGradient(x, y, x, y + h);
      sky.addColorStop(0, "#f2c878");
      sky.addColorStop(0.28, "#f0b060");
      sky.addColorStop(0.50, "#d08858");
      sky.addColorStop(0.68, "#4aa8b0");
      sky.addColorStop(1, "#b07a42");
      ctx.fillStyle = sky;
      ctx.fillRect(x, y, w, h);
      const sx = x + w * 0.78, sy = y + h * 0.18, sr = Math.min(w, h) * 0.12;
      const halo = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 3.2);
      halo.addColorStop(0, "rgba(255, 230, 150, 0.90)");
      halo.addColorStop(0.35, "rgba(255, 180, 90, 0.28)");
      halo.addColorStop(1, "rgba(255, 160, 70, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(sx, sy, sr * 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffe2a8";
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      const lagoon = ctx.createLinearGradient(x, y + h * 0.40, x, y + h * 0.82);
      lagoon.addColorStop(0, "#7ed4c8");
      lagoon.addColorStop(0.45, "#3a9aaa");
      lagoon.addColorStop(1, "#2a6a78");
      ctx.fillStyle = lagoon;
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.48);
      ctx.quadraticCurveTo(x + w * 0.35, y + h * 0.40, x + w * 0.70, y + h * 0.46);
      ctx.quadraticCurveTo(x + w * 0.90, y + h * 0.50, x + w, y + h * 0.44);
      ctx.lineTo(x + w, y + h * 0.82);
      ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.88, x, y + h * 0.80);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#e8c890";
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.78);
      ctx.quadraticCurveTo(x + w * 0.45, y + h * 0.70, x + w, y + h * 0.84);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#3a8a44";
      ctx.beginPath();
      ctx.moveTo(x + w * 0.16, y + h * 0.72);
      ctx.quadraticCurveTo(x + w * 0.08, y + h * 0.50, x + w * 0.20, y + h * 0.36);
      ctx.quadraticCurveTo(x + w * 0.28, y + h * 0.52, x + w * 0.22, y + h * 0.72);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#2a6a34";
      ctx.fillRect(x + w * 0.168, y + h * 0.70, w * 0.035, h * 0.10);
    }
    ctx.restore();
  }
  function pickerLabelLayout(cardH, namePx, blurbPx) {
    // C95 — a few CSS px above the card bottom, not flush to the border.
    const labelInset = portraitStage() ? phoneCss(8) : 10;
    const platePadY = portraitStage() ? phoneCss(4) : 5;
    const nameToBlurb = portraitStage() ? Math.max(phoneCss(2), Math.round(namePx * 0.22)) : 4;
    const plateH = platePadY + namePx + nameToBlurb + blurbPx + platePadY;
    const plateY = cardH - labelInset - plateH;
    const nameY = plateY + platePadY + namePx;
    const blurbY = plateY + plateH - platePadY;
    return { labelInset, platePadY, nameToBlurb, plateH, plateY, nameY, blurbY };
  }
  function drawSkinPicker(cx, cy, cardW, cardH, gap, fonts) {
    const fnt = fonts || {};
    const namePx = fnt.nameFont || 16;
    const blurbPx = fnt.blurbFont || 11;
    const whoPx = fnt.whoFont || 14;
    let whoY = fnt.whoY != null ? fnt.whoY : (cy - 20);
    if (whoY > cy - 8) whoY = cy - Math.max(16, (fnt.whoFont || 14) + 6);
    const total = cardW * 3 + gap * 2;
    let x = cx - total / 2;
    const chosen = normalizeSkin(state.skin);
    const labels = pickerLabelLayout(cardH, namePx, blurbPx);
    // loop 132 title Who's diving readable — a soft dark shadow so the
    // header stays legible over the bright animated water / sky, matching
    // the contrast the name plates below already get.
    ctx.save();
    ctx.shadowColor = "rgba(4, 12, 18, 0.85)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = "#eaf7fb";
    ctx.font = "700 " + whoPx + "px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Who's diving?", cx, whoY);
    ctx.restore();
    for (let i = 0; i < SKIN_IDS.length; i++) {
      const id = SKIN_IDS[i];
      const meta = SKIN_META[id];
      const selected = chosen === id;
      card(x, cy, cardW, cardH, selected ? "rgba(28, 58, 52, 0.94)" : "rgba(12, 28, 36, 0.78)");
      drawPickerBackdrop(id, x, cy, cardW, cardH);
      if (selected) {
        ctx.strokeStyle = "rgba(255,226,122," + (0.55 + 0.3 * Math.sin(state.time * 5)) + ")";
        ctx.lineWidth = 3;
        roundRect(x, cy, cardW, cardH, 12); ctx.stroke();
      }
      const charY = Math.min(cy + cardH * 0.62, cy + labels.plateY - 2);
      drawPlayer(x + cardW / 2, charY, {
        skin: id, vx: 0, vy: 0, facing: 0.08,
        walkPhase: 0, lean: 0.05, bob: Math.sin(state.time * 1.5 + i) * 0.6,
        faceS: 1, drawScale: id === "dino"
          ? (cardH > 240 ? 2.55 : 1.82)
          : (cardH > 240 ? 2.35 : 1.65),
        paintOnly: id === "dino",

      });
      const sidePad = portraitStage() ? phoneCss(6) : 6;
      const plateX = x + sidePad;
      const plateW = cardW - sidePad * 2;
      ctx.fillStyle = "rgba(12, 22, 30, 0.88)";
      roundRect(plateX, cy + labels.plateY, plateW, labels.plateH, 8); ctx.fill();
      ctx.fillStyle = "#fff6e8";
      ctx.font = "800 " + namePx + "px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(meta.name, x + cardW / 2, cy + labels.nameY);
      ctx.fillStyle = selected ? "#ffe27a" : "#9ec8d0";
      ctx.font = "700 " + blurbPx + "px Nunito, sans-serif";
      ctx.fillText(meta.blurb, x + cardW / 2, cy + labels.blurbY);
      btn("skin-" + id, x, cy, cardW, cardH);
      x += cardW + gap;
    }
  }
  function drawTitle() {
    ensurePaint();
    const waterY = titleWaterY();
    const titleDry = [{ x: -8, y: H - 64, w: W + 16, h: 52 }];
    if (portraitStage() && H > DESKTOP_H + 20) {
      paintDockHarborSky(0, 0, W, waterY + 4);
    } else if (ATLAS.sky && ART.ready) {
      blitTile("sky", 0, -20, W, 200);
    }
    drawTownSkyline(0, waterY, W, waterY + 8, false);
    drawBayWater(-20, waterY - 10, W + 40, H - waterY + 28, state.time, false, titleDry);
    ctx.save();
    clipOutDecks(titleDry);
    const washTop = portraitStage() ? waterY : H * 0.55;
    const wash = ctx.createLinearGradient(0, washTop, 0, H);
    wash.addColorStop(0, "rgba(8, 40, 56, 0)");
    wash.addColorStop(1, "rgba(8, 30, 42, 0.28)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, washTop, W, H - washTop);
    drawFoamBand(-10, H - 78, W + 20, state.time);
    ctx.restore();
    drawPierBoards(-8, H - 64, W + 16, 72, { plank: 30, wetY: H - 8 });
    const titlePosts = [[78, 0.78, 21], [268, 1.36, 22], [1012, 0.88, 23], [1218, 1.28, 24]];
    for (const [px, sc, id] of titlePosts) drawPierPost(px + 7, H - 52, sc, id);
    ctx.save();
    clipOutDecks(titleDry);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = "rgba(255,236,180," + (0.045 + 0.025 * Math.sin(state.time + i)) + ")";
      ctx.beginPath();
      const x = 90 + i * 230;
      ctx.moveTo(x, 0); ctx.lineTo(x + 56, 0); ctx.lineTo(x + 170, H); ctx.lineTo(x - 24, H); ctx.fill();
    }
    ctx.restore();
    const fy = portraitStage() ? waterY + 28 : 0;
    const tf = [
      { s: 0, x: 200, y: fy + (portraitStage() ? 40 : 400), a: 0.35, ax: 42, ay: 12, sc: 1.7 },
      { s: 1, x: 1060, y: fy + (portraitStage() ? 90 : 490), a: 0.28, ax: 38, ay: 11, sc: 1.6 },
      { s: 2, x: 380, y: fy + (portraitStage() ? 130 : 560), a: 0.24, ax: 48, ay: 13, sc: 1.55 },
      { s: 3, x: 940, y: fy + (portraitStage() ? 20 : 340), a: 0.22, ax: 40, ay: 10, sc: 1.65 },
      { s: 4, x: 640, y: fy + (portraitStage() ? 160 : 610), a: 0.18, ax: 32, ay: 8, sc: 1.8 },
      { s: 5, x: 820, y: fy + (portraitStage() ? 70 : 430), a: 0.26, ax: 22, ay: 16, sc: 1.45 },
      { s: 11, x: 1180, y: fy + (portraitStage() ? 50 : 380), a: 0.16, ax: 50, ay: 10, sc: 1.35 },
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
    const lay = titleMenuLayout();
    menuYShift = lay.shift || menuOriginY();
    ctx.save();
    ctx.translate(0, menuYShift);
    const tx = lay.titleX, ty = lay.titleY, tw = lay.titleW, th = lay.titleH;
    card(tx, ty, tw, th, "rgba(12, 28, 36, 0.78)");
    ctx.save();
    roundRect(tx, ty, tw, th, 12); ctx.clip();
    const boardX = tx + tw * 0.08, boardW = tw * 0.84;
    // C94 — pier board sits behind the two stacked title lines.
    const boardY = lay.portrait ? ty + Math.round(th * 0.06) : ty + th * 0.10;
    const boardBot = lay.portrait && lay.subBase != null
      ? Math.min(ty + th - 8, lay.subBase + Math.round((lay.subFont || 16) * 0.28) + 10)
      : ty + th * 0.56;
    const boardH = Math.max(24, boardBot - boardY);
    ctx.save();
    roundRect(boardX, boardY, boardW, boardH, 10); ctx.clip();
    drawPierBoards(boardX, boardY, boardW, boardH, { plank: 16, seg: 78 });
    ctx.fillStyle = "rgba(40, 20, 8, 0.18)";
    ctx.fillRect(boardX, boardY, boardW, boardH);
    ctx.restore();
    ctx.strokeStyle = "#e8c04a"; ctx.lineWidth = 3;
    roundRect(boardX + 6, boardY + 5, boardW - 12, boardH - 10, 8); ctx.stroke();
    ctx.strokeStyle = "rgba(90, 48, 16, 0.55)"; ctx.lineWidth = 1.4;
    roundRect(boardX, boardY, boardW, boardH, 10); ctx.stroke();
    const titleTextY = lay.titleBase != null ? lay.titleBase : ty + th * 0.30;
    const subTextY = lay.subBase != null ? lay.subBase : ty + th * 0.46;
    const tagTextY = lay.tagY != null ? lay.tagY : ty + th * 0.74;
    const fishY = lay.portrait ? (titleTextY + subTextY) * 0.5 : ty + th * 0.32;
    drawFishBody(SPECIES[0], tx + tw * 0.16, fishY, 0.08, lay.portrait ? 1.85 : 1.35, state.time);
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 " + lay.titleFont + "px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Aqua Bay Pier Mart", W / 2 + (lay.portrait ? 28 : 18), titleTextY);
    ctx.fillStyle = "#ffe27a"; ctx.font = "700 " + lay.subFont + "px Nunito, sans-serif";
    ctx.fillText("Dive. Stock. Sell.", W / 2 + (lay.portrait ? 28 : 18), subTextY);
    ctx.fillStyle = "#9ef0ff"; ctx.font = "700 " + lay.tagFont + "px Nunito, sans-serif";
    ctx.fillText("A sunny pier aquarium of your own", W / 2, tagTextY);
    ctx.fillStyle = "rgba(255, 226, 122, 0.92)";
    ctx.font = "700 " + lay.stampFont + "px Nunito, sans-serif";
    ctx.fillText("Aqua Bay · v1.0", W / 2, lay.stampY);
    ctx.restore();
    drawSkinPicker(W / 2, lay.pickerY, lay.cardW, lay.cardH, lay.cardGap, {
      nameFont: lay.nameFont, blurbFont: lay.blurbFont, whoFont: lay.whoFont, whoY: lay.whoY,
    });
    const pulse = 1 + Math.sin(state.time * 3) * 0.035;
    if (state.hasSave) {
      titleBoardBtn("continue", W / 2 - lay.continueW / 2, lay.continueY, lay.continueW, lay.continueH, "Continue", pulse, lay.btnFont);
      const nSp = state.unlocked.filter(Boolean).length;
      ctx.fillStyle = "#ffe27a"; ctx.font = "700 " + Math.max(14, lay.stampFont) + "px Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("$" + (state.money | 0) + "  ·  " + nSp + " species unlocked", W / 2, lay.captionY);
      titleBoardBtn("play", W / 2 - lay.newW / 2, lay.newY, lay.newW, lay.newH, "New Game", 1, lay.btnFont, true);
    } else {
      titleBoardBtn("play", W / 2 - lay.continueW / 2, lay.playY, lay.continueW, lay.playH, "Play", pulse, lay.btnFont);
    }
    const impY = state.hasSave ? lay.newY + lay.newH + 14 : lay.playY + lay.playH + 14;
    const impH = Math.max(36, Math.round((lay.newH || 48) * 0.72));
    const impW = Math.min(lay.continueW || 300, 240);
    titleBoardBtn("import", W / 2 - impW / 2, impY, impW, impH, "Import save", 1, Math.max(14, (lay.btnFont || 18) - 2), true);
    ctx.restore();
    menuYShift = 0;
  }
  function drawPause() {
    // loop 131 one DIVE prompt, opaque pause — a heavier scrim so the
    // upgrade rail / collect chip / price cards do not read through the
    // paused menu. The pause card draws its own opaque panel on top.
    ctx.fillStyle = "rgba(6, 16, 22, 0.86)"; ctx.fillRect(0, 0, W, H);
    const tall = portraitStage() && H > DESKTOP_H + 20;
    const pad = tall ? Math.round(H * 0.028) : 56;
    const cardW = tall ? Math.min(W - 48, 1040) : 500;
    const cardH = tall ? H - pad * 2 : 608;
    const cardX = W / 2 - cardW / 2;
    const cardY = pad;
    const btnW = tall ? Math.min(cardW - 80, 640) : 280;
    const btnH = tall ? Math.max(88, Math.round(H * 0.055)) : 48;
    const btnFont = tall ? Math.max(28, Math.round(H * 0.02)) : 18;
    const titlePx = tall ? Math.max(44, Math.round(H * 0.032)) : 36;
    const bodyPx = tall ? Math.max(18, Math.round(H * 0.013)) : 15;
    menuYShift = tall ? 0 : menuOriginY();
    ctx.save();
    ctx.translate(0, menuYShift);
    if (state.mode === "help") {
      card(cardX, cardY, cardW, cardH, "rgba(16, 32, 42, 0.94)");
      ctx.fillStyle = "#fff6e8"; ctx.font = "700 " + (tall ? titlePx : 32) + "px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("How to play", W / 2, cardY + (tall ? Math.round(H * 0.05) : 52));
      ctx.fillStyle = "#e8f4f8"; ctx.font = "600 " + bodyPx + "px Nunito, sans-serif"; ctx.textAlign = "left";
      const lines = [
        "Tap the deck to walk  ·  hold to steer  ·  WASD / Arrows on desktop",
        "Tap DIVE at the pad (or the DIVE chip) — no keyboard needed",
        "Tap SURFACE or swim to the waterline — return to the dock",
        "Hold on a fish — the cone locks on  ·  tap a fish to scoop  ·  first catches are forgiving",
        "Tap a tank, till, or unlock card — act now, or walk there then act",
        "On a phone, tap BOOK (catalog chip) for species and upgrades — tap twice to buy",
        "Walk into a matching tank — stock  ·  bag clears the instant it lands",
        "→ TILL chip or stand in the till glow to collect  ·  scoop coins on the path",
        "Hire a cashier — they collect while you dive",
        thumbCopy() ? "Tap at the boat — $35 timed expedition" : "SPACE at the boat — $35 timed expedition",
        "Every 3rd expedition is a night dive (rares)",
        "Deeper stacked zones never end — more tanks next to the aisle after Turtle",
        "Decor chip — lights, sign, fountain",
        "Mute button — sound on/off",
        "After the first session, the west chalkboard names today's regular (2×)",
        "Pause → Export save — keep your shop if the browser clears",
        "Esc — pause / resume  ·  pick Reef, Skip, or Dino on title",
      ];
      const lineY = cardY + (tall ? Math.round(H * 0.08) : 86);
      const lineH = tall ? Math.round((cardH - Math.round(H * 0.16)) / lines.length) : 26;
      lines.forEach((ln, i) => ctx.fillText(ln, cardX + (tall ? 36 : 40), lineY + i * lineH));
      ctx.fillStyle = "#8ab"; ctx.font = "600 " + Math.max(12, bodyPx - 2) + "px Nunito, sans-serif"; ctx.textAlign = "center";
      const footY = cardY + cardH - (tall ? btnH + 56 : 90);
      ctx.fillText("Inspired by the aquarium-tycoon genre", W / 2, footY);
      ctx.fillStyle = "#ffe27a"; ctx.font = "700 " + Math.max(13, bodyPx) + "px Nunito, sans-serif";
      ctx.fillText("Aqua Bay · v1.0", W / 2, footY + (tall ? 28 : 20));
      panelBtn("back", W / 2 - btnW / 2, cardY + cardH - 16 - btnH, btnW, btnH, "Back", null, 1, btnFont);
    } else {
      card(cardX, cardY, cardW, cardH, "rgba(16, 32, 42, 0.94)");
      ctx.fillStyle = "#fff6e8"; ctx.font = "700 " + titlePx + "px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Paused", W / 2, cardY + (tall ? Math.round(H * 0.055) : 52));
      ctx.fillStyle = "#c8e8ee"; ctx.font = "600 " + bodyPx + "px Nunito, sans-serif";
      ctx.fillText("A sunny little pier mart of your own.", W / 2, cardY + (tall ? Math.round(H * 0.085) : 86));
      let y = cardY + (tall ? Math.round(H * 0.11) : 108);
      const gap = tall ? Math.round(H * 0.016) : 10;
      panelBtn("resume", W / 2 - btnW / 2, y, btnW, btnH, "Resume", null, 1, btnFont);
      y += btnH + gap;
      panelBtn("help", W / 2 - btnW / 2, y, btnW, Math.max(44, btnH - 4), "Help", "#2a7d8a", 1, btnFont);
      y += Math.max(44, btnH - 4) + gap;
      panelBtn("mute", W / 2 - btnW / 2, y, btnW, Math.max(44, btnH - 4), state.muted ? "Sound Off" : "Sound On", "#3d6f7a", 1, btnFont);
      y += Math.max(44, btnH - 4) + (tall ? Math.round(H * 0.03) : 36);
      const pLay = titleMenuLayout();
      const pCardW = tall ? Math.min(pLay.cardW, 280) : 140;
      const pCardH = tall ? Math.min(pLay.cardH, Math.round(H * 0.18)) : 100;
      drawSkinPicker(W / 2, y, pCardW, pCardH, tall ? 20 : 12, {
        nameFont: tall ? pLay.nameFont : 16, blurbFont: tall ? pLay.blurbFont : 11,
        whoFont: tall ? pLay.whoFont : 14, whoY: y - (tall ? 28 : 16),
      });
      y += pCardH + (tall ? Math.round(H * 0.02) : 12);
      const saveH = tall ? Math.max(52, btnH - 8) : 40;
      const half = (btnW - 10) / 2;
      const saveFont = tall ? Math.max(20, btnFont - 4) : 16;
      panelBtn("export", W / 2 - btnW / 2, y, half, saveH, "Export save", "#2a7d8a", 1, saveFont);
      panelBtn("import", W / 2 - btnW / 2 + half + 10, y, half, saveH, "Import save", "#3d6f7a", 1, saveFont);
      y += saveH + (tall ? 10 : 8);
      const resetY = tall ? cardY + cardH - 16 - btnH : y;
      panelBtn("reset", W / 2 - btnW / 2, resetY, btnW, tall ? btnH : 44, "New Game", "#a84a3a", 1, btnFont);
      ctx.fillStyle = "#8ab"; ctx.font = "600 " + Math.max(12, bodyPx - 2) + "px Nunito, sans-serif";
      const footY = tall ? resetY - Math.round(H * 0.042) : resetY + 52;
      ctx.fillText("Save stays on this device. Export to keep it.", W / 2, footY);
      ctx.fillText(tall ? "Tap Resume" : "Esc to resume", W / 2, footY + (tall ? 26 : 18));
      ctx.fillStyle = "#ffe27a"; ctx.font = "700 " + Math.max(14, bodyPx) + "px Nunito, sans-serif";
      ctx.fillText("Aqua Bay · v1.0", W / 2, footY + (tall ? 52 : 36));
    }
    ctx.restore();
    menuYShift = 0;
  }

  function baitShackScreenBox() {
    if (state.scene !== "shop") return null;
    const p = worldToScreen(BAIT_HUT.x - 52, BAIT_HUT.y - 8);
    const z = Math.max(0.001, cam.z);
    return { x: p.x, y: p.y, w: 112 * z, h: 100 * z };
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
      if (!tankLive(i) || speciesUnlocked(i)) continue;
      const b = tankScreenBox(i);
      if (b) out.push(b);
    }
    return out;
  }
  function phoneShopBtnBox() {
    const { pauseB, muteB, topBtn } = topCtrlBoxes();
    const bw = Math.max(topBtn || phoneCss(40), phoneCss(72));
    const bh = phoneCss(40);
    const x = W - 12 - bw;
    const y = Math.max(pauseB.y + pauseB.h, muteB.y + muteB.h) + 8;
    return hudBox(x, y, bw, bh);
  }
  function phoneShopPanelBox() {
    const btn = phoneShopBtnBox();
    const w = phoneCss(118);
    const x = W - 10 - w;
    const y = btn.y + btn.h + 8;
    const hug = railSpeciesIds().length * (phoneCss(52) + 6) + 4 * (phoneCss(56) + 6) + phoneCss(28);
    const maxH = Math.max(phoneCss(180), visibleStageBottom() - y - phoneCss(8));
    const h = clamp(hug, phoneCss(200), maxH);
    return hudBox(x, y, w, h);
  }
  function phoneShopHit(x, y) {
    if (!portraitStage() || !phoneShopOpen) return false;
    const p = phoneShopPanelBox();
    const b = phoneShopBtnBox();
    return (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) ||
      (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
  }
  function catalogChipLabel() {
    if (phoneShopOpen) return "CLOSE";
    // C117 — walk-north already owns the word SHOP (wood ↑ SHOP).
    // C108 only flipped this HUD chip to BOOK while
    // plazaWalkChipLegal() (dock + wood ↑ SHOP). At TAP TO UNLOCK /
    // DIVE FOR bowls and in the ocean hunt the same gold chip
    // reverted to SHOP and sat next to pause. Catalog never says
    // SHOP — BOOK on the dock, at the bowls, and in the hunt.
    // CLOSE while the tray is open stays.
    // loop 117 catalog book not shop.
    return "BOOK";
  }
  function catalogChipAria() {
    if (phoneShopOpen) return "Close the species catalog";
    return "Open the species catalog";
  }
  function drawPhoneShopBtn() {
    const b = phoneShopBtnBox();
    // C108 / C117 — keep the dark / wood HUD chip (not a cyan pill).
    // The label is BOOK so two chips never both say SHOP. CLOSE
    // while the tray is open stays.
    pierChip(b.x, b.y, b.w, b.h, phoneShopOpen ? "rgba(28, 58, 52, 0.94)" : "rgba(20, 36, 44, 0.9)");
    if (phoneShopOpen) {
      ctx.strokeStyle = "rgba(255,226,122,0.7)";
      ctx.lineWidth = 2;
      roundRect(b.x, b.y, b.w, b.h, 12); ctx.stroke();
    }
    const label = catalogChipLabel();
    const aria = catalogChipAria();
    ctx.fillStyle = "#ffe27a";
    ctx.font = "800 " + phoneCss(16) + "px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2 + Math.round(b.h * 0.16));
    btn("shop-toggle", b.x, b.y, b.w, b.h, { label: label, aria: aria });
  }
  function drawPhoneShopPanel() {
    const p = phoneShopPanelBox();
    card(p.x, p.y, p.w, p.h, "rgba(10, 22, 30, 0.9)");
    ctx.strokeStyle = "rgba(255, 226, 122, 0.22)";
    ctx.lineWidth = 1.4;
    roundRect(p.x, p.y, p.w, p.h, 14); ctx.stroke();
    btn("shop-panel", p.x, p.y, p.w, p.h);
  }
  function speciesStripLayout() {
    const { muteB, pauseB } = topCtrlBoxes();
    if (portraitStage()) {
      const panel = phoneShopPanelBox();
      const cw = Math.max(80, panel.w - 12);
      const ch = phoneCss(52);
      const xCol = panel.x + 6;
      const startY = panel.y + 8;
      const colH = railSpeciesIds().length * (ch + 6);
      return { x: xCol, y: startY, w: cw, h: colH, cw, ch, muteB, pauseB };
    }
    const cw = compactHud() ? thumbCanvas(56, 96, 180) : 86;
    const ch = compactHud() ? thumbCanvas(52, 72, 120) : 64;
    const colH = railSpeciesIds().length * (ch + 6);
    // Stay in the reserved HUD rail under mute/pause. Never slide left
    // onto furniture. C66 hides a chip when it would cover the shack.
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
      const fade = chipAlpha(chip, ribbon, { rail: true });
      if (fade <= 0.02) continue;
      ctx.save();
      ctx.globalAlpha = fade;
      if (hover) {
        ctx.translate(x + cw / 2, y + (ch + 2) / 2);
        ctx.scale(1.07, 1.07);
        ctx.translate(-(x + cw / 2), -(y + (ch + 2) / 2));
      }
      const ink = state.unlocked[i]
        ? (hover ? "rgba(48, 72, 62, 0.92)" : "rgba(40, 58, 50, 0.88)")
        : affordable
          ? "rgba(62, 68, 36, 0.92)"
          : (hover ? "rgba(56, 48, 36, 0.9)" : "rgba(46, 42, 34, 0.86)");
      pierChip(x, y, cw, ch + 2, ink);
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
      ctx.save();
      roundRect(x + 6, y + 4, cw - 12, ch * 0.58, 8); ctx.clip();
      if (state.unlocked[i]) drawFishBody(SPECIES[i], x + cw / 2, y + ch * 0.40, 0, 0.82, state.time + i);
      else drawFishSilhouette(SPECIES[i], x + cw / 2, y + ch * 0.30, 0.78);
      ctx.restore();
      ctx.textAlign = "center";
      const pricePx = portraitStage() ? phoneCss(13) : 13;
      const namePx = portraitStage() ? phoneCss(11) : (compactHud() ? 10 : 11);
      const needPx = portraitStage() ? phoneCss(11) : 11;
      const priceY = y + ch - Math.round(ch * 0.34);
      const nameY = y + ch - Math.round(ch * 0.08);
      if (!state.unlocked[i]) {
        // loop 137 next unlock shows progress — the focused next-unlock
        // card shows "need $X more" without needing a hover, so players
        // can see how close they are to the next tank (QA: the shortfall
        // was hover-only and easy to miss). Once affordable it flips to
        // the gold buy price with the pulse. Other locked cards keep the
        // plain price; hover still bumps a non-focused card's shortfall.
        const showNeed = need > 0 && (i === next || (hover && need > 0));
        const priceLbl = showNeed ? "need $" + need + " more" : "$" + SPECIES[i].unlock;
        ctx.fillStyle = affordable ? "#ffe27a" : showNeed ? "#ffb08a" : "#ffe27a";
        // Fit the shortfall to the card width so a long "need $1400 more"
        // (shown by default now, without the hover scale-up) never clips.
        let priceFont = showNeed ? needPx : pricePx;
        ctx.font = "800 " + priceFont + "px Nunito, sans-serif";
        while (showNeed && priceFont > 8 && ctx.measureText(priceLbl).width > cw - 12) {
          priceFont -= 1;
          ctx.font = "800 " + priceFont + "px Nunito, sans-serif";
        }
        ctx.fillText(priceLbl, x + cw / 2, priceY);
        ctx.fillStyle = affordable ? "#fff6e8" : "#c8e8ee";
        ctx.font = "700 " + namePx + "px Nunito, sans-serif";
        ctx.fillText(SPECIES[i].name, x + cw / 2, nameY);
      } else {
        ctx.fillStyle = hover ? "#ffe27a" : "#e8d080";
        ctx.font = "800 " + pricePx + "px Nunito, sans-serif";
        ctx.fillText("$" + SPECIES[i].price, x + cw / 2, priceY);
        ctx.fillStyle = "#c8e8ee";
        ctx.font = "700 " + namePx + "px Nunito, sans-serif";
        ctx.fillText(SPECIES[i].name, x + cw / 2, nameY);
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
      ctx.filter = "saturate(0.85) brightness(0.94)";
      ctx.globalAlpha = 0.88;
      drawFishBody(sp, W / 2, py + 128, 0.08, 2.55, state.time);
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
    if (state.pendingScene === "shop") return 7.2;
    if (state.scene === "shop" && state.fadeDir) return 7.2;
    return 2.4;
  }
  function pinSurfaceDockCam() {
    // C122 — fade lands on the bay / DIVE pad. Camera stays
    // on the pier (DOCK_CAM_FLOOR), not the tank room.
    // loop 122 surface stays on the dock.
    player.x = 880;
    player.y = state.missionDone ? 1000 : 940;
    player.vx = 0;
    player.vy = 0;
    cam.x = 880;
    cam.y = DOCK_CAM_FLOOR;
    cam.z = 1.02 * stageZoom();
    cam.shopBand = "dock";
    state.camPunch = 0;
    state.camSettle = 0.28;
    state.camEase = 0.28;
  }
  function leadStockAfterSurface() {
    // C122 — after SURFACE, pinSurfaceDockCam lands them on
    // the dock (bay / DIVE pad, y~1000). Stay there a beat.
    // Do not setWalkDest to the glowing tank and do not
    // camEase-taxi north into the bowls. fadeSpeed 7.2 plus
    // that taxi read as a hard cut from the bay into the
    // fish-tank room on a 390 portrait. TODAY still Stock
    // Seahorse. C100 tap-to-stock board / ribbon can cue
    // the walk — the player taps it (or walks) themselves.
    // Still not a walk-buy. Do not auto-stock.
    // loop 122 surface stays on the dock.
    if (!bagHasStockable()) return;
    player.pendingAct = null;
    player.goto = null;
    player.route = null;
    player.vx = 0;
    player.vy = 0;
  }
  function applyFade(dt) {
    if (!state.fadeDir && state.fade <= 0) {
      state.fadeClock = 0;
      return;
    }
    state.fadeClock = (state.fadeClock || 0) + dt;
    if (state.fadeDir) state.fade += state.fadeDir * dt * fadeSpeed();
    // Never sit on a frozen black frame. Surface must show the dock in ~1s.
    if (state.fadeClock > 1.05) {
      if (state.pendingScene === "shop" || (state.scene === "ocean" && state.fadeDir > 0 && state.pendingScene === "shop")) {
        state.fade = 1;
      } else if (state.scene === "shop" && (state.fadeDir < 0 || state.fade > 0)) {
        state.fade = 0;
        state.fadeDir = 0;
        state.pendingScene = null;
      } else if (state.fadeDir > 0 && state.pendingScene) {
        state.fade = 1;
      } else {
        state.fade = 0;
        state.fadeDir = 0;
      }
    }
    if (state.fadeDir > 0 && state.fade >= 1) {
      state.fade = 1;
      if (state.pendingScene === "ocean") {
        state.scene = "ocean";
        if (state.expedition) {
          player.x = LM_WRECK.x; player.y = LM_WRECK.y; player.vx = 0; player.vy = 20;
          state.expeditionTime = EXPEDITION_SECS;
        } else {
          // C112 — DIVE FOR <species> uses oceanEntrySpawn (grove
          // band). A normal DIVE still lands at y=380 shallows.
          const spawn = oceanEntrySpawn();
          player.x = spawn.x; player.y = spawn.y; player.vx = spawn.vx; player.vy = spawn.vy;
          player.facing = 0.22;
        }
        state.diveCatches = 0;
        state.catchVerb = null;
        player.scoopLock = null; player.scoopTap = false; player.catchProg = 0; player.target = null;
        state.escapeBar = null;
        state.diveLock = 1.6;
        state.bagBonus = 1;
        state.divesThisSession = (state.divesThisSession | 0) + 1;
        state.wreckChestReady = true;
        if (!state.unlocked[1] && state.didFirstStock && !state.tangHintDone) {
          state.tangHintLife = Math.max(state.tangHintLife || 0, 4.2);
        }
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
        cam.z = 1.1 * stageZoom();
        state.camPunch = 0;
        state.camSettle = 0.4;
        state.camEase = 0.4;
        if (state.expedition) { seedExpeditionPocket(); seedOceanScenery(); }
        else if (diveForHuntIndex() >= 0) seedDiveForHunt(diveForHuntIndex());
        else seedFrontSchool();
        ensureOceanStock();
      } else if (state.pendingScene === "shop") {
        state.scene = "shop";
        clearDiveForHunt();
        state.surfaceLock = 0.55;
        if (state.expedition) {
          player.x = 1188; player.y = 1000; player.vx = 0; player.vy = -30;
          toast("Expedition complete", "#ffe27a");
          state.expedition = false;
          state.expeditionTime = 0;
          state.nightExpedition = false;
          cam.x = player.x;
          cam.y = DOCK_CAM_FLOOR;
          cam.z = 1.02 * stageZoom();
          cam.shopBand = "dock";
        } else {
          pinSurfaceDockCam();
        }
        state.diveCatches = 0;
        state.surfaceQuiet = 2.2;
        // C122 — stay on the dock a beat. leadStockAfterSurface
        // no longer walks / taxis to the glowing tank. Empty
        // bag also docks. C100 tap-to-stock still walks if
        // they tap it. loop 122 surface stays on the dock.
        if (bagHasStockable()) {
          leadStockAfterSurface();
        } else if (state.registerCash <= 0) {
          seedPathCoins([[880, 860], [880, 1008]], 2);
        }
        maybeBookTease();
        maybeTangRumor();
        state.camPunch = 0;
        state.camSettle = 0.28;
        state.camEase = Math.max(state.camEase || 0, 0.28);
      }
      state.pendingScene = null; state.fadeDir = -1; state.fadeClock = 0;
    }
    if (state.fadeDir < 0 && state.fade <= 0) {
      state.fade = 0; state.fadeDir = 0; state.fadeClock = 0;
    }
  }
  function updateCam(dt) {
    const tz = (state.scene === "ocean"
      ? (state.catchVerb === "dash" ? 1.28 : state.catchVerb === "sit" ? 0.96 : state.catchVerb === "yank" ? 1.22 : 1.12)
      : 1.00) * stageZoom();
    cam.z = lerp(cam.z, tz, 1 - Math.pow(0.001, dt));
    if (state.camPunch > 0) {
      cam.z *= 1 + 0.006 * clamp(state.camPunch / 0.12, 0, 1);
      state.camPunch = Math.max(0, state.camPunch - dt);
    }
    const look = state.scene === "ocean" ? 80 : (player.goto ? 72 : 40);
    const ww = state.scene === "shop" ? shopW() : OCEAN.w;
    const hh = state.scene === "shop" ? SHOP.h : OCEAN.h;
    const vw = viewWidth();
    const vcx = viewCenterX();
    const hw = vcx / cam.z, hhv = (H / 2) / cam.z;
    const minX = hw, maxX = Math.max(hw, ww - hw);
    const shopLim = state.scene === "shop" ? shopCamYLimits() : null;
    const minY = shopLim ? shopLim.minY : hhv;
    const maxY = shopLim ? shopLim.maxY : Math.max(hhv, hh - hhv);
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
      // loop 126 no store-to-shore cut
      // Track the band for SURFACE / pin, but do NOT kick
      // camEase when plaza↔dock. That 0.46s ease WAS the
      // store-to-shore taxi. Camera follows the walker.
      const band = (player.y < 800 || onAisleForCam(player.x, player.y)) ? "plaza" :
        (player.y > 860 ? "dock" : "mid");
      cam.shopBand = band;
      const glowI = glowingStockIndex();
      const z = Math.max(0.7, cam.z);
      const hudClear = Math.max(topHudFloor() + 16, 176);
      const onPlaza = player.y < 720;
      if (!tillFrame && onPlaza && glowI >= 0) {
        const plaza = clamp((640 - player.y) / 280, 0, 1);
        const shelfL = TANK_POS[0].x;
        const shelfR = TANK_POS[4].x + TANK_W;
        const minCam = shelfR - vcx / z + 8 / z;
        const maxCam = shelfL + vcx / z - 8 / z;
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
    const keyed = keys.has("w") || keys.has("a") || keys.has("s") || keys.has("d") ||
      keys.has("arrowup") || keys.has("arrowdown") || keys.has("arrowleft") || keys.has("arrowright");
    const followPow = keyed && state.scene === "shop" ? 0.00008 : (easing ? 0.00065 : 0.0014);
    const follow = 1 - Math.pow(followPow, dt);
    let nx = lerp(cam.x, tx, follow);
    let ny = lerp(cam.y, ty, follow);
    const rightRail = 70;
    const wantRail = shopBarsReady() ? 112 : (state.tutorial === 0 && !state.didMove ? 100 : 28);
    cam.rail = cam.rail == null ? wantRail : lerp(cam.rail, wantRail, 1 - Math.pow(0.05, Math.min(dt, 0.05)));
    const padL = 88, padR = Math.max(rightRail + 48, 88);
    const padT = Math.max(topHudFloor() + 12, 64);
    const act = actionBtnSize();
    const actionUp = (state.scene === "shop" && diveActionLegal()) ||
      (state.scene === "ocean" && (surfaceActionLegal() || bagIsFull()));
    const padB = Math.max(cam.rail + 36, actionUp ? act.h + act.pad + 22 : 0);
    const stageBot = actionFloor();
    let psx = (player.x - nx) * cam.z + vcx;
    let psy = (player.y - ny) * cam.z + H / 2;
    if (psx < padL) nx = player.x - (padL - vcx) / cam.z;
    if (psx > vw - padR) nx = player.x - (vw - padR - vcx) / cam.z;
    if (psy < padT) ny = player.y - (padT - H / 2) / cam.z;
    if (psy > stageBot - padB) ny = player.y - (stageBot - padB - H / 2) / cam.z;
    const step = Math.hypot(nx - cam.x, ny - cam.y);
    const pace = state.scene === "ocean" ? swimSpeed() : walkSpeed();
    const cap = Math.max(pace, keyed && state.scene === "shop" ? pace + 120 : (easing ? pace : pace + 40)) * Math.min(dt, 0.05);
    // loop 125 one shore no water-walk boat tap only
    // loop 126 no store-to-shore cut
    // No dock↔store bandJump and no plaza↔dock camEase taxi.
    // Follow the walker south the same way C125 follows north.
    if (step > cap && step > 0.001) {
      nx = cam.x + (nx - cam.x) * (cap / step);
      ny = cam.y + (ny - cam.y) * (cap / step);
    }
    psx = (player.x - nx) * cam.z + vcx;
    psy = (player.y - ny) * cam.z + H / 2;
    if (psx < padL) nx = player.x - (padL - vcx) / cam.z;
    if (psx > vw - padR) nx = player.x - (vw - padR - vcx) / cam.z;
    if (psy < padT) ny = player.y - (padT - H / 2) / cam.z;
    if (psy > stageBot - padB) ny = player.y - (stageBot - padB - H / 2) / cam.z;
    // loop 125 one shore no water-walk boat tap only
    // loop 126 no store-to-shore cut
    // One continuous shore camera both ways. Follow the
    // player from the bowls down the aisle to the pier the
    // same way C125 follows north. No band snap, no fade,
    // no smash-cut, no camEase taxi to DOCK_CAM_FLOOR.
    // C72/C73 protections stay: eastShopNavyGap / constrainShop
    // still refuse sky / east-empty wood and the skyline walk.
    // Following the player is not a clip hack.
    if (state.scene === "shop" && state.bookOpen == null && (state.boatGlance || 0) <= 0 && !tillFrame) {
      if (player.y > 820 && !onAisleForCam(player.x, player.y) && eastShopNavyGap(player.x, ny)) {
        ny = player.y;
      }
    }
    // East plaza walk: keep the east boards in the playfield so feet
    // and POP do not sit on sky while cam.x is still at the dock.
    if (state.scene === "shop" && player.y < 700 && player.x > 1220 && !tillFrame) {
      const needRight = 1272 + 188 + 24;
      const haveRight = nx + (viewWidth() - 16 - vcx) / Math.max(0.001, cam.z);
      if (haveRight < needRight) nx += needRight - haveRight;
    }
    cam.x = Math.round(clamp(nx, minX, maxX));
    cam.y = Math.round(clamp(ny, minY, maxY));
    if (state.camNudge > 0) {
      const max = state.camNudgeMax || 0.48;
      const u = 1 - state.camNudge / max;
      const kick = Math.sin(u * Math.PI);
      cam.y = Math.round(clamp(cam.y + kick * 2.0, minY, maxY));
      cam.x = Math.round(clamp(cam.x + Math.sin(u * Math.PI * 2) * 0.9, minX, maxX));
      state.camNudge = Math.max(0, state.camNudge - dt);
    }
    keepPlayerInPlayfield();
    keepSwimmersOffRail();
  }
  function keepPlayerInPlayfield() {
    if (state.mode === "title") return;
    const z = Math.max(0.001, cam.z);
    const limit = viewWidth() - 64;
    const sx = (player.x - cam.x) * z + viewCenterX();
    if (sx > limit) {
      player.x = cam.x + (limit - viewCenterX()) / z;
      if (player.vx > 0) player.vx *= 0.2;
    }
  }
  function keepSwimmerOffRail(ent, rad) {
    const z = Math.max(0.001, cam.z);
    const r = (rad == null ? 28 : rad) * Math.max(0.6, z);
    const sx = (ent.x - cam.x) * z + viewCenterX();
    const limit = viewWidth() - r;
    if (sx <= limit) return;
    if (sx > viewWidth() + r + 10) return;
    ent.x = cam.x + (limit - viewCenterX()) / z;
    if (ent.vx > 0) ent.vx = -Math.abs(ent.vx);
  }
  function keepSwimmersOffRail() {
    if (state.mode === "title") return;
    if (state.scene === "ocean") {
      for (const f of oceanFish) {
        if (f.caught) continue;
        keepSwimmerOffRail(f, Math.max(28, (SPECIES[f.s] && SPECIES[f.s].size) || 20));
      }
      for (const s of oceanScenery) {
        if (s.kind === "kelp" || s.kind === "rock") continue;
        keepSwimmerOffRail(s, s.kind === "ray" ? 40 : 20);
      }
      for (const b of bubbles) keepSwimmerOffRail(b, (b.r || 3) + 4);
    } else {
      for (const t of dockTeasers) keepSwimmerOffRail(t, 22);
      for (const sw of state.shopSwimmers) keepSwimmerOffRail(sw, 22);
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
      const fa = worldSpriteAlpha(f.x, f.y, 18);
      if (fa <= 0.04) continue;
      ctx.save();
      ctx.globalAlpha *= fa;
      drawFishBody(SPECIES[0], f.x, f.y, 0.05, 0.95, state.time + f.ph);
      ctx.restore();
    }
    ctx.restore();
  }
  function drawOceanScenery() {
    for (const s of oceanScenery) {
      const sa = worldSpriteAlpha(s.x, s.y, s.kind === "kelp" ? 48 : 32);
      if (sa <= 0.04) continue;
      ctx.save();
      ctx.globalAlpha *= sa;
      if (s.kind === "ray") drawSceneryRay(s);
      else if (s.kind === "jelly") drawSceneryJelly(s);
      else if (s.kind === "kelp") drawKelpPatch(s);
      else if (s.kind === "rock") drawRockProp(s.x, s.y, s.seed || 1, s.sc || 1);
      else drawSceneryMinnow(s);
      ctx.restore();
    }
  }
  function drawKelpPatch(s) {
    const glow = 0.42 + 0.22 * Math.sin(state.time * 3.2 + s.ph);
    const seed = s.seed == null ? 3 : s.seed;
    const sc = s.sc || 1;
    const blades = s.landmark ? 7 : (3 + ((seed * 3) % 5));
    const tints = ["#2f8a5a", "#1f6a48", "#3a9a58", "#166848", "#4aaa62"];
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.scale(sc, sc);
    if (s.landmark) {
      ctx.globalCompositeOperation = "lighter";
      const halo = ctx.createRadialGradient(0, 8, 6, 0, 4, 78);
      halo.addColorStop(0, "rgba(120, 255, 210," + (0.28 + glow * 0.2) + ")");
      halo.addColorStop(0.45, "rgba(70, 210, 180, 0.12)");
      halo.addColorStop(1, "rgba(40, 160, 150, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.ellipse(0, 10, 72, 34, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    const bedA = 0.28 + hash2(seed, 31) * 0.22;
    ctx.fillStyle = hash2(seed, 33) > 0.5
      ? "rgba(18, 36, 22," + (bedA + 0.08) + ")"
      : "rgba(36, 48, 28," + (bedA + 0.1) + ")";
    ctx.beginPath();
    ctx.ellipse(
      (hash2(seed, 35) - 0.5) * 6, 24 + hash2(seed, 37) * 2,
      20 + blades * (1.5 + hash2(seed, 39) * 1.6),
      7 + blades * (0.32 + hash2(seed, 41) * 0.3),
      (hash2(seed, 43) - 0.5) * 0.35,
      0, Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "rgba(8, 16, 14, 0.28)";
    ctx.beginPath();
    ctx.ellipse(2, 26, 14 + blades, 3.4, -0.12, 0, Math.PI * 2);
    ctx.fill();
    for (let p = 0; p < 3; p++) {
      ctx.fillStyle = p % 2 ? "rgba(70, 64, 42, 0.55)" : "rgba(48, 56, 40, 0.5)";
      ctx.beginPath();
      ctx.ellipse(-10 + p * 9 + hash2(seed, 50 + p) * 4, 23 + hash2(seed, 54 + p) * 2, 3.2, 1.8, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < blades; i++) {
      const sway = Math.sin(state.time * (1.3 + hash2(seed, i) * 0.6) + s.ph + i * 0.7) * (8 + i * 2 + hash2(seed, i + 4) * 8);
      const hh = 28 + hash2(seed, i + 8) * 36 + (i % 3) * 10;
      ctx.strokeStyle = tints[(seed + i) % tints.length];
      ctx.lineWidth = 2.2 + hash2(seed, i + 12) * 2.2;
      const ox = -18 + i * (36 / Math.max(1, blades - 1));
      ctx.beginPath();
      ctx.moveTo(ox, 20);
      if (hash2(seed, i + 40) > 0.45) {
        ctx.bezierCurveTo(ox + sway * 0.25, 8, ox - sway * 0.3, -6, ox + sway, 20 - hh);
      } else {
        ctx.quadraticCurveTo(ox + sway * 0.4, 4 - hash2(seed, i + 16) * 8, ox + sway, 20 - hh);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(90, 230, 160," + (0.4 + hash2(seed, i + 20) * 0.3) + ")";
      ctx.beginPath();
      ctx.ellipse(ox + sway, 18 - hh, 3.5 + hash2(seed, i + 24) * 3, 7 + hash2(seed, i + 28) * 5, sway * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawReefPlates() {
    for (let i = 0; i < oceanScenery.length; i++) {
      const s = oceanScenery[i];
      if (!s.landmark) continue;
      const sc = s.sc == null ? 1 : s.sc;
      drawWorldPlate(s.x, s.y - 58 * sc, "REEF", "reef");
    }
  }
  function drawWorldPlate(x, y, text, theme) {
    const shiny = theme === "shiny";
    const bang = theme === "bang";
    ctx.save();
    ctx.font = bang ? "800 11px Fredoka, sans-serif" : (shiny ? "800 12px Fredoka, sans-serif" : "800 11px Fredoka, sans-serif");
    const tw = ctx.measureText(text).width;
    const w = bang ? 16 : Math.max(40, tw + 18);
    const h = bang ? 16 : 18;
    const plateA = worldSpriteAlpha(x, y, Math.max(w, h) * 0.72 + 10);
    if (plateA <= 0.04) { ctx.restore(); return; }
    ctx.globalAlpha *= plateA;
    ctx.translate(x, y);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(10, 8, 4, 0.3)";
    ctx.beginPath(); ctx.ellipse(1, h * 0.4, w * 0.46, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    const g = ctx.createLinearGradient(0, -h / 2, 2, h / 2);
    if (shiny) {
      g.addColorStop(0, "#fff1a8");
      g.addColorStop(0.42, "#f0b429");
      g.addColorStop(1, "#b86a14");
    } else if (bang) {
      g.addColorStop(0, "#fff6e8");
      g.addColorStop(0.55, "#e8d090");
      g.addColorStop(1, "#8a6a38");
    } else {
      g.addColorStop(0, "#b8f4d8");
      g.addColorStop(0.48, "#2a9d8f");
      g.addColorStop(1, "#145248");
    }
    ctx.fillStyle = g;
    if (bang) {
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(60, 40, 16, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else {
      roundRect(-w / 2, -h / 2, w, h, 7); ctx.fill();
      ctx.strokeStyle = shiny ? "rgba(90, 48, 10, 0.48)" : "rgba(8, 36, 32, 0.48)";
      ctx.lineWidth = 1.7;
      roundRect(-w / 2, -h / 2, w, h, 7); ctx.stroke();
      ctx.strokeStyle = shiny ? "rgba(255, 246, 200, 0.5)" : "rgba(220, 255, 236, 0.38)";
      ctx.lineWidth = 1.05;
      roundRect(-w / 2 + 2.2, -h / 2 + 2.2, w - 4.4, h - 4.4, 5); ctx.stroke();
    }
    ctx.fillStyle = shiny || bang ? "#3a2410" : "#fff6e8";
    ctx.fillText(text, 0, 1);
    ctx.textBaseline = "alphabetic";
    ctx.restore();
  }
  function drawRockProp(x, y, seed, sc) {
    const s = sc || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.rotate((hash2(seed, 1) - 0.5) * 0.22);
    ctx.fillStyle = "rgba(8, 18, 22, 0.32)";
    ctx.beginPath(); ctx.ellipse(2, 10, 22 + hash2(seed, 3) * 10, 6.5, -0.08, 0, Math.PI * 2); ctx.fill();
    const n = 2 + (seed % 3);
    const palettes = [
      ["#d8b888", "#a87848", "#6a4220", "#3a6a40"],
      ["#c4a878", "#8a6238", "#4a3820", "#2f5a38"],
      ["#9aa8a4", "#5a6a68", "#2a3a38", "#3a6a58"],
      ["#e0c490", "#b88850", "#7a4a22", "#4a7a44"],
    ];
    for (let i = 0; i < n; i++) {
      const pal = palettes[(seed + i) % palettes.length];
      const ox = (hash2(seed, 2 + i) - 0.5) * 26;
      const oy = (hash2(seed, 6 + i) - 0.55) * 9;
      const rw = 13 + hash2(seed, 10 + i) * 16;
      const rh = 8 + hash2(seed, 14 + i) * 9;
      const verts = 6 + ((seed + i) % 3);
      ctx.beginPath();
      for (let k = 0; k < verts; k++) {
        const a = (k / verts) * Math.PI * 2 - 0.4;
        const rad = (0.68 + hash2(seed, 20 + i * 7 + k) * 0.42);
        const px = ox + Math.cos(a) * rw * rad;
        const py = oy + Math.sin(a) * rh * rad;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const body = ctx.createLinearGradient(ox - rw, oy - rh, ox + rw * 0.6, oy + rh);
      body.addColorStop(0, pal[0]);
      body.addColorStop(0.45, pal[1]);
      body.addColorStop(1, pal[2]);
      ctx.fillStyle = body;
      ctx.fill();
      ctx.strokeStyle = "rgba(24, 14, 8, 0.55)";
      ctx.lineWidth = 1.35;
      ctx.stroke();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = "rgba(255, 230, 180, 0.22)";
      ctx.beginPath();
      ctx.ellipse(ox - rw * 0.28, oy - rh * 0.38, rw * 0.38, rh * 0.26, -0.35, 0, Math.PI * 2);
      ctx.fill();
      if (hash2(seed, 40 + i) > 0.4) {
        ctx.fillStyle = pal[3];
        ctx.globalAlpha = 0.38;
        ctx.beginPath();
        ctx.ellipse(ox + rw * 0.12, oy + rh * 0.1, rw * 0.42, rh * 0.28, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = "rgba(40, 22, 10, 0.28)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(ox - rw * 0.2, oy - rh * 0.15);
      ctx.quadraticCurveTo(ox, oy + rh * 0.1, ox + rw * 0.25, oy);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "rgba(210, 190, 150, 0.55)";
      const barn = 1 + ((hash2(seed, 50 + i) * 3) | 0);
      for (let b = 0; b < barn; b++) {
        ctx.beginPath();
        ctx.arc(ox + (hash2(seed, 60 + i + b) - 0.5) * rw * 0.8, oy + (hash2(seed, 70 + i + b) - 0.3) * rh * 0.7, 1.1 + hash2(seed, 80 + i + b) * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  function drawSceneryRay(s) {
    const flap = Math.sin(state.time * 1.6 + s.ph) * 0.22;
    const face = (s.facing || (s.vx >= 0 ? 1 : -1)) >= 0 ? 0.04 : Math.PI - 0.04;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(face + flap * 0.15);
    ctx.globalAlpha = 0.52;
    const wing = ctx.createLinearGradient(-8, -18, 10, 16);
    wing.addColorStop(0, "#1a4a58");
    wing.addColorStop(0.42, "#0c3040");
    wing.addColorStop(1, "#061820");
    ctx.fillStyle = wing;
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
    ctx.fillStyle = "rgba(180, 220, 210, 0.16)";
    ctx.beginPath();
    ctx.ellipse(6, -2, 14, 4.2, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(8, 28, 38, 0.55)";
    ctx.beginPath();
    ctx.moveTo(-36, 0);
    ctx.quadraticCurveTo(-58, 4 + flap * 6, -72, 14);
    ctx.quadraticCurveTo(-50, 2, -36, 0);
    ctx.fill();
    ctx.restore();
  }
  function drawSceneryJelly(s) {
    const pulse = 1 + Math.sin(state.time * 1.8 + s.ph) * 0.1;
    const kind = ((s.ph * 10) | 0) % 3;
    const sc = 0.92 + (kind === 1 ? 0.18 : 0);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.scale(sc, sc);
    const tints = kind === 1
      ? { cap0: "#ffd0a8", cap1: "#f07850", cap2: "#c44838", arm: "rgba(240, 140, 90, 0.55)", tent: "rgba(230, 120, 80, 0.5)", rim: "#7a2818" }
      : kind === 2
        ? { cap0: "#fff4c8", cap1: "#f0c04a", cap2: "#c47820", arm: "rgba(240, 200, 90, 0.5)", tent: "rgba(220, 170, 60, 0.48)", rim: "#6a3a10" }
        : { cap0: "#e8fff8", cap1: "#7ad0e8", cap2: "#2a7d8a", arm: "rgba(120, 210, 220, 0.5)", tent: "rgba(90, 190, 210, 0.48)", rim: "#144048" };
    ctx.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const ox = -12 + i * 4;
      const pts = [];
      for (let k = 0; k <= 6; k++) {
        pts.push([
          ox * 0.45 + Math.sin(state.time * 2.2 + s.ph + i + k * 0.7) * 3.4,
          6 + k * 6.2,
        ]);
      }
      ctx.strokeStyle = "rgba(8, 24, 32, 0.28)";
      ctx.lineWidth = 2.15;
      ctx.beginPath();
      ctx.moveTo(pts[0][0] + 1.1, pts[0][1]);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0] + 1.1, pts[k][1]);
      ctx.stroke();
      ctx.strokeStyle = tints.tent;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.stroke();
    }
    ctx.strokeStyle = tints.arm;
    ctx.lineWidth = 2.1;
    for (let i = 0; i < 4; i++) {
      const ox = -8 + i * 5.2;
      ctx.beginPath();
      ctx.moveTo(ox * 0.3, 5);
      ctx.quadraticCurveTo(
        ox * 0.2 + Math.sin(state.time * 1.7 + s.ph + i) * 4,
        16,
        ox * 0.15 + Math.sin(state.time * 1.4 + i) * 3,
        26 + Math.sin(state.time * 2 + i) * 2
      );
      ctx.stroke();
    }
    const bell = ctx.createRadialGradient(-5, -6, 1.5, 2, 6, 19 * pulse);
    bell.addColorStop(0, tints.cap0);
    bell.addColorStop(0.28, tints.cap1);
    bell.addColorStop(0.72, tints.cap2);
    bell.addColorStop(1, tints.rim);
    ctx.fillStyle = bell;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 * pulse, 11 * pulse, 0, Math.PI, 0);
    ctx.quadraticCurveTo(9, 8, 0, 7);
    ctx.quadraticCurveTo(-9, 8, -16 * pulse, 0);
    ctx.fill();
    ctx.fillStyle = "rgba(8, 16, 22, 0.22)";
    ctx.beginPath();
    ctx.ellipse(4, 2.4, 9.2 * pulse, 5.8 * pulse, 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(8, 20, 28, 0.16)";
    ctx.beginPath();
    ctx.ellipse(8, 0, 5.4 * pulse, 8.2 * pulse, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = tints.rim;
    ctx.lineWidth = 1.35;
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 240, 0.38)";
    ctx.beginPath();
    ctx.ellipse(-5, -5, 6.2 * pulse, 2.8 * pulse, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 1, 8.5 * pulse, 3.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = tints.cap2;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(0, 1.5, 5.5 * pulse, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
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
    // C112 — a species-band hunt is not the SHINY clownfish callout.
    if (diveForHuntIndex() >= 0) return;
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
    syncChrome();
    tickMusic(dt);
    frameDrawing = true;
    applyCanvasBacking();
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
        if (state.scene === "ocean" && !state.fadeDir && (
          (player.surfaceIntent && nearSurface()) ||
          (bagIsFull() && nearSurface()) ||
          (atWaterline() && !scoopHoldActive())
        )) beginSurface();
        updateCashier(sim);
        updateDivers(sim);
        state.playClock = (state.playClock || 0) + dt;
        updateFX(dt);
        applyFade(dt);
        if (!state.fadeDir) updateCam(dt);
        else if (state.scene === "shop" && state.fadeDir < 0) {
          cam.y = DOCK_CAM_FLOOR;
          cam.z = 1.02 * stageZoom();
        }
        if (state.time % 5 < dt) persist();
      } else {
        updateCam(dt);
      }
      beginSpeechFrame();
      drawWorld();
      beginHudSpace();
      if (state.fade > 0) {
        ctx.fillStyle = "rgba(8, 40, 52," + state.fade + ")";
        ctx.fillRect(0, 0, W, H);
      }
      drawHUD();
      drawWelcomeBack();
      if (state.mode === "pause" || state.mode === "help") drawPause();
      drawCollectionBook();
      registerSurfaceHits();
    }
    frameDrawing = false;
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
