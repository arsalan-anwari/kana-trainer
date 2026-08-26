#!/usr/bin/env bash
#
# Upload the contents of public/ to the kana-sounds dataset on the Hugging Face Hub.
#
# Requires a prior `hf auth login` (or HF_TOKEN in the environment).
#
# Usage:
#   scripts/upload_data.sh                      upload public/ to the dataset
#   scripts/upload_data.sh --create-pr          open a pull request instead of committing to main
#   scripts/upload_data.sh --exclude "*.png"    any extra flags are passed to `hf upload`

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

REPO_ID="arsalan-anwari/kana-sounds"
VERSION="$(node -p "require('./package.json').version")"

command -v hf >/dev/null || {
  echo "the hf CLI is not installed, see https://hf.co/cli" >&2
  exit 1
}

hf auth whoami >/dev/null 2>&1 || {
  echo "not logged in to Hugging Face, run 'hf auth login' first" >&2
  exit 1
}

[ -d public/audio ] || {
  echo "public/audio is missing, stopping" >&2
  exit 1
}

echo "==> Uploading public/ to https://huggingface.co/datasets/$REPO_ID"
hf upload "$REPO_ID" public . \
  --type dataset \
  --commit-message "Sync kana audio from kana-trainer $VERSION" \
  "$@"
