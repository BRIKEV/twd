# AI Integration

TWD is built with AI agent support as a core feature. Whether you want your AI assistant to write better tests, generate tests from browser interactions, or run tests autonomously, TWD has you covered.

## Features at a Glance

### 1. AI Context

Teach your AI assistant (Claude, Cursor, Copilot, Windsurf) how to write correct TWD tests by providing a comprehensive prompt with API reference, patterns, and common pitfalls.

**Best for:** Getting AI to write correct TWD tests on the first try.

[Read the AI Context guide](/agents)

---

### 2. MCP Integration

Use the TWD MCP server with Playwright MCP to generate test code from browser automation data. Describe a user flow, and the AI captures DOM snapshots and network requests to produce a complete test file.

**Best for:** Generating tests from user flows without writing them manually.

[Read the MCP Integration guide](/mcp-integration)

---

### 3. AI Remote Testing (twd-relay)

A WebSocket bridge that lets AI agents trigger test runs and stream results back, without launching a browser automation tool. Your Vite dev server is already running with TWD loaded -- the relay just connects to it.

**Best for:** AI agents that need to run tests, read failures, and iterate.

[Read the AI Remote Testing guide](/ai-remote-testing)

---

### 4. Claude Code Skill

A pre-built Claude Code skill that autonomously writes TWD tests, runs them via twd-relay, reads failures, fixes issues, and re-runs until they pass. Works as a slash command (`/twd-tester`) or auto-invokes when Claude detects testing is needed.

**Best for:** Fully autonomous test writing with Claude Code.

[Read the Claude Code Skill guide](/claude-code-skill)

---

## How They Work Together

You can use these features independently or combine them:

```
AI Context           →  AI writes better tests
MCP Integration      →  AI generates tests from browser flows
AI Remote Testing    →  AI runs tests and reads results
Claude Code Skill    →  AI writes, runs, and fixes tests autonomously
```

A typical workflow with all features:

1. **AI Context** ensures your AI knows TWD's API and patterns
2. **MCP** generates an initial test from a user flow
3. **twd-relay** runs the test in the browser
4. **Claude Code Skill** iterates on failures until the test passes
