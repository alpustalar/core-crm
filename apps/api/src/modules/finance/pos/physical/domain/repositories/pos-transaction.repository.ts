import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';
import { PendingTransactionForReconcile } from '@modules/finance/pos/physical/domain/pos-physical.contracts';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const POS_TRANSACTION_COMMAND_REPOSITORY = Symbol(
  'IPosTransactionCommandRepository'
);
export const POS_TRANSACTION_QUERY_REPOSITORY = Symbol(
  'IPosTransactionQueryRepository'
);

export type IPosTransactionCommandRepository =
  IBaseCommandRepository<PosTransaction>;

export interface IPosTransactionQueryRepository {
  findById(id: string): Promise<PosTransaction | null>;
  findByExternalRef(externalRef: string): Promise<PosTransaction | null>;
  findByClinicId(clinicId: string): Promise<PosTransaction[]>;
  /** Grace period dışında kalan PENDING işlemleri cihaz bilgisiyle döner. */
  findPendingForReconcile(
    gracePeriodMs: number
  ): Promise<PendingTransactionForReconcile[]>;
}
