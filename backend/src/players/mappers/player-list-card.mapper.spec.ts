import { Position } from '@prisma/client';
import { mapRowToPlayerListCard, PlayerListCardRow } from './player-list-card.mapper';

function buildRow(overrides: Partial<PlayerListCardRow> = {}): PlayerListCardRow {
  return {
    id: 'player-001',
    name: 'Lionel Messi',
    photoUrl: null,
    position: Position.ST,
    nationality: 'Argentina',
    birthDate: new Date('1987-06-24'),
    seasons: [],
    ...overrides,
  };
}

describe('mapRowToPlayerListCard', () => {
  describe('when the player has no seasons', () => {
    it('should return currentSeason as null', () => {
      const row = buildRow({ seasons: [] });

      const result = mapRowToPlayerListCard(row);

      expect(result.currentSeason).toBeNull();
    });
  });

  describe('when the player has a season', () => {
    const season = {
      club: { name: 'Inter Miami', logoUrl: 'https://logo.url', league: 'MLS' },
      stats: { matchesPlayed: 20, goals: 15, assists: 10, xGPer90: 0.85 },
    };

    it('should map club fields correctly', () => {
      const row = buildRow({ seasons: [season] });

      const result = mapRowToPlayerListCard(row);

      expect(result.currentSeason?.club).toBe('Inter Miami');
      expect(result.currentSeason?.clubLogoUrl).toBe('https://logo.url');
      expect(result.currentSeason?.league).toBe('MLS');
    });

    it('should map stats correctly', () => {
      const row = buildRow({ seasons: [season] });

      const result = mapRowToPlayerListCard(row);

      expect(result.currentSeason?.stats).toEqual(season.stats);
    });

    it('should map base player fields correctly', () => {
      const row = buildRow({ seasons: [season] });

      const result = mapRowToPlayerListCard(row);

      expect(result.id).toBe('player-001');
      expect(result.name).toBe('Lionel Messi');
      expect(result.position).toBe(Position.ST);
      expect(result.nationality).toBe('Argentina');
    });

    it('should use only the first season when multiple are present', () => {
      const secondSeason = {
        club: { name: 'FC Barcelona', logoUrl: null, league: 'La Liga' },
        stats: null,
      };
      const row = buildRow({ seasons: [season, secondSeason] });

      const result = mapRowToPlayerListCard(row);

      expect(result.currentSeason?.club).toBe('Inter Miami');
    });
  });
});
