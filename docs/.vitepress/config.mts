import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "TWD",
  description: "Test While Developing (TWD) - in-browser testing for React, Vue, Angular, and Solid.js applications",
  base: '/',
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
    ['meta', { name: 'keywords', content: 'testing, deterministic, browser-validation, ai-testing, ai-agent, react, vue, angular, solidjs, javascript, typescript, twd, test-while-developing, browser-testing, mock-service-worker, vite, contract-testing, openapi, code-coverage' }],

    // Open Graph Tags
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'TWD - Test While Developing' }],
    ['meta', { property: 'og:description', content: 'Frontend testing ecosystem. Write tests in your real browser, let the AI agent iterate, validate every mock against the real API. Testing isn\'t a phase — it\'s how you build.' }],
    ['meta', { property: 'og:url', content: 'https://twd.dev/' }],
    ['meta', { property: 'og:site_name', content: 'TWD' }],
    ['meta', { property: 'og:image', content: 'https://twd.dev/twd_ecosystem.png' }],
    ['meta', { property: 'og:image:width', content: '2104' }],
    ['meta', { property: 'og:image:height', content: '1436' }],
    ['meta', { property: 'og:image:alt', content: 'TWD Ecosystem — develop, test, validate, ship' }],

    // Twitter Card Tags
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'TWD - Test While Developing' }],
    ['meta', { name: 'twitter:description', content: 'Frontend testing ecosystem. Write tests in your real browser, let the AI agent iterate, validate every mock against the real API.' }],
    ['meta', { name: 'twitter:image', content: 'https://twd.dev/twd_ecosystem.png' }],
    ['meta', { name: 'twitter:image:alt', content: 'TWD Ecosystem — develop, test, validate, ship' }],

    // Additional Meta Tags (TWD brand: darker teal for light theme)
    ['meta', { name: 'theme-color', content: '#123956' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Core Concepts', link: '/getting-started' },
      { text: 'AI Workflow', link: '/twd-ai/setup' },
      { text: 'API Reference', link: '/api/' }
    ],

    sidebar: [
      {
        text: 'Core Concepts',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Writing Tests', link: '/writing-tests' },
          { text: 'API Mocking', link: '/api-mocking' },
          { text: 'Component Mocking', link: '/component-mocking' },
          { text: 'Module Mocking', link: '/module-mocking' },
          { text: 'Theming', link: '/theming' },
          { text: 'CI Execution', link: '/ci-execution' },
          { text: 'Coverage', link: '/coverage' },
          { text: 'Contract Testing', link: '/contract-testing' },
          { text: 'Framework Integration', link: '/frameworks' },
          { text: 'Testing Library', link: '/testing-library' },
        ]
      },
      {
        text: 'AI Workflow',
        items: [
          { text: 'Project Setup', link: '/twd-ai/setup' },
          { text: 'Writing Tests', link: '/twd-ai/writing-tests' },
          { text: 'CI Setup', link: '/twd-ai/ci-setup' },
          { text: 'Test Gap Analysis', link: '/twd-ai/test-gaps' },
          { text: 'Test Quality', link: '/twd-ai/test-quality' },
          { text: 'Test Flow Gallery', link: '/twd-ai/flow-gallery' },
        ]
      },
      {
        text: 'AI Reference',
        items: [
          { text: 'Overview', link: '/ai-overview' },
          { text: 'Claude Code Plugin', link: '/claude-plugin' },
          { text: 'AI Context & Prompts', link: '/agents' },
          { text: 'AI Remote Testing', link: '/ai-remote-testing' },
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
      copyright: 'Copyright © 2025 BRIKEV'
    },

    search: {
      provider: 'local'
    }
  }
})
