# Contributing to twd-js

Thanks for your interest in twd-js. TWD (Testing Web Development) is a library designed to seamlessly integrate testing into your web development workflow. It streamlines the process of writing, running, and managing tests directly in your application, with a modern UI and powerful mocking capabilities.

## Contributions

twd-js welcomes contributions from everyone.

Contributions to twd-js should be made in the form of GitHub pull requests. Each pull request will be reviewed by a core contributor [@kevinccbsg](https://github.com/kevinccbsg) and either landed in the main tree or given feedback for changes that would be required.

## Getting Started

### Installation

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/twd.git
   cd twd
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running Tests

To run the test suite for the TWD library itself:

```bash
npm test
```

This will run all unit tests using Vitest. You can also run tests in CI mode with coverage:

```bash
npm run test:ci
```

### Development Workflow

1. **Always create a feature branch** — never commit directly to `main`:
   ```bash
   git checkout -b feat/my-feature
   # or
   git checkout -b fix/my-bugfix
   ```

2. **Run the dev server** to work on the library:
   ```bash
   npm run dev
   ```

3. **Run tests frequently** as you make changes:
   ```bash
   npm test src/tests/path/to/your.spec.tsx
   ```

### Testing in Example Apps

TWD has two build modes that behave differently, and **both must be tested manually** for UI changes:

- **Standard (React)**: Used by `examples/twd-test-app/` — imports directly from source, so changes are reflected immediately via HMR.
- **Bundled (Preact)**: Used by `examples/vue-twd-example/` — uses the built `dist/` output where React is replaced by Preact via `@preact/preset-vite`.

> **Important:** Unit tests run in jsdom with React, which does not catch Preact-specific issues in the bundled build. Always test UI changes in both example apps.

#### Testing with twd-test-app (React / dev mode)

1. Build the library and sync the mock service worker to all example apps (run once from the repo root):
   ```bash
   npm install
   npm run build
   npm run copy:mock-sw
   ```

2. Install and start the test app:
   ```bash
   cd examples/twd-test-app
   npm install
   npm run dev
   ```

3. The test app imports TWD directly from source (`../../../../src/`), so subsequent changes to the library are immediately reflected via HMR.

4. Write or modify test files in `examples/twd-test-app/src/twd-tests/` with the `.twd.test.ts` extension:
   ```typescript
   import { twd, screenDom, userEvent } from "../../../../src";
   import { describe, it } from "../../../../src/runner";
   ```

5. Open the app in your browser (usually `http://localhost:5173`) and use the TWD sidebar to run your tests. **Include a screenshot of the green sidebar in your PR.**

#### Testing with vue-twd-example (Preact / bundled build)

1. Build the library and copy the dist to examples:
   ```bash
   npm run build
   npm run copy:dist:examples
   ```

2. Navigate to the Vue example and start it:
   ```bash
   cd examples/vue-twd-example
   npm install
   npm run dev
   ```

3. Verify your changes work correctly in the bundled Preact build. Pay special attention to:
   - Event handling (Preact and React handle synthetic events differently)
   - Controlled inputs (Preact's compat layer may not fully replicate React's behavior)
   - Any UI interaction that relies on React-specific internals

### Finding Issues to Work On

twd-js's [open issues are here](https://github.com/BRIKEV/twd/issues). Look for issues labeled `good first issue` if you're new to the project.

## Code Style and Linting

This project uses **ESLint** + **Prettier** for the main library source (`src/`). Examples are not strictly linted, but `it.only` / `describe.only` is blocked everywhere via a pre-commit hook and CI check.

### What runs automatically

When you run `npm install`, Husky sets up a Git pre-commit hook that:

1. Greps the entire repo for focused tests (`it.only`, `describe.only`, etc.) and rejects the commit if any are found.
2. Runs ESLint with `--fix` and Prettier with `--write` on staged `src/` files.

You don't need to enable format-on-save in your editor — the hook handles formatting at commit time.

### If your editor has a different formatter

Most editors with a Prettier extension auto-detect `.prettierrc.json` and use the project's rules. If you have another formatter set as default, please either:

- Install the Prettier extension and let it own formatting, OR
- Disable format-on-save in this project (an editor-local override is fine — do not commit it).

The committed `.editorconfig` ensures correct indent / EOL / charset regardless of your editor.

### Manual commands

```bash
npm run lint            # check src/ for ESLint errors
npm run lint:fix        # auto-fix what ESLint can
npm run format          # apply Prettier to src/
npm run format:check    # verify src/ is Prettier-clean (used by CI)
npm run check:only      # grep for focused tests across src/ and examples/
```

### CI

Every PR runs a `lint` job that calls `lint`, `format:check`, and `check:only`. PRs that fail any of these are blocked from merging.

## Submitting Changes

### Before Submitting

- Make sure all tests pass: `npm run test:ci`
- Build the project successfully: `npm run build`
- Test your changes in **both** `twd-test-app` (React) and `vue-twd-example` (Preact bundled) for UI changes
- Update documentation if your changes affect the public API
- Follow the existing code style and conventions

### Pull Request Checklist

- [Check validations](https://github.com/BRIKEV/twd/actions) should pass. This includes linting and testing.

- **Tests are required**: All pull requests must include tests. Pull requests without tests will not be reviewed. See the [Pull Request Template](.github/pull_request_template.md) for details.

- **Screenshots are required** for UI changes: Include before/after screenshots showing the change works in the browser.

- **Documentation updates**: If your change affects the public API or adds new features, documentation updates are required.

- Commits should be as small as possible, while ensuring that each commit is correct independently (i.e., each commit should compile and pass tests).

- If your patch is not getting reviewed or you need a specific person to review it, you can @-reply a reviewer asking for a review in the pull request or a comment.

### Reporting Issues

Before reporting an issue, please check the [existing issues](https://github.com/BRIKEV/twd/issues) to see if it's already been reported.

When creating a bug report, please use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Complete environment information (framework, Node version, browser, etc.)
- Full test code that reproduces the issue
- Screenshots if applicable
- Steps to reproduce

For feature requests, use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).

## AI-Generated Contributions

We welcome the use of AI tools (GitHub Copilot, Claude Code, Cursor, etc.) to assist with contributions, but with strict guidelines:

1. **Issue-first**: AI-generated features or changes will only be accepted if they originate from a GitHub issue that has been **approved by a code owner** before implementation begins. Do not open a PR for an AI-generated feature without an approved issue.

2. **Tests are mandatory**: All AI-generated code must include comprehensive tests. PRs without tests will be rejected regardless of code quality.

3. **Screenshots are mandatory**: All AI-generated PRs that involve UI changes must include screenshots demonstrating the feature or fix works correctly in the browser.

4. **Manual verification**: AI-generated code must be manually verified by the contributor in both example apps (React and Preact bundled) before submitting.

5. **Transparency**: If your contribution was substantially generated by AI, mention it in the PR description. This helps reviewers focus on areas where AI tools commonly introduce subtle issues.

## Code Style

- Follow the existing TypeScript/React patterns in the codebase
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small
- Write self-documenting code when possible
- **Prefer `screenDom` (Testing Library) for element queries in example tests.** Only fall back to `twd.get()` when a query cannot be expressed through Testing Library.

## Conduct

We follow the [twd-js Code of Conduct](CODE_OF_CONDUCT.md).

All code in this repository is under [MIT License](LICENSE).
