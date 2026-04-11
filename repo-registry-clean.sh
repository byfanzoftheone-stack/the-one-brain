#!/bin/bash

BASE=~/projects
OUT=~/repo-registry-clean.txt

rm -f "$OUT"

echo "🧠 CLEAN REGISTRY BUILD"

for d in "$BASE"/*; do
  if [ -d "$d/.git" ]; then
    name=$(basename "$d")
    url=$(cd "$d" && git remote get-url origin 2>/dev/null)
    echo "$name|$d|$url" >> "$OUT"
  fi
done

echo "✅ CLEAN REGISTRY COMPLETE"
cat "$OUT"
