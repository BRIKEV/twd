/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime to reduce bundle size
      jsxRuntime: 'automatic',
    }),
    dts({
      include: ["src/bundled.tsx", "src/global.d.ts"],
      insertTypesEntry: false, // We handle package.json manually
    }),
  ],

  build: {
    emptyOutDir: false,
    lib: {
      entry: { bundled: "src/bundled.tsx" },
      name: "TWD",
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      formats: ["es", "umd"],
    },

    // We DO NOT externalize React or ReactDOM here — bundle them in
    rollupOptions: {
      external: ["fs", "path", "vite"], // keep only Node deps external
      output: {
        globals: {
          // used only for UMD build
          react: "React",
          "react-dom": "ReactDOM",
        },
        // Remove source maps in production bundle
        sourcemap: false,
        // Better tree shaking
        compact: true,
        // Optimize exports
        exports: 'named',
      },
      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Target modern browsers for smaller output
    target: "esnext",
    minify: "esbuild",
    // Reduce polyfills
    polyfillModulePreload: false,
    // Don't include source maps
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 2000,
  },
});
