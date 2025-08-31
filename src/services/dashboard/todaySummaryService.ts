import { MoodEntry, MoodType } from '../../types/mood';
import { JournalEntry } from '../../types/journal';
import { format } from 'date-fns';

export interface TodaysSummary {
  moodCount: number;
  journalCount: number;
  dominantMood: MoodType | null;
  topActivities: string[];
  moodTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  averageIntensity: number;
  hasData: boolean;
}

export class TodaySummaryService {
  static calculateTodaysSummary(
    moodEntries: MoodEntry[], 
    journalEntries: JournalEntry[]
  ): TodaysSummary {
    const today = new Date().toISOString().split('T')[0];
    
    // Filter entries for today
    const todayMoodEntries = moodEntries.filter(entry => 
      entry.timestamp.split('T')[0] === today
    );
    
    const todayJournalEntries = journalEntries.filter(entry => 
      entry.createdAt.split('T')[0] === today
    );

    const moodCount = todayMoodEntries.length;
    const journalCount = todayJournalEntries.length;
    const hasData = moodCount > 0 || journalCount > 0;

    if (!hasData) {
      return {
        moodCount: 0,
        journalCount: 0,
        dominantMood: null,
        topActivities: [],
        moodTrend: 'insufficient_data',
        averageIntensity: 0,
        hasData: false,
      };
    }

    // Calculate dominant mood
    const dominantMood = this.calculateDominantMood(todayMoodEntries, todayJournalEntries);
    
    // Calculate top activities
    const topActivities = this.calculateTopActivities(todayMoodEntries, todayJournalEntries);
    
    // Calculate mood trend
    const moodTrend = this.calculateMoodTrend(todayMoodEntries);
    
    // Calculate average intensity
    const averageIntensity = this.calculateAverageIntensity(todayMoodEntries);

    return {
      moodCount,
      journalCount,
      dominantMood,
      topActivities,
      moodTrend,
      averageIntensity,
      hasData,
    };
  }

  private static calculateDominantMood(
    moodEntries: MoodEntry[], 
    journalEntries: JournalEntry[]
  ): MoodType | null {
    const moodCounts: Record<MoodType, number> = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      calm: 0,
      neutral: 0,
    };

    // Count moods from mood entries
    moodEntries.forEach(entry => {
      moodCounts[entry.mood]++;
    });

    // Count moods from journal entries
    journalEntries.forEach(entry => {
      moodCounts[entry.mood]++;
    });

    // Find the most frequent mood
    const entries = Object.entries(moodCounts) as [MoodType, number][];
    const sortedMoods = entries.sort((a, b) => b[1] - a[1]);
    
    return sortedMoods[0][1] > 0 ? sortedMoods[0][0] : null;
  }

  private static calculateTopActivities(
    moodEntries: MoodEntry[], 
    journalEntries: JournalEntry[]
  ): string[] {
    const activityCounts: Record<string, number> = {};

    // Count activities from mood entries
    moodEntries.forEach(entry => {
      entry.activities.forEach(activity => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });

    // Count activities from journal entries
    journalEntries.forEach(entry => {
      entry.activities.forEach(activity => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });

    // Return top 3 activities
    return Object.entries(activityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([activity]) => activity);
  }

  private static calculateMoodTrend(moodEntries: MoodEntry[]): TodaysSummary['moodTrend'] {
    if (moodEntries.length < 2) {
      return 'insufficient_data';
    }

    // Sort by timestamp
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Convert mood to numeric score for trend calculation
    const moodToScore = (mood: MoodType): number => {
      const scores: Record<MoodType, number> = {
        sadness: 1,
        anger: 2,
        fear: 3,
        neutral: 4,
        surprise: 5,
        calm: 6,
        joy: 7,
      };
      return scores[mood] || 4;
    };

    const firstHalf = sortedEntries.slice(0, Math.ceil(sortedEntries.length / 2));
    const secondHalf = sortedEntries.slice(Math.ceil(sortedEntries.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, entry) => 
      sum + moodToScore(entry.mood) * entry.intensity, 0
    ) / firstHalf.length;

    const secondHalfAvg = secondHalf.reduce((sum, entry) => 
      sum + moodToScore(entry.mood) * entry.intensity, 0
    ) / secondHalf.length;

    const difference = secondHalfAvg - firstHalfAvg;
    
    if (Math.abs(difference) < 0.5) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  private static calculateAverageIntensity(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 0;
    
    const totalIntensity = moodEntries.reduce((sum, entry) => sum + entry.intensity, 0);
    return totalIntensity / moodEntries.length;
  }

  static formatSummaryText(summary: TodaysSummary): {
    moodText: string;
    activityText: string;
    trendText: string;
    intensityText: string;
  } {
    const moodLabels: Record<MoodType, string> = {
      joy: 'Joyful',
      sadness: 'Reflective', 
      anger: 'Intense',
      fear: 'Cautious',
      surprise: 'Surprised',
      calm: 'Peaceful',
      neutral: 'Balanced',
    };

    const trendLabels = {
      improving: 'Mood improving throughout the day',
      declining: 'Mood declining throughout the day',
      stable: 'Consistent mood today',
      insufficient_data: 'Not enough data for trend',
    };

    const totalEntries = summary.moodCount + summary.journalCount;
    const moodText = summary.dominantMood 
      ? `Mostly feeling ${moodLabels[summary.dominantMood].toLowerCase()}`
      : `${totalEntries} ${totalEntries === 1 ? 'entry' : 'entries'} today`;

    const activityText = summary.topActivities.length > 0
      ? `Top activities: ${summary.topActivities.slice(0, 2).join(', ')}`
      : 'No activities logged yet';

    const trendText = trendLabels[summary.moodTrend];

    const intensityText = summary.averageIntensity > 0
      ? `Average intensity: ${(summary.averageIntensity * 10).toFixed(1)}/10`
      : '';

    return { moodText, activityText, trendText, intensityText };
  }
}
