"""Rocket Lander's level plan, draft (step 2c-2). Version 0.1.

Not a check of the game: it holds the draft plan proposed in step 2c-2 and works out every
number quoted in claude/level-plan.md, so none is typed by hand. It reads Rob's syllabus notes
(a JSON file, given by path; never kept in the repo while it carries the children's details,
D-010, D-011) and checks the plan against them:
  - every syllabus level is placed exactly once, on the track for its year;
  - each track keeps the notes' own order of levels (only levels added between them);
  - each system holds 7 levels and a challenge (8 a system, D-058).
Then it counts what each track holds, what each system needs from the engine, the pass rules
and the moon rocks, and with --md writes the tables for the plan.

The plan is Claude's proposal (step 2c-2), not agreed: two tracks on the same six systems, as
Rob floated on 10 Nov ("options will be 'reception' and 'year two'"). Which engine work a level
needs (FIT) is Claude's judgement from the game's code at 07b1dff (map.js 1.0, levels.js,
sums-levels.js, sums.js 1.1, rules.js).

Usage, from the repo root:
    python3 -B tools/tests/games/plan_rocket_levels.py SYLLABUS.json [--md OUT.md]
Exit 0 if the plan passes its checks, 1 if not.
"""
import argparse
import json
import math
import sys

SYSTEMS = ['Moon', 'Red Dust', 'Candy', 'Ice', 'Jungle', 'Ringed']  # planets.js order
LEVELS_A_SYSTEM = 8          # D-058
LANDINGS = 8                 # settings.js: landings_per_round 8
SHIPS_ALL = 850              # D-077: all twelve ships to buy
STARS_2, STARS_3 = 60, 85    # numbers.js starsFor: % right for 2 and 3 stars

# Levels the plan adds between the notes' levels: id -> (title, source)
EXTRA = {
    'X-dice6': ('Dice line to 6', 'D-060, D-067: dice faces on the line, a written number at the top'),
    'X-odd-faint': ('Odd numbers faint', 'D-038 level 5 (G1)'),
    'X-mix10': ('Plus and take away within 10', 'D-039 level 3; ELG number bonds'),
    'X-parity-faint': ('Odd or even, colours faint', 'D-038 level 4'),
    'X-dice12': ('Dice line to 12 (two dice)', 'D-060: 7 to 12 as a 6 and the rest'),
    'X-every-other': ('Every other number written', 'D-038 level 6 (G2)'),
    'X-add20-cross': ('Adding to 20, crossing 10', 'Y1-08 split in two: crossing 10 or not (Claude)'),
    'X-sub20-cross': ('Taking away within 20, crossing 10', 'Y1-09 split in two (Claude)'),
    'X-0-5-10': ('Only 0, 5 and 10 written', 'D-038 level 7 (G3)'),
    'X-doubles20': ('Doubles and halves to 20', "notes: year1 'other'"),
    'X-0-10': ('Only 0 and 10 written', 'D-038 level 8 (T2)'),
    'X-words100': ('Number words to 100', 'notes: year2 number_words 1 to 100'),
    'X-div348': ('Dividing by 3, 4 and 8', 'notes: year3 division times_tables'),
    'X-TOdivO': ('2-digit divided by 1-digit', "notes: year3 division 'extended', e.g. 48 ÷ 4"),
}

# The plan: two tracks, each six systems of 7 levels; a challenge ends each system.
# Year 1's two splits: the notes' level is the first half (not crossing 10), the extra the second.
PLAN = {
    'reception': {
        'label': 'Lower track: Reception, then Year 1',
        'years': ['reception', 'year1'],
        'systems': [
            ['R01', 'R02', 'R03', 'X-dice6', 'R04', 'R05', 'R06'],
            ['R07', 'R08', 'R09', 'R10', 'R11', 'X-odd-faint', 'R12'],
            ['R13', 'R14', 'X-mix10', 'R15', 'X-parity-faint', 'R16', 'X-dice12'],
            ['Y1-01', 'Y1-02', 'Y1-03', 'Y1-04', 'Y1-05', 'Y1-06', 'X-every-other'],
            ['Y1-07', 'Y1-08', 'X-add20-cross', 'Y1-09', 'X-sub20-cross', 'Y1-10', 'Y1-11'],
            ['Y1-12', 'Y1-13', 'X-0-5-10', 'Y1-14', 'Y1-15', 'X-doubles20', 'X-0-10'],
        ],
    },
    'year2': {
        'label': 'Higher track: Year 2, then Year 3',
        'years': ['year2', 'year3'],
        'systems': [
            ['Y2-01', 'X-words100', 'Y2-02', 'Y2-03', 'Y2-04', 'Y2-05', 'Y2-06'],
            ['Y2-07', 'Y2-08', 'Y2-09', 'Y2-10', 'Y2-11', 'Y2-12', 'Y2-13'],
            ['Y2-14', 'Y2-15', 'Y2-16', 'Y2-17', 'Y2-18', 'Y2-19', 'Y2-20'],
            ['Y3-01', 'Y3-02', 'Y3-03', 'Y3-04', 'Y3-05', 'Y3-06', 'Y3-07'],
            ['Y3-08', 'Y3-09', 'Y3-10', 'Y3-11', 'Y3-12', 'Y3-13', 'X-div348'],
            ['Y3-14', 'Y3-15', 'X-TOdivO', 'Y3-16', 'Y3-17', 'Y3-18', 'Y3-19'],
        ],
    },
}

# What each level needs that the game can't do today (Claude's judgement, from the code at
# 07b1dff). 'now': the engine asks it already, with new numbers in a level table at most.
WORK = {
    'now': 'Plays today: new numbers in a level table at most',
    'face': 'A new target face at the top (dots, quick look, words, blocks, pictures, a sequence, a phrase, a missing number)',
    'window': 'Number levels on a moving stretch of the line (numbers past 13 marks: to 100, to 1000)',
    'range': 'A rule where any number that fits is right ("more than 4", "47 < ?"), like even or odd',
    'dice': 'Dice lines (D-060, D-067: agreed, not built)',
    'forms': 'Sums of set forms past 10 (14 + 3, 34 + 28, 245 + 30, 23 × 4), crossing 10 or not',
    'tables': 'Times and divide by chosen tables (2, 5, 10; 3, 4, 8), up to × 12',
    'timed': 'A level that sets the fall time (fast facts)',
    'fraction': 'Fraction lines: marks in halves, thirds, quarters, sevenths, tenths',
    'estimate': 'A line in tens or hundreds to land an estimate on',
    'challenge': "A challenge round mixing its system's levels, numbers and sums together",
}
FIT = {
    'R01': ['now'], 'R02': ['now'], 'R03': ['face'], 'R04': ['face'], 'R05': ['range', 'face'],
    'R06': ['face'], 'R07': ['now'], 'R08': ['face'], 'R09': ['face'], 'R10': ['face'],
    'R11': ['face'], 'R12': ['face'], 'R13': ['now'], 'R14': ['now'], 'R15': ['now'], 'R16': ['face'],
    'Y1-01': ['window'], 'Y1-02': ['window'], 'Y1-03': ['face', 'window'], 'Y1-04': ['face', 'window'],
    'Y1-05': ['face'], 'Y1-06': ['face', 'window'], 'Y1-07': ['face'], 'Y1-08': ['forms'],
    'Y1-09': ['forms'], 'Y1-10': ['face', 'forms'], 'Y1-11': ['face', 'forms'], 'Y1-12': ['face'],
    'Y1-13': ['face'], 'Y1-14': ['fraction', 'face'], 'Y1-15': ['face'],
    'Y2-01': ['face', 'window'], 'Y2-02': ['range', 'window'], 'Y2-03': ['face', 'window'],
    'Y2-04': ['face', 'window'], 'Y2-05': ['forms', 'timed'], 'Y2-06': ['face', 'forms'],
    'Y2-07': ['forms'], 'Y2-08': ['forms'], 'Y2-09': ['forms'], 'Y2-10': ['forms'], 'Y2-11': ['forms'],
    'Y2-12': ['forms'], 'Y2-13': ['face', 'forms'], 'Y2-14': ['tables'], 'Y2-15': ['tables'],
    'Y2-16': ['tables'], 'Y2-17': ['tables'], 'Y2-18': ['window'], 'Y2-19': ['fraction', 'face'],
    'Y2-20': ['face'],
    'Y3-01': ['window'], 'Y3-02': ['face', 'window'], 'Y3-03': ['range', 'window'],
    'Y3-04': ['face', 'window'], 'Y3-05': ['face', 'window'], 'Y3-06': ['forms'], 'Y3-07': ['forms'],
    'Y3-08': ['face', 'forms'], 'Y3-09': ['forms'], 'Y3-10': ['estimate'], 'Y3-11': ['tables'],
    'Y3-12': ['tables'], 'Y3-13': ['tables'], 'Y3-14': ['tables', 'timed'], 'Y3-15': ['forms'],
    'Y3-16': ['face'], 'Y3-17': ['fraction', 'face'], 'Y3-18': ['fraction', 'range'],
    'Y3-19': ['fraction', 'forms'],
    'X-dice6': ['dice'], 'X-odd-faint': ['now'], 'X-mix10': ['now'], 'X-parity-faint': ['now'],
    'X-dice12': ['dice'], 'X-every-other': ['now'], 'X-add20-cross': ['forms'],
    'X-sub20-cross': ['forms'], 'X-0-5-10': ['now'], 'X-doubles20': ['face'], 'X-0-10': ['now'],
    'X-words100': ['face', 'window'], 'X-div348': ['tables'], 'X-TOdivO': ['forms'],
}
# Types the rocket can't ask as the notes put them, so the plan changes the question.
ADAPTED = {
    'compare_quantities': 'Land on a number with more (or fewer, or the same) than the dots shown',
    'compare_numbers': 'The sign is the question: "47 < ?" means land on any number bigger than 47',
    'fraction_of_shape': 'A shaded shape at the top; land on its fraction on a line of fractions',
    'compare_fractions': 'Both fractions marked on a line from 0 to 1; land on the bigger',
    'odd_even': 'Land on an even (or odd) number, as Number mode does today, rather than say which it is',
}


def load(path):
    with open(path, encoding='utf-8') as fh:
        return json.load(fh)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('syllabus')
    ap.add_argument('--md')
    a = ap.parse_args()
    syl = load(a.syllabus)
    levels = {lv['id']: lv for lv in syl['levels']}
    order = [lv['id'] for lv in syl['levels']]
    errs, out = [], []

    # checks
    placed = [i for t in PLAN.values() for s in t['systems'] for i in s]
    for i in order:
        n = placed.count(i)
        if n != 1:
            errs.append(f'{i} placed {n} times')
    for i in placed:
        if i not in levels and i not in EXTRA:
            errs.append(f'{i} is neither in the notes nor an extra')
        if i not in FIT:
            errs.append(f'{i} has no FIT entry')
    for key, t in PLAN.items():
        if len(t['systems']) != len(SYSTEMS):
            errs.append(f'{key}: {len(t["systems"])} systems, not {len(SYSTEMS)}')
        for k, s in enumerate(t['systems']):
            if len(s) != LEVELS_A_SYSTEM - 1:
                errs.append(f'{key} {SYSTEMS[k]}: {len(s)} levels, not {LEVELS_A_SYSTEM - 1} and a challenge')
        mine = [i for s in t['systems'] for i in s if i in levels]
        for i in mine:
            if levels[i]['stage'] not in t['years']:
                errs.append(f'{i} ({levels[i]["stage"]}) is on the {key} track')
        want = [i for i in order if levels[i]['stage'] in t['years']]
        if mine != want:
            errs.append(f'{key}: the notes\' order is not kept')
        # each year fills whole systems: the first year systems 1 to 3, the second 4 to 6
        for k, s in enumerate(t['systems']):
            year = t['years'][0 if k < 3 else 1]
            for i in s:
                if i in levels and levels[i]['stage'] != year:
                    errs.append(f'{i} sits in {SYSTEMS[k]}, which is {year}\'s')

    # counts
    by_stage = {}
    for lv in syl['levels']:
        by_stage[lv['stage']] = by_stage.get(lv['stage'], 0) + 1
    types = sorted({lv['type'] for lv in syl['levels']})
    slots = len(SYSTEMS) * LEVELS_A_SYSTEM
    out.append(f'notes: {len(order)} levels: ' + ', '.join(f'{k} {v}' for k, v in by_stage.items()))
    out.append(f'notes: {len(types)} question types')
    out.append(f'today\'s map: {len(SYSTEMS)} systems x {LEVELS_A_SYSTEM} = {slots} places; stand-in levels 8 + 8 = 16')
    for key, t in PLAN.items():
        mine = [i for s in t['systems'] for i in s]
        notes_n = sum(1 for i in mine if i in levels)
        extra_n = sum(1 for i in mine if i in EXTRA)
        out.append(f'{key}: {notes_n} from the notes + {extra_n} added + {len(SYSTEMS)} challenges = '
                   f'{notes_n + extra_n + len(SYSTEMS)} levels')
    total = sum(len(s) + 1 for t in PLAN.values() for s in t['systems'])
    out.append(f'both tracks: {total} levels; one route of all four years at 8 a system would need '
               f'{math.ceil((len(order) + len(EXTRA)) / (LEVELS_A_SYSTEM - 1))} systems')
    fits = {}
    for i in placed:
        for w in FIT[i]:
            fits[w] = fits.get(w, 0) + 1
    out.append('levels needing each kind of work: ' + ', '.join(f'{w} {fits.get(w, 0)}' for w in WORK if w != 'challenge')
               + f', challenge {len(SYSTEMS) * 2}')
    now_only = sum(1 for i in placed if FIT[i] == ['now'])
    out.append(f'levels that play today: {now_only} of {len(placed)} (not counting challenges)')
    adapted = sorted(i for i in order if levels[i]['type'] in ADAPTED)
    out.append(f'question types that fit the rocket as they are: {len(types) - len(ADAPTED)} of {len(types)}; changed: {len(ADAPTED)}')
    out.append(f'levels whose question changes to fit the rocket: {len(adapted)} ({", ".join(adapted)})')
    for p in (STARS_2, STARS_3):
        need = math.ceil(p * LANDINGS / 100)
        out.append(f'{p}% of {LANDINGS} landings: {need} right ({need * 100 / LANDINGS:.1f}%)')
    rule = syl['meta'].get('suggested_unlock_rule', {})
    if rule:
        q, m, r = rule['questions_per_round'], rule['pass_mark'], rule['rounds_to_pass']
        out.append(f'notes\' rule: {m} of {q} ({m * 100 / q:.0f}%), {r} rounds; on {LANDINGS} landings '
                   f'that is {math.ceil(m * LANDINGS / q)} right ({math.ceil(m * LANDINGS / q) * 100 / LANDINGS:.1f}%)')
    rocks = slots * LANDINGS
    out.append(f'moon rocks a track can pay: {slots} x {LANDINGS} = {rocks}; all ships {SHIPS_ALL} '
               f'({SHIPS_ALL / rocks:.2f} times as many)')
    print('\n'.join(out))

    if a.md:
        md = []
        for key, t in PLAN.items():
            md.append(f'### {t["label"]}\n')
            md.append('| System | # | Level | From | Work needed |')
            md.append('|---|---|---|---|---|')
            for k, s in enumerate(t['systems']):
                for n, i in enumerate(s, 1):
                    if i in levels:
                        title, src = levels[i]['title'], i
                    else:
                        title, src = EXTRA[i][0], f'added: {EXTRA[i][1]}'
                    md.append(f'| {SYSTEMS[k] if n == 1 else ""} | {n} | {title} | {src} | {", ".join(FIT[i])} |')
                md.append(f'| | 8 | {SYSTEMS[k]} challenge | added: a mix of 1 to 7 | challenge |')
            md.append('')
        md.append('### Work needed, by system\n')
        md.append('| Track | ' + ' | '.join(SYSTEMS) + ' |')
        md.append('|---|' + '---|' * len(SYSTEMS))
        for key, t in PLAN.items():
            cells = []
            for s in t['systems']:
                ws = sorted({w for i in s for w in FIT[i] if w != 'now'}, key=list(WORK).index)
                cells.append(', '.join(ws + ['challenge']))
            md.append(f'| {key} | ' + ' | '.join(cells) + ' |')
        md.append('')
        with open(a.md, 'w', encoding='utf-8') as fh:
            fh.write('\n'.join(md))

    if errs:
        print('FAIL\n  ' + '\n  '.join(errs))
        return 1
    print('plan checks pass')
    return 0


if __name__ == '__main__':
    sys.exit(main())
