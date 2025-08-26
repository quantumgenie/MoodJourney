export type EmotionCategory = 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'neutral';

export interface EmotionWord {
  word: string;
  category: EmotionCategory;
  intensity: number; // 0 to 1
}

export interface JournalEntry {
  id: string;
  content: string;
  date: string;
  mood: string;
  tags?: string[];
}

export interface SemanticAnalysisResult {
  dominantEmotion: EmotionCategory;
  emotionDistribution: Record<EmotionCategory, number>;
  highlightedWords: EmotionWord[];
  moodAlignment: number; // 0 to 1, how well the detected emotions align with selected mood
  suggestedTags: string[];
}

export interface TimelineAnalysis {
  period: 'day' | 'week' | 'month';
  emotionTrends: Array<{
    date: string;
    emotions: Record<EmotionCategory, number>;
  }>;
}
