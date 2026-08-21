#!/usr/bin/env bash
#
# Regenerates docs/html, the GitHub Pages download page, from the assets
# attached to a github release.
#
# Usage:
#   scripts/build-download-page.sh              use the latest release
#   scripts/build-download-page.sh v1.4.0       use that tag
#
# Needs the gh cli, logged in or carrying GH_TOKEN, plus jq.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

OUT_DIR=docs/html
TEMPLATE=scripts/download-page/index.template.html
REPO_URL=https://github.com/arsalan-anwari/kana-trainer

for tool in gh jq; do
  command -v "$tool" >/dev/null || { echo "$tool is not installed, stopping" >&2; exit 1; }
done

TAG="${1:-}"
if [ -z "$TAG" ]; then
  TAG="$(gh release view --json tagName --jq .tagName)"
fi

echo "==> Reading the assets on $TAG"
release="$(gh release view "$TAG" --json tagName,publishedAt,assets)"

VERSION="${TAG#v}"
RELEASED_ON="$(jq -r '.publishedAt | split("T")[0]' <<<"$release")"
RELEASE_URL="$REPO_URL/releases/tag/$TAG"

# Each row is: data-os | glob | icon | name | note | blurb
#
# The globs are matched against the asset names on the release rather than
# spelled out in full, because the bundlers disagree about how to write the
# product name and the architecture into a file name.
catalog='
windows|*x64-setup.exe|windows|Windows|10 and 11, 64-bit|Installer. Adds Kana Trainer to the start menu.
macos|*universal.dmg|apple|macOS|Apple silicon and Intel|Disk image. Drag the app into your Applications folder.
linux|*_amd64.deb|debian|Debian and Ubuntu|.deb, 64-bit|For Debian 13 and later, Ubuntu 24.04 and later, Mint and Pop!_OS.
linux|*.x86_64.rpm|fedora|Fedora and openSUSE|.rpm, 64-bit|For Fedora, openSUSE and other rpm based systems.
linux|*.pkg.tar.zst|arch|Arch Linux|.pkg.tar.zst, 64-bit|For Arch, Manjaro and EndeavourOS.
android|*.apk|android|Android|7.0 and later|Sideloaded apk. Allow installs from your browser when asked.
'

icon() {
  case "$1" in
    windows) echo '<path d="M0 3.4 9.8 2v9.4H0zm10.9-1.6L24 0v11.4H10.9zM0 12.6h9.8V22L0 20.6zm10.9 0H24V24l-13.1-1.8z"/>' ;;
    apple)   echo '<path d="M16.4 12.7c0-2.7 2.2-4 2.3-4.1-1.2-1.8-3.2-2-3.9-2.1-1.6-.2-3.2.9-4 .9s-2.1-.9-3.5-.9c-1.8 0-3.4 1-4.3 2.6-1.9 3.2-.5 8 1.3 10.6.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.8 3.4-.8s2 .8 3.4.8 2.3-1.3 3.2-2.5c1-1.5 1.4-2.9 1.4-3-.1 0-2.7-1-2.7-4.1zM13.8 4.3c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3.1 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3.1-1.5z"/>' ;;
    debian)  echo '<circle cx="12" cy="12" r="5.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="3.2" r="2.6"/><circle cx="4.4" cy="16.4" r="2.6"/><circle cx="19.6" cy="16.4" r="2.6"/>' ;;
    fedora)  echo '<path d="M12 0a12 12 0 0 0 0 24h5.7a6.3 6.3 0 0 0 6.3-6.3V12A12 12 0 0 0 12 0zm1.6 5.6a3.6 3.6 0 0 1 3.6 3.6 1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 0-1.2-1.2 1.2 1.2 0 0 0-1.2 1.2v2.2h2a1.2 1.2 0 1 1 0 2.4h-2v1.4a3.6 3.6 0 1 1-3.6-3.6h1.2V9.2a3.6 3.6 0 0 1 3.6-3.6zM9.2 13.6a1.2 1.2 0 1 0 1.2 1.2v-1.2z"/>' ;;
    arch)    echo '<path d="M12 .8c.8 1.6 1.3 2.7 2.2 4.3-.6-.6-1.2-1-1.8-1.4.9 2.3 1.4 4.7 1.2 7.1-.1 2.6-1.1 5-2.7 7 1.6-.4 3.2-1.3 4.4-2.5-.1.7-.4 1.4-.9 2.1 2.1-1.4 3.2-3.4 3.4-5.4l4.6 10.2H1.6L12 .8zm.3 15.4c1 .6 1.9 1.4 2.5 2.4H9.2c.6-1 1.5-1.8 2.5-2.4z"/>' ;;
    android) echo '<path d="M6 9v7.5c0 .6.4 1 1 1h1V21a1.5 1.5 0 0 0 3 0v-3.5h2V21a1.5 1.5 0 0 0 3 0v-3.5h1c.6 0 1-.4 1-1V9H6zM4 9a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 4 9zm16 0a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 20 9zM15.9 2.7l1.1-1.9a.3.3 0 0 0-.5-.3l-1.1 2A6.7 6.7 0 0 0 12 2c-.9 0-1.7.2-2.4.5L8.5.5a.3.3 0 0 0-.5.3l1.1 1.9A5.6 5.6 0 0 0 6 7.5h12a5.6 5.6 0 0 0-2.1-4.8zM9.5 5.4a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2zm5 0a.6.6 0 1 1 0-1.2.6.6 0 0 1 0 1.2z"/>' ;;
  esac
}

# 1924840 -> 1.8 MB
human_size() {
  awk -v b="$1" 'BEGIN { printf (b < 1048576) ? "%.0f KB\n" : "%.1f MB\n", (b < 1048576) ? b / 1024 : b / 1048576 }'
}

escape() {
  sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g' <<<"$1"
}

cards=""
missing=()

while IFS='|' read -r os glob icon_name name note blurb; do
  [ -n "${os:-}" ] || continue

  asset="$(jq -c --arg glob "$glob" 'first(.assets[] | select(.name | test("^" + ($glob | gsub("\\."; "\\.") | gsub("\\*"; ".*")) + "$"))) // empty' <<<"$release")"
  if [ -z "$asset" ]; then
    missing+=("$name ($glob)")
    continue
  fi

  url="$(jq -r .url <<<"$asset")"
  size="$(human_size "$(jq -r .size <<<"$asset")")"
  filename="$(jq -r .name <<<"$asset")"

  cards+="        <li class=\"card\" data-os=\"$os\">
          <div class=\"card-head\">
            <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\">$(icon "$icon_name")</svg>
            <div>
              <div class=\"card-name\">$(escape "$name")</div>
              <div class=\"card-note\">$(escape "$note")</div>
            </div>
            <span class=\"yours-flag\">Your system</span>
          </div>
          <p class=\"card-body\">$(escape "$blurb")</p>
          <a class=\"button\" href=\"$url\" download>
            Download <span class=\"size\">$size</span>
          </a>
        </li>
"
  echo "    $name -> $filename ($size)"
done <<<"$catalog"

if [ ${#missing[@]} -gt 0 ]; then
  printf "::warning::$TAG has no asset for %s, that card is left off the page\n" \
    "${missing[@]}" >&2
fi

if [ -z "$cards" ]; then
  echo "$TAG has no assets matching any known package, stopping" >&2
  exit 1
fi

echo "==> Writing $OUT_DIR"
mkdir -p "$OUT_DIR"

# Pages runs jekyll over the branch by default, which drops files starting
# with an underscore and slows the deploy down for nothing
touch "$OUT_DIR/.nojekyll"

cp public/favicon.png docs/showcase.gif docs/showcase-phone.gif "$OUT_DIR/"

cards_file="$(mktemp)"
trap 'rm -f "$cards_file"' EXIT
printf '%s' "$cards" > "$cards_file"

sed -e "s|{{VERSION}}|$VERSION|g" \
    -e "s|{{RELEASED_ON}}|$RELEASED_ON|g" \
    -e "s|{{RELEASE_URL}}|$RELEASE_URL|g" \
    -e "s|{{CHECKSUMS_URL}}|$REPO_URL/releases/download/$TAG/SHA256SUMS.txt|g" \
    -e "s|{{REPO_URL}}|$REPO_URL|g" \
    -e "/{{CARDS}}/{ r $cards_file
d }" \
    "$TEMPLATE" > "$OUT_DIR/index.html"

echo "==> $OUT_DIR/index.html now points at $TAG"
