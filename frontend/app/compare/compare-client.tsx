'use client';

import type { PlayerDetail } from '@/lib/player-detail-api';
import CompareHeaders from './compare-headers';
import CompareAttributesTable from './compare-attributes-table';
import CompareAnalysis from './compare-analysis';
import CompareActivityChart from './compare-activity-chart';

type Props = { players: PlayerDetail[] };

export default function CompareClient({ players }: Props) {
  const playersWithStats = players.filter((p) => p.currentSeason?.stats);
  const playersWithActivity = players.filter(
    (p) => (p.currentSeason?.activity?.length ?? 0) > 0,
  );

  return (
    <div className="space-y-4 pb-8">
      <CompareHeaders players={players} />

      <CompareAttributesTable players={players} />

      {playersWithStats.length > 0 && <CompareAnalysis players={playersWithStats} />}

      {playersWithActivity.length > 0 && (
        <CompareActivityChart players={playersWithActivity} />
      )}
    </div>
  );
}
