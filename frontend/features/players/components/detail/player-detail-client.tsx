'use client';

import { useRef } from 'react';
import PlayerHero from './player-hero';
import PlayerStickyBar from './player-sticky-bar';
import type { PlayerDetail } from '@/features/players/types/player.types';

type Props = { player: PlayerDetail; initialShortlisted: boolean };

export default function PlayerDetailClient({ player, initialShortlisted }: Props) {
  const nameAnchorRef = useRef<HTMLHeadingElement>(null);

  return (
    <>
      <PlayerStickyBar player={player} nameAnchorRef={nameAnchorRef} />
      <PlayerHero
        key={player.id}
        player={player}
        nameAnchorRef={nameAnchorRef}
        initialShortlisted={initialShortlisted}
      />
    </>
  );
}
