#!/usr/bin/env bash
#
# Build everything: the frontend, and then every package a user can install.
#
# Usage:
#   scripts/build.sh                 all of it, portable
#   scripts/build.sh --native        build against this machine's glibc, not bookworm's
#   scripts/build.sh --snap-remote   build the snap on launchpad instead of locally
#   scripts/build.sh --app-only      just the desktop app, no packages

source "$(dirname "$0")/common.sh"

APP_ONLY=false
PASSED=()

for arg in "$@"; do
  case "$arg" in
    --app-only) APP_ONLY=true ;;
    --native|--snap-remote) PASSED+=("$arg") ;;
    -h|--help)
      sed -n '3,13p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "build: unknown option '$arg', see $0 --help" >&2
      exit 2
      ;;
  esac
done

need node
need npm
need cargo
ensure_deps

if [ "$APP_ONLY" = true ]; then
  say "Building the frontend into src-tauri/dist"
  npm run build

  say "Building the desktop app for this machine"
  npx tauri build

  say "Done, look in src-tauri/target/release"
  exit 0
fi

say "Building the frontend into src-tauri/dist"
npm run build

exec ./scripts/package.sh all "${PASSED[@]+"${PASSED[@]}"}"
