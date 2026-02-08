# AI Remote Testing

TWD Relay (`twd-relay`) enables AI coding agents (Claude Code, Cursor, Copilot) to **run your in-browser tests and read results** — without launching a browser automation tool. Your app is already running with TWD loaded; the relay just opens a WebSocket bridge so external tools can trigger test runs and stream results back.

::: tip How this fits with other AI features
- **[AI Context](/agents)** — Prompts so your AI writes correct TWD tests
- **[MCP Integration](/mcp-integration)** — Generate test code from browser automation
- **AI Remote Testing (this page)** — Run tests and get results via WebSocket
:::

## The Problem

During development, TWD tests run in the browser and results appear in the sidebar UI. That's great when you're looking at it — but AI agents run as CLI processes. They can edit files and run shell commands, but they can't click "Run All" in your browser.

The irony: the Vite dev server is already running, TWD is already loaded, and the test runner exists in memory. We just need a bridge.

## How It Works

The relay is a WebSocket server that routes messages between the **browser** (where TWD runs) and **external clients** (AI agents, scripts).

```
┌──────────────┐     WebSocket      ┌──────────────────┐                    ┌──────────────────┐
│  AI Agent     │◄──────────────────►│  Relay Server     │◄──────────────────►│  Browser (TWD)    │
│  (Claude Code,│   /__twd/ws        │  (Vite plugin or  │                    │  Test runner +    │
│   script)     │                    │   standalone)      │                    │  sidebar UI       │
└──────────────┘                    └──────────────────┘                    └──────────────────┘
```

1. Browser connects and identifies as `role: "browser"`
2. Client (AI agent) connects and identifies as `role: "client"`
3. Client sends `{ type: "run", scope: "all" }`
4. Relay forwards to browser → tests execute → events stream back
5. Client receives `run:complete` with all test results

## Installation

```bash
npm install twd-relay
```

Peer dependency: `twd-js` (>=1.4.0).

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

## Triggering a Test Run

Once the relay is running and the browser is connected, any WebSocket client can trigger tests. Here are common approaches:

### From a script

```bash
node -e '
  const Ws = require("ws");
  const w = new Ws("ws://localhost:9876/__twd/ws");
  let sent = false;
  w.on("open", () => w.send(JSON.stringify({ type: "hello", role: "client" })));
  w.on("message", d => {
    const m = JSON.parse(d);
    if (m.type === "connected" && m.browser && !sent) {
      sent = true;
      w.send(JSON.stringify({ type: "run", scope: "all" }));
    }
    if (m.type === "run:complete") {
      console.log(JSON.stringify(m.results, null, 2));
      w.close();
    }
  });
  w.on("close", () => process.exit(0));
'
```

### From an AI agent

Add this to your agent's instructions (e.g. `CLAUDE.md`):

```text
To run TWD tests, connect to ws://localhost:5173/__twd/ws (or port 9876 for standalone).
Send { type: "hello", role: "client" } then { type: "run", scope: "all" }.
Listen for "run:complete" to get results.
```

The agent can then run tests, read failures, fix code, and re-run — all in a tight loop without needing Playwright or Puppeteer.

## Visibility Fallback

When an AI agent triggers tests via the relay, the browser tab is typically in the background (you're in your editor or terminal). This causes `@testing-library/user-event` methods like `type()` to behave incorrectly because the element doesn't truly have focus.

TWD handles this automatically. The `userEvent` proxy detects when the document is hidden or unfocused and falls back to a programmatic approach:

- Sets the value using the native input setter (required for React controlled inputs)
- Dispatches `input` and `change` events so frameworks pick up the change

This happens transparently — your tests don't need to change. It currently applies to `userEvent.type()`. Other methods like `click()` work normally even when the tab is in the background.

## Protocol Reference

All messages are JSON over WebSocket.

### Client → Relay

| Message | Description |
|---------|-------------|
| `{ type: "hello", role: "client" }` | Identify as an external client |
| `{ type: "run", scope: "all" }` | Run all tests |
| `{ type: "run", scope: "single", testId: "..." }` | Run a specific test |

### Browser → Relay → Client

| Message | Description |
|---------|-------------|
| `{ type: "connected", browser: true }` | Browser is connected and ready |
| `{ type: "test:start", testId, name }` | A test started running |
| `{ type: "test:pass", testId, name }` | A test passed |
| `{ type: "test:fail", testId, name, error }` | A test failed |
| `{ type: "run:complete", results }` | All tests finished |

## Sidebar Integration

When the relay triggers a test run, the TWD sidebar updates in real time. The browser client dispatches a `twd:state-change` event after each status update, and the sidebar listens for it to re-render with the latest results. You don't need to configure anything — if the relay is connected, the sidebar reflects relay-triggered runs automatically.
