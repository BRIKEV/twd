import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "TWD",
  description: "Test While Developing (TWD) - in-browser testing for React applications",
  base: '/twd/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
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
          { text: 'CI Execution', link: '/ci-execution' }
        ]
      },
      {
        text: 'Tutorial',
        items: [
          { text: 'Overview', link: '/tutorial/' },
          { text: 'Installation', link: '/tutorial/installation' },
          { text: 'First Test', link: '/tutorial/first-test' },
          { text: 'Assertions & Navigation', link: '/tutorial/assertions-navigation' },
          { text: 'API Mocking', link: '/tutorial/api-mocking' },
          { text: 'Test Hooks', link: '/tutorial/test-hooks' },
          { text: 'Production Builds', link: '/tutorial/production-builds' },
          { text: 'CI Integration', link: '/tutorial/ci-integration' }
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
