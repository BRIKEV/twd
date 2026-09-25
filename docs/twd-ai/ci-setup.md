---
outline: deep
---

# CI Setup

Setting up CI early is one of the best things you can do for your project. The `/twd:ci-setup` skill automates the entire process — from detecting your project configuration to generating GitHub Actions workflows.

## Why Set Up CI Early

The longer you wait to add CI, the harder it gets. Tests that pass locally but fail in CI often reveal:

- Missing environment variables
- Hardcoded ports or paths
- Dependencies that aren't properly declared

Setting up CI right after your first tests means you catch these issues before they compound.

## Running the Skill

```plaintext
/twd:ci-setup
```

Just like `/twd:setup`, this skill starts with a discovery phase. It detects your project configuration and asks whether you want to include code coverage:

![TWD CI Setup - Questions](/images/tutorial/twd-ci-setup-questions.png)

It will ask about the dependencies to install, then generate all CI workflow files for you:

![TWD CI Setup - Install dependencies](/images/tutorial/twd-ci-setup-install-dependencies.png)

![TWD CI Setup - Done](/images/tutorial/twd-ci-setup-done.png)

## What It Generates

- A GitHub Actions workflow that runs the same `twd-cli` your agent uses locally, so CI
  and development never disagree about how tests run
- Optional coverage collection and reporting
- Optional contract validation of your mocks against your OpenAPI specs, posted as a PR comment
- The environment variables and mock-API steps your app needs to start in CI
- Configuration based on your detected dev server port and base path

It installs `twd-cli` only if `/twd:setup` hasn't already, and merges into the
`twd.config.json` setup wrote instead of replacing it.

## Recording pull requests

The skill also offers a separate **record** workflow. Put a `record` label on a pull
request and a job records the tests that branch added or changed — one video per test —
then comments the link on the PR.

A diff tells you what the agent thinks it built. A 20-second clip shows what the person
using your app will see. The recording comes out of CI, not out of a model, so it costs
no tokens and cannot drift from the code: the same run that turned the check green
produced the video.

It stays a separate job on purpose, so a recording can never cost you the run that gates
the pull request. You need to create a `record` label in the repository once.
[How recording works](/recording#recording-in-ci)

## What's Next

With CI running, you now have a safety net. Next, let's find out what you're missing with test gap analysis.

<div style="text-align: right; margin-top: 2rem;">

[Test Gap Analysis →](./test-gaps)

</div>
