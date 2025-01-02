const esmModules = ['d3-random'];
const path = require('path');

// note 2023-07-18: the transform crashes for and d3 library import (export syntax)
// tranformIgnorePatterns seem to not work -> the unit tests cannot import any file that imports d3
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(d3|d3-.+))',
    `<rootDir>/node_modules/(?!(?:.pnpm/)?(${esmModules.join('|')}))`,
    `${path.join(__dirname, '../..')}/node_modules/(?!(?:.pnpm/)?(${esmModules.join('|')}))`,
  ],
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
  testPathIgnorePatterns: ['/node_modules/', '/db-tests/'],
  // testMatch: ['<rootDir>/src/**/*.test.{js,jsx,ts,tsx}'],
  // transform: {
  //   '^.+\\.tsx?$': '<rootDir>/customJestTransformer.cjs',
  // },
};
