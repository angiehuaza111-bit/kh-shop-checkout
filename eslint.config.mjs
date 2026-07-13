// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: { prettier: prettierPlugin },
    languageOptions: {
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      complexity: ['error', 8],
      'max-lines-per-function': ['warn', { max: 40, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: ['**/*.spec.ts', 'src/database/migrations/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    ignores: ['dist/', 'coverage/', 'node_modules/'],
  },
);
