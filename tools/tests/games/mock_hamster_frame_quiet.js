// Hamster Highway: three quieter looks for the climbing frame's backdrop (levels 23 and 24), version 0.1, 22 Nov
// (feedback item 4, D-209: the frame stands out too much behind the floors the hamsters walk on).
// Not loaded by the game: mock_hamster_step17b.py appends this file to a scratch copy of art.js 1.11, so it uses
// art.js's own helpers and constants (rect, path, line, ellipse, g, pondSky, frameHill, frameBush, frameRobin,
// frameLadybird, FRED, SUN, INK, CORAL, LEAF). The frame's shapes and places are art.js's frameArt (look A, D-208),
// unchanged; only their colours, outlines, opacity and size change:
//   frameQ1 Faded: the frame as now at 40% opacity; the hill, bushes, robin and ladybird as now.
//   frameQ2 Soft: pastel posts and bars with thin soft outlines in place of the dark ones, at 75%.
//   frameQ3 Far: the frame two-thirds the size, standing back on the hill, pastel without outlines and hazed with
//           the sky's blue; the robin and ladybird move down onto the bushes.
const FQ_SOFT = { post: '#F4B6BA', bar: '#FBE7A1', line: '#D9B3A2', sw: 1.4, flag1: '#F7B7BF', flag2: '#BFE3B4' };
const FQ_FAR = { post: '#EFC6CB', bar: '#F6ECC8', line: '#EFC6CB', sw: 0, flag1: '#F2C9CF', flag2: '#CFE7C7' };
const FQ_NOW = { post: FRED, bar: SUN, line: INK, sw: 3, flag1: CORAL, flag2: LEAF };

// One frame (two towers joined by monkey bars), its left post at x, in look o; k counts frames, for the flag's colour.
function frameQShapes(x, k, o) {
  const post = (px, top) => rect(px - 8, top, 16, 452 - top, o.post, 4, o.sw, o.line) + ellipse(px, 452, 14, 5, '#8FC97A', 0);
  let d = post(x, 170) + post(x + 200, 170) + post(x + 420, 230) + post(x + 560, 230);
  for (const y of [240, 320, 400]) d += rect(x - 10, y - 7, 220, 14, o.bar, 7, o.sw, o.line);
  for (const y of [300, 380]) d += rect(x + 410, y - 7, 160, 14, o.bar, 7, o.sw, o.line);
  d += rect(x + 192, 224, 236, 12, o.bar, 6, o.sw, o.line) + rect(x + 192, 254, 236, 12, o.bar, 6, o.sw, o.line)
    + [0, 1, 2, 3, 4, 5, 6].map((i) => line(x + 222 + 30 * i, 236, x + 222 + 30 * i, 254, o.sw ? o.line : o.bar, o.sw ? o.sw + 0.6 : 3)).join('');
  d += g(line(x + 100, 170, x + 100, 110, o.sw ? o.line : o.post, o.sw ? o.sw + 0.5 : 3) + path(`M ${x + 100} 112 L ${x + 146} 126 L ${x + 100} 140 Z`, k % 2 ? o.flag2 : o.flag1, o.sw, o.line), '', ' class="poke" data-poke="swing"');
  d += rect(x - 12, 162, 224, 14, o.post, 6, o.sw, o.line);
  return d;
}

// The whole backdrop in one of the three looks ('Q1', 'Q2', 'Q3'), w wide and 540 tall.
function frameQuiet(w, look) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  let frames = '';
  let k = 0;
  for (let x = 230; x + 420 <= w + 40; x += 600, k++) {
    if (look === 'Q1') frames += g(frameQShapes(x, k, FQ_NOW), '', ' opacity="0.4"');
    else if (look === 'Q2') frames += g(frameQShapes(x, k, FQ_SOFT), '', ' opacity="0.75"');
    else frames += g(frameQShapes(x, k, FQ_FAR), `translate(${x + 280} 428) scale(0.62) translate(${-(x + 280)} -452)`, ' opacity="0.7"');
  }
  let bushes = '';
  for (let x = 40; x < w; x += 420) bushes += frameBush(x, 448);
  d += look === 'Q3' ? frames + bushes : bushes + frames;   // as now, the bushes behind the frame; the far frame behind them
  if (look === 'Q3') d += frameRobin(60, 418) + frameLadybird(478, 446);
  else d += frameRobin(380, 233) + frameLadybird(650, 330);
  return s + g(d, '', ' opacity="0.92"');
}
const frameQ1 = (w) => frameQuiet(w, 'Q1');
const frameQ2 = (w) => frameQuiet(w, 'Q2');
const frameQ3 = (w) => frameQuiet(w, 'Q3');
// The colours the frame's bars end up as on the sky behind them (for the page's contrast table): [bar, outline, opacity].
export const FRAME_QUIET_COLOURS = { now: [SUN, INK, 0.92], Q1: [SUN, INK, 0.92 * 0.4], Q2: [FQ_SOFT.bar, FQ_SOFT.line, 0.92 * 0.75], Q3: [FQ_FAR.bar, null, 0.92 * 0.7] };
