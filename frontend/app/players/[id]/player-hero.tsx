'use client';

import Image from 'next/image';
import { Bookmark } from 'lucide-react';
import type { RefObject } from 'react';
import type { PlayerDetail } from '@/lib/player-detail-api';

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

  return (
    <div className="relative rounded-2xl bg-[#0f1923] border border-white/5 px-6 py-5 overflow-hidden flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none" />

      <div className="relative mx-auto flex w-full max-w-4xl items-center gap-5">
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
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-400 text-sm min-w-0">
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
              className="shrink-0 rounded-lg border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 p-2 transition-colors self-center"
            >
              <Bookmark size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
