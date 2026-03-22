---
title: Claude Code Plugin
description: Install and use the TWD plugin for Claude Code to write and run tests automatically
---

# Claude Code Plugin

The [TWD plugin for Claude Code](https://github.com/BRIKEV/twd-ai) gives Claude a set of skills: project setup, autonomous test writing, CI configuration, test quality analysis, gap detection, and visual test documentation.

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

That's it. You now have access to all TWD skills and commands.

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

## `/twd:ci-setup` — CI/CD Configuration

Sets up CI/CD for TWD tests — installs `twd-cli`, optionally configures code coverage, and generates a GitHub Actions workflow.

```
/twd:ci-setup
```

### What It Does

- Detects your project setup (framework, Vite config, existing workflows)
- Installs `twd-cli` for headless test running
- Optionally sets up code coverage with `vite-plugin-istanbul` + `nyc` (requires Vite)
- Generates `.github/workflows/twd-tests.yml`

---

## `/twd:test-flow-gallery` — Visual Test Documentation

Reads TWD test files and generates visual Mermaid flowcharts with plain-language summaries — living documentation auto-generated from real tests.

```
/twd:test-flow-gallery
```

### What It Does

- Reads all `*.twd.test.{ts,js}` files in the project
- Generates a `.flows.md` file next to each test file with Mermaid diagrams
- Creates a `test-flow-gallery.md` index at the project root
- Each `it()` block gets a plain-language summary and color-coded flowchart (purple visit nodes, blue actions, green assertions, orange API subgraphs)

### Example Output

```
## Items Page

**What this tests:** A user navigates to the items page and sees a list of
all available items. The page loads data from the API and displays each item
as a list entry.
```

---

## `/twd:test-gaps` — Untested Pages Report

Scans project routes and cross-references against TWD test files to find untested pages, classify risk, and generate a prioritized gap report.

```
/twd:test-gaps
```

### What It Does

- Detects your framework and reads the route config (React Router, Vue Router, Angular, Next.js, Nuxt, SolidJS)
- Discovers all TWD test files and extracts tested routes
- Identifies untested and partially tested pages
- Classifies risk: **HIGH** (mutations, payments), **MEDIUM** (auth, complex loading), **LOW** (static, read-only)
- Outputs a prioritized "Start Here" top-5 list

### Example Output

```
## Summary
- Pages/routes discovered: 22
- Pages with tests: 15
- Pages partially tested: 2
- Pages untested: 5

## UNTESTED Pages — HIGH Risk
| Page          | Path              | Why High Risk                    |
|---------------|-------------------|----------------------------------|
| Checkout      | /checkout         | Handles payments — direct impact |
| User Settings | /settings/account | Has delete account flow          |
```

If no TWD tests are found, the skill detects other test frameworks (Playwright, Jest, etc.) and explains how TWD complements them.

---

## `/twd:test-quality` — Test Quality Grading

Reads TWD test files, evaluates quality across four dimensions, assigns letter grades (A/B/C/D), and generates an improvement report.

```
/twd:test-quality
```

### What It Does

- Grades each test file across 4 dimensions:
  - **Journey Coverage** (35%) — complete user flows vs visibility-only checks
  - **Interaction Depth** (20%) — variety of `userEvent` types (click, type, keyboard, etc.)
  - **Assertion Quality** (25%) — `be.visible` (weak) to `deep.equal` on API payloads (strong)
  - **Error & Edge Cases** (20%) — error states, empty states, cancel flows
- Assigns a final letter grade per file and an overall project grade
- Generates specific grade-up suggestions per file
- Ranks improvements by impact

### Example Output

```
# TWD Test Quality Report
Files analyzed: 8
Overall grade: C

## Grade Distribution
| Grade | Count | Files                                              |
|-------|-------|----------------------------------------------------|
| A     | 2     | user-list.twd.test.ts, order-list.twd.test.ts     |
| D     | 2     | payment-list.twd.test.ts, item-create.twd.test.ts |

### payment-list.twd.test.ts — Grade D
| Dimension          | Grade | Notes                              |
|--------------------|-------|------------------------------------|
| Journey Coverage   | D     | 1 test, visibility check only      |
| Interaction Depth  | D     | No userEvent calls                 |
| Assertion Quality  | D     | Only be.visible and greaterThan(1) |
| Error & Edge Cases | D     | Only happy path                    |

**To reach grade C:** Add a search test with userEvent.type + URL assertion.
Add column header assertions with have.text.
```

Works best alongside `/twd:test-gaps` — gaps tells you **what's untested**, quality tells you **if existing tests are any good**.

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
