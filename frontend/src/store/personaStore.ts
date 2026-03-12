import { create } from 'zustand';
import type { CharacterId, Relationship } from '../types/persona';
import { CHARACTERS } from '../types/persona';

const SELECTED_CHARACTER_KEY = 'linglove_selected_character';

function readSelectedCharacter(): CharacterId | null {
  if (typeof localStorage === 'undefined') return null;

  const value = localStorage.getItem(SELECTED_CHARACTER_KEY);
  return value === 'akari' || value === 'mina' || value === 'sophie' || value === 'carlos'
    ? value
    : null;
}

interface PersonaState {
  selectedCharacterId: CharacterId | null;
  relationships: Record<string, Relationship>;

  selectCharacter: (id: CharacterId) => void;
  setRelationship: (characterId: string, relationship: Relationship) => void;
  getCharacter: (id: CharacterId) => (typeof CHARACTERS)[number] | undefined;
}

export const usePersonaStore = create<PersonaState>((set, get) => ({
  selectedCharacterId: readSelectedCharacter(),
  relationships: {},

  selectCharacter: (id) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SELECTED_CHARACTER_KEY, id);
    }
    set({ selectedCharacterId: id });
  },

  setRelationship: (characterId, relationship) =>
    set((state) => ({
      relationships: { ...state.relationships, [characterId]: relationship },
    })),

  getCharacter: (id) => CHARACTERS.find((c) => c.id === id),
}));
