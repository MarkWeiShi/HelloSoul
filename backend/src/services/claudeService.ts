import Anthropic from '@anthropic-ai/sdk';
import { PRIVATE_CHAT_SCENE_IDS } from '../config/privateChatMvp';
import {
  DEFAULT_EMOTION_KEY,
  EMOTION_KEYS,
  type EmotionPayload,
  type GazeDirection,
  normalizeEmotionKey,
  stabilizeEmotionKey,
} from './emotionEngine';
import { isAutomatedProfile } from '../config/runtime';
import { buildStubCompletion, buildStubStreamReply, chunkStubResponse } from '../testing/e2eAi';

// Lazy singleton - constructed on first use so dotenv has time to load
let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
    const baseURL = process.env.ANTHROPIC_BASE_URL;

    _anthropic = new Anthropic({
      ...(apiKey ? { apiKey } : {}),
      ...(authToken ? { authToken } : {}),
      ...(baseURL ? { baseURL } : {}),
    });
  }
  return _anthropic;
}

export interface ChatResponseWithEmotion {
  reply: string;
  emotion: EmotionPayload;
  sceneId?: string;
}

export interface StreamChatParams {
  systemPrompt: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens?: number;
}

/**
 * Stream a chat completion from Claude.
 * Returns an async iterator of text deltas.
 */
export async function* streamChat(params: StreamChatParams) {
  if (isAutomatedProfile()) {
    const stubReply = buildStubStreamReply({ messages: params.messages });
    for (const chunk of chunkStubResponse(stubReply)) {
      yield chunk;
    }
    return;
  }

  const stream = getClient().messages.stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: params.maxTokens ?? 500,
    system: params.systemPrompt,
    messages: params.messages,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}

/**
 * Single-shot completion (for memory extraction, inner voice, feed content).
 * Uses Haiku for cost efficiency.
 */
export async function completeHaiku(
  prompt: string,
  maxTokens = 300
): Promise<string> {
  if (isAutomatedProfile()) {
    return buildStubCompletion(prompt);
  }

  const result = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = result.content[0];
  if (block.type === 'text') return block.text;
  return '';
}

/**
 * Single-shot completion using Sonnet for higher quality tasks.
 */
export async function completeSonnet(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 500
): Promise<string> {
  if (isAutomatedProfile()) {
    return buildStubCompletion([systemPrompt || '', prompt].filter(Boolean).join('\n\n'));
  }

  const result = await getClient().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: maxTokens,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    messages: [{ role: 'user', content: prompt }],
  });

  const block = result.content[0];
  if (block.type === 'text') return block.text;
  return '';
}

// ===== Emotion State Extraction (Module F) =====

const EMOTION_INSTRUCTION = `

[SYSTEM INSTRUCTION: After your reply, append these XML tags on a NEW line:]
<emotion_key>emotion_key</emotion_key>
<emotion_key_end>emotion_key</emotion_key_end>
<gaze>user|away|down</gaze>
<scene_suggest>scene_id or none</scene_suggest>

Valid emotion_key values: ${EMOTION_KEYS.join(', ')}
Scene IDs: ${PRIVATE_CHAT_SCENE_IDS.join(', ')}, none
Pick emotion that matches your TRUE feeling about what user said. Gaze: "user" when engaged, "away" when shy/thinking, "down" when vulnerable.`;

/**
 * Parse emotion state XML tags from AI response text.
 */
export function parseEmotionFromResponse(
  rawText: string,
  fallback?: {
    previousKey?: string | null;
    previousAt?: Date | number | null;
    defaultKey?: string | null;
  }
): ChatResponseWithEmotion {
  const emotionMatch = rawText.match(/<emotion_key>(.*?)<\/emotion_key>/);
  const endEmotionMatch = rawText.match(/<emotion_key_end>(.*?)<\/emotion_key_end>/);
  const gazeMatch = rawText.match(/<gaze>(.*?)<\/gaze>/);
  const sceneMatch = rawText.match(/<scene_suggest>(.*?)<\/scene_suggest>/);

  const cleanReply = rawText
    .replace(/<emotion_key>.*?<\/emotion_key>/g, '')
    .replace(/<emotion_key_end>.*?<\/emotion_key_end>/g, '')
    .replace(/<emotion>.*?<\/emotion>/g, '')
    .replace(/<emotion_end>.*?<\/emotion_end>/g, '')
    .replace(/<memory_recall>.*?<\/memory_recall>/g, '')
    .replace(/<gaze>.*?<\/gaze>/g, '')
    .replace(/<scene_suggest>.*?<\/scene_suggest>/g, '')
    .trim();

  const key = stabilizeEmotionKey({
    previousKey: fallback?.previousKey,
    previousAt: fallback?.previousAt,
    candidateKey: emotionMatch?.[1] || undefined,
    defaultKey: fallback?.defaultKey,
  });
  const endKey = normalizeEmotionKey(endEmotionMatch?.[1] || undefined);
  const gazeValue = (gazeMatch?.[1] || 'user').trim().toLowerCase();
  const gazeDirection: GazeDirection =
    gazeValue === 'away' || gazeValue === 'down' || gazeValue === 'user'
      ? gazeValue
      : 'user';

  return {
    reply: cleanReply,
    emotion: {
      key: key || DEFAULT_EMOTION_KEY,
      endKey,
      gazeDirection,
    },
    sceneId: sceneMatch?.[1] !== 'none' ? sceneMatch?.[1] : undefined,
  };
}

/**
 * Get the emotion state instruction to append to user messages.
 */
export function getEmotionInstruction(): string {
  return EMOTION_INSTRUCTION;
}

export default getClient;
