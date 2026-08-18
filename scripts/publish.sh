#!/usr/bin/env bash
#
# Release the version named in package.json: build the crate and the linux
# packages, tag the commit, publish to crates.io and create the github release
# with the changelog entry and every artifact attached.
#
# Usage:
#   scripts/publish.sh                  the whole release
#   scripts/publish.sh --dry-run        build and check everything, upload nothing, tag nothing
#   scripts/publish.sh --allow-dirty    release even though the working tree has changes
#   scripts/publish.sh --skip-packages  do not build the deb, rpm, appimage, arch, flatpak and snap
#   scripts/publish.sh --native         build the packages against this machine's glibc, not bookworm's
#   scripts/publish.sh --snap-remote    build the snap on launchpad instead of locally
#   scripts/publish.sh --skip-crate     do not publish to crates.io
#   scripts/publish.sh --skip-release   do not tag and do not create the github release

source "$(dirname "$0")/common.sh"

DRY_RUN=false
ALLOW_DIRTY=false
SKIP_PACKAGES=false
SKIP_CRATE=false
SKIP_RELEASE=false
PACKAGING=()

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --allow-dirty) ALLOW_DIRTY=true ;;
    --skip-packages) SKIP_PACKAGES=true ;;
    --skip-crate) SKIP_CRATE=true ;;
    --skip-release) SKIP_RELEASE=true ;;
    --native|--snap-remote) PACKAGING+=("$arg") ;;
    -h|--help)
      sed -n '3,15p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "publish: unknown option '$arg', see $0 --help" >&2
      exit 2
      ;;
  esac
done

need node
need npm
need cargo
need git
ensure_deps

VERSION="$(app_version)"
TAG="v$VERSION"
RELEASE_DIR="dist/release"
NOTES_FILE="dist/notes-$VERSION.md"

say "Releasing kana-trainer $VERSION"

# Preflight

check_version_in() {
  local file="$1" pattern="$2"
  if ! grep -q "$pattern" "$file"; then
    echo "$file does not carry version $VERSION, stopping" >&2
    exit 1
  fi
}

say "Checking that every manifest agrees on $VERSION"
check_version_in src-tauri/Cargo.toml "^version = \"$VERSION\""
check_version_in src-tauri/tauri.conf.json "\"version\": \"$VERSION\""
check_version_in packaging/snap/snapcraft.yaml "^version: \"$VERSION\""
check_version_in packaging/arch/PKGBUILD "^pkgver=$VERSION"
check_version_in packaging/linux/nl.anwari.kanatrainer.metainfo.xml "release version=\"$VERSION\""

say "Reading the changelog entry for $VERSION"
mkdir -p dist
awk -v version="$VERSION" '
  $0 ~ "^## \\[?" version "\\]?" { found = 1; next }
  found && /^## / { exit }
  found && !/^\[[^][]*\]: / { print }
' CHANGELOG.md | awk '
  { line[NR] = $0; if (NF) last = NR }
  END { for (i = 1; i <= last; i++) print line[i] }
' | sed -e '/./,$!d' > "$NOTES_FILE"

if [ ! -s "$NOTES_FILE" ]; then
  echo "CHANGELOG.md has no entry for $VERSION, stopping" >&2
  exit 1
fi

if [ "$SKIP_RELEASE" = false ]; then
  need gh

  if [ -n "$(git status --porcelain)" ]; then
    if [ "$ALLOW_DIRTY" = false ]; then
      echo "the working tree has changes, commit them first or pass --allow-dirty" >&2
      exit 1
    fi
    say "The working tree has changes, continuing because of --allow-dirty"
  fi

  if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
    echo "tag $TAG already exists locally, stopping" >&2
    exit 1
  fi

  if [ "$DRY_RUN" = false ] && ! gh auth status >/dev/null 2>&1; then
    echo "gh is not logged in, run: gh auth login" >&2
    exit 1
  fi
fi

# Crate

say "Building the frontend into src-tauri/dist so the crate carries the app"
npm run build

if [ ! -f src-tauri/dist/index.html ]; then
  echo "frontend build is missing, stopping" >&2
  exit 1
fi

say "Packaging the crate"
cargo package --manifest-path src-tauri/Cargo.toml --allow-dirty --no-verify

# Packages

if [ "$SKIP_PACKAGES" = false ]; then
  say "Building every package the release carries"
  ./scripts/package.sh all "${PACKAGING[@]+"${PACKAGING[@]}"}"

  if [ -z "$(ls -A "$RELEASE_DIR" 2>/dev/null)" ]; then
    echo "no package could be built on this machine, stopping" >&2
    echo "  pass --skip-packages to release without them" >&2
    exit 1
  fi

  say "Writing checksums"
  ( cd "$RELEASE_DIR" \
    && sha256sum -- * > ../SHA256SUMS.txt.tmp \
    && mv ../SHA256SUMS.txt.tmp SHA256SUMS.txt )
fi

# The tag

if [ "$SKIP_RELEASE" = false ]; then
  if [ "$DRY_RUN" = true ]; then
    say "Dry run, would tag the current commit as $TAG and push it to origin"
  else
    say "Tagging the current commit as $TAG"
    git tag -a "$TAG" -m "kana-trainer $VERSION"
    git push origin "$TAG"
  fi
fi

# Crates.io

if [ "$SKIP_CRATE" = false ]; then
  if [ "$DRY_RUN" = true ]; then
    say "Dry run, would publish kana-trainer $VERSION to crates.io"
  else
    say "Publishing kana-trainer to crates.io"
    cargo publish --manifest-path src-tauri/Cargo.toml --allow-dirty --no-verify
  fi
fi

# Release 

if [ "$SKIP_RELEASE" = false ]; then
  ASSETS=()
  if [ -d "$RELEASE_DIR" ]; then
    for file in "$RELEASE_DIR"/*; do
      [ -f "$file" ] || continue
      ASSETS+=("$file")
    done
  fi

  if [ "$DRY_RUN" = true ]; then
    say "Dry run, would create the github release $TAG with these assets"
    printf '%s\n' "${ASSETS[@]:-(none)}"
    say "Release notes"
    cat "$NOTES_FILE"
  else
    say "Creating the github release $TAG"
    gh release create "$TAG" \
      --title "kana-trainer $VERSION" \
      --notes-file "$NOTES_FILE" \
      --verify-tag \
      "${ASSETS[@]}"
  fi
fi

if [ "$DRY_RUN" = true ]; then
  say "Dry run finished, nothing was tagged or uploaded"
else
  say "Released kana-trainer $VERSION"
fi
