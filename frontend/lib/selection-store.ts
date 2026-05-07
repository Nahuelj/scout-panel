import { create } from 'zustand';
import type { PlayerCardData } from './players-api';

const MAX_SELECTION = 3;

type SelectionStore = {
  selectedPlayers: PlayerCardData[];
  togglePlayer: (player: PlayerCardData) => void;
  clearSelection: () => void;
};

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedPlayers: [],

  togglePlayer: (player) =>
    set((state) => {
      const isSelected = state.selectedPlayers.some((p) => p.id === player.id);
      if (isSelected) {
        return { selectedPlayers: state.selectedPlayers.filter((p) => p.id !== player.id) };
      }
      if (state.selectedPlayers.length >= MAX_SELECTION) return state;
      return { selectedPlayers: [...state.selectedPlayers, player] };
    }),

  clearSelection: () => set({ selectedPlayers: [] }),
}));
