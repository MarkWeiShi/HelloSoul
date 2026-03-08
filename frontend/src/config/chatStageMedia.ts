import {
  DEFAULT_EMOTION_KEY,
  EMOTION_DISPLAY,
  type EmotionKey,
  normalizeEmotionKey,
} from '../types/chat';
import type { CharacterId } from '../types/persona';

export interface StageMediaConfig {
  videoSrc: string;
  fallbackVideoSrc: string;
  label: string;
}

const CHARACTER_NEUTRAL_VIDEO: Record<CharacterId, string> = {
  akari: '/chat-videos/akari/Akari_contentment.mp4',
  // Other characters do not have 50-pack assets yet.
  mina: '/chat-videos/akari/Akari_contentment.mp4',
  sophie: '/chat-videos/akari/Akari_contentment.mp4',
  carlos: '/chat-videos/akari/Akari_contentment.mp4',
};

const CHARACTER_VIDEO_PREFIX: Record<CharacterId, string | null> = {
  akari: '/chat-videos/akari/Akari_',
  mina: null,
  sophie: null,
  carlos: null,
};

export function resolveStageMedia(
  characterId: CharacterId,
  emotionKey?: EmotionKey | string
): StageMediaConfig {
  const normalizedKey = normalizeEmotionKey(String(emotionKey || DEFAULT_EMOTION_KEY));
  const neutralVideo = CHARACTER_NEUTRAL_VIDEO[characterId] || CHARACTER_NEUTRAL_VIDEO.akari;
  const prefix = CHARACTER_VIDEO_PREFIX[characterId];

  const videoSrc = prefix ? `${prefix}${normalizedKey}.mp4` : neutralVideo;
  const label = EMOTION_DISPLAY[normalizedKey]?.label || EMOTION_DISPLAY[DEFAULT_EMOTION_KEY].label;

  return {
    videoSrc,
    fallbackVideoSrc: neutralVideo,
    label,
  };
}

export const STAGE_MEDIA_MAPS = {
  CHARACTER_NEUTRAL_VIDEO,
  CHARACTER_VIDEO_PREFIX,
};
