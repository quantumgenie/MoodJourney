import { MoodEntry, MoodType, ActivityTag } from '../../types/mood';

export interface ActivityCorrelation {
  activity: ActivityTag;
  totalEntries: number;
  averageMoodScore: number;      // Combined mood + intensity score (1-10)
  averageIntensity: number;      // Raw intensity average
  moodDistribution: Partial<Record<MoodType, number>>;
  improvementScore: number;      // How much this activity boosts mood vs baseline
  frequency: number;            // How often this activity appears (0-1)
  confidence: 'Low' | 'Medium' | 'High';
  trend?: 'improving' | 'declining' | 'stable';
}

export interface ActivityInsight {
  type: 'boost' | 'challenge' | 'combination' | 'trend';
  message: string;
  activities: ActivityTag[];
  score?: number;
}

export class ActivityCorrelationService {
  // Convert mood types to numerical scores for analysis
  private readonly moodToScore: Record<string, number> = {
    // Standard format
    'sadness': 2,
    'anger': 3,
    'fear': 3,
    'neutral': 5,
    'surprise': 6,
    'calm': 7,
    'joy': 9,
    // Alternative formats
    'sad': 2,
    'happy': 9,
    'stress': 3,
    'excited': 8,
    'anxious': 3,
    'peaceful': 7,
  };

  /**
   * Calculate how each activity correlates with mood scores
   */
  public analyzeActivityCorrelations(moodEntries: MoodEntry[]): ActivityCorrelation[] {
    if (!moodEntries || moodEntries.length === 0) {
      return [];
    }

    const correlations = new Map<ActivityTag, {
      entries: Array<{
        moodScore: number;
        intensity: number;
        combinedScore: number;
        timestamp: string;
        mood: string;
      }>;
    }>();

    // Group entries by activity
    moodEntries.forEach(entry => {
      const moodScore = this.moodToScore[entry.mood as string] || 5; // Default to neutral
      const scaledIntensity = entry.intensity * 10;
      const combinedScore = (moodScore + scaledIntensity) / 2;

      // Skip entries with no activities
      if (entry.activities.length === 0) {
        return;
      }

      entry.activities.forEach(activity => {
        if (!correlations.has(activity)) {
          correlations.set(activity, { entries: [] });
        }

        correlations.get(activity)!.entries.push({
          moodScore,
          intensity: scaledIntensity,
          combinedScore,
          timestamp: entry.timestamp,
          mood: entry.mood as string
        });
      });
    });

    // Calculate overall baseline for comparison - only from entries with activities
    const entriesWithActivities = moodEntries.filter(e => e.activities.length > 0);
    const overallAverage = this.calculateOverallAverage(entriesWithActivities);

    // Convert to correlation objects with statistics
    const results: ActivityCorrelation[] = [];

    correlations.forEach((data, activity) => {
      const scores = data.entries.map(e => e.combinedScore);
      const intensities = data.entries.map(e => e.intensity);
      
      // Filter valid scores
      const validScores = scores.filter(s => !isNaN(s) && isFinite(s));
      const validIntensities = intensities.filter(i => !isNaN(i) && isFinite(i));
      
      if (validScores.length === 0) {
        return; // Skip activities with no valid scores
      }
      
      const averageScore = validScores.reduce((a, b) => a + b, 0) / validScores.length;
      const averageIntensity = validIntensities.reduce((a, b) => a + b, 0) / validIntensities.length;
      
      // Calculate improvement score with safety checks
      const improvementScore = !isNaN(overallAverage) && isFinite(overallAverage) 
        ? averageScore - overallAverage 
        : 0;
      
      // Calculate mood distribution
      const moodDistribution: Partial<Record<MoodType, number>> = {};
      data.entries.forEach(entry => {
        const normalizedMood = this.normalizeMoodType(entry.mood);
        moodDistribution[normalizedMood] = (moodDistribution[normalizedMood] || 0) + 1;
      });
      
      // Convert counts to percentages
      Object.keys(moodDistribution).forEach(mood => {
        moodDistribution[mood as MoodType] = 
          (moodDistribution[mood as MoodType]! / data.entries.length) * 100;
      });

      const correlation: ActivityCorrelation = {
        activity,
        totalEntries: data.entries.length,
        averageMoodScore: Math.round(averageScore * 10) / 10,
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        moodDistribution,
        improvementScore: Math.round(improvementScore * 100) / 100,
        frequency: Math.round((data.entries.length / entriesWithActivities.length) * 100) / 100,
        confidence: this.calculateConfidence(data.entries.length),
        trend: this.calculateTrend(data.entries)
      };

      results.push(correlation);
    });

    // Sort by improvement score (best first)
    return results.sort((a, b) => {
      const scoreA = isNaN(a.improvementScore) ? -999 : a.improvementScore;
      const scoreB = isNaN(b.improvementScore) ? -999 : b.improvementScore;
      return scoreB - scoreA;
    });
  }

  /**
   * Generate actionable insights from activity correlations
   */
  public generateInsights(correlations: ActivityCorrelation[]): ActivityInsight[] {
    const insights: ActivityInsight[] = [];

    if (correlations.length === 0) {
      return insights;
    }

    // Filter out correlations with invalid improvement scores
    const validCorrelations = correlations.filter(c => 
      !isNaN(c.improvementScore) && isFinite(c.improvementScore)
    );

    if (validCorrelations.length === 0) {
      return insights;
    }

    // Find best mood-boosting activity
    const bestActivity = validCorrelations[0];
    if (bestActivity.improvementScore > 0.2 && bestActivity.confidence !== 'Low') {
      insights.push({
        type: 'boost',
        message: `${bestActivity.activity} consistently boosts your mood by ${Math.abs(bestActivity.improvementScore * 10).toFixed(0)}%`,
        activities: [bestActivity.activity],
        score: bestActivity.improvementScore
      });
    }

    // Find challenging activities
    const worstActivity = validCorrelations[validCorrelations.length - 1];
    if (worstActivity.improvementScore < -0.2 && worstActivity.confidence !== 'Low') {
      insights.push({
        type: 'challenge',
        message: `Consider balancing ${worstActivity.activity} with mood-boosting activities`,
        activities: [worstActivity.activity],
        score: worstActivity.improvementScore
      });
    }

    // Find activities with improving trends
    const improvingActivities = validCorrelations.filter(c => 
      c.trend === 'improving' && c.confidence !== 'Low'
    );
    if (improvingActivities.length > 0) {
      const activity = improvingActivities[0];
      insights.push({
        type: 'trend',
        message: `${activity.activity} is becoming more effective for your mood over time`,
        activities: [activity.activity]
      });
    }

    // Suggest activity combinations
    const combination = this.findBestActivityCombination(validCorrelations);
    if (combination) {
      insights.push({
        type: 'combination',
        message: `${combination.activities.join(' + ')} work great together`,
        activities: combination.activities,
        score: combination.score
      });
    }

    return insights.slice(0, 4); // Limit to top 4 insights
  }

  private normalizeMoodType(mood: string): MoodType {
    const moodMap: Record<string, MoodType> = {
      'happy': 'joy',
      'sad': 'sadness',
      'calm': 'calm',
      'joy': 'joy',
      'sadness': 'sadness',
      'stress': 'anger',
      'excited': 'joy',
      'anxious': 'fear',
      'peaceful': 'calm',
      'neutral': 'neutral',
      'anger': 'anger',
      'fear': 'fear',
      'surprise': 'surprise'
    };
    return moodMap[mood] || 'neutral';
  }

  private calculateOverallAverage(moodEntries: MoodEntry[]): number {
    if (moodEntries.length === 0) return 5;
    
    let validScores: number[] = [];
    
    moodEntries.forEach(entry => {
      const moodScore = this.moodToScore[entry.mood as string] || 5;
      const scaledIntensity = entry.intensity * 10;
      const combinedScore = (moodScore + scaledIntensity) / 2;
      
      if (!isNaN(combinedScore) && isFinite(combinedScore)) {
        validScores.push(combinedScore);
      }
    });
    
    if (validScores.length === 0) {
      return 5; // Default to neutral
    }
    
    return validScores.reduce((a, b) => a + b, 0) / validScores.length;
  }

  private calculateConfidence(sampleSize: number): 'Low' | 'Medium' | 'High' {
    if (sampleSize < 3) return 'Low';
    if (sampleSize < 8) return 'Medium';
    return 'High';
  }

  private calculateTrend(entries: Array<{ combinedScore: number; timestamp: string }>): 'improving' | 'declining' | 'stable' {
    if (entries.length < 3) return 'stable';

    // Filter out invalid scores
    const validEntries = entries.filter(e => !isNaN(e.combinedScore) && isFinite(e.combinedScore));
    if (validEntries.length < 3) return 'stable';

    // Sort by timestamp
    const sorted = validEntries
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const midPoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midPoint);
    const secondHalf = sorted.slice(midPoint);

    const firstAvg = firstHalf.reduce((sum, e) => sum + e.combinedScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, e) => sum + e.combinedScore, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    
    if (difference > 0.2) return 'improving';
    if (difference < -0.2) return 'declining';
    return 'stable';
  }

  private findBestActivityCombination(correlations: ActivityCorrelation[]): { activities: ActivityTag[]; score: number } | null {
    const validCorrelations = correlations.filter(c => 
      !isNaN(c.improvementScore) && isFinite(c.improvementScore)
    );
    
    const topTwo = validCorrelations.slice(0, 2);
    
    if (topTwo.length === 2 && topTwo[0].improvementScore > 0.1 && topTwo[1].improvementScore > 0.1) {
      return {
        activities: topTwo.map(c => c.activity),
        score: (topTwo[0].improvementScore + topTwo[1].improvementScore) / 2
      };
    }
    
    return null;
  }
}