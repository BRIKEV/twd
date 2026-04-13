---
outline: deep
---

# Writing Tests

Once your project is configured with `/twd:setup`, you can start writing tests using the `/twd` skill. This is the core of the TWD + AI workflow — the agent writes tests, executes them in your real browser, and iterates until they pass.

## How It Works

The `/twd` skill doesn't just generate test code — it also **runs** the tests using the [twd-relay](https://github.com/BRIKEV/twd-relay) package. The relay connects the AI agent to your browser via WebSocket, so the agent can:

1. Write a test based on your project patterns (from `.claude/twd-patterns.md`)
2. Execute it in the browser through the relay
3. Read the results (pass/fail with error details)
4. Fix any failures and re-run

The token usage is remarkably low — the relay executes commands in the terminal that interact with the browser and send text-based results back to the agent. No screenshots or heavy payloads.

## Test-First Approach

We recommend running `/twd` **before** implementing a feature. Write the tests first, then build the implementation to make them pass. This gives you:

- A clear specification of what the feature should do
- Immediate feedback as you implement
- Confidence that the feature works when the tests go green

## See It in Action

Here's a video showing the full workflow — from writing tests to executing them in the browser:

<video controls width="100%">
  <source src="/images/tutorial/videos/twd-skill.mp4" type="video/mp4">
</video>

## What's Next

With tests in place, the next step is setting up CI so your tests run automatically on every push.

<div style="text-align: right; margin-top: 2rem;">

[CI Setup →](./ci-setup)

</div>
