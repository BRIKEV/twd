---
title: Rethinking Testing - Why I Test While Developing
---

# Rethinking Testing: Why I Test While Developing

These days, we're surrounded by tools that help us move faster — frameworks, CLIs, even AI that writes code for us. It's never been easier to build.

And yet, despite all that speed, many teams still struggle with something fundamental: **testing**.

Think about it:

You build a feature. You check that it works — maybe in the browser, maybe with an API call, maybe by looking at the database.

In your mind, the **feature is done**.

Then someone says:

> "Now let's add some tests."

And suddenly, what felt complete now feels like overhead.
Why write more code to prove something you just confirmed manually?

## Why Testing Still Gets Left Behind

This frustration isn't rare — it's a symptom of how we've been taught to think about testing.

Ask someone about testing and you'll often hear:

- "We didn't have time to add tests."
- "TDD just slows me down."
- "I test manually and it works, why write more code?"

And to be fair, they're not entirely wrong.

Testing often feels like a **separate task** — something formal and rigid that comes after development. It's rarely part of the same flow. We switch mental gears, bring in new tools, write boilerplate... and all to confirm something we already verified manually.

No wonder it feels like overhead.

But the problem isn't testing itself — it's the **disconnect between building and testing**.

## Testing Should Be Part of Development, Not a Chore

What if, instead of treating testing as a separate step, we just **automated the same checks** we're already doing during development?

I think about testing the same way I think about committing code: it's not optional, it's just part of getting the job done.

But here's the catch — to make that work, we need to **stop treating testing as a set of rituals**. Forget about the pyramid, about whether it's unit, integration, or E2E. Forget about TDD or BDD. Instead, ask yourself:

- What am I building right now?
- How do I manually check that it works?
- How can I automate **that exact validation**?

That's your test. That's the mindset.

## Example: Building an API Endpoint

Let's say you're developing an API endpoint that inserts in a database and returns the inserted data.

Typical workflow:

1. Write the endpoint code.
2. Test it manually in Postman.
3. Add the DB insert logic.
4. Check the data in your DB client.
5. Verify the final response again in Postman.

Cool, it works. But now someone asks you to "add tests." You feel resistance — **why repeat all that work** when you already know it works?

So maybe you write a unit test for some internal function… or you try to mock the DB in an integration test. Either way, it's an extra effort for something you've already tested manually.

## The Alternative: Test While Developing

Instead of starting with tests like in strict TDD, or leaving them for later (which often means never), **I take a different route**.

I build the feature as I normally would, but I replace every manual step with a test.

For example:

1. Create the endpoint.
2. Instead of opening Postman, write a test that calls the endpoint the same way Postman would (Supertest in node for example).
3. Add the DB logic.
4. Instead of checking your DB with a client like DBeaver, include tools in your test to validate your database.
5. Instead of manually verifying the response, assert it with your test framework.

You've just automated the exact checks you would've done manually. No extra work — **just redirected effort**. These tests stick around, and they run every time the code changes.

Yes, it's a bit more work at first — and you'll probably hit some friction the first few times. But it pays off quickly. You're **not doing extra work** — you're just turning your manual checks into repeatable ones.

## It Scales and Teaches Well

This approach comes with a lot of side benefits:

- You get real coverage of actual business logic.
- Onboarding juniors is easier — they can read working tests that mirror how features work.
- You don't need to explain how to test things manually — the tests are the documentation.
- Plus, you still get all the classic benefits of having tests: safer refactors, faster debugging, and fewer regressions.

## What About Frontend?

For frontend development, I use **TWD** — a testing library designed specifically for this philosophy.

Instead of waiting for the full app to be ready or relying on real backends, TWD runs tests directly in your browser during development. You get a beautiful sidebar that shows test results in real-time as you code. I use Mock Service Worker integration to mock API responses, so I can develop and test features without needing a running backend.

That's right — I'm not running tests in a separate terminal or waiting for CI. I'm building and testing in the same environment, with instant feedback right in my browser.

Some might say "that's not how traditional testing works."
But we're not here to follow tradition — **we're here to build solutions**. And TWD gives me fast feedback, solid coverage, and minimal extra effort. It's testing while developing, not testing after developing.

## What About Traditional Tests?

Yes, you should still do those too — once the main work is done.

Here's where **coverage tools** come in. Not as a vanity metric, but as a checklist. Once your "test while developing" tests are done, run coverage to see what's missing. Then fill in the gaps with more traditional unit, integration, or even property-based tests.

## Final Thoughts

Testing isn't a separate phase of development. It's not an extra burden. It's a **different way of thinking** about the same job.

Stop trying to follow someone else's test strategy. Just ask:

> How do I know this works?

Then automate that answer.

That's it. That's my philosophy. Test while developing.
