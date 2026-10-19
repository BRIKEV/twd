---
title: Where TWD Fits - The Testing Trophy
description: TWD mapped onto Kent C. Dodds' Testing Trophy. TWD covers the integration layer for frontend apps, in the browser you develop in, next to static checks, unit tests and end-to-end tests.
---

# Where TWD Fits: The Testing Trophy

[Kent C. Dodds](https://kentcdodds.com/) describes a testing strategy as a trophy, not a pyramid. Static checks form the base, unit tests sit above them, end-to-end tests are the small cup on top, and the largest part of the trophy is **integration**. That is where most of your confidence comes from for the effort you put in.

TWD is built for that middle layer on the frontend.

<TestingTrophy />

## Why the middle is the biggest

> Write tests. Not too many. Mostly integration.
>
> Guillermo Rauch, popularized by Kent C. Dodds in [Write tests](https://kentcdodds.com/blog/write-tests)

Each layer trades speed for confidence. Static checks and unit tests are cheap and fast, but they can pass while the screen is broken. End-to-end tests give the most confidence, but they need the whole system running, and they are the slowest to write and to run. Integration tests sit in between: they exercise your app the way a user does while staying fast and deterministic, because the only thing faked is what you don't own.

Kent's guiding principle for these tests:

> The more your tests resemble the way your software is used, the more confidence they can give you.

## What TWD brings to the integration layer

On the frontend, an integration test means rendering the real app (routes, providers, state, components) and mocking only the network. TWD does that in your browser:

- **The browser you develop in.** Tests run in a sidebar next to your app, against your dev server. No simulated DOM, no separate test build.
- **Mock what you don't own.** API calls are answered by a [service worker](/api-mocking), and [contract testing](/contract-testing-setup) checks every mock against your OpenAPI spec so the mocks don't drift from the real API.
- **Tests that read like the user.** [Testing Library](/testing-library) queries find elements by role, label and text.
- **The same tests everywhere.** [twd-cli](/ci-execution) runs them headlessly in CI, with [coverage](/coverage) and [video recordings](/recording) of each test, and your [AI agent](/ai-overview) can write, run and fix them.

## The other layers still matter

TWD doesn't replace the rest of the trophy:

| Layer | What it catches | Typical tools |
| --- | --- | --- |
| End to End | The deployed system, frontend and backend together | Playwright, Cypress |
| Integration | Your app's behavior, with the network mocked | TWD |
| Unit | One function, hook or component in isolation | Vitest, Jest |
| Static | Typos, type errors, risky patterns | TypeScript, ESLint, [twd-lint](/linting) |

Keep a few end-to-end tests for the critical paths, use unit tests for logic that is easier to check on its own, and let integration tests carry most of the weight.

## A map, not a ritual

TWD doesn't ask you to pick a layer before you write a test. As [Why Test While Developing](/motivation) puts it, you automate the check you were already doing by hand. The trophy shows where those checks usually end up: most of them in the middle.
