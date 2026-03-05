// ===== Memory Types =====

export interface MemorySummary {
  relationshipId: string;
  characterId: string;
  summary: string;
  keyMemories: MemoryEntry[];
  vulnerableMemories: MemoryEntry[];
  milestones: MilestoneEntry[];
}

export interface MemoryEntry {
  id: string;
  type: string;
  content: string;
  priority: string;
  emotionScore: number;
  isVulnerable: boolean;
  createdAt: string;
}

export interface MilestoneEntry {
  id: string;
  type: string;
  title: string;
  description: string;
  intimacyAtTime: number;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  characterId: string;
  entryType: 'first_meeting' | 'milestone' | 'language_win' | 'emotional' | 'lifestyle';
  title: string;
  content: JournalContent;
  imageUrl?: string;
  stickerIds: string[];
  isShared: boolean;
  shareImageUrl?: string;
  createdAt: string;
}

export interface JournalContent {
  excerpt?: string;
  nativeText?: string;
  translation?: string;
  emotionalIntensity?: number;
  weather?: string;
  characterMood?: string;
}

export interface VocabSticker {
  word: string;
  language: string;
  meaning: string;
  learnedAt: string;
  characterId: string;
}

export interface MonthlyReport {
  month: string;
  wordsLearned: number;
  topTopics: string[];
  milestones: MilestoneEntry[];
  totalMessages: number;
  voiceMessages: number;
}
