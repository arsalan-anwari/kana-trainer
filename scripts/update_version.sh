#!/usr/bin/env bash
#
# Set the release version everywhere it is written down.
#
# Usage:
#   scripts/update_version.sh 1.x.x

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

VERSION="${1-}"
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || {
  echo "usage: scripts/update_version.sh 1.x.x" >&2
  exit 1
}

METAINFO=packaging/linux/nl.anwari.kanatrainer.metainfo.xml
RELEASES=https://github.com/arsalan-anwari/kana-trainer/releases/tag
TODAY="$(date +%F)"

sed -i "s|^  \"version\": \".*\"|  \"version\": \"$VERSION\"|" package.json
sed -i "s|^version = \".*\"|version = \"$VERSION\"|" src-tauri/Cargo.toml
sed -i "s|^  \"version\": \".*\"|  \"version\": \"$VERSION\"|" src-tauri/tauri.conf.json
sed -i "s|^pkgver=.*|pkgver=$VERSION|" packaging/arch/PKGBUILD

# only the kana-trainer entry, the lock file holds other packages too
awk -v version="$VERSION" '
  /^name = "kana-trainer"$/ { ours = 1 }
  ours && /^version = / { print "version = \"" version "\""; ours = 0; next }
  { print }
' src-tauri/Cargo.lock > src-tauri/Cargo.lock.new
mv src-tauri/Cargo.lock.new src-tauri/Cargo.lock

# newest release first, re-running for the same version rewrites its date
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

# The entry itself is written by hand, but its link definition at the foot of
# the file is not, and it was the piece that kept being forgotten.
if grep -q "^## \[\?$VERSION\]\?" CHANGELOG.md; then
  if grep -q "^\[$VERSION\]:" CHANGELOG.md; then
    echo "    CHANGELOG.md already links $VERSION"
  else
    awk -v link="[$VERSION]: $RELEASES/v$VERSION" '
      # newest first, so the new one goes above the block that is already there
      !added && /^\[[0-9]+\.[0-9]+\.[0-9]+\]:/ { print link; added = 1 }
      { print }
      END { if (!added) print "\n" link }
    ' CHANGELOG.md > CHANGELOG.md.new
    mv CHANGELOG.md.new CHANGELOG.md
    echo "    CHANGELOG.md now links $VERSION"
  fi
else
  echo
  echo "!!! CHANGELOG.md has no '## [$VERSION]' entry yet."
  echo "    Add one before tagging, the release workflow reads it for the notes."
  echo "    Its link definition is added here once the entry exists."
fi
