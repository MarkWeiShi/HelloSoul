import { expect, it } from 'vitest';
import type { RelationshipPrefs } from '../../types/persona';
import { submitRelationshipPrefsChange } from './profilePreferences';

const prefs: RelationshipPrefs = {
  contactFreq: 'high',
  teachingMode: 'active',
  emotionalDepth: 'deep',
};

it('submitRelationshipPrefsChange returns true after save and refresh succeed', async () => {
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

  expect(saved).toBe(true);
  expect(refreshed).toBe(true);
  expect(calls).toEqual([{ characterId: 'akari', prefs }]);
});

it('submitRelationshipPrefsChange returns false when the save request fails', async () => {
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

  expect(saved).toBe(false);
});
