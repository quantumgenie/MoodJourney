import { MoodStorageService } from '../moodStorage';
import { MoodEntry } from '../../../types/mood';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('MoodStorageService', () => {
  let service: MoodStorageService;

  beforeEach(() => {
    service = MoodStorageService.getInstance();
    jest.clearAllMocks();
    mockAsyncStorage.clear();
  });

  const createMockMoodEntry = (
    id: string = '1',
    mood: string = 'neutral',
    intensity: number = 0.5,
    activities: string[] = [],
    timestamp: string = '2024-01-15T10:00:00Z'
  ): MoodEntry => ({
    id,
    mood: mood as any,
    intensity,
    activities: activities as any,
    notes: '',
    timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MoodStorageService.getInstance();
      const instance2 = MoodStorageService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('saveMoodEntry', () => {
    it('should save a new mood entry', async () => {
      const entry = createMockMoodEntry();
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      await service.saveMoodEntry(entry);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@MoodJourney:moodEntries',
        JSON.stringify([entry])
      );
    });

    it('should add new entry to existing entries', async () => {
      const existingEntry = createMockMoodEntry('1');
      const newEntry = createMockMoodEntry('2');
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([existingEntry]));

      await service.saveMoodEntry(newEntry);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@MoodJourney:moodEntries',
        JSON.stringify([existingEntry, newEntry])
      );
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      const entry = createMockMoodEntry();
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      // The service should handle errors gracefully and not throw
      await expect(service.saveMoodEntry(entry)).resolves.not.toThrow();
    });
  });

  describe('getAllMoodEntries', () => {
    it('should return empty array when no entries exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await service.getAllMoodEntries();

      expect(result).toEqual([]);
    });

    it('should return all mood entries', async () => {
      const entries = [
        createMockMoodEntry('1', 'joy'),
        createMockMoodEntry('2', 'sadness'),
      ];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(entries));

      const result = await service.getAllMoodEntries();

      expect(result).toEqual(entries);
    });

    it('should handle corrupted data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');

      const result = await service.getAllMoodEntries();

      expect(result).toEqual([]);
    });
  });

  describe('getMoodEntriesByDateRange', () => {
    const entries = [
      createMockMoodEntry('1', 'joy', 0.8, [], '2024-01-10T10:00:00Z'),
      createMockMoodEntry('2', 'sadness', 0.3, [], '2024-01-15T10:00:00Z'),
      createMockMoodEntry('3', 'calm', 0.7, [], '2024-01-20T10:00:00Z'),
    ];

    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(entries));
    });

    it('should filter entries by date range', async () => {
      const startDate = new Date('2024-01-14T00:00:00Z');
      const endDate = new Date('2024-01-16T23:59:59Z');

      const result = await service.getMoodEntriesByDateRange(startDate, endDate);

      expect(result).toEqual([entries[1]]);
    });

    it('should include entries on boundary dates', async () => {
      const startDate = new Date('2024-01-15T00:00:00Z');
      const endDate = new Date('2024-01-15T23:59:59Z');

      const result = await service.getMoodEntriesByDateRange(startDate, endDate);

      expect(result).toEqual([entries[1]]);
    });

    it('should return empty array when no entries in range', async () => {
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-05T23:59:59Z');

      const result = await service.getMoodEntriesByDateRange(startDate, endDate);

      expect(result).toEqual([]);
    });

    it('should handle invalid date range gracefully', async () => {
      const startDate = new Date('2024-01-20T00:00:00Z');
      const endDate = new Date('2024-01-10T23:59:59Z'); // End before start

      const result = await service.getMoodEntriesByDateRange(startDate, endDate);

      expect(result).toEqual([]);
    });
  });

  describe('updateMoodEntry', () => {
    it('should update existing mood entry', async () => {
      const existingEntry = createMockMoodEntry('1', 'joy', 0.8);
      const updatedEntry = createMockMoodEntry('1', 'sadness', 0.3);
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([existingEntry]));

      await service.updateMoodEntry(updatedEntry);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@MoodJourney:moodEntries',
        JSON.stringify([updatedEntry])
      );
    });

    it('should handle update of non-existent entry', async () => {
      const entries = [createMockMoodEntry('1')];
      const nonExistentEntry = createMockMoodEntry('999');
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(entries));

      await service.updateMoodEntry(nonExistentEntry);
      // Should not update anything since the entry doesn't exist
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('deleteMoodEntry', () => {
    it('should delete specific mood entry', async () => {
      const entries = [
        createMockMoodEntry('1', 'joy'),
        createMockMoodEntry('2', 'sadness'),
      ];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(entries));

      await service.deleteMoodEntry('1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@MoodJourney:moodEntries',
        JSON.stringify([entries[1]])
      );
    });

    it('should handle deletion of non-existent entry', async () => {
      const entries = [createMockMoodEntry('1')];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(entries));

      await service.deleteMoodEntry('999');

      // Should not change the entries
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@MoodJourney:moodEntries',
        JSON.stringify(entries)
      );
    });
  });

  describe('data validation', () => {
    it('should handle entries with missing properties', async () => {
      const incompleteEntry = {
        id: '1',
        mood: 'joy',
        // Missing other properties
      } as MoodEntry;

      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      await service.saveMoodEntry(incompleteEntry);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle entries with invalid mood types', async () => {
      const invalidEntry = createMockMoodEntry('1', 'invalid_mood' as any);
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      await service.saveMoodEntry(invalidEntry);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle entries with out-of-range intensity', async () => {
      const invalidEntry = createMockMoodEntry('1', 'joy', 2.5); // > 1.0
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      await service.saveMoodEntry(invalidEntry);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle JSON parsing errors gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');

      const result = await service.getAllMoodEntries();

      expect(result).toEqual([]);
    });

    it('should handle AsyncStorage failures gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage failed'));

      // The service should handle errors gracefully and return empty array
      const result = await service.getAllMoodEntries();
      expect(result).toEqual([]);
    });

    it('should handle setItem failures', async () => {
      const entry = createMockMoodEntry();
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Write failed'));

      await expect(service.saveMoodEntry(entry)).rejects.toThrow('Write failed');
    });
  });

  describe('performance considerations', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) =>
        createMockMoodEntry(i.toString(), 'joy', 0.5)
      );
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(largeDataset));

      const startTime = Date.now();
      const result = await service.getAllMoodEntries();
      const endTime = Date.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle date range queries on large datasets', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) =>
        createMockMoodEntry(
          i.toString(),
          'joy',
          0.5,
          [],
          new Date(2024, 0, 1 + (i % 365)).toISOString()
        )
      );
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(largeDataset));

      const startDate = new Date('2024-01-15T00:00:00Z');
      const endDate = new Date('2024-01-20T23:59:59Z');

      const startTime = Date.now();
      const result = await service.getMoodEntriesByDateRange(startDate, endDate);
      const endTime = Date.now();

      expect(result.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });
});

