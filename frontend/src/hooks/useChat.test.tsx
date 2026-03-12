import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useChat } from './useChat';
import { useChatStore } from '../store/chatStore';
import { useEmotionStore } from '../store/emotionStore';
import { usePersonaStore } from '../store/personaStore';
import type { ChatDonePayload } from '../types/chat';

const { apiGetChatHistory, streamChatMessage } = vi.hoisted(() => ({
  apiGetChatHistory: vi.fn(),
  streamChatMessage: vi.fn(),
}));

vi.mock('../api/chat', () => ({
  apiGetChatHistory,
  streamChatMessage,
}));

function buildDonePayload(): ChatDonePayload {
  return {
    messageId: 'msg_ai_1',
    reply: 'Hello there, back at you.',
    intimacy: {
      newScore: 16,
      newLevel: 1,
      levelChanged: true,
    },
    emotion: {
      key: 'trust',
      gazeDirection: 'user',
    },
    sceneId: 'apartment_day',
    innerVoice: null,
    memoryRecallHit: null,
    promptVersion: 'chat-v2-structured',
    warnings: [],
    traceId: 'trace_123',
  };
}

describe('useChat', () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      isStreaming: false,
      streamingContent: '',
      currentCharacterId: 'akari',
      historyHydrated: true,
      aiMessageCount: 0,
    });
    useEmotionStore.getState().reset();
    usePersonaStore.setState({
      selectedCharacterId: 'akari',
      relationships: {
        akari: {
          id: 'rel_akari',
          characterId: 'akari',
          nickname: null,
          intimacyScore: 15,
          intimacyLevel: 0,
          totalMessages: 0,
          totalDays: 1,
          startedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          prefs: {
            contactFreq: 'normal',
            teachingMode: 'organic',
            emotionalDepth: 'medium',
          },
        },
      },
    });
    apiGetChatHistory.mockReset();
    streamChatMessage.mockReset();
  });

  it('adds the optimistic user message and commits the streamed AI response', async () => {
    streamChatMessage.mockImplementation(
      async (
        _characterId: string,
        _content: string,
        _scenarioId: string,
        onDelta: (delta: string) => void
      ) => {
        onDelta('Hello');
        onDelta(' there');
        return buildDonePayload();
      }
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('akari', 'Hi Akari', 'first_chat');
    });

    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(2);
    expect(state.messages[0].role).toBe('user');
    expect(state.messages[0].content).toBe('Hi Akari');
    expect(state.messages[1].role).toBe('ai');
    expect(state.messages[1].content).toBe('Hello there, back at you.');
    expect(state.streamingContent).toBe('');
    expect(state.isStreaming).toBe(false);

    expect(useEmotionStore.getState().currentEmotion.key).toBe('trust');
    expect(usePersonaStore.getState().relationships.akari.intimacyLevel).toBe(1);
    expect(usePersonaStore.getState().relationships.akari.totalMessages).toBe(1);
  });

  it('ignores a late AI reply when the user switches to a different character', async () => {
    let resolveStream: ((payload: ChatDonePayload) => void) | null = null;
    streamChatMessage.mockImplementation(
      async (
        _characterId: string,
        _content: string,
        _scenarioId: string,
        onDelta: (delta: string) => void
      ) => {
        onDelta('Hello');
        return new Promise<ChatDonePayload>((resolve) => {
          resolveStream = resolve;
        });
      }
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      const pending = result.current.sendMessage('akari', 'Hi Akari', 'first_chat');
      useChatStore.getState().setCharacter('mina');
      resolveStream?.(buildDonePayload());
      await pending;
    });

    const state = useChatStore.getState();
    expect(state.currentCharacterId).toBe('mina');
    expect(state.messages).toHaveLength(0);
    expect(state.isStreaming).toBe(false);
  });
});
