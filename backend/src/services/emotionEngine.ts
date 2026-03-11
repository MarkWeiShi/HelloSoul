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
  joy: { labelZh: '鍠滄偊', emoji: '馃槃', cluster: 'positive' },
  contentment: { labelZh: '婊¤冻', emoji: '鈽猴笍', cluster: 'positive' },
  amusement: { labelZh: '鎰夋偊', emoji: '馃槅', cluster: 'positive' },
  pride: { labelZh: '楠勫偛', emoji: '馃槍', cluster: 'positive' },
  love: { labelZh: '鐖?, emoji: '鉂わ笍', cluster: 'positive' },
  gratitude: { labelZh: '鎰熸仼', emoji: '馃檹', cluster: 'positive' },
  awe: { labelZh: '鏁晱', emoji: '馃槷', cluster: 'positive' },
  inspiration: { labelZh: '鐏垫劅', emoji: '馃挕', cluster: 'positive' },
  serenity: { labelZh: '瀹侀潤', emoji: '馃晩锔?, cluster: 'positive' },
  hope: { labelZh: '甯屾湜', emoji: '馃尋锔?, cluster: 'positive' },
  relief: { labelZh: '閲婄劧', emoji: '馃槷鈥嶐煉?, cluster: 'positive' },
  trust: { labelZh: '淇′换', emoji: '馃', cluster: 'positive' },
  admiration: { labelZh: '閽︿僵', emoji: '鉁?, cluster: 'positive' },
  compassion: { labelZh: '鍚屾儏', emoji: '馃挒', cluster: 'positive' },
  elevation: { labelZh: '鍗囧崕', emoji: '馃ス', cluster: 'positive' },
  enthusiasm: { labelZh: '鐑儏', emoji: '馃敟', cluster: 'positive' },
  playfulness: { labelZh: '淇忕毊', emoji: '馃槒', cluster: 'positive' },
  curiosity: { labelZh: '濂藉', emoji: '馃', cluster: 'positive' },
  interest: { labelZh: '鍏磋叮', emoji: '馃憖', cluster: 'positive' },
  anticipation: { labelZh: '鏈熷緟', emoji: '鈴?, cluster: 'positive' },
  satisfaction: { labelZh: '婊℃剰', emoji: '鉁?, cluster: 'positive' },
  affection: { labelZh: '鍠滅埍', emoji: '馃グ', cluster: 'positive' },
  triumph: { labelZh: '鑳滃埄', emoji: '馃弳', cluster: 'positive' },
  calm_confidence: { labelZh: '娌夌ǔ鑷俊', emoji: '馃', cluster: 'positive' },
  delight: { labelZh: '娆ｅ枩', emoji: '馃尭', cluster: 'positive' },
  sadness: { labelZh: '鎮蹭激', emoji: '馃槩', cluster: 'negative' },
  grief: { labelZh: '鎮茬棝', emoji: '馃槶', cluster: 'negative' },
  disappointment: { labelZh: '澶辨湜', emoji: '馃槥', cluster: 'negative' },
  regret: { labelZh: '鍚庢倲', emoji: '馃', cluster: 'negative' },
  shame: { labelZh: '缇炶€?, emoji: '馃檲', cluster: 'negative' },
  guilt: { labelZh: '鍐呯枤', emoji: '馃様', cluster: 'negative' },
  embarrassment: { labelZh: '灏村艾', emoji: '馃槼', cluster: 'negative' },
  anxiety: { labelZh: '鐒﹁檻', emoji: '馃槹', cluster: 'negative' },
  fear: { labelZh: '鎭愭儳', emoji: '馃槰', cluster: 'negative' },
  panic: { labelZh: '鎭愭厡', emoji: '馃槺', cluster: 'negative' },
  worry: { labelZh: '鎷呭咖', emoji: '馃槦', cluster: 'negative' },
  frustration: { labelZh: '鎸触', emoji: '馃槪', cluster: 'negative' },
  irritation: { labelZh: '鐑﹁簛', emoji: '馃槫', cluster: 'negative' },
  annoyance: { labelZh: '鎭兼€?, emoji: '馃槖', cluster: 'negative' },
  anger: { labelZh: '鎰ゆ€?, emoji: '馃槧', cluster: 'negative' },
  rage: { labelZh: '鏆存€?, emoji: '馃が', cluster: 'negative' },
  disgust: { labelZh: '鍘屾伓', emoji: '馃あ', cluster: 'negative' },
  contempt: { labelZh: '钄戣', emoji: '馃', cluster: 'negative' },
  jealousy: { labelZh: '瀚夊', emoji: '馃槕', cluster: 'negative' },
  envy: { labelZh: '缇℃厱', emoji: '馃樁', cluster: 'negative' },
  distrust: { labelZh: '涓嶄俊浠?, emoji: '馃檯', cluster: 'negative' },
  suspicion: { labelZh: '鎬€鐤?, emoji: '馃え', cluster: 'negative' },
  confusion: { labelZh: '鍥版儜', emoji: '馃樀', cluster: 'negative' },
  stress: { labelZh: '鍘嬪姏', emoji: '馃槚', cluster: 'negative' },
  exhaustion: { labelZh: '鐤叉儷', emoji: '馃ケ', cluster: 'negative' },
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
  defaultKey?: string | null;
}): EmotionKey {
  const previous = normalizeEmotionKey(params.previousKey);
  const candidate = normalizeEmotionKey(params.candidateKey);
  const defaultKey = normalizeEmotionKey(params.defaultKey) || DEFAULT_EMOTION_KEY;

  if (!candidate) return previous || defaultKey;
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


