module.exports = {
  extends: [
    'airbnb'
  ],
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  globals: {
    PRODUCTION: 'writable',
  },
  ignorePatterns: [
    '.eslintrc.prod.js',
    '.eslintrc.js',
    'webpack.config.common.js',
    'webpack.config.dev.js',
    'webpack.config.prod.js',
    'postcss.config.js',
    'dist/**/*',
    'jsconfig.json',
  ],
  parserOptions: {
    ecmaVersion: 15,
    project: './tsconfig.json',
  },
  rules: {
    'brace-style': ['error', '1tbs'],
    curly: ['error', 'all'],
    'import/no-cycle': 'error',
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling']],
        'newlines-between': 'never',
        pathGroups: [],
      },
    ],
    'no-await-in-loop': 'off',
    'no-console': [
      'off',
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-continue': 'off',
    'no-debugger': 'warn',
    'no-restricted-imports': [
      'error',
      {
        paths: [{
          message: 'Please use lodash/module instead.',
          name: 'lodash',
        }],
      },
    ],
    'no-restricted-syntax': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
      },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': [
      'error',
      {
        "forbidDefaultForRequired": true,
        "ignoreFunctionalComponents": true,
      }
    ]
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['Utils', './src/utils'],
        ],
      },
    },
  },
};
