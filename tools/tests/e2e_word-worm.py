"""Browser test for Word Worm, against the stand-in Sheet (no real Sheet is touched).
Needs Python Playwright. From the repo root: python3 -m http.server 8131 --bind 127.0.0.1
then: python3 tools/tests/e2e_word-worm.py <folder for screenshots> [port]

Plays full rounds on a phone (390x844) and a PC (1280x800), checks the result and the
progress reached the stand-in, checks steering by finger, mouse and keys, then tries the
settings variations (show_word peek and listen, letters mode in capitals, counting in fives).
"""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from standin import make_db, new_page, set_setting
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
PORT = sys.argv[2] if len(sys.argv) > 2 else '8131'
BASE = f'http://127.0.0.1:{PORT}/'
GAME = 'games/word-worm/index.html'
TEST_WEEK = ['ship', 'shop', 'shell', 'fish', 'wish', 'crash']
os.makedirs(OUT, exist_ok=True)

errors = []
problems = []


def check(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg)
    if not cond:
        problems.append(msg)


def shot(pg, name):
    pg.screenshot(path=os.path.join(OUT, name + '.png'))


def state(pg):
    return pg.evaluate('window.__test.state()')


def open_game(br, db, w, h, mobile, player='p_sam'):
    pg = new_page(br, db, w, h, mobile=mobile, errors=errors)
    pg.goto(BASE + GAME + f'?player={player}')
    pg.wait_for_function('window.__test && document.fonts')
    pg.wait_for_timeout(900)
    return pg


def start(pg):
    pg.click('#play', force=True)   # the Play button gently breathes, so it is never "stable"
    pg.wait_for_function("window.__test.state().phase === 'play' && window.__test.state().tokens.length > 0")
    pg.wait_for_timeout(500)


def play_round(pg, mistakes=0, shots=None, limit=120):
    """Eats the right letters (after `mistakes` wrong ones) until the end card shows."""
    shots = shots or {}
    made, end = 0, time.time() + limit
    taken = set()
    while time.time() < end:
        st = state(pg)
        if st['phase'] == 'end':
            break
        if not st['busy']:
            if made < mistakes and pg.evaluate('window.__test.bad()'):
                made += 1
                if 'hic' in shots and 'hic' not in taken:
                    pg.wait_for_timeout(160)
                    shot(pg, shots['hic'])
                    taken.add('hic')
            elif made >= mistakes:
                pg.evaluate('window.__test.good()')
        if 'done' in shots and 'done' not in taken and st['busy'] and st['idx'] == 0:
            pg.wait_for_timeout(250)
            shot(pg, shots['done'])
            taken.add('done')
        pg.wait_for_timeout(260)
    pg.wait_for_selector('#end:not([hidden])', timeout=8000)
    pg.wait_for_timeout(1400)
    return made


def wait_synced(pg, db, game_id, n):
    for _ in range(40):
        rows = [s for s in db['scores'] if s['game_id'] == game_id]
        if len(rows) >= n and ('p_sam', game_id) in db['progress']:
            return rows
        pg.wait_for_timeout(250)
    return [s for s in db['scores'] if s['game_id'] == game_id]


with sync_playwright() as pw:
    br = pw.chromium.launch()
    db = make_db()

    # ---------- Phone: a full round of spelling, two wrong bites ----------
    ph = open_game(br, db, 390, 844, True)
    shot(ph, 'phone_start')
    st = state(ph)
    wl = st['settings']['word_list']
    check(wl['title'] == 'Test week' and wl['items'] == TEST_WEEK, f"p_sam's word list is Test week: {wl['items']}")
    check(st['settings']['mode'] == 'spell' and st['settings']['show_word'] == 'always', 'defaults: spell, always')
    start(ph)
    st = state(ph)
    check(st['listTitle'] == 'Test week', 'the round uses the Test week list')
    check(len(st['items']) == 5 and len(set(st['items'])) == 5 and all(w in TEST_WEEK for w in st['items']),
          f"5 different words from the list: {st['items']}")
    check(len(st['tokens']) == 4 and sum(t['need'] for t in st['tokens']) == 1, '1 needed letter + 3 decoys in the garden')
    check(all(t['r'] * 2 >= 56 for t in st['tokens']), f"letter tokens at least 56px across ({st['tokens'][0]['r'] * 2:.0f}px)")
    check(all(t['y'] - t['r'] >= st['hudBottom'] - 1 for t in st['tokens']), 'letters spawn below the word bar')
    check(st['slots'][0]['next'] and all(s['ghost'] for s in st['slots']), 'always: whole word shown, first slot pulsing')
    ph.wait_for_timeout(400)
    check(st['said'][:1] == [st['items'][0]] or state(ph)['said'][:1] == [st['items'][0]], 'the word is said at the start')
    shot(ph, 'phone_play')

    # Steering with a held finger: the head turns towards it.
    head = ph.evaluate('window.__test.head()')
    tx, ty = (60, 780) if head['y'] < 500 else (330, 300)
    ph.evaluate(f"""(() => {{
      const c = document.getElementById('garden');
      const o = {{ pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: {tx}, clientY: {ty}, bubbles: true }};
      c.dispatchEvent(new PointerEvent('pointerdown', o));
    }})()""")
    ph.wait_for_timeout(1200)
    h2 = ph.evaluate('window.__test.head()')
    ph.evaluate("document.getElementById('garden').dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', bubbles: true }))")
    import math
    want = math.atan2(ty - h2['y'], tx - h2['x'])
    diff = abs(math.atan2(math.sin(want - h2['angle']), math.cos(want - h2['angle'])))
    check(diff < 0.6, f'finger steering: heading within {diff:.2f} rad of the finger')

    made = play_round(ph, mistakes=2, shots={'hic': 'phone_hiccup', 'done': 'phone_word_done'})
    st = state(ph)
    letters = sum(len(w) for w in st['items'])
    # The worm can also wander into a decoy by itself between moves: that is a real mistake too.
    check(st['mistakes'] >= 2 and st['correct'] == letters, f"{st['mistakes']} mistakes (2 made on purpose), {letters} correct bites")
    check(st['len'] == 5 + letters, f"worm grew one segment per bite: {st['len']}")
    check(ph.locator('#end-stars svg').count() == 3, 'end card shows three star shapes')
    want = 3 if st['mistakes'] <= 1 else 2 if st['mistakes'] <= 4 else 1
    check(ph.get_attribute('#end-stars', 'aria-label') == f'{want} of 3 stars', f"{st['mistakes']} mistakes = {want} stars")
    check(ph.locator('#chips li').count() == 5, 'the words practised show as chips')
    check(f"{st['len']}" == ph.text_content('#grew-n'), 'Your worm grew to N')
    said = st['said']
    check(all(w in said for w in st['items']), 'each word was said out loud')
    shot(ph, 'phone_end')
    rows = wait_synced(ph, db, 'word-worm', 1)
    check(len(rows) == 1 and rows[0]['stars'] == want and rows[0]['score'] == letters and rows[0]['level'] == 1,
          f"result reached the Sheet: {rows[:1]}")
    prog = db['progress'].get(('p_sam', 'word-worm'), {}).get('data', {})
    check(prog.get('words_eaten') == 5 and prog.get('longest') == st['len'] and prog.get('hats') == [] and prog.get('hat') is None,
          f'progress reached the Sheet: {prog}')
    ph.context.close()

    # ---------- PC: steering by mouse and keys, a full round, a hat unlocked ----------
    pc = open_game(br, db, 1280, 800, False)
    st = state(pc)
    check(st['progress']['words_eaten'] == 5, "PC picks up the phone's progress from the Sheet")
    pc.wait_for_timeout(300)
    shot(pc, 'pc_start')
    start(pc)
    pc.mouse.move(640, 400)
    for x, y in ((200, 650), (210, 655), (220, 650)):
        pc.mouse.move(x, y)
        pc.wait_for_timeout(400)
    h = pc.evaluate('window.__test.head()')
    want = math.atan2(650 - h['y'], 220 - h['x'])
    diff = abs(math.atan2(math.sin(want - h['angle']), math.cos(want - h['angle'])))
    check(diff < 0.6 or math.hypot(220 - h['x'], 650 - h['y']) < 60, f'mouse steering: heading within {diff:.2f} rad of the pointer')
    pc.mouse.move(1279, 799)
    pc.mouse.move(1290, 810)
    pc.keyboard.down('ArrowUp')
    pc.wait_for_timeout(1300)
    pc.keyboard.up('ArrowUp')
    h = pc.evaluate('window.__test.head()')
    check(abs(math.atan2(math.sin(h['angle'] + math.pi / 2), math.cos(h['angle'] + math.pi / 2))) < 0.5 or h['y'] < 200,
          f"arrow key steering: heading up ({h['angle']:.2f})")
    pc.keyboard.down('d')
    pc.wait_for_timeout(1300)
    pc.keyboard.up('d')
    h = pc.evaluate('window.__test.head()')
    check(abs(h['angle'] % (2 * math.pi)) < 0.5 or abs(h['angle'] % (2 * math.pi) - 2 * math.pi) < 0.5 or h['x'] > 1150,
          f"WASD steering: heading right ({h['angle']:.2f})")
    shot(pc, 'pc_play')
    play_round(pc, mistakes=0)
    st = state(pc)
    check(st['mistakes'] > 1 or pc.get_attribute('#end-stars', 'aria-label') == '3 of 3 stars', f"{st['mistakes']} mistakes = 3 stars")
    check(pc.is_visible('#unlock'), 'the party hat unlock shows at 10 words')
    check(st['progress']['hats'] == ['party'] and st['progress']['hat'] == 'party', f"party hat unlocked and worn: {st['progress']}")
    shot(pc, 'pc_end_unlock')
    rows = wait_synced(pc, db, 'word-worm', 2)
    check(len(rows) == 2 and rows[1]['stars'] == (3 if st['mistakes'] <= 1 else 2), 'second result reached the Sheet with its stars')
    pc.wait_for_timeout(500)
    prog = db['progress'][('p_sam', 'word-worm')]['data']
    check(prog['words_eaten'] == 10 and prog['hats'] == ['party'], f'progress on the Sheet: {prog}')
    # Wardrobe: back to the start card via Play again's round, check the hat buttons.
    pc.reload()
    pc.wait_for_function('window.__test')
    pc.wait_for_timeout(900)
    check(pc.locator('.hat-btn').count() == 5 and pc.locator('.hat-btn.locked').count() == 3, 'wardrobe: no hat, party hat, 3 locked')
    check(pc.locator('.hat-btn[aria-pressed="true"]').get_attribute('aria-label') == 'Party hat', 'the party hat is chosen')
    shot(pc, 'pc_start_hat')
    pc.locator('.hat-btn').nth(0).click()
    pc.wait_for_timeout(1300)
    check(db['progress'][('p_sam', 'word-worm')]['data']['hat'] is None, 'taking the hat off is saved')
    pc.locator('.hat-btn').nth(1).click()
    pc.wait_for_timeout(1300)
    pc.context.close()

    # ---------- Settings variations ----------
    def variation(name, w, h, mobile, rows, then):
        for setting, value in rows:
            set_setting(db, 'word-worm', setting, value)
        pg = open_game(br, db, w, h, mobile)
        start(pg)
        then(pg)
        pg.context.close()
        for setting, _ in rows:
            set_setting(db, 'word-worm', setting, '')

    def peek(pg):
        st = state(pg)
        check(st['view'] == 'peek' and all(s['ghost'] for s in st['slots']) and pg.is_visible('#look'), 'peek: word shown at the start, with "Look!"')
        shot(pg, 'peek_look')
        pg.wait_for_timeout(3300)
        pg.evaluate('window.__test.good()')
        pg.wait_for_timeout(900)
        st = state(pg)
        check(not any(s['ghost'] for s in st['slots']) and not pg.is_visible('#look'), 'peek: then blank apart from letters eaten')
        check(st['slots'][0]['got'] != '', 'peek: the eaten letter stays in its slot')
        shot(pg, 'peek_hidden')
        pg.click('#eye')
        pg.wait_for_timeout(300)
        check(all(s['ghost'] for s in state(pg)['slots']), 'peek: the eye button shows it again')
        pg.wait_for_timeout(2200)
        check(not any(s['ghost'] for s in state(pg)['slots']), '...for about 2 seconds')
    variation('peek', 390, 844, True, [('show_word', 'peek')], peek)

    def listen(pg):
        st = state(pg)
        check(st['view'] == 'listen' and not any(s['ghost'] for s in st['slots']), 'listen: slots blank')
        check(pg.is_visible('#say') and not pg.is_visible('#eye'), 'listen: speaker button, no eye')
        n = len(st['said'])
        pg.click('#say')
        pg.wait_for_timeout(200)
        check(len(state(pg)['said']) == n + 1 and state(pg)['said'][-1] == st['items'][0], 'listen: the speaker says the word again')
        pg.evaluate('window.__test.good()')
        pg.wait_for_timeout(700)
        shot(pg, 'listen')
    variation('listen', 390, 844, True, [('show_word', 'listen')], listen)

    def letters(pg):
        st = state(pg)
        check(st['mode'] == 'letters' and len(st['items']) == 5, f"letters mode: 5 letters {st['items']}")
        check(all(i in list('ABCDEST') for i in st['items']), 'letters come from the letters setting, in capitals')
        check(all(t['text'] == t['text'].upper() for t in st['tokens']), 'decoys in capitals too')
        check(pg.text_content('#bar-pre') == 'Find', 'prompt says "Find"')
        check(st['said'][-1].startswith('Find the letter'), f"said: {st['said'][-1:]}")
        shot(pg, 'letters_upper')
        play_round(pg, mistakes=0)
        shot(pg, 'letters_end')
    variation('letters', 844, 390, True, [('mode', 'letters'), ('letter_case', 'upper')], letters)

    def count(pg):
        st = state(pg)
        seqs = [list(map(int, s.split(','))) for s in st['items']]
        check(seqs[0] == [0, 5, 10, 15, 20, 25], f'count: first sequence from 0 in fives: {seqs[0]}')
        check(all(len(s) == 6 and s[0] % 5 == 0 and 0 <= s[0] <= 50 and all(b - a == 5 for a, b in zip(s, s[1:])) for s in seqs),
              f'count: later sequences start 0 to 10 steps on: {[s[0] for s in seqs]}')
        decoys = [int(t['text']) for t in st['tokens'] if not t['need']]
        check(len(decoys) == 3 and not any(d in seqs[0] for d in decoys), f'count: decoys are nearby numbers not in the sequence: {decoys}')
        check(pg.text_content('#bar-pre') == '+5', 'count: the bar shows +5')
        pg.evaluate('window.__test.good()')
        pg.wait_for_timeout(450)
        pg.evaluate('window.__test.good()')
        pg.wait_for_timeout(700)
        shot(pg, 'count_fives')
        play_round(pg, mistakes=5)
        check(pg.get_attribute('#end-stars', 'aria-label') == '1 of 3 stars', '5 mistakes = 1 star')
        shot(pg, 'count_end')
    variation('count', 1280, 800, False, [('mode', 'count'), ('count_step', '5'), ('count_from', '0')], count)

    br.close()

relevant = [e for e in errors if 'speechSynthesis' not in e]
check(not relevant, f'no console errors: {relevant}')
print('\nscores in the stand-in:', [(s['game_id'], s['score'], s['stars']) for s in db['scores']])
print('progress in the stand-in:', db['progress'].get(('p_sam', 'word-worm')))
print(f'\n{len(problems)} problem(s)' if problems else '\nAll checks passed')
sys.exit(1 if problems else 0)
