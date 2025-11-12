/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: true,
      exclude: [
        "src/tests",
        "src/**/tests",
        "**/*.spec.ts",
        "**/*.test.ts",
      ],
    }),
  ],

  build: {
    lib: {
      entry: "src/bundled.tsx", // 👈 your entry file
      name: "TWD",
      fileName: (format) => `bundled.${format}.js`,
      formats: ["es", "umd"], // you can emit both if you want
    },

    // ✅ We DO NOT externalize React or ReactDOM here — bundle them in
    rollupOptions: {
      external: ["fs", "path", "vite", "chalk"], // keep only Node deps external
      output: {
        globals: {
          // used only for UMD build
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    emptyOutDir: false,
    // optional, ensures smaller modern output
    target: "esnext",
    minify: "esbuild",
  },
});
