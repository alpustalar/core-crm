import { CreateLedgerEntyHandler } from './create-ledger-enty/create-ledger-enty.handler';
import { Module } from '@nestjs/common';
import { RefundLedgerEntriesHandler } from './refund-ledger-entries/refund-ledger-entries.handler';
import { FinanceLedgerRepositoryModule } from '@modules/finance/finance-ledger/infrastructure/persistence/prisma/repositories/finance-ledger/finance-ledger.repository.module';

const CommandHandlers = [CreateLedgerEntyHandler, RefundLedgerEntriesHandler];

@Module({
  imports: [FinanceLedgerRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class FinanceLedgerCommandModule {}
