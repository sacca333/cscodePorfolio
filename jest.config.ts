// ==========================================================
//  jest.config.ts
// ==========================================================

import type { Config } from 'jest'

const config: Config = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  rootDir:         '.',
  testMatch:       ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  setupFiles:      ['<rootDir>/__tests__/setup.ts'],
  collectCoverage:      true,
  coverageDirectory:    'coverage',
  coverageReporters:    ['text', 'lcov'],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
  },
}

export default config
