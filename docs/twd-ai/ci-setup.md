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

- A GitHub Actions workflow file for running TWD tests
- Optional coverage collection and reporting
- Proper dependency installation and build steps
- Configuration based on your detected dev server port and base path

## What's Next

With CI running, you now have a safety net. Next, let's find out what you're missing with test gap analysis.

<div style="text-align: right; margin-top: 2rem;">

[Test Gap Analysis →](./test-gaps)

</div>
