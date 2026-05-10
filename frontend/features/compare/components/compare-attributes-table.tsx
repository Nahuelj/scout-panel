'use client';

import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PlayerDetail } from '@/features/players/types/player.types';
import {
  POSITION_FULL,
  formatCardIntervalGames,
} from '@/features/players/utils/player-stats-metadata';
import { getSlotColor } from '@/lib/compare-colors';

const TOOLTIP_SKILLFUL_PASS =
  'How consistently the player completes passes with their dominant foot. HIGH (8+) means 80%+ pass completion — reliable in tight spaces and under pressure. Derived from season stats, not a manual scout mark.';
const TOOLTIP_SKILLFUL_SHOT =
  'How accurate the player is when shooting with their dominant foot. HIGH (8+) means 80%+ shots on target — a reliable finisher. Derived from season shot accuracy stats.';
const TOOLTIP_WEAK_PASS =
  'How reliable the player is when passing with their weaker foot. HIGH means they can use both feet almost interchangeably, making them much harder to press and defend. LOW indicates a clear exploitable side.';
const TOOLTIP_WEAK_SHOT =
  'How dangerous the player is when shooting with their weaker foot. HIGH means defenders cannot simply force them onto the "bad" foot — they are a genuine two-footed goal threat.';

function scoreLabel(value: number | null): string {
  if (value === null) return '';
  if (value >= 8) return 'HIGH';
  if (value >= 5) return 'MED';
  return 'LOW';
}

function scoreLabelColor(value: number | null): string {
  if (value === null) return 'text-neutral-400';
  if (value >= 8) return 'text-emerald-300';
  if (value >= 5) return 'text-amber-300';
  return 'text-rose-300';
}

function MouseFollowTooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = useCallback((e: React.MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <>
      <span
        className='inline-flex cursor-help'
        onPointerEnter={() => setVisible(true)}
        onPointerLeave={() => setVisible(false)}
        onPointerMove={onMove}
      >
        {children}
      </span>
      {visible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role='tooltip'
            className='fixed z-[200] max-w-[min(18rem,calc(100vw-1.5rem))] pointer-events-none rounded-lg border border-white/10 bg-[#1a2633] px-3 py-2 text-[11px] leading-snug text-neutral-200 shadow-xl animate-in fade-in duration-150'
            style={{ left: pos.x + 14, top: pos.y + 14 }}
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}

function FootRating({ score, tooltip }: { score: number; tooltip: string }) {
  return (
    <MouseFollowTooltip text={tooltip}>
      <span className='flex items-center gap-2 text-sm whitespace-nowrap leading-relaxed cursor-help'>
        <span className='tabular-nums font-semibold text-white'>
          {score.toFixed(1)}
        </span>
        <span className={`text-[11px] font-bold ${scoreLabelColor(score)}`}>
          {scoreLabel(score)}
        </span>
      </span>
    </MouseFollowTooltip>
  );
}

type AttributeRow = {
  label: string;
  render: (player: PlayerDetail) => React.ReactNode;
};

const ROWS: AttributeRow[] = [
  {
    label: 'Position',
    render: (p) => (
      <span className='flex items-center gap-2 text-sm text-white'>
        <span className='w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0' />
        {POSITION_FULL[p.position] ?? p.position}
      </span>
    ),
  },
  {
    label: 'Preferred foot',
    render: (p) => (
      <span className='text-sm text-white capitalize'>
        {p.preferredFoot?.toLowerCase() ?? '—'}
      </span>
    ),
  },
  {
    label: 'Height',
    render: (p) => (
      <span className='text-sm text-white'>
        {p.height !== null ? `${p.height} mts` : '—'}
      </span>
    ),
  },
  {
    label: 'Weight',
    render: (p) => (
      <span className='text-sm text-white'>
        {p.weight !== null ? `${p.weight} kg` : '—'}
      </span>
    ),
  },
  {
    label: 'Skillful pass',
    render: (p) => {
      const score = p.currentSeason?.stats?.skillfulFootPassScore ?? null;
      if (score === null)
        return <span className='text-sm text-neutral-500'>—</span>;
      return <FootRating score={score} tooltip={TOOLTIP_SKILLFUL_PASS} />;
    },
  },
  {
    label: 'Skillful shot',
    render: (p) => {
      const score = p.currentSeason?.stats?.skillfulFootShotScore ?? null;
      if (score === null)
        return <span className='text-sm text-neutral-500'>—</span>;
      return <FootRating score={score} tooltip={TOOLTIP_SKILLFUL_SHOT} />;
    },
  },
  {
    label: 'Weak foot pass',
    render: (p) => {
      const pct = p.currentSeason?.stats?.weakFootPassAccuracyPct ?? null;
      if (pct === null)
        return <span className='text-sm text-neutral-500'>—</span>;
      return <FootRating score={pct / 10} tooltip={TOOLTIP_WEAK_PASS} />;
    },
  },
  {
    label: 'Weak foot shot',
    render: (p) => {
      const pct = p.currentSeason?.stats?.weakFootShotAccuracyPct ?? null;
      if (pct === null)
        return <span className='text-sm text-neutral-500'>—</span>;
      return <FootRating score={pct / 10} tooltip={TOOLTIP_WEAK_SHOT} />;
    },
  },
  {
    label: 'Yellow cards',
    render: (p) => {
      const stats = p.currentSeason?.stats;
      const count = stats?.yellowCards ?? null;
      if (count === null)
        return <span className='text-sm text-neutral-500'>—</span>;
      return (
        <div className='flex flex-col gap-0.5'>
          <div className='flex items-center gap-2'>
            <span
              className='size-2 shrink-0 rounded-[2px] bg-amber-400/90'
              aria-hidden
            />
            <span className='tabular-nums font-bold text-white text-sm'>
              {count}
            </span>
          </div>
          <span className='text-[11px] tabular-nums text-neutral-400 leading-snug'>
            {stats?.matchesPerYellowCard != null
              ? formatCardIntervalGames(stats.matchesPerYellowCard)
              : 'No yellow cards'}
          </span>
        </div>
      );
    },
  },
  {
    label: 'Red cards',
    render: (p) => {
      const stats = p.currentSeason?.stats;
      const count = stats?.redCards ?? null;
      if (count === null)
        return <span className='text-sm text-neutral-500'>—</span>;
      return (
        <div className='flex flex-col gap-0.5'>
          <div className='flex items-center gap-2'>
            <span
              className='size-2 shrink-0 rounded-[2px] bg-red-500/90'
              aria-hidden
            />
            <span className='tabular-nums font-bold text-white text-sm'>
              {count}
            </span>
          </div>
          <span className='text-[11px] tabular-nums text-neutral-400 leading-snug'>
            {stats?.matchesPerRedCard != null
              ? formatCardIntervalGames(stats.matchesPerRedCard)
              : 'No red cards'}
          </span>
        </div>
      );
    },
  },
];

type Props = { players: PlayerDetail[] };

export default function CompareAttributesTable({ players }: Props) {
  const count = players.length;
  const gridCols =
    count === 2
      ? 'gap-x-3 grid-cols-[7rem_repeat(2,minmax(0,1fr))] md:grid-cols-[8rem_repeat(2,minmax(0,1fr))]'
      : 'gap-x-3 grid-cols-[7rem_repeat(3,minmax(8rem,1fr))] lg:grid-cols-[8rem_repeat(3,minmax(0,1fr))]';

  return (
    <>
      <div className='md:hidden rounded-2xl bg-[#0f1923] border border-white/5 overflow-hidden'>
        <div className='scrollbar-panel sticky top-0 z-[1] flex w-full items-center gap-2 overflow-x-auto border-b border-white/10 bg-[#0b121c] px-3 py-2.5'>
          {players.map((p, i) => {
            const slot = getSlotColor(i);
            return (
              <span
                key={`legend-${p.id}-${i}`}
                className='inline-flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs'
                style={{
                  color: slot.base,
                  backgroundColor: `${slot.base}1f`,
                }}
              >
                <span
                  className='size-1.5 shrink-0 rounded-full'
                  style={{ backgroundColor: slot.base }}
                  aria-hidden
                />
                <span className='truncate font-medium text-white'>{p.name}</span>
              </span>
            );
          })}
        </div>

        <div className='divide-y divide-white/5'>
          {ROWS.map((row) => (
            <div key={`m-${row.label}`} className='px-4 py-3'>
              <p className='text-[10px] uppercase tracking-widest font-semibold text-neutral-400'>
                {row.label}
              </p>
              <div className='mt-2 flex flex-col gap-1.5'>
                {players.map((p, i) => {
                  const slot = getSlotColor(i);
                  return (
                    <div
                      key={`m-${row.label}-${p.id}-${i}`}
                      className='flex items-center justify-between gap-3 rounded-lg px-3 py-2'
                      style={{ backgroundColor: `${slot.base}1f` }}
                    >
                      <span className='flex min-w-0 items-center gap-2'>
                        <span
                          className='size-1.5 shrink-0 rounded-full'
                          style={{ backgroundColor: slot.base }}
                          aria-hidden
                        />
                        <span className='truncate text-xs font-medium text-white'>
                          {p.name}
                        </span>
                      </span>
                      <span className='shrink-0 text-right'>{row.render(p)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='hidden md:block rounded-2xl bg-[#0f1923] border border-white/5 overflow-hidden'>
        <div className='scrollbar-panel overflow-x-auto'>
          <div className={`grid ${gridCols} border-b border-white/10`}>
            <div className='px-5 py-3 text-[10px] uppercase tracking-widest font-semibold text-neutral-400 bg-[#0b121c]'>
              Attribute
            </div>
            {players.map((p, i) => {
              const slot = getSlotColor(i);
              return (
                <div
                  key={`${p.id}-${i}`}
                  className='px-5 py-3 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2 transition-[background-color] duration-300'
                  style={{ color: slot.base, backgroundColor: `${slot.base}1f` }}
                >
                  <span
                    className='inline-block w-1.5 h-1.5 rounded-full flex-shrink-0'
                    style={{ backgroundColor: slot.base }}
                    aria-hidden
                  />
                  <span className='truncate text-white text-xs normal-case tracking-normal'>
                    {p.name}
                  </span>
                </div>
              );
            })}
          </div>

          {ROWS.map((row, idx) => (
            <div
              key={row.label}
              className={`grid ${gridCols} ${
                idx < ROWS.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <div className='px-5 py-4 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold flex items-center'>
                {row.label}
              </div>
              {players.map((p, i) => {
                const slot = getSlotColor(i);
                return (
                  <div
                    key={`${row.label}-${p.id}-${i}`}
                    className='px-5 py-4 min-w-0 flex items-center transition-[background-color] duration-300'
                    style={{ backgroundColor: `${slot.base}1f` }}
                  >
                    {row.render(p)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
