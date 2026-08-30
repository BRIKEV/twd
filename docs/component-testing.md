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

### 4. Add the component host

`render()` appends its container to `document.body`, which puts your component
after the app root, a full viewport below the layout. The app's own DOM is also
still on the page, so `screen` matches its elements as well as the ones your test
rendered. One helper solves both, and your app does not change:

```ts
// twd-tests/support/componentHost.ts
const HOST_ID = 'twd-component-host';
const APP_ROOT_ID = 'root'; // 'app' in a default Vue app

let appRoot: HTMLElement | null = null;
let placeholder: Comment | null = null;

/** The element component tests render into: a blank div on an empty page. */
export function componentHost(): HTMLElement {
  detachApp();

  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
  }
  if (!host.isConnected) {
    document.body.prepend(host);
  }

  host.innerHTML = '';
  return host;
}

/** Removes the host and puts the app back. Call it in afterEach. */
export function restorePage(): void {
  document.getElementById(HOST_ID)?.remove();
  attachApp();
}

function detachApp(): void {
  if (placeholder) return;

  const root = document.getElementById(APP_ROOT_ID);
  if (!root) return;

  appRoot = root;
  placeholder = document.createComment(' app detached by twd component test ');
  root.replaceWith(placeholder);
}

function attachApp(): void {
  if (!placeholder || !appRoot) return;

  placeholder.replaceWith(appRoot);
  placeholder = null;
  appRoot = null;
}
```

Two details in there matter.

**Detaching the app root is not the same as emptying it.** `root.innerHTML = ''`
pulls the DOM out from under your framework while it still holds references to
those nodes, and the app does not come back. Moving the node out and putting it
back leaves those references intact, so `restorePage()` returns a live app.

**The host is prepended, not appended.** That puts the component at the top of the
page, where you can watch it run without scrolling, and keeps it in normal flow so
it sits inside the offset TWD applies for its sidebar.

The payoff is that `screen` behaves exactly as it does in jsdom: the only thing in
the document is what your test rendered. That also covers content your component
sends through a portal or a `Teleport`, which lands on `document.body` rather than
inside the host.

::: tip This replaces the blank-route approach
An earlier version of this page recommended declaring an empty route and visiting
it with `twd.visit()`. The host does the same job without a route, without
`twd.visit()`, and without touching your app.
:::

### 5. Clean up between tests

`render()` appends to the document and removes nothing on its own. In jsdom the
environment is torn down for you between files. In a real browser it is not, so
renders stack up and queries start finding duplicates.

```tsx
import { cleanup } from "@testing-library/react";
import { afterEach } from "twd-js/runner";
import { restorePage } from "./support/componentHost";

afterEach(() => {
  cleanup();
  restorePage();
});
```

Use `afterEach`, not `beforeEach`. TWD runs after-hooks in a `finally`, so this
still runs when a test fails, and it puts the app back before your flow tests need
it. If you also mock requests, `twd.clearRequestMockRules()` belongs in
`beforeEach` as usual.

That is the whole setup.

## Your first component test

```tsx
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, afterEach } from "twd-js/runner";
import { twd } from "twd-js";
import { AppProvider } from "@/context/AppContext";
import { Add } from "../Add";
import { componentHost, restorePage } from "./support/componentHost";

describe("Add Component", () => {
  afterEach(() => {
    cleanup();
    restorePage();
  });

  it("renders the Add component", () => {
    render(<AppProvider><Add /></AppProvider>, { container: componentHost() });

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
`render()` mounts outside the app root that `screenDom` scopes to, and while a
component test runs that root is not even in the document. Queries will fail.
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

`@testing-library/vue` and `@testing-library/solid` take the same `container`
option and default to `document.body` the same way, so the helper transfers with
one change: `APP_ROOT_ID` is `'app'` in a default Vue app rather than `'root'`.
Neither is verified end to end yet. If you try one,
[open an issue](https://github.com/BRIKEV/twd/issues) and tell us how it went.

`@testing-library/angular` is a different shape. It mounts through `TestBed` and
does not accept a `container`, so the helper does not apply as written. Not tried.

## Troubleshooting

**My tests do not appear in the sidebar.** Your `testFilePattern` probably ends in
`.ts`. Component tests are `.tsx`. See [step 2](#setup).

**Queries find two of everything.** You are rendering on top of the app. Pass
`componentHost()` as the `container`, and call `cleanup()` and `restorePage()` in
`afterEach`. See [step 4](#setup).

**My app is blank after the component tests run.** `restorePage()` is missing from
`afterEach`, so the app root was never put back. See [step 5](#setup).

**`screenDom` cannot find my component.** Expected. Use `screen` or
`screenDomGlobal`. See [Queries](#queries).

**Vitest fails with `No test suite found in file`.** Vitest is collecting your TWD
tests. Add the `exclude` entry from [step 3](#setup).

## Why this works

Testing Library was never tied to jsdom. `@testing-library/react` renders a
component into a DOM node, and `@testing-library/dom` queries it. jsdom is simply
the DOM most people hand it.

TWD already runs inside your app in the browser, so the real DOM is right there
and `render()` uses it. The component is laid out on a screen, at a real size and
a real position, with your CSS applied to it.

It also means the providers and the network around your component are the real
ones, so there is often nothing left to stand in for.

## Further reading

- [No More Fake DOM: Testing Library Unit Tests in the Real Browser](https://dev.to/kevinccbsg/no-more-fake-dom-testing-library-unit-tests-in-the-real-browser-3p77)
- [frontend-challenge](https://github.com/kevinccbsg/frontend-challenge), which tests the same component in jsdom and in the browser side by side

## Next Steps

- [Testing Library](/testing-library) for the full query and `userEvent` reference
- [API Mocking](/api-mocking) for the service worker setup
- [Coverage](/coverage) for collecting a report across both test styles
