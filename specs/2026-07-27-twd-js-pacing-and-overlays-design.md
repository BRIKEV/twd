# Paced command loop and in-page overlays for recorded runs - Design

Date: 2026-07-27
Status: Superseded for the pacing half. Retained for the overlay research.
Repo: `twd` (twd-js)

> **Superseded by [`2026-07-28-twd-js-command-pacing-design.md`](./2026-07-28-twd-js-command-pacing-design.md).**
>
> That spec is the plan of record for pacing, and it deliberately drops overlays:
> the only reason to pause after a query is to highlight what it found, so
> overlays and query pacing stand or fall together, and v1 paces actions only.
>
> Two things below are also now known to be wrong. `log()` is not a usable hook
> point, because it is synchronous and making it async would force `await` into
> `should()` and the `screenDom` proxy. And the enablement surface is a
> `window.__twdSetPace` tooling global, not a public `twd` API method, so a stray
> call cannot slow CI.
>
> This document is kept for the overlay investigation, which remains accurate and
> would be the starting point if overlays are ever revisited.

## Context

`twd-cli` is getting video capture of a test run. See
`twd-cli/docs/superpowers/specs/2026-07-27-cli-video-recording-design.md`, which
covers the whole capture pipeline (ffmpeg, `page.screencast()`, framing, config,
artifact naming) and requires no twd-js changes.

That spec ships a watchable recording, but the only pacing control it has is
`record.speed`, a uniform ffmpeg `setpts` stretch of the entire timeline. It
slows the fast parts and the already-slow parts equally and cannot hold on a
just-clicked element.

This document covers the twd-js half, which is where the actual differentiator
lives.

## Why this is the differentiator

Cypress and Playwright videos run fast because the video is a byproduct of a
driver hammering the browser at full speed. Their `slowMo` and padding only tweak
protocol timing.

TWD's commands (`get`, `userEvent` interactions, `should` assertions) execute as
JavaScript inside the page, and twd-cli drives the browser around that in-page
runner. TWD owns its own command loop, so it can space commands deliberately and
produce a video where the execution itself is paced, not the recording.

It can also draw overlays directly in the page (highlight the element being acted
on, flash the assertion target, render the current step as a caption) that get
baked into the video file. Cypress and Playwright can only add that kind of
annotation after the fact in a trace viewer.

## Packaging

Pacing and overlay rendering ship as a separate `twd-js/record` entry, injected
by twd-cli via `page.addScriptTag` before the run starts.

This keeps overlay DOM and CSS out of the bundle for the users who never record,
which is nearly all of them. Bundling it in core would not be tree-shakeable,
because it would be reached through a runtime flag rather than a static import.

The core needs one small always-present hook point for the injected module to
attach to.

## Constraints already identified

These came out of reading the current implementation and should not have to be
rediscovered.

### `should()` is a synchronous chainable

`twd.ts:319` and `twd.ts:346` return `api` synchronously so calls can chain
(`items.at(0).should(...).should(...)`). Awaiting a pacing delay inside it would
be a breaking API change.

Pace the already-async commands instead: `get`, `getAll`, `userEvent.*`,
`screenDom.*`, `visit`, `waitFor`, `notExists`. Let an assertion's overlay persist
into the following command's dwell window rather than giving assertions a dwell
of their own.

### The delay goes after the command, not before

`get()` resolving and then dwelling naturally produces "highlight the element,
hold, then act", which is the Cypress command-log feel. It falls out of the
existing call order for free, with no reordering.

### `log()` is the natural chokepoint but is synchronous

`src/utils/log.ts` is called from every command that would need pacing, which
makes it the right place to hang the hook. Its `(msg: string) => void` signature
has to change for the async call sites.

Its call sites are already enumerated: `twd.ts` (get, getAll, should, notExists),
`proxies/userEvent.ts`, `proxies/screenDom.ts`, `commands/url.ts`,
`commands/visit.ts`, `commands/viewport.ts`, `utils/waitFor.ts`.

### Overlays cannot be plain `<body>` children

`twd.get` scopes queries with `body > div:not(#twd-sidebar-root) ${selector}`
(`twd.ts:313`), so an overlay div appended to body becomes a candidate ancestor
and can pollute `getAll` results.

Overlays must render in a shadow root or inside the existing sidebar root. The
scoping selector should be reviewed either way, since it is fragile to any new
top-level container.

### Overlay text is already available

The strings passed to `log()` are human-readable command descriptions
(`Searching get("...")`, the `eventsMessage` and `domMessage` output). They can
drive the step caption directly with no new message layer.

## Related: screenshots on failure

A separate feature, but it needs two of the same changes and should be sequenced
with this work.

- **An event bridge.** Node cannot observe per-test outcomes mid-chunk, because
  twd-cli runs an entire chunk inside one `page.evaluate()`. The fix is
  `page.exposeFunction`, following the existing `__twdCollectMock` precedent, with
  the in-page callback awaiting it so the page pauses while Node captures.
- **Awaited runner events.** `runner.ts:364-382` calls `onStart`, `onPass`, and
  `onFail` without `await`, and `RunnerEvents` types them as returning `void`.
  Both need to allow and await a promise.

Two behaviors to resolve when that is specced:

- **`onFail` fires after `afterEach`.** The `finally` block at `runner.ts:377-379`
  runs the after hooks before `onFail` at line 382, so a screenshot taken at
  `onFail` captures post-cleanup DOM rather than the failure state. This likely
  needs a new hook inside the `catch`.
- **Retries.** With `retryCount` defaulting to 2, hooking the `catch` yields one
  screenshot per failed attempt. Decide between capturing every attempt and
  capturing only the final failure.

Once the bridge exists, per-test video files also become possible, and the
one-clip-per-run constraint in the twd-cli spec can be revisited.

## Open questions

- The pace value should be configurable, since a CI debug artifact wants
  real-time or mild slow-mo while a demo video wants a slower narration feel.
  Where that value is set, and how twd-cli passes it into the injected module,
  is not yet decided.
- Whether the sidebar should be hidden during capture is currently a twd-cli
  concern (a CSS injection). If overlays render inside the sidebar root, that
  interacts, and the two need to be designed together.
- Whether the pacing hook should also serve the future in-browser
  (`getDisplayMedia`) capture path, which would argue for putting it somewhere
  the sidebar can reach without twd-cli injecting it.
