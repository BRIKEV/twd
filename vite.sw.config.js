import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: "src/cli/mock-sw.js",
      output: {
        entryFileNames: "mock-sw.js",
      },
    },
  },
});
