#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"

need node
need npm
need cargo
ensure_deps

say "Type checking the frontend"
npm run check

say "Running the frontend tests"
npm run test

say "Checking rust formatting"
cargo fmt --manifest-path src-tauri/Cargo.toml --check

say "Building the rust backend"
cargo check --manifest-path src-tauri/Cargo.toml

say "All checks passed"
