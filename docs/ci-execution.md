# CI Execution

TWD provides utilities to run your tests in headless environments for continuous integration (CI) pipelines. This allows you to execute your TWD tests programmatically using tools like Puppeteer.

## Overview

The CI execution mode allows you to:
- Run tests headlessly without the browser UI
- Generate test reports for CI/CD pipelines
- Execute tests programmatically in Node.js scripts
- Integrate with existing testing infrastructure

## Setup

### 1. Install Dependencies

First, install Puppeteer (or your preferred headless browser tool):

```bash
npm install --save-dev puppeteer
```

### 2. Import CI Utilities

Import the required functions from the CI runner module:

```ts
import puppeteer from "puppeteer";
import { reportResults, executeTests } from 'twd-js/runner-ci';
```

## Basic Usage

### Simple CI Script

Create a script to run your tests in headless mode:

```ts
// scripts/run-tests-ci.js
import puppeteer from "puppeteer";
import { reportResults, executeTests } from 'twd-js/runner-ci';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to your development server
    await page.goto('http://localhost:5173');
    
    // Execute all tests
    const { handlers, testStatus } = await page.evaluate(async () => {
      return await executeTests();
    });
    
    // Display results in console
    reportResults(handlers, testStatus);
    
    // Exit with appropriate code
    const hasFailures = testStatus.some(test => test.status === 'fail');
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
```

### Add to Package.json

Add a script to your `package.json`:

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