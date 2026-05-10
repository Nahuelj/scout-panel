import type { PaginationMeta } from '@/types/api.types';

export type { PaginationMeta };

export type PlayerCardData = {
  id: string;
  name: string;
  photoUrl: string | null;
  position: string;
  nationality: string | null;
  birthDate: string | null;
  currentSeason: {
    club: string;
    clubLogoUrl: string | null;
    league: string | null;
    stats: {
      matchesPlayed: number;
      goals: number;
      assists: number;
      xGPer90: number | null;
    } | null;
  } | null;
};

export type PaginatedPlayersResponse = {
  data: PlayerCardData[];
  meta: PaginationMeta;
};

export type PlayersFilterOptions = {
  nationalities: string[];
};

export type PlayerActivity = {
  monthDate: string;
  minutesPlayed: number;
};

export type PlayerDetailStats = {
  matchesPlayed: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchesPerYellowCard: number | null;
  matchesPerRedCard: number | null;
  dribblesAttempted: number | null;
  dribbleSuccessPct: number | null;
  progressiveCarries: number | null;
  carriesIntoFinalThird: number | null;
  ballRetentionPct: number | null;
  foulsWon: number | null;
  topSpeed: number | null;
  sprintDistance: number | null;
  accelerations: number | null;
  progressiveRuns: number | null;
  distanceCovered: number | null;
  passAccuracyPct: number | null;
  progressivePasses: number | null;
  keyPasses: number | null;
  throughBalls: number | null;
  crossAccuracyPct: number | null;
  xA: number | null;
  weakFootPassPct: number | null;
  weakFootPassAccuracyPct: number | null;
  progressiveWfPasses: number | null;
  skillfulFootPassScore: number | null;
  goalsPer90: number | null;
  xGPer90: number | null;
  shotAccuracyPct: number | null;
  conversionRatePct: number | null;
  shotsOnTarget: number | null;
  touchesInBox: number | null;
  weakFootShotPct: number | null;
  weakFootGoals: number | null;
  weakFootShotAccuracyPct: number | null;
  skillfulFootShotScore: number | null;
  tacklesWonPct: number | null;
  interceptions: number | null;
  recoveries: number | null;
  blocks: number | null;
  aerialDuelsWonPct: number | null;
  clearances: number | null;
  physicalDuelsWonPct: number | null;
  strengthDuels: number | null;
  balance: number | null;
  stamina: number | null;
  bodyContactSuccessPct: number | null;
};

export type PlayerDetail = {
  id: string;
  name: string;
  photoUrl: string | null;
  position: string;
  nationality: string | null;
  birthDate: string | null;
  height: number | null;
  weight: number | null;
  preferredFoot: string | null;
  currentSeason: {
    season: { id: string; name: string; isCurrent: boolean };
    club: {
      id: string;
      name: string;
      shortName: string | null;
      league: string | null;
      country: string | null;
      logoUrl: string | null;
    };
    shirtNumber: number | null;
    contractStart: string | null;
    contractEnd: string | null;
    stats: PlayerDetailStats | null;
    activity: PlayerActivity[];
  } | null;
};
