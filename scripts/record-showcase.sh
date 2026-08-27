#!/usr/bin/env bash
# Records the readme showcase: a still of every screen at both sizes, and the
# two gifs built from those stills.
#
#   scripts/record-showcase.sh                       # both sizes, both gifs
#   SKIP_BUILD=1 scripts/record-showcase.sh          # reuse the current dist/
#   SHOWCASE_ONLY=phone scripts/record-showcase.sh   # one size only
#   SHOWCASE_HOLD=2.4 scripts/record-showcase.sh     # a slower slideshow
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

hold="${SHOWCASE_HOLD:-1.8}"
colors="${SHOWCASE_COLORS:-128}"
work="$root/.showcase"

need() {
  command -v "$1" >/dev/null 2>&1 || { echo "missing $1, $2" >&2; exit 1; }
}

# Where a size writes its stills and its gif, and how wide that gif gets.
target_dir() { echo "docs/$1"; }

target_gif() {
  case "$1" in
    desktop) echo "docs/showcase.gif" ;;
    phone) echo "docs/showcase-phone.gif" ;;
    *) echo "docs/showcase-$1.gif" ;;
  esac
}

target_width() {
  case "$1" in
    desktop) echo "${SHOWCASE_WIDTH:-800}" ;;
    phone) echo "${SHOWCASE_PHONE_WIDTH:-300}" ;;
    *) echo 800 ;;
  esac
}

frame_size() {
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$1"
}

# Turns a folder of stills into one gif, held on each frame long enough to read.
build_gif() {
  local dir="$1" out="$2" width="$3"

  shopt -s nullglob
  local frames=("$dir"/*.png)
  shopt -u nullglob
  [ "${#frames[@]}" -gt 0 ] || { echo "no stills in $dir" >&2; exit 1; }

  # one odd frame and the palette filter dies with an internal error, so the
  # sizes are checked here where the message can say which file is wrong
  local first size
  first="$(frame_size "${frames[0]}")"
  for frame in "${frames[@]}"; do
    size="$(frame_size "$frame")"
    [ "$size" = "$first" ] || { echo "$frame is ${size/,/x}, expected ${first/,/x}" >&2; exit 1; }
  done

  mkdir -p "$work"
  local name list palette last index seconds
  name="$(basename "$out" .gif)"
  list="$work/$name.txt"
  palette="$work/$name-palette.png"
  last=$(( ${#frames[@]} - 1 ))
  index=0
  : > "$list"

  for frame in "${frames[@]}"; do
    seconds="$hold"
    # the opening and closing frames are the ones a reader actually stops on
    if [ "$index" -eq 0 ] || [ "$index" -eq "$last" ]; then
      seconds="$(awk -v h="$hold" 'BEGIN { printf "%.2f", h * 1.7 }')"
    fi
    printf "file '%s'\nduration %s\n" "$root/$frame" "$seconds" >> "$list"
    index=$(( index + 1 ))
  done
  # concat drops the duration of its last entry, so that frame is listed twice
  printf "file '%s'\n" "$root/${frames[$last]}" >> "$list"

  local scale="scale=$width:-2:flags=lanczos"

  ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$list" \
    -vf "$scale,palettegen=max_colors=$colors:stats_mode=diff" "$palette"

  ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$list" -i "$palette" \
    -lavfi "$scale[frames];[frames][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" \
    -fps_mode vfr -loop 0 "$out"

  echo "==> ${#frames[@]} frames into $out ($(du -h "$out" | cut -f1))"
}

need ffmpeg "install it from your package manager"
need ffprobe "it ships with ffmpeg"
need npx "install node 20 or newer"

[ -d node_modules ] || { echo "run npm install first" >&2; exit 1; }

if command -v fc-list >/dev/null 2>&1 && [ -z "$(fc-list :lang=ja family 2>/dev/null)" ]; then
  echo "no japanese font on this machine, every kana would come out as a box" >&2
  echo "install fonts-noto-cjk or google-noto-sans-cjk-fonts" >&2
  exit 1
fi

targets=(desktop phone)
[ -z "${SHOWCASE_ONLY:-}" ] || targets=("$SHOWCASE_ONLY")

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  echo "==> building the frontend"
  npm run build
fi

for target in "${targets[@]}"; do
  dir="$(target_dir "$target")"
  echo "==> shooting $target"
  mkdir -p "$dir"
  # stale stills would otherwise linger as frames of a scene that is gone
  rm -f "$dir"/*.png
  npx playwright test --config scripts/showcase/showcase.config.ts --project="$target"
  build_gif "$dir" "$(target_gif "$target")" "$(target_width "$target")"
done

# The social card for the promo clip. The clip itself carries a cursor and a
# caption pill in every frame, so the card is the opening still instead, on a
# cream field at the 16:9 the link previews want.
if [ -f docs/desktop/01_Setup_TextOnly.png ]; then
  ffmpeg -hide_banner -loglevel error -y -i docs/desktop/01_Setup_TextOnly.png \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease:flags=lanczos,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0xF7F2E7" \
    docs/promo-thumbnail.png
  echo "==> docs/promo-thumbnail.png"
fi
