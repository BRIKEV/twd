# Remote Test Execution API

> **Status:** Ideation / Proposal
> **Author:** —
> **Date:** 2026-02-06

## Vision

This feature is not about running tests elsewhere — and it does **not** replace the current CI setup (Puppeteer/Playwright via `twd-cli`). CI remains exactly as-is. This tool exists to improve **developer–AI feedback loops during local development**.

TWD tests run against the real DOM, with real user interactions, in a real browser. That's the whole point. The remote API doesn't change where tests run — it just opens a door so that tools outside the browser (AI agents, local scripts, editor extensions) can knock, say "run the tests", and listen to what happens. The primary motivation is enabling AI coding agents to participate in the edit → test → fix cycle without requiring full browser automation.

## Problem Statement

TWD runs tests directly in the browser and presents results through its sidebar UI. This works well for interactive development, but creates friction for external tooling:

1. **AI coding agents** (Claude Code, Cursor, Copilot) run as CLI processes. They can edit files and run shell commands, but they have no way to trigger or observe in-browser tests without launching a full browser automation tool.

2. **The irony:** during development the Vite dev server is already running and TWD is already loaded in the browser. The test runner, test tree, and results all exist in-memory. We just need a bridge to expose them to external processes.

A lightweight communication channel between the browser's test runner and external tools would unlock powerful workflows — especially for AI-assisted development where an agent can run tests, read failures, fix code, and re-run in a tight loop.

> **Note:** The existing CI approach (Puppeteer via `twd-cli`) is unaffected by this feature. CI stays as-is. This feature targets local development workflows only.

## Proposed Solution — High-Level

A WebSocket relay server sits between the browser (where TWD runs) and external tools (CLI agents, scripts). The relay can be hosted two ways depending on the user's setup:

**Vite-based projects** — a Vite plugin attaches the WS server to the existing dev server:

```
┌─────────────────┐     WebSocket      ┌──────────────────┐     Vite HMR/WS     ┌──────────────────┐
│   External Tool  │◄──────────────────►│  Vite Dev Server  │◄──────────────────►│  Browser (TWD)    │
│  (Claude Code,   │   /__twd/ws        │  + twdRemote()    │                     │  TestRunner +     │
│   curl, script)  │                    │                    │                     │  handlers map     │
└─────────────────┘                    └──────────────────┘                     └──────────────────┘
```

**Non-Vite projects** (Webpack/CRA, Angular CLI, etc.) — a standalone server via the existing CLI:

```
┌─────────────────┐     WebSocket      ┌──────────────────┐      WebSocket       ┌──────────────────┐
│   External Tool  │◄──────────────────►│  npx twd-js       │◄───────────────────►│  Browser (TWD)    │
│  (Claude Code,   │   ws://localhost    │  remote            │   ws://localhost     │  TestRunner +     │
│   curl, script)  │   :9876/__twd      │  (standalone)      │   :9876/__twd        │  handlers map     │
└─────────────────┘                    └──────────────────┘                      └──────────────────┘
```

The key insight: **the protocol and browser-side code are identical in both cases**. Only the "who hosts the WebSocket server" part changes. This keeps TWD framework-agnostic — same as how `npx twd-js init public` already works for service worker setup across all frameworks.

- **Browser side:** TWD's initialization code connects to the WebSocket endpoint and listens for commands (run tests, query tree). It sends results back as tests execute.
- **External side:** Any tool connects to the same WebSocket endpoint and sends commands or queries. It receives real-time results as they stream in.
- **Relay server:** Routes messages between browser clients and external clients. Hosted by either the Vite plugin or the standalone CLI command.

## Server Hosting Options

The WebSocket relay logic is a shared core module. It can be hosted two ways:

### Option A: Vite Plugin — `twdRemote()` (Vite-based projects)

Attach the WS server to Vite's existing HTTP server. Same pattern as the existing `twdHmr()` plugin.

```ts
// vite.config.ts
import { twdHmr, twdRemote } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    twdHmr(),
    twdRemote(), // attaches /__twd/ws to Vite's dev server
  ]
});
```

**How it works:**
1. The Vite plugin hooks into `configureServer` and upgrades HTTP requests on `/__twd/ws` to WebSocket
2. On browser page load, TWD's initialization code connects to `ws://localhost:5173/__twd/ws` and identifies itself as `role: "browser"`
3. External tools connect to the same endpoint and identify as `role: "client"`
4. When a client sends a `run` command, the server forwards it to the browser
5. The browser executes tests and streams `test:start`, `test:pass`, `test:fail` events back
6. The server relays these events to all connected clients

**Pros:**
- Zero extra processes — piggybacks on the dev server the user is already running
- Same endpoint as the app itself, no extra port to manage
- Familiar pattern for Vite users (just another plugin)

### Option B: Standalone CLI — `npx twd-js remote` (Any framework)

A lightweight standalone WebSocket server. Follows the same pattern as the existing `npx twd-js init public` command that users of all frameworks already know.

```bash
npx twd-js remote              # starts on default port 9876
npx twd-js remote --port 4000  # custom port
```

**How it works:**
1. Starts a minimal Node.js HTTP + WebSocket server on `ws://localhost:9876/__twd`
2. The browser-side TWD code connects to this endpoint (configured via `initTWD({ remotePort: 9876 })` or auto-detected)
3. External tools connect to the same endpoint
4. Same relay logic as the Vite plugin — identical protocol

**Pros:**
- Framework-agnostic — works with Webpack, Angular CLI, any dev server
- Familiar CLI pattern for TWD users (`npx twd-js <command>`)
- Can run alongside any dev server without modifying its config

**Cons:**
- One extra process to run during development (but only when remote execution is desired)
- Requires the user to configure the port in TWD's init so the browser knows where to connect

### Shared Core

Both options use the same relay module internally. The Vite plugin and the standalone CLI are thin wrappers around a shared `createTwdRelay(server)` function. This means:

- The WebSocket protocol is identical regardless of hosting
- Browser-side client code doesn't change
- External tool code doesn't change
- Tests and documentation for the protocol apply to both

## Message Protocol

All messages are JSON. Each message has a `type` field that determines its schema.

### Client → Server (Commands)

**Run all tests:**
```json
{
  "type": "run",
  "scope": "all"
}
```

**Run a specific suite:**
```json
{
  "type": "run",
  "scope": "suite",
  "id": "abc123def"
}
```

**Run a single test:**
```json
{
  "type": "run",
  "scope": "test",
  "id": "xyz789ghi"
}
```

**Query the test tree:**
```json
{
  "type": "tree"
}
```

**Query current status:**
```json
{
  "type": "status"
}
```

### Server → Client (Events)

**Connection acknowledgment:**
```json
{
  "type": "connected",
  "browser": true,
  "testCount": 42
}
```

**Browser not connected (error):**
```json
{
  "type": "error",
  "code": "NO_BROWSER",
  "message": "No browser client is connected. Open the app in a browser first."
}
```

**Test tree response:**
```json
{
  "type": "tree:result",
  "tree": [
    {
      "id": "s1",
      "name": "Login Page",
      "type": "suite",
      "children": [
        {
          "id": "t1",
          "name": "shows login form",
          "type": "test",
          "status": "idle"
        },
        {
          "id": "t2",
          "name": "validates email format",
          "type": "test",
          "status": "pass"
        }
      ]
    }
  ]
}
```

**Test lifecycle events (streamed during a run):**

```json
{ "type": "run:start", "total": 12 }
```

```json
{ "type": "test:start", "id": "t1", "name": "shows login form", "suite": "Login Page" }
```

```json
{ "type": "test:pass", "id": "t1", "name": "shows login form", "duration": 45 }
```

```json
{
  "type": "test:fail",
  "id": "t2",
  "name": "validates email format",
  "duration": 120,
  "error": "expected 'Please enter email' to equal 'Please enter a valid email'",
  "logs": [
    "{\"type\":\"CHAI_DIFF\",\"expected\":\"Please enter a valid email\",\"actual\":\"Please enter email\"}"
  ]
}
```

```json
{ "type": "test:skip", "id": "t3", "name": "remembers me checkbox" }
```

```json
{
  "type": "run:complete",
  "summary": {
    "total": 12,
    "passed": 10,
    "failed": 1,
    "skipped": 1,
    "duration": 1340
  }
}
```

### Connection Handshake

When a client connects, it sends a `hello` message identifying its role:

```json
{ "type": "hello", "role": "browser" }
```

```json
{ "type": "hello", "role": "client", "name": "claude-code" }
```

The server responds with a `connected` message indicating the current state (whether a browser is connected, how many tests are registered, etc.).

### Error Handling

All errors follow a consistent format:

```json
{
  "type": "error",
  "code": "NO_BROWSER" | "RUN_IN_PROGRESS" | "INVALID_ID" | "UNKNOWN_COMMAND",
  "message": "Human-readable description"
}
```

## Integration Examples

### Claude Code — MCP Server

An MCP server (or Claude Code hook) connects to the TWD WebSocket and exposes tools:

```
Tool: twd_run_tests
  - Connects to the relay (auto-detects Vite plugin or standalone port)
  - Sends { type: "run", scope: "all" }
  - Collects streamed results
  - Returns formatted summary to Claude

Tool: twd_get_test_tree
  - Sends { type: "tree" }
  - Returns structured test list for Claude to reason about
```

This enables workflows like:
1. Claude edits code
2. Claude runs `twd_run_tests`
3. Claude reads failures, fixes code
4. Claude re-runs — tests pass
5. Claude commits

### Custom Local Script

A simple Node.js script can connect to the relay during development — useful for custom automation, pre-commit hooks, or any local tooling:

```js
import WebSocket from 'ws';

// Connect to whichever relay is running:
// Vite: ws://localhost:5173/__twd/ws
// Standalone: ws://localhost:9876/__twd
const ws = new WebSocket('ws://localhost:9876/__twd');

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'hello', role: 'client', name: 'my-script' }));
  ws.send(JSON.stringify({ type: 'run', scope: 'all' }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);

  switch (msg.type) {
    case 'test:pass':
      console.log(`  ✓ ${msg.name} (${msg.duration}ms)`);
      break;
    case 'test:fail':
      console.log(`  ✗ ${msg.name}`);
      console.log(`    ${msg.error}`);
      break;
    case 'run:complete':
      console.log(`\n${msg.summary.passed}/${msg.summary.total} passed`);
      ws.close();
      break;
  }
});
```

### Cursor / VS Code Extension (Future)

A VS Code extension could:
1. Auto-detect the relay endpoint (check Vite port or standalone port)
2. Connect and subscribe to test events
3. Display results in the Test Explorer panel
4. Trigger runs from the editor (e.g., click "Run" on a test name)

> **Out of scope:** CI pipelines. The existing `twd-cli` with Puppeteer/Playwright handles CI. This feature is strictly for local development workflows.

## Current Architecture Context

Understanding the existing pieces is key to seeing where the bridge fits in.

### TestRunner (`src/runner.ts`)

The `TestRunner` class accepts a `RunnerEvents` callback object:

```ts
interface RunnerEvents {
  onStart: (test: Handler) => void;
  onPass: (test: Handler) => void;
  onFail: (test: Handler, error: Error) => void;
  onSkip: (test: Handler) => void;
  onSuiteStart?: (suite: Handler) => void;
  onSuiteEnd?: (suite: Handler) => void;
}
```

Tests are stored in a global `handlers` Map (`window.__TWD_STATE__.handlers`). Each `Handler` has an `id`, `name`, `type` (suite/test), `status`, `parent`, `children`, and `logs`. The runner supports `runAll()` and `runSingle(id)`.

The runner is exposed globally: `window.__testRunner = TestRunner`.

### CI Execution (`src/runner-ci.ts`)

`executeTests()` creates a `TestRunner` with simple callbacks that push results into an array:

```ts
const testStatus: TestResult[] = [];
const runner = new TestRunner({
  onPass: (test) => testStatus.push({ id: test.id, status: "pass" }),
  onFail: (test, err) => testStatus.push({ id: test.id, status: "fail", error: err.message }),
  onSkip: (test) => testStatus.push({ id: test.id, status: "skip" }),
});
```

This is exactly the pattern the browser-side WebSocket client would follow — create a `TestRunner` with callbacks that serialize events and send them over the WebSocket.

### Vite Plugin (`src/vite-plugin.ts`)

Currently exports two plugins:
- `twdHmr` — Forces full page reload when `.twd.test.ts` files change (prevents duplicate test entries from HMR)
- `removeMockServiceWorker` — Removes mock service worker in build

The `twdHmr` plugin already hooks into `handleHotUpdate` and accesses `server.ws`. A `twdRemote` plugin would be a natural addition alongside these — same pattern, same export location.

### CLI (`src/cli/`)

TWD already has a CLI entry point for `npx twd-js init public` (service worker installation). The `npx twd-js remote` command would be added here — same pattern, same tool. Users of non-Vite frameworks are already familiar with running `npx twd-js` commands.

### Sidebar UI (`src/ui/TWDSidebar.tsx`)

The sidebar creates its own `TestRunner` instance with callbacks that update React state. This is the "consumer" of test results today. The remote bridge would be a second consumer — both can coexist since they'd use separate `TestRunner` instances or share events.

### Bundled Entry (`src/bundled.tsx`)

`initTWD()` initializes tests and renders the sidebar. This is where the browser-side WebSocket client would be initialized — after tests are registered, connect to the relay endpoint and listen for run commands. The connection target would depend on configuration:
- Vite plugin: `ws://localhost:<vite-port>/__twd/ws` (same origin, auto-detected)
- Standalone: `ws://localhost:<remote-port>/__twd` (configured via `remotePort` option)

## Implementation Phases

### Phase 1: Core Relay + Vite Plugin

- Shared relay module: `createTwdRelay(httpServer)` — handles WS upgrade, client tracking, message routing
- Vite plugin: `twdRemote()` that calls `createTwdRelay()` with Vite's HTTP server
- Browser-side: after `initTWD()`, connect to the WS and handle `run` commands by creating a `TestRunner` with WS-emitting callbacks
- External side: connect, send `{ type: "run", scope: "all" }`, receive streamed events
- Deliver: basic run-all with real-time result streaming (Vite projects only)

### Phase 2: Standalone CLI + Non-Vite Support

- CLI command: `npx twd-js remote` that starts a standalone HTTP + WS server using the same `createTwdRelay()` core
- Browser-side: support configurable endpoint (`initTWD(files, { remote: true, remotePort: 9876 })`)
- Deliver: same functionality as Phase 1, but works with Webpack, Angular CLI, or any dev server

### Phase 3: Selective Execution & Test Tree

- Support `run` with `scope: "suite"` and `scope: "test"` + `id`
- Implement `tree` command that serializes the `handlers` map into a structured tree
- Support `status` command for current runner state

### Phase 4: Watch Mode & Auto-Run

- Detect HMR / page reloads and notify connected clients that the test tree has changed
- Optional: auto-run tests on file change and stream results to connected clients
- Reconnection handling — when the browser reloads, the WS client auto-reconnects

### Phase 5: MCP Server for Claude Code

- Dedicated package (`twd-mcp`) or built into `twd-js`
- Wraps the WebSocket protocol into MCP tools (`twd_run_tests`, `twd_get_tree`, `twd_get_failures`)
- Configuration via `twd.config.json`

## Edge Cases & Open Questions

### What if the browser is not connected?
Return an error immediately: `{ type: "error", code: "NO_BROWSER" }`. Don't queue commands — the user should open the app first. Optionally, the external tool could poll `status` until a browser connects.

### Multiple browsers/tabs connected?
Two approaches:
- **Single-client mode (simpler):** Only the most recent browser connection is active. Previous connections are closed.
- **Broadcast mode:** Run commands are sent to all browsers, results are aggregated. This is complex and likely not needed initially.

Recommendation: single-client mode for Phase 1.

### Tests already running when a new run is requested?
Options:
- **Reject:** Return `{ type: "error", code: "RUN_IN_PROGRESS" }` and let the client retry
- **Queue:** Queue the new run and execute after the current one finishes
- **Cancel + restart:** Cancel the current run and start the new one (complex — requires cooperative cancellation)

Recommendation: reject for Phase 1, queue for Phase 2.

### Authentication / security for the WS endpoint?
In dev mode, the dev server (Vite, Webpack, Angular CLI) is already accessible on localhost without authentication. The WS endpoint follows the same trust model — localhost-only by default. The standalone `npx twd-js remote` server would also bind to `127.0.0.1` by default. For teams that expose dev servers on a network, an optional token-based auth could be added later.

### Should this be opt-in or always available?
**Opt-in** in both cases:

**Vite users** add the plugin explicitly:
```ts
import { twdHmr, twdRemote } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    twdHmr(),
    twdRemote(), // enables /__twd/ws on the dev server
  ]
});
```

**Non-Vite users** run the standalone command when needed:
```bash
npx twd-js remote  # starts the relay on port 9876
```

In both cases, the browser-side TWD code needs to know that remote is enabled. Options:
- `initTWD(files, { remote: true })` — explicit opt-in
- `initTWD(files, { remotePort: 9876 })` — explicit with custom port
- Auto-detect: TWD tries to connect to the relay on init; if it fails, silently continues without remote support

### How to handle page reloads (HMR, manual refresh)?
The browser-side WS client should reconnect automatically after any page reload (HMR in Vite, live-reload in Webpack, manual refresh). On reconnection, it re-sends the `hello` message and the relay notifies connected external clients that the browser is back with `{ type: "browser:reconnected", testCount: N }`.

### How does this interact with the existing sidebar?
Both coexist. The sidebar uses its own `TestRunner` instance with React-state callbacks. The remote bridge creates a separate `TestRunner` instance (or wraps the same one) with WebSocket-emitting callbacks. When an external tool triggers a run, the sidebar should also reflect the results — this means they should share the same `handlers` state (which they already do, since `handlers` is a global Map on `window.__TWD_STATE__`).

### What about test file errors (syntax errors, import failures)?
If a test file fails to load, the test tree is incomplete. The browser-side client should detect this (e.g., via `window.onerror`) and report it:
```json
{
  "type": "error",
  "code": "LOAD_ERROR",
  "message": "Failed to load test file: SyntaxError in login.twd.test.ts"
}
```
