#!/usr/bin/env bash
#
# Point the download page at the release that carries this version.
#
# Usage:
#   scripts/publish-docs.sh

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

VERSION="$(node -p "require('./package.json').version")"

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
