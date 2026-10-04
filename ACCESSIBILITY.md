# Accessibility

TWD is a testing tool that developers keep open all day while they build their
apps. If you cannot read the sidebar, reach its buttons with a keyboard, or hear
whether a test passed, you cannot use TWD. We want everyone, including people
with disabilities, to be able to use TWD, read its documentation, and
contribute to it.

This page covers what we prioritise, what we expect from contributions, how to
report a barrier, and what has been tested so far. It applies to two things:

- **The TWD sidebar** shipped in the [`twd-js`](https://www.npmjs.com/package/twd-js)
  package, which runs inside your app in the browser.
- **The documentation site** at [twd.dev](https://twd.dev/), built from the
  `docs/` folder of this repository.

The formal, audited statement lives on the docs site:
[Accessibility Statement for TWD](https://twd.dev/accessibility-statement).

## Priorities

We focus on the parts of TWD people touch most:

- **Keyboard use.** Every button, link, and control in the sidebar and on the
  docs site can be reached and used with the keyboard alone, in a logical order,
  with no keyboard traps.
- **Visible focus.** You can always see where keyboard focus is. The focus ring
  is at least 2px thick, sits 2px away from the element, and keeps a contrast of
  at least 3:1 in both light and dark themes.
- **Screen reader feedback.** Sidebar controls announce their name, role, and
  state. When a test run finishes, the result (passed, failed, and why) is
  announced, so you do not have to look at the sidebar to know what happened.
- **Readable text.** Text meets a contrast ratio of at least 4.5:1 (3:1 for
  large text) in both themes. We avoid long runs of uppercase text, and links
  are not distinguished by colour alone.
- **Plain language.** Documentation is written in plain, consistent English.

### Audit results

In June 2026 an independent audit by [Latam11y](mailto:mariapiapenafoissac@gmail.com)
found that TWD meets **WCAG 2.2 Level AA**. That result is limited to what was
evaluated:

| | |
| --- | --- |
| **Scope** | twd.dev home page and Getting Started page, plus the twd-js sidebar |
| **Date** | June 2026 |
| **Method** | Manual review with keyboard and NVDA 2026.1 on Windows 11 (26H1); colour contrast checked with Tanaguru Contrast Finder |
| **Evaluators** | María Pía Peña Foissac and Daiana Elizabeth Carbonell, Latam11y |

Findings from the audit were fixed in [#267](https://github.com/BRIKEV/twd/pull/267).
Pages and features added after June 2026 have not been independently audited.
For the rest of the project, WCAG 2.2 Level AA is our target, not a verified
claim.

## Contributor expectations

If your pull request changes anything people see or interact with (the sidebar
in `src/ui/`, or the docs site in `docs/`), please:

- **Keep it keyboard operable.** Check that you can reach and use your change
  with <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>, <kbd>Enter</kbd>, and
  <kbd>Space</kbd>, and that focus stays visible.
- **Give controls an accessible name.** Icon-only buttons need an `aria-label`
  (see `src/ui/TestListItem.tsx` and `src/ui/ClosedSidebar.tsx` for examples).
- **Keep screen reader announcements working.** Test results are announced
  through a polite live region in `src/ui/TWDSidebar.tsx`. If you change how a
  run reports its result, update the tests under
  `accessibility - screen reader announcements` in
  `src/tests/ui/twdSidebar.spec.tsx`.
- **Check contrast in both themes.** New colours, including new defaults for
  [theme variables](https://twd.dev/theming), must meet the contrast ratios
  above in light and dark mode.
- **Do not rely on colour alone.** Pass and fail states, links, and errors need
  a second cue, such as text, an icon, or an underline.
- **Use accessible queries in tests and examples.** Prefer Testing Library role
  and label queries (`screenDom.findByRole`, `findByLabelText`) over CSS
  selectors. This keeps our own examples aligned with how assistive technology
  sees the page.

**Evidence to include in your PR:** screenshots of the change in both light and
dark themes (already required for UI changes), and a short note on how you
checked keyboard access. If you tested with a screen reader, say which one and
on which browser and operating system.

There is no automated accessibility checker in CI today. The checks above are
manual, and reviewers will look for them.

## Reporting accessibility issues

If something in TWD or its documentation gets in your way, please tell us.
You do not need to know which guideline is involved, and you never need to
tell us about any disability.

- **GitHub Issues:** [open an issue](https://github.com/BRIKEV/twd/issues/new)
  and put "Accessibility" in the title.
- **Email:** [hello.brikev@gmail.com](mailto:hello.brikev@gmail.com?subject=TWD%20Accessibility),
  if you prefer not to post in public or do not have a GitHub account.
- **GitHub Discussions:** [ask a question](https://github.com/BRIKEV/twd/discussions)
  if you are not sure whether something is a bug.

Useful details, if you have them:

- What you were trying to do (for example, "run a single test from the sidebar").
- Where it happened: the docs page URL, or the sidebar and your app's framework.
- What happened, and what you expected to happen.
- Your browser, operating system, and any assistive technology (screen reader,
  magnifier, voice control, and so on), with versions.

Screenshots or recordings help but are optional.

### Severity

Maintainers assign severity during triage. You do not need to pick one. We use
the repository's existing priority labels:

| Label | Meaning | Example |
| --- | --- | --- |
| `high` | You cannot complete a task at all. | The Run All button cannot be reached with the keyboard; a screen reader announces nothing when a test fails. |
| `medium` | You can complete the task, but only with significant extra effort or a workaround. | Focus is visible but hard to see in dark mode; a docs code sample has low-contrast comments. |
| `low` | The task works, but the experience is harder than it should be. | A button's accessible name is vague; an icon is announced when it should be ignored. |

Accessibility issues also get the `bug` label.

### How we respond

- **Within 5 business days:** we acknowledge your report and confirm the
  severity.
- **Within 30 business days:** we either ship a fix or reply with an update,
  including a workaround if one exists and a plan for the fix.
- **Before closing:** we link the fix in the issue and invite you to confirm it
  works for you.

TWD is maintained by a small team. If we expect to miss these timelines, we
will say so in the issue.

## Ownership and maintenance

The project maintainer, [@kevinccbsg](https://github.com/kevinccbsg), is
responsible for accessibility in this repository. That means:

- triaging accessibility reports and assigning severity,
- reviewing user-facing pull requests against the expectations above,
- keeping this file and the [Accessibility Statement](https://twd.dev/accessibility-statement)
  up to date.

We review this page at least once a year, and whenever there is a significant
change to the sidebar or the docs site. If ownership changes, the new owner is
named here in the same pull request.

## Supported environments

What has been tested:

| Area | Environment |
| --- | --- |
| twd-js sidebar and twd.dev | Keyboard only, NVDA 2026.1, Windows 11 (26H1) |
| twd-js sidebar and twd.dev | Light and dark themes |

The sidebar renders inside your app in any modern browser that runs your Vite
dev server, and is used with React, Vue, Angular, Solid, and React Router apps.
Other combinations, such as VoiceOver on macOS, JAWS, TalkBack, mobile browsers,
high contrast modes, and voice control, have **not** been formally tested. They
may work, but we cannot promise it yet. Reports from those environments are
especially welcome.

## Known limitations

No barriers are currently documented. That is not the same as having none.
Here is what that statement rests on, and where it does not reach:

- **Only part of the docs site was audited.** The June 2026 audit covered the
  home page and the Getting Started page. Other pages (API reference, guides,
  the tutorial, and the TWD AI pages) share the same theme and fixes but have
  not been individually evaluated.
- **Embedded videos.** Some pages (for example Getting Started, API Mocking,
  and Recording) embed short clips and YouTube videos. Clips have a text
  description and a pause button, and the surrounding page covers the same
  steps in text. We have not checked that every YouTube video has accurate
  captions.
- **Your app's accessibility is your own.** TWD's sidebar sits next to your
  app. TWD does not audit or change the accessibility of the app you are
  testing.
- **Custom themes.** If you override the sidebar's
  [theme variables](https://twd.dev/theming), contrast depends on the colours
  you choose.

Known issues will be listed here with a link to the tracking issue.

## Feedback and improvements

If you have ideas for making TWD more accessible, or for making this page
clearer, open an [issue](https://github.com/BRIKEV/twd/issues) or a
[discussion](https://github.com/BRIKEV/twd/discussions), or send a pull request
that edits this file. If something is blocking you right now, please use the
[reporting process](#reporting-accessibility-issues) above so we can treat it as
a bug.
