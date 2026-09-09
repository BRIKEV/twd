---
title: Recording Runs
description: Record a TWD test run to video with twd-cli, paced at human speed so it is watchable in a pull request
---

# Recording Runs

`twd-cli` can record a test run to a video file. The point is not a debugging
trace, it is an artifact a person will actually watch: attach the flow to a pull
request, drop it in your docs, or send it to someone who asked what changed.

```bash
npx twd-cli run --record --test "checkout flow"
```

That writes one clip per matched test into `twd-artifacts/`.

Requires `twd-cli` 1.4.0 or newer. One clip per test needs 1.8.0, and so does the
[`record` action](#recording-in-ci) — 1.7.0 shipped the action, but its artifact
upload failed on default inputs. See
[github.com/BRIKEV/twd-cli](https://github.com/BRIKEV/twd-cli) for source and
release notes.

## Prerequisite: ffmpeg 8 or newer

Recording spawns ffmpeg, so it has to be available — and for `mp4`, the default
format, it has to be **version 8 or newer**.

That floor is not ours. Puppeteer's screencast passes
`-movflags hybrid_fragmented`, which arrived after ffmpeg 7:

| ffmpeg | Where it comes from | Records mp4 |
|---|---|---|
| 6.1.1 | `apt-get install ffmpeg` on ubuntu-24.04 | No |
| 7.0.2 | the obvious static build | No |
| 8.1.2 | current release | Yes |

So the usual package-manager one-liner may or may not be enough:

```bash
brew install ffmpeg     # macOS
winget install ffmpeg   # Windows
ffmpeg -version         # check what you actually got
```

On Linux the distro package is the one that will bite you. Install a build from
[BtbN/FFmpeg-Builds](https://github.com/BtbN/FFmpeg-Builds/releases) instead, and
pick a `gpl` variant — it carries `libx264`, which `twd-cli` needs for the
[H.264 conversion](#why-the-clip-plays-outside-chrome), so one download covers
both requirements. In GitHub Actions the [`record` action](#recording-in-ci) does
this for you.

`webm` and `gif` pass no movflags and work on any ffmpeg.

Set `record.ffmpegPath` in `twd.config.json` if the binary is not on your `PATH`.

Before launching the browser, `twd-cli` probes what ffmpeg can actually do —
`ffmpeg -h muxer=mp4` has to list every movflag Puppeteer will pass — so an
ffmpeg that exists but cannot record fails in one actionable line rather than
part way through a run. That is a capability check rather than a version check on
purpose: the required flags are Puppeteer's, and a version floor written from a
single measurement was already wrong on the second.

## Why the run is paced

Tests execute in milliseconds. A recording of two tests running at full speed is
about a second long, which is not something anyone can follow.

The obvious fix is to slow the video down afterwards, and that is what
`record.speed` does: an ffmpeg filter that stretches the timeline. It works, but
it stretches the same frames over more time, so the frame rate drops in
proportion. Measured on identical page activity:

| `speed` | duration | effective fps |
|---|---|---|
| `1` | 1.00s | 30 |
| `0.5` | 1.90s | 15.3 |
| `0.25` | 3.90s | 7.7 |

It also slows the dead air exactly as much as the parts worth watching.

TWD takes a different route. Because commands execute inside the page, TWD owns
its own command loop and can space the execution itself. Frames are captured at
full rate, and the pauses land where something just happened. Typing is spaced
per keystroke too, so text appears character by character instead of all at once.

The same test recorded both ways. It fills a seven field form and submits it:

<div class="pace-demo">
  <figure class="pace-demo__item">
    <video
      src="/videos/twd-record-unpaced.mp4"
      poster="/images/twd-record-poster.jpg"
      controls
      muted
      loop
      playsinline
      preload="none"
      aria-label="Unpaced recording of a test filling a seven field form. The whole form fills in a few frames and the run is over in under two seconds."
    ></video>
    <figcaption>
      <code>pace: 0</code>
      <span>1.8s. The form fills in a handful of frames.</span>
    </figcaption>
  </figure>
  <figure class="pace-demo__item">
    <video
      src="/videos/twd-record-paced.mp4"
      poster="/images/twd-record-poster.jpg"
      controls
      muted
      loop
      playsinline
      preload="none"
      aria-label="Paced recording of the same test. Each field is typed character by character with a pause after every command, and the run takes just over eight seconds."
    ></video>
    <figcaption>
      <code>pace: 300</code>
      <span>8.2s. Same test, same assertions.</span>
    </figcaption>
  </figure>
</div>

<style>
/* Stacked, full content width. Side by side halves the frame, and at that size
   the browser's own control bar covers most of the app. */
.pace-demo {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  margin: 24px 0 8px;
}
.pace-demo__item {
  margin: 0;
}
.pace-demo__item video {
  display: block;
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}
.pace-demo figcaption {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
.pace-demo figcaption code {
  margin-right: 8px;
}
</style>

This is why recorded runs are **paced by default at 300ms**. `--record` on its
own gives you something watchable.

```bash
# Default 300ms pace
npx twd-cli run --record --test "checkout flow"

# Slower, for a more deliberate demo
npx twd-cli run --record --record-pace 500 --test "checkout flow"

# No pacing, for the fastest possible recorded run
npx twd-cli run --record --record-pace 0 --test "checkout flow"
```

Values between 200 and 500 tend to read well. Pacing needs `twd-js` 1.9.0 or
newer. On an older version the run still records, unpaced, and warns.

## Watching a run without recording it

The same pacing is available in the sidebar, without ffmpeg and without
producing a file. Turn it on with the `pace` option:

```ts
// vite.config.ts
twd({ pace: true });
```

That adds a speed selector to the sidebar header:

| Option | Pace |
|---|---|
| `Off (full speed)` | `0` |
| `Slow (300ms)` | `300` |
| `Slower (600ms)` | `600` |

The choice is remembered for the tab, so it survives the reloads you get while
editing tests. It applies to every run in the page, including runs triggered
over [twd-relay](/twd-relay), which is the point: when an agent writes a test and
runs it for you, a paced run is one you can actually follow. Leave it on `Off`
for normal development, where a run finishing in milliseconds is the feature.

Like `record.pace`, this only spaces out commands. It does not change what the
tests assert.

## A recorded run is not a CI run

Recording changes the conditions the tests run under:

- It sets its own viewport, `1280x1600` by default, where a normal `twd-cli` run
  uses an explicit `1280x800`.
- It hides the TWD sidebar and reflows your app to full width.
- Pacing inserts real delays between actions, which can mask race conditions.

So a recorded run can pass or fail differently from a normal one. Treat the video
as a demo artifact and keep running [CI](/ci-execution) unrecorded.

## What ends up in the clip

**One clip per test.** A run matching three tests writes three files, each named
after its own `"suite > test"` path:

```
twd-artifacts/
  todos-adds-a-todo.mp4
  todos-marks-a-todo-done.mp4
  todos-filters-by-status.mp4
```

That is the shape a reviewer wants. A branch adds one journey test per acceptance
criterion, so one clip per criterion means watching the one you doubt and
skipping the rest — rather than scrubbing a four second splice of three tests to
find the part you came for.

`--test` matches a substring of the full `"suite > test"` path, so a single
filter can match several tests. Order follows declaration order in the suite
tree, not the order you passed the flags.

Three cases still produce a single file for the whole run:

- **A single matched test.** It already gets a file named after itself, so
  `Login > shows error on bad password` becomes
  `login-shows-error-on-bad-password.mp4`.
- **An explicit `record.filename`.** One name cannot address several clips, so
  setting it pins the single-file shape.
- **More matched tests than `record.maxClips`**, default `20`. Past the bound the
  run writes one `run.<ext>` and says so in a line.

`maxClips` is a human bound rather than a cost one. Restarting a screencast on an
already-open page measures about 250ms, so thirty clips is roughly seven seconds
of overhead — not thirty browser launches. What the bound protects is the
reviewer who will not open thirty files. Set `0` to disable it.

Re-running overwrites the files.

::: warning Changed in 1.8.0
A run matching several tests used to write a single `run.<ext>`. Anything that
globs `run.mp4`, or expects exactly one file, needs updating.
:::

Pace a scoped run rather than a whole suite. A 50 test suite averaging 10 actions
per test gains roughly 2.5 minutes at 300ms, and about 4 minutes at 500ms.

Hitting `protocolTimeout` is unlikely. A chunk is `chunkSize` tests inside a
single browser call bounded by that timeout, so at 300ms you would need around
100 actions in one test to reach it. If you somehow do, lower `chunkSize` or
raise `protocolTimeout`.

## A failed recording fails the run

If you asked for a video and did not get one, the run exits **1** — even when
every test passed. A green run with no artifact sends the next person looking for
a clip that is not there.

A **0-byte output stays a warning**, because it is a legitimate outcome rather
than a crash. Chrome only emits screencast frames on a compositor update, so a
suite that never repaints records nothing and finishes cleanly.

::: warning Changed in 1.7.0
Before 1.7.0 a failed recording was silent, and an ffmpeg older than 8 could hang
the job outright. Both are now up-front failures. The fix is to install ffmpeg 8,
not to look for a flag that restores the old behaviour — there isn't one.
:::

## Why the clip plays outside Chrome

Puppeteer feeds ffmpeg PNG frames with no `-pix_fmt`, so RGB rides into VP9 and
the file lands as vp9 / `gbrp` in an mp4 container. That is valid and decodable,
and neither QuickTime nor Preview will open it — a successful recording that
looks like a failure.

So `twd-cli` re-encodes the finished mp4 to H.264 / `yuv420p` in place after the
run. The clip then opens in any player and in the browser, and measured on a real
capture it also took the file from 202805 bytes to 49222.

Failure there is a warning, never fatal: the untranscoded file is still a correct
recording of the run.

Two consequences worth knowing. `record.viewport` must be **even on both axes**,
because `yuv420p` requires it, and your ffmpeg build needs `libx264` — which is
why the prerequisite above asks for a `gpl` build.

## Recording in CI

The `record` composite action installs a known-good ffmpeg, records, and uploads
the clips, so a whole recording workflow is one step. It is a sibling of the
[`run` action](/ci-execution#github-action-recommended) and shares its contract:
**your app must already be served** at the url in `twd.config.json`. Starting a
dev server belongs to your workflow, not to the action.

The shape worth copying is label-triggered — put `record` on a pull request, get
the clips back as a comment. This is the workflow behind
[this PR comment](https://github.com/BRIKEV/twd-vue-example/pull/3#issuecomment-5598910647),
where a reviewer downloads one video per test the branch added:

```yaml
name: Record a PR's tests

on:
  pull_request:
    types: [labeled]

concurrency:
  group: record-pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  record:
    if: github.event.label.name == 'record'
    runs-on: ubuntu-latest
    timeout-minutes: 15
    permissions:
      contents: read
      pull-requests: write   # to comment the link and drop the label
    env:
      GH_TOKEN: ${{ github.token }}

    steps:
      # The PR head, not the merge commit: the point is to see the tests this
      # branch built. fetch-depth: 0 because changed-since needs history, and a
      # depth-1 clone does not contain the base commit at all.
      - uses: actions/checkout@v5
        with:
          ref: ${{ github.event.pull_request.head.sha }}
          fetch-depth: 0

      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm

      - run: npm ci

      - name: Start dev server
        run: |
          nohup npm run dev > /dev/null 2>&1 &
          npx wait-on http://localhost:5173

      - name: Record the tests this branch added
        id: rec
        uses: BRIKEV/twd-cli/.github/actions/record@v1.8.0
        with:
          changed-since: ${{ github.event.pull_request.base.sha }}
          artifact-name: twd-recording-pr-${{ github.event.pull_request.number }}

      # Best effort: a fork PR gets a read-only token and cannot comment.
      - name: Comment the link
        if: always()
        continue-on-error: true
        env:
          PR_NUMBER: ${{ github.event.pull_request.number }}
          CLIPS: ${{ steps.rec.outputs.clip-count }}
          VIDEO_URL: ${{ steps.rec.outputs.artifact-url }}
        run: |
          if [ "${CLIPS:-0}" = "0" ]; then
            gh pr comment "$PR_NUMBER" --body "Nothing to record: this branch added no TWD tests."
          else
            gh pr comment "$PR_NUMBER" --body "Recording: ${CLIPS} clip(s), one per test this branch added — [download the artifact](${VIDEO_URL}) and unzip."
          fi
```

Pin the action to a tag or a commit SHA, never `@main`. What a recording looks
like is decided by the action and the CLI it invokes, so an unchanged repo should
produce an unchanged video.

### Action inputs

| Input | Default | Description |
|-------|---------|-------------|
| `working-directory` | `.` | Directory where `twd.config.json` lives |
| `cli-version` | `1.8.0` | `twd-cli` version to run, pinned by default. A bare `npx twd-cli` would float on whatever npm published last, so pinning the action alone would not give you a stable recording |
| `changed-since` | (empty) | Record only the tests this branch added or changed since this ref. Needs history, so set `fetch-depth: 0`. Mutually exclusive with `tests` |
| `tests` | (empty) | Newline-separated test titles. Each becomes one `--test` filter, and filters are OR'd. Mutually exclusive with `changed-since` |
| `pace` | (empty) | Milliseconds held after each command, passed to `--record-pace`. Empty uses the CLI default of 300; `0` disables pacing |
| `install-ffmpeg` | `true` | Install a known-good ffmpeg 8.x. `false` uses whatever is on `PATH` |
| `upload-artifact` | `true` | Upload the clips as a workflow artifact |
| `artifact-name` | `twd-recording` | Name of the uploaded artifact |
| `retention-days` | `14` | How long to keep the artifact |

### Action outputs

| Output | Description |
|--------|-------------|
| `clip-count` | Number of clips written |
| `dir` | Directory the clips were written to, for a caller doing its own upload |
| `artifact-url` | URL of the uploaded artifact, when this action uploaded it |

### Three things that will bite you

- **`clip-count: 0` is a success, not a failure.** A branch that changed no tests
  has nothing to record, and that is a normal outcome. The upload step is skipped
  at zero rather than run with `if-no-files-found: error`, so check the count
  before you comment — as the example above does.
- **`install-ffmpeg` only ships a Linux build.** On any other runner it warns and
  skips, and installing ffmpeg 8 is yours to do. See
  [the prerequisite](#prerequisite-ffmpeg-8-or-newer).
- **Workflow policy stays with you.** The trigger, the label, the PR comment,
  `timeout-minutes` and `continue-on-error` are per-repo decisions. The action
  never comments on a pull request, which is why `pull-requests: write` is
  something you grant deliberately rather than inherit.

### Keep it out of your test workflow

Record from a separate, label-triggered job rather than adding `--record` to the
workflow that gates your pull requests. A recording is optional and the pull
request it describes is not, so a job that runs once the work is already pushed
cannot cost you the run that matters. `timeout-minutes` is the same instinct: the
hang class this had before 1.7.0 is fixed, but a recording should never be able
to cost a caller more than a recording.

`changed-since` maps to the CLI's `--changed-since`, which works with or without
`--record` and is documented under
[filtering tests](/ci-execution#running-only-the-tests-a-branch-changed).

## Configuration

All keys live under `record` in `twd.config.json`:

```json
{
  "record": {
    "enabled": false,
    "dir": "./twd-artifacts",
    "filename": null,
    "maxClips": 20,
    "format": "mp4",
    "viewport": { "width": 1280, "height": 1600, "deviceScaleFactor": 1 },
    "fps": 30,
    "speed": 1,
    "pace": 300,
    "preRoll": 0,
    "postRoll": 500,
    "hideSidebar": true,
    "ffmpegPath": "ffmpeg"
  }
}
```

| Option | Default | Description |
|---|---|---|
| `enabled` | `false` | Turn recording on. Same as passing `--record` |
| `dir` | `"./twd-artifacts"` | Where the video is written |
| `filename` | `null` | Explicit output name. When `null`, derived from the recorded tests. Setting it pins one clip for the whole run |
| `maxClips` | `20` | Most clips a run will split into. Past the bound it writes one file instead. `0` disables the bound |
| `format` | `"mp4"` | `"mp4"`, `"webm"` or `"gif"`, all encoded natively. Only `"mp4"` needs [ffmpeg 8](#prerequisite-ffmpeg-8-or-newer) |
| `viewport` | `1280x1600` | Applied only when recording. `width` and `height` set the video dimensions, and both must be even. See the two notes below |
| `fps` | `30` | Capture frame rate |
| `speed` | `1` | Post-hoc playback speed. Costs frame rate, prefer `pace` |
| `pace` | `300` | Milliseconds held after each command. `0` disables |
| `preRoll` | `0` | Milliseconds held on the opening state |
| `postRoll` | `500` | Milliseconds held on the final state. See below |
| `hideSidebar` | `true` | Hide the TWD sidebar so the frame is just your app |
| `ffmpegPath` | `"ffmpeg"` | Path to the binary if it is not on your `PATH` |

Four flags override the config: `--record`, `--record-dir <path>`,
`--record-speed <n>` and `--record-pace <ms>`. Everything else is config only.

### Why the recording viewport is 1600 tall

Puppeteer captures exactly the viewport: no scrolling, no letterboxing. Anything
below the fold is simply absent from the video, and nothing in the run output
says the frame was cropped — only a human watching it finds that out.

At the old `720` default, a real recording of the Vue example cut the todos page
just below the filter buttons, which put the list the tests assert on off-frame.
A clip that looked fine and showed none of the behaviour under test.

`1600` is wrong in the other direction for an app that fits, but it wastes
encoder time on empty space, which is the cheaper mistake. Set `record.viewport`
to your app's real shape once you know it, keeping both axes even for the
[H.264 conversion](#why-the-clip-plays-outside-chrome).

### deviceScaleFactor does not change the output resolution

It stays at `1` on purpose. Puppeteer measures the recording with the scale
factor forced to `0`, so the emulated value never reaches the encoder. Measured:
recording the same page at `2` and at `1` produced byte identical files.

It is not inert, though. It is live on the page for the whole run, so raising it
changes the environment under test: `srcset` and `image-set` select 2x assets,
and code that branches on device pixel ratio takes a different path. That adds to
the divergence described above for no gain in the video.

Puppeteer's actual output size knob is a `scale` option, which this feature does
not expose. To get a bigger clip, raise `width` and `height`.

### Why postRoll defaults to on

Chrome only emits a video frame when the page repaints, and each frame is held
until the next one arrives, because the next frame's timestamp is what says how
long to display the current one. The newest frame is therefore never written, and
stopping the recorder repeats the one before it.

A settled page produces no more repaints, so waiting alone does not help.
Measured: stopping immediately ended two states early, and a 400ms plain wait
still ended one state early.

`postRoll` briefly repaints the whole viewport with an invisible overlay after the
last test, which forces the real final frame through and then holds it. Without
it the last thing your test did never appears in the video.

## Next Steps

- [CI Execution](/ci-execution) for running tests headlessly in a pipeline
- [Writing Tests](/writing-tests) for the commands that appear in the recording
