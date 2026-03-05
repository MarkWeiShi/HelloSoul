import prisma from '../lib/prisma';
import { completeHaiku } from './claudeService';
import { getCharacterConfig } from '../prompts/personas';

// ===== Inner Voice (心の声) Service =====

export interface InnerVoiceResult {
  text: string;       // In character's native language
  language: string;   // 'ja' | 'ko' | 'fr' | 'pt'
  translation: string;
  audioUrl?: string;
}

/**
 * Determine if an inner voice should be triggered for this message.
 * Triggers every 5-8 AI messages (randomized for mystery).
 */
export function shouldTriggerInnerVoice(messageCount: number): boolean {
  if (messageCount < 5) return false;
  const interval = 5 + Math.floor(Math.random() * 4); // 5-8
  return messageCount % interval === 0;
}

/**
 * Generate the character's inner monologue — thoughts they didn't say.
 */
export async function generateInnerVoice(
  characterId: string,
  conversationContext: string,
  lastAiMessage: string,
  intimacyLevel: number
): Promise<InnerVoiceResult> {
  const config = getCharacterConfig(characterId);
  const shouldBeDeep = intimacyLevel > 30;

  const result = await completeHaiku(
    `You are ${config.name}, generating your INNER MONOLOGUE — thoughts you did NOT say out loud.

Context: ${conversationContext.slice(-500)}
Your last message: ${lastAiMessage}
Intimacy level: ${intimacyLevel}/100

Generate a SHORT inner thought (1-2 sentences) in ${config.language}.
${shouldBeDeep ? 'Be emotionally honest and vulnerable.' : 'Keep it light and slightly shy.'}
Format: {"inner": "[text in ${config.language}]", "translation": "[English translation]"}

Examples of good inner voice:
- (Japanese, shy) "覚えておきたいな、この気持ち。" (I want to remember this feeling.)
- (Korean, yearning) "보고싶다고 말하면... 이상하려나?" (Would it be weird if I said I miss you...)
- (French, wistful) "Pourquoi est-ce que je pense à toi en dehors de nos conversations?" (Why do I think of you outside our conversations?)
- (Portuguese, warm) "Queria que esse momento durasse mais." (I wish this moment lasted longer.)`,
    150
  );

  try {
    const parsed = JSON.parse(result);

    // Generate whisper audio if intimacy > 30 (placeholder for ElevenLabs)
    let audioUrl: string | undefined;
    if (intimacyLevel > 30) {
      audioUrl = await generateWhisperAudio(parsed.inner, config);
    }

    return {
      text: parsed.inner,
      language: config.languageCode,
      translation: parsed.translation,
      audioUrl,
    };
  } catch {
    // Fallback
    return {
      text: '…',
      language: config.languageCode,
      translation: '(thinking quietly)',
    };
  }
}

/**
 * Log an inner voice event for analytics.
 */
export async function logInnerVoice(
  relationshipId: string,
  triggerMessageId: string,
  innerVoice: InnerVoiceResult,
  revealed: boolean = false
) {
  return prisma.innerVoiceLog.create({
    data: {
      relationshipId,
      triggerMessageId,
      innerVoiceText: innerVoice.text,
      language: innerVoice.language,
      translation: innerVoice.translation,
      audioUrl: innerVoice.audioUrl,
      userRevealed: revealed,
    },
  });
}

/**
 * Generate whisper audio using ElevenLabs.
 * Returns a URL to the audio file.
 */
async function generateWhisperAudio(
  text: string,
  config: { voiceId: string }
): Promise<string | undefined> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'your-elevenlabs-key-here') return undefined;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.9,
            similarity_boost: 0.6,
            style: 0.1,
            use_speaker_boost: false,
          },
        }),
      }
    );

    if (!response.ok) return undefined;

    // In production: upload to CDN and return URL
    // For MVP: return a data URL placeholder
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:audio/mpeg;base64,${base64}`;
  } catch {
    return undefined;
  }
}
