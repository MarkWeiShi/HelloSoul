import { useCallback, useEffect, useState } from 'react';
import { usePersonaStore } from '../store/personaStore';
import { apiFetch } from '../api/base';
import type { Relationship, CharacterId } from '../types/persona';
import { INTIMACY_LEVELS } from '../types/persona';

export function useIntimacy(characterId: CharacterId | null) {
  const { relationships, setRelationship } = usePersonaStore();
  const [loading, setLoading] = useState(false);

  const relationship = characterId ? relationships[characterId] : null;

  const fetchRelationship = useCallback(async () => {
    if (!characterId) return;
    setLoading(true);
    try {
      const data = await apiFetch<any>(`/relationship/${characterId}`);
      setRelationship(characterId, data);
    } catch (err) {
      console.error('Failed to fetch relationship:', err);
    } finally {
      setLoading(false);
    }
  }, [characterId, setRelationship]);

  useEffect(() => {
    if (characterId && !relationships[characterId]) {
      fetchRelationship();
    }
  }, [characterId, relationships, fetchRelationship]);

  const currentLevel = INTIMACY_LEVELS.find(
    (l) =>
      (relationship?.intimacyScore ?? 0) >= l.minScore &&
      (relationship?.intimacyScore ?? 0) <= l.maxScore
  );

  const progressPercent = currentLevel
    ? ((relationship?.intimacyScore ?? 0) - currentLevel.minScore) /
      (currentLevel.maxScore - currentLevel.minScore)
    : 0;

  return {
    relationship,
    currentLevel,
    progressPercent: Math.min(progressPercent, 1),
    loading,
    refresh: fetchRelationship,
  };
}
