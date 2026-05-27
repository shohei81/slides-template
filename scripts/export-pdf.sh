#!/usr/bin/env bash
# Spin up a local static server, run decktape against slides.html, then shut the server down.
set -euo pipefail

PORT="${PORT:-8765}"
OUT="${1:-slides.pdf}"

npx -y serve@14 -l "$PORT" . >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

# Wait for the server to come up.
for _ in {1..30}; do
  if curl -fsS "http://localhost:$PORT/slides.html" >/dev/null 2>&1; then break; fi
  sleep 0.2
done

npx -y decktape@3 reveal \
  --size 1280x960 \
  "http://localhost:$PORT/slides.html" \
  "$OUT"

echo "Wrote $OUT"
