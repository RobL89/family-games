"""Tests for P-034 (Kids Games Development)'s checks: repo_check, doc_check and
pins_check. Version 1.0.

Each case builds a small throwaway git repo, plants one fault (or none) and
checks the right exit code. The private names used here are made up.
Usage: python3 -B tools/tests/games/test_checks.py   (exit 0 if all pass)
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
PY = [sys.executable, '-B']
MADE_UP = 'Zebedee,Ottoline'

GOOD_README = """# Games docs

**Version 1.0** · test

See [the list](../../games.json).

## Change log

| Version | Changes |
|---|---|
| 1.0 | First |
"""


def sh(repo, *args):
    subprocess.run(args, cwd=repo, check=True, capture_output=True)


def write(repo, path, text, mode='w'):
    full = os.path.join(repo, path)
    os.makedirs(os.path.dirname(full) or '.', exist_ok=True)
    with open(full, mode) as fh:
        fh.write(text)


def make_repo():
    repo = tempfile.mkdtemp(prefix='p034-check-')
    sh(repo, 'git', 'init', '-q', '-b', 'main')
    sh(repo, 'git', 'config', 'user.email', 'test@example.invalid')
    sh(repo, 'git', 'config', 'user.name', 'Test')
    write(repo, 'README.md', '# Top\n')
    write(repo, 'shared/x.js', '// launcher\n')
    write(repo, 'docs/games-pack/README.md', 'pack\n')
    frozen = '<html>her game</html>\n'
    write(repo, 'games/her-game/index.html', frozen)
    write(repo, 'games/a/index.html', '<html>a</html>\n')
    write(repo, 'games.json', json.dumps({'games': [
        {'id': 'a', 'title': 'A', 'folder': 'games/a/', 'status': 'ready'},
        {'id': 'her-game', 'title': 'Hers', 'folder': 'games/her-game/', 'status': 'ready'},
        {'id': 'later', 'title': 'Later', 'status': 'soon'}]}, indent=1))
    write(repo, 'docs/games/README.md', GOOD_README)
    sh(repo, 'git', 'add', '-A')
    sh(repo, 'git', 'commit', '-q', '-m', 'base')
    sh(repo, 'git', 'update-ref', 'refs/remotes/origin/main', 'HEAD')
    # P-020's branch with the contract
    sh(repo, 'git', 'checkout', '-q', '-b', 'work')
    write(repo, 'docs/game-contract.md', 'contract v0.3\n')
    sh(repo, 'git', 'add', '-A')
    sh(repo, 'git', 'commit', '-q', '-m', 'contract')
    sh(repo, 'git', 'update-ref', 'refs/remotes/origin/work', 'HEAD')
    blob = subprocess.run(['git', 'rev-parse', 'HEAD:docs/game-contract.md'], cwd=repo,
                          capture_output=True, text=True).stdout.strip()
    sh(repo, 'git', 'checkout', '-q', 'main')
    sh(repo, 'git', 'checkout', '-q', '-b', 'claude/games')
    pins = {'format': 1,
            'frozen': [{'path': 'games/her-game/index.html', 'sha256': hashlib.sha256(frozen.encode()).hexdigest()}],
            'drift': [{'name': 'contract', 'branch': 'work', 'path': 'docs/game-contract.md', 'object': blob, 'pinned_at': 'test'}]}
    write(repo, 'tools/tests/games/pins.json', json.dumps(pins, indent=1))
    sh(repo, 'git', 'add', '-A')
    sh(repo, 'git', 'commit', '-q', '-m', 'pins')
    return repo


def commit(repo, msg='change'):
    sh(repo, 'git', 'add', '-A')
    sh(repo, 'git', 'commit', '-q', '-m', msg)


def check(repo, script, names=MADE_UP, extra=()):
    env = {k: v for k, v in os.environ.items() if k != 'FG_PRIVATE_NAMES'}
    if names is not None:
        env['FG_PRIVATE_NAMES'] = names
    r = subprocess.run(PY + [os.path.join(HERE, script), '--repo', repo, *extra], capture_output=True, text=True, env=env)
    return r.returncode, r.stdout + r.stderr


def case_clean(repo):
    write(repo, 'games/a/game.js', '// fine\n'); commit(repo)
    write(repo, 'docs/games/more.md', 'untracked, inside\n')
    return check(repo, 'repo_check.py')[0] == 0


def case_commit_outside(repo):
    write(repo, 'README.md', '# Top changed\n'); commit(repo)
    return check(repo, 'repo_check.py')[0] == 1


def case_unstaged_outside(repo):
    write(repo, 'shared/x.js', '// changed\n')
    return check(repo, 'repo_check.py')[0] == 1


def case_staged_outside(repo):
    write(repo, 'shared/x.js', '// changed\n'); sh(repo, 'git', 'add', 'shared/x.js')
    return check(repo, 'repo_check.py')[0] == 1


def case_untracked_outside(repo):
    write(repo, 'shared/new.js', '// new\n')
    return check(repo, 'repo_check.py')[0] == 1


def case_rename_in(repo):
    sh(repo, 'git', 'mv', 'shared/x.js', 'games/a/x.js'); commit(repo)
    return check(repo, 'repo_check.py')[0] == 1


def case_delete_outside(repo):
    os.remove(os.path.join(repo, 'README.md')); commit(repo)
    return check(repo, 'repo_check.py')[0] == 1


def case_lookalike_paths(repo):
    # docs/games-pack is P-020's; games.json.bak and gamesX/ are not ours either
    ok = True
    for p in ('docs/games-pack/new.md', 'games.json.bak', 'gamesX/a.js', 'tools/tests/games2/a.py', 'docs/gamesx.md'):
        r = make_repo()
        try:
            write(r, p, 'x\n'); commit(r)
            ok = ok and check(r, 'repo_check.py')[0] == 1
        finally:
            shutil.rmtree(r, ignore_errors=True)
    return ok


def case_outside_then_reverted(repo):
    # changed in one commit, put back in the next: still a change made by this branch
    write(repo, 'README.md', '# Top changed\n'); commit(repo)
    write(repo, 'README.md', '# Top\n'); commit(repo)
    return check(repo, 'repo_check.py')[0] == 1


def case_merge_from_main_ok(repo):
    write(repo, 'games/a/game.js', '// mine\n'); commit(repo)
    sh(repo, 'git', 'checkout', '-q', 'main')
    write(repo, 'shared/x.js', '// P-020 published\n'); commit(repo, 'launcher change')
    sh(repo, 'git', 'update-ref', 'refs/remotes/origin/main', 'HEAD')
    sh(repo, 'git', 'checkout', '-q', 'claude/games')
    sh(repo, 'git', 'merge', '-q', '--no-edit', 'main')
    return check(repo, 'repo_check.py')[0] == 0


def case_name_in_file(repo):
    write(repo, 'games/a/game.js', 'const who = "zebedee";\n'); commit(repo)
    code, out = check(repo, 'repo_check.py')
    return code == 1 and 'zebedee' not in out.lower() and 'private name #1' in out


def case_name_untracked(repo):
    write(repo, 'docs/games/notes.md', 'Ottoline liked it\n')
    code, out = check(repo, 'repo_check.py')
    return code == 1 and 'ottoline' not in out.lower() and 'private name #2' in out


def case_name_in_message(repo):
    write(repo, 'games/a/game.js', '// fine\n'); commit(repo, 'Tried by Zebedee')
    return check(repo, 'repo_check.py')[0] == 1


def case_name_in_path(repo):
    write(repo, 'games/a/ottoline.png.txt', 'x\n'); commit(repo)
    return check(repo, 'repo_check.py')[0] == 1


def case_name_inside_word(repo):
    # a name inside a longer word is not that name
    write(repo, 'games/a/game.js', 'const zebedeeland = 1;\n'); commit(repo)
    return check(repo, 'repo_check.py')[0] == 0


def case_names_unset(repo):
    return check(repo, 'repo_check.py', names=None)[0] == 2


def case_names_blank(repo):
    return check(repo, 'repo_check.py', names=' , ')[0] == 2


def case_names_unset_and_outside(repo):
    write(repo, 'README.md', '# changed\n'); commit(repo)
    return check(repo, 'repo_check.py', names=None)[0] == 1


def case_bad_base(repo):
    return check(repo, 'repo_check.py', extra=('--base', 'origin/nope'))[0] == 1


def case_docs_clean(repo):
    return check(repo, 'doc_check.py')[0] == 0


def edit_games(repo, fn):
    p = os.path.join(repo, 'games.json')
    data = json.load(open(p))
    fn(data['games'])
    write(repo, 'games.json', json.dumps(data))


def case_docs_duplicate_id(repo):
    edit_games(repo, lambda g: g.append(dict(g[0])))
    return check(repo, 'doc_check.py')[0] == 1


def case_docs_bad_status(repo):
    edit_games(repo, lambda g: g[0].update(status='live'))
    return check(repo, 'doc_check.py')[0] == 1


def case_docs_ready_no_folder(repo):
    edit_games(repo, lambda g: g[2].update(status='testing'))
    return check(repo, 'doc_check.py')[0] == 1


def case_docs_folder_missing(repo):
    edit_games(repo, lambda g: g[0].update(folder='games/nope/'))
    return check(repo, 'doc_check.py')[0] == 1


def case_docs_bad_id(repo):
    edit_games(repo, lambda g: g[0].update(id='Rocket Lander'))
    return check(repo, 'doc_check.py')[0] == 1


def case_docs_no_title(repo):
    edit_games(repo, lambda g: g[0].pop('title'))
    return check(repo, 'doc_check.py')[0] == 1


def case_docs_bad_json(repo):
    write(repo, 'games.json', '{"games": [')
    return check(repo, 'doc_check.py')[0] == 1


def case_docs_broken_link(repo):
    write(repo, 'docs/games/README.md', GOOD_README.replace('../../games.json', '../../nope.json'))
    return check(repo, 'doc_check.py')[0] == 1


def case_docs_no_version(repo):
    write(repo, 'docs/games/README.md', GOOD_README.replace('**Version 1.0**', 'v1'))
    return check(repo, 'doc_check.py')[0] == 1


def case_docs_no_changelog(repo):
    write(repo, 'docs/games/README.md', GOOD_README.replace('## Change log', '## History'))
    return check(repo, 'doc_check.py')[0] == 1


def case_docs_frozen_missing(repo):
    # only pins.json names this file, so nothing else in the doc check can catch it
    p = os.path.join(repo, 'tools/tests/games/pins.json')
    pins = json.load(open(p))
    pins['frozen'].append({'path': 'games/her-game/gone.html', 'sha256': '0' * 64})
    write(repo, 'tools/tests/games/pins.json', json.dumps(pins))
    return check(repo, 'doc_check.py')[0] == 1


def case_pins_clean(repo):
    return check(repo, 'pins_check.py')[0] == 0


def case_pins_frozen_one_byte(repo):
    write(repo, 'games/her-game/index.html', '<html>her game</html>\n\n')
    return check(repo, 'pins_check.py')[0] == 1


def case_pins_frozen_line_endings(repo):
    with open(os.path.join(repo, 'games/her-game/index.html'), 'wb') as fh:
        fh.write(b'<html>her game</html>\r\n')
    return check(repo, 'pins_check.py')[0] == 1


def case_pins_drift(repo):
    sh(repo, 'git', 'checkout', '-q', 'work')
    write(repo, 'docs/game-contract.md', 'contract v0.4\n'); commit(repo)
    sh(repo, 'git', 'update-ref', 'refs/remotes/origin/work', 'HEAD')
    sh(repo, 'git', 'checkout', '-q', 'claude/games')
    return check(repo, 'pins_check.py')[0] == 1


def case_pins_drift_unreadable(repo):
    sh(repo, 'git', 'update-ref', '-d', 'refs/remotes/origin/work')
    return check(repo, 'pins_check.py')[0] == 1


CASES = [(n[5:], f) for n, f in sorted(globals().items()) if n.startswith('case_')]


def main():
    failed = []
    for name, fn in CASES:
        repo = make_repo()
        try:
            ok = fn(repo)
        except Exception as e:  # a crash is a failure, never a pass
            ok = False
            print(f'  {name}: crashed: {e}')
        finally:
            shutil.rmtree(repo, ignore_errors=True)
        print(f'  {"pass" if ok else "FAIL"} {name}')
        if not ok:
            failed.append(name)
    print(f'test_checks: {len(CASES) - len(failed)}/{len(CASES)} passed')
    return 0 if not failed else 1


if __name__ == '__main__':
    sys.exit(main())
