import { Module } from '@nestjs/common';
import { FinanceLedgerCommandRepository } from './finance-ledger.command.repository';
import { FinanceLedgerQueryRepository } from './finance-ledger.query.repository';
import { FINANCE_LEDGER_COMMAND_REPOSITORY } from '@modules/finance/finance-ledger/domain/repositories/finance-ledger/finance-ledger.command.repository';
import { FINANCE_LEDGER_QUERY_REPOSITORY } from '@modules/finance/finance-ledger/domain/repositories/finance-ledger/finance-ledger.query.repository';

@Module({
  providers: [
    {
      provide: FINANCE_LEDGER_COMMAND_REPOSITORY,
      useClass: FinanceLedgerCommandRepository,
    },
    {
      provide: FINANCE_LEDGER_QUERY_REPOSITORY,
      useClass: FinanceLedgerQueryRepository,
    },
  ],
  exports: [FINANCE_LEDGER_COMMAND_REPOSITORY, FINANCE_LEDGER_QUERY_REPOSITORY],
})
export class FinanceLedgerRepositoryModule {}
