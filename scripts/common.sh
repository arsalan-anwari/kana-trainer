set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export NO_STRIP="${NO_STRIP:-true}"

say() {
  printf '\n==> %s\n' "$1"
}

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "missing required tool: $1" >&2
    exit 1
  fi
}

ensure_deps() {
  if [ ! -d node_modules ]; then
    say "Installing node packages"
    npm install
  fi
}

app_version() {
  node -p "require('$ROOT/package.json').version"
}
