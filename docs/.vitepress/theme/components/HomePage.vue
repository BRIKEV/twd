<script setup>
import { ref, onMounted } from 'vue'
import ThesisBanner from './ThesisBanner.vue'
import DeferredVideo from './DeferredVideo.vue'
import InstallCommand from './InstallCommand.vue'
import RecordReview from './RecordReview.vue'

const loaded = ref(false)

// Quick start tabs: agent paths first, the hand-written install last.
const quickStartTabs = [
  { id: 'claude', label: 'Claude Code' },
  { id: 'agents', label: 'Other agents' },
  { id: 'manual', label: 'Manual install' },
]
const quickStartTab = ref('claude')

function onTabKey(event, index) {
  const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (!step) return
  event.preventDefault()
  const next = quickStartTabs[(index + step + quickStartTabs.length) % quickStartTabs.length]
  quickStartTab.value = next.id
  document.getElementById(`qs-tab-${next.id}`)?.focus()
}

onMounted(() => {
  requestAnimationFrame(() => { loaded.value = true })
})

const youtubeWatchUrl = 'https://www.youtube.com/watch?v=0G6xunet-HI'
const calendlyUrl = 'https://calendly.com/kevinccbsg/30min'

const faqs = [
  {
    q: 'What does TWD cost?',
    a: 'Nothing. twd-js, twd-relay, twd-cli and the twd-ai plugin are MIT licensed and free to use, for individuals and for companies, with no paid tier and no usage limits. If your team wants a hand adopting it, book a session above.'
  },
  {
    q: 'How is this different from Playwright or Cypress?',
    a: 'TWD validates your frontend UI logic with mocked boundaries. Playwright and Cypress validate that your systems work together end to end. They complement each other: TWD for fast deterministic feedback while you develop, end-to-end tests for full integration in CI.'
  },
  {
    q: 'How is this different from Vitest Browser Mode?',
    a: 'Vitest Browser Mode mounts your component in a purpose-built harness page. TWD runs inside your actual dev server, so both styles are available: drive the whole app through its real routes, or call Testing Library render() to mount a single component. Either way the providers, router and network around it are the real ones, and both run in the same session under one coverage report.'
  },
  {
    q: 'Do I have to drop my Vitest tests?',
    a: 'No. Pure functions, reducers, formatters and hooks tested in isolation are fine in jsdom, and moving them buys you nothing. The ones worth moving are the component tests where you had to mock a hook, a context or a component from your own src/ just to get the component to render, because there the stub sits between your assertion and the behaviour you meant to check.'
  },
  {
    q: 'Does this replace Testing Library?',
    a: 'No. TWD uses Testing Library under the hood. screenDom is a scoped wrapper around Testing Library queries, so you get the same semantic selectors. TWD adds the runner, the sidebar and the mocking layer on top.'
  },
  {
    q: 'What frameworks are supported?',
    a: 'Any frontend that renders in the browser: SPAs like React, Vue, Angular and Solid; hydrated SSR like React Router and Nuxt; Astro islands; and no-build projects like HTMX and vanilla JS via a CDN. On Vite, Webpack, or no bundler at all. The one setup TWD does not target is where the server owns rendering, as with React Server Components in the Next.js App Router, since there is no explicit browser boundary to test there yet.'
  },
  {
    q: 'Can AI actually write good tests?',
    a: 'The twd-ai plugin does more than generate test files. It runs them, reads real failures, fixes them, checks quality and finds gaps. The tests execute in a real browser against your real app, so a pass means something. twd-cli runs them headlessly and prints one structured summary rather than screenshots or DOM snapshots, which keeps token usage well below tools like Playwright MCP.'
  },
  {
    q: 'How does the record label work?',
    a: 'It is a GitHub Action that ships with twd-cli. Put a record label on a pull request and a job records the tests that branch added or changed, one clip per test, then uploads them as an artifact your workflow links from a comment. It runs as a separate job from the one that gates the pull request, so a recording can never cost you the run that matters.'
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
    <header class="home-nav hp-container">
      <nav aria-label="Main navigation">
        <a href="/" class="nav-brand" aria-label="TWD home">
          <span class="nav-brand-mark">TWD</span>
        </a>
        <div class="nav-links">
          <a href="/getting-started">Docs</a>
          <a href="/community#example-repositories">Examples</a>
          <a href="#for-teams">For teams</a>
          <a href="https://github.com/BRIKEV/twd" target="_blank" rel="noopener" class="nav-github">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
            <span class="nav-github-text">GitHub</span>
            <span class="visually-hidden">(opens in new tab)</span>
          </a>
        </div>
      </nav>
    </header>

    <main>
      <!-- Hero -->
      <section class="hero hp-container">
        <div class="hero-grid">
          <div class="hero-content">
            <h1 class="hero-headline">
              <span class="hero-line hero-line--1">Frontend tests that</span>
              <span class="hero-line hero-line--2">run in the browser</span>
              <span class="hero-line hero-line--3">you develop in.</span>
            </h1>
            <p class="hero-sub">
              A sidebar in your dev server runs component and flow tests against your real app.
              Your AI agent can drive the same loop, and every mock gets checked against the real
              API before you merge.
            </p>
            <div class="hero-actions">
              <a href="/getting-started" class="btn btn-brand" data-umami-event="home_hero_get_started">
                <span>Get started</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>
              <InstallCommand umami-event="home_hero_copy_install" />
            </div>
            <p class="hero-note">
              Open source under the MIT license.
            </p>
          </div>
          <div class="hero-visual">
            <DeferredVideo
              mode="eager"
              src="/videos/twd-hero.mp4"
              poster="/images/twd_side_bar_success.png"
              label="TWD sidebar running tests live inside a Vue app: tests cascade green, a test types itself and executes in the browser"
              name="hero animation"
              :width="2080"
              :height="1336"
            />
          </div>
        </div>
      </section>

      <!-- Quick Start -->
      <section class="quick-start hp-container" aria-labelledby="quick-start-heading">
        <div class="quick-start-grid">
          <div class="quick-start-intro">
            <h2 id="quick-start-heading" class="section-title">Up and running in three steps</h2>
            <p class="section-sub">
              Let your AI agent set TWD up and write the first tests, or do it by hand. Either
              way it is one package and one plugin, with no second browser to keep open.
            </p>
            <p class="quick-start-frameworks">
              Works with React, Vue, Angular, Solid, Astro, Nuxt, HTMX and vanilla JS, on Vite,
              Webpack or a CDN.
            </p>
            <ul class="link-list">
              <li><a href="/ai-overview">Get started with AI agents</a></li>
              <li><a href="/getting-started">Manual getting started guide</a></li>
              <li><a href="/frameworks">Setup for your framework</a></li>
            </ul>
          </div>

          <div class="qs-tabs-wrap">
            <div class="qs-tabs" role="tablist" aria-label="How to get started">
              <button
                v-for="(tab, index) in quickStartTabs"
                :id="`qs-tab-${tab.id}`"
                :key="tab.id"
                type="button"
                role="tab"
                class="qs-tab"
                :class="{ 'is-active': quickStartTab === tab.id }"
                :aria-selected="quickStartTab === tab.id"
                :aria-controls="`qs-panel-${tab.id}`"
                :tabindex="quickStartTab === tab.id ? 0 : -1"
                :data-umami-event="`home_quick_start_tab_${tab.id}`"
                @click="quickStartTab = tab.id"
                @keydown="onTabKey($event, index)"
              >
                {{ tab.label }}
              </button>
            </div>

            <ol
              v-show="quickStartTab === 'claude'"
              id="qs-panel-claude"
              class="steps"
              role="tabpanel"
              aria-labelledby="qs-tab-claude"
            >
                <li class="step">
                  <div class="step-marker" aria-hidden="true">
                    <span class="step-number">1</span>
                    <span class="step-line"></span>
                  </div>
                  <div class="step-content">
                    <h3 class="step-title">Install the plugin</h3>
                    <div class="code-block">
                      <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">terminal</span></div>
                      <pre><code>claude plugin marketplace add BRIKEV/twd-ai
claude plugin install twd@twd-ai</code></pre>
                    </div>
                  </div>
                </li>
                <li class="step">
                  <div class="step-marker" aria-hidden="true">
                    <span class="step-number">2</span>
                    <span class="step-line"></span>
                  </div>
                  <div class="step-content">
                    <h3 class="step-title">Set up your project</h3>
                    <div class="code-block code-block--compact">
                      <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">claude code</span></div>
                      <pre><code>/twd:setup</code></pre>
                    </div>
                    <p class="step-desc">
                      Detects your stack, installs twd-js and twd-cli, and wires the Vite plugin.
                    </p>
                  </div>
                </li>
                <li class="step step--last">
                  <div class="step-marker" aria-hidden="true">
                    <span class="step-number">3</span>
                  </div>
                  <div class="step-content">
                    <h3 class="step-title">Ask for tests</h3>
                    <div class="code-block code-block--compact">
                      <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">terminal</span></div>
                      <pre><code>npm run dev</code></pre>
                    </div>
                    <div class="code-block code-block--compact">
                      <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">your agent</span></div>
                      <pre><code>Write tests for the checkout page</code></pre>
                    </div>
                    <p class="step-desc">
                      The agent writes the tests, runs them headlessly with twd-cli against your
                      dev server, fixes what fails and re-runs until green.
                    </p>
                  </div>
                </li>
            </ol>

            <ol
              v-show="quickStartTab === 'agents'"
              id="qs-panel-agents"
              class="steps"
              role="tabpanel"
              aria-labelledby="qs-tab-agents"
            >
                <li class="step">
                  <div class="step-marker" aria-hidden="true">
                    <span class="step-number">1</span>
                    <span class="step-line"></span>
                  </div>
                  <div class="step-content">
                    <h3 class="step-title">Add the skills</h3>
                    <div class="code-block code-block--compact">
                      <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">terminal</span></div>
                      <pre><code>npx skills add BRIKEV/twd-ai</code></pre>
                    </div>
                    <p class="step-desc">
                      Cursor, Copilot, Windsurf, Codex and any agent that reads Agent Skills.
                    </p>
                  </div>
                </li>
                <li class="step">
                  <div class="step-marker" aria-hidden="true">
                    <span class="step-number">2</span>
                    <span class="step-line"></span>
                  </div>
                  <div class="step-content">
                    <h3 class="step-title">Run the setup skill</h3>
                    <div class="code-block code-block--compact">
                      <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">your agent</span></div>
                      <pre><code>Set up TWD for this project</code></pre>
                    </div>
                    <p class="step-desc">
                      Detects your stack, installs twd-js and twd-cli, and wires the Vite plugin.
                    </p>
                  </div>
                </li>
                <li class="step step--last">
                  <div class="step-marker" aria-hidden="true">
                    <span class="step-number">3</span>
                  </div>
                  <div class="step-content">
                    <h3 class="step-title">Ask for tests</h3>
                    <div class="code-block code-block--compact">
                      <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">terminal</span></div>
                      <pre><code>npm run dev</code></pre>
                    </div>
                    <div class="code-block code-block--compact">
                      <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">your agent</span></div>
                      <pre><code>Write tests for the checkout page</code></pre>
                    </div>
                    <p class="step-desc">
                      The agent writes the tests, runs them headlessly with twd-cli against your
                      dev server, fixes what fails and re-runs until green.
                    </p>
                  </div>
                </li>
            </ol>

              <ol
                v-show="quickStartTab === 'manual'"
                id="qs-panel-manual"
                class="steps"
                role="tabpanel"
                aria-labelledby="qs-tab-manual"
              >
              <li class="step">
                <div class="step-marker" aria-hidden="true">
                  <span class="step-number">1</span>
                  <span class="step-line"></span>
                </div>
                <div class="step-content">
                  <h3 class="step-title">Install and add the Vite plugin</h3>
                  <div class="code-block">
                    <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">terminal</span></div>
                    <pre><code>npm install twd-js</code></pre>
                  </div>
                  <div class="code-block">
                    <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">vite.config.ts</span></div>
                    <pre><code><span class="hl-keyword">import</span> { defineConfig } <span class="hl-keyword">from</span> <span class="hl-string">'vite'</span>;
  <span class="hl-keyword">import</span> { twd } <span class="hl-keyword">from</span> <span class="hl-string">'twd-js/vite-plugin'</span>;

  <span class="hl-keyword">export default</span> <span class="hl-func">defineConfig</span>({
    <span class="hl-prop">plugins</span>: [<span class="hl-func">twd</span>({ <span class="hl-prop">open</span>: <span class="hl-keyword">true</span> })],
  });</code></pre>
                  </div>
                </div>
              </li>

              <li class="step">
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
              </li>

              <li class="step step--last">
                <div class="step-marker" aria-hidden="true">
                  <span class="step-number">3</span>
                </div>
                <div class="step-content">
                  <h3 class="step-title">Run your dev server</h3>
                  <div class="code-block code-block--compact">
                    <div class="code-header"><span class="code-dot"></span><span class="code-dot"></span><span class="code-dot"></span><span class="code-filename">terminal</span></div>
                    <pre><code>npm run dev</code></pre>
                  </div>
                  <p class="step-desc">
                    The sidebar appears next to your app. Press play on any test and watch it run
                    against the page you are building.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <!-- AI agent loop -->
      <section class="agent-loop hp-container" aria-labelledby="agent-loop-heading">
        <div class="agent-grid">
          <div class="agent-intro">
            <h2 id="agent-loop-heading" class="section-title">Your agent writes the tests. TWD makes them run.</h2>
            <p class="section-sub">
              The agent writes a test, runs it headlessly against your real app with twd-cli,
              reads the failure, fixes it and re-runs until green. Results come back as
              structured text, not screenshots, so the loop stays cheap in tokens, and nobody
              has to keep a browser tab open. Want to watch it anyway? Add twd-relay and it runs
              in your own tab.
            </p>
            <ul class="link-list">
              <li>
                <a :href="youtubeWatchUrl" target="_blank" rel="noopener" data-umami-event="home_agent_youtube">
                  Watch the narrated walkthrough on YouTube<span class="visually-hidden"> (opens in new tab)</span>
                </a>
              </li>
              <li><a href="/ai-overview">Get started with AI agents</a></li>
              <li><a href="/twd-relay">Watch your agent live with twd-relay</a></li>
            </ul>
          </div>
          <div class="agent-visual">
            <DeferredVideo
              src="/videos/twd-agent-loop.mp4"
              poster="/images/twd-agent-loop-poster.jpg"
              label="An AI agent writes a TWD test, runs it in a real browser, reads the failure, fixes it, and re-runs until all tests pass"
              name="AI loop animation"
            />
          </div>
        </div>
      </section>

      <!-- Review with your eyes -->
      <section class="review hp-container" aria-labelledby="review-heading">
        <h2 id="review-heading" class="section-title">Five green PRs today. What do they look like?</h2>
        <p class="section-sub">
          The diff and the test both tell you what the agent thinks it built. Neither shows what
          the person using the app will see. Put a record label on the pull request, and a minute
          later there is one video per test the branch added.
        </p>

        <RecordReview />

        <div class="review-points">
          <p>
            <strong>Review with your eyes.</strong> Four clips take a minute to watch and tell you
            more than the whole diff. That is cheaper than asking a second agent to summarise what
            the first one did.
          </p>
          <p>
            <strong>No extra tokens.</strong> The recording comes out of your CI, not out of a
            model. Nothing gets summarised and nothing gets re-read.
          </p>
          <p>
            <strong>Deterministic.</strong> The same run that turned the check green produced the
            video. Change the behaviour and the video changes, or the test fails and there is no
            video. It cannot drift from the code.
          </p>
        </div>

        <ul class="link-list">
          <li><a href="/recording#recording-in-ci" data-umami-event="home_review_record_docs">Set up the record job in CI</a></li>
        </ul>
      </section>

      <!-- For teams -->
      <section id="for-teams" class="teams" aria-labelledby="teams-heading">
        <div class="hp-container teams-grid">
          <div class="teams-intro">
            <h2 id="teams-heading" class="section-title teams-title">Bringing TWD to your team?</h2>
            <p class="teams-text">
              TWD is open source and stays that way. If you would rather not do the adoption work
              alone, book a working session with the maintainer. We set TWD up in your repo, wire
              the agent loop and the record job into your CI, and leave you with tests your team
              wrote together.
            </p>
          </div>
          <div class="teams-cta">
            <a :href="calendlyUrl" target="_blank" rel="noopener" class="btn btn-light" data-umami-event="home_teams_book_call">
              <span>Book a 30 minute call</span>
              <span class="visually-hidden">(opens in new tab)</span>
            </a>
            <p class="teams-note">MIT licensed. Free for companies, with no paid tier.</p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="faq hp-container" aria-labelledby="faq-heading">
        <div class="faq-grid">
          <h2 id="faq-heading" class="section-title">Questions</h2>
          <div class="faq-list">
            <details v-for="faq in faqs" :key="faq.q" class="faq-item">
              <summary class="faq-question">
                <span>{{ faq.q }}</span>
                <span class="faq-marker" aria-hidden="true"></span>
              </summary>
              <p class="faq-answer">{{ faq.a }}</p>
            </details>
          </div>
        </div>
      </section>

      <!-- Closing -->
      <section class="closing hp-container">
        <ThesisBanner size="lg" />
        <p class="closing-line">Testing isn't a phase. It's how you build.</p>
        <a href="/twd-manifesto" class="closing-link">Read the manifesto<span class="visually-hidden"> on testing philosophy</span></a>
        <div class="closing-actions">
          <InstallCommand umami-event="home_closing_copy_install" />
          <a href="/getting-started" class="btn btn-brand" data-umami-event="home_closing_get_started">
            <span>Get started</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      </section>

      <footer class="hp-footer hp-container">
        <nav class="hp-footer-links" aria-label="Footer">
          <a href="/accessibility-statement" class="hp-footer-link">Accessibility Statement</a>
          <a href="https://github.com/BRIKEV/twd" target="_blank" rel="noopener" class="hp-footer-link">GitHub<span class="visually-hidden"> (opens in new tab)</span></a>
          <a href="https://www.npmjs.com/package/twd-js" target="_blank" rel="noopener" class="hp-footer-link">npm<span class="visually-hidden"> (opens in new tab)</span></a>
        </nav>
        <p class="hp-footer-meta">Released under the MIT License. Copyright © 2026 BRIKEV.</p>
      </footer>
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
  --hp-measure: 640px;
  --hp-code-bg: rgba(0, 0, 0, 0.03);
  --hp-surface: var(--vp-c-bg-soft);
  --hp-border: var(--vp-c-border);
  --hp-section-gap: 104px;
  /* The one coloured surface on the page: the teams band. Deep brand teal in
     both themes, with white text (11:1). */
  --hp-band-bg: #123956;
  --hp-band-text: #ffffff;
  --hp-band-muted: rgba(255, 255, 255, 0.78);
}

:global(.dark) .home-page {
  --hp-code-bg: rgba(255, 255, 255, 0.04);
  --hp-band-bg: #0f2f47;
}

.hp-container {
  max-width: var(--hp-max-w);
  margin: 0 auto;
  padding-left: var(--hp-gutter);
  padding-right: var(--hp-gutter);
}

/* ============================================
   Entrance animation (hero only, one moment)
   ============================================ */
.hero-line,
.hero-sub,
.hero-actions,
.hero-note {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.home-page.is-loaded .hero-line,
.home-page.is-loaded .hero-sub,
.home-page.is-loaded .hero-actions,
.home-page.is-loaded .hero-note {
  opacity: 1;
  transform: translateY(0);
}

.hero-line--1 { transition-delay: 0.04s; }
.hero-line--2 { transition-delay: 0.1s; }
.hero-line--3 { transition-delay: 0.16s; }
.hero-sub { transition-delay: 0.26s; }
.hero-actions { transition-delay: 0.36s; }
.hero-note { transition-delay: 0.44s; }

@media (prefers-reduced-motion: reduce) {
  .hero-line,
  .hero-sub,
  .hero-actions,
  .hero-note {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

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
  align-items: center;
  gap: 28px;
}

.nav-links a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-decoration: none;
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
   Shared section pieces
   ============================================ */
.section-title {
  font-size: 2rem;
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
  max-width: var(--hp-measure);
  margin: 0;
  text-wrap: balance;
}

.section-sub {
  margin: 14px 0 0;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
  max-width: var(--hp-measure);
}

.link-list {
  list-style: none;
  margin: 24px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.link-list a {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity 0.2s;
}

.link-list a:hover,
.link-list a:focus-visible {
  opacity: 0.75;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 24px;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  cursor: pointer;
}

.btn-brand {
  background: var(--vp-c-brand-btn);
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--vp-c-brand-btn);
}

.btn-brand:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--vp-c-brand-btn);
  transform: translateY(-1px);
}

.btn-light {
  background: #fff;
  color: var(--hp-band-bg);
}

.btn-light:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.4);
}

/* ============================================
   Hero
   ============================================ */
.hero {
  padding-top: 64px;
  padding-bottom: var(--hp-section-gap);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 48px;
  align-items: center;
}

.hero-headline {
  font-size: 3rem;
  line-height: 1.05;
  font-weight: 800;
  color: var(--vp-c-text-1);
  letter-spacing: -0.03em;
  margin: 0;
}

.hero-line {
  display: block;
}

.hero-sub {
  margin: 24px 0 0;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 32px;
  flex-wrap: wrap;
  align-items: center;
}

.hero-note {
  margin: 18px 0 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.hero-visual :deep(.dvideo-media) {
  aspect-ratio: 2080 / 1336;
  border-radius: var(--hp-radius);
  border: 1px solid var(--hp-border);
  box-shadow: 0 16px 48px -12px rgba(0, 0, 0, 0.2);
}

/* ============================================
   Quick Start
   ============================================ */
.quick-start {
  padding-bottom: var(--hp-section-gap);
}

.quick-start-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
  gap: 56px;
  align-items: start;
}

.quick-start-frameworks {
  margin: 20px 0 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
  max-width: 420px;
}

.qs-tabs-wrap {
  min-width: 0;
}

.qs-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 20px;
  padding: 4px;
  border: 1px solid var(--hp-border);
  border-radius: var(--hp-radius);
  background: var(--hp-surface);
  width: fit-content;
  max-width: 100%;
}

.qs-tab {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-2);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: calc(var(--hp-radius) - 4px);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.qs-tab:hover {
  color: var(--vp-c-text-1);
}

.qs-tab.is-active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.qs-tab:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.steps {
  list-style: none;
  margin: 0;
  padding: 0;
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
  margin: 6px 0 12px;
  letter-spacing: -0.01em;
}

.step-desc {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
  margin: 14px 0 0;
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
  /* text-2 (not text-3) to clear AA contrast in both themes (WCAG 1.4.3) */
  color: var(--vp-c-text-2);
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

/* ============================================
   AI agent loop
   ============================================ */
.agent-loop {
  padding-bottom: var(--hp-section-gap);
}

.agent-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr);
  gap: 56px;
  align-items: center;
}

.agent-visual :deep(.dvideo-media) {
  border-radius: var(--hp-radius);
  border: 1px solid var(--hp-border);
  box-shadow: 0 16px 48px -12px rgba(0, 0, 0, 0.2);
}

/* ============================================
   Review (record label)
   ============================================ */
.review {
  padding-bottom: var(--hp-section-gap);
}

.review :deep(.pr) {
  margin-top: 40px;
}

.review-points {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  margin-top: 44px;
  max-width: 1000px;
}

.review-points p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.review-points strong {
  display: block;
  margin-bottom: 4px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.review .link-list {
  margin-top: 32px;
}

/* ============================================
   For teams (full-bleed band)
   ============================================ */
.teams {
  background: var(--hp-band-bg);
  color: var(--hp-band-text);
  padding: 80px 0;
  margin-bottom: var(--hp-section-gap);
}

.teams-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 48px;
  align-items: center;
}

.teams-title {
  color: var(--hp-band-text);
}

.teams-text {
  margin: 16px 0 0;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--hp-band-muted);
  max-width: var(--hp-measure);
}

.teams-cta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.teams-note {
  margin: 0;
  font-size: 0.875rem;
  color: var(--hp-band-muted);
}

/* The site-wide focus ring is text-1, which is dark on light and would vanish
   on the teal band. */
.teams :focus-visible {
  outline-color: #fff;
}

@media (min-width: 901px) {
  .teams-cta {
    align-items: flex-end;
    text-align: right;
  }
}

/* ============================================
   FAQ
   ============================================ */
.faq {
  padding-bottom: var(--hp-section-gap);
}

.faq-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 48px;
  align-items: start;
}

.faq-list {
  border-top: 1px solid var(--hp-border);
}

.faq-item {
  border-bottom: 1px solid var(--hp-border);
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  cursor: pointer;
  list-style: none;
}

.faq-question::-webkit-details-marker {
  display: none;
}

.faq-marker {
  position: relative;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--vp-c-brand-1);
}

.faq-marker::before,
.faq-marker::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 2px;
  background: currentColor;
  transform: translate(-50%, -50%);
  transition: transform 0.2s ease;
}

.faq-marker::after {
  transform: translate(-50%, -50%) rotate(90deg);
}

details[open] .faq-marker::after {
  transform: translate(-50%, -50%) rotate(0deg);
}

.faq-answer {
  margin: 0;
  padding: 0 36px 20px 0;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
  max-width: 680px;
}

/* ============================================
   Closing
   ============================================ */
.closing {
  text-align: center;
  padding-top: 8px;
}

.closing :deep(.thesis-banner) {
  padding-bottom: 24px;
}

.closing-line {
  margin: 0;
  font-size: 1.125rem;
  color: var(--vp-c-text-2);
}

.closing-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity 0.2s;
}

.closing-link:hover {
  opacity: 0.75;
}

.closing-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 40px;
}

/* ============================================
   Footer
   ============================================ */
.hp-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  padding-bottom: 3rem;
  border-top: 1px solid var(--hp-border);
  text-align: center;
}

.hp-footer-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 0.75rem;
}

.hp-footer-link {
  color: var(--vp-c-brand-1);
  font-size: 0.9375rem;
  font-weight: 500;
  /* Underline so the link is distinguished by more than colour (WCAG 1.4.1) */
  text-decoration: underline;
  text-underline-offset: 2px;
}

.hp-footer-link:hover,
.hp-footer-link:focus-visible {
  text-decoration-thickness: 2px;
}

.hp-footer-meta {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  margin: 0;
}

/* ============================================
   Responsive
   ============================================ */
@media (max-width: 900px) {
  .hero-grid,
  .quick-start-grid,
  .agent-grid,
  .teams-grid,
  .faq-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 36px;
  }

  .hero-sub {
    max-width: var(--hp-measure);
  }

  .review-points {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .home-page {
    --hp-section-gap: 64px;
  }

  .section-title {
    font-size: 1.625rem;
  }

  .teams {
    padding: 56px 0;
  }
}

@media (max-width: 640px) {
  .hero {
    padding-top: 40px;
  }

  .hero-headline {
    font-size: 2.25rem;
  }

  .hero-sub {
    font-size: 1rem;
  }

  .nav-links {
    gap: 18px;
  }

  .nav-links a {
    font-size: 0.8125rem;
  }

  .nav-github-text {
    display: none;
  }

  .step {
    gap: 16px;
  }

  .step-marker {
    width: 28px;
  }

  .step-number {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
}
</style>
