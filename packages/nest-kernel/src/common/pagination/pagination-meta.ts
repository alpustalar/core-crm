import { Pagination, PaginationMeta } from '@shared';

/**
 * Sayfalama üst verisini (`total`/`page`/`limit`/`totalPages`) hesaplar.
 */
export function buildPaginationMeta(
  pagination: Pagination,
  total: number
): PaginationMeta {
  const currentPage = Math.floor(pagination.skip / pagination.take) + 1;
  return {
    total,
    page: currentPage,
    limit: pagination.take,
    totalPages: Math.ceil(total / pagination.take),
  };
}
