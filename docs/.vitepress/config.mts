import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "TWD",
  description: "Test While Developing (TWD) - in-browser testing for React applications",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/getting-started' },
      { text: 'Examples', link: '/examples/' },
      { text: 'API Reference', link: '/api/' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Writing Tests', link: '/writing-tests' },
          { text: 'API Mocking', link: '/api-mocking' }
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Overview', link: '/examples/' },
          { text: 'Selectors', link: '/examples/selectors' },
          { text: 'Assertions', link: '/examples/assertions' },
          { text: 'API Mocking', link: '/examples/mocking' },
          { text: 'User Events', link: '/examples/user-events' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/' },
          { text: 'Test Functions', link: '/api/test-functions' },
          { text: 'TWD Commands', link: '/api/twd-commands' },
          { text: 'Assertions', link: '/api/assertions' },
          { text: 'User Events', link: '/api/user-events' }
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
