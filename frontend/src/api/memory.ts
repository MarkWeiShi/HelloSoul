import { apiFetch } from './base';

export async function apiGetMemorySummary(characterId: string) {
  return apiFetch<{ summary: string }>(`/memory/${characterId}`);
}

export async function apiGetJournalTimeline(characterId: string) {
  return apiFetch<{ entries: any[] }>(`/memory/timeline/${characterId}`);
}

export async function apiRecordMilestone(
  characterId: string,
  type: string,
  title: string,
  description: string
) {
  return apiFetch<{ milestone: any }>('/memory/milestone', {
    method: 'POST',
    body: JSON.stringify({ characterId, type, title, description }),
  });
}
