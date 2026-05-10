'use client';

import { useCallback, useLayoutEffect, useRef, useState, Fragment } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PlayerDetailStats } from '@/features/players/types/player.types';
import {
  STAT_CATEGORIES,
  METRIC_META,
  computeRadarScores,
  formatValue,
  formatCardIntervalGames,
  clientToSvgPoint,
  pickCategoryByNearestAxis,
  type StatFormatKind,
} from '@/features/players/utils/player-stats-metadata';
import { cn } from '@/lib/utils';

const STATS_TABLE_HEAD_CLASS =
  'text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 md:text-[11px] lg:text-xs';

type StatRow = {
  label: string;
  description: string;
  formatKind: StatFormatKind;
  value: number | null | undefined;
};

type RadarPointEntry = {
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  payload?: { category?: string };
};

type Props = { stats: PlayerDetailStats };

export default function PlayerAnalysis({ stats }: Props) {
  const [activeTab, setActiveTab] = useState('SHO');
  const radarData = computeRadarScores(stats);
  const radarPanelRef = useRef<HTMLDivElement>(null);
  const radarChartWrapRef = useRef<HTMLDivElement>(null);
  const radarGeomRef = useRef<{
    pole: { x: number; y: number };
    vertices: { x: number; y: number; category: string }[];
    maxRadius: number;
  } | null>(null);

  const handleRadarMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const geom = radarGeomRef.current;
    const wrap = radarChartWrapRef.current;
    if (!geom || !wrap) return;
    const svg = wrap.querySelector('svg');
    if (!svg) return;
    const pt = clientToSvgPoint(svg, e.clientX, e.clientY);
    if (!pt) return;
    const next = pickCategoryByNearestAxis(geom.pole, geom.vertices, pt, geom.maxRadius);
    if (next && next in STAT_CATEGORIES) {
      setActiveTab((prev) => (prev === next ? prev : next));
    }
  }, []);

  const [tablePanelHeightPx, setTablePanelHeightPx] = useState<number | undefined>(
    undefined,
  );

  useLayoutEffect(() => {
    const el = radarPanelRef.current;
    if (!el) return;

    const mq = window.matchMedia('(min-width: 1024px)');

    const sync = () => {
      if (!mq.matches) {
        setTablePanelHeightPx(undefined);
        return;
      }
      setTablePanelHeightPx(el.getBoundingClientRect().height);
    };

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    mq.addEventListener('change', sync);
    sync();

    return () => {
      ro.disconnect();
      mq.removeEventListener('change', sync);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr] lg:items-start">
      <div
        ref={radarPanelRef}
        className="flex flex-col rounded-2xl border border-white/5 bg-[#0f1923] p-4 sm:p-6"
      >
        <h3 className="mb-4 shrink-0 text-base font-bold tracking-tight text-white">
          Radar chart
        </h3>
        <div
          ref={radarChartWrapRef}
          className="relative h-[220px] min-w-0 w-full shrink-0 sm:h-[260px] lg:h-[300px]"
          onMouseMove={handleRadarMouseMove}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            initialDimension={{ width: 348, height: 300 }}
          >
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
                animationDuration={480}
                animationEasing="ease-out"
                dot={(dotProps) => {
                  const dp = dotProps as unknown as {
                    cx?: number;
                    cy?: number;
                    index?: number;
                    points?: RadarPointEntry[];
                    payload?: { category?: string };
                  };
                  const { cx, cy, payload, points, index } = dp;
                  if (
                    points &&
                    points.length > 0 &&
                    index === 0 &&
                    points[0].cx != null &&
                    points[0].cy != null
                  ) {
                    const pole = { x: points[0].cx, y: points[0].cy };
                    const vertices = points
                      .map((p) => {
                        const cat = p.payload?.category;
                        if (p.x == null || p.y == null || !cat) return null;
                        return { x: p.x, y: p.y, category: cat };
                      })
                      .filter(
                        (v): v is { x: number; y: number; category: string } =>
                          v !== null,
                      );
                    const radii = vertices.map((v) =>
                      Math.hypot(v.x - pole.x, v.y - pole.y),
                    );
                    const maxRadius = radii.length > 0 ? Math.max(...radii) : 0;
                    radarGeomRef.current = { pole, vertices, maxRadius };
                  }
                  if (cx == null || cy == null) return null;
                  const category = payload?.category;
                  const selected = category === activeTab;
                  const side = selected ? 10 : 8;
                  const half = side / 2;
                  return (
                    <rect
                      x={cx - half}
                      y={cy - half}
                      width={side}
                      height={side}
                      fill="#10b981"
                      stroke="#0f1923"
                      strokeWidth={selected ? 2 : 1}
                      className="pointer-events-none"
                    />
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid shrink-0 grid-cols-2 gap-3 border-t border-white/5 pt-4">
          <div className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5">
            <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-[2px] bg-red-500/90"
                aria-hidden
              />
              Red cards
            </p>
            <p className="text-white text-xl font-bold tabular-nums mt-0.5">
              {stats.redCards}
            </p>
            <p className="text-neutral-400 text-[11px] mt-1 tabular-nums leading-snug">
              {stats.matchesPerRedCard != null
                ? formatCardIntervalGames(stats.matchesPerRedCard)
                : 'No red cards'}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2.5">
            <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-[2px] bg-amber-400/90"
                aria-hidden
              />
              Yellow cards
            </p>
            <p className="text-white text-xl font-bold tabular-nums mt-0.5">
              {stats.yellowCards}
            </p>
            <p className="text-neutral-400 text-[11px] mt-1 tabular-nums leading-snug">
              {stats.matchesPerYellowCard != null
                ? formatCardIntervalGames(stats.matchesPerYellowCard)
                : 'No yellow cards'}
            </p>
          </div>
        </div>
      </div>

      <div
        className="flex min-w-0 flex-col overflow-visible rounded-2xl border border-white/5 bg-[#0f1923] p-0 lg:max-h-none lg:min-h-0 lg:overflow-hidden"
        style={
          tablePanelHeightPx !== undefined
            ? { height: tablePanelHeightPx }
            : undefined
        }
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 w-full min-w-0 flex-col gap-0 lg:h-full lg:min-h-0"
        >
          <div className="scrollbar-panel min-w-0 overflow-x-auto">
            <TabsList className="isolate inline-flex h-auto min-h-11 w-max min-w-full shrink-0 flex-nowrap items-stretch justify-start gap-0 divide-x divide-white/10 rounded-none border-0 border-b border-white/10 bg-[#0f1923] p-0 shadow-none">
              {Object.entries(STAT_CATEGORIES).map(([cat]) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="relative flex h-full min-h-11 shrink-0 items-center justify-center rounded-none bg-[#0b121c] px-2.5 py-2 text-center text-[11px] font-semibold uppercase leading-snug tracking-wide text-neutral-500 outline-none ring-0 transition-colors hover:bg-[#141e2a] hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:z-[1] data-[state=active]:bg-[#0f1923] data-[state=active]:text-emerald-400 sm:px-3 sm:text-sm md:min-w-0 md:flex-1 md:justify-center"
                  title={`${cat} statistics`}
                  aria-label={`${cat} statistics`}
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.entries(STAT_CATEGORIES).map(([cat, { metrics }]) => {
            const rows = metrics
              .flatMap((key) => {
                const meta = METRIC_META[key];
                if (!meta) return [];
                const value = stats[key] as number | null | undefined;
                if (value === null || value === undefined) return [];
                const row: StatRow = {
                  label: meta.label,
                  description: meta.description,
                  formatKind: meta.formatKind,
                  value,
                };
                return [row];
              });

            return (
              <TabsContent
                key={cat}
                value={cat}
                className="mt-0 flex flex-col px-0 pt-0 pb-0 outline-none lg:min-h-0 lg:flex-1 lg:overflow-hidden"
              >
                <div className="flex flex-col pl-4 pr-2 pt-5 sm:pl-6 lg:min-h-0 lg:flex-1">
                  <div className="scrollbar-panel pb-6 pr-3 sm:pr-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                    <div className="sticky top-0 z-[1] mb-2 flex items-end justify-between border-b border-white/10 bg-[#0f1923] pb-2 md:hidden">
                      <span className={STATS_TABLE_HEAD_CLASS}>Metric</span>
                      <span className={STATS_TABLE_HEAD_CLASS}>Value</span>
                    </div>
                    <div className="sticky top-0 z-[1] mb-1 hidden grid-cols-[1fr_1fr_6.5rem] gap-x-4 gap-y-0 border-b border-white/10 bg-[#0f1923] pb-2 md:grid">
                      {(['Metric', 'Description', 'Value'] as const).map((h) => (
                        <span
                          key={h}
                          className={cn(
                            STATS_TABLE_HEAD_CLASS,
                            h === 'Value' && 'text-center',
                          )}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                    {rows.length === 0 ? (
                      <p className="py-4 text-sm text-neutral-600">No data available</p>
                    ) : (
                      rows.map((row, i) => {
                        const isLast = i === rows.length - 1;
                        return (
                          <Fragment key={`${cat}-${row.label}-${i}`}>
                            <div
                              className={cn(
                                'border-b border-white/5 py-3 md:hidden',
                                isLast && 'border-b-0',
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-white">
                                  {row.label}
                                </span>
                                <span className="shrink-0 text-right text-sm font-bold tabular-nums text-white">
                                  {formatValue(row.value, row.formatKind)}
                                </span>
                              </div>
                              <p className="mt-1 text-xs leading-snug text-neutral-500">
                                {row.description}
                              </p>
                            </div>
                            <div
                              className={cn(
                                'hidden grid-cols-[1fr_1fr_6.5rem] gap-x-4 gap-y-0 border-b border-white/5 py-3 md:grid',
                                isLast && 'border-b-0',
                              )}
                            >
                              <span className="text-sm font-medium text-white">{row.label}</span>
                              <span className="text-sm leading-snug text-neutral-400">
                                {row.description}
                              </span>
                              <span className="text-center text-sm font-bold tabular-nums text-white">
                                {formatValue(row.value, row.formatKind)}
                              </span>
                            </div>
                          </Fragment>
                        );
                      })
                    )}
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
