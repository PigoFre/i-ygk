module.exports = {
  extends: ['standard', 'standard-jsx', 'standard-react', 'prettier'],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    jsx: true,
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    mocha: false,
    describe: false,
    it: false,
    expect: false,
    beforeEach: false,
    afterEach: false,
    before: false,
    after: false,
    xdescribe: false,
    xit: false,
    sinon: false,
    BemuseLogger: false,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['react'],
  rules: {
    'react/prop-types': 'warn',
    'react/jsx-no-bind': 'off',
    'react/jsx-handler-names': 'off',
    'no-mixed-operators': 'off',
    'no-sequences': 'off',
    'import/no-unresolved': 'off',
    'import/export': 'off',
    'import/named': 'off',
    'no-use-before-define': 'off',
    'import/no-webpack-loader-syntax': 'off',
    'no-void': 'off',
    'dot-notation': 'off',
    'object-shorthand': 'off',

    // These should be errors, but we just added them and there are too many
    // violations to fix right now.
    'n/no-deprecated-api': 'warn',
    'react/jsx-key': 'warn',
    'react/no-deprecated': 'warn',
    'react/no-find-dom-node': 'warn',
    'react/no-string-refs': 'warn',
    'no-prototype-builtins': 'warn',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-redeclare': 'off',
        'no-useless-constructor': 'off',
        'react/prop-types': 'off',
      },
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        'no-var': 'off',
      },
    },
  ],
}
