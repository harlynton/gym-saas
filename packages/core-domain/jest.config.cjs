/** @type {import('jest').Config} */
module.exports = {
  // 👈 Esto le dice a Jest que use ts-jest para transformar TS
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Carpeta de código fuente
  rootDir: '.',
  roots: ['<rootDir>/src'],

  // Solo tests .spec.ts dentro de src
  testMatch: ['**/*.spec.ts'],

  moduleFileExtensions: ['ts', 'js', 'json'],

  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
};
