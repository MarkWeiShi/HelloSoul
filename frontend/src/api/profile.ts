import { apiFetch } from './base';
import type {
  DeepProfile,
  GrowthReport,
  ReflectionQuestion,
} from '../types/chat';

// ===== Deep Profile API (Module I) =====

export async function apiGetDeepProfile(characterId: string) {
  return apiFetch<{ profile: DeepProfile; narrative: string }>(
    `/profile/deep/${characterId}`
  );
}

export async function apiDeleteDeepProfileField(
  characterId: string,
  fieldId: string
) {
  return apiFetch<{ success: boolean }>(
    `/profile/deep/${characterId}/${fieldId}`,
    { method: 'DELETE' }
  );
}

export async function apiClearDeepProfile(characterId: string) {
  return apiFetch<{ success: boolean; deletedCount: number }>(
    `/profile/deep/${characterId}`,
    { method: 'DELETE' }
  );
}

// ===== Growth Report API =====

export async function apiGetGrowthReport(characterId: string, month: string) {
  return apiFetch<{ report: GrowthReport }>(
    `/profile/growth/${characterId}/${month}`
  );
}

// ===== Reflection Question API (Module I) =====

export async function apiGetReflectionQuestion(characterId: string) {
  return apiFetch<{ question: ReflectionQuestion | null }>(
    `/profile/reflection/${characterId}`
  );
}

export async function apiAnswerReflection(questionId: string, answer: string) {
  return apiFetch<{ question: ReflectionQuestion }>(
    `/profile/reflection/${questionId}/answer`,
    {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }
  );
}
