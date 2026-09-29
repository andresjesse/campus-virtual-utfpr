module.exports = {
  clearMocks: true,
  moduleNameMapper: {
    '\\.module\\.css$': '<rootDir>/tests/style-mock.cjs',
    '^@/mocks/(.*)$': '<rootDir>/tests/mocks/$1',
    '^@/config/locale\\.ts$': '<rootDir>/tests/mocks/locale.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
}
