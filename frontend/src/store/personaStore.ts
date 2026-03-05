import { create } from 'zustand';
import type { CharacterId, Relationship } from '../types/persona';
import { CHARACTERS } from '../types/persona';

interface PersonaState {
  selectedCharacterId: CharacterId | null;
  relationships: Record<string, Relationship>;

  selectCharacter: (id: CharacterId) => void;
  setRelationship: (characterId: string, relationship: Relationship) => void;
  getCharacter: (id: CharacterId) => (typeof CHARACTERS)[number] | undefined;
}

export const usePersonaStore = create<PersonaState>((set, get) => ({
  selectedCharacterId: null,
  relationships: {},

  selectCharacter: (id) => set({ selectedCharacterId: id }),

  setRelationship: (characterId, relationship) =>
    set((state) => ({
      relationships: { ...state.relationships, [characterId]: relationship },
    })),

  getCharacter: (id) => CHARACTERS.find((c) => c.id === id),
}));
