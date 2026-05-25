import { CreateLedgerEntyHandler } from './create-ledger-enty/create-ledger-enty.handler';
import { Module } from '@nestjs/common';
import { RefundLedgerEntriesHandler } from './refund-ledger-entries/refund-ledger-entries.handler';
import { FINANCE_LEDGER_REPOSITORY } from '@modules/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { FinanceLedgerRepository } from '@modules/finance-ledger/infrastructure/persistence/prisma/repositories/finance-ledger.repository';

const CommandHandlers = [CreateLedgerEntyHandler, RefundLedgerEntriesHandler];

@Module({
  providers: [
    ...CommandHandlers,
    { provide: FINANCE_LEDGER_REPOSITORY, useClass: FinanceLedgerRepository },
  ],
  exports: [...CommandHandlers],
})
export class FinanceLedgerCommandModule {}
