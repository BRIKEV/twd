---
outline: deep
---

# Test Quality

Having tests isn't enough — they need to be *good* tests. The `/twd:test-quality` skill analyzes your test files and grades them across four dimensions, giving you actionable feedback on where to improve.

## Running the Skill

```plaintext
/twd:test-quality
```

The skill reads each of your TWD test files and evaluates them against four weighted criteria:

- **Journey Coverage (35%)** — Do tests cover complete user workflows, not just visibility checks?
- **Interaction Depth (20%)** — Is there variety in the user actions being tested?
- **Assertion Quality (25%)** — Are assertions verifying real outcomes (payload checks, state) vs. loose checks?
- **Error & Edge Cases (20%)** — Are failure scenarios and boundary conditions covered?

Each file gets a letter grade (A through D) with a weighted overall score:

![TWD Quality Grades - Overview](/images/tutorial/twd-quality-grades.png)

![TWD Quality Grades - Detailed breakdown](/images/tutorial/twd-quality-grades-2.png)

## Improving Your Tests

The skill provides 2-3 actionable suggestions per file that scores below A, referencing the actual test content. You can then run `/twd` again to implement the improvements:

<video controls width="100%">
  <source src="/images/tutorial/videos/twd-improve-test.mp4" type="video/mp4">
</video>

## What's Next

Your tests are written, running in CI, covering your routes, and scoring well. The final step: generate a visual gallery so everyone on the team can see what's being tested.

<div style="text-align: right; margin-top: 2rem;">

[Test Flow Gallery →](./flow-gallery)

</div>
