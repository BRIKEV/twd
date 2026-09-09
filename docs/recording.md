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

Needs `twd-cli` 1.8.0 or newer for one clip per test and the
[`record` action](#recording-in-ci); recording itself has been there since 1.4.0.

## Prerequisite: ffmpeg

Recording needs ffmpeg, and `mp4` — the default format — needs **version 8 or
newer**.

```bash
brew install ffmpeg     # macOS
winget install ffmpeg   # Windows
ffmpeg -version         # check what you have
```

::: warning Linux: skip the distro package
`apt-get install ffmpeg` on Ubuntu 24.04 gives you 6.1.1, which cannot record
mp4 at all. Download a `gpl` build from
[BtbN/FFmpeg-Builds](https://github.com/BtbN/FFmpeg-Builds/releases) instead. In
GitHub Actions the [`record` action](#recording-in-ci) installs a working one for
you.
:::

`webm` and `gif` work on any ffmpeg version, so switching `record.format` is a
valid way out if you cannot upgrade.

`twd-cli` checks your ffmpeg *before* it launches the browser, so an unusable one
fails in a couple of seconds with a message naming what to install — you never
lose a run to it. Point `record.ffmpegPath` at the binary if it is not on your
`PATH`.

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

`maxClips` is there so a broad filter cannot leave you with fifty files to open.
Splitting is cheap — a few hundred milliseconds per clip, not a browser restart —
so raise it freely, or set `0` to remove the bound.

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

An **empty** clip is only a warning, though. A run where nothing on the page ever
redraws has nothing to capture, and that is a legitimate outcome rather than a
failure.

::: warning Changed in 1.7.0
A failed recording used to pass silently, and an ffmpeg older than 8 could hang
the job. Both now fail up front instead. Install ffmpeg 8 — there is no flag that
brings the old behaviour back.
:::

## Playback

`mp4` clips are converted to H.264 at the end of the run, so they open in
QuickTime, Preview, any browser and any video player — and land about four times
smaller. Nothing to configure.

If that conversion fails you get a warning rather than a failed run, and the clip
is still a complete recording; it just wants Chrome or VLC to play it.

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

      # Same steps your test workflow uses to get the app serving. Omit the
      # service worker init if `public/mock-sw.js` is committed.
      - name: Install mock service worker
        run: npx twd-js init public --save

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
| `cli-version` | `1.8.0` | `twd-cli` version to run, pinned so the same workflow keeps producing the same recording |
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
  [the prerequisite](#prerequisite-ffmpeg).
- **Workflow policy stays with you.** The trigger, the label, the PR comment,
  `timeout-minutes` and `continue-on-error` are per-repo decisions. The action
  never comments on a pull request, which is why `pull-requests: write` is
  something you grant deliberately rather than inherit.

### Keep it out of your test workflow

Record from a separate, label-triggered job rather than adding `--record` to the
workflow that gates your pull requests. A recording is optional and the pull
request it describes is not, so a job that runs once the work is already pushed
cannot cost you the run that matters. Keep `timeout-minutes` on the job for the same
reason: a recording should never be able to cost you more than a recording.

`changed-since` maps to the CLI's `--changed-since`, which works with or without
`--record` and is documented under
[filtering tests](/ci-execution#running-only-the-tests-a-branch-changed).

## Troubleshooting

| What you see | Why | What to do |
|---|---|---|
| It fails within seconds, naming ffmpeg | Your ffmpeg cannot record mp4 | Install [ffmpeg 8](#prerequisite-ffmpeg), or set `"format": "webm"` |
| The run is red but every test passed | The recording failed, and [that fails the run](#a-failed-recording-fails-the-run) | The ffmpeg error is printed above the summary |
| The clip is there but empty | Nothing on the page redrew — usually a filter that matched nothing | Check which tests the run summary says it matched |
| The clip misses the part you care about | It was below the fold | Raise `record.viewport.height` |
| It is over before you can see anything | Pacing is off | Drop `--record-pace 0`, or raise it to `500` |
| One `run.mp4` instead of a clip per test | A single match, an explicit `filename`, or more matches than `maxClips` | See [what ends up in the clip](#what-ends-up-in-the-clip) |
| Nothing recorded in CI, `clip-count: 0` | The branch changed no tests, which is a success | Nothing — or pass `tests` instead of `changed-since` |

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
| `format` | `"mp4"` | `"mp4"`, `"webm"` or `"gif"`, all encoded natively. Only `"mp4"` needs [ffmpeg 8](#prerequisite-ffmpeg) |
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

### The viewport is exactly what the video contains

There is no scrolling and no letterboxing, so anything below the fold is missing
from the clip — and nothing in the run output tells you the frame was cropped.

That is why the default is `1280x1600`, taller than a real screen: at a shorter
height it is easy to record a page whose interesting half is off-frame. Set
`record.viewport` to your app's real shape once you know it, and keep both
numbers **even** (the H.264 conversion needs it).

### deviceScaleFactor will not give you a sharper clip

The recording ignores it, so raising it buys you nothing in the video. It *is*
still applied to the page during the run, so a value above `1` changes what you
are testing — `srcset` and `image-set` pick 2x assets, and code that branches on
device pixel ratio takes another path. Leave it at `1`.

For a bigger clip, raise `width` and `height`.

### Why postRoll defaults to on

Without it the last thing your test did never appears in the video. A settled
page stops redrawing, and the final frame is still waiting on a redraw that will
never come, so the clip ends an action or two early.

`postRoll` nudges the page once after the last test to push that frame through,
then holds it. The default `500` is enough — there is rarely a reason to change
it, and `0` will cost you the ending.

## Next Steps

- [CI Execution](/ci-execution) for running tests headlessly in a pipeline
- [Writing Tests](/writing-tests) for the commands that appear in the recording
