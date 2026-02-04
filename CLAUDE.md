# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TWD (Testing Web Development) is an in-browser testing library that runs tests directly in the browser with a sidebar UI for instant visual feedback. It's designed for SPAs with deterministic, client-side UI testing - not suitable for SSR-first architectures (Next.js App Router, server-side features).

## Common Commands

```bash
# Development
npm run dev                    # Vite dev server

# Build (outputs to dist/)
npm run build                  # Full build: vite + service worker + bundle

# Testing with Vitest
npm test                       # Run tests in watch mode
npm run test:ci                # Run tests with coverage (CI mode)
npm test src/tests/ui/twdSidebar.spec.tsx  # Run specific test file

# Documentation (VitePress)
npm run docs:dev               # Dev documentation server
npm run docs:build             # Build documentation
```

## Architecture

### Entry Points

- **`src/index.ts`** - Main public API exporting `twd`, `expect`, `userEvent`, `screenDom`
- **`src/twd.ts`** - Core TWD API (element selection, assertions, mocking, navigation)
- **`src/runner.ts`** - Test execution engine (`describe`, `it`, `beforeEach`, `afterEach`)
- **`src/bundled.tsx`** - Preact-based bundled version for framework-agnostic use (Vue, Angular, Solid)
- **`src/runner-ci.ts`** - CI/headless execution with results reporting
- **`src/vite-plugin.ts`** - Vite plugin utilities for HMR and mock service worker

### Key Modules

- **`src/asserts/`** - Assertion implementations (`have.text`, `be.visible`, `have.class`, etc.)
- **`src/commands/`** - Test commands (`mockBridge.ts` for MSW, `visit.ts` for navigation)
- **`src/ui/`** - Preact components for the sidebar UI (`TWDSidebar.tsx`, `TestList.tsx`)
- **`src/proxies/`** - Wrappers for `@testing-library/user-event` and `@testing-library/dom`
- **`src/initializers/`** - Test and sidebar initialization logic
- **`src/cli/`** - CLI tool for service worker installation (`npx twd-js init public`)

### Package Exports

```
twd-js           → Main API
twd-js/runner    → Test runner (describe, it, hooks)
twd-js/bundled   → Framework-agnostic Preact bundle
twd-js/runner-ci → CI execution
twd-js/vite-plugin → Vite plugin
twd-js/ui        → UI components (includes MockedComponent)
```

## Key Concepts

### Two Setup Approaches
- **Bundled (recommended)**: `initTWD()` from `twd-js/bundled` - handles React dependencies, auto-initializes mocking. Required for non-React frameworks.
- **Standard (React only)**: Manual `initTests()` with `TWDSidebar` component for full control.

### Element Selection
- **Testing Library (recommended)**: `screenDom` for scoped queries excluding sidebar, `screenDomGlobal` for portal-rendered elements (modals)
- **TWD Native**: `twd.get(selector)` returns TWDElemAPI with chainable `.should()` method

### Mocking Patterns
- **API Mocking**: `twd.mockRequest()` with Mock Service Worker. Must call `npx twd-js init public` to set up service worker.
- **Component Mocking**: Wrap with `MockedComponent` from `twd-js/ui`, then mock with `twd.mockComponent()`
- **Module Mocking**: Use Sinon library. Hooks must be exported as object properties (not named exports) due to ESM limitations.

### Important Gotchas
- `twd.initRequestMocking()` only needs to be called ONCE in main entry (bundled does this automatically)
- Always `twd.clearRequestMockRules()` and `twd.clearComponentMocks()` in `beforeEach` for test isolation
- Mock requests/components BEFORE visiting the page that uses them
- Use `twd.setInputValue()` only for special inputs (range, color, date) - use `userEvent` for text inputs
- If tests duplicate on HMR, add `twdHmr()` plugin to Vite config

### CI Execution
- Use `twd-cli` package or custom Puppeteer script with `twd-js/runner-ci`
- Configure via `twd.config.json` in repo root
- Puppeteer 24+ requires explicit browser install: `npx puppeteer browsers install chrome`

## Testing

Tests use Vitest with jsdom environment. Test files are in `src/tests/` mirroring the source structure. Setup file at `src/tests/setup.ts` configures Testing Library jest-dom matchers.

## Development Workflow

For testing changes in a real app context, use `examples/twd-test-app/`:

```bash
cd examples/twd-test-app
npm install
npm run dev
```

Test files in that app import directly from source (`../../../../src/`), so changes are immediately reflected.
