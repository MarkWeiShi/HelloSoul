import { create } from 'zustand';
import type { EmotionState, EmotionCode } from '../types/chat';

interface EmotionStore {
  currentEmotion: EmotionState;
  currentSceneId: string | null;
  emotionHistory: { emotion: EmotionCode; timestamp: number }[];

  setEmotion: (emotion: EmotionState) => void;
  setScene: (sceneId: string | null) => void;
  reset: () => void;
}

const DEFAULT_EMOTION: EmotionState = {
  current: 'EMO_01',
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
        { emotion: emotion.current, timestamp: Date.now() },
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
