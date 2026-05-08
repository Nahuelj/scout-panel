'use client';

import { useRef } from 'react';
import PlayerHero from './player-hero';
import PlayerStickyBar from './player-sticky-bar';
import type { PlayerDetail } from '@/lib/player-detail-api';

type Props = { player: PlayerDetail };

export default function PlayerDetailClient({ player }: Props) {
  const nameAnchorRef = useRef<HTMLHeadingElement>(null);

  return (
    <>
      <PlayerStickyBar player={player} nameAnchorRef={nameAnchorRef} />
      <PlayerHero player={player} nameAnchorRef={nameAnchorRef} />
    </>
  );
}
