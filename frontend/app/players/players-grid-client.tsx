'use client';

import PlayerCard from '@/app/components/player-card';
import SelectionBar from '@/app/components/selection-bar';
import { useSelectionStore } from '@/lib/selection-store';
import type { PlayerCardData } from '@/lib/players-api';

type Props = { players: PlayerCardData[] };

export default function PlayersGridClient({ players }: Props) {
  const { selectedPlayers, togglePlayer } = useSelectionStore();

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-neutral-500 text-lg">No players found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-6">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isSelected={selectedPlayers.some((p) => p.id === player.id)}
            onToggle={() => togglePlayer(player)}
          />
        ))}
      </div>
      <SelectionBar />
    </>
  );
}
