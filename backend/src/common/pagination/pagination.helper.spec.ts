import {
  resolvePagination,
  buildPaginationMeta,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from './pagination.helper';

describe('resolvePagination', () => {
  describe('when no values are provided', () => {
    it('should return defaults', () => {
      const query = {};

      const result = resolvePagination(query);

      expect(result).toEqual({ page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE });
    });
  });

  describe('when valid values are provided', () => {
    it('should return the provided page and pageSize', () => {
      const query = { page: 3, pageSize: 25 };

      const result = resolvePagination(query);

      expect(result).toEqual({ page: 3, pageSize: 25 });
    });
  });

  describe('when page is out of bounds', () => {
    it('should clamp page to 1 when page is 0', () => {
      const query = { page: 0 };

      const result = resolvePagination(query);

      expect(result.page).toBe(1);
    });

    it('should clamp page to 1 when page is negative', () => {
      const query = { page: -5 };

      const result = resolvePagination(query);

      expect(result.page).toBe(1);
    });
  });

  describe('when pageSize is out of bounds', () => {
    it('should clamp pageSize to MAX_PAGE_SIZE when exceeded', () => {
      const query = { pageSize: MAX_PAGE_SIZE + 50 };

      const result = resolvePagination(query);

      expect(result.pageSize).toBe(MAX_PAGE_SIZE);
    });

    it('should clamp pageSize to 1 when it is 0', () => {
      const query = { pageSize: 0 };

      const result = resolvePagination(query);

      expect(result.pageSize).toBe(1);
    });
  });
});

describe('buildPaginationMeta', () => {
  describe('when there are no items', () => {
    it('should return 0 totalPages and page 1', () => {
      const params = { page: 1, pageSize: 10, totalItems: 0 };

      const result = buildPaginationMeta(params);

      expect(result.totalPages).toBe(0);
      expect(result.page).toBe(1);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
    });
  });

  describe('when items fit in a single page', () => {
    it('should return 1 totalPage with no next or previous', () => {
      const params = { page: 1, pageSize: 10, totalItems: 5 };

      const result = buildPaginationMeta(params);

      expect(result.totalPages).toBe(1);
      expect(result.hasNextPage).toBe(false);
      expect(result.hasPreviousPage).toBe(false);
    });
  });

  describe('when items span multiple pages', () => {
    it('should calculate totalPages correctly', () => {
      const params = { page: 1, pageSize: 10, totalItems: 25 };

      const result = buildPaginationMeta(params);

      expect(result.totalPages).toBe(3);
    });

    it('should set hasNextPage true when not on the last page', () => {
      const params = { page: 1, pageSize: 10, totalItems: 25 };

      const result = buildPaginationMeta(params);

      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(false);
    });

    it('should set hasPreviousPage true when not on the first page', () => {
      const params = { page: 2, pageSize: 10, totalItems: 25 };

      const result = buildPaginationMeta(params);

      expect(result.hasPreviousPage).toBe(true);
    });

    it('should clamp page to totalPages when page exceeds it', () => {
      const params = { page: 99, pageSize: 10, totalItems: 25 };

      const result = buildPaginationMeta(params);

      expect(result.page).toBe(3);
      expect(result.hasNextPage).toBe(false);
    });
  });
});
