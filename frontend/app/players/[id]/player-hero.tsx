'use client';

import Image from 'next/image';
import { Bookmark } from 'lucide-react';
import type { RefObject } from 'react';
import type { PlayerDetail } from '@/lib/player-detail-api';
import { getSlotColor } from '@/lib/compare-colors';

function calcAge(birthDate: string): number {
  return Math.floor(
    (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

type Props = {
  player: PlayerDetail;
  nameAnchorRef?: RefObject<HTMLHeadingElement | null>;
};

export default function PlayerHero({ player, nameAnchorRef }: Props) {
  const age = player.birthDate ? calcAge(player.birthDate) : null;
  const stats = player.currentSeason?.stats;
  const accent = getSlotColor(0).base;

  return (
    <div className="relative flex min-h-0 min-w-0 flex-col rounded-b-2xl rounded-t-none border border-white/5 bg-[#0f1923] overflow-hidden lg:h-full">
      <div
        className="h-0.5 w-full shrink-0"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <div className="relative flex min-h-0 flex-1 items-center px-6 py-5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none" />

        <div className="relative flex w-full max-w-4xl items-center gap-5">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0 ring-2 ring-white/5">
            {player.photoUrl ? (
              <Image
                src={player.photoUrl}
                alt={player.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-500">
                ?
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {(player.nationality || player.currentSeason) && (
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-1">
                <div className="min-w-0">
                  {player.nationality && (
                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                      Nationality: {player.nationality}
                    </p>
                  )}
                </div>
                {player.currentSeason && (
                  <span className="text-neutral-500 text-xs uppercase tracking-widest shrink-0 text-right">
                    Season {player.currentSeason.season.name}
                  </span>
                )}
              </div>
            )}
            <h1
              ref={nameAnchorRef}
              className="text-white font-bold text-3xl leading-tight mb-2"
            >
              {player.name}
            </h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-snug text-neutral-400">
                <span>{player.position}</span>
                {age !== null && (
                  <>
                    <span className="text-white/20">•</span>
                    <span>{age} years</span>
                  </>
                )}
                {stats?.matchesPlayed !== undefined && (
                  <>
                    <span className="text-white/20">•</span>
                    <span>{stats.matchesPlayed} official matches</span>
                  </>
                )}
                {stats?.minutesPlayed !== undefined && (
                  <>
                    <span className="text-white/20">•</span>
                    <span>{stats.minutesPlayed} min played</span>
                  </>
                )}
              </div>
              <button
                type="button"
                aria-label="Save player"
                className="group inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-sm font-medium text-neutral-400 outline-none transition-all duration-200 hover:border-white/[0.13] hover:bg-white/[0.05] hover:text-neutral-200 focus-visible:border-emerald-500/35 focus-visible:ring-2 focus-visible:ring-emerald-500/25 max-sm:self-end"
              >
                <Bookmark
                  className="size-[15px] shrink-0 text-neutral-500 transition-colors group-hover:text-neutral-200"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="hidden text-[11px] font-bold uppercase tracking-widest sm:inline-flex sm:items-center leading-none">
                  Save
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
