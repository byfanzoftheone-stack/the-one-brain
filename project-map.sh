#!/bin/bash

echo "🧠 BUILDING REAL PROJECT MAP..."

BASE=~
OUT=~/agent-projects.txt

rm -f "$OUT"

find "$BASE" -maxdepth 3 -type d -name ".git" 2>/dev/null | while read gitdir; do
  repo=$(dirname "$gitdir")
  echo "$repo" >> "$OUT"
done

echo "✅ DONE"
echo "Found projects:"
cat "$OUT"
