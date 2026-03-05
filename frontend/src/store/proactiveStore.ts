import { create } from 'zustand';
import type { ProactiveMessage } from '../types/chat';

interface ProactiveStore {
  pendingMessages: ProactiveMessage[];
  showBanner: boolean;
  currentBannerMessage: ProactiveMessage | null;

  setPendingMessages: (messages: ProactiveMessage[]) => void;
  dismissBanner: () => void;
  showNextBanner: () => void;
  removeMessage: (id: string) => void;
}

export const useProactiveStore = create<ProactiveStore>((set, get) => ({
  pendingMessages: [],
  showBanner: false,
  currentBannerMessage: null,

  setPendingMessages: (messages) => {
    set({
      pendingMessages: messages,
      currentBannerMessage: messages[0] || null,
      showBanner: messages.length > 0,
    });
  },

  dismissBanner: () => set({ showBanner: false, currentBannerMessage: null }),

  showNextBanner: () => {
    const { pendingMessages, currentBannerMessage } = get();
    const currentIdx = pendingMessages.findIndex(
      (m) => m.id === currentBannerMessage?.id
    );
    const next = pendingMessages[currentIdx + 1] || null;
    set({
      currentBannerMessage: next,
      showBanner: !!next,
    });
  },

  removeMessage: (id) =>
    set((state) => ({
      pendingMessages: state.pendingMessages.filter((m) => m.id !== id),
    })),
}));
