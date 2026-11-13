// Runs the real apps-script/Code.gs, unchanged, against the stand-ins in google.js (P75).
//
//   const bed = open();                    // a made-up Sheet shaped like script 0.3.0's
//   bed.post('ping')                       // what the launcher would get back, parsed
//   bed.run('setup')                       // a function run by hand from the editor
//   bed.ss.dump()                          // every tab's cells
//
// Each open() is a fresh script and a fresh Sheet, so checks can't affect each other.

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { Spreadsheet, services } = require('./google.js');

const REPO = path.resolve(__dirname, '..', '..', '..');
const SCRIPT = path.join(REPO, 'apps-script', 'Code.gs');
const CODE = 'test-code';

const day = (s) => new Date(s + 'T10:00:00Z');

// A Sheet as script 0.3.0 leaves it, with made-up players (never family names).
function sheet030() {
  return {
    Profiles: [
      ['profile_id', 'nickname', 'avatar', 'colour', 'created_at', 'active', 'skin'],
      ['p_sam', 'Sam', 'fox', '#F07A2A', day('2026-10-30'), true, 'sticker'],
      ['p_alex', 'Alex', 'owl', '#3A7BD5', day('2026-10-30'), true, ''],
    ],
    Scores: [
      ['event_id', 'profile_id', 'game_id', 'score', 'level', 'stars', 'seconds', 'played_at', 'received_at'],
      ['e1', 'p_sam', 'kriss-kross', 5, 1, 2, 60, day('2026-11-01'), day('2026-11-01')],
    ],
    Achievements: [
      ['profile_id', 'achievement_id', 'earned_at'],
      ['p_sam', 'first-game', day('2026-11-01')],
    ],
    Skins: [
      ['skin_id', 'name', 'stars_needed', 'active'],
      ['sticker', 'Sticker book', 0, true],
      ['fairy', 'Fairy', 10, true],
      ['blocks', 'Blocks', 20, true],
      ['unicorn', 'Unicorn', 30, true],
    ],
    GameLists: [
      ['list_id', 'profile_id', 'game_id', 'position', 'title', 'words', 'updated_at'],
      ['l_sam2', 'p_sam', 'kriss-kross', 2, 'Animals', 'cat, dog, hen', day('2026-11-02')],
      ['l_sam1', 'p_sam', 'kriss-kross', 1, 'Week 1', 'sun, moon, star', day('2026-11-02')],
      ['l_samw', 'p_sam', 'wrapper-check', 1, 'Other game', 'red, blue', day('2026-11-02')],
      ['l_alex1', 'p_alex', 'kriss-kross', 1, 'Colours', 'red, green, blue', day('2026-11-03')],
    ],
  };
}

function open({ tabs = sheet030(), script = SCRIPT } = {}) {
  const google = services({ spreadsheet: new Spreadsheet('Family games', tabs), familyCode: CODE });
  const context = vm.createContext({ ...google.globals, console });
  vm.runInContext(fs.readFileSync(script, 'utf8'), context, { filename: path.basename(script) });

  const post = (action, data = {}) => {
    const out = context.doPost({ postData: { contents: JSON.stringify({ ...data, action, code: CODE }) } });
    if (out.mime !== 'JSON') throw new Error('reply was not marked JSON');
    return JSON.parse(out.getContent());
  };
  const run = (name) => context[name]();
  const version = vm.runInContext('VERSION', context);
  return { ...google, ss: google.spreadsheet, post, run, version };
}

module.exports = { open, sheet030, SCRIPT, REPO };
