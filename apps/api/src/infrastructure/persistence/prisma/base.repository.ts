import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { txStorage } from '@src/infrastructure/transaction/als-storage';
import { mapperArray } from '@common/utils';
import { Paginated } from '@common/interfaces/paginated.type';
import { LockTargetMissingException } from '@common/domain/exceptions/lock-target-missing.exception';

export abstract class BaseRepository {
  protected constructor(protected readonly prisma: PrismaService) {}

  protected get db() {
    // ALS bağlamı veritabanı-bağımsızdır (`tx?: unknown`); Prisma'ya özgü daraltma
    // burada, sürücüyü zaten bilen tek yerde yapılır. Bu handle'ı yalnız Prisma'nın
    // `$transaction` geri çağrısı yazar, dolayısıyla tip güvenlidir.
    return (
      (txStorage.getStore()?.tx as Prisma.TransactionClient) ?? this.prisma
    );
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
   *
   * **Kilit gerçekten alındı mı** bilgisini döner: satır yoksa kilitlenecek tuple da
   * yoktur ve çağrı sessizce etkisiz kalır. `findByIdForUpdate` gibi kilitlenen satırı
   * hemen okuyan yerlerde bu zararsızdır (okuma `null` döner, çağıran tipli NotFound
   * fırlatır); satırın yalnız serileştirme için kilitlendiği yerlerde ise
   * `lockRowForUpdateOrFail` kullanılır.
   *
   * `$executeRaw` değil `$queryRaw`: `$executeRaw` yazma işlemleri için tasarlanmıştır,
   * `SELECT` ile dönüş değeri sözleşmeye bağlı değildir. `$queryRaw` satırları döndürür,
   * dolayısıyla "kilitlendi mi" sorusu tartışmasız yanıtlanır.
   */
  protected async lockRowForUpdate(
    table: string,
    id: string
  ): Promise<boolean> {
    this.assertInTransaction(`lockRowForUpdate("${table}")`);
    const rows = await this.db.$queryRaw<{ id: string }[]>(
      Prisma.sql`SELECT id FROM ${Prisma.raw(`"${table}"`)} WHERE id = ${id} FOR UPDATE`
    );
    return rows.length > 0;
  }

  /**
   * Çapa (anchor) kilitleri için katı varyant: kilitlenen satır **okunmadığı** için
   * yokluğu başka hiçbir yerde fark edilmez; burada patlamazsa işlem eşzamanlılık
   * koruması olmadan devam eder.
   */
  protected async lockRowForUpdateOrFail(
    table: string,
    id: string
  ): Promise<void> {
    const locked = await this.lockRowForUpdate(table, id);
    if (!locked) throw new LockTargetMissingException(table, id);
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
