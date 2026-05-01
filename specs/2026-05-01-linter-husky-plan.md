# Linter + Husky Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ESLint v9 (flat config) + Prettier + Husky pre-commit + CI lint job to the `twd-js` main project, plus a cross-cutting `.only` grep guard that also covers `examples/`.

**Architecture:** Layered defense — `.editorconfig` and `.gitattributes` enforce universal norms at the editor/git level; `.prettierrc.json` is committed so contributors' format-on-save defers to project rules; ESLint with `recommendedTypeChecked` runs only on `src/`; a bash script catches `it.only` everywhere; husky pre-commit runs `lint-staged` + the script; CI runs `lint` + `format:check` + `check:only` as a parallel job.

**Tech Stack:** ESLint v9 (latest), `typescript-eslint`, `@vitest/eslint-plugin`, `eslint-config-prettier` (`/flat` subpath), Prettier v3+, Husky v9+, lint-staged v15+, GitHub Actions.

**Spec:** `specs/2026-05-01-linter-husky-design.md`

**Branch:** `feat/linter-husky` (already exists, currently empty)

---

## File Structure

**Created:**
- `.editorconfig` — universal editor norms (LF, 2-space, UTF-8, trim trailing whitespace)
- `.gitattributes` — git-level enforcement of LF and binary classification
- `.prettierrc.json` — Prettier rules (single quotes, 100 col, trailing comma all)
- `.prettierignore` — paths Prettier skips
- `eslint.config.js` — flat config, applies to `src/` only; ignores `examples/`
- `.git-blame-ignore-revs` — captures format-sweep SHA so blame skips it
- `.husky/pre-commit` — runs `lint-staged` + `check:only`
- `scripts/check-only-tests.sh` — bash grep guard for focused tests across `src/` and `examples/`

**Modified:**
- `package.json` — devDeps, scripts (`lint`, `lint:fix`, `format`, `format:check`, `check:only`, `prepare`), `lint-staged` config
- `.github/workflows/ci.yml` — add `lint` job parallel to `test` and `build`
- `CONTRIBUTING.md` — short paragraph describing the lint/format workflow

**Not touched:**
- Anything under `examples/*/` (no new ESLint configs, no Prettier sweep)
- All source files except where Task 5 forces lint fixes

---

## Task 1: Add editor & git layer config

**Files:**
- Create: `.editorconfig`
- Create: `.gitattributes`
- Create: `.prettierrc.json`
- Create: `.prettierignore`

These four files are the "passive" layer. They don't depend on npm packages. They take effect immediately for any editor/git operation. We add them first so subsequent steps (format sweep) operate under them.

- [ ] **Step 1: Create `.editorconfig`**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 2: Create `.gitattributes`**

```
* text=auto eol=lf
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.svg text
```

- [ ] **Step 3: Create `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf",
  "arrowParens": "always",
  "bracketSpacing": true
}
```

- [ ] **Step 4: Create `.prettierignore`**

```
dist/
coverage/
node_modules/
examples/
docs/.vitepress/cache/
*.min.js
package-lock.json
CHANGELOG.md
```

- [ ] **Step 5: Verify line endings on the four new files are LF**

Run: `file .editorconfig .gitattributes .prettierrc.json .prettierignore`
Expected: each line ends with "ASCII text" — no "with CRLF line terminators".

- [ ] **Step 6: Stop git from re-normalizing existing files yet**

`.gitattributes` could trigger git to renormalize line endings of existing tracked files. We do NOT want that side effect mixed into this commit. Verify nothing else is dirty:

Run: `git status`
Expected: only the 4 new files are listed as untracked. No "modified" entries for unrelated files.

If git wants to renormalize other files, defer that to the format sweep in Task 3. Do **not** stage those changes here.

- [ ] **Step 7: Commit**

```bash
git add .editorconfig .gitattributes .prettierrc.json .prettierignore
git commit -m "chore: add editorconfig, gitattributes, and prettier config"
```

---

## Task 2: Install ESLint and Prettier, scaffold flat config

**Files:**
- Create: `eslint.config.js`
- Modify: `package.json`

- [ ] **Step 1: Install Prettier first (no peer-dep entanglement)**

Run:
```bash
npm install --save-dev prettier
```

Expected: Prettier installs cleanly, no warnings about peer deps.

- [ ] **Step 2: Install ESLint and core deps**

Run:
```bash
npm install --save-dev eslint @eslint/js typescript-eslint globals
```

Expected: ESLint v9.x installs. Note the version installed — `npm list eslint` should show `eslint@9.x.x`. If it installs v10.x, **uninstall and pin to v9 latest**:
```bash
npm uninstall eslint && npm install --save-dev eslint@^9
```

Reason: plugin ecosystem (`@vitest/eslint-plugin`, `eslint-config-prettier`) may not declare ESLint v10 peer compatibility yet.

- [ ] **Step 3: Install plugin and Prettier config**

Run:
```bash
npm install --save-dev @vitest/eslint-plugin eslint-config-prettier
```

Expected: clean install. If `@vitest/eslint-plugin` warns about peer deps, accept (Vitest is already a devDep at v4.x).

- [ ] **Step 4: Verify all 7 packages are in `package.json` devDependencies**

Run: `node -e "console.log(Object.keys(require('./package.json').devDependencies).filter(k => /eslint|prettier|typescript-eslint|globals|@vitest\/eslint-plugin|@eslint\/js/.test(k)).sort())"`

Expected output:
```
[ '@eslint/js', '@vitest/eslint-plugin', 'eslint', 'eslint-config-prettier', 'globals', 'prettier', 'typescript-eslint' ]
```

- [ ] **Step 5: Create `eslint.config.js` at repo root**

```js
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import vitest from '@vitest/eslint-plugin';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

export default defineConfig(
  {
    ignores: [
      'dist/',
      'coverage/',
      'node_modules/',
      'examples/',
      'docs/.vitepress/cache/',
      '**/*.d.ts',
      'src/cli/installsw.js',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.spec.{ts,tsx}', 'src/tests/**/*.{ts,tsx}'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-focused-tests': 'error',
    },
    languageOptions: {
      globals: { ...vitest.environments.env.globals },
    },
  },
  prettier,
);
```

- [ ] **Step 6: Add lint and format scripts to `package.json`**

In the `"scripts"` block of `package.json`, **add** these entries (do NOT remove existing entries):

```json
"lint": "eslint src",
"lint:fix": "eslint src --fix",
"format": "prettier --write \"src/**/*.{ts,tsx,js,json,md}\"",
"format:check": "prettier --check \"src/**/*.{ts,tsx,js,json,md}\"",
```

Place them after the `"test:ci"` line for grouping with quality scripts.

- [ ] **Step 7: Verify ESLint loads its config without error**

Run: `npx eslint --print-config src/index.ts > /tmp/eslint-config-dump.json && echo OK`

Expected: `OK` printed. The dump file will be ~200KB+ — that's normal.

If this fails with module resolution errors, the most likely cause is a typo in one of the imports or package versions. Re-check Step 4.

- [ ] **Step 8: Run lint once (errors expected — that's fine here)**

Run: `npm run lint || true`

Expected: ESLint runs to completion. Output may contain errors and warnings — that's normal at this stage. We resolve them in Task 5. The point of this step is just to confirm the config is loadable and the plugins are wired correctly.

If you see `Parsing error: Cannot find module 'typescript'` or similar, run `npm install typescript --save-dev` (TypeScript should already be there but may have been hoisted to a wrong version).

- [ ] **Step 9: Commit**

```bash
git add eslint.config.js package.json package-lock.json
git commit -m "chore: add eslint flat config and prettier scripts"
```

---

## Task 3: Format sweep on `src/`

**Files:**
- Modified: every file matching `src/**/*.{ts,tsx,js,json,md}`

This is the single mechanical commit that brings `src/` into Prettier compliance. Examples are NOT touched.

- [ ] **Step 1: Confirm working tree is clean**

Run: `git status`
Expected: clean (or only the changes from Task 1+2 are committed). If anything else is dirty, stash or commit it before proceeding — we want this commit to be **only** the format sweep.

- [ ] **Step 2: Run the format sweep**

Run: `npx prettier --write "src/**/*.{ts,tsx,js,json,md}"`

Expected: a list of files written. Many will be `src/**/*.ts` and `src/**/*.tsx`. Time: 5-15s.

- [ ] **Step 3: Sanity check the diff**

Run: `git diff --stat | tail -5`

Expected: many files changed, but each diff is small (quote style, trailing commas, line widths). No semantic changes. Spot-check 2-3 files with `git diff src/twd.ts` to confirm.

- [ ] **Step 4: Verify `format:check` passes**

Run: `npm run format:check`
Expected: `All matched files use Prettier code style!` (exit 0).

- [ ] **Step 5: Run tests to confirm format sweep didn't break anything**

Run: `npm test -- --run`
Expected: full test suite passes. Prettier should never change semantics, but a bug in our config (e.g., wrong `printWidth` causing JSX to break) could in theory. Verify.

- [ ] **Step 6: Commit**

```bash
git add -u src/
git commit -m "style: apply prettier format sweep to src/"
```

- [ ] **Step 7: Capture the SHA for Task 4**

Run: `git rev-parse HEAD`
**Save this SHA** — it goes into `.git-blame-ignore-revs` in the next task.

---

## Task 4: Add format-sweep SHA to `.git-blame-ignore-revs`

**Files:**
- Create: `.git-blame-ignore-revs`

GitHub's blame UI and `git blame --ignore-revs-file` will both skip the format-sweep commit so authorship of real lines is preserved.

- [ ] **Step 1: Create `.git-blame-ignore-revs`**

Replace `<SHA>` with the SHA captured at the end of Task 3.

```
# Format sweep — applied prettier to src/ on 2026-05-01
# Skip this commit when running `git blame`
<SHA>
```

- [ ] **Step 2: Verify SHA is real**

Run: `git cat-file -t <SHA>`
Expected: `commit`.

- [ ] **Step 3: Test blame ignores it locally**

Run: `git blame --ignore-revs-file=.git-blame-ignore-revs src/twd.ts | head -5`
Expected: lines are attributed to their original commits, not the format-sweep SHA.

- [ ] **Step 4: Commit**

```bash
git add .git-blame-ignore-revs
git commit -m "chore: add format sweep to git blame ignore revs"
```

GitHub will automatically detect and respect this file in its blame UI — no other configuration needed.

---

## Task 5: Resolve ESLint errors

**Files:**
- Modify: any file in `src/` flagged by `npm run lint`

`recommendedTypeChecked` will surface real issues. Address each one. Time-bounded: if a single file produces >10 errors of the same rule, prefer one targeted disable with a reason over fixing the rule wholesale (that becomes a separate PR).

- [ ] **Step 1: Run lint and capture output**

Run: `npm run lint > /tmp/lint-errors.txt 2>&1; echo "exit=$?"`

Note the exit code and total error count. If exit=0, **skip to Step 4**.

- [ ] **Step 2: Triage errors by category**

Read `/tmp/lint-errors.txt`. Group errors by rule name:

```bash
grep -oE '@typescript-eslint/[a-z-]+' /tmp/lint-errors.txt | sort | uniq -c | sort -rn
```

Common results from `recommendedTypeChecked`:
- `@typescript-eslint/no-floating-promises` — `await` it, or `void` it explicitly
- `@typescript-eslint/no-unsafe-assignment` — narrow the type or cast at boundary
- `@typescript-eslint/no-unsafe-member-access` — same
- `@typescript-eslint/no-misused-promises` — usually a forgotten `await` in event handlers
- `@typescript-eslint/no-explicit-any` — only `warn` in our config; not blocking

- [ ] **Step 3: Fix errors file by file**

For each file with errors:

1. Read the file.
2. For each error, prefer a real fix (add `await`, narrow type, use proper return type) over a disable comment.
3. If a fix would require non-trivial refactoring of unrelated code, add a targeted disable with a reason:

```ts
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- chai's expect() returns any by design
```

Do NOT add file-level `/* eslint-disable */` blanket disables. Do NOT lower a rule's severity in `eslint.config.js` to dodge errors — fix or targeted-disable.

After each batch of fixes, re-run: `npm run lint`. Track remaining error count downward.

- [ ] **Step 4: Verify lint exits 0**

Run: `npm run lint`
Expected: no errors. Warnings (e.g., `no-explicit-any`) are acceptable.

- [ ] **Step 5: Run tests to confirm no regressions**

Run: `npm test -- --run`
Expected: full suite passes. Some lint fixes (e.g., adding `await`) can change behavior — verify.

- [ ] **Step 6: Commit**

```bash
git add -u src/
git commit -m "chore: resolve eslint errors after enabling typed linting"
```

---

## Task 6: Add `.only` grep guard script

**Files:**
- Create: `scripts/check-only-tests.sh`
- Modify: `package.json` (add `check:only` script)

- [ ] **Step 1: Create `scripts/` directory if it doesn't exist**

Run: `mkdir -p scripts`

- [ ] **Step 2: Create `scripts/check-only-tests.sh`**

```sh
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

if echo "$FILES" | xargs grep -nE "$PATTERN" 2>/dev/null; then
  echo ""
  echo "Focused tests detected (it.only / describe.only / test.only)."
  echo "Remove them before committing."
  exit 1
fi

exit 0
```

- [ ] **Step 3: Make the script executable**

Run: `chmod +x scripts/check-only-tests.sh`

- [ ] **Step 4: Add `check:only` script to `package.json`**

In the `"scripts"` block, add (after `format:check`):

```json
"check:only": "scripts/check-only-tests.sh",
```

- [ ] **Step 5: Test the script with a real focused test**

This is a behavior verification — we want to confirm the script catches `.only`. Create a temporary test file:

Run:
```bash
mkdir -p /tmp/twd-test-only && cat > /tmp/twd-test-only/sample.spec.ts << 'EOF'
import { it } from 'vitest';

it.only('should be caught by check-only', () => {});
EOF
```

Now stage that file inside the repo as if it were a real test:
```bash
cp /tmp/twd-test-only/sample.spec.ts src/tests/__check_only_test_temp.spec.ts
git add src/tests/__check_only_test_temp.spec.ts
```

Run: `npm run check:only`

Expected: exits with code 1, prints the line number of the `.only` and "Focused tests detected".

Now clean up:
```bash
git rm -f src/tests/__check_only_test_temp.spec.ts
rm -rf /tmp/twd-test-only
```

- [ ] **Step 6: Verify script passes when no `.only` exists**

Run: `npm run check:only`

Expected: exits 0, no output.

- [ ] **Step 7: Commit**

```bash
git add scripts/check-only-tests.sh package.json
git commit -m "chore: add check-only-tests script for focused test guard"
```

---

## Task 7: Install Husky and lint-staged, wire pre-commit hook

**Files:**
- Create: `.husky/pre-commit`
- Modify: `package.json` (add `husky`, `lint-staged` to devDeps; add `prepare` script; add `lint-staged` config block)

- [ ] **Step 1: Install Husky and lint-staged**

Run:
```bash
npm install --save-dev husky lint-staged
```

Expected: clean install. `husky` v9.x and `lint-staged` v15.x or later.

- [ ] **Step 2: Initialize Husky**

Run:
```bash
npx husky init
```

Expected: creates `.husky/pre-commit` (with a default `npm test` line) and adds `"prepare": "husky"` to `package.json` scripts.

- [ ] **Step 3: Replace `.husky/pre-commit` content**

Open `.husky/pre-commit` and replace its entire contents with:

```sh
npx lint-staged
npm run check:only
```

No header, no shebang — Husky v9 doesn't need them. Two lines, that's it.

- [ ] **Step 4: Add `lint-staged` config to `package.json`**

Add this top-level key to `package.json` (alongside `"scripts"`, `"devDependencies"`, etc.):

```json
"lint-staged": {
  "src/**/*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "src/**/*.{json,md}": [
    "prettier --write"
  ]
}
```

- [ ] **Step 5: Verify `prepare` script exists**

Run: `node -e "console.log(require('./package.json').scripts.prepare)"`
Expected: `husky`

- [ ] **Step 6: Verify `.husky/pre-commit` is executable**

Run: `ls -la .husky/pre-commit`
Expected: line starts with `-rwxr-xr-x` or similar (executable bit set). If not, run `chmod +x .husky/pre-commit`.

- [ ] **Step 7: Test the pre-commit hook with a real commit attempt**

Stage a test file with `.only` (to confirm the hook **blocks** the commit):

```bash
cat > src/tests/__hook_test.spec.ts << 'EOF'
import { it } from 'vitest';
it.only('hook test', () => {});
EOF
git add src/tests/__hook_test.spec.ts
git commit -m "test: should be blocked by hook"
```

Expected: commit is rejected, output mentions "Focused tests detected".

Clean up:
```bash
git rm -f src/tests/__hook_test.spec.ts
rm -f src/tests/__hook_test.spec.ts
```

- [ ] **Step 8: Test the pre-commit hook on a normal-looking change**

Confirm working tree is clean before this test (so the cleanup step at the end can't lose unrelated work):

```bash
git status
```

Expected: clean. If not, stash first.

Now make a trivial whitespace change, stage it, and commit:

```bash
echo "" >> README.md
git add README.md
git commit -m "test: hook smoke check"
```

Expected: lint-staged runs (visible output: ESLint --fix on staged TS files, Prettier --write), check:only runs and exits 0, commit succeeds.

Discard the test commit safely (mixed reset preserves working tree, then explicitly restore the file we touched):

```bash
git reset HEAD~1
git restore README.md
```

- [ ] **Step 9: Commit the husky + lint-staged setup**

```bash
git add .husky/pre-commit package.json package-lock.json
git commit -m "chore: add husky pre-commit and lint-staged"
```

---

## Task 8: Add `lint` job to CI workflow

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Read current `.github/workflows/ci.yml`**

Confirm it has 3 jobs: `test` (matrix), `build`, `coverage`. We'll add `lint` parallel to them.

- [ ] **Step 2: Add the `lint` job**

Insert this job in `.github/workflows/ci.yml`, between the `test` job and the `build` job (or anywhere among the top-level jobs — order doesn't affect parallelism, but readability matters):

```yaml
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 24.x
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format:check

      - name: Check for focused tests
        run: npm run check:only
```

- [ ] **Step 3: Validate YAML syntax**

Run:
```bash
node -e "const yaml = require('js-yaml'); yaml.load(require('fs').readFileSync('.github/workflows/ci.yml', 'utf8')); console.log('OK')"
```

If `js-yaml` isn't installed (it's not a project dep), use Python instead:
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); print('OK')"
```

Expected: `OK`.

- [ ] **Step 4: Verify the `lint` job is registered**

Run:
```bash
grep -c '^  lint:' .github/workflows/ci.yml
```
Expected: `1`.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint job for eslint, prettier, and focused-test checks"
```

---

## Task 9: Document the workflow in `CONTRIBUTING.md`

**Files:**
- Modify: `CONTRIBUTING.md`

- [ ] **Step 1: Read current `CONTRIBUTING.md`**

Find a logical place — typically after the "Development Workflow" section — to add the new section.

- [ ] **Step 2: Append the new section**

Add this section:

```markdown
## Code Style and Linting

This project uses **ESLint** + **Prettier** for the main library source (`src/`). Examples are not strictly linted, but `it.only` / `describe.only` is blocked everywhere.

### What runs automatically

When you run `npm install`, Husky sets up a Git pre-commit hook that:

1. Runs ESLint with `--fix` and Prettier with `--write` on staged `src/` files.
2. Greps the entire repo for focused tests (`it.only`, `describe.only`, etc.) and rejects the commit if any are found.

You don't need to enable format-on-save in your editor. The hook handles formatting at commit time.

### If your editor has a different formatter

Most editors with Prettier extensions auto-detect `.prettierrc.json` and use the project's rules. If you have another formatter (Beautify, ESLint formatter plugin, etc.) set as default, please either:

- Install the Prettier extension and let it own formatting, OR
- Disable format-on-save in this project (add a `.vscode/settings.json` override locally — do not commit it).

The committed `.editorconfig` ensures correct indent / EOL / charset regardless of your editor.

### Manual commands

```bash
npm run lint            # check src/ for ESLint errors
npm run lint:fix        # auto-fix what ESLint can
npm run format          # apply Prettier to src/
npm run format:check    # verify src/ is Prettier-clean (used by CI)
npm run check:only      # grep for focused tests across src/ and examples/
```

### CI

Every PR runs a `lint` job that calls `lint`, `format:check`, and `check:only`. PRs that fail any of these are blocked from merging.
```

- [ ] **Step 3: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: document linting and formatting workflow"
```

---

## Final verification

After all 9 tasks are complete, run a full verification pass:

- [ ] **Step 1: Run all checks locally**

Run:
```bash
npm run lint && npm run format:check && npm run check:only && npm test -- --run
```

Expected: all four pass.

- [ ] **Step 2: Push the branch and watch CI**

```bash
git push -u origin feat/linter-husky
```

Open the GitHub Actions tab. Confirm the `lint` job appears alongside `test` and `build`, and all three pass.

- [ ] **Step 3: Open a PR**

Title: `chore: add eslint, prettier, husky pre-commit, and CI lint job`

Body should reference the design spec at `specs/2026-05-01-linter-husky-design.md` and summarize the layered defense approach.

---

## Out of scope

The following are explicitly **not** addressed by this plan and should be separate PRs/issues:

- Migrating to ESLint v10 (do this once `typescript-eslint` and `@vitest/eslint-plugin` declare v10 peer compatibility).
- Tightening to `tseslint.configs.strict` or `strictTypeChecked`.
- Adding `eslint-plugin-import` for import ordering.
- Adding commitlint / conventional-commit enforcement.
- Linting examples beyond `.only`.
- Format sweep on examples or any non-`src/` directory.
- Configuring Dependabot version pinning (handle if churn becomes painful).
