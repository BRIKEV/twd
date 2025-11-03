# CI Integration - Running Tests in Continuous Integration

Now that you've written tests locally, let's learn how to run them automatically in your CI/CD pipeline! This allows you to catch bugs before they reach production.

## What is CI Integration?

CI (Continuous Integration) means automatically running your tests:
- **On every commit** - Catch issues immediately
- **On pull requests** - Verify changes before merging
- **In production-like environments** - Test in headless mode without UI

TWD provides utilities to run your tests programmatically using headless browsers like Puppeteer or Playwright.

## Overview

The CI execution mode allows you to:
- ✅ Run tests headlessly without the browser UI
- ✅ Generate test reports for CI/CD pipelines
- ✅ Execute tests programmatically in Node.js scripts
- ✅ Integrate with existing testing infrastructure

## Step 1: Install Dependencies

First, we need to install a headless browser tool. Let's use Puppeteer:

```bash
npm install --save-dev puppeteer
```

Or if you prefer Playwright:

```bash
npm install --save-dev playwright
```

## Step 2: Import CI Utilities

Import the required functions from TWD's CI runner module:

```ts
import puppeteer from "puppeteer";
import { reportResults } from 'twd-js/runner-ci';
```

## Step 3: Create a CI Test Script

Let's create a script that runs all our tests in headless mode:

```ts
// scripts/run-tests-ci.js
import puppeteer from "puppeteer";
import { reportResults } from 'twd-js/runner-ci';

async function runCITests() {
  // Step 1: Launch a headless browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.time('Total Test Time');
  
  try {
    // Step 2: Navigate to your development server
    console.log('Navigating to http://localhost:5173 ...');
    await page.goto('http://localhost:5173');
    
    // Step 3: Wait for TWD sidebar to load
    await page.waitForSelector('[data-testid="twd-sidebar"]', { timeout: 10000 });
    console.log('Page loaded. Starting tests...');
    
    // Step 4: Execute all tests
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
    
    // Step 5: Display results in console
    reportResults(handlers, testStatus);

    // Step 6: Exit with appropriate code
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
}

runCITests().catch(console.error);
```

Let's break down what this script does:

### Step 1: Launch Browser

```ts
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
```

- Launches a headless Chrome browser (no UI)
- Creates a new page/tab to run tests in

### Step 2: Navigate to Your App

```ts
await page.goto('http://localhost:5173');
```

- Navigates to your development server
- Make sure your dev server is running on this port!

### Step 3: Wait for TWD to Load

```ts
await page.waitForSelector('[data-testid="twd-sidebar"]', { timeout: 10000 });
```

- Waits for the TWD sidebar to appear (confirms TWD is loaded)
- 10 second timeout prevents hanging forever

### Step 4: Execute Tests

```ts
const { handlers, testStatus } = await page.evaluate(async () => {
  // This code runs inside the browser!
  const TestRunner = window.__testRunner;
  // ... run tests and collect results
});
```

- `page.evaluate()` runs code inside the browser context
- `window.__testRunner` is TWD's test runner (available in the browser)
- Collects test results (pass/fail/skip)

### Step 5: Report Results

```ts
reportResults(handlers, testStatus);
```

- Displays test results in the console
- Shows which tests passed/failed
- Prints error messages for failed tests

### Step 6: Exit with Status Code

```ts
const hasFailures = testStatus.some(test => test.status === 'fail');
process.exit(hasFailures ? 1 : 0);
```

- Exits with code `1` if tests fail (CI will fail)
- Exits with code `0` if all tests pass (CI will pass)

## Step 4: Add to Package.json

Add a script to your `package.json` to run CI tests:

```json
{
  "scripts": {
    "test:ci": "node scripts/run-tests-ci.js",
    "dev": "vite",
    "build": "vite build"
  }
}
```

Now you can run:

```bash
npm run test:ci
```

## Running in CI/CD

### GitHub Actions Example

Here's how to set up GitHub Actions to run your tests:

```yaml
# .github/workflows/test.yml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start dev server
        run: npm run dev &
      
      - name: Wait for server
        run: npx wait-on http://localhost:5173
      
      - name: Run tests
        run: npm run test:ci
```

**What this does:**
1. Checks out your code
2. Sets up Node.js
3. Installs dependencies
4. Starts your dev server in the background
5. Waits for the server to be ready
6. Runs your tests

### GitLab CI Example

```yaml
# .gitlab-ci.yml
test:
  image: node:18
  script:
    - npm ci
    - npm run dev &
    - npx wait-on http://localhost:5173
    - npm run test:ci
```

## Advanced: With Test Server

If you want to build and serve your app for testing:

```ts
// scripts/run-tests-ci.js
import puppeteer from "puppeteer";
import { reportResults } from 'twd-js/runner-ci';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runCITests() {
  try {
    // Build your app
    console.log('Building application...');
    await execAsync('npm run build');
    
    // Start a simple server (you might need to install a simple server)
    console.log('Starting test server...');
    const server = exec('npx serve dist -p 3000');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run tests
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="twd-sidebar"]', { timeout: 10000 });
    
    // ... rest of test execution code
    
    await browser.close();
    server.kill();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}
```

## Environment Variables

You can make your script configurable with environment variables:

```ts
// scripts/run-tests-ci.js
const SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:5173';
const HEADLESS = process.env.HEADLESS !== 'false'; // Default to true

const browser = await puppeteer.launch({ 
  headless: HEADLESS 
});

await page.goto(SERVER_URL);
```

Then run with:

```bash
TEST_SERVER_URL=http://localhost:3000 HEADLESS=true npm run test:ci
```

## Troubleshooting

### Server Not Ready

**Problem:** Tests run before the server is ready.

**Solution:** Add a wait step:

```ts
// Wait for server to be ready
await page.goto('http://localhost:5173');
await page.waitForSelector('[data-testid="twd-sidebar"]', { timeout: 30000 });
```

### Tests Timeout

**Problem:** Tests take too long and timeout.

**Solution:** Increase timeout in Puppeteer:

```ts
const browser = await puppeteer.launch({ 
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### Port Already in Use

**Problem:** Port 5173 is already in use.

**Solution:** Use a different port or kill the existing process:

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## Best Practices

### 1. Always Run in Headless Mode for CI

```ts
// ✅ Good - Headless for CI
const browser = await puppeteer.launch({ headless: true });

// ❌ Bad - Shows UI in CI (slower, unnecessary)
const browser = await puppeteer.launch({ headless: false });
```

### 2. Handle Errors Gracefully

```ts
try {
  // Run tests
} catch (error) {
  console.error('Test execution failed:', error);
  process.exit(1); // Fail the CI build
} finally {
  await browser.close(); // Always clean up
}
```

### 3. Set Appropriate Timeouts

```ts
// Give enough time for tests to complete
await page.waitForSelector('[data-testid="twd-sidebar"]', { 
  timeout: 30000 // 30 seconds
});
```

### 4. Run Tests in Parallel (Optional)

For large test suites, you might want to run tests in parallel:

```ts
// Run multiple test suites in parallel
const testSuites = ['unit', 'integration', 'e2e'];

await Promise.all(
  testSuites.map(suite => runTestSuite(suite))
);
```

## What's Next?

Congratulations! You now know how to:
- ✅ Run tests locally with the TWD sidebar
- ✅ Write tests with selectors and assertions
- ✅ Mock API requests
- ✅ Run tests in CI/CD pipelines

You're ready to test your applications with TWD! 🎉

For more advanced topics, check out:
- [Production Builds](./production-builds) - Remove test code from production
- [API Reference](/api/) - Complete function documentation
