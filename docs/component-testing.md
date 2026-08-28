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
    // ... your other plugins
    twd({ testFilePattern: '/**/*.twd.test.{ts,tsx}' }),
  ],
});
```

### 3. Exclude TWD tests from Vitest

If the same repo also runs Vitest, it matches `*.test.tsx` by default, collects
your TWD files, finds no `describe` it recognises, and fails the run with
`No test suite found in file`. Here is the complete config combining both steps:

```ts
// vite.config.ts (complete)
import { defineConfig, configDefaults } from 'vitest/config';
import { twd } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [
    // ... your other plugins
    twd({ testFilePattern: '/**/*.twd.test.{ts,tsx}' }),
  ],
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
