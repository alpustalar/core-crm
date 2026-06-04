import { Pagination } from '@shared';

export type QueryArgs = {
  where: Record<string, unknown>;
  skip: number | undefined;
  take: number | undefined;
  orderBy: Record<string, string>;
  select?: Record<string, unknown>;
  include?: Record<string, unknown>;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export interface PaginateArgs<T, W> {
  delegate: {
    findMany: (args: any) => Promise<T[]>;
    count: (args: any) => Promise<number>;
  };
  pagination: Pagination;
  where?: W;
  include?: Record<string, unknown>;
  select?: Record<string, unknown>;
}

export async function paginate<T, W>({
  delegate,
  pagination,
  where,
  include,
  select,
}: PaginateArgs<T, W>): Promise<{ items: T[]; total: number }> {
  const { skip, take, orderBy, orderByColumn, search, searchColumn } =
    pagination;

  const searchWhere =
    search && searchColumn
      ? { [searchColumn]: { contains: search, mode: 'insensitive' } }
      : {};

  const finalWhere = { ...(where as Record<string, unknown>), ...searchWhere };

  const queryArgs: QueryArgs = {
    where: finalWhere,
    skip,
    take,
    orderBy: { [orderByColumn ?? 'createdAt']: orderBy ?? 'desc' },
  };

  if (select) {
    queryArgs.select = select;
  } else if (include) {
    queryArgs.include = include;
  }

  const [items, total] = await Promise.all([
    delegate.findMany(queryArgs),
    delegate.count({ where: finalWhere }),
  ]);

  return { items, total };
}

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
