# CI Flakiness Improvements

**Date:** 2026-03-15
**Branch:** feat/ci-retries-improvements

## Problem

CI test execution with Puppeteer suffers from two sources of flakiness:

1. **Element retrieval timeouts** — RTL's default `asyncUtilTimeout` of 1000ms is too short when network requests or rendering delays are involved. Even with `waitForRequest`, the render time after the response can exceed 1s.
2. **General CI environment flakiness** — transient failures in Puppeteer/CI that pass on a second attempt.

## Changes

### 1. Increase `asyncUtilTimeout` to 3000ms

**File:** `src/proxies/screenDom.ts`

Add `asyncUtilTimeout: 3000` to the existing `configure()` call. This increases the default wait time for RTL's `findBy*` and `waitFor` queries from 1s to 3s. Hardcoded — users can still override via RTL's `configure()` if needed.

**Note:** With retries enabled in CI (`retryCount: 2`), worst-case for a failing `findBy*` query is 3s × 2 attempts = 6s before final failure. This is acceptable.

### 2. Test retry mechanism in `TestRunner`

**File:** `src/runner.ts`

#### Constructor options

`TestRunner` accepts an optional second argument:

```ts
interface TestRunnerOptions {
  retryCount?: number; // total attempts, default 1 (no retry)
}

constructor(events: RunnerEvents, options?: TestRunnerOptions)
```

#### Retry loop pseudocode

```
onStart(test)  // called ONCE before the first attempt

for attempt = 1..retryCount:
  try:
    run beforeEach hooks
    test.logs = []     // clean logs per attempt
    run test handler
    onPass(test, attempt > 1 ? attempt : undefined)
    return             // success, stop retrying
  catch err:
    lastError = err
  finally:
    run afterEach hooks  // always runs for cleanup

onFail(test, lastError)  // only after ALL attempts exhausted
```

Key behaviors:
- **`onStart`** is called once before the first attempt, not per attempt.
- **`onPass`** receives `undefined` on first-attempt success, or the attempt number (2+) on retry success. `undefined` means "succeeded on first attempt", not "retries were disabled."
- **`onFail`** is called only after all attempts are exhausted, with the error from the last attempt.
- **`test.logs`** are cleared on each attempt (only the successful/final attempt's logs are preserved).
- **afterEach hooks** run on every attempt via `finally` to ensure proper cleanup between retries.

#### `RunnerEvents` signature update

`onPass` receives an optional `retryAttempt` parameter:

```ts
onPass: (test: Handler, retryAttempt?: number) => void;
```

Existing consumers that don't use the second param continue to work unchanged (backwards-compatible — a function `(test: Handler) => void` is assignable to `(test: Handler, retryAttempt?: number) => void`).

### Scope

- **CI only:** The retry mechanism lives in the core runner but is only activated when a CI consumer passes `retryCount: 2`. The sidebar UI passes no options (defaults to 1 = no retry), preserving instant honest feedback during development.
- **`runner-ci.ts`:** No changes — it's an example file. The real CI runner (`twd-cli`) lives in a separate repo and will pass `{ retryCount: 2 }` when constructing `TestRunner`.

### What does NOT change

- Test registration (`describe`, `it`, hooks)
- Suite execution logic (`runSuite`, `runSuiteByIds`)
- Skip/only behavior
- `runner-ci.ts` (example file)

## Testing

Tests in `src/tests/runner/twd-runner.spec.ts`:

- Default `retryCount: 1` does not retry on failure
- `retryCount: 2` retries once and passes if second attempt succeeds
- `retryCount: 2` reports failure if both attempts fail (with last error)
- afterEach hooks run on every attempt
- `onStart` is called once (not per attempt)
- `onPass` receives correct `retryAttempt` value (undefined on first attempt, number on retry)

## Files Modified

1. `src/proxies/screenDom.ts` — add `asyncUtilTimeout: 3000` to `configure()`
2. `src/runner.ts` — add `TestRunnerOptions` interface, `retryCount` property, retry loop in `runTest`, update `onPass` signature in `RunnerEvents`
3. `src/tests/runner/twd-runner.spec.ts` — add retry mechanism tests
