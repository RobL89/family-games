"""Build a game's private preview page (D-018). Version 1.4.

Changes at v1.4: the font ships with the games (D-043): a linked stylesheet's url(...) font
files (woff2 only, in bounds) are inlined as data: URIs and covered by the stamp's sha256, and
the page may name no outside address at all, Google Fonts included.

Changes at v1.3: Rocket Sums (games/rocket-sums/, D-037) gets the same stand-ins as Rocket
Lander, as both use the shared kit.js.

Changes at v1.2: a game may use shared files in games/_common/ (D-027, D-036). The bundle
follows its imports and stylesheet links there and nowhere else outside the game's folder,
and the stamp's commit and sha256 cover those shared files too.

Changes at v1.1: --debug adds the game's test panel (a cog on the start screen) from
tools/tests/games/preview_debug_<game, with _ for ->.js, for Rob's testing only (D-020); without it
the page is as before.

Bundles one game folder (its index.html, CSS and ES modules, with the shared ones it uses
from games/_common/) into one self-contained
HTML page for a private artifact preview, so Rob can try the game on the phone and PC
before anything is published. No bundler is installed: the modules use only plain named
imports and `export function|const|let|class`, and anything else stops the build.

What changes on the way in, and nothing else:
  - each module is wrapped in its own function scope, in import order, and its imports
    become reads from the modules before it;
  - the page's <link rel="stylesheet" href="game.css"> and <script type="module"
    src="game.js"> are replaced by the inlined CSS and script;
  - Rocket Lander's kit.js (in games/_common/rocket/): "back to games" can't reach the launcher from a preview, so
    goHome() reloads the page (back to the start screen). A stand-in, named in the stamp;
  - a small build stamp on the start screen and in a comment at the top: game, preview
    number, the last commit that touched the game folder or the shared files it uses (with
    "+changes" if they differ from it) and the sha256 of all those files, so the preview can be matched
    to the files.
The test hook (window.__test) stays: it only reads and steers the game, and the tests
run against the bundle with it.

Same inputs give the same bytes: no clock, no randomness, files read in a fixed order.
The bundle is written outside the repo by default; it is a build, not a master.

Usage, from the repo root:
    python3 -B tools/tests/games/build_preview.py rocket-lander --number 1 [--debug] [--out PATH]
Prints the output path and the source hash.
"""
import argparse
import base64
import hashlib
import os
import posixpath
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))

IMPORT = re.compile(r"^import \{([^}]*)\} from '((?:\./|\.\./_common/[\w-]+/)[\w-]+)\.js';\s*$")
EXPORT = re.compile(r"^export (?:async )?(function\*?|const|let|class) (\w+)")
CSS_LINK = re.compile(r'<link rel="stylesheet" href="([\w./-]+\.css)">')
CSS_URL = re.compile(r'url\(([^)]*)\)')

# Per-game stand-ins: (file under games/, exact old text, new text). Each old text must match once.
STAND_INS = {
    'rocket-lander': [
        ('_common/rocket/kit.js',
         "const LAUNCHER = new URL('../../../index.html', import.meta.url);",
         "// Preview stand-in (build_preview.py): no launcher to go back to, so home reloads the page."),
        ('_common/rocket/kit.js',
         "export function goHome() { location.href = LAUNCHER.href; }",
         "export function goHome() { location.reload(); }"),
    ],
}
STAND_INS['rocket-sums'] = STAND_INS['rocket-lander']  # the same shared kit.js

STAMP_CSS = (".preview-stamp{position:fixed;right:max(8px,env(safe-area-inset-right));"
             "bottom:max(6px,env(safe-area-inset-bottom));z-index:5;margin:0;font:600 11px/1.2 system-ui,sans-serif;"
             "color:#fff;opacity:.55;pointer-events:none;letter-spacing:.02em}"
             "body:has(#start[hidden]) .preview-stamp{display:none}")


class BuildError(Exception):
    pass


def read(path):
    with open(path, encoding='utf-8', newline='') as f:
        return f.read()


def game_files(folder):
    return sorted(n for n in os.listdir(folder) if os.path.isfile(os.path.join(folder, n)))


def in_bounds(game, key):
    """D-036: a game's bundle may hold its own folder's files and files in games/_common/, nothing else."""
    return key.startswith(f'games/{game}/') or key.startswith('games/_common/')


def resolve(game, importer, spec):
    """The repo path (no .js) that an import in `importer` (a repo path, no .js) points at."""
    key = posixpath.normpath(posixpath.join(posixpath.dirname(importer), spec))
    if not in_bounds(game, key):
        raise BuildError(f'{importer}.js imports {spec}.js, outside games/{game}/ and games/_common/')
    return key


def used_files(game):
    """Every file the bundle is made from, as repo paths: the game folder's files, then the
    shared modules and stylesheets it reaches in games/_common/ (D-036)."""
    rel = f'games/{game}'
    folder = os.path.join(REPO, rel)
    if not os.path.isdir(folder):
        raise BuildError(f'no folder {rel}')
    own = [f'{rel}/{n}' for n in game_files(folder)]
    html = read(os.path.join(folder, 'index.html'))
    shared = set()
    for href in CSS_LINK.findall(html):
        key = posixpath.normpath(posixpath.join(rel, href))
        if not in_bounds(game, key):
            raise BuildError(f'index.html links {href}, outside games/{game}/ and games/_common/')
        if not key.startswith(rel + '/'):
            shared.add(key)
        for font in css_fonts(game, key):
            if not font.startswith(rel + '/'):
                shared.add(font)
    todo = [f'{rel}/{n[:-3]}' for n in game_files(folder) if n.endswith('.js')]
    seen = set(todo)
    while todo:
        key = todo.pop()
        path = os.path.join(REPO, key + '.js')
        if not os.path.exists(path):
            raise BuildError(f'{key}.js is imported but does not exist')
        for line in read(path).split('\n'):
            m = IMPORT.match(line)
            if m:
                dep = resolve(game, key, m.group(2))
                if dep not in seen:
                    seen.add(dep)
                    todo.append(dep)
                    if not dep.startswith(rel + '/'):
                        shared.add(dep + '.js')
    return own + sorted(shared)


def css_fonts(game, css_key):
    """The font files a stylesheet points at with url(...), as repo paths (D-043): woff2 only,
    beside or below the stylesheet's folder in bounds; anything else stops the build."""
    out = []
    for ref in CSS_URL.findall(read(os.path.join(REPO, css_key))):
        ref = ref.strip().strip('\'"')
        key = posixpath.normpath(posixpath.join(posixpath.dirname(css_key), ref))
        if not ref.endswith('.woff2') or re.match(r'[a-z]+:', ref) or not in_bounds(game, key):
            raise BuildError(f'{css_key}: url({ref}) is not a woff2 file in bounds')
        if not os.path.isfile(os.path.join(REPO, key)):
            raise BuildError(f'{css_key}: url({ref}) does not exist')
        out.append(key)
    return out


def inline_fonts(game, css_key, css):
    """The stylesheet with each url(x.woff2) replaced by the file as a data: URI."""
    def one(m):
        ref = m.group(1).strip().strip('\'"')
        key = posixpath.normpath(posixpath.join(posixpath.dirname(css_key), ref))
        with open(os.path.join(REPO, key), 'rb') as f:
            return 'url(data:font/woff2;base64,' + base64.b64encode(f.read()).decode() + ')'
    css_fonts(game, css_key)  # the same rules as for the hash
    return CSS_URL.sub(one, css)


def source_hash(game):
    """sha256 over every file the bundle is made from, each labelled with its repo path."""
    h = hashlib.sha256()
    for key in used_files(game):
        with open(os.path.join(REPO, key), 'rb') as f:
            data = f.read()
        h.update(key.encode() + b'\0' + str(len(data)).encode() + b'\0' + data)
    return h.hexdigest()


def git(*args):
    r = subprocess.run(['git', *args], cwd=REPO, capture_output=True, text=True)
    if r.returncode != 0:
        raise BuildError(f'git {" ".join(args)} failed: {r.stderr.strip()}')
    return r.stdout.strip()


def commit_of(*paths):
    """The last commit touching any of the paths, with "+changes" if any of them differs from it."""
    c = git('log', '-1', '--format=%h', '--', *paths)
    if not c:
        raise BuildError(f'no commit touches {" ".join(paths)}')
    dirty = git('status', '--porcelain', '--', *paths)
    return c + ('+changes' if dirty else '')


def apply_stand_ins(game, key, text):
    for file, old, new in STAND_INS.get(game, []):
        if f'games/{file}' != key + '.js':
            continue
        n = text.count(old)
        if n != 1:
            raise BuildError(f'{file}: stand-in text found {n} times, expected once: {old!r}')
        text = text.replace(old, new)
    return text


def parse_module(game, key, text):
    """Return (imports [(module key, [(name, local)])], exports [names], body)."""
    name = key + '.js'
    imports, exports, out = [], [], []
    for i, line in enumerate(text.split('\n'), 1):
        m = IMPORT.match(line)
        if m:
            names = []
            for part in m.group(1).split(','):
                part = part.strip()
                if not part:
                    continue
                bits = part.split()
                if len(bits) == 1 and bits[0].isidentifier():
                    names.append((bits[0], bits[0]))
                elif len(bits) == 3 and bits[1] == 'as' and bits[0].isidentifier() and bits[2].isidentifier():
                    names.append((bits[0], bits[2]))
                else:
                    raise BuildError(f'{name}:{i}: import form not handled: {line.strip()}')
            imports.append((resolve(game, key, m.group(2)), names))
            out.append('')  # keep line numbers stable inside the module
            continue
        if re.match(r'^\s*import\b', line) and not line.lstrip().startswith('import('):
            raise BuildError(f'{name}:{i}: import form not handled: {line.strip()}')
        m = EXPORT.match(line)
        if m:
            exports.append(m.group(2))
            out.append(line[len('export '):])
            continue
        if re.match(r'^\s*export\b', line):
            raise BuildError(f'{name}:{i}: export form not handled: {line.strip()}')
        if 'import.meta' in line:
            raise BuildError(f'{name}:{i}: import.meta has no meaning in a bundle: {line.strip()}')
        if '</script' in line.lower():
            raise BuildError(f'{name}:{i}: "</script" would end the inline script')
        out.append(line)
    return imports, exports, '\n'.join(out)


def order_modules(entry, mods):
    seen, done, order = set(), set(), []

    def visit(m):
        if m in done:
            return
        if m in seen:
            raise BuildError(f'import cycle at {m}.js')
        if m not in mods:
            raise BuildError(f'{m}.js is imported but not bundled')
        seen.add(m)
        for dep, _ in mods[m][0]:
            visit(dep)
        done.add(m)
        order.append(m)

    visit(entry)
    return order


def ident(m):
    return '__m_' + re.sub(r'\W', '_', m)


def debug_script(game):
    path = os.path.join(HERE, f'preview_debug_{game.replace("-", "_")}.js')
    if not os.path.exists(path):
        raise BuildError(f'--debug: no test panel for {game} ({os.path.relpath(path, REPO)})')
    text = read(path)
    if '</script' in text.lower():
        raise BuildError(f'{os.path.basename(path)}: "</script" would end the inline script')
    return f'// ---- {os.path.basename(path)} (preview only) ----\n{text}'


def build(game, number, debug=False):
    rel = f'games/{game}'
    files = used_files(game)
    html = read(os.path.join(REPO, rel, 'index.html'))

    links = CSS_LINK.findall(html)
    scripts = re.findall(r'<script type="module" src="([\w-]+)\.js"></script>', html)
    if len(scripts) != 1:
        raise BuildError(f'index.html: expected one module script, found {len(scripts)}')
    if re.search(r'<script(?![^>]*type="module" src=")', html):
        raise BuildError('index.html: other script tags not handled')

    mods = {}
    for key in files:
        if key.endswith('.js'):
            k = key[:-3]
            mods[k] = parse_module(game, k, apply_stand_ins(game, k, read(os.path.join(REPO, key))))
    for file, old, _ in STAND_INS.get(game, []):
        if f'games/{file}' not in files:
            raise BuildError(f'stand-in names games/{file}, which the bundle does not use')
    order = order_modules(f'{rel}/{scripts[0]}', mods)

    parts = []
    for m in order:
        imports, exports, body = mods[m]
        for dep, names in imports:
            have = set(mods[dep][1])
            for n, _ in names:
                if n not in have:
                    raise BuildError(f'{m}.js imports {n} from {dep}.js, which does not export it')
        head = ''.join(
            f"const {{ {', '.join(n if n == loc else f'{n}: {loc}' for n, loc in names)} }} = {ident(dep)};\n"
            for dep, names in imports)
        tail = f"\nreturn {{ {', '.join(exports)} }};\n" if exports else '\n'
        parts.append(f'// ---- {m}.js ----\nconst {ident(m)} = (() => {{\n{head}{body}{tail}}})();\n')
    script = ''.join(parts)
    if debug:
        script += debug_script(game)

    src = source_hash(game)
    shared_dirs = sorted({posixpath.dirname(f) for f in files if not f.startswith(rel + '/')})
    commit = commit_of(rel, *shared_dirs)
    stamp = f'{game} · preview {number} · {commit} · src {src[:8]}'
    stand = (' · home reloads' if STAND_INS.get(game) else '') + (' · test panel' if debug else '')

    for href in links:
        css_key = posixpath.normpath(posixpath.join(rel, href))
        css = inline_fonts(game, css_key, read(os.path.join(REPO, css_key)))
        if '</style' in css.lower():
            raise BuildError(f'{href}: "</style" would end the inline style')
        html = html.replace(f'<link rel="stylesheet" href="{href}">', f'<style>\n{css}</style>', 1)
    html = html.replace(f'<script type="module" src="{scripts[0]}.js"></script>',
                        f'<script type="module">\n{script}</script>', 1)
    html = html.replace('</head>', f'  <style>{STAMP_CSS}</style>\n</head>', 1)
    html = html.replace('</main>', f'</main>\n  <p class="preview-stamp" aria-hidden="true">{stamp}{stand}</p>', 1)
    if not html.lower().startswith('<!doctype html>'):
        raise BuildError('index.html must begin with <!doctype html>')
    html = html.replace('<!doctype html>', f'<!doctype html>\n<!-- Preview build: {stamp}; sha256 of {rel} and the shared files it uses '
                                            f'({", ".join(shared_dirs) or "none"}): {src}; '
                                            f'built by tools/tests/games/build_preview.py 1.4{" --debug" if debug else ""} -->', 1)
    leftovers = re.findall(r'(?:src|href)="[^"#][^"]*"', html)
    if leftovers:
        raise BuildError(f'references left that a one-file page cannot load: {leftovers[:5]}')
    far = re.findall(r'https?://[\w.-]+', html)
    if far:
        raise BuildError(f'outside addresses named in the page (D-043): {sorted(set(far))[:5]}')
    return html, src, stamp


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    p.add_argument('game')
    p.add_argument('--number', required=True, help='preview number, counted per game (1, 2, …)')
    p.add_argument('--debug', action='store_true', help="add the game's test panel (Rob's testing only, D-020)")
    p.add_argument('--out', help='output file (default: ../previews/<game>-preview-<n>.html beside the repo)')
    a = p.parse_args(argv)
    try:
        html, src, stamp = build(a.game, a.number, a.debug)
    except BuildError as e:
        print('BUILD FAILED:', e, file=sys.stderr)
        return 1
    out = a.out or os.path.join(os.path.dirname(REPO), 'previews', f'{a.game}-preview-{a.number}{"-debug" if a.debug else ""}.html')
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, 'w', encoding='utf-8', newline='') as f:
        f.write(html)
    print(out)
    print(f'stamp: {stamp}')
    print(f'sha256 of games/{a.game} and the shared files it uses: {src}')
    print(f'bytes: {len(html.encode())}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
