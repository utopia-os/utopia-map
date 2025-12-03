// ESLint v9 flat config for Utopia Map App
import js from '@eslint/js'
import eslintCommentsConfigs from '@eslint-community/eslint-plugin-eslint-comments/configs'
import importXPlugin from 'eslint-plugin-import-x'
import jsonPlugin from 'eslint-plugin-json'
import noCatchAllPlugin from 'eslint-plugin-no-catch-all'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
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

  // Report unused eslint-disable directives (catches stale comments after rule renames)
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  // Base ESLint recommended config
  js.configs.recommended,

  // ESLint comments recommended config
  eslintCommentsConfigs.recommended,

  // Security recommended config
  securityPlugin.configs.recommended,

  // React recommended configs
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],

  // Main configuration for JavaScript/TypeScript files
  {
    files: ['**/*.{js,jsx,ts,tsx,cjs,mjs}'],
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
      'import-x': importXPlugin,
      'promise': promisePlugin,
      'no-catch-all': noCatchAllPlugin,
    },
    settings: {
      react: {
        version: '18.2.0',
      },
      'import-x/resolver': {
        typescript: true,
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // ESLint comments rules - allow whole-file disables without eslint-enable
      '@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],

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
      'import-x/export': 'error',
      'import-x/no-deprecated': 'error',
      'import-x/no-empty-named-blocks': 'error',
      'import-x/no-extraneous-dependencies': 'error',
      'import-x/no-mutable-exports': 'error',
      'import-x/no-named-as-default': 'error',
      'import-x/no-named-as-default-member': 'error',
      'import-x/no-amd': 'error',
      'import-x/no-commonjs': 'error',
      'import-x/no-nodejs-modules': 'off',
      'import-x/default': 'error',
      'import-x/named': 'error',
      'import-x/namespace': 'error',
      'import-x/no-absolute-path': 'error',
      'import-x/no-cycle': 'error',
      'import-x/no-dynamic-require': 'error',
      'import-x/no-internal-modules': 'off',
      'import-x/no-relative-packages': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-unresolved': ['error', { ignore: ['react'] }],
      'import-x/no-useless-path-segments': 'error',
      'import-x/no-webpack-loader-syntax': 'error',
      'import-x/consistent-type-specifier-style': 'error',
      'import-x/exports-last': 'off',
      'import-x/extensions': ['error', 'never', { json: 'always' }],
      'import-x/first': 'error',
      'import-x/group-exports': 'off',
      'import-x/newline-after-import': 'error',
      'import-x/no-anonymous-default-export': 'off',
      'import-x/no-default-export': 'off',
      'import-x/no-duplicates': 'error',
      'import-x/no-named-default': 'error',
      'import-x/no-namespace': 'error',
      'import-x/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
      'import-x/order': [
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
      'import-x/prefer-default-export': 'off',

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

      // Additional import rules
      'import-x/no-unused-modules': 'error',
      'import-x/no-import-module-exports': 'error',
      'import-x/unambiguous': 'off',
      'import-x/no-relative-parent-imports': [
        'error',
        {
          ignore: ['#[src,types,root,components,utils,assets]/*', '@/config/*'],
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

  // Prettier recommended config (should be last to override other formatting rules)
  eslintPluginPrettierRecommended,
)
