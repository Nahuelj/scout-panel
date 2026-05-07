'use client';

import { useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PlayerDetailStats } from '@/lib/player-detail-api';

type StatMetric = {
  label: string;
  description: string;
  formatKind: 'number' | 'percentage' | 'decimal';
  value: number | null | undefined;
};

const STAT_CATEGORIES: Record<
  string,
  { title: string; metrics: (keyof PlayerDetailStats)[] }
> = {
  SHO: {
    title: 'SHO — Shooting',
    metrics: [
      'goalsPer90',
      'xGPer90',
      'shotAccuracyPct',
      'conversionRatePct',
      'shotsOnTarget',
      'touchesInBox',
      'weakFootShotPct',
      'weakFootGoals',
      'weakFootShotAccuracyPct',
      'skillfulFootShotScore',
    ],
  },
  PAS: {
    title: 'PAS — Passing',
    metrics: [
      'passAccuracyPct',
      'progressivePasses',
      'keyPasses',
      'throughBalls',
      'crossAccuracyPct',
      'xA',
      'weakFootPassPct',
      'weakFootPassAccuracyPct',
      'progressiveWfPasses',
      'skillfulFootPassScore',
    ],
  },
  PHY: {
    title: 'PHY — Physical',
    metrics: [
      'physicalDuelsWonPct',
      'strengthDuels',
      'balance',
      'stamina',
      'bodyContactSuccessPct',
    ],
  },
  DEF: {
    title: 'DEF — Defending',
    metrics: [
      'tacklesWonPct',
      'interceptions',
      'recoveries',
      'blocks',
      'aerialDuelsWonPct',
      'clearances',
    ],
  },
  PAC: {
    title: 'PAC — Pace',
    metrics: [
      'topSpeed',
      'sprintDistance',
      'accelerations',
      'progressiveRuns',
      'distanceCovered',
    ],
  },
  DRI: {
    title: 'DRI — Dribbling',
    metrics: [
      'dribblesAttempted',
      'dribbleSuccessPct',
      'progressiveCarries',
      'carriesIntoFinalThird',
      'ballRetentionPct',
      'foulsWon',
    ],
  },
};

function categoryLabel(title: string): string {
  return title.split(' — ')[1] ?? title;
}

const METRIC_META: Record<
  string,
  { label: string; description: string; formatKind: 'number' | 'percentage' | 'decimal' }
> = {
  goalsPer90: {
    label: 'Goals per 90',
    description: 'Goals per 90 minutes',
    formatKind: 'decimal',
  },
  xGPer90: {
    label: 'xG per 90',
    description: 'Expected goals per 90 minutes',
    formatKind: 'decimal',
  },
  shotAccuracyPct: {
    label: 'Shot accuracy %',
    description: 'Share of shots on target',
    formatKind: 'percentage',
  },
  conversionRatePct: {
    label: 'Conversion rate %',
    description: 'Goals per shot attempt',
    formatKind: 'percentage',
  },
  shotsOnTarget: {
    label: 'Shots on target',
    description: 'Total shots on target',
    formatKind: 'number',
  },
  touchesInBox: {
    label: 'Touches in box',
    description: 'Touches inside the penalty area',
    formatKind: 'number',
  },
  weakFootShotPct: {
    label: 'Weak foot shot %',
    description: 'Share of shots with weak foot',
    formatKind: 'percentage',
  },
  weakFootGoals: {
    label: 'Weak foot goals',
    description: 'Goals scored with weak foot',
    formatKind: 'number',
  },
  weakFootShotAccuracyPct: {
    label: 'Weak foot shot accuracy %',
    description: 'Accuracy on weak-foot shots',
    formatKind: 'percentage',
  },
  skillfulFootShotScore: {
    label: 'Skillful foot shot',
    description: 'Strong-foot shooting score',
    formatKind: 'decimal',
  },
  passAccuracyPct: {
    label: 'Pass accuracy %',
    description: 'Completed passes share',
    formatKind: 'percentage',
  },
  progressivePasses: {
    label: 'Progressive passes',
    description: 'Passes that advance the ball',
    formatKind: 'number',
  },
  keyPasses: {
    label: 'Key passes',
    description: 'Passes leading to a shot',
    formatKind: 'number',
  },
  throughBalls: {
    label: 'Through balls',
    description: 'Splitting passes into space',
    formatKind: 'number',
  },
  crossAccuracyPct: {
    label: 'Cross accuracy %',
    description: 'Successful crosses share',
    formatKind: 'percentage',
  },
  xA: {
    label: 'xA',
    description: 'Expected assists',
    formatKind: 'decimal',
  },
  weakFootPassPct: {
    label: 'Weak foot pass %',
    description: 'Share of passes with weak foot',
    formatKind: 'percentage',
  },
  weakFootPassAccuracyPct: {
    label: 'Weak foot pass accuracy %',
    description: 'Accuracy on weak-foot passes',
    formatKind: 'percentage',
  },
  progressiveWfPasses: {
    label: 'Progressive weak-foot passes',
    description: 'Progressive passes with weak foot',
    formatKind: 'number',
  },
  skillfulFootPassScore: {
    label: 'Skillful foot pass',
    description: 'Strong-foot passing score',
    formatKind: 'decimal',
  },
  physicalDuelsWonPct: {
    label: 'Physical duels won %',
    description: 'Share of physical duels won',
    formatKind: 'percentage',
  },
  strengthDuels: {
    label: 'Strength duels',
    description: 'Strength-based duels contested',
    formatKind: 'number',
  },
  balance: {
    label: 'Balance',
    description: 'Balance rating',
    formatKind: 'decimal',
  },
  stamina: {
    label: 'Stamina',
    description: 'Stamina rating',
    formatKind: 'decimal',
  },
  bodyContactSuccessPct: {
    label: 'Body contact success %',
    description: 'Successful body contacts share',
    formatKind: 'percentage',
  },
  tacklesWonPct: {
    label: 'Tackles won %',
    description: 'Share of tackles won',
    formatKind: 'percentage',
  },
  interceptions: {
    label: 'Interceptions',
    description: 'Passes intercepted',
    formatKind: 'number',
  },
  recoveries: {
    label: 'Recoveries',
    description: 'Ball recoveries',
    formatKind: 'number',
  },
  blocks: {
    label: 'Blocks',
    description: 'Shots or passes blocked',
    formatKind: 'number',
  },
  aerialDuelsWonPct: {
    label: 'Aerial duels won %',
    description: 'Share of aerial duels won',
    formatKind: 'percentage',
  },
  clearances: {
    label: 'Clearances',
    description: 'Defensive clearances',
    formatKind: 'number',
  },
  topSpeed: {
    label: 'Top speed',
    description: 'Maximum speed (km/h)',
    formatKind: 'decimal',
  },
  sprintDistance: {
    label: 'Sprint distance',
    description: 'Distance covered sprinting (m)',
    formatKind: 'number',
  },
  accelerations: {
    label: 'Accelerations',
    description: 'High-intensity accelerations',
    formatKind: 'number',
  },
  progressiveRuns: {
    label: 'Progressive runs',
    description: 'Ball carries into advanced zones',
    formatKind: 'number',
  },
  distanceCovered: {
    label: 'Distance covered',
    description: 'Total distance (km)',
    formatKind: 'decimal',
  },
  dribblesAttempted: {
    label: 'Dribbles attempted',
    description: 'Attempted take-ons',
    formatKind: 'number',
  },
  dribbleSuccessPct: {
    label: 'Dribble success %',
    description: 'Successful dribbles share',
    formatKind: 'percentage',
  },
  progressiveCarries: {
    label: 'Progressive carries',
    description: 'Carries that advance the ball',
    formatKind: 'decimal',
  },
  carriesIntoFinalThird: {
    label: 'Carries into final third',
    description: 'Entries into the attacking third',
    formatKind: 'decimal',
  },
  ballRetentionPct: {
    label: 'Ball retention %',
    description: 'Possession retained under pressure',
    formatKind: 'percentage',
  },
  foulsWon: {
    label: 'Fouls won',
    description: 'Fouls drawn',
    formatKind: 'decimal',
  },
};

function normalize(value: number, max: number): number {
  return Math.min(100, Math.round((value / max) * 100));
}

function computeRadarScores(stats: PlayerDetailStats) {
  const avg = (vals: (number | null | undefined)[]): number => {
    const filtered = vals.filter((v): v is number => v !== null && v !== undefined);
    if (filtered.length === 0) return 0;
    return filtered.reduce((a, b) => a + b, 0) / filtered.length;
  };

  return [
    {
      category: 'SHO',
      score: Math.round(
        avg([
          stats.skillfulFootShotScore !== null
            ? (stats.skillfulFootShotScore ?? 0) * 10
            : null,
          stats.shotAccuracyPct,
          stats.conversionRatePct,
          stats.xGPer90 !== null ? normalize(stats.xGPer90 ?? 0, 1.5) : null,
        ]),
      ),
    },
    {
      category: 'PAS',
      score: Math.round(
        avg([
          stats.skillfulFootPassScore !== null
            ? (stats.skillfulFootPassScore ?? 0) * 10
            : null,
          stats.passAccuracyPct,
          stats.crossAccuracyPct,
        ]),
      ),
    },
    {
      category: 'PHY',
      score: Math.round(
        avg([
          stats.physicalDuelsWonPct,
          stats.balance !== null ? (stats.balance ?? 0) * 10 : null,
          stats.stamina !== null ? (stats.stamina ?? 0) * 10 : null,
          stats.bodyContactSuccessPct,
        ]),
      ),
    },
    {
      category: 'DEF',
      score: Math.round(
        avg([
          stats.tacklesWonPct,
          stats.aerialDuelsWonPct,
          stats.interceptions !== null ? normalize(stats.interceptions ?? 0, 80) : null,
        ]),
      ),
    },
    {
      category: 'PAC',
      score: Math.round(
        avg([
          stats.topSpeed !== null ? normalize(stats.topSpeed ?? 0, 38) : null,
          stats.distanceCovered !== null ? normalize(stats.distanceCovered ?? 0, 12) : null,
          stats.accelerations !== null ? normalize(stats.accelerations ?? 0, 300) : null,
        ]),
      ),
    },
    {
      category: 'DRI',
      score: Math.round(
        avg([
          stats.dribbleSuccessPct,
          stats.ballRetentionPct,
          stats.progressiveCarries !== null
            ? normalize(stats.progressiveCarries ?? 0, 100)
            : null,
        ]),
      ),
    },
  ];
}

function formatValue(
  value: number | null | undefined,
  formatKind: string,
): string {
  if (value === null || value === undefined) return '—';
  if (formatKind === 'decimal') return value.toFixed(1);
  if (formatKind === 'percentage') return `${value.toFixed(1)}%`;
  return String(value);
}

type Props = { stats: PlayerDetailStats };

export default function PlayerAnalysis({ stats }: Props) {
  const [activeTab, setActiveTab] = useState('SHO');
  const radarData = computeRadarScores(stats);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 lg:items-start">
      <div className="rounded-2xl bg-[#0f1923] border border-white/5 p-6 flex flex-col">
        <h3 className="text-white font-bold text-base tracking-tight mb-4 shrink-0">
          Radar chart
        </h3>
        <div className="w-full h-[300px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={radarData}
              outerRadius="90%"
              margin={{ top: 6, right: 10, bottom: 10, left: 10 }}
            >
              <PolarGrid stroke="rgba(255,255,255,0.06)" radialLines={false} />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
              />
              <Radar
                dataKey="score"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 0, r: 4.5 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5 shrink-0">
          <div className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5">
            <p className="text-neutral-500 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-[2px] bg-red-600/90"
                aria-hidden
              />
              Red cards
            </p>
            <p className="text-white text-xl font-bold tabular-nums mt-0.5">
              {stats.redCards}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5">
            <p className="text-neutral-500 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-[2px] bg-amber-400/90"
                aria-hidden
              />
              Yellow cards
            </p>
            <p className="text-white text-xl font-bold tabular-nums mt-0.5">
              {stats.yellowCards}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0f1923] border border-white/5 min-w-0 flex flex-col overflow-hidden p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full gap-0">
          <TabsList className="isolate flex min-h-11 w-full items-stretch justify-stretch gap-0 divide-x divide-white/10 rounded-none border-0 border-b border-white/10 bg-[#0f1923] p-0 shadow-none">
            {Object.entries(STAT_CATEGORIES).map(([cat, { title }]) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="relative flex h-full min-h-11 min-w-0 flex-1 items-center justify-center rounded-none bg-[#0b121c] px-2 py-2 text-center text-[11px] font-semibold leading-snug text-neutral-500 outline-none ring-0 transition-colors hover:bg-[#141e2a] hover:text-neutral-300 focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 data-[state=active]:z-[1] data-[state=active]:bg-[#0f1923] data-[state=active]:text-emerald-400 sm:px-3 sm:text-sm"
              >
                {categoryLabel(title)}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(STAT_CATEGORIES).map(([cat, { metrics }]) => {
            const rows = metrics
              .flatMap((key) => {
                const meta = METRIC_META[key];
                if (!meta) return [];
                const value = stats[key] as number | null | undefined;
                if (value === null || value === undefined) return [];
                const row: StatMetric = {
                  label: meta.label,
                  description: meta.description,
                  formatKind: meta.formatKind,
                  value,
                };
                return [row];
              });

            return (
              <TabsContent key={cat} value={cat} className="mt-0 px-6 pb-6 pt-5 outline-none">
                <div className="space-y-0">
                  <div className="grid grid-cols-[1fr_1fr_88px] gap-4 pb-2 mb-1 border-b border-white/5">
                    {(['Metric', 'Description', 'Value'] as const).map((h) => (
                      <span
                        key={h}
                        className="text-neutral-600 text-[9px] uppercase tracking-widest"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  {rows.length === 0 ? (
                    <p className="text-neutral-600 text-sm py-4">
                      No data available
                    </p>
                  ) : (
                    rows.map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-[1fr_1fr_88px] gap-4 py-3 border-b border-white/5 last:border-0"
                      >
                        <span className="text-white text-sm font-medium">{row.label}</span>
                        <span className="text-neutral-500 text-sm">{row.description}</span>
                        <span className="text-white font-bold text-sm text-right">
                          {formatValue(row.value, row.formatKind)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
