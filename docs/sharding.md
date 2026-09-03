---
title: Sharding
description: Split a long TWD test run across parallel CI jobs with twd-cli --shard, then merge the shard reports into one summary
---

# Sharding across CI jobs

::: warning Beta
Sharding is new and marked beta on purpose. It is strictly additive: a run
without `--shard` behaves exactly as it did before, writes the same files, and
exits the same way, so enabling it cannot affect your existing pipeline.

What may still change is **how tests are assigned to shards**. Today each shard
takes every nth test from the discovered list, and a future release is likely to
group by top-level `describe` instead, so a suite always stays in one shard. Do
not build anything that depends on *which* tests land in a given shard.
Everything else (the flags, the report files, `merge`'s output and exit code) is
stable.
:::

A single run walks the whole suite in one browser. Sharding splits it across
parallel CI jobs instead, then joins the results back into one report.

```bash
npx twd-cli run --shard 2/4     # "I am job 2 of 4"
npx twd-cli merge .twd/shards   # join the reports, decide the exit code
```

Requires `twd-cli` 1.5.0 or newer.

The `4` is how many jobs you are running, **not** how many tests exist. You never
need to know the test count. Each shard boots its own browser, discovers the
whole suite exactly as a normal run does, and keeps every 4th test. Add tests and
the same 4 jobs just split more of them.

Each shard writes `run.json` and `coverage.json` to `./.twd/run` (change it with
`--report-dir`). `merge` reads the downloaded shard directories, combines test
results, coverage and contract validation, prints one summary, and exits non-zero
if anything failed anywhere.

## A complete workflow

This runs as-is. The bundled action installs Chrome, runs the shard, and uploads
its report under the name `merge` expects.

```yaml
name: TWD tests (sharded)

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      # Without this, the first red shard cancels its siblings and the merge job
      # sees gaps it cannot tell apart from a shard that crashed.
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]

    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm

      - run: npm ci

      - name: Install mock service worker
        run: npx twd-js init public --save

      - name: Start the dev server
        run: |
          nohup npm run dev > dev.log 2>&1 &
          npx wait-on http://localhost:5173 --timeout 60000

      - name: Run this shard
        uses: BRIKEV/twd-cli/.github/actions/run@main
        with:
          shard: ${{ matrix.shard }}/4

  merge:
    runs-on: ubuntu-latest
    needs: [test]
    # Runs even though a shard job may have exited 1. Without this a red shard
    # short-circuits the workflow and the merged summary never prints.
    if: ${{ !cancelled() }}

    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm

      - run: npm ci

      - uses: actions/download-artifact@v4
        with:
          pattern: twd-run-*
          path: .twd/shards

      - name: Merge the shard reports
        run: npx twd-cli merge .twd/shards
```

`merge` owns the final exit code. It fails if any test failed in any shard, if a
contract was violated in `error` mode, or if a shard report is missing entirely.

## Without the bundled action

If you drive the CLI directly, you own the two steps the action was doing for
you: installing Chrome, and uploading the report with `if: always()`.

```yaml
      - run: npx puppeteer browsers install chrome
      - run: npx twd-cli run --shard ${{ matrix.shard }}/4
      - uses: actions/upload-artifact@v4
        # A red shard must still upload, or merge cannot tell "this shard failed"
        # from "this shard never ran".
        if: always()
        with:
          name: twd-run-${{ matrix.shard }}
          path: .twd/run
          if-no-files-found: error
```

## Commands and flags

| Flag | Command | Default | Description |
|------|---------|---------|-------------|
| `--shard <i>/<n>` | `run` | off | Run shard `i` of `n`. A malformed spec throws rather than silently running zero tests |
| `--report-dir <path>` | `run` | `.twd/run` | Where this shard writes `run.json` and `coverage.json` |
| `--out <path>` | `merge` | `.twd/merged-run.json` | Where the merged report is written |

`twd-cli merge <dir>` takes the directory holding the downloaded shard reports as
its first positional argument.

## The three conditions that matter

Each of these breaks a sharded run in a different way, and all three are easy to
leave out:

| Condition | Where | What breaks without it |
|---|---|---|
| `fail-fast: false` | the shard matrix | the first red shard cancels its siblings, and `merge` reports their reports as missing |
| `if: always()` | the shard's artifact upload | a red shard uploads nothing, so `merge` cannot distinguish failure from a crash |
| <code v-pre>if: ${{ !cancelled() }}</code> | the merge job | a red shard short-circuits the workflow and the merged summary never prints |

## When sharding pays

Sharding buys wall clock with compute. Every shard repeats the per-job setup
(install, browser, dev server), and the merge job runs after all of them, so it
only wins once test time dominates that fixed cost.

Measured on a real suite of 256 browser tests:

```
Shards   Wall clock                            Runner time
  1      █████████████████████████  12.6 min   baseline
  2      ████████████████            8.1 min   +15%
  4      █████████████               6.5 min   +47%
         ├──────┤
         ~4 min floor, no matter how far you shard
```

The takeaways:

- **Most of the win is in the first split.** 1 to 2 shards saved 4.5 minutes.
  2 to 4 saved only 1.6 more.
- **There is a floor you cannot get under.** Setup runs in every shard and the
  merge job runs after them all, so past four shards you pay a lot for seconds.
- **Total compute goes up.** Runner time grew 15% at two shards and 47% at four.
  If you are billed for runner minutes, or your runner concurrency is contended,
  pick the smallest number of shards that gets you under your target.
- **Short suites get slower.** The `twd-cli` project's own 71-test suite goes
  from 25s in one job to 41s across two plus a merge. Under a couple of minutes,
  do not shard.

## Caveats

- **Coverage.** Each shard writes its own `coverage.json`, and `merge` combines
  them into `.nyc_output/out.json`, but only when the whole run is green. That
  matches how a single run behaves. `merge` reports how many shards contributed.
  See [Code Coverage](/coverage) for reporting on the merged output.
- **Missing shards are an error.** If a shard job dies before uploading, `merge`
  refuses and names the gap rather than silently reporting 3 of 4 shards as a
  complete green run.
- **Tests must register identically in every job.** Each shard fingerprints the
  ordered list of `"suite > test"` paths it discovered and `merge` verifies they
  match. Registering tests conditionally, behind a feature flag, a date, or
  `Math.random()`, makes the fingerprints diverge and `merge` will say so. It
  compares paths rather than internal test ids because `twd-js` assigns those at
  registration time and they differ on every page load, so each shard's browser
  sees its own.
- **`maxFailures` is per shard.** Four shards at the default of 10 can reach 40
  failures between them before all four bail.
- **`--test` and `--shard` compose.** Filters resolve first, then the filtered
  list is sharded. As with any filtered run, coverage is skipped.
- **The contract report is written by `merge`, not per shard.** Each shard would
  otherwise overwrite the others with a fraction of the mocks, so the PR comment
  step belongs in the merge job. See
  [Contract Testing Setup](/contract-testing-setup#pr-reports).
- **Recording** produces one clip per shard. They are not concatenated.
- **A missing shard leaves no merged report on disk.** `merge` throws before it
  writes `.twd/merged-run.json`, so a CI step that uploads that path with
  `if: always()` will find nothing when a shard is missing. The error message on
  stderr is the diagnosis in that case.
- **`record.filename` collides under sharding.** Only the *derived* recording
  filename is per-shard. If `record.filename` is set explicitly in
  `twd.config.json`, every shard writes to the same video path. Use the derived
  name, or a per-shard `--record-dir`, when recording a sharded run. See
  [Recording Runs](/recording).
- **Assignment may change.** See the beta note at the top. Which tests land in
  which shard is not part of the stable contract yet.

## Next Steps

- [CI Execution](/ci-execution): the single-job setup, config options, and the bundled action
- [Recording Runs](/recording): capture a run to video for a pull request
- [Contract Testing](/contract-testing): validate your API mocks against OpenAPI specs
- [Code Coverage](/coverage): collect and report coverage
