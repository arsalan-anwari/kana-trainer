#!/usr/bin/env bash
# Records the short promotion clip of the app, for social posts.
#
#   scripts/record-promo.sh                    # docs/promo.mp4
#   scripts/record-promo.sh out/clip.mp4       # somewhere else
#   SKIP_BUILD=1 scripts/record-promo.sh       # reuse the current dist/
#   PROMO_SPEED=1 scripts/record-promo.sh      # no speed up, see below
#   PROMO_TRIM=0.8 scripts/record-promo.sh     # cut more off the front
#
# Needs ffmpeg, the playwright chromium browser and a japanese font on the
# machine (fonts-noto-cjk, google-noto-sans-cjk-fonts) or the kana come out as
# empty boxes.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

out="${1:-docs/promo.mp4}"
raw="$root/.promo/raw"

need() {
  command -v "$1" >/dev/null 2>&1 || { echo "missing $1, $2" >&2; exit 1; }
}

need ffmpeg "install it from your package manager"
need npx "install node 20 or newer"

[ -d node_modules ] || { echo "run npm install first" >&2; exit 1; }

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  echo "==> building the frontend"
  npm run build
fi

echo "==> recording"
rm -rf "$raw"
npx playwright test --config scripts/promo/promo.config.ts

webm="$(find "$raw" -name '*.webm' -print -quit)"
[ -n "$webm" ] || { echo "no recording was produced" >&2; exit 1; }

echo "==> encoding $out"
mkdir -p "$(dirname "$out")"

# fedora ships ffmpeg without libx264, openh264 is the fallback there
encoders="$(ffmpeg -hide_banner -encoders 2>/dev/null)"
if grep -q ' libx264 ' <<<"$encoders"; then
  codec=(-c:v libx264 -preset slow -crf 20)
elif grep -q ' libopenh264 ' <<<"$encoders"; then
  codec=(-c:v libopenh264 -b:v 4M)
else
  echo "no h264 encoder in ffmpeg, install one (libx264 or libopenh264)" >&2
  exit 1
fi

speed="${PROMO_SPEED:-1.1}"
ffmpeg -hide_banner -loglevel error -y \
  -ss "${PROMO_TRIM:-0.6}" -i "$webm" \
  -vf "setpts=PTS/${speed},fps=30,format=yuv420p" \
  -an "${codec[@]}" -movflags +faststart \
  "$out"

seconds="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out" 2>/dev/null || echo '?')"
echo "==> done: $out (${seconds}s, $(du -h "$out" | cut -f1))"
