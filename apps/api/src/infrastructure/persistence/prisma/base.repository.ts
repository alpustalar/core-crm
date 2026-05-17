import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';
import { mapperArray } from '@common/utils';

export type MapPaginationResult<T> = {
  total: number;
  items: T[];
};

export abstract class BaseRepository {
  protected constructor(protected readonly prisma: PrismaService) {}

  protected get db() {
    return txStorage.getStore()?.tx ?? this.prisma;
  }

  protected mapPagination<TRaw, TDomain = TRaw>(
    result: { total: number; items: TRaw[] },
    mapperFn?: (raw: TRaw) => TDomain | null | undefined
  ): MapPaginationResult<TDomain> {
    return {
      total: result.total,
      items: mapperFn
        ? mapperArray(result.items, mapperFn)
        : (result.items as unknown as TDomain[]),
    };
  }
}
