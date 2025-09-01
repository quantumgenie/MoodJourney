module.exports = {
  // Use a simpler preset that doesn't include Expo's web modules
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    '<rootDir>/src/test/setup.ts',
    '<rootDir>/src/__integration_tests__/setup/simpleIntegrationSetup.ts'
  ],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/__integration_tests__/**/*.test.(ts|tsx|js)',
    '**/__integration_tests__/**/*.integration.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/__tests__/**/*',
    '!src/**/__integration_tests__/**/*',
    '!src/navigation/**/*',
    '!src/components/**/*' // Focus on business logic, not UI components
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        target: 'es2017',
        lib: ['es2017'],
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: false,
        jsx: 'react-jsx'
      }
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // Mock modules that we don't need for business logic testing
  transformIgnorePatterns: [
    'node_modules/(?!(date-fns)/)'
  ]
};