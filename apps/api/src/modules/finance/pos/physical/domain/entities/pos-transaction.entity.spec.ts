import { PosTransaction } from './pos-transaction.entity';
import {
  PosTransactionAlreadySettledException,
  PosTransactionClinicMismatchException,
  PosTransactionReversalRequiresOriginalException,
} from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
import PosTransactionKindSchema from '@input-type-schemas/PosTransactionKindSchema';
import CurrencySchema from '@input-type-schemas/CurrencySchema';

/**
 * İptal kilidi (`activeVoidOriginalId`) DB'deki unique kısıtın domain tarafındaki
 * yüzüdür: canlı bir iptalde dolu, terminal başarısızlıkta boştur. Bu davranış
 * bozulursa ya çift iptal (kilit erken bırakılır) ya da bir daha hiç iptal
 * edilemeyen satış (kilit hiç bırakılmaz) ortaya çıkar.
 */
describe('PosTransaction — ters kayıt bağı ve iptal kilidi', () => {
  const DEVICE_ID = '11111111-1111-4111-8111-111111111111';
  const CLINIC_ID = '22222222-2222-4222-8222-222222222222';
  const ORIGINAL_ID = '33333333-3333-4333-8333-333333333333';

  const base = {
    posDeviceId: DEVICE_ID,
    clinicId: CLINIC_ID,
    amount: 123.45,
    currency: CurrencySchema.enum.TRY,
  };

  const makeVoid = () =>
    PosTransaction.create({
      ...base,
      kind: PosTransactionKindSchema.enum.VOID,
      originalPosTransactionId: ORIGINAL_ID,
    });

  it('satış kaydı ters kayıt alanlarını taşımaz', () => {
    const sale = PosTransaction.create(base);

    expect(sale.kind).toBe(PosTransactionKindSchema.enum.SALE);
    expect(sale.originalPosTransactionId).toBeNull();
    expect(sale.activeVoidOriginalId).toBeNull();
  });

  it('iptal kaydı orijinale bağlanır ve kilidi PENDING iken tutar', () => {
    const voidTx = makeVoid();

    expect(voidTx.kind).toBe(PosTransactionKindSchema.enum.VOID);
    expect(voidTx.originalPosTransactionId).toBe(ORIGINAL_ID);
    // Cihaz çağrısı sürerken gelen ikinci iptal DB kısıtına takılsın diye kilit
    // kayıt doğar doğmaz tutulur.
    expect(voidTx.activeVoidOriginalId).toBe(ORIGINAL_ID);
  });

  it('iade kaydı orijinale bağlanır ama iptal kilidini tutmaz (kısmi iadeler çoklu olabilir)', () => {
    const refundTx = PosTransaction.create({
      ...base,
      amount: 30,
      kind: PosTransactionKindSchema.enum.REFUND,
      originalPosTransactionId: ORIGINAL_ID,
    });

    expect(refundTx.originalPosTransactionId).toBe(ORIGINAL_ID);
    expect(refundTx.activeVoidOriginalId).toBeNull();
  });

  it('orijinal işlem verilmeden ters kayıt açılamaz', () => {
    expect(() =>
      PosTransaction.create({
        ...base,
        kind: PosTransactionKindSchema.enum.VOID,
      })
    ).toThrow(PosTransactionReversalRequiresOriginalException);
  });

  it('başarılı iptal kilidi bırakmaz — satış bir daha iptal edilemez', () => {
    const voidTx = makeVoid();

    voidTx.markSuccess('HOSTREF-1');

    expect(voidTx.activeVoidOriginalId).toBe(ORIGINAL_ID);
  });

  it.each([
    ['markFailed', (tx: PosTransaction) => tx.markFailed()],
    ['markCancelled', (tx: PosTransaction) => tx.markCancelled()],
    ['markTimeout', (tx: PosTransaction) => tx.markTimeout()],
  ])('%s kilidi bırakır — iptal yeniden denenebilir', (_name, apply) => {
    const voidTx = makeVoid();

    apply(voidTx);

    expect(voidTx.activeVoidOriginalId).toBeNull();
  });

  it('bırakılan kilit kalıcılığa da yansır (repo update alanı yazabilsin)', () => {
    const voidTx = makeVoid();

    voidTx.markFailed();

    const persisted = voidTx.toPersistence();
    expect(persisted.activeVoidOriginalId).toBeNull();
    expect(persisted.kind).toBe(PosTransactionKindSchema.enum.VOID);
    expect(persisted.originalPosTransactionId).toBe(ORIGINAL_ID);
  });

  describe('kiracı kapsamı — assertBelongsToClinic', () => {
    const OTHER_CLINIC = '44444444-4444-4444-8444-444444444444';

    it('kendi kliniği geçilirse sorun çıkarmaz', () => {
      const sale = PosTransaction.create(base);
      expect(() => sale.assertBelongsToClinic(CLINIC_ID)).not.toThrow();
    });

    it('başka klinik geçilirse reddeder', () => {
      // Regresyon: iptal/iade handler'ları yetkiyi `input.clinicId` ile veriyor,
      // ters kaydedilecek orijinal işlem ise ayrı bir alandan geliyordu. Kontrol
      // yokken A kliniği personeli B kliniğinin satışını iptal edebiliyordu —
      // para B'nin üye işyerinden geri döner, kayıt A'nın defterine düşerdi.
      const sale = PosTransaction.create(base);

      expect(() => sale.assertBelongsToClinic(OTHER_CLINIC)).toThrow(
        PosTransactionClinicMismatchException
      );
    });

    it('reddetme meta ile hangi kliniklerin çeliştiğini bildirir', () => {
      const sale = PosTransaction.create(base);
      try {
        sale.assertBelongsToClinic(OTHER_CLINIC);
        throw new Error('beklenen hata fırlatılmadı');
      } catch (caught) {
        const error = caught as PosTransactionClinicMismatchException;
        expect(error.meta).toEqual({
          transactionClinicId: CLINIC_ID,
          requestedClinicId: OTHER_CLINIC,
        });
      }
    });
  });


  describe('durum geçişi yalnız PENDING\'den yapılabilir', () => {
    /**
     * Regresyon: `markSuccess` durum kontrolü yapmıyordu. Cihazın tekrar
     * gönderdiği bir callback işlemi ikinci kez sonuçlandırıyor, PosPaymentSync
     * de o an PENDING olan **bir sonraki taksiti** kapatıyordu → tek kart
     * çekimiyle iki taksit tahsil edilmiş görünüyordu.
     */
    it('sonuçlanmış işlem ikinci kez başarılı işaretlenemez', () => {
      const sale = PosTransaction.create(base);
      sale.markSuccess('HOSTREF-1');

      expect(() => sale.markSuccess('HOSTREF-1')).toThrow(
        PosTransactionAlreadySettledException
      );
    });

    it('başarısız işlem sonradan başarılıya çevrilemez', () => {
      const sale = PosTransaction.create(base);
      sale.markFailed();

      expect(() => sale.markSuccess('HOSTREF-1')).toThrow(
        PosTransactionAlreadySettledException
      );
    });

    it('zaman aşımına düşen işlem tekrar zaman aşımı olamaz', () => {
      const sale = PosTransaction.create(base);
      sale.markTimeout();

      expect(() => sale.markTimeout()).toThrow(
        PosTransactionAlreadySettledException
      );
    });

    it('PENDING işlem normal şekilde sonuçlanır', () => {
      const sale = PosTransaction.create(base);

      expect(() => sale.markSuccess('HOSTREF-1')).not.toThrow();
      expect(sale.status).toBe('SUCCESS');
    });
  });

});
