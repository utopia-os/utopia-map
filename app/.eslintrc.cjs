// eslint-disable-next-line import/no-commonjs
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:@eslint-community/eslint-comments/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    // 'plugin:promise/recommended',
    'plugin:security/recommended-legacy',
    'plugin:react/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'promise',
    'security',
    'no-catch-all',
    'react',
    'react-hooks',
    'react-refresh',
  ],
  // TODO also parse this
  ignorePatterns: ['vite.config.ts'],
  settings: {
    'import/resolver': {
      typescript: true,
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: '18.2.0',
    },
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'react/react-in-jsx-scope': 'off', // Disable requirement for React import
    'no-catch-all/no-catch-all': 'error',
    'no-console': 'error',
    'no-debugger': 'error',
    camelcase: 'error',
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'never'],
    // Optional eslint-comments rule
    '@eslint-community/eslint-comments/no-unused-disable': 'error',
    '@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
    // import
    'import/export': 'error',
    'import/no-deprecated': 'error',
    'import/no-empty-named-blocks': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-unused-modules': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-amd': 'error',
    'import/no-commonjs': 'error',
    'import/no-import-module-exports': 'error',
    'import/no-nodejs-modules': 'off',
    'import/unambiguous': 'off', // not compatible with scriptless vue files
    'import/default': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/no-absolute-path': 'error',
    'import/no-cycle': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-internal-modules': 'off',
    'import/no-relative-packages': 'error',
    'import/no-relative-parent-imports': [
      'error',
      {
        ignore: ['#[src,types,root,components,utils,assets]/*', '@/config/*'],
      },
    ],
    'import/no-self-import': 'error',
    'import/no-unresolved': [
      'error',
      {
        ignore: ['react'],
      },
    ],
    'import/no-useless-path-segments': 'error',
    'import/no-webpack-loader-syntax': 'error',
    'import/consistent-type-specifier-style': 'error',
    'import/exports-last': 'off',
    'import/extensions': [
      'error',
      'never',
      {
        json: 'always',
      },
    ],
    'import/first': 'error',
    'import/group-exports': 'off',
    'import/newline-after-import': 'error',
    'import/no-anonymous-default-export': 'off', // todo - consider to enable again
    'import/no-default-export': 'off', // incompatible with vite & vike
    'import/no-duplicates': 'error',
    'import/no-named-default': 'error',
    'import/no-namespace': 'error',
    'import/no-unassigned-import': [
      'error',
      {
        allow: ['**/*.css'],
      },
    ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc', // sort in ascending order. Options: ["ignore", "asc", "desc"]
          caseInsensitive: true, // ignore case. Options: [true, false]
        },
        distinctGroup: true,
      },
    ],
    'import/prefer-default-export': 'off',
    // promise
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
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json', '**/tsconfig.json'],
        ecmaVersion: 'latest',
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
      ],
      rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
        // allow explicitly defined dangling promises
        '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
        'no-void': ['error', { allowAsStatement: true }],
      },
    },
    {
      files: ['!*.json'],
      plugins: ['prettier'],
      extends: ['plugin:prettier/recommended'],
      rules: {
        'prettier/prettier': 'error',
      },
    },
    {
      files: ['*.json'],
      plugins: ['json'],
      extends: ['plugin:json/recommended-with-comments'],
    },
    // {
    //   files: ['*.{test,spec}.[tj]s'],
    //   plugins: ['vitest'],
    //   extends: ['plugin:vitest/all'],
    //   rules: {
    //     'vitest/prefer-lowercase-title': 'off',
    //     'vitest/no-hooks': 'off',
    //     'vitest/consistent-test-filename': 'off',
    //     'vitest/prefer-expect-assertions': [
    //       'off',
    //       {
    //         onlyFunctionsWithExpectInLoop: true,
    //         onlyFunctionsWithExpectInCallback: true,
    //       },
    //     ],
    //     'vitest/prefer-strict-equal': 'off',
    //     'vitest/prefer-to-be-falsy': 'off',
    //     'vitest/prefer-to-be-truthy': 'off',
    //     'vitest/require-hook': [
    //       'error',
    //       {
    //         allowedFunctionCalls: [
    //           'mockClient.setRequestHandler',
    //           'setActivePinia',
    //           'provideApolloClient',
    //         ],
    //       },
    //     ],
    //   },
    // },
    {
      files: ['*.yaml', '*.yml'],
      parser: 'yaml-eslint-parser',
      plugins: ['yml'],
      extends: ['plugin:yml/prettier'],
    },
  ],
}
