import { MoodType, ActivityTag } from './mood';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  activities: ActivityTag[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalFilter {
  searchText?: string;
  moods?: MoodType[];
  tags?: string[];
  activities?: ActivityTag[];
  startDate?: string;
  endDate?: string;
}
