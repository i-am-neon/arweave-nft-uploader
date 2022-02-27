module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx,js,jsx}",
      "!src/**/*.d.ts",
      "!**/node_modules/**",
    ]
  }