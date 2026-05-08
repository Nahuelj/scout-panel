"use client";

import { Area, AreaChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { PlayerActivity } from "@/lib/player-detail-api";

type Props = {
  activity: PlayerActivity[];
  seasonName?: string;
};

const chartConfig = {
  minutesPlayed: {
    label: "Minutes played",
    color: "#10b981",
  },
} satisfies ChartConfig;

function formatMonth(iso: string) {
  return new Date(iso).toLocaleString("en", { month: "short" });
}

export default function PlayerActivityChart({ activity, seasonName }: Props) {
  const data = activity.map((item) => ({
    month: formatMonth(item.monthDate),
    minutesPlayed: item.minutesPlayed,
  }));

  const first = formatMonth(activity[0].monthDate);
  const last = formatMonth(activity[activity.length - 1].monthDate);

  return (
    <div className="rounded-2xl bg-[#0f1923] border border-white/5 p-6 flex flex-col gap-4">
      <div>
        <p className="text-white font-bold text-base">Season activity</p>
        <p className="text-neutral-500 text-xs mt-0.5">Minutes played per month</p>
      </div>

      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[200px] w-full min-w-0 justify-start"
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
          <Area
            dataKey="minutesPlayed"
            type="linear"
            fill="var(--color-minutesPlayed)"
            fillOpacity={0.4}
            stroke="var(--color-minutesPlayed)"
          />
        </AreaChart>
      </ChartContainer>

      <div className="flex flex-col gap-0.5 text-sm border-t border-white/5 pt-4">
        <span className="text-white font-medium">{seasonName ?? "Current season"}</span>
        <span className="text-neutral-500 text-xs">
          {first} – {last}
        </span>
      </div>
    </div>
  );
}
