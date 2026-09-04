/**
 * ESLint flat configuration (v9+).
 * Simple configuration that works with ESLint >=9.
 */

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Ignore generated files and directories that are not source code
  {
    ignores: [
      'node_modules/',
      '**/dist/',
      'coverage/',
      '.wrangler/',
      '.worktrees/',
      '.playwright-mcp/',
      'apps/web/dist/',
      'apps/web/.astro/',
      'apps/web/.output/',
      'apps/web/public/**',
      '**/generated/**',
      '**/test-results/**',
    ],
  },
  // JavaScript files.
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'warn',
    },
  },
  // TypeScript files.
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'warn',
      'no-unused-vars': 'warn',
    },
  },
];
