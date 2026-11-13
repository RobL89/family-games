"""Scan an artifact game's page for what its adapter must handle (P80, games/_common/README.md).

Taking in:    python3 -I tools/scan_artifact.py games/<id>/original.html
Updating:     python3 -I tools/scan_artifact.py <old original.html> <new original.html> [games/<id>/adapter.js]

It only reads the pages and prints what it finds; it changes nothing. Each finding names the row of
the checklist that says what it means. When updating, it lists storage keys that came or went, and
checks every id and class the adapter uses is still in the new page (maker-notes.md asks the maker
to keep them).
"""
import re
import sys

# Storage keys: quoted names like 'kk.words' or 'numberTown.player.' (a prefix the game adds an id to).
KEY = re.compile(r"""(['"`])([a-z][A-Za-z0-9]*\.[A-Za-z0-9_.-]*)\1""")
NOT_KEY = re.compile(r'\.(js|css|png|svg|jpg|jpeg|gif|webp|mp3|wav|html|json|min|com|org|io|net|uk)$|\.\.|\.\d')

FINDS = [
    # (checklist row, what, pattern)
    ('Storage', 'uses device storage', r'localStorage|sessionStorage|indexedDB'),
    ('Saves on leaving', 'saves on blur, hiding or unloading', r"""addEventListener\(\s*['"](blur|visibilitychange|pagehide|unload|beforeunload)['"]"""),
    ('Own players', 'has its own players', r"""[Ww]ho'?s playing|[Ss]witch (player|explorer)|players?\b.{0,20}\[\]"""),
    ('Sound', 'makes sound', r'AudioContext|new Audio\(|<audio'),
    ('Sound', 'speaks', r'speechSynthesis|SpeechSynthesisUtterance'),
    ('Permissions', 'asks for location, camera or microphone', r'geolocation|getUserMedia|Notification\.requestPermission'),
    ('Own buttons', 'prints', r'window\.print|\bprint\(\)'),
    ('Own buttons', 'goes full screen', r'requestFullscreen'),
    ('Own buttons', 'navigates away', r'history\.back|location\.(href|assign|replace)\s*='),
]
SITES = re.compile(r"""['"`](https?://[^'"`\s]+)""")  # any web address in quotes, however it's loaded
NOT_SITE = re.compile(r'^https?://www\.w3\.org/')     # SVG and XML names, not loaded


def read(path):
    with open(path, encoding='utf-8', errors='replace') as f:
        return f.read()


def line_of(text, pos):
    return text.count('\n', 0, pos) + 1


def keys(text):
    return sorted({m.group(2) for m in KEY.finditer(text) if not NOT_KEY.search(m.group(2))})


def scan(path):
    text = read(path)
    print(f'Scan of {path} ({len(text):,} characters)\n')
    found = False
    for row, what, pattern in FINDS:
        hits = sorted({line_of(text, m.start()) for m in re.finditer(pattern, text)})
        if hits:
            found = True
            print(f'[{row}] {what}: {len(hits)} place(s), lines {", ".join(map(str, hits[:6]))}{" ..." if len(hits) > 6 else ""}')
    ks = keys(text)
    if ks:
        print(f'[Storage] keys it seems to use: {", ".join(ks)}')
    sites = sorted({m.group(1) for m in SITES.finditer(text) if not NOT_SITE.match(m.group(1))})
    if sites:
        found = True
        print('[Other sites] loads from:')
        for s in sites:
            print(f'    {s}' + ('   (fonts: fall back when blocked, nothing to do)' if 'fonts.' in s else ''))
    if not found and not ks:
        print('Nothing found: it may need no adapter (check by playing it).')
    print('\nNames of real people: read its text yourself; Rob checks none are family names (P68).')


def used_by(adapter):
    """Ids and classes the adapter looks for in the page."""
    text = read(adapter)
    ids = set(re.findall(r"""(?:\$|getElementById)\(\s*['"]([\w-]+)['"]""", text))
    for sel in re.findall(r"""(?:querySelector(?:All)?|closest|matches)\(\s*['"]([^'"]+)['"]""", text) + re.findall(r"""(#[\w-]+)\s*\{""", text):
        ids.update(re.findall(r'#([\w-]+)', sel))
    classes = set()
    for sel in re.findall(r"""(?:querySelector(?:All)?|closest|matches)\(\s*['"]([^'"]+)['"]""", text):
        classes.update(re.findall(r'\.([\w-]+)', sel))
    return sorted(ids), sorted(classes)


def update(old_path, new_path, adapter=None):
    old, new = read(old_path), read(new_path)
    print(f'Update: {old_path} -> {new_path}\n')
    ok = True
    gone, came = sorted(set(keys(old)) - set(keys(new))), sorted(set(keys(new)) - set(keys(old)))
    if gone or came:
        ok = False
        print(f'[Storage] keys changed. Gone: {", ".join(gone) or "none"}. New: {", ".join(came) or "none"}.')
        print('    Saved progress may not be read: check before taking it (maker-notes.md, point 1).')
    else:
        print('[Storage] same keys as before.')
    if adapter:
        ids, classes = used_by(adapter)
        missing = [i for i in ids if not re.search(r"""id\s*=\s*['"]%s['"]""" % re.escape(i), new)]
        missing += ['.' + c for c in classes if not re.search(r"""class\s*=\s*['"][^'"]*\b%s\b""" % re.escape(c), new)]
        if missing:
            ok = False
            print(f'[Adapter] the new page has lost: {", ".join(missing)}. Fix the adapter before release.')
        else:
            print(f'[Adapter] all {len(ids)} ids and {len(classes)} classes it uses are still there.')
    print('\nThen scan the new page as a new game, to see anything it has started doing:')
    print(f'    python3 -I tools/scan_artifact.py {new_path}')
    return ok


if __name__ == '__main__':
    args = sys.argv[1:]
    if len(args) == 1:
        scan(args[0])
    elif len(args) in (2, 3):
        sys.exit(0 if update(*args) else 1)
    else:
        print(__doc__)
        sys.exit(2)
