// Simple test setup without React Native dependencies
// This focuses on testing business logic, not UI components

// Mock AsyncStorage for storage tests
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

// Mock AsyncStorage module
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock date-fns to have consistent dates in tests if needed
// (We can override specific functions if needed for deterministic tests)

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Export the mock for use in tests
export { mockAsyncStorage };