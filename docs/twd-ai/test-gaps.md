---
outline: deep
---

# Test Gap Analysis

You've written some tests, CI is running — but how do you know if you've covered enough? The `/twd:test-gaps` skill scans your project to find untested and partially-tested routes, then classifies them by risk.

## Running the Skill

```plaintext
/twd:test-gaps
```

The skill cross-references your routes against your existing TWD test files and produces a prioritized report:

![TWD Gap Analysis - Results](/images/tutorial/twd-gap-analysis.png)

![TWD Gap Analysis - Detailed breakdown](/images/tutorial/twd-gap-analysis-2.png)

## How It Works

1. **Route discovery** — Detects all routes in your app (from framework router configs, page component patterns, or test URLs)
2. **Coverage classification** — Each route is classified as:
   - **Tested** — Has both `twd.visit()` and `userEvent` interactions
   - **Partially tested** — Has visits but missing interaction or mutation mock coverage
   - **Untested** — No matching test files at all
3. **Risk assessment** — Reads component code to assign risk (HIGH/MEDIUM/LOW) based on mutations, financial handling, permissions, and UI complexity

## Filling the Gaps

Once you know what's missing, you can run the `/twd` skill again to write tests for the high-priority gaps. Here's a video showing the full flow — from identifying gaps to writing and running the missing tests:

<video controls width="100%">
  <source src="/images/tutorial/videos/twd-complete-tests.mp4" type="video/mp4">
</video>

## What's Next

Now that you've filled your gaps, let's check how good your tests actually are.

<div style="text-align: right; margin-top: 2rem;">

[Test Quality →](./test-quality)

</div>
