# matchLayout - Implementation Design (beta)

Date: 2026-09-06
Status: Approved, ready for an implementation plan
Scope: `twd-js` only. `twd-cli` is explicitly out of scope for this release.
Builds on: `specs/2026-09-03-matchlayout-design.md` (the spike handoff)

## 0. Relationship to the spike document

The 2026-09-03 document is the record of a spike that was executed and
validated against a real landing page. It answers *why*: why the grid is
anchored instead of NxN, why the background has to be painted before
`drawImage`, why the bit criterion is distance-to-background rather than
brightness, why rows are diffed by LCS instead of by position, and what was
tried and discarded. **None of that rationale is repeated here.** Read it
first; this document assumes it.

This document is the build spec: module boundaries, public API, configuration,
file formats, error handling, and test strategy.

### Decisions taken on 2026-09-06 that change the spike

| Spike said | Now | Why |
|---|---|---|
| Return `{ status, message }`, caller writes `expect(...)` | `matchLayout` throws the formatted message itself | Matches `twd.should`. Removes the footgun where a test forgets the `expect` and passes forever. |
| §8: the runner must expose the running test so the message can name it | Dropped, not needed | A thrown error is already attributed to its test by the runner. |
| Snapshots always run | Off by default behind a debug flag | The sidebar resizes the page, so a snapshot taken there is not trustworthy. This is a `twd-cli` feature that can be inspected in the sidebar, not the other way round. |
| `--update-snapshots` / `--ci` are twd-cli flags | Window flags read by `matchLayout`, set by `twd-cli` with `evaluateOnNewDocument` | Keeps every snapshot decision in `matchLayout`. The plugin stays a dumb file writer with no policy of its own. |
| Viewport mismatch always skips | Skips, except under the CI flag, where it fails | A wrong viewport in CI would otherwise skip every snapshot silently and go green forever. That is the same trap `--ci` exists to close. |

## 1. Module layout

The governing constraint: this repo has no `canvas` package, so jsdom cannot
rasterize. Anything that touches a real canvas is untestable in Vitest.
Everything else is pure and fully testable. The boundary below exists for
exactly that reason.

| Module | Responsibility | Testable in jsdom |
|---|---|---|
| `src/commands/matchLayout.ts` | The command: gate, viewport guard, fetch baseline, compare, throw | Yes, with `capture` and `fetch` mocked |
| `src/commands/layout/capture.ts` | DOM -> foreignObject -> canvas -> grid + hash | No |
| `src/commands/layout/overlay.ts` | `renderFailureImage`, one call returning a PNG data URL | No |
| `src/commands/layout/grid.ts` | `Grid`, `toBits`, `INK_THRESHOLD`, `printGrid` | Yes |
| `src/commands/layout/rowDiff.ts` | LCS row diff with tolerance, `rowDistance` | Yes |
| `src/commands/layout/snapFile.ts` | `serialize` / `parse` for `.snap` | Yes |
| `src/commands/layout/message.ts` | Failure and skip message formatting | Yes |
| `src/commands/layout/transport.ts` | `readSnapshot` / `writeSnapshot` against the plugin endpoint | Yes, with `fetch` mocked |
| `src/plugin/twdSnapshot.ts` | Vite plugin: middleware, flag injection | Yes, driving the middleware over a tmp dir |

`matchLayout` imports `capture` and `overlay` as modules so `vi.mock` can
replace them. That is the only justification for the split, and it is
sufficient.

All Spanish comments in the spike code are rewritten in English during the
port. The explanatory comments themselves are kept: they record findings that
cost an iteration each and would otherwise be re-broken.

## 2. Public API

```ts
await twd.matchLayout(target, 'landing');
```

Signature: `matchLayout(el: HTMLElement, name: string): Promise<void>`

Returns `void`. Every outcome other than failure is reported through `log()`,
which is what the sidebar and the CI reporter already read.

| Outcome | Behaviour |
|---|---|
| No reference on disk | Writes `<name>.snap`. Logs `Layout snapshot "landing" saved`. Passes. |
| Reference matches | Silent. Passes. |
| Reference differs | Writes `<name>.failed.png`. Leaves the reference untouched. **Throws.** |
| Update flag set, reference exists | Rewrites `<name>.snap`. Logs `Layout snapshot "landing" updated`. Passes. |
| Snapshots not enabled | Logs `Layout snapshot "landing" skipped - snapshots run in twd-cli`. Passes. |
| Viewport differs from the reference | Logs `skipped - viewport mismatch`. Passes. |
| Viewport differs and CI flag set | **Throws.** |
| Viewport differs and update flag set | Skips. Never rewrites a reference from a viewport it was not taken at. |
| No reference and CI flag set | **Throws.** Never creates a baseline in CI. |

**Flag precedence**, when more than one applies. The gate is checked first, so
nothing happens at all while snapshots are off. Then the CI flag, which turns a
missing reference and a viewport mismatch into failures. Then the update flag,
which turns a difference into a rewrite. So update and CI together, on a test
with no reference, is a failure and not a write: CI is a floor, not a mode.

An update is never silent. `updated` is logged distinctly from `passed`
precisely because a flag left on by accident is the most expensive failure
mode: it rewrites every reference and no test ever fails again.

## 3. Configuration and the gate

One flag decides whether `matchLayout` does any work at all:

```ts
window.__TWD_SNAPSHOTS__ === true
```

Two ways to raise it, and they must not fight:

1. `twdSnapshot({ debug: true })` in `vite.config.ts`, which injects the flag
   through `transformIndexHtml`.
2. `twd-cli`, later, through `page.evaluateOnNewDocument`.

`evaluateOnNewDocument` runs **before** any page script, so the plugin's
injected script would otherwise clobber it. The injected script therefore uses
`??=`, never plain assignment:

```js
window.__TWD_SNAPSHOTS__ ??= true;
```

The plugin option is named `debug` rather than `snapshotDebug`, since the
plugin it sits on is already called `twdSnapshot`.

The documentation leads with the consequence, in the first paragraph and not a
footnote: **layout snapshots are decided by `twd-cli`. `debug` exists to
inspect them in the sidebar, and a snapshot taken there is not a verdict.**

## 4. Viewport guard

The `.snap` records the viewport it was created with. `matchLayout` reads the
current viewport from `window.innerWidth` / `window.innerHeight`.

Nothing in this feature sets the viewport itself. A snapshot records whatever
the browser reports at capture time, which is exactly why the reference has to
be created under `twd-cli`, where the headless driver fixes the size and the
result is reproducible across machines.

Mismatch skips rather than fails. A developer who resized their window sees an
explanation, not a red test they did not cause. The one exception is the CI
flag, per §0.

## 5. update and ci

Both travel as window flags, read by `matchLayout` and forwarded to the plugin
in the write request:

```ts
window.__TWD_UPDATE_SNAPSHOTS__   // rewrite an existing reference
window.__TWD_SNAPSHOT_CI__        // a missing reference is a failure
```

They are two different holes and stay two different flags. Without the CI flag
a brand new test writes its own reference and passes, forever, and nobody finds
out. Jest separates these for the same reason.

`twd-cli` sets them with `evaluateOnNewDocument`, and it is the only thing that
does. It is being built in parallel, so this side ships the flags and the
behaviour behind them and waits.

There is deliberately no environment variable fallback in the Vite plugin.
Adding one would mean a second way to reach the same switch, with its own
precedence rules to get wrong, in order to work around the temporary absence of
a tool that is already being written. A developer who wants to try the path
before `twd-cli` lands can set the flag from the browser console.

Because of that, the plugin never learns about these flags. `matchLayout` reads
them and decides; the plugin only receives the resulting write. All the policy
lives in one place.

## 6. Vite plugin contract

Endpoint `/__twd/snapshot`, matching the existing `/__twd/ws` convention used
by `twd-relay`.

```
GET  /__twd/snapshot?name=landing
  200 { "exists": boolean, "snap": string | null, "dir": string }

POST /__twd/snapshot?name=landing
  body { "snap"?: string, "png"?: string, "suffix"?: string }
  200  { "ok": true, "dir": string, "written": string[] }

400 { "error": "missing name" }
405 { "error": "method not allowed" }
```

Options:

```ts
twdSnapshot({
  dir?: string,      // default "__twd_snapshots__", resolved against Vite root
  debug?: boolean,   // default false
})
```

`dir` comes back on the GET so the failure message names the real path when a
user has changed it, instead of hardcoding `__twd_snapshots__`.

`apply: 'serve'`, like the other TWD plugins.

The plugin holds no snapshot policy. It does not know what an update is, or
what CI means, or whether a reference is allowed to be created. It answers
"does this file exist, and here it is", and it writes what it is handed. Every
decision in the outcome table in §2 is made by `matchLayout` before the request
is sent.

`name` is sanitized to `[A-Za-z0-9_-]` on the server, because it ends up in a
file path. `matchLayout` validates the same shape client-side and throws early
with a useful message rather than letting a name silently become a different
file.

Only `.snap` is committed. The docs tell the user to gitignore
`__twd_snapshots__/*.png`; the plugin does not edit the user's `.gitignore`.

## 7. `.snap` format

The spike format plus one line, `viewport`:

```
hash 8003000003c007f0...
size 1192x2451
viewport 1280x800
rows 33
cols 16
grid 1800000000000000...

# preview (# = filled, . = empty)
# # . . . . . . . . . . . . . # #
# . . . . . . . . . . . . . . . .
```

`hash` decides the verdict, `size` is the exact signal, `grid` reconstructs the
bits so the change can be located, and the ASCII preview makes the file
reviewable in a pull request without opening an image. A `.snap` written before
this release has no `viewport` line; `parse` treats a missing viewport as
"unknown" and skips the guard rather than failing.

## 8. Failure message

The message tells the user what moved and what to do about it. Nothing else:

```
Layout snapshot "landing" changed - the block height changed, 577x512 -> 577x532

  Reference:  __twd_snapshots__/landing.snap
  Capture:    __twd_snapshots__/landing.failed.png

  Accept:  npx twd-cli --update-snapshots
```

The first line names which of the three signals fired: the width changed, the
height changed, or N rows differ at constant width. The size delta rides on
that same line, because it is the one number in the whole message a user can
act on directly.

The spike put the two hashes and an ASCII render of the grid in the message.
Both are dropped. They are debug artifacts: a user cannot do anything with
`00dd000020000018`, and the ASCII grid is a worse version of the picture that
`<name>.failed.png` already shows with the changed cells boxed in red. The
`.snap` file keeps its ASCII preview, because there the job is different: it
makes the reference reviewable in a pull request without opening an image.

Dropping the ASCII render from the message makes `printDiff` dead code, so it
is not ported. `printGrid` stays; the `.snap` preview needs it.

When the width changed, an extra note says the grid rescaled and the marked
cells in the PNG are indicative rather than one to one, because the cell size
is derived from the width and no cell lines up with its counterpart any more.

## 9. Error handling

Three failure modes need messages a user can act on, and none of them is a
layout failure:

1. **Plugin not installed.** Vite's SPA fallback answers unknown paths with
   `index.html` at status 200, so a missing plugin does not look like a 404. It
   looks like a JSON parse error, which is useless. `transport` checks the
   response content type and throws `matchLayout requires the twdSnapshot()
   Vite plugin` instead.
2. **Capture failed.** `img.decode()` rejects when the serialized SVG is
   invalid. Wrap and rethrow naming the element and the snapshot.
3. **Invalid snapshot name.** Empty after sanitization, throw before any
   network call.

## 10. Testing strategy

Unit tests, mirroring the source layout under `src/tests/`:

- `grid.spec.ts`: `toBits` at the threshold boundary, and `printGrid` output
  for the `.snap` preview.
- `rowDiff.spec.ts`: identical grids give zero ops; a row inserted at the top
  pairs the rest rather than marking everything (this is the whole point of the
  LCS); tolerance absorbs a one-cell wobble; grouping a hunk pairs removed with
  added rows into `changed`.
- `snapFile.spec.ts`: round trip, a legacy snap with no `viewport` line,
  a malformed snap.
- `message.spec.ts`: width changed, height changed, same size with rows
  differing, the size delta on the headline, and the note that appears only
  when the width moved.
- `transport.spec.ts`: the html-instead-of-json case from §9.
- `matchLayout.spec.ts`: the full outcome table in §2, with `capture` mocked to
  return fixed grids and `fetch` stubbed. This is where the gate, the viewport
  guard, and the update and CI flags are covered.
- `twdSnapshot.spec.ts`: drive the middleware directly over a tmp dir. GET
  missing and present, POST writing snap and png, name sanitization, method not
  allowed.

`capture.ts` and `overlay.ts` have no unit tests. They are exercised by the
example app and by eye, and pretending otherwise with a stubbed canvas would
test the stub. This is stated here so it is a decision and not an oversight.

## 11. Documentation

New page `docs/layout-snapshots.md`, titled "Layout Snapshots (beta)",
following the precedent set by "Sharding (beta)".

Registered in three places, per the project checklist:

1. `docs/.vitepress/config.mts` sidebar, under Core Concepts next to Sharding
2. `docs/public/llms.txt`
3. the `ORDER` array in `scripts/generate-llms-full.mjs`

Plus an entry in `docs/api/twd-commands.md`.

The page must say, before anything else, what `matchLayout` does not do. It
watches geometry, not appearance. It will not see a changed string, a subtly
changed color, or white text on white. That is deliberate: content is already
covered by `twd.should`. The name is half the training, which is why it is
`matchLayout` and not `matchSnapshot`.

## 12. Out of scope

Named here so they are decisions rather than omissions:

- `twd-cli` flags and the headless capture path
- an update button in the sidebar
- the `{ tolerance }` option for allowing N differing cells
- elements with internal scroll, where only the visible part is captured

## 13. File-by-file change list

New:

```
src/commands/matchLayout.ts
src/commands/layout/{capture,overlay,grid,rowDiff,snapFile,message,transport}.ts
src/plugin/twdSnapshot.ts
src/tests/commands/matchLayout.spec.ts
src/tests/commands/layout/{grid,rowDiff,snapFile,message,transport}.spec.ts
src/tests/plugin/twdSnapshot.spec.ts
docs/layout-snapshots.md
```

Modified:

```
src/twd.ts                        add matchLayout to TWDAPI and the export
src/vite-plugin.ts                export twdSnapshot and TwdSnapshotOptions
src/global.d.ts                   the three window flags
docs/.vitepress/config.mts        sidebar entry
docs/public/llms.txt              index entry
scripts/generate-llms-full.mjs    ORDER entry
docs/api/twd-commands.md          matchLayout reference
```
