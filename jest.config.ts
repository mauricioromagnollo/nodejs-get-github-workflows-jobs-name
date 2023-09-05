import type { Config } from 'jest';

const config: Config = {
  displayName: 'nodejs-github-api',
  // roots: ['<rootDir>/tests'],
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts'
  ],
  coveragePathIgnorePatterns: [
    'node_modules',
  ],
  transform: {
    '.+\\.ts$': 'ts-jest'
  },
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  setupFiles: ['dotenv/config']
}

export default config
