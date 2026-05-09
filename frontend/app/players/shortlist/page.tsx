import { Suspense } from 'react';
import PlayersGridSkeleton from '@/app/players/players-grid-skeleton';
import { ShortlistGridFromSearchParams } from './shortlist-grid';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ShortlistPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<PlayersGridSkeleton />}>
      <ShortlistGridFromSearchParams searchParams={searchParams} />
    </Suspense>
  );
}
