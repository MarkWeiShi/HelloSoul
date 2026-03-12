import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRelationshipPreferenceContext,
  buildProactivePreferenceContext,
  getEarliestProactiveSendAt,
  getProactiveCadenceHours,
  moveDateOutOfSilentHours,
} from './relationshipPreferenceService';

test('buildRelationshipPreferenceContext turns saved prefs into prompt guidance', () => {
  const context = buildRelationshipPreferenceContext({
    contactFreq: 'high',
    teachingMode: 'active',
    emotionalDepth: 'deep',
  });

  assert.match(context, /match the user's preferred pace/i);
  assert.match(context, /gently correct small mistakes/i);
  assert.match(context, /deeper emotional honesty/i);
});

test('buildProactivePreferenceContext respects low-frequency users', () => {
  const context = buildProactivePreferenceContext({
    contactFreq: 'low',
    teachingMode: 'none',
    emotionalDepth: 'light',
  });

  assert.match(context, /keep outreach sparse/i);
  assert.match(context, /avoid unsolicited language teaching/i);
  assert.match(context, /keep the emotional ask light/i);
});

test('getProactiveCadenceHours maps contact frequency to distinct cooldowns', () => {
  assert.equal(getProactiveCadenceHours('low'), 72);
  assert.equal(getProactiveCadenceHours('normal'), 48);
  assert.equal(getProactiveCadenceHours('high'), 24);
});

test('getEarliestProactiveSendAt honors cadence from the last proactive touchpoint', () => {
  const now = new Date('2026-03-12T12:00:00.000Z');
  const lastProactiveAt = new Date('2026-03-11T16:00:00.000Z');

  const next = getEarliestProactiveSendAt({
    now,
    lastProactiveAt,
    contactFreq: 'high',
  });

  assert.equal(next.toISOString(), '2026-03-12T16:00:00.000Z');
});

test('moveDateOutOfSilentHours pushes overnight silent-window sends to the next allowed time', () => {
  const adjusted = moveDateOutOfSilentHours(
    new Date(2026, 2, 12, 23, 45, 0, 0),
    22,
    8
  );

  assert.equal(adjusted.getTime(), new Date(2026, 2, 13, 8, 10, 0, 0).getTime());
});
