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

export const EMOTION_KEYS = [
  ...POSITIVE_EMOTION_KEYS,
  ...NEGATIVE_EMOTION_KEYS,
] as const;

export type EmotionKey = (typeof EMOTION_KEYS)[number];
export type EmotionCluster = 'positive' | 'negative';
export type GazeDirection = 'user' | 'away' | 'down';

export interface EmotionMeta {
  labelZh: string;
  emoji: string;
  cluster: EmotionCluster;
}

export interface EmotionPayload {
  key: EmotionKey;
  endKey?: EmotionKey;
  gazeDirection: GazeDirection;
}

const EMOTION_META: Record<EmotionKey, EmotionMeta> = {
  joy: { labelZh: '喜悦', emoji: '😄', cluster: 'positive' },
  contentment: { labelZh: '满足', emoji: '☺️', cluster: 'positive' },
  amusement: { labelZh: '愉悦', emoji: '😆', cluster: 'positive' },
  pride: { labelZh: '骄傲', emoji: '😌', cluster: 'positive' },
  love: { labelZh: '爱', emoji: '❤️', cluster: 'positive' },
  gratitude: { labelZh: '感恩', emoji: '🙏', cluster: 'positive' },
  awe: { labelZh: '敬畏', emoji: '😮', cluster: 'positive' },
  inspiration: { labelZh: '灵感', emoji: '💡', cluster: 'positive' },
  serenity: { labelZh: '宁静', emoji: '🕊️', cluster: 'positive' },
  hope: { labelZh: '希望', emoji: '🌤️', cluster: 'positive' },
  relief: { labelZh: '释然', emoji: '😮‍💨', cluster: 'positive' },
  trust: { labelZh: '信任', emoji: '🤝', cluster: 'positive' },
  admiration: { labelZh: '钦佩', emoji: '✨', cluster: 'positive' },
  compassion: { labelZh: '同情', emoji: '💞', cluster: 'positive' },
  elevation: { labelZh: '升华', emoji: '🥹', cluster: 'positive' },
  enthusiasm: { labelZh: '热情', emoji: '🔥', cluster: 'positive' },
  playfulness: { labelZh: '俏皮', emoji: '😏', cluster: 'positive' },
  curiosity: { labelZh: '好奇', emoji: '🧐', cluster: 'positive' },
  interest: { labelZh: '兴趣', emoji: '👀', cluster: 'positive' },
  anticipation: { labelZh: '期待', emoji: '⏳', cluster: 'positive' },
  satisfaction: { labelZh: '满意', emoji: '✅', cluster: 'positive' },
  affection: { labelZh: '喜爱', emoji: '🥰', cluster: 'positive' },
  triumph: { labelZh: '胜利', emoji: '🏆', cluster: 'positive' },
  calm_confidence: { labelZh: '沉稳自信', emoji: '🧘', cluster: 'positive' },
  delight: { labelZh: '欣喜', emoji: '🌸', cluster: 'positive' },
  sadness: { labelZh: '悲伤', emoji: '😢', cluster: 'negative' },
  grief: { labelZh: '悲痛', emoji: '😭', cluster: 'negative' },
  disappointment: { labelZh: '失望', emoji: '😞', cluster: 'negative' },
  regret: { labelZh: '后悔', emoji: '🥀', cluster: 'negative' },
  shame: { labelZh: '羞耻', emoji: '🙈', cluster: 'negative' },
  guilt: { labelZh: '内疚', emoji: '😔', cluster: 'negative' },
  embarrassment: { labelZh: '尴尬', emoji: '😳', cluster: 'negative' },
  anxiety: { labelZh: '焦虑', emoji: '😰', cluster: 'negative' },
  fear: { labelZh: '恐惧', emoji: '😨', cluster: 'negative' },
  panic: { labelZh: '恐慌', emoji: '😱', cluster: 'negative' },
  worry: { labelZh: '担忧', emoji: '😟', cluster: 'negative' },
  frustration: { labelZh: '挫败', emoji: '😣', cluster: 'negative' },
  irritation: { labelZh: '烦躁', emoji: '😤', cluster: 'negative' },
  annoyance: { labelZh: '恼怒', emoji: '😒', cluster: 'negative' },
  anger: { labelZh: '愤怒', emoji: '😠', cluster: 'negative' },
  rage: { labelZh: '暴怒', emoji: '🤬', cluster: 'negative' },
  disgust: { labelZh: '厌恶', emoji: '🤢', cluster: 'negative' },
  contempt: { labelZh: '蔑视', emoji: '🫤', cluster: 'negative' },
  jealousy: { labelZh: '嫉妒', emoji: '😑', cluster: 'negative' },
  envy: { labelZh: '羡慕', emoji: '😶', cluster: 'negative' },
  distrust: { labelZh: '不信任', emoji: '🙅', cluster: 'negative' },
  suspicion: { labelZh: '怀疑', emoji: '🤨', cluster: 'negative' },
  confusion: { labelZh: '困惑', emoji: '😵', cluster: 'negative' },
  stress: { labelZh: '压力', emoji: '😖', cluster: 'negative' },
  exhaustion: { labelZh: '疲惫', emoji: '🥱', cluster: 'negative' },
};

const EMOTION_KEY_SET = new Set<string>(EMOTION_KEYS);

export const DEFAULT_EMOTION_KEY: EmotionKey = 'contentment';

export function getEmotionMeta(key: EmotionKey): EmotionMeta {
  return EMOTION_META[key];
}

export function isEmotionKey(value: string): value is EmotionKey {
  return normalizeEmotionKey(value) !== undefined;
}

export function normalizeEmotionKey(value?: string | null): EmotionKey | undefined {
  if (!value) return undefined;
  const normalized = String(value).trim().toLowerCase();
  if (!EMOTION_KEY_SET.has(normalized)) return undefined;
  return normalized as EmotionKey;
}

function parseTimestamp(value?: Date | number | null): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return undefined;
}

export function stabilizeEmotionKey(params: {
  previousKey?: string | null;
  previousAt?: Date | number | null;
  candidateKey?: string | null;
  cooldownMs?: number;
  nowMs?: number;
}): EmotionKey {
  const previous = normalizeEmotionKey(params.previousKey);
  const candidate = normalizeEmotionKey(params.candidateKey);

  if (!candidate) return previous || DEFAULT_EMOTION_KEY;
  if (!previous || previous === candidate) return candidate;

  if (EMOTION_META[previous].cluster === EMOTION_META[candidate].cluster) {
    return candidate;
  }

  const cooldownMs = params.cooldownMs ?? 45_000;
  const previousAtMs = parseTimestamp(params.previousAt);
  const nowMs = params.nowMs ?? Date.now();

  if (previousAtMs !== undefined && nowMs - previousAtMs < cooldownMs) {
    return previous;
  }

  return candidate;
}

const KEYWORD_HINTS: Array<{ key: EmotionKey; cues: string[] }> = [
  { key: 'gratitude', cues: ['thank', 'thanks', 'appreciate', 'grateful'] },
  { key: 'anxiety', cues: ['anxious', 'anxiety', 'nervous', 'uneasy'] },
  { key: 'panic', cues: ['panic', 'panicking', 'freaking out'] },
  { key: 'stress', cues: ['stress', 'stressed', 'overwhelmed', 'burnout'] },
  { key: 'sadness', cues: ['sad', 'down', 'upset', 'blue'] },
  { key: 'grief', cues: ['grief', 'mourning', 'loss'] },
  { key: 'anger', cues: ['angry', 'anger', 'mad'] },
  { key: 'rage', cues: ['furious', 'rage', 'outraged'] },
  { key: 'fear', cues: ['afraid', 'fear', 'scared'] },
  { key: 'worry', cues: ['worry', 'worried', 'concerned'] },
  { key: 'joy', cues: ['joy', 'happy', 'so happy', 'excited'] },
  { key: 'love', cues: ['love you', 'adore', 'affection'] },
  { key: 'curiosity', cues: ['curious', 'wonder', 'interested'] },
  { key: 'trust', cues: ['trust', 'rely on you', 'safe with you'] },
  { key: 'relief', cues: ['relieved', 'what a relief', 'finally okay'] },
  { key: 'hope', cues: ['hope', 'hopefully', 'wish'] },
];

export function inferEmotionKeyFromText(
  text: string,
  context?: { triggerType?: string }
): EmotionKey {
  const source = text.toLowerCase();

  for (const hint of KEYWORD_HINTS) {
    if (hint.cues.some((cue) => source.includes(cue))) {
      return hint.key;
    }
  }

  switch (context?.triggerType) {
    case 'birthday':
      return 'delight';
    case 'followup_care':
      return 'compassion';
    case 'miss_you':
      return 'affection';
    case 'seasonal':
      return 'anticipation';
    default:
      return DEFAULT_EMOTION_KEY;
  }
}
