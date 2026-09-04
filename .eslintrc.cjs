module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2022: true,
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // Adjust rule severity as needed;
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-console': 'warn',
    'no-unused-vars': 'warn',
  },
};

