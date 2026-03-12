import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAT_PROMPT_VERSION,
  buildChatDonePayload,
  deriveAutomaticChatArtifacts,
  mapStoredJournalEntryToClientEntry,
  mapStoredMessageToClientMessage,
} from './chatExperienceService';

test('buildChatDonePayload returns the stable chat schema', () => {
  const payload = buildChatDonePayload({
    messageId: 'msg_1',
    reply: 'I remember that about you.',
    intimacy: { newScore: 12, newLevel: 1, levelChanged: false },
    emotion: { key: 'trust', gazeDirection: 'user' },
    sceneId: 'apartment_night',
    innerVoice: {
      text: '覚えていたい。',
      language: 'ja',
      translation: 'I want to remember this.',
    },
    memoryRecallHit: {
      content: 'User loves rainy cafes.',
      date: new Date('2026-03-01T00:00:00.000Z'),
    },
    warnings: ['deep_profile_skipped'],
    traceId: 'trace_123',
  });

  assert.equal(payload.promptVersion, CHAT_PROMPT_VERSION);
  assert.equal(payload.reply, 'I remember that about you.');
  assert.equal(payload.memoryRecallHit?.content, 'User loves rainy cafes.');
  assert.deepEqual(payload.warnings, ['deep_profile_skipped']);
});

test('mapStoredMessageToClientMessage restores AI metadata for chat history', () => {
  const message = mapStoredMessageToClientMessage({
    id: 'ai_1',
    role: 'ai',
    type: 'text',
    content: 'Saved reply',
    createdAt: new Date('2026-03-12T10:00:00.000Z'),
    emotionKey: 'gratitude',
    emotionEndKey: 'joy',
    gazeDirection: 'away',
    sceneId: 'apartment_day',
    metadata: JSON.stringify({
      innerVoice: {
        text: 'ほんとに嬉しい。',
        language: 'ja',
        translation: 'I am really happy.',
      },
      memoryRecallHit: {
        content: 'User likes bookstores.',
        date: '2026-03-10T00:00:00.000Z',
      },
    }),
  });

  assert.equal(message.role, 'ai');
  assert.equal(message.emotion?.key, 'gratitude');
  assert.equal(message.emotion?.endKey, 'joy');
  assert.equal(message.memoryRef?.originalContext, 'User likes bookstores.');
  assert.equal(message.innerVoiceText, 'ほんとに嬉しい。');
});

test('mapStoredMessageToClientMessage does not invent emotion for messages without emotion metadata', () => {
  const message = mapStoredMessageToClientMessage({
    id: 'user_1',
    role: 'user',
    type: 'text',
    content: 'Just checking in.',
    createdAt: new Date('2026-03-12T12:00:00.000Z'),
    emotionKey: null,
    emotionEndKey: null,
    gazeDirection: null,
    sceneId: null,
    metadata: null,
    characterId: 'akari',
  });

  assert.equal(message.role, 'user');
  assert.equal(message.emotion, undefined);
});

test('deriveAutomaticChatArtifacts creates first-chat and level-up entries', () => {
  const artifacts = deriveAutomaticChatArtifacts({
    characterId: 'akari',
    totalMessagesBefore: 0,
    intimacyBefore: { score: 15, level: 0 },
    intimacyAfter: { score: 16, level: 1, levelChanged: true },
    latestReply: 'We made it to warm already.',
  });

  assert.equal(artifacts.milestones.length, 2);
  assert.equal(artifacts.milestones[0]?.type, 'first_chat');
  assert.equal(artifacts.milestones[1]?.type, 'level_1');
  assert.equal(artifacts.journalEntries[0]?.entryType, 'first_meeting');
});

test('mapStoredJournalEntryToClientEntry parses serialized content and stickers', () => {
  const entry = mapStoredJournalEntryToClientEntry({
    id: 'journal_1',
    characterId: 'akari',
    entryType: 'milestone',
    title: 'Warm reached',
    content: JSON.stringify({ excerpt: 'A tiny remembered moment.' }),
    stickerIds: JSON.stringify(['level_1']),
    isShared: false,
    shareImageUrl: null,
    imageUrl: null,
    createdAt: new Date('2026-03-12T12:00:00.000Z'),
  });

  assert.equal(entry.content.excerpt, 'A tiny remembered moment.');
  assert.deepEqual(entry.stickerIds, ['level_1']);
});
