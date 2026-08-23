import { BaseRepository } from './base.repository';
import { PrismaService } from './prisma.service';
import { txStorage } from '@src/infrastructure/transaction/als-storage';
import { LockTargetMissingException } from '@common/domain/exceptions/lock-target-missing.exception';

/**
 * `FOR UPDATE` var olmayan satırda kilitleyecek tuple bulamaz ve **sessizce** etkisiz
 * kalır. Bu davranış kilitlenen satırın hemen okunduğu yerlerde zararsız, yalnız
 * serileştirme için kilitlenen (okunmayan) çapa satırlarında tehlikelidir — orada
 * koruma hiç kurulmadığı hâlde akış hatasız devam eder. Bu testler ayrımın korunmasını
 * garanti eder.
 */
describe('BaseRepository — pessimistic kilit', () => {
  const ROW_ID = '11111111-1111-4111-8111-111111111111';

  class TestRepository extends BaseRepository {
    constructor(prisma: PrismaService) {
      super(prisma);
    }

    lock(table: string, id: string) {
      return this.lockRowForUpdate(table, id);
    }

    lockOrFail(table: string, id: string) {
      return this.lockRowForUpdateOrFail(table, id);
    }
  }

  interface BuildOptions {
    /** Kilit sorgusundan dönen satırlar — boş dizi "satır yok" demektir. */
    rows?: { id: string }[];
  }

  const build = ({ rows = [{ id: ROW_ID }] }: BuildOptions = {}) => {
    const $queryRaw = jest.fn().mockResolvedValue(rows);
    const $executeRaw = jest.fn().mockResolvedValue(0);
    const tx = { $queryRaw, $executeRaw };

    return {
      repo: new TestRepository({} as PrismaService),
      tx,
      $queryRaw,
      $executeRaw,
    };
  };

  /** Repo'nun `db` getter'ı ALS'deki tx'i döndürür; kilit ancak tx içinde tutulur. */
  const inTransaction = <T>(tx: unknown, fn: () => Promise<T>): Promise<T> =>
    txStorage.run({ tx, events: [], correlationId: 'test' }, fn);

  it('satır varsa true döner', async () => {
    const { repo, tx } = build();

    await expect(inTransaction(tx, () => repo.lock('employees', ROW_ID))).resolves.toBe(
      true
    );
  });

  it('satır yoksa false döner — patlamaz', async () => {
    const { repo, tx } = build({ rows: [] });

    await expect(inTransaction(tx, () => repo.lock('employees', ROW_ID))).resolves.toBe(
      false
    );
  });

  it('$executeRaw değil $queryRaw kullanır', async () => {
    const { repo, tx, $queryRaw, $executeRaw } = build();

    await inTransaction(tx, () => repo.lock('employees', ROW_ID));

    // $executeRaw yazma işlemleri içindir; SELECT ile dönüşü sözleşmeye bağlı değil,
    // dolayısıyla "kilitlendi mi" sorusunu güvenilir yanıtlayamaz.
    expect($queryRaw).toHaveBeenCalledTimes(1);
    expect($executeRaw).not.toHaveBeenCalled();
  });

  it('transaction dışında çağrılırsa patlar', async () => {
    const { repo } = build();

    // tx yoksa kilit anında serbest kalır — sessiz etkisizlik yerine sesli hata.
    await expect(repo.lock('employees', ROW_ID)).rejects.toThrow(/transaction/i);
  });

  describe('lockRowForUpdateOrFail (çapa kilitleri)', () => {
    it('satır varsa sessizce geçer', async () => {
      const { repo, tx } = build();

      await expect(
        inTransaction(tx, () => repo.lockOrFail('employees', ROW_ID))
      ).resolves.toBeUndefined();
    });

    it('satır yoksa LockTargetMissingException fırlatır', async () => {
      const { repo, tx } = build({ rows: [] });

      // Çapa satırı okunmadığı için yokluğu başka hiçbir yerde fark edilmez:
      // burada patlamazsa işlem eşzamanlılık koruması olmadan devam eder.
      await expect(
        inTransaction(tx, () => repo.lockOrFail('employees', ROW_ID))
      ).rejects.toBeInstanceOf(LockTargetMissingException);
    });
  });
});
