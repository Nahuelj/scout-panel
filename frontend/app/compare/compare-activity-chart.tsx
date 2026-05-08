'use client';

import { useMemo } from 'react';
import { Area, AreaChart, XAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { PlayerDetail } from '@/lib/player-detail-api';
import { getSlotColor } from '@/lib/compare-colors';

type Props = { players: PlayerDetail[] };

function formatMonth(iso: string) {
  return new Date(iso).toLocaleString('en', { month: 'short' });
}

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

type MergedRow = Record<string, string | number | null> & { month: string };

function mergeActivity(players: PlayerDetail[]): {
  data: MergedRow[];
  monthIsoByKey: Record<string, string>;
} {
  const monthSet = new Set<string>();
  const monthIsoByKey: Record<string, string> = {};

  players.forEach((p) => {
    p.currentSeason?.activity?.forEach((a) => {
      const key = monthKey(a.monthDate);
      monthSet.add(key);
      if (!monthIsoByKey[key]) monthIsoByKey[key] = a.monthDate;
    });
  });

  const sortedKeys = Array.from(monthSet).sort();

  const data: MergedRow[] = sortedKeys.map((key) => {
    const row: MergedRow = {
      month: formatMonth(monthIsoByKey[key]),
    };
    players.forEach((p, i) => {
      const found = p.currentSeason?.activity?.find(
        (a) => monthKey(a.monthDate) === key,
      );
      row[`p${i}`] = found ? found.minutesPlayed : null;
    });
    return row;
  });

  return { data, monthIsoByKey };
}

export default function CompareActivityChart({ players }: Props) {
  const { data, monthIsoByKey } = useMemo(() => mergeActivity(players), [players]);

  const chartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = {};
    players.forEach((p, i) => {
      const slot = getSlotColor(i);
      config[`p${i}`] = {
        label: p.name,
        color: slot.base,
      };
    });
    return config;
  }, [players]);

  if (data.length === 0) return null;

  const sortedKeys = Object.keys(monthIsoByKey).sort();
  const firstIso = monthIsoByKey[sortedKeys[0]];
  const lastIso = monthIsoByKey[sortedKeys[sortedKeys.length - 1]];

  return (
    <div className="rounded-2xl bg-[#0f1923] border border-white/5 p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-white font-bold text-base">Season activity</p>
          <p className="text-neutral-500 text-xs mt-0.5">Minutes played per month</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {players.map((p, i) => {
            const slot = getSlotColor(i);
            return (
              <div key={p.id} className="flex items-center gap-1.5 min-w-0">
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
      </div>

      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[240px] w-full min-w-0 justify-start"
      >
        <AreaChart data={data} margin={{ top: 16, right: 20, left: 20, bottom: 8 }}>
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          {players.map((p, i) => {
            const slot = getSlotColor(i);
            return (
              <Area
                key={p.id}
                dataKey={`p${i}`}
                name={p.name}
                type="linear"
                fill={slot.base}
                fillOpacity={0.15}
                stroke={slot.base}
                strokeWidth={2}
                connectNulls
                dot={(props) => {
                  const { cx, cy } = props as { cx?: number; cy?: number };
                  if (cx == null || cy == null) return null;
                  const side = 7;
                  const h = side / 2;
                  return (
                    <rect
                      x={cx - h}
                      y={cy - h}
                      width={side}
                      height={side}
                      fill={slot.base}
                      stroke="#0f1923"
                      strokeWidth={1}
                    />
                  );
                }}
                activeDot={(props) => {
                  const { cx, cy } = props as { cx?: number; cy?: number };
                  if (cx == null || cy == null) return null;
                  const side = 9;
                  const h = side / 2;
                  return (
                    <rect
                      x={cx - h}
                      y={cy - h}
                      width={side}
                      height={side}
                      fill={slot.base}
                      stroke="#0f1923"
                      strokeWidth={2}
                    />
                  );
                }}
              />
            );
          })}
        </AreaChart>
      </ChartContainer>

      <div className="flex flex-col gap-0.5 text-sm border-t border-white/5 pt-4">
        <span className="text-neutral-500 text-xs">
          {formatMonth(firstIso)} – {formatMonth(lastIso)}
        </span>
      </div>
    </div>
  );
}
