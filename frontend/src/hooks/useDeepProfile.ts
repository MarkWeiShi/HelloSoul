import { useCallback, useState } from 'react';
import {
  apiGetDeepProfile,
  apiDeleteDeepProfileField,
  apiClearDeepProfile,
  apiGetGrowthReport,
  apiGetReflectionQuestion,
  apiAnswerReflection,
} from '../api/profile';
import { useDeepProfileStore } from '../store/deepProfileStore';
import type { DeepProfile, GrowthReport, ReflectionQuestion } from '../types/chat';

export function useDeepProfile(characterId: string | null) {
  const {
    profile,
    growthReport,
    reflectionQuestion,
    isLoading,
    setProfile,
    removeField,
    clearProfile,
    setGrowthReport,
    setReflectionQuestion,
    setLoading,
  } = useDeepProfileStore();

  const fetchProfile = useCallback(async () => {
    if (!characterId) return;
    setLoading(true);
    try {
      const data = await apiGetDeepProfile(characterId);
      setProfile(data.profile);
    } catch (err) {
      console.error('Failed to fetch deep profile:', err);
    } finally {
      setLoading(false);
    }
  }, [characterId, setLoading, setProfile]);

  const deleteField = useCallback(
    async (fieldId: string) => {
      if (!characterId) return;
      try {
        await apiDeleteDeepProfileField(characterId, fieldId);
        removeField(fieldId);
      } catch (err) {
        console.error('Failed to delete profile field:', err);
      }
    },
    [characterId, removeField]
  );

  const clearAll = useCallback(async () => {
    if (!characterId) return;
    try {
      await apiClearDeepProfile(characterId);
      clearProfile();
    } catch (err) {
      console.error('Failed to clear profile:', err);
    }
  }, [characterId, clearProfile]);

  const fetchGrowthReport = useCallback(
    async (month?: string) => {
      if (!characterId) return;
      const m = month || new Date().toISOString().slice(0, 7); // YYYY-MM
      try {
        const data = await apiGetGrowthReport(characterId, m);
      setGrowthReport(data.report);
      } catch (err) {
        console.error('Failed to fetch growth report:', err);
      }
    },
    [characterId, setGrowthReport]
  );

  const fetchReflection = useCallback(async () => {
    if (!characterId) return;
    try {
      const data = await apiGetReflectionQuestion(characterId);
      if (data.question) setReflectionQuestion(data.question);
    } catch (err) {
      console.error('Failed to fetch reflection:', err);
    }
  }, [characterId, setReflectionQuestion]);

  const answerReflection = useCallback(
    async (questionId: string, answer: string) => {
      try {
        await apiAnswerReflection(questionId, answer);
        setReflectionQuestion(null as any);
      } catch (err) {
        console.error('Failed to answer reflection:', err);
      }
    },
    [setReflectionQuestion]
  );

  return {
    profile,
    growthReport,
    reflectionQuestion,
    isLoading,
    fetchProfile,
    deleteField,
    clearAll,
    fetchGrowthReport,
    fetchReflection,
    answerReflection,
  };
}
