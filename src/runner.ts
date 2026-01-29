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

interface RunnerState {
  handlers: Map<string, Handler>;
  beforeEachHooks: Map<string, HookFn[]>;
  afterEachHooks: Map<string, HookFn[]>;
  stack: string[];
}

const getRunnerState = (): RunnerState => {
  if (typeof window !== 'undefined') {
    if (!window.__TWD_STATE__) {
      window.__TWD_STATE__ = {
        handlers: new Map(),
        beforeEachHooks: new Map(),
        afterEachHooks: new Map(),
        stack: [],
      };
    }
    return window.__TWD_STATE__ as RunnerState;
  }
  
  return {
    handlers: new Map(),
    beforeEachHooks: new Map(),
    afterEachHooks: new Map(),
    stack: [],
  };
};

const state = getRunnerState();

export const handlers = state.handlers;
const beforeEachHooks = state.beforeEachHooks;
const afterEachHooks = state.afterEachHooks;
const stack = state.stack;

const generateId = () => Math.random().toString(36).slice(2, 11);

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

describe.only = (name: string, handler: () => void) => {
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
    only: true,
  });

  if (parent) handlers.get(parent)!.children!.push(id);

  stack.push(id);
  handler();
  stack.pop();
};

describe.skip = (name: string, handler: () => void) => {
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
    skip: true,
  });

  if (parent) handlers.get(parent)!.children!.push(id);

  // still build tree but whole suite + descendants become skipped
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

const hasOnlyInTree = (id: string): boolean => {
  const h = handlers.get(id);
  if (!h) return false;
  
  if (h.only) return true;
  if (!h.children) return false;

  return h.children.some((childId) => hasOnlyInTree(childId));
};

const hasOnlyAbove = (id: string): boolean => {
  let current = handlers.get(id);
  while (current?.parent) {
    const parent = handlers.get(current.parent);
    if (parent?.only) return true;
    current = parent;
  }
  return false;
};

const isSuiteSkipped = (id: string): boolean => {
  let current: Handler | undefined = handlers.get(id);

  while (current) {
    if (current.skip) return true;
    if (!current.parent) break;
    current = handlers.get(current.parent);
  }
  return false;
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
    return handlers;
  }

  async runSingle(id: string) {
    const handler = handlers.get(id);
    if (!handler || handler.type !== "test") return;
    const hasOnly = false; // Single run ignores .only logic
    await this.runTest(handler, hasOnly);
  }

  private async runSuite(suite: Handler, hasOnly: boolean) {
    const suiteIsSkipped = isSuiteSkipped(suite.id);
    // If suite is skipped AND no .only inside → skip whole subtree
    if (suiteIsSkipped && !hasOnlyInTree(suite.id)) {
      this.events.onSkip?.(suite);
      return;
    }

    // Only logic: skip suite if it's not in the .only tree
    if (hasOnly && !hasOnlyInTree(suite.id)) return;
    
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
    // skip inherited from suite
    const testIsSkipped = isSuiteSkipped(test.id) || test.skip;
    if (testIsSkipped && !test.only) {
      this.events.onSkip(test);
      return;
    }
    // only logic
    const insideOnlySuite = hasOnlyAbove(test.id);
    if (hasOnly && !test.only && !insideOnlySuite) {
      this.events.onSkip(test);
      return;
    }

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

window.__testRunner = TestRunner;