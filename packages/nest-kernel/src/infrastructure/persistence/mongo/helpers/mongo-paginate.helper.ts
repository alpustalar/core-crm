import { ClientSession, QueryFilter, Model, SortOrder } from 'mongoose';
import { Pagination } from '@shared';

export interface MongoPaginateArgs<TDoc> {
  model: Model<TDoc>;
  pagination: Pagination;
  filter?: QueryFilter<TDoc>;
  session?: ClientSession | null;
}

/** Kullanıcıdan gelen arama metnini regex meta-karakterlerinden arındırır. */
const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Prisma tarafındaki `paginate` helper'ının Mongo karşılığı — aynı sözleşme
 * (`{ items, total }`) ve aynı `Pagination` girdisi, böylece query repository'ler
 * ve handler'lar taşınırken sayfalama davranışı değişmez.
 *
 * `search` + `searchColumn` verildiğinde büyük/küçük harf duyarsız "contains" araması
 * yapılır (Prisma'daki `mode: 'insensitive'` karşılığı). Arama metni kullanıcı girdisi
 * olduğundan regex olarak yorumlanmadan önce kaçışlanır — aksi halde `.*` gibi bir
 * girdi tüm koleksiyonu tarardı (ReDoS + veri sızıntısı).
 */
export async function mongoPaginate<TDoc, TPlain = TDoc>({
  model,
  pagination,
  filter,
  session,
}: MongoPaginateArgs<TDoc>): Promise<{ items: TPlain[]; total: number }> {
  const { skip, take, orderBy, orderByColumn, search, searchColumn } =
    pagination;

  const searchFilter =
    search && searchColumn
      ? { [searchColumn]: { $regex: escapeRegex(search), $options: 'i' } }
      : {};

  const finalFilter = {
    ...(filter as Record<string, unknown>),
    ...searchFilter,
  } as QueryFilter<TDoc>;

  const sort: Record<string, SortOrder> = {
    [orderByColumn ?? 'createdAt']: orderBy === 'asc' ? 1 : -1,
  };

  const [items, total] = await Promise.all([
    model
      .find(finalFilter)
      .sort(sort)
      .skip(skip)
      .limit(take)
      .session(session ?? null)
      .lean<TPlain[]>()
      .exec(),
    model
      .countDocuments(finalFilter)
      .session(session ?? null)
      .exec(),
  ]);

  return { items, total };
}
