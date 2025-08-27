export type MoodType = 'happy' | 'calm' | 'neutral' | 'sad' | 'angry';

export interface MoodEntry {
  id: string;
  mood: MoodType;
  intensity: number;
  activities: ActivityTag[];
  notes: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export const ACTIVITY_TAGS = [
  'Exercise',
  'Work',
  'Social',
  'Family',
  'Hobby',
  'Rest',
  'Entertainment',
  'Learning',
  'Chores',
  'Nature',
  'Travel',
  'Shopping',
  'Health',
  'Food',
  'Sleep',
] as const;

export type ActivityTag = typeof ACTIVITY_TAGS[number];

export interface MoodData {
  id: MoodType;
  label: string;
  color: string;
}
