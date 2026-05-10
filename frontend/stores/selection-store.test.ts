import type { PlayerCardData } from '@/features/players/types/player.types';
import { useSelectionStore } from './selection-store';

function makePlayer(id: string, overrides: Partial<PlayerCardData> = {}): PlayerCardData {
  return {
    id,
    name: `Player ${id}`,
    photoUrl: null,
    position: 'ST',
    nationality: null,
    birthDate: null,
    currentSeason: null,
    ...overrides,
  };
}

describe('useSelectionStore', () => {
  beforeEach(() => {
    useSelectionStore.getState().clearSelection();
  });

  it('starts empty', () => {
    expect(useSelectionStore.getState().selectedPlayers).toEqual([]);
  });

  it('adds a player when toggled and not selected', () => {
    const p = makePlayer('1');
    useSelectionStore.getState().togglePlayer(p);
    expect(useSelectionStore.getState().selectedPlayers).toEqual([p]);
  });

  it('removes a player when toggled and already selected', () => {
    const p = makePlayer('1');
    const { togglePlayer } = useSelectionStore.getState();
    togglePlayer(p);
    togglePlayer(p);
    expect(useSelectionStore.getState().selectedPlayers).toEqual([]);
  });

  it('caps selection at 3 players', () => {
    const { togglePlayer } = useSelectionStore.getState();
    togglePlayer(makePlayer('1'));
    togglePlayer(makePlayer('2'));
    togglePlayer(makePlayer('3'));
    togglePlayer(makePlayer('4'));

    const ids = useSelectionStore.getState().selectedPlayers.map((p) => p.id);
    expect(ids).toEqual(['1', '2', '3']);
  });

  it('does not duplicate when toggling the same player twice in selection mode', () => {
    const p = makePlayer('1');
    const { togglePlayer } = useSelectionStore.getState();
    togglePlayer(p);
    togglePlayer(p);
    togglePlayer(p);
    expect(useSelectionStore.getState().selectedPlayers).toEqual([p]);
  });

  it('clearSelection resets state to empty', () => {
    const { togglePlayer, clearSelection } = useSelectionStore.getState();
    togglePlayer(makePlayer('1'));
    togglePlayer(makePlayer('2'));
    clearSelection();
    expect(useSelectionStore.getState().selectedPlayers).toEqual([]);
  });

  it('keeps insertion order when adding players', () => {
    const { togglePlayer } = useSelectionStore.getState();
    togglePlayer(makePlayer('a'));
    togglePlayer(makePlayer('b'));
    togglePlayer(makePlayer('c'));
    expect(useSelectionStore.getState().selectedPlayers.map((p) => p.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});
