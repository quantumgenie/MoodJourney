/**
 * Test Data Generators for Integration Tests
 * Provides realistic test data for integration testing scenarios
 */

import { MoodEntry, MoodType, ActivityTag } from '../../types/mood';
import { JournalEntry } from '../../types/journal';

export class IntegrationTestData {
  /**
   * Generate a realistic mood entry for testing
   */
  static createMoodEntry(overrides: Partial<MoodEntry> = {}): MoodEntry {
    const defaultEntry: MoodEntry = {
      id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mood: 'joy',
      intensity: 0.7,
      activities: ['Exercise'],
      notes: 'Feeling great after morning workout',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { ...defaultEntry, ...overrides };
  }

  /**
   * Generate a realistic journal entry for testing
   */
  static createJournalEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
    const defaultEntry: JournalEntry = {
      id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'A Great Day',
      content: 'Today was wonderful! I went for a run in the morning and felt amazing. The weather was perfect and I met a friend for coffee. Feeling grateful and happy.',
      mood: 'joy',
      activities: ['Exercise', 'Social'],
      tags: ['gratitude', 'exercise', 'friends'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { ...defaultEntry, ...overrides };
  }

  /**
   * Generate multiple mood entries for a realistic user journey
   */
  static createMoodJourney(days: number = 7): MoodEntry[] {
    const entries: MoodEntry[] = [];
    const moods: MoodType[] = ['joy', 'calm', 'neutral', 'sadness', 'anger'];
    const activities: ActivityTag[] = ['Exercise', 'Work', 'Social', 'Rest', 'Family'];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Create 1-3 entries per day
      const entriesPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < entriesPerDay; j++) {
        const entryDate = new Date(date);
        entryDate.setHours(8 + (j * 4), Math.floor(Math.random() * 60));

        entries.push(this.createMoodEntry({
          mood: moods[Math.floor(Math.random() * moods.length)],
          intensity: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
          activities: [activities[Math.floor(Math.random() * activities.length)]],
          timestamp: entryDate.toISOString(),
          createdAt: entryDate.toISOString(),
          updatedAt: entryDate.toISOString(),
        }));
      }
    }

    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Generate multiple journal entries for testing
   */
  static createJournalCollection(count: number = 5): JournalEntry[] {
    const entries: JournalEntry[] = [];
    const titles = [
      'Morning Reflections',
      'Challenging Day at Work',
      'Weekend Adventures',
      'Quiet Evening',
      'Family Time',
      'Personal Growth',
      'Stressful Moments',
      'Peaceful Walk',
      'Creative Inspiration',
      'Gratitude Practice'
    ];

    const contents = [
      'Started the day with meditation and coffee. Feeling centered and ready for whatever comes my way.',
      'Work was particularly challenging today. Had to deal with difficult clients but managed to stay professional.',
      'Went hiking with friends this weekend. The fresh air and good company really lifted my spirits.',
      'Spent a quiet evening reading and listening to music. Sometimes solitude is exactly what I need.',
      'Family dinner was wonderful. Great conversations and lots of laughter around the table.',
      'Attended a workshop on mindfulness. Learning new techniques to manage stress and anxiety.',
      'Feeling overwhelmed with deadlines and responsibilities. Need to find better work-life balance.',
      'Took a long walk in the park. Nature has a way of putting things into perspective.',
      'Had a burst of creative energy today. Worked on my art project and made significant progress.',
      'Practicing gratitude by writing down three things I\'m thankful for each day.'
    ];

    const moods: MoodType[] = ['joy', 'calm', 'neutral', 'sadness', 'anger', 'fear', 'surprise'];
    const activities: ActivityTag[] = ['Exercise', 'Work', 'Social', 'Rest', 'Family', 'Hobby', 'Nature'];

    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      entries.push(this.createJournalEntry({
        title: titles[i % titles.length],
        content: contents[i % contents.length],
        mood: moods[Math.floor(Math.random() * moods.length)],
        activities: [
          activities[Math.floor(Math.random() * activities.length)],
          activities[Math.floor(Math.random() * activities.length)]
        ].filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      }));
    }

    return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Create a complete user scenario with both mood and journal entries
   */
  static createCompleteUserScenario() {
    return {
      moodEntries: this.createMoodJourney(14), // 2 weeks of mood data
      journalEntries: this.createJournalCollection(10), // 10 journal entries
    };
  }

  /**
   * Create today's data for dashboard testing
   */
  static createTodayData() {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    return {
      moodEntries: [
        this.createMoodEntry({
          mood: 'joy',
          intensity: 0.8,
          activities: ['Exercise'],
          timestamp: `${todayISO}T08:00:00.000Z`,
        }),
        this.createMoodEntry({
          mood: 'calm',
          intensity: 0.6,
          activities: ['Work'],
          timestamp: `${todayISO}T14:00:00.000Z`,
        }),
      ],
      journalEntries: [
        this.createJournalEntry({
          title: 'Great Morning',
          content: 'Started the day with energy and positivity!',
          mood: 'joy',
          activities: ['Exercise', 'Meditation'],
          createdAt: `${todayISO}T09:00:00.000Z`,
        }),
      ],
    };
  }
}
