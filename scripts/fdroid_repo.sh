#!/usr/bin/env bash
#
# Builds the self-hosted F-Droid repo into build/fdroid/repo, from the apk
# attached to a GitHub release. fdroid.yml attaches it to the release, and the
# pages workflow publishes it next to the download page, at
# https://arsalan-anwari.github.io/kana-trainer/fdroid/repo
#
#   scripts/fdroid_repo.sh                  from the latest release
#   scripts/fdroid_repo.sh v1.9.1           from that tag
#   scripts/fdroid_repo.sh --serve [tag]    build, then serve it on port 8000,
#                                           add http://<lan ip>:8000/repo in F-Droid
#
# fdroidserver runs in a debian container, the host only needs docker and the
# gh cli. The repo signing key comes from FDROID_KEYSTORE_BASE64 and
# FDROID_KEYSTORE_PASS when set (CI), otherwise from packaging/fdroid/keystore.p12
# and packaging/fdroid/keystore.pass.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

APP_ID=nl.anwari.kanatrainer
SRC=packaging/fdroid
OUT=build/fdroid

serve=0
[ "${1:-}" = --serve ] && { serve=1; shift; }
TAG="${1:-$(gh release view --json tagName -q .tagName)}"

echo "==> Building the F-Droid repo from $TAG"
rm -rf "$OUT"
mkdir -p "$OUT/repo" "$OUT/metadata/$APP_ID/en-US/phoneScreenshots"

cp "$SRC/config.yml" "$OUT/"
cp -R "$SRC/metadata/." "$OUT/metadata/"
# fdroid reads repo_icon from its working dir, and cannot pull the app icon out
# of the apk since tauri only ships an adaptive (xml) one
cp src-tauri/icons/icon.png "$OUT/kana-trainer.png"
cp src-tauri/icons/icon.png "$OUT/metadata/$APP_ID/en-US/icon.png"

# the same eight screenshots as the play store listing
for shot in 01_Setup_TextOnly 04_Setup_Alphabets 06_Quiz_TextOnly_KanaRomaji \
            08_Quiz_AudioText_Typing 10_Quiz_TextAudio_Sounds 13_Result_Score \
            15_Reports_All 20_Chart_Characters; do
  cp "packaging/repo/phone/$shot.png" "$OUT/metadata/$APP_ID/en-US/phoneScreenshots/"
done

gh release download "$TAG" --pattern '*.apk' --dir "$OUT/repo"

if [ -n "${FDROID_KEYSTORE_BASE64:-}" ]; then
  printf '%s' "$FDROID_KEYSTORE_BASE64" | base64 -d > "$OUT/keystore.p12"
else
  cp "$SRC/keystore.p12" "$OUT/keystore.p12"
  FDROID_KEYSTORE_PASS="$(cat "$SRC/keystore.pass")"
fi
[ -n "${FDROID_KEYSTORE_PASS:-}" ] || { echo "no FDROID_KEYSTORE_PASS, stopping" >&2; exit 1; }
export FDROID_KEYSTORE_PASS

# the key must never reach the pages artifact, even when fdroid fails
trap 'rm -f "$OUT/keystore.p12"' EXIT

# fdroidserver refuses a config.yml or keystore readable by others
chmod 600 "$OUT/config.yml" "$OUT/keystore.p12"

docker run --rm -e FDROID_KEYSTORE_PASS -v "$PWD/$OUT:/repo" -w /repo debian:trixie bash -c "
  set -e
  trap 'chown -R $(id -u):$(id -g) /repo' EXIT
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends fdroidserver >/dev/null
  fdroid update
"

echo "==> $OUT/repo is ready"

if ((serve)); then
  echo "    add http://$(hostname -I | cut -d' ' -f1):8000/repo in F-Droid, ctrl+c to stop"
  python3 -m http.server -d "$OUT" 8000
fi
