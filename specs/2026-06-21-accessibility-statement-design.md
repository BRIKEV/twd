# Accessibility Statement Page - Design

Date: 2026-06-21
Branch: `docs/accessibility-statement`

## Context

TWD was audited for accessibility (June 2026, by Latam11y) against WCAG 2.2
Level AA, EN 301 549, and the European Accessibility Act (EU Directive
2019/882). The auditors delivered a standalone, self-styled HTML statement
(`TWD-Accessibility-Statement-EN.html`). We need to publish this statement on
the TWD documentation site (VitePress, served at twd.dev).

Two problems to solve:

1. **Format.** The delivered HTML is a fully self-styled standalone page. The
   VitePress default theme is already accessible (keyboard nav, visible focus,
   dark mode, sufficient contrast) and themed, so we adapt the content to clean
   markdown rather than port the custom CSS.
2. **Discoverability.** The site has no visible footer. The home page
   (`index.md`) uses `layout: false` with a custom `HomePage.vue` that ends in a
   CTA plus a spacer; doc pages have a sidebar, which suppresses the VitePress
   `themeConfig.footer`. An accessibility statement conventionally lives in the
   footer, so a reader currently has nowhere to find it.

## Goals

- Publish the accessibility statement as a maintainable VitePress markdown page.
- Make it discoverable from both the docs sidebar and the home page.
- Preserve all substantive content, links, and standards references from the
  audited statement.

## Non-goals

- Reproducing the auditors' custom visual design (cards, badges, pills) pixel
  for pixel.
- Filling in legal placeholders (entity name, dates, escalation authority) -
  these are marked TODO for the maintainer to complete before public launch.

## Decisions (confirmed with user)

| Topic | Decision |
|---|---|
| Placement | Add to existing **Community** sidebar group, plus a footer-style link on the home page. |
| Format | Clean VitePress markdown using native containers, tables, and links. |
| Placeholders | Mark as clearly visible TODOs. |
| Prose style | No em-dashes (per user preference); use hyphens, commas, or parentheses. |

## Changes

### 1. New page: `docs/accessibility-statement.md`

Frontmatter matches the standard content-page pattern:

```yaml
---
title: Accessibility Statement
description: Accessibility statement for TWD. Full conformance with WCAG 2.2 Level AA, EN 301 549, and the European Accessibility Act.
outline: deep
---
```

Sections (mapped 1:1 from the source statement):

1. Introduction - commitment, standards covered (EN 301 549, EAA, WCAG 2.2),
   scope (twd.dev + twd-js).
2. Service overview - what TWD and twd-js are, what was audited.
3. How to use TWD - keyboard navigation, focus indicator, colour contrast, link
   purpose, screen reader compatibility (each as an `###` subsection).
4. Accessibility compliance:
   - POUR principles (Perceivable, Operable, Understandable, Robust) as a short
     list or simple table.
   - Reference standards as a bulleted list of external links (WCAG 2.2 AA,
     EN 301 549 v3.2.1, EAA Directive 2019/882).
   - Conformance status in a `::: info` (or `::: tip`) container.
   - Audit details as a markdown table (Audited by, Date, Methodology, Scope).
5. Ongoing monitoring and maintenance.
6. Known limitations.
7. Disproportionate burden - contains a TODO placeholder for the legal entity.
8. Feedback and contact - email (hello.brikev@gmail.com), GitHub Issues, GitHub
   Discussions, response-time commitments, escalation block with a TODO for the
   competent authority.
9. Document history - first published / last updated, both TODO.

External links preserved from source: W3C WCAG 2.2, ETSI EN 301 549 PDF, EUR-Lex
EAA directive, npm twd-js, GitHub repo/issues/discussions.

TODO placeholders to surface visibly in the page:
- Legal entity / name (Introduction, Disproportionate burden).
- First-published date and last-updated date (Document history, and the meta
  line near the title).
- Competent authority for escalation and its info link (Feedback section).

### 2. Sidebar registration: `docs/.vitepress/config.mts`

Append to the existing `Community` group in the `sidebar` array:

```ts
{
  text: 'Community',
  items: [
    { text: 'Community & Examples', link: '/community' },
    { text: 'Accessibility Statement', link: '/accessibility-statement' },
  ],
},
```

No `nav` change (top nav stays focused on product/tooling).

### 3. Home page footer link: `docs/.vitepress/theme/components/HomePage.vue`

The template currently ends (around line 270) with:

```html
      <div style="height: 80px;"></div>
    </main>
  </div>
</template>
```

Replace the bare spacer with a small, semantic footer landmark containing the
accessibility link and the license/copyright line. Requirements:

- Use a `<footer>` element (page-level footer landmark).
- Link text "Accessibility Statement" pointing to `/accessibility-statement`.
- Include "MIT License" and "Copyright (c) 2025 BRIKEV" to mirror the configured
  `themeConfig.footer` that never renders on this custom-layout page.
- Links underlined / distinguishable by more than colour (consistent with the
  existing `LandingCrossLinks` WCAG 1.4.1 note in this codebase).
- Style with scoped CSS consistent with the existing component (muted text,
  centered, top border), respecting light and dark themes via existing CSS
  variables.

## Verification

1. `cd docs && npm run docs:dev` (or the repo's documented docs dev command).
2. Visit `/accessibility-statement` - page renders, all sections present, TODO
   placeholders clearly visible, external links resolve, table and info
   container render correctly in both light and dark themes.
3. Confirm "Accessibility Statement" appears in the sidebar under Community and
   navigates correctly.
4. On the home page, scroll to the bottom - the footer link renders, is
   keyboard-focusable with a visible focus ring, and navigates to the statement.
5. `cd docs && npm run docs:build` completes without errors or dead-link
   warnings.

## Files touched

- `docs/accessibility-statement.md` (new)
- `docs/.vitepress/config.mts` (sidebar group edit)
- `docs/.vitepress/theme/components/HomePage.vue` (footer block)
