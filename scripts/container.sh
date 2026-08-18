#!/usr/bin/env bash
#
# Podman or docker helpers, sourced by the other scripts. Nothing to run here.

BUILDER="kana-trainer-builder:bookworm"
CONTAINERFILE="packaging/Containerfile"

RUNTIME=""
RUNTIME_RUN=()
RUNTIME_BUILD=()

runtime() {
  if [ -n "$RUNTIME" ]; then
    return 0
  fi
  if command -v podman >/dev/null 2>&1; then
    RUNTIME="podman"
  elif command -v docker >/dev/null 2>&1; then
    RUNTIME="docker"
  else
    return 1
  fi
  if "$RUNTIME" --version 2>/dev/null | grep -qi podman; then
    RUNTIME_RUN=(--security-opt label=disable)
    RUNTIME_BUILD=(--format docker)
  else
    RUNTIME_RUN=(--user "$(id -u):$(id -g)")
  fi
  return 0
}

builder() {
  runtime || return 1
  if "$RUNTIME" image inspect "$BUILDER" >/dev/null 2>&1; then
    return 0
  fi
  if [ ! -f "$CONTAINERFILE" ]; then
    echo "missing $CONTAINERFILE, cannot build $BUILDER" >&2
    return 1
  fi
  say "Building $BUILDER from $CONTAINERFILE, which happens once"
  "$RUNTIME" build "${RUNTIME_BUILD[@]}" -t "$BUILDER" \
    -f "$CONTAINERFILE" "$(dirname "$CONTAINERFILE")"
}

in_builder() {
  "$RUNTIME" run --rm "${RUNTIME_RUN[@]}" \
    -v "$ROOT:/src" \
    -w /src \
    -e HOME=/tmp \
    -e CARGO_HOME=/src/.cargo-container \
    -e CARGO_TARGET_DIR=/src/target-portable \
    -e NO_STRIP=true \
    -e APPIMAGE_EXTRACT_AND_RUN=1 \
    "$BUILDER" \
    bash -c "$1"
}
