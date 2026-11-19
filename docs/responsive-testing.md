---
title: Responsive Testing
description: Tag tests with named viewports so each one runs at the widths it was written for, and keep the sidebar out of the way on small screens
---

# Responsive Testing

TWD tests run in your real browser window, so they see the layout your users
see at that width. Responsive testing lets you say which width a test was
written for, so that resizing the window to mobile runs the mobile tests and not
every desktop test against the mobile layout.

TWD never pretends a different width. **The browser window is the selector**:
resize it, or use your browser's DevTools device mode, to switch viewport.

## 1. Declare your viewports

Name your breakpoints once. With the Vite plugin:

```ts
// vite.config.ts
twd({
  viewports: {
    mobile: { maxWidth: 767 },
    tablet: { minWidth: 768, maxWidth: 1023 },
    desktop: { minWidth: 1024 },
  },
  defaultViewport: 'desktop', // optional, see below
});
```

The same two options exist on `initTWD`. With the standard React setup, call
`defineViewports` from `twd-js/runner` in your entry file:

```ts
import { defineViewports } from 'twd-js/runner';

defineViewports(
  { mobile: { maxWidth: 767 }, desktop: { minWidth: 1024 } },
  { default: 'desktop' },
);
```

Both options are optional. A project that declares no viewports behaves exactly
as before: every test runs at every width.

Rules for a definition:

- `minWidth` and `maxWidth` are CSS pixels, both inclusive. At least one is
  required.
- Names are lowercase letters, digits and dashes, starting with a letter.
- Ranges may overlap.
- An invalid definition throws at startup, so a typo in a breakpoint fails
  loudly instead of silently.

## 2. Tag tests

Pass options as the second argument, on `describe` or `it`:

```ts
import { describe, it } from 'twd-js/runner';

describe('Header', { viewport: 'mobile' }, () => {
  it('opens the burger menu', async () => {
    // ...
  });
});

it('shows the summary as cards', { viewport: ['mobile', 'tablet'] }, async () => {
  // ...
});
```

- `viewport` takes a name or a list of names.
- A test inherits the viewport of its nearest `describe`. A viewport on the
  test **replaces** the inherited one; it is not combined with it.
- `.only` and `.skip` accept the same options.
- The two-argument form you already use keeps working.

## 3. Untagged tests and `defaultViewport`

Without `defaultViewport`, an untagged test runs at every width.

Most existing suites were written against the desktop layout. Set
`defaultViewport: 'desktop'` and every untagged test is treated as a desktop
test: you only tag the new mobile tests, with no need to go back and tag the
existing ones.

## How matching works

A test matches when `window.matchMedia` matches one of its viewports, the same
rule your app's CSS follows:

| Definition | Media query |
|---|---|
| `{ maxWidth: 767 }` | `(max-width: 767px)` |
| `{ minWidth: 1024 }` | `(min-width: 1024px)` |
| `{ minWidth: 768, maxWidth: 1023 }` | `(min-width: 768px) and (max-width: 1023px)` |

| Action | What runs |
|---|---|
| **Run All** | Only the tests matching the current width. The button names the viewport: `Run All · mobile`. |
| **Run Filtered** (search) | The matching tests that also match the search. |
| **Play** on a test | That test, always, even when it was written for another width. |
| `.only` | Applies among the matching tests. A `.only` written for another width does not stop the others. |

The set of tests is decided when the run starts. Resizing during a run does not
add or remove tests.

A viewport name that was never declared logs a console warning, and the test
never runs in Run All.

## The sidebar

- **Viewport chip.** Under the run buttons, for example `mobile · 390px`. It
  updates as you resize. It is a display, not a control.
- **Other viewports.** Tests written for another width move to a collapsed
  "Other viewports" group at the bottom of the list, with a badge naming their
  viewport. Search still finds them and their play button still works. When you
  run one, its log starts with a warning such as
  `Written for desktop (min 1024px). Ran at 390px, so layout differences are expected.`
- **Totals** count only the tests for the current width.

### Small screens

When the window leaves less than 768px for your app next to the sidebar, the
sidebar stops pushing the page and sits on top of it instead. Pushing would
squeeze your app while its media queries still see the full window width. The
overlay always leaves a strip of the app visible on the side.

While a run is in progress in overlay mode, the sidebar hides so you can watch
the app, and a small pill shows progress (`TWD 2/3 ✓1 ✗0`). **Show** brings the
sidebar back without stopping the run. When the run ends, the sidebar comes back
on its own, scrolled to the first failure.

In push mode (wide windows) the sidebar never hides during a run: that would
reflow the page in the middle of a test.

## CI

In CI the page has one size, so a `twd-cli` run executes the tests that match
the Puppeteer viewport. Running each viewport in turn is planned for `twd-cli`.
The runner already accepts a viewport name for it:

```ts
import { executeTests } from 'twd-js/runner-ci';

await executeTests({ viewport: 'mobile' });
```

## Theming

Two theme tokens style the "Other viewports" group:
`viewportOtherText` and `viewportBadgeBg`. See [Theming](/theming). Keep the
text at a contrast of at least 4.5:1 against the sidebar background: the group
is greyed with a muted color, never with opacity.
