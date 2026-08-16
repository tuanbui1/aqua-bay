# Aqua Bay

Original HTML5 pier aquarium tycoon. No build step.

## Play

Open `index.html` in a browser (or `python3 -m http.server` in this folder).

WASD, click-to-walk, or hold-click to move. Walk to the dock and press Space to dive. Keep a fish in the catch cone. With a full bag, Space, Enter, or the SURFACE button surfaces from any depth. Stock the tank, collect at the cashier.

## Loop

Dive → catch → stock → sell → upgrade / unlock / hire / decorate / expedition.

- Five species: Clownfish, Blue Tang, Goldfish, Koi, Sea Turtle
- Tap the right-hand strip for the collection book
- After Tang (or $60 earned): boat expedition on the right dock ($35, every 3rd trip is night)
- Esc for pause and help

First session: a mission chip (dive, catch 5 Clownfish, earn $60). The opening school has one shiny clownfish — gold outline, 2× pay. It stays on-screen until you catch it or fill the bag.

Progress saves in `localStorage` under `aqua-bay-save`.
