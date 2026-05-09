'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { PlayerCardData } from '@/lib/players-api';

const POSITION_LABEL: Record<string, string> = {
  GK: 'GK',
  RB: 'DEF', LB: 'DEF', RWB: 'DEF', LWB: 'DEF', CB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', RM: 'MID', LM: 'MID',
  RW: 'FWD', LW: 'FWD', ST: 'FWD', CF: 'FWD', SS: 'FWD',
};

const POSITION_COLOR: Record<string, string> = {
  GK: 'bg-blue-500 text-white',
  DEF: 'bg-teal-500 text-white',
  MID: 'bg-sky-500 text-white',
  FWD: 'bg-amber-500 text-black',
};

const FLAG_BY_NATIONALITY: Record<string, string> = {
  Argentina: '🇦🇷',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Brazil: '🇧🇷',
  France: '🇫🇷',
  Spain: '🇪🇸',
  Germany: '🇩🇪',
  Italy: '🇮🇹',
  Portugal: '🇵🇹',
  Netherlands: '🇳🇱',
  Uruguay: '🇺🇾',
  Colombia: '🇨🇴',
  Chile: '🇨🇱',
  Mexico: '🇲🇽',
};

function calcAge(birthDate: string): number {
  return Math.floor(
    (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

export type PlayerCardBehavior = 'compare' | 'openDetail';

export type PlayerCardVisualVariant = 'default' | 'shortlist';

type Props = {
  player: PlayerCardData;
  isSelected: boolean;
  onToggle: () => void;
  cardBehavior?: PlayerCardBehavior;
  visualVariant?: PlayerCardVisualVariant;
  isShortlisted?: boolean;
  onShortlistToggle?: (e: MouseEvent) => void;
};

export default function PlayerCard({
  player,
  isSelected,
  onToggle,
  cardBehavior = 'compare',
  visualVariant = 'default',
  isShortlisted = false,
  onShortlistToggle,
}: Props) {
  const router = useRouter();
  const posGroup = POSITION_LABEL[player.position] ?? player.position;
  const posColor = POSITION_COLOR[posGroup] ?? 'bg-neutral-600 text-white';
  const flag = player.nationality ? (FLAG_BY_NATIONALITY[player.nationality] ?? '🏳️') : null;
  const age = player.birthDate ? calcAge(player.birthDate) : null;
  const stats = player.currentSeason?.stats;
  const isShortlistVisual = visualVariant === 'shortlist';

  const handleCardClick = () => {
    if (cardBehavior === 'openDetail') {
      router.push(`/players/${player.id}`);
      return;
    }
    onToggle();
  };

  const cardBorderClass =
    cardBehavior === 'compare' && isSelected
      ? 'border-emerald-500/60 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]'
      : isShortlistVisual
        ? 'border-sky-500/25 hover:border-sky-400/45'
        : 'border-white/5 hover:border-white/15';

  const cardBgClass = isShortlistVisual
    ? 'bg-[radial-gradient(ellipse_115%_90%_at_50%_-18%,rgba(125,211,252,0.28),rgba(56,189,248,0.12)_38%,rgba(30,58,138,0.08)_55%,transparent_72%),radial-gradient(ellipse_95%_75%_at_100%_85%,rgba(96,165,250,0.18),transparent_58%),linear-gradient(165deg,rgb(18,32,52)_0%,rgb(14,26,44)_45%,rgb(12,22,40)_100%)]'
    : 'bg-[#0f1923]';

  return (
    <div
      onClick={handleCardClick}
      className={`relative flex min-w-0 flex-col items-center overflow-hidden rounded-2xl border p-5 gap-3 cursor-pointer transition-colors group ${cardBgClass} ${cardBorderClass}`}
    >
      {onShortlistToggle ? (
        <button
          type="button"
          aria-label={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
          onClick={(e) => {
            e.stopPropagation();
            onShortlistToggle(e);
          }}
          className={`absolute top-4 left-4 z-[1] inline-flex size-8 items-center justify-center rounded-lg border outline-none transition-all duration-200 focus-visible:border-sky-500/40 focus-visible:ring-2 focus-visible:ring-sky-500/25 ${
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
      ) : null}

      {cardBehavior === 'compare' ? (
        <div
          className={`absolute top-4 right-4 w-5 h-5 rounded flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-emerald-500 border-emerald-500'
              : 'border border-white/20 group-hover:border-white/40'
          }`}
        >
          {isSelected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      ) : null}

      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
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

      <div className="flex min-w-0 flex-col items-center gap-1.5 w-full">
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${posColor}`}>
          {posGroup}
        </span>

        <h3 className="text-white font-bold text-base leading-tight text-center line-clamp-1">
          {player.name}
        </h3>

        {(flag || player.nationality) && (
          <p className="text-neutral-400 text-xs flex items-center gap-1">
            {flag && <span>{flag}</span>}
            <span>{player.nationality}</span>
          </p>
        )}

        {player.currentSeason && (
          <div className="flex w-full min-w-0 items-center justify-center gap-1.5">
            {player.currentSeason.clubLogoUrl ? (
              <span className="relative h-5 w-5 flex-shrink-0 overflow-hidden rounded bg-neutral-800">
                <Image
                  src={player.currentSeason.clubLogoUrl}
                  alt=""
                  fill
                  className="object-contain p-0.5"
                  sizes="20px"
                  unoptimized
                  aria-hidden
                />
              </span>
            ) : null}
            <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
              <span className="min-w-0 flex-1 truncate text-emerald-400 text-xs font-semibold uppercase tracking-wide">
                {player.currentSeason.club}
              </span>
              {age !== null && (
                <span className="flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  • {age} YRS
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {stats && (
        <>
          <div className="w-full h-px bg-white/5" />
          <div className="grid grid-cols-3 w-full text-center gap-2">
            <div>
              <p className="text-neutral-500 text-[10px] uppercase tracking-wider">GLS</p>
              <p className="text-white font-bold text-base">{stats.goals}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-[10px] uppercase tracking-wider">AST</p>
              <p className="text-white font-bold text-base">{stats.assists}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-[10px] uppercase tracking-wider">XG</p>
              <p className="text-emerald-400 font-bold text-base">
                {stats.xGPer90 !== null && stats.xGPer90 !== undefined
                  ? stats.xGPer90.toFixed(2)
                  : '—'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
