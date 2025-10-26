export interface Handler {
  id: string;
  name: string;
  parent?: string;
  handler: () => void | Promise<void>;
  children?: string[];
  type: 'suite' | 'test';
  status?: 'idle' | 'pass' | 'fail' | 'skip' | 'running';
  logs: string[];
  depth: number;
  only?: boolean;
  skip?: boolean;
}

type HookFn = () => void | Promise<void>;

export const handlers = new Map<string, Handler>();
const beforeEachHooks = new Map<string, HookFn[]>();
const afterEachHooks = new Map<string, HookFn[]>();
const stack: string[] = [];

const generateId = () => Math.random().toString(36).substr(2, 9);

//
// Suite definition
//
export const describe = (name: string, handler: () => void) => {
  const id = generateId();
  const parent = stack.at(-1);
  handlers.set(id, {
    id,
    name,
    type: 'suite',
    children: [],
    logs: [],
    depth: stack.length,
    parent,
    handler,
  });
  if (parent) handlers.get(parent)!.children!.push(id);

  stack.push(id);
  handler();
  stack.pop();
};

//
// Test definition
//
export const it = (name: string, handler: () => void | Promise<void>) => {
  const id = generateId();
  const parent = stack.at(-1);
  const h: Handler = {
    id,
    name,
    type: 'test',
    depth: stack.length,
    handler,
    logs: [],
    parent,
  };
  if (parent) handlers.get(parent)!.children!.push(id);
  handlers.set(id, h);
};

// Aliases for it.only and it.skip
it.only = (name: string, handler: () => void | Promise<void>) => {
  const id = generateId();
  const parent = stack.at(-1);
  const h: Handler = {
    id,
    name,
    type: 'test',
    depth: stack.length,
    handler,
    logs: [],
    parent,
    only: true,
  };
  if (parent) handlers.get(parent)!.children!.push(id);
  handlers.set(id, h);
};

it.skip = (name: string, handler?: () => void | Promise<void>) => {
  const id = generateId();
  const parent = stack.at(-1);
  const h: Handler = {
    id,
    name,
    type: 'test',
    depth: stack.length,
    handler: handler || (() => {}),
    logs: [],
    parent,
    skip: true,
  };
  if (parent) handlers.get(parent)!.children!.push(id);
  handlers.set(id, h);
};

//
// Hooks
//
export const beforeEach = (fn: HookFn) => {
  const currentSuite = stack.at(-1);
  if (!currentSuite) throw new Error('beforeEach() must be inside a describe()');
  if (!beforeEachHooks.has(currentSuite)) beforeEachHooks.set(currentSuite, []);
  beforeEachHooks.get(currentSuite)!.push(fn);
};

export const afterEach = (fn: HookFn) => {
  const currentSuite = stack.at(-1);
  if (!currentSuite) throw new Error('afterEach() must be inside a describe()');
  if (!afterEachHooks.has(currentSuite)) afterEachHooks.set(currentSuite, []);
  afterEachHooks.get(currentSuite)!.push(fn);
};

const collectHooks = (suiteId: string) => {
  const before: HookFn[] = [];
  const after: HookFn[] = [];
  let current: string | undefined = suiteId;
  while (current) {
    if (beforeEachHooks.has(current)) before.unshift(...beforeEachHooks.get(current)!);
    if (afterEachHooks.has(current)) after.push(...afterEachHooks.get(current)!);
    current = handlers.get(current)?.parent;
  }
  return { before, after };
};

export const clearTests = () => {
  handlers.clear();
  beforeEachHooks.clear();
  afterEachHooks.clear();
};

export interface RunnerEvents {
  onStart: (test: Handler) => void;
  onPass: (test: Handler) => void;
  onFail: (test: Handler, error: Error) => void;
  onSkip: (test: Handler) => void;
  onSuiteStart?: (suite: Handler) => void;
  onSuiteEnd?: (suite: Handler) => void;
}

export class TestRunner {
  private events: RunnerEvents;

  constructor(events: RunnerEvents) {
    this.events = events;
  }

  async runAll() {
    const rootSuites = Array.from(handlers.values()).filter(
      (h) => !h.parent && h.type === "suite"
    );
    const hasOnly = Array.from(handlers.values()).some((h) => h.only);
    for (const suite of rootSuites) {
      await this.runSuite(suite, hasOnly);
    }
  }

  async runSingle(id: string) {
    const handler = handlers.get(id);
    if (!handler || handler.type !== "test") return;
    const hasOnly = false; // Single run ignores .only logic
    await this.runTest(handler, hasOnly);
  }

  private async runSuite(suite: Handler, hasOnly: boolean) {
    this.events.onSuiteStart?.(suite);
    const children = (suite.children || []).map((id) => handlers.get(id)!);

    for (const child of children) {
      if (child.type === "suite") {
        await this.runSuite(child, hasOnly);
      } else if (child.type === "test") {
        await this.runTest(child, hasOnly);
      }
    }
    this.events.onSuiteEnd?.(suite);
  }

  private async runTest(test: Handler, hasOnly: boolean) {
    if (test.skip) {
      this.events.onSkip(test);
      return;
    }

    if (hasOnly && !test.only) return;

    this.events.onStart?.(test);
    const hooks = collectHooks(test.parent!);

    try {
      for (const hook of hooks.before) await hook();
      test.logs = [];
      await test.handler();
      this.events.onPass(test);
    } catch (err) {
      this.events.onFail(test, err as Error);
    } finally {
      for (const hook of hooks.after) await hook();
    }
  }
}
