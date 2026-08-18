#!/usr/bin/env bash
#
# Build everything a user installs and put it in dist/release, ready for a release to
# carry. 
#
# Usage:
#   scripts/package.sh                 the binary, deb, rpm, appimage, arch and flatpak
#   scripts/package.sh bundles         the binary, deb, rpm and appimage
#   scripts/package.sh flatpak         the flatpak bundle
#   scripts/package.sh arch            the arch package, from the last binary built
#   scripts/package.sh --native        build against this machine's glibc, not bookworm's

source "$(dirname "$0")/common.sh"
source "$(dirname "$0")/container.sh"

TARGET=""
NATIVE=false

for arg in "$@"; do
  case "$arg" in
    --native) NATIVE=true ;;
    -h|--help)
      sed -n '3,11p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    all|bundles|appimage|arch|flatpak)
      TARGET="$arg"
      ;;
    *)
      echo "package: unknown option '$arg', see $0 --help" >&2
      exit 2
      ;;
  esac
done

TARGET="${TARGET:-all}"
VERSION="$(app_version)"
STAGE="dist/release"
NFPM_VERSION="${NFPM_VERSION:-2.43.1}"

if [ "$NATIVE" = true ]; then
  BUILT="src-tauri/target/release"
else
  BUILT="target-portable/release"
fi

stage() {
  local label="$1"
  shift
  local found=false file
  for file in "$@"; do
    if [ -e "$file" ]; then
      cp -f "$file" "$STAGE/"
      found=true
    fi
  done
  if [ "$found" = false ]; then
    say "No $label was produced, the release will not carry one"
  fi
}

build_bundles() {
  if [ "$NATIVE" = true ]; then
    say "Building the binary, deb, rpm and appimage against this machine's glibc"
    ensure_deps
    npx tauri build --bundles deb,rpm,appimage
  else
    if ! builder; then
      say "No podman or docker, and the portable build needs one"
      say "Pass --native to build against this machine's glibc instead"
      return
    fi
    say "Building the binary, deb, rpm and appimage on debian bookworm"
    in_builder "npm ci --no-audit --no-fund && npx tauri build --bundles deb,rpm,appimage"
  fi

  if [ -f "$BUILT/kana-trainer" ]; then
    cp -f "$BUILT/kana-trainer" "$STAGE/kana-trainer-$VERSION-x86_64-linux"
  else
    say "No binary was produced, the release will not carry one"
  fi

  stage deb "$BUILT"/bundle/deb/*_"$VERSION"_*.deb
  stage rpm "$BUILT"/bundle/rpm/*-"$VERSION"-*.rpm
  stage appimage "$BUILT"/bundle/appimage/*_"$VERSION"_*.AppImage
}

nfpm_command() {
  if command -v nfpm >/dev/null 2>&1; then
    echo "nfpm"
    return 0
  fi
  local kept="dist/.tools/nfpm"
  if [ -x "$kept" ]; then
    echo "$kept"
    return 0
  fi
  local from="https://github.com/goreleaser/nfpm/releases/download/v${NFPM_VERSION}/nfpm_${NFPM_VERSION}_Linux_x86_64.tar.gz"
  mkdir -p dist/.tools
  say "Fetching nfpm $NFPM_VERSION, which builds the arch package" >&2
  if ! curl -fsSL "$from" | tar -xz -C dist/.tools nfpm; then
    return 1
  fi
  chmod +x "$kept"
  echo "$kept"
}

build_arch() {
  if [ ! -f "$BUILT/kana-trainer" ]; then
    say "No binary to build the arch package from, build the bundles first"
    return
  fi

  local nfpm
  if ! nfpm="$(nfpm_command)"; then
    say "Could not fetch nfpm, skipping the arch package"
    return
  fi

  say "Building the arch package"
  sed -e "s|@VERSION@|$VERSION|" -e "s|@BINARY@|$BUILT/kana-trainer|" \
    packaging/nfpm.yaml > dist/nfpm.yaml
  "$nfpm" package --config dist/nfpm.yaml --packager archlinux --target "$STAGE"
}

build_flatpak() {
  if ! command -v flatpak-builder >/dev/null 2>&1; then
    say "flatpak-builder is not on this machine, skipping the flatpak"
    say "Install it with: sudo dnf install flatpak-builder"
    return
  fi
  say "Building the flatpak inside the gnome sdk"
  flatpak-builder --force-clean --user --install-deps-from=flathub \
    --repo=build/flatpak-repo build/flatpak packaging/flatpak/nl.anwari.kanatrainer.yml

  say "Bundling the flatpak into a single file"
  flatpak build-bundle build/flatpak-repo \
    "build/nl.anwari.kanatrainer-$VERSION.flatpak" nl.anwari.kanatrainer
  stage flatpak "build/nl.anwari.kanatrainer-$VERSION.flatpak"
}

mkdir -p "$STAGE"
rm -f "$STAGE/SHA256SUMS.txt"

case "$TARGET" in
  bundles) build_bundles ;;
  appimage) build_bundles ;;
  arch) build_arch ;;
  flatpak) build_flatpak ;;
  all)
    rm -rf "$STAGE"
    mkdir -p "$STAGE"
    build_bundles
    build_arch
    build_flatpak
    ;;
esac

say "What dist/release now holds"
ls -1 "$STAGE" 2>/dev/null || say "nothing, no target could be built on this machine"
