/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    preact({
      // Use automatic JSX runtime to reduce bundle size
      devToolsEnabled: false,
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
      formats: ["es"],
    },

    // We DO NOT externalize React or ReactDOM here — bundle them in
    rollupOptions: {
      external: ["fs", "path", "vite"], // keep only Node deps external
      output: {
        globals: {
          // used only for UMD build (Preact compat)
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
    target: "es2020",
    minify: "esbuild",
    // Reduce polyfills
    polyfillModulePreload: false,
    // Don't include source maps
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 2000,
  },
});
