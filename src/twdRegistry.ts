export type TestFn = () => Promise<void> | void;

export interface TestCase {
  name: string;
  fn: TestFn;
  status?: "idle" | "pass" | "fail" | "skip" | "running";
  only?: boolean;
  skip?: boolean;
  logs?: string[];
}

export const tests: TestCase[] = [];

export const register = (name: string, fn: TestFn, opts: { only?: boolean; skip?: boolean } = {}) => {
  tests.push({ name, fn, status: "idle", logs: [], ...opts });
};
