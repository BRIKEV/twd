# CI Flakiness Improvements — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce CI test flakiness by increasing RTL async timeout and adding a configurable test retry mechanism to `TestRunner`.

**Architecture:** Two independent changes — (1) bump `asyncUtilTimeout` to 3000ms in RTL's `configure()`, (2) add retry loop in `TestRunner.runTest()` gated by an optional `retryCount` constructor option (default 1 = no retry). CI consumers opt in by passing `{ retryCount: 2 }`.

**Tech Stack:** TypeScript, Testing Library DOM, Vitest

---

## Chunk 1: asyncUtilTimeout and retry mechanism

### Task 1: Increase `asyncUtilTimeout` to 3000ms

**Files:**
- Modify: `src/proxies/screenDom.ts:98-102`

- [ ] **Step 1: Add `asyncUtilTimeout: 3000` to the `configure()` call**

In `src/proxies/screenDom.ts`, update the existing `configure()` block:

```ts
configure({
  asyncUtilTimeout: 3000,
  getElementError(message) {
    return new Error(`${message}`);
  },
});
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/proxies/screenDom.ts
git commit -m "perf: increase RTL asyncUtilTimeout to 3000ms for CI stability"
```

---

### Task 2: Add `TestRunnerOptions` and `retryCount` to `TestRunner`

**Files:**
- Modify: `src/runner.ts:244-376`
- Modify: `src/tests/runner/twd-runner.spec.ts`

- [ ] **Step 1: Write failing tests for retry mechanism**

In `src/tests/runner/twd-runner.spec.ts`, add a new `describe('retry mechanism', ...)` block at the end of the existing `describe('twd runner', ...)`:

```ts
describe('retry mechanism', () => {
  it('should not retry when retryCount defaults to 1', async () => {
    const testFn = vi.fn(() => { throw new Error('always fails'); });
    twd.describe('No retry suite', () => {
      twd.it('failing test', testFn);
    });

    const mockEvents = {
      onStart: vi.fn(),
      onPass: vi.fn(),
      onFail: vi.fn(),
      onSkip: vi.fn(),
    };

    const runner = new twd.TestRunner(mockEvents);
    await runner.runAll();

    expect(testFn).toHaveBeenCalledTimes(1);
    expect(mockEvents.onFail).toHaveBeenCalledTimes(1);
    expect(mockEvents.onPass).not.toHaveBeenCalled();
  });

  it('should retry and pass if second attempt succeeds', async () => {
    let callCount = 0;
    const testFn = vi.fn(() => {
      callCount++;
      if (callCount === 1) throw new Error('flaky fail');
    });
    twd.describe('Retry suite', () => {
      twd.it('flaky test', testFn);
    });

    const mockEvents = {
      onStart: vi.fn(),
      onPass: vi.fn(),
      onFail: vi.fn(),
      onSkip: vi.fn(),
    };

    const runner = new twd.TestRunner(mockEvents, { retryCount: 2 });
    await runner.runAll();

    expect(testFn).toHaveBeenCalledTimes(2);
    expect(mockEvents.onPass).toHaveBeenCalledTimes(1);
    expect(mockEvents.onPass).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'flaky test' }),
      2
    );
    expect(mockEvents.onFail).not.toHaveBeenCalled();
  });

  it('should fail after all retry attempts are exhausted', async () => {
    const testFn = vi.fn(() => { throw new Error('persistent fail'); });
    twd.describe('All retries fail suite', () => {
      twd.it('always failing test', testFn);
    });

    const mockEvents = {
      onStart: vi.fn(),
      onPass: vi.fn(),
      onFail: vi.fn(),
      onSkip: vi.fn(),
    };

    const runner = new twd.TestRunner(mockEvents, { retryCount: 2 });
    await runner.runAll();

    expect(testFn).toHaveBeenCalledTimes(2);
    expect(mockEvents.onFail).toHaveBeenCalledTimes(1);
    expect(mockEvents.onFail).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'always failing test' }),
      expect.objectContaining({ message: 'persistent fail' })
    );
    expect(mockEvents.onPass).not.toHaveBeenCalled();
  });

  it('should run afterEach hooks on every attempt', async () => {
    let callCount = 0;
    const afterEachFn = vi.fn();
    const testFn = vi.fn(() => {
      callCount++;
      if (callCount === 1) throw new Error('flaky');
    });
    twd.describe('Hooks retry suite', () => {
      twd.afterEach(afterEachFn);
      twd.it('flaky with hooks', testFn);
    });

    const mockEvents = {
      onStart: vi.fn(),
      onPass: vi.fn(),
      onFail: vi.fn(),
      onSkip: vi.fn(),
    };

    const runner = new twd.TestRunner(mockEvents, { retryCount: 2 });
    await runner.runAll();

    expect(afterEachFn).toHaveBeenCalledTimes(2);
    expect(mockEvents.onPass).toHaveBeenCalledTimes(1);
  });

  it('should call onStart only once before all attempts', async () => {
    const testFn = vi.fn(() => { throw new Error('fail'); });
    twd.describe('onStart suite', () => {
      twd.it('failing test', testFn);
    });

    const mockEvents = {
      onStart: vi.fn(),
      onPass: vi.fn(),
      onFail: vi.fn(),
      onSkip: vi.fn(),
    };

    const runner = new twd.TestRunner(mockEvents, { retryCount: 2 });
    await runner.runAll();

    expect(mockEvents.onStart).toHaveBeenCalledTimes(1);
  });

  it('should pass undefined retryAttempt on first-attempt success', async () => {
    const testFn = vi.fn();
    twd.describe('First attempt pass suite', () => {
      twd.it('passing test', testFn);
    });

    const mockEvents = {
      onStart: vi.fn(),
      onPass: vi.fn(),
      onFail: vi.fn(),
      onSkip: vi.fn(),
    };

    const runner = new twd.TestRunner(mockEvents, { retryCount: 2 });
    await runner.runAll();

    expect(testFn).toHaveBeenCalledTimes(1);
    expect(mockEvents.onPass).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'passing test' }),
      undefined
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test src/tests/runner/twd-runner.spec.ts`
Expected: New retry tests fail (TestRunner doesn't accept options yet).

- [ ] **Step 3: Update `RunnerEvents.onPass` signature and add `TestRunnerOptions`**

In `src/runner.ts`, first update the `RunnerEvents` interface (line 246) to add the optional `retryAttempt` param to `onPass`:

```ts
export interface RunnerEvents {
  onStart: (test: Handler) => void;
  onPass: (test: Handler, retryAttempt?: number) => void;
  onFail: (test: Handler, error: Error) => void;
  onSkip: (test: Handler) => void;
  onSuiteStart?: (suite: Handler) => void;
  onSuiteEnd?: (suite: Handler) => void;
}
```

Then add the `TestRunnerOptions` interface after `RunnerEvents` and update the `TestRunner` class constructor:

```ts
export interface TestRunnerOptions {
  retryCount?: number;
}

export class TestRunner {
  private events: RunnerEvents;
  private retryCount: number;

  constructor(events: RunnerEvents, options?: TestRunnerOptions) {
    this.events = events;
    this.retryCount = options?.retryCount ?? 1;
  }
  // ... rest unchanged
}
```

- [ ] **Step 4: Add retry loop to `runTest`**

Replace the `runTest` method body in `src/runner.ts`:

```ts
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
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= this.retryCount; attempt++) {
    try {
      for (const hook of hooks.before) await hook();
      test.logs = [];
      await test.handler();
      this.events.onPass(test, attempt > 1 ? attempt : undefined);
      return;
    } catch (err) {
      lastError = err as Error;
    } finally {
      for (const hook of hooks.after) await hook();
    }
  }

  this.events.onFail(test, lastError!);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test src/tests/runner/twd-runner.spec.ts`
Expected: All tests pass, including new retry tests and all existing tests.

- [ ] **Step 6: Run full test suite**

Run: `npm run test:ci`
Expected: All tests pass.

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 8: Commit**

```bash
git add src/runner.ts src/tests/runner/twd-runner.spec.ts
git commit -m "feat: add configurable test retry mechanism to TestRunner"
```
