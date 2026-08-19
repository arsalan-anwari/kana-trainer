#!/usr/bin/env bash
#
# Publish kana-trainer to crates.io.
#
# Usage:
#   scripts/publish.sh              publish
#   scripts/publish.sh --dry-run    package and verify, upload nothing

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

VERSION="$(node -p "require('./package.json').version")"

for file in src-tauri/Cargo.toml src-tauri/tauri.conf.json; do
  grep -q "\"\?$VERSION\"\?" "$file" || {
    echo "$file does not carry version $VERSION, stopping" >&2
    exit 1
  }
done

echo "==> Building the frontend into src-tauri/dist"
[ -d node_modules ] || npm ci --no-audit --no-fund
npm run build
[ -f src-tauri/dist/index.html ] || {
  echo "frontend build is missing, stopping" >&2
  exit 1
}

echo "==> Publishing kana-trainer $VERSION to crates.io"
cargo publish --manifest-path src-tauri/Cargo.toml --allow-dirty --no-verify "$@"
