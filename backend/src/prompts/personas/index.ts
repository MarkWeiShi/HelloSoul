import { AKARI_SYSTEM_PROMPT } from './akari';
import { MINA_SYSTEM_PROMPT } from './mina';
import { SOPHIE_SYSTEM_PROMPT } from './sophie';
import { CARLOS_SYSTEM_PROMPT } from './carlos';

export interface CharacterConfig {
  id: string;
  name: string;
  nativeName: string;
  language: string;
  languageCode: string;
  voiceId: string;
  systemPrompt: string;
}

const CHARACTERS: Record<string, CharacterConfig> = {
  akari: {
    id: 'akari',
    name: 'Akari',
    nativeName: 'あかり',
    language: 'Japanese',
    languageCode: 'ja',
    voiceId: process.env.AKARI_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
    systemPrompt: AKARI_SYSTEM_PROMPT,
  },
  mina: {
    id: 'mina',
    name: 'Mina',
    nativeName: '민아',
    language: 'Korean',
    languageCode: 'ko',
    voiceId: process.env.MINA_VOICE_ID || 'MF3mGyEYCl7XYWbV9V6O',
    systemPrompt: MINA_SYSTEM_PROMPT,
  },
  sophie: {
    id: 'sophie',
    name: 'Sophie',
    nativeName: 'Sophie',
    language: 'French',
    languageCode: 'fr',
    voiceId: process.env.SOPHIE_VOICE_ID || 'jBpfAFnaylXS5xIY0168',
    systemPrompt: SOPHIE_SYSTEM_PROMPT,
  },
  carlos: {
    id: 'carlos',
    name: 'Carlos',
    nativeName: 'Carlos',
    language: 'Portuguese',
    languageCode: 'pt',
    voiceId: process.env.CARLOS_VOICE_ID || 'onwK4e9ZLuTAKqWW03F9',
    systemPrompt: CARLOS_SYSTEM_PROMPT,
  },
};

export function getCharacterConfig(characterId: string): CharacterConfig {
  const config = CHARACTERS[characterId];
  if (!config) throw new Error(`Unknown character: ${characterId}`);
  return config;
}

export function getAllCharacterIds(): string[] {
  return Object.keys(CHARACTERS);
}

export { CHARACTERS };
