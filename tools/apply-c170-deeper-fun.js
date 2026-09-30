#!/usr/bin/env node
// Apply loop 170 — deeper forever bands with pearl caches, depth records, deep fun.
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

if (/loop 170 deeper forever/.test(src)) {
  console.log("already applied");
  process.exit(0);
}

mustReplace(
  "// loop 169 divers walk + swim verified for Skip / Reef / Dino / Ryan\n",
  "// loop 170 deeper forever bands — pearl caches, depth records, deep catch fun\n" +
  "// loop 169 divers walk + swim verified for Skip / Reef / Dino / Ryan\n",
  "header"
);

mustReplace(
  "  const FOREVER_ZONE_NAMES = [\n" +
  "    \"Midnight trench\", \"Crystal canyon\", \"Glow abyss\", \"Starfall hollow\",\n" +
  "    \"Ribbon rift\", \"Quiet cathedral\", \"Lantern stairs\", \"Forever blue\",\n" +
  "  ];\n",
  "  const FOREVER_ZONE_NAMES = [\n" +
  "    \"Midnight trench\", \"Crystal canyon\", \"Glow abyss\", \"Starfall hollow\",\n" +
  "    \"Ribbon rift\", \"Quiet cathedral\", \"Lantern stairs\", \"Forever blue\",\n" +
  "    \"Pressure garden\", \"Echo vault\", \"Cobalt stairs\", \"Pearl sink\",\n" +
  "  ];\n" +
  "  const DEPTH_CACHE_PAY_BASE = 28;\n",
  "forever names"
);

mustReplace(
  "    diveForTank: null, diveForAway: 0, diveForHunt: null,\n" +
  "    // loop 168 — mid/late depth + shareable pier card\n",
  "    diveForTank: null, diveForAway: 0, diveForHunt: null,\n" +
  "    deepestM: 0, depthCombo: 0, depthCaches: {}, sessionPearl: false, depthRecordToast: 0,\n" +
  "    // loop 168 — mid/late depth + shareable pier card\n",
  "state fields"
);

mustReplace(
  "      hatchProg: padSpeciesNums([]), hatches: 0, ordersFilled: 0,\n" +
  "      pierOrder: null, badges: {},\n" +
  "    };\n" +
  "  }\n" +
  "  function loadSave() {",
  "      hatchProg: padSpeciesNums([]), hatches: 0, ordersFilled: 0,\n" +
  "      pierOrder: null, badges: {},\n" +
  "      deepestM: 0, depthCaches: {},\n" +
  "    };\n" +
  "  }\n" +
  "  function loadSave() {",
  "defaultSave"
);

mustReplace(
  "        hatchProg: padSpeciesNums(Array.isArray(d.hatchProg) ? d.hatchProg : []),\n" +
  "        hatches: Math.max(0, d.hatches | 0),\n" +
  "        ordersFilled: Math.max(0, d.ordersFilled | 0),\n" +
  "        pierOrder: sanitizePierOrder(d.pierOrder),\n" +
  "        badges: (d.badges && typeof d.badges === \"object\") ? Object.assign({}, d.badges) : {},\n" +
  "      });\n" +
  "      ensureUnlockFlags();\n" +
  "      refreshBadges(true);",
  "        hatchProg: padSpeciesNums(Array.isArray(d.hatchProg) ? d.hatchProg : []),\n" +
  "        hatches: Math.max(0, d.hatches | 0),\n" +
  "        ordersFilled: Math.max(0, d.ordersFilled | 0),\n" +
  "        pierOrder: sanitizePierOrder(d.pierOrder),\n" +
  "        badges: (d.badges && typeof d.badges === \"object\") ? Object.assign({}, d.badges) : {},\n" +
  "        deepestM: Math.max(0, d.deepestM | 0),\n" +
  "        depthCaches: (d.depthCaches && typeof d.depthCaches === \"object\") ? Object.assign({}, d.depthCaches) : {},\n" +
  "        depthCombo: 0, sessionPearl: false, depthRecordToast: 0,\n" +
  "      });\n" +
  "      ensureUnlockFlags();\n" +
  "      refreshBadges(true);",
  "loadSave"
);

mustReplace(
  "      badges: state.badges || {},\n" +
  "    };\n" +
  "  }\n" +
  "  function persist() {",
  "      badges: state.badges || {},\n" +
  "      deepestM: state.deepestM | 0,\n" +
  "      depthCaches: state.depthCaches || {},\n" +
  "    };\n" +
  "  }\n" +
  "  function persist() {",
  "savePayload"
);

mustReplace(
  "      hatchProg: padSpeciesNums([]), hatches: 0, ordersFilled: 0,\n" +
  "      pierOrder: null, badges: {}, badgeToast: null, sharePulse: 0,\n" +
  "      shinyHold: 0, shinyHoldName: \"\",",
  "      hatchProg: padSpeciesNums([]), hatches: 0, ordersFilled: 0,\n" +
  "      pierOrder: null, badges: {}, badgeToast: null, sharePulse: 0,\n" +
  "      deepestM: 0, depthCombo: 0, depthCaches: {}, sessionPearl: false, depthRecordToast: 0,\n" +
  "      shinyHold: 0, shinyHoldName: \"\",",
  "resetSave"
);

// Expand forever zone naming to 12 names
mustReplace(
  "    return { name: FOREVER_ZONE_NAMES[forever % 8] + \" · \" + lap, s, y0, y1: y0 + ZONE_STEP, forever: true };",
  "    const nameN = FOREVER_ZONE_NAMES.length || 8;\n" +
  "    return { name: FOREVER_ZONE_NAMES[forever % nameN] + \" · \" + lap, s, y0, y1: y0 + ZONE_STEP, forever: true, lap: lap, band: band };",
  "zone forever name"
);

mustReplace(
  "  function isChestTarget(f) {\n    return !!(f && f.chest);\n  }",
  "  function isChestTarget(f) {\n    return !!(f && (f.chest || f.depthCache));\n  }\n" +
  "  function isDepthCache(f) {\n    return !!(f && f.depthCache);\n  }\n" +
  "  function foreverLapAt(y) {\n" +
  "    if (y < OCEAN_BASE_H) return 0;\n" +
  "    const band = ((y - OCEAN_BASE_H) / ZONE_STEP) | 0;\n" +
  "    if (band < 8) return 0;\n" +
  "    return ((band - 8) / (FOREVER_ZONE_NAMES.length || 8) | 0) + 1;\n" +
  "  }\n" +
  "  function depthCacheKey(band) {\n" +
  "    return \"b\" + (band | 0);\n" +
  "  }\n" +
  "  function depthCacheTaken(band) {\n" +
  "    if (!state.depthCaches || typeof state.depthCaches !== \"object\") state.depthCaches = {};\n" +
  "    return !!(state.depthCaches[depthCacheKey(band)]);\n" +
  "  }\n" +
  "  function markDepthCacheTaken(band) {\n" +
  "    if (!state.depthCaches || typeof state.depthCaches !== \"object\") state.depthCaches = {};\n" +
  "    state.depthCaches[depthCacheKey(band)] = 1;\n" +
  "  }\n" +
  "  function depthCachePos(band) {\n" +
  "    const y0 = OCEAN_BASE_H + band * ZONE_STEP;\n" +
  "    const salt = (band * 97 + 13) % 1000;\n" +
  "    return {\n" +
  "      x: 420 + (salt % 7) * 340,\n" +
  "      y: y0 + 120 + (salt % 5) * 48,\n" +
  "      band: band,\n" +
  "    };\n" +
  "  }\n" +
  "  function depthCacheTarget() {\n" +
  "    if (state.scene !== \"ocean\" || player.y < OCEAN_BASE_H - 20) return null;\n" +
  "    const band = ((Math.max(0, player.y - OCEAN_BASE_H)) / ZONE_STEP) | 0;\n" +
  "    // Named deep bowls (5–12) + forever bands can hide a pearl cache.\n" +
  "    if (band < 0) return null;\n" +
  "    if (depthCacheTaken(band)) return null;\n" +
  "    const p = depthCachePos(band);\n" +
  "    if (!state.depthCacheObj || state.depthCacheObj.band !== band) {\n" +
  "      state.depthCacheObj = { depthCache: true, chest: false, band: band, x: p.x, y: p.y, vx: 0, vy: 0, ang: 0 };\n" +
  "    }\n" +
  "    state.depthCacheObj.x = p.x;\n" +
  "    state.depthCacheObj.y = p.y;\n" +
  "    return state.depthCacheObj;\n" +
  "  }\n" +
  "  function depthPayMult(y) {\n" +
  "    if (y < OCEAN_BASE_H) return 1;\n" +
  "    const band = ((y - OCEAN_BASE_H) / ZONE_STEP) | 0;\n" +
  "    if (band < 8) return 1 + Math.min(0.2, (band + 1) * 0.025);\n" +
  "    const lap = foreverLapAt(y);\n" +
  "    return 1 + Math.min(0.55, 0.12 + lap * 0.08);\n" +
  "  }\n" +
  "  function noteDepthRecord() {\n" +
  "    if (state.scene !== \"ocean\") return;\n" +
  "    const m = depthMeters(player.y);\n" +
  "    if (m <= (state.deepestM | 0)) return;\n" +
  "    const prev = state.deepestM | 0;\n" +
  "    state.deepestM = m;\n" +
  "    // Milestone every ~40m after the turtle meadow floor.\n" +
  "    if (m >= 70 && (prev < 70 || ((m / 40) | 0) > ((prev / 40) | 0))) {\n" +
  "      const tip = 8 + Math.min(40, ((m / 40) | 0) * 4);\n" +
  "      state.money += tip;\n" +
  "      state.moneyRollFrom = state.displayMoney;\n" +
  "      state.moneyRollTo = state.money;\n" +
  "      state.moneyRollT = 0.28;\n" +
  "      state.moneyPunch = 1.18;\n" +
  "      toast(\"Depth record \" + m + \"m! +$\" + tip, \"#9ef0ff\", 2.8);\n" +
  "      pop(player.x, player.y - 36, m + \"m!\", \"#9ef0ff\", 1.2, 1.35);\n" +
  "      spawnP(player.x, player.y, 14, [\"#9ef0ff\", \"#ffe27a\", \"#fff6e8\"], 70);\n" +
  "      sfx(\"unlock\");\n" +
  "      state.depthRecordToast = 2.4;\n" +
  "      persist();\n" +
  "      checkSessionGoals();\n" +
  "    } else {\n" +
  "      persist();\n" +
  "    }\n" +
  "  }\n" +
  "  function openDepthCache(cache) {\n" +
  "    if (!cache || !cache.depthCache) return;\n" +
  "    const band = cache.band | 0;\n" +
  "    if (depthCacheTaken(band)) return;\n" +
  "    markDepthCacheTaken(band);\n" +
  "    state.sessionPearl = true;\n" +
  "    const lap = band < 8 ? 1 : foreverLapAt(cache.y);\n" +
  "    const pay = DEPTH_CACHE_PAY_BASE + Math.min(90, band * 6 + lap * 10);\n" +
  "    state.money += pay;\n" +
  "    state.moneyRollFrom = state.displayMoney;\n" +
  "    state.moneyRollTo = state.money;\n" +
  "    state.moneyRollT = 0.35;\n" +
  "    state.moneyPunch = 1.3;\n" +
  "    spawnP(cache.x, cache.y, 28, [\"#ffe27a\", \"#9ef0ff\", \"#fff6e8\", \"#c4a0ff\"], 120);\n" +
  "    pop(cache.x, cache.y - 24, \"DEPTH PEARL +$\" + pay, \"#9ef0ff\", 1.25, 1.4);\n" +
  "    sfx(\"unlock\");\n" +
  "    toast(\"Depth pearl! +$\" + pay, \"#9ef0ff\", 3.0);\n" +
  "    // A shiny hitchhikes out of cold water — bag if room.\n" +
  "    if (state.bag.length < bagMax()) {\n" +
  "      const sid = highestUnlockedSafe();\n" +
  "      state.bag.push(sid);\n" +
  "      if (!state.bagRare) state.bagRare = [];\n" +
  "      state.bagRare.push(true);\n" +
  "      state.caughtRare = true;\n" +
  "      state.bagPunch = 1.3;\n" +
  "      pop(cache.x + 16, cache.y - 42, \"SHINY!\", \"#ffd24a\");\n" +
  "    } else {\n" +
  "      pushOceanFish(highestUnlockedSafe(), cache.x + 30, cache.y - 18, { rare: true });\n" +
  "    }\n" +
  "    player.catchProg = 0;\n" +
  "    player.target = null;\n" +
  "    player.scoopLock = null;\n" +
  "    player.scoopTap = false;\n" +
  "    player.catchLatch = true;\n" +
  "    state.depthCacheObj = null;\n" +
  "    checkSessionGoals();\n" +
  "    refreshBadges(false);\n" +
  "    persist();\n" +
  "  }",
  "depth helpers"
);

mustReplace(
  "  function beginCatchClimax(f) {\n" +
  "    if (isChestTarget(f)) {\n" +
  "      openWreckChest();\n" +
  "      return;\n" +
  "    }",
  "  function beginCatchClimax(f) {\n" +
  "    if (isDepthCache(f)) {\n" +
  "      openDepthCache(f);\n" +
  "      return;\n" +
  "    }\n" +
  "    if (f && f.chest) {\n" +
  "      openWreckChest();\n" +
  "      return;\n" +
  "    }",
  "climax chest vs cache"
);

// Include depth cache in cone targeting alongside wreck chest
mustReplace(
  "    const chest = wreckChestTarget();\n" +
  "    if (chest) {\n" +
  "      const d = Math.hypot(chest.x - wx, chest.y - wy);\n" +
  "      if (d < bestD) best = chest;\n",
  "    const chest = wreckChestTarget();\n" +
  "    if (chest) {\n" +
  "      const d = Math.hypot(chest.x - wx, chest.y - wy);\n" +
  "      if (d < bestD) best = chest;\n" +
  "    }\n" +
  "    const dCache = depthCacheTarget();\n" +
  "    if (dCache) {\n" +
  "      const d = Math.hypot(dCache.x - wx, dCache.y - wy);\n" +
  "      if (d < bestD) { best = dCache; bestD = d; }\n",
  "cone pick cache"
);

// There may be two similar chest blocks - need to check. Let me use more context for the second one in fishInConeNearest style functions.
// Actually the first replace might have broken brace - I closed wrong. Let me read after apply.

mustReplace(
  "    if (id === \"deep\") return \"Dive a new zone\";",
  "    if (id === \"deep\") return \"Dive a new zone\";\n" +
  "    if (id === \"record\") return \"Set a depth record  \" + (state.deepestM | 0) + \"m\";\n" +
  "    if (id === \"pearl\") return \"Crack a depth pearl\";",
  "goal labels"
);

mustReplace(
  "    if (id === \"deep\") return (state.sessionSawDeep | 0) > (state.goalDeepAt | 0);",
  "    if (id === \"deep\") return (state.sessionSawDeep | 0) > (state.goalDeepAt | 0);\n" +
  "    if (id === \"record\") return (state.depthRecordToast | 0) > 0 || ((state.deepestM | 0) > 0 && !!state.sessionDepthRecord);\n" +
  "    if (id === \"pearl\") return !!state.sessionPearl;",
  "goal met"
);

mustReplace(
  "    if (state.unlocked[4]) pool.push(\"deep\");",
  "    if (state.unlocked[4]) pool.push(\"deep\");\n" +
  "    if ((state.deepestM | 0) >= 60 || state.unlocked[4]) pool.push(\"record\");\n" +
  "    if (state.unlocked[5] || (state.deepestM | 0) >= 80) pool.push(\"pearl\");",
  "goal pool"
);

mustReplace(
  "    state.sessionOrderDone = false;\n" +
  "    state.sessionDiveCatch = 0;",
  "    state.sessionOrderDone = false;\n" +
  "    state.sessionPearl = false;\n" +
  "    state.sessionDepthRecord = false;\n" +
  "    state.sessionDiveCatch = 0;",
  "session flags"
);

// Fix record goal met to use sessionDepthRecord
mustReplace(
  "    if (id === \"record\") return (state.depthRecordToast | 0) > 0 || ((state.deepestM | 0) > 0 && !!state.sessionDepthRecord);",
  "    if (id === \"record\") return !!state.sessionDepthRecord;",
  "record goal met fix"
);

mustReplace(
  "      state.depthRecordToast = 2.4;\n" +
  "      persist();\n" +
  "      checkSessionGoals();\n" +
  "    } else {\n" +
  "      persist();\n" +
  "    }\n" +
  "  }",
  "      state.depthRecordToast = 2.4;\n" +
  "      state.sessionDepthRecord = true;\n" +
  "      persist();\n" +
  "      checkSessionGoals();\n" +
  "    } else {\n" +
  "      persist();\n" +
  "    }\n" +
  "  }",
  "session depth record"
);

// catchFish depth combo + bagBonus
mustReplace(
  "  function catchFish(f) {\n" +
  "    f.caught = true;\n" +
  "    f.verb = \"\";\n" +
  "    state.catchVerb = null;\n" +
  "    state.bag.push(f.s);",
  "  function catchFish(f) {\n" +
  "    f.caught = true;\n" +
  "    f.verb = \"\";\n" +
  "    state.catchVerb = null;\n" +
  "    // loop 170 — deep scoops stack a DEPTH combo and bump bag pay.\n" +
  "    if (player.y >= OCEAN_BASE_H - 40) {\n" +
  "      state.depthCombo = (state.depthCombo | 0) + 1;\n" +
  "      const dm = depthPayMult(player.y);\n" +
  "      state.bagBonus = Math.max(state.bagBonus || 1, Math.min(1.55, dm + (state.depthCombo | 0) * 0.03));\n" +
  "      if ((state.depthCombo | 0) >= 2) {\n" +
  "        pop(player.x, player.y - 48, \"DEPTH ×\" + state.depthCombo, \"#9ef0ff\", 1.05, 1.15);\n" +
  "      }\n" +
  "    } else {\n" +
  "      state.depthCombo = 0;\n" +
  "    }\n" +
  "    noteDepthRecord();\n" +
  "    state.bag.push(f.s);",
  "catchFish depth"
);

// ensureNearbyFish rares in forever
mustReplace(
  "      const local = zoneAtDepth(player.y, player.x);\n" +
  "      const sid = local.wreck ? 13 : (state.unlocked[local.s] ? local.s : 0);\n" +
  "      pushOceanFish(sid, player.x + Math.cos(ang) * d, player.y + Math.sin(ang) * d + 50);",
  "      const local = zoneAtDepth(player.y, player.x);\n" +
  "      const sid = local.wreck ? 13 : (state.unlocked[local.s] ? local.s : 0);\n" +
  "      const deepRare = !!(local.forever && Math.random() < Math.min(0.28, 0.08 + (local.lap || 1) * 0.05));\n" +
  "      pushOceanFish(sid, player.x + Math.cos(ang) * d, player.y + Math.sin(ang) * d + 50, deepRare ? { rare: true } : null);",
  "nearby deep rares"
);

// updateReefPresence - also note depth record + zone toast longer for forever
mustReplace(
  "        state.zoneTitle = { text: z.name.toUpperCase(), life: 0.55, max: 0.55 };\n" +
  "        if ((state.sawDeepZone | 0) < tag) {\n" +
  "          state.sawDeepZone = tag;\n" +
  "          state.sessionSawDeep = tag;\n" +
  "          toast(z.name, SPECIES[z.s] ? SPECIES[z.s].color : \"#9ef0ff\");\n" +
  "          persist();\n" +
  "          checkSessionGoals();\n" +
  "        }",
  "        const hold = z.forever ? 0.85 : 0.55;\n" +
  "        state.zoneTitle = { text: z.name.toUpperCase(), life: hold, max: hold };\n" +
  "        noteDepthRecord();\n" +
  "        if ((state.sawDeepZone | 0) < tag) {\n" +
  "          state.sawDeepZone = tag;\n" +
  "          state.sessionSawDeep = tag;\n" +
  "          toast(z.name, SPECIES[z.s] ? SPECIES[z.s].color : \"#9ef0ff\");\n" +
  "          if (z.forever) {\n" +
  "            spawnP(player.x, player.y, 12, [\"#9ef0ff\", \"#c4a0ff\", \"#fff6e8\"], 60);\n" +
  "            sfx(\"tang\");\n" +
  "          }\n" +
  "          persist();\n" +
  "          checkSessionGoals();\n" +
  "        }",
  "zone enter juice"
);

// Reset depth combo on surface
mustReplace(
  "    state.bagBonus = 1;\n",
  "    state.bagBonus = 1;\n" +
  "    state.depthCombo = 0;\n",
  "surface reset combo"
);

// Help lines
mustReplace(
  "        \"Earn bay badges — Pause → Share my pier (or C) copies a card you can post\",\n",
  "        \"Earn bay badges — Pause → Share my pier (or C) copies a card you can post\",\n" +
  "        \"Swim past Whale road into forever zones — each band hides a depth pearl\",\n" +
  "        \"Deep scoops stack a DEPTH combo and pay more — chase a depth record\",\n",
  "help"
);

// forever band visual richer + draw depth cache
mustReplace(
  "  function drawForeverBand(y0) {\n" +
  "    ctx.save();\n" +
  "    const g = ctx.createLinearGradient(0, y0, 0, y0 + ZONE_STEP);\n" +
  "    const kind = ((y0 / ZONE_STEP) | 0) % 8;",
  "  function drawDepthCache(cache) {\n" +
  "    if (!cache || !cache.depthCache) return;\n" +
  "    const pulse = 0.7 + 0.3 * Math.sin(state.time * 5.2 + (cache.band || 0));\n" +
  "    ctx.save();\n" +
  "    ctx.translate(cache.x, cache.y);\n" +
  "    ctx.fillStyle = \"rgba(158, 240, 255,\" + (0.18 * pulse) + \")\";\n" +
  "    ctx.beginPath(); ctx.arc(0, 0, 34 * pulse, 0, Math.PI * 2); ctx.fill();\n" +
  "    ctx.fillStyle = \"#ffe27a\";\n" +
  "    ctx.beginPath(); ctx.ellipse(0, 4, 14, 10, 0, 0, Math.PI * 2); ctx.fill();\n" +
  "    ctx.fillStyle = \"#fff6e8\";\n" +
  "    ctx.beginPath(); ctx.ellipse(-3, 1, 5, 4, -0.3, 0, Math.PI * 2); ctx.fill();\n" +
  "    ctx.strokeStyle = \"rgba(158, 240, 255,\" + (0.55 + 0.35 * pulse) + \")\";\n" +
  "    ctx.lineWidth = 2;\n" +
  "    ctx.beginPath(); ctx.arc(0, 0, 18 + pulse * 4, 0, Math.PI * 2); ctx.stroke();\n" +
  "    ctx.fillStyle = \"#9ef0ff\";\n" +
  "    ctx.font = \"800 11px Nunito, sans-serif\";\n" +
  "    ctx.textAlign = \"center\";\n" +
  "    ctx.fillText(\"PEARL\", 0, -22);\n" +
  "    ctx.restore();\n" +
  "  }\n" +
  "  function drawForeverBand(y0) {\n" +
  "    ctx.save();\n" +
  "    const g = ctx.createLinearGradient(0, y0, 0, y0 + ZONE_STEP);\n" +
  "    const kind = ((y0 / ZONE_STEP) | 0) % (FOREVER_ZONE_NAMES.length || 8);",
  "draw cache + forever"
);

mustReplace(
  "    if (kind === 0) {\n" +
  "      ctx.fillStyle = \"rgba(90,230,255,0.22)\";\n" +
  "      for (let i = 0; i < 24; i++) {\n" +
  "        ctx.globalAlpha = 0.15 + 0.3 * (0.5 + 0.5 * Math.sin(state.time * 1.8 + i));\n" +
  "        ctx.beginPath(); ctx.arc((i * 173) % OCEAN.w, y0 + 80 + (i * 37) % 300, 1.8, 0, Math.PI * 2); ctx.fill();\n" +
  "      }\n" +
  "      ctx.globalAlpha = 1;\n" +
  "    }\n" +
  "    ctx.restore();\n" +
  "  }",
  "    if (kind % 3 === 0) {\n" +
  "      ctx.fillStyle = \"rgba(90,230,255,0.22)\";\n" +
  "      for (let i = 0; i < 28; i++) {\n" +
  "        ctx.globalAlpha = 0.15 + 0.3 * (0.5 + 0.5 * Math.sin(state.time * 1.8 + i));\n" +
  "        ctx.beginPath(); ctx.arc((i * 173) % OCEAN.w, y0 + 80 + (i * 37) % 300, 1.8, 0, Math.PI * 2); ctx.fill();\n" +
  "      }\n" +
  "      ctx.globalAlpha = 1;\n" +
  "    } else if (kind % 3 === 1) {\n" +
  "      ctx.strokeStyle = \"rgba(200, 160, 255, 0.18)\";\n" +
  "      ctx.lineWidth = 1.4;\n" +
  "      for (let i = 0; i < 10; i++) {\n" +
  "        const px = (i * 311 + state.time * 12) % OCEAN.w;\n" +
  "        const py = y0 + 60 + (i * 41) % 320;\n" +
  "        ctx.beginPath(); ctx.arc(px, py, 10 + (i % 3) * 4, 0, Math.PI * 2); ctx.stroke();\n" +
  "      }\n" +
  "    }\n" +
  "    ctx.restore();\n" +
  "  }",
  "forever particles"
);

fs.writeFileSync(file, src);
console.log("applied c170 deeper fun");
