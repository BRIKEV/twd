import { describe, expect, it } from 'vitest';
import { log } from '../../utils/log';
import { register, tests } from '../../twdRegistry';

describe("log util", () => {
  it("should add logs to the current test", () => {
    register("test with logs", async () => {
      log("First log");
      log("Second log");
    });
    expect(tests).toHaveLength(1);
    expect(tests[0].logs).toEqual([]);
    tests[0].status = "running"; // simulate running
    tests[0].fn();
    expect(tests[0].logs).toEqual(["First log", "Second log"]);
  });
});
