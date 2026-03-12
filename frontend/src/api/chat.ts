import { useUserStore } from '../store/userStore';
import type { ChatMvpScenarioId } from '../config/privateChatMvp';
import { apiFetch } from './base';
import type { ChatDonePayload, ChatHistoryMessage } from '../types/chat';
import { extractSseDataFrames } from './chatStream';

/**
 * Stream chat messages via SSE.
 * Calls the callback for each delta, and returns the final metadata.
 */
export async function streamChatMessage(
  characterId: string,
  message: string,
  scenarioId: ChatMvpScenarioId,
  onDelta: (delta: string) => void
): Promise<ChatDonePayload> {
  const token = useUserStore.getState().token;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ characterId, message, scenarioId }),
  });

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let metadata: ChatDonePayload | null = null;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parsed = extractSseDataFrames(buffer);
    buffer = parsed.rest;

    for (const event of parsed.events) {
      const data = JSON.parse(event);
      if (data.type === 'delta') {
        onDelta(data.content);
      } else if (data.type === 'done') {
        metadata = data as ChatDonePayload;
      }
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    const parsed = extractSseDataFrames(`${buffer}\n\n`);
    for (const event of parsed.events) {
      const data = JSON.parse(event);
      if (data.type === 'delta') {
        onDelta(data.content);
      } else if (data.type === 'done') {
        metadata = data as ChatDonePayload;
      }
    }
  }

  return (
    metadata || {
      messageId: '',
      reply: '',
      intimacy: { newScore: 0, newLevel: 0, levelChanged: false },
      innerVoice: null,
      memoryRecallHit: null,
      promptVersion: 'unknown',
      warnings: [],
      traceId: '',
    }
  );
}

export async function apiGetChatHistory(characterId: string) {
  return apiFetch<{
    promptVersion: string;
    messages: ChatHistoryMessage[];
  }>(`/chat/history/${characterId}`);
}
