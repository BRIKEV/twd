---
title: Accessibility Statement
description: Accessibility statement for TWD. Full conformance with WCAG 2.2 Level AA, EN 301 549, and the European Accessibility Act.
outline: deep
---

# Accessibility Statement for TWD

Test While Developing - [twd.dev](https://twd.dev/)

> **Status:** Full conformance with WCAG 2.2 Level AA.
>
> Audited June 2026 by Latam11y. Last updated: 21 June 2026.

## 1. Introduction

BRIKEV is committed to digital
accessibility and inclusion. We want everyone, including people with
disabilities, to be able to successfully use our website and the TWD testing
tool.

This statement explains the extent to which TWD complies with the requirements
of European standard
[EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_302000/301549/03.02.01_60/en_301549v030201p.pdf)
(the technical reference of the
[European Accessibility Act (EAA, EU Directive 2019/882)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0882))
and the
[Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/).
It covers the TWD website ([twd.dev](https://twd.dev/)) and the twd-js tool.

We review this statement periodically as the service evolves.

## 2. Service overview

**TWD ("Test While Developing")** is an **open-source** frontend testing
framework, published under the MIT licence, that allows development teams to
write and run tests directly while developing, without needing to switch
context.

Its main component, **twd-js**, integrates as a browser sidebar in the
development environment and is compatible with React, Vue, Angular, Solid.js,
React Router, and other Vite-based frameworks.

The audited service comprises:

- The website [https://twd.dev/](https://twd.dev/): homepage and getting-started
  documentation.
- The **twd-js** tool ([npm package twd-js](https://www.npmjs.com/package/twd-js)),
  audited as an application installed in the development browser.

## 3. How to use TWD (accessibility and operation)

The TWD website has been designed to be navigable and usable with keyboard and
screen readers. The main accessibility features are described below.

### Keyboard navigation

All links, buttons, and interactive elements are reachable with the
<kbd>Tab</kbd> key. The focus order is logical and consistent with the visual
flow of the page. There are no keyboard traps.

### Focus indicator

The focus indicator is visible on all components of the site and the tool, in
both light and dark themes. It meets a minimum stroke of 2&nbsp;px and a
2&nbsp;px offset from the content, with sufficient contrast against adjacent
colours (minimum 3:1).

### Colour contrast

Site text meets a minimum contrast ratio of 4.5:1 for normal text and 3:1 for
large text, in both light and dark themes. Non-text components of the tool meet
the minimum 3:1 ratio.

### Link purpose

Links are descriptive and distinguishable by more than colour alone.

### Screen reader compatibility

Tested with NVDA 2026.1 on Windows 11. Interactive components correctly announce
their name, role, and state.

## 4. Accessibility compliance

We have evaluated TWD (website and twd-js tool) against the accessibility
requirements of Annex I of the EAA, technically implemented through EN 301 549
and WCAG 2.2, across the four POUR principles:

| Principle | Summary |
| --- | --- |
| **Perceivable** | Content is structured with headings, lists, and ARIA landmarks. Text meets the required contrast ratios in both themes. Information is not conveyed by colour alone. |
| **Operable** | All functionality is keyboard accessible. Focus indicators are visible and have sufficient contrast. There are no keyboard traps. |
| **Understandable** | Content is written in plain, consistent English. Navigation and structure are consistent across all pages. |
| **Robust** | The site is built with semantic HTML5 and correct ARIA roles, compatible with current browser versions and assistive technologies. |

**Reference standards:**

- [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/)
- [EN 301 549 v3.2.1](https://www.etsi.org/deliver/etsi_en/301500_302000/301549/03.02.01_60/en_301549v030201p.pdf)
- [EAA, Directive 2019/882/EU](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0882)

::: info Conformance status
**Full conformance with WCAG 2.2 Level AA.** All evaluated Level A and AA success
criteria are met.
:::

**Audit information:**

| | |
| --- | --- |
| **Audited by** | María Pía Peña Foissac - Latam11y, digital accessibility consultancy ([mariapiapenafoissac@gmail.com](mailto:mariapiapenafoissac@gmail.com)) |
| **Date** | June 2026 |
| **Methodology** | Manual review with keyboard and NVDA 2026.1 on Windows 11 (26H1); colour contrast verification with Tanaguru Contrast Finder |
| **Scope** | [twd.dev](https://twd.dev/) (Home + Getting Started) plus the twd-js tool (browser sidebar) |

## 5. Ongoing monitoring and maintenance

Accessibility for TWD is an ongoing process. Measures in place include:

- Accessibility review when significant changes are made to the site or tool.
- Tracking of reported accessibility issues through the
  [GitHub repository](https://github.com/BRIKEV/twd/issues).
- Commitment to update this statement following new audits or relevant changes.
- Monitoring of updates to WCAG and EN 301 549.

## 6. Known limitations

There are no known areas of TWD (website or twd-js tool) that are inaccessible.
All Level A and AA conformance criteria evaluated have been remediated. This
statement will be updated if new limitations are identified.

## 7. Disproportionate burden

BRIKEV does not claim any exemption or
disproportionate burden in meeting the applicable accessibility requirements.
Should a specific situation require such an assessment in the future, it will be
documented in accordance with Annex VI of the EAA and this statement will be
updated.

## 8. Feedback and contact information

If you experience any difficulty accessing any part of TWD, identify an
accessibility issue, or have suggestions for improvement, please let us know:

- **Email:** [hello.brikev@gmail.com](mailto:hello.brikev@gmail.com?subject=TWD%20Accessibility)
- **GitHub Issues:** [github.com/BRIKEV/twd/issues](https://github.com/BRIKEV/twd/issues)
- **GitHub Discussions:** [github.com/BRIKEV/twd/discussions](https://github.com/BRIKEV/twd/discussions)

When contacting us, please provide as much detail as possible: which page or
component, what happened, and what assistive technology you are using.

**Response time commitments:**

- **5 business days** - acknowledgement.
- **30 business days** - resolution or update.

## 9. Document history

This accessibility statement was first published on 21 June 2026. It was last
reviewed and updated on 21 June 2026. We intend to review it at least annually
or whenever significant changes are made to the service.

---

Statement prepared in accordance with the
[European Accessibility Act (EU Directive 2019/882)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32019L0882)
and standard
[EN 301 549 v3.2.1](https://www.etsi.org/deliver/etsi_en/301500_302000/301549/03.02.01_60/en_301549v030201p.pdf).
Audited by María Pía Peña Foissac and Daiana Elizabeth Carbonell,
[Latam11y](mailto:mariapiapenafoissac@gmail.com), June 2026.
