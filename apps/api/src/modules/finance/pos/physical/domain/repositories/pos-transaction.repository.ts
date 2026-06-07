import { PosTransaction, PosTransactionStatus } from '@prisma/client';
import { CreatePosTransactionProps } from '@modules/finance/pos/physical/domain/types/create-pos-transaction.props';
import { PendingTransactionForReconcile } from '@modules/finance/pos/physical/domain/types/pending-transaction-for-reconcile.type';

export const POS_TRANSACTION_COMMAND_REPOSITORY = Symbol(
  'IPosTransactionCommandRepository'
);
export const POS_TRANSACTION_QUERY_REPOSITORY = Symbol(
  'IPosTransactionQueryRepository'
);

export interface IPosTransactionCommandRepository {
  create(props: CreatePosTransactionProps): Promise<PosTransaction>;
  updateStatus(props: {
    id: string;
    status: PosTransactionStatus;
    externalRef?: string;
    rawResponse?: unknown;
    completedAt?: Date;
  }): Promise<PosTransaction>;
  setExternalRef(props: {
    id: string;
    externalRef: string;
    rawRequest?: unknown;
  }): Promise<PosTransaction>;
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
