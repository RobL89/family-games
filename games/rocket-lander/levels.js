// Number mode's levels: the table contract v0.3 GC3 asks each game to document. The
// launcher decides which level a child is on and moves them up; the game maps each level
// to its difficulty here. Played on its own, the game is on level 1 (GC5).
//
// Data only. Source: D-038 (P-034's decisions), the ladder proposed on the step 2a-1
// sketches page and agreed by Rob on 2026-11-09 ("i agree with your recommendations").
// The dice faces' share, about one landing in three, is Claude's judgement, named in D-038.
//
// Units and meanings:
//   from, to      numbers at the two ends of the line (whole numbers, in ones: step 1);
//   label_every   the gap between written numbers, in the line's own numbers (1 = every
//                 number, 2 = every other, 5 = 0, 5, 10; 0 = only the two ends);
//   labels        how the written numbers look: 'plain' (white), 'parity' (even blue, odd
//                 yellow: D-035's E1), 'parity-faint' (those colours faded), 'odd-faint'
//                 (odd numbers faint: sketch G1);
//   mix           whole-number weights for each target rule, as shares of a round's
//                 landings: 'any' (a written number), 'parity' (any even or any odd number),
//                 'dice' (a dice face, 1 to 6: D-035's D1).

export const LEVELS = [
  { level: 1, from: 0, to: 5, label_every: 1, labels: 'plain', mix: { any: 1 }, source: 'D-038: numbers first, a short line' },
  { level: 2, from: 0, to: 10, label_every: 1, labels: 'plain', mix: { any: 2, dice: 1 }, source: 'D-038: 0 to 10, dice faces join' },
  { level: 3, from: 0, to: 10, label_every: 1, labels: 'parity', mix: { parity: 2, dice: 1 }, source: 'D-038: odd and even coloured (E1)' },
  { level: 4, from: 0, to: 10, label_every: 1, labels: 'parity-faint', mix: { any: 1, parity: 1, dice: 1 }, source: 'D-038: the colours faint' },
  { level: 5, from: 0, to: 10, label_every: 1, labels: 'odd-faint', mix: { any: 2, dice: 1 }, source: 'D-038: odd numbers faint (G1)' },
  { level: 6, from: 0, to: 10, label_every: 2, labels: 'plain', mix: { any: 2, dice: 1 }, source: 'D-038: every other number written (G2)' },
  { level: 7, from: 0, to: 10, label_every: 5, labels: 'plain', mix: { any: 2, dice: 1 }, source: 'D-038: 0, 5 and 10 written (G3)' },
  { level: 8, from: 0, to: 10, label_every: 0, labels: 'plain', mix: { any: 1 }, source: 'D-038: 0 and 10 only (T2), no dice faces' },
];
