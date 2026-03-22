---
title: Claude Code Plugin
description: Install and use the TWD plugin for Claude Code to write and run tests automatically
---

# Claude Code Plugin

The [TWD plugin for Claude Code](https://github.com/BRIKEV/twd-ai) gives Claude two skills: an interactive project setup wizard and an autonomous testing agent that writes, runs, and fixes TWD tests for you.

## Installation

First, add it from the Claude Code marketplace:

```bash
claude plugin marketplace add BRIKEV/twd-ai
```

Then install the plugin skills:

```bash
claude plugin install twd@twd-ai
# or update
claude plugin update twd@twd-ai
```

That's it. You now have access to `/twd:setup` and the `twd` skill.

## `/twd:setup` — Interactive Project Setup

Run this once per project. Claude analyzes your codebase and asks a series of questions to configure TWD for your stack.

```
/twd:setup
```

### What It Auto-Detects

Before asking you anything, setup scans your project for:

- **Framework** — React, Vue, Angular, or Solid.js
- **Vite config** — `vite.config.ts` / `vite.config.js` location
- **Entry point** — your main app file (e.g., `main.tsx`, `main.ts`)
- **CSS libraries** — Tailwind, Bootstrap, Material UI, etc.
- **API folder** — common patterns like `src/api/`, `src/services/`

### Interactive Questions

Setup then confirms or asks about:

| Question | Why it matters |
|----------|---------------|
| Framework confirmation | Determines import style and bundled vs. standard setup |
| Base path | For `twd.visit()` calls if your app doesn't serve from `/` |
| Public folder | Where to install the Mock Service Worker script |
| Dev server port | So the relay connects to the right Vite server |
| Entry point file | Where to add TWD initialization code |
| API folder path | So the agent knows where your API calls live for mocking |
| CSS / component library | So tests use the right selectors for your UI kit |
| Auth middleware | So the agent knows to stub auth in tests |
| Third-party modules to mock | Any modules that need the Sinon stub pattern |

### What It Generates

The primary output is **`.claude/twd-patterns.md`** — a project-specific context file that tells Claude (and the `twd` skill) exactly how to write tests for your app. See [below](#claude-twd-patterns-md) for details.

### Optional Automated Setup

After generating the patterns file, setup can also:

- Install `twd-js` and `twd-relay` packages
- Run `npx twd-js init public` to install the service worker
- Add TWD initialization to your entry point
- Add `twdHmr()` and `twdRemote()` to your Vite config
- Create a first test file to validate the setup

You can accept or skip each step.

---

## `twd` Skill — Autonomous Testing Agent

The `twd` skill is an autonomous agent that writes tests, runs them, and fixes failures. You can invoke it explicitly or Claude can spawn it as a sub-agent when it detects testing is relevant.

### Examples

```
Write TWD tests for the Login page
```

```
Add tests for the checkout flow — mock the payment API
```

```
Test the user profile component with auth mocking
```

### The 5-Phase Workflow

When the agent runs, it follows this sequence:

#### 1. Detect

Reads your project structure, `.claude/twd-patterns.md`, and existing test files to understand your app.

#### 2. Setup

Checks that `twd-js` and `twd-relay` are installed and that the relay is configured. If anything is missing, it tells you what to set up.

#### 3. Write

Writes test files following your project's patterns — correct imports, selectors, mock patterns, and file naming conventions.

#### 4. Run & Fix

Runs tests via `npx twd-relay run` and reads the structured output. If tests fail:

- **Isolates** the failing test with `--test "name"` to reduce noise (e.g. `npx twd-relay run --test "should show error"`)
- **Reads the error** and fixes the test code
- **Re-runs** the isolated test
- **Repeats** up to 3 attempts per failing test
- If still failing after 3 attempts, marks the test as `it.skip` with a comment explaining why

#### 5. Report

Outputs a summary of what was tested, what passed, and what was skipped (if any).

### Auto-Invocation

When the plugin is installed, Claude Code can automatically invoke the `twd` skill as a sub-agent. For example:

1. You ask: _"Add a search filter to the orders page"_
2. Claude implements the feature
3. Claude sees the `twd` skill and spawns it
4. The agent writes tests, runs them, fixes failures
5. Claude continues with your original task

Your main conversation stays clean — the testing work happens in a forked context.

---

## `.claude/twd-patterns.md`

This file is the bridge between your project and the AI. It contains:

- **Project config** — framework, base path, entry point, Vite config location
- **Import patterns** — exact imports for your setup (bundled vs. standard)
- **Selector strategy** — which Testing Library queries to prefer for your UI kit
- **Mock patterns** — how to mock your API endpoints (URLs, methods, response shapes)
- **Auth patterns** — how to stub authentication for test isolation
- **Component mock patterns** — which components to wrap with `MockedComponent`
- **File conventions** — where test files go, naming pattern (`*.twd.test.ts`)

The `twd` skill reads this file before writing any test. If your project changes significantly (new API patterns, different auth system, etc.), re-run `/twd:setup` to regenerate it.

---

## Updating the Plugin

To update to the latest version, remove and reinstall:

```bash
# Remove and reinstall (the marketplace stays, only the plugin needs reinstalling)
claude plugin remove twd@twd-ai
claude plugin install twd@twd-ai
# or remove and reinstall
claude plugin remove twd@twd-ai
claude plugin add /path/to/twd-ai
```

---

## Supported Frameworks

The plugin works with any framework that TWD supports:

| Framework | Setup Type |
|-----------|-----------|
| React | Standard or Bundled |
| Vue | Bundled (recommended) |
| Angular | Bundled (recommended) |
| Solid.js | Bundled (recommended) |

All frameworks require **Vite** as the build tool. The plugin detects your framework during `/twd:setup` and adjusts the generated patterns accordingly.

---

::: tip Other AI Tools
The Claude Code plugin provides the richest experience, but you can use TWD with any AI tool. See the [AI Context & Prompts](/agents) page for Cursor, Copilot, Windsurf, and other agents.
:::
