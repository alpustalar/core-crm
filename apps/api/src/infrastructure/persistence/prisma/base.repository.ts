import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';
import { mapperArray } from '@common/utils';
import { Paginated } from '@common/interfaces/paginated.type';

export abstract class BaseRepository {
  protected constructor(protected readonly prisma: PrismaService) {}

  protected get db() {
    return txStorage.getStore()?.tx ?? this.prisma;
  }

  /**
   * Aktif bir transaction olmadan çağrılırsa patlar. Pessimistic kilit (`FOR UPDATE`)
   * yalnız çevreleyen tx commit olana kadar tutulur; tx dışında çağrılırsa kilit
   * anında serbest kalır ve sessizce etkisiz olur (footgun). Bu guard onu sesli yapar.
   */
  protected assertInTransaction(method: string): void {
    if (!txStorage.getStore()?.tx) {
      throw new Error(
        `${method}: FOR UPDATE kilidi ancak aktif bir transaction içinde tutulur — ` +
          `txManager.run()/outboxRun() içinden çağırın.`
      );
    }
  }

  /**
   * Verilen satırı `SELECT id ... FOR UPDATE` ile kilitler (pessimistic lock).
   * `table` daima çağıran repo'nun sabit tablo adıdır (kullanıcı girdisi DEĞİL) —
   * enjeksiyon riski yok. Satır okumak için değil, yalnız kilit almak için; asıl
   * tipli okuma çağıran metotta Prisma delegesiyle yapılır (snake_case→camelCase map).
   */
  protected async lockRowForUpdate(table: string, id: string): Promise<void> {
    this.assertInTransaction(`lockRowForUpdate("${table}")`);
    await this.db.$executeRaw(
      Prisma.sql`SELECT id FROM ${Prisma.raw(`"${table}"`)} WHERE id = ${id} FOR UPDATE`
    );
  }

  protected mapPagination<TRaw, TDomain = TRaw>(
    result: { total: number; items: TRaw[] },
    mapperFn?: (raw: TRaw) => TDomain | null | undefined
  ): Paginated<TDomain> {
    return {
      total: result.total,
      items: mapperFn
        ? mapperArray(result.items, mapperFn)
        : (result.items as unknown as TDomain[]),
    };
  }
}
