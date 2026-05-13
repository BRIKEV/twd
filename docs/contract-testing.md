---
title: Validate every mock against your OpenAPI spec — TWD
description: TWD collects every mock from your tests; twd-cli validates them against your OpenAPI specs so drift surfaces in CI, not in production.
head:
  - - meta
    - property: og:title
      content: Validate every mock against your OpenAPI spec — TWD
  - - meta
    - property: og:description
      content: TWD collects every mock from your tests; twd-cli validates them against your OpenAPI specs so drift surfaces in CI, not in production.
---

<LandingHero
  eyebrow="contract testing · for teams with backend separation"
  title="Your mocks lie. Catch them before production does."
  subtitle="TWD collects every mockRequest from your test suite. twd-cli validates them against your OpenAPI specs — so drift between your mocks and the real API surfaces in CI, not from a user."
  cta-label="Read the setup"
  cta-href="/contract-testing-setup"
/>

## The problem

Frontend teams write mock responses in tests that drift from reality over time. Fields get renamed, removed, or added in the API — but mocks stay frozen. Tests pass, code ships, and the app breaks in production.

Contract testing closes this gap: **test what you own, mock what you don't — then validate the mocks.**

## How it works

During the test run, TWD collects every mock registered via `twd.mockRequest()`. After tests complete, `twd-cli` validates those mocks against your OpenAPI specs using [openapi-mock-validator](https://github.com/BRIKEV/openapi-mock-validator). Each mock either matches the spec (✓), fails (✗) with the precise field that broke, or warns (⚠) when the status code or schema isn't documented yet.

You pick the mode per spec. `"error"` fails the test run (use this for stable endpoints you trust). `"warn"` reports but doesn't fail (use this while you're catching up to a moving target). When the GitHub Action runs in CI, a summary table is posted as a PR comment so the breakage is visible to the reviewer, not just to whoever scrolled the CI log.

## Quick start

```bash
npm install --save-dev twd-cli openapi-mock-validator
```

```json
// twd.config.json
{
  "url": "http://localhost:5173",
  "contractReportPath": ".twd/contract-report.md",
  "contracts": [
    {
      "source": "./contracts/users-3.0.json",
      "baseUrl": "/api",
      "mode": "error",
      "strict": true
    }
  ]
}
```

Run TWD's CLI in CI; the contract report is generated alongside the test results.

[Full setup, options, validations, and PR reports →](/contract-testing-setup)

<LandingCrossLinks
  :links='[
    { href: "/twd-js", title: "Write the tests that collect mocks", blurb: "Get the core in-browser testing experience that powers contract testing." },
    { href: "/twd-relay", title: "Let AI iterate on tests", blurb: "Have an AI agent author and stabilize tests before you gate on contracts." },
    { href: "/contract-testing-setup", title: "Full setup reference", blurb: "Contract options, supported validations, PR report configuration." }
  ]'
/>

## Get started

```bash
npm install --save-dev twd-cli openapi-mock-validator
```

[Read the setup guide →](/contract-testing-setup)
