#!/bin/bash

BASE=~/projects
OUT=~/repo-registry.txt

rm -f "$OUT"

echo "🧠 BUILDING REPO REGISTRY..."

for d in "$BASE"/*; do
  if [ -d "$d/.git" ]; then
    name=$(basename "$d")
    url=$(cd "$d" && git remote get-url origin 2>/dev/null)
    echo "$name|$d|$url" >> "$OUT"
  fi
done

echo "✅ REGISTRY CREATED"
cat "$OUT"
