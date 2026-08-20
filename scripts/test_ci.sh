#!/usr/bin/env bash
#
# Runs the checks from .github/workflows/ci.yml.
#
#   ./scripts/test_ci.sh            # frontend job under act, rust checks on the host
#   ./scripts/test_ci.sh --no-act   # every check on the host, no containers
#   ./scripts/test_ci.sh --fix      # rewrite what can be rewritten, then run
#
# The rust checks never run under act. The catthehacker runner images are slim
# and carry no rust toolchain, where the hosted ubuntu-24.04 runner preinstalls
# one, so `rustup` is not found and the job dies at "Add rustfmt". Running them
# on the host also skips reinstalling the 179 cached webkit debs per run.
#
# --fix likewise writes to the working tree, never to a container, because a
# formatter that rewrites files inside a throwaway image fixes nothing.

set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

USE_ACT=1
FIX=0
EXTRA=()

while (($#)); do
  case "$1" in
    --no-act) USE_ACT=0 ;;
    --fix) FIX=1 ;;
    -h | --help)
      awk 'NR>1 && !/^#/ {exit} NR>1 {sub(/^# ?/, ""); print}' "${BASH_SOURCE[0]}"
      exit 0
      ;;
    *) EXTRA+=("$1") ;;
  esac
  shift
done

# Everything below is mirrored to a log, so a failure deep in an act run can be
# read back after the scrollback is gone.
LOG=.test_ci.log
exec > >(tee "$LOG") 2>&1

bold() { printf '\n\033[1m== %s\033[0m\n' "$*"; }
warn() { printf '\033[33m!! %s\033[0m\n' "$*" >&2; }

FAILED=()

# Runs one CI step, remembers the failure and keeps going, so one broken check
# does not hide the state of the others.
step() {
  local name="$1"
  shift
  bold "$name"
  if "$@"; then
    return 0
  fi
  warn "$name failed"
  FAILED+=("$name")
  return 1
}

report() {
  if ((${#FAILED[@]})); then
    printf '\n\033[31m%s check(s) failed:\033[0m\n' "${#FAILED[@]}"
    printf '  - %s\n' "${FAILED[@]}"
    printf 'full log: %s\n' "$LOG"
    exit 1
  fi
  printf '\n\033[32mall checks passed\033[0m\n'
  exit 0
}

# the ci.yml frontend job ------------------------------------------------

frontend_checks() {
  step "npm ci" npm ci --no-audit --no-fund

  # CI uses --with-deps, which shells out to apt-get. Off a Debian runner that
  # is either useless or destructive, so only the browser itself is fetched.
  step "playwright browser" npx playwright install chromium

  step "npm run check" npm run check
  step "npm run test" npm run test
  step "npm run build" npm run build
  step "playwright smoke test" npx playwright test
}

# the ci.yml rust job ----------------------------------------------------

rust_checks() {
  # CI apt-installs these; here they are only reported on, since the package
  # names differ per distro and installing them is the user's call.
  for pkg in webkit2gtk-4.1 gtk+-3.0 openssl; do
    pkg-config --exists "$pkg" ||
      warn "pkg-config cannot find $pkg - the cargo steps will likely fail"
  done

  # tauri_build reads src-tauri/dist, which is not in the repo. Under act the
  # frontend job built it inside its own container, so build it again here.
  step "npm run build" npm run build

  rustup component list --installed 2>/dev/null | grep -q '^rustfmt' ||
    step "rustup component add rustfmt" rustup component add rustfmt

  if ((FIX)); then
    bold "cargo fmt --check (already rewritten above)"
  else
    step "cargo fmt --check" cargo fmt --manifest-path src-tauri/Cargo.toml --check
  fi

  step "cargo check" cargo check --manifest-path src-tauri/Cargo.toml
}

# ------------------------------------------------------------------------

if ((FIX)); then
  bold "fix: cargo fmt"
  cargo fmt --manifest-path src-tauri/Cargo.toml ||
    { warn "cargo fmt could not run"; FAILED+=("cargo fmt (--fix)"); }
fi

if ((USE_ACT)); then
  # The shell alias the user has is not visible here, so look act up by path.
  ACT="$(command -v act || true)"
  [[ -x $ACT ]] || ACT="$HOME/.local/bin/act"
  if [[ ! -x $ACT ]]; then
    warn "act is not installed - use --no-act to run the checks directly"
    exit 127
  fi

  # .actrc supplies --reuse and the runner images.
  step "act: frontend job" "$ACT" push -W .github/workflows/ci.yml -j frontend "${EXTRA[@]}"
else
  ((${#EXTRA[@]} == 0)) || warn "ignoring act-only arguments: ${EXTRA[*]}"
  frontend_checks
fi

rust_checks
report
