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

## Next Steps

- Coverage Reporting: Learn how to collect and report code coverage with TWD in [Code Coverage](/coverage)
- Learn about [Writing Tests](/writing-tests) for creating testable components
- Explore [API Mocking](/api-mocking) for testing with network requests
- Check the [API Reference](/api/) for complete function documentation