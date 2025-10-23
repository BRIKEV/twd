import { popSuite, pushSuite, register } from "./twdRegistry";
/**
 * Stores the function to run before each test.
 */
let beforeEachFn: (() => void | Promise<void>) | null = null;

/**
 * Registers a function to run before each test.
 * @example
 * beforeEach(() => { ... });
 */
export const beforeEach = (fn: typeof beforeEachFn) => {
  beforeEachFn = fn;
};

/**
 * Groups related tests together.
 * @example
 * describe("My group", () => { ... });
 */
export const describe = (name: string, fn: () => void) => {
  pushSuite(name);
  fn(); // for now, just run immediately
  popSuite();
};

/**
 * Defines a test case.
 * @example
 * it("does something", async () => { ... });
 */
export const it = (name: string, fn: () => Promise<void> | void) => {
  register(name, async () => {
    if (beforeEachFn) await beforeEachFn();
    await fn();
  });
};

/**
 * Defines an exclusive test case (only this runs).
 * @example
 * itOnly("runs only this", async () => { ... });
 */
export const itOnly = (name: string, fn: () => Promise<void> | void) => {
  register(name, async () => {
    if (beforeEachFn) await beforeEachFn();
    await fn();
  }, { only: true });
};

/**
 * Skips a test case.
 * @example
 * itSkip("skipped test", () => { ... });
 */
export const itSkip = (name: string, _fn: () => Promise<void> | void) => {
  register(name, async () => {}, { skip: true });
};
