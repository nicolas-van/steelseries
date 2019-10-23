module.exports = {
  'env': {
    'browser': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
  },
  'rules': {
    'max-len': ["error", { "code": 120 }],
    'new-cap': "off",
    'require-jsdoc': "off",
    'no-invalid-this': "off",
    'camelcase': 'off',
    'prefer-rest-params': 'off',
    'prefer-spread': 'off',
    'no-undef': 'error',
    'one-var': ['error', 'never'],
    'max-statements-per-line': ["error", { "max": 1 }],
  },
};
