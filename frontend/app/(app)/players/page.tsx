import { Suspense } from 'react';
import { PlayersGridSkeleton } from '@/features/players';
import { PlayersGridFromSearchParams } from '@/features/players/server';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function PlayersPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<PlayersGridSkeleton />}>
      <PlayersGridFromSearchParams searchParams={searchParams} />
    </Suspense>
  );
}
