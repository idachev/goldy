/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  projects: [
    {
      displayName: 'shared-types',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'node',
      roots: ['<rootDir>/libs/shared/types/src'],
      testMatch: ['<rootDir>/libs/shared/types/src/**/*.spec.ts'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          useESM: true,
          tsconfig: {
            module: 'esnext',
          },
        }],
      },
      moduleNameMapper: {
        '^@goldy/shared/types$': '<rootDir>/libs/shared/types/src/index.ts',
        '^@goldy/shared/utils$': '<rootDir>/libs/shared/utils/src/index.ts',
      },
      extensionsToTreatAsEsm: ['.ts'],
    },
    {
      displayName: 'shared-utils',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'node',
      roots: ['<rootDir>/libs/shared/utils/src'],
      testMatch: ['<rootDir>/libs/shared/utils/src/**/*.spec.ts'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          useESM: true,
          tsconfig: {
            module: 'esnext',
          },
        }],
      },
      moduleNameMapper: {
        '^@goldy/shared/types$': '<rootDir>/libs/shared/types/src/index.ts',
        '^@goldy/shared/utils$': '<rootDir>/libs/shared/utils/src/index.ts',
      },
      extensionsToTreatAsEsm: ['.ts'],
    },
  ],
  collectCoverageFrom: [
    'libs/shared/**/*.ts',
    'apps/backend/src/**/*.ts',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/*.d.ts',
    '!**/*.enum.ts',
    '!**/lib/*.ts',
  ],
  coverageReporters: ['text', 'lcov'],
};

export default config;