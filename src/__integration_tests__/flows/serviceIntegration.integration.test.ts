/**
 * Service Integration Tests
 * 
 * Tests how different services work together without UI components
 * Focuses on data flow, storage, and business logic integration
 */

import { testHelper } from '../setup/simpleIntegrationSetup';
import { IntegrationTestData } from '../setup/testData';
import { MoodStorageService } from '../../services/storage/moodStorage';
import { JournalStorageService } from '../../services/storage/journalStorage';
import { TodaySummaryService } from '../../services/dashboard/todaySummaryService';
import { ActivityCorrelationService } from '../../services/analytics/activityCorrelationService';
import { SemanticAnalysisService } from '../../services/semanticAnalysis/semanticAnalysisService';

describe('Service Integration Tests', () => {
  let moodStorage: MoodStorageService;
  let journalStorage: JournalStorageService;
  let activityCorrelation: ActivityCorrelationService;
  let semanticAnalysis: SemanticAnalysisService;

  beforeEach(async () => {
    await testHelper.clearStorage();
    moodStorage = MoodStorageService.getInstance();
    journalStorage = JournalStorageService.getInstance();
    activityCorrelation = new ActivityCorrelationService();
    semanticAnalysis = new SemanticAnalysisService();
  });

  describe('Mood Logging Integration', () => {
    it('should save mood entry and update dashboard summary', async () => {
      // 1. Create and save a mood entry
      const moodEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.8,
        activities: ['Exercise'],
        notes: 'Great workout today!'
      });

      await moodStorage.saveMoodEntry(moodEntry);

      // 2. Verify data was saved to storage
      testHelper.expectStorageSave('@MoodJourney:moodEntries');

      // 3. Retrieve all mood entries
      const savedEntries = await moodStorage.getAllMoodEntries();
      expect(savedEntries).toHaveLength(1);
      expect(savedEntries[0].mood).toBe('joy');
      expect(savedEntries[0].activities).toContain('Exercise');

      // 4. Generate today's summary from the saved data
      const summary = TodaySummaryService.calculateTodaysSummary(savedEntries, []);
      
      // 5. Verify summary reflects the mood entry
      expect(summary.dominantMood).toBe('joy');
      expect(summary.topActivities).toContain('Exercise');
      expect(summary.averageIntensity).toBe(0.8);
    });

    it('should handle multiple mood entries and calculate trends', async () => {
      // Create a series of mood entries showing improvement
      const entries = [
        IntegrationTestData.createMoodEntry({
          mood: 'sadness',
          intensity: 0.3,
          timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        }),
        IntegrationTestData.createMoodEntry({
          mood: 'neutral',
          intensity: 0.5,
          timestamp: new Date(Date.now() - 1800000).toISOString() // 30 min ago
        }),
        IntegrationTestData.createMoodEntry({
          mood: 'joy',
          intensity: 0.8,
          timestamp: new Date().toISOString() // now
        })
      ];

      // Save all entries
      for (const entry of entries) {
        await moodStorage.saveMoodEntry(entry);
      }

      // Retrieve and verify
      const savedEntries = await moodStorage.getAllMoodEntries();
      expect(savedEntries).toHaveLength(3);

      // Calculate summary
      const summary = TodaySummaryService.calculateTodaysSummary(savedEntries, []);
      
      // Should show improving trend
      expect(summary.moodTrend).toBe('improving');
      expect(summary.dominantMood).toBe('joy'); // Most recent/frequent
    });
  });

  describe('Journal Entry Integration', () => {
    it('should save journal entry and perform semantic analysis', async () => {
      // 1. Create journal entry with emotional content
      const journalEntry = IntegrationTestData.createJournalEntry({
        title: 'Amazing Day',
        content: 'I am so happy and excited about this wonderful day! Feeling joyful and grateful for everything.',
        mood: 'joy'
      });

      // 2. Perform semantic analysis on the content
      const analysis = semanticAnalysis.analyzeEntry({
        id: journalEntry.id,
        content: journalEntry.content,
        date: journalEntry.createdAt,
        mood: journalEntry.mood
      });

      // 3. Verify semantic analysis results
      expect(analysis.dominantEmotion).toBe('joy');
      expect(analysis.emotionDistribution.joy).toBeGreaterThan(0);
      expect(analysis.highlightedWords.length).toBeGreaterThan(0);

      // 4. Save journal entry
      await journalStorage.saveJournalEntry(journalEntry);

      // 5. Verify storage
      testHelper.expectStorageSave('@MoodJourney:journalEntries');

      // 6. Retrieve and verify
      const savedEntries = await journalStorage.getAllJournalEntries();
      expect(savedEntries).toHaveLength(1);
      expect(savedEntries[0].content).toContain('happy');
    });

    it('should integrate journal and mood data for comprehensive summary', async () => {
      // Create related mood and journal entries
      const moodEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.9,
        activities: ['Exercise', 'Social']
      });

      const journalEntry = IntegrationTestData.createJournalEntry({
        content: 'Had an amazing workout with friends today. Feeling energized and happy!',
        mood: 'joy',
        activities: ['Exercise', 'Social']
      });

      // Save both
      await moodStorage.saveMoodEntry(moodEntry);
      await journalStorage.saveJournalEntry(journalEntry);

      // Retrieve data
      const moodEntries = await moodStorage.getAllMoodEntries();
      const journalEntries = await journalStorage.getAllJournalEntries();

      // Generate comprehensive summary
      const summary = TodaySummaryService.calculateTodaysSummary(moodEntries, journalEntries);

      // Verify integration
      expect(summary.dominantMood).toBe('joy');
      expect(summary.topActivities).toEqual(expect.arrayContaining(['Exercise', 'Social']));
      expect(summary.averageIntensity).toBe(0.9);
    });
  });

  describe('Analytics Integration', () => {
    it('should analyze activity correlations from multiple data sources', async () => {
      // Create diverse mood entries with different activities
      const moodEntries = [
        IntegrationTestData.createMoodEntry({ mood: 'joy', intensity: 0.9, activities: ['Exercise'] }),
        IntegrationTestData.createMoodEntry({ mood: 'joy', intensity: 0.8, activities: ['Exercise'] }),
        IntegrationTestData.createMoodEntry({ mood: 'calm', intensity: 0.7, activities: ['Exercise'] }),
        IntegrationTestData.createMoodEntry({ mood: 'sadness', intensity: 0.3, activities: ['Work'] }),
        IntegrationTestData.createMoodEntry({ mood: 'anger', intensity: 0.4, activities: ['Work'] }),
      ];

      // Save all entries
      for (const entry of moodEntries) {
        await moodStorage.saveMoodEntry(entry);
      }

      // Retrieve saved data
      const savedEntries = await moodStorage.getAllMoodEntries();

      // Perform correlation analysis
      const correlations = activityCorrelation.analyzeActivityCorrelations(savedEntries);

      // Verify analysis results
      expect(correlations.length).toBeGreaterThan(0);
      
      const exerciseCorrelation = correlations.find(c => c.activity === 'Exercise');
      const workCorrelation = correlations.find(c => c.activity === 'Work');

      expect(exerciseCorrelation).toBeDefined();
      expect(workCorrelation).toBeDefined();

      // Exercise should have higher mood score than work
      expect(exerciseCorrelation!.averageMoodScore).toBeGreaterThan(workCorrelation!.averageMoodScore);

      // Generate insights
      const insights = activityCorrelation.generateInsights(correlations);
      expect(insights.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cross-Service Data Flow', () => {
    it('should maintain data consistency across all services', async () => {
      // Create comprehensive test scenario
      const scenario = IntegrationTestData.createCompleteUserScenario();

      // Save all mood entries
      for (const entry of scenario.moodEntries) {
        await moodStorage.saveMoodEntry(entry);
      }

      // Save all journal entries
      for (const entry of scenario.journalEntries) {
        await journalStorage.saveJournalEntry(entry);
      }

      // Verify data persistence
      const savedMoodEntries = await moodStorage.getAllMoodEntries();
      const savedJournalEntries = await journalStorage.getAllJournalEntries();

      expect(savedMoodEntries.length).toBe(scenario.moodEntries.length);
      expect(savedJournalEntries.length).toBe(scenario.journalEntries.length);

      // Test cross-service operations
      const summary = TodaySummaryService.calculateTodaysSummary(savedMoodEntries, savedJournalEntries);
      const correlations = activityCorrelation.analyzeActivityCorrelations(savedMoodEntries);

      // Verify all services can work with the data
      expect(summary).toBeDefined();
      expect(correlations).toBeDefined();
      expect(correlations.length).toBeGreaterThan(0);
    });

    it('should handle storage errors gracefully across services', async () => {
      // Mock storage failure
      const mockStorage = testHelper.getMockStorage();
      mockStorage.setItem.mockRejectedValueOnce(new Error('Storage full'));

      const moodEntry = IntegrationTestData.createMoodEntry();

      // Should handle error gracefully (services catch and log errors)
      await expect(moodStorage.saveMoodEntry(moodEntry)).rejects.toThrow('Storage full');

      // Other services should still work
      const emptyEntries = await moodStorage.getAllMoodEntries();
      const summary = TodaySummaryService.calculateTodaysSummary(emptyEntries, []);
      
      expect(summary).toBeDefined();
      expect(summary.dominantMood).toBe(null); // No data means null dominant mood
      expect(summary.hasData).toBe(false); // Should indicate no data available
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      // Create large dataset
      const largeMoodDataset = Array.from({ length: 100 }, (_, i) => 
        IntegrationTestData.createMoodEntry({
          mood: ['joy', 'calm', 'neutral', 'sadness'][i % 4] as any,
          intensity: Math.random(),
          activities: [['Exercise'], ['Work'], ['Social'], ['Rest']][i % 4] as any
        })
      );

      // Measure performance
      const startTime = Date.now();

      // Save all entries
      for (const entry of largeMoodDataset) {
        await moodStorage.saveMoodEntry(entry);
      }

      // Perform analytics
      const savedEntries = await moodStorage.getAllMoodEntries();
      const correlations = activityCorrelation.analyzeActivityCorrelations(savedEntries);
      const summary = TodaySummaryService.calculateTodaysSummary(savedEntries, []);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Verify results
      expect(savedEntries.length).toBe(100);
      expect(correlations.length).toBeGreaterThan(0);
      expect(summary).toBeDefined();

      // Performance should be reasonable (adjust threshold as needed)
      expect(executionTime).toBeLessThan(5000); // 5 seconds max
    });
  });
});
