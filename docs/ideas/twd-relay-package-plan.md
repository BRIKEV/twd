# TWD Relay — Standalone Package Plan

> **Status:** Planning
> **Date:** 2026-02-07

## Package Naming Options

**Package name:** `twd-relay`

---

## What This Package Does

A standalone package that enables external tools (AI agents, scripts, editor extensions) to trigger and observe TWD test runs in the browser via WebSocket.

**Three pieces:**
1. **Relay server** — WebSocket server that routes messages between browser and external clients
2. **Browser client** — Runs inside the browser, connects to the relay, executes tests on command, streams results back
3. **Server integrations** — Vite plugin + standalone CLI to host the relay

**What stays in `twd-js`:**
- The test runner, assertions, sidebar UI, mocking — all unchanged
- `twd-js` remains the core testing library
- `twd-relay` is an optional add-on for AI/automation workflows

---

## Project Structure

```
twd-relay/
├── src/
│   ├── relay/
│   │   ├── types.ts              # Message protocol types (discriminated unions)
│   │   ├── createTwdRelay.ts     # Core relay server (ws + noServer pattern)
│   │   └── index.ts              # Barrel export for relay
│   ├── browser/
│   │   ├── types.ts              # Browser client types
│   │   ├── createBrowserClient.ts # Browser-side WS client
│   │   └── index.ts              # Barrel export for browser
│   ├── vite/
│   │   ├── twdRemote.ts          # Vite plugin: attaches relay to dev server
│   │   └── index.ts              # Barrel export for vite plugin
│   ├── cli/
│   │   └── standalone.ts         # CLI: npx twd-relay (standalone server)
│   └── index.ts                  # Main entry (re-exports relay + browser)
├── src/tests/
│   ├── relay/
│   │   └── createTwdRelay.spec.ts
│   ├── browser/
│   │   └── createBrowserClient.spec.ts
│   └── vite/
│       └── twdRemote.spec.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── CHANGELOG.md
├── LICENSE
└── README.md
```

---

## Phase 0: Project Scaffolding

### package.json

```json
{
  "name": "twd-relay",
  "version": "0.1.0",
  "description": "WebSocket relay for TWD — enables AI agents and external tools to run and observe in-browser tests",
  "license": "MIT",
  "author": "BRIKEV",
  "repository": {
    "type": "git",
    "url": "https://github.com/BRIKEV/twd-relay.git"
  },
  "type": "module",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.es.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "twd-relay": "./dist/cli.js"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js"
    },
    "./browser": {
      "types": "./dist/browser.d.ts",
      "import": "./dist/browser.es.js",
      "default": "./dist/browser.es.js"
    },
    "./vite": {
      "types": "./dist/vite.d.ts",
      "import": "./dist/vite.es.js",
      "require": "./dist/vite.cjs.js"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "build": "vite build && cp src/cli/standalone.js dist/cli.js",
    "test": "vitest",
    "test:ci": "vitest --run --coverage"
  },
  "peerDependencies": {
    "twd-js": ">=1.4.0"
  },
  "peerDependenciesMeta": {
    "twd-js": {
      "optional": false
    },
    "vite": {
      "optional": true
    }
  },
  "dependencies": {
    "ws": "^8.18.2"
  },
  "devDependencies": {
    "@types/ws": "^8.18.1",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4",
    "vitest": "^4.0.18"
  }
}
```

Key decisions:
- `ws` is a **dependency** (not dev) because the relay server needs it at runtime
- `twd-js` is a **peerDependency** — the browser client imports the `TestRunner` and `handlers` from it
- `vite` is an **optional peerDependency** — only needed if using the Vite plugin
- `./browser` export is ESM-only (runs in the browser, no CJS needed)

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["DOM", "ESNext"],
    "declaration": true,
    "declarationDir": "dist",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": "./src",
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

### vite.config.ts

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      copyDtsFiles: true,
      exclude: ['src/tests', '**/*.spec.ts', '**/*.test.ts'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        browser: 'src/browser/index.ts',
        vite: 'src/vite/index.ts',
      },
      name: 'TWDRelay',
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ['ws', 'http', 'stream', 'vite', 'twd-js', 'twd-js/runner'],
      output: {
        exports: 'named',
        compact: true,
      },
    },
    minify: 'esbuild',
    target: 'es2020',
  },
  test: {
    environment: 'node',
    exclude: ['node_modules', 'dist'],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts', '!src/tests/**'],
      exclude: ['src/tests/**', '**/*.spec.ts'],
    },
  },
});
```

---

## Phase 1: Relay Server

Port the relay code we already built in `twd-js` to this new package. This is essentially a copy with minor adjustments.

### Files

- `src/relay/types.ts` — Message protocol types (same as what we built)
- `src/relay/createTwdRelay.ts` — Core relay (same as what we built)
- `src/relay/index.ts` — Barrel export
- `src/tests/relay/createTwdRelay.spec.ts` — Tests (same as what we built)

### Changes from twd-js version

- None structurally — the relay is already self-contained and has no TWD imports
- Remove the relay files from `twd-js` once this package is published

---

## Phase 2: Browser Client

The browser client runs inside the app alongside TWD. It connects to the relay WebSocket, receives commands, and uses TWD's `TestRunner` to execute tests.

### `src/browser/createBrowserClient.ts`

```ts
import type { TestRunner, Handler } from 'twd-js/runner';

interface BrowserClientOptions {
  url?: string;          // WebSocket URL, default: auto-detect from window.location
  reconnect?: boolean;   // Auto-reconnect on disconnect, default: true
  reconnectInterval?: number; // ms between reconnect attempts, default: 2000
}

interface BrowserClient {
  connect(): void;
  disconnect(): void;
  readonly connected: boolean;
}

function createBrowserClient(options?: BrowserClientOptions): BrowserClient
```

**Behavior:**
1. On `connect()`, opens WebSocket to relay and sends `{ type: 'hello', role: 'browser' }`
2. Listens for incoming commands:
   - `run` → Creates a `TestRunner` instance with WS-emitting callbacks, calls `runAll()`
   - `status` → Reads from `window.__TWD_STATE__.handlers` and sends current state
3. Runner callbacks map to WebSocket messages:
   - `onSuiteStart` → (no message, internal only)
   - `onStart` → `{ type: 'test:start', id, name, suite }`
   - `onPass` → `{ type: 'test:pass', id, name, suite, duration }`
   - `onFail` → `{ type: 'test:fail', id, name, suite, error, duration }`
   - `onSkip` → `{ type: 'test:skip', id, name, suite }`
   - After `runAll()` resolves → `{ type: 'run:complete', passed, failed, skipped, duration }`
4. Before `runAll()` → `{ type: 'run:start', testCount }`
5. Auto-reconnect on disconnect (with backoff)

**Sidebar sync:**
- The `TestRunner` callbacks also update `handler.status` on the global `handlers` Map (same objects the sidebar reads)
- After each status update, dispatch `window.dispatchEvent(new CustomEvent('twd:state-change'))` so the sidebar can listen and re-render
- This requires a small change in `twd-js` sidebar to listen for that event — or we update handler status directly and the sidebar already picks it up on next render cycle

### `src/browser/types.ts`

Types for the browser client options and return value.

### `src/browser/index.ts`

Barrel export of `createBrowserClient` and types.

### Tests

`src/tests/browser/createBrowserClient.spec.ts`
- Uses a real `http.Server` + relay + browser client connecting via `ws`
- Mocks `window.__TWD_STATE__` with fake handlers
- Verifies that incoming `run` command triggers test execution
- Verifies events are sent back through the relay to a connected client
- Verifies reconnect behavior
- Verifies `status` command returns current handler state

---

## Phase 3: Vite Plugin

### `src/vite/twdRemote.ts`

```ts
import { createTwdRelay } from '../relay';
import type { Plugin } from 'vite';

interface TwdRemoteOptions {
  path?: string; // default: '/__twd/ws'
}

function twdRemote(options?: TwdRemoteOptions): Plugin {
  return {
    name: 'twd-relay',
    configureServer(server) {
      // server.httpServer is the underlying Node http.Server
      const relay = createTwdRelay(server.httpServer!, {
        path: options?.path ?? '/__twd/ws',
      });

      // Log when browser/clients connect
      server.printUrls(); // could add relay endpoint info

      // Clean up on server close
      server.httpServer!.on('close', () => relay.close());
    },
  };
}
```

**Usage in consumer's vite.config.ts:**
```ts
import { twdHmr } from 'twd-js/vite-plugin';
import { twdRemote } from 'twd-relay/vite';

export default defineConfig({
  plugins: [
    twdHmr(),
    twdRemote(), // adds /__twd/ws to the Vite dev server
  ]
});
```

### Tests

`src/tests/vite/twdRemote.spec.ts`
- Creates a mock Vite server object with a real `httpServer`
- Calls the plugin's `configureServer` hook
- Verifies relay is attached and functional
- Verifies cleanup on server close

---

## Phase 4: Standalone CLI

### `src/cli/standalone.ts`

```ts
#!/usr/bin/env node

// npx twd-relay                → starts on port 9876
// npx twd-relay --port 4000   → custom port
```

**Behavior:**
1. Parse `--port` arg (default 9876)
2. Create `http.Server`
3. Call `createTwdRelay(server)`
4. Listen on specified port
5. Log: `TWD Relay running on ws://localhost:9876/__twd/ws`
6. Handle SIGINT/SIGTERM for clean shutdown

### Tests

Manual testing / integration test that starts the CLI process and connects via WebSocket.

---

## Phase 5: Integration with twd-js

### Changes needed in `twd-js`

These are minimal — `twd-relay` does the heavy lifting.

**1. Sidebar re-render on external runs**

In `src/ui/TWDSidebar.tsx`, add a listener for state changes triggered by the relay browser client:

```ts
useEffect(() => {
  const onStateChange = () => setRefresh(prev => prev + 1);
  window.addEventListener('twd:state-change', onStateChange);
  return () => window.removeEventListener('twd:state-change', onStateChange);
}, []);
```

This is the **only required change** in `twd-js`. When the browser client runs tests via the relay, it updates the same `handlers` Map and dispatches this event. The sidebar re-renders and shows the results.

**2. Export TestRunner types** (if not already exported)

The browser client imports `TestRunner` from `twd-js/runner`. Verify that the class and `RunnerEvents` interface are properly exported.

**3. Remove relay code from twd-js**

Once `twd-relay` is published, remove the `src/relay/` directory and related entries from `twd-js` (the files we created in this session were a prototype).

---

## Phase 6: Documentation

### README.md for twd-relay

Sections:
- What it does (one paragraph)
- Quick start (Vite plugin setup + browser client init)
- Standalone CLI usage
- Message protocol reference
- Integration examples (Claude Code, custom script)
- API reference

### Update twd-js docs

- Add a "Remote Test Execution" guide to the VitePress docs
- Link to `twd-relay` package
- Show the AI agent workflow (edit → run → read failures → fix → re-run)

---

## Consumer Usage (End Result)

### Vite project setup

```bash
npm install twd-relay
```

**vite.config.ts:**
```ts
import { twdHmr } from 'twd-js/vite-plugin';
import { twdRemote } from 'twd-relay/vite';

export default defineConfig({
  plugins: [twdHmr(), twdRemote()]
});
```

**Test entry file (e.g., main.twd.ts):**
```ts
import { initTWD } from 'twd-js/bundled';
import { createBrowserClient } from 'twd-relay/browser';

const files = import.meta.glob('./**/*.twd.test.ts', { eager: true });
initTWD(files);

// Connect to the relay (auto-detects URL from current page)
const client = createBrowserClient();
client.connect();
```

**External tool (AI agent, script):**
```js
const ws = new WebSocket('ws://localhost:5173/__twd/ws');
ws.send(JSON.stringify({ type: 'hello', role: 'client' }));
ws.send(JSON.stringify({ type: 'run', scope: 'all' }));
// receives: run:start → test:pass/fail/skip... → run:complete
```

### Non-Vite project setup

```bash
npm install twd-relay
npx twd-relay --port 9876
```

**Test entry:**
```ts
import { createBrowserClient } from 'twd-relay/browser';

const client = createBrowserClient({ url: 'ws://localhost:9876/__twd/ws' });
client.connect();
```

---

## Implementation Order

| Step | What | Depends on |
|------|------|-----------|
| 0 | Scaffold project (package.json, tsconfig, vite.config) | — |
| 1 | Port relay server from twd-js prototype | Step 0 |
| 2 | Browser client (`createBrowserClient`) | Step 1 |
| 3 | Vite plugin (`twdRemote`) | Step 1 |
| 4 | Standalone CLI (`npx twd-relay`) | Step 1 |
| 5 | twd-js sidebar integration (`twd:state-change` event) | Step 2 |
| 6 | End-to-end test with twd-test-app example | Steps 2-4 |
| 7 | Documentation + README | Steps 2-4 |
| 8 | Remove relay prototype from twd-js | Step 6 verified |
| 9 | Publish to npm | Step 7 |

---

## Open Questions

1. **Should the browser client auto-connect or require explicit `client.connect()`?**
   Option A: Auto-connect in constructor (simpler DX)
   Option B: Explicit `connect()` call (more control) — recommended

2. **Should `twd-relay` re-export TWD types or depend on them?**
   It should import from `twd-js/runner` at runtime (peer dep). No re-exporting.

3. **How to handle the sidebar re-render — custom event or shared callback registry?**
   Custom event (`twd:state-change`) is simplest and doesn't require changes to TWD's internal architecture. The sidebar just adds one `useEffect` listener.

4. **Should we support multiple browser tabs?**
   No. Single browser, latest wins. Same as the prototype we built.
