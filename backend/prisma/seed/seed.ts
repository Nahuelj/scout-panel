import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Club } from '@prisma/client';
import { clubsFixture } from './fixtures/clubs';
import type { ClubKey, PlayerFixture } from './fixtures/types';
import { bocaPlayers } from './fixtures/players/boca';
import { riverPlayers } from './fixtures/players/river';
import { barcelonaPlayers } from './fixtures/players/barcelona';
import { realMadridPlayers } from './fixtures/players/realMadrid';

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

const SEASON_NAME = '2023-2024';
const SEASON_START = new Date('2023-07-01');
const SEASON_END = new Date('2024-06-30');

const SEASON_ACTIVITY_MONTHS = [
  '2023-08-01',
  '2023-09-01',
  '2023-10-01',
  '2023-11-01',
  '2023-12-01',
  '2024-01-01',
  '2024-02-01',
  '2024-03-01',
  '2024-04-01',
  '2024-05-01',
];

// Drop fields that are no longer persisted (computed at runtime in the
// service layer): skillfulFootPassScore and skillfulFootShotScore.
function stripDerivedStatsFields(
  stats: Record<string, unknown>,
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = { ...stats };
  delete cleaned.skillfulFootPassScore;
  delete cleaned.skillfulFootShotScore;
  return cleaned;
}

async function upsertSeason() {
  return prisma.season.upsert({
    where: { name: SEASON_NAME },
    update: { isCurrent: true },
    create: {
      name: SEASON_NAME,
      startDate: SEASON_START,
      endDate: SEASON_END,
      isCurrent: true,
    },
  });
}

async function upsertClubs(): Promise<Record<ClubKey, Club>> {
  const entries = await Promise.all(
    (Object.keys(clubsFixture) as ClubKey[]).map(async (key) => {
      const data = clubsFixture[key];
      const club = await prisma.club.upsert({
        where: { name: data.name },
        update: {
          shortName: data.shortName,
          country: data.country,
          league: data.league,
          logoUrl: data.logoUrl,
        },
        create: data,
      });
      return [key, club] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<ClubKey, Club>;
}

async function seedPlayer(
  player: PlayerFixture,
  clubs: Record<ClubKey, Club>,
  seasonId: string,
) {
  const created = await prisma.player.upsert({
    where: { id: player.id },
    update: {},
    create: {
      id: player.id,
      name: player.name,
      birthDate: player.birthDate,
      nationality: player.nationality,
      position: player.position,
      photoUrl: player.photoUrl,
      height: player.height,
      weight: player.weight,
      preferredFoot: player.preferredFoot,
    },
  });

  const cleanStats = stripDerivedStatsFields(
    player.stats as unknown as Record<string, unknown>,
  );

  const playerSeason = await prisma.playerSeason.upsert({
    where: {
      playerId_seasonId: { playerId: created.id, seasonId },
    },
    update: {},
    create: {
      playerId: created.id,
      seasonId,
      clubId: clubs[player.clubKey].id,
      shirtNumber: player.shirtNumber,
      contractStart: player.contractStart,
      contractEnd: player.contractEnd,
      stats: { create: cleanStats as never },
    },
  });

  await prisma.playerActivity.createMany({
    data: SEASON_ACTIVITY_MONTHS.map((month) => ({
      playerSeasonId: playerSeason.id,
      monthDate: new Date(month),
      minutesPlayed: 180 + Math.floor(Math.random() * 160),
    })),
    skipDuplicates: true,
  });
}

async function main() {
  await prisma.player.deleteMany({});

  const season = await upsertSeason();
  const clubs = await upsertClubs();

  const allPlayers: PlayerFixture[] = [
    ...bocaPlayers,
    ...riverPlayers,
    ...barcelonaPlayers,
    ...realMadridPlayers,
  ];

  for (const player of allPlayers) {
    await seedPlayer(player, clubs, season.id);
  }

  console.log(
    `Seed completed - ${allPlayers.length} players across ${
      Object.keys(clubs).length
    } clubs (${SEASON_NAME})`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
