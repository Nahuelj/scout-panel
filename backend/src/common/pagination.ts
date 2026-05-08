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

export function buildPaginationMeta(params: {
  page: number;
  pageSize: number;
  totalItems: number;
}): PaginationMeta {
  const { pageSize, totalItems } = params;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
  const page =
    totalPages === 0 ? 1 : Math.min(Math.max(1, params.page), totalPages);
  const hasPreviousPage = totalPages > 0 && page > 1;
  const hasNextPage = totalPages > 0 && page < totalPages;
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}
