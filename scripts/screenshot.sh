#!/usr/bin/env bash
# Capture preview screenshots of each template via headless Chrome.
# Output: templates/screenshots/<name>.png
set -euo pipefail

PORT="${PORT:-8765}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
SLIDE_INDEX="${SLIDE_INDEX:-1}"   # 0=title, 1=components, 2=twocol, 3=eq+table, 4=figure
LANG_PARAM="${LANG_PARAM:-en}"
OUT_DIR="templates/screenshots"

if [ ! -x "$CHROME" ]; then
  echo "Chrome not found at: $CHROME" >&2
  echo "Set CHROME=<path-to-chrome-binary> and retry." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

npx -y serve@14 -l "$PORT" . >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

# Wait for server.
for _ in {1..30}; do
  if curl -fsS "http://localhost:$PORT/templates/dark.html" >/dev/null 2>&1; then break; fi
  sleep 0.2
done

for tmpl_file in templates/*.html; do
  tmpl=$(basename "$tmpl_file" .html)
  # Drop .html so serve's cleanUrls redirect doesn't strip the query string.
  url="http://localhost:$PORT/templates/$tmpl?lang=$LANG_PARAM#/$SLIDE_INDEX"
  out="$OUT_DIR/$tmpl.png"
  echo "Capturing $tmpl -> $out"
  "$CHROME" \
    --headless \
    --disable-gpu \
    --hide-scrollbars \
    --no-sandbox \
    --window-size=1280,960 \
    --virtual-time-budget=4000 \
    --screenshot="$out" \
    "$url" \
    >/dev/null 2>&1
done

echo "Done."
