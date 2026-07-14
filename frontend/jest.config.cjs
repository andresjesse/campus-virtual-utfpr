module.exports = {
  clearMocks: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
}
