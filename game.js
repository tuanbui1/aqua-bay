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
  const SHIRTS = ["#e85d4c", "#3d8bfd", "#f0b429", "#7ad08a", "#c86bde", "#f2789f", "#5ec8c0"];
  const CUST_NAMES = ["Maya", "Nico", "Jun", "Sable", "Rio", "Piper", "Eden", "Wren"];

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
    missionStep: 0, missionDone: false, caughtRare: false,
    bagRare: [], stockRare: [0, 0, 0, 0, 0],
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
  };
  const player = { x: 880, y: 920, vx: 0, vy: 0, facing: 0, bob: 0, catchProg: 0, target: null, radius: 16, goto: null, walkPhase: 0, lean: 0 };
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
  const dockTeasers = [];
  const hudPops = [];
  const keys = new Set();
  const mouse = { x: W / 2, y: H / 2, down: false, ui: false, held: 0, acted: false, pressX: 0, pressY: 0 };
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
      tone(659, 0.055, "square", 0.06, 880);
      setTimeout(() => { if (!state.muted) tone(880, 0.07, "triangle", 0.07); }, 50);
      setTimeout(() => { if (!state.muted) tone(1175, 0.08, "sine", 0.06); }, 105);
      setTimeout(() => { if (!state.muted) tone(1568, 0.1, "triangle", 0.05); }, 165);
    } else if (kind === "cashin") {
      tone(523, 0.06, "triangle", 0.07);
      setTimeout(() => { if (!state.muted) tone(784, 0.07, "square", 0.06, 1175); }, 45);
      setTimeout(() => { if (!state.muted) tone(1046, 0.1, "sine", 0.055); }, 100);
    } else if (kind === "tang") {
      tone(494, 0.07, "sine", 0.07, 740);
      setTimeout(() => { if (!state.muted) tone(740, 0.08, "triangle", 0.07); }, 70);
      setTimeout(() => { if (!state.muted) tone(988, 0.1, "sine", 0.065); }, 150);
      setTimeout(() => { if (!state.muted) tone(1480, 0.12, "triangle", 0.05); }, 240);
    }
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
      missionStep: 0, missionDone: false, caughtRare: false,
      bagRare: [], stockRare: [0, 0, 0, 0, 0],
      sessionGoals: [], sessionGoalDone: [], sessionSales: 0,
      sessionCaughtRare: false, sessionBoat: false,
      bookOpened: false, bookTeaseShown: false, sawBookTease: false,
      pendingBookTease: false,
      didFirstStock: false, didFirstSale: false,
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
        missionStep: d.missionStep | 0,
        missionDone: !!d.missionDone,
        caughtRare: !!d.caughtRare,
        bagRare: Array.isArray(d.bag) ? d.bag.map((_, i) => !!(d.bagRare && d.bagRare[i])) : [],
        stockRare: Array.isArray(d.stockRare) ? [0, 1, 2, 3, 4].map(i => d.stockRare[i] | 0) : [0, 0, 0, 0, 0],
        sessionGoals: Array.isArray(d.sessionGoals) ? d.sessionGoals.slice(0, 3) : [],
        sessionGoalDone: Array.isArray(d.sessionGoalDone) ? d.sessionGoalDone.slice() : [],
        sessionSales: d.sessionSales | 0,
        sessionCaughtRare: !!d.sessionCaughtRare,
        sessionBoat: !!d.sessionBoat,
        bookOpened: !!d.bookOpened,
        bookTeaseShown: !!d.bookTeaseShown,
        sawBookTease: !!d.sawBookTease,
        pendingBookTease: !!d.pendingBookTease,
        didFirstStock: !!(d.didFirstStock || (Array.isArray(d.stock) && d.stock.some(n => (n | 0) > 0))),
        didFirstSale: !!(d.didFirstSale || d.didFirstCollect || (d.money | 0) > 0),
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
        missionStep: state.missionStep | 0,
        missionDone: !!state.missionDone,
        caughtRare: !!state.caughtRare,
        bagRare: state.bagRare || [],
        stockRare: state.stockRare || [0, 0, 0, 0, 0],
        sessionGoals: state.sessionGoals || [],
        sessionGoalDone: state.sessionGoalDone || [],
        sessionSales: state.sessionSales | 0,
        sessionCaughtRare: !!state.sessionCaughtRare,
        sessionBoat: !!state.sessionBoat,
        bookOpened: !!state.bookOpened,
        bookTeaseShown: !!state.bookTeaseShown,
        sawBookTease: !!state.sawBookTease,
        pendingBookTease: !!state.pendingBookTease,
        didFirstStock: !!state.didFirstStock,
        didFirstSale: !!state.didFirstSale,
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
      decor: [false, false, false], expeditionCount: 0, nightExpedition: false, decorOpen: false,
      missionStep: 0, missionDone: false, caughtRare: false,
      bagRare: [], stockRare: [0, 0, 0, 0, 0],
      diveLock: 0, surfaceLock: 0, didMove: false, shinyCallout: 0, shinyFocus: 0,
      sessionGoals: [], sessionGoalDone: [], sessionSales: 0,
      sessionCaughtRare: false, sessionBoat: false,
      bookOpened: false, bookTeaseShown: false, sawBookTease: false,
      pendingBookTease: false, bookTeaseWait: 0,
      didFirstStock: false, didFirstSale: false,
      shinyHold: 0, shinyHoldName: "",
      boatHint: 0, boatGlance: 0,
      coneFlash: 0, registerPunch: 1, tankShake: null, cardShake: null, priceFlash: null, nopeFlash: 0,
      catchClimax: null, divesThisSession: 0, tangRumor: false, freezeFrame: 0 });
    state.hasSave = false;
    player.x = 880; player.y = 920; player.vx = 0; player.vy = 0; player.catchProg = 0; player.target = null; player.goto = null; player.walkPhase = 0; player.lean = 0;
    cam.x = 880; cam.y = 920; cam.z = 1;
    customers.length = 0; oceanFish.length = 0; particles.length = 0; pops.length = 0; bubbles.length = 0;
    flyers.length = 0; hudCoins.length = 0; worldCoins.length = 0; hudPops.length = 0;
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
  function walkSpeed() {
    // First-session dock↔tank is the dead stretch. A small free bump until Speed is bought.
    const firstBump = (state.speedLv === 0 && !state.missionDone) ? 24 : 0;
    return 232 + state.speedLv * 38 + firstBump;
  }
  function aisleMidX() { return AISLE.x + AISLE.w / 2; }
  function confineShopSwimmer(sw) {
    const pad = 22;
    const top = AISLE.y + pad;
    const bot = AISLE.y + AISLE.h - pad;
    sw.x = aisleMidX() + Math.sin(state.time * 1.55 + sw.ph) * (AISLE.w * 0.26);
    sw.y = clamp(sw.y, top, bot);
  }
  function swimSpeed() { return 215 + state.speedLv * 42; }
  function catchTime() { return (state.lifetimeCatches < 3 ? 0.42 : 0.55) / (1 + 0.24 * state.catchLv); }
  function coneRange() { return 200 + state.catchLv * 8; }
  function toast(msg, col, life, opts) {
    const t = { msg, col: col || "#fff6d2", life: life == null ? 2.2 : life };
    if (opts && typeof opts === "object") {
      t.big = !!opts.big;
      t.kind = opts.kind || "";
    }
    state.toasts.push(t);
  }
  function pop(x, y, text, col, life, scale) {
    pops.push({ x, y, text, col: col || "#ffe27a", life: life || 1, vy: -42, scale: scale || 1 });
  }
  function hudPop(text, col, x, y, life) {
    const scr = (x != null && y != null) ? worldToScreen(x, y) : { x: W / 2, y: 168 };
    const minX = (missionVisible() || sessionChipVisible()) ? 280 : 210;
    const minY = 92;
    hudPops.push({
      text, col: col || "#ffe27a",
      x: clamp(scr.x, minX, W - 210),
      y: clamp(scr.y, minY, H - 150),
      life: life == null ? 2.4 : life,
      max: life == null ? 2.4 : life,
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
  function playSale(who, speciesName, pay, wx, wy, first) {
    pop(wx, wy - 10, "+$" + pay, "#ffe27a", first ? 2.2 : 1.9, first ? 2.55 : 2.15);
    if (who && (who === "Maya" || who === "Nico")) {
      pop(wx, wy - 42, who, "#fff6e8", 1.15, 0.95);
    }
    state.registerPunch = first ? 1.48 : 1.36;
  }
  function expeditionUnlocked() { return !!state.unlocked[1] || (state.peakMoney | 0) >= 60; }
  function nearBoat() {
    return state.scene === "shop" && Math.hypot(player.x - BOAT.x, player.y - BOAT.y) < 78;
  }
  function boughtAnUpgrade() {
    return (state.speedLv | 0) > 0 || (state.bagLv | 0) > 0 || (state.catchLv | 0) > 0 || !!state.hiredCashier;
  }
  function shopBarsReady() {
    return state.scene === "shop" && !inDiveZone() && player.y < 840 && (state.tutorial >= 5 || state.money >= 25);
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
    return false;
  }
  function rollSessionGoals() {
    if (!state.missionDone) return;
    const pool = [];
    if (!state.unlocked[1]) pool.push("tang");
    if (!state.caughtRare) pool.push("shiny");
    if (!state.hiredCashier) pool.push("cashier");
    pool.push("serve");
    if ((state.speedLv | 0) === 0) pool.push("speed");
    if (expeditionUnlocked() && (state.expeditionCount | 0) === 0) pool.push("boat");
    if (state.unlocked[1] && !state.sawReef) pool.push("reef");
    state.sessionGoals = pool.slice(0, 3);
    state.sessionGoalDone = [];
    state.sessionSales = 0;
    state.sessionCaughtRare = false;
    state.sessionBoat = false;
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
  }
  function spawnP(x, y, n, cols, spread) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = rand(20, spread || 90);
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: rand(0.35, 0.8), r: rand(2, 5), col: pick(cols) });
    }
  }
  function beatMoment(kind, x, y) {
    const specs = {
      catch: { stop: 0.07, punch: 0.11, n: 20, cols: ["#fff6e8", "#ffe27a", "#9ef0ff"], spread: 160, sfx: "catch" },
      shiny: { stop: 0.13, punch: 0.22, n: 34, cols: ["#ffd24a", "#fff6e8", "#ffe27a"], spread: 270, sfx: "shiny" },
      sale: { stop: 0.05, punch: 0.09, n: 14, cols: ["#ffe27a", "#ffd24a", "#fff6e8"], spread: 110, sfx: "sale" },
      firstsale: { stop: 0.12, punch: 0.18, n: 28, cols: ["#ffe27a", "#ffd24a", "#fff"], spread: 190, sfx: "firstsale" },
      cashin: { stop: 0.1, punch: 0.16, n: 24, cols: ["#ffe27a", "#ffd24a", "#fff6e8"], spread: 150, sfx: "cashin" },
      tang: { stop: 0.15, punch: 0.24, n: 38, cols: ["#2f7dff", "#ffe14a", "#fff6e8"], spread: 230, sfx: "tang" },
    };
    const s = specs[kind] || specs.catch;
    state.hitStop = Math.max(state.hitStop || 0, s.stop);
    state.freezeFrame = Math.max(state.freezeFrame || 0, s.stop + 0.04);
    state.camPunch = Math.max(state.camPunch || 0, s.punch);
    if (x != null && y != null) spawnP(x, y, s.n, s.cols, s.spread);
    sfx(s.sfx);
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
  function unusedName() {
    const used = new Set(customers.map((c) => c.name));
    const pool = CUST_NAMES.filter((n) => !used.has(n));
    return pick(pool.length ? pool : CUST_NAMES);
  }
  function newCustomer(extra) {
    return Object.assign({
      x: rand(700, 1060), y: 1040, vx: 0, vy: 0,
      shirt: pick(SHIRTS), hair: pick(["#3a2415", "#1b1b1b", "#8a4a1a", "#d8c07a"]),
      skin: pick(["#f0c2a0", "#d0a07a", "#8d5a3a", "#f3d3b4"]),
      state: "tank", tank: 0, carry: -1, bob: rand(0, 8), wait: 0,
      emote: "", emoteOff: ((customers.length % 5) - 2) * 11,
      hat: Math.random() < 0.33, hairCut: (Math.random() * 3) | 0, offX: 0,
      name: unusedName(),
    }, extra);
  }
  function seedLivingPier() {
    if (customers.length > 0) return;
    customers.push(newCustomer({
      x: 880, y: 1100, state: "browse", tank: 0, hops: 10, offX: 0,
      name: "Maya", regular: true, favorite: 0, hawaii: true, hat: "#e8c04a",
      shirt: "#1b6b5a", hair: "#3a2415", hairCut: 1, emote: "hi!",
    }));
    customers.push(newCustomer({
      x: 760, y: 1068, state: "browse", tank: 0, hops: 4, offX: -24,
      emote: "!",
    }));
    customers.push(newCustomer({
      x: 980, y: 1084, state: "browse", tank: 1, hops: 5, offX: 20,
      emote: "Blue Tang?", teaseTang: true,
    }));
  }
  function seedDockTeasers() {
    if (dockTeasers.length) return;
    dockTeasers.push({ s: 1, x: -50, y: 1148, vx: 40, ph: 0.4 });
    dockTeasers.push({ s: 1, x: 520, y: 1204, vx: 32, ph: 2.1 });
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
    return { x: (ev.clientX - r.left) * (W / r.width), y: (ev.clientY - r.top) * (H / r.height) };
  }
  canvas.addEventListener("pointerdown", (e) => {
    const p = canvasPos(e);
    mouse.x = p.x; mouse.y = p.y; mouse.down = true; mouse.ui = false;
    mouse.held = 0; mouse.acted = false; mouse.pressX = p.x; mouse.pressY = p.y;
    audio();
    const hit = hitUI(p.x, p.y);
    if (hit) { mouse.ui = true; mouse.acted = true; onUI(hit); return; }
    if (state.mode === "play") {
      if (state.scene === "ocean" && bagIsFull() && !state.fadeDir) {
        mouse.acted = true; player.goto = null; beginSurface(); return;
      }
      if (tryAction()) { mouse.acted = true; player.goto = null; return; }
    }
  });
  canvas.addEventListener("pointermove", (e) => { const p = canvasPos(e); mouse.x = p.x; mouse.y = p.y; });
  canvas.addEventListener("pointerup", () => {
    if (state.mode === "play" && !mouse.ui && !mouse.acted && mouse.held < 0.22) {
      if (!(state.scene === "ocean" && bagIsFull())) {
        const w = screenToWorld(mouse.pressX, mouse.pressY);
        player.goto = clickWalkTarget(w.x, w.y);
      }
    }
    mouse.down = false; mouse.ui = false; mouse.held = 0; mouse.acted = false;
  });
  canvas.addEventListener("pointerleave", () => { mouse.down = false; mouse.held = 0; });
  function tankAtWorld(wx, wy) {
    for (let i = 0; i < 5; i++) {
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
      const inDock = wx > DIVE_ZONE.x - 30 && wx < DIVE_ZONE.x + DIVE_ZONE.w + 30 &&
          wy > DIVE_ZONE.y - 80 && wy < DIVE_ZONE.y + DIVE_ZONE.h + 50;
      if (inDock) {
        // With fish in the bag, dock clicks must walk to the tanks — not snap-dive.
        if (bagHasStockable()) {
          return stockableTankTarget() || tankWalkPoint(0);
        }
        return { x: 880, y: 1008 };
      }
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
      if (!nearStockPad(i)) { player.goto = tankWalkPoint(i); return; }
      if (can) buyTank(i);
    }
    if (id === "book-dismiss" || id === "book-close") { state.bookOpen = null; return; }
    if (id === "book-panel") return;
    if (id.startsWith("book-")) {
      const n = +id.split("-")[1];
      if (n >= 0 && n < 5) {
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
    if (id === "dive") { if (state.mode === "play" && inDiveZone() && state.surfaceLock <= 0 && !bagHasStockable()) beginDive(); return; }
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
      player.goto = null;
      if (state.tutorial === 0) state.didMove = false;
    }
    state.displayMoney = state.money;
    seedDockTeasers();
    if (state.tutorial === 0 || state.stock.reduce((a, b) => a + b, 0) === 0) seedLivingPier();
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
  function nearSurface() {
    return player.y < 280;
  }
  function shouldSurface() {
    return state.scene === "ocean" && (bagIsFull() || nearSurface());
  }
  function tryAction(opts) {
    const fromKey = !!(opts && opts.fromKey);
    if (state.mode !== "play") return false;
    if (state.fadeDir) return true;
    if (state.scene === "ocean" && bagIsFull()) {
      state.bookOpen = null;
      player.goto = null;
      beginSurface();
      return true;
    }
    if (state.bookOpen != null) return false;
    if (state.scene === "shop" && nearBoat() && expeditionUnlocked()) { beginExpedition(); return true; }
    if (state.scene === "shop" && inDiveZone()) {
      if (state.surfaceLock > 0) return fromKey;
      // Clicks walk to the tanks while the bag still has fish; Space can still re-dive.
      if (!fromKey && bagHasStockable()) return false;
      beginDive();
      return true;
    }
    if (shouldSurface()) { player.goto = null; beginSurface(); return true; }
    return false;
  }
  function inDiveZone() {
    return player.x > DIVE_ZONE.x && player.x < DIVE_ZONE.x + DIVE_ZONE.w &&
           player.y > DIVE_ZONE.y - 40 && player.y < DIVE_ZONE.y + DIVE_ZONE.h;
  }
  function beginDive() {
    if (state.fadeDir || state.surfaceLock > 0) return;
    sfx("dive"); state.fadeDir = 1; state.pendingScene = "ocean";
    state.decorOpen = false;
    if (state.tutorial === 0) state.tutorial = 1;
    advanceMission();
  }
  function beginSurface() {
    if (state.scene !== "ocean") return;
    if (state.pendingScene === "shop") return;
    if (state.fadeDir > 0) return;
    player.goto = null;
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
    if (s.y >= 78) return 1;
    return clamp((s.y - 14) / 64, 0.12, 1);
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
    seedTangTease();
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
      pushOceanFish(0, player.x + Math.cos(ang) * d, player.y + Math.sin(ang) * d + 50);
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
      const dx = f.x - px, dy = f.y - py;
      const d = Math.hypot(dx, dy) || 0.001;
      const fleeR = f.rare ? sp.fleeR * 0.38 : sp.fleeR;
      const fleeSp = f.rare ? sp.flee * 0.36 : sp.flee;
      if (d < fleeR) {
        f.fleeT = f.rare ? 0.22 : 0.45;
        const boost = (!f.rare && d < 70) ? 1.25 : 1;
        f.vx = (dx / d) * fleeSp * boost;
        f.vy = (dy / d) * fleeSp * boost;
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
        // Tiny unique idle: dart, figure-8, lazy bob, parade, paddle.
        if (f.s === 0 && Math.random() < dt * 0.42) f.ang += (Math.random() - 0.5) * 1.4;
        if (f.s === 1) f.ang += Math.sin(state.time * 2.6 + f.ph) * 2.1 * dt;
        if (f.s === 2) f.ang += Math.sin(state.time * 0.7 + f.ph) * 0.55 * dt;
        if (f.s === 3) f.ang += Math.sin(state.time * 0.55 + f.ph) * 0.7 * dt;
        const cruise = sp.cruise * (f.s === 0 && Math.sin(state.time * 3.2 + f.ph) > 0.72 ? 1.55 : 1);
        f.vx = Math.cos(f.ang) * cruise;
        f.vy = Math.sin(f.ang) * cruise + (f.s === 2 ? Math.sin(state.time * 1.1 + f.ph) * 18 : 0);
        if (f.s === 4) { f.vx *= 0.72; f.vy *= 0.72; }
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
    const range = coneRange() + (f.rare ? 56 : 0);
    if (d > range || d < 16) return false;
    const half = f.rare ? 1.28 : 0.85;
    return Math.abs(normAng(Math.atan2(dy, dx) - player.facing)) < half;
  }
  function fishNearCone(f) {
    const dx = f.x - player.x, dy = f.y - player.y;
    const d = Math.hypot(dx, dy);
    const range = coneRange() + (f.rare ? 92 : 16);
    if (d > range || d < 16) return false;
    const half = f.rare ? 1.48 : 0.98;
    return Math.abs(normAng(Math.atan2(dy, dx) - player.facing)) < half;
  }
  function updateCatch(dt) {
    if (state.catchClimax) {
      tickCatchClimax(dt);
      return;
    }
    if (state.fadeDir || state.diveLock > 0) {
      player.target = null;
      player.catchProg = 0;
      return;
    }
    if (state.bag.length >= bagMax()) { player.target = null; player.catchProg = 0; return; }
    let best = null, bestD = 1e9;
    let bestRare = null, bestRareD = 1e9;
    let rareNear = false;
    for (const f of oceanFish) {
      if (f.caught || f.tease) continue;
      if (f.rare && fishNearCone(f)) rareNear = true;
      const inC = f.rare ? fishNearCone(f) : fishInCone(f);
      if (!inC) continue;
      const d = Math.hypot(f.x - player.x, f.y - player.y);
      if (f.rare && d < bestRareD) { bestRareD = d; bestRare = f; }
      if (d < bestD) { bestD = d; best = f; }
    }
    if (bestRare) best = bestRare;
    else if (rareNear) best = null;
    if (rareNear && player.target && !player.target.rare) {
      player.target = null;
      player.catchProg = 0;
    }
    if (best) {
      player.target = best;
      player.catchProg += dt / catchTime();
      if (player.catchProg >= 1) beginCatchClimax(best);
    } else if (player.target && !player.target.caught) {
      const d = Math.hypot(player.target.x - player.x, player.target.y - player.y);
      if (d < coneRange() * 1.2) {
        player.catchProg += dt / catchTime();
        if (player.catchProg >= 1) beginCatchClimax(player.target);
      } else {
        player.catchProg = Math.max(0, player.catchProg - dt * 1.6);
        if (player.catchProg <= 0) player.target = null;
      }
    } else {
      player.catchProg = Math.max(0, player.catchProg - dt * 1.6);
      if (player.catchProg <= 0) player.target = null;
    }
  }
  function beginCatchClimax(f) {
    if (!f || f.caught || state.catchClimax) return;
    player.catchProg = 1;
    player.target = f;
    state.catchClimax = { fish: f, t: 0, max: 0.62, rare: !!f.rare, ox: f.x, oy: f.y };
    state.coneFlash = f.rare ? 0.34 : 0.22;
    state.camPunch = f.rare ? 0.16 : 0.08;
    if (f.rare) state.flash = 0.2;
  }
  function tickCatchClimax(dt) {
    const cl = state.catchClimax;
    if (!cl || !cl.fish) { state.catchClimax = null; return; }
    const f = cl.fish;
    cl.t += dt;
    const u = clamp(cl.t / cl.max, 0, 1);
    const wig = (1 - u * 0.35) * (cl.rare ? 16 : 12);
    f.x = cl.ox + Math.sin(cl.t * 48) * wig;
    f.y = cl.oy + Math.cos(cl.t * 40) * wig * 0.6;
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
    state.bag.push(f.s);
    if (!state.bagRare) state.bagRare = [];
    state.bagRare.push(!!f.rare);
    player.catchProg = 0; player.target = null;
    state.lifetimeCatches++;
    state.diveCatches++;
    if (!state.caughtCount || state.caughtCount.length < 5) state.caughtCount = [0, 0, 0, 0, 0];
    state.caughtCount[f.s] = (state.caughtCount[f.s] | 0) + 1;
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
      const word = state.diveCatches >= 5 ? "AMAZING" : state.diveCatches === 4 ? "GREAT" : "NICE";
      const col = state.diveCatches >= 5 ? "#ff8ad4" : state.diveCatches === 4 ? "#9ef0ff" : "#ffe27a";
      state.comboPop = { text: word, col, life: 0.6, max: 0.6 };
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
    beatMoment(f.rare ? "shiny" : "catch", f.x, f.y);
    pop(f.x, f.y - 18, (f.rare ? "Shiny " : "") + SPECIES[f.s].name + "!", f.rare ? "#ffd24a" : SPECIES[f.s].accent);
    if (state.tutorial === 1) state.tutorial = 2;
    if (bagIsFull()) toast("Bag full! SPACE or click to surface.", "#9ef0ff");
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
      player.goto = null;
      const w = screenToWorld(mouse.x, mouse.y);
      const dx = w.x - player.x, dy = w.y - player.y, d = Math.hypot(dx, dy);
      if (d > 8) { ax = dx / d; ay = dy / d; }
    } else if (player.goto && state.mode === "play") {
      const dx = player.goto.x - player.x, dy = player.goto.y - player.y, d = Math.hypot(dx, dy);
      if (d < 22) {
        if (state.scene === "shop") {
          tryStockOnArrival();
          tryUnlockOnArrival();
        }
        player.goto = null;
      } else { ax = dx / d; ay = dy / d; }
    }
    const accel = player.goto ? 2200 : 1650;
    player.vx += ax * accel * dt; player.vy += ay * accel * dt;
    const fr = ax || ay ? 5.2 : 8.5;
    player.vx -= player.vx * fr * dt; player.vy -= player.vy * fr * dt;
    const sp = Math.hypot(player.vx, player.vy);
    if (sp > max) { player.vx *= max / sp; player.vy *= max / sp; }
    player.x += player.vx * dt; player.y += player.vy * dt;
    if (!state.didMove && Math.hypot(player.x - 880, player.y - 920) > 28) state.didMove = true;
    const faceMin = (ocean && mouse.down) ? 6 : 18;
    if (sp > faceMin) player.facing = Math.atan2(player.vy, player.vx);
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
    for (let i = 0; i < 5; i++) {
      if (state.unlocked[i] && state.bag.some((s) => s === i) && nearStockPad(i)) stockTank(i);
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
    state.bookTeaseWait = 1.15;
  }
  function flushBookTease() {
    if (!bookTeaseReady() || state.scene !== "shop") return;
    state.sawBookTease = true;
    state.bookTeaseShown = true;
    state.pendingBookTease = false;
    state.bookTeaseWait = 0;
    toast("Tap a fish on the right to open your book", "#9ef0ff", 4.4, { big: true });
    persist();
  }
  function maybeTangRumor() {
    if (state.unlocked[1] || state.tangRumor) return;
    if (!state.didFirstStock) return;
    state.tangRumor = true;
    toast("Maya wants a Blue Tang — something blue flashed in the deep", "#9ef0ff", 3.8);
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
        name: "Maya", regular: true, favorite: 0, hawaii: true, hat: "#e8c04a",
        shirt: "#1b6b5a", hair: "#3a2415", hairCut: 1, emote: "Blue Tang!", teaseTang: true,
      }));
    }
  }
  function firstTeaseFish() {
    for (const f of oceanFish) if (f.tease && !f.caught) return f;
    return null;
  }
  function seedTangTease() {
    if (state.unlocked[1] || state.expedition) return;
    if ((state.divesThisSession | 0) < 2 && !state.didFirstStock) return;
    for (let i = oceanFish.length - 1; i >= 0; i--) if (oceanFish[i].tease) oceanFish.splice(i, 1);
    const x = clamp(player.x + 70, 120, OCEAN.w - 120);
    const y = clamp(player.y + 340, 720, OCEAN.h - 180);
    oceanFish.push({
      s: 1, x, y, vx: 36, vy: -6, ang: 0.15, ph: rand(0, 8), fleeT: 0, caught: false, tease: true,
    });
  }
  function updateShopInteract() {
    for (let i = 0; i < 5; i++) {
      if (state.unlocked[i] && nearStockPad(i)) stockTank(i);
    }
    const cashPad = (state.registerCash > 0 && state.tutorial <= 4) ? 220 : 40;
    if (nearRect(REGISTER.x, REGISTER.y, REGISTER.w, REGISTER.h, cashPad)) collectCash();
  }
  function stockTank(i) {
    let n = 0, rares = 0; const keep = []; const keepRare = [];
    const flags = state.bagRare || [];
    for (let j = 0; j < state.bag.length; j++) {
      if (state.bag[j] === i) {
        n++;
        if (flags[j]) rares++;
      } else {
        keep.push(state.bag[j]);
        keepRare.push(!!flags[j]);
      }
    }
    if (!n) return;
    state.bag = keep;
    state.bagRare = keepRare;
    state.stock[i] += n;
    if (!state.stockRare || state.stockRare.length < 5) state.stockRare = [0, 0, 0, 0, 0];
    state.stockRare[i] = (state.stockRare[i] | 0) + rares;
    for (let k = tankFish[i].length - 1; k >= 0; k--) if (tankFish[i][k].ceremonial) tankFish[i].splice(k, 1);
    for (let k = 0; k < n; k++) tankFish[i].push({ x: rand(24, TANK_W - 24), y: rand(36, TANK_H - 18), a: rand(0, 6), ph: rand(0, 20) });
    const t = TANK_POS[i];
    spawnP(t.x + TANK_W / 2, t.y + TANK_H / 2, 12, [SPECIES[i].color, "#b8f3ff", "#fff"], 80);
    pop(t.x + TANK_W / 2, t.y, "+" + n + " " + SPECIES[i].name, "#b8f3ff");
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
      c.emote = "!";
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
      player.goto = { x: REGISTER.x + REGISTER.w / 2 + 36, y: REGISTER.y + REGISTER.h + 40 };
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
    for (let i = 0; i < 6; i++) {
      hudCoins.push({
        x: rs.x + rand(-10, 10), y: rs.y + rand(-8, 8),
        tx: 44, ty: 40, life: 0.35 + i * 0.04, max: 0.35 + i * 0.04,
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
    if (prev < 40 && state.money >= 40) toast("Cashed in! Tap Speed to run faster", "#ffe27a");
    if (state.tutorial === 4) state.tutorial = 5;
    persist();
    advanceMission();
    checkSessionGoals();
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
    if (!nearStockPad(i)) { player.goto = tankWalkPoint(i); return; }
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
    spawnP(TANK_POS[i].x + TANK_W / 2, TANK_POS[i].y + 70, 20, [SPECIES[i].color, "#fff", "#ffe27a"], 140);
    state.tankReveal = { i, life: 0.4, max: 0.4 };
    state.unlockBanner = { name: SPECIES[i].name, color: SPECIES[i].color, life: 0.9 };
    for (let k = 0; k < 3; k++) {
      tankFish[i].push({ x: rand(24, TANK_W - 24), y: rand(36, TANK_H - 18), a: rand(0, 6), ph: rand(0, 20), ceremonial: true });
    }
    state.shopSwimmers.push(
      { s: i, x: aisleMidX(), y: AISLE.y + 80, vx: 92, ph: rand(0, 8) },
      { s: i, x: aisleMidX(), y: AISLE.y + 220, vx: 78, ph: rand(0, 8) }
    );
    if (i === 1) {
      toast("The bay just opened up", "#9ef0ff", 3.4);
      state.shopSwimmers.push(
        { s: 1, x: aisleMidX(), y: AISLE.y + 70, vx: 88, ph: rand(0, 8), school: 2 },
        { s: 1, x: aisleMidX(), y: AISLE.y + 180, vx: 76, ph: rand(0, 8), school: 2 },
        { s: 1, x: aisleMidX(), y: AISLE.y + 300, vx: 98, ph: rand(0, 8), school: 2 },
        { s: 0, x: aisleMidX(), y: AISLE.y + 400, vx: 70, ph: rand(0, 8), school: 2 }
      );
      toast("The boat is ready — $35 on the right dock", "#ffe27a", 4.6, { big: true });
      state.boatHint = 6.5;
      state.boatGlance = 2.2;
      ensureBaySchool();
    }
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
    if (n >= 2 || customers.length >= MAX_CUSTOMERS) return;
    if (!names.has("Maya")) {
      customers.push(newCustomer({
        x: 880, y: 1088, state: "tank", tank: 0, hops: 8, offX: 0,
        name: "Maya", regular: true, favorite: 0, hawaii: true, hat: "#e8c04a",
        shirt: "#1b6b5a", hair: "#3a2415", hairCut: 1, emote: "the usual?",
      }));
      n++;
    }
    if (n < 2 && !names.has("Nico") && customers.length < MAX_CUSTOMERS) {
      customers.push(newCustomer({
        x: 760, y: 1096, state: "tank", tank: 0, hops: 6, offX: -20,
        name: "Nico", regular: true, favorite: 0,
        shirt: "#3d8bfd", hair: "#1b1b1b", hairCut: 0, emote: "hi!",
      }));
    }
  }
  function ensureBaySchool() {
    if (!state.unlocked[1]) return;
    let n = 0;
    for (const sw of state.shopSwimmers) if (sw.school === 2) n++;
    while (n < 4) {
      state.shopSwimmers.push({
        s: n % 3 === 2 ? 0 : 1,
        x: aisleMidX(),
        y: AISLE.y + 50 + n * 110,
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
          (c.state === "tank" || c.state === "browse") && !c.vip) {
        c.tank = c.favorite;
      }
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
                c.carry = c.tank; c.state = "reg"; c.wait = 0;
                c.emote = (c.regular && c.favorite === c.tank) ? "the usual!" : "VIP";
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
                c.carry = c.tank; c.state = "reg"; c.wait = 0;
                c.emote = (c.regular && (c.favorite == null || c.favorite === c.tank)) ? "the usual!" : "";
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
          if (c.regular && (c.favorite == null || c.favorite === c.carry)) c.emote = "the usual!";
          else c.emote = c.vip ? "$$$" : "$";
          c.wait += dt;
          if (c.wait > 0.15) {
            const bonus = 1 + Math.min(0.35, (state.stock[c.carry] || 0) * 0.03);
            if (!state.stockRare || state.stockRare.length < 5) state.stockRare = [0, 0, 0, 0, 0];
            const rareSale = (state.stockRare[c.carry] | 0) > 0;
            if (rareSale) state.stockRare[c.carry]--;
            const pay = Math.round(SPECIES[c.carry].price * bonus * (state.bagBonus || 1) * (c.payMult || 1) * (rareSale ? 2 : 1));
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
            playSale(who, SPECIES[c.carry].name, pay, c.x, c.y - 28, first);
            beatMoment(first ? "firstsale" : "sale", c.x, c.y - 20);
            c.buyHop = 0.55;
            if (!state.didFirstSale) state.didFirstSale = true;
            state.sessionSales = (state.sessionSales | 0) + 1;
            if (!bagHasStockable() && state.registerCash > 0 && !cashierHandlingIt() && !player.goto) {
              player.goto = { x: REGISTER.x + REGISTER.w / 2 + 36, y: REGISTER.y + REGISTER.h + 40 };
            }
            const usual = c.regular && (c.favorite == null || c.favorite === c.carry);
            c.carry = -1; c.state = "leave"; c.wait = 0;
            c.emote = usual ? "the usual!" : "";
            persist();
            checkSessionGoals();
          }
        }
      } else if (c.state === "browse") {
        if (c.regular && state.unlocked[c.tank] && state.stock[c.tank] > 0) {
          c.state = "tank"; c.wait = 0;
          c.emote = (c.favorite == null || c.favorite === c.tank) ? "the usual!" : "!";
        } else {
          const t = TANK_POS[c.tank] || TANK_POS[0];
          tx = t.x + TANK_W / 2 + (c.offX || 24); ty = t.y + TANK_H + 36;
          if (Math.hypot(c.x - tx, c.y - ty) < 18) {
            if ((c.teaseTang || c.tank === 1) && !state.unlocked[1]) c.emote = "Blue Tang?";
            else if (c.regular && (c.favorite == null || c.favorite === c.tank)) c.emote = "the usual!";
            else if (c.regular) c.emote = c.emote || "wow";
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
      c.x += (dx / d) * 150 * dt; c.y += (dy / d) * 150 * dt;
      const pdx = player.x - c.x, pdy = player.y - c.y;
      const nearYou = Math.hypot(pdx, pdy) < 240;
      const wantGlance = nearYou ? clamp(pdx / 40, -1, 1) : 0;
      c.glance = lerp(c.glance || 0, wantGlance, 1 - Math.pow(0.02, dt));
      if (c.buyHop > 0) c.buyHop = Math.max(0, c.buyHop - dt);
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
    if (state.nopeFlash > 0) state.nopeFlash = Math.max(0, state.nopeFlash - dt * 0.85);
    if (state.registerPunch > 1) state.registerPunch = Math.max(1, state.registerPunch - dt * 2.4);
    if (state.tankShake) {
      state.tankShake.t -= dt;
      if (state.tankShake.t <= 0) state.tankShake = null;
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
    for (let i = state.shopSwimmers.length - 1; i >= 0; i--) {
      const sw = state.shopSwimmers[i];
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
    if (state.scene === "shop") {
      ensureBaySchool();
      seedDockTeasers();
      for (const t of dockTeasers) {
        t.x += t.vx * dt;
        t.y += Math.sin(state.time * 1.5 + t.ph) * 10 * dt + Math.sin(state.time * 2.4 + t.ph) * 4 * dt;
        if (t.x > SHOP.w + 70) {
          t.x = -70;
          t.y = rand(1120, 1220);
        }
      }
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
  function drawFishEye(s, ox, oy, lookX, lookY) {
    const lx = lookX || 0, ly = lookY || 0;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(ox * s, oy * s, 2.05 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath(); ctx.arc((ox + 0.55 + lx) * s, (oy + ly) * s, 1.05 * s, 0, Math.PI * 2); ctx.fill();
  }
  function fishLook(sp, t) {
    const rate = 1.05 + sp.id * 0.38;
    return {
      x: Math.sin(t * rate + sp.id * 1.7) * (sp.id === 1 ? 0.55 : 0.38),
      y: Math.sin(t * 0.72 + sp.id) * 0.22,
    };
  }
  function drawFishBody(sp, x, y, ang, scale, t) {
    ctx.save();
    ctx.translate(x, y);
    if (sp.id === 4) { drawTurtle(ang, scale, t); ctx.restore(); return; }
    ctx.rotate(ang);
    const s = scale;
    const rates = [10, 14, 6.2, 7.2, 4];
    const amts = [0.12, 0.2, 0.16, 0.1, 0.08];
    const wob = Math.sin(t * (rates[sp.id] || 10)) * (amts[sp.id] || 0.12);
    const look = fishLook(sp, t);
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
      drawFishEye(s, 6.6, -1.4, look.x, look.y);
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
      drawFishEye(s, 6.4, -1.2, look.x, look.y);
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
      drawFishEye(s, 7.0, -1.4, look.x, look.y);
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
      drawFishEye(s, 8.4, -1.3, look.x, look.y);
    }
    ctx.restore();
  }
  function drawPerson(x, y, opt) {
    const hop = opt.buyHop > 0 ? Math.sin((1 - opt.buyHop / 0.55) * Math.PI) * 7 : 0;
    const bob = Math.sin(opt.bob || 0) * 2.2 - hop;
    const walk = Math.sin((opt.bob || 0) * 1.6);
    const squash = 1 + walk * 0.07 + (hop ? 0.08 : 0);
    shadow(x, y + 4, opt.kid ? 7 : 9, opt.kid ? 3.2 : 4);
    ctx.save();
    ctx.translate(x, y + bob);
    if (opt.kid) ctx.scale(0.78, 0.78);
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
    const glance = clamp(opt.glance || 0, -1, 1);
    ctx.beginPath(); ctx.arc(-2.4 + glance * 1.7, -14, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2.6 + glance * 1.7, -14, 1.1, 0, Math.PI * 2); ctx.fill();
    if (opt.sunglasses) {
      ctx.fillStyle = "#1a1a22";
      roundRect(-6.4, -16.4, 12.8, 3.6, 1.4); ctx.fill();
      ctx.fillStyle = "#3a4860";
      ctx.fillRect(-5.6, -15.8, 5, 2.4);
      ctx.fillRect(0.6, -15.8, 5, 2.4);
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
    if (opt.carry >= 0) drawFishBody(SPECIES[opt.carry], 14, -2, 0.2, 0.55, state.time);
    if (opt.emote) {
      const ox = opt.emoteOff || 0;
      const label = String(opt.emote);
      const usual = label === "the usual!" || label === "the usual?";
      const pulse = usual ? 1 + 0.08 * Math.sin(state.time * 7) : 1;
      const bw = Math.max(20, label.length * (usual ? 8.6 : 8) + (usual ? 16 : 10)) * pulse;
      const bh = usual ? 20 : 16;
      ctx.fillStyle = usual ? "rgba(255, 236, 170, 0.96)" : "rgba(255,255,255,0.94)";
      roundRect(-bw / 2 + ox, -40 - (usual ? 4 : 0), bw, bh, 6); ctx.fill();
      if (usual) {
        ctx.strokeStyle = "rgba(200, 140, 30, 0.55)";
        ctx.lineWidth = 1.6;
        roundRect(-bw / 2 + ox, -44, bw, bh, 6); ctx.stroke();
      }
      ctx.fillStyle = "#2a1a12";
      ctx.font = (usual ? "800 13px" : "800 12px") + " Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, ox, usual ? -30 : -28);
    }
    ctx.restore();
  }
  function drawPlayer(x, y) {
    const sp = Math.hypot(player.vx, player.vy);
    const moving = sp > 28;
    const phase = moving ? player.walkPhase : player.bob * 0.7;
    const bob = Math.sin(phase) * (moving ? 3.4 : 1.4);
    const walk = Math.sin(phase * 1.15);
    const swing = Math.sin(phase) * (moving ? 11 : 4);
    const flip = Math.cos(player.facing) < -0.12 ? -1 : 1;
    const lean = (player.lean || 0) * flip;
    shadow(x, y + 5, moving ? 12 : 10, moving ? 5.2 : 4.5);
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(flip, 1);
    ctx.rotate(lean * 0.55 + (moving ? walk * 0.04 : 0));
    ctx.fillStyle = "#2a3a48";
    ctx.fillRect(-7, 8, 5, 10 + walk * 4.5);
    ctx.fillRect(2, 8, 5, 10 - walk * 4.5);
    ctx.fillStyle = "#1a2430";
    ctx.beginPath(); ctx.ellipse(-4.4, 18 + walk * 4.5, 3.4, 1.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4.6, 18 - walk * 4.5, 3.4, 1.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f0c2a0";
    ctx.save(); ctx.translate(-11, -1); ctx.rotate(0.2 + swing * 0.09);
    roundRect(-2, 0, 4, 12, 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(11, -1); ctx.rotate(-0.2 - swing * 0.09);
    roundRect(-2, 0, 4, 12, 2); ctx.fill(); ctx.restore();
    ctx.fillStyle = "#2a9d8f";
    roundRect(-10, -8, 20, 18, 5); ctx.fill();
    ctx.fillStyle = "#ffd24a";
    ctx.beginPath(); ctx.arc(-3.2, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#e85d4c";
    ctx.beginPath(); ctx.arc(-3.2, 0, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#7ad08a";
    ctx.beginPath(); ctx.ellipse(5.2, 4, 3.4, 1.6, 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff6e8";
    ctx.beginPath(); ctx.arc(3.2, -2.2, 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(moving ? 1.6 : 0, 0);
    ctx.rotate(lean * 0.2);
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
    ctx.globalAlpha = worldHudFade(880, 90);
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
  function drawShop() {
    ctx.fillStyle = "#0a3040";
    ctx.fillRect(-480, -240, SHOP.w + 960, SHOP.h + 480);
    const g = ctx.createLinearGradient(0, 900, 0, SHOP.h);
    if (state.unlocked[1]) {
      g.addColorStop(0, "#4ae0d4"); g.addColorStop(1, "#0a6e72");
    } else {
      g.addColorStop(0, "#2eb7c9"); g.addColorStop(1, "#0d6a86");
    }
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
    for (const t of dockTeasers) {
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
    for (let i = 0; i < 6; i++) {
      const px = 540 + i * 120;
      ctx.fillStyle = "#6b4423"; ctx.fillRect(px, 1000, 16, 80);
      ctx.fillStyle = "#8a5a30"; ctx.fillRect(px, 1000, 6, 80);
    }
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(-40, 70, 120, 830);
    ctx.fillStyle = state.unlocked[1] ? "#dce8d8" : "#e8d2ae"; ctx.fillRect(80, 70, 1600, 830);
    for (let y = 80; y < 890; y += 28) {
      ctx.fillStyle = (y / 28) % 2 ? "#d8be94" : "#e6cda6";
      ctx.fillRect(90, y, 1580, 26);
      ctx.strokeStyle = "rgba(110,70,30,0.18)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(90, y + 26); ctx.lineTo(1670, y + 26); ctx.stroke();
    }
    if (state.unlocked[1]) {
      ctx.fillStyle = "rgba(40, 170, 180, 0.1)";
      ctx.fillRect(90, 80, 1580, 810);
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
    ctx.fillStyle = state.unlocked[1] ? "rgba(40, 200, 196, 0.32)" : "rgba(32, 168, 168, 0.22)";
    roundRect(802, 318, 156, 560, 18); ctx.fill();
    ctx.strokeStyle = state.unlocked[1] ? "rgba(90, 240, 230, 0.62)" : "rgba(80, 220, 210, 0.45)"; ctx.lineWidth = 2;
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
    // side welcome counter (inward so the starting camera keeps it on-canvas)
    ctx.fillStyle = "#c45c4a";
    roundRect(WELCOME.x, WELCOME.y, WELCOME.w, WELCOME.h, 12); ctx.fill();
    ctx.fillStyle = "#ead7b4";
    roundRect(WELCOME.x + 10, WELCOME.y + 10, WELCOME.w - 20, WELCOME.h - 20, 8); ctx.fill();
    ctx.fillStyle = "#2a7d8a";
    ctx.font = "700 12px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Welcome to", WELCOME.x + WELCOME.w / 2, WELCOME.y + 38);
    ctx.fillText("the pier", WELCOME.x + WELCOME.w / 2, WELCOME.y + 54);
    drawRegister(); drawKiosk();
    for (let i = 0; i < 5; i++) drawTank(i);
    ctx.save();
    roundRect(AISLE.x, AISLE.y, AISLE.w, AISLE.h, 18);
    ctx.clip();
    for (const sw of state.shopSwimmers) {
      if (sw.y < AISLE.y - 8 || sw.y > AISLE.y + AISLE.h + 8) continue;
      if (sw.x < AISLE.x - 8 || sw.x > AISLE.x + AISLE.w + 8) continue;
      const ang = (sw.vx >= 0 ? 1 : -1) * Math.PI / 2;
      drawFishBody(SPECIES[sw.s], sw.x, sw.y, ang + Math.sin(state.time * 2 + sw.ph) * 0.12, 1.15, state.time + sw.ph);
    }
    ctx.restore();
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
    const punch = state.registerPunch || 1;
    ctx.save();
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
    ctx.scale(punch, punch);
    ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
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
      ctx.beginPath(); ctx.ellipse(c.x, by, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
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
    ctx.restore();
  }
  function drawKiosk() {
    const k = KIOSK;
    const ks = worldToScreen(k.x, k.y);
    const ke = worldToScreen(k.x + k.w, k.y + k.h);
    if (ks.y < 12 || ke.y > H - 12 || ks.x < 8 || ke.x > W - 8) return;
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
  }
  function screenBtnFromWorld(x, y, w, h) {
    const a = worldToScreen(x, y), b = worldToScreen(x + w, y + h);
    return [a.x, a.y, b.x - a.x, b.y - a.y];
  }
  function drawFishSilhouette(sp, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.55;
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
        const tm = state.time;
        let ox = Math.sin(tm * 1.2 + f.ph) * 10, oy = Math.sin(tm * 0.8 + f.ph) * 6;
        if (i === 0) { ox = Math.sin(tm * 2.6 + f.ph) * 16; oy = Math.sin(tm * 3.1 + f.ph) * 5; }
        else if (i === 1) { ox = Math.sin(tm * 1.8 + f.ph) * 18; oy = Math.cos(tm * 1.8 + f.ph) * 8; }
        else if (i === 2) { ox = Math.sin(tm * 0.9 + f.ph) * 8; oy = Math.sin(tm * 1.2 + f.ph) * 8; }
        else if (i === 3) { ox = Math.sin(tm * 0.7 + f.ph) * 16; oy = Math.sin(tm * 0.5 + f.ph) * 4; }
        else { ox = Math.sin(tm * 0.45 + f.ph) * 6; oy = Math.sin(tm * 0.8 + f.ph) * 3; }
        const fx = t.x + 20 + ((f.x + ox) % (TANK_W - 40) + (TANK_W - 40)) % (TANK_W - 40);
        const fy = t.y + 28 + ((f.y + oy) % (TANK_H - 50) + (TANK_H - 50)) % (TANK_H - 50);
        const bobY = fy + Math.sin(tm * 2.2 + f.ph) * 3;
        const lookA = i === 1 ? Math.sin(tm * 1.6 + f.ph) * 0.7 : Math.sin(tm + f.ph) * 0.4;
        drawFishBody(sp, fx, bobY, lookA, sc, tm + f.ph);
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
      const labelA = worldHudFade(t.x + TANK_W / 2, t.y + 8);
      ctx.globalAlpha = labelA;
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
      ctx.globalAlpha = 1;
      if (nearStockPad(i) && state.bag.some((s) => s === i)) {
        ctx.fillStyle = "rgba(80,230,180,0.92)";
        roundRect(t.x + 20, t.y - 30, TANK_W - 40, 24, 8); ctx.fill();
        ctx.fillStyle = "#123"; ctx.font = "700 12px Nunito, sans-serif";
        ctx.fillText("Stock tank", t.x + TANK_W / 2, t.y - 13);
      }
    } else {
      const next = nextLockedTank();
      const affordable = i === next && state.money >= sp.unlock;
      const glow = i === next ? (0.32 + 0.28 * Math.sin(state.time * 4)) : 0.12;
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
      ctx.globalAlpha = worldHudFade(t.x + TANK_W / 2, t.y + 20);
      ctx.fillStyle = "#fff6e8";
      ctx.font = "800 16px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(sp.name, t.x + TANK_W / 2, t.y + 96);
      ctx.font = "700 13px Nunito, sans-serif";
      const priceNope = state.priceFlash && state.priceFlash.tank === i;
      ctx.fillStyle = priceNope ? "#ff6a5a" : affordable ? "#ffe27a" : "#d0c4b0";
      if (priceNope) ctx.font = "800 16px Nunito, sans-serif";
      ctx.fillText("Unlock  $" + sp.unlock, t.x + TANK_W / 2, t.y + 116);
      ctx.globalAlpha = 1;
      if (affordable) {
        ctx.strokeStyle = "rgba(255,226,122," + (0.4 + 0.35 * Math.sin(state.time * 6)) + ")";
        ctx.lineWidth = 5;
        roundRect(t.x - 3, t.y - 3, TANK_W + 6, TANK_H + 6, 12); ctx.stroke();
      }
      btn("unlock-" + i, ...screenBtnFromWorld(t.x, t.y, TANK_W, TANK_H));
    }
    if (state.tankReveal && state.tankReveal.i === i) {
      ctx.fillStyle = "rgba(255,255,255," + (0.55 * (state.tankReveal.life / state.tankReveal.max)) + ")";
      roundRect(t.x, t.y, TANK_W, TANK_H, 10); ctx.fill();
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
    if (player.y < 280 || bagIsFull()) {
      ctx.globalAlpha = bagIsFull() ? 0.85 : clamp((280 - player.y) / 100, 0, 0.85);
      ctx.fillStyle = "#fff";
      ctx.font = "700 16px Fredoka, Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("SURFACE  ·  SPACE or click", OCEAN.w / 2, 70);
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
      drawFishBody(SPECIES[f.s], f.x, f.y, f.ang, SPECIES[f.s].size / 15 * (f.rare ? 1.18 : 1), state.time + f.ph);
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
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.arc(0, 0, range, -0.85, 0.85); ctx.closePath(); ctx.fill();
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
      const pulse = 0.45 + 0.35 * Math.sin(state.time * 7);
      ctx.strokeStyle = "rgba(255,226,122," + pulse + ")";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(player.goto.x, player.goto.y, 14 + Math.sin(state.time * 6) * 3, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(255,226,122,0.28)";
      ctx.beginPath(); ctx.arc(player.goto.x, player.goto.y, 5, 0, Math.PI * 2); ctx.fill();
    }
    for (const p of pops) {
      ctx.globalAlpha = clamp(p.life, 0, 1);
      ctx.fillStyle = p.col;
      const sc = p.scale || 1;
      const base = (p.text && p.text.length > 18 ? 13 : 16) * sc;
      ctx.font = "800 " + Math.round(base) + "px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
    for (const c of worldCoins) {
      const fat = c.fat || 1;
      ctx.fillStyle = "#ffd24a";
      ctx.beginPath(); ctx.ellipse(c.x, c.y, 10 * fat, 8 * fat, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#c49210"; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = "#a87410";
      ctx.font = "800 " + Math.round(11 * fat) + "px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("$", c.x, c.y + 4 * fat);
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
    for (let i = 0; i < 5; i++) {
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
    if ((state.didFirstCollect || state.didFirstSale) && (state.money | 0) >= 15) r = 6;
    return r;
  }
  function firstSessionIndex() {
    if (state.missionDone) return -1;
    if (state.registerCash > 0 && !cashierHandlingIt() && !bagHasStockable()) return 5;
    if (bagHasStockable()) return 4;
    if (state.scene === "ocean" || state.pendingScene === "ocean") {
      if (bagIsFull()) return 3;
      if (((state.caughtCount && state.caughtCount[0]) | 0) >= 5 && state.bag.length > 0) return 3;
      return 2;
    }
    if (inDiveZone() && state.surfaceLock <= 0 && !bagHasStockable()) return 1;
    return 0;
  }
  function ribbonHidesForDock() {
    if (state.scene === "shop" && inDiveZone() && state.surfaceLock <= 0 && !bagHasStockable()) return true;
    if (state.scene === "ocean" && (bagIsFull() || nearSurface())) return true;
    return false;
  }
  function currentGoal() {
    if (state.scene === "shop" && state.boatHint > 0 && !bagHasStockable()) {
      return { text: "The boat is ready — $35 on the right dock", target: { x: BOAT.x, y: BOAT.y } };
    }
    if (!state.missionDone) {
      const step = firstSessionIndex();
      if (step === 0) return { text: "Walk to the glowing dock", target: { x: 880, y: 980 } };
      if (step === 1) return { text: "Press SPACE or click to DIVE", target: { x: 880, y: 980 } };
      if (step === 2) {
        const n = Math.min(5, (state.caughtCount && state.caughtCount[0]) | 0);
        const shiny = firstRareFish();
        if (shiny && (state.shinyCallout > 0 || !state.caughtRare) && n === 0) {
          return { text: "Catch the SHINY — then 5 Clownfish", target: { x: shiny.x, y: shiny.y } };
        }
        if (state.didFirstStock && !state.unlocked[1]) {
          const tease = firstTeaseFish();
          if (tease) return { text: "A blue flash in the deep — Maya asked for Tang", target: { x: tease.x, y: tease.y } };
          return { text: "Catch more — Maya wants a Blue Tang", target: nearestOceanFish() };
        }
        return { text: "Catch 5  ·  " + n + "/5", target: nearestOceanFish() };
      }
      if (step === 3) return { text: "Surface — SPACE or click", target: { x: player.x, y: 140 } };
      if (step === 4) return { text: "Stock the glowing tank", target: stockableTankTarget() || { x: TANK_POS[0].x + TANK_W / 2, y: TANK_POS[0].y + TANK_H / 2 } };
      if (step === 5) return { text: "Collect  $" + state.registerCash, target: { x: REGISTER.x + REGISTER.w / 2, y: REGISTER.y + REGISTER.h / 2 } };
    }
    if (state.scene === "ocean" || state.pendingScene === "ocean") {
      if (state.scene !== "ocean") {
        return { text: "Point the glowing cone at a fish — hold until the bar fills", target: null };
      }
      if (bagIsFull()) {
        return { text: "Bag full — SPACE or click to surface", target: { x: player.x, y: 140 } };
      }
      if (state.expedition) {
        return { text: "Expedition · catch rares, then surface", target: state.bag.length > 0 ? { x: player.x, y: 140 } : nearestOceanFish() };
      }
      if (state.bag.length > 0) {
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
      return { text: "Point the glowing cone at a fish — hold until the bar fills", target: nearestOceanFish() };
    }
    if (nearBoat() && expeditionUnlocked() && !state.expedition) {
      return { text: "Press SPACE to start an expedition ($35)", target: { x: BOAT.x, y: BOAT.y } };
    }
    if (bagHasStockable()) {
      return { text: "Walk into the glowing tank to stock your catch", target: stockableTankTarget() || { x: TANK_POS[0].x + TANK_W / 2, y: TANK_POS[0].y + TANK_H / 2 } };
    }
    if (state.registerCash > 0 && !cashierHandlingIt()) {
      return { text: "Stand on CASHIER to pocket $" + state.registerCash, target: { x: REGISTER.x + REGISTER.w / 2, y: REGISTER.y + REGISTER.h / 2 } };
    }
    if (inDiveZone() && state.surfaceLock <= 0) {
      return { text: "Press SPACE or click to DIVE", target: { x: 880, y: 980 } };
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
  function boxesOverlap(a, b, pad) {
    const p = pad == null ? 6 : pad;
    return !(a.x + a.w < b.x - p || a.x > b.x + b.w + p || a.y + a.h < b.y - p || a.y > b.y + b.h + p);
  }
  function ribbonLayout() {
    if (ribbonHidesForDock()) return null;
    const gt = goalText();
    ctx.font = "700 13px Nunito, sans-serif";
    const tw = Math.min(ctx.measureText(gt).width + 24, 560, W - 300);
    const gx = clamp(W / 2 - tw / 2, 200, W - 148 - tw);
    return Object.assign(hudBox(gx, 16, tw, 32), { text: gt });
  }
  function chipAlpha(box, ribbon) {
    if (!ribbon) return 1;
    if (boxesOverlap(box, ribbon, 10)) return 0.16;
    if (state.camPunch > 0 && box.y < 70) return 0.55;
    return 1;
  }
  function drawRibbon(rb) {
    if (!rb) return;
    card(rb.x, rb.y, rb.w, rb.h, "rgba(20, 50, 62, 0.9)");
    ctx.fillStyle = "#e8fbff"; ctx.textAlign = "center";
    ctx.font = "700 13px Nunito, sans-serif";
    ctx.save();
    ctx.beginPath();
    ctx.rect(rb.x + 6, rb.y, Math.max(8, rb.w - 12), rb.h);
    ctx.clip();
    ctx.fillText(rb.text, rb.x + rb.w / 2, rb.y + 21);
    ctx.restore();
  }
  function drawHUD() {
    const ribbon = ribbonLayout();
    const moneyBox = hudBox(16, 14, 200, 52);
    ctx.save();
    ctx.globalAlpha = chipAlpha(moneyBox, ribbon);
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
    const bagBox = hudBox(224, 14, 168, 52);
    ctx.save();
    ctx.globalAlpha = chipAlpha(bagBox, ribbon);
    ctx.translate(bagBox.x + 84, bagBox.y + 26);
    ctx.scale(state.bagPunch, state.bagPunch);
    ctx.translate(-(bagBox.x + 84), -(bagBox.y + 26));
    card(bagBox.x, bagBox.y, bagBox.w, bagBox.h);
    ctx.fillStyle = "#9ef0ff"; ctx.font = "700 13px Nunito, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("BAG", bagBox.x + 14, bagBox.y + 20);
    ctx.fillStyle = "#fff"; ctx.font = "800 22px Nunito, sans-serif";
    ctx.fillText(state.bag.length + " / " + bagMax(), bagBox.x + 14, bagBox.y + 42);
    ctx.restore();
    if (state.bag.length) {
      const bw = Math.min(36 + state.bag.length * 28, 340);
      const ib = hudBox(400, 14, bw, 52);
      ctx.save();
      ctx.globalAlpha = chipAlpha(ib, ribbon);
      card(ib.x, ib.y, ib.w, ib.h);
      for (let i = 0; i < Math.min(state.bag.length, 11); i++) {
        const rare = !!(state.bagRare && state.bagRare[i]);
        if (rare) {
          ctx.strokeStyle = "#ffd24a"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(ib.x + 28 + i * 28, ib.y + 26, 14, 8, 0, 0, Math.PI * 2); ctx.stroke();
        }
        drawFishBody(SPECIES[state.bag[i]], ib.x + 28 + i * 28, ib.y + 26, 0, 0.7, state.time + i);
      }
      ctx.restore();
    }
    if (missionVisible()) {
      const reached = Math.max(1, Math.min(6, firstSessionReached() || (firstSessionIndex() + 1)));
      const chip = hudBox(16, 74, 176, 30);
      card(chip.x, chip.y, chip.w, chip.h, "rgba(16, 36, 46, 0.88)");
      ctx.fillStyle = "#ffe27a";
      ctx.font = "800 12px Nunito, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("FIRST SESSION  " + reached + " / 6", chip.x + 12, chip.y + 20);
    } else if (sessionChipVisible()) {
      const goals = state.sessionGoals || [];
      let cur = "";
      for (let i = 0; i < goals.length; i++) {
        const ok = (state.sessionGoalDone || []).indexOf(goals[i]) >= 0 || sessionGoalMet(goals[i]);
        if (!ok) { cur = sessionGoalLabel(goals[i]); break; }
      }
      if (!cur) cur = "Done for today";
      ctx.font = "700 12px Nunito, sans-serif";
      const tw = Math.min(ctx.measureText(cur).width + 88, 320);
      const chip = hudBox(16, 74, tw, 30);
      card(chip.x, chip.y, chip.w, chip.h, "rgba(16, 36, 46, 0.88)");
      ctx.fillStyle = "#9ef0ff";
      ctx.font = "800 12px Nunito, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("TODAY  ·  " + cur, chip.x + 12, chip.y + 20);
    }
    const muteB = hudBox(W - 132, 14, 54, 40);
    card(muteB.x, muteB.y, muteB.w, muteB.h);
    drawSpeaker(muteB.x + 25, muteB.y + 20, state.muted);
    btn("mute", muteB.x, muteB.y, muteB.w, muteB.h);
    const pauseB = hudBox(W - 70, 14, 54, 40);
    card(pauseB.x, pauseB.y, pauseB.w, pauseB.h);
    ctx.fillStyle = "#fff6e8"; ctx.font = "800 18px Nunito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("II", pauseB.x + 27, pauseB.y + 27);
    btn("pause", pauseB.x, pauseB.y, pauseB.w, pauseB.h);
    drawSpeciesStrip(ribbon);
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
      card(W / 2 - 160, H - 92, 320, 40, "rgba(40, 160, 180, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = "700 16px Fredoka, sans-serif";
      ctx.fillText("SPACE · Expedition $35", W / 2, H - 66);
    } else if (state.scene === "shop" && inDiveZone() && state.surfaceLock <= 0 && !bagHasStockable()) {
      const db = hudBox(W / 2 - 160, H - 92, 320, 40);
      card(db.x, db.y, db.w, db.h, "rgba(40, 160, 180, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = "700 16px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SPACE  or  click  to  DIVE", db.x + db.w / 2, db.y + 26);
      btn("dive", db.x, db.y, db.w, db.h);
    } else if (state.scene === "shop" && bagHasStockable() && (inDiveZone() || state.surfaceLock > 0)) {
      const sb = hudBox(W / 2 - 170, H - 92, 340, 40);
      card(sb.x, sb.y, sb.w, sb.h, "rgba(40, 160, 180, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = "700 16px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Walk to the glowing tank", sb.x + sb.w / 2, sb.y + 26);
    }
    if (state.scene === "ocean" && (bagIsFull() || nearSurface())) {
      ctx.globalAlpha = bagIsFull() ? 1 : clamp((280 - player.y) / 80, 0.45, 1);
      const sb = hudBox(W / 2 - 170, H - 92, 340, 40);
      card(sb.x, sb.y, sb.w, sb.h, "rgba(40, 160, 180, 0.92)");
      ctx.fillStyle = "#fff"; ctx.font = "700 16px Fredoka, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SPACE  or  click  to  SURFACE", sb.x + sb.w / 2, sb.y + 26);
      ctx.globalAlpha = 1;
    }
    if (state.scene === "ocean" && bagIsFull()) {
      const by = state.expedition ? 104 : 70;
      const fb = hudBox(W / 2 - 150, by, 300, 32);
      card(fb.x, fb.y, fb.w, fb.h, "rgba(255, 140, 60, 0.88)");
      ctx.fillStyle = "#fff"; ctx.font = "700 14px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Bag full — SPACE or click!", fb.x + fb.w / 2, fb.y + 22);
    }
    // one toast at a time — the rest stay queued (unlock banner holds the slot)
    if (state.toasts.length && !state.unlockBanner) {
      const t = state.toasts[0];
      const big = !!t.big;
      const th = big ? 44 : 30;
      const tw = big ? 520 : 400;
      let ty = 78;
      if (state.scene === "shop") ty = 152;
      if (state.scene === "ocean" && bagIsFull()) ty = Math.max(ty, state.expedition ? 142 : 108);
      if (state.expedition && !(state.scene === "ocean" && bagIsFull())) ty = Math.max(ty, 104);
      const tb = hudBox(W / 2 - tw / 2, ty, tw, th);
      ctx.globalAlpha = clamp(t.life / (big ? 0.55 : 1), 0, 1);
      card(tb.x, tb.y, tb.w, tb.h, big ? "rgba(28, 22, 10, 0.9)" : "rgba(20,30,40,0.8)");
      if (big) {
        ctx.strokeStyle = "rgba(255,210,74," + (0.45 + 0.25 * Math.sin(state.time * 6)) + ")";
        ctx.lineWidth = 2.4;
        roundRect(tb.x, tb.y, tb.w, tb.h, 12); ctx.stroke();
      }
      ctx.fillStyle = t.col;
      ctx.font = big ? "800 22px Fredoka, sans-serif" : "700 14px Nunito, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.msg, tb.x + tb.w / 2, tb.y + (big ? 30 : 20));
      ctx.globalAlpha = 1;
    }
    for (const hp of hudPops) {
      const a = clamp(hp.life / Math.max(0.2, hp.max * 0.28), 0, 1);
      ctx.globalAlpha = a;
      ctx.font = "800 16px Fredoka, sans-serif";
      const tw = Math.min(ctx.measureText(hp.text).width + 28, 460);
      const hb = hudBox(hp.x - tw / 2, hp.y - 16, tw, 30);
      card(hb.x, hb.y, hb.w, hb.h, "rgba(18, 36, 44, 0.88)");
      ctx.fillStyle = hp.col;
      ctx.textAlign = "center";
      ctx.fillText(hp.text, hb.x + hb.w / 2, hb.y + 20);
      ctx.globalAlpha = 1;
    }
    for (const fl of flyers) {
      const u = 1 - clamp(fl.life / (fl.max || 0.52), 0, 1);
      const pop = 0.85 + Math.sin(u * Math.PI) * 0.35;
      ctx.globalAlpha = clamp(fl.life / 0.12, 0, 1);
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
      ctx.globalAlpha = clamp(c.life / 0.12, 0, 1);
      drawCoin(c.drawX, c.drawY, 8);
      ctx.globalAlpha = 1;
    }
    drawGuideArrow();
    drawBoatEdgeHint();
    if (shopBarsReady()) {
      const nearK = nearRect(KIOSK.x, KIOSK.y, KIOSK.w, KIOSK.h, 90);
      if (nearK) {
        ctx.strokeStyle = "rgba(255,226,122," + (0.35 + 0.3 * Math.sin(state.time * 5)) + ")";
        ctx.lineWidth = 3;
        const barW = decorHudReady() ? 854 : 720;
        const hb = hudBox(16, H - 92, barW, 84);
        roundRect(hb.x, hb.y, hb.w, hb.h, 12); ctx.stroke();
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
    if (state.scene !== "ocean" || state.mode !== "play") return;
    if (!(bagIsFull() || nearSurface())) return;
    // Last-registered wins hit-testing, so these beat click-to-walk and other HUD.
    btn("surface", W / 2 - 180, H - 100, 360, 56);
    if (bagIsFull()) {
      const by = state.expedition ? 104 : 70;
      btn("surface", W / 2 - 160, by, 320, 40);
    }
    const sp = worldToScreen(OCEAN.w / 2, 70);
    btn("surface", sp.x - 170, sp.y - 28, 340, 48);
  }
  function upCard(id, x, y, title, sub, cost, maxed, can, pulse) {
    const w = 168;
    const shaking = state.cardShake && state.cardShake.id === id;
    const shake = shaking
      ? Math.sin(state.cardShake.t * 68) * 26 * clamp(state.cardShake.t / 0.2, 0, 1)
      : 0;
    x += shake;
    const flashing = state.priceFlash && state.priceFlash.id === id;
    const fill = maxed ? "rgba(40,70,60,0.85)" : can ? "rgba(28, 58, 52, 0.9)" : flashing
      ? "rgba(72, 24, 22, 0.92)" : "rgba(40, 32, 28, 0.82)";
    card(x, y, w, 64, fill);
    if (pulse) {
      ctx.strokeStyle = "rgba(255,226,122," + (0.45 + 0.35 * Math.sin(state.time * 6)) + ")";
      ctx.lineWidth = 3;
      roundRect(x, y, w, 64, 12); ctx.stroke();
    }
    if (flashing) {
      ctx.strokeStyle = "rgba(255,90,70," + (0.55 + 0.35 * clamp(state.priceFlash.t / 0.2, 0, 1)) + ")";
      ctx.lineWidth = 3;
      roundRect(x, y, w, 64, 12); ctx.stroke();
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 13px Fredoka, sans-serif";
    ctx.fillText(title, x + 10, y + 24);
    ctx.fillStyle = "#c8e8ee"; ctx.font = "700 11px Nunito, sans-serif";
    ctx.fillText(sub, x + 10, y + 44);
    ctx.textAlign = "right";
    ctx.fillStyle = maxed ? "#8fd" : flashing ? "#ff6a5a" : can ? "#ffe27a" : "#c4b8a4";
    ctx.font = flashing ? "800 16px Nunito, sans-serif" : "800 13px Nunito, sans-serif";
    ctx.fillText(maxed ? "MAX" : "$" + cost, x + w - 10, y + 36);
    if (!maxed) btn(id, x, y, w, 64);
  }
  function drawUpgradeBar() {
    const bar = hudBox(16, H - 84, 720, 76);
    const y = bar.y + 8;
    card(bar.x, bar.y, bar.w, bar.h, "rgba(12, 28, 36, 0.72)");
    const sMax = state.speedLv >= SPEED_COST.length;
    const bMax = state.bagLv >= BAG_COST.length;
    const cMax = state.catchLv >= CATCH_COST.length;
    const sc = sMax ? 0 : SPEED_COST[state.speedLv];
    const bc = bMax ? 0 : BAG_COST[state.bagLv];
    const cc = cMax ? 0 : CATCH_COST[state.catchLv];
    const aff = firstAffordableUp();
    upCard("up-speed", bar.x + 8, y, "Speed  Lv " + (state.speedLv + 1), "Walk & swim faster", sc, sMax, !sMax && state.money >= sc, aff && aff.id === "speed");
    upCard("up-bag", bar.x + 184, y, "Bag  " + bagMax() + "/20", "Carry more fish", bc, bMax, !bMax && state.money >= bc, aff && aff.id === "bag");
    upCard("up-catch", bar.x + 360, y, "Catch  Lv " + (state.catchLv + 1), "Fill the meter faster", cc, cMax, !cMax && state.money >= cc, aff && aff.id === "catch");
    upCard("up-cashier", bar.x + 536, y, "Cashier", state.hiredCashier ? "Collects while you dive" : "Hire front-desk help", CASHIER_COST, state.hiredCashier, !state.hiredCashier && state.money >= CASHIER_COST, aff && aff.id === "cashier");
  }
  function drawDecorBar() {
    const chip = hudBox(744, H - 84, 118, 64);
    const chipX = chip.x, chipY = chip.y, chipW = 118, chipH = 64;
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
    card(W / 2 - 250, 108, 500, 168, "rgba(12, 28, 36, 0.78)");
    ctx.fillStyle = "#6b3a18";
    roundRect(W / 2 - 210, 128, 420, 72, 10); ctx.fill();
    ctx.strokeStyle = "#e8c04a"; ctx.lineWidth = 3;
    roundRect(W / 2 - 204, 133, 408, 62, 8); ctx.stroke();
    drawFishBody(SPECIES[0], W / 2 - 168, 164, 0.08, 1.35, state.time);
    ctx.fillStyle = "#fff6e8"; ctx.font = "700 28px Fredoka, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Aqua Bay Pier Mart", W / 2 + 18, 160);
    ctx.fillStyle = "#ffe27a"; ctx.font = "700 14px Nunito, sans-serif";
    ctx.fillText("Dive. Stock. Sell.", W / 2 + 18, 184);
    ctx.fillStyle = "#9ef0ff"; ctx.font = "700 16px Nunito, sans-serif";
    ctx.fillText("A sunny pier aquarium of your own", W / 2, 248);
    const pulse = 1 + Math.sin(state.time * 3) * 0.035;
    if (state.hasSave) {
      panelBtn("continue", W / 2 - 150, 348, 300, 56, "Continue", null, pulse);
      const nSp = state.unlocked.filter(Boolean).length;
      ctx.fillStyle = "#ffe27a"; ctx.font = "700 14px Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("$" + (state.money | 0) + "  ·  " + nSp + " species unlocked", W / 2, 424);
      panelBtn("play", W / 2 - 150, 444, 300, 48, "New Game", "#3d6f7a");
    } else {
      panelBtn("play", W / 2 - 150, 360, 300, 56, "Play", null, pulse);
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
        "WASD or Arrows — move  ·  click to walk  ·  hold to steer",
        "SPACE / click at the dock — dive",
        "SPACE / click — surface (full bag, or at the waterline)",
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
      lines.forEach((ln, i) => ctx.fillText(ln, W / 2 - 210, 142 + i * 26));
      ctx.fillStyle = "#8ab"; ctx.font = "600 12px Nunito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Inspired by the aquarium-tycoon genre", W / 2, 518);
      panelBtn("back", W / 2 - 110, 540, 220, 48, "Back");
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
      ctx.fillText("Aqua Bay · loop 19", W - 16, H - 14);
  }

  function drawSpeciesStrip(ribbon) {
    for (let i = 0; i < 5; i++) {
      const b = hudBox(W - 56, 58 + i * 34, 44, 32);
      const x = b.x, y = b.y;
      ctx.save();
      ctx.globalAlpha = chipAlpha({ x, y, w: 44, h: 34 }, ribbon);
      card(x, y, 44, 34, state.unlocked[i] ? "rgba(18,40,48,0.8)" : "rgba(20,20,24,0.7)");
      if (state.bookOpen === i) {
        ctx.strokeStyle = "rgba(255,226,122," + (0.55 + 0.25 * Math.sin(state.time * 6)) + ")";
        ctx.lineWidth = 2.4;
        roundRect(x, y, 44, 34, 12); ctx.stroke();
      }
      if (state.unlocked[i]) drawFishBody(SPECIES[i], x + 22, y + 17, 0, 0.68, state.time + i);
      else {
        drawFishSilhouette(SPECIES[i], x + 22, y + 13, 0.55);
        ctx.fillStyle = "#ffe27a"; ctx.font = "700 8px Nunito, sans-serif"; ctx.textAlign = "center";
        ctx.fillText("$" + SPECIES[i].unlock, x + 22, y + 28);
      }
      btn("book-" + i, x, y, 44, 34);
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
          player.x = OCEAN.w / 2; player.y = 380; player.vx = 0; player.vy = 0;
          player.facing = 0.22;
        }
        state.diveCatches = 0;
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
        cam.z = 1.28;
        state.camPunch = 0.16;
        if (state.expedition) seedExpeditionPocket();
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
          player.x = 880; player.y = 1000; player.vx = 0; player.vy = -40;
        }
        state.diveCatches = 0;
        if (bagHasStockable()) {
          player.goto = stockableTankTarget() || tankWalkPoint(0);
        }
        maybeBookTease();
        maybeTangRumor();
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
    const look = state.scene === "ocean" ? 80 : (player.goto ? 72 : 40);
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
    let tx = player.x + lx;
    let ty = player.y + ly;
    if (state.shinyFocus > 0 && state.scene === "ocean") {
      const shiny = firstRareFish();
      if (shiny) {
        tx = lerp(player.x, shiny.x, 0.42);
        ty = lerp(player.y, shiny.y, 0.42);
      }
    }
    if (state.boatGlance > 0 && state.scene === "shop") {
      const u = clamp(state.boatGlance / 2.2, 0, 1);
      const pull = u > 0.35 ? 0.78 : 0.78 * (u / 0.35);
      tx = lerp(tx, BOAT.x, pull);
      ty = lerp(ty, BOAT.y, pull);
    } else if (player.goto && state.scene === "shop") {
      tx = lerp(tx, player.goto.x, 0.38);
      ty = lerp(ty, player.goto.y, 0.38);
    }
    cam.x = lerp(cam.x, tx, 1 - Math.pow(0.012, dt));
    cam.y = lerp(cam.y, ty, 1 - Math.pow(0.012, dt));
    const rightRail = 70;
    const bottomRail = shopBarsReady() ? 100 : (state.tutorial === 0 && !state.didMove ? 100 : 28);
    let psx = (player.x - cam.x) * cam.z + W / 2;
    let psy = (player.y - cam.y) * cam.z + H / 2;
    if (psx > W - rightRail - 40) cam.x += (psx - (W - rightRail - 40)) / cam.z;
    if (psy > H - bottomRail - 30) cam.y += (psy - (H - bottomRail - 30)) / cam.z;
    cam.x = clamp(cam.x, minX, maxX);
    cam.y = clamp(cam.y, minY, maxY);
  }
  function onDiveLockEnd() {
    if (state.expedition) return;
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
      registerSurfaceHits();
      if (state.fade > 0) {
        ctx.fillStyle = "rgba(8, 40, 52," + state.fade + ")";
        ctx.fillRect(0, 0, W, H);
      }
    }
    requestAnimationFrame(frame);
  }
  loadSave();
  seedOcean();
  seedDockTeasers();
  for (let i = 0; i < 16; i++) {
    titleBubbles.push({ x: rand(30, W - 30), y: rand(40, H + 20), r: rand(2, 6), v: rand(36, 88), ph: rand(0, 8) });
  }
  requestAnimationFrame(frame);
})();
