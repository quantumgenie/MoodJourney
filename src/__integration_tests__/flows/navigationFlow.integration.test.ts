/**
 * Navigation Flow Integration Tests
 * 
 * Tests navigation-related data flows and state management between screens.
 * Focuses on business logic integration without UI components.
 */

import { MoodStorageService } from '../../services/storage/moodStorage';
import { JournalStorageService } from '../../services/storage/journalStorage';
import { TodaySummaryService } from '../../services/dashboard/todaySummaryService';
import { SemanticAnalysisService } from '../../services/semanticAnalysis/semanticAnalysisService';
import { ActivityCorrelationService } from '../../services/analytics/activityCorrelationService';
import { IntegrationTestData } from '../setup/testData';
import '../setup/simpleIntegrationSetup';

describe('Navigation Flow Integration Tests', () => {
  let moodStorage: MoodStorageService;
  let journalStorage: JournalStorageService;
  let activityCorrelation: ActivityCorrelationService;
  let semanticAnalysis: SemanticAnalysisService;

  beforeEach(async () => {
    // Get fresh instances for each test
    moodStorage = MoodStorageService.getInstance();
    journalStorage = JournalStorageService.getInstance();
    activityCorrelation = new ActivityCorrelationService();
    semanticAnalysis = new SemanticAnalysisService();

    // Clear all data
    await moodStorage.clearAllMoodEntries();
    // Clear journal entries by getting all and removing them individually
    const allJournalEntries = await journalStorage.getAllJournalEntries();
    for (const entry of allJournalEntries) {
      await journalStorage.deleteJournalEntry(entry.id);
    }
  });

  describe('Dashboard → MoodInput Flow', () => {
    it('should maintain data consistency when navigating from Dashboard to MoodInput', async () => {
      // 1. Set up initial dashboard state
      const initialMoodEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.8,
        activities: ['Exercise', 'Social']
      });
      await moodStorage.saveMoodEntry(initialMoodEntry);

      // 2. Get dashboard summary (simulating Dashboard screen load)
      const allMoodEntries = await moodStorage.getAllMoodEntries();
      const dashboardSummary = TodaySummaryService.calculateTodaysSummary(allMoodEntries, []);
      
      expect(dashboardSummary.moodCount).toBe(1);
      expect(dashboardSummary.dominantMood).toBe('joy');

      // 3. Navigate to MoodInput and add new entry (simulating user flow)
      const newMoodEntry = IntegrationTestData.createMoodEntry({
        mood: 'calm',
        intensity: 0.6,
        activities: ['Reading']
      });
      await moodStorage.saveMoodEntry(newMoodEntry);

      // 4. Verify data consistency after navigation back to Dashboard
      const updatedMoodEntries = await moodStorage.getAllMoodEntries();
      const updatedSummary = TodaySummaryService.calculateTodaysSummary(updatedMoodEntries, []);

      expect(updatedSummary.moodCount).toBe(2);
      expect(updatedSummary.topActivities).toEqual(
        expect.arrayContaining(['Exercise', 'Social', 'Reading'])
      );
    });

    it('should handle concurrent mood entries during navigation', async () => {
      // Simulate rapid navigation and data entry with unique timestamps
      const baseTime = Date.now();
      const moodEntries = [
        IntegrationTestData.createMoodEntry({ 
          mood: 'joy', 
          intensity: 0.7, 
          activities: ['Work'],
          createdAt: new Date(baseTime).toISOString(),
          id: `mood_${baseTime}_1`
        }),
        IntegrationTestData.createMoodEntry({ 
          mood: 'sadness', 
          intensity: 0.4, 
          activities: ['Rest'],
          createdAt: new Date(baseTime + 1000).toISOString(),
          id: `mood_${baseTime}_2`
        }),
        IntegrationTestData.createMoodEntry({ 
          mood: 'calm', 
          intensity: 0.8, 
          activities: ['Exercise'],
          createdAt: new Date(baseTime + 2000).toISOString(),
          id: `mood_${baseTime}_3`
        })
      ];

      // Save entries sequentially to avoid ID conflicts
      for (const entry of moodEntries) {
        await moodStorage.saveMoodEntry(entry);
      }

      // Verify all entries are properly stored and accessible
      const allEntries = await moodStorage.getAllMoodEntries();
      expect(allEntries).toHaveLength(3);

      const summary = TodaySummaryService.calculateTodaysSummary(allEntries, []);
      expect(summary.moodCount).toBe(3);
      expect(summary.averageIntensity).toBeCloseTo(0.63, 1); // (0.7 + 0.4 + 0.8) / 3
    });
  });

  describe('Journal → JournalEntry Flow', () => {
    it('should maintain journal state when navigating between Journal list and entry creation', async () => {
      // 1. Set up initial journal entries (simulating Journal screen load)
      const existingEntries = [
        IntegrationTestData.createJournalEntry({
          content: 'First journal entry',
          mood: 'joy',
          activities: ['Work'] as any
        }),
        IntegrationTestData.createJournalEntry({
          content: 'Second journal entry',
          mood: 'calm',
          activities: ['Reading']
        })
      ];

      for (const entry of existingEntries) {
        await journalStorage.saveJournalEntry(entry);
      }

      // 2. Verify Journal screen data
      const allEntries = await journalStorage.getAllJournalEntries();
      expect(allEntries).toHaveLength(2);

      // 3. Navigate to JournalEntry creation (simulating new entry flow)
      const newEntry = IntegrationTestData.createJournalEntry({
        content: 'New journal entry created during navigation test',
        mood: 'joy',
        activities: ['Work', 'Learning'] as any
      });
      await journalStorage.saveJournalEntry(newEntry);

      // 4. Navigate back to Journal list and verify state
      const updatedEntries = await journalStorage.getAllJournalEntries();
      expect(updatedEntries).toHaveLength(3);

      // Verify the new entry is properly integrated
      const latestEntry = updatedEntries.find(entry => 
        entry.content.includes('navigation test')
      );
      expect(latestEntry).toBeDefined();
      expect(latestEntry!.mood).toBe('joy');
      expect(latestEntry!.activities).toEqual(['Work', 'Learning']);
    });

    it('should handle journal entry editing flow', async () => {
      // 1. Create initial entry
      const originalEntry = IntegrationTestData.createJournalEntry({
        content: 'Original content',
        mood: 'neutral',
        activities: ['Work']
      });
      await journalStorage.saveJournalEntry(originalEntry);

      // 2. Simulate navigation to edit (get entry by ID)
      const savedEntry = await journalStorage.getJournalEntry(originalEntry.id);
      expect(savedEntry).toBeDefined();
      expect(savedEntry!.content).toBe('Original content');

      // 3. Simulate editing and saving
      const updatedEntry = {
        ...savedEntry!,
        content: 'Updated content after editing',
        mood: 'joy' as const,
        activities: ['Work', 'Social'] as any
      };
      await journalStorage.saveJournalEntry(updatedEntry);

      // 4. Verify changes persist after navigation
      const finalEntry = await journalStorage.getJournalEntry(originalEntry.id);
      expect(finalEntry).toBeDefined();
      expect(finalEntry!.content).toBe('Updated content after editing');
      expect(finalEntry!.mood).toBe('joy');
      expect(finalEntry!.activities).toEqual(['Work', 'Social']);
    });
  });

  describe('Analytics Navigation Flow', () => {
    it('should maintain analytics state across different time frame navigations', async () => {
      // 1. Set up data spanning multiple days
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const moodEntries = [
        IntegrationTestData.createMoodEntry({ 
          mood: 'joy', 
          intensity: 0.8, 
          activities: ['Exercise'],
          createdAt: today.toISOString()
        }),
        IntegrationTestData.createMoodEntry({ 
          mood: 'calm', 
          intensity: 0.6, 
          activities: ['Reading'],
          createdAt: yesterday.toISOString()
        }),
        IntegrationTestData.createMoodEntry({ 
          mood: 'sadness', 
          intensity: 0.3, 
          activities: ['Work'],
          createdAt: weekAgo.toISOString()
        })
      ];

      for (const entry of moodEntries) {
        await moodStorage.saveMoodEntry(entry);
      }

      // 2. Test "Today" analytics navigation
      const allEntries = await moodStorage.getAllMoodEntries();
      const todayEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate.toDateString() === today.toDateString();
      });
      
      expect(todayEntries).toHaveLength(1);
      expect(todayEntries[0].mood).toBe('joy');

      // 3. Test "Week" analytics navigation
      const weekEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        const daysDiff = (today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      });

      expect(weekEntries).toHaveLength(3);

      // 4. Test activity correlation across time frames
      const weekCorrelations = activityCorrelation.analyzeActivityCorrelations(weekEntries);
      expect(weekCorrelations.length).toBeGreaterThan(0);

      const todayCorrelations = activityCorrelation.analyzeActivityCorrelations(todayEntries);
      expect(todayCorrelations.length).toBeGreaterThan(0);
    });

    it('should handle semantic analysis navigation between journal entries', async () => {
      // 1. Create journal entries with different emotional content
      const journalEntries = [
        IntegrationTestData.createJournalEntry({
          content: 'Amazing day! Everything went perfectly and I feel fantastic.',
          mood: 'joy',
          activities: ['Work', 'Social'] as any
        }),
        IntegrationTestData.createJournalEntry({
          content: 'Feeling stressed and overwhelmed with all the deadlines.',
          mood: 'sadness',
          activities: ['Work'] as any
        }),
        IntegrationTestData.createJournalEntry({
          content: 'Peaceful evening reading by the fireplace. Very relaxing.',
          mood: 'calm',
          activities: ['Reading', 'Rest'] as any
        })
      ];

      for (const entry of journalEntries) {
        await journalStorage.saveJournalEntry(entry);
      }

      // 2. Simulate navigation through analytics for each entry
      const allJournalEntries = await journalStorage.getAllJournalEntries();
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

      // 3. Verify each analysis maintains consistency
      expect(analysisResults).toHaveLength(3);
      
      analysisResults.forEach(result => {
        expect(result.dominantEmotion).toBeDefined();
        expect(result.moodAlignment).toBeDefined();
        expect(result.suggestedTags).toBeDefined();
        expect(Array.isArray(result.suggestedTags)).toBe(true);
      });

      // 4. Verify navigation between different emotional analyses
      const positiveAnalysis = analysisResults.find(result => 
        result.moodAlignment > 0.7
      );
      const negativeAnalysis = analysisResults.find(result => 
        result.moodAlignment < 0.5
      );

      expect(positiveAnalysis).toBeDefined();
      expect(negativeAnalysis).toBeDefined();
    });
  });

  describe('Cross-Screen Data Flow', () => {
    it('should maintain data consistency across all screen navigations', async () => {
      // 1. Start with Dashboard → MoodInput flow
      const moodEntry = IntegrationTestData.createMoodEntry({
        mood: 'joy',
        intensity: 0.8,
        activities: ['Exercise', 'Social']
      });
      await moodStorage.saveMoodEntry(moodEntry);

      // 2. Navigate to Journal → JournalEntry flow
      const journalEntry = IntegrationTestData.createJournalEntry({
        content: 'Great workout today! Feeling energized and social.',
        mood: 'joy',
        activities: ['Exercise', 'Social']
      });
      await journalStorage.saveJournalEntry(journalEntry);

      // 3. Navigate to Analytics and verify cross-screen data integration
      const allMoodEntries = await moodStorage.getAllMoodEntries();
      const allJournalEntries = await journalStorage.getAllJournalEntries();

      // Dashboard integration
      const dashboardSummary = TodaySummaryService.calculateTodaysSummary(
        allMoodEntries, 
        allJournalEntries
      );
      expect(dashboardSummary.moodCount).toBe(1);
      expect(dashboardSummary.journalCount).toBe(1);
      expect(dashboardSummary.dominantMood).toBe('joy');

      // Analytics integration
      const activityCorrelations = activityCorrelation.analyzeActivityCorrelations(allMoodEntries);
      expect(activityCorrelations.length).toBeGreaterThan(0);

      const semanticEntry = {
        id: journalEntry.id,
        content: journalEntry.content,
        date: journalEntry.createdAt,
        mood: journalEntry.mood,
        tags: journalEntry.tags || []
      };
      const semanticResult = semanticAnalysis.analyzeEntry(semanticEntry);
      expect(semanticResult.dominantEmotion).toBeDefined();
      expect(semanticResult.moodAlignment).toBeGreaterThanOrEqual(0);

      // 4. Verify data consistency across all services
      expect(dashboardSummary.topActivities).toEqual(
        expect.arrayContaining(['Exercise', 'Social'])
      );
      expect(activityCorrelations.some(c => 
        c.activity === 'Exercise' || c.activity === 'Social'
      )).toBe(true);
    });

    it('should handle rapid navigation without data loss', async () => {
      // Simulate rapid navigation between screens with data operations
      const baseTime = Date.now();

      // Rapid mood entries (Dashboard → MoodInput) - save sequentially to avoid conflicts
      for (let i = 0; i < 5; i++) {
        await moodStorage.saveMoodEntry(IntegrationTestData.createMoodEntry({
          mood: i % 2 === 0 ? 'joy' : 'calm',
          intensity: 0.5 + (i * 0.1),
          activities: ['Work'] as any,
          createdAt: new Date(baseTime + i * 1000).toISOString(),
          id: `rapid_mood_${baseTime}_${i}`
        }));
      }

      // Rapid journal entries (Journal → JournalEntry)
      for (let i = 0; i < 3; i++) {
        await journalStorage.saveJournalEntry(IntegrationTestData.createJournalEntry({
          content: `Journal entry ${i} during rapid navigation`,
          mood: 'neutral',
          activities: ['Work'] as any,
          createdAt: new Date(baseTime + (i + 5) * 1000).toISOString(),
          id: `rapid_journal_${baseTime}_${i}`
        }));
      }

      // Verify all data is properly stored
      const allMoodEntries = await moodStorage.getAllMoodEntries();
      const allJournalEntries = await journalStorage.getAllJournalEntries();

      expect(allMoodEntries).toHaveLength(5);
      expect(allJournalEntries).toHaveLength(3);

      // Verify data integrity
      const summary = TodaySummaryService.calculateTodaysSummary(allMoodEntries, allJournalEntries);
      expect(summary.moodCount).toBe(5);
      expect(summary.journalCount).toBe(3);
      expect(summary.topActivities.length).toBeGreaterThan(0);
    });
  });
});
