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
5. Collects and reports test results
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
  "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"],
  "retryCount": 2,
  "contracts": [],
  "contractReportPath": ".twd/contract-report.md"
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
| `puppeteerArgs` | string[] | `["--no-sandbox", "--disable-setuid-sandbox"]` | Extra arguments for Puppeteer |
| `retryCount` | number | `2` | Number of times to attempt each test before reporting failure. Default is 2 (one normal attempt + one retry). Set to 1 to disable retries. |
| `contracts` | object[] | `[]` | OpenAPI contract validation specs. See [Contract Testing](/contract-testing) |
| `contractReportPath` | string | — | Path to write a markdown report for CI/PR integration |

## GitHub Action (Recommended)

The easiest way to run TWD tests in CI. The composite action handles Puppeteer caching, Chrome installation, and optional contract report posting in a single step:

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
```

> **Tip:** Puppeteer 24+ no longer downloads Chrome automatically. Either run `npx puppeteer browsers install chrome` in CI or cache `~/.cache/puppeteer` between runs to avoid repeated downloads.

## Custom Runner Options

If you're building your own CI script instead of using `twd-cli`, you can pass options to the `TestRunner` constructor to handle flaky CI environments:

```ts
const runner = new TestRunner({
  onStart: () => {},
  onPass: (test, retryAttempt) => {
    const suffix = retryAttempt ? ` (retry ${retryAttempt}/2)` : '';
    testStatus.push({ id: test.id, status: "pass" });
    console.log(`✓ ${test.name}${suffix}`);
  },
  onFail: (test, err) => {
    testStatus.push({ id: test.id, status: "fail", error: err.message });
  },
  onSkip: (test) => {
    testStatus.push({ id: test.id, status: "skip" });
  },
}, { retryCount: 2 });
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `retryCount` | number | `1` | Total number of attempts per test. `1` means no retry. `2` means one original attempt + one retry on failure. |

The `onPass` callback receives an optional second parameter `retryAttempt` — it is `undefined` when the test passes on the first attempt, or the attempt number (2+) when it passes on a retry. This lets you log which tests are flaky so you can fix them later.

> **Note:** The retry mechanism re-runs the full test cycle (beforeEach hooks → test → afterEach hooks) on each attempt, ensuring clean state between retries.

## Next Steps

- [Contract Testing](/contract-testing): Validate your API mocks against OpenAPI specs
- [Code Coverage](/coverage): Learn how to collect and report code coverage with TWD
- [Writing Tests](/writing-tests): Create testable components
- [API Mocking](/api-mocking): Test with network requests
- [API Reference](/api/): Complete function documentation
