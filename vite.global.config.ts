import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// Browser global build: dist/twd.global.js exposes window.TWD for classic
// <script> tags (CDN, single-file HTML, sandboxed previews). Kept separate from
// vite.bundle.config.ts so the ESM outputs are untouched, and without the dts
// plugin so it never writes declarations.
export default defineConfig({
  plugins: [preact({ devToolsEnabled: false })],
  // Lib mode leaves process.env.NODE_ENV for the consumer's bundler to replace.
  // An IIFE has no bundler after it, and react-is (via @testing-library/dom)
  // reads it unguarded, so without this the script throws in the browser.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/global.ts",
      name: "TWD",
      fileName: () => "twd.global.js",
      formats: ["iife"],
    },
    rollupOptions: {
      output: { exports: "named" },
    },
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
});
