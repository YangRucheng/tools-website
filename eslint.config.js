import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'e2e/**', '*.config.*'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        window: 'readonly',
        navigator: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        Image: 'readonly',
        DOMParser: 'readonly',
        XMLSerializer: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLImageElement: 'readonly',
        crypto: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        Uint8Array: 'readonly',
        BigInt: 'readonly',
        Math: 'readonly',
        Date: 'readonly',
        JSON: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        addEventListener: 'readonly',
        removeEventListener: 'readonly',
      },
    },
    rules: {
      'func-style': ['error', 'expression'],
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/attributes-order': 'off',
      'vue/no-v-html': 'off',
    },
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
);
