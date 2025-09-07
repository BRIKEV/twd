export type TestFn = () => Promise<void> | void;

export interface TestCase {
  name: string;
  fn: TestFn;
  status?: "idle" | "pass" | "fail" | "skip" | "running";
  only?: boolean;
  skip?: boolean;
  logs?: string[];
  suite: string[];
}

export const tests: TestCase[] = [];

let currentSuite: string[] = [];

export const register = (name: string, fn: TestFn, opts: { only?: boolean; skip?: boolean } = {}) => {
  tests.push({
    name,
    fn,
    status: "idle",
    logs: [],
    suite: [...currentSuite],
    ...opts
  });
};

export const clearTests = () => {
  tests.length = 0;
  currentSuite = [];
};

export const pushSuite = (name: string) => {
  currentSuite.push(name);
};

export const popSuite = () => {
  currentSuite.pop();
};

