import { apiFetch } from './base';
import type { RelationshipPrefs } from '../types/persona';

export async function apiUpdateRelationshipPrefs(
  characterId: string,
  prefs: RelationshipPrefs
) {
  return apiFetch<{ prefs: RelationshipPrefs }>(`/relationship/${characterId}/prefs`, {
    method: 'PUT',
    body: JSON.stringify(prefs),
  });
}
