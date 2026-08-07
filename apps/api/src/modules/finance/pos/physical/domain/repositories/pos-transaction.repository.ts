import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';
import { PendingTransactionForReconcile } from '@modules/finance/pos/physical/domain/pos-physical.contracts';
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
  /** Grace period dışında kalan PENDING işlemleri cihaz bilgisiyle döner (mutabakat taraması). */
  findPendingForReconcile(
    gracePeriodMs: number
  ): Promise<PendingTransactionForReconcile[]>;
}
