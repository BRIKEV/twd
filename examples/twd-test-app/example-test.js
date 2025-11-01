import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // run your app + tests
  await page.goto('http://localhost:5173');

  // await page.waitForFunction(() => {
  //   return window.__TWD__?.tests?.length > 0;
  // }, { timeout: 10000 });

  await page.evaluate(async () => {
    // assuming your lib attaches this globally
    // const { tests } = window.__TWD__;
    // console.log("Running tests...", tests.length);
    // await runAll();
    // return tests.map(t => ({
    //   name: t.name,
    //   status: t.status,
    //   logs: t.logs,
    // }));
  });

  // console.log(JSON.stringify(result, null, 2));

  // const failed = result.filter(t => t.status === "fail");
  await browser.close();
  // process.exit(failed.length ? 1 : 0);
})();