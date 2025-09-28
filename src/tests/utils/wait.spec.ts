import { describe, it } from 'vitest';
import { wait } from '../../utils/wait';

describe("wait utility", () => {
  it("waits for the specified time", async () => {
    const start = Date.now();
    await wait(100);
    const duration = Date.now() - start;
    if (duration < 90) { // allow some leeway
      throw new Error(`waited too little: ${duration}ms`);
    }
  });
});
