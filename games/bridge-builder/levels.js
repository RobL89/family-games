// Hamster Highway's levels. Version 1.0. Data only: core.js reads the boards, game.js the rest.
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
    tray: { bridge: 1, ramp: 2 },
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
    tray: { bridge: 1, bouncer: 1, ramp: 1 },
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
];
