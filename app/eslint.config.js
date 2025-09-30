// ESLint v9 flat config for Utopia Map App
import js from '@eslint/js'
import eslintCommentsPlugin from '@eslint-community/eslint-plugin-eslint-comments'
import importPlugin from 'eslint-plugin-import'
import jsonPlugin from 'eslint-plugin-json'
import noCatchAllPlugin from 'eslint-plugin-no-catch-all'
import promisePlugin from 'eslint-plugin-promise'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import securityPlugin from 'eslint-plugin-security'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Ignore patterns
  {
    ignores: ['dist/**', 'node_modules/**', 'data/**', 'vite.config.ts'],
  },

  // Base ESLint recommended config
  js.configs.recommended,

  // Main configuration for JavaScript/TypeScript files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': importPlugin,
      'promise': promisePlugin,
      'security': securityPlugin,
      'no-catch-all': noCatchAllPlugin,
      '@eslint-community/eslint-comments': eslintCommentsPlugin,
    },
    settings: {
      react: {
        version: '18.2.0',
      },
      'import/resolver': {
        typescript: true,
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // Basic rules
      'no-console': 'error',
      'no-debugger': 'error',
      'camelcase': 'error',

      // Standard JS rules (replacing eslint-config-standard)
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'always-multiline'],
      // Disabled: conflicts with common TypeScript/React patterns
      // 'space-before-function-paren': ['error', 'always'],
      'keyword-spacing': ['error', { before: true, after: true }],
      'space-infix-ops': 'error',
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      // Disable indent rule due to known issues with TypeScript/JSX
      // 'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],

      // Additional standard rules that were missing
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'new-cap': ['error', { newIsCap: true, capIsNew: false, properties: true }],
      'array-callback-return': ['error', { allowImplicit: false, checkForEach: false }],

      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Import rules
      'import/export': 'error',
      'import/no-deprecated': 'error',
      'import/no-empty-named-blocks': 'error',
      'import/no-extraneous-dependencies': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-amd': 'error',
      'import/no-commonjs': 'error',
      'import/no-nodejs-modules': 'off',
      'import/default': 'error',
      'import/named': 'error',
      'import/namespace': 'error',
      'import/no-absolute-path': 'error',
      'import/no-cycle': 'error',
      'import/no-dynamic-require': 'error',
      'import/no-internal-modules': 'off',
      'import/no-relative-packages': 'error',
      'import/no-self-import': 'error',
      'import/no-unresolved': ['error', { ignore: ['react'] }],
      'import/no-useless-path-segments': 'error',
      'import/no-webpack-loader-syntax': 'error',
      'import/consistent-type-specifier-style': 'error',
      'import/exports-last': 'off',
      'import/extensions': ['error', 'never', { json: 'always' }],
      'import/first': 'error',
      'import/group-exports': 'off',
      'import/newline-after-import': 'error',
      'import/no-anonymous-default-export': 'off',
      'import/no-default-export': 'off',
      'import/no-duplicates': 'error',
      'import/no-named-default': 'error',
      'import/no-namespace': 'error',
      'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          distinctGroup: true,
        },
      ],
      'import/prefer-default-export': 'off',

      // Promise rules
      'promise/catch-or-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/always-return': 'error',
      'promise/no-native': 'off',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-callback-in-promise': 'warn',
      'promise/avoid-new': 'warn',
      'promise/no-new-statics': 'error',
      'promise/no-return-in-finally': 'warn',
      'promise/valid-params': 'warn',
      'promise/prefer-await-to-callbacks': 'error',
      'promise/no-multiple-resolved': 'error',

      // Security and other rules
      'no-catch-all/no-catch-all': 'error',

      // ESLint comments rules
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
      '@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],

      // Additional import rules
      'import/no-unused-modules': 'error',
      'import/no-import-module-exports': 'error',
      'import/unambiguous': 'off',
      'import/no-relative-parent-imports': [
        'error',
        {
          ignore: ['#[src,types,root,components,utils,assets]/*'],
        },
      ],
    },
  },

  // TypeScript configs (applied after main config)
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // TypeScript type-checking configuration
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
      'no-void': ['error', { allowAsStatement: true }],

      // Disable empty function rule - legitimate use in React contexts and empty constructors
      '@typescript-eslint/no-empty-function': 'off',

      // Configure no-unused-expressions to allow logical AND and ternary patterns
      '@typescript-eslint/no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTernary: true,
      }],
    },
  },

  // JSON files configuration
  {
    files: ['**/*.json'],
    plugins: {
      json: jsonPlugin,
    },
    rules: {
      // Disable TypeScript-specific rules for JSON files
      '@typescript-eslint/no-unused-expressions': 'off',
      // JSON-specific rules
      'json/*': 'error',
    },
  },
)
