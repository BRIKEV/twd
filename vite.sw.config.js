import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    minify: "esbuild",
    target: "es2020",
    rollupOptions: {
      input: "src/cli/mock-sw.js",
      output: {
        entryFileNames: "mock-sw.js",
        format: "iife",
        compact: true,
      },
      treeshake: {
        moduleSideEffects: false,
      },
    },
  },
});
