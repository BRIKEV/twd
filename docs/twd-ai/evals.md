---
outline: deep
---

# How the Skills Are Tested

A testing tool should ship tested. Every skill in the twd-ai plugin is guarded by
[plugin evals](https://code.claude.com/docs/en/plugin-evals): checks that run the
skill the way you would, with no human in the loop, and grade what it does.

## How an eval works

Each scenario is one case:

1. A script scaffolds a small project: a Vite app, a failing suite, a hand-written test with mistakes.
2. The agent gets a task, such as _"The todo tests are failing. Get them green."_
3. Graders score the result: the files it wrote, the commands it ran and in what order, and the files it left alone.

Every case runs three times **with** the plugin and three times **without** it. The
difference, Δ, is what the skills add over what the model already knows. A Δ near
zero is not a failure: the case still guards against a skill edit that breaks a rule.

## Tested scenarios

| Scenario | Skill | Verified |
|---|---|---|
| Vite + React app with TanStack Query and ESLint | `/twd:setup` | `twd()` Vite plugin, `twd.config.json`, `test:ci`, twd-lint in the ESLint config, query cache reset in `twd-patterns.md` |
| App with a mock API and a required env var | `/twd:ci-setup` | Test workflow on the `twd-cli` action, a separate label-triggered recording workflow, both starting the same app |
| Page flow tests | `twd` | Runner imports, mocks before visit, every async call awaited, payload asserted on the request, type-checked and linted |
| Component test with Testing Library | `twd` | Rendered into an isolated host, cleaned up between tests, network mocked rather than project code stubbed |
| A page around a third-party component (camera scanner) | `twd` | The component replaced with `twd.mockComponent()`, its callbacks driven by the fake, the page's own code untouched |
| A failing suite to get green | `twd` | A filtered `--test` run before the full one, `run.json` read, the test fixed rather than the app |
| Fixing a hand-written test | `twd` | twd-lint run and every report fixed |
| A unit-test request in a project with TWD | `twd` | The skill stays out of it: unit tests are left to the project's own runner |

## Results per model

Score with the plugin / Δ over the same model without it, from 0 to 1. Judge
`claude-sonnet-5-5`, three runs per arm, plugin 1.3.7, 2026-10-25.

| Scenario | Opus 5.5 | Sonnet 5.5 | Haiku 5.5 |
|---|---|---|---|
| Project setup | 1.00 / +0.90 | 1.00 / +0.90 | 1.00 / +0.90 |
| CI setup with recording | 1.00 / +0.70 | 1.00 / +1.00 | 0.97 / +0.80 |
| Component test | 1.00 / +0.50 | 1.00 / +0.54 | 1.00 / +0.63 |
| Failing suite to green | 1.00 / +0.40 | 0.60 / 0.00 | 0.53 / -0.07 |
| Fixing a hand-written test | 1.00 / +0.14 | 1.00 / +0.24 | 1.00 / +0.52 |
| Page flow tests | 0.97 / +0.10 | 1.00 / +0.27 | 0.80 / +0.37 |
| Mocking a third-party component | 1.00 / 0.00 | 1.00 / +0.29 | 0.90 / +0.48 |
| Unit-test request | 1.00 / 0.00 | 1.00 / 0.00 | 1.00 / 0.00 |

Setup and CI setup are where the skills matter most: without them, no model wires
TWD the way the project needs. The failing-suite case is the open one: Sonnet stops after
the first green filtered run, without the closing run or reading `run.json`, and
Haiku gives up after one denied command. Those are the next rules the `twd` skill
has to state more clearly.

## Run them yourself

The cases, the exact graders and the commands are in
[`evals/README.md`](https://github.com/BRIKEV/twd-ai/blob/main/evals/README.md),
along with cost and turns per run for each model.
