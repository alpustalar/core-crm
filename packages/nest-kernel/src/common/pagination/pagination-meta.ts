import { Pagination, PaginationMeta } from '@shared';

/**
 * Sayfalama üst verisini (`total`/`page`/`limit`/`totalPages`) hesaplar.
 *
 * Saf aritmetiktir — veritabanıyla ilgisi yok. Eskiden `persistence/prisma/helpers`
 * altında duruyordu; oradaki konumu yanıltıcıydı ve Mongo kullanan messaging'in
 * Prisma klasörüne uzanmasına yol açıyordu.
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
