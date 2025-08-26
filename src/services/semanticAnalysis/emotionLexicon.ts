import { EmotionCategory, EmotionWord } from './types';

// This is a simplified emotion lexicon. In a production app, you'd want a much more comprehensive database
export const emotionLexicon: EmotionWord[] = [
  // Joy
  { word: 'happy', category: 'joy', intensity: 0.8 },
  { word: 'excited', category: 'joy', intensity: 0.9 },
  { word: 'grateful', category: 'joy', intensity: 0.7 },
  { word: 'peaceful', category: 'joy', intensity: 0.6 },
  { word: 'wonderful', category: 'joy', intensity: 0.8 },
  
  // Sadness
  { word: 'sad', category: 'sadness', intensity: 0.7 },
  { word: 'disappointed', category: 'sadness', intensity: 0.6 },
  { word: 'lonely', category: 'sadness', intensity: 0.8 },
  { word: 'hopeless', category: 'sadness', intensity: 0.9 },
  { word: 'missing', category: 'sadness', intensity: 0.5 },

  // Anger
  { word: 'angry', category: 'anger', intensity: 0.8 },
  { word: 'frustrated', category: 'anger', intensity: 0.6 },
  { word: 'annoyed', category: 'anger', intensity: 0.5 },
  { word: 'furious', category: 'anger', intensity: 0.9 },
  { word: 'irritated', category: 'anger', intensity: 0.4 },

  // Fear
  { word: 'afraid', category: 'fear', intensity: 0.7 },
  { word: 'worried', category: 'fear', intensity: 0.6 },
  { word: 'anxious', category: 'fear', intensity: 0.8 },
  { word: 'nervous', category: 'fear', intensity: 0.5 },
  { word: 'scared', category: 'fear', intensity: 0.7 },

  // Surprise
  { word: 'surprised', category: 'surprise', intensity: 0.7 },
  { word: 'amazed', category: 'surprise', intensity: 0.8 },
  { word: 'shocked', category: 'surprise', intensity: 0.9 },
  { word: 'unexpected', category: 'surprise', intensity: 0.6 },
  { word: 'astonished', category: 'surprise', intensity: 0.8 },

  // Neutral
  { word: 'okay', category: 'neutral', intensity: 0.3 },
  { word: 'fine', category: 'neutral', intensity: 0.3 },
  { word: 'normal', category: 'neutral', intensity: 0.2 },
  { word: 'average', category: 'neutral', intensity: 0.2 },
  { word: 'regular', category: 'neutral', intensity: 0.2 },
];

// Common activity tags that might correlate with emotions
export const activityTags = [
  'exercise',
  'work',
  'family',
  'friends',
  'hobby',
  'sleep',
  'food',
  'travel',
  'study',
  'meditation',
  'shopping',
  'reading',
  'music',
  'nature',
  'social',
] as const;

// Emotion-activity correlations for tag suggestions
export const emotionActivityCorrelations: Record<EmotionCategory, string[]> = {
  joy: ['exercise', 'friends', 'hobby', 'music', 'nature'],
  sadness: ['meditation', 'music', 'reading', 'nature'],
  anger: ['exercise', 'meditation', 'music'],
  fear: ['meditation', 'friends', 'reading'],
  surprise: ['social', 'travel', 'shopping'],
  neutral: ['work', 'study', 'food'],
};
