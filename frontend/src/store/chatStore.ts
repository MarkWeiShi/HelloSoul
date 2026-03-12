import { create } from 'zustand';
import type { Message } from '../types/chat';

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  currentCharacterId: string | null;
  historyHydrated: boolean;
  aiMessageCount: number;

  setCharacter: (characterId: string) => void;
  setMessages: (messages: Message[]) => void;
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
  historyHydrated: false,
  aiMessageCount: 0,

  setCharacter: (characterId) =>
    set((state) => {
      if (state.currentCharacterId === characterId) {
        return state;
      }

      return {
        currentCharacterId: characterId,
        messages: [],
        isStreaming: false,
        streamingContent: '',
        historyHydrated: false,
        aiMessageCount: 0,
      };
    }),

  setMessages: (messages) =>
    set({
      messages,
      historyHydrated: true,
      aiMessageCount: messages.filter((message) => message.role === 'ai').length,
    }),

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
    set({
      messages: [],
      isStreaming: false,
      streamingContent: '',
      historyHydrated: false,
      aiMessageCount: 0,
    }),
}));
