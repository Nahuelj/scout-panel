import { Suspense } from 'react';
import { PlayersGridFromSearchParams } from './players-grid';
import PlayersGridSkeleton from './players-grid-skeleton';

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
