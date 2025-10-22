/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: ['**/tests/**/*.test.(ts|tsx)'],
};
