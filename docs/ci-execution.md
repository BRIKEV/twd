# CI Execution

TWD offers two main ways to run tests inside CI environments:

- Use the turnkey `twd-cli` package that wraps Puppeteer, waits for your app, executes all tests, and reports coverage.
- Craft your own Puppeteer script with `twd-js/runner-ci` for full control over launch flags, logging, or orchestration.

Both approaches exit with a non‑zero status code when a test fails, so either works for CI/CD pipelines. Pick the option that best matches your tooling flexibility needs.

## Option 1: Use `twd-cli`

`twd-cli` is the easiest way to run TWD tests in headless environments. You can find the source code, release notes, and issue tracker at [github.com/BRIKEV/twd-cli](https://github.com/BRIKEV/twd-cli).

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

## Option 2: Bring Your Own CI Script

`twd-cli` is convenient, but you can still script everything manually when you need extra hooks (custom logging, retries, parallel shards, etc.).

### 1. Install Dependencies

```bash
npm install --save-dev puppeteer
```

### 2. Import CI Utilities

```ts
import puppeteer from "puppeteer";
import { reportResults } from 'twd-js/runner-ci';
```

### 3. Create the script

Place the following in `scripts/run-tests-ci.js` (or `.ts`):

```ts
// scripts/run-tests-ci.js
import puppeteer from "puppeteer";
import { reportResults } from 'twd-js/runner-ci';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

console.time('Total Test Time');
try {
  // Navigate to your development server
  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173');
  // wait to load data-testid="twd-sidebar"
  await page.waitForSelector('[data-testid="twd-sidebar"]', { timeout: 10000 });
  console.log('Page loaded. Starting tests...');
  // reload page
  // Execute all tests
  const { handlers, testStatus } = await page.evaluate(async () => {
    const TestRunner = window.__testRunner;
    const testStatus = [];
    const runner = new TestRunner({
      onStart: () => {},
      onPass: (test) => {
        testStatus.push({ id: test.id, status: "pass" });
      },
      onFail: (test, err) => {
        testStatus.push({ id: test.id, status: "fail", error: err.message });
      },
      onSkip: (test) => {
        testStatus.push({ id: test.id, status: "skip" });
      },
    });
    const handlers = await runner.runAll();
    return { handlers: Array.from(handlers.values()), testStatus };
  });
  console.log(`Tests to report: ${testStatus.length}`);
  
  // Display results in console
  reportResults(handlers, testStatus);

  // Exit with appropriate code
  const hasFailures = testStatus.some(test => test.status === 'fail');
  console.timeEnd('Total Test Time');
  process.exit(hasFailures ? 1 : 0);
  
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
} finally {
  console.log('Closing browser...');
  await browser.close();
}
```

### 4. Wire it into `package.json`

```json
{
  "scripts": {
    "test:ci": "node scripts/run-tests-ci.js",
    "dev": "vite",
    "build": "vite build"
  }
}
```

## Next Steps

- Learn about [Writing Tests](/writing-tests) for creating testable components
- Explore [API Mocking](/api-mocking) for testing with network requests
- Check the [API Reference](/api/) for complete function documentation