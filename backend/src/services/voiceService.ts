/**
 * ElevenLabs Voice Service — handles voice message generation,
 * bedtime stories, and real-time call integration.
 */

export interface VoiceMessageResult {
  audioUrl: string;
  durationMs: number;
}

/**
 * Generate a voice message for a character using ElevenLabs TTS.
 */
export async function generateVoiceMessage(
  text: string,
  voiceId: string,
  style: 'normal' | 'whisper' | 'story' = 'normal'
): Promise<VoiceMessageResult | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'your-elevenlabs-key-here') return null;

  const voiceSettings = {
    normal: { stability: 0.7, similarity_boost: 0.8, style: 0.5, use_speaker_boost: true },
    whisper: { stability: 0.9, similarity_boost: 0.6, style: 0.1, use_speaker_boost: false },
    story: { stability: 0.8, similarity_boost: 0.7, style: 0.6, use_speaker_boost: true },
  };

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings[style],
        }),
      }
    );

    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    // Rough estimate: ~150 words/min, average word ~5 chars
    const wordCount = text.split(/\s+/).length;
    const durationMs = Math.round((wordCount / 150) * 60 * 1000);

    return { audioUrl, durationMs };
  } catch {
    return null;
  }
}

// ===== Bedtime Story Catalog =====

interface BedtimeStory {
  title: string;
  titleNative: string;
  synopsis: string;
  language: string;
  durationMinutes: number;
}

export const BEDTIME_STORIES: Record<string, BedtimeStory[]> = {
  akari: [
    {
      title: 'The Cat of Shimokitazawa',
      titleNative: '下北沢の猫',
      synopsis: 'A stray cat leads Akari through the hidden alleys of Shimokitazawa on a rainy night.',
      language: 'ja',
      durationMinutes: 10,
    },
    {
      title: 'The Postcard from Nowhere',
      titleNative: 'どこからかのハガキ',
      synopsis: 'A mysterious vintage postcard arrives with no return address, written in impossible handwriting.',
      language: 'ja',
      durationMinutes: 8,
    },
    {
      title: 'Midnight at Yoyogi Park',
      titleNative: '深夜の代々木公園',
      synopsis: 'The park after midnight holds stories that only the trees remember.',
      language: 'ja',
      durationMinutes: 12,
    },
  ],
  mina: [
    {
      title: 'Late Night at Han River',
      titleNative: '한강의 밤',
      synopsis: 'A chance encounter on the cycling path changes everything about an ordinary Tuesday.',
      language: 'ko',
      durationMinutes: 9,
    },
    {
      title: 'The Design That Dreamed',
      titleNative: '꿈꾸는 디자인',
      synopsis: 'Mina\'s rejected ad campaign takes on a life of its own in her dreams.',
      language: 'ko',
      durationMinutes: 7,
    },
  ],
  sophie: [
    {
      title: 'Windows of Montmartre',
      titleNative: 'Les Fenêtres de Montmartre',
      synopsis: 'Each window in Sophie\'s building holds a love story spanning decades.',
      language: 'fr',
      durationMinutes: 12,
    },
    {
      title: 'The Color She Couldn\'t Mix',
      titleNative: 'La Couleur Impossible',
      synopsis: 'A painting refuses to be completed until Sophie understands what it\'s trying to say.',
      language: 'fr',
      durationMinutes: 10,
    },
  ],
  carlos: [
    {
      title: 'The Wave That Waited',
      titleNative: 'A Onda que Esperou',
      synopsis: 'A legendary wave at Ipanema appears only once a year, at a moment no one can predict.',
      language: 'pt',
      durationMinutes: 10,
    },
    {
      title: 'Bossa Nova for Two',
      titleNative: 'Bossa Nova para Dois',
      synopsis: 'A mysterious guitar at a street market plays a song that only Carlos can hear.',
      language: 'pt',
      durationMinutes: 8,
    },
  ],
};

/**
 * Get bedtime story catalog for a character.
 */
export function getBedtimeStories(characterId: string): BedtimeStory[] {
  return BEDTIME_STORIES[characterId] || [];
}
