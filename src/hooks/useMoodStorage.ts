import { useState, useCallback } from 'react';
import { MoodEntry } from '../types/mood';
import { MoodStorageService } from '../services/storage/moodStorage';

export const useMoodStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storageService = MoodStorageService.getInstance();

  const saveMoodEntry = useCallback(async (entry: MoodEntry) => {
    setIsLoading(true);
    setError(null);
    try {
      await storageService.saveMoodEntry(entry);
    } catch (err) {
      setError('Failed to save mood entry');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMoodEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await storageService.getAllMoodEntries();
    } catch (err) {
      setError('Failed to get mood entries');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMoodEntriesByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      return await storageService.getMoodEntriesByDateRange(startDate, endDate);
    } catch (err) {
      setError('Failed to get mood entries for date range');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMoodEntry = useCallback(async (entry: MoodEntry) => {
    setIsLoading(true);
    setError(null);
    try {
      await storageService.updateMoodEntry(entry);
    } catch (err) {
      setError('Failed to update mood entry');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMoodEntry = useCallback(async (entryId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await storageService.deleteMoodEntry(entryId);
    } catch (err) {
      setError('Failed to delete mood entry');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    saveMoodEntry,
    getMoodEntries,
    getMoodEntriesByDateRange,
    updateMoodEntry,
    deleteMoodEntry,
  };
};
