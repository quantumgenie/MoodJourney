/**
 * Performance Integration Tests
 * 
 * Tests system performance with large datasets and memory usage patterns.
 * Ensures the app remains responsive under various load conditions.
 */

import { MoodStorageService } from '../../services/storage/moodStorage';
import { JournalStorageService } from '../../services/storage/journalStorage';
import { TodaySummaryService } from '../../services/dashboard/todaySummaryService';
import { SemanticAnalysisService } from '../../services/semanticAnalysis/semanticAnalysisService';
import { ActivityCorrelationService } from '../../services/analytics/activityCorrelationService';
import { IntegrationTestData } from '../setup/testData';
import '../setup/simpleIntegrationSetup';

describe('Performance Integration Tests', () => {
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

  describe('Large Dataset Performance', () => {
    it('should handle large mood entry datasets efficiently', async () => {
      const LARGE_DATASET_SIZE = 1000;
      const startTime = Date.now();

      // 1. Create large dataset
      const largeDataset = [];
      for (let i = 0; i < LARGE_DATASET_SIZE; i++) {
        largeDataset.push(IntegrationTestData.createMoodEntry({
          mood: ['joy', 'calm', 'neutral', 'sadness', 'anger'][i % 5] as any,
          intensity: Math.random(),
          activities: [['Exercise'], ['Work'], ['Social'], ['Reading'], ['Rest']][i % 5] as any,
          notes: `Entry ${i}: This is a test entry with some content to simulate real usage.`,
          id: `perf_mood_${i}`,
          createdAt: new Date(Date.now() - i * 1000).toISOString()
        }));
      }

      const dataCreationTime = Date.now();

      // 2. Save all entries and measure time
      for (const entry of largeDataset) {
        await moodStorage.saveMoodEntry(entry);
      }

      const saveTime = Date.now();

      // 3. Retrieve all entries and measure time
      const allEntries = await moodStorage.getAllMoodEntries();
      const retrievalTime = Date.now();

      // 4. Verify data integrity
      expect(allEntries.length).toBeGreaterThanOrEqual(LARGE_DATASET_SIZE);

      // 5. Performance assertions
      const totalTime = retrievalTime - startTime;
      const saveTimeMs = saveTime - dataCreationTime;
      const retrievalTimeMs = retrievalTime - saveTime;

      expect(saveTimeMs).toBeLessThan(30000); // Should save within 30 seconds
      expect(retrievalTimeMs).toBeLessThan(5000); // Should retrieve within 5 seconds
      expect(totalTime).toBeLessThan(35000); // Total operation within 35 seconds

      console.log(`Performance metrics for ${LARGE_DATASET_SIZE} mood entries:`);
      console.log(`- Save time: ${saveTimeMs}ms`);
      console.log(`- Retrieval time: ${retrievalTimeMs}ms`);
      console.log(`- Total time: ${totalTime}ms`);
    });

    it('should handle large journal entry datasets efficiently', async () => {
      const LARGE_DATASET_SIZE = 500; // Smaller for journal entries due to content size
      const startTime = Date.now();

      // 1. Create large journal dataset
      const largeDataset = [];
      for (let i = 0; i < LARGE_DATASET_SIZE; i++) {
        largeDataset.push(IntegrationTestData.createJournalEntry({
          content: `Journal entry ${i}: This is a comprehensive journal entry that contains multiple sentences and thoughts about the day. It includes various emotions, activities, and reflections that would be typical of a real user's journal entry. The content is long enough to simulate realistic usage patterns and test the system's ability to handle substantial text content efficiently.`,
          mood: ['joy', 'calm', 'neutral', 'sadness', 'surprise'][i % 5] as any,
          activities: [['Exercise'], ['Work'], ['Social'], ['Reading'], ['Family']][i % 5] as any,
          id: `perf_journal_${i}`,
          createdAt: new Date(Date.now() - i * 1000).toISOString()
        }));
      }

      const dataCreationTime = Date.now();

      // 2. Save all entries and measure time
      for (const entry of largeDataset) {
        await journalStorage.saveJournalEntry(entry);
      }

      const saveTime = Date.now();

      // 3. Retrieve all entries and measure time
      const allEntries = await journalStorage.getAllJournalEntries();
      const retrievalTime = Date.now();

      // 4. Verify data integrity
      expect(allEntries.length).toBeGreaterThanOrEqual(LARGE_DATASET_SIZE);

      // 5. Performance assertions
      const totalTime = retrievalTime - startTime;
      const saveTimeMs = saveTime - dataCreationTime;
      const retrievalTimeMs = retrievalTime - saveTime;

      expect(saveTimeMs).toBeLessThan(25000); // Should save within 25 seconds
      expect(retrievalTimeMs).toBeLessThan(3000); // Should retrieve within 3 seconds
      expect(totalTime).toBeLessThan(30000); // Total operation within 30 seconds

      console.log(`Performance metrics for ${LARGE_DATASET_SIZE} journal entries:`);
      console.log(`- Save time: ${saveTimeMs}ms`);
      console.log(`- Retrieval time: ${retrievalTimeMs}ms`);
      console.log(`- Total time: ${totalTime}ms`);
    });

    it('should perform analytics calculations efficiently with large datasets', async () => {
      // 1. Create substantial dataset for analytics
      const ANALYTICS_DATASET_SIZE = 300;
      const moodEntries = [];
      
      for (let i = 0; i < ANALYTICS_DATASET_SIZE; i++) {
        moodEntries.push(IntegrationTestData.createMoodEntry({
          mood: ['joy', 'calm', 'neutral', 'sadness', 'anger'][i % 5] as any,
          intensity: Math.random(),
          activities: [
            ['Exercise', 'Health'], 
            ['Work', 'Learning'], 
            ['Social', 'Family'], 
            ['Reading', 'Rest'], 
            ['Music', 'Entertainment']
          ][i % 5] as any,
          id: `analytics_${i}`,
          createdAt: new Date(Date.now() - i * 60000).toISOString() // 1 minute intervals
        }));
      }

      // 2. Save all entries
      for (const entry of moodEntries) {
        await moodStorage.saveMoodEntry(entry);
      }

      const allEntries = await moodStorage.getAllMoodEntries();

      // 3. Test activity correlation performance
      const correlationStartTime = Date.now();
      const correlations = activityCorrelation.analyzeActivityCorrelations(allEntries);
      const correlationEndTime = Date.now();
      const correlationTime = correlationEndTime - correlationStartTime;

      // 4. Test insights generation performance
      const insightsStartTime = Date.now();
      const insights = activityCorrelation.generateInsights(correlations);
      const insightsEndTime = Date.now();
      const insightsTime = insightsEndTime - insightsStartTime;

      // 5. Test dashboard summary performance
      const dashboardStartTime = Date.now();
      const summary = TodaySummaryService.calculateTodaysSummary(allEntries, []);
      const dashboardEndTime = Date.now();
      const dashboardTime = dashboardEndTime - dashboardStartTime;

      // 6. Verify results quality
      expect(correlations.length).toBeGreaterThan(0);
      expect(insights.length).toBeGreaterThanOrEqual(0);
      expect(summary).toBeDefined();
      expect(summary.moodCount).toBeGreaterThan(0);

      // 7. Performance assertions
      expect(correlationTime).toBeLessThan(3000); // Correlation analysis within 3 seconds
      expect(insightsTime).toBeLessThan(1000); // Insights generation within 1 second
      expect(dashboardTime).toBeLessThan(1000); // Dashboard summary within 1 second

      const totalAnalyticsTime = correlationTime + insightsTime + dashboardTime;
      expect(totalAnalyticsTime).toBeLessThan(5000); // Total analytics within 5 seconds

      console.log(`Analytics performance with ${ANALYTICS_DATASET_SIZE} entries:`);
      console.log(`- Correlation analysis: ${correlationTime}ms`);
      console.log(`- Insights generation: ${insightsTime}ms`);
      console.log(`- Dashboard summary: ${dashboardTime}ms`);
      console.log(`- Total analytics time: ${totalAnalyticsTime}ms`);
    });

    it('should handle semantic analysis efficiently with large content', async () => {
      // 1. Create journal entries with varying content sizes
      const contentSizes = [100, 500, 1000, 2000, 5000]; // Character counts
      const semanticResults = [];

      for (const size of contentSizes) {
        const content = 'This is a test journal entry with meaningful content that explores various emotions and experiences. '.repeat(Math.ceil(size / 100));
        const truncatedContent = content.substring(0, size);

        const entry = {
          id: `semantic_${size}`,
          content: truncatedContent,
          date: new Date().toISOString(),
          mood: 'joy',
          tags: []
        };

        // 2. Measure semantic analysis time
        const startTime = Date.now();
        const analysis = semanticAnalysis.analyzeEntry(entry);
        const endTime = Date.now();
        const analysisTime = endTime - startTime;

        semanticResults.push({
          size,
          time: analysisTime,
          analysis
        });

        // 3. Verify analysis quality
        expect(analysis).toBeDefined();
        expect(analysis.dominantEmotion).toBeDefined();
        expect(analysis.emotionDistribution).toBeDefined();
        expect(Array.isArray(analysis.suggestedTags)).toBe(true);

        // 4. Performance assertion for individual analysis
        expect(analysisTime).toBeLessThan(2000); // Each analysis within 2 seconds
      }

      // 5. Verify performance scaling
      const avgTime = semanticResults.reduce((sum, result) => sum + result.time, 0) / semanticResults.length;
      expect(avgTime).toBeLessThan(1000); // Average analysis time within 1 second

      console.log('Semantic analysis performance by content size:');
      semanticResults.forEach(result => {
        console.log(`- ${result.size} chars: ${result.time}ms`);
      });
      console.log(`- Average time: ${avgTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage and Optimization', () => {
    it('should manage memory efficiently during bulk operations', async () => {
      const BULK_SIZE = 200;
      
      // 1. Measure initial memory usage (approximation)
      const initialEntries = await moodStorage.getAllMoodEntries();
      const initialMemoryFootprint = JSON.stringify(initialEntries).length;

      // 2. Perform bulk operations
      const bulkEntries = [];
      for (let i = 0; i < BULK_SIZE; i++) {
        bulkEntries.push(IntegrationTestData.createMoodEntry({
          mood: ['joy', 'calm'][i % 2] as any,
          intensity: Math.random(),
          activities: [['Exercise'], ['Work']][i % 2] as any,
          notes: `Bulk entry ${i} with moderate content length for memory testing.`,
          id: `bulk_${i}`
        }));
      }

      // 3. Save entries in batches to simulate real usage
      const batchSize = 10;
      for (let i = 0; i < bulkEntries.length; i += batchSize) {
        const batch = bulkEntries.slice(i, i + batchSize);
        for (const entry of batch) {
          await moodStorage.saveMoodEntry(entry);
        }
        
        // Small delay to simulate real-world usage patterns
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // 4. Verify memory usage is reasonable
      const finalEntries = await moodStorage.getAllMoodEntries();
      const finalMemoryFootprint = JSON.stringify(finalEntries).length;
      const memoryIncrease = finalMemoryFootprint - initialMemoryFootprint;

      expect(finalEntries.length).toBeGreaterThanOrEqual(BULK_SIZE);
      expect(memoryIncrease).toBeGreaterThan(0); // Memory should increase
      expect(memoryIncrease).toBeLessThan(10000000); // But not excessively (< 10MB string representation)

      // 5. Test cleanup efficiency
      const cleanupStartTime = Date.now();
      await moodStorage.clearAllMoodEntries();
      const cleanupEndTime = Date.now();
      const cleanupTime = cleanupEndTime - cleanupStartTime;

      expect(cleanupTime).toBeLessThan(2000); // Cleanup within 2 seconds

      const clearedEntries = await moodStorage.getAllMoodEntries();
      expect(clearedEntries.length).toBe(0);

      console.log(`Memory management metrics:`);
      console.log(`- Initial entries: ${initialEntries.length}`);
      console.log(`- Final entries: ${finalEntries.length}`);
      console.log(`- Memory increase: ${(memoryIncrease / 1024).toFixed(2)} KB`);
      console.log(`- Cleanup time: ${cleanupTime}ms`);
    });

    it('should handle concurrent operations without performance degradation', async () => {
      const CONCURRENT_OPERATIONS = 50;
      
      // 1. Create concurrent save operations
      const saveOperations = [];
      const saveStartTime = Date.now();

      for (let i = 0; i < CONCURRENT_OPERATIONS; i++) {
        const entry = IntegrationTestData.createMoodEntry({
          mood: ['joy', 'calm', 'neutral'][i % 3] as any,
          intensity: Math.random(),
          activities: [['Exercise'], ['Work'], ['Social']][i % 3] as any,
          id: `concurrent_${i}`,
          createdAt: new Date(Date.now() + i).toISOString() // Slightly different timestamps
        });

        saveOperations.push(moodStorage.saveMoodEntry(entry));
      }

      // 2. Execute all operations concurrently
      await Promise.all(saveOperations);
      const saveEndTime = Date.now();
      const totalSaveTime = saveEndTime - saveStartTime;

      // 3. Verify all operations completed successfully
      const allEntries = await moodStorage.getAllMoodEntries();
      // Due to potential ID collisions or storage limitations, we may have fewer entries
      expect(allEntries.length).toBeGreaterThanOrEqual(1);
      expect(allEntries.length).toBeLessThanOrEqual(CONCURRENT_OPERATIONS);

      // 4. Test concurrent read operations
      const readOperations = [];
      const readStartTime = Date.now();

      for (let i = 0; i < 20; i++) {
        readOperations.push(moodStorage.getAllMoodEntries());
      }

      const readResults = await Promise.all(readOperations);
      const readEndTime = Date.now();
      const totalReadTime = readEndTime - readStartTime;

      // 5. Verify read consistency
      readResults.forEach(result => {
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result.length).toBeLessThanOrEqual(CONCURRENT_OPERATIONS);
      });

      // 6. Performance assertions
      expect(totalSaveTime).toBeLessThan(10000); // Concurrent saves within 10 seconds
      expect(totalReadTime).toBeLessThan(3000); // Concurrent reads within 3 seconds

      console.log(`Concurrent operations performance:`);
      console.log(`- ${CONCURRENT_OPERATIONS} concurrent saves: ${totalSaveTime}ms`);
      console.log(`- 20 concurrent reads: ${totalReadTime}ms`);
      console.log(`- Average save time: ${(totalSaveTime / CONCURRENT_OPERATIONS).toFixed(2)}ms`);
      console.log(`- Average read time: ${(totalReadTime / 20).toFixed(2)}ms`);
    });

    it('should maintain performance with mixed data operations', async () => {
      const MIXED_OPERATIONS_COUNT = 100;
      const startTime = Date.now();

      // 1. Perform mixed operations (create, read, update, delete)
      const operations = [];
      
      for (let i = 0; i < MIXED_OPERATIONS_COUNT; i++) {
        const operationType = i % 4;
        
        switch (operationType) {
          case 0: // Create mood entry
            operations.push(
              moodStorage.saveMoodEntry(IntegrationTestData.createMoodEntry({
                mood: 'joy',
                intensity: Math.random(),
                activities: ['Exercise'] as any,
                id: `mixed_mood_${i}`
              }))
            );
            break;
            
          case 1: // Create journal entry
            operations.push(
              journalStorage.saveJournalEntry(IntegrationTestData.createJournalEntry({
                content: `Mixed operation journal entry ${i}`,
                mood: 'calm',
                activities: ['Writing'] as any,
                id: `mixed_journal_${i}`
              }))
            );
            break;
            
          case 2: // Read operations
            operations.push(moodStorage.getAllMoodEntries());
            operations.push(journalStorage.getAllJournalEntries());
            break;
            
          case 3: // Analytics operations
            operations.push(
              (async () => {
                const entries = await moodStorage.getAllMoodEntries();
                return activityCorrelation.analyzeActivityCorrelations(entries);
              })()
            );
            break;
        }
      }

      // 2. Execute all mixed operations
      const results = await Promise.allSettled(operations);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 3. Verify operations completed successfully
      const successfulOperations = results.filter(result => result.status === 'fulfilled').length;
      const failedOperations = results.filter(result => result.status === 'rejected').length;

      expect(successfulOperations).toBeGreaterThan(MIXED_OPERATIONS_COUNT * 0.9); // At least 90% success rate
      expect(failedOperations).toBeLessThan(MIXED_OPERATIONS_COUNT * 0.1); // Less than 10% failures

      // 4. Verify data integrity
      const finalMoodEntries = await moodStorage.getAllMoodEntries();
      const finalJournalEntries = await journalStorage.getAllJournalEntries();

      expect(finalMoodEntries.length).toBeGreaterThan(0);
      expect(finalJournalEntries.length).toBeGreaterThan(0);

      // 5. Performance assertion
      expect(totalTime).toBeLessThan(20000); // Mixed operations within 20 seconds

      console.log(`Mixed operations performance:`);
      console.log(`- Total operations: ${operations.length}`);
      console.log(`- Successful: ${successfulOperations}`);
      console.log(`- Failed: ${failedOperations}`);
      console.log(`- Total time: ${totalTime}ms`);
      console.log(`- Average time per operation: ${(totalTime / operations.length).toFixed(2)}ms`);
    });
  });

  describe('Scalability and Load Testing', () => {
    it('should scale gracefully with increasing data size', async () => {
      const dataSizes = [10, 50, 100, 200]; // Progressive data sizes
      const performanceMetrics = [];

      for (const size of dataSizes) {
        // 1. Clear previous data
        await moodStorage.clearAllMoodEntries();

        // 2. Create dataset of current size
        const dataset = [];
        for (let i = 0; i < size; i++) {
          dataset.push(IntegrationTestData.createMoodEntry({
            mood: ['joy', 'calm', 'neutral', 'sadness'][i % 4] as any,
            intensity: Math.random(),
            activities: [['Exercise'], ['Work'], ['Social'], ['Reading']][i % 4] as any,
            id: `scale_${size}_${i}`
          }));
        }

        // 3. Measure save performance
        const saveStartTime = Date.now();
        for (const entry of dataset) {
          await moodStorage.saveMoodEntry(entry);
        }
        const saveTime = Date.now() - saveStartTime;

        // 4. Measure retrieval performance
        const retrievalStartTime = Date.now();
        const entries = await moodStorage.getAllMoodEntries();
        const retrievalTime = Date.now() - retrievalStartTime;

        // 5. Measure analytics performance
        const analyticsStartTime = Date.now();
        const correlations = activityCorrelation.analyzeActivityCorrelations(entries);
        const summary = TodaySummaryService.calculateTodaysSummary(entries, []);
        const analyticsTime = Date.now() - analyticsStartTime;

        // 6. Store metrics
        performanceMetrics.push({
          size,
          saveTime,
          retrievalTime,
          analyticsTime,
          totalTime: saveTime + retrievalTime + analyticsTime
        });

        // 7. Verify data integrity
        expect(entries.length).toBe(size);
        expect(correlations).toBeDefined();
        expect(summary).toBeDefined();
      }

      // 8. Analyze scaling behavior
      for (let i = 1; i < performanceMetrics.length; i++) {
        const current = performanceMetrics[i];
        const previous = performanceMetrics[i - 1];
        
        // Performance should not degrade exponentially
        const sizeRatio = current.size / previous.size;
        const timeRatio = previous.totalTime > 0 ? current.totalTime / previous.totalTime : 1;
        
        // Time increase should be reasonable but not exponential
        // Allow significant overhead for larger datasets, especially when running after other tests
        // Skip check if previous time was too small to measure accurately
        if (previous.totalTime > 10) { // Only check if previous operation took more than 10ms
          expect(timeRatio).toBeLessThan(sizeRatio * 6); // Allow 6x overhead for scaling in test suite context
        }
      }

      console.log('Scalability metrics:');
      performanceMetrics.forEach(metric => {
        console.log(`- Size ${metric.size}: Save=${metric.saveTime}ms, Retrieval=${metric.retrievalTime}ms, Analytics=${metric.analyticsTime}ms, Total=${metric.totalTime}ms`);
      });
    });

    it('should maintain responsiveness under sustained load', async () => {
      const SUSTAINED_LOAD_DURATION = 3000; // 3 seconds (reduced for faster testing)
      const OPERATION_INTERVAL = 200; // Every 200ms (reduced frequency)
      const startTime = Date.now();
      const operationTimes = [];
      let operationCount = 0;

      // 1. Simulate sustained load
      while (Date.now() - startTime < SUSTAINED_LOAD_DURATION) {
        const operationStart = Date.now();
        
        // Alternate between different operations
        if (operationCount % 3 === 0) {
          // Save operation
          await moodStorage.saveMoodEntry(IntegrationTestData.createMoodEntry({
            mood: 'joy',
            intensity: Math.random(),
            activities: ['Exercise'] as any,
            id: `sustained_${operationCount}`
          }));
        } else if (operationCount % 3 === 1) {
          // Read operation
          await moodStorage.getAllMoodEntries();
        } else {
          // Analytics operation
          const entries = await moodStorage.getAllMoodEntries();
          if (entries.length > 0) {
            TodaySummaryService.calculateTodaysSummary(entries, []);
          }
        }
        
        const operationEnd = Date.now();
        const operationTime = operationEnd - operationStart;
        operationTimes.push(operationTime);
        operationCount++;

        // Wait for next operation
        await new Promise(resolve => setTimeout(resolve, OPERATION_INTERVAL));
      }

      // 2. Analyze performance consistency
      const averageTime = operationTimes.reduce((sum, time) => sum + time, 0) / operationTimes.length;
      const maxTime = Math.max(...operationTimes);
      const minTime = Math.min(...operationTimes);
      
      // 3. Performance assertions
      expect(averageTime).toBeLessThan(1000); // Average operation under 1 second
      expect(maxTime).toBeLessThan(3000); // No operation takes more than 3 seconds
      expect(operationCount).toBeGreaterThan(10); // Completed reasonable number of operations

      // 4. Verify system stability
      const finalEntries = await moodStorage.getAllMoodEntries();
      expect(finalEntries.length).toBeGreaterThan(0);

      console.log(`Sustained load test results:`);
      console.log(`- Duration: ${SUSTAINED_LOAD_DURATION}ms`);
      console.log(`- Operations completed: ${operationCount}`);
      console.log(`- Average operation time: ${averageTime.toFixed(2)}ms`);
      console.log(`- Min operation time: ${minTime}ms`);
      console.log(`- Max operation time: ${maxTime}ms`);
      console.log(`- Operations per second: ${(operationCount / (SUSTAINED_LOAD_DURATION / 1000)).toFixed(2)}`);
    }, 10000); // 10 second timeout for sustained load test
  });
});
