import type { Position, PreferredFoot } from '@prisma/client';

export type ClubKey = 'boca' | 'river' | 'barcelona' | 'realMadrid';

export type PlayerStatsFixture = {
  matchesPlayed: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  dribblesAttempted?: number;
  dribbleSuccessPct?: number;
  progressiveCarries?: number;
  carriesIntoFinalThird?: number;
  ballRetentionPct?: number;
  foulsWon?: number;
  topSpeed?: number;
  sprintDistance?: number;
  accelerations?: number;
  progressiveRuns?: number;
  distanceCovered?: number;
  passAccuracyPct?: number;
  progressivePasses?: number;
  keyPasses?: number;
  throughBalls?: number;
  crossAccuracyPct?: number;
  xA?: number;
  weakFootPassPct?: number;
  weakFootPassAccuracyPct?: number;
  progressiveWfPasses?: number;
  goalsPer90?: number;
  xGPer90?: number;
  shotAccuracyPct?: number;
  conversionRatePct?: number;
  shotsOnTarget?: number;
  touchesInBox?: number;
  weakFootShotPct?: number;
  weakFootGoals?: number;
  weakFootShotAccuracyPct?: number;
  tacklesWonPct?: number;
  interceptions?: number;
  recoveries?: number;
  blocks?: number;
  aerialDuelsWonPct?: number;
  clearances?: number;
  physicalDuelsWonPct?: number;
  strengthDuels?: number;
  balance?: number;
  stamina?: number;
  bodyContactSuccessPct?: number;
  // Legacy fields kept for backwards compatibility with existing fixture data;
  // they are stripped before insertion (computed at runtime in the API).
  skillfulFootPassScore?: number;
  skillfulFootShotScore?: number;
};

export type PlayerFixture = {
  clubKey: ClubKey;
  id: string;
  name: string;
  birthDate: Date;
  nationality: string;
  position: Position;
  photoUrl: string;
  height: number;
  weight: number;
  preferredFoot: PreferredFoot;
  shirtNumber: number;
  contractStart: Date;
  contractEnd: Date;
  stats: PlayerStatsFixture;
};

export type ClubFixture = {
  name: string;
  shortName: string;
  country: string;
  league: string;
  logoUrl: string;
};
