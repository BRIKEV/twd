# Homepage Rewrite & Sub-Product Landings — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the homepage ecosystem section (new H2 + sub, thesis promoted to manifesto-weight band, circular diagram replaced by an adoption-line) and add three audience-specific landing pages (`/twd-js`, `/twd-relay`, rewritten `/contract-testing`) plus a migrated `/contract-testing-setup`, with top-nav + sidebar entries and Umami analytics on the ecosystem cards.

**Architecture:** New Vue components in `docs/.vitepress/theme/components/` (ThesisBanner, AdoptionLineDiagram, LandingHero, LandingCrossLinks). The adoption-line is implemented as HTML cards in a flex row (not literal `<svg>`) so each card can be a real anchor link with hover, focus, keyboard nav, and `data-umami-event` — same visual brand tokens as the current SVG, simpler and more accessible. Three new `.md` landings use the default VitePress doc layout with the new shared components inline. Existing how-to pages (`/getting-started`, `/ai-remote-testing`) are untouched; `/contract-testing` is rewritten in place and its reference content moves verbatim to `/contract-testing-setup`.

**Tech Stack:** VitePress 1.x, Vue 3 SFCs in `docs/.vitepress/theme/`, scoped CSS using existing brand tokens (`--vp-c-brand-1`, `--pipeline-gold`, `--pipeline-green`, `--pipeline-card-bg`, `--vp-c-brand-btn`). No new dependencies.

**Reference spec:** [`specs/2026-05-13-homepage-rewrite-design.md`](./2026-05-13-homepage-rewrite-design.md)

**Branch:** `docs/homepage-rewrite`

**Commit policy:** Each task ends with one commit. The user has reviewed this plan; the listed commits are pre-authorized. Do not amend prior commits; if a pre-commit hook fails, fix the issue and create a new commit.

---

## File map

**Create:**
- `docs/.vitepress/theme/components/ThesisBanner.vue` — display-weight two-clause banner
- `docs/.vitepress/theme/components/AdoptionLineDiagram.vue` — four-stage horizontal HTML cards + arrows; mobile linearizes vertically
- `docs/.vitepress/theme/components/LandingHero.vue` — reusable hero block for landings (H1, sub, CTA, visual slot)
- `docs/.vitepress/theme/components/LandingCrossLinks.vue` — reusable "Where to next" cross-link block
- `docs/twd-js.md` — landing
- `docs/twd-relay.md` — landing
- `docs/contract-testing-setup.md` — migrated reference (Setup, Contract Options, Example Output, Supported Validations, PR Reports, Next Steps)

**Modify:**
- `docs/.vitepress/theme/components/HomePage.vue` — replace ecosystem section; tighten hero sub
- `docs/.vitepress/theme/index.ts` — register the four new components globally so `.md` landings can use them
- `docs/contract-testing.md` — rewrite in place as a landing
- `docs/.vitepress/config.mts` — add top-nav "Products" dropdown and "Sub-products" sidebar group

**Untouched:** all other `docs/**` pages, all `src/**`, every example app.

---

## Task 1: Branch setup and commit the spec

**Files:** none modified (branch + commit only)

- [ ] **Step 1: Stash unrelated working-tree changes on `main`**

There are pre-existing modifications to `docs/ai-remote-testing.md` and `docs/claude-plugin.md` on `main` that are unrelated to this work. Set them aside so they don't tag along onto the docs branch.

Run:
```bash
git stash push -m "pre-homepage-rewrite local edits" -- docs/ai-remote-testing.md docs/claude-plugin.md
```

Expected: `Saved working directory and index state On main: pre-homepage-rewrite local edits`.

If those files have already been committed by the time this plan runs, skip this step.

- [ ] **Step 2: Verify clean tree (except for the spec)**

Run:
```bash
git status --short
```

Expected output (the new design + plan files are untracked; nothing else should be modified):
```
?? specs/2026-05-13-homepage-rewrite-design.md
?? specs/2026-05-13-homepage-rewrite-plan.md
```

(`?? .serena/` may also appear — it's a tooling cache. Leave it untracked.)

- [ ] **Step 3: Create the branch**

Run:
```bash
git checkout -b docs/homepage-rewrite
```

Expected: `Switched to a new branch 'docs/homepage-rewrite'`.

- [ ] **Step 4: Stage and commit the spec + plan**

Run:
```bash
git add specs/2026-05-13-homepage-rewrite-design.md specs/2026-05-13-homepage-rewrite-plan.md
git commit -m "docs(spec): homepage rewrite + sub-product landings design and plan"
```

Expected: one commit listing both files.

---

## Task 2: ThesisBanner component

**Files:**
- Create: `docs/.vitepress/theme/components/ThesisBanner.vue`

- [ ] **Step 1: Create the component**

Create `docs/.vitepress/theme/components/ThesisBanner.vue` with this exact content:

```vue
<script setup>
defineProps({
  size: { type: String, default: 'lg' }, // 'lg' (homepage) | 'md' (landings)
});
</script>

<template>
  <div class="thesis-banner" :class="`thesis-banner--${size}`" aria-label="The TWD philosophy">
    <p class="thesis-line">
      <span class="thesis-text">Test what you </span><span class="thesis-accent">own</span><span class="thesis-text">.</span>
    </p>
    <p class="thesis-line">
      <span class="thesis-text">Mock what you </span><span class="thesis-accent">don't</span><span class="thesis-text">.</span>
    </p>
  </div>
</template>

<style scoped>
.thesis-banner {
  text-align: center;
  padding: 64px 16px;
  margin: 0 auto;
  max-width: 880px;
}

.thesis-line {
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0;
}

.thesis-line + .thesis-line {
  margin-top: 8px;
}

.thesis-text {
  color: var(--vp-c-text-1);
}

.thesis-accent {
  color: var(--vp-c-brand-1);
}

/* Size variants */
.thesis-banner--lg .thesis-line {
  font-size: 3rem;
}

.thesis-banner--md .thesis-line {
  font-size: 2rem;
}

@media (max-width: 768px) {
  .thesis-banner--lg {
    padding: 40px 16px;
  }
  .thesis-banner--lg .thesis-line {
    font-size: 1.75rem;
  }
  .thesis-banner--md .thesis-line {
    font-size: 1.375rem;
  }
}
</style>
```

- [ ] **Step 2: Visual verification**

Run:
```bash
npm run docs:dev
```

Temporarily import and render at the top of `docs/.vitepress/theme/components/HomePage.vue`'s template (place inside `<main>` above the `<section class="hero">`):

```vue
<script setup>
// ... existing imports
import ThesisBanner from './ThesisBanner.vue'
</script>

<template>
  <!-- ... -->
  <main>
    <ThesisBanner size="lg" />
    <!-- existing sections -->
  </main>
</template>
```

Open `http://localhost:5173/` in a browser. Expected:
- Two stacked lines: "Test what you **own**." / "Mock what you **don't**."
- Brand teal (`#…` from `--vp-c-brand-1`) accents on "own" and "don't"
- ~3rem type on desktop, ~1.75rem on mobile (resize the window to verify)
- Centered, no border, no card frame

Toggle dark mode (top-right icon) and verify both themes render legibly.

- [ ] **Step 3: Revert the temporary import**

Remove the temporary import and `<ThesisBanner />` usage from `HomePage.vue`. The component will be integrated properly in Task 4. After reverting, `HomePage.vue` is unchanged from its pre-Task-2 state.

Run:
```bash
git diff docs/.vitepress/theme/components/HomePage.vue
```

Expected: empty diff.

- [ ] **Step 4: Commit**

```bash
git add docs/.vitepress/theme/components/ThesisBanner.vue
git commit -m "feat(docs): add ThesisBanner component for the TWD philosophy quote"
```

---

## Task 3: AdoptionLineDiagram component

**Files:**
- Create: `docs/.vitepress/theme/components/AdoptionLineDiagram.vue`

- [ ] **Step 1: Create the component**

Create `docs/.vitepress/theme/components/AdoptionLineDiagram.vue` with this exact content:

```vue
<script setup>
const stages = [
  {
    state: 'start',
    eyebrow: 'SIDEBAR',
    package: 'twd-js',
    description: 'Sidebar in your browser, updates as you code.',
    badge: 'START HERE',
    href: '/twd-js',
    umamiEvent: 'home_ecosystem_sidebar',
  },
  {
    state: 'optional',
    eyebrow: 'AI AGENT',
    package: 'twd-relay + twd-ai',
    description: 'Add when you use Claude Code.',
    badge: 'optional',
    href: '/twd-relay',
    umamiEvent: 'home_ecosystem_ai_agent',
  },
  {
    state: 'optional',
    eyebrow: 'CI',
    package: 'twd-cli',
    description: 'Add when you want headless CI.',
    badge: 'optional',
    href: '/ci-execution',
    umamiEvent: 'home_ecosystem_ci',
  },
  {
    state: 'optional-gold',
    eyebrow: 'CONTRACTS',
    package: 'openapi-mock-validator',
    description: 'Add if your team owns OpenAPI specs.',
    badge: 'optional',
    href: '/contract-testing',
    umamiEvent: 'home_ecosystem_contracts',
  },
];
</script>

<template>
  <ol class="adopt-line" aria-label="TWD adoption path">
    <template v-for="(stage, i) in stages" :key="stage.eyebrow">
      <li class="adopt-stage-wrap">
        <a
          :href="stage.href"
          class="adopt-stage"
          :class="`adopt-stage--${stage.state}`"
          :data-umami-event="stage.umamiEvent"
        >
          <span class="adopt-badge" :class="`adopt-badge--${stage.state}`">{{ stage.badge }}</span>
          <span class="adopt-eyebrow">{{ stage.eyebrow }}</span>
          <span class="adopt-pkg">{{ stage.package }}</span>
          <span class="adopt-desc">{{ stage.description }}</span>
        </a>
      </li>
      <li v-if="i < stages.length - 1" class="adopt-arrow" aria-hidden="true"></li>
    </template>
  </ol>
</template>

<style scoped>
.adopt-line {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.adopt-stage-wrap {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
}

.adopt-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 24px 20px 22px;
  border-radius: 10px;
  background: var(--pipeline-card-bg, var(--vp-c-bg-soft));
  text-decoration: none;
  color: inherit;
  width: 100%;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.adopt-stage--start {
  border: 2px solid var(--vp-c-brand-1);
}

.adopt-stage--optional {
  border: 1.5px dashed var(--vp-c-brand-1);
}

.adopt-stage--optional-gold {
  border: 1.5px dashed var(--pipeline-gold);
}

.adopt-stage:hover,
.adopt-stage:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.25);
  outline: none;
}

.adopt-stage--start:hover,
.adopt-stage--start:focus-visible {
  border-color: var(--vp-c-brand-1);
}

.adopt-badge {
  position: absolute;
  top: -10px;
  left: 16px;
  padding: 2px 12px;
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  background: var(--vp-c-bg);
}

.adopt-badge--start {
  background: var(--vp-c-brand-btn);
  color: #fff;
}

.adopt-badge--optional {
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  opacity: 0.85;
}

.adopt-badge--optional-gold {
  border: 1px solid var(--pipeline-gold);
  color: var(--pipeline-gold);
  opacity: 0.85;
}

.adopt-eyebrow {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--vp-c-brand-1);
  margin-top: 4px;
}

.adopt-stage--optional-gold .adopt-eyebrow {
  color: var(--pipeline-gold);
}

.adopt-pkg {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.adopt-desc {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}

/* Arrow between cards (desktop only) */
.adopt-arrow {
  flex: 0 0 24px;
  align-self: center;
  height: 2px;
  background: var(--vp-c-brand-1);
  opacity: 0.4;
  position: relative;
}

.adopt-arrow::after {
  content: '';
  position: absolute;
  right: -5px;
  top: -4px;
  border-left: 6px solid var(--vp-c-brand-1);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  opacity: 1;
}

/* Mobile: linearize vertical */
@media (max-width: 900px) {
  .adopt-line {
    flex-direction: column;
    gap: 0;
  }
  .adopt-stage-wrap {
    width: 100%;
  }
  .adopt-arrow {
    width: 2px;
    height: 24px;
    margin: 0 auto;
    background: var(--vp-c-brand-1);
  }
  .adopt-arrow::after {
    right: auto;
    top: auto;
    left: -3px;
    bottom: -5px;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 6px solid var(--vp-c-brand-1);
    border-bottom: none;
  }
}
</style>
```

- [ ] **Step 2: Visual verification**

With `npm run docs:dev` running (start it if it's stopped), temporarily import and render the component in `HomePage.vue`:

```vue
<script setup>
import AdoptionLineDiagram from './AdoptionLineDiagram.vue'
</script>

<template>
  <main>
    <AdoptionLineDiagram />
    <!-- existing sections -->
  </main>
</template>
```

Visit `http://localhost:5173/`. Expected:
- Desktop (≥901px): four horizontal cards with brand-teal arrows between them. Stage 1 has solid border + filled "START HERE" badge; Stages 2-3 have dashed teal borders + outlined "optional" badges; Stage 4 has dashed gold border + gold "optional" badge.
- Mobile (≤900px): vertical stack of four cards with downward arrows between them.
- Hover over each card: card lifts 2px, faint shadow appears.
- Tab through with the keyboard: focus ring visible (via `:focus-visible`).
- Click each card: navigates to its `href` (Stage 4 → `/contract-testing` will currently render the old page until Task 9; that's expected).
- Inspect element on any card: confirm `data-umami-event="home_ecosystem_*"` attribute is present.

- [ ] **Step 3: Revert the temporary import**

Remove the temporary import and `<AdoptionLineDiagram />` from `HomePage.vue`. Verify with `git diff docs/.vitepress/theme/components/HomePage.vue` (empty diff).

- [ ] **Step 4: Commit**

```bash
git add docs/.vitepress/theme/components/AdoptionLineDiagram.vue
git commit -m "feat(docs): add AdoptionLineDiagram component for the homepage ecosystem"
```

---

## Task 4: Replace ecosystem section in HomePage + tighten hero sub

**Files:**
- Modify: `docs/.vitepress/theme/components/HomePage.vue`

- [ ] **Step 1: Import the two new components**

In the `<script setup>` block at the top of `HomePage.vue`, after the existing imports, add:

```vue
import ThesisBanner from './ThesisBanner.vue'
import AdoptionLineDiagram from './AdoptionLineDiagram.vue'
```

- [ ] **Step 2: Tighten the hero sub-headline**

In `HomePage.vue`, locate the `<p class="hero-sub">` element (currently around line 66-69). Replace its content from:

```html
<p class="hero-sub">
  Write tests while you develop, in your real browser.
  Let the AI agent iterate. Validate every mock against the real API before you merge.
</p>
```

To:

```html
<p class="hero-sub">
  Write tests in your real browser. Let AI iterate. Validate every mock before you merge.
</p>
```

- [ ] **Step 3: Replace the entire ecosystem section**

Locate the `<!-- Section 3: Ecosystem Pipeline -->` comment in `HomePage.vue` and the `<section class="pipeline">…</section>` block that follows it (currently lines 128-239 approximately — bounded by the comment and the next `<!-- Section 4: Quick Start -->` comment).

Replace the entire section with this exact block:

```vue
      <!-- Section 3: Ecosystem (adoption-line) -->
      <section class="ecosystem">
        <h2 class="section-title">One package today. The rest when you need it.</h2>
        <p class="section-sub">
          Start with the sidebar in your browser. Layer on AI, CI, and contract validation
          only when your team is ready for each one.
        </p>

        <ThesisBanner size="lg" />

        <div class="ecosystem-diagram">
          <AdoptionLineDiagram />
        </div>
      </section>
```

- [ ] **Step 4: Replace the section CSS**

Remove the existing pipeline CSS block from the `<style scoped>` section. Find the comment `/* ============================================
   Pipeline
   ============================================ */` and delete everything from that comment down to the next section comment (`/* ============================================
   Quick Start
   ============================================ */`).

In its place, insert:

```css
/* ============================================
   Ecosystem
   ============================================ */
.ecosystem {
  padding-bottom: var(--hp-section-gap);
}

.ecosystem-diagram {
  margin-top: 8px;
}
```

This is intentionally minimal — the AdoptionLineDiagram component and ThesisBanner component own their own styling.

- [ ] **Step 5: Visual verification**

With `npm run docs:dev` running, visit `http://localhost:5173/`. Expected:
- Hero shows the tightened three-clause sub.
- The "Pain Points" section is unchanged.
- The new "Ecosystem" section displays:
  - H2: "One package today. The rest when you need it."
  - Sub: "Start with the sidebar in your browser. Layer on AI, CI, and contract validation only when your team is ready for each one."
  - ThesisBanner with the two-line philosophy below the sub
  - The four-stage adoption-line diagram below the banner
- "Quick Start" section follows next and is unchanged.
- Resize to mobile width (≤900px): the adoption-line linearizes vertically.
- Toggle dark mode: all elements render correctly in both themes.
- No console errors.

- [ ] **Step 6: Build verification**

Stop the dev server (Ctrl+C) and run:

```bash
npm run docs:build
```

Expected: build succeeds with no warnings about dead links or missing components. The `/twd-js`, `/twd-relay` links in the diagram currently point to pages that don't exist yet — VitePress will emit "Found dead link" warnings for these. **This is acceptable** until Tasks 7-9 create them. If VitePress treats the warnings as errors and fails the build, temporarily ignore them via the build's exit code; otherwise note the warnings and continue.

If the build fails with errors unrelated to the not-yet-created landing pages, fix them before committing.

- [ ] **Step 7: Commit**

```bash
git add docs/.vitepress/theme/components/HomePage.vue
git commit -m "feat(docs): rewrite homepage ecosystem section with thesis banner and adoption line"
```

---

## Task 5: Migrate contract-testing reference to /contract-testing-setup

**Files:**
- Create: `docs/contract-testing-setup.md`

This task only **moves** existing content; it does not rewrite `/contract-testing` yet (that happens in Task 10).

- [ ] **Step 1: Create the new setup page**

Create `docs/contract-testing-setup.md` with this exact content:

````markdown
---
title: Contract Testing Setup
description: Setup, options, validations, and PR reports for TWD contract testing.
---

# Contract Testing Setup

This page covers the reference details for configuring contract testing in TWD. For the overview, audience, and pitch, see [/contract-testing](/contract-testing).

## Setup

### 1. Add your OpenAPI specs

Place your OpenAPI 3.0 or 3.1 spec files (JSON format) somewhere in your project:

```
contracts/
  users-3.0.json
  posts-3.1.json
```

### 2. Configure contracts in `twd.config.json`

```json
{
  "url": "http://localhost:5173",
  "contractReportPath": ".twd/contract-report.md",
  "contracts": [
    {
      "source": "./contracts/users-3.0.json",
      "baseUrl": "/api",
      "mode": "error",
      "strict": true
    },
    {
      "source": "./contracts/posts-3.1.json",
      "baseUrl": "/api",
      "mode": "warn",
      "strict": true
    }
  ]
}
```

### Contract Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `source` | string | — | Path to the OpenAPI spec file (JSON) |
| `baseUrl` | string | `"/"` | Base URL prefix to strip when matching mock URLs to spec paths |
| `mode` | `"error"` \| `"warn"` | `"warn"` | `"error"` fails the test run; `"warn"` reports but doesn't fail |
| `strict` | boolean | `true` | When true, rejects unexpected properties not defined in the spec |

## Example Output

When a mock response doesn't match the spec, you'll see detailed errors:

```
Source: ./contracts/users-3.0.json   ERROR

  ✓ GET /users (200) — mock "getUsers"
  ✗ GET /users/{userId} (200) — mock "getUserBadAddress"
    → response.address.city: missing required property
    → response.address.country: missing required property

  ⚠ GET /users/{userId} (404) — mock "getUserNotFound"
    Status 404 not documented for GET /users/{userId}
```

- **✓** Mock matches the spec
- **✗** Mock has validation errors (fields that fail against the spec)
- **⚠** Warning — the status code or schema isn't documented (mock isn't wrong, but it's not contract-tested either)

## Supported Validations

The validator checks all standard OpenAPI/JSON Schema constraints:

- **Types**: `string`, `number`, `integer`, `boolean`, `array`, `object`
- **String**: `minLength`, `maxLength`, `pattern`, `format` (date, date-time, email, uuid, uri, hostname, ipv4, ipv6)
- **Number/Integer**: `minimum`, `maximum`, `exclusiveMinimum`, `exclusiveMaximum`, `multipleOf`
- **Array**: `minItems`, `maxItems`, `uniqueItems`
- **Object**: `required`, `additionalProperties`
- **Composition**: `oneOf`, `anyOf`, `allOf`
- **Enum**: validates against allowed values
- **Nullable**: supports both OpenAPI 3.0 (`nullable: true`) and 3.1 (`type: ["string", "null"]`)

::: tip Strict mode and allOf
Strict mode (`additionalProperties: false`) can conflict with `allOf` schemas. When `allOf` branches define different properties, each branch rejects the other's properties as "additional." Use `{ strict: false }` for endpoints that use `allOf` composition, or define `additionalProperties` explicitly in your spec.
:::

## PR Reports

When `contractReportPath` is set and you use the [GitHub Action](/ci-execution#github-action-recommended) with `contract-report: 'true'`, a summary table is posted as a PR comment:

| Spec | Passed | Failed | Warnings | Mode |
|------|--------|--------|----------|------|
| `users-3.0.json` | 2 | 3 | 1 | `error` |
| `posts-3.1.json` | 2 | 2 | 0 | `warn` |

Failed validations are included in a collapsible details section with a link to the full CI log.

```yaml
- name: Run TWD tests
  uses: BRIKEV/twd-cli/.github/actions/run@main
  with:
    contract-report: 'true'
```

See [CI Execution](/ci-execution#github-action-recommended) for the full workflow setup.

## Next Steps

- Run contract tests in CI with the [GitHub Action](/ci-execution#github-action-recommended)
- Learn how to create mocks with [API Mocking](/api-mocking)
- Collect [Code Coverage](/coverage) alongside contract validation
````

- [ ] **Step 2: Verify the page renders**

With `npm run docs:dev` running, visit `http://localhost:5173/contract-testing-setup`. Expected:
- Page renders with the title "Contract Testing Setup"
- All headings, tables, code blocks, and tip callout render correctly
- The link back to `/contract-testing` is present and resolves (currently to the old contract-testing page, which is fine — it gets rewritten in Task 10)

- [ ] **Step 3: Commit**

```bash
git add docs/contract-testing-setup.md
git commit -m "docs: extract contract-testing reference to /contract-testing-setup"
```

---

## Task 6: LandingHero and LandingCrossLinks components

**Files:**
- Create: `docs/.vitepress/theme/components/LandingHero.vue`
- Create: `docs/.vitepress/theme/components/LandingCrossLinks.vue`
- Modify: `docs/.vitepress/theme/index.ts` (register the four new components globally so `.md` files can use them without per-file imports)

- [ ] **Step 1: Create `LandingHero.vue`**

Create `docs/.vitepress/theme/components/LandingHero.vue`:

```vue
<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  ctaLabel: { type: String, default: 'Get Started' },
  ctaHref: { type: String, default: '/getting-started' },
  imageSrc: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
});
</script>

<template>
  <section class="landing-hero">
    <div class="landing-hero__content">
      <p v-if="eyebrow" class="landing-hero__eyebrow">{{ eyebrow }}</p>
      <h1 class="landing-hero__title">{{ title }}</h1>
      <p class="landing-hero__sub">{{ subtitle }}</p>
      <a :href="ctaHref" class="landing-hero__cta">{{ ctaLabel }} →</a>
    </div>
    <div v-if="imageSrc" class="landing-hero__visual">
      <img :src="imageSrc" :alt="imageAlt" loading="lazy" />
    </div>
  </section>
</template>

<style scoped>
.landing-hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 40px;
  align-items: center;
  padding: 32px 0 48px;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 40px;
}

.landing-hero__eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  padding: 4px 14px;
  border: 1px solid var(--vp-c-brand-soft);
  border-radius: 999px;
  margin-bottom: 16px;
}

.landing-hero__title {
  font-size: 2.5rem;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--vp-c-text-1);
  margin: 0 0 16px;
}

.landing-hero__sub {
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
  margin: 0 0 24px;
}

.landing-hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  background: var(--vp-c-brand-btn);
  color: #fff;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.landing-hero__cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.landing-hero__visual img {
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--vp-c-border);
  box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.2);
}

@media (max-width: 900px) {
  .landing-hero {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .landing-hero__title {
    font-size: 1.875rem;
  }
}
</style>
```

- [ ] **Step 2: Create `LandingCrossLinks.vue`**

Create `docs/.vitepress/theme/components/LandingCrossLinks.vue`:

```vue
<script setup>
defineProps({
  heading: { type: String, default: 'Where to next' },
  links: {
    type: Array,
    required: true,
    // [{ href, title, blurb }]
  },
});
</script>

<template>
  <section class="landing-xlinks" aria-labelledby="landing-xlinks-heading">
    <h2 id="landing-xlinks-heading" class="landing-xlinks__heading">{{ heading }}</h2>
    <ul class="landing-xlinks__list">
      <li v-for="link in links" :key="link.href" class="landing-xlinks__item">
        <a :href="link.href" class="landing-xlinks__link">
          <span class="landing-xlinks__title">{{ link.title }} →</span>
          <span class="landing-xlinks__blurb">{{ link.blurb }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.landing-xlinks {
  margin-top: 56px;
  padding-top: 40px;
  border-top: 1px solid var(--vp-c-divider);
}

.landing-xlinks__heading {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 24px;
  letter-spacing: -0.01em;
}

.landing-xlinks__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.landing-xlinks__item {
  margin: 0;
}

.landing-xlinks__link {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 22px;
  border: 1px solid var(--vp-c-border);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.landing-xlinks__link:hover,
.landing-xlinks__link:focus-visible {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-1px);
  outline: none;
}

.landing-xlinks__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.landing-xlinks__blurb {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--vp-c-text-3);
}
</style>
```

- [ ] **Step 3: Register all four new components globally**

Open `docs/.vitepress/theme/index.ts` and read its current contents.

The file currently registers `HomePage` globally. Add the four new component registrations alongside it.

Replace the file's `enhanceApp` block (or add to it if it already exists) so it imports and globally registers `ThesisBanner`, `AdoptionLineDiagram`, `LandingHero`, `LandingCrossLinks`. The exact replacement depends on the existing structure — read the file first and add these imports + `app.component(...)` calls. Example shape after the change:

```ts
import DefaultTheme from 'vitepress/theme'
import HomePage from './components/HomePage.vue'
import ThesisBanner from './components/ThesisBanner.vue'
import AdoptionLineDiagram from './components/AdoptionLineDiagram.vue'
import LandingHero from './components/LandingHero.vue'
import LandingCrossLinks from './components/LandingCrossLinks.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('ThesisBanner', ThesisBanner)
    app.component('AdoptionLineDiagram', AdoptionLineDiagram)
    app.component('LandingHero', LandingHero)
    app.component('LandingCrossLinks', LandingCrossLinks)
  },
}
```

If `index.ts` already differs from this shape (e.g., uses a different `extends` source or different imports), preserve the existing structure and only add the four new imports and `app.component(...)` registrations.

- [ ] **Step 4: Visual verification**

With `npm run docs:dev` running, the components don't render anywhere yet (Tasks 7-10 use them). Verify there are no console errors and the homepage still loads.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme/components/LandingHero.vue docs/.vitepress/theme/components/LandingCrossLinks.vue docs/.vitepress/theme/index.ts
git commit -m "feat(docs): add LandingHero and LandingCrossLinks components; register globally"
```

---

## Task 7: /twd-js landing

**Files:**
- Create: `docs/twd-js.md`

- [ ] **Step 1: Create the landing**

Create `docs/twd-js.md` with this exact content:

````markdown
---
title: Frontend tests that run in your real browser — TWD
description: TWD runs your tests in your dev server with a sidebar that updates as you code. For React, Vue, Angular, and Solid.
head:
  - - meta
    - property: og:title
      content: Frontend tests that run in your real browser — TWD
  - - meta
    - property: og:description
      content: TWD runs your tests in your dev server with a sidebar that updates as you code. For React, Vue, Angular, and Solid.
---

<LandingHero
  eyebrow="twd-js · the core"
  title="Frontend tests that run in your real browser."
  subtitle="Same DOM, same routes, same state as your dev server. TWD adds a sidebar that updates as you code — so testing happens alongside building, not after it."
  cta-label="Get Started"
  cta-href="/getting-started"
  image-src="/images/twd_side_bar_success.png"
  image-alt="TWD sidebar showing passing tests in the browser"
/>

## The problem

Testing gets pushed to next week. Next week never comes.

The reason isn't that you don't care — it's that testing usually runs in a different environment from where you're building. You write a feature, check it works in the browser, then context-switch to a different tool to "add tests." Suddenly what felt complete feels like overhead.

twd-js fixes this by putting the tests where the feature lives: in your real browser, in your real dev server, with a sidebar that updates as you code.

## How it works

You install `twd-js`, add the Vite plugin, and write tests next to your code in `*.twd.test.ts` files. When you run `npm run dev`, the TWD sidebar appears in your browser. Click play to run any test. Tests use the same DOM, routes, and state your users will — there's no separate test environment to keep in sync.

Selectors come from Testing Library (`screenDom.getByRole`, `getByLabelText`, …); assertions are chainable (`twd.should(el, 'be.visible')`). Mocking is built in: `twd.mockRequest(...)` intercepts fetch/XHR via Mock Service Worker so you can develop and test features without a running backend.

Nothing TWD ships to production — every `twd-js` import is dev-only (`import.meta.env.DEV`-guarded), so your prod bundle is untouched.

## Quick start

```bash
npm install --save-dev twd-js
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { twd } from 'twd-js/vite-plugin'

export default defineConfig({
  plugins: [twd({ open: true })],
})
```

```ts
// src/App.twd.test.ts
import { twd, screenDom } from 'twd-js'
import { describe, it } from 'twd-js/runner'

describe('App', () => {
  it('shows the heading', async () => {
    await twd.visit('/')
    const heading = screenDom.getByRole('heading', { level: 1 })
    twd.should(heading, 'be.visible')
  })
})
```

Run `npm run dev` and open the app. The sidebar appears in your browser; click play to run the test.

<LandingCrossLinks
  :links='[
    { href: "/twd-relay", title: "Add an AI agent to the loop", blurb: "Let Claude Code run tests in your real browser and stream structured results back." },
    { href: "/contract-testing", title: "Validate every mock", blurb: "Catch mock-vs-API drift in CI before it reaches production." },
    { href: "/getting-started", title: "Read the full setup guide", blurb: "Complete twd-js installation, configuration, and patterns reference." }
  ]'
/>

## Get started

```bash
npm install --save-dev twd-js
```

[Read the setup guide →](/getting-started)
````

- [ ] **Step 2: Visual verification**

With `npm run docs:dev` running, visit `http://localhost:5173/twd-js`. Expected:
- `<LandingHero />` renders with eyebrow, H1, sub, CTA button, and the sidebar screenshot to the right
- Markdown sections "The problem", "How it works", "Quick start" render normally
- Code blocks are syntax-highlighted
- `<LandingCrossLinks />` renders three cards in a responsive grid
- Final install code + Get Started link at the bottom
- Mobile (≤900px): hero stacks vertically, cross-link grid collapses to single column

- [ ] **Step 3: Commit**

```bash
git add docs/twd-js.md
git commit -m "docs: add /twd-js landing page"
```

---

## Task 8: /twd-relay landing

**Files:**
- Create: `docs/twd-relay.md`

- [ ] **Step 1: Create the landing**

Create `docs/twd-relay.md` with this exact content:

````markdown
---
title: Token-efficient browser testing for AI agents — TWD
description: Claude Code triggers tests in your live app and streams structured results back. No Playwright, no screenshots, no token bleed.
head:
  - - meta
    - property: og:title
      content: Token-efficient browser testing for AI agents — TWD
  - - meta
    - property: og:description
      content: Claude Code triggers tests in your live app and streams structured results back. No Playwright, no screenshots, no token bleed.
---

<LandingHero
  eyebrow="twd-relay · for AI agents"
  title="Token-efficient browser testing for AI agents."
  subtitle="Claude Code (or any agent) triggers test runs in your live app and streams structured pass/fail results back. No Playwright, no screenshots, no token bleed — just write → run → read → fix."
  cta-label="Read the setup guide"
  cta-href="/ai-remote-testing"
/>

## The problem

AI agents write test files that look correct, then never execute them in a real browser. No one notices until production does.

The other half of the problem: when agents *do* try to run browser tests, they usually reach for Playwright or Puppeteer MCP — tools that talk back in screenshots and DOM dumps. Those payloads are huge. A single test run can burn thousands of tokens on visual diffs the agent can't really reason about.

twd-relay fixes both halves. It runs in the dev server you already have open, and it streams structured pass/fail events back over a WebSocket — text, not pixels.

## How it works

`twd-relay` is a WebSocket server that routes messages between your **browser** (where TWD is loaded) and an **external client** (an AI agent, a script, or the bundled `twd-relay run` CLI).

```
┌───────────────┐     WebSocket      ┌──────────────────┐                ┌───────────────────┐
│  AI Agent     │◄──────────────────►│  Relay Server    │◄──────────────►│  Browser (TWD)    │
│  (Claude Code,│   /__twd/ws        │  (Vite plugin or │                │  Test runner +    │
│   script)     │                    │   standalone)    │                │  sidebar UI       │
└───────────────┘                    └──────────────────┘                └───────────────────┘
```

The agent sends `{ type: "run", scope: "all" }`; the relay forwards it to the browser; TWD runs the tests; per-test events stream back; the relay closes with `run:complete`. The agent reads pass/fail/skip counts, opens failing test names, fixes the code, and runs again — a tight write/run/read/fix loop with no browser automation runtime, no screenshots, and a tiny token footprint per iteration.

## Quick start

```bash
npm install --save-dev twd-relay
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { twd } from 'twd-js/vite-plugin'
import { twdRemote } from 'twd-relay/vite'

export default defineConfig({
  plugins: [
    twd(),          // sidebar + test discovery
    twdRemote(),    // relay endpoint + auto-injected browser client
  ],
})
```

Add a line to your agent's instructions file (e.g. `CLAUDE.md`):

```text
To run TWD tests: npx twd-relay run
Exit code 0 means all tests passed; 1 means failures or errors.
```

That's it. Start `npm run dev`, leave the tab open, and your agent can drive tests on demand.

<LandingCrossLinks
  :links='[
    { href: "/twd-js", title: "Start with the sidebar", blurb: "Get the core in-browser testing experience before plugging in AI." },
    { href: "/contract-testing", title: "Validate mocks in CI", blurb: "Once your tests are stable, gate every mock against the real OpenAPI spec." },
    { href: "/ai-remote-testing", title: "Full protocol and recovery docs", blurb: "Heartbeats, throttle-abort, RUN_IN_PROGRESS recovery, and the message protocol." }
  ]'
/>

## Get started

```bash
npm install --save-dev twd-relay
```

[Read the AI Remote Testing guide →](/ai-remote-testing)
````

- [ ] **Step 2: Visual verification**

With `npm run docs:dev` running, visit `http://localhost:5173/twd-relay`. Expected:
- `<LandingHero />` renders without a hero image (right column collapses gracefully — confirm there's no broken-image icon)
- The ASCII diagram in "How it works" renders inside a `<pre><code>` block
- Cross-links and final CTA render
- No console errors

If the missing hero image leaves an awkward empty column on desktop, adjust `LandingHero.vue` to handle the no-image case (e.g., expand the content column when `imageSrc` is empty). If so, also update Task 6's component spec retroactively in the codebase — but **do not** rewrite this plan file.

- [ ] **Step 3: Commit**

```bash
git add docs/twd-relay.md
git commit -m "docs: add /twd-relay landing page"
```

If `LandingHero.vue` was adjusted in step 2, include it in the commit and update the message:
```bash
git add docs/twd-relay.md docs/.vitepress/theme/components/LandingHero.vue
git commit -m "docs: add /twd-relay landing page; handle no-image hero"
```

---

## Task 9: Rewrite /contract-testing as the landing

**Files:**
- Modify (full rewrite): `docs/contract-testing.md`

- [ ] **Step 1: Replace the entire file**

Open `docs/contract-testing.md` and replace its entire content with:

````markdown
---
title: Validate every mock against your OpenAPI spec — TWD
description: TWD collects every mock from your tests; twd-cli validates them against your OpenAPI specs so drift surfaces in CI, not in production.
head:
  - - meta
    - property: og:title
      content: Validate every mock against your OpenAPI spec — TWD
  - - meta
    - property: og:description
      content: TWD collects every mock from your tests; twd-cli validates them against your OpenAPI specs so drift surfaces in CI, not in production.
---

<LandingHero
  eyebrow="contract testing · for teams with backend separation"
  title="Your mocks lie. Catch them before production does."
  subtitle="TWD collects every mockRequest from your test suite. twd-cli validates them against your OpenAPI specs — so drift between your mocks and the real API surfaces in CI, not from a user."
  cta-label="Read the setup"
  cta-href="/contract-testing-setup"
/>

## The problem

Frontend teams write mock responses in tests that drift from reality over time. Fields get renamed, removed, or added in the API — but mocks stay frozen. Tests pass, code ships, and the app breaks in production.

Contract testing closes this gap: **test what you own, mock what you don't — then validate the mocks.**

## How it works

During the test run, TWD collects every mock registered via `twd.mockRequest()`. After tests complete, `twd-cli` validates those mocks against your OpenAPI specs using [openapi-mock-validator](https://github.com/BRIKEV/openapi-mock-validator). Each mock either matches the spec (✓), fails (✗) with the precise field that broke, or warns (⚠) when the status code or schema isn't documented yet.

You pick the mode per spec. `"error"` fails the test run (use this for stable endpoints you trust). `"warn"` reports but doesn't fail (use this while you're catching up to a moving target). When the GitHub Action runs in CI, a summary table is posted as a PR comment so the breakage is visible to the reviewer, not just to whoever scrolled the CI log.

## Quick start

```bash
npm install --save-dev twd-cli openapi-mock-validator
```

```json
// twd.config.json
{
  "url": "http://localhost:5173",
  "contractReportPath": ".twd/contract-report.md",
  "contracts": [
    {
      "source": "./contracts/users-3.0.json",
      "baseUrl": "/api",
      "mode": "error",
      "strict": true
    }
  ]
}
```

Run TWD's CLI in CI; the contract report is generated alongside the test results.

[Full setup, options, validations, and PR reports →](/contract-testing-setup)

<LandingCrossLinks
  :links='[
    { href: "/twd-js", title: "Write the tests that collect mocks", blurb: "Get the core in-browser testing experience that powers contract testing." },
    { href: "/twd-relay", title: "Let AI iterate on tests", blurb: "Have an AI agent author and stabilize tests before you gate on contracts." },
    { href: "/contract-testing-setup", title: "Full setup reference", blurb: "Contract options, supported validations, PR report configuration." }
  ]'
/>

## Get started

```bash
npm install --save-dev twd-cli openapi-mock-validator
```

[Read the setup guide →](/contract-testing-setup)
````

- [ ] **Step 2: Visual verification**

With `npm run docs:dev` running, visit `http://localhost:5173/contract-testing`. Expected:
- Landing layout: hero (no image, content expands wide), problem section, how it works, quick start, cross-links, final CTA
- The link in "Quick start" to `/contract-testing-setup` resolves to the page created in Task 5
- Cross-link to `/twd-js` and `/twd-relay` resolve to the pages created in Tasks 7 and 8
- The previous reference content (Contract Options table, Example Output, Supported Validations, PR Reports, Next Steps) is **no longer on this page** — it lives at `/contract-testing-setup`

- [ ] **Step 3: Commit**

```bash
git add docs/contract-testing.md
git commit -m "docs: rewrite /contract-testing as the landing page"
```

---

## Task 10: Update navigation (top nav + sidebar)

**Files:**
- Modify: `docs/.vitepress/config.mts`

- [ ] **Step 1: Add the "Products" top-nav dropdown**

In `config.mts`, locate the `nav` array (currently 4 items: Home / Core Concepts / AI Workflow / API Reference). Replace it with:

```ts
nav: [
  { text: 'Home', link: '/' },
  { text: 'Core Concepts', link: '/getting-started' },
  { text: 'AI Workflow', link: '/twd-ai/setup' },
  {
    text: 'Products',
    items: [
      { text: 'twd-js', link: '/twd-js' },
      { text: 'twd-relay', link: '/twd-relay' },
      { text: 'Contract Testing', link: '/contract-testing' },
    ],
  },
  { text: 'API Reference', link: '/api/' },
],
```

- [ ] **Step 2: Add the "Sub-products" sidebar group**

In the same file, locate the `sidebar` array. The first group currently is `{ text: 'Philosophy', items: [...] }`. **Prepend** a new group above it:

```ts
sidebar: [
  {
    text: 'Sub-products',
    items: [
      { text: 'twd-js', link: '/twd-js' },
      { text: 'twd-relay', link: '/twd-relay' },
      { text: 'Contract Testing', link: '/contract-testing' },
    ],
  },
  {
    text: 'Philosophy',
    items: [
      { text: 'TWD Manifesto', link: '/twd-manifesto' },
      { text: 'Why Test While Developing', link: '/motivation' },
    ]
  },
  // … existing groups unchanged
],
```

Keep all subsequent sidebar groups (Core Concepts, AI Workflow, AI Reference, Community, Tutorial, API Reference) exactly as they are.

- [ ] **Step 3: Visual verification**

With `npm run docs:dev` running, hard-reload `http://localhost:5173/`. Expected:
- Top nav now shows "Products ▾" between "AI Workflow" and "API Reference"
- Hovering "Products ▾" reveals the three items, each clickable to the right landing
- Navigate to any docs page (e.g. `/getting-started`). The left sidebar now shows "Sub-products" as the topmost group, above "Philosophy", with the three landing links
- All existing sidebar groups still appear after "Philosophy" and link correctly

- [ ] **Step 4: Commit**

```bash
git add docs/.vitepress/config.mts
git commit -m "docs: surface sub-product landings in top nav and sidebar"
```

---

## Task 11: Full verification and build

**Files:** none modified

- [ ] **Step 1: Run the production build**

```bash
npm run docs:build
```

Expected: build succeeds with no warnings about dead internal links. Pay special attention to the warnings panel — every link in the homepage adoption-line and every cross-link block must resolve.

If the build emits "Found dead link" warnings, capture the list and fix:
- A typo in a `href`: edit the offending file
- A page not yet created: confirm against the file map — every link in the plan resolves to a page created in Tasks 5, 7, 8, 9, or to an existing untouched page (`/getting-started`, `/ai-remote-testing`, `/ci-execution`, `/api-mocking`, `/coverage`).

Re-run `npm run docs:build` until it's clean.

- [ ] **Step 2: Smoke-test the built site**

```bash
npm run docs:preview
```

This serves the production build locally (default `http://localhost:4173`). Visit:

- `/` — confirm hero sub is tightened, new ecosystem section renders, thesis banner and adoption-line look as designed at desktop and mobile widths
- `/twd-js` — landing renders with hero, problem, how-it-works, quick-start, cross-links, final CTA
- `/twd-relay` — same shape, no hero image, no broken layout
- `/contract-testing` — new landing, no reference content
- `/contract-testing-setup` — migrated reference renders all sections (Setup, Contract Options table, Example Output, Supported Validations, PR Reports, Next Steps)
- `/getting-started` — unchanged
- `/ai-remote-testing` — unchanged
- Top-nav "Products ▾" — dropdown works on both desktop and mobile (mobile shows it as a list when the hamburger is open)
- Sidebar — "Sub-products" group appears at the top in every docs page

Hard-reload each page in both light and dark mode. Confirm no console errors and no layout shifts past the entrance animation.

Also click each of the four adoption-line cards on `/` and inspect the navigated page's URL — they should resolve to `/twd-js`, `/twd-relay`, `/ci-execution`, `/contract-testing` respectively.

- [ ] **Step 3: Spot-check Umami events**

Right-click any of the four adoption-line cards on `/` and "Inspect element". Confirm the underlying `<a>` element has a `data-umami-event` attribute matching the table in the spec:

| Card | Expected attribute |
|---|---|
| Sidebar | `data-umami-event="home_ecosystem_sidebar"` |
| AI Agent | `data-umami-event="home_ecosystem_ai_agent"` |
| CI | `data-umami-event="home_ecosystem_ci"` |
| Contracts | `data-umami-event="home_ecosystem_contracts"` |

(Live Umami events are verified post-deploy, not here.)

- [ ] **Step 4: Stop preview server and reconcile stash**

Stop `docs:preview` (Ctrl+C).

If Task 1 stashed pre-existing modifications to `docs/ai-remote-testing.md` and `docs/claude-plugin.md`, do **not** restore them onto this branch. Leave them in the stash; they will be restored on `main` after this branch is merged, by running:

```bash
# Run this on main AFTER this branch has been merged
git stash pop stash@{0}
```

Document this in the PR description so it isn't forgotten.

- [ ] **Step 5: Final commit (if anything was fixed during verification)**

If steps 1–4 surfaced fixes and you applied them, commit each fix in its own commit with a descriptive message. If no fixes were needed, skip this step.

- [ ] **Step 6: Branch is ready for PR**

The branch `docs/homepage-rewrite` now contains the full design and is ready for PR. Ask the user before pushing or opening a PR.

---

## Self-review (against the spec)

This section confirms the plan covers every spec requirement.

| Spec requirement | Task |
|---|---|
| Branch `docs/homepage-rewrite` | Task 1 |
| Spec committed on the branch | Task 1 |
| New H2 *One package today. The rest when you need it.* | Task 4 |
| New sub *Start with the sidebar…* | Task 4 |
| Thesis "Test what you own. Mock what you don't." promoted above diagram, display-weight | Tasks 2, 4 |
| Circular SVG replaced with horizontal adoption-line (4 stages, narrative order) | Tasks 3, 4 |
| Stage 1 solid teal "START HERE" | Task 3 |
| Stages 2-3 dashed teal "optional" | Task 3 |
| Stage 4 dashed gold "optional" | Task 3 |
| Conditional labels ("Add when…", "Add if…") on stages 2-4 | Task 3 |
| Mobile: linearized vertical stack | Task 3 |
| Each card is a link to its destination | Task 3 |
| Umami `data-umami-event` attributes on each card | Tasks 3, 11 (verification) |
| Hero sub tightened to three-clause parallel | Task 4 |
| `/twd-js` landing with H1 *Frontend tests that run in your real browser.* | Task 7 |
| `/twd-relay` landing with H1 *Token-efficient browser testing for AI agents.* | Task 8 |
| `/contract-testing` rewritten as landing with H1 *Your mocks lie…* | Task 9 |
| `/contract-testing-setup` receives the migrated reference content verbatim | Task 5 |
| Landings use VitePress doc layout with inline Vue components | Tasks 6, 7, 8, 9 |
| `LandingHero` and `LandingCrossLinks` reusable components | Task 6 |
| Per-landing SEO frontmatter (title, description, og:title, og:description) | Tasks 7, 8, 9 |
| Top-nav "Products ▾" dropdown with three items | Task 10 |
| Sidebar "Sub-products" group above "Philosophy" | Task 10 |
| `/contract-testing-setup` not added to top-nav or new sidebar group | Task 10 (omitted by design) |
| `npm run docs:build` passes clean | Task 11 |
| Manual visual verification at desktop + mobile, light + dark | Task 11 |
| Cross-links between all three landings + relevant how-tos | Tasks 7, 8, 9 |
| No changes to `/getting-started`, `/ai-remote-testing`, tutorials, API reference, twd-ai pages | None — all such files are absent from the modify list |

No gaps found.

---

## Execution Handoff

Plan complete and saved to `specs/2026-05-13-homepage-rewrite-plan.md`. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
