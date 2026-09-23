#!/usr/bin/env node
// Apply loop 168 — pier stars, special orders, tank nursery, badges, share pier.
"use strict";
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "game.js");
let src = fs.readFileSync(file, "utf8");

function mustReplace(oldStr, newStr, label) {
  if (!src.includes(oldStr)) {
    console.error("FAIL missing anchor:", label);
    process.exit(1);
  }
  const n = src.split(oldStr).length - 1;
  if (n !== 1) {
    console.error("FAIL anchor count", n, "for", label);
    process.exit(1);
  }
  src = src.replace(oldStr, newStr);
}

if (/loop 168 pier stars/.test(src)) {
  console.log("already applied");
  process.exit(0);
}

mustReplace(
  "// loop 167 divers swim prone — atlas flutter kick, Ryan paints the same pose\n",
  "// loop 168 pier stars, special orders, tank nursery, bay badges, share pier\n" +
  "// loop 167 divers swim prone — atlas flutter kick, Ryan paints the same pose\n",
  "header"
);

mustReplace(
  "    diveForTank: null, diveForAway: 0, diveForHunt: null,\n  };",
  "    diveForTank: null, diveForAway: 0, diveForHunt: null,\n" +
  "    // loop 168 — mid/late depth + shareable pier card\n" +
  "    hatchProg: padSpeciesNums([]), hatches: 0, ordersFilled: 0,\n" +
  "    pierOrder: null, badges: {}, badgeToast: null, sharePulse: 0,\n" +
  "  };",
  "state fields"
);

mustReplace(
  "      didFirstStock: false, didFirstSale: false,\n" +
  "      skin: \"skip\",\n" +
  "    };\n" +
  "  }\n" +
  "  function loadSave() {",
  "      didFirstStock: false, didFirstSale: false,\n" +
  "      skin: \"skip\",\n" +
  "      hatchProg: padSpeciesNums([]), hatches: 0, ordersFilled: 0,\n" +
  "      pierOrder: null, badges: {},\n" +
  "    };\n" +
  "  }\n" +
  "  function loadSave() {",
  "defaultSave"
);

mustReplace(
  "        lastPlayed: (d.lastPlayed > 0 ? +d.lastPlayed : 0),\n" +
  "        skin: normalizeSkin(d.skin),\n" +
  "      });\n" +
  "      ensureUnlockFlags();",
  "        lastPlayed: (d.lastPlayed > 0 ? +d.lastPlayed : 0),\n" +
  "        skin: normalizeSkin(d.skin),\n" +
  "        hatchProg: padSpeciesNums(Array.isArray(d.hatchProg) ? d.hatchProg : []),\n" +
  "        hatches: Math.max(0, d.hatches | 0),\n" +
  "        ordersFilled: Math.max(0, d.ordersFilled | 0),\n" +
  "        pierOrder: sanitizePierOrder(d.pierOrder),\n" +
  "        badges: (d.badges && typeof d.badges === \"object\") ? Object.assign({}, d.badges) : {},\n" +
  "      });\n" +
  "      ensureUnlockFlags();\n" +
  "      refreshBadges(true);",
  "loadSave"
);

mustReplace(
  "      didFirstStock: !!state.didFirstStock,\n" +
  "      didFirstSale: !!state.didFirstSale,\n" +
  "      skin: normalizeSkin(state.skin),\n" +
  "    };\n" +
  "  }\n" +
  "  function persist() {",
  "      didFirstStock: !!state.didFirstStock,\n" +
  "      didFirstSale: !!state.didFirstSale,\n" +
  "      skin: normalizeSkin(state.skin),\n" +
  "      hatchProg: padSpeciesNums(state.hatchProg),\n" +
  "      hatches: state.hatches | 0,\n" +
  "      ordersFilled: state.ordersFilled | 0,\n" +
  "      pierOrder: state.pierOrder || null,\n" +
  "      badges: state.badges || {},\n" +
  "    };\n" +
  "  }\n" +
  "  function persist() {",
  "savePayload"
);

mustReplace(
  "      didFirstStock: false, didFirstSale: false,\n" +
  "      shinyHold: 0, shinyHoldName: \"\",",
  "      didFirstStock: false, didFirstSale: false,\n" +
  "      hatchProg: padSpeciesNums([]), hatches: 0, ordersFilled: 0,\n" +
  "      pierOrder: null, badges: {}, badgeToast: null, sharePulse: 0,\n" +
  "      shinyHold: 0, shinyHoldName: \"\",",
  "resetSave"
);

const DEPTH_BLOCK = `
  // ===== LOOP 168 — pier depth (stars, orders, nursery, badges, share) =====
  const BADGE_DEFS = [
    { id: "shiny", name: "First Shiny", hint: "Bag a gold-outline fish" },
    { id: "wreck", name: "Wreck Scout", hint: "Find the east wreck" },
    { id: "streak3", name: "Slate Streak", hint: "Serve the slate 3 days" },
    { id: "core5", name: "Core Five", hint: "Unlock the first five bowls" },
    { id: "gallery", name: "Gallery Open", hint: "Open Sea Turtle" },
    { id: "whale", name: "Whale Road", hint: "Unlock Whale Shark" },
    { id: "stars4", name: "Four-Star Pier", hint: "Reach ★★★★" },
    { id: "order1", name: "Order Desk", hint: "Fill one special order" },
    { id: "hatch1", name: "Nursery", hint: "Hatch a tank shiny" },
    { id: "cash1k", name: "Peak $1k", hint: "Hit $1000 peak money" },
  ];
  function sanitizePierOrder(o) {
    if (!o || typeof o !== "object") return null;
    if (!Array.isArray(o.needs) || !o.needs.length) return null;
    const needs = [];
    const got = [];
    for (let i = 0; i < o.needs.length && i < 3; i++) {
      const n = o.needs[i];
      const s = n && (n.s | 0);
      const qty = Math.max(1, Math.min(6, (n && n.n) | 0 || 1));
      if (s < 0 || s >= SPECIES.length) continue;
      needs.push({ s: s, n: qty });
      got.push(Math.max(0, Math.min(qty, (Array.isArray(o.got) ? o.got[i] : 0) | 0)));
    }
    if (!needs.length) return null;
    return {
      needs: needs,
      got: got,
      pay: Math.max(20, o.pay | 0),
      life: Math.max(0, +o.life || 0),
      max: Math.max(30, +o.max || 90),
    };
  }
  function pierStars() {
    // Quiet until the first session ends — then stars track a real pier.
    if (!state.missionDone) return 0;
    let pts = 1;
    const unlocked = state.unlocked.filter(Boolean).length;
    if (unlocked >= 3) pts++;
    if (unlocked >= 8 || galleryOpen()) pts++;
    if ((state.peakMoney | 0) >= 400 || slateStreakN() >= 3 || state.sawWreck) pts++;
    if ((state.peakMoney | 0) >= 2000 || speciesUnlocked(12) || Object.keys(state.badges || {}).length >= 5) pts++;
    return clamp(pts, 1, 5);
  }
  function pierStarLabel() {
    const n = pierStars();
    if (n <= 0) return "";
    return "★".repeat(n) + "☆".repeat(5 - n);
  }
  function starTipBonus() {
    const n = pierStars();
    if (n <= 1) return 1;
    return 1 + (n - 1) * 0.06;
  }
  function starSpawnMul() {
    const n = pierStars();
    if (n <= 1) return 1;
    return 1 + (n - 1) * 0.08;
  }
  function badgeOwned(id) {
    return !!(state.badges && state.badges[id]);
  }
  function badgeMet(id) {
    if (id === "shiny") return !!state.caughtRare;
    if (id === "wreck") return !!state.sawWreck;
    if (id === "streak3") return slateStreakN() >= 3;
    if (id === "core5") {
      for (let i = 0; i < CORE_SPECIES; i++) if (!speciesUnlocked(i)) return false;
      return true;
    }
    if (id === "gallery") return galleryOpen();
    if (id === "whale") return speciesUnlocked(12);
    if (id === "stars4") return pierStars() >= 4;
    if (id === "order1") return (state.ordersFilled | 0) >= 1;
    if (id === "hatch1") return (state.hatches | 0) >= 1;
    if (id === "cash1k") return (state.peakMoney | 0) >= 1000;
    return false;
  }
  function refreshBadges(quiet) {
    if (!state.badges || typeof state.badges !== "object") state.badges = {};
    let earned = null;
    for (let i = 0; i < BADGE_DEFS.length; i++) {
      const b = BADGE_DEFS[i];
      if (state.badges[b.id]) continue;
      if (!badgeMet(b.id)) continue;
      state.badges[b.id] = 1;
      if (!earned) earned = b;
    }
    if (earned && !quiet) {
      state.badgeToast = { name: earned.name, life: 3.2, max: 3.2 };
      toast("Badge! " + earned.name, "#ffe27a", 3.0);
      sfx("unlock");
      persist();
    }
  }
  function rollPierOrder() {
    if (!state.missionDone) return;
    if ((state.sessionDay | 0) < 2) return;
    if (state.pierOrder && (state.pierOrder.life | 0) > 0) return;
    const pool = [];
    for (let i = 0; i < SPECIES.length; i++) {
      if (!speciesUnlocked(i)) continue;
      if (isWreckSpecies(i) && !state.sawWreck) continue;
      pool.push(i);
    }
    if (pool.length < 1) return;
    const day = Math.max(1, state.sessionDay | 0);
    const count = pool.length >= 3 && day >= 4 ? 2 : 1;
    const needs = [];
    const used = {};
    let pay = 0;
    for (let k = 0; k < count; k++) {
      let s = pool[(day * 13 + k * 7) % pool.length];
      let guard = 0;
      while (used[s] && guard++ < 8) s = pool[(s + 1 + k) % pool.length];
      used[s] = 1;
      const qty = 1 + ((day + k) % 3 === 0 ? 1 : 0);
      needs.push({ s: s, n: qty });
      pay += (SPECIES[s].price | 0) * qty;
    }
    pay = Math.max(28, Math.round(pay * (1.35 + pierStars() * 0.12)));
    const life = 75 + Math.min(45, day * 3);
    state.pierOrder = { needs: needs, got: needs.map(function () { return 0; }), pay: pay, life: life, max: life };
    persist();
  }
  function pierOrderReady() {
    return !!(state.pierOrder && state.pierOrder.needs && state.pierOrder.needs.length);
  }
  function pierOrderDone() {
    if (!pierOrderReady()) return false;
    const o = state.pierOrder;
    for (let i = 0; i < o.needs.length; i++) {
      if ((o.got[i] | 0) < (o.needs[i].n | 0)) return false;
    }
    return true;
  }
  function pierOrderLabel() {
    if (!pierOrderReady()) return "";
    const o = state.pierOrder;
    const bits = [];
    for (let i = 0; i < o.needs.length; i++) {
      const sp = SPECIES[o.needs[i].s];
      bits.push((o.got[i] | 0) + "/" + o.needs[i].n + " " + (sp ? sp.name : "?"));
    }
    return bits.join(" + ");
  }
  function noteOrderSale(speciesId) {
    if (!pierOrderReady()) return;
    const o = state.pierOrder;
    let hit = false;
    for (let i = 0; i < o.needs.length; i++) {
      if ((o.needs[i].s | 0) !== (speciesId | 0)) continue;
      if ((o.got[i] | 0) >= (o.needs[i].n | 0)) continue;
      o.got[i] = (o.got[i] | 0) + 1;
      hit = true;
      break;
    }
    if (!hit) return;
    if (pierOrderDone()) completePierOrder();
    else persist();
  }
  function completePierOrder() {
    if (!pierOrderReady()) return;
    const o = state.pierOrder;
    const pay = o.pay | 0;
    state.pierOrder = null;
    state.ordersFilled = (state.ordersFilled | 0) + 1;
    state.money += pay;
    state.moneyRollFrom = state.displayMoney;
    state.moneyRollTo = state.money;
    state.moneyRollT = 0.35;
    state.moneyPunch = 1.28;
    toast("Order filled! +$" + pay, "#9ef0ff", 3.2);
    pop(DAY_BOARD.x + 110, DAY_BOARD.y - 40, "ORDER +$" + pay, "#9ef0ff", 1.2, 1.4);
    spawnP(DAY_BOARD.x + 90, DAY_BOARD.y - 10, 18, ["#9ef0ff", "#ffe27a", "#fff6e8"], 90);
    sfx("cashin");
    refreshBadges(false);
    persist();
    checkSessionGoals();
  }
  function updatePierOrder(dt) {
    if (!pierOrderReady() || state.mode !== "play") return;
    const o = state.pierOrder;
    o.life = Math.max(0, (+o.life || 0) - dt);
    if (o.life <= 0) {
      state.pierOrder = null;
      toast("Order expired — next day rolls a new one", "#ff8a7a", 2.6);
      persist();
    }
  }
  function updateTankNursery(dt) {
    if (state.mode !== "play" || state.scene !== "shop" || !state.missionDone) return;
    if (!state.hatchProg || state.hatchProg.length < SPECIES.length) {
      state.hatchProg = padSpeciesNums(state.hatchProg);
    }
    const stars = pierStars();
    const decor = state.decor || [false, false, false];
    const decorMul = 1 + (decor[0] ? 0.08 : 0) + (decor[2] ? 0.12 : 0);
    for (let i = 0; i < SPECIES.length; i++) {
      if (!speciesUnlocked(i)) continue;
      const stock = (state.stock[i] | 0);
      if (stock <= 0) {
        state.hatchProg[i] = Math.max(0, (state.hatchProg[i] || 0) - dt * 0.04);
        continue;
      }
      if (stock >= 10) continue;
      const rare = (state.stockRare && state.stockRare[i]) | 0;
      const rate = (0.011 + Math.min(0.01, stock * 0.0015) + Math.min(0.012, rare * 0.004))
        * (1 + stars * 0.07) * decorMul;
      state.hatchProg[i] = (state.hatchProg[i] || 0) + dt * rate;
      if (state.hatchProg[i] < 1) continue;
      state.hatchProg[i] = 0;
      state.stock[i] = (state.stock[i] | 0) + 1;
      if (!state.stockRare || state.stockRare.length < SPECIES.length) {
        state.stockRare = padSpeciesNums(state.stockRare);
      }
      state.stockRare[i] = (state.stockRare[i] | 0) + 1;
      state.hatches = (state.hatches | 0) + 1;
      state.caughtRare = true;
      const t = TANK_POS[i];
      if (t) {
        const tx = t.x + TANK_W / 2, ty = t.y + TANK_H * 0.4;
        pop(tx, ty - 18, "HATCH!", "#ffd24a", 1.15, 1.3);
        spawnP(tx, ty, 16, ["#ffd24a", SPECIES[i].color, "#fff6e8"], 80);
        if (tankFish[i].length < 10) {
          tankFish[i].push({ x: rand(24, TANK_W - 24), y: rand(36, TANK_H - 18), a: rand(0, 6), ph: rand(0, 20), rare: true });
        }
      }
      toast("Nursery! Shiny " + SPECIES[i].name + " hatched", "#ffd24a", 3.0);
      sfx("shiny");
      refreshBadges(false);
      persist();
    }
  }
  function sharePierBlurb() {
    const stars = pierStars();
    const starTxt = stars > 0 ? ("★".repeat(stars) + " ") : "";
    const nSp = state.unlocked.filter(Boolean).length;
    const peak = Math.max(state.peakMoney | 0, state.money | 0);
    const day = Math.max(1, state.sessionDay | 0);
    const badgeN = Object.keys(state.badges || {}).length;
    const lines = [
      starTxt + "Aqua Bay pier — $" + peak + " peak · " + nSp + " species · day " + day +
        (badgeN ? (" · " + badgeN + " badges") : ""),
      "Dive. Stock. Sell. Free in your browser — no account:",
      "https://tuanbui1.github.io/aqua-bay/",
      "#AquaBay #IndieGame",
    ];
    return lines.join("\\n");
  }
  function sharePier() {
    const text = sharePierBlurb();
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (e) {}
    try {
      if (navigator.share) {
        navigator.share({ title: "Aqua Bay", text: text, url: "https://tuanbui1.github.io/aqua-bay/" }).catch(function () {});
      }
    } catch (e) {}
    state.sharePulse = 1.4;
    if (copied) toast("Pier card copied — paste anywhere", "#9ef0ff", 3.0);
    else toast("Copy failed — try Export save", "#ff8a7a", 2.4);
    sfx("click");
  }
  function drawPierStarsHud() {
    if (!state.missionDone || state.mode !== "play") return;
    const n = pierStars();
    if (n <= 0) return;
    const lay = ribbonLayout();
    const money = moneyHudBox(lay);
    const x = money.x;
    const y = money.y + money.h + phoneCss(6);
    const label = pierStarLabel();
    const w = Math.max(phoneCss(88), Math.round(ctx.measureText ? 0 : 0) || phoneCss(100));
    ctx.save();
    ctx.font = "700 " + phoneCss(13) + "px Nunito, sans-serif";
    const tw = Math.ceil(ctx.measureText(label).width) + phoneCss(18);
    const bw = Math.max(phoneCss(92), tw);
    const bh = phoneCss(26);
    ctx.fillStyle = "rgba(18, 32, 42, 0.94)";
    roundRect(x, y, bw, bh, 8); ctx.fill();
    ctx.strokeStyle = "rgba(232, 192, 74, 0.55)";
    ctx.lineWidth = 1.4;
    roundRect(x, y, bw, bh, 8); ctx.stroke();
    ctx.fillStyle = "#ffe27a";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + phoneCss(8), y + bh / 2 + 1);
    ctx.textBaseline = "alphabetic";
    ctx.restore();
  }
  function drawOrderHud() {
    if (!pierOrderReady() || state.mode !== "play" || state.scene !== "shop") return;
    const o = state.pierOrder;
    const label = "ORDER " + pierOrderLabel() + " · $" + (o.pay | 0);
    const secs = Math.ceil(o.life | 0);
    const sub = secs + "s";
    const x = phoneCss(12);
    const y = visibleStageBottom() - phoneCss(118);
    ctx.save();
    ctx.font = "700 " + phoneCss(13) + "px Nunito, sans-serif";
    const tw = Math.ceil(ctx.measureText(label).width) + phoneCss(16);
    const bw = Math.min(W - phoneCss(24), Math.max(phoneCss(160), tw));
    const bh = phoneCss(36);
    ctx.fillStyle = "rgba(12, 36, 48, 0.92)";
    roundRect(x, y, bw, bh, 9); ctx.fill();
    ctx.strokeStyle = "#9ef0ff";
    ctx.lineWidth = 1.6;
    roundRect(x, y, bw, bh, 9); ctx.stroke();
    ctx.fillStyle = "#9ef0ff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + phoneCss(8), y + phoneCss(13));
    ctx.fillStyle = "#ffe27a";
    ctx.font = "700 " + phoneCss(12) + "px Nunito, sans-serif";
    ctx.fillText(sub, x + phoneCss(8), y + phoneCss(26));
    ctx.textBaseline = "alphabetic";
    ctx.restore();
  }
  function drawBadgeToast() {
    if (!state.badgeToast) return;
    const u = clamp(state.badgeToast.life / state.badgeToast.max, 0, 1);
    const a = u > 0.85 ? (1 - u) / 0.15 : (u < 0.2 ? u / 0.2 : 1);
    ctx.save();
    ctx.globalAlpha = a;
    const text = "★ " + state.badgeToast.name;
    ctx.font = "800 " + phoneCss(22) + "px Fredoka, sans-serif";
    ctx.textAlign = "center";
    const y = H * 0.22;
    ctx.fillStyle = "rgba(8, 20, 28, 0.7)";
    ctx.fillText(text, W / 2 + 2, y + 2);
    ctx.fillStyle = "#ffe27a";
    ctx.fillText(text, W / 2, y);
    ctx.restore();
  }
`;

mustReplace(
  "  function dayBoardReady() {\n    return !!state.missionDone && !!state.dayGuest && (state.dayWant | 0) >= 0;\n  }",
  DEPTH_BLOCK + "\n  function dayBoardReady() {\n    return !!state.missionDone && !!state.dayGuest && (state.dayWant | 0) >= 0;\n  }",
  "depth block"
);

mustReplace(
  "    const payMult = c.payMult || 1;\n" +
  "    const rare2 = rareSale ? 2 : 1;\n" +
  "    const pay = Math.round(price * stockBonus * bagBonus * payMult * rare2);",
  "    const payMult = c.payMult || 1;\n" +
  "    const rare2 = rareSale ? 2 : 1;\n" +
  "    const starTip = starTipBonus();\n" +
  "    const pay = Math.round(price * stockBonus * bagBonus * payMult * rare2 * starTip);",
  "salePayParts"
);

mustReplace(
  "    const decorMul = 1 + (dec[0] ? 0.04 : 0) + (dec[1] ? 0.04 : 0) + (dec[2] ? 0.06 : 0);\n" +
  "    const rate = (0.22 + totalFish * 0.045 + state.unlocked.filter(Boolean).length * 0.04) * decorMul;",
  "    const decorMul = 1 + (dec[0] ? 0.04 : 0) + (dec[1] ? 0.04 : 0) + (dec[2] ? 0.06 : 0);\n" +
  "    const rate = (0.22 + totalFish * 0.045 + state.unlocked.filter(Boolean).length * 0.04) * decorMul * starSpawnMul();",
  "spawn rate"
);

mustReplace(
  "    if (Math.random() >= 0.12) return false;",
  "    if (Math.random() >= (0.12 + Math.max(0, pierStars() - 1) * 0.02)) return false;",
  "vip chance"
);

mustReplace(
  "            state.sessionSales = (state.sessionSales | 0) + 1;\n" +
  "            if (!bagHasStockable() && cashNeedsCollect()) {",
  "            state.sessionSales = (state.sessionSales | 0) + 1;\n" +
  "            noteOrderSale(c.carry);\n" +
  "            refreshBadges(false);\n" +
  "            if (!bagHasStockable() && cashNeedsCollect()) {",
  "sale hooks"
);

mustReplace(
    "    rollDayGuest();\n" +
    "    if (dayBoardReady()) pool.push(\"guest\");",
    "    rollDayGuest();\n" +
    "    rollPierOrder();\n" +
    "    if (dayBoardReady()) pool.push(\"guest\");\n" +
    "    if (pierOrderReady()) pool.push(\"order\");",
    "roll order"
);

// session goal support for order
mustReplace(
  "    if (id === \"serve\") return \"Serve 3 customers  \" + Math.min(3, state.sessionSales | 0) + \"/3\";",
  "    if (id === \"serve\") return \"Serve 3 customers  \" + Math.min(3, state.sessionSales | 0) + \"/3\";\n" +
  "    if (id === \"order\") return pierOrderReady() ? (\"Fill order  ·  \" + pierOrderLabel()) : \"Fill a special order\";",
  "goal label"
);

mustReplace(
  "    if (id === \"serve\") return (state.sessionSales | 0) >= 3;",
  "    if (id === \"serve\") return (state.sessionSales | 0) >= 3;\n" +
  "    if (id === \"order\") return (state.ordersFilled | 0) > 0 && !pierOrderReady();",
  "goal met"
);

// Fix order goal met - better: complete when ordersFilled increased this session
// Actually simpler: sessionGoalMet for order when !pierOrderReady && ordersFilled >= 1 after fill
// Problem: after fill pierOrder is null so met returns true even on day without order
// Better track sessionOrderDone

mustReplace(
  "    state.sessionSable = false;\n" +
  "    state.sessionDiveCatch = 0;",
  "    state.sessionSable = false;\n" +
  "    state.sessionOrderDone = false;\n" +
  "    state.sessionDiveCatch = 0;",
  "session order flag"
);

mustReplace(
  "    if (id === \"order\") return (state.ordersFilled | 0) > 0 && !pierOrderReady();",
  "    if (id === \"order\") return !!state.sessionOrderDone;",
  "goal met fix"
);

mustReplace(
  "    state.ordersFilled = (state.ordersFilled | 0) + 1;\n" +
  "    state.money += pay;",
  "    state.ordersFilled = (state.ordersFilled | 0) + 1;\n" +
  "    state.sessionOrderDone = true;\n" +
  "    state.money += pay;",
  "session order done"
);

mustReplace(
  "    if (id === \"export\") { exportSave(); return; }\n" +
  "    if (id === \"import\") { pickImportSave(); return; }",
  "    if (id === \"export\") { exportSave(); return; }\n" +
  "    if (id === \"import\") { pickImportSave(); return; }\n" +
  "    if (id === \"share\") { sharePier(); return; }",
  "share ui"
);

mustReplace(
  "        updateCashier(sim);\n" +
  "        updateDivers(sim);\n" +
  "        state.playClock = (state.playClock || 0) + dt;",
  "        updateCashier(sim);\n" +
  "        updateDivers(sim);\n" +
  "        updatePierOrder(sim);\n" +
  "        updateTankNursery(sim);\n" +
  "        if (state.badgeToast) {\n" +
  "          state.badgeToast.life -= dt;\n" +
  "          if (state.badgeToast.life <= 0) state.badgeToast = null;\n" +
  "        }\n" +
  "        if (state.sharePulse > 0) state.sharePulse = Math.max(0, state.sharePulse - dt);\n" +
  "        state.playClock = (state.playClock || 0) + dt;",
  "frame updates"
);

mustReplace(
  "      drawHUD();\n" +
  "      drawWelcomeBack();",
  "      drawHUD();\n" +
  "      drawPierStarsHud();\n" +
  "      drawOrderHud();\n" +
  "      drawBadgeToast();\n" +
  "      drawWelcomeBack();",
  "draw hud extras"
);

mustReplace(
  "      ctx.fillText(\"$\" + (state.money | 0) + \"  ·  \" + nSp + \" species unlocked\", W / 2, lay.captionY);",
  "      const starCap = pierStars() > 0 ? (\"  ·  \" + pierStarLabel()) : \"\";\n" +
  "      ctx.fillText(\"$\" + (state.money | 0) + \"  ·  \" + nSp + \" species unlocked\" + starCap, W / 2, lay.captionY);",
  "title caption"
);

mustReplace(
  "      panelBtn(\"export\", W / 2 - btnW / 2, y, half, saveH, \"Export save\", \"#2a7d8a\", 1, saveFont);\n" +
  "      panelBtn(\"import\", W / 2 - btnW / 2 + half + 10, y, half, saveH, \"Import save\", \"#3d6f7a\", 1, saveFont);\n" +
  "      y += saveH + (tall ? 10 : 8);",
  "      panelBtn(\"export\", W / 2 - btnW / 2, y, half, saveH, \"Export save\", \"#2a7d8a\", 1, saveFont);\n" +
  "      panelBtn(\"import\", W / 2 - btnW / 2 + half + 10, y, half, saveH, \"Import save\", \"#3d6f7a\", 1, saveFont);\n" +
  "      y += saveH + (tall ? 10 : 8);\n" +
  "      const sharePulse = 1 + Math.min(0.08, (state.sharePulse || 0) * 0.06);\n" +
  "      panelBtn(\"share\", W / 2 - btnW / 2, y, btnW, saveH, \"Share my pier\", \"#c48a2a\", sharePulse, saveFont);\n" +
  "      y += saveH + (tall ? 10 : 8);",
  "pause share"
);

mustReplace(
  "        \"Divers swim prone — flutter kick, arms along the body\",\n" +
  "        \"Pause → Export save — keep your shop if the browser clears\",",
  "        \"Divers swim prone — flutter kick, arms along the body\",\n" +
  "        \"Pier stars rise with unlocks, streaks, and peak cash — denser crowds + better tips\",\n" +
  "        \"Special ORDER goals appear after day 2 — sell the listed fish before the timer\",\n" +
  "        \"Stocked tanks hatch shinies over time (nursery) — rares + decor speed it up\",\n" +
  "        \"Earn bay badges — Pause → Share my pier copies a card you can post\",\n" +
  "        \"Pause → Export save — keep your shop if the browser clears\",",
  "help lines"
);

fs.writeFileSync(file, src);
console.log("applied c168 world-class bay");
