// Aqua Bay — original pier aquarium tycoon (vanilla Canvas 2D)
(() => {
  "use strict";

  // ===== CONFIG =====
  const W = 1280, H = 720;
  const SAVE_KEY = "aqua-bay-save";
  const SHOP = { w: 1760, h: 1260 };
  const OCEAN = { w: 2520, h: 1960 };
  const MAX_CUSTOMERS = 8;
  const SPECIES = [
    { id: 0, name: "Clownfish",  color: "#f08a2a", accent: "#fff6e8", outline: "#5a2a10", price: 15, unlock: 0,    cruise: 70, flee: 170, fleeR: 132, size: 15 },
    { id: 1, name: "Blue Tang",  color: "#2f7dff", accent: "#ffe14a", outline: "#10224a", price: 22, unlock: 60,   cruise: 80, flee: 200, fleeR: 150, size: 16 },
    { id: 2, name: "Goldfish",   color: "#ff8a2b", accent: "#ffd27a", outline: "#7a2e10", price: 40, unlock: 220,  cruise: 64, flee: 175, fleeR: 150, size: 17 },
    { id: 3, name: "Koi",        color: "#f4f0ea", accent: "#e23b2f", outline: "#4a2a22", price: 70, unlock: 550,  cruise: 60, flee: 165, fleeR: 160, size: 19 },
    { id: 4, name: "Sea Turtle", color: "#3d8b4a", accent: "#c6e38a", outline: "#1d3a20", price: 150, unlock: 1400, cruise: 42, flee: 110, fleeR: 170, size: 26 },
  ];
  const BOOK_FLAVOR = [
    "Orange stripes and zero fear — first regular of the bay.",
    "A blue streak that treats the reef like a racetrack.",
    "Fat, sunny, and happiest among garden weeds.",
    "Painted scales that turn the current into a parade.",
    "An old shell that maps every current by memory.",
  ];
  const BOOK_HINT = [
    "Already home in the shallows",
    "Lives on the reef",
    "Loves the goldfish garden",
    "Waits beyond the koi gate",
    "Wanders the turtle meadow",
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
    { x: 170, y: 150 }, { x: 430, y: 150 }, { x: 690, y: 150 },
    { x: 950, y: 150 }, { x: 1210, y: 150 },
  ];
  const TANK_W = 210, TANK_H = 156;
  const REGISTER = { x: 168, y: 500, w: 150, h: 110 };
  const KIOSK    = { x: 1420, y: 480, w: 170, h: 130 };
  const DIVE_ZONE = { x: 520, y: 980, w: 720, h: 160 };
  const EXPEDITION_COST = 35;
  const EXPEDITION_SECS = 45;
  const BOAT = { x: 1224, y: 1052 };
  const REEF_Y = 1000, REEF_X = 1700;
  const LM_GOLD = { x: 1880, y: 1120 };
  const LM_KOI = { x: 2080, y: 1520 };
  const LM_TURTLE = { x: 1640, y: 1760 };
  const SHIRTS = ["#e85d4c", "#3d8bfd", "#f0b429", "#7ad08a", "#c86bde", "#f2789f", "#5ec8c0"];

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  // ===== STATE =====
  const state = {
    mode: "title", scene: "shop", money: 0, speedLv: 0, bagLv: 0, catchLv: 0,
    unlocked: [true, false, false, false, false], stock: [0, 0, 0, 0, 0], bag: [],
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
    caughtCount: [0, 0, 0, 0, 0], bookOpen: null,
    decor: [false, false, false], expeditionCount: 0, nightExpedition: false,
    decorOpen: false,
  };
  const player = { x: 880, y: 920, vx: 0, vy: 0, facing: 0, bob: 0, catchProg: 0, target: null, radius: 16 };
  const cam = { x: 880, y: 920, z: 1 };
  const oceanFish = [];
  const tankFish = [[], [], [], [], []];
  const customers = [];
  const particles = [];
  const pops = [];
  const bubbles = [];
  const flyers = [];
  const hudCoins = [];
  const worldCoins = [];
  const titleBubbles = [];
  const keys = new Set();
  const mouse = { x: W / 2, y: H / 2, down: false, ui: false };
  let uiHits = [];
  let custTimer = 0;
  let browseTimer = 0.35;

  // ===== AUDIO =====
  let actx = null;
  const music = { started: false, pad: null, padGain: null, lfo: null, step: 0, acc: 0 };
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
      music.padGain.gain.value = state.muted ? 0 : 0.025;
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
    } catch (e) { music.started = false; }
  }
  function tickMusic(dt) {
    if (!music.started || !actx) return;
    const ocean = state.mode !== "title" && state.scene === "ocean";
    const sectionB = (music.step % 96) >= 64;
    const padFreq = ocean ? (sectionB ? 73 : 82) : (sectionB ? 98 : 110);
    if (music.pad) {
      music.pad.frequency.setTargetAtTime(padFreq, actx.currentTime, 0.35);
      if (music.padGain) music.padGain.gain.setTargetAtTime(state.muted ? 0 : (sectionB ? 0.02 : 0.025), actx.currentTime, 0.12);
    }
    const tick = ocean ? 0.2 : 0.1;
    music.acc += dt;
    if (music.acc >= tick) {
      music.acc -= tick;
      if (!state.muted) {
        const notesA = [0, 3, 5, 7, 5, 3, 0, -2];
        const notesB = [2, 5, 3, 7, 10, 7, 5, 3];
        const notes = sectionB ? notesB : notesA;
        const n = notes[music.step & 7];
        tone(220 * Math.pow(2, n / 12), sectionB ? 0.1 : 0.085, "triangle", sectionB ? 0.038 : 0.045);
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
    else if (kind === "no") { tone(160, 0.1, "sawtooth", 0.03); }
  }

  // ===== SAVE =====
  function defaultSave() {
    return {
      money: 0, speedLv: 0, bagLv: 0, catchLv: 0,
      unlocked: [true, false, false, false, false],
      stock: [0, 0, 0, 0, 0], bag: [], tutorial: 0, registerCash: 0,
      lifetimeCatches: 0, muted: false, hiredCashier: false,
      sawReef: false, sawGoldGarden: false, sawKoiGate: false, sawTurtleMeadow: false,
      peakMoney: 0, caughtCount: [0, 0, 0, 0, 0],
      decor: [false, false, false], expeditionCount: 0,
    };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      Object.assign(state, {
        money: d.money | 0, speedLv: d.speedLv | 0, bagLv: d.bagLv | 0, catchLv: d.catchLv | 0,
        unlocked: Array.isArray(d.unlocked) ? d.unlocked : defaultSave().unlocked,
        stock: Array.isArray(d.stock) ? d.stock : [0, 0, 0, 0, 0],
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
        caughtCount: Array.isArray(d.caughtCount) ? [0, 1, 2, 3, 4].map(i => d.caughtCount[i] | 0) : [0, 0, 0, 0, 0],
        bookOpen: null,
        decor: Array.isArray(d.decor) ? [0, 1, 2].map(i => !!d.decor[i]) : [false, false, false],
        expeditionCount: d.expeditionCount | 0,
        nightExpedition: false,
        decorOpen: false,
      });
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
        unlocked: state.unlocked, stock: state.stock, bag: state.bag,
        tutorial: state.tutorial, registerCash: state.registerCash,
        lifetimeCatches: state.lifetimeCatches, muted: state.muted,
        didFirstCollect: state.didFirstCollect, didFirstUnlock: state.didFirstUnlock,
        hiredCashier: state.hiredCashier,
        sawReef: state.sawReef, sawGoldGarden: state.sawGoldGarden,
        sawKoiGate: state.sawKoiGate, sawTurtleMeadow: state.sawTurtleMeadow,
        peakMoney: Math.max(state.peakMoney | 0, state.money | 0),
        caughtCount: state.caughtCount || [0, 0, 0, 0, 0],
        decor: state.decor || [false, false, false],
        expeditionCount: state.expeditionCount | 0,
      }));
      state.hasSave = true;
    } catch (e) {}
  }
  function resetSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    const keepMute = state.muted;
    Object.assign(state, defaultSave(), { mode: "title", scene: "shop", fade: 0, coins: [], toasts: [],
      muted: keepMute, hitStop: 0, camPunch: 0, bagPunch: 1, moneyPunch: 1, displayMoney: 0,
      moneyRollT: 0, audioUnlocked: state.audioUnlocked,
      diveCatches: 0, bagBonus: 1, flash: 0, dustTimer: 0,
      splash: null, tankReveal: null, unlockBanner: null, comboPop: null, shopSwimmers: [],
      didFirstCollect: false, didFirstUnlock: false, hiredCashier: false, cashierAcc: 0,
      sawReef: false, sawGoldGarden: false, sawKoiGate: false, sawTurtleMeadow: false,
      inReef: false, zoneTitle: null, expedition: false, expeditionTime: 0, peakMoney: 0, vipCooldown: 0,
      caughtCount: [0, 0, 0, 0, 0], bookOpen: null,
      decor: [false, false, false], expeditionCount: 0, nightExpedition: false, decorOpen: false });
    state.hasSave = false;
    player.x = 880; player.y = 920; player.vx = 0; player.vy = 0; player.catchProg = 0; player.target = null;
    cam.x = 880; cam.y = 920; cam.z = 1;
    customers.length = 0; oceanFish.length = 0; particles.length = 0; pops.length = 0; bubbles.length = 0;
    flyers.length = 0; hudCoins.length = 0; worldCoins.length = 0;
    browseTimer = 0.35;
    for (let i = 0; i < 5; i++) tankFish[i].length = 0;
    seedOcean();
  }

  // ===== HELPERS =====
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  function normAng(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }
  function bagMax() { return BAG_STEPS[clamp(state.bagLv, 0, BAG_STEPS.length - 1)]; }
  function walkSpeed() { return 195 + state.speedLv * 38; }
  function swimSpeed() { return 215 + state.speedLv * 42; }
  function catchTime() { return (state.lifetimeCatches < 3 ? 0.42 : 0.55) / (1 + 0.24 * state.catchLv); }
  function coneRange() { return 200 + state.catchLv * 8; }
  function toast(msg, col) { state.toasts.push({ msg, col: col || "#fff6d2", life: 2.2 }); }
  function pop(x, y, text, col) { pops.push({ x, y, text, col: col || "#ffe27a", life: 1, vy: -36 }); }
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
  function decorHudReady() {
    return shopBarsReady() && (boughtAnUpgrade() || !!state.unlocked[1]);
  }
  function highestUnlocked() {
    let h = 0;
    for (let i = 0; i < 5; i++) if (state.unlocked[i]) h = i;
    return h;
  }
  function nextLockedTank() {
    for (let i = 0; i < 5; i++) if (!state.unlocked[i]) return i;
    return -1;
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
  function spawnP(x, y, n, cols, spread) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = rand(20, spread || 90);
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: rand(0.35, 0.8), r: rand(2, 5), col: pick(cols) });
    }
  }
  function rebuildTankFish() {
    for (let i = 0; i < 5; i++) {
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
    const arr = tankFish[i];
    for (let k = arr.length - 1; k >= 0; k--) {
      if (!arr[k].ceremonial) { arr.splice(k, 1); return; }
    }
  }
  function pickBrowseTank(exclude) {
    const buyers = new Set();
    for (const c of customers) if (c.state === "tank") buyers.add(c.tank);
    const free = [], all = [];
    for (let k = 0; k < 5; k++) {
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
  function newCustomer(extra) {
    return Object.assign({
      x: rand(700, 1060), y: 1040, vx: 0, vy: 0,
      shirt: pick(SHIRTS), hair: pick(["#3a2415", "#1b1b1b", "#8a4a1a", "#d8c07a"]),
      skin: pick(["#f0c2a0", "#d0a07a", "#8d5a3a", "#f3d3b4"]),
      state: "tank", tank: 0, carry: -1, bob: rand(0, 8), wait: 0,
      emote: "", emoteOff: ((customers.length % 5) - 2) * 11,
      hat: Math.random() < 0.33, hairCut: (Math.random() * 3) | 0, offX: 0,
    }, extra);
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
    if (e.key === " " || e.code === "Space") tryAction();
    audio();
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
  function canvasPos(ev) {
    const r = canvas.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * (W / r.width), y: (ev.clientY - r.top) * (H / r.height) };
  }
  canvas.addEventListener("pointerdown", (e) => {
    const p = canvasPos(e);
    mouse.x = p.x; mouse.y = p.y; mouse.down = true; mouse.ui = false;
    audio();
    const hit = hitUI(p.x, p.y);
    if (hit) { mouse.ui = true; onUI(hit); return; }
    if (state.mode === "play") tryAction();
  });
  canvas.addEventListener("pointermove", (e) => { const p = canvasPos(e); mouse.x = p.x; mouse.y = p.y; });
  canvas.addEventListener("pointerup", () => { mouse.down = false; mouse.ui = false; });
  canvas.addEventListener("pointerleave", () => { mouse.down = false; });
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
    if (id === "play") {
      if (state.hasSave && state.mode === "title") resetSave();
      startPlay();
      return;
    }
    if (id === "continue") { startPlay(); return; }
    if (id === "pause") { state.mode = "pause"; return; }
    if (id === "resume") { state.mode = "play"; return; }
    if (id === "help") { state.mode = "help"; return; }
    if (id === "back") { state.mode = "pause"; return; }
    if (id === "reset") { resetSave(); return; }
    if (id === "mute") { state.muted = !state.muted; persist(); return; }
    if (id === "up-speed") buySpeed();
    if (id === "up-bag") buyBag();
    if (id === "up-catch") buyCatch();
    if (id === "up-cashier") buyCashier();
    if (id.startsWith("decor-")) buyDecor(+id.split("-")[1]);
    if (id.startsWith("unlock-")) buyTank(+id.split("-")[1]);
    if (id === "book-dismiss" || id === "book-close") { state.bookOpen = null; return; }
    if (id === "book-panel") return;
    if (id.startsWith("book-")) {
      const n = +id.split("-")[1];
      if (n >= 0 && n < 5) state.bookOpen = n;
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
      cam.x = 880; cam.y = 920; cam.z = 1;
    }
    state.displayMoney = state.money;
  }
  function tryAction() {
    if (state.mode !== "play" || state.fadeDir || state.bookOpen != null) return;
    if (state.scene === "shop" && nearBoat() && expeditionUnlocked()) beginExpedition();
    else if (state.scene === "shop" && inDiveZone()) beginDive();
    else if (state.scene === "ocean" && player.y < 200) beginSurface();
  }
  function inDiveZone() {
    return player.x > DIVE_ZONE.x && player.x < DIVE_ZONE.x + DIVE_ZONE.w &&
           player.y > DIVE_ZONE.y - 40 && player.y < DIVE_ZONE.y + DIVE_ZONE.h;
  }
  function beginDive() {
    sfx("dive"); state.fadeDir = 1; state.pendingScene = "ocean";
    state.decorOpen = false;
    if (state.tutorial === 0) state.tutorial = 1;
  }
  function beginSurface() {
    sfx("dive"); state.fadeDir = 1; state.pendingScene = "shop";
    if (state.tutorial === 2) state.tutorial = 3;
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
  }
  function seedExpeditionPocket() {
    const hi = highestUnlocked();
    const nxt = hi > 0 ? hi - 1 : 0;
    const px = 2200, py = 1600;
    pushOceanFish(hi, px + rand(-36, 36), py + rand(-28, 28));
    if (state.nightExpedition) pushOceanFish(hi, px + rand(-40, 40), py + rand(-32, 32));
    for (let i = 0; i < 4; i++) pushOceanFish(nxt, px + rand(-88, 88), py + rand(-64, 64));
    for (let i = 0; i < 3; i++) pushOceanFish(0, px + rand(-110, 110), py + rand(-72, 72));
  }
  function worldToScreen(x, y) { return { x: (x - cam.x) * cam.z + W / 2, y: (y - cam.y) * cam.z + H / 2 }; }
  function screenToWorld(x, y) { return { x: (x - W / 2) / cam.z + cam.x, y: (y - H / 2) / cam.z + cam.y }; }

  // ===== OCEAN FISH =====
  function pushOceanFish(s, x, y) {
    oceanFish.push({
      s, x: clamp(x, 80, OCEAN.w - 80), y: clamp(y, 260, OCEAN.h - 80),
      vx: rand(-30, 30), vy: rand(-18, 18), ang: rand(-0.4, 0.6), ph: rand(0, 40), fleeT: 0, caught: false,
    });
  }
  function seedFrontSchool() {
    const mixed = state.unlocked[1] && Math.random() < 0.3;
    if (mixed) {
      for (let i = 0; i < 4; i++) {
        pushOceanFish(0, player.x + rand(-50, 90) + 40, player.y + 220 + rand(-24, 50));
      }
      for (let i = 0; i < 2; i++) {
        pushOceanFish(1, player.x + rand(-20, 110) + 80, player.y + 310 + rand(-20, 50));
      }
    } else {
      for (let i = 0; i < 6; i++) {
        pushOceanFish(0, player.x + rand(-50, 90), player.y + 160 + rand(-30, 70));
      }
    }
  }
  function seedOcean() {
    oceanFish.length = 0;
    const counts = [16, 11, 9, 7, 3];
    for (let s = 0; s < 5; s++) {
      if (!state.unlocked[s]) continue;
      for (let i = 0; i < counts[s]; i++) spawnFish(s);
    }
  }
  function spawnFish(s) {
    let cx, cy;
    if (s === 0) {
      const school = (Math.random() * 4) | 0;
      cx = 280 + school * 500 + rand(-80, 80);
      cy = 420 + rand(-60, 60) + (state.unlocked[1] ? rand(0, 380) : ((s * 97) % 900));
      if (state.unlocked[1] && Math.random() < 0.82) cy = rand(280, 880);
    } else if (state.unlocked[1]) {
      const lm = s === 2 ? LM_GOLD : s === 3 ? LM_KOI : s === 4 ? LM_TURTLE : null;
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
    const want = [24, 11, 9, 7, 3];
    for (let s = 0; s < 5; s++) {
      if (!state.unlocked[s]) continue;
      let n = 0;
      for (const f of oceanFish) if (f.s === s && !f.caught) n++;
      while (n < want[s]) { spawnFish(s); n++; }
    }
  }
  function updateOceanFish(dt) {
    const px = player.x, py = player.y;
    for (const f of oceanFish) {
      if (f.caught) continue;
      const sp = SPECIES[f.s];
      const dx = f.x - px, dy = f.y - py;
      const d = Math.hypot(dx, dy) || 0.001;
      if (d < sp.fleeR) {
        f.fleeT = 0.45;
        const boost = d < 70 ? 1.25 : 1;
        f.vx = (dx / d) * sp.flee * boost;
        f.vy = (dy / d) * sp.flee * boost;
        f.ang = Math.atan2(f.vy, f.vx);
      } else if (f.fleeT > 0) {
        f.fleeT -= dt;
      } else {
        f.ang += Math.sin(state.time * 1.3 + f.ph) * 1.1 * dt + (Math.random() - 0.5) * 0.8 * dt;
        let sx = 0, sy = 0, c = 0;
        for (const o of oceanFish) {
          if (o === f || o.s !== f.s || o.caught) continue;
          const dd = Math.hypot(o.x - f.x, o.y - f.y);
          if (dd < 90) { sx += o.x; sy += o.y; c++; }
        }
        if (c) f.ang = lerp(f.ang, Math.atan2(sy / c - f.y, sx / c - f.x), 0.015);
        f.vx = Math.cos(f.ang) * sp.cruise;
        f.vy = Math.sin(f.ang) * sp.cruise;
      }
      f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.x < 70) { f.x = 70; f.vx = Math.abs(f.vx); f.ang = 0; }
      if (f.x > OCEAN.w - 70) { f.x = OCEAN.w - 70; f.vx = -Math.abs(f.vx); f.ang = Math.PI; }
      if (f.y < 230) { f.y = 230; f.vy = Math.abs(f.vy); }
      if (f.y > OCEAN.h - 70) { f.y = OCEAN.h - 70; f.vy = -Math.abs(f.vy); }
    }
  }
  function fishInCone(f) {
    const dx = f.x - player.x, dy = f.y - player.y;
    const d = Math.hypot(dx, dy);
    if (d > coneRange() || d < 18) return false;
    return Math.abs(normAng(Math.atan2(dy, dx) - player.facing)) < 0.85;
  }
  function updateCatch(dt) {
    if (state.bag.length >= bagMax()) { player.target = null; player.catchProg = 0; return; }
    let best = null, bestD = 1e9;
    for (const f of oceanFish) {
      if (f.caught || !fishInCone(f)) continue;
      const d = Math.hypot(f.x - player.x, f.y - player.y);
      if (d < bestD) { bestD = d; best = f; }
    }
    if (best) {
      player.target = best;
      player.catchProg += dt / catchTime();
      if (player.catchProg >= 1) catchFish(best);
    } else if (player.target && !player.target.caught) {
      const d = Math.hypot(player.target.x - player.x, player.target.y - player.y);
      if (d < coneRange() * 1.2) {
        player.catchProg += dt / catchTime();
        if (player.catchProg >= 1) catchFish(player.target);
      } else {
        player.catchProg = Math.max(0, player.catchProg - dt * 1.6);
        if (player.catchProg <= 0) player.target = null;
      }
    } else {
      player.catchProg = Math.max(0, player.catchProg - dt * 1.6);
      if (player.catchProg <= 0) player.target = null;
    }
  }
  function catchFish(f) {
    f.caught = true;
    state.bag.push(f.s);
    player.catchProg = 0; player.target = null;
    state.hitStop = 0.08;
    state.camPunch = 0.08;
    state.lifetimeCatches++;
    state.diveCatches++;
    if (!state.caughtCount || state.caughtCount.length < 5) state.caughtCount = [0, 0, 0, 0, 0];
    state.caughtCount[f.s] = (state.caughtCount[f.s] | 0) + 1;
    if (state.diveCatches >= 3) {
      state.bagBonus = 1.1;
      const word = state.diveCatches >= 5 ? "AMAZING" : state.diveCatches === 4 ? "GREAT" : "NICE";
      const col = state.diveCatches >= 5 ? "#ff8ad4" : state.diveCatches === 4 ? "#9ef0ff" : "#ffe27a";
      state.comboPop = { text: word, col, life: 0.6, max: 0.6 };
    }
    state.bagPunch = 1.25;
    const scr = worldToScreen(f.x, f.y);
    flyers.push({ s: f.s, x: scr.x, y: scr.y, life: 0.35 });
    spawnP(f.x, f.y, 22, [SPECIES[f.s].color, "#fff", "#ffe27a"], 140);
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * Math.PI * 2, sp = rand(50, 150);
      particles.push({ x: f.x, y: f.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 50, life: rand(0.4, 0.9), r: rand(2, 4), col: "#ffd24a" });
    }
    pop(f.x, f.y - 18, SPECIES[f.s].name + "!", SPECIES[f.s].accent);
    sfx("catch");
    if (state.lifetimeCatches <= 2) toast("Swim up when you are ready", "#9ef0ff");
    if (state.tutorial === 1) state.tutorial = 2;
    if (state.bag.length >= bagMax()) toast("Bag full! Swim up to surface.", "#9ef0ff");
    for (let i = oceanFish.length - 1; i >= 0; i--) if (oceanFish[i].caught) oceanFish.splice(i, 1);
    ensureOceanStock();
    persist();
  }

  // ===== PLAYER =====
  function updatePlayer(dt) {
    const ocean = state.scene === "ocean";
    const max = ocean ? swimSpeed() : walkSpeed();
    let ax = 0, ay = 0;
    if (keys.has("w") || keys.has("arrowup")) ay -= 1;
    if (keys.has("s") || keys.has("arrowdown")) ay += 1;
    if (keys.has("a") || keys.has("arrowleft")) ax -= 1;
    if (keys.has("d") || keys.has("arrowright")) ax += 1;
    if (ax || ay) {
      const m = Math.hypot(ax, ay) || 1; ax /= m; ay /= m;
    } else if (mouse.down && !mouse.ui && state.mode === "play") {
      const w = screenToWorld(mouse.x, mouse.y);
      const dx = w.x - player.x, dy = w.y - player.y, d = Math.hypot(dx, dy);
      if (d > 8) { ax = dx / d; ay = dy / d; }
    }
    player.vx += ax * 1650 * dt; player.vy += ay * 1650 * dt;
    const fr = ax || ay ? 5.2 : 8.5;
    player.vx -= player.vx * fr * dt; player.vy -= player.vy * fr * dt;
    const sp = Math.hypot(player.vx, player.vy);
    if (sp > max) { player.vx *= max / sp; player.vy *= max / sp; }
    player.x += player.vx * dt; player.y += player.vy * dt;
    const faceMin = (ocean && mouse.down) ? 6 : 18;
    if (sp > faceMin) player.facing = Math.atan2(player.vy, player.vx);
    player.bob += dt * (ocean ? 7 : 9) * (sp > 20 ? 1 : 0.35);
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
      if (sp > 40) {
        state.dustTimer -= dt;
        if (state.dustTimer <= 0) {
          state.dustTimer = 0.18;
          particles.push({
            x: player.x + rand(-4, 4), y: player.y + 10,
            vx: rand(-12, 12), vy: rand(-6, 2),
            life: rand(0.22, 0.4), r: rand(5, 9),
            col: "rgba(180,150,100,0.35)", kind: "dust",
          });
        }
      }
    }
  }
  function constrainShop() {
    const r = player.radius;
    if (player.y < 890) {
      player.x = clamp(player.x, 110 + r, 1650 - r);
      player.y = clamp(player.y, 118 + r, 890);
    } else {
      player.x = clamp(player.x, 500 + r, 1320 - r);
      player.y = clamp(player.y, 860, 1080);
    }
    for (let i = 0; i < 5; i++) {
      const t = TANK_POS[i];
      pushOut(t.x - 8, t.y - 8, TANK_W + 16, TANK_H + 28);
    }
    pushOut(REGISTER.x - 6, REGISTER.y - 6, REGISTER.w + 12, REGISTER.h + 12);
    pushOut(KIOSK.x - 6, KIOSK.y - 6, KIOSK.w + 12, KIOSK.h + 12);
    pushOut(188, 668, 156, 86);
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
  function updateShopInteract() {
    for (let i = 0; i < 5; i++) {
      const t = TANK_POS[i];
      if (state.unlocked[i] && nearRect(t.x, t.y, TANK_W, TANK_H, 36)) stockTank(i);
    }
    const cashPad = (state.registerCash > 0 && state.tutorial <= 4) ? 220 : 40;
    if (nearRect(REGISTER.x, REGISTER.y, REGISTER.w, REGISTER.h, cashPad)) collectCash();
  }
  function stockTank(i) {
    let n = 0; const keep = [];
    for (const s of state.bag) { if (s === i) n++; else keep.push(s); }
    if (!n) return;
    state.bag = keep; state.stock[i] += n;
    for (let k = tankFish[i].length - 1; k >= 0; k--) if (tankFish[i][k].ceremonial) tankFish[i].splice(k, 1);
    for (let k = 0; k < n; k++) tankFish[i].push({ x: rand(24, TANK_W - 24), y: rand(36, TANK_H - 18), a: rand(0, 6), ph: rand(0, 20) });
    const t = TANK_POS[i];
    spawnP(t.x + TANK_W / 2, t.y + TANK_H / 2, 12, [SPECIES[i].color, "#b8f3ff", "#fff"], 80);
    pop(t.x + TANK_W / 2, t.y, "+" + n + " " + SPECIES[i].name, "#b8f3ff");
    sfx("stock"); toast("Stocked " + n + " " + SPECIES[i].name, "#b8f3ff");
    if (state.tutorial === 3) state.tutorial = 4;
    if (customers.length === 0) {
      customers.push(newCustomer({
        x: t.x + TANK_W / 2, y: t.y + TANK_H + 40,
        state: "tank", tank: i, wait: 0.35, emote: "!", offX: 0,
      }));
      custTimer = 0.35;
    }
    persist();
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
    for (let i = 0; i < 6; i++) {
      hudCoins.push({
        x: rs.x + rand(-10, 10), y: rs.y + rand(-8, 8),
        tx: 44, ty: 40, life: 0.35 + i * 0.04, max: 0.35 + i * 0.04,
      });
    }
    pop(REGISTER.x + 70, REGISTER.y, "+$" + got, "#ffe27a");
    spawnP(REGISTER.x + 75, REGISTER.y + 20, 16, ["#ffe27a", "#ffd24a", "#fff"], 100);
    sfx("coin", fromStaff ? 0.55 : 1);
    if (!state.didFirstCollect) { state.didFirstCollect = true; triggerFlash(); persist(); }
    if (prev < 40 && state.money >= 40) toast("Cashed in! Tap Speed to run faster", "#ffe27a");
    if (state.tutorial === 4) state.tutorial = 5;
    persist();
  }
  function buySpeed() {
    if (state.speedLv >= SPEED_COST.length) return sfx("no");
    const c = SPEED_COST[state.speedLv];
    if (state.money < c) return sfx("no");
    state.money -= c; state.speedLv++; sfx("unlock"); toast("Speed up!", "#9ef0ff"); persist();
    if (state.tutorial === 5) state.tutorial = 6;
  }
  function buyBag() {
    if (state.bagLv >= BAG_COST.length) return sfx("no");
    const c = BAG_COST[state.bagLv];
    if (state.money < c) return sfx("no");
    state.money -= c; state.bagLv++; sfx("unlock"); toast("Bigger bag!", "#9ef0ff"); persist();
    if (state.tutorial === 5) state.tutorial = 6;
  }
  function buyCatch() {
    if (state.catchLv >= CATCH_COST.length) return sfx("no");
    const c = CATCH_COST[state.catchLv];
    if (state.money < c) return sfx("no");
    state.money -= c; state.catchLv++; sfx("unlock"); toast("Faster catch!", "#9ef0ff"); persist();
    if (state.tutorial === 5) state.tutorial = 6;
  }
  function buyTank(i) {
    if (state.unlocked[i]) return;
    const c = SPECIES[i].unlock;
    if (state.money < c) return sfx("no");
    state.money -= c; state.unlocked[i] = true;
    sfx("unlock");
    toast("Unlocked " + SPECIES[i].name + "!", SPECIES[i].color);
    toast("New fish in the ocean!", "#9ef0ff");
    spawnP(TANK_POS[i].x + TANK_W / 2, TANK_POS[i].y + 70, 20, [SPECIES[i].color, "#fff", "#ffe27a"], 140);
    state.tankReveal = { i, life: 0.4, max: 0.4 };
    state.unlockBanner = { name: SPECIES[i].name, color: SPECIES[i].color, life: 0.9 };
    for (let k = 0; k < 3; k++) {
      tankFish[i].push({ x: rand(24, TANK_W - 24), y: rand(36, TANK_H - 18), a: rand(0, 6), ph: rand(0, 20), ceremonial: true });
    }
    state.shopSwimmers.push(
      { s: i, x: -30, y: 430, vx: 92, ph: rand(0, 8) },
      { s: i, x: -80, y: 510, vx: 78, ph: rand(0, 8) }
    );
    if (!state.didFirstUnlock) { state.didFirstUnlock = true; triggerFlash(); }
    ensureOceanStock(); persist();
    if (state.tutorial === 5) state.tutorial = 6;
  }
  function buyCashier() {
    if (state.hiredCashier) return sfx("no");
    if (state.money < CASHIER_COST) return sfx("no");
    state.money -= CASHIER_COST;
    state.hiredCashier = true;
    state.cashierAcc = 0;
    sfx("unlock");
    toast("Cashier hired! They collect while you dive.", "#ffe27a");
    persist();
  }
  function buyDecor(i) {
    if (!state.decor || state.decor.length < 3) state.decor = [false, false, false];
    if (i < 0 || i > 2 || state.decor[i]) return sfx("no");
    const c = DECOR_COST[i];
    if (state.money < c) return sfx("no");
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
  }

  // ===== CUSTOMERS =====
  function trySpawnVIP() {
    if (state.unlocked.filter(Boolean).length < 2) return false;
    if (state.vipCooldown > 0) return false;
    for (const c of customers) if (c.vip) return false;
    if (Math.random() >= 0.12) return false;
    const pool = [];
    for (let i = 0; i < 5; i++) if (state.unlocked[i]) pool.push(i);
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
    toast("A VIP wants " + SPECIES[want].name + "!", "#ffe27a");
    return true;
  }
  function spawnCustomer() {
    if (customers.length >= MAX_CUSTOMERS) return;
    if (trySpawnVIP()) return;
    const stocked = [];
    for (let i = 0; i < 5; i++) if (state.unlocked[i] && state.stock[i] > 0) stocked.push(i);
    if (!stocked.length) return;
    let pickI = stocked[0], best = -1;
    for (const i of stocked) {
      const w = state.stock[i] + Math.random() * 2;
      if (w > best) { best = w; pickI = i; }
    }
    customers.push(newCustomer({
      state: "tank", tank: pickI, offX: tankQueueOffX(pickI),
    }));
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
    for (let i = customers.length - 1; i >= 0; i--) {
      const c = customers[i];
      c.bob += dt * 10;
      let tx = c.x, ty = c.y;
      if (c.state === "tank") {
        const t = TANK_POS[c.tank];
        tx = t.x + TANK_W / 2 + (c.offX || 0); ty = t.y + TANK_H + 36;
        if (state.stock[c.tank] <= 0 && Math.hypot(c.x - tx, c.y - ty) >= 18 && !c.vip) c.emote = "…";
        if (Math.hypot(c.x - tx, c.y - ty) < 18) {
          if (c.vip) {
            if (state.stock[c.tank] > 0) {
              c.emote = "$$$";
              c.wait += dt;
              if (c.wait > 0.35) {
                state.stock[c.tank]--;
                popSaleFish(c.tank);
                c.carry = c.tank; c.state = "reg"; c.wait = 0; c.emote = "VIP";
              }
            } else {
              c.emote = "…";
              c.wait += dt;
              if (c.wait > 3) {
                const alt = [];
                for (let k = 0; k < 5; k++) if (state.stock[k] > 0) alt.push(k);
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
                c.carry = c.tank; c.state = "reg"; c.wait = 0; c.emote = "";
              } else {
                const alt = [];
                for (let k = 0; k < 5; k++) if (state.stock[k] > 0) alt.push(k);
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
          c.emote = c.vip ? "$$$" : "$";
          c.wait += dt;
          if (c.wait > 0.15) {
            const bonus = 1 + Math.min(0.35, (state.stock[c.carry] || 0) * 0.03);
            const pay = Math.round(SPECIES[c.carry].price * bonus * (state.bagBonus || 1) * (c.payMult || 1));
            state.registerCash += pay;
            state.coins.push({ x: REGISTER.x + rand(30, 120), y: REGISTER.y + rand(16, 50), v: pay, ph: rand(0, 6) });
            for (let k = 0; k < 4; k++) {
              worldCoins.push({
                x: c.x + rand(-8, 8), y: c.y - 10 + rand(-6, 6),
                tx: REGISTER.x + 75, ty: REGISTER.y + 28, life: 0.4 + k * 0.04,
              });
            }
            pop(REGISTER.x + 80, REGISTER.y - 8, "+$" + pay, "#ffe27a");
            sfx("coin"); c.carry = -1; c.state = "leave"; c.wait = 0; c.emote = ""; persist();
          }
        }
      } else if (c.state === "browse") {
        const t = TANK_POS[c.tank];
        tx = t.x + TANK_W / 2 + (c.offX || 24); ty = t.y + TANK_H + 36;
        if (Math.hypot(c.x - tx, c.y - ty) < 18) {
          c.emote = "!";
          c.wait += dt;
          if (c.wait > 1.2) {
            c.wait = 0;
            c.hops = (c.hops || 1) - 1;
            if (c.hops > 0) {
              const nxt = pickBrowseTank(c.tank);
              if (nxt !== c.tank) { c.tank = nxt; c.offX = Math.random() < 0.5 ? -24 : 24; }
              else { c.state = "leave"; c.emote = ""; }
            } else {
              c.state = "leave"; c.emote = "";
            }
          }
        }
      } else {
        ty = 1180;
        if (c.y > 1120) { customers.splice(i, 1); continue; }
      }
      const dx = tx - c.x, dy = ty - c.y, d = Math.hypot(dx, dy) || 1;
      c.x += (dx / d) * 150 * dt; c.y += (dy / d) * 150 * dt;
    }
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
    for (let i = state.toasts.length - 1; i >= 0; i--) {
      state.toasts[i].life -= dt;
      if (state.toasts[i].life <= 0) state.toasts.splice(i, 1);
    }
    for (let i = flyers.length - 1; i >= 0; i--) {
      const fl = flyers[i];
      fl.life -= dt;
      fl.x = lerp(fl.x, 240, 1 - Math.pow(0.0004, dt));
      fl.y = lerp(fl.y, 40, 1 - Math.pow(0.0004, dt));
      if (fl.life <= 0) flyers.splice(i, 1);
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
      c.x = lerp(c.x, c.tx, 1 - Math.pow(0.0003, dt));
      c.y = lerp(c.y, c.ty, 1 - Math.pow(0.0003, dt));
      if (c.life <= 0) worldCoins.splice(i, 1);
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
      if (bubbles.length < 40 && Math.random() < dt * 8) {
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
    for (let i = state.shopSwimmers.length - 1; i >= 0; i--) {
      const sw = state.shopSwimmers[i];
      sw.x += sw.vx * dt;
      sw.y += Math.sin(state.time * 2 + sw.ph) * 10 * dt;
      if (sw.x > SHOP.w + 40) state.shopSwimmers.splice(i, 1);
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
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath(); ctx.ellipse(x, y + 10, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }
  function drawTurtle(ang, s, t) {
    ctx.save(); ctx.rotate(ang);
    const flap = Math.sin(t * 6) * 0.32;
    ctx.fillStyle = "#2a5a32";
    ctx.save(); ctx.rotate(2.45 + flap * 0.3);
    ctx.beginPath(); ctx.ellipse(-1.5 * s, 0, 6.2 * s, 2.1 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.rotate(-2.45 - flap * 0.3);
    ctx.beginPath(); ctx.ellipse(-1.5 * s, 0, 6.2 * s, 2.1 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#2f6b3a";
    ctx.save(); ctx.rotate(-0.72 + flap);
    ctx.beginPath(); ctx.ellipse(-2 * s, -11 * s, 9.2 * s, 3.3 * s, 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1d3a20"; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.rotate(0.72 - flap);
    ctx.beginPath(); ctx.ellipse(-2 * s, 11 * s, 9.2 * s, 3.3 * s, -0.12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1d3a20"; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#2f6b3a";
    ctx.beginPath();
    ctx.moveTo(-12 * s, -1.5 * s); ctx.lineTo(-16.5 * s, 0); ctx.lineTo(-12 * s, 1.5 * s);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#3d8b4a";
    ctx.beginPath(); ctx.ellipse(0, 0, 13 * s, 10.2 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1d3a20"; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = "#4f9d58";
    ctx.beginPath(); ctx.ellipse(0, 0, 5.1 * s, 4.1 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#c6e38a"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, 0, 5.1 * s, 4.1 * s, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#c6e38a"; ctx.lineWidth = 0.9;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.28;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 7.1 * s, Math.sin(a) * 5.5 * s, 3.3 * s, 2.5 * s, a, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = "#4a9a55";
    ctx.beginPath(); ctx.ellipse(12.6 * s, 0, 5.5 * s, 3.7 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1d3a20"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(14.7 * s, -1.15 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(15.2 * s, -1.15 * s, 0.75 * s, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawFishEye(s, ox, oy) {
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(ox * s, oy * s, 2.05 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath(); ctx.arc((ox + 0.55) * s, oy * s, 1.05 * s, 0, Math.PI * 2); ctx.fill();
  }
  function drawFishBody(sp, x, y, ang, scale, t) {
    ctx.save();
    ctx.translate(x, y);
    if (sp.id === 4) { drawTurtle(ang, scale, t); ctx.restore(); return; }
    ctx.rotate(ang);
    const s = scale;
    const wob = Math.sin(t * 10) * 0.12;
    if (sp.id === 0) {
      ctx.fillStyle = "#f08a2a";
      ctx.beginPath();
      ctx.moveTo(-9 * s, 0);
      ctx.lineTo(-16 * s, -6 * s + wob * 5);
      ctx.lineTo(-13.2 * s, 0);
      ctx.lineTo(-16 * s, 6 * s - wob * 5);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#5a2a10"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "#f08a2a";
      ctx.beginPath();
      ctx.moveTo(-2 * s, -6.4 * s);
      ctx.quadraticCurveTo(0.8 * s, -9.6 * s, 3.6 * s, -6.2 * s);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#2a1508"; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.fillStyle = "#f08a2a";
      ctx.beginPath(); ctx.ellipse(0, 0, 12 * s, 7.2 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.beginPath(); ctx.ellipse(0, 0, 12 * s, 7.2 * s, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#fff6e8";
      ctx.fillRect(-3.4 * s, -8 * s, 3.5 * s, 16 * s);
      ctx.fillRect(4.1 * s, -8 * s, 2.7 * s, 16 * s);
      ctx.strokeStyle = "#2a1508"; ctx.lineWidth = 1.15;
      ctx.strokeRect(-3.4 * s, -8 * s, 3.5 * s, 16 * s);
      ctx.strokeRect(4.1 * s, -8 * s, 2.7 * s, 16 * s);
      ctx.restore();
      ctx.strokeStyle = "#5a2a10"; ctx.lineWidth = 1.45;
      ctx.beginPath(); ctx.ellipse(0, 0, 12 * s, 7.2 * s, 0, 0, Math.PI * 2); ctx.stroke();
      drawFishEye(s, 6.6, -1.4);
    } else if (sp.id === 1) {
      ctx.fillStyle = "#ffe14a";
      ctx.beginPath();
      ctx.moveTo(-8 * s, 0);
      ctx.lineTo(-17.2 * s, -8.6 * s + wob * 4);
      ctx.lineTo(-13.6 * s, 0);
      ctx.lineTo(-17.2 * s, 8.6 * s - wob * 4);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#c4a010"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "#ffe14a";
      ctx.beginPath();
      ctx.moveTo(-3.5 * s, -8.2 * s);
      ctx.quadraticCurveTo(2 * s, -13.2 * s + wob * 3, 7.2 * s, -8.4 * s);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-3.5 * s, 8.2 * s);
      ctx.quadraticCurveTo(2 * s, 12.6 * s - wob * 3, 6.4 * s, 8.2 * s);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#2f7dff";
      ctx.beginPath(); ctx.ellipse(0.4 * s, 0, 11.2 * s, 10 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.beginPath(); ctx.ellipse(0.4 * s, 0, 11.2 * s, 10 * s, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#16325c";
      ctx.beginPath(); ctx.ellipse(7.6 * s, 0, 5.6 * s, 8.6 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = "#10224a"; ctx.lineWidth = 1.35;
      ctx.beginPath(); ctx.ellipse(0.4 * s, 0, 11.2 * s, 10 * s, 0, 0, Math.PI * 2); ctx.stroke();
      drawFishEye(s, 6.4, -1.2);
    } else if (sp.id === 2) {
      ctx.fillStyle = "#ff8a2b";
      ctx.globalAlpha = 0.88;
      ctx.beginPath();
      ctx.moveTo(-8 * s, 0);
      ctx.quadraticCurveTo(-16 * s, -14 * s + wob * 10, -24 * s, -6 * s);
      ctx.quadraticCurveTo(-17 * s, -2 * s, -11 * s, 0);
      ctx.quadraticCurveTo(-17 * s, 2 * s, -24 * s, 7 * s);
      ctx.quadraticCurveTo(-16 * s, 14 * s - wob * 10, -8 * s, 0);
      ctx.fill();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#ffd27a";
      ctx.beginPath();
      ctx.moveTo(-10 * s, 0);
      ctx.quadraticCurveTo(-18 * s, -8 * s + wob * 6, -22 * s, -2 * s);
      ctx.quadraticCurveTo(-16 * s, 0, -22 * s, 4 * s);
      ctx.quadraticCurveTo(-18 * s, 9 * s - wob * 6, -10 * s, 0);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ff8a2b";
      ctx.beginPath(); ctx.ellipse(1 * s, 0, 11 * s, 8.6 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#7a2e10"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(1 * s, 0, 11 * s, 8.6 * s, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(255,230,160,0.5)";
      ctx.beginPath(); ctx.ellipse(3.2 * s, -1.6 * s, 6 * s, 4 * s, -0.28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd27a";
      ctx.beginPath();
      ctx.moveTo(-1 * s, -7.6 * s);
      ctx.quadraticCurveTo(2.2 * s, -12.2 * s + wob * 4, 5.2 * s, -7.2 * s);
      ctx.fill();
      drawFishEye(s, 7.0, -1.4);
    } else {
      ctx.fillStyle = "#f4f0ea";
      ctx.beginPath();
      ctx.moveTo(-11 * s, 0);
      ctx.lineTo(-20 * s, -7.2 * s + wob * 5);
      ctx.lineTo(-16.2 * s, 0);
      ctx.lineTo(-20 * s, 7.2 * s - wob * 5);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#4a2a22"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "#f4f0ea";
      ctx.beginPath(); ctx.ellipse(0, 0, 14 * s, 6.4 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e23b2f";
      ctx.beginPath(); ctx.ellipse(-4.2 * s, -1.5 * s, 4.7 * s, 3.2 * s, 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e86a2a";
      ctx.beginPath(); ctx.ellipse(4.8 * s, 1.7 * s, 3.5 * s, 2.4 * s, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e23b2f";
      ctx.beginPath(); ctx.ellipse(9.2 * s, -1.15 * s, 2.7 * s, 2.15 * s, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#4a2a22"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(0, 0, 14 * s, 6.4 * s, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#e8d8c8";
      ctx.beginPath();
      ctx.moveTo(-2 * s, -5.8 * s);
      ctx.quadraticCurveTo(2.2 * s, -10.2 * s + wob * 4, 6.2 * s, -5.4 * s);
      ctx.fill();
      drawFishEye(s, 8.4, -1.3);
    }
    ctx.restore();
  }
  function drawPerson(x, y, opt) {
    const bob = Math.sin(opt.bob || 0) * 2.2;
    const walk = Math.sin((opt.bob || 0) * 1.6);
    const squash = 1 + walk * 0.07;
    shadow(x, y + 4, 9, 4);
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(1 / Math.sqrt(Math.max(0.85, squash)), squash);
    ctx.fillStyle = "#3a3a48";
    ctx.fillRect(-6, 8, 4, 8 + walk * 2);
    ctx.fillRect(2, 8, 4, 8 - walk * 2);
    const swing = walk * 6;
    ctx.fillStyle = opt.skin;
    ctx.save(); ctx.translate(-9, -1); ctx.rotate(0.12 + swing * 0.07);
    ctx.fillRect(-2, 0, 3.5, 9); ctx.restore();
    ctx.save(); ctx.translate(9, -1); ctx.rotate(-0.12 - swing * 0.07);
    ctx.fillRect(-1.5, 0, 3.5, 9); ctx.restore();
    ctx.fillStyle = opt.shirt;
    roundRect(-9, -6, 18, 16, 5); ctx.fill();
    if (opt.hawaii) {
      ctx.fillStyle = "#ffd24a"; ctx.beginPath(); ctx.arc(-3, 0, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(4, 3, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e85d4c"; ctx.beginPath(); ctx.arc(2, -2, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = opt.skin;
    ctx.beginPath(); ctx.arc(0, -14, 8, 0, Math.PI * 2); ctx.fill();
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
    } else if (opt.hat) {
      ctx.fillStyle = opt.hat === true ? "#c4483a" : opt.hat;
      ctx.beginPath(); ctx.ellipse(0, -21, 9.5, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(-6.5, -26, 13, 6);
    }
    ctx.fillStyle = "#2a1a12";
    ctx.beginPath(); ctx.arc(-2.4, -14, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2.6, -14, 1.1, 0, Math.PI * 2); ctx.fill();
    if (opt.sunglasses) {
      ctx.fillStyle = "#1a1a22";
      roundRect(-6.4, -16.4, 12.8, 3.6, 1.4); ctx.fill();
      ctx.fillStyle = "#3a4860";
      ctx.fillRect(-5.6, -15.8, 5, 2.4);
      ctx.fillRect(0.6, -15.8, 5, 2.4);
    }
    if (opt.carry >= 0) drawFishBody(SPECIES[opt.carry], 14, -2, 0.2, 0.55, state.time);
    if (opt.emote) {
      const ox = opt.emoteOff || 0;
      const label = String(opt.emote);
      const bw = Math.max(20, label.length * 8 + 10);
      ctx.fillStyle = "rgba(255,255,255,0.94)";
      roundRect(-bw / 2 + ox, -40, bw, 16, 6); ctx.fill();
      ctx.fillStyle = "#2a1a12";
      ctx.font = "800 12px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, ox, -28);
    }
    ctx.restore();
  }
  function drawPlayer(x, y) {
    const bob = Math.sin(player.bob) * 2.4;
    const walk = Math.sin(player.bob * 1.6);
    const swing = Math.sin(player.bob) * 7;
    shadow(x, y + 5, 10, 4.5);
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.fillStyle = "#2a3a48";
    ctx.fillRect(-6, 8, 4.5, 9 + walk * 2);
    ctx.fillRect(1.5, 8, 4.5, 9 - walk * 2);
    ctx.fillStyle = "#f0c2a0";
    ctx.save(); ctx.translate(-10, -1); ctx.rotate(0.16 + swing * 0.07);
    roundRect(-2, 0, 4, 11, 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(10, -1); ctx.rotate(-0.16 - swing * 0.07);
    roundRect(-2, 0, 4, 11, 2); ctx.fill(); ctx.restore();
    ctx.fillStyle = "#2a9d8f";
    roundRect(-10, -7, 20, 17, 5); ctx.fill();
    ctx.fillStyle = "#ffd24a";
    ctx.beginPath(); ctx.arc(-3.2, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e85d4c";
    ctx.beginPath(); ctx.arc(-3.2, 0, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#7ad08a";
    ctx.beginPath(); ctx.ellipse(5.2, 4, 3.4, 1.6, 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath(); ctx.arc(3.2, -2.2, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f0c2a0";
    ctx.beginPath(); ctx.arc(0, -15, 8.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-7.6, -14, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7.6, -14, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3a2415";
    ctx.beginPath(); ctx.arc(0, -18.2, 7.6, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-5.4, -16.2, 3.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5.2, -17, 2.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2a1a12";
    ctx.beginPath(); ctx.arc(-2.6, -14.6, 1.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2.8, -14.6, 1.15, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#c48a6a"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(0, -12.6, 2.1, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.restore();
  }
  function drawDiver(x, y, ang, t) {
    shadow(x, y + 6, 12, 5);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    const kick = Math.sin(t * 11) * 0.42;
    ctx.fillStyle = "#f0b429";
    ctx.strokeStyle = "#8a6a10"; ctx.lineWidth = 1;
    ctx.save(); ctx.rotate(0.2 + kick);
    ctx.beginPath();
    ctx.moveTo(-12, 5); ctx.lineTo(-26, 12); ctx.lineTo(-24, 3); ctx.lineTo(-13, 2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.rotate(-0.2 - kick);
    ctx.beginPath();
    ctx.moveTo(-12, -5); ctx.lineTo(-26, -12); ctx.lineTo(-24, -3); ctx.lineTo(-13, -2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#cfd8e3";
    roundRect(-10, -10, 9, 20, 3); ctx.fill();
    ctx.fillStyle = "#8aa0b5"; ctx.fillRect(-8, -10, 4, 20);
    ctx.fillStyle = "#1b4d6b";
    roundRect(-8, -9, 20, 18, 7); ctx.fill();
    ctx.fillStyle = "#2a9d8f"; ctx.fillRect(-2, -6, 10, 4);
    ctx.fillStyle = "#f0c2a0";
    ctx.beginPath(); ctx.arc(12, 0, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(40,170,210,0.5)";
    ctx.beginPath(); ctx.ellipse(14.5, -0.4, 4.6, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#163040"; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.ellipse(14.5, -0.4, 4.6, 3.6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#e85d4c"; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(16.2, -3); ctx.lineTo(18.4, -12); ctx.lineTo(15.2, -14); ctx.stroke();
    ctx.fillStyle = "#e85d4c";
    ctx.beginPath(); ctx.arc(15.2, -14, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawPot(x, y, leaf, sc) {
    const s = sc || 1;
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
    ctx.fillStyle = "#b07a3a";
    roundRect(x, y, w, h, 3); ctx.fill();
    ctx.strokeStyle = "#7a4e1e"; ctx.lineWidth = 2;
    roundRect(x, y, w, h, 3); ctx.stroke();
    ctx.strokeStyle = "rgba(90,50,16,0.45)";
    ctx.beginPath(); ctx.moveTo(x + 6, y + h / 2); ctx.lineTo(x + w - 6, y + h / 2); ctx.stroke();
    ctx.fillStyle = "#d4a05a";
    ctx.fillRect(x + 4, y + 3, w - 8, 4);
  }
  function drawCrateStack(x, y) {
    drawCrate(x, y, 42, 28);
    drawCrate(x + 10, y - 22, 38, 26);
  }
  function drawLifeRing(x, y) {
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
  function drawBench(x, y) {
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
  }

  // ===== SHOP SCENE =====
  function drawShop() {
    const g = ctx.createLinearGradient(0, 900, 0, SHOP.h);
    g.addColorStop(0, "#2eb7c9"); g.addColorStop(1, "#0d6a86");
    ctx.fillStyle = g; ctx.fillRect(0, 860, SHOP.w, SHOP.h - 860);
    ctx.save(); ctx.globalAlpha = 0.18; ctx.strokeStyle = "#e8ffff"; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const yy = 920 + i * 36 + Math.sin(state.time * 1.2 + i) * 6;
      for (let x = 0; x <= SHOP.w; x += 20) {
        const y = yy + Math.sin(x * 0.02 + state.time * 2 + i) * 5;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
    for (let i = 0; i < 6; i++) {
      const px = 540 + i * 120;
      ctx.fillStyle = "#6b4423"; ctx.fillRect(px, 1000, 16, 80);
      ctx.fillStyle = "#8a5a30"; ctx.fillRect(px, 1000, 6, 80);
    }
    ctx.fillStyle = "#e8d2ae"; ctx.fillRect(80, 70, 1600, 830);
    for (let y = 80; y < 890; y += 28) {
      ctx.fillStyle = (y / 28) % 2 ? "#d8be94" : "#e6cda6";
      ctx.fillRect(90, y, 1580, 26);
      ctx.strokeStyle = "rgba(110,70,30,0.18)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(90, y + 26); ctx.lineTo(1670, y + 26); ctx.stroke();
    }
    ctx.fillStyle = "#f3e6d2";
    ctx.fillRect(80, 70, 1600, 48); ctx.fillRect(80, 70, 36, 830); ctx.fillRect(1644, 70, 36, 830);
    ctx.fillStyle = "#c9a06a"; ctx.fillRect(80, 112, 1600, 8);
    for (let i = 0; i < 22; i++) {
      ctx.fillStyle = i % 2 ? "#e85d4c" : "#fff6e8";
      ctx.fillRect(90 + i * 72, 54, 72, 28);
    }
    ctx.fillStyle = "#c4483a"; ctx.fillRect(80, 50, 1600, 8);
    // teal aisle runner down the center
    ctx.fillStyle = "rgba(32, 168, 168, 0.22)";
    roundRect(802, 318, 156, 560, 18); ctx.fill();
    ctx.strokeStyle = "rgba(80, 220, 210, 0.45)"; ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    roundRect(802, 318, 156, 560, 18); ctx.stroke();
    ctx.setLineDash([]);
    // warm lamp glows along the back wall
    for (const lx of [400, 880, 1360]) {
      const lg = ctx.createRadialGradient(lx, 96, 6, lx, 110, 110);
      lg.addColorStop(0, "rgba(255, 200, 110, 0.38)");
      lg.addColorStop(0.45, "rgba(255, 180, 80, 0.12)");
      lg.addColorStop(1, "rgba(255, 170, 70, 0)");
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.arc(lx, 108, 110, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f0c878";
      ctx.beginPath(); ctx.arc(lx, 88, 6, 0, Math.PI * 2); ctx.fill();
    }
    if (state.unlocked[1]) drawFramedPrint(220, 76, 1);
    if (state.unlocked[2]) drawCoralSouvenir(508, 92);
    if (state.unlocked[3]) drawFramedPrint(1124, 76, 3);
    if (state.unlocked[4]) drawCoralSouvenir(1508, 92);
    if (state.decor && state.decor[0]) drawStringLights();
    for (let y = 890; y < 1020; y += 22) {
      ctx.fillStyle = (y / 22) % 2 ? "#c4a06a" : "#d4b27a";
      ctx.fillRect(500, y, 760, 20);
    }
    ctx.fillStyle = "rgba(80,230,255,0.12)";
    roundRect(DIVE_ZONE.x, DIVE_ZONE.y, DIVE_ZONE.w, DIVE_ZONE.h, 16); ctx.fill();
    ctx.strokeStyle = "rgba(180,255,255,0.35)"; ctx.setLineDash([8, 8]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#1b4d6b";
    roundRect(820, 910, 120, 36, 8); ctx.fill();
    ctx.fillStyle = "#9ef0ff";
    ctx.font = "800 18px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("DIVE", 880, 934);
    if (state.tutorial === 0) {
      const bounce = Math.sin(state.time * 4) * 8;
      ctx.fillStyle = "rgba(255,226,122,0.95)";
      roundRect(800, 860 + bounce, 160, 28, 8); ctx.fill();
      ctx.fillStyle = "#3a2a10";
      ctx.font = "700 14px Nunito, sans-serif";
      ctx.fillText("this way  ↓", 880, 880 + bounce);
    }
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
    drawPot(140, 400, "#4cba6a"); drawPot(1600, 400, "#3aa35a");
    drawPot(168, 780, "#3aa35a", 1.7); drawPot(1588, 780, "#2e8b4a", 1.75);
    drawCrateStack(360, 760);
    drawCrateStack(1288, 748);
    drawBench(1088, 780);
    drawLifeRing(548, 888);
    if (state.decor && state.decor[2]) drawFountain();
    drawBoat();
    // side welcome counter (off the center aisle)
    ctx.fillStyle = "#c45c4a";
    roundRect(188, 668, 156, 86, 12); ctx.fill();
    ctx.fillStyle = "#ead7b4";
    roundRect(198, 678, 136, 66, 8); ctx.fill();
    ctx.fillStyle = "#2a7d8a";
    ctx.font = "700 12px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Welcome to", 266, 706);
    ctx.fillText("the pier", 266, 722);
    drawRegister(); drawKiosk();
    for (let i = 0; i < 5; i++) drawTank(i);
    for (const sw of state.shopSwimmers) {
      drawFishBody(SPECIES[sw.s], sw.x, sw.y, 0.05, 1.15, state.time + sw.ph);
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
    ctx.fillStyle = "#8b5a2b"; roundRect(r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.fillStyle = "#c4894a"; roundRect(r.x + 8, r.y + 8, r.w - 16, 36, 6); ctx.fill();
    ctx.fillStyle = "#1b1b22"; roundRect(r.x + 18, r.y + 14, 70, 22, 4); ctx.fill();
    ctx.fillStyle = "#7dffa0"; ctx.font = "700 12px Nunito, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("$" + state.registerCash, r.x + 24, r.y + 30);
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 13px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("CASHIER", r.x + r.w / 2, r.y + r.h - 14);
    if (state.hiredCashier) {
      drawPerson(r.x + 46, r.y + 20, {
        shirt: "#1b4d6b", hair: "#2a1a12", skin: "#d0a07a",
        bob: state.time * 3.2, hat: "#c4483a", hairCut: 0, carry: -1,
      });
    }
    for (const c of state.coins) {
      const by = c.y + Math.sin(state.time * 4 + c.ph) * 5;
      ctx.fillStyle = "#ffd24a";
      ctx.beginPath(); ctx.ellipse(c.x, by, 11, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#c49210"; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = "#a87410";
      ctx.font = "800 12px Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("$", c.x, by + 4);
    }
    if (state.registerCash > 0 && !nearRect(r.x, r.y, r.w, r.h, 140)) {
      const bounce = Math.abs(Math.sin(state.time * 6)) * 12;
      ctx.fillStyle = "#ffe27a";
      ctx.font = "800 26px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("$", r.x + r.w / 2, r.y - 6 - bounce);
    }
    if (nearRect(r.x, r.y, r.w, r.h, 40) && state.registerCash > 0) {
      ctx.fillStyle = "rgba(255,226,122,0.9)";
      roundRect(r.x - 10, r.y - 34, r.w + 20, 26, 8); ctx.fill();
      ctx.fillStyle = "#3a2a10"; ctx.font = "700 13px Nunito, sans-serif";
      ctx.fillText("Collect  $" + state.registerCash, r.x + r.w / 2, r.y - 16);
    }
  }
  function drawKiosk() {
    const k = KIOSK;
    ctx.fillStyle = "#2a7d8a"; roundRect(k.x, k.y, k.w, k.h, 12); ctx.fill();
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 14px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("UPGRADES", k.x + k.w / 2, k.y + 28);
    ctx.font = "700 12px Nunito, sans-serif";
    ctx.fillText("Spend coins on", k.x + k.w / 2, k.y + 52);
    ctx.fillText("the cards below", k.x + k.w / 2, k.y + 70);
    ctx.fillStyle = "#ffd24a";
    ctx.beginPath(); ctx.arc(k.x + k.w / 2, k.y + 98, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#a87410"; ctx.font = "800 14px Nunito, sans-serif";
    ctx.fillText("$", k.x + k.w / 2, k.y + 103);
  }
  function screenBtnFromWorld(x, y, w, h) {
    const a = worldToScreen(x, y), b = worldToScreen(x + w, y + h);
    return [a.x, a.y, b.x - a.x, b.y - a.y];
  }
  function drawTank(i) {
    const t = TANK_POS[i], sp = SPECIES[i];
    ctx.fillStyle = "#7a4a22";
    roundRect(t.x + 10, t.y + TANK_H - 6, TANK_W - 20, 22, 4); ctx.fill();
    const stocked = state.unlocked[i] && state.stock[i] > 0;
    const water = ctx.createLinearGradient(t.x, t.y, t.x, t.y + TANK_H);
    if (i === 0 && stocked) {
      water.addColorStop(0, "rgba(255,214,150,0.38)");
      water.addColorStop(0.4, "rgba(70,190,200,0.55)");
      water.addColorStop(1, "rgba(28,108,138,0.8)");
    } else {
      water.addColorStop(0, "rgba(170,230,245,0.55)");
      water.addColorStop(1, "rgba(40,130,160,0.7)");
    }
    ctx.fillStyle = "#d8eef5";
    roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.fill();
    ctx.save();
    roundRect(t.x + 4, t.y + 4, TANK_W - 8, TANK_H - 8, 8); ctx.clip();
    ctx.fillStyle = water; ctx.fillRect(t.x, t.y, TANK_W, TANK_H);
    ctx.fillStyle = i === 0 && stocked ? "rgba(210,120,55,0.42)" : "rgba(180,150,90,0.32)";
    ctx.fillRect(t.x, t.y + TANK_H - 22, TANK_W, 18);
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
      for (const f of tankFish[i]) {
        const fx = t.x + 20 + ((f.x + Math.sin(state.time * 1.2 + f.ph) * 10) % (TANK_W - 40) + (TANK_W - 40)) % (TANK_W - 40);
        const fy = t.y + 28 + ((f.y + Math.sin(state.time * 0.8 + f.ph) * 6) % (TANK_H - 50) + (TANK_H - 50)) % (TANK_H - 50);
        const bobY = fy + Math.sin(state.time * 2.2 + f.ph) * 3;
        drawFishBody(sp, fx, bobY, Math.sin(state.time + f.ph) * 0.4, sc, state.time + f.ph);
      }
    }
    const sheen = ctx.createLinearGradient(t.x, t.y, t.x + TANK_W * 0.55, t.y + TANK_H);
    sheen.addColorStop(0, "rgba(255,255,255,0.3)");
    sheen.addColorStop(0.34, "rgba(255,255,255,0.07)");
    sheen.addColorStop(0.35, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.moveTo(t.x + 8, t.y + 6);
    ctx.lineTo(t.x + 50, t.y + 6);
    ctx.lineTo(t.x + 20, t.y + TANK_H - 8);
    ctx.lineTo(t.x + 8, t.y + TANK_H - 8);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    if (state.unlocked[i] && state.bag.some((s) => s === i)) {
      ctx.strokeStyle = "rgba(120,255,210," + (0.45 + 0.35 * Math.sin(state.time * 4)) + ")";
      ctx.lineWidth = 6;
      roundRect(t.x - 3, t.y - 3, TANK_W + 6, TANK_H + 6, 12); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 3;
    roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.stroke();
    ctx.strokeStyle = "rgba(190,235,255,0.5)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(t.x + 10, t.y + 3); ctx.lineTo(t.x + TANK_W - 12, t.y + 3); ctx.stroke();
    if (state.unlocked[i]) {
      ctx.fillStyle = "rgba(30,40,50,0.72)";
      roundRect(t.x + 8, t.y + TANK_H - 32, TANK_W - 16, 24, 6); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "700 12px Nunito, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(sp.name, t.x + 16, t.y + TANK_H - 16);
      ctx.textAlign = "right"; ctx.fillStyle = "#ffe27a";
      ctx.fillText("$" + sp.price, t.x + TANK_W - 16, t.y + TANK_H - 16);
      ctx.fillStyle = "#ff7a3a";
      ctx.beginPath(); ctx.arc(t.x + TANK_W - 8, t.y + 10, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "800 13px Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(String(state.stock[i]), t.x + TANK_W - 8, t.y + 15);
      if (nearRect(t.x, t.y, TANK_W, TANK_H, 36) && state.bag.some((s) => s === i)) {
        ctx.fillStyle = "rgba(80,230,180,0.92)";
        roundRect(t.x + 20, t.y - 30, TANK_W - 40, 24, 8); ctx.fill();
        ctx.fillStyle = "#123"; ctx.font = "700 12px Nunito, sans-serif";
        ctx.fillText("Stock tank", t.x + TANK_W / 2, t.y - 13);
      }
    } else {
      const next = nextLockedTank();
      if (i === next) {
        const affordable = state.money >= sp.unlock;
        const ng = nextGoal();
        const isNextBuy = !!(ng && ng.name === sp.name && affordable);
        const glow = 0.32 + 0.28 * Math.sin(state.time * 4);
        ctx.fillStyle = "rgba(20,24,32,0.55)";
        roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.fill();
        ctx.fillStyle = "rgba(255,186,80," + (0.1 + glow * 0.18) + ")";
        roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.fill();
        ctx.strokeStyle = "rgba(255,180,80," + glow + ")";
        ctx.lineWidth = 6;
        roundRect(t.x - 4, t.y - 4, TANK_W + 8, TANK_H + 8, 12); ctx.stroke();
        ctx.fillStyle = "#fff6e8"; ctx.font = "800 20px Fredoka, sans-serif"; ctx.textAlign = "center";
        ctx.fillText("LOCKED", t.x + TANK_W / 2, t.y + 64);
        ctx.font = "700 14px Nunito, sans-serif";
        ctx.fillStyle = affordable ? "#ffe27a" : "#d0c4b0";
        ctx.fillText("Unlock  $" + sp.unlock, t.x + TANK_W / 2, t.y + 96);
        if (isNextBuy) {
          ctx.strokeStyle = "rgba(255,226,122," + (0.4 + 0.35 * Math.sin(state.time * 6)) + ")";
          ctx.lineWidth = 5;
          roundRect(t.x - 3, t.y - 3, TANK_W + 6, TANK_H + 6, 12); ctx.stroke();
        }
        btn("unlock-" + i, ...screenBtnFromWorld(t.x + 20, t.y + 78, TANK_W - 40, 28));
      } else {
        ctx.fillStyle = "rgba(8,10,16,0.78)";
        roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.fill();
        ctx.save();
        ctx.globalAlpha = 0.35;
        drawFishBody(sp, t.x + TANK_W / 2, t.y + 68, 0, 1.1, state.time + i);
        ctx.restore();
        const lx = t.x + TANK_W / 2, ly = t.y + 104;
        ctx.strokeStyle = "#ffe27a"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(lx, ly - 10, 8, Math.PI, 0); ctx.stroke();
        ctx.fillStyle = "#ffe27a";
        roundRect(lx - 12, ly - 8, 24, 20, 4); ctx.fill();
        ctx.fillStyle = "#3a2a10";
        ctx.beginPath(); ctx.arc(lx, ly + 1, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(lx - 1.5, ly + 1, 3, 7);
      }
    }
    if (state.tankReveal && state.tankReveal.i === i) {
      ctx.fillStyle = "rgba(255,255,255," + (0.55 * (state.tankReveal.life / state.tankReveal.max)) + ")";
      roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.fill();
    }
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
      g.addColorStop(0, "#7ad4e8");
      g.addColorStop(0.12, "#1b8aa8");
      g.addColorStop(0.55, "#0c5d7a");
      g.addColorStop(1, "#06283a");
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, OCEAN.w, OCEAN.h);
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
      for (let i = 0; i < 7; i++) {
        const x = 200 + i * 340 + Math.sin(state.time * 0.3 + i) * 40;
        ctx.fillStyle = "rgba(180,230,255," + (0.04 + 0.02 * Math.sin(state.time + i)) + ")";
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x + 80, 0); ctx.lineTo(x + 280, OCEAN.h); ctx.lineTo(x - 40, OCEAN.h);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = "#c8f4ff"; ctx.lineWidth = 2;
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
    ctx.fillStyle = night ? "rgba(140,180,220,0.12)" : "rgba(200,245,255,0.25)";
    ctx.fillRect(0, 0, OCEAN.w, 170);
    ctx.fillStyle = night ? "rgba(200,220,255,0.08)" : "rgba(255,255,255,0.15)";
    for (let x = 0; x < OCEAN.w; x += 40) {
      const y = 150 + Math.sin(x * 0.04 + state.time * 3) * 8;
      ctx.beginPath(); ctx.ellipse(x, y, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
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
    if (player.y < 280) {
      ctx.globalAlpha = clamp((280 - player.y) / 100, 0, 0.85);
      ctx.fillStyle = "#fff";
      ctx.font = "700 16px Fredoka, Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("SURFACE  ·  swim up and press SPACE", OCEAN.w / 2, 70);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = "#d8c07a";
    ctx.beginPath(); ctx.moveTo(0, OCEAN.h);
    for (let x = 0; x <= OCEAN.w; x += 30) ctx.lineTo(x, OCEAN.h - 54 - Math.sin(x * 0.01) * 16);
    ctx.lineTo(OCEAN.w, OCEAN.h); ctx.closePath(); ctx.fill();
    if (state.unlocked[1]) {
      ctx.fillStyle = "rgba(46, 140, 118, 0.28)";
      ctx.beginPath(); ctx.moveTo(1480, OCEAN.h);
      for (let x = 1480; x <= OCEAN.w; x += 30) ctx.lineTo(x, OCEAN.h - 54 - Math.sin(x * 0.01) * 16);
      ctx.lineTo(OCEAN.w, OCEAN.h); ctx.closePath(); ctx.fill();
    }
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
      drawFishBody(SPECIES[f.s], f.x, f.y, f.ang, SPECIES[f.s].size / 15, state.time + f.ph);
    }
    drawCone();
    drawDiver(player.x, player.y, player.facing, player.bob);
    for (const f of list) {
      if (f === player.target || !fishInCone(f)) continue;
      ctx.fillStyle = "#ffe27a";
      ctx.font = "800 22px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("!", f.x, f.y - 22 + Math.sin(state.time * 8) * 2);
    }
    if (player.target && player.catchProg > 0) {
      const f = player.target, wbar = 52, sp = SPECIES[f.s];
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      roundRect(f.x - wbar / 2, f.y - 38, wbar, 10, 4); ctx.fill();
      ctx.fillStyle = sp.color;
      roundRect(f.x - wbar / 2, f.y - 38, wbar * clamp(player.catchProg, 0, 1), 10, 4); ctx.fill();
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
  }
  function drawCone() {
    const range = coneRange();
    ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.facing);
    const grd = ctx.createRadialGradient(0, 0, 10, 0, 0, range);
    grd.addColorStop(0, "rgba(120,230,255,0.22)");
    grd.addColorStop(1, "rgba(120,230,255,0.02)");
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.arc(0, 0, range, -0.85, 0.85); ctx.closePath(); ctx.fill();
    if (player.target) {
      ctx.strokeStyle = "rgba(255,255,255," + (0.5 + 0.4 * Math.sin(state.time * 9)) + ")";
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = "rgba(180,250,255,0.45)"; ctx.lineWidth = 2;
    }
    ctx.stroke();
    ctx.restore();
  }
  function drawWorld() {
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(cam.z, cam.z);
    ctx.translate(-cam.x, -cam.y);
    if (state.scene === "shop") drawShop(); else drawOcean();
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life / 0.5, 0, 1);
      ctx.fillStyle = p.col;
      ctx.beginPath();
      if (p.kind === "dust") ctx.ellipse(p.x, p.y, p.r, p.r * 0.45, 0, 0, Math.PI * 2);
      else ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const p of pops) {
      ctx.globalAlpha = clamp(p.life, 0, 1);
      ctx.fillStyle = p.col;
      ctx.font = "800 16px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
    for (const c of worldCoins) {
      ctx.fillStyle = "#ffd24a";
      ctx.beginPath(); ctx.ellipse(c.x, c.y, 7, 5.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#c49210"; ctx.stroke();
    }
    ctx.restore();
  }

  // ===== HUD =====
  function nearestOceanFish() {
    let best = null, bestD = 1e9;
    for (const f of oceanFish) {
      if (f.caught) continue;
      const d = Math.hypot(f.x - player.x, f.y - player.y);
      if (d < bestD) { bestD = d; best = f; }
    }
    return best ? { x: best.x, y: best.y } : null;
  }
  function stockableTankTarget() {
    for (let i = 0; i < 5; i++) {
      if (state.unlocked[i] && state.bag.some(s => s === i)) {
        return { x: TANK_POS[i].x + TANK_W / 2, y: TANK_POS[i].y + TANK_H / 2 };
      }
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
  function currentGoal() {
    if (state.scene === "ocean") {
      if (state.bag.length >= bagMax()) {
        return { text: "Bag full — swim up and press SPACE", target: { x: player.x, y: 140 } };
      }
      if (state.expedition) {
        return { text: "Expedition · catch rares, then surface", target: state.bag.length > 0 ? { x: player.x, y: 140 } : nearestOceanFish() };
      }
      if (state.bag.length > 0) {
        return { text: "Nice catch! Grab more, or swim up to stock", target: { x: player.x, y: 140 } };
      }
      return { text: "Point the glowing cone at a fish — hold until the bar fills", target: nearestOceanFish() };
    }
    if (nearBoat() && expeditionUnlocked() && !state.expedition) {
      return { text: "Press SPACE to start an expedition ($35)", target: { x: BOAT.x, y: BOAT.y } };
    }
    if (inDiveZone()) {
      return { text: "Walk to the glowing DIVE dock and press SPACE", target: { x: 880, y: 980 } };
    }
    if (state.bag.some(s => state.unlocked[s])) {
      return { text: "Walk into the glowing tank to stock your catch", target: stockableTankTarget() || { x: 880, y: 980 } };
    }
    if (state.registerCash > 0 && !cashierHandlingIt()) {
      return { text: "Stand on CASHIER to pocket $" + state.registerCash, target: { x: REGISTER.x + REGISTER.w / 2, y: REGISTER.y + REGISTER.h / 2 } };
    }
    const vip = activeVIP();
    if (vip) {
      const want = clamp((vip.want != null ? vip.want : vip.tank) | 0, 0, 4);
      const t = TANK_POS[want];
      return { text: "A VIP wants " + SPECIES[want].name + " — stock that tank", target: { x: t.x + TANK_W / 2, y: t.y + TANK_H / 2 } };
    }
    if (state.money >= 40 && state.tutorial >= 4) {
      if (state.speedLv === 0) {
        return { text: "Tap an upgrade card — Speed is a great first buy", target: null };
      }
      const aff = firstAffordableUp();
      if (aff) {
        const names = { speed: "Speed", bag: "Bag", catch: "Catch", cashier: "Cashier" };
        return { text: "Tap an upgrade card — " + names[aff.id] + " is a good buy", target: null };
      }
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
    ctx.save();
    ctx.translate(ps.x + Math.cos(ang) * dist, ps.y + Math.sin(ang) * dist);
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
  function drawHUD() {
    // money
    ctx.save();
    ctx.translate(16 + 94, 14 + 26);
    ctx.scale(state.moneyPunch, state.moneyPunch);
    ctx.translate(-(16 + 94), -(14 + 26));
    card(16, 14, 188, 52);
    drawCoin(44, 40, 14);
    ctx.fillStyle = "#fff6e8"; ctx.font = "800 26px Nunito, sans-serif"; ctx.textAlign = "left";
    ctx.fillText(String(state.displayMoney), 68, 48);
    ctx.restore();
    const ng = nextGoal();
    if (ng) {
      ctx.fillStyle = "#ffe27a";
      ctx.font = "700 12px Nunito, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Next: " + ng.name + " $" + ng.cost, 20, 80);
    }
    // bag
    ctx.save();
    ctx.translate(214 + 84, 14 + 26);
    ctx.scale(state.bagPunch, state.bagPunch);
    ctx.translate(-(214 + 84), -(14 + 26));
    card(214, 14, 168, 52);
    ctx.fillStyle = "#9ef0ff"; ctx.font = "700 13px Nunito, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("BAG", 228, 34);
    ctx.fillStyle = "#fff"; ctx.font = "800 22px Nunito, sans-serif";
    ctx.fillText(state.bag.length + " / " + bagMax(), 228, 56);
    ctx.restore();
    // bag icons
    if (state.bag.length) {
      card(390, 14, Math.min(36 + state.bag.length * 28, 360), 52);
      for (let i = 0; i < Math.min(state.bag.length, 11); i++) {
        drawFishBody(SPECIES[state.bag[i]], 418 + i * 28, 40, 0, 0.7, state.time + i);
      }
    }
    // goal — stay clear of money / bag (and bag icons)
    const gt = goalText();
    ctx.font = "700 13px Nunito, sans-serif";
    const bagIconsW = state.bag.length ? Math.min(36 + state.bag.length * 28, 360) : 0;
    const leftHud = (state.bag.length ? 390 + bagIconsW : 382) + 10;
    const rightHud = W - 144;
    const maxTw = Math.max(160, rightHud - leftHud);
    const tw = Math.min(ctx.measureText(gt).width + 24, 560, maxTw);
    let gx = W / 2 - tw / 2;
    if (gx < leftHud) gx = leftHud;
    if (gx + tw > rightHud) gx = Math.max(leftHud, rightHud - tw);
    card(gx, 16, tw, 32, "rgba(20, 50, 62, 0.82)");
    ctx.fillStyle = "#e8fbff"; ctx.textAlign = "center";
    ctx.save();
    ctx.beginPath();
    ctx.rect(gx + 6, 16, Math.max(8, tw - 12), 32);
    ctx.clip();
    ctx.fillText(gt, gx + tw / 2, 37);
    ctx.restore();
    // mute + pause
    card(W - 132, 14, 54, 40);
    drawSpeaker(W - 107, 34, state.muted);
    btn("mute", W - 132, 14, 54, 40);
    card(W - 70, 14, 54, 40);
    ctx.fillStyle = "#fff6e8"; ctx.font = "800 18px Nunito, sans-serif";
    ctx.fillText("II", W - 43, 41);
    btn("pause", W - 70, 14, 54, 40);
    drawSpeciesStrip();
    // scene prompts
    if (state.expedition) {
      const sec = Math.max(0, Math.ceil(state.expeditionTime));
      const ss = sec % 60;
      const clock = ((sec / 60) | 0) + ":" + (ss < 10 ? "0" : "") + ss;
      if (state.nightExpedition) {
        card(W / 2 - 92, 54, 184, 28, "rgba(10, 18, 36, 0.92)");
        ctx.fillStyle = sec <= 10 ? "#ff8a7a" : "#9ef0ff";
        ctx.font = "800 15px Nunito, sans-serif"; ctx.textAlign = "center";
        ctx.fillText("NIGHT · " + clock, W / 2, 74);
      } else {
        card(W / 2 - 58, 54, 116, 28, "rgba(20, 50, 62, 0.9)");
        ctx.fillStyle = sec <= 10 ? "#ff8a7a" : "#ffe27a";
        ctx.font = "800 15px Nunito, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(clock, W / 2, 74);
      }
    }
    if (state.scene === "shop" && nearBoat() && expeditionUnlocked()) {
      card(W / 2 - 160, H - 92, 320, 40, "rgba(40, 160, 180, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = "700 16px Fredoka, sans-serif";
      ctx.fillText("SPACE · Expedition $35", W / 2, H - 66);
    } else if (state.scene === "shop" && inDiveZone()) {
      card(W / 2 - 160, H - 92, 320, 40, "rgba(40, 160, 180, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = "700 16px Fredoka, sans-serif";
      ctx.fillText("SPACE  or  click  to  DIVE", W / 2, H - 66);
    }
    if (state.scene === "ocean" && player.y < 280) {
      ctx.globalAlpha = clamp((280 - player.y) / 80, 0, 1);
      card(W / 2 - 170, H - 92, 340, 40, "rgba(40, 160, 180, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = "700 16px Fredoka, sans-serif";
      ctx.fillText("SPACE  or  click  to  SURFACE", W / 2, H - 66);
      ctx.globalAlpha = 1;
    }
    if (state.scene === "ocean" && state.bag.length >= bagMax()) {
      const by = state.expedition ? 90 : 64;
      card(W / 2 - 140, by, 280, 32, "rgba(255, 140, 60, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = "700 14px Nunito, sans-serif";
      ctx.fillText("Bag full — head to the surface!", W / 2, by + 22);
    }
    // toasts
    let ty = state.expedition ? 90 : 78;
    for (const t of state.toasts) {
      ctx.globalAlpha = clamp(t.life, 0, 1);
      card(W / 2 - 180, ty, 360, 30, "rgba(20,30,40,0.8)");
      ctx.fillStyle = t.col; ctx.font = "700 14px Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(t.msg, W / 2, ty + 20);
      ctx.globalAlpha = 1;
      ty += 36;
    }
    for (const fl of flyers) {
      ctx.globalAlpha = clamp(fl.life / 0.2, 0, 1);
      drawFishBody(SPECIES[fl.s], fl.x, fl.y, 0.2, 0.85, state.time);
      ctx.globalAlpha = 1;
    }
    for (const c of hudCoins) {
      if (c.drawX == null) continue;
      ctx.globalAlpha = clamp(c.life / 0.12, 0, 1);
      drawCoin(c.drawX, c.drawY, 8);
      ctx.globalAlpha = 1;
    }
    drawGuideArrow();
    if (shopBarsReady()) {
      const nearK = nearRect(KIOSK.x, KIOSK.y, KIOSK.w, KIOSK.h, 90);
      if (nearK) {
        ctx.strokeStyle = "rgba(255,226,122," + (0.35 + 0.3 * Math.sin(state.time * 5)) + ")";
        ctx.lineWidth = 3;
        const barW = decorHudReady() ? 854 : 720;
        roundRect(16, H - 92, barW, 84, 12); ctx.stroke();
      }
      drawUpgradeBar();
      if (decorHudReady()) drawDecorBar();
    }
    if (state.comboPop) {
      const u = clamp(state.comboPop.life / state.comboPop.max, 0, 1);
      const t = 1 - u;
      const a = t < 0.12 ? t / 0.12 : t > 0.65 ? (1 - t) / 0.35 : 1;
      const sc = 0.92 + u * 0.28;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(W / 2, H * 0.42);
      ctx.scale(sc, sc);
      ctx.fillStyle = "rgba(8,16,24,0.35)";
      ctx.font = "800 58px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(state.comboPop.text, 2, 4);
      ctx.fillStyle = state.comboPop.col;
      ctx.fillText(state.comboPop.text, 0, 0);
      ctx.restore();
    }
    if (state.unlockBanner) {
      const u = clamp(state.unlockBanner.life / 0.9, 0, 1);
      const a = u > 0.75 ? (1 - u) / 0.25 : u < 0.2 ? u / 0.2 : 1;
      const midY = 108 + (H - 220) / 2;
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(8, 16, 24, 0.62)";
      ctx.fillRect(0, midY - 44, W, 88);
      ctx.fillStyle = state.unlockBanner.color;
      ctx.font = "800 42px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(state.unlockBanner.name.toUpperCase() + " UNLOCKED", W / 2, midY + 14);
      ctx.globalAlpha = 1;
    }
    if (state.flash > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(0, 0, W, H);
    }
  }
  function upCard(id, x, y, title, sub, cost, maxed, can, pulse) {
    const w = 168;
    const fill = maxed ? "rgba(40,70,60,0.85)" : can ? "rgba(28, 58, 52, 0.9)" : "rgba(40, 32, 28, 0.82)";
    card(x, y, w, 64, fill);
    if (pulse) {
      ctx.strokeStyle = "rgba(255,226,122," + (0.45 + 0.35 * Math.sin(state.time * 6)) + ")";
      ctx.lineWidth = 3;
      roundRect(x, y, w, 64, 12); ctx.stroke();
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 13px Fredoka, sans-serif";
    ctx.fillText(title, x + 10, y + 24);
    ctx.fillStyle = "#c8e8ee"; ctx.font = "700 11px Nunito, sans-serif";
    ctx.fillText(sub, x + 10, y + 44);
    ctx.textAlign = "right";
    ctx.fillStyle = maxed ? "#8fd" : can ? "#ffe27a" : "#c4b8a4";
    ctx.font = "800 13px Nunito, sans-serif";
    ctx.fillText(maxed ? "MAX" : "$" + cost, x + w - 10, y + 36);
    if (!maxed) btn(id, x, y, w, 64);
  }
  function drawUpgradeBar() {
    const y = H - 84;
    card(16, y - 8, 720, 76, "rgba(12, 28, 36, 0.72)");
    const sMax = state.speedLv >= SPEED_COST.length;
    const bMax = state.bagLv >= BAG_COST.length;
    const cMax = state.catchLv >= CATCH_COST.length;
    const sc = sMax ? 0 : SPEED_COST[state.speedLv];
    const bc = bMax ? 0 : BAG_COST[state.bagLv];
    const cc = cMax ? 0 : CATCH_COST[state.catchLv];
    const aff = firstAffordableUp();
    upCard("up-speed", 24, y, "Speed  Lv " + (state.speedLv + 1), "Walk & swim faster", sc, sMax, !sMax && state.money >= sc, aff && aff.id === "speed");
    upCard("up-bag", 200, y, "Bag  " + bagMax() + "/20", "Carry more fish", bc, bMax, !bMax && state.money >= bc, aff && aff.id === "bag");
    upCard("up-catch", 376, y, "Catch  Lv " + (state.catchLv + 1), "Fill the meter faster", cc, cMax, !cMax && state.money >= cc, aff && aff.id === "catch");
    upCard("up-cashier", 552, y, "Cashier", state.hiredCashier ? "Collects while you dive" : "Hire front-desk help", CASHIER_COST, state.hiredCashier, !state.hiredCashier && state.money >= CASHIER_COST, aff && aff.id === "cashier");
  }
  function drawDecorBar() {
    const chipX = 744, chipY = H - 84, chipW = 118, chipH = 64;
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
    for (let i = 0; i < 3; i++) {
      const x = chipX;
      const y = chipY - 8 - (3 - i) * (ph + 6);
      const owned = !!dec[i];
      const cost = DECOR_COST[i];
      const can = !owned && state.money >= cost;
      const fill = owned ? "rgba(40,70,60,0.92)" : can ? "rgba(28, 58, 52, 0.94)" : "rgba(40, 32, 28, 0.92)";
      card(x, y, pw, ph, fill);
      ctx.textAlign = "left";
      ctx.fillStyle = "#fff6e8";
      ctx.font = "700 13px Fredoka, sans-serif";
      ctx.fillText(labels[i], x + 10, y + 20);
      ctx.fillStyle = "#c8e8ee";
      ctx.font = "700 10px Nunito, sans-serif";
      ctx.fillText(owned ? "Installed" : "Pier decor", x + 10, y + 36);
      ctx.textAlign = "right";
      ctx.fillStyle = owned ? "#8fd" : can ? "#ffe27a" : "#c4b8a4";
      ctx.font = "800 13px Nunito, sans-serif";
      ctx.fillText(owned ? "OWNED" : "$" + cost, x + pw - 10, y + 30);
      if (!owned) btn("decor-" + i, x, y, pw, ph);
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
  function drawTitle() {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#7ad4e8"); bg.addColorStop(0.45, "#1b8aa8"); bg.addColorStop(1, "#0a3a4a");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = "rgba(255,255,255," + (0.04 + 0.02 * Math.sin(state.time + i)) + ")";
      ctx.beginPath();
      const x = 80 + i * 210;
      ctx.moveTo(x, 0); ctx.lineTo(x + 70, 0); ctx.lineTo(x + 200, H); ctx.lineTo(x - 30, H); ctx.fill();
    }
    const tf = [
      { s: 0, x: 200, y: 400, a: 0.35, ax: 42, ay: 12, sc: 1.7 },
      { s: 1, x: 1060, y: 490, a: 0.28, ax: 38, ay: 11, sc: 1.6 },
      { s: 2, x: 380, y: 560, a: 0.24, ax: 48, ay: 13, sc: 1.55 },
      { s: 3, x: 940, y: 340, a: 0.22, ax: 40, ay: 10, sc: 1.65 },
      { s: 4, x: 640, y: 610, a: 0.18, ax: 32, ay: 8, sc: 1.8 },
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
    card(W / 2 - 280, 120, 560, 180, "rgba(12, 28, 36, 0.72)");
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 64px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("AQUA BAY", W / 2, 200);
    ctx.fillStyle = "#9ef0ff"; ctx.font = "700 20px Nunito, sans-serif";
    ctx.fillText("Run a sunny pier aquarium", W / 2, 248);
    const pulse = 1 + Math.sin(state.time * 3) * 0.035;
    if (state.hasSave) {
      panelBtn("continue", W / 2 - 150, 360, 300, 56, "Continue", null, pulse);
      panelBtn("play", W / 2 - 150, 432, 300, 48, "New Game", "#3d6f7a");
    } else {
      panelBtn("play", W / 2 - 150, 380, 300, 56, "Play", null, pulse);
    }
  }
  function drawPause() {
    ctx.fillStyle = "rgba(6, 16, 22, 0.62)"; ctx.fillRect(0, 0, W, H);
    if (state.mode === "help") {
      card(W / 2 - 250, 72, 500, 576, "rgba(16, 32, 42, 0.94)");
      ctx.fillStyle = "#fff6e8"; ctx.font = "700 32px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("How to play", W / 2, 122);
      ctx.fillStyle = "#e8f4f8"; ctx.font = "600 15px Nunito, sans-serif"; ctx.textAlign = "left";
      const lines = [
        "WASD or Arrows — move  ·  hold mouse to steer",
        "SPACE / click at the dock — dive",
        "Keep a fish in the glowing cone to catch it",
        "Walk into a matching tank — stock",
        "Stand on cashier — collect cash",
        "Click upgrade cards to spend coins",
        "Hire a cashier — they collect while you dive",
        "SPACE at the boat — $35 timed expedition",
        "Every 3rd expedition is a night dive (rares)",
        "Tap the fish strip — collection book",
        "Decor chip — lights, sign, fountain",
        "Mute button — sound on/off",
        "Esc — pause / resume",
      ];
      lines.forEach((ln, i) => ctx.fillText(ln, W / 2 - 210, 158 + i * 28));
      ctx.fillStyle = "#8ab"; ctx.font = "600 12px Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Inspired by the aquarium-tycoon genre", W / 2, 534);
      panelBtn("back", W / 2 - 110, 556, 220, 48, "Back");
    } else {
      card(W / 2 - 240, 110, 480, 500, "rgba(16, 32, 42, 0.94)");
      ctx.fillStyle = "#fff6e8"; ctx.font = "700 36px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Paused", W / 2, 168);
      ctx.fillStyle = "#c8e8ee"; ctx.font = "600 15px Nunito, sans-serif";
      ctx.fillText("A sunny little pier mart of your own.", W / 2, 210);
      panelBtn("resume", W / 2 - 140, 250, 280, 52, "Resume");
      panelBtn("help", W / 2 - 140, 318, 280, 48, "Help", "#2a7d8a");
      panelBtn("mute", W / 2 - 140, 382, 280, 48, state.muted ? "Sound Off" : "Sound On", "#3d6f7a");
      panelBtn("reset", W / 2 - 140, 446, 280, 48, "New Game", "#a84a3a");
      ctx.fillStyle = "#8ab"; ctx.font = "600 12px Nunito, sans-serif";
      ctx.fillText("Inspired by the aquarium-tycoon genre", W / 2, 516);
      ctx.fillText("Esc to resume", W / 2, 538);
    }
    ctx.fillStyle = "rgba(200,220,230,0.42)";
    ctx.font = "600 11px Nunito, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Aqua Bay · loop 9", W - 16, H - 14);
  }

  function drawSpeciesStrip() {
    for (let i = 0; i < 5; i++) {
      const x = W - 78, y = 68 + i * 50;
      card(x, y, 62, 44, state.unlocked[i] ? "rgba(18,40,48,0.8)" : "rgba(20,20,24,0.7)");
      if (state.bookOpen === i) {
        ctx.strokeStyle = "rgba(255,226,122," + (0.55 + 0.25 * Math.sin(state.time * 6)) + ")";
        ctx.lineWidth = 2.4;
        roundRect(x, y, 62, 44, 12); ctx.stroke();
      }
      if (state.unlocked[i]) drawFishBody(SPECIES[i], x + 31, y + 22, 0, 0.85, state.time + i);
      else {
        const showPrice = i === nextLockedTank();
        ctx.fillStyle = "#8a8074"; ctx.font = "700 14px Nunito, sans-serif"; ctx.textAlign = "center";
        ctx.fillText("?", x + 31, y + (showPrice ? 20 : 27));
        if (showPrice) {
          ctx.fillStyle = "#ffe27a"; ctx.font = "700 10px Nunito, sans-serif";
          ctx.fillText("$" + SPECIES[i].unlock, x + 31, y + 36);
        }
      }
      btn("book-" + i, x, y, 62, 44);
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
      ctx.fillStyle = "#8a8074";
      ctx.font = "700 28px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("???", W / 2, py + 198);
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
  function applyFade(dt) {
    if (!state.fadeDir) return;
    state.fade += state.fadeDir * dt * 2.4;
    if (state.fadeDir > 0 && state.fade >= 1) {
      state.fade = 1;
      if (state.pendingScene === "ocean") {
        state.scene = "ocean";
        if (state.expedition) {
          player.x = 2200; player.y = 1600; player.vx = 0; player.vy = 20;
          state.expeditionTime = EXPEDITION_SECS;
        } else {
          player.x = OCEAN.w / 2; player.y = 260; player.vx = 0; player.vy = 40;
        }
        state.diveCatches = 0;
        state.bagBonus = 1;
        state.splash = { x: player.x, y: player.y + 8, life: 0.45, max: 0.45 };
        bubbles.length = 0;
        for (let i = 0; i < 18 && bubbles.length < 40; i++) {
          const a = (i / 18) * Math.PI * 2 + rand(-0.2, 0.2);
          bubbles.push({
            x: player.x + Math.cos(a) * rand(8, 36),
            y: player.y + Math.sin(a) * rand(4, 18),
            r: rand(2, 5), v: rand(36, 70), ph: rand(0, 8),
          });
        }
        cam.z = 1.28;
        state.camPunch = 0.16;
        if (state.expedition) seedExpeditionPocket();
        else seedFrontSchool();
        ensureOceanStock();
      } else if (state.pendingScene === "shop") {
        state.scene = "shop";
        if (state.expedition) {
          player.x = 1188; player.y = 1000; player.vx = 0; player.vy = -30;
          toast("Expedition complete", "#ffe27a");
          state.expedition = false;
          state.expeditionTime = 0;
          state.nightExpedition = false;
        } else {
          player.x = 880; player.y = 1000; player.vx = 0; player.vy = -40;
        }
        state.diveCatches = 0;
      }
      state.pendingScene = null; state.fadeDir = -1;
    }
    if (state.fadeDir < 0 && state.fade <= 0) { state.fade = 0; state.fadeDir = 0; }
  }
  function updateCam(dt) {
    const tz = state.scene === "ocean" ? 1.12 : 1.00;
    cam.z = lerp(cam.z, tz, 1 - Math.pow(0.001, dt));
    if (state.camPunch > 0) {
      cam.z *= 1.08;
      state.camPunch = Math.max(0, state.camPunch - dt);
    }
    const look = state.scene === "ocean" ? 80 : 40;
    const ww = state.scene === "shop" ? SHOP.w : OCEAN.w;
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
    const tx = player.x + lx;
    const ty = player.y + ly;
    cam.x = lerp(cam.x, tx, 1 - Math.pow(0.0008, dt));
    cam.y = lerp(cam.y, ty, 1 - Math.pow(0.0008, dt));
    cam.x = clamp(cam.x, minX, maxX);
    cam.y = clamp(cam.y, minY, maxY);
  }
  let last = performance.now();
  function frame(now) {
    const dt = clamp((now - last) / 1000, 0, 0.05);
    last = now;
    state.time += dt;
    uiHits = [];
    tickMusic(dt);
    if (state.mode === "title") {
      updateTitleFX(dt);
      drawTitle();
    } else {
      if (state.mode === "play") {
        if (state.hitStop > 0) state.hitStop = Math.max(0, state.hitStop - dt);
        const sim = state.hitStop > 0 ? 0 : dt;
        updatePlayer(sim);
        if (state.scene === "ocean") { updateOceanFish(sim); updateCatch(sim); updateReefPresence(); }
        else { updateShopInteract(); updateCustomers(sim); }
        if (state.expedition && state.scene === "ocean" && !state.fadeDir) {
          state.expeditionTime -= sim;
          if (state.expeditionTime <= 0) beginSurface();
        }
        updateCashier(sim);
        updateFX(dt);
        applyFade(dt);
        updateCam(dt);
        if (state.time % 5 < dt) persist();
      } else {
        updateCam(dt);
      }
      drawWorld();
      drawHUD();
      if (state.mode === "pause" || state.mode === "help") drawPause();
      drawCollectionBook();
      if (state.fade > 0) {
        ctx.fillStyle = "rgba(8, 40, 52," + state.fade + ")";
        ctx.fillRect(0, 0, W, H);
      }
    }
    requestAnimationFrame(frame);
  }
  loadSave();
  seedOcean();
  for (let i = 0; i < 16; i++) {
    titleBubbles.push({ x: rand(30, W - 30), y: rand(40, H + 20), r: rand(2, 6), v: rand(36, 88), ph: rand(0, 8) });
  }
  requestAnimationFrame(frame);
})();
