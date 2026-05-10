import type { Prisma } from '@prisma/client';

export const PLAYER_LIST_SEASON_SELECT = {
  club: {
    select: {
      name: true,
      league: true,
      logoUrl: true,
    },
  },
  stats: {
    select: {
      matchesPlayed: true,
      goals: true,
      assists: true,
      xGPer90: true,
    },
  },
} as const satisfies Prisma.PlayerSeasonSelect;

export const PLAYER_LIST_SELECT = {
  id: true,
  name: true,
  photoUrl: true,
  position: true,
  nationality: true,
  birthDate: true,
} as const satisfies Prisma.PlayerSelect;
