import { Suspense } from 'react';
import PlayersGrid from './players-grid';
import PlayersGridSkeleton from './players-grid-skeleton';

export default function PlayersPage() {
  return (
    <Suspense fallback={<PlayersGridSkeleton />}>
      <PlayersGrid />
    </Suspense>
  );
}
