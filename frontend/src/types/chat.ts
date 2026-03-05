// ===== Chat Types =====

export type MessageType =
  | 'text'
  | 'voice'
  | 'inner_voice'
  | 'lifestyle_post'
  | 'language_tip'
  | 'memory_recall'
  | 'proactive';

// ===== Emotion State Types (Module F) =====

export type EmotionCode =
  | 'EMO_01' // idle/content
  | 'EMO_02' // happy
  | 'EMO_03' // shy/moved
  | 'EMO_04' // attentive/listening
  | 'EMO_05' // worried/caring
  | 'EMO_06' // surprised
  | 'EMO_07' // playful/teasing
  | 'EMO_08' // thoughtful
  | 'EMO_09' // suppressed smile
  | 'EMO_10' // frustrated/pouting
  | 'EMO_11' // pre-tears
  | 'EMO_12' // sleepy/drowsy
  | 'EMO_13' // determined
  | 'EMO_14'; // daydreaming

export type GazeDirection = 'user' | 'away' | 'down';

export interface EmotionState {
  current: EmotionCode;
  endTransition?: EmotionCode;
  gazeDirection: GazeDirection;
}

// Emotion display metadata
export const EMOTION_DISPLAY: Record<EmotionCode, { label: string; emoji: string; color: string }> = {
  EMO_01: { label: 'Content', emoji: '☕', color: '#E8D5C4' },
  EMO_02: { label: 'Happy', emoji: '😊', color: '#FFD700' },
  EMO_03: { label: 'Shy', emoji: '🥺', color: '#FFB3C1' },
  EMO_04: { label: 'Listening', emoji: '👀', color: '#87CEEB' },
  EMO_05: { label: 'Caring', emoji: '💕', color: '#DDA0DD' },
  EMO_06: { label: 'Surprised', emoji: '😲', color: '#FFE4B5' },
  EMO_07: { label: 'Playful', emoji: '😏', color: '#98FB98' },
  EMO_08: { label: 'Thoughtful', emoji: '🤔', color: '#B0C4DE' },
  EMO_09: { label: 'Hiding smile', emoji: '🤭', color: '#FFC0CB' },
  EMO_10: { label: 'Pouting', emoji: '😤', color: '#FFA07A' },
  EMO_11: { label: 'Moved', emoji: '🥹', color: '#E6E6FA' },
  EMO_12: { label: 'Sleepy', emoji: '😴', color: '#778899' },
  EMO_13: { label: 'Determined', emoji: '✨', color: '#FF6347' },
  EMO_14: { label: 'Daydreaming', emoji: '💭', color: '#E0E0FF' },
};

export interface Message {
  id: string;
  type: MessageType;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
  characterId: string;

  // Emotion state (Module F)
  emotionState?: EmotionState;
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
  emotionState?: string;
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
  eveMessage: { text: string; emotionState: string };
  morningVoiceScript: { text: string; emotionState: string };
  openingDialogue: { text: string; emotionState: string };
  callGreeting: { text: string; emotionState: string };
  nightClosing: { text: string; emotionState: string };
}
