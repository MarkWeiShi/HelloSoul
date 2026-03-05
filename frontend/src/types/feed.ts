// ===== Feed Types =====

export type FeedPostType =
  | 'life_moment'
  | 'cultural_question'
  | 'language_challenge'
  | 'milestone';

export type PostMood =
  | 'cozy'
  | 'dreamy'
  | 'energetic'
  | 'reflective'
  | 'playful'
  | 'warm'
  | 'moody'
  | 'golden';

export interface LanguageTip {
  word: string;
  pronunciation: string;
  meaning: string;
  usage: string;
}

export interface FeedPost {
  id: string;
  characterId: string;
  type: FeedPostType;
  caption: string;
  nativePhrase?: string;
  nativeReading?: string | null;
  translation?: string;
  imageUrl?: string;
  imageDescription?: string;
  culturalFact?: string;
  culturalNote?: string;
  engagementHook?: string | null;
  mood?: PostMood;
  locationTag?: string;
  timeOfDay?: string;
  languageTip?: LanguageTip | null;
  characterHandle?: string | null;
  characterDisplayName?: string | null;
  snsInspiredBy?: string[];
  publishedAt: string;
  interactionCount: number;
  userLiked: boolean;
  userReplied: boolean;
  userSaved: boolean;
  aiFollowUp?: string;

  // Language challenge specific
  challengeOptions?: string[];
  correctAnswer?: number;
}

export interface FeedStory {
  characterId: string;
  imageUrl: string;
  caption: string;
  nativeText: string;
  isNew: boolean;
  expiresAt: string;
}

export interface FeedInteraction {
  postId: string;
  type: 'like' | 'reply' | 'save';
  replyText?: string;
}

export interface SnsAccount {
  platform: string;
  handle: string;
  url: string;
  description: string;
}

export interface SnsProfile {
  characterId: string;
  handle: string;
  displayName: string;
  aesthetic: string;
  snsAccounts: SnsAccount[];
  contentPillars: string[];
}
