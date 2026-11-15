// Hamster Highway's levels. Version 1.4. Data only: core.js reads the boards, game.js the rest.
//
// Changes at v1.4 (step 4, D-157, D-158, D-160): level 9, Teacup ride, at the shed, 20 squares wide: a bridge over
// water and a ramp up a step, then the teacup lift with two cups (a part: `new` names it) up to the potting bench, and
// a big drop off its end that needs a floater; its seed hangs just past the bench, reached by the spare bridge at
// 15,2 (the bench made one longer), as solve_hamster_highway.py 1.3 found. Level 10, Treehouse party, the finale,
// 24 wide, with every gadget but the worn stick (D-154) and both parts: a bridge over water, a bouncer over a wall,
// a floater off it, three tubes up a ledge, a ramp onto the see-saw's raised end (over water, as level 8), then the
// lift up to the treehouse; its seed sits above the treehouse floor, reached by the spare ramp at 19,1 or 20,1. It
// brings in nothing new (`new` null). Too big to try every placement: the solver checks it near its answer.
//
// Changes at v1.3 (step 4, D-156, D-158): level 8, Two to tip, at the veg patch: the first wide level, 18 squares,
// and the see-saw (a part, not a gadget: `new` names it for the house and the tests). A bridge over a gap and a ramp
// up a step on the way, then the see-saw over a gap in the veg patch: the first two hamsters tip it, and a ramp
// at the end of the high bank lets the other three onto its raised near end. Its seed hangs over the first gap,
// reached by the spare ramp just before it (2,4), as solve_hamster_highway.py 1.2 found. `parts` lists its
// see-saw for core.js.
//
// Changes at v1.2 (step 3, D-143, D-153, D-154): level 6, Crack!, at the bath, and level 7, Two by two, on the
// loft's rafters, both with the worn stick, which snaps under the fourth hamster, so a second stick must catch
// hamsters 4 and 5: level 6 one under the other, level 7 four in two layers. Their seeds need the spare ramp:
// past the bath (6,4 or 7,4) on level 6, just before the gap (4,2 only) on level 7, as solve_hamster_highway.py
// 1.1 found. Worn sticks only on a couple of levels (D-154). Each has its own backdrop.
//
// Changes at v1.1 (step 2, D-145, D-149): level 4, Gentle landing (the floater), by the living room's bookshelf,
// and level 5, Tube trip (the tube), at the bedroom's cage, each on the sketch model's board with a golden seed
// that needs the level's spare (a second bridge beside the ledge; a fourth tube on top), and its own backdrop.
// `spare` names the gadget a level's seed needs (levels 2 to 5); tools/tests/games/solve_hamster_highway.py
// tries every placement to show the seed needs it.
//
// Source: levels 1 to 3 of the five first levels Rob agreed (D-136, brief 0.3), their boards
// copied from tools/tests/games/sketch_bridge_builder.py 0.1's LEVELS, with a golden seed each
// (D-138). The seeds are Claude's design, to be tried in the first preview:
//   level 1: on the way, so the first hamster shows what a seed is;
//   level 2: one square up from the floor, reached by putting the spare ramp just before it;
//   level 3: on the low step past the wall, reached by putting the spare ramp where they land, or
//            one square on (so its home moves one square right, to 11,4, from the sketch's 10,4).
// Each level sits in a place in the house picker (D-140): `room` and `spot` name it there (house.js).
// `back` is the level's backdrop (art.js); `new` the gadget it brings in.
//
// Marks: '#' ground, '.' air, 'S' start, 'G' home, '*' golden seed. 12 across, 7 down.

export const LEVELS = [
  {
    id: 'L1', name: 'Mind the gap', room: 'kitchen', spot: 'sink', back: 'kitchen', new: 'bridge',
    tray: { bridge: 1 },
    rows: [
      '............',
      '............',
      '............',
      '............',
      '............',
      'S.......*.G.',
      '#####.######',
    ],
  },
  {
    id: 'L2', name: 'Step up', room: 'kitchen', spot: 'breadbin', back: 'kitchen', new: 'ramp',
    tray: { bridge: 1, ramp: 2 }, spare: 'ramp',
    rows: [
      '............',
      '............',
      '............',
      '............',
      '.....*....G.',
      'S.......####',
      '###.########',
    ],
  },
  {
    id: 'L3', name: 'Boing!', room: 'pantry', spot: 'tins', back: 'pantry', new: 'bouncer',
    tray: { bridge: 1, bouncer: 1, ramp: 1 }, spare: 'ramp',
    rows: [
      '............',
      '............',
      '............',
      '......###.*.',
      '......###..G',
      'S.....######',
      '##.#########',
    ],
  },
  {
    id: 'L4', name: 'Gentle landing', room: 'living', spot: 'bookshelf', back: 'living', new: 'floater',
    tray: { bridge: 2, floater: 1 }, spare: 'bridge',
    rows: [
      '............',
      'S...........',
      '###.##......',
      '.......*....',
      '............',
      '..........G.',
      '....########',
    ],
  },
  {
    id: 'L5', name: 'Tube trip', room: 'bedroom', spot: 'cage', back: 'bedroom', new: 'tube',
    tray: { bridge: 1, tube: 4 }, spare: 'tube',
    rows: [
      '............',
      '............',
      '.......*....',
      '.........G..',
      '.......####.',
      'S...........',
      '###.########',
    ],
  },
  {
    id: 'L6', name: 'Crack!', room: 'bathroom', spot: 'bath', back: 'bathroom', new: 'stick',
    tray: { stick: 2, ramp: 1 }, spare: 'ramp',
    rows: [
      '............',
      '............',
      '............',
      'S......*....',
      '#####.....G.',
      '#####.######',
      '#####.######',
    ],
  },
  {
    id: 'L7', name: 'Two by two', room: 'loft', spot: 'rafters', back: 'loft', new: 'stick',
    tray: { stick: 4, ramp: 1 }, spare: 'ramp',
    rows: [
      '............',
      '.....*......',
      'S...........',
      '#####.....G.',
      '#####..#####',
      '#####..#####',
      '#####..#####',
    ],
  },
  {
    id: 'L8', name: 'Two to tip', room: 'garden', spot: 'veg', back: 'veg', new: 'seesaw',
    tray: { bridge: 1, ramp: 3 }, spare: 'ramp',
    parts: [{ kind: 'seesaw', c: 11, r: 3 }],
    rows: [
      '..................',
      '..................',
      '..................',
      '...*..............',
      'S.....#####.......',
      '###.#######.....G.',
      '###.#######.#.####',
    ],
  },
  {
    id: 'L9', name: 'Teacup ride', room: 'garden', spot: 'shed', back: 'shed', new: 'lift',
    tray: { bridge: 2, ramp: 1, floater: 1 }, spare: 'bridge',
    parts: [{ kind: 'lift', c: 8, top: 2, bottom: 5, cups: 2 }],
    rows: [
      '....................',
      '................*...',
      '.........######.....',
      '.........######.....',
      'S.....#..######.....',
      '###.####.######...G.',
      '###.################',
    ],
  },
  {
    id: 'L10', name: 'Treehouse party', room: 'garden', spot: 'treehouse', back: 'treehouse', new: null,
    tray: { bridge: 1, ramp: 2, bouncer: 1, floater: 1, tube: 3 }, spare: 'ramp',
    parts: [{ kind: 'seesaw', c: 12, r: 3 }, { kind: 'lift', c: 17, top: 2, bottom: 5, cups: 2 }],
    rows: [
      '....................*...',
      '......................G.',
      '..................######',
      '.....###................',
      '.....###..##............',
      'S....###..##...##.......',
      '##.#########.#.#########',
    ],
  },
];
