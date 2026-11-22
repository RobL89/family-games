// Hamster Highway feedback item 9 (D-214): looks for Pudding's own picture in the hamster counter, version 0.1 (22 Nov).
// Mock-up code only: mock_hamster_step17b_levels.py appends this to a scratch copy of art.js (never the repo's) and has
// that copy's game.js call countHead() for each head in the counter. Nothing here is built into the game.
//   now  as built (D-200): five Nibble heads, lit in order as hamsters get home;
//   C1   Pudding's own face (vanilla with caramel, as art.js's pudding()) in its place in the line, same size;
//   C2   as C1, a fifth bigger (as Pudding on the board) on a soft caramel ring;
//   C3   Pudding's face last, set a little apart from the four Nibbles.
// C1 to C3 light each head when that hamster gets home (not by count), so Pudding's face lights only for Pudding.

export const COUNT_LOOKS = ['now', 'C1', 'C2', 'C3'];
const CARAMEL = '#D9944A';

export function puddingHead(eyes = 'open') {
  const head = hamsterHead(eyes).split(FUR).join(PUD_FUR).split(BELLY).join(WHITE);
  const cap = path('M -28 -54 Q -10 -70 10 -66 Q 28 -64 32 -52 Q 26 -46 22 -54 Q 18 -44 12 -52 Q 4 -42 -2 -54 Q -10 -44 -16 -54 Q -22 -46 -28 -54 Z', CARAMEL, 2.2);
  return head + g(cap, 'translate(0 -6) scale(0.86 0.9)');
}

// One head of the counter, its feet at x, y, scaled k (as game.js's renderCount places hamsterHead()).
export function countHead(look, isPudding, lit, x, y, k) {
  const pud = isPudding && look !== 'now';
  let body = pud ? puddingHead() : hamsterHead();
  let kk = k;
  if (pud && look === 'C2') {
    kk = k * 1.2;
    body = circle(0, -40, 40, '#FBE3C4', 3, CARAMEL) + body;
  }
  return place(g(body, '', lit ? ' class="tiny-hop"' : ''), x, y, kk, 0, (lit ? '' : ' opacity="0.3"') + (pud ? ` data-pudhead="${look}"` : ''));
}
