#!/usr/bin/env sh
set -eu

root="$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)"
src="$root/src-tauri/icons/android"
dest="$root/src-tauri/gen/android/app/src/main/res"

[ -d "$src" ] || { echo "no android icons at $src; run 'npx tauri icon'" >&2; exit 1; }
[ -d "$dest" ] || { echo "no generated android project at $dest; run 'npx tauri android init' first" >&2; exit 1; }

cp -R "$src/." "$dest/"
echo "copied android launcher icons into $dest"
