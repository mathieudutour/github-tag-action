module.exports = {
  preset: 'ts-jest/presets/js-with-babel-esm',
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testRunner: 'jest-circus/runner',
  transformIgnorePatterns: ['node_modules/(?!@semantic-release/release-notes-generator)'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true
}