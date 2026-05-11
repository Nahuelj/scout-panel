'use client';

import { useCallback, useMemo } from 'react';
import { useSession } from '@/features/auth/hooks/use-session';
import PlayerCard from '@/features/players/components/list/player-card';
import { useSelectionStore } from '@/stores/selection-store';
import type { PlayerCardData } from '@/features/players/types/player.types';
import {
  useShortlistIds,
  useAddToShortlist,
  useRemoveFromShortlist,
} from '@/features/shortlist';

const EMPTY_SHORTLIST_IDS: string[] = [];

type Props = {
  players: PlayerCardData[];
  initialShortlistIds: string[];
  initialCanShortlist: boolean;
};

export default function PlayersGridClient({
  players,
  initialShortlistIds,
  initialCanShortlist,
}: Props) {
  const { selectedPlayers, togglePlayer } = useSelectionStore();
  const { data: session, isPending } = useSession();
  const canShortlist = useMemo(() => {
    if (isPending) return initialCanShortlist;
    return Boolean(session?.user);
  }, [initialCanShortlist, isPending, session?.user]);

  const { data: shortlistIds = EMPTY_SHORTLIST_IDS } = useShortlistIds({
    enabled: canShortlist,
    initialData: initialShortlistIds,
  });

  const idsForUi = useMemo(
    () => new Set(canShortlist ? shortlistIds : EMPTY_SHORTLIST_IDS),
    [canShortlist, shortlistIds],
  );

  const addMutation = useAddToShortlist();
  const removeMutation = useRemoveFromShortlist();

  const handleShortlistToggle = useCallback(
    (player: PlayerCardData, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canShortlist) return;
      if (idsForUi.has(player.id)) {
        removeMutation.mutate(player.id);
      } else {
        addMutation.mutate(player.id);
      }
    },
    [canShortlist, idsForUi, addMutation, removeMutation],
  );

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center px-4">
        <p className="text-neutral-500 text-lg">No players found</p>
        <p className="max-w-md text-sm text-neutral-600">
          Try clearing your filters and searching again.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in duration-700 ease-out">
      {players.map((player, index) => (
        <PlayerCard
          key={player.id}
          player={player}
          isSelected={selectedPlayers.some((p) => p.id === player.id)}
          onToggle={() => togglePlayer(player)}
          priorityPhoto={index === 0}
          isShortlisted={idsForUi.has(player.id)}
          onShortlistToggle={
            canShortlist ? (e) => handleShortlistToggle(player, e) : undefined
          }
        />
      ))}
    </div>
  );
}
