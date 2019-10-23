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
    'max-len': ["error", { "code": 220 }],
    'new-cap': "off",
    'require-jsdoc': "off",
    'no-invalid-this': "off",
    'prefer-const': 'off',
    'camelcase': 'off',
    'prefer-rest-params': 'off',
    'prefer-spread': 'off',
    'no-undef': 'error',
  },
};
