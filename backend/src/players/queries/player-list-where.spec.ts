import { Position } from '@prisma/client';
import { buildPlayerListWhereContext } from './player-list-where';

describe('buildPlayerListWhereContext', () => {
  describe('seasonWhere', () => {
    it('should filter by current season when seasonId is not provided', () => {
      const query = {};

      const { seasonWhere } = buildPlayerListWhereContext(query);

      expect(seasonWhere).toEqual({ season: { isCurrent: true } });
    });

    it('should filter by the provided seasonId', () => {
      const query = { seasonId: 'season-2024' };

      const { seasonWhere } = buildPlayerListWhereContext(query);

      expect(seasonWhere).toEqual({ seasonId: 'season-2024' });
    });
  });

  describe('playerWhere — simple filters', () => {
    it('should include position filter when provided', () => {
      const query = { position: Position.GK };

      const { playerWhere } = buildPlayerListWhereContext(query);

      expect(playerWhere).toMatchObject({ position: Position.GK });
    });

    it('should not include position filter when omitted', () => {
      const query = {};

      const { playerWhere } = buildPlayerListWhereContext(query);

      expect(playerWhere).not.toHaveProperty('position');
    });

    it('should include nationality filter when provided', () => {
      const query = { nationality: 'Argentina' };

      const { playerWhere } = buildPlayerListWhereContext(query);

      expect(playerWhere).toMatchObject({ nationality: 'Argentina' });
    });

    it('should include case-insensitive name search when search is provided', () => {
      const query = { search: 'messi' };

      const { playerWhere } = buildPlayerListWhereContext(query);

      expect(playerWhere).toMatchObject({
        name: { contains: 'messi', mode: 'insensitive' },
      });
    });

    it('should not include name filter when search is omitted', () => {
      const query = {};

      const { playerWhere } = buildPlayerListWhereContext(query);

      expect(playerWhere).not.toHaveProperty('name');
    });
  });

  describe('playerWhere — age filters', () => {
    it('should not include birthDate filter when neither minAge nor maxAge is provided', () => {
      const query = {};

      const { playerWhere } = buildPlayerListWhereContext(query);

      expect(playerWhere).not.toHaveProperty('birthDate');
    });

    it('should set birthDate.lte when minAge is provided', () => {
      const query = { minAge: 20 };

      const { playerWhere } = buildPlayerListWhereContext(query);

      expect(playerWhere).toHaveProperty('birthDate.lte');
      const lte = (playerWhere.birthDate as { lte: Date }).lte;
      const expectedYear = new Date().getFullYear() - 20;
      expect(lte.getFullYear()).toBe(expectedYear);
    });

    it('should set birthDate.gte when maxAge is provided', () => {
      const query = { maxAge: 30 };

      const { playerWhere } = buildPlayerListWhereContext(query);

      expect(playerWhere).toHaveProperty('birthDate.gte');
    });

    it('should set both birthDate.lte and birthDate.gte when both ages are provided', () => {
      const query = { minAge: 20, maxAge: 30 };

      const { playerWhere } = buildPlayerListWhereContext(query);

      expect(playerWhere).toHaveProperty('birthDate.lte');
      expect(playerWhere).toHaveProperty('birthDate.gte');
    });
  });
});
