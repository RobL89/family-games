"""Bench, not part of the close: plants faults in Rocket Lander's link to the wrapper (stage 3, D-120,
D-121, D-118) and counts how many its release check catches. Version 1.0.

Each fault is one exact text change in a copy of the site (the repo without .git, in a temporary
folder), served on 127.0.0.1:8123 as harness.py expects, and checked with that copy's
tools/tests/games/rocket-lander/check.py (about 3 minutes each). The repo itself is never changed.
A fault whose text isn't found exactly once is an error, not a catch. Stop any other server on port
8123 first.

Usage, from the repo root:
    python3 -B tools/tests/games/mutate_rocket_link.py [repo folder, default .]
"""
import os
import shutil
import subprocess
import sys
import tempfile
import time

REPO = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
R = 'games/_common/rocket/round.js'
M = [
    (R, "  const home = linked ? { hidden: true }", "  const home = false ? { hidden: true }", 'own Home shown in the wrapper'),
    (R, "    if (linked) linked.saveState(kept);\n    else keepOnDevice(mode.id, kept);", "    if (linked) linked.saveState(kept);\n    keepOnDevice(mode.id, kept);", 'kept on the device in the wrapper'),
    (R, "    setMuted(start.sound === false);", "    setMuted(false);", 'sound off ignored'),
    (R, "    if (linked) linked.saveState(kept);", "    if (false) linked.saveState(kept);", 'no fg:state'),
    (R, "if (linked && !handed && tracks.length > 1)", "if (linked && !handed && tracks.length > 9)", 'no track pick'),
    (R, "    if (linked && track) keep(); // the track just picked goes out at once (D-121)", "", 'pick not sent at once'),
    (R, "    else playRocket(mode, { linked, state: handed });", "    else playRocket(mode, { linked, state: null });", 'progress handed in ignored'),
    ('games/_common/rocket/link.js', "  const fg = connect(sameSiteParent(win) ? {} : { wait: 0 });", "  const fg = connect({ wait: 1500 });", 'the old 1.5 s wait'),
    (R, "  const opening = linked ? unpack(TRACKS, state, track, mode.track) // the child's, from the wrapper", "  const opening = linked ? unpack(TRACKS, keptOnDevice(mode.id), track, mode.track) // the child's, from the wrapper", "the device's progress, not the child's"),
]


def run(fault):
    path, old, new, name = fault
    tmp = tempfile.mkdtemp(prefix='p034-link-')
    site = os.path.join(tmp, 'site')
    shutil.copytree(REPO, site, ignore=shutil.ignore_patterns('.git', '__pycache__'))
    f = os.path.join(site, path)
    text = open(f, encoding='utf-8').read()
    if text.count(old) != 1:
        shutil.rmtree(tmp)
        return name, 'ERROR (text not found once)'
    open(f, 'w', encoding='utf-8').write(text.replace(old, new))
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8123', '--bind', '127.0.0.1'], cwd=site,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        r = subprocess.run([sys.executable, '-B', 'tools/tests/games/rocket-lander/check.py', os.path.join(tmp, 'out')],
                           cwd=site, capture_output=True, text=True, timeout=900)
        caught = r.returncode != 0
        fails = [ln for ln in r.stdout.splitlines() if ln.startswith('FAIL')][:2]
        detail = '; '.join(fails) or (r.stderr.strip().splitlines() or ['error'])[-1][:120]
    except subprocess.TimeoutExpired:
        caught, detail = True, 'timed out'
    finally:
        srv.terminate(); srv.wait()
        shutil.rmtree(tmp, ignore_errors=True)
    return name, ('caught: ' + detail) if caught else 'MISSED'


if __name__ == '__main__':
    results = []
    for fault in M:
        name, out = run(fault)
        print(f'{name}: {out}', flush=True)
        results.append(out.startswith('caught'))
    print(f'link faults: {sum(results)}/{len(M)} caught')
    sys.exit(0 if all(results) else 1)
