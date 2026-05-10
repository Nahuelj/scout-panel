import { Suspense } from 'react';
import { PlayersGridSkeleton } from '@/features/players';
import { ShortlistGridFromSearchParams } from '@/features/shortlist/server';

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
