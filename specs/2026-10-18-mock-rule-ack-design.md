# mockRequest: wait for the service worker's ack instead of 100ms

**Date:** 2026-10-18
**Status:** implemented

## Problem

Every `twd.mockRequest()` ends with a fixed sleep:

```ts
// src/commands/mockBridge.ts
navigator.serviceWorker.controller?.postMessage({ type: 'ADD_RULE', rule, version: TWD_VERSION });
await wait(SW_DELAY); // 100ms
```

It costs 100ms per mock, always, on every machine. A large suite easily makes
500-900 `mockRequest` calls per run once `beforeEach` blocks and helpers
multiply the ones in the source, so **~50-90s of every run is spent in this
sleep**. A faster CI runner cannot shrink it: it is wall-clock time, not CPU.

And it is not even a guarantee. It is a guess at "long enough for the service
worker to have stored the rule". Under a slow CPU (2-vCPU CI runner,
`--cpu-throttle`) the guess can be wrong, and then the app's request goes out
before the rule exists: an unmocked request, a flaky test.

## Why the sleep is there (plain version)

The mock rules live in two places:

- **The page** (`rules` in `mockBridge.ts`): used by `waitForRequest`,
  `getRequestCount`, diagnostics.
- **The service worker** (`rules` in `mock-sw.js`): the one that actually
  intercepts `fetch` and answers with the mock.

`postMessage` to the service worker is **fire-and-forget**: it returns
immediately, and the worker handles the message later, on its own thread. If
the test then triggers a request straight away (`twd.visit`, a click), the
`fetch` event can reach the worker **before** the `ADD_RULE` message has been
handled. The browser does not order messages and fetches against each other.

So the 100ms says "give the worker time to read its mail before anyone calls
it". It works most of the time, and wastes 100ms when the worker took 1ms.

## Proposal: the worker answers when the rule is stored

Ask the worker to reply once it has stored the rule, and wait for that reply.
The standard tool is a `MessageChannel`: the page sends one end of a private
channel with the message, the worker answers on it.

Page (`mockBridge.ts`):

```ts
const ACK_TIMEOUT = 1000;

const postToWorker = (message: object): Promise<'ack' | 'timeout'> =>
  new Promise((resolve) => {
    const controller = navigator.serviceWorker.controller;
    if (!controller) return resolve('ack'); // no worker: nothing to wait for (same as today)
    const channel = new MessageChannel();
    const timer = setTimeout(() => resolve('timeout'), ACK_TIMEOUT);
    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      checkWorkerVersion(event.data?.version);
      resolve('ack');
    };
    controller.postMessage(message, [channel.port2]);
  });

// in mockRequest
const result = await postToWorker({ type: 'ADD_RULE', rule, version: TWD_VERSION });
if (result === 'timeout') warnOutdatedWorker();
```

Worker (`mock-sw.js`):

```js
export const handleMessage = (event) => {
  const { type, rule, version } = event.data || {};
  isValidVersion(version);
  if (type === 'ADD_RULE') { /* store rule, as today */ }
  if (type === 'CLEAR_RULES') { /* clear, as today */ }
  event.ports[0]?.postMessage({ type: 'ACK', version: TWD_VERSION });
};
```

Result: `mockRequest` resolves as soon as the rule is stored (usually ~1ms),
and **only then**. It is faster and safer at the same time: under a slow CPU
it waits as long as needed instead of guessing.

Do the same for `CLEAR_RULES` in `clearRequestMockRules()`. Today it does not
wait at all; it relies on messages to one worker arriving in order (they do),
so a clear followed by an add is fine. Acking it is cheap and removes the
question. `clearRequestMockRules` is synchronous today; making it async is a
breaking change for anyone not awaiting it, so keep it sync and only ack the
`ADD_RULE` path, or add the ack in a major.

**Decision:** `clearRequestMockRules` stays sync and sends no port. The worker
acks any message that carries a port, `CLEAR_RULES` included, so a future
major can await it without touching the worker again.

## Compatibility: old service worker, new twd-js

Users keep a copy of `mock-sw.js` in their `public/` folder. Many commit it
and only refresh it with `npx twd-js init public` when they remember. A new
twd-js talking to an old worker will never get an ack. Hence the timeout:

- **No ack within `ACK_TIMEOUT`** → resolve anyway (same outcome as today's
  sleep, slower only for those users) and warn once per page load:

  ```
  [TWD] Your mock-sw.js is outdated (no ack from the service worker).
  Mocks still work, but each mockRequest now waits up to 1s.
  Update it: npx twd-js init public
  ```

- The ack carries the worker's `version`, so the page can also warn on a
  version mismatch. Today only the worker logs that, in the worker's console,
  where nobody looks. twd-cli surfaces page warnings; worker warnings it does
  not.

Timeout value: long enough that a slow CI never hits it with an up-to-date
worker (the ack is one message round trip), short enough that an outdated
worker is merely slow, not broken. 1000ms is a starting point; could also be
the old 100ms, so outdated workers behave exactly as today.

**Decision: 100ms.** Nobody gets slower, the warning tells them how to get
faster. The version-mismatch warning is also printed once per page load.

Release as a minor with a CHANGELOG entry that says, in the first line:
**update your service worker** (`npx twd-js init public`).

## Ship mock-sw.js unminified

`vite.sw.config.js` builds the worker with `minify: "esbuild"`, so the file
users commit is one unreadable line. That is unusual for a file that lives in
the user's repo:

- MSW ships `mockServiceWorker.js` readable, with a header saying what it is,
  the version, and "do not modify, regenerate with ...".
- When a mock misbehaves, the worker is the first place to look, and a
  minified file cannot be read or debugged with breakpoints.
- Size is irrelevant: it is a dev-only file (`removeMockServiceWorker()`
  deletes it from builds).
- Diffs on update become reviewable, which makes "update your worker" less
  scary.

Change:

```js
// vite.sw.config.js
build: {
  minify: false,
  rollupOptions: {
    output: {
      entryFileNames: 'mock-sw.js',
      format: 'iife',
      banner: `/* TWD mock service worker v${version}.
 * Generated by twd-js. Do not edit: regenerate with \`npx twd-js init <public-dir>\`.
 * https://twd.dev/api-mocking */`,
    },
  },
}
```

## Related: make updating the worker automatic (later)

`npx twd-js init public --save` today only prints a reminder; it saves
nothing. MSW's `--save` writes the folder to `package.json`
(`"msw": { "workerDirectory": ["public"] }`) and its `postinstall` refreshes
the worker on every `npm install`, so the worker can never go stale. Worth
copying: it removes the whole "outdated worker" class of problems, including
the one this change introduces. Separate change.

## Testing

- Unit (`src/tests/commands`): `mockRequest` resolves on ack; resolves after
  the timeout and warns once when no ack; no wait when there is no
  controller.
- Worker (`src/tests/cli`): `handleMessage` posts an ack on `ports[0]` for
  `ADD_RULE` and `CLEAR_RULES`, and does not throw when no port is given
  (old pages).
- E2E: mock then immediately `fetch` in a loop (e.g. 200 iterations) with
  `--cpu-throttle 6`; zero misses. That is the race the sleep was guarding.

### Results (headless Chrome, 200 iterations of mock + immediate fetch)

| Worker | CPU | Misses | ms per mock + fetch |
|---|---|---|---|
| new (acks) | x1 | 0 | ~0.8 |
| new (acks) | x6 | 0 | ~2.7 |
| old (no ack) | x1 | 0 | ~103, one outdated-worker warning |

The same loop posting `ADD_RULE` without waiting at all missed 113/200 (x1)
and 55/200 (x6): the race is real, and the ack closes it without the sleep.

## Follow-up: a busy worker is not an outdated worker

Running the example apps against the beta showed the first version of this
change gave up too early. `mockRequest` waited for the ack for 100ms and then
assumed an outdated worker. But an up-to-date worker that is busy for a moment
(serving the dev server's modules while a page renders) can take longer than
that. `mockRequest` then carried on before the rule was stored, the app's
request reached the worker first and went to the network, and the page printed
a wrong "outdated" warning.

Fix: once the worker has answered at least once in this page load, it is
known to ack, so a missing answer means "busy", not "outdated". `mockRequest`
then waits up to 2000ms for it. Until the first answer the 100ms fallback stays,
so an outdated worker behaves exactly as before. The page keeps listening on
the channel after a timeout, so a late ack still teaches it that the worker
acks. The "outdated" warning is only printed while no ack has been seen.

Tests: a worker that acked before and then takes 300ms is waited for, with no
warning; a first ack arriving after the 100ms timeout still switches to the
longer wait; a worker that acked before and then never answers is given up on
after 2000ms.
