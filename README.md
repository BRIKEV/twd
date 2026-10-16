# TWD (Test While Developing)

[![CI](https://github.com/BRIKEV/twd/actions/workflows/ci.yml/badge.svg)](https://github.com/BRIKEV/twd/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/twd-js.svg)](https://www.npmjs.com/package/twd-js)
[![license](https://img.shields.io/github/license/brikev/twd.svg)](https://github.com/BRIKEV/twd/blob/main/LICENSE)
[![Maintainability](https://qlty.sh/gh/BRIKEV/projects/twd/maintainability.svg)](https://qlty.sh/gh/BRIKEV/projects/twd)
[![Code Coverage](https://qlty.sh/gh/BRIKEV/projects/twd/coverage.svg)](https://qlty.sh/gh/BRIKEV/projects/twd)
[![OSAF: TWD (Test While Developing)](https://img.shields.io/badge/Accessibility%20Framework-TWD%20(Test%20While%20Developing)-F143AB?logo=github&logoColor=000000)](https://github.com/open-source-accessibility/Open-Source-Accessibility-Framework/issues/39)

<p align="center">
  <img src="https://raw.githubusercontent.com/BRIKEV/twd/main/images/twd-skill.gif" alt="TWD running with an AI agent: tests written and executed in a real browser sidebar" width="800">
</p>

> **Frontend tests that run in the browser you develop in.**

A sidebar in your dev server runs component and flow tests against your real app: the same DOM, routes and state you are building. Your AI agent can drive the same loop headlessly, and every mock gets checked against the real API before you merge.

Open source under the MIT license.

## Why TWD

- **Tests live where you build.** No second browser to keep open and no separate harness. Write a test next to your code and press play in the sidebar.
- **Built for AI agents.** The agent writes a test, runs it headlessly against your real app, reads the failure, fixes it and re-runs until green. Results come back as structured text, not screenshots, so the loop stays cheap in tokens.
- **Review AI pull requests with your eyes.** Put a `record` label on a pull request and CI posts one video per test the branch added, from the same run that turned the check green. No extra tokens, and it cannot drift from the code.
- **Mocks that can't drift.** `twd-cli` validates every mocked response against your OpenAPI spec and points at the exact field that broke, so a renamed field shows up in CI instead of in production.
- **Mistakes caught before the run.** `twd-lint` flags a missing `await`, a wrong runner import or a forgotten `it.only` in your editor and in CI.

TWD complements end-to-end tools like Playwright and Cypress: TWD gives fast, deterministic feedback on your UI with mocked boundaries while you develop, and end-to-end tests check that your systems work together.

## Quick start

### With an AI agent

Install the TWD skills in your agent:

```bash
npx skills add BRIKEV/twd-ai   # Cursor, Copilot, Windsurf, Codex and other agents
```

On Claude Code, install the plugin instead to also get the slash commands:

```bash
claude plugin marketplace add BRIKEV/twd-ai
claude plugin install twd@twd-ai
```

Then ask your agent to set up TWD (`/twd:setup` in Claude Code). It detects your stack, installs `twd-js` and `twd-cli`, and wires the Vite plugin. Start `npm run dev` and ask for tests: *"Write tests for the checkout page"*.

→ **[Get started with AI agents](https://twd.dev/ai-overview)**

### By hand

```bash
npm install --save-dev twd-js
```

Add the Vite plugin (it loads the sidebar and discovers your test files):

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

Run `npm run dev` and open the app. The sidebar appears next to it; press play on any test and watch it run against the page you are building.

Works with React, Vue, Angular, Solid, Astro, Nuxt, HTMX and vanilla JS, on Vite, Webpack or a CDN. TWD code is guarded by `import.meta.env.DEV`, so nothing reaches your production bundle.

→ **[Full setup guide](https://twd.dev/getting-started)** · **[Framework integration](https://twd.dev/frameworks)**

## The TWD ecosystem

Start with `twd-js`. Add the rest when you need it. Everything is MIT licensed.

| Package | What it does |
| --- | --- |
| **[twd-js](https://twd.dev/twd-js)** | The core: the in-browser runner and sidebar, request mocking and assertions. |
| **[twd-cli](https://twd.dev/ci-execution)** | Headless runs for CI and AI agents, with coverage, [OpenAPI contract validation](https://twd.dev/contract-testing) and [per-test video recording](https://twd.dev/recording). |
| **[twd-lint](https://twd.dev/linting)** | Catches TWD test mistakes in the editor and in CI before a browser run. Works with `npx twd-lint` or as an ESLint plugin. |
| **[twd-ai](https://twd.dev/ai-overview)** | Agent skills (and a Claude Code plugin) that set TWD up, write and run tests, and find gaps in your coverage. |
| **[twd-relay](https://twd.dev/twd-relay)** | Optional: watch your agent's test runs live in your own browser tab. |

## Examples

- **[twd-shadcn](https://github.com/BRIKEV/twd-shadcn)**: React + shadcn/ui with a [live demo](https://brikev.github.io/twd-shadcn/) you can interact with
- **[twd-react-router](https://github.com/BRIKEV/twd-react-router)**: React Router (Framework Mode) with `createRoutesStub` and loader mocking
- **[twd-tanstack-example](https://github.com/BRIKEV/twd-tanstack-example)**: TanStack Router integration
- **[twd-vue-example](https://github.com/BRIKEV/twd-vue-example)**: Vue 3
- **[twd-angular-example](https://github.com/BRIKEV/twd-angular-example)**: Angular
- **[twd-auth0](https://github.com/BRIKEV/twd-auth0)**: Auth0 session mocking

→ **[All examples and community content](https://twd.dev/community)**

## Documentation

- **[Getting Started](https://twd.dev/getting-started)**: Install, set up, write your first test
- **[Writing Tests](https://twd.dev/writing-tests)**: Selectors, assertions, interactions, navigation
- **[API Mocking](https://twd.dev/api-mocking)**: Built-in request mocking via service worker
- **[Linting](https://twd.dev/linting)**: Catch test mistakes before a browser run with twd-lint
- **[CI Execution](https://twd.dev/ci-execution)**: Headless runs with twd-cli and the run report
- **[Recording Runs](https://twd.dev/recording)**: One video per test, and the `record` label for pull requests
- **[Contract Testing Setup](https://twd.dev/contract-testing-setup)**: Validate mocks against OpenAPI specs in CI
- **[AI agents](https://twd.dev/ai-overview)**: Let your agent set up, write and run tests
- **[API Reference](https://twd.dev/api/)**: Test functions, commands, assertions

## Bringing TWD to your team?

TWD is open source and stays that way. If you would rather not do the adoption work alone, [book a working session with the maintainer](https://calendly.com/kevinccbsg/30min): we set TWD up in your repo, wire the agent loop and the record job into your CI, and leave you with tests your team wrote together.

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
      <td align="center" valign="top" width="14.28%"><a href="https://raymondportfolio.vercel.app"><img src="https://avatars.githubusercontent.com/u/86033049?v=4?s=100" width="100px;" alt="Raymond Lin"/><br /><sub><b>Raymond Lin</b></sub></a><br /><a href="https://github.com/BRIKEV/twd/commits?author=RLinV1" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome.

## License

[MIT](https://github.com/BRIKEV/twd/blob/main/LICENSE)
