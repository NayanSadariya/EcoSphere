module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.seed.js',
    '!src/server.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};