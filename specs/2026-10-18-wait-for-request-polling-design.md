# waitForRequest: resolve when the request happens, not on the next 100ms tick

**Date:** 2026-10-18
**Status:** implemented (the `url().should()` fix ships in its own PR)

Also covers a bug in `twd.url().should()` found while reviewing the same
retry loops.

## Problem

```ts
// src/commands/mockBridge.ts
export const waitForRequest = async (alias, retries = 10, retryDelay = 100) => {
  for (let i = 0; i < retries; i++) {
    const rule = rules.find((r) => r.alias === alias && r.executed);
    if (rule) return rule;
    if (i < retries - 1) await new Promise((r) => setTimeout(r, retryDelay));
  }
  throw ...
};
```

It checks every 100ms. When the request lands just after a check, the test
waits for the next tick for nothing: **~50ms lost on average per call**, up
to 100ms. A suite with ~250 calls per run loses **~12s per run**. Small
next to the fixed sleep in `mockRequest` (see
`2026-10-18-mock-rule-ack-design.md`), but free to fix and with no flakiness
risk: the timeout stays the same.

## Proposal

The page already learns about every hit as an event: the worker posts
`EXECUTED` and `initRequestMocking` marks the rule. So no polling is needed
at all: resolve from that listener.

```ts
// mockBridge.ts
const waiters = new Map<string, Set<(rule: Rule) => void>>();

// in the existing 'message' listener, after marking the rule executed:
waiters.get(alias)?.forEach((resolve) => resolve(rule));
waiters.delete(alias);

export const waitForRequest = (alias, retries = 10, retryDelay = 100): Promise<Rule> => {
  const rule = rules.find((r) => r.alias === alias);
  if (!rule) throw new Error(`Rule ${alias} not found`);
  if (rule.executed) return Promise.resolve(rule);
  const timeout = retries * retryDelay; // same total budget as today: 1s
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      waiters.get(alias)?.delete(done);
      reject(new Error(buildNotExecutedMessage(alias, timeout)));
    }, timeout);
    const done = (r: Rule) => { clearTimeout(timer); resolve(r); };
    if (!waiters.has(alias)) waiters.set(alias, new Set());
    waiters.get(alias)!.add(done);
  });
};
```

- Same signature, same total timeout, same error message.
- `clearRequestMockRules()` should reject or drop pending waiters, so a
  waiter from a previous test cannot resolve into the next one.

### Decisions taken while implementing

- **Stay `async`.** The sketch above is a plain function, so "Rule not found"
  would throw synchronously instead of rejecting. Callers using `.catch()`,
  `expect(...).rejects` and `waitForRequests` (`Promise.all` over a map) rely
  on a rejection.
- **Keep a 100ms backstop check** next to the event. The `EXECUTED` message
  resolves the wait; the backstop only catches a rule marked executed some
  other way (an HMR reload that swaps the module without a new listener, tests
  that set `executed` directly). So the wait is never slower than the old loop.
- **Waiters live in the shared `window.__TWD_MOCK_STATE__`**, like the rules,
  so a listener registered before an HMR reload still resolves them.
- **`clearRequestMockRules()` cancels pending waiters without settling them.**
  Rejecting, or letting their timeout fire later, would surface as an
  unhandled rejection in the next test.
- **Timeout is `retries * retryDelay`** (1000ms by default), matching the
  number the error message always printed. The old loop actually gave up after
  `(retries - 1) * retryDelay`, so the budget is 100ms more lenient.

## Overriding an alias, and stale hits

Re-mocking the same alias to simulate a change (`mockRequest('users', [])`,
then `mockRequest('users', [user])`) keeps working: the new rule starts with
`executed: false`, so the next `waitForRequest` waits for a new hit.

But the worker's `EXECUTED` message only carried the alias. When the app's
request for the first rule is still in flight while the test re-mocks the
alias, the late hit marked the **new** rule as executed, and the next
`waitForRequest` resolved at once with the old request body. This was already
the case with the old 100ms sleep in `mockRequest`, and has nothing to do with
polling vs events. Measured in Chrome (mock `v: 1`, fire the request without
waiting, re-mock `v: 2`, check the new rule), out of 200:

| Build | Hit served `v: 1`, `v: 2` marked executed |
|---|---|
| before (100ms sleep) | 200 |
| with the mockRequest ack | ~180 |
| with the rule id | 0 |

Fix: each `mockRequest` call gives its rule an `id`; the worker sends it back
as `ruleId` in `EXECUTED`; the page ignores a hit whose `ruleId` is not the
current rule's. The hit still counts toward `getRequestCount(alias)`, which is
per alias. A worker older than this sends no `ruleId`, and the page then
accepts the hit as before, so nothing breaks before users update the worker.

**Simpler fallback** if the event-based version feels like too much: keep the
loop and poll every 10ms with the same budget (`retries` and `retryDelay`
derived from a 1000ms timeout). Gets ~90% of the gain with a two-line
change. Tests and callers that pass `retries`/`retryDelay` explicitly keep
their exact behaviour.

## Bug: `twd.url().should()` throws even when a retry passes

```ts
// src/commands/url.ts
should: async (name, value, retries = 5) => {
  let result = '';
  let error: Error | undefined;
  for (let i = 0; i < retries; i++) {
    try {
      result = should(name, value);
      log(result);
      break;               // success...
    } catch (e) {
      await new Promise((r) => setTimeout(r, 100));
      error = e as Error;  // ...but this is still set from the failed attempt
    }
  }
  if (error) throw error;  // so any assertion that needed a retry fails
  return result;
},
```

If the first attempt fails and a later one passes, `error` still holds the
first failure and the function throws. The retry only works when the very
first attempt passes, i.e. it never helps. Fix: clear it on success
(`error = undefined;` before `break`), or return straight from the `try`.
Add a test: navigate after a delay, assert the URL, expect it to pass on a
retry. Independent of the rest; can ship as a patch.

## Testing

- Unit: resolves immediately when already executed; resolves on the
  `EXECUTED` message without waiting for a tick; rejects after the same
  timeout with the same message as today; a waiter is dropped by
  `clearRequestMockRules()`.
- `waitForRequests([...])` keeps working (it just maps over
  `waitForRequest`).
- Unit: a late hit with the replaced rule's `ruleId` is ignored, a hit
  without `ruleId` (old worker) is accepted, every pending wait for an alias
  resolves, "not found" rejects instead of throwing.

### Results

- Chrome, re-mock then request again, 200 iterations: `waitForRequest`
  resolves in ~1.4ms (x1 CPU) and ~2ms (x6), against ~50ms on average with
  100ms polling. Every wait resolved with the new rule's hit.
- `examples/twd-test-app` e2e: 55 pass / 1 skip; test time 10.6s, against
  11.1s with the mockRequest ack alone and 14.3s before both.
