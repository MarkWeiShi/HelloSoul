// ===== Persona / Character Types =====

export type CharacterId = 'akari' | 'mina' | 'sophie' | 'carlos';

export interface Character {
  id: CharacterId;
  name: string;
  nativeName: string;
  age: number;
  city: string;
  country: string;
  flag: string;
  color: string;
  language: string;
  tagline: string;
  bio: string[];
  personalityTraits: string[];
  portraitUrl: string;
  cityBackdropUrl: string;
  voiceId: string; // ElevenLabs voice ID
}

export interface IntimacyLevel {
  level: number;
  name: string;
  nameJa?: string;
  minScore: number;
  maxScore: number;
  unlocks: string[];
}

export const INTIMACY_LEVELS: IntimacyLevel[] = [
  {
    level: 0,
    name: 'New',
    nameJa: '初識',
    minScore: 0,
    maxScore: 15,
    unlocks: ['Basic text chat', 'Cultural tips'],
  },
  {
    level: 1,
    name: 'Warm',
    nameJa: '熟悉',
    minScore: 16,
    maxScore: 40,
    unlocks: ['Nickname from character', 'Daily greetings'],
  },
  {
    level: 2,
    name: 'Close',
    nameJa: '心動',
    minScore: 41,
    maxScore: 70,
    unlocks: [
      'Voice messages',
      'Inner voice bubbles',
      'Background ambience',
    ],
  },
  {
    level: 3,
    name: 'Intimate',
    nameJa: '親密',
    minScore: 71,
    maxScore: 100,
    unlocks: ['Bedtime stories', 'Deep inner voice', 'Real-time calls'],
  },
  {
    level: 4,
    name: 'Bonded',
    nameJa: '深愛',
    minScore: 101,
    maxScore: Infinity,
    unlocks: ['Full expression', 'Proactive memories', 'Exclusive content'],
  },
];

export interface RelationshipPrefs {
  contactFreq: 'low' | 'normal' | 'high';
  teachingMode: 'organic' | 'active' | 'none';
  emotionalDepth: 'light' | 'medium' | 'deep';
}

export interface Relationship {
  id: string;
  characterId: CharacterId;
  nickname: string | null;
  intimacyScore: number;
  intimacyLevel: number;
  totalMessages: number;
  totalDays: number;
  startedAt: string;
  lastActiveAt: string;
  prefs: RelationshipPrefs;
}

export const CHARACTERS: Character[] = [
  {
    id: 'akari',
    name: 'Akari',
    nativeName: 'あかり',
    age: 21,
    city: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    color: '#FF6B9D',
    language: 'ja',
    tagline: 'the girl who turns coffee into poetry',
    bio: [
      '☕ Works at a Shimokitazawa café',
      '📮 Collects vintage postcards',
      '🌧️ Loves the smell after rain',
    ],
    personalityTraits: ['Gentle & witty', 'Detail-oriented', 'Secretly competitive'],
    portraitUrl: '/characters/akari-portrait.jpg',
    cityBackdropUrl: '/characters/tokyo-night.jpg',
    voiceId: 'akari-voice-id',
  },
  {
    id: 'mina',
    name: 'Mina',
    nativeName: '민아',
    age: 24,
    city: 'Seoul',
    country: 'South Korea',
    flag: '🇰🇷',
    color: '#7B68EE',
    language: 'ko',
    tagline: 'designs by day, dreams by night',
    bio: [
      '🎨 Junior designer at an ad agency',
      '🚲 Weekend cyclist along Hangang',
      '🐱 Cat mom to 어묵 (Eomuk)',
    ],
    personalityTraits: ['Fiercely independent', 'Emotionally guarded', 'Playful when comfortable'],
    portraitUrl: '/characters/mina-portrait.jpg',
    cityBackdropUrl: '/characters/seoul-night.jpg',
    voiceId: 'mina-voice-id',
  },
  {
    id: 'sophie',
    name: 'Sophie',
    nativeName: 'Sophie',
    age: 26,
    city: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    color: '#D4AF37',
    language: 'fr',
    tagline: 'sees the world through paint and light',
    bio: [
      '🎨 Oil painting grad student at Beaux-Arts',
      '🥐 Same boulangerie every morning',
      '🏠 Lives in a Montmartre attic',
    ],
    personalityTraits: ['Passionate & philosophical', 'Romantically bold', 'Quietly stubborn'],
    portraitUrl: '/characters/sophie-portrait.jpg',
    cityBackdropUrl: '/characters/paris-night.jpg',
    voiceId: 'sophie-voice-id',
  },
  {
    id: 'carlos',
    name: 'Carlos',
    nativeName: 'Carlos',
    age: 27,
    city: 'Rio de Janeiro',
    country: 'Brazil',
    flag: '🇧🇷',
    color: '#00CED1',
    language: 'pt',
    tagline: 'chases waves and the perfect shot',
    bio: [
      '🏄 Surf instructor at Ipanema Beach',
      '📷 Freelance photographer',
      '🎵 Lives for samba and Bossa Nova',
    ],
    personalityTraits: ['Warm & effortless', 'Deeply optimistic', 'Surprisingly introspective'],
    portraitUrl: '/characters/carlos-portrait.jpg',
    cityBackdropUrl: '/characters/rio-night.jpg',
    voiceId: 'carlos-voice-id',
  },
];
