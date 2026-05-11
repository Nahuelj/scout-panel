'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/features/auth/hooks/use-session';
import { PlayerCard, type PlayerCardData } from '@/features/players';
import { useSelectionStore } from '@/stores/selection-store';
import { useRemoveFromShortlist } from '@/features/shortlist/hooks/use-shortlist-mutations';

type Props = { players: PlayerCardData[]; initialCanShortlist: boolean };

export default function ShortlistGridClient({ players, initialCanShortlist }: Props) {
  const router = useRouter();
  const { selectedPlayers, togglePlayer } = useSelectionStore();
  const { data: session, isPending } = useSession();
  const canShortlist = useMemo(() => {
    if (isPending) return initialCanShortlist;
    return Boolean(session?.user);
  }, [initialCanShortlist, isPending, session?.user]);

  const removeMutation = useRemoveFromShortlist();

  const handleShortlistToggle = useCallback(
    (player: PlayerCardData, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canShortlist) return;
      removeMutation.mutate(player.id, {
        onSettled: () => router.refresh(),
      });
    },
    [canShortlist, router, removeMutation],
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
      {players.map((player, index) => (
        <PlayerCard
          key={player.id}
          player={player}
          isSelected={selectedPlayers.some((p) => p.id === player.id)}
          onToggle={() => togglePlayer(player)}
          visualVariant="shortlist"
          priorityPhoto={index === 0}
          isShortlisted
          onShortlistToggle={
            canShortlist ? (e) => handleShortlistToggle(player, e) : undefined
          }
        />
      ))}
    </div>
  );
}
