'use client';

import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PlayerDetail } from '@/lib/player-detail-api';
import { POSITION_FULL } from '@/lib/player-stats-metadata';

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

type StatItemProps = {
  label: string;
  children: React.ReactNode;
};

function StatItem({ label, children }: StatItemProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-5 py-5 min-w-0">
      <div className="text-white text-base font-semibold text-center leading-snug">{children}</div>
      <p className="mt-2 text-center px-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
        {label}
      </p>
    </div>
  );
}

type StatCellProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

function StatCell({ label, children, className = '' }: StatCellProps) {
  return (
    <div
      className={`flex min-h-[5.25rem] flex-col items-center justify-center px-3 py-4 sm:px-4 ${className}`}
    >
      <div className="text-center text-sm font-semibold leading-snug text-white sm:text-base">{children}</div>
      <p className="mt-1.5 px-1 text-center text-[10px] font-semibold uppercase tracking-widest text-neutral-400 sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}

function Divider() {
  return <div className="my-3.5 w-px shrink-0 self-stretch bg-white/12" />;
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

const TOOLTIP_SKILLFUL_PASS =
  'Rating = pass accuracy % ÷ 10 (same 0–10 scale as weak foot). Comes from season pass accuracy in stats, not a manual scout mark. HIGH ≥ 8, MED ≥ 5, LOW under 5.';
const TOOLTIP_SKILLFUL_SHOT =
  'Rating = shot accuracy % ÷ 10 from season stats. Not subjective. HIGH ≥ 8, MED ≥ 5, LOW under 5.';
const TOOLTIP_WEAK_PASS =
  'Rating = weak-foot pass accuracy % ÷ 10. Same formula and HIGH/MED/LOW bands as strong-foot display.';
const TOOLTIP_WEAK_SHOT =
  'Rating = weak-foot shot accuracy % ÷ 10. Same bands: HIGH ≥ 8, MED ≥ 5, LOW under 5.';

function weakFootAccuracyToRating(accuracyPct: number): number {
  return accuracyPct / 10;
}

function WeakFootRating({
  label,
  accuracyPct,
  tooltip,
}: {
  label: string;
  accuracyPct: number;
  tooltip: string;
}) {
  const s = weakFootAccuracyToRating(accuracyPct);
  return (
    <MouseFollowTooltip text={tooltip}>
      <span className="flex items-center gap-1.5">
        <span className="mr-0.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {label}
        </span>
        <span className="tabular-nums text-white">{s.toFixed(1)}</span>
        <span className={`text-xs font-bold ${scoreLabelColor(s)}`}>{scoreLabel(s)}</span>
      </span>
    </MouseFollowTooltip>
  );
}

function SkillfulFootRating({
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
      <span className="flex items-center gap-1.5">
        <span className="mr-0.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {label}
        </span>
        <span className="tabular-nums text-white">{score.toFixed(1)}</span>
        <span className={`text-xs font-bold ${scoreLabelColor(score)}`}>{scoreLabel(score)}</span>
      </span>
    </MouseFollowTooltip>
  );
}

type Props = { player: PlayerDetail };

export default function PlayerAttributesBar({ player }: Props) {
  const stats = player.currentSeason?.stats;
  const positionFull = POSITION_FULL[player.position] ?? player.position;

  return (
    <div className="w-full rounded-2xl border border-white/5 bg-[#0f1923]">
      <div className="grid min-h-0 grid-cols-2 lg:hidden">
        <StatCell
          label="Position"
          className="min-w-0 border-b border-r border-white/10"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full bg-emerald-400" />
            <span className="break-words">{positionFull}</span>
          </span>
        </StatCell>
        <StatCell label="Preferred foot" className="min-w-0 border-b border-white/10">
          <span className="capitalize">
            {player.preferredFoot?.toLowerCase() ?? '—'}
          </span>
        </StatCell>
        <StatCell label="Height" className="min-w-0 border-b border-r border-white/10">
          {player.height !== null ? `${player.height} mts` : '—'}
        </StatCell>
        <StatCell label="Weight" className="min-w-0 border-b border-white/10">
          {player.weight !== null ? `${player.weight} kg` : '—'}
        </StatCell>
        {(stats?.skillfulFootPassScore != null ||
          stats?.skillfulFootShotScore != null) && (
          <StatCell
            label="Skillful Foot"
            className="col-span-2 min-w-0 border-b border-white/10"
          >
            <span className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              {stats?.skillfulFootPassScore != null && (
                <SkillfulFootRating
                  label="Pass"
                  score={stats.skillfulFootPassScore}
                  tooltip={TOOLTIP_SKILLFUL_PASS}
                />
              )}
              {stats?.skillfulFootShotScore != null && (
                <SkillfulFootRating
                  label="Shot"
                  score={stats.skillfulFootShotScore}
                  tooltip={TOOLTIP_SKILLFUL_SHOT}
                />
              )}
            </span>
          </StatCell>
        )}
        {(stats?.weakFootPassAccuracyPct != null ||
          stats?.weakFootShotAccuracyPct != null) && (
          <StatCell label="Weak Foot" className="col-span-2 min-w-0">
            <span className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
              {stats?.weakFootPassAccuracyPct != null && (
                <WeakFootRating
                  label="Pass"
                  accuracyPct={stats.weakFootPassAccuracyPct}
                  tooltip={TOOLTIP_WEAK_PASS}
                />
              )}
              {stats?.weakFootShotAccuracyPct != null && (
                <WeakFootRating
                  label="Shot"
                  accuracyPct={stats.weakFootShotAccuracyPct}
                  tooltip={TOOLTIP_WEAK_SHOT}
                />
              )}
            </span>
          </StatCell>
        )}
      </div>

      <div className="hidden min-h-[6rem] w-full items-stretch lg:flex">
        <StatItem label="Position">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
            {positionFull}
          </span>
        </StatItem>

        <Divider />

        <StatItem label="Preferred foot">
          <span className="capitalize">
            {player.preferredFoot?.toLowerCase() ?? '—'}
          </span>
        </StatItem>

        <Divider />

        <StatItem label="Height">
          {player.height !== null ? `${player.height} mts` : '—'}
        </StatItem>

        <Divider />

        <StatItem label="Weight">
          {player.weight !== null ? `${player.weight} kg` : '—'}
        </StatItem>

        <Divider />

        {(stats?.skillfulFootPassScore != null ||
          stats?.skillfulFootShotScore != null) && (
          <>
            <StatItem label="Skillful Foot">
              <span className="flex flex-wrap items-center justify-center gap-3 text-sm">
                {stats?.skillfulFootPassScore != null && (
                  <SkillfulFootRating
                    label="Pass"
                    score={stats.skillfulFootPassScore}
                    tooltip={TOOLTIP_SKILLFUL_PASS}
                  />
                )}
                {stats?.skillfulFootShotScore != null && (
                  <SkillfulFootRating
                    label="Shot"
                    score={stats.skillfulFootShotScore}
                    tooltip={TOOLTIP_SKILLFUL_SHOT}
                  />
                )}
              </span>
            </StatItem>
            <Divider />
          </>
        )}
        {(stats?.weakFootPassAccuracyPct != null ||
          stats?.weakFootShotAccuracyPct != null) && (
          <>
            <StatItem label="Weak Foot">
              <span className="flex flex-wrap items-center justify-center gap-3 text-sm">
                {stats?.weakFootPassAccuracyPct != null && (
                  <WeakFootRating
                    label="Pass"
                    accuracyPct={stats.weakFootPassAccuracyPct}
                    tooltip={TOOLTIP_WEAK_PASS}
                  />
                )}
                {stats?.weakFootShotAccuracyPct != null && (
                  <WeakFootRating
                    label="Shot"
                    accuracyPct={stats.weakFootShotAccuracyPct}
                    tooltip={TOOLTIP_WEAK_SHOT}
                  />
                )}
              </span>
            </StatItem>
          </>
        )}
      </div>
    </div>
  );
}
