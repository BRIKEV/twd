#!/usr/bin/env bash
# Type-checks the published package the way a consumer sees it: installs the
# packed tarball into an empty ESM project and compiles
# scripts/consumer-types/consumer.ts under each moduleResolution mode.
#
# Usage: scripts/check-consumer-types.sh [path/to/twd-js.tgz]
# Without an argument it runs `npm pack` on the current dist/ (build first).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

if [ $# -ge 1 ]; then
  TARBALL="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
else
  npm pack --pack-destination "$WORK" --silent > /dev/null
  TARBALL="$(ls "$WORK"/*.tgz)"
fi

TS_VERSION="$(node -p "require('$ROOT/package.json').devDependencies.typescript")"

cd "$WORK"
cat > package.json <<'EOF'
{ "name": "twd-consumer-types", "private": true, "type": "module" }
EOF
npm install "$TARBALL" "typescript@$TS_VERSION" @types/react @types/react-dom @types/node vite \
  --no-audit --no-fund --ignore-scripts --silent
cp "$ROOT/scripts/consumer-types/consumer.ts" .

status=0
for mode in nodenext node16 bundler; do
  if [ "$mode" = "bundler" ]; then module="esnext"; else module="$mode"; fi
  cat > tsconfig.json <<EOF
{
  "compilerOptions": {
    "module": "$module",
    "moduleResolution": "$mode",
    "target": "es2022",
    "lib": ["dom", "es2022"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": false,
    "types": ["node"]
  },
  "files": ["consumer.ts"]
}
EOF
  if npx tsc -p tsconfig.json; then
    echo "OK: moduleResolution=$mode"
  else
    echo "FAIL: moduleResolution=$mode"
    status=1
  fi
done

exit $status
