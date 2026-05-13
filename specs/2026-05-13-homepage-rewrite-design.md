# Homepage Rewrite & Sub-Product Landings — Design

**Status:** Design ready for implementation planning
**Date:** 2026-05-13
**Branch:** `docs/homepage-rewrite`

## Context

When someone lands on TWD today they don't understand in 30 seconds **what it is, who it's for, and what problem it solves**. Three concrete failures:

1. **The ecosystem section's sub-headline ("All optional. All composable. Start with the sidebar, add what you need.")** communicates flexibility at the cost of clarity. For a first-time visitor, "all optional" reads as "we don't know where you should start."
2. **The ecosystem diagram is a clockwise circular SVG** (DEVELOP+TEST → AI → CI → CONTRACTS → SHIP). A circle implies "all or nothing"; the truth is "start with one piece, grow over time."
3. **The thesis "test what you own, mock what you don't"** sits as 10pt text inside the diagram's center circle, where it reads as decoration. It is the product's manifesto in six words and deserves manifesto-weight visual treatment.

A second, related problem: the homepage and the docs both try to speak to three audiences at once — solo developers, AI-coding users, and tech leads with backend separation. One page speaking to all three speaks to none. Each sub-product (`twd-js`, `twd-relay`, contract testing) needs its own landing so the audiences can self-identify and so each ranks independently in search.

## Goals

- **30-second clarity.** A first-time visitor on `/` understands what TWD is, who it's for, and the one decision they need to make next (which sub-product applies to them).
- **Promote the thesis.** Treat "Test what you own. Mock what you don't." as the product manifesto with display-weight visual hierarchy.
- **Replace circular framing with adoption-line framing.** Show the ecosystem as "start here → grow into this" rather than "five pieces in a circle."
- **Three audience-specific landings.** Each sub-product gets its own H1, audience, pain hook, diagram, and cross-links. They live at top-level URLs that read naturally and rank independently.
- **Backward-safe.** Existing how-to pages (`/getting-started`, `/ai-remote-testing`) and tutorial pages stay untouched. `/contract-testing` rewrites at the same URL; its current reference content moves to `/contract-testing-setup`.

## Non-goals

- Hero H1 rewrite. The current hero ("Testing isn't a phase. It's how you build.") already does the benefit-first job; only the sub-headline is tightened in this round.
- Custom Vue layout per landing. Landings use the default VitePress doc layout with inline Vue components for hero/diagram blocks.
- Per-landing OG / Twitter card images. Global image inherits initially.
- Redirects, URL renames, or destructive changes to existing how-to or tutorial pages.
- Internationalization, A/B testing, persona quizzes.
- New content for the `twd-cli` (CI) box on the diagram — it links to the existing `/ci-execution` how-to, not a new landing.

## Approach

**Surgical homepage rewrite + three new landings.** The hero stays (one sub-headline polish). The ecosystem section is replaced wholesale: new H2 + sub, thesis promoted to a display-weight band above the diagram, circular SVG replaced by a horizontal adoption-line with four progressive-state stages. Three new landing pages at top-level URLs.

Alternatives considered:

- **Full top-of-page rewrite** (rewrite hero too). Rejected because the current hero already lands benefit-first; the highest-leverage moves are the section the user explicitly criticized + the thesis promotion.
- **Audience-split homepage** (route visitors into three lanes immediately after the hero). Rejected because the homepage would become a product menu instead of a manifesto; the landings carry that audience-split job without restructuring the home.

## URL & content architecture

| Sub-product | Landing (this round) | How-to (untouched / migrated) |
|---|---|---|
| twd-js | `/twd-js` *(new)* | `/getting-started` *(untouched)* |
| twd-relay | `/twd-relay` *(new)* | `/ai-remote-testing` *(untouched)* |
| Contract testing | `/contract-testing` *(rewritten as landing)* | `/contract-testing-setup` *(existing how-to content moved here)* |

`/twd-js` and `/twd-relay` are new pages; `/getting-started` and `/ai-remote-testing` keep their slugs because they own existing inbound-link equity. `/contract-testing` is rewritten at its existing URL (preserving its SEO weight) and its reference content moves to `/contract-testing-setup`.

## File map

**New files:**

- `docs/twd-js.md` — landing
- `docs/twd-relay.md` — landing
- `docs/contract-testing-setup.md` — moved how-to content
- `docs/.vitepress/theme/components/AdoptionLineDiagram.vue` — new ecosystem SVG (used on home)
- `docs/.vitepress/theme/components/ThesisBanner.vue` — display-weight thesis band (used on home; reusable on landings)
- `docs/.vitepress/theme/components/LandingHero.vue` — reusable landing hero block
- `docs/.vitepress/theme/components/LandingCrossLinks.vue` — reusable cross-link block

**Modified files:**

- `docs/contract-testing.md` — rewritten as landing (current intro hook reused; setup/options/output sections moved out)
- `docs/.vitepress/theme/components/HomePage.vue` — ecosystem section replaced; hero sub tightened
- `docs/.vitepress/theme/index.ts` — register new components globally (if needed for inline use in `.md`)
- `docs/.vitepress/config.mts` — add top-nav dropdown + sidebar group entries

**Untouched:**

- `docs/getting-started.md`, `docs/ai-remote-testing.md`, all `docs/tutorial/**`, all `docs/api/**`, all `docs/twd-ai/**`, every other doc page.

## Section 1 — Ecosystem section rewrite

### Copy

**H2:** *One package today. The rest when you need it.*

**Sub:** *Start with the sidebar in your browser. Layer on AI, CI, and contract validation only when your team is ready for each one.*

### Thesis treatment

The line **"Test what you own. Mock what you don't."** moves out of the diagram and becomes a standalone visual band **above** the diagram.

- Full-width band inside the section, sitting between the section header (H2 + sub) and the adoption-line diagram.
- Two clauses, two lines, stacked vertically.
- Display-weight typography: ~3rem / 48px on desktop, ~1.75rem on mobile.
- Brand teal accent on the verbs ("own", "don't") to mirror existing brand color usage.
- No surrounding card / border — the band reads as a pull-quote, not a panel.
- Optional eyebrow above: "*The TWD philosophy*" in small caps. Initial implementation: omit eyebrow; rely on typographic weight alone for hierarchy.

Implemented as a `<ThesisBanner />` Vue component so the same treatment can be reused on landing pages later if desired.

### Adoption-line diagram

Replaces the existing circular SVG and its mobile-stacked fallback.

**Stages (left → right, narrative order):**

| # | Title | Package(s) | State | Conditional label |
|---|---|---|---|---|
| 1 | Sidebar | `twd-js` | Solid border, brand teal, "START HERE" badge | — (always-on foundation) |
| 2 | AI Agent | `twd-relay` + `twd-ai` | Dashed border, brand teal | "Add when you use Claude Code" |
| 3 | CI | `twd-cli` | Dashed border, brand teal | "Add when you want headless CI" |
| 4 | Contracts | `openapi-mock-validator` | Dashed border, gold accent | "Add if your team owns OpenAPI specs" |

- Stage 4 retains the existing gold accent — it's the validation/quality-gate layer, signaling a different *kind* of value than the dev/CI layers.
- Arrows between cards convey "grow into the next one"; their visual weight is subtle (existing `--vp-c-brand-1` opacity 0.45 from the current SVG).
- Each card is a clickable link:
  - Stage 1 → `/twd-js`
  - Stage 2 → `/twd-relay`
  - Stage 3 → `/ci-execution` (existing how-to; no landing for CI in this round)
  - Stage 4 → `/contract-testing`
- Each card displays an Umami event on click (see "Analytics" below).

**Mobile behavior:** linearize to a vertical stack with downward arrows, matching the existing `.pipeline-mobile` pattern. Same data, same labels.

**Implementation note:** the new SVG should use the same brand tokens (`--vp-c-brand-1`, `--pipeline-gold`, `--pipeline-card-bg`, `--pipeline-green`) so light/dark themes work without additional CSS.

### Section flow (top to bottom)

```
ECOSYSTEM SECTION
  H2:  One package today. The rest when you need it.
  Sub: Start with the sidebar in your browser. Layer on AI, CI, and
       contract validation only when your team is ready for each one.

  ─── ThesisBanner ──────────────────────────────────────────────
  
       Test what you own.
       Mock what you don't.
  
  ─────────────────────────────────────────────────────────────

  ─── AdoptionLineDiagram ──────────────────────────────────────
  
   [SIDEBAR]  →  [AI AGENT]  →  [CI]  →  [CONTRACTS]
    twd-js       twd-relay      twd-cli   openapi-mock
                 + twd-ai                 -validator
    START HERE   add when…      add when… add if…
   
  ─────────────────────────────────────────────────────────────
```

## Section 2 — Three landing pages

### Shared shape

Every landing follows the same structure:

1. **Hero** — `<LandingHero />` block: H1, sub, primary CTA button, lightweight hero visual
2. **Problem** — 1–2 paragraphs naming the specific pain
3. **How it works** — 2–3 paragraphs + a diagram or screenshot
4. **Quick start** — minimal code snippet (install + smallest config)
5. **Cross-links** — `<LandingCrossLinks />` block: links to the other two landings + the relevant how-to
6. **Final CTA** — install command callout + Get Started button

### /twd-js — the sidebar

- **H1:** *Frontend tests that run in your real browser.*
- **Sub:** *Same DOM, same routes, same state as your dev server. TWD adds a sidebar that updates as you code — so testing happens alongside building, not after it.*
- **Audience:** solo developers and small teams building React, Vue, Angular, or Solid SPAs
- **Search intent:** "in-browser testing", "frontend testing library", "react browser tests", "test in browser"
- **Problem section:** testing gets pushed to next week; testing feels like overhead because it runs in a separate environment from where you're building.
- **How-it-works visual:** the existing `twd_side_bar_success.png` screenshot, framed inside a window-chrome container (re-uses the homepage's `.code-block` chrome style).
- **Quick start snippet:** the `vite.config.ts` block from the homepage's existing Quick Start section (install `twd-js` + add `twd()` plugin). Keep in sync with the homepage snippet.
- **Cross-links:**
  - `/twd-relay` — "Adding AI to your loop? Run tests via WebSocket."
  - `/contract-testing` — "Mocking an external backend? Validate every mock."
  - `/getting-started` — "Read the full setup guide."

### /twd-relay — AI agents in the browser

- **H1:** *Token-efficient browser testing for AI agents.*
- **Sub:** *Claude Code (or any agent) triggers test runs in your live app and streams structured pass/fail results back. No Playwright, no screenshots, no token bleed — just write → run → read → fix.*
- **Audience:** developers using Claude Code, Cursor, Copilot, or Windsurf
- **Search intent:** "Claude Code testing", "AI agent testing browser", "token-efficient frontend testing", "AI browser test runner"
- **Problem section:** AI writes test files that look correct but never execute; Playwright MCP and screenshot-based approaches burn tokens on DOM dumps and visual diffs.
- **How-it-works visual:** new SVG showing `AI agent ↔ relay (WebSocket) ↔ browser (TWD)`. Reuse the structure and labels from the existing ASCII diagram in `/ai-remote-testing`, rendered as a proper SVG with the same brand token palette.
- **Quick start snippet:** the Vite plugin form from `/ai-remote-testing` (the `twdRemote()` plugin block), plus a 2-line `CLAUDE.md` agent-instruction snippet showing `npx twd-relay run`.
- **Cross-links:**
  - `/twd-js` — "Need the foundation? Start with the sidebar."
  - `/contract-testing` — "Validating mocks in CI? Add contract testing."
  - `/ai-remote-testing` — "Read the full setup, protocol, and recovery docs."

### /contract-testing — validate mocks against the spec

- **H1:** *Your mocks lie. Catch them before production does.*
- **Sub:** *TWD collects every `mockRequest` from your test suite. `twd-cli` validates them against your OpenAPI specs — so drift between your mocks and the real API surfaces in CI, not from a user.*
- **Audience:** tech leads, teams with backend separation, OpenAPI-spec-owning orgs
- **Search intent:** "mock validation", "openapi mock testing", "frontend contract testing", "validate mocks against openapi"
- **Problem section:** reuse the existing intro from `docs/contract-testing.md` ("Frontend teams write mock responses in tests that drift from reality over time. Fields get renamed, removed, or added in the API — but mocks stay frozen. Tests pass, code ships, and the app breaks in production.") — verbatim or near-verbatim. It's already pain-first.
- **How-it-works visual:** new SVG showing `test run → mock collection → spec validator → ✓ / ✗ report`. Mirror the example output table from the existing page.
- **Quick start snippet:** the `twd.config.json` block from the existing `/contract-testing` page (3 lines + a contract entry).
- **Cross-links:**
  - `/twd-js` — "Write the tests that collect mocks."
  - `/twd-relay` — "Let AI iterate on tests before you validate."
  - `/contract-testing-setup` — "Full setup, options, validations, and PR reports."

### Content migration: /contract-testing → /contract-testing-setup

The existing `/contract-testing.md` page (119 lines) splits:

- **Landing (`/contract-testing`)** keeps: the intro pain hook, plus new hero / problem / how-it-works / quick-start / cross-links / CTA. Drops the deep setup/options/validations content.
- **Setup (`/contract-testing-setup`)** receives, verbatim: Setup, Contract Options table, Example Output, Supported Validations, the strict-mode tip, PR Reports, and Next Steps. Headings preserved so any inbound anchor links from external sites still resolve when the link is updated to the new URL.

No same-URL anchor preservation — anchors that used to live on `/contract-testing#supported-validations` now live on `/contract-testing-setup#supported-validations`. This is a deliberate accepted break; we don't expect significant inbound deep-anchor traffic, and a redirect layer would add infrastructure for marginal benefit. The landing's Quick Start and Cross-Links sections link to the new URL.

## Section 3 — Navigation, hero polish, and analytics

### Navigation

**Top nav** — add a new dropdown between "AI Workflow" and "API Reference":

```
Home  |  Core Concepts  |  AI Workflow  |  Products ▾  |  API Reference
                                           ├ twd-js
                                           ├ twd-relay
                                           └ Contract Testing
```

**Sidebar** — add a new top-level group **Sub-products**, placed above "Philosophy":

```
Sub-products
  ├ twd-js
  ├ twd-relay
  └ Contract Testing
Philosophy
  ├ TWD Manifesto
  └ Why Test While Developing
Core Concepts
  ...
```

`/contract-testing-setup` is *not* added to either the top nav or the new "Sub-products" sidebar group. It's discoverable from `/contract-testing`'s cross-links and final CTA. If we later decide it deserves its own sidebar entry, it can be added under "Core Concepts" alongside the existing entries.

### Hero sub-headline polish

`HomePage.vue` — change the hero sub:

**Before:**
> Write tests while you develop, in your real browser. Let the AI agent iterate. Validate every mock against the real API before you merge.

**After:**
> Write tests in your real browser. Let AI iterate. Validate every mock before you merge.

Three short clauses in parallel structure; same coverage, less weight.

### Analytics events (Umami)

Umami is already loaded (see `config.mts` head injection of `cloud.umami.is/script.js`, website ID `3d4e6e8c-3498-4652-8a3b-f49a734004c8`).

Add `data-umami-event` attributes to the four adoption-line cards in `AdoptionLineDiagram.vue`:

| Stage | Event name |
|---|---|
| Sidebar | `home_ecosystem_sidebar` |
| AI Agent | `home_ecosystem_ai_agent` |
| CI | `home_ecosystem_ci` |
| Contracts | `home_ecosystem_contracts` |

No additional script injection. Umami auto-instruments `data-umami-event` on click. The events fire on the SVG cards (desktop) and the linearized mobile stack cards (mobile). Event names are namespaced `home_ecosystem_*` so they don't collide with future ecosystem-related analytics elsewhere.

### Per-landing SEO frontmatter

Each landing's frontmatter:

```yaml
---
title: <H1 text>
description: <one-line value prop, <= 155 chars>
head:
  - - meta
    - property: og:title
      content: <same as title>
  - - meta
    - property: og:description
      content: <same as description>
---
```

Concrete values:

- `/twd-js`:
  - title: "Frontend tests that run in your real browser — TWD"
  - description: "TWD runs your tests in your dev server with a sidebar that updates as you code. For React, Vue, Angular, and Solid."
- `/twd-relay`:
  - title: "Token-efficient browser testing for AI agents — TWD"
  - description: "Claude Code triggers tests in your live app and streams structured results back. No Playwright, no screenshots, no token bleed."
- `/contract-testing`:
  - title: "Validate every mock against your OpenAPI spec — TWD"
  - description: "TWD collects every mock from your tests; twd-cli validates them against your OpenAPI specs so drift surfaces in CI, not in production."

Global `og:image` (`twd_ecosystem.png`) is inherited. Per-landing images are a future iteration.

## Verification

### Local dev

- `npm run docs:dev` — visually confirm:
  - Homepage hero displays the tightened sub-headline.
  - Ecosystem section shows the new H2 + sub, the thesis band above the diagram, and the four-stage adoption-line.
  - Adoption-line renders correctly desktop (SVG) and mobile (vertical stack).
  - Each adoption-line card is clickable and navigates to the right destination.
  - Thesis band reads as display-weight on desktop, scales cleanly on mobile.
  - All three landings (`/twd-js`, `/twd-relay`, `/contract-testing`) render with hero, problem, how-it-works, quick-start, cross-links, and CTA.
  - `/contract-testing-setup` renders the migrated reference content correctly.
  - Top nav "Products" dropdown opens and links resolve.
  - "Sub-products" sidebar group displays in the docs sidebar with three items.
  - Dark mode and light mode both render correctly across new components and landings.

### Build

- `npm run docs:build` — must succeed with no broken-link warnings.
- Confirm `dist/` contains generated HTML for `/twd-js`, `/twd-relay`, `/contract-testing`, and `/contract-testing-setup`.

### Cross-link integrity

Each landing's cross-links resolve to:
- The other two landings
- The relevant how-to (`/getting-started`, `/ai-remote-testing`, or `/contract-testing-setup`)
- Where applicable, `/ci-execution`

Each ecosystem card on the homepage links correctly (see Section 1 table).

### Analytics smoke test

In `npm run docs:dev`, click each ecosystem card and verify the `data-umami-event` attribute is present on the underlying clickable element. Live Umami event recording is verified post-deploy.

### Regression checks

- `/getting-started`, `/ai-remote-testing`, all `/tutorial/*`, all `/api/*`, all `/twd-ai/*`, `/community`, `/motivation`, `/twd-manifesto`, `/frameworks`, `/testing-library`, `/theming`, `/coverage`, `/ci-execution`, `/api-mocking`, `/component-mocking`, `/module-mocking`, `/writing-tests`, `/agents`, `/claude-plugin`, `/ai-overview` — unchanged content, sidebar still renders correctly with the new "Sub-products" group above "Philosophy".

## Risks

- **Visual-weight calibration on the thesis band.** Too large and it overpowers the section; too small and it doesn't earn manifesto status. Plan to iterate on type size and color emphasis in implementation; provide a viewport-comparison screenshot for review.
- **Cross-link feedback loops.** Each landing links to the other two; if a visitor enters at `/contract-testing` and clicks "Need the foundation? Start with the sidebar", they land on `/twd-js` which then offers a link back. This is intended (audience self-identification can shift mid-funnel), but the cross-link blocks should be visually framed as "next steps", not "alternatives" — copy should be aspirational ("Add when you're ready for X") rather than retreat-style ("Or try Y instead").
- **Adoption-line ordering.** Choosing narrative order (sidebar → AI → CI → contracts) optimizes for the storytelling and matches how most TWD users actually adopt. Risk: someone reads the order as "AI is more important than CI", which isn't quite right. Mitigation: the conditional labels ("Add when you use Claude Code", "Add when you want headless CI") make adoption explicitly orthogonal.
- **Sidebar group placement.** Putting "Sub-products" above "Philosophy" prioritizes product self-identification over philosophical onboarding. Risk: returning visitors who used to scan for "Philosophy" first need a second to re-orient. Acceptable cost for the SEO and audience-clarity win.

## Future work

- Per-landing OG / Twitter card images.
- A landing for `twd-cli` (currently CI box links to `/ci-execution` how-to, no landing).
- A short interactive demo or video on `/twd-js` showing the sidebar in motion.
- Persona-based homepage routing (the Approach C audience-split) if landing analytics indicate visitors are routing inconsistently.
- Redirect layer if anchor-link breakage on `/contract-testing-setup` proves to matter.
- Update sitemap and `og:image` per-landing when custom images land.
