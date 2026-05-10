'use client';

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PlayerDetail, PlayerDetailStats } from '@/lib/player-detail-api';
import {
  STAT_CATEGORIES,
  METRIC_META,
  computeRadarScores,
  formatValue,
  clientToSvgPoint,
  pickCategoryByNearestAxis,
  type StatFormatKind,
} from '@/lib/player-stats-metadata';
import { getSlotColor } from '@/lib/compare-colors';
import { cn } from '@/lib/utils';

const STATS_TABLE_HEAD_CLASS =
  'text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 md:text-[11px] lg:text-xs';

type RadarPointEntry = {
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  payload?: { category?: string };
};

type Row = {
  label: string;
  description: string;
  formatKind: StatFormatKind;
  values: { playerId: string; value: number | null }[];
};

function buildCategoryRows(
  metrics: (keyof PlayerDetailStats)[],
  players: PlayerDetail[],
): Row[] {
  return metrics
    .flatMap((key) => {
      const meta = METRIC_META[key];
      if (!meta) return [];
      const values = players.map((p) => {
        const stats = p.currentSeason?.stats ?? null;
        const v = stats ? (stats[key] as number | null | undefined) : null;
        return { playerId: p.id, value: v == null ? null : v };
      });
      if (values.every(({ value }) => value === null)) return [];
      const row: Row = {
        label: meta.label,
        description: meta.description,
        formatKind: meta.formatKind,
        values,
      };
      return [row];
    });
}

function getLeaderIndices(values: { value: number | null }[]): Set<number> {
  const present = values
    .map(({ value }) => value)
    .filter((v): v is number => v !== null);
  if (present.length < 2) return new Set();
  const max = Math.max(...present);
  const leaders = new Set<number>();
  values.forEach(({ value }, i) => {
    if (value === max) leaders.add(i);
  });
  return leaders;
}

type Props = { players: PlayerDetail[] };

export default function CompareAnalysis({ players }: Props) {
  const [activeTab, setActiveTab] = useState('SHO');
  const radarPanelRef = useRef<HTMLDivElement>(null);
  const radarChartWrapRef = useRef<HTMLDivElement>(null);
  const radarGeomRef = useRef<{
    pole: { x: number; y: number };
    vertices: { x: number; y: number; category: string }[];
    maxRadius: number;
  } | null>(null);

  const radarData = useMemo(() => {
    const categories = Object.keys(STAT_CATEGORIES);
    const perPlayerScores = players.map((p) =>
      p.currentSeason?.stats ? computeRadarScores(p.currentSeason.stats) : [],
    );

    return categories.map((category) => {
      const row: Record<string, number | string> = { category };
      perPlayerScores.forEach((scores, i) => {
        const found = scores.find((s) => s.category === category);
        row[`p${i}`] = found?.score ?? 0;
      });
      return row;
    });
  }, [players]);

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

  const isThree = players.length === 3;
  const valueColTemplate = isThree
    ? 'grid-cols-[11rem_repeat(3,minmax(6rem,1fr))] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_repeat(3,minmax(5rem,6rem))]'
    : 'grid-cols-[11rem_repeat(2,minmax(6rem,1fr))] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_repeat(2,minmax(5rem,6rem))]';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 lg:items-start">
      <div
        ref={radarPanelRef}
        className="flex flex-col rounded-2xl border border-white/5 bg-[#0f1923] p-4 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-white font-bold text-base tracking-tight">Radar chart</h3>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 shrink-0">
          {players.map((p, i) => {
            const slot = getSlotColor(i);
            return (
              <div key={`${p.id}-${i}`} className="flex items-center gap-1.5 min-w-0">
                <span
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: slot.base }}
                  aria-hidden
                />
                <span className="text-neutral-300 text-xs truncate">{p.name}</span>
              </div>
            );
          })}
        </div>

        <div
          ref={radarChartWrapRef}
          className="w-full h-[260px] sm:h-[300px] shrink-0"
          onMouseMove={handleRadarMouseMove}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={radarData}
              outerRadius="90%"
              margin={{ top: 6, right: 10, bottom: 10, left: 10 }}
            >
              <PolarGrid stroke="rgba(255,255,255,0.06)" radialLines={false} />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
              />
              {players.map((p, seriesIdx) => {
                const slot = getSlotColor(seriesIdx);
                return (
                  <Radar
                    key={`${p.id}-${seriesIdx}`}
                    name={p.name}
                    dataKey={`p${seriesIdx}`}
                    stroke={slot.base}
                    fill={slot.base}
                    fillOpacity={0.12}
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
                        seriesIdx === 0 &&
                        points &&
                        points.length > 0 &&
                        index === 0 &&
                        points[0].cx != null &&
                        points[0].cy != null
                      ) {
                        const pole = { x: points[0].cx, y: points[0].cy };
                        const vertices = points
                          .map((pt) => {
                            const cat = pt.payload?.category;
                            if (pt.x == null || pt.y == null || !cat) return null;
                            return { x: pt.x, y: pt.y, category: cat };
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
                      const side = selected ? 9 : 7;
                      const half = side / 2;
                      return (
                        <rect
                          x={cx - half}
                          y={cy - half}
                          width={side}
                          height={side}
                          fill={slot.base}
                          stroke="#0f1923"
                          strokeWidth={selected ? 2 : 1}
                          className="pointer-events-none"
                        />
                      );
                    }}
                  />
                );
              })}
            </RadarChart>
          </ResponsiveContainer>
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
          className="flex min-h-0 w-full flex-col gap-0 lg:h-full lg:min-h-0"
        >
          <TabsList className="isolate flex min-h-11 w-full shrink-0 items-stretch justify-stretch gap-0 divide-x divide-white/10 rounded-none border-0 border-b border-white/10 bg-[#0f1923] p-0 shadow-none">
            {Object.entries(STAT_CATEGORIES).map(([cat]) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="relative flex h-full min-h-11 min-w-0 flex-1 items-center justify-center rounded-none bg-[#0b121c] px-1.5 py-2 text-center text-[10px] font-semibold uppercase leading-snug tracking-wide text-neutral-500 outline-none ring-0 transition-colors hover:bg-[#141e2a] hover:text-neutral-300 focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 data-[state=active]:z-[1] data-[state=active]:bg-[#0f1923] data-[state=active]:text-emerald-400 sm:px-3 sm:text-sm"
                title={`${cat} statistics`}
                aria-label={`${cat} statistics`}
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(STAT_CATEGORIES).map(([cat, { metrics }]) => {
            const rows = buildCategoryRows(metrics, players);
            return (
              <TabsContent
                key={cat}
                value={cat}
                className="mt-0 flex flex-col px-0 pt-0 pb-0 outline-none lg:min-h-0 lg:flex-1 lg:overflow-hidden"
              >
                <div className="flex flex-col pl-4 pr-2 pt-5 sm:pl-6 lg:min-h-0 lg:flex-1">
                  <div className="scrollbar-panel overflow-x-auto pb-6 pr-3 sm:pr-4 lg:min-h-0 lg:flex-1 lg:overflow-x-auto lg:overflow-y-auto">
                    <div
                      className={cn(
                        isThree ? 'min-w-[32rem]' : 'min-w-[25rem]',
                        'sm:min-w-[36rem]',
                      )}
                    >
                      <div
                        className={cn(
                          'sticky top-0 z-[1] mb-1 grid gap-x-3 border-b border-white/5 bg-[#0f1923] pb-2',
                          valueColTemplate,
                        )}
                      >
                        <span className={STATS_TABLE_HEAD_CLASS}>
                          Metric
                        </span>
                        <span className={cn(STATS_TABLE_HEAD_CLASS, 'hidden sm:inline')}>
                          Description
                        </span>
                        {players.map((p, i) => {
                          const slot = getSlotColor(i);
                          return (
                            <span
                              key={`${p.id}-${i}`}
                              className={`flex min-w-0 items-center justify-center gap-1.5 text-center ${STATS_TABLE_HEAD_CLASS}`}
                              style={{ color: slot.base }}
                            >
                              <span
                                className="size-1.5 rounded-[2px] flex-shrink-0"
                                style={{ backgroundColor: slot.base }}
                                aria-hidden
                              />
                              <span className="min-w-0 font-medium truncate">{p.name}</span>
                            </span>
                          );
                        })}
                      </div>

                      {rows.length === 0 ? (
                        <p className="py-4 text-sm text-neutral-600">
                          No data available
                        </p>
                      ) : (
                        rows.map((row, rowIndex) => {
                          const leaders = getLeaderIndices(row.values);
                          return (
                            <div
                              key={`${cat}-${row.label}-${rowIndex}`}
                              className={cn(
                                'grid gap-x-3 border-b border-white/5 py-3 last:border-0',
                                valueColTemplate,
                              )}
                            >
                              <span className="min-w-0 truncate text-sm font-medium text-white">
                                {row.label}
                              </span>
                              <span className="hidden sm:inline text-sm leading-snug text-neutral-400 md:text-neutral-300 truncate">
                                {row.description}
                              </span>
                              {row.values.map(({ playerId, value }, i) => {
                                const slot = getSlotColor(i);
                                const isLeader = leaders.has(i);
                                return (
                                  <span
                                    key={`${playerId}-${i}`}
                                    className={cn(
                                      'text-center text-sm tabular-nums px-2 py-0.5 rounded-md',
                                      isLeader ? 'font-bold' : 'font-medium text-white',
                                    )}
                                    style={
                                      isLeader
                                        ? {
                                            color: slot.base,
                                            backgroundColor: `${slot.base}1f`,
                                          }
                                        : undefined
                                    }
                                  >
                                    {formatValue(value, row.formatKind)}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        })
                      )}
                    </div>
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
