# Aqua Bay

**Dive. Stock. Sell.** A sunny pier aquarium tycoon in one HTML file.

You run a little mart on the dock. Dive for fish, stock the tanks, and cash out customers before the next boat leaves. Five minutes feels like a real shop. An hour still has a next unlock.

## Play live

- **Hub (both games):** https://tuanbui1.github.io/aqua-bay/games/
- **Aqua Bay:** https://tuanbui1.github.io/aqua-bay/
- **Skipjack:** https://tuanbui1.github.io/aqua-bay/games/skipjack/

Open `index.html` (or `python3 -m http.server` in this folder). No build step.

## Play

- **Move:** WASD, tap/click-to-walk, or hold-drag
- **Dive:** walk to the glowing dock, then Space, the DIVE button, or the on-dock DIVE chip
- **Catch:** hold (or tap a fish) until the bar fills — the cone locks on so walking does not break the grab (one scoop, then release)
- **Surface:** full bag — Space, Enter, or the SURFACE button
- **Sell:** walk into the glowing tank, then stand in the till glow to collect
- **Book:** tap a fish on the right strip
- **Esc:** pause and help
- **Who:** pick Reef, Skip, or Dino on the title (or pause)

Plays on a phone in portrait or landscape — tap the pier to walk, no keyboard needed. Saves in `localStorage` under `aqua-bay-save`. Pause and title stamp **Aqua Bay · loop 61**. Dock people and standing props (life ring, OPEN, Welcome, DIVE) cast a shared-sun sit shadow on the wood. Packed teal plates behind Maya / Jun / generics are punched from the opaque sprite box, not the cell edge. Title picker cards each get a unique painted harbor/pier strip — Dino is a dusk pier with a piling, not a teal-grey slab. Fish blit lighting is isolated so painted edges stay clean (no dest-rect halo). Pier decks use long unique boards without hard tile seams; the aisle ramp perspective-tapers. The painted harbor is a distant shore (sky + town above the waterline); the bay is water; the walker stays on pier / dock / plaza boards and cannot stand in the sky or on roofs. Reef, Skip, and Dino plant soles on the boards (contact shadow, no hover bob) and swim horizontal-ish with a paddle-kick — not a standing person sliding, not a hovering sticker. Walk and swim still use 6 **redrawn** painted frames (same outfits: Reef pink suit, Skip yellow rash guard, Dino + floatie) — not C52 warps. Title skyline is a painted town of unique buildings sitting on the waterline, not a strip of identical rectangles. Skin-picker cards use large painted portraits on a sky plate. Dock boards are eight unique single painted planks. The DIVE sign sits beside the glowing pad so the walker is not inside the board. Catch cone is water-glass (soft taper, no debug wedge). Underwater jellyfish and rocks match the C48/C55 painted animals. SHINY / REEF / ! sit on painted plates. Title clips its plate so "Who's diving?" is fully below it. Life ring and anchor sit on the boards. Title, plaza, and dock share the painted harbor town. Maya / Nico / Jun, the cashier, and all 13 catchables stay the loop-48 reshoot. Loop 51–52 harbor framing, foam, DIVE chip, and scoop grace stay. Camera keeps the C47 ease and softens plaza/cashier pulls further; after a sale it stays on the till. Old 5-species saves still load. After Sea Turtle the east pier opens eight more tanks, dive bands stack forever, and TODAY goals roll a new day instead of ending. The right rail focuses the next unlock so it never stacks 13 cards. HUD shows depth while you swim. Hold fills the catch bar (one fish per scoop) and locks the cone on the fish; a tap on a fish starts the scoop. A short hold-grace keeps a 1-frame pointer jitter from dumping the bar. Holds near the waterline do not fire SURFACE. Hold-up (or **↑ SURFACE**) adds buoyancy and kills downward drift — it does not auto-surface. First two or three catches of dive 1 are forgiving, then the cone tapers; locked fish do not panic-sprint out of the cone. First stock lands when you reach the glowing tank pad (bag clears, tank stocks, session steps); a **walk here to stock** arrow stays up until the bag lands. Scoop hold does not dash or surface. The first shiny does not auto-surface — keep scooping until the bag is full or at least 3. Locked right-rail $ chips are larger, with hover scale and **need $X more** when unaffordable, and still unlock like tank cards. Stand in the till glow ~0.3s to collect (click from far still walks then acts). After a sale a persistent **→ TILL / collect** chip stays up until you pocket, and a walk-click toward the cashier does not dive. Dive→surface→shop camera eases (slow follow, no dock/tank/till snaps); tank cards keep a HUD-height top safe-area so they never clip the frame. FIRST SESSION 6/6 does not drop after an unlock. A fish that slips the cone mid-hold flashes **escaped!** with a shrinking leftover bar. A corner **→ DIVE** walks you back when the dock is off-screen. Till receipt uses the real pay formula and clears on collect. Overlay sits under the HUD. One full speech bubble on the canvas (greetings and VIP share the `drawSpeech` latch). Plaza↔dock pans fade every world label (Welcome, CASHIER + $ chip, Pier Mart) and the whole tank/unlock card panel before any edge cuts it; the empty teal kiosk slab stays gone unless its copy is in that box; money, BAG, FIRST SESSION / TODAY, depth, the species/price rail, and the upgrade tray stay pinned in screen space (chips dodge the tray, not vice versa; DIVE / → DIVE / → TILL dodge the tray; world signs may move). Coin-fly after a sale leaves the money / goal readout readable.

## Why it’s fun

The first dive has a **glowing reef** to swim toward and a **shiny clownfish** (gold outline, one bag slot, 2× pay — the pip reads **x2**). Stocking clears the bag the instant the tank takes the catch. Tap a tank, till, or unlock card and you buy if you are in range — or walk there, then buy, in one gesture. One hint line at a time; it never tells you to stock while you are still diving. Coins sit on the dock walk so Speed Lv1 is not a dead commute. The canvas draws one full speech bubble at a time — greetings, VIP, sale lines, and till emotes share one gate, so a pier of three hellos or a three-sale rush stays one readable line. Hint lines wrap so a Maya / Tang toast is not cut off at the viewport. Plaza camera keeps the shelf cards on-canvas; the right-side price rail sits clear of locked unlock prices, mute, and pause. Price chips sit clear of mute, pause, and the bait shack. Upgrade trays stay pinned in screen space so walking the pier does not slide them. Camera eases plaza to dock instead of jumping, and eases back to the plaza when a collection card closes. One STREAK! chip — not a second header. A ray, a jellyfish, and a school of minnows drift behind them — visible, uncatchable, just water with depth. Catch 2 dashes sideways so you track it; catch 3 yanks then holds **STREAK!** (almost! is a quiet miss, not a flourish sting); catch 4 circles, sits, and the school parts — same cone, not the same beat. Catches, sales, and unlocks hit with a camera punch, particles, and a tiny chirp — not just a banner. The first dollar of a New Game nudges the camera and rings a cash chime on top of the tank dip, receipt, coin-arc, and pile. When a regular buys, fish leave the tank one-by-one so the badge matches the glass. Clownfish dart, tangs trace a figure-eight, goldfish loaf, koi parade, turtles paddle — you can tell them apart without a name tag. Maya, Nico, and Jun are faces, not clones — straw hat, sailor cap, red visor — and they pause, glance, and weave instead of skating a straight line. Regulars rotate gold sale lines (**the usual!** is one of them, next to **my clownfish!**, **don't skimp!**, **perfect.**, **again please**) — Maya, Nico, and Jun each get a tinted talk bubble you can actually read. Stocking hops from the bag into the tank with a splash; a pip leaves the strip. The dock already has a gull, a distant skiff, a crate, a hanging OPEN sign, and a mop bucket before you dive. The empty right pier now has a bait shack, a pop machine, and a second gull. Upgrade cards promise the feel (**faster walk**, **bigger bag**) instead of a bare price row. The dock walk has a wave, a mutter, and coin sparkles — the cashier pile is still the point. After the first stock, dive 2 is not a clone: a blue flash teases **Blue Tang** in the deep. The ocean darkens as you go down; light shafts travel with the diver. After you earn $60, Tang opens the bay: the shop goes teal, a new school swims the aisle water (never the dry boardwalk — not even during the unlock fanfare), and night expeditions start every third trip. A thin pier wash sits under the chirps.

Thirteen catchables: the original five (Clownfish, Blue Tang, Goldfish, Koi, Sea Turtle — same prices) plus Seahorse, Puffer, Angelfish, Octopus, Crab, Squid, Dolphin, and Whale Shark. Hire a cashier, hang lights, take the boat. Dive zones keep stacking after the whale road.

## Loop

Dive → catch → stock → sell → upgrade / unlock / hire / decorate / expedition.

## Skipjack

A second original HTML5 toy on the same pier: hold to wind a skip, release to throw, tap each kiss of the water. Score is distance × (skips + 1). Not a reskin of Aqua Bay.

## Listing blurb (itch / stores)

**Short:** Run a sunny pier aquarium. Dive, stock the tanks, sell to regulars.

**Long:** Aqua Bay is a cozy tycoon you can finish a session of in three minutes. Dive off your own dock, bag a shiny clownfish, and stock the mart before Maya asks for the usual. Unlock Blue Tang and the whole bay changes color. Then the boat, the night trips, the collection book.

Original art. Plays in a browser. No account.

Written by an AI agent (Twitter Bot) for Tuan Bui. Tuan is the owner.
