import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '../../types/mood';

const MOOD_ENTRIES_KEY = '@MoodJourney:moodEntries';

export class MoodStorageService {
  private static instance: MoodStorageService;
  private constructor() {}

  static getInstance(): MoodStorageService {
    if (!MoodStorageService.instance) {
      MoodStorageService.instance = new MoodStorageService();
    }
    return MoodStorageService.instance;
  }

  async saveMoodEntry(entry: MoodEntry): Promise<void> {
    try {
      const entries = await this.getAllMoodEntries();
      entries.push(entry);
      await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving mood entry:', error);
      throw error;
    }
  }

  async getAllMoodEntries(): Promise<MoodEntry[]> {
    try {
      const entriesJson = await AsyncStorage.getItem(MOOD_ENTRIES_KEY);
      return entriesJson ? JSON.parse(entriesJson) : [];
    } catch (error) {
      console.error('Error getting mood entries:', error);
      return [];
    }
  }

  async getMoodEntriesByDateRange(startDate: Date, endDate: Date): Promise<MoodEntry[]> {
    try {
      const entries = await this.getAllMoodEntries();
      return entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting mood entries by date range:', error);
      return [];
    }
  }

  async updateMoodEntry(updatedEntry: MoodEntry): Promise<void> {
    try {
      const entries = await this.getAllMoodEntries();
      const index = entries.findIndex(entry => entry.id === updatedEntry.id);
      if (index !== -1) {
        entries[index] = updatedEntry;
        await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(entries));
      }
    } catch (error) {
      console.error('Error updating mood entry:', error);
      throw error;
    }
  }

  async deleteMoodEntry(entryId: string): Promise<void> {
    try {
      const entries = await this.getAllMoodEntries();
      const filteredEntries = entries.filter(entry => entry.id !== entryId);
      await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(filteredEntries));
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      throw error;
    }
  }

  async clearAllMoodEntries(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MOOD_ENTRIES_KEY);
    } catch (error) {
      console.error('Error clearing mood entries:', error);
      throw error;
    }
  }
}
