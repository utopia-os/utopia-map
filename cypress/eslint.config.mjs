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
      // Enable console warnings in support files
      'no-console': 'warn'
    }
  },

  {
    files: ['cypress.config.{js,ts}', 'eslint.config.js'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off'
    }
  },

  // Node.js CommonJS files (plugins, etc.) - exclude TypeScript rules
  {
    files: ['plugins/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly'
      }
    },
    rules: {
      // Disable TypeScript-specific rules for CommonJS files
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Allow CommonJS patterns
      'no-undef': 'off',
      'no-console': 'off',

      // Keep basic JS rules
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  {
    ignores: [
      'node_modules/**',
      'cypress/downloads/**',
      'cypress/screenshots/**',
      'cypress/videos/**',
      'cypress/plugins/**',  // Ignore Node.js CommonJS plugin files
      'results/**',
      'dist/**',
      'build/**',
      '*.min.js'
    ]
  }
)
