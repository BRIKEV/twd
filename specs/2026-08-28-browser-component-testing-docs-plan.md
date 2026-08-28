# Browser Component Testing Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Document browser component testing (Testing Library `render()` inside TWD) as a first-class capability, and fix the silent-failure trap that currently prevents it from working at all.

**Architecture:** A new Core Concepts page at `/component-testing` becomes the canonical home for the capability. Existing pages get correctness fixes (the default test file pattern does not match `.tsx`) plus cross-links. Landing copy, SEO metadata, llm ingestion files, and the two in-repo AI prompts are updated so the capability is discoverable by humans, search engines, and coding agents.

**Tech Stack:** VitePress 1.x, Vue 3 SFCs for the landing page, Node ESM build script for llm file generation. Docs only. No library source changes.

**Spec:** `specs/2026-08-28-browser-component-testing-docs-design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **Branch:** `docs/browser-component-testing`. Never commit to `main`.
- **No library source changes.** `src/plugin/twd.ts` is out of scope. Do not edit `DEFAULT_PATTERN`.
- **Article 2 must not be linked or cited anywhere.** It will not be published.
- **Article 1 URL (the only reference article):** `https://dev.to/kevinccbsg/no-more-fake-dom-testing-library-unit-tests-in-the-real-browser-3p77`
- **Reference repo URL:** `https://github.com/kevinccbsg/frontend-challenge` (a fork of `https://github.com/SabrinaFZ/frontend-challenge`).
- **The brace pattern, verbatim:** `/**/*.twd.test.{ts,tsx}`
- **The Vitest exclude, verbatim:**
  ```ts
  test: {
    exclude: [...configDefaults.exclude, '**/*.twd.test.*'],
  },
  ```
- **Accuracy limits.** React is documented as verified. Vue and Solid are mentioned as expected-to-work but explicitly unverified. Make no claim about Angular. Make no performance or speed comparison against Vitest or jsdom. Never claim browser component tests replace jsdom tests.
- **Do not use em-dashes (`—`) in any prose you write.** Use commas, colons, or parentheses.
- **Do not add `Co-Authored-By` or any tool attribution to commits.**
- **Ask before pushing or opening the PR.**

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `docs/component-testing.md` | Canonical guide for browser component testing | Create |
| `docs/.vitepress/config.mts` | Sidebar entry, SEO description, keywords | Modify |
| `docs/getting-started.md` | Install flag, file naming truth, troubleshooting | Modify |
| `docs/frameworks.md` | `.tsx` note beside the documented default | Modify |
| `docs/api/index.md` | `.tsx` note beside the documented default (2 places) | Modify |
| `docs/testing-library.md` | "Rendering components directly" section, scoping caveat | Modify |
| `docs/writing-tests.md` | Pointer near Element Selection | Modify |
| `docs/component-mocking.md` | Disambiguation line | Modify |
| `docs/.vitepress/theme/components/HomePage.vue` | New landing section, FAQ rewrite, new FAQ entry | Modify |
| `docs/public/llms.txt` | Hand-curated index entry and feature bullet | Modify |
| `scripts/generate-llms-full.mjs` | `ORDER` array placement | Modify |
| `ai-guides/TWD_PROMPT.md` | Component testing section for agents | Modify |
| `docs/agents.md` | Compact prompt lines for agents | Modify |
| `docs/community.md` | Article 1, reference repo row | Modify |

**Verification model for this plan.** There are no unit tests for documentation. Each task instead uses a red/green grep cycle: first run a command that proves the wrong or missing content is present, then make the change, then run a command that proves it is correct. Tasks touching config or new pages additionally run `npm run docs:build`.

---

### Task 1: Fix the `.tsx` silent-skip trap and the install flag

The default pattern is `'/**/*.twd.test.ts'` (`src/plugin/twd.ts:49`), but three docs pages tell readers to use `.tsx` filenames, and one of them states the default already covers `.tsx`. Component tests are `.tsx`, so this blocks the entire feature. Fix it before writing anything new.

**Files:**
- Modify: `docs/getting-started.md` (lines ~13-31, ~161-171, ~188-193)
- Modify: `docs/frameworks.md:46`
- Modify: `docs/api/index.md:51` and `docs/api/index.md:88`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: the brace pattern `'/**/*.twd.test.{ts,tsx}'` established as the documented way to enable `.tsx` discovery. Tasks 2, 6 reference this exact string.

- [ ] **Step 1: Prove the bugs exist**

```bash
cd /Users/kevinccbsg/brikev/twd
# Confirm the real default is .ts only
grep -n "DEFAULT_PATTERN" src/plugin/twd.ts
# Confirm the docs contradict it
grep -n "twd.test.tsx" docs/getting-started.md
grep -n "default: \`.twd.test.ts\` / \`.tsx\`" docs/getting-started.md
grep -n "npm install twd-js" docs/getting-started.md
```

Expected: `src/plugin/twd.ts:49` shows `'/**/*.twd.test.ts'`; `getting-started.md` recommends `.tsx` filenames, claims the default covers `.tsx`, and installs without `--save-dev`.

- [ ] **Step 2: Fix the install commands**

In `docs/getting-started.md`, replace the three install commands inside the `::: code-group` block:

```bash [npm]
npm install --save-dev twd-js
```

```bash [yarn]
yarn add --dev twd-js
```

```bash [pnpm]
pnpm add -D twd-js
```

- [ ] **Step 3: Fix the File Naming Convention section**

Replace the body of the `## File Naming Convention` section in `docs/getting-started.md` with:

````markdown
## File Naming Convention

We recommend naming your test files using the following patterns:

- `*.twd.test.ts`
- `*.twd.test.tsx`
- `*.twd.test.js`
- `*.twd.test.jsx`

::: warning The default pattern only matches `.ts`
The `twd()` plugin's default `testFilePattern` is `'/**/*.twd.test.ts'`. Files
ending in `.tsx` or `.jsx` are **not** discovered by default, and the failure is
silent: no error, no warning, and the tests simply never appear in the sidebar.

If you write component tests (which are `.tsx`), set the pattern explicitly:

```ts
// vite.config.ts
twd({ testFilePattern: '/**/*.twd.test.{ts,tsx}' })
```

See [Component Testing](/component-testing) for the full setup.
:::

You can customize this pattern in your test loader using different glob patterns.
````

- [ ] **Step 4: Fix the false claim in Troubleshooting**

In `docs/getting-started.md`, under `### Tests Not Loading`, replace item 2:

```markdown
2. Used a file name that matches your `testFilePattern`. The default is
   `'/**/*.twd.test.ts'`, which matches `.ts` only. If your tests are `.tsx` or
   `.jsx`, set `twd({ testFilePattern: '/**/*.twd.test.{ts,tsx}' })` or they will
   be skipped silently.
```

- [ ] **Step 5: Add the note in `frameworks.md`**

In `docs/frameworks.md`, replace the `testFilePattern` bullet at line 46:

```markdown
- **`testFilePattern`** (`string`, optional) - Glob pattern for discovering test files. Default: `'/**/*.twd.test.ts'`. This matches `.ts` only. For `.tsx` test files (including component tests) use `'/**/*.twd.test.{ts,tsx}'`.
```

- [ ] **Step 6: Add the note in `api/index.md`**

In `docs/api/index.md`, update both occurrences of the default so the comment reads:

```ts
//   testFilePattern?: string          // Glob for discovering test files (default: '/**/*.twd.test.ts', matches .ts only)
```

and

```ts
  testFilePattern?: string;     // Glob pattern for discovering test files (default: '/**/*.twd.test.ts', matches .ts only)
```

- [ ] **Step 7: Verify the fixes**

```bash
cd /Users/kevinccbsg/brikev/twd
grep -n "npm install --save-dev twd-js" docs/getting-started.md
grep -n "pnpm add -D twd-js" docs/getting-started.md
grep -n "matches .ts only" docs/frameworks.md docs/api/index.md
# This must now return nothing:
grep -n "default: \`.twd.test.ts\` / \`.tsx\`" docs/getting-started.md || echo "OK: false claim removed"
```

Expected: the first three greps hit; the last prints `OK: false claim removed`.

- [ ] **Step 8: Commit**

```bash
git add docs/getting-started.md docs/frameworks.md docs/api/index.md
git commit -m "docs: correct the default test file pattern and install flag

The twd() plugin default is '/**/*.twd.test.ts', which matches .ts only, but
getting-started recommended .tsx filenames and the troubleshooting section
claimed the default already covered .tsx. Files ending in .tsx were skipped
silently, with no error and no warning.

Also install twd-js with --save-dev, matching the twd-js page."
```

---

### Task 2: Create the Component Testing page

**Files:**
- Create: `docs/component-testing.md`
- Modify: `docs/.vitepress/config.mts` (sidebar `Core Concepts` array)

**Interfaces:**
- Consumes: the brace pattern string established in Task 1.
- Produces: the route `/component-testing`, linked by Tasks 3, 4, 5, 7. The page anchors `#queries`, `#setup` and `#choosing-between-component-and-flow-tests` are referenced by Task 3.

- [ ] **Step 1: Prove the page does not exist**

```bash
cd /Users/kevinccbsg/brikev/twd
ls docs/component-testing.md 2>&1 | head -1
grep -rn "render(" docs/testing-library.md || echo "OK: render() undocumented today"
```

Expected: no such file; `render()` appears nowhere in the Testing Library page.

- [ ] **Step 2: Create `docs/component-testing.md`**

````markdown
---
title: Component Testing
description: Render a single component in isolation with Testing Library, in a real browser, alongside your flow tests and under one coverage report
---

# Component Testing in the Real Browser

Call Testing Library's `render()` inside a TWD test and the component mounts into
your running app, in your real browser. Same Testing Library API you already use,
no simulated DOM underneath.

::: tip Not to be confused with Component Mocking
This page is about **rendering a component in isolation and testing it**. If you
want to **replace** a child component with a stub, see
[Component Mocking](/component-mocking).
:::

## Why this works

Testing Library was never tied to jsdom. `@testing-library/react` renders a
component into a DOM node, and `@testing-library/dom` queries it. jsdom is simply
the DOM most people hand it.

TWD already runs inside your app in the browser, so the real DOM is right there
and `render()` uses it. `getBoundingClientRect` returns real numbers, portals go
where portals go, and CSS applies.

It also means the providers and the network around your component are the real
ones, so there is often nothing left to stand in for.

## Setup

### 1. Install Testing Library

TWD does not ship Testing Library's framework renderers. Install the one for your
framework as a dev dependency:

```bash
npm install --save-dev @testing-library/react
```

### 2. Make the test pattern match `.tsx`

Component tests are `.tsx`. The `twd()` plugin's default `testFilePattern` is
`'/**/*.twd.test.ts'`, which matches `.ts` only, so `.tsx` files are skipped
**silently**: no error, no warning, and nothing appears in the sidebar.

```ts
// vite.config.ts
import { twd } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    twd({ testFilePattern: '/**/*.twd.test.{ts,tsx}' }),
  ],
});
```

### 3. Exclude TWD tests from Vitest

If the same repo also runs Vitest, it matches `*.test.tsx` by default, collects
your TWD files, finds no `describe` it recognises, and fails the run with
`No test suite found in file`.

```ts
// vite.config.ts
import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, '**/*.twd.test.*'],
  },
});
```

### 4. Add a blank route to render into

Mounting a component on top of a page that already renders it means your queries
find two of everything and Testing Library throws. Give the tests an empty route
to mount into.

This requirement is framework-neutral: your router needs one route that renders
nothing, and the suite visits it once before rendering. How you declare that
route is your router's business.

```tsx
// React Router
<Routes>
  {/* Blank mount point for Testing Library component tests. */}
  <Route path="testing-library" element={<div />} />
  <Route element={<Layout />}>
    {/* the real app */}
  </Route>
</Routes>
```

Then visit it once at the top of the suite:

```ts
await twd.visit("/testing-library");
```

### 5. Clean up between tests

`render()` appends to the document and removes nothing on its own. In jsdom the
environment is torn down for you between files. In a real browser it is not, so
renders stack up and queries start finding duplicates.

```tsx
import { cleanup } from "@testing-library/react";
import { beforeEach } from "twd-js/runner";
import { twd } from "twd-js";

beforeEach(() => {
  cleanup();
  twd.clearRequestMockRules();
});
```

That is the whole setup.

## Your first component test

```tsx
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, beforeEach } from "twd-js/runner";
import { twd } from "twd-js";
import { AppProvider } from "@/context/AppContext";
import { Add } from "../Add";

describe("Add Component", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders the Add component", async () => {
    await twd.visit("/testing-library");
    render(<AppProvider><Add /></AppProvider>);

    twd.should(screen.getByText("Add Item"), "be.visible");
  });
});
```

`AppProvider` here is the real provider, not a test double. `Add` uses a hook that
reads from context and posts to an API, and in a real browser both of those work.

`twd.should` accepts any element you hand it, whether a query found it in your app
or in a component you just rendered.

## Queries: use `screen`, not `screenDom` {#queries}

::: warning `screenDom` will not find your rendered component
`render()` mounts into a fresh `div` appended to `document.body`, which is
**outside** the app root that `screenDom` scopes to. Queries will fail.
:::

Every other page in these docs steers you to `screenDom`, because for flow tests
it is the right default: it excludes the TWD sidebar. Component tests are the
exception.

Use one of these instead:

- **Testing Library's own `screen`** (recommended). It queries `document.body`,
  which is where `render()` put your component.
- **TWD's `screenDomGlobal`**, which also queries the whole document. If you pick
  this one, keep queries specific, because it can also match elements inside the
  TWD sidebar.

```ts
// Works: render() mounted into document.body
screen.getByText("Add Item");
screenDomGlobal.getByRole("button", { name: "Add Item" });

// Does not work: scoped to the app root, which is not where render() mounted
screenDom.getByText("Add Item");
```

## Mocking

`twd.mockRequest` still works and is still the right tool. It replaces the
network, which is a boundary you do not own, and everything on your side of it
still runs: component, hook, provider, router.

```ts
await twd.mockRequest("createCar", {
  url: "/api/cars",
  method: "POST",
  status: 201,
  response: { id: "test-1", model: "Golf", year: "2023" },
});
```

The rule this follows: **mock at boundaries you do not own, and nowhere else.**
The network, the clock, third-party services. When you stub a hook, a context, or
a component out of your own `src/`, the stub sits between the assertion and the
behaviour you meant to check.

## Choosing between component and flow tests {#choosing-between-component-and-flow-tests}

Rendering a component in isolation is the right move when the component is the
subject: a form's validation states, a dialog that opens and closes, a table that
sorts. You skip the navigation and the fixtures, and the test says exactly what it
is about.

Flow tests stay the right move for anything that crosses a boundary: routing, data
loading, a sequence of screens, state that survives a navigation. Rendering a
component in isolation to test those means rebuilding the app around it.

Neither replaces the other. The useful change is that choosing between them is a
decision about scope, made per test.

## One run, one coverage report

Component tests and flow tests are files in the same project, running in the same
browser, in the same session, against the same instrumented bundle. One command
runs both:

```
$ npx twd-cli run
Running 14 test(s)...
Code coverage data written to .nyc_output/out.json

--- Run complete ---
  Passed: 14 | Failed: 0 | Skipped: 0
  Duration: 6.9s
```

One coverage file comes out, covering both styles. There is nothing to merge,
because there was only ever one run.

## Other frameworks

The examples above use `@testing-library/react`, which is what has been verified.

Because Testing Library was never tied to jsdom, the same approach is expected to
work with `@testing-library/vue` and `@testing-library/solid`: render into the
real DOM, call that library's `cleanup()` in `beforeEach`, and query with `screen`.
These have not been verified yet. If you try one,
[open an issue](https://github.com/BRIKEV/twd/issues) and tell us how it went.

## Troubleshooting

**My tests do not appear in the sidebar.** Your `testFilePattern` probably ends in
`.ts`. Component tests are `.tsx`. See [step 2](#setup).

**Queries find two of everything.** Either `cleanup()` is missing from
`beforeEach`, or you are rendering on top of a page that already shows the
component. Both are covered in [Setup](#setup).

**`screenDom` cannot find my component.** Expected. Use `screen` or
`screenDomGlobal`. See [Queries](#queries).

**Vitest fails with `No test suite found in file`.** Vitest is collecting your TWD
tests. Add the `exclude` entry from [step 3](#setup).

## Further reading

- [No More Fake DOM: Testing Library Unit Tests in the Real Browser](https://dev.to/kevinccbsg/no-more-fake-dom-testing-library-unit-tests-in-the-real-browser-3p77)
- [frontend-challenge](https://github.com/kevinccbsg/frontend-challenge), which tests the same component in jsdom and in the browser side by side

## Next Steps

- [Testing Library](/testing-library) for the full query and `userEvent` reference
- [API Mocking](/api-mocking) for the service worker setup
- [Coverage](/coverage) for collecting a report across both test styles
````

- [ ] **Step 3: Register the page in the sidebar**

In `docs/.vitepress/config.mts`, inside the `Core Concepts` sidebar array, insert directly after the `Writing Tests` entry:

```ts
          { text: 'Component Testing', link: '/component-testing' },
```

- [ ] **Step 4: Verify the build and the route**

```bash
cd /Users/kevinccbsg/brikev/twd
npm run docs:build
```

Expected: build succeeds with no dead-link errors. VitePress fails the build on dead internal links, so this also validates every `/component-mocking`, `/testing-library`, `/api-mocking` and `/coverage` link on the new page.

- [ ] **Step 5: Commit**

```bash
git add docs/component-testing.md docs/.vitepress/config.mts
git commit -m "docs: add Component Testing page

Testing Library's render() works inside a TWD test, so component tests can run
in a real browser next to flow tests, in the same session, under one coverage
report. Documents the setup, the screenDom scoping caveat, and where each test
style fits."
```

---

### Task 3: Cross-link the new page and disambiguate Component Mocking

Without this, the new page is only reachable from the sidebar, and `testing-library.md` keeps telling readers `screenDom` is always the right default.

**Files:**
- Modify: `docs/testing-library.md` (after the `## Overview` section, and the `## Next Steps` list)
- Modify: `docs/writing-tests.md` (in `## Element Selection`, after the intro paragraph)
- Modify: `docs/component-mocking.md` (after the H1)

**Interfaces:**
- Consumes: the route `/component-testing` and its `#queries` anchor from Task 2.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Prove the links are missing**

```bash
cd /Users/kevinccbsg/brikev/twd
grep -rn "component-testing" docs/testing-library.md docs/writing-tests.md docs/component-mocking.md || echo "OK: no cross-links yet"
```

Expected: `OK: no cross-links yet`.

- [ ] **Step 2: Add the section to `testing-library.md`**

Insert immediately after the `## Overview` section (before `## Screen Queries`):

```markdown
## Rendering components directly

Everything on this page assumes you are querying your running app. You can also
call Testing Library's `render()` inside a TWD test to mount a single component in
isolation, in the same real browser.

One important difference: `render()` mounts into a fresh `div` on `document.body`,
which is outside the app root, so **`screenDom` will not find it**. Use Testing
Library's own `screen` or TWD's `screenDomGlobal` for rendered components.

See [Component Testing](/component-testing) for the full setup.
```

- [ ] **Step 3: Add the pointer in `testing-library.md` Next Steps**

Add as the first bullet under `## Next Steps`:

```markdown
- Read [Component Testing](/component-testing) to render components in isolation with `render()`
```

- [ ] **Step 4: Add the pointer in `writing-tests.md`**

In `## Element Selection`, immediately after the paragraph beginning "TWD provides multiple ways to select DOM elements", insert:

```markdown
::: tip Testing a single component instead of a page?
If you render a component in isolation with Testing Library's `render()`, use
`screen` rather than `screenDom`. See [Component Testing](/component-testing#queries).
:::
```

- [ ] **Step 5: Add the disambiguation line in `component-mocking.md`**

Immediately after the H1 `# Component Mocking` and its intro paragraph, insert:

```markdown
::: tip Looking to test a component in isolation?
This page is about **replacing** a component with a stub. To **render** a single
component and test it in a real browser, see [Component Testing](/component-testing).
:::
```

- [ ] **Step 6: Verify**

```bash
cd /Users/kevinccbsg/brikev/twd
grep -rn "component-testing" docs/testing-library.md docs/writing-tests.md docs/component-mocking.md
npm run docs:build
```

Expected: four matches across the three files, and a clean build.

- [ ] **Step 7: Commit**

```bash
git add docs/testing-library.md docs/writing-tests.md docs/component-mocking.md
git commit -m "docs: cross-link Component Testing and disambiguate Component Mocking

The screenDom guidance on the Testing Library and Writing Tests pages does not
apply to components mounted by render(), so both pages now say so and point at
the new page."
```

---

### Task 4: Landing page section and FAQ

**Files:**
- Modify: `docs/.vitepress/theme/components/HomePage.vue` (`faqs` array around line 84; template between the Quick Start `</section>` and the `<!-- Section 5: FAQ -->` comment; `<style scoped>` block)

**Interfaces:**
- Consumes: the route `/component-testing` from Task 2.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Prove the FAQ is stale**

```bash
cd /Users/kevinccbsg/brikev/twd
grep -n "not a mounted component in a vacuum" docs/.vitepress/theme/components/HomePage.vue
grep -n "grid-template-columns: repeat(4, 1fr)" docs/.vitepress/theme/components/HomePage.vue
```

Expected: the first grep confirms the FAQ answer that the new capability contradicts. The second confirms `.pain-cards` is a four-column grid, which is why this task adds a section rather than a fifth pain card.

- [ ] **Step 2: Rewrite the Vitest Browser Mode FAQ answer**

In the `faqs` array, replace that entry's `a` value with:

```js
    a: 'Vitest Browser Mode mounts your component in a purpose-built harness page. TWD runs inside your actual dev server, so both styles are available: drive the whole app through its real routes, or call Testing Library render() to mount a single component. Either way the providers, router and network around it are the real ones, and both run in the same session under one coverage report.'
```

- [ ] **Step 3: Add the new FAQ entry**

Insert directly after the Vitest Browser Mode entry:

```js
  {
    q: 'Do I have to drop my Vitest tests?',
    a: 'No. Pure functions, reducers, formatters and hooks tested in isolation are fine in jsdom, and moving them buys you nothing. The ones worth moving are the component tests where you had to mock a hook, a context or a component from your own src/ just to get the component to render, because there the stub sits between your assertion and the behaviour you meant to check.'
  },
```

- [ ] **Step 4: Add the landing section**

Insert between the Quick Start section's closing `</section>` and the `<!-- Section 5: FAQ -->` comment.

Note: the angle brackets in the JSX sample **must** be HTML-escaped (`&lt;`, `&gt;`) or Vue will try to parse them as template tags and the build will fail.

```html
      <!-- Section 4.5: Component tests -->
      <section class="both-styles" aria-labelledby="both-styles-heading">
        <h2 id="both-styles-heading" class="section-title">Component tests and flow tests. One run.</h2>
        <p class="section-sub">
          Testing Library's <code>render()</code> works inside TWD, so a component test runs
          in the same browser session as your flow tests, against real providers and a real
          router, under one coverage report.
        </p>

        <div class="both-styles-grid">
          <div class="both-styles-col">
            <p class="both-styles-label">jsdom, with the hook mocked</p>
            <div class="code-block">
              <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">Add.spec.tsx</span></div>
              <pre><code><span class="hl-func">vi.mock</span>(<span class="hl-string">"../useAdd"</span>);

<span class="hl-func">fireEvent.change</span>(input, {
  <span class="hl-prop">target</span>: { <span class="hl-prop">value</span>: <span class="hl-string">"2023"</span> },
});

<span class="hl-func">expect</span>(mockHandleChange)
  .<span class="hl-func">toHaveBeenCalledTimes</span>(<span class="hl-num">1</span>);</code></pre>
            </div>
            <p class="both-styles-note">Asserts that a stub was called.</p>
          </div>

          <div class="both-styles-col">
            <p class="both-styles-label">Real browser, nothing mocked</p>
            <div class="code-block">
              <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">Add.twd.test.tsx</span></div>
              <pre><code><span class="hl-func">render</span>(&lt;AppProvider&gt;&lt;Add /&gt;&lt;/AppProvider&gt;);

<span class="hl-func">fireEvent.change</span>(input, {
  <span class="hl-prop">target</span>: { <span class="hl-prop">value</span>: <span class="hl-string">"2023"</span> },
});

twd.<span class="hl-func">should</span>(input, <span class="hl-string">"have.value"</span>, <span class="hl-string">"2023"</span>);</code></pre>
            </div>
            <p class="both-styles-note">Asserts the year field actually contains 2023.</p>
          </div>
        </div>

        <p class="both-styles-cta">
          <a href="/component-testing" class="btn btn-outline">Read the Component Testing guide</a>
        </p>
      </section>
```

- [ ] **Step 5: Add the styles**

Append to the end of the `<style scoped>` block:

```css
.both-styles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 32px;
}

@media (max-width: 860px) {
  .both-styles-grid {
    grid-template-columns: 1fr;
  }
}

.both-styles-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin: 0 0 10px;
}

.both-styles-note {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin: 10px 0 0;
}

.both-styles-cta {
  margin-top: 32px;
  text-align: center;
}
```

- [ ] **Step 6: Verify the build and check both themes**

```bash
cd /Users/kevinccbsg/brikev/twd
npm run docs:build
npm run docs:preview
```

Expected: a clean build. In the preview, confirm the new section renders two columns at desktop and one at narrow widths, that the JSX sample shows literal `<AppProvider><Add /></AppProvider>` text rather than disappearing, and that both FAQ changes appear.

- [ ] **Step 7: Commit**

```bash
git add docs/.vitepress/theme/components/HomePage.vue
git commit -m "docs(landing): show component tests and refresh the Vitest FAQ

The Vitest Browser Mode answer ended 'not a mounted component in a vacuum',
which is now exactly what TWD supports. Adds a before/after section and an
entry on which Vitest tests are actually worth moving."
```

---

### Task 5: SEO metadata and llm ingestion files

**Files:**
- Modify: `docs/.vitepress/config.mts` (`description`, `keywords`, `og:description`, the `SoftwareApplication` ld+json `description`)
- Modify: `docs/public/llms.txt`
- Modify: `scripts/generate-llms-full.mjs` (`ORDER` array)

**Interfaces:**
- Consumes: the route `/component-testing` from Task 2.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Prove the page is invisible to machines**

```bash
cd /Users/kevinccbsg/brikev/twd
grep -c "component-testing" docs/public/llms.txt scripts/generate-llms-full.mjs docs/.vitepress/config.mts
npm run docs:build && tail -40 docs/public/llms-full.txt | head -5
```

Expected: `config.mts` has 1 match (the sidebar entry from Task 2), `llms.txt` and the generator have 0. The `tail` shows the new page landing at the very end of `llms-full.txt`, after the community page, which is the placement this task fixes.

- [ ] **Step 2: Add the page to the generator's `ORDER`**

In `scripts/generate-llms-full.mjs`, in the `ORDER` array, change:

```js
  'getting-started.md', 'writing-tests.md', 'api-mocking.md', 'component-mocking.md',
```

to:

```js
  'getting-started.md', 'writing-tests.md', 'component-testing.md', 'api-mocking.md',
  'component-mocking.md',
```

- [ ] **Step 3: Add the entry and feature bullet to `llms.txt`**

Add to the `Key features:` list, after the "Testing Library integration" bullet:

```
- Component tests in a real browser via Testing Library render(), running alongside flow tests in one session under one coverage report
```

Add to the `## Core Concepts` list, directly after the Writing Tests line:

```
- [Component Testing](https://twd.dev/component-testing): Render a single component with Testing Library in a real browser, setup, the screenDom scoping caveat, and choosing between component and flow tests
```

- [ ] **Step 4: Update the SEO metadata in `config.mts`**

Update the top-level `description` (and the identical `description` inside the `SoftwareApplication` ld+json block) to:

```
In-browser frontend testing for React, Vue, Angular, Solid, Astro, Nuxt, HTMX and vanilla JS. Run component tests and flow tests together in your real browser via Vite, Webpack, or a CDN.
```

Append to the `keywords` content string:

```
, component-testing, unit-testing, jsdom, testing-library, browser-component-tests
```

Update `og:description` to:

```
Frontend testing ecosystem. Write component and flow tests in your real browser, let the AI agent iterate, validate every mock against the real API. Testing isn't a phase, it's how you build.
```

- [ ] **Step 5: Verify placement**

```bash
cd /Users/kevinccbsg/brikev/twd
npm run docs:build
grep -n "Component Testing in the Real Browser" docs/public/llms-full.txt
grep -n "component-testing" docs/public/llms.txt
```

Expected: the new page now appears in `llms-full.txt` between the Writing Tests and API Mocking sections rather than at the end of the file, and `llms.txt` carries the entry.

- [ ] **Step 6: Commit**

`docs/public/llms-full.txt` is gitignored (`.gitignore:105`) and rebuilt by `docs:build`, so it is deliberately not staged.

```bash
git add docs/.vitepress/config.mts docs/public/llms.txt scripts/generate-llms-full.mjs
git commit -m "docs(seo): surface component testing in metadata and llms.txt

llms.txt is hand-curated and the llms-full generator has a hardcoded ORDER, so
a new page is invisible to both until it is registered explicitly."
```

---

### Task 6: Teach the AI prompts about component tests

Both prompts currently list `*.twd.test.tsx` as a valid filename without mentioning that the default pattern does not match it, so they actively lead agents into the silent-skip trap.

**Files:**
- Modify: `ai-guides/TWD_PROMPT.md` (`## File Naming Convention` at line 30; new section before `## Module Stubbing with Sinon` at line 328)
- Modify: `docs/agents.md` (compact prompt: the `2. File naming` rule, and a new block after `### Component mocking`)

**Interfaces:**
- Consumes: the brace pattern from Task 1 and the render/cleanup pattern from Task 2.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Prove the prompts carry the trap**

```bash
cd /Users/kevinccbsg/brikev/twd
grep -n "twd.test.tsx" ai-guides/TWD_PROMPT.md docs/agents.md
grep -rn "cleanup\|render(" ai-guides/TWD_PROMPT.md docs/agents.md || echo "OK: component testing absent from both prompts"
```

Expected: both files list `.tsx` filenames; neither mentions `render()` or `cleanup()`.

- [ ] **Step 2: Fix the file naming section in `TWD_PROMPT.md`**

Replace the body of `## File Naming Convention`:

```markdown
## File Naming Convention

Test files must follow this pattern:
- `*.twd.test.ts`
- `*.twd.test.tsx`
- `*.twd.test.js`
- `*.twd.test.jsx`

IMPORTANT: the twd() plugin's default `testFilePattern` is `'/**/*.twd.test.ts'`,
which matches `.ts` ONLY. If you write `.tsx` tests (all component tests are
`.tsx`), the project must set `twd({ testFilePattern: '/**/*.twd.test.{ts,tsx}' })`
in `vite.config.ts`, or the tests are skipped silently with no error.
```

- [ ] **Step 3: Add the component testing section to `TWD_PROMPT.md`**

Insert immediately before `## Module Stubbing with Sinon`:

````markdown
## Component Testing (Testing Library render)

You can mount a single component in isolation with Testing Library's `render()`,
in the same real browser. Use this when the component itself is the subject (form
validation, a dialog opening, a table sorting). Use a normal flow test when the
behaviour crosses a boundary (routing, data loading, multi-screen state).

Rules specific to component tests:

1. The file must be `.tsx`, and `testFilePattern` must be
   `'/**/*.twd.test.{ts,tsx}'`.
2. Query with Testing Library's `screen`, NOT `screenDom`. `render()` mounts into a
   fresh `div` on `document.body`, which is outside the app root that `screenDom`
   scopes to, so `screenDom` will not find it. `screenDomGlobal` also works if
   queries are specific.
3. Call `cleanup()` in `beforeEach`. The browser DOM is not torn down between
   tests, so renders stack up and queries find duplicates.
4. Render on a blank route so the component is not already on the page. Visit it
   once with `await twd.visit("/testing-library")`.
5. Use the REAL providers. Do not stub a hook or context from the project's own
   `src/`. Mock only the network, with `twd.mockRequest`.

```tsx
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, beforeEach } from "twd-js/runner";
import { twd } from "twd-js";
import { AppProvider } from "@/context/AppContext";
import { Add } from "../Add";

describe("Add Component", () => {
  beforeEach(() => {
    cleanup();
    twd.clearRequestMockRules();
  });

  it("renders the Add component", async () => {
    await twd.visit("/testing-library");
    render(<AppProvider><Add /></AppProvider>);

    twd.should(screen.getByText("Add Item"), "be.visible");
  });
});
```

If the project also runs Vitest, it must exclude these files:
`exclude: [...configDefaults.exclude, '**/*.twd.test.*']`.
````

- [ ] **Step 4: Fix rule 2 in the `docs/agents.md` compact prompt**

Replace the `2. File naming` line with:

```
2. File naming: *.twd.test.ts or *.twd.test.tsx
   The plugin default pattern matches .ts ONLY. For .tsx tests the project needs
   twd({ testFilePattern: '/**/*.twd.test.{ts,tsx}' }) or they are skipped silently.
```

- [ ] **Step 5: Add the compact component testing block to `docs/agents.md`**

Insert directly after the `### Component mocking` block:

```
### Component tests (Testing Library render)
   Mount one component in isolation, in the same real browser.
   import { render, screen, cleanup } from "@testing-library/react";
   beforeEach(() => { cleanup(); });          // browser DOM is not torn down between tests
   await twd.visit("/testing-library");       // a blank route, so the component is not already on the page
   render(<AppProvider><Add /></AppProvider>);
   twd.should(screen.getByText("Add Item"), "be.visible");
   Use screen (or screenDomGlobal), NOT screenDom: render() mounts outside the app root.
   Use the real providers. Mock only the network, with twd.mockRequest.
```

- [ ] **Step 6: Verify**

```bash
cd /Users/kevinccbsg/brikev/twd
grep -n "matches .ts ONLY\|matches \`.ts\` ONLY" ai-guides/TWD_PROMPT.md docs/agents.md
grep -n "NOT screenDom" ai-guides/TWD_PROMPT.md docs/agents.md
npm run docs:build
```

Expected: both files carry the pattern warning and the `screenDom` warning, and the build is clean.

- [ ] **Step 7: Commit**

```bash
git add ai-guides/TWD_PROMPT.md docs/agents.md
git commit -m "docs(ai): teach the prompts about browser component tests

Both prompts listed *.twd.test.tsx as valid without noting that the default
pattern does not match it, so agents were being led into a silent failure."
```

---

### Task 7: Reference links in community.md

**Files:**
- Modify: `docs/community.md` (Example Repositories table, Blog Posts section)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Prove the gaps**

```bash
cd /Users/kevinccbsg/brikev/twd
grep -n "Coming soon" docs/community.md
grep -n "frontend-challenge" docs/community.md || echo "OK: reference repo not listed"
```

Expected: Blog Posts says "Coming soon"; the reference repo is absent.

- [ ] **Step 2: Add the reference repo row**

Append to the Example Repositories table:

```markdown
| [frontend-challenge](https://github.com/kevinccbsg/frontend-challenge) | React + Vite | Testing Library `render()` component tests running in the browser next to jsdom tests of the same component. Fork of [SabrinaFZ/frontend-challenge](https://github.com/SabrinaFZ/frontend-challenge), outside the BRIKEV org |
```

- [ ] **Step 3: Replace the Blog Posts placeholder**

Replace the `*Coming soon*` line with:

```markdown
- [No More Fake DOM: Testing Library Unit Tests in the Real Browser](https://dev.to/kevinccbsg/no-more-fake-dom-testing-library-unit-tests-in-the-real-browser-3p77) (DEV.to)
```

- [ ] **Step 4: Verify**

```bash
cd /Users/kevinccbsg/brikev/twd
grep -n "Coming soon" docs/community.md || echo "OK: placeholder replaced"
grep -n "frontend-challenge" docs/community.md
npm run docs:build
```

Expected: the placeholder is gone, two `frontend-challenge` links are present, and the build is clean.

- [ ] **Step 5: Commit**

```bash
git add docs/community.md
git commit -m "docs(community): add the browser unit tests article and reference repo"
```

---

### Task 8: Final verification sweep

**Files:** none modified unless a check fails.

**Interfaces:**
- Consumes: everything from Tasks 1 to 7.
- Produces: a green build and a clean accuracy audit.

- [ ] **Step 1: Confirm no forbidden claims slipped in**

```bash
cd /Users/kevinccbsg/brikev/twd
# Article 2 must be referenced nowhere
grep -rn "testing your mocks\|your-vitest-tests" docs/ ai-guides/ && echo "FAIL: article 2 referenced" || echo "OK: article 2 absent"
# No Angular component testing claim
grep -rn -i "testing-library/angular\|TestBed" docs/component-testing.md && echo "FAIL: Angular claim" || echo "OK: no Angular claim"
# No performance comparison
grep -rn -i "faster than\|slower than" docs/component-testing.md && echo "FAIL: perf claim" || echo "OK: no perf claim"
```

Expected: three `OK:` lines.

- [ ] **Step 2: Confirm the pattern fix is complete**

```bash
cd /Users/kevinccbsg/brikev/twd
grep -rn "twd.test.ts'" docs/ | grep -v "{ts,tsx}"
```

Expected: every remaining hit is either the documented plugin default (now carrying a "matches .ts only" note) or a `.ts`-only example where that is correct. Review each hit and confirm.

- [ ] **Step 3: Full build**

```bash
cd /Users/kevinccbsg/brikev/twd
npm run docs:build
```

Expected: clean build, no dead links.

- [ ] **Step 4: Review the whole diff**

```bash
cd /Users/kevinccbsg/brikev/twd
git diff main...HEAD --stat
git diff main...HEAD
```

Confirm: no changes under `src/`, no `Co-Authored-By` lines, no em-dashes in newly written prose.

- [ ] **Step 5: Stop and ask before pushing**

Do not push or open the PR without the maintainer's explicit go-ahead.

---

## Follow-ups (not in this plan)

1. **`DEFAULT_PATTERN` library change.** Setting `src/plugin/twd.ts:49` to `'/**/*.twd.test.{ts,tsx}'` would remove the silent-skip trap for everyone without anyone reading the docs. File as a separate issue.
2. **`twd-ai` plugin repo.** The separate plugin's skills carry their own TWD context and need the same component testing update.
3. **Verify Vue and Solid.** The new page marks them unverified. A spike in `twd-vue-example` and `twd-solid-example` would let the docs make a real claim.
4. **Core Concepts sidebar regroup.** The list is now 15 items and would read better split into subgroups.
