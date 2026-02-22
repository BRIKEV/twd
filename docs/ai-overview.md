# AI Integration

TWD produces structured, deterministic output that AI agents can parse and act on autonomously. Every test run returns the same pass/fail signals for the same inputs — no flakiness, no ambiguity. Whether you want your AI assistant to write better tests, generate tests from browser interactions, or run tests autonomously, TWD has you covered.

## Quick Start: Agent Skills

The fastest way to give your AI agent TWD context is with the [Agent Skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add BRIKEV/twd
```

This installs TWD skills directly into your AI agent (Claude Code, Cursor, Codex, and [35+ more](https://github.com/vercel-labs/skills#available-agents)) — no copy-pasting prompts, no manual configuration.

**Available skills:**

| Skill | Description |
|-------|-------------|
| `twd` | Full-lifecycle orchestrator — detects project state, sets up TWD, writes tests, runs them, and fixes failures |
| `twd-test-writer` | Teaches your AI how to write correct TWD tests |
| `twd-setup` | Guides your AI through TWD project setup |
| `twd-tester` | Autonomous test runner — runs existing tests, reads failures, fixes, and re-runs (Claude Code) |

```bash
# Install a specific skill
npx skills add BRIKEV/twd --skill twd-test-writer

# Install to a specific agent
npx skills add BRIKEV/twd -a claude-code -a cursor

# List available skills
npx skills add BRIKEV/twd --list
```

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

When you install TWD skills via `npx skills add BRIKEV/twd -a claude-code`, Claude Code can automatically invoke the testing agent when it detects the task is relevant. For example:

- You ask: _"Add a search filter to the orders page"_
- Claude implements the feature
- Claude sees the `twd-tester` skill and spawns it as a sub-agent
- The agent writes tests, runs them via `npx twd-relay run`, reads failures, fixes, and re-runs until green
- Claude continues with your task

The agent works autonomously in a forked context — your main conversation isn't cluttered with test-writing steps. You can also trigger it directly:

```
/twd-tester write tests for the login page
```

---

## How They Work Together

You can use these features independently or combine them:

```
AI Context           →  AI writes better tests
AI Remote Testing    →  AI runs tests and reads results
Agent Skills         →  AI writes, runs, and fixes tests autonomously
```

A typical workflow:

1. **Agent Skills** (`npx skills add BRIKEV/twd`) installs TWD context into your AI agent
2. **TWD skills** write tests, run them via twd-relay, and fix failures
3. The autonomous validation loop continues until all tests pass

::: info MCP Integration
TWD also provides an experimental MCP server that works with Playwright MCP to generate test code from browser automation data. This is an early feature — if you're interested, check the [TWD MCP package](https://github.com/BRIKEV/twd-mcp) for details.
:::
