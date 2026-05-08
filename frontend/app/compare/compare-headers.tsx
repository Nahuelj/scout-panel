'use client';

import type { RefObject } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bookmark, X } from 'lucide-react';
import type { PlayerDetail } from '@/lib/player-detail-api';
import { getSlotColor } from '@/lib/compare-colors';

function calcAge(birthDate: string): number {
  return Math.floor(
    (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

type CardProps = {
  player: PlayerDetail;
  index: number;
  allIds: string[];
};

function HeaderCard({ player, index, allIds }: CardProps) {
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

  const handleSave = () => {
    // TODO: wire up save player
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
          onClick={handleSave}
          aria-label={`Save ${player.name}`}
          title="Save player"
          className="group inline-flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-neutral-400 outline-none transition-all duration-200 hover:border-white/[0.13] hover:bg-white/[0.05] hover:text-neutral-200 focus-visible:border-emerald-500/35 focus-visible:ring-2 focus-visible:ring-emerald-500/25"
        >
          <Bookmark
            className="size-[15px] shrink-0 text-neutral-500 transition-colors group-hover:text-neutral-200"
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

      <div className="flex items-center gap-4 px-5 py-4 pr-24">
        <div
          className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0 ring-2"
          style={{ boxShadow: `0 0 0 2px ${slot.base}40` }}
        >
          {player.photoUrl ? (
            <Image
              src={player.photoUrl}
              alt={player.name}
              fill
              className="object-cover"
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
          <h2 className="text-white font-bold text-lg leading-tight truncate">
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

      <div className="flex items-center gap-2.5 px-5 pb-4 border-t border-white/5 pt-3 min-h-[3.25rem]">
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
};

export default function CompareHeaders({ players, nameAnchorRef }: Props) {
  const count = players.length;
  const allIds = players.map((p) => p.id);

  return (
    <div ref={nameAnchorRef} className="space-y-3">
      <div
        className={`grid gap-3 ${
          count === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {players.map((player, i) => (
          <HeaderCard key={player.id} player={player} index={i} allIds={allIds} />
        ))}
      </div>
    </div>
  );
}
