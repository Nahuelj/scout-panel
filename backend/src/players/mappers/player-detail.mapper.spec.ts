import { Position } from '@prisma/client';
import { mapRowToPlayerDetail, PlayerDetailRow, PlayerDetailRawStats } from './player-detail.mapper';

function buildStats(overrides: Partial<PlayerDetailRawStats> = {}): PlayerDetailRawStats {
  return {
    matchesPlayed: 10,
    minutesPlayed: 900,
    goals: 5,
    assists: 3,
    yellowCards: 2,
    redCards: 1,
    dribblesAttempted: 20,
    dribbleSuccessPct: null,
    progressiveCarries: 15,
    carriesIntoFinalThird: 8,
    ballRetentionPct: null,
    foulsWon: 10,
    topSpeed: null,
    sprintDistance: null,
    accelerations: null,
    progressiveRuns: null,
    distanceCovered: null,
    passAccuracyPct: 80,
    progressivePasses: 30,
    keyPasses: 5,
    throughBalls: 2,
    crossAccuracyPct: null,
    xA: null,
    weakFootPassPct: null,
    weakFootPassAccuracyPct: null,
    progressiveWfPasses: null,
    goalsPer90: null,
    xGPer90: null,
    shotAccuracyPct: 60,
    conversionRatePct: null,
    shotsOnTarget: null,
    touchesInBox: null,
    weakFootShotPct: null,
    weakFootGoals: null,
    weakFootShotAccuracyPct: null,
    tacklesWonPct: null,
    interceptions: null,
    recoveries: null,
    blocks: null,
    aerialDuelsWonPct: null,
    clearances: null,
    physicalDuelsWonPct: null,
    strengthDuels: null,
    balance: null,
    stamina: null,
    bodyContactSuccessPct: null,
    ...overrides,
  };
}

function buildRow(overrides: Partial<PlayerDetailRow> = {}): PlayerDetailRow {
  return {
    id: 'player-001',
    name: 'Lionel Messi',
    photoUrl: null,
    position: Position.ST,
    nationality: 'Argentina',
    birthDate: new Date('1987-06-24'),
    height: null,
    weight: null,
    preferredFoot: null,
    seasons: [],
    ...overrides,
  };
}

function buildSeason(statsOverrides: Partial<PlayerDetailRawStats> | null = {}) {
  return {
    shirtNumber: 10,
    contractStart: null,
    contractEnd: null,
    season: { id: 'season-2024', name: '2024', isCurrent: true },
    club: {
      id: 'club-001',
      name: 'Inter Miami',
      shortName: 'MIA',
      league: 'MLS',
      country: 'USA',
      logoUrl: null,
    },
    activity: [],
    stats: statsOverrides !== null ? buildStats(statsOverrides) : null,
  };
}

describe('mapRowToPlayerDetail', () => {
  describe('when the player has no seasons', () => {
    it('should return currentSeason as null', () => {
      const row = buildRow({ seasons: [] });

      const result = mapRowToPlayerDetail(row);

      expect(result.currentSeason).toBeNull();
    });
  });

  describe('when the player has a season with stats', () => {
    it('should compute matchesPerYellowCard correctly', () => {
      const row = buildRow({
        seasons: [buildSeason({ matchesPlayed: 10, yellowCards: 2 })],
      });

      const result = mapRowToPlayerDetail(row);

      expect(result.currentSeason?.stats?.matchesPerYellowCard).toBe(5);
    });

    it('should return null for matchesPerYellowCard when yellowCards is 0', () => {
      const row = buildRow({
        seasons: [buildSeason({ matchesPlayed: 10, yellowCards: 0 })],
      });

      const result = mapRowToPlayerDetail(row);

      expect(result.currentSeason?.stats?.matchesPerYellowCard).toBeNull();
    });

    it('should return null for matchesPerYellowCard when matchesPlayed is 0', () => {
      const row = buildRow({
        seasons: [buildSeason({ matchesPlayed: 0, yellowCards: 2 })],
      });

      const result = mapRowToPlayerDetail(row);

      expect(result.currentSeason?.stats?.matchesPerYellowCard).toBeNull();
    });

    it('should compute matchesPerRedCard correctly', () => {
      const row = buildRow({
        seasons: [buildSeason({ matchesPlayed: 20, redCards: 2 })],
      });

      const result = mapRowToPlayerDetail(row);

      expect(result.currentSeason?.stats?.matchesPerRedCard).toBe(10);
    });

    it('should return null for matchesPerRedCard when redCards is 0', () => {
      const row = buildRow({
        seasons: [buildSeason({ matchesPlayed: 10, redCards: 0 })],
      });

      const result = mapRowToPlayerDetail(row);

      expect(result.currentSeason?.stats?.matchesPerRedCard).toBeNull();
    });

    it('should compute skillfulFootPassScore from passAccuracyPct', () => {
      const row = buildRow({
        seasons: [buildSeason({ passAccuracyPct: 80 })],
      });

      const result = mapRowToPlayerDetail(row);

      expect(result.currentSeason?.stats?.skillfulFootPassScore).toBe(8);
    });

    it('should compute skillfulFootShotScore from shotAccuracyPct', () => {
      const row = buildRow({
        seasons: [buildSeason({ shotAccuracyPct: 60 })],
      });

      const result = mapRowToPlayerDetail(row);

      expect(result.currentSeason?.stats?.skillfulFootShotScore).toBe(6);
    });

    it('should return null scores when accuracy fields are null', () => {
      const row = buildRow({
        seasons: [buildSeason({ passAccuracyPct: null, shotAccuracyPct: null })],
      });

      const result = mapRowToPlayerDetail(row);

      expect(result.currentSeason?.stats?.skillfulFootPassScore).toBeNull();
      expect(result.currentSeason?.stats?.skillfulFootShotScore).toBeNull();
    });
  });

  describe('when the player has a season without stats', () => {
    it('should return stats as null', () => {
      const row = buildRow({ seasons: [buildSeason(null)] });

      const result = mapRowToPlayerDetail(row);

      expect(result.currentSeason?.stats).toBeNull();
    });
  });
});
