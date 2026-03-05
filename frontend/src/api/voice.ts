import { apiFetch } from './base';

export async function apiGenerateVoice(characterId: string, text: string) {
  return apiFetch<{ audioUrl: string; durationMs: number }>('/voice/message', {
    method: 'POST',
    body: JSON.stringify({ characterId, text }),
  });
}

export async function apiGetBedtimeStories(characterId: string) {
  return apiFetch<{ stories: any[] }>(`/voice/bedtime/${characterId}`);
}

export async function apiStartVoiceCall(characterId: string) {
  return apiFetch<{ sessionId: string; maxDurationMs: number; status: string }>(
    '/voice/call/start',
    { method: 'POST', body: JSON.stringify({ characterId }) }
  );
}
