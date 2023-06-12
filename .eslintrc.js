module.exports = {
  root: true
, parser: '@typescript-eslint/parser'
, plugins: [
    '@typescript-eslint'
  , 'react'
  , 'react-hooks'
  ]
, extends: [
    'eslint:recommended'
  , 'plugin:@typescript-eslint/recommended'
  , 'plugin:react/recommended'
  , 'plugin:react/jsx-runtime'
  , 'plugin:react-hooks/recommended'
  ]
, rules: {
    'no-async-promise-executor': 'off'
  , '@typescript-eslint/no-inferrable-types': 'off'
  , '@typescript-eslint/no-non-null-assertion': 'off'
  , '@typescript-eslint/no-unused-vars': 'off'
  }
, settings: {
    react: {
      'version': 'detect'
    }
  }
}
