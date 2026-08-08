import { ClientSession, QueryFilter, Model } from 'mongoose';
import { getMongoSession } from './session-storage';

/** Dokümanda saklanan ama domain'e sızmayan altyapı alanları. */
const INTERNAL_FIELDS = ['_id', '__v', 'lockVersion'] as const;

/**
 * Mongo repository'lerinin ortak tabanı — Prisma tarafındaki `BaseRepository`'nin
 * karşılığı. İki şey sağlar: aktif transaction session'ına otomatik bağlanma ve
 * doküman → plain model dönüşümü.
 */
export abstract class MongoBaseRepository {
  /**
   * Aktif transaction session'ı (yoksa undefined → session'sız çalışır). Tüm sorgulara
   * `.session(this.session)` olarak geçirilir; böylece handler transaction'ı elden ele
   * taşımaz — Prisma tarafındaki `this.db` ile aynı ergonomi.
   */
  protected get session(): ClientSession | null {
    return getMongoSession() ?? null;
  }

  protected assertInTransaction(method: string): void {
    if (!getMongoSession()) {
      throw new Error(
        `${method}: satır kilidi ancak aktif bir transaction içinde tutulur — ` +
          `mongoTxManager.run()/outboxRun() içinden çağırın.`
      );
    }
  }

  /**
   * `SELECT … FOR UPDATE` karşılığı. Mongo'da okuma kilit almaz; kilit yazma anında
   * oluşur. Bu yüzden dokümana anlamsız ama gerçek bir yazma (`lockVersion` artışı)
   * uygulanır: aynı dokümanı hedefleyen ikinci transaction write-conflict alıp iptal
   * olur ve `withTransaction` tüm işi baştan çalıştırır (taze okumayla).
   *
   * Neden örtük değil de açık: "nasılsa sonra `update()` çağıracağız, çakışma orada
   * yakalanır" varsayımı, okuyup **koşullu** yazmayan bir akış eklendiği anda sessizce
   * korumasız kalırdı. Kilit niyetini yazmanın kendisi taşır.
   */
  protected async lockDocument<TDoc>(
    model: Model<TDoc>,
    filter: QueryFilter<TDoc>,
    method: string
  ): Promise<TDoc | null> {
    this.assertInTransaction(method);

    return model
      .findOneAndUpdate(filter, { $inc: { lockVersion: 1 } }, { new: true })
      .session(this.session)
      .lean<TDoc>()
      .exec();
  }

  /**
   * Mongo dokümanını domain/plain modele çevirir: `_id` → `id`, altyapı alanları atılır.
   * Şemalar Prisma modelleriyle birebir aynı alan adlarını taşıdığı için dönüş tipi
   * `@shared` generated model ile uyumludur — entity'ler ve query response'ları
   * değişmeden çalışır.
   */
  protected toPlain<TPlain>(doc: unknown): TPlain {
    const source = doc as Record<string, unknown> & { _id: string };
    const plain: Record<string, unknown> = { id: source._id };

    for (const [key, value] of Object.entries(source)) {
      if ((INTERNAL_FIELDS as readonly string[]).includes(key)) continue;
      plain[key] = value;
    }

    return plain as TPlain;
  }

  protected toPlainList<TPlain>(docs: unknown[]): TPlain[] {
    return docs.map((doc) => this.toPlain<TPlain>(doc));
  }
}
