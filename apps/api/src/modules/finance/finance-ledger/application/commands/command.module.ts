import { CreateLedgerEntyHandler } from './create-ledger-enty/create-ledger-enty.handler';
import { Module } from '@nestjs/common';
import { RefundLedgerEntriesHandler } from './refund-ledger-entries/refund-ledger-entries.handler';
import { FinanceLedgerRepositoriesModule } from '@modules/finance/finance-ledger/infrastructure/persistence/prisma/repositories/repositories.module';

const CommandHandlers = [CreateLedgerEntyHandler, RefundLedgerEntriesHandler];

@Module({
  imports: [FinanceLedgerRepositoriesModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class FinanceLedgerCommandModule {}
