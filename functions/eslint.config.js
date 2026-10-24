const js = require('@eslint/js');
const promise = require('eslint-plugin-promise');

module.exports = [
  {
    ignores: ['node_modules/**']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs'
    },
    plugins: {
      promise
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
      'no-debugger': 'off',
      'no-unused-vars': 'off',
      'no-mixed-spaces-and-tabs': 'off',
      'no-undef': 'off',
      'no-template-curly-in-string': 'warn',
      'consistent-return': 'warn',
      'array-callback-return': 'warn',
      'eqeqeq': 'error',
      'no-alert': 'error',
      'no-caller': 'error',
      'no-eval': 'error',
      'no-extend-native': 'warn',
      'no-extra-bind': 'warn',
      'no-extra-label': 'warn',
      'no-floating-decimal': 'error',
      'no-implicit-coercion': 'warn',
      'no-loop-func': 'warn',
      'no-new-func': 'error',
      'no-new-wrappers': 'warn',
      'prefer-promise-reject-errors': 'error',
      'for-direction': 'error',
      'getter-return': 'error',
      'no-await-in-loop': 'error',
      'no-compare-neg-zero': 'error',
      'no-shadow-restricted-names': 'error',
      'promise/always-return': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-nesting': 'warn'
    }
  }
];
