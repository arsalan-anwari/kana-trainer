#!/usr/bin/env bash
#
# Regenerate docs/html so the download page points at the release that carries
# this version.
#
# Usage:
#   scripts/publish-docs.sh              use the version in package.json
#   scripts/publish-docs.sh v1.5.1       use that tag

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

TAG="${1:-v$(node -p "require('./package.json').version")}"

echo "==> Pointing docs/html at $TAG"
if gh release view "$TAG" >/dev/null 2>&1; then
  scripts/build-download-page.sh "$TAG"
  echo "    commit docs/html to publish it, the pages workflow deploys from there"
else
  echo "    no $TAG release yet, leaving docs/html alone." >&2
  echo "    the release workflow regenerates it once the packages are attached," >&2
  echo "    or rerun this script by hand afterwards" >&2
  exit 1
fi
