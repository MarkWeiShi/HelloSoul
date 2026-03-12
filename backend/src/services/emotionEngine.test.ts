import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMOTION_KEYS,
  DEFAULT_EMOTION_KEY,
  getEmotionMeta,
  isEmotionKey,
  normalizeEmotionKey,
  stabilizeEmotionKey,
  inferEmotionKeyFromText,
} from './emotionEngine';

test('emotion catalog contains exactly 50 unique keys', () => {
  assert.equal(EMOTION_KEYS.length, 50);
  assert.equal(new Set(EMOTION_KEYS).size, 50);
});

test('normalization accepts valid key and rejects unknown key', () => {
  assert.equal(normalizeEmotionKey('contentment'), 'contentment');
  assert.equal(normalizeEmotionKey('  CONTENTMENT  '), 'contentment');
  assert.equal(normalizeEmotionKey('EMO_01'), undefined);
  assert.equal(isEmotionKey('joy'), true);
  assert.equal(isEmotionKey('EMO_03'), false);
});

test('metadata provides zh label and emoji', () => {
  const meta = getEmotionMeta('contentment');
  assert.equal(meta.labelZh, '满足');
  assert.equal(meta.emoji, '☺️');
});

test('stabilizer keeps previous key during cross-cluster cooldown', () => {
  const now = Date.now();
  const stabilized = stabilizeEmotionKey({
    previousKey: 'sadness',
    previousAt: now - 5_000,
    candidateKey: 'joy',
    cooldownMs: 45_000,
  });
  assert.equal(stabilized, 'sadness');
});

test('stabilizer allows same-cluster switch within cooldown', () => {
  const now = Date.now();
  const stabilized = stabilizeEmotionKey({
    previousKey: 'sadness',
    previousAt: now - 5_000,
    candidateKey: 'grief',
    cooldownMs: 45_000,
  });
  assert.equal(stabilized, 'grief');
});

test('stabilizer falls back to previous valid key then default', () => {
  assert.equal(
    stabilizeEmotionKey({
      previousKey: 'contentment',
      candidateKey: 'not-exist',
    }),
    'contentment'
  );

  assert.equal(
    stabilizeEmotionKey({
      previousKey: 'not-exist',
      candidateKey: 'invalid',
    }),
    DEFAULT_EMOTION_KEY
  );
});

test('secondary text classifier detects anxiety and gratitude cues', () => {
  assert.equal(inferEmotionKeyFromText('I am super anxious and nervous tonight'), 'anxiety');
  assert.equal(inferEmotionKeyFromText('thank you so much, really appreciate you'), 'gratitude');
});

test('stabilizer honors provided default key when nothing valid exists', () => {
  assert.equal(
    stabilizeEmotionKey({
      previousKey: 'not-exist',
      candidateKey: 'invalid',
      defaultKey: 'compassion',
    }),
    'compassion'
  );
});
