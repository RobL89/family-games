"""The rocket games' ships table and buying rules (games/_common/rocket/fleet.js). Version 1.1.

Changes at v1.1 (step 2a-4c, D-047, D-051): all eight ships fly, so Crystal Comet (100), Golden
Phoenix (140) and Aurora Cruiser (200) are on sale, bought once and only with enough rocks; the
'soon' rule is still checked, with a made-up ship added to the table for the test and removed.

Step 2a-4b (D-046, D-049, D-051, D-053). Fast checks, no browser. Node runs fleet.js and the
results are compared with values written out by hand from the decisions:
  - the table: eight ships in order, names, tiers and prices as D-046 (20 to 200 moon rocks,
    610 in all), touchdown sounds as on the accepted mock-up page (D-049) and made by sound.js, and all eight flying
    from step 2a-4c (D-051);
  - hangarOf: what a progress entry owns and flies, whatever it holds (a version 1 entry has
    neither, so Classic; unknown, repeated or not-yet-flying ships are dropped or refused);
  - verdict: what the showroom's big button offers for each ship (fly, flying, buy, need, soon);
  - buy and pick: rocks taken once, at the price, only when there are enough; nothing bought
    twice or flown before it's owned; the progress handed in is never changed.
Then fleet.js must be pure: no imports, page, network, clock, randomness or eval.

Stand-in: Node 22 runs the ES module in place of the browser.
Usage, from the repo root: python3 -B tools/tests/games/test_rocket_fleet_core.py
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
FLEET = os.path.join(REPO, 'games', '_common', 'rocket', 'fleet.js')
fails = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


if not os.path.exists(FLEET):
    check(False, 'games/_common/rocket/fleet.js exists')
    print(f'\n{len(fails)} problem(s)')
    sys.exit(1)

JS = r"""
const F = await import(process.argv[1]);
const SND = await import(process.argv[2]);
const P = (o) => ({ unlocked: 2, planet: 'moon', rocks: 0, landings: 0, ...o });
const frozen = (o) => JSON.stringify(o);
const ids = F.FLEET.map((s) => s.id);
const cases = {};
const v1 = P({ rocks: 37 });
cases.v1 = F.hangarOf(v1);
cases.odd = F.hangarOf(P({ ship: 'teapot', ships: ['teapot', 'teapot', 'rocket9', 7, null, 'box'] }));
cases.notOwned = F.hangarOf(P({ ship: 'saucer', ships: ['box'] }));
cases.premiumOwned = F.hangarOf(P({ ship: 'aurora', ships: ['aurora', 'pod', 'phoenix', 'crystal'] }));
cases.notList = F.hangarOf(P({ ship: 'box', ships: 'box' }));
cases.nothing = F.hangarOf(null);
const at = (rocks, ships = ['classic'], ship = 'classic') => P({ rocks, ships, ship });
cases.verdicts = {
  classic: F.verdict(at(0), 'classic'),
  boxShort: F.verdict(at(19), 'box'),
  boxExact: F.verdict(at(20), 'box'),
  boxOwned: F.verdict(at(0, ['classic', 'box']), 'box'),
  boxFlying: F.verdict(at(0, ['classic', 'box'], 'box'), 'box'),
  saucerRich: F.verdict(at(500), 'saucer'),
  crystalRich: F.verdict(at(500), 'crystal'),
  phoenixRich: F.verdict(at(500), 'phoenix'),
  auroraRich: F.verdict(at(500), 'aurora'),
  crystalShort: F.verdict(at(99), 'crystal'),
  phoenixShort: F.verdict(at(139), 'phoenix'),
  auroraShort: F.verdict(at(199), 'aurora'),
  auroraExact: F.verdict(at(200), 'aurora'),
  auroraOwned: F.verdict(at(0, ['classic', 'aurora']), 'aurora'),
  unknown: F.verdict(at(500), 'rocket9'),
};
cases.short = [F.shortOf(at(19), 'box'), F.shortOf(at(20), 'box'), F.shortOf(at(7), 'pod'), F.shortOf(at(500), 'aurora'), F.shortOf(at(150), 'aurora'), F.shortOf(at(37), 'phoenix')];
const before = at(37);
const keep = frozen(before);
const b1 = F.buy(before, 'teapot');
cases.buy = { after: b1, inputKept: frozen(before) === keep };
cases.buyAgain = F.buy(b1, 'teapot');
cases.buyShort = F.buy(b1, 'pod');
cases.buyPremium = ['crystal', 'phoenix', 'aurora'].map((id) => { const p = F.buy(at(F.FLEET_BY_ID[id].price + 5), id); return { exact: F.buy(at(F.FLEET_BY_ID[id].price), id), plus5: p, again: p && F.buy({ ...p, rocks: 500 }, id), short: F.buy(at(F.FLEET_BY_ID[id].price - 1), id) }; });
cases.buyUnknown = F.buy(at(500), 'rocket9');
const pk = F.pick(b1, 'teapot');
cases.pick = { after: pk, inputKept: b1.ship === 'classic' };
cases.pickNotOwned = F.pick(b1, 'pod');
cases.pickPremium = ['crystal', 'phoenix', 'aurora'].map((id) => F.pick(P({ rocks: 0, ships: ['classic', id], ship: 'classic' }), id));
cases.pickPremiumNotOwned = F.pick(P({ rocks: 500, ships: ['classic'], ship: 'classic' }), 'aurora');
cases.pickBack = F.pick(pk, 'classic');
// every ship bought in turn with exactly enough: rocks left 0 each time
let p = at(0), left = [];
for (const s of F.FLEET.filter((s) => s.price > 0 && s.flies)) { p = F.buy({ ...p, rocks: s.price }, s.id); left.push(p && p.rocks); }
cases.chain = { left, owned: p && p.ships };
// the 'soon' rule, for a ship drawn but not yet flying: a made-up row added for the test, then removed
const fake = { id: 'test-soon', name: 'Test ship', tier: 'cool', price: 10, sound: 'thud', flies: false };
F.FLEET.push(fake); F.FLEET_BY_ID[fake.id] = fake;
cases.soon = { verdict: F.verdict(at(500), fake.id), short: F.shortOf(at(0), fake.id), buy: F.buy(at(500), fake.id),
  pick: F.pick(P({ rocks: 0, ships: ['classic', fake.id], ship: 'classic' }), fake.id), owned: F.hangarOf(P({ ship: fake.id, ships: [fake.id, 'box'] })) };
F.FLEET.pop(); delete F.FLEET_BY_ID[fake.id];
console.log(JSON.stringify({ fleet: F.FLEET, ids, starter: F.STARTER, byId: Object.keys(F.FLEET_BY_ID), sounds: SND.SOUND_NAMES, cases }));
"""
SOUND = os.path.join(REPO, 'games', '_common', 'rocket', 'sound.js')
r = subprocess.run(['node', '--input-type=module', '-e', JS, FLEET, SOUND], capture_output=True, text=True)
check(r.returncode == 0, 'Node runs fleet.js' + ('' if r.returncode == 0 else ': ' + r.stderr.strip()[-400:]))
if r.returncode:
    print(f'\n{len(fails)} problem(s)')
    sys.exit(1)
o = json.loads(r.stdout)
C = o['cases']

# ---------- The table (D-046, D-049, D-051) ----------
WANT = [  # id, name, tier, price, touchdown sound, flies (all eight from 2a-4c)
    ('classic', 'Classic', 'starter', 0, 'thud', True),
    ('box', 'Cardboard Box', 'fun', 20, 'boing', True),
    ('teapot', 'Teapot', 'fun', 30, 'toot', True),
    ('pod', 'Bubble Pod', 'cool', 50, 'clunkLock', True),
    ('saucer', 'Saucer', 'cool', 70, 'hum', True),
    ('crystal', 'Crystal Comet', 'premium', 100, 'chime', True),
    ('phoenix', 'Golden Phoenix', 'premium', 140, 'harp', True),
    ('aurora', 'Aurora Cruiser', 'legendary', 200, 'aurora', True),
]
got = [(s['id'], s['name'], s['tier'], s['price'], s['sound'], s['flies']) for s in o['fleet']]
check(got == WANT, f'the table: eight ships, names, tiers, prices, sounds and flying as decided: {got}')
check(sum(s['price'] for s in o['fleet']) == 610, 'the seven ships to buy cost 610 moon rocks in all (D-046)')
check(o['starter'] == 'classic' and o['byId'] == o['ids'], 'Classic is the starter, and every ship can be looked up by id')
check(all(set(s) == {'id', 'name', 'tier', 'price', 'sound', 'flies'} for s in o['fleet']), 'each row holds those six things and nothing else')
missing = [s['sound'] for s in o['fleet'] if s['sound'] not in o['sounds']]
check(not missing, 'every ship\'s touchdown sound is made by sound.js' + (f': missing {missing}' if missing else ''))

# ---------- hangarOf ----------
check(C['v1'] == {'ship': 'classic', 'ships': ['classic']}, f'a version 1 entry: Classic owned and flown: {C["v1"]}')
check(C['odd'] == {'ship': 'teapot', 'ships': ['classic', 'box', 'teapot']},
      f'unknown, repeated and odd entries dropped, Classic added, kept in table order: {C["odd"]}')
check(C['notOwned'] == {'ship': 'classic', 'ships': ['classic', 'box']}, f'a ship not owned is not flown: {C["notOwned"]}')
check(C['premiumOwned'] == {'ship': 'aurora', 'ships': ['classic', 'pod', 'crystal', 'phoenix', 'aurora']},
      f'the Premium and Legendary ships can be owned and flown (2a-4c): {C["premiumOwned"]}')
check(C['notList'] == {'ship': 'classic', 'ships': ['classic']}, f'ships that are not a list count as none: {C["notList"]}')
check(C['nothing'] == {'ship': 'classic', 'ships': ['classic']}, 'no progress at all: Classic')

# ---------- verdict ----------
V = C['verdicts']
WANTV = {'classic': 'flying', 'boxShort': 'need', 'boxExact': 'buy', 'boxOwned': 'fly', 'boxFlying': 'flying',
         'saucerRich': 'buy', 'crystalRich': 'buy', 'phoenixRich': 'buy', 'auroraRich': 'buy',
         'crystalShort': 'need', 'phoenixShort': 'need', 'auroraShort': 'need', 'auroraExact': 'buy', 'auroraOwned': 'fly', 'unknown': 'unknown'}
check(V == WANTV, f'the big button for each case: {V}')
check(C['short'] == [1, 0, 43, 0, 50, 103], f'rocks still needed: 20 - 19 = 1, none at the price, 50 - 7 = 43, none with 500, 200 - 150 = 50, 140 - 37 = 103: {C["short"]}')

# ---------- buy and pick ----------
b = C['buy']['after']
check(b and b['rocks'] == 7 and b['ships'] == ['classic', 'teapot'] and b['ship'] == 'classic' and b['unlocked'] == 2 and b['landings'] == 0,
      f'buying the Teapot with 37 rocks: 37 - 30 = 7 left, owned, not yet flown, the rest kept: {b}')
check(C['buy']['inputKept'], 'buying returns new progress and leaves the old untouched')
check(C['buyAgain'] is None and C['buyShort'] is None and C['buyUnknown'] is None,
      'no second Teapot, no Bubble Pod with 7 rocks, no unknown ship')
for (sid, price), bp in zip((('crystal', 100), ('phoenix', 140), ('aurora', 200)), C['buyPremium']):
    ok = (bp['exact'] and bp['exact']['rocks'] == 0 and bp['exact']['ships'] == ['classic', sid]
          and bp['plus5'] and bp['plus5']['rocks'] == 5 and bp['plus5']['ship'] == 'classic'
          and bp['again'] is None and bp['short'] is None)
    check(ok, f'{sid}: bought at {price} ({price} - {price} = 0, {price + 5} - {price} = 5 left), not flown until picked, '
              f'never twice, and not with {price - 1}: {bp}')
pk = C['pick']['after']
check(pk and pk['ship'] == 'teapot' and pk['rocks'] == 7 and pk['ships'] == ['classic', 'teapot'] and C['pick']['inputKept'],
      f'picking an owned ship flies it, costs nothing, and leaves the old progress untouched: {pk}')
check(C['pickNotOwned'] is None and C['pickPremiumNotOwned'] is None, 'a ship not owned cannot be picked, the Aurora Cruiser included')
check([x and x['ship'] for x in C['pickPremium']] == ['crystal', 'phoenix', 'aurora'], f'each Premium and Legendary ship, once owned, can be flown: {C["pickPremium"]}')
check(C['pickBack'] and C['pickBack']['ship'] == 'classic', 'Classic can always be picked again')
check(C['chain'] == {'left': [0, 0, 0, 0, 0, 0, 0], 'owned': ['classic', 'box', 'teapot', 'pod', 'saucer', 'crystal', 'phoenix', 'aurora']},
      f'all seven ships bought in turn, each with exactly its price, leaves 0 rocks each time and owns all eight: {C["chain"]}')
SN = C['soon']
check(SN['verdict'] == 'soon' and SN['short'] == 0 and SN['buy'] is None and SN['pick'] is None
      and SN['owned'] == {'ship': 'classic', 'ships': ['classic', 'box']},
      f'a ship drawn but not flying shows "soon": not for sale, not owned, not flown (D-051, a made-up row): {SN}')
check(o['byId'] == [w[0] for w in WANT] and [s['id'] for s in o['fleet']] == [w[0] for w in WANT], 'the made-up row was removed again before the table was read')

# ---------- Pure ----------
def code_only(text):
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    text = re.sub(r'(?m)//.*$', '', text)
    return re.sub(r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"|`(?:\\.|[^`\\])*`", "''", text)


IMPURE = re.compile(r'\b(import|document|window|globalThis|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|'
                    r'performance|Date|eval|Function|setTimeout|setInterval|requestAnimationFrame|navigator|location)\b|Math\.random')
hits = sorted({m.group(0) for m in IMPURE.finditer(code_only(open(FLEET, encoding='utf-8').read()))})
check(not hits, 'fleet.js is pure' + (f': {hits}' if hits else ''))

print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
