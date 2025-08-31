import { JournalStorageService } from '../journalStorage';
import { JournalEntry, JournalFilter } from '../../../types/journal';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('JournalStorageService', () => {
  let service: JournalStorageService;

  beforeEach(() => {
    service = JournalStorageService.getInstance();
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockAsyncStorage.clear();
  });

  const createMockJournalEntry = (
    id: string = '1',
    title: string = 'Test Entry',
    content: string = 'Test content',
    mood: string = 'neutral',
    activities: string[] = [],
    createdAt: string = '2024-01-15T10:00:00Z'
  ): JournalEntry => ({
    id,
    title,
    content,
    mood: mood as any,
    activities: activities as any,
    tags: [],
    createdAt,
    updatedAt: createdAt,
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = JournalStorageService.getInstance();
      const instance2 = JournalStorageService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('saveJournalEntry', () => {
    it('should save a new journal entry', async () => {
      const entry = createMockJournalEntry();
      mockAsyncStorage.getItem.mockResolvedValueOnce(null); // No existing entries

      await service.saveJournalEntry(entry);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@MoodJourney:journalEntries',
        JSON.stringify([entry])
      );
    });

    it('should update existing journal entry', async () => {
      const existingEntry = createMockJournalEntry('1', 'Old Title');
      const updatedEntry = createMockJournalEntry('1', 'New Title');
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([existingEntry]));

      await service.saveJournalEntry(updatedEntry);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@MoodJourney:journalEntries',
        JSON.stringify([updatedEntry])
      );
    });

    it('should add new entry to existing entries', async () => {
      const existingEntry = createMockJournalEntry('1');
      const newEntry = createMockJournalEntry('2');
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([existingEntry]));

      await service.saveJournalEntry(newEntry);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@MoodJourney:journalEntries',
        JSON.stringify([existingEntry, newEntry])
      );
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      const entry = createMockJournalEntry();
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      // The service should handle errors gracefully and not throw
      await expect(service.saveJournalEntry(entry)).resolves.not.toThrow();
    });
  });

  describe('getAllJournalEntries', () => {
    it('should return empty array when no entries exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await service.getAllJournalEntries();

      expect(result).toEqual([]);
    });

    it('should return all journal entries', async () => {
      const entries = [
        createMockJournalEntry('1'),
        createMockJournalEntry('2'),
      ];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(entries));

      const result = await service.getAllJournalEntries();

      expect(result).toEqual(entries);
    });

    it('should handle corrupted data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');

      const result = await service.getAllJournalEntries();

      expect(result).toEqual([]);
    });
  });

  describe('getJournalEntry', () => {
    it('should return specific journal entry by id', async () => {
      const entries = [
        createMockJournalEntry('1', 'First Entry'),
        createMockJournalEntry('2', 'Second Entry'),
      ];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(entries));

      const result = await service.getJournalEntry('2');

      expect(result).toEqual(entries[1]);
    });

    it('should return null for non-existent entry', async () => {
      const entries = [createMockJournalEntry('1')];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(entries));

      const result = await service.getJournalEntry('999');

      expect(result).toBeNull();
    });
  });

  describe('deleteJournalEntry', () => {
    it('should delete specific journal entry', async () => {
      const entries = [
        createMockJournalEntry('1'),
        createMockJournalEntry('2'),
      ];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(entries));

      await service.deleteJournalEntry('1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@MoodJourney:journalEntries',
        JSON.stringify([entries[1]])
      );
    });

    it('should handle deletion of non-existent entry', async () => {
      const entries = [createMockJournalEntry('1')];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(entries));

      await service.deleteJournalEntry('999');

      // Should not change the entries
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@MoodJourney:journalEntries',
        JSON.stringify(entries)
      );
    });
  });

  describe('searchJournalEntries', () => {
    const entries = [
      createMockJournalEntry('1', 'Happy Day', 'I felt really happy today!', 'joy', ['Exercise'], '2024-01-15T10:00:00Z'),
      createMockJournalEntry('2', 'Sad Moment', 'Feeling down and sad', 'sadness', ['Work'], '2024-01-14T10:00:00Z'),
      createMockJournalEntry('3', 'Calm Evening', 'Peaceful meditation session', 'calm', ['Meditation'], '2024-01-13T10:00:00Z'),
    ];

    beforeEach(() => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(entries));
    });

    it('should return all entries when no filter is provided', async () => {
      const result = await service.searchJournalEntries({});

      expect(result).toEqual(entries);
    });

    it('should filter by search text in title', async () => {
      const filter: JournalFilter = { searchText: 'happy' };

      const result = await service.searchJournalEntries(filter);

      expect(result).toEqual([entries[0]]);
    });

    it('should filter by search text in content', async () => {
      const filter: JournalFilter = { searchText: 'meditation' };

      const result = await service.searchJournalEntries(filter);

      expect(result).toEqual([entries[2]]);
    });

    it('should filter by single mood', async () => {
      const filter: JournalFilter = { moods: ['joy'] };

      const result = await service.searchJournalEntries(filter);

      expect(result).toEqual([entries[0]]);
    });

    it('should filter by multiple moods', async () => {
      const filter: JournalFilter = { moods: ['joy', 'sadness'] };

      const result = await service.searchJournalEntries(filter);

      expect(result).toEqual([entries[0], entries[1]]);
    });

    it('should filter by activity tags', async () => {
      const filter: JournalFilter = { activities: ['Exercise'] };

      const result = await service.searchJournalEntries(filter);

      expect(result).toEqual([entries[0]]);
    });

    it('should filter by date range', async () => {
      const filter: JournalFilter = {
        startDate: '2024-01-14T00:00:00Z',
        endDate: '2024-01-15T23:59:59Z'
      };

      const result = await service.searchJournalEntries(filter);

      expect(result).toEqual([entries[0], entries[1]]);
    });

    it('should combine multiple filters', async () => {
      const filter: JournalFilter = {
        searchText: 'happy',
        moods: ['joy'],
        activities: ['Exercise'],
        startDate: '2024-01-15T00:00:00Z',
        endDate: '2024-01-15T23:59:59Z'
      };

      const result = await service.searchJournalEntries(filter);

      expect(result).toEqual([entries[0]]);
    });

    it('should be case insensitive for search text', async () => {
      const filter: JournalFilter = { searchText: 'HAPPY' };

      const result = await service.searchJournalEntries(filter);

      expect(result).toEqual([entries[0]]);
    });

    it('should return empty array when no matches found', async () => {
      const filter: JournalFilter = { searchText: 'nonexistent' };

      const result = await service.searchJournalEntries(filter);

      expect(result).toEqual([]);
    });

    it('should handle empty search text', async () => {
      const filter: JournalFilter = { searchText: '' };

      const result = await service.searchJournalEntries(filter);

      expect(result).toEqual(entries);
    });
  });

  describe('error handling', () => {
    it('should handle JSON parsing errors gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');

      const result = await service.getAllJournalEntries();

      expect(result).toEqual([]);
    });

    it('should handle AsyncStorage failures gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage failed'));

      // The service should handle errors gracefully and return empty array
      const result = await service.getAllJournalEntries();
      expect(result).toEqual([]);
    });
  });
});

