# Browser Component Testing - Docs Design

Date: 2026-08-28
Status: Approved (ready for implementation plan)
Affected repos: `twd` (docs, landing page, AI prompts, llms files)
Follow-ups out of scope: `twd-ai` plugin repo, `DEFAULT_PATTERN` library change

## Context

Testing Library's `render()` works inside a TWD test. It was never coupled to
jsdom: `@testing-library/react` renders a component into a DOM node and
`@testing-library/dom` queries it, and jsdom is simply the DOM most people hand
it. TWD already runs inside the app in a real browser, so the real DOM is right
there and `render()` uses it.

This means TWD now covers the style of test that most teams write with Vitest or
Jest plus Testing Library: mount one component in isolation and assert on it.
Previously TWD was positioned purely as a flow-test runner, and the maintainer
said in print that component testing was the thing it did not do.

Nothing in the documentation reflects this. `docs/testing-library.md` covers
`screenDom`, `screenDomGlobal` and `userEvent` strictly as selectors for flow
tests. It never mentions `render()` or `cleanup()`. The string "jsdom" does not
appear anywhere in the docs.

Source material:

- Article 1 (published):
  https://dev.to/kevinccbsg/no-more-fake-dom-testing-library-unit-tests-in-the-real-browser-3p77
- Article 2: will not be published. The draft
  (`twd-social/articles/browser-unit-tests/your-vitest-tests-are-testing-your-mocks.md`)
  is too complex and too React-specific. It must not be linked or cited anywhere
  in the docs. Article 1 is the only reference article.
- Reference implementation: https://github.com/kevinccbsg/frontend-challenge
  (fork of `SabrinaFZ/frontend-challenge`), which tests the same `Add` component
  three ways: jsdom with mocks, jsdom hook test, and browser without mocks.

## Goals

- Document browser component testing as a first-class TWD capability with its
  own page, URL, and search surface.
- Fix the silent-failure trap that currently blocks anyone who tries this: the
  default test file pattern does not match `.tsx`.
- Update landing copy, FAQ, SEO metadata, llm ingestion files, and AI prompts so
  the capability is discoverable by humans, search engines, and coding agents.
- Keep the framing complementary rather than adversarial, consistent with TWD's
  established positioning.

## Non-goals

- Changing `DEFAULT_PATTERN` in `src/plugin/twd.ts`. See Open Questions.
- Updating the separate `twd-ai` plugin repo.
- Verifying Vue, Solid, or Angular support. See Accuracy Constraints.
- Any Core Concepts sidebar regrouping. The 14-item list is too long, but that
  is a separate IA refactor.

## Key Finding: the `.tsx` silent-skip bug

`src/plugin/twd.ts:49` sets:

```js
const DEFAULT_PATTERN = '/**/*.twd.test.ts';
```

`docs/getting-started.md:161` ("File Naming Convention") recommends:

```
- *.twd.test.ts
- *.twd.test.tsx
- *.twd.test.js
- *.twd.test.jsx
```

So the documentation recommends filenames that the default pattern cannot match.
Component tests are `.tsx`. A user who follows the current page gets no error,
no missing-file warning, and no tests in the sidebar. They just silently never
appear.

This is a documentation correctness bug that exists independently of the new
capability, and fixing it is a precondition for the new page to work at all.

The same false claim appears a second time in `getting-started.md:192`, where the
troubleshooting section tells the reader the default pattern is `.twd.test.ts` /
`.tsx`. Someone debugging missing tests is sent straight past the actual cause.

The fix in every affected place is the brace pattern:

```ts
twd({ testFilePattern: '/**/*.twd.test.{ts,tsx}' })
```

Plus, for repos that also run Vitest, excluding TWD tests from it. Vitest matches
`*.test.tsx` by default, collects the TWD files, finds no `describe` it
recognises, and fails the run with `No test suite found in file`:

```ts
test: {
  exclude: [...configDefaults.exclude, '**/*.twd.test.*'],
},
```

## Design

### 1. New page: `docs/component-testing.md`

Route: `/component-testing`. Sidebar: Core Concepts group, immediately after
"Writing Tests" and before "API Mocking". Sidebar label: "Component Testing".
H1: "Component Testing in the Real Browser".

Naming note: `/component-mocking` already exists and covers the `MockedComponent`
wrapper, which is a different thing entirely (replacing a child component with a
stub). Both pages open with a one-line disambiguation pointing at the other.

Page outline:

1. **What this is.** Render a single component in isolation, in a real browser,
   using the Testing Library API you already know. Disambiguation line pointing
   at `/component-mocking`.
2. **Why it works.** Testing Library renders into a DOM node and queries it.
   jsdom is just the DOM most people hand it. TWD hands it a real one, so
   `getBoundingClientRect` returns real numbers, portals go where portals go, and
   CSS applies.
3. **Setup.** Four steps, in this order:
   - Install the Testing Library package for your framework (the user's own
     dependency, not shipped by TWD).
   - Set `testFilePattern: '/**/*.twd.test.{ts,tsx}'`. Call out that the default
     is `.ts` only and the failure is silent.
   - Exclude TWD tests from Vitest if the repo runs both.
   - Add a blank mount route and call `cleanup()` in `beforeEach`.
4. **A first component test.** Adapted from `Add.twd.test.tsx` in the reference
   repo, trimmed to the smallest useful example.
5. **Queries: use `screen`, not `screenDom`.** See below. Highest-value section.
6. **Mocking.** `twd.mockRequest` still works and is still the right tool, since
   it replaces the network, a boundary you do not own. State the rule: mock at
   boundaries you do not own, and nowhere else.
7. **Choosing between component tests and flow tests.** Component tests when the
   component is the subject (validation states, a dialog opening and closing, a
   table sorting). Flow tests when the test crosses a boundary (routing, data
   loading, a sequence of screens, state surviving navigation).
8. **One run, one coverage report.** Both styles are files in the same project,
   running in the same browser session against the same instrumented bundle, so
   `npx twd-cli run` runs both and emits one coverage file. Nothing to merge.
9. **Other frameworks.** See Accuracy Constraints.
10. **Troubleshooting.** Duplicate elements found; tests not appearing in the
    sidebar; Vitest failing with `No test suite found in file`.

#### The two traps (must be prominent, not incidental)

**Trap 1: `screenDom` will not find your rendered component.** `render()` mounts
into a fresh `div` appended to `document.body`, which is outside the app root
that `screenDom` scopes to. Verified empirically in the source article:

```
container.parentElement=<body>   inside #root=false
screen: found   screenDom: not found   screenDomGlobal: found
```

Use Testing Library's own `screen`, or TWD's `screenDomGlobal` with specific
queries (`screenDomGlobal` can also match elements inside the TWD sidebar).

This contradicts the guidance on every other TWD page, which steers people to
`screenDom` as the default. It must be stated loudly on the new page and
cross-referenced from `testing-library.md`.

**Trap 2: `cleanup()` is required.** `render()` appends to the document and
removes nothing on its own. In jsdom the environment is torn down between files;
in a real browser it is not, so renders stack up and queries start finding two of
everything.

```tsx
beforeEach(() => {
  cleanup();
  twd.clearRequestMockRules();
});
```

**The blank mount route** exists for the same class of reason: mounting a
component on top of a page that already renders it means queries find duplicates
and Testing Library throws.

Document this as a concept first, not as a React Router snippet. The requirement
is framework-neutral: your router needs one empty route that renders nothing, and
the suite visits it once via `await twd.visit("/testing-library")` before
rendering. How you declare that route is your router's business, and it differs
between React Router, Vue Router, and everything else.

Show the React Router form as a labelled example ("React Router") rather than as
the pattern itself, so Vue and Solid readers are not led to copy JSX that does
not apply to them:

```tsx
// React Router
<Routes>
  {/* Blank mount point for Testing Library component tests. */}
  <Route path="testing-library" element={<div />} />
  <Route element={<Layout />}>
    {/* the real app */}
  </Route>
</Routes>
```

### 2. Corrections to existing pages

These are correctness fixes and stand on their own merit.

| File | Change |
|---|---|
| `getting-started.md:17` | `npm install --save-dev twd-js`, plus `yarn add --dev twd-js` and `pnpm add -D twd-js`. TWD is a dev dependency and `twd-js.md:43` already says so. |
| `getting-started.md:161` | File Naming Convention: state that the default pattern is `.ts` only, and that `.tsx`/`.jsx` require the brace pattern. Currently recommends filenames that silently match nothing. |
| `getting-started.md:192` | Troubleshooting "Tests Not Loading" currently states the default is `.twd.test.ts` / `.tsx`. That is false: the default is `.ts` only. Correct the statement and add the `.tsx` pattern as a cause. |
| `frameworks.md:46` | Next to the documented default, note that `.tsx` needs `'/**/*.twd.test.{ts,tsx}'`. |
| `testing-library.md` | New "Rendering components directly" section linking to `/component-testing`, so the `screenDom` guidance is not read as universal. |
| `writing-tests.md` | One pointer near Element Selection. |
| `component-mocking.md` | Disambiguation line at the top pointing at `/component-testing`. |
| `api/index.md:51,88` | Same `.tsx` note next to the documented default. |

### 3. Landing page (`HomePage.vue`)

**New section, placed between Quick Start and FAQ.** Not a fifth pain card:
`.pain-cards` is `grid-template-columns: repeat(4, 1fr)` at desktop
(`HomePage.vue:668`), so a fifth card orphans onto a second row. The existing
"Your mocks lie" card is also about a different problem (mock versus API drift,
which contract testing solves), not about mocking your own code away.

Section content: a two-column before/after.

- Left, jsdom: `vi.mock("../useThing")` at the top, assertion is
  `expect(mockHandleChange).toHaveBeenCalledTimes(1)`.
- Right, browser: no `vi.mock`, assertion is
  `twd.should(screen.getByPlaceholderText("Enter year"), "have.value", "2023")`.

Headline direction: "Component tests and flow tests. One run, one coverage
report." CTA links to `/component-testing`.

**FAQ change 1, rewrite the Vitest Browser Mode answer.** The current answer ends
"You test what the user sees, not a mounted component in a vacuum", which is now
precisely the thing TWD supports. The replacement keeps the real distinction (a
purpose-built harness page versus your running dev server) and adds that both
styles are available in the same session under one coverage report.

**FAQ change 2, new entry: "Do I have to drop my Vitest tests?"** Answer is no.
Pure functions, reducers, formatters and hooks in isolation are fine in jsdom and
moving them buys nothing. The tests worth moving are the ones where a `vi.mock`
of your own hook, context, or component sits between the assertion and the
behaviour, because there the test is checking your description of the code
instead of the code.

This entry carries the practical half of article 2's argument, written fresh in
plain language. Article 2 itself is not published and must not be linked. Keep
the wording concrete (which tests to move, and why) and avoid the article's more
abstract framing, which was judged too techy. Framed as guidance about which
tests to move, it reads as advice rather than as an attack on Vitest, which fits
the established positioning constraint.

### 4. SEO and llm ingestion files

- `docs/.vitepress/config.mts`: add `component-testing`, `unit-testing`,
  `jsdom`, `browser-unit-tests` to the keywords meta. Update `description` and
  `og:description`, neither of which currently mentions component or unit tests.
- `docs/public/llms.txt`: hand-curated, so it will not update itself. Add a Core
  Concepts entry for `/component-testing` and a "Key features" bullet.
- `scripts/generate-llms-full.mjs`: add `'component-testing.md'` to the `ORDER`
  array immediately after `'writing-tests.md'`. Any page missing from `ORDER` is
  appended alphabetically after the tutorial and community pages, which reads
  badly for a Core Concepts page.
- `docs/public/llms-full.txt` needs no manual edit: it is gitignored
  (`.gitignore:105`) and regenerated by `docs:build`.

### 5. AI prompts

Both live in this repo and both must stay in sync.

- `ai-guides/TWD_PROMPT.md`: a proper component-testing section covering the
  render plus cleanup pattern, the blank mount route, `screen` rather than
  `screenDom`, and the `.tsx` file pattern requirement.
- `docs/agents.md` compact prompt: roughly six lines covering the same points.
  The compact prompt already documents `*.twd.test.tsx` as a valid filename, so
  it currently carries the same silent-skip trap.

### 6. Reference links (`community.md`)

- Blog Posts section currently reads "Coming soon". Replace with article 1.
- Example Repositories table: add `kevinccbsg/frontend-challenge`, described as a
  fork of `SabrinaFZ/frontend-challenge` showing the same component tested three
  ways. Note in the row that it sits outside the BRIKEV org, unlike every other
  entry in that table.

## Accuracy Constraints

Both articles and the reference repo are React only: `@testing-library/react`,
a React context provider, `.tsx` files.

- **React is documented.** That is what is verified.
- **Vue and Solid get a short note** that the same approach should work with
  `@testing-library/vue` and `@testing-library/solid`, because Testing Library
  was never tied to jsdom, explicitly marked as not yet verified, with an
  invitation to report results.
- **No Angular claim at all.** `@testing-library/angular` requires `TestBed`,
  which is a materially different problem inside a running dev server and has not
  been tried.
- **No performance comparison** against Vitest or jsdom. No measurement exists.
- **No claim that browser component tests replace jsdom ones.** The recommended
  position is that both belong in a repo, and the choice is per test.

## Verification

- Every code sample on the new page traced to a file in `frontend-challenge`
  that actually runs, rather than written fresh for the docs.
- `npm run docs:build` passes, confirming the generator places
  `component-testing.md` in the intended slot in `llms-full.txt` and that no
  internal links are dead.
- Grep the docs for remaining `'/**/*.twd.test.ts'` occurrences to confirm each
  one is either correct in context or carries the `.tsx` note.

## Open Questions

1. **Should `DEFAULT_PATTERN` change?** Setting it to
   `'/**/*.twd.test.{ts,tsx}'` in `src/plugin/twd.ts:49` would fix the silent
   skip for everyone without anyone reading the docs. That is a library change,
   out of scope for a docs PR, and should be filed as a separate issue. Decision
   pending.
2. **Article 2: resolved, will not be published.** Do not link or cite it.
   Article 1 is the only reference article, at the URL above.
