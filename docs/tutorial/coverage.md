# Collecting Code Coverage

TWD still has many more advanced features — such as function mocking — but with what we've covered so far, you already have everything a solid testing tool needs.
In this last step, we'll see how to collect code coverage from your TWD tests and visualize it locally or in CI.

## Before You Start

If you're following along from the [CI integration tutorial](./ci-integration), you can continue as is. But if you want to reset your repo or make sure you're on the correct branch:

```
# Repo git clone git@github.com:BRIKEV/twd-docs-tutorial.git
git reset --hard
git clean -d -f
git checkout 05-coverage
npm run serve:dev
```

## Instrumenting the Vite App

We'll use the [vite-plugin-istanbul](https://www.npmjs.com/package/vite-plugin-istanbul) plugin to instrument our code and generate coverage data.

```
npm i --save-dev vite-plugin-istanbul
```

Then, open your `vite.config.ts` and add the plugin:

```ts
/// <reference types="vitest" />
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// add plugin for code coverage
import istanbul from 'vite-plugin-istanbul';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // configure istanbul plugin
    istanbul({
      include: 'src/**/*',
      exclude: ['node_modules', 'tests/'],
      extension: ['.ts', '.tsx'],
      requireEnv: process.env.CI ? true : false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      ignored: ["**/data/data.json", "**data/routes.json"],
    },
  },
})
```

This plugin automatically adds coverage data to `window.__coverage__`, which means we can later extract it from Puppeteer during our CI run.

---

## Updating the Puppeteer Script

Let's update our `scripts/run-tests-ci.js` script to collect that coverage and save it locally:

```ts
import fs from 'fs';
import path from 'path';
import puppeteer from "puppeteer";
import { reportResults } from 'twd-js/runner-ci';

// Determine project root
let __dirname = path.resolve();

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
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

  // --- Collect coverage ---
  const coverage = await page.evaluate(() => window.__coverage__);
  if (coverage) {
    console.log('Collecting code coverage data...');
    const coverageDir = path.resolve(__dirname, './coverage');
    const nycDir = path.resolve(__dirname, './.nyc_output');
    if (!fs.existsSync(nycDir)) {
      fs.mkdirSync(nycDir);
    }
    if (!fs.existsSync(coverageDir)) {
      fs.mkdirSync(coverageDir);
    }
    const coveragePath = path.join(nycDir, 'out.json');
    fs.writeFileSync(coveragePath, JSON.stringify(coverage));
    console.log(`Code coverage data written to ${coveragePath}`);
  } else {
    console.log('No code coverage data found.');
  }

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

---

## Updating package.json Scripts

```jsonc
{
  "scripts": {
    // ...
    "dev:ci": "CI=true VITE_COVERAGE=true vite",
    "test:ci": "node scripts/run-tests-ci.js",
    "collect:coverage:html": "npx nyc report --reporter=html --report-dir=coverage",
    "collect:coverage:lcov": "npx nyc report --reporter=lcov --report-dir=coverage",
    "collect:coverage:text": "npx nyc report --reporter=text --report-dir=coverage"
  }
}
```

Now, run these in two terminals:

```
npm run dev:ci
```

And in another terminal:

```
npm run test:ci
```

Once the tests complete, you can generate coverage reports in different formats:

```
npm run collect:coverage:html
npm run collect:coverage:lcov
npm run collect:coverage:text
```

You'll see something like this:

![coverage html reporter](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ss03qfi57r43ehwgf0fn.png)

![coverage text reporter](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1dtemuclax3jwbmlju5x.png)


## Adding Coverage to GitHub Actions

To include the coverage output in your GitHub Action, just update your existing CI workflow:

```yml
name: CI - PR Tests

on:
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v5

      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Start Vite dev server
        run: |
          nohup npm run dev:ci > vite.log 2>&1 &
          npx wait-on http://localhost:5173
        env:
          CI: true

      - name: Run Puppeteer tests (test:ci)
        run: npm run test:ci
        env:
          CI: true
      
      - name: Display coverage
        run: |
          npm run collect:coverage:text
```

With the new `Display coverage` step, you'll see the coverage summary directly in your GitHub Action logs:

![Github action coverage](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0cznd4txgvtpxz5tn10o.png)

Having this basic configuration, it's entirely up to you how you want to handle the coverage results.
You can publish them to a service like Codecov or Coveralls, display them as badges in your README, or even use them in your CI pipeline to fail a build if coverage drops below a threshold.
What matters is that the library gives you the flexibility to collect and track coverage directly from your browser tests, without relying on a separate test runner.

---

## Conclusion

And that's it — we've reached the end of the TWD tutorial series!

Throughout these five parts, we've built a complete workflow from zero to production-ready testing:

- Setup and first visit test
- Selectors, assertions, and user events
- Network mocking
- CI integration with Puppeteer
- Code coverage collection and reporting

With this foundation, you can now test your apps as you develop them, keeping your environment close to what your users actually see — which is what TWD (**Test While Developing**) is all about.

Check out the integration with Testing Library selectors in the next tutorial page [Using Testing Library Selectors](./testing-library-selectors).

Thanks for following along, and happy testing!
You can always explore more in our [official docs](/getting-started).

