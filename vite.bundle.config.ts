/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
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

    // ✅ We DO NOT externalize React or ReactDOM here — bundle them in
    rollupOptions: {
      external: ["fs", "path", "vite"], // keep only Node deps external
      output: {
        globals: {
          // used only for UMD build
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    // optional, ensures smaller modern output
    target: "esnext",
    minify: "esbuild",
  },
});
