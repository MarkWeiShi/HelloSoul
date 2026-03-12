import test from 'node:test';
import assert from 'node:assert/strict';
import type { RelationshipPrefs } from '../../types/persona';
import { submitRelationshipPrefsChange } from './profilePreferences';

const prefs: RelationshipPrefs = {
  contactFreq: 'high',
  teachingMode: 'active',
  emotionalDepth: 'deep',
};

test('submitRelationshipPrefsChange returns true after save and refresh succeed', async () => {
  let refreshed = false;
  const calls: Array<{ characterId: string; prefs: RelationshipPrefs }> = [];

  const saved = await submitRelationshipPrefsChange({
    selectedCharacterId: 'akari',
    savingPrefs: false,
    prefs,
    updatePrefs: async (characterId, nextPrefs) => {
      calls.push({ characterId, prefs: nextPrefs });
    },
    refresh: async () => {
      refreshed = true;
    },
  });

  assert.equal(saved, true);
  assert.equal(refreshed, true);
  assert.deepEqual(calls, [{ characterId: 'akari', prefs }]);
});

test('submitRelationshipPrefsChange returns false when the save request fails', async () => {
  const saved = await submitRelationshipPrefsChange({
    selectedCharacterId: 'akari',
    savingPrefs: false,
    prefs,
    updatePrefs: async () => {
      throw new Error('network');
    },
    refresh: async () => {
      throw new Error('should not run');
    },
  });

  assert.equal(saved, false);
});
