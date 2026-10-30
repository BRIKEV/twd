---
title: Support
description: How to get help with TWD, response targets for issues and pull requests, supported versions, and support options for teams.
---

# Support

TWD is MIT licensed and maintained by [BRIKEV](https://github.com/BRIKEV). This page says where to ask, how fast you can expect an answer, which versions get fixes, and what to do if your team needs more than community support.

## Where to ask

| You have | Go to |
|----------|-------|
| A bug | [Open an issue](https://github.com/BRIKEV/twd/issues/new/choose) using the bug report template |
| A question or a "how do I..." | [GitHub Discussions](https://github.com/BRIKEV/twd/discussions) |
| A feature idea | [Open an issue](https://github.com/BRIKEV/twd/issues/new/choose) using the feature request template |
| A security vulnerability | [Private advisory](https://github.com/BRIKEV/twd/security/advisories/new) or `hello@twd.dev`. Never a public issue. See the [security policy](https://github.com/BRIKEV/twd/blob/main/SECURITY.md) |
| A team adoption or commercial question | `hello@twd.dev`, or see [support for teams](#support-for-teams) |

A good bug report includes the `twd-js` and `twd-cli` versions, your framework and bundler, and, for a failing headless run, the `.twd/report/run.json` that [twd-cli writes](/ci-execution). A minimal repository that reproduces the problem gets the fastest answer.

## Response targets

These are the targets the maintainer works to. They are best effort, not a contractual SLA. Business days are Monday to Friday, Europe/Madrid time.

| What | Target |
|------|--------|
| First response on an issue | 3 business days |
| First review of a pull request | 1 week |
| Security report acknowledgment | 48 hours |
| Security fix or mitigation plan (critical) | 7 days |

A first response means a person has read the issue and replied: a fix, a question, a workaround, or a label saying where it stands. It is not a promise of a fix in that time.

## Priorities

Not every issue is equal. This is the order work gets picked up in:

1. **Security vulnerabilities.** Handled under the [security policy](https://github.com/BRIKEV/twd/blob/main/SECURITY.md).
2. **A release that breaks a working suite.** If upgrading within 1.x makes tests fail that passed before, that is a regression: it is fixed in a patch release, or the change is reverted.
3. **Bugs without a workaround.**
4. **Bugs with a workaround, documentation gaps.**
5. **Feature requests.** Discussed in the issue first, so the design is agreed before anyone writes code.

## Versions

TWD follows [semantic versioning](https://semver.org/). This applies to `twd-js`, `twd-cli` and `twd-relay`.

- **Supported version:** the latest 1.x release. Fixes, including security fixes, ship in a new release on top of it, so getting a fix means upgrading to that release. Older minors are not patched.
- **Stable vs beta:** everything documented is stable within 1.x, except features marked **(beta)** in the docs, currently [Sharding](/sharding) and [Layout Snapshots](/layout-snapshots). A beta feature can change in a minor release, and the change is called out in the [changelog](https://github.com/BRIKEV/twd/blob/main/CHANGELOG.md).
- **Breaking changes** to stable APIs only happen in a new major version.
- **Node.js:** 20 or newer.

TWD is a devDependency and never runs in your production build, so a bad release can't reach your users. If an upgrade breaks your suite, pin the previous version in `package.json`, keep shipping, and [open an issue](https://github.com/BRIKEV/twd/issues/new/choose) with both version numbers.

## What community support does not cover

- Debugging your application code when the problem isn't TWD itself.
- Access to private repositories. Reduce the problem to a public reproduction, or see the options below.
- Server-side features of SSR-first frameworks, which TWD is [not designed to test](/testing-trophy).

## Support for teams

If your team is adopting TWD and needs more than the targets above:

- **Working sessions.** Write to `hello@twd.dev` and we set up as much time as your team needs: TWD set up in your repo, the agent loop and the record job wired into your CI, and tests your team wrote together.
- **Support with agreed response times.** For teams that need a named contact, response times agreed in advance, or help on a private codebase, write to `hello@twd.dev` with your team size and what you need. Terms are agreed per team.

Either way, TWD stays open source. Paid support buys time and response commitments, never features: everything TWD does is in the MIT-licensed packages.

## Contributing

The fastest way to get something fixed is often to fix it. See the [contributing guide](https://github.com/BRIKEV/twd/blob/main/CONTRIBUTING.md), and the [open issues](https://github.com/BRIKEV/twd/issues) for a place to start.
