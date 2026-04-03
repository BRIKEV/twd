<script setup>
import { useData } from 'vitepress'

const { isDark } = useData()
</script>

<template>
  <div class="home-page">
    <header class="home-nav">
      <nav aria-label="Main navigation">
        <a href="/" class="nav-brand" aria-label="TWD home">TWD</a>
        <div class="nav-links">
          <a href="/getting-started">Guide</a>
          <a href="/tutorial/">Tutorial</a>
          <a href="/api/">API Reference</a>
        </div>
      </nav>
    </header>

    <main>
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-headline">Testing isn't a phase.<br>It's how you build.</h1>
          <p class="hero-sub">
            TWD is a frontend testing ecosystem. Write tests while you develop, in your real browser.
            Let the AI agent iterate. Validate every mock against the real API before you merge.
          </p>
          <div class="hero-actions">
            <a href="/getting-started" class="btn btn-brand">Get Started</a>
            <a href="https://github.com/BRIKEV/twd" target="_blank" rel="noopener" class="btn btn-outline">
              View on GitHub <span class="visually-hidden">(opens in new tab)</span>
            </a>
          </div>
        </div>
      </section>

      <!-- Section 2: Pain Points -->
      <section class="pain-points" aria-labelledby="pain-heading">
        <h2 id="pain-heading" class="visually-hidden">Problems TWD solves</h2>
        <div class="pain-cards">
          <div class="pain-card">
            <h3 class="pain-title">Testing is always last</h3>
            <p class="pain-desc">
              Every sprint, testing gets pushed to "next week." Next week never comes.
              The codebase grows. The debt compounds.
            </p>
          </div>
          <div class="pain-card">
            <h3 class="pain-title">AI writes tests that don't run</h3>
            <p class="pain-desc">
              Your agent generates test files. They look correct. They never execute
              in a real browser. No one notices until someone does.
            </p>
          </div>
          <div class="pain-card">
            <h3 class="pain-title">Your mocks lie</h3>
            <p class="pain-desc">
              The backend renames a field. Your mock doesn't know. Tests pass.
              Production breaks. You find out from a user.
            </p>
          </div>
        </div>
      </section>

    <!-- Section 3: Ecosystem Pipeline -->
    <section class="pipeline">
      <h2 class="section-title">The TWD Ecosystem</h2>
      <p class="section-sub">All optional. All composable. Start with the sidebar, add what you need.</p>

      <!-- Desktop: SVG circular diagram (decorative — mobile HTML version is the accessible equivalent) -->
      <div class="pipeline-desktop" aria-hidden="true">
        <svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" class="pipeline-svg" focusable="false">
          <!-- Center text -->
          <text x="380" y="205" text-anchor="middle" fill="var(--vp-c-brand-1)" font-size="16" font-weight="bold" opacity="0.35">TWD</text>
          <text x="380" y="225" text-anchor="middle" fill="var(--vp-c-text-3)" font-size="10" opacity="0.5">test what you own</text>
          <text x="380" y="239" text-anchor="middle" fill="var(--vp-c-text-3)" font-size="10" opacity="0.5">mock what you don't</text>

          <!-- Stage 1: Top — DEVELOP + TEST (CORE) -->
          <rect x="265" y="50" width="230" height="80" rx="14" fill="var(--pipeline-card-bg)" stroke="var(--vp-c-brand-1)" stroke-width="2.5"/>
          <rect x="410" y="42" width="56" height="16" rx="8" fill="var(--vp-c-brand-1)"/>
          <text x="438" y="53" text-anchor="middle" fill="var(--pipeline-badge-text)" font-size="8" font-weight="bold">CORE</text>
          <text x="295" y="78" fill="var(--vp-c-brand-1)" font-size="11" font-weight="bold">DEVELOP + TEST</text>
          <text x="295" y="98" fill="var(--vp-c-text-1)" font-size="14" font-weight="bold">twd-js</text>
          <text x="295" y="117" fill="var(--vp-c-text-3)" font-size="10">Sidebar in your browser</text>

          <!-- Stage 2: Right — AI AGENT (optional) -->
          <rect x="530" y="140" width="210" height="80" rx="14" fill="var(--pipeline-card-bg)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" stroke-dasharray="8,4"/>
          <rect x="660" y="132" width="52" height="16" rx="8" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1" opacity="0.5"/>
          <text x="686" y="143" text-anchor="middle" fill="var(--vp-c-brand-1)" font-size="8" opacity="0.6">optional</text>
          <text x="555" y="168" fill="var(--vp-c-brand-1)" font-size="11" font-weight="bold">AI AGENT</text>
          <text x="555" y="188" fill="var(--vp-c-text-1)" font-size="12" font-weight="600">twd-relay + twd-ai</text>
          <text x="555" y="207" fill="var(--vp-c-text-3)" font-size="10">Write, run, fix, repeat</text>

          <!-- Stage 3: Bottom-right — CI PIPELINE (optional) -->
          <rect x="470" y="270" width="210" height="80" rx="14" fill="var(--pipeline-card-bg)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" stroke-dasharray="8,4"/>
          <rect x="600" y="262" width="52" height="16" rx="8" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="1" opacity="0.5"/>
          <text x="626" y="273" text-anchor="middle" fill="var(--vp-c-brand-1)" font-size="8" opacity="0.6">optional</text>
          <text x="495" y="298" fill="var(--vp-c-brand-1)" font-size="11" font-weight="bold">CI PIPELINE</text>
          <text x="495" y="318" fill="var(--vp-c-text-1)" font-size="12" font-weight="600">twd-cli</text>
          <text x="495" y="337" fill="var(--vp-c-text-3)" font-size="10">Headless tests + coverage</text>

          <!-- Stage 4: Bottom-left — VALIDATE CONTRACTS (optional, gold) -->
          <rect x="80" y="270" width="230" height="80" rx="14" fill="var(--pipeline-card-bg)" stroke="var(--pipeline-gold)" stroke-width="1.5" stroke-dasharray="8,4"/>
          <rect x="225" y="262" width="52" height="16" rx="8" fill="none" stroke="var(--pipeline-gold)" stroke-width="1" opacity="0.5"/>
          <text x="251" y="273" text-anchor="middle" fill="var(--pipeline-gold)" font-size="8" opacity="0.6">optional</text>
          <text x="105" y="298" fill="var(--pipeline-gold)" font-size="11" font-weight="bold">VALIDATE CONTRACTS</text>
          <text x="105" y="318" fill="var(--vp-c-text-1)" font-size="12" font-weight="600">openapi-mock-validator</text>
          <text x="105" y="337" fill="var(--vp-c-text-3)" font-size="10">Every mock vs the real spec</text>

          <!-- Stage 5: Left — SHIP (green) -->
          <rect x="20" y="140" width="210" height="80" rx="14" fill="var(--pipeline-card-bg)" stroke="var(--pipeline-green)" stroke-width="2"/>
          <text x="45" y="168" fill="var(--pipeline-green)" font-size="11" font-weight="bold">SHIP</text>
          <text x="45" y="188" fill="var(--vp-c-text-1)" font-size="14" font-weight="bold">Merge with confidence</text>
          <text x="45" y="207" fill="var(--vp-c-text-3)" font-size="10">Contracts validated, tests green</text>

          <!-- Arrows -->
          <defs>
            <marker id="arr-teal" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--vp-c-brand-1)"/>
            </marker>
            <marker id="arr-green" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--pipeline-green)"/>
            </marker>
          </defs>
          <path d="M495 95 C530 110, 540 130, 535 140" stroke="var(--vp-c-brand-1)" stroke-width="1.5" fill="none" marker-end="url(#arr-teal)" opacity="0.5"/>
          <path d="M640 220 C640 245, 620 258, 600 270" stroke="var(--vp-c-brand-1)" stroke-width="1.5" fill="none" marker-end="url(#arr-teal)" opacity="0.5"/>
          <path d="M470 310 C420 325, 370 325, 310 310" stroke="var(--vp-c-brand-1)" stroke-width="1.5" fill="none" marker-end="url(#arr-teal)" opacity="0.5"/>
          <path d="M115 270 C100 250, 100 235, 115 220" stroke="var(--vp-c-brand-1)" stroke-width="1.5" fill="none" marker-end="url(#arr-teal)" opacity="0.5"/>
          <path d="M130 140 C140 110, 200 80, 265 75" stroke="var(--pipeline-green)" stroke-width="1.5" fill="none" marker-end="url(#arr-green)" opacity="0.5"/>
        </svg>
      </div>

      <!-- Mobile: Linearized vertical flow (also the screen-reader-accessible version) -->
      <div class="pipeline-mobile" role="list" aria-label="TWD ecosystem stages">
        <div class="pipeline-stage pipeline-stage--core" role="listitem">
          <span class="pipeline-badge pipeline-badge--core">CORE</span>
          <h4 class="pipeline-label">DEVELOP + TEST</h4>
          <p class="pipeline-pkg">twd-js</p>
          <p class="pipeline-desc">Sidebar in your browser</p>
        </div>
        <div class="pipeline-arrow" aria-hidden="true"></div>
        <div class="pipeline-stage pipeline-stage--optional" role="listitem">
          <span class="pipeline-badge pipeline-badge--optional">optional</span>
          <h4 class="pipeline-label">AI AGENT</h4>
          <p class="pipeline-pkg">twd-relay + twd-ai</p>
          <p class="pipeline-desc">Write, run, fix, repeat</p>
        </div>
        <div class="pipeline-arrow" aria-hidden="true"></div>
        <div class="pipeline-stage pipeline-stage--optional" role="listitem">
          <span class="pipeline-badge pipeline-badge--optional">optional</span>
          <h4 class="pipeline-label">CI PIPELINE</h4>
          <p class="pipeline-pkg">twd-cli</p>
          <p class="pipeline-desc">Headless tests + coverage</p>
        </div>
        <div class="pipeline-arrow" aria-hidden="true"></div>
        <div class="pipeline-stage pipeline-stage--gold" role="listitem">
          <span class="pipeline-badge pipeline-badge--gold">optional</span>
          <h4 class="pipeline-label pipeline-label--gold">VALIDATE CONTRACTS</h4>
          <p class="pipeline-pkg">openapi-mock-validator</p>
          <p class="pipeline-desc">Every mock vs the real spec</p>
        </div>
        <div class="pipeline-arrow pipeline-arrow--green" aria-hidden="true"></div>
        <div class="pipeline-stage pipeline-stage--green" role="listitem">
          <h4 class="pipeline-label pipeline-label--green">SHIP</h4>
          <p class="pipeline-pkg">Merge with confidence</p>
          <p class="pipeline-desc">Contracts validated, tests green</p>
        </div>
      </div>
    </section>

    <!-- Section 4: How It Works -->
    <section class="how-it-works">
      <h2 class="section-title">How It Works</h2>

      <div class="steps">
        <div class="step">
          <span class="step-number">1</span>
          <div class="step-content">
            <h3 class="step-title">Run tests in your own browser</h3>
            <p class="step-desc">
              Your tests execute in your real browser, with your real devtools.
              No terminal, no jsdom, no headless runner. Results show in a sidebar
              — click play to run any scenario.
            </p>
            <img
              src="/images/twd_side_bar_success.png"
              alt="TWD sidebar showing passing tests in the browser"
              class="step-img"
              loading="lazy"
            />
          </div>
        </div>

        <div class="step">
          <span class="step-number">2</span>
          <div class="step-content">
            <h3 class="step-title">The agent writes, runs, and improves</h3>
            <p class="step-desc">
              The AI agent writes tests, runs them via WebSocket, fixes failures,
              and repeats autonomously. It also finds untested pages, grades test
              quality, and closes gaps — not just green tests, but good tests.
            </p>
          </div>
        </div>

        <div class="step">
          <span class="step-number">3</span>
          <div class="step-content">
            <h3 class="step-title">Validate and ship</h3>
            <p class="step-desc">
              In CI, twd-cli runs your tests headlessly and collects coverage
              automatically. If you add contract testing, every mock is validated
              against the real OpenAPI spec before the PR merges.
            </p>
          </div>
        </div>
      </div>
    </section>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  font-family: var(--vp-font-family-base);
}

/* Navigation */
.home-nav nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--vp-c-border);
}

.nav-brand {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.nav-links a:hover {
  color: var(--vp-c-brand-1);
}

/* Utility: visually hidden for screen readers */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Hero */
.hero {
  text-align: center;
  padding: 100px 0 80px;
}

.hero-headline {
  font-size: 3rem;
  line-height: 1.15;
  font-weight: 800;
  color: var(--vp-c-text-1);
  letter-spacing: -0.02em;
}

.hero-sub {
  margin-top: 24px;
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.85;
}

.btn-brand {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.btn-outline {
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-1);
  background: transparent;
}

@media (max-width: 640px) {
  .hero {
    padding: 60px 0 48px;
  }
  .hero-headline {
    font-size: 2rem;
  }
  .hero-sub {
    font-size: 1rem;
  }
  .nav-links {
    gap: 16px;
  }
  .nav-links a {
    font-size: 0.8125rem;
  }
}

/* Pain Points */
.pain-points {
  padding: 60px 0;
}

.pain-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.pain-card {
  padding: 28px 24px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
}

.pain-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 12px;
}

.pain-desc {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .pain-cards {
    grid-template-columns: 1fr;
  }
}

/* Section shared */
.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}

.section-sub {
  text-align: center;
  color: var(--vp-c-text-2);
  margin-top: 8px;
  font-size: 1rem;
}

/* Pipeline */
.pipeline {
  padding: 60px 0;
}

.pipeline-desktop {
  margin-top: 40px;
}

.pipeline-svg {
  width: 100%;
  height: auto;
  display: block;
}

.pipeline-mobile {
  margin-top: 32px;
}

/* On desktop: visually hidden but accessible to screen readers */
@media (min-width: 769px) {
  .pipeline-mobile {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

/* Mobile pipeline stages */
.pipeline-stage {
  padding: 20px;
  border-radius: 12px;
  border: 1.5px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  position: relative;
}

.pipeline-stage--core {
  border-color: var(--vp-c-brand-1);
  border-width: 2.5px;
}

.pipeline-stage--optional {
  border-style: dashed;
  border-color: var(--vp-c-brand-1);
}

.pipeline-stage--gold {
  border-style: dashed;
  border-color: var(--pipeline-gold);
}

.pipeline-stage--green {
  border-color: var(--pipeline-green);
  border-width: 2px;
}

.pipeline-badge {
  position: absolute;
  top: -10px;
  right: 16px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
}

.pipeline-badge--core {
  background: var(--vp-c-brand-1);
  color: var(--pipeline-badge-text);
}

.pipeline-badge--optional {
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  opacity: 0.6;
}

.pipeline-badge--gold {
  border: 1px solid var(--pipeline-gold);
  color: var(--pipeline-gold);
  opacity: 0.6;
}

.pipeline-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.pipeline-label--gold {
  color: var(--pipeline-gold);
}

.pipeline-label--green {
  color: var(--pipeline-green);
}

.pipeline-pkg {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.pipeline-desc {
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}

.pipeline-arrow {
  width: 2px;
  height: 20px;
  background: var(--vp-c-brand-1);
  margin: 0 auto;
  opacity: 0.3;
  position: relative;
}

.pipeline-arrow::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: -3px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid var(--vp-c-brand-1);
  opacity: 1;
}

.pipeline-arrow--green {
  background: var(--pipeline-green);
}

.pipeline-arrow--green::after {
  border-top-color: var(--pipeline-green);
}

@media (max-width: 768px) {
  .pipeline-desktop {
    display: none;
  }
  .pipeline-mobile {
    /* Reset from visually-hidden back to visible on mobile */
    position: static;
    width: auto;
    height: auto;
    padding: 0;
    margin: 0;
    margin-top: 32px;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
  .section-title {
    font-size: 1.5rem;
  }
}

/* How It Works */
.how-it-works {
  padding: 60px 0;
}

.steps {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.step {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 700;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.step-desc {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.step-img {
  margin-top: 20px;
  width: 100%;
  max-width: 700px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-border);
}

@media (max-width: 640px) {
  .step-number {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
  .step-title {
    font-size: 1.0625rem;
  }
}
</style>
