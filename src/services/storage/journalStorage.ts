import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry, JournalFilter } from '../../types/journal';

const JOURNAL_ENTRIES_KEY = '@MoodJourney:journalEntries';

export class JournalStorageService {
  private static instance: JournalStorageService;
  private constructor() {}

  static getInstance(): JournalStorageService {
    if (!JournalStorageService.instance) {
      JournalStorageService.instance = new JournalStorageService();
    }
    return JournalStorageService.instance;
  }

  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    try {
      const entries = await this.getAllJournalEntries();
      const existingIndex = entries.findIndex(e => e.id === entry.id);
      
      if (existingIndex !== -1) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }
      
      await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving journal entry:', error);
      throw error;
    }
  }

  async getAllJournalEntries(): Promise<JournalEntry[]> {
    try {
      const entriesJson = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
      return entriesJson ? JSON.parse(entriesJson) : [];
    } catch (error) {
      console.error('Error getting journal entries:', error);
      return [];
    }
  }

  async getJournalEntry(id: string): Promise<JournalEntry | null> {
    try {
      const entries = await this.getAllJournalEntries();
      return entries.find(entry => entry.id === id) || null;
    } catch (error) {
      console.error('Error getting journal entry:', error);
      return null;
    }
  }

  async deleteJournalEntry(id: string): Promise<void> {
    try {
      const entries = await this.getAllJournalEntries();
      const filteredEntries = entries.filter(entry => entry.id !== id);
      await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(filteredEntries));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }

  async searchJournalEntries(filter: JournalFilter): Promise<JournalEntry[]> {
    try {
      let entries = await this.getAllJournalEntries();

      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        entries = entries.filter(entry =>
          entry.title.toLowerCase().includes(searchLower) ||
          entry.content.toLowerCase().includes(searchLower) ||
          entry.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      if (filter.moods && filter.moods.length > 0) {
        entries = entries.filter(entry => filter.moods!.includes(entry.mood));
      }

      if (filter.tags?.length) {
        entries = entries.filter(entry =>
          filter.tags!.some(tag => entry.tags.includes(tag))
        );
      }

      if (filter.activities?.length) {
        entries = entries.filter(entry =>
          filter.activities!.some(activity => entry.activities.includes(activity))
        );
      }

      if (filter.startDate) {
        entries = entries.filter(entry => entry.createdAt >= filter.startDate!);
      }

      if (filter.endDate) {
        entries = entries.filter(entry => entry.createdAt <= filter.endDate!);
      }

      return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      console.error('Error searching journal entries:', error);
      return [];
    }
  }
}
