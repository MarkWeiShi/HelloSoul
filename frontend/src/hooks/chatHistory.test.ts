import test from 'node:test';
import assert from 'node:assert/strict';
import type { Message } from '../types/chat';
import {
  mergeChatHistoryMessages,
  shouldLoadChatHistory,
} from './chatHistory';

function createMessage(overrides: Partial<Message> & Pick<Message, 'id'>): Message {
  const { id, ...rest } = overrides;
  return {
    id,
    type: 'text',
    role: 'ai',
    content: 'hello',
    timestamp: new Date('2026-03-12T10:00:00.000Z'),
    characterId: 'akari',
    ...rest,
  };
}

test('shouldLoadChatHistory skips reloading when the current character history is already hydrated', () => {
  const shouldLoad = shouldLoadChatHistory({
    historyHydrated: true,
    currentMessages: [createMessage({ id: 'ai_1' })],
  });

  assert.equal(shouldLoad, false);
});

test('mergeChatHistoryMessages preserves local message state and appends local-only messages', () => {
  const merged = mergeChatHistoryMessages({
    currentMessages: [
      createMessage({
        id: 'ai_1',
        innerVoiceRevealed: true,
        timestamp: new Date('2026-03-12T10:01:00.000Z'),
      }),
      createMessage({
        id: 'local_user_1',
        role: 'user',
        content: 'new local message',
        timestamp: new Date('2026-03-12T10:02:00.000Z'),
      }),
    ],
    historyMessages: [
      createMessage({
        id: 'user_0',
        role: 'user',
        content: 'older history',
        timestamp: new Date('2026-03-12T10:00:00.000Z'),
      }),
      createMessage({
        id: 'ai_1',
        innerVoiceRevealed: false,
        timestamp: new Date('2026-03-12T10:01:00.000Z'),
      }),
    ],
  });

  assert.equal(merged.length, 3);
  assert.equal(merged[1]?.id, 'ai_1');
  assert.equal(merged[1]?.innerVoiceRevealed, true);
  assert.equal(merged[2]?.id, 'local_user_1');
});
