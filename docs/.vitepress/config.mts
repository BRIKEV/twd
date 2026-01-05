import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "TWD",
  description: "Test While Developing (TWD) - in-browser testing for React applications",
  base: '/',
  head: [
    // Favicon and app icons
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    
    // SEO Meta Tags
    ['meta', { name: 'description', content: 'TWD (Test While Developing) - In-browser testing framework for React applications with instant feedback, Mock Service Worker integration, and beautiful UI.' }],
    ['meta', { name: 'keywords', content: 'testing, react, javascript, typescript, twd, test-driven-development, browser-testing, mock-service-worker, vite' }],
    
    // Open Graph Tags
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'TWD - Test While Developing' }],
    ['meta', { property: 'og:description', content: 'In-browser testing framework for React applications with instant feedback, Mock Service Worker integration, and beautiful UI. Because testing isn\'t a phase, it\'s part of the flow.' }],
    ['meta', { property: 'og:url', content: 'https://twd.dev/' }],
    ['meta', { property: 'og:site_name', content: 'TWD Documentation' }],
    ['meta', { property: 'og:image', content: 'https://twd.dev/web-app-manifest-512x512.png' }],
    ['meta', { property: 'og:image:width', content: '512' }],
    ['meta', { property: 'og:image:height', content: '512' }],
    ['meta', { property: 'og:image:alt', content: 'TWD - Test While Developing Logo' }],

    // Twitter Card Tags
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'TWD - Test While Developing' }],
    ['meta', { name: 'twitter:description', content: 'In-browser testing framework for React applications with instant feedback and beautiful UI.' }],
    ['meta', { name: 'twitter:image', content: 'https://twd.dev/web-app-manifest-512x512.png' }],
    ['meta', { name: 'twitter:image:alt', content: 'TWD - Test While Developing Logo' }],

    // Additional Meta Tags
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/getting-started' },
      { text: 'Tutorial', link: '/tutorial/' },
      { text: 'API Reference', link: '/api/' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Writing Tests', link: '/writing-tests' },
          { text: 'API Mocking', link: '/api-mocking' },
          { text: 'Component Mocking', link: '/component-mocking' },
          { text: 'CI Execution', link: '/ci-execution' },
          { text: 'Framework Integration', link: '/frameworks' },
          { text: 'Testing Library', link: '/testing-library' },
          { text: 'AI Context', link: '/agents' },
          { text: 'MCP Integration', link: '/mcp-integration' },
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
