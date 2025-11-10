# TWD getting started

A few months ago, I wrote about Testing While Developing, where I rethought how we add tests — not as an afterthought, but as part of the development process itself. You can read that article [here](https://dev.to/kevinccbsg/rethinking-testing-why-i-test-while-developing-3pi1).

I also wrote a follow-up post showing how I apply that idea in [backend applications](https://dev.to/kevinccbsg/testing-while-developing-twd-nestjs-example-3i2o). However, when I tried to bring that same mindset to frontend development, I quickly realized that the existing tools didn’t fully support the workflow I wanted.

Right now, the main tools for testing frontend apps are Playwright, Cypress, and Testing Library. They’re all great — but none of them quite fit my approach to testing while developing.

- **Cypress** comes close. It has a fantastic interactive mode and powerful mocking capabilities (especially with `cy.intercept`).
The drawback, though, is that it runs your tests in a separate browser environment. That might sound small, but it breaks the natural development flow — developers want to stay in their browser, with their extensions and dev tools. It also means you’re debugging an app that’s technically running somewhere else, which can feel detached.
- **Playwright** is powerful and great for automation and CI pipelines. But it’s often too heavy for iterative local testing. Its setup and execution feel more like a QA stage than a development aid. You don’t usually run Playwright while actively coding — it’s more for validating behavior after you’ve already built the feature.
- **Testing Library**, on the other hand, is elegant for unit and integration tests. Its API is intuitive and promotes testing the UI as users would interact with it. However, it runs in a virtual DOM, so it doesn’t replicate real browser interactions or timing. It’s great for logic validation, but not for real interactivity or DOM-level debugging.

So, I decided to build something new, a tool that fits how I actually want to test.

---
## Introducing twd-js

This tool aims to solve the “lack of frontend testing that fits real development” problem.

`twd-js` lets you:

- Test interactivity like Cypress or Playwright — but directly in your own browser, with no extra browser instance.
- Handle the DOM easily, with a feel similar to React Testing Library’s user-event utilities.
- Use a familiar syntax inspired by popular test runners (like Vitest, Jest, and Mocha).
- Install and run tests effortlessly, without complex configuration.
- Mock network requests with a simple, declarative API (similar to Cypress intercepts).
- Run in CI mode and generate coverage reports automatically.

You can check it out here [twd-js](https://brikev.github.io/twd/).

---

## What’s Next

I’m starting a new tutorial series to show how to use twd-js, step by step, and how it makes writing frontend tests easy, fast, and part of your natural coding flow.

Here’s what the series will cover:

1. [Installation and basic commands](https://dev.to/kevinccbsg/getting-started-with-twd-installation-and-first-test-part-1-1a15)
2. [Selectors and assertions](https://dev.to/kevinccbsg/testing-while-developing-part-2-selectors-assertions-and-user-events-d6p)
3. [Mocking network requests](https://dev.to/kevinccbsg/testing-while-developing-part-3-mocking-api-requests-41ld)
4. [CI integration](https://dev.to/kevinccbsg/testing-while-developing-part-4-running-tests-in-ci-10op)
5. [Collecting coverage](https://dev.to/kevinccbsg/testing-while-developing-part-5-collecting-coverage-1gom)

If you’ve struggled with frontend testing — slow feedback loops, complex setups, or tools that feel disconnected from how you actually develop — join me in this series.

I promise you’ll find a smoother, more natural way to test while building your features. Your team will love how easily it fits into the workflow.
