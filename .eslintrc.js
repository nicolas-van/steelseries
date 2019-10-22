module.exports = {
  'env': {
    'es6': true,
    'node': true,
  },
  'extends': [
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module',
  },
  'rules': {
    'max-len': ["error", { "code": 220 }],
    'new-cap': "off",
    'require-jsdoc': "off",
    'no-invalid-this': "off",
    'no-var': 'off',
    'prefer-const': 'off',
    'no-unused-vars': 'off',
    'camelcase': 'off',
    'prefer-rest-params': 'off',
    'prefer-spread': 'off',
  },
};
