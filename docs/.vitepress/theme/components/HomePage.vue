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
        <h1>Testing isn't a phase. It's how you build.</h1>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

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

.hero {
  text-align: center;
  padding: 80px 0 60px;
}

.hero h1 {
  font-size: 2.5rem;
  line-height: 1.2;
  color: var(--vp-c-text-1);
}

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

@media (max-width: 640px) {
  .hero {
    padding: 48px 0 40px;
  }
  .hero h1 {
    font-size: 1.75rem;
  }
  .nav-links {
    gap: 16px;
  }
  .nav-links a {
    font-size: 0.8125rem;
  }
}
</style>
