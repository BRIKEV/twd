# TWD Vite Plugin — Auto-Init Design

**Status:** Proof of Concept
**Date:** 2026-05-07

## Context

Today, every TWD-enabled app duplicates ~10 lines in its entry file (`main.tsx` / `main.ts`):

```ts
if (import.meta.env.DEV) {
  const { initTWD } = await import('twd-js/bundled');
  const tests = import.meta.glob('./**/*.twd.test.ts');
  initTWD(tests, {
    open: true,
    position: 'left',
    serviceWorker: true,
    serviceWorkerUrl: '/mock-sw.js',
  });
}
```

This is friction-laden:

- The block is copy-pasted across every example app (React, Vue, Solid, RR7, shadcn, auth0, …).
- Forgetting the companion `twdHmr()` Vite plugin causes test-list duplication on HMR.
- Options live in two places (`main.tsx` and `vite.config.ts`).
- The service worker also needs a separate `npx twd-js init public` step.

A Vite plugin that auto-injects the dev-only init would eliminate the entry-file boilerplate and centralize configuration in `vite.config.ts`.

## Goals

- Replace the `initTWD(...)` block in user entry files with a single Vite plugin call.
- Plug-and-play: `plugins: [twd()]` works with sensible defaults.
- Centralize options in `vite.config.ts`.
- Preserve full backward compatibility — existing `initTWD` export and existing app setups keep working unchanged.

## Non-goals (POC)

The POC explicitly defers the following so the riskiest technical question (auto-injection viability) can be validated quickly:

- Bundling `twdHmr` into `twd()`. User adds `twdHmr()` separately for the POC.
- Bundling `removeMockServiceWorker` into `twd()`.
- Auto-installing the service worker (replacing `npx twd-js init public`). Filesystem write side-effects deserve a dedicated design.
- Coordinating with `twd-relay`'s browser-client init (`createBrowserClient().connect()`). Relay can mirror this same plugin pattern independently; no coupling required.
- Multi-pattern `testFilePattern` (string array). POC supports a single string only; flagged as future extension.
- Function-valued options (e.g. dynamic theme callbacks). Options are JSON-only in the POC.

These are captured in **Future work** below.

## Approach

Approach 1 of three considered: **virtual module + `transformIndexHtml` script tag injection.**

- Plugin owns a virtual module `virtual:twd/init` (resolved id `\0virtual:twd/init`, per Vite convention).
- Plugin's `transformIndexHtml` hook injects `<script type="module" src="/@id/virtual:twd/init"></script>` into served HTML in dev.
- The virtual module's `load`-emitted source contains:

  ```js
  import { initTWD } from 'twd-js/bundled';
  const tests = import.meta.glob('/**/*.twd.test.ts');
  initTWD(tests, /* JSON-stringified options */);
  ```

- `apply: 'serve'` — the plugin no-ops in build, so prod bundles never include test-init code.

This is the canonical Vite pattern for "inject dev-only behavior" (used widely by devtools, error overlays, MSW init plugins). It keeps the user's source untouched.

Alternatives considered and rejected:

- **Transform user's entry file.** Detecting `main.tsx` / `main.ts` per framework is fragile, modifying user code is invasive and surprises debuggers.
- **Add a second Vite input.** Multi-input dev servers are awkward and don't naturally inject into the same HTML.

## Architecture

**New file:** `src/plugin/twd.ts` — exports `twd(options?)` returning a Vite `Plugin`.

**Modified file:** `src/vite-plugin.ts` — re-export the new symbols alongside existing plugins:

```ts
export { removeMockServiceWorker } from './plugin/removeMockServiceWorker';
export { twdHmr, type TwdHmrOptions } from './plugin/twdHmr';
export { twd, type TwdPluginOptions } from './plugin/twd';
```

No changes to `package.json` exports map — `twd-js/vite-plugin` already exists.

**Plugin hooks:**

- `apply: 'serve'` — dev-only.
- `resolveId(id)` — when `id === 'virtual:twd/init'`, return `\0virtual:twd/init`.
- `load(id)` — when `id === '\0virtual:twd/init'`, return the generated source (see below); otherwise `null`.
- `transformIndexHtml()` — return an array containing one tag descriptor:

  ```ts
  [
    {
      tag: 'script',
      attrs: { type: 'module', src: '/@id/virtual:twd/init' },
      injectTo: 'head',
    },
  ]
  ```

## API surface

```ts
export interface TwdPluginOptions {
  // Test discovery
  testFilePattern?: string;        // default: '/**/*.twd.test.ts'

  // Init options (mirror of existing InitTWDOptions)
  open?: boolean;                  // default: true
  position?: 'left' | 'right';     // default: 'left'
  serviceWorker?: boolean;         // default: true
  serviceWorkerUrl?: string;       // default: '/mock-sw.js'
  theme?: Partial<TWDTheme>;       // default: undefined
  search?: boolean;                // default: undefined
  rootSelector?: string;           // default: undefined
}

export function twd(options?: TwdPluginOptions): Plugin;
```

**Usage:**

```ts
// vite.config.ts
import { twd } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    twd({ position: 'left', theme: { primary: '#ff0000' } }),
  ],
});
```

**Generated virtual module source** (with default options):

```js
import { initTWD } from 'twd-js/bundled';
const tests = import.meta.glob('/**/*.twd.test.ts');
initTWD(tests, {"open":true,"position":"left","serviceWorker":true,"serviceWorkerUrl":"/mock-sw.js"});
```

**Serialization:** all options are JSON-safe (strings, booleans, plain objects). Plugin uses `JSON.stringify(resolvedOptions)` to inline them.

## Test discovery

**Default pattern:** `/**/*.twd.test.ts`

- Leading `/` makes it project-root-absolute (Vite's convention for globs in non-relative contexts).
- `node_modules` is auto-excluded by Vite's `import.meta.glob`.
- Covers `src/`, `app/`, `twd-tests/`, anywhere — accommodates frameworks with non-`src/` layouts (e.g. React Router's `app/`).

**How the pattern lands in code:** the plugin uses `JSON.stringify(options.testFilePattern)` so the pattern appears in the generated source as a valid string literal. This satisfies Vite's static-analysis requirement for `import.meta.glob` (the pattern must be a literal, not a runtime expression).

**Common overrides:**

| Use case | `testFilePattern` value |
|---|---|
| Default | `'/**/*.twd.test.ts'` |
| Include `.tsx` tests | `'/**/*.twd.test.{ts,tsx}'` |
| Restrict to src | `'/src/**/*.twd.test.ts'` |
| Tests in a sibling dir | `'/twd-tests/**/*.twd.test.ts'` |

**HMR / new-file behavior:** Vite watches glob targets at dev time, so adding a new matching test file re-runs the glob automatically. Edit-existing-test full reload remains the responsibility of the user-installed `twdHmr()` plugin (out of scope for this POC).

## Coexistence with `twd-relay` browser-client init

Two independent plugins do not interfere:

- `twd-js/vite-plugin#twd` → `virtual:twd/init` → injected `<script>` calling `initTWD(...)`.
- A future `twd-relay` browser-client plugin would mirror the pattern with its own virtual module and injected script for `createBrowserClient().connect()`.

Both run in parallel as deferred ES modules in the browser, exactly like today's `if (import.meta.env.DEV) { ... }` block (already async via `await import`). The WebSocket sits idle until a "run" message arrives, by which point `initTWD` has registered tests. Order does not matter and no coordination is required.

One serialization note for the relay's eventual plugin: options like `url: \`${window.location.origin}/__twd/ws\`` are runtime expressions, not JSON-safe — the relay's virtual module would emit them as JS code strings, not JSON values. That is the relay plugin's concern, not this one's.

## Backward compatibility & migration

**Backward compatibility:** fully preserved.

- `initTWD` from `twd-js/bundled` stays exported and documented.
- Apps with the existing `if (import.meta.env.DEV) { ... initTWD(...) }` block keep working unchanged.
- The new `twd()` plugin is purely additive — opt-in by adding it to `plugins: []`.

**Mutual exclusion:** users adopting the plugin must remove the entry-file block; otherwise tests register twice. Documented prominently.

**Migration shape:**

```diff
  // main.tsx
- if (import.meta.env.DEV) {
-   const { initTWD } = await import('twd-js/bundled');
-   const tests = import.meta.glob('./**/*.twd.test.ts');
-   initTWD(tests, { open: true, position: 'left', serviceWorker: true });
- }
```

```diff
  // vite.config.ts
+ import { twd } from 'twd-js/vite-plugin';

  export default defineConfig({
    plugins: [
      react(),
+     twd({ open: true, position: 'left' }),
    ],
  });
```

## Validation

**POC target:** `examples/twd-test-app/` (in-repo playground). Imports directly from `../../../../src/`, so plugin source changes are reflected immediately — fastest iteration loop.

**In-repo / local-dist alias caveat.** Real consumers install `twd-js` as a package, so the bare specifier `import 'twd-js/bundled'` resolves automatically via the package's `exports` map. Consumers without an installed `twd-js` package (e.g. the in-repo `examples/` playground, or apps that copy `dist/` into their tree) must alias the specifier to the **built** `dist/bundled.es.js`, not to the source `src/bundled.tsx`:

```ts
resolve: {
  alias: {
    'twd-js/bundled': path.resolve(__dirname, '../../dist/bundled.es.js'),
  },
}
```

Aliasing to source breaks at runtime because `bundled.tsx`'s JSX is transformed by the consumer's vite config (typically `@vitejs/plugin-react`), producing React vnodes that Preact's `render()` cannot mutate (Preact tries to attach `__` and friends; React.createElement freezes vnodes in dev → `TypeError: Cannot add property __, object is not extensible`). The published artifact already has Preact JSX baked in via `@preact/preset-vite`, sidestepping the mismatch.

**Manual success criteria:**

1. Remove the `if (import.meta.env.DEV) { initTWD(...) }` block from the example's main entry.
2. Add `twd()` to the example's `vite.config.ts`.
3. Run `npm run dev`, open the app.
4. Pass conditions:
   - Sidebar (`#twd-sidebar-root`, the "TWD" button) appears in the DOM.
   - Tests discovered by the glob are listed in the sidebar.
   - Running a test from the sidebar still works.
   - Service worker registers (mock requests work, if any test exercises that path).
5. Options round-trip: pass `{ position: 'right', search: true, theme: { primary: '#ff0000' } }` and confirm each takes effect — proves the JSON serialization path end-to-end.

**Automated tests** (Vitest, `src/tests/plugin/twd.spec.ts`):

- `apply` is `'serve'`.
- `resolveId('virtual:twd/init')` returns the prefixed virtual id.
- `load(prefixedId)` returns source containing: `import { initTWD } from 'twd-js/bundled'`, the literal pattern from options, and a JSON-stringified options object.
- `load` for an unrelated id returns `null`.
- `transformIndexHtml` returns the injected `<script type="module" src="/@id/virtual:twd/init">` tag.
- Default options applied when no options passed.
- Custom `testFilePattern` is correctly inlined into the glob call.

Plugin hooks are exercised directly; no need to spin up a real Vite dev server in unit tests. End-to-end behavior is covered by manual validation.

## Risks

- **Script injection race with `main.tsx`.** The injected TWD script and the user's entry script run in parallel as deferred modules. Mitigation: today's `await import('twd-js/bundled')` flow is already async, so no consumer code currently depends on a particular ordering. If validation surfaces a real ordering issue, fallback is `injectTo: 'body-prepend'` (or `head-prepend`) to put TWD before the user's entry.
- **Glob default scope.** Defaulting to `/**/*.twd.test.ts` (project-root) is permissive — covers all known framework layouts but could surprise users with tests outside expected directories. `node_modules` is excluded by Vite, so the practical blast radius is small. `testFilePattern` override always available.

## Future work

- Bundle `twdHmr` into `twd()` so HMR full-reload behavior is automatic (Option C consolidator path).
- Bundle `removeMockServiceWorker` into `twd()` so the prod-build cleanup is automatic.
- Auto-install the service worker in dev (replacing `npx twd-js init public`) — needs careful design around filesystem writes, gitignore guidance, and idempotency.
- Multi-pattern `testFilePattern` (`string | string[]`) plus optional `ignore` patterns.
- Function-valued options (e.g. dynamic theme callbacks) by emitting them as code strings instead of JSON values.
- Coordinate documentation with `twd-relay`'s parallel browser-client plugin once it lands.
