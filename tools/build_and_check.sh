#!/usr/bin/env bash
# Build Couchcatch, take the standard screenshots, compose the contact sheet, and (optionally) run the e2e tests.
# Usage: tools/build_and_check.sh <src dir> <out.html> <shots dir> [--tests]
set -euo pipefail
SRC=$(cd "$1" && pwd); OUT=$(realpath -m "$2"); SHOTS=$(realpath -m "$3"); HERE=$(cd "$(dirname "$0")/.." && pwd)
(cd "$SRC" && python3 build.py draw.js "$OUT")
echo "built $OUT ($(stat -c %s "$OUT") bytes)"
node -e "const h=require('fs').readFileSync('$OUT','utf8');const re=/<script>([\s\S]*?)<\/script>/g;let m,i=0,bad=0;while(m=re.exec(h)){i++;try{new Function(m[1])}catch(e){bad++;console.log('script',i,'SYNTAX',e.message)}}if(bad)process.exit(1);console.log(i,'scripts parse')"
node "$HERE/tools/shots.js" "$OUT" "$SHOTS"
python3 "$HERE/tools/compose_shots.py" "$SHOTS" "$SHOTS/sheet.png"
if [ -s "$SHOTS/errors.txt" ]; then echo "--- page errors during screenshots:"; cat "$SHOTS/errors.txt"; fi
if [ "${4:-}" = "--tests" ]; then node "$HERE/tests/run.js" "$OUT"; fi
