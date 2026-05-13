# TWD — Test While Developing

[![CI](https://github.com/BRIKEV/twd/actions/workflows/ci.yml/badge.svg)](https://github.com/BRIKEV/twd/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/twd-js.svg)](https://www.npmjs.com/package/twd-js)
[![license](https://img.shields.io/github/license/brikev/twd.svg)](./LICENSE)
[![Maintainability](https://qlty.sh/gh/BRIKEV/projects/twd/maintainability.svg)](https://qlty.sh/gh/BRIKEV/projects/twd)
[![Code Coverage](https://qlty.sh/gh/BRIKEV/projects/twd/coverage.svg)](https://qlty.sh/gh/BRIKEV/projects/twd)

<p align="center">
  <img src="https://raw.githubusercontent.com/BRIKEV/twd/main/images/twd-skill.gif" alt="TWD running with an AI agent: tests written and executed in a real browser sidebar" width="800">
</p>

> **Frontend tests that run in your real browser.** Same DOM, same routes, same state as your dev server. For React, Vue, Angular, and Solid.

## The problem

Testing gets pushed to next week, and next week never comes. When it does happen, tests usually run in a different environment from where you're building, so testing feels like overhead the moment you finish a feature.

The tooling pushes you the same way. You end up writing more code for the tests than for the feature itself, between setup, harnesses, mocks, and helpers. Adding tests starts to feel like shipping a second app on top of the one you already finished.

As AI writes more of your code, the gap widens. Agents generate test files that look correct but never actually execute in a real browser. The mocks those tests rely on quietly drift from the real API over time. Fields get renamed, mocks stay frozen, tests pass, production breaks.

## The solution

TWD puts tests inside your dev server. A sidebar appears in your real browser, runs tests against the same DOM your users see, and updates as you code. When you're ready, plug in an AI agent that writes tests, runs them via a WebSocket bridge, and iterates until they pass. When you ship, validate every mock against your OpenAPI spec to catch drift before a user does.

> **Test what you own. Mock what you don't.**

Full pitch and docs at **[twd.dev](https://twd.dev)**.

## Quick start

```bash
npm install --save-dev twd-js
```

Add the Vite plugin (auto-loads the sidebar and discovers your test files):

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { twd } from 'twd-js/vite-plugin'

export default defineConfig({
  plugins: [twd({ open: true })],
})
```

Write a test next to your code:

```ts
// src/App.twd.test.ts
import { twd, screenDom } from 'twd-js'
import { describe, it } from 'twd-js/runner'

describe('App', () => {
  it('shows the heading', async () => {
    await twd.visit('/')
    const heading = await screenDom.findByRole('heading', { level: 1 })
    twd.should(heading, 'be.visible')
  })
})
```

Run `npm run dev` and open the app. The TWD sidebar appears in your browser; click play to run the test.

→ **[Full setup guide](https://twd.dev/getting-started)** · **[Framework integration](https://twd.dev/frameworks)** (Angular, non-Vite, Astro, React Router)

## The TWD ecosystem

One package today. The rest when you need it.

| Tool | What it does |
| --- | --- |
| **[twd-js](https://twd.dev/twd-js)** | The core sidebar. Frontend tests that run in your real browser. |
| **[twd-relay](https://twd.dev/twd-relay)** | Token-efficient browser testing for AI agents. Structured pass/fail over WebSocket. No Playwright, no screenshots. |
| **[twd-cli](https://twd.dev/contract-testing)** | Headless CI runs with coverage and OpenAPI contract validation. |

## Examples & showcase

- **[twd-shadcn](https://github.com/BRIKEV/twd-shadcn)** — React + shadcn/ui with a [live demo](https://brikev.github.io/twd-shadcn/) you can interact with
- **[twd-react-router](https://github.com/BRIKEV/twd-react-router)** — React Router (Framework Mode) with `createRoutesStub` and loader mocking
- **[twd-tanstack-example](https://github.com/BRIKEV/twd-tanstack-example)** — TanStack Router integration
- **[twd-vue-example](https://github.com/BRIKEV/twd-vue-example)** — Vue 3
- **[twd-angular-example](https://github.com/BRIKEV/twd-angular-example)** — Angular
- **[twd-auth0](https://github.com/BRIKEV/twd-auth0)** — Auth0 session mocking

→ **[All examples and community content](https://twd.dev/community)**

## Documentation

- **[Getting Started](https://twd.dev/getting-started)** — Install, set up, write your first test
- **[Writing Tests](https://twd.dev/writing-tests)** — Selectors, assertions, interactions, navigation
- **[API Mocking](https://twd.dev/api-mocking)** — Mock Service Worker patterns
- **[AI Integration](https://twd.dev/ai-overview)** — Connect Claude Code (or any agent) via twd-relay
- **[Contract Testing Setup](https://twd.dev/contract-testing-setup)** — Validate mocks against OpenAPI specs in CI
- **[API Reference](https://twd.dev/api/)** — Test functions, commands, assertions

## Contributing

Open issues or pull requests on [GitHub](https://github.com/BRIKEV/twd). If you're starting out in tech and looking for a beginner-friendly first PR, see the [open issues](https://github.com/BRIKEV/twd/issues). Reach out and the maintainer will help with setup and walk you through it.

## Contributors ✨

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kevinccbsg"><img src="https://avatars.githubusercontent.com/u/12685053?v=4?s=100" width="100px;" alt="Kevin Julián Martínez Escobar"/><br /><sub><b>Kevin Julián Martínez Escobar</b></sub></a><br /><a href="https://github.com/BRIKEV/twd/commits?author=kevinccbsg" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/DamonCaos"><img src="https://avatars.githubusercontent.com/u/169996368?v=4?s=100" width="100px;" alt="Javier Rodriguez"/><br /><sub><b>Javier Rodriguez</b></sub></a><br /><a href="https://github.com/BRIKEV/twd/commits?author=DamonCaos" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/codesthenos"><img src="https://avatars.githubusercontent.com/u/166174180?v=4?s=100" width="100px;" alt="Guillermo Ruiz Arranz"/><br /><sub><b>Guillermo Ruiz Arranz</b></sub></a><br /><a href="https://github.com/BRIKEV/twd/commits?author=codesthenos" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://portfolio-pi-ruby-7alj81l6dp.vercel.app/"><img src="https://avatars.githubusercontent.com/u/157389533?v=4?s=100" width="100px;" alt="Roberto Gomez Fabrega"/><br /><sub><b>Roberto Gomez Fabrega</b></sub></a><br /><a href="https://github.com/BRIKEV/twd/commits?author=Rober040992" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome.

## License

[MIT](./LICENSE)
