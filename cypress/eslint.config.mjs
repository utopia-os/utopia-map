import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginCypress from 'eslint-plugin-cypress'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.cy.{js,jsx,ts,tsx}', 'cypress/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      cypress: pluginCypress,
    },
    languageOptions: {
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
        chai: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        before: 'readonly',
        after: 'readonly',
      },
    },
    rules: {
      'cypress/no-assigning-return-values': 'error',
      'cypress/no-unnecessary-waiting': 'error',
      'cypress/no-async-tests': 'error',
      'cypress/unsafe-to-chain-command': 'error',

      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',

      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],

      'indent': ['error', 2],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', 'never'],
      'keyword-spacing': ['error', { 'before': true, 'after': true }],
      'space-infix-ops': 'error',
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'max-len': ['warn', { 
        'code': 100, 
        'ignoreUrls': true, 
        'ignoreStrings': true,
        'ignoreTemplateLiterals': true 
      }]
    }
  },

  {
    files: ['cypress/support/**/*.{js,ts}'],
    rules: {
      // Allow console in support files for debugging
      'no-console': 'off'
    }
  },

  {
    files: ['cypress.config.{js,ts}', 'eslint.config.js'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off'
    }
  },

  {
    ignores: [
      'node_modules/**',
      'cypress/downloads/**',
      'cypress/screenshots/**',
      'cypress/videos/**',
      'dist/**',
      'build/**',
      '*.min.js'
    ]
  }
)
