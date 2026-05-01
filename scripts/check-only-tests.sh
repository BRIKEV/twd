#!/usr/bin/env bash
set -e

# Catch focused tests left in commits across src/ and examples/.
#
# The leading [^a-zA-Z0-9_.] excludes member-access calls like `twd.it.only(`
# which TWD's own runner-tests use legitimately to test TWD's `.only` behavior.
PATTERN='(^|[^a-zA-Z0-9_.])(it|test|describe|fit|fdescribe)\.only\('

FILES=$(git ls-files \
  'src/**/*.spec.ts' 'src/**/*.spec.tsx' \
  'src/tests/**/*.ts' 'src/tests/**/*.tsx' \
  'examples/*/src/**/*.spec.ts' 'examples/*/src/**/*.spec.tsx' \
  'examples/*/src/**/*.test.ts' 'examples/*/src/**/*.test.tsx' \
  2>/dev/null || true)

if [ -z "$FILES" ]; then
  exit 0
fi

if echo "$FILES" | xargs grep -nE "$PATTERN" 2>/dev/null; then
  echo ""
  echo "Focused tests detected (it.only / describe.only / test.only)."
  echo "Remove them before committing."
  exit 1
fi

exit 0
