---
outline: deep
---

# Writing Tests

Once your project is configured with `/twd:setup`, you can start writing tests using the `/twd` skill. This is the core of the TWD + AI workflow — the agent writes tests, runs them against your real app, and iterates until they pass.

## How It Works

The `twd` skill doesn't just generate test code — it also **runs** the tests with
[twd-cli](/ci-execution), which drives a headless Chrome against your running dev
server. Only the dev server has to be up; there is no tab for you to keep open.

1. **Probes your dev server** with one `curl`. If nothing answers, it tells you the dev
   command from `.claude/twd-patterns.md` and stops — it never asks you to open a tab.
2. **Writes flow tests** that follow your project patterns.
3. **Runs the new file first**, scoped with `npx twd-cli run --test "<describe>"`.
4. **Fixes failures** one at a time, re-running only the failing test.
5. **Checks your branch** with `npx twd-cli run --changed-since origin/main`.
6. **Closes with the full suite**, `npx twd-cli run`, and reports.

The token usage stays low: twd-cli prints one structured summary block — passed, failed,
retried — and that is all the agent reads. No screenshots or DOM dumps. A test that only
passed on a retry is reported as a finding, not hidden in a green run.

When it's done, the agent offers to **record** the tests it wrote, so you can watch them
instead of reading them:

```bash
npx twd-cli run --record --test "<test title>"
```

Want to watch the tests run live in your own browser while the agent works? That is
opt-in with [twd-relay](/ai-remote-testing).

## Test-First Approach

We recommend running `/twd` **before** implementing a feature. Write the tests first, then build the implementation to make them pass. This gives you:

- A clear specification of what the feature should do
- Immediate feedback as you implement
- Confidence that the feature works when the tests go green

## See It in Action

Here's a video showing the workflow — from writing tests to executing them:

<video controls width="100%">
  <source src="/images/tutorial/videos/twd-skill.mp4" type="video/mp4">
</video>

## What's Next

With tests in place, the next step is setting up CI so your tests run automatically on every push.

<div style="text-align: right; margin-top: 2rem;">

[CI Setup →](./ci-setup)

</div>
