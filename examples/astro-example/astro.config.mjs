// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [
      {
        name: "force-full-reload-on-tests",
        handleHotUpdate({ file, server }) {
          if (file.endsWith(".twd.test.ts")) {
            // Force Astro to reload the entire page, not just patch modules
            server.ws.send({
              type: "full-reload",
              path: "*",
            });
            return []; // Stop normal HMR
          }
        },
      },
    ],
  },
});