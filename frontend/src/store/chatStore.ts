import { create } from 'zustand';
import type { Message } from '../types/chat';

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  currentCharacterId: string | null;
  aiMessageCount: number;

  setCharacter: (characterId: string) => void;
  addMessage: (message: Message) => void;
  updateLastAiMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (delta: string) => void;
  revealInnerVoice: (messageId: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  streamingContent: '',
  currentCharacterId: null,
  aiMessageCount: 0,

  setCharacter: (characterId) =>
    set({ currentCharacterId: characterId, messages: [], aiMessageCount: 0 }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      aiMessageCount:
        message.role === 'ai'
          ? state.aiMessageCount + 1
          : state.aiMessageCount,
    })),

  updateLastAiMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const lastAi = messages.findLastIndex((m) => m.role === 'ai');
      if (lastAi !== -1) {
        messages[lastAi] = { ...messages[lastAi], content };
      }
      return { messages };
    }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  setStreamingContent: (content) => set({ streamingContent: content }),

  appendStreamingContent: (delta) =>
    set((state) => ({ streamingContent: state.streamingContent + delta })),

  revealInnerVoice: (messageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, innerVoiceRevealed: true } : m
      ),
    })),

  clearMessages: () =>
    set({ messages: [], streamingContent: '', aiMessageCount: 0 }),
}));
