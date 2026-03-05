import { apiFetch } from './base';
import type { ProactiveMessage, BirthdayContent } from '../types/chat';

// ===== Proactive Messages API (Module H) =====

export async function apiGetPendingProactive() {
  return apiFetch<{ messages: ProactiveMessage[] }>('/proactive/pending');
}

export async function apiMarkProactiveRead(messageId: string) {
  return apiFetch<{ message: ProactiveMessage }>(
    `/proactive/${messageId}/read`,
    { method: 'POST' }
  );
}

export async function apiMarkProactiveReplied(messageId: string) {
  return apiFetch<{ message: ProactiveMessage }>(
    `/proactive/${messageId}/reply`,
    { method: 'POST' }
  );
}

export async function apiDismissProactive(messageId: string) {
  return apiFetch<{ message: ProactiveMessage }>(
    `/proactive/${messageId}/dismiss`,
    { method: 'POST' }
  );
}

export async function apiGetProactiveHistory(characterId?: string, limit = 20) {
  const params = new URLSearchParams();
  if (characterId) params.set('characterId', characterId);
  params.set('limit', limit.toString());
  return apiFetch<{ messages: ProactiveMessage[] }>(
    `/proactive/history?${params}`
  );
}

// ===== Birthday API =====

export async function apiGetBirthdayContent(characterId: string) {
  return apiFetch<{ content: BirthdayContent }>(
    `/proactive/birthday/${characterId}`
  );
}
