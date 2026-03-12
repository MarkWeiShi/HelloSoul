import {
  DEFAULT_EMOTION_KEY,
  normalizeEmotionKey,
  type EmotionPayload,
  type GazeDirection,
} from './emotionEngine';

export const CHAT_PROMPT_VERSION = 'chat-v2-structured';

export interface MemoryRecallHit {
  content: string;
  date: Date;
}

export interface InnerVoicePayload {
  text: string;
  language: string;
  translation: string;
  audioUrl?: string;
}

export interface ChatDonePayload {
  messageId: string;
  reply: string;
  intimacy: { newScore: number; newLevel: number; levelChanged: boolean };
  emotion?: EmotionPayload;
  sceneId?: string;
  innerVoice: InnerVoicePayload | null;
  memoryRecallHit: { content: string; date: string } | null;
  promptVersion: string;
  warnings: string[];
  traceId: string;
}

export interface StoredChatMessageLike {
  id: string;
  role: string;
  type: string;
  content: string;
  createdAt: Date;
  emotionKey?: string | null;
  emotionEndKey?: string | null;
  gazeDirection?: string | null;
  sceneId?: string | null;
  metadata?: string | null;
  characterId?: string;
}

export interface ClientChatMessage {
  id: string;
  type: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
  characterId: string;
  emotion?: EmotionPayload;
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

export interface AutomaticMilestoneRecord {
  type: string;
  title: string;
  description: string;
  intimacyAtTime: number;
}

export interface AutomaticJournalEntryRecord {
  entryType: 'first_meeting' | 'milestone' | 'language_win' | 'emotional' | 'lifestyle';
  title: string;
  content: Record<string, unknown>;
  stickerIds: string[];
}

export interface StoredJournalEntryLike {
  id: string;
  characterId: string;
  entryType: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  stickerIds?: string | null;
  isShared: boolean;
  shareImageUrl?: string | null;
  createdAt: Date;
}

function normalizeMetadata(raw?: string | null): Record<string, any> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeStructuredJson(raw?: string | null): Record<string, any> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeStringArray(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function normalizeGazeDirection(value?: string | null): GazeDirection {
  if (value === 'away' || value === 'down') return value;
  return 'user';
}

export function buildChatDonePayload(params: {
  messageId: string;
  reply: string;
  intimacy: { newScore: number; newLevel: number; levelChanged: boolean };
  emotion?: EmotionPayload;
  sceneId?: string;
  innerVoice: InnerVoicePayload | null;
  memoryRecallHit: MemoryRecallHit | null;
  warnings?: string[];
  traceId: string;
}): ChatDonePayload {
  return {
    messageId: params.messageId,
    reply: params.reply,
    intimacy: params.intimacy,
    emotion: params.emotion,
    sceneId: params.sceneId,
    innerVoice: params.innerVoice,
    memoryRecallHit: params.memoryRecallHit
      ? {
          content: params.memoryRecallHit.content,
          date: params.memoryRecallHit.date.toISOString(),
        }
      : null,
    promptVersion: CHAT_PROMPT_VERSION,
    warnings: params.warnings || [],
    traceId: params.traceId,
  };
}

export function mapStoredMessageToClientMessage(
  message: StoredChatMessageLike
): ClientChatMessage {
  const metadata = normalizeMetadata(message.metadata);
  const emotionKey = normalizeEmotionKey(message.emotionKey) || undefined;
  const emotionEndKey = normalizeEmotionKey(message.emotionEndKey) || undefined;
  const memoryRecallHit = metadata.memoryRecallHit;
  const innerVoice = metadata.innerVoice;

  return {
    id: message.id,
    type: message.type || 'text',
    role: message.role === 'user' ? 'user' : 'ai',
    content: metadata.reply || message.content,
    timestamp: message.createdAt.toISOString(),
    characterId: message.characterId || '',
    ...(emotionKey
      ? {
          emotion: {
            key: emotionKey,
            ...(emotionEndKey ? { endKey: emotionEndKey } : {}),
            gazeDirection: normalizeGazeDirection(message.gazeDirection),
          },
        }
      : {}),
    ...(message.sceneId ? { sceneId: message.sceneId } : {}),
    ...(innerVoice
      ? {
          hasInnerVoice: true,
          innerVoiceText: innerVoice.text,
          innerVoiceLanguage: innerVoice.language,
          innerVoiceTranslation: innerVoice.translation,
          innerVoiceAudioUrl: innerVoice.audioUrl,
        }
      : {}),
    ...(memoryRecallHit
      ? {
          memoryRef: {
            date: memoryRecallHit.date,
            originalContext: memoryRecallHit.content,
          },
        }
      : {}),
  };
}

export function mapStoredJournalEntryToClientEntry(
  entry: StoredJournalEntryLike
): {
  id: string;
  characterId: string;
  entryType: 'first_meeting' | 'milestone' | 'language_win' | 'emotional' | 'lifestyle';
  title: string;
  content: Record<string, any>;
  imageUrl?: string;
  stickerIds: string[];
  isShared: boolean;
  shareImageUrl?: string;
  createdAt: string;
} {
  const allowedEntryType = new Set([
    'first_meeting',
    'milestone',
    'language_win',
    'emotional',
    'lifestyle',
  ]);

  return {
    id: entry.id,
    characterId: entry.characterId,
    entryType: allowedEntryType.has(entry.entryType)
      ? (entry.entryType as 'first_meeting' | 'milestone' | 'language_win' | 'emotional' | 'lifestyle')
      : 'milestone',
    title: entry.title,
    content: normalizeStructuredJson(entry.content),
    ...(entry.imageUrl ? { imageUrl: entry.imageUrl } : {}),
    stickerIds: normalizeStringArray(entry.stickerIds),
    isShared: entry.isShared,
    ...(entry.shareImageUrl ? { shareImageUrl: entry.shareImageUrl } : {}),
    createdAt: entry.createdAt.toISOString(),
  };
}

const INTIMACY_LEVEL_LABELS: Record<number, string> = {
  0: 'New',
  1: 'Warm',
  2: 'Close',
  3: 'Intimate',
  4: 'Bonded',
};

export function deriveAutomaticChatArtifacts(params: {
  characterId: string;
  totalMessagesBefore: number;
  intimacyBefore: { score: number; level: number };
  intimacyAfter: { score: number; level: number; levelChanged: boolean };
  latestReply: string;
}): {
  milestones: AutomaticMilestoneRecord[];
  journalEntries: AutomaticJournalEntryRecord[];
} {
  const milestones: AutomaticMilestoneRecord[] = [];
  const journalEntries: AutomaticJournalEntryRecord[] = [];

  if (params.totalMessagesBefore === 0) {
    milestones.push({
      type: 'first_chat',
      title: 'First Chat',
      description: 'Your first private conversation together began.',
      intimacyAtTime: params.intimacyAfter.score,
    });
    journalEntries.push({
      entryType: 'first_meeting',
      title: 'First conversation',
      content: {
        excerpt: params.latestReply,
        characterMood: DEFAULT_EMOTION_KEY,
      },
      stickerIds: ['first_chat'],
    });
  }

  if (params.intimacyAfter.levelChanged) {
    const levelName = INTIMACY_LEVEL_LABELS[params.intimacyAfter.level] || 'Closer';
    milestones.push({
      type: `level_${params.intimacyAfter.level}`,
      title: `${levelName} reached`,
      description: `Your relationship deepened into ${levelName}.`,
      intimacyAtTime: params.intimacyAfter.score,
    });
    journalEntries.push({
      entryType: 'milestone',
      title: `${levelName} reached`,
      content: {
        excerpt: params.latestReply,
        intimacyLevel: params.intimacyAfter.level,
      },
      stickerIds: [`level_${params.intimacyAfter.level}`],
    });
  }

  return { milestones, journalEntries };
}
