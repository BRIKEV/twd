import { describe, expect, it } from 'vitest';
import { log } from '../../utils/log';
import * as twd from '../../runner';

describe("log util", () => {
  it("should add logs to the current test", () => {
    twd.it("test with logs", async () => {
      log("First log");
      log("Second log");
    });
    const tests = twd.handlers;
    const testArray = Array.from(tests.values());
    testArray[0].status = "running";
    testArray[0].handler();
    expect(testArray[0].logs).toEqual(["First log", "Second log"]);
  });
});
