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

That writes `twd-artifacts/checkout-flow.mp4`.

Requires `twd-cli` 1.4.0 or newer. See
[github.com/BRIKEV/twd-cli](https://github.com/BRIKEV/twd-cli) for source and
release notes.

## Prerequisite: ffmpeg

Recording spawns ffmpeg, so it has to be available:

```bash
brew install ffmpeg          # macOS
sudo apt-get install ffmpeg  # Linux
winget install ffmpeg        # Windows
```

Set `record.ffmpegPath` in `twd.config.json` if it is not on your `PATH`.
`twd-cli` checks for ffmpeg before launching the browser, so a missing binary
fails immediately with install instructions rather than part way through a run.

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

## A recorded run is not a CI run

Recording changes the conditions the tests run under:

- It sets its own viewport, 1280x720 by default, where a normal `twd-cli` run
  uses Puppeteer's implicit 800x600.
- It hides the TWD sidebar and reflows your app to full width.
- Pacing inserts real delays between actions, which can mask race conditions.

So a recorded run can pass or fail differently from a normal one. Treat the video
as a demo artifact and keep running [CI](/ci-execution) unrecorded.

## What ends up in the clip

One video per run, containing every matched test back to back.

`--test` matches a substring of the full `"suite > test"` path, so a single
filter can match several tests. Order follows declaration order in the suite
tree, not the order you passed the flags.

The filename describes the contents: a single recorded test gets a slug of its
full path, so `Login > shows error on bad password` becomes
`login-shows-error-on-bad-password.mp4`. Anything else gets `run.<ext>`.
Re-running overwrites the file.

Pace a scoped run rather than a whole suite. A 50 test suite averaging 10 actions
per test gains roughly 2.5 minutes at 300ms, and about 4 minutes at 500ms.

Hitting `protocolTimeout` is unlikely. A chunk is `chunkSize` tests inside a
single browser call bounded by that timeout, so at 300ms you would need around
100 actions in one test to reach it. If you somehow do, lower `chunkSize` or
raise `protocolTimeout`.

## Configuration

All keys live under `record` in `twd.config.json`:

```json
{
  "record": {
    "enabled": false,
    "dir": "./twd-artifacts",
    "filename": null,
    "format": "mp4",
    "viewport": { "width": 1280, "height": 720, "deviceScaleFactor": 1 },
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
| `filename` | `null` | Explicit output name. When `null`, derived from the recorded tests |
| `format` | `"mp4"` | `"mp4"`, `"webm"` or `"gif"`, all encoded natively |
| `viewport` | `1280x720` | Applied only when recording. `width` and `height` set the video dimensions. See the note below on `deviceScaleFactor` |
| `fps` | `30` | Capture frame rate |
| `speed` | `1` | Post-hoc playback speed. Costs frame rate, prefer `pace` |
| `pace` | `300` | Milliseconds held after each command. `0` disables |
| `preRoll` | `0` | Milliseconds held on the opening state |
| `postRoll` | `500` | Milliseconds held on the final state. See below |
| `hideSidebar` | `true` | Hide the TWD sidebar so the frame is just your app |
| `ffmpegPath` | `"ffmpeg"` | Path to the binary if it is not on your `PATH` |

Four flags override the config: `--record`, `--record-dir <path>`,
`--record-speed <n>` and `--record-pace <ms>`. Everything else is config only.

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
