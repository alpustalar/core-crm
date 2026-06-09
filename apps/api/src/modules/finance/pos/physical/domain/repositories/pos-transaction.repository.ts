import { CreatePosTransactionProps } from '@modules/finance/pos/physical/domain/types/create-pos-transaction.props';
import { PendingTransactionForReconcile } from '@modules/finance/pos/physical/domain/types/pending-transaction-for-reconcile.type';
import { PosTransactionEntity } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';

export const POS_TRANSACTION_COMMAND_REPOSITORY = Symbol(
  'IPosTransactionCommandRepository'
);
export const POS_TRANSACTION_QUERY_REPOSITORY = Symbol(
  'IPosTransactionQueryRepository'
);

export interface IPosTransactionCommandRepository {
  /** İlk kayıt — Json/ilişki alanlarının kurulumu için ayrı tutulur. */
  create(props: CreatePosTransactionProps): Promise<PosTransactionEntity>;
  /** Durum geçişleri entity üzerinden yapılır; save tüm mutable alanları yazar. */
  save(entity: PosTransactionEntity): Promise<PosTransactionEntity>;
}

export interface IPosTransactionQueryRepository {
  findById(id: string): Promise<PosTransactionEntity | null>;
  findByExternalRef(externalRef: string): Promise<PosTransactionEntity | null>;
  findByClinicId(clinicId: string): Promise<PosTransactionEntity[]>;
  /** Grace period dışında kalan PENDING işlemleri cihaz bilgisiyle döner. */
  findPendingForReconcile(
    gracePeriodMs: number
  ): Promise<PendingTransactionForReconcile[]>;
}
