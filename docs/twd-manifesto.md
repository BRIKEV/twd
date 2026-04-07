---
title: TWD Manifesto
---

# TWD Manifesto

**Test While Developing** (TWD) is a mindset, not a checklist.  
It's about writing tests as you build — not afterward, not someday, not just when you're done.

TWD is for developers who want faster feedback, deeper confidence, and fewer regressions — without the ceremony of traditional testing philosophies.

---

## Principles

1. **Write tests while building, not after**  
   Testing is part of the development flow — not something you add at the end.

2. **Keep your test runner open**  
   Let your tests run continuously while coding to get fast, meaningful feedback.

3. **Automate what you already check manually**  
   If you're repeating a check by hand, it's a good candidate for a test.

4. **Let real use guide what you test**  
   Focus on the behaviors and flows your users actually rely on.

5. **Use coverage to find gaps, not for validation**  
   Don't chase numbers — use coverage tools after the fact to spot what you missed, not to prove anything.

6. **Prefer fast feedback over strict structure**  
   Don't get stuck on test types or formats — prioritize feedback that helps you move forward.

7. **Test what you own, mock what you don't**  
   Focus on testing your own code and logic. External services, third-party APIs, and dependencies you don't control should be mocked — not tested.

8. **Design features to be easy to validate**  
   Write code that's naturally testable and easy to observe as you develop.

---

> TWD isn't about writing *more* tests — it's about writing the *right* ones, at the right time.
