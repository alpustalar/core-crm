import { Pagination } from '@shared';

export interface PaginateArgs<T, W> {
  delegate: {
    findMany: (args: unknown) => Promise<T[]>;
    count: (args: unknown) => Promise<number>;
  };
  pagination: Pagination;
  where?: W;
}

export async function paginate<T, W>({
  delegate,
  pagination,
  where,
}: PaginateArgs<T, W>): Promise<{ items: T[]; total: number }> {
  const { skip, take, orderBy, orderByColumn, search, searchColumn } =
    pagination;

  const searchWhere =
    search && searchColumn
      ? { [searchColumn]: { contains: search, mode: 'insensitive' } }
      : {};

  const finalWhere = { ...where, ...searchWhere };

  const [items, total] = await Promise.all([
    delegate.findMany({
      where: finalWhere,
      skip,
      take,
      orderBy: { [orderByColumn ?? 'createdAt']: orderBy ?? 'desc' },
    }),
    delegate.count({ where: finalWhere }),
  ]);

  return { items, total };
}
