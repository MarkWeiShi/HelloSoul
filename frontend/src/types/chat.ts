// ===== Chat Types =====

export type MessageType =
  | 'text'
  | 'voice'
  | 'inner_voice'
  | 'lifestyle_post'
  | 'language_tip'
  | 'memory_recall'
  | 'proactive';

// ===== Emotion Types (50-key protocol) =====

export const POSITIVE_EMOTION_KEYS = [
  'joy',
  'contentment',
  'amusement',
  'pride',
  'love',
  'gratitude',
  'awe',
  'inspiration',
  'serenity',
  'hope',
  'relief',
  'trust',
  'admiration',
  'compassion',
  'elevation',
  'enthusiasm',
  'playfulness',
  'curiosity',
  'interest',
  'anticipation',
  'satisfaction',
  'affection',
  'triumph',
  'calm_confidence',
  'delight',
] as const;

export const NEGATIVE_EMOTION_KEYS = [
  'sadness',
  'grief',
  'disappointment',
  'regret',
  'shame',
  'guilt',
  'embarrassment',
  'anxiety',
  'fear',
  'panic',
  'worry',
  'frustration',
  'irritation',
  'annoyance',
  'anger',
  'rage',
  'disgust',
  'contempt',
  'jealousy',
  'envy',
  'distrust',
  'suspicion',
  'confusion',
  'stress',
  'exhaustion',
] as const;

export const EMOTION_KEYS = [...POSITIVE_EMOTION_KEYS, ...NEGATIVE_EMOTION_KEYS] as const;

export type EmotionKey = (typeof EMOTION_KEYS)[number];
export type EmotionCluster = 'positive' | 'negative';
export type GazeDirection = 'user' | 'away' | 'down';

export interface Emotion {
  key: EmotionKey;
  endKey?: EmotionKey;
  gazeDirection: GazeDirection;
}

export const DEFAULT_EMOTION_KEY: EmotionKey = 'contentment';

export const EMOTION_DISPLAY: Record<
  EmotionKey,
  { label: string; emoji: string; color: string; cluster: EmotionCluster }
> = {
  joy: { label: '喜悦', emoji: '😄', color: '#FFD15C', cluster: 'positive' },
  contentment: { label: '满足', emoji: '☺️', color: '#F7C873', cluster: 'positive' },
  amusement: { label: '愉悦', emoji: '😆', color: '#FFC972', cluster: 'positive' },
  pride: { label: '骄傲', emoji: '😌', color: '#F7B267', cluster: 'positive' },
  love: { label: '爱', emoji: '❤️', color: '#FF8FA3', cluster: 'positive' },
  gratitude: { label: '感恩', emoji: '🙏', color: '#F4D35E', cluster: 'positive' },
  awe: { label: '敬畏', emoji: '😮', color: '#A0C4FF', cluster: 'positive' },
  inspiration: { label: '灵感', emoji: '💡', color: '#8EECF5', cluster: 'positive' },
  serenity: { label: '宁静', emoji: '🕊️', color: '#B8E1DD', cluster: 'positive' },
  hope: { label: '希望', emoji: '🌤️', color: '#BDE0FE', cluster: 'positive' },
  relief: { label: '释然', emoji: '😮‍💨', color: '#B7E4C7', cluster: 'positive' },
  trust: { label: '信任', emoji: '🤝', color: '#9BF6FF', cluster: 'positive' },
  admiration: { label: '钦佩', emoji: '✨', color: '#FDE68A', cluster: 'positive' },
  compassion: { label: '同情', emoji: '💞', color: '#FFC8DD', cluster: 'positive' },
  elevation: { label: '升华', emoji: '🥹', color: '#D8B4FE', cluster: 'positive' },
  enthusiasm: { label: '热情', emoji: '🔥', color: '#FF9F1C', cluster: 'positive' },
  playfulness: { label: '俏皮', emoji: '😏', color: '#C8B6FF', cluster: 'positive' },
  curiosity: { label: '好奇', emoji: '🧐', color: '#A8DADC', cluster: 'positive' },
  interest: { label: '兴趣', emoji: '👀', color: '#90E0EF', cluster: 'positive' },
  anticipation: { label: '期待', emoji: '⏳', color: '#FFD166', cluster: 'positive' },
  satisfaction: { label: '满意', emoji: '✅', color: '#95D5B2', cluster: 'positive' },
  affection: { label: '喜爱', emoji: '🥰', color: '#FFAFCC', cluster: 'positive' },
  triumph: { label: '胜利', emoji: '🏆', color: '#F9C74F', cluster: 'positive' },
  calm_confidence: { label: '沉稳自信', emoji: '🧘', color: '#A9DEF9', cluster: 'positive' },
  delight: { label: '欣喜', emoji: '🌸', color: '#FFCAD4', cluster: 'positive' },
  sadness: { label: '悲伤', emoji: '😢', color: '#8D99AE', cluster: 'negative' },
  grief: { label: '悲痛', emoji: '😭', color: '#7B879D', cluster: 'negative' },
  disappointment: { label: '失望', emoji: '😞', color: '#A0AEC0', cluster: 'negative' },
  regret: { label: '后悔', emoji: '🥀', color: '#94A3B8', cluster: 'negative' },
  shame: { label: '羞耻', emoji: '🙈', color: '#B0A8B9', cluster: 'negative' },
  guilt: { label: '内疚', emoji: '😔', color: '#A7A9BE', cluster: 'negative' },
  embarrassment: { label: '尴尬', emoji: '😳', color: '#C3B1C2', cluster: 'negative' },
  anxiety: { label: '焦虑', emoji: '😰', color: '#8F9BB3', cluster: 'negative' },
  fear: { label: '恐惧', emoji: '😨', color: '#7F8EA3', cluster: 'negative' },
  panic: { label: '恐慌', emoji: '😱', color: '#6B7280', cluster: 'negative' },
  worry: { label: '担忧', emoji: '😟', color: '#93A1B2', cluster: 'negative' },
  frustration: { label: '挫败', emoji: '😣', color: '#9CA3AF', cluster: 'negative' },
  irritation: { label: '烦躁', emoji: '😤', color: '#A8A29E', cluster: 'negative' },
  annoyance: { label: '恼怒', emoji: '😒', color: '#B0B7C3', cluster: 'negative' },
  anger: { label: '愤怒', emoji: '😠', color: '#F28482', cluster: 'negative' },
  rage: { label: '暴怒', emoji: '🤬', color: '#E63946', cluster: 'negative' },
  disgust: { label: '厌恶', emoji: '🤢', color: '#84A98C', cluster: 'negative' },
  contempt: { label: '蔑视', emoji: '🫤', color: '#8E9AAF', cluster: 'negative' },
  jealousy: { label: '嫉妒', emoji: '😑', color: '#A39BC8', cluster: 'negative' },
  envy: { label: '羡慕', emoji: '😶', color: '#B0B6D0', cluster: 'negative' },
  distrust: { label: '不信任', emoji: '🙅', color: '#7F90A6', cluster: 'negative' },
  suspicion: { label: '怀疑', emoji: '🤨', color: '#8796AB', cluster: 'negative' },
  confusion: { label: '困惑', emoji: '😵', color: '#9AA6B2', cluster: 'negative' },
  stress: { label: '压力', emoji: '😖', color: '#818AA3', cluster: 'negative' },
  exhaustion: { label: '疲惫', emoji: '🥱', color: '#6C7A89', cluster: 'negative' },
};

export function normalizeEmotionKey(value?: string): EmotionKey {
  const normalized = String(value || '').trim().toLowerCase() as EmotionKey;
  if ((EMOTION_KEYS as readonly string[]).includes(normalized)) {
    return normalized;
  }
  return DEFAULT_EMOTION_KEY;
}

export interface Message {
  id: string;
  type: MessageType;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
  characterId: string;

  // Emotion state (50-key protocol)
  emotion?: Emotion;
  sceneId?: string;

  // Voice fields
  audioUrl?: string;
  transcription?: string;
  translation?: string;
  sceneImageUrl?: string;

  // Inner voice fields
  innerVoiceText?: string;
  innerVoiceLanguage?: string;
  innerVoiceTranslation?: string;
  innerVoiceAudioUrl?: string;
  hasInnerVoice?: boolean;
  innerVoiceRevealed?: boolean;

  // Feed post fields
  feedPost?: {
    imageUrl: string;
    caption: string;
    likeCount: number;
    postId: string;
  };

  // Memory recall fields
  memoryRef?: {
    date: Date;
    originalContext: string;
  };

  relationshipProgress?: {
    newLevel: number;
    label: string;
  };

  // Language tip fields
  culturalTip?: {
    native: string;
    translation: string;
    example: string;
  };
}

export interface ChatSession {
  id: string;
  characterId: string;
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
}

// ===== Proactive Message Types (Module H) =====

export type ProactiveTriggerType =
  | 'thought_of_you'
  | 'weather_share'
  | 'followup_care'
  | 'miss_you'
  | 'birthday'
  | 'seasonal';

export interface ProactiveMessage {
  id: string;
  characterId: string;
  triggerType: ProactiveTriggerType;
  content: string;
  emotionKey?: EmotionKey;
  scheduledAt: string;
  sentAt: string | null;
  readAt: string | null;
  repliedAt: string | null;
}

// ===== Deep Profile Types (Module I) =====

export interface DeepProfileField {
  id: string;
  fieldPath: string;
  value: string;
  confidence: number;
  emotionalWeight: number;
  isVulnerable: boolean;
  createdAt: string;
}

export interface DeepProfile {
  characterId: string;
  lastUpdated: string | null;
  sections: {
    aboutYourLife: DeepProfileField[];
    thingsNoticed: DeepProfileField[];
    emotionalAnchors: DeepProfileField[];
    growth: DeepProfileField[];
  };
  totalFields: number;
}

// ===== Reflection Question Types (Module I) =====

export interface ReflectionQuestion {
  id: string;
  characterId: string;
  question: string;
  openingLine: string;
  answeredAt: string | null;
  userAnswer: string | null;
}

// ===== Growth Report Types =====

export interface GrowthReport {
  id: string;
  characterId: string;
  month: string;
  sections: {
    together: string;
    learned: string;
    noticed: string;
    personal: string;
  };
  highlightLine: string;
}

// ===== Birthday Types (Module H) =====

export interface BirthdayContent {
  eveMessage: { text: string; emotionKey: EmotionKey };
  morningVoiceScript: { text: string; emotionKey: EmotionKey };
  openingDialogue: { text: string; emotionKey: EmotionKey };
  callGreeting: { text: string; emotionKey: EmotionKey };
  nightClosing: { text: string; emotionKey: EmotionKey };
}

export interface ChatDonePayload {
  messageId: string;
  reply: string;
  intimacy: {
    newScore: number;
    newLevel: number;
    levelChanged: boolean;
  };
  emotion?: Emotion;
  sceneId?: string;
  innerVoice: {
    text: string;
    language: string;
    translation: string;
    audioUrl?: string;
  } | null;
  memoryRecallHit: { content: string; date: string } | null;
  promptVersion: string;
  warnings: string[];
  traceId: string;
}

export interface ChatHistoryMessage {
  id: string;
  type: MessageType;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
  characterId: string;
  emotion?: Emotion;
  sceneId?: string;
  innerVoiceText?: string;
  innerVoiceLanguage?: string;
  innerVoiceTranslation?: string;
  innerVoiceAudioUrl?: string;
  hasInnerVoice?: boolean;
  memoryRef?: {
    date: string;
    originalContext: string;
  };
}
