# AI Integration

TWD produces structured, deterministic output that AI agents can parse and act on autonomously. Every test run returns the same pass/fail signals for the same inputs — no flakiness, no ambiguity. Whether you want your AI assistant to write better tests, generate tests from browser interactions, or run tests autonomously, TWD has you covered.

## Quick Start: Claude Code Plugin

The fastest way to get AI-powered TWD testing is with the [Claude Code plugin](https://github.com/BRIKEV/twd-ai):

```bash
claude plugin install BRIKEV/twd-ai
```

This gives Claude Code two capabilities:

| Command | Description |
|---------|-------------|
| `/twd:setup` | Interactive setup — detects your project config and generates `.claude/twd-patterns.md` |
| `twd` skill | Autonomous agent — writes tests, runs them via twd-relay, fixes failures, and re-runs until green |

### Other AI Tools

For Cursor, Copilot, Windsurf, and other AI tools, use the [Agent Skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add BRIKEV/twd-ai
```

This copies TWD context into your AI tool's configuration file (`.cursorrules`, `.github/copilot-instructions.md`, etc.).

---

## Features at a Glance

### 1. AI Context

Teach your AI assistant (Claude, Cursor, Copilot, Windsurf) how to write correct TWD tests by providing a comprehensive prompt with API reference, patterns, and common pitfalls.

**Best for:** Getting AI to write correct TWD tests on the first try.

[Read the AI Context guide](/agents)

---

### 2. AI Remote Testing (twd-relay)

A WebSocket bridge that lets AI agents trigger test runs and stream results back, without launching a browser automation tool. Your Vite dev server is already running with TWD loaded -- the relay just connects to it.

**Best for:** AI agents that need to run tests, read failures, and iterate.

[Read the AI Remote Testing guide](/ai-remote-testing)

---

### 3. Auto-Invocation (Claude Code)

When you install the TWD plugin (`claude plugin install BRIKEV/twd-ai`), Claude Code can automatically invoke the testing agent when it detects the task is relevant. For example:

- You ask: _"Add a search filter to the orders page"_
- Claude implements the feature
- Claude sees the `twd` skill and spawns it as a sub-agent
- The agent writes tests, runs them via `npx twd-relay run`, reads failures, fixes, and re-runs until green
- Claude continues with your task

The agent works autonomously in a forked context — your main conversation isn't cluttered with test-writing steps. You can also set up your project interactively:

```
/twd:setup
```

---

## How They Work Together

You can use these features independently or combine them:

```
AI Context           →  AI writes better tests
AI Remote Testing    →  AI runs tests and reads results
Claude Code Plugin   →  AI writes, runs, and fixes tests autonomously
```

A typical workflow:

1. **Plugin / Skills** install TWD context into your AI agent
2. The **TWD agent** writes tests, runs them via twd-relay, and fixes failures
3. The autonomous validation loop continues until all tests pass

::: info MCP Integration
TWD also provides an experimental MCP server that works with Playwright MCP to generate test code from browser automation data. This is an early feature — if you're interested, check the [TWD MCP package](https://github.com/BRIKEV/twd-mcp) for details.
:::
