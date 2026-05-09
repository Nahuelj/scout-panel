'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [shortlistIds, setShortlistIds] = useState<Set<string>>(
    () => new Set(initialShortlistIds),
  );
  const serverShortlistKey = [...initialShortlistIds].sort().join('|');
  const prevServerShortlistKey = useRef<string | null>(null);

  const idsForUi = useMemo(
    () => (canShortlist ? shortlistIds : EMPTY_SHORTLIST_IDS),
    [canShortlist, shortlistIds],
  );

  useEffect(() => {
    if (prevServerShortlistKey.current === null) {
      prevServerShortlistKey.current = serverShortlistKey;
      return;
    }
    if (prevServerShortlistKey.current === serverShortlistKey) return;
    prevServerShortlistKey.current = serverShortlistKey;
    setShortlistIds(new Set(initialShortlistIds));
  }, [initialShortlistIds, serverShortlistKey]);

  useEffect(() => {
    if (!canShortlist) return;
    let cancelled = false;
    fetchShortlistPlayerIds()
      .then((ids) => {
        if (cancelled) return;
        setShortlistIds((prev) => {
          const next = new Set(ids);
          if (prev.size !== next.size) return next;
          for (const id of prev) {
            if (!next.has(id)) return next;
          }
          return prev;
        });
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
