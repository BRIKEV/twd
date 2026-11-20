import { collectDiagnostics, type TestDiagnostics } from './utils/diagnostics';
import { hasViewports, isInCurrentViewport, isInViewport, getMatchingViewports } from './viewports';

export interface Handler {
  id: string;
  name: string;
  parent?: string;
  handler: () => void | Promise<void>;
  children?: string[];
  type: 'suite' | 'test';
  status?: 'idle' | 'pass' | 'fail' | 'skip' | 'running';
  logs: string[];
  /** Populated only when the test fails — see utils/diagnostics. */
  diagnostics?: TestDiagnostics;
  depth: number;
  only?: boolean;
  skip?: boolean;
  /** Viewport names as declared on this describe/it. Resolve with getEffectiveViewport(). */
  viewport?: string[];
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
// Options
//
export interface TestOptions {
  /**
   * Viewport name(s) declared with defineViewports(). The test only runs in
   * Run All when the window matches one of them. On a describe, it applies to
   * every test inside unless a test declares its own.
   */
  viewport?: string | string[];
}

type SuiteFn = () => void;
type TestFn = () => void | Promise<void>;

const toViewport = (options?: TestOptions): string[] | undefined => {
  if (!options || options.viewport === undefined) return undefined;
  return Array.isArray(options.viewport) ? [...options.viewport] : [options.viewport];
};

// Options are the second argument, the Playwright / Vitest convention. The
// two-argument form keeps working.
const splitArgs = <F extends (...args: never[]) => unknown>(
  optionsOrFn?: TestOptions | F,
  maybeFn?: F,
): [TestOptions | undefined, F | undefined] =>
  typeof optionsOrFn === 'function' ? [undefined, optionsOrFn] : [optionsOrFn, maybeFn];

//
// Suite definition
//
const registerSuite = (
  name: string,
  handler: SuiteFn,
  options: TestOptions | undefined,
  flags: Pick<Handler, 'only' | 'skip'>,
) => {
  const id = generateId();
  const parent = stack.at(-1);
  const viewport = toViewport(options);
  handlers.set(id, {
    id,
    name,
    type: 'suite',
    children: [],
    logs: [],
    depth: stack.length,
    parent,
    handler,
    ...flags,
    ...(viewport && { viewport }),
  });
  if (parent) handlers.get(parent)!.children!.push(id);

  // A skipped suite still builds its tree; the runner skips its descendants.
  stack.push(id);
  handler();
  stack.pop();
};

interface DescribeFn {
  (name: string, handler: SuiteFn): void;
  (name: string, options: TestOptions, handler: SuiteFn): void;
}

const makeDescribe =
  (flags: Pick<Handler, 'only' | 'skip'>): DescribeFn =>
  (name: string, optionsOrFn: TestOptions | SuiteFn, maybeFn?: SuiteFn) => {
    const [options, handler] = splitArgs<SuiteFn>(optionsOrFn, maybeFn);
    registerSuite(name, handler!, options, flags);
  };

export const describe = Object.assign(makeDescribe({}), {
  only: makeDescribe({ only: true }),
  skip: makeDescribe({ skip: true }),
});

//
// Test definition
//
const registerTest = (
  name: string,
  handler: TestFn,
  options: TestOptions | undefined,
  flags: Pick<Handler, 'only' | 'skip'>,
) => {
  const id = generateId();
  const parent = stack.at(-1);
  const viewport = toViewport(options);
  const h: Handler = {
    id,
    name,
    type: 'test',
    depth: stack.length,
    handler,
    logs: [],
    parent,
    ...flags,
    ...(viewport && { viewport }),
  };
  if (parent) handlers.get(parent)!.children!.push(id);
  handlers.set(id, h);
};

interface ItFn {
  (name: string, handler: TestFn): void;
  (name: string, options: TestOptions, handler: TestFn): void;
}

interface ItSkipFn {
  (name: string, handler?: TestFn): void;
  (name: string, options: TestOptions, handler?: TestFn): void;
}

const makeIt =
  (flags: Pick<Handler, 'only' | 'skip'>): ItFn =>
  (name: string, optionsOrFn: TestOptions | TestFn, maybeFn?: TestFn) => {
    const [options, handler] = splitArgs<TestFn>(optionsOrFn, maybeFn);
    registerTest(name, handler!, options, flags);
  };

const itSkip: ItSkipFn = (name: string, optionsOrFn?: TestOptions | TestFn, maybeFn?: TestFn) => {
  const [options, handler] = splitArgs<TestFn>(optionsOrFn, maybeFn);
  registerTest(name, handler || (() => {}), options, { skip: true });
};

export const it = Object.assign(makeIt({}), {
  only: makeIt({ only: true }),
  skip: itSkip,
});

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
  onPass: (test: Handler, retryAttempt?: number) => void;
  onFail: (test: Handler, error: Error) => void;
  onSkip: (test: Handler) => void;
  onSuiteStart?: (suite: Handler) => void;
  onSuiteEnd?: (suite: Handler) => void;
}

export interface TestRunnerOptions {
  retryCount?: number;
}

export interface RunAllOptions {
  /**
   * Run the tests of this named viewport instead of the ones matching the
   * window. Used by twd-cli after it sizes the page for that viewport.
   */
  viewport?: string;
}

export type RunTestStatus = 'pass' | 'fail' | 'skip';

// Window events any listener can follow, whoever started the run (the sidebar,
// twd-relay, twd-cli): `twd:run-start` { total }, `twd:test-end` { status },
// `twd:run-end`.
const emit = (type: string, detail?: unknown) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    detail === undefined ? new CustomEvent(type) : new CustomEvent(type, { detail }),
  );
};

const countTests = (ids: Iterable<string>) => {
  let total = 0;
  for (const id of ids) if (handlers.get(id)?.type === 'test') total++;
  return total;
};

// .only applies inside the run's scope: an out-of-scope .only must not
// suppress the tests that are in it.
const hasOnlyInScope = (scope: Set<string>) =>
  Array.from(scope).some((id) => handlers.get(id)?.only || hasOnlyAbove(id));

export class TestRunner {
  private events: RunnerEvents;
  private retryCount: number;

  constructor(events: RunnerEvents, options?: TestRunnerOptions) {
    this.events = events;
    this.retryCount = options?.retryCount ?? 1;
  }

  /**
   * Ids of the tests a run may execute: those matching the current window
   * width, or those written for `options.viewport` when a name is given.
   * `null` means no viewports are declared, so nothing is filtered.
   *
   * Runs call it once at start, so a resize mid-run changes nothing. It is
   * public for headless runners such as twd-cli, which plan one pass per
   * viewport from the page (`new window.__testRunner(events).viewportScope()`)
   * instead of reimplementing the matching rules.
   */
  viewportScope(options?: RunAllOptions): Set<string> | null {
    const tests = Array.from(handlers.values()).filter((h) => h.type === 'test');
    if (options?.viewport) {
      return new Set(tests.filter((h) => isInViewport(h, options.viewport!)).map((h) => h.id));
    }
    if (!hasViewports()) return null;
    const matching = getMatchingViewports();
    return new Set(tests.filter((h) => isInCurrentViewport(h, matching)).map((h) => h.id));
  }

  private async withRunEvents<T>(total: number, run: () => Promise<T>): Promise<T> {
    emit('twd:run-start', { total });
    try {
      return await run();
    } finally {
      emit('twd:run-end');
    }
  }

  async runAll(options?: RunAllOptions) {
    const scope = this.viewportScope(options);
    const rootSuites = Array.from(handlers.values()).filter((h) => !h.parent && h.type === 'suite');
    if (!scope) {
      const hasOnly = Array.from(handlers.values()).some((h) => h.only);
      return this.withRunEvents(countTests(handlers.keys()), async () => {
        for (const suite of rootSuites) {
          await this.runSuite(suite, hasOnly);
        }
        return handlers;
      });
    }
    const hasOnly = hasOnlyInScope(scope);
    return this.withRunEvents(scope.size, async () => {
      for (const suite of rootSuites) {
        await this.runSuiteByIds(suite, scope, hasOnly);
      }
      return handlers;
    });
  }

  async runSingle(id: string) {
    const handler = handlers.get(id);
    if (!handler || handler.type !== 'test') return;
    const hasOnly = false; // Single run ignores .only logic
    // A single run ignores the viewport too: the play button always runs.
    await this.withRunEvents(1, () => this.runTest(handler, hasOnly));
  }

  async runByIds(ids: string[]) {
    const scope = this.viewportScope();
    const idSet = scope ? new Set(ids.filter((id) => scope.has(id))) : new Set(ids);
    const rootSuites = Array.from(handlers.values()).filter((h) => !h.parent && h.type === 'suite');
    const hasOnly = scope
      ? hasOnlyInScope(idSet)
      : Array.from(handlers.values()).some((h) => h.only);
    return this.withRunEvents(countTests(idSet), async () => {
      for (const suite of rootSuites) {
        await this.runSuiteByIds(suite, idSet, hasOnly);
      }
      return handlers;
    });
  }

  private async runSuiteByIds(suite: Handler, idSet: Set<string>, hasOnly: boolean) {
    const hasMatchingDescendant = this.hasDescendantInSet(suite, idSet);
    if (!hasMatchingDescendant) return;

    const suiteIsSkipped = isSuiteSkipped(suite.id);
    if (suiteIsSkipped && !hasOnlyInTree(suite.id)) {
      this.events.onSkip?.(suite);
      return;
    }

    if (hasOnly && !hasOnlyInTree(suite.id)) return;

    this.events.onSuiteStart?.(suite);
    const children = (suite.children || []).map((id) => handlers.get(id)!);

    for (const child of children) {
      if (child.type === 'suite') {
        await this.runSuiteByIds(child, idSet, hasOnly);
      } else if (child.type === 'test' && idSet.has(child.id)) {
        await this.runTest(child, hasOnly);
      }
    }
    this.events.onSuiteEnd?.(suite);
  }

  private hasDescendantInSet(handler: Handler, idSet: Set<string>): boolean {
    if (idSet.has(handler.id)) return true;
    if (!handler.children) return false;
    return handler.children.some((childId) => {
      const child = handlers.get(childId);
      return child ? this.hasDescendantInSet(child, idSet) : false;
    });
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
      if (child.type === 'suite') {
        await this.runSuite(child, hasOnly);
      } else if (child.type === 'test') {
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
      emit('twd:test-end', { status: 'skip' });
      return;
    }
    // only logic
    const insideOnlySuite = hasOnlyAbove(test.id);
    if (hasOnly && !test.only && !insideOnlySuite) {
      this.events.onSkip(test);
      emit('twd:test-end', { status: 'skip' });
      return;
    }

    this.events.onStart?.(test);
    const hooks = collectHooks(test.parent!);
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      let attemptError: Error | null = null;
      try {
        for (const hook of hooks.before) await hook();
        test.logs = [];
        test.diagnostics = undefined;
        await test.handler();
      } catch (err) {
        attemptError = err as Error;
        // Before the afterEach hooks: one calling clearRequestMockRules()
        // resets the counts this reads.
        test.diagnostics = collectDiagnostics();
      }
      // A throwing afterEach fails this test instead of escaping and ending the
      // whole run. The test's own error, when there is one, is the one reported.
      try {
        for (const hook of hooks.after) await hook();
      } catch (err) {
        attemptError ??= err as Error;
      }
      if (!attemptError) {
        this.events.onPass(test, attempt > 1 ? attempt : undefined);
        emit('twd:test-end', { status: 'pass' });
        return;
      }
      lastError = attemptError;
    }

    this.events.onFail(test, lastError!);
    emit('twd:test-end', { status: 'fail' });
  }
}

window.__testRunner = TestRunner;

export {
  defineViewports,
  getViewportConfig,
  getEffectiveViewport,
  getMatchingViewports,
} from './viewports';
export type {
  ViewportDefinition,
  Viewports,
  DefineViewportsOptions,
  ViewportConfig,
} from './viewports';
