// Hamster Highway's help cards (D-167, D-168, D-170). Version 1.4 (21 Nov, step 16).
//
// Changes at v1.4 (step 16, D-194): the bottle-top button's card, the eleventh (a part, so no drop-in, as the see-saw's
// and the lift's): the lunchbox lid stands up by a gap; the hamster walks onto the bottle top, which clicks down; the
// lid swings down over the gap, and the hamster walks over it and home. Caption "Press it to drop the lid!" (Claude's,
// proposed while Rob was out); 5.5 s.
//
// Changes at v1.3 (step 15, D-208): the signpost's card, the tenth, storyboard A of the step 15 mock-ups: out of the
// start tube on a ledge, along it and down to the floor; it stops puzzled at the pond's edge, the signpost drops in; it
// walks on to it and turns round (a swirl), then walks back left under the ledge (drawn mirrored) and home. Every place
// the hamster is drawn is a square of core.js's own walk of this board. Caption "Signposts turn them round!"; 6 s.
//
// Changes at v1.2 (step 14, D-186, D-194): the spoon catapult's card, the ninth: walks to the pond's edge, stops, the
// spoon drops in; it steps into the spoon, which flicks, and flies over the water on an arc to the far bank, then
// home. Caption "The spoon flings them over!" (Claude's, proposed); 5.5 s. The badge is the gadget's, as the others.
//
// Changes at v1.1 (step 10b, D-177 (2)): the see-saw's card goes on after the tip: a ramp drops in at the end of the
// bank, before the raised near end, and a third hamster, waiting puzzled there, climbs it, steps onto the raised end,
// walks down the plank and home. Its bank is a row higher, as level 8's, so one ramp reaches the raised end; it loops
// in 6.5 s (6 before).
//
// One card for each gadget and part a level brings in: the bridge, ramp, bouncer, floater, tube and worn stick, the
// see-saw and the teacup lift. Each is a card over the dimmed board (720 x 420 units, the board's window) with the
// gadget's badge, a caption of 3 to 6 words (on screen only: the game says nothing aloud), a scene that loops in a
// few seconds (CSS only, fading out and in at the loop's join) and a big green tick to close it. The look is the
// agreed mock-up's, look C (tools/tests/games/sketch_hamster_cards.py 0.1); the bridge's and the lift's scenes are
// moved from it, the other six drawn the same way. Every class here starts hc-, so none clashes with the game's own
// (.loop, .bob); a moving group never has a transform attribute of its own, which its animation would override.
// game.js shows a card once per child, the first time a level brings its gadget in, and again by help and a tap.
// Pure (project rules): it only builds text, and imports only art.js.

// (one line: tools/tests/games/build_preview.py reads one-line imports only)
import { CELL, INK, SUN, hamster, gadget, buttonCap, lidArt, stickArt, tubePiece, block, water, startArt, homeArt, sparkle, liftArt, teacupBack, teacupFront, seesawArt, potArt, heart, place, g, rect, path, text } from './art.js';

export const CARDS = ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'seesaw', 'lift', 'catapult', 'signpost', 'button'];

// Captions: the bridge's and the lift's agreed (D-168); the other six Claude's, alike (proposed to Rob in step 8).
export const CAPTION = {
  bridge: 'Bridges cross the gaps',
  ramp: 'Ramps help you step up',
  bouncer: 'Boing! Bounce up high!',
  floater: 'Float down nice and slow',
  tube: 'Pop up through the tubes',
  stick: 'Worn sticks snap. Add another!',
  seesaw: 'Two on the end tip it',
  lift: 'Hop in and ride up!',
  catapult: 'The spoon flings them over!',
  signpost: 'Signposts turn them round!',
  button: 'Press it to drop the lid!',
};

// Seconds each card's scene takes to loop.
export const LOOP_S = { bridge: 5, ramp: 5, bouncer: 5, floater: 5.5, tube: 5.5, stick: 6.5, seesaw: 6.5, lift: 6, catapult: 5.5, signpost: 6, button: 5.5 };

// The card a level's new gadget or part brings, or null.
export const cardFor = (def) => (def && CARDS.includes(def.new) ? def.new : null);

const SC = 0.56;     // a hamster's size on the board (game.js SC)
const GS = CELL / 100;
const CREAM = '#FFF8EE';
const GREEN = '#3CC864';

const ham = (x, y, pose = 'walk1') => place(hamster(pose), x, y, SC);
const cls = (c, body) => `<g class="${c}">${body}</g>`;
const huh = (x, y) => text(x, y, '?', 30, INK, ' stroke="#fff" stroke-width="5" paint-order="stroke"');
const legs = () => cls('hc-legs1', ham(0, 0, 'walk1')) + cls('hc-legs2', ham(0, 0, 'walk2'));
const fit = (x, y, k) => cls(`hc-${k}-fit`, rect(x + 3, y + 1, 54, 54, SUN, 8, 3, SUN, ' fill-opacity="0.3" stroke-dasharray="6 5"'));
const sparks = (k, x, y) => cls(`hc-${k}-spark`, place(sparkle(0, 0, 12), x - 30, y - 16) + place(sparkle(0, 0, 12), x + 46, y - 20, 0.7));

function board(rows, wet = []) {
  let s = '';
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) if (row[c] === '#') s += block(c, r, r === 0 || rows[r - 1][c] !== '#');
  });
  return s + wet.map(([c, r]) => water(c, r)).join('');
}

// A hamster that walks (legs), waits puzzled (?) and gets home (a happy hop), all inside one moving group k-ham.
function walker(k, wait = true) {
  return cls(`hc-${k}-ham`, cls(`hc-${k}-move`, legs(k)) + (wait ? cls(`hc-${k}-wait`, ham(0, 0) + huh(10, -62)) : '') + cls(`hc-${k}-home`, ham(0, -4, 'home')));
}

// ---------------------------------------------------------------- the scenes (board units)
const SCENE = {};
const VIEW = {};

// The bridge (the mock-up's look C): walks to the gap, stops, the bridge drops in, across, a happy hop at home.
VIEW.bridge = '0 236 480 184';
SCENE.bridge = () => board(['........', '........', '........', '........', '........', '........', '###.####'], [[3, 6]])
  + place(homeArt(), 420, 300, GS) + fit(180, 358, 'bridge')
  + cls('hc-bridge-drop', place(gadget('bridge'), 180, 360, GS)) + sparks('bridge', 202, 360)
  + walker('bridge');

// The ramp: walks to a step, stops, the ramp drops in, up and along to home.
VIEW.ramp = '0 206 480 214';
SCENE.ramp = () => board(['........', '........', '........', '........', '........', '....####', '########'])
  + place(homeArt(), 420, 240, GS) + fit(180, 300, 'ramp')
  + cls('hc-ramp-drop', place(gadget('ramp'), 180, 300, GS)) + sparks('ramp', 202, 300)
  + walker('ramp');

// The bouncer: walks to a high wall, stops, the marshmallow drops in, a squish and a boing up onto the wall, home.
VIEW.bouncer = '0 76 480 344';
SCENE.bouncer = () => board(['........', '........', '........', '....####', '....####', '....####', '########'])
  + place(homeArt(), 420, 120, GS) + fit(180, 300, 'bouncer')
  + cls('hc-bouncer-drop', place(cls('hc-bouncer-squish', gadget('bouncer')), 180, 300, GS)) + sparks('bouncer', 202, 340)
  + cls('hc-bouncer-ham', cls('hc-bouncer-move', legs('bouncer')) + cls('hc-bouncer-wait', ham(0, 0) + huh(10, -62))
    + cls('hc-bouncer-fly', ham(0, 0, 'boing')) + cls('hc-bouncer-home', ham(0, -4, 'home')));

// The catapult (D-194): walks to the pond's edge, stops, the spoon drops in; it steps in, the spoon flicks, and it flies
// over the water on an arc (4 squares on, 2 rows up at the top) to the far bank, then home.
VIEW.catapult = '0 136 480 284';
SCENE.catapult = () => board(['........', '........', '........', '........', '........', '........', '###...##'], [[3, 6], [4, 6], [5, 6]])
  + place(homeArt(), 420, 300, GS) + fit(120, 300, 'catapult')
  + cls('hc-catapult-drop', place(cls('hc-catapult-flick', gadget('catapult')), 120, 300, GS)) + sparks('catapult', 142, 340)
  + cls('hc-catapult-ham', cls('hc-catapult-move', legs('catapult')) + cls('hc-catapult-wait', ham(0, 0) + huh(10, -62))
    + cls('hc-catapult-fly', ham(0, 0, 'boing')) + cls('hc-catapult-home', ham(0, -4, 'home')));

// The signpost (D-208): out of the start tube on a ledge, along it and down to the floor; it stops at the pond's edge
// and the signpost drops in; it walks on to it, turns round, and walks back left under the ledge to home. Facing left,
// the hamster is the same drawing mirrored, in a still inner group (the moving group's own transform is its animation).
VIEW.signpost = '0 136 480 284';
const left = (body) => g(body, 'scale(-1 1)');
SCENE.signpost = () => board(['........', '........', '........', '........', '.###....', '........', '######..'], [[6, 6], [7, 6]])
  + place(startArt(), 60, 180, GS) + place(homeArt(), 0, 300, GS) + fit(300, 300, 'signpost')
  + cls('hc-signpost-drop', place(cls('hc-signpost-wob', gadget('signpost')), 300, 300, GS)) + sparks('signpost', 322, 340)
  + cls('hc-signpost-swirl', path('M 308 294 A 22 11 0 1 1 350 288', 'none', 4, INK) + path('M 342 280 L 352 288 L 340 294', 'none', 4, INK, ' stroke-linejoin="round"'))
  + cls('hc-signpost-ham', cls('hc-signpost-move', legs('signpost')) + cls('hc-signpost-fall', ham(0, 0, 'fall')) + cls('hc-signpost-wait', ham(0, 0) + huh(10, -62))
    + cls('hc-signpost-back', left(legs('signpost'))) + cls('hc-signpost-home', left(ham(0, -4, 'home'))));

// The button (D-194): the lid stands up at the gap's left edge, tied by a string to the bottle top; the hamster walks
// onto the bottle top, which clicks down and stays down; the lid swings down over the gap; over it and home. The lid
// turns about its hinge, the origin of its still outer group (translate), so its moving group needs no transform.
VIEW.button = '0 136 480 284';
SCENE.button = () => board(['........', '........', '........', '........', '........', '........', '###..###'], [[3, 6], [4, 6]])
  + place(homeArt(), 420, 300, GS) + path('M 82 346 Q 140 322 184 350', 'none', 2.4, '#8B5A3C')
  + place(cls('hc-button-cap', buttonCap()), 60, 360) + g(cls('hc-button-lid', lidArt(2)), 'translate(180 360)')
  + cls('hc-button-ham', cls('hc-button-move', legs('button')) + cls('hc-button-home', ham(0, -4, 'home')));

// The floater: walks to the end of a high ledge and stops at the drop; the dandelion drops in; it takes it and
// drifts gently down, swaying, then walks home.
VIEW.floater = '0 96 480 324';
SCENE.floater = () => board(['........', '........', '........', '###.....', '###.....', '###.....', '########'])
  + place(homeArt(), 420, 300, GS) + fit(120, 120, 'floater')
  + cls('hc-floater-drop', place(gadget('floater'), 120, 120, GS)) + sparks('floater', 142, 180)
  + cls('hc-floater-ham', cls('hc-floater-move', legs('floater')) + cls('hc-floater-wait', ham(0, 0) + huh(10, -62))
    + cls('hc-floater-fly', ham(0, 0, 'float')) + cls('hc-floater-home', ham(0, -4, 'home')));

// The tube: walks to a ledge, stops, three tubes drop in one on another; it goes in at the bottom, rides up inside
// (seen through the tube) and pops out at the top, then home.
VIEW.tube = '0 136 480 284';
const TUBES = [['ul', 300], ['ud', 240], ['dr', 180]];
SCENE.tube = () => board(['........', '........', '........', '........', '.....###', '.....###', '########'])
  + place(homeArt(), 420, 180, GS) + fit(240, 300, 'tube')
  + cls('hc-tube-ham', cls('hc-tube-move', legs('tube')) + cls('hc-tube-wait', ham(0, 0) + huh(10, -62)) + cls('hc-tube-home', ham(0, -4, 'home')))
  + TUBES.map(([d, y], i) => cls(`hc-tube-drop${i}`, place(tubePiece(d), 240, y, GS, 0, ' opacity="0.86"'))).join('')
  + cls('hc-tube-in', cls('hc-tube-inside', ham(0, 0, 'home')))
  + sparks('tube', 262, 186);

// The worn stick: four hamsters cross it in a line; it cracks under each and snaps under the fourth, who drops onto
// a second stick below and walks on. All four home.
VIEW.stick = '0 146 480 274';
const STICK_T = [16, 32, 48, 64];   // when each of the four is in the middle of the top stick (%)
SCENE.stick = () => board(['........', '........', '........', '........', '###.....', '###.####', '###.####'], [[3, 6]])
  + place(homeArt(), 420, 240, GS)
  + place(stickArt(0), 180, 300, GS)
  + [0, 1, 2, 3].map((n) => cls(`hc-stick-c${n}`, place(stickArt(n), 180, 240, GS))).join('')
  + cls('hc-stick-halfL', place(g(rect(-4, 4, 52, 16, '#EED9B0', 6, 2.6) + path('M 50 4 l -4 4 l 4 4 l -4 4 l 4 4', 'none', 2, '#8B5A3C')), 180, 240, GS))
  + cls('hc-stick-halfR', place(g(rect(52, 4, 52, 16, '#EED9B0', 6, 2.6) + path('M 54 4 l -4 4 l 4 4 l -4 4 l 4 4', 'none', 2, '#8B5A3C')), 180, 240, GS))
  + cls('hc-stick-puff', place(sparkle(0, 0, 14), 210, 232) + place(sparkle(0, 0, 9), 236, 222))
  + [3, 2, 1, 0].map((n) => cls(`hc-stick-h${n}`, legs('stick'))).join('');

// The see-saw: one walks up to its high end and waits, tapping a foot; a second joins it, a heart, and over it tips;
// they ride down and walk off home. Then (D-177 (2)) a third waits puzzled at the bank's end, below the raised near
// end; a ramp drops in there, and up it goes, onto the plank, down it and home.
VIEW.seesaw = '0 106 480 314';
SCENE.seesaw = () => board(['........', '........', '........', '........', '##......', '##...###', '##.#.###'], [[2, 6], [4, 6]])
  + place(homeArt(), 420, 240, GS) + potArt(210, 240, 360)
  + g(cls('hc-seesaw-tilt', seesawArt()
    + cls('hc-seesaw-r1', place(ham(0, 0, 'home'), 85, 0)) + cls('hc-seesaw-r2', place(ham(0, 0, 'home'), 57, 0))), 'translate(210 240)')
  + cls('hc-seesaw-h1', cls('hc-seesaw-m1', legs('seesaw')) + cls('hc-seesaw-tap', ham(0, 0, 'walk1')))
  + cls('hc-seesaw-h2', legs('seesaw'))
  + cls('hc-seesaw-love', place(heart(0, 0, 10, '#FF8FB1'), 262, 130))
  + cls('hc-seesaw-off', cls('hc-seesaw-o1', legs()) + cls('hc-seesaw-o2', legs()))
  + fit(60, 180, 'seesaw') + cls('hc-seesaw-drop', place(gadget('ramp'), 60, 180, GS)) + sparks('seesaw', 82, 180)
  + cls('hc-seesaw-h3', cls('hc-seesaw-h3-move', legs()) + cls('hc-seesaw-h3-wait', ham(0, 0) + huh(10, -62)) + cls('hc-seesaw-h3-home', ham(0, -4, 'home')));

// The teacup lift (the mock-up's look C): walks into the bottom cup, rides up as the other comes down, steps out at
// the top, a happy hop; a friend waits its turn.
VIEW.lift = '40 76 380 284';
const LX = 210;
const LTOP = 180;
const LBOT = 300;
const cupBack = (y) => place(teacupBack(), LX, y);
const cupFront = (y) => place(teacupFront(), LX, y);
SCENE.lift = () => liftArt(LX, 100, 336).replace('class="loop"', 'class="hc-lift-string"')
  + board(['.......', '.......', '.......', '....###', '....###', '###.###', '#######']) + place(homeArt(), 360, LTOP - 60, GS)
  + cls('hc-lift-cupB', cupBack(LTOP) + cupFront(LTOP))
  + cls('hc-lift-cupA', cupBack(LBOT))
  + cls('hc-lift-ham', cls('hc-lift-move', place(legs('lift'), 0, LBOT)) + cls('hc-lift-ride', ham(0, LBOT, 'walk1')) + cls('hc-lift-home', ham(0, LBOT - 4, 'home')))
  + cls('hc-lift-cupA', cupFront(LBOT))
  + cls('hc-lift-friend', ham(66, LBOT, 'walk2'));

// ---------------------------------------------------------------- the CSS: keyframes for every scene
const kf = (name, body) => `@keyframes ${name} { ${body} }\n`;
const rule = (c, anim, extra = '') => `.${c} { ${extra}animation: ${anim}; }\n`;
const T = (x, y) => `transform: translate(${x}px, ${y}px)`;
// A hamster that walks, waits, walks again and gets home: on/off windows for its three looks.
function looks(k, L, waitFrom, waitTo, homeAt) {
  return kf(`hc-${k}-move`, `0%, ${waitFrom - 0.1}% { opacity: 1 } ${waitFrom}%, ${waitTo - 0.1}% { opacity: 0 } ${waitTo}%, ${homeAt - 0.1}% { opacity: 1 } ${homeAt}%, 100% { opacity: 0 }`)
    + kf(`hc-${k}-wait`, `0%, ${waitFrom - 0.1}% { opacity: 0 } ${waitFrom}%, ${waitTo - 0.1}% { opacity: 1 } ${waitTo}%, 100% { opacity: 0 }`)
    + kf(`hc-${k}-home`, `0%, ${homeAt - 0.1}% { opacity: 0; transform: translateY(0) } ${homeAt}% { opacity: 1; transform: translateY(0) } ${homeAt + 5}% { transform: translateY(-14px) } ${homeAt + 10}%, 100% { opacity: 1; transform: translateY(0) }`)
    + rule(`hc-${k}-move`, `hc-${k}-move ${L}s linear infinite`) + rule(`hc-${k}-wait`, `hc-${k}-wait ${L}s linear infinite`)
    + rule(`hc-${k}-home`, `hc-${k}-home ${L}s ease-in-out infinite`);
}
// A gadget that drops in from above, with its spot lit up just before and sparkles as it lands.
function dropIn(k, L, at) {
  return kf(`hc-${k}-fit`, `0%, ${at - 11}% { opacity: 0 } ${at - 7}%, ${at - 2}% { opacity: 1 } ${at + 2}%, 100% { opacity: 0 }`)
    + kf(`hc-${k}-drop`, `0%, ${at - 2}% { opacity: 0; transform: translateY(-120px) } ${at}% { opacity: 1; transform: translateY(-120px) } ${at + 7}% { transform: translateY(0) } ${at + 10}% { transform: translateY(-9px) } ${at + 13}%, 100% { opacity: 1; transform: translateY(0) }`)
    + kf(`hc-${k}-spark`, `0%, ${at + 6}% { opacity: 0 } ${at + 10}%, ${at + 18}% { opacity: 1 } ${at + 24}%, 100% { opacity: 0 }`)
    + rule(`hc-${k}-fit`, `hc-${k}-fit ${L}s linear infinite`) + rule(`hc-${k}-drop`, `hc-${k}-drop ${L}s ease-in infinite`)
    + rule(`hc-${k}-spark`, `hc-${k}-spark ${L}s linear infinite`);
}
const on = (name, L, from, to) => kf(name, `0%, ${from - 0.1}% { opacity: 0 } ${from}%, ${to - 0.1}% { opacity: 1 } ${to}%, 100% { opacity: 0 }`) + rule(name, `${name} ${L}s linear infinite`);

function css() {
  let s = kf('hc-legs', '0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 }')
    + '.hc-legs1 { animation: hc-legs .36s steps(1) infinite; } .hc-legs2 { animation: hc-legs .36s steps(1) infinite reverse; }\n'
    + kf('hc-fade', '0% { opacity: 0 } 5%, 93% { opacity: 1 } 100% { opacity: 0 }')
    + kf('hc-tick', '0%, 100% { transform: scale(1) } 50% { transform: scale(1.06) }')
    + rule('hc-tick', 'hc-tick 1.6s ease-in-out infinite', 'transform-box: fill-box; transform-origin: 50% 50%; ');
  for (const k of CARDS) s += rule(`hc-${k}`, `hc-fade ${LOOP_S[k]}s linear infinite`);

  // bridge, 5 s (the mock-up's keyframes)
  s += kf('hc-bridge-ham', `0% { ${T(40, 360)} } 25%, 50% { ${T(150, 360)} } 82%, 100% { ${T(398, 360)} }`) + rule('hc-bridge-ham', 'hc-bridge-ham 5s linear infinite')
    + looks('bridge', 5, 25, 50, 82) + dropIn('bridge', 5, 40);

  // ramp, 5 s: up the slope from 52% to 62%
  s += kf('hc-ramp-ham', `0% { ${T(40, 360)} } 25%, 50% { ${T(150, 360)} } 53% { ${T(180, 358)} } 63% { ${T(244, 300)} } 82%, 100% { ${T(398, 300)} }`)
    + rule('hc-ramp-ham', 'hc-ramp-ham 5s linear infinite') + looks('ramp', 5, 25, 50, 82) + dropIn('ramp', 5, 40);

  // bouncer, 5 s: onto the marshmallow at 48%, squish, a boing up and over to the wall's top at 64%
  s += kf('hc-bouncer-ham', `0% { ${T(40, 360)} } 22%, 42% { ${T(150, 360)} } 48% { ${T(210, 332)} } 50% { ${T(212, 336)} } 54% { ${T(220, 220)} }`
    + ` 57% { ${T(236, 150)} } 60% { ${T(256, 140)} } 64% { ${T(278, 180)} } 84%, 100% { ${T(398, 180)} }`)
    + rule('hc-bouncer-ham', 'hc-bouncer-ham 5s linear infinite')
    + kf('hc-bouncer-move', '0%, 21.9% { opacity: 1 } 22%, 41.9% { opacity: 0 } 42%, 49.9% { opacity: 1 } 50%, 63.9% { opacity: 0 } 64%, 83.9% { opacity: 1 } 84%, 100% { opacity: 0 }')
    + kf('hc-bouncer-wait', '0%, 21.9% { opacity: 0 } 22%, 41.9% { opacity: 1 } 42%, 100% { opacity: 0 }')
    + kf('hc-bouncer-fly', '0%, 49.9% { opacity: 0 } 50%, 63.9% { opacity: 1 } 64%, 100% { opacity: 0 }')
    + kf('hc-bouncer-home', '0%, 83.9% { opacity: 0; transform: translateY(0) } 84% { opacity: 1; transform: translateY(0) } 89% { transform: translateY(-14px) } 94%, 100% { opacity: 1; transform: translateY(0) }')
    + kf('hc-bouncer-squish', '0%, 47% { transform: scale(1, 1) } 50% { transform: scale(1.25, .62) } 54% { transform: scale(.9, 1.15) } 58%, 100% { transform: scale(1, 1) }')
    + rule('hc-bouncer-move', 'hc-bouncer-move 5s linear infinite') + rule('hc-bouncer-wait', 'hc-bouncer-wait 5s linear infinite')
    + rule('hc-bouncer-fly', 'hc-bouncer-fly 5s linear infinite') + rule('hc-bouncer-home', 'hc-bouncer-home 5s ease-in-out infinite')
    + rule('hc-bouncer-squish', 'hc-bouncer-squish 5s ease-out infinite', 'transform-box: fill-box; transform-origin: 50% 100%; ')
    + dropIn('bouncer', 5, 32);

  // catapult, 5.5 s: stops by the spot at 20%, the spoon drops in at 30%, steps into it at 46%, the spoon flicks at 48%,
  // flies 46% to 62% (up to 2 rows above at 54%), lands on the far bank at 62%, walks home by 76%
  s += kf('hc-catapult-ham', `0% { ${T(20, 360)} } 20%, 40% { ${T(96, 360)} } 46% { ${T(150, 352)} } 50% { ${T(200, 296)} } 54% { ${T(270, 244)} }`
    + ` 58% { ${T(330, 276)} } 62% { ${T(390, 360)} } 76%, 100% { ${T(398, 360)} }`)
    + rule('hc-catapult-ham', 'hc-catapult-ham 5.5s linear infinite')
    + kf('hc-catapult-move', '0%, 19.9% { opacity: 1 } 20%, 39.9% { opacity: 0 } 40%, 46.9% { opacity: 1 } 47%, 61.9% { opacity: 0 } 62%, 75.9% { opacity: 1 } 76%, 100% { opacity: 0 }')
    + kf('hc-catapult-wait', '0%, 19.9% { opacity: 0 } 20%, 39.9% { opacity: 1 } 40%, 100% { opacity: 0 }')
    + kf('hc-catapult-fly', '0%, 46.9% { opacity: 0 } 47%, 61.9% { opacity: 1 } 62%, 100% { opacity: 0 }')
    + kf('hc-catapult-home', '0%, 75.9% { opacity: 0; transform: translateY(0) } 76% { opacity: 1; transform: translateY(0) } 81% { transform: translateY(-14px) } 86%, 100% { opacity: 1; transform: translateY(0) }')
    + kf('hc-catapult-flick', '0%, 46% { transform: rotate(0) } 49% { transform: rotate(-22deg) } 53% { transform: rotate(8deg) } 57%, 100% { transform: rotate(0) }')
    + rule('hc-catapult-move', 'hc-catapult-move 5.5s linear infinite') + rule('hc-catapult-wait', 'hc-catapult-wait 5.5s linear infinite')
    + rule('hc-catapult-fly', 'hc-catapult-fly 5.5s linear infinite') + rule('hc-catapult-home', 'hc-catapult-home 5.5s ease-in-out infinite')
    + rule('hc-catapult-flick', 'hc-catapult-flick 5.5s ease-out infinite', 'transform-box: fill-box; transform-origin: 70% 85%; ')
    + dropIn('catapult', 5.5, 30);

  // button, 5.5 s: onto the bottle top by 22% (it clicks down at 24% and stays down), the lid swings down 26% to 37%,
  // on from 30%, over the lid (x 180 to 300) and home by 75%
  s += kf('hc-button-ham', `0% { ${T(20, 360)} } 22%, 30% { ${T(90, 360)} } 75%, 100% { ${T(398, 360)} }`) + rule('hc-button-ham', 'hc-button-ham 5.5s linear infinite')
    + kf('hc-button-move', '0%, 74.9% { opacity: 1 } 75%, 100% { opacity: 0 }')
    + kf('hc-button-home', '0%, 74.9% { opacity: 0; transform: translateY(0) } 75% { opacity: 1; transform: translateY(0) } 80% { transform: translateY(-14px) } 85%, 100% { opacity: 1; transform: translateY(0) }')
    + kf('hc-button-cap', '0%, 21% { transform: scale(1, 1) } 24%, 100% { transform: scale(1, 0.5) }')
    + kf('hc-button-lid', '0%, 26% { transform: rotate(-90deg) } 34% { transform: rotate(4deg) } 37%, 100% { transform: rotate(0deg) }')
    + rule('hc-button-move', 'hc-button-move 5.5s linear infinite') + rule('hc-button-home', 'hc-button-home 5.5s ease-in-out infinite')
    + rule('hc-button-cap', 'hc-button-cap 5.5s ease-out infinite', 'transform-box: fill-box; transform-origin: 50% 100%; ')
    + rule('hc-button-lid', 'hc-button-lid 5.5s ease-in infinite', 'transform-origin: 0 0; ');

  // signpost, 6 s: along the ledge 0% to 15%, the drop to the floor to 19%, waits beside the pond's edge to 40% (the
  // signpost drops in at 28%), on to it by 45%, turns 45% to 51% (facing left from 48%), back left to home by 76%
  s += kf('hc-signpost-ham', `0% { ${T(90, 240)} } 15% { ${T(270, 240)} } 19%, 40% { ${T(270, 360)} } 45%, 51% { ${T(330, 360)} } 76%, 100% { ${T(30, 360)} }`)
    + rule('hc-signpost-ham', 'hc-signpost-ham 6s linear infinite')
    + kf('hc-signpost-move', '0%, 14.9% { opacity: 1 } 15%, 39.9% { opacity: 0 } 40%, 47.9% { opacity: 1 } 48%, 100% { opacity: 0 }')
    + kf('hc-signpost-fall', '0%, 14.9% { opacity: 0 } 15%, 18.9% { opacity: 1 } 19%, 100% { opacity: 0 }')
    + kf('hc-signpost-wait', '0%, 18.9% { opacity: 0 } 19%, 39.9% { opacity: 1 } 40%, 100% { opacity: 0 }')
    + kf('hc-signpost-back', '0%, 47.9% { opacity: 0 } 48%, 75.9% { opacity: 1 } 76%, 100% { opacity: 0 }')
    + kf('hc-signpost-home', '0%, 75.9% { opacity: 0; transform: translateY(0) } 76% { opacity: 1; transform: translateY(0) } 81% { transform: translateY(-14px) } 86%, 100% { opacity: 1; transform: translateY(0) }')
    + kf('hc-signpost-wob', '0%, 45% { transform: rotate(0) } 47% { transform: rotate(-12deg) } 50% { transform: rotate(9deg) } 53%, 100% { transform: rotate(0) }')
    + rule('hc-signpost-move', 'hc-signpost-move 6s linear infinite') + rule('hc-signpost-fall', 'hc-signpost-fall 6s linear infinite')
    + rule('hc-signpost-wait', 'hc-signpost-wait 6s linear infinite') + rule('hc-signpost-back', 'hc-signpost-back 6s linear infinite')
    + rule('hc-signpost-home', 'hc-signpost-home 6s ease-in-out infinite')
    + rule('hc-signpost-wob', 'hc-signpost-wob 6s ease-out infinite', 'transform-box: fill-box; transform-origin: 50% 100%; ')
    + on('hc-signpost-swirl', 6, 45, 52) + dropIn('signpost', 6, 28);

  // floater, 5.5 s: takes it at 48%, drifts down, swaying, to the floor at 76%
  s += kf('hc-floater-ham', `0% { ${T(20, 180)} } 20%, 40% { ${T(96, 180)} } 48% { ${T(150, 180)} } 53% { ${T(178, 214)} } 58% { ${T(196, 252)} }`
    + ` 63% { ${T(222, 286)} } 68% { ${T(236, 318)} } 72% { ${T(256, 344)} } 76% { ${T(266, 360)} } 90%, 100% { ${T(398, 360)} }`)
    + rule('hc-floater-ham', 'hc-floater-ham 5.5s linear infinite')
    + kf('hc-floater-move', '0%, 19.9% { opacity: 1 } 20%, 39.9% { opacity: 0 } 40%, 47.9% { opacity: 1 } 48%, 75.9% { opacity: 0 } 76%, 89.9% { opacity: 1 } 90%, 100% { opacity: 0 }')
    + kf('hc-floater-wait', '0%, 19.9% { opacity: 0 } 20%, 39.9% { opacity: 1 } 40%, 100% { opacity: 0 }')
    + kf('hc-floater-fly', '0%, 47.9% { opacity: 0 } 48%, 75.9% { opacity: 1 } 76%, 100% { opacity: 0 }')
    + kf('hc-floater-home', '0%, 89.9% { opacity: 0; transform: translateY(0) } 90% { opacity: 1; transform: translateY(0) } 94% { transform: translateY(-14px) } 97%, 100% { opacity: 1; transform: translateY(0) }')
    + rule('hc-floater-move', 'hc-floater-move 5.5s linear infinite') + rule('hc-floater-wait', 'hc-floater-wait 5.5s linear infinite')
    + rule('hc-floater-fly', 'hc-floater-fly 5.5s linear infinite') + rule('hc-floater-home', 'hc-floater-home 5.5s ease-in-out infinite')
    + kf('hc-floater-fit', '0%, 22% { opacity: 0 } 26%, 31% { opacity: 1 } 35%, 100% { opacity: 0 }')
    + kf('hc-floater-drop', '0%, 30% { opacity: 0; transform: translateY(-120px) } 32% { opacity: 1; transform: translateY(-120px) } 39% { transform: translateY(0) } 42% { transform: translateY(-9px) } 45%, 47.9% { opacity: 1; transform: translateY(0) } 48%, 100% { opacity: 0; transform: translateY(0) }')
    + kf('hc-floater-spark', '0%, 38% { opacity: 0 } 42%, 47% { opacity: 1 } 50%, 100% { opacity: 0 }')
    + rule('hc-floater-fit', 'hc-floater-fit 5.5s linear infinite') + rule('hc-floater-drop', 'hc-floater-drop 5.5s ease-in infinite')
    + rule('hc-floater-spark', 'hc-floater-spark 5.5s linear infinite');

  // tube, 5.5 s: three tubes drop in (28%, 32%, 36%), in at the bottom at 46%, up inside to 62%, out at the top at 66%
  s += kf('hc-tube-ham', `0% { ${T(30, 360)} } 20%, 44% { ${T(168, 360)} } 48% { ${T(236, 360)} } 64% { ${T(286, 240)} } 66% { ${T(312, 240)} } 84%, 100% { ${T(398, 240)} }`)
    + rule('hc-tube-ham', 'hc-tube-ham 5.5s linear infinite')
    + kf('hc-tube-move', '0%, 19.9% { opacity: 1 } 20%, 43.9% { opacity: 0 } 44%, 47.9% { opacity: 1 } 48%, 65.9% { opacity: 0 } 66%, 83.9% { opacity: 1 } 84%, 100% { opacity: 0 }')
    + kf('hc-tube-wait', '0%, 19.9% { opacity: 0 } 20%, 43.9% { opacity: 1 } 44%, 100% { opacity: 0 }')
    + kf('hc-tube-home', '0%, 83.9% { opacity: 0; transform: translateY(0) } 84% { opacity: 1; transform: translateY(0) } 89% { transform: translateY(-14px) } 94%, 100% { opacity: 1; transform: translateY(0) }')
    + rule('hc-tube-move', 'hc-tube-move 5.5s linear infinite') + rule('hc-tube-wait', 'hc-tube-wait 5.5s linear infinite')
    + rule('hc-tube-home', 'hc-tube-home 5.5s ease-in-out infinite')
    + kf('hc-tube-in', `0%, 48% { ${T(270, 360)} } 64%, 100% { ${T(270, 238)} }`) + rule('hc-tube-in', 'hc-tube-in 5.5s ease-in-out infinite')
    + kf('hc-tube-inside', '0%, 47.9% { opacity: 0 } 48%, 63.9% { opacity: 0.5 } 64%, 100% { opacity: 0 }') + rule('hc-tube-inside', 'hc-tube-inside 5.5s linear infinite')
    + kf('hc-tube-fit', '0%, 20% { opacity: 0 } 24%, 28% { opacity: 1 } 31%, 100% { opacity: 0 }') + rule('hc-tube-fit', 'hc-tube-fit 5.5s linear infinite')
    + kf('hc-tube-spark', '0%, 64% { opacity: 0 } 66%, 72% { opacity: 1 } 76%, 100% { opacity: 0 }') + rule('hc-tube-spark', 'hc-tube-spark 5.5s linear infinite');
  [28, 32, 36].forEach((at, i) => {
    s += kf(`hc-tube-drop${i}`, `0%, ${at - 2}% { opacity: 0; transform: translateY(-110px) } ${at}% { opacity: 1; transform: translateY(-110px) } ${at + 5}% { transform: translateY(0) } ${at + 7}% { transform: translateY(-6px) } ${at + 9}%, 100% { opacity: 1; transform: translateY(0) }`)
      + rule(`hc-tube-drop${i}`, `hc-tube-drop${i} 5.5s ease-in infinite`);
  });

  // worn stick, 6.5 s: each of the four is mid-stick at STICK_T; cracks after the first three; snaps under the fourth
  const [t0, t1, t2, t3] = STICK_T;
  const L = LOOP_S.stick;
  s += on('hc-stick-c0', L, 0, t0 + 3) + on('hc-stick-c1', L, t0 + 3, t1 + 3) + on('hc-stick-c2', L, t1 + 3, t2 + 3) + on('hc-stick-c3', L, t2 + 3, t3)
    + on('hc-stick-puff', L, t3, t3 + 6)
    + kf('hc-stick-halfL', `0%, ${t3 - 0.1}% { opacity: 0; transform: translate(0, 0) rotate(0) } ${t3}% { opacity: 1; transform: translate(0, 0) rotate(0) } ${t3 + 12}% { opacity: 0; transform: translate(-14px, 120px) rotate(-55deg) } 100% { opacity: 0 }`)
    + kf('hc-stick-halfR', `0%, ${t3 - 0.1}% { opacity: 0; transform: translate(0, 0) rotate(0) } ${t3}% { opacity: 1; transform: translate(0, 0) rotate(0) } ${t3 + 12}% { opacity: 0; transform: translate(14px, 120px) rotate(55deg) } 100% { opacity: 0 }`)
    + rule('hc-stick-halfL', `hc-stick-halfL ${L}s ease-in infinite`, 'transform-box: fill-box; transform-origin: 50% 50%; ')
    + rule('hc-stick-halfR', `hc-stick-halfR ${L}s ease-in infinite`, 'transform-box: fill-box; transform-origin: 50% 50%; ');
  STICK_T.forEach((t, n) => {
    const st = Math.max(0.1, t - 14);   // comes out of the left 14% before it is mid-stick
    const path4 = n < 3
      ? `${t + 4}% { opacity: 1; ${T(252, 300)} } ${t + 18}% { opacity: 1; ${T(404, 300)} } ${t + 21}% { opacity: 0; ${T(420, 300)} }`
      : `${t + 4}% { opacity: 1; ${T(210, 300)} } ${t + 8}% { opacity: 1; ${T(252, 300)} } ${t + 22}% { opacity: 1; ${T(404, 300)} } ${t + 25}% { opacity: 0; ${T(420, 300)} }`;
    s += kf(`hc-stick-h${n}`, `0%, ${(st - 0.1).toFixed(1)}% { opacity: 0; ${T(30, 240)} } ${st}% { opacity: 1; ${T(30, 240)} } ${t}% { opacity: 1; ${T(210, 240)} } ${path4} 100% { opacity: 0; ${T(420, 300)} }`)
      + rule(`hc-stick-h${n}`, `hc-stick-h${n} ${L}s linear infinite`);
  });

  // see-saw, 6.5 s: the first up to the high end by 24% and waiting; the second by 32%; it tips 35% to 44%; the two
  // off by 66%; the ramp drops in at 52% (lit from 41%); the third, waiting from 44%, climbs it from 60%, is on the
  // raised end at 68%, at the low end at 78% and home at 88% (D-177 (2))
  const SL = LOOP_S.seesaw;
  s += kf('hc-seesaw-h1', `0% { opacity: 1; ${T(30, 240)} } 10% { ${T(126, 240)} } 12% { ${T(150, 300)} } 24%, 33.9% { opacity: 1; ${T(270, 180)} } 34%, 100% { opacity: 0; ${T(270, 180)} }`)
    + kf('hc-seesaw-m1', '0%, 23.9% { opacity: 1 } 24%, 100% { opacity: 0 }')
    + kf('hc-seesaw-tap', '0%, 23.9% { opacity: 0; transform: translateY(0) } 24%, 27%, 30%, 33% { opacity: 1; transform: translateY(0) } 25.5%, 28.5%, 31.5% { transform: translateY(-5px) } 33.9% { opacity: 1 } 34%, 100% { opacity: 0 }')
    + kf('hc-seesaw-h2', `0%, 8.9% { opacity: 0; ${T(30, 240)} } 9% { opacity: 1; ${T(30, 240)} } 19% { ${T(126, 240)} } 21% { ${T(150, 300)} } 32%, 33.9% { opacity: 1; ${T(250, 200)} } 34%, 100% { opacity: 0; ${T(250, 200)} }`)
    + on('hc-seesaw-r1', SL, 34, 45) + on('hc-seesaw-r2', SL, 34, 45) + on('hc-seesaw-love', SL, 34, 40)
    + kf('hc-seesaw-tilt', '0%, 35% { transform: rotate(-45deg) } 44%, 92% { transform: rotate(45deg) } 100% { transform: rotate(-45deg) }')
    + kf('hc-seesaw-off', '0%, 44.9% { opacity: 0 } 45%, 66% { opacity: 1 } 69%, 100% { opacity: 0 }')
    + kf('hc-seesaw-o1', `0%, 45% { ${T(270, 300)} } 62%, 100% { ${T(420, 300)} }`)
    + kf('hc-seesaw-o2', `0%, 45% { ${T(250, 288)} } 47% { ${T(268, 300)} } 66%, 100% { ${T(410, 300)} }`)
    + kf('hc-seesaw-h3', `0%, 37.9% { opacity: 0; ${T(-20, 240)} } 38% { opacity: 1; ${T(-20, 240)} } 44%, 60% { ${T(30, 240)} } 66% { ${T(124, 180)} } 68% { ${T(150, 180)} }`
      + ` 78% { ${T(270, 300)} } 88%, 100% { opacity: 1; ${T(400, 300)} }`)
    + looks('seesaw-h3', SL, 44, 60, 88) + dropIn('seesaw', SL, 52)
    + rule('hc-seesaw-h1', `hc-seesaw-h1 ${SL}s linear infinite`) + rule('hc-seesaw-m1', `hc-seesaw-m1 ${SL}s linear infinite`)
    + rule('hc-seesaw-tap', `hc-seesaw-tap ${SL}s linear infinite`) + rule('hc-seesaw-h2', `hc-seesaw-h2 ${SL}s linear infinite`)
    + rule('hc-seesaw-tilt', `hc-seesaw-tilt ${SL}s ease-in-out infinite`) + rule('hc-seesaw-off', `hc-seesaw-off ${SL}s linear infinite`)
    + rule('hc-seesaw-o1', `hc-seesaw-o1 ${SL}s linear infinite`) + rule('hc-seesaw-o2', `hc-seesaw-o2 ${SL}s linear infinite`)
    + rule('hc-seesaw-h3', `hc-seesaw-h3 ${SL}s linear infinite`);

  // lift, 6 s (the mock-up's keyframes)
  s += kf('hc-lift-cupA', '0%, 22% { transform: translate(0, 0) } 26% { transform: translate(16px, -16px) } 51% { transform: translate(16px, -104px) } 55%, 100% { transform: translate(0, -120px) }')
    + kf('hc-lift-cupB', '0%, 22% { transform: translate(0, 0) } 26% { transform: translate(-16px, 16px) } 51% { transform: translate(-16px, 104px) } 55%, 100% { transform: translate(0, 120px) }')
    + kf('hc-lift-ham', `0% { ${T(40, 0)} } 18% { ${T(196, 0)} } 22% { ${T(204, -4)} } 26% { ${T(220, -20)} } 51% { ${T(220, -108)} } 55% { ${T(204, -124)} } 60% { ${T(236, -120)} } 78%, 100% { ${T(330, -120)} }`)
    + kf('hc-lift-move', '0%, 21.9% { opacity: 1 } 22%, 57.9% { opacity: 0 } 58%, 77.9% { opacity: 1 } 78%, 100% { opacity: 0 }')
    + kf('hc-lift-ride', '0%, 21.9% { opacity: 0 } 22%, 57.9% { opacity: 1 } 58%, 100% { opacity: 0 }')
    + kf('hc-lift-home', '0%, 77.9% { opacity: 0; transform: translateY(0) } 78% { opacity: 1; transform: translateY(0) } 84% { transform: translateY(-14px) } 90%, 100% { opacity: 1; transform: translateY(0) }')
    + kf('hc-lift-string', '0%, 22% { stroke-dashoffset: 0 } 55%, 100% { stroke-dashoffset: -120 }')
    + kf('hc-lift-friend', '0%, 100% { transform: translateY(0) } 50% { transform: translateY(-5px) }')
    + rule('hc-lift-cupA', 'hc-lift-cupA 6s ease-in-out infinite') + rule('hc-lift-cupB', 'hc-lift-cupB 6s ease-in-out infinite')
    + rule('hc-lift-ham', 'hc-lift-ham 6s ease-in-out infinite') + rule('hc-lift-move', 'hc-lift-move 6s linear infinite')
    + rule('hc-lift-ride', 'hc-lift-ride 6s linear infinite') + rule('hc-lift-home', 'hc-lift-home 6s ease-in-out infinite')
    + rule('hc-lift-string', 'hc-lift-string 6s ease-in-out infinite') + rule('hc-lift-friend', 'hc-lift-friend .8s ease-in-out infinite');
  return s;
}
export const CARD_CSS = css();

// ---------------------------------------------------------------- the card
// The gadget's or part's badge, top left on the card.
export function badgeArt(kind) {
  let s = rect(84, 30, 78, 78, '#FFF', 16, 3);
  if (kind === 'bridge' || kind === 'stick') s += place(gadget(kind), 92, 58, 0.62);
  else if (kind === 'button') s += place(buttonCap(), 93, 84, 1.1);
  else if (kind === 'seesaw') s += place(seesawArt(), 123, 72, 0.26, -24) + place(potArt(0, 0, 30), 123, 72, 0.6);
  else if (kind === 'lift') s += path('M 123 36 L 123 70', 'none', 3, '#E8505B', ' stroke-dasharray="6 4"') + place(teacupBack(), 123, 86) + place(teacupFront(), 123, 86);
  else s += place(gadget(kind), 93, 39, 0.6);
  return s;
}

function tick() {
  const d = 'M 340 368 L 355 382 L 382 352';
  return g(g(rect(300, 340, 120, 54, GREEN, 27, 3.5) + rect(312, 347, 96, 14, 'rgba(255,255,255,0.28)', 7, 0)
    + path(d, 'none', 14, INK) + path(d, 'none', 8, '#fff'), '', ' class="hc-tick"'), '', ' class="btn" data-btn="cardok" role="button" aria-label="OK"');
}

// The whole card, in the board window's units (720 x 420); game.js dims what's behind it.
export function cardArt(kind) {
  if (!CARDS.includes(kind)) return '';
  const cap = CAPTION[kind];
  const size = Math.min(34, Math.floor(470 / (0.52 * cap.length)));
  let s = rect(58, 16, 604, 390, CREAM, 28, 4);
  s += badgeArt(kind) + text(412, 70 + size * 0.36, cap, size);
  s += rect(90, 120, 540, 212, '#F3E3C8', 12, 2.5);
  s += `<svg x="90" y="120" width="540" height="212" viewBox="${VIEW[kind]}" preserveAspectRatio="xMidYMid meet" overflow="hidden">${cls(`hc-${kind}`, SCENE[kind]())}</svg>`;
  s += tick();
  return `<g data-card="${kind}" role="img" aria-label="${cap}">${s}</g>`;
}
