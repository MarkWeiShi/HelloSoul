import { beforeEach, describe, expect, it } from 'vitest';
import { usePersonaStore } from './personaStore';

describe('personaStore', () => {
  beforeEach(() => {
    localStorage.clear();
    usePersonaStore.setState({
      selectedCharacterId: null,
      relationships: {},
    });
  });

  it('persists the selected character id locally', () => {
    usePersonaStore.getState().selectCharacter('akari');

    expect(localStorage.getItem('linglove_selected_character')).toBe('akari');
  });
});
