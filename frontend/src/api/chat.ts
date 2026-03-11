import { useUserStore } from '../store/userStore';
import type { ChatMvpScenarioId } from '../config/privateChatMvp';
import type { Emotion } from '../types/chat';

/**
 * Stream chat messages via SSE.
 * Calls the callback for each delta, and returns the final metadata.
 */
export async function streamChatMessage(
  characterId: string,
  message: string,
  scenarioId: ChatMvpScenarioId,
  onDelta: (delta: string) => void
): Promise<{
  messageId: string;
  intimacy: { newScore: number; newLevel: number; levelChanged: boolean };
  innerVoice: {
    text: string;
    language: string;
    translation: string;
    audioUrl?: string;
  } | null;
  memoryRecall: { content: string; date: string } | null;
  emotion?: Emotion;
  sceneId?: string;
}> {
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
  let metadata: any = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    const lines = text.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = JSON.parse(line.slice(6));

      if (data.type === 'delta') {
        onDelta(data.content);
      } else if (data.type === 'done') {
        metadata = data;
      }
    }
  }

  return (
    metadata || {
      messageId: '',
      intimacy: { newScore: 0, newLevel: 0, levelChanged: false },
      innerVoice: null,
      memoryRecall: null,
    }
  );
}
