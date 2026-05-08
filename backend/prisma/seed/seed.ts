// prisma/seed.ts
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  Position,
  PreferredFoot,
} from '../../generated/prisma/client';

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Season
  const season = await prisma.season.upsert({
    where: { name: '2024-2025' },
    update: {},
    create: {
      name: '2024-2025',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2025-06-30'),
      isCurrent: true,
    },
  });

  // Club
  const club = await prisma.club.upsert({
    where: { name: 'Boca Juniors' },
    update: {},
    create: {
      name: 'Boca Juniors',
      shortName: 'BOCA',
      country: 'Argentina',
      league: 'Liga Profesional Argentina',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Boca_Juniors_logo.svg/200px-Boca_Juniors_logo.svg.png',
    },
  });

  // Player
  const player = await prisma.player.upsert({
    where: { id: 'mock-player-001' },
    update: {},
    create: {
      id: 'mock-player-001',
      name: 'Lucas Alario',
      birthDate: new Date('1992-08-08'),
      nationality: 'Argentina',
      position: Position.ST,
      photoUrl: 'https://i.pravatar.cc/300?u=lucas-alario',
      height: 1.87,
      weight: 81,
      preferredFoot: PreferredFoot.RIGHT,
    },
  });

  // PlayerSeason
  const playerSeason = await prisma.playerSeason.upsert({
    where: { playerId_seasonId: { playerId: player.id, seasonId: season.id } },
    update: {},
    create: {
      playerId: player.id,
      seasonId: season.id,
      clubId: club.id,
      shirtNumber: 9,
      contractStart: new Date('2024-07-01'),
      contractEnd: new Date('2025-06-30'),

      stats: {
        create: {
          // General
          matchesPlayed: 28,
          minutesPlayed: 2134,
          goals: 14,
          assists: 5,
          yellowCards: 3,
          redCards: 0,

          // DRI — Dribbling
          dribblesAttempted: 87,
          dribbleSuccessPct: 61.4,
          progressiveCarries: 43,
          carriesIntoFinalThird: 29,
          ballRetentionPct: 72.1,
          foulsWon: 34,

          // VEL — Pace
          topSpeed: 31.4,
          sprintDistance: 1820,
          accelerations: 210,
          progressiveRuns: 67,
          distanceCovered: 8.7,

          // PAS — Passing
          passAccuracyPct: 79.3,
          progressivePasses: 38,
          keyPasses: 22,
          throughBalls: 4,
          crossAccuracyPct: 31.2,
          xA: 4.8,
          weakFootPassPct: 18.5,
          weakFootPassAccuracyPct: 64.3,
          progressiveWfPasses: 7,

          // TIR — Shooting
          goalsPer90: 0.59,
          xGPer90: 0.52,
          shotAccuracyPct: 58.6,
          conversionRatePct: 22.3,
          shotsOnTarget: 34,
          touchesInBox: 112,
          weakFootShotPct: 14.2,
          weakFootGoals: 2,
          weakFootShotAccuracyPct: 42.0,

          // DEF — Defending
          tacklesWonPct: 38.4,
          interceptions: 12,
          recoveries: 41,
          blocks: 8,
          aerialDuelsWonPct: 52.7,
          clearances: 5,

          // FZA — Physical
          physicalDuelsWonPct: 49.8,
          strengthDuels: 78,
          balance: 7.4,
          stamina: 6.9,
          bodyContactSuccessPct: 55.2,

          // Scores de pie
          skillfulFootPassScore: 8.0,
          skillfulFootShotScore: 7.2,
        },
      },
    },
  });

  // PlayerActivity
  await prisma.playerActivity.createMany({
    data: [
      { monthDate: '2024-08-01', minutesPlayed: 270 },
      { monthDate: '2024-09-01', minutesPlayed: 315 },
      { monthDate: '2024-10-01', minutesPlayed: 360 },
      { monthDate: '2024-11-01', minutesPlayed: 290 },
      { monthDate: '2024-12-01', minutesPlayed: 270 },
      { monthDate: '2025-01-01', minutesPlayed: 225 },
      { monthDate: '2025-02-01', minutesPlayed: 180 },
      { monthDate: '2025-03-01', minutesPlayed: 224 },
    ].map(({ monthDate, minutesPlayed }) => ({
      playerSeasonId: playerSeason.id,
      monthDate: new Date(monthDate),
      minutesPlayed,
    })),
    skipDuplicates: true,
  });

  console.log('Seed complete:', { player, club, season, playerSeason });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
