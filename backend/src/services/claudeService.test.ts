import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEmotionFromResponse } from './claudeService';

test('parseEmotionFromResponse extracts emotion keys and gaze from xml tags', () => {
  const parsed = parseEmotionFromResponse(`Hello there\n<emotion_key>gratitude</emotion_key>\n<emotion_key_end>joy</emotion_key_end>\n<gaze>away</gaze>\n<scene_suggest>apartment_night</scene_suggest>`);

  assert.equal(parsed.reply, 'Hello there');
  assert.deepEqual(parsed.emotion, {
    key: 'gratitude',
    endKey: 'joy',
    gazeDirection: 'away',
  });
  assert.equal(parsed.sceneId, 'apartment_night');
});

test('parseEmotionFromResponse falls back to previous key and user gaze when invalid', () => {
  const parsed = parseEmotionFromResponse(
    `text only\n<emotion_key>EMO_01</emotion_key>\n<gaze>left</gaze>`,
    { previousKey: 'trust' }
  );

  assert.equal(parsed.emotion.key, 'trust');
  assert.equal(parsed.emotion.gazeDirection, 'user');
});

test('parseEmotionFromResponse uses provided default key when no prior emotion exists', () => {
  const parsed = parseEmotionFromResponse('plain reply with no xml tags', {
    defaultKey: 'compassion',
  });

  assert.equal(parsed.reply, 'plain reply with no xml tags');
  assert.equal(parsed.emotion.key, 'compassion');
  assert.equal(parsed.emotion.gazeDirection, 'user');
});
