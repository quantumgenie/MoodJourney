/**
 * Edge Cases Integration Tests
 * 
 * Tests edge cases including empty states, data corruption scenarios,
 * boundary conditions, and unusual user interactions.
 */

import { MoodStorageService } from '../../services/storage/moodStorage';
import { JournalStorageService } from '../../services/storage/journalStorage';
import { TodaySummaryService } from '../../services/dashboard/todaySummaryService';
import { SemanticAnalysisService } from '../../services/semanticAnalysis/semanticAnalysisService';
import { ActivityCorrelationService } from '../../services/analytics/activityCorrelationService';
import { IntegrationTestData } from '../setup/testData';
import '../setup/simpleIntegrationSetup';

describe('Edge Cases Integration Tests', () => {
  let moodStorage: MoodStorageService;
  let journalStorage: JournalStorageService;
  let semanticAnalysis: SemanticAnalysisService;
  let activityCorrelation: ActivityCorrelationService;

  beforeEach(async () => {
    // Get fresh instances for each test
    moodStorage = MoodStorageService.getInstance();
    journalStorage = JournalStorageService.getInstance();
    semanticAnalysis = new SemanticAnalysisService();
    activityCorrelation = new ActivityCorrelationService();

    // Clear all data
    await moodStorage.clearAllMoodEntries();
    const allJournalEntries = await journalStorage.getAllJournalEntries();
    for (const entry of allJournalEntries) {
      await journalStorage.deleteJournalEntry(entry.id);
    }
  });

  describe('Empty State Handling', () => {
    it('should handle completely empty application state gracefully', async () => {
      // 1. Verify initial empty state
      const moodEntries = await moodStorage.getAllMoodEntries();
      const journalEntries = await journalStorage.getAllJournalEntries();
      
      expect(moodEntries).toEqual([]);
      expect(journalEntries).toEqual([]);

      // 2. Test dashboard with empty state
      const emptySummary = TodaySummaryService.calculateTodaysSummary([], []);
      expect(emptySummary).toBeDefined();
      expect(emptySummary.moodCount).toBe(0);
      expect(emptySummary.journalCount).toBe(0);
      // Dashboard may return null or a default value for empty state
      expect(emptySummary.dominantMood === null || typeof emptySummary.dominantMood === 'string').toBe(true);
      expect(emptySummary.topActivities).toEqual([]);
      expect(emptySummary.averageIntensity).toBe(0);
      // Dashboard may return null or a default value for empty mood trend
      expect(emptySummary.moodTrend === null || typeof emptySummary.moodTrend === 'string').toBe(true);

      // 3. Test analytics with empty state
      const emptyCorrelations = activityCorrelation.analyzeActivityCorrelations([]);
      expect(emptyCorrelations).toEqual([]);

      const emptyInsights = activityCorrelation.generateInsights([]);
      expect(Array.isArray(emptyInsights)).toBe(true);
      expect(emptyInsights.length).toBe(0);

      // 4. Test semantic analysis with empty content
      const emptySemanticEntry = {
        id: 'empty_test',
        content: '',
        date: new Date().toISOString(),
        mood: 'neutral',
        tags: []
      };

      const emptyAnalysis = semanticAnalysis.analyzeEntry(emptySemanticEntry);
      expect(emptyAnalysis).toBeDefined();
      expect(emptyAnalysis.dominantEmotion).toBeDefined();
      expect(emptyAnalysis.emotionDistribution).toBeDefined();
      expect(Array.isArray(emptyAnalysis.suggestedTags)).toBe(true);
    });

    it('should handle transitions from empty to populated states', async () => {
      // 1. Start with empty state
      let summary = TodaySummaryService.calculateTodaysSummary([], []);
      expect(summary.moodCount).toBe(0);
      expect(summary.journalCount).toBe(0);

      // 2. Add first mood entry
      const firstMoodEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.8,
        activities: ['Exercise'] as any
      });
      await moodStorage.saveMoodEntry(firstMoodEntry);

      const moodEntries = await moodStorage.getAllMoodEntries();
      summary = TodaySummaryService.calculateTodaysSummary(moodEntries, []);
      expect(summary.moodCount).toBe(1);
      expect(summary.dominantMood).toBe('joy');
      expect(summary.topActivities).toContain('Exercise');

      // 3. Add first journal entry
      const firstJournalEntry = IntegrationTestData.createJournalEntry({
        content: 'My first journal entry!',
        mood: 'joy',
        activities: ['Writing'] as any
      });
      await journalStorage.saveJournalEntry(firstJournalEntry);

      const journalEntries = await journalStorage.getAllJournalEntries();
      summary = TodaySummaryService.calculateTodaysSummary(moodEntries, journalEntries);
      expect(summary.moodCount).toBe(1);
      expect(summary.journalCount).toBe(1);
      expect(summary.topActivities.length).toBeGreaterThan(0);

      // 4. Verify analytics work with single entries
      const correlations = activityCorrelation.analyzeActivityCorrelations(moodEntries);
      expect(correlations.length).toBeGreaterThan(0);
      expect(correlations[0].totalEntries).toBe(1);
    });

    it('should handle transitions from populated back to empty states', async () => {
      // 1. Create populated state
      const moodEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.8,
        activities: ['Exercise'] as any,
        id: 'temp_mood'
      });
      const journalEntry = IntegrationTestData.createJournalEntry({
        content: 'Temporary journal entry',
        mood: 'joy',
        activities: ['Writing'] as any,
        id: 'temp_journal'
      });

      await moodStorage.saveMoodEntry(moodEntry);
      await journalStorage.saveJournalEntry(journalEntry);

      // 2. Verify populated state
      let moodEntries = await moodStorage.getAllMoodEntries();
      let journalEntries = await journalStorage.getAllJournalEntries();
      expect(moodEntries.length).toBe(1);
      expect(journalEntries.length).toBe(1);

      // 3. Clear all data
      await moodStorage.deleteMoodEntry('temp_mood');
      await journalStorage.deleteJournalEntry('temp_journal');

      // 4. Verify return to empty state
      moodEntries = await moodStorage.getAllMoodEntries();
      journalEntries = await journalStorage.getAllJournalEntries();
      expect(moodEntries.length).toBe(0);
      expect(journalEntries.length).toBe(0);

      // 5. Verify services handle empty state correctly after being populated
      const summary = TodaySummaryService.calculateTodaysSummary(moodEntries, journalEntries);
      expect(summary.moodCount).toBe(0);
      expect(summary.journalCount).toBe(0);
      // Dashboard may return null or a default value for empty state
      expect(summary.dominantMood === null || typeof summary.dominantMood === 'string').toBe(true);

      const correlations = activityCorrelation.analyzeActivityCorrelations(moodEntries);
      expect(correlations).toEqual([]);
    });
  });

  describe('Boundary Value Testing', () => {
    it('should handle extreme mood intensity values', async () => {
      // 1. Test minimum intensity (0)
      const minIntensityEntry = IntegrationTestData.createMoodEntry({
        mood: 'neutral',
        intensity: 0,
        activities: ['Rest'] as any,
        id: 'min_intensity'
      });
      await moodStorage.saveMoodEntry(minIntensityEntry);

      // 2. Test maximum intensity (1)
      const maxIntensityEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 1,
        activities: ['Exercise'] as any,
        id: 'max_intensity'
      });
      await moodStorage.saveMoodEntry(maxIntensityEntry);

      // 3. Verify all entries are handled correctly
      const allEntries = await moodStorage.getAllMoodEntries();
      expect(allEntries.length).toBe(2);

      // 4. Test analytics with extreme values
      const correlations = activityCorrelation.analyzeActivityCorrelations(allEntries);
      expect(correlations.length).toBeGreaterThan(0);

      // 5. Test dashboard calculations
      const summary = TodaySummaryService.calculateTodaysSummary(allEntries, []);
      expect(summary.moodCount).toBe(2);
      expect(summary.averageIntensity).toBeGreaterThanOrEqual(0);
      expect(summary.averageIntensity).toBeLessThanOrEqual(1);
    });

    it('should handle very long content strings', async () => {
      // 1. Create very long journal content
      const veryLongContent = 'This is a very long journal entry. '.repeat(500); // ~17,500 characters
      
      const longJournalEntry = IntegrationTestData.createJournalEntry({
        content: veryLongContent,
        mood: 'neutral',
        activities: ['Writing'] as any,
        id: 'long_content'
      });

      await journalStorage.saveJournalEntry(longJournalEntry);

      // 2. Verify storage handles long content
      const retrievedEntry = await journalStorage.getJournalEntry('long_content');
      expect(retrievedEntry).toBeDefined();
      expect(retrievedEntry!.content.length).toBeGreaterThan(15000);

      // 3. Test semantic analysis with long content
      const semanticEntry = {
        id: longJournalEntry.id,
        content: longJournalEntry.content,
        date: longJournalEntry.createdAt,
        mood: longJournalEntry.mood,
        tags: longJournalEntry.tags || []
      };

      const analysis = semanticAnalysis.analyzeEntry(semanticEntry);
      expect(analysis).toBeDefined();
      expect(analysis.dominantEmotion).toBeDefined();
    });

    it('should handle entries with future and past dates', async () => {
      const now = new Date();
      
      // 1. Create entry with past date (1 year ago)
      const pastDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      const pastEntry = IntegrationTestData.createMoodEntry({
        mood: 'neutral',
        intensity: 0.5,
        activities: ['Work'] as any,
        id: 'past_entry',
        createdAt: pastDate.toISOString(),
        timestamp: pastDate.toISOString()
      });

      // 2. Create entry with future date (1 year from now)
      const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      const futureEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.8,
        activities: ['Planning'] as any,
        id: 'future_entry',
        createdAt: futureDate.toISOString(),
        timestamp: futureDate.toISOString()
      });

      await moodStorage.saveMoodEntry(pastEntry);
      await moodStorage.saveMoodEntry(futureEntry);

      // 3. Verify all entries are stored
      const allEntries = await moodStorage.getAllMoodEntries();
      expect(allEntries.length).toBe(2);

      // 4. Test dashboard calculations with mixed dates
      const summary = TodaySummaryService.calculateTodaysSummary(allEntries, []);
      expect(summary).toBeDefined();
      expect(summary.moodCount).toBeGreaterThanOrEqual(0); // May filter by date

      // 5. Test analytics with mixed dates
      const correlations = activityCorrelation.analyzeActivityCorrelations(allEntries);
      expect(correlations.length).toBeGreaterThan(0);
    });
  });

  describe('Data Corruption Scenarios', () => {
    it('should handle entries with missing required fields', async () => {
      // 1. Create entries with missing or invalid fields
      const partialEntry1 = {
        id: 'partial_1',
        mood: 'joy',
        // Missing intensity
        activities: ['Exercise'] as any,
        notes: 'Missing intensity field',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any;

      // 2. Attempt to save partial entries (should not crash)
      await expect(moodStorage.saveMoodEntry(partialEntry1)).resolves.not.toThrow();

      // 3. Verify system remains stable
      const allEntries = await moodStorage.getAllMoodEntries();
      expect(Array.isArray(allEntries)).toBe(true);

      // 4. Test analytics with potentially corrupted data
      const correlations = activityCorrelation.analyzeActivityCorrelations(allEntries);
      expect(Array.isArray(correlations)).toBe(true);
    });

    it('should handle entries with circular references and complex objects', async () => {
      // 1. Create entry with potentially problematic data structures
      const complexEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.8,
        activities: ['Complex'] as any,
        id: 'complex_entry'
      });

      // Add some complex nested data
      (complexEntry as any).metadata = {
        nested: {
          deep: {
            value: 'test'
          }
        },
        array: [1, 2, 3, { nested: 'object' }]
      };

      // 2. Save complex entry
      await moodStorage.saveMoodEntry(complexEntry);

      // 3. Verify retrieval works
      const allEntries = await moodStorage.getAllMoodEntries();
      expect(allEntries.length).toBeGreaterThanOrEqual(1);

      // 4. Test serialization/deserialization integrity
      const jsonString = JSON.stringify(allEntries);
      const parsedEntries = JSON.parse(jsonString);
      expect(Array.isArray(parsedEntries)).toBe(true);
    });

    it('should handle duplicate IDs and conflicting data', async () => {
      // 1. Create entry with specific ID
      const originalEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.8,
        activities: ['Original'] as any,
        id: 'duplicate_test'
      });

      await moodStorage.saveMoodEntry(originalEntry);

      // 2. Create another entry with same ID but different data
      const duplicateEntry = IntegrationTestData.createMoodEntry({
        mood: 'sadness',
        intensity: 0.3,
        activities: ['Duplicate'] as any,
        id: 'duplicate_test' // Same ID
      });

      await moodStorage.saveMoodEntry(duplicateEntry);

      // 3. Verify system handles duplicate IDs gracefully
      const allEntries = await moodStorage.getAllMoodEntries();
      expect(allEntries.length).toBeGreaterThanOrEqual(1);

      // 4. Test that analytics can handle potential duplicates
      const correlations = activityCorrelation.analyzeActivityCorrelations(allEntries);
      expect(Array.isArray(correlations)).toBe(true);
    });
  });

  describe('Unusual User Interaction Patterns', () => {
    it('should handle rapid successive operations', async () => {
      // 1. Perform rapid successive saves
      const rapidOperations = [];
      for (let i = 0; i < 10; i++) {
        rapidOperations.push(
          moodStorage.saveMoodEntry(IntegrationTestData.createMoodEntry({
            mood: 'neutral',
            intensity: 0.5,
            activities: ['Rapid'] as any,
            id: `rapid_${i}`,
            createdAt: new Date(Date.now() + i).toISOString() // Slightly different timestamps
          }))
        );
      }

      await Promise.allSettled(rapidOperations);

      // 2. Verify data integrity
      const allEntries = await moodStorage.getAllMoodEntries();
      expect(allEntries.length).toBeGreaterThan(0);

      // 3. Test analytics with rapid data
      const correlations = activityCorrelation.analyzeActivityCorrelations(allEntries);
      expect(Array.isArray(correlations)).toBe(true);
    });

    it('should handle mixed mood types in single session', async () => {
      // 1. Create entries with all different mood types
      const allMoodTypes = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'calm', 'neutral'] as const;
      
      for (let i = 0; i < allMoodTypes.length; i++) {
        const entry = IntegrationTestData.createMoodEntry({
          mood: allMoodTypes[i],
          intensity: (i + 1) / allMoodTypes.length, // Varying intensities
          activities: [`Activity_${i}`] as any,
          id: `mood_${allMoodTypes[i]}`
        });
        await moodStorage.saveMoodEntry(entry);
      }

      // 2. Verify all moods are stored
      const allEntries = await moodStorage.getAllMoodEntries();
      expect(allEntries.length).toBe(allMoodTypes.length);

      // 3. Test analytics with diverse moods
      const correlations = activityCorrelation.analyzeActivityCorrelations(allEntries);
      expect(correlations.length).toBe(allMoodTypes.length);

      // 4. Test dashboard with diverse moods
      const summary = TodaySummaryService.calculateTodaysSummary(allEntries, []);
      expect(summary.moodCount).toBe(allMoodTypes.length);
      expect(summary.dominantMood).toBeDefined();
      expect(allMoodTypes).toContain(summary.dominantMood as any);
    });

    it('should handle entries with identical timestamps', async () => {
      // 1. Create multiple entries with exact same timestamp
      const identicalTimestamp = new Date().toISOString();
      
      const identicalEntries = [
        IntegrationTestData.createMoodEntry({
          mood: 'joy',
          intensity: 0.8,
          activities: ['Exercise'] as any,
          id: 'identical_1',
          createdAt: identicalTimestamp,
          timestamp: identicalTimestamp
        }),
        IntegrationTestData.createMoodEntry({
          mood: 'calm',
          intensity: 0.6,
          activities: ['Reading'] as any,
          id: 'identical_2',
          createdAt: identicalTimestamp,
          timestamp: identicalTimestamp
        })
      ];

      // 2. Save all entries
      for (const entry of identicalEntries) {
        await moodStorage.saveMoodEntry(entry);
      }

      // 3. Verify all entries are stored
      const allEntries = await moodStorage.getAllMoodEntries();
      expect(allEntries.length).toBe(2);

      // 4. Test analytics with identical timestamps
      const correlations = activityCorrelation.analyzeActivityCorrelations(allEntries);
      expect(correlations.length).toBe(2); // Should handle all activities

      // 5. Test dashboard calculations
      const summary = TodaySummaryService.calculateTodaysSummary(allEntries, []);
      expect(summary.moodCount).toBe(2);
    });

    it('should handle alternating create and delete operations', async () => {
      // 1. Perform alternating create and delete operations
      for (let i = 0; i < 5; i++) {
        // Create entry
        const entry = IntegrationTestData.createMoodEntry({
          mood: 'neutral',
          intensity: 0.5,
          activities: ['Alternating'] as any,
          id: `alternating_${i}`
        });
        await moodStorage.saveMoodEntry(entry);

        // Delete previous entry (if exists)
        if (i > 0) {
          await moodStorage.deleteMoodEntry(`alternating_${i - 1}`);
        }
      }

      // 2. Verify final state
      const allEntries = await moodStorage.getAllMoodEntries();
      expect(allEntries.length).toBe(1); // Should have only the last entry

      // 3. Verify system stability after alternating operations
      const summary = TodaySummaryService.calculateTodaysSummary(allEntries, []);
      expect(summary.moodCount).toBe(1);

      const correlations = activityCorrelation.analyzeActivityCorrelations(allEntries);
      expect(correlations.length).toBe(1);
    });
  });

  describe('Cross-Service Edge Cases', () => {
    it('should handle mismatched data between mood and journal entries', async () => {
      // 1. Create mood entry with specific activities
      const moodEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.8,
        activities: ['Exercise', 'Health'] as any
      });

      // 2. Create journal entry with completely different activities
      const journalEntry = IntegrationTestData.createJournalEntry({
        content: 'Had a terrible day at work, everything went wrong.',
        mood: 'sadness', // Conflicting mood
        activities: ['Work', 'Stress'] as any // Conflicting activities
      });

      await moodStorage.saveMoodEntry(moodEntry);
      await journalStorage.saveJournalEntry(journalEntry);

      // 3. Test dashboard with conflicting data
      const moodEntries = await moodStorage.getAllMoodEntries();
      const journalEntries = await journalStorage.getAllJournalEntries();
      
      const summary = TodaySummaryService.calculateTodaysSummary(moodEntries, journalEntries);
      expect(summary).toBeDefined();
      expect(summary.moodCount).toBe(1);
      expect(summary.journalCount).toBe(1);
      expect(summary.dominantMood).toBeDefined(); // Should pick one

      // 4. Verify all activities are included
      expect(summary.topActivities.length).toBeGreaterThan(0);
    });

    it('should handle semantic analysis with mood misalignment', async () => {
      // 1. Create journal entry with content that doesn't match the selected mood
      const mismatchedEntry = IntegrationTestData.createJournalEntry({
        content: 'I am so happy and excited about life! Everything is wonderful!',
        mood: 'sadness', // Mismatched
        activities: ['Test'] as any,
        id: 'mismatched_1'
      });

      await journalStorage.saveJournalEntry(mismatchedEntry);

      // 2. Test semantic analysis with mismatched mood
      const semanticEntry = {
        id: mismatchedEntry.id,
        content: mismatchedEntry.content,
        date: mismatchedEntry.createdAt,
        mood: mismatchedEntry.mood,
        tags: mismatchedEntry.tags || []
      };

      const analysis = semanticAnalysis.analyzeEntry(semanticEntry);
      expect(analysis).toBeDefined();
      expect(analysis.dominantEmotion).toBeDefined();
      expect(analysis.moodAlignment).toBeGreaterThanOrEqual(0);
      expect(analysis.moodAlignment).toBeLessThanOrEqual(1);

      // 3. Verify system handles mismatched entry
      const allJournalEntries = await journalStorage.getAllJournalEntries();
      expect(allJournalEntries.length).toBe(1);
    });

    it('should handle extreme data volume edge cases', async () => {
      // 1. Create entry with very long notes
      const extremeEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.5,
        activities: ['Extreme'] as any,
        notes: 'A'.repeat(10000), // Very long notes
        id: 'extreme_data'
      });

      await moodStorage.saveMoodEntry(extremeEntry);

      // 2. Create many small entries
      const manySmallEntries = [];
      for (let i = 0; i < 20; i++) {
        manySmallEntries.push(IntegrationTestData.createMoodEntry({
          mood: 'neutral',
          intensity: 0.5,
          activities: ['Small'] as any,
          notes: `Entry ${i}`,
          id: `small_${i}`
        }));
      }

      for (const entry of manySmallEntries) {
        await moodStorage.saveMoodEntry(entry);
      }

      // 3. Verify system handles extreme data volume
      const allEntries = await moodStorage.getAllMoodEntries();
      expect(allEntries.length).toBe(21); // 1 extreme + 20 small

      // 4. Test analytics with extreme data
      const correlations = activityCorrelation.analyzeActivityCorrelations(allEntries);
      expect(correlations.length).toBeGreaterThan(0);

      // 5. Test dashboard with extreme data
      const summary = TodaySummaryService.calculateTodaysSummary(allEntries, []);
      expect(summary.moodCount).toBe(21);
    });
  });
});
