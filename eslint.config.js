import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import vitest from '@vitest/eslint-plugin';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

export default defineConfig(
  {
    ignores: [
      'dist/',
      'coverage/',
      'node_modules/',
      'examples/',
      'docs/.vitepress/cache/',
      '**/*.d.ts',
      'src/cli/installsw.js',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.spec.{ts,tsx}', 'src/tests/**/*.{ts,tsx}'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-focused-tests': 'error',
    },
    languageOptions: {
      globals: { ...vitest.environments.env.globals },
    },
  },

  // Files that wrap external untyped APIs (chai, testing-library, MSW, Vite plugins).
  // Typing these properly is upstream work; we accept the unsafe boundary
  // and rely on integration tests to catch real bugs.
  {
    files: [
      'src/asserts/**/*.ts',
      'src/proxies/**/*.ts',
      'src/commands/mockBridge.ts',
      'src/commands/visit.ts',
      'src/runner-ci.ts',
      'src/twd.ts',
      'src/ui/utils/formatLogs.ts',
      'src/ui/utils/screenReaderMessages.ts',
      'src/utils/waitFor.ts',
      'src/plugin/removeMockServiceWorker.ts',
      'src/plugin/twdHmr.ts',
      'src/bundled.tsx',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
    },
  },

  // Test files: chai's expect() returns `any` and tests use conditional
  // assertion patterns that vitest/no-conditional-expect flags. The strict
  // type-aware rules add noise without catching real bugs in test code.
  {
    files: ['src/tests/**/*.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'vitest/no-conditional-expect': 'off',
      'vitest/expect-expect': 'off',
      'vitest/valid-expect': 'off',
    },
  },

  prettier,
);
