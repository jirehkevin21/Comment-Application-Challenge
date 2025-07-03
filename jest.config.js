module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|js|html)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
    }],
  },
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
