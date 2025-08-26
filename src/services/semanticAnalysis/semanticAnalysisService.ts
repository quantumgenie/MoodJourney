import { 
  EmotionCategory, 
  EmotionWord, 
  JournalEntry, 
  SemanticAnalysisResult,
  TimelineAnalysis 
} from './types';
import { emotionLexicon, emotionActivityCorrelations } from './emotionLexicon';

export class SemanticAnalysisService {
  private normalizeText(text: string): string[] {
    return text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/);
  }

  private findEmotionWords(words: string[]): EmotionWord[] {
    return words.reduce<EmotionWord[]>((acc, word) => {
      const emotionWord = emotionLexicon.find(ew => ew.word === word);
      if (emotionWord) {
        acc.push(emotionWord);
      }
      return acc;
    }, []);
  }

  private calculateEmotionDistribution(emotionWords: EmotionWord[]): Record<EmotionCategory, number> {
    const distribution: Record<EmotionCategory, number> = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      neutral: 0,
    };

    if (emotionWords.length === 0) {
      return distribution;
    }

    // Calculate weighted distribution
    emotionWords.forEach(word => {
      distribution[word.category] += word.intensity;
    });

    // Normalize to percentages
    const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
    if (total > 0) {
      Object.keys(distribution).forEach(key => {
        distribution[key as EmotionCategory] = (distribution[key as EmotionCategory] / total) * 100;
      });
    }

    return distribution;
  }

  private findDominantEmotion(distribution: Record<EmotionCategory, number>): EmotionCategory {
    return Object.entries(distribution).reduce(
      (max, [emotion, value]) => value > max.value ? { emotion: emotion as EmotionCategory, value } : max,
      { emotion: 'neutral' as EmotionCategory, value: 0 }
    ).emotion;
  }

  private calculateMoodAlignment(
    selectedMood: string, 
    emotionDistribution: Record<EmotionCategory, number>
  ): number {
    // Simplified alignment calculation
    // In a real app, you'd want more sophisticated mapping between moods and emotions
    const moodToEmotionMap: Record<string, EmotionCategory> = {
      happy: 'joy',
      sad: 'sadness',
      angry: 'anger',
      calm: 'neutral',
      neutral: 'neutral',
    };

    const mappedEmotion = moodToEmotionMap[selectedMood] || 'neutral';
    return emotionDistribution[mappedEmotion] / 100; // Convert percentage to 0-1 scale
  }

  private suggestTags(dominantEmotion: EmotionCategory): string[] {
    return emotionActivityCorrelations[dominantEmotion] || [];
  }

  public analyzeEntry(entry: JournalEntry): SemanticAnalysisResult {
    const words = this.normalizeText(entry.content);
    const emotionWords = this.findEmotionWords(words);
    const emotionDistribution = this.calculateEmotionDistribution(emotionWords);
    const dominantEmotion = this.findDominantEmotion(emotionDistribution);
    const moodAlignment = this.calculateMoodAlignment(entry.mood, emotionDistribution);
    const suggestedTags = this.suggestTags(dominantEmotion);

    return {
      dominantEmotion,
      emotionDistribution,
      highlightedWords: emotionWords,
      moodAlignment,
      suggestedTags,
    };
  }

  public analyzeTimeline(entries: JournalEntry[], period: 'day' | 'week' | 'month'): TimelineAnalysis {
    // Group entries by date and analyze emotions for each day
    const emotionTrends = entries.reduce<Record<string, Record<EmotionCategory, number>>>((acc, entry) => {
      const date = entry.date.split('T')[0]; // Get just the date part
      if (!acc[date]) {
        acc[date] = this.calculateEmotionDistribution(
          this.findEmotionWords(this.normalizeText(entry.content))
        );
      }
      return acc;
    }, {});

    return {
      period,
      emotionTrends: Object.entries(emotionTrends).map(([date, emotions]) => ({
        date,
        emotions,
      })),
    };
  }

  public getInsights(analysisResults: SemanticAnalysisResult[]): string[] {
    const insights: string[] = [];
    
    // Example insights generation (you can expand this with more sophisticated analysis)
    if (analysisResults.length > 0) {
      const dominantEmotions = analysisResults.map(r => r.dominantEmotion);
      const mostCommonEmotion = this.findMostCommon(dominantEmotions);
      
      insights.push(`Your entries often express ${mostCommonEmotion}`);
      
      const avgMoodAlignment = analysisResults.reduce((sum, r) => sum + r.moodAlignment, 0) / analysisResults.length;
      if (avgMoodAlignment > 0.7) {
        insights.push('Your mood selections closely match your written emotions');
      } else if (avgMoodAlignment < 0.3) {
        insights.push('Consider reflecting on how you rate your moods versus how you express them in writing');
      }
    }

    return insights;
  }

  private findMostCommon<T>(arr: T[]): T {
    return arr.reduce(
      (a, b, i, arr) =>
        (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b),
      arr[0]
    );
  }
}
