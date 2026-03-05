/**
 * Web Speech API TTS utility — free, instant, runs in-browser.
 * Maps each character to their native language voice.
 */

// BCP-47 language tags per character
export const CHARACTER_LANGS: Record<string, string> = {
  akari: 'ja-JP',
  mina: 'ko-KR',
  sophie: 'fr-FR',
  carlos: 'pt-BR',
};

// Preferred voice names per language (varies by browser/OS)
const PREFERRED_VOICES: Record<string, string[]> = {
  'ja-JP': ['Kyoko', 'O-Ren', 'Hattori', 'Google 日本語'],
  'ko-KR': ['Yuna', 'Google 한국의'],
  'fr-FR': ['Amélie', 'Thomas', 'Audrey', 'Google français'],
  'pt-BR': ['Luciana', 'Google português do Brasil'],
};

let voicesLoaded = false;

/**
 * Ensure voices are loaded (some browsers load them async).
 */
function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }
    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true;
      resolve(window.speechSynthesis.getVoices());
    };
    // Fallback timeout
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
  });
}

/**
 * Pick the best available voice for a language.
 */
async function pickVoice(lang: string): Promise<SpeechSynthesisVoice | null> {
  const voices = await ensureVoices();
  const preferred = PREFERRED_VOICES[lang] || [];

  // Try preferred voice names first
  for (const name of preferred) {
    const match = voices.find((v) => v.name.includes(name) && v.lang.startsWith(lang.slice(0, 2)));
    if (match) return match;
  }

  // Fall back to any voice matching the language
  const langMatch = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
  if (langMatch) return langMatch;

  // Last resort: default voice
  return null;
}

export interface SpeakOptions {
  rate?: number;    // 0.1–10, default 0.9
  pitch?: number;   // 0–2, default 1.0
  volume?: number;  // 0–1, default 1.0
  onEnd?: () => void;
  onError?: (err: Event) => void;
}

/**
 * Speak text using the browser's built-in TTS.
 * Returns a cancel function.
 */
export async function speak(
  text: string,
  characterId: string,
  options: SpeakOptions = {}
): Promise<() => void> {
  if (!('speechSynthesis' in window)) {
    console.warn('[TTS] Speech synthesis not supported in this browser');
    return () => {};
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const lang = CHARACTER_LANGS[characterId] || 'en-US';
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = options.rate ?? 0.9;   // Slightly slower for language learning
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;

  const voice = await pickVoice(lang);
  if (voice) {
    utterance.voice = voice;
  }

  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);

  // Return cancel function
  return () => window.speechSynthesis.cancel();
}

/**
 * Stop any currently playing TTS.
 */
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if TTS is currently speaking.
 */
export function isSpeaking(): boolean {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
}

/**
 * Check if Web Speech API is available.
 */
export function isTTSAvailable(): boolean {
  return 'speechSynthesis' in window;
}
