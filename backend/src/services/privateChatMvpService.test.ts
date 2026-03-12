import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePrivateChatSceneId } from '../config/privateChatMvp';
import {
  buildPrivateChatScenarioContext,
  inferPrivateChatScenario,
} from './privateChatMvpService';

test('infers first_chat for a short first message', () => {
  assert.equal(
    inferPrivateChatScenario({
      message: 'Hey, first time here.',
      totalMessages: 0,
    }),
    'first_chat'
  );
});

test('infers light_support when the message carries mild emotional strain', () => {
  assert.equal(
    inferPrivateChatScenario({
      message: 'Today was rough and I feel overwhelmed.',
      totalMessages: 4,
    }),
    'light_support'
  );
});

test('falls back to daily_checkin for ongoing casual conversation', () => {
  assert.equal(
    inferPrivateChatScenario({
      message: 'Today was busy, but I had one nice moment.',
      totalMessages: 3,
    }),
    'daily_checkin'
  );
});

test('buildPrivateChatScenarioContext returns character-specific defaults', () => {
  const context = buildPrivateChatScenarioContext({
    characterId: 'mina',
    message: 'I am tired and I do not want advice, just company.',
    totalMessages: 5,
  });

  assert.equal(context.scenarioId, 'light_support');
  assert.equal(context.defaultSceneId, 'apartment_night');
  assert.equal(context.fallbackEmotionKey, 'compassion');
  assert.match(context.prompt, /Character pack for Mina/);
  assert.equal(normalizePrivateChatSceneId(context.defaultSceneId), 'apartment_night');
});

test('buildPrivateChatScenarioContext honors an explicit requested scenario', () => {
  const context = buildPrivateChatScenarioContext({
    characterId: 'akari',
    message: 'Hey there.',
    totalMessages: 8,
    requestedScenarioId: 'light_support',
  });

  assert.equal(context.scenarioId, 'light_support');
  assert.equal(context.defaultSceneId, 'apartment_night');
  assert.equal(context.fallbackEmotionKey, 'compassion');
});
