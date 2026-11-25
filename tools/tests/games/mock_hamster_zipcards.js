// Hamster Highway step 18a: two mock-ups of the zip-line's help card (D-167, D-168; the zip-line D-195, D-196), Claude's,
// proposed, for Rob's pick. Version 0.1 (25 Nov). Not part of the game: mock_hamster_step18a.py appends this to a scratch
// copy of cards.js (1.5), where its helpers (board, ham, legs, cls, fit, sparks, dropIn, kf, rule, T, huh, tick) are in
// scope, and draws each card as the game does (cardArt's frame, with the zip-line's tray picture as the badge).
//   A "Zip down the line!" (4 words, 6 s): out along a ledge to its end under a block, a puzzled stop; the whole zip-line
//     drops in (hook, line and peg, as the other cards' gadgets do); it grabs its reel and zips down over the water,
//     swinging and kicking, lets go on the far bank with a little hop, and walks home.
//   B "Hook it high, peg it low!" (6 words, 7 s): the same, but the zip-line goes in as the child puts it in: the hook's
//     square lights up and the hook drops in under the block, then the low end's square lights up, a dashed line
//     stretches out to it and the peg drops in, and the line turns solid; then the ride.
// The ride (both): the hamster hangs 52 below its reel (as game.js draws it), swinging about the reel (the zip ride's
// look R1 on the mock-up page), with its feet kicking.

import { ellipse, line, PINK, zipLine, zipHook, zipPeg } from './art.js';

const ZIPS = ['zipA', 'zipB'];
CARDS.push(...ZIPS);
CAPTION.zipA = 'Zip down the line!';
CAPTION.zipB = 'Hook it high, peg it low!';
LOOP_S.zipA = 6;
LOOP_S.zipB = 7;

const ZROWS = ['........', '........', '.##.....', '........', '###.....', '###.....', '###..###'];
const kick = (k) => {   // the zip pose, feet kicked (as mock_hamster_fair.js's kickFeet)
  const base = hamster('zip');
  const [f1, f2] = [ellipse(-8, 4, 8, 5, PINK, 2.4), ellipse(14, 6, 8, 5, PINK, 2.4)];
  const [a, b] = k === 1 ? [ellipse(-18, -2, 8, 5, PINK, 2.4, INK, -30), ellipse(10, 10, 8, 5, PINK, 2.4)] : [ellipse(-6, 10, 8, 5, PINK, 2.4), ellipse(26, -1, 8, 5, PINK, 2.4, INK, 30)];
  return base.replace(f1, a).replace(f2, b);
};
const onLine = (k) => cls(`hc-${k}-swing`, g(cls('hc-zk1', place(kick(1), 0, 0, SC)) + cls('hc-zk2', place(kick(2), 0, 0, SC)), 'translate(0 52)'));
const rider = (k) => cls(`hc-${k}-ham`, cls(`hc-${k}-move`, legs()) + cls(`hc-${k}-wait`, ham(0, 0) + huh(10, -62)) + cls(`hc-${k}-on`, onLine(k)) + cls(`hc-${k}-home`, ham(0, -4, 'home')));
const zline = () => zipLine(150, 210, 390, 330);

VIEW.zipA = '0 96 480 324';
SCENE.zipA = () => board(ZROWS, [[3, 6], [4, 6]]) + place(homeArt(), 420, 300, GS) + fit(120, 180, 'zipA')
  + cls('hc-zipA-drop', zline() + zipHook(150, 180) + zipPeg(390, 360, 0.85)) + sparks('zipA', 172, 220)
  + rider('zipA');

VIEW.zipB = '0 96 480 324';
SCENE.zipB = () => board(ZROWS, [[3, 6], [4, 6]]) + place(homeArt(), 420, 300, GS)
  + cls('hc-zipB-hfit', rect(123, 181, 54, 54, SUN, 8, 3, SUN, ' fill-opacity="0.3" stroke-dasharray="6 5"'))
  + cls('hc-zipB-lfit', rect(363, 301, 54, 54, '#A0ECBE', 8, 3, '#2BB673', ' fill-opacity="0.4" stroke-dasharray="6 5"'))
  + g(cls('hc-zipB-ghost', line(0, 0, 240, 120, '#2BB673', 5, ' stroke-dasharray="10 7" stroke-linecap="round"')), 'translate(150 210)')
  + cls('hc-zipB-line', zline())
  + cls('hc-zipB-hook', zipHook(150, 180)) + cls('hc-zipB-peg', zipPeg(390, 360, 0.85)) + sparks('zipB', 172, 220)
  + rider('zipB');

// The keyframes, as the other cards': percentages of the loop.
function zipCss() {
  let s = '.hc-zipA-swing, .hc-zipB-swing { transform-box: view-box; transform-origin: 0 0; animation: hc-zswing .9s ease-in-out infinite alternate; }\n'
    + kf('hc-zswing', '0% { transform: rotate(-12deg) } 100% { transform: rotate(12deg) }')
    + '.hc-zk1 { animation: hc-legs .3s steps(1) infinite; } .hc-zk2 { animation: hc-legs .3s steps(1) infinite reverse; }\n';
  for (const k of ZIPS) s += rule(`hc-${k}`, `hc-fade ${LOOP_S[k]}s linear infinite`);
  // A: walk 0-20, wait 20-44 (drop-in at 34), on the line 44-64, a hop down to the bank 64-68, walk 68-82, home 82-100
  const ride = (a, b) => `${a}% { ${T(150, 240)} } ${a + 0.1}% { ${T(150, 210)} } ${b}% { ${T(390, 330)} } ${b + 0.1}% { ${T(392, 344)} } ${b + 4}% { ${T(404, 360)} }`;
  s += kf('hc-zipA-ham', `0% { ${T(30, 240)} } 20% { ${T(150, 240)} } ${ride(44, 64)} 82%, 100% { ${T(440, 360)} }`) + rule('hc-zipA-ham', 'hc-zipA-ham 6s linear infinite')
    + kf('hc-zipA-move', '0%, 19.9% { opacity: 1 } 20%, 64% { opacity: 0 } 64.1%, 81.9% { opacity: 1 } 82%, 100% { opacity: 0 }') + rule('hc-zipA-move', 'hc-zipA-move 6s linear infinite')
    + kf('hc-zipA-wait', '0%, 19.9% { opacity: 0 } 20%, 43.9% { opacity: 1 } 44%, 100% { opacity: 0 }') + rule('hc-zipA-wait', 'hc-zipA-wait 6s linear infinite')
    + kf('hc-zipA-on', '0%, 43.9% { opacity: 0 } 44%, 64% { opacity: 1 } 64.1%, 100% { opacity: 0 }') + rule('hc-zipA-on', 'hc-zipA-on 6s linear infinite')
    + kf('hc-zipA-home', '0%, 81.9% { opacity: 0; transform: translateY(0) } 82% { opacity: 1; transform: translateY(0) } 87% { transform: translateY(-14px) } 92%, 100% { opacity: 1; transform: translateY(0) }')
    + rule('hc-zipA-home', 'hc-zipA-home 6s ease-in-out infinite') + dropIn('zipA', 6, 34);
  // B: walk 0-17, wait 17-52: the hook's square lit 20-28, the hook drops in at 28; the low end's lit 34-44, the dashed
  // line 38-46, the peg drops in at 44 and the line turns solid at 46; on the line 52-70, hop 70-74, walk 74-86, home
  s += kf('hc-zipB-ham', `0% { ${T(30, 240)} } 17% { ${T(150, 240)} } ${ride(52, 70)} 86%, 100% { ${T(440, 360)} }`) + rule('hc-zipB-ham', 'hc-zipB-ham 7s linear infinite')
    + kf('hc-zipB-move', '0%, 16.9% { opacity: 1 } 17%, 70% { opacity: 0 } 70.1%, 85.9% { opacity: 1 } 86%, 100% { opacity: 0 }') + rule('hc-zipB-move', 'hc-zipB-move 7s linear infinite')
    + kf('hc-zipB-wait', '0%, 16.9% { opacity: 0 } 17%, 51.9% { opacity: 1 } 52%, 100% { opacity: 0 }') + rule('hc-zipB-wait', 'hc-zipB-wait 7s linear infinite')
    + kf('hc-zipB-on', '0%, 51.9% { opacity: 0 } 52%, 70% { opacity: 1 } 70.1%, 100% { opacity: 0 }') + rule('hc-zipB-on', 'hc-zipB-on 7s linear infinite')
    + kf('hc-zipB-home', '0%, 85.9% { opacity: 0; transform: translateY(0) } 86% { opacity: 1; transform: translateY(0) } 90% { transform: translateY(-14px) } 94%, 100% { opacity: 1; transform: translateY(0) }')
    + rule('hc-zipB-home', 'hc-zipB-home 7s ease-in-out infinite')
    + kf('hc-zipB-hfit', '0%, 19.9% { opacity: 0 } 20%, 28% { opacity: 1 } 30%, 100% { opacity: 0 }') + rule('hc-zipB-hfit', 'hc-zipB-hfit 7s linear infinite')
    + kf('hc-zipB-hook', '0%, 27.9% { opacity: 0; transform: translateY(-60px) } 28% { opacity: 1; transform: translateY(-60px) } 32% { transform: translateY(0) } 34% { transform: translateY(-6px) } 36%, 100% { opacity: 1; transform: translateY(0) }')
    + rule('hc-zipB-hook', 'hc-zipB-hook 7s ease-in infinite')
    + kf('hc-zipB-lfit', '0%, 33.9% { opacity: 0 } 34%, 44% { opacity: 1 } 46%, 100% { opacity: 0 }') + rule('hc-zipB-lfit', 'hc-zipB-lfit 7s linear infinite')
    + kf('hc-zipB-ghost', '0%, 37.9% { opacity: 0; transform: scale(0) } 38% { opacity: 1; transform: scale(0.05) } 44% { transform: scale(1) } 46% { opacity: 1; transform: scale(1) } 46.1%, 100% { opacity: 0; transform: scale(1) }')
    + rule('hc-zipB-ghost', 'hc-zipB-ghost 7s ease-out infinite', 'transform-box: view-box; transform-origin: 0 0; ')
    + kf('hc-zipB-peg', '0%, 43.9% { opacity: 0; transform: translateY(-60px) } 44% { opacity: 1; transform: translateY(-60px) } 47% { transform: translateY(0) } 49% { transform: translateY(-6px) } 51%, 100% { opacity: 1; transform: translateY(0) }')
    + rule('hc-zipB-peg', 'hc-zipB-peg 7s ease-in infinite')
    + kf('hc-zipB-line', '0%, 45.9% { opacity: 0 } 46%, 100% { opacity: 1 }') + rule('hc-zipB-line', 'hc-zipB-line 7s linear infinite')
    + kf('hc-zipB-spark', '0%, 46% { opacity: 0 } 48%, 56% { opacity: 1 } 60%, 100% { opacity: 0 }') + rule('hc-zipB-spark', 'hc-zipB-spark 7s linear infinite');
  return s;
}
export const ZIP_CARD_CSS = zipCss();

// The card, as cardArt draws it, with the zip-line's tray picture as its badge.
export function zipCardArt(kind) {
  const cap = CAPTION[kind];
  const size = Math.min(34, Math.floor(470 / (0.52 * cap.length)));
  let s = rect(58, 16, 604, 390, CREAM, 28, 4);
  s += rect(84, 30, 78, 78, '#FFF', 16, 3) + place(gadget('zip'), 93, 39, 0.6) + text(412, 70 + size * 0.36, cap, size);
  s += rect(90, 120, 540, 212, '#F3E3C8', 12, 2.5);
  s += `<svg x="90" y="120" width="540" height="212" viewBox="${VIEW[kind]}" preserveAspectRatio="xMidYMid meet" overflow="hidden">${cls(`hc-${kind}`, SCENE[kind]())}</svg>`;
  s += tick();
  return `<g data-card="${kind}" role="img" aria-label="${cap}">${s}</g>`;
}
