module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['*.cjs'],
  overrides: [
    {
      files: ['.tsx', '.ts'],
      extends: 'plugin:@typescript-eslint/recommended-requiring-type-checking',
    },
  ],
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: ['variable'],
        modifiers: ['const', 'global'],
        format: ['UPPER_CASE'],
      },
      {
        selector: ['variable'],
        modifiers: ['const', 'exported'],
        format: null,
      },
      {
        selector: ['variable'],
        modifiers: ['const'],
        types: ['function'],
        format: null,
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'import/newline-after-import': ['warn', { count: 1 }],
    'import/first': 'warn',
    'import/no-useless-path-segments': ['warn', { noUselessIndex: true }],
    'arrow-body-style': [1, 'as-needed'],
  },
}
