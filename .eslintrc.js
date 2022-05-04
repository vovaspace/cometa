const path = require('path');

module.exports = {
  extends: ['airbnb', 'airbnb-typescript', 'prettier'],
  parserOptions: {
    project: path.join(__dirname, 'tsconfig.json'),
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-cond-assign': 'off',
    'no-return-assign': 'off',
    'no-sequences': 'off',
    'import/prefer-default-export': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-props-no-spreading': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.spec.tsx'],
      env: { 'jest/globals': true },
      plugins: ['jest'],
      extends: ['plugin:jest/all'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'jest/prefer-expect-assertions': [
          'error',
          { onlyFunctionsWithAsyncKeyword: true },
        ],
        'jest/no-hooks': [
          'error',
          {
            allow: ['beforeAll', 'afterEach'],
          },
        ],
        'jest/lowercase-name': ['error', { ignore: ['describe'] }],
      },
    },
  ],
};
