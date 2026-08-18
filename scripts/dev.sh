#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"

need node
need npm
need cargo
ensure_deps

if [ "${1:-}" = "web" ]; then
  say "Starting the browser preview on http://localhost:1420"
  exec npm run dev
fi

say "Starting the desktop app"
exec npm run tauri:dev
