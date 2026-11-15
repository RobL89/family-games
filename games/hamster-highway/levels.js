// Hamster Highway's levels. Version 1.2. Data only: core.js reads the boards, game.js the rest.
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
];
