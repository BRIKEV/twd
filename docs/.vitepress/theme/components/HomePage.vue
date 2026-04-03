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
</style>
