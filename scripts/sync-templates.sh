#!/usr/bin/env bash
# Sync the <body>...</html> section from SOURCE to every other template
# under templates/ and to slides.html. Each target's <head> (style block
# and theme link) is preserved.
#
# Use this after editing sample slide content in templates/dark.html so
# the same DOM lands in every template variant.
#
# Env:
#   SOURCE   default: templates/dark.html
set -euo pipefail

SOURCE="${SOURCE:-templates/dark.html}"

if [ ! -f "$SOURCE" ]; then
  echo "Source not found: $SOURCE" >&2
  exit 1
fi

src_body_start=$(grep -n '^<body' "$SOURCE" | head -1 | cut -d: -f1)
if [ -z "$src_body_start" ]; then
  echo "No <body line in $SOURCE" >&2
  exit 1
fi
src_body=$(tail -n +"$src_body_start" "$SOURCE")

updated=0
unchanged=0

sync_one() {
  local target="$1"
  [ ! -f "$target" ] && return 0
  # Skip the source itself (compare absolute paths to be safe).
  if [ "$(cd "$(dirname "$target")" && pwd)/$(basename "$target")" = \
       "$(cd "$(dirname "$SOURCE")" && pwd)/$(basename "$SOURCE")" ]; then
    return 0
  fi

  local tgt_body_start
  tgt_body_start=$(grep -n '^<body' "$target" | head -1 | cut -d: -f1)
  if [ -z "$tgt_body_start" ]; then
    echo "  skip $target (no <body line)" >&2
    return 0
  fi
  local head_end=$((tgt_body_start - 1))

  local tmp
  tmp=$(mktemp)
  head -n "$head_end" "$target" > "$tmp"
  printf '%s\n' "$src_body" >> "$tmp"

  if cmp -s "$target" "$tmp"; then
    rm "$tmp"
    unchanged=$((unchanged + 1))
    return 0
  fi
  mv "$tmp" "$target"
  echo "  updated $target"
  updated=$((updated + 1))
}

echo "Syncing body from $SOURCE..."
for tgt in templates/*.html slides.html; do
  sync_one "$tgt"
done
echo "Done. $updated updated, $unchanged unchanged."
