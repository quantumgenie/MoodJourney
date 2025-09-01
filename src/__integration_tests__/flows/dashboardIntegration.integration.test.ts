/**
 * Dashboard Integration Tests
 * 
 * Tests the complete data aggregation flow for the Dashboard screen:
 * - Data from multiple storage services
 * - TodaySummaryService calculations
 * - Real-time data updates
 * - Dashboard state management
 */

import { testHelper } from '../setup/simpleIntegrationSetup';
import { IntegrationTestData } from '../setup/testData';
import { MoodStorageService } from '../../services/storage/moodStorage';
import { JournalStorageService } from '../../services/storage/journalStorage';
import { TodaySummaryService } from '../../services/dashboard/todaySummaryService';
import { ActivityCorrelationService } from '../../services/analytics/activityCorrelationService';
import { SemanticAnalysisService } from '../../services/semanticAnalysis/semanticAnalysisService';

describe('Dashboard Integration Tests', () => {
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

  describe('Dashboard Data Aggregation', () => {
    it('should aggregate data from all sources for dashboard display', async () => {
      // 1. Create diverse data across different days
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      // Today's data
      const todayMoodEntries = [
        IntegrationTestData.createMoodEntry({
          mood: 'joy',
          intensity: 0.8,
          activities: ['Exercise', 'Social'],
          timestamp: today.toISOString()
        }),
        IntegrationTestData.createMoodEntry({
          mood: 'calm',
          intensity: 0.7,
          activities: ['Meditation', 'Reading'],
          timestamp: today.toISOString()
        })
      ];

      const todayJournalEntry = IntegrationTestData.createJournalEntry({
        content: 'Had a wonderful day with friends and a great workout session. Feeling energized and happy!',
        mood: 'joy',
        activities: ['Exercise', 'Social'],
        createdAt: today.toISOString()
      });

      // Historical data for trends
      const historicalMoodEntries = [
        IntegrationTestData.createMoodEntry({
          mood: 'sadness',
          intensity: 0.3,
          activities: ['Work'],
          timestamp: yesterday.toISOString()
        }),
        IntegrationTestData.createMoodEntry({
          mood: 'neutral',
          intensity: 0.5,
          activities: ['Rest'],
          timestamp: twoDaysAgo.toISOString()
        })
      ];

      // 2. Save all data
      for (const entry of [...todayMoodEntries, ...historicalMoodEntries]) {
        await moodStorage.saveMoodEntry(entry);
      }
      await journalStorage.saveJournalEntry(todayJournalEntry);

      // 3. Simulate dashboard data loading
      const allMoodEntries = await moodStorage.getAllMoodEntries();
      const allJournalEntries = await journalStorage.getAllJournalEntries();

      // 4. Calculate dashboard summary
      const todaysSummary = TodaySummaryService.calculateTodaysSummary(
        allMoodEntries,
        allJournalEntries
      );

      // 5. Verify dashboard data aggregation
      expect(todaysSummary.hasData).toBe(true);
      expect(todaysSummary.moodCount).toBe(2); // Today's mood entries
      expect(todaysSummary.journalCount).toBe(1); // Today's journal entries
      expect(todaysSummary.dominantMood).toBe('joy'); // Most frequent today
      expect(todaysSummary.topActivities).toEqual(
        expect.arrayContaining(['Exercise', 'Social', 'Meditation'])
      );
      expect(todaysSummary.averageIntensity).toBeCloseTo(0.75, 1); // (0.8 + 0.7) / 2
      expect(todaysSummary.moodTrend).toBe('declining'); // Based on actual test data sequence
    });

    it('should handle empty dashboard state correctly', async () => {
      // 1. Ensure no data exists
      const allMoodEntries = await moodStorage.getAllMoodEntries();
      const allJournalEntries = await journalStorage.getAllJournalEntries();

      expect(allMoodEntries).toHaveLength(0);
      expect(allJournalEntries).toHaveLength(0);

      // 2. Calculate summary for empty state
      const todaysSummary = TodaySummaryService.calculateTodaysSummary(
        allMoodEntries,
        allJournalEntries
      );

      // 3. Verify empty state handling
      expect(todaysSummary.hasData).toBe(false);
      expect(todaysSummary.moodCount).toBe(0);
      expect(todaysSummary.journalCount).toBe(0);
      expect(todaysSummary.dominantMood).toBe(null);
      expect(todaysSummary.topActivities).toEqual([]);
      expect(todaysSummary.averageIntensity).toBe(0);
      expect(todaysSummary.moodTrend).toBe('insufficient_data');
    });

    it('should provide real-time updates when new data is added', async () => {
      // 1. Start with some initial data
      const initialMoodEntry = IntegrationTestData.createMoodEntry({
        mood: 'neutral',
        intensity: 0.5,
        activities: ['Work']
      });
      await moodStorage.saveMoodEntry(initialMoodEntry);

      // 2. Get initial dashboard state
      let allMoodEntries = await moodStorage.getAllMoodEntries();
      let allJournalEntries = await journalStorage.getAllJournalEntries();
      let todaysSummary = TodaySummaryService.calculateTodaysSummary(
        allMoodEntries,
        allJournalEntries
      );

      expect(todaysSummary.moodCount).toBe(1);
      expect(todaysSummary.dominantMood).toBe('neutral');
      expect(todaysSummary.averageIntensity).toBe(0.5);

      // 3. Add new mood entry (simulating real-time update)
      const newMoodEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.9,
        activities: ['Exercise', 'Social']
      });
      await moodStorage.saveMoodEntry(newMoodEntry);

      // 4. Add new journal entry
      const newJournalEntry = IntegrationTestData.createJournalEntry({
        content: 'Just finished an amazing workout! Feeling fantastic.',
        mood: 'joy',
        activities: ['Exercise']
      });
      await journalStorage.saveJournalEntry(newJournalEntry);

      // 5. Get updated dashboard state
      allMoodEntries = await moodStorage.getAllMoodEntries();
      allJournalEntries = await journalStorage.getAllJournalEntries();
      todaysSummary = TodaySummaryService.calculateTodaysSummary(
        allMoodEntries,
        allJournalEntries
      );

      // 6. Verify real-time updates
      expect(todaysSummary.moodCount).toBe(2);
      expect(todaysSummary.journalCount).toBe(1);
      expect(todaysSummary.dominantMood).toBe('joy'); // Changed from neutral
      expect(todaysSummary.averageIntensity).toBeCloseTo(0.7, 1); // (0.5 + 0.9) / 2
      expect(todaysSummary.topActivities).toEqual(
        expect.arrayContaining(['Work', 'Exercise', 'Social'])
      );
    });
  });

  describe('Dashboard Analytics Integration', () => {
    it('should integrate activity correlation data for dashboard insights', async () => {
      // 1. Create data with clear activity-mood patterns
      const activityMoodData = [
        // Exercise consistently improves mood
        { mood: 'joy' as const, intensity: 0.9, activities: ['Exercise'] as any },
        { mood: 'joy' as const, intensity: 0.8, activities: ['Exercise', 'Social'] as any },
        { mood: 'calm' as const, intensity: 0.7, activities: ['Exercise'] as any },
        
        // Work tends to lower mood
        { mood: 'sadness' as const, intensity: 0.3, activities: ['Work'] as any },
        { mood: 'anger' as const, intensity: 0.4, activities: ['Work'] as any },
        { mood: 'neutral' as const, intensity: 0.5, activities: ['Work'] as any },
        
        // Social activities boost mood
        { mood: 'joy' as const, intensity: 0.8, activities: ['Social'] as any },
        { mood: 'joy' as const, intensity: 0.9, activities: ['Social', 'Friends'] as any },
      ];

      // 2. Save all mood entries
      for (const data of activityMoodData) {
        const entry = IntegrationTestData.createMoodEntry(data);
        await moodStorage.saveMoodEntry(entry);
      }

      // 3. Get dashboard data
      const allMoodEntries = await moodStorage.getAllMoodEntries();
      const todaysSummary = TodaySummaryService.calculateTodaysSummary(allMoodEntries, []);

      // 4. Calculate activity correlations for dashboard insights
      const activityCorrelations = activityCorrelation.analyzeActivityCorrelations(allMoodEntries);

      // 5. Verify dashboard can use correlation data
      expect(todaysSummary.hasData).toBe(true);
      expect(activityCorrelations.length).toBeGreaterThan(0);

      // Find specific correlations
      const exerciseCorrelation = activityCorrelations.find(c => c.activity === 'Exercise');
      const workCorrelation = activityCorrelations.find(c => c.activity === 'Work');
      const socialCorrelation = activityCorrelations.find(c => c.activity === 'Social');

      // 6. Verify correlation insights for dashboard
      expect(exerciseCorrelation).toBeDefined();
      expect(exerciseCorrelation!.averageMoodScore).toBeGreaterThan(6); // Should be positive
      
      expect(workCorrelation).toBeDefined();
      expect(workCorrelation!.averageMoodScore).toBeLessThan(5); // Should be negative
      
      expect(socialCorrelation).toBeDefined();
      expect(socialCorrelation!.averageMoodScore).toBeGreaterThan(6); // Should be positive
    });

    it('should integrate semantic analysis for dashboard journal insights', async () => {
      // 1. Create journal entries with varying emotional content
      const journalEntries = [
        {
          content: 'Had an absolutely wonderful day! Went for a run and met up with friends. Feeling so grateful and happy.',
          mood: 'joy' as const,
          activities: ['Exercise', 'Social'] as any
        },
        {
          content: 'Work was really stressful today. Lots of deadlines and pressure. Feeling overwhelmed and anxious.',
          mood: 'anger' as const,
          activities: ['Work'] as any
        },
        {
          content: 'Quiet evening at home reading a good book. Peaceful and content.',
          mood: 'calm' as const,
          activities: ['Reading', 'Rest'] as any
        }
      ];

      // 2. Save journal entries
      for (const data of journalEntries) {
        const entry = IntegrationTestData.createJournalEntry(data);
        await journalStorage.saveJournalEntry(entry);
      }

      // 3. Get dashboard data
      const allJournalEntries = await journalStorage.getAllJournalEntries();
      const todaysSummary = TodaySummaryService.calculateTodaysSummary([], allJournalEntries);

      // 4. Perform semantic analysis on journal entries (convert to semantic analysis format)
      const analysisResults = allJournalEntries.map(entry => {
        const semanticEntry = {
          id: entry.id,
          content: entry.content,
          date: entry.createdAt,
          mood: entry.mood,
          tags: entry.tags || []
        };
        return semanticAnalysis.analyzeEntry(semanticEntry);
      });

      // 5. Verify dashboard can integrate semantic analysis
      expect(todaysSummary.journalCount).toBe(3);
      expect(analysisResults).toHaveLength(3);

      // Check that semantic analysis provides meaningful insights
      // Verify that all analysis results have the required properties
      analysisResults.forEach(result => {
        expect(result.dominantEmotion).toBeDefined();
        expect(typeof result.dominantEmotion).toBe('string');
        expect(result.moodAlignment).toBeDefined();
        expect(typeof result.moodAlignment).toBe('number');
        expect(result.suggestedTags).toBeDefined();
        expect(Array.isArray(result.suggestedTags)).toBe(true);
      });

      // Verify that at least one analysis has meaningful mood alignment
      const meaningfulAnalysis = analysisResults.find(result => 
        result.moodAlignment > 0.3
      );
      expect(meaningfulAnalysis).toBeDefined();

      // Verify that at least one analysis provides suggested tags
      const analysisWithTags = analysisResults.find(result => 
        result.suggestedTags.length > 0
      );
      expect(analysisWithTags).toBeDefined();
    });
  });

  describe('Dashboard Performance Integration', () => {
    it('should handle dashboard data loading efficiently with large datasets', async () => {
      // 1. Create large dataset
      const largeMoodDataset = Array.from({ length: 200 }, (_, i) => {
        const moods = ['joy', 'calm', 'neutral', 'sadness', 'anger'];
        const activities = [['Exercise'], ['Work'], ['Social'], ['Rest'], ['Reading']];
        
        return IntegrationTestData.createMoodEntry({
          mood: moods[i % moods.length] as any,
          intensity: Math.random(),
          activities: activities[i % activities.length] as any
        });
      });

      const largeJournalDataset = Array.from({ length: 50 }, (_, i) => 
        IntegrationTestData.createJournalEntry({
          content: `Journal entry ${i}: Reflecting on my day and emotions.`,
          mood: ['joy', 'calm', 'neutral', 'sadness'][i % 4] as any,
          activities: [['Reading'], ['Work'], ['Social'], ['Rest']][i % 4] as any
        })
      );

      // 2. Measure performance
      const startTime = Date.now();

      // Save all data
      for (const entry of largeMoodDataset) {
        await moodStorage.saveMoodEntry(entry);
      }
      for (const entry of largeJournalDataset) {
        await journalStorage.saveJournalEntry(entry);
      }

      // Load and calculate dashboard data
      const allMoodEntries = await moodStorage.getAllMoodEntries();
      const allJournalEntries = await journalStorage.getAllJournalEntries();
      const todaysSummary = TodaySummaryService.calculateTodaysSummary(
        allMoodEntries,
        allJournalEntries
      );

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 3. Verify performance and data integrity
      expect(allMoodEntries).toHaveLength(200);
      expect(allJournalEntries).toHaveLength(50);
      expect(todaysSummary).toBeDefined();
      expect(todaysSummary.hasData).toBe(true);
      
      // Performance should be reasonable (less than 5 seconds for this dataset)
      expect(executionTime).toBeLessThan(5000);
      
      // Dashboard should still provide meaningful data
      expect(todaysSummary.dominantMood).not.toBe(null);
      expect(todaysSummary.topActivities.length).toBeGreaterThan(0);
    });
  });
});
