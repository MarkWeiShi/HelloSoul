import { EMOTION_DISPLAY, type EmotionCode } from '../types/chat';
import type { CharacterId } from '../types/persona';

export interface StageMediaConfig {
  videoSrc: string;
  fallbackVideoSrc: string;
  label: string;
}

const BASE_MOOD_VIDEO_MAP: Record<string, string> = {
  trust: '/chat-videos/akari/Akari_trust.mp4',
  serenity: '/chat-videos/akari/Akari_serenity.mp4',
  contentment: '/chat-videos/akari/Akari_contentment.mp4',
  curiosity: '/chat-videos/akari/Akari_curiosity.mp4',
};

const EMOTION_TO_MOOD_MAP: Record<string, string> = {
  EMO_01: 'trust',
  EMO_02: 'contentment',
  EMO_03: 'trust',
  EMO_04: 'curiosity',
  EMO_05: 'serenity',
  EMO_06: 'curiosity',
  EMO_07: 'curiosity',
  EMO_08: 'curiosity',
  EMO_09: 'contentment',
  EMO_10: 'trust',
  EMO_11: 'serenity',
  EMO_12: 'serenity',
  EMO_13: 'contentment',
  EMO_14: 'curiosity',
};

const CHARACTER_DEFAULT_VIDEO: Record<string, string> = {
  akari: BASE_MOOD_VIDEO_MAP.trust,
  mina: BASE_MOOD_VIDEO_MAP.trust,
  sophie: BASE_MOOD_VIDEO_MAP.trust,
  carlos: BASE_MOOD_VIDEO_MAP.trust,
};

const FALLBACK_VIDEO_SRC = BASE_MOOD_VIDEO_MAP.trust;

const MOOD_LABEL_MAP: Record<string, string> = {
  trust: 'Trust',
  serenity: 'Serenity',
  contentment: 'Contentment',
  curiosity: 'Curiosity',
};

function normalizeEmotionCode(emotionCode?: EmotionCode | string): string {
  if (!emotionCode) return 'EMO_01';
  return String(emotionCode).trim().toUpperCase();
}

export function resolveStageMedia(
  characterId: CharacterId,
  emotionCode?: EmotionCode | string
): StageMediaConfig {
  const normalizedEmotion = normalizeEmotionCode(emotionCode);
  const moodKey = EMOTION_TO_MOOD_MAP[normalizedEmotion] || 'trust';

  const defaultVideoByCharacter =
    CHARACTER_DEFAULT_VIDEO[characterId] || FALLBACK_VIDEO_SRC;

  const mappedVideo = BASE_MOOD_VIDEO_MAP[moodKey];
  const videoSrc = mappedVideo || defaultVideoByCharacter;

  const emotionLabel =
    normalizedEmotion in EMOTION_DISPLAY
      ? EMOTION_DISPLAY[normalizedEmotion as EmotionCode].label
      : MOOD_LABEL_MAP[moodKey] || 'Connected';

  return {
    videoSrc,
    fallbackVideoSrc: defaultVideoByCharacter,
    label: emotionLabel,
  };
}

export const STAGE_MEDIA_MAPS = {
  BASE_MOOD_VIDEO_MAP,
  EMOTION_TO_MOOD_MAP,
  CHARACTER_DEFAULT_VIDEO,
};
