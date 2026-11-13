# Design guide: how the games should look, sound and feel

What the three prototypes were built to, and what any new game should keep. Marked **decided** where Rob has chosen it (source in brackets). Everything else is **my judgement, proposed**: it worked in the prototypes, but it isn't research.

## Who plays

- **Pre-readers and early readers** to start with, and older children later, so every game needs room to get harder. (Decided: the project's aims; levels from Q5 to Q7.)
- The youngest player can't read the screen. **Everything important is a picture, a colour or a spoken word as well as text.**
- Educational first: each game practises something specific (letters, spelling, number facts, the number line), and the difficulty follows the child.

## Never punishing

Proposed, from the launcher review (area 8) and the prototypes:

- **No game over, no lives, no timers that end the game.** A mistake gets a funny, gentle reaction (a hiccup, a puzzled monster, a soft bounce) and another try.
- **Help after repeated mistakes:** the prototypes count along, point to the right answer, or show it kindly after the third try.
- **Nothing is ever taken away:** no losing stars, coins or unlocks.
- **No streaks** that punish a missed day, and **no comparing children** with each other (the younger one always loses).
- **Short rounds:** the prototypes' defaults are 5 words, 8 orders or 8 landings, a few minutes each.

## The look

- **Colourful, rich and alive:** layered scenery, gentle movement everywhere (things bob, drift, blink, twinkle) and big, juicy feedback on every action (squash and stretch, bursts, confetti).
- **Each game has its own world and palette** (a sunny garden, a pastel café, deep space), with **chunky dark outlines and rounded shapes** to sit alongside the launcher's sticker-book look. Skins change the launcher only, never the games. (Decided: the launcher project's instructions.)
- **Font:** Fredoka from Google Fonts, with a rounded system font as a fallback.
- **All art is original and drawn in code** (SVG, canvas or CSS). No downloaded images, no emoji used as pictures (they look different on every phone), and no characters or styles that belong to someone else (no Disney, Pixar, Nintendo, Minecraft, Pokémon and so on). (The launcher keeps to this already: its Blocks skin is an original pixel world rather than a copy of a famous game.)
- **Big targets:** at least 48 px to tap, 64 px or more for the youngest. Letters and numbers drawn large.
- **Text:** UK English, short and friendly. No instructions a child has to read before they can play.

## Screens and layout

- It must look right at **390×844** (phone upright), **844×390** (phone sideways) and **1366×768** (PC), with the shell's bar of about 55 px above it.
- **No page scrolling or zooming while playing:** `touch-action: none` and `user-select: none` on the play area.
- **Canvas:** match the screen's pixel density, capped at 2, so it's sharp without slowing the phone.
- **Pause when the page is hidden** (`visibilitychange`), and carry on when it's back.
- **Reduced motion:** when the device asks for less motion, calm the decorative movement. The game must still work.
- Phones: touch. PC: mouse **and** keyboard (arrow keys, number keys, Enter and Space), because the PC is shared with grown-ups who'll test with a keyboard.

## Sounds

- **Short sounds made in the browser** (Web Audio), no sound files to download. The prototypes' `sound.js` has 19: tap, hello, soon, peel, yay, pop, chomp, ding, oops, hiccup, coin, whoosh, puff, thud, sparkle, levelup, unlock, boop and slurp. Monster Café adds a jukebox jingle of its own.
- A sound **for every action**, quiet and pleasant; never a harsh buzzer for a mistake.
- **Sound off means silent**, speech included. (Decided: Q15.)

## Speech

- Say prompts out loud when sound is on: the word to spell, the order, the target number. The prototypes use a slightly slow, bright `en-GB` voice.
- **Always show it too,** with a speaker button to hear it again.
- **Speak numbers the way a child says them:** "two and a half", "minus three", "two point five". (Rocket Lander's `numbers.js` does this.)
- Speak words, not letters: "SHIP" in capitals is still said as the word "ship".
- Some devices have no voice, and Chrome needs a tap on the page before it will speak (see `INTEGRATION.md`, section 8).

## Rewards inside a game

The launcher gives stars and stickers. A game can add its own collectibles, which the prototypes all do:

- Word Worm: **hats** for the worm.
- Monster Café: **coins** that buy **decorations** for the café.
- Rocket Lander: **planets** to unlock and **moon rocks** for perfect landings.

Proposed rules for these:
- They're for fun and dressing up, **never needed to play**.
- They **grow with practice**, never with buying.
- They're **shown on the start screen**, so the child sees them before playing.
- Where they're saved depends on GQ2 (`README.md`).

## Code

- One folder per game; split into small modules by job (the prototypes: art, scene, rounds or orders, numbers, the main game).
- Comments in plain English, written for a grown-up who isn't a programmer, citing decision codes.
- A small test hook on `window.__test` (state, and "do the right move" or "do a wrong move") makes automated tests easy. The prototypes all have one.
