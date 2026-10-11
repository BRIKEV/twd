---
title: Linting
description: Catch TWD test mistakes in the editor and in CI with twd-lint, before a browser run
---

# Linting

TWD tests run in the browser, so a mistake in a test is usually found by starting the dev server, running the suite and reading the failure. Many of those mistakes are visible in the source code: a missing `await`, `describe` imported from Vitest, an `it.only` left behind. [twd-lint](https://github.com/BRIKEV/twd-lint) reports them in a second, in your editor and in CI, and fixes the safe ones for you.

It is especially useful for AI agents: one command checks a test before spending a full browser run on it.

## Run it with no setup

```bash
npx twd-lint                     # every *.twd.test.* file in the current folder
npx twd-lint src/twd-tests       # a folder, or specific files
npx twd-lint --fix               # apply the safe fixes, then report what is left
npx twd-lint --format json       # machine-readable output, for tools and agents
```

`twd-lint` needs no ESLint and no config file. It ignores your project's own ESLint config, so it gives the same result whatever linter the project uses: ESLint, Biome, oxlint or none.

| Exit code | Meaning |
|---|---|
| `0` | No problems |
| `1` | Problems found |
| `2` | Usage error, or no TWD test files to lint |

## Add it to ESLint

If your project already uses ESLint (9 or 10, flat config), add the plugin so the mistakes are underlined in your editor as you type:

```bash
npm install --save-dev twd-lint
```

```js
// eslint.config.js
import twd from 'twd-lint'

export default [
  // ...your own config
  twd.configs.recommended,
]
```

`recommended` applies to `**/*.twd.test.{ts,tsx,js,jsx}` only, so it never touches your app code or your Vitest/Jest tests, and it brings its own TypeScript parser for those files.

## What it catches

| Rule | Reports | `--fix` |
|---|---|---|
| [`twd/no-missing-await`](https://github.com/BRIKEV/twd-lint/blob/main/docs/rules/no-missing-await.md) | An async TWD call that is not awaited: `twd.visit`, `twd.mockRequest`, `userEvent.click`, `screenDom.findBy*`, `twd.url().should`, … | ✅ |
| [`twd/runner-imports`](https://github.com/BRIKEV/twd-lint/blob/main/docs/rules/runner-imports.md) | `describe`, `it`, hooks or `expect` imported from Vitest, Jest, Mocha, `node:test` or `chai`, or from the wrong TWD module | ✅ |
| [`twd/no-request-body`](https://github.com/BRIKEV/twd-lint/blob/main/docs/rules/no-request-body.md) | `rule.request.body` on a `waitForRequest` result. `rule.request` already is the parsed body | |
| [`twd/no-focused-tests`](https://github.com/BRIKEV/twd-lint/blob/main/docs/rules/no-focused-tests.md) | `it.only` / `describe.only` left behind | |

```ts
// ❌ reported
import { describe, it, expect } from 'vitest'          // runner-imports
import { twd } from 'twd-js'

describe('Todos', () => {
  it.only('creates a todo', async () => {               // no-focused-tests
    twd.visit('/todos')                                 // no-missing-await
    const rule = await twd.waitForRequest('createTodo')
    expect(rule.request.body.title).to.equal('Buy milk') // no-request-body
  })
})
```

```ts
// ✅ clean
import { twd, expect } from 'twd-js'
import { describe, it } from 'twd-js/runner'

describe('Todos', () => {
  it('creates a todo', async () => {
    await twd.visit('/todos')
    const rule = await twd.waitForRequest('createTodo')
    expect(rule.request.title).to.equal('Buy milk')
  })
})
```

Every error message links to its rule's page, which explains why it matters and when to turn it off.

## Run it in CI

Add a step before the browser run, so a broken test fails in seconds:

```yaml
- name: Lint TWD tests
  run: npx twd-lint
```

If the project uses ESLint with `twd.configs.recommended`, your existing `npx eslint .` step already covers it.
