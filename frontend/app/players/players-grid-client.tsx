'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import PlayerCard from '@/app/components/player-card';
import { useSelectionStore } from '@/lib/selection-store';
import type { PlayerCardData } from '@/lib/players-api';
import {
  addToShortlist,
  fetchShortlistPlayerIds,
  removeFromShortlist,
} from '@/lib/shortlist-api';

const EMPTY_SHORTLIST_IDS = new Set<string>();

type Props = { players: PlayerCardData[] };

export default function PlayersGridClient({ players }: Props) {
  const { selectedPlayers, togglePlayer } = useSelectionStore();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(() => false);
  const [shortlistIds, setShortlistIds] = useState<Set<string>>(() => new Set());
  const canShortlist = mounted && Boolean(session?.user);
  const idsForUi = useMemo(
    () => (canShortlist ? shortlistIds : EMPTY_SHORTLIST_IDS),
    [canShortlist, shortlistIds],
  );

  useEffect(() => {
    // Defer showing shortlist controls until after hydration to avoid server/client markup drift.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!canShortlist) return;
    let cancelled = false;
    fetchShortlistPlayerIds()
      .then((ids) => {
        if (!cancelled) setShortlistIds(new Set(ids));
      })
      .catch(() => {
        if (!cancelled) setShortlistIds(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [canShortlist]);

  const handleShortlistToggle = useCallback(
    async (player: PlayerCardData, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canShortlist) return;
      const on = idsForUi.has(player.id);
      try {
        if (on) {
          await removeFromShortlist(player.id);
          setShortlistIds((prev) => {
            const next = new Set(prev);
            next.delete(player.id);
            return next;
          });
        } else {
          await addToShortlist(player.id);
          setShortlistIds((prev) => new Set(prev).add(player.id));
        }
      } catch {
        const ids = await fetchShortlistPlayerIds().catch(() => [] as string[]);
        setShortlistIds(new Set(ids));
      }
    },
    [canShortlist, idsForUi],
  );

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-neutral-500 text-lg">No players found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-6">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isSelected={selectedPlayers.some((p) => p.id === player.id)}
          onToggle={() => togglePlayer(player)}
          isShortlisted={idsForUi.has(player.id)}
          onShortlistToggle={
            canShortlist ? (e) => void handleShortlistToggle(player, e) : undefined
          }
        />
      ))}
    </div>
  );
}
