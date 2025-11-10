---
name: Bug Report
about: Create a report to help us improve TWD
title: '[BUG] '
labels: bug
assignees: ''
---

## Description

A clear and concise description of what the bug is.

## Environment Information

Please provide the following information to help us reproduce the issue:

### Framework & Build Tool
- **Framework**: [e.g., React, Astro, Remix]
- **Build Tool**: [e.g., Vite, Webpack, Create React App]
- **Framework Version**: [e.g., React 18.2.0]

### Runtime Environment
- **Node Version**: [e.g., 20.10.0]
- **npm/yarn/pnpm Version**: [e.g., npm 10.2.0]
- **Browser**: [e.g., Chrome 120, Firefox 121, Safari 17]
- **Browser Version**: [e.g., 120.0.6099.109]

### TWD Version
- **twd-js Version**: [e.g., 1.2.3]

## How to Reproduce

1. How do you run your tests? [e.g., `npm run dev`, `vite`, `npm start`]
2. What command do you use to start your development server?
3. Steps to reproduce the behavior:
   - Step 1: ...
   - Step 2: ...
   - Step 3: ...

## Test Code

**Please paste your complete test file(s) here:**

```typescript
// Paste your complete test code here
import { twd, userEvent } from "twd-js";
import { describe, it } from "twd-js/runner";

describe("Your test suite", () => {
  it("should do something", async () => {
    // ... your test code
  });
});
```

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

A clear and concise description of what actually happened.

## Screenshots

If applicable, add screenshots to help explain your problem. Screenshots are **highly appreciated** and help us understand the issue better.

## Additional Context

Add any other context about the problem here. For example:
- Does this happen in all browsers or just one?
- Did this work in a previous version?
- Are there any error messages in the browser console?
- Are there any error messages in the terminal?

## Possible Solution

If you have ideas on how to fix this, please share them here (optional).

