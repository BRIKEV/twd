# Welcome to TWD

Welcome to the TWD (Testing While Developing) tutorial! This comprehensive guide will walk you through everything you need to know to start testing your React applications with TWD.

## What is TWD?

TWD is a testing library designed to seamlessly integrate testing into your web development workflow. Unlike traditional testing tools that run in separate environments, TWD runs directly in your browser, allowing you to test your application exactly as your users experience it.

## Why TWD?

When building frontend applications, existing testing tools often don't fit the natural development workflow:

- **Cypress** runs tests in a separate browser environment, breaking the natural development flow where developers want to stay in their browser with their extensions and dev tools.
- **Playwright** is powerful but often too heavy for iterative local testing, feeling more like a QA stage than a development aid.
- **Testing Library** runs in a virtual DOM, so it doesn't replicate real browser interactions or timing.

TWD solves these problems by letting you:

- Test interactivity like Cypress or Playwright — but directly in your own browser, with no extra browser instance.
- Handle the DOM easily, with a feel similar to React Testing Library's user-event utilities.
- Use a familiar syntax inspired by popular test runners (like Vitest, Jest, and Mocha).
- Install and run tests effortlessly, without complex configuration.
- Mock network requests with a simple, declarative API (similar to Cypress intercepts).
- Run in CI mode and generate coverage reports automatically.

## What You'll Learn

This tutorial series will guide you through:

1. **[Installation](./installation)** - Set up TWD in your project and see the sidebar appear
2. **[First Test](./first-test)** - Write your first test with selectors, assertions, and user interactions
3. **[API Mocking](./api-mocking)** - Mock network requests to test your frontend independently
4. **[CI Integration](./ci-integration)** - Run tests automatically in your CI/CD pipeline
5. **[Code Coverage](./coverage)** - Collect and visualize code coverage from your tests

## Prerequisites

Before starting, make sure you have:

- Basic knowledge of JavaScript/TypeScript
- Familiarity with React
- Understanding of web development concepts (DOM, HTTP requests)
- Node.js and npm/yarn installed
- A React project set up (we'll help you add TWD to it!)

## Getting Help

If you get stuck during the tutorial:

- 📖 Check the [API Reference](/api/) for detailed documentation
- 📚 Review the [Writing Tests Guide](/writing-tests) for best practices
- 🐛 [Report issues](https://github.com/BRIKEV/twd/issues) if you find bugs
- 💬 [Join discussions](https://github.com/BRIKEV/twd/discussions) for questions

## Ready to Start?

Let's begin by installing TWD in your project!

[Installation →](./installation)

