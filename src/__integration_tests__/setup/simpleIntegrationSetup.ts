/**
 * Simplified Integration Test Setup
 * Focuses on business logic integration without UI components
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory storage for testing
const mockStorage: Record<string, string> = {};

// Mock AsyncStorage for integration tests with actual storage behavior
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStorage))),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

export class SimpleIntegrationTestHelper {
  private mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  /**
   * Clear all AsyncStorage data before each test
   */
  async clearStorage(): Promise<void> {
    // Clear the in-memory storage
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    
    // Clear mock call history
    this.mockAsyncStorage.clear.mockClear();
    this.mockAsyncStorage.getItem.mockClear();
    this.mockAsyncStorage.setItem.mockClear();
    this.mockAsyncStorage.removeItem.mockClear();
  }

  /**
   * Set up AsyncStorage with predefined data
   */
  async setupStorageData(data: Record<string, any>): Promise<void> {
    Object.entries(data).forEach(([key, value]) => {
      this.mockAsyncStorage.getItem.mockImplementation((storageKey) => {
        if (storageKey === key) {
          return Promise.resolve(JSON.stringify(value));
        }
        return Promise.resolve(null);
      });
    });
  }

  /**
   * Wait for async operations to complete
   */
  async waitForAsyncOperations(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Get mock AsyncStorage instance for assertions
   */
  getMockStorage() {
    return this.mockAsyncStorage;
  }

  /**
   * Verify that data was saved to storage
   */
  expectStorageSave(key: string, expectedData?: any): void {
    expect(this.mockAsyncStorage.setItem).toHaveBeenCalledWith(
      key,
      expectedData ? JSON.stringify(expectedData) : expect.any(String)
    );
  }

  /**
   * Verify that data was loaded from storage
   */
  expectStorageLoad(key: string): void {
    expect(this.mockAsyncStorage.getItem).toHaveBeenCalledWith(key);
  }
}

// Global test helper instance
export const testHelper = new SimpleIntegrationTestHelper();

// Setup and teardown hooks
beforeEach(async () => {
  await testHelper.clearStorage();
});

afterEach(() => {
  jest.clearAllMocks();
});
