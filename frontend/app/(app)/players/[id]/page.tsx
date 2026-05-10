import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPlayerDetail } from '@/lib/player-detail-api';
import { fetchShortlistPlayerIdsServer } from '@/lib/shortlist-api';
import PlayerDetailClient from './player-detail-client';
import PlayerClubCard from './player-club-card';
import PlayerAttributesBar from './player-attributes-bar';
import PlayerAnalysis from './player-analysis';
import PlayerActivityChart from './player-activity-chart';

type Props = { params: Promise<{ id: string }> };

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const player = await getPlayerDetail(id);

  if (!player) notFound();

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  const shortlistIds = await fetchShortlistPlayerIdsServer(cookieHeader);
  const initialShortlisted = shortlistIds.includes(id);

  return (
    <div className="space-y-4 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))]">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <PlayerDetailClient player={player} initialShortlisted={initialShortlisted} />
        <PlayerClubCard player={player} />
      </div>

      <PlayerAttributesBar player={player} />

      {player.currentSeason?.stats && (
        <PlayerAnalysis stats={player.currentSeason.stats} />
      )}

      {player.currentSeason?.activity && player.currentSeason.activity.length > 0 && (
        <PlayerActivityChart
          activity={player.currentSeason.activity}
          seasonName={player.currentSeason.season.name}
        />
      )}
    </div>
  );
}
