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

This will run all unit tests using Vitest. You can also run tests in watch mode:

```bash
npm test -- --watch
```

### Testing New Features

When developing new features or fixing bugs, it's important to test them in a real application environment. We use the **`twd-test-app`** example project for this purpose.

The `twd-test-app` is a basic Vite + React application located in `examples/twd-test-app/`. It's set up to use the local development version of TWD, making it perfect for testing new features.

**To test your changes with twd-test-app:**

1. **Navigate to the test app:**
   ```bash
   cd examples/twd-test-app
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Run the test app:**
   ```bash
   npm run dev
   ```

   The test app is already configured to import TWD directly from the source code using relative paths (`../../../src/index.ts`), so you don't need to build or link anything. Any changes you make to the TWD source will be immediately available when you refresh the browser.

4. **Write test cases:**
   Create or modify test files in `examples/twd-test-app/src/twd-tests/` with the `.twd.test.ts` extension to test your new features. The test files already import from the source:
   ```typescript
   import { twd, userEvent } from "../../../../src";
   import { describe, it } from "../../../../src/runner";
   ```

5. **Verify in the browser:**
   Open the app in your browser (usually `http://localhost:5173`) and use the TWD sidebar to run your tests and verify everything works as expected.

This workflow allows you to:
- Test new features in a real application context
- Verify the UI and user experience
- Ensure API mocking works correctly
- Test edge cases and user interactions

### Finding Issues to Work On

twd-js's [open issues are here](https://github.com/BRIKEV/twd/issues). Look for issues labeled `good first issue` if you're new to the project.

## Submitting Changes

### Before Submitting

- Make sure all tests pass: `npm test`
- Build the project successfully: `npm run build`
- Test your changes in `twd-test-app` to ensure they work in a real application
- Update documentation if your changes affect the public API
- Follow the existing code style and conventions

### Pull Request Checklist

- [Check validations](https://github.com/BRIKEV/twd/actions) should pass. This includes linting and testing.

- **Tests are required**: All pull requests must include tests. Pull requests without tests will not be reviewed. See the [Pull Request Template](.github/pull_request_template.md) for details.

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


## Code Style

- Follow the existing TypeScript/React patterns in the codebase
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small
- Write self-documenting code when possible

## Conduct

We follow the [twd-js Code of Conduct](CODE_OF_CONDUCT.md).

All code in this repository is under [MIT License](LICENSE).
