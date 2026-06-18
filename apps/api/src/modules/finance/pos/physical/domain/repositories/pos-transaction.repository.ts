import { CreatePosTransactionData } from '@modules/finance/pos/physical/domain/types/create-pos-transaction.data';
import { PendingTransactionForReconcile } from '@modules/finance/pos/physical/domain/types/pending-transaction-for-reconcile.type';
import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';

export const POS_TRANSACTION_COMMAND_REPOSITORY = Symbol(
  'IPosTransactionCommandRepository'
);
export const POS_TRANSACTION_QUERY_REPOSITORY = Symbol(
  'IPosTransactionQueryRepository'
);

export interface IPosTransactionCommandRepository {
  /** İlk kayıt — Json/ilişki alanlarının kurulumu için ayrı tutulur. */
  create(data: CreatePosTransactionData): Promise<PosTransaction>;
  /** Durum geçişleri entity üzerinden yapılır; save tüm mutable alanları yazar. */
  save(entity: PosTransaction): Promise<PosTransaction>;
}

export interface IPosTransactionQueryRepository {
  findById(id: string): Promise<PosTransaction | null>;
  findByExternalRef(externalRef: string): Promise<PosTransaction | null>;
  findByClinicId(clinicId: string): Promise<PosTransaction[]>;
  /** Grace period dışında kalan PENDING işlemleri cihaz bilgisiyle döner. */
  findPendingForReconcile(
    gracePeriodMs: number
  ): Promise<PendingTransactionForReconcile[]>;
}
