import { AddShortlistDto } from './add-shortlist.dto';
import { validateDto } from '../../common/testing/validate-dto.helper';

const validate = (plain: object) => validateDto(AddShortlistDto, plain);

describe('AddShortlistDto', () => {
  describe('when playerId is valid', () => {
    it('should pass with a non-empty string', async () => {
      const plain = { playerId: 'boca-merentiel-001' };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });
  });

  describe('when playerId is invalid', () => {
    it('should fail when playerId is an empty string', async () => {
      const plain = { playerId: '' };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });

    it('should fail when playerId is missing', async () => {
      const plain = {};

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });

    it('should fail when playerId is a number', async () => {
      const plain = { playerId: 123 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });
  });
});
