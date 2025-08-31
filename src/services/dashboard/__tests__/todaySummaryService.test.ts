import { TodaySummaryService } from '../todaySummaryService';
import { MoodEntry } from '../../../types/mood';
import { JournalEntry } from '../../../types/journal';

describe('TodaySummaryService', () => {
  const mockToday = '2024-01-15';
  const mockYesterday = '2024-01-14';

  beforeAll(() => {
    // Mock Date to return consistent results
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const createMockMoodEntry = (
    mood: string,
    intensity: number,
    activities: string[] = [],
    timestamp = `${mockToday}T10:00:00Z`
  ): MoodEntry => ({
    id: Math.random().toString(),
    mood: mood as any,
    intensity,
    activities: activities as any,
    notes: '',
    timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const createMockJournalEntry = (
    mood: string,
    activities: string[] = [],
    createdAt = `${mockToday}T11:00:00Z`
  ): JournalEntry => ({
    id: Math.random().toString(),
    title: 'Test Entry',
    content: 'Test content',
    mood: mood as any,
    activities: activities as any,
    tags: [],
    createdAt,
    updatedAt: createdAt,
  });

  describe('calculateTodaysSummary', () => {
    it('should return empty summary when no entries exist', () => {
      const result = TodaySummaryService.calculateTodaysSummary([], []);

      expect(result).toEqual({
        moodCount: 0,
        journalCount: 0,
        dominantMood: null,
        topActivities: [],
        moodTrend: 'insufficient_data',
        averageIntensity: 0,
        hasData: false,
      });
    });

    it('should only count entries from today', () => {
      const moodEntries = [
        createMockMoodEntry('joy', 0.8, [], `${mockToday}T10:00:00Z`),
        createMockMoodEntry('sadness', 0.3, [], `${mockYesterday}T10:00:00Z`),
      ];
      const journalEntries = [
        createMockJournalEntry('calm', [], `${mockToday}T11:00:00Z`),
        createMockJournalEntry('anger', [], `${mockYesterday}T11:00:00Z`),
      ];

      const result = TodaySummaryService.calculateTodaysSummary(moodEntries, journalEntries);

      expect(result.moodCount).toBe(1);
      expect(result.journalCount).toBe(1);
      expect(result.hasData).toBe(true);
    });

    it('should calculate dominant mood correctly', () => {
      const moodEntries = [
        createMockMoodEntry('joy', 0.8),
        createMockMoodEntry('joy', 0.7),
        createMockMoodEntry('sadness', 0.4),
      ];
      const journalEntries = [
        createMockJournalEntry('joy'),
      ];

      const result = TodaySummaryService.calculateTodaysSummary(moodEntries, journalEntries);

      expect(result.dominantMood).toBe('joy');
    });

    it('should calculate top activities correctly', () => {
      const moodEntries = [
        createMockMoodEntry('joy', 0.8, ['Exercise', 'Reading']),
        createMockMoodEntry('calm', 0.7, ['Reading', 'Meditation']),
      ];
      const journalEntries = [
        createMockJournalEntry('joy', ['Exercise']),
      ];

      const result = TodaySummaryService.calculateTodaysSummary(moodEntries, journalEntries);

      expect(result.topActivities).toContain('Exercise');
      expect(result.topActivities).toContain('Reading');
      expect(result.topActivities.length).toBeGreaterThan(0);
    });

    it('should calculate average intensity correctly', () => {
      const moodEntries = [
        createMockMoodEntry('joy', 0.8),
        createMockMoodEntry('calm', 0.6),
        createMockMoodEntry('neutral', 0.4),
      ];

      const result = TodaySummaryService.calculateTodaysSummary(moodEntries, []);

      // Average should be (0.8 + 0.6 + 0.4) / 3 = 0.6
      expect(result.averageIntensity).toBeCloseTo(0.6, 2);
    });

    it('should handle mood trend calculation', () => {
      const moodEntries = [
        createMockMoodEntry('sadness', 0.8, [], `${mockToday}T08:00:00Z`),
        createMockMoodEntry('joy', 0.9, [], `${mockToday}T12:00:00Z`),
      ];

      const result = TodaySummaryService.calculateTodaysSummary(moodEntries, []);

      expect(result.moodTrend).toBe('improving');
    });

    it('should return insufficient_data trend for single entry', () => {
      const moodEntries = [
        createMockMoodEntry('joy', 0.8),
      ];

      const result = TodaySummaryService.calculateTodaysSummary(moodEntries, []);

      expect(result.moodTrend).toBe('insufficient_data');
    });
  });

  describe('edge cases', () => {
    it('should handle empty activities arrays', () => {
      const moodEntries = [
        createMockMoodEntry('joy', 0.8, []),
      ];

      const result = TodaySummaryService.calculateTodaysSummary(moodEntries, []);

      expect(result.topActivities).toEqual([]);
    });

    it('should handle mixed mood types from different sources', () => {
      const moodEntries = [
        createMockMoodEntry('joy', 0.8),
        createMockMoodEntry('sadness', 0.3),
      ];
      const journalEntries = [
        createMockJournalEntry('joy'),
        createMockJournalEntry('joy'),
      ];

      const result = TodaySummaryService.calculateTodaysSummary(moodEntries, journalEntries);

      // Joy should be dominant (3 occurrences vs 1 sadness)
      expect(result.dominantMood).toBe('joy');
    });
  });
});

