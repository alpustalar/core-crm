import { FinanceLedgerEntity } from '@modules/finance/finance-ledger/domain/entities/finance-ledger.entity';
import { LedgerStatus } from '@prisma/client';

export const FINANCE_LEDGER_COMMAND_REPOSITORY = Symbol(
  'IFinanceLedgerCommandRepository'
);

export interface IFinanceLedgerCommandRepository {
  create(entry: FinanceLedgerEntity): Promise<FinanceLedgerEntity>;
  updateMany(entries: FinanceLedgerEntity[]): Promise<void>;
  updateStatus(id: string, status: LedgerStatus): Promise<void>;
  updateManyStatusByPaymentId(
    paymentId: string,
    status: LedgerStatus
  ): Promise<void>;
}
