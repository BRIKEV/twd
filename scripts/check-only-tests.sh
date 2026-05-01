#!/usr/bin/env bash
set -e

PATTERN='(^|[^a-zA-Z0-9_])(it|test|describe|fit|fdescribe)\.only\('
FILES=$(git ls-files \
  'src/**/*.spec.ts' 'src/**/*.spec.tsx' \
  'src/tests/**/*.ts' 'src/tests/**/*.tsx' \
  'examples/*/src/**/*.spec.ts' 'examples/*/src/**/*.spec.tsx' \
  'examples/*/src/**/*.test.ts' 'examples/*/src/**/*.test.tsx' \
  2>/dev/null || true)

if [ -z "$FILES" ]; then
  exit 0
fi

# Filter out test files that intentionally test .only behavior
FILTERED_FILES=$(echo "$FILES" | grep -v -E 'src/tests/(runner|ui/twdSidebar)' || true)

if [ -z "$FILTERED_FILES" ]; then
  exit 0
fi

if echo "$FILTERED_FILES" | xargs grep -nE "$PATTERN" 2>/dev/null; then
  echo ""
  echo "Focused tests detected (it.only / describe.only / test.only)."
  echo "Remove them before committing."
  exit 1
fi

exit 0
