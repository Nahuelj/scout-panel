import type { PlayerDetailStats } from '@/features/players/types/player.types';
import {
  categoryLabel,
  computeRadarScores,
  formatCardIntervalGames,
  formatValue,
} from './player-stats-metadata';

function makeStats(overrides: Partial<PlayerDetailStats> = {}): PlayerDetailStats {
  const base: PlayerDetailStats = {
    matchesPlayed: 0,
    minutesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchesPerYellowCard: null,
    matchesPerRedCard: null,
    dribblesAttempted: null,
    dribbleSuccessPct: null,
    progressiveCarries: null,
    carriesIntoFinalThird: null,
    ballRetentionPct: null,
    foulsWon: null,
    topSpeed: null,
    sprintDistance: null,
    accelerations: null,
    progressiveRuns: null,
    distanceCovered: null,
    passAccuracyPct: null,
    progressivePasses: null,
    keyPasses: null,
    throughBalls: null,
    crossAccuracyPct: null,
    xA: null,
    weakFootPassPct: null,
    weakFootPassAccuracyPct: null,
    progressiveWfPasses: null,
    skillfulFootPassScore: null,
    goalsPer90: null,
    xGPer90: null,
    shotAccuracyPct: null,
    conversionRatePct: null,
    shotsOnTarget: null,
    touchesInBox: null,
    weakFootShotPct: null,
    weakFootGoals: null,
    weakFootShotAccuracyPct: null,
    skillfulFootShotScore: null,
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
  };
  return { ...base, ...overrides };
}

describe('formatValue', () => {
  it('returns em-dash for null/undefined', () => {
    expect(formatValue(null, 'number')).toBe('—');
    expect(formatValue(undefined, 'percentage')).toBe('—');
  });

  it('formats decimals to one decimal place', () => {
    expect(formatValue(12.345, 'decimal')).toBe('12.3');
    expect(formatValue(0, 'decimal')).toBe('0.0');
  });

  it('formats percentages with % suffix', () => {
    expect(formatValue(75.5, 'percentage')).toBe('75.5%');
    expect(formatValue(100, 'percentage')).toBe('100.0%');
  });

  it('formats numbers as raw stringified value', () => {
    expect(formatValue(42, 'number')).toBe('42');
    expect(formatValue(0, 'number')).toBe('0');
  });
});

describe('formatCardIntervalGames', () => {
  it('returns em-dash when null or undefined', () => {
    expect(formatCardIntervalGames(null)).toBe('—');
    expect(formatCardIntervalGames(undefined)).toBe('—');
  });

  it('formats with one decimal', () => {
    expect(formatCardIntervalGames(4)).toBe('≈ 1 card every 4.0 games');
    expect(formatCardIntervalGames(2.7)).toBe('≈ 1 card every 2.7 games');
  });
});

describe('categoryLabel', () => {
  it('returns the part after the em-dash separator', () => {
    expect(categoryLabel('SHO — Shooting')).toBe('Shooting');
    expect(categoryLabel('PAS — Passing')).toBe('Passing');
  });

  it('returns the original title when no separator is present', () => {
    expect(categoryLabel('NoSeparator')).toBe('NoSeparator');
  });
});

describe('computeRadarScores', () => {
  it('returns scores for all six categories', () => {
    const scores = computeRadarScores(makeStats());
    expect(scores).toHaveLength(6);
    expect(scores.map((s) => s.category)).toEqual(['SHO', 'PAS', 'PHY', 'DEF', 'PAC', 'DRI']);
  });

  it('returns 0 for every category when all stats are null', () => {
    const scores = computeRadarScores(makeStats());
    for (const s of scores) {
      expect(s.score).toBe(0);
    }
  });

  it('produces integer scores between 0 and 100', () => {
    const scores = computeRadarScores(
      makeStats({
        shotAccuracyPct: 50,
        conversionRatePct: 25,
        xGPer90: 0.75,
        skillfulFootShotScore: 7,
        passAccuracyPct: 80,
        crossAccuracyPct: 40,
        skillfulFootPassScore: 6,
        physicalDuelsWonPct: 60,
        balance: 8,
        stamina: 9,
        bodyContactSuccessPct: 70,
        tacklesWonPct: 65,
        aerialDuelsWonPct: 55,
        interceptions: 40,
        topSpeed: 32,
        distanceCovered: 10,
        accelerations: 200,
        dribbleSuccessPct: 60,
        ballRetentionPct: 75,
        progressiveCarries: 50,
      }),
    );
    for (const s of scores) {
      expect(Number.isInteger(s.score)).toBe(true);
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
    }
  });

  it('caps normalized values at 100 for outliers', () => {
    const scores = computeRadarScores(
      makeStats({
        topSpeed: 999,
        distanceCovered: 999,
        accelerations: 99999,
      }),
    );
    const pac = scores.find((s) => s.category === 'PAC');
    expect(pac?.score).toBe(100);
  });
});
