import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      'build/**',
      'coverage/**',
      '.nx/**',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.d.ts',
      '**/jest.config.*',
      'webpack.config.js',
      'next.config.js',
      '*.mjs',
      '*.cjs',
      '**/*.js',
      '**/.next/**'
    ]
  },
  js.configs.recommended,
  prettierConfig,
  sonarjs.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.base.json'
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        React: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error']
        }
      ],
      'sonarjs/todo-tag': 'off',
      'sonarjs/prefer-regexp-exec': 'off',
      'sonarjs/slow-regex': 'off',
      'sonarjs/no-commented-code': 'off',
      'sonarjs/prefer-read-only-props': 'off',
      'sonarjs/anchor-precedence': 'off'
    }
  }
];