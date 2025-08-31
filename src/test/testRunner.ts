/**
 * Test Runner Utility
 * 
 * This file provides utilities for running and organizing tests
 * in the MoodJourney application.
 */

export const testCategories = {
  BUSINESS_LOGIC: 'Business Logic',
  STORAGE: 'Storage Services',
  ANALYTICS: 'Analytics & Insights',
  SEMANTIC_ANALYSIS: 'Semantic Analysis',
  DATA_STRUCTURES: 'Data Structures',
} as const;

export const testSuites = {
  [testCategories.BUSINESS_LOGIC]: [
    'TodaySummaryService',
  ],
  [testCategories.STORAGE]: [
    'JournalStorageService',
    'MoodStorageService',
  ],
  [testCategories.ANALYTICS]: [
    'ActivityCorrelationService',
  ],
  [testCategories.SEMANTIC_ANALYSIS]: [
    'SemanticAnalysisService',
    'EmotionLexicon',
  ],
} as const;

/**
 * Test coverage targets for each category
 */
export const coverageTargets = {
  [testCategories.BUSINESS_LOGIC]: 90,
  [testCategories.STORAGE]: 85,
  [testCategories.ANALYTICS]: 85,
  [testCategories.SEMANTIC_ANALYSIS]: 80,
  [testCategories.DATA_STRUCTURES]: 95,
} as const;

/**
 * Test utilities for common test scenarios
 */
export const testUtils = {
  /**
   * Creates a mock date that's consistent across tests
   */
  getMockDate: (dateString = '2024-01-15T12:00:00Z') => new Date(dateString),
  
  /**
   * Generates test data for mood entries
   */
  generateMoodTestData: (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: (i + 1).toString(),
      mood: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'calm', 'neutral'][i % 7],
      intensity: Math.random(),
      activities: ['Exercise', 'Work', 'Socializing'][i % 3] ? [['Exercise', 'Work', 'Socializing'][i % 3]] : [],
      notes: `Test note ${i + 1}`,
      timestamp: new Date(Date.now() - (i * 86400000)).toISOString(),
      createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
      updatedAt: new Date(Date.now() - (i * 86400000)).toISOString(),
    }));
  },
  
  /**
   * Generates test data for journal entries
   */
  generateJournalTestData: (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: (i + 1).toString(),
      title: `Test Entry ${i + 1}`,
      content: `This is test content for entry ${i + 1}. It contains various emotions and activities.`,
      mood: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'calm', 'neutral'][i % 7],
      activities: ['Exercise', 'Work', 'Socializing'][i % 3] ? [['Exercise', 'Work', 'Socializing'][i % 3]] : [],
      tags: [],
      createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
      updatedAt: new Date(Date.now() - (i * 86400000)).toISOString(),
    }));
  },
};

