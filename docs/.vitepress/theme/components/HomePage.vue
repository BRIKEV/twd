<script setup>
import { useData } from 'vitepress'
import { ref, onMounted } from 'vue'

const { isDark } = useData()
const loaded = ref(false)

onMounted(() => {
  requestAnimationFrame(() => { loaded.value = true })
})

const faqs = [
  {
    q: 'How is this different from Playwright/Cypress?',
    a: 'TWD validates your frontend UI logic with mocked boundaries. Playwright/Cypress validate that your systems work together end-to-end. They complement each other — TWD for fast deterministic feedback during dev, E2E for full integration in CI.'
  },
  {
    q: 'How is this different from Vitest Browser Mode?',
    a: 'Vitest Browser runs unit/component tests in a browser but in isolation from your app. TWD runs inside your actual dev server — same page, same routes, same state. You test what the user sees, not a mounted component in a vacuum.'
  },
  {
    q: 'Does this replace Testing Library?',
    a: 'No. TWD uses Testing Library under the hood. screenDom is a scoped wrapper around Testing Library queries. You get the same semantic selectors — TWD just adds the runner, sidebar, and mocking layer on top.'
  },
  {
    q: 'What frameworks are supported?',
    a: 'React, Vue, Angular, and Solid.js. Anything Vite-based. Not compatible with SSR-first architectures like Next.js App Router (the testing boundary becomes unclear when the server owns rendering).'
  },
  {
    q: 'Can AI actually write good tests?',
    a: "The twd-ai plugin doesn't just generate test files. It runs them, reads real failures, fixes them, checks quality, and finds gaps. The tests execute in a real browser — if they pass, they mean something. And because results come back as structured text over WebSocket (not screenshots or DOM snapshots), token usage is significantly lower than tools like Playwright MCP."
  },
  {
    q: 'Does TWD code ship to production?',
    a: 'No. All TWD imports are guarded by import.meta.env.DEV. Nothing reaches your production bundle.'
  }
]
</script>

<template>
  <div class="home-page" :class="{ 'is-loaded': loaded }">
    <!-- Navigation -->
    <header class="home-nav">
      <nav aria-label="Main navigation">
        <a href="/" class="nav-brand" aria-label="TWD home">
          <span class="nav-brand-mark">TWD</span>
        </a>
        <div class="nav-links">
          <a href="/getting-started">Docs</a>
          <a href="/community#example-repositories">Examples</a>
          <a href="/api/">API Reference</a>
        </div>
      </nav>
    </header>

    <main>
      <!-- Section 1: Hero -->
      <section class="hero">
        <div class="hero-content">
          <p class="hero-eyebrow">Frontend testing ecosystem</p>
          <h1 class="hero-headline">
            <span class="hero-line hero-line--1">Testing isn't a phase.</span>
            <span class="hero-line hero-line--2">It's how you build.</span>
          </h1>
          <p class="hero-sub">
            Write tests while you develop, in your real browser.
            Let the AI agent iterate. Validate every mock against the real API before you merge.
          </p>
          <div class="hero-actions">
            <a href="/getting-started" class="btn btn-brand">
              <span>Get Started</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
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
            <div class="pain-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M17 17l2 2" stroke="var(--hp-danger)" stroke-width="2" stroke-linecap="round"/></svg>
            </div>
            <h3 class="pain-title">Testing is always last</h3>
            <p class="pain-desc">
              Every sprint, testing gets pushed to "next week." Next week never comes.
              The codebase grows. The debt compounds.
            </p>
          </div>
          <div class="pain-card">
            <div class="pain-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 9l6 6M15 9l-6 6" stroke="var(--hp-danger)" stroke-width="2" stroke-linecap="round"/></svg>
            </div>
            <h3 class="pain-title">AI writes tests that don't run</h3>
            <p class="pain-desc">
              Your agent generates test files. They look correct. They never execute
              in a real browser. No one notices until someone does.
            </p>
          </div>
          <div class="pain-card">
            <div class="pain-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/><path d="M8 8l8 8" stroke="var(--hp-danger)" stroke-width="2.5" stroke-linecap="round"/></svg>
            </div>
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

        <!-- Desktop: SVG circular diagram -->
        <div class="pipeline-desktop" aria-hidden="true">
          <svg viewBox="0 0 800 420" xmlns="http://www.w3.org/2000/svg" class="pipeline-svg" focusable="false">
            <!-- Subtle radial glow in center -->
            <defs>
              <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="var(--vp-c-brand-1)" stop-opacity="0.06"/>
                <stop offset="100%" stop-color="var(--vp-c-brand-1)" stop-opacity="0"/>
              </radialGradient>
              <marker id="arr-teal" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--vp-c-brand-1)"/>
              </marker>
              <marker id="arr-green" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--pipeline-green)"/>
              </marker>
            </defs>
            <circle cx="400" cy="220" r="140" fill="url(#center-glow)"/>

            <!-- Center text -->
            <text x="400" y="214" text-anchor="middle" fill="var(--vp-c-brand-1)" font-size="18" font-weight="700" opacity="0.55" letter-spacing="0.15em">TWD</text>
            <text x="400" y="232" text-anchor="middle" fill="var(--vp-c-text-2)" font-size="10" opacity="0.7" letter-spacing="0.04em">test what you own</text>
            <text x="400" y="246" text-anchor="middle" fill="var(--vp-c-text-2)" font-size="10" opacity="0.7" letter-spacing="0.04em">mock what you don't</text>

            <!-- Stage 1: Top — DEVELOP + TEST (CORE) -->
            <rect x="280" y="50" width="240" height="88" rx="12" fill="var(--pipeline-card-bg)" stroke="var(--vp-c-brand-1)" stroke-width="2"/>
            <rect x="430" y="42" width="60" height="18" rx="9" fill="var(--vp-c-brand-1)"/>
            <text x="460" y="55" text-anchor="middle" fill="var(--pipeline-badge-text)" font-size="9" font-weight="700" letter-spacing="0.05em">CORE</text>
            <text x="305" y="80" fill="var(--vp-c-brand-1)" font-size="10" font-weight="700" letter-spacing="0.08em">DEVELOP + TEST</text>
            <text x="305" y="100" fill="var(--vp-c-text-1)" font-size="15" font-weight="700">twd-js</text>
            <text x="305" y="120" fill="var(--vp-c-text-3)" font-size="11">Sidebar in your browser</text>

            <!-- Stage 2: Right — AI AGENT (optional) -->
            <rect x="560" y="155" width="220" height="88" rx="12" fill="var(--pipeline-card-bg)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" stroke-dasharray="6,4"/>
            <rect x="690" y="147" width="72" height="20" rx="10" fill="var(--vp-c-bg)" stroke="var(--vp-c-brand-1)" stroke-width="1.2"/>
            <text x="726" y="161" text-anchor="middle" fill="var(--vp-c-brand-1)" font-size="10" font-weight="700" letter-spacing="0.03em">optional</text>
            <text x="585" y="185" fill="var(--vp-c-brand-1)" font-size="10" font-weight="700" letter-spacing="0.08em">AI AGENT</text>
            <text x="585" y="207" fill="var(--vp-c-text-1)" font-size="13" font-weight="600">twd-relay + twd-ai</text>
            <text x="585" y="227" fill="var(--vp-c-text-3)" font-size="11">Write, run, fix, repeat</text>

            <!-- Stage 3: Bottom-right — CI PIPELINE (optional) -->
            <rect x="490" y="290" width="220" height="88" rx="12" fill="var(--pipeline-card-bg)" stroke="var(--vp-c-brand-1)" stroke-width="1.5" stroke-dasharray="6,4"/>
            <rect x="620" y="282" width="72" height="20" rx="10" fill="var(--vp-c-bg)" stroke="var(--vp-c-brand-1)" stroke-width="1.2"/>
            <text x="656" y="296" text-anchor="middle" fill="var(--vp-c-brand-1)" font-size="10" font-weight="700" letter-spacing="0.03em">optional</text>
            <text x="515" y="320" fill="var(--vp-c-brand-1)" font-size="10" font-weight="700" letter-spacing="0.08em">CI PIPELINE</text>
            <text x="515" y="342" fill="var(--vp-c-text-1)" font-size="13" font-weight="600">twd-cli</text>
            <text x="515" y="362" fill="var(--vp-c-text-3)" font-size="11">Headless tests + coverage</text>

            <!-- Stage 4: Bottom-left — VALIDATE CONTRACTS (optional, gold) -->
            <rect x="90" y="290" width="240" height="88" rx="12" fill="var(--pipeline-card-bg)" stroke="var(--pipeline-gold)" stroke-width="1.5" stroke-dasharray="6,4"/>
            <rect x="240" y="282" width="72" height="20" rx="10" fill="var(--vp-c-bg)" stroke="var(--pipeline-gold)" stroke-width="1.2"/>
            <text x="276" y="296" text-anchor="middle" fill="var(--pipeline-gold)" font-size="10" font-weight="700" letter-spacing="0.03em">optional</text>
            <text x="115" y="320" fill="var(--pipeline-gold)" font-size="10" font-weight="700" letter-spacing="0.08em">VALIDATE CONTRACTS</text>
            <text x="115" y="342" fill="var(--vp-c-text-1)" font-size="13" font-weight="600">openapi-mock-validator</text>
            <text x="115" y="362" fill="var(--vp-c-text-3)" font-size="11">Every mock vs the real spec</text>

            <!-- Stage 5: Left — SHIP (green) -->
            <rect x="20" y="155" width="220" height="88" rx="12" fill="var(--pipeline-card-bg)" stroke="var(--pipeline-green)" stroke-width="2"/>
            <text x="45" y="185" fill="var(--pipeline-green)" font-size="10" font-weight="700" letter-spacing="0.08em">SHIP</text>
            <text x="45" y="207" fill="var(--vp-c-text-1)" font-size="15" font-weight="700">Merge with confidence</text>
            <text x="45" y="227" fill="var(--vp-c-text-3)" font-size="11">Contracts validated, tests green</text>

            <!-- Arrows — clockwise flow -->
            <path d="M520 104 C555 120, 568 145, 565 155" stroke="var(--vp-c-brand-1)" stroke-width="1.5" fill="none" marker-end="url(#arr-teal)" opacity="0.45"/>
            <path d="M675 243 C678 265, 660 280, 640 290" stroke="var(--vp-c-brand-1)" stroke-width="1.5" fill="none" marker-end="url(#arr-teal)" opacity="0.45"/>
            <path d="M490 340 C440 358, 390 358, 330 340" stroke="var(--vp-c-brand-1)" stroke-width="1.5" fill="none" marker-end="url(#arr-teal)" opacity="0.45"/>
            <path d="M125 290 C110 270, 110 255, 120 243" stroke="var(--vp-c-brand-1)" stroke-width="1.5" fill="none" marker-end="url(#arr-teal)" opacity="0.45"/>
            <path d="M140 155 C150 125, 215 90, 280 84" stroke="var(--pipeline-green)" stroke-width="1.5" fill="none" marker-end="url(#arr-green)" opacity="0.45"/>
          </svg>
        </div>

        <!-- Mobile: Linearized vertical flow -->
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

      <!-- Section 4: Quick Start -->
      <section class="quick-start">
        <h2 class="section-title">Quick Start</h2>

        <div class="steps">
          <div class="step">
            <div class="step-marker" aria-hidden="true">
              <span class="step-number">1</span>
              <span class="step-line"></span>
            </div>
            <div class="step-content">
              <h3 class="step-title">Install and add to your entry point</h3>
              <div class="code-block">
                <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">terminal</span></div>
                <pre><code>npm install twd-js</code></pre>
              </div>
              <div class="code-block">
                <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">src/main.tsx</span></div>
                <pre><code><span class="hl-comment">// Only load TWD in development</span>
<span class="hl-keyword">if</span> (<span class="hl-meta">import.meta.env.DEV</span>) {
  <span class="hl-keyword">const</span> { initTWD } = <span class="hl-keyword">await</span> <span class="hl-keyword">import</span>(<span class="hl-string">'twd-js/bundled'</span>);
  <span class="hl-keyword">const</span> tests = <span class="hl-meta">import.meta.glob</span>(<span class="hl-string">"./**/*.twd.test.ts"</span>);
  <span class="hl-func">initTWD</span>(tests, { <span class="hl-prop">open</span>: <span class="hl-keyword">true</span> });
}</code></pre>
              </div>
            </div>
          </div>

          <div class="step">
            <div class="step-marker" aria-hidden="true">
              <span class="step-number">2</span>
              <span class="step-line"></span>
            </div>
            <div class="step-content">
              <h3 class="step-title">Write a test</h3>
              <div class="code-block">
                <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">src/App.twd.test.ts</span></div>
                <pre><code><span class="hl-keyword">import</span> { twd, userEvent, screenDom } <span class="hl-keyword">from</span> <span class="hl-string">"twd-js"</span>;
<span class="hl-keyword">import</span> { describe, it } <span class="hl-keyword">from</span> <span class="hl-string">"twd-js/runner"</span>;

<span class="hl-func">describe</span>(<span class="hl-string">"App"</span>, () => {
  <span class="hl-func">it</span>(<span class="hl-string">"should render the heading"</span>, <span class="hl-keyword">async</span> () => {
    <span class="hl-keyword">await</span> twd.<span class="hl-func">visit</span>(<span class="hl-string">"/"</span>);
    <span class="hl-keyword">const</span> heading = screenDom.<span class="hl-func">getByRole</span>(<span class="hl-string">"heading"</span>, { <span class="hl-prop">level</span>: <span class="hl-num">1</span> });
    twd.<span class="hl-func">should</span>(heading, <span class="hl-string">"be.visible"</span>);
  });
});</code></pre>
              </div>
            </div>
          </div>

          <div class="step step--last">
            <div class="step-marker" aria-hidden="true">
              <span class="step-number">3</span>
            </div>
            <div class="step-content">
              <h3 class="step-title">Run your dev server and see results</h3>
              <div class="code-block code-block--compact">
                <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">terminal</span></div>
                <pre><code>npm run dev</code></pre>
              </div>
              <p class="step-desc">
                The sidebar appears in your browser. Click play to run any test.
              </p>
              <img
                src="/images/twd_side_bar_success.png"
                alt="TWD sidebar showing passing tests in the browser"
                class="step-img"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Section 5: FAQ -->
      <section class="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading" class="section-title">Frequently Asked Questions</h2>
        <div class="faq-grid">
          <details v-for="(faq, i) in faqs" :key="i" class="faq-item">
            <summary class="faq-question">{{ faq.q }}</summary>
            <p class="faq-answer">{{ faq.a }}</p>
          </details>
        </div>
      </section>

      <!-- Section 6: Manifesto Quote -->
      <section class="manifesto-quote">
        <blockquote class="manifesto-text">
          TWD isn't about writing <em>more</em> tests — it's about writing the <em>right</em> ones, at the right time.
        </blockquote>
        <a href="/twd-manifesto" class="manifesto-link">Read the full manifesto &rarr;</a>
      </section>

      <!-- Section 7: Final CTA -->
      <section class="final-cta">
        <div class="cta-install">
          <code class="cta-code"><span class="cta-prompt">$</span> npm install twd-js</code>
        </div>
        <a href="/getting-started" class="btn btn-brand">
          <span>Get started</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </section>

      <div style="height: 80px;"></div>
    </main>
  </div>
</template>

<style scoped>
/* ============================================
   Design tokens (homepage-specific)
   ============================================ */
.home-page {
  --hp-max-w: 1100px;
  --hp-gutter: 24px;
  --hp-radius: 10px;
  --hp-danger: #e5534b;
  --hp-code-bg: rgba(0,0,0,0.03);
  --hp-surface: var(--vp-c-bg-soft);
  --hp-border: var(--vp-c-border);
  --hp-section-gap: 96px;

  max-width: var(--hp-max-w);
  margin: 0 auto;
  padding: 0 var(--hp-gutter);
}

:global(.dark) .home-page {
  --hp-danger: #f85149;
  --hp-code-bg: rgba(255,255,255,0.04);
}

/* ============================================
   Entrance animation
   ============================================ */
.home-page.is-loaded .hero-eyebrow,
.home-page.is-loaded .hero-line,
.home-page.is-loaded .hero-sub,
.home-page.is-loaded .hero-actions {
  opacity: 1;
  transform: translateY(0);
}

.hero-eyebrow,
.hero-line,
.hero-sub,
.hero-actions {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.hero-eyebrow { transition-delay: 0s; }
.hero-line--1 { transition-delay: 0.08s; }
.hero-line--2 { transition-delay: 0.16s; }
.hero-sub { transition-delay: 0.28s; }
.hero-actions { transition-delay: 0.38s; }

/* ============================================
   Navigation
   ============================================ */
.home-nav nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.nav-brand {
  text-decoration: none;
}

.nav-brand-mark {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--vp-c-brand-1);
  border: 2px solid var(--vp-c-brand-1);
  padding: 4px 10px;
  border-radius: 6px;
}

.nav-links {
  display: flex;
  gap: 28px;
}

.nav-links a {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-decoration: none;
  letter-spacing: 0.01em;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--vp-c-text-1);
}

/* Utility */
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

/* ============================================
   Hero
   ============================================ */
.hero {
  text-align: center;
  padding: 80px 0 var(--hp-section-gap);
}

.hero-eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 20px;
  padding: 6px 16px;
  border: 1px solid var(--vp-c-brand-soft);
  border-radius: 100px;
}

.hero-headline {
  font-size: 3.5rem;
  line-height: 1.1;
  font-weight: 800;
  color: var(--vp-c-text-1);
  letter-spacing: -0.03em;
}

.hero-line {
  display: block;
}

.hero-sub {
  margin-top: 28px;
  font-size: 1.125rem;
  line-height: 1.75;
  color: var(--vp-c-text-2);
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 36px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-brand {
  background: var(--vp-c-brand-1);
  color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px var(--vp-c-brand-1);
}

.btn-brand:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 1px var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.btn-outline {
  border: 1px solid var(--hp-border);
  color: var(--vp-c-text-1);
  background: transparent;
}

.btn-outline:hover {
  border-color: var(--vp-c-text-3);
  background: var(--hp-code-bg);
}

/* ============================================
   Pain Points
   ============================================ */
.pain-points {
  padding-bottom: var(--hp-section-gap);
}

.pain-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.pain-card {
  padding: 32px 28px;
  border-radius: var(--hp-radius);
  border: 1px solid var(--hp-border);
  background: var(--hp-surface);
  transition: border-color 0.2s;
}

.pain-card:hover {
  border-color: var(--vp-c-text-3);
}

.pain-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--hp-code-bg);
  color: var(--vp-c-text-2);
  margin-bottom: 20px;
}

.pain-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.pain-desc {
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

/* ============================================
   Section shared
   ============================================ */
.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  letter-spacing: -0.02em;
}

.section-sub {
  text-align: center;
  color: var(--vp-c-text-2);
  margin-top: 10px;
  font-size: 1rem;
}

/* ============================================
   Pipeline
   ============================================ */
.pipeline {
  padding-bottom: var(--hp-section-gap);
}

.pipeline-desktop {
  margin-top: 48px;
}

.pipeline-svg {
  width: 100%;
  max-width: 800px;
  height: auto;
  display: block;
  margin: 0 auto;
}

.pipeline-mobile {
  margin-top: 32px;
}

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
  padding: 20px 24px;
  border-radius: var(--hp-radius);
  border: 1.5px solid var(--hp-border);
  background: var(--hp-surface);
  position: relative;
}

.pipeline-stage--core {
  border-color: var(--vp-c-brand-1);
  border-width: 2px;
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
  padding: 2px 12px;
  border-radius: 10px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  background: var(--vp-c-bg);
}

.pipeline-badge--core {
  background: var(--vp-c-brand-1);
  color: var(--pipeline-badge-text);
}

.pipeline-badge--optional {
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  opacity: 0.7;
}

.pipeline-badge--gold {
  border: 1px solid var(--pipeline-gold);
  color: var(--pipeline-gold);
  opacity: 0.7;
}

.pipeline-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.pipeline-label--gold { color: var(--pipeline-gold); }
.pipeline-label--green { color: var(--pipeline-green); }

.pipeline-pkg {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.pipeline-desc {
  font-size: 0.8125rem;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}

.pipeline-arrow {
  width: 2px;
  height: 24px;
  background: var(--vp-c-brand-1);
  margin: 0 auto;
  opacity: 0.25;
  position: relative;
}

.pipeline-arrow::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: -3px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid var(--vp-c-brand-1);
}

.pipeline-arrow--green { background: var(--pipeline-green); }
.pipeline-arrow--green::after { border-top-color: var(--pipeline-green); }

/* ============================================
   Quick Start
   ============================================ */
.quick-start {
  padding-bottom: var(--hp-section-gap);
}

.steps {
  margin-top: 48px;
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
}

.step {
  display: flex;
  gap: 24px;
}

.step-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 36px;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-line {
  flex: 1;
  width: 2px;
  background: var(--hp-border);
  margin: 8px 0;
}

.step-content {
  flex: 1;
  min-width: 0;
  padding-bottom: 40px;
}

.step--last .step-content {
  padding-bottom: 0;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.step-desc {
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
  margin-top: 12px;
}

/* Code blocks with window chrome */
.code-block {
  margin-top: 12px;
  border-radius: var(--hp-radius);
  border: 1px solid var(--hp-border);
  overflow: hidden;
  background: var(--hp-surface);
}

.code-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--hp-border);
  background: var(--hp-code-bg);
}

.code-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
  opacity: 0.25;
}

.code-filename {
  margin-left: 8px;
  font-size: 0.6875rem;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  letter-spacing: 0.02em;
}

.code-block pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

.code-block code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--vp-c-text-1);
  white-space: pre;
}

/* Minimal syntax hint colors */
.hl-keyword { color: var(--vp-c-brand-1); }
.hl-string { color: var(--pipeline-green); }
.hl-comment { color: var(--vp-c-text-3); font-style: italic; }
.hl-func { color: var(--vp-c-text-1); }
.hl-meta { color: var(--pipeline-gold); }
.hl-prop { color: var(--vp-c-text-2); }
.hl-num { color: var(--pipeline-gold); }

.step-img {
  margin-top: 16px;
  width: 100%;
  border-radius: var(--hp-radius);
  border: 1px solid var(--hp-border);
}

/* ============================================
   FAQ
   ============================================ */
.faq {
  padding-bottom: var(--hp-section-gap);
}

.faq-grid {
  margin-top: 36px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.faq-item {
  border: 1px solid var(--hp-border);
  border-radius: var(--hp-radius);
  background: var(--hp-surface);
  overflow: hidden;
  transition: border-color 0.2s;
}

.faq-item:hover {
  border-color: var(--vp-c-text-3);
}

.faq-question {
  padding: 18px 22px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.faq-question::-webkit-details-marker {
  display: none;
}

.faq-question::before {
  content: '+';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: var(--hp-code-bg);
  color: var(--vp-c-brand-1);
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
  transition: transform 0.2s;
}

details[open] .faq-question::before {
  content: '\2212';
  transform: rotate(0deg);
}

.faq-answer {
  padding: 0 22px 18px 52px;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

/* ============================================
   Manifesto Quote
   ============================================ */
.manifesto-quote {
  padding-bottom: var(--hp-section-gap);
  text-align: center;
}

.manifesto-text {
  font-size: 1.625rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  font-style: italic;
  max-width: 600px;
  margin: 0 auto;
  border: none;
  padding: 0;
  letter-spacing: -0.01em;
}

.manifesto-text em {
  color: var(--vp-c-brand-1);
  font-style: italic;
}

.manifesto-link {
  display: inline-block;
  margin-top: 24px;
  font-size: 0.9375rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}

.manifesto-link:hover {
  opacity: 0.75;
}

/* ============================================
   Final CTA
   ============================================ */
.final-cta {
  text-align: center;
  padding: 48px 0 16px;
  border-top: 1px solid var(--hp-border);
}

.cta-install {
  margin-bottom: 24px;
}

.cta-code {
  display: inline-block;
  padding: 14px 28px;
  border-radius: var(--hp-radius);
  background: var(--hp-surface);
  border: 1px solid var(--hp-border);
  font-size: 1rem;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
  letter-spacing: 0.02em;
}

.cta-prompt {
  color: var(--vp-c-brand-1);
  margin-right: 6px;
  user-select: none;
}

/* ============================================
   Responsive
   ============================================ */
@media (max-width: 768px) {
  .home-page {
    --hp-section-gap: 64px;
  }

  .pain-cards {
    grid-template-columns: 1fr;
  }

  .pipeline-desktop {
    display: none;
  }

  .pipeline-mobile {
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

  .faq-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.625rem;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 48px 0 var(--hp-section-gap);
  }

  .hero-headline {
    font-size: 2.25rem;
  }

  .hero-sub {
    font-size: 1rem;
  }

  .nav-links {
    gap: 16px;
  }

  .nav-links a {
    font-size: 0.75rem;
  }

  .step-marker {
    width: 28px;
  }

  .step-number {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  .manifesto-text {
    font-size: 1.25rem;
  }
}
</style>
