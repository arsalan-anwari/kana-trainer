#!/usr/bin/env bash
#
# Set the release version everywhere it is written down, so a release does not
# depend on remembering all six places.
#
# Usage:
#   scripts/update_version.sh 1.5.3

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

VERSION="${1-}"
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || {
  echo "usage: scripts/update_version.sh 1.x.x" >&2
  exit 1
}

METAINFO=packaging/linux/nl.anwari.kanatrainer.metainfo.xml
TODAY="$(date +%F)"

sed -i "s|^  \"version\": \".*\"|  \"version\": \"$VERSION\"|" package.json
sed -i "s|^version = \".*\"|version = \"$VERSION\"|" src-tauri/Cargo.toml
sed -i "s|^  \"version\": \".*\"|  \"version\": \"$VERSION\"|" src-tauri/tauri.conf.json
sed -i "s|^pkgver=.*|pkgver=$VERSION|" packaging/arch/PKGBUILD

# only the kana-trainer entry, the lock file is full of other packages
awk -v version="$VERSION" '
  /^name = "kana-trainer"$/ { ours = 1 }
  ours && /^version = / { print "version = \"" version "\""; ours = 0; next }
  { print }
' src-tauri/Cargo.lock > src-tauri/Cargo.lock.new
mv src-tauri/Cargo.lock.new src-tauri/Cargo.lock

# newest release first, and re-running for the same version rewrites its date
# rather than stacking a duplicate entry
if grep -q "<release version=\"$VERSION\" " "$METAINFO"; then
  sed -i "s|<release version=\"$VERSION\" date=\"[^\"]*\"/>|<release version=\"$VERSION\" date=\"$TODAY\"/>|" "$METAINFO"
else
  sed -i "/^  <releases>$/a\\    <release version=\"$VERSION\" date=\"$TODAY\"/>" "$METAINFO"
fi

for file in package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json \
            src-tauri/Cargo.lock packaging/arch/PKGBUILD "$METAINFO"; do
  grep -q "$VERSION" "$file" || {
    echo "$file was not updated to $VERSION, stopping" >&2
    exit 1
  }
  echo "    $file"
done
echo "==> everything now carries $VERSION"

grep -q "^## \[\?$VERSION\]\?" CHANGELOG.md || {
  echo
  echo "!!! CHANGELOG.md has no '## [$VERSION]' entry yet."
  echo "    Add one before tagging, the release workflow reads it for the notes."
}
