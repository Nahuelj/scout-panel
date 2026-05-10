'use client';

import { useRef } from 'react';
import type { PlayerDetail } from '@/features/players/types/player.types';
import CompareHeaders from './compare-headers';
import CompareAttributesTable from './compare-attributes-table';
import CompareAnalysis from './compare-analysis';
import CompareActivityChart from './compare-activity-chart';
import CompareStickyBar from './compare-sticky-bar';

type Props = { players: PlayerDetail[]; initialShortlistedIds: string[] };

export default function CompareClient({ players, initialShortlistedIds }: Props) {
  const nameAnchorRef = useRef<HTMLDivElement>(null);
  const playersWithStats = players.filter((p) => p.currentSeason?.stats);
  const playersWithActivity = players.filter(
    (p) => (p.currentSeason?.activity?.length ?? 0) > 0,
  );

  return (
    <div className="space-y-3 sm:space-y-4 pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))]">
      <CompareStickyBar players={players} nameAnchorRef={nameAnchorRef} />

      <CompareHeaders
        players={players}
        nameAnchorRef={nameAnchorRef}
        initialShortlistedIds={initialShortlistedIds}
      />

      <CompareAttributesTable players={players} />

      {playersWithStats.length > 0 && <CompareAnalysis players={playersWithStats} />}

      {playersWithActivity.length > 0 && (
        <CompareActivityChart players={playersWithActivity} />
      )}
    </div>
  );
}
