import fs from 'fs';
import path from 'path';
import puppeteer from "puppeteer";

// Determine project root
let __dirname = path.resolve();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
console.time('Total Test Time');
try {
  // Navigate to your development server
  console.log('Navigating to http://localhost:5173 ...');
  await page.goto('http://localhost:5173', { 
    waitUntil: 'networkidle0',
    timeout: 60000 
  });
  // wait to load data-testid="twd-sidebar"
  console.log('Waiting for sidebar to appear...');
  await sleep(3000);
  console.log('Page loaded. Starting tests...');
  // reload page
  // Execute all tests
  const { testStatus } = await page.evaluate(async () => {
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
  console.log('\x1b[32m%s\x1b[0m', 'Test passed!');
  process.exit(hasFailures ? 1 : 0);
  
} catch (error) {
  console.error('Error running tests:', error);
  console.error('\x1b[31m%s\x1b[0m', 'Test failed!');
  process.exit(1);
} finally {
  console.log('Closing browser...');
  await browser.close();
}