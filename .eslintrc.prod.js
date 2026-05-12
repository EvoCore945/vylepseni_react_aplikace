module.exports = {
  extends: ['./.eslintrc.js'],
rules: {
'no-console': [
      'error',
      {
        allow: ['log', 'error', 'info'],
      },
    ],
    'no-debugger': 'error',
  },
};
