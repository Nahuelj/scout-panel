'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Bookmark } from 'lucide-react';
import type { RefObject } from 'react';
import type { PlayerDetail } from '@/lib/player-detail-api';
import { getSlotColor } from '@/lib/compare-colors';
import { useSession } from '@/lib/auth-client';
import { addToShortlist, removeFromShortlist } from '@/lib/shortlist-api';

function calcAge(birthDate: string): number {
  return Math.floor(
    (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

const PLAYER_HERO_STATS_BREAKPOINT_PX = 500;

type Props = {
  player: PlayerDetail;
  nameAnchorRef?: RefObject<HTMLHeadingElement | null>;
  initialShortlisted: boolean;
};

export default function PlayerHero({
  player,
  nameAnchorRef,
  initialShortlisted,
}: Props) {
  const { data: session } = useSession();
  const [shortlisted, setShortlisted] = useState(initialShortlisted);
  const [busy, setBusy] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect?.width ?? 0;
      setIsNarrow(w > 0 && w < PLAYER_HERO_STATS_BREAKPOINT_PX);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const age = player.birthDate ? calcAge(player.birthDate) : null;
  const stats = player.currentSeason?.stats;
  const seasonName = player.currentSeason?.season.name;
  const accent = getSlotColor(0).base;

  return (
    <div
      ref={rootRef}
      className="relative flex min-h-0 min-w-0 flex-col rounded-b-2xl rounded-t-none border border-white/5 bg-[#0f1923] overflow-hidden lg:h-full"
    >
      <div className="h-1 w-full shrink-0" style={{ backgroundColor: accent }} aria-hidden />
      <div className="relative flex min-h-0 flex-1 flex-col justify-center px-4 py-5 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none" />

        <div className="relative w-full max-w-4xl">
          <div className="flex flex-row items-center gap-3 sm:gap-5">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-neutral-800 ring-2 ring-white/5 sm:size-20">
              {player.photoUrl ? (
                <Image
                  src={player.photoUrl}
                  alt={player.name}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl text-neutral-500">
                  ?
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {(player.nationality || (seasonName && !isNarrow)) && (
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-0.5 mb-1">
                <div className="min-w-0">
                  {player.nationality && (
                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                      Nationality: {player.nationality}
                    </p>
                  )}
                </div>
                {seasonName && !isNarrow && (
                  <span className="text-neutral-500 text-[10px] uppercase tracking-widest shrink-0 text-right">
                    Season {seasonName}
                  </span>
                )}
              </div>
            )}
            <h1
              ref={nameAnchorRef}
              className="mb-1.5 text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl"
            >
              {player.name}
            </h1>
            <div className="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
              {isNarrow && seasonName ? (
                <p className="min-w-0 flex-1 truncate text-xs uppercase tracking-widest text-neutral-500">
                  Season {seasonName}
                </p>
              ) : (
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs leading-snug text-neutral-400">
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
              )}
              <button
                type="button"
                disabled={!session?.user || busy}
                aria-label={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                onClick={() => {
                  if (!session?.user || busy) return;
                  const previous = shortlisted;
                  setBusy(true);
                  void (async () => {
                    try {
                      if (shortlisted) {
                        await removeFromShortlist(player.id);
                        setShortlisted(false);
                      } else {
                        await addToShortlist(player.id);
                        setShortlisted(true);
                      }
                    } catch {
                      setShortlisted(previous);
                    } finally {
                      setBusy(false);
                    }
                  })();
                }}
                className={`group inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium outline-none transition-all duration-200 focus-visible:border-sky-500/40 focus-visible:ring-2 focus-visible:ring-sky-500/25 disabled:pointer-events-none disabled:opacity-40 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm ${
                  shortlisted
                    ? 'border-sky-500/35 bg-sky-500/[0.08] text-sky-200 hover:border-sky-500/45 hover:bg-sky-500/[0.12]'
                    : 'border-white/[0.08] bg-white/[0.025] text-neutral-400 hover:border-sky-500/25 hover:bg-sky-500/[0.06] hover:text-sky-200/90'
                }`}
              >
                <Bookmark
                  className={`size-[14px] shrink-0 transition-colors group-hover:text-sky-200 sm:size-[15px] ${
                    shortlisted ? 'fill-sky-400/35 text-sky-300' : 'text-neutral-500 group-hover:text-sky-300'
                  }`}
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="hidden text-[11px] font-bold uppercase tracking-widest sm:inline-flex sm:items-center leading-none">
                  {shortlisted ? 'Shortlisted' : 'Shortlist'}
                </span>
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
