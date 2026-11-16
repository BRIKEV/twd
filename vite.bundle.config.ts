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
      // theme.ts is the only module bundled.d.ts imports from.
      include: ["src/bundled.tsx", "src/global.d.ts", "src/ui/utils/theme.ts"],
      insertTypesEntry: false, // We handle package.json manually
      // Not bundleTypes: with a single entry it writes to package.json "types"
      // (dist/index.d.ts) and would overwrite the main build's declarations.
      // moduleFormat 'esm' emits .d.mts files whose relative imports carry an
      // explicit .mjs extension, which node16/nodenext require.
      outDirs: [{ dir: "dist", moduleFormat: "esm" }],
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
        // Optimize exports
        exports: 'named',
      },
      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    // Target modern browsers for smaller output
    target: "es2020",
    minify: "esbuild",
    // Reduce polyfills (Vite 7+ API)
    modulePreload: { polyfill: false },
    // Don't include source maps
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 2000,
  },
});
