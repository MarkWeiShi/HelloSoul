import type { RelationshipPrefs } from '../../types/persona';

export async function submitRelationshipPrefsChange(params: {
  selectedCharacterId: string | null;
  savingPrefs: boolean;
  prefs: RelationshipPrefs;
  updatePrefs: (
    characterId: string,
    prefs: RelationshipPrefs
  ) => Promise<unknown>;
  refresh: () => Promise<unknown>;
}): Promise<boolean> {
  if (!params.selectedCharacterId || params.savingPrefs) {
    return false;
  }

  try {
    await params.updatePrefs(params.selectedCharacterId, params.prefs);
    await params.refresh();
    return true;
  } catch {
    return false;
  }
}
