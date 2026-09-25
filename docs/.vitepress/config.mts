import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "TWD",
  description: "Frontend tests that run in the browser you develop in. Your AI agent writes, runs and fixes them headlessly. React, Vue, Angular, Solid, Astro, Nuxt, HTMX.",
  base: '/',
  cleanUrls: true,
  sitemap: {
    hostname: 'https://twd.dev'
  },
  appearance: { initialValue: 'dark' },
  head: [
    // Favicon and app icons
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    
    // SEO Meta Tags
    ['meta', { name: 'keywords', content: 'testing, deterministic, twd-cli, headless-testing, claude-code, ai-coding-agent, agent-skills, pr-recording, test-recording, browser-validation, ai-testing, ai-agent, react, vue, angular, solidjs, astro, nuxt, react-router, htmx, vanilla-js, javascript, typescript, twd, test-while-developing, browser-testing, mock-service-worker, vite, webpack, cdn, esm, contract-testing, openapi, code-coverage, component-testing, unit-testing, jsdom, testing-library, browser-component-tests' }],

    // Open Graph Tags
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'TWD — Frontend tests that run in the browser you develop in' }],
    ['meta', { property: 'og:description', content: 'A sidebar in your dev server runs component and flow tests against your real app. Your AI agent writes them, runs them headlessly with twd-cli and fixes them until green, and every pull request can get a video per test.' }],
    ['meta', { property: 'og:url', content: 'https://twd.dev/' }],
    ['meta', { property: 'og:site_name', content: 'TWD' }],
    ['meta', { property: 'og:image', content: 'https://twd.dev/twd-og.png' }],
    ['meta', { property: 'og:image:type', content: 'image/png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'TWD: frontend tests that run in the browser you develop in, with the TWD sidebar running tests next to the app' }],

    // Twitter Card Tags
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'TWD — Frontend tests that run in the browser you develop in' }],
    ['meta', { name: 'twitter:description', content: 'Frontend tests against your real app. Your AI agent writes, runs and fixes them headlessly, and every pull request can get a video per test.' }],
    ['meta', { name: 'twitter:image', content: 'https://twd.dev/twd-og.png' }],
    ['meta', { name: 'twitter:image:alt', content: 'TWD: frontend tests that run in the browser you develop in, with the TWD sidebar running tests next to the app' }],

    // Additional Meta Tags (TWD brand: darker teal for light theme)
    ['meta', { name: 'theme-color', content: '#123956' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],

    // Umami analytics (cookieless, EU region)
    ['script', { defer: '', src: 'https://cloud.umami.is/script.js', 'data-website-id': '3d4e6e8c-3498-4652-8a3b-f49a734004c8' }],

    // Structured data (SoftwareApplication) for rich search results
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TWD (Test While Developing)',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      description: 'Frontend tests that run in the browser you develop in. Your AI agent writes, runs and fixes them headlessly. React, Vue, Angular, Solid, Astro, Nuxt, HTMX.',
      url: 'https://twd.dev/',
      author: { '@type': 'Organization', name: 'BRIKEV', url: 'https://github.com/BRIKEV' },
      license: 'https://opensource.org/licenses/MIT',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
    })],

    // Structured data (VideoObject) for the AI agent-loop walkthrough.
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: 'TWD: the AI agent testing loop',
      description: 'An AI agent writes a TWD test, runs it against the real app, reads the failure, fixes it, and re-runs until green. Results come back as structured text, not screenshots.',
      thumbnailUrl: 'https://twd.dev/images/twd-agent-loop-poster.jpg',
      uploadDate: '2026-07-24',
      duration: 'PT1M11S',
      contentUrl: 'https://www.youtube.com/watch?v=0G6xunet-HI',
      embedUrl: 'https://www.youtube.com/embed/0G6xunet-HI',
      publisher: { '@type': 'Organization', name: 'BRIKEV', url: 'https://github.com/BRIKEV' }
    })]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Core Concepts', link: '/getting-started' },
      { text: 'AI agents', link: '/ai-overview' },
      { text: 'API Reference', link: '/api/' }
    ],

    sidebar: [
      {
        text: 'Core Concepts',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Writing Tests', link: '/writing-tests' },
          { text: 'API Mocking', link: '/api-mocking' },
          { text: 'Component Testing', link: '/component-testing' },
          { text: 'Component Mocking', link: '/component-mocking' },
          { text: 'Module Mocking', link: '/module-mocking' },
          { text: 'Theming', link: '/theming' },
          { text: 'CI Execution', link: '/ci-execution' },
          { text: 'Recording Runs', link: '/recording' },
          { text: 'Coverage', link: '/coverage' },
          { text: 'Contract Testing Setup', link: '/contract-testing-setup' },
          { text: 'Framework Integration', link: '/frameworks' },
          { text: 'Testing Library', link: '/testing-library' },
          { text: 'Sharding (beta)', link: '/sharding' },
          { text: 'Layout Snapshots (beta)', link: '/layout-snapshots' },
        ]
      },
      {
        text: 'AI agents',
        items: [
          { text: 'Get started', link: '/ai-overview' },
          { text: 'Project setup', link: '/twd-ai/setup' },
          { text: 'Writing & running tests', link: '/twd-ai/writing-tests' },
          { text: 'CI setup', link: '/twd-ai/ci-setup' },
          { text: 'Test gap analysis', link: '/twd-ai/test-gaps' },
          { text: 'Test quality', link: '/twd-ai/test-quality' },
          { text: 'Test flow gallery', link: '/twd-ai/flow-gallery' },
          { text: 'Watch your agent live', link: '/ai-remote-testing' },
          { text: 'Context & prompts', link: '/agents' },
        ]
      },
      {
        text: 'Philosophy',
        items: [
          { text: 'TWD Manifesto', link: '/twd-manifesto' },
          { text: 'Why Test While Developing', link: '/motivation' },
        ]
      },
      {
        text: 'Community',
        items: [
          { text: 'Community & Examples', link: '/community' },
          { text: 'Accessibility Statement', link: '/accessibility-statement' },
        ]
      },
      {
        text: 'Tutorial',
        items: [
          { text: 'Overview', link: '/tutorial/' },
          { text: 'Introduction', link: '/tutorial/intro' },
          { text: 'Installation', link: '/tutorial/installation' },
          { text: 'First Test', link: '/tutorial/first-test' },
          { text: 'API Mocking', link: '/tutorial/api-mocking' },
          { text: 'CI Integration', link: '/tutorial/ci-integration' },
          { text: 'Code Coverage', link: '/tutorial/coverage' },
          { text: 'Production Builds', link: '/tutorial/production-builds' },
          { text: 'Using Testing Library Selectors', link: '/tutorial/testing-library-selectors' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/' },
          { text: 'Test Functions', link: '/api/test-functions' },
          { text: 'TWD Commands', link: '/api/twd-commands' },
          { text: 'Assertions', link: '/api/assertions' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/BRIKEV/twd' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/twd-js' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 BRIKEV'
    },

    search: {
      provider: 'local'
    }
  }
})
