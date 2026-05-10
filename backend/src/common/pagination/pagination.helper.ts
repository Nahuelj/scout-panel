export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type PaginationQuery = {
  page?: number;
  pageSize?: number;
};

export type ResolvedPagination = {
  page: number;
  pageSize: number;
};

export function resolvePagination(query: PaginationQuery): ResolvedPagination {
  const rawPageSize =
    query.pageSize === undefined || Number.isNaN(query.pageSize)
      ? DEFAULT_PAGE_SIZE
      : query.pageSize;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawPageSize));
  const requestedPage =
    query.page === undefined || Number.isNaN(query.page)
      ? DEFAULT_PAGE
      : query.page;
  return { page: Math.max(1, requestedPage), pageSize };
}

export function buildPaginationMeta(params: {
  page: number;
  pageSize: number;
  totalItems: number;
}): PaginationMeta {
  const { pageSize, totalItems } = params;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const page =
    totalPages === 0 ? 1 : Math.min(Math.max(1, params.page), totalPages);
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: totalPages > 0 && page < totalPages,
    hasPreviousPage: totalPages > 0 && page > 1,
  };
}
