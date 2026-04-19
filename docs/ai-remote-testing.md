---
title: AI Remote Testing
description: Connect AI coding agents to your running app via TWD Relay WebSocket bridge
---

# AI Remote Testing

TWD Relay (`twd-relay`) enables AI coding agents (Claude Code, Cursor, Copilot) to **run in-browser validations and read structured results** — without launching a browser automation tool. Your app is already running with TWD loaded; the relay just opens a WebSocket bridge so external tools can trigger test runs and stream results back.

::: tip How this fits with other AI features
- **[AI Context](/agents)** — Prompts so your AI writes correct TWD tests
- **AI Remote Testing (this page)** — Run tests and get results via WebSocket
- **[Auto-Invocation](/ai-overview#_3-auto-invocation-claude-code)** — Claude Code automatically writes, runs, and fixes tests
:::

## The Problem

During development, TWD tests run in the browser and results appear in the sidebar UI. That's great when you're looking at it — but AI agents run as CLI processes. They can edit files and run shell commands, but they can't click "Run All" in your browser.

The irony: the Vite dev server is already running, TWD is already loaded, and the test runner exists in memory. We just need a bridge.

AI agents need structured, parseable pass/fail signals — not screenshots or DOM dumps. The relay provides exactly that: consistent results the agent can read and act on.

## How It Works

The relay is a WebSocket server that routes messages between the **browser** (where TWD runs) and **external clients** (AI agents, scripts).

```
┌───────────────┐     WebSocket      ┌──────────────────┐                ┌───────────────────┐
│  AI Agent     │◄──────────────────►│  Relay Server    │◄──────────────►│  Browser (TWD)    │
│  (Claude Code,│   /__twd/ws        │  (Vite plugin or │                │  Test runner +    │
│   script)     │                    │   standalone)    │                │  sidebar UI       │
└───────────────┘                    └──────────────────┘                └───────────────────┘
```

1. Browser connects and identifies as `role: "browser"`
2. Client (AI agent) connects and identifies as `role: "client"`
3. Client sends `{ type: "run", scope: "all" }`
4. Relay forwards to browser → tests execute → events stream back
5. Client receives `run:complete` with all test results

## Requirements

::: warning Version requirements
- **twd-js** `>=1.5.2` — earlier versions do not support the relay protocol
- **twd-relay** `>=1.1.0` — earlier versions lack throttle-abort detection, heartbeat-based run recovery, and the tab indicator. `>=1.0.0` still works but without those safety features.
:::

## Installation

```bash
npm install --save-dev twd-relay
```

## Setup

### Option A: Vite Plugin (recommended)

If you already use Vite, attach the relay to your dev server — the WebSocket runs on the same host/port:

```ts
// vite.config.ts
import { twdRemote } from 'twd-relay/vite';

export default defineConfig({
  plugins: [
    react(),
    twdRemote(),  // adds /__twd/ws to your dev server
  ],
});
```

Then connect the browser client in your app entry:

```ts
// main.ts
import { createBrowserClient } from 'twd-relay/browser';

const client = createBrowserClient();
client.connect();
```

When using the Vite plugin the URL is auto-detected — no configuration needed.

### Option B: Standalone Server

For non-Vite projects, run the relay as a separate process:

```bash
npx twd-relay --port 9876
```

Then connect the browser client with an explicit URL:

```ts
import { createBrowserClient } from 'twd-relay/browser';

const client = createBrowserClient({
  url: 'ws://localhost:9876/__twd/ws',
});
client.connect();
```

## Tab Identifier

Once the browser client connects, the tab's favicon turns blue and its title gains a `[TWD]` prefix. The prefix reflects the current state so you can spot the active TWD tab at a glance, especially when multiple tabs are open to the same origin (a common dev scenario).

| Favicon | Title prefix | State |
|---|---|---|
| Blue | `[TWD]` | Connected, idle |
| Orange | `[TWD ...]` | Tests running |
| Green | `[TWD ✓]` | Last run passed |
| Red | `[TWD ✗]` | Last run failed or was aborted |

On disconnect or eviction (another tab taking over the relay slot), the original favicon and title are restored automatically. The indicator requires no configuration — it's on by default when the browser client is connected.

## Triggering a Test Run

Once the relay is running and the browser is connected, use the `twd-relay run` CLI to trigger tests:

```bash
# If using the Vite plugin (default port 5173)
npx twd-relay run

# If using the standalone relay on a custom port
npx twd-relay run --port 9876

# With a custom timeout (default: 180s)
npx twd-relay run --timeout 30000

# Run specific tests by name (substring match, case-insensitive)
npx twd-relay run --test "should show error"

# Run multiple specific tests
npx twd-relay run --test "login" --test "signup"
```

The `--test` flag filters tests by name using substring matching. When used and no tests match, the CLI prints the available test names so you can correct the filter. This is especially useful for AI agents to run only the tests they're working on without modifying the test file.

The command connects to the relay, sends a run command, streams test output to the terminal, and exits with code 0 (all passed) or 1 (failures or timeout). Example output:

```
Connecting to ws://localhost:5173/__twd/ws...
Browser connected, triggering test run...

Running 3 test(s)...

  RUN:  Counter > increments when button is clicked
  PASS: Counter > increments when button is clicked (42ms)
  RUN:  Counter > resets to zero
  PASS: Counter > resets to zero (18ms)
  RUN:  Counter > displays initial value
  PASS: Counter > displays initial value (5ms)

--- Run complete ---
Passed: 3 | Failed: 0 | Skipped: 0
Duration: 0.1s
```

### From an AI agent

Add this to your agent's instructions (e.g. `CLAUDE.md`):

```text
To run TWD tests: npx twd-relay run
To run specific tests: npx twd-relay run --test "test name"
Exit code 0 means all tests passed; 1 means failures or errors.
```

The agent can then run tests, read failures, fix code, and re-run — all in a tight loop without needing Playwright or Puppeteer. This is the core AI iteration loop: write, run, read, fix, repeat.

## Visibility Fallback

When an AI agent triggers tests via the relay, the browser tab is typically in the background (you're in your editor or terminal). This causes `@testing-library/user-event` methods like `type()` to behave incorrectly because the element doesn't truly have focus.

TWD handles this automatically. The `userEvent` proxy detects when the document is hidden or unfocused and falls back to a programmatic approach:

- Sets the value using the native input setter (required for React controlled inputs)
- Dispatches `input` and `change` events so frameworks pick up the change

This happens transparently — your tests don't need to change. It currently applies to `userEvent.type()`. Other methods like `click()` work normally even when the tab is in the background.

## Handling Throttled or Stuck Runs

Chrome aggressively throttles timers in backgrounded tabs. A test run that normally finishes in ~1 second can stretch to 20+ seconds when the TWD tab isn't focused. The relay and browser client cooperate on two recovery mechanisms so AI agents and CI scripts never hang silently waiting on a frozen or throttled tab.

### Throttle-abort

The browser client monitors wall-clock time for each test. If any single test exceeds **5 seconds** (default, configurable), it aborts the run and emits a new `run:aborted` event. The CLI prints a clear multi-line error and exits with code 1:

```
Run aborted: test "App interactions > test button" ran for 5.4s — threshold exceeded.
The TWD browser tab is likely backgrounded and throttled by the browser.
Foreground the TWD tab (identified by the "[TWD …]" title prefix) and keep it active, then retry.
For unattended runs, prefer `twd-cli` which drives a headless browser with no tab throttling.
```

Tune the threshold when a test legitimately needs longer:

```bash
# Raise the threshold to 15 seconds
npx twd-relay run --max-test-duration 15000

# Disable abort detection entirely
npx twd-relay run --max-test-duration 0
```

Or per-project via the browser client option:

```ts
createBrowserClient({ maxTestDurationMs: 15000 });
```

Detection fires on two triggers for reliability: the 3-second heartbeat tick (for in-flight tests) and on every test completion (for tests that just barely stay under the heartbeat window). This catches the common throttling pattern where each test stretches to 4–8 seconds individually.

::: tip Prefer `twd-cli` for CI and unattended agents
`npx twd-cli run` drives a headless Chrome where the page is always foregrounded, so tab throttling never applies. No abort threshold needed. Use the relay for interactive dev, `twd-cli` for automated runs.
:::

### Frozen-tab recovery

While a run is in progress the browser client sends a heartbeat every 3 seconds. If the relay stops receiving heartbeats for 120 seconds (e.g. the tab was closed, crashed, or Chrome froze it completely), the relay marks the run as abandoned and broadcasts a `run:abandoned` event. The CLI surfaces this with a clear error and exits 1:

```
Run abandoned — browser tab appears frozen. Refresh the browser tab and retry.
```

The run lock is cleared automatically so the next run can start without a manual reset.

### Improved `RUN_IN_PROGRESS` error

If a second `run` command arrives while one is already active, the relay now returns a detailed recovery message instead of the old bare sentence:

```
[RUN_IN_PROGRESS] A test run is already in progress. If the previous run appears
stuck, the browser tab may be backgrounded and throttled — foreground the TWD tab
(identified by the "[TWD …]" title prefix) or reload it. The relay also auto-clears
the lock after 120s of heartbeat silence.
```

The error `code` is unchanged (`RUN_IN_PROGRESS`) — only the human-readable `message` is richer. Existing code that dispatches on `code` continues to work.

## Protocol Reference

All messages are JSON over WebSocket. The `twd-relay run` CLI handles this protocol for you, but if you want to build a custom client:

### Client → Relay

| Message | Description |
|---------|-------------|
| `{ type: "hello", role: "client" }` | Identify as an external client |
| `{ type: "run", scope: "all" }` | Run all tests |
| `{ type: "run", scope: "all", testNames: ["..."] }` | Run tests matching names (substring, case-insensitive) |
| `{ type: "run", scope: "all", maxTestDurationMs: 15000 }` | Run all tests with a custom per-test abort threshold (ms). `0` disables detection. Omit to use the browser client's default (5000). |

### Browser → Relay

| Message | Description |
|---------|-------------|
| `{ type: "hello", role: "browser" }` | Identify as the browser |
| `{ type: "heartbeat" }` | Sent every 3 seconds during a run. Not forwarded to clients; drives the relay's 120-second `run:abandoned` timeout. |

### Browser → Relay → Client

| Message | Description |
|---------|-------------|
| `{ type: "connected", browser: true }` | Browser is connected and ready |
| `{ type: "test:start", testId, name }` | A test started running |
| `{ type: "test:pass", testId, name }` | A test passed |
| `{ type: "test:fail", testId, name, error }` | A test failed |
| `{ type: "test:skip", testId, name }` | A test was skipped |
| `{ type: "run:complete", passed, failed, skipped, duration }` | All tests finished (also emitted after `run:aborted`, so the lock clears) |
| `{ type: "run:aborted", reason: "throttled", durationMs, testName }` | Browser aborted because a test exceeded the threshold. Followed immediately by `run:complete`. |
| `{ type: "run:abandoned", reason: "heartbeat_timeout" }` | Relay declared the run abandoned after 120 s of heartbeat silence. |

## Sidebar Integration

When the relay triggers a test run, the TWD sidebar updates in real time. The browser client dispatches a `twd:state-change` event after each status update, and the sidebar listens for it to re-render with the latest results. You don't need to configure anything — if the relay is connected, the sidebar reflects relay-triggered runs automatically.
