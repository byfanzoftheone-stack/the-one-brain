#!/bin/bash
# Termux Ultimate Autonomous Agent v∞
# Watches builds, media, zips, repos, ports, dependencies in real-time
# Author: Larry

WATCH_DIRS=("$HOME/termux-builds" "$HOME")
BACKUP_DIR="$HOME/termux-agent-backups"
INTEL_LOG="$HOME/termux-agent-intel.log"

mkdir -p "$BACKUP_DIR"

log() { echo "$(date '+%F %T') - $1" | tee -a "$INTEL_LOG"; }

backup_file() {
  local file="$1"
  local dest="$BACKUP_DIR/$(basename "$file")-$(date '+%Y%m%d_%H%M%S')"
  mkdir -p "$(dirname "$dest")"
  cp -r "$file" "$dest"
  log "Backed up $file to $dest"
}

process_file() {
  local file="$1"
  local hash
  hash=$(sha256sum "$file" | awk '{print $1}')

  if grep -q "$hash" "$INTEL_LOG"; then
    log "Duplicate detected: $file, moving to backup"
    backup_file "$file"
    rm -f "$file"
  else
    echo "$hash" >> "$INTEL_LOG"
  fi
}

handle_build_dir() {
  local dir="$1"
  log "Processing build dir: $dir"

  # Kill conflicting ports safely
  fuser -k 3000/tcp 2>/dev/null || true
  fuser -k 3001/tcp 2>/dev/null || true

  # Backup current build
  backup_file "$dir"

  # Remove old caches/deps
  rm -rf "$dir/.next" "$dir/node_modules" "$dir/package-lock.json"

  # Install dependencies if package.json exists
  if [ -f "$dir/package.json" ]; then
    log "Installing Node.js dependencies in $dir"
    npm install --prefix "$dir" || log "npm install failed"
  fi

  # Update Git repos
  if [ -d "$dir/.git" ]; then
    log "Updating Git repo in $dir"
    git -C "$dir" pull --rebase || log "Git pull failed"
  fi

  # Scan for zips/tars and handle duplicates
  find "$dir" -type f \( -name "*.zip" -o -name "*.tar.gz" \) -print0 | while IFS= read -r -d '' file; do
    process_file "$file"
  done
}

handle_media() {
  # Scan images/videos in WATCH_DIRS
  for dir in "${WATCH_DIRS[@]}"; do
    find "$dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.mp4" -o -iname "*.mov" \) -print0 | while IFS= read -r -d '' media; do
      process_file "$media"
    done
  done
}

main_loop() {
  log "=== Autonomous Agent Started ==="
  while true; do
    # Process each build dir
    for dir in "$HOME/termux-builds"/*; do
      [ -d "$dir" ] && handle_build_dir "$dir"
    done

    # Process media in WATCH_DIRS
    handle_media

    sleep 60  # Check every minute
  done
}

main_loop
