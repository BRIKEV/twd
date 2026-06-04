# Pre-Bundle `twd-js/bundled` and `twd-js/runner` via `optimizeDeps.include`

**Status:** Proposed
**Date:** 2026-05-20

## Context

The `twd()` plugin auto-wires TWD into a Vite app by injecting a virtual module into `index.html`:

```ts
load(id) {
  if (id !== RESOLVED_VIRTUAL_ID) return null;
  return [
    `import { initTWD } from 'twd-js/bundled';`,
    `const tests = import.meta.glob(${patternLiteral});`,
    `initTWD(tests, ${optionsLiteral});`,
  ].join('\n');
},
```

Vite's pre-bundling scanner uses esbuild to crawl real files on disk (`index.html`, `src/main.tsx`, transitive imports). **Virtual modules are invisible to that scanner.** On a cold server start, Vite has no knowledge that `twd-js/bundled` will be imported.

When the browser loads the page for the first time, Vite discovers the dep lazily, re-runs `optimizeDeps`, and broadcasts a `full-reload` via HMR. The page reloads mid-init. In apps with MSAL / Auth0 / cookie-bound auth flows, this reload is indistinguishable from "the dev server is stuck," and the typical workaround is to restart `vite` entirely. The restart only works because the second start finds the dep in `node_modules/.vite/deps` and skips lazy discovery — any cache invalidation makes the symptom return.

The same trap hits the **first remote test run**. `twd-relay/browser` does `await import('twd-js/runner')` when handling a `run` message. Until that dynamic import executes, Vite hasn't seen `twd-js/runner` either, and the lazy discovery triggers another full reload — which aborts the in-flight test run.

### Evidence

In an affected consumer's `node_modules/.vite/deps/_metadata.json`, the optimized list is alphabetical up to `tailwind-merge`, then breaks order:

```
tailwind-merge
twd-relay/browser
twd-js/bundled
twd-js
twd-js/runner
sinon
```

That out-of-order tail is Vite's runtime discovery order — direct proof these deps were not seen during the initial scan.

## Goals

- Eliminate the first-load full-reload in apps using `twd()`.
- Eliminate the first-test-run full-reload caused by lazy discovery of `twd-js/runner`.
- Zero new public API. Zero new options for consumers.
- Preserve behaviour for users who do **not** use the Vite plugin (e.g. Webpack consumers).

## Non-goals

- Discovering user-side deps such as `sinon`, mocking libraries, or app-specific test helpers — those live in consumer code and are outside the plugin's scope.
- Changing the virtual-module / `transformIndexHtml` mechanism.
- Affecting the `build` pipeline. The plugin is `apply: 'serve'`; production output is unchanged.

## Design

Add a `config()` hook to the plugin that pre-declares the entry modules in `optimizeDeps.include`. Vite merges this with the user's existing config and pre-bundles the deps at server start, before the browser ever requests a script.

```ts
export function twd(options: TwdPluginOptions = {}): Plugin {
  // ...existing setup unchanged
  return {
    name: 'twd',
    apply: 'serve',
    config() {
      return {
        optimizeDeps: {
          include: ['twd-js/bundled', 'twd-js/runner'],
        },
      };
    },
    configResolved(config) { /* unchanged */ },
    resolveId(id)          { /* unchanged */ },
    load(id)               { /* unchanged */ },
    transformIndexHtml()   { /* unchanged */ },
  };
}
```

### Why include `twd-js/runner` even though the virtual module doesn't import it directly

The virtual module imports `twd-js/bundled`, which transitively reaches the dashboard UI. `twd-js/runner` is reached from two other paths:

1. User test files importing `describe` / `it` from `twd-js/runner`. These files are loaded through `import.meta.glob`, whose lazy import factories are not crawled at scan time.
2. `twd-relay/browser` dynamically importing `twd-js/runner` when handling remote `run` commands.

Both paths are invisible to Vite's initial scan. Pre-including `twd-js/runner` here removes the second full-reload trap that hits the first test execution.

### Why not gate this on any option

When `twd()` is installed and `apply: 'serve'` is in effect, both modules are always needed. There is no realistic "I want the plugin but not the runner" path — skipping `runner` would mean no tests can execute, defeating the point of the plugin. If a future option ever needs to skip `runner` (e.g. dashboard-only mode), the include list can be made conditional then. Not worth speculating about now.

## Compatibility

- Webpack / Rollup / esbuild consumers are unaffected — they don't load this plugin.
- Existing Vite consumers see one behavioural change: cold start pre-bundles two more modules. The cost is a small one-time delay at startup, in exchange for removing one or two `full-reload` events later. Net win.
- `optimizeDeps.include` is **additive** when returned from `config()` — Vite merges it with the user's existing list. No conflict with apps that already list `twd-js/bundled` manually.

## Companion fix

`twd-relay`'s plugin has the same gap for `twd-relay/browser`. Tracked separately in that repo. The two fixes are independent and can land in any order; both together are needed to fully eliminate the first-load reload in apps using both packages.

## Testing

Unit (in the existing Vitest suite for the plugin):

- Plugin's `config()` returns `{ optimizeDeps: { include: ['twd-js/bundled', 'twd-js/runner'] } }`.
- Existing `resolveId` / `load` / `transformIndexHtml` tests pass unchanged.

Manual repro:

1. In an example app, `rm -rf node_modules/.vite`.
2. Start `vite dev`, open the page.
3. The Network panel should show zero `[vite] page reload` events on first load.
4. Run a test from the sidebar — completes without a reload.

## Out of scope

- User-side deps like `sinon` discovered through `import.meta.glob`. The consumer can add them to their own `optimizeDeps.include` if it bothers them.
- Production build behaviour (the plugin is `apply: 'serve'`-only).
