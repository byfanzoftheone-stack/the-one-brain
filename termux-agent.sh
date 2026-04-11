#!/bin/bash

BASE=~/projects
mkdir -p "$BASE"

STATE=~/.agent_state.json
touch "$STATE"

echo "🚀 THE ONE ORCHESTRATOR v3 — CORE BRAIN ONLINE"

# ---------- UTIL ----------
detect_type() {
  if [ -f package.json ]; then echo "node"; return; fi
  if [ -f requirements.txt ]; then echo "python"; return; fi
  if [ -f pubspec.yaml ]; then echo "flutter"; return; fi
  echo "unknown"
}

classify_error() {
  grep -iE "cannot find module|module not found" && echo "dependency_error" && return
  grep -iE "syntax error|unexpected token" && echo "syntax_error" && return
  grep -iE "env|undefined" && echo "env_error" && return
  echo "unknown_error"
}

run_build() {
  TYPE=$(detect_type)

  echo "🏗 BUILD START [$TYPE]"

  OUTPUT=$(npm run build 2>&1)
  echo "$OUTPUT"

  if echo "$OUTPUT" | grep -i "error"; then
    echo "❌ BUILD FAILED"

    ERR_TYPE=$(echo "$OUTPUT" | classify_error)
    echo "🧠 ERROR TYPE: $ERR_TYPE"

    return 1
  fi

  echo "✅ BUILD PASSED"
  return 0
}

auto_fix() {
  echo "🛠 AUTO FIX RUN"

  if [ -f package.json ]; then
    npm install --legacy-peer-deps --no-audit >/dev/null 2>&1
  fi

  run_build
}

# ---------- LOOP ----------
while true; do
  echo ""
  read -r -p "You: " cmd
  cmd=$(echo "$cmd" | xargs)

  case "$cmd" in

    scan)
      echo "🧠 PROJECT MAP"
      ls ~
      ;;

    map)
      echo "📦 ORCHESTRATOR MAP"
      ls "$BASE" 2>/dev/null
      ;;

    audit\ *)
      p="${cmd#audit }"

      DIR=""
      [ -d ~/"$p" ] && DIR=~/"$p"
      [ -d "$BASE/$p" ] && DIR="$BASE/$p"

      if [ -z "$DIR" ]; then
        echo "❌ NOT FOUND"
        continue
      fi

      cd "$DIR" || continue
      echo "📍 $(pwd)"

      TYPE=$(detect_type)
      echo "🧠 TYPE: $TYPE"

      git status -s 2>/dev/null || echo "no git"

      run_build
      ;;

    fix\ *)
      p="${cmd#fix }"

      DIR=""
      [ -d ~/"$p" ] && DIR=~/"$p"
      [ -d "$BASE/$p" ] && DIR="$BASE/$p"

      if [ -z "$DIR" ]; then
        echo "❌ NOT FOUND"
        continue
      fi

      cd "$DIR" || continue

      echo "🛠 FIX STAGE 1"
      auto_fix

      if [ $? -ne 0 ]; then
        echo "🔁 RETRY FIX STAGE 2"
        auto_fix
      fi
      ;;

    sync)
      echo "🔗 SYNC CHECK"
      for d in "$BASE"/*; do
        [ -d "$d" ] && cd "$d" && git status -s 2>/dev/null
      done
      ;;

    quit)
      echo "🧠 ORCHESTRATOR OFFLINE"
      break
      ;;

    *)
      echo "cmds: scan | map | audit <repo> | fix <repo> | sync | quit"
      ;;

  esac
done
