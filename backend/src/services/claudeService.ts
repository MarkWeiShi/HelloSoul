import Anthropic from '@anthropic-ai/sdk';

// Lazy singleton — constructed on first use so dotenv has time to load
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

// ===== Emotion State Types (Module F) =====

export type EmotionCode =
  | 'EMO_01' // idle/content
  | 'EMO_02' // happy
  | 'EMO_03' // shy/moved
  | 'EMO_04' // attentive/listening
  | 'EMO_05' // worried/caring
  | 'EMO_06' // surprised
  | 'EMO_07' // playful/teasing
  | 'EMO_08' // thoughtful
  | 'EMO_09' // suppressed smile
  | 'EMO_10' // frustrated/pouting
  | 'EMO_11' // pre-tears (moved deeply)
  | 'EMO_12' // sleepy/drowsy
  | 'EMO_13' // determined
  | 'EMO_14'; // daydreaming

export type GazeDirection = 'user' | 'away' | 'down';

export interface EmotionState {
  current: EmotionCode;
  endTransition?: EmotionCode;
  gazeDirection: GazeDirection;
}

export interface ChatResponseWithEmotion {
  reply: string;
  emotionState: EmotionState;
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
<emotion>EMO_XX</emotion>
<emotion_end>EMO_XX</emotion_end>
<gaze>user|away|down</gaze>
<scene_suggest>scene_id or none</scene_suggest>

Emotion codes: EMO_01(idle) EMO_02(happy) EMO_03(shy/moved) EMO_04(attentive) EMO_05(worried/caring) EMO_06(surprised) EMO_07(playful) EMO_08(thoughtful) EMO_09(suppressed smile) EMO_10(frustrated) EMO_11(pre-tears) EMO_12(sleepy) EMO_13(determined) EMO_14(daydreaming)
Scene IDs: cafe_counter, classroom, cycling_street, rainy_convenience, apartment_day, shrine_festival, cherry_blossom, apartment_night, old_bookstore, canal_walk, none
Pick emotion that matches your TRUE feeling about what user said. Gaze: "user" when engaged, "away" when shy/thinking, "down" when vulnerable.`;

/**
 * Parse emotion state XML tags from AI response text.
 */
export function parseEmotionFromResponse(rawText: string): ChatResponseWithEmotion {
  const emotionMatch = rawText.match(/<emotion>(.*?)<\/emotion>/);
  const endEmotionMatch = rawText.match(/<emotion_end>(.*?)<\/emotion_end>/);
  const gazeMatch = rawText.match(/<gaze>(.*?)<\/gaze>/);
  const sceneMatch = rawText.match(/<scene_suggest>(.*?)<\/scene_suggest>/);

  // Clean reply text (remove XML tags)
  const cleanReply = rawText
    .replace(/<emotion>.*?<\/emotion>/g, '')
    .replace(/<emotion_end>.*?<\/emotion_end>/g, '')
    .replace(/<gaze>.*?<\/gaze>/g, '')
    .replace(/<scene_suggest>.*?<\/scene_suggest>/g, '')
    .trim();

  return {
    reply: cleanReply,
    emotionState: {
      current: (emotionMatch?.[1] as EmotionCode) || 'EMO_01',
      endTransition: (endEmotionMatch?.[1] as EmotionCode) || undefined,
      gazeDirection: (gazeMatch?.[1] as GazeDirection) || 'user',
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
