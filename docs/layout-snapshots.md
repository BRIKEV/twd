---
title: Layout Snapshots
description: Catch layout regressions with twd.matchLayout, an in-browser geometry snapshot with no SaaS account and no containers
---

# Layout Snapshots

`twd.matchLayout` watches the **geometry** of your page and fails when it moves.
No SaaS account, no Docker image, no headless browser service. The reference is
a text file you commit.

::: warning Beta
The capture pipeline is validated, but the API and the `.snap` format may still
change. See [Beta limits](#beta-limits) for what is not built yet.
:::

Two things decide whether this is useful to you, so they come first.

**It watches geometry, not appearance.** It sees a block that grows, shrinks or
moves, a list that appears or disappears, a container that overflows or wraps, a
flex or grid that collapses. It does not see a string that changed, a colour
that shifted slightly, or white text on a white background.

That is deliberate. Content is already covered by TWD's DOM assertions, and the
two are meant to be used together:

```ts
twd.should(counter, 'have.text', 'Count is 1');  // content
await twd.matchLayout(checkout, 'checkout');     // geometry
```

It is called `matchLayout` and not `matchSnapshot` for the same reason. With
`matchSnapshot` people expect Percy, and then report a changed string as a bug.

**The verdict comes from `twd-cli`, not the sidebar.** In the browser sidebar
layout snapshots are skipped. The sidebar resizes the page, and your dev viewport
is whatever size your window happens to be right now, which differs from your
colleague's and changes when you drag the edge. A reference created there would
fail for everyone else. There is a debug mode for inspecting a failure locally,
covered below, but it is for looking, not for deciding.

## Install

`matchLayout` needs the `twdSnapshot` Vite plugin, because the browser cannot
write files and the dev server can.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { twd, twdSnapshot } from 'twd-js/vite-plugin';

export default defineConfig({
  plugins: [twd(), twdSnapshot()],
});
```

Then ignore the failure captures. The `.snap` files are committed; the PNGs are
not.

```
# .gitignore
__twd_snapshots__/*.png
```

## Write a test

```ts
import { twd, screenDom } from 'twd-js';
import { describe, it } from 'twd-js/runner';

describe('Landing', () => {
  it('keeps its layout', async () => {
    await twd.visit('/');
    const landing = await screenDom.findByTestId('landing');

    await twd.matchLayout(landing, 'landing');
  });
});
```

There is no `expect` to write. `matchLayout` throws when the layout moved, the
same way `twd.should` throws when an assertion fails.

The first run has no reference, so it writes `__twd_snapshots__/landing.snap`
and passes, the way Jest snapshots do. Commit that file. Every run after that
compares against it.

## What a reference looks like

```
hash 8003000003c007f0...
size 1192x2451
viewport 1280x800
rows 33
cols 16
grid 1800000000000000...

# preview (# = filled, . = empty)
# # . . . . . . . . . . . . . # #
# . . . . . . # # # # . . . . . .
```

It is text on purpose, so a layout change is reviewable in a pull request
without opening an image. The preview is drawn from the same bits that decide
the verdict, which makes `git diff` on a `.snap` a readable diff of what moved.

Only the `.snap` is committed. A reference PNG would not survive a clean
checkout, so it would never exist in CI anyway.

## When it fails

The error names what moved:

```
Layout snapshot "landing" changed - the block height changed, 577x512 -> 577x532

  Reference:  __twd_snapshots__/landing.snap
  Capture:    __twd_snapshots__/landing.failed.png

  Accept:  npx twd-cli --update-snapshots
```

Next to the reference you get `landing.failed.png`: your current page, with the
rows that diverged boxed in red and a ribbon across the top when the block
resized. The reference itself is never touched by a failure.

If the change was intended, accept it with `npx twd-cli --update-snapshots`.
Accepting is never silent: updated snapshots are reported separately from
passing ones, because a flag left on by accident rewrites every reference and
then nothing ever fails again.

## Viewports

A reference records the viewport it was taken at. When the current viewport is
different, the snapshot is skipped rather than failed:

```
Layout snapshot "landing" skipped - viewport mismatch (reference 1280x800, current 1512x945). Run twd-cli to validate layout snapshots.
```

This is what keeps the feature from being flaky, and it is why a resized window
never produces a red test you did not cause. Under `twd-cli` the viewport is
fixed, so it always matches.

`twd.viewport()` sets the viewport for a test, so you can pin a snapshot to a
breakpoint:

```ts
it('keeps its mobile layout', async () => {
  twd.viewport(375, 667);
  await twd.visit('/');
  const landing = await screenDom.findByTestId('landing');

  await twd.matchLayout(landing, 'landing-mobile');
});
```

Always call `twd.viewport()` with BOTH a width and a height before a snapshot.
A width-only call leaves `window.innerHeight` at whatever your browser window
happens to be, so the reference bakes in a height nobody else can reproduce:
under `twd-cli` it fails as a viewport mismatch, and in dev it silently skips
on every other machine, forever.

## Debugging in the sidebar

To run snapshots in the browser while you investigate a failure:

```ts
twdSnapshot({ debug: true })
```

Leave it off in normal development and in CI. A reference created at your window
size is not one anybody else can reproduce.

## Beta limits

Not built yet:

- no tolerance option, so a snapshot either matches or it does not
- no update button in the sidebar
- an element with its own scrollbar is captured only as far as it is visible
- images and background images loaded from an external URL do not render into
  the capture, and `::before` / `::after` are not cloned

There is also a ceiling worth understanding. When something near the top of the
page changes height, everything below it shifts. Rows are matched by content
rather than by position, so a shift on its own is not reported as a change, but
a height change high up still limits how precisely a smaller change further down
can be located. You are told that the page diverged and where the divergence
starts, not everything that moved after it.
