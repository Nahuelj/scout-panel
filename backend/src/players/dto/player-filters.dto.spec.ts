import { Position } from '@prisma/client';
import { PlayerFiltersDto } from './player-filters.dto';
import { validateDto } from '../../common/testing/validate-dto.helper';

const validate = (plain: object) => validateDto(PlayerFiltersDto, plain);

describe('PlayerFiltersDto', () => {
  describe('when all fields are omitted', () => {
    it('should pass validation', async () => {
      const plain = {};

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });
  });

  describe('position', () => {
    it('should pass with a valid position', async () => {
      const plain = { position: Position.GK };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });

    it('should fail with an invalid position value', async () => {
      const plain = { position: 'INVALID' };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });
  });

  describe('nationality', () => {
    it('should pass with a valid string', async () => {
      const plain = { nationality: 'Argentina' };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });

    it('should fail when nationality is a number', async () => {
      const plain = { nationality: 123 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });
  });

  describe('seasonId', () => {
    it('should pass with a valid string', async () => {
      const plain = { seasonId: 'season-2024' };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });

    it('should fail when seasonId is a number', async () => {
      const plain = { seasonId: 42 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });
  });

  describe('search', () => {
    it('should pass with a valid string', async () => {
      const plain = { search: 'messi' };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });

    it('should fail when search is a number', async () => {
      const plain = { search: 99 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });
  });

  describe('minAge', () => {
    it('should pass with a valid integer', async () => {
      const plain = { minAge: 18 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });

    it('should pass with 0', async () => {
      const plain = { minAge: 0 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });

    it('should fail when minAge is negative', async () => {
      const plain = { minAge: -1 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });

    it('should fail when minAge is a decimal', async () => {
      const plain = { minAge: 18.5 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });
  });

  describe('maxAge', () => {
    it('should pass with a valid integer', async () => {
      const plain = { maxAge: 35 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });

    it('should pass with 0', async () => {
      const plain = { maxAge: 0 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });

    it('should fail when maxAge is negative', async () => {
      const plain = { maxAge: -1 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });

    it('should fail when maxAge is a decimal', async () => {
      const plain = { maxAge: 30.9 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });
  });
});
