/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  /**
   * `@semantic-release/*` v13+/v14+ ship as ESM-only and cannot be loaded
   * from Jest's CommonJS VM. The mocks under tests/__mocks__ reimplement
   * just enough behaviour for the action's unit tests.
   */
  moduleNameMapper: {
    '^@semantic-release/commit-analyzer$':
      '<rootDir>/tests/__mocks__/@semantic-release/commit-analyzer.ts',
    '^@semantic-release/release-notes-generator$':
      '<rootDir>/tests/__mocks__/@semantic-release/release-notes-generator.ts',
  },
  verbose: true,
};
