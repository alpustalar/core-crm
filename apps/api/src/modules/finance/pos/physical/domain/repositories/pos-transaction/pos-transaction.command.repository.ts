import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';
import {
  PendingTransactionForReconcile,
  PosTransactionReversalSummary,
} from '@modules/finance/pos/physical/domain/contracts/pos-physical.contracts';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const POS_TRANSACTION_COMMAND_REPOSITORY = Symbol(
  'IPosTransactionCommandRepository'
);

/**
 * NOT: Bu aggregate'in Query repository'si YOK — bilinçli. POS işlem kaydı yalnız
 * ödeme akışının (callback, void, mutabakat) içinden okunur; hepsi Command Context'tir
 * ve okunan durum doğrudan bir para hareketine karar verir.
 */
export interface IPosTransactionCommandRepository extends IBaseCommandRepository<PosTransaction> {
  /** İşlemi `FOR UPDATE` kilitleyerek yükler — yalnız aktif transaction içinde. */
  findByIdForUpdate(id: string): Promise<PosTransaction | null>;
  /**
   * Sağlayıcı referansıyla kilitleyerek yükler — yalnız transaction içinde.
   * Callback'ler tekrar gönderilebildiği için durum geçişini besleyen okuma kilitli olmalı.
   */
  findByExternalRefForUpdate(
    externalRef: string
  ): Promise<PosTransaction | null>;
  /**
   * Bir satışın CANLI (PENDING/SUCCESS) ters kayıtlarının özetini döner — iptal/iade
   * kararını besler, bu yüzden orijinal satır `FOR UPDATE` kilitliyken çağrılır.
   * Entity değil özet döner: karar tek bir satıra değil, satır kümesinin toplamına bağlı.
   */
  findLiveReversalSummary(
    originalPosTransactionId: string
  ): Promise<PosTransactionReversalSummary>;
  /** Grace period dışında kalan PENDING işlemleri cihaz bilgisiyle döner (mutabakat taraması). */
  findPendingForReconcile(
    gracePeriodMs: number
  ): Promise<PendingTransactionForReconcile[]>;
}
