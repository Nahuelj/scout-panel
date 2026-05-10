import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPlayerDetail, type PlayerDetail } from '@/features/players';
import { CompareClient } from '@/features/compare';
import { fetchShortlistPlayerIdsServer } from '@/features/shortlist/server';

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

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  const initialShortlistedIds = await fetchShortlistPlayerIdsServer(cookieHeader);

  return (
    <CompareClient players={players} initialShortlistedIds={initialShortlistedIds} />
  );
}
