---
title: CI Execution
description: Run TWD tests in headless CI environments with twd-cli, Puppeteer, and GitHub Actions
---

# CI Execution

Use the `twd-cli` package to run TWD tests in headless CI environments. It wraps Puppeteer, waits for your app, executes all tests, and reports coverage. It exits with a non-zero status code when a test fails, so it integrates directly into any CI/CD pipeline.

You can find the source code, release notes, and issue tracker at [github.com/BRIKEV/twd-cli](https://github.com/BRIKEV/twd-cli).

### Install

```bash
npm install twd-cli
```

or run it directly:

```bash
npx twd-cli run
```

### How It Works

Puppeteer is **not** used as a testing framework — it simply provides a headless browser to load your application. Once the page loads, all test execution happens inside the real browser context through the TWD runner.

1. Launches a headless browser via Puppeteer
2. Navigates to your dev server URL
3. Waits for the app and TWD sidebar to be ready
4. TWD's in-browser test runner executes all tests against the real DOM
5. Collects the results and writes the [run report](#run-report)
6. Validates collected mocks against OpenAPI contracts (if [configured](/contract-testing))
7. Optionally collects code coverage data
8. Exits with appropriate code (0 for success, 1 for failures)

### Configure (optional)

Create `twd.config.json` in your repo to customize the runner:

```json
{
  "url": "http://localhost:5173",
  "timeout": 10000,
  "coverage": true,
  "coverageDir": "./coverage",
  "nycOutputDir": "./.nyc_output",
  "headless": true,
  "viewport": { "width": 1280, "height": 800 },
  "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"],
  "retryCount": 2,
  "protocolTimeout": 300000,
  "maxFailures": 10,
  "chunkSize": 10,
  "contracts": [],
  "report": { "dir": ".twd/report", "formats": ["html", "markdown"] }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | `"http://localhost:5173"` | Dev server URL to open before running tests |
| `timeout` | number | `10000` | Milliseconds to wait for the page/sidebar |
| `coverage` | boolean | `true` | Toggle code coverage collection |
| `coverageDir` | string | `"./coverage"` | Output folder for coverage reports |
| `nycOutputDir` | string | `"./.nyc_output"` | NYC temp folder |
| `headless` | boolean | `true` | Run Chrome in headless mode |
| `viewport` | object | `{ width: 1280, height: 800 }` | Browser viewport, set explicitly on every run so [layout snapshots](/layout-snapshots) stay reproducible. `record.viewport` wins while [recording](/recording) |
| `puppeteerArgs` | string[] | `["--no-sandbox", "--disable-setuid-sandbox"]` | Extra arguments for Puppeteer |
| `retryCount` | number | `2` | Number of times to attempt each test before reporting failure. Default is 2 (one normal attempt + one retry). Set to 1 to disable retries. |
| `protocolTimeout` | number | `300000` | Puppeteer CDP `protocolTimeout` in ms (5 min). Tests run in chunks, so this bounds a **single chunk's browser call**, not the entire run. Raise it (e.g. `600000`) for slow CI or if individual chunks hang. `0` means no timeout. |
| `maxFailures` | number | `10` | Stop the run once this many tests have failed in total. The CLI prints the results gathered so far and exits non-zero. Set `0` to disable and always run every test. Note this limit is **per shard** when [sharding](/sharding). |
| `chunkSize` | number | `10` | How many tests run per browser call. Smaller values make the failure limit and timeouts more granular (less work lost if one chunk hangs), larger values reduce overhead. `0` runs everything in one call. |
| `contracts` | object[] | `[]` | OpenAPI contract validation specs. See [Contract Testing](/contract-testing) |
| `report` | object \| `false` | `{ "dir": ".twd/report", "formats": ["html", "markdown"] }` | The [run report](#run-report) folder and the views written next to `run.json`. `false` disables it |
| `record` | object | see [Recording Runs](/recording) | Video recording settings |

## Run report

Every `npx twd-cli run` writes a report folder, `.twd/report/` by default, and the
last line of the run points at it:

```
  Report: .twd/report/index.html
```

```
.twd/report/
  run.json       # the machine-readable result
  index.html     # open in a browser: failures, recordings, layout snapshot diffs
  summary.md     # only what broke, sized for a PR comment or a job summary
  recordings/    # video clips, when --record is set
  snapshots/     # layout snapshot captures, for a run with a failure
```

The folder is rewritten on every run, so add it to your `.gitignore`:

```
# .gitignore
.twd/
```

### `index.html` and `summary.md`

`index.html` is for a person. It opens on the verdict, then one "Needs attention"
list with the failed tests, layout snapshot diffs and contract errors, each with
its evidence inline. Every test, the contract results by spec, and the artifacts
follow in collapsed sections. It is a single file that works offline.

`summary.md` lists only what broke, capped at 20 entries, so it fits in a pull
request comment. A green run is a heading and a counts table.

### `run.json`

An AI agent or a script reads `run.json` rather than parsing the console output.

```json
{
  "outcome": "failed",
  "summary": {
    "passed": 41, "failed": 1, "skipped": 0, "notRun": 0, "stoppedEarly": false,
    "contracts": { "passed": 12, "errors": 0, "warnings": 1, "skipped": 0 }
  },
  "error": null,
  "tests": [
    {
      "path": "Todo list > should create a todo",
      "status": "fail",
      "attempts": 3,
      "error": "AssertionError: expected 3 rows to have length 4 (at http://localhost:5173/todos)"
    },
    { "path": "Todo list > should filter completed", "status": "pass", "attempts": 2 }
  ]
}
```

- **`outcome`** is `passed`, `failed` or `interrupted`, and it always agrees with
  the exit code. A contract error in `error` mode makes a run `failed` even when
  every test passed, so a dashboard cannot read green on a red build.
- **`interrupted`** means the run never finished: the dev server was unreachable,
  the sidebar never appeared, a `--test` filter matched nothing, or the run
  crashed. `error.message` says what happened, `error.diagnostic` names the fix
  when there is one, and `tests` holds whatever finished first.
- **`tests[]`** carries each test's `path` (the `"Suite > test"` string `--test`
  matches), `status`, `attempts` and, for a failure, its `error`. A passing test
  with `attempts` above 1 passed on a retry.
- **`summary`** holds the precomputed counts, contracts included.

### Printing a saved report

`twd-cli report` prints a report to stdout, for example into a GitHub job summary:

```bash
npx twd-cli report --format markdown >> "$GITHUB_STEP_SUMMARY"
```

It reads `.twd/report` unless you pass another folder or a `run.json` path.
`--format` takes `markdown` (the default), `html` or `json`. It exits `1` only
when the report is missing or unreadable, never because the run it describes
failed.

### Configuring the report

```json
{
  "report": {
    "dir": ".twd/report",
    "formats": ["html", "markdown"]
  }
}
```

`run.json` is always written; `formats` picks the views written next to it. Set
`"report": false` to turn the folder off. Two flags override the config for one
run:

```bash
npx twd-cli run --report-dir ./ci-report   # write it somewhere else
npx twd-cli run --no-report                # skip it this time
```

Each run replaces the folder. To keep one run's report while you run others, give
it its own `--report-dir`. Cleaning only removes the files twd-cli writes, and
only in a folder that already holds a `run.json`, so pointing `report.dir` at a
folder of your own is safe. Writing the report never changes the exit code: a
failure there is a warning.

## Filtering tests

Run only a subset of tests with the repeatable `--test` flag. Matching is
**case-insensitive** and matches a **substring** of each test's full
`"Suite > test name"` path:

```bash
# Every test whose name contains "shows error"
npx twd-cli run --test "shows error"

# Because matching uses the full "suite > test" path, passing a describe name
# runs every test inside that describe block:
npx twd-cli run --test "Login"

# Multiple --test flags are combined with OR (a test runs if it matches any):
npx twd-cli run --test "Login" --test "Signup"
```

Two things to know:

- If no test matches any filter, the run exits with code `1` and prints
  `No tests matched filter(s): ...`, so a typo will not silently look like a pass.
  Its report has `outcome: "interrupted"`.
- Code coverage collection is skipped while a `--test` filter is active, since a
  filtered run is a partial (debug) run.

`--test` and `--shard` compose. Filters resolve first, then the filtered list is
sharded. See [Sharding](/sharding).

::: tip
This is the same runner and the same `--test` flag your AI agent uses while it works —
see [Get started with AI agents](/ai-overview).
:::

### Running only the tests a branch changed

`--changed-since <ref>` works the filter out from git rather than having you type
it: it runs the tests the current branch added or changed.

```bash
# Every test this branch added or changed since main
npx twd-cli run --changed-since main

# In CI, against the pull request's base commit
npx twd-cli run --changed-since "$BASE_SHA"
```

What it selects, precisely:

- Titles come from **added lines only**, in files matching `*.twd.test.*`. The
  suffix is what identifies a test file, not the directory — and it also keeps a
  project's Vitest suite, which uses `it()` too, from contributing titles.
- If the diff moved no `it()` line in a changed test file at all, every title in
  that file is used instead.
- `it()` and `it.only()` are selected; `it.skip()` and `xit()` never are.
- Uncommitted and untracked test files count, so work in progress is included
  when you run it locally.
- Resolved titles are OR'd with any `--test` filters you pass alongside.

**A branch that changed no tests prints one line and exits `0`**, with a
`passed` report holding zero tests.
`--changed-since` is a query, and an empty result is a normal CI outcome —
unlike `--test`, which is an assertion you typed and still exits `1` when it
matches nothing, so a typo cannot look like a pass. That is decided before the
browser launches, so such a run needs no dev server at all.

Set `fetch-depth: 0` on `actions/checkout`. A depth-1 clone does not contain the
base commit, so there is nothing to diff against.

::: tip
This pairs with `--record`: one clip per test the branch added is the artifact a
reviewer actually wants. See [Recording in CI](/recording#recording-in-ci).
:::

## GitHub Action (Recommended)

The easiest way to run TWD tests in CI. The composite action handles Puppeteer caching, Chrome installation, the [run report](#run-report) and optional contract report posting in a single step. It writes the report's `summary.md` to the job summary and uploads the folder as the `twd-report` artifact, both even when the run is red:

```yaml
name: TWD Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  pull-requests: write  # only needed if using contract-report

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install mock service worker
        run: npx twd-js init public --save

      - name: Start dev server
        run: |
          nohup npm run dev > /dev/null 2>&1 &
          npx wait-on http://localhost:5173

      - name: Run TWD tests
        uses: BRIKEV/twd-cli/.github/actions/run@main
        with:
          contract-report: 'true'
```

### Action Inputs

| Input | Default | Description |
|-------|---------|-------------|
| `working-directory` | `.` | Directory where `twd.config.json` lives |
| `contract-report` | `false` | Post contract validation summary as a PR comment |
| `shard` | (empty) | Run one shard of the suite, as `<index>/<total>` (e.g. `2/4`). Leave empty to run everything in one job. See [Sharding](/sharding) |
| `report-dir` | (empty) | Where the run report folder is written. Empty uses `report.dir` from `twd.config.json`, or `.twd/report` if that isn't set either |
| `upload-report` | `true` | Upload the report folder as an artifact named `twd-report` (`twd-report-<index>` for a shard, the layout `twd-cli merge` expects) |

### With code coverage

The action runs in the same job, so coverage data is available for subsequent steps:

```yaml
      - name: Run TWD tests
        uses: BRIKEV/twd-cli/.github/actions/run@main

      - name: Display coverage
        run: npm run collect:coverage:text
```

## Custom Setup (Without the Action)

If you prefer full control over each CI step, or your CI isn't GitHub Actions, set up each step manually. Puppeteer 24+ no longer auto-downloads Chrome, so you need to install it explicitly:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install mock service worker
  run: npx twd-js init public --save

- name: Cache Puppeteer browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/puppeteer
    key: ${{ runner.os }}-puppeteer-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-puppeteer-

- name: Install Chrome for Puppeteer
  run: npx puppeteer browsers install chrome

- name: Run TWD tests
  run: npx twd-cli run

# The two steps the action does for you. if: always() so a red run still
# surfaces its report.
- name: TWD job summary
  if: always()
  run: npx twd-cli report --format markdown >> "$GITHUB_STEP_SUMMARY"

- name: Upload TWD report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: twd-report
    path: .twd/report
```

> **Tip:** Puppeteer 24+ no longer downloads Chrome automatically. Either run `npx puppeteer browsers install chrome` in CI or cache `~/.cache/puppeteer` between runs to avoid repeated downloads.

## Cross-browser testing (experimental)

::: warning Experimental
For the vast majority of projects, **`twd-cli` is the recommended runner and covers ~90% of use cases** — it's faster, collects coverage, validates contracts, and is battle-tested. `twd-runner` is an experimental complement; reach for it only when you specifically need to validate other browser engines.
:::

`twd-cli` runs your tests in headless **Chromium** (via Puppeteer). If you also want to catch **Firefox** and **WebKit (Safari)** engine differences, [`twd-runner`](https://github.com/BRIKEV/twd-runner) runs the same TWD tests across engines using Playwright. It's a complement to `twd-cli`, not a replacement: keep `twd-cli` as your primary runner (coverage + contracts), and add `twd-runner` as an extra cross-browser check.

```bash
npm install -D twd-runner
npx playwright install   # downloads the browser binaries (npm install does not)
npx twd-runner run
```

It reads the same `twd.config.json`. The keys that matter most here:

| Option | Default | Description |
|--------|---------|-------------|
| `browsers` | `["chromium","firefox","webkit"]` | Engines to run, in parallel within a single job |
| `waitForServiceWorker` | `false` | Set `true` for apps that mock via a service worker. Firefox/WebKit can be slow to take control of the page, and mocks registered before then are silently dropped. Enabling it also auto-warms the dev server first (a cold dev server otherwise races SW registration). |

A single job runs the engines in parallel, so the same two steps work on any CI — no GitHub-specific matrix required:

```yaml
- name: Start dev server
  run: |
    nohup npm run dev > /dev/null 2>&1 &
    npx wait-on http://localhost:5173

- name: Run cross-browser tests
  run: npx twd-runner run
```

::: tip Recommended split
Run your **full suite on Chromium with `twd-cli`** (coverage, contracts, retries), and use `twd-runner` only for a cross-browser pass on the engines Puppeteer can't reach — typically `"browsers": ["firefox", "webkit"]`. `twd-runner` does not collect coverage or run contract validation, and is slower than `twd-cli`.
:::

## Next Steps

- [Sharding](/sharding): Split a long run across parallel CI jobs and merge the reports (beta)
- [Recording Runs](/recording): Record a run to video, paced so it is watchable in a pull request
- [Contract Testing](/contract-testing): Validate your API mocks against OpenAPI specs
- [Code Coverage](/coverage): Learn how to collect and report code coverage with TWD
- [Writing Tests](/writing-tests): Create testable components
- [API Mocking](/api-mocking): Test with network requests
- [API Reference](/api/): Complete function documentation
