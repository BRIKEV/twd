# Linter + Husky Setup — Design

**Date:** 2026-05-01
**Branch:** `feat/linter-husky`
**Status:** Approved, pending implementation plan

## Motivation

The TWD project has consistent style today, but accepting external contributions has surfaced repeatable problems:

- Contributors leave focused tests (`it.only`, `describe.only`) in PRs — these slip into CI and silently skip the rest of the suite.
- Files committed from Windows machines flip line endings to CRLF, polluting diffs.
- Contributors' editor formatters reformat the maintainer's code on save (different quote style, indentation, trailing comma rules) without any committed config to defer to.

We want a setup that:

1. Blocks `.only` test focuses in `src/` **and** `examples/` (examples run in pipeline).
2. Forces LF line endings regardless of contributor OS.
3. Commits a format/style spec so contributors' "format on save" extensions read **our** rules instead of their personal defaults.
4. Does **not** force the maintainer to enable format-on-save. Their editor stays untouched.
5. Applies strict linting to the main project source. Examples stay lightly governed (only `.only` enforcement).

## Decisions Made During Brainstorming

| Decision | Choice | Why |
|---|---|---|
| Tooling stack | ESLint v9 + Prettier + `.editorconfig` + `.gitattributes` | Plugin ecosystem matters more than raw speed; project mixes React/Preact/Vue/Vitest |
| ESLint version | v9 (not v10) | v10 dropped Feb 2026; plugin ecosystem still catching up; flat config is the same regardless |
| Strictness for main `src/` | `tseslint.configs.recommendedTypeChecked` | Catches real bugs (floating promises, unsafe any) without forcing churn from `strict`/`strictTypeChecked` |
| Examples linting | Existing configs left alone; no new ESLint configs added to examples | Maintainer wants minimum yak-shaving in examples |
| `.only` enforcement in examples | Bash grep script (`scripts/check-only-tests.sh`) | One file, no devDeps in examples, future-proof for new example apps |
| Pre-commit behavior | `lint-staged` + `.only` grep only — no tests | CI is the real gate; pre-commit must stay fast (1-3s) |
| Format sweep | One commit on `src/` only, SHA added to `.git-blame-ignore-revs` | Examples are not reformatted; blame stays useful for real changes |
| CI integration | Add `lint` job parallel to `test` + `build` in `.github/workflows/ci.yml` | Standard pattern, no matrix needed |
| Prettier style | Single quotes (61% dominance in `src/`), 2-space, semi, trailing commas, 100 col, LF | Matches existing dominant style; minimizes diff in format sweep |

## Architecture

### Layers of defense

The setup is intentionally layered. Each layer catches a different failure mode, and a contributor cannot accidentally bypass all of them simultaneously.

| Layer | File(s) | What it catches | Bypassable? |
|---|---|---|---|
| Editor | `.editorconfig` | Indent, EOL, charset, trim trailing whitespace at edit time | Yes — but only by editors that ignore the file (rare) |
| Editor (formatters) | `.prettierrc.json` | Quote style, comma style, line width on save | Yes — only if contributor uses no Prettier-aware tooling |
| Git | `.gitattributes` | Forces LF on commit, classifies binary vs text | No — git enforces at commit-write time |
| Pre-commit | `.husky/pre-commit` → `lint-staged` + `check:only` | ESLint errors, Prettier diffs, `.only` test focuses | Yes — `git commit --no-verify` |
| CI | `.github/workflows/ci.yml` `lint` job | Everything pre-commit catches, plus `format:check` for unformatted files | No — required check, blocks merge |

The CI layer is the **real** gate. Pre-commit is a courtesy to catch issues before push.

### File inventory

New files added in this PR:

```
.editorconfig                       # universal editor norms
.gitattributes                      # force LF on commit
.prettierrc.json                    # Prettier config
.prettierignore                     # paths Prettier ignores
eslint.config.js                    # flat config, applies to src/
.git-blame-ignore-revs              # SHA of format sweep commit
.husky/pre-commit                   # pre-commit hook
scripts/check-only-tests.sh         # .only grep guard
specs/2026-05-01-linter-husky-design.md   # this file
```

Files modified:

```
package.json                        # devDeps + scripts + lint-staged config + prepare hook
.github/workflows/ci.yml            # add lint job
CONTRIBUTING.md                     # short note about ESLint + Prettier setup
```

Files explicitly **not** touched:

- `examples/twd-test-app/eslint.config.js` — leave the existing scaffolded config alone
- `examples/tutorial-example/eslint.config.js` — same
- `examples/vue-twd-example/` — no ESLint config added
- All files outside `src/` (no Prettier sweep beyond the main project)

## Configuration Details

### `eslint.config.js`

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

Key points:

- `prettier` import comes **last** so it disables any conflicting formatting rules from earlier configs.
- `parserOptions.projectService: true` enables the modern type-aware lookup (no need to enumerate `tsconfig.json` paths manually).
- `examples/` is in the `ignores` list — ESLint won't run there at all.
- `no-explicit-any` is `warn` not `error` to keep the rollout pragmatic. Can be tightened later.

### `.editorconfig`

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

### `.gitattributes`

```
* text=auto eol=lf
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.svg text
```

### `.prettierrc.json`

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

Style chosen to match the dominant pattern in current `src/` (single quotes ~61%, 2-space indent, semi present everywhere observed).

### `.prettierignore`

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

### `.husky/pre-commit`

```sh
npx lint-staged
npm run check:only
```

No husky v9 boilerplate header needed.

### `scripts/check-only-tests.sh`

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

Must be `chmod +x` after creation. Coverage impact: zero. Not imported, not executed by Vitest, lives outside the coverage glob (`src/`).

### `package.json` additions

```json
{
  "scripts": {
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,json,md}\"",
    "check:only": "scripts/check-only-tests.sh",
    "prepare": "husky"
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "src/**/*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

`devDependencies` to add:

- `eslint` (v9 latest)
- `@eslint/js`
- `typescript-eslint`
- `@vitest/eslint-plugin`
- `eslint-config-prettier`
- `prettier`
- `globals`
- `husky`
- `lint-staged`

### `.github/workflows/ci.yml` — new `lint` job

Add as a parallel job to `test` and `build`:

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

No matrix — lint output doesn't change across Node versions.

## Rollout Sequence

Single PR. Order matters:

1. **Scaffold configs.** Add `eslint.config.js`, `.prettierrc.json`, `.editorconfig`, `.gitattributes`, `.prettierignore`. No code touched. No format sweep yet. One commit: `chore: add eslint and prettier config`.

2. **Format sweep on `src/`.** Run `npx prettier --write src/`. Single commit: `style: apply prettier format to src/`. **Capture this SHA.**

3. **Add SHA to `.git-blame-ignore-revs`.** Commit: `chore: add format sweep to git blame ignore`. GitHub auto-respects this file — `git blame` skips the format commit, real authorship of lines is preserved.

4. **Run `npm run lint` and resolve errors.** `recommendedTypeChecked` will surface real issues. Fix them, or add targeted `// eslint-disable-next-line <rule> -- <reason>` comments where the rule is genuinely wrong. Do not blanket-disable. Commit: `chore: resolve eslint errors after enabling typed linting`.

5. **Wire husky.** Run `npx husky init`. Replace generated `.husky/pre-commit` content with the two-liner above. Add `scripts/check-only-tests.sh`, `chmod +x`. Add `lint-staged` config and `prepare` script to `package.json`. Commit: `chore: add husky pre-commit and lint-staged`.

6. **Add CI lint job.** Modify `.github/workflows/ci.yml`. Commit: `ci: add lint job`.

7. **Update `CONTRIBUTING.md`.** Short paragraph noting that ESLint + Prettier are required, pre-commit hooks run automatically, contributors should let their editor's Prettier extension read `.prettierrc` instead of using their own formatter. Commit: `docs: document linting and formatting workflow`.

Order rationale: configs first (so format sweep uses them), format sweep before lint fixes (so type-aware ESLint isn't fighting unformatted code), husky after configs are stable, CI last (so it lights up green on first push to the branch).

## What This PR Does NOT Include

- Linting examples beyond `.only` enforcement.
- Tightening to `tseslint.configs.strict` or `strictTypeChecked`.
- Commitlint / conventional-commit enforcement (separate concern; project already uses `conventional-changelog` manually).
- Tests in pre-commit (CI's job; pre-commit stays fast).
- Migration to ESLint v10 (ecosystem still on v9).
- `.vscode/settings.json` (don't force editor settings on contributors).
- Format sweep on examples (out of scope per maintainer preference).

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `recommendedTypeChecked` finds many existing issues, blocks rollout | Step 4 of rollout: fix or targeted-disable with reason. Do not merge with `eslint-disable` blanket comments. |
| Format sweep diff is huge, hard to review | Isolated commit; only mechanical changes; blame-ignore prevents future pollution. Reviewer reviews other commits as normal, treats format commit as opaque. |
| Contributors hit slow `npm install` from husky postinstall | One-time cost. `prepare` script handles transparently. Documented in CONTRIBUTING.md. |
| Type-aware ESLint slow in editor | Expected for `src/` size (~5-10s full lint). IDE typically caches. If genuinely painful, can disable type-aware rules in editor only via `tsconfigRootDir` tricks — out of scope here. |
| Dependabot churn from many new devDeps | Accepted cost. ESLint v9 minor bumps rarely break flat config. Pin majors via Dependabot config if it gets noisy. |
| Contributor force-pushes with `--no-verify` | CI lint job is the real gate. Pre-commit is best-effort. |
| Future example apps need `.only` enforcement | `scripts/check-only-tests.sh` already globs `examples/*/src/**` — new examples are covered automatically as long as they put tests under `src/`. |

## Future Considerations

Out of scope for this PR but worth noting:

- **Migrate to ESLint v10** when `typescript-eslint` and `@vitest/eslint-plugin` declare full v10 peer support. Estimated 3-6 months out.
- **Tighten to `strict` or `strictTypeChecked`** once `recommended` baseline is stable and contributors are used to the rules.
- **Add `eslint-plugin-import`** if import-ordering becomes a real concern (not currently a pain point).
- **Add commitlint** if PR titles / commit messages start drifting from conventional format (currently manual but consistent).
- **Lint examples uniformly** if a future contributor PR introduces an example-only bug class. Not currently justified.
