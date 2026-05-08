import { redirect } from 'next/navigation';
import { getPlayerDetail, type PlayerDetail } from '@/lib/player-detail-api';
import CompareClient from './compare-client';

const MAX_PLAYERS = 3;

type Props = { searchParams: Promise<{ ids?: string }> };

export default async function ComparePage({ searchParams }: Props) {
  const { ids } = await searchParams;

  const requested = (ids ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const unique = Array.from(new Set(requested)).slice(0, MAX_PLAYERS);

  if (unique.length === 0) redirect('/players');

  const fetched = await Promise.all(unique.map((id) => getPlayerDetail(id)));
  const players = fetched.filter((p): p is PlayerDetail => p !== null);

  if (players.length === 0) redirect('/players');
  if (players.length === 1) redirect(`/players/${players[0].id}`);

  return <CompareClient players={players} />;
}
