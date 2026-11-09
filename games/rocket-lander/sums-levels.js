// Rocket Sums' levels: the table contract v0.3 GC3 asks each game to document. The launcher
// decides which level a child is on and moves them up; the game maps each level to its
// difficulty here. Played on its own, the game is on level 1 (GC5).
//
// Data only. Source: D-039 (P-034's decisions), the ladder proposed in the step 2a-2 chat and
// chosen by Rob on 2026-11-09 ("ladder, all 8 levels", "first level, start 0-5"), and D-040,
// his change after trying it: levels 1 and 2 in two halves ("the first half is plus to 5 and
// the second half is plus to 10", "minus to 5 then minus to 10"). Each half on its own line,
// 0 to 5 then 0 to 10, and "minus to 5" meaning taken from 5 or less, are Claude's reading. The rules every level keeps are in sums.js (D-021, D-023, D-024,
// D-028, D-033).
//
// Units and meanings:
//   ops          the operations a round asks, picked evenly ('+', '−', '×', '÷'); a grown-up's
//                `operations` setting replaces them;
//   plus_max     the biggest answer a + sum may have (each number in it stays 0 to 10);
//   minus_max    the biggest number a − sum takes from (10 if not given);
//   parts        the round in parts, in order, each laid over the row: two halves on
//                levels 1 and 2 (D-040; sums.js, partsOf and planParts);
//   layout       'line': the whole line from `from` to `to`, while every answer fits it;
//                'stretch': D-032's window layout, a stretch of `span` marks with the answer
//                somewhere in it (named so the purity check's ban on the word `window`
//                stays whole); a 'line' level also uses it if a setting brings in bigger answers;
//   from, to     the whole line's ends (layout 'line'), in ones;
//   label_every  the gap between written numbers (1 = every number, 2 = every other); the
//                two ends are always written.

export const LEVELS = [
  { level: 1, ops: ['+'], layout: 'line', from: 0, label_every: 1, parts: [{ plus_max: 5, to: 5 }, { plus_max: 10, to: 10 }],
    source: 'D-039, D-040: + to 5 on 0 to 5, then + to 10 on 0 to 10' },
  { level: 2, ops: ['−'], layout: 'line', from: 0, label_every: 1, parts: [{ minus_max: 5, to: 5 }, { minus_max: 10, to: 10 }],
    source: 'D-039, D-040: − from 5 or less on 0 to 5, then from 10 or less on 0 to 10' },
  { level: 3, ops: ['+', '−'], plus_max: 10, layout: 'line', from: 0, to: 10, label_every: 1, source: 'D-039: + and − mixed, within 10' },
  { level: 4, ops: ['+'], plus_max: 20, layout: 'stretch', span: 10, label_every: 1, source: 'D-039: + up to 20, in a stretch of 10 marks' },
  { level: 5, ops: ['+', '−'], plus_max: 20, layout: 'stretch', span: 10, label_every: 1, source: 'D-039: + and − mixed, + up to 20' },
  { level: 6, ops: ['+', '−'], plus_max: 20, layout: 'stretch', span: 10, label_every: 2, source: 'D-039: as level 5, every other number written' },
  { level: 7, ops: ['×'], layout: 'stretch', span: 10, label_every: 1, source: 'D-039: × (no 0)' },
  { level: 8, ops: ['+', '−', '×', '÷'], plus_max: 20, layout: 'stretch', span: 10, label_every: 1, source: 'D-039: all four mixed' },
];
