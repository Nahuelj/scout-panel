'use client';

import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PlayerDetail } from '@/lib/player-detail-api';
import { POSITION_FULL, formatCardIntervalGames } from '@/lib/player-stats-metadata';
import { getSlotColor } from '@/lib/compare-colors';

const TOOLTIP_SKILLFUL_PASS =
  'Rating = pass accuracy % ÷ 10 (same 0–10 scale as weak foot). Comes from season pass accuracy in stats, not a manual scout mark. HIGH ≥ 8, MED ≥ 5, LOW under 5.';
const TOOLTIP_SKILLFUL_SHOT =
  'Rating = shot accuracy % ÷ 10 from season stats. Not subjective. HIGH ≥ 8, MED ≥ 5, LOW under 5.';
const TOOLTIP_WEAK_PASS =
  'Rating = weak-foot pass accuracy % ÷ 10. Same formula and HIGH/MED/LOW bands as strong-foot display.';
const TOOLTIP_WEAK_SHOT =
  'Rating = weak-foot shot accuracy % ÷ 10. Same bands: HIGH ≥ 8, MED ≥ 5, LOW under 5.';

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
        className="inline-flex cursor-help"
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
            role="tooltip"
            className="fixed z-[200] max-w-[min(18rem,calc(100vw-1.5rem))] pointer-events-none rounded-lg border border-white/10 bg-[#1a2633] px-3 py-2 text-[11px] leading-snug text-neutral-200 shadow-xl"
            style={{ left: pos.x + 14, top: pos.y + 14 }}
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}

function FootRating({
  label,
  score,
  tooltip,
}: {
  label: string;
  score: number;
  tooltip: string;
}) {
  return (
    <MouseFollowTooltip text={tooltip}>
      <span className="flex items-center gap-2 text-sm whitespace-nowrap leading-relaxed">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
          {label}
        </span>
        <span className="tabular-nums font-semibold text-white">{score.toFixed(1)}</span>
        <span className={`text-[11px] font-bold ${scoreLabelColor(score)}`}>
          {scoreLabel(score)}
        </span>
      </span>
    </MouseFollowTooltip>
  );
}

function FootCell({ player }: { player: PlayerDetail }) {
  const stats = player.currentSeason?.stats;
  const skillPass = stats?.skillfulFootPassScore ?? null;
  const skillShot = stats?.skillfulFootShotScore ?? null;
  const weakPass =
    stats?.weakFootPassAccuracyPct != null ? stats.weakFootPassAccuracyPct / 10 : null;
  const weakShot =
    stats?.weakFootShotAccuracyPct != null ? stats.weakFootShotAccuracyPct / 10 : null;

  const hasAny =
    skillPass != null || skillShot != null || weakPass != null || weakShot != null;

  if (!hasAny) return <span className="text-sm text-neutral-500">—</span>;

  return (
    <div className="flex flex-col gap-3">
      {(skillPass != null || skillShot != null) && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            Skillful
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {skillPass != null && (
              <FootRating
                label="Pass"
                score={skillPass}
                tooltip={TOOLTIP_SKILLFUL_PASS}
              />
            )}
            {skillShot != null && (
              <FootRating
                label="Shot"
                score={skillShot}
                tooltip={TOOLTIP_SKILLFUL_SHOT}
              />
            )}
          </div>
        </div>
      )}
      {(weakPass != null || weakShot != null) && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            Weak foot
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {weakPass != null && (
              <FootRating label="Pass" score={weakPass} tooltip={TOOLTIP_WEAK_PASS} />
            )}
            {weakShot != null && (
              <FootRating label="Shot" score={weakShot} tooltip={TOOLTIP_WEAK_SHOT} />
            )}
          </div>
        </div>
      )}
    </div>
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
      <span className="flex items-center gap-2 text-sm text-white">
        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
        {POSITION_FULL[p.position] ?? p.position}
      </span>
    ),
  },
  {
    label: 'Preferred foot',
    render: (p) => (
      <span className="text-sm text-white capitalize">
        {p.preferredFoot?.toLowerCase() ?? '—'}
      </span>
    ),
  },
  {
    label: 'Height',
    render: (p) => (
      <span className="text-sm text-white">
        {p.height !== null ? `${p.height} mts` : '—'}
      </span>
    ),
  },
  {
    label: 'Weight',
    render: (p) => (
      <span className="text-sm text-white">
        {p.weight !== null ? `${p.weight} kg` : '—'}
      </span>
    ),
  },
  {
    label: 'Foot ratings',
    render: (p) => <FootCell player={p} />,
  },
  {
    label: 'Yellow cards',
    render: (p) => {
      const stats = p.currentSeason?.stats;
      const count = stats?.yellowCards ?? null;
      if (count === null) return <span className="text-sm text-neutral-500">—</span>;
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-[2px] bg-amber-400/90" aria-hidden />
            <span className="tabular-nums font-bold text-white text-sm">{count}</span>
          </div>
          <span className="text-[11px] tabular-nums text-neutral-400 leading-snug">
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
      if (count === null) return <span className="text-sm text-neutral-500">—</span>;
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-[2px] bg-red-500/90" aria-hidden />
            <span className="tabular-nums font-bold text-white text-sm">{count}</span>
          </div>
          <span className="text-[11px] tabular-nums text-neutral-400 leading-snug">
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
      ? 'grid-cols-[8rem_repeat(2,minmax(0,1fr))]'
      : 'grid-cols-[8rem_repeat(3,minmax(0,1fr))]';

  return (
    <div className="rounded-2xl bg-[#0f1923] border border-white/5 overflow-hidden">
      <div className={`grid ${gridCols} border-b border-white/10`}>
        <div className="px-5 py-3 text-[10px] uppercase tracking-widest font-semibold text-neutral-400 bg-[#0b121c]">
          Attribute
        </div>
        {players.map((p, i) => {
          const slot = getSlotColor(i);
          return (
            <div
              key={p.id}
              className="px-5 py-3 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2"
              style={{ color: slot.base, backgroundColor: `${slot.base}1f` }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: slot.base }}
                aria-hidden
              />
              <span className="truncate text-white text-xs normal-case tracking-normal">
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
          <div className="px-5 py-4 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold flex items-center">
            {row.label}
          </div>
          {players.map((p, i) => {
            const slot = getSlotColor(i);
            return (
              <div
                key={p.id}
                className="px-5 py-4 min-w-0 flex items-center"
                style={{ backgroundColor: `${slot.base}1f` }}
              >
                {row.render(p)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
