'use client';

import type { MouseEvent, RefObject } from 'react';
import { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bookmark, X } from 'lucide-react';
import type { PlayerDetail } from '@/features/players/types/player.types';
import { getSlotColor } from '@/lib/compare-colors';
import { useSession } from '@/features/auth/lib/auth-client';
import {
  useShortlistIds,
  useAddToShortlist,
  useRemoveFromShortlist,
} from '@/features/shortlist';

function calcAge(birthDate: string): number {
  return Math.floor(
    (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

type CardProps = {
  player: PlayerDetail;
  index: number;
  allIds: string[];
  isShortlisted: boolean;
  canShortlist: boolean;
  shortlistBusy: boolean;
  onShortlistClick: (e: MouseEvent) => void;
};

function HeaderCard({
  player,
  index,
  allIds,
  isShortlisted,
  canShortlist,
  shortlistBusy,
  onShortlistClick,
}: CardProps) {
  const router = useRouter();
  const slot = getSlotColor(index);
  const age = player.birthDate ? calcAge(player.birthDate) : null;
  const club = player.currentSeason?.club;

  const handleRemove = () => {
    const remaining = allIds.filter((id) => id !== player.id);
    if (remaining.length === 0) {
      router.push('/players');
      return;
    }
    const encoded = remaining.map((x) => encodeURIComponent(x)).join(',');
    router.push(`/compare?ids=${encoded}`);
  };

  return (
    <div className="relative flex min-w-0 flex-col rounded-b-2xl rounded-t-none border border-white/5 bg-[#0f1923] overflow-hidden">
      <div
        className="h-1 w-full"
        style={{ backgroundColor: slot.base }}
        aria-hidden
      />

      <div className="absolute right-2 top-3 z-10 flex items-center gap-1.5">
        <button
          type="button"
          disabled={!canShortlist || shortlistBusy}
          onClick={onShortlistClick}
          aria-label={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
          title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
          className={`group inline-flex size-8 items-center justify-center rounded-lg border outline-none transition-all duration-200 focus-visible:border-sky-500/40 focus-visible:ring-2 focus-visible:ring-sky-500/25 disabled:pointer-events-none disabled:opacity-40 ${
            isShortlisted
              ? 'border-sky-500/50 bg-sky-500/15 text-sky-300'
              : 'border-white/15 bg-[#0f1923]/90 text-neutral-500 hover:border-sky-500/25 hover:text-sky-200/90'
          }`}
        >
          <Bookmark
            className={`size-[15px] shrink-0 ${isShortlisted ? 'fill-sky-400/40' : ''}`}
            strokeWidth={1.75}
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={handleRemove}
          aria-label={`Remove ${player.name} from comparison`}
          title="Remove from comparison"
          className="inline-flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-neutral-400 outline-none transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/[0.08] hover:text-red-300 focus-visible:border-red-500/40 focus-visible:ring-2 focus-visible:ring-red-500/25"
        >
          <X className="size-[15px] shrink-0" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 pr-20 sm:gap-4 sm:px-5 sm:py-4 sm:pr-24">
        <div
          className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0 ring-2"
          style={{ boxShadow: `0 0 0 2px ${slot.base}40` }}
        >
          {player.photoUrl ? (
            <Image
              src={player.photoUrl}
              alt={player.name}
              fill
              className="object-cover"
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-neutral-500">
              ?
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: slot.base }}
              aria-hidden
            />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: slot.base }}
            >
              Player {index + 1}
            </span>
          </div>
          <h2 className="text-white font-bold text-base sm:text-lg leading-tight truncate">
            {player.name}
          </h2>
          <p className="text-neutral-400 text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>{player.position}</span>
            {age !== null && (
              <>
                <span className="text-white/20">•</span>
                <span>{age} years</span>
              </>
            )}
            {player.nationality && (
              <>
                <span className="text-white/20">•</span>
                <span>{player.nationality}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 px-4 sm:px-5 pb-4 border-t border-white/5 pt-3 min-h-[3.25rem]">
        {club ? (
          <>
            <div className="relative w-7 h-7 rounded-md bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
              {club.logoUrl ? (
                <Image
                  src={club.logoUrl}
                  alt={club.name}
                  fill
                  className="object-contain p-1"
                  sizes="28px"
                  unoptimized
                />
              ) : (
                <span className="text-[10px] text-neutral-500">
                  {club.shortName ?? club.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{club.name}</p>
              {player.currentSeason?.season?.name && (
                <p className="text-neutral-500 text-[10px] uppercase tracking-widest truncate">
                  Season {player.currentSeason.season.name}
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-neutral-600 text-xs">No active season</p>
        )}
      </div>
    </div>
  );
}

type Props = {
  players: PlayerDetail[];
  nameAnchorRef?: RefObject<HTMLDivElement | null>;
  initialShortlistedIds: string[];
};

export default function CompareHeaders({
  players,
  nameAnchorRef,
  initialShortlistedIds,
}: Props) {
  const { data: session } = useSession();
  const canShortlist = Boolean(session?.user);

  const { data: shortlistIdsData } = useShortlistIds({
    enabled: canShortlist,
    initialData: initialShortlistedIds,
  });
  const shortlistIds = useMemo(
    () => new Set(shortlistIdsData ?? initialShortlistedIds),
    [shortlistIdsData, initialShortlistedIds],
  );

  const addMutation = useAddToShortlist();
  const removeMutation = useRemoveFromShortlist();
  const busyId = addMutation.isPending
    ? (addMutation.variables ?? null)
    : removeMutation.isPending
      ? (removeMutation.variables ?? null)
      : null;

  const handleShortlistClick = useCallback(
    (player: PlayerDetail, e: MouseEvent) => {
      e.preventDefault();
      if (!canShortlist || busyId) return;
      if (shortlistIds.has(player.id)) {
        removeMutation.mutate(player.id);
      } else {
        addMutation.mutate(player.id);
      }
    },
    [busyId, canShortlist, shortlistIds, addMutation, removeMutation],
  );

  const count = players.length;
  const allIds = players.map((p) => p.id);

  const gridClass =
    count === 2
      ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
      : 'grid grid-cols-1 gap-3 lg:grid-cols-3';

  return (
    <div ref={nameAnchorRef} className="space-y-3">
      <div className={gridClass}>
        {players.map((player, i) => (
          <HeaderCard
            key={`${player.id}-${i}`}
            player={player}
            index={i}
            allIds={allIds}
            isShortlisted={shortlistIds.has(player.id)}
            canShortlist={canShortlist}
            shortlistBusy={busyId === player.id}
            onShortlistClick={(e) => handleShortlistClick(player, e)}
          />
        ))}
      </div>
    </div>
  );
}
