import { PaginationQueryDto } from './pagination.dto';
import { MAX_PAGE_SIZE } from '../pagination/pagination.helper';
import { validateDto } from '../testing/validate-dto.helper';

const validate = (plain: object) => validateDto(PaginationQueryDto, plain);

describe('PaginationQueryDto', () => {
  describe('when all fields are omitted', () => {
    it('should pass validation', async () => {
      const plain = {};

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });
  });

  describe('when page is provided', () => {
    it('should pass with a valid page number', async () => {
      const plain = { page: 2 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });

    it('should fail when page is 0', async () => {
      const plain = { page: 0 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });

    it('should fail when page is negative', async () => {
      const plain = { page: -5 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });

    it('should fail when page is a decimal', async () => {
      const plain = { page: 1.5 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });
  });

  describe('when pageSize is provided', () => {
    it('should pass with a valid pageSize', async () => {
      const plain = { pageSize: 10 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });

    it('should pass with the maximum allowed pageSize', async () => {
      const plain = { pageSize: MAX_PAGE_SIZE };

      const errors = await validate(plain);

      expect(errors).toHaveLength(0);
    });

    it('should fail when pageSize exceeds the maximum', async () => {
      const plain = { pageSize: MAX_PAGE_SIZE + 1 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });

    it('should fail when pageSize is 0', async () => {
      const plain = { pageSize: 0 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });

    it('should fail when pageSize is a decimal', async () => {
      const plain = { pageSize: 2.5 };

      const errors = await validate(plain);

      expect(errors).toHaveLength(1);
    });
  });
});
