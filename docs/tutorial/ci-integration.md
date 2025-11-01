# CI Integration

Learn how to run TWD tests in continuous integration pipelines for automated testing.

## Overview

CI integration allows you to:

- **Automate testing** - Run tests on every commit/PR
- **Catch regressions** - Detect issues before they reach production
- **Ensure quality** - Maintain code quality standards
- **Generate reports** - Get detailed test results and coverage

## Basic CI Setup

### 1. Install Dependencies

```json
{
  "devDependencies": {
    "twd-js": "^1.0.0",
    "playwright": "^1.40.0"
  },
  "scripts": {
    "test:ci": "playwright test",
    "test:headless": "playwright test --headed=false"
  }
}
```

### 2. Create CI Test Script

```ts
// tests/ci/run-tests.ts
import { executeTests, reportResults } from 'twd-js';
import { chromium } from 'playwright';

async function runCITests() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to your app
    await page.goto('http://localhost:3000');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    
    // Execute TWD tests
    const { handlers, testStatus } = await page.evaluate(async () => {
      // @ts-ignore - executeTests is available in browser
      return await executeTests();
    });
    
    // Report results
    reportResults(handlers, testStatus);
    
    // Check for failures
    const failures = testStatus.filter(t => t.status === 'fail');
    if (failures.length > 0) {
      console.error(`❌ ${failures.length} test(s) failed`);
      process.exit(1);
    }
    
    console.log(`✅ All ${testStatus.length} tests passed`);
    
  } finally {
    await browser.close();
  }
}

runCITests().catch(console.error);
```

### 3. Playwright Configuration

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/ci',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

## GitHub Actions Integration

### Complete Workflow

```yaml
# .github/workflows/test.yml
name: TWD Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Build application
        run: npm run build
      
      - name: Start application
        run: |
          npm run preview &
          npx wait-on http://localhost:4173
        env:
          PORT: 4173
      
      - name: Run TWD tests
        run: npm run test:ci
        env:
          CI: true
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/
          retention-days: 7
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### Matrix Testing (Multiple Browsers)

```yaml
# .github/workflows/test-matrix.yml
name: Cross-Browser Tests

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps ${{ matrix.browser }}
      
      - name: Start application
        run: |
          npm run dev &
          npx wait-on http://localhost:3000
      
      - name: Run tests on ${{ matrix.browser }}
        run: npx playwright test --project=${{ matrix.browser }}
        env:
          CI: true
```

## Advanced CI Patterns

### Playwright Test Integration

```ts
// tests/ci/twd-integration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('TWD Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should run all TWD tests successfully', async ({ page }) => {
    // Execute TWD tests in browser
    const results = await page.evaluate(async () => {
      // @ts-ignore
      const { handlers, testStatus } = await executeTests();
      return { handlers, testStatus };
    });

    // Verify no test failures
    const failures = results.testStatus.filter(t => t.status === 'fail');
    expect(failures).toHaveLength(0);

    // Verify all tests ran
    expect(results.testStatus.length).toBeGreaterThan(0);
    
    console.log(`✅ ${results.testStatus.length} TWD tests passed`);
  });

  test('should handle individual test execution', async ({ page }) => {
    // Get list of available tests
    const testList = await page.evaluate(() => {
      // @ts-ignore
      return Array.from(window.handlers?.values() || [])
        .filter(h => h.type === 'test')
        .map(h => ({ id: h.id, name: h.name }));
    });

    expect(testList.length).toBeGreaterThan(0);

    // Run each test individually
    for (const testInfo of testList) {
      const result = await page.evaluate(async (testId) => {
        // @ts-ignore
        const runner = new window.__testRunner({
          onStart: () => {},
          onPass: () => ({ status: 'pass' }),
          onFail: (test, err) => ({ status: 'fail', error: err.message }),
          onSkip: () => ({ status: 'skip' }),
        });
        
        try {
          await runner.runSingle(testId);
          return { status: 'pass' };
        } catch (error) {
          return { status: 'fail', error: error.message };
        }
      }, testInfo.id);

      expect(result.status).toBe('pass');
    }
  });
});
```

### Parallel Test Execution

```ts
// tests/ci/parallel-runner.ts
import { chromium } from 'playwright';
import { executeTests, reportResults } from 'twd-js';

async function runTestsInParallel() {
  const browsers = await Promise.all([
    chromium.launch(),
    chromium.launch(),
    chromium.launch()
  ]);

  const testPromises = browsers.map(async (browser, index) => {
    const page = await browser.newPage();
    
    try {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Run subset of tests based on index
      const results = await page.evaluate(async (workerIndex) => {
        // @ts-ignore
        const allTests = Array.from(window.handlers.values())
          .filter(h => h.type === 'test');
        
        // Distribute tests across workers
        const testsPerWorker = Math.ceil(allTests.length / 3);
        const startIndex = workerIndex * testsPerWorker;
        const endIndex = Math.min(startIndex + testsPerWorker, allTests.length);
        const workerTests = allTests.slice(startIndex, endIndex);
        
        // Run assigned tests
        const testResults = [];
        for (const test of workerTests) {
          // Run individual test and collect results
          // Implementation depends on your test runner
        }
        
        return testResults;
      }, index);
      
      return results;
      
    } finally {
      await page.close();
      await browser.close();
    }
  });

  const allResults = await Promise.all(testPromises);
  
  // Combine and report results
  const combinedResults = allResults.flat();
  console.log(`✅ Completed ${combinedResults.length} tests across ${browsers.length} workers`);
}
```

### Test Reporting

```ts
// tests/ci/reporter.ts
import fs from 'fs';
import path from 'path';

interface TestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  tests: Array<{
    name: string;
    status: 'pass' | 'fail' | 'skip';
    duration: number;
    error?: string;
  }>;
}

export function generateTestReport(handlers: any[], testStatus: any[]): TestReport {
  const startTime = Date.now();
  
  const report: TestReport = {
    summary: {
      total: testStatus.length,
      passed: testStatus.filter(t => t.status === 'pass').length,
      failed: testStatus.filter(t => t.status === 'fail').length,
      skipped: testStatus.filter(t => t.status === 'skip').length,
      duration: Date.now() - startTime
    },
    tests: testStatus.map(test => {
      const handler = handlers.find(h => h.id === test.id);
      return {
        name: handler?.name || 'Unknown test',
        status: test.status,
        duration: 0, // You can track individual test durations
        error: test.error
      };
    })
  };

  return report;
}

export function saveReportAsJSON(report: TestReport, outputPath: string) {
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
}

export function saveReportAsHTML(report: TestReport, outputPath: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>TWD Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
    .pass { color: green; }
    .fail { color: red; }
    .skip { color: orange; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>TWD Test Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Total: ${report.summary.total}</p>
    <p class="pass">Passed: ${report.summary.passed}</p>
    <p class="fail">Failed: ${report.summary.failed}</p>
    <p class="skip">Skipped: ${report.summary.skipped}</p>
    <p>Duration: ${report.summary.duration}ms</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Test Name</th>
        <th>Status</th>
        <th>Error</th>
      </tr>
    </thead>
    <tbody>
      ${report.tests.map(test => `
        <tr>
          <td>${test.name}</td>
          <td class="${test.status}">${test.status.toUpperCase()}</td>
          <td>${test.error || ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;
  
  fs.writeFileSync(outputPath, html);
}
```

## Docker CI Integration

### Dockerfile for CI

```dockerfile
# Dockerfile.ci
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Run tests
CMD ["npm", "run", "test:ci"]
```

### Docker Compose for CI

```yaml
# docker-compose.ci.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  tests:
    build:
      context: .
      dockerfile: Dockerfile.ci
    depends_on:
      app:
        condition: service_healthy
    environment:
      - CI=true
      - BASE_URL=http://app:3000
    volumes:
      - ./test-results:/app/test-results
```

## CI Best Practices

### 1. Use Headless Mode

```ts
// CI configuration
const browser = await chromium.launch({
  headless: process.env.CI === 'true', // Headless in CI
  args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : []
});
```

### 2. Handle Flaky Tests

```yaml
# GitHub Actions with retries
- name: Run tests with retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: npm run test:ci
```

### 3. Cache Dependencies

```yaml
# Cache node_modules and Playwright browsers
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.cache/ms-playwright
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### 4. Parallel Execution

```yaml
# Run tests in parallel
strategy:
  matrix:
    shard: [1, 2, 3, 4]
    
steps:
  - name: Run tests
    run: npx playwright test --shard=${{ matrix.shard }}/4
```

### 5. Artifact Collection

```yaml
# Collect test artifacts
- name: Upload screenshots
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: screenshots
    path: test-results/screenshots/

- name: Upload videos
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: videos
    path: test-results/videos/
```

## Troubleshooting CI Issues

### Common Problems

#### 1. Tests Timeout

```ts
// Increase timeouts for CI
test.setTimeout(60000); // 60 seconds

// Or in playwright.config.ts
export default defineConfig({
  timeout: 60000,
  expect: {
    timeout: 10000
  }
});
```

#### 2. Service Worker Issues

```ts
// Clear service workers before tests
await page.evaluate(() => {
  return navigator.serviceWorker.getRegistrations()
    .then(registrations => {
      return Promise.all(registrations.map(reg => reg.unregister()));
    });
});
```

#### 3. Network Issues

```ts
// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Or wait for specific requests
await page.waitForResponse(response => 
  response.url().includes('/api/') && response.status() === 200
);
```

#### 4. Element Not Found

```ts
// Use more robust waiting
await page.waitForSelector('[data-testid="element"]', {
  state: 'visible',
  timeout: 30000
});
```

### Debug CI Failures

```yaml
# Add debug steps
- name: Debug on failure
  if: failure()
  run: |
    echo "Current directory:"
    ls -la
    echo "Test results:"
    ls -la test-results/ || echo "No test results directory"
    echo "Screenshots:"
    ls -la test-results/screenshots/ || echo "No screenshots"
```

## Next Steps

Congratulations! 🎉 You've completed the TWD tutorial and learned how to:

- Install and set up TWD
- Write comprehensive tests with assertions
- Mock APIs for isolated testing
- Organize tests with hooks
- Build production-ready applications
- Integrate tests into CI/CD pipelines

### What's Next?

- 📖 Explore the [API Reference](/api/) for detailed documentation
- 🔍 Check out [real examples](/examples/) in the examples directory
- 🐛 [Report issues](https://github.com/BRIKEV/twd/issues) if you find bugs
- 💬 [Join discussions](https://github.com/BRIKEV/twd/discussions) to ask questions
- ⭐ [Star the project](https://github.com/BRIKEV/twd) if you find it useful!

Happy testing! 🧪
