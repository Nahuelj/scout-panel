'use client';

import Image from 'next/image';
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

type Props = {
  player: PlayerCardData;
  isSelected: boolean;
  onToggle: () => void;
};

export default function PlayerCard({ player, isSelected, onToggle }: Props) {
  const posGroup = POSITION_LABEL[player.position] ?? player.position;
  const posColor = POSITION_COLOR[posGroup] ?? 'bg-neutral-600 text-white';
  const flag = player.nationality ? (FLAG_BY_NATIONALITY[player.nationality] ?? '🏳️') : null;
  const age = player.birthDate ? calcAge(player.birthDate) : null;
  const stats = player.currentSeason?.stats;

  return (
    <div
      onClick={onToggle}
      className={`relative flex flex-col items-center rounded-2xl bg-[#0f1923] border p-5 gap-3 cursor-pointer transition-colors group ${
        isSelected
          ? 'border-emerald-500/60 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]'
          : 'border-white/5 hover:border-white/15'
      }`}
    >
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

      <div className="flex flex-col items-center gap-1.5 w-full">
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
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide text-center">
            {player.currentSeason.club}
            {age !== null && <span className="text-neutral-500"> • {age} YRS</span>}
          </p>
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
