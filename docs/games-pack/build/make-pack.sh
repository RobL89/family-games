#!/usr/bin/env bash
# Builds the games pack zip: the documents in docs/games-pack, plus the prototype code
# taken unchanged from the games-wip branch (commit 7ef1ff0).
#   bash docs/games-pack/build/make-pack.sh [output folder]
# Run from anywhere inside the repo. Needs the games-wip commit: git fetch origin games-wip
set -euo pipefail

COMMIT=7ef1ff0
ROOT=$(git rev-parse --show-toplevel)
OUT=${1:-$ROOT}
NAME=family-games-games-pack
TMP=$(mktemp -d)
DEST="$TMP/$NAME"

git -C "$ROOT" cat-file -e "$COMMIT^{commit}" || { echo "Commit $COMMIT not found: git fetch origin games-wip"; exit 1; }

# 1. The documents, without this build folder.
mkdir -p "$DEST"
cp -R "$ROOT/docs/games-pack/." "$DEST/"
rm -rf "$DEST/build"
find "$DEST" -name '__pycache__' -prune -exec rm -rf {} +

# 2. The prototype: the three games, what they import, and their tests.
P="$DEST/prototype"
mkdir -p "$P"
git -C "$ROOT" archive "$COMMIT" \
  games/word-worm games/monster-cafe games/rocket-lander \
  shared/game-kit.js shared/api.js shared/config.js shared/settings.js shared/sound.js \
  shared/achievements.js shared/icons.js \
  tools/tests/standin.py tools/tests/e2e_word-worm.py tools/tests/e2e_monster-cafe.py tools/tests/e2e_rocket-lander.py \
  | tar -x -C "$P"

# The family's script link out; any https address will do, as nothing calls it without a family code.
sed -i.bak -E "s#appsScriptUrl: '[^']*'#appsScriptUrl: 'https://script.google.com/macros/s/PLACEHOLDER/exec'#" "$P/shared/config.js"
rm "$P/shared/config.js.bak"
grep -q PLACEHOLDER "$P/shared/config.js" || { echo "config.js: script link not replaced"; exit 1; }

# The game kit reads games.json once a player is picked; list just these three.
cat > "$P/games.json" <<'JSON'
{
  "games": [
    { "id": "word-worm", "title": "Word Worm", "icon": "g-worm", "colour": "#3FA34D", "folder": "games/word-worm/", "status": "ready" },
    { "id": "monster-cafe", "title": "Monster Café", "icon": "g-cafe", "colour": "#E8833A", "folder": "games/monster-cafe/", "status": "ready" },
    { "id": "rocket-lander", "title": "Rocket Lander", "icon": "g-rocket", "colour": "#5B4FCF", "folder": "games/rocket-lander/", "status": "ready" }
  ]
}
JSON
cp "$ROOT/docs/games-pack/build/prototype-index.html" "$P/index.html"
cp "$ROOT/docs/games-pack/build/prototype-README.md" "$P/README.md"

# 3. Zip it.
mkdir -p "$OUT"
rm -f "$OUT/$NAME.zip"
(cd "$TMP" && zip -qr -X "$OUT/$NAME.zip" "$NAME")
rm -rf "$TMP"
echo "Made $OUT/$NAME.zip"
