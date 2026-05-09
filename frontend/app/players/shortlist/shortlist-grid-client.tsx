'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import PlayerCard from '@/app/components/player-card';
import { useSelectionStore } from '@/lib/selection-store';
import type { PlayerCardData } from '@/lib/players-api';
import { removeFromShortlist } from '@/lib/shortlist-api';

type Props = { players: PlayerCardData[]; initialCanShortlist: boolean };

export default function ShortlistGridClient({ players, initialCanShortlist }: Props) {
  const router = useRouter();
  const { selectedPlayers, togglePlayer } = useSelectionStore();
  const { data: session, isPending } = useSession();
  const canShortlist = useMemo(() => {
    if (isPending) return initialCanShortlist;
    return Boolean(session?.user);
  }, [initialCanShortlist, isPending, session?.user]);

  const handleShortlistToggle = useCallback(
    async (player: PlayerCardData, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canShortlist) return;
      try {
        await removeFromShortlist(player.id);
        router.refresh();
      } catch {
        router.refresh();
      }
    },
    [canShortlist, router],
  );

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-neutral-500 text-lg">Your shortlist is empty</p>
        <p className="mt-2 text-sm text-neutral-600">
          Add players from the list or a player profile.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in duration-700 ease-out">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isSelected={selectedPlayers.some((p) => p.id === player.id)}
          onToggle={() => togglePlayer(player)}
          visualVariant="shortlist"
          isShortlisted
          onShortlistToggle={
            canShortlist ? (e) => void handleShortlistToggle(player, e) : undefined
          }
        />
      ))}
    </div>
  );
}
