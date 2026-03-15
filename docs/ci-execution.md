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
  "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"]
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

### Example GitHub Actions job

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

- Coverage Reporting: Learn how to collect and report code coverage with TWD in [Code Coverage](/coverage)
- Learn about [Writing Tests](/writing-tests) for creating testable components
- Explore [API Mocking](/api-mocking) for testing with network requests
- Check the [API Reference](/api/) for complete function documentation