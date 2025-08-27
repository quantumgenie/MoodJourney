import { useState, useCallback } from 'react';
import { JournalEntry, JournalFilter } from '../types/journal';
import { JournalStorageService } from '../services/storage/journalStorage';

export const useJournalStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storageService = JournalStorageService.getInstance();

  const saveJournalEntry = useCallback(async (entry: JournalEntry) => {
    setIsLoading(true);
    setError(null);
    try {
      await storageService.saveJournalEntry(entry);
    } catch (err) {
      setError('Failed to save journal entry');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getJournalEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await storageService.getAllJournalEntries();
    } catch (err) {
      setError('Failed to get journal entries');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getJournalEntry = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await storageService.getJournalEntry(id);
    } catch (err) {
      setError('Failed to get journal entry');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteJournalEntry = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await storageService.deleteJournalEntry(id);
    } catch (err) {
      setError('Failed to delete journal entry');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchJournalEntries = useCallback(async (filter: JournalFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      return await storageService.searchJournalEntries(filter);
    } catch (err) {
      setError('Failed to search journal entries');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    saveJournalEntry,
    getJournalEntries,
    getJournalEntry,
    deleteJournalEntry,
    searchJournalEntries,
  };
};
