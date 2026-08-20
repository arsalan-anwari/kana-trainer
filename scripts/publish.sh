#!/usr/bin/env bash
#
# Publish kana-trainer to crates.io, then point the download page at the
# release that carries this version.
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

# The packages are built and attached by the release workflow, so the assets
# only exist once that has finished. Regenerating early would leave the page
# pointing at the previous version, so skip rather than guess.
echo "==> Pointing docs/html at v$VERSION"
if gh release view "v$VERSION" >/dev/null 2>&1; then
  scripts/build-download-page.sh "v$VERSION"
  echo "    commit docs/html to publish it, the pages workflow deploys from there"
else
  echo "    no v$VERSION release yet, leaving docs/html alone."
  echo "    the release workflow regenerates it once the packages are attached,"
  echo "    or run scripts/build-download-page.sh v$VERSION by hand afterwards"
fi
