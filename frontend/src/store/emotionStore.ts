import { create } from 'zustand';
import type { Emotion, EmotionKey } from '../types/chat';
import { DEFAULT_EMOTION_KEY } from '../types/chat';

interface EmotionStore {
  currentEmotion: Emotion;
  currentSceneId: string | null;
  emotionHistory: { emotionKey: EmotionKey; timestamp: number }[];

  setEmotion: (emotion: Emotion) => void;
  setScene: (sceneId: string | null) => void;
  reset: () => void;
}

const DEFAULT_EMOTION: Emotion = {
  key: DEFAULT_EMOTION_KEY,
  gazeDirection: 'user',
};

export const useEmotionStore = create<EmotionStore>((set) => ({
  currentEmotion: DEFAULT_EMOTION,
  currentSceneId: null,
  emotionHistory: [],

  setEmotion: (emotion) =>
    set((state) => ({
      currentEmotion: emotion,
      emotionHistory: [
        ...state.emotionHistory.slice(-20), // Keep last 20
        { emotionKey: emotion.key, timestamp: Date.now() },
      ],
    })),

  setScene: (sceneId) => set({ currentSceneId: sceneId }),

  reset: () =>
    set({
      currentEmotion: DEFAULT_EMOTION,
      currentSceneId: null,
      emotionHistory: [],
    }),
}));
