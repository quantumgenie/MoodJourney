import { SemanticAnalysisService } from '../semanticAnalysisService';
import { JournalEntry } from '../types';

describe('SemanticAnalysisService', () => {
  let service: SemanticAnalysisService;

  beforeEach(() => {
    service = new SemanticAnalysisService();
  });

  const createMockJournalEntry = (
    content: string,
    mood: string = 'neutral'
  ): JournalEntry => ({
    id: '1',
    content,
    date: new Date().toISOString(),
    mood,
    tags: [],
  });

  describe('analyzeEntry', () => {
    it('should identify joy-related emotions', () => {
      const entry = createMockJournalEntry(
        'I am so happy and excited about this wonderful day! Feeling joyful and content.',
        'joy'
      );

      const result = service.analyzeEntry(entry);

      expect(result.dominantEmotion).toBe('joy');
      expect(result.emotionDistribution.joy).toBeGreaterThan(0);
      expect(result.highlightedWords.length).toBeGreaterThan(0);
      expect(result.highlightedWords.some(word => word.word === 'happy')).toBe(true);
    });

    it('should identify sadness-related emotions', () => {
      const entry = createMockJournalEntry(
        'I feel so sad and depressed today. Everything seems hopeless and I am crying.',
        'sadness'
      );

      const result = service.analyzeEntry(entry);

      expect(result.dominantEmotion).toBe('sadness');
      expect(result.emotionDistribution.sadness).toBeGreaterThan(0);
      expect(result.highlightedWords.some(word => word.word === 'sad')).toBe(true);
    });

    it('should identify anger-related emotions', () => {
      const entry = createMockJournalEntry(
        'I am so angry and frustrated! This makes me furious and irritated.',
        'anger'
      );

      const result = service.analyzeEntry(entry);

      expect(result.dominantEmotion).toBe('anger');
      expect(result.emotionDistribution.anger).toBeGreaterThan(0);
      expect(result.highlightedWords.some(word => word.word === 'angry')).toBe(true);
    });

    it('should handle neutral content', () => {
      const entry = createMockJournalEntry(
        'Today I went to the store and bought some groceries. Then I came home.',
        'neutral'
      );

      const result = service.analyzeEntry(entry);

      expect(result.dominantEmotion).toBe('neutral');
      expect(result.emotionDistribution.neutral).toBeGreaterThan(0);
    });

    it('should calculate mood alignment correctly', () => {
      const entry = createMockJournalEntry(
        'I am so happy and joyful today!',
        'joy'
      );

      const result = service.analyzeEntry(entry);

      // Should have high alignment since mood matches emotion words
      expect(result.moodAlignment).toBeGreaterThan(0.5);
    });

    it('should detect mood misalignment', () => {
      const entry = createMockJournalEntry(
        'I am so sad and depressed today.',
        'joy'
      );

      const result = service.analyzeEntry(entry);

      // Should have low alignment since mood doesn't match emotion words
      expect(result.moodAlignment).toBeLessThan(0.5);
    });

    it('should suggest relevant activity tags', () => {
      const entry = createMockJournalEntry(
        'I feel so happy and energetic!',
        'joy'
      );

      const result = service.analyzeEntry(entry);

      expect(result.suggestedTags).toBeDefined();
      expect(Array.isArray(result.suggestedTags)).toBe(true);
    });

    it('should handle empty content', () => {
      const entry = createMockJournalEntry('', 'neutral');

      const result = service.analyzeEntry(entry);

      expect(result.dominantEmotion).toBe('neutral');
      expect(result.emotionDistribution.neutral).toBeGreaterThan(0);
      expect(result.highlightedWords).toEqual([]);
    });

    it('should handle content with punctuation', () => {
      const entry = createMockJournalEntry(
        'I am happy! Really, really excited... This is wonderful!!!',
        'joy'
      );

      const result = service.analyzeEntry(entry);

      expect(result.dominantEmotion).toBe('joy');
      expect(result.highlightedWords.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const entry = createMockJournalEntry(
        'I am HAPPY and EXCITED about this WONDERFUL day!',
        'joy'
      );

      const result = service.analyzeEntry(entry);

      expect(result.dominantEmotion).toBe('joy');
      expect(result.highlightedWords.some(word => word.word === 'happy')).toBe(true);
    });
  });

  describe('analyzeTimeline', () => {
    it('should analyze multiple entries over time', () => {
      const entries = [
        createMockJournalEntry('I am happy today', 'joy'),
        createMockJournalEntry('Feeling sad now', 'sadness'),
        createMockJournalEntry('Very excited!', 'joy'),
      ];

      const result = service.analyzeTimeline(entries, 'week');

      expect(result.emotionTrends).toBeDefined();
      expect(Array.isArray(result.emotionTrends)).toBe(true);
    });

    it('should handle empty timeline', () => {
      const result = service.analyzeTimeline([], 'week');

      expect(result.emotionTrends).toEqual([]);
    });

    it('should handle single entry timeline', () => {
      const entries = [
        createMockJournalEntry('I am happy today', 'joy'),
      ];

      const result = service.analyzeTimeline(entries, 'day');

      expect(result.emotionTrends.length).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle very long content', () => {
      const longContent = 'happy '.repeat(1000) + 'sad '.repeat(500);
      const entry = createMockJournalEntry(longContent, 'joy');

      const result = service.analyzeEntry(entry);

      expect(result.dominantEmotion).toBe('joy');
      expect(result.highlightedWords.length).toBeGreaterThan(0);
    });

    it('should handle special characters and numbers', () => {
      const entry = createMockJournalEntry(
        'I am 100% happy! @#$%^&* This is wonderful :) :( 123',
        'joy'
      );

      const result = service.analyzeEntry(entry);

      expect(result.dominantEmotion).toBe('joy');
      expect(result.highlightedWords.some(word => word.word === 'happy')).toBe(true);
    });

    it('should handle mixed emotions correctly', () => {
      const entry = createMockJournalEntry(
        'I am happy but also sad and angry about this situation',
        'neutral'
      );

      const result = service.analyzeEntry(entry);

      expect(result.emotionDistribution.joy).toBeGreaterThan(0);
      expect(result.emotionDistribution.sadness).toBeGreaterThan(0);
      expect(result.emotionDistribution.anger).toBeGreaterThan(0);
    });
  });
});

